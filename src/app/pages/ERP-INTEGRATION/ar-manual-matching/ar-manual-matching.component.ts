import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  NgModule,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxFormModule,
  DxLoadPanelModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { DepartmentFormModule } from 'src/app/components/library/department-form/department-form.component';
import { DataService } from 'src/app/services/data.service';
import * as XLSX from 'xlsx';
import notify from 'devextreme/ui/notify';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-ar-manual-matching',
  templateUrl: './ar-manual-matching.component.html',
  styleUrls: ['./ar-manual-matching.component.scss']
})
export class ARManualMatchingComponent {
  @ViewChild('detailGrid', { static: false }) detailGrid!: DxDataGridComponent;
  importDataList: DataSource | null = null;

  RAGridData: any[] = [];
  RAProcessPopUpColumns: any[] = [];
  isHisSelected: boolean = false;
  distributeRA: boolean = false;
  selectedDateRange: any = 'last7';
  isFilterOpened: boolean = false;
  currentFilter: string = 'auto';
  showFilterRow: boolean = false;
  detailViewColumns: any[] = [];
  importDetailData: any[] = [];
  dateRanges = [
    { label: 'All', value: 'all' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Custom', value: 'custom' },
  ];
  ReProcessButtonOptions = {
    text: 'Matching',
    icon: '',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Import AR Data',
    onClick: () => {
      // this.processPendingRows();
    },
    elementAttr: { class: 'add-button' },
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },

    onClick: () => this.toggleFilters(),
  };
  customStartDate: any = null;
  customEndDate: any = null;
  showCustomDatePopup: boolean = false;
  detailsDataColumns: any[] = [];

  constructor(private ngZone: NgZone, private service: DataService) {
    this.fetch_Full_import_list();
  }
  onRADataRowSelected(e: any) {
    console.log('Selected Row Data:', e.data);
    // You can perform
  }

  onCellPrepared(e: any) {
    console.log('Cell Prepared:', e);
  }

  //===================
  onRowCollapsing(e: any) {
    console.log('Row Collapsing:', e.data);
  }
  onRowExpanding(e: any) {
    console.log('Row Expanding:', e.data);
  }
  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.detailGrid?.instance;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  onCellClick(e: any) {
    console.log('Cell Clicked:', e);
  }
  onEditorPreparing(e: any) {
    console.log('Editor Preparing:', e);
  }


  //=============date filter==================


  displayExpr = (item: any) => {
    if (!item) return '';

    if (item.value === 'custom' && this.customStartDate && this.customEndDate) {
      const from = this.formatAsDDMMYYYY(new Date(this.customStartDate));
      const to = this.formatAsDDMMYYYY(new Date(this.customEndDate));
      return `${from} to ${to}`;
    }

    return item.label;
  };

  private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }

    // reset custom label
    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom' ? { ...option, label: 'Custom' } : option,
    );

    this.customStartDate = null;
    this.customEndDate = null;

    this.fetch_Full_import_list();
  }

  attachItemClickHandler(e: any) {
    setTimeout(() => {
      const popup = e.component._popup;
      const innerList =
        popup && popup.$content().find('.dx-list').dxList('instance');
      if (innerList) {
        innerList.off('itemClick'); // unsubscribe first (to avoid duplicates)
        innerList.on('itemClick', (clickEvent: any) => {
          const clickedValue = clickEvent.itemData.value;
          if (clickedValue === 'custom') {
            this.openCustomDatePopup();
            e.component.close();
          }
        });
      }
    }, 0);
  }
  // ====== Fetch Import data list =======
  fetch_Full_import_list() {
    //  Common Formatter
    const formatData = (data: any[] = []) => {
      return data.map((item: any) => {
        const updatedItem: any = { ...item };

        Object.keys(updatedItem).forEach((key: string) => {
          const value = updatedItem[key];

          // Verified Field
          if (key === 'Verified') {
            updatedItem[key] =
              value === true
                ? 1
                : value === false
                  ? ''
                  : value == null
                    ? null
                    : String(value);

            return;
          }

          // Date Field Conversion
          if (
            value &&
            typeof value === 'string' &&
            key.toLowerCase().includes('date')
          ) {
            const date = new Date(value);

            if (!isNaN(date.getTime())) {
              updatedItem[key] = [
                String(date.getDate()).padStart(2, '0'),
                String(date.getMonth() + 1).padStart(2, '0'),
                date.getFullYear(),
              ].join('-');
            }
          }
        });

        return updatedItem;
      });
    };

    // DataSource
    this.importDataList = new DataSource({

      load: async () => {
        try {
          const { fromDate, toDate } = this.getDateRange();

          const payload = {
            DATE_FROM: fromDate,
            DATE_TO: toDate,
          };
          const response: any = await this.service
            .import_AR_Full_List(payload)
            .toPromise();

          // Header Data
          const headerData = formatData(response?.header || []);

          // Detail Data
          this.importDetailData = formatData(response?.detail || []);

          // Dynamic Detail Columns
          this.detailsDataColumns = Object.keys(
            this.importDetailData?.[0] || {},
          );

          // Dynamic Header Columns
          this.detailViewColumns = Object.keys(headerData?.[0] || {});

          return headerData;
        } catch (error) {
          console.error(error);
          return [];
        }
      },
    });

  }

  openCustomDatePopup() {
    this.customStartDate = null;
    this.customEndDate = null;
    this.showCustomDatePopup = true;
  }

  private getDateRange(): { fromDate: string | null; toDate: string | null } {
    const today = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    switch (this.selectedDateRange) {
      case 'last7':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 6);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last15':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 14);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'last30':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 29);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

      case 'all':
        return { fromDate: null, toDate: null };

      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          fromDate = new Date(this.customStartDate);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(this.customEndDate);
          toDate.setHours(23, 59, 59, 999);
        }
        break;
    }

    return {
      fromDate: fromDate ? this.formatDate(fromDate) : null,
      toDate: toDate ? this.formatDate(toDate) : null,
    };
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
  }

  applyCustomDateFilter() {
    if (!this.customStartDate || !this.customEndDate) return;

    if (this.customStartDate > this.customEndDate) {
      alert('From date cannot be greater than To date');
      return;
    }

    const fromLabel = this.formatAsDDMMYYYY(new Date(this.customStartDate));
    const toLabel = this.formatAsDDMMYYYY(new Date(this.customEndDate));

    this.dateRanges = this.dateRanges.map((option) =>
      option.value === 'custom'
        ? { ...option, label: `${fromLabel} - ${toLabel}` }
        : option,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    this.fetch_Full_import_list();
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
    DepartmentFormModule,
    DxTextBoxModule,
    DxFormModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    DxValidatorModule,
    DxLoadPanelModule,
    DxSelectBoxModule,
  ],
  providers: [],
  declarations: [ARManualMatchingComponent],
  exports: [ARManualMatchingComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ARManualMatchingModule { }
