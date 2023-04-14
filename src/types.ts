import type { BuildOptions, Plugin } from "esbuild";
import sveltePlugin from "esbuild-svelte";
import { PreprocessorGroup } from "svelte-preprocess/dist/types";
import { CompileOptions, Warning } from "svelte/types/compiler/interfaces";

export type SvelteOptions = {
  compilerOptions?: Omit<
    CompileOptions,
    | "generate"
    | "hydratable"
    | "immutable"
    | "css"
    | "preserveComments"
    | "preserveWhitespace"
  >;
  preprocess?: PreprocessorGroup | PreprocessorGroup[];
  cache?: boolean | "overzealous";
  fromEntryFile?: boolean;
  include?: RegExp;
  filterWarnings?: (warning: Warning) => boolean;
};

export type EsbuildOptions = Omit<
  BuildOptions,
  | "entryPoints"
  | "bundle"
  | "write"
  | "absWorkingDir"
  | "mainFields"
  | "plugins"
>;

export type EsbuildPlugins = Plugin[];

export type CompilerArgs = {
  generate: "ssr" | "dom" | "hydrate";
  props: unknown;
  module: string;
  name: string;
  target?: string;
  context?: Map<string, string>;
  useCache?: boolean;
  cacheKey?: string;
  svelteOptions?: SvelteOptions;
  esbuildOptions?: EsbuildOptions;
  esbuildPlugins?: EsbuildPlugins;
};

export type SSRBundleResult = {
  css: {
    code: string;
    map: Map<string, string> | null;
  };
  head: string;
  html: string;
};

export type HydratableBundleResult = {
  ssr: SSRBundleResult;
  dom: string;
};

export type BundleResult<T extends "dom" | "ssr" | "hydrate"> = T extends "ssr"
  ? SSRBundleResult
  : T extends "hydrate"
  ? HydratableBundleResult
  : string;
