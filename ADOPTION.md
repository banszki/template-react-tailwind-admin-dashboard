# @platform/web-kit — adoption guide

*The estate's shared React + Tailwind UI kit. Status: v0.2 (imported library) · Dated: 2026-06-30.*

This repo is the **kit package `@platform/web-kit`** — the single source of the estate's shared UI
(layout shell, dark-mode theme, component kit, icons). Apps **import** it; the kit source exists in
**exactly one place**. No copies, no sync. This is the same model as the LLM library `llm-pool`:
one source, many importers, path-resolved now, published to a registry later.

> **This replaces the old copy-and-sync `propagate.mjs`** (removed). We do not copy kit source into
> projects anymore — copying + a mirror-delete sync was a workaround for not having a real package.

## Two parts, treated differently

| Part | What | Where | Treatment |
|------|------|-------|-----------|
| **Kit** (`@platform/web-kit`) | layout/chrome, theme, components, icons | `src/` of **this** repo (only) | **imported** by apps; never copied |
| **App scaffold** | routing, pages, brand, config | each app's `web/src/` | **owned** by the app; created once, then yours |

## The API an app uses

```tsx
// import the kit by name (resolves to the one source — see setup below)
import { AppLayout, ScrollToTop, NotFound, PageMeta, Badge, Modal, Table, useModal,
         ThemeProvider, SiteConfigProvider, GridIcon, type SiteConfig } from "@platform/web-kit";

// 1) the kit is parameterized by a SiteConfig the app PROVIDES (real library API — not a magic file)
export const siteConfig: SiteConfig = {
  brand: { name: "My App", mark: "◈" },
  navItems: [{ icon: <GridIcon />, name: "Dashboard", path: "/" }],
};

// 2) wrap the app
<ThemeProvider><SiteConfigProvider value={siteConfig}><AppWrapper><App/></AppWrapper></SiteConfigProvider></ThemeProvider>
```

Brand colour is overridden in the app's `src/brand.css` (CSS variables `--color-brand-*`), loaded
after the kit styles. Dark mode is automatic.

## Setting up a consuming app (the mechanics)

The kit resolves to the sibling repo's `src` via a path-mapped dependency (the npm-world equivalent
of `llm-pool`'s path-import). Four small pieces:

1. **`vite.config.ts`** — alias + React dedupe:
   ```ts
   resolve: {
     alias: { "@platform/web-kit": resolve(import.meta.dirname, "../../template-react-tailwind-admin-dashboard/src") },
     dedupe: ["react", "react-dom"],
   }
   ```
2. **`tsconfig.app.json`** — path map (incl. unifying React types across the app + the aliased kit):
   ```json
   "baseUrl": ".",
   "paths": {
     "@platform/web-kit":   ["../../template-react-tailwind-admin-dashboard/src"],
     "@platform/web-kit/*": ["../../template-react-tailwind-admin-dashboard/src/*"],
     "react":              ["./node_modules/@types/react"],
     "react-dom":          ["./node_modules/@types/react-dom"],
     "react/jsx-runtime":  ["./node_modules/@types/react/jsx-runtime"]
   }
   ```
3. **`src/index.css`** — pull in the kit's Tailwind theme/base/classes and scan both the kit + this app:
   ```css
   @import "../../../template-react-tailwind-admin-dashboard/src/index.css";
   @source "../../../template-react-tailwind-admin-dashboard/src";
   @source "./";
   ```
   (then `import "./brand.css"` after `index.css` in `main.tsx`.)
4. **`package.json`** — the app needs the kit's runtime deps it bundles (react, react-dom, react-router,
   apexcharts, react-apexcharts, clsx, tailwind-merge, react-helmet-async, flatpickr) plus `@types/node`.

That's it — `import { … } from "@platform/web-kit"` now resolves to the one kit source.

## Updating the kit

Edit the kit **here**. Every app sees the change on its next build — because they all resolve to this
one source. No re-sync, no file surgery, no drift. (Pin/version via `package.json` `version`; a real
version range applies once published — see below.)

## Graduation (the committed next ceremony)

Publish `@platform/web-kit` to **`devops-nexus`** as a built, versioned package (compiled JS + `.d.ts`
+ a prebuilt CSS). Apps then swap the path alias for a normal version dependency (`"@platform/web-kit":
"^1.0.0"`) — the import statements don't change. Same graduation `llm-pool` has. The path-aliased
source is the sanctioned interim until then.

## Provenance

Forked from **[TailAdmin React Free](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard)**
(MIT — see [`LICENSE.md`](LICENSE.md)), cleaned to a foundation and refactored into a context-parameterized
importable kit.
