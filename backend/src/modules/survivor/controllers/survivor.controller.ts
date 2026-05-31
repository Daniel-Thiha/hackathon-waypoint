import type { Request, Response, NextFunction } from "express";
import {
  validateCreateRegistration,
  validateCreateSos,
  validateUpdateLocation,
} from "../schemas/survivor.schema";
import {
  createRegistration,
  getRegistrationByReferenceId,
  createSosRequest,
  getAllSosRequests,
  getSosRequestById,
  getSosRequestByDeviceId,
  updateSosSafePlaceId,
  updateSosLocation,
} from "../models/survivor.model";

// ── Registration ─────────────────────────────────────────────────────────────

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = validateCreateRegistration(req.body);
    const registration = await createRegistration(input);
    res.status(201).json(registration);
  } catch (err) { next(err); }
}

export async function getRegistration(req: Request, res: Response, next: NextFunction) {
  try {
    const referenceId = String(req.params.referenceId);
    const registration = await getRegistrationByReferenceId(referenceId);
    if (!registration) throw Object.assign(new Error("Registration not found"), { status: 404 });
    res.json(registration);
  } catch (err) { next(err); }
}

// ── SOS ──────────────────────────────────────────────────────────────────────

export async function createSos(req: Request, res: Response, next: NextFunction) {
  try {
    const input = validateCreateSos(req.body);
    const sos = await createSosRequest(input);
    res.status(201).json(sos);
  } catch (err) { next(err); }
}

export async function listSos(_req: Request, res: Response, next: NextFunction) {
  try {
    const requests = await getAllSosRequests();
    res.json(requests);
  } catch (err) { next(err); }
}

export async function getSos(req: Request, res: Response, next: NextFunction) {
  try {
    const sos = await getSosRequestById(Number(req.params.id));
    if (!sos) throw Object.assign(new Error("SOS request not found"), { status: 404 });
    res.json(sos);
  } catch (err) { next(err); }
}

// Public — survivor polls their own SOS status by ID (no name/phone/location exposed)
export async function getSosStatusPublic(req: Request, res: Response, next: NextFunction) {
  try {
    const sos = await getSosRequestById(Number(req.params.id));
    if (!sos) throw Object.assign(new Error("SOS request not found"), { status: 404 });
    res.json({ id: sos.id, status: sos.status, assignedRescuerId: sos.assignedRescuerId });
  } catch (err) { next(err); }
}

// Public — survivor looks up their own SOS by deviceId to restore session state
// Returns only id + status (no PII exposed)
export async function getSosByDevice(req: Request, res: Response, next: NextFunction) {
  try {
    const deviceId = String(req.query.deviceId ?? "").trim();
    if (!deviceId) { res.json(null); return; }
    const sos = await getSosRequestByDeviceId(deviceId);
    if (!sos) { res.json(null); return; }
    res.json({ id: sos.id, status: sos.status });
  } catch (err) { next(err); }
}

export async function setSosShelter(req: Request, res: Response, next: NextFunction) {
  try {
    const sosId = Number(req.params.id);
    const safePlaceId = Number((req.body as Record<string, unknown>).safePlaceId);
    if (!safePlaceId) throw Object.assign(new Error("safePlaceId is required"), { status: 400 });
    const sos = await updateSosSafePlaceId(sosId, safePlaceId);
    res.json(sos);
  } catch (err) { next(err); }
}

export async function updateLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const input = validateUpdateLocation(req.body);
    const sos = await updateSosLocation(Number(req.params.id), input);
    res.json(sos);
  } catch (err) { next(err); }
}
