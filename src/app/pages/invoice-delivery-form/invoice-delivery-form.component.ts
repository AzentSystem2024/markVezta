import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
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
import { ArticleAddModule } from '../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../ARTICLE/article-edit/article-edit.component';
import { AddInvoiceComponent } from '../INVOICE/add-invoice/add-invoice.component';
import { AddJournalVoucharModule } from '../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-invoice-delivery-form',
  templateUrl: './invoice-delivery-form.component.html',
  styleUrls: ['./invoice-delivery-form.component.scss'],
})
export class InvoiceDeliveryFormComponent {
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild(AddInvoiceComponent) addInvoiceComp!: AddInvoiceComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  isApproved: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  isPopupVisible: boolean = false;
  items: any[] = [];
  // itemsForInventory: any[] = [];
  barcodeList: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  matrix: any;
  storeFromSession: any;
  stores: any;
  reasons: any;
  sessionData: any;
  selected_vat_id: any;
  selectedCompanyId: any;
  companyList: any[];

  selectedCustomerId: any;
  customer: any;
  pendingDeliveries: any;
  // invoiceFormData: any = {}
  invoiceFormData: any = {
    TRANS_TYPE: 25,
    COMPANY_ID: 0,
    STORE_ID: 0,
    TRANS_DATE: new Date(),
    TRANS_STATUS: 0,
    CREATE_USER_ID: 0,
    SALE_REF_NO: '',
    // UNIT_ID: 1,
    CUST_ID: 0,
    FIN_ID: 0,
    GROSS_AMOUNT: '',
    TAX_AMOUNT: '',
    NET_AMOUNT: '',
    REF_NO: '',
    NARRATION: '',
    SALE_DETAILS: [
      // {
      //   TRANSFER_SUMMARY_ID: '',
      //   QUANTITY: '',
      //   PRICE: '',
      //   AMOUNT: '',
      //   GST: '',
      //   TAX_AMOUNT: '',
      //   TOTAL_AMOUNT: '',
      // },
    ],
  };
  userId: any;
  voucherNo: any;
  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit() {
    this.isEditDataAvailable();
    const userDataString = localStorage.getItem('userData');
    // console.log(userDataString, 'USERDATASTRING');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;

      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
        this.companyList = [selectedCompany]; // ✅ Show only selected company
      }

      if (userData.USER_ID) {
        this.userId = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.invoiceFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
    this.getInvoiceNo();
    this.sessionData_tax();
    this.getCustomerDropdown();
  }
  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;
    console.log(this.isReadOnlyMode, 'ISREADONLYMODE');
    const data = this.EditingResponseData.Data[0];

    this.invoiceFormData = {
      TRANS_ID: data.TRANS_ID,
      COMPANY_ID: this.selectedCompanyId,
      TRANS_TYPE: 25,
      STORE_ID: data.STORE_ID ?? 0,
      TRANS_DATE: data.TRANS_DATE ? new Date(data.TRANS_DATE) : new Date(),
      TRANS_STATUS: data.TRANS_STATUS ?? 0,
      CREATE_USER_ID: data.CREATE_USER_ID ?? this.userId,
      UNIT_ID: data.UNIT_ID ?? 1,
      CUST_ID: data.CUST_ID ?? 0,
      FIN_ID: data.FIN_ID ?? this.invoiceFormData.FIN_ID,
      GROSS_AMOUNT: data.GROSS_AMOUNT ?? '',
      TAX_AMOUNT: data.TAX_AMOUNT ?? '',
      NET_AMOUNT: data.NET_AMOUNT ?? '',
      REF_NO: data.REF_NO ?? '',
      NARRATION: data.NARRATION ?? '',
      SALE_DETAILS: data.SALE_DETAILS ? [...data.SALE_DETAILS] : [],
    };
    this.voucherNo = data.SALE_NO ?? '';
    // Set customer ID from saved data
    this.selectedCustomerId = data.CUST_ID;

    // Load grid data
    if (this.itemsGridRef && data.SALE_DETAILS) {
      this.itemsGridRef.instance.option('dataSource', data.SALE_DETAILS);
    }

    // If VAT ID or other session-dependent data is involved
    if (data.VAT_ID) {
      this.selected_vat_id = data.VAT_ID;
    }

