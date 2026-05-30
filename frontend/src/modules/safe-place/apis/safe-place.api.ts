import api from "../../../api";
import type { SafePlace } from "../types/safe-place.types";

export async function listSafePlaces(): Promise<SafePlace[]> {
  const res = await api.get<SafePlace[]>("/safe-place");
  return Array.isArray(res.data) ? res.data : [];
}
