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
    '/': { prerender: true },
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
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false // Принудительно кидает на дефолтный, если язык не найден
    }
  }
})
