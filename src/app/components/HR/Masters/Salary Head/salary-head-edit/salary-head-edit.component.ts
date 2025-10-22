// import { Component } from '@angular/core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  NgZone,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
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
  DxDataGridComponent,
  DxValidationGroupModule,
  DxNumberBoxModule,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-salary-head-edit',
  templateUrl: './salary-head-edit.component.html',
  styleUrls: ['./salary-head-edit.component.scss']
})
export class SalaryHeadEditComponent {
  @Input() selectedSalaryHeadData: any;
  @Output() formClosed = new EventEmitter<void>();
  
selectedHeads: any
Ac_head_values:any
affective_value:boolean = false
grid_value:any=[]
selectedNatureId:any
isDisableNumberbox:boolean = false
ApplicableWorkingDay:boolean = false
selecteNatureTypeTwo:boolean = false
selecteNatureTypeone:boolean = false
ApplicableWithBasicRange:boolean = false
head_percent:boolean = false
head_From:boolean = false
head_To:boolean = false
SalaryHeadData=
{
  ID: 0,
  COMPANY_ID :1 ,
  HEAD_NAME: "",
  PAYSLIP_TITLE: "",
  HEAD_ACTIVE: true,
  HEAD_TYPE: 1,
  INSTALLMENT_RECOVERY:true,
  HEAD_PERCENT_INCLUDE_OT: true,
  IS_INACTIVE: false,
  AFFECT_LEAVE: false,
  AC_HEAD_ID:0,
  HEAD_ORDER:0,
  HEAD_NATURE:0,
  FIXED_AMOUNT:0,
  HEAD_PERCENT:0,
  PERCENT_HEAD_ID:[],
  RANGE_EXISTS:false,
  RANGE_FROM:0,
  RANGE_TO:0,
 
  
}
priorities = [
  { id: 1, name: 'Allowance' },
  { id: 2, name: 'Deduction' },
  { id: 3, name: 'Advance' }
];
selectedPriority :any; // or set by id

salaryHeadTypes = [
  { label: 'Fixed Amount', value: 'fixed' },
 
];
salaryHeadTypes2 = [
  { label: '', value: 'percentage' }
 
];
salaryHeadTypes3 = [
  { label: 'Others', value: 'others' }
 
];
//  , // Label not shown for second radio
// 
selectedType:any
selectedRows: any[];
  // salaryHeadList: any;
  salaryHeadList: any[] = [];

isEnabled: boolean=false;
  HeadType_value: any;
 constructor(private dataservice: DataService,) {
  this.get_headnameGrid()
    
this.dataservice.Dropdown_ac_head(name).subscribe((res:any)=>{
  console.log('ac head dropdown',res);
  this.Ac_head_values=res
})

if(this.selectedType=='fixed'){
  this.isEnabled=false
}
else if(this.selectedType=='percentage'){
  this.isEnabled=false
}
else{
  this.isEnabled=true
}
 }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedSalaryHeadData'] && changes['selectedSalaryHeadData'].currentValue) {
      this.SalaryHeadData = this.selectedSalaryHeadData;

      console.log('Salary Head Data:', this.SalaryHeadData);
      
    }

    this.grid_value = this.SalaryHeadData.PERCENT_HEAD_ID;
    console.log('Grid Value:', this.grid_value);
  
    this.selectedType = this.SalaryHeadData.HEAD_NATURE === 1 ? 'fixed' : this.SalaryHeadData.HEAD_NATURE === 2 ? 'percentage' : 'others';
    console.log('Selected Type:', this.selectedType);
  const headtype= this.priorities.find(p => p.id === this.SalaryHeadData.HEAD_TYPE) || this.priorities[0];
    console.log('Selected Priority:', headtype);
      this.selectedPriority =headtype.id;
  }

onPriorityChanged(e: any) {
  this.selectedPriority = e.value;
  console.log(e.value,'=========event=====================')
  this.HeadType_value=e.value
  console.log(this.HeadType_value,'=========HeadType_value=====================')
  this.isEnabled = this.HeadType_value === 1 || this.HeadType_value === 2;

  // If "Advance" is selected
  if (this.selectedPriority?.id === 3 || this.selectedPriority === 3) {
    this.selectedType = 'others'; // auto select "Others"
    this.onTypeChange();          // trigger your type change logic
  }
}


get_headnameGrid(){
   this.dataservice.Dropdown_advance_types(name).subscribe((res:any)=>{
    console.log('head name dropdown',res);
    this.selectedHeads = res;
   })
}
onTypeChange() {
  console.log(' on type  function called==================')
   console.log(this.selectedType,'selectedType');
  const headNatureMap: { [key: string]: number } = {
    fixed: 1,
    percentage: 2,
    others: 3
  }

console.log('selectedType',headNatureMap);
this.selectedNatureId = headNatureMap[this.selectedType];
console.log('Selected Type ID:', this.selectedNatureId);

  if (this.selectedNatureId === 1) {
      this.selecteNatureTypeTwo = false;
      this.head_percent = true;
      this.head_From = true;
      this.head_To = true;
      this.ApplicableWithBasicRange = true;
      this.ApplicableWorkingDay = false;
    } else if (this.selectedNatureId === 2) {
      this.selecteNatureTypeTwo = true;
      this.head_percent = false;
      this.head_From = false;
      this.head_To = false;
      this.ApplicableWorkingDay = true;
      this.selecteNatureTypeone = true;
      this.ApplicableWithBasicRange = false;
    } else if (this.selectedNatureId === 3) {
      this.head_percent = true;
      this.head_From = true;
      this.head_To = true;
      this.ApplicableWithBasicRange = true;
      this.ApplicableWorkingDay = true;
      this.selecteNatureTypeone = true;
      this.selecteNatureTypeTwo = true;
    }

// if(this.selectedNatureId==1){

// this.selecteNatureTypeTwo=true
// this.head_percent=true
// this.head_From=true
// this.head_To=true

// }
// else if(this.selectedNatureId==2){
//   // this.isDisable=true
// }

}

cancel(){
  this.formClosed.emit(); 
  console.log('Form closed');

}

//===================grid value=====================
onSelectionChanged(event: any) {
  this.SalaryHeadData.PERCENT_HEAD_ID = event.selectedRowKeys;
}

// onSelectionChanged(event: any) {
//   this.SalaryHeadData.PERCENT_HEAD_ID = event.selectedRowKeys; // array of IDs
//   console.log(this.SalaryHeadData.PERCENT_HEAD_ID, 'Selected Percent Head IDs');
// }

// onSelectionChanged(event: any) {
// console.log(event,"===========event=================");
// const selectedRowsData=event.selectedRowsData
// console.log(selectedRowsData,"===========selectedRowsData=================");

// this.SalaryHeadData.PERCENT_HEAD_ID = selectedRowsData.map((row: any) => row.ID);
// console.log(this.SalaryHeadData.PERCENT_HEAD_ID,"===========this.SalaryHeadData")


// }

//=======================list data=============
  getSalaryHeadList() {
    this.dataservice.get_salary_head_list().subscribe((res: any) => {
      console.log('Salary Head List:', res);

      this.salaryHeadList=res.Data
    })
  }

// UpdateSalaryHeadData() {
//   this.getSalaryHeadList()
//   console.log(this.selectedPriority, "selectedType");

//   console.log(this.selectedType,'selectedType');
//   console.log('Saving Salary Head Data:', this.SalaryHeadData);

//   const headNatureMap: { [key: string]: number } = {
//     fixed: 1,
//     percentage: 2,
//     others: 3
//   };
//   console.log('selectedType',headNatureMap);
//   const selectedTypeId = headNatureMap[this.selectedType];
// console.log('Selected Type ID:', selectedTypeId);

// console.log(this.affective_value,'====Applicable for working days only================')

// //  // Check for duplicate HEAD_NAME
// //     if (this.SalaryHeadData.HEAD_NAME) {
// //       const duplicateHead = this.salaryHeadList.find(
// //         (head: any) =>
// //           head.HEAD_NAME.trim().toLowerCase() === this.SalaryHeadData.HEAD_NAME.trim().toLowerCase() &&
// //           head.HEAD_ID !== this.SalaryHeadData.ID // Exclude current record from check
// //       );

      
// //       console.log(duplicateHead)
// //       if (duplicateHead) {
// //         notify(
// //           {
// //             message: `Salary Head  name  already exists`,
// //             position: { at: 'top center', my: 'top center' },
// //           },
// //           'error'
// //         );
// //         return;
// //       }
// //     }

