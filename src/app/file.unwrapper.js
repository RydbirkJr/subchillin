"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JSZip = require("jszip");
var Observable_1 = require("rxjs/Observable");
var FileUnwrapper = (function () {
    function FileUnwrapper() {
    }
    FileUnwrapper.prototype.method = function (path) {
        var zipper = new JSZip();
        var observer = new Observable_1.Observable(function (observer) {
            window.fetch(path)
                .then(function (response) {
                return Promise.resolve(response.arrayBuffer());
            }).then(function (data) { return zipper.loadAsync(data); })
                .then(function (zip) {
                var result = [];
                zip.forEach(function (name, file) { return result.push(file); });
                return result;
            })
                .then(function (data) { return data[0].async('string').then(function (content) {
                var blob = new Blob([content]);
                // var url = URL.createObjectURL(blob);
                // var downloadLink = document.createElement("a");
                // downloadLink.href = url;
                // downloadLink.download = data[0].name;
                //
                // document.body.appendChild(downloadLink);
                // downloadLink.click();
                // document.body.removeChild(downloadLink);
                observer.next(new UnwrappedFile(blob, data[0].name));
                observer.complete();
            }); });
        });
        return observer;
    };
    return FileUnwrapper;
}());
exports.FileUnwrapper = FileUnwrapper;
var UnwrappedFile = (function () {
    function UnwrappedFile(blob, name) {
        this.blob = blob;
        this.name = name;
    }
    return UnwrappedFile;
}());
exports.UnwrappedFile = UnwrappedFile;
//# sourceMappingURL=file.unwrapper.js.map