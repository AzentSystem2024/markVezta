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
  DxFormModule,
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

@Component({
  selector: 'app-purchase-order-new-form',
  templateUrl: './purchase-order-new-form.component.html',
  styleUrls: ['./purchase-order-new-form.component.scss'],
})
export class PurchaseOrderNewFormComponent implements OnInit {
  @Input() refreshPoNumber = false;
  @Output() netAmountChange = new EventEmitter<any>();
  @Output() netSupplierAmountChange = new EventEmitter<any>();
  @Output() netQuantityChange = new EventEmitter<number>();
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
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

  constructor(private service: DataService, private router: Router) {
    const settingsData = sessionStorage.getItem('settings');
    this.settingsData = settingsData ? JSON.parse(settingsData) : null;
    // Access CURRENCY_ID
    // this.localCurrencyId = this.settingsData
    //   ? this.settingsData.CURRENCY_ID
    //   : null;
    // console.log(this.localCurrencyId, 'CURRENCY_ID');
    // this.localCurrencyCode = this.settingsData
    //   ? this.settingsData.CURRENCY_SYMBOL
    //   : null;
  }

  width = '97vw';
  height = '420px';
  tabs = [{ text: 'Header' }, { text: 'Detail' }, { text: 'History' }];

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

  poData: any = {
    ID: 0,
    COMPANY_ID: 1,
    USER_ID: 1,
    STORE_ID: '',
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
    PoDetails: [],
  };
  newPoData = this.poData;
  getNewPoData = () => ({ ...this.newPoData });

  highlightEditableColumns(event: any) {
    if (event.rowType === 'data' && event.column.allowEditing) {
      // Apply a custom style for editable cells
      event.cellElement.style.backgroundColor = '#7ca8e2ff'; // Soft yellow background
      event.cellElement.style.color = '#000000ff'; // Dark yellow text
      event.cellElement.style.fontWeight = 'bold';
    }
  }

  ngOnChanges() {
    if (this.refreshPoNumber) {
      this.getPoNumber();
    }
  }

  // Validate if supplier is selected
  validateSupplier() {
    this.savedItems = [];
    this.isSupplierValid = !!this.newPoData.SUPP_ID; // Set to true if a supplier is selected, false otherwise

    this.isSupplierTouched = true;

    this.getSupplierByid();

    console.log(this.supplierItems, 'supplier list by click');
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

  getSupplierByid() {
    this.service
      .getSupplierItemsData(this.newPoData.SUPP_ID)
      .subscribe((res) => {
        this.supplierItems = res;
        this.newPoData.CURRENCY_ID = this.supplierItems[0].CURRENCY_ID;
        this.SupplierCurrency = this.supplierItems[0].CURRENCY_NAME;
        this.SupplierCurrencyCode = this.supplierItems[0].CURRENCY_CODE;
        this.SupplierCurrencySymbol = this.supplierItems[0].CURRENCY_SYMBOL;
        this.supplierMail = this.supplierItems[0].SUPPLIER_MAIL;

        this.newPoData.EXCHANGE_PRICE = this.supplierItems[0].EXCHANGE;
        this.vatRule = this.supplierItems[0].VAT_RULE_NAME;

        this.showLocalCurrencyColumn =
          this.localCurrencyId !== this.newPoData.CURRENCY_ID;

        console.log(this.supplierItems, 'supplier items');
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
    this.selectedItems = event.selectedRowsData;
  }

  saveSelectedData() {
    console.log('SAVE CALLINGGGGGGGGGGGGGGG');
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
        ? (supplierPrice / this.newPoData.EXCHANGE_PRICE).toFixed(2)
        : item.PURCH_PRICE;

      console.log(purchPrice, 'PurchPrice');

      // Parse numeric fields and fallback to 0 if undefined or NaN
      const taxable = parseFloat(item.taxable) || 0;
      const vatAmount = parseFloat(item.vatAmount) || 0;
      const total = parseFloat(item.total) || 0;
      const supplierAmount = parseFloat(item.supplierAmount) || 0;

      return {
        ...item,
        slNo: this.savedItems.length + index + 1, // Serial number starting from existing items
        SUPP_PRICE: parseFloat(supplierPrice), // Update SUPP_PRICE based on currency check
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
        (savedItem) => savedItem.ITEM_ID === newItem.ITEM_ID
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
    this.getPoNumber();

    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    this.menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log(
      'Parsed ObjectData:',
      this.menuResponse.GeneralSettings.STORE_TITLE
    );
    this.storeOrLocation = this.menuResponse.GeneralSettings.STORE_TITLE;
    // this.sessionData_tax()
    const menuGroups = this.menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }
    this.currentDate = new Date();
    this.GetSupplierList();
    this.GetStoresList();
    this.GetDeliveryTermsList();
    this.GetPaymentTermsList();
    this.GetEmployeeList();
    // this.getPoHistoryList();
  }
  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }
  calculateTotalQuantity() {
    this.totalQuantity = this.savedItems.reduce(
      (sum, item) => sum + Number(item.qtyOrdered || 0),
      0
    );
    this.netQuantityChange.emit(this.totalQuantity);
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
            (item.SUPP_PRICE / this.newPoData.EXCHANGE_PRICE).toFixed(2)
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
        item.SUPP_AMOUNT = Number(
          (qtyOrdered * updatedRow.SUPP_PRICE).toFixed(2)
        );

        // Calculate Discount Amount only if discountPercentage is valid
        if (
          updatedRow.discountPercentage &&
          updatedRow.discountPercentage > 0
        ) {
          item.discountAmount = parseFloat(
            (item.Amount * (updatedRow.discountPercentage / 100)).toFixed(2)
          );
        } else {
          item.discountAmount = 0; // Set to 0 if no valid discount percentage
        }

        // Calculate Taxable Amount as Amount - Discount Amount
        item.taxable = parseFloat(
          (item.Amount - item.discountAmount).toFixed(2)
        );

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
            ).toFixed(2)
          );
        } else {
          discSupplierAmount = 0; // Set to 0 if no valid discount percentage
        }

