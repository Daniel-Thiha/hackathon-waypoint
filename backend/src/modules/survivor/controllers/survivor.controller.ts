import type { Request, Response, NextFunction } from "express";
import { listSosRequests } from "../models/survivor.model";

export async function listSosRequestsHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const requests = await listSosRequests();
    res.json(requests);
  } catch (err) { next(err); }
}
