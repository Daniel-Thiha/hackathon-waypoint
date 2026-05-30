import api from "../../../api";
import type { AuthUser } from "../types/auth.types";

export async function login(
  username: string,
  password: string,
  role: string
): Promise<AuthUser> {
  const res = await api.post<{ user: AuthUser }>("/auth/login", {
    username,
    password,
    role,
  });
  return res.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function getMe(): Promise<AuthUser | null> {
  try {
    const res = await api.get<{ user: AuthUser }>("/auth/me");
    return res.data.user;
  } catch {
    return null;
  }
}
