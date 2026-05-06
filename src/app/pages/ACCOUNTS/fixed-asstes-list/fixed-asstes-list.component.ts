// import { Component } from '@angular/core';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import notify from 'devextreme/ui/notify';

// Later in your code:

import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
import { FixedAsstesEditModule } from '../../FIXED_ASSETS/fixed-asstes-edit/fixed-asstes-edit.component';
import { FixedAsstesAddModule } from '../../FIXED_ASSETS/fixed-asstes-add/fixed-asstes-add.component';
import { Router } from '@angular/router';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';
@Component({
  selector: 'app-fixed-asstes-list',
  templateUrl: './fixed-asstes-list.component.html',
  styleUrls: ['./fixed-asstes-list.component.scss'],
})
export class FixedAsstesListComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  FixedAssets: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  EditFixedAssetsPopupVisible: boolean = false;
  AddFixedAssetsPopupVisible: boolean = false;
  Selected_fixedAssets_data: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  gridButtons = [
    'edit',
    {
      name: 'delete',
      visible: (e: any) => !e.row?.data?.NET_DEPRECIATION,
    },
  ];
  selectedFA: any;
  fixedAssetId: any;
  selected_Company_id: any;

  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'fixed_assets';
    this.dataService.exportDataGrid(event, fileName);
  }

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilters(),
  };
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addFixedAssets());
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

  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'All', value: 'all' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Custom', value: 'custom' },
  ];

  selectedDateRange: string = 'today';
  customStartDate: any = null;
  customEndDate: any = null;

  showCustomDatePopup = false;

  constructor(
    private dataService: DataService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.list_fixed_assets();
  }
  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  //==========insert open popup=============
  addFixedAssets() {
    this.AddFixedAssetsPopupVisible = true;
  }

  onDateRangeChanged(e: any) {
    this.selectedDateRange = e.value;

    if (e.value === 'custom') {
      this.showCustomDatePopup = true;
      return;
    }

    this.list_fixed_assets(e.value);
  }

  applyCustomDateFilter() {
    if (!(this.customStartDate && this.customEndDate)) return;

    const fromLabel = this.formatAsDDMMYYYY(this.customStartDate);
    const toLabel = this.formatAsDDMMYYYY(this.customEndDate);

    // 🔑 SAME AS CREDIT NOTE
    this.dateRanges = this.dateRanges.map((opt) =>
      opt.value === 'custom'
        ? { ...opt, label: `${fromLabel} - ${toLabel}` }
        : opt,
    );

    this.selectedDateRange = 'custom';
    this.showCustomDatePopup = false;

    this.list_fixed_assets('custom');
  }

  private getDateRangePayload(range: string) {
    const today = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    switch (range) {
      case 'today':
        fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        break;

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

      case 'custom':
        if (this.customStartDate && this.customEndDate) {
          fromDate = new Date(this.customStartDate);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(this.customEndDate);
          toDate.setHours(23, 59, 59, 999);
        }
        break;

      case 'all':
        return { DATE_FROM: null, DATE_TO: null };
    }

    return {
      DATE_FROM: fromDate ? this.formatAsYYYYMMDD(fromDate) : null,
      DATE_TO: toDate ? this.formatAsYYYYMMDD(toDate) : null,
    };
  }

  private formatAsYYYYMMDD(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private formatAsDDMMYYYY(date: Date): string {
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  handleClose() {
    this.AddFixedAssetsPopupVisible = false;
    this.EditFixedAssetsPopupVisible = false;

    this.list_fixed_assets();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  ngOnInit() {
    this.sesstion_Details();
  }

  list_fixed_assets(range: string = this.selectedDateRange) {
    const datePayload = this.getDateRangePayload(range);

    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: datePayload.DATE_FROM,
      DATE_TO: datePayload.DATE_TO,
    };

    this.dataService.list_Fixed_Asset_api(payload).subscribe((res: any) => {
      this.FixedAssets = res.Data;
    });
  }

  displayExpr = (item: any) => {
    if (!item) return '';

    if (item.value === 'custom' && this.customStartDate && this.customEndDate) {
      const from = this.formatAsDDMMYYYY(new Date(this.customStartDate));
      const to = this.formatAsDDMMYYYY(new Date(this.customEndDate));
      return `${from} - ${to}`;
    }

    return item.label;
  };

  attachItemClickHandler(e: any) {
    setTimeout(() => {
      const popup = e.component?._popup;
      const innerList =
        popup && popup.$content().find('.dx-list').dxList('instance');

      if (innerList) {
        innerList.off('itemClick');
        innerList.on('itemClick', (clickEvent: any) => {
          if (clickEvent.itemData.value === 'custom') {
            this.customStartDate = null;
            this.customEndDate = null;
            this.showCustomDatePopup = true;
            e.component.close();
          }
        });
      }
    }, 0);
  }

  //=============onedit start==========================
  onEditFixedAssets(event: any) {
    event.cancel = true;
    this.EditFixedAssetsPopupVisible = true;
    const id = event.data.ID;
    this.fixedAssetId = event.data.ID;
    this.selectedFA = id;
    this.dataService.select_Fixed_Asset(id).subscribe((res: any) => {
      this.Selected_fixedAssets_data = res.Data;
    });
  }

  //========================Delete functionality========
  delete_FixedAssets_Data(event: any) {
    const id = event.data.ID;
    this.dataService.Delete_FixedAsset_Api(id).subscribe((res: any) => {
      notify(
        {
          message: 'This Fixed Asset date deleted successfully .',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success',
      );
    });
  }

  getStatusFlagClass(Status: string): string {
    return Status ? 'flag-red' : 'flag-green';
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.list_fixed_assets();
    }
  }
  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  onCustomDateApplied(e: any) {
    this.customStartDate = e.start;
    this.customEndDate = e.end;

    this.applyCustomDateFilter(); // your existing function
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    DxPopupModule,
    DxFormModule,
    DxRadioGroupModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxValidatorModule,
    ReactiveFormsModule,
    CommonModule,
    FixedAsstesEditModule,
    FixedAsstesAddModule,
    DxDateBoxModule,
    CustomDatePopupModule,
  ],
  providers: [],
  exports: [FixedAsstesListComponent],
  declarations: [FixedAsstesListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FixedAsstesListModule { }
