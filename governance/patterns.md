# Web-Kit Patterns

## Component design

- **Two deliberately similar primitives can both be right** — `Card` vs `ComponentCard`: `Card` is
  a bare bordered/rounded surface (no forced header/body split) for dashboard tiles and chart cards
  that render their own compact heading; `ComponentCard` adds a title/description header + a
  body-separator border for content that wants that structure. `Card` was extracted from
  `app-evergreen-ai`, where the exact same className string had been copy-pasted into 15+ files —
  the extraction removed the duplication without forcing every call site into `ComponentCard`'s
  heavier shape. When two components look similar, ask *which call sites actually want the extra
  structure* before merging them into one with optional props — an optional-prop explosion is often
  worse than two small, honestly-different components.
- **Forward the full prop set on structural/interactive primitives** (`ComponentPropsWithoutRef<"div">`
  or the element-appropriate equivalent), not a hand-picked whitelist. `data-testid` is the concrete
  reason: `bdd-kit`'s UI steps and Playwright locators depend on it reaching the real DOM node, and a
  narrow prop interface silently breaks that for any new attribute a consumer needs later.
- **Size/variant maps, not conditional className chains.** `Button`'s `sizeClasses`/`variantClasses`
  object-keyed-by-prop pattern (see `components/ui/button/Button.tsx`) stays readable as variants
  grow; a chain of ternaries in the className string does not. Follow this shape for new primitives
  with more than one or two variants.
- **Icons are components, not raw SVG strings scattered per app.** Add a new icon to `src/icons/`
  and export it from the icon barrel, once — never inline an `<svg>` in a consuming app for
  something the kit could hold centrally.

## The `react-router` dedupe pitfall (real, hit twice)

Because the kit is aliased straight to this repo's `src/` (a path mapping, not an installed npm
package), an app that dedupes `react`/`react-dom` in its Vite config but forgets `react-router` can
end up with **two separate `react-router` module instances** — the kit's `AppLayout` (`<Outlet/>`)
resolves one instance, the app's own `<Router/>`/`<Routes/>` resolves another, and they don't share
routing context. The failure mode is a **silently blank page in the production build with zero
console output** — not the usual "useLocation outside Router" throw a single-instance mismatch would
normally produce, which is exactly what makes it expensive to debug. Hit independently in
`app-evergreen-ai` and `app-ai-home-manager`. Fix: always include `react-router` in the Vite
`resolve.dedupe` list alongside `react`/`react-dom` — see `ADOPTION.md`'s setup steps. **If a
consuming app renders blank with no console error at all, check this first**, before assuming a
component bug.

## The gateway `npm`/`npx` resolution gap (real, verification silently skipped for months)

Every app built on this kit is meant to get a real `tsc -b --noEmit` + `eslint` check before a
change ships. On the org's meta-gateway v2 (`workspace.run_command`), `npm` and `npx` are
allowlisted by name — but on Windows they don't actually resolve through it (`where npm` finds
`C:\Program Files\nodejs\npm`; `run_command("npm", ...)` still reports "not found"), almost
certainly a `.cmd` extension-resolution gap in how the tool shells out. The failure is silent in
the worst way: it doesn't error the *task*, it just means a frontend change can ship on manual
review alone, no compiler ever run — first noticed in `app-platform-portfolio-HQ`, 2026-07-08,
after real type-drift bugs had already slipped through review undetected. Fix: run `tsc`/`eslint`
inside a throwaway `node:20-alpine` container instead, mounting the real `C:\Code` tree and
reusing whatever `node_modules` the consumer already has installed — no `npm install`/image build
step needed:
```
docker run --rm -v C:\Code:/code -w /code/<app>/web node:20-alpine node node_modules/typescript/bin/tsc -b --noEmit
docker run --rm -v C:\Code:/code -w /code/<app>/web node:20-alpine node node_modules/eslint/bin/eslint.js src
```
`docker`/`docker-compose` ARE allowlisted and actually resolve through the gateway. See
`ADOPTION.md`'s adoption mechanics step 5 for the copy-paste `Makefile` target every consuming app
should add. **If you're an AI agent working through this gateway and `npm`/`npx` report "not
found," don't chase it as a real allowlist rejection — use the docker recipe instead.**

