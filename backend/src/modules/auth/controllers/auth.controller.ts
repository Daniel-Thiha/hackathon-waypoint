import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { validateLoginInput, validateRegisterInput } from "../schemas/auth.schema";
import { findUserByUsername, findUserById, createUser } from "../models/auth.model";
import type { JwtPayload, UserRole, AuthUser } from "../types/auth.types";

const JWT_SECRET = process.env.JWT_SECRET ?? "fallback-dev-secret";
const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function toAuthUser(user: { id: number; username: string; role: string; name: string | null }): AuthUser {
  return {
    id: user.id,
    username: user.username,
    role: user.role as UserRole,
    name: user.name,
  };
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = validateLoginInput(req.body);
    const user = await findUserByUsername(input.username);

    if (!user) {
      throw Object.assign(new Error("Invalid credentials"), { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password);
    if (!passwordMatch) {
      throw Object.assign(new Error("Invalid credentials"), { status: 401 });
    }

    const payload: JwtPayload = { userId: user.id, username: user.username, role: user.role as UserRole };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
    });

    res.json({ user: toAuthUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = validateRegisterInput(req.body);

    const existing = await findUserByUsername(input.username);
    if (existing) {
      throw Object.assign(new Error("Username is already taken"), { status: 409 });
    }

    const user = await createUser(input);
    res.status(201).json({ user: toAuthUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie(COOKIE_NAME);
  res.json({ message: "Logged out" });
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies[COOKIE_NAME] as string | undefined;
    if (!token) {
      throw Object.assign(new Error("Not authenticated"), { status: 401 });
    }

    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await findUserById(payload.userId);
    if (!user) {
      throw Object.assign(new Error("Not authenticated"), { status: 401 });
    }

    res.json({ user: toAuthUser(user) });
  } catch (err) {
    const name = (err as Error).name;
    if (name === "JsonWebTokenError" || name === "TokenExpiredError") {
      next(Object.assign(new Error("Invalid or expired token"), { status: 401 }));
    } else {
      next(err);
    }
  }
}
