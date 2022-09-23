/* eslint-disable class-methods-use-this */
import {
  Component, HostListener, OnDestroy, OnInit,
} from '@angular/core';
import { Subject, takeUntil, timer } from 'rxjs';
import { SprintGameService } from '../services/sprint-game.service';
import { Stats, Word } from '../data/interfaces';
import { UserWordsService } from '../services/user-words.service';
import { AuthModalService } from '../services/auth-modal.service';
import { StatisticService } from '../services/statistic.service';
import { backendUrl, lastPage, rightAnswerAudioPath, wrongAnswerAudioPath } from '../data/constants';

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

  private streak = 0;

  private bestStreak = 0;

  private isBestStreakContinue = true;

  constructor(
    private sprintGameService: SprintGameService,
    private userWordsService: UserWordsService,
    private authModalService: AuthModalService,
    private statisticService: StatisticService,
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

  public chooseLevel(group: number): void {
    this.sprintGameService.group = group;
    this.sprintGameService.pagesArray = [];
    this.getWords(this.sprintGameService.group);
  }

  private getWords(group: number, page?: number): void {
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
      this.userWordsService.getUserWords(userId, group, page)
        .subscribe((words) => {
          this.randomWords = words;
          this.addAdditionalWords(userId, group, page);
        });
    }
  }

  private addAdditionalWords(userId: string, group: number, page?: number): void {
    let newPage = page;
    if (newPage !== undefined && newPage !== lastPage) {
      newPage += 1;
      this.userWordsService.getUserWords(userId, group, newPage).subscribe((newWords) => {
        if (newWords.length) {
          newWords.forEach((newWord) => {
            if (this.randomWords.length < 200) {
              this.randomWords.push(newWord);
            }
          });
          if (this.randomWords.length < 200) {
            this.addAdditionalWords(userId, group, newPage);
          } else {
            this.generateQuestion();
            this.isStartDisabled = false;
          }
        }
      });
    } else {
      this.generateQuestion();
      this.isStartDisabled = false;
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

  public addClass(event: MouseEvent): void {
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
        if (this.authModalService.authenticated) {
          const userId = this.authModalService.getUserId()!;
          let obj: Stats = {};
          let currentStat: Stats = {};
          this.statisticService.getStatistic(userId).subscribe((stat: Stats) => {
            currentStat = stat;
            const countPercent = (this.rightAnswersPercent + (
              (stat.optional?.gameSprint.percent === undefined
                ? this.rightAnswersPercent : stat.optional?.gameSprint.percent) || 0)) / 2;
            obj = {
              learnedWords: (this.rightAnswers.length + (stat.learnedWords || 0)),
              optional: {
                gameSprint: {
                  bestStreak:
                  Math.max(this.bestStreak, (stat.optional?.gameSprint.bestStreak || 0)),
                  percent: countPercent,
                  gameLearnedWords:
                  this.rightAnswers.length + (stat.optional?.gameSprint.gameLearnedWords || 0),
                },
                gameAudioCall: {
                  bestStreak: stat.optional?.gameAudioCall.bestStreak || 0,
                  percent: stat.optional?.gameAudioCall.percent || undefined,
                  gameLearnedWords: stat.optional?.gameAudioCall.gameLearnedWords || 0,
                },
                // eslint-disable-next-line no-unsafe-optional-chaining
                totalPercent: ((stat.optional?.gameAudioCall.percent! + countPercent) / 2)
                  || countPercent || 0,
              },
            };
            this.statisticService.updateStatistic(userId, obj).subscribe(() => { });
          }, () => {
            obj = {
              learnedWords: this.rightAnswers.length,
              optional: {
                gameSprint: {
                  bestStreak: this.bestStreak,
                  percent: this.rightAnswersPercent,
                  gameLearnedWords: this.rightAnswers.length,
                },
                gameAudioCall: {
                  bestStreak: currentStat?.optional?.gameAudioCall.bestStreak || 0,
                  percent: currentStat?.optional?.gameAudioCall.percent || undefined,
                  gameLearnedWords: currentStat.optional?.gameAudioCall.gameLearnedWords || 0,
                },
                totalPercent:
                (this.rightAnswersPercent
                   + ((currentStat.optional?.gameSprint.percent === undefined
                     ? this.rightAnswersPercent : currentStat.optional?.gameSprint.percent)
                     || 0)) / 2 || 0,
              },
            };
            this.statisticService.updateStatistic(userId, obj).subscribe(() => { });
          });
        }
      }
    });
  }

  public nextQuestion(): void {
    if (this.wordIndex !== this.randomWords.length - 1) {
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
    this.streak = 0;
    this.bestStreak = 0;
  }

  public checkAnswer(isRight: boolean): void {
    const word: Word = this.randomWords[this.wordIndex];
    if ((isRight && word.wordTranslate === this.wordTranslate)
       || (!isRight && word.wordTranslate !== this.wordTranslate)) {
      this.createAudio(rightAnswerAudioPath);
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
      if (this.isBestStreakContinue) {
        this.streak += 1;
      } else {
        this.isBestStreakContinue = true;
        this.streak = 1;
      }
      this.bestStreak = Math.max(this.streak, this.bestStreak);
    } else {
      this.createAudio(wrongAnswerAudioPath);
      this.currentStreak = 0;
      this.scorePoints = 10;
      this.wrongAnswers.push(word);
      if (this.authModalService.authenticated) {
        this.userWordsService.createDifficulty(this.randomWords, this.wordIndex, 'hard', false);
      }
      this.isBestStreakContinue = false;
    }
    this.wordIndex += 1;
    this.nextQuestion();
  }

  public createAudio(audioPath: string | undefined, isWordAudio?: boolean): void {
    if (audioPath) {
      const audio = new Audio();
      if (isWordAudio) {
        audio.src = `${backendUrl}/${audioPath}`;
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
