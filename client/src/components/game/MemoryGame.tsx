// src/components/MemoryGame.tsx

import React, { useState, useEffect } from 'react';

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
  const [moves, setMoves] = useState(0);

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
      setMoves(prev => prev + 1);
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
    setMoves(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-white p-6">
      <h1 className="text-white mb-4 text-center text-4xl font-bold">Memory Matching</h1>
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
        <p className="text-lg">Moves: {moves}</p>
        {matchedCount === initialCards.length && <p className="text-2xl mt-4">🎉 You Won! 🎉</p>}
        <button
          className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
          onClick={resetGame}
        >
          Restart Game
        </button>
      </div>
    </div>
  );
};

export default MemoryGame;
