import { Injectable } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserWord, WordPage } from '../data/interfaces';
import { AuthModalService } from './auth-modal.service';

@Injectable({
  providedIn: 'root',
})
export class UserWordsService {
  constructor(private http: HttpClient, private authModalService: AuthModalService) { }

  public createUserWord(wordId: string, obj: UserWord) {
    const userId = this.authModalService.getUserId();
    return this.http.post(`https://angular-learnwords.herokuapp.com/users/${userId}/words/${wordId}`, obj);
  }

  public updateUserWord(userId: string, wordId: string, obj: UserWord) {
    return this.http.put(`https://angular-learnwords.herokuapp.com/users/${userId}/words/${wordId}`, obj);
  }

  public getUserTextbookWords(userId: string, group: number, page: number) {
    return this.http
      .get(
        `https://angular-learnwords.herokuapp.com/users/${userId}/aggregatedWords?wordsPerPage=20&filter={"$and": [{"group": ${group}}, {"page": ${page}}]}`,
      )
      .pipe(
        switchMap((words) => of((words as Array<WordPage>)[0].paginatedResults)),
      );
  }
}
