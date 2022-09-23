import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Word } from '../data/interfaces';
import { backendUrl, firstPage, lastPage } from '../data/constants';

@Injectable({
  providedIn: 'root',
})
export class SprintGameService {
  public startFromBook = false;

  public page = 0;

  public group = 0;

  public pagesArray: number[] = [];

  constructor(private http: HttpClient) { }

  public getWords(group: number, page?: number): Observable<Word[]> {
    if (page === undefined) {
      const randomPage = this.getRandomPage();
      return this.http.get<Word[]>(`${backendUrl}/words?group=${group}&page=${randomPage}`);
    }
    return this.http.get<Word[]>(`${backendUrl}/words?group=${group}&page=${page}`);
  }

  public getRandomPage(): number {
    let randomPage = Math.floor(Math.random() * (lastPage - firstPage + 1))
      + firstPage;
    while (this.pagesArray.includes(randomPage) && this.pagesArray.length - 1 !== lastPage) {
      randomPage = Math.floor(Math.random() * (lastPage - firstPage + 1))
        + firstPage;
    }
    this.pagesArray.push(randomPage);
    return randomPage;
  }
}
