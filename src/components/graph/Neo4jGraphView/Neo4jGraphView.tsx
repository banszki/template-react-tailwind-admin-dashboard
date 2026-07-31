import { forwardRef, useEffect, useRef, useImperativeHandle, type CSSProperties } from "react";
import { InteractiveNvlWrapper } from "@neo4j-nvl/react";
import type NVL from "@neo4j-nvl/base";
import type { Node, Relationship } from "@neo4j-nvl/base";

/**
 * Neo4jGraphView — the standardized graph view for the platform.
 *
 * The page is responsible for transforming its data into the NVL
 * `Node[]` + `Relationship[]` shape (the kit doesn't dictate a data
 * format). This component then renders the graph with consistent
 * styling (small captions, fit-on-load, muted edges) and exposes a
 * ref handle for advanced use (`fit()`, `setZoom()`, etc.).
 *
 * The component is the standardized "graph card" — it ships:
 *  - A consistent rounded-2xl border + padding wrapper
 *  - Small (canvas-rendered) captions so dense graphs stay readable
 *  - Muted edges (slate-300 by default) so nodes dominate
 *  - A `data-testid` so BDD tests can find the canvas
 *  - A `height` prop (default 460) so callers don't have to set
 *    inline styles
 *  - The NVL fit-on-load dance: NVL's `fit()` is called once the
 *    layout settles (via the `onLayoutDone` callback) so the graph
 *    is fully visible on first paint
 *  - A ref handle so callers can call `fit()`, `setZoom()`,
 *    `getSelectedNodes()`, etc. — anything NVL exposes
 *
 * The data shape: pass NVL's `Node[]` and `Relationship[]` directly.
 * We do NOT dictate a data format (Neo4j, plain, etc.) — that's the
 * caller's job. The QTC uses a Neo4j-native shape and transforms it
 * in the page; another project might use a different shape and do
 * the same.
 *
 * Layouts supported (per NVL):
 *  - "hierarchical"   — DAGs with a clear prereq direction
 *  - "d3Force"        — general-purpose force-directed (the KBP)
 *  - "forceDirected"  — NVL's own force-directed (uses cytoscape fallback)
 *  - "circular"       — nodes on a circle
 *  - "grid"           — nodes on a grid
 *
 * Bundling: @neo4j-nvl/react is a peerDependency (optional) so
 * consumers who don't use this view don't pay the bundle cost.
 * Vite tree-shakes the import automatically when the component
 * isn't used.
 */

// Re-export NVL's Node/Relationship types so callers don't need to
// install @neo4j-nvl/base separately.
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

export type Neo4jGraphViewProps = {
  /** The nodes to render (NVL's `Node[]` shape). */
  nodes: Node[];
  /** The relationships to render (NVL's `Relationship[]` shape). */
  rels: Relationship[];
  /** The layout to use. Default: "d3Force". */
  layout?: Neo4jGraphLayout;
  /** Options for the hierarchical layout (no-op for other layouts). */
  hierarchicalOptions?: HierarchicalOptions;
  /** Initial zoom level. Default: 0.85 (graphs often need a small
   * zoom-out to fit the viewport on first paint). */
  initialZoom?: number;
  /** The viewport height. Default: 460. */
  height?: number;
  /** A data-testid for BDD / e2e tests. */
  "data-testid"?: string;
  /** Optional CSS class on the wrapper. */
  className?: string;
  /** Optional inline style on the wrapper. */
  style?: CSSProperties;
  /** Whether the user can drag nodes. Default: false (read-only). */
  allowDrag?: boolean;
  /** Whether to disable NVL's segment analytics. Default: true. */
  disableTelemetry?: boolean;
  /** Called when a node is clicked. */
  onNodeClick?: (node: Node) => void;
  /** Called when the canvas is clicked. */
  onCanvasClick?: () => void;
  /** Called when NVL's layout settles. Useful for triggering
   * additional side effects after the graph is stable. */
  onLayoutDone?: () => void;
};

/**
 * The ref handle the parent can use to drive the graph imperatively.
 * Exposes the subset of NVL's API we expect consumers to need.
 */
