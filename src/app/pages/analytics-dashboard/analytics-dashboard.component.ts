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
  DxPopupModule,
  DxSelectBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';
import notify from 'devextreme/ui/notify';

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
  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'All', value: 'all' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Custom', value: 'custom' },
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
  showCustomDatePopup = false;
  customStartDate: any = null;
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
  customEndDate: any = null;
  startDate_of_Financial_year: any;
  customDateRangeText: any;
  customDateLabel = '';
  listSyncData: any[] = []
  synch_pending_intervel: any
  notificationCount: any
  show_sync_reminder: boolean = false
  popupVisible: boolean = false
  buttonText: any
  constructor(private service: DataService) {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '')
    console.log(sessionData)
    this.synch_pending_intervel = sessionData.GeneralSettings.SYNCH_PENDING_INTERVAL
    this.show_sync_reminder = sessionData.GeneralSettings.SHOW_SYNCH_REMINDER
    const hours =
      Number(sessionData.GeneralSettings.SYNCH_PENDING_INTERVAL) / 60;

    this.buttonText = `List of stores not synchronized in last ${hours}  hours`

    this.Get_SyncData()
    if (this.show_sync_reminder) {
      this.popupVisible = true
    }
    else {
      this.popupVisible = false
    }

  }

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
    this.selectedDateRange = 'last30';

    this.onDateRangeChange({
      value: 'last30',
    });
  }
  //====================session Details===========================
  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '',
    );

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
    this.startDate_of_Financial_year = sessionData.FINANCIAL_YEARS[0].DATE_FROM;
    console.log(
      this.startDate_of_Financial_year,
      '================startDate_of_Financial_year=================',
    );

    const sessionYear = sessionData.FINANCIAL_YEARS;
  }
  //--------------------date range selection----------------------------

  onDateRangeChange(e: any) {
    const today = new Date();

    switch (e.value) {
      case 'today':
        this.fromDate = new Date(today);
        this.toDate = new Date(today);
        break;

      case 'last7':
        this.fromDate = new Date(today);
        this.fromDate.setDate(today.getDate() - 6); // including today
        this.toDate = new Date(today);
        break;

      case 'last15':
        this.fromDate = new Date(today);
        this.fromDate.setDate(today.getDate() - 14);
        this.toDate = new Date(today);
        break;

      case 'last30':
        this.fromDate = new Date(today);
        this.fromDate.setDate(today.getDate() - 29);
        this.toDate = new Date(today);
        break;

      case 'all':
        this.fromDate = new Date(this.startDate_of_Financial_year); // or your minimum date
        this.toDate = new Date(today); // or today
        break;

      case 'custom':
        this.showCustomDatePopup = true;
        // User will select fromDate and toDate manually.
        return;
    }

    this.getDashboardData();
  }
  dateChanged() {
    this.getDashboardData();
  }

  getDashboardData() {
    console.log('call this function');
    console.log('From Date:', this.fromDate);
    console.log('To Date:', this.toDate);
    this.loadingVisible = true;
    const timeoutId = setTimeout(() => {
      this.loadingVisible = false;
      alert('Request timeout. Please try again.');
    }, 50000); // 50   seconds

    this.sesstion_Details();

    const payload = {
      DATE_FROM: this.formatDate(this.fromDate),
      DATE_TO: this.formatDate(this.toDate),
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.selected_fin_id,
    };

    console.log(payload);
    this.service.Dashboard_Data_api(payload).subscribe(
      (res: any) => {
        clearTimeout(timeoutId); // stop timeout

        this.loadingVisible = false;
        this.gross_Sales_list = res.data.GrossSale;
        // this.TopMovingItems_list = res.data.
        const item_list = res.data.TopMovingItems;
        console.log(item_list, '==========item_list===========');
        const maxQty = item_list.reduce((max: number, item: any) => {
          return item.QTY_SOLD > max ? item.QTY_SOLD : max;
        }, 0);
        console.log(maxQty, '==========maxQty===========');

        this.TopMovingItems_list = res.data.TopMovingItems.map((item: any) => ({
          ITEM_CODE: item.ITEM_CODE,
          QTY_SOLD: item.QTY_SOLD,
          DESCRIPTION: item.DESCRIPTION,
        }));
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
      },
      (error) => {
        clearTimeout(timeoutId); // stop timeout
        this.loadingVisible = false;

        // alert('Error occurred while loading data.');
        notify('Error occurred while loading data.', 'error', 3000);
      },
    );
    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom' ? { ...option, label: 'Custom' } : option,
    );
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
    console.log(
      arg,
      '=================customizeChartTooltip arg=================',
    );
    return {
      text: `
      Item : ${arg.argumentText}
      Qty Sold : ${new Intl.NumberFormat('en-IN').format(arg.value)}
      Item Code : ${arg.seriesName}
    `,
    };
  }
  barChartcustomizeTooltip() { }
  MillioncustomizeLabel() { }
  onChartInitialized(e: any) { }
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
  formatNumber(value: number): string {
    if (value === null || value === undefined) {
      return '0';
    }

    return new Intl.NumberFormat('en-IN').format(value);
  }

  customizeCommonLabel = (arg: any) => {
    return this.formatNumber(arg.value);
  };

  customizeCommonTooltip = (arg: any) => {
    return {
      text: `${this.formatNumber(arg.value)}`,
    };
  };

  //====================date range selection for custom date===========================
  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }

    // reset custom label
    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom' ? { ...option, label: 'Custom' } : option,
    );

    this.customStartDate = null;
    this.customEndDate = null;

    this.getDashboardData();
  }

  applyDateFilter() {
    const today = new Date();

    switch (this.selectedDateRange) {
      case 'today':
        this.fromDate = new Date(today);
        this.toDate = new Date(today);
        break;

      case 'last7':
        this.fromDate = new Date(today);
        this.fromDate.setDate(today.getDate() - 6);
        this.toDate = new Date(today);
        break;

      case 'last15':
        this.fromDate = new Date(today);
        this.fromDate.setDate(today.getDate() - 14);
        this.toDate = new Date(today);
        break;

      case 'last30':
        this.fromDate = new Date(today);
        this.fromDate.setDate(today.getDate() - 29);
        this.toDate = new Date(today);
        break;

      case 'all':
        this.fromDate = null;
        this.toDate = new Date(today);
        break;

      case 'custom':
        if (!this.fromDate || !this.toDate) {
          return;
        }
        break;

      default:
        return;
    }

    this.getDashboardData();
  }

  applyCustomDateFilter() {
    if (!this.customStartDate || !this.customEndDate) return;

    if (this.customStartDate > this.customEndDate) {
      alert('From date cannot be greater than To date');
      return;
    }

    const fromLabel = this.formatAsDDMMYYYY(new Date(this.customStartDate));
    const toLabel = this.formatAsDDMMYYYY(new Date(this.customEndDate));

    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom' ? { ...option, label: 'custom' } : option,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;
  }

  private parseDateString(dateStr: string): Date {
    if (!dateStr || typeof dateStr !== 'string') {
      console.warn('Invalid date string:', dateStr);
      return new Date('Invalid'); // or new Date(0) if you want a fallback
    }

    const [day, month, year] = dateStr
      .split('-')
      .map((part) => parseInt(part, 10));
    return new Date(year, month - 1, day);
  }

  displayExpr = (item: any) => {
    if (!item) return '';

    if (item.value === 'custom' && this.customStartDate && this.customEndDate) {
      const from = this.formatAsDDMMYYYY(new Date(this.customStartDate));
      const to = this.formatAsDDMMYYYY(new Date(this.customEndDate));
      return `${from} to ${to}`;
    }

    return item.label;
  };

  openCustomDatePopup() {
    this.customStartDate = null;
    this.customEndDate = null;
    this.showCustomDatePopup = true;
  }

  private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  get customStartDateFormatted(): string {
    return this.customStartDate
      ? this.formatAsDDMMYYYY(new Date(this.customStartDate))
      : '';
  }

  get customEndDateFormatted(): string {
    return this.customEndDate
      ? this.formatAsDDMMYYYY(new Date(this.customEndDate))
      : '';
  }
  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;
    this.fromDate = new Date(this.customStartDate);
    this.toDate = new Date(this.customEndDate);
    // const fromLabel = this.formatAsDDMMYYYY(new Date(this.customStartDate));
    // const toLabel = this.formatAsDDMMYYYY(new Date(this.customEndDate));

    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom' ? { ...option, label: 'Custom' } : option,
    );
    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    this.getDashboardData(); // your existing function
  }
  attachItemClickHandler(e: any) {
    setTimeout(() => {
      const popup = e.component._popup;
      const innerList =
        popup && popup.$content().find('.dx-list').dxList('instance');
      if (innerList) {
        innerList.off('itemClick'); // unsubscribe first (to avoid duplicates)
        innerList.on('itemClick', (clickEvent: any) => {
          const clickedValue = clickEvent.itemData.value;
          if (clickedValue === 'custom') {
            this.openCustomDatePopup();
            e.component.close();
          }
        });
      }
    }, 0);
  }

  //===================Show synch reminder===============



  Get_SyncData() {
    this.service.get_sync_Data_api().subscribe({
      next: (res: any) => {

        const currentTime = new Date();

        const pendingData = res.filter((item: any) => {
          const lastSyncTime = new Date(item.LAST_SYNCH_TIME);

          const diffMinutes =
            (currentTime.getTime() - lastSyncTime.getTime()) / (1000 * 60);

          return diffMinutes > this.synch_pending_intervel;
        });

        this.listSyncData = pendingData.map((item: any, index: number) => ({
          ...item,
          SL_NO: index + 1,
          IsPending: true

        }));

        this.notificationCount = this.listSyncData.length;

        console.log('Pending Sync Data:', this.listSyncData);
        console.log('Notification Count:', this.notificationCount);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }
  onRowPrepared(e: any) {
    if (e.rowType !== 'data') return;

    if (e.data.IsPending) {
      e.rowElement.style.color = 'red';
      // e.rowElement.style.fontWeight = 'bold';
    }
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
    DxSelectBoxModule,
    DxValidationGroupModule,
    DxValidatorModule,
    DxDateBoxModule,
    DxLoadPanelModule,
    CustomDatePopupModule,
    DxPopupModule
  ],
  providers: [],
  exports: [],
  declarations: [AnalyticsDashboardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AnalyticsDashboardModule { }
