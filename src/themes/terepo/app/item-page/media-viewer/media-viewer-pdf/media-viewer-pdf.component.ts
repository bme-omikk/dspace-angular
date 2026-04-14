import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PdfViewerComponent } from '../../../shared/pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'ds-media-viewer-pdf',
  templateUrl: './media-viewer-pdf.component.html',
  styleUrls: ['./media-viewer-pdf.component.scss'],
  imports: [NgIf, PdfViewerComponent],
  standalone: true,
})
export class MediaViewerPdfComponent {
  @Input() pdfBlobUrl: string | null = null;
  @Output() loadError = new EventEmitter<void>();

  disableContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }
}
