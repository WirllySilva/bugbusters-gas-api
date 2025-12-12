import express from "express";
import cors from "cors";
import { PrismaClient } from '@prisma/client'; 
import authRoutes from "./routes/index"; 


// INICIALIZAÇÃO DO PRISMA: Acontece APÓS o dotenv.config()
const prisma = new PrismaClient(); 

const app = express();

app.use(cors());
app.use(express.json());

// Passa o cliente Prisma para as rotas:
app.use("/api", authRoutes(prisma)); 

app.get("/", (req, res) => {
    res.send("BugBusters Gas API is running!");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});