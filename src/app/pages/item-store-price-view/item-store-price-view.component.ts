import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  ViewChild,
  ViewEncapsulation,
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
  DxTabsModule,
  DxTagBoxModule,
  DxTemplateModule,
  DxTextAreaModule,
  DxTextBoxModule,
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
  selector: 'app-item-store-price-view',
  templateUrl: './item-store-price-view.component.html',
  styleUrls: ['./item-store-price-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ItemStorePriceViewComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  AllowCommitWithSave: any;
  department: any;
  catagory: any;
  brand: any;
  userId: string;
  worksheetData: any;
  worksheetItems: any[] = [];
  showHeaderFilter = true;
  selectedItems: any;
  selectedStoreId: number[] = [1];
  store: any;
  filteredStoreList: any[] = [];
  itemStoresList: any[] = [];
  storeIds: any;
  updatedItems: { [key: number]: any } = {};
  selectedRowCount: any;
  selectedRowId: any;
  oldValues: { [key: string]: { [field: string]: any } } = {};
  salepriceoldValue: any;
  saleprice1oldValue: any;
  saleprice2oldValue: any;
  saleprice3oldValue: any;
  saleprice4oldValue: any;
  saleprice5oldValue: any;
  selectedItemId: null;
  selectedRowKeys: any[] = [];
  selectedRowIds: any;
  isVerified: boolean = false;
  isSaved: boolean = false;
  savedWorksheet: {
    ID: any;
    COMPANY_ID: number;
    USER_ID: number;
    WS_DATE: Date;
    WS_NO: string;
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
  isPopupVisible: boolean;
  isButtonDisabled: boolean = true;
  percentage: number = 0;
  priceAdjustment: string = 'increase';
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
  isEditable: boolean = true;
  status: string | undefined;
  payloadForVerify: any;
  statusOfWorksheet: any;
  isApplyButtonDisabled: boolean = true;
  isApproved: boolean = false;
  dateFormat: string;
  currencyFormt: string;
  private filterApplied = false;

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
    this.dateFormat = sessionStorage.getItem('dateFormat');
    this.currencyFormt = sessionStorage.getItem('currencyFormat');
    console.log(this.currencyFormt, 'DATE');
    // this.getItemsForVerify()
    this.getWorksheetData();
    if (this.selectedStoreId.length > 1) {
      const defaultStoreId = this.selectedStoreId.join(',');
      this.listItemsByMultipleStoreIds(defaultStoreId);
    }
    console.log(this.storeIds, 'inngoninit');

    this.loadStores();
  }

  getWorksheetData(): void {
    this.dataservice.worksheetData$.subscribe((data) => {
      this.worksheetData = data;
      this.statusOfWorksheet = data.status;
      this.worksheetItems = this.worksheetData.worksheet_item_price;
      this.isApplyButtonDisabled = this.statusOfWorksheet === 'Approved';
      console.log('Received worksheet data:', this.worksheetData);
      console.log(data.status, 'GETTING');
      if (
        this.worksheetData.worksheet_item_price &&
        this.worksheetData.worksheet_item_price.length > 0
      ) {
        // this.worksheetItems = this.worksheetData.worksheet_item_price.map((item) => ({
        //   ...item,
        //   PRICE_NEW: '',
        //   PRICE_LEVEL1_NEW: '',
        //   PRICE_LEVEL2_NEW: '',
        //   PRICE_LEVEL3_NEW: '',
        //   PRICE_LEVEL4_NEW: '',
        //   PRICE_LEVEL5_NEW: ''
        // }));
        this.selectedItems = this.worksheetItems.filter(
          (item) => item.Selected === true
        );
        const storId = this.worksheetData.worksheet_item_store.map(
          (storeID) => storeID.STORE_ID
        );
        this.payloadForVerify = {
          // ...cleanedPayload, // Use cleanedPayload without worksheet_item_store
          ID: this.worksheetData.ID,
          COMPANY_ID: 1,
          USER_ID: 1,
          STORE_ID: storId[0],
          NARRATION: '',
          worksheet_item_price: this.worksheetItems, // Update worksheet_item_price with updated data
        };

        console.log(this.payloadForVerify, 'PAYLOAD IN VERIFY');
        console.log(this.selectedItems, 'Filtered Selected Items');
        if (this.selectedItems.length > 0) {
          this.selectedRowKeys = this.selectedItems.map((item) => item.ID);
          console.log(this.selectedRowKeys, 'Selected Row Keys');
          this.isButtonDisabled = false;
        } else {
          console.warn('No selected items found.');
          this.isButtonDisabled = true;
        }
      } else {
        console.warn('worksheet_item_price is empty or not present.');
      }

      if (this.worksheetData?.worksheet_item_store?.length > 0) {
        this.selectedStoreId = this.worksheetData.worksheet_item_store.map(
          (store) => store.STORE_ID
        );
        console.log(this.selectedStoreId, 'SELECTEDSTOREID');
      } else {
        console.warn('worksheet_item_store is empty or not present.');
      }

      // if (this.worksheetData?.worksheet_item_store?.length > 0) {
      //   this.selectedStoreId = [
      //     this.worksheetData.worksheet_item_store[0].STORE_ID,
      //   ];
      //   console.log(this.selectedStoreId, 'SELECTEDSTOREID');
      // } else {
      //   console.warn('worksheet_item_store is empty or not present.');
      // }
      this.cdr.detectChanges();
    });
  }

  currencyCellTemplate(cellElement: any, cellInfo: any) {
    const value = cellInfo.value;
    const currencyFormat = sessionStorage.getItem('currencyFormat') || 'USD';
    console.log(
      'Retrieved currency format from sessionStorage:',
      currencyFormat
    );
    const formattedCurrency = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyFormat,
    }).format(value !== undefined ? value : 0);
    console.log('Formatted currency:', formattedCurrency);
    cellElement.innerText = formattedCurrency || '$0.00'; // Fallback to default if empty
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
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching item list:', error);
      }
    );
  }

  // onRowUpdated(event: any) {
  //   console.log('Row Updated Event Triggered');
  //   const updatedData = event.data;
  //   const rowId = updatedData.ID;
  //   this.updatedItems[rowId] = {
  //     ITEM_ID: rowId,
  //     SALE_PRICE:
  //       updatedData.PRICE_NEW && updatedData.PRICE_NEW !== 0
  //         ? updatedData.PRICE_NEW
  //         : updatedData.SALE_PRICE || 0.0,
  //     PRICE_NEW: '',

  //     SALE_PRICE1:
  //       updatedData.PRICE_LEVEL1_NEW && updatedData.PRICE_LEVEL1_NEW !== 0
  //         ? updatedData.PRICE_LEVEL1_NEW
  //         : updatedData.SALE_PRICE1 || 0.0,
  //     PRICE_LEVEL1_NEW: '',

  //     SALE_PRICE2:
  //       updatedData.PRICE_LEVEL2_NEW && updatedData.PRICE_LEVEL2_NEW !== 0
  //         ? updatedData.PRICE_LEVEL2_NEW
  //         : updatedData.SALE_PRICE2 || 0.0,
  //     PRICE_LEVEL2_NEW: '',  // Set to empty string

  //     SALE_PRICE3:
  //       updatedData.PRICE_LEVEL3_NEW && updatedData.PRICE_LEVEL3_NEW !== 0
  //         ? updatedData.PRICE_LEVEL3_NEW
  //         : updatedData.SALE_PRICE3 || 0.0,
  //     PRICE_LEVEL3_NEW: '',  // Set to empty string

  //     SALE_PRICE4:
  //       updatedData.PRICE_LEVEL4_NEW && updatedData.PRICE_LEVEL4_NEW !== 0
  //         ? updatedData.PRICE_LEVEL4_NEW
  //         : updatedData.SALE_PRICE4 || 0.0,
  //     PRICE_LEVEL4_NEW: '',  // Set to empty string

  //     SALE_PRICE5:
  //       updatedData.PRICE_LEVEL5_NEW && updatedData.PRICE_LEVEL5_NEW !== 0
  //         ? updatedData.PRICE_LEVEL5_NEW
  //         : updatedData.SALE_PRICE5 || 0.0,
  //     PRICE_LEVEL5_NEW: '',  // Set to empty string
  //   };

  //   console.log('Updated row data:', this.updatedItems[rowId]);
  // }

  onRowUpdated(event: any) {
    console.log('Row Updated Event Triggered');

    // Get the updated row data
    const updatedData = event.data;
    const rowId = updatedData.ID;

    // Save PRICE_NEW and related values, not touching SALE_PRICE fields
    this.updatedItems[rowId] = {
      ITEM_ID: rowId,

      // Save SALE_PRICE values (current values)
      SALE_PRICE: updatedData.SALE_PRICE || 0.0,
      SALE_PRICE1: updatedData.SALE_PRICE1 || 0.0,
      SALE_PRICE2: updatedData.SALE_PRICE2 || 0.0,
      SALE_PRICE3: updatedData.SALE_PRICE3 || 0.0,
      SALE_PRICE4: updatedData.SALE_PRICE4 || 0.0,
      SALE_PRICE5: updatedData.SALE_PRICE5 || 0.0,

      // Save the actual PRICE_NEW value
      PRICE_NEW: updatedData.PRICE_NEW || '',

      // Save the actual PRICE_LEVEL1_NEW value
      PRICE_LEVEL1_NEW: updatedData.PRICE_LEVEL1_NEW || '',

      PRICE_LEVEL2_NEW: updatedData.PRICE_LEVEL2_NEW || '',

      PRICE_LEVEL3_NEW: updatedData.PRICE_LEVEL3_NEW || '',

      PRICE_LEVEL4_NEW: updatedData.PRICE_LEVEL4_NEW || '',

      PRICE_LEVEL5_NEW: updatedData.PRICE_LEVEL5_NEW || '',
    };

    // Reset PRICE_NEW and related values to empty strings after saving them
    // updatedData.PRICE_NEW = '';
    // updatedData.PRICE_LEVEL1_NEW = '';
    // updatedData.PRICE_LEVEL2_NEW = '';
    // updatedData.PRICE_LEVEL3_NEW = '';
    // updatedData.PRICE_LEVEL4_NEW = '';
    // updatedData.PRICE_LEVEL5_NEW = '';

    console.log(
      'Updated row data and reset PRICE_NEW values:',
      this.updatedItems[rowId]
    );
  }

  onSelectionChanged(event: any) {
    this.selectedRowCount = event.selectedRowKeys.length;
    this.selectedRowIds = event.selectedRowKeys;
    this.selectedRowKeys = this.selectedRowIds;
    this.isButtonDisabled = this.selectedRowCount === 0;
    console.log(this.selectedRowKeys, 'IN ONSELECTIONCHANGED');

    const selectedItems = event.selectedRowsData;
    if (selectedItems.length > 0) {
      const selectedRow = selectedItems[0];
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

      this.salepriceoldValue = this.oldValues[this.selectedRowId]['PRICE_NEW'];
      this.saleprice1oldValue =
        this.oldValues[this.selectedRowId]['PRICE_LEVEL1_NEW'];
      this.saleprice2oldValue =
        this.oldValues[this.selectedRowId]['PRICE_LEVEL2_NEW'];
      this.saleprice3oldValue =
        this.oldValues[this.selectedRowId]['PRICE_LEVEL3_NEW'];
      this.saleprice4oldValue =
        this.oldValues[this.selectedRowId]['PRICE_LEVEL4_NEW'];
      this.saleprice5oldValue =
        this.oldValues[this.selectedRowId]['PRICE_LEVEL5_NEW'];

      console.log(
        'Old values found for selected row:',
        this.oldValues[this.selectedRowId]
      );
    } else {
      this.selectedRowId = null;
      this.selectedItemId = null;
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
      return; // Stop execution if no rows are selected
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
      PRICE_NEW: item.PRICE_NEW ?? 0.0, // Ensure this reflects the updated value
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
    // console.log('Payload to be sent for edit:', payload);

    this.dataservice.updateworksheetItemPrice(payload).subscribe(
      (response) => {
        this.savedWorksheet = {
          ID: this.selectedRowKeys,
          COMPANY_ID: companyId,
          USER_ID: userId,
          WS_DATE: new Date(),
          WS_NO: 'WS-001',
          flag: 1,
          message: 'Success',
          worksheet_item_price: worksheetItemPrice,
        };

        console.log(this.savedWorksheet, 'SAVEDWORKSHEET1');
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
    // console.log('IV VERIFY');
    // if(this.payloadForVerify){

    //   this.dataservice.verifyItemStorePrices(this.payloadForVerify).subscribe((response) =>{
    //     console.log("verified")
    //   })
    // }
    // if (!this.savedWorksheet) {
    //   console.error('No saved worksheet to verify. Please save first.');
    //   return; // Prevent verifying if nothing is saved
    // }
    // console.log(this.savedWorksheet, 'SAVEDWORKSHEET===========');

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
      PRICE_NEW: item.PRICE_NEW ?? 0.0,
      PRICE_LEVEL1_NEW: item.PRICE_LEVEL1_NEW ?? 0.0,
      PRICE_LEVEL2_NEW: item.PRICE_LEVEL2_NEW ?? 0.0,
      PRICE_LEVEL3_NEW: item.PRICE_LEVEL3_NEW ?? 0.0,
      PRICE_LEVEL4_NEW: item.PRICE_LEVEL4_NEW ?? 0.0,
      PRICE_LEVEL5_NEW: item.PRICE_LEVEL5_NEW ?? 0.0,
    }));
    const verificationPayload = {
      COMPANY_ID: companyId,
      USER_ID: userId,
      STORE_ID: this.storeIds || defaultStoreId,
      NARRATION: narration,
      worksheet_item_price: worksheetItemPrice,
    };
    console.log(verificationPayload, 'VERIFICATIONPAYLOAD');
    this.verifyItemStorePrices(verificationPayload);
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
          // this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not Saved',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
        console.log('Verification successful:', verifyResponse);
        this.isVerified = true;
      });
  }

  onApprove() {
    if (this.payloadForVerify) {
      this.dataservice
        .approveworksheetItemPrices(this.payloadForVerify)
        .subscribe((response) => {
          console.log('APPROVED');
          this.selectedRowKeys = [];
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
          // this.dataGrid.instance.refresh();
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
          if (!this.oldValues[this.selectedRowId]) {
            this.oldValues[this.selectedRowId] = {
              SALE_PRICE: selectedRow.SALE_PRICE,
              SALE_PRICE1: selectedRow.SALE_PRICE1,
              SALE_PRICE2: selectedRow.SALE_PRICE2,
              SALE_PRICE3: selectedRow.SALE_PRICE3,
              SALE_PRICE4: selectedRow.SALE_PRICE4,
              SALE_PRICE5: selectedRow.SALE_PRICE5,
            };
            console.log(this.oldValues[this.selectedRowId], '=========');
          } else {
            console.log(
              'Old values already stored:',
              this.oldValues[this.selectedRowId]
            );
          }
        } else {
          console.error(
            `Selected row with ID ${selectedRowId} not found in the data source.`
          );
        }
      });
      console.log('All Selected Rows Data:', selectedRowsData);
    } else {
      console.warn('No rows selected.');
    }
  }

  handlePercentageChange(event) {
    const percentageValue = parseFloat(this.percentageString);

    if (isNaN(percentageValue)) {
      console.warn('Invalid percentage value.');
      return;
    }

    this.selectedRowKeys.forEach((rowId) => {
      const selectedRow = this.worksheetItems.find((row) => row.ID === rowId);

      if (selectedRow) {
        const salePriceKey = this.selectedSalePrice;
        const originalPrice = selectedRow[salePriceKey];
        this.newPrice;
        if (this.isIncrease) {
          this.newPrice =
            originalPrice + originalPrice * (percentageValue / 100); // Increase
          console.log(this.newPrice, 'new price');
        } else {
          this.newPrice =
            originalPrice - originalPrice * (percentageValue / 100); // Decrease
        }
        console.log(
          `Updated row ID ${rowId}: ${salePriceKey} is now ${this.newPrice}`
        );
        this.newPrice = this.applyRounding();
        // Log the adjusted price
        console.log(
          `Updated row ID after processed ${rowId}: ${salePriceKey} is now ${this.newPrice}`
        );
      } else {
        console.error(`Row ID ${rowId} not found in the data source.`);
      }
    });
  }

  handleSalePriceChange(event) {
    const selectedOption = event.value;
    if (this.selectedRowKeys.length > 0) {
      this.selectedRowKeys.forEach((selectedRowId) => {
        const selectedRow = this.worksheetItems.find(
          (row) => row.ID === selectedRowId
        );
        if (selectedRow) {
          const salePriceValue = selectedRow[selectedOption];
          console.log(
            `Selected SALE_PRICE option for row ID ${selectedRowId}:`,
            salePriceValue
          );
        } else {
          console.error(
            `Selected row with ID ${selectedRowId} not found in the data source.`
          );
        }
      });
    } else {
      console.warn('No rows selected.');
    }
  }

  applyRounding() {
    if (this.selectedRowKeys.length > 0) {
      // Loop through each selected row
      this.selectedRowKeys.forEach((selectedRowId) => {
        const selectedRow = this.worksheetItems.find(
          (row) => row.ID === selectedRowId
        );

        if (selectedRow) {
          // Get the selected price option (SALE_PRICE, SALE_PRICE1, etc.)
          const selectedOption = this.selectedSalePrice;

          // Retrieve the sale price value for the selected option
          let salePrice = selectedRow[selectedOption];

          // Apply the percentage increase or decrease
          let processedPrice = this.isIncrease
            ? salePrice * (1 + this.percentageString / 100)
            : salePrice * (1 - this.percentageString / 100);

          // Round the processed price based on rounding option
          this.newPrice = this.roundValue(processedPrice);
          selectedRow[selectedOption] = this.newPrice;
          // this.onRowUpdated({ data: selectedRow });
          console.log(
            `Processed ${selectedOption} for row ID ${selectedRowId}:`,
            this.newPrice
          );
        } else {
          console.error(`Selected row with ID ${selectedRowId} not found.`);
        }
      });
    } else {
      console.warn('No rows selected.');
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
    if (this.selectedRowKeys.length > 0) {
      this.selectedRowKeys.forEach((rowId) => {
        const selectedRow = this.worksheetItems.find((row) => row.ID === rowId);
        if (selectedRow) {
          const selectedOption = this.selectedSalePrice;
          let currentSalePrice = selectedRow[selectedOption];
          let processedPrice = this.isIncrease
            ? currentSalePrice * (1 + this.percentageString / 100)
            : currentSalePrice * (1 - this.percentageString / 100);
          let finalPrice = this.roundValue(processedPrice);
          selectedRow[selectedOption] = finalPrice;
          this.onRowUpdated({ data: selectedRow });

          console.log(
            `Updated ${selectedOption} for row ID ${selectedRow.ID}:`,
            finalPrice
          );
        } else {
          console.error('Selected row not found in the data source.');
        }
      });
      this.isPopupVisible = false;
    } else {
      console.warn('No rows selected.');
    }
  }

  handleRoundingChange(event) {
    this.roundingOption = event.value;
    this.applyRounding();
  }

  onPriceAdjustmentChanged(event: any) {
    this.isIncrease = event.value;
    console.log(this.isIncrease ? 'Increase selected' : 'Decrease selected');
  }

  adjustPercentage(amount: number) {
    this.percentage += amount;
    if (this.percentage < 0) this.percentage = 0;
  }

  toggleAdjustment() {
    this.isIncrease = !this.isIncrease;
    console.log(this.isIncrease ? 'Increase selected' : 'Decrease selected');
    this.handlePercentageChange({ value: this.percentageString });
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
  ],
  providers: [],
  exports: [],
  declarations: [ItemStorePriceViewComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemStorePriceViewModule {}
