<script setup lang="ts">
import '~/assets/css/fonts/nunito.css'
import '~/assets/css/fonts/open-sans.css'

/* ------------------------------------------------------------------ *
 * Шаг 2 воронки l1 — оплата.
 *
 * Сюда приходят двумя путями:
 *   • с `/auth` сразу после входа — тогда создаётся инвойс и браузер
 *     автоматически уходит на шлюз Multicard;
 *   • обратно со шлюза — по кнопке «назад» (адрес `/payment`) или по
 *     возврату после платежа (`/payment?success=true|false`).
 *
 * Автопереход на шлюз делается один раз на инвойс: метка о том, что человека
 * уже уводили, лежит в хранилище (см. useL1Payment.ts). Без неё возврат
 * «назад» тут же выкидывал бы обратно на оплату — то есть кнопка «назад»
 * переставала бы работать.
 *
 * Проверка статуса вызывается на любом возврате, включая `success=false`:
 * именно этот запрос закрывает покупку на стороне биллинга и запускает
 * письмо пользователю.
 * ------------------------------------------------------------------ */

useSeoMeta({
  title: 'To‘lov — Amaya Kids',
  robots: 'noindex, nofollow'
})

type Screen
  = | 'loading' // готовим инвойс, экран ещё не решён
    | 'ready' // «To‘lov kutilmoqda» — ссылка на шлюз
    | 'checking' // ждём подтверждения биллинга
    | 'error' // оплата не прошла или инвойс не создался
    | 'unavailable' // статус временно не проверить

const screen = ref<Screen>('loading')
const processing = ref(false)

const ajwt = ref('')
const invoiceId = ref('')
const checkoutUrl = ref('')

/** Ошибка оплаты и возврат средств делят один экран, но не текст. */
const errorKind = ref<'failed' | 'refunded'>('failed')

/** `canRetry` из ответа биллинга: когда повтор запрещён, кнопку не рисуем. */
const canRetry = ref(true)

const route = useRoute()

/* ---------------------------- тексты ---------------------------- */

const meta = computed(() => {
  switch (screen.value) {
    case 'ready':
      return {
        title: 'To‘lov kutilmoqda',
        text: 'Siz to‘lov sahifasiga yo‘naltirilasiz. Agar sahifa avtomatik ravishda ochilmasa, tugmani bosing:'
      }
    case 'checking':
      return {
        title: 'To‘lov tekshirilmoqda',
        text: 'Bu bir necha soniya davom etishi mumkin. Iltimos, sahifani yopmang.'
      }
    case 'error':
      return errorKind.value === 'refunded'
        ? {
            title: 'To‘lov qaytarildi',
            text: 'To‘lov mablag‘i qaytarib berildi, shuning uchun ilovaga to‘liq kirish huquqi faol emas.'
          }
        : {
            title: 'To‘lovda xatolik',
            text: 'To‘lov amalga oshmadi. Mumkin bo‘lgan sabablar: kartada mablag‘ yetarli emasligi, to‘lov vaqti tugagani yoki bankingiz tomonidan cheklovlar o‘rnatilganligi. Kartadan pul yechilmadi.'
          }
    case 'unavailable':
      return {
        title: 'To‘lovni tekshirib bo‘lmadi',
        text: 'To‘lov holatini hozircha aniqlay olmadik. Bu to‘lov o‘tmagan degani emas — biroz kutib, qayta tekshiring.'
      }
    default:
      return { title: '', text: '' }
  }
})

/* --------------------------- аналитика --------------------------- */

const { track, adoptIdentity } = useL1Mixpanel()
const { trackStandard, trackPageView } = useL1MetaPixel()

onMounted(() => trackPageView())

watch(screen, (current) => {
  if (current === 'ready') track('landing_payment_screen')
})

/**
 * `landing_billing_purchase` в Mixpanel теперь шлёт бэкенд напрямую, не
 * фронт: у него есть `Payment_count` и `Sandbox`, которых фронт не знает, и
 * он же видит продления подписки, до которых человек на лендинге вообще не
 * доходит. Код ниже оставлен закомментированным, а не удалён — если решение
 * поменяют, включить обратно — это снять комментарий с вызова `track(...)`
 * здесь и с одной строки в белом списке server/api/l2/mixpanel/track.post.ts.
 *
 * Meta-событие `Purchase` эта договорённость не касается: канал отдельный,
 * фронт продолжает слать его сам (см. `trackStandard('Purchase', …)` ниже).
 */
