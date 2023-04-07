export type CompilerArgs = {
  props: unknown;
  module: string;
  name: string;
  target?: string;
  context?: Map<string, string>;
  generate: "ssr" | "dom" | "hydrate";
};

type SSRBundleResult = {
  css: {
    code: string;
    map: Map<string, string> | null;
  };
  head: string;
  html: string;
};

type HydratableBundleResult = {
  ssr: SSRBundleResult;
  dom: string;
};

export type BundleResult<T extends "dom" | "ssr" | "hydrate"> = T extends "ssr"
  ? SSRBundleResult
  : T extends "hydrate"
  ? HydratableBundleResult
  : string;
