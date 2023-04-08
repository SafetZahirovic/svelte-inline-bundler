import esbuild from "esbuild";
import { replace } from "esbuild-plugin-replace";
import sveltePlugin from "esbuild-svelte";
import { join } from "path";
import sveltePreprocess from "svelte-preprocess";
import { CompilerArgs } from "../../../types";
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
    context = new Map(),
    useCache = false,
  } = args;

  const cacheKey = `${name}-dom`;

  if (useCache && cacheStore.has(cacheKey)) {
    return cacheStore.get(cacheKey);
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
      entryPoints: ["./generators/wrappers/DOMComponentWrapper.js"],
      bundle: true,
      write: false,
      absWorkingDir: _dirname,
      mainFields: ["svelte", "module", "main"],
      plugins: [
        sveltePlugin({
          compilerOptions: {
            generate: "dom",
            css: true,
          },
          preprocess: sveltePreprocess(),
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
    cacheStore.set(cacheKey, outputFiles[0].text);
  }

  return outputFiles[0].text;
};
