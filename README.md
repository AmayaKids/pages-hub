# Pages Hub

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Мультидоменное/мультиязычное Nuxt-приложение Amaya: одно приложение обслуживает несколько
доменов/поддоменов (`pages.amayakids.com`, `amayakids.com`, `l1/l2/test.amayasoft.uz`), выбирая нужную
страницу и набор языков в зависимости от `Host` запроса.

📖 **Проектная документация:** см. [`docs/`](./docs/README.md) — там подробно описана логика
доменов/поддоменов и настройка локализации per-host.

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Renovate integration

Install [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository and you are good to go.
