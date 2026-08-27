<script setup lang="ts">
import '~/assets/css/fonts/nunito.css'
import '~/assets/css/fonts/open-sans.css'

import logoSvg from '~/assets/images/l2/svg/logo.svg'
import congratsBubbleSvg from '~/assets/images/l2/svg/congrats-bubble.svg'
import congratsAdv1DesktopSvg from '~/assets/images/l2/svg/congrats-adv1-desktop.svg'
import congratsAdv1MobileSvg from '~/assets/images/l2/svg/congrats-adv1-mobile.svg'
import congratsAdv2DesktopSvg from '~/assets/images/l2/svg/congrats-adv2-desktop.svg'
import congratsAdv2MobileSvg from '~/assets/images/l2/svg/congrats-adv2-mobile.svg'
import utpAgeSvg from '~/assets/images/l2/svg/utp-age.svg'
import utpCarsSvg from '~/assets/images/l2/svg/utp-cars.svg'
import utpMadeForKidsSvg from '~/assets/images/l2/svg/utp-made-for-kids.svg'
import utpOfflineSvg from '~/assets/images/l2/svg/utp-offline.svg'

import headPicPng from '~/assets/images/l2/png/head-pic.png'
import videoPreviewPng from '~/assets/images/l2/png/video-preview.png'
import cars2Video from '~/assets/videos/Cars2_1280x720.mp4'
import commasPng from '~/assets/images/l2/png/commas.png'
import starPng from '~/assets/images/l2/png/star.png'

useSeoMeta({
  title: 'Mashinalar — Amaya Kids'
})

// `landing_opened` — человек попал на лендинг. Только на клиенте: на SSR
// composable ничего не шлёт, иначе событие дублировалось бы на гидрации.
const { track } = useL2Mixpanel()

onMounted(() => track('landing_opened'))

/**
 * Meta Pixel. Пока подключён только здесь, на «/», и шлёт единственное
 * событие `PageView` — как заход на лендинг.
 *
 * Id пикселя не секрет (он и так виден в исходнике страницы у любого
 * посетителя), поэтому лежит константой, а не в runtimeConfig — в отличие от
 * серверного токена Mixpanel.
 */
const META_PIXEL_ID = '1444729859450432'

