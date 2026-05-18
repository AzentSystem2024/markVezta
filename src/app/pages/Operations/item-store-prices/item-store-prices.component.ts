import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  NgModule,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
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
import { filter, forkJoin } from 'rxjs';
import { FormTextboxModule } from 'src/app/components';
import { ItemsFormModule } from 'src/app/components/library/items-form/items-form.component';
import { DataService } from 'src/app/services';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-item-store-prices',
  templateUrl: './item-store-prices.component.html',
  styleUrls: ['./item-store-prices.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ItemStorePricesComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @Output() afterSave = new EventEmitter<void>();
  allItems: any;
  allItemsList: any;
  totalRowCount: any;
  selectedStoreId: any;
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
    { value: 'SALE_PRICE', text: 'MRP ' },
    { value: 'SALE_PRICE1', text: 'Standard Price' },
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
  toastMessage: string = '';
  isApproved: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  showInfo = true;
  showNavButtons = true;
  worksheetID: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  selected_Company_id: any;
  itemtype: any[] = [];

  //----------------select columns--------
  priceColumnOptions = [
    { text: 'MRP', value: 'MRP' },
    { text: 'Standard Price', value: 'PRICE1' },
    { text: 'Price 2', value: 'PRICE2' },
    { text: 'Price 3', value: 'PRICE3' },
    { text: 'Price 4', value: 'PRICE4' },
    { text: 'Price 5', value: 'PRICE5' },
  ];
  priceValidationMap: any = {
    MRP: {
      field: 'PRICE_NEW',
      message: 'MRP',
    },
    PRICE1: {
      field: 'PRICE_LEVEL1_NEW',
      message: 'Standard Price',
    },
    PRICE2: {
      field: 'PRICE_LEVEL2_NEW',
      message: 'Price 2',
    },
    PRICE3: {
      field: 'PRICE_LEVEL3_NEW',
      message: 'Price 3',
    },
    PRICE4: {
      field: 'PRICE_LEVEL4_NEW',
      message: 'Price 4',
    },
    PRICE5: {
      field: 'PRICE_LEVEL5_NEW',
      message: 'Price 5',
    },
  };
  zeroColumns: any[] = [];

  selectedPriceColumns: string[] = ['MRP']; // default visible

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };
  narrationText: any;
  isSaving = false;

  constructor(
    private dataservice: DataService,
    private router: Router,
  ) {
    this.loadDropdownData();
    const payload = {
      NAME: 'ITEMTYPE',
    };
    dataservice.getDropdownData(payload).subscribe((data) => {
      this.itemtype = data;
    });
  }

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    // this.sessionData_tax();
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/credit-note');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
    this.AllowCommitWithSave = sessionStorage.getItem('AllowCommitWithSave');
    this.sesstion_Details();
    this.loadStores();
    // this.getWorksheetData();
    const defaultStoreId = this.selectedStoreId;
    this.listItemsByMultipleStoreIds(defaultStoreId);
    this.itemStoresList = [];
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // Call your load functions again
        this.loadStores();
        this.listItemsByMultipleStoreIds(this.selectedStoreId);
        this.updatedItems = {};
        this.selectedRowKeys = [];
        this.selectedRowCount = 0;
        this.oldValues = {};
        this.newValues = {
          PRICE_NEW: null,
          PRICE_LEVEL1_NEW: null,
          PRICE_LEVEL2_NEW: null,
          PRICE_LEVEL3_NEW: null,
          PRICE_LEVEL4_NEW: null,
          PRICE_LEVEL5_NEW: null,
        };
        this.isSaved = false;
        this.isVerified = false;
        this.isApproved = false;
        this.isPopupVisible = false;
        this.percentageString = '';
        this.selectedSalePrice = [];
        this.roundingOption = 'none';
        this.isIncrease = true;

        // Clear grid selection visually (if applicable)
        if (this.dataGrid && this.dataGrid.instance) {
          this.dataGrid.instance.clearSelection();
          this.dataGrid.instance.refresh();
        }

        // Reload default store list data (optional)

        this.narrationText = '';
      });
  }

  isVisible(code: string): boolean {
    return this.selectedPriceColumns.includes(code);
  }

  onPriceColumnChange() {
    console.log(this.selectedPriceColumns, '=================selectedPriceColumns===========================')
  }
  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      // grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  onToolbarPreparing(e: any) {

  }
  getWorksheetData(): void {
    this.dataservice.worksheetData$.subscribe((data) => {
      this.worksheetData = data;
      if (
        this.worksheetData.worksheet_item_price &&
        this.worksheetData.worksheet_item_price.length > 0
      ) {
        this.worksheetItems = this.worksheetData.worksheet_item_price.map(
          (item) => ({
            ...item,
            SALE_PRICE: item.SALE_PRICE || 0, // Keep existing SALE_PRICE or set to 0 if undefined
            PRICE_NEW: item.PRICE_NEW || '', // Set PRICE_NEW as is
            SALE_PRICE1: item.PRICE_LEVEL1_NEW || item.SALE_PRICE1 || 0,
            SALE_PRICE2: item.PRICE_LEVEL2_NEW || item.SALE_PRICE2 || 0,
            SALE_PRICE3: item.PRICE_LEVEL3_NEW || item.SALE_PRICE3 || 0,
            SALE_PRICE4: item.PRICE_LEVEL4_NEW || item.SALE_PRICE4 || 0,
            SALE_PRICE5: item.PRICE_LEVEL5_NEW || item.SALE_PRICE5 || 0,
          }),
        );
        this.selectedItems = this.worksheetItems.filter(
          (item) => item.Selected === true,
        );
        if (this.selectedItems.length > 0) {
          this.selectedRowKeys = this.selectedItems.map((item) => item.ID);
          this.isButtonDisabled = false;
        } else {
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

  loadDropdownData() {
    this.dataservice.getDropdownData('DEPARTMENT').subscribe((data) => {
      this.department = data;
    });
    this.dataservice.getDropdownData('ITEMCATEGORY').subscribe((data) => {
      this.catagory = data;
    });
    this.dataservice.getDropdownData('BRAND').subscribe((data) => {
      this.brand = data;
    });
  }

  listItemsByMultipleStoreIds(storeIds: string) {
    this.dataservice.getItemListByStoreId().subscribe(
      (response) => {
        this.itemStoresList = response.PriceWizardData;
      },
      (error) => {
        console.error('Error fetching item list:', error);
      },
    );
  }

  onDropdownValueChanged(event: any) {
    const selectedStoreIds = event.value;
    this.storeIds = selectedStoreIds;
    this.listItemsByMultipleStoreIds(this.storeIds);
  }

  listAllItems() {
    const payload = {};
    this.dataservice.getItemsData().subscribe(
      (items: any) => {
        this.allItems = items.data;
        this.allItemsList = this.allItems;
      },
      (error) => {
        console.error('Error fetching items:', error);
      },
    );
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  loadStores() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.getStoresData(payload).subscribe((response) => {
      this.store = response;
      this.filteredStoreList = this.store;
    });
  }

  onRowUpdated(event: any) {
    console.log('Row updated:', event);
    const updatedData = event.data;
    const rowId = updatedData.ID;
    this.updatedItems[rowId] = {
      ITEM_ID: rowId,
      ITEM_CODE: updatedData.ITEM_CODE,
      SALE_PRICE: updatedData.SALE_PRICE || 0.0,
      SALE_PRICE1: updatedData.SALE_PRICE1 || 0.0,
      SALE_PRICE2: updatedData.SALE_PRICE2 || 0.0,
      SALE_PRICE3: updatedData.SALE_PRICE3 || 0.0,
      SALE_PRICE4: updatedData.SALE_PRICE4 || 0.0,
      SALE_PRICE5: updatedData.SALE_PRICE5 || 0.0,
      PRICE_NEW: updatedData.PRICE_NEW ?? null,
      PRICE_LEVEL1_NEW: updatedData.PRICE_LEVEL1_NEW || null,
      PRICE_LEVEL2_NEW: updatedData.PRICE_LEVEL2_NEW || null,
      PRICE_LEVEL3_NEW: updatedData.PRICE_LEVEL3_NEW || null,
      PRICE_LEVEL4_NEW: updatedData.PRICE_LEVEL4_NEW || null,
      PRICE_LEVEL5_NEW: updatedData.PRICE_LEVEL5_NEW || null,
    };

    console.log('Updated items dictionary:', this.updatedItems);
  }

  onCellValueChanged(event: any) {
    const updatedData = event.data;
    const changedField = event.column.dataField;
    const newValue = event.value;
    const rowId = updatedData.ID;
    if (!this.updatedItems[rowId]) {
      this.updatedItems[rowId] = {};
    }
    this.updatedItems[rowId][changedField] = newValue;
  }

  onSaved(event: any) { }

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
    const narration = '';
    const defaultStoreId = 1;
    console.log(this.updatedItems, '==============updatedItems===================')
    const worksheetItemPrice = Object.values(this.updatedItems).map((item) => ({
      ITEM_ID: item.ITEM_ID,
      ITEM_CODE: item.ITEM_CODE,
      SALE_PRICE: item.SALE_PRICE ?? null,
      SALE_PRICE1: item.SALE_PRICE1 ?? null,
      SALE_PRICE2: item.SALE_PRICE2 ?? null,
      SALE_PRICE3: item.SALE_PRICE3 ?? null,
      SALE_PRICE4: item.SALE_PRICE4 ?? null,
      SALE_PRICE5: item.SALE_PRICE5 ?? null,
      PRICE_NEW: item.PRICE_NEW ?? null,
      PRICE_LEVEL1_NEW: item.PRICE_LEVEL1_NEW ?? null,
      PRICE_LEVEL2_NEW: item.PRICE_LEVEL2_NEW ?? null,
      PRICE_LEVEL3_NEW: item.PRICE_LEVEL3_NEW ?? null,
      PRICE_LEVEL4_NEW: item.PRICE_LEVEL4_NEW ?? null,
      PRICE_LEVEL5_NEW: item.PRICE_LEVEL5_NEW ?? null,
    }));

    console.log('Payload for saving:', worksheetItemPrice)
    // const updatedList = worksheetItemPrice.map((item: any) => {
    //   return {
    //     ...item,
    //     PRICE_NEW: item.PRICE_NEW ?? item.SALE_PRICE,
    //     PRICE_LEVEL1_NEW: item.PRICE_LEVEL1_NEW ?? item.SALE_PRICE1,
    //     PRICE_LEVEL2_NEW: item.PRICE_LEVEL2_NEW ?? item.SALE_PRICE2,
    //     PRICE_LEVEL3_NEW: item.PRICE_LEVEL3_NEW ?? item.SALE_PRICE3,
    //     PRICE_LEVEL4_NEW: item.PRICE_LEVEL4_NEW ?? item.SALE_PRICE4,
    //     PRICE_LEVEL5_NEW: item.PRICE_LEVEL5_NEW ?? item.SALE_PRICE5,
    //   };
    // });
    const payload = {
      ID: 0,
      COMPANY_ID: companyId,
      USER_ID: userId,
      // STORE_ID: this.storeIds || defaultStoreId,
      STORE_ID: String(this.storeIds || defaultStoreId),
      NARRATION: this.narrationText,
      worksheet_item_price: worksheetItemPrice,
    };
    console.log('Final payload before validation:', payload);
    if (!payload.worksheet_item_price) {
      notify(
        {
          message: 'Please update at least one price',
          position: { at: 'top right', my: 'top right' },
        },
        'error'
      );
      return;
    }

    const invalidItems = payload.worksheet_item_price.filter((item: any) => {
      // If PRICE_NEW is null/undefined, use SALE_PRICE
      const mrp =
        item.PRICE_NEW != null
          ? Number(item.PRICE_NEW)
          : Number(item.SALE_PRICE);

      const standardPrice =
        item.PRICE_LEVEL1_NEW != null
          ? Number(item.PRICE_LEVEL1_NEW)
          : Number(item.SALE_PRICE1);

      // Skip invalid number cases
      if (isNaN(mrp) || isNaN(standardPrice)) {
        return false;
      }

      console.log(mrp, standardPrice, 'MRP, Standard Price');

      // MRP must be greater than Standard Price
      return mrp <= standardPrice;
    });

    if (invalidItems.length > 0) {
      const itemCodes = invalidItems
        .map((item: any) => item.ITEM_CODE || item.ITEM_ID)
        .join(', ');

      notify(
        `MRP must be greater than Standard Price for Item(s): ${itemCodes}`,
        'error',
        5000,
      );

      this.isSaving = false;
      return;
    }

    console.log('========selectedPriceColumns==================', this.selectedPriceColumns)


    const invalidItems_required: string[] = [];

    payload.worksheet_item_price.forEach((item: any) => {
      const missingFields: string[] = [];

      // Check MRP
      if (this.selectedPriceColumns.includes('MRP')) {
        const mrp =
          item.PRICE_NEW

        if (mrp == null) {
          missingFields.push('MRP');
        }
      }

      // Check PRICE1
      if (this.selectedPriceColumns.includes('PRICE1')) {
        const price1 =
          item.PRICE_LEVEL1_NEW

        if (price1 == null) {
          missingFields.push('Standard Price');
        }
      }

      // Check PRICE2
      if (this.selectedPriceColumns.includes('PRICE2')) {
        const price2 =
          item.PRICE_LEVEL2_NEW

        if (price2 == null) {
          missingFields.push('Price 2');
        }
      }

      // Check PRICE3
      if (this.selectedPriceColumns.includes('PRICE3')) {
        const price3 =
          item.PRICE_LEVEL3_NEW
        if (price3 == null) {
          missingFields.push('Price 3');
        }
      }

      // Check PRICE4
      if (this.selectedPriceColumns.includes('PRICE4')) {
        const price4 =
          item.PRICE_LEVEL4_NEW

        if (price4 == null) {
          missingFields.push('Price 4');
        }
      }

      // Check PRICE5
      if (this.selectedPriceColumns.includes('PRICE5')) {
        const price5 =
          item.PRICE_LEVEL5_NEW!

        if (price5 == null) {
          missingFields.push('Price 5');
        }
      }

      if (missingFields.length > 0) {
        console.log(missingFields, '==========missing fileds================')
        invalidItems_required.push(
          `${item.ITEM_CODE} (${missingFields.join(', ')})`
        );
      }
    });
    console.log('============invalidItems_required=====', invalidItems_required)

    if (invalidItems_required.length > 0) {
      notify(
        `Required price values missing for: ${invalidItems_required.join(' , ')}`,
        'error',
        5000
      );

      this.isSaving = false;
      return;
    }
    this.dataservice.saveWorksheetPrice(payload).subscribe(
      (response) => {
        this.worksheetID = response.data.ID;
        this.savedWorksheet = {
          ID: this.selectedRowId,
          COMPANY_ID: companyId,
          USER_ID: userId,
          WS_DATE: new Date(),
          WS_NO: 'WS-001',
          flag: 1, // Assuming success
          message: 'Success',
          worksheet_item_price: worksheetItemPrice,
        };
        if (response) {
          notify(
            {
              message: 'Worksheet Added Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.isSaved = true;
          if (!this.AllowCommitWithSave) {
            this.router.navigate(['/change-price']); // Adjust the route if necessary
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

  // Save() {
  //   if (this.selectedRowKeys.length === 0) {
  //     notify(
  //       {
  //         message: 'No rows selected. Please select at least one row to save.',
  //         position: { at: 'top right', my: 'top right' },
  //       },
  //       'error',
  //     );
  //     return;
  //   }
  //   this.isSaving = true;
  //   const companyId = 1;
  //   const userId = 1;
  //   const narration = this.narrationText;
  //   const defaultStoreId = 1;

  //   // Helper to safely convert empty strings or nulls to 0
  //   const toNumberOrZero = (value: any) =>
  //     value === '' || value == null ? 0 : Number(value);

  //   const worksheetItemPrice = Object.values(this.updatedItems).map(
  //     (item: any) => ({
  //       ITEM_ID: item.ITEM_ID,
  //       SALE_PRICE: toNumberOrZero(item.SALE_PRICE),
  //       SALE_PRICE1: toNumberOrZero(item.SALE_PRICE1),
  //       SALE_PRICE2: toNumberOrZero(item.SALE_PRICE2),
  //       SALE_PRICE3: toNumberOrZero(item.SALE_PRICE3),
  //       SALE_PRICE4: toNumberOrZero(item.SALE_PRICE4),
  //       SALE_PRICE5: toNumberOrZero(item.SALE_PRICE5),
  //       PRICE_NEW: toNumberOrZero(item.PRICE_NEW),
  //       PRICE_LEVEL1_NEW: toNumberOrZero(item.PRICE_LEVEL1_NEW),
  //       PRICE_LEVEL2_NEW: toNumberOrZero(item.PRICE_LEVEL2_NEW),
  //       PRICE_LEVEL3_NEW: toNumberOrZero(item.PRICE_LEVEL3_NEW),
  //       PRICE_LEVEL4_NEW: toNumberOrZero(item.PRICE_LEVEL4_NEW),
  //       PRICE_LEVEL5_NEW: toNumberOrZero(item.PRICE_LEVEL5_NEW),
  //     }),
  //   );

  //   const hasEnteredPrice = worksheetItemPrice.some(
  //     (item) =>
  //       item.PRICE_NEW > 0 ||
  //       item.PRICE_LEVEL1_NEW > 0 ||
  //       item.PRICE_LEVEL2_NEW > 0 ||
  //       item.PRICE_LEVEL3_NEW > 0 ||
  //       item.PRICE_LEVEL4_NEW > 0 ||
  //       item.PRICE_LEVEL5_NEW > 0,
  //   );

  //   if (!hasEnteredPrice) {
  //     notify(
  //       {
  //         message:
  //           'Please enter at least one price value (New Price Value) before saving.',
  //         position: { at: 'top right', my: 'top right' },
  //       },
  //       'error',
  //     );
  //     this.isSaving = false;
  //     return;
  //   }

  //   const payload = {
  //     ID: 0,
  //     COMPANY_ID: companyId,
  //     USER_ID: userId,
  //     STORE_ID: String(this.storeIds || defaultStoreId),
  //     NARRATION: this.narrationText,
  //     worksheet_item_price: worksheetItemPrice,
  //   };

  //   const invalidItems = payload.worksheet_item_price.filter((item: any) => {
  //     const priceToCheck =
  //       Number(item.PRICE_NEW) === 0
  //         ? Number(item.SALE_PRICE)
  //         : Number(item.PRICE_NEW);
  //     return priceToCheck <= Number(item.PRICE_LEVEL1_NEW);
  //   });

  //   if (invalidItems.length > 0) {
  //     const itemCodes = invalidItems
  //       .map((item: any) => item.PRICE_LEVEL1_NEW)
  //       .join(', ');

  //     notify(
  //       `MRP  must be greater than Standard Price : ${itemCodes}`,
  //       'error',
  //       5000,
  //     );
  //     this.isSaving = false;
  //     return;
  //   }
  //   this.zeroColumns = [];

  //   this.selectedPriceColumns.forEach((column: any) => {
  //     const config = this.priceValidationMap[column];

  //     if (!config) return;

  //     const hasZero = payload.worksheet_item_price.some(
  //       (item: any) => item[config.field] <= 0,
  //     );

  //     if (hasZero) {
  //       this.zeroColumns.push(config.message);
  //     }
  //   });
  //   if (this.zeroColumns.length > 0) {
  //     notify({
  //       message: 'selected column value must be update',
  //       type: 'error',
  //       displayTime: 2000,
  //       position: {
  //         my: 'center top',
  //         at: 'center top',
  //         of: window,
  //       },
  //     });
  //     this.isSaving = false;
  //     return;
  //   }

  //   this.dataservice.saveWorksheetPrice(payload).subscribe(
  //     (response) => {
  //       this.isSaving = false;
  //       this.worksheetID = response.data.ID;
  //       this.savedWorksheet = {
  //         ID: this.selectedRowId,
  //         COMPANY_ID: companyId,
  //         USER_ID: userId,
  //         WS_DATE: new Date(),
  //         WS_NO: 'WS-001',
  //         flag: 1,
  //         message: 'Success',
  //         worksheet_item_price: worksheetItemPrice,
  //       };
  //       if (response) {
  //         notify(
  //           {
  //             message: 'Worksheet Added Successfully',
  //             position: { at: 'top center', my: 'top center' },
  //           },
  //           'success',
  //         );
  //         this.isSaved = true;
  //         this.afterSave.emit();
  //         this.Cancel();
  //         if (!this.AllowCommitWithSave) {
  //           this.router.navigate(['/change-price']);
  //         }
  //       } else {
  //         notify(
  //           {
  //             message: 'Your Data Not Saved',
  //             position: { at: 'top right', my: 'top right' },
  //           },
  //           'error',
  //         );
  //       }
  //     },
  //     (error) => {
  //       this.isSaving = false;
  //       console.error('Error saving data:', error);
  //     },
  //   );
  // }

  onEditorPreparing(e: any) {
    // Skip selection checkbox column
    if (e.command === 'select') return;

    if (e.parentType === 'dataRow') {
      const isSelected = this.selectedRowKeys.includes(e.row.key);

      if (!isSelected) {
        e.editorOptions.disabled = true;
      }
    }
  }

  onVerify() {
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
    const verificationPayload = {
      ID: this.worksheetID,
      COMPANY_ID: companyId,
      USER_ID: userId,
      STORE_ID: this.storeIds || defaultStoreId,
      NARRATION: narration,
      worksheet_item_price: worksheetItemPrice,
    };
    this.verifyItemStorePrices(verificationPayload);
  }

  verifyItemStorePrices(payload) {
    if (this.AllowCommitWithSave) {
      this.dataservice
        .verifyItemStorePrices(payload)
        .subscribe((verifyResponse) => {
          if (verifyResponse) {
            notify(
              {
                message: 'Worksheet Verified Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success',
            );
            this.isVerified = true;
          } else {
            notify(
              {
                message: 'Your Data Not Saved',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );
          }
        });
    }
  }

  onSelectionChanged(event: any) {
    this.selectedRowCount = event.selectedRowKeys.length;
    this.selectedRowKeys = event.selectedRowKeys;
    this.isButtonDisabled = this.selectedRowCount === 0;
    const selectedItems = event.selectedRowsData;
    if (selectedItems.length > 0) {
      const selectedRow = selectedItems[0];
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
      }
      this.newValues = {
        PRICE_NEW: selectedRow.PRICE_NEW,
        PRICE_LEVEL1_NEW: selectedRow.PRICE_LEVEL1_NEW,
        PRICE_LEVEL2_NEW: selectedRow.PRICE_LEVEL2_NEW,
        PRICE_LEVEL3_NEW: selectedRow.PRICE_LEVEL3_NEW,
        PRICE_LEVEL4_NEW: selectedRow.PRICE_LEVEL4_NEW,
        PRICE_LEVEL5_NEW: selectedRow.PRICE_LEVEL5_NEW,
      };
      this.salepriceoldValue = this.oldValues[this.selectedRowId]['SALE_PRICE'];
      this.saleprice1oldValue =
        this.oldValues[this.selectedRowId]['SALE_PRICE1'];
      this.saleprice2oldValue =
        this.oldValues[this.selectedRowId]['SALE_PRICE2'];
      this.saleprice3oldValue =
        this.oldValues[this.selectedRowId]['SALE_PRICE3'];
      this.saleprice4oldValue =
        this.oldValues[this.selectedRowId]['SALE_PRICE4'];
      this.saleprice5oldValue =
        this.oldValues[this.selectedRowId]['SALE_PRICE5'];
    } else {
      this.selectedRowId = null;
      this.selectedItemId = null;
    }
  }

  onApprove() {
    if (!this.savedWorksheet) {
      console.error('No saved worksheet to verify. Please save first.');
      return; // Prevent verifying if nothing is saved
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
    const verificationPayload = {
      ID: this.worksheetID,
      COMPANY_ID: companyId,
      USER_ID: userId,
      STORE_ID: this.storeIds || defaultStoreId,
      NARRATION: narration,
      worksheet_item_price: worksheetItemPrice,
    };
    this.approveItemStoreProperties(verificationPayload);
  }

  approveItemStoreProperties(payload) {
    if (this.AllowCommitWithSave) {
      this.dataservice
        .approveworksheetItemPrices(payload)
        .subscribe((approveResponse) => {
          if (approveResponse) {
            notify(
              {
                message: 'Worksheet Approved Successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success',
            );
            this.isApproved = true;
          } else {
            notify(
              {
                message: 'Your Data Not Saved',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );
          }
          this.router.navigate(['/change-price']);
        });
    }
  }

  // Cancel() {
  //   this.router.navigate(['/change-price']);
  // }
  Cancel() {
    // Reset all editable data
    this.updatedItems = {};
    this.selectedRowKeys = [];
    this.selectedRowCount = 0;
    this.oldValues = {};
    this.newValues = {
      PRICE_NEW: '',
      PRICE_LEVEL1_NEW: '',
      PRICE_LEVEL2_NEW: '',
      PRICE_LEVEL3_NEW: '',
      PRICE_LEVEL4_NEW: '',
      PRICE_LEVEL5_NEW: '',
    };
    this.isSaved = false;
    this.isVerified = false;
    this.isApproved = false;
    this.isPopupVisible = false;
    this.percentageString = '';
    this.selectedSalePrice = [];
    this.roundingOption = 'none';
    this.isIncrease = true;

    // Clear grid selection visually (if applicable)
    if (this.dataGrid && this.dataGrid.instance) {
      this.dataGrid.instance.clearSelection();
      this.dataGrid.instance.refresh();
    }

    // Reload default store list data (optional)
    const defaultStoreId = this.selectedStoreId;
    this.listItemsByMultipleStoreIds(defaultStoreId);
    this.narrationText = '';

    // Navigate back
    this.router.navigate(['/change-price']);
  }

  applyFormula(event) {
    if (this.selectedRowKeys.length > 0) {
      this.isPopupVisible = true;
      const selectedRowsData = [];
      this.selectedRowKeys.forEach((selectedRowId) => {
        const selectedRow = this.itemStoresList.find(
          (row) => row.ID === selectedRowId,
        );
        if (selectedRow) {
          selectedRowsData.push(selectedRow);
          this.selectedRowId = selectedRow.ID;
          this.selectedItemId = selectedRow.ITEM_ID;

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
          } else {
          }
        } else {
          console.error(
            `Selected row with ID ${selectedRowId} not found in the data source.`,
          );
        }
      });
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
      const selectedRow = this.itemStoresList.find((row) => row.ID === rowId); // Find the row in your data source

      if (selectedRow) {
        // Iterate through each selected sale price option
        this.selectedSalePrice.forEach((selectedOption) => {
          const originalPrice = this.oldValues[rowId][selectedOption]; // Use the stored SALE_PRICE value
          let newPrice;

          if (this.isIncrease) {
            newPrice = originalPrice + originalPrice * (percentageValue / 100); // Increase
          } else {
            newPrice = originalPrice - originalPrice * (percentageValue / 100); // Decrease
          }
          newPrice = this.roundValue(newPrice); // Apply rounding
        });
      } else {
        console.error(`Row ID ${rowId} not found in the data source.`);
      }
    });
  }

  handleSalePriceChange(event) {
    const selectedOptions = event.value; // This will now be an array of selected options
    if (this.selectedRowKeys.length > 0) {
      this.selectedRowKeys.forEach((selectedRowId) => {
        const selectedRow = this.itemStoresList.find(
          (row) => row.ID === selectedRowId,
        );
        if (selectedRow) {
          // Loop through each selected option
          selectedOptions.forEach((option) => {
            const salePriceValue = selectedRow[option]; // Accessing the property dynamically
          });
        } else {
          console.error(
            `Selected row with ID ${selectedRowId} not found in the data source.`,
          );
        }
      });
    } else {
      console.warn('No rows selected.');
    }
  }

  applyRounding() {
    if (this.selectedRowKeys.length > 0) {
      this.selectedRowKeys.forEach((selectedRowId) => {
        const selectedRow = this.itemStoresList.find(
          (row) => row.ID === selectedRowId,
        );

        if (selectedRow) {
          const selectedOption = this.selectedSalePrice;
          let salePrice = selectedRow[selectedOption]; // Get the sale price based on the selected option

          // Use the stored original value for rounding
          let originalPrice = this.oldValues[selectedRowId][selectedOption];
          let processedPrice = this.isIncrease
            ? originalPrice * (1 + this.percentageString / 100)
            : originalPrice * (1 - this.percentageString / 100);

          // Apply rounding only to the processed price, not to the original sale price
          this.newPrice = this.roundValue(processedPrice);
          // selectedRow[selectedOption] = this.newPrice; // Only update the new price field
        } else {
          console.error(`Selected row with ID ${selectedRowId} not found.`);
        }
      });
    } else {
      console.warn('No rows selected.');
    }
  }

  applyPriceChange() {
    if (this.selectedRowKeys.length > 0) {
      this.selectedRowKeys.forEach((rowId) => {
        const selectedRow = this.itemStoresList.find((row) => row.ID === rowId);
        if (selectedRow) {
          // Iterate through all selected sale price options
          this.selectedSalePrice.forEach((selectedOption) => {
            const originalSalePrice = this.oldValues[rowId][selectedOption]; // Use the original SALE_PRICE

            // Calculate the processed price based on increase or decrease
            const processedPrice = this.isIncrease
              ? originalSalePrice * (1 + this.percentageString / 100)
              : originalSalePrice * (1 - this.percentageString / 100);

            const finalPrice = this.roundValue(processedPrice); // Apply rounding only to new price

            // Update the corresponding PRICE_NEW or PRICE_LEVELX_NEW based on the selected option
            switch (selectedOption) {
              case 'SALE_PRICE':
                selectedRow.PRICE_NEW = finalPrice; // Update PRICE_NEW
                break;
              case 'SALE_PRICE1':
                selectedRow.PRICE_LEVEL1_NEW = finalPrice; // Update PRICE_LEVEL1_NEW
                break;
              case 'SALE_PRICE2':
                selectedRow.PRICE_LEVEL2_NEW = finalPrice; // Update PRICE_LEVEL2_NEW
                break;
              case 'SALE_PRICE3':
                selectedRow.PRICE_LEVEL3_NEW = finalPrice; // Update PRICE_LEVEL3_NEW
                break;
              case 'SALE_PRICE4':
                selectedRow.PRICE_LEVEL4_NEW = finalPrice; // Update PRICE_LEVEL4_NEW
                break;
              case 'SALE_PRICE5':
                selectedRow.PRICE_LEVEL5_NEW = finalPrice; // Update PRICE_LEVEL5_NEW
                break;
            }

            this.onRowUpdated({ data: selectedRow });
          });
        } else {
          console.error('Selected row not found in the data source.');
        }
      });
      this.isPopupVisible = false; // Close the popup after applying changes
    } else {
      console.warn('No rows selected.');
    }
  }

  handleRoundingChange(event) {
    this.roundingOption = event.value;
    this.applyRounding(); // Recalculate when rounding option changes
  }

  onPriceAdjustmentChanged(event: any) {
    this.isIncrease = event.value; // Update the value based on the switch state
  }

  adjustPercentage(amount: number) {
    this.percentage += amount;
    if (this.percentage < 0) this.percentage = 0; // Prevent negative values if not allowed
  }

  toggleAdjustment() {
    this.isIncrease = !this.isIncrease; // Toggle the value
    this.handlePercentageChange({ value: this.percentageString });
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
        return value; // No rounding
    }
  }

  onSaveButtonClick() {
    if (this.isSaving) return;
    this.Save();
    // this.isSaved = true;
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
    DxNumberBoxModule,
  ],
  providers: [],
  exports: [],
  declarations: [ItemStorePricesComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemStorePricesModule { }
