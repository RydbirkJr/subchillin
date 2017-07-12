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
var http_1 = require("@angular/http");
var $ = require("jquery");
var subtitle_1 = require("./subtitle");
var result_wrapper_1 = require("./result.wrapper");
var Observable_1 = require("rxjs/Observable");
var BASE_URL = 'https://subscene.com/';
var SubtitleService = (function () {
    function SubtitleService(http) {
        this.http = http;
    }
    SubtitleService.prototype.getSeriesSubtitles = function (series, season, episode, language) {
        // Step 1: create correct url
        // Step 1a: replace spaces with dash
        var seriesMapped = series.split(' ').join('-');
        // Step 1b: Switch numbers with string representation of numbers
        var seasonNumberText = this.mapSeasonToText(season);
        // Step 1c: Create episode code
        var episodeCode = 'S' + ('00' + season).slice(-2) + 'E' + ('00' + episode).slice(-2);
        // Step 2: Scrape site
        var uri = BASE_URL + "subtitles/" + seriesMapped + "-" + seasonNumberText + "-season";
        //Make request to subscene
        var observer = new Observable_1.Observable(function (observer) {
            $.get(uri).promise().then(function (resp) {
                var result = Array();
                var elements = $(resp)
                    .find('.a1')
                    .map(function (index, elem) { return result.push(
                //get path
                new subtitle_1.Subtitle($(elem.children).attr('href'), 
                //get language
                $($(elem.children).children()).last().text(), 
                //get file name
                $($(elem.children).children()).first().text())); });
                //Filter out wrong language and/or wrong episodes
                result = result.filter(function (elem) {
                    return elem.fileName.indexOf(episodeCode) != -1
                        && elem.language.indexOf(language) != -1;
                });
                //Wrap result
                var wrapper = new result_wrapper_1.ResultWrapper(series + ' ' + episodeCode, uri, result);
                //Complete observer
                observer.next(wrapper);
                observer.complete();
            }).fail(function (e) { observer.error({ message: uri }); });
        });
        return observer;
    };
    SubtitleService.prototype.getMovieSubtitles = function (movie, language) {
        //Prepare title for search
        var uri = BASE_URL + "subtitles/title?q=" + movie;
        //Create result observer
        var observer = new Observable_1.Observable(function (observer) {
            $.get(uri).promise().then(function (resp) {
                var result = $(resp)
                    .find('.title')
                    .find('a')
                    .filter(function (index, elem) { return elem.innerText.indexOf(movie) != -1; });
                if (result.length == 0) {
                    observer.error({ message: uri });
                    return;
                }
                uri = BASE_URL + result.first().attr('href');
                $.get(uri).promise().then(function (resp) {
                    var result = Array();
                    var elements = $(resp)
                        .find('.a1')
                        .map(function (index, elem) { return result.push(
                    //get path
                    new subtitle_1.Subtitle($(elem.children).attr('href'), 
                    //get language
                    $($(elem.children).children()).last().text(), 
                    //get file name
                    $($(elem.children).children()).first().text())); });
                    //Filter out wrong language and/or wrong episodes
                    result = result.filter(function (elem) {
                        return elem.language.indexOf(language) != -1;
                    });
                    //Wrap result
                    var wrapper = new result_wrapper_1.ResultWrapper(movie, uri, result);
                    //Complete observer
                    observer.next(wrapper);
                    observer.complete();
                }).fail(function (e) { observer.error({ message: uri }); });
            }).fail(function (e) { observer.error({ message: uri }); });
        });
        return observer;
    };
    SubtitleService.prototype.postSubtitles = function (file, postUrl) {
        var observable = new Observable_1.Observable(function (observer) {
            var form = new FormData();
            form.append('srt', file.blob, file.name);
            form.append('ret', 'superchillin.com');
            $.ajax({
                url: postUrl,
                data: form,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function (data, status, xhr) {
                    var refs = [];
                    $(data).find('.hoverz')
                        .map(function (item, elem) { return refs.push(elem.getAttribute('href')); });
                    var first = refs.filter(function (ref) { return ref.indexOf('c=') != -1; })[0];
                    var index = first.indexOf('c=');
                    var subtitleRef = first.substring(index);
                    observer.next(subtitleRef);
                    observer.complete();
                }
            });
        });
        return observable;
    };
    SubtitleService.prototype.getSubtitleDownloadUrl = function (url) {
        var uri = BASE_URL + url;
        var observer = new Observable_1.Observable(function (observer) {
            $.get(uri).promise().then(function (resp) {
                var html = $(resp);
                var result = BASE_URL + html
                    .find('.download')
                    .find('a')
                    .first().attr('href');
                observer.next(result);
                observer.complete();
            });
        });
        return observer;
    };
    SubtitleService.prototype.mapSeasonToText = function (season) {
        switch (season) {
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
    };
    return SubtitleService;
}());
SubtitleService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], SubtitleService);
exports.SubtitleService = SubtitleService;
//# sourceMappingURL=subtitle.service.js.map