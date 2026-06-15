export default defineNuxtRouteMiddleware((to) => {
  const locales = ['en', 'ru', 'de', 'es', 'it', 'pt', 'fr', 'sv', 'nl']
  const hasLocale = locales.some(l => to.path.startsWith(`/${l}/`) || to.path === `/${l}`)

  if (!hasLocale) {
    return navigateTo('/en' + to.fullPath, { redirectCode: 301 })
  }
})
