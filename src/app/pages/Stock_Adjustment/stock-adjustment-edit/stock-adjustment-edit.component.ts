
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
import { confirm } from 'devextreme/ui/dialog';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source'
import notify from 'devextreme/ui/notify';
@Component({
  selector: 'app-stock-adjustment-edit',
  templateUrl: './stock-adjustment-edit.component.html',
  styleUrls: ['./stock-adjustment-edit.component.scss']
})
export class StockAdjustmentEditComponent {
@ViewChild('popupGridRef', { static: false }) popupGridRef!: DxDataGridComponent;
    @Input() EditingResponseData:any={}
    @Output() popupClosed=new EventEmitter<void>
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
  readOnlyTrue:boolean=false
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
    ID:0,
  COMPANY_ID: 0,
  STORE_ID: 0,
  ADJ_NO: "",
  ADJ_DATE: '',
  REASON_ID: 0,
  FIN_ID: 0,
  NET_AMOUNT: 0,
  NARRATION: "",
  Details: [
    
  ]
};

  userID: any;
  finID: any;
  companyID: any;
  totalAmount: any;
  selecte_Date_Details: any;
  approveValue:boolean=false
  ENABLE_Matrix_Code: any;

   constructor(private dataService: DataService, private router: Router) {}
  ngOnInit() {
    // this.isEditDataAvailable();
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
    const packingRights = menuGroups
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
    if (menuResponse.GeneralSettings.ENABLE_MATRIX_CODE == true) {
      // this.getItemsList();
    } else {
      // this.getItemsList();
    }
    this.getStoreDropdown();
    this.getReasonsDropdown();
    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
    // this.items = [];
    // this.addEmptyRow();  
    this.ENABLE_Matrix_Code=menuResponse.GeneralSettings.ENABLE_MATRIX_CODE
    console.log(this.ENABLE_Matrix_Code)
  
  
  }
    ngOnChanges(changes: SimpleChanges) {
    if (
      changes['EditingResponseData'] &&
      changes['EditingResponseData'].currentValue
    ) {
      this.adjustmentFormData = this.EditingResponseData;
      console.log(this.EditingResponseData)
      console.log(this.adjustmentFormData)
      this.selecte_Date_Details=this.adjustmentFormData.Details
      const editable= this.adjustmentFormData.STATUS
      console.log(editable)
      // this.readOnlyTrue=
      if(editable==5){
        this.readOnlyTrue=true
        this.approveValue=true
      }
      else{
                this.readOnlyTrue=false
                  this.approveValue=false
      }




      
    }
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
          ITEM_NAME: row.DESCRIPTION,
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
    this.popupGridRef.instance.clearSelection();
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
  }
  onAddItems(){
    this.isPopupVisible=true

    

  }
  onPopupHiding(){

  }
  updateNetAmount(event:any){

  }
  UpdateStockAdjustment(){
    console.log(this.adjustmentFormData)
    const ITEM_Details=this.adjustmentFormData.Details
    console.log(ITEM_Details)

    const transformed = ITEM_Details.map(item => ({
            COMPANY_ID: this.companyID,
      STORE_ID: this.adjustmentFormData.STORE_ID,
      ADJ_ID: 0,
      NET_AMOUNT:0,

  REASON_ID: 0,                      
  ITEM_ID: item.ITEM_ID,               // map from old
  COST: item.COST,
  STOCK_QTY: item.STOCK_QTY,       // rename
  NEW_QTY: Number(item.NEW_QTY),       // ensure number
  ADJ_QTY: item.ADJ_QTY,
  AMOUNT: item.AMOUNT,
  BATCH_NO: "",                  // default placeholder
  EXPIRY_DATE:this.selecte_Date_Details.EXPIRY_DATE // current date-time
}));

console.log(transformed)

    const payload={

      ...this.adjustmentFormData,
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
    if(this.approveValue==true){
  confirm(
        'It will approve and commit. Are you sure you want to commit?',
        'Confirm Commit'
      ).then((result) => {
        if (result) {
          this.dataService
            .Approve_Stock_Adjustment_Data(payload)
            .subscribe((res: any) => {
              console.log('Approved & Committed:', res);
              
             this.popupClosed.emit();
             
             
              notify(
                {
                  message: 'Advance approved and committed successfully',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success'
              );
              // this.resetFormAfterUpdate();
                 
                  });
        } else {
          notify('Approval cancelled.', 'info', 2000);
        }
      });
    }
    else{


    this.dataService.Update_Stock_Adjustment_Data(payload).subscribe((res:any)=>{

      console.log(res)
      notify(
                                   {
                              message: ' Stock Adjustment Updated successfully',
                              position: { at: 'top right', my: 'top right' },
                              displayTime: 1000,
                            },
                            'success'
                          );
            this.popupClosed.emit()
    })
  }
  }
onEditorPreparing(event: any) {

    const rowData = event.row.data;
    // calculate adj_qty only for this row
  //   rowData.ADJ_QTY = rowData.NEW_QTY - rowData.STOCK_QTY;
  //   console.log("Updated row:", rowData);
  //   rowData.AMOUNT= rowData.ADJ_QTY * rowData.COST

  //     // 🔥 calculate total amount across all rows
  // this.totalAmount = this.adjustmentFormData.Details.reduce(
  //   (sum, item) => sum + (item.AMOUNT || 0),
  //   0
  // );

  console.log("Updated row:", rowData);
  if(rowData){
     rowData.ADJ_QTY = rowData.NEW_QTY - rowData.STOCK_QTY;
     rowData.AMOUNT= rowData.ADJ_QTY * rowData.COST
      rowData.REASON_ID = this.adjustmentFormData.REASON_ID; 
  }
    this.totalAmount = this.adjustmentFormData.Details.reduce(
    (sum, item) => sum + (item.AMOUNT || 0),
    0
  );
  // this.adjustmentFormData.AMOUNT=this.totalAmount
  console.log("Total Amount:", this.totalAmount);
 this. adjustmentFormData.NET_AMOUNT=this.totalAmount
  
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

    
  // 🔥 reassign array to trigger Angular + DevExtreme refresh
  this.adjustmentFormData.Details = [...this.adjustmentFormData.Details];
    // force UI refresh
    e.component.refresh(true);
 
}
     summaryColumnsData = {
      totalItems: [

        {
          column: 'AMOUNT',
          summaryType: 'sum',
          displayFormat: ' Net Amount {0}',
          valueFormat: { type: 'fixedPoint', precision: 2, useGrouping: true },
          showInColumn: 'AMOUNT',
          alignment: 'right',
        }
       
      ],

      calculateCustomSummary: (options) => {
        if (options.name === 'summaryRow') {
          // Custom logic if needed
        }
      },
    };
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
  declarations: [StockAdjustmentEditComponent],
  exports: [StockAdjustmentEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StockAdjustmentEditModule {}
