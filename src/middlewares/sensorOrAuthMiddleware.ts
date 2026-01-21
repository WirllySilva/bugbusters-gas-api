import { Request, Response, NextFunction } from "express";
import { requireAuth } from "./authMiddleware";

function getHeader(req: Request, name: string): string | undefined {
    const value = req.headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
}

export function requireSensorOrAuth(req: Request, res: Response, next: NextFunction) {
    const sensorKey = getHeader(req, "x-sensor-key");
    const expectedKey = process.env.SENSOR_API_KEY;

    if (expectedKey && sensorKey === expectedKey) {
        return next();
    }

    return requireAuth(req, res, next);
}
