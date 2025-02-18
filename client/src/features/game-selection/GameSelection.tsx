import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHeader } from "../../providers/HeaderProvider";

enum GameMode {
  Quizzer = "Quizzer",
  QuizMe = "Quiz Me",
}
const GameModeMap = new Map()
  .set(GameMode.Quizzer, {
    name: GameMode.Quizzer,
    path: "/quizzer",
  })
  .set(GameMode.QuizMe, {
    name: GameMode.Quizzer,
    path: "/quiz-me",
  });

interface GameSelectionProps {
  setSelectedGameMode: (gameMode: any) => void;
}

const GameSelection: React.FC<GameSelectionProps> = (props) => {
  const navigate = useNavigate();
  const { setHeader } = useHeader();

  useEffect(() => {
    setHeader("Select a Game");
  }, [setHeader]);

  const handleButtonClick = (gameMode: string) => {
    props.setSelectedGameMode(GameModeMap.get(gameMode));
    navigate("/room-selection");
  };

  return (
    <div className="GameSelection">
      <div className="button-container">
        <button
          className="button"
          onClick={() => handleButtonClick(GameMode.Quizzer)}
        >
          {GameMode.Quizzer}
        </button>
        <button
          className="button"
          onClick={() => handleButtonClick(GameMode.QuizMe)}
        >
          {GameMode.QuizMe}
        </button>
      </div>
    </div>
  );
};

export default GameSelection;
