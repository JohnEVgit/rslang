import { Injectable } from '@angular/core';
import { UserWord } from '../data/interfaces';
import { HttpClient } from '@angular/common/http';
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
}
