import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { tap } from 'rxjs';

import { HomeNewsComponent as BaseComponent } from '../../../../../app/home-page/home-news/home-news.component';

@Component({
  selector: 'ds-themed-home-news',
  styleUrls: ['./home-news.component.scss'],
  //styleUrls: ['../../../../../app/home-page/home-news/home-news.component.scss'],
  templateUrl: './home-news.component.html',
  //templateUrl: '../../../../../app/home-page/home-news/home-news.component.html',
  standalone: true,
})

/**
 * Component to render the news section on the home page
 */
export class HomeNewsComponent extends BaseComponent implements OnInit {
  newstext: string;

  constructor(private http: HttpClient,
              private sanitizer: DomSanitizer) {
    super();
  }

  ngOnInit() {
    this.http.get('assets/netta/news.txt', { responseType: 'text' }).pipe(
      tap(data => console.log('news text read')),
    ).subscribe(data => {
      this.newstext = data;
    });
  }

  getNewstext() {
    return this.sanitizer.bypassSecurityTrustHtml(this.newstext);
  }
}

