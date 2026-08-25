# Локализация (i18n)

## Два независимых уровня

1. **Глобальный уровень** — `@nuxtjs/i18n` в `nuxt.config.ts`. Список из 9 языков, `strategy: 'prefix'`
   (роуты `/a/**` живут под `/:locale/a/**`), `defaultLocale: 'en'`. Это список **всех переводов, которые
   физически существуют** в проекте (`i18n/locales/*.json`). Он никогда не меняется по хосту — Nuxt i18n
   генерирует локализованные роуты на этапе сборки, без знания о хосте запроса.
2. **Per-host уровень** — `shared/hostLandings.ts` → `HOST_CONFIGS[host].locale`. Это **runtime**-слой для
   лендингов домена/поддомена, который решает: нужна ли локализация вообще на этом хосте, и если да — какое
   подмножество языков и какой дефолт.

Важно: per-host конфиг может только **сужать** глобальный список языков, но не может добавить язык, для
которого нет перевода — сначала язык должен быть добавлен в `nuxt.config.ts` → `i18n.locales` и получить
файл перевода.

## `/a/**` — не трогаем per-host логикой

Пути `/a/**` (`pages.amayakids.com`) всегда используют **полный** глобальный список языков и глобальный
дефолт (`en`), независимо от `HOST_CONFIGS`, и продолжают идти через штатный роутинг `@nuxtjs/i18n`
(`strategy: 'prefix'`). Это сделано специально, чтобы не сломать существующий функционал подарочных
карт/инструкций. Если нужно ограничить языки и для `/a/**` — это отдельная задача, затрагивающая
`nuxt.config.ts` напрямую, а не `HOST_CONFIGS`.

## Полное включение/выключение локализации per-host

Это то, чего не было в первой версии этого слоя (см. историю ниже) и что теперь **реально работает**:
`HOST_CONFIGS[host].locale` — дискриминированный union:

```ts
export type LandingLocaleConfig =
  | { localized: false }
  | { localized: true, locales: readonly LocaleCode[], defaultLocale: LocaleCode }
```

- `{ localized: false }` — на хосте вообще нет `/:locale`-префикса. `/` рендерит лендинг напрямую,
  `200 OK`, без единого редиректа. Любая попытка зайти с префиксом (`/en`, `/ru/l1`, ...) 301-редиректит на
  бесхвостый `/`.
- `{ localized: true, locales, defaultLocale }` — `/` 301-редиректит на `/{defaultLocale}`; на `/:locale`
  запрошенный код проверяется против `locales` этого хоста, при несовпадении — 301 на
  `/{defaultLocale хоста}`.

### Как это стало возможным (техническая суть)

Раньше это было невозможно, потому что `@nuxtjs/i18n` при `strategy: 'prefix'` сам, глобально и
безусловно, редиректит непрефиксованный `/` на `/${defaultLocale}` — независимо от `detectBrowserLanguage`
и от любой нашей runtime-логики. Если пытаться "срезать" префикс обратно на `/` для одного хоста, получается
вечная борьба (`/` → `/en` → `/` → `/en` → ...) — именно так возникла петля в проде на `l2.amayasoft.uz`.

Решение — вывести обе страницы лендинг-диспетчера из-под управления `@nuxtjs/i18n` **на уровне конкретных
страниц**, а не глобально:

- `app/pages/index.vue` (`/`) и `app/pages/[lng]/index.vue` (`/:lng`) помечены
  `definePageMeta({ i18n: false })`.
- Это заставляет `@nuxtjs/i18n` полностью исключить обе страницы из своей авто-префиксации — они не получают
  вариантов `/en`, `/ru` и т.д. от модуля, и модуль не пытается их "канонизировать" сам.
- Весь редирект между `/` и `/:lng` эти две страницы теперь делают **сами**, явно, через `navigateTo(...)`
  внутри `<script setup>` — без какого-либо участия i18n-модуля, поэтому конфликтов и петель в принципе не
  может возникнуть: обе стороны редиректа под нашим единственным контролем.
