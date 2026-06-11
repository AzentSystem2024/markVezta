import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule } from '@angular/core';
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
  DxTextBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { EditPurchaseInvoiceModule } from '../../PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-aged-payables',
  templateUrl: './aged-payables.component.html',
  styleUrls: ['./aged-payables.component.scss'],
})
export class AgedPayablesComponent {
  AgedPayableReport: any[] = [];
  isFilterRowVisible: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  formatted_from_date: any;
  defaultDate: Date = new Date();
  formatted_To_date: any;
  auto: string = 'auto';
  HeadId: any;
  SuppId: any;
  PurchId: any;
  Supplier: any;
  company_list: any = [];
  savedUserData: any;
  selectedInvoice: any;
  isEditInvoice: boolean = false;
  selected_Company_id: any;
  selectedSupplierId: any;
  isEditInvoiceReadOnly: boolean = true;
  selectedYear: any = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  supplier_details: {
    SUPP_ID: any;
    SALE_ID: any;
    DATE_FROM: any;
    DATE_TO: string;
    COMPANY_ID: any;
  };

  constructor(
    private dataservice: DataService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.get_sessionstorage_data();
    this.sesstion_Details();
    this.get_Supplier_dropdown();
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
    // initialize with today's date
    this.onToDateChange({ value: this.defaultDate });
    //get datasource======== function call==========
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

  onExporting(event: any) {
    const fileName = 'SupplierReport';
    this.dataservice.exportDataGridReport(event, fileName);
  }

  onFromDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_from_date = this.formatDate(rawDate);
  }

  onSupplierChanged(event: any) {
    this.selectedSupplierId = event.value;
    const selectedSupplier = this.Supplier.find(
      (item: any) => item.ID === this.selectedSupplierId,
    );
    if (selectedSupplier) {
    }
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

  get_Supplier_dropdown() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'SUPPLIER',
    };
    this.dataservice.Supplier_Dropdown(payload).subscribe((res: any) => {
      this.Supplier = res;
    });
  }

  onViewClick(e: any) {
    console.log(e)
    this.PurchId = e.row.data.PURCH_ID;
    this.SuppId = e.row.data.SUPP_ID;
    console.log(this.SuppId)
     if (this.SuppId) {
      this.supplier_details = {
        SUPP_ID: this.SuppId,
        SALE_ID: this.PurchId,
        DATE_FROM: this.formatted_from_date,
        DATE_TO: this.formatted_To_date,
        COMPANY_ID: this.selected_Company_id,
      };
      sessionStorage.setItem(
        'supplierdetails',
        JSON.stringify(this.supplier_details),
      );

      // ✅ Retrieve and parse back into object
      const storedData = sessionStorage.getItem('supplierdetails');
      console.log(storedData)
      if (storedData) {
        this.supplier_details = JSON.parse(storedData);
      }

      this.router.navigate(['/aged-payable-details']);
    }
    // sessionStorage.removeItem('PURCHID');
    // sessionStorage.removeItem('SUPPID');
    // sessionStorage.setItem('PURCHID', this.PurchId);
    // sessionStorage.setItem('SUPPID', this.SuppId);
    // Navigate to ledger-statement route
    // this.router.navigate(['/aged-payable-details']);
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    const sessionYear = sessionData.FINANCIAL_YEARS;
    const financialYeaDate = sessionYear[0].DATE_FROM;
    // this.formatted_from_date=financialYeaDate
  }

  get_sessionstorage_data() {
    this.savedUserData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.company_list = this.savedUserData.Companies;
  }

  get_DataSource() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
      SUPP_ID: this.selectedSupplierId || 0,
    };

    sessionStorage.removeItem('supplierViewClick');
    sessionStorage.setItem('supplierViewClick', JSON.stringify(payload));

    this.dataservice.AgedPayable_Report_Api(payload).subscribe((res: any) => {
      this.AgedPayableReport = res.data;
    });
  }

  handleClose() {
    this.isEditInvoice = false;
  }

  summaryColumnsData = {
    totalItems: [
      {
        column: 'AGE_0_30',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'AGE_0_30',
        alignment: 'right',
      },
      {
        column: 'AGE_31_60',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'AGE_31_60',
        alignment: 'right',
      },
      {
        column: 'AGE_61_90',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'AGE_61_90',
        alignment: 'left',
      },
      {
        column: 'AGE_91_120',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'AGE_91_120',
        alignment: 'right',
      },
      {
        column: 'AGE_121_150',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'AGE_121_150',
        alignment: 'right',
      },
      {
        column: 'AGE_151_180',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'AGE_151_180',
        alignment: 'right',
      },
      {
        column: 'AGE_ABOVE_180',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'AGE_ABOVE_180',
        alignment: 'right',
      },
      {
        column: 'BALANCE',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'BALANCE',
        alignment: 'left',
      },
    ],
    groupItems: [
      {
        column: 'AGE_0_30',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'AGE_31_60',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'AGE_61_90',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'AGE_91_120',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'AGE_121_150',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'AGE_151_180',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'AGE_ABOVE_180',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'BALANCE',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
    ],
    calculateCustomSummary: (options: any) => {
      if (options.name === 'summaryRow') {
      }
    },
  };
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
    EditPurchaseInvoiceModule,
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [AgedPayablesComponent],
})
export class AgedPayablesModule {}
