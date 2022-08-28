import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Word {
  'id': 'string',
  'group': 0,
  'page': 0,
  'word': 'string',
  'image': 'string',
  'audio': 'string',
  'audioMeaning': 'string',
  'audioExample': 'string',
  'textMeaning': 'string',
  'textExample': 'string',
  'transcription': 'string',
  'wordTranslate': 'string',
  'textMeaningTranslate': 'string',
  'textExampleTranslate': 'string'
}

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

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<Word[]>(`${this.backendUrl}words`).subscribe((response) => {
      console.log('Response', response);
      this.words = response;
    });
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
