# Director's Charter — `template-react-tailwind-admin-dashboard`

> **Adopted:** 2026-08-30 (Phase 6, gap #1; the `coe_charter_init` 1-call scaffold; via the foundry-wide adoption sweep that started with the strategy-data-layer-neo4j-excellence director-morning cron)
>
> **Cross-references:** the cross-project **role definition** is at `strategy-ai-agentic-excellence/roles/director/ROLE.md` (the context-agnostic 16-section role; same for every Foundry project). The **operational handbook** is at `strategy-ai-agentic-excellence/skills/agent_director/SKILL.md` (the install path; the 5 platform features). The 4-layer cross-reference hygiene is enforced by the gateway's `coe_role_standing_audit` tool.
>
> **The founding charter:** for the **full universal discipline** (the 6 responsibilities, the 2 operational modes, the 4 standing disciplines, the 3 success metrics, the 3-tier decision authority, the 5 standing tools, the 6 anti-patterns, the 5 standing relationships, the 4-stage session, the 10-step quarterly review, the 4 standing rules, the 3 universal patterns + 1 meta-observation, the quick-reference card), see the canonical charter at `app-meta-mcp-gateway/DIRECTOR_CHARTER.md` Part 1 §1-§15. That part is the same for every Foundry project; the Template React Tailwind Admin Dashboard inherits it.
>
> **What this charter is:** Part 2 only — the `template-react-tailwind-admin-dashboard`'s project-specific stance (the 7 sections §16-§22, in the gateway charter's pattern). Adapting the gateway charter to the Template React Tailwind Admin Dashboard is the 7-step recipe per the gateway's Appendix A.

---

## 16. The Template React Tailwind Admin Dashboard's Structural Purpose

`template-react-tailwind-admin-dashboard` is the **The Template React Tailwind Admin Dashboard for the Foundry.** for the Foundry. It
is the canonical way to (primary function TBD). Success metric:
the Template React Tailwind Admin Dashboard is in operational use + has 3+ adopters.

## 17. The Template React Tailwind Admin Dashboard's Scope (the line)

**In scope:**
- The Template React Tailwind Admin Dashboard's primary surface (the tool / service / CoE)
- The standing crons (the daily / weekly rhythm)
- The 5 governance artifacts (DR / W / BACKLOG / JOURNAL / WORK-CONTEXT)

**Out of scope:**
- Other Foundry projects' specific decisions
- The cross-project signal (the portfolio CoE owns this)

**The line:** the Template React Tailwind Admin Dashboard is a library project. It owns its surface + its crons; it does not own the cross-project signal.

## 18. The Template React Tailwind Admin Dashboard's 3 P-Metric Adoption Levers

The gateway's 3 P-metric adoption levers apply (per the
universal discipline §6), with the following
Template React Tailwind Admin Dashboard-specific translations:

- **P1 (Vision) → "the Template React Tailwind Admin Dashboard achieves its structural purpose"**: the current state is
  1 (the project's own surface). Each increment is a bounded W-item; the
  per-increment complexity is bounded; per-feature W-items.
- **P2 (Strategy) → "3+ Foundry projects consume the Template React Tailwind Admin Dashboard's surface"**: the current consumers
  are 1-2 (the project's own consumers). Each new consumer is an integration
  test; the the Template React Tailwind Admin Dashboard's integration tests is the canonical check.
- **P3 (Scope) → "the Template React Tailwind Admin Dashboard's onboarding path is canonical"**: the 1. lift the Template React Tailwind Admin Dashboard's pattern from the CoE
2. run the integration test
3. file a DR with the cross-project signal.

## 19. The Template React Tailwind Admin Dashboard's Decision-Authority Adaptations

The 3-tier decision authority (T0/T1/T2 per the universal
discipline §7) is **partially delegated** to the gateway:

- **T0 (the Template React Tailwind Admin Dashboard can decide):** the Template React Tailwind Admin Dashboard's internal implementation, the project's own crons, the Template React Tailwind Admin Dashboard's test surface.
- **T1 (the gateway decides, the Template React Tailwind Admin Dashboard executes):**
  any change to the gateway's `roles` server entry, the CoE quintet, or the cross-project signal.
- **T2 (the director decides, both implement):** the Template React Tailwind Admin Dashboard's standing rules, the 4-stage session discipline, the 5 anti-patterns, the public surface.

## 20. The Template React Tailwind Admin Dashboard's Anti-Pattern Adaptations

The 6 universal anti-patterns apply. The 2
Template React Tailwind Admin Dashboard-specific additions:

- **A7 (auto-federation bypass):** a consumer that imports the Template React Tailwind Admin Dashboard without going through the gateway. The Template React Tailwind Admin Dashboard is the platform; the gateway decides which projects federate..
- **A8 (hidden global state):** the Template React Tailwind Admin Dashboard's cron or queue becomes a global state no one audits. The weekly audit cron is the standing check..

## 21. The Template React Tailwind Admin Dashboard's Standing Relationships

The 5 standing relationships (per the universal discipline
§10):

- **Director → Gateway:** the gateway federates the Template React Tailwind Admin Dashboard; the director can call `restart_server('<alias>')` for hot-reload
- **Director → Platform Engineer:** the platform engineer's 3-5 standing crons (daily insights-tick, weekly audit, anomaly-sweep) include the Template React Tailwind Admin Dashboard's health
- **Director → Product Owner:** the product owner owns the Template React Tailwind Admin Dashboard's adoption levers; the PO's intake is the Template React Tailwind Admin Dashboard's new-consumer signal
- **Director → Architect:** the architect's pattern authorship includes the Template React Tailwind Admin Dashboard's patterns as foundry-wide patterns (W-0049 catalog entries)
- **Director → On-Demand Reviewer:** the reviewer is the escalation path for T2 decisions (new surface, consumer onboarding, capacity changes)

## 22. The Template React Tailwind Admin Dashboard's Operational Surface

The Template React Tailwind Admin Dashboard's operational surface is the
**3-5 standing crons** plus the
**3-4 working files** in this repo:

- **Standing crons:** 3-5 crons (the daily rhythm + the weekly audit + the monthly review); see `.schedules.yaml`
- **Working files:** `WORK.yaml` (W-item queue) + `WORK-CONTEXT.md` (today's input) + `PROJECT.yaml` (7-field classification) + `BACKLOG.yaml` (queue)
- **The role system:** the Template React Tailwind Admin Dashboard's director is
  the CoE director, instantiated for this project. The
  standing rhythm is the 4-stage session (open / orient /
  act / close), bootstrapped via `coe_load_role` at the
  open stage.
