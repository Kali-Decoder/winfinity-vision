/* eslint-disable react/no-unescaped-entities */
'use client';

import { useQuizContext } from '@/features/Game/contexts/QuizContext';
import React, { useEffect, useRef, useState } from 'react';

import { toast } from 'react-hot-toast';
import { IoClose } from 'react-icons/io5';


type Position = {
  x: number;
  y: number;
};

const TARGET_SCORE = Math.floor(Math.random() * 16) + 15;
const POINTS_PER_FOOD = 2;
const GRID_SIZE = 20;
const SQUARE_SIZE = 20;

const SnakeGame: React.FC = () => {
  const { deposit, stake, setDeposit, setStake, stakeYourAmount } =
    useQuizContext();
  const total = deposit + stake;
  const [snake, setSnake] = useState<Position[]>([{ x: 5, y: 5 }]);
  const [food, setFood] = useState<Position>({ x: 10, y: 10 });
  const [direction, setDirection] = useState<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'>(
    'RIGHT'
  );
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

    if (e.key === 'ArrowUp' && direction !== 'DOWN') setDirection('UP');
    if (e.key === 'ArrowDown' && direction !== 'UP') setDirection('DOWN');
    if (e.key === 'ArrowLeft' && direction !== 'RIGHT') setDirection('LEFT');
    if (e.key === 'ArrowRight' && direction !== 'LEFT') setDirection('RIGHT');
    if (e.key === 'Escape') setPaused(!paused);
  };

  const moveSnake = () => {
    if (gameOver || paused || !gameStarted) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };

    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }

    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= GRID_SIZE ||
      head.y >= GRID_SIZE ||
      newSnake
        .slice(1)
        .some((segment) => segment.x === head.x && segment.y === head.y)
    ) {
      handleGameOver();
      return;
    }

    newSnake.unshift(head);

    // Check if snake eats food
    if (head.x === food.x && head.y === food.y) {
      setScore((prevScore) => prevScore + POINTS_PER_FOOD);
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
    } while (
      snake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      )
    );
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
        setDeposit((prevDeposit: any) => prevDeposit + reward);
      }
      setGameOver(true);
    } catch (error) {
      console.error('Error in handleGameOver:', error);
      toast.error('An error occurred while handling game over.');
    }
  };

  const restartGame = () => {
    try {
      setSnake([{ x: 5, y: 5 }]);
      setFood({ x: 10, y: 10 });
      setDirection('RIGHT');
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
      console.error('Error in restartGame:', error);
      toast.error('An error occurred while restarting the game.');
    }
  };

  const handleSelectAmount = async (amount: number) => {
    try {
      console.log('Selected amount:', amount);
      
      // Initiate staking process and wait for it to complete
      await stakeYourAmount(amount.toString());
      
      // Update state only after staking is successful
      setStake((prev: number) => prev + amount);
      setDeposit((prev: number) => prev + amount);
      
      // Close modals
      setInitialModalOpen(false);
      setPlayModalOpen(true);
      
    } catch (error: any) {
      console.error('Error in handleSelectAmount:', error);
      toast.error('An error occurred while selecting the amount.');
    }
  };

  const handleConfirmPlay = () => {
    try {
      if (deposit >= 10) {
        setDeposit((prev: any) => prev - 10);
        setGameStarted(true);
        setPlayModalOpen(false);
      } else {
        toast.error('Not enough deposit to play.');
      }
    } catch (error) {
      console.error('Error in handleConfirmPlay:', error);
      toast.error('An error occurred while confirming play.');
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
          toast.error('Not enough deposit to play again.');
        }
      }
      setPlayAgainModalOpen(false);
    } catch (error) {
      console.error('Error in handlePlayAgain:', error);
      toast.error('An error occurred while handling play again.');
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
      if (deltaX > 30 && direction !== 'LEFT') {
        setDirection('RIGHT');
      } else if (deltaX < -30 && direction !== 'RIGHT') {
        setDirection('LEFT');
      }
    } else {
      // Vertical swipe
      if (deltaY > 30 && direction !== 'UP') {
        setDirection('DOWN');
      } else if (deltaY < -30 && direction !== 'DOWN') {
        setDirection('UP');
      }
    }

    // Reset touch positions
    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
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

  // Functions to close modals
  const closeInitialModal = () => setInitialModalOpen(false);
  const closePlayModal = () => setPlayModalOpen(false);
  const closeGameOverModal = () => setGameOver(false); // Adjust as needed
  const closePlayAgainModal = () => setPlayAgainModalOpen(false);

  return (
    <div
      className='relative flex flex-col items-center justify-center p-4'
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <h1 className='text-blue-500 mb-4 text-center text-4xl font-bold'>
        Snake Game
      </h1>

      <div className='mb-4 flex flex-wrap justify-center gap-4 text-center'>
        <div className='flex flex-col items-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>Deposit</span>
          <span className='text-lg font-semibold text-green-600 dark:text-green-400'>
            {deposit}
          </span>
        </div>
        <div className='flex flex-col items-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>Stake</span>
          <span className='text-lg font-semibold text-yellow-500 dark:text-yellow-400'>
            {stake}
          </span>
        </div>
        <div className='flex flex-col items-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>Score</span>
          <span className='text-lg font-semibold text-blue-500 dark:text-blue-400'>
            {score.toFixed(2)}
          </span>
        </div>
        <div className='flex flex-col items-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>Target</span>
          <span className='text-lg font-semibold text-purple-500 dark:text-purple-400'>
            {TARGET_SCORE}
          </span>
        </div>
        <div className='flex flex-col items-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>APR</span>
          <span className='text-lg font-semibold text-indigo-500 dark:text-indigo-400'>10%</span>
        </div>
      </div>

      <div
        ref={gameBoardRef}
        className='relative rounded-md bg-gray-800'
        style={{
          width: GRID_SIZE * SQUARE_SIZE,
          height: GRID_SIZE * SQUARE_SIZE,
          border: '4px solid #34D399', // Tailwind's green-400
        }}
      >
        {snake.map((segment, index) => (
          <div
            key={index}
            className='bg-green-500 border-green-700 absolute rounded-sm border'
            style={{
              width: SQUARE_SIZE,
              height: SQUARE_SIZE,
              top: segment.y * SQUARE_SIZE,
              left: segment.x * SQUARE_SIZE,
            }}
          ></div>
        ))}

        <div
          className='bg-red-500 border-red-700 absolute rounded-full border'
          style={{
            width: SQUARE_SIZE,
            height: SQUARE_SIZE,
            top: food.y * SQUARE_SIZE,
            left: food.x * SQUARE_SIZE,
          }}
        ></div>
      </div>

      {paused && gameStarted && !gameOver && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
            <IoClose onClick={() => setPaused(false)} />
            <h2 className='text-yellow-500 mb-4 text-center text-2xl font-semibold'>
              Game Paused
            </h2>
            <p className='mb-4 text-center text-sm text-gray-500 dark:text-gray-400'>
              Press "Escape" to resume
            </p>
            <div className='flex justify-center'>
              <button
                onClick={() => setPaused(false)}
                className='btn bg-green-500 hover:bg-green-600 focus:ring-green-300 rounded-lg px-4 py-2'
              >
                Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initial Modal: Choose Deposit & Stake Amount */}
      {initialModalOpen && !gameOver && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
            <IoClose onClick={closeInitialModal} />
            <h2 className='mb-4 text-center text-2xl font-semibold text-blue-500'>
              Choose Deposit & Stake Amount
            </h2>
            <p className='mb-4 text-center text-gray-700 dark:text-gray-300'>
              Select an amount to deposit and stake:
            </p>
            <div className='flex flex-col gap-2'>
              <button
                onClick={() => handleSelectAmount(10)}
                className='bg-blue-500 rounded-md py-1 hover:bg-blue-600 focus:ring-blue-300 w-full'
              >
                $10
              </button>
              <button
                onClick={() => handleSelectAmount(15)}
                className='bg-blue-500 rounded-md py-1 hover:bg-blue-600 focus:ring-blue-300 w-full'
              >
                $15
              </button>
              <button
                onClick={() => handleSelectAmount(20)}
                className='bg-blue-500 rounded-md py-1 hover:bg-blue-600 focus:ring-blue-300 w-full'
              >
                $20
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Play Modal: Pay 10 USD to start game */}
      {playModalOpen && !gameStarted && !gameOver && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
            <IoClose onClick={closePlayModal} />
            <h2 className='mb-4 text-center text-2xl font-semibold text-blue-500'>
              Ready to Play?
            </h2>
            <p className='mb-4 text-center text-gray-700 dark:text-gray-300'>
              You need to pay <span className='font-bold'>10 USD</span> from
              your deposit to start.
            </p>
            <div className='flex justify-center gap-4'>
              <button
                onClick={handleConfirmPlay}
                className='btn bg-green-500 hover:bg-green-600 focus:ring-green-300 rounded-lg px-4 py-2'
              >
                Confirm
              </button>
              <button
                onClick={handleCancelPlay}
                className='btn btn-gray-500 hover:bg-gray-600 focus:ring-gray-300 rounded-lg px-4 py-2'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOver && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
            <IoClose onClick={closeGameOverModal} />
            <h2 className='text-red-500 mb-4 text-center text-2xl font-semibold'>
              Game Over
            </h2>
            <p className='mb-4 text-center text-gray-700 dark:text-gray-300'>
              Your final score: {score}
            </p>
            <div className='flex flex-col items-center gap-4'>
              <button
                onClick={restartGame}
                className='bg-blue-500 hover:bg-blue-600 focus:ring-blue-300 w-full rounded-lg px-4 py-2'
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Play Again Modal */}
      {playAgainModalOpen && !gameOver && !gameStarted && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
            <IoClose onClick={closePlayAgainModal} />
            <h2 className='mb-4 text-center text-2xl font-semibold text-blue-500 '>
              Play Again?
            </h2>
            <p className='mb-4 text-center text-gray-700 dark:text-gray-300'>
              You have enough funds to start a new game. Would you like to
              continue?
            </p>
            <div className='flex justify-center gap-4'>
              <button
                onClick={handlePlayAgain}
                className='btn bg-green-500 hover:bg-green-600 focus:ring-green-300 rounded-lg px-4 py-2'
              >
                Confirm
              </button>
              <button
                onClick={() => setPlayAgainModalOpen(false)}
                className='btn bg-gray-500 hover:bg-gray-600 focus:ring-gray-300 rounded-lg px-4 py-2'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Button that triggers the Play Again modal if deposit >= 10 and game is not started or over */}
      {deposit >= 10 && !gameStarted && !gameOver && (
        <button
          onClick={() => setPlayAgainModalOpen(true)}
          className='bg-blue-500 mt-7 w-1/2 rounded-lg px-4 py-2 hover:bg-blue-600 focus:ring-blue-300'
        >
          Play Again
        </button>
      )}

      {deposit < 10 && !gameStarted && !gameOver && (
        <button
          onClick={() => setInitialModalOpen(true)}
          className='bg-blue-500 hover:bg-blue-600 text-white rounded-md mt-4 p-2 px-5 w-fit focus:ring-blue-300'
        >
          Deposit Amount ($10)
        </button>
      )}

      {/* On-Screen Directional Buttons */}
      {gameStarted && !gameOver && (
        <div className='mt-4 flex flex-col items-center'>
          <button
            onClick={() => direction !== 'DOWN' && setDirection('UP')}
            className='btn btn-indigo-500 mb-2 hover:bg-indigo-600 focus:ring-indigo-300 rounded-lg px-4 py-2'
          >
            ↑ Up
          </button>
          <div className='flex gap-2'>
            <button
              onClick={() => direction !== 'RIGHT' && setDirection('LEFT')}
              className='btn btn-indigo-500 hover:bg-indigo-600 focus:ring-indigo-300 rounded-lg px-4 py-2'
            >
              ← Left
            </button>
            <button
              onClick={() => direction !== 'LEFT' && setDirection('RIGHT')}
              className='btn btn-indigo-500 hover:bg-indigo-600 focus:ring-indigo-300 rounded-lg px-4 py-2'
            >
              → Right
            </button>
          </div>
          <button
            onClick={() => direction !== 'UP' && setDirection('DOWN')}
            className='btn btn-indigo-500 mt-2 hover:bg-indigo-600 focus:ring-indigo-300 rounded-lg px-4 py-2'
          >
            ↓ Down
          </button>
        </div>
      )}
    </div>
  );
};

export default SnakeGame;
