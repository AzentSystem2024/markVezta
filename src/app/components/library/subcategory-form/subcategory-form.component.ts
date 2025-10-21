import { Component, NgModule } from '@angular/core';
import { DxFormModule, DxSelectBoxModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { FormPhotoUploaderModule } from '../../utils/form-photo-uploader/form-photo-uploader.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-subcategory-form',
  templateUrl: './subcategory-form.component.html',
  styleUrls: ['./subcategory-form.component.scss']
})
export class SubcategoryFormComponent {
  
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
 public newSubCategory = this.subcategoryData;
  constructor(private dataService : DataService){}


  getNewSubcategoryData = () => ({ ...this.newSubCategory });

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
    FormTextboxModule,
    FormPhotoUploaderModule,
    CommonModule,
    ReactiveFormsModule,
    DxSelectBoxModule
  ],
  declarations:[SubcategoryFormComponent],
  exports: [SubcategoryFormComponent]
})
export class SubCategoryFormModule {}


