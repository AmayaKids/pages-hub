<script setup lang="ts">
import '~/assets/css/fonts/nunito.css'
import '~/assets/css/fonts/open-sans.css'

import checkboxSvg from '~/assets/images/l1/svg/checkbox.svg'
import eyeSvg from '~/assets/images/l1/svg/eye.svg'
import eyeOffSvg from '~/assets/images/l1/svg/eye-off.svg'

useSeoMeta({
  title: 'Ro‘yxatdan o‘tish — Amaya Kids'
})

/* ------------------------------------------------------------------ *
 * Шаги 1 и 2 воронки l1: аккаунт и оплата.
 *
 * Логика аккаунта — порт l2/auth/index.vue без изменений: те же три
 * сценария (нового аккаунта нет → пароль приходит письмом; аккаунт есть →
 * свой пароль; забыл → восстановление), те же регулярки, та же обработка
 * ошибок. Отличий два:
 *   • шаг после входа — не выдача бесплатного доступа, а создание боевого
 *     инвойса и уход на Multicard (см. useL1Payment.ts);
 *   • тексты и разметка — по макету l1 (три шага вместо двух).
 *
 * Шаг 3 (поздравление) живёт на /payment-result: туда возвращает Multicard.
 * Здесь он показывается только в одном случае — когда бэкенд ответил
 * `already_purchased`, то есть платить уже не за что.
 * ------------------------------------------------------------------ */

type Step
  = | 'auth' // ввод email
    | 'clean-signin' // аккаунт уже есть — ввести свой пароль
    | 'signup' // аккаунта не было — ввести пароль из письма
    | 'reset' // забыл пароль — ввести email
    | 'check-email' // «пароль отправлен на почту»
    | 'reset-signin' // ввести новый пароль из письма
    | 'payment' // инвойс создан, уходим на шлюз
    | 'payment-error' // инвойс создать не удалось
    | 'congrats' // товар уже куплен — платить не за что

const step = ref<Step>('auth')
const processing = ref(false)

/** AJWT из ответа `/login`. Дублируется в localStorage: он нужен ещё раз
 *  после возврата с Multicard, а это уже другая загрузка страницы. */
const ajwt = ref('')

/** Куда уходить по кнопке «To‘lovga o‘tish», если автоматический переход
 *  не сработал (блокировщик, медленный редирект). */
const checkoutUrl = ref('')

/** Заполняется только на ветке `already_purchased`. */
const receiptUrl = ref<string | null>(null)

/* ---------------------------- поля ---------------------------- */

const EMAIL_ERROR_TEXT = 'Noto‘g‘ri email'
const PASSWORD_ERROR_TEXT = 'Parol noto‘g‘ri'
const GENERIC_ERROR_TEXT = 'Nimadir xato ketdi. Iltimos, yana urinib ko‘ring.'

// Регулярки один в один из l2/auth (а туда — из sc-giftflow/v1 → `fields`).
const fields = reactive({
  email: {
    value: '',
    error: false,
    errorMessage: '',
    errorText: EMAIL_ERROR_TEXT,
    // eslint-disable-next-line no-control-regex
    regex: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
  },
  password: {
    value: '',
    error: false,
    errorMessage: '',
    errorText: PASSWORD_ERROR_TEXT,
    regex: /^[A-Za-z0-9_]{6,128}$/
  }
})

type FieldName = keyof typeof fields

const passwordHidden = ref(true)

/** Пока печатают — только снимаем ошибку, но не показываем новую. */
function onFieldInput(name: FieldName) {
  const field = fields[name]

  if (field.regex.test(field.value)) {
    field.error = false
    field.errorMessage = ''
  } else {
    field.error = true
  }
}

/** Значение зафиксировали — можно ругаться. */
function onFieldChange(name: FieldName) {
  const field = fields[name]

  if (field.regex.test(field.value)) {
    field.error = false
    field.errorMessage = ''
  } else {
    field.error = true
    field.errorMessage = field.errorText
  }
}

/** Текст ошибки виден только при непустом поле. */
function fieldHasError(name: FieldName) {
  return Boolean(fields[name].errorMessage && fields[name].value)
}

/** Серверную ошибку кнопка не блокирует — её можно «перещёлкнуть» повторной
 *  отправкой, блокирует только невалидный ввод. */
function fieldBlocksSubmit(name: FieldName) {
  const field = fields[name]
  return (field.error && field.errorMessage === field.errorText) || !field.value
}

