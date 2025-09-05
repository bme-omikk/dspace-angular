export const guessDescription = ['desc', 'leírás'];
export const guessFilePath = ['path', 'filename', 'real', 'út'];
export const guessPrimary = ['primary', 'első'];
export const guessPermission = ['permission', 'jogosultság', 'hozzáf'];
export const guessPermissionType = ['type', 'típus'];
export const guessAssetstore = ['assetstore'];

export type ColumnType =
  | 'fileDescription'
  | 'filePath'
  | 'primary'
  | 'permission'
  | 'permissionType'
  | 'assetstore'
  | 'metadata'
  | 'id';

export interface ColumnMapping {
  columnIndex: number; // 0-based index
  columnHeader: string;
  columnType: ColumnType;
  metadataField?: string; // only if columnType === 'metadata'
}

export interface RowModel {
  id: string;
  cells: string[];
}

// Sheet memory model
export interface SheetDataModel {
  headers: string[];
  rows: RowModel[]; // each row is array of cell values as strings
  mappings: ColumnMapping[];
}
