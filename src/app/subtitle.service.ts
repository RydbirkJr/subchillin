import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as $ from 'jquery';
import { Subtitle } from './subtitle';
import {ResultWrapper } from './result.wrapper';
import {Observable} from 'rxjs/Observable';
import { UnwrappedFile } from './file.unwrapper';

const BASE_URL: string = 'https://subscene.com/';

@Injectable()
export class SubtitleService {

  constructor(private http: Http) {}

  public getSeriesSubtitles(series: string, season: number, episode: number, language: string): Observable<ResultWrapper> {
    // Step 1: create correct url
    // Step 1a: replace spaces with dash
    let seriesMapped = series.split(' ').join('-');

    // Step 1b: Switch numbers with string representation of numbers
    let seasonNumberText = this.mapSeasonToText(season);

    // Step 1c: Create episode code
    let episodeCode = 'S' + ('00' + season).slice(-2) + 'E' + ('00' + episode).slice(-2);

    // Step 2: Scrape site
    let uri = BASE_URL + "subtitles/" + seriesMapped + "-" + seasonNumberText + "-season";

    //Make request to subscene
    let observer = new Observable<ResultWrapper>(observer => {

      $.get(uri).promise().then(resp => {
        let result = Array<Subtitle>();

        let elements = $(resp)
          .find('.a1')
          .map((index,elem) => result.push(
            //get path
            new Subtitle($(elem.children).attr('href'),
            //get language
            $($(elem.children).children()).last().text(),
            //get file name
            $($(elem.children).children()).first().text()
            )
          )
        );

        //Filter out wrong language and/or wrong episodes
        result = result.filter(elem =>
          elem.fileName.indexOf(episodeCode) != -1
          && elem.language.indexOf(language) != -1
        );
        //Wrap result
        let wrapper = new ResultWrapper(series + ' ' + episodeCode, uri, result);

        //Complete observer
        observer.next(wrapper);
        observer.complete();
      }).fail(e => {observer.error({message: uri})});
    });

    return observer;
  }

  public getMovieSubtitles(movie: string, language: string): Observable<ResultWrapper>{
    //Prepare title for search

    let uri = BASE_URL + "subtitles/title?q=" + movie;

    //Create result observer
    let observer = new Observable<ResultWrapper>(observer => {
      $.get(uri).promise().then(resp => {

        let result = $(resp)
          .find('.title')
          .find('a')
          .filter((index, elem) => elem.innerText.indexOf(movie) != -1);

          if(result.length == 0){
            observer.error({message: uri});
            return;
          }

          uri = BASE_URL + result.first().attr('href');

          $.get(uri).promise().then(resp => {
            let result = Array<Subtitle>();

            let elements = $(resp)
              .find('.a1')
              .map((index,elem) => result.push(
                //get path
                new Subtitle($(elem.children).attr('href'),
                //get language
                $($(elem.children).children()).last().text(),
                //get file name
                $($(elem.children).children()).first().text()
                )
              )
            );

            //Filter out wrong language and/or wrong episodes
            result = result.filter(elem =>
              elem.language.indexOf(language) != -1
            );
            //Wrap result
            let wrapper = new ResultWrapper(movie, uri, result);

            //Complete observer
            observer.next(wrapper);
            observer.complete();
          }).fail(e => {observer.error({message: uri})});

      }).fail(e => {observer.error({message: uri})});
    })

    return observer;
  }

  public postSubtitles(file: UnwrappedFile, postUrl: string) : Observable<string> {
    let observable = new Observable<string>(observer => {
      var form = new FormData();
      form.append('srt',file.blob, file.name);
      form.append('ret', 'superchillin.com');

      $.ajax({
        url: postUrl,
        data: form,
        processData: false,
        contentType: false,
        type: 'POST',
        success: (data, status, xhr) => {
          let refs: string[] = [];
          $(data).find('.hoverz')
            .map((item, elem) => refs.push(elem.getAttribute('href')));

          let first = refs.filter(ref => ref.indexOf('c=') != -1)[0];
          let index = first.indexOf('c=');
          let subtitleRef = first.substring(index);
          observer.next(subtitleRef);
          observer.complete();
        }
      });
    });

    return observable;
  }

  public getSubtitleDownloadUrl(url: string) : Observable<string> {
    let uri = BASE_URL + url;

    let observer = new Observable<string>(observer => {

      $.get(uri).promise().then(resp => {

        let html = $(resp);

        let result = BASE_URL + html
          .find('.download')
          .find('a')
          .first().attr('href');

        observer.next(result);
        observer.complete();
      });
    });

    return observer;
  }

  private mapSeasonToText(season: number) : string {
    switch(season){
      case 1: return "first";
      case 2: return "second";
      case 3: return "third";
      case 4: return "fourth";
      case 5: return "fifth";
      case 6: return "sixth";
      case 7: return "seventh";
      case 8: return "eighth";
      case 9: return "ninth";
      case 10: return "tenth";
      case 11: return "eleventh";
      case 12: return "twelfth";
      case 13: return "thirteenth";
      case 14: return "fourteenth";
      case 15: return "fifteenth";
      case 16: return "sixteenth";
      case 17: return "seventeenth";
      case 18: return "eighteenth";
      case 19: return "nineteenth";
      default: return "ERROR SEASON NUMBER TOO LARGE";
    }
  }
}
