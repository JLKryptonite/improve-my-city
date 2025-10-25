export type Role = "developer_admin" | "authority_admin";

export function requireRole(role: Role) {
        return (req: any, res: any, next: any) => {
                const user = req.user as { role?: Role } | undefined;
                if (!user || user.role !== role)
                        return res.status(403).json({ error: "Forbidden" });
                next();
        };
}

export function requireAnyRole(roles: Role[]) {
        return (req: any, res: any, next: any) => {
                const user = req.user as { role?: Role } | undefined;
                if (!user || !roles.includes(user.role!))
                        return res.status(403).json({ error: "Forbidden" });
                next();
        };
}
