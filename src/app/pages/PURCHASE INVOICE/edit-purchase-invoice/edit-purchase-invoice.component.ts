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
import { AddPurchaseInvoiceComponent } from '../add-purchase-invoice/add-purchase-invoice.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-edit-purchase-invoice',
  templateUrl: './edit-purchase-invoice.component.html',
  styleUrls: ['./edit-purchase-invoice.component.scss'],
})
export class EditPurchaseInvoiceComponent {
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() invoiceFormData: any;
  @Input() canApprove: boolean = false;
  popupVisible = false;
  @Input() isVerifyInvoice: boolean = false;
  @Input() status: any;
  @Input() isVerifyMode: boolean = false;
  @Input() isApproveMode: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  distributorList: any;
  isTrOutPopupVisible: boolean = false;
  supplierList: any;
  auto: string = 'auto';
  isFilterRowVisible: boolean = false;
  selectedGRNs: any[] = [];
  mainGridData: any[] = [];
  purchaseInvoiceFormData: any;
  pendingGRNs: any;
  isApproved: boolean = false;
  @Input() readOnly: boolean = false;
  purchaseNo: any;
  selectedSupplierId: any;
  sessionData: any;
  selected_vat_id: any;
  selectedInvoice: any;
  HSNCODE: any;
  GST: any;
  selectedCompany: any;
  companyState: any;
  showCGST: boolean = false;
  showGST: boolean = false;
  showSGST: boolean = false;
  selectedSupplier: any;
  taxAmount: any;
  grandTotal: any;
  totalAmount: any;
  netAmount: string;
  summaryValues: any;
  logoBase64: string;
  fin_id: any;
  user_id: any;
  store_id: any;
  isSaving = false;
  vatTilte: any;
  storeList: any;
  departmentList: any;
  totalDiscAmount: any;
  isHQApp: any;
  filteredStoreList: { ID: any; DESCRIPTION: any }[];
  selectSupplierDetails: any;
  is_default: any;
  Currency_Code: any;

  constructor(private dataService: DataService) {
    const userDataString = localStorage.getItem('userData');
    // if (userDataString) {
    const userData = JSON.parse(userDataString);
    const selectedCompany = userData?.SELECTED_COMPANY;
    this.HSNCODE = userData.GeneralSettings.HSN_CODE;
    this.GST = userData.GeneralSettings.GST_PERC;
    console.log(this.HSNCODE, this.GST, 'HSNCODEANDGST');
    this.sessionData_tax();
  }

