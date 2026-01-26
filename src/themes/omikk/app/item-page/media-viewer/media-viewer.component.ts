import {
  AsyncPipe,
  CommonModule,
  Location,
  NgIf,
} from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  Subscription,
} from 'rxjs';
import {
  filter,
  take,
} from 'rxjs/operators';

import { BitstreamDataService } from '../../../../../app/core/data/bitstream-data.service';
import { AuthorizationDataService } from '../../../../../app/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../../../app/core/data/feature-authorization/feature-id';
import { PaginatedList } from '../../../../../app/core/data/paginated-list.model';
import { RemoteData } from '../../../../../app/core/data/remote-data';
import { Bitstream } from '../../../../../app/core/shared/bitstream.model';
import { BitstreamFormat } from '../../../../../app/core/shared/bitstream-format.model';
import { Item } from '../../../../../app/core/shared/item.model';
import { getFirstSucceededRemoteDataPayload } from '../../../../../app/core/shared/operators';
import { hasValue } from '../../../../../app/shared/empty.util';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { FileSizePipe } from '../../../../../app/shared/utils/file-size-pipe';
import { followLink } from '../../../../../app/shared/utils/follow-link-config.model';
import { VarDirective } from '../../../../../app/shared/utils/var.directive';
import { ThemedThumbnailComponent } from '../../../../../app/thumbnail/themed-thumbnail.component';
import { environment } from '../../../../../environments/environment';
import { ViewpdfService } from '../../../app/shared/viewpdf.service';
import { OMIKKMediaViewerConfig as MediaViewerConfig } from './media-viewer-config.interface';
import { ThemedMediaViewerImageComponent } from './media-viewer-image/themed-media-viewer-image.component';
import { MediaViewerPdfComponent } from './media-viewer-pdf/media-viewer-pdf.component';
import { ThemedMediaViewerVideoComponent } from './media-viewer-video/themed-media-viewer-video.component';
import { OMIKKMediaViewerItem as MediaViewerItem } from './omikk-media-viewer-item.model';

/**
 * This component renders the media viewers
 */
@Component({
  selector: 'ds-themed-base-media-viewer',
  templateUrl: './media-viewer.component.html',
  styleUrls: ['./media-viewer.component.scss'],
  imports: [
    CommonModule,
    ThemedMediaViewerImageComponent,
    ThemedThumbnailComponent,
    AsyncPipe,
    NgIf,
    ThemedMediaViewerVideoComponent,
    TranslateModule,
    ThemedLoadingComponent,
    VarDirective,
    FileSizePipe,
    MediaViewerPdfComponent,
  ],
  standalone: true,
})
export class MediaViewerComponent implements OnDestroy, OnInit {
  @Input() item: Item;

  @Input() kbLoaded: string;

  @Input() mediaOptions: MediaViewerConfig = environment.mediaViewer;

  @Input() pdfblob: Blob;
  @Input() pdflink: string = null;

  mediaList$: BehaviorSubject<MediaViewerItem[]> = new BehaviorSubject([]);

  request: any;

  captions$: BehaviorSubject<Bitstream[]> = new BehaviorSubject([]);

  isLoading = true;

  thumbnailPlaceholder = './assets/images/replacement_document.svg';

  thumbnailsRD$: Observable<RemoteData<PaginatedList<Bitstream>>>;

  subs: Subscription[] = [];

  viewPdfOnCollLevel = '';
  viewPdfOnItemLevel = '';
  viewPdfEnabled = false;

  constructor(
    protected bitstreamDataService: BitstreamDataService,
    protected changeDetectorRef: ChangeDetectorRef,
    private authorizationService: AuthorizationDataService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private location: Location,
  ) {
  }

