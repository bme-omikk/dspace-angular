import {
  AsyncPipe,
  KeyValuePipe,
  Location,
  NgForOf,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { NotifyInfoService } from '../../../../../app/core/coar-notify/notify-info/notify-info.service';
import { AuthorizationDataService } from '../../../../../app/core/data/feature-authorization/authorization-data.service';
import { ItemDataService } from '../../../../../app/core/data/item-data.service';
import { SignpostingDataService } from '../../../../../app/core/data/signposting-data.service';
import { LinkHeadService } from '../../../../../app/core/services/link-head.service';
import { ServerResponseService } from '../../../../../app/core/services/server-response.service';
import { ThemedItemAlertsComponent } from '../../../../../app/item-page/alerts/themed-item-alerts.component';
import { CollectionsComponent } from '../../../../../app/item-page/field-components/collections/collections.component';
import { ThemedFullFileSectionComponent } from '../../../../../app/item-page/full/field-components/file-section/themed-full-file-section.component';
import { FullItemPageComponent as BaseComponent } from '../../../../../app/item-page/full/full-item-page.component';
import { ThemedItemPageTitleFieldComponent } from '../../../../../app/item-page/simple/field-components/specific-field/title/themed-item-page-field.component';
import { ItemVersionsComponent } from '../../../../../app/item-page/versions/item-versions.component';
import { ItemVersionsNoticeComponent } from '../../../../../app/item-page/versions/notice/item-versions-notice.component';
import { fadeInOut } from '../../../../../app/shared/animations/fade';
import { DsoEditMenuComponent } from '../../../../../app/shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { ErrorComponent } from '../../../../../app/shared/error/error.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { VarDirective } from '../../../../../app/shared/utils/var.directive';
import { ItemPageAbstractFieldComponent } from '../simple/field-components/specific-field/abstract/item-page-abstract-field.component';
import { ItemPageOOCFieldComponent } from '../simple/field-components/specific-field/ooc/item-page-ooc-field.component';

/**
 * This component renders a full item page.
 * The route parameter 'id' is used to request the item it represents.
 */

@Component({
  selector: 'ds-themed-full-item-page',
  styleUrls: ['./full-item-page.component.scss'],
  // styleUrls: ['../../../../../app/item-page/full/full-item-page.component.scss'],
  templateUrl: './full-item-page.component.html',
  //templateUrl: '../../../../../app/item-page/full/full-item-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut],
  standalone: true,
  imports: [
    ErrorComponent,
    ThemedLoadingComponent,
    TranslateModule,
    ThemedFullFileSectionComponent,
    CollectionsComponent,
    ItemVersionsComponent,
    NgIf,
    NgForOf,
    AsyncPipe,
    KeyValuePipe,
    RouterLink,
    ThemedItemPageTitleFieldComponent,
    DsoEditMenuComponent,
    ItemVersionsNoticeComponent,
    ThemedItemAlertsComponent,
    VarDirective,
    ItemPageOOCFieldComponent,
    ItemPageAbstractFieldComponent,
  ],
})
export class FullItemPageComponent extends BaseComponent {
  relatedTypesMap: Map<string, string> = new Map(
    [
      ['DOI','https://doi.org/']
      , ['OMIKKHANDLE', 'http://hdl.handle.net/'],
    ],
  );

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
    const parts = value.split('@');

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

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected items: ItemDataService,
    protected authorizationService: AuthorizationDataService,
    protected _location: Location,
    protected responseService: ServerResponseService,
    protected signpostingDataService: SignpostingDataService,
    protected linkHeadService: LinkHeadService,
    protected notifyInfoService: NotifyInfoService,
    @Inject(PLATFORM_ID) protected platformId: string,
  ) {
    super(route, router, items, authorizationService, _location, responseService, signpostingDataService, linkHeadService, notifyInfoService, platformId);
  }
}
