import api from "../../../api";
import type { AuthUser, RegisterInput } from "../types/auth.types";

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await api.post<{ user: AuthUser }>("/auth/login", { username, password });
  return res.data.user;
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  const res = await api.post<{ user: AuthUser }>("/auth/register", input);
  return res.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

// Deduplicates concurrent calls so React StrictMode's double-effect only fires one request
let getMeInflight: Promise<AuthUser | null> | null = null;

export function getMe(): Promise<AuthUser | null> {
  if (getMeInflight) return getMeInflight;
  getMeInflight = api
    .get<{ user: AuthUser }>("/auth/me")
    .then((res) => res.data.user)
    .catch((): AuthUser | null => null)
    .finally(() => { getMeInflight = null; });
  return getMeInflight;
}