// Загрузчик — дословный сниппет Meta. Единственное отличие: `init`/`track`
// обёрнуты флагом, потому что при возврате на «/» клиентским роутингом
// (например, по логотипу со страницы регистрации) компонент монтируется
// заново и PageView улетал бы повторно. Сам загрузчик у Meta уже
// идемпотентен — он выходит по `if (f.fbq) return`.
useHead({
  script: [
    {
      key: 'meta-pixel',
      tagPriority: 'high',
      innerHTML: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
if(!window.__metaPixelStarted){window.__metaPixelStarted=!0;
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');}`
    }
  ],
  // Фолбэк для выключенного JS — из того же сниппета Meta. Через useHead,
  // а не разметкой, чтобы id пикселя не дублировался в файле.
  noscript: [
    {
      key: 'meta-pixel-noscript',
      tagPosition: 'bodyOpen',
      innerHTML: `<img height="1" width="1" style="display:none" `
        + `src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1" alt="" />`
    }
  ]
})

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
    text: 'Internet yo‘qmi? Hechqisi yo‘q!<br/>Oflayn o‘ynashingiz mumkin.'
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
  <div class="l2">
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

      <!-- Hero -->
      <section class="congrats">
        <div class="congrats__pic">
          <img
            class="congrats__pic-bg"
            :src="headPicPng"
            alt=""
          >
        </div>

        <div class="congrats__bubble">
          <img
            class="congrats__bubble-bg"
            :src="congratsBubbleSvg"
            alt=""
          >

          <div class="adv adv--1">
            <img
              class="adv__bg adv__bg--desktop"
              :src="congratsAdv1DesktopSvg"
              alt=""
            >
            <img
              class="adv__bg adv__bg--mobile"
              :src="congratsAdv1MobileSvg"
              alt=""
            >
            <p>Umrbod, yashirin to‘lovlarsiz.</p>
          </div>

          <div class="adv adv--2">
            <img
              class="adv__bg adv__bg--desktop"
              :src="congratsAdv2DesktopSvg"
              alt=""
            >
            <img
              class="adv__bg adv__bg--mobile"
              :src="congratsAdv2MobileSvg"
              alt=""
            >
            <p>Ro‘yxatdan o‘ting, yuklab oling va o‘ynang!</p>
          </div>

          <div class="congrats__content">
            <h1 class="congrats__title">
              Tabriklaymiz!
            </h1>
            <p class="congrats__subtitle">
              Siz «Mashinalar» ilovasidan BEPUL to‘liq foydalanish imkoniga ega bo‘ldingiz!
            </p>
            <NuxtLink
              class="btn congrats__btn"
              to="/auth"
            >
              Bepul o‘ynang!
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- UTP -->
      <section class="utp">
        <div class="utp__grid">
          <div
            v-for="item in utpItems"
            :key="item.title"
            class="utp__item"
          >
            <img
              :src="item.icon"
              width="200"
              height="164"
              alt=""
            >
            <div class="utp__text">
              <h3>{{ item.title }}</h3>
              <p v-html="item.text" />
            </div>
          </div>
        </div>

        <NuxtLink
          class="btn utp__btn"
          to="/auth"
        >
          Bepul o‘ynang!
        </NuxtLink>
      </section>

      <!-- Video -->
      <section class="video">
        <div class="video__frame">
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
            aria-label="Видео игры Kids Cars 2"
          />
        </div>
      </section>

      <!-- Reviews -->
      <section class="reviews">
        <div class="reviews__list">
          <article
            v-for="review in reviews"
            :key="review.author"
            class="review"
          >
            <div class="review__head">
              <img
                class="review__commas"
                :src="commasPng"
                width="38"
                height="33"
                alt=""
              >
              <div class="review__stars">
                <img
                  v-for="n in 5"
                  :key="n"
                  :src="starPng"
                  width="23"
                  height="22"
                  alt=""
                >
              </div>
            </div>
            <p class="review__text">
              {{ review.text }}
            </p>
            <p class="review__author">
              {{ review.author }}
            </p>
          </article>
        </div>

        <NuxtLink
          class="btn reviews__btn"
          to="/auth"
        >
          Bepul o‘ynang!
        </NuxtLink>

        <!-- Footer -->
        <footer class="footer">
          <div class="footer__company">
            <p>2026, Amaya Kids</p>
            <p>Barcha huquqlar himoyalangan</p>
          </div>

          <nav class="footer__links">
            <NuxtLink to="/legal/terms-of-use">
              Foydalanish shartlari
            </NuxtLink>
            <NuxtLink to="/legal/privacy-policy">
              Maxfiylik siyosati
            </NuxtLink>
          </nav>
        </footer>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* =========================================================
   Machinki — landing page
   Mobile-first. Breakpoints: md-tablet (>=768px), md-desktop (>=1024px)
   — see app/assets/css/breakpoints.scss for the mixins.
   All sizes are in pixels. Vendor prefixes are kept for
   older iOS Safari / Android WebKit browsers.
   ========================================================= */

.l2 {
  font-family: "Nunito", "Helvetica Neue", Arial, sans-serif;
  background: #ebfaff;
  color: #3c4267;
  -webkit-font-smoothing: antialiased;
  padding: 0;

  @include md-tablet {
    padding: 24px;
  }

  @include md-desktop {
    padding: 44px;
  }

  // img {
  //   display: block;
  //   max-width: 100%;
  //   height: auto;
  //   border: 0;
  // }

  // a {
  //   text-decoration: none;
  //   color: inherit;
  // }

  // h1, h2, h3, p {
  //   font-weight: 400;
  // }
}

.page {
  overflow: hidden;
  background: #ffffff;
  border-radius: 0;
  margin: 0 auto;

  @include md-tablet {
    border-radius: 40px;
    box-shadow: 0 30px 90px rgba(0, 0, 0, 0.15);
  }

  @include md-desktop {
    max-width: 768px;
    box-shadow: 0 40px 140px rgba(0, 0, 0, 0.18);
  }
}

/* ---------- eyebrow pill (section lead-in label) ---------- */

.eyebrow {
  display: inline-flex;
  padding: 6px 16px;
  border-radius: 99px;
  background: #ff8800;
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 900;
  font-size: 13px;
  line-height: 18px;
  color: #ffffff;
  text-align: center;

  @include md-tablet {
    padding: 8px 20px;
    font-size: 16px;
    line-height: 22px;
  }
}

/* ---------- shared button ---------- */

.btn {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  height: 48px;
  padding: 0 28px;
  -webkit-appearance: none;
  appearance: none;
  border: 0;
  border-bottom: 6px solid #017c2e;
  border-radius: 120px;
  -webkit-border-radius: 120px;
  background-color: #079d27;
  background-image: -webkit-linear-gradient(bottom, #079d27 0%, #00a846 12%, #14ef6f 100%);
  background-image: linear-gradient(to top, #079d27 0%, #00a846 12%, #14ef6f 100%);
  -webkit-box-shadow: 0 2px 1px rgba(0, 0, 0, 0.4), 0 19px 14px -5px rgba(0, 0, 0, 0.25), 0 34px 25px -11px rgba(0, 0, 0, 0.25), 0 44px 50px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 1px rgba(0, 0, 0, 0.4), 0 19px 14px -5px rgba(0, 0, 0, 0.25), 0 34px 25px -11px rgba(0, 0, 0, 0.25), 0 44px 50px rgba(0, 0, 0, 0.2);
  cursor: pointer;

  span,
  & {
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 900;
    font-size: 18px;
    line-height: 24px;
    text-align: center;
    color: #ffffff;
    text-shadow: 0 2px 1px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }
}

/* ---------- header ---------- */

.header {
  background: #05b8f6;
  display: flex;
  padding: 24px 56px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 10px;
  align-self: stretch;

  @include md-tablet {
    padding: 24px 56px;
    align-items: flex-start;
  }

  @include md-desktop {
    padding: 28px 64px;
  }

  &__logo {
    display: block;
    width: 165.75px;
    height: 52px;
    line-height: 0;
    text-decoration: none;

    img {
      display: block;
      width: 100%;
      height: 100%;
    }

    @include md-tablet {
      width: 166px;
      height: 52px;
    }
  }
}

/* ---------- congrats-style hero ----------
   Ported from uz/congrats.html + uz/css/congrats.css — two fixed frames
   (base <768px, >=768px), not a fluid layout: the bubble and the two
   advantage blobs are fixed pixel sizes, centered via left:50% + translateX,
   which stays centered regardless of .page's own width. */

.congrats {
  position: relative;
  padding-bottom: 273px; /* reserves room below the picture for the bubble, which overlaps its bottom edge */

  @include md-tablet {
    padding-bottom: 265px;
  }

  &__pic {
    position: relative;
    width: 100%;
    height: 319px;
    overflow: hidden;
    background: #05b8f6;

    @include md-tablet {
      height: 338px;
    }

    &-bg {
      width: 100%;
      height: 100% !important;
      object-fit: cover;
      object-position: 68% 55%;

      @include md-tablet {
        object-position: 50% 64%;
      }
    }
  }

  &__bubble {
    position: absolute;
    left: 50%;
    top: 210px;
    transform: translateX(-50%);
    z-index: 1;
    width: 398px;
    height: 342px;
    display: flex;
    flex-direction: column;

    @include md-tablet {
      top: 197px;
    }

    &-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }
  }

  &__content {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    padding: 0 56px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    > * {
      margin-top: 20px;

      &:first-child {
        margin-top: 0;
      }
    }
  }

  &__title {
    width: 100%;
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 900;
    font-size: 44px;
    line-height: 44px;
    text-align: center;
    color: #ffffff;
  }

  &__subtitle {
    width: 100%;
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 900;
    font-size: 20px;
    line-height: 24px;
    text-align: center;
    color: #ffffff;
  }

  &__btn {
    height: 60px;
    padding: 0 32px;
    color: #fff;

    span,
    & {
      font-size: 22px;
      line-height: 22px;
    }
  }
}

/* purple / orange advantage call-outs — sit side by side below the bubble on
   mobile, flank it diagonally (partly overlapping) on tablet+ */

.adv {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  text-align: center;

  p {
    position: relative;
    z-index: 1;
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 900;
    font-size: 16px;
    line-height: 20px;
    color: #ffffff;
  }

  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;

    &--desktop {
      display: none;

      @include md-tablet {
        display: block;
      }
    }

    &--mobile {
      @include md-tablet {
        display: none;
      }
    }
  }

  &--1 {
    left: 6.5px;
    top: 278px;
    width: 203px;
    height: 132px;

    @include md-tablet {
      left: -135px;
      top: 82px;
      width: 168px;
      height: 112px;
    }
  }

  &--2 {
    left: 179.5px;
    top: 279px;
    width: 212px;
    height: 131px;

    @include md-tablet {
      left: 350px;
      top: 198px;
      width: 191px;
      height: 118px;
    }
  }
}

/* ---------- UTP ---------- */

.utp {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  padding: 32px 16px 40px;
  margin-top: 32px;

  @include md-tablet {
    padding: 0 56px 56px;
  }

  @include md-desktop {
    padding: 0 64px 64px;
    margin-top: -32px;
    padding-top: 0;
    padding-bottom: 24px;
  }

  &__badges {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-flex-wrap: wrap;
    flex-wrap: wrap;
    margin-bottom: 24px;
  }

  &__badge {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    flex-direction: column;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    padding: 8px 20px;
    margin: 4px;
    border-radius: 99px;
    background: #ff8800;
    color: #ffffff;

    &-title {
      font-family: "Nunito", Arial, sans-serif;
      font-weight: 900;
      font-size: 16px;
      line-height: 20px;
    }

    &-text {
      font-family: "Nunito", Arial, sans-serif;
      font-weight: 700;
      font-size: 12px;
      line-height: 16px;
    }
  }

  &__grid {
    /* always a 2-column grid, from 375px up */
    width: 100%;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    justify-content: center;
  }

  &__item {
    width: 158px;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    flex-direction: column;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    margin: 24px 6px 0;

    @include md-tablet {
      width: 240px;
      margin: 16px 28px 0;
    }

    @include md-desktop {
      width: 250px;
      margin-left: 32px;
      margin-right: 32px;
    }

    &:nth-child(1),
    &:nth-child(2) {
      margin-top: 0;

      @include md-tablet {
        margin-top: 0;
      }
    }

    img {
      width: 140px;
      height: 115px;

      @include md-tablet {
        width: 200px;
        height: 164px;
      }
    }
  }

  &__text {
    width: 100%;
    margin-top: 12px;
    text-align: left;
    color: #3c4267;

    h3 {
      font-family: "Nunito", Arial, sans-serif;
      font-weight: 800;
      font-size: 15px;
      line-height: 19px;

      @include md-tablet {
        font-size: 20px;
        line-height: 24px;
      }
    }

    p {
      margin-top: 6px;
      font-family: "Nunito", Arial, sans-serif;
      font-weight: 600;
      font-size: 13px;
      line-height: 17px;

      @include md-tablet {
        font-size: 16px;
        line-height: 22px;
      }
    }
  }

  &__btn {
    margin-top: 32px;
    height: 52px;
    padding: 0 32px;
    color: #fff;

    span,
    & {
      font-size: 19px;
    }

    @include md-tablet {
      margin-top: 40px;
      height: 64px;
      padding: 0 40px;

      span,
      & {
        font-size: 24px;
      }
    }
  }
}

/* ---------- video ---------- */

.video {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  padding: 32px 16px 40px;
  position: relative;
  z-index: 1;

  @include md-tablet {
    padding: 80px 24px;
  }

  @include md-desktop {
    padding: 24px 24px;
  }

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60%;
    background-color: #05b8f6;
    z-index: -1;
  }

  &__eyebrow {
    margin-bottom: 16px;
  }

  &__frame {
    width: 100%;
    max-width: 720px;
    overflow: hidden;
    border-bottom: 5px solid #015b7c;
    border-radius: 20px;
    -webkit-border-radius: 20px;
    -webkit-box-shadow: 0 2px 1px rgba(0, 0, 0, 0.4), 0 19px 14px rgba(0, 0, 0, 0.25), 0 34px 25px rgba(0, 0, 0, 0.25), 0 44px 50px rgba(0, 0, 0, 0.2);
    box-shadow: 0 2px 1px rgba(0, 0, 0, 0.4), 0 19px 14px rgba(0, 0, 0, 0.25), 0 34px 25px rgba(0, 0, 0, 0.25), 0 44px 50px rgba(0, 0, 0, 0.2);

    @include md-tablet {
      border-bottom-width: 8px;
      border-radius: 32px;
      -webkit-border-radius: 32px;
    }

    img,
    video {
      display: block;
      width: 100%;
      height: auto;
    }
  }
}

