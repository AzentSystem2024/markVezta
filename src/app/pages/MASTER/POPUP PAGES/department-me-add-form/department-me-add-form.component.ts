import { Component, NgModule } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxSelectBoxModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-department-me-add-form',
  templateUrl: './department-me-add-form.component.html',
  styleUrls: ['./department-me-add-form.component.scss'],
})
export class DepartmentMeAddFormComponent {
  COMPANY_ID: any;
  sessionData: any;
  COMPANY_NAME: any;
  Cost_Bucket_DropDownData: any;
  department:any;

  formDepartmentData = {
    CODE: '',
    DEPT_NAME: '',
    COST_BUCKET_ID: '',
  };

  newDepartment = this.formDepartmentData;

  constructor(private service: DataService) {
    this.sesstion_Details();
    this.getCostBucket_DropDown();
    this.showDepartment();
  }

  getNewDepartmentData = () => ({ ...this.newDepartment });

  sesstion_Details() {
    this.sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.COMPANY_ID = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.COMPANY_NAME = this.sessionData.SELECTED_COMPANY.COMPANY_NAME;
  }

  showDepartment() {
    const payload = {
      COMPANY_ID: this.COMPANY_ID,
    };
    this.service.get_Department_List(payload).subscribe((response: any) => {
      this.department = response.datas;
    });
  }

  keyPressCode(event: any) {
    const charCode = event.which ? event.which : event.keyCode;

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

  getCostBucket_DropDown() {
    this.service
      .getCostBucketDropdownData('COST_BUCKET')
      .subscribe((data: any) => {
        this.Cost_Bucket_DropDownData = data;
      });
  }

  resetButton() {
    this.formDepartmentData = {
      CODE: '',
      DEPT_NAME: '',
      COST_BUCKET_ID: '',
    };
    this.newDepartment = this.formDepartmentData;
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

  // const currentId = this.formDepartmentData?.ID;

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
    CommonModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
  ],
  declarations: [DepartmentMeAddFormComponent],
  exports: [DepartmentMeAddFormComponent],
})
export class DepartmentMeAddFormModule {}
