import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule, ViewChild } from '@angular/core';
import { DxButtonModule, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxDateBoxModule, DxLoadIndicatorModule, DxLoadPanelModule, DxNumberBoxModule, DxPopupModule, DxSelectBoxModule, DxTextBoxModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { EditPurchaseInvoiceModule } from '../../PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import notify from 'devextreme/ui/notify';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-aged-payables',
  templateUrl: './aged-payables.component.html',
  styleUrls: ['./aged-payables.component.scss']
})
export class AgedPayablesComponent {

  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;

  isColumnChooserVisible = false;

  tempColumns: {
    dataField: string;
    caption: string;
    visible: boolean;
  }[] = [];

  private readonly chooserColumns = [
    { dataField: 'CUSTOMER_NAME', caption: 'Customer' },
    { dataField: 'INVOICE_DATE', caption: 'Date' },
    { dataField: 'DOC_NO', caption: 'Doc No' },
    { dataField: 'AGE_0_30', caption: '0 - 30' },
    { dataField: 'AGE_31_60', caption: '31 - 60' },
    { dataField: 'AGE_61_90', caption: '61 - 90' },
    { dataField: 'AGE_91_120', caption: '91 - 120' },
    { dataField: 'AGE_121_150', caption: '121 - 150' },
    { dataField: 'AGE_151_180', caption: '151 - 180' },
    { dataField: 'AGE_ABOVE_180', caption: 'Above 180' },
    { dataField: 'TOTAL_BALANCE', caption: 'Total Balance' },
  ];

  openColumnChooser(): void {
    const grid = this.dataGrid?.instance;

    if (!grid) {
      return;
    }

    this.tempColumns = this.chooserColumns.map((column) => ({
      ...column,
      visible: grid.columnOption(column.dataField, 'visible') !== false,
    }));

    this.isColumnChooserVisible = true;
  }

  applyColumnChooser(): void {
    const grid = this.dataGrid?.instance;

    if (!grid) {
      return;
    }

    this.tempColumns.forEach((column) => {
      grid.columnOption(column.dataField, 'visible', column.visible);
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
      viopenColumnsible: true,
    }));
  }

  AgedPayableReport: any;
  isFilterRowVisible: boolean = false
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  formatted_from_date: any;
  defaultDate: Date = new Date();
  formatted_To_date: any;
  auto: string = 'auto'
  HeadId: any;
  SuppId: any
  PurchId: any;
  Supplier: any;
  company_list: any = []
  savedUserData: any;
  selectedInvoice: any;
  isEditInvoice: boolean = false;
  selected_Company_id: any;
  selectedSupplierId: any;
  isEditInvoiceReadOnly: boolean = true;
  selectedYear: number | null = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';

  isSummaryVisible = true;

  constructor(private dataservice: DataService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private router: Router) {
    this.get_sessionstorage_data()
    this.sesstion_Details();
    this.get_Supplier_dropdown()
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
    this.get_DataSource()
  }

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilterRow(),
  };

  toggleFilterRow = (): void => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.get_DataSource();
    }
  }

  applyButtonOptions = {
    width: 100,
    hint: 'Apply Filters',
    text: 'Apply',
    type: 'default',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.get_DataSource(),
  };

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
      this.formatted_from_date = new Date(this.selectedYear, this.selectedmonth, 1);
      this.formatted_To_date = new Date(
        this.selectedYear,
        this.selectedmonth + 1,
        0
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
    console.log('Formatted Date:', this.formatted_from_date); // example: "2025-04-01"
  }

  onSupplierChanged(event: any) {
    console.log(event, 'event')
    this.selectedSupplierId = event.value

    // Find and log the selected supplier's DESCRIPTION
    const selectedSupplier = this.Supplier.find((item: any) => item.ID === this.selectedSupplierId);
    if (selectedSupplier) {
      console.log('Selected ID:', selectedSupplier.ID);
      console.log('Selected Description:', selectedSupplier.DESCRIPTION);
    }

    // this.selectedBeneficiaryCommonName = selectedSupplier.DESCRIPTION;
    // console.log(this.selectedSupplierName,'======supplier name========')

  }

  onToDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_To_date = this.formatDate(rawDate);
    console.log('Formatted Date:', this.formatted_To_date); // example: "2025-04-01"
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
      NAME: 'SUPPLIER'
    }
    this.dataservice.Supplier_Dropdown(payload).subscribe((res: any) => {
      console.log('supplier dropdown', res);
      this.Supplier = res;
    });
  }

  //   onViewClick(e: any) {
  //   console.log(e, '=======event==========');
  //   //  const TRANS_TYPE_ID = e.row.data.TRANS_TYPE_ID;
  //   const trans_id = e.row.data.TRANS_ID;


  //     this.dataservice
  //       .selectPurchaseInvoice(trans_id)
  //       .subscribe((response: any) => {
  //         this.selectedInvoice = response.Data;

  //         this.isEditInvoice = true;
  //         this.cdr.detectChanges();
  //         console.log(
  //           this.selectedInvoice,
  //           'SELECTEDJOURNALVOUCHERRRRRRRRRRRR'
  //         );
  //       });
  // // this.isEditInvoiceReadOnly = transStatus === 'Approved';


  //   }

  onViewClick(e: any) {
    console.log(e, 'event');
    this.PurchId = e.row.data.PURCH_ID
    this.SuppId = e.row.data.SUPP_ID
    console.log(this.PurchId);
    sessionStorage.removeItem('PURCHID')
    sessionStorage.removeItem('SUPPID')

    sessionStorage.setItem('PURCHID', (this.PurchId));
    console.log(sessionStorage.getItem('PURCHID'));

    sessionStorage.setItem('SUPPID', (this.SuppId));
    console.log(sessionStorage.getItem('SUPPID'));


    // Navigate to ledger-statement route
    this.router.navigate(['/aged-payable-details']);
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData, '=================session data==========')

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id, '============selected_Company_id==============')

    const sessionYear = sessionData.FINANCIAL_YEARS
    console.log(sessionYear, '==================session year==========')
    const financialYeaDate = sessionYear[0].DATE_FROM
    console.log(financialYeaDate, '=========================date=[[[[[[[[[[[[[[[[[[[[[[[[[[')
    // this.formatted_from_date=financialYeaDate

  }

  get_sessionstorage_data() {
    this.savedUserData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.savedUserData)
    this.company_list = this.savedUserData.Companies

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

    this.AgedPayableReport = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.AgedPayable_Report_Api(payload).subscribe({
            next: (res: any) => {
              const list = res.data || [];

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
              resolve([]);
            },
          });
        }),
    });
  }

  handleClose() {
    this.isEditInvoice = false;
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
    EditPurchaseInvoiceModule,
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [AgedPayablesComponent,],
})
export class AgedPayablesModule { }