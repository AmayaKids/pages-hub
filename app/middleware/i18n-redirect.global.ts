import { isStaticAssetPath, LOCALES } from '~~/shared/hostLandings'

export default defineNuxtRouteMiddleware((to) => {
  if (isStaticAssetPath(to.path) || to.path.startsWith('/assets')) {
    return
  }

  const hasLocale = LOCALES.some(l => to.path.startsWith(`/${l}/`) || to.path === `/${l}`)

  if (!hasLocale) {
    return navigateTo(
      { path: `/en${to.path === '/' ? '' : to.path}`, query: to.query, hash: to.hash },
      { redirectCode: 301 }
    )
  }
})
