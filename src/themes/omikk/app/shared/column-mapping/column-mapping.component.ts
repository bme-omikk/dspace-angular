import { filter, map, mergeMap, switchMap, tap, from, concat, of } from 'rxjs';
import { CollectionDropdownComponent } from '../collection-dropdown/collection-dropdown.component';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { NgComponentOutlet, CommonModule } from '@angular/common';
import { ExcelService } from '../service/excel.service';
import { ColumnMapping, ColumnType, SheetDataModel, RowModel } from '../models/column-mapping.model';
import { FormsModule, FormBuilder, FormArray, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';


type Staged = { file: File; relPath: string };

@Component({
  selector: 'app-column-mapping',
  templateUrl: './column-mapping.component.html',
  styleUrls: ['./column-mapping.component.scss'],
  standalone: true,
  imports: [CommonModule, NgComponentOutlet, CollectionDropdownComponent],
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
  
  selectedCollectionUUID: string = '';
  selectedCollectionName: string = '';

  @ViewChildren('cb') cbs!: QueryList<ElementRef<HTMLInputElement>>;

  allColumnChecked: boolean = false;

  private base: string = 'https://devrepozitorium.omikk.bme.hu/server/api';

  private staged: Staged[] = [];

  constructor(private excelService: ExcelService,
              private http: HttpClient) {}

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    this.allColumnChecked = false;
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

  fieldChecked(event): void {
    var checkboxes = this.cbs.toArray();
    for (const elem of checkboxes) {
      if (elem.nativeElement.checked === false) {
        this.allColumnChecked = false;
        return;
      }
    }
    this.allColumnChecked = true;
  }

  checkAll(event): void {
    if (event.target.checked) {
      var checkboxes = this.cbs.toArray();
      for (const elem of checkboxes) {
        elem.nativeElement.checked = true;
      }
      this.allColumnChecked = true;
    } else {
      var checkboxes = this.cbs.toArray();
      for (const elem of checkboxes) {
        elem.nativeElement.checked = false;
      }
      this.allColumnChecked = false;
    }
  }

  onFolderPicked(event: Event) {
    this.allColumnChecked = false;
    // TODO this can be a huge process taking several minutes to be done
    // do a progress bar anyhow here
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    this.staged = files.map(f => ({
      file: f,
      relPath: (f as any).webkitRelativePath || f.name
    }));
    console.log(this.staged);
  }

  private importItem(): void {
  }
  
  importItems(all: boolean): void {
    for (let i = 0; i < this.data.rows.length; i++) {
      let to_import;
      let row = this.data.rows[i];
      console.log('row ', i, row);
      console.log('uuid', this.selectedCollectionUUID);
      console.log('staged', this.staged);
      //this.processOneRow(row.cells, i, this.selectedCollectionUUID, this.staged);
      for (let j = 0; j < row.cells.length; j++) {
        let column = this.getColumnByIndex(j);
        console.log(column, ": ", row.cells[j]);
      }
    }
  }
  
  getWorkspaceItem(id: string) {
    return this.http.get<any>(
      `${this.base}/submission/workspaceitems/${id}`
    );
  }

  getSubmissionSection(nm: string) {
    return this.http.get<any>(
      `${this.base}/config/submissionsections`
    );
  }

  addTestItem() {
    /*const numbers$ = of(1,2,3,4,5);
    numbers$.pipe(
      tap(x => console.log('Before', x)),
      map(x => x*2),
      tap(x => console.lof('After', x)),
      filter(x => x > 5)
    ).subscribe(result => {
      console.log(result);
    });*/

    let wsiId = '';
    let patch = [
      {
        "op": "add",
        "path": "/sections/bmeomikkpage1/dc.title",
        "value": [ 
          {
            "value": "Title",
            "language": null,
            "authority": null,
            "confidence": -1
          }
        ]
      }
    ];
    this.getWorkspaceItem('54793').pipe(
      switchMap(wsi =>
        this.getSubmissionSection('test').pipe(
          map(sss => ({wsi, sss })),
          tap(() => console.log(wsi))
        )
      ),
      switchMap(({ wsi, sss }) => 
        this.patchWorkspaceItem(wsi.id, patch).pipe(
          tap(() => console.log('wsi',wsi)),
          tap(() => console.log('sss',sss)),
        )
      )
    ).subscribe(res => { console.log(res)});
    /*return this.createWorkspaceItem(collectionId).pipe(
      tap(wsi => wsiId = wsi.id),
      switchMap(() => this.patchWorkspaceItem(wsiId, patch)),
      switchMap(() => files.length ? concat(...files.map(f => this.uploadBitstream(wsiId, f.file))) : of(null)),
      switchMap(() => this.acceptLicense(wsiId)),
      switchMap(() => this.submitWorkspaceItem(wsiId)),
        map(() => ({ rowId: row.__rowIndex ?? 0 }))
      );*/
    //this.createWorkspaceItem(this.selectedCollectionUUID).subscribe(function (res){
    //  console.log(res.id);
    //});
    return;
    console.log('add test item checkpoint');
    let row = this.data.rows[0];
    console.log('row[0]', row);
    let meta: Record<string, string> = {};
    for (let j = 0; j < row.cells.length; j++) {
      let column:string = this.getColumnByIndex(j);
      meta[column] = row.cells[j];
    }
    console.log(meta);
    //this.processOneRow(row.cells, 0, this.selectedCollectionUUID, {"splitOn": ';', "meta": meta});

  }

  buildPatch(row: any, mapping: {
      splitOn?: string;
      meta: Record<string, string>; // e.g. {'dc.title':'Title','dc.contributor.author[]':'Authors'}
  }) {
    const ops: any[] = [];
    const sep = mapping.splitOn || ';';
    for (const [field, col] of Object.entries(mapping.meta)) {
         console.log("field, meta", field, mapping);
         const isArray = field.endsWith('[]');
         const target = isArray ? field.slice(0, -2) : field;
         const raw = row[col] ?? '';
         const values = isArray
           ? String(raw).split(sep).map(s => s.trim()).filter(Boolean)
           : [raw].filter(Boolean);
         if (!values.length) continue;
         ops.push({
           op: 'add',
           path: `/sections/traditionalpageone/${target}`,
           value: values.map(v => ({ value: v }))
         });
    }
    return ops;
  }

  createWorkspaceItem(collectionId: string) {
    return this.http.post<any>(
      `${this.base}/submission/workspaceitems`,
      null,
      {
        params: { owningCollection: collectionId },
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  patchWorkspaceItem(id: string, patch: any[]) {
    return this.http.patch<void>(
      `${this.base}/submission/workspaceitems/${id}`,
      patch,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  uploadBitstream(id: string, file: File) {
    const fd = new FormData();
    fd.append('file', file, file.name);
    return this.http.post<any>(
      `${this.base}/submission/workspaceitems/${id}/upload`,
      fd
    );
  }

  acceptLicense(id: string) {
    const accept = [{ op: 'add', path: '/sections/license/granted', value: 'true' }];
    return this.http.patch<void>(
      `${this.base}/submission/workspaceitems/${id}`,
      accept,
      { headers: { 'Content-Type': 'application/json-patch+json' } }
    );
  }

  submitWorkspaceItem(id: string) {
    // text/uri-list body must be the WSI URI
    return this.http.post<any>(
      `${this.base}/workflow/workflowitems`,
      `/api/submission/workspaceitems/${id}`,
      { headers: { 'Content-Type': 'text/uri-list' } }
    );
  }

  processAll(rows: any[], idx: number, collectionId: string, mapping: any) {
    const conc = 4; // tune 3–5
    from(rows).pipe(
      mergeMap(row => this.processOneRow(row, idx, collectionId, mapping), conc)
    ).subscribe({
      next: r => this.markRowOk(r.rowId),
      error: e => this.markRowFail(e.rowId, e),
      complete: () => this.done()
    });
  }

  processOneRow(row: any, idx: number, collectionId: string, mapping: any) {
    const patch = this.buildPatch(row, mapping);
    const files = mapping.filesColumn || 'files';

    console.log("pathc", patch);
    console.log("files", files);
    let wsiId = '';
    return this.createWorkspaceItem(collectionId).pipe(
      tap(wsi => wsiId = wsi.id),
      switchMap(() => this.patchWorkspaceItem(wsiId, patch)),
      switchMap(() => files.length ? concat(...files.map(f => this.uploadBitstream(wsiId, f.file))) : of(null)),
      switchMap(() => this.acceptLicense(wsiId)),
      switchMap(() => this.submitWorkspaceItem(wsiId)),
        map(() => ({ rowId: row.__rowIndex ?? 0 }))
    );
  }

  markRowOk(id: number): void {
    console.log('OK: ', id);
  }
  markRowFail(id: number, e: any): void {
    console.log('FAILED: ', id, e);
  }
  done(): void {
    console.log('done');
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
}

