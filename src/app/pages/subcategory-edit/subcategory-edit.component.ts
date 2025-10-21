// import { Component } from '@angular/core';
import { Component, EventEmitter, Input, NgModule, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DxButtonModule, DxFormModule, DxSelectBoxModule, DxTextBoxModule, DxValidationGroupComponent, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';
// import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
// import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-subcategory-edit',
  templateUrl: './subcategory-edit.component.html',
  styleUrls: ['./subcategory-edit.component.scss']
})
export class SubcategoryEditComponent {
  @Input() selectedData: any;  
  @Output() popupClosed= new EventEmitter <void>
    @ViewChild('departmentValidationGroup', { static: false })
  validationGroup!: DxValidationGroupComponent;
  departmetDropdownData : any;
  subcategoryData = 
  {
 CODE: "",
 SUBCAT_NAME: "",
 CAT_ID: "",
 DEPT_ID:0,
 DEPT_NAME:'',
 CAT_NAME:'',
 
 }

   categories:any = []
  //  newSubCategory:any
  newSubCategory:any 
  subCategory: any=[]
  constructor(private dataService : DataService){}




    ngOnChanges(changes: SimpleChanges) {
      if (changes['selectedData'] && changes['selectedData'].currentValue) {
        console.log('Received selectedData:', changes['selectedData'].currentValue);
        this.newSubCategory = {
          ...this.selectedData,
          ...changes['selectedData'].currentValue,
        };


    }
  }
  // getNewSubcategoryData = () => ({ ...this.newSubCategory });

  ngOnInit(){
    this.getDepartmentDropDown();
    this.getCategoryDropDown();
    this.getDepartmentData();
  }

  // getCategoryDropdown(){
   
  //   this.dataService.getCategoryData().subscribe((response:any) => {
  //     this.categories = response
  //     console.log(response,"categories------------------------")
  //   })
  // }
    
  closePopup(){
    this.popupClosed.emit()
  }
    getSubCategory(){
    this.dataService.getSubCategoryData().subscribe((response)=>
    {
      this.subCategory = response;
      console.log(response,"subcategoryyyyyyyyyyyyyyy")
    }
    )
  }

  UpdateData(){
          const result = this.validationGroup.instance.validate();
  if (!result.isValid) {
    return;
  }
  this.dataService.getSubCategoryData().subscribe((response)=>
    {
      this.subCategory = response;
      console.log(response,"subcategoryyyyyyyyyyyyyyy")
 
    console.log(this.newSubCategory,'====================================')
const payload={
  ...this.newSubCategory,
   CODE: this.newSubCategory.CODE?.toLowerCase().trim(),
    SUBCAT_NAME: this.newSubCategory.SUBCAT_NAME?.toLowerCase().trim()
}
  const isCodeDuplicate = this.subCategory.some(
    (item: any) =>
      item.ID !== payload.ID &&
      item.CODE?.toLowerCase().trim() === payload.CODE?.toLowerCase().trim()
  );

  const isDescriptionDuplicate = this.subCategory.some(
    (item: any) =>
      item.ID !== payload.ID &&
  item.SUBCAT_NAME.toLowerCase() === payload.SUBCAT_NAME.toLowerCase()
  );

  if (isCodeDuplicate && isDescriptionDuplicate) {
    notify(
      {
        message: "Both Code and Subcategory already exist",
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
        message: "This Subcategory already exists",
        position: { at: "top right", my: "top right" },
        displayTime: 1000,
      },
      "error"
    );
    return;
  }

this.dataService.Update_subcategory_api(payload).subscribe((res:any)=>{
  console.log(res)
  this.popupClosed.emit()
   notify({
          message : " update operation successfull",
          position: { at: 'top right', my: 'top right' },
        },
        'success'
      );
})
    })
  }
  getCategoryDropDown() {
    const dropdownCategory = 'ITEMCATEGORY';
    this.dataService
      .getDropdownData(dropdownCategory)
      .subscribe((data: any) => {
        // this.categoryList = data;  
        console.log(data,"}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}")
        this.categories=data
        // this.refresh(); 
      });
  }


  getDepartmentDropDown() {
    const dropdowndepartment = 'DEPARTMENT';
    this.dataService  
      .getDropdownData(dropdowndepartment)
      .subscribe((data: any) => {
        this.departmetDropdownData = data;
        console.log('dropdownnnnnnn',this.departmetDropdownData);
      });
  }

  getDepartmentData(){
    let departmentdata =[]
    this.dataService.getDepartmentData().subscribe((data:any)=> {
      departmentdata = data;
      console.log('depttttttttt',data);
      let departmentNames = departmentdata.map(department=>{
        return {
          ID : department.ID,
          DESCRIPTION: department.DEPT_NAME
        }
      }
      );
      console.log(departmentNames,"namessssssssssssssssssssssssssssssss")
      })
  }
}



@NgModule({
  imports: [
    DxTextBoxModule,
    DxFormModule,
    DxValidatorModule,
    CommonModule,
    ReactiveFormsModule,
    DxSelectBoxModule,
    DxButtonModule,
    DxValidationGroupModule
  ],
  declarations:[SubcategoryEditComponent],
  exports: [SubcategoryEditComponent]
})
export class SubcategoryEditModule {}


