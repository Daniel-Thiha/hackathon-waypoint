import { Router } from "express";
import { login, logout, me, register, getPendingRescuers, approveRescuer } from "../controllers/auth.controller";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/me", me);
authRouter.post("/register", register);

authRouter.get("/pending", requireAuth, requireRole("Admin"), getPendingRescuers);
authRouter.patch("/rescuers/:id", requireAuth, requireRole("Admin"), approveRescuer);

export default authRouter;
