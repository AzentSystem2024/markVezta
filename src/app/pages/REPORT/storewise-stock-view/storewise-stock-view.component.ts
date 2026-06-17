import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
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
import {
  LedgerStatementComponent,
  LedgerStatementModule,
} from '../ledger-statement/ledger-statement.component';

@Component({
  selector: 'app-storewise-stock-view',
  templateUrl: './storewise-stock-view.component.html',
  styleUrls: ['./storewise-stock-view.component.scss']
})
export class StorewiseStockViewComponent {

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
  StockViewReport: any = [];
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
  selectedStoreid: any[] = [];
  selectedItem: any[] = [];

  netProfit: number = 0;
  totalRevenue: number = 0;
  totalExpense: number = 0;

  selectedYear: number | null = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  Store: any;
  dynamicColumns: any[] = [];
  items: any;
  storeHint: string = '';
  itemHint: string = '';
  grandTotal: number = 0;
  storeColumnTotals: any = {};


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
    this.store_dropdown();
    this.item_dropdown();
    this.get_DataSource();

    //============Year field dataSource===============
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;
    //============Month field dataSource===============
    this.monthDataSource = this.dataservice.getMonths();

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
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
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
    const fileName = 'StockViewReport';
    this.dataservice.exportDataGridReport(event, fileName);
  }

  get_sessionstorage_data() {
    this.savedUserData = JSON.parse(sessionStorage.getItem('savedUserData'));
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

  updateItemHint() {
    if (!this.selectedItem || this.selectedItem.length === 0) {
      this.itemHint = 'No item selected';
      return;
    }

    const selectedNames = this.items
      .filter(x => this.selectedItem.includes(x.ID))
      .map(x => x.DESCRIPTION);

    this.itemHint = selectedNames.join(', ');
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

  item_dropdown() {
    const payload = {
      NAME: 'ITEMS'
    }
    this.dataservice.Common_Dropdown(payload).subscribe((res: any) => {
      this.items = {
        store: {
          type: 'array',
          data: res,
          key: 'ID',
        },
        paginate: true,
        pageSize: 50,
      };
    })
  }

  get_DataSource() {
    const grid = this.dataGrid?.instance;
    grid?.beginCustomLoading('Loading...');

    let payload = {
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.finID,
      ITEM_ID: this.selectedItem ? String(this.selectedItem) : "",
      STORE_ID: this.selectedStoreid ? String(this.selectedStoreid) : ""
    };

    const payloadData = {
      companyId: payload.COMPANY_ID,
      finId: payload.FIN_ID,
      itemid: payload.ITEM_ID,
      storeid: payload.STORE_ID
    };

    sessionStorage.removeItem('viewclickvalue');
    sessionStorage.setItem('viewclickvalue', JSON.stringify(payloadData));

    this.dataservice.StockView_branch(payload).subscribe({
      next: (res: any) => {

        this.isEmptyDatagrid = false;
        this.StockViewReport = res.data || [];

        // 🔥 IMPORTANT: BUILD DYNAMIC COLUMNS AFTER DATA ARRIVES
        this.dynamicColumns = [];

        const firstRow = this.StockViewReport[0];

        if (!this.selectedStoreid || this.selectedStoreid.length === 0) {

          // ✅ NO STORE SELECTED → SHOW ALL STORES
          if (firstRow && firstRow.StoreStock) {
            this.dynamicColumns = Object.keys(firstRow.StoreStock)
              .filter(key => key !== 'TOTAL')
              .map(key => ({
                dataField: `StoreStock.${key}`,
                caption: key,
                dataType: 'number',
                alignment: 'right'
              }));
          }

        } else {

          // ✅ STORES SELECTED → SHOW ONLY SELECTED
          this.selectedStoreid.forEach((storeId) => {
            const storeObj = this.Store.find(s => s.ID === storeId);

            if (storeObj) {
              const key = storeObj.DESCRIPTION?.trim();

              this.dynamicColumns.push({
                dataField: `StoreStock.${key}`,
                caption: key,
                dataType: 'number',
                alignment: 'right'
              });
            }
          });
        }

        // 🔥 FORCE UI UPDATE (fix first-load issue)
        this.cdr.detectChanges();

        // 🔥 YOUR CALCULATIONS
        this.calculateStoreColumnTotals();
        this.calculateGrandTotal();

        // 🔥 FINAL GRID REFRESH
        setTimeout(() => {
          this.dataGrid.instance.refresh();
        });

      },

      error: () => {
        grid?.endCustomLoading();
      },

      complete: () => {
        grid?.endCustomLoading();
      }
    });
  }


  typeSorting = (a: string, b: string) => {
    const order = {
      REVENUE: 1,
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

  calculateStoreColumnTotals() {
    this.storeColumnTotals = {};

    this.StockViewReport.forEach(row => {
      const storeStock = row.StoreStock || {};

      Object.keys(storeStock).forEach(key => {
        if (key === 'TOTAL') return; // skip total column

        const value = Number(storeStock[key] || 0);

        this.storeColumnTotals[key] =
          (this.storeColumnTotals[key] || 0) + value;
      });
    });
  }

  onRowPrepared(e) {
    if (e.rowType === 'data' && e.data.isSummary) {
      e.rowElement.style.fontWeight = 'bold';
      // e.rowElement.style.backgroundColor = '#f0f0f0';
    }
  }

  calculateGrandTotal() {
    this.grandTotal = this.StockViewReport.reduce((sum, row) => {
      return sum + Number(row.StoreStock?.TOTAL || 0);
    }, 0);
  }
  onCellPrepared(e: any) {
    // 🔹 GRAND TOTAL
    if (
      e.rowType === 'totalFooter' &&
      e.column?.dataField === 'StoreStock.TOTAL'
    ) {
      const formatted = (this.grandTotal || 0).toLocaleString(); // ✅ no decimals

      e.cellElement.innerHTML = `
      <div style="text-align: right; font-weight: bold; padding-right: 20px;">
        Grand Total: ${formatted}
      </div>
    `;
    }

    // 🔹 DYNAMIC STORE COLUMNS
    if (
      e.rowType === 'totalFooter' &&
      e.column?.dataField?.startsWith('StoreStock.')
    ) {
      const key = e.column.dataField.split('.')[1];

      if (key !== 'TOTAL') {
        const total = this.storeColumnTotals[key] || 0;

        const formatted = total.toLocaleString(); // ✅ no decimals

        e.cellElement.innerHTML = `
        <div style="text-align: right; font-weight: bold;">
          ${formatted}
        </div>
      `;
      }
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
    DxButtonModule,
    LedgerStatementModule,
    DxTagBoxModule,
  ],
  providers: [],
  exports: [],
  declarations: [StorewiseStockViewComponent],
})
export class StorewiseStockViewModule { }