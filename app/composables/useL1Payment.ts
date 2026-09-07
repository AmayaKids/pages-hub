/**
 * Боевая покупка для лендинга l1 (l1.amayasoft.uz).
 *
 * Отличие от l1-old: там кнопка «Купить» дёргала тестовый эндпоинт инвойса
 * без авторизации вообще. Здесь покупка привязана к аккаунту — сначала
 * регистрация/вход через my.amayasoft.uz (см. l1/auth/index.vue), затем
 * инвойс и проверка статуса в биллинге cars2 с AJWT в заголовке.
 *
 * Здесь только транспорт и хранилище: экранами и шагами владеет сама
 * страница `l1/auth`.
 */

/** Публичный API аккаунтов — тот же, что у l2 (см. l2/auth/index.vue). */
export const L1_ACCOUNTS_API = 'https://my.amayasoft.uz/api/public'

/**
 * Биллинг cars2. Домен чужой лендингу, поэтому запросы кросс-доменные —
 * origin лендинга должен быть в белом списке AGS, иначе на инвойс придёт
 * `forbidden`.
 */
export const L1_PAYMENT_API = 'https://cars2.ags.amayakids.com/api/client/billing/multicard'

/** gameId аккаунтов (Auth). Биллинг внутри себя пользуется своим (14) —
 *  с фронта его передавать не нужно. */
export const L1_GAME_ID = 15

export const L1_LANGUAGE = 'uz'
export const L1_COUNTRY = 'Uzbekistan'

/** Метка теста для бэкенда: l2 шлёт `UA_Cars2_var1`, платный вариант — var2. */
export const L1_EXPERIMENT = 'UA_Cars2_var2'

/** Платный пожизненный доступ — единственный товар этого лендинга. */
export const L1_PRODUCT_ID = 'com.amayasoft.cars2.ua.landing.lifetime.paid'

/** Цена с макета. Реальную сумму списывает Multicard по данным инвойса —
 *  здесь она нужна только для показа и для аналитики покупки. */
export const L1_PRICE = 50000
export const L1_OLD_PRICE = 100000
export const L1_CURRENCY = 'UZS'

/** Пока на лендинге единственный тип покупки (см. требования по аналитике). */
export const L1_SUBSCRIPTION_TYPE = 'lifetime'

export const L1_APP_STORE_URL = 'https://apps.apple.com/app/kids-car-games-police-car-fun/id1442848046'

/* --------------------------- хранилище --------------------------- */

/**
 * AJWT и id инвойса переживают уход на Multicard и возврат на
 * `/payment-result` — это разные загрузки страницы, память компонента их не
 * переживает. `localStorage`, а не `sessionStorage`: человек нередко
 * возвращается не той же вкладкой (ссылка из СМС банка, восстановленная
 * сессия браузера), и тогда `sessionStorage` уже пуст.
 */
const AJWT_KEY = 'amaya_l1_ajwt'
const INVOICE_KEY = 'amaya_l1_invoice_id'

/** Id аккаунта из `/login` — чтобы событие покупки на `/payment-result`
 *  ушло от его имени, а не от анонимного посетителя (вход был на прошлой
 *  загрузке страницы, память модуля аналитики к этому моменту пуста). */
const ACCOUNT_KEY = 'amaya_l1_account_id'

/** Инвойс, покупку по которому уже отправили в аналитику. Возврат на
 *  `/payment` по той же ссылке (перезагрузка, кнопка «назад») повторно
 *  подтвердит покупку — событие выручки при этом должно уйти ровно один раз. */
const PURCHASE_TRACKED_KEY = 'amaya_l1_purchase_tracked'

/** Последняя ссылка на оплату. Нужна, чтобы `/payment` после возврата
 *  «назад» показал кнопку сразу, не дожидаясь ответа биллинга. */
const CHECKOUT_URL_KEY = 'amaya_l1_checkout_url'

/** Инвойс, по которому браузер уже уводили на шлюз. Без этой метки
 *  `/payment` уводил бы туда снова на каждом заходе, и кнопка «назад»
 *  превратилась бы в петлю. */
const CHECKOUT_OPENED_KEY = 'amaya_l1_checkout_opened'

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

export function readL1Ajwt() {
  return import.meta.server ? '' : readStorage(AJWT_KEY)
}

