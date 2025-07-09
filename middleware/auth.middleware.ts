import { verify } from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../interfaces/ExtendedRequested.interface";

const JWT_SECRET = process.env.JWT_SECRET || '';

const authenticateToken = (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.sendStatus(401);
        return
    }

    verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            res.sendStatus(403);
            return;
        }

        req.user = decoded; // contains { id, role }
        next();
    });
}


const authorizeRoles = (...roles: any[]) => {
    return (req: ExtendedRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Access denied: insufficient role' });
            return;
        }
        next();
    };
}

export {
    authenticateToken,
    authorizeRoles
};