<script setup lang="ts">
import '~/assets/css/fonts/nunito.css'
import '~/assets/css/fonts/open-sans.css'

import logoSvg from '~/assets/images/l1/svg/logo.svg'
import carPng from '~/assets/images/l1/png/car.png'
import robotPng from '~/assets/images/l1/png/robot.png'
import starPng from '~/assets/images/l1/png/star.png'

useSeoMeta({
  title: 'Ro‘yxatdan o‘tish — Amaya Kids'
})

// MOCK: validation/UX logic ported from sc-giftflow/v1 (stepAuth.vue +
// stepSignup.vue + mainInput.vue + mainLegalCheckbox.vue + mainCheckbox.vue).
//
// Kept from the original: email is not enough to land on the congrats screen
// — there's always a password step in between (in sc-giftflow this is where
// checkEmailExist() decides signup vs. signin; here, with no backend to check
// against, every submission is treated as a new signup). Skipping straight
// from "typed an email" to "you're in" was the actual bug — there was no
// password step at all, so nothing was really being authorized.
//
// There's no real submit endpoint yet (sc-giftflow's posts to a different
// app's account API, which doesn't apply to this site) — submitting the
// password just advances the local `step`. Wire up the real one when it exists.
const step = ref<'email' | 'password' | 'congrats'>('email')

const email = ref('')
const emailTouched = ref(false)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const emailError = computed(() => emailTouched.value && !EMAIL_REGEX.test(email.value))

const legal = ref(false)
const legalError = ref(false)

const canSubmitEmail = computed(() => EMAIL_REGEX.test(email.value) && legal.value)

function onEmailBlur() {
  emailTouched.value = true
}

function submitEmail() {
  if (!legal.value) {
    legalError.value = true
    return
  }

  emailTouched.value = true
  if (!EMAIL_REGEX.test(email.value)) return

  step.value = 'password'
}

// Same password rule as sc-giftflow/v1's `fields.password.regex`.
const password = ref('')
const passwordTouched = ref(false)
const PASSWORD_REGEX = /^[A-Za-z0-9_]{6,128}$/
const passwordError = computed(() => passwordTouched.value && !PASSWORD_REGEX.test(password.value))

const canSubmitPassword = computed(() => PASSWORD_REGEX.test(password.value))

function onPasswordBlur() {
  passwordTouched.value = true
}

function submitPassword() {
  passwordTouched.value = true
  if (!PASSWORD_REGEX.test(password.value)) return

  step.value = 'congrats'
}

// Decorative sparkles on the congrats screen — see ../payment-result/index.vue,
// same treatment (no real asset for this, hand-placed to roughly match the design).
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
      <!-- Shared steps indicator: step 1 while entering the email, step 2
           while entering the password — matches sc-giftflow/v1's
           `page__steps` (only the arrow orientation differs, see below). -->
      <div
        v-if="step === 'email' || step === 'password'"
        class="card"
      >
        <div class="steps">
          <div :class="['steps__item', { 'steps__item--active': step === 'email' }]">
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
          <div :class="['steps__item', { 'steps__item--active': step === 'password' }]">
            <span class="steps__number">2</span>
            <span class="steps__text">Bepul kirish</span>
          </div>
        </div>

        <!-- Step 1: email + legal consent -->
        <template v-if="step === 'email'">
          <h1 class="card__title">
            Ro‘yxatdan o‘ting, yuklab oling va o‘ynang!
          </h1>

          <p class="card__label">
            Emailni kiriting.
          </p>

          <div class="field">
            <input
              v-model="email"
              type="email"
              class="field__input"
              :class="{ 'field__input--error': emailError }"
              placeholder="Email"
              autocomplete="email"
              @blur="onEmailBlur"
            >
          </div>

          <label
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
            :disabled="!canSubmitEmail"
            @click="submitEmail"
          >
            Davom etish
          </button>
        </template>

        <!-- Step 2: password — this is the step that was missing entirely;
             without it there was nothing to actually authorize. -->
        <template v-else>
          <h1 class="card__title">
            Parol o‘ylab toping
          </h1>

          <p class="card__label">
            Kamida 6 ta belgi: harflar, raqamlar yoki pastki chiziqcha.
          </p>

          <div class="field">
            <input
              v-model="password"
              type="password"
              class="field__input"
              :class="{ 'field__input--error': passwordError }"
              placeholder="Parol"
              autocomplete="new-password"
              @blur="onPasswordBlur"
            >
          </div>

          <button
            class="btn card__btn"
            type="button"
            :disabled="!canSubmitPassword"
            @click="submitPassword"
          >
            Yuborish
          </button>
        </template>
      </div>

      <!-- Step 3: congrats — same treatment as ../payment-result/index.vue -->
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
              No real App Store id for "Mashinalar" exists yet in useAppsInfo()
              (only 'farm' is registered) — href is a placeholder. Badge image
              is the English Apple artwork already in the repo; the design
              shows the Russian-localized one, which isn't in the repo.
              See ../payment-result/index.vue for the same caveat.
            -->
          <a
            class="plaque__appstore"
            href="#"
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
/* Visual language mirrors l1/l2 (Nunito, blue header/footer) — see
   ../index.vue. Breakpoint mixins come from app/assets/css/breakpoints.scss
   and are injected globally by nuxt.config.ts. */

/* No `.page` card frame here on purpose — unlike l1/l2, this page is a
   single solid-blue field top to bottom (header, card, footer all share it),
   not a floating white card on a lighter backdrop. */
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
}

/* ---------- auth section ---------- */

.auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;

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

/* ---------- step 1: registration card ---------- */

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

.card__title {
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

.card__label {
  font-family: "Open Sans", Arial, sans-serif;
  font-weight: 600;
  font-size: 14px;
  text-align: center;
  color: #3c4267;
}

.field {
  &__input {
    display: block;
    width: 100%;
    height: 44px;
    padding: 0 16px;
    border: 2px solid #d7dbe8;
    border-radius: 14px;
    background: #fbfaff;
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
      border-color: #9c99ab;
    }

    &--error {
      border-color: #ef2d74;
    }
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
  }
}

.card__btn {
  align-self: center;
  margin-top: 4px;
}

/* ---------- step 2: congrats plaque (mirrors ../payment-result/index.vue) ---------- */

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
   No distinct background here (unlike l1/l2's #33cbff band) — it sits on
   the same solid blue as the rest of the page, per design. */

.footer {
  width: 100%;
  padding: 28px 20px;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 20px;
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
