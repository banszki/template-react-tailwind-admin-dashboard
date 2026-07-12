# Capability — Web UI kit

Triad status, consumers and graduation triggers. Pattern:
[SMHQ capability triad](../strategy-software-manufacturing-headquarters/capabilities/CATALOG.md).

> This repo predates the `strategy-*`-prefixed CoE convention (it's a fork of an external template,
> `TailAdmin React Free`, not a greenfield SMHQ repo) and has no `strategy-` prefix — the estate's
> `registry.py` heuristic (CoE ⇔ has `CAPABILITY.md` OR a `strategy-` prefix) would not auto-classify
> it as a CoE without this file. Added 2026-07-06 alongside `governance/` to close that gap; before
> this, classification relied on a manual override in `app-platform-portfolio-HQ/seed.py`.

## Modes

| Mode | Where now | Target home | Maturity |
|------|-----------|-------------|----------|
| **Governance** | [`governance/`](governance/) | here | active |
| **Library** (`@platform/web-kit`) | [`src/`](src/) | dedicated versioned package + `devops-nexus` | active (imported by 3 pilots; copy-and-sync retired) |
| **Service** | — | n/a | not applicable — a static UI kit has no runtime service face |

## Consumers (drives the promotion rule)

- `app-platform-testing-HQ` — teal brand, imports via Vite/tsconfig alias.
- `app-ai-home-manager` — green brand; first user of `othersItems` (secondary nav), 2026-07-02.
- `app-evergreen-ai` — emerald brand cockpit; origin of the `Card`/`StatCard` extraction and the
  `react-router` dedupe pitfall (see `governance/patterns.md`).
- `app-platform-portfolio-HQ` — brand cockpit for the portfolio-management HQ itself; missing from
  this list until 2026-07-08 (a real drift — the repo has imported the kit since its own Slice 1,
  the consumer count here just never caught up). Origin of the gateway npm/npx resolution gap entry
  (see `governance/patterns.md`).

**4 consumers → Rule of Three met (since the 3rd).** Nexus package split is the committed next ceremony (see
`ADOPTION.md`'s "Graduation" section) — not yet executed, same pending state as every other active
capability in the estate.

## Graduation triggers

- **Library → own repo + Nexus:** met (3 consumers). Path-aliased until the split is scheduled.
- **Service:** not applicable — nothing to graduate.

## Stable contract

- The kit's public surface is `src/index.ts` — layout/chrome (`AppLayout`), providers/hooks
  (`ThemeProvider`, `SiteConfigProvider`, `useModal`, `useGoBack`), UI primitives (`Button`, `Badge`,
  `Alert`, `Avatar`, `Modal`, `Dropdown`, `Table`, `Card`, `StatCard`), the icon set, and `NotFound`.
- Parameterized by `SiteConfig` (brand, nav items, optional secondary nav) — the app provides it via
  `<SiteConfigProvider value={...}>`, not a magic project file.
- Full adoption mechanics: [`ADOPTION.md`](ADOPTION.md).
