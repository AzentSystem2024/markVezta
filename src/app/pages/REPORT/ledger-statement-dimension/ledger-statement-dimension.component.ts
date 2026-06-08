import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FormBuilder, FormsModule } from '@angular/forms';
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
  DxValidationGroupComponent,
} from 'devextreme-angular';

import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';

import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { ViewDebitModule } from '../../DEBIT/view-debit/view-debit.component';
import { ViewCreditNoteModule } from '../../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { ViewInvoiceModule } from '../../INVOICE/view-invoice/view-invoice.component';
import { ViewCustomerReceiptModule } from '../../CUSTOMER-RECEIPTS/view-customer-receipt/view-customer-receipt.component';
import { EditSupplierPaymentModule } from '../../SUPPLIER-PAYMENT/edit-supplier-payment/edit-supplier-payment.component';
import { AddMiscReceiptModule } from 'src/app/components/HR/Masters/MISC-RECEIPT/add-misc-receipt/add-misc-receipt.component';
import { DepreciationEditModule } from '../../Depreciation/depreciation-edit/depreciation-edit.component';
import { PrePaymentEditModule } from '../../PRE_PAYMENT (1)/PRE_PAYMENT/pre-payment-edit/pre-payment-edit.component';
import { AddMiscellaneousPaymentModule } from 'src/app/components/HR/Masters/add-miscellaneous-payment/add-miscellaneous-payment.component';
import { AddSalaryPaymentModule } from 'src/app/components/HR/Masters/SALARY-PAYMENT/add-salary-payment/add-salary-payment.component';
import { ViewSalaryAdvanceModule } from 'src/app/components/HR/Masters/view-salary-advance/view-salary-advance.component';
import { EditPurchaseInvoiceModule } from '../../PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';
import { PurchaseReturnDebitFormModule } from '../../purchase-return-debit-form/purchase-return-debit-form.component';
import { TransferOutInventoryAddModule } from '../../transfer-out-inventory-add/transfer-out-inventory-add.component';
import { TransferInInventoryFormModule } from '../../transfer-in-inventory-form/transfer-in-inventory-form.component';
import { EditCustomerReceiptModule } from '../../CUSTOMER-RECEIPTS/edit-customer-receipt/edit-customer-receipt.component';
import DataSource from 'devextreme/data/data_source';
import { SaleReturnFormModule } from 'src/app/sale-return-form/sale-return-form.component';
import { ProductionJvViewModule } from 'src/app/production-jv-view/production-jv-view.component';
import { MiscSalesInvoiceFormModule } from '../../OPERATIONS/POPUP PAGES/misc-sales-invoice-form/misc-sales-invoice-form.component';
import { PayrollViewModule } from 'src/app/components/HR/Masters/payroll-view/payroll-view.component';

@Component({
  selector: 'app-ledger-statement-dimension',
  templateUrl: './ledger-statement-dimension.component.html',
  styleUrls: ['./ledger-statement-dimension.component.scss']
})
export class LedgerStatementDimensionComponent {

   @ViewChild('formValidationGroup', { static: false })
    formValidationGroup!: DxValidationGroupComponent;
  
