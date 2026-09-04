<script setup lang="ts">
import '~/assets/css/fonts/nunito.css'
import '~/assets/css/fonts/open-sans.css'

import logoSvg from '~/assets/images/l1/svg/logo.svg'
import timerClockSvg from '~/assets/images/l1/svg/timer-clock.svg'
import offerCardSvg from '~/assets/images/l1/svg/offer-card.svg'
import offerCardDesktopSvg from '~/assets/images/l1/svg/offer-card-desktop.svg'
import offerBadgeSvg from '~/assets/images/l1/svg/offer-badge.svg'
import utpAgeSvg from '~/assets/images/l1/svg/utp-age.svg'
import utpCarsSvg from '~/assets/images/l1/svg/utp-cars.svg'
import utpMadeForKidsSvg from '~/assets/images/l1/svg/utp-made-for-kids.svg'
import utpOfflineSvg from '~/assets/images/l1/svg/utp-offline.svg'

import offerCityPng from '~/assets/images/l1/png/offer-city.png'
import offerPlanePng from '~/assets/images/l1/png/offer-plane.png'
import offerCarPng from '~/assets/images/l1/png/offer-car.png'
import checkSvg from '~/assets/images/l1/svg/check.svg'
import starPng from '~/assets/images/l1/png/star.png'
import videoPreviewPng from '~/assets/images/l1/png/video-preview.png'
import cars2Video from '~/assets/videos/Cars2_1280x720.mp4'

useSeoMeta({
  title: 'Mashinalar — Amaya Kids'
})

// `landing_opened` (Mixpanel) + `LandingOpened` (Meta, свой ивент рядом со
// стандартным `PageView`) — человек попал на лендинг. Только на клиенте: на
// SSR оба composable ничего не шлют, иначе событие задублировалось бы на
// гидрации.
const { track } = useL2Mixpanel()
const { trackCustom, trackPageView } = useMetaPixel()

onMounted(() => {
  track('landing_opened')
  trackPageView()
  trackCustom('LandingOpened')
})

/* ------------------------- плашка со временем ------------------------- */

/**
 * Обратный отсчёт от 10:00. Дошёл до нуля — так и стоит на 00:00; ничего
 * при этом не происходит, цена не меняется. Состояние намеренно не
 * сохраняется: по договорённости перезагрузка страницы начинает отсчёт
 * заново — плашка нужна, чтобы поторопить, а не чтобы что-то закрыть.
 */
const OFFER_SECONDS = 10 * 60

const secondsLeft = ref(OFFER_SECONDS)

const timeLeft = computed(() => {
  const minutes = Math.floor(secondsLeft.value / 60)
  const seconds = secondsLeft.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

let ticker: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  ticker = setInterval(() => {
    if (secondsLeft.value > 0) secondsLeft.value -= 1
  }, 1000)
})

onBeforeUnmount(() => {
  if (ticker) clearInterval(ticker)
})

const offerEl = ref<HTMLElement | null>(null)

