import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../../../../../core/shared/item.model';
import { ItemPageFieldComponent } from '../item-page-field.component';

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

  hasRelatedMetadata: boolean;
  hasClipboard: boolean = window.isSecureContext;

  @Input() item: Item;
  @Input() label: string;

  relatedTypesMap: Map<string, string> = new Map(
    [
        ['DOI','https://doi.org/']
      , ['OMIKKHANDLE', 'http://hdl.handle.net/']
    ]
  );

  ngOnInit() {
    this.hasRelatedMetadata = this.item.hasMetadata('local.identifier.doi') ||
      this.item.hasMetadata('local.relatedHandle') ||
      this.item.hasMetadata('local.relatedURL') ||
      this.item.hasMetadata('dc.identifier.uri');
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
