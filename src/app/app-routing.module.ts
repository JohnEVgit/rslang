import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioCallGameComponent } from './audio-call-game/audio-call-game.component';
import { MainComponent } from './main/main.component';
import { TextbookComponent } from './textbook/textbook.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'textbook', component: TextbookComponent },
  { path: 'audio-call-game', component: AudioCallGameComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
