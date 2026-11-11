/* SITE CONFIG — the app's identity + nav, passed to the kit via <SiteConfigProvider>.
   This is the basis's own (demo) config; each product ships its own `siteConfig` value.

   There is deliberately no `user` here. The kit used to hard-code a developer's
   name, email address and photograph into the header of every consuming
   product; the identity is now the app's to set (see `SiteUser`), and its
   default is a neutral silhouette. */
import { GridIcon } from "../icons";
import type { SiteConfig } from "../context/SiteConfigContext";

export const siteConfig: SiteConfig = {
  brand: { name: "Web Basis", mark: "◈" },
  navItems: [{ icon: <GridIcon />, name: "Dashboard", path: "/" }],
  othersItems: [],
};
