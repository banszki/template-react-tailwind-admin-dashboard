# This repo is `@platform/web-kit`'s source — not a CoE

*Corrected 2026-07-15.*

**Governance for this kit lives in
[`strategy-web-excellence`](../strategy-web-excellence/CAPABILITY.md)**, not here. This file used
to be a byte-identical copy of that repo's `CAPABILITY.md` (down to a `Governance | governance/`
row pointing at a `governance/` folder that has **never existed in this repo**) — a real drift,
corrected now rather than perpetuated.

## What this repo actually is

A fork of **TailAdmin React Free**, kept as a standing **external-development proxy**: `src/` here
holds the estate's shared `@platform/web-kit` UI kit (layout, theme, components, icons), and this
repo stays a distinct fork specifically so upstream TailAdmin changes can be pulled and ported in
over time — director's call, 2026-07-15. It is the **Library** face of the web-kit capability triad;
the **Governance** face (patterns, the adoption guide, consumer list, graduation triggers) is
authored and maintained in `strategy-web-excellence`, the CoE.

Read [`strategy-web-excellence/CAPABILITY.md`](../strategy-web-excellence/CAPABILITY.md) for the
full triad status, and [`strategy-web-excellence/ADOPTION.md`](../strategy-web-excellence/ADOPTION.md)
for how a project consumes this kit — both canonical there, not duplicated here, to stop the two
repos drifting against each other the way this file just had to be caught doing.
