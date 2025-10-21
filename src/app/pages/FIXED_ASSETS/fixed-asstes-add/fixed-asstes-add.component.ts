// import { Component } from '@angular/core';

import {
  ChangeDetectorRef,
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
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-fixed-asstes-add',
  templateUrl: './fixed-asstes-add.component.html',
  styleUrls: ['./fixed-asstes-add.component.scss']
})
export class FixedAsstesAddComponent {
    @Output() popupClosed = new EventEmitter<void>();
@ViewChild('formValidationGroup', { static: false }) formValidationGroup: DxValidationGroupComponent;
@ViewChild('newformValidationGroup', { static: false }) newformValidationGroup: DxValidationGroupComponent;
AddFixedAssetsPopupVisible : boolean = false
asseted_Data:any


  isFilterRowVisible:boolean=false
 selected_Company_id: number
  selected_fin_id: any;
new_asset_type_popup:boolean=false

  FixedAssetsData:any = {
  COMPANY_ID:0,
  CODE: "",
  DESCRIPTION: "",
  ASSET_TYPE_ID: null,
  ASSET_TYPE: "",
  ASSET_LEDGER_ID: null,
  ASSET_VALUE: '',
  USEFUL_LIFE: 0,
  RESIDUAL_VALUE: 0,
  DEPR_LEDGER_ID: null,
  DEPR_PERCENT: null,
  PURCH_DATE: "",
  IS_INACTIVE: false,
  IS_DELETED:false
};
  asset_ledgerData: any;
  FixedAssets: any;
purchaseDate: any
New_Asset_type:any
 

// calculateDepreciation(e: any) {
//   const life = Number(e.value);
//   if (life && life > 0) {
//     this.FixedAssetsData.DEP_PERCENT = (100 / life).toFixed(2);
//   } else {
//     this.FixedAssetsData.DEP_PERCENT = null;
//   }
// }


constructor(private dataService:DataService,private cdr:ChangeDetectorRef){
  this.Get_dropdowns()
  this.sesstion_Details()
}




  sesstion_Details(){
    const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData,'=================session data==========')

    this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id,'============selected_Company_id==============')


    this.selected_fin_id=sessionData.FINANCIAL_YEARS[0].FIN_ID

    console.log(this.selected_fin_id,'===========selected fin id===================')
                const sessionYear=sessionData.FINANCIAL_YEARS
            console.log(sessionYear,'==================session year==========')
//  this.financialYeaDate=sessionYear[0].DATE_FROM
// console.log(this.financialYeaDate,'=========================date=[[[[[[[[[[[[[[[[[[[[[[[[[[')
// this.formatted_from_date=this.financialYeaDate

    
  }
calculateDepreciation(event: any) {
  const life = event.value;
  if (life && life > 0) {
    const depreciation = +(100 / life).toFixed(2); // convert to number
    this.FixedAssetsData.DEPR_PERCENT = depreciation;
  } else {
    this.FixedAssetsData.DEPR_PERCENT = 0;
  }
}

Get_dropdowns(){
this.dataService.Asset_type_Dropdown().subscribe((res:any)=>{
  console.log(res)
  this.asseted_Data=res
  console.log(this.asseted_Data)
})

this.dataService.Asset_Leger_Dropdown().subscribe((res:any)=>{
  console.log(res)
  this.asset_ledgerData=res
  console.log(this.asset_ledgerData)
})


}


list_fixed_assets(){
this.dataService.list_Fixed_Asset_api().subscribe((res:any)=>{
console.log(res)
this.FixedAssets=res.Data
      
    })
  }

  puchaseDataFormat(event:any){
    //  console.log(event,'=============Date==============')
      console.log(event,'=============Date==============')

console.log(event.value)


 const rawDate=event.value// dd/MM/yyyy format
const year = rawDate.getFullYear();
const month = String(rawDate.getMonth() + 1).padStart(2, '0'); // 01-12
const day = String(rawDate.getDate()).padStart(2, '0');         // 01-31

const formattedDate = `${year}/${month}/${day} 00:00:00`;

this.purchaseDate=formattedDate
 console.log(this.purchaseDate);
 // Output: 06/08/2025 
  }

