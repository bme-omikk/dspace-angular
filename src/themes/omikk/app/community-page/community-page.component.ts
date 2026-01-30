import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { CommunityPageComponent as BaseComponent } from '../../../../app/community-page/community-page.component';
import { ThemedCollectionPageSubCollectionListComponent } from '../../../../app/community-page/sections/sub-com-col-section/sub-collection-list/themed-community-page-sub-collection-list.component';
import { ThemedCommunityPageSubCommunityListComponent } from '../../../../app/community-page/sections/sub-com-col-section/sub-community-list/themed-community-page-sub-community-list.component';
import { fadeInOut } from '../../../../app/shared/animations/fade';
import { ThemedComcolPageBrowseByComponent } from '../../../../app/shared/comcol/comcol-page-browse-by/themed-comcol-page-browse-by.component';
import { ThemedComcolPageContentComponent } from '../../../../app/shared/comcol/comcol-page-content/themed-comcol-page-content.component';
import { ThemedComcolPageHandleComponent } from '../../../../app/shared/comcol/comcol-page-handle/themed-comcol-page-handle.component';
import { ComcolPageHeaderComponent } from '../../../../app/shared/comcol/comcol-page-header/comcol-page-header.component';
import { ComcolPageLogoComponent } from '../../../../app/shared/comcol/comcol-page-logo/comcol-page-logo.component';
import { DsoEditMenuComponent } from '../../../../app/shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { ErrorComponent } from '../../../../app/shared/error/error.component';
import { ThemedLoadingComponent } from '../../../../app/shared/loading/themed-loading.component';
import { VarDirective } from '../../../../app/shared/utils/var.directive';
import { AuthService } from '../../../../app/core/auth/auth.service';
import { DSONameService } from '../../../../app/core/breadcrumbs/dso-name.service';
import { AuthorizationDataService } from '../../../../app/core/data/feature-authorization/authorization-data.service';
import { LocaleService } from '../../../../app/core/locale/locale.service';

@Component({
  selector: 'ds-themed-community-page',
  templateUrl: './community-page.component.html',
  //templateUrl: '../../../../app/community-page/community-page.component.html',
  // styleUrls: ['./community-page.component.scss']
  styleUrls: ['../../../../app/community-page/community-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut],
  standalone: true,
  imports: [
    ThemedComcolPageContentComponent,
    ErrorComponent,
    ThemedLoadingComponent,
    NgIf,
    TranslateModule,
    ThemedCommunityPageSubCommunityListComponent,
    ThemedCollectionPageSubCollectionListComponent,
    ThemedComcolPageBrowseByComponent,
    DsoEditMenuComponent,
    ThemedComcolPageHandleComponent,
    ComcolPageLogoComponent,
    ComcolPageHeaderComponent,
    AsyncPipe,
    VarDirective,
    RouterOutlet,
    RouterModule,
  ],
})
/**
 * This component represents a detail page for a single community
 */
export class CommunityPageComponent extends BaseComponent {
  currentLang: string;
  title: string;

  constructor(
    route: ActivatedRoute,
    router: Router,
    authService: AuthService,
    authorizationDataService: AuthorizationDataService,
    dsoNameService: DSONameService,
    public localeService: LocaleService,
  ) {
    super(route,
      router,
      authService,
      authorizationDataService,
      dsoNameService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.localeService.getCurrentLanguageCode().subscribe(code => {
      this.currentLang = code;
    });
    this.getTranslatedName();
  }

  getTranslatedName() {
    this.communityRD$.subscribe((data) => {
      for (let md of data.payload.metadata["dc.title"]) {
        this.title = md["language"] === this.currentLang ? md["value"] : "";
      }
      if (this.title === "") {
        this.title = this.dsoNameService.getName(data.payload);
      }
    });
  }
}
