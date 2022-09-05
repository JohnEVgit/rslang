import {
  Component, HostListener, OnDestroy, OnInit,
} from '@angular/core';
import { Word } from '../data/interfaces';
import { AudioCallGameService } from '../services/audio-call-game.service';
import { UserWordsService } from '../services/user-words.service';
import { AuthModalService } from '../services/auth-modal.service';

@Component({
  selector: 'app-audio-call-game',
  templateUrl: './audio-call-game.component.html',
  styleUrls: ['./audio-call-game.component.scss'],
})
export class AudioCallGameComponent implements OnInit, OnDestroy {
  public levels: string[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  public gameStatus = 'menu';

  public prevClass: HTMLElement | undefined;

  public isAnswerChosen = false;

  public randomWordsTranslate: string[] = [];

  public isStartDisabled = true;

  public randomWords: Word[] = [];

  public wordIndex: number = 0;

  public wordQuestion: Word | undefined;

  public rightAnswers: Word[] = [];

  public wrongAnswers: Word[] = [];

  public startFromBook = false;

  constructor(
    private audioCallGameService: AudioCallGameService,
    private userWordsService: UserWordsService,
    private authModalService: AuthModalService,
  ) { }

  ngOnInit(): void {
    this.startFromBook = false;
    if ((!this.authModalService.authenticated && this.audioCallGameService.startFromBook)
      || (this.authModalService.authenticated && this.audioCallGameService.startFromBook)) {
      this.startFromBook = true;
      this.randomWordsTranslate = this.getRandomWordTranslate();
      this.getWords(this.audioCallGameService.group, this.audioCallGameService.page);
    }
  }

  ngOnDestroy(): void {
    this.menuGame();
    this.audioCallGameService.startFromBook = false;
  }

  public playGame(): void {
    this.gameStatus = 'play';
    this.isAnswerChosen = false;
    this.generateQuestion(this.randomWords, this.wordIndex);
  }

  public menuGame() {
    this.gameStatus = 'menu';
    this.wordIndex = 0;
    this.wordQuestion = undefined;
    this.randomWords = [];
    if (this.startFromBook) {
      this.isStartDisabled = false;
    } else {
      this.isStartDisabled = true;
    }
    this.isAnswerChosen = false;
    this.rightAnswers = [];
    this.wrongAnswers = [];
    this.ngOnInit();
  }

  public addClass(event: MouseEvent) {
    this.prevClass?.classList.remove('active');
    (<HTMLElement>event?.target).classList.add('active');
    this.prevClass = (<HTMLElement>event.target);
  }

  public chooseLevel(group: number) {
    this.isStartDisabled = true;
    this.randomWordsTranslate = this.getRandomWordTranslate();
    this.getWords(group);
  }

  private getWords(group: number, page?: number) {
    if (!this.authModalService.authenticated) {
      this.audioCallGameService.getWords(group, page)
        .subscribe((words) => {
          console.log(words);
          this.getRandomAnswers(words);
          this.isStartDisabled = false;
        });
    }
    if (this.authModalService.authenticated && !this.audioCallGameService.startFromBook) {
      const userId = this.authModalService.getUserId()!;
      this.userWordsService.getUserWords(userId, group)
        .subscribe((words) => {
          this.getRandomAnswers(words);
          this.isStartDisabled = false;
        });
    }
    if (this.authModalService.authenticated && this.audioCallGameService.startFromBook) {
      const userId = this.authModalService.getUserId()!;
      this.userWordsService.getUserTextbookWords(userId, group, page)
        .subscribe((words) => {
          this.getRandomAnswers(words);
          this.isStartDisabled = false;
        });
    }
  }

  private getRandomAnswers(words: Word[]): void {
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
  }

  public nextQuestion() {
    this.isAnswerChosen = false;
    document.querySelectorAll('.answer__btn').forEach((elem) => {
      elem.classList.remove('right');
      elem.classList.remove('wrong');
    });
    if (this.wordIndex < this.randomWords.length - 1) {
      this.wordIndex += 1;
      this.generateQuestion(this.randomWords, this.wordIndex);
    } else {
      this.wordIndex = 0;
      this.gameStatus = 'end';
    }
  }

  public checkMouseAnswer(event: MouseEvent, word: string): void {
    if (word === this.wordQuestion?.wordTranslate) {
      (<HTMLElement>event.target).classList.add('right');
      this.rightAnswers.push(this.wordQuestion);
      if (this.authModalService.authenticated) {
        this.userWordsService.createDifficulty(this.randomWords, this.wordIndex, 'studied', true);
      }
    } else {
      (<HTMLElement>event.target).classList.add('wrong');
      if (this.wordQuestion) {
        this.wrongAnswers.push(this.wordQuestion);
      }
      if (this.authModalService.authenticated) {
        this.userWordsService.createDifficulty(this.randomWords, this.wordIndex, 'hard', false);
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
        if (this.authModalService.authenticated) {
          this.userWordsService.createDifficulty(this.randomWords, this.wordIndex, 'studied', true);
        }
      }
      if ((elem.textContent === word) && (elem.textContent !== this.wordQuestion?.wordTranslate)) {
        elem.classList.add('wrong');
        this.wrongAnswers.push(this.wordQuestion!);
        if (this.authModalService.authenticated) {
          this.userWordsService.createDifficulty(this.randomWords, this.wordIndex, 'hard', false);
        }
      } else if (elem.textContent === this.wordQuestion?.wordTranslate) {
        elem.classList.add('right');
      }
    });
    this.isAnswerChosen = true;
  }
}
