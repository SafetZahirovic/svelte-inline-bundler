import express, { Application } from "express";
import router from "./router.js";

const app: Application = express();

const port: number = 4000;

app.use(router);

app.listen(port, () => {
  console.log(`App is listening on port ${port} !`);
});
