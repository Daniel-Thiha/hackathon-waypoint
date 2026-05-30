import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../../../middlewares/auth.middleware";
import { validateCreateFloodZone, validateUpdateFloodZone } from "../schemas/forecast.schema";
import {
  createFloodZone,
  updateFloodZone,
  deleteFloodZone,
  findFloodZoneById,
  getAllFloodZones,
} from "../models/forecast.model";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const zones = await getAllFloodZones();
    res.json(zones);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const zone = await findFloodZoneById(Number(req.params.id));
    if (!zone) throw Object.assign(new Error("Flood zone not found"), { status: 404 });
    res.json(zone);
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = validateCreateFloodZone(req.body);
    const zone = await createFloodZone(input, req.user!.userId);
    res.status(201).json(zone);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = validateUpdateFloodZone(req.body);
    const zone = await updateFloodZone(Number(req.params.id), input);
    res.json(zone);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteFloodZone(Number(req.params.id));
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
}
