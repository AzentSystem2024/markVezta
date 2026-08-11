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
import { confirm } from 'devextreme/ui/dialog';
import { FormPopupModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-leave-salary',
  templateUrl: './leave-salary.component.html',
  styleUrls: ['./leave-salary.component.scss'],
})
export class LeaveSalaryComponent {
  // VIEW CHILD & UI COMPONENTS
  // ==========================================
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;

  // STATE FLAGS & CONFIGURATIONS
  // ==========================================
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter = true;
  isFilterRowVisible: boolean = false;
  isFilterOpened = false;

  AddLSPopup = false;
  UpdateLSPopup = false;

  // PERMISSIONS
  // ==========================================
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  // DATA SOURCES
  // ==========================================
  LeaveType: any[] = [];
  selectedData: any = [];

  // FORM VARIABLES
  // ==========================================
  formsource: FormGroup;

  // GRID CONFIGURATION
  // ==========================================
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



  // CONSTRUCTOR
  // ==========================================
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

  // LIFECYCLE HOOKS
  // ==========================================
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
  }

  // GRID ACTIONS & FILTERS
  // ==========================================
  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;
    const grid = this.dataGrid?.instance;
    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
    }
    this.get_LeaveTypeList();
  }

  // UTILITIES & RENDERERS
  // ==========================================
  getStatusFlagClass(status: string): string {
    return status === 'Inactive' ? 'flag-red' : 'flag-green';
  }

  formatStatusPayable(data: any) {
    return data.LEAVE_SALARY_PAYABLE ? 'True' : 'False';
  }

  getSerialNumber = (rowIndex: number) => {
    return rowIndex + 1;
  };

  statusCellTemplate = (cellElement: any, cellInfo: any) => {
    const status = cellInfo.value;
    const text = status;
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

  // POPUP CONTROLS
  // ==========================================
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

  onEditingStart(event: any) {
    event.cancel = true;
    const ID = event.data.ID;
    this.UpdateLSPopup = true;
    this.Select_LeaveType(ID);
  }

  // CRUD OPERATIONS
  // ==========================================
  get_LeaveTypeList() {
    this.dataservice.get_LeaveType_Api().subscribe((res: any) => {
      if (res) {
        this.LeaveType = res.data.map((item: any, index: any) => ({
          ...item,
          SlNo: index + 1,
        }));
      }
    });
  }

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

  Select_LeaveType(event: any) {
    const ID = event;
    this.dataservice.Select_LeaveType_Api(ID).subscribe((response: any) => {
      this.selectedData = response;
    });
  }

  delete_LeaveType(event: any) {
    // We use a Promise so the DataGrid waits for the API to resolve before removing the row locally
    event.cancel = new Promise<void>((resolve, reject) => {
      const dialog = confirm(
        'Are you sure you want to delete this Leave Type?',
        'Confirm Deletion',
      );

      dialog.then((dialogResult) => {
        if (dialogResult) {
          const ID = event.data.ID;
          this.dataservice.Delete_LeaveType_Api(ID).subscribe({
            next: (response: any) => {
              notify(
                {
                  message: 'Data Deleted successfully',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success',
              );
              this.get_LeaveTypeList();
              resolve(); // Allow grid to remove the row
            },
            error: (err: any) => {
              notify(
                {
                  message: 'Failed to delete data. It may be in use.',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 2000,
                },
                'error',
              );
              reject(); // Prevent grid from removing row
            },
          });
        } else {
          reject(); // User cancelled the confirmation
        }
      });
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
