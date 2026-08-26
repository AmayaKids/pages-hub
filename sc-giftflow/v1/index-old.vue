<script lang="ts" setup>
import { watch, onMounted, ref, computed, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

import mitt from '@/plugins/mitt';

import PageButton from './page-button.vue';

import { useAppDataStore } from '@/stores/appDataStore';

import apiClient from '@/api/index';

const config: Config = {
  os: 'native',
  prefix: 'ios_as_cars1_ua1',
  company: 'as',
  close: {
    color: '#ff8d24',
  },
  experimentName: 'UA_Cars1_var1',
};

const { t, locale } = useI18n();
const appDataStore = useAppDataStore();

const show = ref(false);
const step = ref(0);
const loginStep = ref<'login' | 'password' | 'reset-password' | 'check-inbox'>('login');
const isGlobalError = ref(false);
const country = computed(() => appDataStore.appData.userCountry || 'Uzbekistan');

const api = new apiClient({ host: 'https://my.amayakids.com/api/public' });

const pending = ref(false);
const success = ref(false);
const error = ref(false);
const errorReason = ref<null | number>(null); // 1 - error data, 2 - network error
const errorText = computed(() => {
  if (error.value) {
    switch (errorReason.value) {
      case 0:
        return t('basic.error_something_went_wrong');
      case 1:
        return t('upsell.gift_code_not_found')
      case 2:
        return t('upsell.gift_code_expired')
      case 3:
        return t('upsell.parental_zone_status_code_expired')
      case 4:
        return t('no_internet')
    }

  } else return '';
});

const email = ref('');
const password = ref('');

function openHandler() {
  if (show.value) return; // уже открыто — игнорируем дубль
  step.value = 0;
  show.value = true;
  pending.value = false;
  success.value = false;
  errorReason.value = null;
}

function closeHandler() {
  step.value = 0;
  show.value = false;
  pending.value = false;
  success.value = false;
  errorReason.value = null;
}

function handleClose() {
  mitt.event('close');
}

async function checkEmailExist() {
  pending.value = true;

  try {
    const response = await api.checkEmailExist({
      email: email.value,
      language: locale.value,
      gameId: appDataStore.getGameId(),
      country: country.value,
      experiment: config?.experimentName,
    });

    mitt.event('mixpanelEvent', {
      eventName: 'auth_email_done',
      additionalProperties: []
    });
    
    loginStep.value = 'password';
  } catch (error) {
    console.log(error);
  } finally {
    pending.value = false;
  }
};

async function nextStep() {
  if (step.value === 0) {
    step.value = 1;
    loginStep.value = 'login';
  } else if(step.value === 1) {

  } else {
    
  }
}

async function handleForward() {
  mitt.event('forward')
}

watch(appDataStore, () => {
  mitt.event('ready');
});

onMounted(() => {
  if (country.value === 'Uzbekistan') {
    locale.value = 'uz';
  }

  mitt.listen('open', openHandler);
  mitt.listen('close', closeHandler);
  mitt.event('ready');
});

onUnmounted(() => {
  mitt.off('open', openHandler);
  mitt.off('close', closeHandler);
});
</script>

<template>
  <main :class="[`page ${locale}`, {'page--close': !show }]" @click="handleClose">
    <div class="page__inner">
      <transition name="slide-up-down" mode="out-in">
        <div v-if="show" class="page__composition" @click.stop="">
          <div class="page__banner-wrapper">
            <div class="page__banner">
              <transition name="card-transition" mode="out-in">
                <div v-if="step === 0" key="t1" class="page__banner-inner">
                  <div class="page__suptitle" v-html="$t('cars113.screen1_text_1')"></div>
                  <div class="page__title" v-html="$t('cars113.screen1_text_2')"></div>
                  <div class="page__subtitle" v-html="$t('cars113.screen1_text_3')"></div>

                  <div class="page__button-wrapper">
                    <PageButton
                      :disabled="pending"
                      :pending="pending"
                      @click="nextStep"
                    >
                      {{ $t('cars113.screen1_button') }}
                    </PageButton>
                  </div>
                </div>

                <div v-else-if="step === 1" class="page__banner-inner">
                  <template v-if="loginStep === 'login'">
                    <div class="page__title" v-html="$t('cars113.screen1_text_2')"></div>
                    <div class="page__subtitle" v-html="$t('cars113.screen1_text_3')"></div>

                    <div class="page__form">
                      <input
                        v-model="email"
                        class="page__input"
                        type="text"
                        :disabled="pending"
                      />
                    </div>

                    <PageButton
                      :disabled="pending"
                      :pending="pending"
                      @click="nextStep"
                    >
                      {{ $t('cars113.screen1_button') }}
                    </PageButton>
                  </template>
                    
                  <template v-else-if="loginStep === 'password'">
                    <input
                      v-model="password"
                      class="page__input"
                      type="text"
                      :disabled="pending"
                    />

                    <div v-if="error" class="page__message page__message--error">
                      {{ errorText }}
                    </div>
                  </template>
                </div>

                <div v-else key="t2" class="page__banner-inner">
                  <div class="page__title page__title--second" v-html="$t('upsell.parental_zone_status_code_activated')"></div>
                  <div class="page__hero"></div>
                </div>
              </transition>
            </div>

            <div class="page__close" @click="handleClose">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M23.0596 14.641C23.4225 14.282 24.0073 14.2852 24.3663 14.648L25.1468 15.4361C25.5056 15.799 25.5025 16.3844 25.1397 16.7433L21.8632 19.9848L25.1432 23.2642C25.5041 23.6251 25.504 24.2106 25.1432 24.5715L24.3587 25.3555C23.9978 25.7164 23.4129 25.7164 23.052 25.3555L19.9999 22.3033L16.9483 25.3555C16.5874 25.7164 16.002 25.7164 15.6411 25.3555L14.8571 24.5715C14.4962 24.2106 14.4962 23.6252 14.8571 23.2642L18.1366 19.9848L14.8606 16.7433C14.4978 16.3844 14.4946 15.7989 14.8536 15.4361L15.6335 14.648C15.9924 14.2852 16.5773 14.2821 16.9401 14.641L19.9999 17.668L23.0596 14.641Z" fill="#96CFCF"/>
              </svg>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </main>
</template>

<style lang="scss" scoped>
input {
  appearance: none;
  -webkit-appearance: none;
  border: 0;
  outline: none;
  background: transparent;
  box-shadow: none;
  border-radius: 0;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
}

input:-webkit-autofill {
  box-shadow: 0 0 0 1000px transparent inset;
  -webkit-text-fill-color: inherit;
}

.page {
  height: var(--vh);
  color: #3D3B4B;
  font-family: 'Open Sans Var', Arial, sans-serif;
  
  transition: all .25s;
  transition: background-color .5s ease-out;
  background-color: rgba(0, 0, 0, 0.60);

  cursor: pointer; /* Обязательно для iOS 12, чтобы клик на фоне работал */
  -webkit-tap-highlight-color: transparent; /* Убирает синюю вспышку при клике на весь экран */

  &--close {
    background-color: rgba(0,0,0,0);
  }

  &__inner {
    display: flex;
    height: calc(100% - 2rem);
    position: relative;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 16px 32px;

    @media (min-width: 1024px) {
      height: calc(100% - 4rem);
      padding: 32px;
    }
  }

  &__composition {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: relative;
    cursor: default;
  }

  &__banner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 450px;
    padding: 32px;
    border-radius: 16px;
    background-color: #F3FAFD;
    color: #595959;
    overflow: hidden;
    box-sizing: border-box;

    @media (min-width: 1024px) {
      width: 680px;
      padding: 56px;
      border-radius: 24px;
    }

    &-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      position: relative;
      z-index: 1;

      >:not(:last-child) {
        margin-bottom: 8px;

        @media (min-width: 1024px) {
          margin-bottom: 24px;
        }
      }
    }
  }

  &__suptitle {
    text-align: center;
    font-size: 14px;
    line-height: 18px;
    font-weight: 600;

    @media (min-width: 1024px) {
      font-size: 18px;
      line-height: 24px;
    }
  }

  &__title {
    color: #00BF73;
    text-align: center;
    font-size: 20px;
    line-height: 24px;
    font-weight: 700;

    @media (min-width: 1024px) {
      font-size: 32px;
      line-height: 40px;
    }
  }

  &__subtitle {
    text-align: center;
    font-size: 14px;
    line-height: 18px;
    font-weight: 600;

    @media (min-width: 1024px) {
      font-size: 18px;
      line-height: 24px;
    }
  }

  &__close {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 11;
    cursor: pointer;

    svg {
      width: 40px;
      height: 40px;

      @media (min-width: 1024px) {
        width: 60px;
        height: 60px;
      }
    }
  }

  &__input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &__form {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    >:not(:last-child) {
      margin-bottom: 16px;
    }
  }
  
  &__input {
    display: block;
    width: 320px;
    height: 52px;
    padding: 8px 12px;
    border-radius: 8px;
    background-color: #E5E5E5;
    border: 1px solid #5E4EFC;
    text-align: center;
    color: #3D3B4B;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 600;
    line-height: normal;
    transition: .25s;
    -webkit-user-select: initial!important;
    -khtml-user-select: initial!important;
    -moz-user-select: initial!important;
    -ms-user-select: initial!important;
    user-select: initial!important;
    -webkit-user-select: text!important;
    -webkit-touch-callout: default!important;
    /* Убираем системные тени iOS, которые могут перекрывать текст */
    -webkit-appearance: none!important;
    appearance: none!important;
    
    /* Позволяем выделение текста */
    -webkit-user-select: text!important;
    user-select: text!important;

    box-sizing: border-box;

    &:active, &:focus {
      border-color: #4f40d4;
      outline: none;
    }

    &::placeholder {
      color: #3D3B4B;
      opacity: 0.5;
    }

    @media (min-width: 844px) and (max-width: 1024px) {
      width: 320px;
      height: 52px;
      padding: 8px 12px;
    }

    @media (min-width: 1024px) {
      width: 100%;
      height: 52px;
      padding: 8px 12px;
    }
  }

  &__button {
    align-self: center;
    justify-self: center;

    &-wrapper {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }

  &__message {
    // position: absolute;
    font-weight: 700;
    font-size: 12px;
    line-height: 18px;
    text-align: center;
    max-width: 700px;
    width: 100%;
    margin-top: 2px;

    &--error {
      color: #d11a2a;
    }
  }

  &__hero {
    width: 159.201px;
    height: 140px;

    @media (min-width: 844px) and (max-width: 1024px) {
      width: 159.201px;
      height: 140px;
    }

    @media (min-width: 1024px) {
      width: 228.601px;
      height: 201px;
    }

    @include bg-image--fixed('gift-hero', '@/assets/images/ios/as/farm/common/sc-code');
  }
}
</style>
