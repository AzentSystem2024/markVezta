import {
  ChangeDetectorRef,
  Component,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  DxDateBoxModule,
  DxSelectBoxModule,
  DxTagBoxModule,
  DxToolbarModule,
  DxTooltipModule,
} from 'devextreme-angular';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { eventNames } from 'process';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import * as XLSX from 'xlsx'; // Import xlsx library
import { kMaxLength } from 'buffer';
import { CommonModule } from '@angular/common';
import Validator from 'devextreme/ui/validator';
import {
  TooltipCellModule,
  TooltipCellComponent,
} from 'src/app/components/utils/tooltip-cell/tooltip-cell.component';
import { NonNullableFormBuilder } from '@angular/forms';
import { FormPopupModule } from 'src/app/components';
import { DxPopupModule } from 'devextreme-angular';
import {
  ImportItemsDialogModule,
  ImportItemsDialogComponent,
} from 'src/app/components/library/import-items-dialog/import-items-dialog.component';
import { DxiButtonModule } from 'devextreme-angular/ui/nested';
import {
  ViewImportedItemsComponent,
  ViewImportedItemsModule,
} from 'src/app/components/library/view-imported-items/view-imported-items.component';
import { ImportItemTemplateFormComponent } from 'src/app/components/library/import-item-template-form/import-item-template-form.component';
import DataSource from 'devextreme/data/data_source';
import { DxLoadPanelModule } from 'devextreme-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-import-chart-of-accounts',
  templateUrl: './import-chart-of-accounts.component.html',
  styleUrls: ['./import-chart-of-accounts.component.scss'],
})
export class ImportChartOfAccountsComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild(ImportItemTemplateFormComponent)
  itemComponent!: ImportItemTemplateFormComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  datasource!: DataSource;
  rawData: any[] = [];
  itemTemplateData: any;
  selectedData: any;
  columns: any[];
  isDatasourceLoaded: boolean = false;
  errorCells: Set<string> = new Set(); // To track cells with validation errors
  flag = 0;
  stores: any;
  openImportItemsPopup: boolean = false;
  ViewImportItemsPopup: boolean = false;
  selectedRange: { from: any; to: any } = { from: null, to: null };
  isDateRangePopupVisible: boolean = false;
  selectedId: any;
  companyState: any;
  companyStateID: any;
  GST: any;
  HSNCODE: any;
  selectedCompanyId: any;
  companyList: any[];
  userID: any;
  finID: any;
  popupReady = false;
  isSaving = false;

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
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

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new template',
    onClick: () => {
      this.ngZone.run(() => this.openImportItems());
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

  downloadTemplateOptions = {
    icon: 'download',
    text: '',
    hint: 'Download Excel Template',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.downloadTemplate(),
  };

  importButtonOptions = {
    icon: 'import',
    text: 'Import',
    hint: 'Import Excel',
    type: 'default',
    stylingMode: 'contained',
    elementAttr: { class: 'add-button' },

    onClick: () => {
      this.triggerFileInput();
    },
  };

  batchNo!: string;
  importedAccounts: any[] = [];
  isDetailsLoading = false;

   canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  constructor(
    private service: DataService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
  ) {}

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
  }

  openImportItems() {
    this.openImportItemsPopup = true;
  }
  handleClose() {
    this.openImportItemsPopup = false;
    this.getImportAccountsLog();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];

    if (!file) return;

    if (event.target.files.length !== 1) {
      notify(
        {
          message: 'Cannot use multiple files',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
        3000,
      );
      this.resetFileInput();
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const bstr = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        const wsname = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        const headerData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const rowData: any[] = XLSX.utils.sheet_to_json(ws);

        /* ---------------- HEADER VALIDATION ---------------- */

        if (!headerData.length || !Array.isArray(headerData[0])) {
          notify(
            {
              message: 'Invalid Excel format.',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
            3000,
          );
          this.resetFileInput();
          return;
        }

        const excelHeaders = headerData[0];

        const expectedHeaders = [
          'MainGroup',
          'SubGroup',
          'Category',
          'LedgerCode',
          'LedgerName',
          'CostType',
        ];

        /* ---------------- COLUMN MATCH ---------------- */

        if (!this.arraysMatch(excelHeaders, expectedHeaders)) {
          notify(
            {
              message: 'Excel template columns do not match required format.',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
            4000,
          );

          this.resetFileInput();
          return;
        }

        /* ---------------- EMPTY FILE CHECK ---------------- */

        if (!rowData.length) {
          notify(
            {
              message: 'Excel file is empty.',
              position: { at: 'top right', my: 'top right' },
            },
            'warning',
            3000,
          );
          this.resetFileInput();
          return;
        }

        /* ---------------- SUCCESS FLOW ⭐ ---------------- */

        this.rawData = rowData;

        // OPEN IMPORT POPUP
        this.openImportItemsPopup = true;

        this.loadData();

        this.resetFileInput();
      } catch (error) {
        console.error(error);

        notify(
          {
            message: 'Error reading Excel file.',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
          4000,
        );

        this.resetFileInput();
      }
    };

    reader.readAsBinaryString(file);
  }

  loadData() {
    this.isDatasourceLoaded = true;
    this.cd.detectChanges();
  }
  arraysMatch(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
  resetFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  clearDataGrid() {
    this.rawData = [];
    this.isDatasourceLoaded = false;
    this.cd.detectChanges();
  }

  getImportAccountsLog() {
    this.datasource = new DataSource({
      load: () =>
        new Promise((resolve, reject) => {
          this.service
            .getImportChartOfAccountsLog(this.selectedCompanyId)
            .subscribe({
              next: (data: any[]) => {
                this.rawData = data || []; // 🔥 keep array copy
                resolve(this.rawData);
              },
              error: (err) => {
                console.error('Error loading import log', err);
                reject('Failed to load import log');
              },
            });
        }),
    });
  }

  viewDetails = (e: any) => {
    this.selectedId = e.row.data.ID;

    this.ViewImportItemsPopup = true;

    // load data immediately
    this.loadImportedAccounts();
  };

  loadImportedAccounts() {
    if (!this.selectedId) return;

    this.isDetailsLoading = true;

    const payload = {
      LogID: this.selectedId,
    };

    this.service.viewImportedAccounts(payload).subscribe({
      next: (res: any) => {
        this.importedAccounts = res.data || [];
        this.isDetailsLoading = false;
      },
      error: () => {
        this.isDetailsLoading = false;

        notify('Failed to load imported accounts', 'error', 3000);
      },
    });
  }

  onPopupShown() {
    setTimeout(() => {
      this.popupReady = true;
    }, 0);
  }

  ngOnInit(): void {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(userDataString);
    const selectedCompany = userData.SELECTED_COMPANY;
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.CanView;
      this.canApprove = packingRights.CanApprove;
    }
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;

      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
      }

      if (userData.USER_ID) {
        this.userID = userData.USER_ID;
      }
    }
    this.getImportAccountsLog();
  }

  convertUtcToLocal = (rowData: any) => {
    if (!rowData?.ImportedTime) return null;

    const utcDate = new Date(rowData.ImportedTime);

    // ✅ Convert UTC → Local Time
    return new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
  };

  downloadTemplate() {
    const headers = [
      'MainGroup',
      'SubGroup',
      'Category',
      'LedgerCode',
      'LedgerName',
      'CostType',
    ];

    // Create empty worksheet with headers only
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ChartOfAccounts');

    // Download file
    XLSX.writeFile(workbook, 'ChartOfAccounts_Template.xlsx');
  }

  triggerFileInput() {
    document.getElementById('fileInput')!.click();
  }

  generateBatchNo(): string {
    const now = new Date();

    const datePart =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');

    const randomPart = Math.floor(100 + Math.random() * 900);

    return `${datePart}${randomPart}`;
  }

  saveImportedData() {
    if (!this.rawData?.length) {
      notify('No data to import', 'warning', 3000);
      return;
    }

    // ✅ Generate only once
    if (!this.batchNo) {
      this.batchNo = this.generateBatchNo();
    }

    const formattedData = this.rawData.map((item: any) => ({
      ...item,
      LedgerCode:
        item.LedgerCode !== undefined && item.LedgerCode !== null
          ? String(item.LedgerCode)
          : null, // keep null if empty
    }));

    const payload = {
      CompanyID: this.selectedCompanyId,
      UserID: this.userID,
      BatchNo: this.batchNo,
      Action: 1,
      Data: formattedData,
    };

    const startTime = Date.now();

    // ✅ SHOW LOADER
    this.isSaving = true;

    this.service.saveimportedAccounts(payload).subscribe({
      next: () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(2000 - elapsed, 0);

        // ✅ Ensure loader visible minimum 2 sec
        setTimeout(() => {
          this.processBatch();
        }, remaining);
      },

      error: () => {
        this.isSaving = false;
        notify('Save failed', 'error', 3000);
      },
    });
  }

  processBatch() {
    const payload = {
      CompanyID: this.selectedCompanyId,
      UserID: this.userID,
      BatchNo: this.batchNo,
      Action: 2,
    };

    this.service.saveimportedAccounts(payload).subscribe({
      next: () => {
        this.isSaving = false;

        notify('Import completed successfully', 'success', 3000);

        this.openImportItemsPopup = false;

        this.getImportAccountsLog();

        this.batchNo = '';
      },

      error: () => {
        this.isSaving = false;
        notify('Processing failed', 'error', 3000);
      },
    });
  }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    DxToolbarModule,
    DxSelectBoxModule,
    CommonModule,
    TooltipCellModule,
    DxTooltipModule,
    DxTagBoxModule,
    FormPopupModule,
    ImportItemsDialogModule,
    DxPopupModule,
    DxDateBoxModule,
    DxiButtonModule,
    ViewImportedItemsModule,
    DxLoadPanelModule,
  ],
  providers: [],
  exports: [],
  declarations: [ImportChartOfAccountsComponent],
})
export class ImportChartOfAccountsModule {}
