<script setup lang="ts">
/**
 * Зелёная кнопка экранов воронки (Figma: `.PW buttons`).
 *
 * `size` повторяет две величины надписи из макета: на шагах аккаунта она
 * 20px на мобильном и 24px на планшете, на платёжных экранах — 24px уже на
 * мобильном. Геометрия кнопки при этом одна и та же.
 */
withDefaults(defineProps<{
  label: string
  /** Показывает спиннер и блокирует кнопку. */
  pending?: boolean
  disabled?: boolean
  size?: 'md' | 'lg'
}>(), {
  pending: false,
  disabled: false,
  size: 'md'
})
</script>

<template>
  <button
    class="btn"
    :class="[`btn--${size}`]"
    type="button"
    :disabled="disabled || pending"
  >
    <span class="btn__label">{{ label }}</span>
    <span
      v-if="pending"
      class="btn__spinner"
      aria-hidden="true"
    />
  </button>
</template>

<style scoped lang="scss">
.btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 52px;
  padding: 0 40px;
  appearance: none;
  border: 0;
  border-bottom: 8px solid #017c2e;
  border-radius: 157px;
  background-image: linear-gradient(to top, #079d27 0%, #00a846 12%, #14ef6f 100%);
  box-shadow:
    0 2px 1px 0 rgba(0, 0, 0, 0.4),
    0 19px 14px -5px rgba(0, 0, 0, 0.25),
    0 34px 25px -11px rgba(0, 0, 0, 0.25),
    0 44px 50px 0 rgba(0, 0, 0, 0.2);
  cursor: pointer;
  overflow: hidden;

  @include md-tablet {
    height: 64px;
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }

  /* Заливка надписи — вертикальный градиент из макета (белый → #c3ffdc).
     Тень задана `filter`, а не `text-shadow`: при `background-clip: text`
     сама буква прозрачна, и `text-shadow` рисовался бы сквозь неё. */
  &__label {
    font-family: "Nunito", "Helvetica Neue", Arial, sans-serif;
    font-weight: 900;
    font-size: 20px;
    line-height: 20px;
    text-align: center;
    color: #ffffff;
    background-image: linear-gradient(to bottom, #ffffff, #c3ffdc);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 2px 1px rgba(0, 0, 0, 0.2));

    @include md-tablet {
      font-size: 24px;
      line-height: 24px;
    }
  }

  &--lg &__label {
    font-size: 24px;
    line-height: 24px;
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
</style>
