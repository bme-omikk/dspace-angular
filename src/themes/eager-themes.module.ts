import { NgModule } from '@angular/core';

import { EagerThemeModule as OMIKKEagerThemeModule } from './omikk/eager-theme.module';

/**
 * This module bundles the eager theme modules for all available themes.
 * Eager modules contain components that are present on every page (to speed up initial loading)
 * and entry components (to ensure their decorators get picked up).
 *
 * Themes that aren't in use should not be imported here so they don't take up unnecessary space in the main bundle.
 */
@NgModule({
  imports: [
    OMIKKEagerThemeModule,
  ],
})
export class EagerThemesModule {
}
