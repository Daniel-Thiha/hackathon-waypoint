import type { Severity, FloodType } from "./forecast.types";

export interface FormState {
  title: string;
  lat: string;
  lng: string;
  severity: Severity;
  floodType: FloodType | "";
  radius: string;
  description: string;
}

export const DEFAULT_FORM: FormState = {
  title: "",
  lat: "13.7563",
  lng: "100.5018",
  severity: "low",
  floodType: "",
  radius: "1000",
  description: "",
};
