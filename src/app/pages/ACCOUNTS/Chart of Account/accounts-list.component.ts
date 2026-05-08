import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
  DxTextBoxModule,
  DxCheckBoxModule,
  DxRadioGroupModule,
  DxFileUploaderModule,
  DxDataGridModule,
  DxButtonModule,
  DxValidatorModule,
  DxProgressBarModule,
  DxPopupModule,
  DxDropDownBoxModule,
  DxToolbarModule,
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import { AddAccountModule } from '../add-account/add-account.component';
import {
  EditAccountModule,
  EditAccountComponent,
} from '../edit-account/edit-account.component';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-accounts-list',
  templateUrl: './accounts-list.component.html',
  styleUrls: ['./accounts-list.component.scss'],
})
export class AccountsListComponent implements OnInit {
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
  addAccountPopupOpened: boolean = false;
  editAccountPopupOpened: boolean = false;
  accountsGroupList: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  filterButtonOptions: any = {
    icon: 'search',
    hint: 'Show Filter Row',
    onClick: () => this.toggleFilterRow(),
    stylingMode: 'text',
    elementAttr: { class: 'commonButtons' },
  };

  auto: string = 'auto';

  selectedAccountHead: any;

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, // global style
    onClick: () => this.toggleFilters(),
  };

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addAccount());
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

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

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

  companyID: any;

  constructor(
    private dataService: DataService,
    private ngZone: NgZone,
    private router: Router,
  ) { }

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/accounts');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.getAccountsGroupList();
  }

  onExporting(event: any) {
    const fileName = 'ChartOfAccounts';
    this.dataService.exportDataGrid(event, fileName);
  }

  getFilterButtonOptions() {
    return {
      icon: 'filter',
      hint: this.isFilterRowVisible ? 'Hide Filter Row' : 'Show Filter Row',
      onClick: () => this.toggleFilterRow(),
      stylingMode: 'text',
      elementAttr: { class: 'commonButtons' },
    };
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.getAccountsGroupList();
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
          icon: 'search',
          hint: 'Search Column',
          onClick: () => this.toggleFilters(),
        },
      });
    }
  }

  toggleFilterRow = () => {
    this.ngZone.run(() => {
      this.isFilterRowVisible = !this.isFilterRowVisible;

      // Update hint/icon without reconstructing the object
      this.filterButtonOptions.hint = this.isFilterRowVisible
        ? 'Hide Filter Row'
        : 'Show Filter Row';
      this.filterButtonOptions.icon = this.isFilterRowVisible
        ? 'filter'
        : 'filter';
    });
  };

  getAccountsGroupList() {
    this.accountsGroupList = new DataSource({
      load: () =>
        new Promise((resolve, reject) => {
          const payload = {
            COMPANY_ID: this.companyID,
          };
          this.dataService.getAccountGroupHeadList(payload).subscribe({
            next: (response: any) => {
              if (response?.Data && Array.isArray(response.Data)) {
                // Sort data by ID (descending)
                const sortedData = response.Data.sort(
                  (a: any, b: any) => b.ID - a.ID,
                );

                // Add serial number
                const formattedData = sortedData.map(
                  (item: any, index: number) => ({
                    ...item,
                    sno: index + 1,
                  }),
                );

                resolve(formattedData); // ✅ return the formatted data
              } else {
                resolve([]); // ✅ no data found
              }
            },
            error: (err) => {
              console.error('Error loading Account Group list:', err);
              reject('Failed to load data');
            },
          });
        }),
    });
  }

  statusCellRender(cellElement: any, cellInfo: any) {
    const status = cellInfo.data.IS_INACTIVE;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color = status === 'ACTIVE' ? '#5cac6fff' : '#d87f7fff';
    icon.title = status === 'ACTIVE' ? 'Active' : 'Inactive';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  onEditAccount(event: any) {
    event.cancel = true;
    const accHeadId = event.data.ID;
    this.dataService.selectAccountHead(accHeadId).subscribe((response: any) => {
      this.selectedAccountHead = response.Data;
      this.editAccountPopupOpened = true;
    });
  }

  addAccount() {
    this.addAccountPopupOpened = true;
  }

  onDeleteAccountHead(e: any) {
    const accHeadId = e.data.ID;
    // Optionally prevent the default delete behavior
    e.cancel = true;

    // Call your delete API
    this.dataService.deleteAccountHeadlData(accHeadId).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'Account Head Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.getAccountsGroupList();
          // this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not deleted',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
        // or whatever method you use to refresh `employeeList`
      },
      (error) => {
        console.error('Error deleting employee:', error);
      },
    );
  }

  handleClose() {
    this.addAccountPopupOpened = false; // closes the popup
    this.editAccountPopupOpened = false;
    this.getAccountsGroupList();
  }
}

@NgModule({
  imports: [
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
    AddAccountModule,
    EditAccountModule,
  ],
  providers: [],
  declarations: [AccountsListComponent],
  exports: [AccountsListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AccountsListModule { }
