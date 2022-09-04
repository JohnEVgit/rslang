export interface Word {
  id: string;
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
  userWord?: {
    difficulty?: string;
    optional?: {
      rightAnswers?: number;
      wrongAnswers?: number;
    };
  };
}

export interface UserWord {
  difficulty: string;
  optional: {};
}

export interface WordPage {
  paginatedResults: Word[];
  totalCount: number;
}