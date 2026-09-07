<script setup lang="ts">
/**
 * Прежний адрес возврата с Multicard.
 *
 * Платёжный шаг воронки живёт теперь на `/payment` — у него собственная
 * запись в истории браузера, чтобы кнопка «назад» со шлюза возвращала на
 * экран оплаты, а не в начало регистрации. Здесь остался только перевод
 * старых ссылок на новый адрес, чтобы уже настроенные на бэкенде
 * `return_url` продолжали работать, пока их не поменяли на
 * `/payment?success=…`.
 */
const route = useRoute()

// `success` у шлюза строковый; всё, что не явное `false`, считаем успехом —
// настоящий статус всё равно перепроверяется на `/payment` у биллинга.
const success = String(route.query.success ?? 'true') === 'false' ? 'false' : 'true'
const invoiceId = String(route.query.invoiceId ?? '')

await navigateTo({
  path: '/payment',
  query: {
    success,
    ...(invoiceId ? { invoiceId } : {})
  }
}, { replace: true, redirectCode: 302 })
</script>

<template>
  <div />
</template>
