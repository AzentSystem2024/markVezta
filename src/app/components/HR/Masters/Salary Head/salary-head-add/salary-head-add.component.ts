// import { Component } from '@angular/core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  NgModule,
  NgZone,
  Output,
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
  DxValidationGroupComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import { SelectionChangedEvent } from 'devextreme/ui/data_grid';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';
import { SalaryHeadListModule } from '../salary-head-list/salary-head-list.component';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-salary-head-add',
  templateUrl: './salary-head-add.component.html',
  styleUrls: ['./salary-head-add.component.scss'],
})
export class SalaryHeadAddComponent {
  @Output() formClosed = new EventEmitter<void>();

  @ViewChild('SalaryHeadValidation', { static: false })
  SalaryHeadValidation: DxValidationGroupComponent;
  selectedHeads: any;
  Ac_head_values: any;
  affective_value: boolean = false;
  selectedNatureId: any;
  isEnabled = true;
  HeadType_value: any;
  isDisableNumberbox: boolean = false;
  ApplicableWorkingDay: boolean = false;
  selecteNatureTypeTwo: boolean = false;
  selecteNatureTypeone: boolean = false;
  ApplicableWithBasicRange: boolean = false;
  head_percent: boolean = false;
  head_From: boolean = false;
  head_To: boolean = false;
  SalaryHeadData = {
    COMPANY_ID: 1,
    HEAD_NAME: '',
    PAYSLIP_TITLE: '',
    HEAD_ACTIVE: true,
    HEAD_TYPE: 1,
    INSTALLMENT_RECOVERY: false,
    HEAD_PERCENT_INCLUDE_OT: true,
    IS_INACTIVE: false,
    AFFECT_LEAVE: false,
    AC_HEAD_ID: 0,
    HEAD_ORDER: 0,
    HEAD_NATURE: 0,
    FIXED_AMOUNT: 0,
    HEAD_PERCENT: 0,
    PERCENT_HEAD_ID: [],
    RANGE_EXISTS: false,
    RANGE_FROM: 0,
    RANGE_TO: 0,
  };

  priorities = [
    { id: 1, name: 'Allowance' },
    { id: 2, name: 'Deduction' },
    { id: 3, name: 'Advance' },
  ];
  // selectedPriority  = this.priorities[0];
  // // or set by id
  selectedPriority = this.priorities.find((p) => p.id === 1);

  salaryHeadTypes = [{ label: 'Fixed Amount', value: 'fixed' }];
  salaryHeadTypes2 = [{ label: '', value: 'percentage' }];
  salaryHeadTypes3 = [{ label: 'Others', value: 'others' }];

  //  , // Label not shown for second radio
  //
  // selectedType:any
  selectedType: any;
  selectedRows: any[];
  salaryHeadList: any;
  payload: { HEAD_NATURE: any; HEAD_TYPE: any; HEAD_NAME: string; PAYSLIP_TITLE: string; HEAD_ACTIVE: boolean; INSTALLMENT_RECOVERY: boolean; HEAD_PERCENT_INCLUDE_OT: boolean; IS_INACTIVE: boolean; AFFECT_LEAVE: boolean; AC_HEAD_ID: number; HEAD_ORDER: number; FIXED_AMOUNT: number; HEAD_PERCENT: number; PERCENT_HEAD_ID: any[]; RANGE_EXISTS: boolean; RANGE_FROM: number; RANGE_TO: number; };

  constructor(private dataservice: DataService) {
    this.get_headnameGrid();
    this.getSalaryHeadList();
    console.log(this.selectedPriority, 'selectedType==========');
    const defaultNumericValue = 1;

    const defaultTypeMap: { [key: number]: string } = {
      1: 'fixed',
      2: 'percentage',
      3: 'others',
    };
    // Set selectedType based on numeric default
    this.selectedType = defaultTypeMap[defaultNumericValue];
    this.dataservice.Dropdown_ac_head(name).subscribe((res: any) => {
      console.log('ac head dropdown', res);
      this.Ac_head_values = res;
    });

      
  // Reset other UI flags
  this.selecteNatureTypeTwo = false; 
  this.head_percent = false;
  this.head_From = false;
  this.head_To = false;
  this.ApplicableWithBasicRange = false;
  this.ApplicableWorkingDay = false;
  this.selecteNatureTypeone = false;
  }

