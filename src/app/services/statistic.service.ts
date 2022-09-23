import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { backendUrl } from '../data/constants';
import { Stats } from '../data/interfaces';

@Injectable({
  providedIn: 'root',
})
export class StatisticService {
  constructor(private http: HttpClient) { }

  public updateStatistic(userId: string, obj: Stats): Observable<Stats> {
    return this.http.put(`${backendUrl}/users/${userId}/statistics`, obj);
  }

  public getStatistic(userId: string): Observable<Stats> {
    return this.http.get(`${backendUrl}/users/${userId}/statistics`);
  }
}
