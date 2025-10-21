// import { Component } from '@angular/core';
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
import { Router } from '@angular/router';
@Component({
  selector: 'app-fixed-asstes-edit',
  templateUrl: './fixed-asstes-edit.component.html',
  styleUrls: ['./fixed-asstes-edit.component.scss']
})
export class FixedAsstesEditComponent {
  
@Output() popupClosed = new EventEmitter<void>();
@Input() SelectFixedAssetData: any = {};
@ViewChild('formValidationGroup', { static: false }) formValidationGroup: DxValidationGroupComponent;
@ViewChild('newformValidationGroup', { static: false }) newformValidationGroup: DxValidationGroupComponent;
AddFixedAssetsPopupVisible : boolean = false

purchaseDate:any
asseted_Data:any
   FixedAssetsData:any = {
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
  IS_INACTIVE: false
};
  asset_ledgerData: any;
  FixedAssets: any;
  new_asset_type_popup: boolean;
  New_Asset_type: any;
canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

// calculateDepreciation(e: any) {
//   const life = Number(e.value);
//   if (life && life > 0) {
//     this.FixedAssetsData.DEP_PERCENT = (100 / life).toFixed(2);
//   } else {
//     this.FixedAssetsData.DEP_PERCENT = null;
//   }
// }


constructor(private dataService:DataService,private router:Router){
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData:', menuResponse);
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/fixed-assets');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }

    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
  this.Get_dropdowns()

}
ngOnChanges(changes: SimpleChanges) {
  if (changes['SelectFixedAssetData'] && changes['SelectFixedAssetData'].currentValue) {
      this.FixedAssetsData = this.SelectFixedAssetData[0];

      console.log('SelectFixedAssetData :', this.SelectFixedAssetData);
      console.log('FixedAssetsData :', this.FixedAssetsData);
      
  }
}



  list_fixed_assets(){
    this.dataService.list_Fixed_Asset_api().subscribe((res:any)=>{
    console.log(res)
    this.FixedAssets=res.Data
    })
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

async UpdateData() {
  console.log('Update button called');

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
      if (item.ID === this.FixedAssetsData.ID) return false; 
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
    PURCH_DATE: this.purchaseDate// or use this.purchaseDate if needed
  };

  console.log(payload, '========= payload =========');

  // ✅ Send API request
  this.dataService.Update_Fixed_Asset_api(payload).subscribe((res: any) => {
    console.log(res);
    notify(
                {
                  message: 'This fixed asset updated successfully .',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success'
              );
    this.popupClosed.emit();
  });

  console.log('Validation successful. Saving data...');
}

// UpdateData() {
//   console.log('Save button called');

//   const validationResult = this.formValidationGroup?.instance?.validate();

//   if (!validationResult?.isValid) {
//     console.log('Validation failed');
//     return; // Don't proceed if the form is invalid
//   }
//   console.log(this.FixedAssetsData,'=========fixed asset=========')

// const payload={
//   ...this.FixedAssetsData,
//   PURCH_DATE:this.purchaseDate
// }


//   this.dataService.Update_Fixed_Asset_api(payload).subscribe((res:any)=>{
//     console.log(res)
//      this.popupClosed.emit();
//     this.list_fixed_assets()
//   })
//   // ✅ Proceed to save if valid
//   console.log('Validation successful. Saving data...');
//   // Save logic here
// }

// AddData(){
//   console.log('save button called')
//     const validationResult = this.formValidationGroup?.instance?.validate();

// if (!validationResult?.isValid) {
//   // Optional: Notify or prevent submission
//   return;
// }
  

  puchaseDataFormat(event:any){
     console.log(event,'=============Date==============')


     this.purchaseDate=event.value
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
  exports: [FixedAsstesEditComponent],
  declarations: [FixedAsstesEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FixedAsstesEditModule {}
