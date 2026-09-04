<script setup lang="ts">
/**
 * Экран «покупка прошла» (Figma: `Congrats Mobile` / `Congrats Desktop`).
 * Показывается в двух местах: сразу после входа, если бэкенд ответил
 * `already_purchased`, и после подтверждённой оплаты на /payment-result —
 * поэтому компонент, а не кусок страницы.
 *
 * Поп-ап в макете — картинка 655×541 (802×663 на планшете), обрезанная по
 * `cover`; текст лежит поверх неё колонкой шириной 248 (289). Все величины
 * взяты оттуда же.
 */
import congratsPopupBgPng from '~/assets/images/l1/png/congrats-popup-bg.png'
import appStoreBadgeSvg from '~/assets/images/l1/svg/appstore-badge.svg'

defineProps<{
  /** Ссылка на чек Multicard, если бэкенд её вернул. */
  receiptUrl?: string | null
}>()

const emit = defineEmits<{ appstore: [] }>()

/** Локальная привязка, а не прямое `L1_APP_STORE_URL` в шаблоне:
 *  автоимпорты Nuxt подставляются в `<script setup>`, и в шаблоне видны
 *  только через объявленную здесь переменную. */
const appStoreUrl = L1_APP_STORE_URL
</script>

<template>
  <div class="congrats">
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
        To‘lov muvaffaqiyatli amalga oshirildi! «Mashinalar» ilovasiga to‘liq kirish huquqini ochdingiz!
      </p>

      <!-- Ссылка открывается в новой вкладке, текущая страница остаётся
           живой — поэтому обычного fetch аналитики хватает, sendBeacon не нужен. -->
      <a
        class="congrats__badge"
        :href="appStoreUrl"
        target="_blank"
        rel="noopener"
        @click="emit('appstore')"
      >
        <img
          :src="appStoreBadgeSvg"
          alt="App Store"
        >
      </a>

      <div class="congrats__instruction">
        <p class="congrats__hint">
          Ilovani yuklab oling va o‘yindan zavqlaning!
        </p>
        <p>Yo‘riqnoma:</p>
        <p>Ilovani yuklab oling.</p>
        <p>Email va parolingiz orqali tizimga kiring.</p>
        <p>Tayyor! O‘ynang va maroqli vaqt o‘tkazing!</p>
      </div>

      <a
        v-if="receiptUrl"
        class="congrats__receipt"
        :href="receiptUrl"
        target="_blank"
        rel="noopener"
      >
        Chekni ochish
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss">
.congrats {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 655px;
  height: 541px;
  font-family: "Nunito", "Helvetica Neue", Arial, sans-serif;

  @include md-tablet {
    width: 802px;
    height: 663px;
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
    gap: 4px;
    width: 248px;
    padding-top: 32px;

    @include md-tablet {
      gap: 16px;
      width: 289px;
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

  /* На мобильном все строки идут одной колонкой с шагом 4; на планшете
     инструкция — отдельная группа, а между группами шаг 16. */
  &__instruction {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 100%;
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    text-align: center;
    color: #595959;
  }

  &__hint {
    font-weight: 900;
    font-size: 14px;
    line-height: 14px;

    @include md-tablet {
      font-size: 16px;
      line-height: 16px;
    }
  }

  &__receipt {
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;
    color: #0089b9;
    text-decoration: underline;
  }
}
</style>
