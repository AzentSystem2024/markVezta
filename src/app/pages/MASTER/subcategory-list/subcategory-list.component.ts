import { Component, NgModule, NgZone, ViewChild } from '@angular/core';
import {
  DxButtonModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxPopupModule,
} from 'devextreme-angular';
import {
  SubCategoryFormModule,
  SubcategoryFormComponent,
} from 'src/app/components/library/subcategory-form/subcategory-form.component';
import { DataService } from 'src/app/services';
import { DepartmentListComponent } from '../item-department-list/department-list.component';
import { FormPopupModule } from 'src/app/components';
import { CategoryFormModule } from 'src/app/components/library/category-form/category-form.component';
import notify from 'devextreme/ui/notify';
import { CategoryListComponent } from '../category-list/category-list.component';
import { DxSelectBoxModule } from 'devextreme-angular';
import { SubcategoryEditModule } from '../../subcategory-edit/subcategory-edit.component';
import { CommonModule } from '@angular/common';
import DataSource from 'devextreme/data/data_source';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subcategory-list',
  templateUrl: './subcategory-list.component.html',
  styleUrls: ['./subcategory-list.component.scss'],
})
export class SubcategoryListComponent {
  @ViewChild(SubcategoryFormComponent)
  subcategorycomponent: SubcategoryFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild(DepartmentListComponent)
  departmentComponent: DepartmentListComponent;
  @ViewChild(CategoryListComponent) categoryComponent: CategoryListComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  SubCategoryDataSource: DataSource;
  subCategoryArray: any[] = [];
  subCategoryCount = 0;
  departmentDropdownData: any;
  isAddSubcategoryPopupOpened: boolean = false;
  categoryList: any[] = [];
  selectedType: string = '';
  selected_data: any = [];
  editSubcategory: boolean = false;
  selected_Company_id: any;
  isFilterOpened = false;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  constructor(
    private dataService: DataService,
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
      .flatMap((menu: any) => menu.Children || [])
      .find((child: any) => child.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.sesstion_Details();
    this.getSubCategory();
    this.getDepartmentDropDown();
    this.getCategoryDropdown();
    this.getCategoryDropDown();
    // this.getDropdownOptions();
  }

  addSubCategory() {
    this.isAddSubcategoryPopupOpened = true;
  }

  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' }, // 🔑 global style
    onClick: () => this.toggleFilters(),
  };

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
    this.getSubCategory();
  }

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addSubCategory());
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

  getSubCategory() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      // COMPANY_ID: 0,
    };

    this.SubCategoryDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataService.getSubCategoryData(payload).subscribe({
            next: (response: any[]) => {
              const list = response || [];

              this.subCategoryArray = list; // cache
              this.subCategoryCount = list.length;

              resolve(list); // 🔑 stops dx loader
            },
            error: () => {
              this.subCategoryArray = [];
              this.subCategoryCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  getDepartmentDropDown() {
    const dropdowndepartment = 'DEPARTMENT';
    this.dataService
      .getDropdownData(dropdowndepartment)
      .subscribe((data: any) => {
        this.departmentDropdownData = data;
        this.refresh();
      });
  }

  getCategoryDropDown() {
    const dropdownCategory = 'CATEGORY';
    this.dataService
      .getDropdownData(dropdownCategory)
      .subscribe((data: any) => {
        // this.categoryList = data;
        console.log(data, '}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}');
        this.refresh();
      });
  }

  onClickSaveSubCategory() {
    const { CODE, SUBCAT_NAME, CAT_ID, DEPT_ID } =
      this.subcategorycomponent.getNewSubcategoryData();
    const COMPANY_ID = this.selected_Company_id;

    // Check for duplicates in CategoryList
    const isCodeDuplicate = this.subCategoryArray.some(
      // (item: any) => item.CODE === commonDetails.code
      (item: any) => item.CODE.toLowerCase() === CODE.toLowerCase(),
    );

    const isDescriptionDuplicate = this.subCategoryArray.some(
      // (item: any) => item.DESCRIPTION === commonDetails.category
      (item: any) =>
        item.SUBCAT_NAME.toLowerCase() === SUBCAT_NAME.toLowerCase(),
    );

    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and Subcategory already exist',
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
          message: 'This Subcategory already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    }

    this.dataService
      .postSubCategoryData(CODE, SUBCAT_NAME, CAT_ID, DEPT_ID, COMPANY_ID)
      .subscribe((response) => {
        console.log(response, '}}}}}}}}}}}}}}}}}}]]]]]]]]');
        this.getSubCategory();
        this.isAddSubcategoryPopupOpened = false;
        notify(
          {
            message: ' Subcategory insert operation successfull',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'success',
        );
      });
  }

  refresh = () => {
    this.dataGrid.instance.refresh();
    this.getSubCategory();
  };
  onRowUpdating(event) {
    const updatedData = { ...event.oldData, ...event.newData };
    const { ID, CODE, SUBCAT_NAME, CAT_ID, DEPT_ID } = updatedData;
    this.dataService
      .updateSubCategory(ID, CODE, SUBCAT_NAME, CAT_ID, DEPT_ID)
      .subscribe(() => {
        this.dataGrid.instance.refresh();
      });
  }
  onEditSubcategory(event: any) {
    event.cancel = true;
    const id = event.data.ID;
    this.editSubcategory = true;
    this.dataService.select_subcategory(id).subscribe((res: any) => {
      this.selected_data = res;
    });
  }
  onRowRemoving(event: any) {
    const { ID, SUBCAT_NAME, CAT_ID, DEPT_ID } = event.data;

    event.cancel = new Promise((resolve, reject) => {
      this.dataService
        .removeSubCategory(ID, SUBCAT_NAME, CAT_ID, DEPT_ID)
        .subscribe({
          next: () => {
            notify(
              {
                message: 'Delete operation successful',
                position: { at: 'top right', my: 'top right' },
              },
              'success',
            );

            this.getSubCategory(); // reload data

            resolve(true); // ✅ closes popup + syncs grid
          },
          error: () => {
            notify(
              {
                message: 'Delete operation failed',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );

            reject(); //  keeps popup open
          },
        });
    });
  }
  handleClose() {
    this.isAddSubcategoryPopupOpened = false;
    this.editSubcategory = false;
    this.getSubCategory();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  getCategoryDropdown() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.getCategoryData(payload).subscribe((response: any) => {
      console.log(response, 'categories!!!!!!!!!!!!!!!!!!!!!!!!!!!!??????');
    });
  }

  onExporting(event: any) {
    const fileName = 'item-sub-category-list';
    this.dataService.exportDataGrid(event, fileName);
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    SubCategoryFormModule,
    DxSelectBoxModule,
    SubcategoryEditModule,
    CommonModule,
    DxPopupModule,
  ],
  providers: [],
  exports: [],
  declarations: [SubcategoryListComponent],
})
export class SubCategoryListModule { }
