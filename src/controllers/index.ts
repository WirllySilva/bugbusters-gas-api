import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type { role } from '@prisma/client';
import { AuthService } from '../services/auth.service'; // Importa o seu novo serviço

// Função que cria o controller e recebe o banco de dados (Prisma)
export function createAuthControllers(prisma: PrismaClient) {
    
    // Instancia 
    const authService = new AuthService(prisma);

    // ----------------------------------------------------------------------
    // 2. Rota: Solicitar Código 
    // ----------------------------------------------------------------------
    const sendOtp = async (req: Request, res: Response) => {
        try {
            // Apenas extrai os dados
            const { phone, role } = req.body as { phone: string, role: role };

            // Validação básica de entrada
            if (!phone || !role) {
                return res.status(400).json({ message: 'Telefone e Role são obrigatórios.' });
            }
           
            const result = await authService.sendOtpService(phone, role);

            // Devolve a resposta
            return res.status(200).json({
                message: 'Código OTP enviado com sucesso.',
                dev_otp: result.otpCode // (Remova isso em produção)
            });

        } catch (error) {
            console.error('Erro no controller sendOtp:', error);
            return res.status(500).json({ error: 'Erro interno ao processar solicitação.' });
        }
    };

    // ----------------------------------------------------------------------
    // 3. Rota: Verificar Código e Logar 
    // ----------------------------------------------------------------------
    const verifyOtp = async (req: Request, res: Response) => {
        try {
            const { phone, otp_code } = req.body;

            if (!phone || !otp_code) {
                return res.status(400).json({ message: 'Telefone e Código OTP são obrigatórios.' });
            }

            // validar
            const result = await authService.verifyOtpService(phone, otp_code);

            // Se deu certo, devolve o Token
            return res.status(200).json({
                message: 'Login bem-sucedido.',
                token: result.token,
                user: result.user
            });

        } catch (error) {
            
            const err = error as Error;

            if (err.message === 'Código inválido' || err.message === 'Código expirado') {
                return res.status(401).json({ message: err.message });
            } else if (err.message === 'Usuário não encontrado') {
                return res.status(404).json({ message: err.message });
            }

            console.error('Erro no controller verifyOtp:', err);
            return res.status(500).json({ error: 'Falha na autenticação.' });
        }
    };

    // Retorna as funções prontas para as rotas
    return { sendOtp, verifyOtp };
}