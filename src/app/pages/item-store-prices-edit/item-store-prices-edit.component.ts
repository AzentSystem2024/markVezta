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
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-item-store-prices-edit',
  templateUrl: './item-store-prices-edit.component.html',
  styleUrls: ['./item-store-prices-edit.component.scss'],
})
export class ItemStorePricesEditComponent {
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
  disableIfVerified: boolean = true;
  isApproved: boolean = false;
  dateFormat: string;
  currencyFormt: string;
  worksheetItemPrices: any;
  itemIds: number[];
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  selectedIds: any[];
  isFilterOpened = false;
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
    console.log(this.currencyFormt, 'CURRENCYFORMAT');
    this.getWorksheetData();
    if (this.selectedStoreId.length > 1) {
      const defaultStoreId = this.selectedStoreId.join(',');
      this.listItemsByMultipleStoreIds(defaultStoreId);
    }
    this.loadStores();
  }
  getWorksheetData(): void {
    this.dataservice.worksheetData$.subscribe((data) => {
      this.worksheetData = data;
      console.log(this.worksheetData, 'IN EDITTTT');

      const allItems = this.worksheetData.worksheet_item_price || [];
      console.log(allItems, 'ALL WORKSHEET ITEMS');

      if (!this.filterApplied) {
        this.worksheetItems = allItems.filter((item) => item.Selected === true);
        this.filterApplied = true; // Mark filtering done
      }

      console.log(this.worksheetItems, 'FILTERED SELECTED ITEMS');

      this.itemIds = this.worksheetItems.map((item) => +item.ITEM_ID);
      console.log(this.itemIds, 'Extracted ITEM_IDs as numbers');

      this.selectedItems = this.worksheetItems;
      this.selectedRowKeys = this.selectedItems.map((item) => item.ID);
      console.log(this.selectedRowKeys, 'Selected Row Keys');

      this.statusOfWorksheet = data.status;
      this.isApplyButtonDisabled = this.statusOfWorksheet === 'Approved';
      this.disableIfVerified = this.statusOfWorksheet === 'Verified';

      if (this.worksheetData?.worksheet_item_price?.length > 0) {
        const storId = this.worksheetData.worksheet_item_store.map(
          (store) => store.STORE_ID
        );
        this.payloadForVerify = {
          ID: this.worksheetData.ID,
          COMPANY_ID: 1,
          USER_ID: 1,
          STORE_ID: storId[0],
          NARRATION: '',
          worksheet_item_price: this.worksheetItems,
        };
        this.isButtonDisabled = this.selectedItems.length === 0;
      } else {
        console.warn('worksheet_item_price is empty or not present.');
      }

      if (this.worksheetData?.worksheet_item_store?.length > 0) {
        this.selectedStoreId = this.worksheetData.worksheet_item_store.map(
          (store) => store.STORE_ID
        );
      } else {
        this.selectedStoreId = [];
      }

      this.cdr.detectChanges();
    });
  }

  // getWorksheetData(): void {
  //   this.dataservice.worksheetData$.subscribe((data) => {
  //     this.worksheetData = data;
  //     console.log(this.worksheetData, 'IN EDITTTT');

  //     this.worksheetItems = this.worksheetData.worksheet_item_price || [];
  //     console.log(this.worksheetItems, '+++++++++=');

  //     this.itemIds = this.worksheetItems.map((item) => +item.ITEM_ID);
  //     console.log(this.itemIds, 'Extracted ITEM_IDs as numbers');

  //     // Select rows that have Selected === true
  //     this.selectedItems = this.worksheetItems.filter(
  //       (item) => item.Selected === true
  //     );

  //     // Now set selectedRowKeys after selecting items
  //     this.selectedRowKeys = this.selectedItems.map((item) => item.ID);
  //     console.log(this.selectedRowKeys, 'Selected Row Keys');

  //     this.statusOfWorksheet = data.status;
  //     this.isApplyButtonDisabled = this.statusOfWorksheet === 'Approved';
  //     this.disableIfVerified = this.statusOfWorksheet === 'Verified';

  //     if (this.worksheetData?.worksheet_item_price?.length > 0) {
  //       const storId = this.worksheetData.worksheet_item_store.map(
  //         (store) => store.STORE_ID
  //       );
  //       this.payloadForVerify = {
  //         ID: this.worksheetData.ID,
  //         COMPANY_ID: 1,
  //         USER_ID: 1,
  //         STORE_ID: storId[0],
  //         NARRATION: '',
  //         worksheet_item_price: this.worksheetItems,
  //       };
  //       this.isButtonDisabled = this.selectedItems.length === 0;
  //     } else {
  //       console.warn('worksheet_item_price is empty or not present.');
  //     }

  //     if (this.worksheetData?.worksheet_item_store?.length > 0) {
  //       this.selectedStoreId = this.worksheetData.worksheet_item_store.map(
  //         (store) => store.STORE_ID
  //       );
  //     } else {
  //       this.selectedStoreId = [];
  //     }

  //     this.cdr.detectChanges(); // Ensure UI refresh
  //   });
  // }
  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  onToolbarPreparing(e: any) {
    const toolbarItems = e.toolbarOptions.items;

    // Avoid adding the button more than once
    const alreadyAdded = toolbarItems.some(
      (item: any) => item.name === 'toggleFilterButton'
    );
    if (!alreadyAdded) {
      toolbarItems.splice(toolbarItems.length - 1, 0, {
        widget: 'dxButton',
        name: 'toggleFilterButton', // custom name to avoid duplicates
        location: 'after',
        options: {
          icon: 'filter',
          hint: 'Search Column',
          onClick: () => this.toggleFilters(),
        },
      });
    }
  }

  currencyCellTemplate(cellElement: any, cellInfo: any) {
    if (cellInfo.value) {
      const formattedCurrency = new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(cellInfo.value);
      cellElement.innerText = formattedCurrency;
    }
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
    console.log(storeIds, 'STOREIDSSSSSSSSSSSSSSS');
    this.dataservice.getItemListByStoreId(storeIds).subscribe(
      (response) => {
        this.worksheetItems = response.PriceWizardData;
        this.selectedItems = this.worksheetItems.filter(
          (item) => item.Selected === true
        );
        if (this.selectedItems.length > 0) {
          this.selectedRowKeys = this.selectedItems.map((item) => item.ID);
        } else {
          this.selectedRowKeys = [];
        }
        this.cdr.detectChanges();
      },
      (error) => {
        // console.error('Error fetching item list:', error);
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

    // Automatically select all rows if there are items available
    if (totalItemsCount > 0 && this.selectedRowCount === 0) {
      // Select all rows
      event.component.selectAll();

      // After selecting all, use setTimeout to allow for the grid's update
      setTimeout(() => {
        // Get the updated selected keys from the component directly
        this.selectedRowIds = event.component.getSelectedRowKeys();
        this.selectedRowCount = this.selectedRowIds.length;
        this.selectedRowKeys = this.selectedRowIds;

        // Determine if the button should be disabled
        this.isButtonDisabled = this.selectedRowCount === 0;

        // Store selected items
        this.selectedItems = event.selectedRowsData;

        if (this.selectedItems.length > 0) {
          const selectedRow = this.selectedItems[0];
          this.selectedRowId = selectedRow.ID;
          this.selectedItems = selectedRow.ITEM_ID;

          // Store old values if not already stored
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
      }, 0); // Allow time for the selection to be processed
    } else {
      // If not selecting all, update the selected counts normally
      this.selectedRowIds = event.selectedRowKeys;
      this.selectedRowCount = this.selectedRowIds.length;
      this.selectedRowKeys = this.selectedRowIds;

      // Determine if the button should be disabled
      this.isButtonDisabled = this.selectedRowCount === 0;

      // Store selected items
      this.selectedItems = event.selectedRowsData;

      if (this.selectedItems.length > 0) {
        const selectedRow = this.selectedItems[0];
        this.selectedRowId = selectedRow.ID;
        this.selectedItems = selectedRow.ITEM_ID;

        // Store old values if not already stored
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
    const ID = this.worksheetData.ID;
    const companyId = 1;
    const userId = 1;
    const narration = 'Narration';
    const defaultStoreId = 1;
    const worksheetItemPrice = this.itemIds.map((itemId, index) => {
      const originalItem = this.worksheetData.worksheet_item_price[index]; // Get original item data
      // console.log(itemId,"ITEMID")
      // Get updated item, if any
      const updatedItem = this.updatedItems[itemId] || {};

      return {
        ITEM_ID: itemId,
        SALE_PRICE: updatedItem.SALE_PRICE ?? originalItem.SALE_PRICE ?? 0.0,
        SALE_PRICE1: updatedItem.SALE_PRICE1 ?? originalItem.SALE_PRICE1 ?? 0.0,
        SALE_PRICE2: updatedItem.SALE_PRICE2 ?? originalItem.SALE_PRICE2 ?? 0.0,
        SALE_PRICE3: updatedItem.SALE_PRICE3 ?? originalItem.SALE_PRICE3 ?? 0.0,
        SALE_PRICE4: updatedItem.SALE_PRICE4 ?? originalItem.SALE_PRICE4 ?? 0.0,
        SALE_PRICE5: updatedItem.SALE_PRICE5 ?? originalItem.SALE_PRICE5 ?? 0.0,
        PRICE_NEW: updatedItem.PRICE_NEW ?? originalItem.PRICE_NEW ?? 0.0, // Ensure this reflects the updated value
        PRICE_LEVEL1_NEW:
          updatedItem.PRICE_LEVEL1_NEW ?? originalItem.PRICE_LEVEL1_NEW ?? 0.0,
        PRICE_LEVEL2_NEW:
          updatedItem.PRICE_LEVEL2_NEW ?? originalItem.PRICE_LEVEL2_NEW ?? 0.0,
        PRICE_LEVEL3_NEW:
          updatedItem.PRICE_LEVEL3_NEW ?? originalItem.PRICE_LEVEL3_NEW ?? 0.0,
        PRICE_LEVEL4_NEW:
          updatedItem.PRICE_LEVEL4_NEW ?? originalItem.PRICE_LEVEL4_NEW ?? 0.0,
        PRICE_LEVEL5_NEW:
          updatedItem.PRICE_LEVEL5_NEW ?? originalItem.PRICE_LEVEL5_NEW ?? 0.0,
      };
    });

    console.log(worksheetItemPrice, 'WORKSHEETITEMPRICE');
    let storeId = this.worksheetData.worksheet_item_store
      .map((storeID) => storeID.STORE_ID)
      .join(',');
    if (storeId.includes(',')) {
      storeId = '1';
    }
    const payload = {
      ID: ID,
      COMPANY_ID: companyId,
      USER_ID: userId,
      // STORE_ID: storeId || defaultStoreId,
      STORE_ID: String(this.storeIds || defaultStoreId),
      NARRATION: narration,
      worksheet_item_price: worksheetItemPrice,
    };
    console.log(payload, 'PAYLOADDDD');

    if (this.isApproved) {
      const result = confirm(
        'Are you sure you want to approve this worksheet?',
        'Confirm Approval'
      );

      result.then((dialogResult) => {
        if (dialogResult) {
          // ✅ User confirmed approval
          this.dataservice.approveworksheetItemPrices(payload).subscribe(
            (response) => {
              notify(
                {
                  message: 'Worksheet Approved Successfully',
                  position: { at: 'top center', my: 'top center' },
                },
                'success'
              );
              this.router.navigate(['/change-price']);
            },
            (error) => {
              console.error('Error approving worksheet:', error);
              notify(
                {
                  message: 'Error approving worksheet',
                  position: { at: 'top right', my: 'top right' },
                },
                'error'
              );
            }
          );
        }
      });
    } else {
      // ✅ Call update API
      this.dataservice.updateworksheetItemPrice(payload).subscribe(
        (response) => {
          if (response) {
            this.savedWorksheet = {
              ID: this.selectedRowId,
              COMPANY_ID: companyId,
              USER_ID: userId,
              WS_DATE: new Date(),
              WS_NO: 'WS-001',
              flag: 1,
              message: 'Success',
              worksheet_item_price: worksheetItemPrice,
            };
            notify(
              {
                message: 'Worksheet Updated Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success'
            );
            if (!this.AllowCommitWithSave) {
              this.router.navigate(['/change-price']);
            }
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
    // this.dataservice.updateworksheetItemPrice(payload).subscribe(
    //   (response) => {
    //     if (response) {
    //       this.savedWorksheet = {
    //         ID: this.selectedRowId,
    //         COMPANY_ID: companyId,
    //         USER_ID: userId,
    //         WS_DATE: new Date(),
    //         WS_NO: 'WS-001',
    //         flag: 1, // Assuming success
    //         message: 'Success',
    //         worksheet_item_price: worksheetItemPrice,
    //       };
    //       notify(
    //         {
    //           message: 'Worksheet Updated Successfully',
    //           position: { at: 'top center', my: 'top center' },
    //         },
    //         'success'
    //       );
    //       if (!this.AllowCommitWithSave) {
    //         this.router.navigate(['/change-price']); // Adjust the route if necessary
    //       }
    //     } else {
    //       notify(
    //         {
    //           message: 'Your Data Not Saved',
    //           position: { at: 'top right', my: 'top right' },
    //         },
    //         'error'
    //       );
    //     }
    //   },
    //   (error) => {
    //     console.error('Error saving data:', error);
    //   }
    // );
  }

  onVerify() {
    if (this.AllowCommitWithSave) {
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
      const ID = this.worksheetData.ID;
      let storeId = this.worksheetData.worksheet_item_store
        .map((storeID) => storeID.STORE_ID)
        .join(',');

      if (storeId.includes(',')) {
        storeId = '1';
      }
      const verificationPayload = {
        ID: ID,
        COMPANY_ID: companyId,
        USER_ID: userId,
        STORE_ID: storeId || defaultStoreId,
        NARRATION: narration,
        worksheet_item_price: worksheetItemPrice,
      };
      console.log(verificationPayload, 'VERIFICATIONPAYLOAD');
      this.verifyItemStorePrices(verificationPayload);
    }
  }

  verifyItemStorePrices(payload) {
    if (this.AllowCommitWithSave) {
      this.dataservice
        .verifyItemStorePrices(this.payloadForVerify)
        .subscribe((verifyResponse) => {
          console.log(verifyResponse, 'VERIFYRESPONSE');
          if (verifyResponse) {
            notify(
              {
                message: 'Worksheet Verified Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success'
            );
            this.isVerified = true;
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
          // this.isVerified = true;
        });
    }
  }

  onApprove() {
    if (this.AllowCommitWithSave) {
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
      const worksheetItemPrice = Object.values(this.updatedItems).map(
        (item) => ({
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
        })
      );
      const ID = this.worksheetData.ID;
      let storeId = this.worksheetData.worksheet_item_store
        .map((storeID) => storeID.STORE_ID)
        .join(',');

      // If multiple stores are selected, set storeId to "1"
      if (storeId.includes(',')) {
        storeId = '1';
      }
      const approvePayload = {
        ID: ID,
        COMPANY_ID: companyId,
        USER_ID: userId,
        STORE_ID: storeId || defaultStoreId,
        NARRATION: narration,
        worksheet_item_price: worksheetItemPrice,
      };

      this.approveItemStoreProperties(approvePayload);
    }
  }

  approveItemStoreProperties(payload) {
    if (this.AllowCommitWithSave) {
      this.dataservice
        .approveworksheetItemPrices(this.payloadForVerify)
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

    console.log(`Selected sale price options: ${selectedOptions}`);
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
          // Iterate over each selected option
          this.selectedSalePrice.forEach((selectedOption) => {
            let originalPrice = this.oldValues[rowId][selectedOption]; // Use original value

            // Calculate the new price without modifying the original sale price
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

            // Optionally trigger an event to notify that the row has been updated
            this.onRowUpdated({ data: selectedRow });

            console.log(
              `Updated ${selectedOption} for row ID ${selectedRow.ID}:`,
              finalPrice
            );
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
          // Iterate over each selected option
          this.selectedSalePrice.forEach((selectedOption) => {
            let originalPrice = this.oldValues[selectedRowId][selectedOption]; // Use original value

            // Calculate the new price
            let processedPrice = this.isIncrease
              ? originalPrice * (1 + this.percentageString / 100)
              : originalPrice * (1 - this.percentageString / 100);

            this.newPrice = this.roundValue(processedPrice); // Apply rounding
            selectedRow[selectedOption] = this.newPrice; // This updates the displayed value

            console.log(
              `Rounded price for ${selectedOption}, row ID ${selectedRowId}:`,
              this.newPrice
            );
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
    this.isIncrease = event.value; // True for increase, false for decrease

    console.log(this.isIncrease ? 'Increase selected' : 'Decrease selected');

    // This does not apply the change yet, it only sets the mode (increase or decrease)
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
  ],
  providers: [],
  exports: [],
  declarations: [ItemStorePricesEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemStorePricesEditModule {}
