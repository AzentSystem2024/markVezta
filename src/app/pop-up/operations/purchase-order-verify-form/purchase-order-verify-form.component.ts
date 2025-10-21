import { Component, EventEmitter, Input, NgModule, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxTabsModule, DxTabPanelModule, DxPopupModule } from 'devextreme-angular';
import { FormTextboxModule } from 'src/app/components';
import { PurchaseOrderEditFormComponent } from '../purchase-order-edit-form/purchase-order-edit-form.component';
import { DxDataGridComponent, DxDataGridTypes } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-purchase-order-verify-form',
  templateUrl: './purchase-order-verify-form.component.html',
  styleUrls: ['./purchase-order-verify-form.component.scss']
})
export class PurchaseOrderVerifyFormComponent implements OnChanges {

  @Output() netVerifyAmountChange = new EventEmitter<any>();
  @Output() netVerifySupplierAmountChange = new EventEmitter<any>();
  @Output() netVerifyQuantityChange = new EventEmitter<number>();
  @Output() showSupplierAmount = new EventEmitter<any>();
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  @Input() formdata: any;
  poHistoryList: any;

  constructor(private service:DataService){
    const settingsData=sessionStorage.getItem('settings');
    this.settingsData = settingsData ? JSON.parse(settingsData) : null;
    // Access CURRENCY_ID
    this.localCurrencyId = this.settingsData ? this.settingsData.CURRENCY_ID : null;
    console.log(this.localCurrencyId, "CURRENCY_ID");
    this.localCurrencyCode= this.settingsData ? this.settingsData.CURRENCY_SYMBOL : null;
  }

  width='97vw';
  height='420px';
  tabs = [
    { text: 'Header' },
    { text: 'Detail' },
    { text : 'Attachments'},
    { text: 'History' }
  ];

  readonly allowedPageSizes: any = [10, 50,100];
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
  SupplierList:any;
  StoreList:any;
  deliveryTermsList:any;
  paymentTermsList:any;
  selectedSupplierId: number | null = null;
  isSupplierValid: boolean = true;
  supplierItems:any;
  SupplierCurrency:any;
  SupplierCurrencyCode:any;
  SupplierCurrencySymbol:any;
  currencyExchangeRate:any;
  vatRule:any;
  employeeList:any;
  settingsData:any;
  localCurrencyId:any;
  localCurrencyCode:any;
  showLocalCurrencyColumn:any;
  purchaseOrders = [];
  allowEditing:boolean=true;
  selectedRowKeys: any[] = []; // Keys of items to be preselected
  supplierMail:any;
  fileData: string = '';
  fileDetails :any = {
    DOC_ID: '',
    DOC_TYPE: '',
    fileName: '',
    fileUrl: '',
    remarks: ''
  };
  uploadedFileName: string = ''; 
  showPopup: boolean = false;
  needSummaryUpdate: boolean = false;


  poData:any = {
    COMPANY_ID:1,
    STORE_ID:'',
    PO_NO:'',
    PO_DATE:new Date,
    SUPP_ID:'',
    SUPP_CONTACT:'',
    SUPP_ADDRESS:'',
    SUPP_MOBILE:'',
    REF_NO:'',
    CURRENCY_ID:'',
    PAY_TERM_ID:'',
    DELIVERY_TERM_ID:'',
    DELIVERY_DATE:new Date,
    NOTES:'',
    NARRATION:'',
    TAX_AMOUNT:'',
    GROSS_AMOUNT:'',
    NET_AMOUNT:'',
    SHIP_TO:'',
    PURPOSE:'',
    LOCATION:'',
    CONTACT_NAME:'',
    CONTACT_MOBILE:'',
    SUPP_GROSS_AMOUNT:'',
    SUPP_NET_AMOUNT:'',
    EXCHANGE_RATE:'',
    ISSUED_EMP_ID:'',
    PoDetails:[]
   
  }
  newPoData = this.poData;
  getNewPoData = () => ({ ...this.newPoData });

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

    this.getSupplierByid();

