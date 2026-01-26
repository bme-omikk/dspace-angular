import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  NgxExtendedPdfViewerModule,
  pdfDefaultOptions,
  PdfLoadedEvent,
  ProgressBarEvent,
} from 'ngx-extended-pdf-viewer';

import { OMIKKMediaViewerItem as MediaViewerItem } from '../omikk-media-viewer-item.model';

@Component({
  selector: 'ds-media-viewer-pdf',
  templateUrl: './media-viewer-pdf.component.html',
  styleUrls: ['./media-viewer-pdf.component.scss'],
  imports: [
    CommonModule,
    NgxExtendedPdfViewerModule,
  ],
  standalone: true,
})
export class MediaViewerPdfComponent {
  private containerEl: HTMLElement;
  private progressBarEl: HTMLElement;

  @Input() pdf: MediaViewerItem[];

  @Input() src: string;

  @Input() public showViewer: boolean;

  @Output() close = new EventEmitter<void>();

  showError = false;

  public closeComponent: () => void;

  constructor(
    protected changeDetectorRef: ChangeDetectorRef) {
    // do not use PDF forms
    pdfDefaultOptions.annotationMode = 0;
    //pdfDefaultOptions.renderForms = false;
    // disable user settings to be stored in LocalStore
    pdfDefaultOptions.disableHistory = true;

    pdfDefaultOptions.doubleTapZoomFactor = '100%'; // The default value is '200%'
    pdfDefaultOptions.maxCanvasPixels = 4096 * 4096 * 5; // The default value is 4096 * 4096 pixels

    this.closeComponent = () => {
      this.hideProgressBar();
      this.close.emit();
    };
  }

  private createProgressBar() {
    this.progressBarEl = document.createElement('progress');
    this.progressBarEl.setAttribute('id', 'pdf-progress');
    this.progressBarEl.setAttribute('value', '0');
    this.progressBarEl.setAttribute('max', '100');
    this.containerEl.appendChild(this.progressBarEl);
  }

  private showProgressBar() {
    if (this.progressBarEl !== null) {
      this.progressBarEl.setAttribute('value', '0');
      this.progressBarEl.setAttribute('style',
        'display:block;position:absolute;left:0px;top:0px;width:100%;z-index:1000;');
    }
  }

  private hideProgressBar() {
    if (this.progressBarEl !== null) {
      this.progressBarEl.setAttribute('value', '0');
      this.progressBarEl.setAttribute('style',
        'display:none;position:absolute;left:0px;top:0px;width:100%;z-index.1000;');
    }
  }

  public onStartLoading(evt: any) {
    this.containerEl = document.getElementById('toolbarViewer');

    if (this.containerEl === null) {
      return;
    }

    this.createProgressBar();
    this.showProgressBar();
  }

  public onProgress(evt: ProgressBarEvent) {
    if (this.progressBarEl !== null) {
      this.progressBarEl.setAttribute('value', evt.percent.toString());
    }
  }

  public onLoadingFailed(err: Error): void {
    this.hideProgressBar();

    this.showError = true;
    this.changeDetectorRef.detectChanges();

    window.setTimeout(() => {
      this.showError = false;
      this.changeDetectorRef.detectChanges();
      this.closeComponent();
      this.close.emit();
      this.changeDetectorRef.detectChanges();
    }, 3000);
  }

  public onLoaded(evt: PdfLoadedEvent) {
    this.hideProgressBar();
  }
}
