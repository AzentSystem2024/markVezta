import { ChangeDetectorRef, Component, NgModule, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxTabsModule, DxTabPanelModule, DxPopupModule, DxDropDownBoxModule } from 'devextreme-angular';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-transfer-in-new-form',
  templateUrl: './transfer-in-new-form.component.html',
  styleUrls: ['./transfer-in-new-form.component.scss']
})
export class TransferInNewFormComponent implements OnInit{
  StoreList:any;
  isGridBoxOpened:boolean=false;
  filteredTrOutList:any;
  selectedTrOutNo:any;
  transferOutList:any;
  today:any;
  dateFormat:any;
  canViewCost:any;
  storeId=3;
  TransferOutDetailsDatagrid:any;
  NET_COST:any;
  updatedItems: any[] = [];
  
  constructor(private service:DataService,private ref: ChangeDetectorRef){
    this.today = this.formatDate();
    const settingsData=sessionStorage.getItem('settings');
    const data = settingsData ? JSON.parse(settingsData) : null;
    this.dateFormat = data ? data.DATE_FORMAT : 'MM/dd/yyyy';

    const userData=sessionStorage.getItem('data');
    const data1 =  userData ? JSON.parse(userData) : null;
    this.canViewCost = data1 ? data1.CAN_VIEW_COST : false;
  }
  transferInData:any = {
    COMPANY_ID:1,
    USER_ID:1,
    STORE_ID:this.storeId,
    ORIGIN_STORE_ID:'',
    TRIN_DATE:new Date,
    TROUT_ID:'',
    NARRATION:'',
  }
  

  newTransferInData = this.transferInData;
  getNewTransferInData = () => ({ ...this.newTransferInData});

  formatDate(): string { 
  
    const date = new Date();
  
    // Format the date using the user's system locale
    const formattedDate = date.toLocaleDateString(); // Formats according to the user's system date format
  
    return formattedDate; // Return only the date part
  }

  getStoreList(){
    this.service.getDropdownData('STORE').subscribe(res=>{
      this.StoreList = res.filter(store => store.ID !== this.storeId && store.ID !==1 )
    })
  }

  onStoreValueChanged(e:any){
    const storeid=e.value;
    this.service.getPendingTransferOutList(this.storeId,storeid).subscribe((res:any)=>{
      this.transferOutList=res.data;
      // this.newReturnData.SUPP_ID= supplierid;
      this.filteredTrOutList = [...this.transferOutList];
      console.log(this.filteredTrOutList,"filteredoutlist")
  })
}

  onGridBoxValueChanged(e: any): void {
    if (e.value) {
      this.isGridBoxOpened = false;
      this.ref.detectChanges();
      const selectedTrout = e.value;
      console.log(selectedTrout,"+")
  
      if (selectedTrout) {
        const Trout_ID = selectedTrout[0].ID;
        this.newTransferInData.TROUT_ID = Trout_ID;
        // this.newReturnData.GRN_NO = this.selectedTrOutNo[0].GRN_NO;
        // console.log(grnId, "grnID");
        // this.SupplierCurrencySymbol=selectedGrn[0].CURRENCY_SYMBOL
        this.getTransferOutDetails(Trout_ID);
      }
    }
  }

  getTransferOutDetails(troutid: any) {
    this.service.selectTransferOutData(troutid).subscribe((res: any) => {
        console.log(res, "res");

        this.TransferOutDetailsDatagrid = res.TransferOutDetail
            .filter((item: any) => item.RECEIVED_QTY < item.QUANTITY) // Only include items where RECEIVED_QTY < QUANTITY
            .filter((item: any, index: number, self: any[]) => 
                index === self.findIndex((t) => t.ITEM_ID === item.ITEM_ID) // Keep only the first occurrence of ITEM_ID
            )
            .map((item: any, index: number) => ({
                ...item,
                SL_NO: index + 1, // Assign sequential SL_NO
                QTY_TO_RECEIVE: item.QUANTITY - item.RECEIVED_QTY
            }));
    });
}