function clearField(name: FieldName) {
  fields[name].value = ''
  fields[name].error = false
  fields[name].errorMessage = ''
}

/* --------------------------- согласие --------------------------- */

const legal = ref(false)
const legalError = ref(false)

const canSubmitEmail = computed(() => !fieldBlocksSubmit('email') && legal.value)
const canSubmitPassword = computed(() => !fieldBlocksSubmit('password'))

/* ---------------------------- тексты ---------------------------- */

/**
 * Заголовок — массив строк, а не одна строка с переносом: в макете это
 * отдельные текстовые узлы с шагом 4px между ними, тогда как перенос внутри
 * одного узла дал бы межстрочный интервал 28.
 */
const meta = computed<{ title: string[], subtitle: string }>(() => {
  switch (step.value) {
    case 'auth':
      return {
        title: ['Ro‘yxatdan o‘ting, yuklab oling va o‘ynang!'],
        subtitle: 'Emailni kiriting.'
      }
    case 'clean-signin':
      return {
        title: ['Qaytishingiz bilan!'],
        subtitle: 'Bu emailga allaqachon akkaunt yaratilgan. Kiring.'
      }
    case 'signup':
      return {
        title: ['Parolni kiriting,', 'Emailingizga yuborilgan'],
        subtitle: 'Agar parol olmagan bo‘lsangiz, «spam» papkasini tekshirib ko‘ring.'
      }
    case 'reset':
      return {
        title: ['Parolni tiklash'],
        subtitle: 'Emailingizni kiriting — biz unga yangi parol yuboramiz.'
      }
    case 'check-email':
      return {
        title: ['Yangi parol yuborildi'],
        subtitle: `Biz ${fields.email.value} manziliga yangi parol yubordik. Agar xat kelmagan bo‘lsa, «Spam» papkasini ham tekshiring.`
      }
    case 'reset-signin':
      return {
        title: ['Akkauntga kirish'],
        subtitle: 'Pochtangizga kelgan yangi parolni kiriting.'
      }
    case 'payment':
      return {
        title: ['To‘lov kutilmoqda'],
        subtitle: 'Siz to‘lov sahifasiga yo‘naltirilasiz. Agar sahifa avtomatik ravishda ochilmasa, tugmani bosing:'
      }
    case 'payment-error':
      return {
        title: ['To‘lovda xatolik'],
        subtitle: 'To‘lov amalga oshmadi. Mumkin bo‘lgan sabablar: kartada mablag‘ yetarli emasligi, to‘lov vaqti tugagani yoki bankingiz tomonidan cheklovlar o‘rnatilganligi. Kartadan pul yechilmadi.'
      }
    default:
      return { title: [], subtitle: '' }
  }
})

const isPasswordStep = computed(() => (
  ['clean-signin', 'signup', 'reset-signin'].includes(step.value)
))

const isEmailStep = computed(() => step.value === 'auth' || step.value === 'reset')

const isPaymentStep = computed(() => (
  step.value === 'payment' || step.value === 'payment-error'
))

/** Индикатор шагов: всё, что про аккаунт — шаг 1, платёжные экраны — шаг 2. */
const activeStep = computed<1 | 2 | 3>(() => (isPaymentStep.value ? 2 : 1))

const showBack = computed(() => (
  ['clean-signin', 'signup', 'reset', 'reset-signin'].includes(step.value)
))

/* --------------------------- навигация --------------------------- */

function handleBack() {
  switch (step.value) {
    case 'clean-signin':
    case 'signup':
    case 'reset-signin':
      step.value = 'auth'
      clearField('password')
      break
    case 'reset':
      step.value = 'clean-signin'
      break
    default:
      step.value = 'auth'
  }
}

async function handleNext(to?: 'reset') {
  if (processing.value) return

  switch (step.value) {
    case 'auth':
      if (!legal.value) {
        legalError.value = true
        return
      }
      await checkEmailExist()
      break

    case 'clean-signin':
      if (to === 'reset') {
        step.value = 'reset'
        return
      }
      await signIn()
      break

    case 'signup':
    case 'reset-signin':
      await signIn()
      break

    case 'reset':
      if (await resetPassword()) {
        step.value = 'check-email'
      }
      break

    case 'check-email':
      step.value = 'reset-signin'
      break
  }
}

/* --------------------------- аналитика --------------------------- */

