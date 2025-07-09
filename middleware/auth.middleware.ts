import { verify } from "jsonwebtoken";
import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../interfaces/ExtendedRequested.interface";
import { MyJwtPayload } from "../interfaces/MyJwtPayload.interface";

const authenticateToken = (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.sendStatus(401);
        return
    }

    try {
        const decoded = verify(token, process.env.JWT_WEB_SECRET || '');
        req.user = decoded; // contains { id, role }
        next();
    } catch (err) {
        res.sendStatus(403);
        return;
    }
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

const authenticateAdmin = (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return
    }

    try {
        const decoded = verify(token, process.env.JWT_WEB_SECRET || '') as MyJwtPayload;
        if (decoded.role !== 'admin') {
            res.status(403).json({ message: 'Forbidden' });
            return
        }

        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
        return
    }
};


export {
    authenticateToken,
    authorizeRoles,
    authenticateAdmin
};