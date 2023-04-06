import { generateDomBundle } from "./generators/dom/index.js";
import { generateSsrBundle } from "./generators/ssr/index.js";
import type { CompilerArgs } from "../types";

type BundleResult<T extends "dom" | "ssr"> = T extends "ssr"
  ? Array<{
      css: {
        code: string;
        map: Map<string, string> | null;
      };
      head: string;
      html: string;
    }>
  : Array<string>;

export const generateBundle = async <T extends CompilerArgs>(
  args: T
): Promise<BundleResult<typeof args["generate"]>> => {
  const { generate } = args;
  return generate === "dom" ? generateDomBundle(args) : generateSsrBundle(args);
};