async AddData() {
  console.log('Save button called');

  // ✅ Await the asset list before proceeding
  try {
    const res: any = await firstValueFrom(this.dataService.list_Fixed_Asset_api());
    this.FixedAssets = res.Data;
    console.log(this.FixedAssets, '==== fixed asset list (after async)');
  } catch (error) {
    console.error('Failed to fetch fixed assets', error);
    return;
  }

  // ✅ Form validation
  const validationResult = this.formValidationGroup?.instance?.validate();
  if (!validationResult?.isValid) {
    console.log('Validation failed');
    return;
  }

  console.log(this.FixedAssetsData, '====== form data ==========');

  // ✅ Check for duplicates
  const duplicateItems = this.FixedAssets?.filter((item: any) => {
    const codeMatch = (item.CODE?.trim().toLowerCase() || '') === (this.FixedAssetsData.CODE?.trim().toLowerCase() || '');
    const descriptionMatch = (item.DESCRIPTION?.trim().toLowerCase() || '') === (this.FixedAssetsData.DESCRIPTION?.trim().toLowerCase() || '');
    return codeMatch || descriptionMatch;
  });

  if (duplicateItems && duplicateItems.length > 0) {
    console.log('Duplication Checking Triggered');

    const duplicatedFields = [];
    if (duplicateItems.some(item =>
      (item.CODE?.trim().toLowerCase() || '') === (this.FixedAssetsData.CODE?.trim().toLowerCase() || ''))) {
      duplicatedFields.push('Code');
    }
    if (duplicateItems.some(item =>
      (item.DESCRIPTION?.trim().toLowerCase() || '') === (this.FixedAssetsData.DESCRIPTION?.trim().toLowerCase() || ''))) {
      duplicatedFields.push('Description');
    }

    const errorMessage = `Fixed Asset with the same ${duplicatedFields.join(' and ')} already exists!`;

    notify(
      {
        message: errorMessage,
        position: { at: 'top right', my: 'top right' },
        width: 300,
        displayTime: 2000,
      },
      'error'
    );
    return;
  }

  // ✅ Build payload
  const payload = {
    ...this.FixedAssetsData,
    COMPANY_ID:this.selected_Company_id,
    PURCH_DATE: this.purchaseDate // or use this.purchaseDate if needed
  };

  console.log(payload, '========= payload =========');

  // ✅ Send API request
  this.dataService.Add_Fixed_Asset_api(payload).subscribe((res: any) => {
    console.log(res);
          notify(
            {
              message: 'This fixed asset added successfully .',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success'
          );
    this.popupClosed.emit();
  });

  console.log('Validation successful. Saving data...');
}


closePopup(){
 this.popupClosed.emit();
}
Add_new_AssetType(){

    const validationResult = this.newformValidationGroup?.instance?.validate();
  if (!validationResult?.isValid) {
    console.log('Validation failed');
    return;
  }
if (
  this.asseted_Data.some(
    (item: any) =>
      (item?.DESCRIPTION ?? '').toLowerCase().trim() ===
      (this.New_Asset_type ?? '').toLowerCase().trim()
  )
) {
   notify(
            {
              message: 'This fixed asset type already exists.',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1000,
            },
            'error'
          );
  return;
}
  const payload={
     ASSET_TYPE: this.New_Asset_type
  }



  this.dataService.Add_Fixed_Asset_Tpe(payload).subscribe((res:any)=>{
    console.log(res)
    this.new_asset_type_popup=false
    this.Get_dropdowns()
  })
}
Add_new_AssetType_close(){
  this.new_asset_type_popup=false
}
open_popup_new_assettype(){
  this.new_asset_type_popup=true
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
  exports: [FixedAsstesAddComponent],
  declarations: [FixedAsstesAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FixedAsstesAddModule {}


