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

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Column Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.zone.run(() => this.refreshGrid());
    },
  };

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

  load_Sales_data() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.selected_fin_id,
      DATE_FROM: this.formatToISO(this.selected_from_date),
      DATE_TO: this.formatToISO(this.selected_To_date),
      CUST_ID:
        this.selectedCustomer != null ? String(this.selectedCustomer) : '',
    };

    this.dataService.SalesSummaryRpt(payload).subscribe({
      next: (res: any) => {
        let list: any[] = [];
        if (Array.isArray(res)) {
          list = res;
        } else if (res && Array.isArray(res.Data)) {
          list = res.Data;
        } else if (res && Array.isArray(res.data)) {
          list = res.data;
        }

        this.salesDataArray = list;
        this.salesDataSource = list;
        this.cdr.detectChanges();

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
        notify({
          message: 'Failed to load sales report',
          type: 'error',
          displayTime: 2000,
          position: { at: 'top center', my: 'top center' },
        });
        this.salesDataArray = [];
        this.salesDataSource = [];
        this.cdr.detectChanges();
      },
    });
  }

  refreshGrid() {
    this.load_Sales_data();
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
export class SalesReportModule {}