import api from "../../../api";
import type { SosRequest } from "../types/survivor.types";

export async function listSosRequests(): Promise<SosRequest[]> {
  const res = await api.get<SosRequest[]>("/survivor/sos-requests");
  return res.data;
}