- `/a/**` (и всё остальное) продолжает жить под обычным `strategy: 'prefix'` без каких-либо изменений.

⚠️ **Важная деталь конфигурации, без которой `i18n: false` тихо не работает:** по умолчанию
`@nuxtjs/i18n` понимает только устаревший макрос `defineI18nRoute()` для настройки роута конкретной
страницы (режим `customRoutes: 'page'`). Современный `definePageMeta({ i18n: ... })` учитывается только при
`customRoutes: 'meta'` — это явно включено в `nuxt.config.ts`:

```ts
i18n: {
  // ...
  customRoutes: 'meta'
}
```

Без этой строчки `definePageMeta({ i18n: false })` не даёт ошибки, но и не действует — модуль тихо считает
страницу обычной локализуемой, что выглядит как необъяснимый бесконечный редирект `/en` → `/en`.

## Конфигурация: `shared/hostLandings.ts`

```ts
export const GLOBAL_LOCALES = ['en', 'ru', 'de', 'es', 'it', 'pt', 'fr', 'sv', 'nl'] as const
export const GLOBAL_DEFAULT_LOCALE: LocaleCode = 'en'

export type LandingLocaleConfig =
  | { localized: false }
  | { localized: true, locales: readonly LocaleCode[], defaultLocale: LocaleCode }
```

Примеры для `HOST_CONFIGS` (иллюстрация обоих вариантов; актуальные значения — в самом файле):

```ts
// Несколько языков, дефолт — русский
'l2.amayasoft.uz': {
  pageKey: 'amayasoft-uz-l2',
  locale: { localized: true, locales: ['en', 'ru'], defaultLocale: 'ru' }
}

// Локализация полностью выключена — всегда просто `/`, без /xx-префикса.
// Сейчас в таком режиме реально живёт l1.amayasoft.uz.
'l1.amayasoft.uz': {
  pageKey: 'amayasoft-uz-l1',
  locale: { localized: false }
}
```

- `localized: true` + `locales` — какие языки доступны на этом хосте (подмножество `GLOBAL_LOCALES`).
- `defaultLocale` — на какой язык редиректить, если путь без локали (`/` → `/{defaultLocale}`) или
  запрошенная локаль не входит в `locales` этого хоста.
- `localized: false` — локализации на хосте нет вообще, `/` — единственный канонический URL.

### Хост не указан в `HOST_CONFIGS`

`getHostLocaleConfig()` возвращает "открытую" конфигурацию по умолчанию — `localized: true` с полным
`GLOBAL_LOCALES` и `GLOBAL_DEFAULT_LOCALE`.

## Как это применяется в коде

### `app/pages/index.vue` (`/`, `i18n: false`)

```ts
const config = getHostLocaleConfig(useAppHost())
if (config.localized) {
  await navigateTo(`/${config.defaultLocale}`, { redirectCode: 301 })
}
```
Иначе (не localized) — рендерит `HostLandingRouter` прямо тут, без редиректа.

### `app/pages/[lng]/index.vue` (`/:lng`, `i18n: false`)

```ts
definePageMeta({
  i18n: false,
  // без этого /:lng матчил бы ЛЮБОЙ односегментный путь, не только коды языка —
  // см. domains-and-subdomains.md → "⚠️ [lng] — почему обязателен validate"
  validate: route => /^[a-z]{2}$/.test(route.params.lng as string)
})

if (!config.localized) {
  await navigateTo('/', { redirectCode: 301 })
} else {
  // валидировать route.params.lng против config.locales,
  // при несовпадении — 301 на /{config.defaultLocale}, иначе setLocale и рендер лендинга
}
```

### `app/middleware/i18n-redirect.global.ts` (сервер + клиент)

Теперь отвечает **только** за `/a/**`: если пути не хватает валидного глобального локаль-префикса — 301 на
`/{GLOBAL_DEFAULT_LOCALE}{путь}`. Лендинги домена/поддомена сюда не попадают — они обрабатываются
непосредственно в `index.vue`/`[lng]/index.vue` (см. выше), т.к. те явно исключены из-под i18n-модуля.

