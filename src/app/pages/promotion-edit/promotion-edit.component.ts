import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, NgModule, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DxButtonModule, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxDateBoxModule, DxFileUploaderModule, DxFormModule, DxNumberBoxModule, DxPopupModule, DxProgressBarModule, DxRadioGroupModule, DxSelectBoxModule, DxTabsModule, DxTagBoxModule, DxTemplateModule, DxTextAreaModule, DxTextBoxModule, DxToolbarModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { DxoFormItemModule, DxoItemModule, DxoLookupModule } from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { Observable, tap } from 'rxjs';
import { FormTextboxModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-promotion-edit',
  templateUrl: './promotion-edit.component.html',
  styleUrls: ['./promotion-edit.component.scss']
})
export class PromotionEditComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  worksheetData: any;
  AllowCommitWithSave: string;
  userId: string;
  store: any;
  itemsList: any;
  selectedStoreId: any;
  itemStoresList: any;
  itemIds: any[];
  filteredItems: any;
  selectedRowKeys:any
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  minDate: Date = new Date();  // Today's date
  fromDate: any = new Date(); // Default value for 'from' date
  toDate: any = new Date();
  toTime: any = new Date();
  fromTime:any = new Date();
  department: any;
  catagory: any;
  brand: any;
  storeIds: any;
  isPopupVisible: boolean = false;
  isVisible: boolean = false;
  daysOfWeek = [
    { text: 'Monday', value: 0 },
    { text: 'Tuesday', value: 1 },
    { text: 'Wednesday', value: 2 },
    { text: 'Thursday', value: 3 },
    { text: 'Friday', value: 4 },
    { text: 'Saturday', value: 5 },
    { text: 'Sunday', value: 6 },
  ];
  selectedDays: number[] = [];
  roundingOptions = [
    { text: 'Do not round the result', value: 'none' },
    { text: 'Round to the nearest value', value: 'nearest' },
    { text: 'Round down', value: 'down' },
    { text: 'Round up', value: 'up' },
  ];
  operationOptions = [
    { label: 'Add (+)', value: '+' },
    { label: 'Subtract (-)', value: '-' },
    { label: 'Multiply (*)', value: '*' },
    { label: 'Divide (/)', value: '/' },
    { label: '%+', value: '%+' },
    { label: '%-', value: '%-' },
  ];
  operationInputValue: string = '';
  operationResult: any[] = [];

  priceLevels = [
    { value: 1, text: 'Price Level 1' },
    { value: 2, text: 'Price Level 2' },
    { value: 3, text: 'Price Level 3' },
  ];
  selectedPriceLevel: string;
  operationValue: string = '';
  selectedSchema: any;
  schemaLevelPromotion: any;
  roundingValue: string;
  onSaleStatus: boolean = false;
  selectedOperation: string = '';
  promotionName: any;
  firstDropdownValue: any;
  firstDropdownOptions = [
    { label: 'Cost', value: 'cost' },
    { label: 'Price', value: 'salePrice' },
    { label: 'Set Promotion Price To', value: 'defaultPrice' },
  ];
  promotionSchema: any;
  tagTemplate = (data) => {
    return `
      <div style="margin-right: 2px; display: inline-block; white-space: nowrap;">
        ${data.text}
      </div>
    `;
  };
  documentNo: string = '12345';
  salePrice: number; // Store the final result after operation and rounding
  selectedRowIndex: number;
  selectedItem: any;
  selectedPrice: number = 0;
  selectedCost: any[] = [];
  selectedSalePrice: any[] = [];
  valueToUse: number[] = [];
  selectedRow: any;
  areDatesSelected = false;
  worksheetPromotionSchema: any[] = [];
  selectedId: any;
  selectedPromotionSchemaId: any;
  updatedItems: { [key: number]: any } = {};
  selectedSchemaId: number;  // To store the selected ID
  selectedSchemaName: string;
  disableRightColumn = false;
  combinedData: any[] = [];
  promotionLevel: any;
  showDropdown: boolean;
  selectedPromotionLevel: any;
  selectedOption: string = 'onSaleStatus';
  defaultTextValue:any;
  selectedPromotionName: any;
  rowIds: any;
  selectedIds: any;
  heading: string = 'Items on Promotion';
  filteredItemStoresList: any;
  originalGridHeight = '540px';
  popupForItemsToGet: boolean;
  selectedItems: any;
  selectedRowNew: any;
  selectedRowForNewList: any;
  combinedItem: any;
  selectedSchemaType: any;
  isGet: number;
  isBuy: number;
  showError: boolean;
  TimeFromArray: string[] = [];
  TimeToArray: string[] = [];
  isTimeRangeEnabled: boolean = false;
  timeRange: any; 
  isHappyHoursEnabled: boolean = false;
  happyHoursPopup: boolean = false;
  IdInList: any;
  worksheetpromotionSchema: any;
  timeFrom: any;
  timeTo: any;
  filteredItemsWithIsGetTrue: any;
  remainingItemStoresList: any;
  filteredItemStoresListRemaining: any;
  isLoading: boolean;
  isGridVisible: boolean;
  showGrid: boolean;
  selectedRowsData: any;
  selectedRowKeysNew: any;
  selectedRowsOfPopup: any;
  isRowsSelected: boolean = false;
  narration: any;
  wsNo: any;
  wsDate: any;

  constructor(private dataservice : DataService, private router: Router,private cdr: ChangeDetectorRef){
    dataservice.getDropdownData('DEPARTMENT').subscribe((data) => {
      this.department = data;
    });
    dataservice.getDropdownData('ITEMCATEGORY').subscribe((data) => {
      this.catagory = data;
    });
    dataservice.getDropdownData('BRAND').subscribe((data) => {
      this.brand = data;
    });
    dataservice.getDropdownData('PROMOTION_LEVEL').subscribe((data) => {
      // Check if data is available
      if (data && data.length > 0) {
        this.promotionLevel = data;

        if (this.promotionLevel.length > 1) {
          this.showDropdown = true; // More than one level, show dropdown
        } else {
          this.selectedPromotionLevel = this.promotionLevel[0].value; // Only one level, set as default
          this.showDropdown = false;
        }
      } else {
        // Set to Level 0 if no data is found in the database
        this.promotionLevel = [{ text: 'Level 0', value: 0 }];
        this.selectedPromotionLevel = 0;
        this.showDropdown = false;
      }
    });
  }

  ngOnInit(){
    this.AllowCommitWithSave = sessionStorage.getItem('AllowCommitWithSave');
    this.userId = sessionStorage.getItem('UserId');
    this.schemaOptions()
    this.getPromotionData()
    // this.listStoreItemProperty();
    this.loadStores();
    const defaultStoreId = this.selectedStoreId.join(',');
    this.listItemsByMultipleStoreIds(defaultStoreId);
    // this.setHeightOfTheGrid()
  }

  onCheckboxChange(event: any): void {

    if (!event.value) {
        this.fromTime = null;
        this.toTime = null;
    }
}

