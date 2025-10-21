import { Component, Input, NgModule, SimpleChanges } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxTabsModule, DxTabPanelModule, DxPopupModule, DxDropDownBoxModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-transfer-out-approve-form',
  templateUrl: './transfer-out-approve-form.component.html',
  styleUrls: ['./transfer-out-approve-form.component.scss']
})
export class TransferOutApproveFormComponent {
  @Input() formdata: any;
  isItemsPopVisible:boolean=false;
    isScanPopVisible:boolean=false;
    isQuantityVisible: boolean = false;
    QuickScanQty:any;
    QuickScanBarcode:any;
    width:any= '100vw';
    height : any ='80vh';
    today:any;
    dateFormat:any;
    storeItemsDataGrid:any;
    selectedItems:any;
    savedItemsDataGrid:any;
    storesList:any;
    storeId=2;
    canViewCost:boolean = false;
    cwidth:any;
    updatedItems: any[] = [];

    transferOutData:any = {
      COMPANY_ID:1,
      STORE_ID: this.storeId,
      TRANSFER_NO:'',
      TRANSFER_DATE: new Date,
      DEST_STORE_ID:'',
      NET_AMOUNT:'',
      NET_QUANTITY:'',
      NARRATION:'',
      TransferOutDetail:[]
      }
  
    newTransferOutData = this.transferOutData;
    getNewTransferOutData = () => ({ ...this.newTransferOutData });

    constructor(private service : DataService){
      this.today = this.formatDate();
      console.log(this.today,"today")
      const settingsData=sessionStorage.getItem('settings');
      const data = settingsData ? JSON.parse(settingsData) : null;
      this.dateFormat = data ? data.DATE_FORMAT : 'MM/dd/yyyy';

      const userData=sessionStorage.getItem('data');
      const data1 =  userData ? JSON.parse(userData) : null;
      this.canViewCost = data1 ? data1.CAN_VIEW_COST : false;
      if(this.canViewCost){
        this.cwidth= '893'
      }
      else{
        this.cwidth= '999'
      }

      console.log(this.dateFormat,"date")
    }

    onItemsSelectionChanged(event:any){
      this.selectedItems = event.selectedRowsData;
      console.log(this.selectedItems,"selected items")
    }

    SaveItems() {
      if (!this.selectedItems || this.selectedItems.length === 0) {
        return;
      }
    
      const existingItemIDs = new Set(this.savedItemsDataGrid.map(item => item.ITEM_ID));
      const newUniqueItems = this.selectedItems.filter(item => !existingItemIDs.has(item.ITEM_ID));
    
      if (this.selectedItems.length === 1 && newUniqueItems.length === 0) {
       // Notify for single duplicate item
        notify(
          {
            message: 'Item Already Exists!',
            position: { at: 'top right', my: 'top right' },
          },
          'error',2000
        );
        return;
      }
    
      // Add only the new unique items
      this.savedItemsDataGrid = [
        ...this.savedItemsDataGrid,
        ...newUniqueItems.map((item, index) => ({
          ...item,
          SL_NO: this.savedItemsDataGrid.length + index + 1, // Serial number continues from existing items
        }))
      ];
    
      this.isItemsPopVisible = false;
    }

