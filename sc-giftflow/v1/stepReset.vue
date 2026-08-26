<script lang="ts" setup>
import MainInput from './mainInput.vue';
import MainButton from './mainButton.vue';

const props = defineProps(['fields', 'step', 'process']);

const emit = defineEmits(['next', 'prev']);

const toggleNext = () => {
  emit('next', props.step)
};

const togglePrev = () => {
  emit('prev', props.step)
};
</script>

<template>
  <MainInput
    v-model="fields.email.value"
    :error="fields.email.error"
    :error-text="fields.email.errorText"
    :error-message="fields.email.errorMessage"
    :regex="fields.email.regex"
    class="form__input"
    :placeholder="$t('basic.auth.emailPlaceholder')"
    @update:error="(error) => fields.email.error = error"
    @update:error-message="(message) => fields.email.errorMessage = message"
  />

  <MainButton
    :disabled="(fields.email.error && fields.email.errorMessage === fields.email.errorText) || !fields.email.value"
    :process="process"
    @click="toggleNext"
  >
    {{ $t('cars113["auth.send"]') }}
  </MainButton>

  <!-- <div class="page__back" @click="togglePrev">{{ $t('cars113["back_button"]') }}</div> -->
</template>

<style lang="scss" scoped>
.page__back {
  font-size: 12px;
  line-height: 12px;
  font-weight: 600;
  text-decoration-line: underline;
  color: #767676;

  &:active {
    color: #535353;
  }
}
</style>
