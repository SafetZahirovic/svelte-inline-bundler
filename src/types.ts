export type CompilerArgs = {
  props: unknown;
  module: string;
  name: string;
  target?: string;
  context?: Map<string, string>;
  generate: "ssr" | "dom";
};