const { track, identify } = useL2Mixpanel()
const { trackStandard, trackCustom, trackPageView } = useMetaPixel()

onMounted(() => trackPageView())

/**
 * Шаг флоу → событие показа экрана. Шаги без события (`reset`,
 * `check-email`, `payment-error`) в карту не входят и ничего не шлют.
 *
 * `landing_password_screen` висит на всех трёх экранах с паролем: и там, где
 * пароль пришёл на почту (`signup`, `reset-signin`), и там, где человек
 * вводит свой (`clean-signin`).
 */
const SCREEN_EVENTS: Partial<Record<Step, L2MixpanelEvent>> = {
  'auth': 'landing_email_screen',
  'clean-signin': 'landing_password_screen',
  'signup': 'landing_password_screen',
  'reset-signin': 'landing_password_screen',
  'payment': 'landing_payment_screen',
  'congrats': 'landing_congratulation_screen'
}

// `immediate` — чтобы стартовый экран тоже попал в аналитику. Дедупликации
// нет намеренно: событие означает «экран показан», поэтому возврат по стрелке
// «назад» или повторный заход после ошибки шлются заново.
watch(step, (current) => {
  const event = SCREEN_EVENTS[current]
  if (event) track(event)
}, { immediate: true })

const META_PASSWORD_STEPS: Step[] = ['clean-signin', 'signup', 'reset-signin']

watch(step, (current) => {
  if (current === 'auth') {
    trackCustom('LandingEmailScreen')
  } else if (META_PASSWORD_STEPS.includes(current)) {
    trackCustom('LandingPasswordScreen', { email: fields.email.value })
  }
}, { immediate: true })

/**
 * `CompleteRegistration` — точное имя из таксономии Meta (в требованиях
 * написано «CompletedRegistration», но такого стандартного события у Meta
 * нет, и кампания не смогла бы на него оптимизироваться). Шлётся сразу
 * после успешного входа: с этого момента шаг «аккаунт» закрыт.
 *
 * Флаг живёт до полной перезагрузки страницы — повторный вход в том же
 * визите (ошибся паролем, вернулся назад и снова вперёд) не должен давать
 * второй регистрации.
 */
let metaRegistrationSent = false

/* ----------------------------- API ----------------------------- */

function statusOf(error: unknown) {
  const err = error as { response?: { status?: number }, statusCode?: number }
  return err?.response?.status ?? err?.statusCode
}

/**
 * Порт `errorHandler()` из l2/auth: 400/404/500 — это «у нас что-то
 * сломалось», а всё остальное (в первую очередь 401/403 на `/login`) —
 * «неверные данные». Ошибка вешается на то поле, которое видно на текущем шаге.
 */
function handleApiError(error: unknown) {
  const field = isPasswordStep.value ? fields.password : fields.email
  const status = statusOf(error)

  field.error = true
  field.errorMessage = status && [400, 404, 500].includes(status)
    ? GENERIC_ERROR_TEXT
    : field.errorText
}

/**
 * `/signup-via-only-email` — единая точка входа: если аккаунта не было, бэк
 * заводит его и отправляет пароль на почту; если был — просто сообщает об
 * этом через `accountExists`.
 */
async function checkEmailExist() {
  processing.value = true

  try {
    const response = await $fetch<{ accountExists?: boolean }>(`${L1_ACCOUNTS_API}/signup-via-only-email`, {
      method: 'POST',
      body: {
        email: fields.email.value,
        language: L1_LANGUAGE,
        gameId: L1_GAME_ID,
        experiment: L1_EXPERIMENT,
        country: L1_COUNTRY
      }
    })

    step.value = response?.accountExists ? 'clean-signin' : 'signup'
  } catch (error) {
    handleApiError(error)
  } finally {
    processing.value = false
  }
}

