import express, { Application, Request, Response } from "express";
import generateBundle from "svelte-inline-compiler";
const app: Application = express();

const port: number = 3001;

app.get("/", async (_req: Request, res: Response) => {
  const comp = await generateBundle({
    props: { asd: "zxczxczxcxz" },
    module: "./components/App.svelte",
    name: "App",
    generate: "dom",
  });
  res.send(`<script type="module">${comp}</script>`);
});

app.listen(port, function () {
  console.log(`App is listening on port ${port} !`);
});
