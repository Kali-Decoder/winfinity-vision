/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { IoClose } from 'react-icons/io5'; // Make sure to import IoClose
import { useQuizContext } from '@/features/Game/contexts/QuizContext';
import Button from '../buttons/Button';

// Original fixed dimensions
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

const BIRD_SIZE = 30;
const GAP_HEIGHT = 200;
const PIPE_SPEED = 1.2;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -9;
const PIPE_WIDTH = 60;

const COST_TO_PLAY = 20;
// Random target score between 15 and 30
const TARGET_SCORE = Math.floor(Math.random() * 16) + 15;

type Pipe = {
  x: number;
  gapTop: number;
  passed?: boolean;
};

const FlappyBird: React.FC = () => {
  const { deposit, stake, setDeposit, setStake, stakeYourAmount } =
    useQuizContext();

  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [birdVel, setBirdVel] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);

  const [gamePaid, setGamePaid] = useState(false);   // Did user pay for this round
  const [gameActive, setGameActive] = useState(false); // Is game actively animating
  const [gameOver, setGameOver] = useState(false);   // Collision or out-of-bounds

  // Modals
  const [initialModalOpen, setInitialModalOpen] = useState(false);
  const [playModalOpen, setPlayModalOpen] = useState(false);
  const [gameOverModalOpen, setGameOverModalOpen] = useState(false);

  const requestIdRef = useRef<number>();
  const [scaleFactor, setScaleFactor] = useState(1);

  // -----------------------------------------------------
  // Helper: Spawn a new pipe
  // -----------------------------------------------------
  const spawnPipe = () => {
    const maxGapTop = GAME_HEIGHT - GAP_HEIGHT - 200;
    const gapTopBase = 100;
    const gapTop = Math.random() * maxGapTop + gapTopBase;

    const newPipe: Pipe = { x: GAME_WIDTH, gapTop };
    setPipes((prev) => [...prev, newPipe]);
  };

  // -----------------------------------------------------
  // Start game => subtract deposit & reset state
  // -----------------------------------------------------
  const startGame = () => {
    try {
      if (deposit >= COST_TO_PLAY) {
        setDeposit((prev: number) => prev - COST_TO_PLAY);

        setGameOver(false);
        setGameOverModalOpen(false);
        setScore(0);
        setBirdY(GAME_HEIGHT / 2);
        setBirdVel(0);
        setPipes([]);
        setGamePaid(true);
        setGameActive(false); // wait for first jump
        spawnPipe();
      } else {
        toast.error('Not enough deposit to play.');
      }
    } catch (error) {
      console.error('Error starting the game:', error);
      toast.error('Failed to start the game. Please try again.');
    }
  };

  // -----------------------------------------------------
  // Handle game over => collision or out of bounds
  // -----------------------------------------------------
  const handleGameOver = () => {
    try {
      // If user surpasses target, reward them
      if (score > TARGET_SCORE) {
        const difference = score - TARGET_SCORE;
        const reward = difference * 0.5;
        setDeposit((prev) => prev + reward);
      }
      setGameOver(true);
      setGameOverModalOpen(true);
      setGamePaid(false);
      setGameActive(false);

      cancelAnimationFrame(requestIdRef.current!);
    } catch (error) {
      console.error('Error during game over:', error);
      toast.error('An error occurred during game over. Please refresh.');
    }
  };

  // -----------------------------------------------------
  // Bird jump => sets birdVel to negative
  // -----------------------------------------------------
  const jump = () => {
    if (gameOver) return;
    if (gamePaid && !gameActive) {
      setGameActive(true);
    }
    setBirdVel(JUMP_STRENGTH);
  };

  // -----------------------------------------------------
  // Main update loop (animation frame)
  // -----------------------------------------------------
  const update = () => {
    if (!gameActive || gameOver) return;

    setBirdY((y) => y + birdVel);
    setBirdVel((v) => v + GRAVITY);

    setPipes((prev) =>
      prev
        .map((pipe) => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
        .filter((pipe) => pipe.x + PIPE_WIDTH > 0)
    );

    if (pipes.length < 3 && pipes[pipes.length - 1]?.x < GAME_WIDTH * 0.6) {
      spawnPipe();
    }

    for (const pipe of pipes) {
      if (pipe.x + PIPE_WIDTH < GAME_WIDTH / 2 && !pipe.passed) {
        pipe.passed = true;
        setScore((s) => s + 1);
      }

      const withinPipeHorizontally =
        pipe.x < GAME_WIDTH / 2 + BIRD_SIZE / 2 &&
        pipe.x + PIPE_WIDTH > GAME_WIDTH / 2 - BIRD_SIZE / 2;

      const hitsPipeTop = birdY - BIRD_SIZE / 2 < pipe.gapTop;
      const hitsPipeBottom = birdY + BIRD_SIZE / 2 > pipe.gapTop + GAP_HEIGHT;

      if (withinPipeHorizontally && (hitsPipeTop || hitsPipeBottom)) {
        handleGameOver();
        return;
      }
    }

    if (birdY + BIRD_SIZE / 2 > GAME_HEIGHT || birdY - BIRD_SIZE / 2 < 0) {
      handleGameOver();
      return;
    }

    requestIdRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (gameActive && !gameOver) {
      requestIdRef.current = requestAnimationFrame(update);
    }
    return () => {
      if (requestIdRef.current) cancelAnimationFrame(requestIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameActive, gameOver, pipes, birdY, birdVel]);

  // -----------------------------------------------------
  // Listen for space => jump
  // -----------------------------------------------------
  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        jump();
      }
    };
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver, gameActive, gamePaid]);

  // -----------------------------------------------------
  // Handle window resize => scale
  // -----------------------------------------------------
  const handleResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const scaleWidth = w / GAME_WIDTH;
    const scaleHeight = h / GAME_HEIGHT;
    const newScale = Math.min(scaleWidth, scaleHeight, 1);
    setScaleFactor(newScale);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // -----------------------------------------------------
  // Stake/Deposit logic
  // -----------------------------------------------------
  const handleSelectAmount = async (amount: number) => {
    try {
      await stakeYourAmount(amount.toString());
      setStake((prev) => prev + amount);
      setDeposit((prev) => prev + amount);

      setInitialModalOpen(false);
      setPlayModalOpen(true); // Show "Ready to pay 20?" modal
    } catch (error) {
      console.error('Error selecting amount:', error);
      toast.error('Failed to set the deposit. Please try again.');
    }
  };

  const handleConfirmPlay = () => {
    startGame();
    setPlayModalOpen(false);
  };

  const handleCancelPlay = () => {
    setPlayModalOpen(false);
  };

  // -----------------------------------------------------
  // Game Over => "Play Again?" flow
  // -----------------------------------------------------
  const handlePlayAgainYes = () => {
    setGameOver(false);
    setGameOverModalOpen(false);
    // Attempt to start again
    startGame();
  };

  const handlePlayAgainNo = () => {
    setGameOver(false);
    setGameOverModalOpen(false);
    setBirdY(GAME_HEIGHT / 2);
    setBirdVel(0);
    setPipes([]);
    setScore(0);
    setGamePaid(false);
    setGameActive(false);
  };

  return (
    <div
      data-theme='dark'
      className='bg-base-100 flex h-screen flex-col items-center justify-center overflow-hidden p-4'
    >
      <h1 className='text-primary mb-4 text-center text-4xl font-bold drop-shadow-lg'>
        Flappy Bird
      </h1>

      {/* Stats Row */}
      <div className='mb-4 flex flex-wrap justify-center gap-4 text-center'>
        <div className='flex flex-col items-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            Deposit
          </span>
          <span className='text-lg font-semibold text-green-600 dark:text-green-400'>
            {deposit.toFixed(2)}
          </span>
        </div>
        <div className='flex flex-col items-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            Stake
          </span>
          <span className='text-lg font-semibold text-yellow-500 dark:text-yellow-400'>
            {stake.toFixed(2)}
          </span>
        </div>
        <div className='flex flex-col items-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            Score
          </span>
          <span className='text-lg font-semibold text-blue-500 dark:text-blue-400'>
            {score}
          </span>
        </div>
        <div className='flex flex-col items-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            Target
          </span>
          <span className='text-lg font-semibold text-purple-500 dark:text-purple-400'>
            {TARGET_SCORE}
          </span>
        </div>
        <div className='flex flex-col items-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            APR
          </span>
          <span className='text-lg font-semibold text-indigo-500 dark:text-indigo-400'>
            1%
          </span>
        </div>
      </div>

      {/* Main Game Container */}
      <div
        onClick={jump} // Tap to jump
        className='relative touch-none select-none rounded-md shadow-lg'
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          border: '4px solid #0E76FD',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(to bottom, #1E1E1E, #252525)',
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'top center',
          cursor: 'pointer',
        }}
      >
        {/* Bird */}
        <div
          className='border-neutral-content absolute rounded-full border bg-yellow-300'
          style={{
            width: BIRD_SIZE,
            height: BIRD_SIZE,
            left: GAME_WIDTH / 2 - BIRD_SIZE / 2,
            top: birdY - BIRD_SIZE / 2,
          }}
        />

        {/* Pipes */}
        {pipes.map((pipe, index) => (
          <React.Fragment key={index}>
            {/* Top Pipe */}
            <div
              className='absolute'
              style={{
                backgroundColor: 'rgba(34, 200, 34, 0.5)',
                width: PIPE_WIDTH,
                height: pipe.gapTop,
                left: pipe.x,
                top: 0,
              }}
            />
            {/* Bottom Pipe */}
            <div
              className='absolute'
              style={{
                backgroundColor: 'rgba(34, 200, 34, 0.5)',
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - (pipe.gapTop + GAP_HEIGHT),
                left: pipe.x,
                top: pipe.gapTop + GAP_HEIGHT,
              }}
            />
          </React.Fragment>
        ))}

        {/* "Press Space/Tap" overlay if user paid but hasn't started */}
        {gamePaid && !gameActive && !gameOver && (
          <div className='text-neutral-content absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 px-4 text-center'>
            <h2 className='mb-2 text-2xl font-bold'>Get Ready!</h2>
            <p className='mb-4'>
              Press <span className='font-bold'>SPACE</span> or tap to start
              flying
            </p>
          </div>
        )}
      </div>

      {/* If deposit < COST_TO_PLAY, user must deposit first */}
      {!gameOver && !gamePaid && !gameActive && deposit < COST_TO_PLAY && (
        <Button
          onClick={() => setInitialModalOpen(true)}
          variant='light'
          className='mt-4'
        >
          Deposit Amount
        </Button>
      )}

      {/* If deposit >= COST_TO_PLAY and user hasn't paid => show "Play" */}
      {!gameOver && !gamePaid && !gameActive && deposit >= COST_TO_PLAY && (
        <Button
          onClick={() => setPlayModalOpen(true)}
          variant='outlined-shadow'
          className='my-4'
        >
          Play
        </Button>
      )}

      {/* ------------------------------------------------
          MODALS: Using same style as SnakeGame
      ------------------------------------------------ */}

      {/* 1) Initial Deposit Modal */}
      {initialModalOpen && !gameOver && !gamePaid && !gameActive && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
          <div className='relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
            <IoClose
              onClick={() => setInitialModalOpen(false)}
              className='absolute top-2 right-2 cursor-pointer text-2xl'
            />
            <h2 className='mb-4 text-center text-2xl font-semibold text-blue-500'>
              Choose Deposit & Stake Amount
            </h2>
            <p className='mb-4 text-center text-gray-700 dark:text-gray-300'>
              Select an amount to deposit (Your stake remains unchanged):
            </p>
            <div className='flex flex-col gap-2'>
              <Button
                onClick={() => handleSelectAmount(100)}
                variant='light'
                className='!bg-gray-100 hover:!bg-gray-200 text-black'
              >
                $100
              </Button>
              <Button
                onClick={() => handleSelectAmount(150)}
                variant='light'
                className='!bg-gray-100 hover:!bg-gray-200 text-black'
              >
                $150
              </Button>
              <Button
                onClick={() => handleSelectAmount(200)}
                variant='light'
                className='!bg-gray-100 hover:!bg-gray-200 text-black'
              >
                $200
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2) "Ready to Play?" Modal */}
      {playModalOpen && !gameActive && !gameOver && !gamePaid && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
          <div className='relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
            <IoClose
              onClick={() => setPlayModalOpen(false)}
              className='absolute top-2 right-2 cursor-pointer text-2xl'
            />
            <h2 className='mb-4 text-center text-2xl font-semibold text-blue-500'>
              Ready to Play?
            </h2>
            <p className='mb-4 text-center text-gray-700 dark:text-gray-300'>
              You need to pay <span className='font-bold'>20 USD</span> from
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
                className='btn bg-gray-500 hover:bg-gray-600 focus:ring-gray-300 rounded-lg px-4 py-2'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3) Game Over Modal => "Play Again?" */}
      {gameOverModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'>
          <div className='relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
            <IoClose
              onClick={() => setGameOverModalOpen(false)}
              className='absolute top-2 right-2 cursor-pointer text-2xl'
            />
            <h2 className='text-error mb-4 text-center text-2xl font-semibold'>
              Game Over
            </h2>
            <p className='mb-4 text-center text-gray-700 dark:text-gray-300'>
              Your final score: {score}
            </p>
            {score > TARGET_SCORE && (
              <p className='mb-2 text-center text-green-400'>
                Congrats! You beat the target ({TARGET_SCORE}).
              </p>
            )}
            <div className='flex flex-col items-center gap-4'>
              <button
                onClick={handlePlayAgainYes}
                className='bg-green-500 hover:bg-green-600 focus:ring-green-300 w-full rounded-lg px-4 py-2'
              >
                Yes, Play Again
              </button>
              <button
                onClick={handlePlayAgainNo}
                className='bg-gray-500 hover:bg-gray-600 focus:ring-gray-300 w-full rounded-lg px-4 py-2'
              >
                No, I'm Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlappyBird;
