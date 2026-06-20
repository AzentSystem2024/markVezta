import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  BrowserModule,
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
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
  DxTabsModule,
  DxTabPanelModule,
  DxPopupModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import { FormTextboxModule } from 'src/app/components';
import { PurchaseOrderVerifyFormComponent } from '../purchase-order-verify-form/purchase-order-verify-form.component';
import { DataService } from 'src/app/services';
import jsPDF from 'jspdf';
import autoTable, { ThemeType, UserOptions } from 'jspdf-autotable';
import CountryList from 'country-list-with-dial-code-and-flag';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchase-order-view-form',
  templateUrl: './purchase-order-view-form.component.html',
  styleUrls: ['./purchase-order-view-form.component.scss'],
})
export class PurchaseOrderViewFormComponent implements OnChanges {
  @Output() netViewAmountChange = new EventEmitter<any>();
  @Output() netViewSupplierAmountChange = new EventEmitter<any>();
  @Output() netViewQuantityChange = new EventEmitter<number>();
  @Output() showSupplierAmount = new EventEmitter<any>();

  @Input() formdata: any;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @Input() poId!: number;
  transID: any;
  HSN_CODE: any;
  GST_PERC: any;
  selected_Company_id: any;
  isInterState: boolean;
  isIntraState: boolean;
  logoBase64: string;

  supplierCountryCode: string = '';
  shippingCountryCode: string = '';
  countryCodes: any[] = [];
  isDropdownOpen: boolean = false;

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
  allowEditing: boolean = true;
  selectedRowKeys: any[] = []; // Keys of items to be preselected
  supplierMail: any;
  fileData: string = '';

  pdfSrc: SafeResourceUrl | null = null;
  isPdfPopupVisible: boolean = false;

  fileDetails: any = {
    DOC_ID: '',
    DOC_TYPE: 1,
    fileName: '',
    fileUrl: '',
    remarks: '',
  };
  uploadedFileName: string = '';
  showPopup: boolean = false;
  poHistoryList: any;

  poData: any = {
    COMPANY_ID: 1,
    STORE: '',
    STORE_ID: '',
    SUPP_NAME: '',
    PO_NO: '',
    PO_DATE: new Date(),
    SUPP_ID: '',
    SUPP_CONTACT: '',
    SUPP_ADDRESS: '',
    SUPP_MOBILE: '',
    REF_NO: '',
    CURRENCY_ID: '',
    PAY_TERM_ID: '',
    PAY_TERM: '',
    DELIVERY_TERM: '',
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
    PoDetails: [],
  };
  newPoData = this.poData;
  menuResponse: any;
  vatTitle: any;
  storeOrLocation: any;
  logoImg: string;
  PoID: any;

  constructor(
    private service: DataService,
    private sanitizer: DomSanitizer,
    private router: Router,
  ) {
    const settingsData = sessionStorage.getItem('settings');
    this.settingsData = settingsData ? JSON.parse(settingsData) : null;
    // Access CURRENCY_ID
    // this.localCurrencyId = this.settingsData ? this.settingsData.CURRENCY_ID : null;
    // console.log(this.localCurrencyId, "CURRENCY_ID");
    // this.localCurrencyCode= this.settingsData ? this.settingsData.CURRENCY_SYMBOL : null;
  }

  getNewPoData = () => ({ ...this.newPoData });

  getCountryCodeList() {
    const codes = CountryList.getAll();

    this.countryCodes = codes.map((country: any) => ({
      data: country.data,
    }));
  }

  countryCodeDisplay = (item: any) => {
    return item
      ? this.isDropdownOpen
        ? `${item.data.flag} ${item.data.dial_code} - ${item.data.name}`
        : `${item.data.flag}`
      : '';
  };

  extractSupplierCountryCode() {
    if (!this.newPoData.SUPP_MOBILE) return;

    const parts = this.newPoData.SUPP_MOBILE.split('-');

    if (parts.length === 2) {
      this.supplierCountryCode = '+' + parts[0];
      this.newPoData.SUPP_MOBILE = parts[1];
    }
  }

  extractShippingCountryCode() {
    if (!this.newPoData.CONTACT_MOBILE) return;

    const parts = this.newPoData.CONTACT_MOBILE.split('-');

    if (parts.length === 2) {
      this.shippingCountryCode = '+' + parts[0];
      this.newPoData.CONTACT_MOBILE = parts[1];
    }
  }

  highlightEditableColumns(event: any) {
    if (event.rowType === 'data' && event.column.allowEditing) {
      // Apply a custom style for editable cells
      event.cellElement.style.backgroundColor = '#fff3cd'; // Soft yellow background
      event.cellElement.style.color = '#856404'; // Dark yellow text
      event.cellElement.style.fontWeight = 'bold';
    }
  }
  // Validate if supplier is selected
  validateSupplier() {
    this.isSupplierValid = !!this.newPoData.SUPP_ID; // Set to true if a supplier is selected, false otherwise

    console.log(this.supplierItems, 'supplier list by click');
  }

  // Handler for Add Item button
  onAddItemClick() {
    this.validateSupplier();
    if (this.isSupplierValid) {
      // Show add item popup if supplier is selected
      this.showAddItemPopup = true;

      console.log(this.selectedSupplierId, 'selected supplier id');

      console.log(this.supplierItems, 'supplier items');
    }
  }

  getSupplierByid(suppid: any) {
    this.service.getSupplierItemsData(suppid).subscribe((res) => {
      this.supplierItems = res;
      this.newPoData.CURRENCY_ID = this.supplierItems[0].CURRENCY_ID;
      this.SupplierCurrency = this.supplierItems[0].CURRENCY_NAME;
      this.SupplierCurrencyCode = this.supplierItems[0].CURRENCY_CODE;
      this.SupplierCurrencySymbol = this.supplierItems[0].CURRENCY_SYMBOL;
      this.supplierMail = this.supplierItems[0].SUPPLIER_MAIL;

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
    this.selectedRowKeys = event.selectedRowKeys;
    this.selectedItems = event.selectedRowsData;
  }

  saveSelectedData() {
    // Map over selectedItems to create new items with updated values
    const newItems = this.selectedItems.map((item, index) => {
      // Determine if supplier currency differs from local currency
      const useSupplierPrice =
        this.SupplierCurrencyCode !== this.localCurrencyCode;
      console.log(useSupplierPrice, 'useSupplierPrice');

      // Supplier price logic: Use PURCH_PRICE if currencies differ
      const supplierPrice = useSupplierPrice ? item.PURCH_PRICE : 0;
      console.log(supplierPrice, 'supplierPrice');

      // Calculate PURCHASE price when currencies differ
      const purchPrice = useSupplierPrice
        ? (supplierPrice / this.currencyExchangeRate).toFixed(2)
        : item.PURCH_PRICE;

      // Parse numeric fields and fallback to 0 if undefined or NaN
      const taxable = parseFloat(item.taxable) || 0;
      const vatAmount = parseFloat(item.vatAmount) || 0;
      const total = parseFloat(item.total) || 0;
      const supplierAmount = parseFloat(item.supplierAmount) || 0;

      return {
        ...item,
        slNo: this.savedItems.length + index + 1, // Serial number starting from existing items
        SUPP_PRICE: supplierPrice, // Update SUPP_PRICE based on currency check
        PURCH_PRICE: parseFloat(purchPrice), // Ensure consistent numeric value
        supplierAmount,
        taxable,
        vatAmount,
        total,
      };
    });

    // Filter out items that already exist in savedItems based on ITEM_ID or another unique identifier
    const filteredNewItems = newItems.filter((newItem) => {
      // Check if item already exists in savedItems by ITEM_ID or another unique identifier
      return !this.savedItems.some(
        (savedItem) => savedItem.ITEM_ID === newItem.ITEM_ID,
      );
    });

    // Merge existing items (from ngOnChanges) with non-duplicate new items
    this.savedItems = [...this.savedItems, ...filteredNewItems];

    // Log the updated savedItems array for debugging
    console.log(this.savedItems, 'savedItems');

    // Update the UI state
    this.selectedTabIndex = 1; // Switch to the tab showing saved items
    this.showAddItemPopup = false; // Close the "Add Item" popup
  }
  ngOnInit() {
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    this.menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    console.log(
      'Parsed ObjectData:',
      this.menuResponse.GeneralSettings.STORE_TITLE,
    );
    this.vatTitle = this.menuResponse.GeneralSettings.VAT_TITLE;
    this.storeOrLocation = this.menuResponse.GeneralSettings.STORE_TITLE;
    // this.sessionData_tax()
    const menuGroups = this.menuResponse.MenuGroups || [];
    this.currentDate = new Date();
    this.sessionDetails();
    this.GetSupplierList();
    this.GetStoresList();
    this.GetDeliveryTermsList();
    this.GetPaymentTermsList();
    this.GetEmployeeList();
    const imagePath = 'assets/markLogo.jpg';
    this.convertToBase64(imagePath).then((base64) => {
      this.logoBase64 = base64;
    });
    this.loadLogo().then((img) => {
      this.logoImg = img;
    });
    this.getCountryCodeList();
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

  calculateTotalQuantity() {
    this.totalQuantity = this.savedItems.reduce(
      (sum, item) => sum + Number(item.qtyOrdered || 0),
      0,
    );
    this.netViewQuantityChange.emit(this.totalQuantity);
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
    this.netViewAmountChange.emit(amountToEmitInLocalCurrency); // Emit NET_AMOUNT with the currency

    // Emit SUPP_NET_AMOUNT with the supplier currency symbol
    this.netViewSupplierAmountChange.emit(amountToEmitInSupplierCurrency); // Emit SUPP_NET_AMOUNT with the supplier currency symbol
  }

  updateAmount(e: any) {
    const updatedRow = e.data; // Get the updated row data

    // Find the specific item in savedItems
    const item = this.savedItems.find((i) => i.slNo === updatedRow.slNo);

    if (item) {
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
            (item.SUPP_PRICE / this.currencyExchangeRate).toFixed(2),
          );
        } else {
          // Use the manually updated PURCH_PRICE directly
          item.PURCH_PRICE = updatedRow.PURCH_PRICE || 0;
        }
      }

      // Only calculate if qtyOrdered is greater than 0
      if (qtyOrdered > 0) {
        // Calculate Amount based on qtyOrdered and Cost (PURCH_PRICE)
        item.Amount = Number((qtyOrdered * updatedRow.PURCH_PRICE).toFixed(2));

        // Calculate Discount Amount only if discountPercentage is valid
        if (
          updatedRow.discountPercentage &&
          updatedRow.discountPercentage > 0
        ) {
          item.discountAmount = parseFloat(
            (item.Amount * (updatedRow.discountPercentage / 100)).toFixed(2),
          );
        } else {
          item.discountAmount = 0; // Set to 0 if no valid discount percentage
        }

        // Calculate Taxable Amount as Amount - Discount Amount
        item.taxable = parseFloat(
          (item.Amount - item.discountAmount).toFixed(2),
        );
        console.log(item.taxable, '--====TAXABLEEEEEEEEEE');
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
        if (updatedRow.VAT_PERC && updatedRow.VAT_PERC > 0) {
          item.vatAmount = parseFloat(
            (item.taxable * (updatedRow.VAT_PERC / 100)).toFixed(2),
          );
        } else {
          item.vatAmount = 0; // Set to 0 if no valid VAT percentage
        }

        // Calculate Total as Taxable Amount + VAT Amount
        item.total_Supplier = item.taxable_Supplier;
        item.total = parseFloat((item.taxable + item.vatAmount).toFixed(2));
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
        RATE: item.PURCH_PRICE,
        AMOUNT: item.Amount,
        DISC_PERCENT: updatedRow.discountPercentage,
        TAX_PERCENT: updatedRow.VAT_PERC,
        TAX_AMOUNT: item.vatAmount,
        TOTAL_AMOUNT: item.total,
        ITEM_DESC: item.DESCRIPTION,
        UOM: item.UOM,
        SUPP_PRICE: '',
        SUPP_AMOUNT: '',
      };

      // Check if the item already exists in PoDetails
      const detailItemIndex = this.poData.PoDetails.findIndex(
        (detailItem: any) => detailItem.ITEM_ID === item.ITEM_ID,
      );

      if (detailItemIndex !== -1) {
        // If item already exists in PoDetails, update it
        this.poData.PoDetails[detailItemIndex] = { ...detailItem };
      } else {
        // If item does not exist, add it to PoDetails
        this.poData.PoDetails.push({ ...detailItem });
      }
    }
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

  GetSupplierList() {
    this.service.getDropdownData('SUPPLIER').subscribe((res) => {
      this.SupplierList = res;
    });
  }

  GetStoresList() {
    this.service.getDropdownData('STORE').subscribe((res) => {
      this.StoreList = res;
    });
  }

  GetDeliveryTermsList() {
    this.service.getDropdownData('DELIVERYTERMS').subscribe((res) => {
      this.deliveryTermsList = res;
    });
  }

  GetPaymentTermsList() {
    this.service.getDropdownData('PAYMENTTERMS').subscribe((res) => {
      this.paymentTermsList = res;
    });
  }

  GetEmployeeList() {
    this.service.getDropdownData('EMPLOYEE').subscribe((res) => {
      this.employeeList = res;
    });
  }

  onRowClick(event: any) {
    const itemId = event.data.ITEM_ID;
    this.loadPurchaseOrders(itemId);
  }

  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.HSN_CODE = sessionData.GeneralSettings.HSN_CODE;

    this.GST_PERC = sessionData.GeneralSettings.GST_PERC;

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
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

  formatPoDate(rowData: any): string {
    const celldate = rowData.PO_DATE;
    if (!celldate) return '';

    const date = new Date(celldate);

    // Format the date using the user's system locale
    const formattedDate = date.toLocaleDateString(); // Formats according to the user's system date format

    return formattedDate; // Return only the date part
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.formdata && changes.formdata.currentValue) {
      this.transID = this.formdata.TRANS_ID;
      this.fileDetails.DOC_ID = this.formdata.ID;
      this.PoID = this.formdata.ID;
      this.newPoData = { ...this.formdata };
      console.log(this.newPoData.CURRENCY_SYMBOL, 'CURRENCYSYMBOLLLLLLLLLL');
      this.newPoData.PoDetails = this.formdata.PoDetails || [];
      this.SupplierCurrencySymbol =
        this.newPoData.CURRENCY || this.newPoData.CURRENCY_SYMBOL || '';
      this.extractSupplierCountryCode();
      this.extractShippingCountryCode();

      // STEP 1: DETERMINE GST MODE FROM FIRST ROW
      const firstDetail = this.newPoData.PoDetails[0];

      if (firstDetail) {
        if (Number(firstDetail.TAX_PERCENT) > 0) {
          // IGST
          this.isInterState = true;
          this.isIntraState = false;
        } else {
          // CGST + SGST
          this.isInterState = false;
          this.isIntraState = true;
        }
      }

      // STEP 2: MAP ITEMS (GST LOGIC FIXED)
      // STEP 2: MAP ITEMS (USE SUPP_AMOUNT AS TAXABLE)
      this.savedItems = this.newPoData.PoDetails.map((item, index) => {
        // const taxable = Number(item.SUPP_AMOUNT || 0); // 🔥 Use SUPP_AMOUNT directly
        const suppAmount = Number(item.SUPP_AMOUNT || 0);
        const baseAmount = item.QUANTITY * item.SUPP_PRICE; //====10*20=== 200
        const discountAmount = (baseAmount * (item.DISC_PERCENT || 0)) / 100; //=== 200*20/100=40

        const discountPercentage = Number(item.DISC_PERCENT || 0);
        const taxable = baseAmount - discountAmount;

        // const taxable = suppAmount - (suppAmount * discountPercentage) / 100;
        const vatPerc = Number(item.VAT_PERC || 0);

        const vatAmount = Number(item.TAX_AMOUNT || 0);

        return {
          ITEM_ID: item.ITEM_ID,
          slNo: index + 1,

          ITEM_CODE: item.ITEM_CODE,
          DESCRIPTION: item.ITEM_DESC,
          UOM: item.UOM,
          PACKING_NAME: item.PACKING,

          SUPP_PRICE: Number(item.SUPP_PRICE || 0),
          PURCH_PRICE: Number(item.PRICE || 0),

          qtyOrdered: Number(item.QUANTITY || 0),

          discountPercentage: Number(item.DISC_PERCENT || 0),

          taxable: taxable, // 🔥 Bind SUPP_AMOUNT
          VAT_PERC: vatPerc,

          vatAmount: vatAmount,
          SUPP_AMOUNT: item.SUPP_AMOUNT,
          total: Number(item.TOTAL_AMOUNT || 0),
          HSN_CODE: item.HSN_CODE,
        };
      });

      // STEP 3: FORCE GRID TO REPAINT
      setTimeout(() => {
        this.dataGrid?.instance?.repaint();
      }, 0);

      // EXISTING CALLS (UNCHANGED)
      this.getSupplierByid(this.newPoData.SUPP_ID);
      this.getAttachmentList();
      this.getPoHistoryList();

      this.calculateTotalQuantity();
      this.calculateTotalIncludingTax();
    }
  }

  formatSupplierPrice = (cellInfo: any) => {
    const symbol = this.newPoData?.CURRENCY_SYMBOL || '';

    const price = Number(cellInfo.value || 0).toFixed(2);

    return symbol ? `${symbol} ${price}` : price;
  };

  // formatTotalAmount = (data: any) => {
  //   const symbol = this.newPoData?.CURRENCY_SYMBOL || '';

  //   console.log('Currency Symbol:', symbol);

  //   console.log('Total Value:', data.value);

  //   const formattedValue = Number(data.value || 0).toLocaleString('en-IN', {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   });

  //   return symbol ? `${symbol} ${formattedValue}` : formattedValue;
  // };

  formatTotalAmount = (data: any) => {
    const symbol = this.SupplierCurrencySymbol || '';

    const formattedValue = Number(data.value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return symbol ? `${symbol} ${formattedValue}` : formattedValue;
  };

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

  getAttachmentList() {
    const docId = this.fileDetails.DOC_ID;
    const docType = this.fileDetails.DOC_TYPE;
    console.log(docId, docType, 'docid and doctype');
    this.service.getAttachmentList(docId, docType).subscribe((res: any) => {
      this.uploadedFiles = res.data;
    });
  }

  // get formattedDate(): string {
  //   if (this.newPoData.PO_DATE) {
  //     return this.newPoData.PO_DATE.split('T')[0]; // Extract the date part
  //   }
  //   return '';
  // }
  get formattedDate(): string {
    if (!this.newPoData.PO_DATE) return '';

    const date = new Date(this.newPoData.PO_DATE);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }
  viewPdf(): void {
    console.log(this.poId, 'ID received in viewPdf()');

    // this.isPdfPopupVisible = true;

    this.service.selectPoData(this.poId).subscribe((res) => {
      console.log(res, 'Selected response');

      // if (res) {
      //   this.pdfSrc = this.get_pdf(res);
      // }
      this.get_pdf(res);
    });
  }
  getFormattedSupplierPrice = (rowData: any) => {
    const symbol = rowData?.CURRENCY_SYMBOL || '';
    const price = Number(rowData?.SUPP_PRICE || 0).toFixed(2);

    return symbol ? `${symbol} ${price}` : price;
  };
  get_pdf(data: any) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let y = 10;

    // ======================================================
    // LOGO LEFT TOP
    // ======================================================
    const logoX = 18,
      logoY = 12,
      logoW = 30,
      logoH = 30;
    doc.setFillColor(225, 225, 225);
    doc.rect(logoX, logoY, logoW, logoH, 'F');
    doc.addImage(this.logoBase64, 'jpg', logoX, logoY, logoW, logoH);

    // ===============================================
    // SALES INVOICE HEADING (Centered between logo & reference block)
    // ===============================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);

    // compute a centered X between left logo and right reference area
    const leftEdge = 10 + logoW; // end of logo box
    const rightEdge = pageWidth - 80; // start of reference block
    const centerX = (leftEdge + rightEdge) / 2;

    doc.text('PURCHASE ORDER', centerX, y + 25, { align: 'center' });

    // ======================================================
    // RIGHT-TOP HEADER (Debit Note Info)
    // ======================================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    const refX = pageWidth - 65; // moved 15mm right

    doc.text(`Invoice No : ${data.DISTRIBUTOR_ID || ''}`, refX, y + 5);
    doc.text(`Reference No : ${data.REF_NO || ''}`, refX, y + 11);
    doc.text(`Date: ${data.PO_DATE || ''}`, refX, y + 17);

    // doc.text(`Dated : ${data[0].SALE_DATE || ""}`, pageWidth - 80, y + 23);

    y += 33;

    // ===============================================
    // HORIZONTAL LINE ABOVE SELLER + CUSTOMER BLOCKS
    // ===============================================
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, y, pageWidth - 10, y); // full width line

    y += 5; // small spacing

    // ======================================================
    // BLUE SELLER BOX (LEFT)
    // ======================================================
    const blueX = 10;
    const blueY = y;
    const blueW = 100;
    const blueH = 38;

    doc.setFillColor(204, 229, 255);
    doc.rect(blueX, blueY, blueW, blueH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(data.COMPANY_NAME || '', blueX + 3, blueY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(data.ADDRESS1 || '', blueX + 3, blueY + 13);
    doc.text(data.ADDRESS2 || '', blueX + 3, blueY + 18);
    doc.text(data.ADDRESS3 || '', blueX + 3, blueY + 23);
    doc.text(`GSTIN/UIN: ${data.GST_NO || ''}`, blueX + 3, blueY + 28);
    doc.text(
      `State : ${data.STATE || ''}, Code : ${data.STATE_CODE || ''}`,
      blueX + 3,
      blueY + 33,
    );
    doc.text(`E-Mail : ${data.EMAIL || ''}`, blueX + 3, blueY + 38);

    // ======================================================
    // CONSIGNEE (RIGHT SIDE)
    // ======================================================
    const shipX = 115;
    const shipY = y;

    doc.setFont('helvetica', 'bold');
    doc.text('Consignee (Ship to)', shipX, shipY + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(data.SUPP_NAME || '', shipX, shipY + 11);
    doc.text(data.SUPP_ADDRESS1 || '', shipX, shipY + 16);
    doc.text(data.SUPP_ADDRESS2 || '', shipX, shipY + 21);
    doc.text(data.SUPP_ADDRESS3 || '', shipX, shipY + 26);
    doc.text(`GSTIN/UIN : ${data.CIN || ''}`, shipX, shipY + 31);
    doc.text(
      `State : ${data.CUST_STATE || ''}, Code : ${data.STATE_CODE || ''}`,
      shipX,
      shipY + 36,
    );

    y += 48;

    // ======================================================
    // BUYER (BILL TO)
    // ======================================================
    const billX = 115;
    const billY = y;

    doc.setFont('helvetica', 'bold');
    doc.text('Buyer (Bill to)', billX, billY + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(data.SUPP_NAME || '', billX, billY + 11);
    doc.text(data.SUPP_ADDRESS1 || '', billX, billY + 16);
    doc.text(data.SUPP_ADDRESS2 || '', billX, billY + 21);
    doc.text(data.SUPP_ADDRESS3 || '', billX, billY + 26);
    doc.text(`GSTIN/UIN : ${data.CIN || ''}`, billX, billY + 31);
    doc.text(
      `State : ${data.CUST_STATE || ''}, Code : ${data.STATE_CODE || ''}`,
      billX,
      billY + 36,
    );

    y += 50;

    // ======================================================
    // TABLE — SAME FORMAT AS IMAGE
    // ======================================================
    const tableColumns = [
      'Item Code',
      'Item Description',
      'UOM',
      'Packing',
      'Price',
      'Quantity',
      'Discount(%)',
      'Taxable',
      'CGST(%)',
    ];

    const tableRows: any[] = [];
    const footerRow = [
      '',
      '',
      '',
      '',
      '₹ ' + Number(data.GROSS_AMOUNT).toFixed(2), // 5  (Amount)
      '',
      '',
      '',
    ];

    data.PoDetails.forEach((item: any, index: number) => {
      tableRows.push([
        // index + 1,
        item.ITEM_CODE || '',
        item.ITEM_DESC || '',
        item.UOM || '',
        item.PACKING || '',
        item.PRICE?.toFixed(2) || '',
        item.QUANTITY || '',
        item.DISC_PERCENT || '',
        item.HSN_CODE || '',
        item.CGST || '',
      ]);
    });
    // Move y to bottom of Bill-to block
    y = y + 2;

    // ===============================
    // HORIZONTAL LINE LIKE THE FIGURE
    // ===============================
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, y, pageWidth - 10, y); // Full width horizontal line

    y += 5; // small gap before table
    (doc as any).autoTable({
      startY: y,
      head: [tableColumns],
      body: tableRows,
      foot: [footerRow],
      theme: 'grid',
      margin: { left: 10, right: 10 },
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: 0,
        halign: 'center',
      },
      footStyles: {
        fillColor: [230, 230, 230], // same color as header
        textColor: 0,
        fontStyle: 'bold',
        halign: 'right',
      },
      columnStyles: {
        5: { halign: 'right' }, // Amount column
        9: { halign: 'right' }, // Total column
      },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // ============================================================
    // FOOTER – GST SUMMARY + TOTALS (LIKE generatePDF)
    // ============================================================

    const footStartY = y + 3;

    // ---------------- LEFT GST SUMMARY ----------------
    let lx = 15;
    let ly = footStartY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    // Header
    doc.text('GST %', lx, ly);
    doc.text('Taxable Value', lx + 22, ly);
    doc.text('Integrated Tax', lx + 55, ly);
    doc.text('Total Tax Amount', lx + 95, ly);

    // Sub headers
    doc.setFontSize(8);
    doc.text('Rate', lx + 55, ly + 5);
    doc.text('Amount', lx + 72, ly + 5);

    // Values
    ly += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const taxable = Number(data.GROSS_AMOUNT || 0);
    const gstAmount = Number(data.TAX_AMOUNT || 0);
    const gstPerc =
      Number(data.PoDetails?.CGST || 0) + Number(data.PoDetails?.SGST || 0);

    doc.text(gstPerc.toFixed(2) + '%', lx, ly);
    doc.text(taxable.toFixed(2), lx + 22, ly);
    doc.text(gstPerc.toFixed(2) + '%', lx + 55, ly);
    doc.text(gstAmount.toFixed(2), lx + 72, ly);
    doc.text(gstAmount.toFixed(2), lx + 95, ly);

    // Total row
    ly += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(taxable.toFixed(2), lx + 22, ly);
    doc.text(gstAmount.toFixed(2), lx + 72, ly);
    doc.text(gstAmount.toFixed(2), lx + 95, ly);

    // ---------------- RIGHT TOTAL SUMMARY ----------------
    let rx = pageWidth - 65;
    let ry = footStartY;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const labelX = rx;
    const colonX = rx + 30;
    const valueX = rx + 40;

    doc.text('Taxable Value', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(taxable.toFixed(2), valueX, ry);

    ry += 6;
    doc.text('Total Tax', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(gstAmount.toFixed(2), valueX, ry);

    ry += 6;
    doc.text('Round Off', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text('0.00', valueX, ry);

    ry += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Total', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(Number(data.NET_AMOUNT).toFixed(2), valueX, ry);

    // ---------------- REVERSE CHARGE ----------------
    let wordsY = ry + 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Whether the tax is payable on Reverse charge basis:', 15, wordsY);

    doc.setFont('helvetica', 'normal');
    doc.text('No', 150, wordsY);

    // ---------------- AMOUNT IN WORDS ----------------
    wordsY += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Amount in words :', 15, wordsY);

    doc.setFont('helvetica', 'normal');
    doc.text(
      `INR ${numberToWordsIndianNumber(Math.floor(data.NET_AMOUNT))} Rupees Only`,
      60,
      wordsY,
    );

    // ---------------- DECLARATION & REMARK ----------------
    let blockY = wordsY + 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Declaration :', 15, blockY);

    blockY += 10;
    doc.text('Remark :', 15, blockY);

    doc.setFont('helvetica', 'normal');
    doc.text(data.REF_NO || '', 40, blockY);
    // ===========================
    //  RETURN PDF
    // ===========================
    doc.output('dataurlnewwindow');
  }
  async loadLogo() {
    const response = await fetch('assets/images/dmgt_logo.jpeg');
    const blob = await response.blob();

    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }
  viewPdfDMGT(): void {
    console.log('PDFFFFFFFFFF');
    this.service.selectPoData(this.PoID).subscribe((res) => {
      this.generatePoPdf(res);
    });
  }
  formatAmount(value: any): string {
    return Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  generatePoPdf(data: any) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;

    // =========================
    // TITLE
    // =========================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PURCHASE ORDER', pageWidth / 2, 20, { align: 'center' });

    // underline
    doc.line(pageWidth / 2 - 24, 22, pageWidth / 2 + 24, 22);

    // =========================
    // LOGO (RIGHT)
    // =========================
    if (this.logoImg && this.logoImg.startsWith('data:image')) {
      // doc.addImage(this.logoImg, 'JPEG', pageWidth - 45, 10, 30, 22);
      doc.addImage(this.logoImg, 'JPEG', 10, 8, 35, 40);
    }

    // =========================
    // TEXT SETTINGS
    // =========================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    let y = 35;

    const labelX = 135;
    const colonX = 160;
    const valueX = 165;

    const yPos: any = {};

    // =========================
    // LEFT SIDE
    // =========================

    // PO NO
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 110, 130);
    doc.text('PO NO.', labelX, y);
    doc.text(':', colonX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(data.DOC_NO || '', valueX, y);
    yPos.po = y;

    // DATE
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 110, 130);
    doc.text('Date', labelX, y);
    doc.text(':', colonX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(this.formatDateToDDMMYYYY(data.PO_DATE), valueX, y);
    yPos.date = y;

    // SUPP VAT
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 110, 130);
    doc.text('Supp VAT', labelX, y);
    doc.text(':', colonX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('', valueX, y);
    yPos.suppVat = y;

    // STORE VAT
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 110, 130);
    doc.text('Store VAT', labelX, y);
    doc.text(':', colonX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(data.GST_NO || '', valueX, y);
    yPos.storeVat = y;

    // SUPPLIER
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 110, 130);
    doc.text('Supplier', labelX, y);
    doc.text(':', colonX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const supplierMaxWidth = 42;

    const supplierText = doc.splitTextToSize(
      data.SUPP_NAME || '',
      supplierMaxWidth,
    );

    doc.text(supplierText, valueX, y);

    yPos.supplier = y;

    // move Y based on line count
    y += supplierText.length > 1 ? supplierText.length * 4 : 4;

    // ADDRESS
    y += 3;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 110, 130);
    doc.text('Address', labelX, y);
    doc.text(':', colonX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const supplierAddressText = doc.splitTextToSize(
      data.SUPP_ADDRESS1 || '',
      40,
    );

    doc.text(supplierAddressText, valueX, y);

    yPos.address = y;

    y += supplierAddressText.length * 4;

    // =========================
    // RIGHT SIDE (FIXED)
    // =========================

    const rLabelX = 10;
    const rColonX = 42;
    const rValueX = 48;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 110, 130);
    // ship to → align with Store VAT row
    doc.text('ship to', rLabelX, yPos.storeVat);
    doc.text(':', rColonX, yPos.storeVat);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(data.COMPANY_NAME || '', rValueX, yPos.storeVat, {
      maxWidth: 75,
    });

    // Contact Person → align with Supplier
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 110, 130);
    doc.text('Contact Person', rLabelX, yPos.supplier);
    doc.text(':', rColonX, yPos.supplier);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(data.CONTACT_NAME || '', rValueX, yPos.supplier);

    // Contact No → align with Address
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90, 110, 130);
    doc.text('Contact No', rLabelX, yPos.address);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(data.CONTACT_MOBILE || '', rValueX, yPos.address);

    // =========================
    // TERMS TABLE (BORDERED)
    // =========================

    let tableStartY = yPos.address + 10;

    const termsColumns = [
      'Ship Method',
      'Payment Terms',
      'Currency',
      'Delivery Date',
      'Remarks (If any)',
    ];

    const termsData = [
      [
        data.DELIVERY_TERM || '',
        data.PAY_TERM || '',
        data.CURRENCY_NAME || '',
        this.formatDateToDDMMYYYY(data.DELIVERY_DATE) || '',
        data.NARRATION || '',
      ],
    ];

    autoTable(doc, {
      startY: tableStartY,
      head: [termsColumns],
      body: termsData,
      theme: 'plain',

      // ADD THIS (IMPORTANT)
      margin: { left: 10, right: 10 }, // reduce margins → table becomes wider

      tableWidth: 190, // or 'wrap' (see below)

      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: 'middle',
        halign: 'center',
        lineWidth: 0,
      },

      headStyles: {
        fontStyle: 'bold',
        fillColor: [217, 234, 249],
        textColor: 0,
        lineWidth: 0,
      },

      bodyStyles: {
        lineWidth: 0,
      },
    });

    const itemTableStartY = (doc as any).lastAutoTable.finalY + 8;

    const itemColumns = [
      'Item Code',
      'Description',

      'Qty',
      'Unit Price',
      // 'Discount %',
      'Taxable(Amt)',
      'VAT(%)',
      'VAT(Amt)',
      'Total Price',
    ];

    const itemData = data.PoDetails.map((item: any) => {
      const suppAmount = Number(item.SUPP_AMOUNT || 0);

      const discountPercentage = Number(item.DISC_PERCENT || 0);

      const taxable = suppAmount - (suppAmount * discountPercentage) / 100;

      return [
        item.ITEM_CODE || '',
        item.ITEM_DESC || '',

        item.QUANTITY || '',

        this.formatAmount(item.PRICE),

        // discountPercentage.toFixed(2),

        this.formatAmount(taxable),

        this.formatAmount(item.VAT_PERC),

        this.formatAmount(item.TAX_AMOUNT),

        this.formatAmount(item.TOTAL_AMOUNT),

        // Number(item.PRICE || 0).toFixed(2),

        // // discountPercentage.toFixed(2),

        // taxable.toFixed(2),

        // Number(item.VAT_PERC || 0).toFixed(2),

        // Number(item.TAX_AMOUNT || 0).toFixed(2),

        // Number(item.TOTAL_AMOUNT || 0).toFixed(2),
      ];
    });

    // underline

    const totalQty = data.PoDetails.reduce(
      (sum: number, item: any) => sum + Number(item.QUANTITY || 0),
      0,
    );

    const totalTaxable = data.PoDetails.reduce(
      (sum: number, item: any) => sum + Number(item.SUPP_AMOUNT || 0),
      0,
    );

    const totalVat = data.PoDetails.reduce(
      (sum: number, item: any) => sum + Number(item.TAX_AMOUNT || 0),
      0,
    );

    const totalPrice = data.PoDetails.reduce(
      (sum: number, item: any) => sum + Number(item.TOTAL_AMOUNT || 0),
      0,
    );

    autoTable(doc, {
      startY: itemTableStartY,
      head: [itemColumns],
      body: itemData,

      theme: 'plain',

      margin: { left: 10, right: 10 },

      tableWidth: 190,

      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: 'middle',
        lineWidth: 0,
      },

      columnStyles: {
        0: {
          cellWidth: 28,
          halign: 'left',
        },

        1: {
          cellWidth: 42,
          halign: 'left',
        },

        2: {
          cellWidth: 18,
          halign: 'center',
        },

        3: {
          cellWidth: 22,
          halign: 'center',
        },

        4: {
          cellWidth: 24,
          halign: 'center',
        },

        5: {
          cellWidth: 16,
          halign: 'center',
        },

        6: {
          cellWidth: 24,
          halign: 'center',
        },

        7: {
          cellWidth: 24,
          halign: 'center',
        },
      },

      headStyles: {
        fontStyle: 'bold',
        fillColor: [217, 234, 249],
        textColor: 0,
        lineWidth: 0,
      },

      bodyStyles: {
        lineWidth: 0,
      },
    });

    // =========================
    // TOTAL SECTION
    // =========================

    const finalY = (doc as any).lastAutoTable.finalY;

    // top line
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);

    doc.line(10, finalY + 3, 200, finalY + 3);

    // totals
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    doc.text('Total', 55, finalY + 10);

    doc.text(String(totalQty), 95, finalY + 10, {
      align: 'center',
    });

    doc.text(this.formatAmount(totalTaxable), 138, finalY + 10, {
      align: 'center',
    });

    doc.text(this.formatAmount(totalVat), 170, finalY + 10, {
      align: 'center',
    });

    doc.text(this.formatAmount(totalPrice), 198, finalY + 10, {
      align: 'center',
    });
    // =========================
    // FOOTER COMPANY DETAILS
    // =========================

    const footerY = doc.internal.pageSize.height - 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    // Address line
    const addressText = [data.ADDRESS1, data.ADDRESS2, data.ADDRESS3]
      .filter(Boolean)
      .join(', ');

    doc.text(addressText, pageWidth / 2, footerY, {
      align: 'center',
    });

    // Contact line
    const contactText = [data.CONTACT_MOBILE ? `T. ${data.CONTACT_MOBILE}` : '']
      .filter(Boolean)
      .join(' | ');

    doc.text(contactText, pageWidth / 2, footerY + 6, {
      align: 'center',
    });

    // Email / website line
    // Email / Website line
    // Email / Website line
    const emailWebsiteText = [
      data.EMAIL ? `E. ${data.EMAIL}` : '',
      'W. www.desert-memories.com',
    ]
      .filter(Boolean)
      .join(' | ');

    doc.text(emailWebsiteText, pageWidth / 2, footerY + 12, {
      align: 'center',
    });

    // Page number
    doc.text('Page 1 of 1', pageWidth - 20, footerY + 12);
    // =========================
    // OPEN PDF
    // =========================
    doc.output('dataurlnewwindow');
  }

  formatDateToDDMMYYYY(dateString: any): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // if invalid, return as is

    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    return `${dd}/${mm}/${yyyy}`;
  }
}

function numberToWordsIndianNumber(num: number) {
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

  if (num === 0) return 'Zero';

  let str = '';

  if (num >= 10000000) {
    str += numberToWordsIndianNumber(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    str += numberToWordsIndianNumber(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    str += numberToWordsIndianNumber(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  if (num >= 100) {
    str += numberToWordsIndianNumber(Math.floor(num / 100)) + ' Hundred ';
    num %= 100;
  }
  if (num > 0) {
    if (num < 20) str += a[num];
    else str += b[Math.floor(num / 10)] + ' ' + a[num % 10];
  }

  return str.trim();
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
  ],
  providers: [],
  declarations: [PurchaseOrderViewFormComponent],
  exports: [PurchaseOrderViewFormComponent],
})
export class PurchaseOrderViewFormModule {}
