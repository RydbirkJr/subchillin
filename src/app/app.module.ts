import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule }    from '@angular/http';

import { AppComponent }  from './app.component';
import { SubtitleService } from './subtitle.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [SubtitleService],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
