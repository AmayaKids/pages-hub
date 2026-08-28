import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
const breakpointsScssPath = fileURLToPath(new URL('./app/assets/css/breakpoints.scss', import.meta.url))

export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/i18n'
  ],

  pages: {
    // Domain-group folders hold plain .vue components imported directly by
    // app/pages/index.vue's host dispatcher. They must NOT become routes of
    // their own (Nuxt route groups like `(name)` are cosmetic and do not
    // affect the URL), otherwise e.g. `(amayakids.com)/index.vue` and the
    // top-level `index.vue` dispatcher would both register the same `/`
    // route — bypassing the Host-based selection entirely.
    // NB: parens must be escaped — unescaped `(...)` is glob group syntax,
    // so an escaped literal is required to exclude these literal folder names.
    pattern: [
      '**/*.vue',
      '!**/\\(amayakids.com\\)/**',
      '!**/\\(amayasoft.uz\\)/**'
    ]
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Только сервер: подставляется из NUXT_CARS2_MIXPANEL_TOKEN и используется
    // в server/api/l2/mixpanel/track.post.ts. В браузер не попадает —
    // именно поэтому события лендинга идут через свой роут, а не напрямую.
    cars2MixpanelToken: '',
    // Не обязателен для HTTP `/track` (проверено — события доходят и без
    // него), но Mixpanel постепенно требует его на других эндпоинтах, так что
    // подставляем, если задан. Не секрет — виден в любой ссылке на проект в
    // самом Mixpanel, но лежит рядом с токеном, а не в public, поскольку
    // используется только на сервере.
    cars2MixpanelProjectId: '',

    // Meta Conversions API — серверное дублирование тех же событий, что уже
    // шлёт браузерный пиксель (см. app/composables/useMetaPixel.ts). Токен
    // получают в Meta Business Settings → Events Manager → Web2wave →
    // Settings → Conversions API → Set up manually (System User token,
    // не личный — переживёт смену пароля/сессии того, кто его выпустил).
    // Даёт право писать конверсии в рекламный кабинет — чувствительнее
    // Mixpanel-токена, храним так же: только на сервере.
    cars2MetaCapiToken: '',
    // Опционально: пока идёт тест через Events Manager → Test Events, сюда
    // можно положить код вида TEST78125 — тогда серверные события будут
    // видны в Test Events с ЛЮБОГО компьютера, не только залогиненного в
    // Meta (см. предыдущее обсуждение). Перед реальным трафиком — убрать.
    cars2MetaCapiTestEventCode: ''
  },

  routeRules: {
    // `/` must NOT be prerendered: its content and locale-redirect behaviour
    // depend on the request's Host header (see shared/hostLandings.ts), and a
    // prerendered static file can't vary per host. A host with locale
    // disabled would otherwise loop forever against a statically baked
    // "redirect to /en" page.
    '/a/**': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow'
      }
    },
    '/*/a/**': {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow'
      }
    }
  },

  compatibilityDate: '2025-01-15',

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Makes the `md-tablet` / `md-desktop` breakpoint mixins available in
          // every `<style lang="scss">` block without an explicit `@use`.
          additionalData: `@use "${breakpointsScssPath}" as *;\n`
        }
      }
    },
    server: {
      // Local `/etc/hosts` testing for domain/subdomain routes. The `.loc`
      // variants let you test via a made-up hostname (e.g. `l1.amayasoft.uz.loc`)
      // that only resolves locally, without shadowing the real domain in
      // `/etc/hosts` — see `normalizeHost()` in shared/hostLandings.ts for the
      // matching `.loc`-suffix stripping.
      allowedHosts: [
        'amayakids.com',
        'pages.amayakids.com',
        'l1.amayasoft.uz',
        'l2.amayasoft.uz',
        'test.amayasoft.uz',
        'amayakids.com.loc',
        'l1.amayasoft.uz.loc',
        'l2.amayasoft.uz.loc',
        'test.amayasoft.uz.loc'
      ]
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', file: 'en.json' },
      { code: 'ru', iso: 'ru-RU', file: 'ru.json' },
      { code: 'de', iso: 'de-DE', file: 'de.json' },
      { code: 'es', iso: 'es-ES', file: 'es.json' },
      { code: 'it', iso: 'it-IT', file: 'it.json' },
      { code: 'pt', iso: 'pt-PT', file: 'pt.json' },
      { code: 'fr', iso: 'fr-FR', file: 'fr.json' },
      { code: 'sv', iso: 'sv-SE', file: 'sv.json' },
      { code: 'nl', iso: 'nl-NL', file: 'nl.json' }
    ],
    defaultLocale: 'en',
    strategy: 'prefix',
    langDir: 'locales/',
    detectBrowserLanguage: false,
    // Required so `definePageMeta({ i18n: false })` (used by app/pages/index.vue
    // and app/pages/[lng]/index.vue to fully opt specific hosts out of locale
    // prefixing) is actually honored — the default 'page' mode only recognizes
    // the deprecated `defineI18nRoute()` macro.
    customRoutes: 'meta'
  }
})
