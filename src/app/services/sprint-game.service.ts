import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Word } from '../data/interfaces';

@Injectable({
  providedIn: 'root',
})
export class SprintGameService {

  private firstPage = 0;

  private lastPage = 29;

  constructor(private http: HttpClient) { }

  public getWords(group: number, page?: number | undefined): Observable<Word[]> {
    if (!page) {
      const randomPage = Math.floor(Math.random() * (this.lastPage - this.firstPage + 1))
        + this.firstPage;
      return this.http.get<Word[]>(`https://angular-learnwords.herokuapp.com/words?group=${group}&page=${randomPage}`);
    }
    return this.http.get<Word[]>(`https://angular-learnwords.herokuapp.com/words?group=${group}&page=${page}`);
  }
}
