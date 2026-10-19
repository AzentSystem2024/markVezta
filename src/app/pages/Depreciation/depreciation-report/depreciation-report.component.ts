import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
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
import { Subscription } from 'rxjs';
import notify from 'devextreme/ui/notify';  // ⬅️ add this import
@Component({
  selector: 'app-depreciation-report',
  templateUrl: './depreciation-report.component.html',
  styleUrls: ['./depreciation-report.component.scss'],
})
export class DepreciationReportComponent implements OnInit {
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
    { dataField: 'CODE', caption: 'Asset Code' },
    { dataField: 'DESCRIPTION', caption: 'Description' },
    { dataField: 'ASSET_TYPE', caption: 'Asset Type' },
    { dataField: 'LOCATION', caption: 'Location' },
    { dataField: 'PURCH_DATE', caption: 'Purch Date' },
    { dataField: 'ASSET_VALUE', caption: 'Purchase Value' },
    { dataField: 'USEFUL_LIFE', caption: 'Useful Life' },
    { dataField: 'OPENING_DEPR', caption: 'Opening' },
    { dataField: 'DURING_DEPR', caption: 'During' },
    { dataField: 'CLOSING_DEPR', caption: 'Closing' },
    { dataField: 'CURRENT_VALUE', caption: 'Net Asset Value' },
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

  DepreciationReport: any[] = [];
  isFilterRowVisible = false;
  isViewInvoice = false;
  BalanceSheetReport: any = [];
  auto = 'auto';
  isEmptyDatagrid = true;
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
  defaultDate: Date = new Date();
  financialYeaDate: string;
  selectedYear: number | null = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  isSummaryVisible = true;
  customer_details: any = {
    CUSTOMER_ID: 0,
    SALE_ID: 0,
    DATE_FROM: '',
    DATE_TO: '',
    COMPANY_ID: 0,
  };
  Department: any;
  select_department_id: number;
  private reportSubscription: Subscription | null = null;
  isLoading = false;   // ⬅️ controls Cancel button visibility

  get summaryColumnsData(): any {
    return {
      totalItems: this.isSummaryVisible ? [
        {
          column: 'ASSET_VALUE',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'ASSET_VALUE',
          alignment: 'right',
        },
        {
          column: 'OPENING_DEPR',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'OPENING_DEPR',
          alignment: 'right',
        },
        {
          column: 'DURING_DEPR',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'DURING_DEPR',
          alignment: 'right',
        },
        {
          column: 'CLOSING_DEPR',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'CLOSING_DEPR',
          alignment: 'right',
        },
        {
          column: 'CURRENT_VALUE',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'CURRENT_VALUE',
          alignment: 'right',
        },
      ]
        : [],
      groupItems: this.isSummaryVisible ? [
        {
          column: 'ASSET_VALUE',
          summaryType: 'sum',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          alignByColumn: true,
        },
        {
          column: 'OPENING_DEPR',
          summaryType: 'sum',
          displayFormat: ' {0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          alignByColumn: true,
        },
        {
          column: 'DURING_DEPR',
          summaryType: 'sum',
          displayFormat: ' {0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          alignByColumn: true,
        },
        {
          column: 'CLOSING_DEPR',
          summaryType: 'sum',
          displayFormat: ' {0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          alignByColumn: true,
        },
        {
          column: 'CURRENT_VALUE',
          summaryType: 'sum',
          displayFormat: ' {0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          alignByColumn: true,
        },
      ] : [],
      calculateCustomSummary: (options: any) => {
        if (options.name === 'summaryRow') {
          // Custom logic if needed.
        }
      },
    };
  }

  constructor(
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.sesstion_Details();

    // Year field data source.
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;

    // Month field data source.
    this.monthDataSource = this.dataservice.getMonths();
    const currentMonth = new Date().getMonth();
    this.selectedmonth = currentMonth;
  }

