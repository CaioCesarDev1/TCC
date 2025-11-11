import { Router } from "express";
import { loginController } from "../controllers/authController";

export const authRoutes = Router();

authRoutes.post("/login", loginController);


