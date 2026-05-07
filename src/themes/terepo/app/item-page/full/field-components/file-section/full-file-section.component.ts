import {
  AsyncPipe,
  NgForOf,
  NgIf,
} from '@angular/common';
import { 
  Component,
  OnInit
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { RouterLink } from '@angular/router';

import { FullFileSectionComponent as BaseComponent } from '../../../../../../../app/item-page/full/field-components/file-section/full-file-section.component';
import { ThemedFileDownloadLinkComponent } from '../../../../../../../app/shared/file-download-link/themed-file-download-link.component';
import { MetadataFieldWrapperComponent } from '../../../../../../../app/shared/metadata-field-wrapper/metadata-field-wrapper.component';
import { PaginationComponent } from '../../../../../../../app/shared/pagination/pagination.component';
import { FileSizePipe } from '../../../../../../../app/shared/utils/file-size-pipe';
import { VarDirective } from '../../../../../../../app/shared/utils/var.directive';
import { ThemedThumbnailComponent } from '../../../../../../../app/thumbnail/themed-thumbnail.component';
import { ViewpdfService } from '../../../../../app/shared/viewpdf.service';

@Component({
  selector: 'ds-themed-item-page-full-file-section',
  // styleUrls: ['./full-file-section.component.scss'],
  styleUrls: ['../../../../../../../app/item-page/full/field-components/file-section/full-file-section.component.scss'],
  templateUrl: './full-file-section.component.html',
  // templateUrl: '../../../../../../../app/item-page/full/field-components/file-section/full-file-section.component.html',
  standalone: true,
  imports: [
    PaginationComponent,
    NgIf,
    TranslateModule,
    AsyncPipe,
    VarDirective,
    ThemedThumbnailComponent,
    NgForOf,
    RouterLink,
    ThemedFileDownloadLinkComponent,
    FileSizePipe,
    MetadataFieldWrapperComponent,
  ],
})
export class FullFileSectionComponent extends BaseComponent implements OnInit {
  hideDownload = false;
  override ngOnInit(): void {
    super.ngOnInit();
    const vp = new ViewpdfService(this.item);
    combineLatest([vp.statusOnCollLevel(), vp.statusOnItemLevel()]).subscribe(([coll, item]) => {
      const status = item !== 'na' ? item : coll !== 'na' ? coll : '';
      this.hideDownload = status === 'viewer';
    });
  }
}
