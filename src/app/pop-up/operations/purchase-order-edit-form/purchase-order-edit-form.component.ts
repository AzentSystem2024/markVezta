import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
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
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import CountryList from 'country-list-with-dial-code-and-flag';

@Component({
  selector: 'app-purchase-order-edit-form',
  templateUrl: './purchase-order-edit-form.component.html',
  styleUrls: ['./purchase-order-edit-form.component.scss'],
})
export class PurchaseOrderEditFormComponent implements OnInit, OnChanges {
  @Output() netEditAmountChange = new EventEmitter<any>();
  @Output() netEditSupplierAmountChange = new EventEmitter<any>();
  @Output() netEditQuantityChange = new EventEmitter<number>();
  @Output() showSupplierAmount = new EventEmitter<any>();
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @Output() closeForm = new EventEmitter<void>();
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  @ViewChild('supplierItemsGrid') supplierItemsGrid: DxDataGridComponent;
  @Input() formdata: any;
  @Input() isVerifyMode: boolean = false;
  poHistoryList: any;
  selectedCompanyId: any;
  companyList: any[];
  userId: any;
  finId: any;
  menuResponse: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  storeLabel: string;
  GST_PERC: any;
  HSN_CODE: any;
  HSNCODE: any;
  GST: any;
  hsnLoaded: boolean;
  transID: any;
  selected_Company_id: any;

  userRights: any;
  fileData: string = '';
  width = '97vw';
  height = '420px';
  tabs = [
    { text: 'Header' },
    { text: 'Detail' },
    { text: 'Attachments' },
    { text: 'History' },
  ];

  readonly allowedPageSizes: any = [10, 50, 100];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  uploadedFileName: string = '';
  showPopup: boolean = false;

  fileDetails: any = {
    DOC_ID: '',
    DOC_TYPE: 1,
    fileName: '',
    fileUrl: '',
    remarks: '',
    CREATED_DATE_TIME: new Date(),
  };

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
  uploadedFiles: [];
  fileUrls: string[] = [];
  SupplierList: any;
  StoreList: any;
  deliveryTermsList: any;
  paymentTermsList: any;
  selectedSupplierId: number | null = null;
  isSupplierValid: boolean = true;
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
  expandedRowKeys: any[] = [];
  allowEditing: boolean = true;
  selectedRowKeys: any[] = []; // Keys of items to be preselected
  needSummaryUpdate: boolean = false;
  supplierStateID: number;
  companyStateID: number;
  isInterState = false;
  isIntraState = false;
  previousSupplierId: number | null = null;
  isInitialLoad = true;

  countryCodes: any[] = [];
  supplierCountryCode: string = '';
  shippingCountryCode: string = '';
  isDropdownOpen: boolean = false;
  isShipCountryDropdownOpen: boolean = false;
  isCountryDropdownOpen: boolean = false;

