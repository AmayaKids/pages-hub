<script setup lang="ts">
import '~/assets/css/fonts/nunito.css'
import '~/assets/css/fonts/open-sans.css'

/* ------------------------------------------------------------------ *
 * Возврат с Multicard.
 *
 * Шлюз приводит сюда по адресам, которые ему отдал бэкенд:
 *   /payment-result?success=true|false&invoiceId=<id>
 *
 * `success` из адреса — только подсказка шлюза, а не источник правды:
 * человек мог закрыть вкладку раньше, вернуться по старой ссылке или
 * подставить параметр руками. Настоящий статус спрашиваем у биллинга
 * (`/api/payment/multicard/status`) и показываем экран уже по нему.
 * ------------------------------------------------------------------ */

useSeoMeta({
  title: 'To‘lov — Amaya Kids',
  robots: 'noindex, nofollow'
})

type Screen
  = | 'checking' // ждём подтверждения оплаты
    | 'congrats' // оплата подтверждена
    | 'failed' // оплата не прошла / инвойс истёк
    | 'refunded' // деньги вернули — поздравлять не с чем
    | 'unavailable' // статус временно не проверить (503)
    | 'no-session' // нечего проверять: нет AJWT или id инвойса

const screen = ref<Screen>('checking')
const processing = ref(false)
const receiptUrl = ref<string | null>(null)

const ajwt = ref('')
const invoiceId = ref('')

/** Сколько раз подряд спрашиваем статус, прежде чем предложить проверить
 *  вручную. Multicard подтверждает платёж не мгновенно, но и держать
 *  человека в бесконечном ожидании нельзя. */
const MAX_ATTEMPTS = 12
const RETRY_DELAY_MS = 2500

let pollTimer: ReturnType<typeof setTimeout> | undefined

const meta = computed(() => {
  switch (screen.value) {
    case 'checking':
      return {
        title: 'To‘lov tekshirilmoqda',
        text: 'Bu bir necha soniya davom etishi mumkin. Iltimos, sahifani yopmang.'
      }
    case 'failed':
      return {
        title: 'To‘lovda xatolik',
        text: 'To‘lov amalga oshmadi. Mumkin bo‘lgan sabablar: kartada mablag‘ yetarli emasligi, to‘lov vaqti tugagani yoki bankingiz tomonidan cheklovlar o‘rnatilganligi. Kartadan pul yechilmadi.'
      }
    case 'refunded':
      return {
        title: 'To‘lov qaytarildi',
        text: 'To‘lov mablag‘i qaytarib berildi, shuning uchun ilovaga to‘liq kirish huquqi faol emas.'
      }
    case 'unavailable':
      return {
        title: 'To‘lovni tekshirib bo‘lmadi',
        text: 'To‘lov holatini hozircha aniqlay olmadik. Bu to‘lov o‘tmagan degani emas — biroz kutib, qayta tekshiring.'
      }
    case 'no-session':
      return {
        title: 'Qaytadan kiring',
        text: 'To‘lov holatini tekshirish uchun akkauntingizga qayta kiring.'
      }
    default:
      return { title: '', text: '' }
  }
})

/* --------------------------- аналитика --------------------------- */

const { track, adoptIdentity } = useL2Mixpanel()
const { trackStandard, trackCustom, trackPageView } = useMetaPixel()

onMounted(() => trackPageView())

/**
 * Данные покупки для `landing_billing_purchase`. `Payment_count` и `Sandbox`
 * знает только биллинг, поэтому берём их из ответа `/status`, когда он их
 * отдаёт; пока не отдаёт — эти два поля просто не уходят, а не заполняются
 * выдуманным значением (см. server/api/l2/mixpanel/track.post.ts).
 */
function trackPurchase(status: L1StatusResponse) {
  // Дедупликация переживает перезагрузку: вернуться сюда по той же ссылке
  // (кнопка «назад», обновление страницы) — обычное дело, а статус при этом
  // снова ответит `purchased`. Событие выручки должно уйти один раз на
  // инвойс, а не один раз на просмотр страницы.
  if (!claimL1PurchaseTracking(invoiceId.value)) return

  const price = status.price ?? L1_PRICE
  const currency = status.currency ?? L1_CURRENCY

  track('landing_billing_purchase', {
    Price: price,
    Currency: currency,
    Subscription_type: status.subscriptionType ?? L1_SUBSCRIPTION_TYPE,
    Trial: status.trial ?? false,
    ...(typeof status.sandbox === 'boolean' ? { Sandbox: status.sandbox } : {}),
    ...(typeof status.paymentCount === 'number' ? { Payment_count: status.paymentCount } : {})
  })

  // Стандартное событие Meta с суммой — под него кампания оптимизируется на
  // выручку. Дублируется в Conversions API тем же composable.
  trackStandard('Purchase', { value: price, currency })
}

/* ------------------------- проверка статуса ------------------------- */

function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = undefined
  }
}

/**
 * Один запрос статуса. `attempt` считает только автоматические повторы:
 * ручное «Qayta tekshirish» начинает счёт заново.
 */
