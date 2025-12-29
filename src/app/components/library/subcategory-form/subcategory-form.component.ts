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
  selected_Company_id: any;
  constructor(private dataService : DataService){}


  getNewSubcategoryData = () => ({ ...this.newSubCategory });

   sesstion_Details(){
    const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData,'=================session data==========')
    this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id,'============selected_Company_id==============')    
  }

  ngOnInit(){
    this.sesstion_Details();
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
    const payload = {
      COMPANY_ID : this.selected_Company_id,
      NAME : dropdownCategory
    }
    this.dataService
      .getDropdownData(payload)
      .subscribe((data: any) => {
        // this.categoryList = data;  
        console.log(data,"}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}")
        this.categories=data
        // this.refresh(); 
      });
  }


  getDepartmentDropDown() {
    const dropdowndepartment = 'DEPARTMENT';
    const payload = {
      COMPANY_ID : this.selected_Company_id,
      NAME : dropdowndepartment
    }
    this.dataService  
      .getDropdownData(payload)
      .subscribe((data: any) => {
        this.departmetDropdownData = data;
        console.log('dropdownnnnnnn',this.departmetDropdownData);
      });
  }

  getDepartmentData(){
    let departmentdata =[]
    const payload ={
      COMPANY_ID : this.selected_Company_id
    }
    this.dataService.getDepartmentData(payload).subscribe((data:any)=> {
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


