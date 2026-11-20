import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
  DxTextBoxModule,
  DxCheckBoxModule,
  DxRadioGroupModule,
  DxFileUploaderModule,
  DxDataGridModule,
  DxButtonModule,
  DxValidatorModule,
  DxProgressBarModule,
  DxPopupModule,
  DxDropDownBoxModule,
  DxToolbarModule,
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
  DxValidationGroupModule,
  DxAutocompleteModule,
  DxTagBoxModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import { DataService } from 'src/app/services';
import { ViewInvoiceModule } from '../../INVOICE/view-invoice/view-invoice.component';
import { Router } from '@angular/router';
import notify from 'devextreme/ui/notify';
import DataSource from 'devextreme/data/data_source';
import { ShiftMasterEditModule } from '../shift-master-edit/shift-master-edit.component';
import { ShiftMasterAddModule } from '../shift-master-add/shift-master-add.component';


@Component({
  selector: 'app-shift-master',
  templateUrl: './shift-master.component.html',
  styleUrls: ['./shift-master.component.scss']
})
export class ShiftMasterComponent {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid!: DxDataGridComponent;

  shift_datasource: any[] = [];
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  formatted_from_date: string;
  formatted_To_date: string;
  defaultDate: Date = new Date();
  loadingInvoice = false;
  isFilterRowVisible: boolean = false;

  isViewDebitNote: boolean = false;
  isViewCreditNote: boolean = false;
  isViewInvoice: boolean = false;
  isViewReceipt: boolean = false;
  editMiscPopup: boolean = false;
  isViewPayment: boolean = false;
  selectedJournalVoucher: any;
  selectedDebitNote: any;
  selectedCreditNote: any;
  selectedInvoice: any;
  selectedReceipt: any;
  selected_Company_id: any;
  isEditInvoice: boolean = false;
  isEditInvoiceReadOnly: boolean = true;
  editPrePaymentPopupOpened: boolean = false;
  isReadOnlyPayment: boolean = true;
  isEditReceipt: boolean = false;
  isReadOnlyReceipt: boolean = true;
  editMiscPopupOpened: boolean = false;
  isReadOnlyPurchaseReturn: boolean = true;
  isEditPurchaseReturn: boolean = false;
  selectedmiscellaneousData: any;
  selectedPrePayment: any;
  selectedSupplierPayment: any;
  selectedPurchaseReturn: any;
  selectedMiscPayment: any;
  selecte_prepayment_Data: any;
  isEditPopupPrepaymentPosting: boolean = false;
  selectedTrOut: any;
  isEditTransferOut: boolean = false;
  isReadOnlyTrOut: boolean = true;
  selectedTrIn: any;
  isEditTransferIn: boolean = false;
  isReadOnlyTrIn: boolean = true;
  isEditCustomerReceipt: boolean = false;
  editLedgerPopup: boolean = false;
  isViewJournalVoucher: boolean = false;
  isEditReadOnly: boolean = true;
  selected_fin_id: any;
  fin_id: any;
  savedUserData: any;
  selected_from_date: any;
  selected_To_date: any;
  popupReady = false;
  ledgerSummaryData: any = [];

  selectedYear: number | null = null;
  years: number[] = [];
  monthDataSource: { name: string; value: any }[];
  selectedmonth: any = '';
  isSummaryVisible = true;
  auto: string = 'auto';

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  isReadOnly: boolean = false;
  isAddPopupVisible = false;
  isEditPopupVisible = false;
  selectedShift: any = {};


  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.sesstion_Details();
    this.get_fin_id();

