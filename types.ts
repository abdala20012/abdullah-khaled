
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: number; // 1 to 15
}

export interface GameState {
  currentLevel: number;
  score: number;
  isGameOver: boolean;
  hasWon: boolean;
  usedLifelines: {
    fiftyFifty: boolean;
    callFriend: boolean;
    changeQuestion: boolean;
  };
  hiddenOptions: number[]; // indices of options hidden by 50/50
}

export const PRIZES = [
  "100", "200", "300", "500", "1,000",
  "2,000", "4,000", "8,000", "16,000", "32,000",
  "64,000", "125,000", "250,000", "500,000", "1,000,000"
];
