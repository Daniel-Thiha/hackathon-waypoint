import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../../../middlewares/auth.middleware";
import { validateCreateSafePlace, validateUpdateSafePlace } from "../schemas/safe-place.schema";
import {
  getAllSafePlaces,
  getSafePlaceById,
  createSafePlace,
  updateSafePlace,
  deleteSafePlace,
} from "../models/safe-place.model";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const places = await getAllSafePlaces();
    res.json(places);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const place = await getSafePlaceById(Number(req.params.id));
    if (!place) throw Object.assign(new Error("Safe place not found"), { status: 404 });
    res.json(place);
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = validateCreateSafePlace(req.body);
    const place = await createSafePlace(input, req.user!.userId);
    res.status(201).json(place);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = validateUpdateSafePlace(req.body);
    const place = await updateSafePlace(Number(req.params.id), input);
    res.json(place);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteSafePlace(Number(req.params.id));
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
}
