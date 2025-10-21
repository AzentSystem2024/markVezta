import { Component,OnInit,NgModule,ViewChild } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { CategoryFormComponent, CategoryFormModule } from 'src/app/components/library/category-form/category-form.component';
import notify from 'devextreme/ui/notify';
import { ExportService } from 'src/app/services/export.service';


@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  
  @ViewChild(CategoryFormComponent) categoryComponent: CategoryFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
  category:any;
  DepartmentDropdownData:any;
  isAddCategoryPopupOpened=false;
  showFilterRow=true;
  showHeaderFilter=true;c
  constructor(private dataservice:DataService,private exportService: ExportService
    ){}
  onExporting(event: any) {
    this.exportService.onExporting(event,'Catagory-list');
  }
  addCategory(){
    this.isAddCategoryPopupOpened=true;
  }
  
  onClickSaveCategory(){
    const { CODE, CAT_NAME,LOYALTY_POINT,COST_HEAD_ID,DEPT_ID,COMPANY_ID } =this.categoryComponent.getNewCategoryData();
    console.log('inserted data',CODE,CAT_NAME,LOYALTY_POINT,COST_HEAD_ID,DEPT_ID,COMPANY_ID );
    this.dataservice.postCategoryData(CODE,CAT_NAME,LOYALTY_POINT,COST_HEAD_ID,DEPT_ID,COMPANY_ID).subscribe(
      (response)=>{
        if(response){
          this.showCategory();
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
  onRowUpdating(event) {
    const updataDate = event.newData;
    const oldData = event.oldData;
    const combinedData = { ...oldData, ...updataDate };
    let id = combinedData.ID;
    let code = combinedData.CODE;
    let catname = combinedData.CAT_NAME;
    let loyaltypoint = combinedData.LOYALTY_POINT;
    let cost_head_id=combinedData.COST_HEAD_ID;
    let dept_id=combinedData.DEPT_ID;
    let company_id = combinedData.COMPANY_ID;
   

    this.dataservice
      // .updateCategory(id, code, catname,loyaltypoint,cost_head_id,dept_id,company_id)
      // .subscribe((data: any) => {
      //   if (data) {
      //     notify(
      //       {
      //         message: 'Item Category updated Successfully',
      //         position: { at: 'top center', my: 'top center' },
      //       },
      //       'success'
      //     );
      //     this.dataGrid.instance.refresh();
      //     this.showCategory();
      //   } else {
      //     notify(
      //       {
      //         message: 'Your Data Not Saved',
      //         position: { at: 'top right', my: 'top right' },
      //       },
      //       'error'
      //     );
      //   }
      // });
    console.log('old data:', oldData);
    console.log('new data:', updataDate);
    console.log('modified data:', combinedData);

    event.cancel = true; // Prevent the default update operation
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
  };
}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,CategoryFormModule
  ],
  providers: [],
  exports: [],
  declarations: [CategoryListComponent],
})
export class CategoryListModule{}

