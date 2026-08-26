<script setup lang="ts">
import '~/assets/css/fonts/nunito.css'
import '~/assets/css/fonts/open-sans.css'

import logoSvg from '~/assets/images/l2/svg/logo.svg'
import carPng from '~/assets/images/l2/png/car.png'
import robotPng from '~/assets/images/l2/png/robot.png'
import starPng from '~/assets/images/l2/png/star.png'

useSeoMeta({
  title: 'Ro‘yxatdan o‘tish — Amaya Kids'
})

/* ------------------------------------------------------------------ *
 * Порт флоу из sc-giftflow/v1 (index.vue + stepAuth/stepSignin/
 * stepSignup/stepReset/stepCheck + mainInput/mainButton/mainCheckbox).
 *
 * Оригинал живёт внутри вебвью приложения и берёт gameId/deviceId/локаль
 * из appDataStore, а тексты — из vue-i18n (`cars113.*` / `basic.*`).
 * Здесь ни того, ни другого нет: хост l2.amayasoft.uz не локализован
 * (`HOST_CONFIGS['l2.amayasoft.uz'].locale.localized === false`, см.
 * shared/hostLandings.ts), поэтому все строки — узбекский хардкод, как и
 * в остальном l2 (../index.vue, ../success, ../legal).
 *
 * Два сценария, ради которых всё и делается:
 *   • аккаунта нет  → бэк создаёт его и присылает пароль на почту,
 *                     пользователь вводит пришедший пароль (`signup`);
 *   • аккаунт есть  → пользователь вводит свой пароль (`clean-signin`),
 *                     а если забыл — восстанавливает его
 *                     (`reset` → `check-email` → `reset-signin`).
 * ------------------------------------------------------------------ */

/** Публичный API аккаунтов. В sc-giftflow это my.amayakids.com; для
 *  узбекского контура бэк отдал my.amayasoft.uz. */
const API_BASE = 'https://my.amayasoft.uz/api/public'

/** cars2 (`com.amayasoft.cars.kids.racing.toddlers.garage.game`) —
 *  см. `bundleIdToGameId` в appDataStore приложения. */
const GAME_ID = 15

const LANGUAGE = 'uz'
const COUNTRY = 'Uzbekistan'

/** Аналог `experiment` из sc-giftflow (там — 'UA_Cars1_var1'): метка
 *  источника регистрации для аналитики бэка. */
const EXPERIMENT = 'UZ_Cars2_L2_web'

const APP_STORE_URL = 'https://apps.apple.com/app/kids-car-games-police-car-fun/id1442848046'

type Step
  = | 'auth' // ввод email
    | 'clean-signin' // аккаунт уже есть — ввести свой пароль
    | 'signup' // аккаунта не было — ввести пароль из письма
    | 'reset' // забыл пароль — ввести email
    | 'check-email' // «пароль отправлен на почту»
    | 'reset-signin' // ввести новый пароль из письма
    | 'congrats'

const step = ref<Step>('auth')
const processing = ref(false)

/** Ответ `/login`. На вебе он пока никуда не уходит, но нужен для
 *  будущего запроса на выдачу доступа — см. TODO в `signIn()`. */
const ajwt = ref('')
const accountId = ref<number | null>(null)

/* ---------------------------- поля ---------------------------- */

const EMAIL_ERROR_TEXT = 'Email noto‘g‘ri kiritilgan'
const PASSWORD_ERROR_TEXT = 'Parol noto‘g‘ri'
const GENERIC_ERROR_TEXT = 'Nimadir xato ketdi. Iltimos, yana urinib ko‘ring.'

// Регулярки один в один из sc-giftflow/v1/index.vue → `fields`.
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

/** `update:modelValue` из mainInput.vue: пока печатают — только снимаем
 *  ошибку, но не показываем новую. */
function onFieldInput(name: FieldName) {
  const field = fields[name]

  if (field.regex.test(field.value)) {
    field.error = false
    field.errorMessage = ''
  } else {
    field.error = true
  }
}

/** `@change` из mainInput.vue: значение зафиксировали — можно ругаться. */
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