### `server/middleware/host-landing.ts` (только сервер)

Отвечает за старые ссылки вида `/:locale/:slug` (например `/ru/l1`, когда `l1` — слаг поддомена) —
приводит их к каноническому виду одним редиректом:

- находит слаг для хоста (`getLandingSlug`);
- если хост `localized: false` — редирект прямо на `/`;
- если хост `localized: true` — смотрит, валидна ли запрошенная локаль для хоста:
  - валидна → редирект на `/{locale}`;
  - невалидна → редирект сразу на `/{defaultLocale хоста}` (не на запрошенную локаль, чтобы не было двух
    редиректов подряд).

## `routeRules['/']` — почему `/` НЕЛЬЗЯ пререндерить

`/` не помечен как `prerender: true` в `nuxt.config.ts`. Пререндеринг печёт статический HTML **один раз при
сборке**, без реального `Host`, и Nitro потом отдаёт этот же файл **всем хостам одинаково** — а наша
страница-диспетчер (`app/pages/index.vue`) и её поведение зависят от `Host`. `/` должен рендериться
динамически на каждый запрос.

## Как изменить локализацию для домена/поддомена — шаги

1. Открыть `shared/hostLandings.ts`.
2. Найти нужный хост в `HOST_CONFIGS` (или добавить новый).
3. Отредактировать `locale`:
   - выключить локализацию полностью — `{ localized: false }`;
   - включить/сузить список языков — `{ localized: true, locales: [...], defaultLocale: '...' }`.
4. Если нужно добавить язык, которого ещё нет в проекте:
   - добавить в `nuxt.config.ts` → `i18n.locales` (`{ code, iso, file }`);
   - создать файл перевода `i18n/locales/{code}.json`;
   - добавить код языка в `GLOBAL_LOCALES` в `shared/hostLandings.ts`;
   - только после этого его можно указывать в `locales` конкретного хоста.
5. Прогнать `pnpm lint`, `pnpm typecheck`, `pnpm build` — типы `LocaleCode` не дадут указать
   несуществующий код языка.

## Проверка вручную (curl)

Быстрая проверка статус-кодов и редиректов без браузера (для визуальной проверки лендинга живьём — см.
[локальную разработку через `*.loc`](./domains-and-subdomains.md#локальная-разработка-с-разными-хостами)):

```bash
# non-localized хост (l1): "/" рендерит сразу 200, без единого редиректа
curl -sI -H "Host: l1.amayasoft.uz" http://localhost:3000/ | head -1

# non-localized хост: любой похожий на локаль префикс схлопывается в "/" одним редиректом
curl -sI -H "Host: l1.amayasoft.uz" http://localhost:3000/en | grep -i location

# non-localized хост: путь, НЕ похожий на код языка, — честный 404, а не редирект на "/"
curl -sI -H "Host: l1.amayasoft.uz" http://localhost:3000/checkout | head -1

# localized хост (l2): "/" -> "/{defaultLocale}"
curl -sI -H "Host: l2.amayasoft.uz" http://localhost:3000/ | grep -i location

# язык не поддерживается на хосте -> редирект на дефолтный для хоста язык
curl -sI -H "Host: l2.amayasoft.uz" http://localhost:3000/de | grep -i location

# путь, не похожий на код языка, — 404, а не "проглатывание" в /en (см. domains-and-subdomains.md про `validate`)
curl -sI -H "Host: l2.amayasoft.uz" http://localhost:3000/checkout | head -1

# полный цикл с редиректами: 1-2 редиректа и 200, БЕЗ петли
curl -s -o /dev/null -w "code:%{http_code} redirects:%{num_redirects}\n" -L --max-redirs 5 \
  -H "Host: l2.amayasoft.uz" http://localhost:3000/

# /a/** всегда на глобальных правилах, независимо от хоста выше
curl -sI http://localhost:3000/a/gift-card/test | grep -i location
```
