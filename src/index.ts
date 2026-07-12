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

// Generic pages
export { default as NotFound } from "./pages/OtherPage/NotFound";

// Icon set
export * from "./icons";
