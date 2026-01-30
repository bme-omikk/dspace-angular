import { NgIf } from '@angular/common';
import { 
  Component,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { Community } from '../../../../../../app/core/shared/community.model';
import { Context } from '../../../../../../app/core/shared/context.model';
import { ViewMode } from '../../../../../../app/core/shared/view-mode.model';
import { listableObjectComponent } from '../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { CommunityListElementComponent as BaseComponent } from '../../../../../../app/shared/object-list/community-list-element/community-list-element.component';
import { DSONameService } from '../../../../../../app/core/breadcrumbs/dso-name.service';
import { LocaleService } from '../../../../../../app/core/locale/locale.service';

@listableObjectComponent(Community, ViewMode.ListElement, Context.Any, 'omikk')

@Component({
  selector: 'ds-community-list-element',
  // styleUrls: ['./community-list-element.component.scss'],
  styleUrls: ['../../../../../../app/shared/object-list/community-list-element/community-list-element.component.scss'],
  templateUrl: './community-list-element.component.html',
  //templateUrl: '../../../../../../app/shared/object-list/community-list-element/community-list-element.component.html',
  standalone: true,
  imports: [NgIf, RouterLink],
})
/**
 * Component representing a list element for a community
 */
export class CommunityListElementComponent extends BaseComponent {
  currentLang: string;

  constructor(
    public dsoNameService: DSONameService,
    public localeService: LocaleService,) {
    super(dsoNameService);
  }

  ngOnInit() {
    this.localeService.getCurrentLanguageCode().subscribe(code => {
      this.currentLang = code;
    });
  }

  getName() {
    let title: string;

    for (let md of this.object.allMetadata("dc.title")){
      title = md["language"] === this.currentLang ? md["value"] : "";
    }
    
    return title === "" ? this.dsoNameService.getName(this.object) : title;
  }
}
