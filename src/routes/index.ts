import { Router } from 'express';
import { createAuthControllers } from '../controllers'; 
import { PrismaClient } from '@prisma/client'; // para tipagem
import providerRoutes from "./ProvidersRoutes";

// função que aceita o cliente Prisma
export default function authRoutes(prisma: PrismaClient) {
    const router = Router();
    
    // Agora, criamos/configuramos o controlador passando o cliente Prisma
    const { sendOtp, verifyOtp } = createAuthControllers(prisma); 

    router.post('/auth/send-otp', sendOtp); 
    router.post('/auth/verify-otp', verifyOtp);

    router.use(providerRoutes(prisma));

    return router;
}