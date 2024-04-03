import { Observable } from 'rxjs';
import { startWith, tap } from 'rxjs/operators';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Item } from '../../../../../core/shared/item.model';
import { ItemPageFieldComponent } from '../item-page-field.component';
import { CollectionDataService } from '../../../../../core/data/collection-data.service';
import { Collection } from '../../../../../core/shared/collection.model';
import {
  getFirstSucceededRemoteDataPayload,
} from '../../../../../core/shared/operators';
import { BrowseDefinitionDataService } from '../../../../../core/browse/browse-definition-data.service';
import { map } from 'rxjs';

/**
 * This is a bit overloaded component to resolve metadata values
 * containing ID prefixes separated by @ sign.
 * Even if the DOI and the BME-OMIKK handles can be resolved by
 * the http://hdl.handle.net/ service other not so common identifiers
 * may appear in the future which can be simply converted to clickable
 * links.
 */

@Component({
  selector: 'ds-omikk-links',
  styleUrls: ['./omikk-links.component.scss'],
  templateUrl: './omikk-links.component.html'
})

export class OmikkLinksComponent extends ItemPageFieldComponent implements OnInit {

  readonly bmeDOI: string = '10.3311';
  refLink: string;
  safeVideoLink: SafeResourceUrl;

  copyToClipboardImg: string;
  hasRelatedMetadata: boolean;
  hasBMEDOI: boolean;
  hasClipboard: boolean = window.isSecureContext;

  @Input() item: Item;
  @Input() label: string;

  // BrowserDefinitionSevrice is needed due to Angular's unsafe url error of youtube URL:
  // https://filipmolcik.com/error-unsafe-value-used-in-a-resource-url-context/
  constructor(protected browseDefinitionDataService: BrowseDefinitionDataService,
              private sanitizer: DomSanitizer,
              private cds: CollectionDataService) {
    super(browseDefinitionDataService);
  }

  relatedTypesMap: Map<string, string> = new Map(
    [
        ['DOI','https://doi.org/']
      , ['OMIKKHANDLE', 'http://hdl.handle.net/']
    ]
  );

