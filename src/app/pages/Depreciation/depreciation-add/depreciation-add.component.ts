// import { Component } from '@angular/core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  NgModule,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common'; 
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import notify from 'devextreme/ui/notify';

// Later in your code:

import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
  
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
@Component({
  selector: 'app-depreciation-add',
  templateUrl: './depreciation-add.component.html',
  styleUrls: ['./depreciation-add.component.scss']
})
export class DepreciationAddComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild('formValidationGroup', { static: false }) formValidationGroup: DxValidationGroupComponent;
depreciationDate:any

DepreciationPayload:any={
  DEPR_DATE: new Date,// format: YYYY-MM-DD
  NARRATION: "",
  AMOUNT:0,
  COMPANY_ID: 0,
  FIN_ID: 0,
  ASSET_IDS: this.formattedAssets
}
 // Sets today's date as default
selectedData_in_Fixed_asset:any
selectedRowsInGrid:any
Active_fixed_asset_list:any
processd_Date:any
recordsCount:any
  Date:any
  grandTotal:number=0
  selected_Company_id: any;
  selected_fin_id: any;
  Depreciation_List: any;
constructor( private dataService:DataService){
  this.Active_fixedasset_List()
}
 ngOnInit() {
    // If API returns a string date:
   // example
    // this.Date = new Date(); // convert string → Date
   
   this.Date = this.DepreciationPayload.DEPR_DATE
   this.sesstion_Details()
  }

//===============================Active_fixedasset_List======================
Active_fixedasset_List(){
  this.dataService.Active_list_Fixed_Asset_api().subscribe((res:any)=>{
    console.log(res)

  this.Active_fixed_asset_list= res.Data

  })
}

onSelectionChanged(event:any){
  console.log(event,'======selectd data============')

  this.selectedData_in_Fixed_asset=event.selectedRowsData
  console.log(this.selectedData_in_Fixed_asset,'========selectedData_in_Fixed_asset===========')
 
   this.recordsCount = this.selectedData_in_Fixed_asset.length;
    this.calculateDepreciationDays();
  
    this.DepreciationPayload.ASSET_IDS = this.selectedData_in_Fixed_asset.map((row: any) => ({
    Asset_ID: row.ID, // from keyExpr
    Days: row.Days || 0, // from grid column
    Depr_Amount: row.Depreciation_amount || 0
  }));


  console.log( this.DepreciationPayload.ASSET_IDS)
  //======================Date calculation============================


}
onSelectAllChange(event:any){

}
formatDateToDMY(date: Date): string {
  const day = date.getDate(); // no leading zero
  const month = date.getMonth() + 1; // January is 0
  const year = date.getFullYear();
  return `${year}/${month}/${day}`;
}

onDateValueChanged(event:any){
  console.log(event)
  const date=event.value
  this.depreciationDate= date
  console.log(this.depreciationDate)
}
onEditorPreparing(event:any){

}
calculateDepreciationDays() {
  const currentDate = this.depreciationDate

 console.log(currentDate,'===============curent currentDate============')
const lastDeprDateStr = this.selectedData_in_Fixed_asset.LAST_DEPR_DATE;
const purchaseDateStr = this.selectedData_in_Fixed_asset.PURCH_DATE;


console.log(lastDeprDateStr,"========last depreciation date")
      console.log(purchaseDateStr,"======== purchaseDate date")


}
parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;

  const parts = dateStr.split('/');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-based in JS
  const year = parseInt(parts[2], 10);

  return new Date(year, month, day);
}


onCellValueChanged(event:any){
  console.log(event,'=========on cell value changed================')
 
  
}
onDepreciationDateChange(newDate: Date) {
  this.depreciationDate = newDate;
  this.calculateDepreciationDays();
}

// for the d

get_Depreciation_list() {
  this.dataService.list_Depreciation_api().subscribe((res: any) => {
    const allData = res.Data;
    const dateField = 'DEPR_DATE';
  this.Depreciation_List = allData;
  //   // If 'all' is selected, skip filtering
  //   if (this.selectedDateRange === 'all') {
  //     this.Depreciation_List = allData;
  //   } else {
  //     const start = new Date(this.startDate);
  //     const end = new Date(this.EndDate);
  //     end.setHours(23, 59, 59, 999);

  //     this.Depreciation_List = allData.filter((item: any) => {
  //       const itemDate = new Date(item[dateField]);
  //       return itemDate >= start && itemDate <= end;
  //     });
  //   }

  //   console.log(this.Depreciation_List, 'Filtered Depreciation List');
  });
}

