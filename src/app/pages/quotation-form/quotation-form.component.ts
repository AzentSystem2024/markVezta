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
import { AddCreditNoteModule } from '../CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { EditCreditNoteModule } from '../CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
import { ViewCreditNoteModule } from '../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { TransferInInventoryFormComponent } from '../transfer-in-inventory-form/transfer-in-inventory-form.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import { AddInvoiceComponent } from '../INVOICE/add-invoice/add-invoice.component';
import CustomStore from 'devextreme/data/custom_store';
import notify from 'devextreme/ui/notify';
import { tap } from 'rxjs';
import { confirm } from 'devextreme/ui/dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-quotation-form',
  templateUrl: './quotation-form.component.html',
  styleUrls: ['./quotation-form.component.scss'],
})
export class QuotationFormComponent {
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() canApprove: boolean = false;
  @Input() isVerifyMode: boolean = false;
  @Input() isApproveMode: boolean = false;
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
  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',

    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',

    onClick: () => {
      this.ngZone.run(() => {
        this.addTermAndCondition();
      });
    },
    elementAttr: { class: 'add-button' },
  };
  barcodeList: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  // canApprove: any;
  matrix: any;
  storeFromSession: any;
  stores: any;
  reasons: any;
  newTerms: any[] = [];
  combinedTerms: any[] = [];
  quotationFormData: any = {
    COMPANY_ID: 0,
    STORE_ID: 0,
    QTN_DATE: new Date(),
    ORIGIN_STORE_ID: 0,
    ISSUE_ID: 0,
    NET_AMOUNT: 0,
    FIN_ID: 0,
    USER_ID: 0,
    NARRATION: '',
    QTN_NO: 0,
    CUST_ID: 0,
    SALESMAN_ID: 0,
    CONTACT_NAME: '',
    SUBJECT: '',
    REF_NO: '',
    PAY_TERM_ID: 0,
    DELIVERY_TERM_ID: 0,
    VALID_DAYS: 0,
    GROSS_AMOUNT: 0,
    TAX_AMOUNT: 0,
    CHARGE_DESCRIPTION: '',
    CHARGE_AMOUNT: 0,
    DISCOUNT_DESCRIPTION: '',
    DISCOUNT_AMOUNT: 0,
    ROUND_OFF: false,
    TRANS_ID: 0,
    TERMS: [],
    Details: [],
  };
  userID: any;
  finID: any;
  companyID: any;
  selectedStoreId: any;
  sessionData: any;
  selected_vat_id: any;
  salesman: any;
  itemLookupStore: any;
  selectedTab = 0;
  itemsS: any;
  customer: any;
  terms: any;
  paymentTerms: any;
  deliveryTerms: any;
  quotationHistory: any;
  popupVisible = false;
  isRoundOff: any;
  termsAndConditions: any;
  matrixCode: any;
  taxSummaryLabel: string;
  savedTerms: any;
  manualAdd: boolean;
  selectedCustomerId: any;
  isSaving = false;
  itemDataCache: Map<string, any[]> = new Map();
  storeId: any;

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    this.matrixCode = menuResponse.GeneralSettings.ENABLE_MATRIX_CODE;

    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;

    console.log(
      this.companyID,
      menuResponse,
      'COMPANYIDDDDDDDDDDDDDDDDDDDDDDDDDDD',
    );

    const menuGroups = menuResponse.MenuGroups || [];
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === '/quotation');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);

    // Session + dropdowns
    this.sessionData_tax();
    this.getSalesmanDropdown();
    this.getCustomerDropdown();
    this.getPymentTermsDropdown();
    this.getDeliveryTermsDropdown();
    this.getTermsAndConditionsList();
    this.getStoreDropdown();

    // 🔥 IMPORTANT FIX FOR EDIT MODE
    if (this.isEditing && this.EditingResponseData?.STORE_ID) {
      this.storeId = this.EditingResponseData.STORE_ID;
    }

    // Fetch quotation number only in add mode
    if (!this.isEditing) {
      this.getQuotationNo();
    }

    // // SAFE CALL: getItems() may return undefined
    // const items$ = this.getItems();
    // if (items$) {
    //   items$.subscribe(() => {
    //     this.isEditDataAvailable();
    //   });
    // } else {
    //   // fallback when items are already cached or storeId missing
    //   this.isEditDataAvailable();
    // }

    this.getItems()?.subscribe();

    // Immediately load edit data
    this.isEditDataAvailable();

    this.setTaxSummaryLabel();
  }

  calculateSerialNumber = (rowData: any) => {
    return this.quotationFormData.Details.indexOf(rowData) + 1;
  };

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    const data = this.EditingResponseData;
    console.log(data, 'DATAINQUOTATION');
    this.combinedTerms = data.TERMS;

    // Map ITEM_NAME → DESCRIPTION for DevExtreme grid binding
    const mappedDetails = data.Details
      ? data.Details.map((item: any) => ({
          ...item,
          DESCRIPTION: item.ITEM_ID,
          ITEM_CODE: item.ITEM_ID,
          ITEM_ID: item.ITEM_ID,
          STOCK_QTY: item.QUANTITY,
          CUST_ID: data.CUST_ID || 0,
        }))
      : [];

    this.quotationFormData = {
      ID: data.ID || 0,
      COMPANY_ID: data.COMPANY_ID || 0,
      STORE_ID: data.STORE_ID || 0,
      QTN_DATE: data.QTN_DATE ? new Date(data.QTN_DATE) : new Date(),
      ORIGIN_STORE_ID: data.ORIGIN_STORE_ID || 0,
      ISSUE_ID: data.ISSUE_ID || 0,
      NET_AMOUNT: data.NET_AMOUNT || 0,
      FIN_ID: data.FIN_ID || 0,
      USER_ID: data.USER_ID || 0,
      NARRATION: data.NARRATION || '',
      QTN_NO: data.QTN_NO || 0,
      CUST_ID: data.CUST_ID || 0, // <-- will bind to dx-select-box
      SALESMAN_ID: data.SALESMAN_ID || 0,
      CONTACT_NAME: data.CONTACT_NAME || '',
      SUBJECT: data.SUBJECT || '',
      REF_NO: data.REF_NO || 0,
      PAY_TERM_ID: data.PAY_TERM_ID || 0,
      DELIVERY_TERM_ID: data.DELIVERY_TERM_ID || 0,
      VALID_DAYS: data.VALID_DAYS || 0,
      GROSS_AMOUNT: data.GROSS_AMOUNT || 0,
      TAX_AMOUNT: data.TAX_AMOUNT || 0,
      CHARGE_DESCRIPTION: data.CHARGE_DESCRIPTION || '',
      CHARGE_AMOUNT: data.CHARGE_AMOUNT || 0,
      DISCOUNT_DESCRIPTION: data.DISCOUNT_DESCRIPTION || '',
      DISCOUNT_AMOUNT: data.DISCOUNT_AMOUNT || 0,
      ROUND_OFF: data.ROUND_OFF || false,
      TRANS_ID: data.TRANS_ID || 0,
      TERMS: Array.isArray(data.TERMS)
        ? data.TERMS.map((t: any) => (typeof t === 'string' ? { TERMS: t } : t))
        : [],
      Details: mappedDetails,
    };

    if (data.CUST_ID && data.CUST_NAME) {
      const exists = this.customer.some((c: any) => c.ID === data.CUST_ID);
      if (!exists) {
        this.customer.push({
          ID: data.CUST_ID,
          DESCRIPTION: data.CUST_NAME,
        });
      }
    }
    this.reindexDetails();
  }

  getStoreDropdown() {
    const payload = {
      COMPANY_ID: this.companyID,
      NAME: 'STORE',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.stores = response;
      // .filter(
      //   (store: any) => store.ID !== this.storeFromSession,
      // );
    });
  }

  onStoreChanged(event: any) {
    this.storeId = event.value;
    console.log(this.storeId, 'STORE_ID');

    // Clear old items when store changes
    this.items = [];

    // Call API
    this.getItems()?.subscribe();
  }

  private reindexDetails() {
    this.quotationFormData.DETAILS.forEach((row: any, index: number) => {
      row.SL_NO = index + 1;
    });
  }
  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  ngAfterViewInit(): void {
    if (this.isEditing) return; // skip adding row in edit mode

    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (
            this.itemsGridRef?.instance &&
            (!this.quotationFormData.Details ||
              this.quotationFormData.Details.length === 0)
          ) {
            this.itemsGridRef.instance.addRow();
            setTimeout(() => {
              this.itemsGridRef?.instance?.editCell(0, 'SL_NO');
            }, 100);
          }
        });
      });
    }, 500);
  }

  addNewRow() {
    this.manualAdd = true; // mark manual insertion

    const newRow = {
      SL_NO: this.quotationFormData.Details.length + 1,
      ID: 0,
      QTN_ID: 0,
      ITEM_ID: 0,
      UOM: '',
      QUANTITY: 0,
      PRICE: 0,
      DISC_PERCENT: 0,
      AMOUNT: 0,
      TAX_PERCENT: 0,
      TAX_AMOUNT: 0,
      TOTAL_AMOUNT: 0,
      REMARKS: '',
    };

    this.quotationFormData.Details.push(newRow);
    this.quotationFormData.Details = [...this.quotationFormData.Details];

    this.manualAdd = false; // reset flag
  }

  rowDraggingOptions = {
    allowReordering: true,
    showDragIcons: true,
    onReorder: (e: any) => this.onRowReorder(e),
  };

  onRowReorder(e: any) {
    const dataSource = this.combinedTerms; // ← the actual bound array
    const visibleRows = e.component.getVisibleRows();
    // Get actual indexes in data source
    const fromData = e.itemData;
    const fromIndex = dataSource.findIndex((item) => item === fromData);
    // If paging or filtering is enabled, toIndex refers to visible rows
    const toRowData = visibleRows[e.toIndex]?.data;
    const toIndex = dataSource.findIndex((item) => item === toRowData);
    if (fromIndex === -1 || toIndex === -1) return;

    // Reorder
    dataSource.splice(fromIndex, 1);
    dataSource.splice(toIndex, 0, fromData);

    // Rebind array so grid updates
    this.combinedTerms = [...dataSource];
  }

  addTermAndCondition() {
    const newTerm = { TERMS: '' };
    this.newTerms.push(newTerm);
    this.updateCombinedTerms();

    const lastIndex = this.combinedTerms.length - 1;
    this.dataGrid.instance.editCell(lastIndex, 'TERMS');
  }

  getTermsAndConditionsList() {
    this.dataService.getTermsAndConditions().subscribe((response: any) => {
      this.termsAndConditions = response.Data;
      this.savedTerms = this.quotationFormData?.TERMS || [];
      this.updateCombinedTerms();
    });
  }
  updateCombinedTerms() {
    const normalizedMasterTerms = (this.termsAndConditions || []).map(
      (t: any) => (typeof t === 'string' ? { TERMS: t } : t),
    );

    const normalizedNewTerms = (this.newTerms || []).map((t: any) =>
      typeof t === 'string' ? { TERMS: t } : t,
    );

    // Merge without duplication by TERM content
    const termSet = new Set<string>();
    this.combinedTerms = [];

    [
      ...this.savedTerms,
      ...normalizedMasterTerms,
      ...normalizedNewTerms,
    ].forEach((t) => {
      const termValue = (t.TERMS || '').trim();
      if (!termSet.has(termValue)) {
        termSet.add(termValue);
        this.combinedTerms.push(t);
      }
    });

    console.log(this.combinedTerms, 'combinedTerms fixed');
  }

  getSalesmanDropdown() {
    console.log('salesmannnnnnnnnnnnnnnnnnnnnnnnnnnnnn');
    const payload = {
      COMPANY_ID: this.companyID,
      NAME: 'SALESMAN',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.salesman = response;
    });
  }

  getCustomerDropdown() {
    const payload = {
      COMPANY_ID: this.companyID,
      NAME: 'CUSTOMER',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.customer = response;
    });
  }

  customerChanged(event: any) {
    this.selectedCustomerId = event.value;
    this.getCustomerDetails();
  }

  getCustomerDetails() {
    if (!this.selectedCustomerId) return;
    const payload = { CUST_ID: this.selectedCustomerId };

    this.dataService.getCustomerDetailDeliveryNote(payload).subscribe({
      next: (response: any) => {
        if (response && response.Flag === 1 && response.Data?.length) {
          const details = response.Data[0];

          // Bind API data into your form object
          this.quotationFormData.CONTACT_NAME = details.CONTACT_NAME;
          this.quotationFormData.CONTACT_FAX = details.CONTACT_FAX;
          this.quotationFormData.CONTACT_PHONE = details.CONTACT_PHONE;
          this.quotationFormData.CONTACT_MOBILE = details.CONTACT_MOBILE;
          this.quotationFormData.CONTACT_EMAIL = details.CONTACT_EMAIL;
        }
      },
      error: (err) => console.error('API error:', err),
    });
  }

  getPymentTermsDropdown() {
    const payload = {
      COMPANY_ID: this.companyID,
      NAME: 'PAYMENTTERMS',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.paymentTerms = response;
    });
  }

  getDeliveryTermsDropdown() {
    const payload = {
      COMPANY_ID: this.companyID,
      NAME: 'DELIVERYTERMS',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.deliveryTerms = response;
    });
  }

  getItems() {
    const STORE_ID = this.storeId;
    if (!STORE_ID) {
      // notify('Please select a Store first', 'warning', 3000);
      return;
    }

    const cacheKey = `${STORE_ID}`;

    // Return from cache
    if (this.itemDataCache.has(cacheKey)) {
      this.items = [...this.itemDataCache.get(cacheKey)];
      return;
    }

    const payload = { STORE_ID, CUSTOMER_ID: this.quotationFormData.CUST_ID };

    return this.dataService.getItemsForQuotation(payload).pipe(
      tap((response: any) => {
        this.items = (response.Data || []).slice(0, 200);
        this.itemDataCache.set(cacheKey, [...this.items]);
      }),
    );
  }

  onEditorPreparing(e: any) {
    if (e.parentType !== 'dataRow') return;

    const isLookup =
      e.dataField === 'ITEM_CODE' || e.dataField === 'DESCRIPTION';

    if (
      e.dataField === 'ITEM_CODE' ||
      e.dataField === 'DESCRIPTION' ||
      e.dataField === 'STOCK_QTY' ||
      e.dataField === 'DISC_PERCENT' ||
      e.dataField === 'PRICE' ||
      e.dataField === 'UOM' ||
      e.dataField === 'TAX_PERCENT' ||
      e.dataField === 'AMOUNT' ||
      e.dataField === 'TAX_AMOUNT' ||
      e.dataField === 'REMARKS'
    ) {
      e.editorOptions = e.editorOptions || {};

      //  your existing styles (UNCHANGED)
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

      // ADD ONLY THIS BLOCK
      if (isLookup) {
        e.editorOptions.elementAttr = {
          style: `
          height: 100%;
          margin: 0;
          padding: 0;
        `,
        };
      }
    }
    if (isLookup) {
      e.editorOptions.onOpened = () => {
        if (!this.storeId) {
          notify('Please select a Store first', 'warning', 3000);

          // Close dropdown immediately
          setTimeout(() => {
            e.component.closeEditCell();
          }, 0);
        }
      };

      e.editorOptions.onFocusIn = () => {
        if (!this.storeId) {
          notify('Please select a Store first', 'warning', 3000);
          e.component.closeEditCell();
        }
      };
    }
    if (
      e.dataField === 'ITEM_CODE' ||
      e.dataField === 'DESCRIPTION' ||
      e.dataField === 'DISC_PERCENT'
    ) {
      e.editorOptions.onValueChanged = (args: any) => {
        const rowData = e.row.data;

        if (e.dataField === 'ITEM_CODE' || e.dataField === 'DESCRIPTION') {
          const selectedItem = this.items.find(
            (item) => item.ITEM_ID === args.value,
          );

          if (selectedItem) {
            const grid = e.component;
            const rowIndex = e.row.rowIndex;

            grid.cellValue(rowIndex, 'ITEM_ID', selectedItem.ITEM_ID);
            grid.cellValue(rowIndex, 'ITEM_CODE', selectedItem.ITEM_ID);
            grid.cellValue(rowIndex, 'DESCRIPTION', selectedItem.ITEM_ID);
            // grid.cellValue(
            //   rowIndex,
            //   'STOCK_QTY',
            //   Number(selectedItem.STOCK_QTY || 0),
            // );
            grid.cellValue(rowIndex, 'UOM', selectedItem.UOM);
            grid.cellValue(
              rowIndex,
              'TAX_PERCENT',
              Number(selectedItem.VAT_PERC || 0),
            );
            grid.cellValue(rowIndex, 'MATRIX_CODE', selectedItem.MATRIX_CODE);
            grid.cellValue(rowIndex, 'PRICE', Number(selectedItem.COST || 0));
          }
        }

        if (e.dataField === 'DISC_PERCENT') {
          const grid = e.component;
          const rowIndex = e.row.rowIndex;

          grid.cellValue(rowIndex, 'DISC_PERCENT', Number(args.value || 0));
        }

        e.component.saveEditData();
      };
    }
  }

  onTermsEditorPreparing(e: any) {
    if (e.dataField === 'TERMS') {
      e.editorOptions = e.editorOptions || {};

      //  your existing styles (UNCHANGED)
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
    }
  }

  onInfoClick = (e: any) => {
    const rowData = e.row?.data;
    const itemId = rowData.ITEM_ID;

    this.dataService.getHistoryQuotation(itemId).subscribe((response: any) => {
      this.quotationHistory = Array.isArray(response)
        ? response
        : response.Data || [];
      console.log(this.quotationHistory, 'QUOTATIONHISTORY');
      this.popupVisible = true;

      this.cdr.detectChanges(); // force Angular to update view immediately
    });
  };

  getQuotationNo() {
    const payload = {
      TRANS_TYPE: 10,
      COMPANY_ID: this.companyID,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.quotationFormData.QTN_NO = response.DOC_NO;
      console.log(response.DOC_NO, 'DOCNOOOOOOOOO');
    });
  }

  calculateGrossAmount = (rowData: any) => {
    const qty = Number(rowData.STOCK_QTY) || 0;
    const price = Number(rowData.PRICE) || 0;
    return qty * price;
  };

  // Calculate Amount after Discount
  calculateAmount = (rowData: any) => {
    const gross = this.calculateGrossAmount(rowData);
    const discountPercent = Number(rowData.DISC_PERCENT) || 0;
    if (discountPercent > 0) {
      const discountValue = (gross * discountPercent) / 100;
      return gross - discountValue;
    }

    return gross;
  };

  calculateVatAmount = (rowData: any) => {
    const amount = this.calculateAmount(rowData);
    const vatPercent = Number(rowData.TAX_PERCENT) || 0;

    return (amount * vatPercent) / 100;
  };

  calculateTotal = (rowData: any) => {
    const amount = this.calculateAmount(rowData);
    const taxAmount = this.calculateVatAmount(rowData);
    return amount + taxAmount;
  };

  // In your component.ts
  getVatOrGstText(): string {
    // Assuming sessionData is available
    return this.selected_vat_id === this.sessionData.VAT_ID &&
      this.sessionData.VAT_ID === 2
      ? 'VAT Amount'
      : 'GST Amount';
  }

  setTaxSummaryLabel() {
    this.taxSummaryLabel =
      (this.selected_vat_id === this.sessionData.VAT_ID &&
      this.sessionData.VAT_ID === 2
        ? 'VAT Amount'
        : 'VAT Amount') + ': {0}';
  }
  onGridReady(e: any) {
    setTimeout(() => {
      const total = e.component.getTotalSummaryValue('TOTAL_AMOUNT') || 0;
      const gross = e.component.getTotalSummaryValue('GROSS_AMOUNT') || 0;

      this.quotationFormData.NET_AMOUNT = total;
      this.quotationFormData.GROSS_AMOUNT = gross;
    }, 0);
  }

  onRoundOffChange(e: any) {
    if (this.isRoundOff) {
      // Round to nearest integer
      this.quotationFormData.NET_AMOUNT = Math.round(
        this.quotationFormData.NET_AMOUNT,
      );
    } else {
      // Reset to actual total from grid
      const total = this.dataGrid.instance.getTotalSummaryValue('TOTAL_AMOUNT');
      this.quotationFormData.NET_AMOUNT = total;
    }
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1).toString().padStart(2, '0');
    const day = '' + d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();

    return [year, month, day].join('-'); // "YYYY-MM-DD"
  }

  saveQuotation() {
    // 1. Validation
    if (!this.quotationFormData.CUST_ID) {
      notify('Please select a customer.', 'warning', 3000);
      return;
    }
    if (!this.quotationFormData.REF_NO) {
      notify('Please enter reference no.', 'warning', 3000);
      return;
    }
    if (!this.quotationFormData.STORE_ID) {
      notify('Please select a store', 'warning', 3000);
      return;
    }

    if (
      !this.quotationFormData.Details ||
      this.quotationFormData.Details.length === 0
    ) {
      notify('Please add at least one item to the quotation.', 'warning', 3000);
      return;
    }

    // 2. Filter out empty rows (no ITEM_ID or no QUANTITY)
    const validDetails = this.quotationFormData.Details.filter(
      (row: any) => row.ITEM_ID && (row.STOCK_QTY || row.QUANTITY),
    );

    if (validDetails.length === 0) {
      notify(
        'Please add at least one valid item to the quotation.',
        'warning',
        3000,
      );
      return;
    }

    this.quotationFormData.TERMS = this.combinedTerms.map((t: any) => ({
      ID: 0,
      QTN_ID: this.quotationFormData.ID || 0,
      TERMS: t.TERMS || '',
    }));

    // 3. Prepare payload with calculated amounts
    const payload = {
      ...this.quotationFormData, // spread header values first
      QTN_DATE: this.formatDate(this.quotationFormData.QTN_DATE),
      COMPANY_ID: this.companyID,
      STORE_ID: this.storeId,
      FIN_ID: this.finID,
      USER_ID: this.userID,
      ROUND_OFF: this.isRoundOff,
      Details: validDetails.map((row: any, index: number) => {
        const grossAmount = this.calculateGrossAmount(row);
        const amount = this.calculateAmount(row);
        const taxAmount = this.calculateVatAmount(row);
        const totalAmount = this.calculateTotal(row);

        return {
          SL_NO: index + 1,
          ITEM_ID: row.ITEM_ID,
          DESCRIPTION: row.DESCRIPTION || '',
          UOM: row.UOM || '',
          QUANTITY: row.STOCK_QTY || row.QUANTITY || 0,
          PRICE: row.PRICE || 0,
          DISC_PERCENT: row.DISC_PERCENT || 0,
          AMOUNT: amount,
          TAX_PERCENT: row.TAX_PERCENT || 0,
          TAX_AMOUNT: taxAmount,
          TOTAL_AMOUNT: totalAmount,
          REMARKS: row.REMARKS || '',
          CUST_ID: this.quotationFormData.CUST_ID || 0,
        };
      }),
    };

    if (this.isEditing && this.quotationFormData.ID) {
      payload.ID = this.quotationFormData.ID;
    }

    const proceedWithSave = () => {
      this.isSaving = true;
      const apiCall = this.isEditing
        ? this.isApproveMode || this.isApproved
          ? this.dataService.approveSalesQuotation(payload) // Approve API
          : this.isVerifyMode
            ? this.dataService.verifySalesQuotation(payload) // Verify API
            : this.dataService.updateSalesQuotation(payload) // Update API
        : this.dataService.insertSalesQuotation(payload); // Save API

      apiCall.subscribe(
        (response: any) => {
          if (response.Flag === '1') {
            this.isSaving = false;
            notify(
              response.Message || 'Quotation saved successfully',
              'success',
              2000,
            );
            this.popupClosed.emit();
            // this.getQuotationNo();
          } else {
            notify(
              response.Message || 'Failed to save quotation',
              'error',
              2000,
            );
          }
        },
        () => {
          this.isSaving = false; // ERROR → STOP LOADING
          notify('Something went wrong. Please try again.', 'error', 2000);
        },
      );
    };

    // Confirmation before approving
    // Confirmation before approving/verifying
    if (this.isEditing && (this.isApproveMode || this.isApproved)) {
      confirm(
        'Are you sure you want to approve this quotation?',
        'Confirm Approval',
      ).then((dialogResult) => {
        if (dialogResult) {
          proceedWithSave();
        }
      });
    } else if (this.isEditing && this.isVerifyMode) {
      confirm(
        'Are you sure you want to verify this quotation?',
        'Confirm Verify',
      ).then((dialogResult) => {
        if (dialogResult) {
          proceedWithSave();
        }
      });
    } else {
      proceedWithSave();
    }
  }

  cancel() {
    this.popupClosed.emit();
  }

  // printQuotation() {
  //   const data = this.quotationFormData;
  //   console.log(data);

  //   const formatDate = (dateStr: string) => {
  //     if (!dateStr) return '';
  //     const d = new Date(dateStr);
  //     const day = String(d.getDate()).padStart(2, '0');
  //     const month = String(d.getMonth() + 1).padStart(2, '0');
  //     const year = d.getFullYear();
  //     return `${day}-${month}-${year}`;
  //   };

  //   const qtnDate = formatDate(data.QTN_DATE);

  //   const customerName =
  //     this.customer.find((c) => c.ID === data.CUST_ID)?.DESCRIPTION || '';
  //   const salesmanName =
  //     this.salesman.find((s) => s.ID === data.SALESMAN_ID)?.DESCRIPTION || '';

  //   const paymentTerm =
  //     this.paymentTerms.find((pt) => pt.ID === data.PAY_TERM_ID)?.DESCRIPTION ||
  //     '';
  //   const deliveryTerm =
  //     this.deliveryTerms.find((dt) => dt.ID === data.DELIVERY_TERM_ID)
  //       ?.DESCRIPTION || '';

  //   const content = document.createElement('div');
  //   content.innerHTML = `
  //   <div style="font-family: Arial, sans-serif; font-size: 13px; margin: 20px;">
      
  //     <!-- COMPANY HEADER -->
  //     <div style="text-align: center; margin-bottom: 20px;">
  //       <h2 style="margin-top: 5px;">Quotation</h2>
  //     </div>

  //     <!-- HEADER INFO -->
  //     <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
  //       <div>
  //         <div><b>Date:</b> ${qtnDate}</div>
  //         <div><b>Quotation No:</b> ${data.QTN_NO}</div>
  //         <div><b>Customer:</b> ${customerName}</div>
  //         <div><b>Contact Name:</b> ${data.CONTACT_NAME}</div>
  //       </div>
  //       <div>
  //         <div><b>Reference No:</b> ${data.REF_NO}</div>
  //         <div><b>Salesman:</b> ${salesmanName}</div>
  //         <div><b>Subject:</b> ${data.SUBJECT}</div>
  //       </div>
  //     </div>

  //     <!-- GRID -->
  //     <div id="printGridWrapper"></div>

  //     <!-- FOOTER -->
  //     <div style="display: flex; justify-content: space-between; margin-top: 30px; border-top: 2px solid #000; padding-top: 10px;">
  //       <div style="width: 48%;">
  //         <p style="font-weight: bold; text-decoration: underline;">Terms and Conditions</p>
  //         <p><b>Payment:</b> ${paymentTerm}</p>
  //         <p><b>Delivery:</b> ${deliveryTerm}</p>
  //         <p><b>Validity:</b> ${data.VALID_DAYS}</p>
  //       </div>
  //       <div style="width: 48%; text-align: right;">
  //         <p><b>Net Amount:</b> ${data.NET_AMOUNT?.toFixed(2) || '0.00'}</p>
  //         <p><b>Remarks:</b> ${data.NARRATION || ''}</p>
  //       </div>
  //     </div>

  //     <!-- FOOTER NOTE -->
  //     <div style="margin-top: 50px; text-align: center; font-style: italic;">
  //       This quotation is valid for ${
  //         data.VALID_DAYS
  //       } days from the date of issue.
  //     </div>
  //   </div>
  // `;

  //   // Create grid HTML with styling
  //   const gridWrapper = document.createElement('div');
  //   gridWrapper.innerHTML = `
  //   <table border="1" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px;">
  //     <thead style="background-color: #f0f0f0;">
  //       <tr>
  //         <th>Sl No</th>
  //         <th>Item Code</th>
  //         <th>Description</th>
  //         <th>Matrix Code</th>
  //         <th>Remarks</th>
  //         <th>UOM</th>
  //         <th>Tax %</th>
  //         <th>Qty</th>
  //         <th>Price</th>
  //         <th>Gross Amount</th>
  //         <th>Discount%</th>
  //         <th>Amount</th>
  //         <th>Tax Amount</th>
  //         <th>Total</th>
  //       </tr>
  //     </thead>
  //     <tbody>
  //       ${data.Details.map(
  //         (item: any, index: number) => `
  //         <tr>
  //           <td style="text-align: center">${index + 1}</td>
  //           <td>${item.ITEM_CODE || ''}</td>
  //           <td>${item.DESCRIPTION || ''}</td>
  //           <td>${item.MATRIX_CODE || ''}</td>
  //           <td>${item.REMARKS || ''}</td>
  //           <td>${item.UOM || ''}</td>
  //           <td style="text-align: right">${item.TAX_PERCENT || ''}</td>
  //           <td style="text-align: right">${item.STOCK_QTY || ''}</td>
  //           <td style="text-align: right">${item.PRICE?.toFixed(2) || ''}</td>
  //           <td style="text-align: right">${
  //             item.GROSS_AMOUNT?.toFixed(2) || ''
  //           }</td>
  //           <td style="text-align: right">${
  //             item.DISC_PERCENT?.toFixed(2) || ''
  //           }</td>
  //           <td style="text-align: right">${item.AMOUNT?.toFixed(2) || ''}</td>
  //           <td style="text-align: right">${
  //             item.TAX_AMOUNT?.toFixed(2) || ''
  //           }</td>
  //           <td style="text-align: right">${
  //             item.TOTAL_AMOUNT?.toFixed(2) || ''
  //           }</td>
  //         </tr>
  //       `,
  //       ).join('')}
  //     </tbody>
  //   </table>
  // `;
  //   content.querySelector('#printGridWrapper')?.appendChild(gridWrapper);

  //   // -------------------------
  //   // ADD TERMS & CONDITIONS ARRAY BELOW
  //   if (data.TERMS && data.TERMS.length > 0) {
  //     const termsWrapper = document.createElement('div');
  //     termsWrapper.innerHTML = `
  //     <div style="margin-top: 30px;">
  //       <h3 style="border-top: 1px solid #000; padding-top: 5px;">Terms & Conditions</h3>
  //       <ol style="margin-left: 20px; font-size: 12px;">
  //         ${data.TERMS.map(
  //           (term: any, index: number) => `
  //           <li>${term.TERMS}</li>
  //         `,
  //         ).join('')}
  //       </ol>
  //     </div>
  //   `;
  //     content.appendChild(termsWrapper);
  //   }
  //   // -------------------------

  //   // Print window
  //   const printWindow = window.open(
  //     '',
  //     '_blank',
  //     'width=1200,height=900,scrollbars=yes',
  //   );
  //   if (printWindow) {
  //     printWindow.document.write(`
  //     <html>
  //       <head>
  //         <title>Quotation Print</title>
  //         <link rel="stylesheet" href="https://cdn3.devexpress.com/jslib/23.1.3/css/dx.light.css">
  //         <style>
  //           body { font-family: Arial, sans-serif; font-size: 13px; margin: 0; padding: 0; }
  //           table { width: 100%; border-collapse: collapse; }
  //           th, td { border: 1px solid #000; padding: 5px; }
  //           th { background-color: #f0f0f0; text-align: center; }
  //           td { padding: 4px; }
  //           .footer { font-size: 12px; }
  //           ol { padding-left: 20px; }
  //         </style>
  //       </head>
  //       <body>${content.innerHTML}</body>
  //     </html>
  //   `);
  //     printWindow.document.close();

  //     setTimeout(() => {
  //       printWindow.focus();
  //       printWindow.print();
  //     }, 500);
  //   }

  //   // Save PDF
  //   html2canvas(content).then((canvas) => {
  //     const imgData = canvas.toDataURL('image/png');
  //     const pdf = new jsPDF('p', 'mm', 'a4');
  //     const imgProps = pdf.getImageProperties(imgData);
  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  //     pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  //     pdf.save(`Quotation_${data.QTN_NO}.pdf`);
  //   });
  // }

  printQuotation() {
    console.log('Open PDF clicked');
    const returnId = this.EditingResponseData.ID;
    console.log(returnId)
    // Example:
    this.dataService
      .selectSalesQuotation(returnId)
      .subscribe((res: any) => {
        this.generatePDF(res);
      });
  }

   getBase64ImageFromURL(url: string): Promise<string> {
  return fetch(url)
    .then(res => res.blob())
    .then(blob => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    });
}

 async  generatePDF(data: any) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // ============================================================
  // 1) HEADER (LOGO + TITLE + RIGHT DETAILS)
  // ============================================================

  const headerY = 10;

  // --- Logo placeholder (replace with addImage if needed)
  const logoBase64 = await this.getBase64ImageFromURL('assets/images/image16.png');

  doc.addImage(logoBase64, 'PNG', 15, headerY, 30, 35);

  // --- Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SALES QUOTATION', pageWidth / 2, headerY + 25, {
    align: 'center',
  });

 // ======================================================
  // RIGHT HEADER DETAILS
  // ======================================================

  doc.setFontSize(10);

  doc.setFont('helvetica', 'normal');

  doc.text('Quotation No :', 135, 15);

