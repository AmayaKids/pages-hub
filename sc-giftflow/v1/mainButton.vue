<script lang="ts" setup>
import { useProcessStore } from '@/stores/processStore';

const processStore = useProcessStore();

const props = defineProps({
  variant: {
    type: String,
    required: false,
    default: 'primary',
  },
  process: {
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
    :class="[`page__button page__button--${props.variant}`, { 'page__button--is-loading': props.process } ]"
    :disabled="props.disabled || props.process"
    :readonly="props.disabled || props.process"
  >
    <!-- <span class="page__button-fake"></span> -->
    <span><slot /></span>
    <span :class="['page__button-spinner', { 'page__button-spinner--active': props.process }]" aria-hidden="true"></span>

    <svg class="page__decoration-mini" xmlns="http://www.w3.org/2000/svg" width="4" height="5" viewBox="0 0 4 5" fill="none">
      <path d="M3.00267 0.0774337C3.52479 0.400428 3.34255 1.64107 2.59563 2.84848C1.8487 4.05589 0.819933 4.77285 0.297811 4.44986C-0.224312 4.12686 -0.042073 2.88622 0.704852 1.67881C1.45178 0.471402 2.48054 -0.24556 3.00267 0.0774337Z" fill="white"/>
    </svg>

    <svg class="page__decoration-big" xmlns="http://www.w3.org/2000/svg" width="11" height="7" viewBox="0 0 11 7" fill="none">
      <path d="M10.5062 0.837709C11.125 2.07788 9.30169 4.24325 6.4338 5.67421C3.56591 7.10516 0.739396 7.25983 0.120605 6.01966C-0.498185 4.7795 1.32507 2.61412 4.19296 1.18317C7.06085 -0.24779 9.88737 -0.402457 10.5062 0.837709Z" fill="white"/>
    </svg>
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
      background: linear-gradient(0deg, #62B9B1 0%, #90C8C3 12.02%, #BBE5E2 100%);
      box-shadow: 0 18px 19px -10px rgba(0, 54, 69, 0.25), 0 7px 6px -5px rgba(0, 64, 69, 0.60);
    }

    @media (min-width: 1024px) {
      font-size: 20px;
      line-height: 20px;
      height: 52px;
      padding: 16px 32px;
    }

    &-fake {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      visibility: hidden
    }

    &-spinner {
      border-bottom-color: transparent;
      border-radius: 50%;
      display: inline-block;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
      visibility: hidden;

      &--active {
        visibility: visible;
        width: 12px;
        height: 12px;
        border: 2px solid #fff;
        border-bottom-color: transparent;
        margin-left: 8px;

        @media (min-width: 1024px) {
          width: 16px;
          height: 16px;
          border: 4px solid #fff;
          border-bottom-color: transparent;
        }
      }
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

  &__decoration {
    &-mini {
      position: absolute;
      left: 5.09px;
      top: 12.23px;
      width: 3.3px;
      height: 4.527px;
    }

    &-big {
      position: absolute;
      left: 9.147px;
      top: 4.458px;
      width: 10.627px;
      height: 6.857px;
    }
  }
}
</style>
