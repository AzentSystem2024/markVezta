import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxDataGridModule,
  DxButtonModule,
  DxPopupModule,
  DxTextBoxModule,
  DxFormModule,
  DxCheckBoxModule,
  DxValidatorModule,
  DxLoadPanelModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import { FormPopupModule } from 'src/app/components';
import { DataService } from 'src/app/services/data.service';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-ar-imported-list',
  templateUrl: './ar-imported-list.component.html',
  styleUrls: ['./ar-imported-list.component.scss'],
})
export class ARImportedListComponent {
  @ViewChild('detailGrid', { static: false })
  detailGrid!: DxDataGridComponent;

  isFilterOpened: boolean = false;
  showFilterRow: boolean = false;
  currentFilter: string = 'auto';

  importDataList: DataSource | null = null;
  detailViewColumns: any[] = [];

  // Store all detail data
  importDetailData: any[] = [];
  filteredDetailData: any[] = [];
  detailsDataColumns: any[] = [];

  expandedRowKeys: any[] = [];
  detailDataMap: { [key: string]: any[] } = {};

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

  ReProcessButtonOptions = {
    text: 'Re-Process',
    icon: 'refresh',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Import AR Data',

    onClick: () => {
      this.processPendingRows();
    },

    elementAttr: { class: 'add-button' },
  };
  // ================= Progress Variables =================
  isProcessingRows: boolean = false;
  totalRequestCount: number = 0;
  completedRequestCount: number = 0;
  failedRequestCount: number = 0;
  pendingRequestCount: number = 0;

  constructor(
    private ngZone: NgZone,
    private srvce: DataService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetch_Full_import_list();
  }

