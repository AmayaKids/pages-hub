import {
  getHostLocaleConfig,
  getLandingSlug,
  isStaticAssetPath
} from '../../shared/hostLandings'

/**
 * Keep subdomain landing URLs canonical, resolving the locale against the
 * host's own locale config so old-style `/:locale/:slug` links (e.g. `/ru/l1`)
 * land on a locale that's actually valid for that host — or on bare `/` for
 * hosts that don't have localization at all.
 */
export default defineEventHandler((event) => {
  const host = getRequestHost(event, { xForwardedHost: true })
  const slug = getLandingSlug(host)
  if (!slug) return

  const url = getRequestURL(event)
  const path = url.pathname

  if (isStaticAssetPath(path) || path.startsWith('/a/')) return

  const match = path.match(new RegExp(`^/([a-z]{2})/${slug}/?$`))
  if (!match) return

  const localeConfig = getHostLocaleConfig(host)

  if (!localeConfig.localized) {
    return sendRedirect(event, `/${url.search}`, 301)
  }

  const requestedLocale = match[1]!
  const locale = (localeConfig.locales as readonly string[]).includes(requestedLocale)
    ? requestedLocale
    : localeConfig.defaultLocale

  return sendRedirect(event, `/${locale}${url.search}`, 301)
})
