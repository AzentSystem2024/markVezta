import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
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
  selector: 'app-trial-balance-fin-dimension',
  templateUrl: './trial-balance-fin-dimension.component.html',
  styleUrls: ['./trial-balance-fin-dimension.component.scss'],
})
export class TrialBalanceFinDimensionComponent {
  @ViewChild('dataGrid', { static: false }) dataGrid!: DxDataGridComponent;

  isColumnChooserVisible = false;

  tempColumns: {
    dataField: string;
    caption: string;
    visible: boolean;
  }[] = [];

  private readonly chooserColumns = [
    { dataField: 'MainGroup', caption: 'Category' },
    { dataField: 'SubGroup', caption: 'Group' },
    { dataField: 'Category', caption: 'Particulars' },
    {
      dataField: 'Code',
      caption: 'Code',
    },
    { dataField: 'Description', caption: 'Description' },

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
  selectedStoreid: any;
  Diamensions: any[] = [];
  storeHint: string = '';
  selectedDiamensions: number[] = [2];
  isDimensionDisabled = true;

  dimensionPopupVisible: boolean = false;
  dimensionPopupData: any[] = [];
  selectedRowData: any = null;
  // Filter panel visibility
  showParameters = false;
  isFilterOpened = false;
  isSummaryVisible = true;


  summaryColumnsData = {
    totalItems: [
      {
        column: 'OpeningBalanceDebit',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'OpeningBalanceDebit',
        alignment: 'right',
      },
      {
        column: 'OpeningBalanceCredit',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'OpeningBalanceCredit',
        alignment: 'right',
      },
      {
        column: 'DuringThePeriodDebit',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'DuringThePeriodDebit',
        alignment: 'left',
      },
      {
        column: 'DuringThePeriodCredit',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'DuringThePeriodCredit',
        alignment: 'right',
      },
      {
        column: 'ClosingBalanceDebit',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'ClosingBalanceDebit',
        alignment: 'left',
      },
      {
        column: 'ClosingBalanceCredit',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'ClosingBalanceCredit',
        alignment: 'right',
      },
    ],
    groupItems: [
      {
        column: 'OpeningBalanceDebit',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'OpeningBalanceCredit',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'DuringThePeriodDebit',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'DuringThePeriodCredit',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'ClosingBalanceDebit',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'ClosingBalanceCredit',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
    ],
    calculateCustomSummary: (options: any) => {
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
    this.selectedYear = today.getFullYear();

    // Current month (January = 0, December = 11)
    this.selectedmonth = today.getMonth();

    // Current date for From Date and To Date
    this.formatted_from_date = this.formatDate(today);
    this.formatted_To_date = this.formatDate(today);
    this.Diamension_dropdown();
    this.get_DataSource();
  }


  // Toggle filter panel
  toggleParameters(): void {
    this.showParameters = !this.showParameters;
    this.cdr.detectChanges();
  }

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
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.get_DataSource();
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
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.company_list = this.savedUserData.Companies;
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
    this.showParameters = false;
    const payload = {
      companyId: this.selected_Company_id,
      finId: this.selected_fin_id,
      dateFrom: this.formatted_from_date,
      dateTo: this.formatted_To_date,
      DimensionCode: String(this.selectedDiamensions),
    };

    sessionStorage.setItem('viewclickvalue', JSON.stringify(payload));

    console.log(JSON.parse(sessionStorage.getItem('viewclickvalue') || '{}'));

    this.dataservice
      .Trial_Balance_Diamensions_Api(payload)
      .subscribe((res: any) => {
        this.isEmptyDatagrid = false;

        // this.TrialBalanceReport = res.data;
        this.TrialBalanceReport = [...res.data];
        console.log(this.TrialBalanceReport);
      });
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
    this.HeadId = e.row.data.HeadID;
    console.log(this.HeadId);

    sessionStorage.setItem('HEADID', this.HeadId);
    console.log(sessionStorage.getItem('HEADID'));

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
    DxSortableModule,
    DxListModule,
    DxDropDownBoxModule,
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [TrialBalanceFinDimensionComponent],
})
export class TrialBalanceFinDimensionModule { }
