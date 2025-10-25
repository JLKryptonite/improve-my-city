import { CONFIG } from "../config.js";

export function requireDevKey(req: any, res: any, next: any) {
        const key = req.headers["x-dev-key"];
        if (key !== CONFIG.DEV_ADMIN_KEY)
                return res.status(403).json({ error: "Forbidden" });
        // attach dev admin identity
        req.user = { role: "developer_admin", sub: "dev-console" };
        next();
}
