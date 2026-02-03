import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  hasValue,
  isEmpty,
} from '../../../../app/shared/empty.util';
import { DSpaceObject } from '../../../../app/core/shared/dspace-object.model';
import { Metadata } from '../../../../app/core/shared/metadata.utils';
import { DSONameService } from '../../../../app/core/breadcrumbs/dso-name.service';
import { LocaleService } from '../../../../app/core/locale/locale.service';

@Injectable({
  providedIn: 'root',
})
export class DSONameServiceTranslated extends DSONameService {
  currentLang: string;

  constructor(translateService: TranslateService,
    public localeService: LocaleService,
  ) {
    super(translateService);
    this.localeService.getCurrentLanguageCode().subscribe(code => {
      this.currentLang = code;
    });
  }

  getTranslatedName(dso: DSpaceObject | undefined, escapeHTML?: boolean): string {
    if (dso) {
      let title: string;

      for (let md of dso.allMetadata("dc.title")){
        title = md["language"] === this.currentLang ? md["value"] : this.getName(dso);
      }
      return title;
    } else {
      return '';
    }
  }
}
