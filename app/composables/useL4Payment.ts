/**
 * Боевая покупка для лендинга l4 (l4.amayasoft.uz).
 *
 * l4 — буквальная копия l1 (app/composables/useL1Payment.ts): тот же товар,
 * тот же биллинг, та же логика инвойса/статуса. Отдельный файл, а не прямое
 * переиспользование useL1Payment.ts — по той же причине, что и у остальных
 * пар лендингов в проекте: свой localStorage (свой origin) и свой набор
 * функций, названный под конкретный домен, а не потому что поведение
 * должно отличаться от l1.
 *
 * Здесь только транспорт и хранилище: экранами и шагами владеет сама
 * страница `l4/auth`.
 */

/** Публичный API аккаунтов — тот же, что у l1/l2/l3. */
export const L4_ACCOUNTS_API = 'https://my.amayasoft.uz/api/public'

/**
 * Биллинг cars2. Домен чужой лендингу, поэтому запросы кросс-доменные —
 * origin лендинга должен быть в белом списке AGS, иначе на инвойс придёт
 * `forbidden`.
 */
export const L4_PAYMENT_API = 'https://cars2.ags.amayakids.com/api/client/billing/multicard'

/** gameId аккаунтов (Auth). Биллинг внутри себя пользуется своим (14) —
 *  с фронта его передавать не нужно. */
export const L4_GAME_ID = 15

export const L4_LANGUAGE = 'uz'
export const L4_COUNTRY = 'Uzbekistan'

// `var1` — l2, `var2` — l1, `var3` — l3. l4 продолжает нумерацию по той же
// схеме — бэк это значение не подтверждал, поправить при необходимости.
export const L4_EXPERIMENT = 'UA_Cars2_var4'

/** Платный пожизненный доступ — единственный товар этого лендинга. */
export const L4_PRODUCT_ID = 'com.amayasoft.cars2.ua.landing.lifetime.paid'

/** Тот же товар, но тестовый — чтобы прогон реального платёжного флоу на
 *  проде тестировщиком (см. useQaTester.ts, `?tester=`) не создавал настоящий
 *  инвойс в Multicard и не портил биллинговую аналитику. Отображение
 *  (цена, копирайт) не меняется — подменяется только то, что уходит в тело
 *  запроса к биллингу.
 *
 *  Сейчас равен боевому productId — как и в useL1Payment.ts, тестовый товар
 *  с суффиксом `.test` на бэке ещё не заведён (см. историю useL1Payment.ts:
 *  suffix отключили обратно после того, как AGS не узнал такой productId).
 *  Когда его заведут на бэке — здесь и там нужно поменять синхронно. */
export const L4_PRODUCT_ID_TEST = 'com.amayasoft.cars2.ua.landing.lifetime.paid'

/** Кто тестировщик — та же метка, что и в остальной аналитике лендинга. */
function resolveL4ProductId(): string {
  if (import.meta.server) return L4_PRODUCT_ID
  return getTesterProp() === 'none' ? L4_PRODUCT_ID : L4_PRODUCT_ID_TEST
}

/** Цена с макета. Реальную сумму списывает Multicard по данным инвойса —
 *  здесь она нужна только для показа и для аналитики покупки. */
export const L4_PRICE = 9800
export const L4_OLD_PRICE = 19900
export const L4_CURRENCY = 'UZS'

/** Пока на лендинге единственный тип покупки (см. требования по аналитике). */
export const L4_SUBSCRIPTION_TYPE = 'lifetime'

export const L4_APP_STORE_URL = 'https://apps.apple.com/app/kids-car-games-police-car-fun/id1442848046'

/* --------------------------- хранилище --------------------------- */

/**
 * AJWT и id инвойса переживают уход на Multicard и возврат на
 * `/payment-result` — это разные загрузки страницы, память компонента их не
 * переживает. `localStorage`, а не `sessionStorage`: человек нередко
 * возвращается не той же вкладкой (ссылка из СМС банка, восстановленная
 * сессия браузера), и тогда `sessionStorage` уже пуст.
 */
const AJWT_KEY = 'amaya_l4_ajwt'
const INVOICE_KEY = 'amaya_l4_invoice_id'

