<script lang="ts" setup>
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from "vue-i18n";

import mitt from '@/plugins/mitt';

import MainCheckbox from './mainCheckbox.vue';

defineProps(['moduleValue', 'error']);

const { t } = useI18n();

const linkIdx = ref(0);

const localValue = ref(false);
const useParentalGate = ref(true);

const parseText = () => {
  const rawText = 'Men [Maxfiylik siyosatiga] hamda [Foydalanish shartlariga] roziman.'
  const regex = /\[([^\]]+)\]/g; // Регулярное выражение для поиска содержимого между [ и ]
  let lastIndex = 0;
  let match;
  const parts = [];
  let linkId = 0; // Счётчик для последовательных id ссылок

  while ((match = regex.exec(rawText)) !== null) {
    // Добавляем текст перед фигурными скобками
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: rawText.slice(lastIndex, match.index) });
    }

    // Добавляем текст внутри фигурных скобок как отдельную ссылку
    const placeholderKey = match[1].trim(); // Убираем пробелы вокруг ключа
    parts.push({
      type: 'link',
      key: placeholderKey, // Сохраняем ключ для перевода
      id: linkId++, // Присваиваем последовательный id
    });

    lastIndex = regex.lastIndex; // Обновляем последний индекс
  }

  // Добавляем текст после последнего плейсхолдера
  if (lastIndex < rawText.length) {
    parts.push({ type: 'text', value: rawText.slice(lastIndex) });
  }

  return parts;
};

const formattedParts = computed(() => parseText());

const linkUrls: Record<string, Record<'terms' | 'privacy', string>> = {
  au: {
    terms: 'https://amayasoft.uz/terms',
    privacy: 'https://amayasoft.uz/privacy'
  },
};

const toggleIframe = (value: 'terms' | 'privacy') => {
  if (useParentalGate) {
    mitt.event('openParentalGateForLegal', value);
  } else {
    mitt.event('openLegal', value);
  }
};

function handleOpenLegal(value: unknown) {
  if ((value === 'terms' || value === 'privacy')) {
    mitt.event('openLink', linkUrls['au'][value]);
  }
}

onMounted(() => {
  mitt.listen('openLegal', handleOpenLegal);
});

onUnmounted(() => {
  mitt.off('openLegal', handleOpenLegal);
});
</script>

<template>
  <MainCheckbox v-model="localValue" :error="error">
    <span v-for="(part, index) in formattedParts" :key="index">
      <template v-if="part.type === 'text'">
        {{ part.value }}
      </template>
      
      <template v-else-if="part.type === 'link'">
        <span
          class="legal"
          @click.stop="toggleIframe(index === 1 ? 'terms' : 'privacy')"
        >
          {{ part.key }}
        </span>
      </template>
    </span>
  </MainCheckbox>
</template>

<style scoped>
.legal {
  color: #767676;
  text-decoration: underline;
}
</style>