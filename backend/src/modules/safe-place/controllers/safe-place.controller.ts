import type { Request, Response, NextFunction } from "express";
import { listSafePlaces } from "../models/safe-place.model";

export async function listSafePlacesHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const places = await listSafePlaces();
    res.json(places);
  } catch (err) { next(err); }
}
