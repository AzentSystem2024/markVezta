import { Component, OnInit, NgModule, ViewChild, NgZone } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import {
  StoresFormModule,
  StoresFormComponent,
} from 'src/app/components/library/stores-form/stores-form.component';
import notify from 'devextreme/ui/notify';
import { ExportService } from 'src/app/services/export.service';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-stores-list',
  templateUrl: './stores-list.component.html',
  styleUrls: ['./stores-list.component.scss'],
})
export class StoresListComponent implements OnInit {
  @ViewChild(StoresFormComponent) storesComponent:
    | StoresFormComponent
    | undefined;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent | undefined;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: boolean = true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  StoresDataSource: DataSource;
  storesArray: any[] = [];
  storesCount = 0;
  country: any;
  group: any;
  state: any;
  isAddStoresPopupOpened = false;
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addStores());
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

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  selectedStore: any = null;
  selected_Company_id: any;

  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private ngZone: NgZone,
    private router: Router,
  ) {}

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
      this.showStores();
    }
  }

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
      (item: any) => item.name === 'toggleFilterButton',
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

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.IS_ACTIVE;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag';
    icon.style.fontSize = '18px';
    icon.style.color = status === true ? '#10B981' : '#FFA500';
    icon.title = status === true ? 'Active' : 'Inactive';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  getStatusFilterData = [
    {
      text: 'Active',
      value: 'true',
    },
    {
      text: 'Inactive',
      value: 'false',
    },
  ];

  addStores() {
    this.selectedStore = null;
    this.isAddStoresPopupOpened = true;
  }

  handleFormSubmit(storeData: any) {
    if (this.selectedStore) {
      // Update existing store
      this.dataservice
        .updateStores(
          this.selectedStore.ID, // ID of the store to update
          storeData.COMPANY_ID,
          storeData.CODE,
          storeData.STORE_NAME,
          storeData.IS_PRODUCTION,
          storeData.ADDRESS1,
          storeData.ADDRESS2,
          storeData.ADDRESS3,
          storeData.ZIP_CODE,
          storeData.STATE_ID,
          storeData.CITY,
          storeData.COUNTRY_ID,
          storeData.IS_DEFAULT_STORE,
          storeData.PHONE,
          storeData.EMAIL,
          storeData.VAT_REGNO,
          storeData.GROUP_ID,
          storeData.STORE_NO,
          storeData.IS_ACTIVE,
          storeData.DEPT_IDS,
        )
        .subscribe((res) => {
          this.isAddStoresPopupOpened = false;
          this.showStores();

          notify(
            {
              message: 'Store updated successfully!',
              type: 'success',
              displayTime: 3000,
              position: { at: 'top center', my: 'top center' },
            },
            'success',
            3000,
          );
        });
    } else {
      // Duplicate check before inserting
      const duplicate = this.storesArray.some(
        (store: any) =>
          store.CODE.toLowerCase().trim() ===
            storeData.CODE.toLowerCase().trim() ||
          store.STORE_NAME.toLowerCase().trim() ===
            storeData.STORE_NAME.toLowerCase().trim(),
      );

      if (duplicate) {
        notify(
          {
            message:
              'Duplicate Store: Store with same CODE or NAME already exists.',
            type: 'error',
            displayTime: 3000,
            position: { at: 'top center', my: 'top center' },
          },
          'error',
          3000,
        );
        return; // stop saving
      }

      const payload = {
        ...storeData,
        DEPT_IDS: this.storesComponent.selectedDepartments, // add this
      };

      this.dataservice.postStoresData(payload).subscribe((res) => {
        this.isAddStoresPopupOpened = false;

        if (this.storesComponent) {
          this.storesComponent.resetForm();
        }

        notify(
          {
            message: 'Store added successfully!',
            type: 'success',
            displayTime: 3000,
            position: { at: 'top center', my: 'top center' },
          },
          'success',
          3000,
        );

        this.showStores();
      });
    }
  }

  getCountryDropDown() {
    const dropdowncountry = 'COUNTRY';
    this.dataservice.getDropdownData(dropdowncountry).subscribe((data: any) => {
      this.country = data;
    });
  }

  getGroupDropDown() {
    const dropdowngroup = 'STOREGROUP';
    this.dataservice.getDropdownData(dropdowngroup).subscribe((data: any) => {
      this.group = data;
    });
  }

  getStateDropDown() {
    const dropdownstate = 'STATE';
    this.dataservice.getDropdownData(dropdownstate).subscribe((data: any) => {
      this.state = data;
    });
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  showStores() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };

    this.StoresDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.getStoresData(payload).subscribe({
            next: (response: any[]) => {
              const list = response || [];

              this.storesArray = list; // local cache
              this.storesCount = list.length;

              resolve(list); // 🔑 stops dx loader
            },
            error: () => {
              this.storesArray = [];
              this.storesCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  onClickSaveStores() {
    const formData = this.storesComponent.getNewStoresData();

    const payload = {
      ...formData,
      COMPANY_ID: this.selected_Company_id,
      DEPT_IDS: this.storesComponent.selectedDepartments || [],
    };

    // --- Duplicate check ---
    const duplicate = this.storesArray.some(
      (store: any) =>
        store.CODE.toLowerCase() === payload.CODE.toLowerCase().trim() ||
        store.STORE_NAME.toLowerCase() ===
          payload.STORE_NAME.toLowerCase().trim(),
    );

    if (duplicate) {
      notify(
        {
          message:
            'Duplicate Store: Store with same CODE or NAME already exists.',
          type: 'error',
          displayTime: 3000,
          position: { at: 'top center', my: 'top center' },
        },
        'error',
        3000,
      );
      return;
    }

    // ✅ API call with payload
    this.dataservice.postStoresData(payload).subscribe((response) => {
      if (response) {
        this.isAddStoresPopupOpened = false;
        this.showStores();

        if (this.storesComponent) {
          this.storesComponent.resetForm();
        }
      }
    });
  }

  onRowRemoving(event) {
    const selectedRow = event.data;

    event.cancel = new Promise((resolve, reject) => {
      this.dataservice
        .removeStores(
          selectedRow.ID,
          selectedRow.COMPANY_ID,
          selectedRow.CODE,
          selectedRow.STORE_NAME,
          selectedRow.IS_PRODUCTION,
          selectedRow.ADDRESS1,
          selectedRow.ADDRESS2,
          selectedRow.ADDRESS3,
          selectedRow.ZIP_CODE,
          selectedRow.STATE_ID,
          selectedRow.CITY,
          selectedRow.COUNTRY_ID,
          selectedRow.IS_DEFAULT_STORE,
          selectedRow.PHONE,
          selectedRow.EMAIL,
          selectedRow.VAT_REGNO,
          selectedRow.GROUP_ID,
        )
        .subscribe({
          next: () => {
            notify(
              {
                message: 'Delete operation successful',
                position: { at: 'top right', my: 'top right' },
              },
              'success',
            );

            this.showStores(); // reload data

            resolve(true); // ✅ CLOSE popup
          },
          error: () => {
            notify(
              {
                message: 'Delete operation failed',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );

            reject(); // ❌ keep popup / cancel delete
          },
        });
    });
  }

  onEditStore(event: any) {
    event.cancel = true; // prevent default DevExtreme editing
    // this.selectedStore = event.data; // send row data to the form
    this.selectedStore = { ...event.data }; // 🔥 force new reference
    console.log(this.selectedStore, 'SELECTEDSTOREEEEEEEEEEEEE');
    this.isAddStoresPopupOpened = true; // open the same popup
  }

  ngOnInit(): void {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    // this.sessionData_tax()
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.CanView;
      this.canApprove = packingRights.CanApprove;
    }
    this.sesstion_Details();
    this.showStores();
    this.getCountryDropDown();
    this.getGroupDropDown();
    // this.getStateDropDown();
  }

  onExporting(event: any) {
    const fileName = 'stores-list';
    this.dataservice.exportDataGrid(event, fileName);
  }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    StoresFormModule,
  ],
  providers: [],
  exports: [],
  declarations: [StoresListComponent],
})
export class StoresListModule {}