## The `svg.d.ts` require()-import pitfall (real, shipped twice)

The icon barrel needs an ambient `declare module "*.svg?react"` so TypeScript can typecheck the
svgr-generated named export — but the version that got copy-pasted forward (originally from the
upstream TailAdmin fork) used the legacy `import React = require("react")` syntax, which trips
`@typescript-eslint/no-require-imports`. This kit shipped it in **two places at once** —
`src/svg.d.ts` (wrong) alongside `src/vite-env.d.ts` (right, `import type { FC, SVGProps } from
"react"`) — and `app-platform-portfolio-HQ` had copied the wrong one into its own app scaffold.
Found 2026-07-08 the first time this kit's own `npm run lint` actually ran through a real compiler
(see the gateway npm/npx entry above — nothing had verified this in a while). Fixed here by
deleting the redundant `src/svg.d.ts` (kept `vite-env.d.ts`, the correct declaration, as the sole
source). **Every consuming app still needs its own correct copy** — TypeScript's ambient-file
inclusion is scoped to each app's own `tsconfig.app.json` `include`, so fixing it here does not
reach already-scaffolded apps. `app-platform-testing-HQ` is known to still have the broken version
as of 2026-07-08 (found, not yet fixed — out of scope for the session that found it). See
`ADOPTION.md` step 2 for the correct snippet every app should carry.

## The hidden native date-input pitfall (real, `DatePicker` existed but was never exported)

This kit's base stylesheet (`src/index.css`) intentionally strips the native OS calendar icon and
spin buttons off every `input[type="date"]`/`input[type="time"]` in *any* consuming app (`::-webkit-
calendar-picker-indicator { display: none }` etc.) — by design, because the kit ships a themed
`flatpickr`-backed `DatePicker` component (`src/components/form/date-picker.tsx`) meant to replace
raw date inputs everywhere. The pitfall: `DatePicker` was never added to `src/index.ts`'s public
export list, so a consumer reaching for a date field had no visible way to discover it, fell back to
a plain `<input type="date">`, and — because the icon-hiding CSS applies globally regardless of
which app added the input — got a field with no calendar affordance at all, indistinguishable from a
plain text box even though it was functionally a real date input. Found 2026-07-08 in
`app-platform-portfolio-HQ`'s Timeline custom-range picker. Fixed by exporting `DatePicker` from
`src/index.ts` (it already existed, fully built and themed — a surface gap, not a missing feature).
**If a date/time input looks like plain text with no icon, you're hitting the global icon-hiding
rule — use the kit's `DatePicker` (`mode: "single" | "range"`, flatpickr-backed) instead of a raw
`<input type="date">`.**

## Anti-patterns

- Forking or copy-pasting kit source into a product (`propagate.mjs`'s copy-and-sync model was
  retired for exactly this reason — see `ADOPTION.md`). Import it; if the kit is missing something,
  add it here.
- Hard-coded hex colors instead of the `--color-brand-*` theme tokens — breaks per-app theming.
- A new primitive shipped without a `dark:` variant.
- A narrow, hand-picked prop interface on a structural component instead of forwarding the element's
  full native prop set — breaks BDD `data-testid` hooks and anything else a consumer needs later.
- Reaching for a magic project-level file/global instead of extending `SiteConfig` when the kit
  needs new per-app configuration.

## Status & open questions

- **Component library:** RESOLVED in practice — see SMHQ's
  [`ADR-0004`](../../strategy-software-manufacturing-headquarters/decisions/0004-frontend-react-ts.md).
  This kit (a Tailwind-based TailAdmin fork) is the answer, not a from-scratch headless-primitives
  build.
- **Nexus split** (publish `@platform/web-kit` as a versioned package): the committed next ceremony,
  not yet executed — see `ADOPTION.md`'s "Graduation" section. Same pending state as every other
  active capability in the estate (`llm-pool`, `neo4j-data-access`, `bdd-kit`).
- **Accessibility conventions** are not yet written down as an explicit standard here (a real gap,
  named rather than silently left implicit) — pull this into a real principle once a consumer's
  need or an accessibility audit surfaces a concrete requirement, per the estate's pull-not-push
  discipline.