/** «Batafsil» — единственное действие плашки: подводит к самому предложению. */
function scrollToOffer() {
  offerEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

/* ------------------------------ контент ------------------------------ */

const benefits = [
  'Kichkina poygachilar uchun 75+ mashina',
  'Mashinangizni tanlang, ranglar va g‘ildiraklarni o‘zgartiring, stikerlar bilan bezating va yo‘lga chiqing!',
  '6 ta yorqin poyga trassasi',
  'Ilovaga kirish imkoniyatini o‘z qurilmangizdan sotib oling — ilovani bolangizning iPhone yoki iPad‘iga qurilmasiga o‘rnating'
]

const utpItems = [
  {
    icon: utpAgeSvg,
    title: '2 yoshdan katta bolalar uchun',
    text: 'Mayda motorika va tasavvurni rivojlantiring'
  },
  {
    icon: utpCarsSvg,
    title: '75+ turdagi mashina',
    text: 'Katta o‘t o‘chirish mashinasidan tortib tezkor superqahramon mashinasigacha'
  },
  {
    icon: utpMadeForKidsSvg,
    title: 'Bolalar uchun yaratilgan',
    text: 'Millionlab bolalar va ularning ota-onalari bizga ishonadi.'
  },
  {
    icon: utpOfflineSvg,
    title: 'Oflayn o‘ynang',
    text: 'Internet yo‘qmi? Hechqisi yo‘q! Oflayn o‘ynashingiz mumkin.'
  }
]

const reviews = [
  {
    text: 'Egizaklarimiz turli transport vositalari va topshiriqlarni yaxshi ko‘rishadi. Bir nechta qurilmada o‘ynash mumkin, shuning uchun endi telefon uchun talashmaymiz. Biri har doim planshetda o‘ynashi mumkin.',
    author: 'LoveYourLife'
  },
  {
    text: '4 yoshli jiyanim bu o‘yinni juda yaxshi ko‘radi. Bu kichkintoylar uchun eng yaxshi mashina o‘yinlaridan biri! Uni o‘ynash juda oson, jiyanim esa turli xil mashina va yuk mashinalarini tanlashni juda yaxshi ko‘radi! O‘yinda hatto avtomoyka ham bor, mashina yoki yuk mashinasini bo‘yash va unga rasm chizish ham mumkin. Umuman olganda, 3 yoshdan katta bolalar uchun ajoyib mashina o‘yini!',
    author: 'Aunt Stacy M'
  },
  {
    text: 'Nevaram 2 yoshda. U bu o‘yinni juda yaxshi o‘ynaydi va unga ko‘p vaqt ajratadi. To‘siqlar yo‘lining oxiriga yetib, mukofot sifatida suratga tushganida juda xursand bo‘ladi.',
    author: 'kimkim57'
  },
  {
    text: 'Bizda barcha turdagi transport jamlangan. Bekorga emas! Qiziqarli o‘yinlar, ustiga-ustak internetsiz ham o‘ynash mumkin — uzoq safarlarda juda qo‘l keladi.',
    author: 'LostHero'
  }
]

/* --------------------------- лента отзывов --------------------------- */

/**
 * Отзывы листаются горизонтально, а под ними — индикатор прокрутки из
 * макета. Нативный скроллбар для этого не годится: его вид не задать
 * одинаково в Safari и Chrome, поэтому он спрятан, а полоска считается по
 * позиции прокрутки.
 */
const reviewsEl = ref<HTMLElement | null>(null)
const scrollThumb = reactive({ width: 100, offset: 0 })

function updateScrollThumb() {
  const el = reviewsEl.value
  if (!el) return

  const scrollable = el.scrollWidth - el.clientWidth

  scrollThumb.width = Math.min(100, (el.clientWidth / el.scrollWidth) * 100)
  // Ползунок ходит по остатку дорожки, поэтому смещение считается от того,
  // сколько её остаётся свободной, а не от полной ширины.
  scrollThumb.offset = scrollable > 0
    ? (el.scrollLeft / scrollable) * (100 - scrollThumb.width)
    : 0
}

onMounted(() => {
  updateScrollThumb()
  window.addEventListener('resize', updateScrollThumb)
})

onBeforeUnmount(() => window.removeEventListener('resize', updateScrollThumb))

/* ------------------------------- видео ------------------------------- */

const gameplayVideo = ref<HTMLVideoElement | null>(null)

onMounted(() => {
  const video = gameplayVideo.value
  if (!video) return
  video.muted = true
  video.playsInline = true
  void video.play()
})
</script>

<template>
  <div class="l1">
    <L2TesterBanner />

    <div class="page">
      <!-- Header -->
      <header class="header">
        <NuxtLink
          class="header__logo"
          to="/"
        >
          <img
            :src="logoSvg"
            width="166"
            height="52"
            alt="Amaya Kids"
          >
        </NuxtLink>
      </header>

      <!-- Главный блок: геймплей, оффер и список того, что входит -->
      <section class="main">
        <div class="main__video">
          <video
            ref="gameplayVideo"
            :src="cars2Video"
            :poster="videoPreviewPng"
            width="1280"
            height="720"
            autoplay
            muted
            loop
            playsinline
            webkit-playsinline
            disablepictureinpicture
            controlslist="nodownload nofullscreen noremoteplayback"
            preload="auto"
            aria-label="Kids Cars 2 o‘yini videosi"
          />
        </div>

        <div class="sticky">
          <div class="timer">
            <span class="timer__label">Cheklangan taklif:</span>
            <img
              class="timer__clock"
              :src="timerClockSvg"
              alt=""
            >
            <span class="timer__value">{{ timeLeft }}</span>
            <button
              class="timer__cta"
              type="button"
              @click="scrollToOffer"
            >
              Batafsil
            </button>
          </div>
        </div>

        <h1 class="main__title">
          Mashinalar va sarguzashtlar olamiga xush kelibsiz!
        </h1>

        <div
          ref="offerEl"
          class="offer"
        >
          <img
            class="offer__city"
            :src="offerCityPng"
            alt=""
          >
          <img
            class="offer__shape offer__shape--mobile"
            :src="offerCardSvg"
            alt=""
          >
          <img
            class="offer__shape offer__shape--tablet"
            :src="offerCardDesktopSvg"
            alt=""
          >
          <img
            class="offer__plane"
            :src="offerPlanePng"
            alt=""
          >
          <img
            class="offer__car"
            :src="offerCarPng"
            alt=""
          >

          <div class="offer__badge">
            <img
              :src="offerBadgeSvg"
              alt=""
            >
            <span>Eng yaxshi taklif</span>
          </div>

          <div class="offer__price">
            <p class="offer__period">
              Umrbod
            </p>
            <p class="offer__only">
              Atigi
            </p>
            <p class="offer__amount">
              50 000 so‘m
            </p>
            <p class="offer__old">
              100 000 so‘m
            </p>
          </div>

          <NuxtLink
            class="btn offer__btn"
            to="/auth"
          >
            Davom etish
          </NuxtLink>
        </div>

        <ul class="benefits">
          <li
            v-for="benefit in benefits"
            :key="benefit"
            class="benefits__item"
          >
            <img
              class="benefits__check"
              :src="checkSvg"
              alt=""
            >
            <span>{{ benefit }}</span>
          </li>
        </ul>
      </section>

      <!-- УТП -->
      <section class="utp">
        <h2 class="utp__title">
          Kichkintoylar uchun qiziqarli va foydali o‘yin
        </h2>

        <div class="utp__grid">
          <div
            v-for="item in utpItems"
            :key="item.title"
            class="utp__item"
          >
            <img
              :src="item.icon"
              width="160"
              height="131"
              alt=""
            >
            <div class="utp__text">
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
            </div>
          </div>
        </div>

        <NuxtLink
          class="btn"
          to="/auth"
        >
          Davom etish
        </NuxtLink>
      </section>

      <!-- Отзывы -->
      <section class="reviews">
        <div
          ref="reviewsEl"
          class="reviews__track"
          @scroll.passive="updateScrollThumb"
        >
          <article
            v-for="review in reviews"
            :key="review.author"
            class="review"
          >
            <p class="review__text">
              {{ review.text }}
            </p>
            <div class="review__stars">
              <img
                v-for="n in 5"
                :key="n"
                :src="starPng"
                width="15"
                height="14"
                alt=""
              >
            </div>
            <p class="review__author">
              {{ review.author }}
            </p>
          </article>
        </div>

        <div
          class="reviews__scrollbar"
          aria-hidden="true"
        >
          <span
            class="reviews__thumb"
            :style="{ width: `${scrollThumb.width}%`, left: `${scrollThumb.offset}%` }"
          />
        </div>

        <NuxtLink
          class="btn reviews__btn"
          to="/auth"
        >
          Davom etish
        </NuxtLink>
      </section>

      <L1Footer solid />
    </div>
  </div>
</template>

<style scoped lang="scss">
/* =========================================================
   Лендинг l1 по макету Figma «Cars 1 / PW_locals_Cars1_UZ-3»,
   фреймы Main Mobile (375) и Main Desktop (внутренняя страница 768).
   Mobile-first; `md-tablet` (>=768px) соответствует десктопному фрейму.
   ========================================================= */

.l1 {
  font-family: "Nunito", "Helvetica Neue", Arial, sans-serif;
  background: #e4f8ff;
  color: #342673;
  -webkit-font-smoothing: antialiased;
  padding: 0;

  @include md-tablet {
    padding: 0 24px;
  }

  @include md-desktop {
    padding: 0 44px;
  }

  /* Сброса `h1, h2, h3, p { font-weight: 400 }` здесь намеренно нет: в
     scoped-стилях он превращается в `.l1 h1[data-v-…]`, что по
     специфичности сильнее одноклассового `.main__title[data-v-…]`, и все
     начертания молча съезжали на 400. Толщина задаётся каждому элементу
     явно. По той же причине убраны общий сброс размеров у `img` и
     `a { color: inherit }` — они точно так же перебивали цвет надписи на
     кнопке. Размеры и цвета проставлены поэлементно. */
  img {
    display: block;
    border: 0;
  }
}

.page {
  /* Городская панорама под оффером шире вьюпорта — обрезаем её здесь,
     чтобы не появлялся горизонтальный скролл.
     `clip` вместо `hidden` принципиально: `hidden` делает блок контейнером
     прокрутки, и тогда плашка с таймером внутри перестаёт быть `sticky`
     (ей не за что цепляться — этот контейнер сам не прокручивается).
     `hidden` оставлен первой строкой как фолбэк для браузеров без `clip`:
     там плашка просто не залипает, вёрстка при этом не ломается. */
  overflow: hidden;
  overflow: clip;
  background: #ffffff;
  margin: 0 auto;
  box-shadow: 0 0 50px rgba(0, 57, 77, 0.2);

  /* Ширина страницы в макете — 768 (фрейм Main Desktop), поэтому ограничение
     стоит уже с планшетного брейкпойнта: иначе на 892 карточка растянулась бы
     до 844 и все внутренние размеры разъехались бы с макетом. */
  @include md-tablet {
    max-width: 768px;
  }
}

/* ---------- общая кнопка ----------
   Figma: `button` 186×44, радиус 157, нижняя кромка 4px, надпись Nunito
   Black 18/18 в верхнем регистре, сплошная белая (на экранах воронки она,
   в отличие от этой, залита градиентом). */

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 28px;
  appearance: none;
  border: 0;
  border-bottom: 4px solid #017c2e;
  border-radius: 157px;
  background-image: linear-gradient(to top, #079d27 0%, #00a846 12%, #14ef6f 100%);
  box-shadow:
    0 2px 1px 0 rgba(0, 0, 0, 0.4),
    0 14px 14px -5px rgba(0, 0, 0, 0.25),
    0 25px 25px -11px rgba(0, 0, 0, 0.25),
    0 29px 50px 0 rgba(0, 0, 0, 0.2);
  font-weight: 900;
  font-size: 18px;
  line-height: 18px;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  white-space: nowrap;
  color: #ffffff;
  text-shadow: 0 2px 1px rgba(0, 0, 0, 0.2);
  cursor: pointer;
}

/* ---------- шапка ---------- */

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 24px;
  background: #05b8f6;

  @include md-tablet {
    padding: 12px 24px;
  }

  &__logo {
    display: block;
    width: 83px;
    height: 26px;
    line-height: 0;
    text-decoration: none;

    img {
      width: 100%;
      height: 100%;
    }

    @include md-tablet {
      width: 113px;
      height: 35.5px;
    }
  }
}

