import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { SheetDataModel, ColumnMapping } from '../models/column-mapping.model';

export class ExcelService {
  data: SheetDataModel = {
    headers: [],
    rows: [],
    mappings: []
  };

  loadFile(file: File): Observable<SheetDataModel> {
    return new Observable<SheetDataModel>((observer) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

        const headers = (json[0] ?? []) as string[];
        const rows = (json.length > 1 ? json.slice(1) : []) as string[][];
        this.data.headers = headers;
        this.data.rows = rows;
        this.data.mappings = [];

        observer.next(this.data);
        observer.complete();
      };
      reader.onerror = (err) => {
        observer.error(err);
      }
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
