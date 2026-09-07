<script setup lang="ts">
import '~/assets/css/fonts/nunito.css'
import '~/assets/css/fonts/open-sans.css'

/* ------------------------------------------------------------------ *
 * Шаг 3 воронки l1 — покупка состоялась.
 *
 * Отдельный адрес, а не состояние `/payment`: экран должен переживать
 * перезагрузку и возврат по ссылке. Поэтому покупка здесь перепроверяется
 * у биллинга — заодно оттуда же приходят квитанция и фискальный чек.
 * Если подтверждения нет, человека возвращает на тот шаг, где он на самом
 * деле находится.
 * ------------------------------------------------------------------ */

useSeoMeta({
  title: 'Tabriklaymiz — Amaya Kids',
  robots: 'noindex, nofollow'
})

const confirmed = ref(false)
const receiptUrl = ref<string | null>(null)
const fiscalReceiptUrl = ref<string | null>(null)

const { track, adoptIdentity } = useL1Mixpanel()
const { trackCustom, trackPageView } = useL1MetaPixel()

onMounted(() => trackPageView())

watch(confirmed, (isConfirmed) => {
  if (isConfirmed) track('landing_congratulation_screen')
})

onMounted(async () => {
  const ajwt = readL1Ajwt()
  const accountId = readL1AccountId()
  if (accountId) adoptIdentity(accountId)

  if (!ajwt) {
    await navigateTo('/auth', { replace: true })
    return
  }

  const invoiceId = readL1InvoiceId()

  // Инвойса нет — покупку нашли без него (`already_purchased` без UUID).
  // Проверять нечего, но и повода не верить нет: сюда приводит только
  // подтверждённый ответ биллинга.
  if (!invoiceId) {
    confirmed.value = true
    return
  }

  const status = await checkL1PaymentStatus(ajwt, invoiceId)

  if (status.status === 'purchased') {
    receiptUrl.value = status.receiptUrl ?? null
    fiscalReceiptUrl.value = status.fiscalReceiptUrl ?? null
    confirmed.value = true
    return
  }

  if (isL1AuthFailure(status.status)) {
    saveL1Ajwt('')
    clearL1Checkout()
    await navigateTo('/auth', { replace: true })
    return
  }

  // Оплата не подтверждена: место человека — на платёжном шаге, он там
  // и разберётся, ошибка это, ожидание или недоступная проверка.
  await navigateTo('/payment', { replace: true })
})
</script>

<template>
  <L1Shell variant="congrats">
    <L1Congrats
      v-if="confirmed"
      :receipt-url="receiptUrl"
      :fiscal-receipt-url="fiscalReceiptUrl"
      @appstore="track('landing_appstore_button_tap'); trackCustom('LandingAppstoreButtonTap')"
    />
  </L1Shell>
</template>
