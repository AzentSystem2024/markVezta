import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxFormModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxToolbarModule,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-advance-types',
  templateUrl: './advance-types.component.html',
  styleUrls: ['./advance-types.component.scss'],
})
export class AdvanceTypesComponent {
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  formsource!: FormGroup;

  isLoading: boolean = true;
  isEditPopup: boolean = false;
  AdvaceSource: any;
  showFilterRow: any;
  showHeaderFilter: any;
  isAddPopup: boolean = false;
  filteredHeads: any = {};
  AC_HEAD_VALUE: any;
  AC_HEAD_ID: any;
  selected_Data: any;
  id_value: any;
  code_value: any;
  description_value: any;
  print_description: any;
  is_inactive_value: any;
  selected_Account_Lr: any;
  salary_head_res: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  constructor(private service: DataService, private fb: FormBuilder) {
    this.formsource = this.fb.group({
      Id: [null],
      code: ['', [Validators.required]],
      description: ['', [Validators.required]],
      print_Description: ['', [Validators.required]],
      IS_INACTIVE: [false, [Validators.required]],
      AC_HEAD_ID: ['', [Validators.required]],
      HEAD_TYPE: ['', [Validators.required]],
    });
    this.List_Advance_Types();
    this.get_salary_expence_drp();
  }
  formatStatus(data: any) {
    return data.IS_INACTIVE ? 'Inactive' : 'Active';
  }
  closeButton(){
    console.log('==========close button clicked=========');
    
    this.isAddPopup=false
    this.formsource.reset()
    this.formsource.reset({
      IS_INACTIVE: false, // Set the checkbox back to unchecked
    });
  }
  close() {
    this.isAddPopup=false
    this.isEditPopup=false
    this.formsource.reset()
    this.formsource.reset({
      IS_INACTIVE: false, // Set the checkbox back to unchecked
    });

  }

  onEditingStart(event: any) {
    event.cancel = true;
    this.isEditPopup = true;
    this.selected_item(event);
  }

  Advance_types_add_pop() {
    this.isAddPopup = true; 

    console.log('button clicked');
  }
  refreshData() {
    this.dataGrid.instance.refresh();
  }

  // ============================list Advance Type===========================
  List_Advance_Types() {
    this.service.get_Advance_type_list().subscribe((res: any) => {
     this.salary_head_res = res.datas;
      console.log(res);
      
      this.filteredHeads =this.salary_head_res.filter(
        (item) => item.HEAD_TYPE === 3
      );
      this.AdvaceSource = this.filteredHeads.map(
        (data: any, index: number) => ({
          ...data,
          SlNo: index + 1,
        })
      );

      this.isLoading = false;
    });
  }

  get_salary_expence_drp() {
    this.service.Dropdown_salary_exp(name).subscribe((res: any) => {
      console.log(res, '=====================================');
      this.AC_HEAD_VALUE = res;
      console.log(this.AC_HEAD_VALUE, '===========================');
    });
  }
  
  OnDescInput(e: any) {
    const Description = e.value;
    this.formsource.get('print_Description')?.setValue(Description);
  }

  // ======================================Add Advance types====================

