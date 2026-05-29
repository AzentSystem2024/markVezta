import {
  Component,
  OnInit,
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
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
import {
  DxDateBoxModule,
  DxSelectBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';

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
  DateDrp = [
    { text: 'Today', value: 'today' },
    { text: 'Yesterday', value: 'yesterday' },
    { text: 'This Month', value: 'thisMonth' },
  ];

  chartSize = { width: window.innerWidth * 0.95 };

  // Sales vs Returns
  salesComparison = [
    { type: 'Sales', value: 150000 },
    { type: 'Sales Return', value: 20000 },
    { type: 'Net Sales', value: 130000 },
  ];
  opportunities: any = [];
  // Transactions trend
  transactionsData = [
    { period: 'Jan', value: 120 },
    { period: 'Feb', value: 150 },
    { period: 'Mar', value: 180 },
    { period: 'Apr', value: 140 },
    { period: 'May', value: 200 },
  ];
  analyticsPanelItems = analyticsPanelItems;
  selectedDateRange: any;
  toDate: any;
  fromDate: any;

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
  colors: string[] = [
    '#1E3A8A',
    '#2563EB',
    '#3B82F6',
    '#0EA5E9',
    '#22D3EE',
    '#0D9488',
    '#14B8A6',
    '#475569',
    '#64748B',
    '#94A3B8',
  ];

  itemPalette: any[] = [];
  selected_Company_id: any;
  selected_fin_id: any;
  gross_Sales_list: any = [];
  TopMovingItems_list: any = [];
  TenderSummary_list: any = [];
  chartData: any;
  seriesList: any[] = [];
  loadingVisible: boolean = false;

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
    this.onDateRangeChange({ value: 'thisYear' });
  }
  //====================session Details===========================
  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '',
    );

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;

    const sessionYear = sessionData.FINANCIAL_YEARS;
    //  this.financialYeaDate=sessionYear[0].DATE_FROM
    // this.formatted_from_date=this.financialYeaDate
  }
  //--------------------date range selection----------------------------
  onDateRangeChange(e: any) {
    const today = new Date();

    if (e.value === 'today') {
      this.fromDate = new Date();
      this.toDate = new Date();
    } else if (e.value === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      this.fromDate = yesterday;
      this.toDate = yesterday;
    } else if (e.value === 'thisMonth') {
      this.fromDate = new Date(today.getFullYear(), today.getMonth(), 1);

      this.toDate = new Date();
    } else if (e.value === 'thisYear') {
      this.fromDate = new Date(today.getFullYear(), 0, 1);

      this.toDate = new Date();
    }

    this.getDashboardData();
  }
  dateChanged() {
    this.getDashboardData();
  }

  getDashboardData() {
    this.loadingVisible = true;

    this.sesstion_Details();

    const payload = {
      DATE_FROM: this.formatDate(this.fromDate),
      DATE_TO: this.formatDate(this.toDate),
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.selected_fin_id,
    };

    console.log(payload);
    this.service.Dashboard_Data_api(payload).subscribe((res: any) => {
      this.loadingVisible = false;
      this.gross_Sales_list = res.data.GrossSale;
      // this.TopMovingItems_list = res.data.
      const item_list = res.data.TopMovingItems;
      console.log(item_list, '==========item_list===========');
      const maxQty = item_list.reduce((max: number, item: any) => {
        return item.QTY_SOLD > max ? item.QTY_SOLD : max;
      }, 0);
      console.log(maxQty, '==========maxQty===========');

      this.TopMovingItems_list = res.data.TopMovingItems.map(
        (item: any, index: number) => ({
          DESCRIPTION: item.DESCRIPTION,
          QTY_SOLD: item.QTY_SOLD,
          SERIES: item.DESCRIPTION,
        }),
      );
      this.TenderSummary_list = res.data.TenderSummary;

      this.chartData = this.TenderSummary_list.map((store: any) => {
        const obj: any = {
          STORE_NAME: store.STORE_NAME,
        };

        store.TenderTypes.forEach((t: any) => {
          obj[t.TENDER] = t.AMOUNT;
        });
        this.generateSeries();

        return obj;
      });

      console.log(
        this.gross_Sales_list,
        this.TopMovingItems_list,
        this.TenderSummary_list,
      );
    });
  }
  generateSeries() {
    const tenders = new Set<string>();

    this.TenderSummary_list.forEach((store: any) => {
      store.TenderTypes.forEach((t: any) => {
        tenders.add(t.TENDER);
      });
    });

    const tenderColors: any = {
      Cash: '#10B981',
      Check: '#34D399',
      'Credit Card': '#4F46E5',
      'Debit Card': '#0EA5E9',
      Voucher: '#F59E0B',
      'On Account': '#64748B',
    };
    this.seriesList = Array.from(tenders).map((tender) => ({
      valueField: tender,
      name: tender,
      type: 'bar',
      color: tenderColors[tender] || '#999999',
    }));
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  customizeTooltip = (arg: any) => {
    return {
      text: `${arg.item.stage} : ${arg.value}`,
    };
  };
  customizeLabel = (arg: any) => {
    return `${arg.value}`;
  };

  customizeChartTooltip(arg: any) {
    return {
      text: `
      ${arg.argumentText}
      <br/>
      ${arg.seriesName} : ${arg.valueText}
    `,
    };
  }
  barChartcustomizeTooltip() {}
  MillioncustomizeLabel() {}
  onChartInitialized(e: any) {}
  customizeFunnelLabel = (arg: any) => {
    return `${arg.item.STORE_NAME}
${this.formatAmount(arg.value)}`;
  };

  formatAmount(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }

    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }

    return value.toString();
  }

  customizePoint = (pointInfo: any) => {
    console.log('customizePoint fired', pointInfo);

    const index = this.TopMovingItems_list.findIndex(
      (x: any) => x.DESCRIPTION === pointInfo.argument,
    );

    return {
      color: this.colors[index % this.colors.length],
    };
  };
  // customizePoint = (pointInfo: any) => {
  //   const index = this.TopMovingItems_list.findIndex(
  //     (x: any) => x.DESCRIPTION === pointInfo.argument
  //   );

  //   return {
  //     color: this.colors[index % this.colors.length]
  //   };
  // };
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
    DxSelectBoxModule,
    DxValidationGroupModule,
    DxValidatorModule,
    DxDateBoxModule,
    DxLoadPanelModule,
  ],
  providers: [],
  exports: [],
  declarations: [AnalyticsDashboardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AnalyticsDashboardModule {}
