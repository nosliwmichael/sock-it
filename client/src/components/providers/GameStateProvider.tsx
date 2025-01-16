import React, { createContext, useContext, useState } from "react";
import { GameState } from "../../models/gameState";

interface GameStateContextProps {
  gameState: GameState;
  setGameState: (gameState: GameState) => void;
}

interface GameStateProviderProps {
  children: React.ReactNode;
}

const GameStateContext = createContext<GameStateContextProps | undefined>(
  undefined
);

export const useGameState = (): GameStateContextProps => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error("useSocket must be used within a GameStateProvider");
  }
  return context;
};

export const GameStateProvider: React.FC<GameStateProviderProps> = ({
  children,
}) => {
  const [gameState, setGameState] = useState<GameState>({
    players: new Map(),
    questions: [],
    answers: [],
    round: 0,
    isAnswering: false,
  });

  return (
    <GameStateContext.Provider value={{ gameState, setGameState }}>
      {children}
    </GameStateContext.Provider>
  );
};
