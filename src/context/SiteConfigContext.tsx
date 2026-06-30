import { createContext, useContext } from "react";

// The kit is parameterized by the consuming app through this context (a real library API),
// instead of the kit reaching into a magic project file. The app wraps itself in
// <SiteConfigProvider value={...}> and the kit's chrome (AppSidebar) reads it via useSiteConfig().

export type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

export type SiteConfig = {
  brand: { name: string; mark: string };
  navItems: NavItem[];
  othersItems?: NavItem[];
};

const DEFAULT: SiteConfig = {
  brand: { name: "Web Basis", mark: "◈" },
  navItems: [],
  othersItems: [],
};

const SiteConfigContext = createContext<SiteConfig>(DEFAULT);

export const SiteConfigProvider = ({
  value,
  children,
}: {
  value: SiteConfig;
  children: React.ReactNode;
}) => <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;

export const useSiteConfig = () => useContext(SiteConfigContext);
