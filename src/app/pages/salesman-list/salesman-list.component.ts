import { Component,OnInit,NgModule,ViewChild } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import notify from 'devextreme/ui/notify';
import { SalesmanFormComponent, SalesmanFormModule } from 'src/app/components/library/salesman-form/salesman-form.component';
import { ExportService } from 'src/app/services/export.service';
@Component({
  selector: 'app-salesman-list',
  templateUrl: './salesman-list.component.html',
  styleUrls: ['./salesman-list.component.scss']
})
export class SalesmanListComponent implements OnInit {
  @ViewChild(SalesmanFormComponent) salesmanComponent: SalesmanFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
  salesman:any;
  store:any;
  showFilterRow=true;
  showHeaderFilter=true;
  isAddSalesmanPopupOpened=false;
  constructor(private dataservice:DataService,private exportService: ExportService){
    dataservice.getDropdownData('STORE').subscribe(data=>{
      this.store=data;
    })
  }
  onExporting(event: any) {
    this.exportService.onExporting(event,'Salesman-list');
  }
  addSalesman(){
    this.isAddSalesmanPopupOpened=true;
  }
  
  showSalesman(){
     this.dataservice.getSalesmanData().subscribe(
      (response)=>{
            this.salesman=response;
            console.log('salesman',response);
      }
     )
  }
  onClickSaveSalesman(){
    const {EMP_CODE,EMP_NAME,DOB,DOJ,IS_MALE,STORE_ID,ADDRESS1,ADDRESS2,ADDRESS3,CITY,MOBILE,EMAIL,IQAMA_NO,INCENTIVE_PERCENT } =this.salesmanComponent.getNewSalesmanData();
    
    this.dataservice.postSalesmanData(EMP_CODE,EMP_NAME,DOB,DOJ,IS_MALE,STORE_ID,ADDRESS1,ADDRESS2,
      ADDRESS3,CITY,MOBILE,EMAIL,IQAMA_NO,INCENTIVE_PERCENT).subscribe(
      (response)=>{
        if(response){
          this.showSalesman();
        }
      }
    )

  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, EMP_CODE,EMP_NAME,DOB,DOJ,STORE_ID,ADDRESS1,ADDRESS2,
      ADDRESS3,CITY,MOBILE,EMAIL,IQAMA_NO,INCENTIVE_PERCENT } = selectedRow;
    
    this.dataservice.removeSalesman( ID, EMP_CODE,EMP_NAME,DOB,DOJ,STORE_ID,ADDRESS1,ADDRESS2,
      ADDRESS3,CITY,MOBILE,EMAIL,IQAMA_NO,INCENTIVE_PERCENT).subscribe(() => {
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
        this.showSalesman();
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
    
    this.dataservice
      .updateSalesman(combinedData)
      .subscribe((data: any) => {
        if (data) {
          notify(
            {
              message: 'Salesman Updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.dataGrid.instance.refresh();
          this.showSalesman();
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
    this.showSalesman();
  }
}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,SalesmanFormModule
  ],
  providers: [],
  exports: [],
  declarations: [SalesmanListComponent],
})
export class SalesmanListModule{}

