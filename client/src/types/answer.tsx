export interface Answer {
    id: string;
    playerId: string;
    answer: string;
    correct: boolean;
};

export interface QuizzerAnswer extends Answer {
    myAnswer: string;
};