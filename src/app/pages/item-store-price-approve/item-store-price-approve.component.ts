import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
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
  DxPopupModule,
  DxProgressBarModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxSwitchModule,
  DxTabsModule,
  DxTagBoxModule,
  DxTemplateModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToastModule,
  DxToolbarModule,
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
  selector: 'app-item-store-price-approve',
  templateUrl: './item-store-price-approve.component.html',
  styleUrls: ['./item-store-price-approve.component.scss'],
})
export class ItemStorePriceApproveComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  allItems: any;
  allItemsList: any;
  totalRowCount: any;
  selectedStoreId: number[] = [1];
  store: any[] = [];
  department: any;
  catagory: any;
  brand: any;
  items: any;
  selectedData: any;
  filteredStoreList: any[] = [];
  storeIds: any;
  itemStoresList: any;
  payload: any[] = [];
  selectedRowCount: any;
  selectedRowKeys: any;
  selectedRowId: any;
  selectedItemId: any;
  salepriceoldValue: any;
  saleprice1odValue: any;
  saleprice2oldValue: any;
  NotSaleReturnoldValue: any;
  saleprice3oldValue: any;
  saleprice4oldValue: any;
  saleprice5oldValue: any;
  saleprice1oldValue: any;
  oldValues: { [key: string]: { [field: string]: any } } = {};
  storeProperties: any;
  storePrices: any;
  currentSalePrice: number = 0.0;
  newSalePrice: number = 0.0;
  currentSalePrice1: number = 0.0;
  newSalePrice1: number = 0.0;
  currentSalePrice2: number = 0.0;
  newSalePrice2: number = 0.0;
  currentSalePrice3: number = 0.0;
  newSalePrice3: number = 0.0;
  currentSalePrice4: number = 0.0;
  newSalePrice4: number = 0.0;
  currentSalePrice5: number = 0.0;
  newSalePrice5: number = 0.0;
  itemPrices: number = 0.0;
  updatedItems: { [key: number]: any } = {}; // Use a dictionary for keyed access
  showHeaderFilter: true;
  isSaved: boolean = false;
  isVerified: boolean = false;
  AllowCommitWithSave: any;
  savedWorksheet: any;
  isPopupVisible: boolean = false;
  isButtonDisabled: boolean = true;
  savedWorksheet1: {
    ID: any; // assuming response might not have ID
    COMPANY_ID: number; // from your payload
    USER_ID: number; // from your payload
    WS_DATE: Date; // you can set this to the current date or however appropriate
    WS_NO: string; // generate as needed
    flag: number; // Assuming success
    message: string;
    worksheet_item_price: {
      ITEM_ID: any;
      SALE_PRICE: any;
      SALE_PRICE1: any;
      SALE_PRICE2: any;
      SALE_PRICE3: any;
      SALE_PRICE4: any;
      SALE_PRICE5: any;
      PRICE_NEW: any; // Ensure this reflects the updated value
      PRICE_LEVEL1_NEW: any;
      PRICE_LEVEL2_NEW: any;
      PRICE_LEVEL3_NEW: any;
      PRICE_LEVEL4_NEW: any;
      PRICE_LEVEL5_NEW: any;
    }[];
  };
  newValues: {
    PRICE_NEW: any;
    PRICE_LEVEL1_NEW: any;
    PRICE_LEVEL2_NEW: any;
    PRICE_LEVEL3_NEW: any;
    PRICE_LEVEL4_NEW: any;
    PRICE_LEVEL5_NEW: any;
  };
  percentage: number = 0;
  priceAdjustment: string = 'increase'; // 'increase' or 'decrease'
  // roundingOption: string = 'none'; // 'none', 'nearest', 'down', 'up'
  currentPrice: number = 100; // Example current price
  adjustedPrice: number = 0;
  adjustmentOptions = [
    { text: 'Increase', value: 'increase' },
    { text: 'Decrease', value: 'decrease' },
  ];

  // Rounding options for select box
  roundingOptions = [
    { text: 'Do not round the result', value: 'none' },
    { text: 'Round to the nearest value', value: 'nearest' },
    { text: 'Round down', value: 'down' },
    { text: 'Round up', value: 'up' },
  ];
  roundingOption: string = 'none';
  percentageString: any;
  isIncrease: boolean = true;
  selectedSalePrice: any;
  salePriceOptions = [
    { value: 'SALE_PRICE', text: 'Sale Price ' },
    { value: 'SALE_PRICE1', text: 'Sale Price 1' },
    { value: 'SALE_PRICE2', text: 'Sale Price 2' },
    { value: 'SALE_PRICE3', text: 'Sale Price 3' },
    { value: 'SALE_PRICE4', text: 'Sale Price 4' },
    { value: 'SALE_PRICE5', text: 'Sale Price 5' },
  ];
  newPrice: any;
  payloadForVerify: any;
  worksheetData: any;
  selectedItems: any;
  worksheetItems: any;
  selectedRowIds: any;
  userId: string;
  VerifiedFromLog: boolean = true;
  selectedIds: any;

  constructor(
    private dataservice: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    dataservice.getDropdownData('DEPARTMENT').subscribe((data) => {
      this.department = data;
    });
    dataservice.getDropdownData('ITEMCATEGORY').subscribe((data) => {
      this.catagory = data;
    });
    dataservice.getDropdownData('BRAND').subscribe((data) => {
      this.brand = data;
    });
  }

  ngOnInit() {
    this.AllowCommitWithSave = sessionStorage.getItem('AllowCommitWithSave');
    this.userId = sessionStorage.getItem('UserId');
    this.getWorksheetData();
    if (this.selectedStoreId.length > 1) {
      const defaultStoreId = this.selectedStoreId.join(',');
      this.listItemsByMultipleStoreIds(defaultStoreId);
    }
    this.loadStores();
  }

  getWorksheetData(): void {
    this.dataservice.worksheetData$.subscribe((data) => {
      this.isSaved = true;
      this.worksheetData = data;
      this.VerifiedFromLog = this.worksheetData?.status === 'Verified';
      this.worksheetItems = this.worksheetData.worksheet_item_price;
      this.selectedIds = this.worksheetItems
        .filter((item) => !item.Selected) // Invert the condition to filter items where Selected is false
        .map((item) => item.ITEM_ID); // Collect ITEM_IDs
      if (
        this.worksheetData.worksheet_item_price &&
        this.worksheetData.worksheet_item_price.length > 0
      ) {
        this.selectedItems = this.worksheetItems.filter(
          (item) => item.Selected === true
        );
        const storId = this.worksheetData.worksheet_item_store.map(
          (storeID) => storeID.STORE_ID
        );
        this.payloadForVerify = {
          ID: this.worksheetData.ID,
          COMPANY_ID: 1,
          USER_ID: 1,
          STORE_ID: storId[0],
          NARRATION: '',
          worksheet_item_price: this.worksheetItems,
        };
        if (this.selectedItems.length > 0) {
          this.selectedRowKeys = this.selectedItems.map((item) => item.ID);
          this.isButtonDisabled = false;
        } else {
          console.warn('No selected items found.');
          this.isButtonDisabled = true;
        }
      } else {
        // console.warn('worksheet_item_price is empty or not present.');
      }
      if (this.worksheetData?.worksheet_item_store?.length > 0) {
        this.selectedStoreId = [
          this.worksheetData.worksheet_item_store[0].STORE_ID,
        ];
      } else {
        // console.warn('worksheet_item_store is empty or not present.');
      }
    });
  }

  loadStores() {
    this.dataservice.getStoresData().subscribe((response) => {
      this.store = response;
      this.filteredStoreList = this.store;
    });
  }

  getStoresById(storeId: any) {
    this.dataservice.getStoresData().subscribe((response) => {
      this.filteredStoreList = response.filter(
        (store: any) => store.ID === storeId
      );
      if (this.filteredStoreList.length > 0) {
        this.listItemsByMultipleStoreIds(storeId);
      }
    });
  }

  listItemsByMultipleStoreIds(storeIds: string) {
    this.dataservice.getItemListByStoreId(storeIds).subscribe(
      (response) => {
        console.log(response);
        this.worksheetItems = response.PriceWizardData;
        this.selectedItems = this.worksheetItems.filter(
          (item) => item.Selected === true
        );
        if (this.selectedItems.length > 0) {
          this.selectedRowKeys = this.selectedItems.map((item) => item.ID);
          console.log(this.selectedRowKeys, 'Updated Selected Row Keys');
        } else {
          this.selectedRowKeys = [];
        }
      },
      (error) => {
        console.error('Error fetching item list:', error);
      }
    );
  }

  onRowUpdated(event: any) {
    const updatedData = event.data;
    const rowId = updatedData.ID;
    this.updatedItems[rowId] = {
      ITEM_ID: rowId,
      SALE_PRICE: updatedData.SALE_PRICE || 0.0,
      SALE_PRICE1: updatedData.SALE_PRICE1 || 0.0,
      SALE_PRICE2: updatedData.SALE_PRICE2 || 0.0,
      SALE_PRICE3: updatedData.SALE_PRICE3 || 0.0,
      SALE_PRICE4: updatedData.SALE_PRICE4 || 0.0,
      SALE_PRICE5: updatedData.SALE_PRICE5 || 0.0,
      PRICE_NEW: updatedData.PRICE_NEW || '',
      PRICE_LEVEL1_NEW: updatedData.PRICE_LEVEL1_NEW || '',
      PRICE_LEVEL2_NEW: updatedData.PRICE_LEVEL2_NEW || '',
      PRICE_LEVEL3_NEW: updatedData.PRICE_LEVEL3_NEW || '',
      PRICE_LEVEL4_NEW: updatedData.PRICE_LEVEL4_NEW || '',
      PRICE_LEVEL5_NEW: updatedData.PRICE_LEVEL5_NEW || '',
    };
  }

  onSelectionChanged(event: any) {
    const totalItemsCount = event.component.getDataSource().items().length;
    if (totalItemsCount > 0 && this.selectedRowCount === 0) {
      event.component.selectAll();
      setTimeout(() => {
        // Get the updated selected keys from the component directly
        this.selectedRowIds = event.component.getSelectedRowKeys();
        this.selectedRowCount = this.selectedRowIds.length;
        this.selectedRowKeys = this.selectedRowIds;
        this.isButtonDisabled = this.selectedRowCount === 0;
        this.selectedItems = event.selectedRowsData;
        if (this.selectedItems.length > 0) {
          const selectedRow = this.selectedItems[0];
          this.selectedRowId = selectedRow.ID;
          this.selectedItems = selectedRow.ITEM_ID;
          if (!this.oldValues[this.selectedRowId]) {
            this.oldValues[this.selectedRowId] = {
              SALE_PRICE: selectedRow.SALE_PRICE,
              SALE_PRICE1: selectedRow.SALE_PRICE1,
              SALE_PRICE2: selectedRow.SALE_PRICE2,
              SALE_PRICE3: selectedRow.SALE_PRICE3,
              SALE_PRICE4: selectedRow.SALE_PRICE4,
              SALE_PRICE5: selectedRow.SALE_PRICE5,
            };
          }
        } else {
          this.selectedRowId = null;
          this.selectedItems = null; // Reset as needed
        }
      }, 0); // Allow time for the selection to be processed
    } else {
      // If not selecting all, update the selected counts normally
      this.selectedRowIds = event.selectedRowKeys;
      this.selectedRowCount = this.selectedRowIds.length;
      this.selectedRowKeys = this.selectedRowIds;

      // Determine if the button should be disabled
      this.isButtonDisabled = this.selectedRowCount === 0;
      this.selectedItems = event.selectedRowsData;
      if (this.selectedItems.length > 0) {
        const selectedRow = this.selectedItems[0];
        this.selectedRowId = selectedRow.ID;
        this.selectedItems = selectedRow.ITEM_ID;
        if (!this.oldValues[this.selectedRowId]) {
          this.oldValues[this.selectedRowId] = {
            SALE_PRICE: selectedRow.SALE_PRICE,
            SALE_PRICE1: selectedRow.SALE_PRICE1,
            SALE_PRICE2: selectedRow.SALE_PRICE2,
            SALE_PRICE3: selectedRow.SALE_PRICE3,
            SALE_PRICE4: selectedRow.SALE_PRICE4,
            SALE_PRICE5: selectedRow.SALE_PRICE5,
          };
        }
      } else {
        // Reset IDs if no items are selected
        this.selectedRowId = null;
        this.selectedItems = null; // Reset as needed
      }
    }
  }

  Cancel() {
    this.router.navigate(['/change-price']);
  }

  onDropdownValueChanged(event: any) {
    this.storeIds = event.value;
    if (!this.storeIds || this.storeIds === null) {
      this.selectedStoreId = null;
      this.itemStoresList = [];
    } else {
      this.selectedStoreId = this.storeIds;
      this.listItemsByMultipleStoreIds(this.storeIds);
    }
  }

  onSaveButtonClick() {
    this.Save();
    this.isSaved = true;
  }

  Save() {
    if (this.selectedRowKeys.length === 0) {
      notify(
        {
          message: 'No rows selected. Please select at least one row to save.',
          position: { at: 'top right', my: 'top right' },
        },
        'error'
      );
      return;
    }
    const companyId = 1;
    const userId = 1;
    const narration = 'Narration';
    const defaultStoreId = 1;
    const worksheetItemPrice = Object.values(this.updatedItems).map((item) => ({
      ITEM_ID: item.ITEM_ID,
      SALE_PRICE: item.SALE_PRICE ?? 0.0,
      SALE_PRICE1: item.SALE_PRICE1 ?? 0.0,
      SALE_PRICE2: item.SALE_PRICE2 ?? 0.0,
      SALE_PRICE3: item.SALE_PRICE3 ?? 0.0,
      SALE_PRICE4: item.SALE_PRICE4 ?? 0.0,
      SALE_PRICE5: item.SALE_PRICE5 ?? 0.0,
      PRICE_NEW: item.PRICE_NEW ?? 0.0,
      PRICE_LEVEL1_NEW: item.PRICE_LEVEL1_NEW ?? 0.0,
      PRICE_LEVEL2_NEW: item.PRICE_LEVEL2_NEW ?? 0.0,
      PRICE_LEVEL3_NEW: item.PRICE_LEVEL3_NEW ?? 0.0,
      PRICE_LEVEL4_NEW: item.PRICE_LEVEL4_NEW ?? 0.0,
      PRICE_LEVEL5_NEW: item.PRICE_LEVEL5_NEW ?? 0.0,
    }));
    const payload = {
      COMPANY_ID: companyId,
      USER_ID: userId,
      STORE_ID: this.storeIds || defaultStoreId,
      NARRATION: narration,
      worksheet_item_price: worksheetItemPrice,
    };
    this.dataservice.updateworksheetItemPrice(payload).subscribe(
      (response) => {
        if (response) {
          notify(
            {
              message: 'Worksheet Updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
        } else {
          notify(
            {
              message: 'Your Data Not Saved',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      },
      (error) => {
        console.error('Error saving data:', error);
      }
    );
  }

  onVerify() {
    if (this.AllowCommitWithSave) {
      if (this.payloadForVerify) {
        this.dataservice
          .verifyItemStorePrices(this.payloadForVerify)
          .subscribe((response) => {
            // console.log('verified');
          });
      }
      const companyId = 1; // Example: this.companyId = 1
      const userId = 1; // Example: this.userId = 1
      const narration = 'Narration'; // Replace with the actual narration if needed
      const defaultStoreId = 1;
      const worksheetItemPrice = Object.values(this.updatedItems).map(
        (item) => ({
          ITEM_ID: item.ITEM_ID,
          SALE_PRICE: item.SALE_PRICE ?? 0.0,
          SALE_PRICE1: item.SALE_PRICE1 ?? 0.0,
          SALE_PRICE2: item.SALE_PRICE2 ?? 0.0,
          SALE_PRICE3: item.SALE_PRICE3 ?? 0.0,
          SALE_PRICE4: item.SALE_PRICE4 ?? 0.0,
          SALE_PRICE5: item.SALE_PRICE5 ?? 0.0,
          PRICE_NEW: item.PRICE_NEW ?? 0.0,
          PRICE_LEVEL1_NEW: item.PRICE_LEVEL1_NEW ?? 0.0,
          PRICE_LEVEL2_NEW: item.PRICE_LEVEL2_NEW ?? 0.0,
          PRICE_LEVEL3_NEW: item.PRICE_LEVEL3_NEW ?? 0.0,
          PRICE_LEVEL4_NEW: item.PRICE_LEVEL4_NEW ?? 0.0,
          PRICE_LEVEL5_NEW: item.PRICE_LEVEL5_NEW ?? 0.0,
        })
      );
      const verificationPayload = {
        COMPANY_ID: companyId,
        USER_ID: userId,
        STORE_ID: this.storeIds || defaultStoreId,
        NARRATION: narration,
        worksheet_item_price: worksheetItemPrice,
      };
      this.verifyItemStorePrices(verificationPayload);
    }
  }

  verifyItemStorePrices(payload) {
    this.dataservice
      .verifyItemStorePrices(payload)
      .subscribe((verifyResponse) => {
        if (verifyResponse) {
          notify(
            {
              message: 'Worksheet Verified Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
        } else {
          notify(
            {
              message: 'Your Data Not Saved',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
        this.isVerified = true;
      });
  }

  onApprove() {
    if (this.payloadForVerify) {
      this.dataservice
        .approveworksheetItemPrices(this.payloadForVerify)
        .subscribe((response) => {
          console.log('APPROVED');
        });
    }
    const companyId = 1; // Example: this.companyId = 1
    const userId = 1; // Example: this.userId = 1
    const narration = 'Narration'; // Replace with the actual narration if needed
    const defaultStoreId = 1;
    const worksheetItemPrice = Object.values(this.updatedItems).map((item) => ({
      ITEM_ID: item.ITEM_ID,
      SALE_PRICE: item.SALE_PRICE ?? 0.0,
      SALE_PRICE1: item.SALE_PRICE1 ?? 0.0,
      SALE_PRICE2: item.SALE_PRICE2 ?? 0.0,
      SALE_PRICE3: item.SALE_PRICE3 ?? 0.0,
      SALE_PRICE4: item.SALE_PRICE4 ?? 0.0,
      SALE_PRICE5: item.SALE_PRICE5 ?? 0.0,
      PRICE_NEW: item.PRICE_NEW ?? 0.0, // Ensure this reflects the updated value
      PRICE_LEVEL1_NEW: item.PRICE_LEVEL1_NEW ?? 0.0,
      PRICE_LEVEL2_NEW: item.PRICE_LEVEL2_NEW ?? 0.0,
      PRICE_LEVEL3_NEW: item.PRICE_LEVEL3_NEW ?? 0.0,
      PRICE_LEVEL4_NEW: item.PRICE_LEVEL4_NEW ?? 0.0,
      PRICE_LEVEL5_NEW: item.PRICE_LEVEL5_NEW ?? 0.0,
    }));
    const approvePayload = {
      COMPANY_ID: companyId,
      USER_ID: userId,
      STORE_ID: this.storeIds || defaultStoreId,
      NARRATION: narration,
      worksheet_item_price: worksheetItemPrice,
    };
    this.approveItemStoreProperties(approvePayload);
  }

  approveItemStoreProperties(payload) {
    this.dataservice
      .approveworksheetItemPrices(payload)
      .subscribe((approveResponse) => {
        if (approveResponse) {
          notify(
            {
              message: 'Worksheet Approved Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
        } else {
          notify(
            {
              message: 'Your Data Not Saved',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      });
    this.router.navigate(['/change-price']);
  }

  handlePercentageChange(event) {
    const percentageValue = parseFloat(this.percentageString);
    if (isNaN(percentageValue)) {
      console.warn('Invalid percentage value.');
      return;
    }
    this.percentage = percentageValue;
    console.log(`Percentage change set to: ${percentageValue}%`);
  }

  handleSalePriceChange(event) {
    const selectedOptions = event.value; // This will now be an array of selected options
    this.selectedSalePrice = selectedOptions;
    // console.log(`Selected sale price options: ${selectedOptions}`);
  }

  applyFormula(event) {
    if (!this.worksheetItems || this.worksheetItems.length === 0) {
      console.error('itemStoresList is not defined or empty.');
      return;
    }
    if (this.selectedRowKeys.length > 0) {
      this.isPopupVisible = true;
      const selectedRowsData = [];
      this.selectedRowKeys.forEach((selectedRowId) => {
        const selectedRow = this.worksheetItems.find(
          (row) => row.ID === selectedRowId
        );
        if (selectedRow) {
          selectedRowsData.push(selectedRow);
          this.selectedRowId = selectedRow.ID;
          this.selectedItemId = selectedRow.ITEM_ID;
          // Store the original sale price values if not already stored
          if (!this.oldValues[this.selectedRowId]) {
            this.oldValues[this.selectedRowId] = {
              SALE_PRICE: selectedRow.SALE_PRICE,
              SALE_PRICE1: selectedRow.SALE_PRICE1,
              SALE_PRICE2: selectedRow.SALE_PRICE2,
              SALE_PRICE3: selectedRow.SALE_PRICE3,
              SALE_PRICE4: selectedRow.SALE_PRICE4,
              SALE_PRICE5: selectedRow.SALE_PRICE5,
            };
          }
        }
      });
    }
  }

  roundValue(value: number): number {
    switch (this.roundingOption) {
      case 'nearest':
        return Math.round(value);
      case 'down':
        return Math.floor(value);
      case 'up':
        return Math.ceil(value);
      default:
        return value;
    }
  }

  applyPriceChange() {
    if (this.selectedRowKeys.length > 0 && this.selectedSalePrice.length > 0) {
      this.selectedRowKeys.forEach((rowId) => {
        const selectedRow = this.worksheetItems.find((row) => row.ID === rowId);
        if (selectedRow) {
          this.selectedSalePrice.forEach((selectedOption) => {
            let originalPrice = this.oldValues[rowId][selectedOption];
            let processedPrice = this.isIncrease
              ? originalPrice * (1 + this.percentageString / 100)
              : originalPrice * (1 - this.percentageString / 100);
            let finalPrice = this.roundValue(processedPrice);

            // Update corresponding PRICE_NEW or PRICE_LEVELX_NEW fields based on selected option
            if (selectedOption === 'SALE_PRICE') {
              selectedRow.PRICE_NEW = finalPrice; // Update PRICE_NEW
            } else if (selectedOption === 'SALE_PRICE1') {
              selectedRow.PRICE_LEVEL1_NEW = finalPrice; // Update PRICE_LEVEL1_NEW
            } else if (selectedOption === 'SALE_PRICE2') {
              selectedRow.PRICE_LEVEL2_NEW = finalPrice; // Update PRICE_LEVEL2_NEW
            } else if (selectedOption === 'SALE_PRICE3') {
              selectedRow.PRICE_LEVEL3_NEW = finalPrice; // Update PRICE_LEVEL3_NEW
            } else if (selectedOption === 'SALE_PRICE4') {
              selectedRow.PRICE_LEVEL4_NEW = finalPrice; // Update PRICE_LEVEL4_NEW
            } else if (selectedOption === 'SALE_PRICE5') {
              selectedRow.PRICE_LEVEL5_NEW = finalPrice; // Update PRICE_LEVEL5_NEW
            }
            this.onRowUpdated({ data: selectedRow });

            // console.log(
            //   `Updated ${selectedOption} for row ID ${selectedRow.ID}:`,
            //   finalPrice
            // );
          });
        } else {
          console.error('Selected row not found in the data source.');
        }
      });
      this.isPopupVisible = false;
    } else {
      console.warn('No rows selected or no sale price options selected.');
    }
  }

  handleRoundingChange(event) {
    this.roundingOption = event.value;
    this.applyRounding();
  }

  applyRounding() {
    if (this.selectedRowKeys.length > 0 && this.selectedSalePrice.length > 0) {
      this.selectedRowKeys.forEach((selectedRowId) => {
        const selectedRow = this.worksheetItems.find(
          (row) => row.ID === selectedRowId
        );
        if (selectedRow) {
          this.selectedSalePrice.forEach((selectedOption) => {
            let originalPrice = this.oldValues[selectedRowId][selectedOption];
            let processedPrice = this.isIncrease
              ? originalPrice * (1 + this.percentageString / 100)
              : originalPrice * (1 - this.percentageString / 100);

            this.newPrice = this.roundValue(processedPrice); // Apply rounding
            selectedRow[selectedOption] = this.newPrice;
            // console.log(
            //   `Rounded price for ${selectedOption}, row ID ${selectedRowId}:`,
            //   this.newPrice
            // );
          });
        } else {
          console.error(`Selected row with ID ${selectedRowId} not found.`);
        }
      });
    } else {
      console.warn('No rows selected or no sale price options selected.');
    }
  }

  onPriceAdjustmentChanged(event: any) {
    this.isIncrease = event.value;
    console.log(this.isIncrease ? 'Increase selected' : 'Decrease selected');
  }

  adjustPercentage(amount: number) {
    this.percentage += amount;
    if (this.percentage < 0) this.percentage = 0; // Ensure percentage doesn't go below 0

    console.log(`Adjusted percentage: ${this.percentage}%`);
  }

  toggleAdjustment() {
    this.isIncrease = !this.isIncrease; // Toggle between increase and decrease
    console.log(this.isIncrease ? 'Increase selected' : 'Decrease selected');
  }

  areRowsSelected(): boolean {
    // Replace this with your actual logic for checking selected rows
    return this.selectedRowKeys.length > 0;
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
    DxToastModule,
    DxSwitchModule,
  ],
  providers: [],
  exports: [],
  declarations: [ItemStorePriceApproveComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemStorePriceApproveModule {}
