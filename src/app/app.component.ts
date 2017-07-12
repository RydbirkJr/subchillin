import { Component, OnInit, NgZone } from '@angular/core';
import { SubtitleService } from './subtitle.service';
import {Subtitle} from './subtitle';
import {ResultWrapper} from './result.wrapper';
import { FileUnwrapper } from './file.unwrapper';

declare var chrome: any;
const loading: string = "Loading...";
const networkError: string = "An error occured when connecting to subscene.com. Sorry!";
const wrongSite: string = "Doesn't look like anything to me!";

@Component({
  selector: 'my-app',
  templateUrl: './src/app/templates/component.html',
  styleUrls: ['./src/app/templates/component.css'],
  providers: [SubtitleService]
})

export class AppComponent implements OnInit{
  public subtitles : Subtitle[];
  public title: string = 'Subchillin';
  public selectedSub: Subtitle;

  //Error message
  public showMessage: boolean = false;
  public message: string = loading;

  //show loading
  public showLoading: boolean = false;

  //Show link
  public showLink: boolean = false;
  public linkText: string = "";
  public link: string = "";

  constructor(private subService : SubtitleService, private ngZone: NgZone) { }

  ngOnInit() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs: any) {
        //Check if on superchillin, or else return
        if(tabs[0].url.indexOf('superchillin') == -1){
          this.ngZone.run(() => this.displayMessage(wrongSite));
          return;
        }
        this.displayLoading();
        this.undisplayLink();
        chrome.tabs.sendMessage(tabs[0].id, {text : 'scrape_page'}, function(response: any) {
          //Types doesn't work inside this function - escpape it
          this.handleMessage(response);
        }.bind(this));
      }.bind(this));
    }

  onSelect(sub: Subtitle): void {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs: any) {
      chrome.tabs.sendMessage(tabs[0].id, {text : 'get_post_url'}, function(response: any) {
        this.postSubtitles(sub, response.postUrl);
      }.bind(this));
    }.bind(this));
  }

  private postSubtitles(sub: Subtitle, postUrl: string): void {
    this.selectedSub = sub;

    this.subService.getSubtitleDownloadUrl(sub.pageUrl)
      .subscribe(data => {
        new FileUnwrapper().method(data)
        .subscribe(data => {
          this.subService.postSubtitles(data, postUrl)
            .subscribe(subtitleUrlSuffix => {
              chrome.tabs.query({active: true, currentWindow: true}, function(tabs: any) {
                chrome.tabs.sendMessage(tabs[0].id, {text : 'redirect', suffix: subtitleUrlSuffix}, function(response: any) {
                  window.close();
                }.bind(this));
              }.bind(this));
            })

        });

      });
  }

  private handleMessage(response: any) : void{
    switch(response.type){
      case 'NOTHING':
        this.displayMessage(wrongSite);
        break;

      case 'MOVIE':

        this.subService.getMovieSubtitles(response.result.title, 'English')
          .subscribe(wrapper => {
            this.undisplayLoading();

            this.ngZone.run(() => {
              this.subtitles = wrapper.subtitles;
              this.title = wrapper.title;
              this.displayLink(response.result.title + ' (subscene)', wrapper.url);
            });
          }, err => {
              this.displayMessage(networkError);
              this.displayLink("Try yourself!", err.message);
          });
        break;

      case 'SERIES':
        let res = response.result;

        let result = this.
          subService
          .getSeriesSubtitles(res.title, res.season, res.episode, 'English')
          .subscribe(wrapper => {
            this.undisplayLoading();
            this.ngZone.run(() => {
              this.subtitles = wrapper.subtitles;
              this.title = wrapper.title;
              this.displayLink(res.title + ' (subscene)', wrapper.url);
            });
          }, err => {
              this.displayMessage(networkError);
              this.displayLink("Try yourself!", err.message);
          });
          break;

        default:
          break;
    }
  }

  goToLink(): void {
    window.open(this.link, '_blank');
  }

  private displayLoading(): void {
    this.ngZone.run(() => {
      this.showMessage = false;
      this.showLoading = true;
    });
  }

  private undisplayLoading(): void {
    this.ngZone.run(() => {
      this.showLoading = false;
    });
  }

  private displayLink(buttonText: string, link: string): void {
    this.ngZone.run(() => {
      this.showLink = true;
      this.linkText = buttonText;
      this.link = link;
    });
  }

  private undisplayLink(): void {
    this.ngZone.run(() => {
      this.showLink = false;
    });
  }

  private undisplayMessage(): void{
    this.ngZone.run(() => this.showMessage = false);
  }

  private displayMessage(message: string): void {
    this.undisplayLoading();
    this.ngZone.run(() => {
      this.showMessage = true;
      this.message = message;
    });
  }
}
