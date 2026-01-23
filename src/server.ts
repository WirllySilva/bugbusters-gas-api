import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from '@prisma/client'; 
import authRoutes from "./routes/auth.routes";
import consumptionRoutes from "./routes/consumption.routes";
import { startFakeSensor } from "./fake-sensor";
import userRoutes from "./routes/user.routes";
import orderRoutes from "./routes/order.routes";
import notificationRoutes from "./routes/notification.routes";
import alertRoutes from "./routes/alert.routes";
import pushRoutes from "./routes/push.routes";


// INICIALIZAÇÃO DO PRISMA: Acontece APÓS o dotenv.config()
const prisma = new PrismaClient(); 

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api", consumptionRoutes);
app.use("/api", orderRoutes);

// Passa o cliente Prisma para as rotas:
app.use("/api", authRoutes(prisma)); 
app.use("/api", userRoutes(prisma));
app.use("/api/notifications", notificationRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/alerts", alertRoutes);

app.get("/", (req, res) => {
    res.send("BugBusters Gas API is running!");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

startFakeSensor();