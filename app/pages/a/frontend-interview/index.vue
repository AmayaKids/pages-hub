<script setup>
import { ref, computed } from 'vue'

const questions = {
  'Верстка': {
    icon: '🎨',
    easy: [
      { q: 'Опиши все значения position: static, relative, absolute, fixed, sticky — чем отличаются?', a: 'static — дефолт, в потоке, top/left не работают. relative — в потоке, но можно смещать через top/left относительно себя. absolute — выпадает из потока, позиционируется относительно ближайшего positioned предка. fixed — всегда относительно вьюпорта, не скроллится. sticky — ведёт себя как relative пока не достигнет порога скролла, потом "прилипает" как fixed.' },
      { q: 'Как работает box-sizing? Если у элемента width: 200px, padding: 20px, border: 2px — какой будет итоговая ширина при content-box и border-box?', a: 'content-box (дефолт): итоговая ширина = 200 + 20*2 + 2*2 = 244px. border-box: итоговая ширина = 200px, padding и border включены внутрь. margin на итоговую ширину не влияет, он снаружи.' },
      { q: 'Чем отличается display: block от display: inline-block?', a: 'block — занимает всю ширину строки, начинается с новой строки. inline-block — ширина по контенту, стоит в строке, но принимает width/height в отличие от inline.' }
    ],
    medium: [
      { q: 'Как реализовать подстановку нужной картинки в зависимости от разрешения экрана + поддержку ретины (2x)?', a: 'Через srcset и sizes на <img>: srcset="img.jpg 1x, img@2x.jpg 2x" или srcset="img-400.jpg 400w, img-800.jpg 800w" sizes="(max-width: 600px) 400px, 800px". Либо через <picture> с <source media="...">. Браузер сам выберет нужный вариант.' },
      { q: 'Как сделать вертикальное и горизонтальное центрирование через flexbox?', a: 'display: flex; justify-content: center; align-items: center на родителе.' },
      { q: 'Что такое stacking context и когда он создаётся?', a: 'Контекст наложения — изолированная группа z-index. Создаётся при: position + z-index != auto, opacity < 1, transform, filter, will-change и др.' },
      { q: 'Как реализовать адаптивную сетку без медиазапросов?', a: 'grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) — сетка сама перестраивается под доступную ширину.' }
    ],
    hard: [
      { q: 'У тебя экран paywall в WebView — фиксированный вьюпорт, нет браузерного скролла, всё должно влезать. Как верстаешь?', a: '100dvh на контейнер, flex column, justify-content: space-between. Текст в em/rem, картинки в %. Тестировать на 320px минимуме. Никаких фиксированных px высот.' },
      { q: 'Как работает will-change и когда его стоит использовать? Когда не стоит?', a: 'Подсказывает браузеру заранее создать compositor layer. Стоит: для анимаций transform/opacity. Не стоит: вешать везде — жрёт память и может замедлить рендеринг.' },
      { q: 'Объясни как работает contain: layout paint style и когда это даёт прирост перформанса.', a: 'Изолирует элемент от остального layout-дерева. layout — браузер не пересчитывает внешний layout. paint — отдельный слой отрисовки. Помогает с большими списками и частыми обновлениями DOM.' }
    ]
  },
  'JavaScript': {
    icon: '⚡',
    easy: [
      { q: 'Какие методы массива знаешь? Расскажи про map, filter, find, some, every, includes.', a: 'map — трансформирует каждый элемент, возвращает новый массив. filter — оставляет только те что прошли условие. find — первый элемент удовлетворяющий условию. some — хоть один подходит? every — все подходят? includes — есть ли такое значение в массиве.' },
      { q: 'Как проверить что переменная является массивом?', a: 'Array.isArray(value) — единственный надёжный способ. typeof [] === "object" не подходит — объекты тоже object. instanceof Array может сломаться в разных iframe-контекстах.' },
      { q: 'Как проверить наличие свойства в объекте? Назови несколько способов.', a: '"key" in obj — проверяет включая прототип. obj.hasOwnProperty("key") — только собственные свойства. Object.hasOwn(obj, "key") — современный вариант hasOwnProperty. obj.key !== undefined — ненадёжно, свойство может быть и undefined.' }
    ],
    medium: [
      { q: 'Как работает .replace() у строк? Чем отличается замена строки от замены с регуляркой?', a: 'str.replace("a", "b") — заменяет только первое вхождение. str.replace(/a/g, "b") — заменяет все вхождения через флаг g. str.replaceAll("a", "b") — современный способ заменить все без регулярки.' },
      { q: 'Как делать запросы к REST API? Какую конструкцию используешь?', a: 'async/await + fetch: async function getData() { try { const res = await fetch(url); const data = await res.json(); } catch(e) { console.error(e) } }. Либо axios который сам парсит JSON и бросает ошибки на не-2xx статусы.' },
      { q: 'Как обрабатывать события касания на мобильных? Чем отличается touch от click?', a: 'touch события: touchstart, touchmove, touchend. click на мобильных срабатывает с задержкой ~300ms (браузер ждёт double tap). Для быстрого отклика используют touchstart или библиотеки типа FastClick. В Vue можно вешать @touchstart, @touchend прямо на элемент.' },
      { q: 'Что такое debounce и зачем нужен? Приведи пример из жизни.', a: 'Debounce откладывает выполнение функции до тех пор пока не пройдёт N миллисекунд с последнего вызова. Пример: поиск по инпуту — не делаем запрос на каждую букву, только когда пользователь перестал печатать. Или resize события — не пересчитываем лейаут на каждый пиксель.' }
    ],
    hard: [
      { q: 'Какие типы данных есть в JavaScript? Чем примитивы отличаются от объектов?', a: 'Примитивы: string, number, boolean, null, undefined, symbol, bigint — хранятся по значению, иммутабельны. Объекты (object, array, function) — хранятся по ссылке. Примитивы копируются при присвоении, объекты — нет: const a = {}; const b = a; b.x = 1; a.x === 1.' },
      { q: 'Что такое замыкание? Приведи практический пример.', a: 'Функция запоминает лексическое окружение где была создана. Практика: счётчик через closure, debounce, throttle, приватные переменные модуля.' }
    ]
  },
  'TypeScript': {
    icon: '🔷',
    easy: [
      { q: 'Что такое interface в TypeScript? Для чего используется?', a: 'interface описывает форму объекта — какие поля и методы у него есть. Используется для типизации объектов, пропсов компонентов, ответов API. Можно расширять через extends.' },
      { q: 'Чем type отличается от interface?', a: 'interface — только для объектов и классов, можно расширять и мёржить. type — более гибкий: union types (string | number), intersection (&), алиасы примитивов. В большинстве случаев взаимозаменяемы, но type не мёржится автоматически.' },
      { q: 'Что такое generics (<T>)? Зачем нужны?', a: 'Generics — параметры типа. Позволяют писать функции и компоненты которые работают с разными типами без потери типизации. Пример: function identity<T>(arg: T): T { return arg } — работает и со string и с number сохраняя тип.' },
      { q: 'Как сделать необязательный параметр в TypeScript?', a: 'Добавить ? после имени параметра: function multiply(a: number, b: number, c?: number). Внутри функции проверять typeof c !== "undefined" перед использованием. Либо задать дефолтное значение: c = 1.' },
      { q: 'В чём разница между tuple и массивом в TypeScript?', a: 'Массив — произвольное количество элементов одного типа: string[]. Tuple — фиксированное количество элементов известных типов в определённом порядке: [string, number, boolean]. Пример: const point: [number, number] = [10, 20]. Порядок и длина строго соблюдаются.' }
    ],
    medium: [],
    hard: []
  },
  'Vue / Nuxt': {
    icon: '💚',
    easy: [
      { q: 'Чем Composition API отличается от Options API?', a: 'Options API: логика разбита по типу — data, methods, computed, watch отдельно. Composition API: вся логика одной фичи живёт рядом в setup(). Лучше переиспользование через composables, лучше TypeScript.' },
      { q: 'Что такое ref vs reactive?', a: 'ref — для примитивов и любых значений, доступ через .value. reactive — только для объектов, работает напрямую без .value. ref под капотом использует reactive.' },
      { q: 'Что такое v-model и как работает?', a: 'v-model — двустороннее связывание данных. На инпуте это сахар над :value="val" @input="val = $event.target.value". На компонентах: передаёт modelValue как проп и слушает emit("update:modelValue"). В Vue 3 можно иметь несколько v-model на одном компоненте.' },
      { q: 'Как во Vue сделать простую анимацию появления/исчезновения?', a: 'Обернуть элемент в <Transition name="fade"> и написать CSS: .fade-enter-active, .fade-leave-active { transition: opacity 0.3s } .fade-enter-from, .fade-leave-to { opacity: 0 }. Vue сам добавит и уберёт классы.' },
      { q: 'Зачем в v-for нужен :key? Что будет если не указать?', a: 'key помогает Vue отслеживать какой элемент списка какой — при обновлении данных Vue не перерисовывает весь список а точечно обновляет нужные узлы. Без key Vue переиспользует DOM-элементы по порядку что приводит к багам с состоянием (например инпуты теряют фокус, анимации не работают).' },
      { q: 'Чем v-if отличается от v-show?', a: 'v-if — полностью добавляет/удаляет элемент из DOM. v-show — элемент всегда в DOM, просто переключается display: none. v-if лучше когда элемент редко показывается. v-show лучше для частого переключения — нет накладных расходов на создание/удаление DOM.' },
      { q: 'Что такое ref у элемента в Vue? Как получить доступ к DOM-элементу?', a: 'template ref — прямой доступ к DOM-элементу или дочернему компоненту. Объявляешь const myEl = ref(null), вешаешь <div ref="myEl">, после onMounted myEl.value будет DOM-элементом. Используют для фокуса, размеров, интеграции со сторонними библиотеками (GSAP, Rive).' }
    ],
    medium: [
      { q: 'Что такое composables и когда бы использовал?', a: 'Функции с префиксом use* которые инкапсулируют реактивную логику через Composition API. Используешь когда нужно переиспользовать логику между компонентами: useScroll, useFetch, useTimer. Аналог хуков в React.' },
      { q: 'Зачем нужен onUnmounted?', a: 'Для очистки ресурсов при уничтожении компонента: clearInterval, removeEventListener, отписка от WebSocket, отмена запросов. Без этого утечки памяти.' },
      { q: 'Что такое модификаторы событий .stop и .once? Когда использовать?', a: '.stop — вызывает event.stopPropagation(), останавливает всплытие события вверх по DOM. .once — обработчик сработает только один раз, потом автоматически удалится. Пример: @click.stop, @click.once.' },
      { q: 'В чём разница SPA и SSR? Как это работает в Nuxt?', a: 'SPA: браузер загружает пустой HTML + JS, рендерит на клиенте. Плохо для SEO, долгий первый рендер. SSR: сервер отдаёт готовый HTML, потом JS оживляет страницу (hydration). Nuxt из коробки поддерживает SSR.' },
      { q: 'Что такое middleware в Nuxt и для чего используется?', a: 'Middleware — функции которые выполняются перед переходом на страницу. Используются для: проверки авторизации, редиректов, логирования. Бывают глобальные (в папке middleware/ с суффиксом .global) и локальные (указываются в definePageMeta).' }
    ],
    hard: [
      { q: 'Как реализовать stagger-анимацию появления элементов при загрузке в Vue?', a: '<Transition> для одного элемента. <TransitionGroup> для списков. GSAP timeline + stagger для сложных последовательностей. onMounted + nextTick чтобы DOM был готов перед запуском.' },
      { q: 'watchEffect vs watch — в чём разница и когда что выбирать?', a: 'watchEffect — автоматически отслеживает зависимости, запускается сразу. watch — явные зависимости, даёт old/new значения, ленивый по умолчанию. watch лучше когда нужна реакция на конкретное изменение с доступом к предыдущему значению.' }
    ]
  }
}

