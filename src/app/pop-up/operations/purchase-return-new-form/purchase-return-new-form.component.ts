import { ChangeDetectorRef, Component, NgModule, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxTabsModule, DxTabPanelModule, DxPopupModule, DxDropDownBoxModule } from 'devextreme-angular';
import { DxoSummaryModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-purchase-return-new-form',
  templateUrl: './purchase-return-new-form.component.html',
  styleUrls: ['./purchase-return-new-form.component.scss']
})
export class PurchaseReturnNewFormComponent implements OnInit {
  updatedItems: any[] = [];
  cwidth:any='any';
  supplierList:any;
  today:any;
  localCurrencyId:any;
  localCurrencySymbol:any;
  grnList:any;
  filteredGrnList:any;
  isGridBoxOpened:boolean=false;
  selectedGrnNo:any;
  SupplierCurrencySymbol:any;
  grnDetails:any;
  needSummaryUpdate: boolean = false;
  negativeAllowed :any;

  returnData:any = {
    RET_DATE:new Date,
    COMPANY_ID:1,
    STORE_ID:3,
    USER_ID:1,
    SUPP_ID:'',
    NARRATION:'',
    GRN_ID:'',
    GROSS_AMOUNT:'',
    VAT_AMOUNT:'',
    NET_AMOUNT:'',
    GRN_NO:'',
    }

    
    newReturnData = this.returnData;
  getNewReturnData = () => ({ ...this.newReturnData });


  constructor(private service:DataService,private ref: ChangeDetectorRef){
    this.today = new Date();        
    const settingsData=sessionStorage.getItem('settings');
    const data = settingsData ? JSON.parse(settingsData) : null;
    // Access CURRENCY_ID
    this.localCurrencyId = data ? data.CURRENCY_ID : null;
    console.log(this.localCurrencyId, "CURRENCY_ID");
    this.localCurrencySymbol= data ? data.CURRENCY_SYMBOL : null;

    this.negativeAllowed = data ? data.NEGATIVE_ALLOWED : false;
  }

  highlightEditableColumns(event: any) {
    if (event.rowType === 'data' && event.column.allowEditing) {
      // Apply a custom style for editable cells
      event.cellElement.style.backgroundColor = '#fff3cd'; // Soft yellow background
      event.cellElement.style.color = '#856404'; // Dark yellow text
      event.cellElement.style.fontWeight = 'bold';
    }
}

