import type { Node } from "./types";

/**
 * Default search matcher: matches a node's `caption` (or `id` if no
 * caption) case-insensitively. Rels are hidden if either endpoint is
 * filtered out (this is handled in the main component, not here).
 */
export function defaultSearchMatcher(node: Node, query: string): boolean {
  if (!query) return true;
  // NVL's Node type doesn't declare `caption` on the TypeScript side,
  // but it's a real runtime field. Cast to access it.
  const caption = (node as Node & { caption?: string }).caption;
  const haystack = (caption ?? node.id ?? "").toLowerCase();
  return haystack.includes(query);
}
