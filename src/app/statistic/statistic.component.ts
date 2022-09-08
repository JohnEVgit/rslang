/* eslint-disable @typescript-eslint/no-useless-constructor */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, OnInit } from '@angular/core';
import { Stats } from '../data/interfaces';
import { AuthModalService } from '../services/auth-modal.service';
import { StatisticService } from '../services/statistic.service';

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss'],
})
export class StatisticComponent implements OnInit {

  public totalWordsLearned = 0;

  public totalPercent = 0;

  public audioCallLearnedWords = 0;

  public audioCallPercent = 0;

  public audioCallBestStreak = 0;

  public sprintLearnedWords = 0;

  public sprintPercent = 0;

  public sprintBestStreak = 0;

  constructor(
    private statisticService: StatisticService,
    private authModalService: AuthModalService,
    ) { }

  ngOnInit(): void {
    if(this.authModalService.authenticated){
      const userId = this.authModalService.getUserId()!;
      this.statisticService.getStatistic(userId).subscribe((stat: Stats) => {
        this.totalWordsLearned = stat.learnedWords || 0;
        this.totalPercent = Math.round(stat.optional?.totalPercent || 0);
        this.audioCallLearnedWords = stat.optional?.gameAudioCall.gameLearnedWords || 0;
        this.audioCallPercent = Math.round(stat.optional?.gameAudioCall.percent || 0);
        this.audioCallBestStreak = stat.optional?.gameAudioCall.bestStreak || 0;
        this.sprintLearnedWords = stat.optional?.gameSprint.gameLearnedWords || 0;
        this.sprintPercent = Math.round(stat.optional?.gameSprint.percent || 0);
        this.sprintBestStreak = stat.optional?.gameSprint.bestStreak || 0;
      });
    }
  }
}
