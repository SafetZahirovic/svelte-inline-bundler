import esbuild from "esbuild";
import { replace } from "esbuild-plugin-replace";
import sveltePlugin from "esbuild-svelte";
import { join } from "path";
import sveltePreprocess from "svelte-preprocess";
import { CompilerArgs } from "../../../types";
import { CacheStore } from "../../cache";
import { END_OF_FUNCTION, START_OF_FUNCTION, _dirname } from "../../helpers.js";

export const generateHydratableBundle = async (
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

  const key = cacheKey ? cacheKey : `${name}:${module}:hydrate`;

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

  const [ssrBundle, domBundle] = await Promise.all([
    esbuild.build({
      ...esbuildOptions,
      entryPoints: ["./generators/wrappers/SSRComponentWrapper.js"],
      bundle: true,
      write: false,
      absWorkingDir: _dirname,
      mainFields: ["svelte", "module", "main"],
      plugins: [
        ...esbuildPlugins,
        sveltePlugin({
          ...svelteOptions,
          compilerOptions: {
            generate: "ssr",
            hydratable: true,
            immutable: false,
            css: true,
            preserveComments: false,
            preserveWhitespace: false,
          },
          preprocess: sveltePreprocess(svelteOptions?.preprocess),
        }),
        replace({
          __data__: JSON.stringify(props),
          __import__: join(process.cwd(), module),
          __name__: name,
          __context__: JSON.stringify(context),
        }),
      ],
    }),
    esbuild.build({
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
            hydratable: true,
            css: true,
            preserveComments: false,
            preserveWhitespace: false,
          },
          preprocess: sveltePreprocess(svelteOptions?.preprocess),
        }),
        replace({
          __data__: JSON.stringify(props),
          __import__: join(process.cwd(), module),
          __name__: name,
          __hydrate__: "true",
          __context__: JSON.stringify(context),
          __target__:
            invalidSelector || !target
              ? "document.body"
              : `document.querySelector(${target})`,
        }),
      ],
    }),
  ]);

  const { outputFiles: domFiles } = domBundle;
  const { outputFiles: ssrFiles } = ssrBundle;

  const ssr = new Function(
    START_OF_FUNCTION.concat(
      ssrFiles[0].text.replace("var app =", "var app; component ="),
      END_OF_FUNCTION
    )
  )().render(props, context);

  const dom = domFiles[0].text;

  if (useCache) {
    cacheStore.set(key, { ssr, dom });
  }

  return { ssr, dom };
};
