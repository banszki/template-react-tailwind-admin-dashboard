import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { InteractiveNvlWrapper } from "@neo4j-nvl/react";
import { Neo4jGraphHeader } from "./Neo4jGraphHeader";
import { Neo4jGraphStatusBar } from "./Neo4jGraphStatusBar";
import { Neo4jGraphOverlays } from "./Neo4jGraphOverlays";
import {
  type Neo4jGraphViewHandle,
  type Neo4jGraphViewProps,
  type NvlRefType,
} from "./types";
import { DEFAULT_LAYOUTS, ZOOM_STEP } from "./constants";
import { defaultSearchMatcher } from "./search";

/**
 * Neo4jGraphView v2 — the standardized, feature-rich graph view for the
 * platform.
 *
 * **What it ships (the "ready-to-go" UX):**
 * - A header bar with title, subtitle, and a toolbar of action chips
 *   (zoom +/−, fit, reset, layout switcher, fullscreen, export to PNG,
 *   optional search). The toolbar is opt-out per feature.
 * - A footer status bar with live node + edge counts and the active
 *   layout. Useful at a glance for any graph.
 * - A fullscreen mode (CSS-based overlay, no portal) that expands the
 *   canvas to fill the viewport with a single click. Press Esc or click
 *   the close button to exit.
 * - Loading + empty + error overlays. Loading auto-shows for the first
 *   250ms after data changes to mask the layout-settle flicker.
 * - Keyboard shortcuts: F = fit, +/− = zoom, Esc = deselect, 0 = reset.
 * - Smooth fit transitions via NVL's `fit(zoomOptions)` API.
 *
 * **What the caller controls (the "feature-rich" part):**
 * - All NVL data (nodes + rels with NVL's native shape — no proprietary
 *   wrapper; the page transforms its data into NVL shape).
 * - Initial layout + the set of layouts in the runtime switcher.
 * - Initial zoom + height.
 * - Optional selection highlighting (pass `selectedNodeId`).
 * - Optional search bar (pass `showSearch`; default matcher matches the
 *   node's `caption` case-insensitively).
 * - Custom header actions slot for project-specific buttons.
 * - Custom search matcher for richer filtering (e.g. multi-field).
 * - Standard click/double-click/canvas-click handlers.
 *
 * **The data shape is the contract.** Like the v1, the v2 does NOT
 * dictate a data format. The caller transforms its data (Neo4j-native,
 * plain, anything) into NVL's `Node[]` + `Relationship[]` shape. When
 * the QTC's data store migrates to Neo4j, the SPA consumes the
 * Cypher `RETURN n, r, m` shape directly — no transformation layer.
 *
 * **Bundling:** `@neo4j-nvl/react` remains a peerDependency (optional) so
 * consumers who don't use this view don't pay the 1.25MB cost. Vite
 * tree-shakes the import automatically when the component isn't used.
 */
