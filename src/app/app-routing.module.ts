import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AudioCallGameComponent } from './audio-call-game/audio-call-game.component';
import { AuthComponent } from './components/auth/auth.component';
import { MainComponent } from './main/main.component';
import { SprintGameComponent } from './sprint-game/sprint-game.component';
import { StatisticComponent } from './statistic/statistic.component';
import { TextbookComponent } from './textbook/textbook.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'textbook', component: TextbookComponent },
  { path: 'audio-call-game', component: AudioCallGameComponent },
  { path: 'sprint-game', component: SprintGameComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'statistic', component: StatisticComponent },
  { path: '**', component: MainComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
