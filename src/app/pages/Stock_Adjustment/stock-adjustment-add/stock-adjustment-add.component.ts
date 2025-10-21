import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
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
  DxValidationGroupComponent,
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

import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source'
import notify from 'devextreme/ui/notify';
import { Console } from 'console';

@Component({
  selector: 'app-stock-adjustment-add',
  templateUrl: './stock-adjustment-add.component.html',
  styleUrls: ['./stock-adjustment-add.component.scss']
})
export class StockAdjustmentAddComponent {

    @ViewChild('popupGridRef', { static: false })

    popupGridRef!: DxDataGridComponent;
    @ViewChild('validationGroup', { static: false })
validationGroup!: DxValidationGroupComponent;

      @Output()  popupClosed = new EventEmitter<void>
       @Input() EditingResponseData:any={}
        @Input() isEditing:boolean=false
    readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  isPopupVisible: boolean = false;
  items: any[] = [];
  // itemsForInventory: any[] = [];
  barcodeList: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  matrix: any;
  storeFromSession: any;
  stores: any;
  reasons: any;

  adjustmentFormData: any = {
  COMPANY_ID: 0,
  STORE_ID: 0,
  ADJ_NO: "",
  ADJ_DATE: new Date(),
  REASON_ID: 0,
  FIN_ID: 0,
  TRANS_ID: 0,
  CREDIT_HEAD_ID: 0,
  NET_AMOUNT: 0,
  NARRATION: "",
  Details: [
    
  ]
};

  userID: any;
  finID: any;
  companyID: any;
  totalAmount: any;
  ENABLE_Matrix_Code: any;

constructor(private dataService: DataService, private router: Router) {}
  ngOnInit() {
    this.isEditDataAvailable();
  this.get_item_list_Data()
    // this.getTransferNo(); // always fetch fresh number when popup opens

    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData==================:', menuResponse);
    console.log(menuResponse.GeneralSettings.ENABLE_MATRIX_CODE);
    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.Companies[0].COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuResponse.Configuration[0].STORE_ID);
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;
    console.log(this.storeFromSession)
    console.log(menuResponse.MenuGroups)
    const packingRights = menuResponse.MenuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/stock-adjustment');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
    console.log(this.canApprove,'==============')
    if (menuResponse.GeneralSettings.ENABLE_MATRIX_CODE == true) {
      // this.getItemsList();
    } else {
      // this.getItemsList();
    }
    this.getStoreDropdown();
    this.getReasonsDropdown();
    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete,this.canApprove);
    // this.items = [];
    // this.addEmptyRow();  
        this.ENABLE_Matrix_Code=menuResponse.GeneralSettings.ENABLE_MATRIX_CODE
    console.log(this.ENABLE_Matrix_Code)
  
  }
onSelectItems() {
  const selectedRows = this.popupGridRef.instance.getSelectedRowsData();
  console.log(selectedRows);

  if (selectedRows && selectedRows.length > 0) {
    selectedRows.forEach((row) => {
      const exists = this.adjustmentFormData.Details.some(
        (item) => item.ITEM_CODE === row.ITEM_CODE
      );

      if (!exists) {
        let adjQty = 0;
        let amount = 0;

        // ✅ calculate only if NEW_QTY has a value
        if (row.NEW_QTY !== null && row.NEW_QTY !== undefined && row.NEW_QTY !== '') {
          adjQty = row.NEW_QTY - (row.STOCK_QTY || 0);
          amount = adjQty * (row.COST || 0);
        }

        const detailItem = {
          SL_NO: this.adjustmentFormData.Details.length + 1,
          ITEM_ID: row.ITEM_ID,
          ITEM_CODE: row.ITEM_CODE,
          DESCRIPTION: row.DESCRIPTION,
          COST: row.COST,
          STOCK_QTY: row.STOCK_QTY,
          NEW_QTY: row.NEW_QTY || null,   // keep null if not entered
          ADJ_QTY: adjQty,
          AMOUNT: amount,
        };

        this.adjustmentFormData.Details.push(detailItem);
      }
    });

    // refresh for DevExtreme grid
    this.adjustmentFormData.Details = [...this.adjustmentFormData.Details];

    // clear popup selection
    // this.popupGridRef.instance.clearSelection();
    this.isPopupVisible = false;
  }

  console.log(this.adjustmentFormData.Details, '======================');
}

    getReasonsDropdown() {
    this.dataService.getrReasonDropdownData('REASONS').subscribe((response: any) => {
      this.reasons = response;
    });
  }
    getStoreDropdown() {
    this.dataService.getDropdownData('STORE').subscribe((response: any) => {
      this.stores = response
    });
  }
