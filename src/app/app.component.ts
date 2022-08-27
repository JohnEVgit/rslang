import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'rslang';

  isOpenMenu = false;

  openMenu(isOpen: boolean) {
    this.isOpenMenu = isOpen;
  }
}
