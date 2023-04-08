import express from "express";
import router from "./router.js";
const app = express();
const port = 4000;
app.use(router);
app.listen(port, () => {
    console.log(`App is listening on port ${port} !`);
});
