import {
  ChangeDetectorRef,
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
  DxTextBoxComponent,
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
import { AddCreditNoteComponent } from '../../CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-add-invoice',
  templateUrl: './add-invoice.component.html',
  styleUrls: ['./add-invoice.component.scss'],
})
export class AddInvoiceComponent {
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  //  @Output()  sesstion_Details = new EventEmitter<void>();

  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @ViewChild('refBoxRef', { static: false }) refBoxRef!: DxTextBoxComponent;
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
  customerType: string = 'Unit';
  selectedTransfers: any[] = [];
  customerTypes = [
    { text: 'Unit', value: 'Unit' },
    { text: 'Dealer', value: 'Dealer' },
  ];
  staticTransfers: any;
  companyList: any;
  distributorList: any;
  selectedCompanyId: number | null = null;
  selectedDistributorId: number | null = null;
  // Inside your component class

  isTrOutPopupVisible: boolean = false;
  invoiceGridList: any;
  mainInvoiceGridList: any;

  invoiceFormData: any = {
    TRANS_TYPE: 25,
    COMPANY_ID: 1,
    STORE_ID: 1,
    TRANS_DATE: new Date(),
    TRANS_STATUS: 1,
    ADD_TIME: new Date(),
    SALE_DATE: new Date(),
    UNIT_ID: 1,
    DISTRIBUTOR_ID: 0,
    FIN_ID: 1,
    GROSS_AMOUNT: '',
    GST_AMOUNT: '',
    NET_AMOUNT: '',
    REF_NO: '',
    PARTY_NAME: '',
    IS_APPROVED: false,
    VEHICLE_NO: '',
    ROUND_OFF: false,
    SALE_DETAILS: [
      {
        DN_DETAIL_ID: 0,
        QUANTITY: '',
        PRICE: '',
        AMOUNT: '',
        GST: '',
        TAX_AMOUNT: '',
        TOTAL_AMOUNT: '',
      },
    ],
  };
  invoiceNo: any;
  summaryValues: any;
  totalAmount: any;
  taxAmount: any;
  grandTotal: any;
  currentEditor: any = null;
  sessionData: any;
  selected_vat_id: any;
  selectedCustomerType: any;
  selectedCustomerId: any;
  selectedCustomer: any;
  selectedCustomerName: void;
  HSNCODE: any;
  GST: any;
  companyState: any;
  isSameState: boolean = false;
  selectedCompany: any;
  showGST: boolean = false;
  showCGST: boolean = false;
  showSGST: boolean = false;
  netAmount: any;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  ngOnInit() {
    this.invoiceFormData = {
      ...this.invoiceFormData,
      TRANS_DATE: new Date(this.invoiceFormData.TRANS_DATE || new Date()),
    };
    if (!this.invoiceFormData.SALE_DATE) {
      this.invoiceFormData.SALE_DATE = new Date();
    }
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.selectedCompany = userData?.SELECTED_COMPANY;
      this.HSNCODE = userData.GeneralSettings.HSN_CODE;
      this.GST = userData.GeneralSettings.GST_PERC;
      console.log(this.GST, 'HSNCODE');
      if (this.selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = this.selectedCompany.COMPANY_ID;
        this.companyState = this.selectedCompany.STATE_NAME;
        console.log(this.companyState, 'COMPANYSTATE');
        this.companyList = [this.selectedCompany]; //  Show only selected company
      }

      if (userData.USER_ID) {
        this.invoiceFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.invoiceFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
    // this.getInvoiceListForGrid();
    // this.getCompanyListDropdown();
    this.getCustomerOrUnitLst();
    this.getInvoiceNo();
    this.sessionData_tax();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges(); // ensure view is stable
    setTimeout(() => {
      this.refBoxRef?.instance?.focus();
    }, 0);
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getCustomerOrUnitLst() {
    this.dataService
      .getOutsideCustomerWithState()
      .subscribe((response: any) => {
        this.distributorList = response;
        console.log(this.distributorList, 'DISTLISTPOPUP');
      });
  }

  onDistributorChanged(e: any) {
    // Find the selected customer from the distributorList
    const selectedCustomer = this.distributorList.find(
      (cust: any) => cust.ID === e.value
    );
    // If customer changed → clear previously added rows
    if (this.mainInvoiceGridList && this.mainInvoiceGridList.length > 0) {
      this.mainInvoiceGridList = []; // Clear the grid completely
      this.totalAmount = 0;
      this.taxAmount = 0;
      this.grandTotal = 0;
      this.netAmount = 0;

      // Refresh grid UI
      if (this.itemsGridRef?.instance) {
        this.itemsGridRef.instance.refresh();
      }

      console.log('Cleared main grid due to customer change');
    }
    this.selectedCustomerName = selectedCustomer.DESCRIPTION;
    this.invoiceFormData.PARTY_NAME = this.selectedCustomerName;
    console.log(selectedCustomer.STATE_NAME, 'SELECTEDCUSTOMERRRRRRRRRR');
    const company = this.companyState?.trim().toLowerCase();
    const customer = selectedCustomer.STATE_NAME?.trim().toLowerCase();
    const sessionGst = parseFloat(this.GST) || 0; // main GST%
    if (company === customer) {
      this.showCGST = true;
      this.showSGST = true;
      this.showGST = false;

      //  Split GST into CGST + SGST
      const half = sessionGst / 2;

      // Update all grid rows
      this.mainInvoiceGridList?.forEach((row: any) => {
        row.CGST = half;
        row.SGST = half;
        row.GST = 0; // GST becomes zero in same-state case
      });
    } else {
      console.log('States DIFFERENT → GST applies');

      this.showGST = true;
      this.showCGST = false;
      this.showSGST = false;

      // ⭐ GST only
      this.mainInvoiceGridList?.forEach((row: any) => {
        row.GST = sessionGst;
        row.CGST = 0;
        row.SGST = 0;
      });
    }

    this.selectedCustomer = selectedCustomer;
    this.invoiceFormData.DISTRIBUTOR_ID = selectedCustomer.ID;
    if (this.selectedCustomerType) {
      console.log(
        'Selected Customer Type:',
        this.selectedCustomerType.CUST_TYPE
      );
      console.log('Selected Customer :', this.selectedCustomerType);
      // optional — store it if you need it later
      this.invoiceFormData.CUST_TYPE = this.selectedCustomerType.CUST_TYPE;
    }
    this.getInvoiceListForGrid();
  }

  onUnitChanged(e: any) {
    if (e.value) {
      this.invoiceFormData.DISTRIBUTOR_ID = 0;
    }
  }

  getInvoiceListForGrid() {
    console.log(this.invoiceFormData.DISTRIBUTOR_ID, 'INVOICELISTFORGRID');
    const payload = {
      CUST_ID: this.invoiceFormData.DISTRIBUTOR_ID,
    };
    this.dataService.getInvoiceGridList(payload).subscribe((response: any) => {
      this.staticTransfers = response.Data; // Save the original full list
      console.log(this.staticTransfers, 'STATISCTRANSFERS');
      this.invoiceGridList = [...this.staticTransfers]; // Initial value
    });
  }

  getInvoiceNo() {
    const payload = {
      TRANS_TYPE: 25,
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.invoiceNo = response.DOC_NO;
      this.invoiceFormData.DOC_NO = response.DOC_NO;
      console.log(response.INVOICE_NO, 'INVOICENO');
    });
  }

  calculateAmount = (row: any) => {
    return (parseFloat(row.PRICE) || 0) * (parseFloat(row.TOTAL_PAIR_QTY) || 0);
  };

  calculateGstAmount = (row: any) => {
    const amt = this.calculateAmount(row);

    const igst = parseFloat(row.GST) || 0; // GST column = GST
    const cgst = parseFloat(row.CGST) || 0;
    const sgst = parseFloat(row.SGST) || 0;

    let totalGstPercent = 0;

    // GST case
    if (igst > 0) {
      totalGstPercent = igst;
    }
    // CGST + SGST case
    else {
      totalGstPercent = cgst + sgst;
    }

    return amt * (totalGstPercent / 100);
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
    if (!this.staticTransfers || this.staticTransfers.length === 0) {
      notify({
        message: 'No data found.',
        type: 'warning',
        displayTime: 2000,
        position: {
          my: 'center top',
          at: 'center top',
          of: window,
        },
      });
      return; // stop execution here
    }
    const selectedTransferNos =
      this.mainInvoiceGridList?.map((t) => t.DN_DETAIL_ID) || [];
    console.log(this.selectedTransfers, 'SELECTEDTRANSFERSSSSSSSS');
    // Filter the full list before showing in popup
    this.invoiceGridList = this.staticTransfers.filter(
      (item: any) => !selectedTransferNos.includes(item.DN_DETAIL_ID)
    );
    this.isTrOutPopupVisible = true;
  }

  onTransferSelectClick() {
    const selectedRows = this.popupGridRef.instance.getSelectedRowsData();
    if (!selectedRows || selectedRows.length === 0) {
      notify({
        message: 'Please select at least one row',
        type: 'warning',
        displayTime: 2000,
        position: {
          my: 'center top',
          at: 'center top',
          of: window,
        },
      });
      return;
    }
    console.log(selectedRows, 'SELECTEDROWSSSSSSSSSSSSSSSS');
    console.log(
      'Selected DN_DETAIL_IDs:',
      selectedRows.map((x: any) => x.DN_DETAIL_ID)
    );
    // Initialize mainInvoiceGridList if null
    if (!this.mainInvoiceGridList) {
      this.mainInvoiceGridList = [];
    }

    // Get existing IDs to avoid duplicates
    const existingTransferIds = this.mainInvoiceGridList.map(
      (item: any) => item.DN_DETAIL_ID
    );

    // Only add new unique rows
    const newRows = selectedRows.filter(
      (row: any) => !existingTransferIds.includes(row.DN_DETAIL_ID)
    );
    newRows.forEach((row: any) => {
      row.HSN_CODE = this.HSNCODE;

      const sessionGst = parseFloat(this.GST) || 0;
      const company = this.companyState?.trim().toLowerCase();
      const customer = this.invoiceFormData?.PARTY_NAME
        ? this.selectedCustomer?.STATE_NAME?.trim().toLowerCase()
        : null;

      if (company === customer) {
        // Same state → CGST + SGST
        const half = sessionGst / 2;
        row.CGST = half;
        row.SGST = half;
        row.GST = 0; // GST = 0
      } else {
        // Different state → GST only
        row.GST = sessionGst;
        row.CGST = 0;
        row.SGST = 0;
      }
    });

    //  Mutate the existing array (DON'T reassign!)
    this.mainInvoiceGridList.push(...newRows);

    // Close popup
    this.isTrOutPopupVisible = false;

    // Optional: Trigger manual change detection if needed
    this.cdr.detectChanges();
    // setTimeout(() => {
    //   if (this.itemsGridRef?.instance && this.mainInvoiceGridList.length > 0) {
    //     this.itemsGridRef.instance.focus(
    //       this.itemsGridRef.instance.getCellElement(0, 'PRICE')
    //     );
    //     // OR start editing directly:
    //     // this.mainGridRef.instance.editCell(0, 'PRICE');
    //   }
    // }, 200);
  }

  onPopupHiding() {
    if (this.popupGridRef?.instance) {
      this.popupGridRef.instance.clearSelection(); // ✅ clear selected rows
      this.popupGridRef.instance.refresh(); // ✅ refresh grid datasource
    }
  }

  onEditorPreparing(e: any) {
    if (e.dataField === 'PRICE' || e.dataField === 'GST') {
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
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === e.row?.data
          );
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'GST'));
          }, 50);
        }
      };
    }
  }

  handleKeyDown(e: any) {
    if (e.event?.key === 'Enter') {
      const { rowIndex, column } = e;
      const currentField = column?.dataField;

      if (currentField === 'PRICE') {
        // Move to GST column after PRICE
        this.itemsGridRef.instance.editCell(rowIndex, 'GST');
      }
    }
  }

  selectInvoice() {}

  cancelPopup() {}

  logGridSummaries() {
    this.summaryValues = this.itemsGridRef?.instance?.getTotalSummaryValue;

    if (this.summaryValues) {
      this.totalAmount =
        this.itemsGridRef?.instance?.getTotalSummaryValue('AMOUNT') || 0;
      this.taxAmount =
        this.itemsGridRef?.instance?.getTotalSummaryValue('TAX_AMOUNT') || 0;
      this.grandTotal =
        this.itemsGridRef?.instance?.getTotalSummaryValue('TOTAL_AMOUNT') || 0;
      this.netAmount = Number(this.grandTotal).toFixed(2);
      this.onRoundOffChange();
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

  saveInvoice() {
    console.log('save clicked');
    if (!this.invoiceFormData.DISTRIBUTOR_ID) {
      notify({
        message: 'Please select Customer',
        type: 'warning',
        displayTime: 3000,
        position: {
          my: 'center top',
          at: 'center top',
          of: window,
        },
      });

      return;
    }
    console.log(this.mainInvoiceGridList, 'MAINGRID');
    // 2. Validation checks
    if (!this.mainInvoiceGridList || this.mainInvoiceGridList.length === 0) {
      notify({
        message: 'No items in the grid to save',
        type: 'warning',
        displayTime: 3000,
        position: {
          my: 'center top',
          at: 'center top',
          of: window,
        },
      });
      return;
    }

    // 1. Get updated summary values from the grid
    if (this.itemsGridRef?.instance) {
      this.totalAmount =
        this.itemsGridRef.instance.getTotalSummaryValue('AMOUNT') || 0;
      this.taxAmount =
        this.itemsGridRef.instance.getTotalSummaryValue('TAX_AMOUNT') || 0;
      this.grandTotal =
        this.itemsGridRef.instance.getTotalSummaryValue('TOTAL_AMOUNT') || 0;
    } else {
      notify({
        message: 'Grid instance not available for summary.',
        type: 'warning',
        displayTime: 3000,
        position: {
          my: 'center top',
          at: 'center top',
          of: window,
        },
      });
    }
    console.log(this.mainInvoiceGridList.length, 'MAINGRIDDDDDDDDDDDDDDDDD');
    // 2. Validation checks
    if (!this.mainInvoiceGridList || this.mainInvoiceGridList.length === 0) {
      notify(
        {
          message: 'No items selected to save.',
          position: { at: 'top center', my: 'center top' },
        },
        'warning',
        3000
      );
      return;
    }

    const hasInvalidPrice = this.mainInvoiceGridList.some(
      (row: any) => !row.PRICE || row.PRICE === 0
    );
    if (hasInvalidPrice) {
      notify(
        {
          message: 'Some rows have missing or zero price value.',
          position: { at: 'top center', my: 'top center' },
        },
        'warning',
        3000
      );
      return;
    }

    // 3. Prepare the SALE_DETAILS array
    // 3. Prepare the SALE_DETAILS array
    this.invoiceFormData.SALE_DETAILS = this.mainInvoiceGridList.map(
      (row: any) => {
        const igst = parseFloat(row.GST) || 0; // GST
        const cgst = parseFloat(row.CGST) || 0; // CGST
        const sgst = parseFloat(row.SGST) || 0; // SGST

        // Build final object to send
        return {
          DN_DETAIL_ID: row.DN_DETAIL_ID || '',
          QUANTITY: row.TOTAL_PAIR_QTY || 0,
          PRICE: row.PRICE || 0,

          // *** Required Output ***
          GST: igst > 0 ? igst : 0,
          CGST: igst > 0 ? 0 : cgst,
          SGST: igst > 0 ? 0 : sgst,

          // base amounts
          AMOUNT: this.calculateAmount(row),
          TAX_AMOUNT: this.calculateGstAmount(row),
          TOTAL_AMOUNT: this.calculateTotal(row),
        };
      }
    );

    // this.invoiceFormData.SALE_DETAILS = this.mainInvoiceGridList.map(
    //   (row: any) => ({
    //     DN_DETAIL_ID: row.DN_DETAIL_ID || '',
    //     QUANTITY: row.TOTAL_PAIR_QTY || 0,
    //     PRICE: row.PRICE || 0,
    //     GST: row.GST || 0,
    //     AMOUNT: this.calculateAmount(row),
    //     TAX_AMOUNT: this.calculateGstAmount(row),
    //     TOTAL_AMOUNT: this.calculateTotal(row),

    //     // Optional: Do not include row-level total if not needed
    //   })
    // );

    // 4. Set root-level totals
    this.invoiceFormData.GROSS_AMOUNT = this.totalAmount;
    this.invoiceFormData.GST_AMOUNT = this.taxAmount;
    this.invoiceFormData.NET_AMOUNT = this.grandTotal;
    this.invoiceFormData.PARTY_NAME = this.invoiceFormData.PARTY_NAME;
    this.invoiceFormData.TRANS_TYPE = 25;
    this.invoiceFormData.SALE_DATE = new Date();
    this.invoiceFormData.ADD_TIME = new Date();
    this.invoiceFormData.VEHICLE_NO = this.invoiceFormData.VEHICLE_NO;
    const callInsertAPI = () => {
      this.dataService.insertInvoice(this.invoiceFormData).subscribe(
        (response) => {
          console.log('Invoice saved successfully:', response);
          notify(
            {
              message: 'Invoice saved successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
            3000
          );
          this.resetInvoiceForm();
          this.popupClosed?.emit();
        },
        (error) => {
          console.error('Error saving invoice:', error);
          notify(
            {
              message: 'Failed to save invoice',
              position: { at: 'top center', my: 'top center' },
            },
            'error',
            3000
          );
        }
      );
    };
    // 5. Call the API to save invoice
    if (this.invoiceFormData.IS_APPROVED === true) {
      const result = confirm(
        'Are you sure you want to approve and commit this invoice?',
        'Confirmation'
      );

      result.then((confirmed) => {
        if (confirmed) {
          callInsertAPI();
        }
      });
    } else {
      // NOT approved → Direct save
      callInsertAPI();
    }
  }

  resetInvoiceForm() {
    this.invoiceFormData = {
      COMPANY_ID: this.selectedCompanyId || null,
      FIN_ID: this.invoiceFormData.FIN_ID || null,
      USER_ID: this.invoiceFormData.USER_ID || null,
      UNIT_ID: 0,
      DISTRIBUTOR_ID: 0,
      GROSS_AMOUNT: 0,
      GST_AMOUNT: 0,
      NET_AMOUNT: 0,
      SALE_DETAILS: [],
      TRANS_DATE: new Date(), // ✅ add this line
      ADD_TIME: new Date(), // optional
      SALE_DATE: new Date(),
    };

    // Reset invoice number (optional: if API provides a new number)
    this.getInvoiceNo();

    // Clear grid selections and data
    this.mainInvoiceGridList = [];
    this.totalAmount = 0;
    this.taxAmount = 0;
    this.grandTotal = 0;

    // Reset summaries if needed
    if (this.itemsGridRef?.instance) {
      this.itemsGridRef.instance.refresh(true);
    }
  }

  cancel() {
    this.resetInvoiceForm();
    this.popupClosed.emit();
  }

  onRoundOffChange() {
    if (this.invoiceFormData.ROUND_OFF) {
      // Round Off Enabled
      this.netAmount = Math.round(this.grandTotal).toFixed(2);
    } else {
      // Round Off Disabled → return to original value
      this.netAmount = Number(this.grandTotal).toFixed(2);
    }
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
  declarations: [AddInvoiceComponent],
  exports: [AddInvoiceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddInvoiceModule {}
