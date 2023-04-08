import express, { Request, Response } from "express";
import generateBundle from "svelte-inline-compiler";
import { headerMiddleware } from "./middlewares.js";

const router = express.Router();

let lastId = 0;

const todos = [
  { id: ++lastId, text: "learn Svelte", done: false },
  { id: ++lastId, text: "build a Svelte app", done: false },
];

const viewsAndProps = [
  {
    module: "./src/views/hacker-news/App.svelte",
    props: {},
    view: "hacker-news",
  },
  {
    module: "./src/views/todo/App.svelte",
    props: {
      lastId,
      todos,
    },
    view: "todo",
  },
  {
    module: "./src/views/virtual-list/App.svelte",
    props: {},
    view: "virtual-list",
  },
  {
    module: "./src/views/smui/App.svelte",
    props: {},
    view: "smui",
  },
];

router.get("/", headerMiddleware, async (_req: Request, res: Response) => {
  const bundle = await generateBundle({
    generate: "hydrate",
    module: "./src/views/App.svelte",
    name: "Entry",
    props: {},
    useCache: true,
  });

  const { dom, ssr } = bundle;

  res.send(
    `<head>${ssr.head}<style>${ssr.css.code}</style></head><body>${ssr.html}</body><script>${dom}</script>`
  );
});

router.get("/api", headerMiddleware, (_req: Request, res: Response) => {
  res.send("HELLO IT IS WORKING");
});

router.get(
  "/ssr/:view",
  headerMiddleware,
  async (req: Request, res: Response) => {
    const useCache = req.query?.useCache;

    const requestedView = req.params["view"];

    if (!viewsAndProps.find(({ view }) => view === requestedView)) {
      res.send("No views were found for " + requestedView).status(404);
    }

    const { module, props } = viewsAndProps.find(
      ({ view }) => view === requestedView
    )!;

    const bundle = await generateBundle({
      props,
      module,
      name: "App",
      generate: "ssr",
      useCache: useCache !== undefined ? /true/.test(useCache as string) : true,
    });
    const { css, head, html } = bundle;
    const dom = `<html><head><style>${css.code}</style></head>${html}${head}</html>`;
    res.send(dom);
  }
);

router.get(
  "/dom/:view",
  headerMiddleware,
  async (req: Request, res: Response) => {
    const useCache = req.query?.useCache;

    const requestedView = req.params["view"];

    if (!viewsAndProps.find(({ view }) => view === requestedView)) {
      res.send("No views were found for " + requestedView).status(404);
    }

    const { module, props } = viewsAndProps.find(
      ({ view }) => view === requestedView
    )!;

    const bundle = await generateBundle({
      props,
      module,
      name: "App",
      generate: "dom",
      useCache: useCache !== undefined ? /true/.test(useCache as string) : true,
    });

    res.send(`<script type="module">${bundle}</script>`);
  }
);

router.get(
  "/hydratable/:view",
  headerMiddleware,
  async (req: Request, res: Response) => {
    const requestedView = req.params["view"];

    if (!viewsAndProps.find(({ view }) => view === requestedView)) {
      res.send("No views were found for " + requestedView).status(404);
    }

    const useCache = req.query?.useCache;

    const { module, props } = viewsAndProps.find(
      ({ view }) => view === requestedView
    )!;

    const bundle = await generateBundle({
      props,
      module,
      name: "App",
      generate: "hydrate",
      useCache: useCache !== undefined ? /true/.test(useCache as string) : true,
    });

    const { dom, ssr } = bundle;

    res.send(
      `<head>${ssr.head}<style>${ssr.css.code}</style></head><body>${ssr.html}</body><script>${dom}</script>`
    );
  }
);

export default router;
