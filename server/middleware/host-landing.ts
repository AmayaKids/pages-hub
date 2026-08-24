import {
  getLandingSlug,
  isStaticAssetPath,
  matchLandingPath
} from '../../shared/hostLandings'

/**
 * Keep subdomain landing URLs canonical at `/:locale`.
 */
export default defineEventHandler((event) => {
  const host = getRequestHost(event, { xForwardedHost: true })
  const slug = getLandingSlug(host)
  if (!slug) return

  const url = getRequestURL(event)
  const path = url.pathname

  if (isStaticAssetPath(path) || path.startsWith('/a/')) return

  const locale = matchLandingPath(path, slug)
  if (locale) {
    return sendRedirect(event, `/${locale}${url.search}`, 301)
  }
})
