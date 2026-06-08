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
import { FormTextboxModule } from 'src/app/components';
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-add-purchase-invoice',
  templateUrl: './add-purchase-invoice.component.html',
  styleUrls: ['./add-purchase-invoice.component.scss'],
})
export class AddPurchaseInvoiceComponent {
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
  sessionData: any;
  selected_vat_id: any;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  supplierList: any;
  isTrOutPopupVisible: boolean = false;
  pendingGRNs: any;
  selectedGRNs: any[] = [];
  mainGridData: any[] = [];
  departmentList: any;
  storeList: any;
  purchaseInvoiceFormData: any = {
    COMPANY_ID: 0,
    USER_ID: 0,
    STORE_ID: 0,
    PURCH_NO: '',
    STORE_NAME: '',
    SUPPPLIER_NAME: '',
    NARRATION: '',
    STATUS: '',
    PURCH_DATE: new Date(),
    SUPP_ID: '',
    SUPP_INV_NO: '',
    SUPP_INV_DATE: new Date(),
    PO_ID: 0,
    PO_NO: 0,
    FIN_ID: 0,
    TRANS_ID: 0,
    PURCH_TYPE: 0,
    DISCOUNT_AMOUNT: 0,
    SUPP_GROSS_AMOUNT: 0,
    SUPP_NET_AMOUNT: 0,
    EXCHANGE_RATE: 0,
    GROSS_AMOUNT: 0,
    CHARGE_DESCRIPTION: '',
    CHARGE_AMOUNT: 0,
    VAT_AMOUNT: 0,
    NET_AMOUNT: 0,
    RETURN_AMOUNT: 0,
    ADJ_AMOUNT: 0,
    PAID_AMOUNT: 0,
    IS_APPROVED: false,
    VEHICLE_NO: '',
    ROUND_OFF: false,
    PurchDetails: [
      {
        COMPANY_ID: '',
        STORE_ID: '',
        PURCH_ID: '',
        GRN_DET_ID: '',
        ITEM_ID: '',
        PACKING: '',
        QUANTITY: '',
        RATE: '',
        PRICE: '',
        AMOUNT: '',
        RETURN_QTY: '',
        ITEM_DESC: '',
        PO_DET_ID: '',
        UOM: '',
        DISC_PERCENT: '',
        COST: '',
        SUPP_PRICE: '',
        SUPP_AMOUNT: '',
        VAT_PERC: '',
        VAT_AMOUNT: '',
        GRN_STORE_ID: '',
        RETURN_AMOUNT: '',
        STORE_NAME: '',
        ITEM_NAME: '',
        ITEM_CODE: '',
        PO_QUANTITY: '',
        GRN_QUANTITY: '',
        SGST: 0,
        CGST: 0,
        DEPT_ID: '',
        DISC_AMT: 0,
      },
    ],
  };
  selectedSupplierId: any;
  isApproved: boolean = false;
  HSNCODE: any;
  GST: any;
  selectedCompanyId: any;
  companyList: any[];

  companyState: any;
  isSameState: boolean = false;
  selectedCompany: any;
  showGST: boolean = false;
  showCGST: boolean = false;
  showSGST: boolean = false;
  mainInvoiceGridList: any;
  selectedState: any;
  selectedSupplier: any;
  distributorList: any;
  grandTotal: number;
  netAmount: string;
  summaryValues: any;
  totalAmount: any;
  taxAmount: any;
  fin_id: any;
  store_id: any;
  user_id: any;
  isSaving = false;
  vatTilte: any;
  totalDiscAmount: any;
  isHQApp: any;
  filteredStoreList: { ID: any; DESCRIPTION: any }[];
  selectSupplierDetails: any;
  is_default: boolean = false;
  CurrencyCode: any;
  constructor(private dataService: DataService) {
    this.sessionData_tax();
  }

