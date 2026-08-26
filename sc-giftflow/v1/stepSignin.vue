<script lang="ts" setup>
import MainInput from './mainInput.vue';
import MainButton from './mainButton.vue';

const props = defineProps(['fields', 'step', 'process']);

const emit = defineEmits(['next']);

const toggleNext = (to: string) => {
  emit('next', props.step, to);
};
</script>

<template>
  <MainInput
    v-model="fields.password.value"
    class="form__input"
    :placeholder="$t('basic.auth.passwordPlaceholder')"
    type="password"
    :error="fields.password.error"
    :error-text="fields.password.errorText"
    :error-message="fields.password.errorMessage"
    :regex="fields.password.regex"
    @update:error="(error) => fields.password.error = error"
    @update:error-message="(message) => fields.password.errorMessage = message"
  />

  <MainButton
    :disabled="(fields.password.error && fields.password.errorMessage === fields.password.errorText) || !fields.password.value"
    :process="process"
    @click="toggleNext"
  >
    {{ $t('cars113.continue_btn_std') }}
  </MainButton>

  <div
    v-if="props.step === 'clean-signin'"
    class="forgot-password"
    @click="!props.process ? toggleNext('reset') : null"
  >
    {{ $t('basic.auth.forgotPassword.btn') }}
  </div>
</template>

<style lang="scss" scoped>
.forgot-password {
  color: #767676;
  font-size: 12px;
  line-height: 12px;
  font-weight: 600;
  text-decoration: underline;

  @media (min-width: 1024px) {
    font-size: 14px;
    line-height: 14px;
  }

  &:active {
    color: #535353;
  }
}
</style>
