import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DxButtonModule,
  DxFormModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPhotoUploaderModule, FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-department-me-edit-form',
  templateUrl: './department-me-edit-form.component.html',
  styleUrls: ['./department-me-edit-form.component.scss'],
})
export class DepartmentMeEditFormComponent implements OnChanges {
  @ViewChild('departmentValidationGroup', { static: false })
  validationGroup!: DxValidationGroupComponent;

  @Output() formClosed = new EventEmitter<void>();
  @Input() selectedDepartment: any;

  COMPANY_ID: any;
  COMPANY_NAME: any;
  sessionData: any;
  isEditDepartmentPopupOpened: boolean = false;
  Cost_Bucket_DropDownData: any;

  formDepartmentData = {
    ID: '',
    CODE: '',
    DEPT_NAME: '',
    COMPANY_ID: '',
    COMPANY_NAME: '',
    COST_BUCKET_ID: '',
  };

  editDepartment = this.formDepartmentData;
  department: any = [];

  constructor(private dataservice: DataService) {
    this.sesstion_Details();
    this.getCostBucket_DropDown();
    this.showDepartment();
  }

  getNewDepartmentData = () => ({ ...this.editDepartment });

  showDepartment() {
    const payload = {
      COMPANY_ID: this.COMPANY_ID,
    };

    this.dataservice.get_Department_List(payload).subscribe((response:any) => {
      this.department = response.datas;
      console.log(this.department,"this.department")
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['selectedDepartment'] &&
      changes['selectedDepartment'].currentValue
    ) {
      const data = changes['selectedDepartment'].currentValue;
      this.formDepartmentData = data;
    }
  }

  cancel() {
    this.formClosed.emit();

    this.isEditDepartmentPopupOpened = false;
  }

  getCostBucket_DropDown() {
    this.dataservice
      .getCostBucketDropdownData('COST_BUCKET')
      .subscribe((data: any) => {
        this.Cost_Bucket_DropDownData = data;
      });
  }

  UpdateDepartment() {
    const result = this.validationGroup.instance.validate();
    if (!result.isValid) {
      return;
    }

    this.showDepartment();

    const payload = {
      ID: this.formDepartmentData.ID,
      CODE: this.formDepartmentData.CODE,
      DEPT_NAME: this.formDepartmentData.DEPT_NAME,
      COMPANY_ID: this.COMPANY_ID,
      COST_BUCKET_ID: this.formDepartmentData.COST_BUCKET_ID,
    };

    const code = payload.CODE?.toLowerCase().trim();
    const name = payload.DEPT_NAME?.toLowerCase().trim();

    const isCodeDuplicate = this.department.some(
      (item: any) =>
        item.ID !== payload.ID && item.CODE?.toLowerCase().trim() === code,
    );

    const isDescriptionDuplicate = this.department.some(
      (item: any) =>
        item.ID !== payload.ID && item.DEPT_NAME?.toLowerCase().trim() === name,
    );

    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and Department already exist',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    }

    // if (isCodeDuplicate) {
    //   notify(
    //     {
    //       message: 'This Code already exists',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 1000,
    //     },
    //     'error',
    //   );
    //   return;
    // }

    // if (isDescriptionDuplicate) {
    //   notify(
    //     {
    //       message: 'This Description already exists',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 1000,
    //     },
    //     'error',
    //   );
    //   return;
    // }

    // API Call with response check
    this.dataservice
      .Update_Department_Me_Api(
        payload.ID,
        payload.CODE,
        payload.DEPT_NAME,
        payload.COMPANY_ID,
        payload.COST_BUCKET_ID,
      )
      .subscribe(
        (res: any) => {
          if (res?.flag === '1') {
            // Success case
            this.formClosed.emit();

            notify(
              {
                message: 'Department Updated successfully',
                position: { at: 'top right', my: 'top right' },
                displayTime: 1000,
              },
              'success',
            );
          } else {
            // Failure case
            notify(
              {
                message: res?.message || 'Update failed',
                position: { at: 'top right', my: 'top right' },
                displayTime: 1000,
              },
              'error',
            );
          }
        },
        (error) => {
          // API error handling
          notify(
            {
              message: 'Something went wrong while updating',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1000,
            },
            'error',
          );
        },
      );
  }

  sesstion_Details() {
    this.sessionData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.COMPANY_ID = String(this.sessionData.SELECTED_COMPANY.COMPANY_ID);
    this.COMPANY_NAME = this.sessionData.SELECTED_COMPANY.COMPANY_NAME;
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


  validateDepartmentCode = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.department?.length) return true;

    const currentId = this.formDepartmentData?.ID; //  current editing ID

    return !this.department.some((item: any) => {
      const code = (item.CODE || '').trim().toLowerCase();

      return code === value && item.ID !== currentId; //  ignore same record
    });
};

validateDepartmentName = (e: any): boolean => {
  const value = (e.value || '').trim().toLowerCase();

  if (!value) return true;

  const currentId = this.formDepartmentData.ID;

  return !this.department.some((item: any) => {
    return (
      item.ID !== currentId &&
      (item.DEPT_NAME || '').trim().toLowerCase() === value
    );
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
    DxValidationGroupModule,
    DxButtonModule,
  ],
  declarations: [DepartmentMeEditFormComponent],
  exports: [DepartmentMeEditFormComponent],
})
export class DepartmentMeEditFormModule {}
