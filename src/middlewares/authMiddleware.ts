import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  user_id: string;
  role: string;
  phone: string;
}

type AuthedRequest = Request & { auth?: AuthPayload };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token ausente" });
  }

  const token = header.slice("Bearer ".length);

  const secret = process.env.JWT_SECRET;
  
  if (!secret) return res.status(500).json({ message: "JWT_SECRET não configurado" });

  try {
    const payload = jwt.verify(token, secret) as AuthPayload;
    (req as AuthedRequest).auth = payload;;
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}
