<script lang="ts" setup>
import { watch, reactive, computed, onMounted, ref, onUnmounted, nextTick, onBeforeMount } from 'vue';
import { useI18n } from "vue-i18n";

import { useAppDataStore } from '@/stores/appDataStore';
import mitt from '@/plugins/mitt';
import apiClient from '@/api/index';

import MainBack from './mainBack.vue';
import MainClose from './mainClose.vue';
import MainButton from './mainButton.vue';

import StepAuth from './stepAuth.vue';
import StepSignin from './stepSignin.vue';
import StepSignup from './stepSignup.vue';
import StepReset from './stepReset.vue';
import StepCheck from './stepCheck.vue';

const appDataStore = useAppDataStore();
const api = new apiClient({ host: 'https://my.amayakids.com/api/public' });

const { t, locale } = useI18n();

const process = ref(false);
const show = ref(false);
const group = ref('auth');
const step = ref('auth');

const fields = reactive({
  email: {
    value: '',
    error: false,
    errorText: computed(() => t('cars113["auth.signup.wrong.email"]')),
    errorMessage: '',
    regex: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/,
  },
  password: {
    value: '',
    error: false,
    errorText: computed(() => t('basic.invalid_password')),
    errorMessage: '',
    regex: /^[A-Za-z0-9_]{6,128}$/,
  },
});

const meta = computed(() => {
  switch (step.value) {
    case 'auth':
      return {
        title: t('basic.auth.email.enterEmail.title'),
        subtitle: t('basic.auth.email.enterEmail.subtitle'),
      };
    case 'clean-signin':
      return {
        title: `${t('cars113.aaccount_exists_title')}`,
        subtitle: t('cars113["aauth_account_exists"]', [t('cars113["aauth_account_exists_0"]')]),
      };
    case 'signup':
      return {
        title: `${t('basic.auth.signup.enterPassword')}<br/>${t('basic.auth.signup.subtitle')}`,
        subtitle: t('cars113["aauth.signup.checkSpam"]')
      };
    case 'reset':
      return {
        title: t('cars113["auth.forgotPassword"]'),
        subtitle: t('cars113["auth.forgotPasswordScreen.subtitle"]'),
      };
    case 'check-email':
      return {
        title: t('basic.link_password_sent_title'),
        subtitle: t('basic.auth.forgotPasswordSent.subtitle', [fields.email.value]),
      };
    case 'reset-signin':
      return {
        title: t('basic.more_apps_account_sign_in_header'),
        subtitle: t('basic.auth.login.subtitle'),
      };
    default:
      return {
        title: '',
        subtitle: '',
      };
  }
});

const setVh = () => {  
  if (CSS.supports('height: 100dvh')) {
    document.documentElement.style.setProperty('--vh', '100dvh');
  } else {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
  }
};

const handleBack = () => {
  switch (step.value) {
    case 'select':
      console.log('hyper prev');
      mitt.event('back');
      break;
    case 'auth':
      step.value = 'select';
      break;
    case 'clean-signin':
    case 'signup':
    case 'reset-signin':
      step.value = 'auth';
      clearField('password');
      break;
    case 'reset':
      step.value = 'clean-signin';
      break;
    default:
      step.value = 'auth';
  }

  setTimeout(() => {
    mitt.event('mixpanelEvent', {
      eventName: 'auth_select',
      additionalProperties: [
        { key: 'option', value: 'back' },
      ],
    });
  }, 500);
};

const handleClose = (value?: string) => {
  console.log('close' + (value ? ` with skip: ${value}` : ''));
  mitt.event('close');

  setTimeout(() => {
    mitt.event('mixpanelEvent', {
      eventName: 'auth_select',
      additionalProperties: [
        { key: 'option', value: value ? value : 'close' },
      ],
    });
  }, 500);
};

const handleNext = async (
  from: 'select' | 'auth' | 'clean-signin' | 'reset-signin' | 'signup' | 'reset' | 'check-email',
  to?: string
) => {
  switch (from) {
    case 'select':
      step.value = 'auth';
      break;
    case 'auth':
      await checkEmailExist();
      break;
    case 'reset':
      await resetPassword();
      step.value = 'check-email';
      break;
    case 'check-email':
      step.value = 'reset-signin';
      break;
    case 'signup':
      await signIn('new');
      break;
    case 'clean-signin':
    case 'reset-signin':
      if (to === 'reset') {
        step.value = 'reset';
        return;
      }
      await signIn('old');
      break;
  }
};

const errorHandler = (error?: any) => {
  if (['signup', 'clean-signin', 'reset-signin'].includes(step.value)) {
    if (error && [400, 404, 500].includes(error?.response?.status)) {
      fields.password.error = true;
      fields.password.errorMessage = t('basic.error_something_went_wrong');
    } else {
      fields.password.error = true;
      fields.password.errorMessage = fields.password.errorText;
    }
  } else if (['auth', 'reset'].includes(step.value)) {
    if (error && [400, 404, 500].includes(error?.response?.status)) {
      fields.email.error = true;
      fields.email.errorMessage = t('basic.error_something_went_wrong');
    } else {
      fields.email.error = true;
      fields.email.errorMessage = fields.email.errorText;
    }
  }
}

async function checkEmailExist() {
  process.value = true;

  try {
    const response = await api.checkEmailExist({
      email: fields.email.value,
      language: locale.value,
      gameId: appDataStore.getGameId(),
      country: "Uzbekistan",
      experiment: "UA_Cars1_var1"
    });

    mitt.event('mixpanelEvent', {
      eventName: 'auth_email_done',
      additionalProperties: []
    });

    setTimeout(() => {
      mitt.event('mixpanelEvent', {
        eventName: 'ua_password_screen',
        additionalProperties: [],
      });
    }, 100)

    if (response.data.accountExists) {
      if (step.value === 'reset') {
        clearField('password');
      }

      step.value = step.value === 'auth' ? 'clean-signin' : 'reset-signin';
    } else {
      if (step.value === 'auth') {
        step.value = 'signup';
      } else {
        errorHandler();
      }
    }
  } catch (error) {
    errorHandler(error);
    console.log(error);
  } finally {
    process.value = false;
  }
};

const doneAuth = () => {
  show.value = false;
  nextGroup();
};

const handleForward = () => {
  mitt.event('forward');
}

function nextGroup() {
  if (group.value === 'info') {
    setTimeout(() => {
      mitt.event('mixpanelEvent', {
        eventName: 'ua_email_screen',
        additionalProperties: [],
      });
    }, 100)

    group.value = 'auth';
  } else if (group.value === 'auth') {
    group.value = 'gift';
    setTimeout(() => {
      mitt.event('mixpanelEvent', {
        eventName: 'ua_congratulation_screen',
        additionalProperties: [],
      });
    }, 100);
  }
}

const signIn = async (type: 'new' | 'old') => {
  process.value = true;

  try {
    const response = await api.signIn({
      email: fields.email.value,
      password: fields.password.value,
      gameId: appDataStore.getGameId(),
      // language: locale.value,
    });

    let ajwt = response.data.AJWT;
    let accountId = response.data.id;

    if(ajwt){
      mitt.event('applyAJWT', ajwt);
      mitt.event('applyAccountId', accountId);
    }

    mitt.event('mixpanelEvent', {
      eventName: 'auth_complete',
      additionalProperties: [
        {key: 'typeOfUser', value: type},
        {key: 'where_auth', value: '-'},
        {key: 'where_account_made', value: '-'},
        {key: 'from_app', value: '-'},
        {key: 'provider', value: 'email'}
      ]
    });

    await grantAuthPurchase(ajwt);

    // doneAuth();
  } catch (error) {
    errorHandler(error);
    console.log(error);
  } finally {
    process.value = false;
  }
};

const AGSHost = computed(() => appDataStore.appData.AGSHost || 'https://cars1.ags.amayakids.com');

async function grantAuthPurchase(AJWT: string) {
  try {
    const response = await api.grantAuthPurchase({
      AGSHost: AGSHost.value,
      deviceId: appDataStore.appData.deviceId,
      productId: 'com.amayasoft.cars.ua.3daysfree',
      AJWT,
    });

    // if (response.data.status === 'purchase_granted') {
    //   mitt.event('refreshPurchases');
    //   doneAuth();
    // } else if (response.data.status === 'purchase_already_claimed') {
    //   mitt.event('refreshPurchases');
    //   handleForward();
    // }
  } catch {}
}