  ngOnInit() {
    this.selectedPriority = this.priorities.find((p) => p.id === 1);
    this.dataservice.Dropdown_ac_head(name).subscribe((res: any) => {
      console.log('ac head dropdown', res);
      this.Ac_head_values = res;
    });
  }

  //================disbled================
  //  isAdvanceSelected(): boolean {
  //   console.log(this.selectedPriority, "selectedType");
  //   return this.selectedPriority.id === 3;

  // }
  //=============== head_name dropdown==========

  get_headnameGrid() {
    this.dataservice.Dropdown_advance_types(name).subscribe((res: any) => {
      console.log('head name dropdown', res);
      this.selectedHeads = res;
    });
  }

  //===================grid value=====================
  onSelectionChanged(event: SelectionChangedEvent) {
    console.log(event, '===========event=================');
    const selectedRowsData = event.selectedRowsData;
    console.log(
      selectedRowsData,
      '===========selectedRowsData================='
    );

    this.SalaryHeadData.PERCENT_HEAD_ID = selectedRowsData.map(
      (row: any) => row.ID
    );
    console.log(
      this.SalaryHeadData.PERCENT_HEAD_ID,
      '===========this.SalaryHeadData'
    );
  }
  //================auto fill payslip title=====================
  onHeadNameChanged(e: any) {
    this.SalaryHeadData.HEAD_NAME = e.value;

    // Auto-fill PAYSLIP_TITLE only if it's empty
    if (!this.SalaryHeadData.PAYSLIP_TITLE) {
      this.SalaryHeadData.PAYSLIP_TITLE = e.value;
    }
  }

  //=======================list data=============
  getSalaryHeadList() {
    this.dataservice.get_salary_head_list().subscribe((res: any) => {
      // console.log('Salary Head List:', res);

      this.salaryHeadList = res.Data;
      this.setNextHeadOrder();
    });
  }
  setNextHeadOrder() {
    // this.getSalaryHeadList()
    if (this.salaryHeadList && this.salaryHeadList.length > 0) {
      const maxOrder = Math.max(
        ...this.salaryHeadList.map((item) => item.HEAD_ORDER || 0)
      );
      this.SalaryHeadData.HEAD_ORDER = maxOrder + 1;
      // console.log('Next Head Order:', this.SalaryHeadData.HEAD_ORDER);
    } else {
      this.SalaryHeadData.HEAD_ORDER = 1; // Default if list is empty
    }
  }

  // onTypeChangedd(e:any){
  //   console.log('===============data added============');

  // }

  onPriorityChanged(e: any) {
    this.selectedPriority = e.value;
    console.log(e.value, '=========event=====================');
    this.HeadType_value = e.value.id || 1;

    console.log(
      this.HeadType_value,
      '=========HeadType_value====================='
    );
    this.isEnabled = this.HeadType_value === 1 || this.HeadType_value === 2;

    if(  this.HeadType_value==3){
       const defaultNumericValue = 3;

    const defaultTypeMap: { [key: number]: string } = {
      1: 'fixed',
      2: 'percentage',
      3: 'others',
    };
    // Set selectedType based on numeric default
    this.selectedType = defaultTypeMap[defaultNumericValue];
    }
  }
  
  setDefaultValues() {
    const defaultNumericValue = 1;

    const defaultTypeMap: { [key: number]: string } = {
      1: 'fixed',
      2: 'percentage',
      3: 'others',
    };
    
    // Set selectedType based on numeric default
    this.selectedType = defaultTypeMap[defaultNumericValue];
    console.log(this.selectedType,'========selected typeee=========')
    if(this.selectedType=='fixed'){
      this.selecteNatureTypeTwo = true;
      this.head_percent = true;
      this.head_From = true;
      this.head_To = true;
      this.ApplicableWithBasicRange = true;
    }
    this.selectedPriority = this.priorities.find((p) => p.id === 1); // Allowance
    this.SalaryHeadData.HEAD_TYPE = 1;
    this.HeadType_value = 1;
    this.isEnabled = true;
    
  }

