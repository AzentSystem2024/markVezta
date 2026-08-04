import {
  Component,
  OnInit,
  NgModule,
  ViewChild,
  Output,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  TemplateRef,
  ChangeDetectorRef,
  NgZone,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Router } from '@angular/router';

import {
  DxButtonModule,
  DxDateBoxModule,
  DxSelectBoxModule,
  DxCheckBoxModule,
  DxFileUploaderModule,
  DxTabsModule,
  DxValidatorModule,
  DxTemplateModule,
  DxPopupModule,
} from 'devextreme-angular';

import {
  DxDataGridComponent,
  DxDataGridModule,
  DxDataGridTypes,
} from 'devextreme-angular/ui/data-grid';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';

import DataSource from 'devextreme/data/data_source';
import { DataSourceOptions } from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';

import { DataService, ScreenService } from 'src/app/services';
import { CountryServiceService } from 'src/app/services/country-service.service';
import { FormPopupModule } from 'src/app/components';
import {
  ItemsFormComponent,
  ItemsFormModule,
} from 'src/app/components/library/items-form/items-form.component';
import {
  ItemsEditFormComponent,
  ItemsEditFormModule,
} from '../../items-edit-form/items-edit-form.component';

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
export class ItemsListComponent implements OnInit {
  // @ViewChild and @Output
  @ViewChild('editButtonTemplate', { static: true })
  editButtonTemplate: TemplateRef<any>;
  @ViewChild(ItemsFormComponent) itemsComponent: ItemsFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('editForm', { static: false }) editFormComponent: any;

  @Output() editingStart = new EventEmitter<any>();

  // Data properties
  columns: DxDataGridTypes.Column[];
  dataSource: DataSourceOptions;
  ItemsDataSource: DataSource;
  itemsArray: any[] = [];
  itemsCount = 0;

  newItems: any;
  item_alias: any[] = [{ ALIAS: '', ALIAS_TYPE_ID: 0 }];
  item_stores: any[] = [];
  item_suppliers: any[] = [];
  combinedStores: any[] = [];
  store: any[] = [];

  selectedRowKeys: number[] = [];
  selectedRowData: any;
  selectedItemData: any = {};
  newAliasArray: any[] = [];

  // Dropdown data
  brand: any;
  department: any;
  catagory: any;
  subcatagory: any;

  // Grid / UI properties
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  isAddItemsPopupOpened = false;
  isEditItemsPopupOpened = false;
  isFilterRowVisible: boolean = false;