/** Как в mainInput.vue: текст ошибки виден только при непустом поле. */
function fieldHasError(name: FieldName) {
  return Boolean(fields[name].errorMessage && fields[name].value)
}

/** Как в mainButton.vue: серверную ошибку кнопка не блокирует — её можно
 *  «перещёлкнуть» повторной отправкой, блокирует только невалидный ввод. */
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const meta = computed(() => {
  switch (step.value) {
    case 'auth':
      return {
        title: 'Ro‘yxatdan o‘ting, yuklab oling va o‘ynang!',
        subtitle: 'Emailingizni kiriting.'
      }
    case 'clean-signin':
      return {
        title: 'Bunday akkaunt allaqachon mavjud',
        subtitle: 'Bu email bilan akkaunt allaqachon ro‘yxatdan o‘tgan. Davom etish uchun parolingizni kiriting.'
      }
    case 'signup':
      return {
        title: 'Parolni kiriting<br/>Biz uni pochtangizga yubordik',
        subtitle: 'Agar xat kelmagan bo‘lsa, «Spam» papkasini ham tekshiring.'
      }
    case 'reset':
      return {
        title: 'Parolni tiklash',
        subtitle: 'Emailingizni kiriting — biz unga yangi parol yuboramiz.'
      }
    case 'check-email':
      return {
        title: 'Yangi parol yuborildi',
        subtitle: `Biz <b>${escapeHtml(fields.email.value)}</b> manziliga yangi parol yubordik. Agar xat kelmagan bo‘lsa, «Spam» papkasini ham tekshiring.`
      }
    case 'reset-signin':
      return {
        title: 'Akkauntga kirish',
        subtitle: 'Pochtangizga kelgan yangi parolni kiriting.'
      }
    default:
      return { title: '', subtitle: '' }
  }
})

/** Индикатор «1 → 2» скрыт на шагах восстановления пароля — как в
 *  sc-giftflow, где он висит только на auth/signin/signup. */
const showSteps = computed(() => (
  ['auth', 'clean-signin', 'signup', 'reset-signin'].includes(step.value)
))

const showBack = computed(() => (
  ['clean-signin', 'signup', 'reset', 'reset-signin'].includes(step.value)
))

