import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
} from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxAutocompleteModule,
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxProgressBarModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTabPanelModule,
  DxTabsModule,
  DxTagBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import {
  DxoFormItemModule,
  DxoItemModule,
  DxoLookupModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { EditJournalVoucherModule } from '../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { ViewDebitModule } from '../DEBIT/view-debit/view-debit.component';
import { ViewCreditNoteModule } from '../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { ViewInvoiceModule } from '../INVOICE/view-invoice/view-invoice.component';
import { ViewCustomerReceiptModule } from '../CUSTOMER-RECEIPTS/view-customer-receipt/view-customer-receipt.component';
import { EditPurchaseInvoiceModule } from '../PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';
import { NavigationEnd, Router } from '@angular/router';
import { DataService } from 'src/app/services';
import { filter } from 'rxjs/operators';
import { PrePaymentEditModule } from '../PRE_PAYMENT (1)/PRE_PAYMENT/pre-payment-edit/pre-payment-edit.component';
import { EditSupplierPaymentModule } from '../SUPPLIER-PAYMENT/edit-supplier-payment/edit-supplier-payment.component';
import { AddMiscellaneousPaymentModule } from 'src/app/components/HR/Masters/add-miscellaneous-payment/add-miscellaneous-payment.component';

@Component({
  selector: 'app-input-vat',
  templateUrl: './input-vat.component.html',
  styleUrls: ['./input-vat.component.scss'],
})
export class InputVatComponent {
  InputVatReport: any[] = [];
  isFilterRowVisible: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  formatted_from_date: any;
  formatted_To_date: string;
  defaultDate: Date = new Date();
  ledgerSummaryData: any = [];
  auto: string = 'auto';
  HeadId: any;
  savedUserData: any;
  selectedInvoice: any;
  fin_id: any;
  company_id: any;
  finID: any;
  company_list: any = [];
  selected_Company_id: any;
  Supplier: any;
  selectedSupplierId: any;
  isEditInvoice: boolean = false;
  isEditInvoiceReadOnly: boolean = true;
  isEditReadOnly: boolean = false;
  SuppID: any;
  PurchID: any;
  PurchaseID: any;
  loadingInvoice = false;
  popupReady = false;
  selectedDebitNote: any;
  isViewDebitNote: boolean;
  selectedPrePayment: any;
  editPrePaymentPopupOpened: boolean = false;
  sessionData: any;
  selected_vat_id: any;
  selectedmiscellaneousData: any;
  editMiscPopupOpened: boolean = false;
  isReadOnlyPayment: boolean = true;
  financialYeaDate: string;
  Store: any;
 selectedStoreid: number[] = [1];

  constructor(
    private dataservice: DataService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.get_sessionstorage_data();
    this.sesstion_Details();
    this.get_Supplier_dropdown();
    this.store_dropdown();
  }

  ngOnInit() {
    this.onFromDateChange({ value: this.financialYeaDate });
    // initialize with today's date
    this.onToDateChange({ value: this.defaultDate });
    this.get_DataSource(); //get datasource======== function call==========
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

  handleClose() {
    this.isEditInvoice = false;
    this.editPrePaymentPopupOpened = false;
    this.editMiscPopupOpened = false;
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  get_sessionstorage_data() {
    this.savedUserData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.company_list = this.savedUserData.Companies;
  }

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = this.sessionData.SELECTED_COMPANY.COMPANY_ID;

    const sessionYear = this.sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;

    this.formatted_from_date = this.financialYeaDate;

    this.selected_vat_id = this.sessionData.VAT_ID;
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
        const hoStore = this.Store.find(
    (x: any) => x.DESCRIPTION === 'HO_STORE'
  );

  if (hoStore) {
    this.selectedStoreid = [hoStore.ID];
  }
      });
    }

  onSupplierChanged(event: any) {
    this.selectedSupplierId = event.value;

    // Find and log the selected supplier's DESCRIPTION
    const selectedSupplier = this.Supplier.find(
      (item: any) => item.ID === this.selectedSupplierId,
    );
    if (selectedSupplier) {
    }

    // this.selectedBeneficiaryCommonName = selectedSupplier.DESCRIPTION;
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

  onExporting(event: any) {
    const fileName = 'InputVatReport';
    this.dataservice.exportDataGridReport(event, fileName);
  }

  onRowPrepared(e) {
    if (e.rowType === 'data' && e.data.isSummary) {
      e.rowElement.style.fontWeight = 'bold';
      // e.rowElement.style.backgroundColor = '#f0f0f0';
    }
  }

  onPopupShown() {
    this.popupReady = true;
    this.cdr.detectChanges();
  }

  onViewClick(e: any) {
    const trans_id = e.row.data.TRANS_ID;
    const TRANS_TYPE = e.row.data.DOC_TYPE;

    this.selectedInvoice = null;
    this.loadingInvoice = true;
    this.popupReady = false;

    if (TRANS_TYPE == 19) {
      this.dataservice
        .selectPurchaseInvoice(trans_id)
        .subscribe((response: any) => {
          this.selectedInvoice = response.Data;
          this.loadingInvoice = false;

          this.isEditInvoice = true;
          this.cdr.detectChanges();
        });
    } else if (TRANS_TYPE == 38) {
      this.dataservice.Select_PrePayment(trans_id).subscribe((res: any) => {
        // Store original string if needed
        this.selectedPrePayment = res.Data;
        this.editPrePaymentPopupOpened = true;
        this.cdr.detectChanges();
      });
    }
    //     else if(TRANS_TYPE == 21){
    //            this.dataService.selectSupplierPayment(trans_id).subscribe((response: any) => {
    //   this.selectedReceipt = response.Data;

    //   // Set a flag to determine if the form should be read-only
    //   this.isEditReceipt = true;
    //   this.cdr.detectChanges();

    //   // Navigate to form component or open the form popup (depending on your app)
    // });
    //     }
    else if (TRANS_TYPE == 36) {
      this.dataservice.selectDebitNote(trans_id).subscribe((response: any) => {
        this.selectedDebitNote = response.Data;

        // Open view popup
        this.isViewDebitNote = true;
        this.cdr.detectChanges();
      });
    } else if (TRANS_TYPE === 3) {
      this.dataservice
        .selectMiscPayment(trans_id)
        .subscribe((response: any) => {
          this.selectedmiscellaneousData = response;

          this.editMiscPopupOpened = true;
          this.cdr.detectChanges();
        });
    } else {
    }
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

  get_DataSource() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
      STORE_ID: this.selectedStoreid?.join(','),
      //  SUPP_ID: this.selectedSupplierId || 0
    };

    sessionStorage.setItem('supplierViewClick', JSON.stringify(payload));

    this.dataservice.InputVat_Report_Api(payload).subscribe((res: any) => {
      this.InputVatReport = res.Data;
    });
  }

  summaryColumnsData = {
    totalItems: [
      {
        column: 'TAXABLE_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'TAXABLE_AMOUNT',
        alignment: 'right',
      },
      {
        column: 'TAX_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'TAX_AMOUNT',
        alignment: 'right',
      },
      {
        column: 'TOTAL',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        showInColumn: 'TOTAL',
        alignment: 'left',
      },
    ],
    groupItems: [
      {
        column: 'TAXABLE_AMOUNT',
        summaryType: 'sum',
        displayFormat: '{0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'TAX_AMOUNT',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
      {
        column: 'TOTAL',
        summaryType: 'sum',
        displayFormat: ' {0}',
        valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
        alignByColumn: true,
      },
    ],
  };
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
    DxTabPanelModule,
    DxTabsModule,
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
    EditPurchaseInvoiceModule,
    PrePaymentEditModule,
    EditSupplierPaymentModule,
    ViewDebitModule,
    AddMiscellaneousPaymentModule,
  ],
  providers: [],
  declarations: [InputVatComponent],
  exports: [InputVatComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InputVatModule {}