    updateCell(event:any){
      console.log(event,"event");
        const updatedRow = event.key; // Get the updated row
        const updatedData = event.data; // Get the updated data
        console.log(updatedData,"updateddata");
        if ('QUANTITY' in updatedData) {
          
          const qty_issued = updatedData.QUANTITY;
          const qty_available = updatedData.QTY_STOCK;
          const unit_cost = updatedData.COST;
          
          updatedRow.AMOUNT =  qty_issued*unit_cost;

    
          if (qty_issued > qty_available) {
            // Show a notification if the condition is met
    
            notify(
              {
                message: 'Qty issued can\'t be higher than available qty',
                position: { at: 'top right', my: 'top right' },
              },
              'error',2000
            );
            
            // Optionally reset the QTY_RECEIVED field or prevent further processing
            updatedRow.QUANTITY = ''; // Reset to QTY_TO_RECEIVE value
            
            return; // Exit the function to prevent further processing
          }
          
    
         
          this.newTransferOutData.NET_AMOUNT = this.savedItemsDataGrid.reduce((sum, item) => {
            return sum + Number(item.AMOUNT || 0);
          }, 0).toFixed(2);

          this.newTransferOutData.NET_QUANTITY = this.savedItemsDataGrid.reduce((sum, item) => {
            return sum + Number(item.QUANTITY || 0);
          }, 0); 
    
          //Add the updated row to the array of updated items
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
            ITEM_ID: item.ITEM_ID,
            UOM: item.UOM,
            QUANTITY: Number(item.QUANTITY),
            COST: Number(item.COST),
            AMOUNT: Number(item.AMOUNT),   
            BATCH_NO: "",           
            EXPIRY_DATE: "",
          }));
    
          console.log(bindedData,"binded data");
    
        bindedData.forEach((item) => {
          const detailItemIndex = this.newTransferOutData.TransferOutDetail.findIndex(
            (detailItem: any) => detailItem.ITEM_ID === item.ITEM_ID
          );

          console.log(detailItemIndex,"detailItemIndex")
        
          if (detailItemIndex !== -1) {
            // If item already exists in GRNDetails, update it
            const existingItem = this.newTransferOutData.TransferOutDetail[detailItemIndex];
            
            console.log(existingItem,"existingItem");
            // Update only the fields that need to be changed, keeping the ID intact
            this.newTransferOutData.TransferOutDetail[detailItemIndex] = {
              ...existingItem, // Keep the existing item fields intact
              QUANTITY: item.QUANTITY,
              AMOUNT : item.AMOUNT
            };
            console.log(this.newTransferOutData.TransferOutDetail,"if");

          } else {
            // If item does not exist, add it to GRNDetails
            this.newTransferOutData.TransferOutDetail.push({ ...item });

            console.log(this.newTransferOutData.TransferOutDetail,"else");
          }
        });
    
    }
    }

    formatDate(): string { 
  
      const date = new Date();
    
      // Format the date using the user's system locale
      const formattedDate = date.toLocaleDateString(); // Formats according to the user's system date format
    
      return formattedDate; // Return only the date part
    }

  openItems(){
    this.isItemsPopVisible=true;
  }

  getStoreItemsList() {
    this.service.getTransferOutGetStoreItems(this.storeId).subscribe(res => {
      if (res && res.data) {
        // Use Map to filter out duplicate ITEM_ID values
        const uniqueItems = Array.from(
          new Map(res.data.map(item => [item.ITEM_ID, item])).values()
        );
  
        this.storeItemsDataGrid = uniqueItems;
      }
    });
  }

  openQuickScan(){
    this.isScanPopVisible=true;
  }
  clearQuickScan(){
    this.isScanPopVisible=false;
    this.isQuantityVisible=false;
    this.QuickScanQty = '';
    this.QuickScanBarcode='';
  }

  addScannedItem() {
    if (!this.QuickScanBarcode) {
      notify(
        {
          message: 'Please enter the barcode',
          position: { at: 'top right', my: 'top right' },
        },
        'error',2000
      );
      return;
    }
  
    // Find the item in storeItemsDataGrid
    const foundItem = this.storeItemsDataGrid.find(
      item => item.BAR_CODE === this.QuickScanBarcode
    );

    console.log(foundItem,"found item");
  
    if (foundItem) {
      // Check if the item already exists in savedItemsDataGrid
      const existingItem = this.savedItemsDataGrid.find(
        item => item.BAR_CODE === this.QuickScanBarcode
      );
      
      console.log(existingItem,"existingItem")
      console.log(this.savedItemsDataGrid,"savedItemsDataGrid")
  
      if (existingItem) {

        notify(
          {
            message: 'Item already exists!',
            position: { at: 'top right', my: 'top right' },
          },
          'error',2000
        );

      } else {
        // Determine the next SL_NO
        let issuedQty = this.isQuantityVisible && this.QuickScanQty ? this.QuickScanQty : '';
        console.log(issuedQty,"issuedQty")

      // Check if issued quantity exceeds available stock
      if (issuedQty > foundItem.QTY_STOCK) {
        notify(
          {
            message: 'Qty issued can\'t be higher than available qty',
            position: { at: 'top right', my: 'top right' },
          },
          'error', 5000
        );

        issuedQty = null; // Set QTY_ISSUED to null
      }

      const total_cost = foundItem.COST * issuedQty

      // Determine the next SL_NO
      const nextSLNo =
        this.savedItemsDataGrid.length > 0
          ? Math.max(...this.savedItemsDataGrid.map(item => item.SL_NO)) + 1
          : 1;

      // Add a new entry
      this.savedItemsDataGrid.push({
        ...foundItem,
        SL_NO: nextSLNo,
        QUANTITY: issuedQty,
        AMOUNT : total_cost
      });

        notify(
          {
            message: 'Item added successfully!',
            position: { at: 'top right', my: 'top right' },
          },
          'success',2000
        );

        this.isQuantityVisible=false;
        this.QuickScanQty = '';
        this.QuickScanBarcode='';
      }
    } 

      // notify("Item added successfully!", "success", 2000);
      // this.clearQuickScan(); // Clear the form after adding
    else {

      notify(
        {
          message: 'Item not found!',
          position: { at: 'top right', my: 'top right' },
        },
        'error',2000
      );

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

  getStoresLIst(){
    this.service.getDropdownData('STORE').subscribe(res=>{
      this.storesList = res.filter(store => store.ID !== this.storeId);
    })
  }

  onContentReady(event:any){
    this.newTransferOutData.NET_AMOUNT = this.savedItemsDataGrid.reduce((sum, item) => {
      return sum + Number(item.AMOUNT || 0);
    }, 0).toFixed(2);

    this.newTransferOutData.NET_QUANTITY = this.savedItemsDataGrid.reduce((sum, item) => {
      return sum + Number(item.QUANTITY || 0);
    }, 0); 
  }

  ngOnInit(): void {
    this.getStoreItemsList();
    this.getStoresLIst();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.formdata && changes.formdata.currentValue) {
      console.log(this.formdata,"formdata");

      this.today=this.formdata.TRANSFER_DATE

      this.newTransferOutData = { ...this.formdata };

      this.newTransferOutData.TransferOutDetail = this.formdata.TransferOutDetail; 

      this.savedItemsDataGrid = this.newTransferOutData.TransferOutDetail.filter((item: any, index: number, self: any[]) => 
      index === self.findIndex((t) => t.ITEM_ID === item.ITEM_ID) // Keep only the first occurrence of ITEM_ID
    ).map((item, index) => ({
        ...item,
        SL_NO: index + 1, // Add SL_NO starting from 1
        QUANTITY: item.QUANTITY,
        AMOUNT : item.AMOUNT
      }));

      this.newTransferOutData.NET_QUANTITY = this.newTransferOutData.TransferOutDetail
       .reduce((sum, item) => sum + (item.QUANTITY || 0), 0)

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
    DxDropDownBoxModule,
  ],
  providers: [],
  declarations: [TransferOutApproveFormComponent],
  exports: [TransferOutApproveFormComponent],
})
export class TransferOutApproveFormModule {}