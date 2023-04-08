import { generateDomBundle } from "./generators/dom/index.js";
import { generateSsrBundle } from "./generators/ssr/index.js";
import { generateHydratableBundle } from "./generators/hydrate/index.js";
import type { BundleResult, CompilerArgs } from "../types";
import { cacheStore as store } from "./cache.js";

const cacheStore = store();

export const generateBundle = async <T extends CompilerArgs>(
  args: T
): Promise<BundleResult<typeof args["generate"]>> => {
  const { generate } = args;

  return generate === "dom"
    ? generateDomBundle(args, cacheStore)
    : generate === "hydrate"
    ? generateHydratableBundle(args, cacheStore)
    : generateSsrBundle(args, cacheStore);
};
