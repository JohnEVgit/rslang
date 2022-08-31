import { Component } from '@angular/core';
import { SprintGameService } from '../services/sprint-game.service';
import { Word } from '../data/interfaces';

@Component({
  selector: 'app-sprint-game',
  templateUrl: './sprint-game.component.html',
  styleUrls: ['./sprint-game.component.scss']
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

  constructor(private sprintGameService: SprintGameService) {}

  public chooseLevel(group: number) {
    this.sprintGameService.getWords(group)
      .subscribe((words) => {
        words.forEach((word, index) => {
          this.randomWords.push(word);
        });
        this.getWord();
        this.isStartDisabled = false;
      });
    console.log(this.randomWords);
  }

  private getWord(): void {
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
  }

  public nextQuestion(): void {
    this.getWord();
    this.wordIndex += 1;
    console.log(this.word);
    console.log(this.wordTranslate);
    console.log(this.wordIndex)
  }
}
