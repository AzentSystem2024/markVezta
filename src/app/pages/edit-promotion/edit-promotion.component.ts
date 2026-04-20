import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  NgModule,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
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
  DxSwitchModule,
  DxTabPanelModule,
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
import { Observable, tap } from 'rxjs';
import { FormTextboxModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-edit-promotion',
  templateUrl: './edit-promotion.component.html',
  styleUrls: ['./edit-promotion.component.scss']
})
export class EditPromotionComponent {

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  @Input() selectedData: any = {};

  worksheetData: any;
  AllowCommitWithSave: any;
  userId: any;
  store: any;
  itemsList: any;
  selectedStoreId: any;
  itemStoresList: any = [];
  itemIds: any = [];
  filteredItems: any;
  selectedRowKeys: any = [];
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  minDate: Date = new Date(); // Today's date
  fromDate: any = new Date(); // Default value for 'from' date
  toDate: any = new Date();
  toTime: any = new Date();
  fromTime: any = new Date();
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
  selectedPriceLevel: any;
  operationValue: string = '';
  selectedSchema: any;
  schemaLevelPromotion: any;
  roundingValue: any;
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
  tagTemplate = (data: any) => {
    return `
        <div style="margin-right: 2px; display: inline-block; white-space: nowrap;">
          ${data.text}
        </div>
      `;
  };
  documentNo: string = '12345';
  salePrice: any; // Store the final result after operation and rounding
  selectedRowIndex: any;
  selectedItem: any;
  selectedPrice: number = 0;
  selectedCost: any[] = [];
  selectedSalePrice: any[] = [];
  valueToUse: number[] = [];
  selectedRow: any = [];
  areDatesSelected = false;
  worksheetPromotionSchema: any = [];
  selectedId: any;
  selectedPromotionSchemaId: any;
  updatedItems: { [key: number]: any } = {};
  selectedSchemaId: any; // To store the selected ID
  selectedSchemaName: any;
  disableRightColumn = false;
  combinedData: any[] = [];
  promotionLevel: any;
  showDropdown: any;
  selectedPromotionLevel: any;
  selectedOption: string = 'onSaleStatus';
  defaultTextValue: any;
  selectedPromotionName: any;
  rowIds: any;
  selectedIds: any;
  heading: string = 'Items on Promotion';
  filteredItemStoresList: any;
  originalGridHeight = '540px';
  popupForItemsToGet: any;
  selectedItems: any;
  selectedRowNew: any;
  selectedRowForNewList: any;
  combinedItem: any;
  selectedSchemaType: any;
  isGet: any;
  isBuy: any;
  showError: any;
  TimeFromArray: string[] = [];
  TimeToArray: string[] = [];
  isTimeRangeEnabled: boolean = false;
  timeRange: any;
  isHappyHoursEnabled: any;
  happyHoursPopup: boolean = false;
  IdInList: any;
  worksheetpromotionSchema: any;
  timeFrom: any;
  timeTo: any;
  filteredItemsWithIsGetTrue: any;
  remainingItemStoresList: any;
  filteredItemStoresListRemaining: any;
  isLoading: boolean = false;
  isGridVisible: boolean = false;
  showGrid: boolean = false;
  selectedRowsData: any;
  selectedRowKeysNew: any;
  selectedRowsOfPopup: any;
  isRowsSelected: boolean = false;
  narration: any;
  wsNo: any;
  wsDate: any;
  selected_Company_id: any;
  selectedTabIndex: any = 0
  wsId: any;
  selected_Data_id: any;
  constructor(
    private dataservice: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {

  }
  ngOnInit() {
    this.sesstion_Details()
    this.listItemsByMultipleStoreIds()


  }
  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '');

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.loadStores()

  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.itemStoresList) {
      if (changes['selectedData'] && changes['selectedData'].currentValue) {
        const data = changes['selectedData'].currentValue;
        console.log('Changes in EditPromotionComponent:', data);
        this.selected_Data_id = data.ID;


        // ✅ 1. GRID SELECTION
        this.selectedRowKeys = (data?.worksheet_promotion_schema || [])
          .map((item: any) => item.ITEM_ID); //  must match keyExpr

        // ✅ 2. TOOLBAR DATA
        const first = data?.worksheet_promotion_schema?.[0];

        if (first) {
          this.narration = first.NARRATION || '';

          this.fromDate = first.DATE_FROM ? new Date(first.DATE_FROM) : null;
          this.toDate = first.DATE_TO ? new Date(first.DATE_TO) : null;

          this.timeFrom = first.TIME_FROM
            ? this.convertToTime(first.TIME_FROM)
            : null;

          this.timeTo = first.TIME_TO
            ? this.convertToTime(first.TIME_TO)
            : null;

          this.isHappyHoursEnabled = first.IS_HAPPY_HOUR || false;

          this.selectedDays = first.PROMOTION_WEEKDAYS
            ? first.PROMOTION_WEEKDAYS.split(',').map(Number)
            : [];
        }
        const promotionMap = (data?.worksheet_promotion_schema || [])
          .reduce((acc: any, item: any) => {
            acc[item.ITEM_ID] = item;
            return acc;
          }, {});

        // ✅ merge into grid
        this.itemStoresList = (this.itemStoresList || []).map((item: any) => {

          const promo = promotionMap[item.ID]; // match ID ↔ ITEM_ID

          return {
            ...item,
            PROMOTION_PRICE: promo?.PROMOTION_PRICE || 0,
            PROMOTION_NAME: promo?.PROMOTION_NAME || '',
            PROMOTION_SCHEMA_ID: promo?.PROMOTION_SCHEMA_ID || null
          };
        });
        // ✅ 3. STORE SELECTION
        this.selectedStoreId = (data?.worksheet_item_store || [])
          .map((s: any) => s.STORE_ID);

        // ✅ 4. OTHER HEADER DATA
        this.wsNo = data.WS_NO;
        this.wsDate = data.WS_DATE
          ? new Date(data.WS_DATE).toISOString().split('T')[0]
          : '';



      }
    }

    console.log('Selected Data in EditPromotionComponent:', this.selectedData);
  }

  convertToTime(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    return time;
  }
  listItemsByMultipleStoreIds(): void {
    this.isLoading = true;

    this.dataservice.getItemListByStoreId().subscribe(
      (response: any) => {

        this.itemStoresList = response.PriceWizardData || [];

        console.log('Fetched Item Stores List:', this.itemStoresList);

        // ✅ MATCH & SELECT
        if (this.selectedRowKeys && this.selectedRowKeys.length > 0) {

          // ensure type match (number)
          this.selectedRowKeys = this.selectedRowKeys.map((id: any) => Number(id));

          // filter only matching IDs (optional but clean)
          const validIds = this.itemStoresList
            .map((item: any) => Number(item.ID));

          this.selectedRowKeys = this.selectedRowKeys.filter((id: any) =>
            validIds.includes(id)
          );
        }

        this.isLoading = false;

        console.log('Grid Data:', this.itemStoresList);
        console.log('Selected Keys:', this.selectedRowKeys);
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching item list:', error);
      }
    );
  }

  setPromotion(selectedRowKeys: any[]) {
    if (!this.selectedDays) {
      console.log('Please select at least one day to set promotion.');
      notify(
        {
          message: 'Please select at least one day to set promotion.',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
      );
    } else {
      this.isVisible = true; // Open the popup when rows are selected
    }
  }

  savePromotion() {
    const companyId = 1; // example company ID
    const userId = this.userId; // example user ID
    const narration = ''; // Provide a meaningful narration

    if (!this.itemStoresList || !this.itemStoresList.length) {
      return [];
    }
    const data = this.dataGrid.instance.getDataSource().items()
    console.log(data, 'DATAAAAAA');
    const grid_Data = this.dataGrid.instance.getDataSource().items()
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

          PROMOTION_LEVEL: 0,
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

          NARRATION: this.narration || ''
        };
      });

    console.log('FINAL PAYLOAD:', grid_Data);
    const payload = {
      ID: this.selected_Data_id || 0,
      WS_NO: this.wsNo || '',
      WS_DATE: this.wsDate ? new Date(this.wsDate) : new Date(),

      STORE_ID: this.selectedStoreId?.join(',') || '',

      USER_ID: this.userId || 0,
      COMPANY_ID: this.selected_Company_id || 0,

      NARRATION: this.narration || '',


      worksheet_promotion_schema: grid_Data

    }

    this.dataservice.updatePromotion(payload).subscribe(
      (response: any) => {
        console.log(response, 'SAVE RESPONSE');
        try {
          notify(
            {
              message: 'Promotion updated successfully',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.router.navigate(['/Promotion']);
          this.dataGrid.instance.refresh();
        } catch (error) {
          notify(
            {
              message: 'Add operation failed',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      },
      (error) => {
        console.error('Error saving promotion:', error);
      },
    );
  }
  combineDateAndTime(time: Date) {
    if (!time) return null;

    const result = new Date();

    result.setHours(time.getHours());
    result.setMinutes(time.getMinutes());
    result.setSeconds(0);

    return result.toISOString();
  }

  Cancel() {

  }
  onHappyHoursChanged(event: any) {

  }
  onEditorPreparing(event: any) {

  }
  checkDateSelection(event: any) {
  }
  onSelectionChanged(e: any) {
    this.selectedRowKeys = e.selectedRowKeys;
    // console.log(this.selectedRowKeys, 'SELECTED');
    this.selectedRow = e.selectedRowsData; // Gets the first selected row
    // console.log(this.selectedRow, 'SELECTEDROW');
    this.selectedId = [];
    this.selectedCost = [];
    this.selectedSalePrice = [];
    this.selectedRow.forEach((row: any) => {
      this.selectedId.push(row.ID);
      this.selectedCost.push(row.COST);
      this.selectedSalePrice.push(row.SALE_PRICE);
    });
    this.selectedRowKeys = e.selectedRowKeys;

    this.itemStoresList = this.itemStoresList.map((item: any) => ({
      ...item,
      Selected: this.selectedRowKeys.includes(item.ITEM_ID)
    }));
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

  applyPromotion() {
    // If a schema is selected
    if (this.selectedSchemaId) {
      const selectedSchema = this.promotionSchema.find(
        (schema: any) => schema.ID === this.selectedSchemaId,
      );
      if (selectedSchema) {
        console.log(selectedSchema.REMARKS);
        if (selectedSchema.REMARKS == '4') {
          this.heading = 'Items To Buy';
          this.filteredItemStoresList = this.itemStoresList.filter((item: any) => {
            const isItemSelected = this.selectedRow.some(
              (row: any) => row.ID === item.ID,
            );
            return !isItemSelected; // Keep only items that are NOT selected
          });
          console.log(this.filteredItemStoresList, 'FILTERED');
          this.originalGridHeight = '300px';
        }
        this.selectedSchemaName = selectedSchema.DESCRIPTION;
        // Log the schema name when a schema is selected
        console.log(
          'Selected Schemaaaaaaaaaaaaaa:',
          selectedSchema.DESCRIPTION,
        );
        this.selectedSchemaName = selectedSchema.DESCRIPTION; // Store the selected schema name
        console.log(this.selectedSchemaName, 'NAME');
        this.selectedRow.forEach((row: any, index: any) => {
          // Find the corresponding row in `itemStoresList` by ID
          const selectedRowIndex = this.worksheetpromotionSchema.findIndex(
            (item: any) => item.ID === row.ID,
          );

          if (selectedRowIndex !== -1) {
            this.worksheetpromotionSchema[selectedRowIndex].PROMOTION_NAME =
              this.selectedSchemaName;
            this.worksheetpromotionSchema[
              selectedRowIndex
            ].PROMOTION_SCHEMA_ID = this.selectedSchemaId;
          } else {
            console.log(
              `Selected row with ID ${row.ID} not found in worksheetpromotionSchema.`,
            );
          }
        });
      }
      setTimeout(() => {
        this.closePopup(); // Ensure close happens after operations
      }, 0); // Exit the function early if schema is selected
      return;
    }

    // If no schema is selected, proceed with the promotion logic
    this.applySelectedValue();

    if (this.valueToUse != null) {
      this.calculateResult();
      this.updatePromotionPrice();
    }

    setTimeout(() => {
      this.closePopup(); // Ensure close happens after operations
    }, 0); // Close the popup after applying promotion
  }
  closePopup(): void {
    this.isVisible = false;
  }

  // updatePromotionPrice() {
  //   // Check if selected rows and operation result are available
  //   if (this.selectedRow && this.operationResult != null) {
  //     // Ensure that the number of operation results matches the number of selected rows
  //     if (this.selectedRow.length !== this.operationResult.length) {
  //       console.log('Mismatch between selected rows and operation results.');
  //       return;
  //     }

  //     // Iterate over each selected row and update its PROMOTION_PRICE with the calculated result
  //     this.selectedRow.forEach((row: any, index: number) => {
  //       // Find the corresponding row in `itemStoresList` by ID
  //       const selectedRowIndex = this.worksheetpromotionSchema.findIndex(
  //         (item: any) => item.ID === row.ID,
  //       );

  //       if (selectedRowIndex !== -1) {
  //         // Update the PROMOTION_PRICE for this row
  //         this.worksheetpromotionSchema[selectedRowIndex].PROMOTION_PRICE =
  //           this.operationResult[index];
  //         this.worksheetpromotionSchema[selectedRowIndex].PROMOTION_NAME =
  //           this.promotionName;
  //         console.log(
  //           `Updated PROMOTION_PRICE for row ID ${row.ID}:`,
  //           this.worksheetpromotionSchema[selectedRowIndex],
  //         );
  //       } else {
  //         console.log(
  //           `Selected row with ID ${row.ID} not found in worksheetpromotionSchema.`,
  //         );
  //       }
  //     });
  //   } else {
  //     console.log('No selected rows or operation result is null.');
  //   }
  // }
  updatePromotionPrice() {

    // ✅ SAFETY INIT
    this.itemStoresList = this.itemStoresList || [];
    this.worksheetpromotionSchema = this.worksheetpromotionSchema || [];
    this.selectedRow = this.selectedRow || [];

    if (!this.selectedRow.length) {
      console.log('No selected rows.');
      return;
    }

    if (!this.operationResult || !this.operationResult.length) {
      console.log('Operation result is empty.');
      return;
    }

    if (this.selectedRow.length !== this.operationResult.length) {
      console.log('Mismatch between selected rows and results.');
      return;
    }

    this.selectedRow.forEach((row: any, index: number) => {

      const newPrice = Number(this.operationResult[index]) || 0;

      // ✅ SAFE FIND (GRID)
      const gridItem = (this.itemStoresList || []).find(
        (item: any) => Number(item?.ID) === Number(row?.ID)
      );

      if (gridItem) {
        gridItem.PROMOTION_PRICE = Number(newPrice.toFixed(2));
        gridItem.PROMOTION_NAME = this.promotionName;
      }

      // ✅ SAFE FIND (SCHEMA)
      const schemaItem = (this.worksheetpromotionSchema || []).find(
        (item: any) => Number(item?.ITEM_ID) === Number(row?.ID)
      );

      if (schemaItem) {
        schemaItem.PROMOTION_PRICE = Number(newPrice.toFixed(2));
        schemaItem.PROMOTION_NAME = this.promotionName;
      } else {
        // ✅ ADD if not exists
        this.worksheetpromotionSchema.push({
          ITEM_ID: row.ID,
          PROMOTION_PRICE: Number(newPrice.toFixed(2)),
          PROMOTION_NAME: this.promotionName
        });
      }

    });

    console.log('Updated Grid:', this.itemStoresList);
    console.log('Updated Schema:', this.worksheetpromotionSchema);
  }
  onSchemaChanged(event: any) {
    const selectedValue = event.value; // This is the ID of the selected schema
    console.log('onchemachanged triggered');
    this.selectedSchema = this.promotionSchema.find(
      (schema: any) => schema.ID === selectedValue,
    );
    console.log(this.selectedSchema.REMARKS, '--------------===');
    if (!this.selectedSchema) {
      console.error('Selected schema not found');
      return; // Exit the function if schema is not found
    }
    if (this.selectedSchema.REMARKS == '4') {
      console.log('REMARKS IS 4');
      this.originalGridHeight = '300px'; // Set the height to 540px if REMARKS is not 4
    } else {
      // Optionally, you can set the height back to the default if REMARKS is '4'
      this.originalGridHeight = '540px'; // Leave it empty or set to a default value
    }
    // this.showGrid = this.selectedSchema.REMARKS === '4';
    const selectedSchema = this.promotionSchema.find(
      (schema: any) => schema.ID === event.value, // Use event.value to get the selected ID
    );
    console.log(selectedSchema, 'SELECTEDSCHEMA');
    this.selectedSchemaType = this.promotionSchema.find(
      (schema: any) => schema.REMARKS,
    );
    if (selectedSchema) {
      this.selectedSchemaId = selectedSchema.ID;
      this.selectedSchemaName = selectedSchema.DESCRIPTION;
      console.log(this.selectedSchemaName, 'ONSCHEMACHANGEDDD');
      // if(this.selectedSchemaType.REMARKS == '4'){
      //   this.isBuy = 1;
      //   this.isGet = 1
      // }
      console.log(
        'Selected Schema:',
        this.selectedSchemaName,
        this.selectedSchemaId,
      );
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

  applySelectedValue() {
    if (this.firstDropdownValue === 'cost') {
      this.valueToUse = this.selectedCost; // Assign array of costs
      // Log each row's cost with its ID
      this.selectedRow.forEach((row: any, index: any) => {
        console.log(`Row ID: ${row.ID}, Cost: ${this.selectedCost[index]}`);
      });
      // console.log(this.valueToUse, 'COSTS OF SELECTED ROWS');
    } else if (this.firstDropdownValue === 'salePrice') {
      this.valueToUse = this.selectedSalePrice; // Assign array of sale prices
      // Log each row's sale price with its ID
      this.selectedRow.forEach((row: any, index: any) => {
        console.log(
          `Row ID: ${row.ID}, Sale Price: ${this.selectedSalePrice[index]}`,
        );
      });
      // console.log(this.valueToUse, 'SALE PRICES OF SELECTED ROWS');
    } else if (this.firstDropdownValue === 'defaultPrice') {
      if (!this.defaultTextValue) {
        console.error('Default value is required.');
        return;
      }
      // console.log('Default value entered:', this.defaultTextValue);
      const fieldName = 'PROMOTION_PRICE'; // This could be dynamic too if needed
      this.selectedRow.forEach((row: any) => {
        const matchingRow = this.worksheetpromotionSchema.find(
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
    DxTabsModule,
    DxSwitchModule,
    DxTabPanelModule

  ],
  providers: [],
  declarations: [EditPromotionComponent],
  exports: [EditPromotionComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class EditPromotionModule { }
