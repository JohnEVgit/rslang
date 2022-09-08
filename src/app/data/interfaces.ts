export interface Word {
  id: string;
  _id: string;
  group: number;
  page: number;
  word: string;
  image: string;
  audio: string;
  audioMeaning: string;
  audioExample: string;
  textMeaning: string;
  textExample: string;
  transcription: string;
  wordTranslate: string;
  textMeaningTranslate: string;
  textExampleTranslate: string;
  responseOptions?: string[];
  userWord?: UserWord;
}

export interface UserWord {
  difficulty: string;
  optional?: Statistic;
}

export interface Statistic {
  rightAnswers?: number;
  wrongAnswers?: number;
}

export interface WordPage {
  paginatedResults: Word[];
  totalCount: number;
}

export interface Stats {
  learnedWords?: number;
  optional?: GamesData;
}

export interface GamesData {
  gameSprint: GameData;
  gameAudioCall: GameData;
  totalPercent: number;
}

export interface GameData {
  bestStreak: number;
  percent: number | undefined;
  gameLearnedWords: number;
}


