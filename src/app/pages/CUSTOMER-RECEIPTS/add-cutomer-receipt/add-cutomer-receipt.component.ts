import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  NgZone,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddDebitComponent } from '../../DEBIT/add-debit/add-debit.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-add-cutomer-receipt',
  templateUrl: './add-cutomer-receipt.component.html',
  styleUrls: ['./add-cutomer-receipt.component.scss'],
})
export class AddCutomerReceiptComponent {
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() canApprove: boolean = false;
  receiptNo = '';
  customerName = '';
  receiptDate = new Date();
  invoiceList = [];
  customerType: 'Unit' | 'Dealer' = 'Unit';
  paymentMode = 'Cash';
  ledgerList: any;
  selectedLedger = '11201001';
  chequeNo = '';
  dueDate = new Date();
  remarks = '';
  narration = '';
  companyList: any;
  distributorList: any;
  selectedDistributorId: any;
  selectedCompanyId: any;
  chequeDate: Date = new Date();
  bankName: string = '';
  receiptMode: string = 'Cash';
  pendingInvoiceList: any;
  showFillAmountPopup = false;
  fillAmountData = {
    field1: 0,
    field2: 0,
  };
  receiprtFormData: any = {
    TRANS_TYPE: 27,
    REC_NO: '',
    REC_DATE: new Date(),
    COMPANY_ID: 1,
    STORE_ID: 0,
    FIN_ID: 1,
    REF_NO: '',
    UNIT_ID: 1,
    DISTRIBUTOR_ID: '',
    NARRATION: '',
    PAY_TYPE_ID: '',
    PAY_HEAD_ID: '',
    ADD_TIME: '',
    NET_AMOUNT: '',
    CHEQUE_NO: '',
    CHEQUE_DATE: '',
    BANK_NAME: '',
    PARTY_NAME: '',
    IS_APPROVED: false,
    REC_DETAIL: [
      {
        BILL_ID: '',
        AMOUNT: '',
      },
    ],
  };
  totalPendingAmount: number = 0;
  amountError: string = '';
  selectedRowsCount: number = 0;
  filteredLedgerList: any[] = [];
  totalPending: any;
  selectedCustomerId: any;
  pdcList: any;
  pdcPopupVisible: boolean;
  selectedstoreId: any;
  partyName: any;
  selectedCustomer: any;
  isFillAmountValid: boolean;
  isSaving = false;
  CashID: any;
  BankID: any;
  settings: any;

