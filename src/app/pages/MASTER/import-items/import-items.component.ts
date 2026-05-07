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
  selector: 'app-import-items',
  templateUrl: './import-items.component.html',
  styleUrls: ['./import-items.component.scss'],
  template: `
    <ng-template #tooltipCell let-data="data">
      <app-tooltip-cell [data]="data"></app-tooltip-cell>
    </ng-template>
  `,
})
export class ImportItemsComponent implements OnInit {
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

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

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

  importButtonOptions = {
    icon: 'download',
    hint: 'Import',
    onClick: () => this.triggerFileInput(),
  };
  saveButtonOptions = {
    text: 'Save',
    hint: 'Save',
    elementAttr: {
      class: 'custom-button',
    },
    onClick: () => {
      this.saveData();
    },
  };

  dateRanges = [
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Today', value: 'today' },
    { label: 'Current Month', value: 'currentMonth' },
    { label: 'Current Year', value: 'currentYear' },
    { label: 'All Dates', value: 'allDates' },
    { label: 'Select a Range of Dates', value: 'range' },
  ];

  defaultDateRange = 'currentMonth';

  constructor(
    private service: DataService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router
  ) { }

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

  onDateRangeChanged(event: any) {
    if (event.value === 'range') {
      this.isDateRangePopupVisible = true; // Show date range picker popup
    } else {
      this.filterDataGrid(event.value); // Apply the filter for predefined ranges
    }
  }
  filterDataGrid(
    selectedRange: string | { from: Date | null; to: Date | null },
  ) {
    let startDate: Date, endDate: Date;

    if (typeof selectedRange === 'string') {
      const today = new Date();
      switch (selectedRange) {
        case 'yesterday':
          startDate = new Date(today.setDate(today.getDate() - 1));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'today':
          startDate = new Date(today.setHours(0, 0, 0, 0));
          endDate = new Date(today.setHours(23, 59, 59, 999));
          break;
        case 'currentMonth':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        case 'currentYear':
          startDate = new Date(today.getFullYear(), 0, 1);
          endDate = new Date(today.getFullYear(), 11, 31);
          break;
        case 'allDates':
        default:
          startDate = new Date(0);
          endDate = new Date();
      }
    } else {
      startDate = selectedRange.from!;
      endDate = selectedRange.to!;
    }

    this.dataGrid.instance.filter([
      ['IMPORT_DATE', '>=', startDate],
      'and',
      ['IMPORT_DATE', '<=', endDate],
    ]);
    this.dataGrid.instance.refresh();
  }

  applyDateRange() {
    if (this.selectedRange.from && this.selectedRange.to) {
      // Ensure the values are Date objects
      const fromDate = new Date(this.selectedRange.from);
      const toDate = new Date(this.selectedRange.to);

      // Adjust the "To Date" to include the end of the day
      toDate.setHours(23, 59, 59, 999);

      this.filterDataGrid({ from: fromDate, to: toDate });
      this.isDateRangePopupVisible = false;
    }
  }

  clearDateRange() {
    this.selectedRange.from = null;
    this.selectedRange.to = null;
  }

  openImportItems() {
    this.openImportItemsPopup = true;
  }
  handleClose() {
    this.openImportItemsPopup = false;
    this.getItemImportLog();
  }

  saveData() {
    // Reset the validation flag before checking
    let hasErrors = false;

    // Clear previous error messages
    this.columns.forEach((col) => {
      this.dataGrid.instance.columnOption(col.dataField, 'cssClass', null);
    });
    // Check each item for validation errors
    this.rawData.forEach((item) => {
      this.columns.forEach((col) => {
        const value = item[col.dataField];
        // Check for mandatory fields
        if (col.isMandatory && !value) {
          hasErrors = true; // Set flag to indicate error
          console.log(`Error: ${col.dataField} is mandatory but empty`);
          this.dataGrid.instance.columnOption(
            col.dataField,
            'cssClass',
            'highlight-column',
          ); // Highlight column
        }
        // Check for max length
        if (value && value.length > col.maxLength) {
          hasErrors = true; // Set flag to indicate error
          console.log(
            `Error: Value for ${col.dataField} exceeds max length of ${col.maxLength}`,
          );
          this.dataGrid.instance.columnOption(
            col.dataField,
            'cssClass',
            'highlight-column',
          ); // Highlight column
        }
      });
    });

    if (hasErrors) {
      notify(
        {
          message: 'Please fix the validation errors before saving.',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
      );
      return; // Stop the save operation
    }

    // Proceed with data transformation if no errors
    const transformedData = this.rawData.map((item) => ({
      ITEM_CODE: item.ItemCode,
      BARCODE: item.Barcode,
      DESCRIPTION: item.Description,
      POS_DESCRIPTION: '', // Assuming you want to leave this empty
      ARABIC_DESCRIPTION: item['Arabic Description'],
      DEPT_CODE: item['Department Code']?.toString() || '',
      DEPT_NAME: item.Department || '',
      CAT_CODE: item['Category Code'] || '',
      CAT_NAME: item.Category?.trim() || '',
      SUBCAT_CODE: item['Subcategory Code'] || '',
      SUBCAT_NAME: item.Subcategory?.trim() || '',
      BRAND_CODE: item['Brand Code'] || '',
      BRAND_NAME: item.Brand || '',
      SUPP_CODE: item['Supplier Code'] || '',
      SUPP_NAME: item.SupplierName || '',
      SUPP_PRICE: item.SupplierPrice?.toString() || '0',
      COST: item.ItemCost?.toString() || '0',
      VAT_PERCENT: item.VATPercent?.toString() || '0',
      PRICE: item.Price?.toString() || '0',
      ITEM_TYPE: item['Item Type'] || '',
      IS_DISCOUNTABLE: item.Discountable || '',
      COSTING_METHOD: item.CostingMethod || '',
      IS_NOT_SALE_ITEM: item['Not Sellable'] || '',
    }));

    // Now you can send transformedData to your API or wherever needed
    console.log(transformedData);

    this.service.saveImportedData(transformedData).subscribe(
      (response) => {
        if (response.message === 'Success') {
          notify(
            {
              message: 'Data saved successfully!',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );

          // Insert logic here if needed after successful save
          this.clearDataGrid();
          this.openImportItemsPopup = false;
        } else {
          notify(
            {
              message: 'Unexpected error occurred!',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        }
      },
      (error) => {
        notify(
          {
            message: 'Error saving data! ',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
      },
    );
  }

  close() { }

  // Helper method to create and show tooltips
  private createTooltip(cellElement: HTMLElement, message: string) {
    const tooltip = document.createElement('div');
    tooltip.innerText = message;
    tooltip.classList.add('error-tooltip');
    tooltip.style.display = 'none'; // Hide by default
    cellElement.appendChild(tooltip);

    // Show the tooltip on hover
    cellElement.addEventListener('mouseenter', () => {
      tooltip.style.display = 'block'; // Show tooltip
    });
    cellElement.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none'; // Hide tooltip
    });
  }

  triggerFileInput() {
    document.getElementById('fileInput')!.click();
  }
  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      notify(
        {
          message: 'Cannot use multiple files',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
        5000,
      );
      this.resetFileInput();
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = async (e: any) => {
      try {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];

        // Process the header and row data once
        const headerData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const rowData: any[] = XLSX.utils.sheet_to_json(ws);

        console.log('Row Data Length:', rowData.length);

        if (!Array.isArray(headerData[0])) {
          notify(
            {
              message: 'The imported Excel file format is incorrect.',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
            5000,
          );
          this.resetFileInput();
          return;
        }

        const excelColumnCount = headerData[0].length;
        console.log('Excel Column Count:', excelColumnCount);

        const gridColumnCount = this.columns.length;
        console.log('DataGrid Column Count:', gridColumnCount);

        const excelHeaders = headerData[0];
        console.log('Excel Headers:', excelHeaders);

        const gridColumnHeaders = this.columns.map((col) => col.dataField);
        console.log('DataGrid Headers:', gridColumnHeaders);
        if (
          excelColumnCount == gridColumnCount &&
          this.arraysMatch(excelHeaders, gridColumnHeaders)
        ) {
          if (rowData.length == 0) {
            notify(
              {
                message: 'The imported Excel file is empty.',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
              5000,
            );
            this.resetFileInput();
            return;
          }
        }

        if (
          excelColumnCount == gridColumnCount &&
          !this.arraysMatch(excelHeaders, gridColumnHeaders)
        ) {
          notify(
            {
              message:
                'The column headers in the imported Excel file does not match the DataGrid column header.',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
            5000,
          );
          this.resetFileInput();
          return;
        }

        if (gridColumnCount === 0) {
          notify(
            {
              message:
                'Please choose a template name to proceed with the import.',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
            5000,
          );
          this.resetFileInput();
          return;
        }

        if (excelColumnCount !== gridColumnCount) {
          console.log('Column counts do not match.');
          notify(
            {
              message:
                'The number of columns in the imported Excel file does not match the table columns.',
              position: { at: 'top right', my: 'top right' },
              closeOnClick: true,
            },
            'error',
            5000,
          );
          this.resetFileInput();
          return;
        }

        // Set the parsed data as the DataGrid's data source
        this.dataGrid.instance.refresh();
        this.rawData = rowData;
        this.loadData();

        console.log('Datasource loaded:', this.datasource);
      } catch (error) {
        notify(
          {
            message: 'An error occurred while processing the Excel file.',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
          5000,
        );
        this.resetFileInput();
        return;
        console.error('Error processing file:', error);
      }
    };
    reader.readAsBinaryString(target.files[0]);
  }
  loadData() {
    this.isDatasourceLoaded = true;
    console.log(this.isDatasourceLoaded, 'boolean value');
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

  onTemplateValueChanged(event) {
    console.log('event', event);
    // Clear the current data grid data
    this.clearDataGrid();
    this.resetFileInput();

    this.service.selectImportTemplateData(event.value).subscribe((res) => {
      this.selectedData = res.data[0];
      console.log(this.selectedData, 'selected data in update columns');
      this.columns = this.selectedData.import_entry
        .filter((entry) => entry.SELECTED)
        .map((entry) => ({
          dataField: entry.COLUMN_TITLE,
          maxLength: entry.MAX_LENGTH,
          isMandatory: entry.IS_MANDATORY,
        }));
      console.log(this.columns, 'COLUMNSSSSS');
    });
  }

  clearDataGrid() {
    this.rawData = [];
    this.isDatasourceLoaded = false;
    this.cd.detectChanges();
  }

  getItemTemplateName() {
    this.service.getImportTemplateData().subscribe((res) => {
      this.itemTemplateData = res.data;
    });
  }
  getItemImportLog() {
    this.datasource = new DataSource({
      load: () =>
        new Promise((resolve, reject) => {
          this.service.getImportLogData().subscribe({
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
    this.ngZone.run(() => {
      this.selectedId = e.row.data.ID;
      this.popupReady = false;
      this.ViewImportItemsPopup = true;
    });
  };

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
    }

    const userDataString = localStorage.getItem('userData');

    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      console.log(userData, selectedCompany, 'USERDATAAAAAAAAAAAAAAAAA');
      this.companyState = selectedCompany.STATE_NAME;
      this.companyStateID = selectedCompany.STATE_ID;
      console.log(this.companyStateID, 'COMPANYSTATE');
      this.HSNCODE = userData.GeneralSettings.HSN_CODE;
      this.GST = userData.GeneralSettings.GST_PERC;
      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;

        this.companyList = [selectedCompany]; // Show only selected company
      }

      if (userData.USER_ID) {
        this.userID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.finID = firstFinYear.FIN_ID;
      }
    }
    this.getItemTemplateName();
    this.getItemImportLog();
    this.filterDataGrid('currentMonth');
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
  declarations: [ImportItemsComponent],
})
export class ImportItemsModule { }
