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

/** Запасной id на случай, если localStorage недоступен (приватный режим,
 *  запрещённые данные сайта) — живёт до перезагрузки вкладки. */
let fallbackId = ''

/** После успешного входа сюда попадает id аккаунта, и события начинают
 *  уходить уже от его имени. */
let identifiedId = ''

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

function send(body: Record<string, string>) {
  // `void` + пустой catch: ответ не нужен, а необработанный reject в консоли
  // выглядел бы как ошибка страницы.
  void $fetch(ENDPOINT, { method: 'POST', body }).catch(() => {})
}

export function useL2Mixpanel() {
  /** Событие показа экрана/тапа. Шлётся при каждом показе — в том числе при
   *  возврате на экран по стрелке «назад». */
  function track(event: L2MixpanelEvent) {
    if (import.meta.server) return

    send({ event, distinctId: identifiedId || getAnonId() })
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
