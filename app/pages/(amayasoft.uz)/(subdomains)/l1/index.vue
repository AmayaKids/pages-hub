<script setup lang="ts">
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
            <h1 class="hero__title">
              Машинки
            </h1>
            <p class="hero__subtitle">
              Гоняй, развивайся... тут текст от Юли нужен
            </p>
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
            <a
              class="btn"
              href="#buy"
            >Купить</a>
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
              <p>{{ item.text }}</p>
            </div>
          </div>
        </div>

        <a
          class="btn utp__btn"
          href="#buy"
        >Купить</a>
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

        <a
          class="btn reviews__btn"
          href="#buy"
        >Купить</a>

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

<style scoped>
/* =========================================================
   Machinki — landing page
   Mobile-first. Breakpoints: base = ~375px phones,
   768px = tablet, 1024px = tablet landscape / small desktop.
   All sizes are in pixels. Vendor prefixes are kept for
   older iOS Safari / Android WebKit browsers.
   ========================================================= */

.l1 {
  font-family: "Nunito", "Helvetica Neue", Arial, sans-serif;
  background: #ebfaff;
  color: #3c4267;
  -webkit-font-smoothing: antialiased;
  padding: 16px;
}

.l1 img {
  display: block;
  max-width: 100%;
  height: auto;
  border: 0;
}

.l1 a {
  text-decoration: none;
  color: inherit;
}

.l1 h1, .l1 h2, .l1 h3, .l1 p {
  font-weight: 400;
}

.page {
  overflow: hidden;
  background: #ffffff;
  border-radius: 24px;
  margin: 0 auto;
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
}

.btn span,
.btn {
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 900;
  font-size: 18px;
  line-height: 24px;
  text-align: center;
  color: #ffffff;
  text-shadow: 0 2px 1px rgba(0, 0, 0, 0.2);
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
}

.header__logo {
  width: 120px;
  height: 38px;
  margin: 0 auto;
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
}

.hero__pic {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 44.01%; /* 338 / 768 — original Figma aspect ratio */
  overflow: hidden;
  background: #05b8f6;
  margin-bottom: -60px;
}

.hero__pic-bg {
  position: absolute;
  left: -9.84%;
  top: -36.54%;
  width: 129.95%;
  height: 136.54%;
  max-width: none;
}

.hero__pic-text {
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
  padding-top: 25.44%; /* 86 / 338 — original Figma text offset */
  text-align: center;
}

.hero__title {
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 900;
  font-size: 28px;
  line-height: 30px;
  color: #ff8800;
  -webkit-text-stroke: 2px #ffffff;
  paint-order: stroke fill;
  text-shadow: 0 6px 6px rgba(0, 0, 0, 0.45), 0 4px 1px rgba(0, 0, 0, 0.8), 0 3px 0 #84a5b1, 0 12px 24px rgba(0, 0, 0, 0.8);
}

.hero__subtitle {
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
}

.offer__bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.offer__car {
  position: absolute;
  z-index: 1;
  width: 104px;
  height: 84px;
  left: -6px;
  top: 155px;
}

.offer__robot {
  position: absolute;
  z-index: 1;
  width: 98px;
  height: 58px;
  right: 6px;
  top: 160px;
}

.offer__content {
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
}

.offer__content > * {
  margin-top: 12px;
}

.offer__content > *:first-child {
  margin-top: 0;
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
}

.offer__price {
  text-align: center;
  color: #ffffff;
}

.offer__price-title {
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 900;
  font-size: 19px;
  line-height: 24px;
}

.offer__price-now {
  margin-top: 4px;
  font-size: 15px;
}

.offer__price-now span {
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 600;
}

.offer__price-now b {
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 900;
}

.offer__price-old {
  margin-top: 2px;
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 600;
  font-size: 13px;
  line-height: 16px;
  color: #ffffff;
  text-decoration: line-through;
}

.offer .btn {
  height: 44px;
  padding: 0 24px;
}

.offer .btn span,
.offer .btn {
  font-size: 17px;
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
}

