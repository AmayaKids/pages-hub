<script setup lang="ts">
/**
 * Индикатор трёх шагов покупки: аккаунт → оплата → установка приложения.
 *
 * В макете две разные раскладки, а не одна масштабируемая:
 *   • мобильная (375) — кружки 32px с подписью снизу, соединённые линией,
 *     которая проходит под ними на всю ширину блока (Figma: `progress`
 *     H gap 18, абсолютная `Line 1` 2px #cff3ff по центру кружков);
 *   • планшет и шире (1024) — «таблетки» с подписью справа от кружка и
 *     стрелками между ними (Figma: `progress` H gap 12).
 *
 * Подписи в мобильной раскладке разбиты по словам в столбик — так они
 * набраны в макете (`Akkaunt\nyaratish`), а на планшете те же слова идут
 * строкой. Поэтому каждое слово — отдельный элемент, а не один текст с
 * переносом: одну и ту же строку иначе не получилось бы разложить обоими
 * способами.
 */
import stepsArrowSvg from '~/assets/images/l1/svg/steps-arrow.svg'

const props = defineProps<{
  /** Номер текущего шага: 1 — аккаунт, 2 — оплата, 3 — установка. */
  active: 1 | 2 | 3
}>()

const STEPS = [
  'Akkaunt yaratish',
  'To‘lov',
  'Ilovani o‘rnatish'
]

const items = computed(() => STEPS.map((label, index) => ({
  words: label.split(' '),
  number: index + 1,
  isActive: index + 1 === props.active
})))
</script>

<template>
  <div class="steps">
    <template
      v-for="(item, index) in items"
      :key="item.number"
    >
      <img
        v-if="index > 0"
        class="steps__arrow"
        :src="stepsArrowSvg"
        alt=""
      >

      <div
        class="steps__item"
        :class="{ 'steps__item--active': item.isActive }"
      >
        <span class="steps__point">{{ item.number }}</span>
        <span class="steps__label">
          <span
            v-for="word in item.words"
            :key="word"
          >{{ word }}</span>
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.steps {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 18px;
  font-family: "Nunito", "Helvetica Neue", Arial, sans-serif;

  /* Соединительная линия проходит на всю ширину блока, поэтому у крайних
     шагов выходит за кружки — ровно как нарисовано. */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 15px;
    height: 2px;
    background: #cff3ff;
  }

  @include md-tablet {
    align-items: center;
    gap: 12px;

    &::before {
      content: none;
    }
  }

  &__arrow {
    display: none;

    @include md-tablet {
      display: block;
      flex-shrink: 0;
      /* Экспорт из Figma шире самой стрелки на скруглённые концы обводки
         (18 против 15.73 у ноды), поэтому лишнее снимается полями — так
         и стрелка остаётся в своём размере, и шаг между «таблетками»
         совпадает с макетом. */
      width: 18px;
      height: 24px;
      margin: 0 -1.135px;
      border: 0;
    }
  }

  &__item {
    position: relative;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    @include md-tablet {
      flex-direction: row;
      align-items: center;
      gap: 8px;
      padding: 8px 12px 8px 8px;
      border-radius: 99px;
      background: #cff3ff;
    }
  }

  &__point {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 99px;
    background: #cff3ff;
    font-weight: 800;
    font-size: 14px;
    line-height: 14px;
    color: #05b8f6;

    @include md-tablet {
      width: 20px;
      height: 20px;
      background: #05b8f6;
      color: #ffffff;
    }
  }

  &__label {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-weight: 800;
    font-size: 14px;
    line-height: 14px;
    text-align: center;
    color: #05b8f6;

    @include md-tablet {
      flex-direction: row;
      /* Расстояние между словами вместо пробела: в столбик слова стоят
         вплотную, поэтому пробел в разметке был бы лишним. */
      gap: 4px;
      white-space: nowrap;
    }
  }

  &__item--active {
    .steps__point {
      background: #05b8f6;
      color: #ffffff;

      @include md-tablet {
        background: #ffffff;
        color: #05b8f6;
      }
    }

    @include md-tablet {
      background: #05b8f6;

      .steps__label {
        color: #ffffff;
      }
    }
  }
}
</style>
