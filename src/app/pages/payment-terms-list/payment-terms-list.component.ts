import { Component,OnInit,NgModule,ViewChild } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { PaymentTermsFormModule } from 'src/app/components/library/payment-terms-form/payment-terms-form.component';
import notify from 'devextreme/ui/notify';
import { PaymentTermsFormComponent } from 'src/app/components/library/payment-terms-form/payment-terms-form.component';
import { ExportService } from 'src/app/services/export.service';

@Component({
  selector: 'app-payment-terms-list',
  templateUrl: './payment-terms-list.component.html',
  styleUrls: ['./payment-terms-list.component.scss']
})
export class PaymentTermsListComponent {
  @ViewChild(PaymentTermsFormComponent) paymenttermsComponent: PaymentTermsFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
  payment_terms:any;
  isAddPaymentTermsPopupOpened=false;
  showFilterRow=true;
  showHeaderFilter=true;
  constructor(private dataservice:DataService,private exportService: ExportService){}
  onExporting(event: any) {
    this.exportService.onExporting(event,'Payment_terms-list');
  }
  addPaymentTerms(){
    this.isAddPaymentTermsPopupOpened=true;
  }
  
  showPaymentTerms(){
     this.dataservice.getPaymentTermsData().subscribe(
      (response)=>{
            this.payment_terms=response;
            console.log(response);
      }
     )
  }
  onClickSavePaymentTerms(){
    const { CODE, DESCRIPTION } =this.paymenttermsComponent.getNewPaymentTerms();
    console.log('inserted data',CODE,DESCRIPTION);
    this.dataservice.postPaymentTermsData(CODE,DESCRIPTION).subscribe(
      (response)=>{
        if(response){
          this.showPaymentTerms();
        }
      }
    )
  }
  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, CODE, DESCRIPTION } = selectedRow;
    
    this.dataservice.removePaymentTerms(ID, CODE, DESCRIPTION ).subscribe(() => {
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
        this.showPaymentTerms();
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
      .updatePaymentTerms(id, code,description)
      .subscribe((data: any) => {
        if (data) {
          notify(
            {
              message: 'Payments Terms Updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.dataGrid.instance.refresh();
          this.showPaymentTerms();
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
    this.showPaymentTerms();
  }
}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,PaymentTermsFormModule
  ],
  providers: [],
  exports: [],
  declarations: [PaymentTermsListComponent],
})
export class PaymentTermsListModule{}

