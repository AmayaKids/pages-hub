// Ambient `import.meta.dev` typing for the `shared/` tsconfig project — Nuxt's
// own declaration for this lives in `nuxt/app`'s ambient types, which aren't
// included here since `shared/` code must stay framework-agnostic. The value
// itself is still replaced at build time by both Vite (client) and Nitro
// (server), so this only affects type-checking, not runtime behaviour.
declare global {
  interface ImportMeta {
    readonly dev: boolean
  }
}

export {}
