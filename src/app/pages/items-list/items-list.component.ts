import {
  Component,
  OnInit,
  NgModule,
  ViewChild,
  OnDestroy,
  Output,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  TemplateRef,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import {
  DxButtonModule,
  DxDateBoxModule,
  DxSelectBoxModule,
} from 'devextreme-angular';
import { DxCheckBoxModule, DxFileUploaderComponent } from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
  DxDataGridTypes,
} from 'devextreme-angular/ui/data-grid';
import { DataService, ScreenService } from 'src/app/services';
import { DxTabsModule } from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import {
  ItemsFormComponent,
  ItemsFormModule,
} from 'src/app/components/library/items-form/items-form.component';
import { DxFileUploaderModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { Subscription } from 'rxjs';
import { EventEmitter } from '@angular/core';
import { DxValidatorModule } from 'devextreme-angular';
import { CountryServiceService } from 'src/app/services/country-service.service';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTemplateModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { AfterViewInit } from '@angular/core';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Observable } from 'rxjs';
import {
  ItemsEditFormComponent,
  ItemsEditFormModule,
} from '../items-edit-form/items-edit-form.component';
import { DxPopupModule } from 'devextreme-angular';
import { Router, RouterModule } from '@angular/router';
import { Routes } from '@angular/router';
import { DataSourceOptions } from 'devextreme/data/data_source';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

interface ItemAlias {
  ID: number;
  ALIAS: string;
  IS_DEFAULT: any;
}

@Component({
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.scss'],
})
export class ItemsListComponent implements OnInit, AfterViewInit {
  private dataSubscription: Subscription | undefined;
  columns: DxDataGridTypes.Column[];

  dataSource: DataSourceOptions;

  @ViewChild('editButtonTemplate', { static: true })
  editButtonTemplate: TemplateRef<any>;
  @ViewChild(ItemsFormComponent) itemsComponent: ItemsFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('editForm', { static: false }) editFormComponent: any;

  @Output() editingStart = new EventEmitter<any>();
  newItems: any;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  imageSource: string = ''; // To display the uploaded image
  isDropZoneActive: boolean = false;
  textVisible: boolean = true; // Controls the visibility of text instructions
  progressVisible: boolean = false; // Controls the visibility of progress bar
  progressValue: number = 0;
  allowedFileExtensions: string[] = ['.jpg', '.jpeg', '.gif', '.png'];
  imageUploaded: boolean = false;
  completeFetchedData: any = {};
  uploadUrl: string = '';
  item_alias: any[] = [
    {
      ALIAS: '',
      ALIAS_TYPE_ID: 0,
    },
  ];
  item_stores: any[] = [];
  item_suppliers: any[] = [];
  combinedStores: any[] = [];
  selectedRowKeys: number[] = [];
  selectedRowData: any;
  items: any;
  itemtype: any;
  department: any;
  catagory: any;
  subcatagory: any;
  brand: any;
  itemprop1: any;
  itemprop2: any;
  itemprop3: any;
  itemprop4: any;
  itemprop5: any;
  vat: any;
  uom: any = [];
  Aliasdatasource: any = [];
  Supplierdatasource: any = [];
  store: any[] = [];
  parentitem: any;
  isAddItemsPopupOpened = false;
  supplier: any;
  currencydata: any;
  CURRENCY: any;
  countries: any;
  country: any;
  public costingMethodOptions: any[] = [];
  existingItems: any = {};
  selectedItem: any;
  packing: any[] = [];
  selectedData: any = {};
  selectedItemData: any = {};
  itemsList: any;
  newAliasArray: any[] = [];
  newAlias: any;
  isEditItemsPopupOpened = false;
  edit: any;
  isLoading: boolean = true;
  isFilterRowVisible: boolean = false;
  sessionData: any;
  ITEM_PROPERTY1: any;
  ITEM_PROPERTY2: any;
  ITEM_PROPERTY3: any;
  ITEM_PROPERTY4: any;
  ITEM_PROPERTY5: any;
  ENABLE_Matrix_Code: boolean;
  isParentItemDropdownOpen: boolean;

