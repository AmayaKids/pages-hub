<script lang="ts" setup>
import QRCodeStyling from 'qr-code-styling'

useHead({
  style: [
    {
<<<<<<< Updated upstream
      innerHTML: 'html.gift-card-pdf-page { font-size: 24px !important; }',
=======
      innerHTML: 'html { font-size: 24px !important; }',
>>>>>>> Stashed changes
      id: 'custom-page-font'
    }
  ],
  htmlAttrs: {
    class: 'gift-card-pdf-page'
  },
  bodyAttrs: {
    class: 'gift-card-pdf-page'
  }
})

const route = useRoute()

const { getAppStoreLink } = useAppsInfo()

const { locale } = useI18n()

const url = useRequestURL()

const baseUrl = url.origin

const giftData = computed(() => {
  const raw = url.searchParams.get('data')
  if (!raw) return null

  try {
    return JSON.parse(atob(raw)) as {
      code: string
      expiresAt: string
      period: string
    }
  } catch {
    return null
  }
})

const link = computed(() => {
  const key = route.params.appKey

  if (typeof key === 'string' && key === 'farm') {
    return getAppStoreLink(key)
  }

  return getAppStoreLink('farm')
})

const instructionLink = computed(() => {
  const key = route.params.appKey

  return `${baseUrl}/${locale.value}/a/instruction/how-to-activate-gift-code/${key}`
})

const i18nPath = 'a.gift_card'

const container = ref<HTMLElement>()
const isPdfReady = ref(false)

declare global {
  interface Window {
    __PDF_READY__?: boolean
  }
}

onMounted(async () => {
  if (!container.value) return

  const qr = new QRCodeStyling({
    width: 520,
    height: 520,
    type: 'svg',
    data: link.value as string,
    margin: 0,
    dotsOptions: { type: 'extra-rounded', color: '#5A24B8' },
    cornersSquareOptions: { type: 'extra-rounded', color: '#5A24B8' },
    cornersDotOptions: { type: 'dot', color: '#5A24B8' },
    backgroundOptions: { color: '#ffffff' }
  })

  qr.append(container.value)

<<<<<<< Updated upstream
  // Ждём, пока Vue допатчит DOM и браузер отрисует кадр,
  // и только потом сигналим Playwright, что страница готова к page.pdf().
  await nextTick()

  isPdfReady.value = true
  window.__PDF_READY__ = true
=======
  isPdfReady.value = true
>>>>>>> Stashed changes
})
</script>