function trackPurchase(status: L1StatusResponse) {
  // Дедупликация переживает перезагрузку: вернуться сюда по той же ссылке —
  // обычное дело, а статус при этом снова ответит `purchased`. Событие
  // `Purchase` должно уйти один раз на инвойс, а не на просмотр страницы.
  if (!claimL1PurchaseTracking(invoiceId.value)) return

  const price = status.price ?? L1_PRICE
  const currency = status.currency ?? L1_CURRENCY

  // track('landing_billing_purchase', {
  //   Price: price,
  //   Currency: currency,
  //   Subscription_type: status.subscriptionType ?? L1_SUBSCRIPTION_TYPE,
  //   Trial: status.trial ?? false,
  //   ...(typeof status.sandbox === 'boolean' ? { Sandbox: status.sandbox } : {}),
  //   ...(typeof status.paymentCount === 'number' ? { Payment_count: status.paymentCount } : {})
  // })

  // Стандартное событие Meta с суммой — под него кампания оптимизируется на
  // выручку. Дублируется в Conversions API тем же composable.
  trackStandard('Purchase', { value: price, currency })
}

/* ------------------------------ поток ------------------------------ */

/** Токен больше не годится — убираем его и начинаем воронку заново. */
async function restartFunnel() {
  saveL1Ajwt('')
  saveL1InvoiceId('')
  clearL1Checkout()
  await navigateTo('/auth', { replace: true })
}

/** Инвойс создаётся один за раз: два почти одновременных вызова завели бы
 *  на бэкенде два платежа подряд. */
let invoiceInFlight = false

/**
 * Создаёт инвойс — или переиспользует незакрытый прежний. `openGateway`
 * включён только на первом заходе: возврат «назад» должен показать экран, а
 * не увести обратно на шлюз.
 */
async function prepareInvoice({ openGateway = false } = {}) {
  if (invoiceInFlight) return

  invoiceInFlight = true
  processing.value = true

  try {
    const invoice = await createL1Invoice(ajwt.value)

    if (isL1AuthFailure(invoice.status)) {
      await restartFunnel()
      return
    }

    if (invoice.status === 'already_purchased') {
      if (invoice.invoiceId) {
        invoiceId.value = invoice.invoiceId
        saveL1InvoiceId(invoice.invoiceId)
      }
      await navigateTo('/congratulations', { replace: true })
      return
    }

    // `invoice_created` (новый) и `payment_pending` (незакрытый прежний)
    // обрабатываются одинаково: и там, и там есть ссылка на оплату.
    if (invoice.ok && invoice.checkoutUrl && invoice.invoiceId) {
      invoiceId.value = invoice.invoiceId
      checkoutUrl.value = invoice.checkoutUrl
      saveL1InvoiceId(invoice.invoiceId)
      saveL1CheckoutUrl(invoice.checkoutUrl)
      screen.value = 'ready'

      if (openGateway && !wasL1CheckoutOpened(invoice.invoiceId)) {
        markL1CheckoutOpened(invoice.invoiceId)
        window.location.assign(invoice.checkoutUrl)
      }
      return
    }

    // `bad_request`, `forbidden`, `invoice_failed` и всё неизвестное.
    errorKind.value = 'failed'
    canRetry.value = true
    screen.value = 'error'
  } finally {
    invoiceInFlight = false
    processing.value = false
  }
}

/** Сколько раз подряд спрашиваем статус, прежде чем предложить проверить
 *  вручную. Multicard подтверждает платёж не мгновенно, но и держать
 *  человека в бесконечном ожидании нельзя. */
const MAX_STATUS_ATTEMPTS = 12
const STATUS_RETRY_DELAY_MS = 2500

let statusTimer: ReturnType<typeof setTimeout> | undefined

function stopStatusPolling() {
  if (statusTimer) {
    clearTimeout(statusTimer)
    statusTimer = undefined
  }
}

onBeforeUnmount(stopStatusPolling)

/**
 * Реальный статус оплаты. То, что шлюз написал в адресе, — только подсказка:
 * человек мог вернуться по старой ссылке или подставить параметр руками.
 *
 * `gatewayFailed` нужен для одной ветки: если биллинг не отвечает, а шлюз
 * сказал «не оплачено», врать про «сейчас проверим» не стоит — показываем
 * ошибку, другого сигнала у нас нет.
 */
