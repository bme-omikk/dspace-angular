import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExcelService } from '../service/excel.service';
import { ColumnMapping, ColumnType } from '../models/column-mapping.model';
import { FormsModule, FormBuilder, FormArray, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-column-mapping',
  templateUrl: './column-mapping.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [ExcelService],
})
export class ColumnMappingComponent implements OnInit {
  headers: string[] = [];
  mappings: ColumnMapping[] = [];
  rows: string[][] = [];
  columnTypes: ColumnType[] = [
    'fileDescription', 'filePath', 'primary', 'permission', 'permissionType', 'assetstore', 'metadata'
  ];
  formRows:FormGroup[] = []; 

  constructor(private excelService: ExcelService,
              private fb: FormBuilder) {}

  ngOnInit(): void {}

  formGroup: FormGroup = this.fb.group({
    formRows: this.formRows
  });

  onFileSelected(event: Event): void {
    this.excelService.loadFile(
      (event.target as HTMLInputElement).files[0]).subscribe({
        next: ({ headers, rows, mappings }) => { console.log(headers, rows, mappings); },
        error: (err) => console.log(err),
    });
  }

  get rowForms(): FormGroup[] {
    return this.formRows as FormGroup[];
  }

  onTypeChange(index: number, type: ColumnType): void {
    this.mappings[index].columnType = type;
  }

  onMetadataFieldChange(index: number, value: string): void {
    this.mappings[index].metadataField = value;
  }

  saveMappings(): void {
    this.excelService.setMappings(this.mappings);
  }

  exportSheet(): void {
    const output: string[][] = this.rowForms.map(group => {
      return this.headers.map((_, i) => group.get(i.toString())?.value ?? '');
    });
    this.excelService.data.rows = output;
    this.excelService.exportToExcel('modified-sheet.xlsx');
  }

  trackByRowIndex(index: number, _row: any): number {
    return index;
  }

  trackByColIndex(index: number, _cell: any): number {
    return index;
  }
}

