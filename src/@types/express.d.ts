import { user } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            user: {
                user_id: string;
                role: string;
            }
        }
    }
}

declare global {
    namespace Express {
        interface Request {
            user: {
                user_id: string;
            }
        }
    }
}