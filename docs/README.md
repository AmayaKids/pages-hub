# Документация pages-hub

Здесь описана специфичная для этого проекта логика: как работает мультидоменный/мультиязычный роутинг.

- [Домены и поддомены](./domains-and-subdomains.md) — какие хосты обслуживает приложение, как происходит диспетчеризация по `Host`, как устроены `/a/**`-страницы и `noindex`.
- [Локализация (i18n)](./localization.md) — как настроить список языков и дефолтный язык для каждого домена/поддомена, как отключить локализацию для хоста, как это связано с `@nuxtjs/i18n`.

## Быстрая карта хостов на сегодня

| Хост | Что открывается | Конфиг |
|---|---|---|
| `pages.amayakids.com` | `/a/**` — подарочные карты, инструкции и т.д. (без диспетчеризации по хосту) | не в `HOST_CONFIGS` |
| `amayakids.com` | Корневая страница `app/pages/(amayakids.com)/index.vue` | `shared/hostLandings.ts` → `HOST_CONFIGS['amayakids.com']` |
| `l1.amayasoft.uz` | Лендинг `app/pages/(amayasoft.uz)/(subdomains)/l1/index.vue` | `HOST_CONFIGS['l1.amayasoft.uz']` |
| `l2.amayasoft.uz` | Лендинг `app/pages/(amayasoft.uz)/(subdomains)/l2/index.vue` | `HOST_CONFIGS['l2.amayasoft.uz']` |
| `test.amayasoft.uz` | Лендинг `app/pages/(amayasoft.uz)/(subdomains)/test/index.vue` | `HOST_CONFIGS['test.amayasoft.uz']` |

Единственный источник правды по хостам, страницам и языкам — [`shared/hostLandings.ts`](../shared/hostLandings.ts). Все middleware и диспетчер лендингов (`app/pages/index.vue`, `app/pages/[lng]/index.vue`, `app/components/domain-pages/HostLandingRouter.vue`) читают конфигурацию из этого файла.
