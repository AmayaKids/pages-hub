// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/i18n'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

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
