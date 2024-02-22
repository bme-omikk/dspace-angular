import { Component, Inject, Injector, isDevMode } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { MenuService } from '../../../../app/shared/menu/menu.service';
import { HostWindowService } from '../../../../app/shared/host-window.service';
import { BrowseService } from '../../../../app/core/browse/browse.service';
import { ActivatedRoute } from '@angular/router';
import { AuthorizationDataService } from '../../../../app/core/data/feature-authorization/authorization-data.service';
import { ThemeService } from '../../../../app/shared/theme-support/theme.service';
import { NavbarComponent as BaseComponent } from '../../../../app/navbar/navbar.component';
import { slideMobileNav } from '../../../../app/shared/animations/slide';
import { AppState } from '../../../../app/app.reducer';
import { APP_CONFIG, AppConfig } from '../../../../config/app-config.interface';

/**
 * Component representing the public navbar
 */
@Component({
  selector: 'ds-navbar',
  styleUrls: ['./navbar.component.scss'],
  templateUrl: './navbar.component.html',
  animations: [slideMobileNav]
})
export class NavbarComponent extends BaseComponent {
  is_dev_mode: boolean = this.appConfig.rest.host.includes('dev') ? true : false;
  
  constructor(
    protected menuService: MenuService,
    protected injector: Injector,
    public windowService: HostWindowService,
    public browseService: BrowseService,
    public authorizationService: AuthorizationDataService,
    public route: ActivatedRoute,
    protected themeService: ThemeService,
    store: Store<AppState>, //private scope must be removed due to compiler error
    @Inject(APP_CONFIG) private appConfig: AppConfig
  ) {
      super(menuService, injector, windowService, browseService, authorizationService, route, themeService, store);
  }
}
