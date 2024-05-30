import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Item } from '../core/shared/item.model';

@Injectable({
  providedIn: 'root'
})
export class ViewpdfService {
  private item: Item;
  viewPdfOnItemLevel: string;
  viewPdfEnabled: boolean;

  constructor(item: Item) {
    this.item = item;
  }

  public statusOnCollLevel(): Observable<string> {
    let subject = new BehaviorSubject<string>('');
    this.item.owningCollection.subscribe(
      coll => {
          if (coll.payload !== undefined) {
        subject.next(
          coll.payload.metadata['dspace.viewpdf.enabled'] === undefined ?
              'na' : coll.payload.metadata['dspace.viewpdf.enabled'][0].value
        );
          }}
    );
    return subject.asObservable();
  }

  public statusOnItemLevel(): Observable<string> {
    let subject = new BehaviorSubject<string>('');
    subject.next(this.item.metadata['dspace.viewpdf.enabled'] === undefined ?
                 'na' : this.item.metadata['dspace.viewpdf.enabled'][0].value);
    return subject.asObservable();
  }
}
