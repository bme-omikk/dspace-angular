export type ColumnType =
  | 'fileDescription'
  | 'filePath'
  | 'primary'
  | 'permission'
  | 'permissionType'
  | 'assetstore'
  | 'metadata';

export interface ColumnMapping {
  columnIndex: number; // 0-based index
  columnHeader: string;
  columnType: ColumnType;
  metadataField?: string; // only if columnType === 'metadata'
}

// Sheet memory model
export interface SheetDataModel {
  headers: string[];
  rows: string[][]; // each row is array of cell values as strings
  mappings: ColumnMapping[];
}
