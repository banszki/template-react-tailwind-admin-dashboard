import type { Neo4jGraphLayout } from "./types";

/** All 6 NVL layouts. Used as the default for the `layouts` prop. */
export const DEFAULT_LAYOUTS: Neo4jGraphLayout[] = [
  "d3Force",
  "hierarchical",
  "forceDirected",
  "circular",
  "grid",
  "free",
];

/** Zoom step for the zoom in / out buttons (and the keyboard shortcuts). */
export const ZOOM_STEP = 0.15;
