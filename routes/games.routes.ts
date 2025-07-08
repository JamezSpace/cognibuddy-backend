import { Router } from "express";
import { getAllGameSummary, getGameProgress, saveGameProgress } from "../controllers/games.controller";
import { authenticateChild } from "../middleware/users.middleware";

const router = Router();

router.get('/:game_name/history',
    authenticateChild,
getGameProgress);
router.post('/:game_name',
    authenticateChild,
saveGameProgress);
router.get('/summary', authenticateChild, getAllGameSummary);




export default router;