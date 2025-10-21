// import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import notify from 'devextreme/ui/notify';

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
  DxTagBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
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
@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent {

  @ViewChild('formValidationGroup')
  formValidationGroup: DxValidationGroupComponent;

  //   @ViewChild('PackformValidationGroup')
  // PackformValidationGroup: DxValidationGroupComponent;
@ViewChild('PackformValidationGroup', { static: false }) PackformValidationGroup: DxValidationGroupComponent;  
readonly allowedPageSizes: any = [5, 10, 'all'];
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  totalPairQty: number = 0;
  auto: string = 'auto';
  isAddPopup: boolean = false;
  isEditPopup: boolean = false;
  isPackagesPopup: boolean = false; 
  selectedTabIndex = 0;
  list_packs: any = [];
  CategoryList: any = [];
  sizeOptions: number[] = [];
  selected_Data: any = {};
  datasss: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
isEditMode: boolean = false;
selectedPackIndex: number | null = null;

  //===========select data for update=================

  code_value: any;
  name_value: any;
  size_value: any[] = [];
  packing_values: any[] = [];
  packData_values: any[] = [];

  formsource: FormGroup;
  isPackagesPopupVisible: boolean = false;
  showAddPopup = false;

  newPackage = {
    packing: '',
    pair: null,
  };

  packingList = [
    { packing: '5X10', pair: 30 },
    { packing: '8X10', pair: 30 },
    { packing: 'CUTSUZE 8X10', pair: 30 },
  ];
  newPackEntry: {
    PACK_NAME: string;
    PAIR_QTY: number;
    PACKCOMBINATIONS: { SIZE: string; QUANTITY: number }[];
    ISANYCOMBINATION: boolean;
    ISEXPORT: boolean;
  };

  updatedPackEntry: {
    PACK_NAME: string;
    PAIR_QTY: number;
    ISANYCOMBINATION: any;
    ISEXPORT: any;
    PACKCOMBINATIONS: { size: any; pairQty: any }[];
  };
  newPack: {
    PACK_NAME: string;
    PAIR_QTY: number;
    ISANYCOMBINATION: boolean;
    ISEXPORT: boolean;
    PACKCOMBINATIONS: { SIZE: any; QUANTITY: any }[];
  };
  packedDatatransformed: {
    PACK_NAME: any;
    PAIR_QTY: any;
    ISANYCOMBINATION: any;
    ISEXPORT: any;
    PACKCOMBINATIONS: any;
  }[];

  PACKING: {
    NAME: any; // ✅ This must not be empty
    ISEXPORT: any;
    PAIR_QTY:any;
    ISANYCOMBINATION: any;
    PACKCOMBINATIONS: any;
  }[];
  packNameValue: any;
  Pair_quantity_value: any;
  totalPairQtyVLUE: any = 5;
  selectedPacking: any = {
    ISEXPORT: false,
    ISANYCOMBINATION: false,
  };
  showPopup = false;
  autofilledCategory: string = '';
  packData: any = {
    PACK_NAME: '',
    SIZEDETAILS: [],
    ISEXPORT: false,
    ISANYCOMBINATION: false,
    PAIR_QTY: 0,
  };
  packingData: any[] = [];
  updtepackingData: any[] = [];
  isExport_value: boolean=false;
  anyCombination_value: boolean=false;
  status_value: any;
    addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.openPopup());
    },
    elementAttr: { class: 'add-button' }
  };


      refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };

  isEditing: boolean;
  editIndex: number;
  constructor(private fb: FormBuilder, private dataservice: DataService,private ngZone: NgZone, private router : Router,private cdr:ChangeDetectorRef) {
    this.sizeOptions = Array.from({ length: 12 }, (_, i) => i + 1);
    this.formsource = this.fb.group({
      ID: [''],
      code: [''],
      category: [''],
      IS_INACTIVE: [true],
      size: [[]],
    });
    this.get_list_data_category();
  }

  // calculateTotal(e) {
  //   //  console.log('Cell value changed:', e);
  //   console.log('Cell changed:', e);

  // }

    ngOnInit(){
const currentUrl = this.router.url;
  console.log('Current URL:', currentUrl);
   const menuResponse = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');
  console.log('Parsed ObjectData:', menuResponse);

  const menuGroups = menuResponse.MenuGroups || [];
  console.log('MenuGroups:', menuGroups);
const packingRights = menuGroups
  .flatMap(group => group.Menus)

  .find(menu => menu.Path === '/category');


if (packingRights) {
  this.canAdd = packingRights.CanAdd;
  this.canEdit = packingRights.CanEdit;
  this.canDelete = packingRights.CanDelete;
    this.canPrint = packingRights.CanEdit;
  this.canView = packingRights.canView;
   this.canApprove = packingRights.canApprove;
}

console.log('packingRights',packingRights);
console.log(  this.canAdd ,  this.canEdit ,  this.canDelete );

  }

 
toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  //===========================Calculate total pair Quantity=========================
  calculateTotal() {
    console.log(this.packData, 'latest data of size list');

    if (this.packData?.SIZEDETAILS?.length) {
      this.totalPairQty = this.packData.SIZEDETAILS.reduce((acc, item) => {
        const qty = parseFloat(item.pairQty) || 0;
        return acc + qty;
      }, 0);
    } else {
      this.totalPairQty = 0;
    }

    console.log('Total pairQty:', this.totalPairQty);
  }

  //==================================Calculate total pair Quantity=========================
  //===========================Calculate total pair Quantity=========================
  calculateTotalUpdate() {
    console.log(this.packData_values, 'latest data of size list');

    if (this.packData_values) {
      this.Pair_quantity_value = this.packData_values.reduce((acc, item) => {
        const qty = parseFloat(item.pairQty) || 0;
        return acc + qty;
      }, 0);
    } else {
      this.Pair_quantity_value = 0;
    }

    console.log('Total pairQty:', this.Pair_quantity_value);
  }

  sortSelectedSizes(event: any) {
    const sorted = (event.value ?? []).sort((a: number, b: number) => a - b);
    this.formsource.get('size')?.setValue(sorted, { emitEvent: false });
    const selectedSizes = event.value || [];

    // Create or update SIZEDETAILS

    this.packData.SIZEDETAILS = selectedSizes.map((size: number) => {
      // Preserve existing pairQty if already selected
      const existing = this.packData.SIZEDETAILS.find(
        (s: any) => s.size === size
      );
      return {
        size,
        pairQty: existing ? existing.pairQty : 0,
      };
    });
  }
