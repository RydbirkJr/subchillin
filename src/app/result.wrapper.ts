import { Subtitle } from './subtitle';

export class ResultWrapper {
  title: string;
  count: number;
  url: string;
  subtitles: Subtitle[];

  constructor(title: string, url: string, subtitles: Subtitle[]){
    this.title = title;
    this.count = subtitles.length;
    this.url = url;
    this.subtitles = subtitles;
  }
}
