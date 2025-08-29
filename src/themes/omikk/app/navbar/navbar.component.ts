import {
  AsyncPipe,
  NgClass,
  NgComponentOutlet,
  NgFor,
  NgIf,
} from '@angular/common';
import {
  Component,
  Inject,
  Injector,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { ThemedUserMenuComponent } from 'src/app/shared/auth-nav-menu/user-menu/themed-user-menu.component';

import { AppState } from '../../../../app/app.reducer';
import { BrowseService } from '../../../../app/core/browse/browse.service';
import { AuthorizationDataService } from '../../../../app/core/data/feature-authorization/authorization-data.service';
import { NavbarComponent as BaseComponent } from '../../../../app/navbar/navbar.component';
import { slideMobileNav } from '../../../../app/shared/animations/slide';
import { HostWindowService } from '../../../../app/shared/host-window.service';
import { MenuService } from '../../../../app/shared/menu/menu.service';
import { ThemeService } from '../../../../app/shared/theme-support/theme.service';
import { FeatureID } from '../../../..//app/core/data/feature-authorization/feature-id';
import {
  APP_CONFIG,
  AppConfig,
} from '../../../../config/app-config.interface';
import { OmikkUploadComponent } from '../shared/omikk-upload/omikk-upload.component';

/**
 * Component representing the public navbar
 */
@Component({
  selector: 'ds-themed-navbar',
  styleUrls: ['./navbar.component.scss'],
  templateUrl: './navbar.component.html',
  animations: [slideMobileNav],
  standalone: true,
  imports: [NgbDropdownModule, NgClass, NgIf, ThemedUserMenuComponent, NgFor, NgComponentOutlet, AsyncPipe, TranslateModule, OmikkUploadComponent],
})
export class NavbarComponent extends BaseComponent {
  isDevMode: boolean = this.appConfig.rest.host.includes('dev') ? true : false;
  isAdmin: boolean = false;
  showOmikkTool: boolean = false;

  constructor(
    protected menuService: MenuService,
    protected injector: Injector,
    public windowService: HostWindowService,
    public browseService: BrowseService,
    public authorizationService: AuthorizationDataService,
    public route: ActivatedRoute,
    protected themeService: ThemeService,
    store: Store<AppState>,
    @Inject(APP_CONFIG) private appConfig: AppConfig,
  ) {
    super(
      menuService,
      injector,
      windowService,
      browseService,
      authorizationService,
      route,
      themeService,
      store);
    this.authorizationService.isAuthorized(FeatureID.AdministratorOf).subscribe(res => {
      this.isAdmin = true; // res; for the tests only
    });
  }

  toggleTool(event: Event): void {
    console.log(this.showOmikkTool);
    event.preventDefault();
    this.showOmikkTool = !this.showOmikkTool;
  }
}