  //==============date filter===================
  customLabel = 'Custom';
  customStartDate: any = null;
  customEndDate: any = null;
  startDate: Date;
  EndDate: Date;
  showCustomDatePopup = false;
  selectedDateRange: string = 'today';
  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'All', value: 'all' },
    // { label: 'Custom', value: 'custom' },
    { label: this.customLabel, value: 'custom' },
  ];
  constructor(
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
    private countryFlagService: CountryServiceService,
    private router: Router,
    protected screen: ScreenService,
    private ngZone: NgZone
  ) {}
  applyCustomDateFilter() {
    const start = new Date(this.customStartDate); // keep as Date
    const end = new Date(this.customEndDate); // keep as Date

    const payload = {
      DATE_FROM: this.formatDate(start) || this.formatDate(new Date()),
      DATE_TO: this.formatDate(end) || this.formatDate(new Date()),
    };

    // ✅ Use Date objects for filtering
    this.dataservice.getItemsData().subscribe((res: any) => {
      const allData = res.data;
      this.itemsList = allData;

      this.selectedDateRange = 'custom';

      // ✅ Close popup
      this.showCustomDatePopup = false;
    });
  }

  ngOnInit(): void {
    this.showItems();
    this.loadDropdownData();
    this.getStores();
    this.sesstion_Details();
  }

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');

    this.ITEM_PROPERTY1 = this.sessionData.GeneralSettings.ITEM_PROPERTY1;
    console.log(
      this.ITEM_PROPERTY1,
      '============ITEM_PROPERTY1=============='
    );

    this.ITEM_PROPERTY2 = this.sessionData.GeneralSettings.ITEM_PROPERTY2;
    console.log(
      this.ITEM_PROPERTY2,
      '============ITEM_PROPERTY2=============='
    );

    this.ITEM_PROPERTY3 = this.sessionData.GeneralSettings.ITEM_PROPERTY3;
    console.log(
      this.ITEM_PROPERTY3,
      '============ITEM_PROPERTY3=============='
    );

    this.ITEM_PROPERTY4 = this.sessionData.GeneralSettings.ITEM_PROPERTY4;
    console.log(
      this.ITEM_PROPERTY4,
      '============ITEM_PROPERTY4=============='
    );

    this.ITEM_PROPERTY5 = this.sessionData.GeneralSettings.ITEM_PROPERTY5;
    console.log(
      this.ITEM_PROPERTY5,
      '============ITEM_PROPERTY5=============='
    );
    this.ENABLE_Matrix_Code =
      this.sessionData.GeneralSettings.ENABLE_MATRIX_CODE;
    console.log(this.ENABLE_Matrix_Code);
  }

  onDateRangeChanged(e: any) {
    const today = new Date();
    this.selectedDateRange = e.value;
    console.log('selected data=======', this.selectedDateRange);
    if (this.selectedDateRange === 'today') {
      const today = this.formatDate(new Date());
      // today.setHours(0, 0, 0, 0);

      this.startDate = new Date(today);
      this.EndDate = new Date(today);
      console.log(this.startDate, '=======start date=====');
      console.log(this.EndDate, '=======End date=====');
    } else if (this.selectedDateRange === 'all') {
      //  this.showItems();

      const payload = {
        DATE_FROM: '2020-01-01',
        DATE_TO: this.formatDate(new Date()),
      };
      this.dataservice.getItemsData().subscribe((res: any) => {
        console.log(res);
        this.itemsList = res.data;
      });
    } else if (this.selectedDateRange === 'last7') {
      this.startDate = new Date(today);
      this.startDate.setDate(today.getDate() - 6);
      this.EndDate = new Date(today);
      console.log(this.startDate, '=======start date=====');
      console.log(this.EndDate, '=======End date=====');
    } else if (this.selectedDateRange === 'last15') {
      this.startDate = new Date(today);
      this.startDate.setDate(today.getDate() - 14);
      this.EndDate = new Date(today);
      console.log(this.startDate, '=======start date=====');
      console.log(this.EndDate, '=======End date=====');
    } else if (this.selectedDateRange === 'last30') {
      this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      this.EndDate = new Date(today);
      console.log(this.startDate, '=======start date=====');
      console.log(this.EndDate, '=======End date=====');
    } else if (this.selectedDateRange === 'lastMonth') {
      const lastMonth = today.getMonth() - 1;
      this.startDate = new Date(today.getFullYear(), lastMonth, 1);
      this.EndDate = new Date(today.getFullYear(), today.getMonth(), 0);
      console.log(this.startDate, '=======start date=====');
      console.log(this.EndDate, '=======End date=====');
    } else {
      this.showCustomDatePopup = true;
    }

    this.showItems();
  }

  ngAfterViewInit(): void {
    console.log('View initialized. Existing items:', this.existingItems);
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',

    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addItems());
    },

    elementAttr: { class: 'add-button' },
  };

  loadDropdownData(): void {
    this.dataservice.getDropdownData('BRAND').subscribe((data) => {
      this.brand = data;
    });

    this.dataservice.getDropdownData('DEPARTMENT').subscribe((data) => {
      this.department = data;
    });
    this.dataservice.getSubCategoryData().subscribe((data) => {
      this.subcatagory = data;
    });

    this.dataservice.getDropdownData('ITEMCATEGORY').subscribe((data) => {
      this.catagory = data;
    });
  }
  addItems() {
    this.isAddItemsPopupOpened = true;
  }
  // openEditPopup(data: any): void {
  //   this.dataservice.selectItems(data.ID).subscribe((response: any) => {
  //     console.log(response, "select!!!");
  //     this.selectedItemData = response;
  //     this.isEditItemsPopupOpened = true; // This triggers the popup
  //   });
  // }
  private formatDate(date: Date): string {
    if (!date) return '';
    // Example: 2025-09-10
    return date.toISOString().split('T')[0];
  }

  showItems() {
    this.isLoading = true;
    this.cdr.detectChanges();
    //  const payload = {
    //   DATE_FROM: this.formatDate(this.startDate)|| this.formatDate(new Date()),
    //   DATE_TO: this.formatDate(this.EndDate)|| this.formatDate(new Date()),

    // };
    // console.log(payload)

    this.dataservice.getItemsData().subscribe(
      (response: any) => {
        // Sort items by 'createdAt' in descending order
        this.itemsList = response.data.reverse();
        // console.log(this.itemsList,"ITEMSLIST")
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching items:', error);
        this.isLoading = false;
      }
    );
  }

  //  : '',
  //     : '',
  //     : "",

  onClickSaveItems() {
    console.log('button click');
    const items = this.itemsComponent.getNewItems();
    console.log(items, 'ITEMSSSSS! !!!'); // Filter out empty ALIAS entries and set ALIAS_TYPE_ID: 1 for non-empty objects
    if (items.ITEM_ALIAS && items.ITEM_ALIAS.length > 0) {
      // First filter out objects with empty ALIAS
      items.ITEM_ALIAS = items.ITEM_ALIAS.filter(
        (item) => item.ALIAS && item.ALIAS.trim() !== ''
      );

      // Then set ALIAS_TYPE_ID: 1 for remaining objects
      items.ITEM_ALIAS.forEach((item) => {
        item.ALIAS_TYPE_ID = 1;
      });
    } else {
      // If no ITEM_ALIAS or empty array, set to empty array
      items.ITEM_ALIAS = [];
    }

    if (items.UOM_PURCH === 1) {
      items.UOM_PURCH = '';
    }

    // Check first supplier
    if (!items.ITEM_SUPPLIERS || !items.ITEM_SUPPLIERS.length) {
      notify(
        {
          message: 'Please select a Supplier',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
        4000
      );
      return; // 🔥 stop execution
    }

    if (items.COSTING_METHOD == 0 || '') {
      notify(
        {
          message: 'Please select a Costing Methos is Null ',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
        4000
      );
      return; // 🔥 stop execution
    }
    console.log(
      items,
      '================================================================================================'
    );

    this.dataservice.postItems(items).subscribe((response: any) => {
      if (response?.flag === '0') {
        // when flag is "0"
        console.error('Save failed:', response.message);

        // show error notification
        notify(
          {
            message: response.message || 'Operation failed',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
          4000
        );
      } else {
        // success case
        notify(
          {
            message: 'Data inserted successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
          4000
        );
        this.dataGrid.instance.refresh();
        this.showItems();
        this.isAddItemsPopupOpened = false;
      }
    });
  }

  getStores(): void {
    this.dataservice.getDropdownData('STORE').subscribe(
      (data: any) => {
        this.store = data || []; // Assuming response contains array of stores
        // console.log('All stores:', this.store);
      },
      (error) => {
        console.error('Failed to fetch all stores:', error);
      }
    );
  }

  // fetchSelectedItem(id: number,): void {
  //   this.dataservice.selectItems(id).subscribe(
  //     (response: any) => {
  //       console.log(response,"ITEM")
  //       this.item_alias = response.item_alias || [];
  //       this.item_stores = response.item_stores || [];
  //       this.item_suppliers = response.item_suppliers || [];

  //       this.item_stores = Array.isArray(response.item_stores)
  //         ? response.item_stores
  //         : [];
  //         // console.log(this.item_stores,"ITEMSTORESSSS")
  //       // Update ITEM_STORES to include all selected stores
  //       this.item_stores = [...this.item_stores]; // Assuming this is where you update ITEM_STORES
  //       this.completeFetchedData = {
  //         ...response,
  //         item_alias: this.item_alias,
  //         item_stores: this.item_stores,
  //         item_suppliers: this.item_suppliers
  //       };
  //       this.existingItems = this.completeFetchedData
  //       this.updateCombinedStores();
  //       this.updateSelectedRowKeys();

  //       if (this.dataGrid) {
  //         this.dataGrid.instance.refresh();
  //       }
  //     },
  //     (error) => {
  //       console.error('Failed to fetch selected item:', error);
  //     }
  //   );
  // }

  updateCombinedStores() {
    // console.log('Selected item stores:', this.item_stores);

    // Ensure this.store has the full list of stores
    if (!this.store || !Array.isArray(this.store)) {
      console.error('Full list of stores is missing or invalid.');
      return;
    }

    // Map over the full store list and update selected ones
    this.combinedStores = this.store.map((store) => {
      const selectedStore = this.item_stores.find(
        (s) => s.STORE_ID === store.ID.toString()
      );
      const isSelected = !!selectedStore; // Check if store is selected

      return {
        ...store,
        ...(isSelected ? selectedStore : []), // Spread selectedStore if it exists
        selected: isSelected,
      };
    });

    // console.log('Updated combined stores:', this.combinedStores);
  }

  updateSelectedRowKeys() {
    // Update selectedRowKeys based on combinedStores
    this.selectedRowKeys = this.combinedStores
      .filter((store) => store.selected)
      .map((store) => store.ID);
  }
  onSelectionChanged(event: any) {
    this.selectedRowKeys = event.selectedRowKeys;
    console.log(this.selectedRowKeys, 'Updated SelectedRowKeys on Change');
  }

  // onEditPageOpened(data: any): void {
  //   this.item_alias = [];
  //   this.getSelectedItemsData(data.ID);
  //   this.refreshItems();
  // }
  // getSelectedItemsData(data: any): void {
  //   this.dataservice.selectItems(data.ID).subscribe((response: any) => {
  //     // console.log(response, "select!!!")
  //     this.selectedItemData = response;
  //     // console.log(this.selectedItemData.IMAGE_NAME, "IMAGE_NAME in Parent Component");
  //     // this.item_stores = Array.isArray(response.item_stores)
  //     // ? response.item_stores
  //     // : [];
  //     // console.log(this.item_stores,"..................")
  //     // Navigate to the edit form and pass data as a route state
  //     // this.router.navigate(['/item-edit'], { state: { data: this.selectedItemData } });
  //   });
  // }

  onRowRemoving(event: any) {
    const selectedRow = event.data;
    const id = event.data.ID;
    delete selectedRow.ID;
    // Remove null values from selectedRow
    Object.keys(selectedRow).forEach((key) => {
      if (selectedRow[key] === null) {
        delete selectedRow[key];
      }
    });
    // console.log('selected row', selectedRow);
    this.dataservice.removeItems(id, selectedRow).subscribe(() => {
      try {
        // Your delete logic here
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        );
        this.dataGrid.instance.refresh();
        this.showItems();
      } catch (error) {
        notify(
          {
            message: 'Delete operation failed',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    });
  }

  onRowRemovedAlias(event: any): void {
    // console.log("Row Removed Alias", event);
    const removedAlias = event.data;
    if (this.item_alias) {
      this.item_alias = this.item_alias.filter(
        (alias) => alias.ALIAS !== removedAlias.ALIAS
      );
    }
    // console.log("Updated item_alias after removal", this.item_alias);
  }

  onRowInsertedAlias(event: any): void {
    // console.log("Row Inserted Alias Event Data:", event.data);
    const newAlias = event.data;

    // Initialize item_alias if it's not already initialized
    if (!this.selectedItemData.item_alias) {
      this.selectedItemData.item_alias = [];
    }

    // Check if the alias already exists based on the ALIAS field
    const exists = this.selectedItemData.item_alias.some(
      (alias) => alias.ALIAS === newAlias.ALIAS
    );

    if (!exists) {
      console.log('Alias does not exist, adding new alias:', newAlias);
      this.selectedItemData.item_alias.push(newAlias);
      this.newAliasArray = [...this.selectedItemData.item_alias];
    } else {
      console.log('Alias already exists, not adding:', newAlias);
    }

    // console.log("Updated item_alias:", this.selectedItemData.item_alias);
    // console.log("New Alias Array:", this.newAliasArray);
  }

  onRowUpdatedAlias(event: any): void {
    // console.log("Row Updated Alias", event);
    const updatedAlias = event.data;

    // Update the existing alias in item_alias array
    this.item_alias = this.item_alias.map((alias) =>
      alias.ALIAS === updatedAlias.ALIAS ? updatedAlias : alias
    );

    // console.log("Updated item_alias", this.item_alias);
  }

  openEditingStart(event: any) {
    event.cancel = true;
    // this.editingStart.emit(event);
    console.log('Editing started for item:', event.data);
    const itemId = event.data.ID;
    // Open the popup

    // Fetch the item data
    this.dataservice.selectItems(itemId).subscribe((response: any) => {
      console.log('RAW deep clone ===>', JSON.parse(JSON.stringify(response)));
      this.selectedItemData = JSON.parse(JSON.stringify(response));
      console.log(
        this.selectedItemData,
        '========================selected items======================'
      );
      //       const clonedResponse = JSON.parse(JSON.stringify(response));
      // console.log("RAW deep clone ===>", clonedResponse);

      // this.selectedItemData = clonedResponse;
      //    console.log(this.selectedItemData,'========================selected items4======================')

      console.log('Flags individually ===>', {
        IS_NOT_SALE_ITEM: response.IS_NOT_SALE_ITEM,
        IS_NOT_SALE_RETURN: response.IS_NOT_SALE_RETURN,
        IS_PRICE_REQUIRED: response.IS_PRICE_REQUIRED,
        IS_NOT_DISCOUNTABLE: response.IS_NOT_DISCOUNTABLE,
      });
      // this.selectedItemData = response;
      // Ensure the popup updates after setting data
      // this.editPopupenable(response);
      // console.log(this.selectedItemData,'========================selected items======================')
    });
    this.isEditItemsPopupOpened = true;
  }
  // editPopupenable(item: any) {
  //   this.selectedItemData = item;
  //   // console.log('Selected Item Data:', this.selectedItemData);
  //   this.isEditItemsPopupOpened = true;
  // }

  onValueChanged(event) {}

  handleFormClosed() {
    this.isEditItemsPopupOpened = false;
    this.refreshItems();
    this.showItems();
  }

  refreshItems() {
    // Implement this method to refresh the items from the server
    // this.dataservice.getItemsData().subscribe(
    //   (data) => {
    //     this.itemsList = data.data;// Assuming 'items' is the data source for your grid
    //     console.log(data, 'after refresh');
    //   },
    //   (error) => {
    //     console.error('Failed to refresh items:', error);
    //   }
    // );
  }
  onRefreshButtonClick() {
    this.refreshItems();
    this.showItems();
  }
}
@NgModule({
  imports: [
    BrowserModule,
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    ItemsFormModule,
    DxTabsModule,
    DxFileUploaderModule,
    DxCheckBoxModule,
    DxValidatorModule,
    DxTextBoxModule,
    DxTemplateModule,
    CommonModule,
    DxPopupModule,
    ItemsEditFormModule,
    DxSelectBoxModule,
    DxDateBoxModule,
  ],
  providers: [],
  exports: [],
  declarations: [ItemsListComponent],
  bootstrap: [ItemsListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemsListModule {}
platformBrowserDynamic().bootstrapModule(ItemsListModule);
