import { Router } from "express";
import { getAllGameLimits, getAllGameSummary, getChildrenProgressSummary, getGameLimit, getGameProgress, getTodayCount, saveGameProgress, setGameLimit } from "../controllers/games.controller";
import { authenticateChild, authenticateParent } from "../middleware/users.middleware";

const router = Router();

router.get('/:game_name/history',
    authenticateChild,
getGameProgress);
router.post('/:game_name',
    authenticateChild,
saveGameProgress);
router.get('/:game_name/today-count', authenticateChild, getTodayCount);
router.get('/summary', authenticateChild, getAllGameSummary);
router.get('/parent/children/progress', authenticateParent, getChildrenProgressSummary);
router.post('/limits', authenticateParent, setGameLimit);
router.get('/limits', authenticateParent, getAllGameLimits);
router.get('/limits/:child_id', authenticateParent, getGameLimit);


export default router;