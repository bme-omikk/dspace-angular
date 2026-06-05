import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface StatsRequest {
  fromdate: string;
  todate: string;
  isbot: boolean;
  resolution: number;
  resourceType?: string;
  searchType?: string;
  keyword?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomStatsService {
  private base = '/server/api/statistics';

  constructor(private http: HttpClient) {}

  getTotal(req: StatsRequest): Observable<any> {
    return this.http.post(`${this.base}/total`, req);
  }

  getByDate(req: StatsRequest): Observable<any> {
    return this.http.post(`${this.base}/bydate`, req);
  }

  getByResource(req: StatsRequest): Observable<any> {
    return this.http.post(`${this.base}/byresource`, req);
  }

  getByCity(req: StatsRequest): Observable<any> {
    return this.http.post(`${this.base}/bycity`, req);
  }

  getSearch(req: StatsRequest): Observable<any> {
    return this.http.post(`${this.base}/search`, req);
  }
}