  // ====== Fetch Import data list =======
  fetch_Full_import_list() {
    this.importDataList = new DataSource({
      store: new CustomStore({
        key: 'HeaderID',

        load: () => {
          return this.srvce
            .import_AR_Full_List()
            .toPromise()
            .then((response: any) => {
              // ================= Header Data =================
              const headerData = response?.header || [];

              // ================= Store Detail Data =================
              this.importDetailData = (response?.detail || []).map(
                (item: any) => {
                  const updatedItem: any = { ...item };

                  Object.keys(updatedItem).forEach((key: string) => {
                    const value = updatedItem[key];

                    // ================= Verified Field =================
                    if (key === 'Verified') {
                      updatedItem[key] =
                        value === true
                          ? 1
                          : value === false
                            ? ''
                            : value === null || value === undefined
                              ? null
                              : String(value);
                    }

                    // ================= Date Field Conversion =================
                    // Column name contains "date"
                    else if (key.toLowerCase().includes('date') && value) {
                      const date = new Date(value);

                      if (!isNaN(date.getTime())) {
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          '0',
                        );
                        const year = date.getFullYear();

                        // Display Format => dd-MM-yyyy
                        updatedItem[key] = `${day}-${month}-${year}`;
                      }
                    }
                  });

                  return updatedItem;
                },
              );
              this.detailsDataColumns = Object.keys(
                this.importDetailData[0] || {},
              );

              // ================= Format Header Data =================
              const Finaldata = headerData.map((item: any) => ({
                ...item,

                Verified:
                  item.Verified === true
                    ? 1
                    : item.Verified === false
                      ? ''
                      : item.Verified === null || item.Verified === undefined
                        ? null
                        : String(item.Verified),
              }));

              // ================= Dynamic Columns =================
              if (Finaldata.length > 0) {
                this.detailViewColumns = Object.keys(Finaldata[0]);
              }

              return Finaldata;
            })
            .catch((error) => {
              console.error(error);
              return [];
            });
        },
      }),
    });
  }

  // ================= Row Expanding =================
  onRowExpanding(e: any) {
    const headerID = e.key;
    // Prevent duplicate keys
    if (!this.expandedRowKeys.includes(headerID)) {
      this.expandedRowKeys.push(headerID);
    }
    // Load only if not already loaded
    if (!this.detailDataMap[headerID]) {
      this.detailDataMap[headerID] = this.importDetailData.filter(
        (x: any) => x.HeaderID === headerID,
      );
    }
  }

  // ================= Row Collapsing =================
  onRowCollapsing(e: any) {
    const headerID = e.key;
    this.expandedRowKeys = this.expandedRowKeys.filter((x) => x !== headerID);
    delete this.detailDataMap[headerID];
  }

  refreshGrid() {
    if (this.detailGrid?.instance) {
      this.detailGrid.instance.refresh();
    }
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.detailGrid?.instance;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  onCellPrepared(e: any) {
    // ===== Disable Selection Checkbox =====
    if (
      e.rowType === 'data' &&
      e.column.command === 'select' &&
      e.data.Status?.trim() === 'Posted'
    ) {
      // Disable selection cell
      e.cellElement.style.pointerEvents = 'none';
      e.cellElement.style.opacity = '0.5';

      // Hide checkbox
      const checkbox = e.cellElement.querySelector('.dx-select-checkbox');

      if (checkbox) {
        (checkbox as HTMLElement).style.display = 'none';
      }
    }

    // ===== Status Column Color =====
    if (e.rowType === 'data' && e.column.dataField === 'Status') {
      const status = e.value?.trim();

      // Open
      if (status === 'Open') {
        e.cellElement.style.color = '#ff6f0f';
        e.cellElement.style.fontWeight = '600';
      }

      // Posted
      else if (status === 'Posted') {
        e.cellElement.style.color = '#03b12b';
        e.cellElement.style.fontWeight = '600';
      }

      // Failed
      else if (status === 'Failed') {
        e.cellElement.style.color = '#ff2929';
        e.cellElement.style.fontWeight = '600';
      }
    }
  }

  // ================= Allow Checkbox Only For Pending / Failed =================
  onEditorPreparing(e: any) {
    if (e.parentType === 'dataRow' && e.command === 'select') {
      const status = e.row?.data?.Status;
      if (status !== 'Open' && status !== 'Failed') {
        e.editorOptions.disabled = true;
      }
    }
  }

  // ================= Process Pending Rows =================
  async processPendingRows() {
    // Selected Rows
    const selectedRows = this.detailGrid?.instance.getSelectedRowsData();

    if (!selectedRows || selectedRows.length === 0) {
      notify('Please select rows', 'warning', 3000);
      return;
    }

    // Pending Rows Only
    const pendingRows = selectedRows.filter(
      (x: any) => x.Status === 'Open' || x.Status === 'Failed',
    );
    if (pendingRows.length === 0) {
      notify('Please select pending rows only', 'warning', 3000);
      return;
    }
    // ================= Initialize Counters =================
    this.isProcessingRows = true;
    this.totalRequestCount = pendingRows.length;
    this.completedRequestCount = 0;
    this.failedRequestCount = 0;
    this.pendingRequestCount = pendingRows.length;
    // ================= Process One By One =================
    for (const row of pendingRows) {
      try {
        const response: any = await this.srvce
          .process_pending_rows(row)
          .toPromise();
        // ================= Success =================
        if (response?.flag === '1') {
          this.completedRequestCount++;
        } else {
          this.failedRequestCount++;
        }
      } catch (error: any) {
        console.error(error);
        this.failedRequestCount++;
      }
      // ================= Update Pending Count =================
      this.pendingRequestCount =
        this.totalRequestCount -
        (this.completedRequestCount + this.failedRequestCount);
    }
    // ================= Completed =================
    this.isProcessingRows = false;
    // Force UI update immediately
    this.cdr.detectChanges();
    // Wait for loader DOM removal
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Clear selection
    this.detailGrid?.instance.clearSelection();
    await new Promise((resolve) => setTimeout(resolve, 100));
    // Clear filters
    this.detailGrid?.instance.clearFilter();
    await new Promise((resolve) => setTimeout(resolve, 100));
    // Clear search
    this.detailGrid?.instance.searchByText('');

    notify(
      `Processing completed.
   Success : ${this.completedRequestCount}
   Failed : ${this.failedRequestCount}`,
      'success',
      5000,
    );

    // Final delay before refresh
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Refresh grid
    this.refreshGrid();
  }
}
@NgModule({
  imports: [
    BrowserModule,
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    DxTextBoxModule,
    DxFormModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    DxValidatorModule,
    DxLoadPanelModule,
  ],
  providers: [],
  declarations: [ARImportedListComponent],
  exports: [ARImportedListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ARImportedListModule {}