  ngOnInit(): void {
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
      this.Depreciation_Report();
    }, 0);

    this.sesstion_Details();
    this.Department_dropdown();
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
      this.Depreciation_Report();
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

    // Your existing summary show/hide logic goes here

    this.summaryButtonOptions = {
      ...this.summaryButtonOptions,
      icon: this.isSummaryVisible ? 'chevrondown' : 'chevronup',
      hint: this.isSummaryVisible ? 'Hide Summary' : 'Show Summary',
    };
  }

  // Year value change.
  onYearChanged(e: any): void {
    this.selectedYear = e.value;
    this.selectedmonth = '';

    const currentYear = new Date().getFullYear();
    const today = new Date();

    if (this.selectedYear === currentYear) {
      this.formatted_from_date = new Date(this.selectedYear, 0, 1);
      this.formatted_To_date = today;
    } else {
      this.formatted_from_date = new Date(this.selectedYear, 0, 1);
      this.formatted_To_date = new Date(this.selectedYear, 11, 31);
    }
  }

  // Month value change.
  onMonthValueChanged(e: any): void {
    this.selectedmonth = e.value ?? '';

    if (this.selectedmonth === '') {
      this.formatted_from_date = new Date(this.selectedYear!, 0, 1);
      this.formatted_To_date = new Date(this.selectedYear!, 11, 31);
    } else {
      this.formatted_from_date = new Date(
        this.selectedYear!,
        this.selectedmonth,
        1,
      );
      this.formatted_To_date = new Date(
        this.selectedYear!,
        this.selectedmonth + 1,
        0,
      );
    }
  }

  sesstion_Details(): void {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') as string,
    );

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;

    const sessionYear = sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;
    this.formatted_from_date = this.financialYeaDate;
  }

  toggleFilterRow = (): void => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  onExporting(event: any): void {
    const fileName = 'BalanceSheetReport';
    this.dataservice.exportDataGridReport(event, fileName);
  }


  get_sessionstorage_data(): void {
    this.savedUserData = JSON.parse(
      sessionStorage.getItem('savedUserData') as string,
    );
    this.company_list = this.savedUserData.Companies;
  }

  get_fin_id(): void {
    this.fin_id = this.savedUserData.FINANCIAL_YEARS;
    if (this.fin_id.length) {
      this.finID = this.fin_id[0].FIN_ID;
    }
  }

  onCompanyChange(event: any): void {
    this.company_id = event.value;
  }

  onFromDateChange(event: any): void {
    if (!event.value) {
      return;
    }

    const rawDate: Date = new Date(event.value);
    this.formatted_from_date = this.formatDate(rawDate);
  }

  onToDateChange(event: any): void {
    if (!event.value) {
      return;
    }

    const rawDate: Date = new Date(event.value);
    this.formatted_To_date = this.formatDate(rawDate);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  formatUsefulLife(cellInfo: any): string {
    return cellInfo.value ? `${cellInfo.value} Years` : '';
  }

  Department_dropdown(): void {
    const payload = {
      NAME: 'DEPT',
      COMPANY_ID: this.selected_Company_id,
    };

    this.dataservice.Common_Dropdown(payload).subscribe((res: any) => {
      this.Department = res;
    });
  }

  Depreciation_Report(): void {
    if (this.reportSubscription) {
      this.reportSubscription.unsubscribe();
      this.reportSubscription = null;
    }
    this.showParameters = false;
    this.isLoading = true;

    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DEPARTMENT_ID: String(this.select_department_id || 0),
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
    };

    this.reportSubscription = this.dataservice
      .Depreciation_Report(payload)
      .subscribe({
        next: (res: any) => {
          this.DepreciationReport = res?.DepreciationDetails ?? [];
          this.isLoading = false;
          this.reportSubscription = null;
        },
        error: () => {
          this.isLoading = false;
          this.reportSubscription = null;
        },
      });
  }


  cancelReport(): void {
    if (this.reportSubscription) {
      this.reportSubscription.unsubscribe();
      this.reportSubscription = null;
      this.isLoading = false;
      notify(
        {
          message: 'Report loading cancelled.',
          type: 'warning',
          displayTime: 3000,
          position: { at: 'top right', my: 'top right', offset: '-20 20' },
        },
        'warning',
        3000
      );
    }
  }

  handleClose(): void {
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
    DxToolbarModule,
    DxiItemModule,
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
  declarations: [DepreciationReportComponent],
  exports: [DepreciationReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DepreciationReportModule { }