<template>
  <div class="page">
    <div class="logo">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="489"
        height="103"
        viewBox="0 0 489 103"
        fill="none"
      >
        <path
          d="M471.468 18.1492H332.481C322.798 18.1492 314.949 25.9905 314.949 35.6633V68.4153C314.949 78.0881 322.798 85.9294 332.481 85.9294H471.468C481.151 85.9294 489 78.0881 489 68.4153V35.6633C489 25.9905 481.151 18.1492 471.468 18.1492Z"
          fill="#FF9432"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M88.1981 31.5059C89.089 30.7528 90.0656 30.1072 91.1077 29.5824C93.2951 28.546 95.6921 28.0269 98.1127 28.0654C101.351 27.9845 104.566 28.6469 107.508 30.0019C109.674 31.0881 111.585 32.6198 113.116 34.4963C114.47 32.7345 116.141 31.2401 118.043 30.0896C120.352 28.7414 122.984 28.0421 125.659 28.0654C131.256 28.0654 135.461 29.859 138.504 33.3969C141.488 36.8679 142.827 41.839 142.827 48.1725V73.2338H130.583V53.6592C130.583 46.9315 129.645 44.0339 128.871 42.7878C127.866 41.1714 126.084 40.385 123.454 40.385C120.699 40.385 118.72 41.2942 117.584 43.1573C116.324 45.2243 115.512 48.9628 115.512 54.2684V73.2306H103.267V53.6592C103.267 46.9705 102.332 44.0697 101.541 42.8144C100.511 41.1799 98.6808 40.385 95.9441 40.385C93.1567 40.385 91.2637 41.2942 90.0878 43.1722C88.7962 45.2353 88.1981 48.9693 88.1981 54.2677V73.2299H75.9525V28.5141H88.1981V31.5059ZM55.1262 73.7404L55.2048 62.239L36.2078 62.4299C35.7527 69.255 34.699 75.8256 32.5246 81.759C27.8514 94.1507 18.5375 102.818 0.13001 103L0 90.0122C11.6359 89.8966 17.37 84.641 20.1873 77.2718C23.5162 68.4679 23.4583 56.2548 23.3426 44.8872C23.2172 32.543 26.784 21.2689 33.6056 13.08C40.2257 5.15032 49.7347 0.183778 61.7008 0.0649391L68.2981 0L68.2331 73.8008L55.1262 73.7404ZM43.6782 21.2948C38.871 27.0588 36.3924 35.3996 36.4879 44.7535C36.5042 46.312 36.5198 47.8705 36.4684 49.4291L55.2042 49.2434L55.2406 13.9639C50.7122 15.1358 46.6674 17.7004 43.6782 21.2948ZM154.436 34.7437C156.542 32.4948 159.101 30.716 161.943 29.5239C164.886 28.3669 168.027 27.7934 171.19 27.8355C174.149 27.7686 177.088 28.332 179.812 29.4882C181.085 30.0268 182.27 30.7524 183.328 31.641V28.5141H195.573V73.2338H183.328V71.0259C182.392 71.7944 181.361 72.4405 180.261 72.9488C177.437 74.1113 174.399 74.6622 171.347 74.5651C164.716 74.5651 159.098 72.2922 154.64 67.8036C150.183 63.315 147.938 57.6906 147.938 51.0662C147.928 48.0206 148.499 45.001 149.622 42.1695C150.721 39.4016 152.357 36.878 154.436 34.7437ZM164.011 58.7927C165.005 59.8187 166.2 60.628 167.522 61.1697C168.845 61.7114 170.265 61.9738 171.693 61.9403C173.047 61.9411 174.386 61.6604 175.625 61.116C176.864 60.5717 177.976 59.7756 178.89 58.7784C179.892 57.8243 180.688 56.6752 181.228 55.4019C181.768 54.1286 182.041 52.7582 182.03 51.3753C182.056 49.9259 181.789 48.4862 181.244 47.1426C180.699 45.799 179.888 44.5792 178.86 43.5566C177.937 42.5314 176.808 41.7122 175.547 41.1527C174.285 40.5932 172.92 40.3059 171.54 40.3097C170.137 40.2807 168.742 40.5391 167.443 41.0688C166.144 41.5985 164.966 42.3884 163.984 43.3897C162.966 44.3569 162.162 45.526 161.623 46.8219C161.085 48.1178 160.823 49.512 160.855 50.9149C160.81 52.3744 161.066 53.8275 161.61 55.1832C162.153 56.5388 162.97 57.7677 164.011 58.7927ZM211.654 28.5141L221.037 55.1158L231.368 28.5148H244.764L220.731 87.2087H207.528L214.028 70.8382L198.177 28.5141H211.654ZM249.972 34.7444C252.074 32.4957 254.628 30.7168 257.467 29.5246C260.402 28.3673 263.535 27.7937 266.69 27.8362C269.633 27.7688 272.556 28.3324 275.263 29.4889C276.507 30.0283 277.661 30.7542 278.686 31.6416V28.5141H290.929V73.2338H278.686V71.0259C277.782 71.7926 276.783 72.439 275.712 72.9488C272.922 74.112 269.915 74.6632 266.894 74.5651C260.263 74.5651 254.643 72.2922 250.187 67.8036C245.731 63.315 243.485 57.6906 243.485 51.0662C243.473 48.0209 244.043 45.0012 245.165 42.1695C246.262 39.4021 247.896 36.8792 249.972 34.7444ZM259.558 58.7933C260.552 59.8191 261.748 60.6283 263.07 61.17C264.392 61.7117 265.812 61.9742 267.241 61.9409C268.594 61.9417 269.933 61.661 271.172 61.1167C272.411 60.5723 273.523 59.7762 274.437 58.779C275.439 57.8249 276.235 56.6757 276.776 55.4025C277.316 54.1292 277.589 52.7589 277.579 51.376C277.606 49.9262 277.338 48.4861 276.793 47.1423C276.248 45.7984 275.436 44.5788 274.406 43.5566C273.484 42.5311 272.355 41.7117 271.093 41.1522C269.832 40.5926 268.466 40.3055 267.086 40.3097C265.683 40.2808 264.289 40.5391 262.99 41.0689C261.69 41.5986 260.513 42.3884 259.531 43.3897C258.513 44.3569 257.709 45.526 257.171 46.8219C256.632 48.1179 256.371 49.5121 256.404 50.9149C256.358 52.3742 256.615 53.8273 257.158 55.1829C257.7 56.5385 258.518 57.7681 259.558 58.7933Z"
          fill="#FF9432"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M329.974 29.6701V73.993H339.382V58.2283H343.418C346.188 58.3 348.949 57.8949 351.581 57.0309C353.574 56.3649 355.385 55.2497 356.877 53.7716C358.177 52.4371 359.158 50.8251 359.745 49.057C360.336 47.2621 360.633 45.3837 360.625 43.4943C360.625 39.1893 359.31 35.809 356.679 33.3534C354.049 30.8978 349.871 29.6701 344.146 29.6701H329.974ZM349.305 38.9622C350.518 40.0237 351.125 41.6457 351.125 43.8281C351.183 45.1815 350.811 46.5185 350.062 47.6478C349.312 48.6691 348.262 49.4319 347.058 49.8304C345.582 50.3241 344.032 50.56 342.476 50.5279H339.381V37.3705H343.659C346.21 37.3705 348.091 37.9011 349.305 38.9622ZM395.155 73.993V66.2321H377.159V29.6713H367.753V73.9943H395.157L395.155 73.993ZM428.112 29.6701V56.7425C428.174 58.663 427.866 60.5775 427.202 62.3812C426.67 63.7712 425.666 64.9301 424.365 65.6554C422.806 66.424 421.079 66.7889 419.343 66.7165C416.409 66.7165 414.194 65.9788 412.697 64.5034C411.199 63.028 410.451 60.4616 410.451 56.8042V29.6701H401.074V58.2283C401.074 63.1603 402.613 67.1215 405.69 70.1122C408.767 73.1029 413.238 74.5986 419.103 74.5995C423.23 74.5995 426.654 73.8821 429.374 72.4474C431.946 71.1555 434.07 69.1226 435.474 66.6113C436.838 64.0736 437.532 61.2301 437.489 58.3498V29.6701H428.112ZM472.84 55.8483C471.92 54.2266 470.65 52.8293 469.123 51.7572C467.292 50.4661 465.347 49.3447 463.311 48.4069C461.45 47.5177 459.898 46.7397 458.654 46.073C457.605 45.5542 456.659 44.8502 455.862 43.995C455.236 43.255 454.907 42.3103 454.936 41.3422C454.919 40.5143 455.14 39.699 455.573 38.9927C456.028 38.2906 456.683 37.7415 457.454 37.4166C458.405 37.0191 459.429 36.8278 460.459 36.8556C462.131 36.8546 463.796 37.084 465.406 37.5374C467.271 38.0782 469.104 38.7207 470.899 39.4622L473.933 32.1566C471.811 31.2035 469.613 30.4277 467.363 29.8369C465.205 29.2937 462.988 29.0238 460.763 29.0336C458.022 28.9692 455.297 29.4805 452.767 30.5344C450.641 31.4264 448.829 32.9304 447.562 34.8548C446.305 36.8923 445.672 39.253 445.742 41.6455C445.694 43.4352 446.052 45.2126 446.789 46.8445C447.444 48.2303 448.355 49.4801 449.474 50.5279C450.527 51.5093 451.688 52.3687 452.935 53.0897C454.148 53.7867 455.271 54.3779 456.302 54.8632C457.941 55.6516 459.413 56.3893 460.718 57.0763C461.858 57.6433 462.898 58.3907 463.799 59.2894C464.164 59.6674 464.452 60.1136 464.644 60.6025C464.837 61.0915 464.931 61.6136 464.921 62.139C464.937 62.9905 464.716 63.8297 464.284 64.5638C463.797 65.3237 463.079 65.9081 462.236 66.2314C461.049 66.6787 459.785 66.8849 458.518 66.838C456.226 66.8271 453.952 66.4482 451.781 65.7158C449.516 64.9686 447.33 64.13 445.226 63.2001V71.9351C446.463 72.53 447.747 73.0218 449.065 73.4053C450.447 73.8069 451.857 74.1058 453.283 74.2995C454.777 74.503 456.282 74.6044 457.79 74.6028C460.825 74.6845 463.845 74.148 466.666 73.026C468.94 72.1506 470.884 70.5872 472.225 68.5543C473.566 66.5214 474.238 64.1207 474.147 61.6877C474.217 59.6619 473.767 57.652 472.842 55.8483H472.84Z"
          fill="white"
        />
      </svg>
    </div>

    <div class="content">
      <header class="header">
        <AppPicture
          class="image-hero"
          path="a/gift-card"
          :only-one="true"
          :only-webp="true"
          name="hero"
        />

        <div class="header-text">
          <div class="header-text-inner">
            <div
              class="title-1"
              v-html="$t(`${i18nPath}.common.gift_card_header_line_1`)"
            />

            <div
              class="title-2"
              v-html="$t(`${i18nPath}.common.gift_card_header_line_2`, [
                giftData?.period
              ])"
            />
          </div>
        </div>
      </header>

      <div class="section">
        <div class="items">
          <div class="item">
            <div
              class="title"
              v-html="$t(`${i18nPath}.common.gift_card_code`)"
            />
            <div class="input">
              {{ giftData?.code ?? '—' }}
            </div>
          </div>

          <div class="item">
            <div
              class="title"
              v-html="$t(`${i18nPath}.common.gift_card_valid_date`)"
            />
            <div class="input">
              {{ giftData?.expiresAt ?? '—' }}
            </div>
          </div>
        </div>
      </div>

      <footer class="footer">
        <div class="how-to">
          <div class="title">
            {{ $t(`${i18nPath}.common.gift_card_howto`) }}
          </div>

          <div class="list">
            <div class="item">
              <div class="number">
                1.
              </div>
              <div
                class="text"
                v-html="$t(`${i18nPath}.common.gift_card_howto_step_1`)"
              />
            </div>
            <div class="item">
              <div class="number">
                2.
              </div>
              <div
                class="text"
                v-html="$t(`${i18nPath}.common.gift_card_howto_step_2`)"
              />
            </div>
            <div class="item">
              <div class="number">
                3.
              </div>
              <div
                class="text"
                v-html="$t(`${i18nPath}.common.gift_card_howto_step_3`)"
              />
            </div>
          </div>

          <div class="instruction">
            <i18n-t
              :keypath="`${i18nPath}.common.gift_card_howto_link`"
              tag="div"
              class="text"
            >
              <!-- <template #link>
                <a
                  :href="instructionLink"
                  target="_blank"
                  v-html="instructionLink"
                />
              </template> -->
            </i18n-t>
            <a
              class="button"
              :href="instructionLink"
              target="_blank"
              v-html="$t(`${i18nPath}.common.gift_card_instructions_button`)"
            />
          </div>
        </div>

        <div class="qr">
          <div
            class="title"
            v-html="$t(`${i18nPath}.common.gift_card_qr`)"
          />

          <div class="code">
            <div
              ref="container"
              class="qr-wrapper"
            />
          </div>

          <a
            class="button"
            :href="link"
            target="_blank"
            v-html="$t(`${i18nPath}.common.gift_card_goto_apps`)"
          />
        </div>
      </footer>
    </div>

    <div
      v-if="isPdfReady"
      data-pdf-ready="true"
      style="display: none;"
    />
  </div>
</template>

<style lang="scss">
/*
  Эти правила НЕ scoped специально, но действуют только на этой странице:
  html/body получают класс .gift-card-pdf-page через useHead (см. <script>),
  и Nuxt сам снимет его при переходе на другую страницу — так что глобально
  на весь проект эти стили не текут.

  Страница используется только для генерации PDF (Playwright),
  поэтому не пытаемся подружить CSS-mm (96dpi) с px-вёрсткой (рассчитанной
  на 150dpi через rem) — это и ломало layout. Вместо этого фиксируем
  html/body в тех же px, что и .page (1240x1754), а физический размер
  страницы (210mm x 297mm @ 150dpi) задаём ПАРАМЕТРАМИ ВЫЗОВА page.pdf():

    const context = await browser.newContext({
      viewport: { width: 1240, height: 1754 },
      deviceScaleFactor: 1
    })
    const page = await context.newPage()
    await page.goto(url)
    await page.waitForSelector('.qr-wrapper svg')
    await page.pdf({
      path: 'gift-card.pdf',
      width: '1240px',
      height: '1754px',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    })

  1240px в page.pdf() сами дадут ровно 210mm на бумаге — пересчитывать
  в CSS не нужно и не надо.
*/
html.gift-card-pdf-page,
body.gift-card-pdf-page {
  margin: 0 !important;
  padding: 0 !important;
  width: 1240px;
  height: 1754px;
  overflow: hidden;
}
</style>

