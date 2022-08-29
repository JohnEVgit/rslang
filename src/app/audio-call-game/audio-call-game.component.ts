import {Component, HostListener} from '@angular/core';
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

  public rightAnswers: Word[] = [];

  public wrongAnswers: Word[] = [];

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
    this.rightAnswers = [];
    this.wrongAnswers = [];
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
            let randomNum = Math.floor(Math.random() * (this.randomWordsTranslate.length));
            while (randomAnswers.includes(this.randomWordsTranslate[randomNum])) {
              randomNum = Math.floor(Math.random() * (this.randomWordsTranslate.length));
            }
            randomAnswers.push(this.randomWordsTranslate[randomNum]);
          }
          this.randomWords[index].responseOptions = randomAnswers;
        });
        this.isStartDisabled = false;
      });
  }

  public nextQuestion() {
    this.isAnswerChosen = false;
    document.querySelectorAll('.answer__btn').forEach((elem) => {
      elem.classList.remove('right');
      elem.classList.remove('wrong');
    });
    if (this.wordsPage < this.randomWords.length - 1) {
      this.wordsPage += 1;
      this.generateQuestion(this.randomWords, this.wordsPage);
    } else {
      this.wordsPage = 0;
      this.gameStatus = 'end';
    }
  }

  public checkMouseAnswer(event: MouseEvent, word: string): void {
    if (word === this.wordQuestion?.wordTranslate) {
      (<HTMLElement>event.target).classList.add('right');
      this.rightAnswers.push(this.wordQuestion);
    } else {
      (<HTMLElement>event.target).classList.add('wrong');
      if (this.wordQuestion) {
        this.wrongAnswers.push(this.wordQuestion);
      }
      document.querySelectorAll('.answer__btn').forEach((elem) => {
        if (elem.textContent === this.wordQuestion?.wordTranslate) {
          elem.classList.add('right');
        }
      });
    }
    this.isAnswerChosen = true;
  }

  public createAudio(audioPath: string | undefined): void {
    if (audioPath) {
      const audio = new Audio();
      audio.src = `https://angular-learnwords.herokuapp.com/${audioPath}`;
      audio.load();
      audio.play();
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
    this.createAudio(this.wordQuestion?.audio);
  }

  private shuffleArray(array: string[]): void {
    array.sort(() => Math.random() - 0.5);
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.gameStatus === 'play') {
      if (!this.isAnswerChosen) {
        switch (event.key) {
          case '1': this.checkKeyboardAnswer(this.wordQuestion?.responseOptions?.[0]);
            break;
          case '2': this.checkKeyboardAnswer(this.wordQuestion?.responseOptions?.[1]);
            break;
          case '3': this.checkKeyboardAnswer(this.wordQuestion?.responseOptions?.[2]);
            break;
          case '4': this.checkKeyboardAnswer(this.wordQuestion?.responseOptions?.[3]);
            break;
          case '5': this.checkKeyboardAnswer(this.wordQuestion?.responseOptions?.[4]);
            break;
          default: break;
        }
      } else if (event.code === 'Space') {
        this.nextQuestion();
      }
      switch (event.key) {
        case 'Escape': this.menuGame();
          break;
        case 'Enter': this.createAudio(this.wordQuestion?.audio);
          break;
        default: break;
      }
    }
  }

  public checkKeyboardAnswer(word: string | undefined): void {
    document.querySelectorAll('.answer__btn').forEach((elem) => {
      if ((elem.textContent === word) && (elem.textContent === this.wordQuestion?.wordTranslate)) {
        elem.classList.add('right');
        this.rightAnswers.push(this.wordQuestion);
      }
      if ((elem.textContent === word) && (elem.textContent !== this.wordQuestion?.wordTranslate)) {
        elem.classList.add('wrong');
        this.wrongAnswers.push(this.wordQuestion!);
      } else if (elem.textContent === this.wordQuestion?.wordTranslate) {
        elem.classList.add('right');
      }
    });
    this.isAnswerChosen = true;
  }
}
