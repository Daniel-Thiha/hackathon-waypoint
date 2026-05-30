import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth.middleware";
import { listSosRequestsHandler } from "../controllers/survivor.controller";

const survivorRouter = Router();

survivorRouter.get("/sos-requests", requireAuth, listSosRequestsHandler);

export default survivorRouter;
