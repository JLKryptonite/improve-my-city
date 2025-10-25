import jwt from "jsonwebtoken";
import { CONFIG } from "../config.js";

export function verifyJwt(req: any, _res: any, next: any) {
        const hdr = req.headers.authorization || "";
        const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
        if (!token) return next(); // public routes may be unauthenticated
        try {
                req.user = jwt.verify(token, CONFIG.JWT_SECRET);
        } catch {
                // ignore, user stays unauthenticated for public routes
        }
        next();
}
