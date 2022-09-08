import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Stats } from '../data/interfaces';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {


  constructor(private http: HttpClient) { }

  public updateStatistic(userId: string, obj: Stats) {
    return this.http.put(`https://angular-learnwords.herokuapp.com/users/${userId}/statistics`, obj);
  }

  public getStatistic(userId: string) {
    return this.http.get(`https://angular-learnwords.herokuapp.com/users/${userId}/statistics`);
  }
}
