# Svelte inline compiler

This package is geared mainly towards those who want to build a svelte bundle server side. It can compiler `dom`, `ssr` or `hydrate` Svelte bundle. It uses `esbuild` in order to generate a bundle and returns the code.

It provides a way to bundle Svelte code:

- `DOM` bundle, which bundles `client side` bundle with server props. See [Svelte Client Component API](https://kit-docs-demo.vercel.app/docs/component-api/server).

- `SSR` bundle, which bundles `server side` bundle with server props. See [Svelte Server Component API](https://kit-docs-demo.vercel.app/docs/component-api/server).

- `HYDRATABLE` bundle, which bundles both, and hydrates server side code with client bundle. For more info, look under `hydrate` section in [Svelte Client Component API](https://kit-docs-demo.vercel.app/docs/component-api/server).

## Install

`npm install svelte-inline-compiler`

## Bundling

In order to bundle Svelte app, you need to import the bundler.

```typescript
import createBundle from "svelte-inline-compiler";

const bundle = await createBundle(options);
```

`createBundle` takes the following options:

```typescript
type CompilerArgs = {
  module: string;
  name: string;
  generate: "ssr" | "dom" | "hydrate";
  props?: unknown;
  target?: string;
  context?: Map<string, string>;
};
```

### Options description

| Member   | Description                                                                                                                                                                                                                                                        | required | default         |
| :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :-------------- |
| module   | Path to your `.svelte` component module. It uses relative path to your `package.json`.                                                                                                                                                                             | true     |                 |
| name     | Name of your module. Used as placeholder inside compiled code.                                                                                                                                                                                                     | true     |                 |
| generate | Type of bundle to generate.                                                                                                                                                                                                                                        | true     |                 |
| props    | Props to send to your component.                                                                                                                                                                                                                                   | false    | {}              |
| target   | Where the `dom` bundle will attach og `hydrate` bundle will hydrate. If you want to attach to some `id` in the dom, use `#` prefix. It uses `document.query` to find the element under the hood. Use: `document.body` or `"#some-id"`. Defaults to `document.body` | false    | `document.body` |
| context  | Use to send context to the component.                                                                                                                                                                                                                              | false    | `new Map()`     |

## Examples

`examples` folder contains an express server with examples and Svelte view.

`/hydrate` route shows how `hydratable` bundle looks like when served with Express.

`/ssr` route shows how `ssr` bundle looks like when served with Express.

`/dom` route shows how `client` bundle looks like when served with Express.

### Running the server

1.  `cd examples`
2.  `npm install`
3.  `npm run dev`
4.  Go to `localhost:4000/<hydrate> | <ssr> | <dom>`

This should display the view made with `App.svelte` in different bundles.

## Gotchas

- `ssr` bundle will not expose any event handlers. It will only expose html, css and head from `<svelte:head />` if used. In order to add events to this bundle, you will need to get elements in the `<svelte:head />` and send that to the dom.
- `hydrate` bundles both `dom` and `ssr` so it will take a bit longer time to compile and send.
- `dom` bundle only bundles js code. All of the other pros and cons with client code rendering applies here as well.
