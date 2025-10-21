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
import { EditCustomerReceiptComponent } from '../edit-customer-receipt/edit-customer-receipt.component';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-view-customer-receipt',
  templateUrl: './view-customer-receipt.component.html',
  styleUrls: ['./view-customer-receipt.component.scss'],
})
export class ViewCustomerReceiptComponent {
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() receiprtFormData: any;
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
  totalPending: any;
  selectedPaymentMode: any;
  pdcPopupVisible: boolean;
  selectedLedger: any;
  pdcList: any;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    const userDataString = localStorage.getItem('userData');

    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.companyList = userData.Companies || [];

      if (this.companyList.length > 0) {
        this.selectedCompanyId = this.companyList[1].COMPANY_ID;
        this.onCustomerChanged({ value: this.selectedCompanyId });
      }

      console.log('Loaded Companies:', this.companyList);
    } else {
      console.warn('No userData found in localStorage');
    }
    this.getInvoiceList();
    this.getLedgerCodeDropdown();
    // this.getCompanyListDropdown();
    this.getReceiptNo();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['receiprtFormData'] && this.receiprtFormData) {
      console.log('INVOICEFORMDATA:', this.receiprtFormData);
      const firstReceipt = this.receiprtFormData[0];
      if (firstReceipt.REC_DATE && typeof firstReceipt.REC_DATE === 'string') {
        const [day, month, year] = firstReceipt.REC_DATE.split('-').map(Number);
        firstReceipt.REC_DATE = new Date(year, month - 1, day); // month is 0-based
      }
      this.receiprtFormData = firstReceipt; // assign for form binding
      this.selectedDistributorId = Number(firstReceipt.DISTRIBUTOR_ID);
      this.getCompanyListDropdown(firstReceipt.ID);
      console.log(
        this.selectedDistributorId,
        'SELECTEDDISTRIIIIIIIIIIIIIIIIIIIII'
      );
      if (!this.ledgerList?.length) {
        this.getLedgerCodeDropdown();
      } else if (this.receiptMode) {
        this.onReceiptModeChange({ value: this.receiptMode });
      }
      this.selectedCompanyId = firstReceipt.UNIT_ID;
      console.log(
        this.receiprtFormData.PAY_TYPE_ID,
        'PAYTYPEIDDDDDDDDDDDDDD+++++++++++++++++++'
      );
      // ✅ Filter only the selected company
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const allCompanies = userData.Companies || [];
        this.companyList = allCompanies.filter(
          (company: any) => company.COMPANY_ID === this.selectedCompanyId
        );
      }
      this.mainInvoiceGridList = firstReceipt.REC_DETAIL || []; // ✅ Store REC_DETAIL separately
      this.pendingInvoiceList = [...this.mainInvoiceGridList];
      this.selectedRowsKeys = this.pendingInvoiceList
        .filter((row) => row.AMOUNT > 0) // or use your own condition
        .map((row) => row.BILL_ID);
      console.log(this.receiprtFormData.PAY_TYPE_ID, 'PAYTYPEIDDDDDDDDDDDDDDD');
      console.log('mainInvoiceGridList:', this.mainInvoiceGridList);
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

      console.log(
        'PAY_TYPE_ID:',
        firstReceipt.PAY_TYPE_ID,
        'Mapped receiptMode:',
        this.receiptMode
      );
      console.log('receiptMode:', this.receiptMode);
      this.customerType = firstReceipt.DISTRIBUTOR_ID ? 'Dealer' : 'Unit';

      this.getCompanyListDropdown();
      this.getInvoiceList();
    }
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
        const allInvoices = response.Data || [];
        const recDetails = this.mainInvoiceGridList || [];

        const selectedKeys: number[] = [];

        recDetails.forEach((detail) => {
          const billId = +detail.BILL_ID;

          const matchedInvoice = allInvoices.find(
            (invoice: any) => +invoice.BILL_ID === billId
          );

          if (matchedInvoice) {
            matchedInvoice.AMOUNT = detail.AMOUNT;
            selectedKeys.push(billId);
          }
        });

        this.pendingInvoiceList = allInvoices;
        this.selectedRowsKeys = selectedKeys;

        console.log('Matched Invoices:', this.pendingInvoiceList);
        console.log('Selected Row Keys:', this.selectedRowsKeys);
      });
  }

  getCompanyListDropdown(id?: number) {
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.distributorList = response;
      console.log(this.distributorList, 'distributorList');

      // Use id if needed
      if (id) {
        console.log('Called with ID:', id);
        // You can filter distributorList based on id if required
      }

      // Set selectedDistributorId only after distributorList is loaded
      if (
        this.customerType === 'Dealer' &&
        this.receiprtFormData?.DISTRIBUTOR_ID
      ) {
        this.selectedDistributorId = this.receiprtFormData.DISTRIBUTOR_ID;
      }
    });
  }

  // getCompanyListDropdown() {
  //   this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
  //     this.distributorList = response;
  //     console.log(this.distributorList, 'distributorList');

  //     // Set selectedDistributorId only after distributorList is loaded
  //     if (
  //       this.customerType === 'Dealer' &&
  //       this.receiprtFormData?.DISTRIBUTOR_ID
  //     ) {
  //       this.selectedDistributorId = this.receiprtFormData.DISTRIBUTOR_ID;
  //     }
  //   });
  // }

  getLedgerCodeDropdown() {
    this.dataService.getAccountHeadList().subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        this.ledgerList = response?.Data || [];

        // ✅ Only apply filter if receiptMode already has a value
        if (this.receiptMode) {
          this.onReceiptModeChange({ value: this.receiptMode });
        } else {
          this.filteredLedgerList = [...this.ledgerList]; // default full list
        }

        console.log('Ledger List Loaded:', this.ledgerList);
      },
      error: (err) => {
        console.error('Ledger API Error:', err);
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

  onReceiptModeChange(e: any) {
    this.receiptMode = e.value;

    // ✅ Keep PAY_TYPE_ID in sync with selected mode
    switch (this.receiptMode) {
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

    console.log('Updated PAY_TYPE_ID:', this.receiprtFormData.PAY_TYPE_ID);
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

  onSearchCheque() {
    // Show popup
    this.pdcPopupVisible = true;

    // Example: you can fetch from API based on PAY_HEAD_ID
    this.getPdcofSelectedSupplier();
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

  onGridContentReady(e: any) {
    if (e.component) {
      this.totalPendingAmount =
        e.component.getTotalSummaryValue('PENDING_AMOUNT');
      console.log('Total Pending Amount:', this.totalPendingAmount);
    }
  }

  // onSelectionChanged(e: any) {
  //   this.selectedRowsCount = e.selectedRowsData.length;
  // }

  getReceiptNo() {
    this.dataService.getReceiptNo().subscribe((response: any) => {
      this.receiptNo = response.RECEIPT_NO;
      console.log(this.receiptNo, 'RECEIPTNOOOOO ');
    });
  }

  onSelectionChanged(e: any) {
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

    console.log('Updated NET_AMOUNT:', this.receiprtFormData.NET_AMOUNT);

    // ✅ Calculate total of selected RECEIVED_AMOUNT
    const selectedTotal = e.selectedRowsData.reduce(
      (sum: number, row: any) => sum + Number(row.AMOUNT || 0),
      0
    );

    // ✅ Update the summary footer dynamically
    e.component
      .option('summary.totalItems')
      .forEach((item: any, index: number) => {
        if (item.name === 'selectedTotal') {
          e.component.option(
            `summary.totalItems[${index}].value`,
            selectedTotal
          );
        }
      });

    // ✅ Force grid refresh if needed
    this.pendingInvoiceList = [...this.pendingInvoiceList];
  }

  onCustomerChanged(event: any): void {
    console.log('===================');
    const selectedId = event.value;
    console.log(selectedId, 'SELECTEDID');
    if (selectedId) {
      this.getInvoiceList();
    }
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
        row.AMOUNT = pending;
        remainingAmount -= pending;
      } else {
        row.AMOUNT = remainingAmount;
        remainingAmount = 0;
      }
    }

    // ✅ Update grid data source
    this.pendingInvoiceList = [...this.pendingInvoiceList];

    // ✅ Close popup
    this.showFillAmountPopup = false;

    notify('Amounts filled successfully.', 'success', 3000);
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
    if (this.receiprtFormData.IS_APPROVED) {
      const result = confirm(
        'It will approve and commit. Are you sure you want to commit?',
        'Confirm Commit'
      );

      result.then((dialogResult) => {
        if (dialogResult) {
          this.commitReceipt(); // call your API if user clicked "Yes"
        }
      });
    } else {
      this.UpdateReceipt(); // normal update
    }
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
      0
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
    console.log(commitPayload, 'COMMITPAYLOADDDDDDDDDDDDDDDDDDDDDDDD');
    this.dataService.commitCustomerReceipt(commitPayload).subscribe({
      next: () => {
        notify('Receipt committed successfully!', 'success', 2000);

        // Emit popup close event
        this.popupClosed.emit();

        // Reset form
        this.resetForm();
      },
      error: () => {
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
        3000
      );
      return;
    }

    const netAmount = validDetails.reduce(
      (sum: number, row: any) => sum + row.AMOUNT,
      0
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

    console.log('Sending payload:', payload); // For debugging
    // Call API
    this.dataService.updateReceipt(payload).subscribe({
      next: (response: any) => {
        if (response.flag == 1) {
          notify('Receipt updated successfully', 'success', 3000);
          this.popupClosed.emit();
          this.resetForm(); // or navigate back
        }
        // else {
        //   notify('Failed to update receipt', 'error', 3000);
        // }
      },
      error: (err) => {
        console.error('Update error:', err);
        notify('An error occurred while updating the receipt', 'error', 3000);
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
  declarations: [ViewCustomerReceiptComponent],
  exports: [ViewCustomerReceiptComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ViewCustomerReceiptModule {}