  ngOnInit() {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return;

    const userData = JSON.parse(userDataString);
    const selectedCompany = userData.SELECTED_COMPANY;
    this.vatTilte = userData.GeneralSettings.VAT_TITLE;
    console.log(this.vatTilte, 'VATTITLE');
    // REQUIRED FOR DOC NO
    this.selectedCompanyId = selectedCompany.COMPANY_ID;

    // Bind company to form
    this.purchaseInvoiceFormData.COMPANY_ID = selectedCompany.COMPANY_ID;
    this.companyList = [selectedCompany];
    this.isHQApp = userData.GeneralSettings.IS_HQ_APP;
    const configStore = userData.Configuration?.[0];
    // Other settings
    this.HSNCODE = userData.GeneralSettings.HSN_CODE;
    this.GST = userData.GeneralSettings.GST_PERC;

    this.sessionData_tax();
    this.getSupplierOrUnitLst();
    this.getPendingGRNList();

    // CALL DOC NO ONLY AFTER COMPANY_ID IS READY
    this.getSuppInvNo();
    this.getStoreData();
    if (this.isHQApp && configStore) {
      this.filteredStoreList = [
        {
          ID: configStore.STORE_ID,
          DESCRIPTION: configStore.STORE_NAME,
        },
      ];

      // Auto select store
      this.purchaseInvoiceFormData.STORE_ID = configStore.STORE_ID;
    } else {
      this.filteredStoreList = this.storeList;
    }
    this.getDepartments();
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

  onStoreValueChanged(event: any) {}
  // getStoreData() {
  //   const payload = {
  //     NAME: 'STORE',
  //     COMPANY_ID: this.selectedCompany,
  //   };
  //   this.dataService.getDropdownData(payload).subscribe((res) => {
  //     this.storeList = res;
  //   });
  // }

  getDepartments() {
    const payload = {
      NAME: 'DEPARTMENTS',
      COMPANY_ID: this.selectedCompany,
    };
    this.dataService.getDropdownData(payload).subscribe((res) => {
      this.departmentList = res;
    });
  }

  getSupplierDropdown() {
    this.dataService.getDropdownData('SUPPLIER').subscribe((response: any) => {
      this.supplierList = response;
    });
  }

  getSuppInvNo() {
    const payload = {
      TRANS_TYPE: 19,
      COMPANY_ID: this.selectedCompanyId,
      SUB_TYPE_ID: 0,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.purchaseInvoiceFormData.DOC_NO = response.DOC_NO;
    });
  }

  getSupplierOrUnitLst() {
    const payload = {
      COMPANY_ID: this.selectedCompany,
    };
    this.dataService
      .getSupplierWithState(payload)
      .subscribe((response: any) => {
        this.distributorList = response;
      });
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    const sessiondata = JSON.parse(
      sessionStorage.getItem('savedUserData') || '',
    );
    // this.CurrencyCode = sessiondata.GeneralSettings.SYMBOL
    this.selected_vat_id = this.sessionData.VAT_ID;
    this.selectedCompany = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.fin_id = this.sessionData.FINANCIAL_YEARS[0].FIN_ID;
    console.log(this.fin_id);
    this.store_id = this.sessionData.Configuration?.[0]?.STORE_ID;
    console.log(this.store_id);
    this.user_id = this.sessionData.USER_ID;
    console.log(this.user_id);
    this.companyState = this.sessionData.SELECTED_COMPANY.STATE_NAME;
    this.GST = this.sessionData.GeneralSettings.GST_PERC;
  }

  getPendingGRNList() {
    const payload = {
      SUPP_ID: this.selectedSupplierId,
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getPendingGRN(payload).subscribe((response: any) => {
      this.pendingGRNs = response.Data;
    });
  }

  onSupplierChanged(event: any) {
    const newSupplierId = event.value;

    // Supplier changed → clear grid
    if (this.selectedSupplierId && this.selectedSupplierId !== newSupplierId) {
      this.clearGridAndChangeSupplier(newSupplierId);
      return;
    }

    // First-time selection
    this.applySupplierChange(newSupplierId);
  }

  applySupplierChange(supplierId: any) {
    this.selectedSupplierId = supplierId;
    this.dataService
      .selectSupplier(this.selectedSupplierId)
      .subscribe((res: any) => {
        console.log(res);
        this.selectSupplierDetails = res;

        this.is_default = this.selectSupplierDetails.IS_DEFAULT_CURRENCY;
        if (this.is_default) {
          // const sessiondata = JSON.parse(sessionStorage.getItem('savedUserData') || '');
          this.CurrencyCode = null;
        } else {
          const currency_id = this.selectSupplierDetails.CURRENCY_ID;

          this.dataService.getCurrencyData().subscribe((response: any) => {
            const currencylist = response;

            const selectedCurrencyDetails = currencylist.find(
              (item: any) => item.ID === currency_id,
            );
            if (selectedCurrencyDetails) {
              this.CurrencyCode = selectedCurrencyDetails.SYMBOL;
            }
            console.log(this.CurrencyCode);
          });
        }
      });

    this.mainGridData = [];
    this.itemsGridRef?.instance?.refresh();

    // Reset GST visibility
    this.showGST = false;
    this.showCGST = false;
    this.showSGST = false;

    // Reset totals
    this.totalAmount = 0;
    this.taxAmount = 0;
    this.grandTotal = 0;
    this.netAmount = '0.00';

    // Load supplier details again
    const selectedSupplier = this.distributorList.find(
      (s: any) => s.ID === supplierId,
    );

    this.selectedSupplier = selectedSupplier;
    this.purchaseInvoiceFormData.SUPPPLIER_NAME =
      selectedSupplier?.DESCRIPTION || '';
    // this.updateGstColumnVisibility();
    // Load GRNs only when popup opens (recommended)
  }
  clearGridAndChangeSupplier(newSupplierId: any) {
    this.mainGridData = [];
    this.itemsGridRef?.instance?.clearSelection();
    this.itemsGridRef?.instance?.refresh();

    this.applySupplierChange(newSupplierId);
  }

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'QUANTITY' ||
      e.dataField === 'VAT_PERC' ||
      e.dataField === 'STORE_ID' ||
      e.dataField === 'DEPT_ID' ||
      e.dataField === 'DISC_PERCENT'
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
            (r: any) => r?.data === e.row?.data,
          );
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'GST'));
          }, 50);
        }
      };
    }
    if (e.dataField === 'SUPP_PRICE') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === e.row?.data,
          );
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'VAT_AMOUNT'));
          }, 50);
        }
      };
    }
    if (e.dataField === 'QUANTITY' && e.parentType === 'dataRow') {
      e.editorOptions = {
        ...e.editorOptions,
        disabled: false,
      };
    }
  }

  openPendingGrnPopup() {
    this.getPendingGRNList();
    this.isTrOutPopupVisible = true;
  }

  // calculateAmount = (row: any) => {
  //   return (parseFloat(row.PRICE) || 0) * (parseFloat(row.QUANTITY) || 0);
  // };

  calculateAmount = (row: any) => {
    const qty = Number(row?.QUANTITY) || 0;
    const price = Number(row?.PRICE) || 0;

    const amount = qty * price;

    const discPerc = Number(row?.DISC_PERCENT) || 0;
    const discAmt = (amount * discPerc) / 100;

    return amount - discAmt;
  };

  calculateDiscAmt = (rowData: any) => {
    const qty = Number(rowData?.QUANTITY) || 0;
    const price = Number(rowData?.PRICE) || 0;

    const amount = qty * price; //  recompute instead of using rowData.AMOUNT
    const discPerc = Number(rowData?.DISC_PERCENT) || 0;

    return (amount * discPerc) / 100;
  };

  calculateDiscountAmount = (rowData: any) => {
    const qty = Number(rowData?.QUANTITY) || 0;
    const price = Number(rowData?.PRICE) || 0;

    const amount = qty * price;

    const discPerc = Number(rowData?.DISC_PERCENT) || 0;
    const discAmt = (amount * discPerc) / 100;

    return amount - discAmt;
  };

  calculateGstAmount = (row: any) => {
    const amt = this.calculateDiscountAmount(row);
    const vatPerc = parseFloat(row.VAT_PERC) || 0;
    return amt * (vatPerc / 100);
  };

  calculateTotal = (row: any) => {
    const amt = this.calculateDiscountAmount(row);
    const gst = this.calculateGstAmount(row);
    return amt + gst;
  };
  // calculateGstAmount = (row: any) => {
  //   const amt = this.calculateAmount(row);
  //   const vatPerc = parseFloat(row.VAT_PERC) || 0;
  //   return amt * (vatPerc / 100);
  // };

  // calculateTotal = (row: any) => {
  //   return this.calculateAmount(row) + this.calculateGstAmount(row);
  // };

  validateQuantity = (e: any) => {
    const quantity = e.value;
    const pendingQty = e.data?.PENDING_QTY ?? 0;
    return quantity <= pendingQty;
  };

  isGRNAlreadySelected = (rowData: any) => {
    return this.mainGridData?.some(
      (item) => item.GRN_DET_ID === rowData.GRN_DET_ID,
    );
  };

  onPopupSelectionChanged(e: any) {
    const grid = this.popupGridRef.instance;

    const invalidRows = e.selectedRowsData.filter((row: any) =>
      this.isGRNAlreadySelected(row),
    );

    if (invalidRows.length > 0) {
      invalidRows.forEach((row: any) => {
        grid.deselectRows([row.GRN_DET_ID]);
      });

      notify(
        'Some GRNs are already added and cannot be selected again',
        'warning',
        2000,
      );
      return;
    }
  }
  onPopupRowPrepared(e: any) {
    if (e.rowType === 'data') {
      const alreadyAdded = this.isGRNAlreadySelected(e.data);

      if (alreadyAdded) {
        e.rowElement.style.opacity = '0.5';
        e.rowElement.style.pointerEvents = 'none';
        e.rowElement.title = 'Already added';
      }
    }
  }
  onTransferSelectClick() {
    const selectedRows = this.popupGridRef.instance.getSelectedRowsData();
    // Prevent button action if duplicate exists
    const hasDuplicate = selectedRows.some((row: any) =>
      this.isGRNAlreadySelected(row),
    );

    if (hasDuplicate) {
      notify(
        'Some GRNs are already added and cannot be selected again',
        'warning',
        2000,
      );
      return;
    }
    selectedRows.forEach((row) => {
      const exists = this.mainGridData.some(
        (item) =>
          item.GRN_DET_ID === row.GRN_DET_ID && item.ITEM_ID === row.ITEM_ID,
      );
      if (exists) return;

      const gstPerc = Number(row.GST_PERC) || 0;

      const companyState = this.companyState?.trim().toLowerCase();
      const supplierState =
        this.selectedSupplier?.STATE_NAME?.trim().toLowerCase();

      let igst = 0,
        cgst = 0,
        sgst = 0;

      if (companyState === supplierState) {
        //  INTRA STATE → CGST + SGST
        cgst = gstPerc / 2;
        sgst = gstPerc / 2;
      } else {
        //  INTER STATE → IGST
        igst = gstPerc;
      }

      const newRow: any = {
        GRN_ID: row.GRN_ID,
        GRN_DET_ID: row.GRN_DET_ID,
        ITEM_ID: row.ITEM_ID,
        ITEM_NAME: row.ITEM_NAME,
        UOM: row.UOM,
        TRANSFER_NO: row.GRN_NO,
        GRN_DATE: row.GRN_DATE,
        PRICE: row.RATE,
        PENDING_QTY: row.PENDING_QTY,
        QUANTITY: 0,
        DISC_PERCENT: row.DISC_PERCENT,
        HSN_CODE: row.HSN_CODE,
        VAT_PERC: row.VAT_PERC, // IGST %
        AMOUNT: 0,
        VAT_AMOUNT: 0,
        TOTAL_AMOUNT: 0,
      };

      this.mainGridData.push(newRow);
    });

    this.itemsGridRef.instance.refresh();
    this.popupGridRef.instance.clearSelection();
    this.isTrOutPopupVisible = false;

    setTimeout(() => {
      this.itemsGridRef.instance.editCell(0, 'QUANTITY');
    }, 100);
  }

  onRowPrepared(e: any) {
    if (e.rowType === 'data' && e.data?.isInvalid) {
      e.rowElement.classList.add('invalid-row');
    }
  }

  savePurchaseInvoice() {
    if (!this.purchaseInvoiceFormData.SUPP_ID) {
      notify(
        {
          message: 'Please select a supplier before saving the invoice.',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
        3000,
      );
      return; // stop execution here
    }
    if (!this.purchaseInvoiceFormData.SUPP_INV_NO) {
      notify(
        {
          message: 'Please Enter a Refferce No before saving the invoice.',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
        3000,
      );
      return; // stop execution here
    }

    // 1. Get updated summary values from the grid
    if (this.itemsGridRef?.instance) {
      this.totalAmount =
        this.itemsGridRef.instance.getTotalSummaryValue('AMOUNT') || 0;
      this.totalDiscAmount =
        this.itemsGridRef.instance.getTotalSummaryValue('DISC_AMT') || 0;
      this.taxAmount =
        this.itemsGridRef.instance.getTotalSummaryValue('VAT_AMOUNT') || 0;
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

    if (!this.mainGridData || this.mainGridData.length === 0) {
      notify(
        {
          message: 'Please add at least one item before saving the invoice.',
          position: { at: 'top right', my: 'top right' },
        },
        'warning',
        3000,
      );
      return; // stop execution here
    }

    let grossAmount = 0;
    let vatAmount = 0;
    let netAmount = 0;
    let totalDiscountAmount = 0;
    // Ensure latest edited values are saved
    this.itemsGridRef.instance.saveEditData();
    let isValid = true;

    this.mainGridData.forEach((row: any, index: number) => {
      row.isInvalid = false; // reset first

      if (!row.QUANTITY || row.QUANTITY <= 0) {
        row.isInvalid = true; // ADD THIS
        notify(
          // `Row ${index + 1}: Quantity must be greater than 0`,
          'Please enter valid quantity for highlighted rows.',
          'warning',
          3000,
        );
        isValid = false;
      }

      if (row.QUANTITY > row.PENDING_QTY) {
        row.isInvalid = true; // ✅ ADD THIS
        notify(
          `Row ${index + 1}: Quantity exceeds pending qty`,
          'warning',
          3000,
        );
        isValid = false;
      }
    });
    this.itemsGridRef.instance.repaint();
    if (!isValid) {
      return;
    }
    // Take from first row (since it's common for all)
    const selectedStoreId = this.mainGridData[0]?.STORE_ID || 0;
    const selectedDeptId = this.mainGridData[0]?.DEPT_ID || 0;
    this.purchaseInvoiceFormData.PurchDetails = this.mainGridData.map(
      (item: any) => {
        const amount = this.calculateAmount(item);
        const vat = this.calculateGstAmount(item);
        const discamt = this.calculateDiscAmt(item);
        const net = this.calculateTotal(item);

        grossAmount += amount;
        vatAmount += vat;
        // netAmount += amount + vat;
        totalDiscountAmount += discamt;
        netAmount += net;
        return {
          COMPANY_ID: this.selectedCompany,
          USER_ID: this.user_id,
          // STORE_ID: this.store_id,
          // STORE_ID: selectedStoreId || this.store_id,
          STORE_ID: this.purchaseInvoiceFormData.STORE_ID,
          DEPT_ID: selectedDeptId || 0,
          FIN_ID: this.fin_id,
          PURCH_ID: 0, // or a real ID if updating
          GRN_DET_ID: item.GRN_DET_ID || '', // populate based on GRN data
          ITEM_ID: item.ITEM_ID,
          PACKING: item.PACKING || '',
          QUANTITY: item.QUANTITY || '',
          RATE: item.PRICE || '',
          PRICE: item.PRICE || '',
          AMOUNT: this.calculateTotal(item),
          RETURN_QTY: 0, // optional
          ITEM_DESC: item.ITEM_DESC || '',
          PO_DET_ID: item.PO_DET_ID,
          UOM: item.UOM,
          // DISC_PERCENT: 0,
          COST: item.COST,
          SUPP_PRICE: item.PRICE || 0,
          SUPP_AMOUNT: item.AMOUNT,
          VAT_PERC: item.VAT_PERC || 0,
          VAT_AMOUNT: this.calculateGstAmount(item),
          GRN_STORE_ID: this.store_id,
          RETURN_AMOUNT: 0,
          STORE_NAME: '',
          ITEM_NAME: '',
          ITEM_CODE: '',
          PO_QUANTITY: 0,
          GRN_QUANTITY: 0,
          SGST: item.SGST,
          CGST: item.CGST,
          DISC_PERCENT: item.DISC_PERCENT,
          DISC_AMT: this.calculateDiscAmt(item),
          // GST: item.GST ?? 0,
        };
      },
    );

    this.purchaseInvoiceFormData.GROSS_AMOUNT = parseFloat(
      grossAmount.toFixed(2),
    );
    this.purchaseInvoiceFormData.VAT_AMOUNT = parseFloat(vatAmount.toFixed(2));
    this.purchaseInvoiceFormData.DISCOUNT_AMOUNT = parseFloat(
      totalDiscountAmount.toFixed(2),
    );
    this.purchaseInvoiceFormData.NET_AMOUNT = parseFloat(netAmount.toFixed(2));
    this.purchaseInvoiceFormData.SUPP_GROSS_AMOUNT = parseFloat(
      grossAmount.toFixed(2),
    );
    this.purchaseInvoiceFormData.SUPP_NET_AMOUNT = parseFloat(
      netAmount.toFixed(2),
    );
    this.purchaseInvoiceFormData.PURCH_DATE =
      this.purchaseInvoiceFormData.PURCH_DATE;

    const today = new Date();
    const invoiceDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    this.purchaseInvoiceFormData.COMPANY_ID = this.selectedCompany;
    this.purchaseInvoiceFormData.USER_ID = this.user_id;
    // this.purchaseInvoiceFormData.STORE_ID = selectedStoreId || 0;
    this.purchaseInvoiceFormData.STORE_ID =
      this.purchaseInvoiceFormData.STORE_ID || this.store_id;
    this.purchaseInvoiceFormData.DEPT_ID = selectedDeptId || 0;
    this.purchaseInvoiceFormData.FIN_ID = this.fin_id;
    this.purchaseInvoiceFormData.PURCH_DATE = invoiceDate;

    const callInsertAPI = () => {
      this.isSaving = true;
      this.dataService
        .insertPurchaseInvoice(this.purchaseInvoiceFormData)
        .subscribe({
          next: (res) => {
            this.isSaving = false;
            notify(
              {
                message: 'Invoice saved successfully',
                position: { at: 'top right', my: 'top right' },
              },
              'success',
              3000,
            );
            this.resetInvoiceForm();
            this.popupClosed?.emit();
          },
          error: (err) => {
            this.isSaving = false;
            console.error('Save failed', err);
          },
        });
    };
    if (this.purchaseInvoiceFormData.IS_APPROVED === true) {
      const dialog = confirm(
        'Are you sure you want to approve and commit this invoice?',
        'Confirmation',
      );

      dialog.then((confirmed: boolean) => {
        if (confirmed) {
          callInsertAPI(); // Only save if user clicked YES
        }
      });
    } else {
      callInsertAPI(); // Save directly
    }
  }

  resetInvoiceForm() {
    this.purchaseInvoiceFormData = {
      COMPANY_ID: this.purchaseInvoiceFormData.COMPANY_ID || null, // keep if needed
      STORE_ID: null,
      PURCH_ID: 0,
      GROSS_AMOUNT: 0,
      VAT_AMOUNT: 0,
      NET_AMOUNT: 0,
      SUPP_GROSS_AMOUNT: 0,
      SUPP_NET_AMOUNT: 0,
      SUPPLIER_ID: null,
      INVOICE_NO: '',
      PURCH_DATE: new Date(),
      SUPP_INV_DATE: new Date(),
      REMARKS: '',
      ROUND_OFF: false,
      PurchDetails: [], // reset line items
      isApproved: false,
      IS_APPROVED: false,
    };

    this.mainGridData = []; // clear grid rows
    this.getSuppInvNo();
  }

  cancel() {
    this.popupClosed?.emit();
  }

  logGridSummaries() {
    this.summaryValues = this.itemsGridRef?.instance?.getTotalSummaryValue;

    if (this.summaryValues) {
      this.totalAmount =
        this.itemsGridRef?.instance?.getTotalSummaryValue('AMOUNT') || 0;
      this.taxAmount =
        this.itemsGridRef?.instance?.getTotalSummaryValue('VAT_AMOUNT') || 0;
      this.totalDiscAmount =
        this.itemsGridRef?.instance?.getTotalSummaryValue('DISC_AMT') || 0;
      this.grandTotal =
        this.itemsGridRef?.instance?.getTotalSummaryValue('TOTAL_AMOUNT') || 0;
      // this.netAmount = Number(this.grandTotal).toFixed(2);
      this.netAmount = Number(this.grandTotal).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      this.onRoundOffChange();
    } else {
      console.warn('Summary values not ready yet.');
    }
  }

  get formattedNetAmount(): string {
    const value = Number(this.netAmount || this.grandTotal || 0);
    return value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  onContentReady(e: any): void {
    this.logGridSummaries();
  }

  onRoundOffChange() {
    const total = Number(this.grandTotal) || 0;

    if (this.purchaseInvoiceFormData.ROUND_OFF) {
      this.netAmount = Math.round(total).toFixed(2);
    } else {
      this.netAmount = total.toFixed(2);
    }
  }
  onPopupClose() {
    const grid = this.popupGridRef?.instance;

    if (grid) {
      grid.clearFilter(); // ✅ clears filter row
      grid.clearSorting(); // optional
      grid.clearGrouping(); // optional
      grid.clearSelection(); // optional (if you want reset selection)
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
  declarations: [AddPurchaseInvoiceComponent],
  exports: [AddPurchaseInvoiceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddPurchaseInvoiceModule {}
