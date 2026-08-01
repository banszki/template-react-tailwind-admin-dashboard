import { useState, useRef, useEffect, type ReactNode } from "react";
import type { Neo4jGraphLayout } from "./types";

type Neo4jGraphHeaderProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  headerActions?: ReactNode;
  currentLayout: Neo4jGraphLayout;
  availableLayouts: Neo4jGraphLayout[];
  onLayoutChange: (next: Neo4jGraphLayout) => void;
  showZoomControls: boolean;
  showLayoutSwitcher: boolean;
  showFullscreenToggle: boolean;
  showExport: boolean;
  showSearch: boolean;
  searchPlaceholder: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isFullscreen: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReset: () => void;
  onExport: () => void;
  onToggleFullscreen: () => void;
};

const LAYOUT_LABELS: Record<Neo4jGraphLayout, string> = {
  hierarchical: "Hierarchical",
  d3Force: "Force (d3)",
  forceDirected: "Force (NVL)",
  circular: "Circular",
  grid: "Grid",
  free: "Free",
};

/**
 * The header bar above the canvas. Contains:
 *   - Title + subtitle (left)
 *   - Custom header actions slot (right of subtitle, before toolbar)
 *   - The toolbar: layout switcher, zoom buttons, fullscreen, export,
 *     search input (when enabled).
 *
 * All toolbar items are opt-out via the `show*` flags. The visual is
 * restrained: small icon buttons with tooltips, the search input expands
 * to fill available space.
 */
export function Neo4jGraphHeader(props: Neo4jGraphHeaderProps) {
  const {
    title,
    subtitle,
    headerActions,
    currentLayout,
    availableLayouts,
    onLayoutChange,
    showZoomControls,
    showLayoutSwitcher,
    showFullscreenToggle,
    showExport,
    showSearch,
    searchPlaceholder,
    searchQuery,
    onSearchChange,
    isFullscreen,
    onZoomIn,
    onZoomOut,
    onFit,
    onReset,
    onExport,
    onToggleFullscreen,
  } = props;

  const hasTitle = title !== undefined && title !== null;
  const hasSubtitle = subtitle !== undefined && subtitle !== null;
  const hasHeader = hasTitle || hasSubtitle || headerActions;

  if (!hasHeader && !showZoomControls && !showLayoutSwitcher && !showFullscreenToggle && !showExport && !showSearch) {
    return null;
  }

  return (
    <div
      className={
        "flex flex-wrap items-center gap-2 border-b border-gray-200 bg-white px-4 py-2.5 " +
        "dark:border-gray-800 dark:bg-gray-900"
      }
    >
      {/* Title + subtitle + custom actions (left side, takes available space) */}
      {(hasHeader || showSearch) && (
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {hasHeader && (
            <div className="min-w-0">
              {hasTitle && (
                <div className="truncate text-sm font-semibold text-gray-800 dark:text-white/90">
                  {title}
                </div>
              )}
              {hasSubtitle && (
                <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {subtitle}
                </div>
              )}
            </div>
          )}
          {headerActions}
          {showSearch && (
            <div className="relative ml-auto max-w-xs flex-1 sm:max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:placeholder-gray-500"
              />
              <svg
                className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Toolbar (right side) */}
      <div className="flex shrink-0 items-center gap-1">
        {showLayoutSwitcher && availableLayouts.length > 1 && (
          <LayoutSwitcher
            current={currentLayout}
            available={availableLayouts}
            onChange={onLayoutChange}
          />
        )}

        {showZoomControls && (
          <>
            <ToolbarButton label="Zoom in (+)" onClick={onZoomIn}>
              <PlusIcon />
            </ToolbarButton>
            <ToolbarButton label="Zoom out (−)" onClick={onZoomOut}>
              <MinusIcon />
            </ToolbarButton>
            <ToolbarButton label="Fit (F)" onClick={onFit}>
              <FitIcon />
            </ToolbarButton>
            <ToolbarButton label="Reset (0)" onClick={onReset}>
              <ResetIcon />
            </ToolbarButton>
          </>
        )}

        {showExport && (
          <ToolbarButton label="Export to PNG" onClick={onExport}>
            <DownloadIcon />
          </ToolbarButton>
        )}

        {showFullscreenToggle && (
          <ToolbarButton
            label={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen"}
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
          </ToolbarButton>
        )}
      </div>
    </div>
  );
}

// ---- Layout switcher (custom dropdown) ----------------------------------

type LayoutSwitcherProps = {
  current: Neo4jGraphLayout;
  available: Neo4jGraphLayout[];
  onChange: (next: Neo4jGraphLayout) => void;
};

function LayoutSwitcher({ current, available, onChange }: LayoutSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Change layout"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <LayoutIcon />
        <span>{LAYOUT_LABELS[current] ?? current}</span>
        <ChevronDownIcon className={open ? "rotate-180 transition" : "transition"} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-theme-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {available.map((layout) => {
            const isCurrent = layout === current;
            return (
              <li key={layout}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isCurrent}
                  onClick={() => {
                    onChange(layout);
                    setOpen(false);
                  }}
                  className={
                    "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-xs transition " +
                    (isCurrent
                      ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800")
                  }
                >
                  <span>{LAYOUT_LABELS[layout] ?? layout}</span>
                  {isCurrent && <CheckIcon />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ---- Toolbar button (icon + tooltip) ----------------------------------

type ToolbarButtonProps = {
  label: string;
  onClick: () => void;
  children: ReactNode;
};

function ToolbarButton({ label, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      {children}
    </button>
  );
}

// ---- Icons (inline SVG, no extra dep) ---------------------------------

const ICON_PROPS = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

function PlusIcon() {
  return (
    <svg {...ICON_PROPS}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function MinusIcon() {
  return (
    <svg {...ICON_PROPS}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function FitIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 9V5a1 1 0 0 1 1-1h4" />
      <path d="M15 4h4a1 1 0 0 1 1 1v4" />
      <path d="M20 15v4a1 1 0 0 1-1 1h-4" />
      <path d="M9 20H5a1 1 0 0 1-1-1v-4" />
    </svg>
  );
}
function ResetIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <polyline points="3 3 3 8 8 8" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function FullscreenIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3 8V5a2 2 0 0 1 2-2h3" />
      <path d="M16 3h3a2 2 0 0 1 2 2v3" />
      <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
      <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
    </svg>
  );
}
function ExitFullscreenIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M8 3v3a2 2 0 0 1-2 2H3" />
      <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
      <path d="M3 16h3a2 2 0 0 1 2 2v3" />
      <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}
function LayoutIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg {...ICON_PROPS} width={12} height={12}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg {...ICON_PROPS} width={12} height={12} className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
