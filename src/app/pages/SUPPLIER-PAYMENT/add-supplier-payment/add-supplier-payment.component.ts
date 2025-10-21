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
import { AddInvoiceComponent } from '../../INVOICE/add-invoice/add-invoice.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-add-supplier-payment',
  templateUrl: './add-supplier-payment.component.html',
  styleUrls: ['./add-supplier-payment.component.scss'],
})
export class AddSupplierPaymentComponent {
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  distributorList: any;
  showFillAmountPopup: boolean = false;
  paymentFormData: any = {
    TRANS_TYPE: 21,
    COMPANY_ID: 1,
    STORE_ID: 1,
    FIN_ID: 1,
    TRANS_DATE: new Date(),
    TRANS_STATUS: 1,
    RECEIPT_NO: '',
    REF_NO: '',
    CHEQUE_NO: '',
    CHEQUE_DATE: '',
    NARRATION: '',
    PAY_TYPE_ID: '',
    PAY_HEAD_ID: '',
    ADD_TIME: '',
    SUPPLIER_ID: '',
    NET_AMOUNT: '',
    PDC_ID: '',
    SUPP_DETAIL: [
      {
        BILL_ID: '',
        AMOUNT: '',
      },
    ],
  };

  fillAmountData = {
    field1: 0,
    field2: 0,
  };
  filteredLedgerList: any[] = [];
  receiptMode: string = 'Cash';
  supplierList: any;
  pendingInvoicelist: any;
  selectedRowsCount: number = 0;
  amountError: string;
  totalPendingAmount: number = 0;
  ledgerList: any;
  receiptNo: any;
  totalPending: any;
  electedSupplierId: any;
  selectedSupplierId: any;
  pdcList: any;
  selectedLedger: any;
  pdcPopupVisible: boolean = false;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getLedgerCodeDropdown();
    this.getSupplierDropdown();
    this.applyReceiptModeFilter();
    this.getPdcofSelectedSupplier();
  }

  validateReceivedAmount = (e: any) => {
    if (!e || !e.data) return true;

    const value = Number(e.value);

    // allow 0 or empty
    if (!e.value || value === 0) {
      return true;
    }

    // validate only when > 0
    return value === Number(e.data.PENDING_AMOUNT);
  };

  getPendingInvoiceList(supplierId: number) {
    const payload = {
      SUPP_ID: supplierId,
    };

    this.dataService
      .getPendingInvoiceforSupplierPayment(payload)
      .subscribe((response: any) => {
        this.pendingInvoicelist = response.Data;
      });
  }

  onSupplierChanged(event: any) {
    console.log(event, 'eventttttttttttttttttttttttttttttttttt');
    this.selectedSupplierId = event.value;

    if (this.selectedSupplierId) {
      this.paymentFormData.SUPPLIER_ID = this.selectedSupplierId;
      this.getPendingInvoiceList(this.selectedSupplierId); // Pass supplier ID here
    } else {
      this.pendingInvoicelist = [];
    }
  }

  getSupplierDropdown() {
    this.dataService.getDropdownData('SUPPLIER').subscribe((response: any) => {
      this.supplierList = response;
      console.log(
        this.supplierList,
        'distributorList=============================='
      );
    });
  }

  onGridContentReady(e: any) {
    if (e.component) {
      const rawTotal = e.component.getTotalSummaryValue('PENDING_AMOUNT');
      this.totalPendingAmount = parseFloat(rawTotal.toFixed(2)); //
      console.log('Total Pending Amount====:', this.totalPendingAmount);
    }
  }

  onCustomerChanged(event: any): void {
    console.log(event, "==============='''");
    const selectedId = event.value;
    console.log(selectedId, "==============='''");
    if (selectedId) {
      this.getPendingInvoiceList(selectedId);
    }
  }

  getCompanyListDropdown() {
    // this.dataService
    //   .getDropdownData('COMPANY_LIST')
    //   .subscribe((response: any) => {
    //     this.companyList = response;
    //     console.log(this.companyList, 'COMPANYLIST');
    //   });
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.distributorList = response;
      console.log(this.distributorList, 'distributorList');
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
      SUPP_ID: this.selectedSupplierId,
      LEDGER_ID: this.selectedLedger,
    };
    this.dataService.getPdcList(payload).subscribe({
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
    if (this.receiptMode === 'PDC' && this.selectedSupplierId) {
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
    this.paymentFormData.CHEQUE_NO = selectedCheque.CHEQUE_NO;
    if (selectedCheque.DUE_DATE) {
      // Parse dd-MM-yyyy manually
      const parts = selectedCheque.DUE_DATE.split('-'); // ["27","08","2025"]
      this.paymentFormData.CHEQUE_DATE = new Date(
        Number(parts[2]), // year
        Number(parts[1]) - 1, // month is 0-based
        Number(parts[0]) // day
      );
    } else {
      this.paymentFormData.CHEQUE_DATE = null;
    }
    this.paymentFormData.BANK_NAME = selectedCheque.BANK_NAME;
    this.paymentFormData.AMOUNT = selectedCheque.AMOUNT;
    this.paymentFormData.PDC_ID = selectedCheque.ID;
    this.pdcPopupVisible = false;
  }
  // onSelectionChanged(e: any) {
  //   this.selectedRowsCount = e.selectedRowsData.length;
  // }

  onSelectionChanged(e: any) {
    this.selectedRowsCount = e.selectedRowsData.length;

    // Calculate selected total balance
    this.totalPending = e.selectedRowsData.reduce(
      (sum: number, row: any) => sum + (Number(row.PENDING_AMOUNT) || 0),
      0
    );

    console.log('Selected Balance Total:', this.totalPending.toFixed(2));
  }

  onFillAmountClick() {
    if (this.selectedRowsCount === 0) {
      notify(
        'Please select at least one row before proceeding.',
        'warning',
        3000
      );
      return;
    }

    // ✅ only show popup, no auto-fill into field1
    this.showFillAmountPopup = true;
  }
  autoFillReceivedAmounts() {
    const fillAmount = Number(this.fillAmountData.field1);

    if (isNaN(fillAmount) || fillAmount <= 0) {
      notify('Please enter a valid fill amount first.', 'warning', 3000);
      return;
    }

    let remaining = fillAmount;
    const selectedRows =
      this.itemsGridRef?.instance?.getSelectedRowsData() || [];

    if (selectedRows.length === 0) {
      notify('Please select at least one row', 'warning', 3000);
      return;
    }

    const EPSILON = 0.01; // tolerance

    selectedRows.forEach((row: any) => {
      const pending = Number(row.PENDING_AMOUNT);

      if (remaining > EPSILON) {
        row.RECEIVED_AMOUNT = Math.min(pending, remaining);
        remaining -= row.RECEIVED_AMOUNT;
      } else {
        row.RECEIVED_AMOUNT = 0;
      }
    });

    // ✅ Refresh grid
    this.pendingInvoicelist = [...this.pendingInvoicelist];
  }

  handleCancel() {
    this.resetForm();
    this.popupClosed.emit();
    this.resetFillAmountForm();
    this.showFillAmountPopup = false;
  }

  resetFillAmountForm() {
    this.fillAmountData.field1 = 0;
    this.amountError = '';
  }

  validateAmount(e: any) {
    const enteredValue = e.value;

    if (enteredValue > this.totalPending) {
      notify(
        `Entered amount cannot be greater than Total Pending Amount (${this.totalPending.toFixed(
          2
        )})`,
        'warning',
        3000
      );

      // Clamp back to totalPending
      this.fillAmountData.field1 = this.totalPending;
    }
  }

  submitAmountPopup() {
    const enteredAmount = Number(this.fillAmountData.field1); // convert to number

    if (isNaN(enteredAmount)) {
      notify('Please enter a valid amount', 'warning', 3000);
      return;
    }

    if (enteredAmount > this.totalPendingAmount) {
      notify(
        'The amount cannot be greater than the total pending amount',
        'error',
        3000
      );
      return;
    }

    // ✅ Call the function to auto-fill the grid
    this.autoFillReceivedAmounts();

    // ✅ Reset form and close popup
    this.amountError = '';
    this.resetFillAmountForm();
    this.showFillAmountPopup = false;
  }

  getReceiptNo() {
    this.dataService.getReceiptNo().subscribe((response: any) => {
      this.receiptNo = response.RECEIPT_NO;
      this.paymentFormData.RECEIPT_NO = this.receiptNo;
      console.log(response.RECEIPT_NO, 'INVOICENO');
    });
  }

  saveReceipt() {
    console.log(
      this.paymentFormData,
      'PAYLOADDDDDDDDDD--------------------------------p'
    );
    const selectedRows =
      this.itemsGridRef?.instance?.getSelectedRowsData() || [];

    const validDetails = selectedRows
      .filter(
        (row: any) =>
          row.RECEIVED_AMOUNT &&
          !isNaN(Number(row.RECEIVED_AMOUNT)) &&
          Number(row.RECEIVED_AMOUNT) > 0
      )
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

    // 🔧 FIX: Assign SUPP_DETAIL before calling the API
    this.paymentFormData.SUPP_DETAIL = validDetails;

    // Set PAY_TYPE_ID based on receiptMode
    const payTypeMapping: any = {
      Cash: 1,
      Bank: 2,
      PDC: 3,
      Adjustments: 4,
    };

    this.paymentFormData.PAY_TYPE_ID = payTypeMapping[this.receiptMode] || null;
    this.paymentFormData.UNIT_ID = 0;

    // Calculate total received amount
    const netAmount = validDetails.reduce((sum, item) => sum + item.AMOUNT, 0);
    this.paymentFormData.NET_AMOUNT = netAmount;
    this.paymentFormData.RECEIPT_NO = this.receiptNo;
    this.paymentFormData.REC_DATE = new Date();
    this.paymentFormData.NARRATION = this.paymentFormData.NARRATION || '';
    this.paymentFormData.PDC_ID = this.paymentFormData.PDC_ID;
    if (this.receiptMode === 'Bank') {
      // this.paymentFormData.CHEQUE_NO = this.paymentFormData.CHEQUE_NO || '';
      this.paymentFormData.CHEQUE_NO = String(
        this.paymentFormData.CHEQUE_NO || ''
      );
      this.paymentFormData.BANK_NAME = this.paymentFormData.BANK_NAME || '';
      // this.paymentFormData.DUE_DATE = this.paymentFormData.DUE_DATE || null;
    }

    if (this.receiptMode === 'PDC') {
      const pdcAmount = Number(this.paymentFormData.AMOUNT || 0); // or PDC_AMOUNT field if you have
      if (netAmount !== pdcAmount) {
        notify(
          `PDC amount (${pdcAmount}) must equal the total received amount (${netAmount})`,
          'error',
          4000
        );
        return;
      }
    }

    // ✅ Call backend API
    this.dataService.insertSupplierPayment(this.paymentFormData).subscribe({
      next: () => {
        notify('Receipt saved successfully', 'success', 3000);

        this.popupClosed.emit();
        this.resetForm();
      },
      error: (err) => {
        notify('Error saving receipt', 'error', 3000);
        console.error('Save error:', err);
      },
    });
  }

  resetForm() {
    // Reset payment form data
    this.paymentFormData = {
      TRANS_TYPE: 21,
      COMPANY_ID: 1,
      STORE_ID: 1,
      FIN_ID: 1,
      TRANS_DATE: new Date(),
      TRANS_STATUS: 1,
      RECEIPT_NO: '',
      REF_NO: '',
      CHEQUE_NO: '',
      CHEQUE_DATE: '',
      NARRATION: '',
      PAY_TYPE_ID: '',
      PAY_HEAD_ID: '',
      ADD_TIME: '',
      SUPP_ID: '',
      NET_AMOUNT: '',
      SUPP_DETAIL: [
        {
          BILL_ID: '',
          AMOUNT: '',
        },
      ],
    };
    this.paymentFormData.SUPP_ID = '';
    // Reset receipt mode to default (e.g. Cash)
    // this.receiptMode = 'Cash';

    // Clear selection and editable values in the grid
    // if (this.itemsGridRef?.instance) {
    //   this.itemsGridRef.instance.clearSelection();
    //   this.itemsGridRef.instance.refresh(); // refresh to clear any temporary values
    // }

    // Optionally reset receipt number if you auto-generate it
    // this.receiptNo = '';

    // Trigger change detection to update UI
    // this.cdr.detectChanges();
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
  ],
  providers: [],
  declarations: [AddSupplierPaymentComponent],
  exports: [AddSupplierPaymentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddSupplierPaymentModule {}