sortSelectedSizesupdte(event: any) {
  let selectedSizes = event.value;

  // ✅ Sort the sizes numerically
  selectedSizes = selectedSizes.sort((a: number, b: number) => a - b);

  // ✅ Update the selected size array to reflect sorted order in tag-box
  this.size_value = selectedSizes;

  // ✅ Preserve existing pairQty values (if any)
  const existingMap = new Map<number, number>();
  this.packData_values?.forEach((item) => {
    existingMap.set(item.size, item.pairQty || 0);
  });

  // ✅ Rebuild the grid data in sorted order
  this.packData_values = selectedSizes.map((size: number) => ({
    size: size,
    pairQty: existingMap.get(size) ?? 0
  }));
}




  
  Add_packages() {
    const packName = this.packData.PACK_NAME?.trim();
    const totalqty = this.totalPairQty;
  
    if (!packName || totalqty <= 0) {
      notify(
        {
          message: 'Pack Name is required and total pair quantity must be greater than 0.',
          position: { at: 'top right', my: 'top right' },
          displayTime: 2000,
        },
        'error'
      );
      return;
    }
  
    // Prepare the updated pack entry
    const updatedPackEntry = {
      PACK_NAME: packName,
      PAIR_QTY: totalqty,
      PACKCOMBINATIONS: this.packData.SIZEDETAILS.map((item) => ({ ...item })),
      ISANYCOMBINATION: this.packData.ISANYCOMBINATION,
      ISEXPORT: this.packData.ISEXPORT,
    };
  
    if (this.isEditing && this.editIndex !== null) {
      // ✅ Update Mode
      this.packingData[this.editIndex] = { ...updatedPackEntry };
  
      this.isEditing = false;
      this.editIndex = null;
    } else {
      // ✅ Add Mode
      const existingIndex = this.packingData.findIndex(
        (pack) => pack.PACK_NAME.toLowerCase() === packName.toLowerCase()
      );
  
      if (existingIndex !== -1) {
        notify(
          {
            message: 'This Pack Name already exists',
            position: { at: 'top right', my: 'top right' },
            displayTime: 2000,
          },
          'error'
        );
        return;
      }
  
      this.packingData.push(updatedPackEntry);
    }
  
    // ✅ Update PACKING array
    this.PACKING = this.packingData.map((pack) => ({
      NAME: pack.PACK_NAME,
      ISEXPORT: pack.ISEXPORT,
      PAIR_QTY: pack.PAIR_QTY,
      ISANYCOMBINATION: pack.ISANYCOMBINATION,
      PACKCOMBINATIONS: pack.PACKCOMBINATIONS,
    }));
  
    // ✅ Reset form
    this.resetPackForm();
  }
  
  // ✅ Handle Row Selection for Editing
  onSelectPackAdd(e: any) {
    const selectedData = e.data;
  
    this.packData.PACK_NAME = selectedData.PACK_NAME;
    this.packData.ISEXPORT = selectedData.ISEXPORT;
    this.packData.ISANYCOMBINATION = selectedData.ISANYCOMBINATION;
  
    this.packData.SIZEDETAILS = selectedData.PACKCOMBINATIONS.map(item => ({
      size: item.size,
      pairQty: item.pairQty
    }));
  
    this.totalPairQty = this.packData.SIZEDETAILS.reduce((sum, item) => sum + (item.pairQty || 0), 0);
  
    // ✅ Enable Edit Mode
    this.isEditing = true;
    this.editIndex = this.packingData.findIndex(p => p.PACK_NAME === selectedData.PACK_NAME);
  
    console.log('Selected Pack for Editing:', selectedData);
  }
  
  // ✅ Reset form after add/update
  resetPackForm() {
    this.packData.PACK_NAME = null;
    this.packData.ISEXPORT = false;
    this.packData.ISANYCOMBINATION = false;
    this.packData.SIZEDETAILS.forEach(item => (item.pairQty = 0));
    this.totalPairQty = 0;
    setTimeout(() => {
      this.PackformValidationGroup?.instance?.reset();
    });
  }
  

//  Add_packagesUpdate() {
//   console.log('Update/Add package function call');

//   console.log(this.packData_values, 'Current packData_values');
//   const packName = this.packNameValue?.trim();
//   const total_qty = this.Pair_quantity_value;
//   console.log(packName, total_qty);



//   if (!packName || total_qty <= 0) {
//     notify(
//       {
//         message:
//           'Pack Name is required and total pair quantity must be greater than 0.',
//         position: { at: 'top right', my: 'top right' },
//         displayTime: 2000,
//       },
//       'error'
//     );
//     return;
//   }

//   this.calculateTotalUpdate();

//   const newPack = {
//     NAME: packName,
//     PAIR_QTY: total_qty,
//     ISANYCOMBINATION: this.anyCombination_value,
//     ISEXPORT: this.isExport_value,
//     PACKCOMBINATIONS: this.packData_values.map((item) => ({
//       size: item.size,
//       pairQty: item.pairQty,
//     })),
//   };

//   const existingIndex = this.packing_values.findIndex(
//     (pack) => pack.NAME.toLowerCase() === packName.toLowerCase()
//   );

//   // ✅ If editing existing pack
// if (this.selectedPackIndex !== null) {
//   if (existingIndex !== -1 && existingIndex !== this.selectedPackIndex) {
//     notify(
//       {
//         message: `Pack Name "${packName}" already exists.`,
//         position: { at: 'top right', my: 'top right' },
//         displayTime: 2000,
//       },
//       'error'
//     );
//     return;
//   }

