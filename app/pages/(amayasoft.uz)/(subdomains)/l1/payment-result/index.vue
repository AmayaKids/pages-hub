<script setup lang="ts">
import '~/assets/css/fonts/nunito.css'

import logoSvg from '~/assets/images/l1/svg/logo.svg'
import carPng from '~/assets/images/l1/png/car.png'
import robotPng from '~/assets/images/l1/png/robot.png'

// The payment gateway returns the user here via `return_url` /
// `return_error_url`, which differ only by this flag. Anything other than an
// explicit `true` is treated as a failed payment.
const isSuccess = computed(() => useRoute().query.success === 'true')

useSeoMeta({
  title: () => (isSuccess.value ? 'Tabriklaymiz — Amaya Kids' : 'To‘lov amalga oshmadi — Amaya Kids'),
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div class="result">
    <header class="result__header">
      <img
        class="result__logo"
        :src="logoSvg"
        width="120"
        height="38"
        alt="Amaya Kids"
      >
    </header>

    <main class="result__main">
      <img
        class="result__pic"
        :src="isSuccess ? carPng : robotPng"
        width="152"
        height="123"
        alt=""
      >

      <h1 class="result__title">
        {{ isSuccess ? 'Tabriklaymiz!' : 'To‘lov amalga oshmadi' }}
      </h1>

      <p
        v-if="isSuccess"
        class="result__text"
        v-html="'<b>Mashinalar</b> ilovasiga to‘liq kirish huquqiga ega bo‘ldingiz!<br/>Ilovani yuklab oling va o‘yindan zavqlaning!'"
      />
      <p
        v-else
        class="result__text"
      >
        To‘lov yakunlanmadi. Pul mablag‘lari yechilmagan — qayta urinib ko‘rishingiz mumkin.
      </p>

      <NuxtLink
        class="result__btn"
        to="/"
      >
        {{ isSuccess ? 'Bosh sahifaga qaytish' : 'Qayta urinib ko‘rish' }}
      </NuxtLink>
    </main>
  </div>
</template>

<style scoped lang="scss">
/* Visual language mirrors the l1 landing (Nunito, blue header, green CTA)
   — see ../index.vue. Breakpoint mixins come from
   app/assets/css/breakpoints.scss and are injected globally by nuxt.config.ts. */

.result {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;

  &__header {
    display: flex;
    justify-content: center;
    padding: 16px;
    background: #05b8f6;

    @include md-tablet {
      justify-content: flex-start;
      padding: 24px 56px;
    }
  }

  &__logo {
    width: 120px;
    height: 38px;

    @include md-tablet {
      width: 166px;
      height: 52px;
    }
  }

  &__main {
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
  }

  &__pic {
    width: 152px;
    height: 123px;

    @include md-tablet {
      width: 220px;
      height: 178px;
    }
  }

  &__title {
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 900;
    font-size: 28px;
    line-height: 30px;
    color: #ff8800;

    @include md-tablet {
      font-size: 44px;
      line-height: 48px;
    }
  }

  &__text {
    max-width: 420px;
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    color: #3b4256;

    @include md-tablet {
      max-width: 560px;
      font-size: 20px;
      line-height: 28px;
    }
  }

  &__btn {
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
}
</style>
