import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Name of the game
  },
  description: {
    type: String,
    required: false, // Optional description of the game
  },
  deposit_amount: {
    type: Number,
    required: true, // Amount the user deposits to play the game
  },
});

const Game = mongoose.model("GAME", gameSchema);
export default Game;
