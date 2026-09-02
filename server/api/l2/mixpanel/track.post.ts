/**
 * Приём событий лендинга l2 и отправка их в Mixpanel.
 *
 * Токен живёт только здесь, на сервере (`NUXT_CARS2_MIXPANEL_TOKEN` →
 * `runtimeConfig.cars2MixpanelToken`), в браузер он не попадает — поэтому
 * события идут не напрямую в Mixpanel, а через этот роут.
 *
 * Имена событий захардкожены белым списком: без него роут работал бы как
 * открытый ретранслятор, через который кто угодно мог бы писать произвольные
 * события в проект Mixpanel.
 */

const MIXPANEL_ENDPOINT = 'https://api.mixpanel.com/track'

/** Ровно те события, которые шлёт лендинг. Всё остальное отбрасывается. */
const ALLOWED_EVENTS = new Set([
  'landing_opened',
  'landing_email_screen',
  'landing_password_screen',
  'landing_congratulation_screen',
  'landing_appstore_button_tap',
  // Служебное событие Mixpanel: связывает анонимный id с id аккаунта
  // после успешного входа.
  '$identify'
])

/**
 * Пропускаем только UTM-метки рекламных ссылок. Всё прочее из `properties`
 * отбрасывается — иначе роут стал бы способом писать в проект Mixpanel
 * произвольные свойства.
 */
const ALLOWED_PROPERTIES = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const

/** Тот же список, что и в useQaTester.ts — держим на сервере независимую
 *  копию проверки: даже если кто-то соберёт запрос к роуту в обход клиента,
 *  в Mixpanel не попадёт произвольное значение `tester`. */
const KNOWN_TESTER_IDS = new Set(['kirill', 'fedor', 'ruslan', 'sergey', 'lev'])
const NOT_A_TESTER = 'none'

/** Названия кампаний и креативов приходят из адресной строки — ограничиваем. */
const PROPERTY_MAX_LENGTH = 255

/** Чем заполняется метка, если её нет ни в запросе, ни (значит) в адресе
 *  посетителя — буквальная строка, а не отсутствие свойства: событие всегда
 *  приходит в Mixpanel с одним и тем же набором из четырёх колонок,
 *  «не размечено рекламой» видно явно, а не как пропущенное поле. Держим эту
 *  гарантию на сервере, а не только в composable — это последняя точка перед
 *  Mixpanel, и она не должна зависеть от того, что именно прислал клиент. */
const PROPERTY_UNDEFINED = 'undefined'

interface TrackBody {
  event?: unknown
  /** Для обычных событий — анонимный id, для `$identify` — id аккаунта. */
  distinctId?: unknown
  /** Только для `$identify`: анонимный id, который склеиваем с аккаунтом. */
  anonId?: unknown
  /** UTM-метки перехода; всё, чего нет в белом списке, игнорируется. */
  properties?: unknown
}

function pickAllowedProperties(raw: unknown) {
  const source = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {}
  const picked: Record<string, string> = {}

  for (const key of ALLOWED_PROPERTIES) {
    const value = source[key]
    picked[key] = typeof value === 'string' && value.length > 0
      ? value.slice(0, PROPERTY_MAX_LENGTH)
      : PROPERTY_UNDEFINED
  }

  const tester = source.tester
  picked.tester = typeof tester === 'string' && KNOWN_TESTER_IDS.has(tester)
    ? tester
    : NOT_A_TESTER

  return picked
}

function asNonEmptyString(value: unknown, maxLength = 255) {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength
    ? value
    : null
}

export default defineEventHandler(async (event) => {
  const body = await readBody<TrackBody>(event)

  const name = asNonEmptyString(body?.event, 64)
  const distinctId = asNonEmptyString(body?.distinctId)

  if (!name || !ALLOWED_EVENTS.has(name) || !distinctId) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid analytics payload' })
  }

  const anonId = asNonEmptyString(body?.anonId)

  if (name === '$identify' && !anonId) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid analytics payload' })
  }

  const config = useRuntimeConfig(event)
  const token = config.cars2MixpanelToken

  // Без токена (локальная разработка, забытая переменная) просто ничего не
  // отправляем: аналитика не должна ронять страницу.
  if (!token) {
    console.warn('[l2/mixpanel] NUXT_CARS2_MIXPANEL_TOKEN не задан — событие не отправлено:', name)
    return null
  }

  // Запрос в Mixpanel уходит с нашего сервера, поэтому геолокацию по IP надо
  // передать явно — иначе все события окажутся в стране хостинга.
  const clientIp = getRequestIP(event, { xForwardedFor: true })

  const payload = [{
    event: name,
    properties: {
      token,
      distinct_id: distinctId,
      time: Date.now(),
      // Защита от дублей, если клиент ретраит запрос.
      $insert_id: crypto.randomUUID(),
      ...(clientIp ? { ip: clientIp } : {}),
      ...(name === '$identify'
        // `$identify` — служебное событие склейки личностей, метки в нём
        // ничего не дают, поэтому туда они не идут.
        ? { $identified_id: distinctId, $anon_id: anonId }
        : pickAllowedProperties(body?.properties))
    }
  }]

  try {
    // `verbose=1` заставляет Mixpanel вернуть причину отказа вместо голого `0`.
    const response = await $fetch<{ status?: number, error?: string }>(MIXPANEL_ENDPOINT, {
      method: 'POST',
      query: {
        verbose: 1,
        ...(config.cars2MixpanelProjectId ? { project_id: config.cars2MixpanelProjectId } : {})
      },
      body: payload
    })

    if (response?.status !== 1) {
      console.warn('[l2/mixpanel] событие отклонено:', name, response?.error)
    }
  } catch (error) {
    console.warn('[l2/mixpanel] не удалось отправить событие:', name, error)
  }

  // Клиенту всегда отвечаем успехом: он всё равно ничего не делает с ответом,
  // а лишний шум в консоли браузера не нужен.
  return null
})
