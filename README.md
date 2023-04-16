# Svelte inline bundler

This package is geared mainly towards those who want to build a svelte bundle server side. It can compile `dom`, `ssr` or `hydrate` Svelte bundle. It uses `esbuild` in order to generate a bundle and returns the code.

It provides a way to bundle Svelte code:

- `DOM` bundle, which bundles `client side` bundle with server props. See [Svelte Client Component API](https://kit-docs-demo.vercel.app/docs/component-api/server).

- `SSR` bundle, which bundles `server side` bundle with server props. See [Svelte Server Component API](https://kit-docs-demo.vercel.app/docs/component-api/server).

- `HYDRATABLE` bundle, which bundles both, and hydrates server side code with client bundle. For more info, look under `hydrate` section in [Svelte Client Component API](https://kit-docs-demo.vercel.app/docs/component-api/server).

## Examples

You can find examples on CodeSandbox here:

https://codesandbox.io/p/sandbox/svelte-inline-bundler-7uek70?file=%2Findex.js

## Install

`npm install svelte-inline-bundler`

## Bundling

In order to bundle Svelte app, you need to import the bundler.

```typescript
import createBundle from "svelte-inline-bundler";

const bundle = await createBundle(options);
```

```typescript
// createBundle will return following

// If building a "ssr" bundle

type SSRBundleResult = {
  css: {
    code: string;
    map: Map<string, string> | null;
  };
  head: string;
  html: string;
};

// If building a "hydrate" bundle

type HydratableBundleResult = {
  ssr: SSRBundleResult;
  dom: string;
};

// If building a "dom", it will return a string of created bundle

//Examples:

const { css, head, html } = createBundle(...options, {
  generate: "ssr",
});

const {
  ssr: { css, head, html },
  dom,
} = createBundle(...options, {
  generate: "hydrate",
});

const bundle = createBundle(...options, {
  generate: "dom",
});
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
  useCache?: boolean;
  cacheKey?: string;
  svelteOptions?: SvelteOptions;
  esbuildOptions?: EsbuildOptions;
  esbuildPlugins?: EsbuildPlugins;
};
```

### Options description

| Member         | Description | required | default |
| :------------- | :---------- | :------  | :-----  | 
| module         | Path to your `.svelte` component module. It uses relative path to your `package.json`.                                                                                                                                                                             | true         |                 |
| name           | Name of your module. Used as placeholder inside compiled code.                                                                                                                                                                                                     | true         |                 |
| generate       | Type of bundle to generate.                                                                                                                                                                                                                                        | true         |                 |
| props          | Props to send to your component.                                                                                                                                                                                                                                   | false        | {}              |
| target         | Where the `dom` bundle will attach og `hydrate` bundle will hydrate. If you want to attach to some `id` in the dom, use `#` prefix. It uses `document.query` to find the element under the hood. Use: `document.body` or `"#some-id"`. Defaults to `document.body` | false        | `document.body` |
| context        | Use to send context to the component.                                                                                                                                                                                                                              | false        | `new Map()`     |
| useCache       | Cache built bundles. It significantly speeds load times. Uses `node-cache`.                                                                                                                                                                                        | false        | false           |
| cacheKey       | Custom cache key. If none provided, the key that will be used follows `${module}:${name}:${generate}` naming convention                                                                                                                                            | false        | undefined       |
| svelteOptions  | All options from `esbuild-svelte` package except `generate, hydratable, immutable, css, preserveComments, preserveWhitespace` buildOptions. Those are reserverd for the library | false | {}  |
| esbuildOptions | All `esbuild` options except `entryPoints, write, absWorkingDir, mainFields, plugins`. Those are reserved for the library                          | false | {}  |
| esbuildPlugins | Extra `esbuild` plugins. | false        | []              |

## Examples

`examples` folder contains an express server with examples and Svelte view.

It has 4 views (`todo`, `virtual-list`, `hacker-news` and `smui`) which all vary in complexity.

To see the views use `base` routes like this:

`/hydratable` route shows how `hydratable` bundle looks like when served with Express.

`/ssr` route shows how `ssr` bundle looks like when served with Express.

`/dom` route shows how `client` bundle looks like when served with Express.

And send `view` as a query parameter like this:

`/hydratable/todo`

#### List of all views

<ol>
  <li>todo</li>
  <li>virtual-list</li>
  <li>hacker-news</li>
  <li>smui</li>
</ol>

`smui` is the most resource heavy because it compiles components from [Svelte Material UI](https://sveltematerialui.com/).

### Running the server

1.  `cd examples`
2.  `npm install`
3.  `npm run dev`
4.  Go to <http://localhost:4000>

This should display the view made with `App.svelte`.

To check the difference between cached and non cached views, send query param `useCache=true|false` on a route.

Example:

`hydratable/smui?useCache=true|false`

#### List of all example routes

- <http://localhost:4000/hydratable/todo>
- <http://localhost:4000/ssr/todo>
- <http://localhost:4000/dom/todo>
- <http://localhost:4000/hydratable/virtual-list>
- <http://localhost:4000/ssr/virtual-list>
- <http://localhost:4000/dom/virtual-list>
- <http://localhost:4000/hydratable/hacker-news>
- <http://localhost:4000/ssr/hacker-news>
- <http://localhost:4000/dom/hacker-news>
- <http://localhost:4000/hydratable/smui>
- <http://localhost:4000/ssr/smui>
- <http://localhost:4000/dom/smui>

## Gotchas

- `ssr` bundle will not expose any event handlers. It will only expose html, css and head from `<svelte:head />` if used. In order to add events to this bundle, you will need to get elements in the `<svelte:head />` and send that to the dom.
- `hydrate` bundles both `dom` and `ssr` so it will take a bit longer time to compile and send.
- `dom` bundle only bundles js code. All of the other pros and cons with client code rendering applies here as well.
