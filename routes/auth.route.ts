import { Router } from "express";
import { signUp, login } from "../controllers/auth.controller";
import { validateEmptyBody } from "../middleware/util.middleware";

const router = Router()

router.post('/signup', validateEmptyBody, signUp);
router.post('/login', validateEmptyBody, login);

export default router;