        // Calculate Taxable Supplier based on SUPP_PRICE in the supplier's currency
        item.taxable_Supplier = parseFloat(
          (qtyOrdered * item.SUPP_PRICE - discSupplierAmount).toFixed(2)
        );

        // Calculate VAT Amount if VAT percentage is provided
        if (updatedRow.VAT_PERC && updatedRow.VAT_PERC > 0) {
          item.vatAmount = parseFloat(
            (item.taxable * (updatedRow.VAT_PERC / 100)).toFixed(2)
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
        PRICE: item.PURCH_PRICE,
        AMOUNT: item.Amount,
        DISC_PERCENT: updatedRow.discountPercentage,
        TAX_PERCENT: updatedRow.VAT_PERC,
        TAX_AMOUNT: item.vatAmount,
        TOTAL_AMOUNT: item.total,
        ITEM_DESC: item.DESCRIPTION,
        UOM: item.UOM,
        SUPP_PRICE: item.SUPP_PRICE,
        SUPP_AMOUNT: item.SUPP_AMOUNT,
      };

      // Check if the item already exists in PoDetails
      const detailItemIndex = this.poData.PoDetails.findIndex(
        (detailItem: any) => detailItem.ITEM_ID === item.ITEM_ID
      );

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
    console.log(event, 'event');
    const itemId = event.key.ITEM_ID;
    this.loadPurchaseOrders(itemId);

    if (this.expandedRowKey !== null && this.expandedRowKey !== event.key) {
      event.component.collapseRow(this.expandedRowKey);
    }
    this.expandedRowKey = event.key;
  }

  loadPurchaseOrders(itemId: string) {
    this.service.getLast5PoItemsList(itemId).subscribe((data: any[]) => {
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

  getPoHistoryList() {
    this.service.getPurchaseOrderHistoryList().subscribe((res: any) => {
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
    options: Parameters<DxDataGridTypes.Summary['calculateCustomSummary']>[0]
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
      ISSUED_EMP_ID: '0',
      PoDetails: [],
      ...defaultDates, // Preserve the date values
    };

    console.log('Form data cleared, dates retained:', this.newPoData);
  }

  onCancelNewData() {
    console.log('================================================');
    this.resetForm();
    // reset validation state
    this.newPoData = {}; // or a default object with empty values
    this.savedItems = [];
    this.isSupplierTouched = false;
    this.isSupplierValid = true;
    // this.resetForm();        // optional: clear form data
    this.showAddItemPopup = false; // 🔥 close popup
  }



  // Parent component
  resetForm() {
    console.log('RESET FORM CALLEDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD');
    this.isSupplierTouched = false;
    this.isSupplierValid = true;
    this.newPoData = {
      PO_NO: '',
      PO_DATE: new Date(),
      DELIVERY_DATE: new Date(),
      REF_NO: '',
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
      // DELIVERY_DATE: null,
      DELIVERY_DESC: '',
      NOTES: '',
      NARRATION: '',
      ISSUED_EMP_ID: null,
      SUPP_GROSS_AMOUNT: 0,
      GROSS_AMOUNT: 0,
      TAX_AMOUNT: 0,
      SUPP_NET_AMOUNT: 0,
      NET_AMOUNT: 0,
    };
    this.SupplierCurrency = '';
    this.vatRule = '';
    this.supplierMail = '';
    this.savedItems = [];

    // ✅ Reset dxForm if available
    if (this.poData?.instance) {
      this.poData.instance.resetValues();
      this.poData.instance.option('formData', { ...this.newPoData });
    }

    // ✅ Reset dxDataGrid explicitly
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.option('dataSource', this.savedItems);
      this.dataGrid.instance.refresh();
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
    DxValidatorModule,
    DxProgressBarModule,
    DxTabsModule,
    DxTabPanelModule,
    DxPopupModule,
    DxButtonModule,
    DxDropDownBoxModule,
  ],
  providers: [],
  declarations: [PurchaseOrderNewFormComponent],
  exports: [PurchaseOrderNewFormComponent],
})
export class PurchaseOrderNewFormModule {}