<style scoped lang="scss">
.page {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 51.6666667rem;
  min-width: 51.6666667rem;
  max-width: 51.6666667rem;
  height: 73.0833333rem;
  min-height: 73.0833333rem;
  max-height: 73.0833333rem;
  background-color: #fff;
  color: #5A24B8;
  font-family: 'Nunito', sans-serif;
  overflow: hidden;
<<<<<<< Updated upstream
=======
  page-break-after: always;
  break-after: page;
>>>>>>> Stashed changes

  .logo {
    position: absolute;
    top: 0;
    right: 0;
    display: inline-flex;
    padding: 0.958333333rem 0.958333333rem 0.833333333rem 2.22916667rem;
    border-radius: 0 0 0 2.6875rem;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    background-color: #fff;

    svg {
      width: 10.1875rem;
      height: 2.14583333rem;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
  }

  .header {
    display: flex;
    align-items: center;
    background: linear-gradient(182deg, #AAA1FF -4.65%, #574ACD 84.78%), #FFF;
    color: #fff;

    .image-hero {
      width: 22.6041667rem;
      height: 24.3333333rem;
      margin-right: 0.666666667rem;
    }

    .header-text {
      padding: 2.54166667rem 1.5rem 0 0;
      flex: 1;

      &-inner {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        width: 23.9166667rem;
        min-width: 23.9166667rem;;
        max-width: 23.9166667rem;;
        height: 100%;
      }

      .title {
        &-1 {
          font-size: 2rem;
          line-height: 2.33333333rem;
          font-weight: 800;
        }

        &-2 {
          font-size: 2.29166667rem;
          line-height: 2.66666667rem;
          font-weight: 900;
        }
      }
    }
  }

  .section {
    background-color: #fff;

    .items {
      display: flex;
      align-items: center;
      justify-content: center;

      >:not(:last-child) {
        margin-right: 5.45833333rem;
      }

      .item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .title {
          font-size: 1.33333333rem;
          line-height: 1.5rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 1.29166667rem;
          font-family: 'Open Sans', sans-serif;
        }

        .input {
          padding: 0.5rem 0.833333333rem;
          width: 14.5833333rem;
          background-color: #E1DEFF;
          color: #000;
          text-align: center;
          border-radius: 0.833333333rem;
          font-size: 1.25rem;
          line-height: 1.5rem;
          font-weight: 600;
          font-family: 'Open Sans', sans-serif;
        }
      }
    }
  }

  .footer {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 5rem 0;
    background-color: #E1DEFF;

    .how-to {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 25.62500rem;
      height: 20.4166667rem;

      .title {
        font-size: 2.08333333rem;
        line-height: 1.5rem;
        color: #5A24B8;
        font-weight: 800;
      }

      .list {
        >:not(:last-child) {
          margin-bottom: 1.58333333rem
        }

        .item {
          display: flex;
          align-items: center;

          .number {
            font-size: 2.66666667rem;
            line-height: 1.87500rem;
            font-weight: 900;
            margin-right: 0.791666667rem;
          }

          .text {
            font-family: 'Open Sans', sans-serif;
            font-size: 1rem;
            line-height: 1.5rem;
            font-weight: 400;
            color: #000;
          }
        }
      }

      .instruction {
        margin-right: 0.416666667rem;

        .text {
          font-family: 'Open Sans', sans-serif;
          font-size: 1rem;
          line-height: 1.5rem;
          font-weight: 400;
          color: #000;
          margin-bottom: 0.916666667rem;
        }

        .button {
          display: flex;
          align-items: center;
          justify-content: center;
          align-self: flex-start;
          justify-self: flex-start;
          min-width: 6.66666667rem;
          padding: 0.5rem 0.833333333rem;
          border-radius: 0.833333333rem;
          background-color: #5A24B8;
          color: #fff;
          font-size: 0.75rem;
          line-height: 1.5rem;
          font-weight: 600;
          text-align: center;
          font-family: 'Open Sans', sans-serif;
        }
      }
    }

    .qr {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      width: 16.6666667rem;
      height: 20.4166667rem;

      .title {
        color: #5A24B8;
        font-size: 1.66666667rem;
        line-height: 2.08333333rem;
        font-weight: 800;
      }

      .button {
        display: flex;
        align-items: center;
        justify-content: center;
        align-self: center;
        justify-self: center;
        min-width: 6.66666667rem;
        padding: 0.5rem 0.833333333rem;
        border-radius: 0.833333333rem;
        background-color: #5A24B8;
        color: #fff;
        font-size: 0.75rem;
        line-height: 1.5rem;
        font-weight: 600;
        text-align: center;
        font-family: 'Open Sans', sans-serif;
      }

      .qr-wrapper {
        width: 10.8333rem;
        height: 10.8333rem;
        background: #fff;
        border-radius: 1.25rem;
        overflow: hidden;

        :deep(svg) {
          width: 100% !important;
          height: 100% !important;
        }
      }
    }
  }
}
</style>
