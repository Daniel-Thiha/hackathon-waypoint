import type { CreateSafePlaceInput, UpdateSafePlaceInput } from "../types/safe-place.types";

export function validateCreateInput(body: unknown): CreateSafePlaceInput {
  const b = body as Record<string, unknown>;

  if (typeof b.name !== "string" || !b.name.trim())
    throw Object.assign(new Error("name is required"), { status: 400 });

  const lat = Number(b.lat);
  const lng = Number(b.lng);
  if (isNaN(lat) || lat < -90 || lat > 90)
    throw Object.assign(new Error("lat must be a valid latitude"), { status: 400 });
  if (isNaN(lng) || lng < -180 || lng > 180)
    throw Object.assign(new Error("lng must be a valid longitude"), { status: 400 });

  const capacity = Number(b.capacity);
  if (isNaN(capacity) || capacity < 0)
    throw Object.assign(new Error("capacity must be a positive number"), { status: 400 });

  const currentCount = b.currentCount !== undefined ? Number(b.currentCount) : 0;
  if (isNaN(currentCount) || currentCount < 0)
    throw Object.assign(new Error("currentCount must be a non-negative number"), { status: 400 });

  return {
    name: b.name.trim(),
    description: typeof b.description === "string" ? b.description.trim() || undefined : undefined,
    lat,
    lng,
    capacity,
    currentCount,
    hasFood: b.hasFood === true || b.hasFood === "true",
    hasWater: b.hasWater === true || b.hasWater === "true",
    supplies: typeof b.supplies === "string" ? b.supplies : undefined,
  };
}

export function validateUpdateInput(body: unknown): UpdateSafePlaceInput {
  const b = body as Record<string, unknown>;
  const result: UpdateSafePlaceInput = {};

  if (b.name !== undefined) {
    if (typeof b.name !== "string" || !b.name.trim())
      throw Object.assign(new Error("name cannot be empty"), { status: 400 });
    result.name = b.name.trim();
  }

  if (b.description !== undefined) {
    result.description = typeof b.description === "string" ? b.description.trim() || null : null;
  }

  if (b.lat !== undefined) {
    const lat = Number(b.lat);
    if (isNaN(lat) || lat < -90 || lat > 90)
      throw Object.assign(new Error("lat must be a valid latitude"), { status: 400 });
    result.lat = lat;
  }

  if (b.lng !== undefined) {
    const lng = Number(b.lng);
    if (isNaN(lng) || lng < -180 || lng > 180)
      throw Object.assign(new Error("lng must be a valid longitude"), { status: 400 });
    result.lng = lng;
  }

  if (b.capacity !== undefined) {
    const capacity = Number(b.capacity);
    if (isNaN(capacity) || capacity < 0)
      throw Object.assign(new Error("capacity must be a positive number"), { status: 400 });
    result.capacity = capacity;
  }

  if (b.currentCount !== undefined) {
    const currentCount = Number(b.currentCount);
    if (isNaN(currentCount) || currentCount < 0)
      throw Object.assign(new Error("currentCount must be a non-negative number"), { status: 400 });
    result.currentCount = currentCount;
  }

  if (b.hasFood !== undefined) {
    result.hasFood = b.hasFood === true || b.hasFood === "true";
  }

  if (b.hasWater !== undefined) {
    result.hasWater = b.hasWater === true || b.hasWater === "true";
  }

  if (b.supplies !== undefined) {
    result.supplies = typeof b.supplies === "string" ? b.supplies : null;
  }

  return result;
}
