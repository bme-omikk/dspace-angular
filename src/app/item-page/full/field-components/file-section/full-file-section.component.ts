import { ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { BitstreamDataService } from '../../../../core/data/bitstream-data.service';
import { ConfigurationDataService } from '../../../../core/data/configuration-data.service';

import { Bitstream } from '../../../../core/shared/bitstream.model';
import { ConfigurationProperty } from '../../../../core/shared/configuration-property.model';
import { Item } from '../../../../core/shared/item.model';
import { followLink } from '../../../../shared/utils/follow-link-config.model';
import { FileSectionComponent } from '../../../simple/field-components/file-section/file-section.component';
import { PaginationComponentOptions } from '../../../../shared/pagination/pagination-component-options.model';
import { PaginatedList } from '../../../../core/data/paginated-list.model';
import { RemoteData } from '../../../../core/data/remote-data';
import { getFirstCompletedRemoteData } from '../../../../core/shared/operators';
import { switchMap, tap } from 'rxjs/operators';
import { NotificationsService } from '../../../../shared/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { hasValue, isEmpty } from '../../../../shared/empty.util';
import { PaginationService } from '../../../../core/pagination/pagination.service';
import { DSONameService } from '../../../../core/breadcrumbs/dso-name.service';
import { AuthorizationDataService } from '../../../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../../core/data/feature-authorization/feature-id';
import { AppConfig, APP_CONFIG } from 'src/config/app-config.interface';
import { ViewpdfService } from '../../../../shared/viewpdf.service';
import { HttpClient, HttpEvent } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * This component renders the file section of the item
 * inside a 'ds-metadata-field-wrapper' component.
 */

@Component({
  selector: 'ds-item-page-full-file-section',
  styleUrls: ['./full-file-section.component.scss'],
  templateUrl: './full-file-section.component.html'
})
export class FullFileSectionComponent extends FileSectionComponent implements OnDestroy, OnInit {

  @Input() item: Item;

  kbLoaded: string;

  pdfblob: Blob;

  @Input() pdflink: string = null;

  viewPdfEnabled: boolean;

  canDownload: boolean;

  request: any;

  label: string;

  enableRequestACopy: boolean;

  originals$: Observable<RemoteData<PaginatedList<Bitstream>>>;
  licenses$: Observable<RemoteData<PaginatedList<Bitstream>>>;

  originalOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'obo',
    currentPage: 1,
    pageSize: this.appConfig.item.bitstream.pageSize
  });

  licenseOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'lbo',
    currentPage: 1,
    pageSize: this.appConfig.item.bitstream.pageSize
  });

  constructor(
    protected configurationService: ConfigurationDataService,
    bitstreamDataService: BitstreamDataService,
    protected notificationsService: NotificationsService,
    protected translateService: TranslateService,
    protected paginationService: PaginationService,
    protected authorizationService: AuthorizationDataService,
    public dsoNameService: DSONameService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    protected changeDetectorRef: ChangeDetectorRef,
    @Inject(APP_CONFIG) protected appConfig: AppConfig
  ) {
    super(configurationService, bitstreamDataService, notificationsService, translateService, dsoNameService, appConfig);
  }

  ngOnInit(): void {
    this.initialize();
    this.isPDFViewEnabled();
  }

  initialize(): void {
    this.originals$ = this.paginationService.getCurrentPagination(this.originalOptions.id, this.originalOptions).pipe(
      switchMap((options: PaginationComponentOptions) => this.bitstreamDataService.findAllByItemAndBundleName(
        this.item,
        'ORIGINAL',
        {elementsPerPage: options.pageSize, currentPage: options.currentPage},
        true,
        true,
        followLink('format'),
        followLink('thumbnail'),
      )),
      tap((rd: RemoteData<PaginatedList<Bitstream>>) => {
          if (hasValue(rd.errorMessage)) {
            this.notificationsService.error(this.translateService.get('file-section.error.header'), `${rd.statusCode} ${rd.errorMessage}`);
          }
        }
      )
    );

    this.licenses$ = this.paginationService.getCurrentPagination(this.licenseOptions.id, this.licenseOptions).pipe(
      switchMap((options: PaginationComponentOptions) => this.bitstreamDataService.findAllByItemAndBundleName(
        this.item,
        'LICENSE',
        {elementsPerPage: options.pageSize, currentPage: options.currentPage},
        true,
        true,
        followLink('format'),
        followLink('thumbnail'),
      )),
      tap((rd: RemoteData<PaginatedList<Bitstream>>) => {
          if (hasValue(rd.errorMessage)) {
            this.notificationsService.error(this.translateService.get('file-section.error.header'), `${rd.statusCode} ${rd.errorMessage}`);
          }
        }
      )
    );

    this.configurationService.findByPropertyName('request.item.type').pipe(
      getFirstCompletedRemoteData(),
      map((response: RemoteData<ConfigurationProperty>) => {
        if (response.hasSucceeded) {
          return response.payload.values[0] === undefined ? false : true;
        }
      })
    ).subscribe(res => this.enableRequestACopy = res);

  }

  hasValuesInBundle(bundle: PaginatedList<Bitstream>) {
    return hasValue(bundle) && !isEmpty(bundle.page);
  }

  ngOnDestroy(): void {
    this.paginationService.clearPagination(this.originalOptions.id);
    this.paginationService.clearPagination(this.licenseOptions.id);
  }

  isPDFViewEnabled() {
    let viewPdfOnItemLevel = '';
    let viewPdfOnCollLevel = '';
    let vp = new ViewpdfService(this.item);

    combineLatest(vp.statusOnCollLevel(), vp.statusOnItemLevel()).subscribe(([coll, item]) => {
      viewPdfOnCollLevel = coll;
      viewPdfOnItemLevel = item;

      this.viewPdfEnabled = false;

      let viewPdfStatus = '';

      if (viewPdfOnItemLevel !== 'na') {
        this.viewPdfEnabled = viewPdfOnItemLevel === 'viewer' || viewPdfOnItemLevel === 'viewer-download' ? true : false;
      } else if (viewPdfOnCollLevel !== 'na') {
        this.viewPdfEnabled = viewPdfOnCollLevel === 'viewer' || viewPdfOnCollLevel === 'viewer-download' ? true : false;
      } else {
        this.viewPdfEnabled = false;
      }
    });
  }

  isDownloadable(bitstream) {
    return this.authorizationService.isAuthorized(
      FeatureID.CanDownload,
      bitstream._links.self.href);
  }

  showPdfViewer(bitstream) {
    this.pdflink = bitstream._links.self.href + '/content';
    this.changeDetectorRef.detectChanges();
  }

  private showPDFModal() {
    document.getElementById('pdf-viewer-wrapper').style.display = 'block';
  }

  private showProgressModal() {
    document.getElementById('viewer-progress').style.display = 'block';
  }

  private hideProgressModal() {
    document.getElementById('viewer-progress').style.display = 'none';
  }

  private getPDFContent(bitstream): Observable<HttpEvent<any>> {
    return this.http.get(bitstream._links.content.href,
      { responseType: 'blob',
        headers: { Accept: 'application/pdf' },
        reportProgress: true, observe: 'events'
      }
    );
  }

  async cancelContentDownload() {
    this.request.unsubscribe();
    this.hideProgressModal();
  }

  public handleClose() {
    this.pdflink = null;
    this.changeDetectorRef.detectChanges();
  }
}
