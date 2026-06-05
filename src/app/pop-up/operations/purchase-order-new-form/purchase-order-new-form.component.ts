import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxFileUploaderModule,
  DxFormComponent,
  DxFormModule,
  DxListModule,
  DxPopupModule,
  DxProgressBarModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTabPanelModule,
  DxTabsModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridTypes,
} from 'devextreme-angular/ui/data-grid';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import CountryList from 'country-list-with-dial-code-and-flag';

@Component({
  selector: 'app-purchase-order-new-form',
  templateUrl: './purchase-order-new-form.component.html',
  styleUrls: ['./purchase-order-new-form.component.scss'],
})
export class PurchaseOrderNewFormComponent implements OnInit {
  @ViewChild('supplierItemsGrid') supplierItemsGrid: DxDataGridComponent;
  @Input() refreshPoNumber = false;
  @Output() netAmountChange = new EventEmitter<any>();
  @Output() netSupplierAmountChange = new EventEmitter<any>();
  @Output() netQuantityChange = new EventEmitter<number>();
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  @ViewChild(DxFormComponent) poForm!: DxFormComponent;

  poNo: number;
  poHistoryList: any;
  sessionData: any;
  selected_vat_id: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  storeOrLocation: any;
  menuResponse: any;

  isSupplierValid: boolean = true;
  isSupplierTouched: boolean = false;
  GST_PERC: any;
  HSN_CODE: any;
  maskRules = {
    X: /[0-9]/,
  };
  selected_Company_id: any;
  docNo: any;
  companyID: any;
  companyStateID: any;
  previousSupplierId: any;

  width = '97vw';
  height = '420px';
  tabs = [{ text: 'Header' }, { text: 'Detail' }];

  readonly allowedPageSizes: any = [10, 50, 100];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  supplierMail: any;

  currentDate: Date;
  showAddItemPopup = false;
  selectedItems = [];
  savedItems = [];
  totalQuantity: any;
  totalExcludingVAT: any;
  totalVATAmount: any;
  totalIncludingVAT: any;

  selectedTabIndex = 0;
  orientations: any = 'horizontal';
  stylingMode: any = 'primary';
  uploadedFiles: File[] = [];
  fileUrls: string[] = [];
  SupplierList: any;
  StoreList: any;
  deliveryTermsList: any;
  paymentTermsList: any;
  selectedSupplierId: number | null = null;
  // isSupplierValid: boolean = true;
  supplierItems: any;
  SupplierCurrency: any;
  SupplierCurrencyCode: any;
  SupplierCurrencySymbol: any;
  currencyExchangeRate: any;
  vatRule: any;
  employeeList: any;
  settingsData: any;
  localCurrencyId: any;
  localCurrencyCode: any;
  showLocalCurrencyColumn: any;
  purchaseOrders = [];
  allowEditing: boolean = true;
  needSummaryUpdate: boolean = false;
  expandedRowKey: any = null;
  supplierStateID: number;
  isInterState: boolean = false;

  poData: any = {
    ID: 0,
    COMPANY_ID: 0,
    USER_ID: 0,
    STORE_ID: 0,
    PO_NO: '',
    PO_DATE: new Date(),
    SUPP_ID: '',
    SUPP_CONTACT: '',
    SUPP_ADDRESS: '',
    SUPP_MOBILE: '',
    REF_NO: '',
    CURRENCY_ID: '',
    PAY_TERM_ID: 0,
    DELIVERY_TERM_ID: 0,
    DELIVERY_DATE: new Date(),
    NOTES: '',
    NARRATION: '',
    TAX_AMOUNT: 0,
    TAX_PERCENT: 0,
    GROSS_AMOUNT: '',
    NET_AMOUNT: '',
    SHIP_TO: '',
    PURPOSE: '',
    LOCATION: '',
    CONTACT_NAME: '',
    CONTACT_MOBILE: '',
    SUPP_GROSS_AMOUNT: '',
    SUPP_NET_AMOUNT: '',
    EXCHANGE_PRICE: '',
    ISSUED_EMP_ID: '0',
    IS_APPROVED: false,
    PoDetails: [],
  };
  newPoData = this.poData;

  countryCodes: any[] = [];
  isDropdownOpen: boolean = false;

  supplierCountryCode: string = '';
  shippingCountryCode: string = '';

  isCountryDropdownOpen: boolean = false;
  isShipCountryDropdownOpen: boolean = false;
  showHeaderFilter: true;
  showFilterRow = true;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  isFilterOpened: boolean = false;

  getNewPoData = () => ({ ...this.newPoData });
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, // global style
    onClick: () => this.toggleFilters(),
  };
  vatTitle: any;
  storeID: any;
  storeItems: any;
  isHQApp: any;
  filteredStoreList: { ID: any; DESCRIPTION: any }[];
  supplierCurrencySymbol: any;

  constructor(
    private service: DataService,
    private router: Router,
  ) {
    const settingsData = sessionStorage.getItem('settings');
    this.settingsData = settingsData ? JSON.parse(settingsData) : null;
  }

  ngOnInit() {
    this.selectedTabIndex = 0;

    this.getPoNumber();
    this.sessionDetails();
    this.getDocNo();
    const currentUrl = this.router.url;

    this.menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const userData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    console.log(
      this.menuResponse.GeneralSettings.SYMBOL,
      'GENERALSETTINGSSSSSSSSS',
    );
    this.vatTitle = this.menuResponse.GeneralSettings.VAT_TITLE;
    console.log(this.vatTitle, 'VATTITLEEEEEEEEEEEEEE');
    this.storeOrLocation = this.menuResponse.GeneralSettings.STORE_TITLE;
    this.storeID = this.menuResponse.Configuration[0].STORE_ID;
    const menuGroups = this.menuResponse.MenuGroups || [];
    this.isHQApp = userData.GeneralSettings.IS_HQ_APP;
    const configStore = userData.Configuration?.[0];
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
    this.currentDate = new Date();
    this.GetSupplierList();
    this.GetStoresList();
    // if (this.isHQApp && configStore) {
    //   this.filteredStoreList = [
    //     {
    //       ID: configStore.STORE_ID,
    //       DESCRIPTION: configStore.STORE_NAME,
    //     },
    //   ];

    //   // Auto select store
    //   this.newPoData.STORE_ID = configStore.STORE_ID;
    // } else {
    //   this.filteredStoreList = this.StoreList;
    // }
    this.GetDeliveryTermsList();
    this.GetPaymentTermsList();
    this.GetEmployeeList();
    // this.getPoHistoryList();
    this.getCountryCodeList();
    this.setDefaultCountryCode();
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.supplierItemsGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  getDocNo() {
    const payload = {
      TRANS_TYPE: 17,
      COMPANY_ID: this.selected_Company_id,
      SUB_TYPE_ID: 0,
    };
    this.service.getDocNo(payload).subscribe((response: any) => {
      this.docNo = response.DOC_NO;
    });
  }

  highlightEditableColumns(event: any) {
    if (event.rowType === 'data' && event.column.allowEditing) {
      // Apply a custom style for editable cells
      event.cellElement.style.backgroundColor = '#FFFFFF'; // Soft yellow background
      event.cellElement.style.color = '#000000ff'; // Dark yellow text
      // event.cellElement.style.fontWeight = 'bold';
    }
  }

  ngOnChanges() {
    if (this.refreshPoNumber) {
      this.getPoNumber();
    }
  }

  // Validate if supplier is selected
  validateSupplier() {
    //  Supplier actually changed
    if (
      this.previousSupplierId &&
      this.previousSupplierId !== this.newPoData.SUPP_ID
    ) {
      this.resetSupplierDependentData();
    }

    this.previousSupplierId = this.newPoData.SUPP_ID;
    this.getSupplierByid();
    // }
  }

  resetSupplierDependentData() {
    //  CLEAR GRID
    this.savedItems = [];
    this.poData.PoDetails = [];

    //  RESET TOTALS
    this.totalQuantity = 0;
    this.newPoData.GROSS_AMOUNT = 0;
    this.newPoData.TAX_AMOUNT = 0;
    this.newPoData.NET_AMOUNT = 0;
    this.newPoData.SUPP_GROSS_AMOUNT = 0;
    this.newPoData.SUPP_NET_AMOUNT = 0;

    //  RESET SUPPLIER-SPECIFIC FIELDS
    this.newPoData.SUPP_CONTACT = '';
    this.newPoData.SUPP_MOBILE = '';
    this.newPoData.SUPP_ADDRESS = '';
    this.supplierMail = '';

    this.SupplierCurrency = null;
    this.SupplierCurrencyCode = null;
    this.SupplierCurrencySymbol = null;
    this.currencyExchangeRate = null;
    this.vatRule = null;

    //  RESET GST MODE
    this.isInterState = false;

    // Refresh grid UI
    setTimeout(() => {
      this.itemsGridRef?.instance?.refresh();
    }, 0);
  }

  applyGstModeToItems() {
    this.savedItems.forEach((item) => {
      const itemGst = Number(item.GST_PERC || 0);

      // Always keep full GST in VAT_PERC
      item.VAT_PERC = itemGst;
      item.CGST = 0;
      item.SGST = 0;
    });

    setTimeout(() => {
      this.itemsGridRef?.instance?.refresh();
    }, 0);
  }

  // applyGstModeToItems() {
  //   this.savedItems.forEach((item) => {
  //     const itemGst = Number(item.GST_PERC || 0);
  //     const halfGst = +(itemGst / 2).toFixed(2);

  //     if (this.isInterState) {
  //       // IGST
  //       item.VAT_PERC = itemGst;
  //       item.CGST = 0;
  //       item.SGST = 0;
  //     } else {
  //       // CGST + SGST
  //       item.VAT_PERC = 0;
  //       item.CGST = halfGst;
  //       item.SGST = halfGst;
  //     }
  //   });

  //   setTimeout(() => {
  //     this.itemsGridRef?.instance?.refresh();
  //   }, 0);
  // }

  // Handler for Add Item button
  onAddItemClick() {
    if (!this.newPoData?.SUPP_ID) {
      notify('Please select a supplier before adding items.', 'warning', 2500);
      return; //  stop here
    }

    // Supplier selected → proceed
    this.showAddItemPopup = true;

    console.log(this.newPoData.SUPP_ID, 'selected supplier id');

    this.getSupplierByid();
  }

  getSupplierByid() {
    const payload = {
      SUPP_ID: this.newPoData.SUPP_ID,
      COMPANY_ID: this.companyID,
      STORE_ID: this.newPoData.STORE_ID,
    };

    this.service.getSupplierItemsData(payload).subscribe((res) => {
      this.supplierItems = res;
      const supplier = res[0];

      this.supplierStateID = supplier.STATE_ID;
      console.log(this.supplierStateID, 'STATEIDDDDDDDDDDDDDDD');

      //  Decide GST type
      this.isInterState = this.companyStateID !== this.supplierStateID;
      this.applyGstModeToItems();

      //  Refresh grid so columns + values update
      setTimeout(() => {
        this.itemsGridRef?.instance?.refresh();
      }, 0);

      console.log('GST MODE:', this.isInterState ? 'IGST' : 'CGST + SGST');

      // KEEPING ALL YOUR EXISTING CODE AS-IS
      this.newPoData.CURRENCY_ID = this.supplierItems[0].CURRENCY_ID;
      this.newPoData.SUPP_CONTACT = this.supplierItems[0].SUPP_NAME;

      this.newPoData.SUPP_ADDRESS = this.supplierItems[0].SUPP_ADDRESS;
      this.SupplierCurrency = this.supplierItems[0].CURRENCY_NAME;
      this.SupplierCurrencyCode = this.supplierItems[0].CURRENCY_CODE;
      this.SupplierCurrencySymbol = this.supplierItems[0].CURRENCY_SYMBOL;
      this.supplierMail = this.supplierItems[0].SUPPLIER_MAIL;

      this.newPoData.EXCHANGE_PRICE = this.supplierItems[0].EXCHANGE;
      this.vatRule = this.supplierItems[0].VAT_RULE_NAME;
      this.newPoData.SUPP_MOBILE = this.supplierItems[0].PHONE;
      this.showLocalCurrencyColumn =
        this.localCurrencyId !== this.newPoData.CURRENCY_ID;
      if (this.vatTitle === 'GST') {
        this.newPoData.SHIP_TO = this.supplierItems[0].COMPANY_ADDRESS;
        this.newPoData.CONTACT_NAME = this.supplierItems[0].COMPANY_CONTACT;
        this.newPoData.CONTACT_MOBILE = this.supplierItems[0].COMPANY_MOBILE;
      }
      const suppMobile = this.supplierItems[0].PHONE;
      console.log(this.SupplierCurrencySymbol, 'SUPPLIERCURRENCYSYMBOL');
      if (!suppMobile) return;

      // Extract country code and number
      const match = suppMobile.match(/^(\+?\d+)[-\s]?(\d+)$/);

      if (match) {
        let code = match[1];
        let number = match[2];

        // ensure + exists
        if (!code.startsWith('+')) {
          code = '+' + code;
        }

        this.supplierCountryCode = code;
        this.newPoData.SUPP_MOBILE = number;
      }

      // this.extractSupplierCountryCode();
      this.extractShippingCountryCode();

      console.log(this.supplierItems, 'supplier items');
    });
  }

  getCurrencySymbol(rowData: any) {
    this.supplierCurrencySymbol = rowData?.CURRENCY_SYMBOL || '';
  }

  getFormattedSupplierPrice = (rowData: any) => {
    this.SupplierCurrencySymbol = rowData?.CURRENCY_SYMBOL || '';
    const symbol = rowData?.CURRENCY_SYMBOL || '';
    const price = Number(rowData?.SUPP_PRICE || 0).toFixed(2);

    return symbol ? `${symbol} ${price}` : price;
  };

  formatTotalAmount = (data: any) => {
    const formattedValue = Number(data.value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return this.SupplierCurrencySymbol ===
      this.menuResponse?.GeneralSettings?.SYMBOL
      ? formattedValue
      : `${this.SupplierCurrencySymbol} ${formattedValue}`;
  };

  // formatTotalAmount = (data: any) => {
  //   return `${this.SupplierCurrencySymbol} ${Number(
  //     data.value || 0,
  //   ).toLocaleString('en-IN', {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   })}`;
  // };
  getStoreOrCompanyByid() {
    const payload = {
      // SUPP_ID: this.newPoData.SUPP_ID,
      // COMPANY_ID: this.companyID,
      STORE_ID: this.newPoData.STORE_ID,
    };

    this.service.getStoreData(payload).subscribe((res) => {
      this.storeItems = res;
      const supplier = res[0];

      this.supplierStateID = supplier.STATE_ID;
      console.log(this.supplierStateID, 'STATEIDDDDDDDDDDDDDDD');

      // ✅ Decide GST type
      this.isInterState = this.companyStateID !== this.supplierStateID;
      this.applyGstModeToItems();

      // 🔁 Refresh grid so columns + values update
      setTimeout(() => {
        this.itemsGridRef?.instance?.refresh();
      }, 0);

      console.log('GST MODE:', this.isInterState ? 'IGST' : 'CGST + SGST');

      // ⬇️ 🔒 KEEPING ALL YOUR EXISTING CODE AS-IS
      // this.newPoData.CURRENCY_ID = this.supplierItems[0].CURRENCY_ID;
      // this.newPoData.SUPP_CONTACT = this.supplierItems[0].SUPP_NAME;

      // this.newPoData.SUPP_ADDRESS = this.supplierItems[0].SUPP_ADDRESS;
      // this.SupplierCurrency = this.supplierItems[0].CURRENCY_NAME;
      // this.SupplierCurrencyCode = this.supplierItems[0].CURRENCY_CODE;
      // this.SupplierCurrencySymbol = this.supplierItems[0].CURRENCY_SYMBOL;
      // this.supplierMail = this.supplierItems[0].SUPPLIER_MAIL;

      // this.newPoData.EXCHANGE_PRICE = this.supplierItems[0].EXCHANGE;
      // this.vatRule = this.supplierItems[0].VAT_RULE_NAME;

      this.showLocalCurrencyColumn =
        this.localCurrencyId !== this.newPoData.CURRENCY_ID;
      this.newPoData.SHIP_TO = this.storeItems[0].ADDRESS1;
      this.newPoData.CONTACT_NAME = this.storeItems[0].STORE_NAME;
      this.newPoData.CONTACT_MOBILE = this.storeItems[0].PHONE;
      const storeMobile = this.storeItems[0].PHONE;

      if (!storeMobile) return;

      // Extract country code and number
      const match = storeMobile.match(/^(\+?\d+)[-\s]?(\d+)$/);

      if (match) {
        let code = match[1];
        let number = match[2];

        // ensure + exists
        if (!code.startsWith('+')) {
          code = '+' + code;
        }

        this.supplierCountryCode = code;
        this.newPoData.CONTACT_MOBILE = number;
      }

      // this.extractSupplierCountryCode();
      this.extractShippingCountryCode();

      console.log(this.supplierItems, 'supplier items');
    });
  }

  extractSupplierCountryCode() {
    if (!this.newPoData.SUPP_MOBILE) return;

    const parts = this.newPoData.SUPP_MOBILE.split('-');

    if (parts.length === 2) {
      this.supplierCountryCode = '+' + parts[0];
      this.newPoData.SUPP_MOBILE = parts[1];
    }
  }

  // extractShippingCountryCode() {
  //   if (!this.newPoData.CONTACT_MOBILE) return;

  //   const parts = this.newPoData.CONTACT_MOBILE.split('-');

  //   if (parts.length === 2) {
  //     this.shippingCountryCode = '+' + parts[0];

  //     //  ONLY number (same as SUPP_MOBILE)
  //     this.newPoData.CONTACT_MOBILE = parts[1];
  //     // this.shippingCountryCode = '+' + parts[0];
  //     // this.newPoData.CONTACT_MOBILE = parts[0] + '-' + parts[1];
  //   }
  // }

  extractShippingCountryCode() {
    if (!this.newPoData.CONTACT_MOBILE) return;

    const value = this.newPoData.CONTACT_MOBILE;

    const parts = value.split('-');

    if (parts.length === 2) {
      let code = parts[0];

      // ensure + exists (but don't duplicate)
      if (!code.startsWith('+')) {
        code = '+' + code;
      }

      this.shippingCountryCode = code;

      //  only number
      this.newPoData.CONTACT_MOBILE = parts[1];
    } else {
      //  No country code → default +91
      this.shippingCountryCode = '+971';
      this.newPoData.CONTACT_MOBILE = value;
    }
  }

  onTabClick(e: any) {
    this.selectedTabIndex = e.itemIndex;
    if (this.selectedTabIndex === 2) {
      this.getPoHistoryList();
    }
  }

  onFileUploaded(event: any) {
    // Handle successful upload response
    this.uploadedFiles.push(event.file);
  }

  onUploadError(event: any) {
    // Handle upload error
    console.error('File upload error:', event.error);
  }
  onSelectionChanged(event: any) {
    this.selectedItems = event.selectedRowsData;
  }

  saveSelectedData() {
    const newItems = this.selectedItems.map((item, index) => {
      const itemGst = Number(item.GST_PERC || item.VAT_PERC || 0);
      const suppPrice = Number(item.PURCH_PRICE || 0);

      return {
        ...item,
        slNo: this.savedItems.length + index + 1,
        SUPP_PRICE: suppPrice,
        PURCH_PRICE: suppPrice,
        HSN_CODE: item.HSN_CODE || item.HSNCODE || item.HSN || '',

        // store GST
        GST_PERC: itemGst,

        //  DO NOT SPLIT GST
        VAT_PERC: itemGst,
        CGST: 0,
        SGST: 0,

        qtyOrdered: 0,
        discountPercentage: 0,
        Amount: 0,
        taxable: 0,
        vatAmount: 0,
        total: 0,
      };
    });

    this.savedItems = [
      ...this.savedItems,
      ...newItems.filter(
        (n) => !this.savedItems.some((s) => s.ITEM_ID === n.ITEM_ID),
      ),
    ];

    this.itemsGridRef?.instance?.refresh();
    this.showAddItemPopup = false;
  }

  // saveSelectedData() {
  //   const newItems = this.selectedItems.map((item, index) => {
  //     // ✅ TAKE GST FROM ITEM
  //     const itemGst = Number(item.GST_PERC || item.VAT_PERC || 0);
  //     const halfGst = +(itemGst / 2).toFixed(2);
  //     const suppPrice = Number(item.PURCH_PRICE || 0);
  //     return {
  //       ...item,
  //       slNo: this.savedItems.length + index + 1,
  //       SUPP_PRICE: suppPrice,
  //       PURCH_PRICE: suppPrice,
  //       HSN_CODE: item.HSN_CODE || item.HSNCODE || item.HSN || '',

  //       // ✅ STORE ORIGINAL GST
  //       GST_PERC: itemGst,

  //       // ✅ DISTRIBUTE BASED ON STATE
  //       VAT_PERC: this.isInterState ? itemGst : 0,
  //       CGST: this.isInterState ? 0 : halfGst,
  //       SGST: this.isInterState ? 0 : halfGst,

  //       qtyOrdered: 0,
  //       discountPercentage: 0,
  //       Amount: 0,
  //       taxable: 0,
  //       vatAmount: 0,
  //       total: 0,
  //     };
  //   });

  //   this.savedItems = [
  //     ...this.savedItems,
  //     ...newItems.filter(
  //       (n) => !this.savedItems.some((s) => s.ITEM_ID === n.ITEM_ID),
  //     ),
  //   ];

  //   this.itemsGridRef?.instance?.refresh();
  //   this.showAddItemPopup = false;
  // }

  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.HSN_CODE = sessionData.GeneralSettings.HSN_CODE;
    this.companyID = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.companyStateID = sessionData.SELECTED_COMPANY.STATE_ID;
    this.GST_PERC = sessionData.GeneralSettings.GST_PERC;

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    // THIS IS THE MISSING LINK
    this.poData.COMPANY_ID = this.companyID;
    this.poData.USER_ID = sessionData.USER_ID;
  }

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }
  calculateTotalQuantity() {
    this.totalQuantity = this.savedItems.reduce(
      (sum, item) => sum + Number(item.qtyOrdered || 0),
      0,
    );
    this.netQuantityChange.emit(this.totalQuantity);
  }

  calculateTotalExcludingTax() {
    this.newPoData.GROSS_AMOUNT = this.savedItems
      .reduce((sum, item) => sum + Number(item.taxable || 0), 0)
      .toFixed(2);
    // this.newPoData.SUPP_GROSS_AMOUNT = this.savedItems
    //   .reduce((sum, item) => sum + Number(item.taxable_Supplier || 0), 0)
    //   .toFixed(2);
    this.newPoData.SUPP_GROSS_AMOUNT = this.newPoData.GROSS_AMOUNT;
    console.log('GROSS_AMOUNT:', this.newPoData.GROSS_AMOUNT);
  }

  calculateTotalVATAmount() {
    this.newPoData.TAX_AMOUNT = this.savedItems
      .reduce((sum, item) => sum + Number(item.vatAmount || 0), 0)
      .toFixed(2);
  }

  // Calculate Total Including VAT
  calculateTotalIncludingTax() {
    // Calculate the NET_AMOUNT by adding GROSS_AMOUNT and TAX_AMOUNT
    this.newPoData.NET_AMOUNT = (
      Number(this.newPoData.GROSS_AMOUNT) + Number(this.newPoData.TAX_AMOUNT)
    ).toFixed(2); // Returns "276.40" as a string

    // Set SUPP_NET_AMOUNT equal to SUPP_GROSS_AMOUNT
    // this.newPoData.SUPP_NET_AMOUNT = this.newPoData.SUPP_GROSS_AMOUNT;
    this.newPoData.SUPP_NET_AMOUNT = this.newPoData.NET_AMOUNT;

    // Determine the amount to emit based on currency comparison
    const amountToEmitInLocalCurrency = `${this.newPoData.NET_AMOUNT} ${this.localCurrencyCode}`;

    const amountToEmitInSupplierCurrency = `${this.newPoData.SUPP_NET_AMOUNT} ${this.SupplierCurrencySymbol}`;

    // Emit the formatted NET_AMOUNT with local or supplier currency symbol
    this.netAmountChange.emit(amountToEmitInLocalCurrency); // Emit NET_AMOUNT with the currency

    // Emit SUPP_NET_AMOUNT with the supplier currency symbol
    this.netSupplierAmountChange.emit(amountToEmitInSupplierCurrency); // Emit SUPP_NET_AMOUNT with the supplier currency symbol
  }

  onContentReady(e: any) {
    if (this.needSummaryUpdate) {
      // Refresh the grid to recalculate summary values
      e.component.refresh();
      this.needSummaryUpdate = false; // Reset the flag after refresh
    }
  }

  updateAmount(e: any) {
    const updatedRow = { ...e.key, ...e.data };

    const item = this.savedItems.find((i) => i.slNo === updatedRow.slNo);
    if (!item) return;

    const qtyOrdered = Number(updatedRow.qtyOrdered) || 0;

    /* ---------------- PRICE HANDLING ---------------- */

    if (updatedRow.SUPP_PRICE !== undefined && updatedRow.SUPP_PRICE !== null) {
      item.SUPP_PRICE = Number(updatedRow.SUPP_PRICE);

      if (this.SupplierCurrencyCode !== this.localCurrencyCode) {
        item.PURCH_PRICE = parseFloat(
          (item.SUPP_PRICE / this.newPoData.EXCHANGE_PRICE).toFixed(2),
        );
      } else {
        item.PURCH_PRICE = Number(updatedRow.PURCH_PRICE) || 0;
      }
    }

    if (qtyOrdered <= 0) {
      item.Amount = 0;
      item.discountAmount = 0;
      item.taxable = 0;
      item.vatAmount = 0;
      item.total = 0;
      return;
    }

    /* ---------------- AMOUNT ---------------- */

    item.Amount = parseFloat((qtyOrdered * item.SUPP_PRICE).toFixed(2));
    // item.SUPP_AMOUNT = item.Amount;

    /* ---------------- DISCOUNT ---------------- */

    const discPerc = Number(updatedRow.discountPercentage) || 0;
    item.discountAmount =
      discPerc > 0
        ? parseFloat((item.Amount * (discPerc / 100)).toFixed(2))
        : 0;

    /* ---------------- TAXABLE ---------------- */

    item.taxable = parseFloat((item.Amount - item.discountAmount).toFixed(2));
    console.log(item.taxable, 'TAXABLEEEEEEEEEEE');
    /* ---------------- GST / IGST ---------------- */
    item.SUPP_AMOUNT = item.taxable;
    const itemGst = Number(item.GST_PERC || 0);

    let totalTaxPerc = 0;

    item.VAT_PERC = itemGst;
    item.CGST = 0;
    item.SGST = 0;

    totalTaxPerc = itemGst;

    /* ---------------- VAT AMOUNT ---------------- */

    item.vatAmount = parseFloat(
      (item.taxable * (totalTaxPerc / 100)).toFixed(2),
    );

    /* ---------------- TOTAL ---------------- */

    item.total = parseFloat((item.taxable + item.vatAmount).toFixed(2));
    item.SUPP_AMOUNT = item.taxable;
    item.AMOUNT = item.total;
    /* ---------------- UPDATE TOTALS ---------------- */

    this.calculateTotalQuantity();
    this.calculateTotalExcludingTax();
    this.calculateTotalVATAmount();
    this.calculateTotalIncludingTax();

    /* ---------------- PUSH TO PoDetails ---------------- */

    const detailItem = {
      ITEM_ID: item.ITEM_ID,
      QUANTITY: qtyOrdered,
      PRICE: item.SUPP_PRICE,
      AMOUNT: item.SUPP_AMOUNT,
      // AMOUNT: Number(this.newPoData.GROSS_AMOUNT || 0),
      DISC_PERCENT: discPerc,

      // ✅ IMPORTANT
      VAT_PERC: item.VAT_PERC,
      CGST: 0,
      SGST: 0,

      TAX_AMOUNT: item.vatAmount,
      TOTAL_AMOUNT: item.total,

      ITEM_DESC: item.DESCRIPTION,
      UOM: item.UOM,
      SUPP_PRICE: item.SUPP_PRICE,
      SUPP_AMOUNT: item.taxable,
      // SUPP_AMOUNT: Number(this.newPoData.GROSS_AMOUNT || 0),
    };

    const index = this.poData.PoDetails.findIndex(
      (d: any) => d.ITEM_ID === item.ITEM_ID,
    );

    if (index !== -1) {
      this.poData.PoDetails[index] = { ...detailItem };
    } else {
      this.poData.PoDetails.push({ ...detailItem });
    }

    this.needSummaryUpdate = true;
    this.dataGrid.instance.refresh();
  }

  // Handle file selection
  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      this.uploadedFiles = [...this.uploadedFiles, ...newFiles];

      // Generate object URLs for each new file
      const newFileUrls = newFiles.map((file) => URL.createObjectURL(file));
      this.fileUrls = [...this.fileUrls, ...newFileUrls];
    }
  }

  // Remove file from the list
  removeFile(index: number) {
    // Revoke the URL to free memory
    URL.revokeObjectURL(this.fileUrls[index]);
    this.uploadedFiles.splice(index, 1);
    this.fileUrls.splice(index, 1);
  }

  calculateSummary(options: any) {
    switch (options.name) {
      case 'totalqty':
        if (options.summaryProcess === 'start') options.totalValue = 0;
        if (options.summaryProcess === 'calculate')
          options.totalValue += options.value.qtyOrdered || 0;
        break;
      case 'totalamount':
        if (options.summaryProcess === 'start') options.totalValue = 0;
        if (options.summaryProcess === 'calculate')
          options.totalValue += options.value.Amount || 0;
        break;
      case 'discamount':
        if (options.summaryProcess === 'start') options.totalValue = 0;
        if (options.summaryProcess === 'calculate')
          options.totalValue += options.value.discountAmount || 0;
        break;
      case 'totaltaxable':
        if (options.summaryProcess === 'start') options.totalValue = 0;
        if (options.summaryProcess === 'calculate')
          options.totalValue += options.value.taxable || 0;
        break;
      case 'totalvatamount':
        if (options.summaryProcess === 'start') options.totalValue = 0;
        if (options.summaryProcess === 'calculate')
          options.totalValue += options.value.vatAmount || 0;
        break;
      case 'total':
        if (options.summaryProcess === 'start') options.totalValue = 0;
        if (options.summaryProcess === 'calculate') {
          options.totalValue +=
            (options.value.qtyOrdered || 0) +
            (options.value.Amount || 0) +
            (options.value.discountAmount || 0) +
            (options.value.taxable || 0) + //  FIXED
            (options.value.vatAmount || 0);
        }
        break;
    }
  }

  GetSupplierList() {
    console.log('supplier list ===== function in purchase order');
    const payload = {
      NAME: 'SUPPLIER',
      COMPANY_ID: this.companyID,
    };
    this.service.getDropdownData(payload).subscribe((res) => {
      this.SupplierList = res;
    });
  }
  GetStoresList() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.companyID,
    };

    this.service.getDropdownData(payload).subscribe((res) => {
      this.StoreList = res;

      const userData = JSON.parse(
        sessionStorage.getItem('savedUserData') || '{}',
      );
      const configStore = userData.Configuration?.[0];

      if (this.isHQApp && configStore) {
        this.filteredStoreList = [
          {
            ID: configStore.STORE_ID,
            DESCRIPTION: configStore.STORE_NAME,
          },
        ];

        this.newPoData.STORE_ID = configStore.STORE_ID;
      } else {
        this.filteredStoreList = this.StoreList; // ✅ NOW WORKS
      }
    });
  }
  GetDeliveryTermsList() {
    const payload = {
      NAME: 'DELIVERYTERMS',
      COMPANY_ID: this.companyID,
    };
    this.service.getDropdownData(payload).subscribe((res) => {
      this.deliveryTermsList = res;
    });
  }

  GetPaymentTermsList() {
    const payload = {
      NAME: 'PAYMENTTERMS',
      COMPANY_ID: this.companyID,
    };
    this.service.getDropdownData(payload).subscribe((res) => {
      this.paymentTermsList = res;
    });
  }

  GetEmployeeList() {
    const payload = {
      NAME: 'EMPLOYEE',
      COMPANY_ID: this.companyID,
    };
    this.service.getDropdownData(payload).subscribe((res) => {
      this.employeeList = res;
    });
  }

  onRowClick(event: any) {
    const itemId = event.key.ITEM_ID;
    this.loadPurchaseOrders(itemId);

    if (this.expandedRowKey !== null && this.expandedRowKey !== event.key) {
      event.component.collapseRow(this.expandedRowKey);
    }
    this.expandedRowKey = event.key;
  }

  loadPurchaseOrders(itemId: string) {
    this.service
      .getLast5PoItemsList(itemId, this.selected_Company_id)
      .subscribe((data: any[]) => {
        // Filter out records where PO_NO matches this.newPOData.PO_NO
        this.purchaseOrders = data
          .filter((po) => po.PO_NO !== this.newPoData.PO_NO)
          .map((po) => ({
            ...po,
            // Ensure the PRICE field has 2 decimal places
            PRICE: parseFloat(po.PRICE).toFixed(2),
          }));
        console.log(this.purchaseOrders, 'last5poorder');
      });
  }

  //Disable the already-selected items from the popup
  onSupplierRowPrepared(e: any) {
    if (e.rowType !== 'data') return;

    const itemId = e.data.ITEM_ID;

    const alreadyAdded = this.savedItems.some(
      (item) => item.ITEM_ID === itemId,
    );

    if (alreadyAdded) {
      e.rowElement.style.pointerEvents = 'none';
      e.rowElement.style.opacity = '0.5';
    }
  }

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'SUPP_PRICE' ||
      e.dataField === 'qtyOrdered' ||
      e.dataField === 'discountPercentage'
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

  getPoHistoryList() {
    const payload = {
      TRANS_ID: 155,
    };
    this.service.getPurchaseOrderHistoryList(payload).subscribe((res: any) => {
      if (res && Array.isArray(res)) {
        this.poHistoryList = res.map((item, index) => ({
          ...item,
          slNo: index + 1,
        }));

        console.log('poHistoryListtttttttttt:', this.poHistoryList);

        // 👇 force refresh after async load
        setTimeout(() => this.dataGrid?.instance.refresh(), 0);
      } else {
        this.poHistoryList = [];
      }
    });
  }

  formatDateTime = (rowData: any): string => {
    const celldate = rowData.TIME; // Must match the actual property name
    if (!celldate) return '';

    const date = new Date(celldate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year}, ${hours}:${minutes}:${seconds}`;
  };

  formatPoDate(rowData: any): string {
    const celldate = rowData.PO_DATE;
    if (!celldate) return '';

    const date = new Date(celldate);

    // Format the date using the user's system locale
    const formattedDate = date.toLocaleDateString(); // Formats according to the user's system date format

    return formattedDate; // Return only the date part
  }

  customSum(
    options: Parameters<DxDataGridTypes.Summary['calculateCustomSummary']>[0],
  ) {
    console.log('options:', options); // Log the entire options object
    // Start each column's calculation
    if (options.summaryProcess === 'start') {
      options.totalValue = 0;
    }

    // Accumulate values for each column based on its name
    if (options.summaryProcess === 'calculate') {
      if (options.name === 'qtySum') {
        options.totalValue += options.value.qtyOrdered || 0;
        console.log(options.value.qtyOrdered, 'entering qty value');

        console.log(options.totalValue, 'qty total value');
      } else if (options.name === 'taxableSum') {
        options.totalValue += options.value.taxable || 0;
      } else if (options.name === 'vatSum') {
        options.totalValue += options.value.vatAmount || 0;
      } else if (options.name === 'totalSum') {
        options.totalValue += options.value.total || 0;
      }
    }

    // Finalize by rounding the total value for display
    if (options.summaryProcess === 'finalize') {
      options.totalValue = parseFloat(options.totalValue.toFixed(2));
      console.log(options.totalValue, 'finalize total value');
    }
  }

  getPoNumber() {
    this.service.getPoNo().subscribe((response: any) => {
      this.poNo = response.PURCHASE_NO;
      this.newPoData.PO_NO = String(this.poNo);

      console.log(this.poNo, 'PURCHASEORDERNO');
    });
  }

  close() {
    const defaultDates = {
      PO_DATE: this.newPoData.PO_DATE,
      DELIVERY_DATE: this.newPoData.DELIVERY_DATE,
    };

    // Reset newPoData to default values
    this.newPoData = {
      COMPANY_ID: 1,
      USER_ID: 1,
      STORE_ID: '',
      PO_NO: '',
      SUPP_ID: '',
      SUPP_CONTACT: '',
      SUPP_ADDRESS: '',
      SUPP_MOBILE: '',
      REF_NO: '',
      CURRENCY_ID: '',
      PAY_TERM_ID: '',
      DELIVERY_TERM_ID: '',
      NOTES: '',
      NARRATION: '',
      TAX_AMOUNT: '',
      GROSS_AMOUNT: '',
      NET_AMOUNT: '',
      SHIP_TO: '',
      PURPOSE: '',
      LOCATION: '',
      CONTACT_NAME: '',
      CONTACT_MOBILE: '',
      SUPP_GROSS_AMOUNT: '',
      SUPP_NET_AMOUNT: '',
      EXCHANGE_PRICE: '',
      ISSUED_EMP_ID: '',
      PoDetails: [],
      ...defaultDates, // Preserve the date values
    };

    console.log('Form data cleared, dates retained:', this.newPoData);
  }

  onCancelNewData() {
    this.showAddItemPopup = false;

    const grid = this.supplierItemsGrid?.instance;

    if (grid) {
      //  Clear all filters
      grid.clearFilter();

      // Hide filter UI
      grid.option('filterRow.visible', false);
      grid.option('headerFilter.visible', false);
    }

    // Reset your toggle state
    this.isFilterOpened = false;
  }

  onPopupClosing() {
    const grid = this.supplierItemsGrid?.instance;

    if (grid) {
      // Clear filters
      grid.clearFilter();

      // Reset filter UI
      grid.option('filterRow.visible', false);
      grid.option('headerFilter.visible', false);
    }

    // Reset toggle state
    this.isFilterOpened = false;

    // (Optional) clear selection
    this.supplierItemsGrid?.instance?.clearSelection();
  }

  // Parent component
  resetForm() {
    console.log('RESET FORM CALLED');

    this.isSupplierTouched = false;
    this.isSupplierValid = true;

    // Reset source data
    this.poData = {
      ...this.poData,
      PO_NO: '',
      PO_DATE: new Date(),
      DELIVERY_DATE: new Date(),
      SUPP_ID: '',
      STORE_ID: null,
      SUPP_CONTACT: '',
      SUPP_MOBILE: '',
      SUPP_ADDRESS: '',
      SHIP_TO: '',
      PURPOSE: '',
      CONTACT_NAME: '',
      CONTACT_MOBILE: '',
      DELIVERY_TERM_ID: null,
      PAY_TERM_ID: null,
      NOTES: '',
      NARRATION: '',
      ISSUED_EMP_ID: null,
      SUPP_GROSS_AMOUNT: 0,
      GROSS_AMOUNT: 0,
      TAX_AMOUNT: 0,
      SUPP_NET_AMOUNT: 0,
      NET_AMOUNT: 0,
      IS_APPROVED: false,
      PoDetails: [],
      REF_NO: '',
    };

    // Sync UI model
    this.newPoData = { ...this.poData };

    // Clear grid
    this.savedItems = [];

    // Reset form UI
    // if (this.poForm?.instance) {
    //   this.poForm.instance.option('formData', { ...this.newPoData });
    //   this.poForm.instance.resetValues();
    //   this.poForm.instance.option('validationGroup', null);
    // }
    if (this.poForm?.instance) {
      this.poForm.instance.resetValues();
      this.poForm.instance.option('validationGroup', null);
    }

    // Reset grid UI
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.option('dataSource', []);
      this.dataGrid.instance.refresh();
    }
  }

  getCountryCodeList() {
    const codes = CountryList.getAll();

    this.countryCodes = codes.map((country: any) => ({
      ...country,
      flagUrl: `https://flagcdn.com/w20/${country.code.toLowerCase()}.png`,
      display: `${country.dial_code}`,
    }));
  }

  countryCodeDisplay = (item: any) => {
    return item
      ? this.isDropdownOpen
        ? `${item.data.flag} ${item.data.dial_code} - ${item.data.name}`
        : `${item.data.flag}`
      : '';
  };

  onCountrySelected(e: any) {
    this.supplierCountryCode = e.itemData.data.dial_code;

    this.isCountryDropdownOpen = false;

    this.updateSupplierMobileNumber();
  }

  onShippingCountrySelected(e: any) {
    this.shippingCountryCode = e.itemData.data.dial_code;

    // update mobile field with new code
    this.updateContactMobile();

    // close dropdown
    this.isShipCountryDropdownOpen = false;
  }

  onDropdownOpened() {
    this.isDropdownOpen = true;
  }

  onDropdownClosed() {
    this.isDropdownOpen = false;
  }

  setDefaultCountryCode() {
    const defaultCountryCode = '+971';

    const defaultCountry = this.countryCodes.find(
      (code) => code.data.dial_code === defaultCountryCode,
    );

    if (defaultCountry) {
      this.supplierCountryCode = defaultCountry.data.dial_code;
      this.shippingCountryCode = defaultCountry.data.dial_code;

      // bind to textbox immediately
      this.updateSupplierMobileNumber();
      this.updateContactMobile();
    }
  }

  updateSupplierMobileNumber() {
    // this.newPoData.SUPP_MOBILE = '';
    if (!this.newPoData.SUPP_MOBILE) {
      this.newPoData.SUPP_MOBILE = '';
    }
    // const cleanDialCode = this.supplierCountryCode?.replace('+', '');

    // this.newPoData.SUPP_MOBILE = `${cleanDialCode}-`;
  }

  getOnlyMobileNumber(fullPhoneNumber: string): string {
    if (!fullPhoneNumber) return '';

    const dialCode = this.supplierCountryCode;

    return fullPhoneNumber.replace(dialCode, '').replace(/\D/g, '').trim();
  }

  onSupplierMobileInput(event: any) {
    const target = event.target as HTMLInputElement;

    let digits = target.value.replace(/\D/g, '');

    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }

    this.newPoData.SUPP_MOBILE = digits;
  }

  SupplierMobileValidate = (e: any): boolean => {
    const dialCode = this.supplierCountryCode || '';

    const mobileValue = e.value ? e.value.toString().trim() : '';

    // remove country code and non digits
    const mobileNumber = mobileValue.replace(/\D/g, '');
    // const mobileNumber = mobileValue
    //   .replace(dialCode.replace('+', ''), '')
    //   .replace(/\D/g, '');

    let requiredLength = 10;

    switch (dialCode) {
      case '+971': // UAE
        requiredLength = 9;
        break;

      case '+91': // India
        requiredLength = 10;
        break;

      case '+1': // USA
        requiredLength = 10;
        break;

      case '+44': // UK
        requiredLength = 10;
        break;

      case '+61': // Australia
        requiredLength = 9;
        break;

      case '+86': // China
        requiredLength = 11;
        break;
      case '+965': // Kuwait
        requiredLength = 8;
        break;

      default:
        requiredLength = 10;
    }

    const isValid =
      mobileNumber.length === requiredLength &&
      !/^0/.test(mobileNumber) &&
      !/^0+$/.test(mobileNumber);

    if (!isValid) {
      e.rule.message = `Mobile number must be exactly ${requiredLength} digits`;
    }

    return isValid;
  };

  preventDialCodeDelete(event: any) {
    const dialLength = this.supplierCountryCode.replace('+', '').length + 1;

    if (
      event.event.key === 'Backspace' &&
      event.event.target.selectionStart <= dialLength
    ) {
      event.event.preventDefault();
    }
  }

  preventShipementDialCodeDelete(event: any) {
    const dialLength = this.shippingCountryCode.replace('+', '').length + 1;

    if (
      event.event.key === 'Backspace' &&
      event.event.target.selectionStart <= dialLength
    ) {
      event.event.preventDefault();
    }
  }

  updateContactMobile() {
    this.newPoData.CONTACT_MOBILE = '';
    // const cleanDialCode = this.shippingCountryCode?.replace('+', '');

    // this.newPoData.CONTACT_MOBILE = `${cleanDialCode}-`;
  }

  onContactMobileInput(event: any) {
    const target = event.target as HTMLInputElement;

    let digits = target.value.replace(/\D/g, '');

    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }

    this.newPoData.CONTACT_MOBILE = digits;
  }

  // onContactMobileInput(event: any) {
  //   const target = event.target as HTMLInputElement;

  //   const dialCode = this.shippingCountryCode || '+91';

  //   let digits = target.value.replace(/\D/g, '');

  //   const dialDigits = dialCode.replace('+', '');

  //   if (digits.startsWith(dialDigits)) {
  //     digits = digits.slice(dialDigits.length);
  //   }

  //   if (digits.startsWith('0')) {
  //     digits = digits.substring(1);
  //   }

  //   const cleanDialCode = dialCode.replace('+', '');
  //   // this.newPoData.CONTACT_MOBILE = `${cleanDialCode}-${digits}`;
  //   this.newPoData.CONTACT_MOBILE = digits;
  // }

  validateContactMobile = (e: any): boolean => {
    const dialCode = this.shippingCountryCode || '';

    const mobileValue = e.value ? e.value.toString().trim() : '';

    // remove country code and non digits
    const mobileNumber = mobileValue.replace(/\D/g, '');
    // const mobileNumber = mobileValue
    //   .replace(dialCode.replace('+', ''), '')
    //   .replace(/\D/g, '');

    let requiredLength = 10;

    switch (dialCode) {
      case '+971': // UAE
        requiredLength = 9;
        break;

      case '+91': // India
        requiredLength = 10;
        break;

      case '+1': // USA
        requiredLength = 10;
        break;

      case '+44': // UK
        requiredLength = 10;
        break;

      case '+61': // Australia
        requiredLength = 9;
        break;

      case '+86': // China
        requiredLength = 11;
        break;

      default:
        requiredLength = 10;
    }

    const isValid =
      mobileNumber.length === requiredLength &&
      !/^0/.test(mobileNumber) &&
      !/^0+$/.test(mobileNumber);

    if (!isValid) {
      e.rule.message = `Mobile number must be exactly ${requiredLength} digits`;
    }

    return isValid;
  };

  onRowRemoved(e: any) {
    // Recalculate totals if needed
    this.updateAmount(null);

    // Reset serial numbers
    this.savedItems.forEach((item, index) => {
      item.slNo = index + 1;
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
    DxValidatorModule,
    DxProgressBarModule,
    DxTabsModule,
    DxTabPanelModule,
    DxPopupModule,
    DxButtonModule,
    DxDropDownBoxModule,
    DxListModule,
  ],
  providers: [],
  declarations: [PurchaseOrderNewFormComponent],
  exports: [PurchaseOrderNewFormComponent],
})
export class PurchaseOrderNewFormModule {}
