import api from "../../../api";
import type { SafePlace, CreateSafePlaceInput, SupplyScheduleEntry } from "../types/safe-place.types";

function parse(place: SafePlace & { supplies: string | null }): SafePlace {
  return {
    ...place,
    supplies: place.supplies ? (JSON.parse(place.supplies) as SupplyScheduleEntry[]) : null,
  };
}

export async function listSafePlaces(): Promise<SafePlace[]> {
  const res = await api.get<(SafePlace & { supplies: string | null })[]>("/safe-place");
  return Array.isArray(res.data) ? res.data.map(parse) : [];
}

export async function getSafePlace(id: number): Promise<SafePlace> {
  const res = await api.get<SafePlace & { supplies: string | null }>(`/safe-place/${id}`);
  return parse(res.data);
}

export async function createSafePlace(input: CreateSafePlaceInput): Promise<SafePlace> {
  const body = {
    ...input,
    supplies: input.supplies ? JSON.stringify(input.supplies) : undefined,
  };
  const res = await api.post<SafePlace & { supplies: string | null }>("/safe-place", body);
  return parse(res.data);
}

export async function updateSafePlace(
  id: number,
  input: Partial<CreateSafePlaceInput>
): Promise<SafePlace> {
  const body = {
    ...input,
    supplies: input.supplies ? JSON.stringify(input.supplies) : undefined,
  };
  const res = await api.put<SafePlace & { supplies: string | null }>(`/safe-place/${id}`, body);
  return parse(res.data);
}

export async function deleteSafePlace(id: number): Promise<void> {
  await api.delete(`/safe-place/${id}`);
}
