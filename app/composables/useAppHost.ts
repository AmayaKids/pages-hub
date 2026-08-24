import { normalizeHost } from '~~/shared/hostLandings'

/**
 * Resolves the "real" browser-facing host for both SSR and client rendering.
 *
 * `useRequestURL()` reflects the raw `Host` header Nitro received, which some
 * reverse proxies rewrite to an internal/default value. `X-Forwarded-Host` is
 * what proxies commonly use to carry the original external host, so it takes
 * priority here — mirroring `getRequestHost(event, { xForwardedHost: true })`
 * used in `server/middleware/host-landing.ts`.
 */
export function useAppHost(): string {
  if (import.meta.server) {
    const headers = useRequestHeaders(['x-forwarded-host', 'host'])
    const forwardedHost = headers['x-forwarded-host']?.split(',')[0]?.trim()
    return normalizeHost(forwardedHost || headers['host'])
  }

  return normalizeHost(window.location.host)
}