const resetPassword = async () => {
  process.value = true;

  try {
    await api.updatePassword({
      email: fields.email.value,
      gameId: appDataStore.getGameId(),
      language: 'uz',
    });

    clearField('password');
  } catch (error) {
    errorHandler(error);
    console.log(error);
  } finally {
    process.value = false;
  }
};

const clearField = (field: string) => {
  (fields as any)[field].value = '';
  (fields as any)[field].error = false;
  (fields as any)[field].errorMessage = '';
}

const resetAll = () => {
  clearField('email');
  clearField('password');
  group.value = 'auth';
  step.value = 'auth';
};

function openHandler() {
  if (show.value) return;
  resetAll();
  show.value = true;

  nextTick(() => {
    updateBannerHeight();

    if (bannerInner.value && resizeObserver) {
      resizeObserver.disconnect(); // на случай повторного открытия
      resizeObserver.observe(bannerInner.value);
    }
  });
}

function closeHandler() {
  show.value = false;
}

const bannerInner = ref<HTMLElement | null>(null);
const bannerHeight = ref<number>(0); // не null

let resizeObserver: ResizeObserver | null = null;

const updateBannerHeight = () => {
  if (bannerInner.value && bannerInner.value.parentElement) {
    const h = bannerInner.value.offsetHeight;
    const parentStyles = getComputedStyle(bannerInner.value.parentElement);
    const paddingTop = parseFloat(parentStyles.paddingTop) || 0;
    const paddingBottom = parseFloat(parentStyles.paddingBottom) || 0;

    if (h > 0) {
      bannerHeight.value = h + paddingTop + paddingBottom;
    }
  }
};

watch(appDataStore, () => {
  // resetAll();
  // step.value = 'select';
  mitt.event('ready');
});

const country = computed(() => appDataStore.appData.userCountry || 'Uzbekistan');

onMounted(() => {
  resetAll();
  step.value = 'auth';

  mitt.listen('open', openHandler);
  mitt.listen('close', closeHandler);

  mitt.event('ready');

  resizeObserver = new ResizeObserver(() => {
    updateBannerHeight();
  });

  // for dev
  // setTimeout(() => {
  //   show.value = false;
  //   group.value = 'gift';
  // }, 200)
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  mitt.off('open', openHandler);
  mitt.off('close', closeHandler);
});

onBeforeMount(() => {
  if (country.value === 'Uzbekistan') {
    locale.value = 'uz';
  }
});
</script>

