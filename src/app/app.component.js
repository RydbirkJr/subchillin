"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var subtitle_service_1 = require("./subtitle.service");
var file_unwrapper_1 = require("./file.unwrapper");
var loading = "Loading...";
var networkError = "An error occured when connecting to subscene.com. Sorry!";
var wrongSite = "Doesn't look like anything to me!";
var AppComponent = (function () {
    function AppComponent(subService, ngZone) {
        this.subService = subService;
        this.ngZone = ngZone;
        this.title = 'Subchillin';
        //Error message
        this.showMessage = false;
        this.message = loading;
        //show loading
        this.showLoading = false;
        //Show link
        this.showLink = false;
        this.linkText = "";
        this.link = "";
    }
    AppComponent.prototype.ngOnInit = function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var _this = this;
            //Check if on superchillin, or else return
            if (tabs[0].url.indexOf('superchillin') == -1) {
                this.ngZone.run(function () { return _this.displayMessage(wrongSite); });
                return;
            }
            this.displayLoading();
            this.undisplayLink();
            chrome.tabs.sendMessage(tabs[0].id, { text: 'scrape_page' }, function (response) {
                //Types doesn't work inside this function - escpape it
                this.handleMessage(response);
            }.bind(this));
        }.bind(this));
    };
    AppComponent.prototype.onSelect = function (sub) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { text: 'get_post_url' }, function (response) {
                this.postSubtitles(sub, response.postUrl);
            }.bind(this));
        }.bind(this));
    };
    AppComponent.prototype.postSubtitles = function (sub, postUrl) {
        var _this = this;
        this.selectedSub = sub;
        this.subService.getSubtitleDownloadUrl(sub.pageUrl)
            .subscribe(function (data) {
            new file_unwrapper_1.FileUnwrapper().method(data)
                .subscribe(function (data) {
                _this.subService.postSubtitles(data, postUrl)
                    .subscribe(function (subtitleUrlSuffix) {
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, { text: 'redirect', suffix: subtitleUrlSuffix }, function (response) {
                            window.close();
                        }.bind(this));
                    }.bind(_this));
                });
            });
        });
    };
    AppComponent.prototype.handleMessage = function (response) {
        var _this = this;
        switch (response.type) {
            case 'NOTHING':
                this.displayMessage(wrongSite);
                break;
            case 'MOVIE':
                this.subService.getMovieSubtitles(response.result.title, 'English')
                    .subscribe(function (wrapper) {
                    _this.undisplayLoading();
                    _this.ngZone.run(function () {
                        _this.subtitles = wrapper.subtitles;
                        _this.title = wrapper.title;
                        _this.displayLink(response.result.title + ' (subscene)', wrapper.url);
                    });
                }, function (err) {
                    _this.displayMessage(networkError);
                    _this.displayLink("Try yourself!", err.message);
                });
                break;
            case 'SERIES':
                var res_1 = response.result;
                var result = this.
                    subService
                    .getSeriesSubtitles(res_1.title, res_1.season, res_1.episode, 'English')
                    .subscribe(function (wrapper) {
                    _this.undisplayLoading();
                    _this.ngZone.run(function () {
                        _this.subtitles = wrapper.subtitles;
                        _this.title = wrapper.title;
                        _this.displayLink(res_1.title + ' (subscene)', wrapper.url);
                    });
                }, function (err) {
                    _this.displayMessage(networkError);
                    _this.displayLink("Try yourself!", err.message);
                });
                break;
            default:
                break;
        }
    };
    AppComponent.prototype.goToLink = function () {
        window.open(this.link, '_blank');
    };
    AppComponent.prototype.displayLoading = function () {
        var _this = this;
        this.ngZone.run(function () {
            _this.showMessage = false;
            _this.showLoading = true;
        });
    };
    AppComponent.prototype.undisplayLoading = function () {
        var _this = this;
        this.ngZone.run(function () {
            _this.showLoading = false;
        });
    };
    AppComponent.prototype.displayLink = function (buttonText, link) {
        var _this = this;
        this.ngZone.run(function () {
            _this.showLink = true;
            _this.linkText = buttonText;
            _this.link = link;
        });
    };
    AppComponent.prototype.undisplayLink = function () {
        var _this = this;
        this.ngZone.run(function () {
            _this.showLink = false;
        });
    };
    AppComponent.prototype.undisplayMessage = function () {
        var _this = this;
        this.ngZone.run(function () { return _this.showMessage = false; });
    };
    AppComponent.prototype.displayMessage = function (message) {
        var _this = this;
        this.undisplayLoading();
        this.ngZone.run(function () {
            _this.showMessage = true;
            _this.message = message;
        });
    };
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'my-app',
        templateUrl: './src/app/templates/component.html',
        styleUrls: ['./src/app/templates/component.css'],
        providers: [subtitle_service_1.SubtitleService]
    }),
    __metadata("design:paramtypes", [subtitle_service_1.SubtitleService, core_1.NgZone])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map