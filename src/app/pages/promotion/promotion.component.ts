import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { error } from 'console';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxProgressBarModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTabsModule,
  DxTagBoxModule,
  DxTemplateModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import {
  DxoFormItemModule,
  DxoItemModule,
  DxoLookupModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.scss'],
})
export class PromotionComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  itemsList: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  minDate: Date = new Date(); // Today's date
  fromDate: any = new Date(); // Default value for 'from' date
  toDate: any = new Date();
  fromTime:any = new Date();
  toTime:any = new Date();
  department: any;
  catagory: any;
  brand: any;
  itemStoresList: any;
  selectedStoreId: any;
  storeIds: any;
  store: any;
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
  // selectedDays: (number | string)[] = [];
  selectedDays: any;
  isAllDaysSelected = false;
  roundingOptions = [
    { text: 'Do not round the result', value: 'none' },
    { text: 'Round to the nearest value', value: 'nearest' },
    { text: 'Round down', value: 'down' },
    { text: 'Round up', value: 'up' },
  ];
  operationOptions = [
    { label: '+', value: '+' },
    { label: '-', value: '-' },
    { label: '*', value: '*' },
    { label: '/', value: '/' },
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
  operationValue: string = '+';
  selectedSchema: any;
  roundingValue: string;
  // onSaleStatus: boolean = false;
  onSaleStatus: boolean | null = null;
  schemaLevelPromotion: boolean | null = null;
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
  selectedRowKeys: any;
  salePrice: number;
  selectedRowIndex: number;
  selectedItem: any;
  selectedPrice: number = 0;
  selectedCost: any[] = [];
  selectedSalePrice: any[] = [];
  valueToUse: number[] = [];
  selectedRow: any;
  areDatesSelected = false;
  AllowCommitWithSave: string;
  worksheetPromotionSchema: any[] = [];
  selectedId: any;
  userId: string;
  selectedPromotionSchemaId: any;
  updatedItems: { [key: number]: any } = {};
  selectedSchemaId: number; // To store the selected ID
  selectedSchemaName: string;
  disableRightColumn = false;
  promotionLevel: any;
  isLeftActive: boolean = true;
  selectedOption: string = 'onSaleStatus';
  showDropdown: boolean;
  selectedPromotionLevel: any;
  defaultTextValue:any;
  selectedSchemaType: any;
  originalGridHeight = '540px';
  filteredItemStoresList: any;
  selectedRowForNewList: any;
  selectedRowNew: any;
  heading: string = 'Items on Promotion';
  popupForItemsToGet: boolean;
  selectedItems: any;
  isBuy: any;
  isGet: any;
  showError: boolean;
  showTooltip = false;
  isTimeRangeEnabled: boolean = false;
  timeRange: any; 
  isHappyHoursEnabled: boolean = false;
  happyHoursPopup: boolean = false;
  narration: any;
  get displayTimeRange(): string {
    return this.fromTime && this.toTime
      ? `${this.fromTime} - ${this.toTime}`
      : 'Select Time Range';
  }
  isLoading: boolean = true;
  isPromotionApplied: boolean = false;
  isRowsSelected: boolean = false;

  constructor(private dataservice: DataService, private router: Router) {
   
  }

  ngOnInit() {
    this.AllowCommitWithSave = sessionStorage.getItem('AllowCommitWithSave');
    this.userId = sessionStorage.getItem('UserId');
    this.loadStores();
    const defaultStoreId = '1';
    this.listItemsByMultipleStoreIds(defaultStoreId);
    this.schemaOptions();
    this.loadDropdownData(); 
  }



  private loadDropdownData(): void {
    this.dataservice.getDropdownData('DEPARTMENT').subscribe((data) => {
      this.department = data;
    });

    this.dataservice.getDropdownData('ITEMCATEGORY').subscribe((data) => {
      this.catagory = data;
    });

    this.dataservice.getDropdownData('BRAND').subscribe((data) => {
      this.brand = data;
    });

    this.dataservice.getDropdownData('PROMOTION_LEVEL').subscribe((data) => {
      if (data && data.length > 0) {
        this.promotionLevel = data;

        if (this.promotionLevel.length > 1) {
          this.showDropdown = true; // More than one level, show dropdown
        } else {
          this.selectedPromotionLevel = this.promotionLevel[0].value; // Only one level, set as default
          this.showDropdown = false;
        }
      } else {
        this.promotionLevel = [{ text: 'Level 0', value: 0 }];
        this.selectedPromotionLevel = 0;
        this.showDropdown = false;
      }
    });
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

dateCellTemplate(cellElement: any, cellInfo: any) {
  if (cellInfo.value) {
    const date = new Date(cellInfo.value);
    const dateFormat = sessionStorage.getItem('dateFormat') || 'MM/DD/YYYY';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = String(date.getFullYear());
    let formattedDate = dateFormat
      .replace('dd', day)
      .replace('mm', month)
      .replace('yyyy', year)
      .replace('yy', year.slice(-2));
    cellElement.innerText = formattedDate;
  } else {
    cellElement.innerText = '';
  }
}


  onPriceLevelChanged(event: any): void {
    // Handle change in promotion level selection
    this.selectedPromotionLevel = event.value;
    // console.log('Selected promotion level:', this.selectedPromotionLevel);
  }

  toggleContainers() {
    this.onSaleStatus = !this.onSaleStatus;
  }

  onSaleStatusChange(event: any) {
    // console.log('Radio button value changed:', event.value);
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

  onOptionChange(event: any) {
    this.selectedOption = event.value;
    // console.log(this.selectedSchemaType,"SCHEMATYPE")

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

  schemaOptions() {
    this.dataservice.getDropdownData('PROMOTIONSCHEMA').subscribe((data) => {
      this.promotionSchema = data;
      // console.log(data, 'schemadropdown');
    });
  }

  onSchemaChanged(event: any) {
    const selectedSchema = this.promotionSchema.find(
      (schema) => schema.ID == event.value  // Use event.value to get the selected ID
    );
    // console.log(selectedSchema.REMARKS,"SELECTEDSCHEMA")
    if (selectedSchema) {
      this.selectedSchemaId = selectedSchema.ID;
      this.selectedSchemaName = selectedSchema.DESCRIPTION;
      // console.log(selectedSchema.REMARKS,"REMARKSSSSSSSSSSSSS")
      if(selectedSchema.REMARKS == '4'){
        // console.log("schemachangeddddddddd")
        this.isBuy = 1;
        this.isGet = 0;
      }else if(selectedSchema.REMARKS == '1'){
        this.isBuy = 1;
        this.isGet = 0;
      }else if(selectedSchema.REMARKS == '2'){
        this.isBuy = 1;
        this.isGet = 1;
      }else if(selectedSchema.REMARKS == '3'){
        this.isBuy = 1;
        this.isGet = 0;
      }
      // console.log(
      //   'Selected Schema:',
      //   this.selectedSchemaName,
      //   // this.selectedSchemaId,
      //   // this.selectedSchemaType
      // );
    }
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
  



  onDropdownValueChanged(event: any) {
    const selectedStoreIds = event.value;
    // console.log(selectedStoreIds, 'selectedstoreids');
    this.storeIds =
      selectedStoreIds.length > 0 ? selectedStoreIds.join(',') : '1';
    // console.log(this.storeIds, 'storeids');
    this.listItemsByMultipleStoreIds(this.storeIds);
  }

  loadStores() {
    this.dataservice.getStoresData().subscribe((response) => {
      // Filter out the central store
      this.store = response.filter((store: any) => store.STORE_NAME !== 'CENTRAL STORE');
      console.log(this.store, 'Filtered Stores');
    });
  }
  
  handleDateChange() {
    if (this.fromDate && this.toDate) {
      // console.log('From Date:', this.fromDate.toString()); // Logs full date and time
      // console.log('To Date:', this.toDate.toString());
    }
  }

  setPromotion(selectedRowKeys: any[]) {
    console.log(this.selectedStoreId,"INSETPROMOTION")

    if (!selectedRowKeys || selectedRowKeys.length === 0) {
      notify(
        {
          message: 'Please select at least one row to set promotion.',
          position: { at: 'top right', my: 'top right' },
        },
        'error'
      );
    } 
  else if(!this.selectedDays){
    console.log("Please select at least one day to set promotion.")
      notify(
        {
          message: 'Please select at least one day to set promotion.',
          position: { at: 'top right', my: 'top right' },
        },
        'error'
      );
    }

    else if (this.selectedStoreId.length === 1 && this.selectedStoreId[0] === 1) {
      console.log("CENTRAL STORE cannot be selected for promotion.");
      notify(
        {
          message: 'Please select a store other than CENTRAL STORE to set promotion.',
          position: { at: 'top right', my: 'top right' },
        },
        'error'
      );
    }
  
    
    else if (!this.selectedStoreId || this.selectedStoreId.length === 0) {
     
      console.log("Please select at least one store to set promotion.");
      notify(
        {
          message: 'Please select at least one store to set promotion.',
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
// else {
      // Join the selected days into a comma-separated string
      const selectedDaysString = selectedDaysArray.join(',');
      return selectedDaysString; // Return or use the joined string where needed
    // }
  }

  onRowClick(event) {
    this.selectedRowIndex = event.rowIndex;
    // console.log('Selected Row:', event.data);
  }


  applyPromotion() {
    this.isPromotionApplied = true;
  
    // Validation: Ensure a schema or promotion details are selected
    if (!this.selectedSchemaId && !this.valueToUse) {
      alert('Please select a promotion schema or provide promotion details.');
      return; // Exit if no schema or promotion details are provided
    }
  
    if (this.selectedSchemaId) {
      const selectedSchema = this.promotionSchema.find(
        (schema) => schema.ID === this.selectedSchemaId
      );
      if (selectedSchema) {
        console.log(selectedSchema.REMARKS);
        if (selectedSchema.REMARKS === '4') {
          this.heading = 'Items To Buy';
  
          // Filter the item stores list
          this.filteredItemStoresList = this.itemStoresList.filter((item) => {
            const isItemSelected = this.selectedRow.some((row) => row.ID === item.ID);
            return !isItemSelected; // Keep only items that are NOT selected
          });
  
          this.originalGridHeight = '300px';
        }
  
        this.selectedSchemaName = selectedSchema.DESCRIPTION; // Store the selected schema name
  
        // Apply schema to selected rows
        this.selectedRow.forEach((row) => {
          const selectedRowIndex = this.itemStoresList.findIndex(
            (item) => item.ID === row.ID
          );
          if (selectedRowIndex !== -1) {
            this.itemStoresList[selectedRowIndex].PROMOTION_NAME =
              this.selectedSchemaName;
            this.itemStoresList[selectedRowIndex].PROMOTION_SCHEMA_ID =
              this.selectedSchemaId;
          } else {
            alert(`Item with ID ${row.ID} is not valid for this schema.`);
            return; // Exit if invalid item is found
          }
        });
  
        this.closePopup(); // Exit if schema is successfully applied
        return;
      } else {
        alert('Invalid schema selected. Please try again.');
        return; // Exit if no schema is found
      }
    }
  
    // Validation for manual promotion details
    const missingPromotionName =  !this.promotionName;

  
    if (missingPromotionName) {
      notify({
        message: 'Please provide Promotion Name',
        position: { at: 'top right', my: 'top right' },
      },
      'error'
    )
      // alert('Please provide both Promotion Name for all selected items.');
      return; // Exit if validation fails
    }
  
    // If no schema is selected, proceed with the promotion logic
    this.applySelectedValue();
  
    if (this.valueToUse != null) {
      this.calculateResult();
      this.updatePromotionPrice();
    }
  
    this.closePopup(); // Close the popup after applying promotion
  }
  


  // applyPromotion() {
  //   this.isPromotionApplied = true;
  //   if (this.selectedSchemaId) {
  //     const selectedSchema = this.promotionSchema.find(
  //       (schema) => schema.ID === this.selectedSchemaId
  //     );
  //     console.log(selectedSchema,"NEWWWWWWWWWWWWW")
  //     if (selectedSchema) {
  //       console.log(selectedSchema.REMARKS)
  //       if(selectedSchema.REMARKS == '4'){
  //         this.heading = 'Items To Buy';



  //         this.filteredItemStoresList = this.itemStoresList.filter((item) => {
  //           const isItemSelected = this.selectedRow.some((row) => row.ID === item.ID);
  
  //           return !isItemSelected; // Keep only items that are NOT selected
  //         });
  //         this.originalGridHeight = '300px'; 
  //       }
  //       this.selectedSchemaName = selectedSchema.DESCRIPTION
  //       this.selectedSchemaName = selectedSchema.DESCRIPTION; // Store the selected schema name
  //       this.selectedRow.forEach((row, index) => {
  //         const selectedRowIndex = this.itemStoresList.findIndex(
  //           (item) => item.ID === row.ID
  //         );
  //         if (selectedRowIndex !== -1) {
        
  //             this.itemStoresList[selectedRowIndex].PROMOTION_NAME =
  //             this.selectedSchemaName;
  //             this.itemStoresList[selectedRowIndex].PROMOTION_SCHEMA_ID =
  //             this.selectedSchemaId;

  //         } else {
  //         }
  //       });
  //     }
  //     this.closePopup(); // Exit the function early if schema is selected
  //     return;
  //   }
  
  //   // If no schema is selected, proceed with the promotion logic
  //   this.applySelectedValue();
  
  //   if (this.valueToUse != null) {
  //     this.calculateResult();
  //     this.updatePromotionPrice();
  //   }
    
  //   this.closePopup(); // Close the popup after applying promotion
  // }

  onAddClick(){
    this.popupForItemsToGet = true;
  }

  AddSelectedItems() {
    const selectedSchema = this.promotionSchema.find(
      (schema) => schema.ID === this.selectedSchemaId
    );
  
    if (selectedSchema) {
      console.log(selectedSchema, "SELECTED SCHEMA");
  
      // Update the selected items with schema details
      this.selectedItems = this.selectedRowNew.map((item) => ({
        ...item,
        PROMOTION_NAME: selectedSchema.DESCRIPTION,
        PROMOTION_SCHEMA_ID: this.selectedSchemaId,
        isBuy: selectedSchema.REMARKS === '4' ? 0 : this.isBuy,
        isGet: selectedSchema.REMARKS === '4' ? 1 : this.isGet,
      }));
  
      console.log(this.selectedItems, "UPDATED SELECTED ITEMS");
    }
  
    this.popupForItemsToGet = false; // Close the popup after adding items
  }
  

  // AddSelectedItems(){
  //   this.selectedItems = this.selectedRowNew;
  //   const selectedSchema = this.promotionSchema.find(
  //     (schema) => schema.ID === this.selectedSchemaId
  //   );
  //   console.log(selectedSchema,"INADDSELECTIONNNNN")
  //   console.log(this.selectedItems,"SELECTEDITEMSSSSSSSSSSSSSSSSSSSS")
  //   this.popupForItemsToGet = false;
  // }

  clearFilter() {
    this.filteredItemStoresList = [];
    this.selectedSchemaId=null;
    this.originalGridHeight = '540px'; // Reset to the original size
  }


  closePopup() {
    // this.selectedSchemaId = null;
    // this.selectedOption = '';
    // this.roundingValue = null;
    // this.operationInputValue = null;
    // this.defaultTextValue = null;
    // this.operationValue = null;
    // this.promotionName = null;
    this.isVisible = false; // Close the popup (bind this to `visible` in the popup component)
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
      this.selectedSalePrice.push(row.SALE_PRICE);
    });
  }

  onSelectionChangedforNewItem(e){
    this.selectedRowForNewList = e.selectedRowKeys;
    console.log(this.selectedRowForNewList, 'SELECTEDROWFORNEWLIST');
    this.selectedRowNew = e.selectedRowsData; // Gets the first selected row
    console.log(this.selectedRowNew, 'SELECTEDROW=====');
    setTimeout(() => {
      this.isRowsSelected = this.selectedRowNew.length > 0;
    });
    this.selectedRowNew = this.selectedRowNew.map((item) => ({
      ...item,
      PROMOTION_NAME : this.promotionName,
      isBuy: 0, // Always set isBuy to 0
      isGet: 1, // Always set isGet to 1
    }));

  }

  applySelectedValue() {
    if (this.firstDropdownValue === 'cost') {
      this.valueToUse = this.selectedCost; // Assign array of costs
      // Log each row's cost with its ID
      this.selectedRow.forEach((row, index) => {
        console.log(`Row ID: ${row.ID}, Cost: ${this.selectedCost[index]}`);
      });
      console.log(this.valueToUse, 'COSTS OF SELECTED ROWS');
    } else if (this.firstDropdownValue === 'salePrice') {
      this.valueToUse = this.selectedSalePrice; // Assign array of sale prices
      // Log each row's sale price with its ID
      this.selectedRow.forEach((row, index) => {
        console.log(
          `Row ID: ${row.ID}, Sale Price: ${this.selectedSalePrice[index]}`
        );
      });
      console.log(this.valueToUse, 'SALE PRICES OF SELECTED ROWS');
    }   else if (this.firstDropdownValue === 'defaultPrice') {
      if (!this.defaultTextValue) {
        console.error('Default value is required.');
        return;
      }
      console.log('Default value entered:', this.defaultTextValue);
      const fieldName = 'PROMOTION_PRICE'; // This could be dynamic too if needed
      this.selectedRow.forEach((row) => {
        const matchingRow = this.itemStoresList.find((gridRow) => gridRow.ID === row.ID);
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

  onRoundingValueChanged() {
    // Recalculate result when operation changes
    this.calculateResult();
  }

  onValueInputChange() {
    // Recalculate result whenever input value changes
    this.calculateResult();
  }
  // Method to perform the operation
  calculateResult() {
    // Convert operationInputValue to number (ensure it's a valid number)
    const value = parseFloat(this.operationInputValue);

    // Check if the entered value is a valid number
    if (isNaN(value)) {
      // console.log('Please enter a valid number.');
      this.operationResult = []; // Reset result if input is invalid
      return;
    }

    // Check for valid operation selection
    if (!this.operationValue) {
      // console.log('Please select a valid operation.');
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
            // console.log(`Cannot divide by zero for row ${index + 1}.`);
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
          // console.log('Invalid operation.');
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
        // console.log('Invalid rounding option.');
        return updatedValue; // Default to no rounding if invalid option
    }
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
        const selectedRowIndex = this.itemStoresList.findIndex(
          (item) => item.ID === row.ID
        );

        if (selectedRowIndex !== -1) {
          // Update the PROMOTION_PRICE for this row
          this.itemStoresList[selectedRowIndex].PROMOTION_PRICE =
            this.operationResult[index];
            this.itemStoresList[selectedRowIndex].PROMOTION_NAME =
            this.promotionName;
          console.log(
            `Updated PROMOTION_PRICE for row ID ${row.ID}:`,
            this.itemStoresList[selectedRowIndex]
          );
        } else {
          console.log(
            `Selected row with ID ${row.ID} not found in itemStoresList.`
          );
        }
      });
    } else {
      console.log('No selected rows or operation result is null.');
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed, so add 1
    const day = String(date.getDate()).padStart(2, '0'); // Ensure day is always two digits

    return `${year}-${month}-${day}`;
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
  }

  onDateTimeChanged(event: any) {
    const selectedDateTime = event.value;

    // Extract the date part
    const datePart = selectedDateTime.toISOString().split('T')[0];  // 'yyyy-MM-dd'
    const localTime = new Date(selectedDateTime);
    // Extract the time part
    const timePart = selectedDateTime.toISOString().split('T')[1].slice(0, 8);  // 'HH:mm:ss'
    const timePartLocal = localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); // 24-hour format
    console.log('Selected Date:', datePart);
    console.log('Selected Time:', timePart);

    // Optionally store the extracted date and time separately
    this.fromTime = timePartLocal;  // You can store it in a variable like this
    this.toTime = timePartLocal;  // Store time as well if needed
  }
  handleDisabledDropdownClick(): void {
    if (!this.areDatesSelected) {
      notify(
        {
          message:'Please select dates before choosing days',
          position: { at: 'top right', my: 'top right' },
        },
        'error'
      )
    }
  }

  handleDaySelection(event: any): void {
    this.selectedDays = event.value;
    // this.isAllDaysSelected =
    //   this.selectedDays.length === this.daysOfWeek.length &&
    //   this.selectedDays.every((value, index) => value === this.daysOfWeek[index].value);
    // this.selectedDays = 'All Days'
    console.log('Selected Days:', this.isAllDaysSelected ? 'All Days' : this.selectedDays);
  }
  
  

  // handleDaySelection(event: any) {
  //   this.selectedDays = event.value;
  //   console.log(this.selectDays,"daysss")
  //   if (event.value.length === this.daysOfWeek.length) {
  //     this.selectedDays = 'All days';
  //     console.log(this.selectDays,"SELECTEDDAYS")
  //   } else {
  //     this.selectedDays = event.value;
  //   }
  // }

  


  savePromotion() { 
    
    const companyId = 1; // example company ID
    const userId = this.userId; // example user ID
    const narration = '';
    let worksheetPromotionSchema = [];
    if (!this.selectedRow) {
      console.error('Selected row or promotion price is missing');
      return;
    }
    const storeID = this.selectedStoreId.join(',') || '1';
  
    // Check if selectedSchemaId is set and fetch the schema
    if (this.selectedSchemaId) {
      console.log(this.selectedSchemaId, "]]]");
      const selectedSchema = this.promotionSchema.find(
        (schema) => schema.ID === this.selectedSchemaId
      );
      console.log(selectedSchema, "SELECTEDSCHEMAAAAA");
  
      if (selectedSchema) {
        if (selectedSchema.REMARKS !== '4') {
          worksheetPromotionSchema = this.selectedRow.map((row) => ({
            ITEM_ID: row.ID, // ITEM_ID from the selected row
            PRICE: row.SALE_PRICE || 0, // SALE_PRICE from the selected row
            COST: row.COST || 0, // COST from the selected row
            PROMOTION_PRICE: row.PROMOTION_PRICE || 0, // PROMOTION_PRICE from the selected row
            DATE_FROM: this.fromDate,
            DATE_TO: this.toDate,
            TIME_FROM: this.fromTime,
            TIME_TO: this.toTime,
            PROMOTION_SCHEMA_ID: this.selectedSchemaId || 0,
            PROMOTION_WEEKDAYS: this.selectedDays.join(','),
            PROMOTION_LEVEL: this.selectedPromotionLevel,
            IS_INACTIVE: 0,
            PROMOTION_NAME: this.selectedSchemaName || row.PROMOTION_NAME,
            IS_BUY: this.isBuy,
            IS_GET: this.isGet,
            IS_HAPPY_HOUR: this.isHappyHoursEnabled,
          }));
        } else {
          const additionalSchemaItems = this.selectedItems.map((item) => ({
            ITEM_ID: item.ID,
            PRICE: item.SALE_PRICE || 0,
            COST: item.COST || 0,
            PROMOTION_PRICE: item.PROMOTION_PRICE || 0,
            DATE_FROM: this.fromDate,
            DATE_TO: this.toDate,
            TIME_FROM: this.fromTime,
            TIME_TO: this.toTime,
            PROMOTION_SCHEMA_ID: this.selectedSchemaId,
            PROMOTION_WEEKDAYS: this.selectedDays.join(','),
            PROMOTION_LEVEL: this.selectedPromotionLevel,
            IS_INACTIVE: 0,
            PROMOTION_NAME: this.selectedSchemaName || item.PROMOTION_NAME,
            IS_BUY: 0,
            IS_GET: 1,
            IS_HAPPY_HOUR: this.isHappyHoursEnabled,
          }));
          worksheetPromotionSchema = [
            ...this.selectedRow.map((row) => ({
              ITEM_ID: row.ID,
              PRICE: row.SALE_PRICE || 0,
              COST: row.COST || 0,
              PROMOTION_PRICE: row.PROMOTION_PRICE || 0,
              DATE_FROM: this.fromDate,
              DATE_TO: this.toDate,
              TIME_FROM: this.fromTime,
              TIME_TO: this.toTime,
              PROMOTION_SCHEMA_ID: this.selectedSchemaId || 0,
              PROMOTION_WEEKDAYS: this.selectedDays.join(','),
              PROMOTION_LEVEL: this.selectedPromotionLevel,
              IS_INACTIVE: 0,
              PROMOTION_NAME: this.selectedSchemaName || row.PROMOTION_NAME,
              IS_BUY: this.isBuy,
              IS_GET: this.isGet,
              IS_HAPPY_HOUR: this.isHappyHoursEnabled,
            })),
            ...additionalSchemaItems, // Add the selectedItems to the schema
          ];
        }
      }
    } else {
      // If selectedSchemaId is not set, default behavior (without schema logic)
      worksheetPromotionSchema = this.selectedRow.map((row) => ({
        ITEM_ID: row.ID, // ITEM_ID from the selected row
        PRICE: row.SALE_PRICE || 0, // SALE_PRICE from the selected row
        COST: row.COST || 0, // COST from the selected row
        PROMOTION_PRICE: row.PROMOTION_PRICE || 0, // PROMOTION_PRICE from the selected row
        DATE_FROM: this.fromDate,
        DATE_TO: this.toDate,
        TIME_FROM: this.fromTime,
        TIME_TO: this.toTime,
        PROMOTION_SCHEMA_ID: this.selectedSchemaId || 0, // Using selected schema ID or defaulting to 0
        PROMOTION_WEEKDAYS: this.selectedDays.join(','),
        PROMOTION_LEVEL: this.selectedPromotionLevel,
        IS_INACTIVE: 0,
        PROMOTION_NAME: this.selectedSchemaName || row.PROMOTION_NAME,
        IS_BUY: 1,
        IS_GET: 0,
        IS_HAPPY_HOUR: this.isHappyHoursEnabled,
      }));
    }
  
    const payload = {
      COMPANY_ID: companyId, // Company ID
      USER_ID: userId, // User ID
      STORE_ID: storeID || '1', // Store ID
      NARRATION: this.narration, // Narration (can be a more descriptive value)
      worksheet_promotion_schema: worksheetPromotionSchema, // This should have the data now
    };
  
    console.log(payload, "PAYLOAD IN SAVE");
  
    // Call the savePromotion API
    this.dataservice.savePromotion(payload).subscribe((response: any) => {
      console.log(response, 'SAVE RESPONSE');
      try {
        notify(
          {
            message: 'Promotion added successfully',
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
    });
  
  }
  
  Cancel() {
    this.router.navigate(['/Promotion']);
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
    DxValidatorModule,
  ],
  providers: [],
  exports: [PromotionComponent],
  declarations: [PromotionComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PromotionModule {}