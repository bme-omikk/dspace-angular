import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { PdfViewerComponent } from './pdf-viewer.component';

// Mock pdfjsLib globally
const mockRender = jasmine.createSpy('render').and.returnValue({ promise: Promise.resolve() });
const mockGetViewport = jasmine.createSpy('getViewport').and.callFake(({ scale }) => ({
  width: 600 * scale,
  height: 800 * scale,
}));
const mockPage = { getViewport: mockGetViewport, render: mockRender };
const mockGetPage = jasmine.createSpy('getPage').and.returnValue(Promise.resolve(mockPage));
const mockPdfDoc = { numPages: 2, getPage: mockGetPage };
const mockGetDocument = jasmine.createSpy('getDocument').and.returnValue({
  promise: Promise.resolve(mockPdfDoc),
});

(window as any).pdfjsLib = {
  GlobalWorkerOptions: { workerSrc: '' },
  getDocument: mockGetDocument,
};

describe('PdfViewerComponent', () => {
  let component: PdfViewerComponent;
  let fixture: ComponentFixture<PdfViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfViewerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfViewerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    mockGetDocument.calls.reset();
    mockGetPage.calls.reset();
    mockRender.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit loadError and not call pdfjsLib when pdfUrl is not a blob URL', fakeAsync(() => {
    const errorSpy = jasmine.createSpy('loadError');
    component.loadError.subscribe(errorSpy);
    component.pdfUrl = 'https://evil.com/file.pdf';

    fixture.detectChanges(); // triggers ngAfterViewInit
    tick();

    expect(mockGetDocument).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  }));

  it('should emit loadError when pdfUrl is a javascript: URL', fakeAsync(() => {
    const errorSpy = jasmine.createSpy('loadError');
    component.loadError.subscribe(errorSpy);
    component.pdfUrl = 'javascript:alert(1)';

    fixture.detectChanges();
    tick();

    expect(mockGetDocument).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
  }));

  it('should load and render all pages for a valid blob URL', fakeAsync(() => {
    component.pdfUrl = 'blob:http://localhost/fake-id';
    fixture.detectChanges();
    tick();

    expect(mockGetDocument).toHaveBeenCalledWith('blob:http://localhost/fake-id');
    expect(mockGetPage).toHaveBeenCalledTimes(2);
    expect(mockRender).toHaveBeenCalledTimes(2);
    expect(component.isLoading).toBeFalse();
  }));

  it('should append one canvas per page to the container', fakeAsync(() => {
    component.pdfUrl = 'blob:http://localhost/fake-id';
    fixture.detectChanges();
    tick();

    const container = component.pdfContainer.nativeElement;
    expect(container.querySelectorAll('canvas').length).toBe(2);
  }));

  it('should emit loadError when pdfjsLib.getDocument rejects', fakeAsync(() => {
    mockGetDocument.and.returnValue({ promise: Promise.reject(new Error('load failed')) });
    const errorSpy = jasmine.createSpy('loadError');
    component.loadError.subscribe(errorSpy);
    component.pdfUrl = 'blob:http://localhost/fake-id';

    fixture.detectChanges();
    tick();

    expect(errorSpy).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();

    // restore
    mockGetDocument.and.returnValue({ promise: Promise.resolve(mockPdfDoc) });
  }));

  it('should default zoomMode to width', () => {
    expect(component.zoomMode).toBe('width');
  });

  it('should change zoomMode and re-render on setZoom', fakeAsync(() => {
    component.pdfUrl = 'blob:http://localhost/fake-id';
    fixture.detectChanges();
    tick();
    mockRender.calls.reset();
    mockGetPage.calls.reset();

    component.setZoom('height');
    tick();

    expect(component.zoomMode).toBe('height');
    expect(mockGetPage).toHaveBeenCalledTimes(2);
  }));

  it('should set zoomMode to custom and re-render on applyCustomZoom', fakeAsync(() => {
    component.pdfUrl = 'blob:http://localhost/fake-id';
    fixture.detectChanges();
    tick();
    mockRender.calls.reset();
    mockGetPage.calls.reset();

    component.customZoom = 150;
    component.applyCustomZoom();
    tick();

    expect(component.zoomMode).toBe('custom');
    expect(mockGetPage).toHaveBeenCalledTimes(2);
  }));

  it('should clamp customZoom below 10 to 10', fakeAsync(() => {
    component.pdfUrl = 'blob:http://localhost/fake-id';
    fixture.detectChanges();
    tick();

    component.customZoom = 0;
    component.applyCustomZoom();
    tick();

    // scale passed to getViewport should be 0.1 (10/100), not 0
    const scaleUsed = mockGetViewport.calls.mostRecent().args[0].scale;
    expect(scaleUsed).toBeGreaterThanOrEqual(0.1);
  }));

  it('should clamp customZoom above 400 to 400', fakeAsync(() => {
    component.pdfUrl = 'blob:http://localhost/fake-id';
    fixture.detectChanges();
    tick();

    component.customZoom = 99999;
    component.applyCustomZoom();
    tick();

    const scaleUsed = mockGetViewport.calls.mostRecent().args[0].scale;
    expect(scaleUsed).toBeLessThanOrEqual(4);
  }));

  it('should not re-render if pdfDoc is null when setZoom is called', () => {
    (component as any).pdfDoc = null;
    component.setZoom('height');
    expect(mockGetPage).not.toHaveBeenCalled();
  });
});
