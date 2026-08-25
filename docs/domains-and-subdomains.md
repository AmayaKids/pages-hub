# Домены и поддомены

## Идея

Одно Nuxt-приложение обслуживает несколько доменов/поддоменов, и то, какая страница открывается на `/`
(и на `/:lng`, если для хоста включена локализация), зависит от заголовка `Host` входящего запроса. Поэтому
в проекте нет отдельного роута `/l1`, `/l2` и т.д. — есть единый компонент `HostLandingRouter`
(`app/components/domain-pages/HostLandingRouter.vue`), который по хосту выбирает нужный лендинг, и его
рендерят две страницы-точки входа: `app/pages/index.vue` (`/`) и `app/pages/[lng]/index.vue` (`/:lng`).

Домены делятся на две категории:

1. **`pages.amayakids.com`** — "старый" функционал, живёт целиком под `/a/**`. Не участвует в
   host-диспетчеризации, работает независимо от остальных доменов и не должен быть затронут изменениями
   логики поддоменов/языков.
2. **Домены и поддомены-лендинги** — `amayakids.com`, `l1.amayasoft.uz`, `l2.amayasoft.uz`,
   `test.amayasoft.uz`. Для них `/` рендерит конкретный лендинг в зависимости от хоста.

## Единый источник конфигурации: `shared/hostLandings.ts`

```ts
export const HOST_CONFIGS = {
  'amayakids.com': {
    pageKey: 'amayakids-com-root',
    locale: { localized: true, locales: GLOBAL_LOCALES, defaultLocale: GLOBAL_DEFAULT_LOCALE }
  },
  'l1.amayasoft.uz': {
    pageKey: 'amayasoft-uz-l1',
    locale: { localized: true, locales: GLOBAL_LOCALES, defaultLocale: GLOBAL_DEFAULT_LOCALE }
  },
  // l2.amayasoft.uz, test.amayasoft.uz — аналогично; или `{ localized: false }`,
  // если хосту вообще не нужен /:lng-префикс (см. localization.md)
} as const satisfies Record<string, HostConfig>
```

- `pageKey` — внутренний идентификатор, используемый `HostLandingRouter` для выбора компонента.
- `locale` — настройки локализации для этого хоста (см. [localization.md](./localization.md)).
- Хосты, которых нет в `HOST_CONFIGS` (например `pages.amayakids.com`), для диспетчера считаются
  "неизвестными" — `getHostPageKey()` вернёт `undefined`, и `/` для такого хоста отдаст 404. Это ожидаемо:
  `pages.amayakids.com` не должен открывать лендинг на `/`, у него есть только `/a/**`.

## Как добавить новый домен/поддомен

1. Создать папку-группу страниц вида `app/pages/(имя-домена)/...` с `index.vue` (или
   `(subdomains)/slug/index.vue` для поддоменов одного домена). Такие папки **не должны** становиться
   реальными роутами — они импортируются как обычные Vue-компоненты диспетчером.
2. Исключить эту папку из авто-роутинга Nuxt в `nuxt.config.ts` → `pages.pattern` (см. ниже, почему это
   обязательно).
3. Добавить запись в `HOST_CONFIGS` в `shared/hostLandings.ts` с уникальным `pageKey` и нужными
   настройками `locale`.
4. Импортировать компонент и добавить его в `hostPages` в
   `app/components/domain-pages/HostLandingRouter.vue`.
5. Добавить домен в `vite.server.allowedHosts` в `nuxt.config.ts` — иначе локальная разработка с
   подменой `Host`-заголовка (через `/etc/hosts` или curl) будет получать `403 Blocked request`.

## Почему домен-группы исключены из авто-роутинга (`pages.pattern`)

Nuxt `pages/` использует "route groups" — папки в круглых скобках `(имя)` не влияют на URL, это просто
способ организации файлов. Из-за этого, если не исключить такие папки явно, Nuxt зарегистрирует
`app/pages/(amayasoft.uz)/(subdomains)/l1/index.vue` как реальный роут `/l1` — точно так же, как если бы
`(amayasoft.uz)` не существовало. Если завести несколько доменных групп с одинаковыми именами страниц
(`l1`, `l2`, `test`), они начнут **конфликтовать** за один и тот же путь `/l1`, `/l2` и т.д., и
host-диспетчеризация в `app/pages/index.vue` будет просто не задействована — прямой роут перехватит
запрос первым.

Решение — `nuxt.config.ts`:

```ts
pages: {
  pattern: [
    '**/*.vue',
    '!**/\\(amayakids.com\\)/**',
    '!**/\\(amayasoft.uz\\)/**'
  ]
}
```

