<script lang="ts" setup>
import { useProcessStore } from '@/stores/processStore';

const processStore = useProcessStore();

const props = defineProps({
  variant: {
    type: String,
    required: false,
    default: 'primary',
  },
  pending: {
    type: Boolean,
    required: false,
  },
  disabled: {
    type: Boolean,
    required: false,
  },
});
</script>

<template>
  <button
    :class="[`page__button page__button--${props.variant}`, { 'page__button--is-loading': props.pending } ]"
    :disabled="props.disabled || processStore.process"
    :readonly="props.disabled || processStore.process"
  >
    <span v-if="props.pending" class="page__button-spinner" aria-hidden="true"></span>
    <slot v-else />
  </button>
</template>

<style lang="scss" scoped>
button {
  display: inline-block;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  text-align: inherit;
  color: inherit;
  box-shadow: none;
  text-transform: none;
  cursor: default;

  &:focus,
  &:hover,
  &:active,
  &:visited,
  &:disabled {
    outline: none;
  }
}

.page {
  &__button {
    display: flex;
    align-items: center;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: .15s;
    position: relative;
    text-align: center;
    text-transform: uppercase;
    transition: .25s;
    box-sizing: border-box;

    height: 40px;
    padding: 16px 24px;
    border-radius: 24px;
    background: linear-gradient(0deg, #079D27 0%, #00A846 12.02%, #14E66C 100%);
    box-shadow: 0 18px 19px -10px rgba(0, 69, 15, 0.25), 0 7px 6px -5px #00450F;
    font-size: 14px;
    line-height: 14px;
    font-weight: 900;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);

    font-family: 'Nunito Var', 'Open Sans Var', Arial, sans-serif;

    &:disabled {
      background: linear-gradient(0deg, #2b6538 0%, #3c7654 12.02%, #69c08d 100%);
    }

    @media (min-width: 1024px) {
      font-size: 20px;
      line-height: 20px;
      height: 52px;
      padding: 16px 32px;
    }

    &-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #fff;
      border-bottom-color: transparent;
      border-radius: 50%;
      display: inline-block;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
    }

    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      
      100% {
        transform: rotate(360deg);
      }
    }
  }
}
</style>
