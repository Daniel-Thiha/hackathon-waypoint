import { Router } from "express";
import { listSafePlacesHandler } from "../controllers/safe-place.controller";

const safePlaceRouter = Router();

safePlaceRouter.get("/", listSafePlacesHandler);

export default safePlaceRouter;