// // if (this.SalaryHeadData.HEAD_NAME) {
// //   const isDuplicate = this.salaryHeadList.some(
// //     (head: any) =>
// //       head.HEAD_NAME.trim().toLowerCase() === this.SalaryHeadData.HEAD_NAME.trim().toLowerCase()
// //   );

// //   if (isDuplicate) {
// //       notify(
// //                 {
// //                   message: 'Salary Head already exist',
// //                   position: { at: 'top center', my: 'top center' },
// //                 },
// //                 'error'
// //               );
// //     return;
// //   }


//     if (this.SalaryHeadData.HEAD_NAME) {
//       console.log(this.SalaryHeadData.HEAD_NAME)
//       console.log(this.salaryHeadList)
//   const isDuplicate = this.salaryHeadList.some((head: any) => 
//     head.HEAD_NAME.trim().toLowerCase() === this.SalaryHeadData.HEAD_NAME.trim().toLowerCase()
//     && head.ID !== this.SalaryHeadData.ID
//   );


//       if (isDuplicate) {
//         notify(
//           {
//             message: 'Salary Head already exist',
//             position: { at: 'top center', my: 'top center' },
//           },
//           'error'
//         );
//         return;
//       }
//     }

//   const payload={
//     ...this.SalaryHeadData,
//     HEAD_TYPE: this.selectedPriority,
//     HEAD_NATURE: selectedTypeId,
//   }
//   console.log(payload, "payload");
//   this.dataservice.Update_salary_Head_api(payload).subscribe((res:any)=>{
//   console.log(res,"==========res=========Update===========");
//   this.formClosed.emit(); 
//        notify(
//                         {
//                           message: 'Salary Head updated successfully ',
//                           position: { at: 'top center', my: 'top center' },
//                         },
//                         'success'
//                       );
  
//  })

// }

UpdateSalaryHeadData() {
//  this.dataservice.get_salary_head_list().subscribe((list: any) => {
//     this.salaryHeadList = list.Data;

    console.log(this.selectedPriority, "selectedPriority");
    console.log(this.selectedType, 'selectedType');
    console.log('Saving Salary Head Data:', this.SalaryHeadData);

    const headNatureMap: { [key: string]: number } = {
      fixed: 1,
      percentage: 2,
      others: 3
    };
    const selectedTypeId = headNatureMap[this.selectedType];
    console.log('Selected Type ID:', selectedTypeId);

    // Duplicate check
    if (this.SalaryHeadData.HEAD_NAME) {
      const isDuplicate = this.salaryHeadList.some((head: any) =>
        head.HEAD_NAME.trim().toLowerCase() === this.SalaryHeadData.HEAD_NAME.trim().toLowerCase() &&
        head.ID !== this.SalaryHeadData.ID
      );

      if (isDuplicate) {
        notify(
          { message: 'Salary Head already exists', position: { at: 'top center', my: 'top center' } },
          'error'
        );
        return;
      }
    

    const payload = {
      ...this.SalaryHeadData,

      HEAD_TYPE: this.selectedPriority,
      HEAD_NATURE: selectedTypeId,
    };

    console.log(payload, "payload");

    this.dataservice.Update_salary_Head_api(payload).subscribe((res: any) => {
      console.log(res, "Update Response");
      this.formClosed.emit();
      notify(
        { message: 'Salary Head updated successfully', position: { at: 'top center', my: 'top center' } },
        'success'
      );
    });
  }
  // });

}

// Your API call
// getSalaryHeadList() {
//   return this.dataservice.Get_salary_Head_List();
// }


onChangeAc_head(e: any) {}

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
    DxiGroupModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxNumberBoxModule
  ],
  providers: [],
  declarations: [SalaryHeadEditComponent],
  exports: [SalaryHeadEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalaryHeadEditModule {}