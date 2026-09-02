<script setup lang="ts">
import '~/assets/css/fonts/nunito.css'
import '~/assets/css/fonts/open-sans.css'

import logoSvg from '~/assets/images/l2/svg/logo.svg'
import congratsPopupBgPng from '~/assets/images/l2/png/congrats-popup-bg.png'
import appStoreBadgeSvg from '~/assets/images/l2/svg/appstore-badge.svg'
import checkboxSvg from '~/assets/images/l2/svg/checkbox.svg'
import stepsArrowMobileSvg from '~/assets/images/l2/svg/steps-arrow-mobile.svg'
import stepsArrowTabletSvg from '~/assets/images/l2/svg/steps-arrow-tablet.svg'

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

/** cars2 (`com.amayasoft.cars.kids.racing.toddlers.garage.game`) — как в
 *  `bundleIdToGameId` из appDataStore приложения. В спеке бэка на регистрацию
 *  стоял 14, но выбрано 15 — если начнут сыпаться ошибки на /signup-via-only-email
 *  или /login, проверять надо в первую очередь это значение. */
const GAME_ID = 15

const LANGUAGE = 'uz'
const COUNTRY = 'Uzbekistan'
const EXPERIMENT = 'UA_Cars2_var1'

/** Хост биллинга cars2 (CARS2_AGS_HOST) — шаг 3, выдача покупки. */
const AGS_HOST = 'https://cars2.ags.amayakids.com'

/** Бесплатный пожизненный доступ, который лендинг выдаёт после входа. */
const PRODUCT_ID = 'com.amayasoft.cars2.ua.lifetimefree'

/** Уходит в `appstore_link` шага 3 и стоит на бейдже финального экрана. */
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

/** AJWT из ответа `/login` — с ним уходит запрос на выдачу покупки. */
const ajwt = ref('')

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
        subtitle: 'Emailni kiriting.'
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

/* --------------------------- аналитика --------------------------- */

const { track, identify } = useL2Mixpanel()
const { trackStandard, trackCustom, trackPageView } = useMetaPixel()

onMounted(() => trackPageView())

/**
 * Шаг флоу → событие показа экрана. Шаги без события (`reset`, `check-email`)
 * в карту не входят и ничего не шлют.
 *
 * `landing_password_screen` висит на всех трёх экранах с паролем: и там, где
 * пароль пришёл на почту (`signup`, `reset-signin`), и там, где человек вводит
 * свой (`clean-signin`).
 */
const SCREEN_EVENTS: Partial<Record<Step, L2MixpanelEvent>> = {
  'auth': 'landing_email_screen',
  'clean-signin': 'landing_password_screen',
  'signup': 'landing_password_screen',
  'reset-signin': 'landing_password_screen',
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

/** `Lead` — конверсионное событие Meta, влияет на CPL и оптимизацию бюджета
 *  кампании. В отличие от `landing_password_screen` в Mixpanel, слать его
 *  при каждом повторном попадании на этот экран (ошибся паролем, вернулся
 *  назад и снова вперёд) нельзя — иначе один человек даст 2-3 лида. Флаг живёт
 *  до полной перезагрузки страницы: новый визит — новая попытка, снова может
 *  прислать `Lead`. */
let metaLeadSent = false

watch(step, (current) => {
  if (current === 'auth') {
    // Свой ивент — заход на самый первый экран /auth, ещё до ввода email.
    // Как и остальные custom-события воронки, шлётся при каждом показе:
    // в том числе при возврате сюда стрелкой «назад» с шага пароля.
    trackCustom('LandingEmailScreen')
  } else if (META_PASSWORD_STEPS.includes(current)) {
    // Свой ивент для воронки в Events Manager — как и `landing_password_screen`
    // в Mixpanel, шлётся при каждом показе, не только один раз.
    trackCustom('LandingPasswordScreen', { email: fields.email.value })

    if (!metaLeadSent) {
      metaLeadSent = true
      trackStandard('Lead', { email: fields.email.value })
    }
  } else if (current === 'congrats') {
    // Точное имя из таксономии Meta — под него кампания оптимизируется на
    // «Sign up» в Ads Manager. Произвольное имя туда не подставить.
    trackStandard('CompleteRegistration', { email: fields.email.value })
  }
}, { immediate: true })

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

    // Склеиваем анонимного посетителя лендинга с аккаунтом — дальше события
    // уходят уже от его имени.
    if (response?.id) identify(response.id)

    await grantPurchase(ajwt.value)

    step.value = 'congrats'
  } catch (error) {
    handleApiError(error)
  } finally {
    processing.value = false
  }
}

/**
 * Шаг 3 — выдача бесплатного пожизненного доступа. Отдельный лендинговый
 * эндпоинт: в отличие от `grantAuthPurchase` из sc-giftflow, он не требует
 * deviceId (на вебе устройства нет) и авторизуется AJWT из `/login`.
 *
 * Успех — и `purchase_granted`, и `purchase_already_claimed`: второй означает,
 * что доступ уже выдавали раньше, для пользователя это тот же результат.
 *
 * Ошибку намеренно не показываем: аккаунт на этот момент уже создан и вход
 * выполнен, так что упереть человека в экран пароля было бы хуже — он всё
 * равно может скачать приложение и войти. Возвращаем флаг, чтобы вызывающий
 * код мог отреагировать, если это поведение решат поменять.
 */
async function grantPurchase(token: string) {
  if (!token) return false

  try {
    const response = await $fetch<{ ok?: boolean, status?: string }>(
      `${AGS_HOST}/api/client/billing/landing/grantPurchase`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          productId: PRODUCT_ID,
          appstore_link: APP_STORE_URL
        }
      }
    )

    return response?.status === 'purchase_granted' || response?.status === 'purchase_already_claimed'
  } catch {
    return false
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
</script>

<template>
  <!--
    Разметка по макету Figma «Cars 2 Amaya» — фреймы `mobile auth` / `tablet auth`
    и `mobile congrats` / `tablet congrats`. Базовое состояние = mobile (375),
    планшетное = `md-tablet` (768), как и во всём остальном l2.

    Логика (шаги, валидация, запросы) не менялась — только разметка и стили.
    В макете нарисовано одно состояние формы (ввод email), поэтому элементы,
    которых там нет — пароль с «глазом», текст ошибки, стрелка «назад»,
    «Parolni unutdingizmi?», конверт — стилизованы теми же токенами макета.
  -->
  <div class="page">
    <L2TesterBanner />

    <div
      class="page__wrapper"
      :class="{ 'page__wrapper--congrats': step === 'congrats' }"
    >
      <NuxtLink
        class="page__logo"
        to="/"
      >
        <img
          :src="logoSvg"
          width="166"
          height="52"
          alt="Amaya Kids"
        >
      </NuxtLink>

      <!-- Финальный экран: лучевой поп-ап во всю ширину макета -->
      <div
        v-if="step === 'congrats'"
        class="congrats"
      >
        <img
          class="congrats__bg"
          :src="congratsPopupBgPng"
          alt=""
        >

        <div class="congrats__content">
          <h1 class="congrats__title">
            Tabriklaymiz!
          </h1>

          <p class="congrats__text">
            Mashinalar ilovasiga to‘liq kirish huquqiga ega bo‘ldingiz!
          </p>

          <!-- Ссылка открывается в новой вкладке, текущая страница остаётся
               живой — поэтому обычного fetch хватает, sendBeacon не нужен. -->
          <a
            class="congrats__badge"
            :href="APP_STORE_URL"
            target="_blank"
            rel="noopener"
            @click="track('landing_appstore_button_tap'); trackCustom('LandingAppstoreButtonTap', { email: fields.email.value })"
          >
            <img
              :src="appStoreBadgeSvg"
              alt="App Store"
            >
          </a>

          <p class="congrats__hint">
            Ilovani yuklab oling va o‘yindan zavqlaning!
          </p>
        </div>
      </div>

      <!-- Форма -->
      <div
        v-else
        class="auth"
      >
        <div class="card">
          <!-- Индикатор шагов: 1 — email, 2 — пароль/доступ -->
          <div
            v-if="showSteps"
            class="steps"
          >
            <div :class="['steps__item', { 'steps__item--active': step === 'auth' }]">
              <span class="steps__point">1</span>
              <span class="steps__text">Akkaunt yaratish</span>
            </div>

            <img
              class="steps__arrow steps__arrow--mobile"
              :src="stepsArrowMobileSvg"
              alt=""
            >
            <img
              class="steps__arrow steps__arrow--tablet"
              :src="stepsArrowTabletSvg"
              alt=""
            >

            <div :class="['steps__item', { 'steps__item--active': step !== 'auth' }]">
              <span class="steps__point">2</span>
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

          <div class="form">
            <p
              class="form__label"
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
                <span class="legal__text">
                  <span>Men</span>
                  <NuxtLink
                    to="/legal/privacy-policy"
                    target="_blank"
                  >Maxfiylik siyosatiga</NuxtLink>
                  <span>hamda</span>
                  <NuxtLink
                    to="/legal/terms-of-use"
                    target="_blank"
                  >Foydalanish shartlariga</NuxtLink>
                  <span>roziman.</span>
                </span>
              </label>
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
            </template>
          </div>

          <!-- Кнопка шага -->
          <button
            v-if="step === 'auth' || step === 'reset'"
            class="btn"
            type="button"
            :disabled="processing || (step === 'auth' ? !canSubmitEmail : fieldBlocksSubmit('email'))"
            @click="handleNext()"
          >
            <span class="btn__label">Yuborish</span>
            <span
              v-if="processing"
              class="btn__spinner"
              aria-hidden="true"
            />
          </button>

          <button
            v-else-if="isPasswordStep"
            class="btn"
            type="button"
            :disabled="processing || !canSubmitPassword"
            @click="handleNext()"
          >
            <span class="btn__label">Davom etish</span>
            <span
              v-if="processing"
              class="btn__spinner"
              aria-hidden="true"
            />
          </button>

          <button
            v-else
            class="btn"
            type="button"
            @click="handleNext()"
          >
            <span class="btn__label">OK</span>
          </button>

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

      <!-- Футер: тексты и ссылки оставлены как были, оформление — по макету -->
      <footer class="footer">
        <div class="footer__legacy">
          <p class="footer__legacy-title">
            2026, Amaya Kids
          </p>
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
  </div>
</template>

<style scoped lang="scss">
/* Все значения — из макета Figma «Cars 2 Amaya» (фреймы mobile/tablet auth и
   mobile/tablet congrats). Базовое состояние = mobile (375), `md-tablet`
   (768) = планшетный фрейм (1024). Брейкпойнты проекта не менялись. */

.page {
  min-height: 100vh;
  background: #05b8f6;
  font-family: "Nunito", "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;

  /* Общего сброса для `img` здесь намеренно нет: правило `.page img`
     (0,1,1) выигрывает у одноклассовых `.steps__arrow--tablet { display:
     none }` (0,1,0) и ломает переключение картинок по брейкпойнту.
     Поэтому display/размеры задаются каждой картинке явно. */
  a {
    color: inherit;
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* Поп-ап поздравления шире мобильного вьюпорта (529px при 375) —
       обрезаем его здесь, чтобы не появлялся горизонтальный скролл. */
    overflow: hidden;
    min-height: 100vh;
    gap: 12px;
    padding: 24px 0;

    @include md-tablet {
      gap: 32px;
      padding: 32px;
    }

    /* На финальном экране логотип и поп-ап наезжают на следующий блок —
       в макете это отрицательные нижние отступы, а не gap. */
    &--congrats {
      gap: 0;

      .page__logo,
      .congrats {
        margin-bottom: -16px;

        @include md-tablet {
          margin-bottom: -40px;
        }
      }
    }
  }

  &__logo {
    flex-shrink: 0;
    width: 165.75px;
    height: 52px;
    line-height: 0;

    img {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
    }
  }
}

/* ---------- форма ---------- */

.auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  /* popup-wrapper из макета */
  padding: 0 24px;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  padding: 40px 24px;
  background: #eefbff;
  border-bottom: 8px solid #5cb0cf;
  border-radius: 32px;
  box-shadow:
    0 2px 1px 0 rgba(0, 0, 0, 0.25),
    0 19px 14px 0 rgba(0, 88, 119, 0.25),
    0 34px 25px 0 rgba(0, 88, 119, 0.25),
    0 44px 50px 0 rgba(0, 88, 119, 0.2);

  @include md-tablet {
    gap: 22px;
    width: auto;
    max-width: 100%;
    padding: 40px 56px 72px;
  }

  &__envelope {
    flex-shrink: 0;
    width: 110px;
    height: auto;

    @include md-tablet {
      width: 133px;
    }
  }

  &__title {
    width: 100%;
    font-weight: 900;
    font-size: 28px;
    line-height: 28px;
    text-align: center;
    color: #00bf73;

    @include md-tablet {
      font-size: 32px;
      line-height: 32px;
      max-width: 434px;
    }
  }
}