  ngOnInit() {
    const owningCollection$: Observable<Collection> = this.cds.findOwningCollectionFor(this.item).pipe(
      tap(coll => { console.log('collection in omikk-links', coll); }),
      getFirstSucceededRemoteDataPayload(),
      startWith(null as Collection),
    );
    if (this.item.hasMetadata('local.identifier.doi')) {
      for (let mdValue of this.item['metadata']['local.identifier.doi']) {
        if (mdValue.value.includes(this.bmeDOI)) {
          this.hasRelatedMetadata = true;
          this.hasBMEDOI = true;
          this.refLink = this.relatedTypesMap.get('DOI') + mdValue.value;
        }
      }
    }

    if (!this.hasRelatedMetadata && this.item.hasMetadata('dc.identifier.uri')) {
      for (let mdValue of this.item['metadata']['dc.identifier.uri']) {
        if (mdValue.value.startsWith('doi:')) {
          if (mdValue.value.includes(this.bmeDOI)) {
            this.hasRelatedMetadata = true;
            this.hasBMEDOI = true;
            this.refLink = this.relatedTypesMap.get('DOI') + mdValue.value.slice(4);
            break;
          } else {
            // TODO: what makes a DOI link of BME different from other DOI links?
            // currently it is the same as the BME DOI.
            this.hasRelatedMetadata = true;
            this.hasBMEDOI = false;
            this.refLink = this.relatedTypesMap.get('DOI') + mdValue.value.slice(4);
          }
        }
      }

      if (!this.hasRelatedMetadata) {
        this.hasRelatedMetadata = true;
        this.hasBMEDOI = false;
        this.refLink = this.item['metadata']['dc.identifier.uri'][0].value;
      }

      if (this.item.hasMetadata('local.embedVideo')) {
        this.safeVideoLink = this.sanitizer.bypassSecurityTrustResourceUrl(this.item['metadata']['local.embedVideo'][0].value);
      }
    }

    this.copyToClipboardImg = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgZmlsbD0iIzAwMDAwMCI+PGcgaWQ9IlNWR1JlcG9fYmdDYXJyaWVyIiBzdHJva2Utd2lkdGg9IjAiPjwvZz48ZyBpZD0iU1ZHUmVwb190cmFjZXJDYXJyaWVyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvZz48ZyBpZD0iU1ZHUmVwb19pY29uQ2FycmllciI+IDwhLS0gVXBsb2FkZWQgdG86IFNWRyBSZXBvLCB3d3cuc3ZncmVwby5jb20sIEdlbmVyYXRvcjogU1ZHIFJlcG8gTWl4ZXIgVG9vbHMgLS0+IDx0aXRsZT5pY19mbHVlbnRfY29weV8yNF9yZWd1bGFyPC90aXRsZT4gPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+IDxnIGlkPSLwn5SNLVByb2R1Y3QtSWNvbnMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPiA8ZyBpZD0iaWNfZmx1ZW50X2NvcHlfMjRfcmVndWxhciIgZmlsbD0iIzIxMjEyMSIgZmlsbC1ydWxlPSJub256ZXJvIj4gPHBhdGggZD0iTTUuNTAyODAzODEsNC42MjcwNDAzOCBMNS41LDYuNzUgTDUuNSwxNy4yNTQyMDg3IEM1LjUsMTkuMDQ5MTM0MiA2Ljk1NTA3NDU2LDIwLjUwNDIwODcgOC43NSwyMC41MDQyMDg3IEwxNy4zNjYyODY4LDIwLjUwNDQ2MjIgQzE3LjA1NzMzOCwyMS4zNzgyMjQxIDE2LjIyMzk3NTEsMjIuMDA0MjA4NyAxNS4yNDQ0MDU3LDIyLjAwNDIwODcgTDguNzUsMjIuMDA0MjA4NyBDNi4xMjY2NDc0NCwyMi4wMDQyMDg3IDQsMTkuODc3NTYxMyA0LDE3LjI1NDIwODcgTDQsNi43NSBDNCw1Ljc2OTI4ODQ4IDQuNjI3NDQ1MjMsNC45MzUxMjQ2NCA1LjUwMjgwMzgxLDQuNjI3MDQwMzggWiBNMTcuNzUsMiBDMTguOTkyNjQwNywyIDIwLDMuMDA3MzU5MzEgMjAsNC4yNSBMMjAsMTcuMjUgQzIwLDE4LjQ5MjY0MDcgMTguOTkyNjQwNywxOS41IDE3Ljc1LDE5LjUgTDguNzUsMTkuNSBDNy41MDczNTkzMSwxOS41IDYuNSwxOC40OTI2NDA3IDYuNSwxNy4yNSBMNi41LDQuMjUgQzYuNSwzLjAwNzM1OTMxIDcuNTA3MzU5MzEsMiA4Ljc1LDIgTDE3Ljc1LDIgWiBNMTcuNzUsMy41IEw4Ljc1LDMuNSBDOC4zMzU3ODY0NCwzLjUgOCwzLjgzNTc4NjQ0IDgsNC4yNSBMOCwxNy4yNSBDOCwxNy42NjQyMTM2IDguMzM1Nzg2NDQsMTggOC43NSwxOCBMMTcuNzUsMTggQzE4LjE2NDIxMzYsMTggMTguNSwxNy42NjQyMTM2IDE4LjUsMTcuMjUgTDE4LjUsNC4yNSBDMTguNSwzLjgzNTc4NjQ0IDE4LjE2NDIxMzYsMy41IDE3Ljc1LDMuNSBaIiBpZD0i8J+OqC1Db2xvciI+IDwvcGF0aD4gPC9nPiA8L2c+IDwvZz48L3N2Zz4K';
  }

  isValidHandleID(parts) {
    if (parts.length !== 2) {
      return false;
    } else {
      if (this.relatedTypesMap.has(parts[0].toUpperCase())) {
        return true;
      } else {
        return false;
      }
    }
  }

  processID(value: string, what: string) {
    let parts = value.split('@');

    if (this.isValidHandleID(parts)) {
      if (what === 'href') {
        return this.relatedTypesMap.get(parts[0].toUpperCase()) + parts[1];
      } else {
        return parts[1];
      }
    } else {
      return value;
    }
  }

  getGeneratedURI(value: string) {
    return this.processID(value, 'href');
  }

  getIDPart(value: string) {
    return this.processID(value, 'title');
  }

  getHandleURI(value: string) {
    return 'http://hdl.handle.net/' + value;
  }

  copyToClipboard(txt) {
    navigator.clipboard.writeText(txt);
  }
}
