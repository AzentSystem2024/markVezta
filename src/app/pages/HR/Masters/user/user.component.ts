import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  NgModule,
  NgZone,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  DxDataGridModule,
  DxButtonModule,
  DxDropDownButtonModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxLookupModule,
  DxDataGridComponent,
  DxPopupModule,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import notify from 'devextreme/ui/notify';

import {
  UserNewFormComponent,
  UserNewFormModule,
} from '../../Masters/user-new-form/user-new-form.component';
import {
  UserEditFormComponent,
  UserEditFormModule,
} from '../../Masters/user-edit-form/user-edit-form.component';
import DataSource from 'devextreme/data/data_source';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent {
@ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  @ViewChild(UserNewFormComponent, { static: false })
  userNewForm: UserNewFormComponent;

    @ViewChild(UserEditFormComponent, { static: false })
  userEditForm: UserEditFormComponent;
  DataSource: any;
  userList: any;

constructor(private fb: FormBuilder, private dataservice: DataService , private cdr: ChangeDetectorRef,private ngZone: NgZone,private router : Router) {
 
}

  selectedData: any;
  popupwidth: any = '75%';
UserListDatasource : any
  isAddFormPopupOpened: boolean = false;
  isEditPopupOpened: boolean = false;
  selectedRowData: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.show_new_Form());
    },
    elementAttr: { class: 'add-button' }
  };

  isFilterRowVisible: boolean = false;
  currentPathName: string;
  initialized: boolean;

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  //=================== Page refreshing==========================
   refresh = () => {
    this.dataGrid.instance.refresh();
  };

