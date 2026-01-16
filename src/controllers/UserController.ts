import type { Request, Response } from "express";
import type { PrismaClient } from "@prisma/client";
import type { UpdateMyProfileDTO } from "../dtos/user/UpdateMyProfileDTO";
import type { AuthPayload } from "../middlewares/authMiddleware";
import { UserService } from "../services/UserService";

type AuthedRequest = Request & { auth?: AuthPayload };

export function createUserControllers(prisma: PrismaClient) {
  const userService = new UserService(prisma);

  const updateMyProfile = async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthedRequest).auth?.user_id;
      if (!userId) {
        return res.status(401).json({ message: "Token inválido ou ausente." });
      }

      const body = req.body as UpdateMyProfileDTO;

      const result = await userService.updateMyProfile(userId, body);

      return res.status(200).json({
        message: "Perfil atualizado com sucesso.",
        user: result.user,
      });
    } catch (error) {
      console.error("Erro no controller updateMyProfile:", error);
      return res.status(500).json({ error: "Erro ao atualizar perfil." });
    }
  };

  return { updateMyProfile };
}
