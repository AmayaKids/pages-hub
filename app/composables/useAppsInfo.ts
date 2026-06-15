const appStoreLinkTemplate = 'https://apps.apple.com/app/id{id}'

const appsData = {
  farm: {
    name: 'Farm',
    stores: {
      appStore: {
        id: '1441292800'
      }
    }
  }
} as const

type AppKey = keyof typeof appsData

export const useAppsInfo = () => {
  const apps = useState('appsInfo', () => appsData)

  const getAppStoreLink = (key: AppKey) => {
    const storeData = apps.value[key]?.stores?.appStore

    if (!storeData) return null

    return appStoreLinkTemplate
      .replace('{id}', storeData.id)
  }

  const getAppInfo = (key: AppKey) => {
    return apps.value[key] ?? null
  }

  return {
    apps,
    getAppStoreLink,
    getAppInfo
  }
}
