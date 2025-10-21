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

@Component({
  selector: 'app-stores-list',
  templateUrl: './stores-list.component.html',
  styleUrls: ['./stores-list.component.scss'],
})
export class StoresListComponent implements OnInit {
  @ViewChild(StoresFormComponent) storesComponent: StoresFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  stores: any;
  country: any;
  group: any;
  state: any;
  isAddStoresPopupOpened = false;
  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    // icon: 'add',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    // onClick: () => this.addCreditNote(),
    onClick: () => {
      this.zone.run(() => {
        this.addStores();
      });
    },
    elementAttr: { class: 'add-button' },
  };
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
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

  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private zone: NgZone,
    private router: Router
  ) {}
  onExporting(event: any) {
    this.exportService.onExporting(event, 'Stores-list');
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
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

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.TRANS_STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color = status === 5 ? '#5cac6fff' : '#d87f7fff';
    icon.title = status === 5 ? 'Approved' : 'Open';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  getStatusFilterData = [
    {
      text: 'Approved',
      value: 'Approved',
    },
    {
      text: 'Open',
      value: 'Open',
    },
  ];

  addStores() {
    this.selectedStore = null;
    this.isAddStoresPopupOpened = true;
  }

  handleFormSubmit(storeData: any) {
    if (this.selectedStore) {
      // 🔹 Update existing store
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
          storeData.STORE_NO
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
            3000
          );
        });
    } else {
      // 🔹 Duplicate check before inserting
      const duplicate = this.stores.some(
        (store: any) =>
          store.CODE.toLowerCase().trim() ===
            storeData.CODE.toLowerCase().trim() ||
          store.STORE_NAME.toLowerCase().trim() ===
            storeData.STORE_NAME.toLowerCase().trim()
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
          3000
        );
        return; // stop saving
      }

      // 🔹 Add new store
      this.dataservice
        .postStoresData(
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
          storeData.STORE_NO
        )
        .subscribe((res) => {
          this.isAddStoresPopupOpened = false;
          this.showStores();
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
            3000
          );
        });
    }
  }

  // stores-form.component.ts

  getCountryDropDown() {
    const dropdowncountry = 'COUNTRY';
    this.dataservice.getDropdownData(dropdowncountry).subscribe((data: any) => {
      this.country = data;
      console.log('dropdown country', this.country);
    });
  }
  getGroupDropDown() {
    const dropdowngroup = 'STOREGROUP';
    this.dataservice.getDropdownData(dropdowngroup).subscribe((data: any) => {
      this.group = data;
      console.log('dropdown group', this.country);
    });
  }
  getStateDropDown() {
    const dropdownstate = 'STATE';
    this.dataservice.getDropdownData(dropdownstate).subscribe((data: any) => {
      this.state = data;
      console.log('dropdown group', this.state);
    });
  }

  showStores() {
    this.dataservice.getStoresData().subscribe((response) => {
      this.stores = response;
      console.log(response, '++');
    });
  }
  onClickSaveStores() {
    const {
      COMPANY_ID,
      CODE,
      STORE_NAME,
      IS_PRODUCTION,
      ADDRESS1,
      ADDRESS2,
      ADDRESS3,
      ZIP_CODE,
      STATE_ID,
      CITY,
      COUNTRY_ID,
      IS_DEFAULT_STORE,
      PHONE,
      EMAIL,
      VAT_REGNO,
      GROUP_ID,
      STORE_NO,
    } = this.storesComponent.getNewStoresData();
    console.log(
      'inserted data',
      COMPANY_ID,
      CODE,
      STORE_NAME,
      IS_PRODUCTION,
      ADDRESS1,
      ADDRESS2,
      ADDRESS3,
      ZIP_CODE,
      STATE_ID,
      CITY,
      COUNTRY_ID,
      IS_DEFAULT_STORE,
      PHONE,
      EMAIL,
      VAT_REGNO,
      GROUP_ID,
      STORE_NO
    );
    // --- Duplicate check ---
    const duplicate = this.stores.some(
      (store: any) =>
        store.CODE.toLowerCase() === CODE.toLowerCase().trim() ||
        store.STORE_NAME.toLowerCase() === STORE_NAME.toLowerCase().trim()
    );

    if (duplicate) {
      notify(
        {
          message:
            'Duplicate Store: Store with same CODE or NAME already exists.',
          type: 'error',
          displayTime: 3000, // 3 seconds
          position: { at: 'top center', my: 'top center' },
        },
        'error',
        3000
      );
      return; // stop saving
    }

    this.dataservice
      .postStoresData(
        COMPANY_ID,
        CODE,
        STORE_NAME,
        IS_PRODUCTION,
        ADDRESS1,
        ADDRESS2,
        ADDRESS3,
        ZIP_CODE,
        STATE_ID,
        CITY,
        COUNTRY_ID,
        IS_DEFAULT_STORE,
        PHONE,
        EMAIL,
        VAT_REGNO,
        GROUP_ID,
        STORE_NO
      )
      .subscribe((response) => {
        if (response) {
          this.isAddStoresPopupOpened = false;
          this.showStores();
        }
      });
  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const {
      ID,
      COMPANY_ID,
      CODE,
      STORE_NAME,
      IS_PRODUCTION,
      ADDRESS1,
      ADDRESS2,
      ADDRESS3,
      ZIP_CODE,
      STATE_ID,
      CITY,
      COUNTRY_ID,
      IS_DEFAULT_STORE,
      PHONE,
      EMAIL,
      VAT_REGNO,
      GROUP_ID,
    } = selectedRow;

    this.dataservice
      .removeStores(
        ID,
        COMPANY_ID,
        CODE,
        STORE_NAME,
        IS_PRODUCTION,
        ADDRESS1,
        ADDRESS2,
        ADDRESS3,
        ZIP_CODE,
        STATE_ID,
        CITY,
        COUNTRY_ID,
        IS_DEFAULT_STORE,
        PHONE,
        EMAIL,
        VAT_REGNO,
        GROUP_ID
      )
      .subscribe(() => {
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
          this.showStores();
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

  onEditStore(event: any) {
    event.cancel = true; // prevent default DevExtreme editing
    this.selectedStore = event.data; // send row data to the form
    this.isAddStoresPopupOpened = true; // open the same popup
  }

  // onRowUpdating(event) {
  //   event.cancel = true;
  //   const updataDate = event.newData;
  //   const oldData = event.oldData;
  //   const combinedData = { ...oldData, ...updataDate };
  //   let id = combinedData.ID;
  //   let company_id = combinedData.COMPANY_ID;
  //   let code = combinedData.CODE;
  //   let store_name = combinedData.STORE_NAME;
  //   let is_production = combinedData.IS_PRODUCTION;
  //   let address1 = combinedData.ADDRESS1;
  //   let address2 = combinedData.ADDRESS2;
  //   let address3 = combinedData.ADDRESS3;
  //   let zip_code = combinedData.ZIP_CODE;
  //   let state_id = combinedData.STATE_ID;
  //   let city = combinedData.CITY;
  //   let country_id = combinedData.COUNTRY_ID;
  //   let is_default = combinedData.IS_DEFAULT_STORE;
  //   let phone = combinedData.PHONE;
  //   let email = combinedData.EMAIL;
  //   let vat_regno = combinedData.VAT_REGNO;
  //   let group_id = combinedData.GROUP_ID;

  //   this.dataservice
  //     .updateStores(
  //       id,
  //       company_id,
  //       code,
  //       store_name,
  //       is_production,
  //       address1,
  //       address2,
  //       address3,
  //       zip_code,
  //       state_id,
  //       city,
  //       country_id,
  //       is_default,
  //       phone,
  //       email,
  //       vat_regno,
  //       group_id
  //     )
  //     .subscribe((data: any) => {
  //       if (data) {
  //         notify(
  //           {
  //             message: 'Stores updated Successfully',
  //             position: { at: 'top center', my: 'top center' },
  //           },
  //           'success'
  //         );
  //         this.dataGrid.instance.refresh();
  //         this.showStores();
  //       } else {
  //         notify(
  //           {
  //             message: 'Your Data Not Saved',
  //             position: { at: 'top right', my: 'top right' },
  //           },
  //           'error'
  //         );
  //       }
  //     });
  //   console.log('old data:', oldData);
  //   console.log('new data:', updataDate);
  //   console.log('modified data:', combinedData);

  //   // Prevent the default update operation
  // }
  ngOnInit(): void {
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData:', menuResponse);
    // this.sessionData_tax()
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === currentUrl);
    console.log(packingRights, 'PACKINGRIGHTSSSSSSSSSSSSSSSSSSSSSSS');
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      console.log('packingRights.CanAdd:', packingRights.CanAdd);
      console.log('this.canAdd after assign:', this.canAdd);
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.CanView;
      this.canApprove = packingRights.CanApprove;
    }

    this.showStores();
    this.getCountryDropDown();
    this.getGroupDropDown();
    // this.getStateDropDown();
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
