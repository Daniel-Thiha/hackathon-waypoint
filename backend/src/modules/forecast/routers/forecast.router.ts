import { Router } from "express";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware";
import { list, create, update, remove } from "../controllers/forecast.controller";

const forecastRouter = Router();

forecastRouter.get("/", list);
forecastRouter.post("/", requireAuth, requireRole("Admin"), create);
forecastRouter.put("/:id", requireAuth, requireRole("Admin"), update);
forecastRouter.delete("/:id", requireAuth, requireRole("Admin"), remove);

export default forecastRouter;
