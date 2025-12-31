import { Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
    user_id: string;
}

export  function authMiddleware(
    req: Request, 
    res: Response, 
    next: NextFunction) {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "Token não enviado" });
        }
        const [, token] = authHeader.split(" ");

        try {
            const decoded = jwt.verify (
                token,
                process.env.JWT_SECRET as string) as TokenPayload;
            
        // req.user
        req.user = {
            user_id: decoded.user_id
        }

        next();

        } catch {
            return res.status(401).json({ message: "Token inválido" });
        }
    }