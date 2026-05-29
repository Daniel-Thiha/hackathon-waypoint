import { Router } from "express";
import { login, logout, me } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", me);

export default authRouter;
