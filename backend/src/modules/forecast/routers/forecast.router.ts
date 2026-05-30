import { Router } from "express";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware";
import { list, getById, create, update, remove } from "../controllers/forecast.controller";

const forecastRouter = Router();

// Public — all users see the flood zones on the map
forecastRouter.get("/", list);
forecastRouter.get("/:id", getById);

// Admin only — publish, edit, remove flood zones
forecastRouter.post("/", requireAuth, requireRole("Admin"), create);
forecastRouter.put("/:id", requireAuth, requireRole("Admin"), update);
forecastRouter.delete("/:id", requireAuth, requireRole("Admin"), remove);

export default forecastRouter;
