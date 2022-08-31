import { Component } from '@angular/core';
import { timer } from 'rxjs';
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

  public time = 30;

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
    console.log(this.randomWords);
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
    this.gameStatus = 'play';
    timer(1000, 1000).subscribe(() => {
      this.time -= 1;
      if (this.time === 0) {
        this.gameStatus = 'end';
      }
    });
  }

  public nextQuestion(): void {
    this.generateQuestion();
  }

  public menuGame(): void {
    this.gameStatus = 'menu';
    this.randomWords = [];
    this.wordIndex = 0;
    this.time = 30;
  }

  public checkMouseAnswer(isRight: boolean) {
    if (isRight && this.randomWords[this.wordIndex].wordTranslate === this.wordTranslate) {
      console.log(true);
    } else if (!isRight && this.randomWords[this.wordIndex].wordTranslate !== this.wordTranslate) {
      console.log(true);
    } else {
      console.log(false);
    }
    this.wordIndex += 1;
    this.nextQuestion();
  }
}
