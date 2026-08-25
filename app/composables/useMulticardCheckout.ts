const INVOICE_ENDPOINT = 'https://l1.amayasoft.uz/api/payment/multicard/invoice'

interface MulticardInvoice {
  invoiceId: string
  checkoutUrl: string
}

/**
 * Creates a Multicard invoice and sends the user to the payment gateway.
 *
 * The gateway itself brings the user back to `/payment-result?success=true|false`
 * (`return_url` / `return_error_url` are configured on the backend), so there is
 * nothing to handle here after the redirect.
 */
export function useMulticardCheckout() {
  const isPending = ref(false)
  const error = ref<string | null>(null)

  async function start() {
    if (isPending.value) return

    isPending.value = true
    error.value = null

    try {
      // `$fetch` throws on any non-2xx response, so no explicit `response.ok`
      // check is needed — both transport and HTTP errors land in `catch`.
      const invoice = await $fetch<MulticardInvoice>(INVOICE_ENDPOINT, { method: 'POST' })

      if (!invoice?.checkoutUrl) {
        throw new Error('Multicard invoice response contained no checkoutUrl')
      }

      // `isPending` intentionally stays `true`: the browser is navigating away,
      // and re-enabling the buttons here would only invite a second invoice.
      window.location.assign(invoice.checkoutUrl)
    } catch {
      error.value = 'Не удалось создать платёж. Попробуйте ещё раз.'
      isPending.value = false
    }
  }

  return { isPending, error, start }
}
