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
  selected_Company_id: any;
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
    private router: Router,
  ) { }

  ngOnInit() {
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
    this.sessionData_tax();
    const menuGroups = menuResponse.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
    this.getLedgerSettingsList();
    this.getLedgerDropdown();
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
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
            (r) => r?.data === e.row?.data,
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
        notify(
          {
            message: 'Ledger settings added successfully!',
            type: 'success',
            displayTime: 3000,
            position: { at: 'top center', my: 'top center' },
          },
          'success',
          3000,
        );
        // Optional: reload grid
        this.getLedgerSettingsList();
      },
      error: (err: any) => {
        console.error('Save failed', err);
      },
    });
  }


  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  clearLedger = (e: any) => {
    const rowIndex = e.row.rowIndex;
    const headId = e.row.data.HEAD_ID;

    if (!headId) {
      // Nothing to delete, just clear UI
      e.component.cellValue(rowIndex, 'HEAD_ID', null);
      return;
    }

    const payload = {
      COMPANY_ID: this.companyID,
      HEAD_ID: headId,
    };

    this.dataService.DeletetLedgerSettings(payload).subscribe({
      next: (res: any) => {
        notify(
          {
            message: 'Ledger removed successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );

        //  Clear UI after success
        e.component.cellValue(rowIndex, 'HEAD_ID', null);
        e.component.refresh();
      },
      error: (err: any) => {
        console.error(err);
        notify(
          {
            message: 'Failed to delete ledger',
            position: { at: 'top center', my: 'top center' },
          },
          'error'
        );
      },
    });
  };
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
export class LedgerSettingsListModule { }
