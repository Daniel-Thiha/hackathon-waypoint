import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload, UserRole } from "../modules/auth/types/auth.types";

const JWT_SECRET = process.env.JWT_SECRET ?? "fallback-dev-secret";

export interface AuthRequest extends Request {
  user?: { userId: number; username: string; role: UserRole };
}

export function requireAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const token = req.cookies["auth_token"] as string | undefined;
  if (!token) {
    return next(
      Object.assign(new Error("Authentication required"), { status: 401 })
    );
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
    };
    next();
  } catch {
    next(
      Object.assign(new Error("Invalid or expired token"), { status: 401 })
    );
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        Object.assign(new Error("Insufficient permissions"), { status: 403 })
      );
    }
    next();
  };
}
