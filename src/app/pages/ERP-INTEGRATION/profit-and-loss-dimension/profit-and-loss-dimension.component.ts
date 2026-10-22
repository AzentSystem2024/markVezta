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
  DxPopupModule,
  DxSelectBoxModule,
  DxTagBoxModule,
  DxTextBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-profit-and-loss-dimension',
  templateUrl: './profit-and-loss-dimension.component.html',
  styleUrls: ['./profit-and-loss-dimension.component.scss'],
})
export class ProfitAndLossDimensionComponent {
  @ViewChild('dataGrid', { static: false }) dataGrid!: DxDataGridComponent;
  @ViewChild(DxDataGridComponent) grid!: DxDataGridComponent;

  showParameters = false;
  // Custom Column Chooser
  isColumnChooserVisible = false;

  tempColumns: {
    dataField: string;
    caption: string;
    visible: boolean;
  }[] = [];

  private readonly chooserColumns = [
    { dataField: 'TYPE_NAME', caption: 'Category' },
    { dataField: 'MAIN_GROUP_NAME', caption: 'Group' },
    { dataField: 'HEAD_NAME', caption: 'Particulars' },
    {
      dataField: 'CODE',
      caption: 'Code',
    },
    { dataField: 'DESCRIPTION', caption: 'Description' },
    { dataField: 'AMOUNT', caption: 'Amount' },
  ];
  appType: any;

  openColumnChooser(): void {
    this.tempColumns = this.chooserColumns.map((column) => ({
      ...column,
      caption:
        column.dataField === 'STORE_NAME' && this.appType === 'VEZTA'
          ? 'Facility'
          : column.caption,
      visible:
        this.dataGrid.instance.columnOption(
          column.dataField,
          'visible'
        ) !== false,
    }));

    this.isColumnChooserVisible = true;
  }

