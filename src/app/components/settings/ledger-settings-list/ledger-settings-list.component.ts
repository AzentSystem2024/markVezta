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
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-ledger-settings-list',
  templateUrl: './ledger-settings-list.component.html',
  styleUrls: ['./ledger-settings-list.component.scss'],
})
export class LedgerSettingsListComponent {
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
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
    text: 'Save',
    icon: 'bi bi-file-earmark-plus',
    // icon: 'add',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Save',
    onClick: () => {
      this.ngZone.run(() => {
        this.saveLedgerSettings();
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

  onEditorPreparing(e: any) {
    if (e.dataField === 'HEAD_ID') {
      e.editorOptions = e.editorOptions || {};

      // Let the editor inherit row height naturally (no fixed height)
      e.editorOptions.elementAttr = {
        style: `
            height: 100%;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
          `,
      };

      // Make sure the input fits snugly inside
      e.editorOptions.inputAttr = {
        style: `
            height: 100%;
            padding: 0 4px;
            box-sizing: border-box;
          `,
      };

      // Remove spin buttons to prevent layout changes
      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === e.row?.data
          );
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'GST'));
          }, 50);
        }
      };
    }
  }
  saveLedgerSettings() {
    if (!this.ledgerList || this.ledgerList.length === 0) {
      return;
    }
    const fieldMap: any = {
      'Sales Account': 'AC_SALE_ID',
      'Purchase Account': 'AC_PURCHASE_ID',
      'Inventory': 'AC_INVENTORY_ID',
      'Input GST': 'AC_INPUT_VAT',
      'Output GST': 'AC_OUTPUT_VAT',
      'Depreciation Expense': 'AC_DEPRECIATION_EXPENSE_ID',
      'Goods in Transit': 'AC_GOODS_TRANSIT',
    };
    const payload: any = {
      COMPANY_ID: this.companyID,
    };
    this.ledgerList.forEach((row: any) => {
      const key = fieldMap[row.NAME];
      if (key && row.HEAD_ID) {
        payload[key] = row.HEAD_ID;
      }
    });
    this.dataService.insertLedgerSettings(payload).subscribe({
      next: (res: any) => {
        console.log('Save success', res);
         notify(
      {
        message: 'Ledger settings added successfully!',
        type: 'success',
        displayTime: 3000,
        position: { at: 'top center', my: 'top center' },
      },
      'success',
      3000
    );
        // Optional: reload grid
        this.getLedgerSettingsList();
      },
      error: (err: any) => {
        console.error('Save failed', err);
      },
    });
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