/* ---------- главный блок ---------- */

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 56px;
  background: #00ace8;

  &__video {
    width: 100%;
    line-height: 0;

    video {
      display: block;
      width: 100%;
      height: auto;
    }
  }

  &__title {
    /* Между плашкой и заголовком — 20 (gap блока `left`), под заголовком —
       16 собственного отступа плюс те же 20 до карточки. */
    margin-bottom: 36px;
    padding: 0;
    font-weight: 900;
    font-size: 24px;
    line-height: 24px;
    text-align: center;
    color: #ffffff;

    @include md-tablet {
      margin-bottom: 44px;
      padding: 0 56px;
      font-size: 32px;
      line-height: 32px;
    }
  }
}

/* Плашка ограниченного предложения. `sticky` — как в макете: пока виден
   главный блок, она держится у верхней кромки, дальше уезжает вместе с ним.
   Своя подложка нужна именно для этого — под ней проезжает контент. */
.sticky {
  position: sticky;
  top: 0;
  z-index: 6;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 8px 0;
  margin-top: 24px;
  margin-bottom: 20px;
  background: #00ace8;
}

.timer {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: calc(100% - 28px);
  padding: 2px 2px 2px 20px;
  border-radius: 99px;
  background: rgba(204, 0, 254, 0.16);

  @include md-tablet {
    padding: 6px 6px 6px 20px;
  }

  &__label {
    font-weight: 700;
    font-size: 16px;
    line-height: 16px;
    color: #ffffff;
    white-space: nowrap;

    @include md-tablet {
      font-size: 14px;
      line-height: 14px;
    }
  }

  &__clock {
    flex-shrink: 0;
    width: 24px;
    height: 22px;
  }

  &__value {
    /* Моноширинные цифры: без них строка дёргается на каждой смене секунды. */
    font-variant-numeric: tabular-nums;
    font-weight: 900;
    font-size: 16px;
    line-height: 16px;
    color: #ffffff;
  }

  &__cta {
    flex-shrink: 0;
    padding: 8px 15px;
    appearance: none;
    border: 0;
    border-radius: 99px;
    background: #cc00fe;
    cursor: pointer;
    font-family: inherit;
    font-weight: 900;
    font-size: 14px;
    line-height: 12px;
    text-transform: uppercase;
    color: #ffffff;
    white-space: nowrap;

    @include md-tablet {
      padding: 12px 20px;
    }
  }
}