<template>
  <main :class="[`page ${locale}`, {'page--close': !show && group !== 'gift' }]">
    <div class="page__inner">
      <transition name="slide-up-down" mode="out-in">
        <div v-if="show" class="page__composition" @click.stop="">
          <div class="page__banner-wrapper">
            <div class="page__banner" :style="{ height: bannerHeight && false ? `${bannerHeight}px` : undefined }">
              <transition name="card-transition" mode="out-in">
                <div v-if="group === 'info'" class="page__airplane"></div>
              </transition>
              <transition name="card-transition" mode="out-in">
                <div v-if="group === 'info'" class="page__boat"></div>
              </transition>
              <transition name="card-transition" mode="out-in">
                <div v-if="group === 'info'" class="page__car"></div>
              </transition>

              <transition name="card-transition" mode="out-in">
                <div v-if="group === 'info'" ref="bannerInner" key="t1" class="page__banner-inner">
                  <div class="page__suptitle" v-html="$t('cars113.screen1_text_1')"></div>
                  <div class="page__title" v-html="$t('cars113.screen1_text_2')"></div>
                  <div class="page__subtitle" v-html="$t('cars113.screen1_text_3')"></div>

                  <div class="page__button-wrapper">
                    <MainButton
                      @click="nextGroup"
                    >
                      {{ $t('cars113.screen1_button') }}
                    </MainButton>
                  </div>
                </div>

                <div v-else-if="group === 'auth'" ref="bannerInner" key="t2" class="page__banner-inner">
                  <div v-if="step === 'auth' || ['clean-signin', 'reset-signin', 'signup'].includes(step)" class="page__steps">
                    <div :class="['page__step', { 'page__step--active': step === 'auth' }]">
                      <div class="page__step-number">1</div>
                      <div class="page__step-text">{{ $t('cars113.step_1') }}</div>
                    </div>
                    <svg class="page__arrow" xmlns="http://www.w3.org/2000/svg" width="21" height="8" viewBox="0 0 21 8" fill="none">
                      <path d="M16.9648 0.146447C17.1601 -0.0488155 17.4766 -0.0488155 17.6719 0.146447L20.8535 3.32809C21.0488 3.52335 21.0488 3.83986 20.8535 4.03512L17.6719 7.21676C17.4766 7.41202 17.1601 7.41202 16.9648 7.21676C16.7696 7.0215 16.7696 6.70499 16.9648 6.50973L19.293 4.1816H0.5C0.223858 4.1816 0 3.95775 0 3.6816C0 3.40546 0.223858 3.1816 0.5 3.1816H19.293L16.9648 0.853478C16.7696 0.658216 16.7696 0.341709 16.9648 0.146447Z" fill="#00BF73"/>
                    </svg>
                    <div :class="['page__step', { 'page__step--active': step !== 'auth' }]">
                      <div class="page__step-number">2</div>
                      <div class="page__step-text">{{ $t('cars113.step_2') }}</div>
                    </div>
                  </div>
                  <div v-if="step !== 'check-email'" class="page__divider"></div>
                  <div class="page__title" v-html="meta.title"></div>
                  <svg v-if="step === 'check-email'" class="page__email" xmlns="http://www.w3.org/2000/svg" width="133" height="65" viewBox="0 0 133 65" fill="none">
                    <path d="M45.2096 25.8371C44.8736 24.4257 44.5247 22.9045 44.2501 21.4807C43.9843 20.103 43.1344 18.005 44.0155 16.8269C44.3044 16.44 44.7187 16.1654 45.1876 16.0498C45.7151 15.9218 46.5685 15.825 47.1298 15.7452C48.2357 15.5901 49.3407 15.4291 50.4449 15.2623L102.428 7.61416C103.654 7.44343 104.981 7.70362 105.261 9.00267C105.614 10.6429 105.602 12.8001 105.801 14.4808C105.821 14.895 105.848 15.3088 105.882 15.722L107.976 41.5457C108.017 42.0412 108.076 42.5669 108.099 43.0552C108.147 44.0588 108.451 45.1646 107.7 45.9851C107.338 46.3802 106.956 46.6197 106.422 46.7143C105.251 46.9354 104.061 47.1014 102.883 47.2844L56.0802 54.7235C54.7739 54.9337 52.959 55.5319 51.8933 54.5714C51.6219 54.3294 51.419 54.0202 51.3052 53.6749C51.1098 53.0755 50.7844 51.3823 50.6344 50.696L45.4658 27.0234C45.3899 26.6318 45.2953 26.228 45.2096 25.8371Z" fill="#FEB62B"/>
                    <path d="M45.2096 25.8371C44.8736 24.4257 44.5247 22.9045 44.2501 21.4807C43.9843 20.103 43.1344 18.005 44.0155 16.8269C44.3044 16.44 44.7187 16.1654 45.1876 16.0498C45.7151 15.9218 46.5685 15.825 47.1298 15.7452C48.2357 15.5901 49.3407 15.4291 50.4449 15.2623L102.428 7.61416C103.654 7.44343 104.981 7.70362 105.261 9.00267C105.614 10.6429 105.602 12.8001 105.801 14.4808L105.694 14.3931C105.413 14.5818 104.329 15.9493 103.982 16.3058C103.187 17.1239 102.425 17.8827 101.565 18.6399C96.9371 22.7175 91.801 26.3521 86.5891 29.6495C84.6361 30.8851 82.3928 32.3431 80.2002 33.0206C78.6689 33.494 77.1137 33.3951 75.5603 33.0722C72.4529 32.4263 69.3584 31.678 66.2706 30.9399L53.6211 27.8863L48.0479 26.5142C47.6072 26.4031 45.5239 25.8522 45.2096 25.8371Z" fill="#FEB62B"/>
                    <path d="M45.2096 25.8371C45.5239 25.8522 47.6072 26.4031 48.0479 26.5142L53.6211 27.8863L66.2706 30.9399C69.3584 31.678 72.4529 32.4263 75.5603 33.0722C77.1137 33.3951 78.6689 33.494 80.2002 33.0206C82.3928 32.3431 84.6361 30.8851 86.5891 29.6495C91.801 26.3521 96.9371 22.7175 101.565 18.6399C102.425 17.8827 103.187 17.1239 103.982 16.3058C104.329 15.9493 105.413 14.5818 105.694 14.3931L105.801 14.4808C105.821 14.895 105.848 15.3088 105.882 15.722C100.272 21.4263 94.1744 26.6303 87.6591 31.2748C79.9283 36.7464 79.1272 36.4743 70.1773 34.0928C64.6225 32.5856 59.0843 31.0171 53.5641 29.3876L48.3656 27.8592C47.7009 27.6602 46.0735 27.1313 45.4658 27.0234C45.3899 26.6318 45.2953 26.228 45.2096 25.8371Z" fill="#ED6A00"/>
                    <path d="M28.8853 40.536C28.9509 40.5221 29.0714 40.5212 29.1431 40.5179C29.3589 40.7283 29.4164 41.7754 29.4734 42.1708L3.33834 51.0859L2.42031 49.5027L0 45.363C0.842498 45.1604 2.3567 44.9517 3.27857 44.7959L28.8853 40.536Z" fill="#FEB62B"/>
                    <path d="M35.8012 31.138C36.0231 31.1149 36.167 31.0783 36.3719 31.1611C36.6898 31.4657 36.7513 32.2706 36.8656 32.7759C35.8787 33.0356 34.614 33.2681 33.6015 33.4789L9.79234 38.452L8.78986 38.6689C9.16152 36.4813 9.51625 34.291 9.85394 32.0979L35.8012 31.138Z" fill="#FEB62B"/>
                    <path d="M44.5071 47.9212C44.6002 47.8907 44.617 47.9117 44.7146 47.9438C44.9179 48.2241 45.0984 48.7028 45.2388 49.0327L25.4064 57.3364C25.2402 57.4128 25.1983 57.4512 25.0276 57.4238C24.9258 57.1928 24.8716 53.1445 24.8549 52.5463C27.0375 52.1002 29.341 51.4983 31.5185 50.9869L44.5071 47.9212Z" fill="#FEB62B"/>
                  </svg>
                  <div v-if="step !== 'auth'" class="page__subtitle" v-html="meta.subtitle"></div>

                  <StepAuth
                    v-if="step === 'auth'"
                    :fields="fields"
                    :step="step"
                    :process="process"
                    @next="handleNext"
                  />
          
                  <StepSignin 
                    v-else-if="step === 'clean-signin' || step === 'reset-signin'"
                    :fields="fields"
                    :step="step"
                    :process="process"
                    @next="handleNext"
                  />

                  <StepSignup 
                    v-else-if="step === 'signup'"
                    :fields="fields"
                    :step="step"
                    :process="process"
                    @next="handleNext"
                  />
                  
                  <StepReset 
                    v-else-if="step === 'reset'"
                    :fields="fields"
                    :step="step"
                    :process="process"
                    @next="handleNext"
                    @prev="handleBack"
                  />
                  
                  <StepCheck 
                    v-else-if="step === 'check-email'"
                    :fields="fields"
                    :step="step"
                    :process="process"
                    @next="handleNext"
                  />
                </div>

                <div v-else ref="bannerInner" key="t3" class="page__banner-inner">
                  <MainButton
                    @click="handleForward"
                  >
                    {{ $t('cars113.screen1_button') }}
                  </MainButton>
                </div>
              </transition>

            </div>

            <svg v-if="group === 'auth' && ['reset', 'reset-signin', 'clean-signin', 'signup'].includes(step)" class="page__back" width="46" height="40" viewBox="0 0 46 40" fill="none" xmlns="http://www.w3.org/2000/svg" @click="handleBack">
              <rect x="10" y="10" width="26" height="20" rx="10" fill="#00BF73"/>
              <path d="M17.6464 19.6464C17.4512 19.8417 17.4512 20.1583 17.6464 20.3536L20.8284 23.5355C21.0237 23.7308 21.3403 23.7308 21.5355 23.5355C21.7308 23.3403 21.7308 23.0237 21.5355 22.8284L18.7071 20L21.5355 17.1716C21.7308 16.9763 21.7308 16.6597 21.5355 16.4645C21.3403 16.2692 21.0237 16.2692 20.8284 16.4645L17.6464 19.6464ZM28 20.5C28.2761 20.5 28.5 20.2761 28.5 20C28.5 19.7239 28.2761 19.5 28 19.5V20V20.5ZM18 20V20.5H28V20V19.5H18V20Z" fill="white"/>
            </svg>

            <div class="page__close" @click="handleClose('close')">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M23.0596 14.641C23.4225 14.282 24.0073 14.2852 24.3663 14.648L25.1468 15.4361C25.5056 15.799 25.5025 16.3844 25.1397 16.7433L21.8632 19.9848L25.1432 23.2642C25.5041 23.6251 25.504 24.2106 25.1432 24.5715L24.3587 25.3555C23.9978 25.7164 23.4129 25.7164 23.052 25.3555L19.9999 22.3033L16.9483 25.3555C16.5874 25.7164 16.002 25.7164 15.6411 25.3555L14.8571 24.5715C14.4962 24.2106 14.4962 23.6252 14.8571 23.2642L18.1366 19.9848L14.8606 16.7433C14.4978 16.3844 14.4946 15.7989 14.8536 15.4361L15.6335 14.648C15.9924 14.2852 16.5773 14.2821 16.9401 14.641L19.9999 17.668L23.0596 14.641Z" fill="#96CFCF"/>
              </svg>
            </div>
          </div>
        </div>

        <div v-else-if="!show && group === 'gift'" class="page__congrats" @click.stop="">
          <div class="page__congrats-content">
            <div class="page__title" v-html="$t('cars113.congrats_screen_title')"></div>
            <div class="page__subtitle" v-html="$t('cars113.congrats_screen_text')"></div>

            <MainButton
              @click="handleForward"
            >
              {{ $t('cars113.congrats_screen_button') }}
            </MainButton>
          </div>
        </div>
      </transition>
    </div>
  </main>
                  
  <!-- <main :class="['main', { 'main--with-task-bg': isVariant('withTask_carsMbt') && step === 'select' }]">
    <div class="main__inner">
      <section :class="['section', { 'section--select': step === 'select' }]">
        <div v-if="step !== 'select'" :class="['meta', { 'meta--check-email': step === 'check-email' }]">
          <svg v-if="step === 'check-email'" class="check" width="65" height="64" viewBox="0 0 65 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M32.5 58.6666C47.2276 58.6666 59.1667 46.7276 59.1667 32C59.1667 17.2724 47.2276 5.33331 32.5 5.33331C17.7724 5.33331 5.83337 17.2724 5.83337 32C5.83337 46.7276 17.7724 58.6666 32.5 58.6666Z" fill="#FFE8C6"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.9663 35.4744C14.7009 34.1931 14.7121 32.1266 15.9913 30.8585L18.8612 28.0137C20.1405 26.7456 22.2032 26.7563 23.4686 28.0376L29.4661 34.1101L41.1991 22.3555C42.4714 21.0809 44.5342 21.0809 45.8065 22.3555L48.6619 25.2162C49.9342 26.4908 49.9342 28.5575 48.6619 29.8321L32.3536 46.1704C30.9802 47.5463 27.9615 47.6198 26.5885 46.2296L15.9663 35.4744Z" fill="#FF8D24"/>
          </svg>

          <div class="meta__title">{{ meta.title }}</div>
          <div v-if="step !== 'auth'" class="meta__subtitle" v-html="meta.subtitle"></div>
        </div>

        <div :class="['content', { 'content--select': step === 'select' }]">
          <template v-if="step === 'select'">
            <StepSelectWithTask
              v-if="isVariant('withTask_carsMbt')"
              :fields="fields"
              @next="handleNext"
              @close="handleClose"
            />

            <StepSelect
              v-else
              :fields="fields"
              @next="handleNext"
              @close="handleClose"
            />
          </template>

          <StepAuth
            v-if="step === 'auth'"
            :fields="fields"
            @next="handleNext"
          />
          
          <StepSignin 
            v-else-if="step === 'clean-signin' || step === 'reset-signin'"
            :fields="fields"
            @next="handleNext"
          />

          <StepSignup 
            v-else-if="step === 'signup'"
            :fields="fields"
            @next="handleNext"
          />
          
          <StepReset 
            v-else-if="step === 'reset'"
            :fields="fields"
            @next="handleNext"
          />
          
          <StepCheck 
            v-else-if="step === 'check-email'"
            :fields="fields"
            @next="handleNext"
          />
        </div>
      </section>
    </div>
  </main> -->
