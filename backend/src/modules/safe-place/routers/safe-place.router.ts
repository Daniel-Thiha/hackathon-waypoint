import { Router } from "express";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware";
import { list, create, update, remove } from "../controllers/safe-place.controller";

const safePlaceRouter = Router();

safePlaceRouter.get("/", list);
safePlaceRouter.post("/", requireAuth, requireRole("Admin"), create);
safePlaceRouter.put("/:id", requireAuth, requireRole("Admin"), update);
safePlaceRouter.delete("/:id", requireAuth, requireRole("Admin"), remove);

export default safePlaceRouter;
