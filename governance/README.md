# Web-Kit Governance (Center of Excellence)

How we use `@platform/web-kit` *well* across the estate — design-time guidance for engineers and AI
agents. This CoE was structured differently from its four siblings for most of its life (no
`governance/` folder, no `CAPABILITY.md`) — real usage guidance existed, but only in
[`ADOPTION.md`](../ADOPTION.md), which covers *mechanics* (how to plug in) rather than *design
principles* (how to extend the kit well, what belongs here vs. in an app). This folder closes that
gap, added 2026-07-06 during an estate-wide CoE-layer review, not because anything was broken —
adoption has been clean across 3 pilots — but because the standing-design-guidance pillar every
other CoE carries was genuinely thin here.

## Principles

1. **The kit is a library API, not a convention app authors have to remember.** Parameterize via a
   typed context (`SiteConfigProvider`/`useSiteConfig`) rather than expecting an app to define a
   magic file or global the kit silently reaches for. If a new configurable surface is needed,
   extend `SiteConfig`'s shape — don't invent a second parameterization mechanism.
2. **One kit source, many importers — never copy, never fork.** Edit here; every consumer sees the
   change on its next build via the path-mapped alias (see [`ADOPTION.md`](../ADOPTION.md)). A
   product-local fork of a kit component (instead of a `className` override or a `SiteConfig`
   extension) is the exact drift this capability exists to prevent.
3. **Prefer composition and `className` escape hatches over new components.** Before adding a new
   primitive, check whether an existing one (`Card`, `ComponentCard`, `Table`) already covers the
   shape with a `className` override or a prop addition. Two deliberately similar-but-distinct
   primitives are acceptable when they serve genuinely different call sites — see `patterns.md`'s
   `Card` vs `ComponentCard` note — but that's a judgment call made once per shape, not a default.
4. **Theme through CSS variables, not hard-coded colors.** Brand color is `--color-brand-*`,
   overridden per-app in the app's own `brand.css`, loaded after the kit's `index.css`. A component
   that hard-codes a hex value instead of a Tailwind theme token breaks per-app theming silently.
5. **Dark mode is automatic, not opt-in per component.** Every primitive ships both light and
   `dark:` Tailwind variants in the same className string. A component shipped without a `dark:`
   variant is incomplete, not "dark mode as a later pass."
6. **Forward DOM props through on interactive/structural primitives**, not a narrow prop whitelist —
   `data-testid` (BDD hooks), `onClick`, `aria-*`, etc. all need to reach the underlying element. See
   `Card`'s `ComponentPropsWithoutRef<"div">` spread for the pattern.
7. **A pitfall this kit's own adoption mechanism can cause is this CoE's responsibility to
   document**, even though the failure surfaces in a consuming app, not in this repo — see the
   `react-router` dedupe pitfall in `patterns.md`.

## Contents

- [patterns.md](patterns.md) — component-design conventions, the dedupe pitfall, anti-patterns
- [`../ADOPTION.md`](../ADOPTION.md) — the mechanics: how a new app plugs into the kit
