import { Router } from "express";
import additionRouter from "./modules/addition/routers/addition.router";
import multiplicationRouter from "./modules/multiplication/routers/multiplication.router";
import authRouter from "./modules/auth/routers/auth.router";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/addition", additionRouter);
mainRouter.use("/multiplication", multiplicationRouter);

export default mainRouter;
