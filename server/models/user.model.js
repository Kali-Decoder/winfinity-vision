import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: false,
    },
    wallet_address: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: false,
    },
    total_deposit: {
        type: Number,
        default: 0,
    },
    total_staked: {
        type: Number,
        default: 0,
    },
    total_rewards_earned: {
        type: Number,
        default: 0,
    },
});

const User = mongoose.model('USER', userSchema);
export default User;
