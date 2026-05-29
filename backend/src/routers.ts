import { Router } from "express";
import authRouter from "./modules/auth/routers/auth.router";
import forecastRouter from "./modules/forecast/routers/forecast.router";
import safePlaceRouter from "./modules/safe-place/routers/safe-place.router";
import survivorRouter from "./modules/survivor/routers/survivor.router";
import rescueRouter from "./modules/rescue/routers/rescue.router";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/forecast", forecastRouter);
mainRouter.use("/safe-place", safePlaceRouter);
mainRouter.use("/survivor", survivorRouter);
mainRouter.use("/rescue", rescueRouter);

export default mainRouter;
