import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnDestroy,
  OnInit,
  ViewChild,
  OnChanges,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import {
  DxTabPanelModule,
  DxCheckBoxModule,
  DxSelectBoxModule,
  DxTemplateModule,
  DxButtonModule,
  DxDataGridModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { DxTabsModule } from 'devextreme-angular/ui/tabs';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTreeViewModule } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { UserLevelNewFormModule } from '../../Masters/user-level-new-form/user-level-new-form.component';
import { UserLevelNewFormComponent } from '../../Masters/user-level-new-form/user-level-new-form.component';
import { UserLevelEditFormModule } from '../../Masters/user-level-edit-form/user-level-edit-form.component';
import { UserLevelEditFormComponent } from '../../Masters/user-level-edit-form/user-level-edit-form.component';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-user-role',
  templateUrl: './user-role.component.html',
  styleUrls: ['./user-role.component.scss']
})
export class UserRoleComponent {

  

   @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild(UserLevelNewFormComponent, { static: false })
  userlevelNewForm: UserLevelNewFormComponent;
   @ViewChild(UserLevelEditFormComponent, { static: false })
  userlevelEditForm: UserLevelEditFormComponent;
  selectedData: any;
  popupGrid: any;

   constructor(private fb: FormBuilder, private dataservice: DataService,private cdr: ChangeDetectorRef,private ngZone: NgZone,private router : Router) {}

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


  dataSource = new DataSource<any>({
    load: () =>
      new Promise((resolve, reject) => {
        this.dataservice.get_UserLevelData_List_Api().subscribe({
          next: (response: any) => {
               // add serial number before resolving
          const dataWithSlNo = response.data.map((item: any, index: number) => ({
            ...item,
            SlNo: index + 1   // serial number
          }));

          resolve(dataWithSlNo);
            // resolve(response.data);
          },
          error: (error) => reject(error.message),
        });
      }),
  });

    ngOnInit(){
const currentUrl = this.router.url;
  console.log('Current URL:', currentUrl);
   const menuResponse = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');
  console.log('Parsed ObjectData:', menuResponse);

  const menuGroups = menuResponse.MenuGroups || [];
  console.log('MenuGroups:', menuGroups);
const packingRights = menuGroups
  .flatMap(group => group.Menus)
  .find(menu => menu.Path === '/user-role');

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

  
 //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'Speciality';
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

 onEditingStart(event:any){
  event.cancel = true; // Cancel the editing if a certain condition is met

  console.log(event.data);
  
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

 onEditPopupClose(){
   this.iseditFormVisible = false;
    // this.userlevelEditForm.resetUserChanges();
 }

 //=================OnClick save new data=======================
  onClickSaveNewData() {
    const menuData: any = this.userlevelNewForm.getNewUSerLevelData();

    console.log(this.userlevelNewForm,'userlevelnewform')
    const userlevelvalues = this.userlevelNewForm.UserLevelValue
    console.log(userlevelvalues);
    const userlistdata = this.userlevelNewForm.UserListdataSource
    console.log(userlistdata);
    
    
    const isDuplicate = userlistdata?.some((data: any) => {
      const existingName = data.UserRoles?.toString().trim().toLowerCase();
      return  existingName === userlevelvalues
;
    });

    if (isDuplicate) {
      notify(
        {
          message: 'Data already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    }
    
    console.log("menu insert data :>>",menuData)
    this.dataservice
      .Insert_UserLevelList_Api(menuData)
      .subscribe((response: any) => {
        if (response) {
          this.dataGrid.instance.refresh();

          notify(
            {
              message: `New User Level  saved Successfully`,
              position: { at: 'top right', my: 'top right' },
            },
            'success'
          );
        } else {
          notify(
            {
              message: ` Your Data Not Saved`,
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      });
      this.isAddFormVisible = false
      this.iseditFormVisible= false
       this.dataGrid.instance.refresh();

  }


  //=================Select row Data====================
  selectData(event: any) {
    console.log('Select Event:', event); // Add this for debugging

    const ID = event?.data?.ID; // use lowercase `data`, not `Data`

    if (ID !== undefined) {
      this.dataservice.Select_UserLevel_Api(ID).subscribe((response: any) => {
        console.log(response, 'select Api');
        this.selectedData = response;
      });
    } else {
      console.warn('No ID found in selected row event:', event);
    }
  }



  //=======================row data update=======================
  onRowUpdating() {
    console.log('working');
    
    const editedData: any = this.userlevelEditForm.getNewUSerLevelEditedData();
    console.log(editedData,'menu edited');
    this.dataservice
      .Update_UserLevelList_Api(editedData)
      .subscribe((data: any) => {
        console.log(data,'data');
        
        if (data) {
          this.dataGrid.instance.refresh();

          notify(
            {
              message: `User Level updated Successfully`,
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success'
          );
        } else {
          notify(
            {
              message: `Your Data Not Saved`,
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'error'
          );
        }
        this.isAddFormVisible = false
        this.iseditFormVisible= false
        this.dataGrid.instance.refresh();
      });
  }

  //=======================row data removing ====================
  onRowRemoving(event: any) {
    event.cancel = true;
    let SelectedRow = event.key;
    this.dataservice
      .Remove_userLevel_Row_Data(SelectedRow.ID)
      .subscribe(() => {
        try {
          notify(
            {
              message: 'Delete operation successful',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success'
          );
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
    UserLevelEditFormModule
  ],
  providers: [],
  exports: [],
  declarations: [UserRoleComponent],
})
export class UserRoleModule {}