import esbuild from "esbuild";
import { replace } from "esbuild-plugin-replace";
import sveltePlugin from "esbuild-svelte";
import { join } from "path";
import sveltePreprocess from "svelte-preprocess";
import type { CompilerArgs } from "../../../types";
import { _dirname } from "../../helpers.js";

export const generateSsrBundle = async (args: CompilerArgs) => {
  const { generate, module, name, props } = args;

  const { outputFiles } = await esbuild.build({
    entryPoints: ["./generators/ssr/SSRComponentWrapper.js"],
    bundle: true,
    write: false,
    absWorkingDir: _dirname,
    mainFields: ["svelte", "module", "main"],
    plugins: [
      sveltePlugin({
        compilerOptions: {
          generate,
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
        __name__: name,
      }),
    ],
  });
  const outputs = outputFiles.map(({ contents }) =>
    new Function(
      new TextDecoder()
        .decode(contents)
        .slice(`(()=>{`.length, -"})();".length)
        .concat("return app;")
    )().render(props)
  );
  return outputs;
};
