<script setup lang="ts">
/**
 * Виден только тому, у кого в localStorage стоит метка тестировщика (см.
 * useQaTester.ts) — обычным посетителям не показывается вообще.
 * Смысл — дать тестировщику понять, что он опознан и его действия помечены
 * в аналитике отдельно, реальную статистику не портят; если баннер не
 * появился — метка не сработала, и на проде лучше не тестировать.
 */
const { isTester, testerName } = useQaTester()
</script>

<template>
  <div
    v-if="isTester"
    class="l2-tester-banner"
  >
    🧪 Режим тестировщика: {{ testerName }} — события помечены, реальную аналитику не портят
  </div>
</template>

<style scoped>
.l2-tester-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  padding: 6px 12px;
  background: #ffcc00;
  color: #1a1a1a;
  font: 600 13px/1.4 system-ui, Arial, sans-serif;
  text-align: center;
}
</style>