export const Neo4jGraphView = forwardRef<Neo4jGraphViewHandle, Neo4jGraphViewProps>(
  function Neo4jGraphView(props, ref) {
    const {
      // Data
      nodes,
      rels,
      // Header
      title,
      subtitle,
      hideHeader = false,
      headerActions,
      // Display
      layout: initialLayout = "d3Force",
      hierarchicalOptions,
      layouts = DEFAULT_LAYOUTS,
      initialZoom = 1.0,
      height = 460,
      fullWidth = true,
      // Toolbar toggles
      showZoomControls = true,
      showLayoutSwitcher = true,
      showFullscreenToggle = true,
      showExport = true,
      showSearch = false,
      searchPlaceholder = "Search nodes…",
      searchMatcher = defaultSearchMatcher,
      // NVL toggles
      pannable = true,
      allowDrag = true,
      disableTelemetry = true,
      autoFit = true,
      forceCanvasRenderer = true,
      // Selection / events
      selectedNodeId = null,
      onNodeClick,
      onNodeDoubleClick,
      onCanvasClick,
      onPan,
      onNodeDragStart,
      onNodeDragEnd,
      onLayoutChange,
      onLayoutDone,
      // States
      loading: loadingProp = false,
      error = null,
      emptyMessage = "No nodes to display.",
      emptyHint,
      // Visual
      className = "",
      style,
      "data-testid": testId,
    } = props;

    // ---- Local state ---------------------------------------------------
    const [currentLayout, setCurrentLayout] = useState(initialLayout);
    const [searchQuery, setSearchQuery] = useState("");
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isInitialLayoutPending, setIsInitialLayoutPending] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [currentZoom, setCurrentZoom] = useState<number | null>(initialZoom);

    // ---- Refs ----------------------------------------------------------
    const nvlRef = useRef<NvlRefType | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    // Guards fit-on-load so a user's manual pan/zoom isn't reset on every
    // re-render. The guard clears when nodes/rels change so re-filters
    // trigger a re-fit.
    const hasFit = useRef(false);
    const lastFitKey = useRef<string>("");

    // ---- Search filtering ---------------------------------------------
    // Filter nodes by the search query (case-insensitive). Rels are hidden
    // if either endpoint is filtered out. The matching is client-side,
    // the cost is O(n) per keystroke, which is fine for the KB's 140 nodes.
    const { visibleNodes, visibleRels } = useMemo(() => {
      if (!searchQuery.trim()) {
        return { visibleNodes: nodes, visibleRels: rels };
      }
      const q = searchQuery.toLowerCase();
      const matched = nodes.filter((n) => searchMatcher(n, q));
      const matchedIds = new Set(matched.map((n) => n.id));
      const filteredRels = rels.filter(
        (r) => matchedIds.has(r.from) && matchedIds.has(r.to),
      );
      return { visibleNodes: matched, visibleRels: filteredRels };
    }, [nodes, rels, searchQuery, searchMatcher]);

    // Reset fit-guard when the visible graph changes (data, filter, or
    // re-mount). NVL's onLayoutDone callback then triggers a fresh fit.
    // Re-filtering by search triggers a re-fit so the user always sees
    // the matched subset centered.
    useEffect(() => {
      const key = `${visibleNodes.length}:${visibleRels.length}`;
      if (key !== lastFitKey.current) {
        hasFit.current = false;
        lastFitKey.current = key;
      }
    }, [visibleNodes, visibleRels]);

    // Belt + suspenders: a 1.5s fallback for d3Force (the layout worker
    // can take a moment to settle). Hierarchical settles immediately.
    useEffect(() => {
      if (!visibleNodes || visibleNodes.length === 0) return;
      const t = setTimeout(() => {
        if (!hasFit.current && nvlRef.current?.fit) {
          nvlRef.current.fit();
          hasFit.current = true;
        }
      }, 1500);
      return () => clearTimeout(t);
    }, [visibleNodes, visibleRels]);

    // Hide the "loading" overlay after a short delay so we don't flash it
    // on every re-render — only on the first paint + after data changes.
    useEffect(() => {
      const t = setTimeout(() => setIsInitialLayoutPending(false), 250);
      return () => clearTimeout(t);
    }, [visibleNodes, visibleRels]);

    // ---- Imperative handle (what parents can call) --------------------
    useImperativeHandle(
      ref,
      () => ({
        fit: (nodeIds?: string[]) => nvlRef.current?.fit?.(nodeIds as string[]),
        setZoom: (zoom: number) => nvlRef.current?.setZoom?.(zoom),
        getZoom: () => nvlRef.current?.getScale?.() ?? currentZoom ?? 1,
        resetZoom: () => nvlRef.current?.resetZoom?.(),
        deselectAll: () => nvlRef.current?.deselectAll?.(),
        getSelectedNodes: () => nvlRef.current?.getSelectedNodes?.() ?? [],
        getNodes: () => nvlRef.current?.getNodes?.() ?? visibleNodes,
        setLayout: (next) => nvlRef.current?.setLayout?.(next),
        zoomIn: () => {
          const z = nvlRef.current?.getScale?.() ?? 1;
          nvlRef.current?.setZoom?.(z + ZOOM_STEP);
          setCurrentZoom(z + ZOOM_STEP);
        },
        zoomOut: () => {
          const z = nvlRef.current?.getScale?.() ?? 1;
          nvlRef.current?.setZoom?.(Math.max(0.1, z - ZOOM_STEP));
          setCurrentZoom(Math.max(0.1, z - ZOOM_STEP));
        },
        saveAsPng: (filename = "graph.png") => {
          nvlRef.current?.saveToFile?.({ filename });
        },
        toggleFullscreen: () => setIsFullscreen((s) => !s),
      }),
      [currentZoom, visibleNodes],
    );

    // ---- Handlers ------------------------------------------------------
    const handleLayoutChange = useCallback(
      (next: typeof currentLayout) => {
        setCurrentLayout(next);
        onLayoutChange?.(next);
      },
      [onLayoutChange],
    );

    const handleZoomIn = useCallback(() => {
      const z = nvlRef.current?.getScale?.() ?? 1;
      nvlRef.current?.setZoom?.(z + ZOOM_STEP);
      setCurrentZoom(z + ZOOM_STEP);
    }, []);

    const handleZoomOut = useCallback(() => {
      const z = nvlRef.current?.getScale?.() ?? 1;
      nvlRef.current?.setZoom?.(Math.max(0.1, z - ZOOM_STEP));
      setCurrentZoom(Math.max(0.1, z - ZOOM_STEP));
    }, []);

    const handleFit = useCallback(() => {
      nvlRef.current?.fit?.();
      hasFit.current = true;
    }, []);

    const handleReset = useCallback(() => {
      nvlRef.current?.resetZoom?.();
    }, []);

    const handleExport = useCallback(() => {
      nvlRef.current?.saveToFile?.({ filename: "graph.png" });
    }, []);

    const handleToggleFullscreen = useCallback(() => {
      setIsFullscreen((s) => !s);
    }, []);

    const handleSearchChange = useCallback((q: string) => {
      setSearchQuery(q);
    }, []);

    const handleNodeClick = useCallback(
      (node: Node) => {
        onNodeClick?.(node);
      },
      [onNodeClick],
    );

    const handleCanvasClick = useCallback(() => {
      onCanvasClick?.();
    }, [onCanvasClick]);

    // ---- Keyboard shortcuts (active when container has focus) ---------
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        // Only react when no input is focused
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        if (e.key === "f" || e.key === "F") {
          e.preventDefault();
          handleFit();
        } else if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === "-" || e.key === "_") {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === "0") {
          e.preventDefault();
          handleReset();
        } else if (e.key === "Escape") {
          if (isFullscreen) {
            setIsFullscreen(false);
          } else {
            nvlRef.current?.deselectAll?.();
          }
        }
      },
      [handleFit, handleZoomIn, handleZoomOut, handleReset, isFullscreen],
    );

    // ---- Selected-node styling -----------------------------------------
    // When the caller passes `selectedNodeId`, we dim non-selected nodes
    // and add a thicker outline on the selected one. This is the standard
    // "focused" pattern: the eye finds the highlighted node instantly.
    const styledNodes = useMemo(() => {
      if (!selectedNodeId) return visibleNodes;
      return visibleNodes.map((n) => {
        if (n.id === selectedNodeId) {
          return {
            ...n,
            selected: true,
            // Outline: NVL uses `borderColor` (ring around the node)
            // — amplify the visual when selected
            ...(n as { borderColor?: string }).borderColor
              ? {}
              : { borderColor: "#3b82f6", borderWidth: 2.5 },
          } as Node;
        }
        // Dim non-selected: NVL's node opacity is on the `opacity` field
        return { ...n, opacity: 0.35 } as Node;
      });
    }, [visibleNodes, selectedNodeId]);

    // ---- Loading / empty / error visibility ---------------------------
    const isLoading = loadingProp || isInitialLayoutPending;
    const isEmpty = !isLoading && !error && visibleNodes.length === 0;

    // ---- Render --------------------------------------------------------
    const wrapperClass = [
      "flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white",
      "dark:border-gray-800 dark:bg-gray-900",
      isFullscreen ? "fixed inset-0 z-50 rounded-none border-0" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const wrapperStyle: CSSProperties = isFullscreen
      ? { ...style }
      : { height, width: fullWidth ? "100%" : undefined, ...style };

    return (
      <div
        ref={containerRef}
        data-testid={testId}
        className={wrapperClass}
        style={wrapperStyle}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="application"
        aria-label={typeof title === "string" ? title : "Graph visualization"}
      >
        {!hideHeader && (
          <Neo4jGraphHeader
            title={title}
            subtitle={subtitle}
            headerActions={headerActions}
            currentLayout={currentLayout}
            availableLayouts={layouts}
            onLayoutChange={handleLayoutChange}
            showZoomControls={showZoomControls}
            showLayoutSwitcher={showLayoutSwitcher}
            showFullscreenToggle={showFullscreenToggle}
            showExport={showExport}
            showSearch={showSearch}
            searchPlaceholder={searchPlaceholder}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            isFullscreen={isFullscreen}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFit={handleFit}
            onReset={handleReset}
            onExport={handleExport}
            onToggleFullscreen={handleToggleFullscreen}
          />
        )}

        <div
          className={
            "relative flex-1 overflow-hidden bg-gray-50 dark:bg-gray-950 " +
            (pannable
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-default")
          }
          onMouseDown={() => pannable && setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
        >
          <InteractiveNvlWrapper
            ref={nvlRef}
            nodes={styledNodes}
            rels={visibleRels}
            nvlOptions={{
              layout: currentLayout,
              ...(currentLayout === "hierarchical" && hierarchicalOptions
                ? { hierarchicalLayoutOptions: hierarchicalOptions }
                : {}),
              initialZoom,
              allowDrag,
              disableTelemetry,
              ...(forceCanvasRenderer ? { renderer: "canvas" } : {}),
            }}
            nvlCallbacks={{
              onLayoutDone: () => {
                if (autoFit && !hasFit.current && nvlRef.current?.fit) {
                  nvlRef.current.fit();
                  hasFit.current = true;
                }
                // Update zoom indicator after layout settles
                const z = nvlRef.current?.getScale?.();
                if (typeof z === "number") setCurrentZoom(z);
                onLayoutDone?.();
              },
            }}
            mouseEventCallbacks={{
              onNodeClick: onNodeClick
                ? (node: Node) => handleNodeClick(node)
                : () => undefined,
              onNodeDoubleClick: onNodeDoubleClick
                ? (node: Node) => onNodeDoubleClick(node)
                : () => undefined,
              onCanvasClick: onCanvasClick
                ? () => handleCanvasClick()
                : () => undefined,
              // NVL's @neo4j-nvl/react ONLY instantiates an interaction if
              // a callback is provided for it (see hooks.js:useInteraction:
              // "if (callback === true || typeof callback === 'function')").
              // Without a callback, the PanInteraction/ZoomInteraction/
              // DragNodeInteraction is never constructed, so pan / wheel-
              // zoom / drag-node simply do nothing. We pass no-op
              // callbacks here to force-create all 3, then surface the
              // real events to the consumer's onPan / onNodeDragStart /
              // onNodeDragEnd if they care.
              onPan: onPan
                ? (pan: { x: number; y: number }) => onPan(pan)
                : () => undefined,
              onZoom: () => undefined,
              onZoomAndPan: () => undefined,
              onDrag: () => undefined,
              onDragStart: onNodeDragStart
                ? (node: Node) => onNodeDragStart(node)
                : () => undefined,
              onDragEnd: onNodeDragEnd
                ? (node: Node) => onNodeDragEnd(node)
                : () => undefined,
            }}
          />

          {/* Floating zoom controls (bottom-right, also accessible via keyboard) */}
          {showZoomControls && !isEmpty && (
            <div
              data-testid={testId ? `${testId}-zoom-controls` : "nvl-zoom-controls"}
              className="absolute bottom-3 right-3 flex flex-col gap-1 rounded-xl border border-gray-200 bg-white/95 p-1 shadow-theme-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/90"
            >
              <ZoomButton
                label="Zoom in"
                glyph="+"
                onClick={handleZoomIn}
                testId={`${testId ?? "nvl"}-zoom-in`}
              />
              <ZoomButton
                label="Zoom out"
                glyph="−"
                onClick={handleZoomOut}
                testId={`${testId ?? "nvl"}-zoom-out`}
              />
              <ZoomButton
                label="Fit to screen"
                glyph="⤢"
                onClick={handleFit}
                testId={`${testId ?? "nvl"}-fit`}
              />
              <ZoomButton
                label="Reset zoom"
                glyph="↺"
                onClick={handleReset}
                testId={`${testId ?? "nvl"}-reset`}
              />
            </div>
          )}

          {/* Subtle drag-to-pan affordance hint (bottom-left, opposite the
              zoom controls). Always visible but very low-contrast so it
              doesn't compete with the canvas. The keyboard shortcut hint
              in the status bar covers the keyboard case. */}
          {pannable && !isEmpty && (
            <div
              data-testid={testId ? `${testId}-pan-hint` : "nvl-pan-hint"}
              className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-white/70 px-2 py-1 text-[10px] font-medium text-gray-500 shadow-sm backdrop-blur dark:bg-gray-900/70 dark:text-gray-400"
            >
              {isDragging ? (
                <span className="text-brand-600 dark:text-brand-300">Panning…</span>
              ) : (
                <span>Drag to pan · scroll to zoom{allowDrag ? " · drag nodes to move" : ""}</span>
              )}
            </div>
          )}

          <Neo4jGraphOverlays
            isLoading={isLoading}
            isEmpty={isEmpty}
            error={error}
            emptyMessage={emptyMessage}
            emptyHint={emptyHint}
          />
        </div>

        <Neo4jGraphStatusBar
          nodeCount={visibleNodes.length}
          relCount={visibleRels.length}
          totalNodeCount={nodes.length}
          totalRelCount={rels.length}
          currentLayout={currentLayout}
          currentZoom={currentZoom}
          selectedNodeId={selectedNodeId}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />
      </div>
    );
  },
);

// ---- Internal: small icon button for the floating zoom controls -----
type ZoomButtonProps = {
  label: string;
  glyph: string;
  onClick: () => void;
  testId?: string;
};

function ZoomButton({ label, glyph, onClick, testId }: ZoomButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      data-testid={testId}
      className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      {glyph}
    </button>
  );
}
