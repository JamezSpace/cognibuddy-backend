import { Router } from "express";
import { getAllUsers } from "../controllers/users.controller";
import { authenticateAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get('/users', authenticateAdmin, getAllUsers);

export default router;
