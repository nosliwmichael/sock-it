import React, { createContext, useContext, useState } from "react";
import { GameState } from "../../models/gameState";

interface GameStateContextProps {
  gameState: GameState | undefined;
  setGameState: (gameState: GameState | undefined) => void;
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
  const [gameState, setGameState] = useState<GameState | undefined>(undefined);

  const setConvertedGameState = (state: any | undefined) => {
    if (state) {
      state.players = new Map(state.players);
      state.answers = new Map(state.answers.map((a: any) => [a[0], new Map(a[1])]));
    }
    setGameState(state);
  };

  return (
    <GameStateContext.Provider value={{ gameState, setGameState: setConvertedGameState }}>
      {children}
    </GameStateContext.Provider>
  );
};
