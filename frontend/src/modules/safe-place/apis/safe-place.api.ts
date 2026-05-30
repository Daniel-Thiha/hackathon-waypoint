import api from "../../../api";
import type { SafePlace, CreateSafePlaceInput } from "../types/safe-place.types";

export async function listSafePlaces(): Promise<SafePlace[]> {
  const res = await api.get<{ places: SafePlace[] }>("/safe-place");
  return res.data.places;
}

export async function createSafePlace(input: CreateSafePlaceInput): Promise<SafePlace> {
  const res = await api.post<{ place: SafePlace }>("/safe-place", input);
  return res.data.place;
}

export async function deleteSafePlace(id: number): Promise<void> {
  await api.delete(`/safe-place/${id}`);
}

export async function updateSafePlace(
  id: number,
  input: Partial<CreateSafePlaceInput>
): Promise<SafePlace> {
  const res = await api.put<{ place: SafePlace }>(`/safe-place/${id}`, input);
  return res.data.place;
}
