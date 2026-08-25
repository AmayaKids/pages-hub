import {
  GLOBAL_DEFAULT_LOCALE,
  isGenericFallbackPath,
  isStaticAssetPath,
  LOCALES,
  splitLocalePrefix
} from '~~/shared/hostLandings'

/**
 * Handles ONLY the `/a/**` generic pages (pages.amayakids.com): forces the
 * full global locale list with 'en' as default, unchanged and independent of
 * any host.
 *
 * The domain/subdomain landing dispatcher (`app/pages/index.vue` and
 * `app/pages/[locale]/index.vue`) owns its own per-host locale redirects
 * directly, since those pages opt out of `@nuxtjs/i18n`'s own routing via
 * `definePageMeta({ i18n: false })` — see those files for why.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (isStaticAssetPath(to.path)) return

  const { locale, rest } = splitLocalePrefix(to.path)
  if (!isGenericFallbackPath(rest)) return

  if (!locale || !(LOCALES as readonly string[]).includes(locale)) {
    return navigateTo(
      { path: `/${GLOBAL_DEFAULT_LOCALE}${rest === '/' ? '' : rest}`, query: to.query, hash: to.hash },
      { redirectCode: 301 }
    )
  }
})
