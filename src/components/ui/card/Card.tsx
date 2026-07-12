import { ComponentPropsWithoutRef } from "react";

type CardProps = ComponentPropsWithoutRef<"div">; // forwards data-testid, onClick, etc. as-is

// A bordered, rounded panel — the base surface for dashboard tiles, chart cards, and stat blocks.
// Deliberately lighter than ComponentCard (no forced title/desc header + body separator): most
// dashboard widgets (charts, stat tiles) render their own compact <h3>/<p> and don't want
// ComponentCard's extra padding/border-top split. Extracted from app-evergreen-ai, where this
// exact className string had been copy-pasted into 15+ files across its dashboard/detail pages —
// all of them also relying on passing through `data-testid` for BDD, hence forwarding all div
// props rather than a narrow whitelist.
const Card: React.FC<CardProps> = ({ children, className = "", ...rest }) => (
  <div
    className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export default Card;