async function pollStatus(attempt = 1, gatewayFailed = false) {
  stopStatusPolling()

  const status = await checkL1PaymentStatus(ajwt.value, invoiceId.value)

  if (isL1AuthFailure(status.status)) {
    await restartFunnel()
    return
  }

  switch (status.status) {
    case 'purchased':
      trackPurchase(status)
      await navigateTo('/congratulations', { replace: true })
      return

    case 'failed':
    case 'expired':
      errorKind.value = 'failed'
      canRetry.value = status.canRetry !== false
      screen.value = 'error'
      return

    case 'refunded':
      errorKind.value = 'refunded'
      canRetry.value = status.canRetry !== false
      screen.value = 'error'
      return

    case 'pending':
      if (attempt >= MAX_STATUS_ATTEMPTS) {
        screen.value = 'unavailable'
        return
      }

      screen.value = 'checking'
      statusTimer = setTimeout(() => void pollStatus(attempt + 1, gatewayFailed), STATUS_RETRY_DELAY_MS)
      return

    default:
      // `status_failed`, `bad_request`, `forbidden` и всё неизвестное —
      // это «не смогли проверить», а не «не оплачено».
      if (gatewayFailed) {
        errorKind.value = 'failed'
        canRetry.value = true
        screen.value = 'error'
        return
      }

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
  clearL1Checkout()
  screen.value = 'loading'
  await prepareInvoice({ openGateway: true })
}

/** Ручной уход на шлюз, когда автоматический переход не сработал. */
function goToCheckout() {
  if (!checkoutUrl.value) return

  markL1CheckoutOpened(invoiceId.value)
  window.location.assign(checkoutUrl.value)
}

/* ----------------------------- старт ----------------------------- */

onMounted(async () => {
  ajwt.value = readL1Ajwt()

  // Вход был на прошлой загрузке страницы, поэтому личность аккаунта для
  // аналитики восстанавливаем из хранилища — иначе покупка ушла бы от анонима.
  const accountId = readL1AccountId()
  if (accountId) adoptIdentity(accountId)

  if (!ajwt.value) {
    await navigateTo('/auth', { replace: true })
    return
  }

  invoiceId.value = String(route.query.invoiceId ?? '') || readL1InvoiceId()
  checkoutUrl.value = readL1CheckoutUrl()

  const success = route.query.success

  // Возврат со шлюза: статус спрашиваем в любом случае.
  if (success !== undefined && invoiceId.value) {
    screen.value = 'checking'
    await pollStatus(1, String(success) === 'false')
    return
  }

  // Шлюз сказал «отказ», а проверять нечего — показываем ошибку как есть.
  if (String(success) === 'false') {
    errorKind.value = 'failed'
    screen.value = 'error'
    return
  }

  // Возврат «назад» со шлюза: ссылка на оплату уже есть и инвойс тот же,
  // поэтому экран показываем сразу, без ещё одного запроса к биллингу.
  if (checkoutUrl.value && wasL1CheckoutOpened(invoiceId.value)) {
    screen.value = 'ready'
    return
  }

  // Первый заход: создаём инвойс и уводим на шлюз.
  await prepareInvoice({ openGateway: true })
})

/** Ссылка поддержки с экрана ошибки оплаты. Адрес — заглушка до тех пор,
 *  пока не назван реальный канал поддержки лендинга. */
const SUPPORT_URL = 'mailto:support@amayasoft.uz'
</script>

<template>
  <L1Shell>
    <div class="payment">
      <L1Card>
        <L1Steps :active="2" />

        <h1
          v-if="meta.title"
          class="title"
        >
          {{ meta.title }}
        </h1>

        <p
          v-if="meta.text"
          class="text"
        >
          {{ meta.text }}
        </p>

        <span
          v-if="screen === 'loading' || screen === 'checking'"
          class="spinner"
          aria-hidden="true"
        />

        <L1Button
          v-else-if="screen === 'ready'"
          label="To‘lovga o‘tish"
          size="lg"
          @click="goToCheckout"
        />

        <L1Button
          v-else-if="screen === 'unavailable'"
          label="Qayta tekshirish"
          size="lg"
          :pending="processing"
          @click="recheck"
        />

        <L1Button
          v-else-if="screen === 'error' && canRetry"
          label="Qayta urunib ko‘ring"
          size="lg"
          :pending="processing"
          @click="retryPayment"
        />

        <button
          v-if="screen === 'ready' || screen === 'unavailable'"
          class="secondary"
          type="button"
          @click="navigateTo('/auth')"
        >
          Orqaga
        </button>

        <p
          v-else-if="screen === 'error'"
          class="support"
        >
          <span>Yordam kerakmi?</span>
          <a :href="SUPPORT_URL">Bizga yozing</a>
        </p>
      </L1Card>
    </div>
  </L1Shell>
</template>

<style scoped lang="scss">
/* Величины — из макета Figma «Cars 1 / PW_locals_Cars1_UZ-3», фреймы
   Payment и Payment Error. */

.payment {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

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
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.secondary {
  padding: 0;
  appearance: none;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  font-size: 18px;
  line-height: 24px;
  color: #0089b9;
  text-decoration: underline;
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
