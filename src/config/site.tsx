/* SITE CONFIG — the app's identity + nav, passed to the kit via <SiteConfigProvider>.
   This is the basis's own (demo) config; each product ships its own `siteConfig` value. */
import { GridIcon } from "../icons";
import type { SiteConfig } from "../context/SiteConfigContext";

export const siteConfig: SiteConfig = {
  brand: { name: "Web Basis", mark: "◈" },
  navItems: [{ icon: <GridIcon />, name: "Dashboard", path: "/" }],
  othersItems: [],
};
