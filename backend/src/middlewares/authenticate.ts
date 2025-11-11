import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    cpf?: string;
  };
};

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (env.ENABLE_MOCK_AUTH) {
    req.user = { id: "patient-123" };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Token não informado" });
  }

  const [, token] = authHeader.split(" ");
  if (!token) {
    return res.status(401).json({ message: "Token inválido" });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; cpf?: string };
    req.user = { id: decoded.sub, cpf: decoded.cpf };
    next();
  } catch (error) {
    console.error("Erro ao validar token", error);
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
}


