// @platform/web-kit — the public surface consuming apps import. ONE source of truth; apps
// resolve this via a path-mapped dependency (Vite alias + tsconfig paths), never by copying.
// See ADOPTION.md.

// Chrome / layout
export { default as AppLayout } from "./layout/AppLayout";

// Providers + hooks
export { ThemeProvider, useTheme } from "./context/ThemeContext";
export { SiteConfigProvider, useSiteConfig } from "./context/SiteConfigContext";
export type { SiteConfig, NavItem } from "./context/SiteConfigContext";
export { useModal } from "./hooks/useModal";
export { default as useGoBack } from "./hooks/useGoBack";

// Common
export { default as PageMeta, AppWrapper } from "./components/common/PageMeta";
export { ScrollToTop } from "./components/common/ScrollToTop";
export { default as ComponentCard } from "./components/common/ComponentCard";
export { default as PageBreadcrumb } from "./components/common/PageBreadCrumb";

// UI primitives
export { default as Button } from "./components/ui/button/Button";
export { default as Badge } from "./components/ui/badge/Badge";
export { default as Alert } from "./components/ui/alert/Alert";
export { default as Avatar } from "./components/ui/avatar/Avatar";
export { Modal } from "./components/ui/modal";
export { Dropdown } from "./components/ui/dropdown/Dropdown";
export { DropdownItem } from "./components/ui/dropdown/DropdownItem";
export { Table, TableHeader, TableBody, TableRow, TableCell } from "./components/ui/table";
export { default as Card } from "./components/ui/card/Card";
export { default as StatCard } from "./components/ui/card/StatCard";
export { default as DatePicker } from "./components/form/date-picker";
export { default as Select } from "./components/form/Select";

// Generic pages
export { default as NotFound } from "./pages/OtherPage/NotFound";

// Chat family — the standardized AI chat surface (sidebar + message + input + panel).
// State is owned by the consuming page; the kit provides pure presentational
// components. The data shapes (ChatConversation, ChatPanelMessage) are
// LLM-compatible, so streaming responses drop in without reshape.
export {
  ChatSidebar,
  ChatMessage,
  ChatInput,
  ChatPanel,
  type ChatSidebarProps,
  type ChatConversation,
  type ChatMessageProps,
  type ChatMessageRole,
  type ChatInputProps,
  type ChatPanelProps,
  type ChatPanelMessage,
} from "./components/chat";

// Graph family — the standardized Neo4j graph view (per the 2026-08-01
// promotion of the QTC's graph work to the platform, then v2 promoted
// to a full-featured component with header + toolbar + status bar +
// overlays). Renders NVL (the official Neo4j Visualization Library) with
// consistent styling, a fit-on-load dance, on-screen zoom controls, a
// layout switcher, fullscreen mode, optional search, optional
// selection-dim, and keyboard shortcuts. The consuming page owns the
// data transform (NVL's Node[] + Relationship[]) and the surrounding
// details panel; the kit owns the canvas, the caption sizing, the
// toolbar, the status bar, the overlays, and the fit-to-viewport
// behavior. @neo4j-nvl/react is an optional peer dep so consumers
// who don't use the graph view don't pay the bundle cost.
export {
  Neo4jGraphView,
  DEFAULT_LAYOUTS,
  ZOOM_STEP,
  defaultSearchMatcher,
  type Neo4jGraphViewProps,
  type Neo4jGraphViewHandle,
  type Neo4jGraphLayout,
  type HierarchicalOptions,
  type Node as Neo4jNode,
  type Relationship as Neo4jRelationship,
} from "./components/graph";

// Icon set
export * from "./icons";
