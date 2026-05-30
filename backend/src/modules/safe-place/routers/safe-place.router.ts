import { Router } from "express";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware";
import { list, getById, create, update, remove } from "../controllers/safe-place.controller";

const safePlaceRouter = Router();

// Public — survivors browse safe places
safePlaceRouter.get("/", list);
safePlaceRouter.get("/:id", getById);

// Admin only — create, edit, remove safe places
safePlaceRouter.post("/", requireAuth, requireRole("Admin"), create);
safePlaceRouter.put("/:id", requireAuth, requireRole("Admin"), update);
safePlaceRouter.delete("/:id", requireAuth, requireRole("Admin"), remove);

export default safePlaceRouter;
