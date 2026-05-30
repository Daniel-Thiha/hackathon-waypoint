import type { AcceptSosInput, UpdatePositionInput, SetAvailabilityInput } from "../types/rescue.types";

export function validateAcceptSos(body: unknown): AcceptSosInput {
  const { sosRequestId } = body as Record<string, unknown>;
  if (typeof sosRequestId !== "number")
    throw Object.assign(new Error("sosRequestId must be a number"), { status: 400 });
  return { sosRequestId };
}

export function validateUpdatePosition(body: unknown): UpdatePositionInput {
  const { lat, lng } = body as Record<string, unknown>;
  if (typeof lat !== "number" || typeof lng !== "number")
    throw Object.assign(new Error("lat and lng must be numbers"), { status: 400 });
  return { lat, lng };
}

export function validateSetAvailability(body: unknown): SetAvailabilityInput {
  const { isAvailable } = body as Record<string, unknown>;
  if (typeof isAvailable !== "boolean")
    throw Object.assign(new Error("isAvailable must be a boolean"), { status: 400 });
  return { isAvailable };
}
