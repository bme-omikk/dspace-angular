import { Component } from '@angular/core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import {
  SheetDataModel,
  ColumnMapping,
  RowModel,
  ColumnType,
  guessDescription,
  guessFilePath,
  guessPrimary,
  guessPermission,
  guessPermissionType,
  guessAssetstore,
} from '../models/column-mapping.model';

export class ExcelService {
  data: SheetDataModel = {
    headers: [],
    rows: [],
    mappings: []
  };

  getUUIDForCell(): string {
    try {
      return crypto.randomUUID();
    } catch {
      return 'cellid-' + Math.random().toString(36).slice(2);
    }
  }

  loadFile(file: File): Observable<SheetDataModel> {
    return new Observable<SheetDataModel>((observer) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });

        const headers = (json[0] ?? []) as string[];

        const rawRows = (json.length > 1 ? json.slice(1) : []) as string[][];

        const colCount = headers.length;
        const normalized = rawRows.map(r => {
          const copy = [...r];
          while (copy.length < colCount) copy.push('');
          if (copy.length > colCount) copy.length = colCount;
          return copy;
        });

        const rows : RowModel[] = normalized.map(cells => ({
          id: this.getUUIDForCell(),
          cells
        }));

        this.data.headers = headers;
        this.data.rows = rows;
        
        this.data.mappings = [];
  
        for (let i = 0; i < this.data.headers.length; i++) {
          let header = this.data.headers[i];
          let guessedType = this.guessColumnType(header);
          let metadata = (guessedType === 'metadata' ? header : '');

          this.data.mappings.push(
            {
              columnIndex: i,
              columnHeader: header,
              columnType: guessedType,
              metadataField: metadata
            }
          );
        }

        observer.next(this.data);
        observer.complete();
      };
      reader.onerror = (err) => {
        observer.error(err);
      }
      reader.readAsArrayBuffer(file);
    });
  }

  guessColumnType(header: string): ColumnType {
    if (header === '' || header === undefined || header === null) {
      return 'id';
    }
    if (guessDescription.some(n => header.toLowerCase().includes(n.toLowerCase()))) {
      return 'fileDescription';
    }
    else if (guessFilePath.some(n => header.toLowerCase().includes(n.toLowerCase()))) {
      return 'filePath';
    }
    else if (guessPrimary.some(n => header.toLowerCase().includes(n.toLowerCase()))) {
      return 'primary';
    }
    else if (guessPermissionType.some(n => header.toLowerCase().includes(n.toLowerCase()))) {
      return 'permissionType';
    }
    else if (guessPermission.some(n => header.toLowerCase().includes(n.toLowerCase()))) {
      return 'permission';
    }
    else if (guessAssetstore.some(n => header.toLowerCase().includes(n.toLowerCase()))) {
      return 'assetstore';
    }
    else {
      return 'metadata';
    }
  }

  getHeaders(): string[] {
    return this.data.headers;
  }

  getRows(): RowModel[] {
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
/*
  exportToExcel(filename: string): void {
    const worksheet = XLSX.utils.aoa_to_sheet([
      this.data.headers,
      ...this.data.rows[]
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, filename);
  }
*/
}
