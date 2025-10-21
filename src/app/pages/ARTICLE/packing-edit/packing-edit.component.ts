// import { Component } from '@angular/core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  SimpleChanges,
  Input,
  NgModule,
  Output,
  ViewChild,
  EventEmitter,
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
  DxBoxModule,
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
import notify from 'devextreme/ui/notify';
@Component({
  selector: 'app-packing-edit',
  templateUrl: './packing-edit.component.html',
  styleUrls: ['./packing-edit.component.scss'],
})
export class PackingEditComponent {
  @ViewChild('formValidationGroup', { static: false })
  formValidationGroup: DxValidationGroupComponent;
  @ViewChild('ArtnoValidationGroup')
  ArtnoValidationGroup: DxValidationGroupComponent;

  @ViewChild('ColorValidationGroup')
  ColorValidationGroup: DxValidationGroupComponent;

  @ViewChild('CategoryValidationGroup')
  CategoryValidationGroup: DxValidationGroupComponent;

  @ViewChild('UnitValidationGroup')
  UnitValidationGroup: DxValidationGroupComponent;

  articleData: any;
  colorList: any;
  categoryList: any;
  typeList: any;
  brandList: any;
  produCtionUnits: any;
  materialUnits: any;
  articleSizeData: any;
  shouldShowGrid: boolean = false;
  @Input() PackingData: any = {};
  @Output() popupClosed = new EventEmitter<void>();
  totalQuantity: any;
  selectedRows: any;
  isArticleFieldsDisabled: boolean = false;
  selectedProductionUnitId: any;
  packing_list: any;
  selectedSizeRows: any[] = []
  combinationString: string
 combination_value: any[]=[]
  constructor(private dataService: DataService) {
    this.getDropdownLists();
    this.dataService.get_packages_list_api().subscribe((res: any) => {
      console.log('response from get packing list api:', res);

      this.packing_list = res.Data;
    });
  }

  closePopup() {
    this.popupClosed.emit();
  }
  onPurchasableChanged(e: any) {
    console.log('Purchasable changed:', e.value);
    // Add any custom logic here if needed
  }
  getDropdownLists() {
    this.dataService
      .getDropdownDataForAccounts('PRODUCTION_UNITS')
      .subscribe((response: any) => {
        console.log(response, 'PRODUCTION UNIT');
        this.produCtionUnits = response;
      });
    this.dataService
      .getDropdownDataForAccounts('MATERIAL_UNITS')
      .subscribe((response: any) => {
        console.log(response, 'MATERIALUNIT');
        this.materialUnits = response;
      });
    this.dataService
      .getDropdownDataForAccounts('ARTICLECATEGORY')
      .subscribe((response: any) => {
        this.categoryList = response;
      });
    this.dataService
      .getDropdownDataForAccounts('ARTICLETYPE')
      .subscribe((response: any) => {
        this.typeList = response;
      });
    this.dataService
      .getDropdownDataForAccounts('ARTICLEBRAND')
      .subscribe((response: any) => {
        this.brandList = response;
      });
    this.dataService
      .getDropdownDataForAccounts('ARTICLECOLOR')
      .subscribe((response: any) => {
        this.colorList = response;
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['PackingData'] && changes['PackingData'].currentValue) {
      console.log('Received PackingData:', changes['PackingData'].currentValue);
      this.PackingData = {
        ...this.PackingData,
        ...changes['PackingData'].currentValue,
      };
      if (
        this.PackingData.ART_NO &&
        this.PackingData.COLOR &&
        this.PackingData.CATEGORY_ID &&
        this.PackingData.UNIT_ID
      ) {
        this.articleSizeData = this.PackingData.COMBINATION.split(',').map((item) => {
  const [size, qty] = item.split('x').map(Number);
  return { Size: size, Qty: qty };
});
      }
         this.totalQuantity = this.articleSizeData.reduce(
      (sum: number, item: any) => {
        const qty = parseInt(item.Qty, 10);
        return sum + (isNaN(qty) ? 0 : qty);
      },
      0
    );
    }
    console.log(this.PackingData, 'MAINGROUPID');
  }

  UpdateData() {
    // const payload = this.PackingData;
  const validationResult = this.formValidationGroup?.instance?.validate();


    console.log(this.combinationString, 'COMBINATION STRING');
    const combinationToUse = this.combinationString === undefined
  ? this.PackingData.COMBINATION
  : this.combinationString;

console.log(combinationToUse, 'COMBINATION TO USE');
    const payload={
      ...this.PackingData,
      COMBINATION:combinationToUse,
      PAIR_QTY: this.totalQuantity,

    }
    const unitName = this.produCtionUnits.find(
      (u) => u.ID === payload.UNIT_ID
    )?.DESCRIPTION;
    console.log(unitName, '=============');
    const CategoryId = this.categoryList.find(
      (u) => u.ID === payload.CATEGORY_ID
    )?.DESCRIPTION;
    console.log(CategoryId, '=============');

    const artno = payload.ART_NO;
    const color = payload.COLOR;
    const categoryID = CategoryId;
    const unitID = unitName;
    const packname = payload.DESCRIPTION;
    const packqty = payload.PAIR_QTY;
    const id=payload.ID
    console.log(
      artno,
      color,
      categoryID,
      unitID,
      packname,
      '====================='
    );

    //  🔍 Check for duplicate entry based on employee ID
const duplicate = this.packing_list.find((item: any) =>
  item.PackingName === packname &&
  item.ArtNo === artno &&
  item.Color === color &&
  item.Category === categoryID &&
  item.Unit === unitID &&
  item.ID !== id // ✅ ID must be different for true duplication
);

console.log(duplicate, 'DUPLICATE CHECK');
    if (duplicate) {
      notify(
        {
          message: 'This Packing combination already .',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error'
      );
      return;
    }

    if(packqty<=1){
      notify(
        {
          message: 'Please Add Quantity.',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error'
      );
      return;
    }

//     if (!validationResult?.isValid) {
//   // Optional: Notify or prevent submission
//   return;
// }
  // if (!validationResult?.isValid) {
  //   notify(
  //     {
  //       message: 'Please fill all required fields correctly.',
  //       position: { at: 'top right', my: 'top right' },
  //       displayTime: 1000,
  //     },
  //     'error'
  //   );
  //   return; // ⛔ Stop if form is invalid
  // }

    this.dataService
      .Update_packages_listapi(payload)
      .subscribe((res: any) => {
        console.log('response from update packing api:', res);
        this.closePopup();
        notify(
          {
            message: 'Data  Updated succesfully ',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success'
        );
      });
  }

  // updateQtyFromCombination(combination: string) {
  //   console.log('Updating quantity from combination:', combination);

  //   const sizeQtyMap = combination.split(',').reduce((map, entry) => {
  //     const [size, qty] = entry.split('x');
  //     map[size.trim()] = +qty.trim();
  //     return map;
  //   }, {} as { [key: string]: number });

  //   console.log('Size Quantity Map:', sizeQtyMap);

  //   console.log(' 2Updated articleSizeData:', this.articleSizeData);
  //   this.articleSizeData = Object.entries(sizeQtyMap).map(([size, qty]) => ({
  //     Size: size,
  //     Qty: qty,
  //   }));
  //   console.log(' 3Updated articleSizeData:', this.articleSizeData);
  // }

  onQuantityChanged() {
    console.log('Quantity changed', this.articleSizeData);
const comb_Data = this.articleSizeData.map(item => `${item.Size}x${item.Qty}`).join(',');
    // Recalculate total quantity when any quantity is changed
    this.totalQuantity = this.articleSizeData.reduce(
      (sum: number, item: any) => {
        const qty = parseInt(item.Qty, 10);
        return sum + (isNaN(qty) ? 0 : qty);
      },
      0
    );

    console.log(this.totalQuantity);

    
  }

  loadArticle() {
    console.log('button clicked');
    // this.updateQtyFromCombination(this.PackingData.COMBINATION);

    console.log('Loading article data with PackingData:', this.PackingData);

    const payload = {
      artNo: this.PackingData.ART_NO,
      color: this.PackingData.COLOR,
      categoryID: this.PackingData.CATEGORY_ID,
      unitID: this.PackingData.UNIT_ID,
    };

    console.log('Payload for article data:', payload);

    // const isValid =
    //   payload.artNo && payload.color && payload.categoryID && payload.unitID;

    // if (!isValid) {
    //   notify(
    //     {
    //       message: 'Please fill all required fields',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 1000,
    //     },
    //     'error'
    //   );
    //   // 👈 prevent grid from showing
    //   this.shouldShowGrid = false;
    //   return;
    // }
    // const ArtvalidationResult = this.ArtnoValidationGroup?.instance?.validate();

    // const ColorvalidationResult =
    //   this.ColorValidationGroup?.instance?.validate();

    // const CatgoryvalidationResult =
    //   this.CategoryValidationGroup?.instance?.validate();

    // const UnitvalidationResult = this.UnitValidationGroup?.instance?.validate();

    //  if (!ArtvalidationResult.isValid || !ColorvalidationResult.isValid || !CatgoryvalidationResult.isValid || !UnitvalidationResult.isValid) {

    //   return; // ❌ Prevent saving if form is invalid
    // }
    // if(!payload.artNo || !payload.color || !payload.categoryID || !payload.unitID) {
    //   notify(
    //     {
    //       message: 'Please fill all required fields',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 500,
    //     },
    //     'error'
    //   );
    //   return;
    // }
    // this.isArticleFieldsDisabled = true;

    console.log(payload, 'PAYLOAD FOR COLLECTION LIST');
    this.dataService.get_combinbation_list_api(payload).subscribe((response: any) => {
      console.log(response, "COMBINATION LIST RESPONSE");
      this.articleSizeData = response
      this.PackingData.COMBINATION=''
    })
  }
  // selectedSizeRows: any[] = [];

onSizeSelectionChanged(e: any) {
  this.selectedSizeRows = e.selectedRowKeys;
  console.log("Selected Rows:", this.selectedSizeRows);
}

clearForm() {
  this.PackingData = {
    ART_NO: '',
    ORDER_NO: '',
    CATEGORY_ID: null,
    COLOR: '',
    DESCRIPTION: '',
    ARTICLE_TYPE: null,
    PAIR_QTY: null,
    IS_INACTIVE: false,
    PART_NO: '',
    ALIAS_NO: '',
    ART_SERIAL: '',
    COMBINATION: '2x4',
    PACK_PRICE: null,
    UNIT_ID: null,
    IS_PURCHASABLE: false,
    IS_EXPORT: false,
    IS_ANY_COMB: false,
    SUPP_ID: null,
  };

  // ✅ Resets values and clears all validation UI
  // this.formValidationGroup?.instance?.resetValues();

 

  this.articleSizeData = [];
  this.combination_value = [];
  this.totalQuantity = 0;
}



  close() {}
  
onEditorPreparing(e: any) {
console.log(e, "EDITOR PREPARING EVENT");
  const rowData = e.row?.data;  
console.log(rowData, "ROW DATA IN EDITOR PREPARING");
    
const sizeQtyString = `${rowData.Size}x${rowData.Qty}`;
console.log(sizeQtyString, "SIZE QUANTITY STRING");

this.combination_value.push(sizeQtyString); // Add the size and quantity to the combination_value array   
if (!this.combination_value.includes(sizeQtyString)) {
  this.combination_value.push(sizeQtyString);
}
console.log(this.combination_value, "COMBINATION VALUE ARRAY");

const validData = this.combination_value.filter(item => !item.includes('undefined'));

console.log(validData, "VALID DATA AFTER FILTERING");

const combvalue= this.PackingData.COMBINATION
console.log(combvalue, "COMBINATION VALUE FROM PACKING DATA");
const combinationString = validData.join(', '); 
// Join the array into a string
console.log(this.combinationString, "COMBINATION STRING");

console.log(' changed Data', this.articleSizeData);

//=======take combination of all sizes and quantities==========
const firstcombinationString = this.articleSizeData
  .filter(item => item.Qty !== undefined && item.Qty !== null && item.Qty > 0)
  .map(item => `${item.Size}x${item.Qty}`)
  .join(', ');

this.combinationString = firstcombinationString;

console.log("Combination String:", this.combinationString);

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
    DxBoxModule,
  ],
  providers: [],
  declarations: [PackingEditComponent],
  exports: [PackingEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PackingEditModule {}
