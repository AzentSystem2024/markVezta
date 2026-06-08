import { CommonModule } from '@angular/common';
import {
  Component,
  NgModule,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import {
  DxTabPanelModule,
  DxCheckBoxModule,
  DxSelectBoxModule,
  DxTemplateModule,
  DxButtonModule,
  DxDataGridModule,
  DxDataGridComponent,
  DxLoadPanelModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { DxTabsModule } from 'devextreme-angular/ui/tabs';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTreeViewModule } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { UserLevelNewFormModule } from '../../HR/Masters/user-level-new-form/user-level-new-form.component';
import { UserLevelNewFormComponent } from '../../HR/Masters/user-level-new-form/user-level-new-form.component';
import { UserLevelEditFormModule } from '../../HR/Masters/user-level-edit-form/user-level-edit-form.component';
import { UserLevelEditFormComponent } from '../../HR/Masters/user-level-edit-form/user-level-edit-form.component';
import { FormBuilder } from '@angular/forms';
import { finalize, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-user-role',
  templateUrl: './user-role.component.html',
  styleUrls: ['./user-role.component.scss'],
})
export class UserRoleComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild(UserLevelNewFormComponent, { static: false })
  userlevelNewForm: UserLevelNewFormComponent;
  @ViewChild(UserLevelEditFormComponent, { static: false })
  userlevelEditForm: UserLevelEditFormComponent;
  selectedData: any;
  popupGrid: any;

  popup_width: any = '60%';
  isAddFormVisible: boolean = false;

  //========Variables for Pagination ====================
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  facilityGroupDatasource: any;
  isAddFormPopupOpened: boolean = false;
  iseditFormVisible: boolean = false;
  clickedRowData: any;
  isFilterRowVisible: boolean = false;
  MenuDatasource: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  HideCost = false;

  isSaving = false;
  isUpdating = false;

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.show_new_Form());
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
    onClick: () => this.toggleFilterRow(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',

    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refresh(),
  };

  dataSource = new DataSource<any>({
    load: () =>
      new Promise((resolve, reject) => {
        this.dataservice.get_UserLevelData_List_Api().subscribe({
          next: (response: any) => {
            // add serial number before resolving
            const dataWithSlNo = response.data.map(
              (item: any, index: number) => ({
                ...item,
                SlNo: index + 1, // serial number
              }),
            );

            resolve(dataWithSlNo);
            // resolve(response.data);
          },
          error: (error) => reject(error.message),
        });
      }),
  });

  constructor(
    private fb: FormBuilder,
    private dataservice: DataService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private router: Router,
  ) {}

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === '/user-role');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.HideCost = packingRights.HideCost;
      this.canApprove = packingRights.CanApprove;
    }
    console.log(this.dataSource, 'DATASOURCEEEEEEEEEEEEE');
  }

  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'user_role';
    this.dataservice.exportDataGrid(event, fileName);
  }

  //=================== Page refreshing==========================
  refresh = () => {
    this.dataGrid.instance.refresh();
  };

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  show_new_Form() {
    this.isAddFormVisible = true;
  }

  isDeleteIconVisible({ row }: { row: any }): boolean {
    return row.data.UserRoles !== 'Administrator';
  }

  onEditingStart(event: any) {
    event.cancel = true; // Cancel the editing if a certain condition is met

    this.clickedRowData = event.data;
    this.selectData(event);
    event.cancel = true;
    this.iseditFormVisible = true;
    this.cdr.detectChanges();
  }

  onPopupClose(): void {
    this.isAddFormVisible = false;
  }

  onClearData() {
    this.userlevelNewForm.clearData();
    this.userlevelEditForm.clearData();
  }

  onEditPopupClose() {
    this.iseditFormVisible = false;
    // this.userlevelEditForm.resetUserChanges();
  }

  //=================OnClick save new data=======================
  onClickSaveNewData() {
    this.isSaving = true;
    const menuData = this.userlevelNewForm.getNewUSerLevelData();
    const userlevelvalues = this.userlevelNewForm.UserLevelValue;
    const userlistdata = this.userlevelNewForm.UserListdataSource;
    console.log(menuData);
    const isDuplicate = userlistdata?.some((data: any) => {
      const existingName = data.UserRoles?.toString().trim().toLowerCase();
      return existingName === userlevelvalues;
    });

    if (isDuplicate) {
      notify(
        {
          message: 'Data already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      this.isSaving = false;
      return;
    }

    this.dataservice
      .Insert_UserLevelList_Api(menuData)
      .pipe(
        timeout(15000), // ⏱️ prevents infinite wait
        finalize(() => {
          this.isSaving = false; //  ALWAYS reset loader
        }),
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            notify(
              {
                message: 'New User Level saved Successfully',
                position: { at: 'top right', my: 'top right' },
              },
              'success',
            );

            this.isAddFormVisible = false;
            this.iseditFormVisible = false;

            this.dataGrid.instance.refresh();
          } else {
            notify(
              {
                message: 'Your Data Not Saved',
                position: { at: 'top right', my: 'top right' },
              },
              'error',
            );
          }
        },
        error: (err) => {
          notify(
            {
              message: 'Network error. Please check your internet connection.',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1500,
            },
            'error',
          );
          console.error(err);
        },
      });
    this.isAddFormVisible = false;
    this.iseditFormVisible = false;
    this.dataGrid.instance.refresh();
  }

  //=================Select row Data====================
  selectData(event: any) {
    const ID = event?.data?.ID; // use lowercase `data`, not `Data`

    if (ID !== undefined) {
      this.dataservice.Select_UserLevel_Api(ID).subscribe((response: any) => {
        this.selectedData = response;
      });
    } else {
      console.warn('No ID found in selected row event:', event);
    }
  }

  //=======================row data update=======================
  onRowUpdating() {
    this.isUpdating = true;

    const editedData: any = this.userlevelEditForm.getNewUSerLevelEditedData();

    this.dataservice
      .Update_UserLevelList_Api(editedData)
      .pipe(
        timeout(15000), // ⏱️ stop infinite loading after 15 sec
        finalize(() => {
          this.isUpdating = false; // ✅ ALWAYS executes
        }),
      )
      .subscribe({
        next: (data: any) => {
          this.dataGrid.instance.refresh();

          notify(
            {
              message: 'User Level updated Successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );

          this.isAddFormVisible = false;
          this.iseditFormVisible = false;
        },
        error: (err) => {
          notify(
            {
              message: 'Network error. Please check your internet connection.',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1500,
            },
            'error',
          );
          console.error(err);
        },
      });
  }

  //=======================row data removing ====================

  onRowRemoving(event: any) {
    event.cancel = true; // prevent default delete

    const selectedRow = event.key;

    this.dataservice
      .Remove_userLevel_Row_Data(selectedRow.ID)
      .pipe(
        timeout(15000), // ⏱️ prevent infinite wait
      )
      .subscribe({
        next: () => {
          notify(
            {
              message: 'Delete operation successful',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );

          event.component.refresh();
          this.dataGrid.instance.refresh();
        },
        error: (err) => {
          notify(
            {
              message: 'Delete failed. Please check your internet connection.',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1500,
            },
            'error',
          );
          console.error(err);
        },
      });
  }

  formatLastModifiedTime(rowData: any): string {
    const celldate = rowData.LastModifiedTime;
    if (!celldate) return '';

    const date = new Date(celldate);

    // Extract parts of the date
    const day = date.getDate().toString().padStart(2, '0');
    const month = date
      .toLocaleString('en-US', { month: 'short' })
      .toUpperCase();
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours from 24-hour format to 12-hour format
    const hour12 = hours % 12 || 12;

    // Construct the formatted string
    return `${day} ${month} ${year}, ${hour12}:${minutes} ${ampm}`;
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxTabPanelModule,
    DxCheckBoxModule,
    DxSelectBoxModule,
    DxTemplateModule,
    DxTabsModule,
    DxTextBoxModule,
    DxButtonModule,
    DxDataGridModule,
    DxTreeViewModule,
    FormPopupModule,
    UserLevelNewFormModule,
    UserLevelEditFormModule,
    DxLoadPanelModule,
  ],
  providers: [],
  exports: [],
  declarations: [UserRoleComponent],
})
export class UserRoleModule {}