    // Trigger pending deliveries automatically in edit mode
    if (this.selectedCustomerId) {
      this.getPendingDeliveries();
    }
  }

  getCustomerDropdown() {
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.customer = response;
    });
  }
  customerChanged(event: any) {
    this.selectedCustomerId = event.value;
    this.getPendingDeliveries();
  }
  getPendingDeliveries() {
    const payload = {
      CUST_ID: this.selectedCustomerId,
    };
    this.dataService
      .getPendingDeliveryList(payload)
      .subscribe((response: any) => {
        this.pendingDeliveries = response.Data;
      });
  }

  onAddItems() {
    this.isPopupVisible = true;
  }

  onSelectItems() {
    const selectedRows = this.popupGridRef.instance.getSelectedRowsData();

    if (!selectedRows.length) {
      notify(
        {
          message: 'Please select at least one item.',
          type: 'warning',
          displayTime: 2000,
        },
        'warning'
      );
      return;
    }

    // Push selected rows into main grid data source
    selectedRows.forEach((row: any) => {
      const exists = this.invoiceFormData.SALE_DETAILS.some(
        (item: any) => item.ITEM_CODE === row.ITEM_CODE
      );

      if (!exists) {
        this.invoiceFormData.SALE_DETAILS.push({
          SL_NO: this.invoiceFormData.SALE_DETAILS.length + 1,
          DELIVERY_NOTE_ID: row.DELIVERY_NOTE_ID,
          ITEM_ID: row.ITEM_ID,
          ITEM_CODE: row.ITEM_CODE,
          DESCRIPTION: row.DESCRIPTION,
          QUANTITY: row.QUANTITY,
          PRICE: 0,
          AMOUNT: 0,
          GST: 0,
          TAX_AMOUNT: 0,
          TOTAL_AMOUNT: 0,
        });
      }
    });

    this.itemsGridRef.instance.refresh(); // refresh grid display
    this.isPopupVisible = false; // close popup
    this.popupGridRef.instance.clearSelection(); // optional: clear selection in popup
  }
  onPopupHiding() {
    // this.popupClosed.emit();
  }
  getInvoiceNo() {
    console.log('Method not implemented.');
  }
  sessionData_tax() {
    console.log('===========================================================');
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
    console.log(this.selected_vat_id, 'SELECTEDVATID');
  }

  calculateAmount(rowData: any) {
    const quantity = rowData?.QUANTITY || 0;
    const price = rowData?.PRICE || 0;
    return quantity * price;
  }

  calculateTaxAmount(rowData: any) {
    const amount = rowData?.QUANTITY * (rowData?.PRICE || 0);
    console.log(amount, 'AMOUNT');
    const gstPercent = rowData?.GST || 0;
    console.log(
      'Amount:',
      amount,
      'GST %:',
      gstPercent,
      'Tax:',
      (amount * gstPercent) / 100
    );
    return (amount * gstPercent) / 100;
  }

  calculateTotalAmount(rowData: any) {
    const amount = rowData?.QUANTITY * (rowData?.PRICE || 0);
    const gstPercent = rowData?.GST || 0;
    const taxAmount = (amount * gstPercent) / 100;
    return amount + taxAmount;
  }

  saveInvoice() {
    if (!this.invoiceFormData.CUST_ID && !this.selectedCustomerId) {
      return notify(
        {
          message: 'Please select a customer before saving.',
          type: 'error',
          displayTime: 2000,
        },
        'error'
      );
    }

    if (!this.invoiceFormData.SALE_DETAILS?.length) {
      return notify(
        {
          message: 'Please add at least one item before saving.',
          type: 'error',
          displayTime: 2000,
        },
        'error'
      );
    }

    let grossAmount = 0,
      gstAmount = 0,
      netAmount = 0;

    this.invoiceFormData.SALE_DETAILS.forEach((item: any) => {
      const amount = (item.QUANTITY || 0) * (item.PRICE || 0);
      const tax = this.calculateTaxAmount(item);
      item.AMOUNT = amount;
      item.TAX_AMOUNT = tax;
      item.TOTAL_AMOUNT = amount + tax;
      grossAmount += amount;
      gstAmount += tax;
      netAmount += amount + tax;
    });

    this.invoiceFormData.GROSS_AMOUNT = grossAmount;
    this.invoiceFormData.TAX_AMOUNT = gstAmount;
    this.invoiceFormData.NET_AMOUNT = netAmount;
    this.invoiceFormData.CUST_ID = this.selectedCustomerId;
    if (netAmount <= 0) {
      return notify(
        {
          message:
            'Net amount cannot be 0. Please check item quantities or prices.',
          type: 'error',
          displayTime: 2000,
        },
        'error'
      );
    }
    const transDate = new Date(this.invoiceFormData.TRANS_DATE);
    const formattedDate = `${String(transDate.getDate()).padStart(
      2,
      '0'
    )}-${String(transDate.getMonth() + 1).padStart(
      2,
      '0'
    )}-${transDate.getFullYear()}`;

    const payload = {
      TRANS_ID: this.isEditing ? this.invoiceFormData.TRANS_ID : 0,
      TRANS_TYPE: 25,
      COMPANY_ID: this.selectedCompanyId,
      STORE_ID: this.invoiceFormData.STORE_ID ?? 1,
      TRANS_DATE: formattedDate,
      TRANS_STATUS: this.invoiceFormData.TRANS_STATUS ?? 0,
      REF_NO: this.invoiceFormData.REF_NO ?? 'string',
      NARRATION: this.invoiceFormData.NARRATION ?? '',
      CREATE_USER_ID: this.userId,
      CUST_ID: this.selectedCustomerId,
      FIN_ID: this.invoiceFormData.FIN_ID ?? 1,
      GROSS_AMOUNT: this.invoiceFormData.GROSS_AMOUNT,
      TAX_AMOUNT: this.invoiceFormData.TAX_AMOUNT,
      NET_AMOUNT: this.invoiceFormData.NET_AMOUNT,
      SALE_DETAILS: this.invoiceFormData.SALE_DETAILS.map((item: any) => ({
        DELIVERY_NOTE_ID: item.DELIVERY_NOTE_ID,
        QUANTITY: item.QUANTITY,
        PRICE: item.PRICE,
        AMOUNT: item.AMOUNT,
        GST: item.GST,
        TAX_AMOUNT: item.TAX_AMOUNT,
        TOTAL_AMOUNT: item.TOTAL_AMOUNT,
      })),
    };

    if (this.isEditing) payload.TRANS_ID = this.invoiceFormData.TRANS_ID;

    // ✅ Handle Approval with confirmation popup
    if (this.isApproved) {
      const result = confirm(
        'Are you sure you want to approve this invoice?',
        'Confirm Approval'
      );
      result.then((dialogResult) => {
        if (dialogResult) {
          const apiCall = this.dataService.approveInvoiceDelivery(payload);
          this.handleInvoiceApi(apiCall, 'approved');
        }
      });
      return; // Stop execution until user confirms
    }

    // ✅ Normal save/update flow
    let apiCall;
    let successAction = '';

    if (this.isEditing) {
      apiCall = this.dataService.updateInvoiceDelivery(payload);
      successAction = 'updated';
    } else {
      apiCall = this.dataService.insertInvoiceDelivery(payload);
      successAction = 'saved';
    }

    this.handleInvoiceApi(apiCall, successAction);
  }

  // ✅ Helper function for API response handling
  private handleInvoiceApi(apiCall: any, successAction: string) {
    apiCall.subscribe({
      next: (response: any) => {
        if (response?.flag === 1) {
          notify(
            {
              message: `Invoice ${successAction} successfully!`,
              type: 'success',
              displayTime: 2000,
            },
            'success'
          );
          if (successAction === 'saved') {
            this.getVoucherNo();
          }
          this.popupClosed.emit();
        } else {
          notify(
            {
              message:
                response?.message || `Failed to ${successAction} invoice.`,
              type: 'error',
              displayTime: 2000,
            },
            'error'
          );
        }
      },
      error: (err) => {
        console.error('Save error:', err);
        notify(
          {
            message: 'An error occurred while saving the invoice.',
            type: 'error',
            displayTime: 2000,
          },
          'error'
        );
      },
    });
  }

  getVoucherNo() {
    this.dataService.getInvoiceNoDelivery().subscribe((response: any) => {
      if (response?.Flag === 1 && response.Data?.length) {
        this.voucherNo = response.Data[0].VOCHERNO;
        console.log('Voucher No:', this.voucherNo);
      } else {
        console.error('Failed to get voucher number', response);
      }
    });
  }

  resetInvoiceForm() {
    this.invoiceFormData = {
      TRANS_TYPE: 25,
      COMPANY_ID: this.selectedCompanyId || 0, // ✅ retain selected company
      STORE_ID: 0,
      TRANS_DATE: new Date(),
      TRANS_STATUS: 1,
      ADD_TIME: new Date(),
      SALE_DATE: new Date(),
      UNIT_ID: 1,
      CUST_ID: 0,
      FIN_ID: this.invoiceFormData.FIN_ID || 0, // ✅ retain financial year
      USER_ID: this.invoiceFormData.USER_ID || 0, // ✅ retain user
      GROSS_AMOUNT: '',
      GST_AMOUNT: '',
      NET_AMOUNT: '',
      REF_NO: '',
      SALE_DETAILS: [], // ✅ clear items grid
    };

    // reset selections
    this.selectedCustomerId = null;
    this.pendingDeliveries = [];

    // // If you are using DevExtreme popup/grid refs, clear them too:
    // if (this.itemsGridRef) {
    //   this.itemsGridRef.instance.option('dataSource', []);
    // }

    notify(
      // { message: 'Form has been reset.', type: 'info', displayTime: 1500 },
      'info'
    );

    // trigger view update if needed
    this.cdr.detectChanges();
  }

  cancel() {
    // this.resetInvoiceForm();
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
  declarations: [InvoiceDeliveryFormComponent],
  exports: [InvoiceDeliveryFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InvoiceDeliveryFormModule {}
