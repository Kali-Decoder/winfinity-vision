import express from 'express';
import {
    registerUser,
    depositAmount,
    getLeaderboard,
    withdrawAmount,
    getAllGames,
    addGame
} from './controllers/userController.js';

const router = express.Router();

// User Routes
router.post('/users/register', registerUser);
router.post('/users/deposit', depositAmount);
router.get('/leaderboard', getLeaderboard);
router.post('/users/withdraw', withdrawAmount);

// Game Routes
router.get('/games', getAllGames);
router.post('/games', addGame);

export default router;