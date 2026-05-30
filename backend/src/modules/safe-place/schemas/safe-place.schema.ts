import type { CreateSafePlaceInput, UpdateSafePlaceInput } from "../types/safe-place.types";

export function validateCreateSafePlace(body: unknown): CreateSafePlaceInput {
  const b = body as Record<string, unknown>;
  if (typeof b.name !== "string" || !b.name.trim())
    throw Object.assign(new Error("name is required"), { status: 400 });
  if (typeof b.lat !== "number" || typeof b.lng !== "number")
    throw Object.assign(new Error("lat and lng must be numbers"), { status: 400 });
  if (typeof b.capacity !== "number" || b.capacity < 1)
    throw Object.assign(new Error("capacity must be a positive number"), { status: 400 });
  return {
    name: (b.name as string).trim(),
    description: typeof b.description === "string" ? b.description : undefined,
    lat: b.lat,
    lng: b.lng,
    capacity: b.capacity,
    hasFood: b.hasFood === true,
    hasWater: b.hasWater === true,
    supplies: typeof b.supplies === "string" ? b.supplies : undefined,
  };
}

export function validateUpdateSafePlace(body: unknown): UpdateSafePlaceInput {
  const b = body as Record<string, unknown>;
  const input: UpdateSafePlaceInput = {};
  if (b.name !== undefined) input.name = String(b.name).trim();
  if (b.description !== undefined) input.description = String(b.description);
  if (b.capacity !== undefined) input.capacity = Number(b.capacity);
  if (b.hasFood !== undefined) input.hasFood = Boolean(b.hasFood);
  if (b.hasWater !== undefined) input.hasWater = Boolean(b.hasWater);
  if (b.supplies !== undefined) input.supplies = String(b.supplies);
  return input;
}
