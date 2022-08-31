import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Word } from '../data/interfaces';

@Component({
  selector: 'app-textbook',
  templateUrl: './textbook.component.html',
  styleUrls: ['./textbook.component.scss'],
})
export class TextbookComponent implements OnInit {
  words: Word[] = [];

  backendUrl = 'https://angular-learnwords.herokuapp.com/';

  isPlayAudio = false;

  currentId = '';

  group: number = Number(localStorage.getItem('group')) || 1;

  groupArr: number[] = [1,2,3,4,5,6];

  page: number = Number(localStorage.getItem('page')) || 1;

  total: number = 600;

  loading: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getPage(this.page);
  }

  getPage(page: number): void {
    this.loading = true;

    this.http.get<Word[]>(`${this.backendUrl}words?group=${this.group - 1}&page=${page - 1}`).subscribe((response) => {
      console.log('Response', response);
      this.words = response;
      this.page = page;
      this.loading = false;
    });
  }

  changeGroup(event: Event): void {
    const thisTarget = event.target as HTMLButtonElement;
    this.group = Number(thisTarget.textContent);
    localStorage.setItem('group', String(this.group));
    this.getPage(1);
  }

  playAudio(id: string): void {
    this.currentId = id;

    this.http.get<Word>(`${this.backendUrl}words/${id}`).subscribe((response) => {
      let audio = new Audio(`${this.backendUrl}${response.audio}`);
      audio.play();
      this.isPlayAudio = true;

      audio.addEventListener('ended', () => {
        audio = new Audio(`${this.backendUrl}${response.audioMeaning}`);
        audio.play();

        audio.addEventListener('ended', () => {
          audio = new Audio(`${this.backendUrl}${response.audioExample}`);
          audio.play();

          audio.addEventListener('ended', () => {
            this.isPlayAudio = false;
          });
        });
      });
    });
  }
}
