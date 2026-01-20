import {
  isPlatformBrowser,
  NgIf,
} from '@angular/common';
import {
  Component,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

import { BrowseService } from '../../../../../../../../app/core/browse/browse.service';
import { BrowseDefinitionDataService } from '../../../../../../../../app/core/browse/browse-definition-data.service';
import { Item } from '../../../../../../../../app/core/shared/item.model';
import { ItemPageFieldComponent } from '../../../../../../../../app/item-page/simple/field-components/specific-field/item-page-field.component';

/**
 * A specific component responsible to render the VideoSquare links
 * on the simple page of an item.
 * @2025-12-08
 */

@Component({
  selector: 'terepo-vs-links',
  styleUrls: ['./videosquare-link.component.scss'],
  templateUrl: './videosquare-link.component.html',
  standalone: true,
  imports: [
    NgIf,
    TranslateModule,
  ],
})

export class TerepoVsLinksComponent extends ItemPageFieldComponent implements OnInit {

  vsMetadata = 'local.identifier.relatedVideoSquare';
  copyToClipboardImg: string;
  hasClipboard = false;
  safeVideoLink: SafeResourceUrl;
  linkTitle = 'Video link';

  @Input() item: Item;
  @Input() label: string;

  // BrowserDefinitionSevrice is needed due to Angular's unsafe url error of youtube URL:
  // https://filipmolcik.com/error-unsafe-value-used-in-a-resource-url-context/
  constructor(protected browseDefinitionDataService: BrowseDefinitionDataService,
              protected browseService: BrowseService,
              private sanitizer: DomSanitizer,
              @Inject(PLATFORM_ID) private platformId: object) {
    super(browseDefinitionDataService, browseService);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.hasClipboard = window.isSecureContext;
    }

    if (this.item.hasMetadata(this.vsMetadata)) {
      this.safeVideoLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.item.metadata[this.vsMetadata][0].value);
    } else {
      this.safeVideoLink = null;
    }

    this.copyToClipboardImg = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgZmlsbD0iIzAwMDAwMCI+PGcgaWQ9IlNWR1JlcG9fYmdDYXJyaWVyIiBzdHJva2Utd2lkdGg9IjAiPjwvZz48ZyBpZD0iU1ZHUmVwb190cmFjZXJDYXJyaWVyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvZz48ZyBpZD0iU1ZHUmVwb19pY29uQ2FycmllciI+IDwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIEdlbmVyYXRvcjogU1ZHIFJlcG8gTWl4ZXIgVG9vbHMgLS0+IDx0aXRsZT5pY19mbHVlbnRfY29weV8yNF9yZWd1bGFyPC90aXRsZT4gPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+IDxnIGlkPSLwn5SNLVByb2R1Y3QtSWNvbnMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPiA8ZyBpZD0iaWNfZmx1ZW50X2NvcHlfMjRfcmVndWxhciIgZmlsbD0iIzIxMjEyMSIgZmlsbC1ydWxlPSJub256ZXJvIj4gPHBhdGggZD0iTTUuNTAyODAzODEsNC42MjcwNDAzOCBMNS41LDYuNzUgTDUuNSwxNy4yNTQyMDg3IEM1LjUsMTkuMDQ5MTM0MiA2Ljk1NTA3NDU2LDIwLjUwNDIwODcgOC43NSwyMC41MDQyMDg3IEwxNy4zNjYyODY4LDIwLjUwNDQ2MjIgQzE3LjA1NzMzOCwyMS4zNzgyMjQxIDE2LjIyMzk3NTEsMjIuMDA0MjA4NyAxNS4yNDQ0MDU3LDIyLjAwNDIwODcgTDguNzUsMjIuMDA0MjA4NyBDNi4xMjY2NDc0NCwyMi4wMDQyMDg3IDQsMTkuODc3NTYxMyA0LDE3LjI1NDIwODcgTDQsNi43NSBDNCw1Ljc2OTI4ODQ4IDQuNjI3NDQ1MjMsNC45MzUxMjQ2NCA1LjUwMjgwMzgxLDQuNjI3MDQwMzggWiBNMTcuNzUsMiBDMTguOTkyNjQwNywyIDIwLDMuMDA3MzU5MzEgMjAsNC4yNSBMMjAsMTcuMjUgQzIwLDE4LjQ5MjY0MDcgMTguOTkyNjQwNywxOS41IDE3Ljc1LDE5LjUgTDguNzUsMTkuNSBDNy41MDczNTkzMSwxOS41IDYuNSwxOC40OTI2NDA3IDYuNSwxNy4yNSBMNi41LDQuMjUgQzYuNSwzLjAwNzM1OTMxIDcuNTA3MzU5MzEsMiA4Ljc1LDIgTDE3Ljc1LDIgWiBNMTcuNzUsMy41IEw4Ljc1LDMuNSBDOC4zMzU3ODY0NCwzLjUgOCwzLjgzNTc4NjQ0IDgsNC4yNSBMOCwxNy4yNSBDOCwxNy42NjQyMTM2IDguMzM1Nzg2NDQsMTggOC43NSwxOCBMMTcuNzUsMTggQzE4LjE2NDIxMzYsMTggMTguNSwxNy42NjQyMTM2IDE4LjUsMTcuMjUgTDE4LjUsNC4yNSBDMTguNSwzLjgzNTc4NjQ0IDE4LjE2NDIxMzYsMy41IDE3Ljc1LDMuNSBaIiBpZD0i8J+OqC1Db2xvciI+IDwvcGF0aD4gPC9nPiA8L2c+IDwvZz48L3N2Zz4K';

    if (this.item.hasMetadata('dc.title')) {
      this.linkTitle = this.item.metadata['dc.title'][0].value;
    }
  }

  copyToClipboard(txt) {
    navigator.clipboard.writeText(txt);
  }
}
