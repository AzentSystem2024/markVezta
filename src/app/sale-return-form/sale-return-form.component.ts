import {
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
import { FormTextboxModule } from '../components';
import { PurchaseReturnDebitFormComponent } from '../pages/purchase-return-debit-form/purchase-return-debit-form.component';
import notify from 'devextreme/ui/notify';
import { DataService } from '../services';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-sale-return-form',
  templateUrl: './sale-return-form.component.html',
  styleUrls: ['./sale-return-form.component.scss'],
})
export class SaleReturnFormComponent {
  @ViewChild('popupGridRef', { static: false }) popupGridRef: any;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() canApprove: boolean = false;
  @Input() isVerifyMode: boolean = false;
  @Input() isApproveMode: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: boolean = true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  customer: any;
  mainReturnGridList: any;
  distributorList: any;
  sessionData: any;
  selected_vat_id: any;
  isTrOutPopupVisible: any;
  supplierList: any;
  mainGridData: any[] = [];
  isApproved: boolean = false;
  customerList: any;
  sameState: boolean = false;
  netAmount: string;
  grandTotal: number;
  // salesReturnFormData: any;
  pendingList: any;
  isSaving: boolean = false;
  showGST: boolean = false;
  showCGST: boolean = false;
  showSGST: boolean = false;
  logoBase64: string;
  salesReturnFormData: any = {
    COMPANY_ID: 0,
    STORE_ID: 0,
    RET_DATE: new Date(),
    CUST_ID: 0,
    SALE_ID: 0,
    SALE_NO: '',
    IS_CREDIT: true,
    GROSS_AMOUNT: 0,
    VAT_AMOUNT: 0,
    NET_AMOUNT: 0,
    USER_ID: 0,
    NARRATION: '',
    CURRENCY_SYMBOL: '',
    IS_APPROVED: false,
    RET_NO: '',
    VEHICLE_NO: '',
    ROUND_OFF: false,
    Details: [
      {
        COMPANY_ID: 0,
        STORE_ID: 0,
        BAR_CODE: '',
        SALE_DET_ID: 0,
        ITEM_ID: 0,
        PENDING_QTY: 0,
        QUANTITY: 0,
        PRICE: 0,
        AMOUNT: 0,
        VAT_PERC: 0,
        CGST: 0,
        SGST: 0,
        VAT_AMOUNT: 0,
        TOTAL_AMOUNT: 0,
        UOM: '',
        UOM_PURCH: '',
        UOM_MULTIPLE: 0,
      },
    ],
  };
  selectedCompanyId: any;
  userID: any;
  finID: any;
  companyList: any[];
  selectedCustomerId: any;
  selectedCustomer: any;
  selectedCustomerStateId: any;
  companyStateId: any;
  retNo: any;
  summaryValues: (summaryItemName: string) => any;
  vatTitle: any;
  isHQApp: any;
  filteredStoreList: { ID: any; DESCRIPTION: any }[];
  storeList: { ID: any; DESCRIPTION: any }[];
  constructor(private dataService: DataService) {}

  ngOnInit() {
    console.log(this.isVerifyMode, 'ISVERIFYMODE');
    console.log(this.isApproveMode, 'ISAPPROVEMODE');
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return;

    const userData = JSON.parse(userDataString);
    const selectedCompany = userData.SELECTED_COMPANY;
    this.vatTitle = userData.GeneralSettings.VAT_TITLE;
    this.isHQApp = userData.GeneralSettings.IS_HQ_APP;
    const configStore = userData.Configuration?.[0];
    console.log(configStore, 'CONFIGSTOREEEEEEEEEEE');
    this.selectedCompanyId = selectedCompany.COMPANY_ID;
    this.companyStateId = selectedCompany.STATE_ID;
    this.userID = userData.USER_ID;
    this.finID = userData.FINANCIAL_YEARS[0].FIN_ID;
    this.salesReturnFormData.COMPANY_ID = selectedCompany.COMPANY_ID;
    this.companyList = [selectedCompany];
    this.getStoreData();
    // this.HSNCODE = userData.GeneralSettings.HSN_CODE;
    // this.GST = userData.GeneralSettings.GST_PERC;

    if (userData.USER_ID) {
      this.salesReturnFormData.USER_ID = userData.USER_ID;
    }

    const firstFinYear = userData.FINANCIAL_YEARS?.[0];
    if (firstFinYear?.FIN_ID) {
      this.salesReturnFormData.FIN_ID = firstFinYear.FIN_ID;
    }

    if (this.isHQApp && configStore) {
      this.filteredStoreList = [
        {
          ID: configStore.STORE_ID,
          DESCRIPTION: configStore.STORE_NAME,
        },
      ];
      // Auto select store
      this.salesReturnFormData.STORE_ID = configStore.STORE_ID;
    } else {
      this.filteredStoreList = this.storeList;
    }
    console.log(this.filteredStoreList, 'FILTEREDSTORELIST');
    if (!this.isEditing) {
      this.getDocNo();
    }
    this.getCustomerOrUnitLst();
    this.sessionData_tax();
    setTimeout(() => {
      this.isEditDataAvailable();
    }, 300);

    const imagePath = 'assets/markLogo.jpg';
    this.convertToBase64(imagePath).then((base64) => {
      this.logoBase64 = base64;
    });
  }

  private async convertToBase64(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  getStoreData() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDropdownData(payload).subscribe((res) => {
      this.storeList = res;
      if (!this.isHQApp) {
        this.filteredStoreList = this.storeList; //update here
      }
    });
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    const { Header, Details } = this.EditingResponseData;
    setTimeout(() => {
      this.itemsGridRef?.instance?.beginCustomLoading('Loading...');
    });
    // ============================
    // PATCH HEADER (CORRECT OBJECT)
    // ============================
    this.salesReturnFormData = {
      ...this.salesReturnFormData,
      ...Header,
      RET_DATE: new Date(Header.RET_DATE),
    };
    console.log(this.EditingResponseData, 'EDITRESPONSEEEEEEEEEEEEEEEEEEEEEE');
    // ============================
    // CUSTOMER & GST LOGIC (SAFE)
    // ============================
    const waitForCustomerList = () => {
      if (!this.customerList || this.customerList.length === 0) {
        setTimeout(waitForCustomerList, 100);
        return;
      }

      const customer = this.customerList.find(
        (c: any) => c.ID === Header.CUST_ID,
      );

      if (customer) {
        this.selectedCustomer = customer;
        this.selectedCustomerStateId = customer.STATE_ID;
        this.sameState = this.selectedCustomerStateId === this.companyStateId;

        this.showCGST = this.sameState;
        this.showSGST = this.sameState;
        this.showGST = !this.sameState;
      }

      bindGrid();
    };

    // ============================
    // GRID BINDING (CORRECT FIELDS)
    // ============================
    const bindGrid = () => {
      this.mainGridData = [];

      this.mainGridData = (Details || []).map((item: any) => ({
        ID: item.ID,
        SALE_DET_ID: item.SALE_DET_ID,
        ITEM_ID: item.ITEM_ID,
        SLAE_ID: Header.SALE_ID,
        SALE_NO: Header.SALE_NO,

        TRANSFER_NO: Header.SALE_NO,
        TRANSFER_DATE: new Date(Header.RET_DATE),

        ITEM_NAME: item.DESCRIPTION,
        PENDING_QTY: item.PENDING_QTY,
        QUANTITY: item.QUANTITY,

        PRICE: item.PRICE,
        AMOUNT: item.AMOUNT,
        VAT_AMOUNT: item.VAT_AMOUNT,
        TOTAL_AMOUNT: item.TOTAL_AMOUNT,

        UOM: item.UOM,
        UOM_PURCH: item.UOM_PURCH,
        UOM_MULTIPLE: item.UOM_MULTIPLE,

        BARCODE: item.BARCODE,
        HSN_CODE: item.HSN_CODE,

        CGST: 0,
        SGST: 0,
        VAT_PERC: item.VAT_PERC || item.CGST + item.SGST,
      }));

      setTimeout(() => {
        this.itemsGridRef?.instance?.option('dataSource', this.mainGridData);
        this.itemsGridRef?.instance?.refresh();
        this.itemsGridRef.instance.endCustomLoading();
        this.logGridSummaries();
      }, 50);
    };

    waitForCustomerList();
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  getDocNo() {
    const payload = {
      TRANS_TYPE: 26,
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.retNo = response.DOC_NO;
      this.salesReturnFormData.RET_NO = response.DOC_NO;
    });
  }

  applyGstVisibility() {
    if (this.sameState) {
      // Same state → CGST + SGST
      this.showCGST = true;
      this.showSGST = true;
      this.showGST = false;
    } else {
      // Different state → IGST
      this.showCGST = false;
      this.showSGST = false;
      this.showGST = true;
    }

    // Refresh grid so columns update
    setTimeout(() => {
      this.itemsGridRef?.instance?.refresh();
    });
  }

  getCustomerOrUnitLst() {
    console.log('{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{');
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService
      .getOutsideCustomerWithState(payload)
      .subscribe((response: any) => {
        this.customerList = response;
      });
  }

  onCustomerChanged(e: any) {
    const selectedCustomerId = e.value;

    // Clear grid when customer changes
    if (this.mainGridData.length > 0) {
      this.mainGridData = [];
      this.itemsGridRef?.instance?.refresh();
    }

    this.salesReturnFormData.CUST_ID = selectedCustomerId;

    const selectedCustomer = this.customerList.find(
      (cust: any) => cust.ID === selectedCustomerId,
    );

    if (selectedCustomer) {
      this.selectedCustomer = selectedCustomer;
      this.selectedCustomerStateId = selectedCustomer.STATE_ID;
      this.salesReturnFormData.PARTY_NAME = selectedCustomer.DESCRIPTION;

      // ✅ STATE COMPARISON
      this.sameState = this.selectedCustomerStateId === this.companyStateId;

      // ✅ APPLY COLUMN VISIBILITY
      this.applyGstVisibility();
    }
  }

  openPendingGrnPopup() {
    if (!this.salesReturnFormData.CUST_ID) {
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

    const payload = {
      CUST_ID: this.salesReturnFormData.CUST_ID,
      COMPANY_ID: this.selectedCompanyId,
    };

    this.dataService
      .getPendingInvoicesForSaleReturn(payload)
      .subscribe((response: any) => {
        this.pendingList = response.Data || [];
        console.log(this.pendingList, 'PENDING GRN LIST');

        if (this.pendingList.length === 0) {
          notify('No Data Available', 'warning', 2000);
        } else {
          this.isTrOutPopupVisible = true; // Only open if data exists
        }
      });
  }

  onTransferSelectClick() {
    const selectedRows =
      this.popupGridRef?.instance.getSelectedRowsData() || [];
    if (!selectedRows.length) {
      notify('Please select at least one row', 'warning', 3000);
      return;
    }
    if (selectedRows.length > 0) {
      selectedRows.forEach((row: any) => {
        const exists = this.mainGridData.some(
          (item) =>
            item.SALE_DET_ID === row.SALE_DET_ID &&
            item.ITEM_ID === row.ITEM_ID &&
            item.SALE_NO === row.DOC_NO,
        );

        if (!exists) {
          const gstPerc = Number(row.GST_PERC) || 0;

          this.mainGridData.push({
            SALE_DET_ID: row.SALE_DET_ID,
            ITEM_ID: row.ITEM_ID,
            SLAE_ID: row.ID,
            SALE_NO: row.DOC_NO,
            // GRN_DET_ID: row.GRN_DET_ID,
            TRANSFER_NO: row.DOC_NO,
            TRANSFER_DATE: row.SALE_DATE,
            ITEM_NAME: row.ITEM_NAME,
            PENDING_QTY: row.PENDING_QTY,
            PRICE: row.PRICE,
            QUANTITY: 0,
            AMOUNT: row.AMOUNT,
            TOTAL_AMOUNT: 0,
            UOM: row.UOM,
            UOM_PURCH: row.UOM_PURCH,
            UOM_MULTIPLE: row.UOM_MULTIPLE,
            BARCODE: row.BARCODE,
            HSN_CODE: row.HSN_CODE,

            // GST FROM PENDING LIST
            VAT_PERC: gstPerc,
            CGST: 0,
            SGST: 0,
            VAT_AMOUNT: 0,
          });
        }
      });

      this.mainGridData = [...this.mainGridData];
      console.log('MAIN GRID DATA:', this.mainGridData);
      this.itemsGridRef.instance.refresh();
      this.popupGridRef.instance.clearSelection();
    }

    this.isTrOutPopupVisible = false;

    setTimeout(() => {
      this.itemsGridRef.instance.editCell(0, 'QUANTITY');
    }, 200);
  }

  validateQuantity = (e) => {
    const row = e.data;
    const qty = e.value;
    const pendingQty = row?.PENDING_QTY ?? 0;

    // Allow empty value while typing
    if (qty == null || qty === '') return true;

    return qty <= pendingQty;
  };

  calculateAmount = (rowData: any) => {
    const qty = Number(rowData.QUANTITY) || 0;
    const totalPRICE = Number(rowData.PRICE) || 0;
    const pendingQty = Number(rowData.PENDING_QTY) || 0;
    // const PRICE = Number(rowData.PRICE) || 0;
    // const PRICE = pendingQty > 0 ? totalPRICE / pendingQty : 0;

    // const amount = qty * PRICE;
    const amount = qty * totalPRICE;
    // also store the calculated amount inside the row (optional)
    rowData.AMOUNT = amount;

    return amount;
  };

  calculateVATAmount = (rowData: any) => {
    if (!rowData) return 0;

    const amount = Number(rowData.AMOUNT) || 0;
    const gstPerc = Number(rowData.VAT_PERC) || 0;
    return (amount * gstPerc) / 100;
  };

  calculateTotalAmount = (rowData) => {
    return this.calculateAmount(rowData) + this.calculateVATAmount(rowData);
  };

  logGridSummaries() {
    this.summaryValues = this.itemsGridRef?.instance?.getTotalSummaryValue;

    if (this.summaryValues) {
      this.grandTotal =
        this.itemsGridRef?.instance?.getTotalSummaryValue('TOTAL_AMOUNT') || 0;
      this.netAmount = Number(this.grandTotal).toFixed(2);
      this.onRoundOffChange();
      // console.log('GROSS AMOUNT Summary:', this.totalAmount);
      // console.log('TAX_AMOUNT Summary:', this.taxAmount);
      console.log('NET AMOUNT Summary:', this.grandTotal);
    } else {
      console.warn('Summary values not ready yet.');
    }
  }

  onRoundOffChange() {
    if (this.salesReturnFormData.ROUND_OFF) {
      // Round Off Enabled
      this.netAmount = Math.round(this.grandTotal).toFixed(2);
    } else {
      // Round Off Disabled → return to original value
      this.netAmount = Number(this.grandTotal).toFixed(2);
    }
  }

  onEditorPreparing(e: any) {
    if (e.dataField === 'QUANTITY') {
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
    }
  }

  onContentReady(e: any) {
    this.logGridSummaries();
  }

  saveSaleReturn() {
    // ==============================
    // BASIC VALIDATIONS
    // ==============================
    if (!this.salesReturnFormData.REF_NO) {
      notify('Please enter Reference No', 'warning', 2000);
      return;
    }
    if (!this.salesReturnFormData.CUST_ID) {
      notify('Please select a customer', 'warning', 2000);
      return;
    }

    if (!this.mainGridData || this.mainGridData.length === 0) {
      notify('Please add at least one item', 'warning', 2000);
      return;
    }

    // ==============================
    // ROW LEVEL VALIDATION
    // ==============================
    const invalidRow = this.mainGridData.find(
      (row) =>
        !row.QUANTITY || row.QUANTITY <= 0 || row.QUANTITY > row.PENDING_QTY,
    );

    if (invalidRow) {
      notify(
        'Quantity must be greater than 0 and less than or equal to Pending Qty',
        'warning',
        3000,
      );
      return;
    }

    // ==============================
    // PREPARE DETAILS
    // ==============================
    const details = this.mainGridData.map((row) => {
      const amount = this.calculateAmount(row);
      const vatAmount = this.calculateVATAmount(row);
      const totalAmount = amount + vatAmount;

      return {
        SALE_DET_ID: row.SALE_DET_ID,

        // DETAIL LEVEL SALE INFO
        SALE_ID: row.SLAE_ID,
        SALE_NO: row.SALE_NO,

        ITEM_ID: row.ITEM_ID,
        PENDING_QTY: row.PENDING_QTY,
        QUANTITY: row.QUANTITY,
        PRICE: row.PRICE,
        AMOUNT: amount,

        // GST HANDLING
        VAT_PERC: Number(row.VAT_PERC) || 0,
        CGST: 0,
        SGST: 0,
        VAT_AMOUNT: vatAmount,
        TOTAL_AMOUNT: totalAmount,

        UOM: row.UOM,
        UOM_PURCH: row.UOM_PURCH,
        UOM_MULTIPLE: row.UOM_MULTIPLE,
        BAR_CODE: row.BARCODE,
        HSN_CODE: row.HSN_CODE,

        COMPANY_ID: this.selectedCompanyId,
        STORE_ID: 0,
      };
    });

    // ==============================
    // CALCULATE TOTALS
    // ==============================
    const grossAmount = details.reduce((sum, d) => sum + d.AMOUNT, 0);
    const vatAmount = details.reduce((sum, d) => sum + d.VAT_AMOUNT, 0);
    const netAmount = grossAmount + vatAmount;

    // ==============================
    // HEADER SALE REFERENCE
    // ==============================
    const firstRow = this.mainGridData[0];
    const today = new Date();
    const retDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');
    // ==============================
    // FINAL PAYLOAD
    // ==============================
    if (this.isVerifyMode) {
      this.salesReturnFormData.IS_VERIFIED = true;
    } else {
      this.salesReturnFormData.IS_VERIFIED = false;
    }
    const payload = {
      ...this.salesReturnFormData,
      ID: this.salesReturnFormData.TRANS_ID,
      COMPANY_ID: this.selectedCompanyId,
      USER_ID: this.userID,
      FIN_ID: this.finID,
      STORE_ID: this.salesReturnFormData.STORE_ID,
      // HEADER LEVEL SALE INFO
      SALE_ID: firstRow?.SLAE_ID || 0,
      SALE_NO: firstRow?.SALE_NO || '',

      // RET_DATE: new Date().toISOString(),
      RET_DATE: retDate,
      REF_NO: this.salesReturnFormData.REF_NO,
      NARRATION: this.salesReturnFormData.NARRATION,
      VEHICLE_NO: this.salesReturnFormData.VEHICLE_NO,

      GROSS_AMOUNT: Number(grossAmount.toFixed(2)),
      VAT_AMOUNT: Number(vatAmount.toFixed(2)),
      NET_AMOUNT: Number(netAmount.toFixed(2)),

      Details: details,
      IS_VERIFIED: this.salesReturnFormData.IS_VERIFIED,
    };

    // ==============================
    // DEBUG PAYLOAD
    // ==============================
    console.log(
      this.salesReturnFormData.IS_APPROVED
        ? 'FINAL APPROVE PAYLOAD:'
        : 'FINAL SAVE PAYLOAD:',
      payload,
    );
    this.isSaving = true;

    let apiCall$;

    // APPROVE CONFIRMATION
    if (this.isEditing && this.isApproveMode) {
      confirm(
        'Are you sure you want to approve this Sales Return?',
        'Confirm Approval',
      ).then((dialogResult) => {
        if (dialogResult) {
          apiCall$ = this.dataService.approveSaleReturn(payload);

          apiCall$.subscribe(
            () => {
              this.isSaving = false;

              notify('Sales return approved successfully', 'success', 3000);

              this.resetSaleReturnForm();
              this.popupClosed.emit();
            },
            (error) => {
              this.isSaving = false;

              console.error(error);

              notify('Failed to approve sales return', 'error', 3000);
            },
          );
        } else {
          this.isSaving = false;
        }
      });

      return;
    }

    // VERIFY CONFIRMATION
    if (this.isEditing && this.isVerifyMode) {
      confirm(
        'Are you sure you want to verify this Sales Return?',
        'Confirm Verification',
      ).then((dialogResult) => {
        if (dialogResult) {
          apiCall$ = this.dataService.updateSaleReturn(payload);

          apiCall$.subscribe(
            () => {
              this.isSaving = false;

              notify('Sales return verified successfully', 'success', 3000);

              this.resetSaleReturnForm();
              this.popupClosed.emit();
            },
            (error) => {
              this.isSaving = false;

              console.error(error);

              notify('Failed to verify sales return', 'error', 3000);
            },
          );
        } else {
          this.isSaving = false;
        }
      });

      return;
    }

    // NORMAL SAVE / UPDATE
    if (this.isEditing) {
      apiCall$ = this.dataService.updateSaleReturn(payload);
    } else {
      apiCall$ = this.dataService.saveSaleReturn(payload);
    }

    apiCall$.subscribe(
      () => {
        this.isSaving = false;

        notify(
          this.isEditing
            ? 'Sales return updated successfully'
            : 'Sales return saved successfully',
          'success',
          3000,
        );

        this.resetSaleReturnForm();
        this.popupClosed.emit();
      },
      (error) => {
        this.isSaving = false;

        console.error(error);

        notify(
          this.isEditing
            ? 'Failed to update sales return'
            : 'Failed to save sales return',
          'error',
          3000,
        );
      },
    );
  }

  cancel() {
    this.popupClosed.emit();
  }

  onPendingPopupClose() {
    const grid = this.popupGridRef?.instance;

    if (grid) {
      // 1️⃣ Clear row selection
      grid.clearSelection();

      // 2️⃣ Clear filter row & search
      grid.clearFilter();
      grid.clearFilter('row');
      grid.searchByText('');

      // 3️⃣ 🔥 CLEAR HEADER FILTER SELECTIONS (THIS IS THE KEY)
      grid.getVisibleColumns().forEach((col: any) => {
        if (col.dataField) {
          grid.columnOption(col.dataField, 'filterValues', null);
          grid.columnOption(col.dataField, 'filterType', null);
        }
      });

      // 4️⃣ Reset scroll
      grid.getScrollable()?.scrollTo({ top: 0 });

      // 5️⃣ Force UI refresh
      grid.refresh();
    }

    this.isTrOutPopupVisible = false;

    console.log('Pending Invoice popup fully reset (header filter included)');
  }

  resetSaleReturnForm() {
    // ==============================
    // RESET HEADER FORM DATA
    // ==============================
    this.salesReturnFormData = {
      COMPANY_ID: this.selectedCompanyId,
      STORE_ID: 0,
      RET_DATE: new Date(),
      CUST_ID: 0,
      SALE_ID: 0,
      SALE_NO: '',
      IS_CREDIT: true,
      GROSS_AMOUNT: 0,
      VAT_AMOUNT: 0,
      NET_AMOUNT: 0,
      USER_ID: this.userID,
      NARRATION: '',
      CURRENCY_SYMBOL: '',
      IS_APPROVED: false,
      RET_NO: '',
      VEHICLE_NO: '',
      ROUND_OFF: false,
      Details: [],
    };

    // ==============================
    // RESET GRID DATA
    // ==============================
    this.mainGridData = [];
    this.itemsGridRef?.instance?.refresh();

    // ==============================
    // RESET CUSTOMER & STATE INFO
    // ==============================
    this.selectedCustomer = null;
    this.selectedCustomerId = null;
    this.selectedCustomerStateId = null;
    this.sameState = false;

    // ==============================
    // RESET GST VISIBILITY
    // ==============================
    this.showGST = false;
    this.showCGST = false;
    this.showSGST = false;

    // ==============================
    // RESET TOTALS
    // ==============================
    this.netAmount = '0.00';
    this.grandTotal = 0;

    // ==============================
    // RESET POPUPS & FLAGS
    // ==============================
    this.isTrOutPopupVisible = false;
    this.isSaving = false;

    // ==============================
    // RE-GENERATE DOC NUMBER
    // ==============================
    this.getDocNo();

    console.log('Sales Return form reset successfully');
  }

  openPDF() {
    console.log(this.EditingResponseData.Header, 'Open PDF clicked');
    const returnId = this.EditingResponseData.Header.TRANS_ID;
    console.log(returnId);
    this.dataService.selectSaleReturn(returnId).subscribe((res: any) => {
      console.log(res, 'res-----');
      this.generatePDF(res);
    });
  }

  generatePDF(data: any) {
    // ============================
    // NORMALIZE API RESPONSE
    // ============================
    const header = data.Header;
    const details = data.Details || [];

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let y = 10;

    // ============================
    // LOGO
    // ============================
    const logoX = 18;
    const logoY = 12;
    const logoW = 30;
    const logoH = 30;

    doc.setFillColor(225, 225, 225);
    doc.rect(logoX, logoY, logoW, logoH, 'F');

    if (this.logoBase64) {
      doc.addImage(this.logoBase64, 'jpg', logoX, logoY, logoW, logoH);
    }

    // ============================
    // TITLE
    // ============================
    y = logoY + logoH + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SALE RETURN', pageWidth / 2, y, { align: 'center' });

    // ============================
    // RIGHT HEADER DETAILS
    // ============================
    doc.setFontSize(10);
    const rightX = pageWidth - 70;

    doc.text(`Return No : ${header.RET_NO}`, rightX, logoY + 5);
    doc.text(
      `Return Date : ${header.RET_DATE.split('T')[0]}`,
      rightX,
      logoY + 11,
    );
    doc.text(`Sale No : ${header.SALE_NO}`, rightX, logoY + 17);

    // ============================
    // HORIZONTAL LINE
    // ============================
    y += 8;
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // ============================
    // SELLER (BLUE BOX - LEFT)
    // ============================
    const leftX = margin;
    let blockY = y;
    const leftW = 95;
    const leftH = 48;

    doc.setFillColor(214, 236, 255);
    doc.rect(leftX, blockY, leftW, leftH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(header.COMPANY_NAME, leftX + 3, blockY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(header.COMPANY_ADDRESS1 || 'Kallai', leftX + 3, blockY + 12);
    doc.text(header.COMPANY_ADDRESS2 || 'Kozhikode', leftX + 3, blockY + 17);
    doc.text(header.COMPANY_ADDRESS3 || 'Kozhikode', leftX + 3, blockY + 22);
    doc.text(`GSTIN/UIN : ${header.GST_NO}`, leftX + 3, blockY + 27);
    doc.text(`State : KERALA, Code : 32`, leftX + 3, blockY + 32);
    doc.text(`E-Mail : ${header.EMAIL || '-'}`, leftX + 3, blockY + 37);

    // ============================
    // CONSIGNEE (SHIP TO) - RIGHT
    // ============================
    const rightBlockX = 120;
    let rightY = blockY + 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Consignee (Ship to)', rightBlockX, rightY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    rightY += 6;

    doc.text(header.CUST_NAME, rightBlockX, rightY);
    doc.text(header.CUST_ADDRESS1 || 'Kozhikode', rightBlockX, rightY + 5);
    doc.text(header.CUST_ADDRESS2 || 'Kozhikode', rightBlockX, rightY + 10);
    doc.text(header.CUST_ADDRESS3 || 'Kozhikode', rightBlockX, rightY + 15);
    doc.text(`GSTIN/UIN : ${header.CUST_CODE}`, rightBlockX, rightY + 20);
    doc.text(`State : KERALA, Code : 32`, rightBlockX, rightY + 25);

    // ============================
    // DISPATCHED FROM - LEFT BELOW
    // ============================
    let dispatchY = blockY + leftH + 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Dispatched From', leftX, dispatchY);

    doc.setFont('helvetica', 'normal');
    dispatchY += 6;
    doc.text(header.COMPANY_NAME, leftX, dispatchY);
    doc.text(header.COMPANY_ADDRESS1 || 'Kozhikode', leftX, dispatchY + 5);
    doc.text(header.COMPANY_ADDRESS2 || 'Kozhikode', leftX, dispatchY + 10);
    doc.text(header.COMPANY_ADDRESS3 || 'Kozhikode', leftX, dispatchY + 15);
    doc.text(`GSTIN/UIN : ${header.CUST_CODE}`, leftX, dispatchY + 20);

    // ============================
    // BUYER (BILL TO) - RIGHT BELOW
    // ============================
    let buyerY = dispatchY;

    doc.setFont('helvetica', 'bold');
    doc.text('Buyer (Bill to)', rightBlockX, buyerY);

    doc.setFont('helvetica', 'normal');
    buyerY += 6;
    doc.text(header.CUST_NAME, rightBlockX, buyerY);
    doc.text(header.CUST_ADDRESS1 || 'Kozhikode', rightBlockX, buyerY + 5);
    doc.text(header.CUST_ADDRESS2 || 'Kozhikode', rightBlockX, buyerY + 10);
    doc.text(header.CUST_ADDRESS3 || 'Kozhikode', rightBlockX, buyerY + 15);
    doc.text(`GSTIN/UIN : ${header.CUST_CODE}`, rightBlockX, buyerY + 20);
    doc.text(`State : KERALA, Code : 32`, rightBlockX, buyerY + 25);

    // ============================
    // INVOICE INFO - LEFT
    // ============================
    let infoY = buyerY + 35;

    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice Serial No : ${header.SALE_NO}`, leftX, infoY);

    doc.setFont('helvetica', 'normal');
    infoY += 6;
    doc.text(`Invoice Date : ${header.RET_DATE.split('T')[0]}`, leftX, infoY);
    infoY += 6;
    doc.text(`Vehicle No : ${header.VEHICLE_NO || '-'}`, leftX, infoY);
    infoY += 6;
    doc.text(`Mode of Transport :`, leftX, infoY);

    // ============================
    // MOVE Y FOR TABLE
    // ============================
    y = infoY + 10;

    // ============================
    // TABLE
    // ============================

    const rows = details.map((item: any, index: number) => [
      index + 1,
      item.DESCRIPTION || '-',
      item.HSN_CODE || '-',
      item.UOM || '-',
      Number(item.PRICE).toFixed(2),
      Number(item.QUANTITY),
      Number(item.AMOUNT).toFixed(2),
      Number(item.VAT_PERC).toFixed(2),
      Number(item.VAT_AMOUNT).toFixed(2),
      Number(item.TOTAL_AMOUNT).toFixed(2),
    ]);

    autoTable(doc, {
      startY: y,
      head: [
        [
          'Sl',
          'Item Description',
          'HSN',
          'UOM',
          'Rate',
          'Qty',
          'Amount',
          'GST %',
          'GST Amt',
          'Total',
        ],
      ],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 9, overflow: 'linebreak' },
      headStyles: { fillColor: [230, 230, 230] },
      foot: [
        [
          {
            content: 'Total',
            colSpan: 9,
            styles: { halign: 'right', fontStyle: 'bold' },
          },
          {
            content: Number(header.NET_AMOUNT).toFixed(2),
            styles: { fontStyle: 'bold' },
          },
        ],
      ],
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    const footerRequiredHeight = 90; // approx height of footer block

    let footY = (doc as any).lastAutoTable.finalY + 15;

    // 🔥 If footer won't fit, move to next page
    if (footY + footerRequiredHeight > pageHeight) {
      doc.addPage();
      footY = 20; // reset top margin for footer
    }

    // ============================
    // FOOTER (EXACT SCREENSHOT)
    // ============================
    // const footY = (doc as any).lastAutoTable.finalY + 15;

    const taxableValue = Number(header.GROSS_AMOUNT || 0);
    const totalTax = Number(header.VAT_AMOUNT || 0);
    const invoiceTotal = taxableValue + totalTax;

    const gstPerc =
      Number(details[0]?.CGST || 0) + Number(details[0]?.SGST || 0);

    // ---------- LEFT GST SUMMARY ----------
    let lx = 15;
    let ly = footY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    doc.text('GST %', lx, ly);
    doc.text('Taxable Value', lx + 22, ly);
    doc.text('Rate', lx + 55, ly);
    doc.text('Amount', lx + 75, ly);
    doc.text('Total Tax Amount', lx + 90, ly);

    ly += 8;
    doc.setFont('helvetica', 'normal');

    doc.text(`${gstPerc.toFixed(2)}%`, lx, ly);
    doc.text(taxableValue.toFixed(2), lx + 22, ly);
    doc.text(`${gstPerc.toFixed(2)}%`, lx + 55, ly);
    doc.text(totalTax.toFixed(2), lx + 75, ly);
    doc.text(totalTax.toFixed(2), lx + 90, ly);

    ly += 8;
    doc.setFont('helvetica', 'bold');
    doc.text(taxableValue.toFixed(2), lx + 22, ly);
    doc.text(totalTax.toFixed(2), lx + 75, ly);
    doc.text(totalTax.toFixed(2), lx + 100, ly);

    // ---------- RIGHT TOTAL SUMMARY ----------
    let rx = pageWidth - 60;
    let ry = footY;

    doc.setFont('helvetica', 'normal');

    doc.text('Taxable Value', rx, ry);
    doc.text(':', rx + 30, ry);
    doc.text(taxableValue.toFixed(2), rx + 40, ry);

    ry += 6;
    doc.text('Total Tax', rx, ry);
    doc.text(':', rx + 30, ry);
    doc.text(totalTax.toFixed(2), rx + 40, ry);

    ry += 6;
    doc.text('TCS', rx, ry);
    doc.text(':', rx + 30, ry);
    doc.text('0.00', rx + 40, ry);

    ry += 6;
    doc.text('Round Off', rx, ry);
    doc.text(':', rx + 30, ry);
    doc.text('0.00', rx + 40, ry);

    ry += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Total', rx, ry);
    doc.text(':', rx + 30, ry);
    doc.text(invoiceTotal.toFixed(2), rx + 40, ry);

    // ---------- REVERSE CHARGE ----------
    ry += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Whether the tax is payable on Reverse charge basis:', 15, ry);

    doc.setFont('helvetica', 'normal');
    doc.text('No Amount of tax subject to reverse charge', 120, ry);

    // ---------- AMOUNT IN WORDS ----------
    ry += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Amount in words :', 15, ry);

    doc.setFont('helvetica', 'normal');
    doc.text(`INR ${this.numberToWords(invoiceTotal)} Rupees Only`, 60, ry);

    // ---------- DECLARATION / REMARK ----------
    ry += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Declaration :', 15, ry);

    ry += 10;
    doc.text('Remark :', 15, ry);

    doc.setFont('helvetica', 'normal');
    doc.text(header.NARRATION || '-', 40, ry);

    // ============================
    // OPEN PDF
    // ============================
    doc.output('dataurlnewwindow');
  }

  numberToWords(amount: number): string {
    if (amount === 0) return 'Zero Rupees Only';

    const words = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];

    const tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];

    function convert(num: number): string {
      if (num < 20) return words[num];
      if (num < 100)
        return (
          tens[Math.floor(num / 10)] + (num % 10 ? ' ' + words[num % 10] : '')
        );
      if (num < 1000)
        return (
          words[Math.floor(num / 100)] +
          ' Hundred' +
          (num % 100 ? ' ' + convert(num % 100) : '')
        );
      if (num < 100000)
        return (
          convert(Math.floor(num / 1000)) +
          ' Thousand' +
          (num % 1000 ? ' ' + convert(num % 1000) : '')
        );
      if (num < 10000000)
        return (
          convert(Math.floor(num / 100000)) +
          ' Lakh' +
          (num % 100000 ? ' ' + convert(num % 100000) : '')
        );
      return (
        convert(Math.floor(num / 10000000)) +
        ' Crore' +
        (num % 10000000 ? ' ' + convert(num % 10000000) : '')
      );
    }

    return convert(Math.floor(amount)) + ' Rupees Only';
  }

  onPendingSelectionChanged(e: any) {
    const grid = e.component;

    e.selectedRowsData.forEach((row: any) => {
      const alreadyAdded = this.mainGridData.some(
        (item: any) =>
          item.SALE_DET_ID === row.SALE_DET_ID &&
          item.ITEM_ID === row.ITEM_ID &&
          item.SALE_NO === row.DOC_NO,
      );

      if (alreadyAdded) {
        grid.deselectRows([row]);

        notify('This invoice is already added to the grid', 'warning', 2000);
      }
    });
  }

  onPendingRowPrepared(e: any) {
    if (e.rowType !== 'data') return;

    const row = e.data;

    const alreadyAdded = this.mainGridData.some(
      (item: any) =>
        item.SALE_DET_ID === row.SALE_DET_ID &&
        item.ITEM_ID === row.ITEM_ID &&
        item.SALE_NO === row.DOC_NO,
    );

    if (alreadyAdded) {
      e.rowElement.style.opacity = '0.4';
      e.rowElement.style.pointerEvents = 'none';
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
  ],
  providers: [],
  declarations: [SaleReturnFormComponent],
  exports: [SaleReturnFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SaleReturnFormModule {}
