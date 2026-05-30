import type { LoginInput, RegisterInput } from "../types/auth.types";

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

export function validateRegisterInput(body: unknown): RegisterInput {
  const { username, password, name } = body as Record<string, unknown>;

  if (typeof username !== "string" || !username.trim()) {
    throw Object.assign(new Error("Username is required"), { status: 400 });
  }
  if (username.trim().length < 3) {
    throw Object.assign(new Error("Username must be at least 3 characters"), { status: 400 });
  }
  if (typeof password !== "string" || password.length < 6) {
    throw Object.assign(new Error("Password must be at least 6 characters"), { status: 400 });
  }

  return {
    username: username.trim(),
    password,
    name: typeof name === "string" && name.trim() ? name.trim() : undefined,
  };
}