  constructor(
    private dataService: DataService,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    this.sessionDetails();
    const userDataString = localStorage.getItem('userData');

    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.companyList = userData.Companies || [];
      this.selectedCompanyId = userData.SELECTED_COMPANY.COMPANY_ID;
    } else {
      console.warn('No userData found in localStorage');
    }
    Object.freeze(this.selectedCompanyId);
    this.getReceiptNo();
    this.getLedgerCodeDropdown();
    this.getCompanyListDropdown(); // only fetches distributor list
    this.getPdcofSelectedSupplier();
    this.AC_Default();
  }

  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selectedstoreId = sessionData.Configuration[0].STORE_ID;
  }

          AC_Default(){
   const payload = {
    CompanyID : this.selectedCompanyId
   }
    this.dataService.AC_Default_Settings_Api(payload).subscribe((res:any)=>{
      console.log(res)
      this.settings = res.Data
      this.CashID = this.settings.GP_CASH_ID;  
      console.log(this.CashID) 
      this.BankID = this.settings.GP_BANK_ID;
      console.log(this.BankID)
    })
  }

  
  getSlNo = (rowData: any, index?: number): number => {
    // index is not provided by default, so we calculate based on array position
    if (!this.pendingInvoiceList) return 0;

    return this.pendingInvoiceList.indexOf(rowData) + 1; // 1-based numbering
  };

  getInvoiceList() {
    if (!this.selectedCompanyId || !this.selectedDistributorId) {
      console.warn(
        'Skipping API call — missing company or distributor',
        this.selectedCompanyId,
        this.selectedDistributorId,
      );
      return;
    }
    const payload = {
      CUST_ID: this.selectedDistributorId,
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService
      .getInvoiceListForCustomerReceipt(payload)
      .subscribe((response: any) => {
        this.pendingInvoiceList = response.Data;
      });
  }

  validateReceivedAmount = (e: any) => {
    if (!e || !e.data) return true;

    const value = Number(e.value);
    const pending = Number(e.data.PENDING_AMOUNT);

    // If empty or zero, skip strict validation
    if (e.value === null || e.value === undefined || e.value === '')
      return true;

    return value <= pending;
  };

  onEditorPreparing(e: any) {
    if (e.parentType !== 'dataRow') return;

    if (e.dataField === 'RECEIVED_AMOUNT') {
      e.editorOptions = e.editorOptions || {};

      // Let the editor inherit row height naturally (no fixed height)
      e.editorOptions.elementAttr = {
        style: `
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      `,
      };

      // Make sure the input fits snugly inside
      e.editorOptions.inputAttr = {
        style: `
        height: 100%;
        padding: 0 4px;
        box-sizing: border-box;
      `,
      };

      // Remove spin buttons to prevent layout changes
      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }
    }
  }

  onGridContentReady(e: any) {
    if (e.component) {
      this.totalPendingAmount =
        e.component.getTotalSummaryValue('PENDING_AMOUNT');
    }
  }

  onCustomerChanged(event: any): void {
    const selectedId = event.value;
    this.selectedDistributorId = event.value;
    this.receiprtFormData.DISTRIBUTOR_ID = selectedId;

    this.partyName = event.value;
    if (selectedId) {
      this.selectedCustomer = this.distributorList.find(
        (s: any) => s.ID === selectedId,
      );
      this.receiprtFormData.PARTY_NAME = this.selectedCustomer.DESCRIPTION;
    }
    if (selectedId) {
      this.getInvoiceList();
    }
  }

  getCompanyListDropdown() {
    const payload = {
      // NAME: 'CUSTOMER',
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService
      .getOutsideCustomerWithState(payload)
      .subscribe((response: any) => {
        this.distributorList = response;
      });
  }

  getLedgerCodeDropdown() {
    this.dataService.getActiveLedger().subscribe({
      next: (response: any) => {
        this.ledgerList = response?.Data || []; // Fallback to empty array
        this.onReceiptModeChange({ value: this.receiptMode });
      },
      error: (err) => {
        console.error('Ledger API Error:', err); // <== CATCH ERRORS
      },
    });
  }

  onReceiptModeChange(e: any) {
    this.receiptMode = e.value;
    this.applyReceiptModeFilter();

    // ✅ Update PAY_TYPE_ID immediately
    switch (this.receiptMode) {
      case 'Cash':
        this.receiprtFormData.PAY_TYPE_ID = 1;
        break;
      case 'Bank':
        this.receiprtFormData.PAY_TYPE_ID = 2;
        break;
      case 'Adjustments':
        this.receiprtFormData.PAY_TYPE_ID = 4;
        break;
      case 'PDC':
        this.receiprtFormData.PAY_TYPE_ID = 3;
        break;
      default:
        this.receiprtFormData.PAY_TYPE_ID = 1;
    }
  }

  applyReceiptModeFilter() {
    if (this.receiptMode === 'Cash') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID === this.CashID,
      );
    } else if (this.receiptMode === 'Bank') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID === this.BankID,
      );
    } else if (this.receiptMode === 'Adjustments') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) =>
          item.GROUP_ID !== 13 &&
          item.GROUP_ID !== 14 &&
          item.GROUP_ID !== 15 &&
          item.GROUP_ID !== 41,
      );
    } else if (this.receiptMode === 'PDC') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID === this.BankID,
      );
    } else {
      this.filteredLedgerList = [...this.ledgerList]; // For 'PDC' or others
    }
  }

  getPdcofSelectedSupplier() {
    const payload = {
      CUST_ID: this.selectedDistributorId,
      LEDGER_ID: this.selectedLedger,
    };
    this.dataService.getPdcListByCustomer(payload).subscribe({
      next: (response: any) => {
        this.pdcList = response?.Data || []; // store it in a variable
      },
      error: (err) => {
        console.error('Error fetching PDC list:', err);
      },
    });
  }

  onLedgerChanged(e: any) {
    // This gives full object
    this.selectedLedger = e.value;
    if (this.receiptMode === 'PDC' && this.selectedDistributorId) {
      this.getPdcofSelectedSupplier();
    }
  }

  onSearchCheque() {
    // Show popup
    this.pdcPopupVisible = true;

    // Example: you can fetch from API based on PAY_HEAD_ID
    this.getPdcofSelectedSupplier();
  }

  onPdcSelected(e: any) {
    const selectedCheque = e.data;

    // Example: assign selected cheque to form
    this.receiprtFormData.CHEQUE_NO = selectedCheque.CHEQUE_NO;
    if (selectedCheque.DUE_DATE) {
      // Parse dd-MM-yyyy manually
      const parts = selectedCheque.DUE_DATE.split('-'); // ["27","08","2025"]
      this.receiprtFormData.CHEQUE_DATE = new Date(
        Number(parts[2]), // year
        Number(parts[1]) - 1, // month is 0-based
        Number(parts[0]), // day
      );
    } else {
      this.receiprtFormData.CHEQUE_DATE = null;
    }
    this.receiprtFormData.BANK_NAME = selectedCheque.BANK_NAME;
    this.receiprtFormData.AMOUNT = selectedCheque.AMOUNT;

    this.pdcPopupVisible = false;
  }

  onSelectionChanged(e: any) {
    this.selectedRowsCount = e.selectedRowsData.length;
  }

  onFillAmountClick() {
    const selectedRows = this.itemsGridRef.instance.getSelectedRowsData();

    if (selectedRows.length === 0) {
      notify(
        'Please select at least one row before proceeding.',
        'warning',
        3000,
      );
      return;
    }

    // Calculate total pending of selected rows
    this.totalPending = selectedRows.reduce(
      (sum: number, row: any) => sum + (Number(row.PENDING_AMOUNT) || 0),
      0,
    );

    this.showFillAmountPopup = true;
  }

  autoFillReceivedAmounts() {
    const fillAmount = Number(this.fillAmountData.field1);

    if (isNaN(fillAmount) || fillAmount <= 0) {
      notify('Please enter a valid fill amount.', 'warning', 3000);
      return;
    }

    const selectedRows =
      this.itemsGridRef?.instance?.getSelectedRowsData() || [];

    if (!selectedRows.length) {
      notify('Please select at least one row.', 'warning', 3000);
      return;
    }

    let remaining = fillAmount;

    selectedRows.forEach((row: any) => {
      const pending = Number(row.PENDING_AMOUNT) || 0;

      if (remaining <= 0) {
        row.RECEIVED_AMOUNT = 0;
        return;
      }

      if (remaining >= pending) {
        row.RECEIVED_AMOUNT = pending;
        remaining -= pending;
      } else {
        row.RECEIVED_AMOUNT = remaining;
        remaining = 0;
      }
    });

    // 🔁 refresh grid
    this.pendingInvoiceList = [...this.pendingInvoiceList];
  }

  handleCancel() {
    this.popupClosed.emit();
    this.resetFillAmountForm();
    this.showFillAmountPopup = false;
  }

  cancel() {
    this.popupClosed.emit();
  }

  resetFillAmountForm() {
    this.fillAmountData.field1 = 0;
    this.amountError = '';
  }

  validateAmount(e: any) {
    const enteredValue = Number(e.value);

    if (isNaN(enteredValue) || enteredValue <= 0) {
      this.amountError = 'Please enter a valid amount';
      this.isFillAmountValid = false;
      return;
    }

    if (enteredValue > this.totalPending) {
      this.amountError = `Entered amount cannot be greater than Total Pending Amount (${this.totalPending.toFixed(
        2,
      )})`;
      this.isFillAmountValid = false;
      return;
    }

    // ✅ valid
    this.amountError = '';
    this.isFillAmountValid = true;
  }

  submitAmountPopup() {
    if (!this.isFillAmountValid) {
      notify(
        'Please correct the entered amount before submitting.',
        'warning',
        3000,
      );
      return;
    }

    this.autoFillReceivedAmounts();
    this.resetFillAmountForm();
    this.showFillAmountPopup = false;
  }

  getReceiptNo() {
    const payload = {
      TRANS_TYPE: 27,
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.receiptNo = response.RECEIPT_NO;
      this.receiprtFormData.DOC_NO = response.DOC_NO;
    });
  }

  callAPI(finalPayload: any) {
    this.dataService.insertCustomerReceipt(finalPayload).subscribe(
      (response: any) => {
        this.isSaving = false;
        notify(
          {
            message: 'Receipt Saved Successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );

        // DO NOT REMOVE — Needed for auto-setting voucher number
        if (response?.VoucherNo) {
          this.receiprtFormData.VOUCHER_NO = response.VoucherNo;
        }

        // Reset form but keep newly assigned voucher number
        this.resetForm();

        // Close popup
        this.popupClosed.emit();
      },
      (error) => {
        this.isSaving = false;
        notify('Failed to save Credit Note. Please try again.', 'error', 2000);
        console.error('Save error:', error);
      },
    );
  }

  saveReceipt() {
    if (!this.selectedDistributorId || this.selectedDistributorId == '') {
      notify('Please select a customer', 'warning', 3000);
      return;
    }

    const selectedRows =
      this.itemsGridRef?.instance?.getSelectedRowsData() || [];
    if (selectedRows.length === 0) {
      notify(
        'Please select at least one invoice before saving.',
        'warning',
        3000,
      );
      return; // ❌ STOP SAVE
    }
    const validDetails = selectedRows
      .filter((row: any) => Number(row.RECEIVED_AMOUNT) > 0)
      .map((row: any) => ({
        BILL_ID: Number(row.BILL_ID), // ensure number
        AMOUNT: Number(row.RECEIVED_AMOUNT),
      }));

    const invalidRowIndexes: number[] = [];

    selectedRows.forEach((row: any) => {
      const rowIndex = this.pendingInvoiceList.findIndex(
        (r: any) => r.BILL_ID === row.BILL_ID,
      );

      if (!row.RECEIVED_AMOUNT || Number(row.RECEIVED_AMOUNT) <= 0) {
        invalidRowIndexes.push(rowIndex);
      }
    });

    if (invalidRowIndexes.length > 0) {
      // Repaint only invalid rows
      this.itemsGridRef.instance.repaintRows(invalidRowIndexes);

      notify(
        'Please enter Received Amount for the selected rows.',
        'warning',
        3000,
      );
      return;
    }

    switch (this.receiptMode) {
      case 'Cash':
        this.receiprtFormData.PAY_TYPE_ID = 1;
        break;
      case 'Bank':
        this.receiprtFormData.PAY_TYPE_ID = 2;
        break;
      case 'Adjustments':
        this.receiprtFormData.PAY_TYPE_ID = 4;
        break;
      case 'PDC':
        this.receiprtFormData.PAY_TYPE_ID = 3;
        break;
      default:
        this.receiprtFormData.PAY_TYPE_ID = 1; // fallback
    }
    const netAmount = validDetails.reduce(
      (sum: number, row: any) => sum + row.AMOUNT,
      0,
    );

    if (this.receiptMode === 'PDC') {
      const pdcAmount = Number(this.receiprtFormData.AMOUNT || 0); // or PDC_AMOUNT if you store separately
      if (netAmount !== pdcAmount) {
        notify(
          `PDC amount (${pdcAmount}) must equal the total received amount (${netAmount})`,
          'error',
          4000,
        );
        return;
      }
    }

    // this.receiprtFormData.PAY_TYPE_ID = 1;
    // this.receiprtFormData.PAY_TYPE_ID = this.receiprtFormData.PAY_TYPE_ID || 1;
    this.receiprtFormData.NET_AMOUNT = netAmount;
    // Build payload with only SUPP_ID and REC_DETAIL
    const today = new Date();
    const recDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');
    const payload = {
      ...this.receiprtFormData,
      REC_DATE: recDate,
      DISTRIBUTOR_ID: this.selectedDistributorId, // or whatever your selected supplier ID is
      REC_DETAIL: validDetails,
      BANK_NAME: this.receiprtFormData.BANK_NAME,
      STORE_ID: this.selectedstoreId,
      PARTY_NAME: this.receiprtFormData.PARTY_NAME,
      COMPANY_ID: this.selectedCompanyId,
    };

    // --- Save data ---
    if (this.receiprtFormData.IS_APPROVED) {
      const result = confirm(
        'A new Credit Note will be created and approved. Do you want to continue?',
        'Confirm Approval',
      );

      result.then((dialogResult: any) => {
        if (dialogResult) {
          this.ngZone.run(() => {
            this.isSaving = true;
            this.callAPI(payload);
          });
        }
      });

      return;
    }
    this.isSaving = true;
    // Normal flow (Not Approved)
    this.callAPI(payload);
  }

  resetForm() {
    this.fillAmountData = { field1: 0, field2: 0 };
    this.amountError = '';
    this.receiprtFormData = {
      TRANS_TYPE: 27,
      DOC_NO: this.getReceiptNo(),
      REC_DATE: new Date(),
      COMPANY_ID: this.selectedCompanyId,
      STORE_ID: this.selectedstoreId,
      FIN_ID: 1,
      TRANS_STATUS: 1,
      REF_NO: '',
      UNIT_ID: 1,
      DISTRIBUTOR_ID: '',
      NARRATION: '',
      PAY_TYPE_ID: '',
      PAY_HEAD_ID: '',
      ADD_TIME: '',
      NET_AMOUNT: '',
      REC_DETAIL: [{}],
      IS_APPROVED: false,
    };
    this.customerType = 'Unit';
    this.receiptMode = '';
    this.chequeNo = '';
    this.bankName = '';
    this.dueDate = null;
    this.narration = '';
    // this.selectedCompanyId = '';
    this.selectedDistributorId = '';
    this.pendingInvoiceList?.forEach((row) => (row.RECEIVED_AMOUNT = 0));
    this.pendingInvoiceList = [];
    // this.getReceiptNo();
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
    DxoSummaryModule,
    ArticleAddModule,
    ArticleEditModule,
    AddJournalVoucharModule,
    EditJournalVoucherModule,
    ViewJournalVoucherModule,
  ],
  providers: [],
  declarations: [AddCutomerReceiptComponent],
  exports: [AddCutomerReceiptComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddCutomerReceiptModule {}
