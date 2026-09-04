<script setup lang="ts">
/**
 * Общая рамка экранов воронки l1 (/auth и /payment-result): синий фон,
 * логотип сверху, футер снизу, содержимое — слотом.
 *
 * Все величины из макета (Figma: `wrapper` фреймов Email/Password/Payment/
 * Congrats). Карточка в макете стоит по центру свободной высоты между
 * логотипом и футером — отсюда `flex: 1` на средней части.
 *
 * `variant="congrats"` — отдельная геометрия поздравления: там логотип
 * крупнее, а поп-ап специально наезжает на соседей (в макете это
 * отрицательный `gap`, −16 на мобильном и −40 на планшете).
 */
import logoSvg from '~/assets/images/l1/svg/logo.svg'

withDefaults(defineProps<{ variant?: 'default' | 'congrats' }>(), {
  variant: 'default'
})
</script>

<template>
  <div class="shell">
    <L2TesterBanner />

    <div
      class="shell__wrapper"
      :class="{ 'shell__wrapper--congrats': variant === 'congrats' }"
    >
      <NuxtLink
        class="shell__logo"
        to="/"
      >
        <img
          :src="logoSvg"
          width="166"
          height="52"
          alt="Amaya Kids"
        >
      </NuxtLink>

      <div class="shell__body">
        <slot />
      </div>

      <L1Footer />
    </div>
  </div>
</template>

<style scoped lang="scss">
.shell {
  min-height: 100vh;
  background: #05b8f6;
  font-family: "Nunito", "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;

  a {
    color: inherit;
  }

  &__wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* Поздравительный поп-ап шире мобильного вьюпорта — обрезаем здесь,
       чтобы не появлялся горизонтальный скролл. */
    overflow: hidden;
    min-height: 100vh;
    gap: 12px;
    padding: 24px 0;

    @include md-tablet {
      gap: 32px;
      padding: 32px;
    }
  }

  &__logo {
    flex-shrink: 0;
    width: 127.5px;
    height: 40px;
    line-height: 0;

    img {
      display: block;
      width: 100%;
      height: 100%;
      border: 0;
    }

    @include md-tablet {
      width: 165.75px;
      height: 52px;
    }
  }

  /* На мобильном карточка идёт сразу под логотипом (в макете содержимое
     там выше экрана и просто прокручивается), а на планшете и шире — растёт
     на всю свободную высоту и центрируется в ней, как в десктопном фрейме. */
  &__body {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;

    @include md-tablet {
      flex: 1 1 auto;
    }
  }

  :deep(.footer) {
    margin-top: auto;
  }

  &__wrapper--congrats {
    .shell__logo {
      width: 165.75px;
      height: 52px;
    }

    /* `gap` не бывает отрицательным — наезд задаём отступами соседей. */
    .shell__body {
      margin-top: -28px;
      margin-bottom: -28px;
    }

    @include md-tablet {
      .shell__body {
        margin-top: -72px;
        margin-bottom: -72px;
      }
    }
  }
}
</style>
