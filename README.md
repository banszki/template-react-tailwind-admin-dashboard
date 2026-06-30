# Web Basis — shared React + Tailwind admin foundation

The estate's **single web-UI basis**: layout shell, dark-mode theme, and a component kit (forms,
tables, charts, UI primitives) that every product front-end builds on — so no project re-derives a
UI from zero. Consolidated 2026-06-29 to stop the per-project UI divergence, mirroring how
[`strategy-testing-excellence`](../strategy-testing-excellence) centralised testing.

> **How to use it → [`ADOPTION.md`](ADOPTION.md)** (the kit + starter model, the adoption steps, and
> the package-promotion trigger).

**Stack:** React 19 · TypeScript · Vite 6 · Tailwind v4 · React Router 7 — per
[SMHQ roads/frontend.md](../strategy-software-manufacturing-headquarters/roads/frontend.md).

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production build
```

## Layout

- **Kit (shared, don't fork per product):** `src/layout/`, `src/context/`, `src/components/`,
  `src/hooks/`, `src/icons/`, `src/index.css`.
- **Starter (per product):** `src/App.tsx`, `src/pages/`, `public/`.

## Provenance & license

Forked from **[TailAdmin React Free](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard)**
and cleaned down to a reusable foundation (demo dashboards, calendar, maps, carousels, auth and gallery
pages removed; ~half the JS bundle dropped). Released under the **MIT License** — original TailAdmin
copyright retained in [`LICENSE.md`](LICENSE.md).