/* ---------- оффер ----------
   Карточка — фиксированный кадр из макета: панорама города, самолёт и
   машинка расставлены относительно её краёв, поэтому размеры заданы в
   пикселях. На планшете растёт только сама карточка (245×213 → 303×237),
   украшения сохраняют размер и привязку к кромкам.
 */

.offer {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 245px;
  height: 213px;

  @include md-tablet {
    width: 303px;
    height: 237px;
  }

  &__city {
    position: absolute;
    left: 50%;
    top: calc(50% + 1px);
    z-index: 0;
    width: 649.589px;
    height: 210.274px;
    max-width: none;
    transform: translate(-50%, -50%);
    object-fit: cover;
  }

  &__shape {
    position: absolute;
    inset: 0;
    z-index: 1;
    width: 100%;
    height: 100%;

    &--mobile {
      @include md-tablet {
        display: none;
      }
    }

    /* Отдельный контур: у планшетной карточки другие пропорции, и растянутый
       мобильный контур исказил бы скругления. */
    &--tablet {
      display: none;

      @include md-tablet {
        display: block;
      }
    }
  }

  &__plane {
    position: absolute;
    left: -61.9px;
    top: 18.4px;
    z-index: 2;
    width: 106.597px;
    height: 75.101px;
    max-width: none;
  }

  &__car {
    position: absolute;
    right: -98.5px;
    bottom: -16.55px;
    z-index: 2;
    width: 140.287px;
    height: 99.097px;
    max-width: none;
  }

  &__badge {
    position: absolute;
    left: 50%;
    top: -10.9px;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 151.76px;
    height: 36.13px;
    transform: translateX(-50%);

    img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    span {
      position: relative;
      font-weight: 800;
      font-size: 16px;
      line-height: 16px;
      color: #ffffff;
      white-space: nowrap;
    }
  }

  &__price {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    text-align: center;
    white-space: nowrap;
  }

  &__period {
    font-weight: 900;
    font-size: 28px;
    line-height: 28px;
    text-transform: uppercase;
    color: #342673;
  }

  &__only,
  &__amount {
    font-weight: 900;
    font-size: 22px;
    line-height: 20px;
    color: #cc00ff;
  }

  &__old {
    font-weight: 700;
    font-size: 18px;
    line-height: 18px;
    color: #8b81b9;
    text-decoration: line-through;
  }

  &__btn {
    position: absolute;
    left: 50%;
    bottom: -11px;
    z-index: 3;
    transform: translateX(-50%);
  }
}

