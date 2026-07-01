import {
  ChangeDetectorRef,
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
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';
import { AddInvoiceRetailModule } from '../INVOICE/add-invoice-retail/add-invoice-retail.component';
import { InvoiceRetailComponent } from '../OPERATIONS/invoice-retail/invoice-retail.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import { DistrictFormModule } from '../district-form/district-form.component';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-district',
  templateUrl: './district.component.html',
  styleUrls: ['./district.component.scss'],
})
export class DistrictComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: any = DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: boolean = true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  vatTitle: any;
  companyID: any;
  isHQApp: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  canVerify: any;
  isEditDistrict: boolean = false;
  selectedInvoice: any;
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addDistrict());
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
    onClick: () => {
      this.ngZone.run(() => this.refreshGrid());
    },
    text: '',
  };
  isAddDistrict: boolean = false;
  districtList: any;
  selectedDistrict: any;
  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ngZone: NgZone,
  ) {}
  ngOnInit() {
    const currentUrl = this.router.url;
    //
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(userDataString);
    this.vatTitle = userData.GeneralSettings.VAT_TITLE;
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    this.isHQApp = userData.GeneralSettings.IS_HQ_APP;
    const configStore = userData.Configuration?.[0];
    const menuGroups = menuResponse.MenuGroups || [];
    console.log(menuGroups, 'MENUGROUPSSSSSSSSSSS');
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);
    console.log(packingRights, 'PACKINGRIGHTSSSSSSSS');
    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify;
    }
    this.getDistrictList();
    // if (this.isHQApp && configStore) {
    //   this.filteredStoreList = [
    //     {
    //       ID: configStore.STORE_ID,
    //       DESCRIPTION: configStore.STORE_NAME,
    //     },
    //   ];
    // } else {
    //   this.filteredStoreList = this.storeList;
    // }
    // this.selectedStoreId = configStore.STORE_ID;
  }
  addDistrict() {
    this.isAddDistrict = true;
    this.cdr.detectChanges();
  }
  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.getDistrictList();
  }
  getDistrictList() {
    this.dataService.getDistricts().subscribe((response: any) => {
      this.districtList = response.Data;
    });
  }
  onEditDistrict(event: any) {
    event.cancel = true;
    console.log(event, 'eventtttttttindistrict');
    const id = event.data.ID;
    this.dataService.selectDistrict(id).subscribe((response: any) => {
      this.selectedDistrict = response.Data;
      console.log(this.selectedDistrict, 'selecteddistrict');
      this.isEditDistrict = true;
    });
  }
  onDeleteDistrict(event: any) {
    event.cancel = true;

    const ID = event.data.ID;
    event.cancel = true;
    // Call your delete API
    this.dataService.deleteDistrict(ID).subscribe(
      (response: any) => {
        if (response) {
          notify(
            {
              message: 'District Deleted Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.getDistrictList();
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
        console.error('Error deleting data:', error);
      },
    );
  }
  handleClose() {
    this.isAddDistrict = false;
    this.isEditDistrict = false;
    this.getDistrictList();
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
    CustomDatePopupModule,
    DistrictFormModule,
  ],
  providers: [],
  declarations: [DistrictComponent],
  exports: [DistrictComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DistrictModule {}
