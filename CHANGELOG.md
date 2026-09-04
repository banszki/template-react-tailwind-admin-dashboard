# Changelog

## 0.3.0 (2026-09-04)
- Export `Select` from the public surface (B-014). Dark-mode fix upstreamed from PHQ's local Select — the kit's `Select` now sets `bg-white text-gray-800 dark:bg-gray-900 dark:text-white/90` on every `<option>`, eliminating the white-on-white popup bug Chrome/Windows exhibits when only the `<select>` has dark styling.
- Add `hint?: ReactNode` to `StatCard` (B-016). The hint renders under the label with `text-xs text-gray-500 dark:text-gray-400 mt-1`, matching the PHQ B-015 workaround's styling. Closes the structural fix for B-015; consumers can now use `hint` directly instead of the parent `<div>` + `<p>` workaround.

## 0.2.0 (2026-07-17)
- Initial devops-nexus Verdaccio publication (ADR-0010).
