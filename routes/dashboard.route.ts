import express, { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/auth.middleware';
import { authenticateChild } from '../middleware/users.middleware';

const router: Router = Router();

// Route only accessible by parents
router.get('/parent',
    authenticateToken,
    authorizeRoles('parent'),
    (req, res) => {
        res.send('Hello Parent!');
    }
);

// Child + Parent can access this
router.get('/play',
    authenticateToken,
    authorizeRoles('child', 'parent'),
    (req, res) => {
        res.send('Welcome to CogniBuddy Games!');
    }
);

// Admin-only
router.get('/admin',
    authenticateToken,
    authorizeRoles('admin'),
    (req, res) => {
        res.send('Hello Admin!');
    }
);


export default router;
