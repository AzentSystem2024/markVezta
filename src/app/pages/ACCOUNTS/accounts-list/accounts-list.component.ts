import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
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
import { EditAccountModule,EditAccountComponent } from '../edit-account/edit-account.component';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accounts-list',
  templateUrl: './accounts-list.component.html',
  styleUrls: ['./accounts-list.component.scss'],
})
export class AccountsListComponent {
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
    icon: 'filter',
    hint: 'Show Filter Row',
    onClick: () => this.toggleFilterRow(),
    stylingMode: 'text',
    elementAttr: { class: 'commonButtons' },
  };
  auto: string = 'auto';
  selectedAccountHead: any;
    addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    // icon: 'add',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => {
        this.addAccount();
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
  constructor(private dataService: DataService,
    private ngZone: NgZone,private router: Router
  ) {}

  ngOnInit() {
     const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData:', menuResponse);
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/accounts');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }

    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
    this.getAccountsGroupList();
  }


  getFilterButtonOptions() {
  return {
    icon: 'filter',
    hint: this.isFilterRowVisible ? 'Hide Filter Row' : 'Show Filter Row',
    onClick: () => this.toggleFilterRow(),
    stylingMode: 'text',
    elementAttr: { class: 'commonButtons' }
  };
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


toggleFilterRow = () => {
  this.ngZone.run(() => {
    this.isFilterRowVisible = !this.isFilterRowVisible;

    // Update hint/icon without reconstructing the object
    this.filterButtonOptions.hint = this.isFilterRowVisible ? 'Hide Filter Row' : 'Show Filter Row';
    this.filterButtonOptions.icon = this.isFilterRowVisible ? 'filter' : 'filter';
  });
};
  getAccountsGroupList() {
    this.dataService.getAccountGroupHeadList().subscribe((response: any) => {
      if (response?.Data && Array.isArray(response.Data)) {
        this.accountsGroupList = response.Data.map(
          (item: any, index: number) => ({
            ...item,
            sno: index + 1,
          })
        );
        console.log(this.accountsGroupList, 'accountsGroupList with Serial No');
      } else {
        this.accountsGroupList = [];
        console.warn('No data found in response');
      }
    });
  }

  onEditAccount(event: any) {
    console.log(event,"EVENT")
    event.cancel = true;
    const accHeadId = event.data.ID;
    console.log(accHeadId,"ACCOUNTHEADID")
    this.dataService.selectAccountHead(accHeadId).subscribe((response: any) => {
      this.selectedAccountHead = response.Data;
      this.editAccountPopupOpened = true;
      console.log(response,"RESPONSE")
    })
  }

  addAccount() {
    this.addAccountPopupOpened = true;
  }

  onDeleteAccountHead(e: any){
      const accHeadId = e.data.ID;
    // console.log("delete")
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
            'success'
          );
          this.getAccountsGroupList();
          // this.dataGrid.instance.refresh();
        } else {
          notify(
            {
              message: 'Your Data Not deleted',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
        // or whatever method you use to refresh `employeeList`
      },
      (error) => {
        console.error('Error deleting employee:', error);
      }
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
    EditAccountModule
  ],
  providers: [],
  declarations: [AccountsListComponent],
  exports: [AccountsListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AccountsListModule {}