const difficultyLabel = { easy: 'Простой', medium: 'Средний', hard: 'Сложный' }
const difficulties = ['easy', 'medium', 'hard']

const activeCategory = ref(null)
const activeCard = ref(null)
const revealed = ref(false)

const categoryKeys = Object.keys(questions)

const currentQuestion = computed(() => {
  if (!activeCard.value || !activeCategory.value) return null
  return questions[activeCategory.value][activeCard.value.diff][activeCard.value.idx]
})

function openCard(diff, idx) {
  activeCard.value = { diff, idx }
  revealed.value = false
}

function closeCard() {
  activeCard.value = null
  revealed.value = false
}
</script>

<template>
  <div class="board">
    <!-- Header -->
    <div class="header">
      <div class="label">
        AmayaSoft
      </div>
      <h1>Техническое интервью</h1>
      <p>Выбери тему → выбери сложность → кликни на вопрос</p>
    </div>

    <!-- Category tabs -->
    <div class="tabs">
      <button
        v-for="cat in categoryKeys"
        :key="cat"
        class="tab"
        :class="{ active: activeCategory === cat }"
        @click="activeCategory = activeCategory === cat ? null : cat"
      >
        <span>{{ questions[cat].icon }}</span>
        {{ cat }}
      </button>
    </div>

    <!-- Questions grid -->
    <div
      v-if="activeCategory"
      class="grid"
    >
      <template
        v-for="diff in difficulties"
        :key="diff"
      >
        <div
          v-if="questions[activeCategory][diff] && questions[activeCategory][diff].length"
          class="diff-group"
        >
          <div class="diff-header">
            <div
              class="dot"
              :class="diff"
            />
            <span
              class="diff-label"
              :class="diff"
            >{{ difficultyLabel[diff] }}</span>
            <div class="divider" />
          </div>
          <div class="cards">
            <button
              v-for="(_, idx) in questions[activeCategory][diff]"
              :key="idx"
              class="card-btn"
              :class="diff"
              @click="openCard(diff, idx)"
            >
              {{ idx + 1 }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal -->
    <Transition name="fade">
      <div
        v-if="activeCard"
        class="overlay"
        @click="closeCard"
      >
        <div
          class="modal"
          :class="activeCard.diff"
          @click.stop
        >
          <div class="modal-badge">
            <span>{{ questions[activeCategory].icon }}</span>
            <span
              class="badge-text"
              :class="activeCard.diff"
            >
              {{ activeCategory }} · {{ difficultyLabel[activeCard.diff] }} · #{{ activeCard.idx + 1 }}
            </span>
          </div>

          <p class="question">
            {{ currentQuestion.q }}
          </p>

          <button
            v-if="!revealed"
            class="reveal-btn"
            @click="revealed = true"
          >
            Показать ответ
          </button>
          <div
            v-else
            class="answer"
          >
            {{ currentQuestion.a }}
          </div>

          <button
            class="close-btn"
            @click="closeCard"
          >
            ✕
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.board {
  min-height: 100vh;
  background: #0d0d0d;
  color: #e5e5e5;
  font-family: 'Inter', system-ui, sans-serif;
  padding: 40px 24px;
}

.header {
  text-align: center;
  margin-bottom: 44px;
}

.label {
  font-size: 11px;
  color: #444;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px;
}

.header p {
  color: #555;
  font-size: 14px;
  margin: 0;
}

.tabs {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 44px;
  flex-wrap: wrap;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 10px;
  border: 1px solid #222;
  background: #111;
  color: #555;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.15s;
}

.tab:hover { border-color: #333; color: #888; }
.tab.active { border-color: #555; background: #1a1a1a; color: #fff; }

.grid {
  max-width: 720px;
  margin: 0 auto;
}

.diff-group { margin-bottom: 32px; }

.diff-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot.easy { background: #22c55e; }
.dot.medium { background: #f59e0b; }
.dot.hard { background: #ef4444; }

.diff-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  white-space: nowrap;
}
.diff-label.easy { color: #4ade80; }
.diff-label.medium { color: #fbbf24; }
.diff-label.hard { color: #f87171; }

.divider {
  flex: 1;
  height: 1px;
  background: #1a1a1a;
}

.cards {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.card-btn {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-btn:hover { transform: scale(1.12); }

.card-btn.easy { background: #1a2e1a; border: 1px solid #2d5a2d; color: #4ade80; }
.card-btn.medium { background: #2a2310; border: 1px solid #5a4a00; color: #fbbf24; }
.card-btn.hard { background: #2a1010; border: 1px solid #5a1a1a; color: #f87171; }

/* Modal */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 100;
}

.modal {
  background: #111;
  border-radius: 20px;
  padding: 36px;
  max-width: 600px;
  width: 100%;
  position: relative;
}
.modal.easy { border: 1px solid #2d5a2d; }
.modal.medium { border: 1px solid #5a4a00; }
.modal.hard { border: 1px solid #5a1a1a; }

.modal-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.badge-text {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.badge-text.easy { color: #4ade80; }
.badge-text.medium { color: #fbbf24; }
.badge-text.hard { color: #f87171; }

.question {
  font-size: 19px;
  font-weight: 600;
  color: #fff;
  line-height: 1.55;
  margin: 0 0 28px;
}

.reveal-btn {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
  background: #1a1a1a;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s;
}
.reveal-btn:hover { border-color: #444; color: #999; }

.answer {
  background: #0d1a0d;
  border: 1px solid #1a3a1a;
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 14px;
  color: #86efac;
  line-height: 1.75;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #444;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 4px;
  transition: color 0.15s;
}
.close-btn:hover { color: #888; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
