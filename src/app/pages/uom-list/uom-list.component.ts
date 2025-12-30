import { Component,OnInit,NgModule,ViewChild, NgZone, EventEmitter, Output } from '@angular/core';
import { DxButtonModule, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxPopupModule, DxTextAreaModule, DxTextBoxModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { UomAddFormModule,UomAddFormComponent

 } from 'src/app/components/library/uom-add-form/uom-add-form.component';
import { DataService } from 'src/app/services';
import { UomEditModule } from '../uom-edit/uom-edit.component';

@Component({
  selector: 'app-uom-list',
  templateUrl: './uom-list.component.html',
  styleUrls: ['./uom-list.component.scss']
})
export class UomListComponent implements OnInit{
  @ViewChild(UomAddFormComponent) UomAddFormComponent: UomAddFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @Output() formClosed = new EventEmitter<void>();
  uom:any
  uomList: any[] = [];
  isAddUomPopupOpened = false;
  isEditUomPopupOpened = false;
  showFilterRow = true;
  showHeaderFilter = true;
  isFilterOpened = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  selectedData: any;
  selected_Company_id: any;
 
  constructor(private dataservice: DataService,private zone: NgZone
  ) {}

   addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    // icon: 'add',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.zone.run(() => {
        this.addUom();
      });
    },
    elementAttr: { class: 'add-button' },
  };

  addUom(){
    this.isAddUomPopupOpened = true
  }

   onEditingRow(event:any){
   event.cancel = true;
   this.isEditUomPopupOpened = true;
   this.selectedData = event.data
   this.selectUom(event)
   }

   
  selectUom(event:any){
      console.log(event);
      const id = event.data.ID
      this.dataservice.SelectUom(id).subscribe((res: any) => {
    console.log(res);
    this.selectedData = res
      })
  }

ngOnInit(){
  this.sesstion_Details();
  this.listUom();
}

  CloseEditForm(){
    //  this.isEditPopupOpened = false;
     this.isAddUomPopupOpened = false;
     this.isEditUomPopupOpened = false;
     this.sesstion_Details();
     this.listUom();
  }

  sesstion_Details(){
    const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData,'=================session data==========')
    this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id,'============selected_Company_id==============')    
  }

listUom(){
  const payload = {
    COMPANY_ID : this.selected_Company_id
  }
  this.dataservice.getUomList(payload).subscribe((data) => {
    this.uomList = data
    console.log(this.uomList,"UOM")
  },
  (error) => {
    console.error("Error in fetching UOM",error)
  }
)
}

onRowRemoving(event){
  const selectedRow = event.data;
  const {ID,UOM}=selectedRow;
  this.dataservice.removeUom(ID,UOM).subscribe(() => {
    try{
      notify({
        message : 'Delete operation successful',
        position: { at: 'top right', my: 'top right' },
      },
      'success'
    )
    this.dataGrid.instance.refresh();
    this.listUom();
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

// onRowUpdating(event){
//   const updatedData = {...event.oldData,...event.newData};
//   const{ID,UOM COMPANY_ID}=updatedData;
//   this.dataservice.updateUom(ID,UOM,COMPANY_ID).subscribe((data) => {
//     try{
//       notify({
//         message : "UOM updated successfully",
//         position: { at: 'top right', my: 'top right' },
//       },
//       'success'
//     )
//     this.dataGrid.instance.refresh();
//     this.listUom();
//     }
//     catch(error){
//       notify({
//         message: "Edit operation failed",
//         position: { at: 'top right', my: 'top right' },
//       },
//       'error'
//     )
//     }
//   })
// }




onClickSaveUom(){
  const {UOM} = this.UomAddFormComponent.getNewUomData();
  const payload = {
    UOM: UOM,                 // ✅ lowercase
    COMPANY_ID: this.selected_Company_id
  };
   //  DUPLICATION CHECK (case-insensitive)
  const isDuplicate = this.uomList?.some(
    (item: any) =>
      item.UOM?.trim().toLowerCase() === UOM?.trim().toLowerCase()
  );

  if (isDuplicate) {
    notify(
      {
        message: 'UOM already exists',
        position: { at: 'top right', my: 'top right' },
      },
      'warning'
    );
    return; //  STOP INSERT
  }
  
  this.dataservice.postUOM(payload).subscribe((data) => {
    if(data){
      try{
        notify({
          message:"UOM inserted successfully",
          position: { at: 'top right', my: 'top right' },
        },
        'success'
      );
      this.formClosed.emit();
      this.isAddUomPopupOpened = false
      this.listUom();
      }
      catch(error){
        notify({
          message : 'Add operation failed',
          position: { at: 'top right', my: 'top right' },
        },
        'error'
      )
      }

    }
  })
}


}
@NgModule({
  imports: [
        DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    UomAddFormModule,
    DxCheckBoxModule,
    DxTextAreaModule,
    DxTextBoxModule,
    UomEditModule,
    DxPopupModule
  ],
  providers: [],
  exports: [],
  declarations: [UomListComponent],
})
export class UomListModule {}