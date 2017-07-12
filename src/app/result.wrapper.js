"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ResultWrapper = (function () {
    function ResultWrapper(title, url, subtitles) {
        this.title = title;
        this.count = subtitles.length;
        this.url = url;
        this.subtitles = subtitles;
    }
    return ResultWrapper;
}());
exports.ResultWrapper = ResultWrapper;
//# sourceMappingURL=result.wrapper.js.map