async function signIn() {
  processing.value = true

  try {
    const response = await $fetch<{ AJWT?: string, id?: number }>(`${L1_ACCOUNTS_API}/login`, {
      method: 'POST',
      body: {
        email: fields.email.value,
        password: fields.password.value,
        gameId: L1_GAME_ID
      }
    })

    ajwt.value = response?.AJWT ?? ''

    // Без токена платить нечем. Это не «сломался платёж», а неудачный вход,
    // поэтому ведём себя как при ошибке `/login`, а не уводим на экран
    // оплаты с кнопкой «повторить», которая упиралась бы в то же самое.
    if (!ajwt.value) {
      handleApiError({ statusCode: 500 })
      return
    }

    saveL1Ajwt(ajwt.value)

    // Склеиваем анонимного посетителя лендинга с аккаунтом — дальше события
    // уходят уже от его имени. Id ещё и сохраняем: событие покупки уйдёт уже
    // с /payment-result, то есть на следующей загрузке страницы.
    if (response?.id) {
      identify(response.id)
      saveL1AccountId(String(response.id))
    }

    if (!metaRegistrationSent) {
      metaRegistrationSent = true
      trackStandard('CompleteRegistration', { email: fields.email.value })
    }

    await startPayment()
  } catch (error) {
    handleApiError(error)
  } finally {
    processing.value = false
  }
}

/**
 * Шаг 2 — боевой инвойс. Вызывается сразу после входа и повторно по кнопке
 * «Qayta urunib ko‘ring» на экране ошибки.
 *
 * Ошибку инвойса не вешаем на поле пароля: аккаунт на этот момент уже создан
 * и вход выполнен, возвращать человека к паролю было бы враньём — у него
 * сломался платёж, а не логин. Поэтому отдельный экран с повтором.
 */
async function startPayment() {
  if (!ajwt.value) {
    // Сюда можно попасть только с экрана ошибки после перезагрузки вкладки —
    // тогда единственное осмысленное действие — войти заново.
    step.value = 'auth'
    return
  }

  processing.value = true

  try {
    const invoice = await createL1Invoice(ajwt.value)

    if (invoice.status === 'already_purchased') {
      receiptUrl.value = invoice.receiptUrl ?? null
      clearL1InvoiceId()
      step.value = 'congrats'
      return
    }

    // `payment_required` (новый инвойс) и `payment_pending` (незакрытый
    // прежний) обрабатываются одинаково: и там, и там есть ссылка на оплату.
    if (invoice.checkoutUrl && invoice.invoiceId) {
      saveL1InvoiceId(invoice.invoiceId)
      checkoutUrl.value = invoice.checkoutUrl
      step.value = 'payment'

      // Кнопка на экране остаётся видимой: если браузер придержит переход,
      // человек уйдёт на шлюз руками.
      window.location.assign(invoice.checkoutUrl)
      return
    }

    step.value = 'payment-error'
  } finally {
    processing.value = false
  }
}

/** `/resetPasswordWithPassword` — высылает на почту новый пароль. */
async function resetPassword() {
  processing.value = true

  try {
    await $fetch(`${L1_ACCOUNTS_API}/resetPasswordWithPassword`, {
      method: 'POST',
      body: {
        email: fields.email.value,
        gameId: L1_GAME_ID,
        language: L1_LANGUAGE
      }
    })

    clearField('password')
    return true
  } catch (error) {
    handleApiError(error)
    return false
  } finally {
    processing.value = false
  }
}

/** Ручной уход на шлюз с экрана «To‘lov kutilmoqda», когда автоматический
 *  переход не сработал. */
function goToCheckout() {
  if (checkoutUrl.value) window.location.assign(checkoutUrl.value)
}

/** Ссылка поддержки с экрана ошибки оплаты. Адрес — заглушка до тех пор,
 *  пока не назван реальный канал поддержки лендинга. */
const SUPPORT_URL = 'mailto:support@amayasoft.uz'
</script>