  onSupplierValueChanged(e:any){
    const supplierid=e.value;
    this.service.getPendingGrn(supplierid).subscribe((res:any)=>{
      this.grnList=res.data;
      this.newReturnData.SUPP_ID= supplierid;
      this.filteredGrnList = [...this.grnList];
  })
}

onGridBoxValueChanged(e: any): void {
  if (e.value) {
    this.isGridBoxOpened = false;
    this.ref.detectChanges();
    const selectedGrn = e.value;
    console.log(selectedGrn,"+")

    if (selectedGrn) {
      const grnId = selectedGrn[0].GRN_ID;
      this.newReturnData.GRN_ID = grnId;
      this.newReturnData.GRN_NO = this.selectedGrnNo[0].GRN_NO;
      console.log(grnId, "grnID");
      this.SupplierCurrencySymbol=selectedGrn[0].CURRENCY_SYMBOL
      this.getGrnDetails(grnId);
    }
  }
}

updateCell(event:any){
  console.log(event,"event");
    const updatedRow = event.key; // Get the updated row
    const updatedData = event.data; // Get the updated data
    console.log(updatedData,"updateddata");
    if ('QTY_TO_RETURN' in updatedData) {
      const price = updatedData.RATE;
      const qty_to_return = updatedData.QTY_TO_RETURN;
      const qty_available = updatedData.QTY_AVAILABLE; 
      const supp_price= updatedData.SUPP_PRICE;
      const disc_percentage = updatedData.DISC_PERCENT;
      const vat_percentage = updatedData.VAT_PERCENT
      const amount = qty_to_return * price;
      const supp_amount = qty_to_return * supp_price;
      const disc_amount = amount*(disc_percentage/100)
      const supp_disc_amount = supp_amount*(disc_percentage/100);
      const grnqty = updatedData.QUANTITY ;
      const qtytoreturn = updatedData.QTY_TO_RETURN

      if (qtytoreturn > grnqty) {
        // Show a notification if the condition is met

        notify(
          {
            message: 'Qty received can\'t be higher than qty pending',
            position: { at: 'top right', my: 'top right' },
          },
          'error',2000
        );
        
        // Optionally reset the QTY_RECEIVED field or prevent further processing
        updatedRow.QTY_TO_RETURN = ''; // Reset to QTY_TO_RECEIVE value
        
        return; // Exit the function to prevent further processing
      }
      updatedRow.AMOUNT = (amount- disc_amount).toFixed(2);
      const vat_amount = updatedRow.AMOUNT*(vat_percentage/100);
      updatedRow.SUPP_AMOUNT = (supp_amount- disc_amount).toFixed(2);
      updatedRow.VAT_AMOUNT = vat_amount.toFixed(2);

      if(this.SupplierCurrencySymbol !== this.localCurrencySymbol){
        updatedRow.TOTAL_AMOUNT = amount- disc_amount
        updatedRow.SUPP_TOTAL_AMOUNT = supp_amount- disc_amount
        updatedRow.VAT_AMOUNT = 0;
      }
      else{
        updatedRow.VAT_AMOUNT = vat_amount.toFixed(2);
        updatedRow.TOTAL_AMOUNT = (amount- disc_amount) + vat_amount
      }

      this.newReturnData.NET_AMOUNT = this.grnDetails.reduce((sum, item) => {
        return sum + Number(item.TOTAL_AMOUNT || 0);
      }, 0).toFixed(2);

      this.newReturnData.VAT_AMOUNT = this.grnDetails.reduce((sum, item) => {
        return sum + Number(item.VAT_AMOUNT || 0);
      }, 0).toFixed(2);

      this.newReturnData.GROSS_AMOUNT = this.grnDetails.reduce((sum, item) => {
        return sum + Number(item.AMOUNT || 0);
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
        STORE_ID: 3,
        GRN_DET_ID: item.DETAIL_ID,
        ITEM_ID: item.ITEM_ID,
        GRN_QTY: item.QUANTITY,
        QUANTITY: Number(item.QTY_TO_RETURN),
        RATE: Number(item.RATE),
        AMOUNT: Number(item.AMOUNT),

        VAT_PERC: Number(item.VAT_PERCENT),
        VAT_AMOUNT: Number(item.VAT_AMOUNT),

        TOTAL_AMOUNT:  Number(item.TOTAL_AMOUNT),

        BATCH_NO: "",
        
        EXPIRY_DATE: "2026-06-30T00:00:00",
       
        UOM_PURCH: item.UOM_PURCH,
        UOM: item.UOM,
        UOM_MULTIPLE:Number(item.UOM_MULTPLE)
      }));

      console.log(bindedData,"binded data");

      // Ensure GRNDetail is initialized as an array if not already
    if (!Array.isArray(this.newReturnData.PurchDetail)) {
      this.newReturnData.PurchDetail = [];
    }

    // Add only unique items to GRNDetail
    bindedData.forEach((item) => {
      const isDuplicate = this.newReturnData.PurchDetail.some(
        (existingItem) =>
          existingItem.GRN_DET_ID === item.GRN_DET_ID &&
          existingItem.ITEM_ID === item.ITEM_ID
      );

      if (!isDuplicate) {
        this.newReturnData.PurchDetail.push(item);
      }
    });



      this.needSummaryUpdate=true;

}
}

onContentReady(e: any) {
  if (this.needSummaryUpdate) {
    // Refresh the grid to recalculate summary values
    e.component.refresh();
    this.needSummaryUpdate = false; // Reset the flag after refresh
  }
}

getGrnDetails(grnId: any) {
  this.service.getReturnGrnData(grnId).subscribe((res: any) => {
    console.log(res, "res");

    // // Populate poDetails with dynamic SL_NO and other calculations
    // this.grnDetails = res.Grndata.map((item: any, index: number) => ({
    //   ...item,
    //   SL_NO: index + 1, // Add SL_NO property dynamically
    // }));
    // Populate grnDetails with unique ITEM_ID values and dynamic SL_NO
this.grnDetails = res.Grndata
.filter((item: any, index: number, self: any[]) => 
  index === self.findIndex((t) => t.ITEM_ID === item.ITEM_ID) // Keep only the first occurrence of ITEM_ID
)
.map((item: any, index: number) => ({
  ...item,
  SL_NO: index + 1, // Assign sequential SL_NO
}));

    this.cwidth = '100';
})
}



onGrnSelected(e:any){
  const selectedRow = e.selectedRowsData[0];

      console.log(selectedRow,"selected row")
    

      this.ref.detectChanges();
}

  getSupplierData(){
    this.service.getDropdownData('SUPPLIER').subscribe(res=>{
      this.supplierList=res;
    })
  }

  ngOnInit(): void {
    this.getSupplierData();
  }

  clearForm() {
    console.log("formclosed");
    this.newReturnData.SUPP_ID = 0;
    // Reset other variables
    this.updatedItems = [];
 
    this.grnDetails=[];

    this.newReturnData.NARRATION='';
  
    // Close any opened grid boxes
    this.isGridBoxOpened = false;
  
    // Reset date to today's date
    this.today = new Date();
  
    // Clear selected PO number
    this.selectedGrnNo = '';
  
    // Trigger change detection to update the UI
    this.ref.detectChanges();
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
  declarations: [PurchaseReturnNewFormComponent],
  exports: [PurchaseReturnNewFormComponent],
})
export class PurchaseReturnNewFormModule {}