  onTroutSelected(e:any){

  }

  updateCell(event:any){
    console.log(event,"event");
        const updatedRow = event.key; // Get the updated row
        const updatedData = event.data; // Get the updated data
        console.log(updatedData,"updateddata");
        if ('QTY' in updatedData) {
          
          const qty_issued = updatedData.QUANTITY;
          const received_qty = updatedData.RECEIVED_QTY;
          const unit_cost = updatedData.COST;
          const qty_to_receive = updatedData.QTY_TO_RECEIVE;
          const qty = updatedData.QTY
          
          updatedRow.TOTAL_COST =  qty*unit_cost;

    
          if (qty > qty_to_receive) {
            // Show a notification if the condition is met
    
            notify(
              {
                message: 'Qty can\'t be higher than available qty',
                position: { at: 'top right', my: 'top right' },
              },
              'error',2000
            );
            
            // Optionally reset the QTY_RECEIVED field or prevent further processing
            updatedRow.QTY = ''; // Reset to QTY_TO_RECEIVE value
            
            return; // Exit the function to prevent further processing
          }
           
          this.NET_COST = this.TransferOutDetailsDatagrid.reduce((sum, item) => {
            return sum + Number(item.TOTAL_COST || 0);
          }, 0).toFixed(2);

         // Add the updated row to the array of updated items
          const existingIndex = this.updatedItems.findIndex(
            (item) => item.SL_NO === updatedRow.SL_NO
          );
    
          if (existingIndex > -1) {
            // Update the existing row in the array
            this.updatedItems[existingIndex] = { ...updatedRow };
          } else {
            // Add the new row to the array
            this.updatedItems.push({ ...updatedRow });
          }
    
          console.log(this.updatedItems, "All Updated Rows");
    
          const bindedData = this.updatedItems.map((item) => ({
            COMPANY_ID: 1, // Static value or dynamically set if needed
            STORE_ID: this.storeId,
            TROUT_DETAIL_ID : item.ID,
            ORIGIN_STORE_ID : this.newTransferInData.ORIGIN_STORE_ID,
            ITEM_ID: item.ITEM_ID,
            UOM: item.UOM,
            ISSUE_QTY : item.QUANTITY,
            QUANTITY: Number(item.QTY),
            COST: Number(item.COST),
            BATCH_NO: item.BATCH_NO,
            EXPIRY_DATE: item.EXPIRY_DATE
          }));
    
          console.log(bindedData,"binded data");
    
          // Ensure GRNDetail is initialized as an array if not already
        if (!Array.isArray(this.newTransferInData.TransferInDetail)) {
          this.newTransferInData.TransferInDetail = [];
        }
    
        // Add only unique items to GRNDetail
        bindedData.forEach((item) => {
          const isDuplicate = this.newTransferInData.TransferInDetail.some(
            (existingItem) =>
              existingItem.ITEM_ID === item.ITEM_ID
          );
    
          if (!isDuplicate) {
            this.newTransferInData.TransferInDetail.push(item);
          }
        });
    
    }
  }

  highlightEditableColumns(event: any) {
    if (event.rowType === 'data' && event.column.allowEditing) {
      // Apply a custom style for editable cells
      event.cellElement.style.backgroundColor = '#fff3cd'; // Soft yellow background
      event.cellElement.style.color = '#856404'; // Dark yellow text
      event.cellElement.style.fontWeight = 'bold';
    }
  }

  ngOnInit(): void {
    this.getStoreList();
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
    DxValidatorModule,
    DxProgressBarModule,
    DxTabsModule,
    DxTabPanelModule,
    DxPopupModule,
    DxButtonModule,
    DxDropDownBoxModule
  ],
  providers: [],
  declarations: [TransferInNewFormComponent],
  exports: [TransferInNewFormComponent],
})
export class TransferInNewFormModule {}