/** Id аккаунта из `/login` — чтобы событие покупки на `/payment-result`
 *  ушло от его имени, а не от анонимного посетителя (вход был на прошлой
 *  загрузке страницы, память модуля аналитики к этому моменту пуста). */
const ACCOUNT_KEY = 'amaya_l4_account_id'

/** Инвойс, покупку по которому уже отправили в аналитику. Возврат на
 *  `/payment` по той же ссылке (перезагрузка, кнопка «назад») повторно
 *  подтвердит покупку — событие выручки при этом должно уйти ровно один раз. */
const PURCHASE_TRACKED_KEY = 'amaya_l4_purchase_tracked'

/** Последняя ссылка на оплату. Нужна, чтобы `/payment` после возврата
 *  «назад» показал кнопку сразу, не дожидаясь ответа биллинга. */
const CHECKOUT_URL_KEY = 'amaya_l4_checkout_url'

/** Инвойс, по которому браузер уже уводили на шлюз. Без этой метки
 *  `/payment` уводил бы туда снова на каждом заходе, и кнопка «назад»
 *  превратилась бы в петлю. */
const CHECKOUT_OPENED_KEY = 'amaya_l4_checkout_opened'

function readStorage(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? ''
  } catch {
    // Приватный режим или запрещённые данные сайта — ведём себя как «пусто».
    return ''
  }
}

function writeStorage(key: string, value: string) {
  try {
    if (value) {
      window.localStorage.setItem(key, value)
    } else {
      window.localStorage.removeItem(key)
    }
  } catch {
    // Недоступное хранилище: покупка в этой вкладке ещё пройдёт (токен живёт
    // в памяти страницы), но после возврата с Multicard попросим войти заново.
  }
}

export function readL4Ajwt() {
  return import.meta.server ? '' : readStorage(AJWT_KEY)
}

export function saveL4Ajwt(token: string) {
  if (!import.meta.server) writeStorage(AJWT_KEY, token)
}

export function readL4InvoiceId() {
  return import.meta.server ? '' : readStorage(INVOICE_KEY)
}

export function saveL4InvoiceId(invoiceId: string) {
  if (!import.meta.server) writeStorage(INVOICE_KEY, invoiceId)
}

export function readL4AccountId() {
  return import.meta.server ? '' : readStorage(ACCOUNT_KEY)
}

export function saveL4AccountId(accountId: string) {
  if (!import.meta.server) writeStorage(ACCOUNT_KEY, accountId)
}

export function readL4CheckoutUrl() {
  return import.meta.server ? '' : readStorage(CHECKOUT_URL_KEY)
}

export function saveL4CheckoutUrl(url: string) {
  if (!import.meta.server) writeStorage(CHECKOUT_URL_KEY, url)
}

/** Помечает, что на шлюз по этому инвойсу уже уводили. */
export function markL4CheckoutOpened(invoiceId: string) {
  if (!import.meta.server) writeStorage(CHECKOUT_OPENED_KEY, invoiceId)
}

export function wasL4CheckoutOpened(invoiceId: string) {
  return !import.meta.server && Boolean(invoiceId) && readStorage(CHECKOUT_OPENED_KEY) === invoiceId
}

/** Вызывается, когда воронка начинается заново: следующий инвойс должен
 *  снова увести на шлюз автоматически. */
export function clearL4Checkout() {
  saveL4CheckoutUrl('')
  if (!import.meta.server) writeStorage(CHECKOUT_OPENED_KEY, '')
}

/** `true`, если покупку по этому инвойсу в аналитику ещё не отправляли. */
export function claimL4PurchaseTracking(invoiceId: string) {
  if (import.meta.server || !invoiceId) return false
  if (readStorage(PURCHASE_TRACKED_KEY) === invoiceId) return false

  writeStorage(PURCHASE_TRACKED_KEY, invoiceId)
  return true
}

/* ------------------------------ API ------------------------------ */

/**
 * Ошибки, общие для обоих платёжных методов. AGS отдаёт их с HTTP 200,
 * поэтому единственный признак неудачи — `ok: false` и сам `status`.
 */