onHappyHoursChanged(isEnabled: boolean): void {
  this.isHappyHoursEnabled = isEnabled;

  if (!isEnabled) {
    // Reset time values to '00:00' when disabled
    this.fromTime = '00:00';
    this.toTime = '00:00';
  }
}

  getPromotionData(){
    this.dataservice.getWorksheetData().subscribe(data => {
      this.worksheetData = data;
      this.worksheetpromotionSchema = this.worksheetData.worksheet_promotion_schema.filter((item: any) => item.IS_BUY === true);
      this.wsNo = this.worksheetData.WS_NO

      this.wsDate = this.worksheetData.WS_DATE
  ? new Date(this.worksheetData.WS_DATE).toISOString().split('T')[0]
  : '';
      console.log(this.worksheetData,"WORKSHEETPROMOTIONSCHEMAAAAA")
      this.narration = this.worksheetData.worksheet_promotion_schema[0].NARRATION
      console.log(this.narration,"NARRATION")
      this.itemIds = this.worksheetData.worksheet_promotion_schema.map(item => +item.ITEM_ID)
      // console.log(this.worksheetpromotionSchema, "WORKSHEET DATA IN EDITTTT");
      this.isBuy = this.worksheetpromotionSchema.some(item => item.IS_BUY === true);
      this.isGet = this.worksheetpromotionSchema.some(item => item.IS_GET === true);

      this.timeFrom = this.worksheetpromotionSchema[0]?.TIME_FROM.split('T')[1].slice(0, 5);
      this.timeTo = this.worksheetpromotionSchema[0]?.TIME_TO.split('T')[1].slice(0, 5);


      // console.log(this.timeFrom,this.timeTo,"???????????????????????????time")
      this.isHappyHoursEnabled = this.worksheetpromotionSchema.some(item => item.IS_HAPPY_HOUR);
      // console.log(this.isHappyHoursEnabled, "ISHAPPYHOUR");

      this.filteredItemStoresList = this.worksheetpromotionSchema.filter(
        worksheetItem => worksheetItem.IS_GET === true
      );
      if (this.worksheetpromotionSchema?.length) {
        this.fromDate = new Date(this.worksheetpromotionSchema[0].DATE_FROM);
        this.toDate = new Date(this.worksheetpromotionSchema[0].DATE_TO);
      } else {
        this.fromDate = null;
        this.toDate = null;
      }
      this.fromTime = this.worksheetpromotionSchema[0].FROM_TIME
        ? this.convertToTime(this.worksheetpromotionSchema[0].FROM_TIME)
        : null;

      this.toTime = this.worksheetpromotionSchema[0].TO_TIME
        ? this.convertToTime(this.worksheetpromotionSchema[0].TO_TIME)
        : null;

      if (this.worksheetpromotionSchema && this.worksheetpromotionSchema.length > 0) { 
      const hasSchemaId = this.worksheetpromotionSchema.some(promotion => promotion.PROMOTION_SCHEMA_ID > 0);
      this.selectedOption = hasSchemaId ? 'schemaLevelPromotion' : 'onSaleStatus';
      }
          this.selectedRowKeys = this.worksheetpromotionSchema.map(item => item.ITEM_ID);
          this.selectedIds = this.combinedData
          .filter(item => !item.Selected) // Invert the condition to filter items where Selected is false
          .map(item => item.ITEM_ID);
      this.promotionName = this.worksheetData.worksheet_promotion_schema[0]?.PROMOTION_NAME || '';
      this.selectedSchemaId = this.worksheetpromotionSchema[0].PROMOTION_SCHEMA_ID || null;
      const storeIds = this.worksheetData.worksheet_item_store.map(store => store.STORE_ID);
      this.selectedStoreId = storeIds;
      if (this.worksheetpromotionSchema && this.worksheetpromotionSchema.length > 0) {
        const weekdays = this.worksheetpromotionSchema[0].PROMOTION_WEEKDAYS; // Assuming it's in the first object
        if (weekdays) {
          // Convert the comma-separated string to an array of numbers
          this.selectedDays = weekdays.split(',').map(Number);
          // console.log('Selected Days for Edit:', this.selectedDays);
        }
      }
      // this.itemIds = []

      // console.log(this.itemIds,"ITEMIDS")
 
    });
  }
  setHeightOfTheGrid(){
    // console.log(this.selectedItems,"FILTEREDITEMS<<<<<<<<<setHeightOfTheGrid>>>>>>>>>>")
    // if (this.filteredItemStoresList.length === 0) {
    //   this.originalGridHeight = '540px';
    // } else {
    //   this.originalGridHeight = '300px';  // Reset to the original height if not empty
    // }
  }
  
    schemaOptions() {
      this.dataservice.getDropdownData('PROMOTIONSCHEMA').subscribe((data) => {
        this.promotionSchema = data;  // Assuming this contains [{REMARKS: '4', DESCRIPTION: 'buy 3 bread get 1 jam free'}, ...]
      
       const worksheetpromotionSchema = this.worksheetData.worksheet_promotion_schema; // Assuming this contains [{PROMOTION_NAME: 'buy 3 bread get 1 jam free'}, ...]
      
        console.log(this.worksheetpromotionSchema, "==========???");
      
        // Create a mapping for REMARKS and DESCRIPTION from promotionSchema
        const remarksMapping = this.promotionSchema.reduce((acc, curr) => {
          acc[curr.DESCRIPTION] = curr.REMARKS;
          return acc;
        }, {});
      
        // Now, for each worksheetpromotionSchema, find the REMARKS by matching the PROMOTION_NAME
        worksheetpromotionSchema.forEach(item => {
          const promotionName = item.PROMOTION_NAME;
          const remarksCode = remarksMapping[promotionName];
      
          if (remarksCode === '4') {
            // If REMARKS is 4, filter the items with isGet = true
            this.filteredItems = worksheetpromotionSchema.filter(
              (worksheetItem) => worksheetItem.IS_GET === true
            );
       this.selectedRowForNewList = this.filteredItems.map(item => item.ID);
            console.log('Filtered items with isGet = true and REMARKS = 4:', this.filteredItems);
            if(this.filteredItems.length > 0){
              this.originalGridHeight = '300px'
             }else{
              this.originalGridHeight = '540px'
             }
            // Store the filtered items in a variable or perform the desired action
            this.filteredItemsWithIsGetTrue = this.filteredItems;
            console.log(this.filteredItemsWithIsGetTrue,"==???''")
          } else {
            console.log(`No action needed for PROMOTION_NAME: '${promotionName}' as REMARKS is not 4`);
          }
        });
      });
      
      
    }
    
  
    convertToTime(timeString: string): Date {
      const [hours, minutes, seconds] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, seconds);
      return date;
    }
    
  
  
    listItemsByMultipleStoreIds(storeIds: string): void {
      const allStoreIds = '2,3,4'; // Define all store IDs here
  
      // Determine the payload based on the storeId
      // const payloadStoreIds = storeIds === '1' ? allStoreIds : storeIds;
    
      this.isLoading = true;
    
      this.dataservice.getItemListByStoreId(allStoreIds).subscribe(
        (response: any) => {
          this.itemStoresList = response.PriceWizardData;
          this.isLoading = false;
          console.log(this.itemStoresList, 'Items loaded for store IDs:', allStoreIds);
        },
        (error) => {
          this.isLoading = false;
          console.error('Error fetching item list for store IDs:', error);
        }
      );
    }
  
  
    
    loadStores() {
      this.dataservice.getStoresData().subscribe((response) => {
        // Filter out the central store
        this.store = response.filter((store: any) => store.STORE_NAME !== 'CENTRAL STORE');
        console.log(this.store, 'Filtered Stores');
      });
    }
    onOptionChange(event: any) {
      this.selectedOption = event.value;
      console.log(this.selectedSchemaType,"SCHEMATYPE")
  
      if (this.selectedOption !== 'schemaLevelPromotion') {
        this.clearFilter()
        // this.selectedSchemaId = null; // Reset the value of the dx-select-box
      }
      if(this.selectedOption == 'schemaLevelPromotion'){
        this.firstDropdownValue = '';
        this.operationValue = '';
        this.defaultTextValue = '';
        this.operationInputValue = '';
        this.roundingValue = '';
      }
    }
  
    onGridReady(e: any): void {
      // Get the data grid component instance
      const grid = e.component;
      
      // Ensure the grid is loaded and there are rows available
      const totalItemsCount = grid.getDataSource().items().length;
    
      // Automatically select all rows if there are items in the grid
      if (totalItemsCount > 0) {
        grid.selectAll(); // Select all rows
      }
    }
    
  
    onSelectionChanged(e) {
      
      this.selectedRowKeys = e.selectedRowKeys;
      // console.log(this.selectedRowKeys, 'SELECTED');
      this.selectedRow = e.selectedRowsData; // Gets the first selected row
      // console.log(this.selectedRow, 'SELECTEDROW');
      this.selectedId = [];
      this.selectedCost = [];
      this.selectedSalePrice = [];
      this.selectedRow.forEach((row) => {
        this.selectedId.push(row.ID);
        this.selectedCost.push(row.COST);
        this.selectedSalePrice.push(row.PRICE);
      });
    }
    
  
    onRowClick(event) {
      this.selectedRowIndex = event.rowIndex;
      console.log('Selected Row:', event.data);
    }
  
    closePopup(): void {
      this.isVisible = false;
    }
  
  
  
    
  
    applyPromotion() {
      // If a schema is selected
      if (this.selectedSchemaId) {
        const selectedSchema = this.promotionSchema.find(
          (schema) => schema.ID === this.selectedSchemaId
        );
        if (selectedSchema) {
          console.log(selectedSchema.REMARKS)
          if(selectedSchema.REMARKS == '4'){
            this.heading = 'Items To Buy';
            this.filteredItemStoresList = this.itemStoresList.filter((item) => {
              const isItemSelected = this.selectedRow.some((row) => row.ID === item.ID);
              return !isItemSelected; // Keep only items that are NOT selected
            });
            console.log(this.filteredItemStoresList,"FILTERED")
            this.originalGridHeight = '300px'; 
          }
          this.selectedSchemaName = selectedSchema.DESCRIPTION
          // Log the schema name when a schema is selected
          console.log('Selected Schemaaaaaaaaaaaaaa:', selectedSchema.DESCRIPTION);
          this.selectedSchemaName = selectedSchema.DESCRIPTION; // Store the selected schema name
          console.log(this.selectedSchemaName,"NAME")
          this.selectedRow.forEach((row, index) => {
            // Find the corresponding row in `itemStoresList` by ID
            const selectedRowIndex = this.worksheetpromotionSchema.findIndex(
              (item) => item.ID === row.ID
            );
    
            if (selectedRowIndex !== -1) {
          
                this.worksheetpromotionSchema[selectedRowIndex].PROMOTION_NAME =
                this.selectedSchemaName;
                this.worksheetpromotionSchema[selectedRowIndex].PROMOTION_SCHEMA_ID =
                this.selectedSchemaId;
  
            } else {
              console.log(
                `Selected row with ID ${row.ID} not found in worksheetpromotionSchema.`
              );
            }
          });
        }
        setTimeout(() => {
          this.closePopup();  // Ensure close happens after operations
        }, 0);  // Exit the function early if schema is selected
        return;
      }
    
      // If no schema is selected, proceed with the promotion logic
      this.applySelectedValue();
    
      if (this.valueToUse != null) {
        this.calculateResult();
        this.updatePromotionPrice();
      }
    
      setTimeout(() => {
        this.closePopup();  // Ensure close happens after operations
      }, 0);  // Close the popup after applying promotion
    }
  
  
  
    
  
    onAddClick(){
      this.selectedItems = this.selectedRowNew;
      console.log(this.selectedItems,"SELECTEDITEMSSSSSSSSS")
      this.popupForItemsToGet = true;
      // console.log("FILTEREDSTORESITEMS======<<<<<>>>>>>>>")
      if(!this.filteredItems){
        console.log("NO SELECTEDITEMSS")
        const excludedIDs = new Set([
          ...this.worksheetData.worksheet_promotion_schema.map(item => item.BARCODE),
  
        ]);
  console.log(excludedIDs,"EXCLUDEDIDSSSSSSSSSSS")
    this.filteredItemStoresListRemaining = this.itemStoresList.filter(
      item => !excludedIDs.has(item.ID)
    );
  
  
      }else{
        const excludedIDs = new Set([
          ...this.worksheetData.worksheet_promotion_schema.map(item => item.BARCODE),
          ...this.filteredItems.map(item => item.BARCODE)
        ]);
  console.log(excludedIDs,"EXCLUDEDIDSSSSSSSSSSS")
  this.filteredItemStoresListRemaining = this.itemStoresList.filter(
    item => !excludedIDs.has(item.BARCODE)
  );
       
    // this.filteredItemStoresListRemaining = this.itemStoresList.filter(
    //   item => !excludedIDs.has(item.ID)
    // );
        
      }
    }
  
    AddSelectedItems() {
      // Ensure filteredItems is an array before accessing it
      if (!Array.isArray(this.filteredItems)) {
        this.filteredItems = []; // Initialize as an empty array if it's undefined or not an array
      }
    
      console.log(this.filteredItems, "FILTEREDITEMSSSSSS?>>>>>>>>");
    
      // Add selectedRowsOfPopup to filteredItems, ensuring no duplicates based on a unique key (e.g., ID)
      if (this.selectedRowsOfPopup && this.selectedRowsOfPopup.length > 0) {
        console.log(this.selectedRowsOfPopup, "SELECTED ROWS OF POPUP");
    
        // Push the selectedRowsOfPopup to filteredItems, ensuring no duplicates
        this.filteredItems = [
          ...this.filteredItems,
          ...this.selectedRowsOfPopup.map(row => ({
            ...row,
            ITEM_ID: row.ID,
            ITEM_DESCRIPTION: row.DESCRIPTION, // Map DESCRIPTION to ITEM_DESCRIPTION
            PRICE: row.SALE_PRICE,
            PROMOTION_NAME: this.worksheetData.worksheet_promotion_schema[0]?.PROMOTION_NAME
            
              // Optional: Remove DESCRIPTION if no longer needed
          })),
        ];
        
        // this.filteredItems = [
        //   ...this.filteredItems,
        //   ...this.selectedRowsOfPopup.filter(
        //     (row) => !this.filteredItems.some((item) => item.ID === row.ID) // Replace 'ID' with your unique key
        //   )
        // ];
    
        console.log(this.filteredItems, 'Updated filteredItems after adding selectedRowsOfPopup');
      } else {
        console.log("No rows selected in selectedRowsOfPopup");
      }
    
      // Ensure filteredItems are shown as selected in the grid
      this.selectedRowKeysNew = this.filteredItems.map((item) => item.ID); // Update selectedRowKeys with filtered items' IDs
    
      console.log(this.selectedRowKeysNew, "Updated selectedRowKeysNew for default selection");
    
      // Close the popup or any other required actions
      this.popupForItemsToGet = false;
    }
  
    
  
  
    onSelectionChangedforNewItem(event:any) {
      console.log(event, 'Entire event object');
      this.selectedRowKeysNew = event.selectedRowKeys;
      console.log(this.selectedRowKeysNew, 'SELECTED ROW KEYS<<<<<<<<<');
      this.selectedRowsOfPopup = this.filteredItemStoresListRemaining.filter((item: any) =>
        this.selectedRowKeysNew.includes(item.ID) // Replace `ID` with your keyExpr field
      );
      // this.isRowsSelected = this.selectedRowsOfPopup.length > 0;
      setTimeout(() => {
        this.isRowsSelected = this.selectedRowsOfPopup.length > 0;
      });
      console.log(this.selectedRowsOfPopup, 'Manually fetched selected rows data');
    
      this.selectedRowForNewList = [
        ...this.filteredItems.map(item => item.ITEM_ID), // Include IDs from filteredItems
        ...this.selectedRowKeys, // Include IDs from selected rows
      ];
    console.log(this.selectedRowForNewList,"<<<<<<<<<<<<,,selectedRowForNewList>>>>>>>>>>>>>>>>>")
      // Make sure to remove duplicates if any
      this.selectedRowForNewList = [...new Set(this.selectedRowForNewList)];
    
      console.log(this.selectedRowForNewList, 'UPDATED SELECTED ROW KEYS');
    
      // If you want the selected row data as well, you can merge both
      this.selectedRowNew = [
        ...this.filteredItems.filter(item => this.selectedRowForNewList.includes(item.ID)),
        ...this.selectedRowsData,
      ];
      this.cdr.detectChanges();
      console.log(this.selectedRowNew, 'UPDATED SELECTED ROWS DATA');
    }
    
  
  
  
    updatePromotionPrice() {
      // Check if selected rows and operation result are available
      if (this.selectedRow && this.operationResult != null) {
        // Ensure that the number of operation results matches the number of selected rows
        if (this.selectedRow.length !== this.operationResult.length) {
          console.log('Mismatch between selected rows and operation results.');
          return;
        }
  
        // Iterate over each selected row and update its PROMOTION_PRICE with the calculated result
        this.selectedRow.forEach((row, index) => {
          // Find the corresponding row in `itemStoresList` by ID
          const selectedRowIndex = this.worksheetpromotionSchema.findIndex(
            (item) => item.ID === row.ID
          );
  
          if (selectedRowIndex !== -1) {
            // Update the PROMOTION_PRICE for this row
            this.worksheetpromotionSchema[selectedRowIndex].PROMOTION_PRICE =
              this.operationResult[index];
              this.worksheetpromotionSchema[selectedRowIndex].PROMOTION_NAME =
              this.promotionName;
            console.log(
              `Updated PROMOTION_PRICE for row ID ${row.ID}:`,
              this.worksheetpromotionSchema[selectedRowIndex]
            );
          } else {
            console.log(
              `Selected row with ID ${row.ID} not found in worksheetpromotionSchema.`
            );
          }
        });
      } else {
        console.log('No selected rows or operation result is null.');
      }
    }
  
    calculateResult() {
      // Convert operationInputValue to number (ensure it's a valid number)
      const value = parseFloat(this.operationInputValue);
  
      // Check if the entered value is a valid number
      if (isNaN(value)) {
        console.log('Please enter a valid number.');
        this.operationResult = []; // Reset result if input is invalid
        return;
      }
  
      // Check for valid operation selection
      if (!this.operationValue) {
        console.log('Please select a valid operation.');
        this.operationResult = []; // Reset result if operation is not selected
        return;
      }
  
      // Initialize an array to store the result for each selected row
      this.operationResult = this.valueToUse.map((initialValue, index) => {
        let updatedValue = initialValue;
  
        // Apply the operation based on the selected operator
        switch (this.operationValue) {
          case '+':
            updatedValue += value;
            break;
          case '-':
            updatedValue -= value;
            break;
          case '*':
            updatedValue *= value;
            break;
          case '/':
            // Ensure division by zero is not attempted
            if (value !== 0) {
              updatedValue /= value;
            } else {
              console.log(`Cannot divide by zero for row ${index + 1}.`);
              return NaN; // Return NaN instead of null for invalid result
            }
            break;
          case '%+':
            updatedValue += (updatedValue * value) / 100;
            break;
          case '%-':
            // Decrease by percentage
            updatedValue -= (updatedValue * value) / 100;
            break;
          default:
            console.log('Invalid operation.');
            return NaN; // Return NaN for invalid operations
        }
  
        // Apply rounding to the updated value after the operation
        const roundedValue = this.roundValue(updatedValue);
  
        // Log the row ID and the updated value
        console.log(
          `Row ID: ${this.selectedRow[index].ID}, Updated Value: ${roundedValue}`
        );
  
        // Return the rounded value
        return roundedValue;
      });
  
      // Log the result for each row
      console.log(
        'Updated Values for Each Selected Row (After Operation and Rounding):',
        this.operationResult
      );
    }
  
    roundValue(updatedValue: number) {
      // Check if we have a valid number to round
      if (isNaN(updatedValue)) {
        console.log('Invalid value for rounding.');
        return updatedValue; // Return the value as is if it's invalid
      }
  
      // Apply the selected rounding option
      switch (this.roundingValue) {
        case 'none':
          return updatedValue; // No rounding
        case 'nearest':
          return Math.round(updatedValue); // Round to the nearest whole number
        case 'down':
          return Math.floor(updatedValue); // Round down (floor)
        case 'up':
          return Math.ceil(updatedValue); // Round up (ceil)
        default:
          console.log('Invalid rounding option.');
          return updatedValue; // Default to no rounding if invalid option
      }
    }
  
    checkInitialSchema() {
      if (this.selectedSchema) {
          // If there's already a selected schema, check its REMARKS value
          this.isGridVisible = this.selectedSchema.REMARKS === '4'; // true if '4', false otherwise
      } else {
          // If no schema is selected initially, set the grid to hidden
          this.isGridVisible = false;
      }
  }
  
    onSchemaChanged(event: any) {
      const selectedValue = event.value; // This is the ID of the selected schema
   console.log("onchemachanged triggered")
      this.selectedSchema = this.promotionSchema.find(
        (schema) => schema.ID === selectedValue
      );
      console.log(this.selectedSchema.REMARKS,"--------------===")
      if (!this.selectedSchema) {
        console.error('Selected schema not found');
        return; // Exit the function if schema is not found
      }
      if (this.selectedSchema.REMARKS == '4') {
        console.log("REMARKS IS 4")
        this.originalGridHeight = '300px'; // Set the height to 540px if REMARKS is not 4
      } else {
        // Optionally, you can set the height back to the default if REMARKS is '4'
        this.originalGridHeight = '540px'; // Leave it empty or set to a default value
      }
      // this.showGrid = this.selectedSchema.REMARKS === '4';
      const selectedSchema = this.promotionSchema.find(
        (schema) => schema.ID === event.value  // Use event.value to get the selected ID
      );
      console.log(selectedSchema, "SELECTEDSCHEMA");
      this.selectedSchemaType = this.promotionSchema.find((schema) => schema.REMARKS)
      if (selectedSchema) {
        this.selectedSchemaId = selectedSchema.ID;
        this.selectedSchemaName = selectedSchema.DESCRIPTION;
        console.log(this.selectedSchemaName,"ONSCHEMACHANGEDDD")
        // if(this.selectedSchemaType.REMARKS == '4'){
        //   this.isBuy = 1;
        //   this.isGet = 1
        // }
        console.log(
          'Selected Schema:',
          this.selectedSchemaName,
          this.selectedSchemaId
        );
      }
    }
  
    onRoundingValueChanged() {
      // Recalculate result when operation changes
      this.calculateResult();
    }
  
    onValueInputChange() {
      // Recalculate result whenever input value changes
      this.calculateResult();
    }
  
    applySelectedValue() {
      if (this.firstDropdownValue === 'cost') {
        this.valueToUse = this.selectedCost; // Assign array of costs
        // Log each row's cost with its ID
        this.selectedRow.forEach((row, index) => {
          console.log(`Row ID: ${row.ID}, Cost: ${this.selectedCost[index]}`);
        });
        // console.log(this.valueToUse, 'COSTS OF SELECTED ROWS');
      } else if (this.firstDropdownValue === 'salePrice') {
        this.valueToUse = this.selectedSalePrice; // Assign array of sale prices
        // Log each row's sale price with its ID
        this.selectedRow.forEach((row, index) => {
          console.log(
            `Row ID: ${row.ID}, Sale Price: ${this.selectedSalePrice[index]}`
          );
        });
        // console.log(this.valueToUse, 'SALE PRICES OF SELECTED ROWS');
      }   else if (this.firstDropdownValue === 'defaultPrice') {
        if (!this.defaultTextValue) {
          console.error('Default value is required.');
          return;
        }
        // console.log('Default value entered:', this.defaultTextValue);
        const fieldName = 'PROMOTION_PRICE'; // This could be dynamic too if needed
        this.selectedRow.forEach((row) => {
          const matchingRow = this.worksheetpromotionSchema.find((gridRow) => gridRow.ID === row.ID);
          if (matchingRow) {
            matchingRow.PROMOTION_PRICE = this.defaultTextValue; // Directly updating the field
            matchingRow.PROMOTION_NAME = this.promotionName;
          }
        });
      }
      else {
        console.log('Please select a valid option.');
        return;
      }
      console.log('Using values for processing:', this.valueToUse);
    }
  
    onSaleStatusChange(event: any) {
      console.log('Radio button value changed:', event.value);
      this.toggleFields(event.value === true);
    }
  
    toggleFields(isLeftSelected: boolean) {
      if (isLeftSelected) {
        // Select left side, deselect right side
        this.onSaleStatus = true;
        this.schemaLevelPromotion = null;
      } else {
        // Select right side, deselect left side
        this.onSaleStatus = null;
        this.schemaLevelPromotion = true;
      }
    }
  
  
    savePromotion() {
      const companyId = 1; // example company ID
      const userId = this.userId; // example user ID
      const narration = ''; // Provide a meaningful narration
    
      if (!this.selectedRow) {
        console.error('Selected row or promotion price is missing');
        return;
      }
    
      let worksheetPromotionSchema = [];
    
      if (this.selectedSchemaId) {
        console.log(this.selectedSchemaId, "]]]");
    
        const selectedSchema = this.promotionSchema.find(
          (schema) => schema.ID === this.selectedSchemaId
        );
    
        if (selectedSchema) {
          if (selectedSchema.REMARKS !== '4') {
            worksheetPromotionSchema = this.selectedRow.map((row) => ({
              ITEM_ID: row.ITEM_ID, // ITEM_ID from the selected row
              PRICE: row.SALE_PRICE ?? row.PRICE, // SALE_PRICE from the selected row
              COST: row.COST || 0, // COST from the selected row
              PROMOTION_PRICE: row.PROMOTION_PRICE || 0, // PROMOTION_PRICE from the selected row
              DATE_FROM: this.fromDate, // Assuming you have fromDate defined somewhere
              DATE_TO: this.toDate, // Assuming you have toDate defined somewhere
              TIME_FROM:this.timeFrom,
              TIME_TO: this.timeTo,
              PROMOTION_SCHEMA_ID: this.selectedSchemaId || 0, // Using selected schema ID or defaulting to 0
              PROMOTION_WEEKDAYS: this.selectedDays.join(','),// Assuming selectDays is a method returning the weekdays
              PROMOTION_LEVEL: this.selectedPromotionLevel,
              IS_INACTIVE: 0, // Assuming inactive is set to 0
              PROMOTION_NAME:  this.selectedSchemaName || (Array.isArray(row.PROMOTION_NAME) 
              ? row.PROMOTION_NAME.join(',') 
              : row.PROMOTION_NAME || ''), // Assuming promotionName is a defined value
              IS_BUY: this.isBuy , // Assuming IS_BUY is set to 0
              IS_GET: this.isGet , 
              IS_HAPPY_HOUR: this.isHappyHoursEnabled,
            }));
          }
          else{
            // console.log(this.filteredItems,"-----------------------")
            const additionalSchemaItems = this.filteredItems.map((item) => ({
              ITEM_ID: item.ITEM_ID,
              PRICE: item.SALE_PRICE ?? item.PRICE,
              COST: item.COST || 0,
              PROMOTION_PRICE: item.PROMOTION_PRICE || 0,
              DATE_FROM: this.fromDate,
              DATE_TO: this.toDate,
              TIME_FROM: this.timeFrom,
              TIME_TO: this.timeTo,
              PROMOTION_SCHEMA_ID: this.selectedSchemaId,
              PROMOTION_WEEKDAYS: this.selectedDays.join(','),
              PROMOTION_LEVEL: this.selectedPromotionLevel,
              IS_INACTIVE: 0,
              PROMOTION_NAME: this.selectedSchemaName || (Array.isArray(item.PROMOTION_NAME) 
              ? item.PROMOTION_NAME.join(',') 
              : item.PROMOTION_NAME || ''),
              IS_BUY: 0, // Set IS_BUY to 0 for REMARKS === '4'
              IS_GET: 1, // Set IS_GET to 1 for REMARKS === '4'
              IS_HAPPY_HOUR: this.isHappyHoursEnabled,
            }));
            worksheetPromotionSchema = [
              ...this.selectedRow.map((row) => ({
                ITEM_ID: row.ITEM_ID,
                PRICE: row.SALE_PRICE ?? row.PRICE,
                COST: row.COST || 0,
                PROMOTION_PRICE: row.PROMOTION_PRICE || 0,
                DATE_FROM: this.fromDate,
                DATE_TO: this.toDate ,
                TIME_FROM: this.timeFrom ,
                TIME_TO: this.timeTo,
                PROMOTION_SCHEMA_ID: this.selectedSchemaId || 0,
                PROMOTION_WEEKDAYS: this.selectedDays.join(','),
                PROMOTION_LEVEL: this.selectedPromotionLevel,
                IS_INACTIVE: 0,
                PROMOTION_NAME: this.selectedSchemaName || (Array.isArray(row.PROMOTION_NAME) 
                ? row.PROMOTION_NAME.join(',') 
                : row.PROMOTION_NAME || ''),
                IS_BUY: this.isBuy,
                IS_GET: this.isGet,
                IS_HAPPY_HOUR: this.isHappyHoursEnabled,
              })),
              ...additionalSchemaItems, // Add the selectedItems to the schema
            ];
            // worksheetPromotionSchema = [...additionalSchemaItems];
            console.log(worksheetPromotionSchema,"WORKSHEEETPROMOTION1234555")
            console.log(additionalSchemaItems,"ADDITIONAL1234566")
          }
        }
      }else {
        // If selectedSchemaId is not set, default behavior (without schema logic)
        worksheetPromotionSchema = this.selectedRow.map((row) => ({
          ITEM_ID: row.ITEM_ID, // ITEM_ID from the selected row
          PRICE: row.SALE_PRICE ?? row.PRICE,
          COST: row.COST || 0, // COST from the selected row
          PROMOTION_PRICE: row.PROMOTION_PRICE || 0, // PROMOTION_PRICE from the selected row
          DATE_FROM: this.fromDate,
          DATE_TO: this.toDate,
          TIME_FROM: this.timeFrom,
          TIME_TO: this.timeTo,
          PROMOTION_SCHEMA_ID: this.selectedSchemaId || 0, // Using selected schema ID or defaulting to 0
          PROMOTION_WEEKDAYS: this.selectedDays.join(','),
          PROMOTION_LEVEL: this.selectedPromotionLevel,
          IS_INACTIVE: 0,
          PROMOTION_NAME:  (Array.isArray(row.PROMOTION_NAME) 
          ? row.PROMOTION_NAME.join(',') 
          : row.PROMOTION_NAME || ''),
          IS_BUY: 1,
          IS_GET: 0,
          IS_HAPPY_HOUR: this.isHappyHoursEnabled,
        }));
      }
    
      console.log('Worksheet Promotion Schema:', worksheetPromotionSchema);
    
      const payload = {
        ID: this.worksheetData.ID,
        COMPANY_ID: companyId,
        USER_ID: userId,
        STORE_ID: this.selectedStoreId.join(','),
        NARRATION: this.narration,
        worksheet_promotion_schema: worksheetPromotionSchema,
      };
    
      console.log('Payload for save:', payload);
    
      this.dataservice.updatePromotion(payload).subscribe(
        (response: any) => {
          console.log(response, 'SAVE RESPONSE');
          try {
            notify(
              {
                message: 'Promotion updated successfully',
                position: { at: 'top right', my: 'top right' },
              },
              'success'
            );
            this.router.navigate(['/Promotion']);
            this.dataGrid.instance.refresh();
          } catch (error) {
            notify(
              {
                message: 'Add operation failed',
                position: { at: 'top right', my: 'top right' },
              },
              'error'
            );
          }
        },
        (error) => {
          console.error('Error saving promotion:', error);
        }
      );
    }
    
  
    setPromotion(selectedRowKeys: any[]) {
      if(!this.selectedDays){
        console.log("Please select at least one day to set promotion.")
          notify(
            {
              message: 'Please select at least one day to set promotion.',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
        else {
          this.isVisible = true; // Open the popup when rows are selected
        }
      
    }
  
    selectDays() {
      const selectedDaysArray = Object.keys(this.selectedDays).filter(
        (day) => this.selectedDays[day]
      );
      if (selectedDaysArray.length === 0) {
        alert('Please select at least one day to apply promotion.');
      } else {
        // Join the selected days into a comma-separated string
        const selectedDaysString = selectedDaysArray.join(',');
  
        console.log(
          'Promotion applied on the following days:',
          selectedDaysString
        );
        return selectedDaysString; // Return or use the joined string where needed
      }
    }
    onPriceLevelChanged(event: any): void {
      // Handle change in promotion level selection
      this.selectedPromotionLevel = event.value;
      console.log('Selected promotion level:', this.selectedPromotionLevel);
    }
  
    onDropdownValueChanged(event: any) {
      const selectedStoreIds = event.value;
      console.log(selectedStoreIds, 'selectedstoreids');
      this.storeIds =
        selectedStoreIds.length > 0 ? selectedStoreIds.join(',') : '1';
      console.log(this.storeIds, 'storeids');
      this.listItemsByMultipleStoreIds(this.storeIds);
    }
    handleDaySelection(event: any) {
      this.selectedDays = event.value;
      console.log('Selected Days:', this.selectedDays);
    }
    checkDateSelection(event: any) {
      if (this.fromDate && !(this.fromDate instanceof Date)) {
        this.fromDate = new Date(this.fromDate); // Convert if not Date
      }
      if (this.toDate && !(this.toDate instanceof Date)) {
        this.toDate = new Date(this.toDate); // Convert if not Date
      }
      this.fromDate = this.fromDate ? this.formatDate(this.fromDate) : null;
      this.toDate = this.toDate ? this.formatDate(this.toDate) : null;
      this.areDatesSelected = !!this.fromDate && !!this.toDate;
      console.log('From Date:', this.fromDate);
      console.log('To Date:', this.toDate);
      console.log('Are Dates Selected?', this.areDatesSelected);
    }
  
    onDateTimeChanged(event: any) {
      const selectedDateTime = event.value;
  
      // Extract the date part
      const datePart = selectedDateTime.toISOString().split('T')[0];  // 'yyyy-MM-dd'
      
      // Extract the time part
      const timePart = selectedDateTime.toISOString().split('T')[1].slice(0, 8);  // 'HH:mm:ss'
      
      console.log('Selected Date:', datePart);
      console.log('Selected Time:', timePart);
  
      // Optionally store the extracted date and time separately
      this.fromTime = timePart;  // You can store it in a variable like this
      this.toTime = timePart;  // Store time as well if needed
    }
  
    formatDate(date: Date): string {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed, so add 1
      const day = String(date.getDate()).padStart(2, '0'); // Ensure day is always two digits
  
      return `${year}-${month}-${day}`;
    }
  
    Cancel(){
      this.router.navigate(['/Promotion'])
    }
  
    clearFilter() {
      this.filteredItemStoresList = [];
      this.selectedSchemaId=null;
      this.originalGridHeight = '540px'; // Reset to the original size
    }
  
  
    validateNumber(event: any): void {
      const inputValue = event.value || ''; // Get the current value
      const sanitizedValue = inputValue.replace(/[^0-9]/g, ''); // Remove non-numeric characters
  
      // Update the value in the dx-text-box
      event.component.option('value', sanitizedValue);
  
      // Show or hide the error message based on input validity
      this.showError = sanitizedValue !== inputValue;
    }
  
  }
  

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    ItemsFormModule,
    DxTabsModule,
    DxTemplateModule,
    DxoFormItemModule,
    DxToolbarModule,
    DxRadioGroupModule,
    DxPopupModule,
    DxTagBoxModule,
    DxNumberBoxModule,
    DxValidationGroupModule,
    DxValidatorModule
  ],
  providers: [],
  exports: [PromotionEditComponent],
  declarations: [PromotionEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PromotionEditModule {}