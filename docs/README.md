# Документация pages-hub

Здесь описана специфичная для этого проекта логика: как работает мультидоменный/мультиязычный роутинг.

- [Домены и поддомены](./domains-and-subdomains.md) — какие хосты обслуживает приложение, как происходит диспетчеризация по `Host`, как устроены `/a/**`-страницы и `noindex`.
- [Локализация (i18n)](./localization.md) — как настроить список языков и дефолтный язык для каждого домена/поддомена, как отключить локализацию для хоста, как это связано с `@nuxtjs/i18n`.
- [Шрифты](./fonts.md) — какие вариативные шрифты подключены, почему каждый лежит в своём CSS-файле и импортируется только там, где реально используется, как добавить новый шрифт.
- [planning/](./planning/) — черновики и нереализованные идеи по архитектуре (не описывают текущее поведение проекта).

## Быстрая карта хостов на сегодня

| Хост | Что открывается | Локализация | Конфиг |
|---|---|---|---|
| `pages.amayakids.com` | `/a/**` — подарочные карты, инструкции и т.д. (без диспетчеризации по хосту) | полный глобальный список языков, всегда | не в `HOST_CONFIGS` |
| `amayakids.com` | Корневая страница `app/pages/(amayakids.com)/index.vue` | `localized: true`, полный список | `HOST_CONFIGS['amayakids.com']` |
| `l1.amayasoft.uz` | Лендинг `app/pages/(amayasoft.uz)/(subdomains)/l1/index.vue` | `localized: false` — без `/:lng`-префикса вообще | `HOST_CONFIGS['l1.amayasoft.uz']` |
| `l2.amayasoft.uz` | Лендинг `app/pages/(amayasoft.uz)/(subdomains)/l2/index.vue` | `localized: true`, полный список | `HOST_CONFIGS['l2.amayasoft.uz']` |
| `test.amayasoft.uz` | Лендинг `app/pages/(amayasoft.uz)/(subdomains)/test/index.vue` | `localized: true`, полный список | `HOST_CONFIGS['test.amayasoft.uz']` |

Единственный источник правды по хостам, страницам и языкам — [`shared/hostLandings.ts`](../shared/hostLandings.ts). Все middleware и диспетчер лендингов (`app/pages/index.vue`, `app/pages/[lng]/index.vue`, `app/components/domain-pages/HostLandingRouter.vue`) читают конфигурацию из этого файла.

## Локальная разработка

Для лендингов домена/поддомена нужен правильный `Host`-заголовок — см. раздел «Локальная разработка с
разными хостами» в [domains-and-subdomains.md](./domains-and-subdomains.md#локальная-разработка-с-разными-хостами)
(быстрый рецепт: открывать `http://l1.amayasoft.uz.loc:3000/` через `/etc/hosts`-запись на `::1`, без
подмены реального домена, и без флага `--host`).

## ⚠️ Не понижайте `@nuxtjs/i18n` ниже 10.4.1

Версии `@nuxtjs/i18n` до 10.4.1 содержат баг: клиентский middleware `locale-changing` игнорирует
`definePageMeta({ i18n: false })` и сам инициирует редирект на префиксный URL уже после гидратации — на
`localized: false`-хостах это выглядит как «страница открылась и через секунду стала пустой» (см.
[nuxt-modules/i18n#4021](https://github.com/nuxt-modules/i18n/pull/4021)). В проекте зафиксирована версия
`10.6.0` — не понижайте её без явной проверки, что фикс всё ещё присутствует.
