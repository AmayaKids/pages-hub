<script lang="ts" setup>
import { ref, reactive } from 'vue';

import MainInput from './mainInput.vue';
import MainButton from './mainButton.vue';
import MainLegalCheckbox from './mainLegalCheckbox.vue';

const props = defineProps(['fields', 'step', 'process']);

const emit = defineEmits(['next']);

const legal = ref(false);
const legalError = ref(false);

const toggleNext = () => {
  if (!legal.value) {
    legalError.value = true;
    return;
  }

  emit('next', props.step)
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

  <MainLegalCheckbox
    v-model="legal"
    :error="legalError"
    @change="(value: any) => value ? legalError = false : null"
  />

  <MainButton
    :disabled="(fields.email.error && fields.email.errorMessage === fields.email.errorText) || !fields.email.value || !legal"
    :process="process"
    @click="toggleNext"
  >
    {{ $t('cars113["auth.send"]') }}
  </MainButton>
</template>

<style lang="scss" scoped>
.legal {
  color: #767676;
  text-decoration: underline;
}
</style>
