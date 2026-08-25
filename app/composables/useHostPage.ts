import type { Component } from 'vue'
import { getHostPageKey, type HostPageKey } from '~~/shared/hostLandings'

/**
 * Resolves which host-specific component to render for the current request,
 * or throws a 404 if the current host doesn't have an entry in `pages`.
 *
 * Used by every top-level dispatcher page (`app/pages/index.vue`,
 * `app/pages/payment-result/index.vue`, etc.) that needs to render a
 * different component depending on the request's `Host` — see
 * docs/domains-and-subdomains.md → "Как добавить доп. страницу для хоста".
 */
export function resolveHostPage(pages: Partial<Record<HostPageKey, Component>>): Component {
  const pageKey = getHostPageKey(useAppHost())
  const page = pageKey ? pages[pageKey] : undefined

  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' })
  }

  return page
}
