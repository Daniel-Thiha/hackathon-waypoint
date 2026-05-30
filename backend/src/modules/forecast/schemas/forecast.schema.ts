import type { CreateFloodZoneInput, UpdateFloodZoneInput } from "../types/forecast.types";

const SEVERITIES = ["low", "medium", "high"] as const;
const FLOOD_TYPES = ["flash", "river", "coastal", "urban"] as const;

function isValidSeverity(val: unknown): val is (typeof SEVERITIES)[number] {
  return SEVERITIES.includes(val as (typeof SEVERITIES)[number]);
}

function isValidFloodType(val: unknown): val is (typeof FLOOD_TYPES)[number] {
  return FLOOD_TYPES.includes(val as (typeof FLOOD_TYPES)[number]);
}

export function validateCreateInput(body: unknown): CreateFloodZoneInput {
  const b = body as Record<string, unknown>;

  if (typeof b.title !== "string" || !b.title.trim())
    throw Object.assign(new Error("title is required"), { status: 400 });

  if (!isValidSeverity(b.severity))
    throw Object.assign(new Error("severity must be low, medium, or high"), { status: 400 });

  if (b.floodType !== undefined && !isValidFloodType(b.floodType))
    throw Object.assign(new Error("floodType must be flash, river, coastal, or urban"), { status: 400 });

  const lat = Number(b.lat);
  const lng = Number(b.lng);
  if (isNaN(lat) || lat < -90 || lat > 90)
    throw Object.assign(new Error("lat must be a valid latitude"), { status: 400 });
  if (isNaN(lng) || lng < -180 || lng > 180)
    throw Object.assign(new Error("lng must be a valid longitude"), { status: 400 });

  const radius = Number(b.radius);
  if (isNaN(radius) || radius < 100 || radius > 50000)
    throw Object.assign(new Error("radius must be between 100 and 50000 meters"), { status: 400 });

  return {
    title: b.title.trim(),
    severity: b.severity,
    floodType: b.floodType as CreateFloodZoneInput["floodType"],
    lat, lng, radius,
    description: typeof b.description === "string" ? b.description.trim() || undefined : undefined,
  };
}

export function validateUpdateInput(body: unknown): UpdateFloodZoneInput {
  const b = body as Record<string, unknown>;
  const result: UpdateFloodZoneInput = {};

  if (b.title !== undefined) {
    if (typeof b.title !== "string" || !b.title.trim())
      throw Object.assign(new Error("title cannot be empty"), { status: 400 });
    result.title = b.title.trim();
  }

  if (b.severity !== undefined) {
    if (!isValidSeverity(b.severity))
      throw Object.assign(new Error("severity must be low, medium, or high"), { status: 400 });
    result.severity = b.severity;
  }

  if (b.floodType !== undefined) {
    if (b.floodType !== null && !isValidFloodType(b.floodType))
      throw Object.assign(new Error("floodType must be flash, river, coastal, urban, or null"), { status: 400 });
    result.floodType = (b.floodType as UpdateFloodZoneInput["floodType"]) ?? null;
  }

  if (b.radius !== undefined) {
    const radius = Number(b.radius);
    if (isNaN(radius) || radius < 100 || radius > 50000)
      throw Object.assign(new Error("radius must be between 100 and 50000 meters"), { status: 400 });
    result.radius = radius;
  }

  if (b.description !== undefined) {
    result.description = typeof b.description === "string" ? b.description.trim() || null : null;
  }

  return result;
}
