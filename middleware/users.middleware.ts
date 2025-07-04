import { NextFunction, Request, Response } from "express";

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

export {
    validatePostBodyRequest
}