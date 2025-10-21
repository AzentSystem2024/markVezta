import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
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
import { AddSupplierPaymentComponent } from '../add-supplier-payment/add-supplier-payment.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-edit-supplier-payment',
  templateUrl: './edit-supplier-payment.component.html',
  styleUrls: ['./edit-supplier-payment.component.scss'],
})
export class EditSupplierPaymentComponent {
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() paymentData: any;
  @Input() readOnlyMode: boolean = false;
  @Input() isReadOnlyMode: boolean = false;
  popupVisible = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  receiptMode: string = '';
  selectedCompanyId: any;
  selectedDistributorId: any;
  pendingInvoiceList: any;
  totalPendingAmount: any;
  amountError: string = '';
  showFillAmountPopup: boolean = false;
  fillAmountData = {
    field1: 0,
    field2: 0,
  };
  ledgerList: any;
  selectedRowsCount: number = 0;
  distributorList: any;
  companyList: any;
  customerType: 'Unit' | 'Dealer' = 'Unit';
  selectedRowsKeys: number[] = [];
  mainInvoiceGridList: any;
  showCommitConfirmPopup = false;
  receiptNo: any;
  filteredLedgerList: any;
  pendingInvoicelist: any[];
  supplierList: any;
  selectedSupplierId: any;
  paymentFormData: any;
  mainGridData: any;
  paymentDate: any;
  selectedPaymentMode: string = '';
  ledger: any;
  narration: any;
  refNo: any;
  bank: any;
  chequeDate: any;
  chequeNo: any;
  selectedKeys: any[] = [];
  selectedBillIds: number[] = [];
  isApproved: boolean = false;
  totalPending: any;
  pdcList: any;
  pdcPopupVisible: boolean;
  selectedLedger: any;
  payHeadTouched: boolean;

  constructor(
    private dataService: DataService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getLedgerCodeDropdown();
    this.getSupplierDropdown();
    this.getReceiptNo();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['paymentData']) {
      console.log('Changed paymentData:', this.paymentData);
      this.paymentFormData = this.paymentData[0];
      setTimeout(() => {
        this.itemsGridRef?.instance.refresh();
      }, 0);

      this.mainGridData = this.paymentFormData.PAY_DETAIL || [];
      // this.mainGridData = [...(this.paymentFormData.PAY_DETAIL || [])];

      console.log(
        this.mainGridData,
        'MAINGRIDDATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
      );
      this.paymentDate = this.paymentFormData.PAY_DATE;
      console.log(this.paymentDate, 'PAYMENTDATEEEEEEEEE');
      console.log(
        this.paymentFormData.PAY_HEAD_ID,
        'PAYHEADIDDDDDDDDDDDDDDDDDDD'
      );
      this.narration = this.paymentData.NARRATION;
      this.ledger = this.paymentFormData.PAY_HEAD_ID;
      this.narration = this.paymentFormData.NARRATION;
      this.refNo = this.paymentFormData.REF_NO;
      this.bank = this.paymentFormData.BANK_NAME;

      if (this.paymentFormData?.CHEQUE_DATE) {
        const parts = this.paymentFormData.CHEQUE_DATE.split('-'); // ["22","08","2025"]
        this.chequeDate = new Date(+parts[2], +parts[1] - 1, +parts[0]);
      }

      this.chequeNo = this.paymentFormData.CHEQUE_NO;
      console.log(this.chequeDate, 'CHEQUNOOOOOOOOOOOOOOOOOOOOOOO');
      this.selectedSupplierId = this.paymentFormData.SUPP_ID;
      console.log(
        this.selectedSupplierId,
        'SUPPLIERIDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD'
      );
      // 👇 Map PAY_TYPE_ID to mode string
      // 👇 Map PAY_TYPE_ID to mode string
      switch (this.paymentFormData.PAY_TYPE_ID) {
        case 1:
          this.selectedPaymentMode = 'Cash';
          break;
        case 2:
          this.selectedPaymentMode = 'Bank';
          break;
        case 3: // <-- missing mapping
          this.selectedPaymentMode = 'PDC';
          break;
        case 4:
          this.selectedPaymentMode = 'Adjustments';
          break;
        default:
          this.selectedPaymentMode = '';
      }

      this.onReceiptModeChange({ value: this.selectedPaymentMode });
      if (!this.supplierList || this.supplierList.length === 0) {
        this.getSupplierDropdown();
      }

      this.selectedSupplierId = this.paymentFormData.SUPP_ID;

      // manually trigger pending invoice loading
      this.onSupplierChanged({ value: this.selectedSupplierId });

      console.log('SUPP_ID:', this.paymentFormData.SUPP_ID);
    }
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
    const payload = { SUPP_ID: supplierId };

