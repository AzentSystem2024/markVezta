import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule, NgZone, ViewChild } from '@angular/core';
import { DxDataGridModule, DxButtonModule, DxTextBoxModule, DxCheckBoxModule, DxValidatorModule, DxValidationGroupModule, DxSelectBoxModule, DxLoadPanelModule, DxLoadIndicatorModule, DxNumberBoxModule, DxDateBoxModule, DxDataGridComponent, DxTagBoxModule } from 'devextreme-angular';
import { LedgerStatementModule } from '../ledger-statement/ledger-statement.component';
import { ProfitAndLossComponent } from '../profit-and-loss/profit-and-loss.component';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profit-loss-departmentwise',
  templateUrl: './profit-loss-departmentwise.component.html',
  styleUrls: ['./profit-loss-departmentwise.component.scss']
})
export class ProfitLossDepartmentwiseComponent {
  @ViewChild('dataGrid', { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxDataGridComponent) grid!: DxDataGridComponent;
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    // onClick: () => this.refreshGrid(),
    onClick: () => {
      this.zone.run(() => this.refreshGrid());
    },
    text: '',
  };

  isFilterRowVisible: boolean = false;
  ProfitLossReport: any = [];
  auto: string = 'auto';
  isEmptyDatagrid: boolean = true;
  expandedOnce = false;
  revenueTotalForSummary = 0;
  expenseTotalForSummary = 0;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  company_list: any = [];
  savedUserData: any;
  fin_id: any;
  company_id: any;
  from_Date: any;
  To_Date: any;
  selected_Company_id: any;
  finID: any;
  fromDate: any;
  ToDate: any;
  formatted_from_date: any;
  formatted_To_date: any;
  HeadId: any;

  netProfit: number = 0;
  totalRevenue: number = 0;
  totalExpense: number = 0;

  selectedYear: any = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  Department: any;
  selectedDepartment: any;
  Store: any;
  selectedStoreid: any[] = [];
  storeHint: string = '';
  showViewColumn = false;

  constructor(
    private dataservice: DataService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private zone: NgZone,
  ) {
    this.get_sessionstorage_data();
    this.get_fin_id();
    this.sesstion_Details();
    this.department_dropdown();
    this.store_dropdown();

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

    const today = new Date();
    const SystemDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    this.formatted_from_date = SystemDate;
    this.formatted_To_date = SystemDate;
    // this.get_DataSource();
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.get_DataSource();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || " ");
    //

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    // console.log(
    //   this.selected_Company_id,
    //   '============selected_Company_id==============',
    // );
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

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  onExporting(event: any) {
    const fileName = 'ProfitLossReport';
    this.dataservice.exportDataGridReport(event, fileName);
  }

  get_sessionstorage_data() {
    this.savedUserData = JSON.parse(sessionStorage.getItem('savedUserData') || " ");
    //   ;
    this.company_list = this.savedUserData.Companies;
  }

  get_fin_id() {
    this.fin_id = this.savedUserData.FINANCIAL_YEARS;
    if (this.fin_id.length) {
      this.finID = this.fin_id[0].FIN_ID;
    }
    // console.log(this.fin_id, '========financial year');
  }

  onCompanyChange(event: any) {
    this.company_id = event.value;
    // console.log(this.company_id, '=====company id');
  }

  onFromDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_from_date = this.formatDate(rawDate);
    //       // example: "2025-04-01"
  }

  onToDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_To_date = this.formatDate(rawDate);
    //      // example: "2025-04-01"
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  updateStoreHint() {
    if (!this.selectedStoreid || this.selectedStoreid.length === 0) {
      this.storeHint = 'No store selected';
      return;
    }

    const selectedNames = this.Store
      .filter(x => this.selectedStoreid.includes(x.ID))
      .map(x => x.DESCRIPTION);

    this.storeHint = selectedNames.join(', ');
  }

  store_dropdown() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selected_Company_id
    }
    this.dataservice.Common_Dropdown(payload).subscribe((res: any) => {
      this.Store = res;
    });
  }

  department_dropdown() {
    const payload = {
      NAME: 'DEPT',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.Common_Dropdown(payload).subscribe((res: any) => {
      this.Department = res;
    });
  }

  get_DataSource() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.finID,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
      DEPT_ID: this.selectedDepartment ? String(this.selectedDepartment) : "",
      BRANCH_ID: this.selectedStoreid ? String(this.selectedStoreid) : ""
    };

    const payloadData = {
      companyId: payload.COMPANY_ID,
      finId: payload.FIN_ID,
      dateFrom: payload.DATE_FROM,
      dateTo: payload.DATE_TO,
      deptId: payload.DEPT_ID,
      storeId: payload.BRANCH_ID

    };

    sessionStorage.removeItem('viewclickvalue');
    sessionStorage.setItem('viewclickvalue', JSON.stringify(payloadData));

    this.ProfitLossReport = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.DepartmentwiseProfitAndLoss_Report(payload).subscribe({
            next: (res: any) => {
              const list = res.data || [];
              this.showViewColumn = list.length > 0;

              this.isEmptyDatagrid = list.length === 0;

              // Calculate net profit using the loaded data
              this.calculateNetProfit(list);

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
              this.isEmptyDatagrid = true;
              resolve([]);
            },
          });
        }),
    });
  }

  typeSorting = (a: string, b: string) => {
    const order = {
      REVENUES: 1,
      EXPENSES: 2,
    };

    return (order[a] || 99) - (order[b] || 99);
  };

  onViewClick(e: any) {
    //
    this.HeadId = e.row.data.HEAD_ID;
    // console.log(this.HeadId);
    sessionStorage.removeItem('HEADID');

    sessionStorage.setItem('HEADID', this.HeadId);
    // console.log(sessionStorage.getItem('HEADID'));

    // Navigate to ledger-statement route
    this.router.navigate(['/ledger-statement']);
  }

  onRowPrepared(e: any) {
    if (e.rowType === 'data' && e.data.isSummary) {
      e.rowElement.style.fontWeight = 'bold';
      // e.rowElement.style.backgroundColor = '#f0f0f0';
    }
  }

  // calculateNetProfit() {
  //   let revenue = 0,
  //     expense = 0;
  //   this.ProfitLossReport.forEach((row) => {
  //     const type = (row.TYPE_NAME || '').trim().toUpperCase();
  //     const amount = Number(row.AMOUNT || 0);
  //     if (type === 'REVENUES') revenue += amount;
  //     else if (type === 'EXPENSES') expense += amount;
  //   });
  //   this.netProfit = revenue - expense;
  // }
  calculateNetProfit(data: any[]) {
    let revenue = 0;
    let expense = 0;

    data.forEach((row) => {
      const type = (row.TYPE_NAME || '').trim().toUpperCase();
      const amount = Number(row.AMOUNT || 0);

      if (type === 'REVENUES') {
        revenue += amount;
      } else if (type === 'EXPENSES') {
        expense += amount;
      }
    });

    this.netProfit = revenue - expense;
  }
  onCellPrepared(e: any) {
    if (
      e.rowType === 'totalFooter' &&
      e.column &&
      e.column.dataField === 'AMOUNT'
    ) {
      const amount = Number(this.netProfit) || 0;

      const label = amount >= 0 ? 'Net Profit' : 'Net Loss';

      const formatted = Math.abs(amount).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      e.cellElement.innerHTML = `
      <div style="text-align: right; font-weight: bold; margin-top: 5px; padding-right: 20px;">
        ${label}: ${formatted}
      </div>
    `;
    }
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
    DxTagBoxModule,
    DxButtonModule,
    LedgerStatementModule,
  ],
  providers: [],
  exports: [],
  declarations: [ProfitLossDepartmentwiseComponent],
})
export class ProfitLossDepartmentwiseModule { }
