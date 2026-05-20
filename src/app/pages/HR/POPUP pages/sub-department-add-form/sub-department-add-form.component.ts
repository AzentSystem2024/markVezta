import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  NgModule,
  OnInit,
  Output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  DxTextBoxModule,
  DxFormModule,
  DxValidatorModule,
  DxSelectBoxModule,
} from 'devextreme-angular';
import { FormTextboxModule, FormPhotoUploaderModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-sub-department-add-form',
  templateUrl: './sub-department-add-form.component.html',
  styleUrls: ['./sub-department-add-form.component.scss'],
})
export class SubDepartmentAddFormComponent implements OnInit {
  @Output() popupClosed = new EventEmitter<void>();

  DepartmentDropdownData: any;
  subDepartment:any;
  formSubDepartmentData = {
    CODE: '',
    DESCRIPTION: '',
    DEPARTMENT_ID: '',
  };
  COMPANY_ID: any;
  newSubDepartment = this.formSubDepartmentData;

  constructor(private service: DataService) {}

  ngOnInit(): void {
    this.getDepartmentDropDown();
    this.show_subdepartment();
  }

  getNewSubDepartmentData = () => ({ ...this.newSubDepartment });

  getDepartmentDropDown() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData')|| '{}');
    this.COMPANY_ID = String(sessionData.SELECTED_COMPANY.COMPANY_ID);
    const dept_payload = {
      NAME: 'DEPT',
      COMPANY_ID: this.COMPANY_ID,
    };

    this.service.getDropdownData(dept_payload).subscribe((data: any) => {
      this.DepartmentDropdownData = data;
      this.popupClosed.emit();
    });
  }

  show_subdepartment() {
    this.service.get_SubDepartment_Data().subscribe((res: any) => {
        this.subDepartment = res.datas;
        console.log(this.subDepartment,"subdepartment")
    });
  }

  validateSubDepartmentCode = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.subDepartment?.length) return true;


    return !this.subDepartment.some((item: any) => {
      const code = (item.CODE || '').trim().toLowerCase();

      return code === value;
    });
  };  

  validateSubDepartmentName = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.subDepartment?.length) return true;


    return !this.subDepartment.some((item: any) => {
      const name = (item.DESCRIPTION || '').trim().toLowerCase();

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
  declarations: [SubDepartmentAddFormComponent],
  exports: [SubDepartmentAddFormComponent],
})
export class SubDepartmentAddFormModule {}