    this.dataService
      .getPendingInvoiceforSupplierPayment(payload)
      .subscribe((response: any) => {
        const pendingList = response.Data || [];
        const payDetails = this.paymentFormData?.PAY_DETAIL || [];

        console.log('pendingList:', pendingList);
        console.log('payDetails:', payDetails);

        // ✅ Build list of selected BILL_IDs from PAY_DETAIL
        this.selectedBillIds = payDetails.map((detail: any) => detail.BILL_ID);

        if (pendingList.length > 0) {
          // ✅ Merge RECEIVED_AMOUNT from payDetails into the full pending list
          this.mainGridData = pendingList.map((pending: any) => {
            const matched = payDetails.find(
              (item: any) => item.BILL_ID === pending.BILL_ID
            );
            return {
              ...pending,
              AMOUNT: matched?.AMOUNT || null,
            };
          });
        } else {
          // ✅ Fallback to PAY_DETAIL if no pending list available
          this.mainGridData = [...payDetails];
        }

        setTimeout(() => {
          this.itemsGridRef?.instance.refresh();
        }, 0);
      });
  }

  onSupplierChanged(event: any) {
    const selectedSupplierId = event.value;

    if (selectedSupplierId) {
      this.paymentFormData.SUPPLIER_ID = selectedSupplierId;
      this.getPendingInvoiceList(selectedSupplierId); // Pass supplier ID here
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

      if (this.paymentFormData && this.paymentFormData.SUPP_ID) {
        this.selectedSupplierId = this.paymentFormData.SUPP_ID;

        // Optional: Load the grid using this supplier in case needed
        this.getPendingInvoiceList(this.selectedSupplierId);
      }
    });
  }

  onGridContentReady(e: any) {
    if (e.component) {
      this.totalPending = e.component.getTotalSummaryValue('PENDING_AMOUNT');
      console.log('Total Pending Amount:', this.totalPending);
    }
    if (this.selectedBillIds.length > 0) {
      this.itemsGridRef.instance.selectRows(this.selectedBillIds, true);
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
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.distributorList = response;
      console.log(this.distributorList, 'distributorList');
    });
  }

  getLedgerCodeDropdown() {
    this.dataService.getAccountHeadList().subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        this.ledgerList = response?.Data || [];
        this.filteredLedgerList = [...this.ledgerList]; // <-- BIND IT HERE
        this.onReceiptModeChange({ value: this.receiptMode });
        console.log('Ledger List Loaded:', this.filteredLedgerList);
      },
      error: (err) => {
        console.error('Ledger API Error:', err);
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
    this.chequeNo = selectedCheque.CHEQUE_NO;
    if (selectedCheque.DUE_DATE) {
      // Parse dd-MM-yyyy manually
      const parts = selectedCheque.DUE_DATE.split('-'); // ["27","08","2025"]
      this.chequeDate = new Date(
        Number(parts[2]), // year
        Number(parts[1]) - 1, // month is 0-based
        Number(parts[0]) // day
      );
    } else {
      this.chequeDate = null;
    }
    this.bank = selectedCheque.BANK_NAME;
    this.paymentFormData.AMOUNT = selectedCheque.AMOUNT;

    this.pdcPopupVisible = false;
  }

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
        row.AMOUNT = Math.min(pending, remaining);
        remaining -= row.AMOUNT;
      } else {
        row.AMOUNT = 0;
      }
    });

    // ✅ Refresh grid
    this.pendingInvoicelist = [...this.pendingInvoicelist];
  }

  handleCancel() {
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
    const enteredAmount = Number(this.fillAmountData.field1);

    if (isNaN(enteredAmount)) {
      notify('Please enter a valid amount', 'warning', 3000);
      return;
    }

    // ✅ Validate against selected totalPending only
    if (enteredAmount - this.totalPending > 0.01) {
      notify(
        `Entered amount cannot be greater than Total Pending Amount (${this.totalPending.toFixed(
          2
        )})`,
        'error',
        3000
      );
      return;
    }
    this.showFillAmountPopup = false;
    // ✅ Fill the rows
    this.autoFillReceivedAmounts();

    // ✅ Reset and close
    this.amountError = '';
    this.resetFillAmountForm();

    console.log('Popup should now close');
  }

  getReceiptNo() {
    this.dataService.getReceiptNo().subscribe((response: any) => {
      this.receiptNo = response.RECEIPT_NO;
      this.paymentFormData.RECEIPT_NO = this.receiptNo;
      console.log(response.RECEIPT_NO, 'INVOICENO');
    });
  }

  getPayTypeId(mode: string): number {
    switch (mode) {
      case 'Cash':
        return 1;
      case 'Bank':
        return 2;
      case 'Adjustments':
        return 4;
      default:
        return 0;
    }
  }

  calculateNetAmount(details: any[]): number {
    return details.reduce((sum, item) => sum + Number(item.AMOUNT || 0), 0);
  }

  saveReceipt() {
    const selectedRows =
      this.itemsGridRef?.instance?.getSelectedRowsData() || [];

    const validSuppDetails = selectedRows
      .filter((row: any) => Number(row.AMOUNT) > 0)
      .map((row: any) => ({
        BILL_ID: row.BILL_ID,
        AMOUNT: Number(row.AMOUNT),
      }));
    console.log(validSuppDetails, 'VALIDSUPPDETAILLLLLLLLLLLLLLLLLLLLL');
    if (validSuppDetails.length === 0) {
      notify(
        'Please select at least one row with a valid amount.',
        'warning',
        3000
      );
      return;
    }
    const netAmount = this.calculateNetAmount(validSuppDetails);
    const payload = {
      TRANS_ID: this.paymentFormData.TRANS_ID,
      TRANS_TYPE: 21,
      PAY_DATE: this.paymentDate,
      COMPANY_ID: 1,
      STORE_ID: 1,
      FIN_ID: 1,
      TRANS_STATUS: 1,
      RECEIPT_NO: this.paymentFormData.RECEIPT_NO,
      REF_NO: this.refNo,
      CHEQUE_NO: this.chequeNo,
      CHEQUE_DATE: this.chequeDate,
      BANK_NAME: this.bank || '',
      NARRATION: this.narration,
      PAY_TYPE_ID: this.getPayTypeId(this.selectedPaymentMode),
      PAY_HEAD_ID: this.ledger,
      ADD_TIME: this.paymentDate,
      SUPPLIER_ID: this.selectedSupplierId,
      NET_AMOUNT: this.calculateNetAmount(validSuppDetails),
      SUPP_DETAIL: validSuppDetails,
    };
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
    // ✅ If approved checkbox is checked, call the approve API
    if (this.isApproved) {
      const result = confirm(
        'Are you sure you want to approve and commit this invoice?',
        'Confirm Approval'
      );

      result.then((dialogResult) => {
        if (dialogResult) {
          this.dataService.approveSupplierPayment(payload).subscribe({
            next: (res) => {
              notify('Payment approved successfully!', 'success', 3000);
              this.popupClosed.emit();
            },
            error: (err) => {
              console.error('Approval failed:', err);
              notify('Approval failed. Please try again.', 'error', 3000);
            },
          });
        }
      });
    } else {
      // ❌ Otherwise, call update API
      this.dataService.updateSupplierPayment(payload).subscribe({
        next: (response: any) => {
          notify('Payment updated successfully!', 'success', 3000);
          // this.resetForm();
          this.popupClosed.emit();
        },
        error: (err) => {
          console.error('Update failed:', err);
          notify('Update failed. Please try again.', 'error', 3000);
        },
      });
    }
  }

  // resetForm() {
  //   this.paymentFormData = {}; // or re-assign your default object
  //   this.refNo = '';
  //   this.chequeNo = '';
  //   this.chequeDate = null;
  //   this.bank = '';
  //   this.narration = '';
  //   this.selectedPaymentMode = null;
  //   this.ledger = null;
  //   this.selectedSupplierId = null;
  //   this.isApproved = false;

  //   // clear selected rows in grid
  //   this.itemsGridRef?.instance?.clearSelection();

  //   // optionally reset date to today
  //   this.paymentDate = new Date();
  // }

  cancel() {}
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
  declarations: [EditSupplierPaymentComponent],
  exports: [EditSupplierPaymentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditSupplierPaymentModule {}
