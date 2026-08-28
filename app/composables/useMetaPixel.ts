/**
 * Meta Pixel для лендинга l2 — общий для «/» и «/auth».
 *
 * Раньше загрузчик жил только в l2/index.vue, но события воронки
 * (`LandingPasswordScreen`, `CompleteRegistration`) происходят уже на
 * «/auth». Вынесен сюда, чтобы обе страницы подключали ровно один и тот же
 * код и `window.fbq` был доступен независимо от того, с какой из них
 * начался визит: с прямого захода на «/auth» (клиентский заголовок, deep
 * link) или с клиентской SPA-навигации с «/».
 *
 * Каждое событие уходит дважды — в браузер (`fbq`) и на сервер
 * (server/api/l2/meta-capi/track.post.ts → Conversions API) с одним и тем же
 * `event_id`, чтобы Meta склеила пару в одно событие, а не посчитала дважды.
 * Смысл дублирования — Safari на iOS быстро режет cookie, которыми
 * браузерный пиксель опознаёт посетителя; серверный путь от них так не
 * зависит (IP + User-Agent + fbp/fbc, пока те ещё живы).
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    __metaPixelStarted?: boolean
    __metaPixelPageViewSent?: boolean
  }
}

/** Id пикселя не секрет (виден в исходнике страницы у любого посетителя),
 *  поэтому лежит константой, а не в runtimeConfig — в отличие от серверного
 *  токена Conversions API. */
const META_PIXEL_ID = '1335375415064544'

const CAPI_ENDPOINT = '/api/l2/meta-capi/track'

/**
 * Загрузчик — сниппет Meta без хвоста `fbq('track','PageView')`: раньше он
 * шёл прямо здесь, теперь `PageView` летит через тот же `trackPageView()`,
 * что и остальные события — чтобы у него тоже был `event_id` для CAPI-пары.
 * Флаг `__metaPixelStarted` нужен по той же причине, что и раньше: при
 * SPA-переходе «/» ↔ «/auth» оба компонента вызывают этот composable заново,
 * а без флага `fbq('init', …)` отработал бы повторно. Сам загрузчик у Meta
 * уже идемпотентен — он выходит по `if (f.fbq) return`.
 */
function injectPixelLoader() {
  useHead({
    script: [
      {
        key: 'meta-pixel',
        tagPriority: 'high',
        innerHTML: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
if(!window.__metaPixelStarted){window.__metaPixelStarted=!0;
fbq('init', '${META_PIXEL_ID}');}`
      }
    ],
    // Фолбэк для выключенного JS — из того же сниппета Meta.
    noscript: [
      {
        key: 'meta-pixel-noscript',
        tagPosition: 'bodyOpen',
        innerHTML: `<img height="1" width="1" style="display:none" `
          + `src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1" alt="" />`
      }
    ]
  })
}

function createEventId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  // `crypto.randomUUID` требует защищённого контекста (https/localhost) —
  // на проде это всегда так, но на всякий случай запасной вариант.
  return `mp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** `_fbp`/`_fbc` из cookie браузера — передаём на сервер, пока они ещё
 *  живы, чтобы Conversions API мог использовать их для сопоставления. */
function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]!) : undefined
}

/** Один и тот же `event_id` уходит и в `fbq`, и на сервер — это и есть ключ
 *  дедупликации для Meta. Ошибки серверного вызова гасятся молча: аналитика
 *  не должна ронять страницу, если Conversions API недоступен. */
function fireDual(method: 'track' | 'trackCustom', name: string) {
  if (import.meta.server) return

  const eventId = createEventId()

  window.fbq?.(method, name, {}, { eventID: eventId })

  void $fetch(CAPI_ENDPOINT, {
    method: 'POST',
    body: {
      eventName: name,
      eventId,
      eventSourceUrl: window.location.href,
      fbp: readCookie('_fbp'),
      fbc: readCookie('_fbc')
    }
  }).catch(() => {})
}

export function useMetaPixel() {
  injectPixelLoader()

  /**
   * Стандартное событие Meta (`Lead`, `CompleteRegistration`, `PageView`, …)
   * — именно такие можно выбрать целью оптимизации кампании в Ads Manager.
   * Имя должно буквально совпадать с таксономией Meta, это не место для
   * своих названий.
   */
  function trackStandard(name: string) {
    fireDual('track', name)
  }

  /** Свой именованный ивент — для воронки в самом Events Manager, не для
   *  оптимизации кампании (Meta не даёт выбрать произвольное имя целью). */
  function trackCustom(name: string) {
    fireDual('trackCustom', name)
  }

  /**
   * `PageView` — единственное событие, что раньше жило прямо в загрузчике.
   * Теперь вызывается явно из `onMounted` каждой страницы; свой флаг (не
   * `__metaPixelStarted` — тот гасит переинициализацию `fbq`, а не конкретно
   * это событие) гарантирует, что за один просмотр страницы оно уйдёт
   * ровно один раз, даже если что-то смонтирует composable повторно.
   */
  function trackPageView() {
    if (import.meta.server) return
    if (window.__metaPixelPageViewSent) return

    window.__metaPixelPageViewSent = true
    trackStandard('PageView')
  }

  return { trackStandard, trackCustom, trackPageView }
}
