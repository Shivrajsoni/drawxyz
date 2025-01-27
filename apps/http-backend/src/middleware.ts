import { NextFunction,Request,Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
export const middleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = (req.headers["authorization"] as string) ?? "";

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    if (decoded.userId) {
        (req as any).userId = decoded.userId;
        next();
    }else{
        res.status(403).json({
            message:"Unauthorized"
        })
    }

    console.log("Middleware is running");
}