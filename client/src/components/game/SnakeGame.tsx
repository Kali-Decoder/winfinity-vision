/* eslint-disable react/no-unescaped-entities */
"use client";

import { useQuizContext } from "@/features/Game/contexts/QuizContext";
import React, { useEffect, useRef, useState } from "react";

import {toast} from "react-hot-toast";


type Position = {
  x: number;
  y: number;
};

const TARGET_SCORE =  Math.floor(Math.random() * 16) + 15;
const POINTS_PER_FOOD = 2;
const GRID_SIZE = 20;
const SQUARE_SIZE = 20;

const SnakeGame: React.FC = () => {
  const { deposit,stake,setDeposit,setStake,stakeYourAmount} = useQuizContext();
  const total = deposit + stake;
  const [snake, setSnake] = useState<Position[]>([{ x: 5, y: 5 }]);
  const [food, setFood] = useState<Position>({ x: 10, y: 10 });
  const [direction, setDirection] = useState<"UP" | "DOWN" | "LEFT" | "RIGHT">("RIGHT");
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const gameBoardRef = useRef<HTMLDivElement | null>(null);

  // Show deposit modal if the user has no deposit and no stake
  const [initialModalOpen, setInitialModalOpen] = useState(false);

  // Show play confirmation modal after choosing amount but before game starts
  const [playModalOpen, setPlayModalOpen] = useState(false);

  // New state for "Play Again" modal
  const [playAgainModalOpen, setPlayAgainModalOpen] = useState(false);

  // Touch handling states
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!gameStarted) return;

    if (e.key === "ArrowUp" && direction !== "DOWN") setDirection("UP");
    if (e.key === "ArrowDown" && direction !== "UP") setDirection("DOWN");
    if (e.key === "ArrowLeft" && direction !== "RIGHT") setDirection("LEFT");
    if (e.key === "ArrowRight" && direction !== "LEFT") setDirection("RIGHT");
    if (e.key === "Escape") setPaused(!paused);
  };

  const moveSnake = () => {
    if (gameOver || paused || !gameStarted) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case "UP":
        head.y -= 1;
        break;
      case "DOWN":
        head.y += 1;
        break;
      case "LEFT":
        head.x -= 1;
        break;
      case "RIGHT":
        head.x += 1;
        break;
    }

    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= GRID_SIZE ||
      head.y >= GRID_SIZE ||
      newSnake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
    ) {
      handleGameOver();
      return;
    }

    newSnake.unshift(head);

    // Check if snake eats food
    if (head.x === food.x && head.y === food.y) {
      setScore(prevScore => prevScore + POINTS_PER_FOOD);
      generateFood();
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  const generateFood = () => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  };

  const handleGameOver = () => {
    try {
      if (score > TARGET_SCORE) {
        const difference = score - TARGET_SCORE;
        let reward = difference * 0.1;
        if (reward) {
          reward = reward + 10;
        }
        setDeposit((prevDeposit:any) => prevDeposit + reward);
      }
      setGameOver(true);
    } catch (error) {
      console.error("Error in handleGameOver:", error);
      toast.error("An error occurred while handling game over.");
    }
  };
  
  const restartGame = () => {
    try {
      setSnake([{ x: 5, y: 5 }]);
      setFood({ x: 10, y: 10 });
      setDirection("RIGHT");
      setGameOver(false);
      setPaused(false);
      setScore(0);
      setGameStarted(false);
  
      if (deposit >= 10) {
        setPlayModalOpen(true);
      } else if (deposit === 0 && stake === 0) {
        setInitialModalOpen(true);
      }
    } catch (error) {
      console.error("Error in restartGame:", error);
      toast.error("An error occurred while restarting the game.");
    }
  };
  
  const handleSelectAmount = async (amount: number) => {
    try {
      console.log("Selected amount:", amount);
      await stakeYourAmount(amount);
      setStake((prev:any) => prev + amount);
      setDeposit((prev:any) => prev + amount);
      setInitialModalOpen(false);
      setPlayModalOpen(true);
    } catch (error) {
      console.error("Error in handleSelectAmount:", error);
      toast.error("An error occurred while selecting the amount.");
    }
  };
  
  const handleConfirmPlay = () => {
    try {
      if (deposit >= 10) {
        setDeposit((prev:any) => prev - 10);
        setGameStarted(true);
        setPlayModalOpen(false);
      } else {
        toast.error("Not enough deposit to play.");
      }
    } catch (error) {
      console.error("Error in handleConfirmPlay:", error);
      toast.error("An error occurred while confirming play.");
    }
  };
  
  const handlePlayAgain = () => {
    try {
      if (deposit >= 10) {
        setPlayModalOpen(true);
      } else {
        if (deposit === 0 && stake === 0) {
          setInitialModalOpen(true);
        } else {
          toast.error("Not enough deposit to play again.");
        }
      }
      setPlayAgainModalOpen(false);
    } catch (error) {
      console.error("Error in handlePlayAgain:", error);
      toast.error("An error occurred while handling play again.");
    }
  };
  

  const handleCancelPlay = () => {
    setPlayModalOpen(false);
  };


  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchEndRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 30 && direction !== "LEFT") {
        setDirection("RIGHT");
      } else if (deltaX < -30 && direction !== "RIGHT") {
        setDirection("LEFT");
      }
    } else {
      // Vertical swipe
      if (deltaY > 30 && direction !== "UP") {
        setDirection("DOWN");
      } else if (deltaY < -30 && direction !== "DOWN") {
        setDirection("UP");
      }
    }

    // Reset touch positions
    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [direction, paused, gameStarted]);

  useEffect(() => {
    if (gameOver || paused || !gameStarted) return;
    const interval = setInterval(moveSnake, 200);
    return () => clearInterval(interval);
  }, [snake, direction, gameOver, paused, gameStarted]);

  useEffect(() => {
    // If no funds at all, open deposit modal
    if (deposit === 0 && stake === 0) {
      setInitialModalOpen(true);
    } else {
      setInitialModalOpen(false);
    }
  }, [deposit, stake]);

  return (
    <div
      className="flex flex-col items-center justify-center bg-base-100 dark:bg-neutral-900 p-4 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <h1 className="text-4xl font-bold mb-4 text-center text-primary">Snake Game</h1>

      <div className="mb-4 flex flex-wrap gap-4 justify-center text-center">
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-500">Deposit</span>
          <span className="text-lg font-semibold text-green-500">224 USD</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-500">Stake</span>
          <span className="text-lg font-semibold text-orange-500">224 USD</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-500">Score</span>
          <span className="text-lg font-semibold text-blue-500">{score.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-500">Target</span>
          <span className="text-lg font-semibold text-purple-500">{TARGET_SCORE}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-500">APR</span>
          <span className="text-lg font-semibold text-purple-500">10%</span>
        </div>
      </div>

      <div
        ref={gameBoardRef}
        className="relative bg-black rounded-md"
        style={{
          width: GRID_SIZE * SQUARE_SIZE,
          height: GRID_SIZE * SQUARE_SIZE,
          border: "4px solid #4ade80",
        }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className="absolute bg-primary border border-accent rounded-sm"
            style={{
              width: SQUARE_SIZE,
              height: SQUARE_SIZE,
              top: segment.y * SQUARE_SIZE,
              left: segment.x * SQUARE_SIZE,
            }}
          ></div>
        ))}

        <div
          className="absolute bg-accent border border-primary rounded-full"
          style={{
            width: SQUARE_SIZE,
            height: SQUARE_SIZE,
            top: food.y * SQUARE_SIZE,
            left: food.x * SQUARE_SIZE,
          }}
        ></div>
      </div>

      {paused && gameStarted && !gameOver && (
        <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-2xl font-semibold text-warning mb-4 text-center">Game Paused</h2>
            <p className="text-sm text-gray-500 text-center mb-4">Press "Escape" to resume</p>
            <div className="flex justify-center">
              <button onClick={() => setPaused(false)} className="btn btn-primary px-4 py-2 rounded-lg">
                Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initial Modal: Choose Deposit & Stake Amount */}
      {initialModalOpen && !gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-2xl font-semibold text-blue-500 mb-4 text-center">Choose Deposit & Stake Amount</h2>
            <p className="text-center mb-4">Select an amount to deposit and stake:</p>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleSelectAmount(10)} className="btn btn-primary w-full">
                $10
              </button>
              <button onClick={() => handleSelectAmount(15)} className="btn btn-primary w-full">
                $15
              </button>
              <button onClick={() => handleSelectAmount(20)} className="btn btn-primary w-full">
                $20
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Play Modal: Pay 10 USD to start game */}
      {playModalOpen && !gameStarted && !gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-2xl font-semibold text-blue-500 mb-4 text-center">Ready to Play?</h2>
            <p className="text-center mb-4">
              You need to pay <span className="font-bold">10 USD</span> from your deposit to start.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={handleConfirmPlay} className="btn btn-primary px-4 py-2 rounded-lg">
                Confirm
              </button>
              <button onClick={handleCancelPlay} className="btn btn-secondary px-4 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-2xl font-semibold text-error mb-4 text-center">Game Over</h2>
            <p className="text-center mb-4">Your final score: {score}</p>
            <div className="flex flex-col items-center gap-4">
              <button onClick={restartGame} className="btn btn-primary px-4 py-2 rounded-lg w-full">
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Play Again Modal (replaces the bottom button) */}
      {playAgainModalOpen && !gameOver && !gameStarted  && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-2xl font-semibold text-blue-500 mb-4 text-center ">Play Again?</h2>
            <p className="text-center mb-4">You have enough funds to start a new game. Would you like to continue?</p>
            <div className="flex justify-center gap-4">
              <button onClick={handlePlayAgain} className="btn btn-primary px-4 py-2 rounded-lg">
                Confirm
              </button>
              <button onClick={() => setPlayAgainModalOpen(false)} className="btn btn-secondary px-4 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Button that triggers the Play Again modal if deposit >= 10 and game is not started or over */}
      {deposit >= 10 && !gameStarted && !gameOver && (
        <button onClick={() => setPlayAgainModalOpen(true)} className="btn btn-success px-4 py-2 rounded-lg w-1/2 mt-7">
          Play Again
        </button>
      )}

      {/* On-Screen Directional Buttons */}
      {gameStarted && !gameOver && (
        <div className="flex flex-col items-center mt-4">
          <button
            onClick={() => direction !== "DOWN" && setDirection("UP")}
            className="btn btn-secondary mb-2 px-4 py-2 rounded-lg"
          >
            ↑ Up
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => direction !== "RIGHT" && setDirection("LEFT")}
              className="btn btn-secondary px-4 py-2 rounded-lg"
            >
              ← Left
            </button>
            <button
              onClick={() => direction !== "LEFT" && setDirection("RIGHT")}
              className="btn btn-secondary px-4 py-2 rounded-lg"
            >
              → Right
            </button>
          </div>
          <button
            onClick={() => direction !== "UP" && setDirection("DOWN")}
            className="btn btn-secondary mt-2 px-4 py-2 rounded-lg"
          >
            ↓ Down
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
