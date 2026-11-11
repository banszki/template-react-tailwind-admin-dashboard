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

/**
 * The person (or the absence of one) in the header.
 *
 * A kit that ships a hard-coded name, email address and photograph puts
 * another human being's identity in every consuming product's chrome. It
 * also puts a photograph the consumer never asked for, and it makes the
 * product depend on an asset the published package does not even contain.
 *
 * So the identity is the APP's to decide, and the kit's defaults are the
 * neutral ones:
 *
 *  - no `avatar`  -> the default silhouette (drawn by the kit, no file)
 *  - no `name`    -> no name is rendered
 *  - no `email`   -> no contact line is rendered
 *  - no identity  -> no dropdown menu either (nothing to sign out of)
 *
 * An app with no accounts at all can therefore omit `user` entirely and get
 * a plain silhouette.
 */
export type SiteUser = {
  /** Full display name. Omitted or empty renders NO name. */
  name?: string;
  /** Contact line under the name. Omitted or empty renders NO line. */
  email?: string;
  /** Avatar image URL. Omitted or empty renders the DEFAULT SILHOUETTE. */
  avatar?: string;
  /**
   * Set to false to keep the avatar but drop the dropdown menu (the account
   * items). Default: the menu appears when there is an identity to act on.
   */
  menu?: boolean;
};

export type SiteConfig = {
  brand: { name: string; mark: string };
  navItems: NavItem[];
  othersItems?: NavItem[];
  user?: SiteUser;
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