    //============Year field dataSource===============
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2015; year--) {
      this.years.push(year);
    }
    this.selectedYear = currentYear;
    //============Month field dataSource===============
    this.monthDataSource = this.dataService.getMonths();
  }


  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilterRow(),
  };

  toggleFilterRow = () => {
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
      this.load_shift_data();
    }
  }


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

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addShift());
    },
    elementAttr: { class: 'add-button' },

    template: () => {
      return `
       <div class="add-btn-content">
         <span class="iconify"
               data-icon="formkit:add"
               data-width="20"
               data-height="20"></span>
         <span class="add-text">New</span>
       </div>
     `;
    },
  };

  addShift() {
    this.isAddPopupVisible = true;
  }

  ngOnInit() {
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
      this.isReadOnly = packingRights.Readonly === true;
    }

    this.ledgerSummaryData = this.shift_datasource;
    this.onFromDateChange({ value: this.defaultDate });
    this.onToDateChange({ value: this.defaultDate });

    const today = new Date();
    this.selectedmonth = today.getMonth();
    const SystemDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    this.selected_from_date = SystemDate;
    this.selected_To_date = SystemDate;
    this.load_shift_data();
  }
  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
  }

  //================ Year value change ===================
  onYearChanged(e: any): void {
    this.selectedYear = e.value;
    this.selectedmonth = '';
    const currentYear = new Date().getFullYear();
    const today = new Date();
    if (this.selectedYear === currentYear) {
      // Set from date to the start of the year and to date to today
      this.selected_from_date = new Date(this.selectedYear, 0, 1); // January 1 of the current year
      this.selected_To_date = today; // Today's date
    } else {
      this.selected_from_date = new Date(this.selectedYear, 0, 1); // January 1
      this.selected_To_date = new Date(this.selectedYear, 11, 31); // December 31
    }
  }

  //================Month value change ===================
  onMonthValueChanged(e: any) {
    this.selectedmonth = e.value ?? '';
    if (this.selectedmonth === '') {
      this.selected_from_date = new Date(this.selectedYear, 0, 1); // January 1 of the selected year
      this.selected_To_date = new Date(this.selectedYear, 11, 31); // December 31 of the selected year
    } else {
      this.selected_from_date = new Date(
        this.selectedYear,
        this.selectedmonth,
        1,
      );
      this.selected_To_date = new Date(
        this.selectedYear,
        this.selectedmonth + 1,
        0,
      );
    }
  }

  get_fin_id() {
    this.fin_id = this.savedUserData?.FINANCIAL_YEARS || [];
    if (this.fin_id.length) {
      this.selected_fin_id = this.fin_id[0].FIN_ID;
    }
    console.log(this.selected_fin_id, '========financial year');
  }

  onExporting(event: any) {
    const fileName = 'AbsentList';
    this.dataService.exportDataGridReport(event, fileName);
  }

  onFromDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_from_date = this.formatDate(rawDate);
  }

  onToDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_To_date = this.formatDate(rawDate);
  }

  formatDates(cellData: any): string {
    const date = new Date(cellData);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }



  onEditShift(e: any) {
    e.cancel = true;

    const shiftId = e.data.ID;

    console.log('Selected Shift ID:', shiftId);

    this.dataService.SelectShiftMasterReport(shiftId).subscribe({
      next: (response: any) => {

        console.log('API Response:', response);

        if (response?.Data?.length > 0) {

          const data = response.Data[0];

          this.selectedShift = {
            ...data,
            // TIME_START: new Date(data.TIME_START),
            // TIME_END: new Date(data.TIME_END),
            // ENTRY_VALID_FROM: new Date(data.ENTRY_VALID_FROM),
            // ENTRY_VALID_TO: new Date(data.ENTRY_VALID_TO)
          };

          console.log('Selected Shift Data:', this.selectedShift);

          this.isEditPopupVisible = true;

        } else {
          notify('Shift details not found', 'warning', 3000);
        }
      },
      error: (error: any) => {
        console.error('API Error:', error);
        notify('Unable to load shift details', 'error', 3000);
      }
    });
  }


  onDeleteShift(e: any) {
    const shiftId = e.data.ID;

    // Optionally prevent the default delete behavior
    e.cancel = true;
    // Call your delete API
    this.dataService.DeleteShiftMasterReport(shiftId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Shift deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.load_shift_data();
          // this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not deleted',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
        // or whatever method you use to refresh `employeeList`
      },
      (error) => {
        console.error('Error deleting employee:', error);
      },
    );
  }


  handleClose() {
    this.editLedgerPopup = false;
    this.isViewJournalVoucher = false;
    this.isViewDebitNote = false;
    this.isViewCreditNote = false;
    this.isViewInvoice = false;
    this.isViewReceipt = false;
    this.isEditInvoice = false;
    this.editMiscPopup = false;
  }

  summaryColumnsData = {
    totalItems: [
      // 1. Total Debitṅ
      {
        name: 'totalDr',
        column: 'INVOICE_AMOUNT',
        summaryType: 'sum',
        displayFormat: 'Total {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'INVOICE_AMOUNT',
        alignment: 'right',
      },
      // 2. Total Credit
      {
        name: 'totalCr',
        column: 'TAXABLE_AMOUNT',
        summaryType: 'sum',
        displayFormat: 'Total {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'CreditAmount',
        alignment: 'right',
      },
    ],
    groupItems: [
      {
        column: 'INVOICE_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'TAXABLE_AMOUNT',
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


  load_shift_data() {
    const payload = {
      COMPANY_ID: this.selected_Company_id
    };

    this.dataService.ShiftMasterReport(payload).subscribe({
      next: (res: any) => {
        console.log('API Response:', res);

        this.shift_datasource = res?.Data || [];

        console.log('Grid Data:', this.shift_datasource);
      },
      error: (err) => {
        console.error('Absent List API Error:', err);
        this.shift_datasource = [];
      }
    });
  }

  onShiftSaved(payload: any) {
    console.log('Received Shift Payload:', payload);

    // Call your Shift Master Save API here.

    // After successful API response:
    this.isAddPopupVisible = false;
    this.isEditPopupVisible = false;
    this.load_shift_data();
  }

  closeShiftPopup() {
    this.isAddPopupVisible = false;
    this.isEditPopupVisible = false;
  }

}
@NgModule({
  imports: [
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,

    DxCheckBoxModule,
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,

    DxNumberBoxModule,
    DxValidationGroupModule,
    DxAutocompleteModule,
    DxTagBoxModule,
    ViewInvoiceModule,
    ShiftMasterAddModule,
    ShiftMasterEditModule,
  ],
  providers: [],
  declarations: [ShiftMasterComponent],
  exports: [ShiftMasterComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ShiftMasterModule { }