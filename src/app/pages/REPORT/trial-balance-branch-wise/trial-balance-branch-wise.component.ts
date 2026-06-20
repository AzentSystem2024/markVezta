import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxLoadIndicatorModule,
  DxLoadPanelModule,
  DxNumberBoxModule,
  DxSelectBoxModule,
  DxTagBoxModule,
  DxTextBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';

import { DataService } from 'src/app/services';
@Component({
  selector: 'app-trial-balance-branch-wise',
  templateUrl: './trial-balance-branch-wise.component.html',
  styleUrls: ['./trial-balance-branch-wise.component.scss'],
})
export class TrialBalanceBranchWiseComponent {
  isFilterRowVisible: boolean = false;

  TrialBalanceReport: any = [];
  auto: string = 'auto';
  isEmptyDatagrid: boolean = true;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  company_list: any = [];
  savedUserData: any;
  fin_id: any;
  company_id: any;
  from_Date: any;
  To_Date: any;
  TrialBalance_datasource: any;
  finID: any;
  fromDate: any;
  ToDate: any;
  formatted_from_date: any;
  formatted_To_date: any;
  HeadId: any;
  selected_Company_id: any;
  selected_fin_id: any;
  selectedYear: number | null = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  selected_from_date: any;
  Store: any;
  selectedStoreid: any;
  Stores_List: any[] = [];
  openingColumns: any[] = [];
  duringPeriodColumns: any[] = [];
  closingColumns: any[] = [];

  constructor(
    private dataservice: DataService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.get_sessionstorage_data();
    this.get_fin_id();
    this.sesstion_Details();
    this.store_dropdown();
    //============Year field dataSource===============
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;
    //============Month field dataSource===============
    this.monthDataSource = this.dataservice.getMonths();
  }

  ngOnInit() {
    const today = new Date();
    const SystemDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    this.formatted_from_date = SystemDate;
    this.formatted_To_date = SystemDate;
    this.get_DataSource();
    this.store_dropdown();
    this.getStoreDropdown();
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
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  onExporting(event: any) {
    const fileName = 'TrialBalanceReport';
    this.dataservice.exportDataGridReport(event, fileName);
  }

  get_sessionstorage_data() {
    this.savedUserData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '',
    );
    this.company_list = this.savedUserData.Companies;
  }

  get_fin_id() {
    this.fin_id = this.savedUserData.FINANCIAL_YEARS;
    if (this.fin_id.length) {
      this.finID = this.fin_id[0].FIN_ID;
    }
    console.log(this.fin_id, '========financial year');
  }

  onCompanyChange(event: any) {
    this.company_id = event.value;
    console.log(this.company_id, '=====company id');
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

  // get_DataSource() {
  //   const storeIds = this.selectedStoreid?.length
  //     ? this.selectedStoreid.join(',')
  //     : "";
  //   const payload = {
  //     COMPANY_ID: this.selected_Company_id,
  //     FIN_ID: this.selected_fin_id,
  //     DATE_FROM: this.formatted_from_date,
  //     DATE_TO: this.formatted_To_date,
  //     STORE_ID: storeIds
  //   };

  //   sessionStorage.setItem('viewclickvalue', JSON.stringify(payload));

  //   this.dataservice.get_Trial_balance_api(payload).subscribe((res: any) => {
  //     this.isEmptyDatagrid = false;

  //     this.TrialBalanceReport = res.data;
  //     if (res.length > 0) {

  //       const firstRow = res[0];

  //       this.openingColumns = Object.keys(firstRow)
  //         .filter(key => key.startsWith('Opening -'));

  //       this.duringPeriodColumns = Object.keys(firstRow)
  //         .filter(key => key.startsWith('During_Period -'));

  //       this.closingColumns = Object.keys(firstRow)
  //         .filter(key => key.startsWith('Closing -'));
  //     }
  //     console.log(this.TrialBalanceReport);
  //   });
  // }
  get_DataSource() {
    const storeIds = this.selectedStoreid?.length
      ? this.selectedStoreid.join(',')
      : '';
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.selected_fin_id,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
      STORE_ID: storeIds,
    };
    sessionStorage.setItem('viewclickvalue', JSON.stringify(payload));

    this.dataservice.get_Trial_balance_api(payload).subscribe((res: any) => {
      const rows: any[] = res?.data ?? []; // ✅ use res.data
      this.isEmptyDatagrid = rows.length === 0;

      if (rows.length > 0) {
        const firstRow = rows[0]; // ✅ rows[0]
        this.openingColumns = Object.keys(firstRow).filter((k) =>
          k.startsWith('Opening - '),
        );
        this.duringPeriodColumns = Object.keys(firstRow).filter((k) =>
          k.startsWith('During_Period - '),
        );
        this.closingColumns = Object.keys(firstRow).filter((k) =>
          k.startsWith('Closing - '),
        );
      }

      this.TrialBalanceReport = rows;
      this.createSummary();
      // ✅ show data as-is, no conversion
    });
  }

  storeHint: string = '';

  updateStoreHint() {
    if (!this.selectedStoreid || this.selectedStoreid.length === 0) {
      this.storeHint = 'No store selected';
      return;
    }

    const selectedNames = this.Store.filter((x) =>
      this.selectedStoreid.includes(x.ID),
    ).map((x) => x.DESCRIPTION);

    this.storeHint = selectedNames.join(', ');
  }

