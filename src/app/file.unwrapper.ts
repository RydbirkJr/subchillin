import * as JSZip from 'jszip';
import {Observable} from 'rxjs/Observable';

export class FileUnwrapper{

  public method(path: string): Observable<UnwrappedFile>{
    let zipper = new JSZip();

    let observer = new Observable<UnwrappedFile>(observer => {
      window.fetch(path)
        .then(response => {
          return Promise.resolve(response.arrayBuffer());
        }).then(data => zipper.loadAsync(data))
        .then(zip => {
          let result: JSZipObject[] = [];
          zip.forEach((name, file) => result.push(file));
          return result;
        })
        .then(data => data[0].async('string').then(content => {
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
        }));
    });

    return observer;
  }
}

export class UnwrappedFile {
  public blob: Blob;
  public name: string;

  constructor(blob: Blob, name: string){
    this.blob = blob;
    this.name = name;
  }
}