async function pollStatus(attempt = 1) {
  stopPolling()

  const status = await checkL1PaymentStatus(ajwt.value, invoiceId.value)

  switch (status.status) {
    case 'purchased':
      receiptUrl.value = status.receiptUrl ?? null
      clearL1InvoiceId()
      screen.value = 'congrats'
      track('landing_congratulation_screen')
      trackPurchase(status)
      return

    case 'failed':
    case 'expired':
      clearL1InvoiceId()
      screen.value = 'failed'
      return

    case 'refunded':
      clearL1InvoiceId()
      screen.value = 'refunded'
      return

    case 'pending':
      if (attempt >= MAX_ATTEMPTS) {
        // Инвойс не закрываем: оплата всё ещё может подтвердиться, и
        // «Qayta tekshirish» должен спрашивать про тот же самый платёж.
        screen.value = 'unavailable'
        return
      }

      screen.value = 'checking'
      pollTimer = setTimeout(() => void pollStatus(attempt + 1), RETRY_DELAY_MS)
      return

    default:
      // `verification_unavailable` и всё неизвестное. Это не «не оплачено»,
      // поэтому предлагаем повторить именно проверку, а не платёж.
      screen.value = 'unavailable'
  }
}

/** Кнопка «Qayta tekshirish» — новый цикл автоматических попыток. */
async function recheck() {
  if (processing.value) return

  processing.value = true
  screen.value = 'checking'

  try {
    await pollStatus()
  } finally {
    processing.value = false
  }
}

/** Кнопка «Qayta urunib ko‘ring» — новый инвойс и снова на шлюз. */
async function retryPayment() {
  if (processing.value) return

  processing.value = true

  try {
    const invoice = await createL1Invoice(ajwt.value)

    if (invoice.status === 'already_purchased') {
      receiptUrl.value = invoice.receiptUrl ?? null
      clearL1InvoiceId()
      screen.value = 'congrats'
      track('landing_congratulation_screen')
      return
    }

    if (invoice.checkoutUrl && invoice.invoiceId) {
      saveL1InvoiceId(invoice.invoiceId)
      invoiceId.value = invoice.invoiceId
      track('landing_payment_screen')
      window.location.assign(invoice.checkoutUrl)
      return
    }

    screen.value = 'failed'
  } finally {
    processing.value = false
  }
}

/* ----------------------------- старт ----------------------------- */

onMounted(() => {
  // Читаем только на клиенте: и localStorage, и адрес возврата существуют
  // лишь в браузере.
  const route = useRoute()

  ajwt.value = readL1Ajwt()
  invoiceId.value = String(route.query.invoiceId ?? '') || readL1InvoiceId()

  // Вход был на прошлой загрузке страницы, поэтому личность аккаунта
  // восстанавливаем из хранилища — иначе покупка ушла бы от анонима.
  const accountId = readL1AccountId()
  if (accountId) adoptIdentity(accountId)

  if (!ajwt.value || !invoiceId.value) {
    screen.value = 'no-session'
    return
  }

  void pollStatus()
})

onBeforeUnmount(stopPolling)

/** Ссылка поддержки. Адрес — заглушка до тех пор, пока не назван реальный
 *  канал поддержки лендинга. */
const SUPPORT_URL = 'mailto:support@amayasoft.uz'
</script>

<template>
  <L1Shell :variant="screen === 'congrats' ? 'congrats' : 'default'">
    <L1Congrats
      v-if="screen === 'congrats'"
      :receipt-url="receiptUrl"
      @appstore="track('landing_appstore_button_tap'); trackCustom('LandingAppstoreButtonTap')"
    />

    <L1Card v-else>
      <L1Steps :active="2" />

      <h1 class="title">
        {{ meta.title }}
      </h1>

      <p class="text">
        {{ meta.text }}
      </p>

      <span
        v-if="screen === 'checking'"
        class="spinner"
        aria-hidden="true"
      />

      <L1Button
        v-else-if="screen === 'unavailable'"
        label="Qayta tekshirish"
        size="lg"
        :pending="processing"
        @click="recheck"
      />

      <L1Button
        v-else-if="screen === 'no-session'"
        label="Kirish"
        size="lg"
        @click="navigateTo('/auth')"
      />

      <L1Button
        v-else
        label="Qayta urunib ko‘ring"
        size="lg"
        :pending="processing"
        @click="retryPayment"
      />

      <p
        v-if="screen === 'failed' || screen === 'refunded'"
        class="support"
      >
        <span>Yordam kerakmi?</span>
        <a :href="SUPPORT_URL">Bizga yozing</a>
      </p>
    </L1Card>
  </L1Shell>
</template>

<style scoped lang="scss">
/* Те же величины, что и на /auth — см. l1/auth/index.vue. */

.title {
  width: 100%;
  font-weight: 900;
  font-size: 32px;
  line-height: 32px;
  text-align: center;
  color: #00bf73;
}

.text {
  width: 100%;
  font-weight: 600;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  color: #595959;
}

.spinner {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: 4px solid #05b8f6;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: card-spin 1s linear infinite;
}

@keyframes card-spin {
  to {
    transform: rotate(360deg);
  }
}

.support {
  width: 100%;
  font-weight: 600;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  color: #595959;

  span {
    display: block;
  }

  a {
    color: #0089b9;
    text-decoration: underline;
  }
}
</style>
