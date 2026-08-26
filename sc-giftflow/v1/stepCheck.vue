<script lang="ts" setup>
import MainButton from './mainButton.vue';

const props = defineProps(['fields', 'step', 'process']);

const emit = defineEmits(['next']);

const toggleNext = () => {
  emit('next', props.step)
};
</script>

<template>
  <MainButton :process="process" @click="toggleNext">
    {{ $t('basic.auth.ok') }}
  </MainButton>
</template>
