import { Component } from '@angular/core';
import {Observable, Subject, takeUntil, timer} from 'rxjs';
import { SprintGameService } from '../services/sprint-game.service';
import { Word } from '../data/interfaces';

@Component({
  selector: 'app-sprint-game',
  templateUrl: './sprint-game.component.html',
  styleUrls: ['./sprint-game.component.scss'],
})
export class SprintGameComponent {
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

  constructor(private sprintGameService: SprintGameService) {}

  public chooseLevel(group: number) {
    this.sprintGameService.getWords(group)
      .subscribe((words) => {
        words.forEach((word, index) => {
          this.randomWords.push(word);
        });
        this.generateQuestion();
        this.isStartDisabled = false;
      });
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
      this.gameStatus = 'end';
    }
  }

  public menuGame(): void {
    this.gameStatus = 'menu';
    this.randomWords = [];
    this.wordIndex = 0;
    this.timer.next(0);
    this.currentStreak = 0;
    this.score = 0;
    this.scorePoints = 10;
  }

  public checkMouseAnswer(isRight: boolean) {
    if ((isRight && this.randomWords[this.wordIndex].wordTranslate === this.wordTranslate)
       || (!isRight && this.randomWords[this.wordIndex].wordTranslate !== this.wordTranslate)) {
      this.createAudio('../../assets/audio/answer-right.mp3');
      this.currentStreak += 1;
      this.score += this.scorePoints;
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
    }
    this.wordIndex += 1;
    this.nextQuestion();
  }

  private createAudio(audioPath: string | undefined): void {
    if (audioPath) {
      const audio = new Audio();
      audio.src = audioPath;
      audio.volume = 0.2;
      audio.load();
      audio.play();
    }
  }
}
