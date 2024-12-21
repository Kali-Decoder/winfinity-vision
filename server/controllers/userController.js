// Controller: userController.js
import Game from '../models/game.model.js';
import User from '../models/user.model.js';

// Register User
export const registerUser = async (req, res) => {
    try {
        const { username, wallet_address, avatar } = req.body;
        const user = new User({ username, wallet_address, avatar });
        await user.save();
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Deposit Amount
export const depositAmount = async (req, res) => {
    try {
        const { wallet_address, amount } = req.body;
        const user = await User.findOne({ wallet_address });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.total_deposit += amount;
        user.total_staked += amount;
        await user.save();

        res.json({ message: 'Deposit successful', total_deposit: user.total_deposit, total_staked: user.total_staked });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Leaderboard
export const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.find().sort({ total_rewards_earned: -1 }).select('username wallet_address total_rewards_earned');
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Withdraw Amount
export const withdrawAmount = async (req, res) => {
    try {
        const { wallet_address, amount } = req.body;
        const user = await User.findOne({ wallet_address });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.total_deposit < amount) return res.status(400).json({ message: 'Insufficient balance' });

        user.total_deposit -= amount;
        await user.save();

        res.json({ message: 'Withdrawal successful', remaining_balance: user.total_deposit });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Games
export const getAllGames = async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add Game
export const addGame = async (req, res) => {
    try {
        const { name, description, deposit_amount } = req.body;
        const game = new Game({ name, description, deposit_amount });
        await game.save();
        res.status(201).json({ message: 'Game added successfully', game });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
