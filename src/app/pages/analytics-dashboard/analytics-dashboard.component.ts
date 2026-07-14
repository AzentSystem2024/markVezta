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
    { label: 'All', value: 'all' },
    { label: 'Current Year', value: 'currentYear' },
    { label: 'Current Month', value: 'currentMonth' },
    { label: 'Today', value: 'today' },
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
    '#F59E0B',
    '#EC4899',
    '#0EA5E9',
    '#8B5CF6',
    '#EF4444',
    '#14B8A6',
    '#EAB308',
    '#64748B',
    '#F97316',
    '#3B82F6',
    '#22C55E',
    '#D946EF',
    '#06B6D4',
  ];
  colors: string[] = [
    '#1E3A8A',
    '#2563EB',
    '#22D3EE',
    '#0D9488',
    '#7DD3FC',
    '#475569',

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
  listSyncData: any[] = [];
  synch_pending_intervel: any;
  notificationCount: any;
  show_sync_reminder: boolean = false;
  popupVisible: boolean = false;
  buttonText: any;
  storeinfo: any = [];
  profitAndLoss_List: any = {};
  seriesList_profitAndLoss: any[] = [];
  constructor(private service: DataService) {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '',
    );
    console.log(sessionData);
    this.synch_pending_intervel =
      sessionData.GeneralSettings.SYNCH_PENDING_INTERVAL;
    this.show_sync_reminder = sessionData.GeneralSettings.SHOW_SYNCH_REMINDER;
    const hours =
      Number(sessionData.GeneralSettings.SYNCH_PENDING_INTERVAL) / 60;

    this.buttonText = `List of stores not synchronized in last ${hours}  hours`;

    this.Get_SyncData();
    if (this.show_sync_reminder) {
      this.popupVisible = true;
    } else {
      this.popupVisible = false;
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
      case 'currentMonth':
        // First day of the current month
        this.fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        // Today's date
        this.toDate = new Date(today);
        this.toDate.setHours(0, 0, 0, 0);
        console.log(
          this.fromDate,
          this.toDate,
          '================currentMonth=================',
        );
        break;

      case 'currentYear':
        // January 1 of the current year
        this.fromDate = new Date(today.getFullYear(), 0, 1);
        this.fromDate.setHours(0, 0, 0, 0);

        // Today's date
        this.toDate = new Date(today);
        this.toDate.setHours(0, 0, 0, 0);
        console.log(
          this.fromDate,
          this.toDate,
          '================currentMonth=================',
        );

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

  // getDashboardData() {
  //   console.log('call this function');
  //   console.log('From Date:', this.fromDate);
  //   console.log('To Date:', this.toDate);
  //   this.loadingVisible = true;
  //   const timeoutId = setTimeout(() => {
  //     this.loadingVisible = false;
  //     alert('Request timeout. Please try again.');
  //   }, 50000); // 50   seconds

  //   this.sesstion_Details();

  //   const payload = {
  //     DATE_FROM: this.formatDate(this.fromDate),
  //     DATE_TO: this.formatDate(this.toDate),
  //     COMPANY_ID: this.selected_Company_id,
  //     FIN_ID: this.selected_fin_id,
  //   };

  //   console.log(payload);
  //   this.service.Dashboard_Data_api(payload).subscribe(
  //     (res: any) => {
  //       clearTimeout(timeoutId); // stop timeout

  //       this.loadingVisible = false;
  //       this.gross_Sales_list = res.data.GrossSale;
  //       // this.TopMovingItems_list = res.data.
  //       const item_list = res.data.TopMovingItems;
  //       console.log(item_list, '==========item_list===========');
  //       const maxQty = item_list.reduce((max: number, item: any) => {
  //         return item.QTY_SOLD > max ? item.QTY_SOLD : max;
  //       }, 0);
  //       console.log(maxQty, '==========maxQty===========');

  //       this.TopMovingItems_list = res.data.TopMovingItems.map((item: any) => ({
  //         ITEM_CODE: item.ITEM_CODE,
  //         QTY_SOLD: item.QTY_SOLD,
  //         DESCRIPTION: item.DESCRIPTION,
  //       }));
  //       this.TenderSummary_list = res.data.TenderSummary;

  //       this.chartData = this.TenderSummary_list.map((store: any) => {
  //         const obj: any = {
  //           STORE_NAME: store.STORE_NAME,
  //         };

  //         store.TenderTypes.forEach((t: any) => {
  //           obj[t.TENDER] = t.AMOUNT;
  //         });
  //         this.generateSeries();

  //         return obj;
  //       });

  //       console.log(
  //         this.gross_Sales_list,
  //         this.TopMovingItems_list,
  //         this.TenderSummary_list,
  //       );
  //     },
  //     (error) => {
  //       clearTimeout(timeoutId); // stop timeout
  //       this.loadingVisible = false;

  //       // alert('Error occurred while loading data.');
  //       notify('Error occurred while loading data.', 'error', 3000);
  //     },
  //   );
  //   this.dateRanges = this.dateRanges.map((option) =>
  //     option.value === 'custom' ? { ...option, label: 'Custom' } : option,
  //   );
  // }
  // generateSeries() {
  //   const tenders = new Set<string>();

  //   this.TenderSummary_list.forEach((store: any) => {
  //     store.TenderTypes.forEach((t: any) => {
  //       tenders.add(t.TENDER);
  //     });
  //   });

  //   // A large enough palette that visually distinct colors cycle predictably
  //   const palette = [
  //     '#10B981', '#4F46E5', '#F59E0B', '#EC4899', '#0EA5E9',
  //     '#8B5CF6', '#EF4444', '#14B8A6', '#EAB308', '#64748B',
  //     '#F97316', '#3B82F6', '#22C55E', '#D946EF', '#06B6D4',
  //   ];

  //   this.seriesList = Array.from(tenders).map((tender, index) => ({
  //     valueField: tender,
  //     name: tender,
  //     type: 'bar',
  //     color: palette[index % palette.length],
  //   }));
  // }

  getDashboardData() {
    this.loadingVisible = true;
    const timeoutId = setTimeout(() => {
      this.loadingVisible = false;
      alert('Request timeout. Please try again.');
    }, 50000);

    this.sesstion_Details();

    const payload = {
      DATE_FROM: this.formatDate(this.fromDate),
      DATE_TO: this.formatDate(this.toDate),
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.selected_fin_id,
    };

    this.service.Dashboard_Data_api(payload).subscribe(
      (res: any) => {
        clearTimeout(timeoutId);
        this.loadingVisible = false;

        this.gross_Sales_list = res.data.GrossSale;

        this.TopMovingItems_list = res.data.TopMovingItems.map((item: any) => ({
          ITEM_CODE: item.ITEM_CODE,
          QTY_SOLD: item.QTY_SOLD,
          DESCRIPTION: item.DESCRIPTION,
        }));
        console.table(this.TopMovingItems_list);

        this.TenderSummary_list = res.data.TenderSummary;

        // build series list ONCE, before building chart data
        this.generateTenderSeries();

        const allTenderKeys = this.seriesList.map((s: any) => s.valueField);

        // storeinfo-equivalent: flatten nested TenderTypes into flat columns
        this.storeinfo = this.TenderSummary_list.map((store: any) => {
          const obj: any = {
            store: store.STORE_NAME,
            Total: 0,
          };

          allTenderKeys.forEach((key: string) => (obj[key] = 0));

          store.TenderTypes.forEach((t: any) => {
            obj[t.TENDER] = t.AMOUNT;
            obj.Total += t.AMOUNT;
          });

          return obj;
        });

        const revenue = res.data.ProfitLoss.Revenue || [];
        const expense = res.data.ProfitLoss.Expense || [];

        // Create two rows: Revenue and Expense
        const revenueRow: any = {
          TYPE: 'Revenue',
        };

        const expenseRow: any = {
          TYPE: 'Expense',
        };

        // Fill Revenue
        revenue.forEach((item: any) => {
          revenueRow[item.STORE] = Number(item.REVENUE) || 0;
        });

        // Fill Expense
        expense.forEach((item: any) => {
          expenseRow[item.STORE] = Number(item.EXPENSE) || 0;
        });

        // Chart data
        this.chartData = [revenueRow, expenseRow];

        // Series (one per store)
        const stores = new Set<string>();

        revenue.forEach((x: any) => stores.add(x.STORE));
        expense.forEach((x: any) => stores.add(x.STORE));

        this.seriesList_profitAndLoss = Array.from(stores).map((store) => ({
          valueField: store,
          name: store,
          type: 'bar',
        }));

        console.log(this.chartData);
        console.log(this.seriesList_profitAndLoss);

        console.log(this.chartData);
        console.log(this.storeinfo, '');
      },
      (error) => {
        clearTimeout(timeoutId);
        this.loadingVisible = false;
        notify('Error occurred while loading data.', 'error', 3000);
      },
    );

    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom' ? { ...option, label: 'Custom' } : option,
    );
  }
  customizeAxisLabel = (arg: any) => {
    const text = arg.valueText;

    // Split into two lines near the middle
    const words = text.split(' ');

    if (words.length <= 1) {
      return text;
    }

    const mid = Math.ceil(words.length / 2);

    return words.slice(0, mid).join(' ') + '\n' + words.slice(mid).join(' ');
  };
  // dynamically discovers tender types from the API response
  generateTenderSeries() {
    const tenders = new Set<string>();

    this.TenderSummary_list.forEach((store: any) => {
      store.TenderTypes.forEach((t: any) => {
        tenders.add(t.TENDER);
      });
    });

    const palette = [
      '#10B981',
      '#4F46E5',
      '#F59E0B',
      '#EC4899',
      '#0EA5E9',
      '#8B5CF6',
      '#EF4444',
      '#14B8A6',
      '#EAB308',
      '#64748B',
    ];

    this.seriesList = Array.from(tenders).map((tender, index) => ({
      valueField: tender,
      name: tender,
      color: palette[index % palette.length],
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
  formatNumber(value: number): string {
    if (value === null || value === undefined) {
      return '0';
    }

    return new Intl.NumberFormat('en-IN').format(value);
  }

  customizeCommonLabel = (arg: any) => {
    return this.formatAmountTender(arg.value);
  };

  customizeCommonTooltip = (arg: any) => {
    return {
      text: `${this.formatNumber(arg.value)}`,
    };
  };
  customizeCommonLabelFortopmovin = (pointInfo: any): string => {
    return `${pointInfo.value}`;
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
      case 'currentMonth':
        // First day of the current month
        this.fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        // Today's date
        this.toDate = new Date(today);
        this.toDate.setHours(0, 0, 0, 0);
        console.log(
          this.fromDate,
          this.toDate,
          '================currentMonth=================',
        );
        break;

      case 'currentYear':
        // January 1 of the current year
        this.fromDate = new Date(today.getFullYear(), 0, 1);
        this.fromDate.setHours(0, 0, 0, 0);

        // Today's date
        this.toDate = new Date(today);
        this.toDate.setHours(0, 0, 0, 0);
        console.log(
          this.fromDate,
          this.toDate,
          '================currentMonth=================',
        );

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
        const pendingData = res.filter(
          (item: any) =>
            Number(item.TIME_DIFFERENCE) > this.synch_pending_intervel,
        );

        this.listSyncData = pendingData.map((item: any, index: number) => ({
          ...item,
          SL_NO: index + 1,
          IsPending: true,
        }));

        this.notificationCount = this.listSyncData.length;

        console.log('Pending Sync Data:', this.listSyncData);
        console.log('Notification Count:', this.notificationCount);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  onRowPrepared(e: any) {
    if (e.rowType !== 'data') return;

    if (e.data.IsPending) {
      e.rowElement.style.color = 'red';
      // e.rowElement.style.fontWeight = 'bold';
    }
  }

  // sync time format===================
  formatLastSyncTime = (cellInfo: any) => {
    if (!cellInfo.value) {
      return '';
    }

    const date = new Date(cellInfo.value);

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  // Tender amount formatting for chart labels and tooltips
  formatTenderAmount(value: number): string {
    const absValue = Math.abs(value);

    if (absValue >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(2) + ' B';
    } else if (absValue >= 1_000_000) {
      return (value / 1_000_000).toFixed(2) + ' M';
    } else if (absValue >= 1_000) {
      return (value / 1_000).toFixed(2) + ' K';
    } else {
      return value.toFixed(2);
    }
  }

  // Bar label customization — uses the new formatter
  customizeCommonLabelTender = (arg: any) => {
    return {
      text: this.formatTenderAmount(arg.value),
    };
  };

  // Y-axis label customization — uses the same formatter for consistency
  customizeTenderAxisLabel = (arg: any) => {
    return this.formatTenderAmount(arg.value);
  };

  // Tooltip customization — uses the same formatter
  customizeCommonTooltipTender = (arg: any) => {
    return {
      text: `${arg.seriesName}: ${this.formatTenderAmount(arg.value)}`,
    };
  };

  //===================gross claimed tender summary chart========================
  formatGrossSalesAmount(value: number): string {
    const absValue = Math.abs(value);

    if (absValue >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(2) + ' B';
    } else if (absValue >= 1_000_000) {
      return (value / 1_000_000).toFixed(2) + ' M';
    } else if (absValue >= 1_000) {
      return (value / 1_000).toFixed(2) + ' K';
    } else {
      return value.toFixed(2);
    }
  }
  // customizeText for dxo-label must return a STRING directly
  customizeGrossSalesLabel = (arg: any) => {
    return {
      text: `${arg.item.argument}: ${this.formatGrossSalesAmount(arg.value)}`,
    };
  };

  customizeGrossSalesTooltip = (arg: any) => {
    return {
      text: `${arg.item.argument}: ${this.formatGrossSalesAmount(arg.value)}`,
    };
  };

  formatAmountTender(value: number): string {
    const absValue = Math.abs(value);
    if (absValue >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(2) + 'B';
    } else if (absValue >= 1_000_000) {
      return (value / 1_000_000).toFixed(2) + 'M';
    } else if (absValue >= 1_000) {
      return (value / 1_000).toFixed(2) + 'K';
    }
    return value.toFixed(2);
  }

  // Tooltip - shows exact value only
  customizeTooltipTender = (pointInfo: any) => {
    return {
      text: `${pointInfo.seriesName}: ${this.formatAmountTender(pointInfo.value)}`,
    };
  };

  // Data labels on bars - shows exact value only
  customizeLabelTender = (pointInfo: any) => {
    return this.formatAmountTender(pointInfo.value);
  };

  //=================
  customizeTotalLabel = (arg: any) => {
    const value = arg.value;

    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(2) + ' B';
    } else if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(2) + ' M';
    } else if (value >= 1_000) {
      return (value / 1_000).toFixed(2) + ' K';
    }

    return value.toString();
  };

  customizeCommonLabelProfitandLoss = (arg: any) => {
    return new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(arg.value);
  };
  customizeProfitandLoss = (arg: any) => {
    return new Intl.NumberFormat('en-IN', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(arg.value);
  };
  customizeProfitAndLossTooltip = (arg: any) => {
    return {
      text: `${arg.seriesName}\n${arg.argumentText}\n${new Intl.NumberFormat(
        'en-IN',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      ).format(arg.value)}`,
    };
  };

  customizeLabelTenderTotal = (pointInfo: any) => {
    const data = pointInfo.point.data;

    let total = 0;

    this.seriesList.forEach((series) => {
      total += Number(data[series.valueField] || 0);
    });

    return total.toLocaleString();
  };
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
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [AnalyticsDashboardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AnalyticsDashboardModule {}
