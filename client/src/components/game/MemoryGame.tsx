// src/components/MemoryGame.tsx

import { useQuizContext } from '@/features/Game/contexts/QuizContext';
import React, { useState, useEffect } from 'react';
import Button from '../buttons/Button';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';

type Card = {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const initialCards: string[] = [
  '🍎',
  '🍌',
  '🍇',
  '🍉',
  '🍓',
  '🍒',
  '🍑',
  '🥝',
];

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const { deposit, stake, setDeposit, setStake, stakeYourAmount } = useQuizContext();
  const [gameOver, setGameOver] = useState(false);
  const [initialModalOpen, setInitialModalOpen] = useState(false);
  const [playModalOpen, setPlayModalOpen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playAgainModalOpen, setPlayAgainModalOpen] = useState(false);

  const closeInitialModal = () => setInitialModalOpen(false);
  const closeGameOverModal = () => setGameOver(false);
  const closePlayAgainModal = () => setPlayAgainModalOpen(false);
  const closePlayModal = () => setPlayModalOpen(false);

  /**
   * Shuffle and initialize the card states
   */
  useEffect(() => {
    resetCards();
  }, []);

  const resetCards = () => {
    const duplicatedCards = [...initialCards, ...initialCards].map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: false,
    }));
    const shuffledCards = duplicatedCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  };

  /**
   * Check for matches whenever two cards are flipped
   */
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards;
      const firstCard = cards.find((card) => card.id === firstId);
      const secondCard = cards.find((card) => card.id === secondId);

      if (firstCard?.value === secondCard?.value) {
        // Mark matched
        setCards((prev) =>
          prev.map((card) =>
            card.value === firstCard?.value ? { ...card, isMatched: true } : card
          )
        );
        setMatchedCount((prev) => prev + 1);
      } else {
        // Flip them back if not matched
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, isFlipped: false }
                : card
            )
          );
        }, 1000);
      }

      // Use up one move
      setTotalMoves((prev) => prev - 1);
      setFlippedCards([]);
    }
  }, [flippedCards, cards]);

  /**
   * If we run out of moves and haven't matched everything, game over
   */
  useEffect(() => {
    if (totalMoves === 0 && matchedCount < initialCards.length && gameStarted) {
      setGameOver(true);
    }
  }, [totalMoves, matchedCount, gameStarted]);

  /**
   * Flip a card if allowed
   */
  const handleCardClick = (id: number) => {
    if (totalMoves === 0 || flippedCards.length === 2) return;

    const clickedCard = cards.find((card) => card.id === id);
    if (clickedCard && !clickedCard.isFlipped && !clickedCard.isMatched) {
      setCards((prev) =>
        prev.map((card) =>
          card.id === id ? { ...card, isFlipped: true } : card
        )
      );
      setFlippedCards((prev) => [...prev, id]);
    }
  };

  /**
   * Reset the entire game (with 10 moves).
   * Usually called after we've confirmed user is paying again.
   */
  const resetGame = () => {
    resetCards();
    setFlippedCards([]);
    setMatchedCount(0);
    setTotalMoves(10);
    setGameOver(false);
    setGameStarted(true); // Mark as started again
  };

  /**
   * Reset the game if user chooses "No" in the Game Over modal, 
   * but do NOT set totalMoves to 10 => remains 0
   */
  const resetGameNoMoves = () => {
    resetCards();
    setFlippedCards([]);
    setMatchedCount(0);
    setTotalMoves(0);   // keep at 0
    setGameOver(false);
    setGameStarted(false);
  };

  /**
   * Deposit & stake
   */
  const handleSelectAmount = async (amount: number) => {
    try {
      await stakeYourAmount(amount.toString());
      setStake((prev: number) => prev + amount);
      setDeposit((prev: number) => prev + amount);
      setInitialModalOpen(false);
    } catch (error: any) {
      console.error('Error in handleSelectAmount:', error);
    }
  };

  /**
   * Called when the user confirms they want to pay 40 to play
   */
  const handleConfirmPlay = () => {
    try {
      if (deposit >= 40) {
        setDeposit((prev: any) => prev - 40);
        setGameStarted(true);
        setTotalMoves(10);
        setPlayModalOpen(false);
      } else {
        toast.error('Not enough deposit to play.');
      }
    } catch (error) {
      console.error('Error in handleConfirmPlay:', error);
      toast.error('An error occurred while confirming play.');
    }
  };

  /**
   * The user clicked "Play" or "Play Again" outside of the game-over scenario
   */
  const handlePlayAgain = () => {
    try {
      if (deposit >= 40) {
        // Show modal for final confirmation
        setPlayModalOpen(true);
      } else {
        // Not enough deposit:
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

  /**
   * If user says "Yes" in Game Over modal => Pay 40, resetGame()
   */
  const handleGameOverPlayAgain = () => {
    if (deposit >= 40) {
      // Subtract cost
      setDeposit((prev: any) => prev - 40);
      // Reset the game with fresh moves
      resetGame();
    } else {
      if (deposit === 0 && stake === 0) {
        setInitialModalOpen(true);
      } else {
        toast.error('Not enough deposit to play again.');
      }
    }
    setGameOver(false);
  };

  /**
   * If user says "No" in Game Over => just reset deck (0 moves)
   */
  const handleGameOverNo = () => {
    resetGameNoMoves();
    // Close the modal
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-6">
      <h1 className="text-white mb-4 text-center text-4xl font-bold">
        Memory Matching
      </h1>

      {/* Stats Row */}
      <div className="mb-4 flex flex-wrap justify-center gap-4 text-center">
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Deposit
          </span>
          <span className="text-lg font-semibold text-green-600 dark:text-green-400">
            {deposit.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Stake
          </span>
          <span className="text-lg font-semibold text-yellow-500 dark:text-yellow-400">
            {stake.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Moves
          </span>
          <span className="text-lg font-semibold text-blue-500 dark:text-blue-400">
            {totalMoves}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            APR
          </span>
          <span className="text-lg font-semibold text-indigo-500 dark:text-indigo-400">
            1%
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`w-20 h-20 bg-blue-700 rounded-lg flex items-center justify-center text-3xl cursor-pointer shadow-lg transform transition-transform duration-300 ${
              card.isFlipped || card.isMatched
                ? 'bg-gray-700 text-white scale-105'
                : 'hover:bg-blue-600'
            }`}
            onClick={() => handleCardClick(card.id)}
          >
            {card.isFlipped || card.isMatched ? card.value : '❓'}
          </div>
        ))}
      </div>

      {/* If user matched all pairs, show "You Won!" */}
      {matchedCount === initialCards.length && (
        <p className="text-2xl mt-4">🎉 You Won! 🎉</p>
      )}

      {/* 1. Initial Modal for deposit & stake */}
      {initialModalOpen && !gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-[85%] max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <IoClose onClick={closeInitialModal} className="cursor-pointer" />
            <h2 className="mb-4 text-center text-2xl font-semibold text-blue-500">
              Choose Deposit & Stake Amount
            </h2>
            <p className="mb-4 text-center text-gray-700 dark:text-gray-300">
              Select an amount to deposit and stake:
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => handleSelectAmount(100)} variant="light">
                $100
              </Button>
              <Button onClick={() => handleSelectAmount(150)} variant="light">
                $150
              </Button>
              <Button onClick={() => handleSelectAmount(200)} variant="light">
                $200
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. "Play" button (if not started and no game over) */}
      {deposit >= 40 && !gameStarted && !gameOver && (
        <Button
          onClick={() => setPlayAgainModalOpen(true)}
          variant="outlined-shadow"
          className="my-4"
        >
          Play
        </Button>
      )}

      {/* 3. Play Confirmation Modal */}
      {playModalOpen && !gameStarted && !gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <IoClose onClick={closePlayModal} className="cursor-pointer" />
            <h2 className="mb-4 text-center text-2xl font-semibold text-blue-500">
              Ready to Play?
            </h2>
            <p className="mb-4 text-center text-gray-700 dark:text-gray-300">
              You need to pay <span className="font-bold">40 USD</span> from your
              deposit to start.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmPlay}
                className="btn bg-green-500 hover:bg-green-600 focus:ring-green-300 rounded-lg px-4 py-2"
              >
                Confirm
              </button>
              <button
                onClick={handleCancelPlay}
                className="btn bg-gray-500 hover:bg-gray-600 focus:ring-gray-300 rounded-lg px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <IoClose onClick={closeGameOverModal} className="cursor-pointer" />
            <h2 className="text-red-500 mb-4 text-center text-2xl font-semibold">
              Game Over
            </h2>
            <p className="mb-4 text-center text-gray-700 dark:text-gray-300">
              You ran out of moves! Do you want to play again?
            </p>
            <div className="flex justify-center gap-4">
              {/* "YES" => Check deposit, subtract 40, resetGame() */}
              <button
                onClick={handleGameOverPlayAgain}
                className="bg-green-500 hover:bg-green-600 focus:ring-green-300 rounded-lg px-4 py-2"
              >
                Yes
              </button>
              {/* "NO" => Reset game with 0 moves */}
              <button
                onClick={handleGameOverNo}
                className="bg-gray-500 hover:bg-gray-600 focus:ring-gray-300 rounded-lg px-4 py-2"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. "Play Again?" Modal (if user chooses to start a new game but isn't game-over) */}
      {playAgainModalOpen && !gameOver && !gameStarted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-[85%] max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <IoClose onClick={closePlayAgainModal} className="cursor-pointer" />
            <h2 className="mb-4 text-center text-2xl font-semibold text-blue-500">
              Play Again?
            </h2>
            <p className="mb-4 text-center text-gray-700 dark:text-gray-300">
              You have enough funds to start a new game. Would you like to
              continue?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handlePlayAgain}
                className="btn bg-green-500 hover:bg-green-600 focus:ring-green-300 rounded-lg px-4 py-2"
              >
                Confirm
              </button>
              <button
                onClick={() => setPlayAgainModalOpen(false)}
                className="btn bg-gray-500 hover:bg-gray-600 focus:ring-gray-300 rounded-lg px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. If deposit < 40 and no game started, let them deposit */}
      {!gameOver && !gameStarted && deposit < 40 && (
        <Button className='mt-4' onClick={() => setInitialModalOpen(true)} variant="light">
          Deposit Amount
        </Button>
      )}
    </div>
  );
};

export default MemoryGame;
