import { CommonModule } from '@angular/common';
import { Component, EventEmitter, NgModule, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DxTextBoxModule, DxFormModule, DxValidatorModule, DxSelectBoxModule } from 'devextreme-angular';
import { FormTextboxModule, FormPhotoUploaderModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-sub-department-add-form',
  templateUrl: './sub-department-add-form.component.html',
  styleUrls: ['./sub-department-add-form.component.scss']
})
export class SubDepartmentAddFormComponent  implements OnInit {
    @Output() popupClosed = new EventEmitter<void>();
  
    DepartmentDropdownData: any;
    formCategoryData = {
      CODE: '',
      CAT_NAME: '',
      LOYALTY_POINT: 0,
      COST_HEAD_ID: 0,
      DEPT_ID: '',
      COMPANY_ID: '',
    };
    COMPANY_ID: string;
    newCategory = this.formCategoryData;
    
    constructor(private service: DataService) {}
  
    ngOnInit(): void {
      this.session_Details();
      this.getDepartmentDropDown();
    }
  
    getNewCategoryData = () => ({ ...this.newCategory });
  
    session_Details() {
      const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
      this.COMPANY_ID = String(sessionData.SELECTED_COMPANY.COMPANY_ID);
    }
  
    getDepartmentDropDown() {
      const dropdowndepartment = 'DEPARTMENT';
      const payload = {
        NAME: dropdowndepartment,
        COMPANY_ID: this.COMPANY_ID,
      };
  
      this.service.getDropdownData(payload).subscribe((data: any) => {
        this.DepartmentDropdownData = data;
        this.popupClosed.emit();
      });
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
    declarations: [SubDepartmentAddFormComponent],
    exports: [SubDepartmentAddFormComponent],
  })
  export class SubDepartmentAddFormModule {}