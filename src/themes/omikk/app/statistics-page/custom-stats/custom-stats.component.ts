import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';
import { AuthService } from '../../../../../app/core/auth/auth.service';
import { AuthorizationDataService } from '../../../../../app/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../../../../app/core/data/feature-authorization/feature-id';
import { DSONameService } from '../../../../../app/core/breadcrumbs/dso-name.service';
import { DSpaceObjectDataService } from '../../../../../app/core/data/dspace-object-data.service';
import {
  getFinishedRemoteData,
  getRemoteDataPayload,
} from '../../../../../app/core/shared/operators';
import { CustomStatsService, StatsRequest } from './custom-stats.service';
import { firstValueFrom } from 'rxjs';
import { isEmpty } from '../../../../../app/shared/empty.util';

Chart.register(...registerables);

@Component({
  selector: 'ds-custom-stats',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, TranslateModule],
  templateUrl: './custom-stats.component.html',
  styleUrls: ['./custom-stats.component.scss'],
})
export class CustomStatsComponent implements OnInit {

  isAdmin = false;
  isLoggedIn = false;

  // Filters
  fromdate = this.formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  todate = this.formatDate(new Date());
  isbot = false;
  resolution = 3; // 1=year,2=month,3=day

  // Report 1
  total = 0;

  // Report 2 - line chart
  lineData: ChartData<'line'> = { labels: [], datasets: [{ data: [], label: this.translateService.instant('custom-stats.views') }] };
  lineOptions: ChartOptions<'line'> = { responsive: true };

  // Report 3 - bar chart by resource
  resourceType = 'item';
  resourceData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: this.translateService.instant('custom-stats.views') }] };
  resourceOptions: ChartOptions<'bar'> = { responsive: true, indexAxis: 'y' };

  // Report 4 - city table
  cityRows: { city: string; count: number }[] = [];

  // Report 5 - search bar chart
  searchType = 'city';
  keyword = '';
  searchData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: this.translateService.instant('custom-stats.views') }] };
  searchOptions: ChartOptions<'bar'> = { responsive: true, indexAxis: 'y' };

  constructor(
    private statsService: CustomStatsService,
    private authService: AuthService,
    private authorizationService: AuthorizationDataService,
    private cdr: ChangeDetectorRef,
    protected dsoService: DSpaceObjectDataService,
    protected nameService: DSONameService,
    private translateService: TranslateService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoggedIn = await firstValueFrom(this.authService.isAuthenticated());
    if (this.isLoggedIn) {
      this.isAdmin = await firstValueFrom(
        this.authorizationService.isAuthorized(FeatureID.AdministratorOf)
      );
    }
    this.loadAll();
  }

  private buildRequest(): StatsRequest {
    return {
      fromdate: this.fromdate,
      todate: this.todate,
      isbot: this.isbot,
      resolution: this.resolution,
    };
  }

  loadAll(): void {
    this.loadTotal();
    this.loadByDate();
    this.loadByResource();
    this.loadByCity();
  }

  loadTotal(): void {
    this.statsService.getTotal(this.buildRequest()).subscribe((res: any) => {
      this.total = res.total;
      this.cdr.markForCheck();
    });
  }

  loadByDate(): void {
    this.statsService.getByDate(this.buildRequest()).subscribe((res: any) => {
      this.lineData = {
        labels: res.data.map((d: any) => d.date),
        datasets: [{ data: res.data.map((d: any) => d.count), label: this.translateService.instant('custom-stats.views'), fill: false, tension: 0.3 }],
      };
      this.cdr.markForCheck();
    });
  }

  loadByResource(): void {
    this.statsService.getByResource({ ...this.buildRequest(), resourceType: this.resourceType }).subscribe(async (res: any) => {
      const labels = await Promise.all(res.data.map((d: any) => firstValueFrom(this.getLabel(d.uuid))));
      this.resourceData = {
        labels,
        datasets: [{ data: res.data.map((d: any) => d.count), label: this.translateService.instant('custom-stats.views') }],
      };
      this.cdr.markForCheck();
    });
  }

  loadByCity(): void {
    this.statsService.getByCity(this.buildRequest()).subscribe((res: any) => {
      this.cityRows = res.data;
      this.cdr.markForCheck();
    });
  }

  loadSearch(): void {
    this.statsService.getSearch({ ...this.buildRequest(), searchType: this.searchType, keyword: this.keyword })
      .subscribe((res: any) => {
        this.searchData = {
          labels: res.data.map((d: any) => d.value),
          datasets: [{ data: res.data.map((d: any) => d.count), label: this.translateService.instant('custom-stats.views') }],
        };
        this.cdr.markForCheck();
      });
  }
  
  /**
   * Get the title of the given resource based on the uuid.
   * @param uuid string of resource
   */
  getLabel(uuid: string): Observable<string> {
    return this.dsoService.findById(uuid).pipe(
      getFinishedRemoteData(),
      getRemoteDataPayload(),
      map((item) => !isEmpty(item) ?  this.nameService.getName(item) : this.translateService.instant('statistics.table.no-name')),
    );
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
