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
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { AddInvoiceComponent } from '../add-invoice/add-invoice.component';
import { DataService } from 'src/app/services';
import { Console } from 'console';
import notify from 'devextreme/ui/notify';
import { ViewInvoiceModule } from '../view-invoice/view-invoice.component';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-edit-invoice',
  templateUrl: './edit-invoice.component.html',
  styleUrls: ['./edit-invoice.component.scss'],
})
export class EditInvoiceComponent {
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() invoiceFormData: any;
  popupVisible = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  mainInvoiceGridList: any;
  customerType: string = 'Unit';
  customerTypes = [
    { text: 'Unit', value: 'Unit' },
    { text: 'Dealer', value: 'Dealer' },
  ];
  companyList: any;
  distributorList: any;
  invoiceGridList: any;
  isTrOutPopupVisible: boolean = false;
  staticTransfers: any;
  totalAmount: any;
  summaryValues: any;
  taxAmount: any;
  grandTotal: any;
  selectedCompanyId: any;
  userId: any;
  finId: any;
  selectedDistributorId: any;
  sessionData: any;
  selected_vat_id: any;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.populateCompanyFromSession(); // ✅ Add this
    this.getInvoiceListForGrid();
    this.sessionData_tax();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoiceFormData'] && this.invoiceFormData?.length > 0) {
      const firstInvoice = this.invoiceFormData[0];

      if (
        firstInvoice.SALE_DATE &&
        typeof firstInvoice.SALE_DATE === 'string'
      ) {
        const [day, month, year] = firstInvoice.SALE_DATE.split('-');
        const date = new Date(+year, +month - 1, +day);
        date.setHours(12, 0, 0);
        firstInvoice.SALE_DATE = date;
      }

      this.mainInvoiceGridList = firstInvoice.SALE_DETAILS || [];
      this.invoiceFormData = firstInvoice;
      console.log(this.mainInvoiceGridList, 'MAINGRIDINVOICELIST');
      this.customerType = firstInvoice.DISTRIBUTOR_ID ? 'Dealer' : 'Unit';

      if (this.customerType === 'Unit') {
        this.populateCompanyFromSession(); // ✅ call here too
      }

      this.getCompanyListDropdown();
    }
  }
  onDistributorChanged(e: any) {
    if (e && e.value) {
      this.selectedDistributorId = e.value; // ✅ this is the selected ID
      console.log('Selected Distributor ID:', this.selectedDistributorId);

      this.invoiceFormData.DISTRIBUTOR_ID = this.selectedDistributorId;
      this.invoiceFormData.UNIT_ID = 0;
    }
    this.getInvoiceListForGrid();
  }

  getInvoiceListForGrid() {
    const payload = {
      CUST_ID: this.invoiceFormData.DISTRIBUTOR_ID,
    };
    this.dataService.getInvoiceGridList(payload).subscribe((response: any) => {
      this.staticTransfers = response.Data; // Save the original full list
      console.log(
        this.staticTransfers,
        'STATISCTRANSFERS=============================='
      );
      this.invoiceGridList = [...this.staticTransfers]; // Initial value
    });
  }

  populateCompanyFromSession() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      console.log(selectedCompany, '++++++++++++++[[[[[[[[[[[[[[[[[[');
      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
        this.companyList = [selectedCompany]; // ✅ Show only selected company
      }
      console.log(this.selectedCompanyId, '+++++++++++++++++++++++');
      if (userData.USER_ID) {
        this.invoiceFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.invoiceFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
  }

  getCompanyListDropdown() {
    if (this.customerType === 'Unit') {
      // Don't overwrite the session company list
      return;
    }

    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.distributorList = response;
    });
  }
  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }
  c;

  calculateAmount = (row: any) => {
    return (parseFloat(row.PRICE) || 0) * (parseFloat(row.TOTAL_PAIR_QTY) || 0);
  };

  // calculateGstAmount = (row: any) => {
  //   const amt = this.calculateAmount(row);
  //   return amt * (parseFloat(row.GST) || 0);
  // };

  calculateGstAmount = (row: any) => {
    const amt = this.calculateAmount(row);
    const gstPercent = parseFloat(row.GST) || 0;
    return amt * (gstPercent / 100);
  };

  calculateTotal = (row: any) => {
    const amt = this.calculateAmount(row);
    const gst = this.calculateGstAmount(row);
    return amt + gst;
  };

  // calculateTotal = (row: any) => {
  //   return this.calculateAmount(row) + this.calculateGstAmount(row);
  // };

  openTrOutSelector() {
    console.log('staticTransfers:', this.staticTransfers);

    const selectedTransferNos =
      this.mainInvoiceGridList?.map((t) => t.TRANSFER_SUMMARY_ID) || [];

    // Filter the full list before showing in popup
    this.invoiceGridList = this.staticTransfers.filter(
      (item: any) => !selectedTransferNos.includes(item.TRANSFER_SUMMARY_ID)
    );
    this.isTrOutPopupVisible = true;
  }

  onTransferSelectClick() {
    const selectedRows = this.popupGridRef.instance.getSelectedRowsData();

    if (!selectedRows || selectedRows.length === 0) {
      return;
    }

    // Initialize mainInvoiceGridList if null
    if (!this.mainInvoiceGridList) {
      this.mainInvoiceGridList = [];
    }

    // Get existing IDs to avoid duplicates
    const existingTransferIds = this.mainInvoiceGridList.map(
      (item: any) => item.TRANSFER_SUMMARY_ID
    );

    // Only add new unique rows
    const newRows = selectedRows.filter(
      (row: any) => !existingTransferIds.includes(row.TRANSFER_SUMMARY_ID)
    );

    // ✅ Mutate the existing array (DON'T reassign!)
    this.mainInvoiceGridList.push(...newRows);

    // ✅ Close popup
    this.isTrOutPopupVisible = false;

    // Optional: Trigger manual change detection if needed
    this.cdr.detectChanges();
  }

  cancelPopup() {}

  logGridSummaries() {
    this.summaryValues = this.itemsGridRef?.instance?.getTotalSummaryValue;

    if (this.summaryValues) {
      this.totalAmount = this.summaryValues('AMOUNT');
      this.taxAmount = this.summaryValues('TAX_AMOUNT');
      this.grandTotal = this.summaryValues('TOTAL_AMOUNT');

      console.log('GROSS AMOUNT Summary:', this.totalAmount);
      console.log('TAX_AMOUNT Summary:', this.taxAmount);
      console.log('NET AMOUNT Summary:', this.grandTotal);
    } else {
      console.warn('Summary values not ready yet.');
    }
  }
  onContentReady(e: any): void {
    this.logGridSummaries();
  }

  updateInvoice() {
    if (!this.invoiceFormData || !this.invoiceFormData.TRANS_ID) {
      console.warn('Missing invoice data or TRANS_ID.');
      return;
    }

    if (this.invoiceFormData.IS_APPROVED) {
      confirm(
        'It will approve and commit. Are you sure you want to commit?',
        'Confirm Commit'
      ).then((dialogResult) => {
        if (dialogResult) {
          const commitPayload = {
            TRANS_ID: this.invoiceFormData.TRANS_ID,
            IS_APPROVED: true,
            TRANS_TYPE: this.invoiceFormData.TRANS_TYPE,
            REF_NO: this.invoiceFormData.REF_NO,
            SALE_ID: this.invoiceFormData.SALE_ID,
            SALE_NO: this.invoiceFormData.SALE_NO,
            SALE_DATE: this.invoiceFormData.SALE_DATE,
            UNIT_ID: this.selectedCompanyId || null,
            COMPANY_ID: this.selectedCompanyId,
            FIN_ID: this.finId || 1,
            TRANS_STATUS: 1,
            DISTRIBUTOR_ID: this.invoiceFormData.DISTRIBUTOR_ID || null,
            GROSS_AMOUNT: this.totalAmount,
            TAX_AMOUNT: this.taxAmount,
            NET_AMOUNT: this.grandTotal,
            SALE_DETAILS: this.mainInvoiceGridList.map((row: any) => ({
              TRANSFER_SUMMARY_ID: row.ID || '',
              QUANTITY: row.TOTAL_PAIR_QTY || 0,
              PRICE: row.PRICE || 0,
              GST: row.GST || 0,
              AMOUNT: this.calculateAmount(row),
              TAX_AMOUNT: this.calculateGstAmount(row),
              TOTAL_AMOUNT: this.calculateTotal(row),
            })),
          };

          console.log('Sending commit payload:', commitPayload);

          this.dataService.commitInvoice(commitPayload).subscribe({
            next: (response) => {
              console.log('Invoice committed successfully:', response);
              notify(
                {
                  message: 'Invoice committed successfully',
                  position: { at: 'top right', my: 'top right' },
                },
                'success',
                3000
              );
              this.popupClosed?.emit();
            },
            error: (err) => {
              console.error('Error committing invoice:', err);
            },
          });
        } else {
          console.log('Commit canceled by user');
        }
      });
    } else {
      const updatePayload = {
        TRANS_TYPE: this.invoiceFormData.TRANS_TYPE,
        TRANS_ID: this.invoiceFormData.TRANS_ID,
        REF_NO: this.invoiceFormData.REF_NO,
        SALE_ID: this.invoiceFormData.SALE_ID,
        SALE_NO: this.invoiceFormData.SALE_NO,
        SALE_DATE: this.invoiceFormData.SALE_DATE,
        UNIT_ID: this.selectedCompanyId || null,
        COMPANY_ID: this.selectedCompanyId,
        FIN_ID: this.finId || 1,
        TRANS_STATUS: 1,
        DISTRIBUTOR_ID: this.invoiceFormData.DISTRIBUTOR_ID || null,
        GROSS_AMOUNT: this.totalAmount,
        TAX_AMOUNT: this.taxAmount,
        NET_AMOUNT: this.grandTotal,
        SALE_DETAILS: this.mainInvoiceGridList.map((row: any) => ({
          TRANSFER_SUMMARY_ID: row.TRANSFER_SUMMARY_ID || '',
          QUANTITY: row.TOTAL_PAIR_QTY || 0,
          PRICE: row.PRICE || 0,
          GST: row.GST || 0,
          AMOUNT: this.calculateAmount(row),
          TAX_AMOUNT: this.calculateGstAmount(row),
          TOTAL_AMOUNT: this.calculateTotal(row),
        })),
      };

      console.log('Sending update payload:', updatePayload);

      this.dataService.updateInvoice(updatePayload).subscribe({
        next: (response) => {
          console.log('Invoice updated successfully:', response);
          notify(
            {
              message: 'Invoice updated successfully',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
            3000
          );
          this.popupClosed?.emit();
        },
        error: (err) => {
          console.error('Error updating invoice:', err);
        },
      });
    }
  }

  resetInvoiceForm() {}
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
    ViewInvoiceModule,
  ],
  providers: [],
  declarations: [EditInvoiceComponent],
  exports: [EditInvoiceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditInvoiceModule {}
