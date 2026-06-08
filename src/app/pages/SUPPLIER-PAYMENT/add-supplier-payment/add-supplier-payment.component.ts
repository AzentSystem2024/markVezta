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
import { AddInvoiceComponent } from '../../INVOICE/add-invoice/add-invoice.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

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
  @Input() canApprove: boolean = false;
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
    RECEIPT_NO: 0,
    REF_NO: '',
    CHEQUE_NO: '',
    CHEQUE_DATE: '',
    NARRATION: '',
    PAY_TYPE_ID: '',
    PAY_HEAD_ID: '',
    ADD_TIME: '',
    SUPPLIER_ID: '',
    NET_AMOUNT: '',
    PDC_ID: 0,
    PARTY_NAME: '',
    IS_APPROVED: false,
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
  companyState: any;
  companyStateID: any;
  selectedCompanyId: any;
  companyList: any[];
  selected_Company_id: any;
  docNo: any;
  isFillAmountValid: boolean;
  isSaving = false;
  finID: any;
  settings: any;
  CashID: any;
  BankID: any;

  constructor(
    private dataService: DataService,
    private ngZone: NgZone,
  ) {
    this.sesstion_Details();
    this.getDocNo();
    this.AC_Default();
  }

  ngOnInit() {
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
    this.getReceiptNo();
    this.getLedgerCodeDropdown();
    this.getSupplierDropdown();
    this.applyReceiptModeFilter();
    this.getPdcofSelectedSupplier();
    this.sesstion_Details();
    this.getDocNo();
    this.AC_Default();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  AC_Default() {
    const payload = {
      CompanyID: this.selected_Company_id,
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

  getDocNo() {
    const payload = {
      TRANS_TYPE: 21,
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.docNo = response.DOC_NO;
    });
  }

  validateReceivedAmount = (e: any) => {
    if (!e || !e.data) return true;

    const value = Number(e.value);
    const pending = Number(e.data.PENDING_AMOUNT);

    // Allow 0 or empty values
    if (!e.value || value === 0) {
      return true;
    }

    // ✅ Allow received amount ≤ pending amount
    return value <= pending;
  };

  getPendingInvoiceList(supplierId: number) {
    const payload = {
      SUPP_ID: supplierId,
      COMPANY_ID: this.selected_Company_id,
    };

    this.dataService
      .getPendingInvoiceforSupplierPayment(payload)
      .subscribe((response: any) => {
        this.pendingInvoicelist = response.Data;
      });
  }

  onSupplierChanged(event: any) {
    this.selectedSupplierId = event.value;

    if (this.selectedSupplierId) {
      this.paymentFormData.SUPPLIER_ID = this.selectedSupplierId;
      this.getPendingInvoiceList(this.selectedSupplierId); // Pass supplier ID here
    } else {
      this.pendingInvoicelist = [];
    }
  }

  getSupplierDropdown() {
    const payload = {
      NAME: 'SUPPLIER',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.supplierList = response;
    });
  }

  // onEditorPreparing(e: any) {
  //   if (e.dataField === 'RECEIVED_AMOUNT') {
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

  selectAllRows() {
    if (!this.itemsGridRef?.instance || !this.pendingInvoicelist?.length) {
      return;
    }

    const allKeys = this.pendingInvoicelist.map((item: any) => item.BILL_ID);

    this.itemsGridRef.instance.selectRows(allKeys, false);
  }

  clearSelection() {
    this.itemsGridRef?.instance.clearSelection();
  }

  onEditorPreparing(e: any) {
    if (e.parentType === 'dataRow' && e.dataField === 'RECEIVED_AMOUNT') {
      const grid = this.itemsGridRef?.instance;

      if (!grid) return;

      const selectedKeys = grid.getSelectedRowKeys();
      const isSelected = selectedKeys.includes(e.row.key);

      e.editorOptions = e.editorOptions || {};

      // disable editing for unselected rows
      e.editorOptions.readOnly = !isSelected;

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
            grid.focus(grid.getCellElement(rowIndex + 1, 'RECEIVED_AMOUNT'));
          }, 50);
        }
      };
    }
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
    //            //   });
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.distributorList = response;
      console.log(this.distributorList, 'distributorList');
    });
  }

  getLedgerCodeDropdown() {
    this.dataService.getActiveLedger().subscribe({
      next: (response: any) => {
        console.log('API Response:', response); // <== LOG FULL RESPONSE
        this.ledgerList = response?.Data || []; // Fallback to empty array
        this.onReceiptModeChange({ value: this.receiptMode });
        console.log(
          'Ledger List Loaded=============================:',
          this.ledgerList,
        );
      },
      error: (err) => {
        console.error('Ledger API Error:', err); // <== CATCH ERRORS
      },
    });
  }

  // onReceiptModeChange(e: any) {
  //   this.receiptMode = e.value;
  //   this.applyReceiptModeFilter();
  // }

  onReceiptModeChange(e: any) {
    const newMode = e.value;

    // If mode is actually changed
    if (this.receiptMode !== newMode) {
      this.clearBankAndPdcFields();
    }

    this.receiptMode = newMode;
    this.applyReceiptModeFilter();
  }

  clearBankAndPdcFields() {
    this.paymentFormData.CHEQUE_NO = '';
    this.paymentFormData.CHEQUE_DATE = null;
    this.paymentFormData.BANK_NAME = '';
    this.paymentFormData.AMOUNT = null;
    this.paymentFormData.PDC_ID = 0;

    // Optional but safer
    this.paymentFormData.PAY_HEAD_ID = null;

    // Close PDC popup if open
    this.pdcPopupVisible = false;
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
    console.log('ONPDCCHANGED');
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
        Number(parts[0]), // day
      );
    } else {
      this.paymentFormData.CHEQUE_DATE = null;
    }
    this.paymentFormData.BANK_NAME = selectedCheque.BANK_NAME;
    this.paymentFormData.AMOUNT = selectedCheque.AMOUNT;
    this.paymentFormData.PDC_ID = selectedCheque.ID;
    this.pdcPopupVisible = false;
  }

  onSelectionChanged(e: any) {
    this.selectedRowsCount = e.selectedRowsData.length;

    const selectedKeys = e.selectedRowKeys || [];

    // update textbox value
    this.totalPending = e.selectedRowsData.reduce(
      (sum: number, row: any) => sum + (Number(row.PENDING_AMOUNT) || 0),
      0,
    );

    this.pendingInvoicelist.forEach((row: any) => {
      if (!selectedKeys.includes(row.BILL_ID)) {
        row.RECEIVED_AMOUNT = 0;
      }
    });

    e.component.refresh(true);
  }

  formatPending = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value || 0);
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

    let remaining = fillAmount;

    const selectedKeys =
      this.itemsGridRef?.instance?.getSelectedRowKeys() || [];

    if (selectedKeys.length === 0) {
      notify('Please select at least one row', 'warning', 3000);
      return;
    }

    const EPSILON = 0.01;

    // loop through full invoice list in display order
    this.pendingInvoicelist.forEach((row: any) => {
      // only process selected rows
      if (selectedKeys.includes(row.BILL_ID)) {
        const pending = Number(row.PENDING_AMOUNT) || 0;

        if (remaining > EPSILON) {
          row.RECEIVED_AMOUNT = Math.min(pending, remaining);
          remaining -= row.RECEIVED_AMOUNT;
        } else {
          row.RECEIVED_AMOUNT = 0;
        }
      }
    });

    this.pendingInvoicelist = [...this.pendingInvoicelist];
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
    this.resetForm();

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

      // Clamp back to totalPending
      this.isFillAmountValid = false;
      return;
    }
    this.isFillAmountValid = true;
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

  getReceiptNo() {
    const payload = {
      TRANS_TYPE: 21,
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.receiptNo = response.RECEIPT_NO;
      this.paymentFormData.DOC_NO = response.DOC_NO;
      console.log(response.RECEIPT_NO, 'INVOICENO');
    });
  }

  saveReceipt() {
    if (!this.selectedSupplierId) {
      notify('Please select a supplier.', 'warning', 3000);
      return;
    }

    if (!this.paymentFormData.TRANS_DATE) {
      notify('Please select payment date.', 'warning', 3000);
      return;
    }

    if (!this.receiptMode) {
      notify('Please select payment mode.', 'warning', 3000);
      return;
    }

    if (!this.selectedLedger) {
      notify('Please select a ledger.', 'warning', 3000);
      return;
    }
    const selectedRows =
      this.itemsGridRef?.instance?.getSelectedRowsData() || [];

    const validDetails = selectedRows
      .filter(
        (row: any) =>
          row.RECEIVED_AMOUNT &&
          !isNaN(Number(row.RECEIVED_AMOUNT)) &&
          Number(row.RECEIVED_AMOUNT) > 0,
      )
      .map((row: any) => ({
        BILL_ID: row.BILL_ID,
        AMOUNT: Number(row.RECEIVED_AMOUNT),
      }));

    if (validDetails.length === 0) {
      notify(
        'Please enter a valid Received Amount for at least one selected row',
        'warning',
        3000,
      );
      return;
    }
    const today = new Date();
    const paymentDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');
    // 🔧 FIX: Assign SUPP_DETAIL before calling the doc
    this.paymentFormData.SUPP_DETAIL = validDetails;

    if (this.paymentFormData.CHEQUE_DATE) {
      const d = new Date(this.paymentFormData.CHEQUE_DATE);

      this.paymentFormData.CHEQUE_DATE =
        d.getFullYear() +
        '-' +
        String(d.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(d.getDate()).padStart(2, '0');
    }
    // Set PAY_TYPE_ID based on receiptMode
    const payTypeMapping: any = {
      Cash: 1,
      Bank: 2,
      PDC: 3,
      Adjustments: 4,
    };
    this.paymentFormData.TRANS_DATE = paymentDate;
    this.paymentFormData.PAY_TYPE_ID = payTypeMapping[this.receiptMode] || null;
    this.paymentFormData.UNIT_ID = 0;

    // Calculate total received amount
    const netAmount = validDetails.reduce((sum, item) => sum + item.AMOUNT, 0);
    this.paymentFormData.NET_AMOUNT = netAmount;
    // this.paymentFormData.RECEIPT_NO = this.receiptNo;
    // this.paymentFormData.REC_DATE = new Date();
    this.paymentFormData.NARRATION = this.paymentFormData.NARRATION || '';
    this.paymentFormData.PDC_ID = this.paymentFormData.PDC_ID;
    this.paymentFormData.COMPANY_ID = this.selected_Company_id;
    this.paymentFormData.FIN_ID = this.finID;
    if (this.receiptMode === 'Bank') {
      // this.paymentFormData.CHEQUE_NO = this.paymentFormData.CHEQUE_NO || '';
      this.paymentFormData.CHEQUE_NO = String(
        this.paymentFormData.CHEQUE_NO || '',
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
          4000,
        );
        return;
      }
    }

    // ✅ Call backend API
    if (this.paymentFormData.IS_APPROVED) {
      const result = confirm(
        'A new Supplier Payment will be created and approved. Do you want to continue?',
        'Confirm Approval',
      );

      result.then((dialogResult: any) => {
        if (dialogResult) {
          this.ngZone.run(() => {
            this.isSaving = true;
            this.callAPI(this.paymentFormData);
          });
        }
      });

      return;
    }
    this.isSaving = true;
    // Normal flow (Not Approved)
    this.callAPI(this.paymentFormData);
  }

  callAPI(finalPayload: any) {
    this.dataService.insertSupplierPayment(finalPayload).subscribe(
      (response: any) => {
        this.isSaving = false;
        console.log(response, 'SAVED SUCCESSFULLY');

        notify(
          {
            message: 'Supplier Payment Saved Successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );

        // DO NOT REMOVE — Needed for auto-setting voucher number
        if (response?.VoucherNo) {
          this.paymentFormData.VOUCHER_NO = response.VoucherNo;
        }

        // Reset form but keep newly assigned voucher number
        this.resetForm();

        // Close popup
        this.popupClosed.emit();
      },
      (error) => {
        this.isSaving = false;
        notify(
          'Failed to save Supplier Payment. Please try again.',
          'error',
          2000,
        );
        console.error('Save error:', error);
      },
    );
  }

  resetForm() {
    // Reset payment form data
    this.paymentFormData = {
      TRANS_TYPE: 21,
      COMPANY_ID: this.selected_Company_id,
      STORE_ID: 1,
      FIN_ID: this.finID,
      TRANS_DATE: new Date(),
      TRANS_STATUS: 1,
      RECEIPT_NO: 0,
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
  ],
  providers: [],
  declarations: [AddSupplierPaymentComponent],
  exports: [AddSupplierPaymentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddSupplierPaymentModule {}
