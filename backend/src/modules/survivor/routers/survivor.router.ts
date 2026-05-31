import { Router } from "express";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware";
import {
  register,
  getRegistration,
  createSos,
  listSos,
  getSos,
  getSosStatusPublic,
  getSosByDevice,
  setSosShelter,
  updateLocation,
} from "../controllers/survivor.controller";

const survivorRouter = Router();

// Public — survivors register and send SOS without logging in
survivorRouter.post("/register", register);
survivorRouter.get("/register/:referenceId", getRegistration);
survivorRouter.post("/sos", createSos);
survivorRouter.get("/sos/:id/status", getSosStatusPublic); // status-only, no PII
survivorRouter.patch("/sos/:id/location", updateLocation);
survivorRouter.patch("/sos/:id/shelter", setSosShelter);

// Public list — all roles (including unauthenticated survivors) see pins on the shared map
survivorRouter.get("/sos", listSos);
// Device session restore — returns only id+status, no PII (must be before /:id)
survivorRouter.get("/sos/by-device", getSosByDevice);
// Detail requires staff auth — contains full PII
survivorRouter.get("/sos/:id", requireAuth, requireRole("Admin", "RescueTeam"), getSos);

export default survivorRouter;
