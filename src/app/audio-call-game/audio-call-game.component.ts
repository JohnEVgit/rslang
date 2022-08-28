import { Component } from '@angular/core';
import { Word } from '../data/interfaces';
import { AudioCallGameService } from '../services/audio-call-game.service';

@Component({
  selector: 'app-audio-call-game',
  templateUrl: './audio-call-game.component.html',
  styleUrls: ['./audio-call-game.component.scss'],
})
export class AudioCallGameComponent {
  public levels: string[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  public gameStatus = 'menu';

  public prevClass: HTMLElement | undefined;

  public isAnswerChosen = false;

  public randomWordsTranslate: string[] = [];

  public isStartDisabled = true;

  public randomWords: Word[] = [];

  public wordsPage: number = 0;

  public wordQuestion: Word | undefined;

  constructor(private audioCallGameService: AudioCallGameService) { }

  public playGame(): void {
    this.gameStatus = 'play';
    this.isAnswerChosen = false;
    this.generateQuestion(this.randomWords, this.wordsPage);
  }

  public menuGame() {
    this.gameStatus = 'menu';
    this.wordsPage = 0;
    this.wordQuestion = undefined;
    this.isStartDisabled = true;
    this.isAnswerChosen = false;
  }

  public addClass(event: MouseEvent) {
    this.prevClass?.classList.remove('active');
    (<HTMLElement>event?.target).classList.add('active');
    this.prevClass = (<HTMLElement>event.target);
  }

  public chooseLevel(group: number) {
    this.randomWordsTranslate = this.getRandomWordTranslate();
    this.audioCallGameService.getWords(group)
      .subscribe((words) => {
        this.randomWords = words;
        words.forEach((_, index) => {
          const randomAnswers: string[] = [];
          for (let i = randomAnswers.length; i < 4; i += 1) {
            const randomNum = Math.floor(Math.random() * (this.randomWordsTranslate.length));
            randomAnswers.push(this.randomWordsTranslate[randomNum]);
          }
          this.randomWords[index].responseOptions = randomAnswers;
        });
        this.isStartDisabled = false;
      });
  }

  public nextQuestion() {
    this.isAnswerChosen = false;
    if (this.wordsPage < this.randomWords.length - 1) {
      this.wordsPage += 1;
      this.generateQuestion(this.randomWords, this.wordsPage);
    } else {
      this.wordsPage = 0;
      this.gameStatus = 'end';
    }
  }

  private getRandomWordTranslate(): string[] {
    const randomWordsTranslate: string[] = [];
    for (let i = 0; i <= 5; i += 1) {
      this.audioCallGameService.getWords(i)
        .subscribe((words) => {
          words.forEach((element) => randomWordsTranslate.push(element.wordTranslate));
        });
    }
    return randomWordsTranslate;
  }

  private generateQuestion(word: Word[], i: number): void {
    this.wordQuestion = word[i];
    const options = word[i].responseOptions;
    options?.push(word[i].wordTranslate);
    this.shuffleArray(options!);
    this.wordQuestion.responseOptions = options;
  }

  private shuffleArray(array: string[]) {
    array.sort(() => Math.random() - 0.5);
  }
}
