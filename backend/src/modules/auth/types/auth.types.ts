export type UserRole = "Admin" | "Volunteer" | "RescueTeam";
export type RescuerType = "PrivateTeam" | "GovernmentTeam";
export type UserStatus = "active" | "pending" | "rejected";

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  name: string | null;
  rescuerType: RescuerType | null;
  status: UserStatus;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  password: string;
  role: "Volunteer" | "RescueTeam";
  name?: string;
  rescuerType?: RescuerType;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: UserRole;
}
