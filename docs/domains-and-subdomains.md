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
    locale: { localized: false } // у этого лендинга вообще нет /:lng-префикса
  },
  'l2.amayasoft.uz': {
    pageKey: 'amayasoft-uz-l2',
    locale: { localized: true, locales: GLOBAL_LOCALES, defaultLocale: GLOBAL_DEFAULT_LOCALE }
  },
  'test.amayasoft.uz': {
    pageKey: 'amayasoft-uz-test',
    locale: { localized: true, locales: GLOBAL_LOCALES, defaultLocale: GLOBAL_DEFAULT_LOCALE }
  }
} as const satisfies Record<string, HostConfig>
```

(Точный текущий список смотрите прямо в файле — здесь просто пример, чтобы показать оба варианта `locale`.)

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
5. Добавить домен в `vite.server.allowedHosts` в `nuxt.config.ts` — **и** реальное имя, и `имя.loc`-вариант
   (см. «Локальная разработка с разными хостами» ниже) — иначе будет `403 Blocked request`.

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

### ⚠️ `[lng]` — почему обязателен `validate`

`app/pages/[lng]/index.vue` использует динамический параметр `:lng`, а vue-router по умолчанию матчит **любой**
односегментный путь этим параметром — не только настоящие 2-буквенные коды языка. Без ограничения
`l2.amayasoft.uz/instruction` или `l1.amayasoft.uz/checkout` тоже попадали бы на эту страницу (с
`lng = "instruction"` и т.п.), код видел бы, что это не поддерживаемая локаль, и **тихо проглатывал** путь
редиректом на `/` или `/{defaultLocale}` — вместо честного 404.

Поэтому на странице обязателен `validate`:

```ts
definePageMeta({
  i18n: false,
  validate: route => /^[a-z]{2}$/.test(route.params.lng as string)
})
```

Теперь страницу матчат только сегменты, похожие на код языка (`en`, `ru`, `zz`, ...). Всё остальное не матчит
эту страницу вообще и корректно улетает в обычный `404`. Синтаксически-валидные, но неподдерживаемые на
конкретном хосте коды (например `/de` на хосте с `locales: ['en', 'ru']`) всё равно обрабатываются как раньше —
редиректом на `defaultLocale` хоста, это осознанное поведение, не баг.

- `useAppHost()` (`app/composables/useAppHost.ts`) возвращает "настоящий" хост запроса. На сервере это
  `X-Forwarded-Host`, если он есть, иначе — обычный `Host`; на клиенте — `window.location.host`.
  Это важно, потому что reverse-proxy может переписывать `Host` при проксировании на Node-процесс, но
  почти всегда сохраняет оригинальный хост в `X-Forwarded-Host`. `useRequestURL().host` этого не учитывает
  и может давать неверный результат за проксями — используйте `useAppHost()` везде, где нужен реальный
  хост запроса.
- Если хост не найден в конфиге — `HostLandingRouter` отдаёт `404`.

## Как добавить доп. страницу для хоста (не `/`)

`HostLandingRouter` диспетчеризует только `/` и `/:lng`. Если лендингу конкретного хоста нужна ещё одна
страница по своему пути (например `/payment-result` только на `l1.amayasoft.uz`), для неё нужен свой
собственный диспетчер — по тому же принципу, что и для `/`:

1. Файл самой страницы кладём внутрь домен-группы, как обычно (роутинг туда не смотрит — папка исключена
   `pages.pattern`, см. выше):

   ```
   app/pages/(amayasoft.uz)/(subdomains)/l1/payment-result/index.vue
   ```

2. Создаём **отдельный** файл-диспетчер вне доменных групп, на реальном пути, и импортируем туда
   компонент напрямую — используем composable `resolveHostPage()` (`app/composables/useHostPage.ts`),
   который делает то же самое, что и `HostLandingRouter`, но для произвольного набора хостов:

   ```vue
   <!-- app/pages/payment-result/index.vue -->
   <script setup lang="ts">
   import L1PaymentResult from '~/pages/(amayasoft.uz)/(subdomains)/l1/payment-result/index.vue'

   // Обязательно: см. пункт 3 ниже.
   definePageMeta({ i18n: false })

   const Page = resolveHostPage({
     'amayasoft-uz-l1': L1PaymentResult
   })
   </script>

   <template>
     <Page />
   </template>
   ```

   Хосты, не перечисленные в объекте, переданном в `resolveHostPage`, получат `404` на этом пути — так же,
   как `HostLandingRouter` 404-ит для хостов, не описанных в `HOST_CONFIGS`.

3. **Обязательно** пометить страницу `definePageMeta({ i18n: false })`. Без этого при `strategy: 'prefix'`
   `@nuxtjs/i18n` сам "забирает" этот путь под себя и требует локаль-префикс (`/:locale/payment-result`), а
   голый `/payment-result` перестаёт матчить эту страницу и проваливается в `[lng]/index.vue` — там `:lng`
   не проходит `validate` (это не 2-буквенный код), и запрос улетает в `404`. Ровно так возникла ошибка:
   страница физически существовала, но не открывалась.

4. Если такая страница должна быть доступна ещё и с локаль-префиксом на локализованных хостах — по тому же
   принципу заводится второй диспетчер `app/pages/[lng]/payment-result/index.vue` (тоже с `i18n: false` и
   собственной валидацией `lng`, аналогично `app/pages/[lng]/index.vue`).

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

В `nuxt.config.ts` → `vite.server.allowedHosts` перечислены все домены/поддомены **и** их `.loc`-варианты —
без этого dev-сервер Vite вернёт `403 Blocked request` на непривычный `Host`. При добавлении нового домена
добавляйте туда обе записи (см. «Как добавить новый домен/поддомен» выше).

### Способ 1 — открыть в браузере через `*.loc` (рекомендуется)

`normalizeHost()` в `shared/hostLandings.ts` в dev-режиме отрезает суффикс `.loc` перед поиском хоста в
`HOST_CONFIGS`. Это позволяет открывать лендинги живьём в браузере через выдуманный локальный хостнейм —
**не подменяя** в `/etc/hosts` настоящий домен (который тогда продолжает как обычно резолвиться по реальному
DNS/сети).

1. Один раз добавить в `/etc/hosts` (нужен sudo):

   ```bash
   echo "::1 l1.amayasoft.uz.loc l2.amayasoft.uz.loc test.amayasoft.uz.loc amayakids.com.loc" | sudo tee -a /etc/hosts
   ```

   ⚠️ Именно `::1`, а не `127.0.0.1` — `nuxt dev` по умолчанию слушает только IPv6-loopback. Не используйте
   флаг `--host` для этой задачи: он заставляет Nuxt CLI пересчитать `vite.server.allowedHosts` на основе
   сетевых адресов и на практике перекрывает список из `nuxt.config.ts`, из-за чего `.loc`-хосты снова
   начинают давать `403`.

2. Запустить обычный `pnpm dev` (без `--host`) и открыть в браузере:

   ```
   http://l1.amayasoft.uz.loc:3000/
   http://l2.amayasoft.uz.loc:3000/
   ```

### Способ 2 — `curl` с заголовком `Host`, без правки `/etc/hosts`

Быстрая проверка статус-кодов/редиректов без браузера — подменяем `Host` только для одного запроса:

```bash
curl -H "Host: l1.amayasoft.uz" http://localhost:3000/
```

Чтобы протестировать сценарий "прокси переписывает Host, но передаёт X-Forwarded-Host" (именно так
ведёт себя прод), передавайте оба заголовка:

```bash
curl -H "Host: pages.amayakids.com" -H "X-Forwarded-Host: l1.amayasoft.uz" http://localhost:3000/
```
