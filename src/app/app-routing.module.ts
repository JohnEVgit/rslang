import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { TextbookComponent } from './textbook/textbook.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'textbook', component: TextbookComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
