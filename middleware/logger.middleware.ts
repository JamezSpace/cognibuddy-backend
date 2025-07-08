import { Request, Response, NextFunction } from 'express';

const logRequests = (req: Request, res: Response, next: NextFunction) => {
  console.log('--- Incoming Request ---');
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Query Params:', JSON.stringify(req.query, null, 2));
  console.log('------------------------');
  next();
};

export default logRequests;
