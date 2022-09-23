import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Word } from '../data/interfaces';
import { backendUrl, firstPage, lastPage } from '../data/constants';

@Injectable({
  providedIn: 'root',
})
export class AudioCallGameService {
  public page = 0;

  public group = 0;

  public startFromBook = false;

  constructor(private http: HttpClient) { }

  public getWords(group: number, page?: number | undefined): Observable<Word[]> {
    if (page === undefined) {
      const randomPage = Math.floor(Math.random() * (lastPage - firstPage + 1))
        + firstPage;
      return this.http.get<Word[]>(`${backendUrl}/words?group=${group}&page=${randomPage}`);
    }
    return this.http.get<Word[]>(`${backendUrl}/words?group=${group}&page=${page}`);
  }
}
