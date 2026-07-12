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
  // optional secondary nav — rendered under an "Others" heading, visually separated from navItems.
  // Use it for settings/account/admin-style pages you don't want competing with the app's daily
  // pages for primary-nav space (first real use: app-ai-home-manager's "Privacy & data" page,
  // 2026-07-02 — the other two pilots declare `othersItems: []`/omit it entirely).
  othersItems: [{ icon: <LockIcon />, name: "Privacy & data", path: "/privacy" }],
};

// 2) wrap the app
<ThemeProvider><SiteConfigProvider value={siteConfig}><AppWrapper><App/></AppWrapper></SiteConfigProvider></ThemeProvider>
```

Brand colour is overridden in the app's `src/brand.css` (CSS variables `--color-brand-*`), loaded
after the kit styles. Dark mode is automatic.

## Setting up a consuming app (the mechanics)

The kit resolves to the sibling repo's `src` via a path-mapped dependency (the npm-world equivalent
of `llm-pool`'s path-import). Six small pieces:

1. **`vite.config.ts`** — alias + dedupe:
   ```ts
   resolve: {
     alias: { "@platform/web-kit": resolve(import.meta.dirname, "../../template-react-tailwind-admin-dashboard/src") },
     dedupe: ["react", "react-dom", "react-router"],
   }
   ```
   **`react-router` must be in the dedupe list too**, not just `react`/`react-dom` — the kit's
   `AppLayout` (`<Outlet/>`) and your app's own `<Router/>`/`<Routes/>` both import `react-router`;
   since the kit is aliased straight to this repo's `src/` (not an npm package), an un-deduped
   build can resolve two separate module instances, so the kit's `<Outlet/>` and your `<Router/>`
   don't share context. Hit twice independently (app-evergreen-ai, then app-ai-home-manager) — both
   times as a **silently blank page in the production build, no console error at all** (not the
   usual "useLocation outside Router" throw), which makes it easy to burn a long debugging session
   on. If your app renders blank with zero console output, check this first.
2. **`src/svg.d.ts`** — the icon barrel imports every icon as `"./name.svg?react"` (vite-plugin-svgr's
   named-export mode, configured alongside the kit's own alias in step 1). TypeScript needs an
   ambient module declaration to typecheck that import shape — write it with a **type-only** import,
   not `import React = require("react")`:
   ```ts
   declare module "*.svg?react" {
     import type { FC, SVGProps } from "react";
     export const ReactComponent: FC<SVGProps<SVGSVGElement>>;
     const src: string;
     export default src;
   }
   ```
   The `require()`-style version trips `@typescript-eslint/no-require-imports` — a real, twice-
   shipped bug (this kit's own `src/svg.d.ts` had it until 2026-07-08; so did
   `app-platform-portfolio-HQ`'s copy), see `governance/patterns.md`'s svg.d.ts entry. Each app owns
   its own copy of this file (it's app-scaffold, not kit surface — TypeScript's ambient-file
   inclusion is scoped to your own `tsconfig.app.json`'s `include`, so you can't inherit the kit's).
3. **`tsconfig.app.json`** — path map (incl. unifying React types across the app + the aliased kit):
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
4. **`src/index.css`** — pull in the kit's Tailwind theme/base/classes and scan both the kit + this app:
   ```css
   @import "../../../template-react-tailwind-admin-dashboard/src/index.css";
   @source "../../../template-react-tailwind-admin-dashboard/src";
   @source "./";
   ```
   (then `import "./brand.css"` after `index.css` in `main.tsx`.)
5. **`package.json`** — the app needs the kit's runtime deps it bundles (react, react-dom, react-router,
   apexcharts, react-apexcharts, clsx, tailwind-merge, react-helmet-async, flatpickr) plus `@types/node`.
6. **`Makefile`** — a real compile+lint check. Not kit-wiring like 1-5, but do it anyway: `npm`/`npx`
   are allowlisted through the org's meta-gateway v2 (`workspace.run_command`) but don't actually
   resolve through it on Windows — see `governance/patterns.md`'s gateway npm/npx resolution gap
   entry. `docker` does resolve, so run the check in a throwaway container against your already-
   installed `node_modules`:
   ```makefile
   verify-web:
   	docker run --rm -v C:\Code:/code -w /code/<your-app>/web node:20-alpine node node_modules/typescript/bin/tsc -b --noEmit
   	docker run --rm -v C:\Code:/code -w /code/<your-app>/web node:20-alpine node node_modules/eslint/bin/eslint.js src
   ```
   Run `make verify-web` after every frontend change before calling it done — this is what actually
   catches type drift and lint errors when working through an AI agent on this gateway; manual
   review alone has already let real bugs through (see `governance/patterns.md`).

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
