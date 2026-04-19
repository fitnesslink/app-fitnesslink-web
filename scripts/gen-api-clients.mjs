#!/usr/bin/env node
// Generates one module per platform-API controller under src/lib/api/{group}/
// from openapi.snapshot.json. Every operation becomes a named typed function
// + a `keys` Query-key factory per module. Skeleton only — consumers come later.
//
// Re-run with `npm run gen:api:clients` after regenerating the spec snapshot.

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";

const SPEC_PATH = "openapi.snapshot.json";
const OUT_ROOT = "src/lib/api";

// Out of web-app scope per PLAN_MAIN_APP.md:
//  - sync:  native-clients-only
//  - auth:  owned by Firebase Web SDK
const SKIP_CONTROLLERS = new Set(["sync", "auth"]);

function toCamel(s) {
  return s.replace(/[-_]([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
}
function toPascal(s) {
  const c = toCamel(s);
  return c.charAt(0).toUpperCase() + c.slice(1);
}
function singularize(s) {
  if (s.endsWith("ies")) return s.slice(0, -3) + "y";
  if (s.endsWith("xes") || s.endsWith("ses")) return s.slice(0, -2);
  if (s.endsWith("s") && !s.endsWith("ss")) return s.slice(0, -1);
  return s;
}
function lowerFirst(s) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function parseGroupAndController(pathname) {
  const m = pathname.match(/^\/(core|nutrition|notifications|billing)\/api\/v1\/([^/]+)/);
  return m ? { group: m[1], controller: m[2] } : null;
}

// Derive a function name for a (method, pathname) pair.
// Heuristic covers the common REST + verb-action patterns in this spec.
// Hand-edit regenerated files if a specific name reads oddly.
function functionName(method, pathname, controller) {
  const prefixMatch = pathname.match(/^\/[^/]+\/api\/v1\/[^/]+/);
  const tail = pathname.slice(prefixMatch[0].length); // e.g. "/{id}/complete"
  const segs = tail.split("/").filter(Boolean);
  const structured = segs.map((s) => ({
    value: s.startsWith("{") ? s.slice(1, -1) : s,
    isParam: s.startsWith("{"),
  }));

  const singular = toPascal(singularize(controller));
  const plural = toPascal(controller);
  const actions = structured.filter((s) => !s.isParam).map((s) => s.value);
  const actionPascal = actions.map(toPascal).join("");
  const lastIsParam = structured.length > 0 && structured[structured.length - 1].isParam;
  const hasParam = structured.some((s) => s.isParam);

  switch (method) {
    case "get":
      if (structured.length === 0) return `list${plural}`;
      // /me, /me/x, /me/x/y
      if (!hasParam && actions[0] === "me") {
        if (actions.length === 1) return `getMy${singular}`;
        return `getMy${actions.slice(1).map(toPascal).join("")}`;
      }
      // /{id}
      if (structured.length === 1 && structured[0].isParam) return `get${singular}`;
      // /{id}/.../{subId} — fetch a specific nested resource
      if (lastIsParam && actions.length > 0) {
        const last = actions[actions.length - 1];
        return `get${singular}${toPascal(singularize(last))}`;
      }
      // /{id}/subresource — list subresources of a specific item
      if (!lastIsParam && hasParam && actions.length > 0) {
        return `list${singular}${actionPascal}`;
      }
      // /action on collection (no params)
      if (!hasParam && actions.length > 0) {
        return `list${plural}${actionPascal}`;
      }
      return `get${singular}`;

    case "post":
      if (structured.length === 0) return `create${singular}`;
      // POST /{id}/action — action on specific resource
      if (hasParam && actions.length > 0) return `${lowerFirst(actionPascal)}${singular}`;
      // POST /{param} — treat like a creation with a natural key
      if (hasParam && actions.length === 0) return `create${singular}`;
      // POST /action on collection
      if (!hasParam && actions.length > 0) return `${lowerFirst(actionPascal)}${plural}`;
      return `post${singular}`;

    case "put":
      if (structured.length === 1 && structured[0].isParam) return `update${singular}`;
      if (hasParam && actions.length > 0) return `${lowerFirst(actionPascal)}${singular}`;
      if (!hasParam && actions.length > 0) return `update${plural}${actionPascal}`;
      return `put${singular}`;

    case "patch":
      if (structured.length === 1 && structured[0].isParam) return `patch${singular}`;
      if (hasParam && actions.length > 0) return `patch${singular}${actionPascal}`;
      return `patch${plural}${actionPascal}`;

    case "delete":
      if (structured.length === 1 && structured[0].isParam) return `delete${singular}`;
      if (hasParam && actions.length > 0) return `remove${singular}${actionPascal}`;
      return `delete${plural}${actionPascal}`;
  }
  return `${method}${plural}`;
}

function pathParams(pathname) {
  return [...pathname.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
}

function buildUrlTemplate(pathname) {
  // Replace {x} with ${encodeURIComponent(x)} while preserving the rest.
  return pathname.replace(/\{([^}]+)\}/g, (_, p) => "${encodeURIComponent(" + toCamel(p) + ")}");
}

function shortRefName(ref) {
  // "#/components/schemas/FitnessLink...DTOs.CreateWorkoutRequest" → "CreateWorkoutRequest"
  const full = ref.replace("#/components/schemas/", "");
  return full.split(".").pop();
}

function mapQueryType(schema) {
  if (!schema) return "unknown";
  switch (schema.type) {
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "string":
      return "string";
    default:
      return "unknown";
  }
}

function emitModule(group, controller, endpoints) {
  // Collect schema refs for request bodies (responses lack schemas in this spec).
  const usedRefs = new Map(); // alias → full schema key
  const operations = [];
  for (const { pathname, method, op } of endpoints) {
    const fname = functionName(method, pathname, controller);
    const pp = pathParams(pathname);
    const queryParams = (op.parameters ?? []).filter((p) => p.in === "query");
    let bodyAlias = null;
    const bodyRef = op.requestBody?.content?.["application/json"]?.schema?.$ref;
    if (bodyRef) {
      const alias = shortRefName(bodyRef);
      usedRefs.set(alias, bodyRef.replace("#/components/schemas/", ""));
      bodyAlias = alias;
    }
    operations.push({ fname, pathname, method, pp, queryParams, bodyAlias });
  }

  const lines = [];
  lines.push(`// AUTO-GENERATED by scripts/gen-api-clients.mjs — do not hand-edit.`);
  lines.push(`// Regenerate with \`npm run gen:api:clients\` after the OpenAPI snapshot changes.`);
  lines.push(``);
  lines.push(`import { platformJson } from "../client";`);

  if (usedRefs.size > 0) {
    lines.push(`import type { components } from "@/types/api";`);
    lines.push(``);
    lines.push(`type Schemas = components["schemas"];`);
    lines.push(``);
    for (const [alias, key] of usedRefs) {
      lines.push(`export type ${alias} = Schemas["${key}"];`);
    }
    lines.push(``);
  } else {
    lines.push(``);
  }

  lines.push(`export const keys = {`);
  lines.push(`  all: ["${group}", "${controller}"] as const,`);
  lines.push(`  lists: () => [...keys.all, "list"] as const,`);
  lines.push(`  list: (params?: Record<string, unknown>) => [...keys.lists(), params ?? {}] as const,`);
  lines.push(`  details: () => [...keys.all, "detail"] as const,`);
  lines.push(`  detail: (id: string) => [...keys.details(), id] as const,`);
  lines.push(`} as const;`);
  lines.push(``);

  const needsBuildQuery = operations.some((o) => o.queryParams.length > 0);

  // Detect duplicate function names across ops in this controller; suffix with method if so.
  const nameCounts = new Map();
  for (const op of operations) nameCounts.set(op.fname, (nameCounts.get(op.fname) ?? 0) + 1);
  const dedupeCounter = new Map();
  for (const op of operations) {
    if (nameCounts.get(op.fname) > 1) {
      const n = dedupeCounter.get(op.fname) ?? 0;
      dedupeCounter.set(op.fname, n + 1);
      op.fname = `${op.fname}${toPascal(op.method)}`;
    }
  }

  for (const { fname, pathname, method, pp, queryParams, bodyAlias } of operations) {
    const args = [];
    for (const p of pp) args.push(`${toCamel(p)}: string`);
    if (queryParams.length > 0) {
      const qt = queryParams
        .map((p) => `${JSON.stringify(p.name)}?: ${mapQueryType(p.schema)}`)
        .join("; ");
      args.push(`params?: { ${qt} }`);
    }
    if (bodyAlias) args.push(`body: ${bodyAlias}`);

    const urlTemplate = buildUrlTemplate(pathname);
    const upperMethod = method.toUpperCase();

    lines.push(`export async function ${fname}(${args.join(", ")}): Promise<unknown> {`);
    if (queryParams.length > 0) {
      lines.push(`  const qs = buildQuery(params);`);
      lines.push(`  const url = qs ? \`${urlTemplate}?\${qs}\` : \`${urlTemplate}\`;`);
      if (method === "get") {
        lines.push(`  return platformJson(url);`);
      } else {
        const bodyArg = bodyAlias ? `, body: JSON.stringify(body)` : "";
        lines.push(`  return platformJson(url, { method: "${upperMethod}"${bodyArg} });`);
      }
    } else if (method === "get") {
      lines.push(`  return platformJson(\`${urlTemplate}\`);`);
    } else {
      const bodyArg = bodyAlias ? `, body: JSON.stringify(body)` : "";
      lines.push(`  return platformJson(\`${urlTemplate}\`, { method: "${upperMethod}"${bodyArg} });`);
    }
    lines.push(`}`);
    lines.push(``);
  }

  if (needsBuildQuery) {
    lines.push(`function buildQuery(params: Record<string, unknown> | undefined): string {`);
    lines.push(`  if (!params) return "";`);
    lines.push(`  const q = new URLSearchParams();`);
    lines.push(`  for (const [k, v] of Object.entries(params)) {`);
    lines.push(`    if (v !== undefined && v !== null) q.set(k, String(v));`);
    lines.push(`  }`);
    lines.push(`  return q.toString();`);
    lines.push(`}`);
    lines.push(``);
  }

  return lines.join("\n");
}

async function main() {
  const spec = JSON.parse(await readFile(SPEC_PATH, "utf8"));

  // group → { controller → [{ pathname, method, op }] }
  const groups = {};
  for (const [pathname, pathItem] of Object.entries(spec.paths)) {
    const parsed = parseGroupAndController(pathname);
    if (!parsed) continue;
    const { group, controller } = parsed;
    if (SKIP_CONTROLLERS.has(controller)) continue;
    groups[group] ??= {};
    groups[group][controller] ??= [];
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      if (pathItem[method]) {
        groups[group][controller].push({ pathname, method, op: pathItem[method] });
      }
    }
  }

  for (const group of Object.keys(groups)) {
    await rm(`${OUT_ROOT}/${group}`, { recursive: true, force: true });
    await mkdir(`${OUT_ROOT}/${group}`, { recursive: true });
  }

  let opCount = 0;
  for (const [group, controllers] of Object.entries(groups)) {
    const indexLines = [`// AUTO-GENERATED by scripts/gen-api-clients.mjs`, ``];
    for (const [controller, endpoints] of Object.entries(controllers)) {
      const moduleName = controller.replace(/-/g, "_");
      const content = emitModule(group, controller, endpoints);
      await writeFile(`${OUT_ROOT}/${group}/${moduleName}.ts`, content);
      indexLines.push(`export * as ${toCamel(moduleName)} from "./${moduleName}";`);
      opCount += endpoints.length;
    }
    await writeFile(`${OUT_ROOT}/${group}/index.ts`, indexLines.join("\n") + "\n");
  }

  console.log(`\u2713 wrote ${opCount} operations across ${Object.keys(groups).length} groups`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
