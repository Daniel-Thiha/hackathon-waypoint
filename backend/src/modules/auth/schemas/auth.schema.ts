import type { LoginInput } from "../types/auth.types";

const VALID_ROLES = ["Admin", "RescueTeam"] as const;

export function validateLoginInput(body: unknown): LoginInput {
  const { username, password, role } = body as Record<string, unknown>;
  if (typeof username !== "string" || !username.trim()) {
    throw Object.assign(new Error("Username is required"), { status: 400 });
  }
  if (typeof password !== "string" || !password) {
    throw Object.assign(new Error("Password is required"), { status: 400 });
  }
  if (!VALID_ROLES.includes(role as (typeof VALID_ROLES)[number])) {
    throw Object.assign(new Error("Invalid role"), { status: 400 });
  }
  return {
    username: username.trim(),
    password,
    role: role as LoginInput["role"],
  };
}
