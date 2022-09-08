/* eslint-disable class-methods-use-this */
import {
  Component, HostListener, OnDestroy, OnInit,
} from '@angular/core';
import { Stats, Word } from '../data/interfaces';
import { AudioCallGameService } from '../services/audio-call-game.service';
import { UserWordsService } from '../services/user-words.service';
import { AuthModalService } from '../services/auth-modal.service';
import { StatisticService } from '../services/statistic.service';

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

  private streak = 0;

  private bestStreak = 0;

  private isBestStreakContinue = true;

  private rightAnswersPercent = 0;

  constructor(
    private audioCallGameService: AudioCallGameService,
    private userWordsService: UserWordsService,
    private authModalService: AuthModalService,
    private statisticService: StatisticService,
  ) { }

  ngOnInit(): void {
    this.randomWordsTranslate = [];
    this.startFromBook = false;
    if ((!this.authModalService.authenticated && this.audioCallGameService.startFromBook)
      || (this.authModalService.authenticated && this.audioCallGameService.startFromBook)) {
      this.startFromBook = true;
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
    if (this.startFromBook) {
      this.isStartDisabled = false;
    } else {
      this.isStartDisabled = true;
    }
    this.isAnswerChosen = false;
    this.rightAnswers = [];
    this.wrongAnswers = [];
    this.streak = 0;
    this.bestStreak = 0;
  }

  public addClass(event: MouseEvent) {
    this.prevClass?.classList.remove('active');
    (<HTMLElement>event?.target).classList.add('active');
    this.prevClass = (<HTMLElement>event.target);
  }

  public chooseLevel(group: number) {
    this.audioCallGameService.group = group;
    this.isStartDisabled = true;
    this.getWords(group);
  }

  private getWords(group: number, page?: number) {
    if (!this.authModalService.authenticated) {
      this.audioCallGameService.getWords(group, page)
        .subscribe((words) => {
          this.randomWords = words;
          this.getRandomWordTranslate();
          this.getRandomAnswers(words);
          this.isStartDisabled = false;
        });
    }
    if (this.authModalService.authenticated && !this.audioCallGameService.startFromBook) {
      const userId = this.authModalService.getUserId()!;
      this.userWordsService.getUserWords(userId, group)
        .subscribe((words) => {
          this.randomWords = words;
          this.getRandomWordTranslate();
          this.getRandomAnswers(words);
          this.isStartDisabled = false;
        });
    }
    if (this.authModalService.authenticated && this.audioCallGameService.startFromBook) {
      const userId = this.authModalService.getUserId()!;
      this.userWordsService.getUserTextbookWords(userId, group, page)
        .subscribe((words) => {
          this.randomWords = words;
          this.getRandomWordTranslate();
          this.getRandomAnswers(words);
          this.isStartDisabled = false;
        });
    }
  }

  private getRandomWordTranslate(): void {
    this.randomWordsTranslate = [];
    if (this.authModalService.authenticated && this.audioCallGameService.startFromBook) {
      this.audioCallGameService.words.forEach((word) => {
        this.randomWordsTranslate.push(word.wordTranslate);
      });
    } else {
      this.randomWords.forEach((element) => this.randomWordsTranslate.push(element.wordTranslate));
    }
  }

  private getRandomAnswers(words: Word[]): void {
    words.forEach((_, index) => {
      const randomAnswers: string[] = [];
      randomAnswers.push(this.randomWords[index].wordTranslate);
      let randomNum = 0;
      while (randomAnswers.length < 5) {
        randomNum = Math.floor(Math.random() * (this.randomWordsTranslate.length));
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
            (stat.optional?.gameAudioCall.percent === undefined
              ? this.rightAnswersPercent : stat.optional?.gameAudioCall.percent) || 0
          )) / 2;
          obj = {
            learnedWords: (this.rightAnswers.length + (stat.learnedWords || 0)),
            optional: {
              gameSprint: {
                bestStreak: stat.optional?.gameSprint.bestStreak || 0,
                percent: stat.optional?.gameSprint.percent || undefined,
                gameLearnedWords: stat.optional?.gameSprint.gameLearnedWords || 0,
              },
              gameAudioCall: {
                bestStreak:
                Math.max(this.bestStreak, (stat.optional?.gameAudioCall.bestStreak || 0)),
                percent: countPercent,
                gameLearnedWords:
                this.rightAnswers.length + (stat.optional?.gameAudioCall.gameLearnedWords || 0),
              },
              // eslint-disable-next-line no-unsafe-optional-chaining
              totalPercent: ((countPercent + stat.optional?.gameSprint.percent!) / 2)
              || countPercent || 0,
            },
          };
          this.statisticService.updateStatistic(userId, obj).subscribe(() => { });
        }, () => {
          obj = {
            learnedWords: this.rightAnswers.length,
            optional: {
              gameSprint: {
                bestStreak: currentStat.optional?.gameSprint.bestStreak || 0,
                percent: currentStat.optional?.gameSprint.percent || undefined,
                gameLearnedWords: currentStat.optional?.gameSprint.gameLearnedWords || 0,
              },
              gameAudioCall: {
                bestStreak: this.bestStreak,
                percent: this.rightAnswersPercent,
                gameLearnedWords: this.rightAnswers.length,
              },
              totalPercent:
              (this.rightAnswersPercent
              + ((currentStat.optional?.gameAudioCall.percent === undefined
                ? this.rightAnswersPercent : currentStat.optional?.gameAudioCall.percent)
                || 0)) / 2 || 0,
            },
          };
          this.statisticService.updateStatistic(userId, obj).subscribe(() => { });
        });
      }
    }
  }

  public checkMouseAnswer(event: MouseEvent, word: string): void {
    if (word === this.wordQuestion?.wordTranslate) {
      (<HTMLElement>event.target).classList.add('right');
      this.rightAnswers.push(this.wordQuestion);
      if (this.authModalService.authenticated) {
        this.userWordsService.createDifficulty(this.randomWords, this.wordIndex, 'studied', true);
      }
      this.getBestStreak();
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
      this.isBestStreakContinue = false;
    }
    this.isAnswerChosen = true;
  }

  public getBestStreak() {
    if (this.isBestStreakContinue) {
      this.streak += 1;
    } else {
      this.isBestStreakContinue = true;
      this.streak = 1;
    }
    this.bestStreak = Math.max(this.streak, this.bestStreak);
  }

  public createAudio(audioPath: string | undefined): void {
    if (audioPath) {
      const audio = new Audio();
      audio.src = `https://angular-learnwords.herokuapp.com/${audioPath}`;
      audio.load();
      audio.play();
    }
  }

  private generateQuestion(word: Word[], i: number): void {
    this.wordQuestion = word[i];
    const options = word[i].responseOptions;
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
        this.getBestStreak();
      }
      if ((elem.textContent === word) && (elem.textContent !== this.wordQuestion?.wordTranslate)) {
        elem.classList.add('wrong');
        this.wrongAnswers.push(this.wordQuestion!);
        if (this.authModalService.authenticated) {
          this.userWordsService.createDifficulty(this.randomWords, this.wordIndex, 'hard', false);
        }
        this.isBestStreakContinue = false;
      } else if (elem.textContent === this.wordQuestion?.wordTranslate) {
        elem.classList.add('right');
      }
    });
    this.isAnswerChosen = true;
  }
}
