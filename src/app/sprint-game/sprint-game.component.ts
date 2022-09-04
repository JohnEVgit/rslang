import {Component, HostListener, OnDestroy} from '@angular/core';
import { Subject, takeUntil, timer } from 'rxjs';
import { SprintGameService } from '../services/sprint-game.service';
import {UserWord, Word} from '../data/interfaces';
import { UserWordsService } from '../services/user-words.service';
import { AuthModalService } from '../services/auth-modal.service';

@Component({
  selector: 'app-sprint-game',
  templateUrl: './sprint-game.component.html',
  styleUrls: ['./sprint-game.component.scss'],
})
export class SprintGameComponent implements OnDestroy {
  public levels: string[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  public gameStatus = 'menu';

  public prevClass: HTMLElement | undefined;

  public isStartDisabled = true;

  public randomWords: Word[] = [];

  private wordIndex = 0;

  private wordTranslateIndex = 0;

  private group = 0;

  public word = '';

  public wordTranslate = '';

  public time = 0;

  private timer = new Subject();

  public currentStreak = 0;

  public score = 0;

  public scorePoints = 10;

  public rightAnswers: Word[] = [];

  public wrongAnswers: Word[] = [];

  constructor(
    private sprintGameService: SprintGameService,
    private userWordsService: UserWordsService,
    private authModalService: AuthModalService,
  ) {}

  ngOnDestroy(): void {
    this.menuGame();
  }

  public chooseLevel(group: number) {
    this.group = group;
    this.sprintGameService.pagesArray = [];
    this.getWords(this.group);
  }

  private getWords(group: number) {
    this.randomWords = [];
    this.wordIndex = 0;
    if (!this.authModalService.authenticated) {
      this.sprintGameService.getWords(group)
        .subscribe((words) => {
          words.forEach((word) => {
            this.randomWords.push(word);
          });
          this.generateQuestion();
          this.isStartDisabled = false;
        });
    } else {
      const userId = this.authModalService.getUserId()!;
      this.userWordsService.getUserWords(userId, group)
        .subscribe((words) => {
          words.forEach((word) => {
            this.randomWords.push(word);
          });
          this.generateQuestion();
          this.isStartDisabled = false;
        });
    }
  }

  private generateQuestion(): void {
    this.word = this.randomWords[this.wordIndex].word;
    this.wordTranslate = this.randomWords[this.getRandomTranslateIndex()].wordTranslate;
  }

  private getRandomTranslateIndex(): number {
    if (Math.random() >= 0.5) {
      this.wordTranslateIndex = this.wordIndex;
    } else {
      this.wordTranslateIndex = Math.floor(Math.random() * (this.randomWords.length - 1));
      while (this.wordIndex === this.wordTranslateIndex) {
        this.wordTranslateIndex = Math.floor(Math.random() * (this.randomWords.length - 1));
      }
    }
    return this.wordTranslateIndex;
  }

  public addClass(event: MouseEvent) {
    this.prevClass?.classList.remove('active');
    (<HTMLElement>event?.target).classList.add('active');
    this.prevClass = (<HTMLElement>event.target);
  }

  public playGame(): void {
    this.time = 30;
    this.gameStatus = 'play';
    timer(1000, 1000).pipe(takeUntil(this.timer)).subscribe(() => {
      this.time -= 1;
      if (this.time === 0) {
        this.gameStatus = 'end';
      }
    });
  }

  public nextQuestion(): void {
    if (this.wordIndex !== this.randomWords.length) {
      this.generateQuestion();
    } else {
      this.getWords(this.group);
    }
  }

  public menuGame(): void {
    this.gameStatus = 'menu';
    this.isStartDisabled = true;
    this.randomWords = [];
    this.wordIndex = 0;
    this.timer.next(0);
    this.currentStreak = 0;
    this.score = 0;
    this.scorePoints = 10;
    this.rightAnswers = [];
    this.wrongAnswers = [];
    this.sprintGameService.pagesArray = [];
  }

  public checkAnswer(isRight: boolean) {
    const word: Word = this.randomWords[this.wordIndex];
    if ((isRight && word.wordTranslate === this.wordTranslate)
       || (!isRight && word.wordTranslate !== this.wordTranslate)) {
      this.createAudio('../../assets/audio/answer-right.mp3');
      this.currentStreak += 1;
      this.score += this.scorePoints;
      this.rightAnswers.push(word);
      if (this.authModalService.authenticated) {
        this.createDifficulty('studied', true);
      }
      if (this.currentStreak === 3) {
        this.currentStreak = 0;
        if (this.scorePoints < 80) {
          this.scorePoints *= 2;
        }
      }
    } else {
      this.createAudio('../../assets/audio/answer-wrong.mp3');
      this.currentStreak = 0;
      this.scorePoints = 10;
      this.wrongAnswers.push(word);
      if (this.authModalService.authenticated) {
        this.createDifficulty('hard', false);
      }
    }
    this.wordIndex += 1;
    this.nextQuestion();
  }

  private createDifficulty(difficulty: string, isRight: boolean) {
    const userId = this.authModalService.getUserId()!;
    let wrongAnswers = 0;
    let rightAnswers = 0;
    let obj: UserWord = {
      difficulty,
      optional: { rightAnswers: isRight ? 1 : 0, wrongAnswers: !isRight ? 1 : 0 },
    };
    if ((this.randomWords[this.wordIndex] as Word)
      .userWord?.optional) {
      rightAnswers = (this.randomWords[this.wordIndex] as Word)
        .userWord?.optional?.rightAnswers!;
      wrongAnswers = (this.randomWords[this.wordIndex] as Word)
        .userWord?.optional?.wrongAnswers!
      if (isRight) {
        rightAnswers += 1;
      } else {
        wrongAnswers += 1;
      }
      obj = {
        difficulty,
        optional: { rightAnswers, wrongAnswers },
      };
    }

    if ((this.randomWords[this.wordIndex] as Word).userWord?.difficulty) {
      this.userWordsService
        .updateUserWord(userId, (this.randomWords[this.wordIndex])._id, obj)
        .subscribe(() => {});
    } else {
      this.userWordsService
        .createUserWord(userId, (this.randomWords[this.wordIndex])._id, obj)
        .subscribe(() => {});
    }
  }

  public createAudio(audioPath: string | undefined, isWordAudio?: boolean): void {
    if (audioPath) {
      const audio = new Audio();
      if (isWordAudio) {
        audio.src = `https://angular-learnwords.herokuapp.com/${audioPath}`;
      } else {
        audio.src = audioPath;
        audio.volume = 0.2;
      }
      audio.load();
      audio.play();
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.gameStatus === 'play') {
      if (event.key === 'ArrowRight') {
        this.checkAnswer(true);
      }
      if (event.key === 'ArrowLeft') {
        this.checkAnswer(false);
      }
      if (event.key === 'Escape') {
        this.menuGame();
      }
    }
  }
}
