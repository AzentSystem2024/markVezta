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
  DxPopupModule,
  DxSelectBoxModule,
  DxTagBoxModule,
  DxTextBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-balance-sheet-dimension',
  templateUrl: './balance-sheet-dimension.component.html',
  styleUrls: ['./balance-sheet-dimension.component.scss'],
})
export class BalanceSheetDimensionComponent {
  isFilterRowVisible: boolean = false;

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
  defaultDate: Date = new Date();

  selectedYear: any = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  Diamensions: any[] = [];
  selectedDiamensions: number[] = [2];

  dimensionPopupVisible: boolean = false;
  dimensionPopupData: any[] = [];
  selectedRowData: any = null;

  constructor(
    private dataservice: DataService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.get_sessionstorage_data();
    this.get_fin_id();
    this.sesstion_Details();

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

    this.selectedYear = null;
    this.selectedmonth = null;
    this.formatted_from_date = SystemDate;
    this.formatted_To_date = SystemDate;
    this.Diamension_dropdown();
    this.get_DataSource();
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

  onDimensionChange(e: any) {
    let selected = e.value || [];
    // force ID 2 to remain selected
    if (!selected.includes(2)) {
      selected.push(2);
    }
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

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    const sessionYear = sessionData.FINANCIAL_YEARS;
    const financialYeaDate = sessionYear[0].DATE_FROM;
    this.formatted_from_date = financialYeaDate;
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  onExporting(event: any) {
    const fileName = 'BalanceSheetReport';
    this.dataservice.exportDataGridReport(event, fileName);
  }

  get_sessionstorage_data() {
    this.savedUserData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
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

  get_DataSource() {
    const payload = {
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

    this.dataservice
      .Balance_Sheet_Dimension_Api(payload)
      .subscribe((res: any) => {
        this.isEmptyDatagrid = false;

        this.BalanceSheetReport = res.data;

        this.calculateCustomSummaries();
        this.expandedOnce = false; //  reset when new data is loaded
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

  onViewClick(e: any) {
    this.HeadId = e.row.data.HEAD_ID;

    sessionStorage.setItem('HEADID', this.HeadId);

    // Navigate to ledger-statement route
    this.router.navigate(['/ledger-statement']);
  }

  onRowPrepared(e: any) {
    if (e.rowType === 'data' && e.data.isSummary) {
      e.rowElement.style.fontWeight = 'bold';
      // e.rowElement.style.backgroundColor = '#f0f0f0';
    }
  }

  calculateCustomSummaries() {
    // no row insertion, just keep original data
    this.BalanceSheetReport = [...this.BalanceSheetReport];
  }

  onContentReady(e: any) {
    if (!this.expandedOnce && e.component.getDataSource().isLoaded()) {
      e.component.expandAll();
      this.expandedOnce = true; //  prevents infinite loop
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
    DxTagBoxModule,
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [BalanceSheetDimensionComponent],
})
export class BalanceSheetDimensionModule {}
