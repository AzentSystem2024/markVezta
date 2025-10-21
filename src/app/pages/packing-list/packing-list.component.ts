import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, ViewChild } from '@angular/core';
import { DxButtonModule, DxDataGridComponent, DxDataGridModule, DxPopupModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { PackingAddFormComponent, PackingFormModule } from 'src/app/components/library/packing-add-form/packing-add-form.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-packing-list',
  templateUrl: './packing-list.component.html',
  styleUrls: ['./packing-list.component.scss']
})
export class PackingListComponent implements OnInit {

  @ViewChild(PackingAddFormComponent) PackingAddFormComponent: PackingAddFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;

  isAddPackingPopupOpened=false;
  storedUserData: string;
  packing : any;
  constructor(private dataservice:DataService){}

  ngOnInit(): void {
    this.packingList()
 
    this.storedUserData = sessionStorage.getItem('userData');
    console.log(this.storedUserData, 'STOREDUSERDATA');


  }

  addPacking(){
    this.isAddPackingPopupOpened=true;
  }

  packingList(){
    this.dataservice.getPackingList().subscribe((data:any) => {
      this.packing = data;
      console.log(data,"PACKING")
    })
  }

  onClickSavePacking(){
    const{DESCRIPTION,NO_OF_UNITS} = this.PackingAddFormComponent.getNewPackingData();
    this.dataservice.postPacking(DESCRIPTION,NO_OF_UNITS).subscribe((response) => {
      if(response){
        try{
          notify({
            message:"Packing added successfully",
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        )
        this.dataGrid.instance.refresh();
        this.packingList();
        }
        catch(error){
          notify({
            message : "Add operation failed",
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        )
        }
      }
    })
  }

  onRowUpdating(event){
    const updataDate = event.newData;
    const oldData = event.oldData;
    const combinedData =  { ...oldData, ...updataDate };
    let ID = combinedData.ID;
    let DESCRIPTION = combinedData.DESCRIPTION;
    let NO_OF_UNITS=combinedData.NO_OF_UNITS;
    this.dataservice.updatePacking(ID,DESCRIPTION,NO_OF_UNITS).subscribe((data:any) => {
      if(data){
        try{
          notify({
            message:"Packing updated successfully",
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        )
        this.dataGrid.instance.refresh();
        this.packingList();
        }
        catch(error){
          notify({
            message : "Updation failed",
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        )
        }
      }
    })
  }
  onRowRemoving(event){
    const selectedRow = event.data;
    const { ID,DESCRIPTION,NO_OF_UNITS } = selectedRow;
    this.dataservice.removePacking(ID,DESCRIPTION,NO_OF_UNITS).subscribe(() => {
      try {
        // Your delete logic here
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        );
        this.dataGrid.instance.refresh();
        this.packingList();
      } catch (error) {
        notify(
          {
            message: 'Delete operation failed',
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
    DxDataGridModule,DxButtonModule,FormPopupModule,DxPopupModule,CommonModule,PackingFormModule
  ],
  providers: [],
  exports: [],
  declarations: [PackingListComponent],
})
export class PackingListModule{}