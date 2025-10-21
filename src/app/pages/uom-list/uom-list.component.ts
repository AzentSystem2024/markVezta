import { Component,OnInit,NgModule,ViewChild } from '@angular/core';
import { DxButtonModule, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxTextAreaModule, DxTextBoxModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { UomAddFormModule,UomAddFormComponent

 } from 'src/app/components/library/uom-add-form/uom-add-form.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-uom-list',
  templateUrl: './uom-list.component.html',
  styleUrls: ['./uom-list.component.scss']
})
export class UomListComponent implements OnInit{
  @ViewChild(UomAddFormComponent) UomAddFormComponent: UomAddFormComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  uom:any
  uomList: any[] = [];
  isAddUomPopupOpened = false;
 
  constructor(private dataservice: DataService,
  ) {}

  addUom(){
    this.isAddUomPopupOpened = true
  }

ngOnInit(){
  this.listUom();
}

listUom(){
  this.dataservice.getUomList().subscribe((data) => {
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

onRowUpdating(event){
  const updatedData = {...event.oldData,...event.newData};
  const{ID,UOM}=updatedData;
  this.dataservice.updateUom(ID,UOM).subscribe((data) => {
    try{
      notify({
        message : "UOM updated successfully",
        position: { at: 'top right', my: 'top right' },
      },
      'success'
    )
    this.dataGrid.instance.refresh();
    this.listUom();
    }
    catch(error){
      notify({
        message: "Edit operation failed",
        position: { at: 'top right', my: 'top right' },
      },
      'error'
    )
    }
  })
}

onClickSaveUom(){
  const {UOM} = this.UomAddFormComponent.getNewUomData();
  this.dataservice.postUOM(UOM).subscribe((data) => {
    if(data){
      try{
        notify({
          message:"UOM inserted successfully",
          position: { at: 'top right', my: 'top right' },
        },
        'success'
      );
      this.dataGrid.instance.refresh();
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
    DxTextBoxModule
  ],
  providers: [],
  exports: [],
  declarations: [UomListComponent],
})
export class UomListModule {}