<template>
  <L1Shell :variant="step === 'congrats' ? 'congrats' : 'default'">
    <L1Congrats
      v-if="step === 'congrats'"
      :receipt-url="receiptUrl"
      @appstore="track('landing_appstore_button_tap'); trackCustom('LandingAppstoreButtonTap', { email: fields.email.value })"
    />

    <div
      v-else
      class="auth"
    >
      <L1Card>
        <L1Steps :active="activeStep" />

        <h1
          class="title"
          :class="{ 'title--lg': isPaymentStep }"
        >
          <span
            v-for="line in meta.title"
            :key="line"
          >{{ line }}</span>
        </h1>

        <div class="form">
          <p class="form__label">
            {{ meta.subtitle }}
          </p>

          <!-- Шаг 1 / восстановление: email -->
          <template v-if="isEmailStep">
            <div
              class="field"
              :class="{ 'field--error': fieldHasError('email') }"
            >
              <input
                v-model="fields.email.value"
                type="email"
                class="field__input"
                placeholder="Email"
                autocomplete="email"
                inputmode="email"
                :disabled="processing"
                @input="onFieldInput('email')"
                @change="onFieldChange('email')"
              >
            </div>

            <p
              v-if="fieldHasError('email')"
              class="field__error"
            >
              {{ fields.email.errorMessage }}
            </p>

            <label
              v-if="step === 'auth'"
              class="legal"
              :class="{ 'legal--error': legalError }"
            >
              <input
                v-model="legal"
                type="checkbox"
                class="legal__checkbox"
                @change="legal ? (legalError = false) : null"
              >
              <img
                v-if="legal"
                class="legal__box"
                :src="checkboxSvg"
                alt=""
              >
              <span
                v-else
                class="legal__box legal__box--empty"
              />
              <span class="legal__text">Men
                <NuxtLink
                  to="/legal/privacy-policy"
                  target="_blank"
                >Maxfiylik siyosatiga</NuxtLink> hamda
                <NuxtLink
                  to="/legal/terms-of-use"
                  target="_blank"
                >Foydalanish shartlariga</NuxtLink> roziman.</span>
            </label>
          </template>

          <!-- Шаг 2: пароль (из письма — для нового аккаунта и после
               восстановления; свой — для существующего) -->
          <template v-else-if="isPasswordStep">
            <div
              class="field field--password"
              :class="{ 'field--error': fieldHasError('password') }"
            >
              <input
                v-model="fields.password.value"
                :type="passwordHidden ? 'password' : 'text'"
                class="field__input"
                placeholder="Parol"
                :autocomplete="step === 'clean-signin' ? 'current-password' : 'one-time-code'"
                :disabled="processing"
                @input="onFieldInput('password')"
                @change="onFieldChange('password')"
              >

              <button
                class="field__eye"
                type="button"
                :aria-label="passwordHidden ? 'Parolni ko‘rsatish' : 'Parolni yashirish'"
                :disabled="processing"
                @click="passwordHidden = !passwordHidden"
              >
                <img
                  :src="passwordHidden ? eyeSvg : eyeOffSvg"
                  alt=""
                >
              </button>
            </div>

            <p
              v-if="fieldHasError('password')"
              class="field__error"
            >
              {{ fields.password.errorMessage }}
            </p>
          </template>
        </div>

        <!-- Кнопка шага -->
        <L1Button
          v-if="isEmailStep"
          label="Yuborish"
          :pending="processing"
          :disabled="step === 'auth' ? !canSubmitEmail : fieldBlocksSubmit('email')"
          @click="handleNext()"
        />

        <L1Button
          v-else-if="isPasswordStep"
          label="Davom etish"
          :pending="processing"
          :disabled="!canSubmitPassword"
          @click="handleNext()"
        />

        <L1Button
          v-else-if="step === 'payment'"
          label="To‘lovga o‘tish"
          size="lg"
          @click="goToCheckout"
        />

        <L1Button
          v-else-if="step === 'payment-error'"
          label="Qayta urunib ko‘ring"
          size="lg"
          :pending="processing"
          @click="startPayment()"
        />

        <L1Button
          v-else
          label="OK"
          @click="handleNext()"
        />

        <!-- Восстановление доступно только там, где пароль «свой» -->
        <button
          v-if="step === 'clean-signin'"
          class="forgot"
          type="button"
          :disabled="processing"
          @click="handleNext('reset')"
        >
          Parolni unutdingizmi?
        </button>

        <button
          v-else-if="step === 'payment'"
          class="secondary"
          type="button"
          @click="handleBack"
        >
          Orqaga
        </button>

        <p
          v-else-if="step === 'payment-error'"
          class="support"
        >
          <span>Yordam kerakmi?</span>
          <a :href="SUPPORT_URL">Bizga yozing</a>
        </p>
      </L1Card>

      <button
        v-if="showBack"
        class="back"
        type="button"
        aria-label="Orqaga"
        :disabled="processing"
        @click="handleBack"
      >
        <svg
          viewBox="0 0 26 20"
          fill="none"
        >
          <rect
            width="26"
            height="20"
            rx="10"
            fill="currentColor"
          />
          <path
            d="M7.64645 9.64645C7.45118 9.84171 7.45118 10.1583 7.64645 10.3536L10.8284 13.5355C11.0237 13.7308 11.3403 13.7308 11.5355 13.5355C11.7308 13.3403 11.7308 13.0237 11.5355 12.8284L8.70711 10L11.5355 7.17157C11.7308 6.97631 11.7308 6.65973 11.5355 6.46447C11.3403 6.2692 11.0237 6.2692 10.8284 6.46447L7.64645 9.64645ZM18 10.5C18.2761 10.5 18.5 10.2761 18.5 10C18.5 9.72386 18.2761 9.5 18 9.5V10V10.5ZM8 10V10.5H18V10V9.5H8V10Z"
            fill="#ffffff"
          />
        </svg>
      </button>
    </div>
  </L1Shell>
