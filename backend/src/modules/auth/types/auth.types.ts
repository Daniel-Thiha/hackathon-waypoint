export type UserRole = "Admin" | "RescueTeam";

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  name: string | null;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  password: string;
  name?: string;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
}
