import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Item } from '../../../../../../../app/core/shared/item.model';
import { ViewMode } from '../../../../../../../app/core/shared/view-mode.model';
import {
  listableObjectComponent
} from '../../../../../../../app/shared/object-collection/shared/listable-object/listable-object.decorator';
import { Context } from '../../../../../../../app/core/shared/context.model';
import {
  UntypedItemComponent as BaseComponent
} from '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component';
import { ViewpdfService } from '../../../../../../../app/shared/viewpdf.service'; 
/**
 * Component that represents an untyped Item page
 */
@listableObjectComponent(Item, ViewMode.StandalonePage, Context.Any, 'bme')
@Component({
  selector: 'ds-untyped-item',
  styleUrls: ['./untyped-item.component.scss'],
  //styleUrls: ['../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component.scss'],
  templateUrl: './untyped-item.component.html',
  //templateUrl: '../../../../../../../app/item-page/simple/item-types/untyped-item/untyped-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UntypedItemComponent extends BaseComponent implements OnInit {
  private viewPdfOnCollLevel: string;
  private viewPdfOnItemLevel: string;
  viewDownloadLink: boolean;

  ngOnInit(): void {
    let vp = new ViewpdfService(this.object);
    vp.statusOnCollLevel().subscribe(r => { this.viewPdfOnCollLevel = r; });
    vp.statusOnItemLevel().subscribe(r => { this.viewPdfOnItemLevel = r; });

    this.viewDownloadLink = false;

    let viewPdfStatus: string = '';

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
        this.viewDownloadLink = false;
        break;
      }
    }
  }
}
