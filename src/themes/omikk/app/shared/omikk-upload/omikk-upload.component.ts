import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { SheetDataModel, ColumnMapping } from '../models/column-mapping.model';
import { ColumnMappingComponent } from '../column-mapping/column-mapping.component';

@Component({
  selector: 'omikk-upload',
  styleUrls: ['./omikk-upload.component.scss'],
  templateUrl: './omikk-upload.component.html',
  standalone: true,
  imports: [ColumnMappingComponent],
})
export class OmikkUploadComponent {
  private data: SheetDataModel = {
    headers: [],
    rows: [],
    mappings: []
  };

  loadFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

        if (json.length > 0) {
          this.data.headers = json[0] as string[];
          this.data.rows = json.slice(1);
        }

        resolve();
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }

  getHeaders(): string[] {
    return this.data.headers;
  }

  getRows(): string[][] {
    return this.data.rows;
  }

  getMappings(): ColumnMapping[] {
    return this.data.mappings;
  }

  setMappings(mappings: ColumnMapping[]): void {
    this.data.mappings = mappings;
  }

  updateCell(rowIndex: number, colIndex: number, value: string): void {
    if (this.data.rows[rowIndex]) {
      this.data.rows[rowIndex][colIndex] = value;
    }
  }

  exportToExcel(filename: string): void {
    const worksheet = XLSX.utils.aoa_to_sheet([
      this.data.headers,
      ...this.data.rows
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, filename);
  }
}
