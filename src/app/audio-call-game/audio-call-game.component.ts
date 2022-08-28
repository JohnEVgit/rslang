import { Component } from '@angular/core';

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

  public playGame(): void {
    this.gameStatus = 'play';
    this.isAnswerChosen = false;
  }

  public addClass(event: MouseEvent) {
    this.prevClass?.classList.remove('active');
    (<HTMLElement>event?.target).classList.add('active');
    this.prevClass = (<HTMLElement>event.target);
  }
}
