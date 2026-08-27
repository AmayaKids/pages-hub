/**
 * Meta Pixel для лендинга l2 — общий для «/» и «/auth».
 *
 * Раньше загрузчик жил только в l2/index.vue, но события воронки
 * (`LandingPasswordScreen`, `CompleteRegistration`) происходят уже на
 * «/auth». Вынесен сюда, чтобы обе страницы подключали ровно один и тот же
 * код и `window.fbq` был доступен независимо от того, с какой из них
 * начался визит: с прямого захода на «/auth» (клиентский заголовок, deep
 * link) или с клиентской SPA-навигации с «/».
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

/** Id пикселя не секрет (виден в исходнике страницы у любого посетителя),
 *  поэтому лежит константой, а не в runtimeConfig — в отличие от серверного
 *  токена Mixpanel. */
const META_PIXEL_ID = '1444729859450432'

/**
 * Загрузчик — дословный сниппет Meta. `init`/`track('PageView')` обёрнуты
 * флагом: при переходе между «/» и «/auth» клиентской SPA-навигацией оба
 * компонента вызывают этот composable заново, а `useHead` с одинаковым `key`
 * лишь дедуплицирует сам тег — сам сниппет выполнился бы повторно и без
 * флага прислал бы второй `PageView`. Сам загрузчик у Meta уже идемпотентен
 * — он выходит по `if (f.fbq) return`.
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
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');}`
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

export function useMetaPixel() {
  injectPixelLoader()

  /**
   * Стандартное событие Meta (`Lead`, `CompleteRegistration`, …) — именно
   * такие можно выбрать целью оптимизации кампании в Ads Manager. Имя должно
   * буквально совпадать с таксономией Meta, это не место для своих названий.
   */
  function trackStandard(name: string) {
    if (import.meta.server) return
    window.fbq?.('track', name)
  }

  /** Свой именованный ивент — для воронки в самом Events Manager, не для
   *  оптимизации кампании (Meta не даёт выбрать произвольное имя целью). */
  function trackCustom(name: string) {
    if (import.meta.server) return
    window.fbq?.('trackCustom', name)
  }

  return { trackStandard, trackCustom }
}
