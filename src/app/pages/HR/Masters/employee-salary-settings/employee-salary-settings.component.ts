import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import {
  DxButtonModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

import { formatDate } from '@angular/common'; // ✅ at the top
import {
  EmployeeSalarySettingsAddComponent,
  EmployeeSalarySettingsAddModule,
} from '../../../../components/HR/Masters/employee-salary-settings-add/employee-salary-settings-add.component';
import { EmployeeSalarySettingsEditModule } from '../../../../components/HR/Masters/employee-salary-settings-edit/employee-salary-settings-edit.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-salary-settings',
  templateUrl: './employee-salary-settings.component.html',
  styleUrls: ['./employee-salary-settings.component.scss'],
})
export class EmployeeSalarySettingsComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent | undefined;
  @ViewChild(EmployeeSalarySettingsAddComponent)
  EmployeeSalarySettingsAddComponent!: EmployeeSalarySettingsAddComponent;

  @ViewChild('formValidationGroup', { static: false })
  formValidationGroup: DxValidationGroupComponent | undefined;

  @ViewChild(DxDataGridComponent, { static: true })
  EmployeeSalarySettingsDatasource: any[] = [];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  addEmployeePopupOpened: boolean = false;
  editEmployeePopupOpened: boolean = false;
  filterOptions = [
    { text: 'All', value: 6 },
    { text: 'Pending', value: 5 },
    { text: 'Latest', value: 4 },
  ];

  selectedFilterAction: number = 4; // default is "All"

  selectedEmployeeId: any;
  selectedEmployee: any;
  PreviousRevision: any;
  employeeFormData: any;
  selectedRows: any[] | undefined;
  salaryGridData: any;
  SalaryDetails: any[] = [];
  effectFromRaw: any;
  previousEffectFrom: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  selected_Company_id: any;

 
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
      this.selectedFilterAction = e.value;
      this.getEmployeeSalarySettingsList();
    },
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilterRow(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  isFilterRowVisible: boolean = false;
  isFilterOpened: boolean = false;

  onExporting(event: any) {
    const fileName = 'Credit_Note';
    this.dataservice.exportDataGrid(event, fileName);
  }

  constructor(
    private dataservice: DataService,
    private ngZone: NgZone,
    private router: Router,
  ) { }


  
  ngOnInit() {
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
    this.sesstion_Details();
    this.getEmployeeSalarySettingsList(); // call API on load with default filter
  }

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


  formatMonthYear = (date: Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.getEmployeeSalarySettingsList();
    }
  }

  toggleFilterRow() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  addEmployee() {
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });

    const matched = this.EmployeeSalarySettingsDatasource.find(
      (item: any) => item.EMP_ID === this.selectedEmployeeId,
    );

    if (this.EmployeeSalarySettingsAddComponent) {
      this.EmployeeSalarySettingsAddComponent.EmployeeSalarySettingsDatasource =
        matched || {};
      this.EmployeeSalarySettingsAddComponent.batchId =
        matched?.BATCH_ID || null;
    }
    this.addEmployeePopupOpened = true;
  }

  onFormClosed(event: any) {
    this.addEmployeePopupOpened = false;
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });
  }

  getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 1-based
    const day = '01'; // Always first day
    return `${year}-${month}-${day}`; // Format: YYYY-MM-DD
  }

  onEditEmployee(e: any) {
    e.cancel = true;
    const employeeId = e.data.ID;
    const EffectFrom = e.data.EFFECT_FROM;
    const BatchId = e.data.BATCH_ID;
    this.editEmployeePopupOpened = true;
    //  Format EFFECT_FROM to 'yyyy-MM-dd'
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

        this.effectFromRaw = this.selectedEmployee.EFFECT_FROM;

        this.previousEffectFrom = this.selectedEmployee.PREVIOUS_EFFECT_FROM;
      });
  }

  handleEditClose(event: any) {
    this.editEmployeePopupOpened = false;
    this.getEmployeeSalarySettingsList();
    this.selectedEmployee = null;
    this.PreviousRevision = null;
    this.selectedRows = [];
    this.salaryGridData = [];

    this.SalaryDetails = [];
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });
  }

  handleClose() {
    this.addEmployeePopupOpened = false;
    this.getEmployeeSalarySettingsList();
    if (this.EmployeeSalarySettingsAddComponent) {
      this.EmployeeSalarySettingsAddComponent.resetForm();
    }
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  getEmployeeSalarySettingsList() {
    const payload = {
      CompanyId: this.selected_Company_id,
      FilterAction: Number(this.selectedFilterAction), // Ensure it's a number
    };
    this.dataservice
      .getEmployeeSalarySettingsList(payload)
      .subscribe((response: any) => {
        this.EmployeeSalarySettingsDatasource = response.Data || [];
      });
  }

  onPopupHiding() {
    this.addEmployeePopupOpened = false;

    // Optionally reset child component if needed
    // You can use @ViewChild to get the component reference:
    // this.employeeSalaryAddComponentRef?.resetForm();
  }

  DeleteEmployeeSalarySettings(event: any) {
    const BatchId = event.data.BATCH_ID;
    //   const id=event.data.ID
    // const EffectFrom = event.data.EFFECT_FROM
    // const formattedEffectFrom = formatDate(EffectFrom, 'yyyy-MM-dd', 'en-US');
    //   const payload ={
    //     EMP_ID : id,
    //     EFFECT_FROM : formattedEffectFrom
    //   }
    this.dataservice
      .Delete_EmployeeSalarySettings_Api(BatchId)
      .subscribe((res: any) => {
        this.getEmployeeSalarySettingsList();
        // this.dataGrid.instance.refresh();
        notify(
          {
            message: 'Data succesfully deleted',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success',
        );
      });
  }
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
    DxButtonModule,
    DxValidationGroupModule,
    EmployeeSalarySettingsEditModule,
    EmployeeSalarySettingsAddModule,
  ],
  providers: [],
  declarations: [EmployeeSalarySettingsComponent],
  exports: [EmployeeSalarySettingsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmployeeSalarySettingsModule { }
