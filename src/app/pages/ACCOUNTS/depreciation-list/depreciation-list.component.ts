// import { Component } from '@angular/core';

import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  NgModule,
  NgZone,
  Output,
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
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
import {
  DepreciationAddComponent,
  DepreciationAddModule,
} from '../../Depreciation/depreciation-add/depreciation-add.component';
import { DepreciationEditModule } from '../../Depreciation/depreciation-edit/depreciation-edit.component';
import { Router } from '@angular/router';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';

@Component({
  selector: 'app-depreciation-list',
  templateUrl: './depreciation-list.component.html',
  styleUrls: ['./depreciation-list.component.scss'],
})
export class DepreciationListComponent {
  @ViewChild(DepreciationAddComponent)
  DepreciationAddComponent!: DepreciationAddComponent;
  Depreciation_List: any;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  isFilterRowVisible: boolean = false;
  AddDepreciationPopupVisible: boolean = false;
  EditDepreciationPopupVisible: boolean = false;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  //==============date filter===================
  customLabel = 'Custom';
  customStartDate: any = null;
  customEndDate: any = null;
  startDate: Date;
  EndDate: Date;
  showCustomDatePopup = false;
  selectedDateRange: string = 'today';
  canVerify: boolean = false
  StatusType: any
  dateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 15 Days', value: 'last15' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'All', value: 'all' },
    // { label: 'Custom', value: 'custom' },
    { label: this.customLabel, value: 'custom' },
  ];

  getStatusFilterData = [
    {
      text: 'Approved',
      value: 'Approved',
    },
    {
      text: 'Open',
      value: 'Open',
    },
    {
      text: 'Verified',
      value: 'Verified',
    },
  ];

  gridButtons = [
    'edit',
    {
      name: 'delete',
      visible: (e: any) => e.row?.data?.TRANS_STATUS == '1',
    },
  ];

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
      this.ngZone.run(() => this.addDepreciation());
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
  allDepreciationLid: any;
  DepreciationId: any;
  selectedDepreciation: any;
  selected_Company_id: any;
  statusId: any;

  addDepreciation() {
    this.AddDepreciationPopupVisible = true;
    this.DepreciationAddComponent.Active_fixedasset_List();
    this.DepreciationAddComponent.SetDefaultRest();
  }

  constructor(
    private dataService: DataService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    if (this.selectedDateRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      this.startDate = new Date(today);
      this.EndDate = new Date(today);

    }

    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      console.log(packingRights, '=====================================')
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.CanView;
      this.canApprove = packingRights.CanApprove;
      this.canVerify = packingRights.CanVerify;

    }
    this.sesstion_Details();


  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  private formatAsDDMMYYYY(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getStatusFlagClass(Status: string): string {
    return Status == '1' ? 'flag-oranged' : 'flag-green';
  }
  //=========================Depreciation======================
  onEditDepreciation(event: any) {
    event.cancel = true;
    this.EditDepreciationPopupVisible = true;
    this.DepreciationAddComponent.Active_fixedasset_List();
    const id = event.data.TRANS_ID;
    this.DepreciationId = event.data.ID;
    this.selectedDepreciation = id;
    this.StatusType = 'Editscreen'
    this.dataService.select_Depreciation_Asset(id).subscribe((res: any) => {
      this.Selected_Depreciation_data = res.Data;
    });
  }
  delete_Depreciation_Data(event: any) {
    const id = event.data.ID;
    this.dataService.Delete_Depreciation_Asset(id).subscribe((res: any) => {
      notify(
        {
          message: ' Dpreciation Deleted succssfully         .',
          position: { at: 'top right', my: 'top right' },
          displayTime: 2000,
        },
        'success',
      );
      return;

      // import notify from 'devextreme/ui/notify';
    });
  }
  handleClose() {
    this.AddDepreciationPopupVisible = false;
    this.EditDepreciationPopupVisible = false;
    this.get_Depreciation_list();
  }
  Selected_Depreciation_data() { }
  statusCellRender(cellElement: any, cellInfo: any) {
    console.log(cellInfo, '==========cellInfo==============')
    const status = cellInfo.data.TRANS_STATUS;

    const icon = document.createElement('i');
    icon.className = 'fas fa-flag'; // Font Awesome flag icon
    icon.style.fontSize = '18px';
    icon.style.color =
      status === '5'
        ? '#10B981' // Approved
        : status === '2'
          ? '#0073D8' // Verified
          : '#FFA500'; // Open
    icon.title = status === '5' ? 'Approved' : status === '2' ? 'Verified' : 'Open';

    icon.style.display = 'flex';
    icon.style.justifyContent = 'center';
    icon.style.alignItems = 'center';

    cellElement.appendChild(icon);
  }

  onDateRangeChanged(e: any) {
    const today = new Date();
    this.selectedDateRange = e.value;
    if (this.selectedDateRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      this.startDate = new Date(today);
      this.EndDate = new Date(today);
    } else if (this.selectedDateRange === 'all') {
      this.get_Depreciation_list();
    } else if (this.selectedDateRange === 'last7') {
      this.startDate = new Date(today);
      this.startDate.setDate(today.getDate() - 6);
      this.EndDate = new Date(today);
    } else if (this.selectedDateRange === 'last15') {
      this.startDate = new Date(today);
      this.startDate.setDate(today.getDate() - 14);
      this.EndDate = new Date(today);
    } else if (this.selectedDateRange === 'last30') {
      this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      this.EndDate = new Date(today);
    } else if (this.selectedDateRange === 'lastMonth') {
      const lastMonth = today.getMonth() - 1;
      this.startDate = new Date(today.getFullYear(), lastMonth, 1);
      this.EndDate = new Date(today.getFullYear(), today.getMonth(), 0);
    } else {
      this.showCustomDatePopup = true;
    }

    this.get_Depreciation_list();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '');
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.get_Depreciation_list();
  }
  ngOnInit() {
  }

  get_Depreciation_list() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.list_Depreciation_api(payload).subscribe((res: any) => {
      const allData = res.Data;
      const dateField = 'DEPR_DATE';

      // If 'all' is selected, skip filtering
      if (this.selectedDateRange === 'all') {
        this.Depreciation_List = allData;
      } else {
        const start = new Date(this.startDate);
        const end = new Date(this.EndDate);
        end.setHours(23, 59, 59, 999);

        console.log('-----today data-------------------')
        console.log(start, end)
        this.Depreciation_List = allData.filter((item: any) => {
          const itemDate = new Date(item[dateField]);
          return itemDate >= start && itemDate <= end;
        });
      }
    });
  }
  applyCustomDateFilter() {
    const start = new Date(this.customStartDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(this.customEndDate);
    end.setHours(23, 59, 59, 999);

    // ✅ Save to global variables
    this.startDate = start;
    this.EndDate = end;

    // Filter immediately
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.list_Depreciation_api(payload).subscribe((res: any) => {
      const allData = res.Data;
      this.Depreciation_List = allData.filter((item: any) => {
        const itemDate = new Date(item.DEPR_DATE);
        return itemDate >= start && itemDate <= end;
      });
    });

    // ✅ Update custom label
    const fromLabel = this.formatAsDDMMYYYY(start);
    const toLabel = this.formatAsDDMMYYYY(end);
    this.customLabel = `${fromLabel} to ${toLabel}`;

    // ✅ Reassign array to trigger change detection
    this.dateRanges = [
      { label: 'Today', value: 'today' },
      { label: 'Last 7 Days', value: 'last7' },
      { label: 'Last 15 Days', value: 'last15' },
      { label: 'Last 30 Days', value: 'last30' },
      { label: 'All', value: 'all' },
      { label: this.customLabel, value: 'custom' },
    ];

    // ✅ Keep the selected value
    this.selectedDateRange = 'custom';

    this.showCustomDatePopup = false;
  }


  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.get_Depreciation_list();
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

  onVerifyClick(e: any) {
    this.EditDepreciationPopupVisible = true;
    this.DepreciationAddComponent.Active_fixedasset_List();
    const id = e.row.data.TRANS_ID;
    this.DepreciationId = e.row.data.ID;
    this.selectedDepreciation = id;
    this.StatusType = 'verifyscreen'
    this.statusId = e.row.data.TRANS_STATUS

    this.dataService.select_Depreciation_Asset(id).subscribe((res: any) => {
      this.Selected_Depreciation_data = res.Data;
    });
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
    DxDateBoxModule,
    DxValidationGroupModule,
    DepreciationAddModule,
    DepreciationEditModule,
    CommonModule,
    CustomDatePopupModule,
  ],
  providers: [],
  exports: [DepreciationListComponent],
  declarations: [DepreciationListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DepreciationListModule { }

// DepreciationListComponent
