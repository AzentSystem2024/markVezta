import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  NgZone,
  Output,
  ViewChild,
} from '@angular/core';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxProgressBarModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTabPanelModule,
  DxTabsModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { AddInvoiceComponent } from '../INVOICE/add-invoice/add-invoice.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
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
import { AddJournalVoucharModule } from '../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-purchase-return-debit-form',
  templateUrl: './purchase-return-debit-form.component.html',
  styleUrls: ['./purchase-return-debit-form.component.scss'],
})
export class PurchaseReturnDebitFormComponent {
  @ViewChild('popupGridRef', { static: false }) popupGridRef: any;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Input() canApprove: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() isVerifyMode: boolean = false;
  @Input() isApproveMode: boolean = false;
  @ViewChild(AddInvoiceComponent) addInvoiceComp!: AddInvoiceComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('quotationGrid', { static: false }) quotationGrid: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
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
  logoBase64: string;
  departmentList: any;
  storeList: any;
  purchaseReturnFormData: any = {
    COMPANY_ID: 0,
    STORE_ID: 0,
    RET_DATE: new Date(),
    SUPP_ID: 0,
    GRN_ID: 0,
    GRN_NO: '',
    IS_CREDIT: true,
    GROSS_AMOUNT: 0,
    VAT_AMOUNT: 0,
    NET_AMOUNT: 0,
    USER_ID: 0,
    NARRATION: '',
    CURRENCY_SYMBOL: '',
    IS_APPROVED: false,
    // RET_NO: '',
    VEHICLE_NO: '',
    ROUND_OFF: false,
    PurchDetail: [
      {
        COMPANY_ID: 0,
        STORE_ID: 0,
        BAR_CODE: '',
        GRN_DET_ID: 0,
        ITEM_ID: 0,
        BATCH_NO: '',
        EXPIRY_DATE: 2025 - 11 - 20,
        PENDING_QTY: 0,
        QUANTITY: 0,
        RATE: 0,
        AMOUNT: 0,
        VAT_PERC: 0,
        CGST: 0,
        SGST: 0,
        VAT_AMOUNT: 0,
        TOTAL_AMOUNT: 0,
        UOM: '',
        UOM_PURCH: '',
        UOM_MULTIPLE: 0,
        PURCH_DET_ID: 0,
      },
    ],
  };
  selectedSupplierId: any;
  pendingList: any;
  companyList: any[];
  pendingQtyValidation = 0;
  HSNCODE: any;
  GST: any;
  companyState: any;
  isSameState: boolean = false;
  selectedCompany: any;
  showGST: boolean = false;
  showCGST: boolean = false;
  showSGST: boolean = false;
  netAmount: any;
  selectedCompanyId: any;
  companyStateId: any;
  selectedSupplierStateId: any;
  sameState: boolean = false;
  CGST: number;
  SGST: number;
  IGST: number;
  retNo: any;
  summaryValues: any;
  totalAmount: any;
  taxAmount: any;
  grandTotal: any;
  userID: any;
  finID: any;
  isSaving = false;
  vatTitle: any;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return;

    const userData = JSON.parse(userDataString);
    const selectedCompany = userData.SELECTED_COMPANY;
    this.vatTitle = userData.GeneralSettings.VAT_TITLE;
    // SINGLE SOURCE OF TRUTH
    this.selectedCompanyId = selectedCompany.COMPANY_ID;
    this.companyStateId = selectedCompany.STATE_ID;
    this.userID = userData.USER_ID;
    this.finID = userData.FINANCIAL_YEARS[0].FIN_ID;
    this.purchaseReturnFormData.COMPANY_ID = selectedCompany.COMPANY_ID;
    this.companyList = [selectedCompany];

    this.HSNCODE = userData.GeneralSettings.HSN_CODE;
    // this.GST = userData.GeneralSettings.GST_PERC;

    if (userData.USER_ID) {
      this.purchaseReturnFormData.USER_ID = userData.USER_ID;
    }

    const firstFinYear = userData.FINANCIAL_YEARS?.[0];
    if (firstFinYear?.FIN_ID) {
      this.purchaseReturnFormData.FIN_ID = firstFinYear.FIN_ID;
    }

    this.sessionData_tax();
    this.getSupplierLstWithState();
    const imagePath = 'assets/markLogo.jpg';
    this.convertToBase64(imagePath).then((base64) => {
      this.logoBase64 = base64;
    });
    this.getStoreData();
    this.getDepartments();
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

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    const data = this.EditingResponseData;
    setTimeout(() => {
      this.itemsGridRef?.instance?.beginCustomLoading('Loading...');
    });
    // Form patch
    this.purchaseReturnFormData = { ...this.purchaseReturnFormData, ...data };

    // Supplier GST logic
    const supplier = this.supplierList?.find((s: any) => s.ID === data.SUPP_ID);
    if (supplier) {
      this.sameState = supplier.STATE_ID === this.companyStateId;
      this.showCGST = this.sameState;
      this.showSGST = this.sameState;
      this.showGST = !this.sameState;
    }

    // IMPORTANT: Reset grid before binding
    this.mainGridData = [];
    this.cdr.detectChanges();
    this.purchaseReturnFormData.IS_APPROVED = false;
    // Map grid rows
    this.mainGridData = (data.PurchDetail || []).map((item: any) => {
      // COMBINE GST FOR UI (EDIT MODE)
      let vatPerc = 0;

      if (item.VAT_PERC && item.VAT_PERC > 0) {
        // IGST case
        vatPerc = item.VAT_PERC;
      } else {
        // CGST + SGST case → combine
        vatPerc = (Number(item.CGST) || 0) + (Number(item.SGST) || 0);
      }

      return {
        DETAIL_ID: item.PURCH_DET_ID,
        ITEM_ID: item.ITEM_ID,
        GRN_DET_ID: item.GRN_DET_ID,
        TRANSFER_NO: item.DOC_NO,
        TRANSFER_DATE: item.PURCH_DATE,
        ITEM_NAME: item.ITEM_NAME,
        PENDING_QTY: item.PENDING_QTY,
        RATE: item.RATE,
        QUANTITY: item.QUANTITY,
        AMOUNT: item.AMOUNT,
        VAT_AMOUNT: item.VAT_AMOUNT,
        TOTAL_AMOUNT: item.TOTAL_AMOUNT,
        UOM: item.UOM,
        UOM_PURCH: item.UOM_PURCH,
        UOM_MULTIPLE: item.UOM_MULTIPLE,
        BARCODE: item.BAR_CODE,
        HSN_CODE: item.HSN_CODE,

        // UI ALWAYS USES VAT_PERC
        VAT_PERC: vatPerc,

        // KEEP THESE ZERO IN UI
        CGST: 0,
        SGST: 0,

        DOC_NO: item.DOC_NO,
        STORE_ID: data.STORE_ID,
        DEPT_ID: data.DEPT_ID,
        // STORE_ID: item.STORE_ID ?? this.purchaseReturnFormData.STORE_ID ?? null,

        // DEPT_ID: item.DEPT_ID ?? this.purchaseReturnFormData.DEPT_ID ?? null,
      };
    });

    // Force grid refresh
    setTimeout(() => {
      if (this.itemsGridRef?.instance) {
        this.itemsGridRef.instance.beginUpdate();
        this.itemsGridRef.instance.option('dataSource', this.mainGridData);
        this.itemsGridRef.instance.endUpdate();
        this.itemsGridRef.instance.refresh();

        this.itemsGridRef?.instance?.endCustomLoading();
      }
    }, 50);
  }

  getStoreData() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDropdownData(payload).subscribe((res) => {
      this.storeList = res;
    });
  }

  getDepartments() {
    const payload = {
      NAME: 'DEPARTMENTS',
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDropdownData(payload).subscribe((res) => {
      this.departmentList = res;
    });
  }

  getDocNo() {
    const payload = {
      TRANS_TYPE: 20,
      COMPANY_ID: this.selectedCompanyId,
      SUB_TYPE_ID: 0,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.retNo = response.PURCHASE_NO;
      this.purchaseReturnFormData.DOC_NO = response.DOC_NO;
    });
  }

  getSupplierLstWithState() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
      NAME: 'SUPPLIER',
    };
    this.dataService
      .getSupplierWithState(payload)
      .subscribe((response: any) => {
        this.supplierList = response;
        console.log(this.supplierList, 'SUPPLIER LIST LOADED');

        // FIX: NOW load edit data only AFTER supplierList has data
        if (this.isEditing) {
          this.isEditDataAvailable();
        } else {
          this.getDocNo();
        }
      });
  }

  onSupplierChanged(event: any) {
    this.selectedSupplierId = event.value;
    if (this.mainGridData && this.mainGridData.length > 0) {
      this.mainGridData = [];
      this.itemsGridRef?.instance?.refresh();
      console.log('Grid cleared because supplier changed.');
    }
    const selectedSupplier = this.supplierList.find(
      (supplier: any) => supplier.ID === this.selectedSupplierId,
    );
    this.selectedSupplierStateId = selectedSupplier.STATE_ID;

    if (selectedSupplier) {
      this.purchaseReturnFormData.SUPPPLIER_NAME = selectedSupplier.DESCRIPTION;
      this.sameState = this.selectedSupplierStateId === this.companyStateId;

      this.showCGST = this.sameState;
      this.showSGST = this.sameState;
      this.showGST = !this.sameState;
    } else {
      this.purchaseReturnFormData.SUPPPLIER_NAME = '';
    }

    console.log('Selected Supplier:', selectedSupplier);
  }
  isAlreadySelected = (rowData: any) => {
    return this.mainGridData?.some(
      (item) => item.DETAIL_ID === rowData.DETAIL_ID,
    );
  };

  onPopupSelectionChanged(e: any) {
    const grid = this.popupGridRef.instance;

    const invalidRows = e.selectedRowsData.filter((row: any) =>
      this.isAlreadySelected(row),
    );

    if (invalidRows.length > 0) {
      invalidRows.forEach((row: any) => {
        grid.deselectRows([row.DETAIL_ID]);
      });

      notify('This invoice is already selected', 'warning', 2000);
    }
  }

  onPopupRowPrepared(e: any) {
    if (e.rowType === 'data') {
      const alreadyAdded = this.isAlreadySelected(e.data);

      if (alreadyAdded) {
        e.rowElement.style.opacity = '0.5';
        e.rowElement.style.pointerEvents = 'none';
        e.rowElement.title = 'Already added';
      }
    }
  }
  openPendingGrnPopup() {
    if (!this.selectedSupplierId) {
      notify('Please Select A Supplier', 'warning', 2000);
      return;
    }

    const payload = {
      SUPP_ID: this.selectedSupplierId,
      COMPANY_ID: this.selectedCompanyId,
    };

    this.dataService
      .getPendingInvoicesForReturn(payload)
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

    if (selectedRows.length > 0) {
      selectedRows.forEach((row: any) => {
        const exists = this.mainGridData.some(
          (item) => item.DETAIL_ID === row.DETAIL_ID,
        );

        if (!exists) {
          const gstPerc = Number(row.GST_PERC) || 0;

          let cgst = 0;
          let sgst = 0;
          let igst = 0;

          //  SAME STATE → Split GST
          // if (this.sameState) {
          //   cgst = gstPerc / 2;
          //   sgst = gstPerc / 2;
          //   igst = 0;
          // }
          // //  DIFFERENT STATE → IGST
          // else {
          //   cgst = 0;
          //   sgst = 0;
          //   igst = gstPerc;
          // }

          this.mainGridData.push({
            DETAIL_ID: row.DETAIL_ID,
            ITEM_ID: row.ITEM_ID,
            GRN_DET_ID: row.GRN_DET_ID,
            TRANSFER_NO: row.DOC_NO,
            TRANSFER_DATE: row.PURCH_DATE,
            ITEM_NAME: row.ITEM_NAME,
            PENDING_QTY: row.PENDING_QTY,
            RATE: row.RATE,
            QUANTITY: 0,
            AMOUNT: row.AMOUNT,
            TOTAL_AMOUNT: 0,
            UOM: row.UOM,
            UOM_PURCH: row.UOM_PURCH,
            UOM_MULTIPLE: row.UOM_MULTIPLE,
            BARCODE: row.BARCODE,
            HSN_CODE: row.HSN_CODE,

            //GST FROM PENDING LIST
            VAT_PERC: gstPerc, // IGST only
            CGST: cgst,
            SGST: sgst,
            VAT_AMOUNT: 0,
          });
        }
      });

      this.mainGridData = [...this.mainGridData];
      this.itemsGridRef.instance.refresh();
      this.popupGridRef.instance.clearSelection();
    }

    this.isTrOutPopupVisible = false;

    setTimeout(() => {
      this.itemsGridRef.instance.editCell(0, 'QUANTITY');
    }, 200);
  }

  onContentReady(e: any): void {
    this.logGridSummaries();
  }

  logGridSummaries() {
    this.summaryValues = this.itemsGridRef?.instance?.getTotalSummaryValue;

    if (this.summaryValues) {
      this.grandTotal =
        this.itemsGridRef?.instance?.getTotalSummaryValue('TOTAL_AMOUNT') || 0;
      this.netAmount = Number(this.grandTotal).toFixed(2);
      this.onRoundOffChange();
    } else {
      console.warn('Summary values not ready yet.');
    }
  }

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'QUANTITY' ||
      e.dataField === 'VAT_PERC' ||
      e.dataField === 'RATE' ||
      e.dataField === 'STORE_ID' ||
      e.dataField === 'DEPT_ID' ||
      e.dataField === 'AMOUNT'
    ) {
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
            grid.focus(grid.getCellElement(rowIndex, 'GST'));
          }, 50);
        }
      };
    }
  }

  validateQuantity = (e: any) => {
    const row = e.data;
    const qty = e.value;
    const pendingQty = row?.PENDING_QTY ?? 0;

    // Allow empty value while typing
    if (qty == null || qty === '') return true;

    return qty <= pendingQty;
  };

  calculateAmount = (rowData: any) => {
    const qty = Number(rowData.QUANTITY) || 0;
    const totalRate = Number(rowData.RATE) || 0;
    const pendingQty = Number(rowData.PENDING_QTY) || 0;
    // const rate = Number(rowData.RATE) || 0;
    // const rate = pendingQty > 0 ? totalRate / pendingQty : 0;

    // const amount = qty * rate;
    const amount = qty * totalRate;
    // also store the calculated amount inside the row (optional)
    rowData.AMOUNT = amount;

    return amount;
  };

  calculateVATAmount = (rowData: any) => {
    if (!rowData) return 0;

    const amount = Number(rowData.AMOUNT) || 0;

    // if (this.sameState) {
    //   const cgst = Number(rowData.CGST) || 0;
    //   const sgst = Number(rowData.SGST) || 0;

    //   return (amount * (cgst + sgst)) / 100;
    // } else {
    const GST = Number(rowData.VAT_PERC);
    return (amount * GST) / 100;
    // }
  };

  calculateTotalAmount = (rowData: any) => {
    return this.calculateAmount(rowData) + this.calculateVATAmount(rowData);
  };
  private toDateOnlyString(value: any): string {
    if (!value) return '';

    const dt = new Date(value); // works if value is Date or ISO-ish string
    if (isNaN(dt.getTime())) return ''; // invalid date guard

    const y = dt.getFullYear();
    const m = ('0' + (dt.getMonth() + 1)).slice(-2);
    const d = ('0' + dt.getDate()).slice(-2);

    return `${y}-${m}-${d}`;
  }

  onRowPrepared(e: any) {
    if (e.rowType === 'data' && e.data?.isInvalid) {
      e.rowElement.classList.add('invalid-row');
    }
  }

  savePurchaseReturn() {
    // Validate Supplier
    if (!this.purchaseReturnFormData.SUPP_ID) {
      notify('Please select a supplier.', 'warning', 2000);
      return;
    }

    // Validate grid items
    if (!this.mainGridData || this.mainGridData.length === 0) {
      notify('Please add at least one item.', 'warning', 2000);
      return;
    }
    //  Get Store & Department from grid
    this.itemsGridRef.instance.saveEditData();

    const selectedStoreId = this.mainGridData[0]?.STORE_ID || null;
    const selectedDeptId = this.mainGridData[0]?.DEPT_ID || null;

    //  Assign to header
    this.purchaseReturnFormData.STORE_ID = selectedStoreId;
    this.purchaseReturnFormData.DEPT_ID = selectedDeptId;
    // Validate quantity
    const invalidQtyRow = this.mainGridData.find(
      (row) => !row.QUANTITY || row.QUANTITY <= 0,
    );
    // if (invalidQtyRow) {
    //   notify('Please enter a valid Quantity for all items.', 'warning', 2000);
    //   return;
    // }
    let isValid = true;

    this.mainGridData.forEach((row: any, index: number) => {
      row.isInvalid = false; //  reset

      if (!row.QUANTITY || row.QUANTITY <= 0) {
        row.isInvalid = true;
        isValid = false;
      }

      if (row.QUANTITY > row.PENDING_QTY) {
        row.isInvalid = true;
        isValid = false;
      }
    });

    //  force UI update
    this.itemsGridRef.instance.repaint();

    if (!isValid) {
      notify(
        'Please enter valid quantity for highlighted rows.',
        'warning',
        2000,
      );
      return;
    }
    let totalAmount = 0;
    let totalVAT = 0;
    let totalNet = 0;
    // --- Map PurchDetail ---
    this.purchaseReturnFormData.PurchDetail = this.mainGridData.map(
      (row: any) => {
        const amount = this.calculateAmount(row);
        const vat = this.calculateVATAmount(row);
        totalAmount += amount;
        totalVAT += vat;
        totalNet += amount + vat;
        // GST FIX START
        const gstPerc =
          Number(row.VAT_PERC) || Number(row.CGST) + Number(row.SGST) || 0;

        let VAT_PERC = 0;
        let CGST = 0;
        let SGST = 0;

        if (this.sameState) {
          // SAME STATE → split
          CGST = gstPerc / 2;
          SGST = gstPerc / 2;
          VAT_PERC = 0;
        } else {
          // DIFFERENT STATE → IGST
          VAT_PERC = gstPerc;
          CGST = 0;
          SGST = 0;
        }
        return {
          COMPANY_ID: this.purchaseReturnFormData.COMPANY_ID,
          // STORE_ID: this.purchaseReturnFormData.STORE_ID,
          STORE_ID: 0,
          DEPT_ID: 0,
          BAR_CODE: row.BARCODE ?? '',
          GRN_DET_ID: row.GRN_DET_ID ?? 0,
          ITEM_ID: row.ITEM_ID ?? 0,
          PURCH_DET_ID: row.DETAIL_ID ?? 0,
          BATCH_NO: '',
          EXPIRY_DATE: new Date(),
          PENDING_QTY: row.PENDING_QTY ?? 0,
          QUANTITY: row.QUANTITY ?? 0,
          RATE: row.RATE ?? 0,
          AMOUNT: row.AMOUNT ?? 0,
          VAT_PERC: VAT_PERC,
          CGST: CGST,
          SGST: SGST,
          VAT_AMOUNT: row.VAT_AMOUNT ?? 0,
          TOTAL_AMOUNT: totalAmount,
          UOM: row.UOM ?? '',
          UOM_PURCH: row.UOM_PURCH ?? '',
          UOM_MULTIPLE: row.UOM_MULTIPLE ?? 0,
        };
      },
    );

    const today = new Date();
    const retDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    this.purchaseReturnFormData.VEHICLE_NO =
      this.purchaseReturnFormData.VEHICLE_NO;
    this.purchaseReturnFormData.GROSS_AMOUNT = totalAmount;
    this.purchaseReturnFormData.VAT_AMOUNT = totalVAT;
    this.purchaseReturnFormData.NET_AMOUNT = totalNet;
    this.purchaseReturnFormData.RETURN_AMOUNT = totalNet;
    this.purchaseReturnFormData.COMPANY_ID =
      this.purchaseReturnFormData.COMPANY_ID;
    this.purchaseReturnFormData.FIN_ID = this.finID;
    this.purchaseReturnFormData.USER_ID = this.purchaseReturnFormData.USER_ID;
    // this.purchaseReturnFormData.RET_DATE = this.toDateOnlyString(
    //   this.purchaseReturnFormData.RET_DATE,
    // );
    this.purchaseReturnFormData.RET_DATE = retDate;

    // --- ADD MODE vs EDIT MODE ---
    // --- ADD MODE vs EDIT MODE ---
    if (this.isEditing) {
      // Only for edit: ensure Return ID is passed (if backend needs it)
      if (this.EditingResponseData?.RETURN_ID) {
        this.purchaseReturnFormData.RETURN_ID =
          this.EditingResponseData.RETURN_ID;
      }

      // =========================================
      // VERIFY MODE
      // =========================================
      if (this.isVerifyMode) {
        const result = confirm(
          `Are you sure you want to verify this Purchase Return?`,
          'Confirm Verification',
        );

        result.then((dialogResult) => {
          if (dialogResult) {
            this.isSaving = true;

            this.dataService
              .verifyPurchaseReturn(this.purchaseReturnFormData)
              .subscribe(
                (response: any) => {
                  this.isSaving = false;

                  notify(
                    {
                      message: 'Purchase Return Verified Successfully',
                      position: { at: 'top right', my: 'top right' },
                    },
                    'success',
                  );

                  this.popupClosed.emit();
                },

                (error: any) => {
                  this.isSaving = false;
                  console.error('VERIFY ERROR:', error);

                  if (error?.status === 0) {
                    notify(
                      'Network error. Please check your internet connection and try again.',
                      'error',
                      3000,
                    );
                  } else {
                    notify(
                      'Error verifying purchase return. Please try again.',
                      'error',
                      3000,
                    );
                  }
                },
              );
          }
        });

        return;
      }

      // =========================================
      // APPROVE MODE
      // =========================================
      if (this.isApproveMode) {
        const result = confirm(
          `Are you sure you want to approve this Purchase Return?`,
          'Confirm Approval',
        );

        result.then((dialogResult) => {
          if (dialogResult) {
            this.isSaving = true;

            this.dataService
              .approvePurchaseReturn(this.purchaseReturnFormData)
              .subscribe(
                (response: any) => {
                  this.isSaving = false;

                  notify(
                    {
                      message: 'Purchase Return Approved Successfully',
                      position: { at: 'top right', my: 'top right' },
                    },
                    'success',
                  );

                  this.popupClosed.emit();
                },

                (error) => {
                  this.isSaving = false;
                  console.error('APPROVE ERROR:', error);

                  if (error?.status === 0) {
                    notify(
                      'Network error. Please check your internet connection and try again.',
                      'error',
                      3000,
                    );
                  } else {
                    notify(
                      'Error approving purchase return. Please try again.',
                      'error',
                      3000,
                    );
                  }
                },
              );
          }
        });

        return;
      }

      // =========================================
      // NORMAL EDIT MODE
      // =========================================

      // If approved → call APPROVE API
      if (this.purchaseReturnFormData.IS_APPROVED === true) {
        const result = confirm(
          `Are you sure you want to approve this Purchase Return?`,
          'Confirm Approval',
        );

        result.then((dialogResult) => {
          if (dialogResult) {
            this.isSaving = true;

            // user clicked OK → call APPROVE API
            this.dataService
              .approvePurchaseReturn(this.purchaseReturnFormData)
              .subscribe(
                (response: any) => {
                  this.isSaving = false;

                  notify(
                    {
                      message: 'Purchase Return Approved Successfully',
                      position: { at: 'top right', my: 'top right' },
                    },
                    'success',
                  );

                  this.popupClosed.emit();
                },

                (error) => {
                  this.isSaving = false;
                  console.error('SAVE ERROR:', error);

                  if (error?.status === 0) {
                    notify(
                      'Network error. Please check your internet connection and try again.',
                      'error',
                      3000,
                    );
                  } else {
                    notify(
                      'Error saving purchase return. Please try again.',
                      'error',
                      3000,
                    );
                  }
                },
              );
          } else {
            // user clicked Cancel → do nothing
            return;
          }
        });

        return;
      } else {
        // Otherwise → UPDATE API
        this.isSaving = true;

        this.dataService
          .updatePurchaseReturn(this.purchaseReturnFormData)
          .subscribe(
            (response: any) => {
              this.isSaving = false;

              notify(
                {
                  message: 'Purchase Return Updated Successfully',
                  position: { at: 'top right', my: 'top right' },
                },
                'success',
              );

              this.popupClosed.emit();
            },

            (error) => {
              this.isSaving = false;
              console.error('SAVE ERROR:', error);

              if (error?.status === 0) {
                notify(
                  'Network error. Please check your internet connection and try again.',
                  'error',
                  3000,
                );
              } else {
                notify(
                  'Error saving purchase return. Please try again.',
                  'error',
                  3000,
                );
              }
            },
          );
      }
    } else {
      // ---------------------------------------
      // INSERT MODE — **UPDATED PART**
      // ---------------------------------------

      if (this.purchaseReturnFormData.IS_APPROVED === true) {
        const result = confirm(
          'Are you sure you want to approve and commit this invoice?',
          'Confirmation',
        );

        result.then((confirmed) => {
          if (confirmed) {
            // User clicked YES → Save
            this.isSaving = true;
            this.dataService
              .insertPurchaseReturn(this.purchaseReturnFormData)
              .subscribe(
                (response: any) => {
                  this.isSaving = false;
                  notify(
                    {
                      message: 'Purchase Return Saved Successfully',
                      position: { at: 'top right', my: 'top right' },
                    },
                    'success',
                  );
                  this.resetPurchaseReturnForm();

                  // Fetch new Doc No and THEN close popup
                  this.dataService
                    .getPurchaseReturnNo()
                    .subscribe((resp: any) => {
                      // this.purchaseReturnFormData.RET_NO = resp.PURCHASE_NO;
                      this.popupClosed.emit();
                    });
                },
                (error) => {
                  this.isSaving = false;
                  console.error('SAVE ERROR:', error);

                  if (error?.status === 0) {
                    notify(
                      'Network error. Please check your internet connection and try again.',
                      'error',
                      3000,
                    );
                  } else {
                    notify(
                      'Error saving purchase return. Please try again.',
                      'error',
                      3000,
                    );
                  }
                },
              );
          }
        });
      } else {
        this.isSaving = true;
        // Not approved → Direct INSERT
        this.dataService
          .insertPurchaseReturn(this.purchaseReturnFormData)
          .subscribe(
            (response: any) => {
              this.isSaving = false;
              notify(
                {
                  message: 'Purchase Return Saved Successfully',
                  position: { at: 'top right', my: 'top right' },
                },
                'success',
              );
              this.resetPurchaseReturnForm();
              // this.getDocNo();
              this.popupClosed.emit();
            },
            (error) => {
              this.isSaving = false;
              console.error('SAVE ERROR:', error);

              if (error?.status === 0) {
                notify(
                  'Network error. Please check your internet connection and try again.',
                  'error',
                  3000,
                );
              } else {
                notify(
                  'Error saving purchase return. Please try again.',
                  'error',
                  3000,
                );
              }
            },
          );
      }
    }
  }

  formatDateDDMMMyyyy(dateStr: string) {
    const date = new Date(dateStr);
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${date.getDate().toString().padStart(2, '0')}-${
      months[date.getMonth()]
    }-${date.getFullYear().toString().slice(-2)}`;
  }

  openPDF() {
    // Call your PDF API or open a URL
    console.log('Open PDF clicked');
    const returnId = this.EditingResponseData.TRANS_ID;
    console.log(returnId);
    this.dataService.selectPurchaseReturn(returnId).subscribe((res: any) => {
      console.log(res, 'res-----');
      this.generatePDF(res);
    });
  }

  generatePDF(data: any) {
    // Normalize API response
    if (Array.isArray(data)) {
      data = data[0];
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let y = 10;

    // ======================================================
    // LOGO
    // ======================================================
    const logoX = 18;
    const logoY = 12;
    const logoW = 30;
    const logoH = 30;

    doc.setFillColor(225, 225, 225);
    doc.rect(logoX, logoY, logoW, logoH, 'F');
    doc.addImage(this.logoBase64, 'jpg', logoX, logoY, logoW, logoH);

    // ======================================================
    // TITLE
    // ======================================================
    y = logoY + logoH + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('DEBIT NOTE', pageWidth / 2, y, { align: 'center' });

    // ======================================================
    // RIGHT HEADER DETAILS
    // ======================================================
    doc.setFontSize(10);
    const rightX = pageWidth - 65;

    doc.text(`GST IN : ${data.GST_NO}`, rightX, logoY + 5);
    doc.text(`CIN : ${data.CIN}`, rightX, logoY + 11);
    doc.text(`PAN : ${data.PAN_NO}`, rightX, logoY + 17);

    // ======================================================
    // HORIZONTAL LINE
    // ======================================================
    y += 8;
    doc.setDrawColor(0);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    // ======================================================
    // SELLER BLUE BOX
    // ======================================================
    const blueX = margin;
    const blueY = y;
    const blueW = 100;
    const blueH = 38;

    doc.setFillColor(204, 229, 255);
    doc.rect(blueX, blueY, blueW, blueH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(data.COMPANY_NAME, blueX + 3, blueY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(data.ADDRESS1, blueX + 3, blueY + 13);
    doc.text(data.ADDRESS2, blueX + 3, blueY + 18);
    doc.text(data.ADDRESS3, blueX + 3, blueY + 23);
    doc.text(`GSTIN/UIN : ${data.GST_NO}`, blueX + 3, blueY + 28);
    doc.text(
      `State : ${data.SUPP_STATE_NAME}, Code : 32`,
      blueX + 3,
      blueY + 33,
    );

    // ======================================================
    // CONSIGNEE / BUYER (RIGHT SIDE)
    // ======================================================
    const rightBlockX = 125;
    let rightY = blueY + 5;
    const gap = 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Consignee (Ship to)', rightBlockX, rightY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    rightY += gap;

    doc.text(data.SUPP_NAME || '', rightBlockX, rightY);
    doc.text(data.SUPP_ADDRESS1 || '', rightBlockX, rightY + gap);
    doc.text(data.SUPP_ADDRESS2 || '', rightBlockX, rightY + gap * 2);
    doc.text(data.SUPP_ADDRESS3 || '', rightBlockX, rightY + gap * 3);
    doc.text(`GSTIN/UIN : ${data.SUPP_CODE}`, rightBlockX, rightY + gap * 4);

    // ======================================================
    // TABLE
    // ======================================================
    y = Math.max(blueY + blueH + 12, rightY + gap * 6);

    const rows = (data.PurchDetail || []).map((item: any) => [
      item.DOC_NO || '-', // Transfer No.
      (item.PURCH_DATE || '').split('T')[0], // Date
      item.ITEM_NAME || '-', // Item Name
      item.HSN_CODE || '-', // HSN Code
      Number(item.RATE || 0).toFixed(2), // Price
      Number(item.PENDING_QTY || 0), // Pending Qty
      Number(item.QUANTITY || 0), // Quantity
      Number(item.AMOUNT || 0).toFixed(2), // Amount
      Number(item.VAT_PERC || 0).toFixed(2), // IGST(%)
      Number(item.VAT_AMOUNT || 0).toFixed(2), // GST Amount
      Number(item.TOTAL_AMOUNT || 0).toFixed(2), // Total
    ]);

    autoTable(doc, {
      startY: y,
      head: [
        [
          'Transfer No.',
          'Date',
          'Item Name',
          'HSN Code',
          'Price',
          'Pending Qty',
          'Quantiti',
          'Amount',
          'IGST(%)',
          'GST Amount',
          'total',
        ],
      ],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [230, 230, 230] },
      columnStyles: { 8: { halign: 'right' } },
      foot: [
        [
          {
            content: 'Total',
            colSpan: 8,
            styles: { halign: 'right', fontStyle: 'bold' },
          },
          {
            content: data.NET_AMOUNT.toFixed(2),
            styles: { fontStyle: 'bold' },
          },
        ],
      ],
    });

    // ============================================================
    // FOOTER - EXACTLY LIKE THE PROVIDED SCREENSHOT
    // ============================================================

    const footStartY = (doc as any).lastAutoTable.finalY + 15;

    // ---------------- LEFT GST SUMMARY TABLE ----------------
    let lx = 15;
    let ly = footStartY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    // Header row (super compact spacing)
    doc.text('GST %', lx, ly);
    doc.text('Taxable Value', lx + 22, ly);
    doc.text('Integrated Tax', lx + 50, ly);
    doc.text('Total Tax Amount', lx + 85, ly);

    // Sub-headers (more compact)
    doc.setFontSize(8);
    doc.text('Rate', lx + 50, ly + 5);
    doc.text('Amount', lx + 68, ly + 5);

    // Values row
    ly += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const taxable = Number(data.NET_AMOUNT || 0);
    const gstAmount = Number(data.PurchDetail[0].GST_AMOUNT || 0);
    const gstPerc =
      Number(data.PurchDetail[0].CGST || 0) +
      Number(data.PurchDetail[0].SGST || 0);

    // Compact data alignment
    doc.text(gstPerc.toFixed(2) + '%', lx, ly);
    doc.text(taxable.toFixed(2), lx + 22, ly);
    doc.text(gstPerc.toFixed(2) + '%', lx + 50, ly);
    doc.text(gstAmount.toFixed(2), lx + 68, ly);
    doc.text(gstAmount.toFixed(2), lx + 85, ly);

    // TOTAL ROW (bold, compact)
    ly += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(taxable.toFixed(2), lx + 22, ly);
    doc.text(gstAmount.toFixed(2), lx + 68, ly);
    doc.text(gstAmount.toFixed(2), lx + 85, ly);

    // ---------------- RIGHT SUMMARY ----------------
    let rx = pageWidth - 65;
    let ry = footStartY;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const labelX = rx;
    const colonX = rx + 30;
    const valueX = rx + 40;

    // Taxable Value
    doc.text('Taxable Value', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(taxable.toFixed(2), valueX, ry);

    // Total Tax
    ry += 6;
    doc.text('Total Tax', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(gstAmount.toFixed(2), valueX, ry);

    // TCS
    ry += 6;
    doc.text('TCS', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text('0.00', valueX, ry);

    // Round Off
    ry += 6;
    const roundOff = taxable + gstAmount - Math.floor(taxable + gstAmount);
    doc.text('Round Off', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(roundOff.toFixed(2), valueX, ry);

    // Invoice Total — BOLD
    ry += 8;
    const invoiceTotal = Math.floor(taxable + gstAmount);

    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Total', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(invoiceTotal.toFixed(2), valueX, ry);

    // ---------------- REVERSE CHARGE + AMOUNT IN WORDS ----------------
    let wordsY = ry + 15;

    doc.setFont('helvetica', 'bold');
    doc.text(
      'Whether the tax is payable on Reverse charge basis: ',
      15,
      wordsY,
    );

    doc.setFont('helvetica', 'normal');
    doc.text('No Amount of tax subject to reverse charge', 120, wordsY);

    // Amount in words
    wordsY += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Amount in words :', 15, wordsY);

    doc.setFont('helvetica', 'normal');
    doc.text(`INR ${this.numberToWords(taxable)} Rupees Only`, 60, wordsY);

    // ---------------- DECLARATION + REMARK ----------------
    let blockY = wordsY + 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Declaration :', 15, blockY);

    blockY += 10;
    doc.text('Remark :', 15, blockY);

    doc.setFont('helvetica', 'normal');
    doc.text(data.NARRATION || '', 40, blockY);

    // ---------------- SIGNATURE ----------------
    let sigY = blockY + 25;

    doc.setFont('helvetica', 'bold');
    doc.text(`For ${data.COMPANY_NAME}`, pageWidth - 90, sigY);

    sigY += 18;
    doc.setFont('helvetica', 'normal');
    doc.text('Authorised Signatory', pageWidth - 75, sigY);
    // ======================================================
    // OPEN PDF
    // ======================================================
    doc.output('dataurlnewwindow');
  }

  cancel() {
    this.popupClosed.emit();
  }

  resetPurchaseReturnForm() {
    this.purchaseReturnFormData = {
      COMPANY_ID: this.selectedCompanyId,
      STORE_ID: 0,
      RET_DATE: new Date(),
      SUPP_ID: 0,
      GRN_ID: 0,
      GRN_NO: '',
      IS_CREDIT: true,
      GROSS_AMOUNT: 0,
      VAT_AMOUNT: 0,
      NET_AMOUNT: 0,
      USER_ID: this.userID,
      NARRATION: '',
      CURRENCY_SYMBOL: '',
      PurchDetail: [], // ✔ empty detail list
      SUPPPLIER_NAME: '',
      RETURN_AMOUNT: 0,
      IS_APPROVED: false,
      ROUND_OFF: false,
    };

    this.selectedSupplierId = null;

    this.mainGridData = []; // ✔ clear grid
    if (this.itemsGridRef && this.itemsGridRef.instance) {
      this.itemsGridRef.instance.refresh();
    }

    this.pendingList = []; // ✔ clear pending list

    this.isApproved = false; // ✔ reset approve checkbox
    this.getDocNo();
    // Ensure UI updates
    this.cdr.detectChanges();
  }

  onRoundOffChange() {
    if (this.purchaseReturnFormData.ROUND_OFF) {
      // Round Off Enabled
      this.netAmount = Math.round(this.grandTotal).toFixed(2);
    } else {
      // Round Off Disabled → return to original value
      this.netAmount = Number(this.grandTotal).toFixed(2);
    }
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
  declarations: [PurchaseReturnDebitFormComponent],
  exports: [PurchaseReturnDebitFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PurchaseReturnDebitFormModule {}