  poData: any = {
    COMPANY_ID: 1,
    STORE_ID: '',
    PO_NO: '',
    PO_DATE: new Date(),
    SUPP_ID: '',
    SUPP_CONTACT: '',
    SUPP_ADDRESS: '',
    SUPP_MOBILE: '',
    REF_NO: '',
    CURRENCY_ID: '',
    PAY_TERM_ID: '',
    DELIVERY_TERM_ID: '',
    DELIVERY_DATE: new Date(),
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
    EXCHANGE_RATE: '',
    ISSUED_EMP_ID: null,
    USER_ID: 0,
    PoDetails: [],
  };
  newPoData = this.poData;
  getNewPoData = () => ({ ...this.newPoData });
  showHeaderFilter: true;
  showFilterRow = true;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilters(),
  };
  isFilterOpened: boolean;
  vatTitle: any;
  storeItems: any;
  CurrencySymbol: any;

  constructor(
    private service: DataService,
    private router: Router,
  ) {
    const userRights = sessionStorage.getItem('menuUserRightsResponse');
    this.userRights = userRights ? JSON.parse(userRights) : [];
    console.log(this.userRights, 'userRights');
    if (this.userRights.length > 0) {
      this.fileDetails.DOC_TYPE = this.userRights[0].DOC_TYPE;
    }
    console.log(this.fileDetails.DOC_TYPE, 'doctype');
    const settingsData = sessionStorage.getItem('settings');
    this.settingsData = settingsData ? JSON.parse(settingsData) : null;
    // Access CURRENCY_ID
    this.localCurrencyId = this.settingsData
      ? this.settingsData.CURRENCY_ID
      : null;
    console.log(this.localCurrencyId, 'CURRENCY_ID');
    this.localCurrencyCode = this.settingsData
      ? this.settingsData.CURRENCY_CODE
      : null;

    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);

      this.HSNCODE = userData.GeneralSettings.HSN_CODE;
      this.GST = userData.GeneralSettings.GST_PERC;
      this.hsnLoaded = true; // ADD THIS
    }
  }
  ngOnInit() {
    this.sessionDetails();
    const currentUrl = this.router.url;

    this.menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    console.log(
      'Parsed ObjectData:',
      this.menuResponse.GeneralSettings.VAT_TITLE,
    );
    this.vatTitle = this.menuResponse.GeneralSettings.VAT_TITLE;
    if (this.menuResponse?.GeneralSettings?.STORE_TITLE === 'STORE') {
      this.storeLabel = 'Store';
    } else {
      this.storeLabel = 'Location';
    }
    // this.sessionData_tax()
    const menuGroups = this.menuResponse.MenuGroups || [];

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
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;

      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
        this.companyList = [selectedCompany]; // ✅ Show only selected company
      }

      if (userData.USER_ID) {
        this.userId = userData.USER_ID;
        this.newPoData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.finId = firstFinYear.FIN_ID;
      }
    }
    this.currentDate = new Date();
    this.GetSupplierList();
    this.GetStoresList();
    this.GetDeliveryTermsList();
    this.GetPaymentTermsList();
    this.GetEmployeeList();
    this.getCountryCodeList();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formdata'] && this.formdata) {
      this.transID = this.formdata.TRANS_ID;
      this.fileDetails.DOC_ID = this.formdata.ID;

      this.newPoData = { ...this.formdata };
      this.newPoData.PoDetails = this.formdata.PoDetails || [];
      this.CurrencySymbol = this.newPoData.CURRENCY_SYMBOL || '';
      console.log(this.newPoData.CURRENCY_SYMBOL, 'CURRENCY_NAME====');
      this.extractSupplierCountryCode();
      this.extractShippingCountryCode();

      //  STEP 1: DETERMINE GST MODE FROM EXISTING DATA
      const firstDetail = this.newPoData.PoDetails?.[0];

      if (firstDetail) {
        const cgst = Number(firstDetail.CGST || 0);
        const sgst = Number(firstDetail.SGST || 0);

        if (cgst === 0 && sgst === 0) {
          // ✅ INTER-STATE → IGST
          this.isInterState = true;
          this.isIntraState = false;
        } else {
          // ✅ INTRA-STATE → CGST + SGST
          this.isInterState = false;
          this.isIntraState = true;
        }
      }

      // 🔥 STEP 2: MAP SAVED ITEMS (UNCHANGED)
      this.savedItems = this.newPoData.PoDetails.map((item, index) => {
        const baseAmount = item.QUANTITY * item.SUPP_PRICE;
        const supplierAmount = item.QUANTITY * item.SUPP_PRICE;

        const discountAmount = (baseAmount * (item.DISC_PERCENT || 0)) / 100;
        const supplierDiscAmount =
          (supplierAmount * (item.DISC_PERCENT || 0)) / 100;

        const taxableSupplier = supplierAmount - supplierDiscAmount;
        const taxable = baseAmount - discountAmount;

        let vatAmount = 0;
        vatAmount = (taxable * (item.VAT_PERC || 0)) / 100;
        // if (item.VAT_PERC && item.VAT_PERC > 0) {
        //   vatAmount = (taxable * item.VAT_PERC) / 100;
        // } else {
        //   const cgst = item.CGST || 0;
        //   const sgst = item.SGST || 0;
        //   vatAmount = (taxable * (cgst + sgst)) / 100;
        // }

        return {
          ITEM_ID: item.ITEM_ID,
          slNo: index + 1,
          ITEM_CODE: item.ITEM_CODE || '',
          DESCRIPTION: item.ITEM_DESC,
          UOM: item.UOM,
          PACKING_NAME: item.PACKING,
          SUPP_PRICE: +item.SUPP_PRICE,
          PURCH_PRICE: +item.PRICE || 0,
          qtyOrdered: +item.QUANTITY,
          Amount: +baseAmount.toFixed(2),
          discountPercentage: item.DISC_PERCENT,
          discountAmount: +discountAmount.toFixed(2),
          taxable_Supplier: +taxableSupplier.toFixed(2),
          taxable: +taxable.toFixed(2),
          VAT_PERC: item.VAT_PERC || 0,
          TAX_PERC: item.TAX_PERC,
          CGST: item.CGST || 0,
          SGST: item.SGST || 0,
          vatAmount: +vatAmount.toFixed(2),
          total_Supplier: +taxableSupplier.toFixed(2),
          total: +(taxable + vatAmount).toFixed(2),
          HSN_CODE: item.HSN_CODE,
          GST_PERC: item.VAT_PERC || 0,
        };
      });

      // 🔥 STEP 3: remember supplier & mark load complete
      this.previousSupplierId = this.newPoData.SUPP_ID;
      this.isInitialLoad = false;

      // 🔥 STEP 4: FORCE GRID TO UPDATE COLUMN VISIBILITY
      setTimeout(() => {
        this.itemsGridRef?.instance?.repaint();
      }, 0);

      // EXISTING CALLS (UNCHANGED)
      this.getAttachmentList();
      this.getPoHistoryList();
      if (this.isInitialLoad) {
        this.getSupplierByid();
      }

      this.selectedRowKeys = this.savedItems.map((i) => i.ITEM_CODE);

      this.calculateTotalQuantity();
      this.calculateTotalIncludingTax();
    }
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.supplierItemsGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  highlightEditableColumns(event: any) {
    if (event.rowType === 'data' && event.column.allowEditing) {
      // Apply a custom style for editable cells
      event.cellElement.style.backgroundColor = '#FFFFFF'; // Soft yellow background
      event.cellElement.style.color = '#000000ff'; // Dark yellow text
      // event.cellElement.style.fontWeight = 'bold';
    }
  }

  preparePoDetailsForSubmit() {
    this.poData.PoDetails = this.savedItems.map((item: any) => ({
      ITEM_ID: item.ITEM_ID,
      QUANTITY: item.qtyOrdered,
      PRICE: item.PURCH_PRICE || 0,
      RATE: item.PURCH_PRICE || 0,
      AMOUNT: item.taxable,
      // AMOUNT: Number(this.newPoData.GROSS_AMOUNT || 0),
      DISC_PERCENT: item.discountPercentage || 0,
      TAX_PERC: item.VAT_PERC,
      VAT_PERC: item.VAT_PERC,
      CGST: 0,
      SGST: 0,
      // TAX_PERC: this.isInterState ? item.VAT_PERC : 0,
      // //GST MODE HANDLING
      // VAT_PERC: this.isInterState ? item.VAT_PERC : 0,
      // CGST: this.isInterState ? 0 : item.CGST,
      // SGST: this.isInterState ? 0 : item.SGST,

      TAX_AMOUNT: item.vatAmount,
      TOTAL_AMOUNT: item.total,

      ITEM_DESC: item.DESCRIPTION,
      UOM: item.UOM,

      SUPP_PRICE: item.SUPP_PRICE,
      SUPP_AMOUNT: item.taxable_Supplier,
      // SUPP_AMOUNT: Number(this.newPoData.GROSS_AMOUNT || 0),
    }));
  }

  // Validate if supplier is selected
  validateSupplier() {
    this.isSupplierValid = !!this.newPoData.SUPP_ID;
  }

  // Handler for Add Item button
  onAddItemClick() {
    this.validateSupplier();
    if (this.isSupplierValid) {
      // Show add item popup if supplier is selected
      this.showAddItemPopup = true;

      console.log(this.selectedSupplierId, 'selected supplier id');

      this.getSupplierByid();

      console.log(this.supplierItems, 'supplier items');
    }
  }

  onSupplierChanged(e: any) {
    const newSupplierId = e.value;

    if (!newSupplierId) {
      return;
    }

    // Do NOT let ngOnChanges interfere
    this.newPoData.SUPP_ID = newSupplierId;

    //CLEAR SUPPLIER DEPENDENT FIELDS
    this.SupplierCurrency = null;
    this.SupplierCurrencyCode = null;
    this.SupplierCurrencySymbol = null;
    this.currencyExchangeRate = null;
    this.vatRule = null;

    // 🔥 CLEAR GRID DATA (ONLY IN EDIT WHEN USER CHANGES SUPPLIER)
    this.savedItems = [];
    this.newPoData.PoDetails = [];

    // 🔥 RESET TOTALS
    this.newPoData.GROSS_AMOUNT = 0;
    this.newPoData.TAX_AMOUNT = 0;
    this.newPoData.NET_AMOUNT = 0;
    this.newPoData.SUPP_GROSS_AMOUNT = 0;
    this.newPoData.SUPP_NET_AMOUNT = 0;

    // 🔥 LOAD NEW SUPPLIER DATA
    this.getSupplierByid();
  }

  resetSupplierDependentDataEdit() {
    //  CLEAR GRID + DETAILS
    this.savedItems = [];
    this.poData.PoDetails = [];

    // RESET TOTALS
    this.totalQuantity = 0;
    this.newPoData.GROSS_AMOUNT = 0;
    this.newPoData.TAX_AMOUNT = 0;
    this.newPoData.NET_AMOUNT = 0;
    this.newPoData.SUPP_GROSS_AMOUNT = 0;
    this.newPoData.SUPP_NET_AMOUNT = 0;

    // RESET GST FLAGS
    this.isInterState = false;
    this.isIntraState = false;

    // RESET SUPPLIER INFO
    this.newPoData.SUPP_CONTACT = '';
    this.newPoData.SUPP_ADDRESS = '';
    this.newPoData.SUPP_MOBILE = '';

    this.SupplierCurrency = null;
    this.SupplierCurrencyCode = null;
    this.SupplierCurrencySymbol = null;
    this.currencyExchangeRate = null;
    this.vatRule = null;

    // sREFRESH GRID
    setTimeout(() => {
      this.itemsGridRef?.instance?.refresh();
    }, 0);
  }

  getSupplierByid() {
    const payload = {
      SUPP_ID: this.newPoData.SUPP_ID,
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getSupplierItemsData(payload).subscribe((res) => {
      this.supplierItems = res;
      const supplier = res[0];
      this.supplierStateID = supplier.STATE_ID;
      this.isInterState = this.companyStateID !== this.supplierStateID;
      this.isIntraState = !this.isInterState;
      setTimeout(() => {
        this.itemsGridRef?.instance?.repaint(); // 🔥 REQUIRED
      }, 0);
      // 🔄 UPDATE GST FOR ALL EXISTING ROWS
      this.savedItems.forEach((item) => {
        const itemGst = Number(item.GST_PERC ?? item.VAT_PERC ?? 0);

        item.GST_PERC = itemGst;
        item.VAT_PERC = itemGst;
        item.CGST = 0;
        item.SGST = 0;
      });
      // this.savedItems.forEach((item) => {
      //   const itemGst = Number(item.GST_PERC || item.VAT_PERC || 0);
      //   const halfGst = +(itemGst / 2).toFixed(2);

      //   if (this.isInterState) {
      //     item.VAT_PERC = itemGst;
      //     item.CGST = 0;
      //     item.SGST = 0;
      //   } else {
      //     item.VAT_PERC = 0;
      //     item.CGST = halfGst;
      //     item.SGST = halfGst;
      //   }
      // });

      // this.savedItems.forEach((item) => {
      //   if (this.isInterState) {
      //     // IGST
      //     item.VAT_PERC = this.GST_PERC;
      //     item.CGST = 0;
      //     item.SGST = 0;
      //   } else {
      //     // CGST + SGST
      //     const halfGst = this.GST_PERC / 2;
      //     item.VAT_PERC = 0;
      //     item.CGST = halfGst;
      //     item.SGST = halfGst;
      //   }
      // });

      //  FORCE RECALCULATION
      this.savedItems.forEach((item) =>
        this.updateAmount({ key: item, data: item }),
      );

      //  REFRESH GRID
      setTimeout(() => {
        this.itemsGridRef?.instance?.refresh();
      }, 0);
      this.newPoData.CURRENCY_ID = this.supplierItems[0].CURRENCY_ID;
      this.SupplierCurrency = this.supplierItems[0].CURRENCY_NAME;
      this.SupplierCurrencyCode = this.supplierItems[0].CURRENCY_CODE;
      this.SupplierCurrencySymbol = this.supplierItems[0].CURRENCY_SYMBOL;
      this.newPoData.SUPP_CONTACT = this.supplierItems[0].SUPP_NAME;
      this.newPoData.SUPP_MOBILE = this.supplierItems[0].PHONE;
      this.newPoData.SUPP_ADDRESS = this.supplierItems[0].SUPP_ADDRESS;
      this.currencyExchangeRate = this.supplierItems[0].EXCHANGE;
      this.vatRule = this.supplierItems[0].VAT_RULE_NAME;

      this.showLocalCurrencyColumn =
        this.localCurrencyId !== this.newPoData.CURRENCY_ID;

      console.log(this.supplierItems, 'supplier items');

      // Perform the calculation and emit the value here
      const shouldShowSupplierAmount =
        this.SupplierCurrencyCode !== this.localCurrencyCode;
      console.log('showSupplierAmount:', shouldShowSupplierAmount);
      this.showSupplierAmount.emit(shouldShowSupplierAmount); // Emit after initialization
    });
  }

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
      // this.applyGstModeToItems();

      // 🔁 Refresh grid so columns + values update
      setTimeout(() => {
        this.itemsGridRef?.instance?.refresh();
      }, 0);

      console.log('GST MODE:', this.isInterState ? 'IGST' : 'CGST + SGST');

      //  KEEPING ALL YOUR EXISTING CODE AS-IS
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

  onTabClick(e: any) {
    this.selectedTabIndex = e.itemIndex;
    if (this.selectedTabIndex === 2) {
      this.getPoHistoryList();
    }
  }

  // onFileUploaded(event: any) {
  //   // Handle successful upload response
  //   this.uploadedFiles.push(event.file);
  // }

  onUploadError(event: any) {
    // Handle upload error
    console.error('File upload error:', event.error);
  }
  // onSelectionChanged(event: any) {
  //   this.selectedRowKeys = event.selectedRowKeys;
  //   this.selectedItems = event.selectedRowsData;
  //   this.sessionDetails();
  // }

  onSelectionChanged(e: any) {
    this.selectedItems = e.selectedRowsData.map((item: any) => ({
      ...item,
      HSN_CODE: item.HSN_CODE, // from item
      GST_PERC: item.GST_PERC || item.VAT_PERC || 0, // from item
    }));
  }

  saveSelectedData() {
    const newItems = this.selectedItems
      .filter(
        (item) =>
          !this.savedItems.some((saved) => saved.ITEM_ID === item.ITEM_ID),
      )
      .map((item, index) => {
        const itemGst = Number(item.GST_PERC || item.VAT_PERC || this.GST || 0);

        const useSupplierPrice =
          this.SupplierCurrencyCode !== this.localCurrencyCode;

        const supplierPrice = useSupplierPrice
          ? item.PURCH_PRICE
          : item.PURCH_PRICE;

        const purchPrice = useSupplierPrice
          ? supplierPrice / this.currencyExchangeRate
          : item.PURCH_PRICE;

        return {
          ...item,
          slNo: this.savedItems.length + index + 1,

          SUPP_PRICE: supplierPrice,
          PURCH_PRICE: +purchPrice.toFixed(2),

          HSN_CODE: item.HSN_CODE,
          GST_PERC: itemGst,

          // 🔑 Always preserve GST
          VAT_PERC: itemGst,
          CGST: 0,
          SGST: 0,

          qtyOrdered: 0,
          Amount: 0,
          discountPercentage: 0,
          discountAmount: 0,
          taxable: 0,
          vatAmount: 0,
          total: 0,
        };
      });

    // 🔑 Append only new items
    this.savedItems = [...this.savedItems, ...newItems];

    this.selectedTabIndex = 1;
    this.showAddItemPopup = false;

    this.itemsGridRef?.instance?.refresh();
  }

  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.HSN_CODE = sessionData.GeneralSettings.HSN_CODE;

    this.GST_PERC = sessionData.GeneralSettings.GST_PERC;

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.companyStateID = sessionData.SELECTED_COMPANY.STATE_ID;
  }

  calculateTotalQuantity() {
    this.totalQuantity = this.savedItems.reduce(
      (sum, item) => sum + Number(item.qtyOrdered || 0),
      0,
    );
    this.netEditQuantityChange.emit(this.totalQuantity);
  }

  calculateTotalExcludingTax() {
    this.newPoData.GROSS_AMOUNT = this.savedItems
      .reduce((sum, item) => sum + Number(item.taxable || 0), 0)
      .toFixed(2);
    this.newPoData.SUPP_GROSS_AMOUNT = this.savedItems
      .reduce((sum, item) => sum + Number(item.taxable_Supplier || 0), 0)
      .toFixed(2);
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
    this.newPoData.SUPP_NET_AMOUNT = this.newPoData.SUPP_GROSS_AMOUNT;

    // Determine the amount to emit based on currency comparison
    const amountToEmitInLocalCurrency = `${this.newPoData.NET_AMOUNT} ${this.localCurrencyCode}`;

    const amountToEmitInSupplierCurrency = `${this.newPoData.SUPP_NET_AMOUNT} ${this.SupplierCurrencySymbol}`;

    // Emit the formatted NET_AMOUNT with local or supplier currency symbol
    this.netEditAmountChange.emit(amountToEmitInLocalCurrency); // Emit NET_AMOUNT with the currency

    // Emit SUPP_NET_AMOUNT with the supplier currency symbol
    this.netEditSupplierAmountChange.emit(amountToEmitInSupplierCurrency); // Emit SUPP_NET_AMOUNT with the supplier currency symbol
  }

  onContentReady(e: any) {
    if (this.needSummaryUpdate) {
      // Refresh the grid to recalculate summary values
      e.component.refresh();
      this.needSummaryUpdate = false; // Reset the flag after refresh
    }
  }

  updateAmount(e: any) {
    const updatedRow = { ...e.key, ...e.data }; // Get the updated row data

    console.log(updatedRow, 'Final merged updated row');
    // Find the specific item in savedItems
    const item = this.savedItems.find((i) => i.slNo === updatedRow.slNo);

    if (item) {
      console.log(item, 'item');
      // Ensure qtyOrdered is valid before proceeding with calculations
      const qtyOrdered = updatedRow.qtyOrdered ? updatedRow.qtyOrdered : 0;

      // Check if SUPP_PRICE is updated and calculate PURCH_PRICE
      if (
        updatedRow.SUPP_PRICE !== undefined &&
        updatedRow.SUPP_PRICE !== null
      ) {
        item.SUPP_PRICE = updatedRow.SUPP_PRICE;

        // Only recalculate PURCH_PRICE if the currencies are different
        if (this.SupplierCurrencyCode !== this.localCurrencyCode) {
          item.PURCH_PRICE = parseFloat(
            (item.SUPP_PRICE / this.newPoData.EXCHANGE_PRICE).toFixed(2),
          );
        } else {
          // Use the manually updated PURCH_PRICE directly
          item.PURCH_PRICE = updatedRow.PURCH_PRICE || 0;
        }
      }

      // Only calculate if qtyOrdered is greater than 0
      if (qtyOrdered > 0) {
        // Calculate Amount based on qtyOrdered and Cost (PURCH_PRICE)
        item.Amount = Number((qtyOrdered * updatedRow.SUPP_PRICE).toFixed(2));
        item.SUPP_AMOUNT = Number(
          (qtyOrdered * updatedRow.SUPP_PRICE).toFixed(2),
        );
        console.log(item.Amount, 'AMOUNTINEDIT');
        // Calculate Discount Amount only if discountPercentage is valid
        console.log(updatedRow.discountPercentage, 'DISCOUNTPARCENTAGE');
        if (
          updatedRow.discountPercentage &&
          updatedRow.discountPercentage > 0
        ) {
          item.discountAmount = parseFloat(
            (item.Amount * (updatedRow.discountPercentage / 100)).toFixed(2),
          );
          console.log(item.discountAmount, 'discountAmount');
        } else {
          item.discountAmount = 0; // Set to 0 if no valid discount percentage
        }

        // Calculate Taxable Amount as Amount - Discount Amount
        item.taxable = parseFloat(
          (item.Amount - item.discountAmount).toFixed(2),
        );
        console.log(item.taxable, 'taxable');
        let discSupplierAmount = 0; // Initialize discount amount

        if (
          updatedRow.discountPercentage &&
          updatedRow.discountPercentage > 0
        ) {
          discSupplierAmount = parseFloat(
            (
              qtyOrdered *
              item.SUPP_PRICE *
              (updatedRow.discountPercentage / 100)
            ).toFixed(2),
          );
        } else {
          discSupplierAmount = 0; // Set to 0 if no valid discount percentage
        }

        // Calculate Taxable Supplier based on SUPP_PRICE in the supplier's currency
        item.taxable_Supplier = parseFloat(
          (qtyOrdered * item.SUPP_PRICE - discSupplierAmount).toFixed(2),
        );

        // Calculate VAT Amount if VAT percentage is provided
        const itemGst = Number(item.GST_PERC || item.VAT_PERC || 0);

        item.VAT_PERC = itemGst;
        item.CGST = 0;
        item.SGST = 0;

        const totalTaxPerc = item.VAT_PERC;
        // const itemGst = Number(item.GST_PERC || 0);
        // let totalTaxPerc = 0;

        // if (this.isInterState) {
        //   item.VAT_PERC = itemGst;
        //   item.CGST = 0;
        //   item.SGST = 0;
        //   totalTaxPerc = itemGst;
        // } else {
        //   const halfGst = +(itemGst / 2).toFixed(2);
        //   item.VAT_PERC = 0;
        //   item.CGST = halfGst;
        //   item.SGST = halfGst;
        //   totalTaxPerc = halfGst * 2;
        // }

        item.vatAmount = parseFloat(
          (item.taxable * (totalTaxPerc / 100)).toFixed(2),
        );

        console.log(item.taxable, item.vatAmount, 'TAXABLE,VATAMOUNT');
        // Calculate Total as Taxable Amount + VAT Amount
        item.total_Supplier = item.taxable_Supplier;
        item.total = parseFloat((item.taxable + item.vatAmount).toFixed(2));
        console.log(item.total_Supplier, 'TOTALSUPPLIERRRRRRRRR');
        console.log(item.total, 'total-------------');
        // item.total_Supplier = parseFloat(
        //   (item.taxable + item.vatAmount).toFixed(2)
        // );
      } else {
        // Reset related fields if qtyOrdered is not valid or zero
        item.Amount = 0;
        item.discountAmount = 0;
        item.taxable = 0;
        item.vatAmount = 0;
        item.total = 0;
      }

      // Update the total quantities and amounts
      this.calculateTotalQuantity();
      this.calculateTotalExcludingTax();
      this.calculateTotalVATAmount();
      this.calculateTotalIncludingTax();

      // Define the structure of the item for PoDetails
      const detailItem = {
        ITEM_ID: item.ITEM_ID,
        QUANTITY: qtyOrdered,
        // PRICE: item.SUPP_PRICE || 0,
        AMOUNT: item.taxable,
        // AMOUNT: Number(this.newPoData.GROSS_AMOUNT || 0),
        DISC_PERCENT: updatedRow.discountPercentage,
        // VAT_PERC : updatedRow.VAT_PERC,
        TAX_PERC: updatedRow.VAT_PERC || 0, // IGST only
        CGST: item.CGST || 0,
        SGST: item.SGST || 0,
        TAX_AMOUNT: item.vatAmount,
        // TOTAL_AMOUNT: item.total,
        TOTAL_AMOUNT: item.total,
        ITEM_DESC: item.DESCRIPTION,
        UOM: item.UOM,
        SUPP_PRICE: item.SUPP_PRICE,
        SUPP_AMOUNT: item.taxable_Supplier,
        // SUPP_AMOUNT: Number(this.newPoData.GROSS_AMOUNT || 0),
      };

      // Check if the item already exists in PoDetails
      const detailItemIndex = this.poData.PoDetails.findIndex(
        (detailItem: any) => detailItem.ITEM_ID === item.ITEM_ID,
      );
      console.log(detailItem, 'ITEMSVALUESINPO');
      if (detailItemIndex !== -1) {
        // If item already exists in PoDetails, update it
        this.poData.PoDetails[detailItemIndex] = { ...detailItem };
      } else {
        // If item does not exist, add it to PoDetails
        this.poData.PoDetails.push({ ...detailItem });
      }
      this.needSummaryUpdate = true;
      this.dataGrid.instance.refresh();
    }
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
          options.totalValue += options.value.Taxable || 0;
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
            (options.value.Taxable || 0) +
            (options.value.vatAmount || 0);
        }
        break;
    }
  }

  GetSupplierList() {
    const payload = {
      NAME: 'SUPPLIER',
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getDropdownData(payload).subscribe((res) => {
      this.SupplierList = res;
    });
  }

  getFormattedSupplierPrice = (rowData: any) => {
    // this.CurrencySymbol = rowData?.CURRENCY_SYMBOL || '';
    const symbol = this.newPoData.CURRENCY_SYMBOL || '';
    const price = Number(rowData?.SUPP_PRICE || 0).toFixed(2);

    return symbol ? `${symbol} ${price}` : price;
  };
  formatTotalAmount = (data: any) => {
    const formattedValue = Number(data.value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // return `${this.CurrencySymbol} ${formattedValue}`;
    return this.CurrencySymbol === this.menuResponse?.GeneralSettings?.SYMBOL
      ? formattedValue
      : `${this.CurrencySymbol} ${formattedValue}`;
  };

  GetStoresList() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getDropdownData(payload).subscribe((res) => {
      this.StoreList = res;
    });
  }

  GetDeliveryTermsList() {
    const payload = {
      NAME: 'DELIVERYTERMS',
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getDropdownData(payload).subscribe((res) => {
      this.deliveryTermsList = res;
    });
  }

  GetPaymentTermsList() {
    const payload = {
      NAME: 'PAYMENTTERMS',
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getDropdownData(payload).subscribe((res) => {
      this.paymentTermsList = res;
    });
  }

  GetEmployeeList() {
    const payload = {
      NAME: 'EMPLOYEE',
      COMPANY_ID: this.selected_Company_id,
    };
    this.service.getDropdownData(payload).subscribe((res) => {
      this.employeeList = res;
    });
  }

  onRowClick(event: any) {
    const itemId = event.data.ITEM_ID;
    this.loadPurchaseOrders(itemId);
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
      });
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
      TRANS_ID: this.transID,
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

  // formatDateTime(rowData: any): string {
  //   const celldate = rowData.Time;
  //   if (!celldate) return '';

  //   const date = new Date(celldate);

  //   // Format the date and time using the user's system locale
  //   const formattedDate = date.toLocaleDateString(); // Formats according to the user's system date format
  //   const formattedTime = date.toLocaleTimeString(); // Formats according to the user's system time format

  //   // Combine date and time
  //   return `${formattedDate}, ${formattedTime}`;
  // }

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

  // This method is called when the file is selected
  onFileSelected(event: any) {
    const file: File = event.target.files[0]; // Get the selected file
    console.log(file, 'file');

    if (file) {
      const reader = new FileReader();

      // FileReader will read the file as a Data URL (Base64 encoded)
      reader.onloadend = () => {
        const base64DataUrl = reader.result as string; // Example: "data:application/pdf;base64,ABCDEF..."

        // Extract the Base64 part from the Data URL
        this.fileData = base64DataUrl.split(',')[1]; // Remove "data:*/*;base64," prefix
        console.log(this.fileData, 'fileData (Base64)');

        // Set additional file details, e.g., file name
        this.fileDetails.fileName = file.name;
        this.uploadedFileName = file.name;
      };

      // Read the file as a Data URL
      reader.readAsDataURL(file);
    }
  }

  openFile(base64Data: string, fileName: string) {
    if (!base64Data) {
      console.error('No file data available to open.');
      return;
    }

    // Convert Base64 to Blob
    const byteCharacters = atob(base64Data); // Decode Base64
    const byteNumbers = new Array(byteCharacters.length)
      .fill(null)
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);

    // Determine file type based on extension
    let fileType = 'application/octet-stream'; // Default type
    if (fileName.endsWith('.pdf')) {
      fileType = 'application/pdf';
    } else if (fileName.endsWith('.jpeg') || fileName.endsWith('.jpg')) {
      fileType = 'image/jpeg';
    } else if (fileName.endsWith('.png')) {
      fileType = 'image/png';
    }

    const blob = new Blob([byteArray], { type: fileType });

    // Create a temporary object URL
    const url = URL.createObjectURL(blob);

    // Open the file in a new tab for images or PDF
    if (fileType.startsWith('image/') || fileType === 'application/pdf') {
      window.open(url, '_blank');
    } else {
      // Force download for unsupported file types
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Revoke the object URL after use (optional, for memory cleanup)
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Save file details from popup to data grid
  saveFileDetails() {
    const data = {
      DOC_TYPE: this.fileDetails.DOC_TYPE,
      DOC_ID: this.fileDetails.DOC_ID,
      FILE_NAME: this.fileDetails.fileName,
      FILE_DATA: this.fileData,
      REMARKS: this.fileDetails.remarks,
      USER_ID: this.userId,
      CREATED_DATE_TIME: new Date(),
    };

    console.log(data, 'data');

    this.service.saveAttachmentData(data).subscribe((res) => {
      console.log(res, 'result');
      if (res) {
        this.showPopup = false;
        this.getAttachmentList();
      }
    });
  }

  getAttachmentList() {
    const docId = this.fileDetails.DOC_ID;
    const docType = this.fileDetails.DOC_TYPE;
    console.log(docId, docType, 'docid and doctype');
    this.service.getAttachmentList(docId, docType).subscribe((res: any) => {
      this.uploadedFiles = res.data || res;
    });
  }

  //selecting item from the add-item popup. disabled the already-selected items.
  onSupplierRowPrepared(e: any) {
    if (e.rowType !== 'data') return;

    const itemCode = e.data.ITEM_CODE;

    const alreadyAdded = this.savedItems.some(
      (item) => item.ITEM_CODE === itemCode,
    );

    if (alreadyAdded) {
      // Disable row selection
      e.rowElement.style.pointerEvents = 'none';
      e.rowElement.style.opacity = '0.5';

      // Optional: grey background
      e.rowElement.style.backgroundColor = '#f5f5f5';
    }
  }

  //cancel add-item popup
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

  //remove the added items
  onRowRemoving(e: any) {
    const index = this.savedItems.findIndex(
      (item) => item.slNo === e.data.slNo,
    );

    if (index > -1) {
      this.savedItems.splice(index, 1);
    }

    // Reorder Sl No
    this.savedItems.forEach((item, i) => {
      item.slNo = i + 1;
    });

    this.calculateTotalQuantity();
    this.calculateTotalExcludingTax();
    this.calculateTotalVATAmount();
    this.calculateTotalIncludingTax();

    this.itemsGridRef?.instance?.refresh();
  }

  getCountryCodeList() {
    const codes = CountryList.getAll();

    this.countryCodes = codes.map((country: any) => ({
      ...country,
      flagUrl: `https://flagcdn.com/w20/${country.code.toLowerCase()}.png`,
      display: `${country.dial_code}`,
    }));
  }

  extractSupplierCountryCode() {
    let mobile = this.newPoData.SUPP_MOBILE;

    if (!mobile) {
      // ✅ Default when empty
      this.supplierCountryCode = '+971';
      this.newPoData.SUPP_MOBILE = '';
      return;
    }

    // Remove spaces
    mobile = mobile.toString().trim();

    // Match with optional country code
    const match = mobile.match(/^(\+?\d{1,4})?[-\s]?(\d+)$/);

    if (match) {
      let code = match[1];
      const number = match[2];

      // ✅ If NO country code → default +971
      if (!code) {
        code = '+971';
      }

      // ✅ Ensure '+' exists
      if (!code.startsWith('+')) {
        code = '+' + code;
      }

      this.supplierCountryCode = code;
      this.newPoData.SUPP_MOBILE = number;
    } else {
      // ✅ fallback safety (unexpected format)
      this.supplierCountryCode = '+971';
      this.newPoData.SUPP_MOBILE = mobile.replace(/\D/g, '');
    }
  }

  // extractSupplierCountryCode() {
  //   if (!this.newPoData.SUPP_MOBILE) return;

  //   const parts = this.newPoData.SUPP_MOBILE.split('-');

  //   if (parts.length === 2) {
  //     this.supplierCountryCode = '+' + parts[0];
  //     this.newPoData.SUPP_MOBILE = parts[1];
  //     // this.newPoData.SUPP_MOBILE = parts[0] + '-' + parts[1];
  //   }
  // }

  extractShippingCountryCode() {
    let mobile = this.newPoData.CONTACT_MOBILE;

    if (!mobile) {
      // ✅ Default when empty
      this.shippingCountryCode = '+971';
      this.newPoData.CONTACT_MOBILE = '';
      return;
    }

    // Remove spaces
    mobile = mobile.toString().trim();

    // Match all formats:
    // +971-xxxx, 971-xxxx, +971xxxx, 971xxxx, xxxx
    const match = mobile.match(/^(\+?\d{1,4})?[-\s]?(\d+)$/);

    if (match) {
      let code = match[1];
      const number = match[2];

      // ✅ If NO country code → default +971
      if (!code) {
        code = '+971';
      }

      // Ensure '+' exists
      if (!code.startsWith('+')) {
        code = '+' + code;
      }

      this.shippingCountryCode = code;
      this.newPoData.CONTACT_MOBILE = number;
    } else {
      // fallback safety
      this.shippingCountryCode = '+971';
      this.newPoData.CONTACT_MOBILE = mobile.replace(/\D/g, '');
    }
  }

  // extractShippingCountryCode() {
  //   if (!this.newPoData.CONTACT_MOBILE) return;

  //   const parts = this.newPoData.CONTACT_MOBILE.split('-');

  //   if (parts.length === 2) {
  //     this.shippingCountryCode = '+' + parts[0];
  //     this.newPoData.CONTACT_MOBILE = parts[1];
  //     // this.newPoData.CONTACT_MOBILE = parts[0] + '-' + parts[1];
  //   }
  // }

  updateSupplierMobileNumber() {
    // const cleanDialCode = this.supplierCountryCode?.replace('+', '');
    this.newPoData.SUPP_MOBILE = '';
    // this.newPoData.SUPP_MOBILE = `${cleanDialCode}-`;
  }

  getOnlyMobileNumber(fullPhoneNumber: string): string {
    if (!fullPhoneNumber) return '';

    const dialCode = this.supplierCountryCode;

    return fullPhoneNumber.replace(dialCode, '').replace(/\D/g, '').trim();
  }

  onSupplierMobileInput(event: any) {
    const target = event.event.target as HTMLInputElement;

    const dialCode = this.supplierCountryCode || '+91';

    const cleanDialCode = dialCode.replace('+', '');

    // get digits only
    let digits = target.value.replace(/\D/g, '');

    const dialDigits = cleanDialCode;

    // remove dial code digits
    if (digits.startsWith(dialDigits)) {
      digits = digits.slice(dialDigits.length);
    }

    // prevent starting with 0
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }

    // allow empty digits (important fix)
    this.newPoData.SUPP_MOBILE = digits;
    // this.newPoData.SUPP_MOBILE = digits
    //   ? `${cleanDialCode}-${digits}`
    //   : `${cleanDialCode}-`;
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

    const dialCode = this.shippingCountryCode || '+91';

    let digits = target.value.replace(/\D/g, '');

    const dialDigits = dialCode.replace('+', '');

    if (digits.startsWith(dialDigits)) {
      digits = digits.slice(dialDigits.length);
    }

    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }

    const cleanDialCode = dialCode.replace('+', '');
    // this.newPoData.CONTACT_MOBILE = `${cleanDialCode}-${digits}`;
    this.newPoData.CONTACT_MOBILE = digits;
  }

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

  countryCodeDisplay = (item: any) => {
    return item
      ? this.isDropdownOpen
        ? `${item.data.flag} ${item.data.dial_code} - ${item.data.name}`
        : `${item.data.flag}`
      : '';
  };

  onDropdownOpened() {
    this.isDropdownOpen = true;
  }

  onDropdownClosed() {
    this.isDropdownOpen = false;
  }

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
  declarations: [PurchaseOrderEditFormComponent],
  exports: [PurchaseOrderEditFormComponent],
})
export class PurchaseOrderEditFormModule {}
