import { Router } from "express";
import { putLocation, listLocations, removeLocation } from "../controllers/active-location.controller";

const activeLocationRouter = Router();

activeLocationRouter.put("/me", putLocation);
activeLocationRouter.get("/", listLocations);
activeLocationRouter.delete("/me", removeLocation);

export default activeLocationRouter;
