import type { CreateFloodZoneInput, UpdateFloodZoneInput, FloodSeverity } from "../types/forecast.types";

const VALID_SEVERITIES: FloodSeverity[] = ["low", "medium", "high"];

export function validateCreateFloodZone(body: unknown): CreateFloodZoneInput {
  const { title, severity, lat, lng, radius, description } = body as Record<string, unknown>;
  if (typeof title !== "string" || !title.trim())
    throw Object.assign(new Error("title is required"), { status: 400 });
  if (!VALID_SEVERITIES.includes(severity as FloodSeverity))
    throw Object.assign(new Error("severity must be low | medium | high"), { status: 400 });
  if (typeof lat !== "number" || typeof lng !== "number")
    throw Object.assign(new Error("lat and lng are required numbers"), { status: 400 });
  return {
    title: title.trim(),
    severity: severity as FloodSeverity,
    lat,
    lng,
    radius: typeof radius === "number" ? radius : 1000,
    description: typeof description === "string" ? description.trim() || undefined : undefined,
  };
}

export function validateUpdateFloodZone(body: unknown): UpdateFloodZoneInput {
  const { title, severity, lat, lng, radius, description } = body as Record<string, unknown>;
  const input: UpdateFloodZoneInput = {};
  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim())
      throw Object.assign(new Error("title must be non-empty"), { status: 400 });
    input.title = title.trim();
  }
  if (severity !== undefined) {
    if (!VALID_SEVERITIES.includes(severity as FloodSeverity))
      throw Object.assign(new Error("severity must be low | medium | high"), { status: 400 });
    input.severity = severity as FloodSeverity;
  }
  if (lat !== undefined) {
    if (typeof lat !== "number") throw Object.assign(new Error("lat must be a number"), { status: 400 });
    input.lat = lat;
  }
  if (lng !== undefined) {
    if (typeof lng !== "number") throw Object.assign(new Error("lng must be a number"), { status: 400 });
    input.lng = lng;
  }
  if (radius !== undefined) {
    if (typeof radius !== "number") throw Object.assign(new Error("radius must be a number"), { status: 400 });
    input.radius = radius;
  }
  if (description !== undefined) {
    input.description = typeof description === "string" ? description.trim() || undefined : undefined;
  }
  return input;
}
