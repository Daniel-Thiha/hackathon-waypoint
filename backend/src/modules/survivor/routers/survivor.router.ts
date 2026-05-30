import { Router } from "express";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware";
import {
  register,
  getRegistration,
  createSos,
  listSos,
  getSos,
  getSosStatusPublic,
  updateLocation,
} from "../controllers/survivor.controller";

const survivorRouter = Router();

// Public — survivors register and send SOS without logging in
survivorRouter.post("/register", register);
survivorRouter.get("/register/:referenceId", getRegistration);
survivorRouter.post("/sos", createSos);
survivorRouter.get("/sos/:id/status", getSosStatusPublic); // status-only, no PII
survivorRouter.patch("/sos/:id/location", updateLocation);

// Staff only — Admin and RescueTeam see all SOS requests
survivorRouter.get("/sos", requireAuth, requireRole("Admin", "RescueTeam"), listSos);
survivorRouter.get("/sos/:id", requireAuth, requireRole("Admin", "RescueTeam"), getSos);

export default survivorRouter;