    Ledger_statement_datasource: DataSource;
    isEditJournalVoucher: boolean = false;
    isViewJournalVoucher: boolean = false;
    isViewDebitNote: boolean = false;
    company_list: any[] = [];
    selectedCompanyId: any;
    company_id: any;
    HEAD_ID_LIST: any[] = [];
    fin_id: any[] = [];
    ledgerSummaryData: any = [];
    savedUserData: any;
    selected_from_date: any;
    selected_To_date: any;
    selected_Head_Id: any;
    selected_fin_id: any;
    selectedJournalVoucher: any;
    formatted_from_date: any;
    formatted_To_date: any;
    editLedgerPopup: boolean = false;
    selectedDebitNote: any;
    isViewCreditNote: boolean = false;
    selectedCreditNote: any;
    isViewInvoice: boolean = false;
    selectedInvoice: any;
    isViewReceipt: boolean = false;
    selectedReceipt: any;
    selected_Company_id: any;
    isReadOnlyReceipt: boolean = true;
    isEditReceipt: boolean = false;
    isReadOnlyPayment: boolean = true;
    selectedmiscellaneousData: any;
    editMiscPopupOpened: boolean = false;
    Selected_Depreciation_data: any;
    EditDepreciationPopupVisible: boolean = false;
    editPrePaymentPopupOpened: boolean = false;
    viewPayrollPopupOpened: boolean = false;
    selectedSalaryData: any;
    editSalaryPopup: boolean = false;
    selectedPrePayment: any;
    isEditReadOnly: boolean = true;
    selected_Data: any;
    isEditPopUp: boolean = false;
    loadingInvoice = false;
    popupReady = false;
    editMiscPopup: boolean = false;
    isEditInvoice: boolean = false;
    isEditInvoiceReadOnly: boolean = true;
    isEditPurchaseReturn: boolean = false;
    selectedPurchaseReturn: any;
    isReadOnlyPurchaseReturn: boolean = true;
    selectedTrOut: any;
    selectedTrIn: any;
    selectedSaleReturn: any;
    isEditTransferOut: boolean = false;
    isEditTransferIn: boolean = false;
    isReadOnlyTrOut: boolean = true;
    isReadOnlyTrIn: boolean = true;
    isReadOnlySaleReturn: boolean = true;
    isEditCustomerReceipt: boolean = false;
    isEditSaleReturn: boolean = false;
    ledgerRowCount = 0;
    selectedYear: number | null = null;
    years: number[] = [];
    monthDataSource: { name: string; value: any }[];
    selectedmonth: any = '';
    transtypeId: any;
    isViewBoxProduction: boolean;
    selectedProduction: any;
    isViewProduction: boolean;
    isMiscViewInvoice: boolean = false;
    selectedPayroll: any;
    Store: any;
    selectedStoreid: any;
      storeHint: string = '';
      readonly allowedPageSizes: any = [5, 10, 'all'];
    displayMode: any = 'full';

     Diamensions: any[] = [];
      selectedDiamensions: number[] = [2];
      isFilterVisible = true;
       dimensionPopupVisible: boolean = false;
       dimensionPopupData: any[] = [];

toggleFiltersPanel() {
  this.isFilterVisible = !this.isFilterVisible;
}

searchButtonOptions = {
  icon: 'search',
  hint: 'Show / Hide Filters',
  onClick: () => {
    this.toggleFiltersPanel();
  }
};

refreshButtonOptions = {
  icon: 'refresh',
  hint: 'Refresh',
  onClick: () => {
    this.load_Ledgre_data();
  }
};
  
