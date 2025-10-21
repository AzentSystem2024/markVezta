import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  NgModule,
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

@Component({
  selector: 'app-add-cutomer-receipt',
  templateUrl: './add-cutomer-receipt.component.html',
  styleUrls: ['./add-cutomer-receipt.component.scss'],
})
export class AddCutomerReceiptComponent {
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();

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
    STORE_ID: 1,
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
    CHEQUE_NO: '',
    CHEQUE_DATE: '',
    BANK_NAME: '',
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

  constructor(private dataService: DataService) {}

  ngOnInit() {
    const userDataString = localStorage.getItem('userData');

    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.companyList = userData.Companies || [];

      console.log('Loaded Companies:', this.companyList);
    } else {
      console.warn('No userData found in localStorage');
    }
    this.getReceiptNo();
    this.getLedgerCodeDropdown();
    this.getCompanyListDropdown(); // only fetches distributor list
    this.getPdcofSelectedSupplier();
  }

  getSlNo = (rowData: any, index?: number): number => {
    // index is not provided by default, so we calculate based on array position
    if (!this.pendingInvoiceList) return 0;

    return this.pendingInvoiceList.indexOf(rowData) + 1; // 1-based numbering
  };

  getInvoiceList() {
    const payload = {
      CUST_ID: this.selectedDistributorId,
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
      console.log('Total Pending Amount:', this.totalPendingAmount);
    }
  }

  onCustomerChanged(event: any): void {
    console.log(event, "==============='''");
    const selectedId = event.value;
    console.log(selectedId, "==============='''");
    if (selectedId) {
      this.getInvoiceList();
    }
  }

  getCompanyListDropdown() {
    console.log('CUSTOMERDROPDOWNNNNNNNNNNNNNNNNNNNNNNNNNNNN');
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.distributorList = response;
      console.log(
        this.distributorList,
        'distributorList=============================='
      );
    });
  }

  getLedgerCodeDropdown() {
    this.dataService.getAccountHeadList().subscribe({
      next: (response: any) => {
        console.log('API Response:', response); // <== LOG FULL RESPONSE
        this.ledgerList = response?.Data || []; // Fallback to empty array
        this.onReceiptModeChange({ value: this.receiptMode });
        console.log(
          'Ledger List Loaded=============================:',
          this.ledgerList
        );
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

    console.log('PAY_TYPE_ID set to:', this.receiprtFormData.PAY_TYPE_ID);
  }

  applyReceiptModeFilter() {
    console.log(
      this.filteredLedgerList,
      '{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{'
    );
    if (this.receiptMode === 'Cash') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID === 13
      );
    } else if (this.receiptMode === 'Bank') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID === 14
      );
    } else if (this.receiptMode === 'Adjustments') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) =>
          item.GROUP_ID !== 13 &&
          item.GROUP_ID !== 14 &&
          item.GROUP_ID !== 15 &&
          item.GROUP_ID !== 41
      );
    } else if (this.receiptMode === 'PDC') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID === 14
      );
      console.log(this.filteredLedgerList, 'FILTEREDLEDGERLIST');
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
        console.log(
          response,
          'PDC List Response=============================-----------'
        );
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
    console.log('Selected PAY_HEAD_ID:', this.selectedLedger);
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
    console.log('Selected Cheque:', selectedCheque);

    // Example: assign selected cheque to form
    this.receiprtFormData.CHEQUE_NO = selectedCheque.CHEQUE_NO;
    if (selectedCheque.DUE_DATE) {
      // Parse dd-MM-yyyy manually
      const parts = selectedCheque.DUE_DATE.split('-'); // ["27","08","2025"]
      this.receiprtFormData.CHEQUE_DATE = new Date(
        Number(parts[2]), // year
        Number(parts[1]) - 1, // month is 0-based
        Number(parts[0]) // day
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
        3000
      );
      return;
    }

    // Calculate total pending of selected rows
    this.totalPending = selectedRows.reduce(
      (sum: number, row: any) => sum + (Number(row.PENDING_AMOUNT) || 0),
      0
    );

    this.showFillAmountPopup = true;
  }

  autoFillReceivedAmounts() {
    this.totalPending = Number(this.fillAmountData.field1);
    console.log(this.totalPending, 'TOTALPENDING');
    if (isNaN(this.totalPending) || this.totalPending <= 0) {
      notify('Please enter a valid fill amount first.', 'warning', 3000);
      return;
    }

    const selectedRows =
      this.itemsGridRef?.instance?.getSelectedRowsData() || [];
    if (selectedRows.length === 0) {
      notify('Please select at least one row', 'warning', 3000);
      return;
    }

    selectedRows.forEach((row: any) => {
      const pending = Number(row.PENDING_AMOUNT);
      console.log(pending, 'PENDINGGGGGGGGGGGGGGGGGGGG');
      if (pending <= this.totalPending) {
        row.RECEIVED_AMOUNT = pending;
        this.totalPending -= pending;
        row.RECEIVED_AMOUNT = 0; //  Or if you want to SKIP partial fills:
      } else {
        row.RECEIVED_AMOUNT = 0; // Skip partial fills
      }
    });

    // Trigger change detection if needed
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
    const valueStr = e.value;
    const enteredAmount = parseFloat(valueStr);

    if (!valueStr || isNaN(enteredAmount)) {
      this.amountError = 'Please enter a valid number';
    } else if (enteredAmount > this.totalPendingAmount) {
      this.amountError =
        'The amount cannot be greater than the total pending amount';
    } else {
      // ✅ Clear the error when the input is valid
      this.amountError = '';
    }
  }

  submitAmountPopup() {
    const enteredAmount = Number(this.fillAmountData.field1);

    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      notify('Please enter a valid received amount.', 'warning', 3000);
      return;
    }

    const selectedRows = this.itemsGridRef.instance.getSelectedRowsData();

    if (!selectedRows.length) {
      notify('Please select at least one row.', 'warning', 3000);
      return;
    }

    let remainingAmount = enteredAmount;

    // ✅ Fill from first selected row downwards
    for (const row of selectedRows) {
      const pending = Number(row.PENDING_AMOUNT);

      if (remainingAmount <= 0) break;

      if (pending <= remainingAmount) {
        row.RECEIVED_AMOUNT = pending;
        remainingAmount -= pending;
      } else {
        row.RECEIVED_AMOUNT = remainingAmount;
        remainingAmount = 0;
      }
    }

    // ✅ Update grid data source
    this.pendingInvoiceList = [...this.pendingInvoiceList];

    // ✅ Close popup
    this.showFillAmountPopup = false;

    notify('Amounts filled successfully.', 'success', 3000);
  }

  getReceiptNo() {
    this.dataService.getReceiptNo().subscribe((response: any) => {
      this.receiptNo = response.RECEIPT_NO;
      console.log(response.RECEIPT_NO, 'INVOICENO');
    });
  }

  saveReceipt() {
    if (!this.selectedDistributorId || this.selectedDistributorId == '') {
      notify('Please select a customer', 'warning', 3000);
      return;
    }
    const selectedRows =
      this.itemsGridRef?.instance?.getSelectedRowsData() || [];

    const validDetails = selectedRows
      .filter((row: any) => Number(row.RECEIVED_AMOUNT) > 0)
      .map((row: any) => ({
        BILL_ID: row.BILL_ID,
        AMOUNT: Number(row.RECEIVED_AMOUNT),
      }));

    if (validDetails.length === 0) {
      notify(
        'Please enter a valid Received Amount for at least one selected row',
        'warning',
        3000
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
      0
    );

    if (this.receiptMode === 'PDC') {
      const pdcAmount = Number(this.receiprtFormData.AMOUNT || 0); // or PDC_AMOUNT if you store separately
      if (netAmount !== pdcAmount) {
        notify(
          `PDC amount (${pdcAmount}) must equal the total received amount (${netAmount})`,
          'error',
          4000
        );
        return;
      }
    }

    // this.receiprtFormData.PAY_TYPE_ID = 1;
    // this.receiprtFormData.PAY_TYPE_ID = this.receiprtFormData.PAY_TYPE_ID || 1;
    this.receiprtFormData.NET_AMOUNT = netAmount;
    // Build payload with only SUPP_ID and REC_DETAIL
    const payload = {
      ...this.receiprtFormData,
      DISTRIBUTOR_ID: this.selectedDistributorId, // or whatever your selected supplier ID is
      REC_DETAIL: validDetails,
      BANK_NAME: this.receiprtFormData.BANK_NAME,
    };

    console.log('Sending payload:', payload); // For debugging

    this.dataService.insertCustomerReceipt(payload).subscribe({
      next: () => {
        notify('Receipt saved successfully', 'success', 3000);
        this.resetForm();
        this.popupClosed.emit();
      },
      error: (err) => {
        notify('Error saving receipt', 'error', 3000);
        console.error('Save error:', err);
      },
    });
  }

  resetForm() {
    this.fillAmountData = { field1: 0, field2: 0 };
    this.amountError = '';
    this.receiprtFormData = {
      TRANS_TYPE: 27,
      REC_NO: '',
      REC_DATE: new Date(),
      COMPANY_ID: 1,
      STORE_ID: 1,
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
    };
    this.customerType = 'Unit';
    this.receiptMode = '';
    this.chequeNo = '';
    this.bankName = '';
    this.dueDate = null;
    this.narration = '';
    this.selectedCompanyId = '';
    this.selectedDistributorId = '';
    this.pendingInvoiceList?.forEach((row) => (row.RECEIVED_AMOUNT = 0));
    this.pendingInvoiceList = [];
    this.getReceiptNo();
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
