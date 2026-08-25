<script setup lang="ts">
import '~/assets/css/fonts/nunito.css'
import '~/assets/css/fonts/open-sans.css'

import logoSvg from '~/assets/images/l1/svg/logo.svg'
import carPng from '~/assets/images/l1/png/car.png'
import robotPng from '~/assets/images/l1/png/robot.png'
import starPng from '~/assets/images/l1/png/star.png'

// The payment gateway returns the user here via `return_url` /
// `return_error_url`, which differ only by this flag. Anything other than an
// explicit `true` is treated as a failed payment.
const isSuccess = computed(() => useRoute().query.success === 'true')

useSeoMeta({
  title: () => (isSuccess.value ? 'Tabriklaymiz — Amaya Kids' : 'To‘lov amalga oshmadi — Amaya Kids'),
  robots: 'noindex, nofollow'
})

// Decorative sparkles scattered around the congrats plaque — hand-placed to
// roughly match the design, not pulled from a real asset (there isn't one).
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
  <div class="result">
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
      class="result__main"
      :class="{ 'result__main--success': isSuccess }"
    >
      <template v-if="isSuccess">
        <div
          class="result__sparkles"
          aria-hidden="true"
        >
          <svg
            v-for="(s, i) in sparkles"
            :key="i"
            class="result__sparkle"
            :style="{ top: s.top, left: s.left, right: s.right, width: `${s.size}px`, height: `${s.size}px` }"
            viewBox="0 0 24 24"
          >
            <path
              fill="#ffffff"
              d="M12 0c0 6.6-5.4 12-12 12 6.6 0 12 5.4 12 12 0-6.6 5.4-12 12-12-6.6 0-12-5.4-12-12Z"
            />
          </svg>
        </div>

        <div class="result__plaque">
          <h1 class="result__title">
            Tabriklaymiz!
          </h1>

          <p
            class="result__text"
            v-html="'<b>Mashinalar</b> ilovasiga to‘liq kirish huquqiga ega bo‘ldingiz!'"
          />

          <!--
            No real App Store id for the "Mashinalar" app exists yet in
            useAppsInfo() (only 'farm' is registered) — href is a placeholder
            until that's supplied. Badge image is the English Apple artwork
            already in the repo (public/assets/images/a/letter/farm/appstore.png);
            the design shows the Russian-localized badge, which isn't in the repo.
          -->
          <a
            class="result__appstore"
            href="https://apps.apple.com/app/kids-car-games-police-car-fun/id1442848046"
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

          <p class="result__hint">
            Ilovani yuklab oling va o‘yindan zavqlaning!
          </p>

          <img
            class="result__robot"
            :src="robotPng"
            width="90"
            height="53"
            alt=""
          >
          <img
            class="result__car"
            :src="carPng"
            width="104"
            height="84"
            alt=""
          >
        </div>
      </template>

      <template v-else>
        <img
          class="result__pic"
          :src="robotPng"
          width="152"
          height="123"
          alt=""
        >

        <h1 class="result__title result__title--fail">
          To‘lov amalga oshmadi
        </h1>

        <p class="result__text result__text--fail">
          To‘lov yakunlanmadi. Pul mablag‘lari yechilmagan — qayta urinib ko‘rishingiz mumkin.
        </p>

        <NuxtLink
          class="result__btn"
          to="/"
        >
          Qayta urinib ko‘rish
        </NuxtLink>
      </template>
    </main>

    <!-- Footer — same as the l1 landing, see ../index.vue -->
    <footer class="footer">
      <div class="footer__company">
        <p>«AMAYA SOFT», MChJ</p>
        <p>Toshkent shahri, Shayxontohur tumani, Navoiy ko‘chasi, 3-uy, 76 honadon</p>
        <p>STIR 305210613</p>
        <p>2026, Amaya Kids</p>
        <p>Barcha huquqlar himoyalangan</p>
      </div>

      <nav class="footer__links">
        <NuxtLink to="/legal/public-offer">
          Ommaviy oferta
        </NuxtLink>
        <NuxtLink to="/legal/privacy-policy">
          Maxfiylik siyosati
        </NuxtLink>
        <NuxtLink to="/legal/refund-policy">
          To‘lovni qaytarish siyosati
        </NuxtLink>
      </nav>
    </footer>
  </div>
</template>

<style scoped lang="scss">
/* Visual language mirrors the l1 landing (Nunito, blue header, footer)
   — see ../index.vue. Breakpoint mixins come from
   app/assets/css/breakpoints.scss and are injected globally by nuxt.config.ts. */

.result {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
}

/* ---------- header (identical to l1's) ---------- */

.header {
  background: #05b8f6;
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
    text-decoration: none;

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

.result__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 24px 56px;
  text-align: center;

  @include md-tablet {
    gap: 24px;
    padding: 64px 56px;
  }

  &--success {
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

.result__sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.result__sparkle {
  position: absolute;
}

.result__plaque {
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
}

.result__appstore {
  display: inline-flex;

  img {
    width: 160px;
    height: auto;

    @include md-tablet {
      width: 200px;
    }
  }
}

.result__hint {
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 800;
  font-size: 14px;
  line-height: 18px;
  color: #3b4256;

  @include md-tablet {
    font-size: 16px;
    line-height: 20px;
  }
}

.result__robot {
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

.result__car {
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

.result__pic {
  width: 152px;
  height: 123px;

  @include md-tablet {
    width: 220px;
    height: 178px;
  }
}

.result__title {
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 900;
  font-size: 26px;
  line-height: 30px;
  color: #079d27;

  @include md-tablet {
    font-size: 34px;
    line-height: 38px;
  }

  &--fail {
    color: #ff8800;
    font-size: 28px;

    @include md-tablet {
      font-size: 44px;
      line-height: 48px;
    }
  }
}

.result__text {
  max-width: 420px;
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  color: #3b4256;

  @include md-tablet {
    max-width: 560px;
    font-size: 19px;
    line-height: 26px;
  }

  &--fail {
    @include md-tablet {
      font-size: 20px;
      line-height: 28px;
    }
  }
}

.result__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 28px;
  border-bottom: 6px solid #017c2e;
  border-radius: 120px;
  -webkit-border-radius: 120px;
  background-color: #079d27;
  background-image: linear-gradient(to top, #079d27 0%, #00a846 12%, #14ef6f 100%);
  box-shadow: 0 2px 1px rgba(0, 0, 0, 0.4), 0 19px 14px -5px rgba(0, 0, 0, 0.25);
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 900;
  font-size: 18px;
  line-height: 24px;
  color: #ffffff;
  text-shadow: 0 2px 1px rgba(0, 0, 0, 0.2);

  @include md-tablet {
    height: 64px;
    padding: 0 40px;
    font-size: 24px;
  }
}

/* ---------- footer (identical to l1's) ---------- */

.footer {
  width: 100%;
  background: #33cbff;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;

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
    font-size: 14px;
    line-height: 20px;
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
