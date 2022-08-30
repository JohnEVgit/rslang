import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioCallGameComponent } from './audio-call-game/audio-call-game.component';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'audio-call-game', component: AudioCallGameComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
