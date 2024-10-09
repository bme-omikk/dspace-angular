import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ChangeDetectionStrategy, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateLoaderMock } from '../../../../../shared/testing/translate-loader.mock';
import { SharedModule } from '../../../../../shared/shared.module';
import { APP_CONFIG } from '../../../../../../config/app-config.interface';
import { environment } from '../../../../../../environments/environment';
import { By } from '@angular/platform-browser';
import { BrowseDefinitionDataService } from '../../../../../core/browse/browse-definition-data.service';
import { BrowseDefinitionDataServiceStub } from '../../../../../shared/testing/browse-definition-data-service.stub';

let comp: ItemPageOOCFieldComponent;
let fixture: ComponentFixture<ItemPageOOCFieldComponent>;

describe('ItemPageOOCFieldComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        }),
        SharedModule,
      ],
      providers: [
        { provide: APP_CONFIG, useValue: environment },
        { provide: BrowseDefinitionDataService, useValue: BrowseDefinitionDataServiceStub }
      ],
      declarations: [ItemPageOOCFieldComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(ItemPageOOCFieldComponent, {
      set: { changeDetection: ChangeDetectionStrategy.Default }
    }).compileComponents();
  }));

  beforeEach(waitForAsync(() => {

    fixture = TestBed.createComponent(ItemPageOOCFieldComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should render a ds-metadata-values', () => {
    expect(fixture.debugElement.query(By.css('ds-metadata-values'))).not.toBeNull();
  });
});