Process_function() {
  const today = this.depreciationDate || this.Date;

  // ✅ Clear old processed values first
  this.Active_fixed_asset_list.forEach((item: any) => {
    item.Days = null;
    item.Depreciation_amount = null;
  });

  this.grandTotal = 0; // reset total

  // ✅ Process only the newly selected rows
  this.selectedRowsInGrid.forEach((id: number) => {
    const asset = this.Active_fixed_asset_list.find((item: any) => item.ID === id);

    if (asset) {
      const baseDateStr = asset.LAST_DEPR_DATE || asset.PURCH_DATE;

      if (baseDateStr) {
        const [day, month, year] = baseDateStr.split('/').map(Number);
        const baseDate = new Date(year, month - 1, day);

        const diffTime = today.getTime() - baseDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

              // ✅ Skip if days < 0
      if (diffDays < 0) {
        asset.Days = null;
        asset.Depreciation_amount = null;
        return; // Skip this asset
      }
        const deprAmount =
          ((asset.ASSET_VALUE * asset.DEPR_PERCENT) / 100 / 365) * diffDays;

        asset.Days = diffDays;
        asset.Depreciation_amount = +deprAmount.toFixed(2);

        // ✅ Add to grand total
        this.grandTotal += asset.Depreciation_amount;
        this.DepreciationPayload.AMOUNT=this.grandTotal
      }
    }
  });

  this.grandTotal = +this.grandTotal.toFixed(2);

  // ✅ Trigger grid refresh
  this.Active_fixed_asset_list = [...this.Active_fixed_asset_list];

  console.log(this.Active_fixed_asset_list)
  this.formattedAssets = this.Active_fixed_asset_list
  .filter(item => item.Days > 0 && item.Depreciation_amount > 0)
  .map(item => ({
    Asset_ID: item.ID,
    Days: item.Days,
    Depr_Amount: item.Depreciation_amount
  }));

console.log(this.formattedAssets);

this.processd_Date=this.depreciationDate
}
  formattedAssets(formattedAssets: any) {
    throw new Error('Method not implemented.');
  }



  AddData(){
      const validationResult = this.formValidationGroup?.instance?.validate();
  if (!validationResult?.isValid) {
    console.log('Validation failed');
    return;
  }

 console.log(this.processd_Date,'=========prcossed date========')
 console.log(this.depreciationDate,'==========depreciationDate========')
 console.log(this.DepreciationPayload,'====================payload==========')
 console.log(this.formattedAssets)
 const date=this.DepreciationPayload.DEPR_DATE

 console.log("Date=================",date)
  console.log(this.formatDateToDMY(date))
 const payload={
  ...this.DepreciationPayload,
  COMPANY_ID:this.selected_Company_id,
  FIN_ID:this.selected_fin_id,
  ASSET_IDS:this.formattedAssets,
  DEPR_DATE:this.formatDateToDMY(date)
 }


 console.log(payload,'===============payload=====')
 if (  this.selectedRowsInGrid.length === 0) {
    // Show error and return
    notify(
               {
                 message: 'Please select at least one fixed asset and click the process button.',
                 position: { at: 'top right', my: 'top right' },
                 displayTime: 2000,
               },
               'error'
             );
    return;
  }
 if (  this.grandTotal === 0) {
    // Show error and return
    notify(
               {
                 message: 'No depreciation amount found. You cannot save',
                 position: { at: 'top right', my: 'top right' },
                 displayTime: 2000,
               },
               'error'
             );
    return;
  }
console.log(this.processd_Date,'============this.processd_Date==========')
console.log(this.depreciationDate,'============this.processd_Date==========')
  if (this.processd_Date !== this.depreciationDate) {
    // Show error and return
    notify(
               {
                 message: 'You changed the  Depreciation Date Please click the proccess button. Cannot save data .',
                 position: { at: 'top right', my: 'top right' },
                 displayTime: 2000,
               },
               'error'
             );
    return;
  }
  

//   this.dataService.Add_Depreciation_api(payload).subscribe((res:any)=>{
//     console.log(res)
// if(res.Flag==1){
    
//        this.popupClosed.emit()
//       this.get_Depreciation_list()
//            this.grandTotal=0
           
//        this.selectedRowsInGrid = []; 
// }
// else{
//           notify(
//                {
//                  message: 'One Opened data is pending please approve or delete that data Cannot save data .',
//                  position: { at: 'top right', my: 'top right' },
//                  displayTime: 2000,
//                },
//                'error'
//              );
//     }
//   })

 this.dataService.Add_Depreciation_api(payload).subscribe((res: any) => {
  console.log(res);

  if (res.success == true) {
    this.popupClosed.emit();
    this.get_Depreciation_list();
    this.grandTotal = 0;
    this.selectedRowsInGrid = [];
  } else {
    notify(
      {
        message: res.message || 'There is an open record in the list. Please approve or delete it before adding new data.',
        position: { at: 'top right', my: 'top right' },
        displayTime: 2500,
      },
      'error'
    );
  }
});


  }
  SetDefaultRest(){
      this.grandTotal=0
       this.selectedRowsInGrid = []; 

  }
  closePopup(){
    this.popupClosed.emit()
    this.selectedRowsInGrid = []; 
    this.grandTotal=0
  }

  sesstion_Details(){
    const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData,'=================session data==========')
    this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id,'============selected_Company_id==============')
    this.selected_fin_id=sessionData.FINANCIAL_YEARS[0].FIN_ID
    console.log(this.selected_fin_id,'===========selected fin id===================')
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    DxPopupModule,
    DxFormModule,
    DxRadioGroupModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxValidatorModule,
    ReactiveFormsModule,
    DxDateBoxModule,
    DxValidationGroupModule
    
  ],
  providers: [],
  exports: [DepreciationAddComponent],
  declarations: [DepreciationAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DepreciationAddModule {}


