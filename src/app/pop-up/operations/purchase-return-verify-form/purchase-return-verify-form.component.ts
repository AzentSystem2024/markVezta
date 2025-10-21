import { ChangeDetectorRef, Component, Input, NgModule, SimpleChanges } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxTabsModule, DxTabPanelModule, DxPopupModule, DxDropDownBoxModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-purchase-return-verify-form',
  templateUrl: './purchase-return-verify-form.component.html',
  styleUrls: ['./purchase-return-verify-form.component.scss']
})
export class PurchaseReturnVerifyFormComponent {
  @Input() formdata: any;
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

  returnData:any = {
    RET_DATE:new Date,
    COMPANY_ID:1,
    STORE_ID:3,
    USER_ID:1,
    SUPP_ID:'',
    RET_NO:'',
    NARRATION:'',
    GRN_ID:'',
    GRN_NO:'',
    GROSS_AMOUNT:'',
    VAT_AMOUNT:'',
    NET_AMOUNT:'',
    PurchDetail:[]
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
      this.newReturnData.GRN_NO = this.selectedGrnNo;
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
    if ('QUANTITY' in updatedData) {
      const price = updatedData.RATE;
      const qty_to_return = updatedData.QUANTITY;
      const qty_available = updatedData.QTY_STOCK; 
      const supp_price= updatedData.SUPP_PRICE;
      const disc_percentage = updatedData.DISC_PERCENT;
      const vat_percentage = updatedData.VAT_PERC
      const amount = qty_to_return * price;
      const supp_amount = qty_to_return * supp_price;
      const disc_amount = amount*(disc_percentage/100)
      const supp_disc_amount = supp_amount*(disc_percentage/100);
      const grnqty = updatedData.GRN_QTY ;
      const qtytoreturn = updatedData.QUANTITY

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
        updatedRow.QUANTITY = ''; // Reset to QTY_TO_RECEIVE value
        
        return; // Exit the function to prevent further processing
      }
      updatedRow.AMOUNT = (amount- disc_amount).toFixed(2);
      const vat_amount = updatedRow.AMOUNT*(vat_percentage/100);
      updatedRow.SUPP_AMOUNT = (supp_amount- supp_disc_amount).toFixed(2);
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
        GRN_QTY: item.GRN_QTY,
        QUANTITY: Number(item.QUANTITY),
        RATE: Number(item.RATE),
        AMOUNT: Number(item.AMOUNT),

        VAT_PERC: Number(item.VAT_PERC),
        VAT_AMOUNT: Number(item.VAT_AMOUNT),

        TOTAL_AMOUNT:  Number(item.TOTAL_AMOUNT),

        BATCH_NO: "",
        
        EXPIRY_DATE: "2026-06-30T00:00:00",
       
        UOM_PURCH: item.UOM_PURCH,
        UOM: item.UOM,
        UOM_MULTIPLE:Number(item.UOM_MULTPLE)
      }));

      console.log(bindedData,"binded data");

      bindedData.forEach((item) => {
        const detailItemIndex = this.newReturnData.PurchDetail.findIndex(
          (detailItem: any) => detailItem.ITEM_ID === item.ITEM_ID
        );
      
        if (detailItemIndex !== -1) {
          // If item already exists in GRNDetails, update it
          const existingItem = this.newReturnData.PurchDetail[detailItemIndex];
          
          // Update only the fields that need to be changed, keeping the ID intact
          this.newReturnData.PurchDetail[detailItemIndex] = {
            ...existingItem, // Keep the existing item fields intact
            QUANTITY: item.QUANTITY,
            RATE: item.RATE,
            AMOUNT: item.AMOUNT,
            TOTAL_AMOUNT:  Number(item.TOTAL_AMOUNT),
            UOM_PURCH: item.UOM_PURCH,
            UOM: item.UOM,
            BATCH_NO: "",
            VAT_PERC: Number(item.VAT_PERC),
            VAT_AMOUNT: Number(item.VAT_AMOUNT),
            EXPIRY_DATE: "2026-06-30T00:00:00",
          };
        } else {
          // If item does not exist, add it to GRNDetails
          this.newReturnData.PurchDetail.push({ ...item });
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.formdata && changes.formdata.currentValue) {
      console.log(this.formdata,"formdata");

      this.SupplierCurrencySymbol=this.formdata.CURRENCY_SYMBOL

      this.today=this.formdata.RET_DATE
                    
      this.cwidth = '100';

      this.selectedGrnNo=16;

      this.newReturnData = { ...this.formdata };

      this.newReturnData.PurchDetail = this.formdata.PurchDetail; 


      this.grnDetails = this.newReturnData.PurchDetail.filter((item: any, index: number, self: any[]) => 
      index === self.findIndex((t) => t.ITEM_ID === item.ITEM_ID) // Keep only the first occurrence of ITEM_ID
    ).map((item, index) => ({
        ...item,
        SL_NO: index + 1, // Add SL_NO starting from 1
        SUPP_AMOUNT : (item.QUANTITY*item.SUPP_PRICE)-((item.QUANTITY*item.SUPP_PRICE)*item.DISC_PERCENT/100),
        SUPP_TOTAL_AMOUNT : (item.QUANTITY*item.SUPP_PRICE)-((item.QUANTITY*item.SUPP_PRICE)*item.DISC_PERCENT/100)
      }));

      console.log(this.grnDetails,"grndetails")
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
  declarations: [PurchaseReturnVerifyFormComponent],
  exports: [PurchaseReturnVerifyFormComponent],
})
export class PurchaseReturnVerifyFormModule {}
