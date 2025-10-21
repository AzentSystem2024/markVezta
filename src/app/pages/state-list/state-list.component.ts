import { Component,OnInit,NgModule,ViewChild } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { StateFormComponent, StateFormModule } from 'src/app/components/library/state-form/state-form.component';
import notify from 'devextreme/ui/notify';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { jsPDF } from 'jspdf';
import { ExportService } from 'src/app/services/export.service';

@Component({
  selector: 'app-state-list',
  templateUrl: './state-list.component.html',
  styleUrls: ['./state-list.component.scss']
})
export class StateListComponent {
  @ViewChild(StateFormComponent) stateComponent: StateFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
  state:any;
  CountryDropdownData:any;
  isAddStatePopupOpened=false;
  showFilterRow=true;
  showHeaderFilter=true;
  constructor(private dataservice:DataService,private exportService: ExportService){}
  onExporting(event: any) {
    this.exportService.onExporting(event,'state-list');
  }
  addState(){
    this.isAddStatePopupOpened=true;
  }
  
  showState(){
     this.dataservice.getStateData().subscribe(
      (response)=>{
            this.state=response;
            console.log(response);
      }
     )
  }
  onClickSaveState(){
    const { STATE_NAME,COUNTRY_ID } =this.stateComponent.getNewStateData();
    console.log('inserted data',STATE_NAME,COUNTRY_ID );
    this.dataservice.postStateData(STATE_NAME,COUNTRY_ID ).subscribe(
      (response)=>{
        if(response){
          try { 
            notify({
              message: 'State is successfully added',
              position: { at: 'top right', my: 'top right' },
            },
            'success'
          );
          this.dataGrid.instance.refresh();
          this.showState();
          } catch (error) {
            notify({
              message: 'Add operation failed',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          )
          }
        }
      }
    )
  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID,STATE_NAME,COUNTRY_ID } = selectedRow;
    
    this.dataservice.removeState(ID,STATE_NAME,COUNTRY_ID ).subscribe(() => {
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
        this.showState();
      } catch (error) {
        notify(
          {
            message: 'Delete operation failed',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    });
  }
  onRowUpdating(event) {
    const updataDate = event.newData;
    const oldData = event.oldData;
    const combinedData = { ...oldData, ...updataDate };
    let id = combinedData.ID;
    let statename = combinedData.STATE_NAME;
    let country_id = combinedData.COUNTRY_ID;
   

    this.dataservice
      .updateState(id,statename,country_id )
      .subscribe((data: any) => {
        if (data) {
          notify(
            {
              message: 'State updated Successfully',
              position: { at: 'top right', my: 'top right' },
            },
            'success'
          );
          this.dataGrid.instance.refresh();
          this.showState();
        } else {
          notify(
            {
              message: 'Your Data Not Saved',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      });
    console.log('old data:', oldData);
    console.log('new data:', updataDate);
    console.log('modified data:', combinedData);

    event.cancel = true; // Prevent the default update operation
  }
  ngOnInit(): void {
    this.showState();
    this.getCountryDropDown();
  }
  getCountryDropDown() {
    
    this.dataservice
      .getCountryData()
      .subscribe((data: any) => {
        this.CountryDropdownData = data;
        console.log('dropdown',this.CountryDropdownData);
      });
  }
}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,StateFormModule
  ],
  providers: [],
  exports: [],
  declarations: [StateListComponent],
})
export class StateListModule{}