    console.log(this.supplierItems,"supplier list by click")
  }

  // Handler for Add Item button
  onAddItemClick() {
    this.validateSupplier();
    if (this.isSupplierValid) {
      // Show add item popup if supplier is selected
      this.showAddItemPopup = true;

      console.log(this.selectedSupplierId,"selected supplier id")

      this.getSupplierByid();

      console.log(this.supplierItems,"supplier items");
    }
  }

  getSupplierByid(){
    this.service.getSupplierItemsData(this.newPoData.SUPP_ID).subscribe(res=>{
      this.supplierItems=res;
      this.newPoData.CURRENCY_ID=this.supplierItems[0].CURRENCY_ID;
      this.SupplierCurrency=this.supplierItems[0].CURRENCY_NAME;
      this.SupplierCurrencyCode=this.supplierItems[0].CURRENCY_CODE;
      this.SupplierCurrencySymbol= this.supplierItems[0].CURRENCY_SYMBOL;
      this.supplierMail=this.supplierItems[0].SUPPLIER_MAIL;

      this.currencyExchangeRate=this.supplierItems[0].EXCHANGE;
      this.vatRule=this.supplierItems[0].VAT_RULE_NAME;

      this.showLocalCurrencyColumn = this.localCurrencyId !== this.newPoData.CURRENCY_ID;
 
      console.log(this.supplierItems,"supplier items")

      // Perform the calculation and emit the value here
      const shouldShowSupplierAmount = this.SupplierCurrencyCode !== this.localCurrencyCode;
      console.log('showSupplierAmount:', shouldShowSupplierAmount);
      this.showSupplierAmount.emit(shouldShowSupplierAmount); // Emit after initialization
    })
  }

  onTabClick(e: any) {
    this.selectedTabIndex = e.itemIndex;
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
      const useSupplierPrice = this.SupplierCurrencyCode !== this.localCurrencyCode;
      console.log(useSupplierPrice, "useSupplierPrice");
  
      // Supplier price logic: Use PURCH_PRICE if currencies differ
      const supplierPrice = useSupplierPrice ? item.PURCH_PRICE : 0;
      console.log(supplierPrice, "supplierPrice");
  
      // Calculate PURCHASE price when currencies differ
      const purchPrice = useSupplierPrice 
        ? (supplierPrice / this.currencyExchangeRate).toFixed(2) 
        : item.PURCH_PRICE;
  
      // Parse numeric fields and fallback to 0 if undefined or NaN
      const taxable = parseFloat(item.taxable) || 0;
      const vatAmount = parseFloat(item.vatAmount) || 0;
      const total = parseFloat(item.total) || 0;
      const supplierAmount =  parseFloat(item.supplierAmount) || 0;
  
      return {
        ...item,
        slNo: this.savedItems.length + index + 1, // Serial number starting from existing items
        SUPP_PRICE: supplierPrice, // Update SUPP_PRICE based on currency check
        PURCH_PRICE: parseFloat(purchPrice), // Ensure consistent numeric value
        supplierAmount,
        taxable,
        vatAmount,
        total
      };
    });
  
    // Filter out items that already exist in savedItems based on ITEM_ID or another unique identifier
    const filteredNewItems = newItems.filter(newItem => {
      // Check if item already exists in savedItems by ITEM_ID or another unique identifier
      return !this.savedItems.some(savedItem => savedItem.ITEM_ID === newItem.ITEM_ID);
    });
  
    // Merge existing items (from ngOnChanges) with non-duplicate new items
    this.savedItems = [...this.savedItems, ...filteredNewItems];
  
    // Log the updated savedItems array for debugging
    console.log(this.savedItems, "savedItems");
  
    // Update the UI state
    this.selectedTabIndex = 1; // Switch to the tab showing saved items
    this.showAddItemPopup = false; // Close the "Add Item" popup
  }
  ngOnInit() {
    
    this.currentDate = new Date();
    this.GetSupplierList();
    this.GetStoresList();
    this.GetDeliveryTermsList();
    this.GetPaymentTermsList();
    this.GetEmployeeList();
  }

  calculateTotalQuantity() {
    this.totalQuantity = this.savedItems.reduce((sum, item) => sum + Number(item.qtyOrdered || 0), 0);
    this.netVerifyQuantityChange.emit(this.totalQuantity);
}

  calculateTotalExcludingTax() {
    this.newPoData.GROSS_AMOUNT = this.savedItems.reduce((sum, item) => sum + Number(item.taxable || 0), 0).toFixed(2);
    this.newPoData.SUPP_GROSS_AMOUNT=this.savedItems.reduce((sum,item)=>sum + Number(item.taxable_Supplier || 0), 0).toFixed(2);;
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
  this.netVerifyAmountChange.emit(amountToEmitInLocalCurrency); // Emit NET_AMOUNT with the currency

  // Emit SUPP_NET_AMOUNT with the supplier currency symbol
  this.netVerifySupplierAmountChange.emit(amountToEmitInSupplierCurrency); // Emit SUPP_NET_AMOUNT with the supplier currency symbol

}