  ngOnInit() {
    console.log(this.isVerifyMode, '[[[[[[[[[[[[');
    console.log(this.isApproveMode, 'APPROVEEEEEE');
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return;

    const userData = JSON.parse(userDataString);
    const selectedCompany = userData.SELECTED_COMPANY;
    this.vatTilte = userData.GeneralSettings.VAT_TITLE;
    console.log(this.vatTilte, 'VATTITLE');
    this.isHQApp = userData.GeneralSettings.IS_HQ_APP;
    const configStore = userData.Configuration?.[0];
    // this.getSupplierDropdown();
    this.getSupplierOrUnitLst();
    // this.getPendingGRNList();
    // this.getPurchNo();
    const imagePath = 'assets/markLogo.jpg';
    this.convertToBase64(imagePath).then((base64) => {
      this.logoBase64 = base64;
      console.log('Logo Base64 Loaded');
    });

    this.sessionData_tax();
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
    setTimeout(() => {
      this.itemsGridRef?.instance?.refresh();
    }, 100);

    console.log(this.status);

    if (this.status === 'Approved') {
      this.readOnly === true;
    }
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoiceFormData']) {
      console.log('Changed invoiceFormData:', this.invoiceFormData);

      this.purchaseInvoiceFormData = this.invoiceFormData;

      // Load grid data
      // this.mainGridData = this.purchaseInvoiceFormData.PurchDetails;
      this.mainGridData = (this.purchaseInvoiceFormData.PurchDetails || []).map(
        (row: any) => ({
          ...row,
          STORE_ID: row.STORE_ID || this.purchaseInvoiceFormData.STORE_ID,
          DEPT_ID: row.DEPT_ID || this.purchaseInvoiceFormData.DEPT_ID,
          GRN_DATE: row.GRN_DATE ? new Date(row.GRN_DATE) : null,
        }),
      );

      // Get company and supplier state names
      const companyState = this.companyState?.trim().toLowerCase();
      const supplierState =
        this.purchaseInvoiceFormData?.SUPP_STATE_NAME?.trim().toLowerCase();

      console.log('Company:', companyState, 'Supplier:', supplierState);

      // GST Percentage from session
      const gstPerc = parseFloat(this.GST) || 0;

      // ---------------------------------------------------------
      // CONDITION: SAME STATE → CGST + SGST, DIFFERENT → GST ONLY
      // ---------------------------------------------------------

      // ---------------------------------------------------------
      // Supplier ID assignment
      // ---------------------------------------------------------
      this.purchaseInvoiceFormData.SUPP_ID = Number(
        this.invoiceFormData.SUPP_ID,
      );
      this.selectedSupplierId = this.purchaseInvoiceFormData.SUPP_ID;

      if (this.selectedSupplierId) {
        this.getPendingGRNList();
      }

      console.log('SUPP_ID:', this.purchaseInvoiceFormData.SUPP_ID);
    }
  }

  getStoreData() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selectedCompany,
    };

    this.dataService.getDropdownData(payload).subscribe((res) => {
      this.storeList = res;

      if (this.isHQApp && this.sessionData?.Configuration?.[0]) {
        const configStore = this.sessionData.Configuration[0];

        this.filteredStoreList = [
          {
            ID: configStore.STORE_ID,
            DESCRIPTION: configStore.STORE_NAME,
          },
        ];

        if (!this.purchaseInvoiceFormData?.STORE_ID) {
          this.purchaseInvoiceFormData.STORE_ID = configStore.STORE_ID;
        }
      } else {
        this.filteredStoreList = this.storeList;
      }
    });
  }

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
      console.log(
        this.supplierList,
        'distributorList==============================',
      );
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
        console.log(this.distributorList, 'DISTLISTPOPUP');
      });
  }

  getPendingGRNList() {
    const payload = {
      SUPP_ID: this.selectedSupplierId,
      COMPANY_ID: this.selectedCompany,
    };
    this.dataService.getPendingGRN(payload).subscribe((response: any) => {
      this.pendingGRNs = response.Data;
      console.log(this.pendingGRNs, 'PENDINGGRNSSSSSSSSSSSSSSSSSSSSSSSSS');
    });

    this.dataService
      .selectSupplier(this.selectedSupplierId)
      .subscribe((res: any) => {
        console.log(res);
        this.selectSupplierDetails = res;

        this.is_default = this.selectSupplierDetails.IS_DEFAULT_CURRENCY;
        if (this.is_default) {
          const sessiondata = JSON.parse(
            sessionStorage.getItem('savedUserData') || '',
          );
          this.Currency_Code = null;
        } else {
          const currency_id = this.selectSupplierDetails.CURRENCY_ID;

          this.dataService.getCurrencyData().subscribe((response: any) => {
            const currencylist = response;

            const selectedCurrencyDetails = currencylist.find(
              (item: any) => item.ID === currency_id,
            );
            if (selectedCurrencyDetails) {
              this.Currency_Code = selectedCurrencyDetails.SYMBOL;
            }
            console.log(this.Currency_Code);
          });
        }
      });
  }

  onSupplierChanged(event: any) {
    this.selectedSupplierId = event.value;
    this.dataService
      .selectSupplier(this.selectedSupplierId)
      .subscribe((res: any) => {
        console.log(res);
        this.selectSupplierDetails = res;

        this.is_default = this.selectSupplierDetails.IS_DEFAULT_CURRENCY;
        if (this.is_default) {
          const sessiondata = JSON.parse(
            sessionStorage.getItem('savedUserData') || '',
          );
          this.Currency_Code = null;
        } else {
          const currency_id = this.selectSupplierDetails.CURRENCY_ID;

          this.dataService.getCurrencyData().subscribe((response: any) => {
            const currencylist = response;

            const selectedCurrencyDetails = currencylist.find(
              (item: any) => item.ID === currency_id,
            );
            if (selectedCurrencyDetails) {
              this.Currency_Code = selectedCurrencyDetails.SYMBOL;
            }
            console.log(this.Currency_Code);
          });
        }
      });
    const selectedSupplier = this.distributorList.find(
      (supplier: any) => supplier.ID === this.selectedSupplierId,
    );

    const company = this.companyState?.trim().toLowerCase();
    console.log(company);
    const supplier = selectedSupplier.STATE_NAME?.trim().toLowerCase();
    console.log(supplier);
    const sessionGst = parseFloat(this.GST) || 0; // main GST%
    console.log(sessionGst);

    if (company === supplier) {
      console.log('Both states SAME → CGST + SGST apply');

      this.showCGST = true;
      this.showSGST = true;
      this.showGST = false;

      //  Split GST into CGST + SGST
      const half = sessionGst / 2;

      // Update all grid rows
      this.mainGridData?.forEach((row: any) => {
        row.CGST = half;
        row.SGST = half;
        row.VAT_PERC = parseFloat(row.VAT_PERC) || 0;
        // row.VAT_PERC = 0; // GST becomes zero in same-state case
      });
    } else {
      console.log('States DIFFERENT → GST applies');

      this.showGST = true;
      this.showCGST = false;
      this.showSGST = false;

      // ⭐ GST only
      this.mainGridData?.forEach((row: any) => {
        row.VAT_PERC = sessionGst;
        row.CGST = 0;
        row.SGST = 0;
      });
    }
    this.selectedSupplier = selectedSupplier;

    if (selectedSupplier) {
      this.purchaseInvoiceFormData.SUPPPLIER_NAME =
        selectedSupplier.DESCRIPTION;
    } else {
      this.purchaseInvoiceFormData.SUPPPLIER_NAME = '';
    }

    console.log('Selected Supplier:', selectedSupplier);
  }
  CurrencyCode(CurrencyCode: any) {
    throw new Error('Method not implemented.');
  }
  calculateDiscAmt = (rowData: any) => {
    const qty = Number(rowData?.QUANTITY) || 0;

    // ✅ FIX: use RATE (same as your amount function)
    const price = Number(rowData?.RATE) || 0;

    const amount = qty * price;
    const discPerc = Number(rowData?.DISC_PERCENT) || 0;

    return (amount * discPerc) / 100;
  };
  calculateDiscountAmount = (rowData: any) => {
    const qty = Number(rowData?.QUANTITY) || 0;
    const price = Number(rowData?.RATE) || 0;

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
  // calculateGstAmount = (row: any) => {
  //   const amt = this.calculateAmount(row);

  //   const igst = parseFloat(row.VAT_PERC) || 0; // GST column = GST
  //   const cgst = parseFloat(row.CGST) || 0;
  //   const sgst = parseFloat(row.SGST) || 0;

  //   let totalGstPercent = 0;

  //   // GST case
  //   if (igst > 0) {
  //     totalGstPercent = igst;
  //   }
  //   // CGST + SGST case
  //   else {
  //     totalGstPercent = cgst + sgst;
  //   }

  //   return amt * (totalGstPercent / 100);
  // };

  calculateTotal = (row: any) => {
    const amt = this.calculateDiscountAmount(row);
    const gst = this.calculateGstAmount(row);
    return amt + gst;
  };

  validateQuantity = (e: any) => {
    const quantity = e.value;
    const pendingQty = e.data?.PENDING_QTY ?? 0;
    return quantity <= pendingQty;
  };

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'QUANTITY' ||
      e.dataField === 'VAT_PERC' ||
      e.dataField === 'STORE_ID' ||
      e.dataField === 'DEPT_ID'
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
    if (e.parentType === 'dataRow') {
      if (e.dataField === 'QUANTITY' || e.dataField === 'VAT_PERC') {
        e.editorOptions.readOnly = false;
        e.editorOptions.disabled = false;
      }
    }
    if (e.dataField === 'SUPP_PRICE') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r: any) => r?.data === e.row?.data,
          );
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'VAT_AMOUNT'));
          }, 50);
        }
      };
    }
  }

  openPendingGrnPopup() {
    this.getPendingGRNList();
    this.isTrOutPopupVisible = true;
  }

  // calculateAmount = (row: any) => {
  //   return (parseFloat(row.RATE) || 0) * (parseFloat(row.QUANTITY) || 0);
  // };

  calculateAmount = (row: any) => {
    const qty = Number(row?.QUANTITY) || 0;

    // using RATE
    const rate = Number(row?.RATE) || 0;

    const amount = qty * rate;

    const discPerc = Number(row?.DISC_PERCENT) || 0;
    const discAmt = (amount * discPerc) / 100;

    return amount - discAmt;
  };

  applyGstLogic(row: any) {
    const company = this.companyState?.trim().toLowerCase();
    const supplier =
      this.purchaseInvoiceFormData?.SUPP_STATE_NAME?.trim().toLowerCase();

    const sessionGst = parseFloat(this.GST) || 0;

    if (company === supplier) {
      // SAME STATE → CGST + SGST
      const half = sessionGst / 2;

      row.CGST = half;
      row.SGST = half;
      row.VAT_PERC = 0;
      row.VAT_PERC = sessionGst;
    } else {
      // DIFFERENT STATE → IGST
      row.VAT_PERC = sessionGst;
      row.CGST = 0;
      row.SGST = 0;
      row.VAT_PERC = sessionGst;
    }

    return row;
  }
  isGRNAlreadySelected = (rowData: any) => {
    return this.mainGridData?.some(
      (item) => item.GRN_DET_ID === rowData.GRN_DET_ID,
    );
  };

  onPopupSelectionChanged(e: any) {
    const selectedRows = e.selectedRowsData;

    const validSelection = selectedRows.filter(
      (row: any) => !this.isGRNAlreadySelected(row),
    );

    // If some already selected → remove them
    if (validSelection.length !== selectedRows.length) {
      this.popupGridRef.instance.deselectAll();

      validSelection.forEach((row: any) => {
        this.popupGridRef.instance.selectRows([row], true);
      });

      notify(
        'Some GRNs are already added and cannot be selected again',
        'warning',
        2000,
      );
    }
  }
  onPopupRowPrepared(e: any) {
    if (e.rowType === 'data') {
      const alreadyAdded = this.isGRNAlreadySelected(e.data);

      if (alreadyAdded) {
        e.rowElement.style.opacity = '0.5';
        e.rowElement.style.pointerEvents = 'none'; // 🚫 disables click
      }
    }
  }
  onTransferSelectClick() {
    const selectedRows = this.popupGridRef.instance.getSelectedRowsData();
    const rowsToAdd = [];
    selectedRows.forEach((row) => {
      const exists = this.mainGridData.some(
        (item) => item.GRN_DET_ID === row.GRN_DET_ID,
      );
      if (exists) return;

      const gstPerc = Number(row.GST_PERC) || 0;

      const companyState = this.companyState?.trim().toLowerCase();
      const supplierState =
        this.purchaseInvoiceFormData?.SUPP_STATE_NAME?.trim().toLowerCase();

      // let igst = 0,
      //   cgst = 0,
      //   sgst = 0;

      // if (companyState === supplierState) {
      //   cgst = gstPerc / 2;
      //   sgst = gstPerc / 2;
      // } else {
      //   igst = gstPerc;
      // }

      const newRow: any = {
        GRN_ID: row.GRN_ID,
        GRN_DET_ID: row.GRN_DET_ID,
        ITEM_ID: row.ITEM_ID,
        ITEM_NAME: row.ITEM_NAME,
        UOM: row.UOM,
        GRN_NO: row.GRN_NO,
        GRN_DATE: row.GRN_DATE ? new Date(row.GRN_DATE) : null,
        RATE: row.RATE,
        PRICE: row.RATE,
        PENDING_QTY: row.PENDING_QTY,
        DISC_PERCENT: row.DISC_PERCENT,
        QUANTITY: 0,

        HSN_CODE: row.HSN_CODE,

        // ✅ GST FROM GRN
        // VAT_PERC: gstPerc,
        VAT_PERC: row.VAT_PERC,
        // CGST: cgst,
        // SGST: sgst,

        AMOUNT: 0,
        VAT_AMOUNT: 0,
        TOTAL_AMOUNT: 0,
      };

      this.mainGridData.push(newRow);
    });

    this.itemsGridRef.instance.refresh(true);
    this.logGridSummaries();
    this.isTrOutPopupVisible = false;
  }

  getPurchNo() {
    this.dataService.getPurchaseNo().subscribe((response: any) => {
      console.log(response.PURCHASE_NO, 'PURCHASENOOOOOOOOOOOOOOOOOOOO');
      this.purchaseNo = response.PURCHASE_NO;
    });
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
    let isValid = true;

    this.mainGridData = this.mainGridData.map((row: any, index: number) => {
      let isInvalid = false;

      if (!row.QUANTITY || row.QUANTITY <= 0) {
        notify(
          // `Row ${index + 1}: Quantity must be greater than 0`,
          'Please enter valid quantity for highlighted rows.',
          'warning',
          3000,
        );
        isInvalid = true;
        isValid = false;
      }

      if (row.QUANTITY > row.PENDING_QTY) {
        isInvalid = true;
        isValid = false;
      }

      return {
        ...row,
        isInvalid: isInvalid, // 🔥 new object reference
      };
    });

    this.itemsGridRef.instance.refresh(); // 🔥 important

    if (!isValid) return;

    if (!isValid) {
      return; //  STOP saving
    }
    let grossAmount = 0;
    let vatAmount = 0;
    let netAmount = 0;
    let totalDiscountAmount = 0;
    // get selected values from grid
    this.itemsGridRef.instance.saveEditData();

    // const selectedStoreId = this.mainGridData[0]?.STORE_ID || null;
    const selectedDeptId = this.mainGridData[0]?.DEPT_ID || null;
    // this.purchaseInvoiceFormData.STORE_ID = selectedStoreId;
    this.purchaseInvoiceFormData.STORE_ID =
      this.purchaseInvoiceFormData.STORE_ID || this.store_id;
    this.purchaseInvoiceFormData.DEPT_ID = selectedDeptId;
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
          ID: this.purchaseInvoiceFormData.ID,
          COMPANY_ID: this.selectedCompany,
          USER_ID: this.user_id,
          FIN_ID: this.fin_id,
          // STORE_ID: selectedStoreId || 0,
          STORE_ID: this.purchaseInvoiceFormData.STORE_ID,
          DEPT_ID: selectedDeptId || 0,
          PURCH_ID: 0,
          GRN_DET_ID: item.GRN_DET_ID || '',
          ITEM_ID: item.ITEM_ID,
          PACKING: item.PACKING || '',
          QUANTITY: item.QUANTITY || '',
          RATE: item.RATE || '',
          AMOUNT: this.calculateTotal(item),
          RETURN_QTY: 0,
          ITEM_DESC: item.ITEM_DESC || '',
          PO_DET_ID: item.PO_DET_ID,
          UOM: item.UOM,
          // DISC_PERCENT: 0,
          COST: item.COST,
          SUPP_PRICE: item.RATE || 0,
          SUPP_AMOUNT: item.AMOUNT,
          VAT_PERC: item.VAT_PERC || 0,
          VAT_AMOUNT: this.calculateGstAmount(item),
          GRN_STORE_ID: this.purchaseInvoiceFormData.COMPANY_ID,
          RETURN_AMOUNT: 0,
          STORE_NAME: '',
          ITEM_NAME: '',
          ITEM_CODE: '',
          PENDING_QTY: 0,
          GRN_QUANTITY: 0,
          NARRATION: this.purchaseInvoiceFormData.NARRATION,
          DISC_PERCENT: item.DISC_PERCENT,
          DISC_AMT: this.calculateDiscAmt(item),
          // SGST: item.SGST,
          // CGST: item.CGST,
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

    const today = new Date();
    const invoiceDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');

    this.purchaseInvoiceFormData.PURCH_DATE = invoiceDate;
    this.purchaseInvoiceFormData.COMPANY_ID = this.selectedCompany;
    this.purchaseInvoiceFormData.USER_ID = this.user_id;
    // this.purchaseInvoiceFormData.STORE_ID = this.store_id;
    this.purchaseInvoiceFormData.FIN_ID = this.fin_id;

    if (this.purchaseInvoiceFormData.IS_APPROVED == true) {
      // Ask confirmation only if approving
      const result = confirm(
        'Are you sure you want to approve and commit this invoice?',
        'Confirm Approval',
      );
      result.then((dialogResult) => {
        if (dialogResult) {
          this.isSaving = true;
          this.submitInvoice(); // Call actual API logic
        } else {
          this.isSaving = false;
        }
      });
    } else {
      this.isSaving = true;
      this.submitInvoice(); // Direct for update
    }
  }

  // Separated logic to keep code clean
  submitInvoice() {
    console.log(this.status);

    let apiCall;

    // VERIFY CONFIRMATION
    if (this.isVerifyMode) {
      confirm(
        'Are you sure you want to verify this invoice?',
        'Confirm Verification',
      ).then((dialogResult) => {
        if (dialogResult) {
          apiCall = this.dataService.verifyPurchaseInvoice(
            this.purchaseInvoiceFormData,
          );

          this.handleApiResponse(apiCall, 'Invoice verified successfully');
        }
      });

      return;
    }

    // APPROVE CONFIRMATION
    else if (this.isApproveMode || this.isApproved) {
      confirm(
        'Are you sure you want to approve this invoice?',
        'Confirm Approval',
      ).then((dialogResult) => {
        if (dialogResult) {
          apiCall = this.dataService.approvePurchaseInvoice(
            this.purchaseInvoiceFormData,
          );

          this.handleApiResponse(apiCall, 'Invoice approved successfully');
        }
      });

      return;
    }

    // NORMAL UPDATE
    apiCall = this.dataService.updatePurchaseInvoice(
      this.purchaseInvoiceFormData,
    );

    this.handleApiResponse(apiCall, 'Invoice updated successfully');
  }

  handleApiResponse(apiCall: any, message: string) {
    apiCall.subscribe({
      next: (res: any) => {
        this.isSaving = false;

        notify(
          {
            message,
            position: { at: 'top right', my: 'top right' },
          },
          'success',
          3000,
        );

        this.popupClosed?.emit();
      },

      error: (err: any) => {
        this.isSaving = false;

        console.error('Operation failed', err);
      },
    });
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
      this.netAmount = Number(this.grandTotal).toFixed(2);
      this.onRoundOffChange();
      console.log('GROSS AMOUNT Summary:', this.totalAmount);
      console.log('VAT_AMOUNT Summary:', this.taxAmount);
      console.log('NET AMOUNT Summary:', this.grandTotal);
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

  onPopupClose() {
    const grid = this.popupGridRef?.instance;

    if (grid) {
      grid.clearFilter(); // ✅ clears filter row
      grid.clearSorting(); // optional
      grid.clearGrouping(); // optional
      grid.clearSelection(); // optional (if you want reset selection)
    }
  }

  openPDF() {
    this.isSaving = true;

    console.log('Open PDF clicked');
    const invId = this.purchaseInvoiceFormData.TRANS_ID;

    this.dataService.selectPurchaseInvoice(invId).subscribe({
      next: (res: any) => {
        this.selectedInvoice = res.Data;
        this.generatePDF(this.selectedInvoice);
        this.isSaving = false; // ✅ STOP loading
      },
      error: () => {
        this.isSaving = false; // ✅ STOP loading
        notify('Failed to generate PDF', 'error', 3000);
      },
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // if invalid, return original

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  generatePDF(data: any) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // ============================================================
    // 1) TOP HEADER (LOGO + RIGHT DETAILS)
    // ============================================================
    const headerY = 12;
    let y = 10;
    // LOGO BOX (SMALL)
    const logoX = 18;
    const logoY = headerY;
    const logoW = 30;
    const logoH = 30;

    doc.setFillColor(225, 225, 225);
    doc.rect(logoX, logoY, logoW, logoH, 'F');
    doc.setFontSize(11);
    // doc.addImage('../', 'PNG', logoX, logoY, logoW, logoH);
    doc.addImage(this.logoBase64, 'jpg', logoX, logoY, logoW, logoH);

    // doc.text('logo', logoX + logoW / 2, logoY + logoH / 2 + 3, {
    //   align: 'center',
    // });

    // ===============================================
    // SALES INVOICE HEADING (Centered between logo & reference block)
    // ===============================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);

    // compute a centered X between left logo and right reference area
    const leftEdge = 10 + logoW; // end of logo box
    const rightEdge = pageWidth - 80; // start of reference block
    const centerX = (leftEdge + rightEdge) / 2;

    doc.text('PURCHASE INVOICE', centerX, y + 25, { align: 'center' });

    // RIGHT-TOP DETAILS
    const rightX = pageWidth - 15;
    let ty = headerY + 4;

    const purchDate = (data.PURCH_DATE || '').split('T')[0];

    const headerLines = [
      `GST IN : ${data.GST_NO}`,
      `CIN :${data.CIN}`,
      `PAN:${data.PAN_NO}`,
      `e-Way Bill No. : ${this.formatDateDDMMMyyyy(purchDate)}`,
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    headerLines.forEach((txt) => {
      doc.text(txt, rightX, ty, { align: 'right' });
      ty += 6;
    });

    // LINE BELOW HEADER
    const lineY = logoY + logoH + 3;
    doc.setDrawColor(180);
    doc.line(15, lineY, pageWidth - 15, lineY);

    // ============================================================
    // 2) COMPANY BLOCK (LEFT BLUE BOX — DYNAMIC HEIGHT)
    // ============================================================
    const compBoxX = 15;
    const compBoxY = lineY + 3; // reduced spacing
    const compBoxW = 95;

    const companyLines = [
      data.COMPANY_NAME,
      data.ADDRESS1,
      data.ADDRESS2,
      data.ADDRESS3,
      `GSTIN/UIN : ${data.COMPANY_CODE}`,
      `State Name : ${data.SUPP_STATE_NAME}, Code : 32`,
      `Email : ${data.EMAIL}`,
    ];

    const lineHeight = 5;
    const topPadding = 8;
    const compBoxH = topPadding + companyLines.length * lineHeight + 4;

    // Draw Box
    doc.setFillColor(210, 230, 255);
    doc.rect(compBoxX, compBoxY, compBoxW, compBoxH, 'F');

    // Print text inside box
    let cy = compBoxY + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(data.COMPANY_NAME || '', compBoxX + 5, cy);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    companyLines.slice(1).forEach((line) => {
      cy += lineHeight;
      if (line.startsWith('Email')) doc.setTextColor(0, 0, 255);
      doc.text(line || '', compBoxX + 5, cy);
      doc.setTextColor(0, 0, 0);
    });
    // ============================================================
    // 3) DISPATCHED FROM (LEFT SIDE)
    // ============================================================

    let dispX = compBoxX; // same left alignment
    let dispY = compBoxY + compBoxH + 10; // positioned below company box

    let startX = 15;
    let startY = compBoxY + compBoxH + 25;
    let gap = 7; // space between lines

    // doc.setFont('helvetica', 'bold');
    // doc.setFontSize(11);
    // doc.text('Dispatched from', dispX, dispY);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    doc.text('Invoice Serial No:' + data.SUPP_INV_NO, startX, startY);

    doc.setFont('helvetica', 'normal');
    doc.text('Invoice Date:' + data.SUPP_INV_DATE, startX, startY + gap);
    doc.text(
      'Vehicle No: ' + (data.VEHICLE_NO || ''),
      startX,
      startY + gap * 2,
    );
    doc.text('Mode of Transport:', startX, startY + gap * 3);

    // doc.text('Dispatched From:', startX, startY + gap * 4);
    dispY += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    // const dispatchLines = [
    //   data.DISPATCH_ADDRESS1,
    //   data.DISPATCH_ADDRESS2,
    //   data.DISPATCH_ADDRESS3,
    //   `Pin: ${data.DISPATCH_PIN}`,
    // ];

    // // Print lines
    // dispatchLines.forEach(line => {
    //   if (line) {
    //     doc.text(line, dispX, dispY);
    //     dispY += 5;
    //   }
    // });

    // ============================================================
    // 3) CONSIGNEE (SHIP TO)
    // ============================================================
    let shipX = compBoxX + compBoxW + 15;
    let shipY = compBoxY + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Consignee (Ship to)', shipX, shipY);

    shipY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const shipLines = [
      data.SUPP_NAME,
      data.SUPP_ADDRESS1,
      data.SUPP_ADDRESS2,
      `${data.SUPP_CITY} - ${data.SUPP_ZIP}`,
      `GSTIN/UIN : ${data.SUPP_CODE}`,
      `State Name : ${data.SUPP_STATE_NAME}, Code : 32`,
    ];

    shipLines.forEach((l) => {
      doc.text(l || '', shipX, shipY);
      shipY += 5;
    });

    // ============================================================
    // 4) BUYER (BILL TO)
    // ============================================================
    let buyerX = shipX;
    let buyerY = compBoxY + compBoxH + 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Buyer (Bill to)', buyerX, buyerY);

    buyerY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const buyerLines = [...shipLines];

    buyerLines.forEach((l) => {
      doc.text(l || '', buyerX, buyerY);
      buyerY += 5;
    });

    // LINE BELOW BUYER BLOCK
    const tableLineY = buyerY + 40;
    // doc.setDrawColor(180);
    // doc.line(15, tableLineY, pageWidth - 15, tableLineY);

    // ============================================================
    // 5) TABLE — EXACT SAME WIDTH AS THE LINE (180mm)
    // ============================================================
    const tableStartY = tableLineY - 2;

    const companyState = this.companyState?.trim().toLowerCase();
    const supplierState =
      this.purchaseInvoiceFormData?.SUPP_STATE_NAME?.trim().toLowerCase();

    const sameState = companyState === supplierState;

    const rows = data.PurchDetails.map((item: any) => {
      const amount = this.calculateAmount(item);
      const gstAmount = this.calculateGstAmount(item);

      const common = [
        // item.TRANSFER_NO || "",
        this.formatDate(item.GRN_DATE) || '',
        item.ITEM_NAME || '',
        item.RATE.toFixed(2),
        item.GRN_QUANTITY.toFixed(2),
        item.QUANTITY.toFixed(2),
        amount.toFixed(2), // Amount
        gstAmount.toFixed(2), // GST Amount
        item.HSN_CODE || this.HSNCODE || '',
      ];

      if (sameState) {
        return [
          ...common,
          (item.CGST || 0).toFixed(2),
          (item.SGST || 0).toFixed(2),
          item.TOTAL_AMOUNT.toFixed(2),
        ];
      } else {
        return [
          ...common,
          (item.VAT_PERC || 0).toFixed(2), // IGST
          item.TOTAL_AMOUNT.toFixed(2),
        ];
      }
    });

    autoTable(doc, {
      startY: tableStartY,
      theme: 'grid',

      headStyles: {
        fillColor: [240, 240, 240],
        textColor: 0,
        fontSize: 8,
        halign: 'center',
      },

      bodyStyles: { fontSize: 8 },

      columnStyles: {
        // 0: { cellWidth: 10, halign: 'center' },  // TransferNo
        0: { cellWidth: 18, halign: 'center' }, // Date
        1: { cellWidth: 38 }, // Item Name
        2: { cellWidth: 13, halign: 'right' }, // Price
        3: { cellWidth: 14, halign: 'center' }, // Pending Qty
        4: { cellWidth: 13, halign: 'center' }, // Qty
        5: { cellWidth: 14, halign: 'right' }, // Amount
        6: { cellWidth: 14, halign: 'right' }, // GST Amount
        7: { cellWidth: 14, halign: 'center' }, // HSN
        8: { cellWidth: 13, halign: 'right' }, // CGST
        9: { cellWidth: 13, halign: 'right' }, // SGST
        10: { cellWidth: 18, halign: 'right' }, // Total Amount
      },

      head: [
        [
          // 'TransferNo.',
          'Date',
          'Item Name',
          'Price',
          'Pending Qty',
          'Qty',
          'Amount',
          'GST Amount',
          'HSN Code',
          'CGST',
          'SGST',
          'Total Amount',
        ],
      ],

      body: rows,

      foot: [
        [
          {
            content: 'Total',
            colSpan: 10,
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
    // 6) FOOTER – GST SUMMARY + RIGHT TOTAL (PERFECT ALIGNMENT)
    // ============================================================

    const footStartY = (doc as any).lastAutoTable.finalY + 15;

    // ---------------- LEFT GST SUMMARY TABLE ----------------
    let fx = 15;
    let fy = footStartY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    // SUPER CLOSE columns
    const gstCol = fx; // GST %
    const taxableCol = fx + 22; // closer
    const igstCol = fx + 50; // closer
    const totalCol = fx + 80; // closer

    // Integrated Tax is now subdivided
    const igstRateCol = fx + 50; // Rate
    const igstAmtCol = fx + 65; // Amount

    doc.text('GST %', gstCol, fy);
    doc.text('Taxable Value', taxableCol, fy);
    doc.text('Integrated Tax', igstRateCol, fy);
    doc.text('Total Tax Amount', totalCol, fy);

    // SUBHEADERS BELOW
    fy += 5;
    doc.setFontSize(8);
    doc.text('Rate', igstRateCol, fy);
    doc.text('Amount', igstAmtCol, fy);

    fy += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    // Calculate IGST = NET_AMOUNT * VAT_PERC / 100
    const vatPerc = data.PurchDetails[0]?.VAT_PERC || 0;
    const igstAmount = (data.NET_AMOUNT * vatPerc) / 100;

    // Row
    doc.text((data.PurchDetails[0].VAT_PERC || 0).toFixed(2) + '%', gstCol, fy);
    doc.text((data.NET_AMOUNT || 0).toFixed(2), taxableCol, fy);
    doc.text(
      (data.PurchDetails[0].VAT_PERC || 0).toFixed(2) + '%',
      igstCol,
      fy,
    );
    // Column width for AMOUNT column
    const amountColWidth = 20;

    // Center of the header column
    const amountCenterX = igstAmtCol + amountColWidth / 2;

    // Center-align IGST Amount under the "Amount" header
    doc.text(igstAmount.toFixed(2), amountCenterX, fy, { align: 'center' });

    // Center-align Total Tax Amount under its header
    doc.text((igstAmount || 0).toFixed(2), totalCol + amountColWidth / 2, fy, {
      align: 'center',
    });

    // Total row
    fy += 7;
    doc.setFont('helvetica', 'bold');
    doc.text((data.NET_AMOUNT || 0).toFixed(2), taxableCol, fy);
    doc.text(igstAmount.toFixed(2), amountCenterX, fy, { align: 'center' });
    doc.text((igstAmount || 0).toFixed(2), totalCol + amountColWidth / 2, fy, {
      align: 'center',
    });

    // // Line
    // fy += 4;
    // doc.line(15, fy, pageWidth - 15, fy);

    // ---------------- RIGHT TOTAL SUMMARY (PUSHED RIGHT) ----------------

    const netAmount = data.NET_AMOUNT || 0;
    const gstAmount = igstAmount || 0;

    // Get decimals
    const netDecimal = this.getDecimalPart(netAmount); // example -> .15
    const igstDecimal = this.getDecimalPart(gstAmount); // example -> .31

    // Add decimals
    const roundOffValue = (netDecimal + igstDecimal).toFixed(2);

    let rx = pageWidth - 60; // <-- moved right
    let ry = footStartY;

    const lblX = rx;
    const colonX = rx + 30;
    const valX = rx + 42;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    // Taxable Value 5%
    doc.text('Taxable Value', lblX, ry);
    doc.text(':', colonX, ry);
    doc.text((data.NET_AMOUNT || 0).toFixed(2), valX, ry);

    ry += 6;
    doc.text('Total Tax', lblX, ry);
    doc.text(':', colonX, ry);
    doc.text((igstAmount || 0).toFixed(2), valX, ry);

    ry += 6;
    doc.text('TCS', lblX, ry);
    doc.text(':', colonX, ry);
    doc.text((data.TCS || 0).toFixed(2), valX, ry);

    ry += 6;
    doc.text('Round Off', lblX, ry);
    doc.text(':', colonX, ry);
    doc.text(roundOffValue, valX, ry);

    const taxableValue = data.NET_AMOUNT || 0; // example: 100.12
    const totalTax = igstAmount || 0; // example: 100.10
    const fullInvoiceValue = taxableValue + totalTax;
    // round-off version
    const roundedInvoiceValue = Math.floor(fullInvoiceValue);

    ry += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Total', lblX, ry);
    doc.text(':', colonX, ry);
    if (data.ROUND_OFF === true) {
      doc.text(roundedInvoiceValue.toString(), valX, ry); // NO DECIMALS
    } else {
      doc.text(fullInvoiceValue.toFixed(2), valX, ry); // EXACT AMOUNT
    }

    // ---------------- AMOUNT IN WORDS ----------------
    let wordsY = ry + 15;

    // NEW LINE ABOVE AMOUNT IN WORDS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(
      'Whether the tax is payable on Reverse charge basis:No Amount of tax subject to reverse charge',
      15,
      wordsY,
    );

    wordsY += 7; // push next line slightly down

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Amount in words :', 15, wordsY);

    doc.setFont('helvetica', 'normal');
    doc.text(`INR ${this.numberToWords(data.NET_AMOUNT)}`, 60, wordsY);

    // ---------------- DECLARATION + REMARK + SIGNATURE ----------------
    let blockY = wordsY + 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Declaration :', 15, blockY);

    blockY += 10;
    doc.text(`Remark : ${data.NARRATION || ''}`, 15, blockY);

    // Company signature
    doc.setFont('helvetica', 'bold');
    doc.text(`For ${data.COMPANY_NAME}`, pageWidth - 95, blockY);

    // Signature labels
    let sigY = blockY + 25;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    doc.text('Authorised Signatory', pageWidth - 75, sigY);

    doc.output('dataurlnewwindow');
  }

  //========sum of decimal parts for roundoff===============
  getDecimalPart(num: number): number {
    const str = num.toFixed(2);
    const decimal = str.split('.')[1];
    return Number('0.' + decimal);
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

  cancel() {
    this.popupClosed?.emit();
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
  declarations: [EditPurchaseInvoiceComponent],
  exports: [EditPurchaseInvoiceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditPurchaseInvoiceModule {}
