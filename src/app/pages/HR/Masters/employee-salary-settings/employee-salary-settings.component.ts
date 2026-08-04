import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';

import {
  DxButtonModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';

import { DataService } from 'src/app/services';
import {
  EmployeeSalarySettingsAddComponent,
  EmployeeSalarySettingsAddModule,
} from '../../../../components/HR/Masters/employee-salary-settings-add/employee-salary-settings-add.component';
import { EmployeeSalarySettingsEditModule } from '../../../../components/HR/Masters/employee-salary-settings-edit/employee-salary-settings-edit.component';
import { ExportService } from 'src/app/services/export.service';

@Component({
  selector: 'app-employee-salary-settings',
  templateUrl: './employee-salary-settings.component.html',
  styleUrls: ['./employee-salary-settings.component.scss'],
})
export class EmployeeSalarySettingsComponent implements OnInit {
  // ==================== ViewChildren ====================
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent | undefined;

  @ViewChild('salarySettings')
  salarySettings!: EmployeeSalarySettingsAddComponent;

  @ViewChild(EmployeeSalarySettingsAddComponent)
  EmployeeSalarySettingsAddComponent!: EmployeeSalarySettingsAddComponent;

  // ==================== Component State ====================
  EmployeeSalarySettingsDatasource: any[] = [];
  selectedEmployee: any;

  // UI State
  displayMode: any = 'full';
  showPageSizeSelector: boolean = true;
  addEmployeePopupOpened: boolean = false;
  editEmployeePopupOpened: boolean = false;
  isFilterOpened: boolean = false;
  isReadOnly: boolean = false;

  // Permissions
  canAdd: boolean = false;
  canEdit: boolean = false;
  canView: boolean = false;
  canDelete: boolean = false;
  canApprove: boolean = false;
  canPrint: boolean = false;

  // Filters & Settings
  selectedFilterAction: number = 4; // default is "Latest"
  filterOptions = [
    { text: 'All', value: 6 },
    { text: 'Pending', value: 5 },
    { text: 'Latest', value: 4 },
  ];
  selected_Company_id: any;

  // ==================== Constructor ====================
  constructor(
    private dataservice: DataService,
    private ngZone: NgZone,
    private router: Router,
    private exportService: ExportService,
  ) { }

  // ==================== Lifecycle Hooks ====================
  ngOnInit() {
    this.checkPermissions();
    this.sesstion_Details();
    this.getEmployeeSalarySettingsList();
  }

  // ==================== Initialization & Data Loading ====================
  checkPermissions() {
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
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY?.COMPANY_ID;
  }

  getEmployeeSalarySettingsList() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.beginCustomLoading('Loading...');
    }

    const payload = {
      CompanyId: this.selected_Company_id,
      FilterAction: Number(this.selectedFilterAction),
    };

    this.dataservice.getEmployeeSalarySettingsList(payload).subscribe({
      next: (response: any) => {
        this.EmployeeSalarySettingsDatasource = response.Data || [];
        if (this.dataGrid?.instance) {
          this.dataGrid.instance.endCustomLoading();
        }
      },
      error: (err: any) => {
        if (this.dataGrid?.instance) {
          this.dataGrid.instance.endCustomLoading();
        }
      },
    });
  }

  // ==================== UI Options ====================
  filterSelectBoxOptions = {
    items: this.filterOptions,
    displayExpr: 'text',
    valueExpr: 'value',
    value: this.selectedFilterAction,
    width: 220,
    label: 'Select',
    labelMode: 'floating',
    searchEnabled: true,
    onValueChanged: (e: any) => {
      this.ngZone.run(() => {
        this.selectedFilterAction = e.value;
        this.filterSelectBoxOptions.value = e.value;
        this.getEmployeeSalarySettingsList();
        if (this.dataGrid?.instance) {
          this.dataGrid.instance.repaint();
        }
      });
    },
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilterRow(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };


  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addEmployee());
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

  onExporting(event: any) {
    this.exportService.onExporting(event, 'Employee Salary Settings');
  }


  // ==================== Event Handlers ====================
  isEditAllowed = (e: any) => {
    if (this.selectedFilterAction === 5) {
      return false; // Disable when Pending is selected
    }
    return this.canEdit;
  };

  isDeleteAllowed = (e: any) => {
    if (this.selectedFilterAction === 5) {
      return false; // Disable when Pending is selected
    }
    return this.canDelete;
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      this.getEmployeeSalarySettingsList();
    }
  }

  toggleFilterRow() {
    this.isFilterOpened = !this.isFilterOpened;
    const grid = this.dataGrid?.instance;
    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  addEmployee() {
    if (this.EmployeeSalarySettingsAddComponent) {
      this.EmployeeSalarySettingsAddComponent.EmployeeSalarySettingsDatasource =
        {};
      this.EmployeeSalarySettingsAddComponent.batchId = null;
    }
    this.addEmployeePopupOpened = true;
  }

  handleClose() {
    this.addEmployeePopupOpened = false;
    this.getEmployeeSalarySettingsList();
    if (this.EmployeeSalarySettingsAddComponent) {
      this.EmployeeSalarySettingsAddComponent.resetForm();
    }
    if (this.salarySettings) {
      this.salarySettings.resetForm();
    }
  }

  onEditEmployee(e: any) {
    e.cancel = true;
    const employeeId = e.data.ID;
    const empCode = e.data.EMP_CODE;
    const EffectFrom = e.data.EFFECT_FROM;
    const BatchId = e.data.BATCH_ID;
    this.editEmployeePopupOpened = true;

    if (Number(this.selectedFilterAction) !== 6) {
      this.isReadOnly = false;
    } else {
      const allRecordsForEmp = this.EmployeeSalarySettingsDatasource.filter(
        (item) => item.EMP_CODE === empCode,
      );

      let isLatest = true;
      if (allRecordsForEmp.length > 0) {
        allRecordsForEmp.sort((a, b) => {
          return (b.BATCH_ID || 0) - (a.BATCH_ID || 0);
        });
        isLatest = allRecordsForEmp[0].BATCH_ID === BatchId;
      }
      this.isReadOnly = !isLatest;
    }

    const formattedEffectFrom = formatDate(EffectFrom, 'yyyy-MM-dd', 'en-US');
    const payload = {
      EMP_ID: employeeId,
      EFFECT_FROM: formattedEffectFrom,
      BATCH_ID: BatchId,
    };

    this.dataservice
      .Select_EmployeeSalarySettings_Api(payload)
      .subscribe((response: any) => {
        this.selectedEmployee = response.Data[0];
      });
  }

  handleEditClose(event?: any) {
    this.editEmployeePopupOpened = false;
    this.getEmployeeSalarySettingsList();
    this.selectedEmployee = null;
    if (this.salarySettings) {
      this.salarySettings.resetForm();
    }
  }

  DeleteEmployeeSalarySettings(event: any) {
    const BatchId = event.data.BATCH_ID;
    this.dataservice
      .Delete_EmployeeSalarySettings_Api(BatchId)
      .subscribe((res: any) => {
        this.getEmployeeSalarySettingsList();
        notify(
          {
            message: 'Data successfully deleted',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'success',
        );
      });
  }

  // ==================== Formatting & Utilities ====================
  formatMonthYear = (date: Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };
}

@NgModule({
  imports: [
    DxSelectBoxModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    DxDataGridModule,
    DxButtonModule,
    DxValidatorModule,
    DxPopupModule,
    DxValidationGroupModule,
    EmployeeSalarySettingsEditModule,
    EmployeeSalarySettingsAddModule,
  ],
  declarations: [EmployeeSalarySettingsComponent],
  exports: [EmployeeSalarySettingsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmployeeSalarySettingsModule { }
