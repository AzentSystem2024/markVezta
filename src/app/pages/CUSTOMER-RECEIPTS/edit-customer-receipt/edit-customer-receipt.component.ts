import {
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
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { AddCutomerReceiptComponent } from '../add-cutomer-receipt/add-cutomer-receipt.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { of } from 'rxjs';

@Component({
  selector: 'app-edit-customer-receipt',
  templateUrl: './edit-customer-receipt.component.html',
  styleUrls: ['./edit-customer-receipt.component.scss'],
})
export class EditCustomerReceiptComponent {
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() receiprtFormData: any;
  @Input() readOnlyMode: boolean = false;
  @Input() isReadOnlyMode: boolean = false;
  @Input() canApprove: boolean = false;
  @Input() isVerifyReceipt: boolean = false;
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
  totalPending: any;
  selectedPaymentMode: any;
  pdcPopupVisible: boolean;
  selectedLedger: any;
  pdcList: any;
  selectedstoreId: any;
  selectedCustomer: any;
  private lastReceiptMode: string | null = null;
  isSaving = false;
  settings: any;
  CashID: any;
  BankID: any;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.sessionDetails();
    const userDataString = localStorage.getItem('userData');

    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.companyList = userData.Companies || [];

      if (this.companyList.length > 0) {
        this.selectedCompanyId = this.companyList[1].COMPANY_ID;
        this.onCustomerChanged({ value: this.selectedCompanyId });
      }
    } else {
    }
    // this.getInvoiceList();
    this.getLedgerCodeDropdown();
    // this.getCompanyListDropdown();
    this.getReceiptNo();
    this.AC_Default();
  }

  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selectedstoreId = sessionData.Configuration[0].STORE_ID;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['receiprtFormData'] && this.receiprtFormData) {
      const firstReceipt = this.receiprtFormData[0];
      if (firstReceipt.REC_DATE && typeof firstReceipt.REC_DATE === 'string') {
        const [day, month, year] = firstReceipt.REC_DATE.split('-').map(Number);
        firstReceipt.REC_DATE = `${year}-${String(month).padStart(
          2,
          '0',
        )}-${String(day).padStart(2, '0')}`;
        // Now REC_DATE = "2025-12-11"
      }
      if (
        firstReceipt.CHEQUE_DATE &&
        typeof firstReceipt.CHEQUE_DATE === 'string'
      ) {
        // Handles "dd-MM-yyyy"
        if (firstReceipt.CHEQUE_DATE.includes('-')) {
          const [day, month, year] =
            firstReceipt.CHEQUE_DATE.split('-').map(Number);

          firstReceipt.CHEQUE_DATE = new Date(year, month - 1, day);
        } else {
          // ISO fallback
          firstReceipt.CHEQUE_DATE = new Date(firstReceipt.CHEQUE_DATE);
        }
      }

      this.receiprtFormData = firstReceipt; // assign for form binding

      this.selectedDistributorId = Number(firstReceipt.DISTRIBUTOR_ID);

      if (!this.ledgerList?.length) {
        this.getLedgerCodeDropdown();
      } else if (this.receiptMode) {
        this.onReceiptModeChange({ value: this.receiptMode });
      }
      this.selectedCompanyId = firstReceipt.COMPANY_ID;

      this.getCompanyListDropdown();

      this.mainInvoiceGridList = firstReceipt.REC_DETAIL || [];
      this.selectedDistributorId = Number(firstReceipt.DISTRIBUTOR_ID);

      // NOW call invoice list
      this.getInvoiceList();
      this.selectedRowsKeys = this.mainInvoiceGridList
        .filter((row: any) => Number(row.AMOUNT) > 0)
        .map((row: any) => row.BILL_ID);
      switch (this.receiprtFormData.PAY_TYPE_ID) {
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
      if (!this.distributorList || this.distributorList.length === 0) {
        this.getCompanyListDropdown();
      }
      if (this.ledgerList?.length > 0 && this.receiptMode) {
        this.onReceiptModeChange({ value: this.receiptMode });
      }
      if (this.ledgerList?.length > 0 && this.receiptMode) {
        this.onReceiptModeChange({ value: this.receiptMode });
      }

      this.customerType = firstReceipt.DISTRIBUTOR_ID ? 'Dealer' : 'Unit';
    }
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
    if (!this.selectedDistributorId) return;

    const payload = {
      CUST_ID: this.selectedDistributorId,
      COMPANY_ID: this.selectedCompanyId,
    };

    this.dataService
      .getInvoiceListForCustomerReceipt(payload)
      .subscribe((response: any) => {
        const pendingList = response.Data || [];
        const savedDetails = this.mainInvoiceGridList || [];
        if (this.isReadOnlyMode) {
          this.pendingInvoiceList = savedDetails.map((row: any) => ({
            ...row,
            AMOUNT: row.AMOUNT, // preserve saved amount
          }));

          this.selectedRowsKeys = savedDetails.map((row: any) => row.BILL_ID);

          setTimeout(() => {
            this.itemsGridRef?.instance?.refresh();
          }, 0);

          return; //  stop further processing
        }

        if (pendingList.length > 0) {
          // ✅ Merge pending + saved
          this.pendingInvoiceList = pendingList.map((p) => {
            const matched = savedDetails.find((s) => s.BILL_ID === p.BILL_ID);
            return {
              ...p,
              AMOUNT: matched?.AMOUNT || 0,
            };
          });
        } else {
          // ✅ FALLBACK (this is what was missing)
          this.pendingInvoiceList = [...savedDetails];
        }

        // ✅ Always select saved rows
        this.selectedRowsKeys = savedDetails.map((s) => s.BILL_ID);
      });
  }

  getCompanyListDropdown() {
    const payload = {
      NAME: 'CUSTOMER',
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.distributorList = response;
    });
  }

  getLedgerCodeDropdown() {
    this.dataService.getActiveLedger().subscribe({
      next: (response: any) => {
        this.ledgerList = response?.Data || [];

        // ✅ Only apply filter if receiptMode already has a value
        if (this.receiptMode) {
          this.onReceiptModeChange({ value: this.receiptMode });
        } else {
          this.filteredLedgerList = [...this.ledgerList]; // default full list
        }
      },
      error: (err) => {
        console.error('Ledger API Error:', err);
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

  onReceiptModeChange(e: any) {
    const newMode = e.value;

    // Only clear when user actually changes mode
    if (this.lastReceiptMode && this.lastReceiptMode !== newMode) {
      this.clearBankAndLedgerDetails();
    }

    this.receiptMode = newMode;
    this.lastReceiptMode = newMode;

    // Sync PAY_TYPE_ID
    switch (newMode) {
      case 'Cash':
        this.receiprtFormData.PAY_TYPE_ID = 1;
        break;
      case 'Bank':
        this.receiprtFormData.PAY_TYPE_ID = 2;
        break;
      case 'PDC':
        this.receiprtFormData.PAY_TYPE_ID = 3;
        break;
      case 'Adjustments':
        this.receiprtFormData.PAY_TYPE_ID = 4;
        break;
      default:
        this.receiprtFormData.PAY_TYPE_ID = null;
    }

    this.applyReceiptModeFilter();
  }

  clearPdcFields() {
    this.receiprtFormData.CHEQUE_NO = '';
    this.receiprtFormData.CHEQUE_DATE = null;
    this.receiprtFormData.BANK_NAME = '';
    this.receiprtFormData.AMOUNT = '';
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

  onSearchCheque() {
    if (this.receiptMode !== 'PDC') return;
    // Show popup
    this.pdcPopupVisible = true;

    // Example: you can fetch from API based on PAY_HEAD_ID
    this.getPdcofSelectedSupplier();
  }

  getPdcofSelectedSupplier() {
    const payload = {
      CUST_ID: this.selectedDistributorId,
      LEDGER_ID: this.receiprtFormData.PAY_HEAD_ID,
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

  onPdcSelected(e: any) {
    const selectedCheque = e.data;
    const chequeAmount = Number(selectedCheque.AMOUNT || 0);
    this.receiprtFormData = {
      ...this.receiprtFormData,
      CHEQUE_NO: selectedCheque.CHEQUE_NO,
      BANK_NAME: selectedCheque.BANK_NAME,
      CHEQUE_DATE: selectedCheque.DUE_DATE
        ? new Date(
            selectedCheque.DUE_DATE.split('-')[2],
            selectedCheque.DUE_DATE.split('-')[1] - 1,
            selectedCheque.DUE_DATE.split('-')[0],
          )
        : null,
      NET_AMOUNT: chequeAmount,
      AMOUNT: chequeAmount, //  important
    };

    this.pdcPopupVisible = false;
  }

  clearBankAndLedgerDetails() {
    // Clear bank / PDC fields
    this.receiprtFormData = {
      ...this.receiprtFormData,
      CHEQUE_NO: null,
      CHEQUE_DATE: null,
      BANK_NAME: null,
      AMOUNT: null,
      NET_AMOUNT: null,
      PAY_HEAD_ID: null,
    };

    this.selectedLedger = null;

    // Clear PDC popup
    this.pdcPopupVisible = false;
    this.pdcList = [];
  }

  onGridContentReady(e: any) {
    if (e.component) {
      this.totalPendingAmount =
        e.component.getTotalSummaryValue('PENDING_AMOUNT');
    }
    if (this.pendingInvoiceList?.length && this.selectedRowsKeys?.length) {
      this.selectedRowsCount = this.selectedRowsKeys.length;
    }
  }

  getReceiptNo() {
    this.dataService.getReceiptNo().subscribe((response: any) => {
      this.receiptNo = response.RECEIPT_NO;
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
    // Disable selection checkbox when in read-only mode
    if (e.parentType === 'dataRow' && e.dataField === 'selected') {
      if (this.isReadOnlyMode) {
        e.editorOptions.readOnly = true;
        e.editorOptions.disabled = true;
      }
    }

    // Disable header checkbox (select all)
    if (e.parentType === 'headerRow' && e.dataField === 'selected') {
      if (this.isReadOnlyMode) {
        e.editorOptions.readOnly = true;
        e.editorOptions.disabled = true;
      }
    }
    if (e.parentType !== 'dataRow') return;

    if (e.dataField === 'AMOUNT') {
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

  onSelectionChanged(e: any) {
    // Prevent selection changes in read-only mode
    if (this.isReadOnlyMode) {
      // Reset selection to previous state
      e.component.selectRows(this.selectedRowsKeys, false);
      return;
    }
    const selectedIds = e.selectedRowKeys;
    this.selectedRowsCount = e.selectedRowsData.length;

    let deduction = 0;

    // Reset RECEIVED_AMOUNT for unselected rows
    this.pendingInvoiceList.forEach((row: any) => {
      if (!selectedIds.includes(row.BILL_ID)) {
        deduction += Number(row.AMOUNT || 0);
        row.AMOUNT = 0;
      }
    });

    // Update NET_AMOUNT after deduction
    this.receiprtFormData.NET_AMOUNT =
      Number(this.receiprtFormData.NET_AMOUNT || 0) - deduction;

    // ✅ Calculate total of selected RECEIVED_AMOUNT
    const selectedTotal = e.selectedRowsData.reduce(
      (sum: number, row: any) => sum + Number(row.AMOUNT || 0),
      0,
    );

    // ✅ Update the summary footer dynamically
    e.component
      .option('summary.totalItems')
      .forEach((item: any, index: number) => {
        if (item.name === 'selectedTotal') {
          e.component.option(
            `summary.totalItems[${index}].value`,
            selectedTotal,
          );
        }
      });

    // ✅ Force grid refresh if needed
    this.pendingInvoiceList = [...this.pendingInvoiceList];
  }

  onCustomerChanged(event: any): void {
    const selectedId = event.value;
    if (selectedId) {
      this.selectedCustomer = this.distributorList.find(
        (s: any) => s.ID === selectedId,
      );
      this.receiprtFormData.PARTY_NAME = this.selectedCustomer.DESCRIPTION;
    }
    if (selectedId) {
      // this.getInvoiceList();
    }
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
    this.totalPending = Number(this.fillAmountData.field1);

    // if (isNaN(this.totalPending) || this.totalPending <= 0) {
    //   notify('Please enter a valid fill amount first.', 'warning', 3000);
    //   return;
    // }

    const selectedRows =
      this.itemsGridRef?.instance?.getSelectedRowsData() || [];

    if (selectedRows.length === 0) {
      notify('Please select at least one row', 'warning', 3000);
      return;
    }

    selectedRows.forEach((row: any) => {
      const pending = Number(row.PENDING_AMOUNT);

      if (pending <= this.totalPending) {
        row.AMOUNT = pending;
        this.totalPending -= pending;
      } else {
        row.AMOUNT = 0; // Skip partial fills
      }
    });

    // Trigger change detection if needed
    this.pendingInvoiceList = [...this.pendingInvoiceList];
  }

  saveReceipt() {}

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

  calculateTotalPending() {}

  submitAmountPopup() {
    const enteredAmount = Number(this.fillAmountData.field1);

    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      notify('Please enter a valid received amount.', 'warning', 3000);
      return;
    }

    const selectedRows =
      this.itemsGridRef?.instance?.getSelectedRowsData() || [];

    if (!selectedRows.length) {
      notify('Please select at least one row.', 'warning', 3000);
      return;
    }

    // ✅ STEP 1: RESET all selected rows first
    selectedRows.forEach((row: any) => {
      row.AMOUNT = 0;
    });

    // ✅ STEP 2: DISTRIBUTE amount sequentially
    let remaining = enteredAmount;

    for (const row of selectedRows) {
      const pending = Number(row.PENDING_AMOUNT) || 0;

      if (remaining <= 0) {
        row.AMOUNT = 0;
        continue;
      }

      if (remaining >= pending) {
        row.AMOUNT = pending;
        remaining -= pending;
      } else {
        row.AMOUNT = remaining;
        remaining = 0;
      }
    }

    // ✅ Refresh grid
    this.pendingInvoiceList = [...this.pendingInvoiceList];

    // Close popup
    this.showFillAmountPopup = false;

    notify('Amounts filled successfully.', 'success', 2000);
  }

  resetForm() {
    this.fillAmountData = { field1: 0, field2: 0 };
    this.amountError = '';
    this.receiprtFormData = {
      TRANS_TYPE: 27,
      REC_NO: '',
      REC_DATE: new Date(),
      COMPANY_ID: 1,
      STORE_ID: 0,
      FIN_ID: 1,
      TRANS_STATUS: 1,
      REF_NO: '',
      UNIT_ID: '',
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
    this.selectedCompanyId = '';
    this.selectedDistributorId = '';
    this.pendingInvoiceList?.forEach((row) => (row.AMOUNT = 0));
    this.pendingInvoiceList = [];
  }

  handleCancel() {
    this.resetFillAmountForm();
    this.showFillAmountPopup = false;
  }

onSaveClick(): void {
  const status = this.receiprtFormData.TRANS_STATUS;
  console.log(status)
  // APPROVE / COMMIT
  if (
    this.receiprtFormData.IS_APPROVED ||
    this.receiprtFormData.TRANS_STATUS === 2 && this.canApprove ===true
  ) {
    confirm(
      'It will approve and commit. Are you sure you want to commit?',
      'Confirm Commit'
    ).then((dialogResult) => {
      if (dialogResult) {
        this.isSaving = true;
        this.commitReceipt();
      }
    });

    return;
  }

  // VERIFY
  if (this.isVerifyReceipt === true) {
    confirm(
      'Are you sure you want to verify this Customer Receipt?',
      'Confirm Verification'
    ).then((dialogResult) => {
      if (dialogResult) {
        this.isSaving = true;
        this.VerifyReceipt();
      } else {
        this.isSaving = false;
        notify('Verification cancelled', 'info', 2000);
      }
    });

    return;
  }

  // NORMAL UPDATE
  this.isSaving = true;
  this.UpdateReceipt();
}



  onConfirmCommit(): void {
    this.showCommitConfirmPopup = false;

    // Now call your commit API
    this.commitReceipt(); // <-- you define this method to handle commit logic
  }

  commitReceipt(): void {
    const selectedRows =
      this.itemsGridRef?.instance?.getSelectedRowsData() || [];
    const validDetails = selectedRows
      .filter((row: any) => Number(row.AMOUNT) > 0)
      .map((row: any) => ({
        BILL_ID: row.BILL_ID,
        AMOUNT: Number(row.AMOUNT),
      }));
    const netAmount = validDetails.reduce(
      (sum: number, row: any) => sum + row.AMOUNT,
      0,
    );
    this.receiprtFormData.PAY_TYPE_ID = this.receiprtFormData.PAY_TYPE_ID;
    this.receiprtFormData.NET_AMOUNT = netAmount;
    this.receiprtFormData.BANK_NAME = this.receiprtFormData.BANK_NAME;

    const commitPayload = {
      ...this.receiprtFormData,
      DISTRIBUTOR_ID: this.selectedDistributorId, // or whatever your selected supplier ID is
      REC_DETAIL: validDetails,
      TRANS_ID: this.receiprtFormData.TRANS_ID,
      IS_APPROVED: true,
    };
    this.dataService.commitCustomerReceipt(commitPayload).subscribe({
      next: () => {
        this.isSaving = false;
        notify('Receipt committed successfully!', 'success', 2000);

        // Emit popup close event
        this.popupClosed.emit();

        // Reset form
        // this.resetForm();
      },
      error: () => {
        this.isSaving = false;
        notify('Commit failed.', 'error', 2000);
      },
    });
  }

  UpdateReceipt() {
    // Determine customer
    if (!this.selectedDistributorId || this.selectedDistributorId == '') {
      notify('Please select a customer', 'warning', 3000);
      return;
    }
    const selectedRows =
      this.itemsGridRef?.instance?.getSelectedRowsData() || [];

    const validDetails = selectedRows
      .filter((row: any) => Number(row.AMOUNT) > 0)
      .map((row: any) => ({
        BILL_ID: row.BILL_ID,
        AMOUNT: Number(row.AMOUNT),
      }));

    if (validDetails.length === 0) {
      notify(
        'Please enter a valid Received Amount for at least one selected row',
        'warning',
        3000,
      );
      return;
    }

    const netAmount = validDetails.reduce(
      (sum: number, row: any) => sum + row.AMOUNT,
      0,
    );
    // this.receiprtFormData.PAY_TYPE_ID = 1;
    this.receiprtFormData.PAY_TYPE_ID = this.receiprtFormData.PAY_TYPE_ID;
    this.receiprtFormData.NET_AMOUNT = netAmount;
    this.receiprtFormData.BANK_NAME = this.receiprtFormData.BANK_NAME;
    // Build payload with only SUPP_ID and REC_DETAIL
    const payload = {
      ...this.receiprtFormData,
      DISTRIBUTOR_ID: this.selectedDistributorId, // or whatever your selected supplier ID is
      REC_DETAIL: validDetails,
    };

    // Call API
    this.dataService.updateReceipt(payload).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        if (response.flag == 1) {
          notify('Receipt updated successfully', 'success', 3000);
          this.popupClosed.emit();
          // this.resetForm(); // or navigate back
        }
        // else {
        //   notify('Failed to update receipt', 'error', 3000);
        // }
      },
      error: (err) => {
        this.isSaving = false;
        notify('An error occurred while updating the receipt', 'error', 3000);
      },
    });
  }



  VerifyReceipt() {
  if (!this.selectedDistributorId || this.selectedDistributorId == '') {
    notify('Please select a customer', 'warning', 3000);
    return;
  }

  const selectedRows =
    this.itemsGridRef?.instance?.getSelectedRowsData() || [];

  const validDetails = selectedRows
    .filter((row: any) => Number(row.AMOUNT) > 0)
    .map((row: any) => ({
      BILL_ID: row.BILL_ID,
      AMOUNT: Number(row.AMOUNT),
    }));

  if (validDetails.length === 0) {
    notify(
      'Please enter a valid Received Amount for at least one selected row',
      'warning',
      3000,
    );
    return;
  }

  const netAmount = validDetails.reduce(
    (sum: number, row: any) => sum + row.AMOUNT,
    0,
  );

  this.receiprtFormData.NET_AMOUNT = netAmount;

  const payload = {
    ...this.receiprtFormData,
    DISTRIBUTOR_ID: this.selectedDistributorId,
    REC_DETAIL: validDetails,
  };

  this.dataService.verifyReceipt(payload).subscribe({
    next: (response: any) => {
      this.isSaving = false;

      if (response.Flag == 1 || response.flag == 1) {
        notify('Receipt verified successfully', 'success', 3000);
        this.popupClosed.emit();
      }
    },
    error: () => {
      this.isSaving = false;
      notify('An error occurred while verifying the receipt', 'error', 3000);
    },
  });
}

  resetFillAmountForm() {
    this.fillAmountData.field1 = 0;
    this.amountError = '';
  }

  cancel() {
    this.popupClosed.emit();
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
  declarations: [EditCustomerReceiptComponent],
  exports: [EditCustomerReceiptComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditCustomerReceiptModule {}
