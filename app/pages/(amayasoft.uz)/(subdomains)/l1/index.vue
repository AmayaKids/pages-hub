<script setup lang="ts">
import '~/assets/css/fonts/nunito.css'
import '~/assets/css/fonts/open-sans.css'

import logoSvg from '~/assets/images/l1/svg/logo.svg'
import bgBlueRoundSvg from '~/assets/images/l1/svg/bg-blue-round.svg'
import dividerSvg from '~/assets/images/l1/svg/divider.svg'
import utpAgeSvg from '~/assets/images/l1/svg/utp-age.svg'
import utpCarsSvg from '~/assets/images/l1/svg/utp-cars.svg'
import utpMadeForKidsSvg from '~/assets/images/l1/svg/utp-made-for-kids.svg'
import utpOfflineSvg from '~/assets/images/l1/svg/utp-offline.svg'

import headPicPng from '~/assets/images/l1/png/head-pic.png'
import carPng from '~/assets/images/l1/png/car.png'
import robotPng from '~/assets/images/l1/png/robot.png'
import videoPreviewPng from '~/assets/images/l1/png/video-preview.png'
import commasPng from '~/assets/images/l1/png/commas.png'
import starPng from '~/assets/images/l1/png/star.png'

useSeoMeta({
  title: 'Машинки — Amaya Kids'
})

