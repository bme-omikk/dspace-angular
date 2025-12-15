import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import {
  select,
  Store,
} from '@ngrx/store';
import { AppState } from '../app.reducer';
import { isAuthenticated } from '../core/auth/selectors';
import { RouterLink } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { ThemedSearchNavbarComponent } from '../search-navbar/themed-search-navbar.component';
import { ThemedAuthNavMenuComponent } from '../shared/auth-nav-menu/themed-auth-nav-menu.component';
import {
  HostWindowService,
  WidthCategory,
} from '../shared/host-window.service';
import { ImpersonateNavbarComponent } from '../shared/impersonate-navbar/impersonate-navbar.component';
import { ThemedLangSwitchComponent } from '../shared/lang-switch/themed-lang-switch.component';
import { MenuService } from '../shared/menu/menu.service';
import { MenuID } from '../shared/menu/menu-id.model';
import { ContextHelpToggleComponent } from './context-help-toggle/context-help-toggle.component';

/**
 * Represents the header with the logo and simple navigation
 */
@Component({
  selector: 'ds-base-header',
  styleUrls: ['header.component.scss'],
  templateUrl: 'header.component.html',
  standalone: true,
  imports: [RouterLink, ThemedLangSwitchComponent, NgbDropdownModule, ThemedSearchNavbarComponent, ContextHelpToggleComponent, ThemedAuthNavMenuComponent, ImpersonateNavbarComponent, TranslateModule, AsyncPipe, NgIf],
})
export class HeaderComponent implements OnInit {
  /**
   * Whether user is authenticated.
   * @type {Observable<string>}
   */
  public isAuthenticated$: Observable<boolean>;
  public isMobile$: Observable<boolean>;
  public showRRF: boolean = false;

  menuID = MenuID.PUBLIC;
  maxMobileWidth = WidthCategory.SM;

  constructor(
    protected menuService: MenuService,
    protected windowService: HostWindowService,
    private store: Store<AppState>,
  ) {
  }

  ngOnInit(): void {
    this.isAuthenticated$ = this.store.pipe(select(isAuthenticated));
    this.isAuthenticated$.subscribe((res) => {
      console.log(this.isAuthenticated$, res);
      this.showRRF = res;
    });
    this.isMobile$ = this.windowService.isUpTo(this.maxMobileWidth);
  }

  public toggleNavbar(): void {
    this.menuService.toggleMenu(this.menuID);
  }
}
