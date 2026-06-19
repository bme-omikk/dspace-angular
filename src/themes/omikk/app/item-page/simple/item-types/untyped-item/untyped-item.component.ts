import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { Context } from '../../../../../../../app/core/shared/context.model';
import { Item } from '../../../../../../../app/core/shared/item.model';
import { ViewMode } from '../../../../../../../app/core/shared/view-mode.model';
import { CollectionsComponent } from '../../../../../../../app/item-page/field-components/collections/collections.component';
import { ThemedMediaViewerComponent } from '../../../../../../../app/item-page/media-viewer/themed-media-viewer.component';
import { MiradorViewerComponent } from '../../../../../../../app/item-page/mirador-viewer/mirador-viewer.component';
import { ThemedFileSectionComponent } from '../../../../../../../app/item-page/simple/field-components/file-section/themed-file-section.component';
import { ItemPageAbstractFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/abstract/item-page-abstract-field.component';
import { ItemPageCcLicenseFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/cc-license/item-page-cc-license-field.component';
import { ItemPageDateFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/date/item-page-date-field.component';
import { GenericItemPageFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/generic/generic-item-page-field.component';
import { ThemedItemPageTitleFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/title/themed-item-page-field.component';
import { ItemPageUriFieldComponent } from '../../../../../../../app/item-page/simple/field-components/specific-field/uri/item-page-uri-field.component';
import { UntypedItemComponent as BaseComponent } from '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component';
import { ThemedMetadataRepresentationListComponent } from '../../../../../../../app/item-page/simple/metadata-representation-list/themed-metadata-representation-list.component';
import { DsoEditMenuComponent } from '../../../../../../../app/shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { MetadataFieldWrapperComponent } from '../../../../../../../app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { listableObjectComponent } from '../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { ThemedResultsBackButtonComponent } from '../../../../../../../app/shared/results-back-button/themed-results-back-button.component';
import { ThemedThumbnailComponent } from '../../../../../../../app/thumbnail/themed-thumbnail.component';
import { ViewpdfService } from '../../../../shared/viewpdf.service';
import { OmikkLinksComponent } from '../../field-components/specific-field/omikk-links/omikk-links.component';
import { ItemPageOOCFieldComponent } from '../../field-components/specific-field/ooc/item-page-ooc-field.component';

/**
 * Component that represents an untyped Item page
 */
@listableObjectComponent(Item, ViewMode.StandalonePage, Context.Any, 'omikk')
@Component({
  selector: 'ds-untyped-item',
  styleUrls: ['./untyped-item.component.scss'],
  // styleUrls: [
  //  '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component.scss',
  //],
  templateUrl: './untyped-item.component.html',
  //templateUrl:
  //  '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    ThemedResultsBackButtonComponent,
    MiradorViewerComponent,
    ThemedItemPageTitleFieldComponent,
    DsoEditMenuComponent,
    MetadataFieldWrapperComponent,
    ThemedThumbnailComponent,
    ThemedMediaViewerComponent,
    ThemedFileSectionComponent,
    ItemPageDateFieldComponent,
    ThemedMetadataRepresentationListComponent,
    GenericItemPageFieldComponent,
    ItemPageAbstractFieldComponent,
    ItemPageUriFieldComponent,
    CollectionsComponent,
    RouterLink,
    AsyncPipe,
    TranslateModule,
    ItemPageCcLicenseFieldComponent,
    ItemPageOOCFieldComponent,
    OmikkLinksComponent,
  ],
})
export class UntypedItemComponent extends BaseComponent implements OnInit {
  private viewPdfOnCollLevel: string;
  private viewPdfOnItemLevel: string;
  viewDownloadLink: boolean;

  ngOnInit(): void {
    super.ngOnInit();
    const vp = new ViewpdfService(this.object);
    vp.statusOnCollLevel().subscribe(r => { this.viewPdfOnCollLevel = r; });
    vp.statusOnItemLevel().subscribe(r => { this.viewPdfOnItemLevel = r; });

    this.viewDownloadLink = false;

    let viewPdfStatus = '';

    if (this.viewPdfOnItemLevel !== 'na') {
      viewPdfStatus = this.viewPdfOnItemLevel;
    } else if (this.viewPdfOnCollLevel !== 'na') {
      viewPdfStatus = this.viewPdfOnCollLevel;
    } else {
      viewPdfStatus = '';
    }

    switch (viewPdfStatus) {
      case 'viewer': {
        this.viewDownloadLink = false;
        break;
      }
      case 'viewer-download': {
        this.viewDownloadLink = true;
        break;
      }
      case 'download': {
        this.viewDownloadLink = true;
        break;
      }
      default: {
        this.viewDownloadLink = true;
        break;
      }
    }
  }
}
