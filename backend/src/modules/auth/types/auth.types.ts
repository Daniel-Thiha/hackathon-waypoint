export type UserRole = "Admin" | "RescueTeam";

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
}

export interface LoginInput {
  username: string;
  password: string;
  role: UserRole;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
}
