<script setup lang="ts">
/**
 * Белая карточка экранов воронки (Figma: `popup`).
 *
 * Заголовки, форма и кнопки внутри — содержимое слота, а значит и
 * оформляются стилями самой страницы: слот компилируется в области
 * видимости родителя, поэтому его `scoped`-стили до этого содержимого
 * достают.
 */
</script>

<template>
  <div class="card-wrapper">
    <div class="card">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
/* Значения из макета: mobile `popup` 327×… (375 минус 24 по бокам),
   tablet+ — ширина по содержимому (её задаёт ряд шагов, 596 в макете). */
.card-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 24px;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  /* Нижняя кромка 8px в макете лежит внутри 40px отступа (Figma рисует
     обводку внутрь фрейма), поэтому в CSS отступ уменьшен на её толщину —
     иначе карточка стала бы на 8px выше. */
  padding: 40px 24px 32px;
  background: #eefbff;
  border-bottom: 8px solid #5cb0cf;
  border-radius: 32px;
  box-shadow:
    0 2px 1px 0 rgba(0, 0, 0, 0.25),
    0 19px 14px -5px rgba(0, 88, 119, 0.25),
    0 34px 25px -11px rgba(0, 88, 119, 0.25),
    0 44px 50px 0 rgba(0, 88, 119, 0.2);

  @include md-tablet {
    gap: 22px;
    /* Ширина из макета: её задаёт ряд шагов (484.45) плюс отступы по 56.
       Фиксированная, а не по содержимому: `fit-content` растянул бы
       карточку по самой длинной строке заголовка, и тот перестал бы
       переноситься на две строки, как нарисовано. */
    width: 596.45px;
    max-width: 100%;
    padding: 40px 56px 64px;
  }
}
</style>
