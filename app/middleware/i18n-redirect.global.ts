import {
  GLOBAL_DEFAULT_LOCALE,
  getHostLocaleConfig,
  isGenericFallbackPath,
  isStaticAssetPath,
  LOCALES,
  splitLocalePrefix
} from '~~/shared/hostLandings'

export default defineNuxtRouteMiddleware((to) => {
  if (isStaticAssetPath(to.path)) return

  const { locale, rest } = splitLocalePrefix(to.path)

  // `/a/**` (pages.amayakids.com) keeps the original, host-independent behaviour:
  // full global locale list, default locale 'en'.
  if (isGenericFallbackPath(rest)) {
    if (!locale || !(LOCALES as readonly string[]).includes(locale)) {
      return navigateTo(
        { path: `/${GLOBAL_DEFAULT_LOCALE}${rest === '/' ? '' : rest}`, query: to.query, hash: to.hash },
        { redirectCode: 301 }
      )
    }
    return
  }

  // Everything else is a domain/subdomain landing dispatch path — apply per-host locale rules.
  const config = getHostLocaleConfig(useAppHost())

  if (!config.enabled) {
    if (locale) {
      return navigateTo(
        { path: rest, query: to.query, hash: to.hash },
        { redirectCode: 301 }
      )
    }
    return
  }

  if (!locale || !(config.locales as readonly string[]).includes(locale)) {
    return navigateTo(
      { path: `/${config.defaultLocale}${rest === '/' ? '' : rest}`, query: to.query, hash: to.hash },
      { redirectCode: 301 }
    )
  }
})