/* always a 2-column grid, from 375px up */
.utp__grid {
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

.utp__item {
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
}

.utp__item:nth-child(1),
.utp__item:nth-child(2) {
  margin-top: 0;
}

.utp__item img {
  width: 140px;
  height: 115px;
}

.utp__text {
  width: 100%;
  margin-top: 12px;
  text-align: left;
  color: #3c4267;
}

.utp__text h3 {
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 800;
  font-size: 15px;
  line-height: 19px;
}

.utp__text p {
  margin-top: 6px;
  font-family: "Nunito", Arial, sans-serif;
  font-weight: 600;
  font-size: 13px;
  line-height: 17px;
}

.utp__btn {
  margin-top: 32px;
  height: 52px;
  padding: 0 32px;
}

.utp__btn,
.utp__btn span {
  font-size: 19px;
}

/* ---------- video ---------- */

.video {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  padding: 32px 16px 40px;
}

.video__frame {
  width: 100%;
  max-width: 720px;
  overflow: hidden;
  border-bottom: 5px solid #015b7c;
  border-radius: 20px;
  -webkit-border-radius: 20px;
  -webkit-box-shadow: 0 2px 1px rgba(0, 0, 0, 0.4), 0 19px 14px rgba(0, 0, 0, 0.25), 0 34px 25px rgba(0, 0, 0, 0.25), 0 44px 50px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 1px rgba(0, 0, 0, 0.4), 0 19px 14px rgba(0, 0, 0, 0.25), 0 34px 25px rgba(0, 0, 0, 0.25), 0 44px 50px rgba(0, 0, 0, 0.2);
}

.video__frame img {
  width: 100%;
  height: auto;
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
}

.reviews__list {
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
}

.review:first-child {
  margin-top: 0;
}

.review__head {
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

.review__commas {
  width: 30px;
  height: 26px;
}

.review__stars {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
}

.review__stars img {
  width: 18px;
  height: 17px;
  margin-left: 3px;
}

.review__stars img:first-child {
  margin-left: 0;
}

.review__text {
  margin-top: 12px;
  font-family: "Open Sans", Arial, sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 19px;
  color: #3c4267;
}

.review__author {
  margin-top: 12px;
  text-align: right;
  font-family: "Open Sans", Arial, sans-serif;
  font-weight: 700;
  font-size: 16px;
  line-height: 22px;
  color: #3c4267;
}

.reviews__btn {
  margin-top: 32px;
  height: 52px;
  padding: 0 32px;
}

.reviews__btn,
.reviews__btn span {
  font-size: 19px;
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
}

.footer__row {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  margin-top: 12px;
  text-align: center;
}

.footer__row:first-child {
  margin-top: 0;
}

.footer__row span,
.footer__row a {
  font-family: "Open Sans", Arial, sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
  color: #ffffff;
}

.footer__row a {
  text-decoration: underline;
}

.footer__divider {
  display: inline-block;
  width: 1px;
  height: 16px;
  margin: 0 10px;
  overflow: hidden;
}

.footer__divider img {
  width: 16px;
  height: 1px;
  -webkit-transform: rotate(90deg);
  transform: rotate(90deg);
}

/* =========================================================
   TABLET  (>= 768px) — matches the Figma "tablet" layout
   ========================================================= */

@media (min-width: 768px) {

  .l1 {
    padding: 24px;
  }

  .page {
    border-radius: 40px;
  }

  .header {
    padding: 24px 56px;
  }

  .header__logo {
    width: 166px;
    height: 52px;
  }

  .hero__pic {
    margin-bottom: -120px;
  }

  .hero__title {
    font-size: 44px;
    line-height: 44px;
    -webkit-text-stroke-width: 3px;
    text-shadow: 0 10px 10px rgba(0, 0, 0, 0.45), 0 7px 2px rgba(0, 0, 0, 0.8), 0 5px 0 #84a5b1, 0 20px 40px rgba(0, 0, 0, 0.8);
  }

  .hero__subtitle {
    margin-top: 8px;
    width: 311px;
    font-size: 20px;
    line-height: 24px;
    -webkit-text-stroke-width: 2px;
    text-shadow: 0 8px 10px rgba(0, 0, 0, 0.45), 0 5px 2px rgba(0, 0, 0, 0.8), 0 3px 0 #84a5b1, 0 20px 40px rgba(0, 0, 0, 0.8);
  }

  .offer {
    width: 440px;
    height: 324px;
    padding: 48px 80px;
  }

  .offer__content > * {
    margin-top: 20px;
  }

  .offer__car {
    width: 152px;
    height: 123px;
    left: -8px;
    top: 230px;
  }

  .offer__robot {
    width: 144px;
    height: 85px;
    right: -3px;
    top: 236px;
  }

  .badge {
    padding: 4px 16px;
    font-size: 18px;
    line-height: 28px;
  }

  .offer__price-title {
    font-size: 26px;
    line-height: 32px;
  }

  .offer__price-now {
    font-size: 20px;
  }

  .offer__price-old {
    font-size: 18px;
    line-height: 19px;
  }

  .offer .btn {
    height: 64px;
    padding: 0 40px;
  }

  .offer .btn span,
  .offer .btn {
    font-size: 24px;
  }

  .utp {
    padding: 0 56px 56px;
  }

  .utp__item {
    width: 240px;
    margin: 16px 28px 0;
  }

  .utp__item:nth-child(1),
  .utp__item:nth-child(2) {
    margin-top: 0;
  }

  .utp__item img {
    width: 200px;
    height: 164px;
  }

  .utp__text h3 {
    font-size: 20px;
    line-height: 24px;
  }

  .utp__text p {
    font-size: 16px;
    line-height: 22px;
  }

  .utp__btn {
    margin-top: 40px;
    height: 64px;
    padding: 0 40px;
  }

  .utp__btn,
  .utp__btn span {
    font-size: 24px;
  }

  .video {
    padding: 80px 24px;
  }

  .video__frame {
    border-bottom-width: 8px;
    border-radius: 32px;
    -webkit-border-radius: 32px;
  }

  .reviews {
    padding-top: 56px;
  }

  .reviews__list {
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

  .review {
    width: 286px;
    max-width: none;
    margin-top: 16px;
    margin-left: 8px;
    margin-right: 8px;
    padding: 24px 13px;
  }

  .review__commas {
    width: 38px;
    height: 33px;
  }

  .review__stars img {
    width: 23px;
    height: 22px;
    margin-left: 3px;
  }

  .review__text {
    font-size: 16px;
    line-height: 22px;
  }

  .review__author {
    font-size: 20px;
    line-height: 28px;
  }

  .reviews__btn {
    margin-top: 40px;
    height: 64px;
    padding: 0 40px;
  }

  .reviews__btn,
  .reviews__btn span {
    font-size: 24px;
  }

  .footer {
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

  .footer__row {
    margin-top: 0;
  }

  .footer__row span,
  .footer__row a {
    font-size: 18px;
  }

  .footer__divider {
    height: 24px;
    margin: 0 12px;
  }

  .footer__divider img {
    width: 24px;
  }
}

/* =========================================================
   DESKTOP / TABLET LANDSCAPE  (>= 1024px)
   ========================================================= */

@media (min-width: 1024px) {

  .l1 {
    padding: 44px;
  }

  .page {
    max-width: 1088px;
  }

  .header {
    padding: 28px 64px;
  }

  .hero__title {
    font-size: 48px;
    line-height: 48px;
  }

  .hero__subtitle {
    width: 340px;
    font-size: 22px;
    line-height: 26px;
  }

  .offer {
    width: 460px;
    height: 336px;
    padding: 50px 84px;
  }

  .offer__car {
    width: 160px;
    height: 129px;
    left: -8px;
    top: 240px;
  }

  .offer__robot {
    width: 151px;
    height: 89px;
    right: -6px;
    top: 246px;
  }

  .utp {
    padding: 0 64px 64px;
  }

  .utp__item {
    width: 250px;
    margin-left: 32px;
    margin-right: 32px;
  }

  .video {
    padding: 96px 24px;
  }

  .reviews {
    padding-top: 64px;
  }

  .reviews__list {
    max-width: 900px;
  }

  .review {
    width: 300px;
    margin-left: 12px;
    margin-right: 12px;
  }

  .footer {
    padding: 56px 80px;
  }
}
</style>