/* ---------- что входит ---------- */

.benefits {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 251px;
  margin-top: 56px;
  list-style: none;

  @include md-tablet {
    gap: 12px;
    width: 374px;
    margin-top: 72px;
  }

  &__item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-weight: 700;
    font-size: 14px;
    line-height: 16px;
    color: #ffffff;
  }

  /* Иконка 16×16 с белой обводкой 2px, которая в макете выходит за её
     границы, — отсюда 18px картинка с компенсирующим отрицательным полем:
     занимаемое место остаётся 16. */
  &__check {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    margin: -1px -1px -1px -1px;
  }
}

/* ---------- УТП ---------- */

.utp {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 24px 8px 44px;
  background: #ffffff;

  &__title {
    max-width: 247px;
    font-weight: 900;
    font-size: 32px;
    line-height: 32px;
    text-align: center;
    color: #342673;

    @include md-tablet {
      max-width: 640px;
    }
  }

  &__grid {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: center;
    gap: 12px 24px;
    width: 100%;

    @include md-tablet {
      /* Сетка 2×2 и на планшете: в макете третья колонка не появляется,
         поэтому ширина ограничена двумя колонками, а не отдана флексу. */
      gap: 12px 56px;
      max-width: 496px;
      margin: 0 auto;
    }
  }

  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    width: 160px;
    text-align: center;
    color: #342673;

    @include md-tablet {
      width: 220px;
    }

    img {
      width: 160px;
      height: 130.91px;
    }
  }

  &__text {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;

    h3 {
      font-weight: 800;
      font-size: 20px;
      line-height: 22px;
    }

    p {
      font-weight: 600;
      font-size: 14px;
      line-height: 18px;
    }
  }
}

