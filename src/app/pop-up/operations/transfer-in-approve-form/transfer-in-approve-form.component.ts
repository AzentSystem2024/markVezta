import { ChangeDetectorRef, Component, Input, NgModule, SimpleChanges } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxTabsModule, DxTabPanelModule, DxPopupModule, DxDropDownBoxModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-transfer-in-approve-form',
  templateUrl: './transfer-in-approve-form.component.html',
  styleUrls: ['./transfer-in-approve-form.component.scss']
})
export class TransferInApproveFormComponent {
  @Input() formdata: any;
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
    TRIN_NO:'',
    COMPANY_ID:1,
    USER_ID:1,
    STORE_ID:this.storeId,
    ORIGIN_STORE_ID:'',
    TRIN_DATE:new Date,
    TROUT_ID:'',
    NARRATION:'',
    TransferOutDetail:[]
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

  onContentReady(event:any){
    this.NET_COST = this.TransferOutDetailsDatagrid.reduce((sum, item) => {
      return sum + Number(item.TOTAL_COST || 0);
    }, 0).toFixed(2);
  }

  updateCell(event:any){
    console.log(event,"event");
        const updatedRow = event.key; // Get the updated row
        const updatedData = event.data; // Get the updated data
        console.log(updatedData,"updateddata");
        console.log(updatedRow,"updatedRow");
        if ('QUANTITY' in updatedData) {
          
          const qty_issued = updatedData.ISSUE_QTY;
          const received_qty = updatedData.RECEIVED_QTY;
          const unit_cost = updatedData.COST;
          const qty_to_receive = updatedData.QTY_TO_RECEIVE;
          const qty = updatedData.QUANTITY
          
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
            updatedRow.QUANTITY = ''; // Reset to QTY_TO_RECEIVE value
            
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
            TROUT_DETAIL_ID : item.TROUT_DETAIL_ID,
            ORIGIN_STORE_ID : updatedData.ORIGIN_STORE_ID,
            ITEM_ID: item.ITEM_ID,
            UOM: item.UOM,
            ISSUE_QTY : item.ISSUE_QTY,
            QUANTITY: Number(item.QUANTITY),
            COST: Number(item.COST),
            BATCH_NO: item.BATCH_NO,
            EXPIRY_DATE: item.EXPIRY_DATE
          }));
    
          console.log(bindedData,"binded data");
    
        bindedData.forEach((item) => {
          const detailItemIndex = this.newTransferInData.TransferInDetail.findIndex(
            (detailItem: any) => detailItem.ITEM_ID === item.ITEM_ID
          );

          console.log(detailItemIndex,"detailItemIndex")
        
          if (detailItemIndex !== -1) {
            // If item already exists in GRNDetails, update it
            const existingItem = this.newTransferInData.TransferInDetail[detailItemIndex];
            
            console.log(existingItem,"existingItem");
            // Update only the fields that need to be changed, keeping the ID intact
            this.newTransferInData.TransferInDetail[detailItemIndex] = {
              ...existingItem, // Keep the existing item fields intact
              QUANTITY:updatedData.QUANTITY
            };
            console.log(this.newTransferInData.TransferInDetail,"if");

          } else {
            // If item does not exist, add it to GRNDetails
            this.newTransferInData.TransferInDetail.push({ ...item });

            console.log(this.newTransferInData.TransferInDetail,"else");
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.formdata && changes.formdata.currentValue) {
      console.log(this.formdata,"formdata");

      this.today=this.formdata.TRIN_DATE

      this.newTransferInData = { ...this.formdata };

      this.newTransferInData.TransferInDetail = this.formdata.TransferInDetail; 

      this.selectedTrOutNo = this.formdata.TRIN_NO
      
      this.newTransferInData.ORIGIN_STORE_ID = this.formdata.ORIGIN_STORE_ID

      this.TransferOutDetailsDatagrid = this.newTransferInData.TransferInDetail.filter((item: any, index: number, self: any[]) => 
      index === self.findIndex((t) => t.ITEM_ID === item.ITEM_ID) // Keep only the first occurrence of ITEM_ID
    ).map((item, index) => ({
        ...item,
        SL_NO: index + 1, // Add SL_NO starting from 1
        QTY_TO_RECEIVE : item.ISSUE_QTY - item.RECEIVED_QTY,
        ORIGIN_STORE_ID : this.newTransferInData.ORIGIN_STORE_ID,
        TOTAL_COST : item.QUANTITY* item.COST
      }));

      this.newTransferInData.TransferInDetail= this.TransferOutDetailsDatagrid.map((item) => ({
        ID:item.ID,
        COMPANY_ID: 1, // Static value or dynamically set if needed
        STORE_ID: this.storeId,
        TROUT_DETAIL_ID : item.TROUT_DETAIL_ID,
        ORIGIN_STORE_ID : item.ORIGIN_STORE_ID,
        ITEM_ID: item.ITEM_ID,
        UOM: item.UOM,
        ISSUE_QTY : item.ISSUE_QTY,
        QUANTITY: Number(item.QUANTITY),
        COST: Number(item.COST),
        BATCH_NO: item.BATCH_NO,
        EXPIRY_DATE: item.EXPIRY_DATE,
      }));

      console.log(this.TransferOutDetailsDatagrid,"TransferOutDetailsDatagrid")
      console.log(this.newTransferInData.TransferInDetail,"TransferInDetail")

      this.NET_COST = this.newTransferInData.TransferInDetail
       .reduce((sum, item) => sum + (item.TOTAL_COST || 0), 0)

    } 
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
  declarations: [TransferInApproveFormComponent],
  exports: [TransferInApproveFormComponent],
})
export class TransferInApproveFormModule {}
