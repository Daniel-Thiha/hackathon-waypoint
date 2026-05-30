import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../../../middlewares/auth.middleware";
import { validateCreateInput, validateUpdateInput } from "../schemas/forecast.schema";
import {
  listFloodZones,
  createFloodZone,
  updateFloodZone,
  deleteFloodZone,
  findFloodZoneById,
} from "../models/forecast.model";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const zones = await listFloodZones();
    res.json({ zones });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = validateCreateInput(req.body);
    const zone = await createFloodZone(input, req.user!.userId);
    res.status(201).json({ zone });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw Object.assign(new Error("Invalid id"), { status: 400 });

    const existing = await findFloodZoneById(id);
    if (!existing) throw Object.assign(new Error("Flood zone not found"), { status: 404 });
    if (existing.adminId !== req.user!.userId)
      throw Object.assign(new Error("You can only edit your own flood zones"), { status: 403 });

    const input = validateUpdateInput(req.body);
    const zone = await updateFloodZone(id, input);
    res.json({ zone });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw Object.assign(new Error("Invalid id"), { status: 400 });

    const existing = await findFloodZoneById(id);
    if (!existing) throw Object.assign(new Error("Flood zone not found"), { status: 404 });
    if (existing.adminId !== req.user!.userId)
      throw Object.assign(new Error("You can only delete your own flood zones"), { status: 403 });

    await deleteFloodZone(id);
    res.json({ message: "Flood zone deleted" });
  } catch (err) {
    next(err);
  }
}