datasource = new DataSource<any>({
    load: () =>
      new Promise((resolve, reject) => {
        this.dataservice.get_User_data().subscribe({
          next: (data: any) => {
                    // add serial number before resolving
          const dataWithSlNo = data.Data.map((item: any, index: number) => ({
            ...item,
            SlNo: index + 1   // serial number
          }));

          resolve(dataWithSlNo); 
            // resolve(data.Data);
            // console.log(data.Data);
          },
          error: (error) => reject(error.message),
        });
      }),
  });


  isDeleteIconVisible({ row }: { row: any }): boolean {
    return row.data.UserRoleName !== 'Administrator';
  }

  show_new_Form() {
   this.isAddFormPopupOpened = true;
  }

  onEditingRow(event): void {
    event.cancel = true;
     this.selectedRowData = event.data;
    const ID = event.data.ID;
    this.isEditPopupOpened = true;
    this.dataservice.get_User_Data_By_Id(ID).subscribe((res:any) => {
      
      this.selectedRowData = res.Data[0];
      console.log(this.selectedRowData,'selectedrowdata')
      this.cdr.detectChanges(); // Ensure Angular picks up the change
    });
  }

    ngOnInit(){
const currentUrl = this.router.url;
  console.log('Current URL:', currentUrl);
   const menuResponse = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');
  console.log('Parsed ObjectData:', menuResponse);

  const menuGroups = menuResponse.MenuGroups || [];
  console.log('MenuGroups:', menuGroups);
const packingRights = menuGroups
  .flatMap(group => group.Menus)
  .find(menu => menu.Path === '/user');

if (packingRights) {
  this.canAdd = packingRights.CanAdd;
  this.canEdit = packingRights.CanEdit;
  this.canDelete = packingRights.CanDelete;
    this.canPrint = packingRights.CanEdit;
  this.canView = packingRights.canView;
   this.canApprove = packingRights.canApprove;
}

console.log('packingRights',packingRights);
console.log(  this.canAdd ,  this.canEdit ,  this.canDelete );

  }

  onClickSaveNewData() {
    const data = this.userNewForm.getNewUserData();
    console.log(data,"PAYLOAD IN SAVE")

// const loginName = data.LOGIN_NAME?.toString().trim().toLowerCase();

//   // ✅ Defensive check
//   if (!loginName) {
//     notify(
//       {
//         message: 'Login Name is required',
//         position: { at: 'top right', my: 'top right' },
//         displayTime: 1000,
//       },
//       'error'
//     );
//     return;
//   }

    this.dataservice.insert_User_Data(data).subscribe((res: any) => {
      try {
        if (res.message === 'Success') {
          notify(
            {
              message: 'data saved successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success'
          );
          this.dataGrid.instance.refresh();
        }
      } catch (error) {
        notify(
          {
            message: 'save operation failed',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'error'
        );
      }
    });
    this.isAddFormPopupOpened = false
    this.loadUserDataSource()   //call the reload datasource function after inserting data

  }

   onRowUpdating() {
  //   const data = this.userEditForm.getEditUserData();
  //   console.log(data,"PAYLOAD IN SAVE")
  //   this.dataservice.update_User_Data(data).subscribe((res: any) => {
  //     console.log(data,'data');
      
  //     try {
  //       if (res.message === 'Success') {
  //         notify(
  //           {
  //             message: 'data saved successfully',
  //             position: { at: 'top right', my: 'top right' },
  //             displayTime: 500,
  //           },
  //           'success'
  //         );
  //         this.dataGrid.instance.refresh();
  //       }
  //     } catch (error) {
  //       notify(
  //         {
  //           message: 'save operation failed',
  //           position: { at: 'top right', my: 'top right' },
  //           displayTime: 500,
  //         },
  //         'error'
  //       );
  //     }
  //   });
  //   this.isAddFormPopupOpened = false
  //   this.loadUserDataSource()   //call the reload datasource function after inserting data
  //   this.isEditPopupOpened = false
  }
 
  //=========Reload the datasource after inserting data
  loadUserDataSource() {
  this.datasource = new DataSource<any>({
    load: () =>
      new Promise((resolve, reject) => {
        this.dataservice.get_User_data().subscribe({
          next: (data: any) => {
            resolve(data.Data);
          },
          error: (error) => reject(error.message),
        });
      }),
  });
}


  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'Speciality';
    this.dataservice.exportDataGrid(event, fileName);
  }

   onClearData() {
    this.userNewForm.clearData();
  }

  onRowRemoving(event: any) {
    event.cancel = true;
    let SelectedRow = event.key;
    this.dataservice.remove_User_Data(SelectedRow.ID).subscribe(() => {
      try {
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success'
        );
        this.dataGrid.instance.refresh();
      } catch (error) {
        notify(
          {
            message: 'Delete operation failed',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'error'
        );
      }
      event.component.refresh();
      this.dataGrid.instance.refresh();
    });
  }

statusCellTemplate = (cellElement: any, cellInfo: any) => {
    const status = cellInfo.value; // Get the value from `calculateCellValue`

    // Determine background color and display text based on the status
    const color = status === 'Inactive' ? 'red' : 'green';
    const text = status; // Use the calculated value ("Inactive" or "Active")

    // Apply the dynamic styles and content
    cellElement.innerHTML = `
      <span style="
        background-color: ${color};
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

  validation: boolean = false;

  getStatusFlagClass(IS_INACTIVE: boolean): string {
    return IS_INACTIVE ? 'flag-red' : 'flag-green';
  }

get_userlist(){
    this.dataservice.get_User_data().subscribe((res:any)=>{
      console.log(res);

      
    })
  }
  
  CloseEditForm() {
    this.isEditPopupOpened = false;
    
    this.get_userlist()
    // this.getUSerData();
    this.dataGrid.instance.refresh();
  }
}

@NgModule({
  imports: [
    CommonModule,
    DxDataGridModule,
    DxButtonModule,
    DxDataGridModule,
    DxDropDownButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxLookupModule,
    FormPopupModule,
    UserNewFormModule,
    DxPopupModule,
    UserEditFormModule,
  ],
  providers: [],
  exports: [],
  declarations: [UserComponent],
})
export class UserModule {}