const badges = [
  { title: '75+', text: 'mashina turi' },
  { title: '2+', text: 'yoshdan' },
  { title: 'Oflayn', text: 'ham o‘ynaydi' }
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

const { isPending: isPaymentPending, error: paymentError, start: startPayment } = useMulticardCheckout()

// The same "Купить" CTA is repeated in three sections; `activeCta` keeps the
// pending label and the error message on the button the user actually clicked.
const activeCta = ref<string | null>(null)

async function buy(cta: string) {
  activeCta.value = cta
  await startPayment()
}

function ctaLabel(cta: string) {
  return isPaymentPending.value && activeCta.value === cta ? 'Переходим к оплате…' : 'Купить'
}
</script>

<template>
  <div class="l1">
    <div class="page">
      <!-- Header -->
      <header class="header">
        <img
          class="header__logo"
          :src="logoSvg"
          width="166"
          height="52"
          alt="Amaya Kids"
        >
      </header>

      <!-- Hero -->
      <section class="hero">
        <div class="hero__pic">
          <img
            class="hero__pic-bg"
            :src="headPicPng"
            alt=""
          >
          <div class="hero__pic-text">
            <div class="hero__title">
              Машинки
            </div>
            <div class="hero__subtitle">
              Гоняй, развивайся... тут текст от Юли нужен
            </div>
          </div>
        </div>

        <div class="offer">
          <img
            class="offer__bg"
            :src="bgBlueRoundSvg"
            width="440"
            height="324"
            alt=""
          >
          <img
            class="offer__car"
            :src="carPng"
            width="152"
            height="123"
            alt="Игрушечная машинка"
          >
          <img
            class="offer__robot"
            :src="robotPng"
            width="144"
            height="85"
            alt="Робот-персонаж"
          >

          <div class="offer__content">
            <div class="badge">
              Best offer
            </div>
            <div class="offer__price">
              <p class="offer__price-title">
                Бесплатно навсегда!
              </p>
              <p class="offer__price-now">
                <span>Всего за </span><b>50 000 сум</b>
              </p>
              <p class="offer__price-old">
                150 000 сум
              </p>
            </div>
            <button
              class="btn"
              type="button"
              :disabled="isPaymentPending"
              @click="buy('offer')"
            >
              {{ ctaLabel('offer') }}
            </button>
          </div>
        </div>

        <p
          v-if="paymentError && activeCta === 'offer'"
          class="pay-error"
        >
          {{ paymentError }}
        </p>
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
              <p>{{ item.text }}</p>
            </div>
          </div>
        </div>

        <button
          class="btn utp__btn"
          type="button"
          :disabled="isPaymentPending"
          @click="buy('utp')"
        >
          {{ ctaLabel('utp') }}
        </button>

        <p
          v-if="paymentError && activeCta === 'utp'"
          class="pay-error"
        >
          {{ paymentError }}
        </p>
      </section>

      <!-- Video -->
      <section class="video">
        <div class="video__frame">
          <img
            :src="videoPreviewPng"
            width="720"
            height="404"
            alt="Видео игры Kids Cars 2"
          >
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

        <button
          class="btn reviews__btn"
          type="button"
          :disabled="isPaymentPending"
          @click="buy('reviews')"
        >
          {{ ctaLabel('reviews') }}
        </button>

        <p
          v-if="paymentError && activeCta === 'reviews'"
          class="pay-error"
        >
          {{ paymentError }}
        </p>

        <!-- Footer -->
        <footer class="footer">
          <div class="footer__row">
            <span>2026, Amaya Kids</span>
            <span class="footer__divider"><img
              :src="dividerSvg"
              width="24"
              height="1"
              alt=""
            ></span>
            <span>Barcha huquqlar himoyalangan</span>
          </div>
          <div class="footer__row">
            <a href="#terms">Foydalanish shartlari</a>
            <span class="footer__divider"><img
              :src="dividerSvg"
              width="24"
              height="1"
              alt=""
            ></span>
            <a href="#privacy">Maxfiylik siyosati</a>
          </div>
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

.l1 {
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

  img {
    display: block;
    max-width: 100%;
    height: auto;
    border: 0;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  h1, h2, h3, p {
    font-weight: 400;
  }
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

/* Payment error notice under a "Купить" button. Sits on both the white hero
   and the blue reviews background, hence the solid red pill. */
.pay-error {
  margin-top: 12px;
  max-width: 280px;
  padding: 8px 16px;
  border-radius: 99px;
  -webkit-border-radius: 99px;
  background: #e5133a;
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 800;
  font-size: 13px;
  line-height: 18px;
  text-align: center;
  color: #ffffff;

  @include md-tablet {
    max-width: 360px;
    font-size: 15px;
    line-height: 20px;
  }
}

/* ---------- header ---------- */

.header {
  background: #05b8f6;
  display: flex;
  padding: 16px 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
    width: 120px;
    height: 38px;

    @include md-tablet {
      width: 166px;
      height: 52px;
    }
  }
}

/* ---------- hero ---------- */

.hero {
  position: relative;
  background: #ffffff;
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

  &__eyebrow {
    margin-bottom: 16px;
  }

  &__pic {
    position: relative;
    width: 100%;
    height: 0;
    height: 256px;
    padding-top: 44.01%; /* 338 / 768 — original Figma aspect ratio */
    overflow: hidden;
    background: #05b8f6;
    margin-bottom: -60px;

    @include md-tablet {
      margin-bottom: -120px;
    }

    &-bg {
      position: absolute;
      left: 0;
      top: 0;
      width: 129.95%;
      height: 256px;
      max-width: none;
      height: 100%!important;
      object-fit: cover!important;
    }

    &-text {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
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
      padding-top: 86px;
      text-align: center;
    }
  }

  &__title {
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 900;
    font-size: 28px;
    line-height: 30px;
    color: #ff8800;
    -webkit-text-stroke: 2px #ffffff;
    paint-order: stroke fill;
    text-shadow: 0 6px 6px rgba(0, 0, 0, 0.45), 0 4px 1px rgba(0, 0, 0, 0.8), 0 3px 0 #84a5b1, 0 12px 24px rgba(0, 0, 0, 0.8);

    text-shadow: 0 20px 40px rgba(0, 0, 0, 0.80), 0 5px 0 #84A5B1, 0 7px 2px rgba(0, 0, 0, 0.80), 0 10px 10px rgba(0, 0, 0, 0.45);
    -webkit-text-stroke-width: 3px;
    -webkit-text-stroke-color: #FFF;
    font-weight: 900;

    @include md-tablet {
      font-size: 44px;
      line-height: 44px;
      -webkit-text-stroke-width: 3px;
      text-shadow: 0 10px 10px rgba(0, 0, 0, 0.45), 0 7px 2px rgba(0, 0, 0, 0.8), 0 5px 0 #84a5b1, 0 20px 40px rgba(0, 0, 0, 0.8);
    }

    @include md-desktop {
      font-size: 48px;
      line-height: 48px;
    }
  }

  &__subtitle {
    margin-top: 6px;
    width: 220px;
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 900;
    font-size: 13px;
    line-height: 16px;
    color: #ff8800;
    -webkit-text-stroke: 1.5px #ffffff;
    paint-order: stroke fill;
    text-shadow: 0 5px 6px rgba(0, 0, 0, 0.45), 0 3px 1px rgba(0, 0, 0, 0.8), 0 2px 0 #84a5b1, 0 12px 24px rgba(0, 0, 0, 0.8);

    @include md-tablet {
      margin-top: 8px;
      width: 311px;
      font-size: 20px;
      line-height: 24px;
      -webkit-text-stroke-width: 2px;
      text-shadow: 0 8px 10px rgba(0, 0, 0, 0.45), 0 5px 2px rgba(0, 0, 0, 0.8), 0 3px 0 #84a5b1, 0 20px 40px rgba(0, 0, 0, 0.8);
    }

    @include md-desktop {
      width: 340px;
      font-size: 22px;
      line-height: 26px;
    }
  }
}

/* ---------- offer bubble ---------- */

.offer {
  position: relative;
  width: 300px;
  height: 222px;
  padding: 20px 30px;
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

  @include md-tablet {
    width: 440px;
    height: 324px;
    padding: 48px 80px;
  }

  @include md-desktop {
    width: 460px;
    height: 336px;
    padding: 50px 84px;
  }

  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  &__car {
    position: absolute;
    z-index: 1;
    width: 104px;
    height: 84px;
    left: -6px;
    top: 155px;

    @include md-tablet {
      width: 152px;
      height: 123px;
      left: -8px;
      top: 230px;
    }

    @include md-desktop {
      width: 160px;
      height: 129px;
      left: -8px;
      top: 240px;
    }
  }

  &__robot {
    position: absolute;
    z-index: 1;
    width: 98px;
    height: 58px;
    right: 6px;
    top: 160px;

    @include md-tablet {
      width: 144px;
      height: 85px;
      right: -3px;
      top: 236px;
    }

    @include md-desktop {
      width: 151px;
      height: 89px;
      right: -6px;
      top: 246px;
    }
  }

  &__content {
    position: relative;
    z-index: 2;
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

    > * {
      margin-top: 12px;

      @include md-tablet {
        margin-top: 20px;
      }

      &:first-child {
        margin-top: 0;
      }
    }
  }

  &__price {
    text-align: center;
    color: #ffffff;

    &-title {
      font-family: "Nunito", Arial, sans-serif;
      font-weight: 900;
      font-size: 19px;
      line-height: 24px;

      @include md-tablet {
        font-size: 26px;
        line-height: 32px;
      }
    }

    &-now {
      margin-top: 4px;
      font-size: 15px;

      @include md-tablet {
        font-size: 20px;
      }

      span {
        font-family: "Nunito", Arial, sans-serif;
        font-weight: 600;
      }

      b {
        font-family: "Nunito", Arial, sans-serif;
        font-weight: 900;
      }
    }

    &-old {
      margin-top: 2px;
      font-family: "Nunito", Arial, sans-serif;
      font-weight: 600;
      font-size: 13px;
      line-height: 16px;
      color: #ffffff;
      text-decoration: line-through;

      @include md-tablet {
        font-size: 18px;
        line-height: 19px;
      }
    }
  }

  .btn {
    height: 44px;
    padding: 0 24px;

    span,
    & {
      font-size: 17px;
    }

    @include md-tablet {
      height: 64px;
      padding: 0 40px;

      span,
      & {
        font-size: 24px;
      }
    }
  }
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  background: #cc00fe;
  border-radius: 99px;
  -webkit-border-radius: 99px;
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 900;
  font-size: 13px;
  line-height: 20px;
  color: #ffffff;
  white-space: nowrap;

  @include md-tablet {
    padding: 4px 16px;
    font-size: 18px;
    line-height: 28px;
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

  @include md-tablet {
    padding: 0 56px 56px;
  }

  @include md-desktop {
    padding: 0 64px 64px;
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

  @include md-tablet {
    padding: 80px 24px;
  }

  @include md-desktop {
    padding: 96px 24px;
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

    img {
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
    }

    @include md-desktop {
      max-width: 900px;
    }
  }

  &__btn {
    margin-top: 32px;
    height: 52px;
    padding: 0 32px;

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

  &:first-child {
    margin-top: 0;
  }

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
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;

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
    padding: 51px 56px;
  }

  @include md-desktop {
    padding: 56px 80px;
  }

  &__row {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
    margin-top: 12px;
    text-align: center;

    @include md-tablet {
      margin-top: 0;
    }

    &:first-child {
      margin-top: 0;
    }

    span,
    a {
      font-family: "Open Sans", Arial, sans-serif;
      font-weight: 600;
      font-size: 14px;
      line-height: 16px;
      color: #ffffff;

      @include md-tablet {
        font-size: 18px;
      }
    }

    a {
      text-decoration: underline;
    }
  }

  &__divider {
    display: inline-block;
    width: 1px;
    height: 16px;
    margin: 0 10px;
    overflow: hidden;

    @include md-tablet {
      height: 24px;
      margin: 0 12px;
    }

    img {
      width: 16px;
      height: 1px;
      -webkit-transform: rotate(90deg);
      transform: rotate(90deg);

      @include md-tablet {
        width: 24px;
      }
    }
  }
}
</style>
