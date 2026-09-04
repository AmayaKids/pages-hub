/**
 * Боевая покупка для лендинга l1 (l1.amayasoft.uz).
 *
 * Отличие от l1-old: там кнопка «Купить» дёргала тестовый эндпоинт инвойса
 * без авторизации вообще. Здесь покупка привязана к аккаунту — сначала
 * регистрация/вход через my.amayasoft.uz (см. l1/auth/index.vue), затем
 * инвойс и проверка статуса на нашем же хосте с AJWT в заголовке.
 *
 * Здесь только транспорт и хранилище: экранами и шагами владеют сами
 * страницы (`l1/auth`, `l1/payment-result`).
 */

/** Публичный API аккаунтов — тот же, что у l2 (см. l2/auth/index.vue). */
export const L1_ACCOUNTS_API = 'https://my.amayasoft.uz/api/public'

/**
 * Платёжные методы лендинга живут на его собственном хосте, но обслуживает их
 * не Nitro этого приложения, а биллинг за реверс-прокси — так же, как уже
 * работал тестовый инвойс в l1-old (см. useMulticardCheckout.ts). Поэтому
 * абсолютный URL, а не относительный `/api/...`: относительный путь на
 * дев-хосте (`l1.amayasoft.uz.loc:3000`) ушёл бы в Nitro и вернул 404.
 */
export const L1_PAYMENT_API = 'https://l1.amayasoft.uz/api/payment/multicard'

/** cars2 — тот же gameId, что и у l2. */
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
 *  `/payment-result` по той же ссылке (перезагрузка, кнопка «назад»)
 *  повторно подтвердит покупку — событие выручки при этом должно уйти
 *  ровно один раз. */
const PURCHASE_TRACKED_KEY = 'amaya_l1_purchase_tracked'

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

/** Вызывается после подтверждённой покупки: инвойс отработал, держать его id
 *  дальше незачем — иначе следующий заход начнёт проверять статус старого. */
export function clearL1InvoiceId() {
  saveL1InvoiceId('')
}

export function readL1AccountId() {
  return import.meta.server ? '' : readStorage(ACCOUNT_KEY)
}

export function saveL1AccountId(accountId: string) {
  if (!import.meta.server) writeStorage(ACCOUNT_KEY, accountId)
}

/** `true`, если покупку по этому инвойсу в аналитику ещё не отправляли. */
export function claimL1PurchaseTracking(invoiceId: string) {
  if (import.meta.server || !invoiceId) return false
  if (readStorage(PURCHASE_TRACKED_KEY) === invoiceId) return false

  writeStorage(PURCHASE_TRACKED_KEY, invoiceId)
  return true
}

/* ------------------------------ API ------------------------------ */

export interface L1InvoiceResponse {
  ok?: boolean
  status?: 'payment_required' | 'payment_pending' | 'already_purchased' | 'invoice_creation_failed'
  productId?: string
  invoiceId?: string
  checkoutUrl?: string
  receiptUrl?: string | null
  message?: string
}

export interface L1StatusResponse {
  ok?: boolean
  status?: 'pending' | 'purchased' | 'failed' | 'expired' | 'refunded' | 'verification_unavailable'
  productId?: string
  invoiceId?: string
  canRetry?: boolean
  receiptUrl?: string | null
  message?: string
  /**
   * Поля покупки для события `landing_billing_purchase`. Фронтенд их не
   * знает: `paymentCount` и `sandbox` — это состояние биллинга, а не
   * страницы. Пока бэкенд их не отдаёт, событие уходит с константами из
   * этого файла (см. `l1/payment-result/index.vue`).
   */
  price?: number
  currency?: string
  subscriptionType?: string
  trial?: boolean
  sandbox?: boolean
  paymentCount?: number
}

/**
 * Создаёт инвойс (или возвращает незакрытый прежний). Ответ не проверяем на
 * `ok`: у вызывающего кода всё равно разное поведение на каждый `status`,
 * поэтому решение принимает он.
 *
 * `$fetch` кидает на любой не-2xx, а по спеке `invoice_creation_failed`
 * приходит именно с 4xx/5xx — поэтому тело ошибки достаём из `error.data`
 * и возвращаем как обычный ответ.
 */
export async function createL1Invoice(ajwt: string): Promise<L1InvoiceResponse> {
  try {
    return await $fetch<L1InvoiceResponse>(`${L1_PAYMENT_API}/invoice`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${ajwt}` },
      body: { productId: L1_PRODUCT_ID }
    })
  } catch (error) {
    const data = (error as { data?: L1InvoiceResponse })?.data
    return data && typeof data === 'object'
      ? data
      : { ok: false, status: 'invoice_creation_failed' }
  }
}

/**
 * Реальный статус оплаты. 503 (`verification_unavailable`) — это «пока не
 * знаем», а не «не оплачено»: возвращаем как есть, чтобы страница предложила
 * повторить именно проверку, а не платёж.
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
      : { ok: false, status: 'verification_unavailable' }
  }
}