Важно: круглые скобки в `pattern` — это синтаксис glob-группы, поэтому для исключения **буквальной** папки
`(имя)` скобки нужно экранировать (`\\(имя\\)`), иначе паттерн не будет работать как ожидается.

При добавлении новой доменной группы обязательно добавляйте её исключение сюда же.

## Диспетчер: `HostLandingRouter` + две точки входа

Сам выбор компонента лендинга живёт в `app/components/domain-pages/HostLandingRouter.vue`:

```vue
const pageKey = getHostPageKey(useAppHost())
const Landing = pageKey ? hostPages[pageKey] : null

if (!Landing) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}
```

Этот компонент рендерят две отдельные страницы:

- `app/pages/index.vue` — маршрут `/`. Если у хоста локализация включена (`localized: true`) — сразу
  редиректит на `/{defaultLocale}` и ничего не рендерит; если выключена (`localized: false`) — рендерит
  `HostLandingRouter` прямо тут.
- `app/pages/[lng]/index.vue` — маршрут `/:lng`. Валидирует `lng` под конкретный хост (сузить/по умолчанию,
  см. [localization.md](./localization.md)) и рендерит тот же `HostLandingRouter`.

Обе страницы помечены `definePageMeta({ i18n: false })` — они **исключены** из авто-роутинга
`@nuxtjs/i18n` и полностью управляют своим редиректом самостоятельно. Подробности и почему это обязательно
для работы `localized: false` без петель редиректов — см. [localization.md](./localization.md).

- `useAppHost()` (`app/composables/useAppHost.ts`) возвращает "настоящий" хост запроса. На сервере это
  `X-Forwarded-Host`, если он есть, иначе — обычный `Host`; на клиенте — `window.location.host`.
  Это важно, потому что reverse-proxy может переписывать `Host` при проксировании на Node-процесс, но
  почти всегда сохраняет оригинальный хост в `X-Forwarded-Host`. `useRequestURL().host` этого не учитывает
  и может давать неверный результат за проксями — используйте `useAppHost()` везде, где нужен реальный
  хост запроса.
- Если хост не найден в конфиге — `HostLandingRouter` отдаёт `404`.

## `/a/**` — общий обработчик, `noindex`

Все пути вида `/a/...` (например `/en/a/gift-card/farm`) — это старый функционал, который должен
продолжать работать одинаково независимо от домена/поддомена и от логики выше.

- `app/pages/a.vue` — родительский route-компонент для всей ветки `/a/**`, добавляет
  `<meta name="robots" content="noindex, nofollow">` через `useHead`.
- `nuxt.config.ts` → `routeRules` дополнительно проставляет HTTP-заголовок `X-Robots-Tag: noindex, nofollow`
  для `/a/**` и `/*/a/**` (с учётом локали в пути):

  ```ts
  routeRules: {
    '/a/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/*/a/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } }
  }
  ```

`/a/**` **не участвует** в host-диспетчеризации и не ограничивается per-host настройками языков — там
всегда работает полный глобальный набор языков (см. [localization.md](./localization.md)).

## Middleware, участвующие в роутинге

| Файл | Где выполняется | Что делает |
|---|---|---|
| `server/middleware/host-landing.ts` | Только на сервере (h3/Nitro) | Канонизирует старые ссылки `/:locale/:slug` (например `/ru/l1`) в `/:locale` (или в `/`, если локализация выключена для хоста). Работает по `getRequestHost(event, { xForwardedHost: true })`. |
| `app/middleware/i18n-redirect.global.ts` | И на сервере (SSR), и на клиенте | Только для `/a/**`: следит, чтобы путь содержал корректный локаль-префикс из полного глобального списка языков. Лендинги домена/поддомена сюда не попадают — у них своя логика прямо в `index.vue`/`[lng]/index.vue` (см. выше), т.к. эти страницы исключены из-под `@nuxtjs/i18n`. |

## Локальная разработка с разными хостами

1. В `nuxt.config.ts` → `vite.server.allowedHosts` перечислены все домены/поддомены — без этого dev-сервер
   Vite вернёт `403 Blocked request` на непривычный `Host`.
2. Проще всего тестировать через `curl` с заголовком `Host`, не трогая `/etc/hosts`:

   ```bash
   curl -H "Host: l1.amayasoft.uz" http://localhost:3000/
   ```
3. Чтобы протестировать сценарий "прокси переписывает Host, но передаёт X-Forwarded-Host" (именно так
   ведёт себя прод), передавайте оба заголовка:

   ```bash
   curl -H "Host: pages.amayakids.com" -H "X-Forwarded-Host: l1.amayasoft.uz" http://localhost:3000/
   ```
