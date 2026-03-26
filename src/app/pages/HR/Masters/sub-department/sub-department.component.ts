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
  categoryComponent: SubDepartmentAddFormComponent;

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  CategoryDataSource: DataSource;
  categoryArray: any[] = [];
  categoryCount = 0;
  DepartmentDropdownData: any;
  isAddCategoryPopupOpened = false;
  showFilterRow = true;
  showHeaderFilter = true;
  editItemCategory: boolean = false;
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
      this.ngZone.run(() => this.addCategory());
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
      this.ngZone.run(() => this.refreshGrid());
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
      .find((menu) => menu.Path === '/user');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }

    this.sesstion_Details();

    this.getDepartmentDropDown();
  }

  fetch_subdepartment_data_list() {
    this.dataservice.get_SubDepartment_Data().subscribe((res: any) => {
      if (res && res.flag === '1') {
        this.CategoryDataSource = res.datas;
      } else {
        notify(
          {
            message: 'data failing failed..',
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

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
  }

  addCategory() {
    this.isAddCategoryPopupOpened = true;
  }

  onEditStart(event: any) {
    event.cancel = true;
    this.editItemCategory = true;
    const id = event.data.ID;

    this.dataservice.select_category(id).subscribe((res: any) => {
      this.selected_data = res;
    });
  }

  onClickSaveCategory() {
    const { CODE, DESCRIPTION, DEPARTMENT_ID } =
      this.categoryComponent.getNewCategoryData();
    // Check for duplicates in CategoryList
    const isCodeDuplicate = this.categoryArray.some(
      // (item: any) => item.CODE === commonDetails.code
      (item: any) => item.CODE.toLowerCase() === CODE.toLowerCase(),
    );

    const isDescriptionDuplicate = this.categoryArray.some(
      // (item: any) => item.DESCRIPTION === commonDetails.category
      (item: any) =>
        item.DESCRIPTION.toLowerCase() === DESCRIPTION.toLowerCase(),
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
    } else if (isCodeDuplicate) {
      notify(
        {
          message: 'This Code already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    } else if (isDescriptionDuplicate) {
      notify(
        {
          message: 'This Description already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    }

    this.dataservice
      .Save_SubDepartment_Data(CODE, DESCRIPTION, DEPARTMENT_ID)
      .subscribe((response) => {
        if (response) {
          this.isAddCategoryPopupOpened = false;
          notify(
            {
              message: 'This Item Category inserted successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1000,
            },
            'success',
          );
          return;
        }
      });
  }

  onRowRemoving(event) {
    const selectedRow = event.data;
    const ID = selectedRow.ID;

    this.dataservice.removeSubdepartment(ID).subscribe(() => {
      try {
        // Your delete logic here
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );
        this.dataGrid.instance.refresh();
      } catch (error) {
        notify(
          {
            message: 'Delete operation failed',
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
    const dropdowndepartment = 'DEPARTMENT';
    this.dataservice
      .getDropdownData(dropdowndepartment)
      .subscribe((data: any) => {
        this.DepartmentDropdownData = data;
      });
  }

  refresh = () => {
    this.fetch_subdepartment_data_list();
  };

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
  };

  handleClose() {
    this.isAddCategoryPopupOpened = false;
    this.editItemCategory = false;
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
export class SubDepartmentModule {}
