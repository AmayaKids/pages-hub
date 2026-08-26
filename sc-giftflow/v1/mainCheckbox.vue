<script lang="ts" setup>
import { ref, watch } from 'vue';

import { useProcessStore } from '@/stores/processStore';

const processStore = useProcessStore();

const emit = defineEmits(['update:modelValue', 'change']);

const { modelValue, error } = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  error: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const localValue = ref(modelValue);

const toggleValue = () => {
  if (!processStore.process) {
    localValue.value = !localValue.value;
  }
};

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
  emit('change', newValue);
});
</script>

<template>
  <div :class="['checkbox', { 'error': error }]" @click="toggleValue">
    <div v-if="localValue" class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="9" viewBox="0 0 11 9" fill="none">
        <path d="M8.35048 0.536005C8.88261 -0.0985801 9.82893 -0.181494 10.4638 0.350458C11.0983 0.882596 11.1813 1.82891 10.6493 2.46374L5.62196 8.46374C5.09017 9.09808 4.14461 9.18139 3.50966 8.65026L0.536999 6.16394C-0.0980227 5.63241 -0.181742 4.68693 0.349499 4.05163C0.881023 3.4162 1.82735 3.33163 2.46278 3.86315L4.28407 5.38659L8.35048 0.536005Z" fill="black"/>
      </svg>
    </div>

    <div v-else class="icon"></div>

    <span class="text">
      <slot />
    </span>
  </div>
</template>

<style lang="scss" scoped>
.checkbox {
  font-size: 10px;
  line-height: 10px;
  font-weight: 600;
  color: #767676;
  display: flex;
  margin-top: -2px;
  text-align: left;

  @media (min-width: 1024px) {
    margin-top: -8px;
    font-size: 14px;
    line-height: 14px;
  }

  &.error {
    color: var(--color-pink-70);
  }
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #B8B5C8;
  background: #FBFAFF;
  box-sizing: border-box;

  svg {
    width: 11px;
    height: 9px;
    color: #000;
  }
}

.text {
  flex: 1;
  margin-top: 5px;
  color: #767676;

  @media (min-width: 1024px) {
    margin-top: 3px;
  }
}
</style>
