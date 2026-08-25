// https://nuxt.com/docs/api/configuration/nuxt-config
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
    server: {
      // Local Host-header /etc/hosts testing for domain/subdomain routes
      allowedHosts: [
        'amayakids.com',
        'pages.amayakids.com',
        'l1.amayasoft.uz',
        'l2.amayasoft.uz',
        'test.amayasoft.uz'
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
