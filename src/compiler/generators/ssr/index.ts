import esbuild from "esbuild";
import { replace } from "esbuild-plugin-replace";
import sveltePlugin from "esbuild-svelte";
import { join } from "path";
import sveltePreprocess from "svelte-preprocess";
import type { CompilerArgs } from "../../../types";
import { END_OF_FUNCTION, START_OF_FUNCTION, _dirname } from "../../helpers.js";
import { CacheStore } from "../../cache";

export const generateSsrBundle = async (
  args: Omit<CompilerArgs, "generate">,
  cacheStore: CacheStore
) => {
  const {
    module,
    name,
    props,
    cacheKey,
    context = new Map(),
    useCache = false,
    esbuildOptions = {},
    esbuildPlugins = [],
    svelteOptions = {},
  } = args;

  const key = cacheKey ? cacheKey : `${name}:${module}:ssr`;

  if (useCache && cacheStore.has(key)) {
    return cacheStore.get(key);
  }

  const { outputFiles } = await esbuild.build({
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
        __context__: JSON.stringify(context),
        __name__: name,
      }),
    ],
  });

  const bundle = new Function(
    START_OF_FUNCTION.concat(
      outputFiles[0].text.replace("var app =", "var app; component ="),
      END_OF_FUNCTION
    )
  )().render(props, context);

  if (useCache) {
    cacheStore.set(key, bundle);
  }

  return bundle;
};
