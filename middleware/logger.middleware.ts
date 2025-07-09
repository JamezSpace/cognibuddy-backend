import { Request, Response, NextFunction } from 'express';

const logRequests = (req: Request, res: Response, next: NextFunction) => {
    console.log('--- Incoming Request ---');
    console.log('Method:', req.method);
    console.log('URL:', req.originalUrl);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    

    if (req.query && Object.keys(req.query).length > 0) {
        console.log('Query Params:', JSON.stringify(req.query, null, 2));
    }
    console.log('------------------------');
    next();
};

export default logRequests;
