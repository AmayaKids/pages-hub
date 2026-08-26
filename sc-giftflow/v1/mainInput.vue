<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useI18n } from "vue-i18n";

import { useProcessStore } from '@/stores/processStore';

import MainEye from './mainEye.vue';

const { t } = useI18n();

const processStore = useProcessStore();

const emit = defineEmits([
  'update:modelValue',
  'update:error',
  'update:errorMessage',
  'update:active',
]);

const {
  modelValue,
  placeholder,
  type,
  error,
  errorText,
  errorMessage,
  regex,
  disabled,
} = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  placeholder: {
    type: String,
    required: false,
    default: '',
  },
  type: {
    type: String,
    required: false,
    default: 'email',
  },
  error: {
    type: Boolean,
    required: false,
    default: false,
  },
  errorText: {
    type: String,
    required: false,
    default: '',
  },
  errorMessage: {
    type: String,
    required: false,
    default: '',
  },
  regex: {
    type: RegExp,
    required: false,
  },
  disabled: {
    type: Boolean,
    required: false,
  },
});

const passwordHidden = ref(true);
const isActive = ref(false);

const localType = computed(() => {
  if (type === 'password') {
    return passwordHidden.value ? 'password' : 'text';
  }

  return type;
});

const computedErrorText = computed(() => {
  if (type === 'password') {
    return t('basic.invalid_password');
  } else if (type === 'email') {
    return t('cars113["auth.signup.wrong.email"]');
  }
});

const updateValue = (event: Event) => {
  console.log('input', event);
  const value = (event.target as HTMLInputElement).value;

  emit('update:modelValue', value);

  if (regex?.test(value)) {
    emit('update:error', false);
    emit('update:errorMessage', '');
  } else {
    emit('update:error', true);
  }
};

const handleChange = (event: Event) => {
  console.log('change', event);
  const value = (event.target as HTMLInputElement).value;

  if (!regex?.test(value)) {
    emit('update:error', true);
    emit('update:errorMessage', errorText);
  } else {
    emit('update:error', false);
    emit('update:errorMessage', '');
  }
};

const handleFocus = (event: Event) => {
  console.log('focus', event);
  isActive.value = true;
  (event.target as HTMLInputElement).focus();
};

const handleBlur = () => {
  console.log('blur');
  isActive.value = false;
};
</script>

<template>
  <div class="form__item">
    <div :class="['input-group', { 'active': isActive, 'error': errorMessage && modelValue }]">
      <input
        :class="['input', { 'password': type === 'password' }]"
        :type="localType"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled || processStore.process"
        :readonly="disabled || processStore.process"
        @input="updateValue"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      >

      <MainEye
        v-if="type === 'password'"
        class="password-eye"
        :closed="passwordHidden"
        @click="!disabled || !processStore.process ? passwordHidden = !passwordHidden : null"
      />
    </div>

    <div v-if="errorMessage && modelValue" class="input-error">
      {{ computedErrorText }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form__item {
  width: 100%;
}

.input-group {
  display: flex;
  align-items: center;
  border: 2px solid #B8B5C8;
  border-radius: 14px;
  background-color: #FBFAFF;
  transition: .15s;
  height: 36px;

  @media (min-width: 1024px) {
    height: 48px;
    border-radius: 99px;
  }

  &.active {
    border-color: #9c99ab;
  }

  &.error {
    border-color: #EF2D74;
  }
}

.input {
  padding: 0 40px;
  text-align: center;
  outline: none;
  border: none;
  border-radius: 14px;
  background-color: transparent;
  flex: 1;
  width: 100%;
  -webkit-user-select: initial!important;
  -khtml-user-select: initial!important;
  -moz-user-select: initial!important;
  -ms-user-select: initial!important;
  user-select: initial!important;
  -webkit-user-select: text!important;
  -webkit-touch-callout: default!important;
  font-size: 14px;
  line-height: 36px;
  font-weight: 600;
  width: 100%;
  height: 36px;

  @media (min-width: 1024px) {
    font-size: 20px;
    line-height: 36px;
    border-radius: 99px;
    height: 48px;
  }

  &.password {
    padding-right: 0;
  }

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #B8B5C8!important;
  }
}

.password-eye {
  padding-left: 8px;
  padding-right: 14px;
}

.input-error {
  margin-top: 4px;
  color: #EF2D74;
  font-size: 10px;
  line-height: 16px;
  font-weight: 600;
  text-align: center;

  @media (min-width: 1024px) {
    font-size: 14px;
    line-height: 14px;
  }
}
</style>
