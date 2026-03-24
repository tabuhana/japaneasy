export type WordOfTheDay = {
  word: string;
  meaning: string;
  furigana: string;
  romaji: string;
  level: number;
};

export type ActionResponse<T = void> = {
  success: boolean;
  message: string;
  data?: T;
};

export type UnitProgress = {
  unitId: string;
  level: string;
  title: string;
  displayOrder: number;
  status: 'locked' | 'active' | 'completed';
  currentWordGroup: number | null;
  wordsNewCount: number;
  wordsLearningCount: number;
  wordsReviewingCount: number;
  wordsMasteredCount: number;
  totalWords: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
};