</template>

<style lang="scss" scoped>

// input {
//   appearance: none;
//   -webkit-appearance: none;
//   border: 0;
//   outline: none;
//   background: transparent;
//   box-shadow: none;
//   border-radius: 0;
//   padding: 0;
//   margin: 0;
//   font: inherit;
//   color: inherit;
// }

// input:-webkit-autofill {
//   box-shadow: 0 0 0 1000px transparent inset;
//   -webkit-text-fill-color: inherit;
// }

@import url('./styles.scss');


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

  &__congrats {
    @include bg-image--fixed('popupg', '@/assets/images/ios/as/cars1/common/sc-giftflow');
    width: 595px;
    height: 491.522px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @media (min-width: 1024px) {
      width: 998px;
      height: 824px;
    }

    &-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 247px;
      height: 219px;

      >:not(:last-child) {
        margin-bottom: 8px;

        @media (min-width: 1024px) {
          margin-bottom: 24px;
        }
      }
    }
  }

  &__airplane {
    @include bg-image--fixed('airplane', '@/assets/images/ios/as/cars1/common/sc-giftflow');
    width: 163.345px;
    height: 103.257px;
    aspect-ratio: 163.34/103.26;
    position: absolute;
    right: 128.328px;
    top: -72.104px;

    @media (min-width: 1024px) {
      width: 288.121px;
      height: 182.133px;
      aspect-ratio: 193/122;
      position: absolute;
      right: 180.939px;
      top: -131.542px;
    }
  }

  &__boat {
    @include bg-image--fixed('boat', '@/assets/images/ios/as/cars1/common/sc-giftflow');
    width: 111.365px;
    height: 100.873px;
    aspect-ratio: 111.36/100.87;
    position: absolute;
    left: -12.431px;
    bottom: -33.713px;

    @media (min-width: 1024px) {
      width: 179.399px;
      height: 162.498px;
      aspect-ratio: 138/125;
      position: absolute;
      left: -33.448px;
      bottom: -62.77px;
    }
  }

  &__car {
    @include bg-image--fixed('car', '@/assets/images/ios/as/cars1/common/sc-giftflow');
    width: 133.21px;
    height: 100.873px;
    aspect-ratio: 103/78;
    position: absolute;
    right: -42.153px;
    bottom: -33.713px;

    @media (min-width: 1024px) {
      width: 214.594px;
      height: 162.5px;
      aspect-ratio: 103/78;
      position: absolute;
      right: -68.207px;
      bottom: -64.548px;
    }
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
    // overflow: hidden;
    box-sizing: border-box;
    transition: height 0.3s ease;

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
      // height: 100%;
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

  &__divider {
    background-color: #CBE5E3;
    height: 1px;
    width: 100%;
  }

  &__email {
    width: 133px;
    height: 65px;
    aspect-ratio: 133/65;
  }

  &__steps {
    display: flex;
    align-items: center;

    >:not(:last-child) {
      margin-right: 8px;
    }
  }

  &__step {
    display: flex;
    align-items: center;
    justify-content: center;
    
    &-number {
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background-color: #A1D2CE;
      color: #fff;
      width: 20px;
      height: 20px;
      margin-right: 8px;
      font-size: 10px;
      line-height: 10px;
      font-weight: 700;
      border-radius: 99px;
    }

    &-text {
      font-size: 10px;
      line-height: 10px;
      font-weight: 600;
      color: #74BAB5;
    }

    &--active {
      .page__step {
        &-number {
          background-color: #00BF73;
        }

        &-text {
          color: #000;
        }
      }
    }
  }

  &__arrow {
    width: 21px;
    height: 7.363px;

    @media (min-width: 1024px) {
      width: 21px;
      height: 7.36px;
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

  &__back {
    position: absolute;
    left: 0;
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
  
  // &__input {
  //   display: block;
  //   width: 320px;
  //   height: 52px;
  //   padding: 8px 12px;
  //   border-radius: 8px;
  //   background-color: #E5E5E5;
  //   border: 1px solid #5E4EFC;
  //   text-align: center;
  //   color: #3D3B4B;
  //   text-align: center;
  //   font-size: 18px;
  //   font-style: normal;
  //   font-weight: 600;
  //   line-height: normal;
  //   transition: .25s;
  //   -webkit-user-select: initial!important;
  //   -khtml-user-select: initial!important;
  //   -moz-user-select: initial!important;
  //   -ms-user-select: initial!important;
  //   user-select: initial!important;
  //   -webkit-user-select: text!important;
  //   -webkit-touch-callout: default!important;
  //   /* Убираем системные тени iOS, которые могут перекрывать текст */
  //   -webkit-appearance: none!important;
  //   appearance: none!important;
    
  //   /* Позволяем выделение текста */
  //   -webkit-user-select: text!important;
  //   user-select: text!important;

  //   box-sizing: border-box;

  //   &:active, &:focus {
  //     border-color: #4f40d4;
  //     outline: none;
  //   }

  //   &::placeholder {
  //     color: #3D3B4B;
  //     opacity: 0.5;
  //   }

  //   @media (min-width: 844px) and (max-width: 1024px) {
  //     width: 320px;
  //     height: 52px;
  //     padding: 8px 12px;
  //   }

  //   @media (min-width: 1024px) {
  //     width: 100%;
  //     height: 52px;
  //     padding: 8px 12px;
  //   }
  // }

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

// .main {
//   height: var(--vh);
//   color: var(--primary-color);
//   font-family: 'Open Sans New', sans-serif;
// }

// .header {
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   height: 3rem;
//   min-height: 3rem;
//   max-height: 3rem;
//   padding: 0 1rem;
//   transition: .125s;

//   .main--with-task-bg & {
//     background-color: var(--color-orange-5);
//   }

//   @media (min-width: 1024px) {
//     height: 6rem;
//     min-height: 6rem;
//     max-height: 6rem;
//     padding: 0 2rem;
//   }

//   &__back,
//   &__close {
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     padding: .25rem;
//     color: var(--color-orange-70);
//     width: 2rem;
//     height: 2rem;

//     svg {
//       width: 1.5rem;
//       height: 1.5rem;
//     }

//     @media (min-width: 1024px) {
//       padding: 1.12rem;
//       width: 4rem;
//       height: 4rem;

//       svg {
//         width: 1.75rem;
//         height: 1.75rem;
//       }
//     }
//   }

//   &__title {
//     font-size: 1.125rem;
//     font-weight: 700;
//     line-height: 1.5rem;
//     color: var(--text-primary);

//     @media (min-width: 1024px) {
//       font-size: 1.5rem;
//       line-height: 2rem;
//     }
//   }
// }

// .section {
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   padding-top: 1.5rem;

//   @media (min-width: 1024px) {
//     padding-top: 2.625rem;
//   }

//   &--select {
//     padding-top: 0!important;

//     @media (min-width: 1024px) {
//       padding-top: 0!important;
//     }
//   }
// }

// .meta {
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   margin-bottom: 1rem;

//   @media (min-width: 1024px) {
//     margin-bottom: 2rem;
//   }

//   &.meta--check-email {
//     margin-bottom: 0;
//   }

//   &__title {
//     font-size: 1.5rem;
//     font-weight: 700;
//     line-height: 2rem;
//     margin-bottom: .25rem;
//     color: var(--text-primary);

//     @media (min-width: 1024px) {
//       font-size: 2rem;
//       line-height: 2.25rem;
//       margin-bottom: .75rem;
//     }
//   }

//   &__subtitle {
//     font-weight: 400;
//     line-height: 1.25rem;
//     color: var(--text-primary);

//     @media (min-width: 1024px) {
//       font-size: 1.125rem;
//       line-height: 1.5rem;
//     }
//   }
// }

// .content,
// .meta {
//   width: 25rem;
//   min-width: 25rem;
//   max-width: 25rem;
//   text-align: center;

//   @media (min-width: 1024px) {
//     width: 29.5rem;
//     min-width: 29.5rem;
//     max-width: 29.5rem;
//   }

//   &--select {
//     width: 100%!important;
//     min-width: 100%!important;
//     max-width: 100%!important;

//     @media (min-width: 1024px) {
//       width: 100%!important;
//       min-width: 100%!important;
//       max-width: 100%!important;
//     }
//   }
// }

// .form {
//   display: flex;
//   flex-direction: column;
//   align-items: stretch;

//   &__input {
//     // width: 100%;
//   }
// }

// .check {
//   width: 4rem;
//   height: 4rem;
//   margin-bottom: 1rem;

//   @media (min-width: 1024px) {
//     width: 5rem;
//     height: 5rem;
//     margin-bottom: 2rem;
//   }
// }
</style>
