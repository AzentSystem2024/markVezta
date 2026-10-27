import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnInit,
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
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';


@Component({
  selector: 'app-leavelist',
  templateUrl: './leavelist.component.html',
  styleUrls: ['./leavelist.component.scss']
})
export class LeavelistComponent {

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  isColumnChooserVisible = false;

  // Controls whether the report parameters are expanded or collapsed.
  showParameters = true;

  tempColumns: {
    dataField: string;
    caption: string;
    visible: boolean;
  }[] = [];

  private readonly chooserColumns = [
    { dataField: 'LeaveCode', caption: 'Leave Code' },
    { dataField: 'ApplicationNo', caption: 'Application No' },
    { dataField: 'EmployeeCode', caption: 'Emp Code' },
    { dataField: 'DepartmentCode', caption: 'Dept Code' },
    { dataField: 'LeaveBalance', caption: 'Leave Balance' },
    { dataField: 'LeaveStartDate', caption: "Leave Start Date" },
    { dataField: 'LeaveEndDate', caption: 'Leave End Date' },
    { dataField: 'ApprovedDays', caption: 'Approved Days' },
    { dataField: 'Approved', caption: 'Approved Status' },
    { dataField: 'ResumedDate', caption: 'Resumed Date' },

  ];
  appType: any;

  openColumnChooser(): void {
    const grid = this.dataGrid?.instance;

    if (!grid) {
      return;
    }

    this.tempColumns = this.chooserColumns.map((column) => ({
      ...column,
      caption:
        column.dataField === 'STORE_NAME' && this.appType === 'VEZTA'
          ? 'Facility'
          : column.caption,
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

  LeavelistReport: any;
  company_list: any[] = [];
  selectedCompanyId: any;
  company_id: any;
  fin_id: any[] = [];
  savedUserData: any;
  selected_from_date: any;
  selected_To_date: any;
  selected_fin_id: any;
  formatted_from_date: any;
  formatted_To_date: any;
  selected_Company_id: any;
  loadingInvoice = false;
  popupReady = false;
  ledgerRowCount = 0;
  selectedYear: number | null = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  transtypeId: any;
  selectedPayroll: any;
  Store: any;
  selectedStoreid: any;
  vat_title: any;
  Department: any;
  select_department_id: number;
  paymentType: any;
  selected_payment_mode: any;
  EmployeeDropdown: any;
  selectedEmployeeId: number;
  isSummaryVisible = true;
  isFilterOpened = false;

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {

    //============Year field dataSource===============
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;
    //============Month field dataSource===============
    this.monthDataSource = this.dataService.getMonths();
    const currentMonth = new Date().getMonth(); // 0 = Jan, 6 = Jul, 11 = Dec
    this.selectedmonth = currentMonth;
  }

  ngOnInit() {
    console.log('ledgerstatementttttttttttttttttttttt');
    const today = new Date();
    const SystemDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    this.selected_from_date = SystemDate;
    this.selected_To_date = SystemDate;
    this.get_sessionstorage_data();
    this.get_fin_id();
    this.sesstion_Details();
    this.Department_dropdown();
    this.EmployeeListDropDown();
    const userDataString = localStorage.getItem('userData');

    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;

      this.selected_Company_id = selectedCompany?.COMPANY_ID;
    }

    setTimeout(() => {
      this.popupReady = false;
      this.cdr.detectChanges();
    });
  }

  toggleParameters(): void {
    this.showParameters = !this.showParameters;
  }

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;
    const grid = this.dataGrid?.instance;
    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.ngZone.run(() => this.refreshGrid());
    },
    text: '',
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
    }
    this.Leavelist_Report();
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
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleSummary(),
  };

  toggleSummary(): void {
    this.isSummaryVisible = !this.isSummaryVisible;

    // Update the DataGrid summary visibility
    const grid = this.dataGrid?.instance;

    if (grid) {
      grid.option(
        'summary.totalItems',
        this.isSummaryVisible ? this.summaryColumnsData.totalItems : []
      );

      grid.option(
        'summary.groupItems',
        this.isSummaryVisible ? this.summaryColumnsData.groupItems : []
      );
    }

    // Update the button icon and tooltip
    this.summaryButtonOptions = {
      ...this.summaryButtonOptions,
      icon: this.isSummaryVisible ? 'chevrondown' : 'chevronup',
      hint: this.isSummaryVisible ? 'Hide Summary' : 'Show Summary',
    };
  }


  //================ Year value change ===================
  onYearChanged(e: any): void {
    this.selectedYear = e.value;
    this.selectedmonth = '';
    const currentYear = new Date().getFullYear();
    const today = new Date();
    if (this.selectedYear === currentYear) {
      // Set from date to the start of the year and to date to today
      this.selected_from_date = new Date(this.selectedYear, 0, 1); // January 1 of the current year
      this.selected_To_date = today; // Today's date
    } else {
      this.selected_from_date = new Date(this.selectedYear, 0, 1); // January 1
      this.selected_To_date = new Date(this.selectedYear, 11, 31); // December 31
    }
  }

  //================Month value change ===================
  onMonthValueChanged(e: any) {
    this.selectedmonth = e.value ?? '';
    if (this.selectedmonth === '') {
      this.selected_from_date = new Date(this.selectedYear, 0, 1); // January 1 of the selected year
      this.selected_To_date = new Date(this.selectedYear, 11, 31); // December 31 of the selected year
    } else {
      this.selected_from_date = new Date(
        this.selectedYear,
        this.selectedmonth,
        1,
      );
      this.selected_To_date = new Date(
        this.selectedYear,
        this.selectedmonth + 1,
        0,
      );
    }
  }

  getSessionData(key: string) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  get_sessionstorage_data() {
    this.savedUserData = this.getSessionData('savedUserData');
    if (this.savedUserData) {
      this.company_list = this.savedUserData.Companies || [];
    }
  }

  get_fin_id() {
    this.fin_id = this.savedUserData?.FINANCIAL_YEARS || [];
    if (this.fin_id.length) {
      this.selected_fin_id = this.fin_id[0].FIN_ID;
    }
  }

  onFromDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_from_date = this.formatDate(rawDate);
  }

  onToDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_To_date = this.formatDate(rawDate);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }


  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
    this.vat_title = sessionData?.GeneralSettings.VAT_TITLE
  }

  formatDates(cellData: any): string {
    const date = new Date(cellData);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  Department_dropdown() {
    const payload = {
      NAME: 'DEPT',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Department = res;
    });
  }

  EmployeeListDropDown() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'Employee',
    };
    this.dataService.getEmployeeDropDown(payload).subscribe((response: any) => {
      this.EmployeeDropdown = response;
    });
  }

  Leavelist_Report() {
    this.showParameters = false
    const payload = {
      FromDate: this.selected_from_date,
      ToDate: this.selected_To_date,
      EmployeeId: this.selectedEmployeeId || 0,
      DepartmentId: this.select_department_id || 0,
    };

    this.LeavelistReport = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataService.LeaveListReport(payload).subscribe({
            next: (res: any) => {
              const list = res.Data || [];

              this.LeavelistReport = list;

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
              resolve(list);
            },
            error: () => {
              this.LeavelistReport = [];
              resolve([]);
            },
          });
        }),
    });
  }

  onViewClick(e: any) {
    console.log(e);
    const TRANS_TYPE_ID = e.row.data.TRANS_TYPE_ID;

    const trans_id = e.row.data.TRANS_ID;
    this.loadingInvoice = true;
    this.popupReady = false;
  }

  isViewVisible(e: any): boolean {
    console.log(e.row.data, 'event');
    this.transtypeId = e.row.data.TRANS_TYPE_ID;
    return this.transtypeId !== 0 && this.transtypeId !== 1;
  }

  // POPUP shown → allow child to render
  onPopupShown() {
    this.popupReady = true;
    this.cdr.detectChanges();
  }

  summaryColumnsData = {

    totalItems: [
      {
        column: 'LeaveBalance',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'LeaveBalance',
        alignment: 'right',
      },
    ],
    groupItems: [
      {
        column: 'LeaveBalance',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
    ],
    calculateCustomSummary: (options) => {
      if (options.name === 'summaryRow') {
        // Custom logic if needed
      }
    },
  };

  onExporting(event: any) {
    const fileName = 'LeaveList Report';
    this.dataService.exportDataGridReport(event, fileName);
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
  ],
  providers: [],
  declarations: [LeavelistComponent],
  exports: [LeavelistComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LeavelistModule { }