  // Session & Access properties
  sessionData: any;
  selected_Company_id: any;
  ITEM_PROPERTY1: any;
  ITEM_PROPERTY2: any;
  ITEM_PROPERTY3: any;
  ITEM_PROPERTY4: any;
  ITEM_PROPERTY5: any;
  ENABLE_Matrix_Code: boolean;

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  // Date filter properties
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
    { label: this.customLabel, value: 'custom' },
  ];

  // Other properties (potentially bound in the template)
  items: any;
  itemtype: any;
  itemprop1: any;
  itemprop2: any;
  itemprop3: any;
  itemprop4: any;
  itemprop5: any;
  vat: any;
  uom: any = [];
  Aliasdatasource: any = [];
  Supplierdatasource: any = [];
  parentitem: any;
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
  newAlias: any;
  edit: any;
  isLoading: boolean = true;
  isParentItemDropdownOpen: boolean;
  auto: string = 'auto';
  imageSource: string = '';
  isDropZoneActive: boolean = false;
  textVisible: boolean = true;
  progressVisible: boolean = false;
  progressValue: number = 0;
  allowedFileExtensions: string[] = ['.jpg', '.jpeg', '.gif', '.png'];
  imageUploaded: boolean = false;
  completeFetchedData: any = {};
  uploadUrl: string = '';

  // Buttons configurations
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => this.ngZone.run(() => this.addItems()),
    elementAttr: { class: 'add-button' },
    template: () => `
      <div class="add-btn-content">
        <span class="iconify" data-icon="formkit:add" data-width="20" data-height="20"></span>
        <span class="add-text">New</span>
      </div>
    `,
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilterRow(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.ngZone.run(() => this.refreshGrid()),
    text: '',
  };
  hideCost: any;

  constructor(
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
    private countryFlagService: CountryServiceService,
    private router: Router,
    protected screen: ScreenService,
    private ngZone: NgZone,
  ) {
    this.showItems();
  }

  ngOnInit(): void {
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const menuGroups = menuResponse.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .flatMap((menu: any) => menu.Children || [])
      .find((child: any) => child.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
      this.hideCost = packingRights.HideCost;
    }

    this.sesstion_Details();
    this.showItems();
    this.loadDropdownData();
    this.getStores();
  }

  sesstion_Details(): void {
    this.sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    if (this.sessionData?.GeneralSettings) {
      this.ITEM_PROPERTY1 = this.sessionData.GeneralSettings.ITEM_PROPERTY1;
      this.ITEM_PROPERTY2 = this.sessionData.GeneralSettings.ITEM_PROPERTY2;
      this.ITEM_PROPERTY3 = this.sessionData.GeneralSettings.ITEM_PROPERTY3;
      this.ITEM_PROPERTY4 = this.sessionData.GeneralSettings.ITEM_PROPERTY4;
      this.ITEM_PROPERTY5 = this.sessionData.GeneralSettings.ITEM_PROPERTY5;
      this.ENABLE_Matrix_Code =
        this.sessionData.GeneralSettings.ENABLE_MATRIX_CODE;
    }
    this.selected_Company_id = this.sessionData?.SELECTED_COMPANY?.COMPANY_ID;
  }

  loadDropdownData(): void {
    this.dataservice.getDropdownData('BRAND').subscribe((data) => {
      this.brand = data;
    });
    this.dataservice.getDropdownData('DEPARTMENT').subscribe((data) => {
      this.department = data;
    });
    const payload = { COMPANY_ID: this.selected_Company_id };
    this.dataservice.getSubCategoryData(payload).subscribe((data) => {
      this.subcatagory = data;
    });
    this.dataservice.getDropdownData('ITEMCATEGORY').subscribe((data) => {
      this.catagory = data;
    });
  }

  getStores(): void {
    this.dataservice.getDropdownData('STORE').subscribe((data: any) => {
      this.store = data || [];
    });
  }

  showItems(): void {
    this.ItemsDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.getItemsData().subscribe({
            next: (response: any) => {
              const data = response?.data || [];
              this.itemsArray = data;
              this.itemsCount = data.length;
              resolve(data);
            },
            error: () => {
              this.itemsArray = [];
              this.itemsCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  refreshGrid(): void {
    const grid = this.dataGrid?.instance;
    if (!grid) return;
    grid.clearFilter();
    grid.refresh();
    this.showItems();
  }

  toggleFilterRow(): void {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  }

  addItems(): void {
    this.isAddItemsPopupOpened = true;
  }

  onClickSaveItems(): void {
    const items = this.itemsComponent.getNewItems();

    if (items.ITEM_ALIAS && items.ITEM_ALIAS.length > 0) {
      items.ITEM_ALIAS = items.ITEM_ALIAS.filter(
        (item: any) => item.ALIAS && item.ALIAS.trim() !== '',
      );
      items.ITEM_ALIAS.forEach((item: any) => {
        item.ALIAS_TYPE_ID = 1;
      });
    } else {
      items.ITEM_ALIAS = [];
    }

    if (items.UOM_PURCH === 1) {
      items.UOM_PURCH = '';
    }

    if (!items.ITEM_STORES || items.ITEM_STORES.length === 0) {
      notify(
        {
          message: 'Please select at least one store',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
        4000,
      );
      return;
    }

    if (items.COSTING_METHOD == 0 || items.COSTING_METHOD === '') {
      notify(
        {
          message: 'Please select a Costing Method is Null',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
        4000,
      );
      return;
    }

    this.dataservice.postItems(items).subscribe((response: any) => {
      if (response?.flag === '0') {
        notify(
          {
            message: response.message || 'Operation failed',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
          4000,
        );
      } else {
        notify(
          {
            message: 'Data inserted successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
          4000,
        );
        this.dataGrid.instance.refresh();
        this.showItems();
        this.isAddItemsPopupOpened = false;
      }
    });
  }

  updateCombinedStores(): void {
    if (!this.store || !Array.isArray(this.store)) return;

    this.combinedStores = this.store.map((store) => {
      const selectedStore = this.item_stores.find(
        (s) => s.STORE_ID === store.ID.toString(),
      );
      const isSelected = !!selectedStore;

      return {
        ...store,
        ...(isSelected ? selectedStore : []),
        selected: isSelected,
      };
    });
  }

  updateSelectedRowKeys(): void {
    this.selectedRowKeys = this.combinedStores
      .filter((store) => store.selected)
      .map((store) => store.ID);
  }

  onSelectionChanged(event: any): void {
    this.selectedRowKeys = event.selectedRowKeys;
  }

  onRowRemoving(event: any): void {
    event.cancel = true;
    const selectedRow = event.data;
    const id = event.data.ID;
    delete selectedRow.ID;

    Object.keys(selectedRow).forEach((key) => {
      if (selectedRow[key] === null) {
        delete selectedRow[key];
      }
    });

    this.dataservice.removeItems(id, selectedRow).subscribe({
      next: () => {
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );
        this.dataGrid.instance.refresh();
        this.showItems();
      },
      error: () => {
        notify(
          {
            message: 'Delete operation failed',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
      },
    });
  }

  onRowRemovedAlias(event: any): void {
    const removedAlias = event.data;
    if (this.item_alias) {
      this.item_alias = this.item_alias.filter(
        (alias) => alias.ALIAS !== removedAlias.ALIAS,
      );
    }
  }

  onRowInsertedAlias(event: any): void {
    const newAlias = event.data;
    if (!this.selectedItemData.item_alias) {
      this.selectedItemData.item_alias = [];
    }

    const exists = this.selectedItemData.item_alias.some(
      (alias: any) => alias.ALIAS === newAlias.ALIAS,
    );
    if (!exists) {
      this.selectedItemData.item_alias.push(newAlias);
      this.newAliasArray = [...this.selectedItemData.item_alias];
    }
  }

  onRowUpdatedAlias(event: any): void {
    const updatedAlias = event.data;
    this.item_alias = this.item_alias.map((alias) =>
      alias.ALIAS === updatedAlias.ALIAS ? updatedAlias : alias,
    );
  }

  openEditingStart(event: any): void {
    event.cancel = true;
    const itemId = event.data.ID;

    this.dataservice.selectItems(itemId).subscribe((response: any) => {
      this.selectedItemData = JSON.parse(JSON.stringify(response));
    });
    this.isEditItemsPopupOpened = true;
  }

  handleFormClosed(): void {
    this.isEditItemsPopupOpened = false;
    this.showItems();
  }

  onExporting(event: any): void {
    const fileName = 'items-list';
    this.dataservice.exportDataGrid(event, fileName);
  }

  onDateRangeChanged(e: any): void {
    const today = new Date();
    this.selectedDateRange = e.value;

    if (this.selectedDateRange === 'today') {
      const todayStr = this.formatDate(new Date());
      this.startDate = new Date(todayStr);
      this.EndDate = new Date(todayStr);
    } else if (this.selectedDateRange === 'all') {
      this.dataservice.getItemsData().subscribe((res: any) => {
        this.itemsArray = res.data;
      });
    } else if (this.selectedDateRange === 'last7') {
      this.startDate = new Date(today);
      this.startDate.setDate(today.getDate() - 6);
      this.EndDate = new Date(today);
    } else if (this.selectedDateRange === 'last15') {
      this.startDate = new Date(today);
      this.startDate.setDate(today.getDate() - 14);
      this.EndDate = new Date(today);
    } else if (this.selectedDateRange === 'last30') {
      this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      this.EndDate = new Date(today);
    } else if (this.selectedDateRange === 'lastMonth') {
      const lastMonth = today.getMonth() - 1;
      this.startDate = new Date(today.getFullYear(), lastMonth, 1);
      this.EndDate = new Date(today.getFullYear(), today.getMonth(), 0);
    } else {
      this.showCustomDatePopup = true;
    }

    if (this.selectedDateRange !== 'custom') {
      this.showItems();
    }
  }

  applyCustomDateFilter(): void {
    this.dataservice.getItemsData().subscribe((res: any) => {
      this.itemsArray = res.data;
      this.selectedDateRange = 'custom';
      this.showCustomDatePopup = false;
    });
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
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
export class ItemsListModule { }
platformBrowserDynamic().bootstrapModule(ItemsListModule);
