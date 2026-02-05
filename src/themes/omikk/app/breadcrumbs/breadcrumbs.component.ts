import {
  AsyncPipe,
  NgFor,
  NgIf,
  NgTemplateOutlet,
} from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { BreadcrumbsComponent as BaseComponent } from '../../../../app/breadcrumbs/breadcrumbs.component';
import { BreadcrumbsService } from '../../../../app/breadcrumbs/breadcrumbs.service';
import { DSONameServiceTranslated } from '../shared/dso-name.service';
import { VarDirective } from '../../../../app/shared/utils/var.directive';

/**
 * Component representing the breadcrumbs of a page
 */
@Component({
  selector: 'ds-themed-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  //templateUrl: '../../../../app/breadcrumbs/breadcrumbs.component.html',
  // styleUrls: ['./breadcrumbs.component.scss']
  styleUrls: ['../../../../app/breadcrumbs/breadcrumbs.component.scss'],
  standalone: true,
  imports: [VarDirective, NgIf, NgTemplateOutlet, NgFor, RouterLink, NgbTooltipModule, AsyncPipe, TranslateModule],
})
export class BreadcrumbsComponent extends BaseComponent implements OnInit {
  trText: string;

  constructor(
    breadcrumbsService: BreadcrumbsService,
    public dsoNameService: DSONameServiceTranslated,
    public route: ActivatedRoute,
  ) {
    super(breadcrumbsService);

  }

  ngOnInit() {
    console.log("this.breadcrumbs$ ", this.breadcrumbs$);
  }
}