  ngOnDestroy(): void {
    this.subs.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  /**
   * This method loads all the Bitstreams and Thumbnails and converts it to {@link MediaViewerItem}s
   */
  ngOnInit(): void {
    const types: string[] = [
      ...(this.mediaOptions.image ? ['image'] : []),
      ...(this.mediaOptions.video ? ['audio', 'video'] : []),
      ...(this.mediaOptions.pdf ? ['pdf'] : []),
    ];
    this.thumbnailsRD$ = this.loadRemoteData('THUMBNAIL');
    this.subs.push(this.loadRemoteData('ORIGINAL').subscribe((bitstreamsRD: RemoteData<PaginatedList<Bitstream>>) => {
      if (bitstreamsRD.payload.page.length === 0) {
        this.isLoading = false;
        this.mediaList$.next([]);
      } else {
        this.subs.push(this.thumbnailsRD$.subscribe((thumbnailsRD: RemoteData<PaginatedList<Bitstream>>) => {
          for (
            let index = 0;
            index < bitstreamsRD.payload.page.length;
            index++
          ) {
            this.subs.push(bitstreamsRD.payload.page[index].format
              .pipe(getFirstSucceededRemoteDataPayload())
              .subscribe((format: BitstreamFormat) => {
                const mediaItem = this.createMediaViewerItem(
                  bitstreamsRD.payload.page[index],
                  format,
                  thumbnailsRD.payload && thumbnailsRD.payload.page[index],
                  this.authorizationService.isAuthorized(FeatureID.CanDownload, bitstreamsRD.payload.page[index]._links.self.href),
                );
                if (types.includes(mediaItem.format) || types.includes(mediaItem.type)) {
                  this.mediaList$.next([...this.mediaList$.getValue(), mediaItem]);
                } else if (format.mimetype === 'text/vtt') {
                  this.captions$.next([...this.captions$.getValue(), bitstreamsRD.payload.page[index]]);
                }
              }));
          }
          this.isLoading = false;
          this.isPDFViewEnabled();
          this.changeDetectorRef.detectChanges();
        }));
      }
    }));
  }

  @HostListener('window:popstate', ['$event'])
  handlePopState(event: PopStateEvent) {
    if (this.pdflink) {
      event.preventDefault();
      this.pdflink = null;
      this.changeDetectorRef.detectChanges();
    } else {
      return;
    }
  }

  /**
   * This method will retrieve the next page of Bitstreams from the external BitstreamDataService call.
   * @param bundleName Bundle name
   */
  loadRemoteData(
    bundleName: string,
  ): Observable<RemoteData<PaginatedList<Bitstream>>> {
    return this.bitstreamDataService
      .findAllByItemAndBundleName(
        this.item,
        bundleName,
        {},
        true,
        true,
        followLink('format'),
      )
      .pipe(
        filter(
          (bitstreamsRD: RemoteData<PaginatedList<Bitstream>>) =>
            hasValue(bitstreamsRD) &&
            (hasValue(bitstreamsRD.errorMessage) || hasValue(bitstreamsRD.payload)),
        ),
        take(1),
      );
  }

  /**
   * This method creates a {@link MediaViewerItem} from incoming {@link Bitstream}s
   * @param original original bitstream
   * @param format original bitstream format
   * @param thumbnail thumbnail bitstream
   */
  createMediaViewerItem(original: Bitstream, format: BitstreamFormat, thumbnail: Bitstream, canDownload: Observable<boolean>): MediaViewerItem {
    const mediaItem = new MediaViewerItem();
    mediaItem.bitstream = original;
    mediaItem.format = format.mimetype.split('/')[0];
    mediaItem.type = format.mimetype.split('/')[1];
    mediaItem.mimetype = format.mimetype;
    mediaItem.thumbnail = thumbnail ? thumbnail._links.content.href : null;
    canDownload.subscribe(cd => {
      mediaItem.canDownload = cd;
      this.changeDetectorRef.detectChanges();
    });
    return mediaItem;
  }

  public showPdfViewer(mediaItem) {
    history.pushState(null, '', location.href);
    this.pdflink = mediaItem.bitstream._links.content.href;
    this.changeDetectorRef.detectChanges();
  }

  public handleClose() {
    history.replaceState('', null, '');
    history.back();
    this.pdflink = null;
    this.changeDetectorRef.detectChanges();
  }

  /**
   * viewPdfOnCollLevel: a dspace.pdfviewer.enabled meg van adva a tételeket tartalmazó szülő gyűjtemény szintjén.
   * viewPdfOnItemLevel: a dspace.pdfviewer.enabled meg van adva a tétel metaadatai között.
   * canDownload: a bitstreamek felolvasása közben kerül beállításra az authorizationService.isAuthorized visszatérési értéke
   *  lesz benne, és a mediaItem-eket tároló mediaList.canDownload fogja tartalmazni. Csak a listában az első helyen szereplő
   *  bitstream-mel foglalkozunk, mert ahhoz lesz a bélyegkép megjelenítve, amire aztán kattintva megjelenhet a PDF viewer.
   * viewPdfStatus: a viewPDFOnCollLevel és/vagy a viewPdfOnItemLevel értéke. A tétel szintű metaadat erősebb, mint a
   *  gyűjtemény szintű, így, ha mind a kettő meg van adva, akkor a tétel metaadata lesz használva. Ha egyik sincs megadva,
   *  akkor üres sztring.
   * viewPdfEnabled: ez mondja meg a fenti feltételek alapján, hogy végül a PDF viewer előhívható-e a bélyegképre kattintással
   *  vagy sem?
   *
   * A dspace.viewpdf.enabled háromállású sztring lehet:
   *
   * 1: Csak a PDF nézegetővel lehet a tétel csatolmányát megnézni. A letöltés link nem elérhető sem a tétel oldalán, sem a nézegetőben. - viewer
   * 2: Elérhető a PDF nézegető és a tétel letöltés linkje is. - viewer-download
   * 3: A PDF nézegető nem érhető el. - download
   */
  isPDFViewEnabled() {
    const vp = new ViewpdfService(this.item);

    combineLatest(vp.statusOnCollLevel(), vp.statusOnItemLevel()).subscribe(([coll, item]) => {
      this.viewPdfOnCollLevel = coll;
      this.viewPdfOnItemLevel = item;
      this.viewPdfEnabled = false;

      let viewPdfStatus = '';
      const mediaOptionsPDF: boolean = this.mediaOptions.pdf;
      const mediaType: string = this.mediaList$.value[0]?.type;

      if (this.viewPdfOnItemLevel !== 'na') {
        viewPdfStatus = this.viewPdfOnItemLevel;
      } else if (this.viewPdfOnCollLevel !== 'na') {
        viewPdfStatus = this.viewPdfOnCollLevel;
      } else {
        viewPdfStatus = '';
      }

      switch (viewPdfStatus) {
        case 'viewer': {
          this.viewPdfEnabled = mediaOptionsPDF && (mediaType === 'pdf' ? true : false);
          break;
        }
        case 'viewer-download': {
          this.viewPdfEnabled = mediaOptionsPDF && (mediaType === 'pdf' ? true : false);
          break;
        }
        case 'download': {
          this.viewPdfEnabled = false;
          break;
        }
        default: {
          this.viewPdfEnabled = false;
          break;
        }
      }
    });
  }
}