/* ---------- индикатор шагов ---------- */

.steps {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  @include md-tablet {
    flex-direction: row;
    gap: 12px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    font-size: 14px;
    line-height: 14px;
    color: #05b8f6;

    .steps__point {
      background: #05b8f6;
      color: #ffffff;
    }

    /* Активный шаг — синяя «таблетка» с белой точкой */
    &--active {
      padding: 8px 12px 8px 8px;
      border-radius: 99px;
      background: #05b8f6;
      color: #ffffff;

      .steps__point {
        background: #ffffff;
        color: #05b8f6;
      }
    }
  }

  &__point {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 99px;
    font-weight: 800;
    font-size: 14px;
    line-height: 14px;
  }

  &__arrow {
    flex-shrink: 0;
    height: 24px;
    border: 0;

    &--mobile {
      display: block;
      width: 14.7279px;

      @include md-tablet {
        display: none;
      }
    }

    &--tablet {
      display: none;
      width: 17.7261px;

      @include md-tablet {
        display: block;
      }
    }
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

  @include md-tablet {
    width: 434px;
    max-width: 100%;
  }

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
    color: #3c4267;

    &::placeholder {
      color: #b8b5c8;
    }

    &:focus {
      outline: none;
    }
  }

  /* Компенсирует ширину «глаза», чтобы значение оставалось по центру поля */
  &__input:not(:last-child) {
    padding-left: 26px;
  }

  &__eye {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 100%;
    padding: 0;
    appearance: none;
    border: 0;
    background: transparent;
    cursor: pointer;
    color: #b8b5c8;

    svg {
      width: 20px;
      height: 20px;
    }

    &:disabled {
      cursor: default;
      opacity: 0.6;
    }
  }

  &__error {
    width: 100%;
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    text-align: center;
    color: #ef2d74;
  }
}