/* ---------- reviews ---------- */

.reviews {
  background: #05b8f6;
  padding-top: 32px;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;

  @include md-tablet {
    padding-top: 56px;
  }

  @include md-desktop {
    padding-top: 64px;
  }

  &__list {
    width: 100%;
    padding: 0 20px;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    flex-direction: column;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    // align-items: flex-start;

    @include md-tablet {
      max-width: 768px;
      -webkit-box-orient: horizontal;
      -webkit-flex-direction: row;
      flex-direction: row;
      -webkit-flex-wrap: wrap;
      flex-wrap: wrap;
      -webkit-box-pack: center;
      -webkit-justify-content: center;
      justify-content: center;
      align-items: flex-start;
    }

    @include md-desktop {
      max-width: 900px;
    }
  }

  &__btn {
    margin-top: 96px;
    margin-bottom: 64px;
    height: 52px;
    padding: 0 32px;
    color: #fff;

    span,
    & {
      font-size: 19px;
    }

    @include md-tablet {
      margin-top: 40px;
      height: 64px;
      padding: 0 40px;

      span,
      & {
        font-size: 24px;
      }
    }
  }
}

.review {
  width: 100%;
  max-width: 327px;
  margin-top: 16px;
  padding: 20px;
  background-color: #ffffff;
  background-image: -webkit-linear-gradient(top, #ffffff 0%, #d2f8ff 100%);
  background-image: linear-gradient(to bottom, #ffffff 0%, #d2f8ff 100%);
  border-bottom: 5px solid #00819a;
  border-radius: 24px;
  -webkit-border-radius: 24px;
  -webkit-box-shadow: 0 2px 1px rgba(0, 0, 0, 0.33), 0 10px 14px -5px rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 1px rgba(0, 0, 0, 0.33), 0 10px 14px -5px rgba(0, 0, 0, 0.1);

  @include md-tablet {
    width: 286px;
    max-width: none;
    margin-top: 16px;
    margin-left: 8px;
    margin-right: 8px;
    padding: 24px 13px;
  }

  @include md-desktop {
    width: 300px;
    margin-left: 12px;
    margin-right: 12px;
  }

  // &:first-child {
  //   margin-top: 0;
  // }

  &__head {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
    justify-content: space-between;
  }

  &__commas {
    width: 30px;
    height: 26px;

    @include md-tablet {
      width: 38px;
      height: 33px;
    }
  }

  &__stars {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;

    img {
      width: 18px;
      height: 17px;
      margin-left: 3px;

      @include md-tablet {
        width: 23px;
        height: 22px;
        margin-left: 3px;
      }

      &:first-child {
        margin-left: 0;
      }
    }
  }

  &__text {
    margin-top: 12px;
    font-family: "Open Sans", Arial, sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 19px;
    color: #3c4267;

    @include md-tablet {
      font-size: 16px;
      line-height: 22px;
    }
  }

  &__author {
    margin-top: 12px;
    text-align: right;
    font-family: "Open Sans", Arial, sans-serif;
    font-weight: 700;
    font-size: 16px;
    line-height: 22px;
    color: #3c4267;

    @include md-tablet {
      font-size: 20px;
      line-height: 28px;
    }
  }
}

/* ---------- footer ---------- */

.footer {
  width: 100%;
  margin-top: 32px;
  background: #33cbff;
  padding: 28px 20px;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
  flex-direction: column;
  -webkit-box-align: start;
  -webkit-align-items: flex-start;
  align-items: flex-start;
  gap: 20px;

  @include md-tablet {
    margin-top: 56px;
    -webkit-box-orient: horizontal;
    -webkit-flex-direction: row;
    flex-direction: row;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
    justify-content: space-between;
    -webkit-flex-wrap: wrap;
    flex-wrap: wrap;
    padding: 32px 44px;
  }

  &__company,
  &__links {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
    flex-direction: column;
  }

  &__company p,
  &__links a {
    font-family: "Open Sans", Arial, sans-serif;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: #ffffff;

    @include md-tablet {
      font-size: 18px;
      line-height: 26px;
    }
  }

  &__company p + p {
    margin-top: 8px;

    @include md-tablet {
      margin-top: 10px;
    }
  }

  &__links a {
    text-decoration: underline;
  }

  &__links a + a {
    margin-top: 12px;

    @include md-tablet {
      margin-top: 14px;
    }
  }
}
</style>
