import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DxButtonModule, DxFormModule, DxSelectBoxModule, DxTextBoxModule, DxValidationGroupComponent, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPhotoUploaderModule, FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-department-edit',
  templateUrl: './department-edit.component.html',
  styleUrls: ['./department-edit.component.scss']
})
export class DepartmentEditComponent {
  @ViewChild('departmentValidationGroup', { static: false })
validationGroup!: DxValidationGroupComponent;
    @Output() formClosed = new EventEmitter<void>();
   @Input() selectedDepartment: any;
    COMPANY_ID : any;
    COMPANY_NAME:any;
    sessionData:any;
    isEditDepartmentPopupOpened: boolean= false

formDepartmentData = {
    ID:'',
    CODE: '',
    DEPT_NAME: '',
    COMPANY_ID: '',
    COMPANY_NAME:'',
  };
  editDepartment=this.formDepartmentData;

  getNewDepartmentData = () => ({ ...this.editDepartment });
  department: any=[];


  constructor(private dataservice:DataService
        ){
          this.sesstion_Details();
        }
  showDepartment(){
     this.dataservice.getDepartmentData().subscribe(
      (response)=>{
            this.department=response;
            console.log(response,"department");
      }
     )
  }

     ngOnChanges(changes: SimpleChanges): void{
           if (changes['selectedDepartment'] && changes['selectedDepartment'].currentValue) {
      const data = changes['selectedDepartment'].currentValue;
  console.log(data,"dataaaaaaaaaaaaaaaaaaaaaaaaaa")
     this.formDepartmentData=data
     console.log(this.formDepartmentData)

         }   
        }

        cancel(){
          this.formClosed.emit()
          
          this.isEditDepartmentPopupOpened = false
        }

    //     UpdateDepartment(){
    //       const payload ={
    //         ID : this.formDepartmentData.ID ,
    //         CODE : this.formDepartmentData.CODE,
    //         DEPT_NAME : this.formDepartmentData.DEPT_NAME,
    //         COMPANY_ID : "1",
    //         COMPANY_NAME : this.COMPANY_NAME
    //       }
    //       console.log(payload)


    //           // Check for duplicates in CategoryList
    // const isCodeDuplicate = this.department.some(
    //   // (item: any) => item.CODE === commonDetails.code
    //     (item: any) => item.CODE.toLowerCase() ===payload.CODE.toLowerCase()
    // );

    // const isDescriptionDuplicate = this.department.some(
    //   // (item: any) => item.DESCRIPTION === commonDetails.category
    //         (item: any) =>
    // item.DEPT_NAME.toLowerCase() === payload.DEPT_NAME.toLowerCase()
    // );

    

    // if (isCodeDuplicate && isDescriptionDuplicate) {
    //   notify(
    //     {
    //       message: 'Both Code and Department already exist',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 1000,
    //     },
    //     'error'
    //   );
    //   return;
    // } else if (isCodeDuplicate) {
    //   notify(
    //     {
    //       message: 'This Code already exists',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 1000,
    //     },
    //     'error'
    //   );
    //   return;
    // } else if (isDescriptionDuplicate) {
    //   notify(
    //     {
    //       message: 'This Description already exists',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 1000,
    //     },
    //     'error'
    //   );
    //   return;
    // }


    //       this.dataservice.UpdateDepartment(payload).subscribe((res)=>{
    //         console.log(res,'res============')
    //          this.formClosed.emit();
    //           // this.isEditDepartmentPopupOpened = false
    //       })
    //     }

    UpdateDepartment() {
      const result = this.validationGroup.instance.validate();
  if (!result.isValid) {
    return;
  }

      this.showDepartment()
  const payload = {
    ID: this.formDepartmentData.ID,
    CODE: this.formDepartmentData.CODE,
    DEPT_NAME: this.formDepartmentData.DEPT_NAME,
    COMPANY_ID: "1",
    COMPANY_NAME: this.COMPANY_NAME,
  };
  console.log(payload);

  // Exclude the current record (by ID) from duplicate check
  const isCodeDuplicate = this.department.some(
    (item: any) =>
      item.ID !== payload.ID &&
      item.CODE?.toLowerCase().trim() === payload.CODE?.toLowerCase().trim()
  );

  const isDescriptionDuplicate = this.department.some(
    (item: any) =>
      item.ID !== payload.ID &&
      item.DEPT_NAME?.toLowerCase().trim() === payload.DEPT_NAME?.toLowerCase().trim()
  );

  if (isCodeDuplicate && isDescriptionDuplicate) {
    notify(
      {
        message: "Both Code and Department already exist",
        position: { at: "top right", my: "top right" },
        displayTime: 1000,
      },
      "error"
    );
    return;
  } else if (isCodeDuplicate) {
    notify(
      {
        message: "This Code already exists",
        position: { at: "top right", my: "top right" },
        displayTime: 1000,
      },
      "error"
    );
    return;
  } else if (isDescriptionDuplicate) {
    notify(
      {
        message: "This Description already exists",
        position: { at: "top right", my: "top right" },
        displayTime: 1000,
      },
      "error"
    );
    return;
  }

  // Update API call
  this.dataservice.UpdateDepartment(payload).subscribe((res) => {
    console.log(res, "res============");
    this.formClosed.emit();
    // this.isEditDepartmentPopupOpened = false;
     notify(
      {
        message: "Department Updated successfully",
        position: { at: "top right", my: "top right" },
        displayTime: 1000,
      },
      "success"
    );
  });
}

            sesstion_Details(){
     this.sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(this.sessionData,'=================session data==========')

    this.COMPANY_ID=this.sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.COMPANY_ID,'============selected_Company_id==============')

    this.COMPANY_NAME = this.sessionData.SELECTED_COMPANY.COMPANY_NAME
    console.log(this.COMPANY_NAME,'=======selected company name=====')
//       const sessionYear=this.sessionData.FINANCIAL_YEARS
//  this.financialYeaDate=sessionYear[0].DATE_FROM
// console.log(this.financialYeaDate,'=========================date=[[[[[[[[[[[[[[[[[[[[[[[[[[')
// this.formatted_from_date=this.financialYeaDate


// this.selected_vat_id=this.sessionData.VAT_ID

}

  keyPressCode(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
  
    // Allow alphanumeric characters (A-Z, a-z, 0-9)
    if ((charCode >= 65 && charCode <= 90) || // A-Z
        (charCode >= 97 && charCode <= 122) || // a-z
        (charCode >= 48 && charCode <= 57)) { // 0-9
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
  keyPressDepartment(event: any) {
    console.log('key pressed');
    var charCode = (event.which) ? event.which : event.keyCode;
    var inputValue = event.target.value;

  // Disallow white space at the start
    if (inputValue.length === 0 && charCode === 32) {
    event.preventDefault();
    return false;
    }
    // Disallow Numbers 0-9 and Special Characters
    if ((charCode >= 48 && charCode <= 57) || (charCode >= 33 && charCode <= 47) || (charCode >= 58 && charCode <= 64) || (charCode >= 91 && charCode <= 96) || (charCode >= 123 && charCode <= 126)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }



}

@NgModule({
  imports: [
    DxTextBoxModule,
    DxFormModule,
    DxValidatorModule,
    FormTextboxModule,
    FormPhotoUploaderModule,
    CommonModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
    DxValidationGroupModule,
    DxButtonModule,
  ],
  declarations: [DepartmentEditComponent],
  exports: [DepartmentEditComponent],
})
export class DepartmentEditModule {}
