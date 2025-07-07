import { Router, Request, Response } from "express";
import { signUp, login, refreshToken } from "../controllers/auth.controller";
import { validateEmptyBody } from "../middleware/util.middleware";

const router = Router()

router.post('/signup', validateEmptyBody, signUp);
router.post('/login', validateEmptyBody, login);
router.post('/refresh', validateEmptyBody, refreshToken);
router.post('/logout', (req: Request, res: Response) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    });

    res.status(200).json({ message: 'Logged out successfully' });
    return;
});

export default router;