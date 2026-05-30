import type { Request, Response, NextFunction } from "express";
import { upsertLocation, getActiveLocations, deleteLocation } from "../models/active-location.model";
import type { ActiveRole } from "../types/active-location.types";

const VALID_ROLES: ActiveRole[] = ["Survivor", "Volunteer", "RescueTeam"];

export async function putLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId, role, lat, lng } = req.body as Record<string, unknown>;
    if (typeof sessionId !== "string" || !sessionId.trim()) {
      throw Object.assign(new Error("sessionId is required"), { status: 400 });
    }
    if (!VALID_ROLES.includes(role as ActiveRole)) {
      throw Object.assign(new Error("Invalid role"), { status: 400 });
    }
    if (typeof lat !== "number" || typeof lng !== "number") {
      throw Object.assign(new Error("lat and lng must be numbers"), { status: 400 });
    }

    const loc = await upsertLocation({ sessionId: sessionId.trim(), role: role as ActiveRole, lat, lng });
    res.json({ location: loc });
  } catch (err) {
    next(err);
  }
}

export async function listLocations(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const locations = await getActiveLocations();
    res.json({ locations });
  } catch (err) {
    next(err);
  }
}

export async function removeLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId } = req.body as Record<string, unknown>;
    if (typeof sessionId !== "string" || !sessionId.trim()) {
      throw Object.assign(new Error("sessionId is required"), { status: 400 });
    }
    await deleteLocation(sessionId.trim());
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
