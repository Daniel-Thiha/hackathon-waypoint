import { Router } from "express";
import { login, logout, me, register } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", me);
authRouter.post("/register", register);

export default authRouter;
