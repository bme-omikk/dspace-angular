import {
  Component, Input, AfterViewInit, ViewChild, ElementRef,
  ChangeDetectorRef, EventEmitter, Output, OnDestroy
} from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../../app/core/auth/auth.service';

declare var pdfjsLib: any;

type ZoomMode = 'width' | 'height' | 'custom';

@Component({
  selector: 'ds-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  imports: [NgIf, NgClass, FormsModule],
  standalone: true
})
export class PdfViewerComponent implements AfterViewInit, OnDestroy {
  @Input() pdfUrl!: string;
  @ViewChild('pdfContainer') pdfContainer!: ElementRef<HTMLDivElement>;
  @Output() loadError = new EventEmitter<void>();

  isLoading = true;
  zoomMode: ZoomMode = 'width';
  customZoom = 100; // percent

  private pdfDoc: any = null;

  constructor(private cdr: ChangeDetectorRef, private authService: AuthService) {}

  private destroyed = false;

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.pdfDoc) {
      this.pdfDoc.destroy();
      this.pdfDoc = null;
    }
  }

  ngAfterViewInit(): void {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.js';

    if (!this.pdfUrl) {
      this.isLoading = false;
      this.loadError.emit();
      return;
    }

    const loadingTask = this.pdfUrl.startsWith('blob:')
      ? pdfjsLib.getDocument(this.pdfUrl)
      : pdfjsLib.getDocument({
          url: this.pdfUrl,
          withCredentials: true,
          httpHeaders: this.buildAuthHeaders(),
          rangeChunkSize: 524288, // 512 KB chunks
          disableAutoFetch: true,
          disableStream: true,
        });

    loadingTask.promise.then((pdf: any) => {
      this.pdfDoc = pdf;
      return this.renderAll();
    }).then(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
      // Give the scrollable container keyboard focus so arrow keys / PageUp/Down work
      this.pdfContainer?.nativeElement?.focus();
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

    // Clean up old observer and state
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.renderedPages.clear();

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
    // Only render the first page initially; additional pages render on scroll
    return this.renderPage(1, container).then(() => {
      // Create placeholder divs for remaining pages to enable scrolling
      if (this.pdfDoc.numPages > 1) {
        this.pdfDoc.getPage(1).then((page: any) => {
          const scale = this.calcScale(page, container);
          const viewport = page.getViewport({ scale });
          for (let pageNum = 2; pageNum <= this.pdfDoc.numPages; pageNum++) {
            const placeholder = document.createElement('div');
            placeholder.style.height = viewport.height + 'px';
            placeholder.style.width = viewport.width + 'px';
            placeholder.className = 'pdf-page-placeholder';
            placeholder.dataset.pageNum = String(pageNum);
            container.appendChild(placeholder);
          }
          this.setupLazyRendering(container);
        });
      }
    });
  }

  private renderPage(pageNum: number, container: HTMLElement): Promise<void> {
    if (this.destroyed || !this.pdfDoc) return Promise.resolve();
    return this.pdfDoc.getPage(pageNum).then((page: any) => {
      if (this.destroyed) return;
      const scale = this.calcScale(page, container);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.dataset.pageNum = String(pageNum);
      canvas.className = 'pdf-page-rendered';

      // Find and replace placeholder, or append
      const placeholder = container.querySelector(`[data-page-num="${pageNum}"].pdf-page-placeholder`);
      if (placeholder) {
        container.replaceChild(canvas, placeholder);
      } else {
        container.appendChild(canvas);
      }

      return page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise.then(() => {
        // After rendering, observe the next unrendered placeholders
        this.observeNextPlaceholders(container, 2);
      });
    });
  }

  private renderedPages = new Set<number>();
  private observer: IntersectionObserver | null = null;

  private setupLazyRendering(container: HTMLElement): void {
    this.renderedPages.add(1);

    // Only render pages one at a time, on demand
    let isRendering = false;
    const pendingPages: number[] = [];

    const renderNext = () => {
      if (this.destroyed || isRendering || pendingPages.length === 0) return;
      isRendering = true;
      const pageNum = pendingPages.shift()!;
      this.renderPage(pageNum, container).then(() => {
        isRendering = false;
        if (!this.destroyed) renderNext();
      }).catch(() => {
        isRendering = false;
      });
    };

    this.observer = new IntersectionObserver((entries) => {
      if (this.destroyed) return;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const pageNum = Number(el.dataset.pageNum);
          if (!this.renderedPages.has(pageNum)) {
            this.renderedPages.add(pageNum);
            pendingPages.push(pageNum);
            // Stop observing this placeholder immediately
            this.observer?.unobserve(el);
          }
        }
      });
      renderNext();
    }, {
      root: container,
      rootMargin: '0px', // only when actually entering the viewport
    });

    // Only observe the next few placeholders, not all
    this.observeNextPlaceholders(container, 2);
  }

  /**
   * Observe only the next N unrendered placeholders.
   * Called after each page render to progressively observe more.
   */
  private observeNextPlaceholders(container: HTMLElement, count: number): void {
    if (!this.observer) return;
    const placeholders = container.querySelectorAll('.pdf-page-placeholder');
    let observed = 0;
    placeholders.forEach(el => {
      if (observed >= count) return;
      const pageNum = Number((el as HTMLElement).dataset.pageNum);
      if (!this.renderedPages.has(pageNum)) {
        this.observer!.observe(el);
        observed++;
      }
    });
  }

  private buildAuthHeaders(): Record<string, string> {
    const token = this.authService.getToken();
    return token?.accessToken ? { Authorization: `Bearer ${token.accessToken}` } : {};
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
