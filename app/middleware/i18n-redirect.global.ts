export default defineNuxtRouteMiddleware((to) => {
  // Пропускаем ассеты — их не надо префиксить локалью
  if (to.path.startsWith('/assets/') || to.path === '/assets') {
    return
  }

  const locales = ['en', 'ru', 'de', 'es', 'it', 'pt', 'fr', 'sv', 'nl']
  const hasLocale = locales.some(l => to.path.startsWith(`/${l}/`) || to.path === `/${l}`)

  if (!hasLocale) {
    return navigateTo('/en' + to.fullPath, { redirectCode: 301 })
  }
})
