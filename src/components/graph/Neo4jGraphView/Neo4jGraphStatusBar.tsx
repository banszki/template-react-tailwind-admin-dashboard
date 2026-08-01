import type { Neo4jGraphLayout } from "./types";

type Neo4jGraphStatusBarProps = {
  nodeCount: number;
  relCount: number;
  totalNodeCount: number;
  totalRelCount: number;
  currentLayout: Neo4jGraphLayout;
  currentZoom: number | null;
  selectedNodeId: string | null;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
};

const LAYOUT_SHORT: Record<Neo4jGraphLayout, string> = {
  hierarchical: "hierarchical",
  d3Force: "d3Force",
  forceDirected: "forceDirected",
  circular: "circular",
  grid: "grid",
  free: "free",
};

/**
 * The footer status bar. Always visible (no opt-out — at-a-glance
 * metadata is part of the mature UX). Shows:
 *   - visible / total node + edge counts
 *   - current layout (short name)
 *   - current zoom (if known)
 *   - selected-node indicator (when something is selected)
 *   - fullscreen toggle (re-exposed here for fullscreen mode; otherwise
 *     redundant with the header)
 *
 * The visual is restrained: small monospaced metadata in a single
 * row, fits in ~32px of height, doesn't compete with the canvas.
 */
export function Neo4jGraphStatusBar({
  nodeCount,
  relCount,
  totalNodeCount,
  totalRelCount,
  currentLayout,
  currentZoom,
  selectedNodeId,
  isFullscreen,
  onToggleFullscreen,
}: Neo4jGraphStatusBarProps) {
  const isFiltered = nodeCount !== totalNodeCount || relCount !== totalRelCount;
  const nodeLabel = isFiltered
    ? `${nodeCount} / ${totalNodeCount} node${totalNodeCount === 1 ? "" : "s"}`
    : `${nodeCount} node${nodeCount === 1 ? "" : "s"}`;
  const relLabel = isFiltered
    ? `${relCount} / ${totalRelCount} edge${totalRelCount === 1 ? "" : "s"}`
    : `${relCount} edge${relCount === 1 ? "" : "s"}`;

  return (
    <div
      className={
        "flex items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-4 py-1.5 " +
        "font-mono text-[11px] text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400"
      }
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
        <span data-testid="nvl-status-nodes">
          <strong className="font-semibold text-gray-700 dark:text-gray-200">{nodeLabel}</strong>
        </span>
        <span aria-hidden="true" className="text-gray-300 dark:text-gray-700">·</span>
        <span data-testid="nvl-status-rels">
          <strong className="font-semibold text-gray-700 dark:text-gray-200">{relLabel}</strong>
        </span>
        <span aria-hidden="true" className="text-gray-300 dark:text-gray-700">·</span>
        <span data-testid="nvl-status-layout" title={`Layout: ${LAYOUT_SHORT[currentLayout]}`}>
          {LAYOUT_SHORT[currentLayout]}
        </span>
        {currentZoom !== null && (
          <>
            <span aria-hidden="true" className="text-gray-300 dark:text-gray-700">·</span>
            <span data-testid="nvl-status-zoom" title="Current zoom level">
              {Math.round(currentZoom * 100)}%
            </span>
          </>
        )}
        {selectedNodeId && (
          <>
            <span aria-hidden="true" className="text-gray-300 dark:text-gray-700">·</span>
            <span
              data-testid="nvl-status-selected"
              className="max-w-[12rem] truncate"
              title={`Selected: ${selectedNodeId}`}
            >
              ⌖ <span className="text-brand-600 dark:text-brand-300">{selectedNodeId}</span>
            </span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
        {isFullscreen && (
          <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
            fullscreen
          </span>
        )}
        <span className="hidden sm:inline" title="Keyboard: F to fit, + / - to zoom, 0 to reset, Esc to deselect">
          F fit · + − zoom · 0 reset · Esc deselect
        </span>
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? "⤡" : "⤢"}
        </button>
      </div>
    </div>
  );
}
