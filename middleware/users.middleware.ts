import { NextFunction, Request, Response } from "express";
import { MyJwtPayload } from "../interfaces/MyJwtPayload.interface";
import { JwtPayload, verify } from "jsonwebtoken";

interface ExtendedRequest extends Request {
    user?: any | JwtPayload;
}

const validatePostBodyRequest = (req: Request, res: Response, next: NextFunction) => {
    const { role, name, email, password } = req.body;
    if (!role) {
        res.status(400).json({ error: "Required fields missing", probableFields: "role" });
        return;
    }
    else if (role === 'child' && (!name || !password)) {
        res.status(400).json({ error: "Required fields missing", probableFields: ['name', 'password'] });
        return;
    }
    else if (role !== 'child' && (!email || !password)) {
        res.status(400).json({ error: "Required fields missing", probableFields: ['email', 'password'] });
        return;
    }
    next();
}

const validateAddChildBodyRequest = (req: Request, res: Response, next: NextFunction) => {
    const { name, pin } = req.body;

    if (!name || !pin) {
        res.status(400).json({ error: "Required fields missing", probableFields: ['name', 'pin'] });
        return;
    }
    next();
}

const authenticateParent = (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verify(token, process.env.JWT_WEB_SECRET || '');

        if (typeof decoded !== 'object' || decoded === null || (decoded as MyJwtPayload).role !== 'parent') {
            res.status(403).json({ error: 'Forbidden: Only parents can perform this action' });
            return;
        }


        req.user = decoded as MyJwtPayload;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
    }
}


const authenticateChild = (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: No token provided' });
        return
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verify(token, process.env.JWT_WEB_SECRET || '') as MyJwtPayload;

        if (decoded.role !== 'child') {
            res.status(403).json({ error: 'Forbidden: Only children can access this resource' });
            return
        }

        req.user = decoded; 
        next();
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return
    }
}


export {
    validatePostBodyRequest,
    validateAddChildBodyRequest,
    authenticateParent,
    authenticateChild
}