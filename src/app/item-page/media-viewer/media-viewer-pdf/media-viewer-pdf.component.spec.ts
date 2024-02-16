import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaViewerPdfComponent } from './media-viewer-pdf.component';

describe('MediaViewerPdfComponent', () => {
  let component: MediaViewerPdfComponent;
  let fixture: ComponentFixture<MediaViewerPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaViewerPdfComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaViewerPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
