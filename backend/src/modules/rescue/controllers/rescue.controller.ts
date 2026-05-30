import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../../../middlewares/auth.middleware";
import {
  validateAcceptSos,
  validateUpdatePosition,
  validateSetAvailability,
} from "../schemas/rescue.schema";
import {
  createMission,
  getActiveMissions,
  completeMission,
  getAllTeamStatuses,
  upsertTeamStatus,
  updateTeamPosition,
} from "../models/rescue.model";
import { assignSosRequest, completeSosRequest } from "../../survivor/models/survivor.model";

// ── Missions ─────────────────────────────────────────────────────────────────

export async function listMissions(_req: Request, res: Response, next: NextFunction) {
  try {
    const missions = await getActiveMissions();
    res.json(missions);
  } catch (err) { next(err); }
}

export async function acceptSos(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { sosRequestId } = validateAcceptSos(req.body);
    const rescuerId = req.user!.userId;
    await assignSosRequest(sosRequestId, rescuerId);
    const mission = await createMission(sosRequestId, rescuerId);
    res.status(201).json(mission);
  } catch (err) { next(err); }
}

export async function completeMissionById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const mission = await completeMission(id);
    await completeSosRequest(mission.sosRequestId);
    res.json(mission);
  } catch (err) { next(err); }
}

// ── Team Status ───────────────────────────────────────────────────────────────

export async function listTeamStatuses(_req: Request, res: Response, next: NextFunction) {
  try {
    const statuses = await getAllTeamStatuses();
    res.json(statuses);
  } catch (err) { next(err); }
}

export async function setAvailability(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = validateSetAvailability(req.body);
    const status = await upsertTeamStatus(req.user!.userId, input);
    res.json(status);
  } catch (err) { next(err); }
}

export async function updatePosition(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = validateUpdatePosition(req.body);
    const status = await updateTeamPosition(req.user!.userId, input);
    res.json(status);
  } catch (err) { next(err); }
}
