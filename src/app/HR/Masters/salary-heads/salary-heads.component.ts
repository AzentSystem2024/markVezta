import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
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
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';
import { FormPopupModule, FormTextboxModule } from 'src/app/components';
// import { SalesmanFormModule } from 'src/app/components/library/salesman-form/salesman-form.component';
import { DataService } from 'src/app/services';



@Component({
  selector: 'app-salary-heads',
  templateUrl: './salary-heads.component.html',
  styleUrls: ['./salary-heads.component.scss'],
})
export class SalaryHeadsComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  salaryType: any[];
  salaryOptions = ['Regular Salary', 'Timesheet Entry'];
  Sal_Value: any;
  select_Head_type = ['Gross', 'Deduction'];
  Head_type_Value: any;
  AC_HEAD_ID: any;
  showBorders: boolean = false;
  isAddPopup: boolean = false;
  isEditPopup: boolean = false;
  showHeaderFilter = true;
  IS_INACTIVE: boolean = false;
  Salary_Expence_Details: any;
  selected_Data: any = {};
  edit_Salary_Head: any = {};
  salarySource: any;
  formsource!: FormGroup;
  selectedSalaryType: true;
  showFilterRow: boolean = true;
  popupWidth: string | number = '500px';
  popupHeight: string | number = '360px';
  workinDays: boolean = false;
  inActive: boolean = false;
  code_value: any;
  description_value: any;
  print_description: any;
  salary_Exp_value: any;
  head_order_value: any;
  is_inactive_value: any;
  is_working_Day_value: any;
  is_fixed_value: any;
  id_value: any;
  list_for_duplication: any;
  selected_salary_EXP: any;
  AC_HEAD_VALUE: any;
  isLoading: boolean = true;
  filteredHeads: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  isSystem: boolean;
  is_System:boolean=false

  //=================Form Structure==============================

  constructor(private service: DataService, private fb: FormBuilder) {
    this.formsource = this.fb.group({
      Id: [null],
      code: ['', [Validators.required]],
      description: ['', [Validators.required]],
      print_Description: ['', [Validators.required]],
      IS_INACTIVE: [false, [Validators.required]],
      AC_HEAD_ID: ['', [Validators.required]],
      HEAD_TYPE: ['', [Validators.required]],
      HEAD_ORDER: [0, [Validators.required]],
      IS_WORKING_DAY: [false, [Validators.required]],
      IS_FIXED: [false, [Validators.required]],
    });
    this.get_Salary_Head_list();
    this.get_salary_expence_drp();
  }
  formatStatus(data: any) {
    return data.IS_INACTIVE ? 'Inactive' : 'Active';
  }


  formatStatusHeadType(data: any): string {
    if (data.HEAD_TYPE == 1) {
      return 'Gross';
    } else if (data.HEAD_TYPE == 2) {
      return 'Deduction';
    } else {
      return 'Unknown';
    }
  }
  

  //==================================== Get list Salary component=============================

  get_Salary_Head_list() {
    this.isLoading = true;
    this.service.get_salary_head_list().subscribe((res: any) => {
      console.log(res);
      this.isLoading = false;
      if (res) {
        // this.dataSource = response.Data;
        const salary_head_res = res.datas;
        // this.filteredHeads = salary_head_res.filter(item => item.HEAD_TYPE === 1 && item.HEAD_TYPE === 2 );
        this.filteredHeads = salary_head_res.filter(
          item => item.HEAD_TYPE === 1 || item.HEAD_TYPE === 2
        );
        
        this.salarySource = this.filteredHeads.map((item: any, index: number) => ({
          ...item,
          SlNo: index + 1,
        }));
        console.log(this.salarySource);
        
      }
    });
  }

  closePopup() {
    this.isAddPopup = false;
    this.formsource.reset();
  }

  Salary_head_popup() {
    this.isAddPopup = true;
    this.formsource.reset();
    this.formsource.reset({
      HEAD_TYPE: null,
      IS_FIXED: null,
      IS_WORKING_DAY: false,
      IS_INACTIVE: false,
    });
    // Reset component-level variables if needed
    this.Head_type_Value = '';  // or any default value like 'Gross' if desired
    this.Sal_Value = '';        // or default as needed
    
    console.log('button clicked');
  }

  OnDescInput(e: any) {
    const Description = e.value;
    this.formsource.get('print_Description')?.setValue(Description);
  }


  //============================Add Salary Head==================================


  Add_Salary_Head() {
    console.log(this.formsource.value);
    const description = this.formsource.value.description;
    const print_Description = this.formsource.value.print_Description;
    const code = this.formsource.value.code;
    const orderSlip = this.formsource.value.HEAD_ORDER;
    const isWorkingday = this.formsource.value.IS_WORKING_DAY;
    const isInactive = this.formsource.value.IS_INACTIVE;
    // const salary_Exp = this.formsource.value.AC_HEAD_ID;
    const salary_Exp = this.formsource.value.AC_HEAD_ID ?? 0;

  
  
    
    //  Validate dropdowns BEFORE assigning values
    if (
      !this.Head_type_Value || this.Head_type_Value === '' ||
      !this.Sal_Value || this.Sal_Value === ''
    ) {
      notify(
        {
          message: 'Please select Head Type and Salary Type',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error'
      );
      this.isAddPopup = true;
      return;
    }
  
    // ✅ Only assign if valid
    let head_type = this.Head_type_Value === 'Gross' ? 1 : 2;
    let is_Fixed = this.Sal_Value === 'Regular Salary'; 
  
    console.log(
      description,
      print_Description,
      orderSlip,
      code,
      isWorkingday,
      isInactive,
      salary_Exp,
      head_type,
      is_Fixed
    );
  
    this.service.get_salary_head_list().subscribe((res: any) => {
      this.list_for_duplication = res.datas;
      console.log(this.list_for_duplication, 'dupli check');
    });
  
    const isDuplicate = this.list_for_duplication?.some((item: any) => {
      if (item.HEAD_TYPE === 1 || item.HEAD_TYPE === 2) {
        return (
          (item.CODE?.trim().toLowerCase() || '') === (code?.trim().toLowerCase() || '') ||
          (item.HEAD_NAME?.trim().toLowerCase() || '') === (description?.trim().toLowerCase() || '') ||
          (item.PRINT_DESCRIPTION?.trim().toLowerCase() || '') === (print_Description?.trim().toLowerCase() || '')
        );
      }
      return false; // Must return something for the `.some()` check
    });
    
       

    if (isDuplicate) {
      console.log('Duplication Checking Triggered');
      notify(
        {
          message: 'Salary Head already exists!',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error'
      );
      return;
    }
  
    // Main form field validation
    if (
      !code ||
      !description ||
      !print_Description ||
      Number(orderSlip) === 0 ||
      isNaN(Number(orderSlip)) 
    ) {
      notify(
        {
          message: 'Please fill all the fields',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error'
      );
      this.isAddPopup = true;
      return;
    } else {
      this.service
        .Add_salary_Head(
          code,
          description,
          print_Description,
          orderSlip,
          isWorkingday,
          isInactive,
          salary_Exp,
          head_type,
          is_Fixed
        )
        .subscribe((res: any) => {
          console.log(res);
  
          notify(
            {
              message: 'Salary Head Added successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success'
          );
          this.isAddPopup = false;
          console.log(this.formsource);
          this.formsource.reset();
          this.formsource.reset({
            HEAD_TYPE: null,
            IS_FIXED: null,
            IS_WORKING_DAY: false,
            IS_INACTIVE: false,
          });
          
          // Reset component-level variables if needed
          this.Head_type_Value = '';  // or any default value like 'Gross' if desired
          this.Sal_Value = '';        // or default as needed
          this.get_Salary_Head_list();
        });
    }
  
    this.get_Salary_Head_list();
  
  
  }
  


  close() {
    console.log('close button is working');
    this.formsource.reset();
    this.formsource.reset({
      IS_WORKING_DAY: false,
      IS_INACTIVE: false, // Set the checkbox back to unchecked
    });
  }

  //=======================================Update Functionality==========================

  Update_Salary_Head() {
    const id = this.id_value;
    const description = this.description_value;
    const print_Description = this.print_description;
    const code = this.code_value;
    const orderSlip = this.head_order_value;
    const isWorkingday = this.is_working_Day_value;
    const isInactive = this.is_inactive_value;
    const salary_Exp = this.selected_salary_EXP??0;
    const head_type = this.Head_type_Value === 'Gross' ? 1 : 2;
    const is_Fixed = this.Sal_Value === 'Regular Salary';
    const is_System=this.is_System
    console.log(
      description,
      print_Description,
      orderSlip,
      code,
      isWorkingday,
      isInactive,
      salary_Exp,
      head_type,
      is_Fixed,
      is_System

    );
    const isDuplicate = this.salarySource?.some((item: any) => {
      if (item.ID === id) return false; // Skip current item (being edited)

      return (
        (item.CODE?.trim().toLowerCase() || '') ===
          (code?.trim().toLowerCase() || '') ||
        (item.HEAD_NAME?.trim().toLowerCase() || '') ===
          (description?.trim().toLowerCase() || '') ||
        (item.PRINT_DESCRIPTION?.trim().toLowerCase() || '') ===
          (print_Description?.trim().toLowerCase() || '')
      );
    });

    if (isDuplicate) {
      console.log('Duplication Checking Triggered');
      notify(
        {
          message: 'Salary Head already exists!',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error'
      );
      return;
    }

    if (
      code === undefined ||
      code === null ||
      code === '' ||
      description === undefined ||
      description === null ||
      description === '' ||
      print_Description === undefined ||
      print_Description === null ||
      print_Description === '' ||
      orderSlip === undefined ||
      orderSlip === 0 ||
      head_type === undefined ||
      is_Fixed === undefined
    ) {
      notify(
        {
          message: 'Please fill all the fields',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error'
      );
      this.isEditPopup = true;
      return; // Stop execution
    } else {
      this.service
        .Update_salary_Head(
          id,
          code,
          description,
          print_Description,
          orderSlip,
          isWorkingday,
          isInactive,
          salary_Exp,
          head_type,
          is_Fixed,
          is_System
        )
        .subscribe((res: any) => {
          console.log(res);
          notify(
            {
              message: 'Salary Head Updated successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success'
          );
          this.isEditPopup = false;
          // or default as needed
          this.get_Salary_Head_list();
        });
    }
  }

  //============================Delete Data ====================
  deleteData(e: any) {
    console.log(e);
        const id = e.data.ID;

        this.service.delete_salary_Head(id).subscribe((res: any) => {
          notify(
            {
              message: 'Salary  Head Deleted successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success'
          );
          this.get_Salary_Head_list();
        
        });
    
        this.isLoading = false;
      // }
    }
    openPopUp() {
      this.isAddPopup = true;
    }

    
    //==========================Edit event===================================
    onEditingStart(e: any) {
      e.cancel = true; // Prevents default editing behavior
      this.edit_Salary_Head = e.data; // Store the selected Salary Head details
      console.log(this.edit_Salary_Head);
      this.isEditPopup = true; // Show the edit popup
      this.isSystem = e.data.IS_SYSTEM; // Save IS_SYSTEM status
      this.selected_item(e);
    }

    //===================================select function============================
    selected_item(e: any) {
      console.log(e, 'event');
      const id = e.data.ID;
      this.service.select_salary_head(id).subscribe((res: any) => {
        console.log(res,'SELECTRESPONSEEE');
        this.selected_Data = res;
        console.log(this.selected_Data);
        this.id_value = this.selected_Data.ID;
        this.code_value = this.selected_Data.CODE;
        this.description_value = this.selected_Data.HEAD_NAME;
        this.print_description = this.selected_Data.PRINT_DESCRIPTION;
        this.head_order_value = this.selected_Data.HEAD_ORDER;
        this.is_inactive_value = this.selected_Data.IS_INACTIVE;
        this.is_working_Day_value = this.selected_Data.IS_WORKING_DAY;
        this.selected_salary_EXP=this.selected_Data.AC_HEAD_ID;
        console.log(this.selected_salary_EXP,'selaary ac head id')                                           
        this.Head_type_Value = this.selected_Data.HEAD_TYPE;    
        this.is_System=this.selected_Data.IS_SYSTEM
        this.Sal_Value = this.selected_Data.IS_FIXED
        console.log(this.Sal_Value); // Now stores true/false

        console.log(
          this.id_value,
          this.code_value,
          this.description_value,
          this.print_description,
          this.salary_Exp_value,
          this.head_order_value,
          this.is_inactive_value,
          this.is_working_Day_value,
          this.Sal_Value,
          this.Head_type_Value
        );

    

        if (this.selected_Data.IS_FIXED === true) {
          this.Sal_Value = 'Regular Salary';
          console.log(this.salarySource, 'salary');
        } else {
          this.Sal_Value = 'Timesheet Entry';
          console.log(this.Sal_Value, 'salary false');
        }

        // this.is_fixed_value = this.selected_Data.IS_FIXED; //  This is a boolean
        // this.Sal_Value = this.is_fixed_value ? 'Regular Salary' : 'Timesheet Entry'; // This sets radio button value
        
        if (this.selected_Data.HEAD_TYPE === 1) {
          this.Head_type_Value = 'Gross';
        } else {
          this.Head_type_Value = 'Deduction';
        }
      });
    }


    //=======================Salary Expense  drop down====================
    
    get_salary_expence_drp() {
      this.service.Dropdown_salary_exp(name).subscribe((res: any) => {
        console.log(res,'=====================================');
        this.AC_HEAD_VALUE = res;
        console.log(this.AC_HEAD_VALUE,'===========================');
        
      });
    }
    onValueChangedSalary(e: any) {
      this.Sal_Value = e.value;
      this.is_fixed_value = e.value === 'Regular Salary'; // Optional: keep a separate boolean
    }
    


    onSalary_ExpChange(event: any) {
      this.selected_salary_EXP = event.value;  

      console.log(this.selected_salary_EXP, 'Selected Item');
    
    
    }

    onCellPrepared(e: any) {
      if (e.rowType === 'data' && e.column.command === 'edit') {
        const is_System = e.data.IS_SYSTEM;
    
        if (is_System) {
          // Disable delete button for system rows
          const deleteButton = e.cellElement.querySelector('.dx-link-delete');
          if (deleteButton) {
            deleteButton.classList.add('dx-state-disabled');
            deleteButton.onclick = (event: Event) => {
              event.preventDefault(); // Prevent delete action
              notify(
                {
                  message: "This salary head is system-defined and cannot be deleted.",
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 1500,
                },
                'warning'
              );
            };
          }
        }
      }
    }
    
    
  refreshData() {
    this.dataGrid.instance.refresh();

  }
  
}
@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    DxFormModule,
    FormTextboxModule,
    DxRadioGroupModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxValidatorModule,
    ReactiveFormsModule,
    
  ],
  providers: [],
  exports: [],
  declarations: [SalaryHeadsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalaryHeadsModule {}
