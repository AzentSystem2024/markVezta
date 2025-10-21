import { Component,NgModule } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxSelectBoxModule } from 'devextreme-angular';

@Component({
  selector: 'app-department-form',
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.scss']
})
export class DepartmentFormComponent {
COMPANY_ID : any;
    sessionData: any;
    COMPANY_NAME:any;

      constructor(
        ){
          this.sesstion_Details();
        }

  formDepartmentData = {
    ID:'',
    CODE: '',
    DEPT_NAME: '',
    COMPANY_ID: "1",
   COMPANY_NAME:''
  };
  newDepartment=this.formDepartmentData;

  getNewDepartmentData = () => ({ ...this.newDepartment });

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
  resetButton(){
    this.formDepartmentData={
      ID:'',
    CODE: '',
    DEPT_NAME: '',
    COMPANY_ID: "1",
   COMPANY_NAME:''

    }
     this.newDepartment = this.formDepartmentData;
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
    
  ],
  declarations: [DepartmentFormComponent],
  exports: [DepartmentFormComponent],
})
export class DepartmentFormModule {}