export type Neo4jGraphViewHandle = {
  fit?: () => void;
  setZoom?: (zoom: number) => void;
  getZoom?: () => number;
  resetZoom?: () => void;
  deselectAll?: () => void;
  getSelectedNodes?: () => Node[];
  getNodes?: () => Node[];
};

/**
 * The standard graph view. See module docstring for usage.
 *
 * Example (QTC's KB Explorer):
 *   <Neo4jGraphView
 *     nodes={nvlNodes}
 *     rels={nvlRels}
 *     layout="d3Force"
 *     initialZoom={0.5}
 *     height={520}
 *     data-testid="kb-graph-canvas"
 *     onNodeClick={(node) => setSelectedId(node.id)}
 *   />
 */
export const Neo4jGraphView = forwardRef<Neo4jGraphViewHandle, Neo4jGraphViewProps>(
  function Neo4jGraphView(props, ref) {
    const {
      nodes,
      rels,
      layout = "d3Force",
      hierarchicalOptions,
      initialZoom = 0.85,
      height = 460,
      className = "",
      style,
      allowDrag = false,
      disableTelemetry = true,
      onNodeClick,
      onCanvasClick,
      onLayoutDone,
    } = props;
    const testId = props["data-testid"];

    const nvlRef = useRef<Partial<NVL> | null>(null);
    // Guards fit-on-load so a user's manual pan/zoom isn't reset on
    // every re-render. The guard clears when nodes/rels change so
    // re-filters trigger a re-fit.
    const hasFit = useRef(false);
    const lastFitKey = useRef<string>("");

    useImperativeHandle(ref, () => ({
      fit: nvlRef.current?.fit,
      setZoom: nvlRef.current?.setZoom,
      getZoom: nvlRef.current?.getZoom,
      resetZoom: nvlRef.current?.resetZoom,
      deselectAll: nvlRef.current?.deselectAll,
      getSelectedNodes: nvlRef.current?.getSelectedNodes,
      getNodes: nvlRef.current?.getNodes,
    }));

    // Reset the fit-guard when the graph data changes. NVL's
    // onLayoutDone callback then triggers a fresh fit. This means
    // a re-filter (e.g., a domain filter) re-centers the graph.
    useEffect(() => {
      const key = `${nodes.length}:${rels.length}`;
      if (key !== lastFitKey.current) {
        hasFit.current = false;
        lastFitKey.current = key;
      }
    }, [nodes, rels]);

    // Belt + suspenders: a 1.5s fallback for d3Force (the layout
    // worker can take a moment to settle). Hierarchical settles
    // immediately, so the 1.5s is harmless for that case.
    useEffect(() => {
      if (!nodes || nodes.length === 0) return;
      const t = setTimeout(() => {
        if (!hasFit.current && nvlRef.current?.fit) {
          nvlRef.current.fit();
          hasFit.current = true;
        }
      }, 1500);
      return () => clearTimeout(t);
    }, [nodes, rels]);

    return (
      <div
        data-testid={testId}
        className={
          "overflow-hidden rounded-2xl border border-gray-200 bg-white " +
          "dark:border-gray-800 dark:bg-white/[0.03] " +
          className
        }
        style={{ height, ...style }}
      >
        <InteractiveNvlWrapper
          ref={nvlRef}
          nodes={nodes}
          rels={rels}
          nvlOptions={{
            layout,
            ...(layout === "hierarchical" && hierarchicalOptions
              ? { hierarchicalLayoutOptions: hierarchicalOptions }
              : {}),
            initialZoom,
            allowDrag,
            disableTelemetry,
          }}
          nvlCallbacks={{
            onLayoutDone: () => {
              if (!hasFit.current && nvlRef.current?.fit) {
                nvlRef.current.fit();
                hasFit.current = true;
              }
              onLayoutDone?.();
            },
          }}
          mouseEventCallbacks={{
            onNodeClick: onNodeClick
              ? (node: Node) => onNodeClick(node)
              : () => undefined,
            onCanvasClick: onCanvasClick
              ? () => onCanvasClick()
              : () => undefined,
          }}
        />
      </div>
    );
  },
);
