import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';

// Example user data (replace with your DB/user service)
const users = [
    { username: 'admin', passwordHash: bcrypt.hashSync('adminpass', 10), role: 'admin' },
    { username: 'user', passwordHash: bcrypt.hashSync('userpass', 10), role: 'user' },
];
export function signup(req: Request, res: Response) {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password, and role are required' });
    }

    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    users.push({ username, passwordHash, role });
    res.status(201).json({ message: 'User registered successfully' });
}

export function login(req: Request, res: Response, next: NextFunction) {
    authorize(['admin', 'user'])(req, res, (err?: any) => {
        if (err) return next(err);
        res.status(200).json({ message: 'Login successful', user: (req as any).user });
    });
}
// Middleware factory for role-based auth
export function authorize(allowedRoles: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { username, password } = req.body;

        // Find user
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        // Check password
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        // Check role
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: 'Forbidden: insufficient role' });
        }

        // Attach user info to request
        (req as any).user = { username: user.username, role: user.role };
        next();
    };
}