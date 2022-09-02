import {
  Component, Output, EventEmitter,
} from '@angular/core';
import { AuthModalService } from '../services/auth-modal.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})

export class HeaderComponent {
  @Output() toggleMenuEvent = new EventEmitter<boolean>();

  constructor(public authModalService: AuthModalService) {

  }

  public visibility = false;

  logoutVis() {
    if (localStorage.length > 0) {
      this.visibility = true;
    }
  }

  isOpenMenu = false;

  toggleMenu(): void {
    this.isOpenMenu = !this.isOpenMenu;
    this.toggleMenuEvent.emit(this.isOpenMenu);
  }

  closeMenu(): void {
    this.isOpenMenu = false;
    this.toggleMenuEvent.emit(this.isOpenMenu);
  }
}