  applyColumnChooser(): void {
    this.tempColumns.forEach((column) => {
      this.dataGrid.instance.columnOption(
        column.dataField,
        'visible',
        column.visible
      );
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

  selectedYear: number = new Date().getFullYear();

  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  Diamensions: any[] = [];
  selectedDiamensions: number[] = [2];

  dimensionPopupVisible: boolean = false;
  dimensionPopupData: any[] = [];
  selectedRowData: any = null;
  isFilterOpened = false;
  isSummaryVisible = true;

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
    this.Diamension_dropdown();

    //============Year field dataSource===============
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;
    //============Month field dataSource===============

    this.monthDataSource = this.dataservice.getMonths();

    const today = new Date();
    const currentMonth = today.getMonth();

    // Set current year and month by default
    this.selectedYear = currentYear;
    this.selectedmonth = currentMonth;

    // Set date range from the first day of this month to today
    this.formatted_from_date = this.formatDate(
      new Date(currentYear, currentMonth, 1)
    );

    this.formatted_To_date = this.formatDate(today);

    this.get_DataSource();

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

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilters(),
  };

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;
    this.isFilterRowVisible = this.isFilterOpened;
  }

  // Expand or collapse the parameter panel.
  toggleParameters(): void {
    this.showParameters = !this.showParameters;
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
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.appType = sessionData.Configurations?.APP_TYPE;
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.get_DataSource();
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
    this.savedUserData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    //   ;
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

  onDimensionChange(e: any) {
    let selected = e.value || [];

    // force ID 2 to remain selected
    if (!selected.includes(2)) {
      selected.push(2);
    }

    // this.selectedDiamensions = [...new Set(selected)];
  }

  getSelectedDimensionHint() {
    if (!this.selectedDiamensions?.length) {
      return '';
    }

    return this.Diamensions.filter((x) =>
      this.selectedDiamensions.includes(x.ID),
    )
      .map((x) => `${x.DESCRIPTION}${x.SHORT_NAME}`)
      .join(' - ');
  }

  isLastTag(item: any): boolean {
    const selectedItems = this.Diamensions.filter((x) =>
      this.selectedDiamensions.includes(x.ID),
    );

    return selectedItems[selectedItems.length - 1]?.ID === item.ID;
  }

  get_DataSource() {
    const grid = this.dataGrid?.instance;
    grid?.beginCustomLoading('Loading...');

    let payload = {
      COMPANY_ID: this.selected_Company_id,
      FIN_ID: this.finID,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
      DimensionCode: String(this.selectedDiamensions),
    };

    const payloadData = {
      companyId: payload.COMPANY_ID,
      finId: payload.FIN_ID,
      dateFrom: payload.DATE_FROM,
      dateTo: payload.DATE_TO,
      DimensionCode: payload.DimensionCode,
    };

    sessionStorage.removeItem('viewclickvalue');
    sessionStorage.setItem('viewclickvalue', JSON.stringify(payloadData));

    // console.log(JSON.parse(sessionStorage.getItem('viewclickvalue')));
    // console.log(payload, '==========payload================');

    this.dataservice.Profit_Loss_Dimension_Api(payload).subscribe({
      next: (res: any) => {
        this.isEmptyDatagrid = false;
        // console.log(res, '----------list --------------------------');

        this.ProfitLossReport = res.data;

        this.calculateNetProfit();

        this.dataGrid.instance.refresh(); // force grid to recalc summaries
      },
      error: () => { },
      complete: () => {
        grid?.endCustomLoading();
      },
    });
  }

  onCellClick(e: any) {
    if (e.rowType !== 'data') {
      return;
    }

    if (
      e.column?.dataField !== 'CODE' &&
      e.column?.dataField !== 'DESCRIPTION'
    ) {
      return;
    }

    // ================= Fixed Dropdown Order =================
    const fixedDimensionOrder = [1, 2, 3, 4, 5];

    // ================= Selected Dimensions In Fixed Order =================
    const selectedInFixedOrder = fixedDimensionOrder.filter((id) =>
      this.selectedDiamensions.includes(id),
    );

    // ================= Split Values =================
    const codeValues = (e.data.CODE || '')
      .split(' - ')
      .map((x: string) => x.trim())
      .filter((x: string) => x);

    const descriptionValues = (e.data.DESCRIPTION || '')
      .split(' - ')
      .map((x: string) => x.trim())
      .filter((x: string) => x);

    // ================= Correct Mapping =================
    const mappedData = selectedInFixedOrder.map((id: number, index: number) => {
      const dimension = this.Diamensions.find((x: any) => x.ID == id);

      return {
        ID: id,

        Dimension: dimension?.DESCRIPTION || dimension?.SHORT_NAME || '',
        Code: codeValues[index] || '',
        Description: descriptionValues[index] || '',
      };
    });

    // ================= Reorder To User Selection Order =================
    this.dimensionPopupData = this.selectedDiamensions
      .map((selectedId: number) =>
        mappedData.find((x: any) => x.ID === selectedId),
      )
      .filter(Boolean);

    console.log(this.dimensionPopupData);

    this.dimensionPopupVisible = true;
  }

  Diamension_dropdown() {
    const payload = {
      NAME: 'DIAMENSIONS',
    };

    this.dataservice.Common_Dropdown(payload).subscribe((res: any) => {
      this.Diamensions = res || [];

      // ensure ID 2 always selected
      if (!this.selectedDiamensions.includes(2)) {
        this.selectedDiamensions = [2];
      }
    });
  }

  typeSorting = (a: string, b: string) => {
    const order: any = {
      REVENUES: 1,
      EXPENSES: 2,
    };

    return (order[a] || 99) - (order[b] || 99);
  };

  onRowPrepared(e: any) {
    if (e.rowType === 'data' && e.data.isSummary) {
      e.rowElement.style.fontWeight = 'bold';
      // e.rowElement.style.backgroundColor = '#f0f0f0';
    }
  }

  calculateNetProfit() {
    let revenue = 0,
      expense = 0;
    this.ProfitLossReport.forEach((row: any) => {
      const type = (row.TYPE_NAME || '').trim().toUpperCase();
      const amount = Number(row.AMOUNT || 0);
      if (type === 'REVENUES') revenue += amount;
      else if (type === 'EXPENSES') expense += amount;
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
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [ProfitAndLossDimensionComponent],
})
export class ProfitAndLossDimensionModule { }
