import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
  DxTextBoxModule,
  DxCheckBoxModule,
  DxRadioGroupModule,
  DxFileUploaderModule,
  DxDataGridModule,
  DxButtonModule,
  DxValidatorModule,
  DxProgressBarModule,
  DxPopupModule,
  DxDropDownBoxModule,
  DxToolbarModule,
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { AddCreditNoteModule } from '../CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { EditCreditNoteModule } from '../CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
import { ViewCreditNoteModule } from '../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { TransferInInventoryFormComponent } from '../transfer-in-inventory-form/transfer-in-inventory-form.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import { DeliveryReturnAddModule } from '../delivery-return-add/delivery-return-add.component';
import { DeliveryReturnEditModule } from '../delivery-return-edit/delivery-return-edit.component';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-delivery-return',
  templateUrl: './delivery-return.component.html',
  styleUrls: ['./delivery-return.component.scss']
})
export class DeliveryReturnComponent {

   @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
    DeliveryReturnDatasource:any[]=[];
    DeliveryReturnData : any;
    readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  addDeliveryReturnPopupOpened = false;
  editDeliveryReturnPopupOpened = false;
      isFilterRowVisible: boolean = false;
 isFilterOpened = false;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;


 constructor(private dataservice : DataService , private router : Router,private ngZone: NgZone, private cdr: ChangeDetectorRef,){
    this.get_DeliveryReturnList()
 }

 ngOnInit(){
    this.get_DeliveryReturnList()
 }

 addDeliveryReturn(){
  this.addDeliveryReturnPopupOpened = true;
 }

  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
  
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addDeliveryReturn());
    },
    
    elementAttr: { class: 'add-button' },    
  };

   refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };

refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
       // Or reload data from API if needed
       this.get_DeliveryReturnList();
    }
  }

        toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

 getStatusFlagClass(Status: string): string {
    // console.log('Status:', Status);
    
 return Status =='OPEN' ? 'flag-oranged' : 'flag-green';
}

onCellPrepared(e: any) {
  if (e.rowType === 'data' && e.column.command === 'edit') {
    // Find the delete button in the cell
    const deleteButton = e.cellElement.querySelector('.dx-link-delete');

    // If STATUS !== "OPEN", hide delete icon
    if (deleteButton && e.data.STATUS !== 'OPEN') {
      deleteButton.style.display = 'none';
    }
  }
}


    onEditingStart(event:any){
    event.cancel = true;
    this.editDeliveryReturnPopupOpened = true;
    console.log("Edit Data",event.data);
    this.select_DeliveryReturn_Data(event);
    }

    select_DeliveryReturn_Data(event:any){
      const id = event.data.ID;
      this.dataservice.select_DeliveryRteurn_Data(id).subscribe((response:any)=>{
        console.log("Selected Delivery Return Data",response);
        this.DeliveryReturnData = response.Data 
        console.log(this.DeliveryReturnData)
        
        
      })
    }

    get_DeliveryReturnList(){
      this.dataservice.get_DeliveryRteurn_Data().subscribe((response:any)=>{
        this.DeliveryReturnDatasource = response.Data;
        console.log("Delivery Return List",this.DeliveryReturnDatasource);
      })
    }

    handleClose(){
      this.addDeliveryReturnPopupOpened = false
      this.editDeliveryReturnPopupOpened = false
      this.get_DeliveryReturnList();
    }

   delete_Data(event:any){
     const id=event.data.ID
     this.dataservice.delete_DeliveryRteurn_Data(id).subscribe((res:any)=>{
          notify(
               {
                 message: 'This Delivery Return deleted successfully .', 
                 position: { at: 'top right', my: 'top right' },
                 displayTime: 500,
               },
               'success'
             );
   
     })
   
   }
}

@NgModule({
  imports: [
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
    DeliveryReturnAddModule,
    DeliveryReturnEditModule,
  ],
  providers: [],
  declarations: [DeliveryReturnComponent],
  exports: [DeliveryReturnComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DeliveryReturnModule {}
