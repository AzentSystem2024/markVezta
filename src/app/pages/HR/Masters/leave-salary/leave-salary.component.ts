import { CommonModule } from '@angular/common';
import { Component, NgModule, NgZone, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxFormModule,
  DxPopupModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { get } from 'http';
import { FormPopupModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-leave-salary',
  templateUrl: './leave-salary.component.html',
  styleUrls: ['./leave-salary.component.scss'],
})
export class LeaveSalaryComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  LeaveType: any[];

  formsource: FormGroup;
  selectedData: any = [];
  leavesalaryComponent: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter = true;
  isFilterRowVisible: boolean = false;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  constructor(
    private fb: FormBuilder,
    private dataservice: DataService,
    private ngZone: NgZone,
    private router: Router,
  ) {
    this.formsource = this.fb.group({
      CODE: ['', Validators.required],
      DESCRIPTION: ['', Validators.required],
      LEAVE_SALARY_PAYABLE: [false],
      IS_INACTIVE: [false],
    });
    this.get_LeaveTypeList();
  }

  getStatusFlagClass(status: string): string {
    return status === 'Inactive' ? 'flag-red' : 'flag-green';
  }

  AddLSPopup = false;
  UpdateLSPopup = false;
  Status: boolean = false;
  showFilterRow: boolean = true;
  currentFilter: string = 'auto';
  isFilterOpened = false;
  editingRowData: any = {}; // To store the selected row's data
  isLoading: boolean;

  addLeaveSalary() {
    this.formsource.reset({
      CODE: '',
      DESCRIPTION: '',
      LEAVE_SALARY_PAYABLE: false,
    });
    this.AddLSPopup = true;
  }

  updateLeaveSalary() {
    this.UpdateLSPopup = true;
  }

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };
  ngOnInit() {
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
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
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => {
      this.ngZone.run(() => this.refreshGrid());
    },
    text: '',
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.get_LeaveTypeList();
  }

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addLeaveSalary());
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

  onEditingStart(event: any) {
    event.cancel = true;

    const ID = event.data.ID;

    // this.editingRowData = { ...event.data }; // Store the selected row data
    this.UpdateLSPopup = true;
    this.Select_LeaveType(ID);
  }

  refresh = () => {
    this.dataGrid.instance.refresh();
  };

  // formatStatus(data:any){
  //   return data.IS_INACTIVE ?  'Inactive' : 'Active';

  //   }

  formatStatusPayable(data: any) {
    return data.LEAVE_SALARY_PAYABLE ? 'True' : 'False';
  }

  getSerialNumber = (rowIndex: number) => {
    return rowIndex + 1;
  };

  statusCellTemplate = (cellElement: any, cellInfo: any) => {
    const status = cellInfo.value; // Get the value from `calculateCellValue`
    const text = status; // Use the calculated value ("Inactive" or "Active")

    // Apply the dynamic styles and content
    cellElement.innerHTML = `
<span style="
  color: white;
  padding: 2px 3px;
  border-radius: 5px;
  display: inline-block;
  text-align: center;
  min-width: 60px;"
>
  ${text}
</span>`;
  };

  //===================get data list========================
  get_LeaveTypeList() {
    this.dataservice.get_LeaveType_Api().subscribe((res: any) => {
      if (res) {
        this.LeaveType = res.data.map((item: any, index: any) => ({
          ...item,
          SlNo: index + 1, // Assign serial number
        }));
      }
    });
  }

  //====================Add data=================

  Add_LeaveType() {
    const CODE = this.formsource.value.CODE?.trim();
    const DESCRIPTION = this.formsource.value.DESCRIPTION;
    const LEAVE_SALARY_PAYABLE = this.formsource.value.LEAVE_SALARY_PAYABLE;
    const IS_INACTIVE = this.formsource.value.IS_INACTIVE;

    const isDuplicate = this.LeaveType.some((data: any) => {
      return (
        data.DESCRIPTION?.toLowerCase().trim() ===
        DESCRIPTION?.toLowerCase().trim() ||
        data.CODE?.toLowerCase().trim() === CODE?.toLowerCase().trim()
      );
    });

    this.formsource.reset();
    if (isDuplicate) {
      notify(
        {
          message: 'Data already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );

      return;
    }
    this.formsource.reset();

    if (CODE && DESCRIPTION) {
      this.dataservice
        .Insert_LeaveType_Api(
          CODE,
          DESCRIPTION,
          LEAVE_SALARY_PAYABLE,
          IS_INACTIVE,
        )
        .subscribe((response) => {
          notify(
            {
              message: 'Data succesfully added',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );
          this.AddLSPopup = false;
          this.formsource.reset();
          this.get_LeaveTypeList();
        });
    } else {
      notify(
        {
          message: 'Please fill the fields',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );
    }
    this.get_LeaveTypeList();
  }

  //==============Edit data===================

  Edit_LeaveType() {
    const CODE = this.selectedData.CODE;
    const DESCRIPTION = this.selectedData.DESCRIPTION;
    const IS_INACTIVE = this.selectedData.IS_INACTIVE;
    const LEAVE_SALARY_PAYABLE = this.selectedData.LEAVE_SALARY_PAYABLE;
    const ID = this.selectedData.ID;

    const isDuplicate = this.LeaveType.some((data: any) => {
      if (data.ID === ID) return false;
      return (
        (data.DESCRIPTION?.toLowerCase() || '') ===
        (DESCRIPTION?.trim().toLowerCase() || '') ||
        (data.CODE?.toLowerCase() || '') === (CODE?.trim().toLowerCase() || '')
      );
    });
    this.formsource.reset();
    if (isDuplicate) {
      this.get_LeaveTypeList();
      notify(
        {
          message: 'Data already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );

      return;
    }

    if (CODE && DESCRIPTION) {
      this.dataservice
        .Update_LeaveType_Api(
          CODE,
          DESCRIPTION,
          IS_INACTIVE,
          LEAVE_SALARY_PAYABLE,
          ID,
        )
        .subscribe((response) => {
          notify(
            {
              message: 'Data succesfully added',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );

          this.UpdateLSPopup = false;

          this.get_LeaveTypeList();
        });
    } else {
      notify(
        {
          message: 'Please fill the fields',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error',
      );
      this.AddLSPopup = false;
      this.get_LeaveTypeList();
    }
  }

  //============select data========================
  Select_LeaveType(event: any) {
    const ID = event;
    this.dataservice.Select_LeaveType_Api(ID).subscribe((response: any) => {
      this.selectedData = response;
    });
  }

  //==========Delete data==============

  delete_LeaveType(event: any) {
    const ID = event.data.ID;
    this.dataservice.Delete_LeaveType_Api(ID).subscribe((response: any) => {
      notify(
        {
          message: 'Data Deleted succesfully',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success',
      );
      this.get_LeaveTypeList();
    });
  }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    FormPopupModule,
    DxFormModule,
    DxPopupModule,
    CommonModule,
    DxTextBoxModule,
  ],
  providers: [],
  exports: [],
  declarations: [LeaveSalaryComponent],
})
export class LeaveSalaryModule { }
