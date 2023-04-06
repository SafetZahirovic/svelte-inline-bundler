import esbuild from "esbuild";
import { replace } from "esbuild-plugin-replace";
import sveltePlugin from "esbuild-svelte";
import { join } from "path";
import sveltePreprocess from "svelte-preprocess";
import { CompilerArgs } from "../../../types";
import { _dirname } from "../../helpers.js";

export const generateDomBundle = async (args: CompilerArgs) => {
  const { generate, module, name, props, target } = args;
  let invalidSelector = target && !target?.startsWith("#");
  if (invalidSelector) {
    console.warn("Target is of wrong type. Target needs to start with `#`.");
    invalidSelector = true;
  }
  const { outputFiles } = await esbuild.build({
    entryPoints: ["./generators/dom/DOMComponentWrapper.js"],
    bundle: true,
    write: false,
    absWorkingDir: _dirname,
    mainFields: ["svelte", "module", "main"],
    plugins: [
      sveltePlugin({
        compilerOptions: {
          generate,
          css: true,
        },
        preprocess: sveltePreprocess(),
      }),
      replace({
        __data__: JSON.stringify(props),
        __import__: join(process.cwd(), module),
        __name__: name,
        __target__:
          invalidSelector || !target
            ? "document.body"
            : `document.querySelector(${target})`,
      }),
    ],
  });
  return outputFiles.map(({ contents }) => new TextDecoder().decode(contents));
};
