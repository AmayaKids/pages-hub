/**
 * Отправка событий лендинга l2 в Mixpanel.
 *
 * Токен проекта в браузер не отдаётся, поэтому composable ничего не знает про
 * Mixpanel напрямую — он только шлёт имя события на свой серверный роут
 * (`server/api/l2/mixpanel/track.post.ts`), а тот уже подписывает его токеном.
 *
 * Все вызовы — «выстрелил и забыл»: аналитика не должна ни задерживать
 * интерфейс, ни ронять флоу, поэтому ошибки гасятся молча.
 */

export type L2MixpanelEvent
  = | 'landing_opened'
    | 'landing_email_screen'
    | 'landing_password_screen'
    | 'landing_congratulation_screen'
    | 'landing_appstore_button_tap'

const ENDPOINT = '/api/l2/mixpanel/track'
const STORAGE_KEY = 'amaya_l2_distinct_id'
const UTM_STORAGE_KEY = 'amaya_l2_utm'

/** Метки, которые рекламные ссылки приносят в query. Список должен совпадать
 *  с белым списком в server/api/l2/mixpanel/track.post.ts. */
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const

/** Названия кампаний и креативов бывают длинными — режем, чтобы в Mixpanel не
 *  улетало произвольное количество текста из адресной строки. */
const UTM_MAX_LENGTH = 255

/** Чем заполняется метка, если её не было ни в адресе, ни в сохранённом
 *  переходе — буквальная строка, а не отсутствие свойства: так в Mixpanel
 *  у события всегда все четыре колонки, и «не размечено рекламой» видно
 *  явно, а не читается как «репортер забыл прислать поле». */
const UTM_UNDEFINED = 'undefined'

/** Запасной id на случай, если localStorage недоступен (приватный режим,
 *  запрещённые данные сайта) — живёт до перезагрузки вкладки. */
let fallbackId = ''

/** После успешного входа сюда попадает id аккаунта, и события начинают
 *  уходить уже от его имени. */
let identifiedId = ''

/** Запасное хранилище меток, если localStorage недоступен. */
let fallbackUtm: Record<string, string> | null = null

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // `crypto.randomUUID` есть только в защищённом контексте (https/localhost),
  // так что для http-окружений нужен запасной вариант.
  return `l2-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** Анонимный id посетителя, переживающий перезагрузки и возвраты на сайт. */
function getAnonId() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) return stored

    const created = createId()
    window.localStorage.setItem(STORAGE_KEY, created)
    return created
  } catch {
    if (!fallbackId) fallbackId = createId()
    return fallbackId
  }
}

/**
 * Метки из текущего адреса. Meta подставляет их шаблонами
 * (`{{campaign.name}}` и т.п.); если плейсхолдер не раскрылся — а так бывает
 * на отдельных плейсментах — он приходит буквально, и такое значение только
 * мусорит отчёт, поэтому отбрасывается.
 */
function readUtmFromUrl(): Record<string, string> | null {
  const params = new URLSearchParams(window.location.search)
  const found: Record<string, string> = {}

  for (const key of UTM_KEYS) {
    const raw = params.get(key)?.trim()
    if (!raw || /^\{\{.*\}\}$/.test(raw)) continue
    found[key] = raw.slice(0, UTM_MAX_LENGTH)
  }

  return Object.keys(found).length > 0 ? found : null
}

/** Дополняет частичный набор меток до полного — недостающие ключи получают
 *  `UTM_UNDEFINED`, а не пропускаются. */
function withUtmDefaults(partial: Record<string, string>): Record<string, string> {
  const complete: Record<string, string> = {}

  for (const key of UTM_KEYS) {
    complete[key] = partial[key] ?? UTM_UNDEFINED
  }

  return complete
}

/**
 * Метки для события. Реклама приводит человека на «/», а события воронки
 * происходят уже на «/auth», где меток в адресе нет — поэтому переход
 * запоминается и подставляется дальше.
 *
 * Побеждает последний переход: новый заход с рекламы заменяет набор целиком,
 * а не домешивается к прежнему. Иначе от старой кампании остались бы висеть
 * те поля, которых нет в новой ссылке.
 *
 * Результат всегда содержит все четыре ключа: реклама подставляет не все
 * метки одинаково часто (`utm_content`, например, есть не на каждом
 * плейсменте), а без органического трафика (прямой заход, поиск и т.п.)
 * меток нет вовсе — в обоих случаях недостающее превращается в `UTM_UNDEFINED`.
 */
function getUtmProps(): Record<string, string> {
  const fromUrl = readUtmFromUrl()

  if (fromUrl) {
    const complete = withUtmDefaults(fromUrl)

    try {
      window.localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(complete))
    } catch {
      fallbackUtm = complete
    }

    return complete
  }

  try {
    const stored = window.localStorage.getItem(UTM_STORAGE_KEY)
    // `withUtmDefaults` здесь же на случай, если в хранилище лежит частичный
    // набор, сохранённый до появления дефолтов.
    if (stored) return withUtmDefaults(JSON.parse(stored) as Record<string, string>)
  } catch {
    // повреждённое или недоступное хранилище — просто идём дальше без меток
  }

  return withUtmDefaults(fallbackUtm ?? {})
}

function send(body: Record<string, unknown>) {
  // `void` + пустой catch: ответ не нужен, а необработанный reject в консоли
  // выглядел бы как ошибка страницы.
  void $fetch(ENDPOINT, { method: 'POST', body }).catch(() => {})
}

export function useL2Mixpanel() {
  /** Событие показа экрана/тапа. Шлётся при каждом показе — в том числе при
   *  возврате на экран по стрелке «назад». */
  function track(event: L2MixpanelEvent) {
    if (import.meta.server) return

    send({
      event,
      distinctId: identifiedId || getAnonId(),
      properties: { ...getUtmProps(), tester: getTesterProp() }
    })
  }

  /** Склеивает анонимный id с аккаунтом после успешного входа, чтобы события
   *  лендинга и события из приложения сходились на одном пользователе. */
  function identify(accountId: string | number) {
    if (import.meta.server) return

    const id = String(accountId ?? '')
    if (!id) return

    const anonId = getAnonId()
    identifiedId = id

    send({ event: '$identify', distinctId: id, anonId })
  }

  return { track, identify }
}
