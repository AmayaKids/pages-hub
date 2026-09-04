<script setup lang="ts">
/**
 * Футер лендинга l1 — один и тот же на всех его экранах (лендинг, /auth,
 * /payment-result), поэтому вынесен в компонент, а не продублирован.
 * Величины из макета (Figma: `Footer`): три группы с шагом 12, внутри
 * групп — 4, весь текст 12/12.
 *
 * `solid` — вариант с собственной подложкой: на лендинге футер отделён от
 * секции отзывов своим цветом, на остальных экранах он лежит прямо на синем
 * фоне страницы и подложка ему не нужна.
 *
 * Ссылок четыре, как в макете. `/legal/terms-of-use` пока отдаёт ошибку:
 * текста этого документа в репозитории ещё нет (см. l1/legal/[name]/index.vue)
 * — он добавляется отдельно от этой страницы.
 */
defineProps<{ solid?: boolean }>()
</script>

<template>
  <footer
    class="footer"
    :class="{ 'footer--solid': solid }"
  >
    <div class="footer__attr">
      <p class="footer__attr-name">
        «AMAYA SOFT», MChJ
      </p>
      <p>Toshkent shahri, Shayxontohur tumani, Navoiy ko‘chasi, 3-uy, 76 honadon</p>
      <p>STIR 305210613</p>
    </div>

    <nav class="footer__links">
      <NuxtLink to="/legal/public-offer">
        Ommaviy oferta
      </NuxtLink>
      <NuxtLink to="/legal/privacy-policy">
        Maxfiylik siyosati
      </NuxtLink>
      <NuxtLink to="/legal/terms-of-use">
        Foydalanish shartlari
      </NuxtLink>
      <NuxtLink to="/legal/refund-policy">
        To‘lovni qaytarish siyosati
      </NuxtLink>
    </nav>

    <p class="footer__legacy">
      <b>2026, Amaya Kids</b>
      <span>Barcha huquqlar himoyalangan</span>
    </p>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* На экранах воронки шаг между группами 8, на лендинге — 12 (Figma:
     `Footer` фреймов Email/Password и Main соответственно). */
  gap: 8px;
  width: 100%;
  padding: 24px;
  font-family: "Nunito", "Helvetica Neue", Arial, sans-serif;
  font-weight: 600;
  font-size: 12px;
  line-height: 12px;
  text-align: center;
  color: #ffffff;

  &--solid {
    gap: 12px;
    background: #00aeea;
  }

  &__attr {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    width: 100%;
  }

  &__attr-name {
    font-weight: 900;
  }

  &__links {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    /* В макете ссылки идут одной строкой с шагом 4 и переносятся, когда не
       помещаются; на 375 четвёртая уходит на вторую строку. */
    gap: 4px;
    width: 100%;

    a {
      color: inherit;
      text-decoration: underline;
      text-decoration-skip-ink: none;
    }
  }

  &__legacy {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;

    b {
      font-weight: 900;
    }
  }
}
</style>
