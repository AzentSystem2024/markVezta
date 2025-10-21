import { Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { FormPopupModule } from 'src/app/components';
import { UserLevelsFormComponent,UserLevelsFormModule } from 'src/app/components/library/user-levels-form/user-levels-form.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { DxoPopupModule } from 'devextreme-angular/ui/nested';
import { DxPopupModule } from 'devextreme-angular';
import { UserLevelsEditFormComponent,UserLevelsEditFormModule } from 'src/app/components/library/user-levels-edit-form/user-levels-edit-form.component';

@Component({
  selector: 'app-user-levels',
  templateUrl: './user-levels.component.html',
  styleUrls: ['./user-levels.component.scss']
})
export class UserLevelsComponent implements OnInit {

  @ViewChild(UserLevelsFormComponent) userlevelComponent: UserLevelsFormComponent;
  @ViewChild(UserLevelsEditFormComponent) userleveleditComponent: UserLevelsEditFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;

  isAddUserLevelPopupOpened: boolean =false;
  isEditUserLevelPopupOpened: boolean =false;
  width:any= '70vw';
  height:any = '100vh';
  dataSource:any;
  selectedRowData:any;
  popupwidth: any = '65%';

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons: boolean = true;

  constructor(private service:DataService){}

  ngOnInit(): void {
    this.getUserLevelData();
  }

  onEditingRow(event): void {
    console.log(event, 'event');
    event.cancel = true;
    const Id = event.data.ID;
    console.log(Id, 'id');
    this.isEditUserLevelPopupOpened = true;
    this.service.selectUserLevelData(Id).subscribe((res) => {
      this.selectedRowData = res;
    });
  }

  addUserLevel(){
    this.isAddUserLevelPopupOpened=true;
  }

  getUserLevelData(){
    this.service.getUserLevelData().subscribe(res=>{
      this.dataSource=res.data;
      console.log(this.dataSource,"datsource")
    })
  }

  calculateStatus = (rowData) => {
    return rowData.IS_INACTIVE ? 'Inactive' : 'Active';
  };

  onClosePopup() {
    console.log('Popup has been closed');
    // Additional logic can be added here, like resetting forms or state
    this.userlevelComponent.clearData();
  }


  onClickSaveUserLevel(){
    const rowData=this.userlevelComponent.combineSelectedRows();
    console.log(rowData,"rowData");
    const formData=this.userlevelComponent.getNewUserLevelData();
    const data={
      LEVEL_NAME: formData.LEVEL_NAME,
      CAN_VIEW_COST: false,
      IS_INACTIVE: false,
      COMPANY_ID: 1,
      rights:rowData
    }
    console.log(data,"saved data")
    
    this.service.postUserLevel(data).subscribe(res=>{
      if (res) {
        notify(
          {
            message: 'Data Saved Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.dataGrid.instance.refresh();
        this.getUserLevelData();
     
      } else {
        notify(
          {
            message: 'Your Data Not Saved',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    })
    
  }

  onRowRemoving(event){
    const selectedRow = event.data;
    const id = event.data.ID;
    this.service.removeUserLevelData(id,{}).subscribe(() => {
      try{
        notify({
          message : 'Delete operation successful',
          position: { at: 'top right', my: 'top right' },
        },
        'success'
      )
      this.dataGrid.instance.refresh();
      this.getUserLevelData();
      }
      catch(error){
        notify({
          message : "Delete operationfailed",
          position: { at: 'top right', my: 'top right' },
        },
        'error'
      )
      }
    })
  }

  onClickUpdateUserLevel(){
    // Step 1: Combine selected rows
    let rowData = this.userleveleditComponent.combineSelectedRows();
    
    // Step 2: Filter rows to only include those with MODULE_ID > 0
    rowData = rowData.filter(row => row.MODULE_ID > 0);
    console.log(rowData,"rowData");
    const formData=this.userleveleditComponent.getNewUserLevelData();
    const data={
      ID:formData.ID,
      LEVEL_NAME: formData.LEVEL_NAME,
      CAN_VIEW_COST: false,
      IS_INACTIVE: false,
      COMPANY_ID: 1,
      rights:rowData
    }
    console.log(data,"saved data")
    
    this.service.UpdateUserLevel(data).subscribe(res=>{
      if (res) {
        notify(
          {
            message: 'Data Updated Successfully',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );
        this.dataGrid.instance.refresh();
        this.getUserLevelData();
     
      } else {
        notify(
          {
            message: 'Your Data Not Updated',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    })
    
  }

}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,UserLevelsFormModule,DxPopupModule,UserLevelsEditFormModule
  ],
  providers: [UserLevelsComponent],
  exports: [],
  declarations: [UserLevelsComponent],
})
export class UserLevelsModule{}
