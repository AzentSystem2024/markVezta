import { Component,OnInit,NgModule,ViewChild } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { DeliveryTermsFormComponent,DeliveryTermsFormModule } from 'src/app/components/library/delivery-terms-form/delivery-terms-form.component';
import notify from 'devextreme/ui/notify';
import { ExportService } from 'src/app/services/export.service';

@Component({
  selector: 'app-delivery-terms-list',
  templateUrl: './delivery-terms-list.component.html',
  styleUrls: ['./delivery-terms-list.component.scss']
})
export class DeliveryTermsListComponent {
  @ViewChild(DeliveryTermsFormComponent) deliverytermsComponent: DeliveryTermsFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
  delivery_terms:any;
  showFilterRow=true;
  showHeaderFilter=true;
  isAddDeliveryTermsPopupOpened=false;
  constructor(private dataservice:DataService,private exportService: ExportService){}
  onExporting(event: any) {
    this.exportService.onExporting(event,'Delivery_terms-list');
  }
  addDeliveryTerms(){
    this.isAddDeliveryTermsPopupOpened=true;
  }
  
  showDeliveryTerms(){
     this.dataservice.getDeliveryTermsData().subscribe(
      (response)=>{
            this.delivery_terms=response;
            console.log(response);
      }
     )
  }
  onClickSaveDeliveryTerms(){
    const { CODE, DESCRIPTION } =this.deliverytermsComponent.getNewDeliveryTerms();
    console.log('inserted data',CODE,DESCRIPTION);
    this.dataservice.postDeliveryTermsData(CODE,DESCRIPTION).subscribe(
      (response)=>{
        if(response){
          this.showDeliveryTerms();
        }
      }
    )
  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, CODE, DESCRIPTION } = selectedRow;
    
    this.dataservice.removeDeliveryTerms(ID, CODE, DESCRIPTION ).subscribe(() => {
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
        this.showDeliveryTerms();
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
    let code = combinedData.CODE;
    let description = combinedData.DESCRIPTION;
   

    this.dataservice
      .updateDeliveryTerms(id, code,description)
      .subscribe((data: any) => {
        if (data) {
          notify(
            {
              message: 'Delivery Terms Updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.dataGrid.instance.refresh();
          this.showDeliveryTerms();
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
    this.showDeliveryTerms();
  }
}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,DeliveryTermsFormModule
  ],
  providers: [],
  exports: [],
  declarations: [DeliveryTermsListComponent],
})
export class DeliveryTermsListModule{}
