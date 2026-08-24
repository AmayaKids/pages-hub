export const HOST_PAGE_KEYS = {
  'amayakids.com': 'amayakids-com-root',
  'l1.amayasoft.uz': 'amayasoft-uz-l1',
  'l2.amayasoft.uz': 'amayasoft-uz-l2',
  'test.amayasoft.uz': 'amayasoft-uz-test'
} as const

export const LOCALES = ['en', 'ru', 'de', 'es', 'it', 'pt', 'fr', 'sv', 'nl'] as const

export type LocaleCode = (typeof LOCALES)[number]

export function normalizeHost(host: string | undefined | null): string {
  if (!host) return ''
  return host.split(':')[0]!.toLowerCase()
}

export type HostPageKey = (typeof HOST_PAGE_KEYS)[keyof typeof HOST_PAGE_KEYS]

export function getHostPageKey(host: string | undefined | null): HostPageKey | undefined {
  const normalizedHost = normalizeHost(host)

  if (!Object.hasOwn(HOST_PAGE_KEYS, normalizedHost)) {
    return undefined
  }

  return HOST_PAGE_KEYS[normalizedHost as keyof typeof HOST_PAGE_KEYS]
}

export function getLandingSlug(host: string | undefined | null): string | undefined {
  const pageKey = getHostPageKey(host)

  if (!pageKey) return undefined

  if (pageKey.endsWith('-l1')) return 'l1'
  if (pageKey.endsWith('-l2')) return 'l2'
  if (pageKey.endsWith('-test')) return 'test'

  return undefined
}

/** Path is `/:locale/:slug` or `/:locale/:slug/` for a known landing slug */
export function matchLandingPath(path: string, slug: string): LocaleCode | null {
  const match = path.match(new RegExp(`^/([a-z]{2})/${slug}/?$`))
  if (!match) return null

  const code = match[1] as LocaleCode
  return (LOCALES as readonly string[]).includes(code) ? code : null
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
