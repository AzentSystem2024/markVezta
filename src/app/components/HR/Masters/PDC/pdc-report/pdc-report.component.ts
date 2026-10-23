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
import { Router } from '@angular/router';
import { PdcEditFormModule } from '../pdc-edit-form/pdc-edit-form.component';
import { Subscription } from 'rxjs';
import notify from 'devextreme/ui/notify';


@Component({
  selector: 'app-pdc-report',
  templateUrl: './pdc-report.component.html',
  styleUrls: ['./pdc-report.component.scss']
})
export class PDCReportComponent {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;

  isColumnChooserVisible = false;

  tempColumns: {
    dataField: string;
    caption: string;
    visible: boolean;
  }[] = [];

  private readonly chooserColumns = [
    { dataField: 'CHEQUE_NO', caption: 'Cheque No.' },
    { dataField: 'CHEQUE_DATE', caption: 'Due Date' },
    { dataField: 'BANK', caption: 'Bank' },
    { dataField: 'BENEFICIARY_NAME', caption: 'Beneficiary Name' },
    { dataField: 'PAID', caption: 'Issued' },
    { dataField: 'RECEIVED', caption: 'Received' },
    { dataField: 'PDC_STATUS', caption: 'Status' },
    { dataField: 'REMARKS', caption: 'Remarks' },
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

  PDCReport: any[] = [];
  isFilterRowVisible: boolean = false;
  editPDCPopupOpened: boolean = false;
  BalanceSheetReport: any = [];
  auto: string = 'auto';
  isEmptyDatagrid: boolean = true;
  expandedOnce = false;
  isEditReadOnly = true;
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
  selectedPDC: any;
  // customer_details: {};
  defaultDate: Date = new Date();
  financialYeaDate: string;
  selectedYear: number | null = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  canApprove = false;
  isSummaryVisible = true;
  showParameters = true;
  isLoading = false;
  private reportSubscription: Subscription | null = null;

  toggleParameters(): void {
    this.showParameters = !this.showParameters;
  }

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
    // initialize with today's date
    // this.onToDateChange({ value: this.defaultDate });
    //   this.onFromDateChange({ value: this.financialYeaDate });
    //get datasource======== function call==========
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
      this.get_PDC_list();
    }, 0);

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
      this.get_PDC_list();
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
    // Your existing summary show/hide logic goes here

    this.summaryButtonOptions = {
      ...this.summaryButtonOptions,
      icon: this.isSummaryVisible ? 'chevrondown' : 'chevronup',
      hint: this.isSummaryVisible ? 'Hide Summary' : 'Show Summary',
    };
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '');

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


  onExporting(event: any) {
    const fileName = 'PDCReport';
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

  get_PDC_list() {
    // Cancel any in-flight request
    if (this.reportSubscription) {
      this.reportSubscription.unsubscribe();
      this.reportSubscription = null;
    }
    this.showParameters = false;   // ⬅️ collapse panel on Apply
    this.isLoading = true;

    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
    };

    this.reportSubscription = this.dataservice
      .PDC_Report(payload)
      .subscribe({
        next: (res: any) => {
          this.PDCReport = res.PDCDetails;
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

  onViewClick(e: any) {
    console.log(e, 'event')
    const TRANS_TYPE_ID = e.row.data.TRANS_TYPE;
    const trans_id = e.row.data.ID;
    this.dataservice
      .Select_PDC(trans_id)
      .subscribe((response: any) => {
        this.selectedPDC = response.Data[0];

        this.editPDCPopupOpened = true;
        this.cdr.detectChanges();
      });
  }

  handleClose() {
    this.editPDCPopupOpened = false;
  }

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

    const columns = [
      'PAID',
      'RECEIVED',
    ];

    this.summaryColumnsData = {
      totalItems: columns.map((column) => ({
        column,
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: {
          type: 'fixedPoint',
          precision: 2,
          useGrouping: true,
        },
        showInColumn: column,
        alignment: 'right',
      })),

      groupItems: columns.map((column) => ({
        column,
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: {
          type: 'fixedPoint',
          precision: 2,
          useGrouping: true,
        },
        alignByColumn: true,
      })),
    };
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
    PdcEditFormModule,
  ],
  providers: [],
  declarations: [PDCReportComponent],
  exports: [PDCReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PDCReportModule { }