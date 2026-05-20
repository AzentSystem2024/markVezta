import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule } from '@angular/core';
import { FormBuilder } from '@angular/forms';
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
  styleUrls: ['./trial-balance-fin-dimension.component.scss']
})
export class TrialBalanceFinDimensionComponent {

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
  selected_from_date: string;
  Store: any;
  selectedStoreid: any;
  Diamensions: any[] = [];
//   Diamensions = [
//   {
//     ID: 1,
//     CODE: 'BU',
//     DESCRIPTION: 'Business Unit'
//   },
//   {
//     ID: 2,
//     CODE: 'Ledger',
//     DESCRIPTION: 'Ledger'
//   },
//   {
//     ID: 3,
//     CODE: 'Department Group',
//     DESCRIPTION: 'Department Group'
//   },
//   {
//     ID: 4,
//     CODE: 'Department',
//     DESCRIPTION: 'Department'
//   },
//   {
//     ID: 5,
//     CODE: 'Clinician',
//     DESCRIPTION: 'Clinician'
//   }
// ];

// selectedDiamensions = [2]; // Ledger always selected
selectedDiamensions: number[] = [2];
isDimensionDisabled = true;

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

    this.formatted_from_date = SystemDate;
    this.formatted_To_date = SystemDate;
    this.get_DataSource();
    this.store_dropdown();
    this.Diamension_dropdown();
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
    calculateCustomSummary: (options) => {
      if (options.name === 'summaryRow') {
        // Custom logic if needed
      }
    },
  };

  onExporting(event: any) {
    const fileName = 'TrialBalanceReport';
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

  get_DataSource() {
    const payload = {
      companyId: this.selected_Company_id,
      finId: this.selected_fin_id,
      dateFrom: this.formatted_from_date,
      dateTo: this.formatted_To_date,
      DimensionCode : String(this.selectedDiamensions)
    };

    sessionStorage.setItem('viewclickvalue', JSON.stringify(payload));

    console.log(JSON.parse(sessionStorage.getItem('viewclickvalue')));

    this.dataservice.Trial_Balance_Diamensions_Api(payload).subscribe((res: any) => {
      this.isEmptyDatagrid = false;

      this.TrialBalanceReport = res.data;
      console.log(this.TrialBalanceReport);
    });
  }

   storeHint: string = '';

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

    store_dropdown(){
    const payload = {
      NAME :'STORE',
      COMPANY_ID : this.selected_Company_id
    }
    this.dataservice.Common_Dropdown(payload).subscribe((res: any) => {
      this.Store = res;
    });
  }

Diamension_dropdown() {
  const payload = {
    NAME: 'DIAMENSIONS'
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

  return this.Diamensions
    .filter(x => this.selectedDiamensions.includes(x.ID))
    .map(x => `${x.DESCRIPTION}${x.SHORT_NAME}`)
    .join(' - ');
}

isLastTag(item: any): boolean {
  const selectedItems = this.Diamensions.filter(x =>
    this.selectedDiamensions.includes(x.ID)
  );

  return selectedItems[selectedItems.length - 1]?.ID === item.ID;
}
// onReorder(e: any) {
//   const visibleRows = e.component.getVisibleRows();
//   const fromIndex = e.fromIndex;
//   const toIndex = e.toIndex;

//   const item = this.Diamensions.splice(fromIndex, 1)[0];
//   this.Diamensions.splice(toIndex, 0, item);

//   this.Diamensions = [...this.Diamensions];
// }

// draggedIndex: number = -1;

// onDragStart(event: DragEvent, index: number) {
//   this.draggedIndex = index;
// }

// onDragOver(event: DragEvent) {
//   event.preventDefault();
// }

// onDrop(event: DragEvent, dropIndex: number) {
//   event.preventDefault();

//   if (this.draggedIndex === dropIndex) return;

//   const draggedItem = this.Diamensions[this.draggedIndex];

//   this.Diamensions.splice(this.draggedIndex, 1);
//   this.Diamensions.splice(dropIndex, 0, draggedItem);

//   this.Diamensions = [...this.Diamensions];
// }

// toggleDimension(id: number, e: any) {
//   // Prevent Ledger from being removed
//   if (id === 2) {
//     return;
//   }

//   if (e.value) {
//     if (!this.selectedDiamensions.includes(id)) {
//       this.selectedDiamensions.push(id);
//     }
//   } else {
//     this.selectedDiamensions =
//       this.selectedDiamensions.filter(x => x !== id);
//   }

//   // Always keep Ledger selected
//   if (!this.selectedDiamensions.includes(2)) {
//     this.selectedDiamensions.unshift(2);
//   }

//   this.selectedDiamensions = [...this.selectedDiamensions];
// }

// isAllSelected(): boolean {
//   return this.Diamensions.length > 0 &&
//     this.Diamensions.every(item =>
//       this.selectedDiamensions.includes(item.ID)
//     );
// }

// toggleSelectAll(e: any) {
//   if (e.value) {
//     // Select all dimensions
//     this.selectedDiamensions = this.Diamensions.map(item => item.ID);
//   } else {
//     // Keep Ledger only
//     this.selectedDiamensions = [2];
//   }

//   this.selectedDiamensions = [...this.selectedDiamensions];
// }

formatSelectedDimensions = (selectedItems: any[]) => {
  if (!selectedItems || !selectedItems.length) {
    return '';
  }

  return selectedItems
    .map(item => `${item.DESCRIPTION}(${item.SHORT_NAME})`)
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
    DxDropDownBoxModule
    
  ],
  providers: [],
  exports: [],
  declarations: [TrialBalanceFinDimensionComponent],
})
export class TrialBalanceFinDimensionModule {}
