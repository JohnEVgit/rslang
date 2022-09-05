import { Injectable } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserWord, Word, WordPage } from '../data/interfaces';
import { SprintGameService } from './sprint-game.service';
import { AuthModalService } from './auth-modal.service';

@Injectable({
  providedIn: 'root',
})
export class UserWordsService {
  constructor(private http: HttpClient, private sprintGameService: SprintGameService, private authModalService: AuthModalService) { }

  public createUserWord(userId: string, wordId: string, obj: UserWord) {
    return this.http.post(`https://angular-learnwords.herokuapp.com/users/${userId}/words/${wordId}`, obj);
  }

  public createUserTextbookWord(userId: string, wordId: string, obj: UserWord) {
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

  public getUserWord(userId: string, wordId: string) {
    return this.http.get(`https://angular-learnwords.herokuapp.com/users/${userId}/aggregatedWords/${wordId}`).pipe(
      switchMap((words) => of((words as Array<Word>)[0])),
    );
  }

  public getUserWords(userId: string, group: number, page?: number) {
    let wordsPage = page;
    if (!page) {
      wordsPage = this.sprintGameService.getRandomPage();
    }
    return this.http
      .get(
        `https://angular-learnwords.herokuapp.com/users/${userId}/aggregatedWords?wordsPerPage=20&filter={"$and": [{"group": ${group}}, {"page": ${0}}]}`,
      )
      .pipe(
        switchMap((words) => of((words as Array<WordPage>)[0].paginatedResults)),
      );
  }

  public createDifficulty(
    randomWords: Word[],
    wordIndex: number,
    difficulty: string,
    isRight: boolean,
  ): void {
    const userId = this.authModalService.getUserId()!;
    let wrongAnswers = 0;
    let rightAnswers = 0;
    let obj: UserWord = {
      difficulty,
      optional: { rightAnswers: isRight ? 1 : 0, wrongAnswers: !isRight ? 1 : 0 },
    };
    if ((randomWords[wordIndex] as Word)
      .userWord?.optional) {
      rightAnswers = (randomWords[wordIndex] as Word)
        .userWord?.optional?.rightAnswers!;
      wrongAnswers = (randomWords[wordIndex] as Word)
        .userWord?.optional?.wrongAnswers!;
      if (isRight) {
        rightAnswers += 1;
      } else {
        wrongAnswers += 1;
      }
      obj = {
        difficulty,
        optional: { rightAnswers, wrongAnswers },
      };
    }

    if ((randomWords[wordIndex] as Word).userWord?.difficulty) {
      this.updateUserWord(userId, (randomWords[wordIndex])._id, obj)
        .subscribe(() => {});
    } else {
      this.createUserWord(userId, (randomWords[wordIndex])._id, obj)
        .subscribe(() => {});
    }
  }
}
