import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  NgModule,
  NgZone,
  Output,
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
  DxSwitchModule,
  DxTabPanelModule,
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
import { confirm } from 'devextreme/ui/dialog';


@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.scss'],
})
export class PromotionComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  itemsList: any;
  @Output() popupClosed = new EventEmitter<void>();

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  minDate: Date = new Date(); // Today's date
  fromDate: any = new Date(); // Default value for 'from' date
  toDate: any = new Date();
  fromTime: any = new Date();
  toTime: any = new Date();
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
  selectedPriceLevel: any;
  operationValue: string = '+';
  selectedSchema: any;
  roundingValue: any;
  // onSaleStatus: boolean = false;
  onSaleStatus: boolean | null = null;
  schemaLevelPromotion: boolean | null = null;
  selectedOperation: string = '';
  promotionName: any;
  firstDropdownValue: any;
  firstDropdownOptions = [
    { label: 'Cost', value: 'cost' },
    { label: 'Price', value: 'salePrice' },
    // { label: 'Set Promotion Price To', value: 'defaultPrice' },
  ];
  promotionSchema: any;
  tagTemplate = (data: any) => {
    return `
      <div style="margin-right: 2px; display: inline-block; white-space: nowrap;">
        ${data.text}
      </div>
    `;
  };
  documentNo: string = '12345';
  selectedRowKeys: any;
  salePrice: any;
  selectedRowIndex: any;
  selectedItem: any;
  selectedPrice: number = 0;
  selectedCost: any[] = [];
  selectedSalePrice: any[] = [];
  valueToUse: number[] = [];
  selectedRow: any = [];
  areDatesSelected = false;
  AllowCommitWithSave: any;
  worksheetPromotionSchema: any[] = [];
  selectedId: any = [];
  userId: any;
  selectedPromotionSchemaId: any;
  updatedItems: { [key: number]: any } = {};
  selectedSchemaId: any; // To store the selected ID
  selectedSchemaName: any;
  disableRightColumn = false;
  promotionLevel: any;
  isLeftActive: boolean = true;
  selectedOption: any = 'onSaleStatus';
  showDropdown: boolean = false;
  selectedPromotionLevel: any;
  defaultTextValue: any;
  selectedSchemaType: any;
  originalGridHeight = '540px';
  filteredItemStoresList: any;
  selectedRowForNewList: any;
  selectedRowNew: any;
  // heading: any = 'Items on Promotion';
  popupForItemsToGet: boolean = false;
  selectedItems: any;
  isBuy: any;
  isGet: any;
  showError: boolean = false;
  showTooltip = false;
  isTimeRangeEnabled: boolean = false;
  timeRange: any;
  isHappyHoursEnabled: boolean = false;
  happyHoursPopup: boolean = false;
  narration: any;
  selected_Company_id: any;
  selectedTabIndex: any = 0;
  wsId: any;
  price_level: any;
  isSaving: boolean = false;
  storeDetails: any;
  get displayTimeRange(): string {
    return this.fromTime && this.toTime
      ? `${this.fromTime} - ${this.toTime}`
      : 'Select Time Range';
  }
  isLoading: boolean = true;
  isPromotionApplied: boolean = false;
  isRowsSelected: boolean = false;
  isHappyHoursEnabledvalue: any;
  selectedMode: 'price' | 'schema' = 'price';
  is_promotion_level: boolean = false
  approveValue: boolean = false
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  isFilterOpened = false;
  canVerify = false; constructor(
    private dataservice: DataService,
    private router: Router,
    private ngZone: NgZone,
  ) { }
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',

    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.onAddClick());
    },

    elementAttr: { class: 'add-button' },
    template: () => {
      return `
      <div class="add-btn-content">
        <span class="iconify"
              data-icon="formkit:add"
              data-width="20"
              data-height="20"></span>
        <span class="add-text">New</span>
      </div>
    `;
    },
  };

  ngOnInit() {
    const currentUrl = this.router.url;


    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    // this.sessionData_tax();
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      console.log(packingRights, '====packing rights====');
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.CanView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify;
      console.log(this.canVerify, 'VERIFY RIGHTS');
    }

    console.log('==========test data=============');
    this.AllowCommitWithSave = sessionStorage.getItem('AllowCommitWithSave');
    this.userId = sessionStorage.getItem('UserId');
    this.sesstion_Details();
    this.loadStores();
    const defaultStoreId = '1';
    this.listItemsByMultipleStoreIds();
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

    const payloadpromotionlevel = {
      NAME: 'PROMOTION_LEVEL',
    };
    this.dataservice
      .getDropdownData(payloadpromotionlevel)
      .subscribe((data) => {
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

  onModeChange(e: any) {
    const mode = e.value;
    console.log(e, '==================');

    if (mode === 'price') {
      // reset schema
      this.selectedSchemaId = 0;
    } else {
      // reset price fields
      this.firstDropdownValue = null;
      this.operationValue = '';
      this.operationInputValue = '';
      this.roundingValue = null;
      this.valueToUse = [];
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
      this.clearFilter();
      // this.selectedSchemaId = null; // Reset the value of the dx-select-box
    }
    if (this.selectedOption == 'schemaLevelPromotion') {
      this.firstDropdownValue = '';
      this.operationValue = '';
      this.defaultTextValue = '';
      this.operationInputValue = '';
      this.roundingValue = '';
    }
  }

  schemaOptions() {
    const payload = {
      NAME: 'PROMOTIONSCHEMA_TYPE',
    };
    this.dataservice.getDropdownData(payload).subscribe((data) => {
      this.promotionSchema = data;
      // console.log(data, 'schemadropdown');
    });
  }

  onSchemaChanged(event: any) {
    this.selectedOption = '';
    this.roundingValue = null;
    this.operationInputValue = '';
    this.defaultTextValue = null;
    this.operationValue = '';
    this.promotionName = null;

    const selectedSchema = this.promotionSchema.find(
      (schema: any) => schema.ID == event.value, // Use event.value to get the selected ID
    );
    // console.log(selectedSchema.REMARKS,"SELECTEDSCHEMA")
    if (selectedSchema) {
      this.selectedSchemaId = selectedSchema.ID;
      this.selectedSchemaName = selectedSchema.DESCRIPTION;
      // console.log(selectedSchema.REMARKS,"REMARKSSSSSSSSSSSSS")
      if (selectedSchema.REMARKS == '4') {
        // console.log("schemachangeddddddddd")
        this.isBuy = 1;
        this.isGet = 0;
      } else if (selectedSchema.REMARKS == '1') {
        this.isBuy = 1;
        this.isGet = 0;
      } else if (selectedSchema.REMARKS == '2') {
        this.isBuy = 1;
        this.isGet = 1;
      } else if (selectedSchema.REMARKS == '3') {
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

  listItemsByMultipleStoreIds(): void {
    const allStoreIds = '2,3,4'; // Define all store IDs here

    // Determine the payload based on the storeId
    // const payloadStoreIds = storeIds === '1' ? allStoreIds : storeIds;

    this.isLoading = true;

    this.dataservice.getItemListByStoreId().subscribe(
      (response: any) => {
        this.itemStoresList = response.PriceWizardData;
        this.isLoading = false;
        console.log(
          this.itemStoresList,
          'Items loaded for store IDs:',
          allStoreIds,
        );
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching item list for store IDs:', error);
      },
    );
  }

  onDropdownValueChanged(event: any) {
    const selectedStoreIds = event.value;
    // console.log(selectedStoreIds, 'selectedstoreids');
    this.storeIds =
      selectedStoreIds.length > 0 ? selectedStoreIds.join(',') : '1';
    // console.log(this.storeIds, 'storeids');
    // this.listItemsByMultipleStoreIds(this.storeIds);
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '',
    );

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.is_promotion_level = sessionData.GeneralSettings.ENABLE_PROMOTION_LEVEL

  }

  loadStores() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.getStoresData(payload).subscribe((response) => {
      // Filter out the central store
      this.store = response.filter(
        (store: any) => store.STORE_NAME !== 'CENTRAL STORE',
      );
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
    console.log(this.selectedStoreId, 'INSETPROMOTION');
    this.isVisible = true; // Open the popup when rows are selected
  }

  selectDays() {
    const selectedDaysArray = Object.keys(this.selectedDays).filter(
      (day) => this.selectedDays[day],
    );
    // else {
    // Join the selected days into a comma-separated string
    const selectedDaysString = selectedDaysArray.join(',');
    return selectedDaysString; // Return or use the joined string where needed
    // }
  }

  onRowClick(event: any) {
    this.selectedRowIndex = event.rowIndex;
    // console.log('Selected Row:', event.data);
  }

  applyPromotion() {
    this.isPromotionApplied = true;

    // ✅ Validate row selection
    if (!this.selectedRow || this.selectedRow.length === 0) {
      notify({ message: 'Please select at least one item.' }, 'error');
      return;
    }

    // =========================
    // ✅ SCHEMA MODE ONLY
    // =========================
    if (this.selectedMode === 'schema') {
      if (!this.selectedSchemaId) {
        notify({ message: 'Please select schema.' }, 'error');
        return;
      }

      const schema = this.promotionSchema.find(
        (s: any) => s.ID == this.selectedSchemaId,
      );

      if (!schema) {
        notify({ message: 'Invalid schema.' }, 'error');
        return;
      }

      this.selectedRow.forEach((row: any) => {
        const index = this.itemStoresList.findIndex(
          (item: any) => item.ID === row.ID,
        );

        if (index !== -1) {
          // ✅ ONLY schema fields updated
          this.itemStoresList[index].PROMOTION_SCHEMA_ID = schema.ID;
          this.itemStoresList[index].PROMOTION_NAME = schema.DESCRIPTION;

          // ❌ CLEAR price fields (important)
          this.itemStoresList[index].PROMOTION_PRICE = null;
        }
      });

      console.log('Schema applied ✅');

      this.closePopup();
      return; //  STOP here
    }

    // =========================
    // ✅ PRICE MODE ONLY
    // =========================
    if (this.selectedMode === 'price') {
      if (!this.promotionName) {
        notify({ message: 'Enter promotion name.' }, 'error');
        return;
      }

      this.applySelectedValue();

      if (!this.valueToUse || this.valueToUse.length === 0) {
        notify({ message: 'Please select a valid option.' }, 'error');
        return;
      }

      this.calculateResult();

      this.selectedRow.forEach((row: any, index: any) => {
        const i = this.itemStoresList.findIndex(
          (item: any) => item.ID === row.ID,
        );

        if (i !== -1) {
          // ✅ ONLY price fields updated
          this.itemStoresList[i].PROMOTION_PRICE = this.operationResult[index];

          this.itemStoresList[i].PROMOTION_NAME = this.promotionName;

          // ❌ CLEAR schema fields (important)
          this.itemStoresList[i].PROMOTION_SCHEMA_ID = null;
        }
      });

      console.log('Price applied ✅');

      this.closePopup();
    }
  }
  onAddClick() {
    this.popupForItemsToGet = true;
  }

  AddSelectedItems() {
    const selectedSchema = this.promotionSchema.find(
      (schema: any) => schema.ID === this.selectedSchemaId,
    );

    if (selectedSchema) {
      console.log(selectedSchema, 'SELECTED SCHEMA');

      // Update the selected items with schema details
      this.selectedItems = this.selectedRowNew.map((item: any) => ({
        ...item,
        PROMOTION_NAME: selectedSchema.DESCRIPTION,
        PROMOTION_SCHEMA_ID: this.selectedSchemaId,
        isBuy: selectedSchema.REMARKS === '4' ? 0 : this.isBuy,
        isGet: selectedSchema.REMARKS === '4' ? 1 : this.isGet,
      }));

      console.log(this.selectedItems, 'UPDATED SELECTED ITEMS');
    }

    this.popupForItemsToGet = false; // Close the popup after adding items
  }

  get isPriceLevel() {
    return this.selectedTabIndex === 0;
  }

  get isSchemaLevel() {
    return this.selectedTabIndex === 1;
  }

  clearFilter() {
    this.filteredItemStoresList = [];
    this.selectedSchemaId = null;
    this.originalGridHeight = '540px'; // Reset to the original size
  }

  closePopup() {
    this.selectedSchemaId = null;
    this.selectedOption = '';
    this.roundingValue = null;
    this.operationInputValue = '';
    this.defaultTextValue = null;
    this.operationValue = '';
    this.promotionName = null;
    this.isVisible = false; // Close the popup (bind this to `visible` in the popup component)
  }

  onSelectionChanged(e: any) {

    console.log(e, '-----------select grid ----------------')
    this.selectedRowKeys = e.selectedRowKeys || [];
    this.selectedRow = e.selectedRowsData || [];

    // ✅ Always reset arrays safely
    this.selectedId = [];
    this.selectedCost = [];
    this.selectedSalePrice = [];
    // ✅ Correct condition for unselect (EMPTY)
    if (!this.selectedRowKeys.length) {
      console.log('No selection → All values reset to zero');
      return;
    }


    if (!this.selectedRow || this.selectedRow.length === 0) {
      return;
    }

    this.selectedRow.forEach((row: any) => {
      if (!row) return;

      this.selectedId.push(row.ID || 0);
      this.selectedCost.push(row.COST || 0);
      this.selectedSalePrice.push(row.SALE_PRICE || 0);
    });

    console.log('Selected IDs:', this.selectedId);
  }
  onSelectionChangedselectedDayas(e: any) { }

  onSelectionChangedforNewItem(e: any) {
    this.selectedRowForNewList = e.selectedRowKeys;
    console.log(this.selectedRowForNewList, 'SELECTEDROWFORNEWLIST');
    this.selectedRowNew = e.selectedRowsData; // Gets the first selected row
    console.log(this.selectedRowNew, 'SELECTEDROW=====');
    setTimeout(() => {
      this.isRowsSelected = this.selectedRowNew.length > 0;
    });
    this.selectedRowNew = this.selectedRowNew.map((item: any) => ({
      ...item,
      PROMOTION_NAME: this.promotionName,
      isBuy: 0, // Always set isBuy to 0
      isGet: 1, // Always set isGet to 1
    }));
  }

  applySelectedValue() {
    if (this.firstDropdownValue === 'cost') {
      this.valueToUse = this.selectedCost; // Assign array of costs
      // Log each row's cost with its ID
      this.selectedRow.forEach((row: any, index: any) => {
        console.log(`Row ID: ${row.ID}, Cost: ${this.selectedCost[index]}`);
      });
      console.log(this.valueToUse, 'COSTS OF SELECTED ROWS');
    } else if (this.firstDropdownValue === 'salePrice') {
      this.valueToUse = this.selectedSalePrice; // Assign array of sale prices
      // Log each row's sale price with its ID
      this.selectedRow.forEach((row: any, index: any) => {
        console.log(
          `Row ID: ${row.ID}, Sale Price: ${this.selectedSalePrice[index]}`,
        );
      });
      console.log(this.valueToUse, 'SALE PRICES OF SELECTED ROWS');
    } else if (this.firstDropdownValue === 'defaultPrice') {
      if (!this.defaultTextValue) {
        console.error('Default value is required.');
        return;
      }
      console.log('Default value entered:', this.defaultTextValue);
      const fieldName = 'PROMOTION_PRICE'; // This could be dynamic too if needed
      this.selectedRow.forEach((row: any) => {
        const matchingRow = this.itemStoresList.find(
          (gridRow: any) => gridRow.ID === row.ID,
        );
        if (matchingRow) {
          matchingRow.PROMOTION_PRICE = this.defaultTextValue; // Directly updating the field
          matchingRow.PROMOTION_NAME = this.promotionName;
        }
      });
    } else {
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
        `Row ID: ${this.selectedRow[index].ID}, Updated Value: ${roundedValue}`,
      );

      // Return the rounded value
      return roundedValue;
    });

    // Log the result for each row
    console.log(
      'Updated Values for Each Selected Row (After Operation and Rounding):',
      this.operationResult,
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
      this.selectedRow.forEach((row: any, index: any) => {
        // Find the corresponding row in `itemStoresList` by ID
        const selectedRowIndex = this.itemStoresList.findIndex(
          (item: any) => item.ID === row.ID,
        );

        if (selectedRowIndex !== -1) {
          // Update the PROMOTION_PRICE for this row
          this.itemStoresList[selectedRowIndex].PROMOTION_PRICE =
            this.operationResult[index];
          this.itemStoresList[selectedRowIndex].PROMOTION_NAME =
            this.promotionName;
          console.log(
            `Updated PROMOTION_PRICE for row ID ${row.ID}:`,
            this.itemStoresList[selectedRowIndex],
          );
        } else {
          console.log(
            `Selected row with ID ${row.ID} not found in itemStoresList.`,
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
    const datePart = selectedDateTime.toISOString().split('T')[0]; // 'yyyy-MM-dd'
    const localTime = new Date(selectedDateTime);
    // Extract the time part
    const timePart = selectedDateTime.toISOString().split('T')[1].slice(0, 8); // 'HH:mm:ss'
    const timePartLocal = localTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }); // 24-hour format
    console.log('Selected Date:', datePart);
    console.log('Selected Time:', timePart);

    // Optionally store the extracted date and time separately
    this.fromTime = timePartLocal; // You can store it in a variable like this
    this.toTime = timePartLocal; // Store time as well if needed
  }
  handleDisabledDropdownClick(): void {
    if (!this.areDatesSelected) {
      notify(
        {
          message: 'Please select dates before choosing days',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
      );
    }
  }

  handleDaySelection(event: any): void {
    this.selectedDays = event.value;
    // this.isAllDaysSelected =
    //   this.selectedDays.length === this.daysOfWeek.length &&
    //   this.selectedDays.every((value, index) => value === this.daysOfWeek[index].value);
    // this.selectedDays = 'All Days'
    console.log(
      'Selected Days:',
      this.isAllDaysSelected ? 'All Days' : this.selectedDays,
    );
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
    const data = this.dataGrid.instance.getDataSource().items();
    console.log(
      data,
      '=================grid data==============================',
    );

    console.log();
    let worksheetPromotionSchema = [];
    //  Check selected rows properly
    if (!this.selectedRowKeys || this.selectedRowKeys.length === 0) {
      notify(
        {
          message: 'Select at least one row',
          position: { at: 'top right', my: 'top right' },
        },
        'error'
      );
      return;
    }

    //  Check selected days properly
    if (!this.selectedDays || this.selectedDays.length === 0) {
      notify(
        {
          message: 'Select at least one day',
          position: { at: 'top right', my: 'top right' },
        },
        'error'
      );
      return;
    }
    if (!this.selectedStoreId || this.selectedStoreId.length === 0) {
      notify(
        {
          message: 'Select at least one store',
          position: { at: 'top right', my: 'top right' },
        },
        'error'
      );
      return;
    }


    const grid_Data = this.dataGrid.instance
      .getDataSource()
      .items()
      .filter((item: any) => this.selectedRowKeys.includes(item.ID))
      .map((item: any) => {
        return {
          ID: 0, // new record
          ITEM_ID: item.ID,

          PRICE: Number(item.SALE_PRICE) || 0,
          COST: Number(item.COST) || 0,

          PROMOTION_PRICE: Number(item.PROMOTION_PRICE) || 0,

          DATE_FROM: this.fromDate || new Date(),
          DATE_TO: this.toDate || new Date(),

          TIME_FROM: this.fromTime || new Date(),
          TIME_TO: this.toTime || new Date(),

          PROMOTION_SCHEMA_ID: this.selectedSchemaId || 0,
          PROMOTION_SCHEMA: '',

          PROMOTION_WEEKDAYS: this.selectedDays?.join(',') || '',

          PROMOTION_LEVEL: this.price_level || 1,
          PROMOTION_LEVEL_NAME: '0',

          IS_INACTIVE: false,

          PROMOTION_NAME: item.PROMOTION_NAME || this.promotionName || '',

          PROMOTION_GROUP_ID: this.wsId || 0,

          IS_BUY: this.isBuy || false,
          IS_GET: this.isGet || false,
          IS_HAPPY_HOUR: this.isHappyHoursEnabled || false,

          CAT_ID: item.CAT_ID || 0,
          DEPT_ID: item.DEPT_ID || 0,
          DEPT_NAME: item.DEPT_NAME || '',
          CAT_NAME: item.CAT_NAME || '',

          BARCODE: item.BARCODE || '',
          ITEM_DESCRIPTION: item.DESCRIPTION || '',

          NARRATION: this.narration || '',
        };
      });

    console.log('FINAL PAYLOAD:', grid_Data);
    const payload = {
      WS_DATE: new Date(),

      STORE_ID: this.selectedStoreId?.join(',') || '',

      USER_ID: this.userId || 0,
      COMPANY_ID: this.selected_Company_id || 0,

      NARRATION: this.narration || '',

      worksheet_promotion_schema: grid_Data,
      worksheet_item_store: (this.selectedStoreId || []).map((id: any) => ({
        ID: null,
        WS_ID: null,
        STORE_ID: id
      }))
    };

    console.log(payload, 'PAYLOAD IN SAVE');

    // Call the savePromotion API
    if (this.approveValue) {
      confirm(
        'It will approve and commit. Are you sure you want to commit?',
        'Confirm Commit'
      ).then((result) => {
        if (result) {
          this.dataservice.approvePromotion(payload).subscribe(
            (res: any) => {
              this.isSaving = false;

              if (res.flag === 1) {
                notify(
                  {
                    message: 'Approved and committed successfully',
                    position: { at: 'top right', my: 'top right' },
                    displayTime: 500,
                  },
                  'success'
                );

                this.resetForm();
                // this.router.navigate(['/promotions']);
                this.popupClosed.emit();

                this.dataGrid.instance.refresh();

              } else if (res.flag === 0) {
                // 🔹 Extract IDs
                const match = res.message.match(/Item IDs:\s*([\d,]+)/);
                let itemNames: string[] = [];

                if (match && match[1]) {
                  const ids = match[1].split(',').map((id: string) => Number(id.trim()));

                  itemNames = this.itemStoresList
                    .filter((item: any) => ids.includes(item.ID)) // adjust key if needed
                    .map((item: any) => item.DESCRIPTION); // adjust key if needed
                }

                const finalMessage =
                  itemNames.length > 0
                    ? `Already exists for: ${itemNames.join(', ')}`
                    : res.message;

                notify(
                  {
                    message: finalMessage,
                    position: { at: 'top right', my: 'top right' },
                  },
                  'error'
                );
              }
            },
            (error) => {
              this.isSaving = false;
              notify('Failed to approve.', 'error', 2000);
              console.error(error);
            }
          );
        } else {
          this.isSaving = false;
          notify('Approval cancelled.', 'info', 2000);
        }
      });
      // this.cdr.detectChanges();

    }
    else {
      this.dataservice.savePromotion(payload).subscribe((response: any) => {
        console.log(response, 'SAVE RESPONSE');
        try {
          if (response.flag === 1) {
            notify(
              {
                message: 'Promotion added successfully',
                position: { at: 'top right', my: 'top right' },
              },
              'success'
            );

            this.resetForm();
            this.popupClosed.emit();
            this.dataGrid.instance.refresh();

          } else if (response.flag === 0) {

            // 🔹 Extract IDs from message
            const match = response.message.match(/Item IDs:\s*([\d,]+)/);
            let itemNames: string[] = [];

            if (match && match[1]) {
              const ids = match[1].split(',').map((id: string) => Number(id.trim()));
              console.log(this.itemStoresList)
              // 🔹 Map IDs to names from itemStoresList
              itemNames = this.itemStoresList
                .filter((item: any) => ids.includes(item.ID)) // adjust key if needed
                .map((item: any) => item.DESCRIPTION); // adjust key if needed
            }

            // 🔹 Final message
            const finalMessage =
              itemNames.length > 0
                ? `Promotion already exists for: ${itemNames.join(', ')}`
                : response.message;

            notify(
              {
                message: finalMessage,
                position: { at: 'top right', my: 'top right' },
              },
              'error'
            );
          }

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
  }

  Cancel() {
    this.popupClosed.emit();
    this.resetForm();
  }
  formatTime(date: any) {
    return date ? new Date(date).toISOString() : null;
  }

  validateNumber(event: any): void {
    const inputValue = event.value || ''; // Get the current value
    const sanitizedValue = inputValue.replace(/[^0-9]/g, ''); // Remove non-numeric characters

    // Update the value in the dx-text-box
    event.component.option('value', sanitizedValue);

    // Show or hide the error message based on input validity
    this.showError = sanitizedValue !== inputValue;
  }
  onHappyHoursChanged(e: any) {
    this.isHappyHoursEnabledvalue = e.value;

    if (!this.isHappyHoursEnabled) {
      // Reset time when disabled

      const resetTime = new Date();
      resetTime.setHours(0, 0, 0, 0);

      this.fromTime = resetTime;
      this.toTime = resetTime;
    }
  }
  resetForm() {
    this.fromDate = new Date();
    this.toDate = new Date();

    this.fromTime = null;
    this.toTime = null;

    this.selectedDays = [];

    this.promotionName = null;
    this.operationInputValue = '';
    this.roundingValue = null;
    this.selectedStoreId = [];
    this.narration = '';
    this.selectedRowKeys = [];
    this.isHappyHoursEnabled = false;
    this.approveValue = false
    this.itemStoresList = []


    this.listItemsByMultipleStoreIds()
  }
  onPriceLevel(e: any) {

  }
  onSelectionChangedDAYS(e: any) {

  }
  validateToDate = (e: any) => {
    if (!this.fromDate || !e.value) return true;

    return new Date(e.value) >= new Date(this.fromDate);
  };
  onFromTimeChanged(e: any) {

    this.fromTime = this.formatDateTime(e.value);

  }

  onToTimeChanged(e: any) {

    this.toTime = this.formatDateTime(e.value);

  }
  formatDateTime(date: any): string {

    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    const milliseconds = String(d.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
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
    DxSwitchModule,
    DxTabPanelModule,
  ],
  providers: [],
  exports: [PromotionComponent],
  declarations: [PromotionComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PromotionModule { }
