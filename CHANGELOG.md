# Changelog

## 0.3.1 (2026-09-04)
- Add `value?: string` to `Select` (unblock PHQ B-017 migration). The kit's `Select` now supports both controlled (`value` + `onChange`) and uncontrolled (`defaultValue` + internal state) modes, mirroring the standard React controlled-input pattern. When `value` is provided, the parent owns the state and the component renders exactly what they pass; when `value` is `undefined`, the component falls back to internal state seeded from `defaultValue`. `onChange` is always invoked with the new value. This is an additive optional prop — existing uncontrolled callers (the kit's `Dropdown` story, any 0.3.0 consumer) work unchanged. The 7 controlled-mode call sites in `app-platform-portfolio-HQ` (B-017) that were blocked on `Property 'value' does not exist on type 'IntrinsicAttributes & SelectProps'` can now adopt `0.3.1` without modifying their call shapes.

## 0.3.0 (2026-09-04)
- Export `Select` from the public surface (B-014). Dark-mode fix upstreamed from PHQ's local Select — the kit's `Select` now sets `bg-white text-gray-800 dark:bg-gray-900 dark:text-white/90` on every `<option>`, eliminating the white-on-white popup bug Chrome/Windows exhibits when only the `<select>` has dark styling.
- Add `hint?: ReactNode` to `StatCard` (B-016). The hint renders under the label with `text-xs text-gray-500 dark:text-gray-400 mt-1`, matching the PHQ B-015 workaround's styling. Closes the structural fix for B-015; consumers can now use `hint` directly instead of the parent `<div>` + `<p>` workaround.

## 0.2.0 (2026-07-17)
- Initial devops-nexus Verdaccio publication (ADR-0010).
