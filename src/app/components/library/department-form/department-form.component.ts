import { Component, NgModule } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxSelectBoxModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-department-form',
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.scss'],
})
export class DepartmentFormComponent {
  COMPANY_ID: any;
  sessionData: any;
  COMPANY_NAME: any;
  department:any;

  constructor(private service:DataService) {
    this.sesstion_Details();
    this.showItemDepartment();
  }

  formDepartmentData = {
    ID: '',
    CODE: '',
    DEPT_NAME: '',
    COMPANY_ID: '',
    COMPANY_NAME: '',
  };
  newDepartment = this.formDepartmentData;

  getNewDepartmentData = () => ({ ...this.newDepartment });

  sesstion_Details() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.COMPANY_ID = this.sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.COMPANY_NAME = this.sessionData.SELECTED_COMPANY.COMPANY_NAME;
    //       const sessionYear=this.sessionData.FINANCIAL_YEARS
    //  this.financialYeaDate=sessionYear[0].DATE_FROM
    // this.formatted_from_date=this.financialYeaDate

    // this.selected_vat_id=this.sessionData.VAT_ID
  }

  keyPressCode(event: any) {
    const charCode = event.which ? event.which : event.keyCode;

    // Allow alphanumeric characters (A-Z, a-z, 0-9)
    if (
      (charCode >= 65 && charCode <= 90) || // A-Z
      (charCode >= 97 && charCode <= 122) || // a-z
      (charCode >= 48 && charCode <= 57)
    ) {
      // 0-9
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }
  keyPressDepartment(event: any) {
    var charCode = event.which ? event.which : event.keyCode;
    var inputValue = event.target.value;

    // Disallow white space at the start
    if (inputValue.length === 0 && charCode === 32) {
      event.preventDefault();
      return false;
    }
    // Disallow Numbers 0-9 and Special Characters
    if (
      (charCode >= 48 && charCode <= 57) ||
      (charCode >= 33 && charCode <= 47) ||
      (charCode >= 58 && charCode <= 64) ||
      (charCode >= 91 && charCode <= 96) ||
      (charCode >= 123 && charCode <= 126)
    ) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }
  resetButton() {
    this.formDepartmentData = {
      ID: '',
      CODE: '',
      DEPT_NAME: '',
      COMPANY_ID: '',
      COMPANY_NAME: '',
    };
    this.newDepartment = this.formDepartmentData;
  }

  showItemDepartment() {
    const payload = {
      COMPANY_ID: this.COMPANY_ID,
    };

    this.service.getDepartmentData(payload).subscribe((response) => {
      this.department = response;
    });
  }

  validateDepartmentCode = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.department?.length) return true;


    return !this.department.some((item: any) => {
      const code = (item.CODE || '').trim().toLowerCase();

      return code === value;
    });
  };  

  validateDepartmentName = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.department?.length) return true;


    return !this.department.some((item: any) => {
      const name = (item.DEPT_NAME || '').trim().toLowerCase();

      return name === value;
    });
  };  

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
