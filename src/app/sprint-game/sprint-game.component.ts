
import { Component, HostListener, OnDestroy } from '@angular/core';
import {
  Component, HostListener, OnDestroy, OnInit,
} from '@angular/core';
import { Subject, takeUntil, timer } from 'rxjs';
import { SprintGameService } from '../services/sprint-game.service';
import { Word } from '../data/interfaces';
import { UserWordsService } from '../services/user-words.service';
import { AuthModalService } from '../services/auth-modal.service';

@Component({
  selector: 'app-sprint-game',
  templateUrl: './sprint-game.component.html',
  styleUrls: ['./sprint-game.component.scss'],
})
export class SprintGameComponent implements OnInit, OnDestroy {
  public levels: string[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  public gameStatus = 'menu';

  public prevClass: HTMLElement | undefined;

  public isStartDisabled = true;

  public randomWords: Word[] = [];

  private wordIndex = 0;

  private wordTranslateIndex = 0;

  public word = '';

  public wordTranslate = '';

  public time = 0;

  private timer = new Subject();

  public currentStreak = 0;

  public score = 0;

  public scorePoints = 10;

  public rightAnswers: Word[] = [];

  public wrongAnswers: Word[] = [];

  public rightAnswersPercent = 0;

  public startFromBook = false;

  constructor(
    private sprintGameService: SprintGameService,
    private userWordsService: UserWordsService,
    private authModalService: AuthModalService,
  ) {}

  ngOnInit(): void {
    this.startFromBook = false;
    if ((!this.authModalService.authenticated && this.sprintGameService.startFromBook)
      || (this.authModalService.authenticated && this.sprintGameService.startFromBook)) {
      this.startFromBook = true;
      this.getWords(this.sprintGameService.group, this.sprintGameService.page);
    }
  }

  ngOnDestroy(): void {
    this.menuGame();
    this.sprintGameService.startFromBook = false;
  }

  public chooseLevel(group: number) {
    this.sprintGameService.group = group;
    this.sprintGameService.pagesArray = [];
    this.getWords(this.sprintGameService.group);
  }

  private getWords(group: number, page?: number) {
    this.randomWords = [];
    this.wordIndex = 0;
    if (!this.authModalService.authenticated) {
      this.sprintGameService.getWords(group, page)
        .subscribe((words) => {
          words.forEach((word) => {
            this.randomWords.push(word);
          });
          this.generateQuestion();
          this.isStartDisabled = false;
        });
    } else if (this.authModalService.authenticated && !this.sprintGameService.startFromBook) {
      const userId = this.authModalService.getUserId()!;
      this.userWordsService.getUserWords(userId, group)
        .subscribe((words) => {
          words.forEach((word) => {
            this.randomWords.push(word);
          });
          this.generateQuestion();
          this.isStartDisabled = false;
        });
    } else if (this.authModalService.authenticated && this.sprintGameService.startFromBook) {
      const userId = this.authModalService.getUserId()!;
      this.userWordsService.getUserTextbookWords(userId, group, page)
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
        this.rightAnswersPercent = Math.floor(
          (this.rightAnswers.length / (this.rightAnswers.length + this.wrongAnswers.length)) * 100,
        ) || 0;
      }
    });
  }

  public nextQuestion(): void {
    if (this.wordIndex !== this.randomWords.length) {
      this.generateQuestion();
    } else {
      this.getWords(this.sprintGameService.group);
    }
  }

  public menuGame(): void {
    this.gameStatus = 'menu';
    if (this.startFromBook) {
      this.isStartDisabled = false;
    } else {
      this.isStartDisabled = true;
    }
    this.randomWords = [];
    this.wordIndex = 0;
    this.timer.next(0);
    this.currentStreak = 0;
    this.score = 0;
    this.scorePoints = 10;
    this.rightAnswers = [];
    this.wrongAnswers = [];
    this.sprintGameService.pagesArray = [];
    this.ngOnInit();
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
        this.userWordsService.createDifficulty(this.randomWords, this.wordIndex, 'studied', true);
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
        this.userWordsService.createDifficulty(this.randomWords, this.wordIndex, 'hard', false);
      }
    }
    this.wordIndex += 1;
    this.nextQuestion();
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
