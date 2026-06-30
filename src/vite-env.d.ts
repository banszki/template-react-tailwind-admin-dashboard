/// <reference types="vite/client" />

// vite-plugin-svgr is configured with a NAMED export (vite.config: namedExport "ReactComponent").
// Declare it to match so `import { ReactComponent as X } from "./i.svg?react"` typechecks.
declare module "*.svg?react" {
  import type { FC, SVGProps } from "react";
  export const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}
