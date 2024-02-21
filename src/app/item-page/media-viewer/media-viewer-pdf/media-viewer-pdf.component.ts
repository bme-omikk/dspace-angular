import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { MediaViewerItem } from '../../../core/shared/media-viewer-item.model';

@Component({
  selector: 'ds-media-viewer-pdf',
  templateUrl: './media-viewer-pdf.component.html',
  styleUrls: ['./media-viewer-pdf.component.scss']
})
export class MediaViewerPdfComponent {
  @Input() pdfs: MediaViewerItem[];

  @Input()
    public showViewer: boolean;

  @Output()
    public showViewerChange = new EventEmitter<boolean>();

  public onClick: () => void;

  constructor(
  ) {
    // do not use PDF forms
    pdfDefaultOptions.annotationMode = 0;
    pdfDefaultOptions.renderForms = false;
    // disable user settings to be stored in LocalStore
    pdfDefaultOptions.disableHistory = true;

    pdfDefaultOptions.doubleTapZoomFactor = '100%'; // The default value is '200%'
    pdfDefaultOptions.maxCanvasPixels = 4096 * 4096 * 5; // The default value is 4096 * 4096 pixels

    const emitter = this.showViewer;
      this.onClick = () => {
        setTimeout(() => {
            this.closeViewer();
        });
      };
  }

  closeViewer() {
    let el = document.getElementById('pdf-viewer-wrapper');
    if (el) {
      el.style.display = 'none';
    }
  }
}
