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
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { AddInvoiceComponent } from '../add-invoice/add-invoice.component';
import { confirm } from 'devextreme/ui/dialog';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-invoice-tr-out-add',
  templateUrl: './invoice-tr-out-add.component.html',
  styleUrls: ['./invoice-tr-out-add.component.scss'],
})
export class InvoiceTrOutAddComponent {
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

  netAmount: string;
  showSGST: boolean = false;
  showCGST: boolean = false;
  showGST: boolean = false;

  @ViewChild('refBoxRef', { static: false }) refBoxRef!: DxTextBoxComponent;

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
    // TRANS_TYPE: 25,
    COMPANY_ID: 0,
    STORE_ID: 0,
    TRANS_DATE: new Date(),
    CUST_ID: 0,
    FIN_ID: 0,
    GROSS_AMOUNT: '',
    TAX_AMOUNT: '',
    NET_AMOUNT: '',
    REF_NO: '',
    PARTY_NAME: '',
    NARRATION: '',
    CREATE_USER_ID: 0,
    IS_APPROVED: false,
    VEHICLE_NO: '',
    ROUND_OFF: false,
    SALE_DETAILS: [
      {
        QUANTITY: 0,
        PRICE: 0,
        TAXABLE_AMOUNT: 0,
        TAX_PERC: 0,
        TAX_AMOUNT: 0,
        TOTAL_AMOUNT: 0,
        DN_DETAIL_ID: 0,
        CGST: 0,
        SGST: 0,
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
  TAX_PERC: any;
  GST: any;
  selectedCompany: any;
  companyState: any;
  previousCustomerId: number | null = null;
  pendingCustomerId: number | null = null;
  isSaving = false;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
  ) {
    this.sessionData_tax();
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;

    this.selectedCompany = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.companyState = this.sessionData.SELECTED_COMPANY.STATE_NAME;
    this.GST = this.sessionData.GeneralSettings.GST_PERC;
    this.invoiceFormData.FIN_ID = this.sessionData.FINANCIAL_YEARS.FIN_ID;
    this.invoiceFormData.COMPANY_ID =
      this.sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  ngOnInit() {
    this.invoiceFormData = {
      ...this.invoiceFormData,
      TRANS_DATE: new Date(this.invoiceFormData.TRANS_DATE || new Date()),
    };
    if (!this.invoiceFormData.TRANS_DATE) {
      this.invoiceFormData.TRANS_DATE = new Date();
    }
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      this.HSNCODE = userData.GeneralSettings.HSN_CODE;
      this.GST = userData.GeneralSettings.GST_PERC;
      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
        this.companyList = [selectedCompany]; // ✅ Show only selected company
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
    if (!this.isEditing) {
      this.getInvoiceNo();
    }
    this.sessionData_tax();
    this.isEditDataAvailable();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges(); // ensure view is stable
    setTimeout(() => {
      this.refBoxRef?.instance?.focus();
    }, 0);
  }

  parseDMY(dateStr: string): Date {
    if (!dateStr) return new Date();

    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) {
      return; // Not edit mode → nothing to load
    }

    const data = this.EditingResponseData.Data[0];

    // Track previous customer (used to clear grid on change)
    this.previousCustomerId = data.CUST_ID;

    // ---------------- DATE PARSE ----------------
    const transactionDate = this.parseDMY(data.TRANS_DATE);

    // ---------------- HEADER DATA ----------------
    this.invoiceFormData = {
      ID: data.ID,
      TRANS_ID: data.TRANS_ID,
      COMPANY_ID: this.invoiceFormData.COMPANY_ID,
      STORE_ID: data.STORE_ID,
      TRANS_DATE: transactionDate,
      CUST_ID: data.CUST_ID,
      GROSS_AMOUNT: data.GROSS_AMOUNT,
      TAX_AMOUNT: data.VAT_AMOUNT,
      NET_AMOUNT: data.NET_AMOUNT,
      CREATED_USER_ID: this.invoiceFormData.CREATED_USER_ID,
      NARRATION: data.NARRATION,
      SALE_DETAILS: data.SALE_DETAILS || [],
      PARTY_NAME: data.PARTY_NAME,
      FIN_ID: this.invoiceFormData.FIN_ID,
      REF_NO: data.REF_NO,
      VEHICLE_NO: data.VEHICLE_NO,
      ROUND_OFF: data.ROUND_OFF,
      DOC_NO: data.DOC_NO,
    };

    // ---------------- GRID DATA ----------------
    this.mainInvoiceGridList = (data.SALE_DETAILS || []).map((item: any) => ({
      DN_DETAIL_ID: item.DN_DETAIL_ID,
      TRANSFER_NO: item.ART_NO,
      SALE_DATE: this.parseDDMMYYYY(item.DN_DATE),
      ARTICLE: item.ARTICLE,

      TOTAL_PAIR_QTY: item.TOTAL_PAIR_QTY,
      PRICE: item.PRICE,

      // ✅ AMOUNTS FROM API
      TAXABLE_AMOUNT: item.TAXABLE_AMOUNT,
      TAX_AMOUNT: item.TAX_AMOUNT,
      TOTAL_AMOUNT: item.TOTAL_AMOUNT,

      // ✅ HSN → keep saved, fallback to session
      HSN_CODE: item.HSN_CODE || this.HSNCODE,

      // ✅ IMPORTANT: KEEP SAVED GST VALUES (NO SESSION OVERRIDE)
      GST: Number(item.GST) || 0,
      CGST: Number(item.CGST) || 0,
      SGST: Number(item.SGST) || 0,
    }));

    // ---------------- GST COLUMN VISIBILITY ONLY ----------------
    this.setGstVisibilityFromRows(this.mainInvoiceGridList);

    // ---------------- GRID REFRESH ----------------
    setTimeout(() => {
      if (this.itemsGridRef?.instance) {
        this.itemsGridRef.instance.refresh();
      }
    }, 200);
  }

  private setGstVisibilityFromRows(rows: any[]) {
    if (!rows || rows.length === 0) {
      this.showGST = false;
      this.showCGST = false;
      this.showSGST = false;
      return;
    }

    const hasIGST = rows.some((r) => Number(r.GST) > 0);

    if (hasIGST) {
      // IGST case
      this.showGST = true;
      this.showCGST = false;
      this.showSGST = false;
    } else {
      // CGST + SGST case
      this.showGST = false;
      this.showCGST = true;
      this.showSGST = true;
    }
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getCustomerOrUnitLst() {
    const payload = {
      COMPANY_ID: this.invoiceFormData.COMPANY_ID,
      // NAME: 'CUSTOMER',
    };

    this.dataService
      .getCustomerStateTrout_Invoice(payload)
      .subscribe((response: any) => {
        this.distributorList = response || [];

        // ✅ BIND CUSTOMER AFTER DATASOURCE IS READY
        if (this.isEditing && this.pendingCustomerId) {
          const exists = this.distributorList.some(
            (c: any) => c.ID === this.pendingCustomerId,
          );

          if (exists) {
            this.invoiceFormData.CUST_ID = this.pendingCustomerId;
          }

          this.pendingCustomerId = null;

          // Force DevExtreme refresh
          this.cdr.detectChanges();
        }
      });
  }

  // getCustomerOrUnitLst() {
  //   const payload = {
  //     COMPANY_ID: this.invoiceFormData.COMPANY_ID,
  //      NAME:'CUSTOMER'
  //   };
  //   this.dataService
  //     .getCustomerStateTrout_Invoice(payload)
  //     .subscribe((response: any) => {
  //       this.distributorList = response;
  //     });
  // }
  onDistributorChanged(e: any) {
    const newCustomerId = e.value;

    //  CUSTOMER CHANGED → CLEAR GRID
    if (
      this.previousCustomerId !== null &&
      this.previousCustomerId !== newCustomerId
    ) {
      this.clearInvoiceGrid();
    }

    this.previousCustomerId = newCustomerId;
    // Find the selected customer from the distributorList
    const selectedCustomer = this.distributorList.find(
      (cust: any) => cust.ID === e.value,
    );
    this.selectedCustomerName = selectedCustomer.DESCRIPTION;
    this.invoiceFormData.PARTY_NAME = this.selectedCustomerName;

    const company = this.companyState?.trim().toLowerCase();
    const customer = selectedCustomer.STATE_NAME?.trim().toLowerCase();
    const sessionGst = parseFloat(this.GST) || 0; // main GST%
    if (company === customer) {
      this.showCGST = true;
      this.showSGST = true;
      this.showGST = false;
    } else {
      this.showGST = true;
      this.showCGST = false;
      this.showSGST = false;
    }

    this.selectedCustomer = selectedCustomer;

    if (this.selectedCustomerId) {
      this.selectedCustomer = this.distributorList.find(
        (s: any) => s.ID === this.selectedCustomerId,
      );
      this.invoiceFormData.PARTY_NAME = this.selectedCustomer.DESCRIPTION;
    }
    this.invoiceFormData.CUST_ID = selectedCustomer.ID;
    if (this.selectedCustomerType) {
      // optional — store it if you need it later
      this.invoiceFormData.CUST_TYPE = this.selectedCustomerType.CUST_TYPE;
    }
    this.getInvoiceListForGrid();
  }

  clearInvoiceGrid() {
    this.mainInvoiceGridList = [];

    // Reset totals
    this.totalAmount = 0;
    this.taxAmount = 0;
    this.grandTotal = 0;
    this.netAmount = '0.00';

    // Clear grid state
    if (this.itemsGridRef?.instance) {
      this.itemsGridRef.instance.cancelEditData();
      this.itemsGridRef.instance.clearSelection();
      this.itemsGridRef.instance.refresh();
    }
  }

  onUnitChanged(e: any) {
    if (e.value) {
      this.invoiceFormData.CUST_ID = 0;
    }
  }

  getInvoiceListForGrid() {
    const payload = {
      CUST_ID: this.invoiceFormData.CUST_ID,
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService
      .getInvoiceGridListTrOut(payload)
      .subscribe((response: any) => {
        this.staticTransfers = response.Data; // Save the original full list
        this.invoiceGridList = [...this.staticTransfers]; // Initial value
      });
  }

  getInvoiceNo() {
    const payload = {
      TRANS_TYPE: 25,
      COMPANY_ID: this.selectedCompanyId,
    };

    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.invoiceFormData = {
        ...this.invoiceFormData,
        DOC_NO: response.DOC_NO,
      };
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

  openTrOutSelector() {
    if (!this.staticTransfers || this.staticTransfers.length === 0) {
      notify('No data found.', 'warning', 2000);
      return; // stop execution here
    }
    const selectedTransferNos =
      this.mainInvoiceGridList?.map((t) => t.DN_DETAIL_ID) || [];
    // Filter the full list before showing in popup
    this.invoiceGridList = this.staticTransfers.filter(
      (item: any) => !selectedTransferNos.includes(item.DN_DETAIL_ID),
    );
    this.isTrOutPopupVisible = true;
  }

  onTransferSelectClick() {
    const selectedRows = this.popupGridRef.instance.getSelectedRowsData();

    if (!selectedRows || selectedRows.length === 0) {
      notify('Please select at least one row.', 'warning', 2000);
      return;
    }

    if (!this.mainInvoiceGridList) {
      this.mainInvoiceGridList = [];
    }

    const existingIds = this.mainInvoiceGridList.map(
      (item: any) => item.DN_DETAIL_ID,
    );

    // ✅ State comparison (ONLY for split decision)
    const company = this.companyState?.trim().toLowerCase();
    const customer = this.selectedCustomer?.STATE_NAME?.trim().toLowerCase();
    const sameState = company === customer;

    selectedRows.forEach((row: any) => {
      if (existingIds.includes(row.DN_DETAIL_ID)) return;

      // ✅ GST MUST COME FROM ROW (NOT SESSION)
      const rowGstPerc = Number(row.GST_PERC ?? row.TAX_PERC ?? 0);
      const half = rowGstPerc / 2;

      this.mainInvoiceGridList.push({
        // ---------- IDENTIFIERS ----------
        DN_DETAIL_ID: row.DN_DETAIL_ID,
        TRANSFER_NO: row.ART_NO,
        SALE_DATE: this.parseDDMMYYYY(row.DN_DATE),

        // ---------- ITEM DETAILS ----------
        ARTICLE: row.ARTICLE,
        HSN_CODE: row.HSN_CODE || this.HSNCODE,
        TOTAL_PAIR_QTY: row.TOTAL_PAIR_QTY,
        PRICE: 0,

        // ---------- GST (ROW-BASED ONLY) ----------
        GST: sameState ? 0 : rowGstPerc, // IGST
        CGST: sameState ? half : 0, // CGST
        SGST: sameState ? half : 0, // SGST

        // ---------- OPTIONAL ----------
        TAX_PERC: rowGstPerc,
      });
    });

    // ✅ Set column visibility based on actual data
    this.setGstVisibilityFromRows(this.mainInvoiceGridList);

    this.isTrOutPopupVisible = false;

    // Refresh grid
    setTimeout(() => {
      this.itemsGridRef?.instance?.refresh();
    }, 100);
  }

  parseDDMMYYYY(dateStr: string): Date | null {
    if (!dateStr) return null;

    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;

    const day = Number(parts[0]);
    const month = Number(parts[1]) - 1; // JS months are 0-based
    const year = Number(parts[2]);

    return new Date(year, month, day);
  }

  onPopupHiding() {
    if (this.popupGridRef?.instance) {
      this.popupGridRef.instance.clearSelection(); // ✅ clear selected rows
      this.popupGridRef.instance.refresh(); // ✅ refresh grid datasource
    }
  }

  onEditorPreparing(e: any) {
    if (e.dataField === 'PRICE' || e.dataField === 'TAX_PERC') {
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
            (r) => r?.data === e.row?.data,
          );
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'TAX_PERC'));
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
        // Move to TAX_PERC column after PRICE
        this.itemsGridRef.instance.editCell(rowIndex, 'TAX_PERC');
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
    } else {
      console.warn('Summary values not ready yet.');
    }
  }

  onContentReady(e: any): void {
    this.logGridSummaries();
  }

  saveInvoice() {
    // ----------------------- VALIDATIONS -----------------------
    if (!this.invoiceFormData.CUST_ID) {
      notify('Please select Customer', 'error', 3000);
      return;
    }

    if (!this.mainInvoiceGridList || this.mainInvoiceGridList.length === 0) {
      notify('No items in the grid to save.', 'error', 3000);
      return;
    }

    const hasInvalidPrice = this.mainInvoiceGridList.some(
      (row: any) => !row.PRICE || row.PRICE === 0,
    );

    if (hasInvalidPrice) {
      notify('Some rows have missing or zero price value.', 'error', 3000);
      return;
    }

    // ----------------------- SUMMARY VALUES -----------------------
    if (this.itemsGridRef?.instance) {
      this.totalAmount =
        this.itemsGridRef.instance.getTotalSummaryValue('TAXABLE_AMOUNT') || 0;
      this.taxAmount =
        this.itemsGridRef.instance.getTotalSummaryValue('TAX_AMOUNT') || 0;
      this.grandTotal =
        this.itemsGridRef.instance.getTotalSummaryValue('TOTAL_AMOUNT') || 0;
    }

    // ----------------------- PREPARE SALE DETAILS -----------------------
    this.invoiceFormData.SALE_DETAILS = this.mainInvoiceGridList.map(
      (row: any) => ({
        DN_DETAIL_ID: row.DN_DETAIL_ID,
        QUANTITY: row.TOTAL_PAIR_QTY,
        PRICE: row.PRICE,
        TAX_PERC: row.TAX_PERC,
        TAXABLE_AMOUNT: this.calculateAmount(row),
        TAX_AMOUNT: this.calculateGstAmount(row),
        TOTAL_AMOUNT: this.calculateTotal(row),
        CGST: row.CGST,
        SGST: row.SGST,
      }),
    );
    const today = new Date();
    const invDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');
    // ----------------------- ROOT-LEVEL VALUES -----------------------
    this.invoiceFormData.TRANS_DATE = invDate;
    this.invoiceFormData.GROSS_AMOUNT = this.totalAmount;
    this.invoiceFormData.TAX_AMOUNT = this.taxAmount;
    this.invoiceFormData.NET_AMOUNT = this.grandTotal;
    this.invoiceFormData.TRANS_TYPE = 25;

    // ----------------------- API CALLS -----------------------

    const callInsertAPI = () => {
      this.isSaving = true;
      this.dataService
        .insertInvoiceTrOut(this.invoiceFormData)
        .subscribe(() => {
          this.isSaving = false;
          notify('Invoice saved successfully', 'success', 3000);
          this.resetInvoiceForm();
          this.popupClosed.emit();
        });
    };

    const callUpdateAPI = () => {
      this.isSaving = true;
      this.dataService
        .updateInvoiceTrOut(this.invoiceFormData)
        .subscribe(() => {
          this.isSaving = false;
          notify('Invoice updated successfully', 'success', 3000);
          this.popupClosed.emit();
        });
    };

    const callApproveAPI = () => {
      const result = confirm(
        'Are you sure you want to APPROVE this invoice?',
        'Confirmation',
      );

      result.then((confirmed) => {
        if (confirmed) {
          this.isSaving = true;
          this.dataService
            .commitInvoiceTrOut(this.invoiceFormData)
            .subscribe(() => {
              this.isSaving = false;
              notify('Invoice approved successfully', 'success', 3000);
              this.popupClosed.emit();
            });
        }
      });
    };

    // ----------------------- FINAL DECISION LOGIC -----------------------

    if (this.isEditing) {
      // --- CASE 1: EDIT MODE ---
      if (this.invoiceFormData.IS_APPROVED) {
        // APPROVE EXISTING INVOICE
        callApproveAPI();
      } else {
        // UPDATE EXISTING INVOICE
        callUpdateAPI();
      }
    } else {
      // --- CASE 2: ADD MODE ---
      if (this.invoiceFormData.IS_APPROVED) {
        // Ask confirmation only for approved INSERT
        const result = confirm(
          'Are you sure you want to approve and commit this invoice?',
          'Confirmation',
        );

        result.then((confirmed) => {
          if (confirmed) {
            callInsertAPI();
          }
        });
      } else {
        // NOT APPROVED → DIRECT INSERT
        callInsertAPI();
      }
    }
  }

  openPDF() {}

  resetInvoiceForm() {
    this.invoiceFormData = {
      COMPANY_ID: this.invoiceFormData.COMPANY_ID,
      STORE_ID: this.invoiceFormData.STORE_ID,
      REF_NO: '',
      PARTY_NAME: '',
      NARRATION: '',
      CREATE_USER_ID: this.invoiceFormData.CREATE_USER_ID,
      FIN_ID: this.invoiceFormData.FIN_ID,
      CUST_ID: 0,
      GROSS_AMOUNT: 0,
      TAX_AMOUNT: 0,
      NET_AMOUNT: 0,
      SALE_DETAILS: [],
      TRANS_DATE: new Date(), // add this line
      ADD_TIME: new Date(), // optional
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
  declarations: [InvoiceTrOutAddComponent],
  exports: [InvoiceTrOutAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InvoiceTrOutAddModule {}