onContentReady(e: any) {
  if (this.needSummaryUpdate) {
    // Refresh the grid to recalculate summary values
    e.component.refresh();
    this.needSummaryUpdate = false; // Reset the flag after refresh
  }
}

updateAmount(e: any) {
  const updatedRow = e.data; // Get the updated row data

  // Find the specific item in savedItems
  const item = this.savedItems.find(i => i.slNo === updatedRow.slNo);

  if (item) {
      // Ensure qtyOrdered is valid before proceeding with calculations
      const qtyOrdered = updatedRow.qtyOrdered ? updatedRow.qtyOrdered : 0;

      // Check if SUPP_PRICE is updated and calculate PURCH_PRICE
      if (updatedRow.SUPP_PRICE !== undefined && updatedRow.SUPP_PRICE !== null) {
        item.SUPP_PRICE = updatedRow.SUPP_PRICE;
    
        // Only recalculate PURCH_PRICE if the currencies are different
        if (this.SupplierCurrencyCode !== this.localCurrencyCode) {
            item.PURCH_PRICE = parseFloat((item.SUPP_PRICE / this.currencyExchangeRate).toFixed(2));
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
          if (updatedRow.discountPercentage && updatedRow.discountPercentage > 0) {
              item.discountAmount = parseFloat((item.Amount * (updatedRow.discountPercentage / 100)).toFixed(2));
          } else {
              item.discountAmount = 0; // Set to 0 if no valid discount percentage
          }

          // Calculate Taxable Amount as Amount - Discount Amount
          item.taxable = parseFloat((item.Amount - item.discountAmount).toFixed(2));

          let discSupplierAmount = 0; // Initialize discount amount

          if (updatedRow.discountPercentage && updatedRow.discountPercentage > 0) {
              discSupplierAmount = parseFloat(((qtyOrdered * item.SUPP_PRICE) * (updatedRow.discountPercentage / 100)).toFixed(2));
          } else {
              discSupplierAmount = 0; // Set to 0 if no valid discount percentage
          }

          // Calculate Taxable Supplier based on SUPP_PRICE in the supplier's currency
          item.taxable_Supplier = parseFloat(((qtyOrdered * item.SUPP_PRICE) - discSupplierAmount).toFixed(2));

          // Calculate VAT Amount if VAT percentage is provided
          if (updatedRow.VAT_PERC && updatedRow.VAT_PERC > 0) {
              item.vatAmount = parseFloat((item.taxable * (updatedRow.VAT_PERC / 100)).toFixed(2));
          } else {
              item.vatAmount = 0; // Set to 0 if no valid VAT percentage
          }

          // Calculate Total as Taxable Amount + VAT Amount
          item.total_Supplier = item.taxable_Supplier ;
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
      const newFileUrls = newFiles.map(file => URL.createObjectURL(file));
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
      if (options.summaryProcess === 'calculate') options.totalValue += options.value.qtyOrdered || 0;
      break;
    case 'totalamount':
      if (options.summaryProcess === 'start') options.totalValue = 0;
      if (options.summaryProcess === 'calculate') options.totalValue += options.value.Amount || 0;
      break;
    case 'discamount':
      if (options.summaryProcess === 'start') options.totalValue = 0;
      if (options.summaryProcess === 'calculate') options.totalValue += options.value.discountAmount || 0;
      break;
    case 'totaltaxable':
      if (options.summaryProcess === 'start') options.totalValue = 0;
      if (options.summaryProcess === 'calculate') options.totalValue += options.value.Taxable || 0;
      break;
    case 'totalvatamount':
      if (options.summaryProcess === 'start') options.totalValue = 0;
      if (options.summaryProcess === 'calculate') options.totalValue += options.value.vatAmount || 0;
      break;
    case 'total':
      if (options.summaryProcess === 'start') options.totalValue = 0;
      if (options.summaryProcess === 'calculate') {
        options.totalValue += (options.value.qtyOrdered || 0) 
                            + (options.value.Amount || 0) 
                            + (options.value.discountAmount || 0) 
                            + (options.value.Taxable || 0) 
                            + (options.value.vatAmount || 0);
      }
      break;
  }
}

GetSupplierList(){
  this.service.getDropdownData('SUPPLIER').subscribe(res=>{
    this.SupplierList=res;
  })
}

GetStoresList(){
  this.service.getDropdownData('STORE').subscribe(res=>{
    this.StoreList=res;
  })
}

GetDeliveryTermsList(){
  this.service.getDropdownData('DELIVERYTERMS').subscribe(res=>{
    this.deliveryTermsList=res;
  })
}

GetPaymentTermsList(){
  this.service.getDropdownData('PAYMENTTERMS').subscribe(res=>{
    this.paymentTermsList=res;
  })
}

GetEmployeeList(){
  this.service.getDropdownData('EMPLOYEE').subscribe(res=>{
    this.employeeList=res;
  })
}

onRowClick(event: any) {
  const itemId = event.data.ITEM_ID;
  this.loadPurchaseOrders(itemId);
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
  });
}

