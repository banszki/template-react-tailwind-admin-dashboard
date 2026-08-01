import type { CSSProperties, ReactNode } from "react";
import type NVL from "@neo4j-nvl/base";
import type { Node, Relationship } from "@neo4j-nvl/base";

// Re-export NVL's Node/Relationship types so callers don't need to install
// @neo4j-nvl/base separately.
export type { Node, Relationship } from "@neo4j-nvl/base";

/** Layouts supported by NVL. Mirrors NVL's `Layout` union type. */
export type Neo4jGraphLayout =
  | "hierarchical"
  | "d3Force"
  | "forceDirected"
  | "circular"
  | "grid"
  | "free";

/** Options for the hierarchical layout. */
export type HierarchicalOptions = {
  direction?: "up" | "down" | "left" | "right";
  packing?: "bin" | "stack";
};

/**
 * Props for the Neo4jGraphView v2 — the standardized, feature-rich graph
 * view for the platform. See ./Neo4jGraphView.tsx for the full docstring.
 *
 * The component is opinionated about UX (header + toolbar + status bar +
 * overlays) but lenient about content (any Node[] + Relationship[] shape
 * via NVL's contract; no proprietary wrapper shape required).
 */
export type Neo4jGraphViewProps = {
  // ===== Data ==========================================================
  /** The nodes to render (NVL's `Node[]` shape). */
  nodes: Node[];
  /** The relationships to render (NVL's `Relationship[]` shape). */
  rels: Relationship[];

  // ===== Header / chrome ===============================================
  /** Optional title shown in the header. */
  title?: ReactNode;
  /** Optional subtitle shown in the header, under the title. */
  subtitle?: ReactNode;
  /** Hide the header bar entirely. Default: false. */
  hideHeader?: boolean;
  /**
   * Custom actions rendered on the right side of the header, before the
   * built-in toolbar (zoom, layout, fullscreen, export). Use this to add
   * project-specific buttons (e.g. "Add node", "Edit view").
   */
  headerActions?: ReactNode;

  // ===== Display / layout ==============================================
  /** The initial layout to use. Default: "d3Force". */
  layout?: Neo4jGraphLayout;
  /** Options for the hierarchical layout (no-op for other layouts). */
  hierarchicalOptions?: HierarchicalOptions;
  /**
   * Layouts available in the runtime layout switcher. Default: all
   * 6 NVL layouts. Pass a subset to limit the choices.
   */
  layouts?: Neo4jGraphLayout[];
  /** Initial zoom level. Default: 1.0. */
  initialZoom?: number;
  /** The viewport height in pixels. Default: 460. */
  height?: number;
  /** Whether the viewport fills the parent's width (true) or has a max width. Default: true. */
  fullWidth?: boolean;

  // ===== Toolbar toggles ===============================================
  /** Show the zoom controls (+/−/fit/reset). Default: true. */
  showZoomControls?: boolean;
  /** Show the layout switcher. Default: true. */
  showLayoutSwitcher?: boolean;
  /** Show the fullscreen toggle. Default: true. */
  showFullscreenToggle?: boolean;
  /** Show the export-to-PNG button. Default: true. */
  showExport?: boolean;
  /** Show the search bar. Default: false. */
  showSearch?: boolean;
  /** Placeholder for the search input. Default: "Search nodes…". */
  searchPlaceholder?: string;
  /**
   * Custom matcher for the search bar. Receives the node and the current
   * query (lowercased); return true to KEEP the node, false to hide it.
   * Default: matches the node's `caption` (or `id` if no caption) case-
   * insensitively. Rels are hidden if either endpoint is filtered out.
   */
  searchMatcher?: (node: Node, query: string) => boolean;

  // ===== NVL behavior toggles ==========================================
  /** Whether the user can drag nodes. Default: false. */
  allowDrag?: boolean;
  /** Whether to disable NVL's segment analytics. Default: true. */
  disableTelemetry?: boolean;
  /** Whether to fit the graph to the viewport on initial load + on data change. Default: true. */
  autoFit?: boolean;
  /** Force the canvas renderer (the default NVL renderer auto-selects; canvas is the most reliable for text rendering). */
  forceCanvasRenderer?: boolean;

  // ===== Selection / events ============================================
  /** ID of the externally-selected node. When set, this node is highlighted
   *  (its non-selected peers are dimmed). Pass null/undefined to clear. */
  selectedNodeId?: string | null;
  /** Called when a node is clicked. */
  onNodeClick?: (node: Node) => void;
  /** Called when a node is double-clicked. */
  onNodeDoubleClick?: (node: Node) => void;
  /** Called when the canvas (background) is clicked. */
  onCanvasClick?: () => void;
  /** Called when the user changes the layout via the switcher. */
  onLayoutChange?: (layout: Neo4jGraphLayout) => void;
  /** Called when NVL's layout settles. */
  onLayoutDone?: () => void;

  // ===== States ========================================================
  /** Show the loading overlay. Default: false (the component auto-shows
   *  it for the first 250ms after data changes to mask the layout settle). */
  loading?: boolean;
  /** Show the error overlay. Default: null. */
  error?: Error | string | null;
  /** Message shown when nodes is empty. Default: "No nodes to display." */
  emptyMessage?: ReactNode;
  /** Optional helper for the empty state. */
  emptyHint?: ReactNode;

  // ===== Visual styling ================================================
  /** Optional CSS class on the root wrapper. */
  className?: string;
  /** Optional inline style on the root wrapper. */
  style?: CSSProperties;
  /** A data-testid for BDD / e2e tests. */
  "data-testid"?: string;
};

/**
 * The ref handle the parent can use to drive the graph imperatively.
 * Exposes the subset of NVL's API we expect consumers to need plus
 * a few higher-level helpers (zoomIn, zoomOut, saveAsPng).
 */
export type Neo4jGraphViewHandle = {
  // NVL passthroughs (the methods most consumers actually need)
  fit?: (nodeIds?: string[]) => void;
  setZoom?: (zoom: number) => void;
  getZoom?: () => number;
  resetZoom?: () => void;
  deselectAll?: () => void;
  getSelectedNodes?: () => Node[];
  getNodes?: () => Node[];
  setLayout?: (layout: Neo4jGraphLayout) => void;

  // High-level helpers
  zoomIn?: () => void;
  zoomOut?: () => void;
  saveAsPng?: (filename?: string) => void;
  toggleFullscreen?: () => void;
};

/** Internal: ref to the underlying NVL instance. */
export type NvlRefType = Partial<NVL>;
