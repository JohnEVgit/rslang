import { Component } from '@angular/core';
import { AuthModalService } from './services/auth-modal.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public authModalService: AuthModalService) {

  }

  title = 'rslang';

  isOpenMenu = false;

  openMenu(isOpen: boolean) {
    this.isOpenMenu = isOpen;
  }
}