get_item_list_Data(){
   const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData==================:', menuResponse);
    console.log(menuResponse.GeneralSettings.ENABLE_MATRIX_CODE);
    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.Companies[0].COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuResponse.Configuration[0].STORE_ID);
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;
    console.log(this.storeFromSession)

  
  const payload={
  STORE_ID:this.storeFromSession
  }
  
  console.log(payload)
  this.dataService.Get_item_list(payload).subscribe((res:any)=>{
    console.log(res)
    this.items=res.Data
  })
}
  cancel(){
    this.popupClosed.emit()

  }d
  onAddItems(){
    this.isPopupVisible=true

    

  }
  onPopupHiding(){

  }
  updateNetAmount(event:any){

  }
  SaveStockAdjustment(){  
    console.log(this.adjustmentFormData)
    const ITEM_Details=this.adjustmentFormData.Details
    console.log(ITEM_Details)

    const transformed = ITEM_Details.map(item => ({
            COMPANY_ID: this.companyID,
      STORE_ID: this.adjustmentFormData.STORE_ID,
      ADJ_ID: 0,
      NET_AMOUNT:0,

  REASON_ID: this.adjustmentFormData.REASON_ID,                      
  ITEM_ID: item.ITEM_ID,               // map from old
  COST: item.COST,
  STOCK_QTY: item.STOCK_QTY,       // rename
  NEW_QTY: Number(item.NEW_QTY),       // ensure number
  ADJ_QTY: item.ADJ_QTY,
  AMOUNT: item.AMOUNT,
  BATCH_NO: "",                  // default placeholder
  EXPIRY_DATE: new Date().toISOString() // current date-time
}));

console.log(transformed)
const date = this.formatDate(this.adjustmentFormData.ADJ_DATE);


    const payload={
      ...this.adjustmentFormData,
      ADJ_DATE:date,
      COMPANY_ID:this.companyID,
      FIN_ID:this.finID,
      NET_AMOUNT:this.totalAmount,
      Details:transformed
    }
    console.log(payload)

       if (!this.adjustmentFormData.STORE_ID) {
      notify('Please select a store ', 'error');
      return;
    }
    if (!this.adjustmentFormData.REASON_ID) {
      notify('Please select a reason', 'error');
      return;
    }
    if (
      !this.adjustmentFormData.Details ||
      this.adjustmentFormData.Details.length === 0
    ) {
      notify('Please add at least one item', 'error');
      return;
    }


    this.dataService.Insert_Stock_Adjustment_Data(payload).subscribe((res:any)=>{

      console.log(res)
            notify(
                                         {
                                    message: ' Stock Adjustment Inserted successfully',
                                    position: { at: 'top right', my: 'top right' },
                                    displayTime: 1000,
                                  },
                                  'success'
                                );
                  this.popupClosed.emit()
    })

  }
   formatDate(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;
    const data = this.EditingResponseData;
console.log(data)
    
    this.adjustmentFormData = {
      ID: data.ID,
      ADJ_DATE: data.ADJ_DATE,
      REASON_ID: data.REASON_ID,
      Details: data.Details ? [...data.Details] : [],
      NARRATION: data.NARRATION || '',
      NET_AMOUNT: data.NET_AMOUNT,
      STORE_ID:data.STORE_ID
    };
    console.log(this.adjustmentFormData,'================edit==============')
  }
onEditorPreparing(event: any) {

    const rowData = event.row.data;
    // calculate adj_qty only for this row
    rowData.ADJ_QTY = rowData.NEW_QTY - rowData.STOCK_QTY;
    console.log("Updated row:", rowData);
    rowData.AMOUNT= rowData.ADJ_QTY * rowData.COST
 rowData.REASON_ID = this.adjustmentFormData.REASON_ID; 
      // 🔥 calculate total amount across all rows
  this.totalAmount = this.adjustmentFormData.Details.reduce(
    (sum, item) => sum + (item.AMOUNT || 0),
    0
  );

  console.log("Updated row:", rowData);
  console.log("Total Amount:", this.totalAmount);
  this.adjustmentFormData.NET_AMOUNT=this.totalAmount
  
}
onSelectPackAdd(e:any){

}
onEditPackUpdate(e:any){
  
}

onCellValueChanged(e: any) {
  console.log(e,'===============pppppppppp==============  ')
  
    const row = e.row.data;

    // calculate Adjustment Stock
    row.ADJ_QTY = (row.NEW_QTY || 0) - (row.STOCK_QTY || row.STOCK_QTY || 0);

    // calculate Amount also
    row.AMOUNT = (row.ADJ_QTY || 0) * (row.COST || 0);

    // force UI refresh
    e.component.refresh(true);
 
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
   
  ],
  providers: [],
  declarations: [StockAdjustmentAddComponent],
  exports: [StockAdjustmentAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StockAdjustmentAddModule {}