export function saveL1Ajwt(token: string) {
  if (!import.meta.server) writeStorage(AJWT_KEY, token)
}

export function readL1InvoiceId() {
  return import.meta.server ? '' : readStorage(INVOICE_KEY)
}

export function saveL1InvoiceId(invoiceId: string) {
  if (!import.meta.server) writeStorage(INVOICE_KEY, invoiceId)
}

export function readL1AccountId() {
  return import.meta.server ? '' : readStorage(ACCOUNT_KEY)
}

export function saveL1AccountId(accountId: string) {
  if (!import.meta.server) writeStorage(ACCOUNT_KEY, accountId)
}

export function readL1CheckoutUrl() {
  return import.meta.server ? '' : readStorage(CHECKOUT_URL_KEY)
}

export function saveL1CheckoutUrl(url: string) {
  if (!import.meta.server) writeStorage(CHECKOUT_URL_KEY, url)
}

/** Помечает, что на шлюз по этому инвойсу уже уводили. */
export function markL1CheckoutOpened(invoiceId: string) {
  if (!import.meta.server) writeStorage(CHECKOUT_OPENED_KEY, invoiceId)
}

export function wasL1CheckoutOpened(invoiceId: string) {
  return !import.meta.server && Boolean(invoiceId) && readStorage(CHECKOUT_OPENED_KEY) === invoiceId
}

/** Вызывается, когда воронка начинается заново: следующий инвойс должен
 *  снова увести на шлюз автоматически. */
export function clearL1Checkout() {
  saveL1CheckoutUrl('')
  if (!import.meta.server) writeStorage(CHECKOUT_OPENED_KEY, '')
}

/** `true`, если покупку по этому инвойсу в аналитику ещё не отправляли. */
export function claimL1PurchaseTracking(invoiceId: string) {
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
export type L1BillingError
  = | 'bad_request' // не тот productId
    | 'forbidden' // origin лендинга не в белом списке
    | 'auth_required' // AJWT не передан
    | 'auth_failed' // AJWT недействителен
    | 'account_not_registered' // AJWT не от зарегистрированного аккаунта

/** Ошибки, после которых сохранённый AJWT бесполезен и нужно входить заново. */
const AUTH_FAILURES: string[] = ['auth_required', 'auth_failed', 'account_not_registered']

export function isL1AuthFailure(status: string | undefined) {
  return Boolean(status && AUTH_FAILURES.includes(status))
}

export interface L1InvoiceResponse {
  ok?: boolean
  status?: 'invoice_created' | 'payment_pending' | 'already_purchased' | 'invoice_failed' | L1BillingError
  productId?: string
  /** У `already_purchased` может быть `null` — покупка нашлась без инвойса. */
  invoiceId?: string | null
  checkoutUrl?: string | null
  message?: string
}

export interface L1StatusResponse {
  ok?: boolean
  status?: 'pending' | 'purchased' | 'failed' | 'expired' | 'refunded' | 'status_failed' | L1BillingError
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
  /**
   * Поля покупки для события `landing_billing_purchase`. Фронтенд их не
   * знает: `paymentCount` и `sandbox` — это состояние биллинга, а не
   * страницы. Пока бэкенд их не отдаёт, событие уходит с константами из
   * этого файла (см. `l1/auth/index.vue`).
   */
  price?: number
  currency?: string
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
export async function createL1Invoice(ajwt: string): Promise<L1InvoiceResponse> {
  try {
    return await $fetch<L1InvoiceResponse>(`${L1_PAYMENT_API}/invoice`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ajwt}` },
      body: { productId: L1_PRODUCT_ID }
    })
  } catch (error) {
    // Сюда попадают только транспортные сбои и не-2xx: свои ошибки AGS
    // отдаёт с HTTP 200 и они уходят в ветку выше.
    const data = (error as { data?: L1InvoiceResponse })?.data
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
export async function checkL1PaymentStatus(ajwt: string, invoiceId: string): Promise<L1StatusResponse> {
  try {
    return await $fetch<L1StatusResponse>(`${L1_PAYMENT_API}/status`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ajwt}` },
      body: { productId: L1_PRODUCT_ID, invoiceId }
    })
  } catch (error) {
    const data = (error as { data?: L1StatusResponse })?.data
    return data && typeof data === 'object'
      ? data
      : { ok: false, status: 'status_failed' }
  }
}
