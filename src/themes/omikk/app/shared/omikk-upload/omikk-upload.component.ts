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
export class OmikkUploadComponent {}
