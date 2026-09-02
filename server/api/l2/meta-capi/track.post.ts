/**
 * Серверное дублирование событий Meta Pixel через Conversions API.
 *
 * Дублирует ровно то, что уже шлёт браузерный пиксель (см.
 * app/composables/useMetaPixel.ts) — та же связка `event_id` на обеих
 * сторонах нужна, чтобы Meta склеила пару браузер+сервер в одно событие,
 * а не посчитала дважды. Пишется отдельно от браузерного вызова: сервер
 * не должен ждать успеха/неуспеха этого запроса, чтобы не тормозить страницу.
 *
 * Смысл существования рядом с уже работающим браузерным пикселем — Safari
 * на iOS резко режет время жизни cookie, которыми браузерный пиксель
 * идентифицирует посетителя; сервер не зависит от этих cookie так же сильно
 * (IP + User-Agent + fbp/fbc, когда они ещё живы).
 *
 * `email` — отдельно: IP/UA/fbp/fbc Meta не засчитывает как основание для
 * атрибуции (см. предупреждение Events Manager про отсутствующий `user_data`
 * — там явно перечислены только identity-параметры: email, телефон, имя и
 * т.п.). Хэшируем здесь же, на сервере: сама почта дальше этого файла (и уж
 * тем более в Meta) в открытом виде не уходит.
 */

import { createHash } from 'node:crypto'

// Без версии в пути: Graph API маршрутизирует такие вызовы на самую старую
// ещё поддерживаемую версию автоматически — так не нужно вручную обновлять
// номер версии в коде каждые пару лет ради эндпоинта, чей контракт годами
// не менялся.
const META_GRAPH_ENDPOINT = 'https://graph.facebook.com'

/** Тот же id пикселя, что и в useMetaPixel.ts — не секрет, дублирование
 *  константы дешевле, чем тащить её через shared/ ради одной строки. */
const META_PIXEL_ID = '1335375415064544'

/** Ровно те события, которые шлёт лендинг (браузерный пиксель + этот роут).
 *  Всё остальное отбрасывается — без белого списка роут работал бы как
 *  открытый ретранслятор в чужой рекламный кабинет. */
const ALLOWED_EVENTS = new Set([
  'PageView',
  'LandingOpened',
  'LandingEmailScreen',
  'LandingPasswordScreen',
  'Lead',
  'CompleteRegistration',
  'LandingAppstoreButtonTap'
])

interface TrackBody {
  eventName?: unknown
  /** Тот же id, что ушёл в fbq(...) в браузере — ключ дедупликации на
   *  стороне Meta. */
  eventId?: unknown
  eventSourceUrl?: unknown
  /** `_fbp`/`_fbc` из cookie браузера, когда они ещё живы. */
  fbp?: unknown
  fbc?: unknown
  /** Email в открытом виде — только для хэширования здесь же на сервере.
   *  Передаётся лишь для событий, где на момент отправки email уже введён
   *  (шаги после email-формы). */
  email?: unknown
}

/** `em` у Meta — SHA-256 от email, приведённого к нижнему регистру и без
 *  пробелов по краям (ровно так требует их документация по Advanced
 *  Matching / Conversions API). */
function hashEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null

  const normalized = raw.trim().toLowerCase()
  if (!normalized || !normalized.includes('@')) return null

  return createHash('sha256').update(normalized).digest('hex')
}

function asNonEmptyString(value: unknown, maxLength = 2048) {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength
    ? value
    : null
}

export default defineEventHandler(async (event) => {
  const body = await readBody<TrackBody>(event)

  const eventName = asNonEmptyString(body?.eventName, 64)
  const eventId = asNonEmptyString(body?.eventId, 128)
  const eventSourceUrl = asNonEmptyString(body?.eventSourceUrl)

  if (!eventName || !ALLOWED_EVENTS.has(eventName) || !eventId || !eventSourceUrl) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid analytics payload' })
  }

  const config = useRuntimeConfig(event)
  const token = config.cars2MetaCapiToken

  // Без токена (локальная разработка, забытая переменная) просто ничего не
  // отправляем: аналитика не должна ронять страницу.
  if (!token) {
    console.warn('[l2/meta-capi] NUXT_CARS2_META_CAPI_TOKEN не задан — событие не отправлено:', eventName)
    return null
  }

  const clientIp = getRequestIP(event, { xForwardedFor: true })
  const userAgent = getRequestHeader(event, 'user-agent')

  const fbp = asNonEmptyString(body?.fbp, 256)
  const fbc = asNonEmptyString(body?.fbc, 256)
  const emailHash = hashEmail(body?.email)

  const payload = {
    data: [{
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: eventSourceUrl,
      user_data: {
        ...(clientIp ? { client_ip_address: clientIp } : {}),
        ...(userAgent ? { client_user_agent: userAgent } : {}),
        ...(fbp ? { fbp } : {}),
        ...(fbc ? { fbc } : {}),
        // Массив — так требует формат Meta (поддерживает несколько
        // идентификаторов на одно событие), даже когда значение одно.
        ...(emailHash ? { em: [emailHash] } : {})
      }
    }],
    ...(config.cars2MetaCapiTestEventCode ? { test_event_code: config.cars2MetaCapiTestEventCode } : {})
  }

  try {
    const response = await $fetch<{ events_received?: number, messages?: unknown[] }>(
      `${META_GRAPH_ENDPOINT}/${META_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: payload
      }
    )

    if (!response?.events_received) {
      console.warn('[l2/meta-capi] событие не принято:', eventName, response?.messages)
    }
  } catch (error) {
    console.warn('[l2/meta-capi] не удалось отправить событие:', eventName, error)
  }

  // Клиенту всегда отвечаем успехом: он всё равно ничего не делает с ответом,
  // а лишний шум в консоли браузера не нужен.
  return null
})
