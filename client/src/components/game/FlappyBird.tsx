/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useRef, useState } from "react";
import {toast} from "react-hot-toast";
/* eslint-disable react/no-unescaped-entities */

// Original fixed dimensions
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

const BIRD_SIZE = 30;
// Larger gap for easier play
const GAP_HEIGHT = 200;
// Slightly slow the pipe speed
const PIPE_SPEED = 1.2;
const GRAVITY = 0.5;
const JUMP_STRENGTH = -9;
const PIPE_WIDTH = 60;

const TARGET_SCORE =  Math.floor(Math.random() * 16) + 15;
const COST_TO_PLAY = 20;

type Pipe = {
  x: number;
  gapTop: number;
  passed?: boolean;
};

const FlappyBird: React.FC = () => {
  // const { deposit, stake, setDeposit,stakeAmount } = useUserBalance();


  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [birdVel, setBirdVel] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [score, setScore] = useState(0);

  const [gamePaid, setGamePaid] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [initialModalOpen, setInitialModalOpen] = useState(false);
  const [playModalOpen, setPlayModalOpen] = useState(false);
  const [playAgainModalOpen, setPlayAgainModalOpen] = useState(false);

  const requestIdRef = useRef<number>();
  const [scaleFactor, setScaleFactor] = useState(1);

  const spawnPipe = () => {
    const maxGapTop = GAME_HEIGHT - GAP_HEIGHT - 200;
    const gapTopBase = 100;
    const gapTop = Math.random() * maxGapTop + gapTopBase;
    const newPipe: Pipe = { x: GAME_WIDTH, gapTop };
    setPipes(prev => [...prev, newPipe]);
  };

  const startGame = () => {
    try {
      if (COST_TO_PLAY>0) {
        // setDeposit(deposit - COST_TO_PLAY);
        setGameOver(false);
        setScore(0);
        setBirdY(GAME_HEIGHT / 2);
        setBirdVel(0);
        setPipes([]);
        setGamePaid(true);
        setGameActive(false);
        spawnPipe();
      } else {
        toast.error("Not enough deposit to play.");
      }
    } catch (error) {
      console.error("Error starting the game:", error);
      toast.error("Failed to start the game. Please try again.");
    }
  };
  

  const handleGameOver = () => {
    try {
      if (score > TARGET_SCORE) {
        const difference = score - TARGET_SCORE;
        const reward = difference * 0.5;
        // setDeposit(deposit + reward);
      }
      setGameOver(true);
      setGamePaid(false);
      setGameActive(false);
      cancelAnimationFrame(requestIdRef.current!);
    } catch (error) {
      console.error("Error during game over:", error);
      toast.error("An error occurred during game over. Please refresh.");
    }
  };
  

  const jump = () => {
    if (gameOver) return;
    if (gamePaid && !gameActive) {
      setGameActive(true);
    }
    setBirdVel(JUMP_STRENGTH);
  };

  const update = () => {
    if (!gameActive || gameOver) return;

    setBirdY(y => y + birdVel);
    setBirdVel(v => v + GRAVITY);

    setPipes(prev =>
      prev.map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED })).filter(pipe => pipe.x + PIPE_WIDTH > 0)
    );

    if (pipes.length < 3 && pipes[pipes.length - 1]?.x < GAME_WIDTH * 0.6) {
      spawnPipe();
    }

    for (const pipe of pipes) {
      if (pipe.x + PIPE_WIDTH < GAME_WIDTH / 2 && !pipe.passed) {
        pipe.passed = true;
        setScore(s => s + 1);
      }

      const withinPipeHorizontally = pipe.x < GAME_WIDTH / 2 + BIRD_SIZE / 2 && pipe.x + PIPE_WIDTH > GAME_WIDTH / 2 - BIRD_SIZE / 2;
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
  }, [gameActive, gameOver, pipes, birdY, birdVel]);

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        jump();
      }
    };
    document.addEventListener("keyup", handleKeyUp);
    return () => document.removeEventListener("keyup", handleKeyUp);
  }, [gameOver, gameActive, gamePaid]);

  // useEffect(() => {
  //   if (deposit === 0 && stake === 0) {
  //     setInitialModalOpen(true);
  //   } else {
  //     setInitialModalOpen(false);
  //   }
  // }, [deposit, stake]);

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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectAmount = async (amount: number) => {
    try {
      // await stakeAmount(amount);
      // setDeposit(deposit + amount);
      setInitialModalOpen(false);
      setPlayModalOpen(true);
    } catch (error) {
      console.error("Error selecting amount:", error);
      toast.error("Failed to set the deposit. Please try again.");
    }
  };
  

  const handleConfirmPlay = () => {
    startGame();
    setPlayModalOpen(false);
  };

  const handleCancelPlay = () => {
    setPlayModalOpen(false);
  };

  const handlePlayAgain = () => {
    // if (deposit >= COST_TO_PLAY) {
    //   setPlayModalOpen(true);
    // } else {
    //   if (deposit === 0 && stake === 0) {
    //     setInitialModalOpen(true);
    //   } else {
    //     toast.error("Not enough deposit to play.");
    //     // alert("Not enough deposit to play again.");
    //   }
    // }
    setPlayAgainModalOpen(false);
  };

  return (
    <div
      data-theme="dark"
      className="flex h-screen overflow-hidden flex-col items-center justify-center p-4 bg-base-100"
    >
      <h1 className="text-4xl font-bold mb-4 text-center text-primary drop-shadow-lg">Flappy Bird</h1>

      <div className="mb-4 flex gap-4 text-center text-base-content">
        <div className="flex flex-col items-center">
          <span className="text-sm text-base-content/80">Deposit</span>
          <span className="text-lg font-semibold text-success">234 USD</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-base-content/80">Stake</span>
          <span className="text-lg font-semibold text-accent">234 USD</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-base-content/80">Score</span>
          <span className="text-lg font-semibold text-info">{score}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-base-content/80">Target</span>
          <span className="text-lg font-semibold text-warning">{TARGET_SCORE}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-base-content/80">APR</span>
          <span className="text-lg font-semibold text-warning">10%</span>
        </div>
      </div>

      {/* 
        Add onClick to the game container to allow tap-to-jump.
        This way, on mobile devices, tapping the screen will make the bird jump.
      */}
      <div
        onClick={jump}
        className="relative rounded-md shadow-lg touch-none select-none"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          border: "4px solid #0E76FD",
          overflow: "hidden",
          position: "relative",
          background: "linear-gradient(to bottom, #1E1E1E, #252525)",
          transform: `scale(${scaleFactor})`,
          transformOrigin: "top center",
          cursor: "pointer"
        }}
      >
        {/* Bird */}
        <div
          className="absolute bg-yellow-300 rounded-full border border-neutral-content"
          style={{
            width: BIRD_SIZE,
            height: BIRD_SIZE,
            left: GAME_WIDTH / 2 - BIRD_SIZE / 2,
            top: birdY - BIRD_SIZE / 2,
          }}
        ></div>

        {/* Pipes - lighter, semi-transparent green */}
        {pipes.map((pipe, index) => (
          <React.Fragment key={index}>
            {/* Top Pipe */}
            <div
              className="absolute"
              style={{
                backgroundColor: "rgba(34, 200, 34, 0.5)",
                width: PIPE_WIDTH,
                height: pipe.gapTop,
                left: pipe.x,
                top: 0,
              }}
            ></div>
            {/* Bottom Pipe */}
            <div
              className="absolute"
              style={{
                backgroundColor: "rgba(34, 200, 34, 0.5)",
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - (pipe.gapTop + GAP_HEIGHT),
                left: pipe.x,
                top: pipe.gapTop + GAP_HEIGHT,
              }}
            ></div>
          </React.Fragment>
        ))}

        {/* Start Instruction Overlay */}
        {gamePaid && !gameActive && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-neutral-content text-center px-4">
            <h2 className="text-2xl font-bold mb-2">Get Ready!</h2>
            <p className="mb-4">
              Press <span className="font-bold">SPACE</span> or tap to start flying
            </p>
          </div>
        )}
      </div>

      {/* Initial Modal */}
      {initialModalOpen && !gameOver && !gamePaid && !gameActive && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div className="bg-neutral p-6 rounded-lg shadow-lg max-w-sm w-full text-neutral-content">
            <h2 className="text-2xl font-semibold text-primary mb-4 text-center">
              Choose Deposit & Stake Amount
            </h2>
            <p className="text-center mb-4">
              Select an amount to deposit (Your stake remains unchanged):
            </p>
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

      {/* Play Modal */}
      {playModalOpen && !gameActive && !gameOver && !gamePaid && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div className="bg-neutral p-6 rounded-lg shadow-lg max-w-sm w-full text-neutral-content">
            <h2 className="text-2xl font-semibold text-primary mb-4 text-center">Ready to Play?</h2>
            <p className="text-center mb-4">
              You need to pay <span className="font-bold">20 USD</span> from your deposit to start.
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={handleConfirmPlay} className="btn btn-success px-4 py-2 rounded-lg">
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div className="bg-neutral p-6 rounded-lg shadow-lg max-w-sm w-full text-neutral-content">
            <h2 className="text-2xl font-semibold text-error mb-4 text-center">Game Over</h2>
            <p className="text-center mb-4">Your final score: {score}</p>
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => {
                  setGameOver(false);
                  // if (deposit >= COST_TO_PLAY) {
                  //   setPlayModalOpen(true);
                  // } else if (deposit === 0 && stake === 0) {
                  //   setInitialModalOpen(true);
                  // } else {
                  //   toast.error("Not enough deposit to play again.");
                    
                  //   // alert("Not enough deposit to play again.");
                  // }
                }}
                className="btn btn-primary px-4 py-2 rounded-lg w-full"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Play Again Modal */}
      {playAgainModalOpen && !gameOver && !gameActive && !gamePaid && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div className="bg-neutral p-6 rounded-lg shadow-lg max-w-sm w-full text-neutral-content">
            <h2 className="text-2xl font-semibold text-primary mb-4 text-center">Play Again?</h2>
            <p className="text-center mb-4">
              You have enough funds to start a new game. Would you like to continue?
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={handlePlayAgain} className="btn btn-success px-4 py-2 rounded-lg">
                Confirm
              </button>
              <button onClick={() => setPlayAgainModalOpen(false)} className="btn btn-secondary px-4 py-2 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {deposit >= COST_TO_PLAY && !gamePaid && !gameOver && !gameActive && (
        <button
          onClick={() => setPlayAgainModalOpen(true)}
          className="btn btn-accent px-4 py-2 rounded-lg w-1/2 mt-7 shadow-md"
        >
          Play Again
        </button>
      )} */}
    </div>
  );
};

export default FlappyBird;