//   this.packing_values[this.selectedPackIndex] = newPack;
//   console.log('✅ Updated pack at index', this.selectedPackIndex);
// } else {
//     // ✅ Adding new pack
//     if (existingIndex !== -1) {
//       notify(
//         {
//           message: `Pack Name "${packName}" already exists.`,
//           position: { at: 'top right', my: 'top right' },
//           displayTime: 2000,
//         },
//         'error'
//       );
//       return;
//     }

//     this.packing_values.push(newPack);
//     console.log('✅ Added new pack');
//   }

//   console.log('✅ packing_values:', this.packing_values);

//     this.packNameValue = null;
//     this.isExport_value = false;
//     this.anyCombination_value = false;
//     this.packData_values.forEach(item => (item.pairQty = 0));
//     this.Pair_quantity_value = 0;
//     setTimeout(() => {
//       this.PackformValidationGroup?.instance?.reset();
//     });
//   // ✅ Reset form
//   // this.resetForm();
// }

Add_packagesUpdate() {
  console.log('Update/Add package function call');

  const packName = this.packNameValue?.trim();
  const total_qty = this.Pair_quantity_value;

  if (!packName || total_qty <= 0) {
    notify(
      {
        message:
          'Pack Name is required and total pair quantity must be greater than 0.',
        position: { at: 'top right', my: 'top right' },
        displayTime: 2000,
      },
      'error'
    );
    return;
  }

  this.calculateTotalUpdate();

  const newPack = {
    NAME: packName,
    PAIR_QTY: total_qty,
    ISANYCOMBINATION: this.anyCombination_value,
    ISEXPORT: this.isExport_value,
    PACKCOMBINATIONS: this.packData_values.map((item) => ({
      size: item.size,
      pairQty: item.pairQty,
    })),
  };

  const existingIndex = this.packing_values.findIndex(
    (pack) => pack.NAME.toLowerCase() === packName.toLowerCase()
  );

  // 🟢 EDITING MODE
  if (this.selectedPackIndex !== null && this.selectedPackIndex >= 0) {
    // Check if the new name conflicts with another pack
    if (existingIndex !== -1 && existingIndex !== this.selectedPackIndex) {
      notify(
        {
          message: `Pack Name "${packName}" already exists.`,
          position: { at: 'top right', my: 'top right' },
          displayTime: 2000,
        },
        'error'
      );
      return;
    }

    this.packing_values[this.selectedPackIndex] = newPack;
    console.log('✅ Updated pack at index', this.selectedPackIndex);
  }

  // 🟢 ADDING MODE
  else {
    // Only block if an existing pack has the same name
    if (existingIndex !== -1) {
      notify(
        {
          message: `Pack Name "${packName}" already exists.`,
          position: { at: 'top right', my: 'top right' },
          displayTime: 2000,
        },
        'error'
      );
      return;
    }

    this.packing_values.push(newPack);
    console.log('✅ Added new pack');
  }

  console.log('✅ packing_values:', this.packing_values);

  // 🧹 Reset form fields
  this.packNameValue = null;
  this.isExport_value = false;
  this.anyCombination_value = false;
  this.packData_values.forEach((item) => (item.pairQty = 0));
  this.Pair_quantity_value = 0;
  this.selectedPackIndex = null; // <---- IMPORTANT: Reset this!

  setTimeout(() => {
    this.PackformValidationGroup?.instance?.reset();
  });
}


    //===============list of data================
    get_list_data_category() {
      this.dataservice.list_of_category().subscribe((res: any) => {
        console.log(res);
        // this.CategoryList = res.CATEGORIES;
            this.CategoryList = res.CATEGORIES.map((item: any, index: number) => ({
      ...item,
      SNO: index + 1
    }));

      });
    }

  //=============================ADD DATA========================
  AddData() {
    const validationResult = this.formValidationGroup?.instance?.validate();
    console.log(this.formsource);
    const commonDetails = this.formsource.value;
    console.log(commonDetails);

    // First check if form is valid
    if (!this.formsource.valid) {
      notify(
        {
          message: 'Please fill all required fields',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    }

    // Check for duplicates in CategoryList
    const isCodeDuplicate = this.CategoryList.some(
      // (item: any) => item.CODE === commonDetails.code
        (item: any) => item.CODE.toLowerCase() === commonDetails.code.toLowerCase()
    );

    const isDescriptionDuplicate = this.CategoryList.some(
      // (item: any) => item.DESCRIPTION === commonDetails.category
            (item: any) =>
    item.DESCRIPTION.toLowerCase() === commonDetails.category.toLowerCase()
    );

    

    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and Description already exist',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    } else if (isCodeDuplicate) {
      notify(
        {
          message: 'This Code already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    } else if (isDescriptionDuplicate) {
      notify(
        {
          message: 'This Description already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    }

    // If no duplicates, proceed with saving
    const payload = {
      CODE: commonDetails.code,
      DESCRIPTION: commonDetails.category,
      IS_INACTIVE: false,
      SIZES: commonDetails.size,
      PACKING: this.PACKING,
    };

    console.log(payload);
    if (!validationResult.isValid) {
      // Optional: show a DevExtreme notify message
      // notify('Please correct the validation errors before saving.', 'error', 3000);
      return; // ❌ Prevent saving if form is invalid
    }

    this.dataservice.Add_category_list(payload).subscribe(
      (res: any) => {
        console.log(res);
        notify(
          {
            message: 'Category added successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'success'
        );
        this.get_list_data_category();
        this.handleClose(); // Close the popup if successful
      },
      (error) => {
        console.error(error);
        notify(
          {
            message: 'Error adding category',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'error'
        );
      }
    );
  }

  onEditingStart(event: any) {
    event.cancel = true;
    this.isEditPopup = true;
    
      setTimeout(() => {
    this.PackformValidationGroup?.instance?.reset();
    console.log('===================');
    
  }, 0);
    // Reset DevExtreme validator state
  setTimeout(() => {
    
    this.PackformValidationGroup?.instance?.reset();
  });

    this.select_category(event);


  


  }

  //============================================Update ==========
  UpdateData() {
   

    const updatedPayload = {
      ID: this.selected_Data.ID,
      CODE: this.code_value,
      IS_INACTIVE: this.status_value,
      DESCRIPTION: this.name_value,
      SIZES: this.size_value,
      PACKING: this.packing_values,
    };

    console.log('Update Payload:', updatedPayload);

    // Check for duplicates in CategoryList (excluding current item)
 const isCodeDuplicate = this.CategoryList.some(
  (item: any) =>
    item.CODE?.toLowerCase() === updatedPayload.CODE?.toLowerCase() &&
    item.ID !== updatedPayload.ID
);

const isDescriptionDuplicate = this.CategoryList.some(
  (item: any) =>
    item.DESCRIPTION?.toLowerCase() === updatedPayload.DESCRIPTION?.toLowerCase() &&
    item.ID !== updatedPayload.ID
);
    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and Description already exist',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    } else if (isCodeDuplicate) {
      notify(
        {
          message: 'This Code already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    } else if (isDescriptionDuplicate) {
      notify(
        {
          message: 'This Description already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    }

    // If no duplicates, proceed with update
    this.dataservice.update_category_details(updatedPayload).subscribe(
      (res: any) => {
        console.log(res);
        notify(
          {
            message: 'Category updated successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'success'
        );
        this.isEditPopup = false;
        this.get_list_data_category();
      },
      (error) => {
        console.error(error);
        notify(
          {
            message: 'Error updating category',
            position: { at: 'top right', my: 'top right' },
            displayTime: 1000,
          },
          'error'
        );
      }
    );
  }

  delete_Category_Data(event: any) {
    const id = event.data.ID;

    this.dataservice.Delete_Category_Data(id).subscribe((res: any) => {
      console.log(res);

      notify(
        {
          message: 'Category deleted successfully',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'success'
      );
      this.get_list_data_category();
    });
  }

  handleClose() {
    this.isAddPopup = false;
    this.showAddPopup = false;
    this.isEditPopup = false;
    this.formsource.reset();
    this.packNameValue = '';
    this.isExport_value = null;
    this.anyCombination_value = null;
    this.packData_values = [];
    this.Pair_quantity_value = 0;

       setTimeout(() => {
    this.PackformValidationGroup?.instance?.reset();
  }, 0);
  }
  openPopup = () => {
    this.isAddPopup = true;
    this.formsource.reset();
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });
    // Reset text & checkbox values
    this.packData.PACK_NAME = '';
    this.packData.ISEXPORT = false;
    this.packData.ISANYCOMBINATION = false;

    // Reset only pairQty (not size) in grid
    this.packData.SIZEDETAILS = this.packData.SIZEDETAILS.map((item) => ({
      ...item,
      pairQty: 0,
    }));
    this.packingData = [];

    // Reset total pair quantity field
    this.totalPairQty = 0;
  };
onSelectPack(e: any) {
  const selectedPack = e.data;
  const index = this.packing_values.findIndex(p => p.NAME === selectedPack.NAME);
  this.selectedPackIndex = index !== -1 ? index : null;

  console.log('Selected index for editing:', this.selectedPackIndex);

  if (selectedPack?.PACKCOMBINATIONS) {
    this.packData_values = selectedPack.PACKCOMBINATIONS.map((x) => ({ ...x }));
    this.totalPairQty = this.packData_values.reduce((sum, item) => sum + (item.QUANTITY || 0), 0);
    this.packNameValue = selectedPack.NAME || '';
    this.isExport_value = selectedPack.ISEXPORT;
    this.anyCombination_value = selectedPack.ISANYCOMBINATION;
  }
}


 
  select_category(event) {
     
    const id = event.data.ID;
    this.dataservice.select_category_Details_Api(id).subscribe((res: any) => {
      this.selected_Data = res.Data;

      this.code_value = this.selected_Data.CODE;
      this.name_value = this.selected_Data.NAME;
      this.size_value = this.selected_Data.SIZES;
      this.status_value = this.selected_Data.IS_INACTIVE;

      // Full list of packings
      this.packing_values = this.selected_Data.PACKING || [];
      console.log(this.packing_values);
      console.log(this.packData_values,'');
this.anyCombination_value=false
this.isExport_value=false
   this.packData_values = this.selected_Data.SIZES.map((size) => ({
      size: size,
      pairQty: 0
    }));

      if (this.packing_values.length > 0) {
        // Bind first packing object to checkboxes
        this.selectedPacking = this.packing_values[0];
       
      
      }
    });
  }

  updateGridSizes(event: any) {
  const selectedSizes = event.value; // New selected sizes from tag box

  // Create a map of existing pairQtys for reference
  const existingMap = new Map<number, number>();
  this.packData_values?.forEach((item) => {
    existingMap.set(item.size, item.pairQty || 0);
  });

  // Build the new array using selected sizes
  this.packData_values = selectedSizes.map((size: number) => ({
    size: size,
    pairQty: existingMap.get(size) ?? 0  // Keep old value if exists, else 0
  }));
}

  onPairQtyChangedValue() {
    this.Pair_quantity_value = this.packData_values.reduce(
      (sum, item) => sum + (item.QUANTITY || 0),
      0
    );
  }

getStatusFlagClass(IS_INACTIVE: boolean): string {
return IS_INACTIVE ? 'flag-red' : 'flag-green';
}


  onEditPackUpdate(e: any) {
    const selectedPack = e.data;

    this.packData_values = selectedPack.PACKCOMBINATIONS || [];
    this.Pair_quantity_value = selectedPack.PAIR_QTY || 0;

    // this.calculateTotalPairQty(); // optional re-calculate if needed
  }

  onEditPackUpdateedit(e: any) {

     }
     calculateTotalUpdateedit() {
     }

         refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
      this.get_list_data_category()
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
    ReactiveFormsModule,
    DxTagBoxModule,
    DxValidationGroupModule,
  ],
  providers: [],
  declarations: [CategoryComponent],
  exports: [CategoryComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CategoryModule {}
