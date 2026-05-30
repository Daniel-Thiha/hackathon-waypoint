import type { LoginInput, RegisterInput, RescuerType } from "../types/auth.types";

export function validateLoginInput(body: unknown): LoginInput {
  const { username, password } = body as Record<string, unknown>;
  if (typeof username !== "string" || !username.trim()) {
    throw Object.assign(new Error("Username is required"), { status: 400 });
  }
  if (typeof password !== "string" || !password) {
    throw Object.assign(new Error("Password is required"), { status: 400 });
  }
  return { username: username.trim(), password };
}

const VALID_RESCUER_TYPES = ["PrivateTeam", "GovernmentTeam"] as const;

export function validateRegisterInput(body: unknown): RegisterInput {
  const { username, password, role, name, rescuerType } = body as Record<string, unknown>;

  if (typeof username !== "string" || !username.trim()) {
    throw Object.assign(new Error("Username is required"), { status: 400 });
  }
  if (username.trim().length < 3) {
    throw Object.assign(new Error("Username must be at least 3 characters"), { status: 400 });
  }
  if (typeof password !== "string" || password.length < 6) {
    throw Object.assign(new Error("Password must be at least 6 characters"), { status: 400 });
  }
  if (role !== "Volunteer" && role !== "RescueTeam") {
    throw Object.assign(new Error("Invalid role"), { status: 400 });
  }
  if (role === "RescueTeam") {
    if (typeof name !== "string" || !name.trim()) {
      throw Object.assign(new Error("Organization name is required"), { status: 400 });
    }
    if (!VALID_RESCUER_TYPES.includes(rescuerType as (typeof VALID_RESCUER_TYPES)[number])) {
      throw Object.assign(new Error("Invalid rescuer type"), { status: 400 });
    }
  }

  return {
    username: username.trim(),
    password,
    role: role as "Volunteer" | "RescueTeam",
    name: typeof name === "string" ? name.trim() : undefined,
    rescuerType: role === "RescueTeam" ? (rescuerType as RescuerType) : undefined,
  };
}
