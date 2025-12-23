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
import { SettingsListComponent } from '../settings-list/settings-list.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ledger-settings-list',
  templateUrl: './ledger-settings-list.component.html',
  styleUrls: ['./ledger-settings-list.component.scss'],
})
export class LedgerSettingsListComponent {
  companyID: any;
  sessionData: any;
  selected_vat_id: any;
  ledgerDropdown: any;
  addPurchaseReturn() {
    throw new Error('Method not implemented.');
  }
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
  purchaseReturnList: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  ledgerList: any;

  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    // icon: 'add',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => {
        this.addLedgerSettings();
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
  constructor(
    private dataService: DataService,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    console.log('Parsed ObjectData:', menuResponse);
    this.sessionData_tax();
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/debit');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }
    this.getLedgerSettingsList();
    this.getLedgerDropdown();
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }
  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
  }

  getLedgerSettingsList() {
    const payload = {
      COMPANY_ID: this.companyID,
    };
    this.dataService
      .getLedgerSettingsList(payload)
      .subscribe((response: any) => {
        this.ledgerList = response.DATA;
      });
  }

  getLedgerDropdown() {
    this.dataService
      .getDropdownDataForLedgerSettings('ACCOUNT_HEAD')
      .subscribe((response: any) => {
        this.ledgerDropdown = response;
      });
  }
  addLedgerSettings() {}
}
@NgModule({
  imports: [
    BrowserModule,
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
  ],
  providers: [],
  declarations: [LedgerSettingsListComponent],
  exports: [LedgerSettingsListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LedgerSettingsListModule {}
