# Шрифты

## Что есть в проекте

Все шрифты — **вариативные** (variable fonts, один файл покрывает диапазон осей вместо набора
статичных начертаний) и **self-hosted** (лежат в `app/assets/fonts/`, никаких запросов к
`fonts.googleapis.com`/`fonts.gstatic.com` с прода).

| Семейство | Оси (реальные, из `fvar`) | Файлы | Кириллица | Кто использует сегодня |
|---|---|---|---|---|
| **Nunito** | `wght` 200–1000 | `Nunito.ttf` (один файл, все скрипты) | ✅ | `l1`, `a/gift-card`, `a/instruction` |
| **Open Sans** | `wght` 300–800, `wdth` 75–100% | `OpenSans.TTF` (один файл, все скрипты) | ✅ | `l1`, `a/gift-card`, `a/instruction` |
| **Noto Sans** | `wght` 100–900, `wdth` 62.5–100% | `noto-sans-{latin,latin-ext,cyrillic,cyrillic-ext}.woff2` (4 файла, разбит по `unicode-range`) | ✅ | пока никто |
| **Google Sans Flex** | `wght` 1–1000, `wdth` 25–151%, `opsz` 6–144, `slnt` −10–0° | `google-sans-flex-{latin,latin-ext}.woff2` (2 файла, разбит по `unicode-range`) | ❌ **нет** | пока никто |

⚠️ **Google Sans Flex не поддерживает кириллицу.** Это не «наша» урезка — Google не выпустил для
него кириллический набор вообще (только `latin`/`latin-ext` + несколько экзотических скриптов вроде
`cherokee`/`syriac`, которые мы не качали, они не нужны). Если ставите его в стек для страницы с
русским текстом — обязательно первым идёт он, а следующим в `font-family` должен стоять
кириллик-совместимый шрифт (Noto Sans или Nunito), иначе русские буквы молча уедут на системный
шрифт браузера.

Также важно: сам `Google Sans` как публичный шрифт не существует — это было закрытое внутреннее
начертание Google. В 2025 Google выпустил его открытую версию под лицензией OFL на Google Fonts под
именем **Google Sans Flex** — именно она здесь подключена.

## Как это устроено: по файлу на семейство, импорт только там, где реально используется

Раньше все `@font-face` жили в одном глобальном `app/assets/css/fonts.css`, подключённом через
`nuxt.config.ts` → `css: [...]` — то есть декларации грузились на **каждой** странице приложения,
независимо от того, использует она эти шрифты или нет.

Сейчас у каждого семейства — свой файл в `app/assets/css/fonts/`:

```
app/assets/css/fonts/
├── nunito.css
├── open-sans.css
├── noto-sans.css
└── google-sans-flex.css
```

Ничего из этого больше не подключено глобально — `main.css` знает только про Tailwind и `@nuxt/ui`.
Каждая страница/компонент, которому нужен конкретный шрифт, импортирует его файл явно, прямо в
`<script setup>`, как обычный побочный CSS-импорт:

```ts
<script setup lang="ts">
import '~/assets/css/fonts/nunito.css'
import '~/assets/css/fonts/open-sans.css'
// ...остальные импорты страницы
</script>
```

Так сделано в `l1/index.vue`, `a/gift-card/[appKey]/index.vue` и
`a/instruction/how-to-activate-gift-code/[appKey]/index.vue`.

**Почему это реально ограничивает загрузку, а не просто "для порядка":** Nuxt/Vite код-сплитят
страницы по роутам — CSS-импорт внутри конкретного `.vue`-файла попадает в JS/CSS-чанк именно этого
роута. Значит, `@font-face`-декларации Nunito/Open Sans физически не существуют в бандле, скажем,
`l2` — их там просто нет в module graph, а не "есть, но не используются".

Дополнительный уровень экономии — сам `@font-face` с `unicode-range` (это относится к Noto Sans и
Google Sans Flex, у Nunito/Open Sans он не нужен, см. ниже почему): даже если на странице
подключены оба этих семейства, браузер всё равно скачивает только тот файл, чей `unicode-range`
пересекается с реально отображаемыми символами — кириллица не запросит latin-only файл и наоборот.
Это стандартное поведение браузеров для `@font-face`: сама декларация ничего не грузит, файл
запрашивается только когда на странице есть текст, которому реально нужен этот шрифт и эти
кодовые точки.

### Почему Nunito/Open Sans — один файл на семейство, а Noto Sans/Google Sans Flex — разбиты

Nunito и Open Sans пришли в проект как цельные `.ttf`-файлы (видимо, через кнопку "Download family"
на fonts.google.com — она отдаёт несрезанный вариативный файл сразу под все поддерживаемые
скрипты). У Noto Sans и Google Sans Flex файлы получены по-другому — через `fonts.googleapis.com/css2`
API с явным диапазоном осей в query (см. "Как добавить новый шрифт" ниже), а этот API всегда отдаёт
готовый список `@font-face` с разбивкой по `unicode-range`, как на самом fonts.google.com. Разбивку
оставил как есть — это честная экономия трафика, а не искусственное усложнение.

Технически можно точно так же разрезать Nunito/Open Sans на woff2+unicode-range и ужать их
суммарный вес (~270KB + ~520KB сейчас, TTF без сжатия) — это отдельная необязательная работа, не
делал её без запроса, чтобы не трогать уже одобренные файлы.

## Как использовать шрифт на странице

1. В `<script setup>` страницы/компонента добавить импорт нужного файла (или нескольких, если
   комбинируете латиницу с кириллицей из другого семейства):
   ```ts
   import '~/assets/css/fonts/noto-sans.css'
   ```
2. Указать `font-family` в CSS страницы как обычно, с адекватным фолбэком:
   ```css
   .title {
     font-family: 'Noto Sans', Arial, sans-serif;
   }
   ```
3. Если нужен конкретный вырез вариативной оси — обычные CSS-свойства работают напрямую, браузер
   сам интерполирует внутри объявленного в `@font-face` диапазона:
   ```css
   font-weight: 650;           /* Nunito: любое значение 200–1000 */
   font-stretch: 90%;          /* Open Sans: любое значение 75–100% */
   font-style: oblique 4deg;   /* Google Sans Flex: любое значение 0–10deg */
   ```
   Для нестандартных осей Google Sans Flex (`GRAD`, `ROND` — grade и roundness, у них нет
   соответствующего CSS-свойства) — только через `font-variation-settings`:
   ```css
   font-variation-settings: 'GRAD' 50, 'ROND' 100;
   ```
   Эти оси есть в скачанных файлах (не выпилены), но пока нигде не используются.
4. **Не забыть импорт** — если добавить `font-family: 'Google Sans Flex'` в CSS, но не подключить
   `import '~/assets/css/fonts/google-sans-flex.css'`, ошибки не будет: браузер молча откатится на
   следующий шрифт в стеке. Это самая частая причина "почему шрифт не применился".

## Как добавить новый шрифт (или новый вырез существующего)

Через `fonts.googleapis.com/css2` — это официальный CDN Google Fonts, тот же самый, которым
пользуется сам сайт fonts.google.com.

1. Узнать реальные оси семейства (диапазоны в query должны совпадать с тем, что шрифт поддерживает
   на самом деле — иначе Google либо клэмпит, либо игнорирует лишнее):
   ```bash
   curl -s "https://fonts.google.com/metadata/fonts" | python3 -c "
   import json, sys
   data = json.loads(sys.stdin.read())
   for fam in data['familyMetadataList']:
       if fam['family'] == 'Имя Семейства':
           print(fam['subsets'], fam['axes'])
   "
   ```
2. Запросить CSS с осями в query (порядок тегов — по ASCII, заглавные раньше строчных; диапазон —
   `min..max`), с "настоящим" User-Agent, иначе отдаст старый `.ttf`/`.woff` вместо `.woff2`:
   ```bash
   curl -s -A "Mozilla/5.0 ... Chrome/124.0 Safari/537.36" \
     "https://fonts.googleapis.com/css2?family=Имя+Семейства:wght@100..900&display=swap"
   ```
3. Оставить в ответе только нужные `@font-face` по `/* subset */`-комментарию — для этого проекта
   это как минимум `latin` + `latin-ext` (английский/узбекская латиница) и `cyrillic` +
   `cyrillic-ext`, если шрифт вообще их поддерживает и текст на странице будет русским/узбекским.
   Остальные скрипты (`vietnamese`, `devanagari`, `greek`, экзотика) не качать — не нужны.
4. Скачать файлы в `app/assets/fonts/` с понятными именами (`{семейство}-{subset}.woff2`),
   `@font-face`-блоки — в новый `app/assets/css/fonts/{семейство}.css` (по образцу существующих
   файлов), путь к файлу — через алиас `@/assets/fonts/...`.
5. (Опционально, но полезно) проверить оси реально попавшие в файл, если сомневаетесь в query:
   ```bash
   pip3 install --user fonttools
   python3 -c "
   from fontTools.ttLib import TTFont
   f = TTFont('app/assets/fonts/имя-файла.woff2')
   for axis in f['fvar'].axes:
       print(axis.axisTag, axis.minValue, axis.defaultValue, axis.maxValue)
   "
   ```
6. Подключить `import '~/assets/css/fonts/{семейство}.css'` только в тех `<script setup>`, где
   шрифт реально используется — **не** добавлять его обратно в `main.css` или `nuxt.config.ts` →
   `css: [...]`, иначе теряется весь смысл разбивки по страницам (см. раздел выше).
7. Перед тем как использовать шрифт — проверить его лицензию (`isOpenSource` в ответе `metadata`
   выше) и поддержку нужных скриптов (`subsets`) — не все шрифты на Google Fonts бесплатны для
   коммерческого использования без ограничений, и не все поддерживают кириллицу (см. кейс с Google
   Sans Flex).

## Проверка вручную (curl)

Быстро убедиться, что шрифт подключён именно там, где нужно, и нигде больше — без браузера
(общий рецепт локального хоста — см. [localization.md](./localization.md#проверка-вручную-curl)):

```bash
# страница реально импортирует нужные font-css в свой module graph (dev-режим)
curl -s -H "Host: l1.amayasoft.uz" \
  "http://localhost:3000/_nuxt/pages/(amayasoft.uz)/(subdomains)/l1/index.vue" \
  | grep "assets/css/fonts/"

# сам font-css файл отдаётся
curl -sI -H "Host: l1.amayasoft.uz" \
  "http://localhost:3000/_nuxt/assets/css/fonts/nunito.css" | head -1

# в глобальном main.css НЕТ ни одной @font-face — если есть, значит кто-то
# по ошибке вернул шрифт в глобальный импорт
curl -s -H "Host: l1.amayasoft.uz" "http://localhost:3000/_nuxt/assets/css/main.css" \
  | grep -c "@font-face"   # должно быть 0

# страница, которая НЕ использует шрифты, не должна их импортировать вообще
curl -s -H "Host: l1.amayasoft.uz" \
  "http://localhost:3000/_nuxt/pages/(amayasoft.uz)/(subdomains)/l2/index.vue" \
  | grep "assets/css/fonts/"   # должно быть пусто
```
