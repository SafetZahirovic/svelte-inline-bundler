import express, { Request, Response } from "express";
import generateBundle from "svelte-inline-compiler";

const router = express.Router();

let lastId = 0;

const todos = [
  { id: ++lastId, text: "learn Svelte", done: false },
  { id: ++lastId, text: "build a Svelte app", done: false },
];

router.get("/ssr", async (_req: Request, res: Response) => {
  const bundle = await generateBundle({
    props: {
      todos,
      lastId,
    },
    module: "./src/views/App.svelte",
    name: "App",
    generate: "ssr",
  });
  const { css, head, html } = bundle[0];
  const dom = `<html><head><style>${css.code}</style></head>${html}${head}</html>`;
  res.send(dom);
});

router.get("/dom", async (_req: Request, res: Response) => {
  const bundle = await generateBundle({
    props: {
      todos,
      lastId,
    },
    module: "./src/views/App.svelte",
    name: "App",
    generate: "dom",
  });
  res.send(`<script type="module">${bundle}</script>`);
});
router.get("/hydratable", async (_req: Request, res: Response) => {
  const bundle = await generateBundle({
    props: {
      todos,
      lastId,
    },
    module: "./src/views/App.svelte",
    name: "App",
    generate: "hydrate",
  });

  const { dom, ssr } = bundle;

  res.send(`<body>${ssr[0].html}</body><script>${dom[0]}</script>`);
});

export default router;