/* ---------- отзывы ---------- */

.reviews {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 32px;
  background: #9fe6ff;

  &__track {
    display: flex;
    /* Карточки разной высоты, выровненные по центру, — ровно та «лесенка»,
       что нарисована в макете. */
    align-items: center;
    gap: 16px;
    width: 100%;
    padding: 16px;
    overflow-x: auto;
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__scrollbar {
    position: relative;
    width: 300px;
    max-width: calc(100% - 48px);
    height: 16px;
    padding: 4px;
    border-radius: 24px;
    background: #e5f8ff;
    box-sizing: border-box;
  }

  &__thumb {
    position: absolute;
    top: 4px;
    height: 8px;
    min-width: 24px;
    border-radius: 24px;
    background: #00aeea;
    transition: left 0.1s linear;
  }

  &__btn {
    margin-top: 32px;
  }
}

.review {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 248px;
  padding: 20px;
  border-radius: 24px;
  background: #e5f8ff;
  scroll-snap-align: center;

  &__text {
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    color: #342673;
  }

  &__stars {
    display: flex;
    align-items: center;
    gap: 2px;

    img {
      width: 15px;
      height: 14px;
    }
  }

  &__author {
    font-weight: 900;
    font-size: 20px;
    line-height: 28px;
    color: #342673;
  }
}
</style>
