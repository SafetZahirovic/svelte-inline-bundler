import esbuild, { type BuildOptions, Plugin } from "esbuild";
import { replace } from "esbuild-plugin-replace";
import sveltePlugin from "esbuild-svelte";
import { join } from "path";
import sveltePreprocess from "svelte-preprocess";
import { CompilerArgs, SvelteOptions } from "../../../types";
import { _dirname } from "../../helpers.js";
import { CacheStore } from "../../cache.js";

export const generateDomBundle = async (
  args: Omit<CompilerArgs, "generate">,
  cacheStore: CacheStore
) => {
  const {
    module,
    name,
    props,
    target,
    cacheKey,
    context = new Map(),
    useCache = false,
    esbuildOptions = {},
    esbuildPlugins = [],
    svelteOptions = {},
  } = args;

  const key = cacheKey ? cacheKey : `${name}:${module}:dom`;

  if (useCache && cacheStore.has(key)) {
    return cacheStore.get(key);
  }

  let invalidSelector = target && !target?.startsWith("#");

  if (invalidSelector) {
    console.warn(
      "Target is of wrong type. Target needs to start with `#`. Using `document.body`"
    );
    invalidSelector = true;
  }

  const generateBundle = async () => {
    return await esbuild.build({
      ...esbuildOptions,
      entryPoints: ["./generators/wrappers/DOMComponentWrapper.js"],
      bundle: true,
      write: false,
      absWorkingDir: _dirname,
      mainFields: ["svelte", "module", "main"],
      plugins: [
        ...esbuildPlugins,
        sveltePlugin({
          ...svelteOptions,
          compilerOptions: {
            generate: "dom",
            css: true,
          },
          preprocess: sveltePreprocess(svelteOptions?.preprocess),
        }),
        replace({
          __data__: JSON.stringify(props),
          __import__: join(process.cwd(), module),
          __name__: name,
          __hydrate__: "false",
          __context__: JSON.stringify(context),
          __target__:
            invalidSelector || !target
              ? "document.body"
              : `document.querySelector(${target})`,
        }),
      ],
    });
  };
  const { outputFiles } = await generateBundle();

  if (useCache) {
    cacheStore.set(key, outputFiles[0].text);
  }

  return outputFiles[0].text;
};
