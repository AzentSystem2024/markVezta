import {
  Component,
  OnInit,
  NgModule,
  ViewChild,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import notify from 'devextreme/ui/notify';
import { DxPopupModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { ExportService } from 'src/app/services/export.service';
import { Router } from '@angular/router';
import {
  DepartmentMeAddFormModule,
  DepartmentMeAddFormComponent,
} from '../POPUP PAGES/department-me-add-form/department-me-add-form.component';
import { DepartmentMeEditFormModule } from '../POPUP PAGES/department-me-edit-form/department-me-edit-form.component';
@Component({
  selector: 'app-department-me',
  templateUrl: './department-me.component.html',
  styleUrls: ['./department-me.component.scss'],
})
export class DepartmentMeComponent implements OnInit {
  @ViewChild(DepartmentMeAddFormComponent)
  departmentComponent: DepartmentMeAddFormComponent | undefined;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent | undefined;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  department: any;
  selectedDepartment_data: any;
  isAddDepartmentPopupOpened = false;
  isEditDepartmentPopupOpened = false;
  updateEventData: any;
  showFilterRow = true;
  showHeaderFilter = true;
  isFilterRowVisible: boolean = false;
  COMPANY_ID: any;
  sessionData: any;
  COMPANY_NAME: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  isFilterOpened = false;

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addDepartment());
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

  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    this.sesstion_Details();
    this.showDepartment();
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
    this.showDepartment();
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  addDepartment() {
    this.isAddDepartmentPopupOpened = true;
    this.departmentComponent?.resetButton();
  }
  
  onExporting(event: any) {
    this.exportService.onExporting(event, 'Department-list');
  }

  OnEditingStart(event: any) {
    event.cancel = true;
    this.isEditDepartmentPopupOpened = true;
    this.SelectDepartment(event);
  }

  SelectDepartment(event: any) {
    const id = event.data.ID;

    this.dataservice.Select_Department_Api(id).subscribe((res: any) => {
      this.selectedDepartment_data = res.data;
    });
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  showDepartment() {
    const payload = {
      COMPANY_ID: this.COMPANY_ID,
    };
    this.dataservice.get_Department_List(payload).subscribe((response: any) => {
      this.department = response.datas;
    });
  }

  sesstion_Details() {
    this.sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.COMPANY_ID = String(this.sessionData.SELECTED_COMPANY.COMPANY_ID);
    this.COMPANY_NAME = this.sessionData.SELECTED_COMPANY.COMPANY_NAME;
  }

  onClickSaveDepartment() {
    const newDeptData = this.departmentComponent?.getNewDepartmentData();

    if (!newDeptData) return;

    const { CODE = '', DEPT_NAME = '', COST_BUCKET_ID } = newDeptData;

    const COMPANY_ID = this.COMPANY_ID;
    // Check for duplicates in CategoryList
    const isCodeDuplicate = this.department.some(
      // (item: any) => item.CODE === commonDetails.code
      (item: any) => item.CODE.toLowerCase() === CODE.toLowerCase(),
    );

    const isDescriptionDuplicate = this.department.some(
      // (item: any) => item.DESCRIPTION === commonDetails.category
      (item: any) => item.DEPT_NAME.toLowerCase() === DEPT_NAME.toLowerCase(),
    );

    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and Department already exist',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    } 
    // else if (isCodeDuplicate) {
    //   notify(
    //     {
    //       message: 'This Code already exists',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 1000,
    //     },
    //     'error',
    //   );
    //   return;
    // } else if (isDescriptionDuplicate) {
    //   notify(
    //     {
    //       message: 'This Description already exists',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 1000,
    //     },
    //     'error',
    //   );
    //   return;
    // }

    this.dataservice
      .Insert_Department_Me_Api(CODE, DEPT_NAME, COMPANY_ID, COST_BUCKET_ID)
      .subscribe((response) => {
        if (response) {
          this.showDepartment();
          this.isAddDepartmentPopupOpened = false;
          this.departmentComponent?.resetButton();
          notify(
            {
              message: 'Department Updated successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1000,
            },
            'success',
          );
          this.departmentComponent?.resetButton();
        }
      });
  }

  onRowRemoving(event: any) {
    const SelectedRow = event.key;
    const id = SelectedRow.ID;

    this.dataservice.Delete_Department_Api(id).subscribe(
      (res: any) => {
        if (res?.flag === '1') {
          // Success
          notify(
            {
              message: 'Deleted operation successful',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );

          this.dataGrid?.instance.refresh();
          this.showDepartment();
        } else {
          // API responded but failed
          notify(
            {
              message: res?.message || 'Delete operation failed',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );

          // Prevent row removal in UI
          event.cancel = true;
        }
      },
      (error) => {
        // API error (network/server)
        notify(
          {
            message: 'Something went wrong while deleting',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );

        // Prevent row removal in UI
        event.cancel = true;
      },
    );
  }

  handleClose() {
    this.showDepartment();
    this.isAddDepartmentPopupOpened = false;
    this.isEditDepartmentPopupOpened = false;
  }

  onClickUpdateDepartment(updatedData: any) {
    this.isAddDepartmentPopupOpened = false;
  }

  ngOnInit(): void {
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

    this.showDepartment();
  }

  refresh = () => {
    this.dataGrid?.instance.refresh();
    this.showDepartment();
  };
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    DepartmentMeAddFormModule,
    DepartmentMeEditFormModule,
  ],
  providers: [],
  exports: [],
  declarations: [DepartmentMeComponent],
})
export class DepartmentMeModule { }
