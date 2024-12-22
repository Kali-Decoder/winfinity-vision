// src/components/MemoryGame.tsx

import { useQuizContext } from '@/features/Game/contexts/QuizContext';
import React, { useState, useEffect } from 'react';
import Button from '../buttons/Button';
import { IoClose } from 'react-icons/io5';
import { toast } from 'react-hot-toast';
type Card = {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const initialCards: string[] = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍑', '🥝'];

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const { deposit, stake, setDeposit, setStake, stakeYourAmount } =
  useQuizContext();
  const [gameOver, setGameOver] = useState(false);
  const [initialModalOpen, setInitialModalOpen] = useState(false);
  const [playModalOpen, setPlayModalOpen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playAgainModalOpen, setPlayAgainModalOpen] = useState(false);
  const closeInitialModal = () => setInitialModalOpen(false);
  const closeGameOverModal = () => setGameOver(false); // Adjust as needed
  const closePlayAgainModal = () => setPlayAgainModalOpen(false);
  const closePlayModal = () => setPlayModalOpen(false);
  useEffect(() => {
    // Initialize and shuffle cards
    const duplicatedCards = [...initialCards, ...initialCards].map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: false,
    }));
    const shuffledCards = duplicatedCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [firstId, secondId] = flippedCards;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);
      if (firstCard?.value === secondCard?.value) {
        setCards(prev =>
          prev.map(card =>
            card.value === firstCard?.value ? { ...card, isMatched: true } : card
          )
        );
        setMatchedCount(prev => prev + 1);
      } else {
        setTimeout(() => {
          setCards(prev =>
            prev.map(card =>
              card.id === firstId || card.id === secondId
                ? { ...card, isFlipped: false }
                : card
            )
          );
        }, 1000);
      }
    
      setTotalMoves(prev => prev - 1);
      setFlippedCards([]);
    }
  }, [flippedCards, cards]);

  const handleCardClick = (id: number) => {
    const clickedCard = cards.find(card => card.id === id);
    if (clickedCard && !clickedCard.isFlipped && !clickedCard.isMatched && flippedCards.length < 2) {
      setCards(prev =>
        prev.map(card =>
          card.id === id ? { ...card, isFlipped: true } : card
        )
      );
      setFlippedCards(prev => [...prev, id]);
    }
  };

  const resetGame = () => {
    const duplicatedCards = [...initialCards, ...initialCards].map((value, index) => ({
      id: index,
      value,
      isFlipped: false,
      isMatched: false,
    }));
    const shuffledCards = duplicatedCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedCount(0);
    setTotalMoves(10);
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
      
    } catch (error: any) {
      console.error('Error in handleSelectAmount:', error);
  
    }
  }

  const handleConfirmPlay = () => {
    try {
      if (deposit >= 40) {
        setDeposit((prev: any) => prev - 40);
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
      if (deposit >= 40) {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-white p-6">
      <h1 className="text-white mb-4 text-center text-4xl font-bold">Memory Matching</h1>
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
          <span className='text-sm text-gray-600 dark:text-gray-400'>Moves</span>
          <span className='text-lg font-semibold text-blue-500 dark:text-blue-400'>
            {totalMoves}
          </span>
        </div>
       
        <div className='flex flex-col items-center'>
          <span className='text-sm text-gray-600 dark:text-gray-400'>APR</span>
          <span className='text-lg font-semibold text-indigo-500 dark:text-indigo-400'>1%</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6">
        {cards.map(card => (
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
      <div className="mt-8 text-center">
        
        {matchedCount === initialCards.length && <p className="text-2xl mt-4">🎉 You Won! 🎉</p>}

        {initialModalOpen && !gameOver && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <div className='relative w-[85%] max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
            <IoClose onClick={closeInitialModal} />
            <h2 className='mb-4 text-center text-2xl font-semibold text-blue-500'>
              Choose Deposit & Stake Amount
            </h2>
            <p className='mb-4 text-center text-gray-700 dark:text-gray-300'>
              Select an amount to deposit and stake:
            </p>
            <div className='flex flex-col gap-2'>
              <Button
                onClick={() => handleSelectAmount(100)}
                variant='light'
                
              >
                $100
              </Button>
              <Button
                onClick={() => handleSelectAmount(150)}
                variant='light'
                
              >
                $150
              </Button>
              <Button
                onClick={() => handleSelectAmount(200)}
                variant='light'
                
              >
                $200
              </Button>
            </div>
          </div>
        </div>
      )}

{deposit >= 40 && !gameStarted && !gameOver && (
        <Button
          onClick={() => setPlayAgainModalOpen(true)}
          variant='outlined-shadow'
          className='mb-4'
          
        >
          Play
        </Button>
      )}
 
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
            
            <div className='flex flex-col items-center gap-4'>
              <button
                onClick={resetGame}
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
          <div className='relative w-[85%] max-w-sm rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
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
      {deposit < 40 && !gameStarted && !gameOver && (
        <Button
          onClick={() => setInitialModalOpen(true)}
          variant='light'
         
        >
          Deposit Amount
        </Button>
      )}
      
      </div>
    </div>
  );
};

export default MemoryGame;