doc.text(
  `${data.Data.QTN_NO}`,
  195,
  15,
  { align: 'right' }
);

  doc.text('Reference No :', 135, 22);

doc.text(
  `${data.Data.REF_NO}`,
  195,
  22,
  { align: 'right' }
);

doc.text('Date :', 135, 29);

doc.text(
  `${data.Data.QTN_DATE}`,
  195,
  29,
  { align: 'right' }
);


   // ======================================================
  // BUYER DETAILS
  // ======================================================

  doc.setFont('helvetica', 'bold');
  doc.text('Buyer Details', 12, 60);

  doc.setFont('helvetica', 'normal');

  doc.text('Store:', 12, 67);

// doc.text(
//   `${data.Data.ADDRESS1}`,
//   38,
//   67
// );

  doc.text('Salesman:', 12, 74);
  // doc.text(`${data.Data.PHONE}`, 38, 74);

  doc.text('Tel:', 12, 83);
  // doc.text(`${data.Data.GST_NO}`, 38, 83);

  
  // ======================================================
  // SELLER DETAILS
  // ======================================================

  doc.setFont('helvetica', 'bold');
  doc.text('Seller Details', 140, 60);

  doc.setFont('helvetica', 'normal');

  doc.text('Name:', 140, 67);

  const customerName = doc.splitTextToSize(data.Data.CUST_NAME, 35);
doc.text(customerName, 165, 67);

  doc.text('Contact Name:', 140, 80);
  doc.text(`${data.Data.CONTACT_NAME}`, 165, 80);

  doc.text('Tel:', 140, 87);
  // doc.text(`${data.Data.ZIP}`, 165, 83);


  // ======================================================
// QUOTATION INFO TABLE (Ship Method / Payment / Currency)
// ======================================================

autoTable(doc, {
  startY: 95,
  head: [[
    'Ship Method',
    'Payment Terms',
    'Currency',
    'Remark (If any)',
    'Validity'
  ]],
  body: [[
    data.Data.DELIVERY_TERM_NAME,
    data.Data.PAY_TERM_NAME,
    data.Data.CURRENCY || '',
    data.Data.NARRATION || '',
    `${data.Data.VALID_DAYS} days`
  ]],
  theme: 'grid',
  styles: {
    fontSize: 8,
    halign: 'center',
    valign: 'middle'
  },
  headStyles: {
    fillColor: [210, 225, 240],
    textColor: 0,
    fontStyle: 'bold'
  }
});


// ======================================================
// ITEM DETAILS TABLE
// ======================================================

const itemRows = data.Data.Details.map((item: any) => [
  item.ITEM_CODE,
  item.ITEM_NAME,
  item.UOM,
  item.QUANTITY,
  item.PRICE,
  item.AMOUNT,
  item.DISC_PERCENT,
  item.AMOUNT,
  item.TAX_PERCENT,
  item.TOTAL_AMOUNT
]);

