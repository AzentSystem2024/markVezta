import { Component,OnInit,NgModule,ViewChild, NgZone, ChangeDetectorRef } from '@angular/core';
import { DxButtonModule } from 'devextreme-angular';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
import { DepartmentFormComponent,DepartmentFormModule } from 'src/app/components/library/department-form/department-form.component';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import notify from 'devextreme/ui/notify';
import { DxPopupModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { ExportService } from 'src/app/services/export.service';
import { DepartmentEditModule } from '../department-edit/department-edit.component';
@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnInit {
  @ViewChild(DepartmentFormComponent) departmentComponent: DepartmentFormComponent;
  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;

 readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  department:any;
  selectedDepartment_data:any;
  isAddDepartmentPopupOpened=false;
  isEditDepartmentPopupOpened= false;
  updateEventData: any;
  showFilterRow=true;
  showHeaderFilter=true;
   isFilterRowVisible: boolean = false;
   COMPANY_ID : any;
    sessionData: any;
    COMPANY_NAME:any;
  constructor(private dataservice:DataService,private exportService: ExportService,private ngZone: NgZone,private cdr: ChangeDetectorRef
    ){
      this.sesstion_Details();
      this.showDepartment()
    }
  
  addDepartment(){
    this.isAddDepartmentPopupOpened=true;
     this.departmentComponent.resetButton(); 
  }
  onExporting(event: any) {
    this.exportService.onExporting(event,'Department-list');
  }

  OnEditingStart(event:any){
    event.cancel = true;
    this.isEditDepartmentPopupOpened = true
    this.SelectDepartment(event)

  }

  SelectDepartment(event:any){
      
  console.log(event);
  const id = event.data.ID;

  this.dataservice.selectDepartment(id).subscribe((res: any) => {
    console.log(res);
 this.selectedDepartment_data = res
  });

  }

          toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };
  
  showDepartment(){
     this.dataservice.getDepartmentData().subscribe(
      (response)=>{
            this.department=response;
            console.log(response,"department");
      }
     )
  }


        addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
  
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addDepartment());
    },
    
    elementAttr: { class: 'add-button' },    
  };

  sesstion_Details(){
     this.sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(this.sessionData,'=================session data==========')

    this.COMPANY_ID=this.sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.COMPANY_ID,'============selected_Company_id==============')

    this.COMPANY_NAME = this.sessionData.SELECTED_COMPANY.COMPANY_NAME
    console.log(this.COMPANY_NAME,'=======selected company name=====')

}

  onClickSaveDepartment(){
    const { CODE, DEPT_NAME, COMPANY_ID,COMPANY_NAME } =this.departmentComponent.getNewDepartmentData();
    console.log('inserted data',CODE,DEPT_NAME,COMPANY_ID,COMPANY_NAME);

    // Check for duplicates in CategoryList
    const isCodeDuplicate = this.department.some(
      // (item: any) => item.CODE === commonDetails.code
        (item: any) => item.CODE.toLowerCase() ===CODE.toLowerCase()
    );

    const isDescriptionDuplicate = this.department.some(
      // (item: any) => item.DESCRIPTION === commonDetails.category
            (item: any) =>
    item.DEPT_NAME.toLowerCase() === DEPT_NAME.toLowerCase()
    );

    if (isCodeDuplicate && isDescriptionDuplicate) {
      notify(
        {
          message: 'Both Code and Department already exist',
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


    
    this.dataservice.postDepartmentData(CODE,DEPT_NAME,COMPANY_ID,COMPANY_NAME).subscribe(
      (response)=>{
        if(response){
          this.showDepartment();
          this.isAddDepartmentPopupOpened=false
          // this.DepartmentFormComponent.resetButton()
           notify(
      {
        message: "Department Updated successfully",
        position: { at: "top right", my: "top right" },
        displayTime: 1000,
      },
      "success"
    );
            this.departmentComponent.resetButton(); 
        }
      }
    )

  }
  onRowRemoving(event: any) {
    var SelectedRow = event.key;
    console.log('selected row',SelectedRow);
    const id = SelectedRow.ID
    console.log(id)
    this.dataservice.removeDepartment(id).subscribe(() => {
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
        this.showDepartment();
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
  

  handleClose(){
    this.showDepartment()
    this.isAddDepartmentPopupOpened=false
    this.isEditDepartmentPopupOpened=false
   
  }

  onClickUpdateDepartment(updatedData: any) {
    this.isAddDepartmentPopupOpened=false;
  }

  ngOnInit(): void {
    this.showDepartment();
  }
  refresh = () => {
    this.dataGrid.instance.refresh();
    this.showDepartment()
  };
}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,FormPopupModule,DepartmentFormModule,DxPopupModule,CommonModule,DepartmentEditModule,
  ],
  providers: [],
  exports: [],
  declarations: [DepartmentListComponent],
})
export class DepartmentListModule{}