const isPasswordStep = computed(() => (
  ['clean-signin', 'signup', 'reset-signin'].includes(step.value)
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

/* ----------------------------- API ----------------------------- */

function statusOf(error: unknown) {
  const err = error as { response?: { status?: number }, statusCode?: number }
  return err?.response?.status ?? err?.statusCode
}

/**
 * Порт `errorHandler()` из sc-giftflow: 400/404/500 — это «у нас что-то
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
 * заводит его и отправляет пароль на почту; если был — просто сообщает об этом
 * через `accountExists`.
 */
async function checkEmailExist() {
  processing.value = true

  try {
    const response = await $fetch<{ accountExists?: boolean }>(`${API_BASE}/signup-via-only-email`, {
      method: 'POST',
      body: {
        email: fields.email.value,
        language: LANGUAGE,
        gameId: GAME_ID,
        experiment: EXPERIMENT,
        country: COUNTRY
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
    const response = await $fetch<{ AJWT?: string, id?: number }>(`${API_BASE}/login`, {
      method: 'POST',
      body: {
        email: fields.email.value,
        password: fields.password.value,
        gameId: GAME_ID
      }
    })

    ajwt.value = response?.AJWT ?? ''
    accountId.value = response?.id ?? null

    // TODO(бэк): здесь должен быть запрос на выдачу доступа. `grantAuthPurchase`
    // из sc-giftflow не подходит — он требует deviceId, которого на вебе нет;
    // бэк обещал отдельный запрос на создание покупки. AJWT/accountId выше
    // сохранены как раз под него.

    step.value = 'congrats'
  } catch (error) {
    handleApiError(error)
  } finally {
    processing.value = false
  }
}

/** `/resetPasswordWithPassword` — высылает на почту новый пароль. */
async function resetPassword() {
  processing.value = true

  try {
    await $fetch(`${API_BASE}/resetPasswordWithPassword`, {
      method: 'POST',
      body: {
        email: fields.email.value,
        gameId: GAME_ID,
        language: LANGUAGE
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

/* --------------------------- congrats --------------------------- */

// Декоративные искры вокруг плашки — расставлены вручную, как в ../success.
const sparkles = [
  { top: '6%', left: '4%', size: 30, kind: 'spark' as const },
  { top: '22%', left: '14%', size: 16, kind: 'spark' as const },
  { top: '58%', left: '2%', size: 26, kind: 'spark' as const },
  { top: '84%', left: '16%', size: 18, kind: 'star' as const },
  { top: '4%', right: '10%', size: 22, kind: 'star' as const },
  { top: '38%', right: '2%', size: 34, kind: 'star' as const },
  { top: '70%', right: '12%', size: 22, kind: 'spark' as const }
]
</script>

<template>
  <div class="auth-page">
    <!-- Header -->
    <header class="header">
      <NuxtLink
        class="header__logo"
        to="/"
      >
        <img
          :src="logoSvg"
          width="166"
          height="52"
          alt="Amaya Kids"
        >
      </NuxtLink>
    </header>

    <main
      class="auth"
      :class="{ 'auth--congrats': step === 'congrats' }"
    >
      <div
        v-if="step !== 'congrats'"
        class="card-wrapper"
      >
        <div class="card">
          <!-- Индикатор шагов: 1 — email, 2 — пароль/доступ -->
          <div
            v-if="showSteps"
            class="steps"
          >
            <div :class="['steps__item', { 'steps__item--active': step === 'auth' }]">
              <span class="steps__number">1</span>
              <span class="steps__text">Akkaunt yaratish</span>
            </div>
            <svg
              class="steps__arrow"
              viewBox="0 0 21 8"
              fill="none"
            >
              <path
                d="M16.9648 0.146447C17.1601 -0.0488155 17.4766 -0.0488155 17.6719 0.146447L20.8535 3.32809C21.0488 3.52335 21.0488 3.83986 20.8535 4.03512L17.6719 7.21676C17.4766 7.41202 17.1601 7.41202 16.9648 7.21676C16.7696 7.0215 16.7696 6.70499 16.9648 6.50973L19.293 4.1816H0.5C0.223858 4.1816 0 3.95775 0 3.6816C0 3.40546 0.223858 3.1816 0.5 3.1816H19.293L16.9648 0.853478C16.7696 0.658216 16.7696 0.341709 16.9648 0.146447Z"
                fill="currentColor"
              />
            </svg>
            <div :class="['steps__item', { 'steps__item--active': step !== 'auth' }]">
              <span class="steps__number">2</span>
              <span class="steps__text">Bepul kirish</span>
            </div>
          </div>

          <!-- Конверт на экране «пароль отправлен» -->
          <svg
            v-if="step === 'check-email'"
            class="card__envelope"
            viewBox="0 0 133 65"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M45.2096 25.8371C44.8736 24.4257 44.5247 22.9045 44.2501 21.4807C43.9843 20.103 43.1344 18.005 44.0155 16.8269C44.3044 16.44 44.7187 16.1654 45.1876 16.0498C45.7151 15.9218 46.5685 15.825 47.1298 15.7452C48.2357 15.5901 49.3407 15.4291 50.4449 15.2623L102.428 7.61416C103.654 7.44343 104.981 7.70362 105.261 9.00267C105.614 10.6429 105.602 12.8001 105.801 14.4808C105.821 14.895 105.848 15.3088 105.882 15.722L107.976 41.5457C108.017 42.0412 108.076 42.5669 108.099 43.0552C108.147 44.0588 108.451 45.1646 107.7 45.9851C107.338 46.3802 106.956 46.6197 106.422 46.7143C105.251 46.9354 104.061 47.1014 102.883 47.2844L56.0802 54.7235C54.7739 54.9337 52.959 55.5319 51.8933 54.5714C51.6219 54.3294 51.419 54.0202 51.3052 53.6749C51.1098 53.0755 50.7844 51.3823 50.6344 50.696L45.4658 27.0234C45.3899 26.6318 45.2953 26.228 45.2096 25.8371Z"
              fill="#FEB62B"
            />
            <path
              d="M45.2096 25.8371C45.5239 25.8522 47.6072 26.4031 48.0479 26.5142L53.6211 27.8863L66.2706 30.9399C69.3584 31.678 72.4529 32.4263 75.5603 33.0722C77.1137 33.3951 78.6689 33.494 80.2002 33.0206C82.3928 32.3431 84.6361 30.8851 86.5891 29.6495C91.801 26.3521 96.9371 22.7175 101.565 18.6399C102.425 17.8827 103.187 17.1239 103.982 16.3058C104.329 15.9493 105.413 14.5818 105.694 14.3931L105.801 14.4808C105.821 14.895 105.848 15.3088 105.882 15.722C100.272 21.4263 94.1744 26.6303 87.6591 31.2748C79.9283 36.7464 79.1272 36.4743 70.1773 34.0928C64.6225 32.5856 59.0843 31.0171 53.5641 29.3876L48.3656 27.8592C47.7009 27.6602 46.0735 27.1313 45.4658 27.0234C45.3899 26.6318 45.2953 26.228 45.2096 25.8371Z"
              fill="#ED6A00"
            />
            <path
              d="M28.8853 40.536C28.9509 40.5221 29.0714 40.5212 29.1431 40.5179C29.3589 40.7283 29.4164 41.7754 29.4734 42.1708L3.33834 51.0859L2.42031 49.5027L0 45.363C0.842498 45.1604 2.3567 44.9517 3.27857 44.7959L28.8853 40.536Z"
              fill="#FEB62B"
            />
            <path
              d="M35.8012 31.138C36.0231 31.1149 36.167 31.0783 36.3719 31.1611C36.6898 31.4657 36.7513 32.2706 36.8656 32.7759C35.8787 33.0356 34.614 33.2681 33.6015 33.4789L9.79234 38.452L8.78986 38.6689C9.16152 36.4813 9.51625 34.291 9.85394 32.0979L35.8012 31.138Z"
              fill="#FEB62B"
            />
            <path
              d="M44.5071 47.9212C44.6002 47.8907 44.617 47.9117 44.7146 47.9438C44.9179 48.2241 45.0984 48.7028 45.2388 49.0327L25.4064 57.3364C25.2402 57.4128 25.1983 57.4512 25.0276 57.4238C24.9258 57.1928 24.8716 53.1445 24.8549 52.5463C27.0375 52.1002 29.341 51.4983 31.5185 50.9869L44.5071 47.9212Z"
              fill="#FEB62B"
            />
          </svg>

          <h1
            class="card__title"
            v-html="meta.title"
          />

          <p
            class="card__subtitle"
            v-html="meta.subtitle"
          />

          <!-- Шаг 1 / восстановление: email -->
          <template v-if="step === 'auth' || step === 'reset'">
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
              <span class="legal__box">
                <svg
                  v-if="legal"
                  viewBox="0 0 11 9"
                  fill="none"
                >
                  <path
                    d="M8.35048 0.536005C8.88261 -0.0985801 9.82893 -0.181494 10.4638 0.350458C11.0983 0.882596 11.1813 1.82891 10.6493 2.46374L5.62196 8.46374C5.09017 9.09808 4.14461 9.18139 3.50966 8.65026L0.536999 6.16394C-0.0980227 5.63241 -0.181742 4.68693 0.349499 4.05163C0.881023 3.4162 1.82735 3.33163 2.46278 3.86315L4.28407 5.38659L8.35048 0.536005Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span class="legal__text">
                Men
                <NuxtLink
                  to="/legal/privacy-policy"
                  target="_blank"
                >Maxfiylik siyosatiga</NuxtLink>
                hamda
                <NuxtLink
                  to="/legal/terms-of-use"
                  target="_blank"
                >Foydalanish shartlariga</NuxtLink>
                roziman.
              </span>
            </label>

            <button
              class="btn card__btn"
              type="button"
              :disabled="processing || (step === 'auth' ? !canSubmitEmail : fieldBlocksSubmit('email'))"
              @click="handleNext()"
            >
              Yuborish
              <span
                v-if="processing"
                class="btn__spinner"
                aria-hidden="true"
              />
            </button>
          </template>

          <!-- Шаг 2: пароль (из письма — для нового аккаунта и после
               восстановления; свой — для существующего) -->
          <template v-else-if="isPasswordStep">
            <div
              class="field"
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
                <svg
                  v-if="passwordHidden"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M2.09697 6.23785C2.5555 5.91418 3.1896 6.02351 3.51327 6.48204C6.52916 10.7546 13.029 10.8337 16.5212 6.4361C16.8703 5.99658 17.5095 5.92322 17.9491 6.27226C18.3886 6.62129 18.4619 7.26055 18.1129 7.70008C13.8577 13.0585 5.72349 13.1377 1.85278 7.65415C1.52911 7.19562 1.63844 6.56152 2.09697 6.23785Z"
                    fill="currentColor"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M14.566 8.38213C14.9628 7.98525 15.6063 7.98525 16.0032 8.38213L17.6292 10.0081C18.026 10.405 18.026 11.0485 17.6292 11.4453C17.2323 11.8422 16.5888 11.8422 16.192 11.4453L14.566 9.81932C14.1691 9.42245 14.1691 8.779 14.566 8.38213Z"
                    fill="currentColor"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M5.4341 8.38213C5.83097 8.779 5.83097 9.42245 5.4341 9.81932L3.80809 11.4453C3.41122 11.8422 2.76777 11.8422 2.3709 11.4453C1.97402 11.0485 1.97402 10.405 2.3709 10.0081L3.9969 8.38213C4.39377 7.98525 5.03723 7.98525 5.4341 8.38213Z"
                    fill="currentColor"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M11.6009 10.1515C12.1431 10.0063 12.7003 10.328 12.8456 10.8701L13.2664 12.4407C13.4117 12.9829 13.09 13.5401 12.5478 13.6854C12.0057 13.8306 11.4485 13.5089 11.3032 12.9668L10.8823 11.3962C10.7371 10.854 11.0588 10.2968 11.6009 10.1515Z"
                    fill="currentColor"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M8.39911 10.1515C7.85698 10.0063 7.29973 10.328 7.15446 10.8701L6.73362 12.4407C6.58836 12.9829 6.91008 13.5401 7.45222 13.6854C7.99436 13.8306 8.55161 13.5089 8.69687 12.9668L9.11771 11.3962C9.26298 10.854 8.94125 10.2968 8.39911 10.1515Z"
                    fill="currentColor"
                  />
                </svg>

                <svg
                  v-else
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1.66669 9.9999C1.66684 10.1711 1.71037 10.3396 1.79225 10.4891C3.6585 14.0044 6.65865 15.8941 9.83864 15.8941C13.0059 15.8941 16.0986 14.02 18.1791 10.5383C18.2798 10.3767 18.3332 10.1896 18.3334 9.9999C18.3332 9.81017 18.2798 9.62313 18.1791 9.46155C16.0986 5.97982 13.0059 4.10571 9.83864 4.10571C6.65864 4.10571 3.65849 5.99536 1.79224 9.51073C1.77895 9.53499 1.76667 9.55976 1.75541 9.58497C1.69523 9.71917 1.66657 9.86043 1.66669 9.9999ZM16.1165 9.9999C14.3543 7.35114 12.0157 6.13819 9.83864 6.13819C7.66136 6.13819 5.41912 7.35085 3.84777 9.9999C5.41912 12.6489 7.66136 13.8616 9.83864 13.8616C12.0157 13.8616 14.3543 12.6487 16.1165 9.9999Z"
                    fill="currentColor"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M10 11.0161C10.5613 11.0161 11.0162 10.5611 11.0162 9.99989C11.0162 9.43863 10.5613 8.98365 10 8.98365C9.43876 8.98365 8.98377 9.43863 8.98377 9.99989C8.98377 10.5611 9.43876 11.0161 10 11.0161ZM10 13.0486C11.6838 13.0486 13.0487 11.6836 13.0487 9.99989C13.0487 8.31613 11.6838 6.95117 10 6.95117C8.31625 6.95117 6.95129 8.31613 6.95129 9.99989C6.95129 11.6836 8.31625 13.0486 10 13.0486Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>

            <p
              v-if="fieldHasError('password')"
              class="field__error"
            >
              {{ fields.password.errorMessage }}
            </p>

            <button
              class="btn card__btn"
              type="button"
              :disabled="processing || !canSubmitPassword"
              @click="handleNext()"
            >
              Davom etish
              <span
                v-if="processing"
                class="btn__spinner"
                aria-hidden="true"
              />
            </button>

            <!-- Восстановление доступно только там, где пароль — «свой»,
                 то есть на экране существующего аккаунта. -->
            <button
              v-if="step === 'clean-signin'"
              class="forgot"
              type="button"
              :disabled="processing"
              @click="handleNext('reset')"
            >
              Parolni unutdingizmi?
            </button>
          </template>

          <!-- Подтверждение отправки нового пароля -->
          <template v-else>
            <button
              class="btn card__btn"
              type="button"
              @click="handleNext()"
            >
              OK
            </button>
          </template>
        </div>

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

      <!-- Финал: доступ выдан -->
      <template v-else>
        <div
          class="sparkles"
          aria-hidden="true"
        >
          <svg
            v-for="(s, i) in sparkles"
            :key="i"
            class="sparkle"
            :style="{ top: s.top, left: s.left, right: s.right, width: `${s.size}px`, height: `${s.size}px` }"
            viewBox="0 0 24 24"
          >
            <path
              v-if="s.kind === 'spark'"
              fill="#ffffff"
              d="M12 0c0 6.6-5.4 12-12 12 6.6 0 12 5.4 12 12 0-6.6 5.4-12 12-12-6.6 0-12-5.4-12-12Z"
            />
            <image
              v-else
              :href="starPng"
              width="24"
              height="24"
            />
          </svg>
        </div>

        <div class="plaque">
          <h1 class="plaque__title">
            Tabriklaymiz!
          </h1>

          <p
            class="plaque__text"
            v-html="'<b>Mashinalar</b> ilovasiga to‘liq kirish huquqiga ega bo‘ldingiz!'"
          />

          <!--
            Бейдж — английская артворка Apple, которая уже лежит в репозитории;
            русифицированного варианта из макета в репозитории нет.
            См. тот же комментарий в ../success/index.vue.
          -->
          <a
            class="plaque__appstore"
            :href="APP_STORE_URL"
            target="_blank"
            rel="noopener"
          >
            <img
              src="/assets/images/a/letter/farm/appstore.png"
              width="200"
              height="67"
              alt="App Store"
            >
          </a>

          <p class="plaque__hint">
            Ilovani yuklab oling va o‘yindan zavqlaning!
          </p>

          <img
            class="plaque__robot"
            :src="robotPng"
            width="90"
            height="53"
            alt=""
          >
          <img
            class="plaque__car"
            :src="carPng"
            width="104"
            height="84"
            alt=""
          >
        </div>
      </template>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer__company">
        <p>2026, Amaya Kids</p>
        <p>Barcha huquqlar himoyalangan</p>
      </div>

      <nav class="footer__links">
        <NuxtLink to="/legal/terms-of-use">
          Foydalanish shartlari
        </NuxtLink>
        <NuxtLink to="/legal/privacy-policy">
          Maxfiylik siyosati
        </NuxtLink>
      </nav>
    </footer>
  </div>
</template>

<style scoped lang="scss">
/* Визуальный язык — как в l1/l2 (Nunito, синий хедер/футер), см. ../index.vue.
   Брейкпойнт-миксины приходят из app/assets/css/breakpoints.scss и
   подставляются глобально через nuxt.config.ts. */

/* Рамки-карточки `.page` здесь намеренно нет: в отличие от l1/l2, эта
   страница — сплошное синее поле сверху донизу (хедер, карточка и футер на
   одном фоне), а не белая карточка на светлой подложке. */
.auth-page {
  min-height: 100vh;
  background: #05b8f6;
  font-family: "Nunito", "Helvetica Neue", Arial, sans-serif;
  color: #3c4267;
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;

  img {
    display: block;
    max-width: 100%;
    height: auto;
    border: 0;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
}

/* ---------- header ---------- */

.header {
  display: flex;
  padding: 16px 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding-bottom: 0 !important;

  @include md-tablet {
    padding: 24px 56px;
    align-items: flex-start;
  }

  @include md-desktop {
    padding: 28px 64px;
  }

  &__logo {
    display: block;
    width: 120px;
    height: 38px;
    line-height: 0;

    img {
      display: block;
      width: 100%;
      height: 100%;
    }

    @include md-tablet {
      width: 166px;
      height: 52px;
    }
  }
}

/* ---------- shared button ---------- */

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 48px;
  padding: 0 28px;
  appearance: none;
  border: 0;
  border-bottom: 6px solid #017c2e;
  border-radius: 120px;
  background-color: #079d27;
  background-image: linear-gradient(to top, #079d27 0%, #00a846 12%, #14ef6f 100%);
  box-shadow: 0 2px 1px rgba(0, 0, 0, 0.4), 0 19px 14px -5px rgba(0, 0, 0, 0.25), 0 34px 25px -11px rgba(0, 0, 0, 0.25), 0 44px 50px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 900;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  color: #ffffff;
  text-shadow: 0 2px 1px rgba(0, 0, 0, 0.2);

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }

  &__spinner {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    border: 2px solid #ffffff;
    border-bottom-color: transparent;
    border-radius: 50%;
    animation: btn-spin 1s linear infinite;
  }
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ---------- auth section ---------- */

.auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  padding-top: 0 !important;
  padding-bottom: 0 !important;

  @include md-tablet {
    padding: 64px 56px;
  }

  &--congrats {
    position: relative;
    overflow: hidden;
    padding: 56px 24px;
    background:
      repeating-conic-gradient(from 0deg, rgba(255, 255, 255, 0.07) 0deg 8deg, transparent 8deg 20deg),
      radial-gradient(circle at 50% 45%, #3fd1ff 0%, #05b8f6 55%, #0596d1 100%);

    @include md-tablet {
      padding: 88px 56px;
    }
  }
}

/* ---------- card ---------- */

.card-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.card {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
  padding: 28px 24px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);

  @include md-tablet {
    max-width: 360px;
    padding: 36px 32px;
    gap: 18px;
  }

  &__envelope {
    align-self: center;
    width: 110px;
    height: auto;

    @include md-tablet {
      width: 133px;
    }
  }

  &__title {
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 800;
    font-size: 18px;
    line-height: 23px;
    text-align: center;
    color: #079d27;

    @include md-tablet {
      font-size: 20px;
      line-height: 25px;
    }
  }

  &__subtitle {
    font-family: "Open Sans", Arial, sans-serif;
    font-weight: 600;
    font-size: 14px;
    line-height: 19px;
    text-align: center;
    color: #3c4267;
  }

  &__btn {
    align-self: center;
    margin-top: 4px;
  }
}

.steps {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #9aa3b8;

    &--active {
      color: #05b8f6;
    }
  }

  &__number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 99px;
    background: currentColor;
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 800;
    font-size: 11px;
    color: #ffffff;
  }

  &__text {
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 800;
    font-size: 12px;
  }

  &__arrow {
    width: 14px;
    height: 6px;
    transform: rotate(90deg);
    color: #9aa3b8;
  }
}

/* ---------- fields ---------- */

.field {
  display: flex;
  align-items: center;
  height: 44px;
  border: 2px solid #d7dbe8;
  border-radius: 14px;
  background: #fbfaff;
  transition: border-color 0.15s;

  &:focus-within {
    border-color: #9c99ab;
  }

  &--error {
    border-color: #ef2d74;
  }

  &__input {
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0 16px;
    appearance: none;
    border: 0;
    background: transparent;
    text-align: center;
    font-family: "Open Sans", Arial, sans-serif;
    font-weight: 600;
    font-size: 15px;
    color: #3c4267;

    &::placeholder {
      color: #b8b5c8;
    }

    &:focus {
      outline: none;
    }
  }

  /* Компенсирует ширину «глаза», чтобы текст оставался по центру поля. */
  &__input:not(:last-child) {
    padding-left: 42px;
    padding-right: 0;
  }

  &__eye {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 100%;
    padding: 0;
    appearance: none;
    border: 0;
    background: transparent;
    cursor: pointer;
    color: #ff8d24;

    svg {
      width: 18px;
      height: 18px;
    }

    &:disabled {
      cursor: default;
      opacity: 0.6;
    }
  }

  &__error {
    margin-top: -8px;
    font-family: "Open Sans", Arial, sans-serif;
    font-weight: 600;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    color: #ef2d74;
  }
}

.forgot {
  align-self: center;
  padding: 0;
  appearance: none;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-family: "Open Sans", Arial, sans-serif;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: #767676;
  text-decoration: underline;

  &:disabled {
    cursor: default;
    opacity: 0.6;
  }
}

.legal {
  display: flex;
  align-items: flex-start;
  gap: 8px;
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
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    margin-top: 1px;
    border: 2px solid #b8b5c8;
    border-radius: 4px;
    background: #fbfaff;

    svg {
      width: 10px;
      height: 8px;
      color: #05b8f6;
    }
  }

  &__text {
    font-family: "Open Sans", Arial, sans-serif;
    font-weight: 600;
    font-size: 11px;
    line-height: 15px;
    color: #767676;

    a {
      color: #767676;
      text-decoration: underline;
    }
  }

  &--error {
    .legal__box {
      border-color: #ef2d74;
    }

    .legal__text {
      color: #ef2d74;
    }
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

/* ---------- congrats plaque (как в ../success/index.vue) ---------- */

.sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sparkle {
  position: absolute;
}

.plaque {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 360px;
  padding: 32px 24px 44px;
  background: #fdf2d6;
  border: 3px solid #f0c988;
  border-radius: 40px;
  box-shadow: 0 10px 0 rgba(0, 0, 0, 0.08);

  @include md-tablet {
    max-width: 460px;
    padding: 40px 40px 56px;
  }

  &__title {
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 900;
    font-size: 26px;
    line-height: 30px;
    color: #079d27;

    @include md-tablet {
      font-size: 34px;
      line-height: 38px;
    }
  }

  &__text {
    max-width: 420px;
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    text-align: center;
    color: #3b4256;

    @include md-tablet {
      max-width: 560px;
      font-size: 19px;
      line-height: 26px;
    }
  }

  &__appstore {
    display: inline-flex;

    img {
      width: 160px;
      height: auto;

      @include md-tablet {
        width: 200px;
      }
    }
  }

  &__hint {
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 800;
    font-size: 14px;
    line-height: 18px;
    text-align: center;
    color: #3b4256;

    @include md-tablet {
      font-size: 16px;
      line-height: 20px;
    }
  }

  &__robot {
    position: absolute;
    left: -18px;
    bottom: -20px;
    width: 72px;
    height: auto;
    transform: rotate(-8deg);

    @include md-tablet {
      left: -26px;
      bottom: -26px;
      width: 90px;
    }
  }

  &__car {
    position: absolute;
    right: -20px;
    bottom: -16px;
    width: 84px;
    height: auto;

    @include md-tablet {
      right: -28px;
      bottom: -22px;
      width: 104px;
    }
  }
}

/* ---------- footer ----------
   Отдельного фона (полосы #33cbff, как в l1/l2) здесь нет — футер лежит на
   той же сплошной синей заливке, как в макете. */

.footer {
  width: 100%;
  padding: 28px 20px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 20px;
  padding-top: 0 !important;
  padding-bottom: 0;

  @include md-tablet {
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 32px 44px;
  }

  &__company,
  &__links {
    display: flex;
    flex-direction: column;
  }

  &__company p,
  &__links a {
    font-family: "Open Sans", Arial, sans-serif;
    font-weight: 600;
    font-size: 12px;
    line-height: 12px;
    color: #ffffff;

    @include md-tablet {
      font-size: 18px;
      line-height: 26px;
    }
  }

  &__company p + p {
    margin-top: 8px;

    @include md-tablet {
      margin-top: 10px;
    }
  }

  &__links a {
    text-decoration: underline;
  }

  &__links a + a {
    margin-top: 12px;

    @include md-tablet {
      margin-top: 14px;
    }
  }
}
</style>