export type L4BillingError
  = | 'bad_request' // не тот productId
    | 'forbidden' // origin лендинга не в белом списке
    | 'auth_required' // AJWT не передан
    | 'auth_failed' // AJWT недействителен
    | 'account_not_registered' // AJWT не от зарегистрированного аккаунта

/** Ошибки, после которых сохранённый AJWT бесполезен и нужно входить заново. */
const AUTH_FAILURES: string[] = ['auth_required', 'auth_failed', 'account_not_registered']

export function isL4AuthFailure(status: string | undefined) {
  return Boolean(status && AUTH_FAILURES.includes(status))
}

export interface L4InvoiceResponse {
  ok?: boolean
  status?: 'invoice_created' | 'payment_pending' | 'already_purchased' | 'invoice_failed' | L4BillingError
  productId?: string
  /** У `already_purchased` может быть `null` — покупка нашлась без инвойса. */
  invoiceId?: string | null
  checkoutUrl?: string | null
  message?: string
}

export interface L4StatusResponse {
  ok?: boolean
  status?: 'pending' | 'purchased' | 'failed' | 'expired' | 'refunded' | 'status_failed' | L4BillingError
  productId?: string
  invoiceId?: string | null
  /** `true` у `failed`, `expired` и `refunded` — можно создавать новый инвойс. */
  canRetry?: boolean
  /** Квитанция Multicard. Бывает `null` даже у подтверждённой покупки —
   *  если шлюз её не передал. */
  receiptUrl?: string | null
  /** Фискальный чек. Отдаётся здесь же, отдельно от квитанции. */
  fiscalReceiptUrl?: string | null
  message?: string
  /** Сумма и валюта — используются для Meta `Purchase` (см.
   *  `l4/payment/index.vue` → `trackPurchase()`), с откатом на константы
   *  этого файла, если биллинг их не прислал. */
  price?: number
  currency?: string
  /**
   * Дальше — поля для `landing_billing_purchase` в Mixpanel. Событие сейчас
   * шлёт бэкенд напрямую (см. useL4Mixpanel.ts), так что здесь эти поля
   * временно не читаются никем — оставлены как задокументированная форма
   * ответа на случай, если событие вернут на фронт.
   */
  subscriptionType?: string
  trial?: boolean
  sandbox?: boolean
  paymentCount?: number
}

/**
 * Создаёт инвойс — или возвращает незакрытый прежний (`payment_pending`),
 * или сообщает, что платить уже не за что (`already_purchased`).
 *
 * Решение по ответу принимает вызывающий код: у каждого `status` своё
 * поведение. Здесь только транспорт, и единственное, что добавляется, —
 * приведение сетевого сбоя к тому же виду, что и бизнес-ошибка, чтобы у
 * страницы была одна ветка обработки вместо двух.
 */
export async function createL4Invoice(ajwt: string): Promise<L4InvoiceResponse> {
  try {
    return await $fetch<L4InvoiceResponse>(`${L4_PAYMENT_API}/invoice`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ajwt}` },
      body: { productId: resolveL4ProductId() }
    })
  } catch (error) {
    // Сюда попадают только транспортные сбои и не-2xx: свои ошибки AGS
    // отдаёт с HTTP 200 и они уходят в ветку выше.
    const data = (error as { data?: L4InvoiceResponse })?.data
    return data && typeof data === 'object'
      ? data
      : { ok: false, status: 'invoice_failed' }
  }
}

/**
 * Реальный статус оплаты. Дёргается на каждом возврате со шлюза, независимо
 * от того, что шлюз написал в адресе: именно этот запрос закрывает покупку
 * на стороне биллинга и запускает письмо пользователю.
 *
 * `status_failed` — это «пока не знаем», а не «не оплачено»: страница по
 * нему предлагает повторить проверку, а не платёж.
 */
export async function checkL4PaymentStatus(ajwt: string, invoiceId: string): Promise<L4StatusResponse> {
  try {
    return await $fetch<L4StatusResponse>(`${L4_PAYMENT_API}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ajwt}` },
      body: { productId: resolveL4ProductId(), invoiceId }
    })
  } catch (error) {
    const data = (error as { data?: L4StatusResponse })?.data
    return data && typeof data === 'object'
      ? data
      : { ok: false, status: 'status_failed' }
  }
}
