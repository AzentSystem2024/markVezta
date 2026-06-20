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
import {
  BrowserModule,
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
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
import jsPDF from 'jspdf';

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
  @Input() supplierPaymentId: any;
  @Input() canApprove: boolean = false;
  @Input() isVerifyMode: boolean = false;
  @Input() isApproveMode: boolean = false;
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
  isApprovedForView: boolean = true;

  pdfSrc: SafeResourceUrl | null = null;
  isPdfPopupVisible: boolean = false;

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
  voucherNo: any;
  sessionData: any;
  isInitialLoad = true;
  companyState: any;
  companyStateID: any;
  finID: any;
  isSaving: boolean;
  settings: any;
  BankID: any;
  CashID: any;

  getFormMode(): string {
    if (this.isReadOnlyMode) {
      return 'view';
    }

    if (this.isApproveMode) {
      return 'approve';
    }

    if (this.isVerifyMode) {
      return 'verify';
    }

    return 'new';
  }

  getActionButtonText(): string {
    if (this.isSaving) {
      if (this.isApproveMode) {
        return 'Approving...';
      }

      if (this.isVerifyMode) {
        return 'Verifying...';
      }

      return 'Saving...';
    }

    if (this.isApproveMode) {
      return 'Approve';
    }

    if (this.isVerifyMode) {
      return 'Verify';
    }

    return 'Save';
  }

  constructor(
    private dataService: DataService,
    private cdRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) {
    this.sessionData_tax();
    this.AC_Default();
  }

  ngOnInit() {
    console.log(this.isApproveMode, 'ISAPPROVEMODE');
    console.log(this.isVerifyMode, 'ISVERIFYMODE');
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      console.log(userData, selectedCompany, 'USERDATAAAAAAAAAAAAAAAAA');
      this.companyState = selectedCompany.STATE_NAME;
      this.companyStateID = selectedCompany.STATE_ID;
      console.log(this.companyStateID, 'COMPANYSTATE');
      this.finID = userData.FINANCIAL_YEARS?.[0].FIN_ID;
      console.log(userData.FINANCIAL_YEARS?.[0].FIN_ID, 'FINIDDDDDDDDDDDDDDDD');
      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
        console.log(
          this.selectedCompanyId,
          'SELECTEDCOMPANYIDDDDDDDDDDDDDDDDDDDDDDD',
        );
        this.companyList = [selectedCompany]; // Show only selected company
      }
    }
    this.getLedgerCodeDropdown();
    this.getSupplierDropdown();
    this.AC_Default();
    // this.getReceiptNo();
  }

  AC_Default() {
    const payload = {
      CompanyID: this.selectedCompanyId,
    };
    this.dataService.AC_Default_Settings_Api(payload).subscribe((res: any) => {
      console.log(res);
      this.settings = res.Data;
      this.CashID = this.settings.GP_CASH_ID;
      console.log(this.CashID);
      this.BankID = this.settings.GP_BANK_ID;
      console.log(this.BankID);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['paymentData']) {
      this.initialSelectionDone = false;
      console.log('Changed paymentData:', this.paymentData);
      this.paymentFormData = this.paymentData[0];
      console.log(this.paymentFormData, 'PAYMENTFORMDATA');
      this.voucherNo = this.paymentData[0].DOC_NO;
      console.log(this.voucherNo, 'VOUCHERNOOOOOOOOOOOOOO');
      setTimeout(() => {
        this.itemsGridRef?.instance.refresh();
      }, 0);

      this.mainGridData = this.paymentFormData.PAY_DETAIL || [];
      // this.mainGridData = [...(this.paymentFormData.PAY_DETAIL || [])];

      if (this.paymentFormData.PAY_DATE) {
        this.paymentDate = this.formatDateToYMD(this.paymentFormData.PAY_DATE);
      }
      console.log(this.paymentDate, 'PAYMENTDATEEEEEEEEE');
      console.log(this.paymentFormData.PDC_AMOUNT, 'PDCAMOUNTTTTTTTTTTTTTTTTT');
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
        'SUPPLIERIDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD',
      );
      // Map PAY_TYPE_ID to mode string
      console.log(this.paymentFormData.PAY_TYPE_ID, 'PAYTYPEIDDDDDD');
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
      setTimeout(() => {
        this.isInitialLoad = false;
      }, 0);
      if (!this.supplierList || this.supplierList.length === 0) {
        this.getSupplierDropdown();
      }

      this.selectedSupplierId = this.paymentFormData.SUPP_ID;

      // manually trigger pending invoice loading
      this.onSupplierChanged({ value: this.selectedSupplierId });

      console.log('SUPP_ID:', this.paymentFormData.SUPP_ID);
    }
  }
  clearBankAndPdcFields() {
    this.chequeNo = '';
    this.chequeDate = null;
    this.bank = '';

    this.paymentFormData.PDC_AMOUNT = null;
    this.paymentFormData.PDC_ID = null;

    this.selectedLedger = null;
    this.ledger = null;

    this.pdcPopupVisible = false;

    // ensure UI refresh
    this.paymentFormData = { ...this.paymentFormData };
  }

  formatDateToYMD(dateString: string): string {
    if (!dateString) return '';

    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  }

  validateReceivedAmount = (e: any) => {
    if (!e || !e.data) return true;

    const value = Number(e.value); // entered amount
    const pending = Number(e.data.PENDING_AMOUNT); // balance

    // allow empty or 0
    if (!e.value || value === 0) {
      return true;
    }

    // validate: amount must be <= pending
    return value <= pending;
  };

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selectedCompanyId = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  getPendingInvoiceList(supplierId: number) {
    const payload = { SUPP_ID: supplierId, COMPANY_ID: this.selectedCompanyId };

    this.dataService
      .getPendingInvoiceforSupplierPayment(payload)
      .subscribe((response: any) => {
        const pendingList = response.Data || [];
        const payDetails = this.paymentFormData?.PAY_DETAIL || [];

        console.log('pendingList:', pendingList);
        console.log('payDetails:', payDetails);
        // READ-ONLY MODE → SHOW ONLY SAVED ROWS
        if (this.isReadOnlyMode) {
          this.mainGridData = payDetails.map((item: any) => ({
            ...item,
            AMOUNT: item.AMOUNT, // keep saved amount
          }));

          this.selectedBillIds = payDetails.map((item: any) => item.BILL_ID);

          // Force grid refresh safely
          setTimeout(() => {
            this.itemsGridRef?.instance?.refresh();
          }, 0);

          return; //  stop further processing
        }
        // ✅ Build list of selected BILL_IDs from PAY_DETAIL
        this.selectedBillIds = payDetails.map((detail: any) => detail.BILL_ID);

        if (pendingList.length > 0) {
          // ✅ Merge RECEIVED_AMOUNT from payDetails into the full pending list
          this.mainGridData = pendingList.map((pending: any) => {
            const matched = payDetails.find(
              (item: any) => item.BILL_ID === pending.BILL_ID,
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
    const payload = {
      NAME: 'SUPPLIER',
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.supplierList = response;

      if (this.paymentFormData && this.paymentFormData.SUPP_ID) {
        this.selectedSupplierId = this.paymentFormData.SUPP_ID;

        // Optional: Load the grid using this supplier in case needed
        this.getPendingInvoiceList(this.selectedSupplierId);
      }
    });
  }

  // onGridContentReady(e: any) {
  //   if (e.component) {
  //     this.totalPending = e.component.getTotalSummaryValue('PENDING_AMOUNT');
  //     console.log('Total Pending Amount:', this.totalPending);
  //   }
  //   if (this.selectedBillIds.length > 0) {
  //     this.itemsGridRef.instance.selectRows(this.selectedBillIds, true);
  //   }
  // }

  initialSelectionDone = false;
  onGridContentReady(e: any) {
    if (e.component) {
      this.totalPendingAmount =
        e.component.getTotalSummaryValue('PENDING_AMOUNT');
    }

    if (!this.initialSelectionDone && this.selectedBillIds.length > 0) {
      this.itemsGridRef.instance.selectRows(this.selectedBillIds, true);
      this.initialSelectionDone = true;
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
    this.dataService.getActiveLedger().subscribe({
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
    const newMode = e.value;

    // ✅ Clear ONLY when user changes mode (not initial binding)
    if (!this.isInitialLoad && this.receiptMode !== newMode) {
      this.clearBankAndPdcFields();
    }

    this.receiptMode = newMode;
    this.selectedPaymentMode = newMode;

    this.applyReceiptModeFilter();
  }

  applyReceiptModeFilter() {
    console.log(
      this.filteredLedgerList,
      '{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{',
    );
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
          'PDC List Response=============================-----------',
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
    console.log('Selected Cheque:', selectedCheque.ID);

    // Example: assign selected cheque to form
    this.chequeNo = selectedCheque.CHEQUE_NO;
    if (selectedCheque.DUE_DATE) {
      // Parse dd-MM-yyyy manually
      const parts = selectedCheque.DUE_DATE.split('-'); // ["27","08","2025"]
      this.chequeDate = new Date(
        Number(parts[2]), // year
        Number(parts[1]) - 1, // month is 0-based
        Number(parts[0]), // day
      );
    } else {
      this.chequeDate = null;
    }
    this.bank = selectedCheque.BANK_NAME;
    this.paymentFormData.PDC_AMOUNT = selectedCheque.AMOUNT;
    this.paymentFormData.PDC_ID = selectedCheque.ID;
    this.paymentFormData = { ...this.paymentFormData };
    this.pdcPopupVisible = false;
  }

  onSelectionChanged(e: any) {
    console.log("======================================'''''");
    this.selectedRowsCount = e.selectedRowsData.length;
    console.log(e);
    const selectedKeys = e.selectedRowKeys || [];

    this.totalPending = e.selectedRowsData.reduce(
      (sum: number, row: any) => sum + (Number(row.PENDING_AMOUNT) || 0),
      0,
    );
    console.log(this.totalPending);
    this.cdRef.detectChanges();
    // this.totalPending = this.totalPending.toFixed(2);
    this.mainGridData.forEach((row: any) => {
      if (!selectedKeys.includes(row.BILL_ID)) {
        row.AMOUNT = 0;
      }
    });

    // refresh summary only
    e.component.refresh(true);
  }

  formatPending = (value: any) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  onFillAmountClick() {
    if (this.selectedRowsCount === 0) {
      notify(
        'Please select at least one row before proceeding.',
        'warning',
        3000,
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

    const grid = this.itemsGridRef?.instance;
    if (!grid) return;

    const selectedKeys = grid.getSelectedRowKeys();

    if (!selectedKeys || selectedKeys.length === 0) {
      notify('Please select at least one row', 'warning', 3000);
      return;
    }

    let remaining = fillAmount;

    // Get rows in current grid display order
    const visibleRows = grid.getVisibleRows();

    visibleRows.forEach((row: any) => {
      const data = row.data;

      // only selected rows
      if (selectedKeys.includes(data.BILL_ID)) {
        const pending = Number(data.PENDING_AMOUNT) || 0;

        if (remaining > 0) {
          const amountToAssign = Math.min(pending, remaining);
          data.AMOUNT = amountToAssign;
          remaining -= amountToAssign;
        } else {
          data.AMOUNT = 0;
        }
      }
    });

    this.mainGridData = [...this.mainGridData];
    grid.refresh();
  }

  calculateSelectedPendingSummary = (options: any) => {
    if (options.name === 'selectedPendingTotal') {
      switch (options.summaryProcess) {
        case 'start':
          options.totalValue = 0;
          break;

        case 'calculate':
          if (options.component.isRowSelected(options.value.BILL_ID)) {
            options.totalValue += Number(options.value.PENDING_AMOUNT) || 0;
          }
          break;
      }
    }
  };

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
          2,
        )})`,
        'warning',
        3000,
      );

      // Clamp back to  totalPending
      this.fillAmountData.field1 = this.totalPending;
    }
  }

  Cancel() {
    //  this.autoFillReceivedAmounts();

    // this.amountError = '';
    this.resetFillAmountForm();
    this.showFillAmountPopup = false;
  }

  submitAmountPopup() {
    const enteredAmount = Number(this.fillAmountData.field1);

    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      notify('Please enter a valid amount', 'warning', 3000);
      return;
    }

    if (this.selectedRowsCount === 0) {
      notify('Please select at least one row', 'warning', 3000);
      return;
    }

    // check against selected rows pending total
    if (enteredAmount > this.totalPending) {
      notify(
        'The amount cannot be greater than the selected rows pending amount',
        'error',
        3000,
      );
      return;
    }

    this.autoFillReceivedAmounts();

    this.amountError = '';
    this.resetFillAmountForm();
    this.showFillAmountPopup = false;
  }

  // getReceiptNo() {
  //   this.dataService.getReceiptNo().subscribe((response: any) => {
  //     this.receiptNo = response.RECEIPT_NO;
  //     this.paymentFormData.RECEIPT_NO = this.receiptNo;
  //     console.log(response.RECEIPT_NO, 'INVOICENO');
  //   });
  // }

  getPayTypeId(mode: string): number {
    switch (mode) {
      case 'Cash':
        return 1;
      case 'Bank':
        return 2;
      case 'Adjustments':
        return 4;
      case 'PDC': //  ADD THIS
        return 3;
      default:
        return 0;
    }
  }

  calculateNetAmount(details: any[]): number {
    return details.reduce((sum, item) => sum + Number(item.AMOUNT || 0), 0);
  }

  // onEditorPreparing(e: any) {
  //   if (e.dataField === 'AMOUNT') {
  //     e.editorOptions = e.editorOptions || {};

  //     // Let the editor inherit row height naturally (no fixed height)
  //     e.editorOptions.elementAttr = {
  //       style: `
  //       height: 100%;
  //       margin: 0;
  //       padding: 0;
  //       display: flex;
  //       align-items: center;
  //     `,
  //     };

  //     // Make sure the input fits snugly inside
  //     e.editorOptions.inputAttr = {
  //       style: `
  //       height: 100%;
  //       padding: 0 4px;
  //       box-sizing: border-box;
  //     `,
  //     };

  //     // Remove spin buttons to prevent layout changes
  //     if (e.editorName === 'dxNumberBox') {
  //       e.editorOptions.showSpinButtons = false;
  //     }
  //     e.editorOptions.onKeyDown = (event: any) => {
  //       if (event.event.key === 'Enter') {
  //         const grid = this.itemsGridRef?.instance;
  //         const visibleRows = grid.getVisibleRows();

  //         const rowIndex = visibleRows.findIndex(
  //           (r) => r?.data === e.row?.data,
  //         );
  //         setTimeout(() => {
  //           grid.focus(grid.getCellElement(rowIndex, 'GST'));
  //         }, 50);
  //       }
  //     };
  //   }
  // }

  onEditorPreparing(e: any) {
    if (e.parentType === 'dataRow' && e.dataField === 'AMOUNT') {
      const grid = this.itemsGridRef?.instance;

      if (!grid) return;

      // check if current row is selected
      const isSelected = grid.isRowSelected(e.row.key);

      // block editing if row not selected
      if (!isSelected) {
        e.cancel = true;
        return;
      }

      e.editorOptions = e.editorOptions || {};

      e.editorOptions.elementAttr = {
        style: `
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      `,
      };

      e.editorOptions.inputAttr = {
        style: `
        height: 100%;
        padding: 0 4px;
        box-sizing: border-box;
      `,
      };

      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }

      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === e.row?.data,
          );

          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex + 1, 'AMOUNT'));
          }, 50);
        }
      };
    }
  }

  async saveReceipt() {
    if (!this.selectedSupplierId) {
      notify('Please select a supplier.', 'warning', 3000);
      return;
    }

    if (!this.paymentDate) {
      notify('Please select payment date.', 'warning', 3000);
      return;
    }

    if (!this.selectedPaymentMode) {
      notify('Please select payment mode.', 'warning', 3000);
      return;
    }

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
        3000,
      );
      return;
    }
    const netAmount = this.calculateNetAmount(validSuppDetails);
    if (!this.ledger) {
      notify('Please select a ledger.', 'warning', 3000);
      return;
    }
    if (this.isVerifyMode) {
      this.paymentFormData.IS_VERIFIED = true;
    } else {
      this.paymentFormData.IS_VERIFIED = false;
    }

    let formattedChequeDate = null;

    if (this.chequeDate) {
      const d = new Date(this.chequeDate);
      formattedChequeDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`;
    }
    const payload = {
      TRANS_ID: this.paymentFormData.TRANS_ID,
      TRANS_TYPE: 21,
      PAY_DATE: this.paymentDate,
      COMPANY_ID: this.selectedCompanyId,
      STORE_ID: 1,
      FIN_ID: this.finID,
      // TRANS_STATUS: 1,
      RECEIPT_NO: this.paymentFormData.RECEIPT_NO,
      REF_NO: this.refNo,
      CHEQUE_NO: this.chequeNo,
      // CHEQUE_DATE: this.chequeDate,
      CHEQUE_DATE: formattedChequeDate,
      BANK_NAME: this.bank || '',
      NARRATION: this.narration,
      PAY_TYPE_ID: this.getPayTypeId(this.selectedPaymentMode),
      PAY_HEAD_ID: this.ledger,
      ADD_TIME: this.paymentDate,
      SUPPLIER_ID: this.selectedSupplierId,
      NET_AMOUNT: this.calculateNetAmount(validSuppDetails),
      SUPP_DETAIL: validSuppDetails,
      PDC_ID: this.paymentFormData.PDC_ID || null,
      IS_VERIFIED: this.paymentFormData.IS_VERIFIED,
    };
    // ✅ Verification confirmation
    if (payload.IS_VERIFIED) {
      const verifyResult = await confirm(
        'Are you sure you want to verify this payment?',
        'Confirm Verification',
      );

      if (!verifyResult) {
        return;
      }
    }
    if (this.receiptMode === 'PDC' && this.paymentFormData.PDC_ID) {
      payload.PDC_ID = this.paymentFormData.PDC_ID;
    }
    if (this.receiptMode === 'PDC') {
      const pdcAmount = Number(this.paymentFormData.PDC_AMOUNT || 0); // or PDC_AMOUNT field if you have
      if (netAmount !== pdcAmount) {
        notify(
          `PDC amount (${pdcAmount}) must equal the total received amount (${netAmount})`,
          'error',
          4000,
        );
        return;
      }
    }
    // ✅ If approved checkbox is checked, call the approve API
    if (this.isApproved || this.isApproveMode) {
      const result = confirm(
        'Are you sure you want to approve and commit this invoice?',
        'Confirm Approval',
      );

      result.then((dialogResult) => {
        if (dialogResult) {
          this.isSaving = true;
          this.dataService.approveSupplierPayment(payload).subscribe({
            next: (res) => {
              this.isSaving = false;
              notify('Payment approved successfully!', 'success', 3000);
              this.popupClosed.emit();
            },
            error: (err) => {
              this.isSaving = false;
              console.error('Approval failed:', err);
              notify('Approval failed. Please try again.', 'error', 3000);
            },
          });
        }
      });
    } else {
      this.isSaving = true;
      // Otherwise, call update API
      this.dataService.updateSupplierPayment(payload).subscribe({
        next: (response: any) => {
          this.isSaving = false;
          notify('Payment updated successfully!', 'success', 3000);
          // this.resetForm();
          this.popupClosed.emit();
        },
        error: (err) => {
          this.isSaving = false;
          console.error('Update failed:', err);
          notify('Update failed. Please try again.', 'error', 3000);
        },
      });
    }
  }

  cancel() {
    this.popupClosed.emit();
  }

  viewPdf(): void {
    console.log(this.supplierPaymentId, 'SUPPLIERPAYMENTIDDDDDDDDDDDDDDDDD');
    this.isPdfPopupVisible = true;

    this.dataService
      .selectSupplierPayment(this.supplierPaymentId)
      .subscribe((response: any) => {
        if (response) {
          this.pdfSrc = this.get_pdf(response);
        }
      });
  }

  get_pdf(data: any): SafeResourceUrl {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const margin = 12;
    let y = 12;

    // ===========================
    //  RETURN PDF
    // ===========================
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
  declarations: [EditSupplierPaymentComponent],
  exports: [EditSupplierPaymentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditSupplierPaymentModule {}