  Add_Advance_Types() {
    const description = this.formsource.value.description;
    const print_Description = this.formsource.value.print_Description;
    const code = this.formsource.value.code;
    const isInactive = this.formsource.value.IS_INACTIVE;
    const salary_Exp = this.formsource.value.AC_HEAD_ID;

    console.log(this.formsource);
    console.log(description, print_Description, code, isInactive, salary_Exp);
    const normalizedCode = (code || '').trim().toLowerCase();
    const normalizedDesc = (description || '').trim().toLowerCase();
    const normalizedPrintDesc = (print_Description || '').trim().toLowerCase();
    
    const duplicateItem = this.salary_head_res?.find((item: any) => item.HEAD_TYPE == 3 && (
      (item.CODE?.trim().toLowerCase() === normalizedCode) ||
      (item.HEAD_NAME?.trim().toLowerCase() === normalizedDesc) ||
      (item.PRINT_DESCRIPTION?.trim().toLowerCase() === normalizedPrintDesc)
    ));
    
    if (duplicateItem) {
      let duplicateFields = [];
    
      if (duplicateItem.CODE?.trim().toLowerCase() === normalizedCode) {
        duplicateFields.push('Code');
      }
      if (duplicateItem.HEAD_NAME?.trim().toLowerCase() === normalizedDesc) {
        duplicateFields.push('Description');
      }
      if (duplicateItem.PRINT_DESCRIPTION?.trim().toLowerCase() === normalizedPrintDesc) {
        duplicateFields.push('Print Description');
      }
    
      notify(
        {
          message: `Duplicate found in: ${duplicateFields.join(', ')}`,
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'error'
      );
    
    
      this.isAddPopup = true;
    }else{

    
    this.service.Api_Add_Advance_types(code,
      description,
      print_Description,
      isInactive,
      salary_Exp,
    ).subscribe((res:any)=>{
      console.log(res);
         notify(
                  {
                    message: 'Advance Types Added successfully',
                    position: { at: 'top right', my: 'top right' },
                    displayTime: 500,
                  },
                  'success'
                );
                this.isAddPopup = false;
                console.log(this.formsource);
                this.formsource.reset();
                this.formsource.reset({
                  IS_INACTIVE: false,
                });
      this.List_Advance_Types();
      
      
    })
  } 
  }

  //=======================================select function for edit===============================

  selected_item(event: any) {
    console.log(event, 'event');
    const id = event.data.ID;
    this.service.select_advance_types(id).subscribe((res: any) => {
      console.log(res);
      this.selected_Data = res;
      console.log(this.selected_Data);
      this.id_value = this.selected_Data.ID;
      this.code_value = this.selected_Data.CODE;
      this.description_value = this.selected_Data.HEAD_NAME;
      this.print_description = this.selected_Data.PRINT_DESCRIPTION;
      this.is_inactive_value = this.selected_Data.IS_INACTIVE;
       this.selected_Account_Lr=this.selected_Data.AC_HEAD_ID;
      console.log(this.selected_Account_Lr,'selaary ac head id')                                              
      console.log(
        this.id_value,
        this.code_value,
        this.description_value,
        this.print_description,
        this.is_inactive_value,
        this.selected_Account_Lr
    
      );
    });
  }

  //=============================value BInding of dropdown=============================

  onSalary_ExpChange(event: any) {
    this.selected_Account_Lr = event.value;  

    console.log(this.selected_Account_Lr, 'Selected Item');
  
  
  }

  //============================================Update Advacnce Types========================================
Update_advance_types(){
  const id = this.id_value;
  const description = this.description_value;
  const print_Description = this.print_description;
  const code = this.code_value;
  const isInactive = this.is_inactive_value;
  const salary_Exp = this.selected_Account_Lr;

  const isDuplicate = this.salary_head_res?.some((item: any) => {
    if (item.ID === id) return false;
    return (
      item.HEAD_TYPE == 3 &&
      (
        (item.CODE?.trim().toLowerCase() || '') === (code?.trim().toLowerCase() || '') ||
        (item.HEAD_NAME?.trim().toLowerCase() || '') === (description?.trim().toLowerCase() || '') ||
        (item.PRINT_DESCRIPTION?.trim().toLowerCase() || '') === (print_Description?.trim().toLowerCase() || '')
      )
    );
  });
  
  if (isDuplicate) {
    console.log('Duplication Checking Triggered');
    notify(
      {
        message: 'Advance Types already exists!',
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
    !salary_Exp || salary_Exp === '' || salary_Exp === null
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
  }else{
  this.service.Api_Update_Advance_types(    
    id,
    code,
    description,
    print_Description,
    isInactive,
    salary_Exp).subscribe((res:any)=>{
      console.log(res);
      this.List_Advance_Types();
     notify(
                {
                  message: 'Advance types Updated successfully',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success'
              );
              this.isEditPopup = false;
    })

  }
}
//=======================================Delete Data================================
deleteData(e:any){
  console.log(e);
  const id = e.data.ID
  console.log(id);

  this.service.delete_Advance_types(id).subscribe((res:any)=>{
    notify(
      {
        message: ' Advance Types Deleted successfully',
        position: { at: 'top right', my: 'top right' },
        displayTime: 500,
      },
      'success'
    );
    this.List_Advance_Types()
  })
  

}
  }


@NgModule({
  imports: [
    DxDataGridModule,
    DxToolbarModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    DxFormModule,
    DxTextBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
  ],
  providers: [],
  exports: [],
  declarations: [AdvanceTypesComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdvanceTypesModule {}
