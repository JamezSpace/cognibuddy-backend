import { Router } from "express";
import { getAllGameSummary, getGameLimit, getGameProgress, saveGameProgress, setGameLimit } from "../controllers/games.controller";
import { authenticateChild, authenticateParent } from "../middleware/users.middleware";

const router = Router();

router.get('/:game_name/history',
    authenticateChild,
getGameProgress);
router.post('/:game_name',
    authenticateChild,
saveGameProgress);
router.get('/summary', authenticateChild, getAllGameSummary);
router.post('/', authenticateParent, setGameLimit);
router.get('/:child_id', authenticateParent, getGameLimit);




export default router;