import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxDataGridComponent,
  DxDataGridModule,
  DxToolbarModule,
  DxButtonModule,
  DxPopupModule,
  DxFormModule,
  DxTextBoxModule,
  DxSelectBoxModule,
  DxCheckBoxModule,
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';
import { ExportService } from 'src/app/services/export.service';
import {
  SubDepartmentAddFormComponent,
  SubDepartmentAddFormModule,
} from '../../POPUP pages/sub-department-add-form/sub-department-add-form.component';
import { SubDepartmentEditFormModule } from '../../POPUP pages/sub-department-edit-form/sub-department-edit-form.component';
import { FormPopupModule } from 'src/app/components';
@Component({
  selector: 'app-sub-department',
  templateUrl: './sub-department.component.html',
  styleUrls: ['./sub-department.component.scss'],
})
export class SubDepartmentComponent implements OnInit {
  @ViewChild(SubDepartmentAddFormComponent)
  SubDepartmentComponent: SubDepartmentAddFormComponent;

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  SubDepartmentDataSource: DataSource;
  SubDepartmentArray: any[] = [];
  SubDepartmentCount = 0;
  DepartmentDropdownData: any;
  isAddSubDepartmentPopupOpened = false;
  showFilterRow = true;
  showHeaderFilter = true;
  editItemSubDepartment: boolean = false;
  selectedData: any;
  selected_data: any;
  selected_Company_id: any;
  COMPANY_ID: any;
  isFilterRowVisible: boolean = false;
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
      this.ngZone.run(() => this.addSubDepartment());
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
    onClick: () => {
      this.fetch_subdepartment_data_list();
    },
    text: '',
  };

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, //  global style
    onClick: () => this.toggleFilters(),
  };

  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private ngZone: NgZone,
    private router: Router,
  ) {
    this.sesstion_Details();
    this.fetch_subdepartment_data_list();
  }

  ngOnInit(): void {
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

    this.sesstion_Details();

    this.getDepartmentDropDown();
  }

  fetch_subdepartment_data_list() {
    this.dataservice.get_SubDepartment_Data().subscribe((res: any) => {
      if (res && res.flag === '1') {
        this.SubDepartmentDataSource = res.datas;
        this.SubDepartmentArray = res.datas;
      } else {
        notify(
          {
            message: 'data fetching failed..no data available',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
      }
    });
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }

  addSubDepartment() {
    this.isAddSubDepartmentPopupOpened = true;
  }

  onEditStart(event: any) {
    const id = event.data.ID;
    event.cancel = true;
    this.dataservice.select_subdepartment(id).subscribe((res: any) => {
      if (res.flag === '1') {
        this.selected_data = res.data;
        this.editItemSubDepartment = true;
      } else {
        this.editItemSubDepartment = true;
      }
    });
    this.editItemSubDepartment = true;
  }

  onClickSaveSubDepartment() {
    const { CODE, DESCRIPTION, DEPARTMENT_ID } =
      this.SubDepartmentComponent.getNewSubDepartmentData();

    const normalizedCode = CODE?.trim().toLowerCase();
    const normalizedDescription = DESCRIPTION?.trim().toLowerCase();

    const isCodeDuplicate = this.SubDepartmentArray.some(
      (item: any) => item.CODE?.trim().toLowerCase() === normalizedCode,
    );

    const isDescriptionDuplicate = this.SubDepartmentArray.some(
      (item: any) =>
        item.DESCRIPTION?.trim().toLowerCase() === normalizedDescription,
    );

    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and description already exist',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    }

    // if (isCodeDuplicate) {
    //   notify(
    //     {
    //       message: 'This Code already exists',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 1000,
    //     },
    //     'error',
    //   );
    //   return;
    // }

    // if (isDescriptionDuplicate) {
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
      .Save_SubDepartment_Data(CODE, DESCRIPTION, DEPARTMENT_ID)
      .subscribe((response) => {
        if (response) {
          this.isAddSubDepartmentPopupOpened = false;
          this.fetch_subdepartment_data_list();

          notify(
            {
              message: 'SubDepartment inserted successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1000,
            },
            'success',
          );
        }
      });
  }

  onRowRemoving(event) {
    const selectedRow = event.data;
    const ID = selectedRow.ID;

    this.dataservice.removeSubdepartment(ID).subscribe(() => {
      try {
        notify(
          {
            message: 'Delete Sub Department successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );
        this.fetch_subdepartment_data_list();
      } catch (error) {
        notify(
          {
            message: 'Delete Sub Department failed',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
      }
    });
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.COMPANY_ID = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  getDepartmentDropDown() {
    const dept_payload = {
      NAME: 'DEPT',
      COMPANY_ID: this.COMPANY_ID,
    };
    this.dataservice.getDropdownData(dept_payload).subscribe((data) => {
      this.DepartmentDropdownData = data;
    });
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
  };

  handleClose() {
    this.isAddSubDepartmentPopupOpened = false;
    this.editItemSubDepartment = false;
    this.fetch_subdepartment_data_list();
  }

  onExporting(event: any) {
    const fileName = 'sub department list';
    this.dataservice.exportDataGrid(event, fileName);
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxToolbarModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    DxFormModule,
    DxTextBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    SubDepartmentAddFormModule,
    SubDepartmentEditFormModule,
    CommonModule,
  ],
  providers: [],
  exports: [SubDepartmentComponent],
  declarations: [SubDepartmentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SubDepartmentModule { }
