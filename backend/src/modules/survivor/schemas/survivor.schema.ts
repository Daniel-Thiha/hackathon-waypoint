import type { CreateRegistrationInput, CreateSosInput, UpdateLocationInput } from "../types/survivor.types";

export function validateCreateRegistration(body: unknown): CreateRegistrationInput {
  const b = body as Record<string, unknown>;
  if (typeof b.name !== "string" || !b.name.trim())
    throw Object.assign(new Error("name is required"), { status: 400 });
  if (typeof b.lat !== "number" || typeof b.lng !== "number")
    throw Object.assign(new Error("lat and lng must be numbers"), { status: 400 });
  if (typeof b.safePlaceId !== "number")
    throw Object.assign(new Error("safePlaceId is required"), { status: 400 });
  return {
    name: (b.name as string).trim(),
    phone: typeof b.phone === "string" ? b.phone.trim() : undefined,
    lat: b.lat,
    lng: b.lng,
    safePlaceId: b.safePlaceId,
  };
}

export function validateCreateSos(body: unknown): CreateSosInput {
  const b = body as Record<string, unknown>;
  if (typeof b.survivorName !== "string" || b.survivorName.trim().length < 2)
    throw Object.assign(new Error("Name must be at least 2 characters"), { status: 400 });
  if (typeof b.lat !== "number" || typeof b.lng !== "number")
    throw Object.assign(new Error("lat and lng must be numbers"), { status: 400 });
  return {
    deviceId: typeof b.deviceId === "string" && b.deviceId.trim() ? b.deviceId.trim() : undefined,
    survivorName: (b.survivorName as string).trim(),
    phone: typeof b.phone === "string" ? b.phone.trim() : undefined,
    lat: b.lat,
    lng: b.lng,
    notes: typeof b.notes === "string" ? b.notes.trim() : undefined,
    safePlaceId: typeof b.safePlaceId === "number" ? b.safePlaceId : undefined,
  };
}

export function validateUpdateLocation(body: unknown): UpdateLocationInput {
  const b = body as Record<string, unknown>;
  if (typeof b.lat !== "number" || typeof b.lng !== "number")
    throw Object.assign(new Error("lat and lng must be numbers"), { status: 400 });
  return { lat: b.lat, lng: b.lng };
}
