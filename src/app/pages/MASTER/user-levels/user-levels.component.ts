import {
  ChangeDetectorRef,
  Component,
  NgModule,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { FormPopupModule } from 'src/app/components';
import {
  UserLevelsFormComponent,
  UserLevelsFormModule,
} from 'src/app/components/library/user-levels-form/user-levels-form.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { DxoPopupModule } from 'devextreme-angular/ui/nested';
import { DxPopupModule } from 'devextreme-angular';
import {
  UserLevelsEditFormComponent,
  UserLevelsEditFormModule,
} from 'src/app/components/library/user-levels-edit-form/user-levels-edit-form.component';
import { ExportService } from 'src/app/services/export.service';
import { Router } from '@angular/router';
import { DxLoadPanelModule } from 'devextreme-angular';

@Component({
  selector: 'app-user-levels',
  templateUrl: './user-levels.component.html',
  styleUrls: ['./user-levels.component.scss'],
})
export class UserLevelsComponent implements OnInit {
  @ViewChild(UserLevelsFormComponent)
  userlevelComponent: UserLevelsFormComponent;
  @ViewChild(UserLevelsEditFormComponent)
  userleveleditComponent: UserLevelsEditFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  isAddUserLevelPopupOpened: boolean = false;
  isEditUserLevelPopupOpened: boolean = false;
  width: any = '70vw';
  height: any = '100vh';
  dataSource: any;
  selectedRowData: any;
  popupwidth: any = '65%';
  isSaving = false;
  isUpdating = false;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons: boolean = true;
  isFilterOpened = false;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addUserLevel());
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
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    stylingMode: 'contained',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
  };
  isFilterRowVisible: boolean;

  constructor(
    private service: DataService,
    private exportService: ExportService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) { }

  ngOnInit(): void {
    console.log('=======================================================');
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
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.getUserLevelData();
  }

  onEditingRow(event): void {
    event.cancel = true;
    const Id = event.data.ID;
    console.log(Id, 'id');
    this.isEditUserLevelPopupOpened = true;
    this.service.selectUserLevelData(Id).subscribe((res) => {
      this.selectedRowData = res;
    });
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.getUserLevelData();
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
  addUserLevel() {
    this.isAddUserLevelPopupOpened = true;
  }

  getUserLevelData() {
    this.service.getUserLevelData().subscribe((res) => {
      this.dataSource = res.data;
      console.log(this.dataSource, 'datsource');
    });
  }

  calculateStatus = (rowData) => {
    return rowData.IS_INACTIVE ? 'Inactive' : 'Active';
  };

  onClosePopup() {
    console.log('Popup has been closed');
    // Additional logic can be added here, like resetting forms or state
    this.userlevelComponent.clearData();
  }

  onClickSaveUserLevel() {
    this.isSaving = true;
    const rowData = this.userlevelComponent.combineSelectedRows();
    console.log(rowData, 'rowData');
    const formData = this.userlevelComponent.getNewUserLevelData();
    const data = {
      LEVEL_NAME: formData.LEVEL_NAME,
      CAN_VIEW_COST: false,
      IS_INACTIVE: false,
      COMPANY_ID: 1,
      rights: rowData,
    };
    console.log(data, 'saved data');

    this.service.postUserLevel(data).subscribe((res) => {
      if (res) {
        notify(
          {
            message: 'Data Saved Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success',
        );
        this.isSaving = false;
        this.dataGrid.instance.refresh();
        this.getUserLevelData();
      } else {
        notify(
          {
            message: 'Your Data Not Saved',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
        this.isSaving = false;
      }
    });
  }

  onRowRemoving(event) {
    const selectedRow = event.data;
    const id = event.data.ID;
    this.service.removeUserLevelData(id, {}).subscribe(() => {
      try {
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );
        this.dataGrid.instance.refresh();
        this.getUserLevelData();
      } catch (error) {
        notify(
          {
            message: 'Delete operationfailed',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
      }
    });
  }

  onClickUpdateUserLevel() {
    this.isUpdating = true;
    // Step 1: Combine selected rows
    let rowData = this.userleveleditComponent.combineSelectedRows();

    // Step 2: Filter rows to only include those with MODULE_ID > 0
    rowData = rowData.filter((row) => row.MODULE_ID > 0);
    console.log(rowData, 'rowData');
    const formData = this.userleveleditComponent.getNewUserLevelData();
    const data = {
      ID: formData.ID,
      LEVEL_NAME: formData.LEVEL_NAME,
      CAN_VIEW_COST: false,
      IS_INACTIVE: false,
      COMPANY_ID: 1,
      rights: rowData,
    };
    console.log(data, 'saved data');

    this.service.UpdateUserLevel(data).subscribe((res) => {
      if (res) {
        notify(
          {
            message: 'Data Updated Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success',
        );
        this.isUpdating = false;
        this.dataGrid.instance.refresh();
        this.getUserLevelData();
      } else {
        notify(
          {
            message: 'Your Data Not Updated',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
        this.isUpdating = false;
      }
    });
  }
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    UserLevelsFormModule,
    DxPopupModule,
    UserLevelsEditFormModule,
    DxLoadPanelModule,
  ],
  providers: [UserLevelsComponent],
  exports: [],
  declarations: [UserLevelsComponent],
})
export class UserLevelsModule { }
