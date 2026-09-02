/**
 * Метка тестировщика для лендинга l2.
 *
 * Личная ссылка вида `?tester=kirill` один раз пишет id в localStorage;
 * дальше он живёт до явной очистки данных сайта в браузере и добавляется
 * свойством к каждому событию в Mixpanel (см. useL2Mixpanel.ts) — чтобы
 * тестовый трафик можно было отфильтровать от реального в отчётах. Ровно
 * с этим и было связано расхождение цифр Meta/Mixpanel, которое разбирали
 * с Fedor.
 *
 * Баннер на странице (см. app/components/L2TesterBanner.vue) — обратная
 * связь самому тестировщику: если он его не видит, значит метка не
 * применилась, и тестировать на проде дальше не стоит.
 */

const STORAGE_KEY = 'amaya_l2_tester'
const QUERY_PARAM = 'tester'

/** Ровно эти пятеро, больше никто не должен получить метку — без белого
 *  списка любой случайный `?tester=...` в скопированной ссылке начал бы
 *  засорять отчёты произвольным значением. Ключ — то, что уходит в
 *  Mixpanel; значение — то, что показывается в баннере. */
const KNOWN_TESTERS: Record<string, string> = {
  kirill: 'Кирилл',
  fedor: 'Фёдор',
  ruslan: 'Руслан',
  sergey: 'Сергей',
  lev: 'Лев'
}

function readTesterIdFromUrl(): string | null {
  const id = new URLSearchParams(window.location.search).get(QUERY_PARAM)?.trim().toLowerCase()
  return id && Object.hasOwn(KNOWN_TESTERS, id) ? id : null
}

/**
 * Id тестировщика (`'kirill'` и т.п.) или `null`. Метка в адресе побеждает и
 * перезаписывает сохранённую — на случай, если кто-то из пятерых когда-то
 * протестировал по чужой ссылке по ошибке.
 */
function getTesterId(): string | null {
  const fromUrl = readTesterIdFromUrl()

  if (fromUrl) {
    try {
      window.localStorage.setItem(STORAGE_KEY, fromUrl)
    } catch {
      // Недоступное хранилище — метка отработает только на этот показ страницы.
    }
    return fromUrl
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored && Object.hasOwn(KNOWN_TESTERS, stored) ? stored : null
  } catch {
    return null
  }
}

/** Свойство для Mixpanel: id тестировщика или `'none'` — та же логика, что
 *  и у UTM-меток: всегда одна и та же схема колонок, а не то присутствует
 *  свойство, то нет. */
export function getTesterProp(): string {
  return getTesterId() ?? 'none'
}

/**
 * Реактивное состояние для баннера. Стартует пустым и заполняется в
 * `onMounted`, а не сразу — иначе на SSR-рендере и при гидратации значения
 * бы разошлись (localStorage и query недоступны на сервере).
 */
export function useQaTester() {
  const testerId = ref<string | null>(null)

  onMounted(() => {
    testerId.value = getTesterId()
  })

  const isTester = computed(() => testerId.value !== null)
  const testerName = computed(() => testerId.value ? KNOWN_TESTERS[testerId.value] : null)

  return { isTester, testerName }
}
