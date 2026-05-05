import { Component, OnInit, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map, share } from 'rxjs/operators';
import { Observable, forkJoin } from 'rxjs';

import { DxPieChartModule } from 'devextreme-angular/ui/pie-chart';
import { DxChartModule } from 'devextreme-angular/ui/chart';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxFunnelModule } from 'devextreme-angular/ui/funnel';
import { DxBulletModule } from 'devextreme-angular/ui/bullet';
import { DxLoadPanelModule } from 'devextreme-angular/ui/load-panel';
import { DxScrollViewModule } from 'devextreme-angular/ui/scroll-view';

import { DataService } from 'src/app/services';
import { CardAnalyticsModule } from 'src/app/components/library/card-analytics/card-analytics.component';
import { ToolbarAnalyticsModule } from 'src/app/components/utils/toolbar-analytics/toolbar-analytics.component';
import { ConversionCardModule } from 'src/app/components/utils/conversion-card/conversion-card.component';
import { RevenueCardModule } from 'src/app/components/utils/revenue-card/revenue-card.component';
import { RevenueAnalysisCardModule } from 'src/app/components/utils/revenue-analysis-card/revenue-analysis-card.component';
import { RevenueSnapshotCardModule } from 'src/app/components/utils/revenue-snapshot-card/revenue-snapshot-card.component';
import { OpportunitiesTickerModule } from 'src/app/components/utils/opportunities-ticker/opportunities-ticker.component';
import { RevenueTotalTickerModule } from 'src/app/components/utils/revenue-total-ticker/revenue-total-ticker.component';
import { ConversionTickerModule } from 'src/app/components/utils/conversion-ticker/conversion-ticker.component';
import { LeadsTickerModule } from 'src/app/components/utils/leads-ticker/leads-ticker.component';
import { analyticsPanelItems, Dates } from 'src/app/types/resource';
import {
  Sales,
  SalesByState,
  SalesByStateAndCity,
  SalesOrOpportunitiesByCategory,
} from 'src/app/types/analytics';
import { ApplyPipeModule } from 'src/app/pipes/apply.pipe';

type DashboardData =
  | SalesOrOpportunitiesByCategory
  | Sales
  | SalesByState
  | SalesByStateAndCity
  | null;
type DataLoader = (startDate: string, endDate: string) => Observable<Object>;

@Component({
  templateUrl: './analytics-dashboard.component.html',
  styleUrls: ['./analytics-dashboard.component.scss'],
  providers: [DataService],
})
export class AnalyticsDashboardComponent implements OnInit {
  // Funnel (business flow)
  opportunities = [
    { stage: 'Transactions', value: 1200 },
    { stage: 'Sales', value: 950 },
    { stage: 'Net Sales', value: 900 },
    { stage: 'Completed', value: 850 },
  ];

  // Sales vs Returns
  salesComparison = [
    { type: 'Sales', value: 150000 },
    { type: 'Sales Return', value: 20000 },
    { type: 'Net Sales', value: 130000 },
  ];

  // Transactions trend
  transactionsData = [
    { period: 'Jan', value: 120 },
    { period: 'Feb', value: 150 },
    { period: 'Mar', value: 180 },
    { period: 'Apr', value: 140 },
    { period: 'May', value: 200 },
  ];
  analyticsPanelItems = analyticsPanelItems;

  // opportunities: SalesOrOpportunitiesByCategory = null;
  sales: Sales = null;
  salesByState: SalesByState = null;
  salesByCategory: SalesByStateAndCity = null;

  isLoading: boolean = true;
  customPalette = [
    '#BAE6FD', // Transactions
    '#7DD3FC', // Sales
    '#0EA5E9', // Net Sales
    '#0284C7', // Completed
  ];
  constructor(private service: DataService) {}

  selectionChange(dates: Dates) {
    this.loadData(dates.startDate, dates.endDate);
  }

  customizeSaleText(arg: { percentText: string }) {
    return arg.percentText;
  }

  loadData = (startDate: string, endDate: string) => {
    this.isLoading = true;
    const tasks: Observable<object>[] = [
      ['opportunities', this.service.getOpportunitiesByCategory],
      ['sales', this.service.getSales],
      ['salesByCategory', this.service.getSalesByCategory],
      [
        'salesByState',
        (startDate: string, endDate: string) =>
          this.service
            .getSalesByStateAndCity(startDate, endDate)
            .pipe(map((data) => this.service.getSalesByState(data))),
      ],
    ].map(([dataName, loader]: [string, DataLoader]) => {
      const loaderObservable = loader(startDate, endDate).pipe(share());

      loaderObservable.subscribe((result: DashboardData) => {
        this[dataName] = result;
      });

      return loaderObservable;
    });

    forkJoin(tasks).subscribe(() => {
      this.isLoading = false;
    });
  };

  ngOnInit(): void {
    const [startDate, endDate] = analyticsPanelItems[4].value.split('/');
    this.isLoading = false;
    // this.loadData(startDate, endDate);
  }
}

@NgModule({
  imports: [
    DxScrollViewModule,
    DxDataGridModule,
    DxBulletModule,
    DxFunnelModule,
    DxPieChartModule,
    DxChartModule,
    CardAnalyticsModule,
    ToolbarAnalyticsModule,
    DxLoadPanelModule,
    ApplyPipeModule,
    ConversionCardModule,
    RevenueAnalysisCardModule,
    RevenueCardModule,
    RevenueSnapshotCardModule,
    OpportunitiesTickerModule,
    RevenueTotalTickerModule,
    ConversionTickerModule,
    LeadsTickerModule,
    CommonModule,
  ],
  providers: [],
  exports: [],
  declarations: [AnalyticsDashboardComponent],
})
export class AnalyticsDashboardModule {}
