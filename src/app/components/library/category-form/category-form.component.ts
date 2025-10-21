import { Component, EventEmitter, NgModule, OnInit, Output } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxSelectBoxModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';
// import { EventEmitter } from 'node:stream';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
})
export class CategoryFormComponent implements OnInit {
    @Output() popupClosed = new EventEmitter<void>();

  DepartmentDropdownData: any;
  formCategoryData = {
  CODE: '',
  CAT_NAME: '',
  LOYALTY_POINT: 0,
  COST_HEAD_ID: '5',
  DEPT_ID: '',
  COMPANY_ID: '1',
  };
  constructor(private service: DataService) {}
  newCategory = this.formCategoryData;

  getNewCategoryData = () => ({ ...this.newCategory });

  getDepartmentDropDown() {
    const dropdowndepartment = 'DEPARTMENT';
    this.service.getDropdownData(dropdowndepartment).subscribe((data: any) => {
      this.DepartmentDropdownData = data;
      this.popupClosed.emit()
    });
  }
  ngOnInit(): void {
    this.getDepartmentDropDown();
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
    declarations: [CategoryFormComponent],
    exports: [CategoryFormComponent],
  })
  export class CategoryFormModule {}
