import type { RawCustomEvent } from "@/types/console";

export type FrontendTreeNode = {
  name: string;
  eventCount: number;
  children: FrontendTreeNode[];
};

export type FrontendPageTree = {
  pagePath: string;
  eventCount: number;
  roots: FrontendTreeNode[];
};

type MutableNode = Omit<FrontendTreeNode, "children"> & {
  children: Map<string, MutableNode>;
};

export function buildFrontendTrees(rows: RawCustomEvent[]): FrontendPageTree[] {
  const pages = new Map<string, { eventCount: number; roots: Map<string, MutableNode> }>();

  for (const row of rows) {
    const sourceType = String(row.sourceType ?? "").toUpperCase();
    // Browser Agent registration is intentionally optional. Unknown source rows can
    // still be browser events when they carry UI context, but known server runtimes
    // must not appear in this view.
    if (sourceType && sourceType !== "BROWSER") continue;
    const pagePath = nonEmptyText(row.pagePath);
    if (!pagePath) continue;

    const page = pages.get(pagePath) ?? { eventCount: 0, roots: new Map<string, MutableNode>() };
    page.eventCount += 1;
    pages.set(pagePath, page);

    const path = componentPathOf(row);
    if (!path.length) continue;

    let siblings = page.roots;
    for (const name of path) {
      let node = siblings.get(name);
      if (!node) {
        node = { name, eventCount: 0, children: new Map<string, MutableNode>() };
        siblings.set(name, node);
      }
      node.eventCount += 1;
      siblings = node.children;
    }
  }

  return [...pages.entries()]
    .map(([pagePath, page]) => ({
      pagePath,
      eventCount: page.eventCount,
      roots: [...page.roots.values()].map(toPublicNode),
    }))
    .sort((left, right) => right.eventCount - left.eventCount || left.pagePath.localeCompare(right.pagePath));
}

function toPublicNode(node: MutableNode): FrontendTreeNode {
  return {
    name: node.name,
    eventCount: node.eventCount,
    children: [...node.children.values()]
      .map(toPublicNode)
      .sort((left, right) => right.eventCount - left.eventCount || left.name.localeCompare(right.name)),
  };
}

function componentPathOf(row: RawCustomEvent): string[] {
  const parsed = parsePath(row.componentPath);
  if (parsed.length) return parsed;

  const parent = nonEmptyText(row.parentComponentName);
  const component = nonEmptyText(row.componentName);
  return [parent, component].filter((value): value is string => value !== undefined);
}

function parsePath(value: unknown): string[] {
  const resolved = typeof value === "string" ? safeJson(value) : value;
  const items = Array.isArray(resolved)
    ? resolved
    : resolved && typeof resolved === "object" && "items" in resolved
      ? (resolved as { items?: unknown }).items
      : undefined;
  return Array.isArray(items)
    ? items.map(nonEmptyText).filter((item): item is string => item !== undefined)
    : [];
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function nonEmptyText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
