import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  OnInit,
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

@Component({
  selector: 'app-timesheet-report',
  templateUrl: './timesheet-report.component.html',
  styleUrls: ['./timesheet-report.component.scss']
})
export class TimesheetReportComponent {

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

  summaryColumnsData = {
    totalItems: [
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
    ],
    groupItems: [
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
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DEPARTMENT_ID: String(this.select_department_id || 0),
    };

    this.dataservice.TimesheetReport(payload).subscribe((res: any) => {
      this.TimesheetReport = res.DepreciationDetails;
    });
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
export class TimesheetReportModule {}