/* ---------- согласие ---------- */

.legal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;

  @include md-tablet {
    gap: 4px;
  }

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
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 2px;
    width: 205px;
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    text-align: center;
    color: #767676;
    white-space: nowrap;

    @include md-tablet {
      flex-wrap: nowrap;
      width: auto;
    }

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

/* ---------- кнопка ---------- */

.btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 52px;
  padding: 0 32px;
  appearance: none;
  border: 0;
  border-bottom: 5px solid #017c2e;
  border-radius: 157px;
  background-image: linear-gradient(to top, #079d27 0%, #00a846 12.019%, #14ef6f 100%);
  box-shadow:
    0 2px 1px 0 rgba(0, 0, 0, 0.4),
    0 19px 14px -5px rgba(0, 0, 0, 0.25),
    0 34px 25px -11px rgba(0, 0, 0, 0.25),
    0 44px 50px 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
  overflow: hidden;

  @include md-tablet {
    height: 64px;
    padding: 0 40px;
    border-bottom-width: 8px;
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }

  /* Заливка надписи — вертикальный градиент из макета (белый → #c3ffdc) */
  &__label {
    font-family: inherit;
    font-weight: 900;
    font-size: 20px;
    line-height: 20px;
    text-align: center;
    color: #ffffff;
    background-image: linear-gradient(to bottom, #ffffff, #c3ffdc);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 2px 1px rgba(0, 0, 0, 0.01);

    @include md-tablet {
      font-size: 24px;
      line-height: 24px;
    }
  }

  &__spinner {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
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

.forgot {
  padding: 0;
  appearance: none;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
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

/* ---------- финальный экран ---------- */

.congrats {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 529px;
  height: 437px;

  @include md-tablet {
    width: 734px;
    height: 606px;
  }

  &__bg {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    object-fit: cover;
    pointer-events: none;
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 201px;

    @include md-tablet {
      gap: 16px;
      width: 244px;
      padding-top: 32px;
    }
  }

  &__title {
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
  }

  &__text {
    width: 100%;
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    text-align: center;
    color: #595959;

    @include md-tablet {
      font-size: 18px;
      line-height: 24px;
    }
  }

  &__badge {
    flex-shrink: 0;
    display: block;
    width: 130px;
    height: 43.455px;

    @include md-tablet {
      width: 160px;
      height: 53.483px;
    }

    img {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
    }
  }

  &__hint {
    width: 100%;
    font-weight: 900;
    font-size: 14px;
    line-height: 14px;
    text-align: center;
    color: #595959;
  }
}

/* ---------- футер ----------
   Тексты и ссылки — прежние; оформление подтянуто под макет: по центру,
   Nunito, белый 12px. */

.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: auto;
  padding: 24px;
  font-size: 12px;
  line-height: 12px;
  color: #ffffff;

  &__legacy,
  &__links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    width: 100%;
    text-align: center;
    white-space: nowrap;
  }

  &__legacy {
    gap: 4px;
    font-weight: 600;
  }

  &__legacy-title {
    font-weight: 900;
  }

  &__links {
    gap: 6px 14px;
    font-weight: 600;

    a {
      text-decoration: underline;
      text-decoration-skip-ink: none;
    }
  }
}
</style>
