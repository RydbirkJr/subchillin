export class Subtitle {
  pageUrl: string;
  fileName: string;
  language: string

  constructor(pageUrl: string, fileName: string, language: string){
    this.pageUrl = pageUrl;
    this.fileName = fileName;
    this.language = language;
  }
}
