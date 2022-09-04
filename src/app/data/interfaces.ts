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
  userWord?: {
    difficulty?: string;
    optional?: {};
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
