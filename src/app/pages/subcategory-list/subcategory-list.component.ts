import { Component, NgModule, ViewChild } from '@angular/core';
import { DxButtonModule, DxDataGridComponent, DxDataGridModule, DxPopupModule } from 'devextreme-angular';
import {  SubCategoryFormModule, SubcategoryFormComponent } from 'src/app/components/library/subcategory-form/subcategory-form.component';
import { DataService } from 'src/app/services';
import { DepartmentListComponent } from '../department-list/department-list.component';
import { FormPopupModule } from 'src/app/components';
import { CategoryFormModule } from 'src/app/components/library/category-form/category-form.component';
import notify from 'devextreme/ui/notify';
import { CategoryListComponent } from '../category-list/category-list.component';
import { DxSelectBoxModule } from 'devextreme-angular';
import { SubcategoryEditModule } from '../subcategory-edit/subcategory-edit.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subcategory-list',
  templateUrl: './subcategory-list.component.html',
  styleUrls: ['./subcategory-list.component.scss']
})
export class SubcategoryListComponent {

  
  @ViewChild(SubcategoryFormComponent) subcategorycomponent: SubcategoryFormComponent;
  @ViewChild(DxDataGridComponent, {static : true}) dataGrid:DxDataGridComponent;
  @ViewChild(DepartmentListComponent) departmentComponent : DepartmentListComponent;
  @ViewChild(CategoryListComponent) categoryComponent : CategoryListComponent
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  subCategory: any=[];
  departmentDropdownData : any;
  isAddSubcategoryPopupOpened : boolean = false;
  categoryList: any[] = [];
  selectedType: string = '';
  selected_data: any=[]
editSubcategory:boolean=false
  constructor(private dataService : DataService){}

  ngOnInit(){
    this.getSubCategory();
    this.getDepartmentDropDown();
    this.getCategoryDropdown();
    this.getCategoryDropDown()
    // this.getDropdownOptions();
  }

  addSubCategory(){
    this.isAddSubcategoryPopupOpened=true;
  }

  getSubCategory(){
    this.dataService.getSubCategoryData().subscribe((response)=>
    {
      this.subCategory = response;
      console.log(response,"subcategoryyyyyyyyyyyyyyy")
    }
    )
  }

  getDepartmentDropDown() {
    const dropdowndepartment = 'DEPARTMENT';
    this.dataService
      .getDropdownData(dropdowndepartment)
      .subscribe((data: any) => {
        this.departmentDropdownData = data;
        this.refresh(); 
      });
  }
  
  getCategoryDropDown() {
    const dropdownCategory = 'CATEGORY';
    this.dataService 
      .getDropdownData(dropdownCategory)
      .subscribe((data: any) => {
        // this.categoryList = data;
        console.log(data,"}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}")
        this.refresh(); 
      });
  }

  onClickSaveSubCategory(){
    const { CODE, SUBCAT_NAME, DEPT_ID,CAT_ID} =  this.subcategorycomponent.getNewSubcategoryData()


 // Check for duplicates in CategoryList
    const isCodeDuplicate = this.subCategory.some(
      // (item: any) => item.CODE === commonDetails.code
        (item: any) => item.CODE.toLowerCase() ===CODE.toLowerCase()
    );

    const isDescriptionDuplicate = this.subCategory.some(
      // (item: any) => item.DESCRIPTION === commonDetails.category
            (item: any) =>
    item.SUBCAT_NAME.toLowerCase() === SUBCAT_NAME.toLowerCase()
    );

    

    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and Subcategory already exist',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    } else if (isCodeDuplicate) {
      notify(
        {
          message: 'This Code already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    } else if (isDescriptionDuplicate) {
      notify(
        {
          message: 'This Subcategory already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    }



    this.dataService.postSubCategoryData(CODE,SUBCAT_NAME,DEPT_ID,CAT_ID).subscribe((response)=>{
      console.log(response,"}}}}}}}}}}}}}}}}}}]]]]]]]]")
      this.getSubCategory()
      this.isAddSubcategoryPopupOpened=false
            notify(
        {
          message: ' Subcategory insert operation successfull',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
    })
  }

  refresh = () => {
    this.dataGrid.instance.refresh();
    this.getSubCategory()
  };
  onRowUpdating(event){
    const updatedData = {...event.oldData,...event.newData};
    const { ID, CODE, SUBCAT_NAME,CAT_ID,DEPT_ID} = updatedData;
    this.dataService.updateSubCategory(ID, CODE, SUBCAT_NAME,CAT_ID,DEPT_ID).subscribe(()=> {
      
      this.dataGrid.instance.refresh()})
  }
onEditSubcategory(event:any){
  console.log(event)
  event.cancel=true
  const id=event.data.ID
  this.editSubcategory=true
  this.dataService.select_subcategory(id).subscribe((res:any)=>{
  console.log(res)
    this.selected_data=res
  })
}
  onRowRemoving(event){
    const { ID, SUBCAT_NAME,CAT_ID,DEPT_ID} = event.data;
    this.dataService.removeSubCategory(ID,SUBCAT_NAME,CAT_ID,DEPT_ID).subscribe(() => {
      try {
        notify({
          message : " Delete operation successfull",
          position: { at: 'top right', my: 'top right' },
        },
        'success'
      );
      this.dataGrid.instance.refresh();
      this.getSubCategory();
      } catch (error){
        notify({
          message : "Delete operation failed",
          position : {at: 'top right',my: 'top right'}
        },
        'error'
      )
        
      }
    })


  }
    handleClose(){
      this.isAddSubcategoryPopupOpened=false
      this.editSubcategory=false
      this.getSubCategory()
      
    }
  getCategoryDropdown(){
    // let categories = []
    this.dataService.getCategoryData().subscribe((response:any) => {   
      console.log(response,"categories!!!!!!!!!!!!!!!!!!!!!!!!!!!!??????")
    })
  }
}



@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,SubCategoryFormModule,DxSelectBoxModule,SubcategoryEditModule,CommonModule,DxPopupModule
  ],
  providers:[],
  exports:[],
  declarations:[SubcategoryListComponent]
})
export class SubCategoryListModule {}