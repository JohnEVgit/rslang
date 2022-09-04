import { Injectable } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserWord, WordPage } from '../data/interfaces';
import { SprintGameService } from './sprint-game.service';

@Injectable({
  providedIn: 'root',
})
export class UserWordsService {
  constructor(private http: HttpClient, private sprintGameService: SprintGameService) { }

  public createUserWord(userId: string, wordId: string, obj: UserWord) {
    return this.http.post(`https://angular-learnwords.herokuapp.com/users/${userId}/words/${wordId}`, obj);
  }

  public updateUserWord(userId: string, wordId: string, obj: UserWord) {
    return this.http.put(`https://angular-learnwords.herokuapp.com/users/${userId}/words/${wordId}`, obj);
  }

  public getUserWords(userId: string, group: number, page?: number) {
    let wordsPage = page;
    if (!page) {
      wordsPage = this.sprintGameService.getRandomPage();
    }
    return this.http
      .get(
        `https://angular-learnwords.herokuapp.com/users/${userId}/aggregatedWords?wordsPerPage=20&filter={"$and": [{"group": ${group}}, {"page": ${wordsPage}}]}`,
      )
      .pipe(
        switchMap((words) => of((words as Array<WordPage>)[0].paginatedResults)),
      );
  }
}
