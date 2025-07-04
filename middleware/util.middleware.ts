import { NextFunction, Request, Response } from "express";

const validateEmptyBody = (req: Request, res: Response, next: NextFunction) => {   
    if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).json({ error: "Request body cannot be empty" });
        return;
    }
    next();
}

export {
    validateEmptyBody
}