autoTable(doc, {
  startY: (doc as any).lastAutoTable.finalY + 10,
  head: [[
    'Item Code',
    'Description',
    'UOM',
    'Qty',
    'Price',
    'Amount',
    'Disc(%)',
    'Taxable',
    'Tax(%)',
    'Total Price'
  ]],
  body: itemRows,
  foot: [[
    '',
    'TOTAL',
    '',
    data.Data.Details.reduce((sum: number, item: any) => sum + item.QUANTITY, 0),
    '',
    data.Data.GROSS_AMOUNT,
    '',
    '',
    '',
    data.Data.NET_AMOUNT
  ]],
  theme: 'grid',
  styles: {
    fontSize: 8,
    cellPadding: 2,
    halign: 'center'
  },
  headStyles: {
    fillColor: [210, 225, 240],
    textColor: 0,
    fontStyle: 'bold'
  },
  footStyles: {
    fontStyle: 'bold',
    fillColor: [255, 255, 255],
    textColor: 0
  }
});


// ======================================================
// AMOUNT IN WORDS
// ======================================================

const amountY = (doc as any).lastAutoTable.finalY + 10;

doc.setFont('helvetica', 'normal');
doc.setFontSize(10);

doc.text('Amount Chargeable (in words):', 60, amountY);

doc.setTextColor(0, 102, 204);
doc.text('AED Three Thousand One Hundred Thirty Five Only', 120, amountY);

doc.setTextColor(0);


  // ============================================================
  // 3) OPEN PDF
  // ============================================================

  doc.output('dataurlnewwindow');
}

  convertNumberToWords(num: number): string {
    if (num === 0) return 'Zero';

    const a = [
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

    const b = [
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

    const inWords = (n: number, suffix: string): string => {
      if (n === 0) return '';
      if (n < 20) return a[n] + ' ' + suffix + ' ';
      return b[Math.floor(n / 10)] + ' ' + a[n % 10] + ' ' + suffix + ' ';
    };

    let str = '';

    str += inWords(Math.floor(num / 10000000), 'Crore');
    str += inWords(Math.floor((num / 100000) % 100), 'Lakh');
    str += inWords(Math.floor((num / 1000) % 100), 'Thousand');
    str += inWords(Math.floor((num / 100) % 10), 'Hundred');

    if (num > 100 && num % 100 > 0) str += 'and ';

    str += inWords(num % 100, '');

    return str.trim();
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
    DxTabPanelModule,
    DxTabsModule,
  ],
  providers: [],
  declarations: [QuotationFormComponent],
  exports: [QuotationFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class QuotationFormModule {}
