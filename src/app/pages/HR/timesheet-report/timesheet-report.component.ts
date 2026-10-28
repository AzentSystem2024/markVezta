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
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-timesheet-report',
  templateUrl: './timesheet-report.component.html',
  styleUrls: ['./timesheet-report.component.scss']
})
export class TimesheetReportComponent {
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
    { dataField: 'TS_MONTH', caption: 'Month' },
    { dataField: 'EMP_CODE', caption: 'Emp Code' },
    { dataField: 'EMP_NAME', caption: 'Name' },
    { dataField: 'DEPT_NAME', caption: 'Department' },
    { dataField: 'TOTAL_DAYS', caption: 'Total Days' },
    { dataField: 'NORMAL_OT', caption: "Normal OT Hours" },
    { dataField: 'HOLIDAY_OT', caption: 'Holiday OT Hours' },
    { dataField: 'ADDITIONS', caption: 'Additions' },
    { dataField: 'DEDUCT_DAYS', caption: 'Deductions' },
    { dataField: 'ABSENTEES', caption: 'Absent days' },
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

  TimesheetReport: any[] = [];
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
  TrialBalance_datasource: any;
  selected_Company_id: any;
  finID: any;
  HeadId: any;
  selected_fin_id: any;
  customer_list: any[] = [];
  select_customer_id: any;
  selectedInvoice: any;
  defaultDate: Date = new Date();
  financialYeaDate: string;
  customer_details: any = {
    CUSTOMER_ID: 0,
    SALE_ID: 0,
    DATE_FROM: '',
    DATE_TO: '',
    COMPANY_ID: 0,
  };
  Department: any;
  select_department_id: number;
  selectedMonth: Date = new Date();
  calendarVisible = false;
  yearSelectorVisible = false;
  selectedYear: number = this.selectedMonth.getFullYear();

  years: number[] = [];
  isFilterOpened = false;
  isSummaryVisible = true;


  summaryColumnsData = {
    totalItems: [
      {
        column: 'BASIC',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'BASIC',
        alignment: 'right',
      },
      {
        column: 'ALLOWANCE',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'ALLOWANCE',
        alignment: 'right',
      },
      {
        column: 'NORMAL_OT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'NORMAL_OT',
        alignment: 'right',
      },
      {
        column: 'HOLIDAY_OT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'HOLIDAY_OT',
        alignment: 'right',
      },
      {
        column: 'ADDITIONS',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'ADDITIONS',
        alignment: 'right',
      },
      {
        column: 'DEDUCT_DAYS',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'DEDUCT_DAYS',
        alignment: 'right',
      },
      {
        column: 'ABSENTEES',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'ABSENTEES',
        alignment: 'right',
      },
    ],
    groupItems: [
      {
        column: 'BASIC',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'ALLOWANCE',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'NORMAL_OT',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'HOLIDAY_OT',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'ADDITIONS',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'DEDUCT_DAYS',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'ABSENTEES',
        summaryType: 'sum',
        displayFormat: ' {0}',
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

  constructor(
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private zone: NgZone,
  ) {
    this.sesstion_Details();

  }

  ngOnInit() {
    setTimeout(() => {
      this.Timesheet_Report();
    }, 0);

    this.sesstion_Details();
    this.Department_dropdown();
    this.generateYears();
  }

  applyButtonOptions = {
    width: 100,
    hint: 'Apply Filters',
    text: 'Apply',
    type: 'default',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.Timesheet_Report(),
  };

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
      this.zone.run(() => this.refreshGrid());
    },
    text: '',
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
    }
    this.Timesheet_Report();
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


  generateYears() {
    const currentYear = new Date().getFullYear();

    for (let year = currentYear - 20; year <= currentYear + 20; year++) {
      this.years.push(year);
    }
  }

  toggleCalendar() {
    this.calendarVisible = !this.calendarVisible;

    // Close year selector whenever calendar is closed
    if (!this.calendarVisible) {
      this.yearSelectorVisible = false;
    }
  }

  toggleYearSelector() {
    this.yearSelectorVisible = !this.yearSelectorVisible;
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
    const sessionYear = sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;
    this.appType = sessionData?.Configuration[0]?.APP_TYPE || '';
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  previousYear() {
    this.selectedYear--;
    this.selectedMonth = new Date(
      this.selectedYear,
      this.selectedMonth.getMonth(),
      1
    );
  }

  nextYear() {
    this.selectedYear++;
    this.selectedMonth = new Date(
      this.selectedYear,
      this.selectedMonth.getMonth(),
      1
    );
  }

  selectYear(year: number, event: Event) {
    event.stopPropagation();

    this.selectedYear = year;
    this.selectedMonth = new Date(
      year,
      this.selectedMonth.getMonth(),
      1
    );

    this.yearSelectorVisible = false;

    // Reload report if required
    // this.Timesheet_Report();
  }

  goToPreviousMonth() {
    this.selectedMonth = new Date(
      this.selectedMonth.getFullYear(),
      this.selectedMonth.getMonth() - 1,
      1
    );

    this.selectedYear = this.selectedMonth.getFullYear();

    this.Timesheet_Report();
  }

  goToNextMonth() {
    this.selectedMonth = new Date(
      this.selectedMonth.getFullYear(),
      this.selectedMonth.getMonth() + 1,
      1
    );

    this.selectedYear = this.selectedMonth.getFullYear();

    this.Timesheet_Report();
  }

  onExporting(event: any) {
    const fileName = 'TimeSheetReport';
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



  formatUsefulLife(cellInfo: any) {
    return cellInfo.value ? `${cellInfo.value} Years` : '';
  }

  Department_dropdown() {
    const payload = {
      NAME: 'DEPT',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.Common_Dropdown(payload).subscribe((res: any) => {
      this.Department = res;
    });
  }

  Timesheet_Report() {
    const firstDayOfMonth = new Date(
      this.selectedMonth.getFullYear(),
      this.selectedMonth.getMonth(),
      1
    );

    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DEPARTMENT_ID: String(this.select_department_id || ''),
      TS_MONTH: this.formatDate(firstDayOfMonth),
    };

    this.dataservice.TimesheetReport(payload).subscribe({
      next: (res: any) => {
        const list = res || []; // or res.Data || [] if your API returns Data

        this.TimesheetReport = list;

        if (list.length === 0) {
          notify({
            message: 'No data found',
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
        this.TimesheetReport = [];

        notify({
          message: 'No data found',
          type: 'warning',
          displayTime: 2000,
          position: {
            at: 'top center',
            my: 'top center',
          },
        });
      },
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  handleClose() {
    this.isViewInvoice = false;
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
  declarations: [TimesheetReportComponent],
  exports: [TimesheetReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TimesheetReportModule { }