  store_dropdown() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.Common_Dropdown(payload).subscribe((res: any) => {
      this.Store = res;
    });
  }

  onViewClick(e: any) {
    this.HeadId = e.row.data.HeadID;
    console.log(this.HeadId);

    sessionStorage.setItem('HEADID', this.HeadId);
    console.log(sessionStorage.getItem('HEADID'));

    // Navigate to ledger-statement route
    this.router.navigate(['/ledger-statement']);
  }
  getStoreDropdown() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'STORE',
    };
    this.dataservice.getDropdownData(payload).subscribe((response: any) => {
      this.Stores_List = response;
    });
  }

  onStoreChanged(e: any) {
    console.log('Selected store IDs:', this.selectedStoreid);
  }
  summaryColumnsData = {
    totalItems: [
      ...this.openingColumns.map((col) => ({
        column: col,
        summaryType: 'sum',
        showInColumn: col,
        displayFormat: '{0}',
        valueFormat: {
          type: 'fixedPoint',
          precision: 2,
          useGrouping: true,
        },
      })),

      ...this.duringPeriodColumns.map((col) => ({
        column: col,
        summaryType: 'sum',
        showInColumn: col,
        displayFormat: '{0}',
        valueFormat: {
          type: 'fixedPoint',
          precision: 2,
          useGrouping: true,
        },
      })),

      ...this.closingColumns.map((col) => ({
        column: col,
        summaryType: 'sum',
        showInColumn: col,
        displayFormat: '{0}',
        valueFormat: {
          type: 'fixedPoint',
          precision: 2,
          useGrouping: true,
        },
      })),

      {
        column: 'Opening TOTAL',
        summaryType: 'sum',
        showInColumn: 'Opening TOTAL',
        valueFormat: {
          type: 'fixedPoint',
          precision: 2,
          useGrouping: true,
        },
      },

      {
        column: 'During_period TOTAL',
        summaryType: 'sum',
        showInColumn: 'During_period TOTAL',
        valueFormat: {
          type: 'fixedPoint',
          precision: 2,
          useGrouping: true,
        },
      },

      {
        column: 'Closing TOTAL',
        summaryType: 'sum',
        showInColumn: 'Closing TOTAL',
        valueFormat: {
          type: 'fixedPoint',
          precision: 2,
          useGrouping: true,
        },
      },
    ],
  };
  calculateCustomSummary(options: any) {
    if (options.summaryProcess === 'start') {
      options.totalValue = 0;
    }

    if (options.summaryProcess === 'calculate') {
      const value = Number(
        String(options.value[options.name] || '0').replace(/,/g, ''),
      );

      options.totalValue += value;
    }

    if (options.summaryProcess === 'finalize') {
      options.totalValue = options.totalValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }
  formatAmount = (cellInfo: any) => {
    if (!cellInfo.value) {
      return '0.00';
    }

    return Number(String(cellInfo.value).replace(/,/g, '')).toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    );
  };
  createSummary() {
    this.summaryColumnsData = {
      totalItems: [
        ...this.openingColumns.map((col) => ({
          column: col,
          summaryType: 'sum',
          showInColumn: col,
          displayFormat: '{0}',
          valueFormat: {
            type: 'fixedPoint',
            precision: 2,
            useGrouping: true,
          },
        })),

        ...this.duringPeriodColumns.map((col) => ({
          column: col,
          summaryType: 'sum',
          showInColumn: col,
          displayFormat: '{0}',
          valueFormat: {
            type: 'fixedPoint',
            precision: 2,
            useGrouping: true,
          },
        })),

        ...this.closingColumns.map((col) => ({
          column: col,
          summaryType: 'sum',
          showInColumn: col,
          displayFormat: '{0}',
          valueFormat: {
            type: 'fixedPoint',
            precision: 2,
            useGrouping: true,
          },
        })),

        {
          column: 'Opening TOTAL',
          summaryType: 'sum',
          showInColumn: 'Opening TOTAL',
          displayFormat: '{0}',
          valueFormat: {
            type: 'fixedPoint',
            precision: 2,
            useGrouping: true,
          },
        },

        {
          column: 'During_period TOTAL',
          summaryType: 'sum',
          showInColumn: 'During_period TOTAL',
          displayFormat: '{0}',
          valueFormat: {
            type: 'fixedPoint',
            precision: 2,
            useGrouping: true,
          },
        },

        {
          column: 'Closing TOTAL',
          summaryType: 'sum',
          showInColumn: 'Closing TOTAL',
          displayFormat: '{0}',
          valueFormat: {
            type: 'fixedPoint',
            precision: 2,
            useGrouping: true,
          },
        },
      ],
    };
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    CommonModule,
    DxTextBoxModule,
    DxCheckBoxModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxSelectBoxModule,
    DxLoadPanelModule,
    DxLoadIndicatorModule,
    DxNumberBoxModule,
    DxDateBoxModule,
    DxSelectBoxModule,
    DxButtonModule,
    DxTagBoxModule,
  ],
  providers: [],
  exports: [],
  declarations: [TrialBalanceBranchWiseComponent],
})
export class TrialBalanceBranchWiseModule {}
