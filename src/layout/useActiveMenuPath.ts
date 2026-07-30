// layout/useActiveMenuPath.ts
import { useMemo } from "react";
import type { MenuItem } from "../types/menu.types";

interface ActiveMatch {
  chain: MenuItem[];
  matchLength: number;
}

function isPathMatch(itemPath: string, pathname: string): boolean {
  if (pathname === itemPath) return true;
  const base = itemPath.endsWith("/") ? itemPath : `${itemPath}/`;
  return pathname.startsWith(base);
}

function findActiveMatch(
  items: MenuItem[],
  pathname: string,
  ancestors: MenuItem[],
): ActiveMatch | null {
  let best: ActiveMatch | null = null;

  for (const item of items) {
    const chain = [...ancestors, item];

    if (item.path && isPathMatch(item.path, pathname)) {
      const matchLength = item.path.length;
      if (!best || matchLength > best.matchLength) {
        best = { chain, matchLength };
      }
    }

    if (item.children?.length) {
      const childMatch = findActiveMatch(item.children, pathname, chain);
      if (childMatch && (!best || childMatch.matchLength > best.matchLength)) {
        best = childMatch;
      }
    }
  }

  return best;
}

/**
 * Resolves the single active menu branch for the current URL, at any
 * nesting depth. The longest matching `path` wins so only one branch is
 * ever active, even when sibling items have overlapping path prefixes.
 */
export function useActiveMenuPath(menuItems: MenuItem[], pathname: string) {
  return useMemo(() => {
    const match = findActiveMatch(menuItems, pathname, []);
    const chain = match?.chain ?? [];

    return {
      // every item id on the active branch (leaf + all ancestors)
      activeIds: new Set(chain.map((item) => item.id)),
      // the deepest matched item — the "currently opened page"
      activeLeafId: chain.length > 0 ? chain[chain.length - 1].id : null,
      // ancestor ids only (excludes the leaf) — these are the parents
      // that should auto-expand and stay highlighted
      activeAncestorIds: new Set(chain.slice(0, -1).map((item) => item.id)),
    };
  }, [menuItems, pathname]);
}
