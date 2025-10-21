import { Component, EventEmitter, Input, NgModule, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DxFormModule } from 'devextreme-angular/ui/form';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxValidatorModule } from 'devextreme-angular/ui/validator';
// import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
// import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DxButtonModule, DxSelectBoxModule, DxValidationGroupComponent, DxValidationGroupModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
// import { EventEmitter } from 'node:stream';

@Component({
  selector: 'app-itemcategory-edit',
  templateUrl: './itemcategory-edit.component.html',
  styleUrls: ['./itemcategory-edit.component.scss']
})
export class ItemcategoryEditComponent {
  @Input() selectedData: any;  
  DepartmentDropdownData: any;
  @Output() popupClosed= new EventEmitter<void>
      @ViewChild('departmentValidationGroup', { static: false })
    validationGroup!: DxValidationGroupComponent;
  formCategoryData = {
    ID:'',
    CODE: '',
    CAT_NAME: '',
    LOYALTY_POINT:0,
    COST_HEAD_ID: '5',
    DEPT_ID: '',
    COMPANY_ID: '1',
  };
    newCategory:any
  category: any=[]

  constructor(private service: DataService) {}

  getNewCategoryData = () => ({ ...this.newCategory });


  
  ngOnChanges(changes: SimpleChanges) {
  if (changes['selectedData'] && changes['selectedData'].currentValue) {
    console.log('Received selectedData:', changes['selectedData'].currentValue);

    // Merge selectedData into formCategoryData
    this.formCategoryData = {
      ...this.formCategoryData, // keep defaults
      ...changes['selectedData'].currentValue, // override with incoming
    };

    // Keep newCategory in sync too (if you need it elsewhere)
    // this.newCategory = { ...this.formCategoryData };
  }
}

  
  showCategory(){
     this.service.getCategoryData().subscribe(
      (response)=>{
            this.category=response;
            console.log(response);
      }
     )
  }
  getDepartmentDropDown() {
    const dropdowndepartment = 'DEPARTMENT';
    this.service.getDropdownData(dropdowndepartment).subscribe((data: any) => {
      this.DepartmentDropdownData = data;
    });
  }
  ngOnInit(): void {
    this.getDepartmentDropDown();
  }

  closePopup(){

  }
  UpdateData(){
    
          const result = this.validationGroup.instance.validate();
  if (!result.isValid) {
    return;
  }
console.log('edit category')
 this.service.getCategoryData().subscribe(
      (response)=>{
            this.category=response;
            console.log(response);

    const payload={
      ...this.formCategoryData
    }

      // Exclude the current record (by ID) from duplicate check
      const isCodeDuplicate = this.category.some(
        (item: any) =>
          item.ID !== payload.ID &&
          item.CODE?.toLowerCase().trim() === payload.CODE?.toLowerCase().trim()
      );
    
      const isDescriptionDuplicate = this.category.some(
        (item: any) =>
          item.ID !== payload.ID &&
          item.CAT_NAME?.toLowerCase().trim() === payload.CAT_NAME?.toLowerCase().trim()
      );
    
      if (isCodeDuplicate && isDescriptionDuplicate) {
        notify(
          {
            message: "Both Code and Category already exist",
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
            message: "This Category already exists",
            position: { at: "top right", my: "top right" },
            displayTime: 1000,
          },
          "error"
        );
        return;
      
      }
    
    this.service.updateCategory(payload).subscribe((res:any)=>{
      console.log(res)
        this.popupClosed.emit()
       notify(
          {
            message: "This Item Category Updated successfully",
            position: { at: "top right", my: "top right" },
            displayTime: 1000,
          },
          "success"
        );
        return;
        
    })
     }
     )

  }
  
}

@NgModule({
  imports: [
    DxTextBoxModule,
    DxFormModule,
    DxValidatorModule,
    DxButtonModule,
    CommonModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
    DxValidationGroupModule

  ],
  declarations: [ItemcategoryEditComponent],
  exports: [ItemcategoryEditComponent],
})
export class ItemcategoryEditModule {}