  // validateAcLedger(e: any) {
  //   if (this.HeadType_value === 3) {
  //     console.log('head tyope', this.HeadType_value);
  //     return e.value !== null && e.value !== undefined && e.value !== '';
  //   }
  //   return true; // valid for other HeadType values
  // }
  validateAcLedger = (e: any): boolean => {
    if (this.HeadType_value === 3) {
      return e.value !== null && e.value !== undefined && e.value !== '';
    }
    return true;
  };

  onTypeChange() {
    console.log(' on type  function called==================');
    console.log(this.selectedType, 'selectedType');
    const headNatureMap: { [key: string]: number } = {
      fixed: 1,
      percentage: 2,
      others: 3,
    };

    console.log('selectedType', headNatureMap);
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

  isValid() {
    return this.SalaryHeadValidation.instance.validate().isValid;
  }

  //=============save salary head data========================
  saveSalaryHeadData() {
    if (!this.isValid()) return;
    console.log(this.selectedPriority, 'selectedType');

    console.log(this.selectedType, 'selectedType');
    console.log('Saving Salary Head Data:', this.SalaryHeadData);

    //   const headNatureMap: { [key: string]: number } = {
    //     fixed: 1,
    //     percentage: 2,
    //     others: 3
    //   };

    const priorityId = this.selectedPriority.id;

    const headNatureMap: { [key: string]: number } = {
      fixed: 1,
      percentage: 2,
      others: 3,
    };

    const natureId = headNatureMap[this.selectedType?.value]; // assuming selectedType is like { value: 'fixed' }

    console.log(
      this.affective_value,
      '====Applicable for working days only================'
    );

    if (this.SalaryHeadData.HEAD_NAME) {
      const isDuplicate = this.salaryHeadList.some(
        (head: any) =>
          head.HEAD_NAME.trim().toLowerCase() ===
          this.SalaryHeadData.HEAD_NAME.trim().toLowerCase()
      );

      if (isDuplicate) {
        notify(
          {
            message: 'Salary Head already exist',
            position: { at: 'top center', my: 'top center' },
          },
          'error'
        );
        return;
      }
      // if(this.selectedPriority.id===3 && this.SalaryHeadData.AC_HEAD_ID==0){
      //   notify(
      //             {
      //               message: 'Please select ac head',
      //               position: { at: 'top center', my: 'top center' },
      //             },
      //             'error'
      //           );
      //   return;

      // }
      const priorityId = this.selectedPriority?.id || this.selectedPriority;
      if (priorityId === 3 && this.SalaryHeadData.AC_HEAD_ID == 0) {
        notify(
          {
            message: 'Please select Account Ledger',
            position: { at: 'top center', my: 'top center' },
          },
          'error'
        );
        return;
      }
  const selectedNatureId = this.selectedNatureId
      if (selectedNatureId === 2) {
        notify(
          {
            message: 'Please select Atlear one Head Name',
            position: { at: 'top center', my: 'top center' },
          },
          'error'
        );
        return;
      }
      

      console.log(this.SalaryHeadData.HEAD_NATURE,'=====================')
      if(this.SalaryHeadData.HEAD_NATURE===3){
          this.payload = {
        ...this.SalaryHeadData,
        HEAD_NATURE: this.selectedNatureId,
        FIXED_AMOUNT:0,
        HEAD_TYPE: this.HeadType_value || 1,
      };
      }
      else{
       this.payload = {
        ...this.SalaryHeadData,
      
        HEAD_NATURE: this.selectedNatureId,
        HEAD_TYPE: this.HeadType_value || 1,
      };
    }
      console.log(this.payload, 'payload');
      this.dataservice.Add_salary_Head_api(this.payload).subscribe((res: any) => {
        console.log(res, '==========res====================');
    
             this.getSalaryHeadList();
        notify(
          {
            message: 'Salary Head added successfully ',
            position: { at: 'top center', my: 'top center' },
          },
          'success'
        );

        this.formClosed.emit();
        setTimeout(() => {
          this.SalaryHeadValidation?.instance?.reset();
        });
        this.selectedRows = [];
        this.selectedNatureId = null;
        // this.selectedPriority = this.priorities.find(p => p.id === 1)
        this.selectedPriority;
        this.resetForm();
      });
    }
  }

  resetForm() {
    this.SalaryHeadData = {
      COMPANY_ID: 1,
      HEAD_NAME: '',
      PAYSLIP_TITLE: '',
      HEAD_ACTIVE: true,
      HEAD_TYPE: 1,
      INSTALLMENT_RECOVERY: false,
      HEAD_PERCENT_INCLUDE_OT: true,
      IS_INACTIVE: false,
      AFFECT_LEAVE: false,
      AC_HEAD_ID: 0,
      HEAD_ORDER: 0,
      HEAD_NATURE: 0,
      FIXED_AMOUNT: 0,
      HEAD_PERCENT: 0,
      PERCENT_HEAD_ID: [],
      RANGE_EXISTS: false,
      RANGE_FROM: 0,
      RANGE_TO: 0,
    };

    // Reset to default priority (Allowance)
    this.selectedPriority = this.priorities.find((p) => p.id === 1);
    // this.HeadType_value = 1; // Reset HeadType_value as well
    this.isEnabled = true;

    // Reset other UI flags
    this.selecteNatureTypeTwo = false;
    this.head_percent = false;
    this.head_From = false;
    this.head_To = false;
    this.ApplicableWithBasicRange = false;
    this.ApplicableWorkingDay = false;
    this.selecteNatureTypeone = false;

    // Reset validation and selections
    setTimeout(() => {
      this.SalaryHeadValidation?.instance?.reset();
    });
    this.selectedRows = [];
    this.selectedNatureId = null;
    this.selectedType = null; // Reset the selected type as well

    this.selectedPriority = this.priorities.find((p) => p.id === 1); // Reset to Allowance
    this.HeadType_value = 1;
  }
  // resetForm(){
  //    this.SalaryHeadData={
  //       HEAD_NAME: "",
  //       PAYSLIP_TITLE: "",
  //       HEAD_ACTIVE: true,
  //       HEAD_TYPE: 1,
  //       INSTALLMENT_RECOVERY:false,
  //       HEAD_PERCENT_INCLUDE_OT: true,
  //       IS_INACTIVE: false,
  //       AFFECT_LEAVE: false,
  //       AC_HEAD_ID:0,
  //       HEAD_ORDER:0,
  //       HEAD_NATURE:0,
  //       FIXED_AMOUNT:0,
  //       HEAD_PERCENT:0,
  //       PERCENT_HEAD_ID:[],
  //       RANGE_EXISTS:false,
  //       RANGE_FROM:0,
  //       RANGE_TO:0,
  //      }
  //          setTimeout(() => {
  //       this.SalaryHeadValidation?.instance?.reset();
  //     });
  //   this.selectedRows = [];
  //   this.selectedNatureId = null;
  //   // this.selectedPriority = this.priorities.find(p => p.id === 1);

  // }
  //==================ac head dropdown========================
  onChangeAc_head(event: any) {}

  //=====cancel==============================
  //

  cancel() {
    this.formClosed.emit();
    console.log('this cancel close popup');
    this.resetForm();
    setTimeout(() => {
      this.SalaryHeadValidation?.instance?.reset();
    });
    this.selectedRows = [];
    console.log(this.selectedPriority, 'selectedType');
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
    DxNumberBoxModule,
    DxiGroupModule,
    DxValidatorModule,
    DxValidationGroupModule,
  ],
  providers: [],
  declarations: [SalaryHeadAddComponent],
  exports: [SalaryHeadAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalaryHeadAddModule {}
