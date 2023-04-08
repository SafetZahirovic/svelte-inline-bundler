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
  const { module, name, props, context = new Map(), useCache = false } = args;

  const cacheKey = `${name}:${module}:ssr`;

  if (useCache && cacheStore.has(cacheKey)) {
    return cacheStore.get(cacheKey);
  }

  const { outputFiles } = await esbuild.build({
    entryPoints: ["./generators/wrappers/SSRComponentWrapper.js"],
    bundle: true,
    write: false,
    absWorkingDir: _dirname,
    mainFields: ["svelte", "module", "main"],
    plugins: [
      sveltePlugin({
        compilerOptions: {
          generate: "ssr",
          hydratable: true,
          immutable: false,
          css: true,
          preserveComments: false,
          preserveWhitespace: false,
        },
        preprocess: sveltePreprocess(),
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
    cacheStore.set(cacheKey, bundle);
  }

  return bundle;
};
