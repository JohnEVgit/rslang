import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Word } from '../data/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AudioCallGameService {
  private firstPage = 0;

  private lastPage = 29;

  public page = 0;

  public group = 0;

  public startFromBook = false;

  constructor(private http: HttpClient) { }

  public getWords(group: number, page?: number | undefined): Observable<Word[]> {
    if (page === undefined) {
      const randomPage = Math.floor(Math.random() * (this.lastPage - this.firstPage + 1))
       + this.firstPage;
      return this.http.get<Word[]>(`https://angular-learnwords.herokuapp.com/words?group=${group}&page=${randomPage}`);
    }
    return this.http.get<Word[]>(`https://angular-learnwords.herokuapp.com/words?group=${group}&page=${page}`);
  }
}
