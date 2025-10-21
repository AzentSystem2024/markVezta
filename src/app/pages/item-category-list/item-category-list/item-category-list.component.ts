import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxFormModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxToolbarModule,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { CategoryFormComponent, CategoryFormModule } from 'src/app/components/library/category-form/category-form.component';
import { ExportService } from 'src/app/services/export.service';
import { ItemcategoryEditModule } from 'src/app/pages/itemcategory-edit/itemcategory-edit.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-item-category-list',
  templateUrl: './item-category-list.component.html',
  styleUrls: ['./item-category-list.component.scss']
})
export class ItemCategoryListComponent {
  @ViewChild(CategoryFormComponent) categoryComponent: CategoryFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;

   readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  category:any;
  DepartmentDropdownData:any;
  isAddCategoryPopupOpened=false;
  showFilterRow=true;
  showHeaderFilter=true;
  editItemCategory:boolean=false
  selectedData:any
  selected_data:any
  constructor(private dataservice:DataService,private exportService: ExportService
    ){}
  onExporting(event: any) {
    this.exportService.onExporting(event,'Catagory-list');
  }
  addCategory(){
    this.isAddCategoryPopupOpened=true;
  }
  onEditStart(event:any){
    event.cancel=true
this.editItemCategory=true
  const id=event.data.ID

  this.dataservice.select_category(id).subscribe((res:any)=>{
  console.log(res)
    this.selected_data=res
  })
  }
  
  onClickSaveCategory(){
    const { CODE, CAT_NAME,LOYALTY_POINT,COST_HEAD_ID,DEPT_ID,COMPANY_ID } =this.categoryComponent.getNewCategoryData();
    console.log('inserted data',CODE,CAT_NAME,LOYALTY_POINT,COST_HEAD_ID,DEPT_ID,COMPANY_ID );

 // Check for duplicates in CategoryList
    const isCodeDuplicate = this.category.some(
      // (item: any) => item.CODE === commonDetails.code
        (item: any) => item.CODE.toLowerCase() ===CODE.toLowerCase()
    );

    const isDescriptionDuplicate = this.category.some(
      // (item: any) => item.DESCRIPTION === commonDetails.category
            (item: any) =>
    item.CAT_NAME.toLowerCase() === CAT_NAME.toLowerCase()
    );

    

    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and category already exist',
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
          message: 'This Description already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    }


    
    this.dataservice.postCategoryData(CODE,CAT_NAME,LOYALTY_POINT,COST_HEAD_ID,DEPT_ID,COMPANY_ID).subscribe(
      (response)=>{
        if(response){

          this.showCategory();
          this.isAddCategoryPopupOpened=false
             notify(
                    {
                      message: "This Item Category inserted successfully",
                      position: { at: "top right", my: "top right" },
                      displayTime: 1000,
                    },
                    "success"
                  );
                  return;
        }
      }
    )

  }
  
  onRowRemoving(event) {
    const selectedRow = event.data;
    const { ID, CODE, CAT_NAME,LOYALTY_POINT,COST_HEAD_ID,DEPT_ID,COMPANY_ID } = selectedRow;
    
    this.dataservice.removeCategory(ID, CODE, CAT_NAME,LOYALTY_POINT,COST_HEAD_ID,DEPT_ID,COMPANY_ID ).subscribe(() => {
      try {
        // Your delete logic here
        notify(
          {
            message: 'Delete operation successful',
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        );
        this.dataGrid.instance.refresh();
        this.showCategory();
      } catch (error) {
        notify(
          {
            message: 'Delete operation failed',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      }
    });
  }

  showCategory(){
     this.dataservice.getCategoryData().subscribe(
      (response)=>{
            this.category=response;
            console.log(response);
      }
     )
  }
  getDepartmentDropDown() {
    const dropdowndepartment = 'DEPARTMENT';
    this.dataservice
      .getDropdownData(dropdowndepartment)
      .subscribe((data: any) => {
        this.DepartmentDropdownData = data;
        console.log('dropdown',this.DepartmentDropdownData);
      });
  }
  ngOnInit(): void {
    this.showCategory();
    this.getDepartmentDropDown();
  }
  refresh = () => {
    this.dataGrid.instance.refresh();
       this.showCategory();

  };
  handleClose(){
    this.isAddCategoryPopupOpened=false
    this.editItemCategory=false
    this.showCategory()

  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxToolbarModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    DxFormModule,
    DxTextBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    CategoryFormModule,
    ItemcategoryEditModule,
    CommonModule
  ],
  providers: [],
  exports: [ItemCategoryListComponent],
  declarations: [ItemCategoryListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ItemCategoryModule {}
