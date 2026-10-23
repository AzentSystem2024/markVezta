import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
  DxTextBoxModule,
  DxCheckBoxModule,
  DxRadioGroupModule,
  DxFileUploaderModule,
  DxDataGridModule,
  DxButtonModule,
  DxValidatorModule,
  DxProgressBarModule,
  DxPopupModule,
  DxDropDownBoxModule,
  DxToolbarModule,
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
  DxValidationGroupModule,
  DxAutocompleteModule,
  DxTagBoxModule,
  DxDataGridComponent,
} from 'devextreme-angular';

import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import { DataService } from 'src/app/services';
import { ViewInvoiceModule } from '../../INVOICE/view-invoice/view-invoice.component';
import { Router } from '@angular/router';
import { CustomerStatementDetailsModule } from '../../REPORT/customer-statement-details/customer-statement-details.component';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-customer-report',
  templateUrl: './customer-report.component.html',
  styleUrls: ['./customer-report.component.scss'],
})
export class CustomerReportComponent {

  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;

  isColumnChooserVisible = false;

  // Controls whether the report parameters are expanded or collapsed.
  showParameters = true;

  tempColumns: {
    dataField: string;
    caption: string;
    visible: boolean;
  }[] = [];

  private readonly chooserColumns = [
    { dataField: 'CUSTOMER_NAME', caption: 'Customer Name' },
    { dataField: 'INVOICE_DATE', caption: 'Date' },
    { dataField: 'INVOICE_NO', caption: 'Invoice No' },
    { dataField: 'NARRATION', caption: 'Narration' },
    { dataField: 'NET_AMOUNT', caption: 'Net Amount' },
    { dataField: 'RECEIVED_AMOUNT', caption: 'Received Amount' },
    { dataField: 'RETURN_AMOUNT', caption: 'Return Amount' },
    { dataField: 'ADJUSTED_AMOUNT', caption: 'Adjusted Amount' },
    { dataField: 'BALANCE', caption: 'Balance' },
  ];

  openColumnChooser(): void {
    const grid = this.dataGrid?.instance;

    if (!grid) {
      return;
    }

    this.tempColumns = this.chooserColumns.map((column) => ({
      ...column,
      visible: grid.columnOption(column.dataField, 'visible') !== false,
    }));

    this.isColumnChooserVisible = true;
  }

  applyColumnChooser(): void {
    const grid = this.dataGrid?.instance;

    if (!grid) {
      return;
    }

    this.tempColumns.forEach((column) => {
      grid.columnOption(column.dataField, 'visible', column.visible);
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

  CustomerListDataSource: any;
  isFilterRowVisible: boolean = false;
  isViewInvoice: boolean = false;
  BalanceSheetReport: any = [];
  auto: string = 'auto';
  isEmptyDatagrid: boolean = true;
  expandedOnce = false;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  company_list: any = [];
  savedUserData: any;
  fin_id: any;
  company_id: any;
  from_Date: any;
  To_Date: any;
  TrialBalance_datasource: any;
  selected_Company_id: any;
  finID: any;
  fromDate: any;
  ToDate: any;
  formatted_from_date: any;
  formatted_To_date: any;
  HeadId: any;
  selected_fin_id: any;
  customer_list: any[] = [];
  select_customer_id: any;
  selectedInvoice: any;
  // customer_details: {};
  defaultDate: Date = new Date();
  financialYeaDate: string;
  selectedYear: number | null = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  hasData = false;
  isSummaryVisible = true;
  customer_details: any = {
    CUSTOMER_ID: 0,
    SALE_ID: 0,
    DATE_FROM: '',
    DATE_TO: '',
    COMPANY_ID: 0,
  };
  constructor(
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.sesstion_Details();
    this.get_customer_list();
    //============Year field dataSource===============
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;
    //============Month field dataSource===============
    this.monthDataSource = this.dataservice.getMonths();
    const currentMonth = new Date().getMonth(); // 0 = Jan, 6 = Jul, 11 = Dec
    this.selectedmonth = currentMonth;
  }
  ngOnInit() {
    this.updateSummaryColumnsData();
    const today = new Date();
    const SystemDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    this.formatted_from_date = SystemDate;
    this.formatted_To_date = SystemDate;
    setTimeout(() => {
      this.GET_CUSTOMER_LIST();
    }, 0);
  }


  // Expand or collapse the parameter panel.
  toggleParameters(): void {
    this.showParameters = !this.showParameters;
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

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.GET_CUSTOMER_LIST();
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

    this.cdr.detectChanges();
  }


  //================ Year value change ===================
  onYearChanged(e: any): void {
    this.selectedYear = e.value;
    this.selectedmonth = '';
    const currentYear = new Date().getFullYear();
    const today = new Date();
    if (this.selectedYear === currentYear) {
      // Set from date to the start of the year and to date to today
      this.formatted_from_date = new Date(this.selectedYear, 0, 1); // January 1 of the current year
      this.formatted_To_date = today; // Today's date
    } else {
      this.formatted_from_date = new Date(this.selectedYear, 0, 1); // January 1
      this.formatted_To_date = new Date(this.selectedYear, 11, 31); // December 31
    }
  }

  //================Month value change ===================
  onMonthValueChanged(e: any) {
    this.selectedmonth = e.value ?? '';
    if (this.selectedmonth === '') {
      this.formatted_from_date = new Date(this.selectedYear, 0, 1); // January 1 of the selected year
      this.formatted_To_date = new Date(this.selectedYear, 11, 31); // December 31 of the selected year
    } else {
      this.formatted_from_date = new Date(
        this.selectedYear,
        this.selectedmonth,
        1,
      );
      this.formatted_To_date = new Date(
        this.selectedYear,
        this.selectedmonth + 1,
        0,
      );
    }
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
    const sessionYear = sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;

    this.formatted_from_date = this.financialYeaDate;
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };
  get_customer_list() {
    const payload = {
      NAME: 'CUSTOMER',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.Customer_Dropdown(payload).subscribe((res: any) => {
      this.customer_list = res;
    });
  }

  onExporting(event: any) {
    const fileName = 'BalanceSheetReport';
    this.dataservice.exportDataGridReport(event, fileName);
  }

  get_sessionstorage_data() {
    this.savedUserData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.company_list = this.savedUserData.Companies;
  }

  get_fin_id() {
    this.fin_id = this.savedUserData.FINANCIAL_YEARS;
    if (this.fin_id.length) {
      this.finID = this.fin_id[0].FIN_ID;
    }
  }

  onCompanyChange(event: any) {
    this.company_id = event.value;
  }

  onFromDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_from_date = this.formatDate(rawDate);
    // example: "2025-04-01"
  }

  onToDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_To_date = this.formatDate(rawDate);
    // example: "2025-04-01"
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  // GET_CUSTOMER_LIST() {
  //   const payload = {
  //     COMPANY_ID: this.selected_Company_id,
  //     CUSTOMER_ID: this.select_customer_id || 0,
  //     DATE_FROM: this.formatted_from_date,
  //     DATE_TO: this.formatted_To_date,
  //   };

  //   this.dataservice.customer_report_Api(payload).subscribe((res: any) => {
  //     this.CustomerListDataSource = res.Data;
  //   });
  // }


  GET_CUSTOMER_LIST() {
    this.showParameters = false;
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      CUSTOMER_ID: this.select_customer_id || 0,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
    };

    this.CustomerListDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.customer_report_Api(payload).subscribe({
            next: (res: any) => {
              const list = res.Data || [];
              this.hasData = list.length > 0;
              resolve(list);

              if (list.length === 0) {
                notify({
                  message: 'No data available',
                  type: 'warning',
                  displayTime: 2000,
                  position: {
                    at: 'top center',
                    my: 'top center',
                  },
                });
              }
            },
            error: () => {
              resolve([]);
            },
          });
        }),
    });
  }
  onViewClick(e: any) {
    const TRANS_TYPE_ID = e.row.data.TRANS_TYPE_ID;
    const trans_id = e.row.data.TRANS_ID;

    const customer_id = e.row.data.CUSTOMER_ID;
    const invoice_id = e.row.data.INVOICE_ID;

    if (customer_id) {
      this.customer_details = {
        CUSTOMER_ID: customer_id,
        SALE_ID: invoice_id,
        DATE_FROM: this.formatted_from_date,
        DATE_TO: this.formatted_To_date,
        COMPANY_ID: this.selected_Company_id,
      };
      sessionStorage.setItem(
        'customerDetails',
        JSON.stringify(this.customer_details),
      );

      // ✅ Retrieve and parse back into object
      const storedData = sessionStorage.getItem('customerDetails');
      if (storedData) {
        this.customer_details = JSON.parse(storedData);
      }

      this.router.navigate(['/customer-statement-details']);
      // this.router.navigate(['/customer-statement-details'], { state: { data: this.customer_details } });
    }

    // this.dataservice
    //   .selectInvoice(trans_id)
    //   .subscribe((response: any) => {
    //     this.selectedInvoice = response.Data;

    //     this.isViewInvoice = true;
    //     this.cdr.detectChanges();

    //   });
  }

  handleClose() {
    this.isViewInvoice = false;
  }


  summaryColumnsData: any = {
    totalItems: [],
    groupItems: [],
  };

  updateSummaryColumnsData(): void {
    const moneyFormat = {
      type: 'fixedPoint',
      precision: 2,
      useGrouping: true,
    };

    const summaryFields = [
      'NET_AMOUNT',
      'RECEIVED_AMOUNT',
      'RETURN_AMOUNT',
      'ADJUSTED_AMOUNT',
      'BALANCE',
    ];

    this.summaryColumnsData = {
      totalItems: this.isSummaryVisible
        ? summaryFields.map((field) => ({
          column: field,
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: moneyFormat,
          showInColumn: field,
          alignment: 'right',
        }))
        : [],

      groupItems: this.isSummaryVisible
        ? summaryFields.map((field) => ({
          column: field,
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: moneyFormat,
          alignByColumn: true,
        }))
        : [],
    };

    this.cdr.detectChanges();
  }
}

@NgModule({
  imports: [
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,

    DxCheckBoxModule,
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,

    DxNumberBoxModule,
    DxValidationGroupModule,
    DxAutocompleteModule,
    DxTagBoxModule,
    ViewInvoiceModule,
    CustomerStatementDetailsModule,
  ],
  providers: [],
  declarations: [CustomerReportComponent],
  exports: [CustomerReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CustomerReportModule { }