    constructor(
      private dataService: DataService,
      private router: Router,
      private cdr: ChangeDetectorRef,
      private ngZone: NgZone,
    ) {
      // this.resetPopups();
  
      // Detect when component is revisited
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event) => {
          if (this.router.url.includes('ledger-statement')) {
            this.loadLedgerData();
          }
        });
  
      //============Year field dataSource===============
      const currentYear = new Date().getFullYear();
      for (let year = currentYear; year >= 2015; year--) {
        this.years.push(year);
      }
      this.selectedYear = currentYear;
      //============Month field dataSource===============
      this.monthDataSource = this.dataService.getMonths();
    }
  
    ngOnInit() {
      console.log('ledgerstatementttttttttttttttttttttt');
      const today = new Date();
      const SystemDate =
        today.getFullYear() +
        '-' +
        String(today.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(today.getDate()).padStart(2, '0');
  
      this.selected_from_date = SystemDate;
      this.selected_To_date = SystemDate;
      this.get_sessionstorage_data();
      this.get_fin_id();
      this.sesstion_Details();
      this.store_dropdown();
      this.Diamension_dropdown();

      const userDataString = localStorage.getItem('userData');
  
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const selectedCompany = userData?.SELECTED_COMPANY;
  
        this.selected_Company_id = selectedCompany?.COMPANY_ID;
  
        console.log(this.selected_Company_id, 'SELECTED COMPANY ID');
  
        //  CALL API HERE AFTER VALUE IS SET
        this.loadHeadList();
      }
  
      setTimeout(() => {
        this.popupReady = false;
        this.cdr.detectChanges();
      });
  
      this.loadLedgerData();
  
  
    }
  
    loadHeadList() {
      this.dataService
        .HeadId_Dropdown_api(this.selected_Company_id)
        .subscribe((res: any) => {
          console.log('HEAD API RESPONSE', res);
  
          this.HEAD_ID_LIST = res?.LEDGER_HEADS || [];
        });
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
   
    getSessionData(key: string) {
      const data = sessionStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  
    createLedgerDataSource(payload: any) {
      console.log('testingssssssss+++++++++++++++++++++++++');
      this.Ledger_statement_datasource = new DataSource({
        load: () =>
          new Promise((resolve, reject) => {
            this.dataService.LedgerStatement_Dimension(payload).subscribe({
              next: (res: any) => {
                const data = res?.data || [];
  
                this.ledgerSummaryData = data;
                this.ledgerRowCount = data.length; //  store length
  
                resolve(data);
              },
              error: () => {
                this.ledgerRowCount = 0;
                resolve([]);
              },
            });
          }),
      });
    }
  
    loadLedgerData() {
      const sessiondata = this.getSessionData('viewclickvalue');
      const headid = this.getSessionData('HEADID');
  
      const payload = {
        COMPANY_ID: Number(sessiondata.companyId),
        FIN_ID: Number(sessiondata.finId),
        HEAD_ID: headid,
        DATE_FROM: sessiondata.dateFrom,
        DATE_TO: sessiondata.dateTo,
        STORE_ID: this.selectedStoreid?.length
          ? this.selectedStoreid.join(',') // FINAL FIX
          : '',
         DIMENSION_CODE: this.selectedDiamensions?.length
  ? this.selectedDiamensions.join(',')
  : ''
      };
  
      console.log(payload, '=========payload=========');
  
      this.selectedCompanyId = payload.COMPANY_ID;
      this.selected_Head_Id = payload.HEAD_ID;
      this.selected_from_date = payload.DATE_FROM;
      this.selected_To_date = payload.DATE_TO;
      this.selectedStoreid = payload.STORE_ID;
      this.selectedDiamensions = payload.DIMENSION_CODE
  ? payload.DIMENSION_CODE.split(',').map(Number)
  : [];
  
      // use your existing datasource creator
      this.createLedgerDataSource(payload);
  
      this.cdr.detectChanges();
    }
  
    get_sessionstorage_data() {
      this.savedUserData = this.getSessionData('savedUserData');
      if (this.savedUserData) {
        this.company_list = this.savedUserData.Companies || [];
      }
    }
  
    get_fin_id() {
      this.fin_id = this.savedUserData?.FINANCIAL_YEARS || [];
      if (this.fin_id.length) {
        this.selected_fin_id = this.fin_id[0].FIN_ID;
      }
    }
  
    onCompanyChange(event: any) {
      this.company_id = event.value;
  
      this.dataService
        .HeadId_Dropdown_api(this.selected_Company_id)
        .subscribe((res: any) => {
          this.HEAD_ID_LIST = res;
          console.log('===============ledger=========', res);
        });
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
  
    onHeadIdChange(event: any) {
      // Optional: Update sessionStorage if needed
    }
  
    sesstion_Details() {
      const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
  
      this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  
      this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
    }
  
    load_Ledgre_data() {
     
      //  Validate main form
      const validationResult = this.formValidationGroup?.instance?.validate();
      if (!validationResult?.isValid) {
        return;
      }

      const payload = {
        COMPANY_ID: this.selected_Company_id,
        FIN_ID: this.selected_fin_id,
        HEAD_ID: this.selected_Head_Id,
        DATE_FROM: this.formatted_from_date ?? this.selected_from_date,
        DATE_TO: this.formatted_To_date ?? this.selected_To_date,
        STORE_ID: this.selectedStoreid?.length
          ? this.selectedStoreid.join(',') //  FINAL FIX
          : '',
           DIMENSION_CODE: this.selectedDiamensions?.length
  ? this.selectedDiamensions.join(',')
  : ''
      };
  console.log(payload)
      this.createLedgerDataSource(payload);
      this.isFilterVisible = false;
    }
  
    formatDates(cellData: any): string {
      const date = new Date(cellData);
      if (isNaN(date.getTime())) return '';
  
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
  
      return `${day}-${month}-${year}`;
    }
  
    handleClose() {
      this.editLedgerPopup = false;
      this.editLedgerPopup = false;
      this.isViewJournalVoucher = false;
      this.isViewDebitNote = false;
      this.isViewCreditNote = false;
      this.isViewInvoice = false;
      this.isViewReceipt = false;
      this.isViewProduction = false;
    }
  
    onViewClick(e: any) {
      console.log(e);
      const TRANS_TYPE_ID = e.row.data.TRANS_TYPE_ID;
  
      const trans_id = e.row.data.TRANS_ID;
      this.selectedInvoice = null;
      this.loadingInvoice = true;
      this.popupReady = false;
      //  this.isViewInvoice= true;
  
      if (TRANS_TYPE_ID == 4) {
        this.dataService
          .selectJournalVoucher(trans_id)
          .subscribe((response: any) => {
            this.selectedJournalVoucher = response.Data;
  
            this.isViewJournalVoucher = true;
            this.cdr.detectChanges();
          });
      } else if (TRANS_TYPE_ID === 36) {
        this.dataService.selectDebitNote(trans_id).subscribe((response: any) => {
          this.selectedDebitNote = response.Data;
          this.isViewDebitNote = true;
          this.cdr.detectChanges();
          console.log(this.selectedDebitNote, 'selected debit note');
        });
      } else if (TRANS_TYPE_ID === 37) {
        this.dataService.selectCreditNote(trans_id).subscribe((response: any) => {
          this.selectedCreditNote = response.Data;
          this.isViewCreditNote = true;
          this.cdr.detectChanges();
        });
      } else if (TRANS_TYPE_ID === 25) {
        this.dataService.selectInvoice(trans_id).subscribe((response: any) => {
          this.selectedInvoice = response.Data;
          this.loadingInvoice = false;
  
          // this.isEditInvoice = true;
  
          this.isViewInvoice = true;
          this.cdr.detectChanges();
        });
      } else if (TRANS_TYPE_ID == 19) {
        this.dataService
          .selectPurchaseInvoice(trans_id)
          .subscribe((response: any) => {
            this.selectedInvoice = response.Data;
            this.loadingInvoice = false;
  
            this.isEditInvoice = true;
            this.cdr.detectChanges();
          });
      } else if (TRANS_TYPE_ID === 20) {
        this.dataService
          .selectPurchaseReturn(trans_id)
          .subscribe((response: any) => {
            this.selectedPurchaseReturn = response;
            this.isEditPurchaseReturn = true;
  
            this.cdr.detectChanges();
            console.log(
              this.selectedPurchaseReturn,
              'SELECTEDJOURNALVOUCHERRRRRRRRRRRR',
            );
          });
      } else if (TRANS_TYPE_ID === 14) {
        this.dataService
          .selectTransferOutForInventory(trans_id)
          .subscribe((response: any) => {
            this.selectedTrOut = response;
            console.log(this.selectedTrOut);
            this.isEditTransferOut = true;
  
            this.cdr.detectChanges();
            console.log(this.selectedTrOut, 'SELECTEDJOURNALVOUCHERRRRRRRRRRRR');
          });
      } else if (TRANS_TYPE_ID === 15) {
        this.dataService
          .selectTransferInForInventory(trans_id)
          .subscribe((response: any) => {
            this.selectedTrIn = response;
            this.loadingInvoice = false;
  
            this.isEditTransferIn = true;
            this.cdr.detectChanges();
            console.log(this.selectedTrIn, 'SELECTEDJOURNALVOUCHERRRRRRRRRRRR');
          });
      } else if (TRANS_TYPE_ID === 27) {
        this.dataService
          .selectCustomerReceipt(trans_id)
          .subscribe((response: any) => {
            this.selectedReceipt = response.Data;
            this.isEditCustomerReceipt = true;
            this.cdr.detectChanges();
          });
      } else if (TRANS_TYPE_ID === 3) {
        console.log('=====navigate to 2 mis payament=====');
        this.dataService
          .selectMiscPayment(trans_id)
          .subscribe((response: any) => {
            this.selectedmiscellaneousData = response;
            this.editMiscPopupOpened = true;
            this.cdr.detectChanges();
          });
      } else if (TRANS_TYPE_ID === 9) {
        console.log('=====navigate to 2 mis payament=====');
        this.dataService
          .select_Depreciation_Asset(trans_id)
          .subscribe((response: any) => {
            this.Selected_Depreciation_data = response.Data;
            this.EditDepreciationPopupVisible = true;
            this.cdr.detectChanges();
            console.log(
              this.Selected_Depreciation_data,
              'Selected_Depreciation_data=====',
            );
          });
      } else if (TRANS_TYPE_ID === 38) {
        console.log('=====navigate to 2 mis payament=====');
        this.dataService
          .Select_PrePayment(trans_id)
          .subscribe((response: any) => {
            this.selectedPrePayment = response.Data;
            this.editPrePaymentPopupOpened = true;
            this.cdr.detectChanges();
            console.log(
              this.Selected_Depreciation_data,
              'Selected_Depreciation_data=====',
            );
          });
      } else if (TRANS_TYPE_ID === 30) {
        this.dataService
          .selectSalaryPayment(trans_id)
          .subscribe((response: any) => {
            this.selectedSalaryData = response.Data;
            this.editSalaryPopup = true;
            this.cdr.detectChanges();
            console.log(
              this.selectedSalaryData,
              'Selected_Depreciation_data=====',
            );
          });
      } else if (TRANS_TYPE_ID === 21) {
        this.isEditReceipt = true;
  
        this.dataService
          .selectSupplierPayment(trans_id)
          .subscribe((response: any) => {
            this.selectedReceipt = response.Data;
            console.log(this.selectedReceipt, 'Selected data');
  
            this.cdr.detectChanges();
          });
      } else if (TRANS_TYPE_ID === 2) {
        this.dataService
          .selectMiscReceipt(trans_id)
          .subscribe((response: any) => {
            this.selectedmiscellaneousData = response.Data;
            this.editMiscPopup = true;
            this.cdr.detectChanges();
            console.log(
              this.selectedmiscellaneousData,
              'SELECTEDJOURNALVOUCHERRRRRRRRRRRR',
            );
          });
      } else if (TRANS_TYPE_ID === 28) {
        this.dataService.select_Advance(trans_id).subscribe((response: any) => {
          this.selected_Data = response;
          this.isEditPopUp = true;
          this.cdr.detectChanges();
        });
      } else if (TRANS_TYPE_ID === 1) {
        this.dataService
          .selectOpeningBalance(trans_id)
          .subscribe((response: any) => {
            this.selected_Data = response;
            this.isEditPopUp = true;
            this.cdr.detectChanges();
          });
      } else if (TRANS_TYPE_ID === 28) {
        this.dataService.select_Advance(trans_id).subscribe((response: any) => {
          this.selected_Data = response;
          this.isEditPopUp = true;
          this.cdr.detectChanges();
          console.log(this.selectedReceipt, 'Selected_Depreciation_data=====');
        });
      } else if (TRANS_TYPE_ID === 26) {
        this.dataService.selectSaleReturn(trans_id).subscribe((response: any) => {
          this.selectedSaleReturn = response;
          this.isEditSaleReturn = true;
          this.cdr.detectChanges();
          console.log(this.selectedReceipt, 'Selected_Depreciation_data=====');
        });
      } else if (TRANS_TYPE_ID === 104) {
        this.dataService
          .selectBoxProduction(trans_id)
          .subscribe((response: any) => {
            this.selectedProduction = response;
            this.isViewProduction = true;
            this.cdr.detectChanges();
          });
      } else if (TRANS_TYPE_ID === 103) {
        this.dataService.selectProduction(trans_id).subscribe((response: any) => {
          this.selectedProduction = response;
          this.isViewProduction = true;
          this.cdr.detectChanges();
          console.log(this.selectedReceipt, 'Selected_Depreciation_data=====');
        });
      }
      else if (TRANS_TYPE_ID === 105) {
        this.dataService.getMiscSalesInvoiceByID(trans_id).subscribe((response: any) => {
          this.selectedInvoice = response;
          this.isMiscViewInvoice = true;
          this.cdr.detectChanges();
          console.log(this.selectedReceipt, 'Selected_Depreciation_data=====');
        });
      }
      else if (TRANS_TYPE_ID === 29) {
        this.dataService.viewSelectedPayroll(trans_id).subscribe((response: any) => {
          this.selectedPayroll = response;
          this.viewPayrollPopupOpened = true;
          this.cdr.detectChanges();
          console.log(this.selectedReceipt, 'Selected_Depreciation_data=====');
        });
      } else {
      }
    }
  
    isViewVisible(e: any): boolean {
      console.log(e.row.data, 'event');
      this.transtypeId = e.row.data.TRANS_TYPE_ID;
      return this.transtypeId !== 0 && this.transtypeId !== 1;
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
      this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
        this.Store = res;
      });
    }

      Diamension_dropdown() {
    const payload = {
      NAME: 'DIAMENSIONS',
    };

    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Diamensions = res || [];

      // ensure ID 2 always selected
      if (!this.selectedDiamensions.includes(2)) {
        this.selectedDiamensions = [2];
      }
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

  
    // POPUP shown → allow child to render
    onPopupShown() {
      this.popupReady = true;
      this.cdr.detectChanges();
    }
    summaryColumnsData = {
      totalItems: [
        // 1. Total Debitṅ
        {
          column: 'PARTICULARS',
          summaryType: '',
          displayFormat: ' Total',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'PARTICULARS',
          alignment: 'right',
        },
        {
          column: 'PARTICULARS',
          summaryType: '',
          displayFormat: ' Closing Balance',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'PARTICULARS',
          alignment: 'right',
        },
        {
          column: 'PARTICULARS',
          summaryType: '',
          displayFormat: ' Grand Total',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'PARTICULARS',
          alignment: 'right',
        },
        {
          name: 'totalDr',
          column: 'DR_AMOUNT',
          summaryType: 'sum',
          displayFormat: ' {0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'DR_AMOUNT',
          alignment: 'right',
        },
        // 2. Total Credit
        {
          name: 'totalCr',
          column: 'CR_AMOUNT',
          summaryType: 'sum',
          displayFormat: ' {0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'CR_AMOUNT',
          alignment: 'right',
        },
        // 3. Closing Balance (shows in Debit or Credit column based on value)
        {
          name: 'closingBalanceDr',
          summaryType: 'custom',
          displayFormat: ' {0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'DR_AMOUNT',
          alignment: 'right',
        },
        {
          name: 'closingBalanceCr',
          summaryType: 'custom',
          displayFormat: '{0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'CR_AMOUNT',
          alignment: 'right',
        },
        // 4. Grand Total (sum of totals + closing balance)
        {
          name: 'grandTotalDr',
          summaryType: 'custom',
          displayFormat: ' {0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'DR_AMOUNT',
          alignment: 'right',
        },
        {
          name: 'grandTotalCr',
          summaryType: 'custom',
          displayFormat: ' {0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'CR_AMOUNT',
          alignment: 'right',
        },
      ],
  
      calculateCustomSummary: (options: any) => {
        if (options.summaryProcess === 'finalize') {
          const items = this.ledgerSummaryData || [];
  
          const totalDr = items.reduce((sum, item) => {
            const val = parseFloat(
              String(item?.DR_AMOUNT || '0')
                .replace(/,/g, '')
                .trim(),
            );
            return sum + (isNaN(val) ? 0 : val);
          }, 0);
  
          const totalCr = items.reduce((sum, item) => {
            const val = parseFloat(
              String(item?.CR_AMOUNT || '0')
                .replace(/,/g, '')
                .trim(),
            );
            return sum + (isNaN(val) ? 0 : val);
          }, 0);
  
          const closingBalance = totalDr - totalCr;
  
          // Closing Balance
          if (options.name === 'closingBalanceCr') {
            options.totalValue = closingBalance > 0 ? closingBalance : 0;
          }
  
          if (options.name === 'closingBalanceDr') {
            options.totalValue =
              closingBalance < 0 ? Math.abs(closingBalance) : 0;
          }
  
          // Grand Total
          if (options.name === 'grandTotalCr') {
            options.totalValue =
              totalCr + (closingBalance > 0 ? closingBalance : 0);
          }
          if (options.name === 'grandTotalDr') {
            options.totalValue =
              totalDr + (closingBalance < 0 ? Math.abs(closingBalance) : 0);
          }
        }
      },
    };
  
    onExporting(event: any) {
      const fileName = 'Ledger Statement Report';
      this.dataService.exportDataGridReport(event, fileName);
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
    FormTextboxModule,
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
    FormsModule,
    DxNumberBoxModule,
    DxValidationGroupModule,
    DxAutocompleteModule,
    DxTagBoxModule,
    EditJournalVoucherModule,
    ViewJournalVoucherModule,
    ViewDebitModule,
    ViewCreditNoteModule,
    ViewInvoiceModule,
    ViewCustomerReceiptModule,
    EditCustomerReceiptModule,
    EditSupplierPaymentModule,
    AddMiscReceiptModule,
    DepreciationEditModule,
    PrePaymentEditModule,
    AddMiscellaneousPaymentModule,
    AddSalaryPaymentModule,
    ViewSalaryAdvanceModule,
    AddMiscReceiptModule,
    EditPurchaseInvoiceModule,
    PurchaseReturnDebitFormModule,
    TransferOutInventoryAddModule,
    TransferInInventoryFormModule,
    SaleReturnFormModule,
    ProductionJvViewModule,
    MiscSalesInvoiceFormModule,

  ],
  providers: [],
  declarations: [LedgerStatementDimensionComponent],
  exports: [LedgerStatementDimensionComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LedgerStatementDimensionModule { }
