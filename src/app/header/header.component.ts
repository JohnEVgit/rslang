import {
  Component, OnInit, Output, EventEmitter,
} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})

export class HeaderComponent implements OnInit {
  @Output() toggleMenuEvent = new EventEmitter<boolean>();

  isOpenMenu = false;

  constructor() { }

  ngOnInit(): void {
  }

  toggleMenu(): void {
    this.isOpenMenu = !this.isOpenMenu;
    this.toggleMenuEvent.emit(this.isOpenMenu);
  }

  closeMenu(): void {
    this.isOpenMenu = false;
    this.toggleMenuEvent.emit(this.isOpenMenu);
  }
}
