import { Router } from "express";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware";
import {
  listMissions,
  acceptSos,
  completeMissionById,
  listTeamStatuses,
  setAvailability,
  updatePosition,
} from "../controllers/rescue.controller";

const rescueRouter = Router();

// Public — all roles see rescue team positions on the map
rescueRouter.get("/team-status", listTeamStatuses);

// RescueTeam only — manage own missions and status
rescueRouter.get("/missions", requireAuth, requireRole("RescueTeam"), listMissions);
rescueRouter.post("/missions/accept", requireAuth, requireRole("RescueTeam"), acceptSos);
rescueRouter.patch("/missions/:id/complete", requireAuth, requireRole("RescueTeam"), completeMissionById);
rescueRouter.patch("/status/availability", requireAuth, requireRole("RescueTeam"), setAvailability);
rescueRouter.patch("/status/position", requireAuth, requireRole("RescueTeam"), updatePosition);

export default rescueRouter;
