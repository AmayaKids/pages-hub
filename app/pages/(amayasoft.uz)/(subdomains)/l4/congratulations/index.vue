<script setup lang="ts">
import '~/assets/css/fonts/nunito.css'
import '~/assets/css/fonts/open-sans.css'

/* ------------------------------------------------------------------ *
 * Шаг 3 воронки l4 — покупка состоялась.
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

const { track, adoptIdentity } = useL4Mixpanel()
const { trackStandard, trackCustom, trackPageView } = useL4MetaPixel()

onMounted(() => trackPageView())

watch(confirmed, (isConfirmed) => {
  if (isConfirmed) track('landing_congratulation_screen')
})

onMounted(async () => {
  const ajwt = readL4Ajwt()
  const accountId = readL4AccountId()
  if (accountId) adoptIdentity(accountId)

  if (!ajwt) {
    await navigateTo('/auth', { replace: true })
    return
  }

  const invoiceId = readL4InvoiceId()

  // Инвойса нет — покупку нашли без него (`already_purchased` без UUID).
  // Проверять нечего, но и повода не верить нет: сюда приводит только
  // подтверждённый ответ биллинга.
  if (!invoiceId) {
    confirmed.value = true
    return
  }

  const status = await checkL4PaymentStatus(ajwt, invoiceId)

  if (status.status === 'purchased') {
    receiptUrl.value = status.receiptUrl ?? null
    fiscalReceiptUrl.value = status.fiscalReceiptUrl ?? null
    confirmed.value = true

    // Подстраховка для пути, где покупку раньше нас обнаружил не `/payment`
    // (см. l4/payment/index.vue → trackPurchase()), а сразу `prepareInvoice()`
    // через `already_purchased` — тогда Purchase там не улетал вообще.
    // `claimL4PurchaseTracking` общий для обеих страниц, так что событие всё
    // равно уйдёт ровно один раз на инвойс, с какой бы стороны его ни поймали.
    if (claimL4PurchaseTracking(invoiceId)) {
      trackStandard('Purchase', { value: status.price ?? L4_PRICE, currency: status.currency ?? L4_CURRENCY })
    }

    return
  }

  if (isL4AuthFailure(status.status)) {
    saveL4Ajwt('')
    clearL4Checkout()
    await navigateTo('/auth', { replace: true })
    return
  }

  // Оплата не подтверждена: место человека — на платёжном шаге, он там
  // и разберётся, ошибка это, ожидание или недоступная проверка.
  await navigateTo('/payment', { replace: true })
})
</script>

<template>
  <L4Shell variant="congrats">
    <L4Congrats
      v-if="confirmed"
      :receipt-url="receiptUrl"
      :fiscal-receipt-url="fiscalReceiptUrl"
      @appstore="track('landing_appstore_button_tap'); trackCustom('LandingAppstoreButtonTap')"
    />
  </L4Shell>
</template>
