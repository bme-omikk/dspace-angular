import {
  Component, Input, AfterViewInit, ViewChild, ElementRef,
  ChangeDetectorRef, EventEmitter, Output
} from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var pdfjsLib: any;

type ZoomMode = 'width' | 'height' | 'custom';

@Component({
  selector: 'ds-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  imports: [NgIf, NgClass, FormsModule],
  standalone: true
})
export class PdfViewerComponent implements AfterViewInit {
  @Input() pdfUrl!: string;
  @ViewChild('pdfContainer') pdfContainer!: ElementRef<HTMLDivElement>;
  @Output() loadError = new EventEmitter<void>();

  isLoading = true;
  zoomMode: ZoomMode = 'width';
  customZoom = 100; // percent

  private pdfDoc: any = null;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.js';

    if (!this.pdfUrl?.startsWith('blob:')) {
      this.isLoading = false;
      this.loadError.emit();
      return;
    }

    pdfjsLib.getDocument(this.pdfUrl).promise.then((pdf: any) => {
      this.pdfDoc = pdf;
      return this.renderAll();
    }).then(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }).catch((err: any) => {
      console.error('Error loading PDF:', err);
      this.isLoading = false;
      this.loadError.emit();
      this.cdr.detectChanges();
    });
  }

  setZoom(mode: ZoomMode): void {
    this.zoomMode = mode;
    this.rerender();
  }

  applyCustomZoom(): void {
    this.zoomMode = 'custom';
    this.rerender();
  }

  private rerender(): void {
    if (!this.pdfDoc) return;
    this.isLoading = true;
    this.cdr.detectChanges();
    const container = this.pdfContainer.nativeElement;
    while (container.firstChild) container.removeChild(container.firstChild);
    this.renderAll().then(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }).catch((err: any) => {
      console.error('Error re-rendering PDF:', err);
      this.isLoading = false;
      this.loadError.emit();
      this.cdr.detectChanges();
    });
  }

  private renderAll(): Promise<any> {
    const container = this.pdfContainer.nativeElement;
    const renders: Promise<any>[] = [];
    for (let pageNum = 1; pageNum <= this.pdfDoc.numPages; pageNum++) {
      renders.push(this.pdfDoc.getPage(pageNum).then((page: any) => {
        const scale = this.calcScale(page, container);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        container.appendChild(canvas);
        return page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
      }));
    }
    return Promise.all(renders);
  }

  private calcScale(page: any, container: HTMLElement): number {
    const base = page.getViewport({ scale: 1 });
    switch (this.zoomMode) {
      case 'width':
        return (container.clientWidth || window.innerWidth) / base.width;
      case 'height':
        return (window.innerHeight * 0.85) / base.height;
      case 'custom':
        return Math.min(Math.max(this.customZoom, 10), 400) / 100;
    }
  }
}