</template>

<style scoped lang="scss">
/* Все величины — из макета Figma «Cars 1 / PW_locals_Cars1_UZ-3», фреймы
   Email / Password / Payment: заголовок #00bf73 Nunito Black 28 (32 на
   планшете и на платёжных экранах), подпись Nunito SemiBold 18/24 #595959,
   поле 48px с обводкой 2px #b8b5c8. */

.auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.title {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* В макете строки заголовка — отдельные текстовые узлы с шагом 4. */
  gap: 4px;
  width: 100%;
  font-weight: 900;
  font-size: 28px;
  line-height: 28px;
  text-align: center;
  color: #00bf73;

  @include md-tablet {
    font-size: 32px;
    line-height: 32px;
  }

  /* Платёжные экраны набраны 32-м уже на мобильном. */
  &--lg {
    font-size: 32px;
    line-height: 32px;
  }
}

/* ---------- поля ---------- */

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;

  &__label {
    width: 100%;
    font-weight: 600;
    font-size: 18px;
    line-height: 24px;
    text-align: center;
    color: #595959;
  }
}

.field {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 2px solid #b8b5c8;
  border-radius: 99px;
  background: #fbfaff;
  transition: border-color 0.15s;

  &:focus-within {
    border-color: #9c99ab;
  }

  &--error {
    border-color: #ef2d74;
  }

  /* Поле пароля: одинаковые отступы по 44 — так значение остаётся по центру,
     несмотря на «глаз» справа (в макете именно так). */
  &--password {
    padding: 0 44px;
  }

  &__input {
    flex: 1 0 0;
    min-width: 0;
    height: 100%;
    appearance: none;
    border: 0;
    padding: 0;
    background: transparent;
    text-align: center;
    font-family: inherit;
    font-weight: 800;
    font-size: 20px;
    line-height: 36px;
    color: #000000;

    &::placeholder {
      color: #b8b5c8;
    }

    &:focus {
      outline: none;
    }
  }

  &__eye {
    position: absolute;
    top: 50%;
    right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-top: -16px;
    padding: 0;
    appearance: none;
    border: 0;
    background: transparent;
    cursor: pointer;

    img {
      display: block;
      width: 32px;
      height: 32px;
      border: 0;
    }

    &:disabled {
      cursor: default;
      opacity: 0.6;
    }
  }

  &__error {
    width: 100%;
    font-family: "Open Sans", Arial, sans-serif;
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    text-align: center;
    color: #ef2d74;
  }
}

/* ---------- согласие ---------- */

.legal {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  cursor: pointer;

  &__checkbox {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  &__box {
    flex-shrink: 0;
    display: block;
    width: 20px;
    height: 20px;
    border: 0;

    /* Незаполненное состояние в макете не нарисовано — повторяем геометрию
       самой иконки (rect 18×18, rx 3, обводка 2px), только без галочки. */
    &--empty {
      border: 2px solid #b8b5c8;
      border-radius: 4px;
      background: #fbfaff;
      box-sizing: border-box;
    }
  }

  &__text {
    flex: 1 1 auto;
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    text-align: left;
    color: #767676;

    a {
      color: inherit;
      text-decoration: underline;
    }
  }

  &--error {
    .legal__box--empty {
      border-color: #ef2d74;
    }

    .legal__text {
      color: #ef2d74;
    }
  }
}

/* ---------- вторичные действия ---------- */

/* В макете эта ссылка набрана Open Sans, а не Nunito, — оставляем как есть. */
.forgot {
  padding: 0;
  appearance: none;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-family: "Open Sans", Arial, sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 14px;
  color: #767676;
  text-decoration: underline;

  &:disabled {
    cursor: default;
    opacity: 0.6;
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

.back {
  margin-top: 16px;
  padding: 0;
  appearance: none;
  border: 0;
  background: transparent;
  cursor: pointer;
  line-height: 0;
  color: #00bf73;

  svg {
    width: 40px;
    height: 31px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
}
</style>
