import {
  ChangeDetectorRef,
  Component,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DataService } from '../services';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  DxDataGridComponent,
  DxDataGridModule,
  DxButtonModule,
  DxTextBoxModule,
  DxCheckBoxModule,
  DxValidatorModule,
  DxValidationGroupModule,
  DxSelectBoxModule,
  DxLoadPanelModule,
  DxLoadIndicatorModule,
  DxNumberBoxModule,
  DxDateBoxModule,
  DxPopupModule,
  DxTagBoxModule,
  DxFormModule,
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss'],
})
export class SalesReportComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;

  // Filter properties
  isFilterVisible: boolean = true;
  isFilterOpened: boolean = false;

  years: number[] = [];
  selectedYear: number | null = null;
  monthDataSource: { name: string; value: number }[] = [];
  selectedmonth: any = '';

  today: Date = new Date();
  selected_from_date: any;
  selected_To_date: any;
  formatted_from_date: string = '';
  formatted_To_date: string = '';

  Store: any[] = [];
  selectedStoreid: any[] = [];
  storeHint: string = '';
  auto: string = 'auto';

  Saletype = [
    { ID: 0, DESCRIPTION: 'All' },
    { ID: 1, DESCRIPTION: 'Sales & Return' },
    { ID: 2, DESCRIPTION: 'Sales' },
    { ID: 3, DESCRIPTION: 'Return' },
    { ID: 4, DESCRIPTION: 'Void Invoice' },
    { ID: 5, DESCRIPTION: 'Cash In & Cash Out' },
    { ID: 6, DESCRIPTION: 'Receipts' },
  ];
  selectedSaletype: any = 0;

  distributorList: any[] = [];
  selectedCustomer: any = null;

  Department: any[] = [];
  selectedDepartment: any = null;

  Category: any[] = [];
  selectedCategory: any = null;

  Subcategory: any[] = [];
  selectedSubcategory: any = null;

  Brand: any[] = [];
  selectedBrand: any = null;

  itemProperty1: any[] = [];
  selectedItemProperty1: any = null;

  itemProperty2: any[] = [];
  selectedItemProperty2: any = null;

  Salesman: any[] = [];
  selectedSalesman: any = null;

  items: any[] = [];

  // User / Company session
  savedUserData: any;
  selected_Company_id: any;
  selected_fin_id: any;

  // Grid Data
  salesDataSource: DataSource | any;
  salesDataArray: any[] = [];
  readonly allowedPageSizes: any = [5, 10, 25, 50, 'all'];
  displayMode: any = 'full';
  isFilterRowVisible: boolean = false;


  isColumnChooserVisible = false;

  tempColumns: {
    dataField: string;
    caption: string;
    visible: boolean;
  }[] = [];

  private readonly chooserColumns = [
    { dataField: 'PURCH_DATE', caption: 'Date' },
    { dataField: 'SUPP_NAME', caption: 'Particulars' },
    { dataField: 'HSN_CODE', caption: 'HSN CODE' },
    { dataField: 'VoucherType', caption: 'Voucher Type' },
    { dataField: 'DOC_NO', caption: 'Invoice No' },
    { dataField: 'REF_NO', caption: 'Voucher reference No' },
    { dataField: 'Quantity', caption: 'Quantity' },
    { dataField: 'GrossTotal', caption: 'Gross Amount' },
    { dataField: 'Disc', caption: 'Discount Amount' },
    { dataField: 'GSTPurchase', caption: 'GST' },
    { dataField: 'CGSTPurchaseInput9', caption: 'CGST' },
    { dataField: 'SGSTPurchaseInput9', caption: 'SGST' },
    { dataField: 'RoundOff', caption: 'Round Off Amount' },
  ];
  UserId: any;

  openColumnChooser(): void {
    this.tempColumns = this.chooserColumns.map((column) => ({
      ...column,
      visible:
        this.dataGrid.instance.columnOption(
          column.dataField,
          'visible'
        ) !== false,
    }));

    this.isColumnChooserVisible = true;
  }

  applyColumnChooser(): void {
    this.tempColumns.forEach((column) => {
      this.dataGrid.instance.columnOption(
        column.dataField,
        'visible',
        column.visible
      );
    });

    this.isColumnChooserVisible = false;
  }

  cancelColumnChooser(): void {
    this.tempColumns = [];
    this.isColumnChooserVisible = false;
  }

  resetColumnSelection(): void {
    this.tempColumns = this.tempColumns.map((column) => ({
      ...column,
      visible: true,
    }));
  }


  showParameters = true;

  toggleParameters(): void {
    this.showParameters = !this.showParameters;
  }

  cancelReport(): void {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    this.selectedYear = currentYear;
    this.selectedmonth = currentMonth;
    this.selectedCustomer = null;

    this.selected_from_date = new Date(
      currentYear,
      currentMonth,
      1
    );
    this.selected_To_date = today;

    this.load_Sales_data();
  }
  // Loading state
  isLoading = false;

  // Summary visibility
  isSummaryVisible = true;

  summaryColumnsData: any = {
    totalItems: [],
    groupItems: [],
  };

  updateSummaryColumnsData(): void {
    if (!this.isSummaryVisible) {
      this.summaryColumnsData = {
        totalItems: [],
        groupItems: [],
      };
      return;
    }

    const moneyFormat = {
      type: 'fixedPoint',
      precision: 2,
      useGrouping: true,
    };

    this.summaryColumnsData = {
      groupItems: [
        {
          column: 'Quantity',
          summaryType: 'sum',
          displayFormat: '{0}',
          alignByColumn: true,
        },
        {
          column: 'GrossTotal',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: moneyFormat,
          alignByColumn: true,
        },
        {
          column: 'RoundOff',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: moneyFormat,
          alignByColumn: true,
        },
      ],

      totalItems: [
        {
          column: 'Quantity',
          summaryType: 'sum',
          displayFormat: 'Total Qty: {0}',
          alignment: 'right',
        },
        {
          column: 'GrossTotal',
          summaryType: 'sum',
          displayFormat: 'Total Gross: {0}',
          valueFormat: moneyFormat,
          alignment: 'right',
        },
        {
          column: 'RoundOff',
          summaryType: 'sum',
          displayFormat: 'Total Net: {0}',
          valueFormat: moneyFormat,
          alignment: 'right',
        },
      ],
    };
  }

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilterRow(),
  };

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.load_Sales_data();
    }
  }

  columnChooserButtonOptions = {
    icon: 'columnchooser',
    hint: 'Choose Columns',
    stylingMode: 'outlined',
    onClick: () => this.openColumnChooser(),
  };

  summaryButtonOptions = {
    icon: 'chevrondown',
    hint: 'Hide Summary',
    stylingMode: 'outlined',
    onClick: () => this.toggleSummary(),
  };

  toggleSummary(): void {
    this.isSummaryVisible = !this.isSummaryVisible;

    this.updateSummaryColumnsData();

    this.summaryButtonOptions = {
      ...this.summaryButtonOptions,
      icon: this.isSummaryVisible ? 'chevrondown' : 'chevronup',
      hint: this.isSummaryVisible ? 'Hide Summary' : 'Show Summary',
    };
  }

  constructor(
    private dataService: DataService,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {
    // ============ Year field dataSource ===============
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;

    // ============ Month field dataSource ===============
    this.monthDataSource = this.dataService.getMonths();
    const currentMonth = new Date().getMonth();
    this.selectedmonth = currentMonth;
  }

  ngOnInit() {
    const raw = sessionStorage.getItem('savedUserData');
    if (raw) {
      this.savedUserData = JSON.parse(raw);
      this.selected_Company_id =
        this.savedUserData?.SELECTED_COMPANY?.COMPANY_ID ?? 15;
      this.selected_fin_id =
        this.savedUserData?.FINANCIAL_YEARS?.[0]?.FIN_ID ?? 1;
      this.UserId = this.savedUserData.USER_ID
    }

    const today = new Date();
    this.selected_from_date = today;
    this.selected_To_date = today;

    this.loadDropdowns();
    this.load_Sales_data();
  }

  loadDropdowns() {
    this.getCustomerOrUnitLst();
  }

  getCustomerOrUnitLst() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'CUSTOMER',
      USER_ID: this.UserId
    };
    if (typeof this.dataService.Common_Dropdown === 'function') {
      this.dataService.Common_Dropdown(payload).subscribe((response: any) => {
        this.distributorList = response || [];
      });
    }
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;
    const grid = this.dataGrid?.instance;
    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  onYearChanged(e: any): void {
    this.selectedYear = e.value;
    this.selectedmonth = '';
    const currentYear = new Date().getFullYear();
    const today = new Date();
    if (this.selectedYear === currentYear) {
      this.selected_from_date = new Date(this.selectedYear, 0, 1);
      this.selected_To_date = today;
    } else if (this.selectedYear) {
      this.selected_from_date = new Date(this.selectedYear, 0, 1);
      this.selected_To_date = new Date(this.selectedYear, 11, 31);
    }
  }

  onMonthValueChanged(e: any): void {
    this.selectedmonth = e.value ?? '';
    const year = this.selectedYear || new Date().getFullYear();
    if (this.selectedmonth === '' || this.selectedmonth === null || this.selectedmonth === undefined) {
      const currentYear = new Date().getFullYear();
      if (year === currentYear) {
        this.selected_from_date = new Date(year, 0, 1);
        this.selected_To_date = new Date();
      } else {
        this.selected_from_date = new Date(year, 0, 1);
        this.selected_To_date = new Date(year, 11, 31);
      }
    } else {
      const monthNum = Number(this.selectedmonth);
      this.selected_from_date = new Date(year, monthNum, 1);
      this.selected_To_date = new Date(year, monthNum + 1, 0);
    }
  }

  onFromDateChange(event: any) {
    this.selected_from_date = event.value;
  }

  onToDateChange(event: any) {
    this.selected_To_date = event.value;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  formatDates(cellInfo: any) {
    if (!cellInfo) return '';
    const val = typeof cellInfo === 'object' && cellInfo.value ? cellInfo.value : cellInfo;
    const date = new Date(val);
    if (isNaN(date.getTime())) return String(val);
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  formatToISO(dateVal: any): string {
    if (!dateVal) return new Date().toISOString();
    const d = new Date(dateVal);
    return !isNaN(d.getTime()) ? d.toISOString() : new Date().toISOString();
  }

  load_Sales_data(): void {
    if (this.isLoading) {
      return;
    }

    if (
      this.selected_from_date &&
      this.selected_To_date &&
      new Date(this.selected_from_date) >
      new Date(this.selected_To_date)
    ) {
      notify({
        message: 'From Date cannot be later than To Date',
        type: 'warning',
        displayTime: 2000,
        position: { at: 'top center', my: 'top center' },
      });
      return;
    }

    const payload = {
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.selected_fin_id,
      DATE_FROM: this.formatToISO(this.selected_from_date),
      DATE_TO: this.formatToISO(this.selected_To_date),
      CUST_ID:
        this.selectedCustomer != null
          ? String(this.selectedCustomer)
          : '',
    };

    this.isLoading = true;

    this.dataService
      .SalesSummaryRpt(payload)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          let list: any[] = [];

          if (Array.isArray(res)) {
            list = res;
          } else if (Array.isArray(res?.Data)) {
            list = res.Data;
          } else if (Array.isArray(res?.data)) {
            list = res.data;
          }

          this.salesDataArray = list;
          this.salesDataSource = list;

          if (list.length === 0) {
            notify({
              message: 'No data found for selected criteria',
              type: 'warning',
              displayTime: 2000,
              position: { at: 'top center', my: 'top center' },
            });
          }
        },

        error: (err: any) => {
          console.error('Error fetching sales summary report:', err);

          this.salesDataArray = [];
          this.salesDataSource = [];

          notify({
            message: 'Failed to load sales report',
            type: 'error',
            displayTime: 2000,
            position: { at: 'top center', my: 'top center' },
          });
        },
      });
  }


  onExporting(event: any) {
    const fileName = 'Sales_Report';
    this.dataService.exportDataGridReport(event, fileName);
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxDataGridModule,
    DxButtonModule,
    DxTextBoxModule,
    DxCheckBoxModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxSelectBoxModule,
    DxLoadPanelModule,
    DxLoadIndicatorModule,
    DxNumberBoxModule,
    DxDateBoxModule,
    DxPopupModule,
    DxTagBoxModule,
    DxFormModule,
  ],
  providers: [],
  exports: [SalesReportComponent],
  declarations: [SalesReportComponent],
})
export class SalesReportModule { }