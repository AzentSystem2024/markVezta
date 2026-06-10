import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxFormModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxToolbarModule,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import {
  CategoryFormComponent,
  CategoryFormModule,
} from 'src/app/components/library/category-form/category-form.component';
import { ExportService } from 'src/app/services/export.service';
import { ItemcategoryEditModule } from 'src/app/pages/itemcategory-edit/itemcategory-edit.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-item-category-list',
  templateUrl: './item-category-list.component.html',
  styleUrls: ['./item-category-list.component.scss'],
})
export class ItemCategoryListComponent implements OnInit {
  @ViewChild(CategoryFormComponent) categoryComponent!: CategoryFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  CategoryDataSource: DataSource | undefined;
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
  IsLedgerEnabled: any;

  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private ngZone: NgZone,
    private router: Router,
  ) {
    this.sesstion_Details();
    this.showCategory();
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
    this.showCategory();
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
    const { CODE, CAT_NAME, LOYALTY_POINT, COST_HEAD_ID, DEPT_ID } =
      this.categoryComponent.getNewCategoryData();

    const COMPANY_ID = this.COMPANY_ID;
    // Check for duplicates in CategoryList
    const isCodeDuplicate = this.categoryArray.some(
      // (item: any) => item.CODE === commonDetails.code
      (item: any) => item.CODE.toLowerCase() === CODE.toLowerCase(),
    );

    const isDescriptionDuplicate = this.categoryArray.some(
      // (item: any) => item.DESCRIPTION === commonDetails.category
      (item: any) => item.CAT_NAME.toLowerCase() === CAT_NAME.toLowerCase(),
    );

    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and category already exist',
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
      .postCategoryData(
        CODE,
        CAT_NAME,
        LOYALTY_POINT,
        COST_HEAD_ID,
        DEPT_ID,
        COMPANY_ID,
      )
      .subscribe((response) => {
        if (response.flag == '1') {
          this.showCategory();
          this.isAddCategoryPopupOpened = false;
          notify(
            {
              message: 'Item Category saved successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1000,
            },
            'success',
          );
          return;
        }
      });
  }

  onRowRemoving(event: any) {
    const selectedRow = event.data;

    event.cancel = new Promise((resolve, reject) => {
      this.dataservice
        .removeCategory(
          selectedRow.ID,
          selectedRow.CODE,
          selectedRow.CAT_NAME,
          selectedRow.LOYALTY_POINT,
          selectedRow.COST_HEAD_ID,
          selectedRow.DEPT_ID,
          selectedRow.COMPANY_ID,
        )
        .subscribe({
          next: () => {
            notify(
              {
                message: 'Delete operation successful',
                position: { at: 'top right', my: 'top right' },
              },
              'success',
            );

            this.dataGrid.instance.refresh();
            this.showCategory();

            resolve(true); // ✅ tells grid: deletion successful → close popup
          },
          error: () => {
            notify(
              {
                message: 'Delete operation failed',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );

            reject(); //  tells grid: don't close popup
          },
        });
    });
  }

  sesstion_Details() {
    const sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    this.COMPANY_ID = sessionData.SELECTED_COMPANY.COMPANY_ID;
    const configuration = sessionData?.GeneralSettings || {};
    this.IsLedgerEnabled = configuration?.ENABLE_ITEM_CATEGORY_ACCOUNTS || true;
  }

  showCategory() {
    const payload = {
      COMPANY_ID: this.COMPANY_ID,
      // COMPANY_ID: 0,
    };

    this.CategoryDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.getCategoryData(payload).subscribe({
            next: (response: any[]) => {
              const list = response || [];

              this.categoryArray = list; // local cache
              this.categoryCount = list.length;

              resolve(list); // 🔑 stops dx loader
            },
            error: () => {
              this.categoryArray = [];
              this.categoryCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  // getDepartmentDropDown() {
  //   const dropdowndepartment = 'DEPARTMENT';
  //   this.dataservice
  //     .getDropdownData(dropdowndepartment)
  //     .subscribe((data: any) => {
  //       this.DepartmentDropdownData = data;
  //     });
  // }
  ngOnInit(): void {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    console.log(menuResponse, 'menuResponse');

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
    this.showCategory();
    // this.getDepartmentDropDown();
  }
  refresh = () => {
    this.dataGrid.instance.refresh();
    this.showCategory();
  };
  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    // this.cdr.detectChanges();
  };
  handleClose() {
    this.isAddCategoryPopupOpened = false;
    this.editItemCategory = false;
    this.showCategory();
  }

  onExporting(event: any) {
    const fileName = 'item-category-list';
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
    CategoryFormModule,
    ItemcategoryEditModule,
    CommonModule,
  ],
  providers: [],
  exports: [ItemCategoryListComponent],
  declarations: [ItemCategoryListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemCategoryModule {}
