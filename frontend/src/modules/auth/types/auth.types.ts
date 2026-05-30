export type UserRole = "Admin" | "RescueTeam";

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
}
