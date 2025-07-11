import { Router } from "express";
import { getAllUsers } from "../controllers/users.controller";
import { authenticateAdmin } from "../middleware/auth.middleware";
import { deleteUser, updateUser } from "../controllers/admin.controller";

const router = Router();

router.get('/users', authenticateAdmin, getAllUsers);
router.put('/users/:id', authenticateAdmin, updateUser);
router.delete('/users/:id', authenticateAdmin, deleteUser)

export default router;
