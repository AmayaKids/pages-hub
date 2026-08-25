<script setup lang="ts">
import '~/assets/css/fonts/nunito.css'
import '~/assets/css/fonts/open-sans.css'

import logoSvg from '~/assets/images/l1/svg/logo.svg'

import publicOfferUz from './content/uz/public-offer.json'
import privacyPolicyUz from './content/uz/privacy-policy.json'
import refundPolicyUz from './content/uz/refund-policy.json'

interface LegalBlock {
  type: 'paragraph' | 'list'
  text?: string
  items?: string[]
}

interface LegalSection {
  heading: string
  blocks: LegalBlock[]
}

interface LegalDocument {
  title: string
  subtitle?: string
  intro?: string[]
  sections: LegalSection[]
}

// MOCK: only the 'uz' locale exists for now, hardcoded here — not wired into
// @nuxtjs/i18n yet. Once real localization lands, this map (and the content/
// folder layout) is what gets replaced by an actual i18n-driven lookup.
const DOCUMENTS: Record<string, LegalDocument> = {
  'public-offer': publicOfferUz as LegalDocument,
  'privacy-policy': privacyPolicyUz as LegalDocument,
  'refund-policy': refundPolicyUz as LegalDocument
}

const route = useRoute()
const slug = computed(() => String(route.params.name))

// Throwing inside the getter (rather than guarding `.value` at the top level)
// is what makes `doc`'s type `LegalDocument` instead of `LegalDocument |
// undefined` everywhere it's read — including in the template, where a
// top-level `if (!doc.value) throw` guard doesn't narrow anything.
const doc = computed<LegalDocument>(() => {
  const found = DOCUMENTS[slug.value]

  if (!found) {
    throw createError({ statusCode: 404, statusMessage: 'Legal document not found' })
  }

  return found
})

useSeoMeta({
  title: () => `${doc.value.title} — Amaya Kids`
})
</script>

<template>
  <div class="l1">
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

      <!-- Document -->
      <main class="doc">
        <h1 class="doc__title">
          {{ doc.title }}
        </h1>
        <p
          v-if="doc.subtitle"
          class="doc__subtitle"
        >
          {{ doc.subtitle }}
        </p>

        <p
          v-for="(paragraph, i) in doc.intro"
          :key="`intro-${i}`"
          class="doc__p"
        >
          {{ paragraph }}
        </p>

        <section
          v-for="(section, i) in doc.sections"
          :key="`section-${i}`"
          class="doc__section"
        >
          <h2 class="doc__heading">
            {{ section.heading }}
          </h2>

          <template
            v-for="(block, j) in section.blocks"
            :key="`block-${i}-${j}`"
          >
            <p
              v-if="block.type === 'paragraph'"
              class="doc__p"
            >
              {{ block.text }}
            </p>
            <ul
              v-else-if="block.type === 'list'"
              class="doc__list"
            >
              <li
                v-for="(item, k) in block.items"
                :key="k"
              >
                {{ item }}
              </li>
            </ul>
          </template>
        </section>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer__company">
          <p>«AMAYA SOFT», MChJ</p>
          <p>Toshkent shahri, Shayxontohur tumani, Navoiy ko‘chasi, 3-uy, 76 honadon</p>
          <p>STIR 305210613</p>
          <p>2026, Amaya Kids</p>
          <p>Barcha huquqlar himoyalangan</p>
        </div>

        <nav class="footer__links">
          <NuxtLink to="/legal/public-offer">
            Ommaviy oferta
          </NuxtLink>
          <NuxtLink to="/legal/privacy-policy">
            Maxfiylik siyosati
          </NuxtLink>
          <NuxtLink to="/legal/refund-policy">
            To‘lovni qaytarish siyosati
          </NuxtLink>
        </nav>
      </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
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
    max-width: 1088px;
    box-shadow: 0 40px 140px rgba(0, 0, 0, 0.18);
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
  }

  @include md-desktop {
    padding: 28px 64px;
  }

  &__logo {
    display: block;
    width: 120px;
    height: 38px;
    margin: 0 auto;
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

/* ---------- document ---------- */

.doc {
  padding: 32px 20px 40px;
  max-width: 760px;
  margin: 0 auto;

  @include md-tablet {
    padding: 56px 56px 64px;
  }

  @include md-desktop {
    padding: 64px 80px 80px;
  }

  &__title {
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 800;
    font-size: 22px;
    line-height: 28px;
    text-align: center;

    @include md-tablet {
      font-size: 30px;
      line-height: 36px;
    }
  }

  &__subtitle {
    margin-top: 6px;
    font-family: "Open Sans", Arial, sans-serif;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    color: #6b7094;
  }

  &__section {
    margin-top: 28px;
  }

  &__heading {
    font-family: "Nunito", Arial, sans-serif;
    font-weight: 800;
    font-size: 17px;
    line-height: 22px;

    @include md-tablet {
      font-size: 19px;
      line-height: 24px;
    }
  }

  &__p {
    margin-top: 12px;
    font-family: "Open Sans", Arial, sans-serif;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;

    @include md-tablet {
      font-size: 15px;
      line-height: 23px;
    }
  }

  &__list {
    margin-top: 8px;
    padding-left: 20px;
    list-style: disc;

    li {
      margin-top: 8px;
      font-family: "Open Sans", Arial, sans-serif;
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;

      @include md-tablet {
        font-size: 15px;
        line-height: 23px;
      }

      &:first-child {
        margin-top: 0;
      }
    }
  }
}

/* ---------- footer ---------- */

.footer {
  width: 100%;
  margin-top: 32px;
  background: #33cbff;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;

  @include md-tablet {
    margin-top: 56px;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: 32px 44px;
  }

  &__company,
  &__links {
    display: flex;
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
