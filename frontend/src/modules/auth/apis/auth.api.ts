import api from "../../../api";
import type { AuthUser, RegisterInput, PendingRescuer } from "../types/auth.types";

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

export async function getMe(): Promise<AuthUser | null> {
  try {
    const res = await api.get<{ user: AuthUser }>("/auth/me");
    return res.data.user;
  } catch {
    return null;
  }
}

export async function getPendingRescuers(): Promise<PendingRescuer[]> {
  const res = await api.get<{ rescuers: PendingRescuer[] }>("/auth/pending");
  return res.data.rescuers;
}

export async function approveRescuer(id: number, action: "approve" | "reject"): Promise<void> {
  await api.patch(`/auth/rescuers/${id}`, { action });
}