getPoHistoryList() {
  this.service.getPurchaseOrderHistoryList().subscribe((res:any) => {
    // Add slNo to each item in the list
    this.poHistoryList = res.data.map((item, index) => ({
      ...item,
      slNo: index + 1, // Add slNo starting from 1
    }));
  });
}

formatDateTime(rowData: any): string { 
  const celldate = rowData.Time;
  if (!celldate) return '';

  const date = new Date(celldate);

  // Format the date and time using the user's system locale
  const formattedDate = date.toLocaleDateString(); // Formats according to the user's system date format
  const formattedTime = date.toLocaleTimeString(); // Formats according to the user's system time format

  // Combine date and time
  return `${formattedDate}, ${formattedTime}`;
}


formatPoDate(rowData: any): string { 
  const celldate = rowData.PO_DATE;
  if (!celldate) return '';

  const date = new Date(celldate);

  // Format the date using the user's system locale
  const formattedDate = date.toLocaleDateString(); // Formats according to the user's system date format

  return formattedDate; // Return only the date part
}

customSum(options: Parameters<DxDataGridTypes.Summary['calculateCustomSummary']>[0]) {
  console.log('options:', options); // Log the entire options object
  // Start each column's calculation
  if (options.summaryProcess === 'start') {
    options.totalValue = 0;
  }

  // Accumulate values for each column based on its name
  if (options.summaryProcess === 'calculate') {
    if (options.name === 'qtySum') {
      options.totalValue += options.value.qtyOrdered || 0;
      console.log(options.value.qtyOrdered,"entering qty value")
      
      console.log(options.totalValue,"qty total value")
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
    console.log(options.totalValue,"finalize total value")
  }
}

ngOnChanges(changes: SimpleChanges) {
  if (changes.formdata && changes.formdata.currentValue) {

    this.fileDetails.DOC_ID=this.formdata.ID;
    this.newPoData = { ...this.formdata };
    this.newPoData.PoDetails=this.formdata.PoDetails
    this.savedItems = this.newPoData.PoDetails.map((item, index) => {
      // Calculate the base amount after discount
      const baseAmount = item.QUANTITY * item.PRICE;
      const supplierAmount = item.QUANTITY * item.SUPP_PRICE;

      const discountAmount = (baseAmount * (item.DISC_PERCENT || 0) / 100);
      const supplierDiscAmount =(supplierAmount * (item.DISC_PERCENT || 0) / 100);
      const taxableSupplier = supplierAmount - supplierDiscAmount;  // Amount after discount for supplier
      const taxable = baseAmount - discountAmount;
    
      // Calculate VAT
      const vatAmount = taxable * (item.TAX_PERCENT || 0) / 100;
    
      // Calculate totals
      const totalSupplier = taxableSupplier;
      const total = taxable + vatAmount;
    
      return {
        ITEM_ID: item.ITEM_ID,
        slNo: index + 1,
        ITEM_CODE: item.ITEM_CODE || '',
        DESCRIPTION: item.ITEM_DESC,
        UOM: item.UOM,
        PACKING_NAME: item.PACKING,
        SUPP_PRICE: parseFloat(item.SUPP_PRICE),
        PURCH_PRICE: parseFloat(item.PRICE) || 0,
        qtyOrdered: parseFloat(item.QUANTITY),
        Amount: parseFloat(baseAmount.toFixed(2)),
        discountPercentage: item.DISC_PERCENT,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        taxable_Supplier: parseFloat(taxableSupplier.toFixed(2)),
        taxable: parseFloat(taxable.toFixed(2)), // Convert to local currency if needed
        VAT_PERC: item.TAX_PERCENT,
        vatAmount: parseFloat(vatAmount.toFixed(2)),
        total_Supplier: parseFloat(totalSupplier.toFixed(2)),
        total: parseFloat(total.toFixed(2)) // Convert to local currency if needed
      };
    });
    
    console.log('Mapped PoDetails with calculated values:', this.savedItems);
    console.log(this.newPoData.PoDetails,"podetailsform")

    this.getAttachmentList();

    this.getPoHistoryList();

    this.selectedRowKeys = this.savedItems.map(item => item.ITEM_CODE);
    console.log(this.selectedRowKeys,"selectedrowkeys")

    this.calculateTotalQuantity();
    this.calculateTotalIncludingTax();
  }

  
}

// This method is called when the file is selected
onFileSelected(event: any) {
  const file: File = event.target.files[0]; // Get the selected file
  console.log(file, "file");

  if (file) {
    const reader = new FileReader();

    // FileReader will read the file as a Data URL (Base64 encoded)
    reader.onloadend = () => {
      const base64DataUrl = reader.result as string; // Example: "data:application/pdf;base64,ABCDEF..."

      // Extract the Base64 part from the Data URL
      this.fileData = base64DataUrl.split(',')[1]; // Remove "data:*/*;base64," prefix
      console.log(this.fileData, "fileData (Base64)");

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
    console.error("No file data available to open.");
    return;
  }

  // Convert Base64 to Blob
  const byteCharacters = atob(base64Data); // Decode Base64
  const byteNumbers = new Array(byteCharacters.length).fill(null).map((_, i) => byteCharacters.charCodeAt(i));
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

saveFileDetails() {

  const data={
    DOC_TYPE:this.fileDetails.DOC_TYPE,
    DOC_ID:this.fileDetails.DOC_ID,
    FILE_NAME:this.fileDetails.fileName,
    FILE_DATA:this.fileData,
    REMARKS:this.fileDetails.remarks,
    USER_ID:1
  }

  console.log(data,"data")

  this.service.saveAttachmentData(data).subscribe(res=>{
    console.log(res,"result")
    if(res){
      this.showPopup = false;
      this.getAttachmentList();
    }
  })
}

getAttachmentList(){
  const docId=this.fileDetails.DOC_ID;
  const docType=this.fileDetails.DOC_TYPE;
  console.log(docId,docType,"docid and doctype")
  this.service.getAttachmentList(docId,docType).subscribe((res:any)=>{
    this.uploadedFiles=res.data;
  })
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
    DxButtonModule
  ],
  providers: [],
  declarations: [PurchaseOrderVerifyFormComponent],
  exports: [PurchaseOrderVerifyFormComponent],
})
export class PurchaseOrderVerifyFormModule {}

