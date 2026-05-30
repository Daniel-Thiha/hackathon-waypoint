import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../../../middlewares/auth.middleware";
import { validateCreateInput, validateUpdateInput } from "../schemas/safe-place.schema";
import {
  listSafePlaces,
  createSafePlace,
  updateSafePlace,
  deleteSafePlace,
  findSafePlaceById,
} from "../models/safe-place.model";

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const places = await listSafePlaces();
    res.json({ places });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = validateCreateInput(req.body);
    const place = await createSafePlace(input, req.user!.userId);
    res.status(201).json({ place });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw Object.assign(new Error("Invalid id"), { status: 400 });

    const existing = await findSafePlaceById(id);
    if (!existing) throw Object.assign(new Error("Safe place not found"), { status: 404 });
    if (existing.adminId !== req.user!.userId)
      throw Object.assign(new Error("You can only edit your own safe places"), { status: 403 });

    const input = validateUpdateInput(req.body);
    const place = await updateSafePlace(id, input);
    res.json({ place });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw Object.assign(new Error("Invalid id"), { status: 400 });

    const existing = await findSafePlaceById(id);
    if (!existing) throw Object.assign(new Error("Safe place not found"), { status: 404 });
    if (existing.adminId !== req.user!.userId)
      throw Object.assign(new Error("You can only delete your own safe places"), { status: 403 });

    await deleteSafePlace(id);
    res.json({ message: "Safe place deleted" });
  } catch (err) {
    next(err);
  }
}
