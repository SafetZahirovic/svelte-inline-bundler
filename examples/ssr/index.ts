import express, { Application, Request, Response } from "express";
import generateBundle from "svelte-inline-compiler";

const app: Application = express();

const port: number = 3001;

app.get("/", async (_req: Request, res: Response) => {
  const generatedBundle = await generateBundle({
    props: { asd: "zxczxczxcxz" },
    module: "./components/App.svelte",
    name: "App",
    generate: "ssr",
  });
  const { css, head, html } = generatedBundle[0];
  const dom = `<html><head><style>${css.code}</style></head>${html}${head}</html>`;
  res.send(dom);
});

app.listen(port, function () {
  console.log(`App is listening on port ${port} !`);
});
