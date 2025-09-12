import { CollectionDropdownComponent } from '../collection-dropdown/collection-dropdown.component';
import { Component, OnInit } from '@angular/core';
import { NgComponentOutlet, CommonModule } from '@angular/common';
import { ExcelService } from '../service/excel.service';
import { ColumnMapping, ColumnType, SheetDataModel, RowModel } from '../models/column-mapping.model';
import { FormsModule, FormBuilder, FormArray, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-column-mapping',
  templateUrl: './column-mapping.component.html',
  styleUrls: ['./column-mapping.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgComponentOutlet, CollectionDropdownComponent],
  providers: [ExcelService],
})

export class ColumnMappingComponent implements OnInit {
  dropdownRef = CollectionDropdownComponent;

  data: SheetDataModel = {
    headers: [],
    rows: [],
    mappings: []
  };
  
  columnTypes: ColumnType[] = [
    'metadata', 'fileDescription', 'filePath', 'primary', 'permission', 'permissionType', 'assetstore', 'id'
  ];
  
  formRows:FormGroup[] = [];

  selectedCollectionUUID: string = '';
  selectedCollectionName: string = '';

  constructor(private excelService: ExcelService,
              private fb: FormBuilder) {}

  ngOnInit(): void {}

  formGroup: FormGroup = this.fb.group({
    formRows: this.formRows
  });

  onFileSelected(event: Event): void {
    this.excelService.loadFile(
      (event.target as HTMLInputElement).files[0]).subscribe({
        next: ({ headers, rows, mappings }) => {
          this.data.headers = headers;
          this.data.rows = rows;
          this.data.mappings = mappings;
        },
        error: (err) => console.log("warning",err),
    });
  }

  optionLabel(m: ColumnMapping): string {
    return m.columnType === 'metadata' ? m.metadataField : m.columnHeader;
  }

  private importItem(): void {
  }
  
  importItems(all: boolean): void {
    for (let i = 0; i < this.data.rows.length; i++) {
      let to_import;
      let row = this.data.rows[i];
      for (let j = 0; j < row.cells.length; j++) {
        let column = this.getColumnByIndex(j);
        console.log(column, ": ", row.cells[j]);
      }
    }
  }

  getColumnByIndex(idx: number): string {
    for (let i = 0; i < this.data.mappings.length; i++) {
      let header = this.data.mappings[i];
      if (header.columnIndex === idx) {
        return header.columnHeader;
      }
    }
    return '';
  }

  get rowForms(): FormGroup[] {
    return this.formRows as FormGroup[];
  }

  onTypeChange(index: number, type: ColumnType): void {
    this.data.mappings[index].columnType = type;
  }

  onMetadataFieldChange(index: number, value: string): void {
    this.data.mappings[index].metadataField = value;
  }

  saveMappings(): void {
    this.excelService.setMappings(this.data.mappings);
  }

  exportSheet(): void {
    /*const output: RowModel = this.rowForms.map(group => {
      return this.data.headers.map((_, i) => group.get(i.toString())?.value ?? '');
    });
    this.excelService.data.rows = output;
    this.excelService.exportToExcel('modified-sheet.xlsx');*/
  }

  onSelectCollection(event) {
    this.selectedCollectionUUID = event.collection.uuid;
    this.selectedCollectionName = event.collection.name;
  }

  toggleCollectionSelect(): void {
    this.selectedCollectionUUID = '';
    this.selectedCollectionName = '';
  }

  trackByRowIndex(index: number, _row: any): number {
    return index;
  }

  trackByColIndex(index: number, _cell: any): number {
    return index;
  }

  onHeaderInput(colIndex: number, e: Event) {
    const txt = (e.target as HTMLElement).innerText;
    this.data.headers[colIndex] = txt ?? '';
  }

  onCellInput(rowIndex: number, colIndex: number, e: Event) {
    const txt = (e.target as HTMLElement).innerText;
    if (!this.data.rows[rowIndex]) this.data.rows[rowIndex] = { id: '', cells: [] };
    this.data.rows[rowIndex][colIndex] = txt ?? '';
  }

  focusNextCell(r: number, c: number, e: KeyboardEvent) {
      e.preventDefault();
      const nextC = (c + 1) % this.data.headers.length;
      const nextR = r + (nextC === 0 ? 1 : 0);
      // fókusz megtalálása DOM alapján (egyszerű megközelítés)
      queueMicrotask(() => {
        const table = document.querySelector('.sheet') as HTMLTableElement;
        const cell = table?.rows[nextR + 1 /* +1 a thead miatt */]?.cells[nextC];
        (cell as HTMLElement)?.focus();
        this.placeCaretAtEnd(cell as HTMLElement);
      });
  }
  // egyszerű util a caret a cella végére helyezéséhez
  placeCaretAtEnd(el?: HTMLElement) {
    if (!el) return;
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
  
  trackByRowId(_i: number, row: RowModel) {
    return row.id;
  }
  
  trackByCellIndex(i: number, _cell: string) {
    return i;
  }
}

