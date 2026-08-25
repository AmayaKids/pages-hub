export const GLOBAL_LOCALES = ['en', 'ru', 'de', 'es', 'it', 'pt', 'fr', 'sv', 'nl'] as const

export type LocaleCode = (typeof GLOBAL_LOCALES)[number]

/** Full global locale list — always used, unrestricted, for `/a/**` pages (pages.amayakids.com). */
export const LOCALES = GLOBAL_LOCALES

export const GLOBAL_DEFAULT_LOCALE: LocaleCode = 'en'

export interface LandingLocaleConfig {
  /**
   * Which of GLOBAL_LOCALES this host supports. Requests for any other
   * locale get redirected to `defaultLocale`.
   *
   * NB: `@nuxtjs/i18n` is configured with `strategy: 'prefix'` globally, which
   * means it ALWAYS redirects an unprefixed `/` to `/${defaultLocale}` on its
   * own, independently of any app-level logic. Because of that, a host can't
   * truly have "no locale prefix at all" — the closest equivalent is a single
   * fixed locale (`locales: [defaultLocale]`), so `/` always resolves to that
   * one locale and there's nothing left to redirect back and forth over.
   */
  locales: readonly LocaleCode[]
  defaultLocale: LocaleCode
}

export interface HostConfig {
  pageKey: string
  /** Locale behaviour for this host's landing page (app/pages/index.vue). */
  locale: LandingLocaleConfig
}

/**
 * Per-host configuration for the domain/subdomain landing dispatcher.
 * Does NOT affect `/a/**` pages on pages.amayakids.com — those always keep the
 * full GLOBAL_LOCALES set and GLOBAL_DEFAULT_LOCALE, unchanged.
 *
 * To restrict languages for a host, edit its `locale.locales` (and optionally
 * `locale.defaultLocale`). To effectively have "one language only" for a
 * host, set `locales` to a single-element array, e.g. `locales: ['ru']`,
 * `defaultLocale: 'ru'` — `/` will resolve straight to `/ru` and stay there.
 * Hosts not listed here fall back to the full GLOBAL_LOCALES set with
 * GLOBAL_DEFAULT_LOCALE (see `getHostLocaleConfig`).
 */
export const HOST_CONFIGS = {
  'amayakids.com': {
    pageKey: 'amayakids-com-root',
    locale: { locales: GLOBAL_LOCALES, defaultLocale: GLOBAL_DEFAULT_LOCALE }
  },
  'l1.amayasoft.uz': {
    pageKey: 'amayasoft-uz-l1',
    locale: { locales: GLOBAL_LOCALES, defaultLocale: GLOBAL_DEFAULT_LOCALE }
  },
  'l2.amayasoft.uz': {
    pageKey: 'amayasoft-uz-l2',
    locale: { locales: GLOBAL_LOCALES, defaultLocale: GLOBAL_DEFAULT_LOCALE }
  },
  'test.amayasoft.uz': {
    pageKey: 'amayasoft-uz-test',
    locale: { locales: GLOBAL_LOCALES, defaultLocale: GLOBAL_DEFAULT_LOCALE }
  }
} as const satisfies Record<string, HostConfig>

type HostConfigEntry = (typeof HOST_CONFIGS)[keyof typeof HOST_CONFIGS]

export type HostPageKey = HostConfigEntry['pageKey']

export function normalizeHost(host: string | undefined | null): string {
  if (!host) return ''
  return host.split(':')[0]!.toLowerCase()
}

export function getHostConfig(host: string | undefined | null): HostConfigEntry | undefined {
  const normalizedHost = normalizeHost(host)

  if (!Object.hasOwn(HOST_CONFIGS, normalizedHost)) {
    return undefined
  }

  return HOST_CONFIGS[normalizedHost as keyof typeof HOST_CONFIGS]
}

export function getHostPageKey(host: string | undefined | null): HostPageKey | undefined {
  return getHostConfig(host)?.pageKey
}

/** Hosts without an explicit entry behave like the unrestricted global default. */
export function getHostLocaleConfig(host: string | undefined | null): LandingLocaleConfig {
  return getHostConfig(host)?.locale ?? {
    locales: GLOBAL_LOCALES,
    defaultLocale: GLOBAL_DEFAULT_LOCALE
  }
}

export function getLandingSlug(host: string | undefined | null): string | undefined {
  const pageKey = getHostPageKey(host)

  if (!pageKey) return undefined

  if (pageKey.endsWith('-l1')) return 'l1'
  if (pageKey.endsWith('-l2')) return 'l2'
  if (pageKey.endsWith('-test')) return 'test'

  return undefined
}

/** Splits `/xx/rest/of/path` into its 2-letter locale segment and the remainder (always `/`-prefixed). */
export function splitLocalePrefix(path: string): { locale: string | null, rest: string } {
  const match = path.match(/^\/([a-z]{2})(\/.*)?$/)
  if (!match) return { locale: null, rest: path }
  return { locale: match[1]!, rest: match[2] || '/' }
}

/** True for `/a` or `/a/**` (locale prefix already stripped) — the generic pages.amayakids.com fallback. */
export function isGenericFallbackPath(pathWithoutLocale: string): boolean {
  return pathWithoutLocale === '/a' || pathWithoutLocale.startsWith('/a/')
}

export function isStaticAssetPath(path: string): boolean {
  return (
    path === '/favicon.ico'
    || path === '/robots.txt'
    || path.startsWith('/assets')
    || path.startsWith('/_nuxt')
    || path.startsWith('/_ipx')
    || path.startsWith('/__nuxt')
  )
}
