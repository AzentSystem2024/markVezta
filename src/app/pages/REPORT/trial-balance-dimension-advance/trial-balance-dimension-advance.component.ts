import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule } from '@angular/core';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxListModule,
  DxLoadIndicatorModule,
  DxLoadPanelModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxSortableModule,
  DxTagBoxModule,
  DxTextBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';

import { DataService } from 'src/app/services';

@Component({
  selector: 'app-trial-balance-dimension-advance',
  templateUrl: './trial-balance-dimension-advance.component.html',
  styleUrls: ['./trial-balance-dimension-advance.component.scss']
})
export class TrialBalanceDimensionAdvanceComponent {

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
  selectedYear: any = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  selected_from_date: any;
  Store: any;
  selectedStoreid: any = [];
  Diamensions: any[] = [];
  storeHint: string = '';
  selectedDiamensions: number[] = [2];
  isDimensionDisabled = true;

  dimensionPopupVisible: boolean = false;
  dimensionPopupData: any[] = [];
  selectedRowData: any = null;
  Stores_List: any = [];
  summaryColumnsData: any = {
    totalItems: [],
    groupItems: []
  };
  date_from: any;
  generateSummary() {
    const totalItems: any[] = [];
    const groupItems: any[] = [];

    this.storesDebit.forEach((store) => {
      totalItems.push({
        column: 'Debit_' + store,
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: {
          type: 'fixedPoint',
          precision: 2,
          useGrouping: true,
        },
        showInColumn: 'Debit_' + store,
      });

      groupItems.push({
        column: 'Debit_' + store,
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: {
          type: 'fixedPoint',
          precision: 2,
          useGrouping: true,
        },
        alignByColumn: true,
      });
    });

    this.storesCredit.forEach((store) => {
      totalItems.push({
        column: 'Credit_' + store,
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: {
          type: 'fixedPoint',
          precision: 2,
          useGrouping: true,
        },
        showInColumn: 'Credit_' + store,
      });

      groupItems.push({
        column: 'Credit_' + store,
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: {
          type: 'fixedPoint',
          precision: 2,
          useGrouping: true,
        },
        alignByColumn: true,
      });
    });

    this.summaryColumnsData = {
      totalItems,
      groupItems
    };
  }
  storesCredit: any[] = [];
  storesDebit: any[] = [];

  constructor(
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.get_sessionstorage_data();
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
    this.getStoreDropdown()
  }
  customizeTotalText = () => {
    return 'Total';
  };

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
    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  onExporting(event: any) {
    const fileName = 'Account_Summary_Report.xlsx';
    this.dataservice.exportDataGridReport(event, fileName);
  }

  get_sessionstorage_data() {
    this.savedUserData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.company_list = this.savedUserData.Companies;
    this.date_from = this.savedUserData.FINANCIAL_YEARS[0].DATE_FROM;
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
    console.log('call this function')
    console.log('selected store ids before API call', this.selectedStoreid);
    const storeIds = this.selectedStoreid?.length
      ? this.selectedStoreid.join(',')
      : "";
    const payload = {
      storeIds: storeIds,
      companyId: this.selected_Company_id,
      finId: this.selected_fin_id,
      dateTo: this.formatted_To_date,
    };
    //session stora payload

    const payloadForSession = {
      selectedStoreid: this.selectedStoreid,
      dateFrom: this.date_from,
      companyId: this.selected_Company_id,
      finId: this.selected_fin_id,
      dateTo: this.formatted_To_date,
    };

    sessionStorage.setItem('viewclickvalue', JSON.stringify(payloadForSession));

    console.log(JSON.parse(sessionStorage.getItem('viewclickvalue') || '{}'));

    this.dataservice
      .account_Summary_Api(payload)
      .subscribe((res: any) => {
        console.log(this.TrialBalanceReport);
        this.TrialBalanceReport = res.data.map((row: any) => {

          const newRow: any = {
            HeadID: row.HeadID,
            MainGroup: row.MainGroup,
            SubGroup: row.SubGroup,
            Category: row.Category,
            LedgerCode: row.LedgerCode,
            LedgerName: row.LedgerName
          };

          Object.keys(row.Debit || {}).forEach(key => {
            newRow['Debit_' + key] = row.Debit[key];
          });

          Object.keys(row.Credit || {}).forEach(key => {
            newRow['Credit_' + key] = row.Credit[key];
          });

          return newRow;
        });
        this.storesDebit = Object.keys(res.data[0].Debit || {});
        this.storesCredit = Object.keys(res.data[0].Credit || {});
        this.generateSummary();
        console.log(this.summaryColumnsData);
      });
  }
  getDebitValue(store: string) {
    // console.log('store in debit value', store);
    return (rowData: any) => {
      return rowData?.Debit?.[store] ?? 0;
    };
  }

  getCreditValue(store: string) {
    // console.log('store in credit value', store);
    return (rowData: any) => {
      return rowData?.Credit?.[store] ?? 0;
    };
  }
  onCellClick(e: any) {
    if (e.rowType !== 'data') {
      return;
    }

    if (
      e.column?.dataField !== 'Code' &&
      e.column?.dataField !== 'Description'
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
    const codeValues = (e.data.Code || '')
      .split(' - ')
      .map((x: string) => x.trim())
      .filter((x: string) => x);

    const descriptionValues = (e.data.Description || '')
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

  formatSelectedDimensions = (selectedItems: any[]) => {
    if (!selectedItems || !selectedItems.length) {
      return '';
    }

    return selectedItems
      .map((item) => `${item.DESCRIPTION}(${item.SHORT_NAME})`)
      .join(' - ');
  };

  onViewClick(e: any) {
    console.log('cell click event data', e);
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
  declarations: [TrialBalanceDimensionAdvanceComponent],
})
export class TrialBalanceDimensionAdvanceModule { }
