import { Component, NgModule, NgZone, ViewChild } from '@angular/core';
import { DxDataGridModule,DxButtonModule, DxTextBoxModule, DxFormModule, DxCheckBoxModule, DxValidatorModule } from 'devextreme-angular';
import { DxPopupModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { FormPopupModule } from 'src/app/components';
import { DepartmentFormModule } from "../../../../components/library/department-form/department-form.component";
import { DxDataGridComponent } from 'devextreme-angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';



@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.scss']
})
export class DepartmentComponent {

   @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
  

   Department: any[] 
  departmentComponent: any;
  formData = {IS_ACTIVE:false}; // DevExtreme expects an object
  editingIndex: number;
  isLoading: boolean;


constructor(private fb:FormBuilder,private dataservice : DataService,private ngZone: NgZone ){
  this.formsource = this.fb.group({
    CODE : ['',Validators.required],
    DEPT_NAME : ['',Validators.required],
    IS_ACTIVE : [false]
  })
 this.get_Department_List()
}

formsource:FormGroup ;
showFilterRow: boolean = true;
currentFilter: string = 'auto';
Status : boolean = false
department:any;
selectCode :any;
AddDepartmentPopup=false
UpdateDepartmentPopup=false;
editingRowData: any = {}; // To store the selected row's data
selectedData: any;
list_of_duplication :any;

addDepartment(){
 this.AddDepartmentPopup=true
}
UpdateDepartment(){
this.UpdateDepartmentPopup=true
}



onEditingStart(event:any){
  event.cancel = true;
  this.editingRowData = { ...event.data }; // Store the selected row data
  this.UpdateDepartmentPopup=true;

  this.Select_Department(event)
}



refresh = () => {
  this.dataGrid.instance.refresh();
};

formatStatus(data:any){
  return data.IS_ACTIVE ?  'Active' : 'Inactive';
  }
  
getSerialNumber = (rowIndex: number) => {
  return rowIndex + 1;
};

statusCellTemplate = (cellElement: any, cellInfo: any) => {
  const status = cellInfo.value; // Get the value from `calculateCellValue`
  const text = status; // Use the calculated value ("Inactive" or "Active")

// Apply the dynamic styles and content
cellElement.innerHTML = `
<span style="
  color: white;
  padding: 2px 3px;
  border-radius: 5px;
  display: inline-block;
  text-align: center;
  min-width: 60px;"
>
  ${text}
</span>`;
};


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


onPopupCancel() {
  this.formsource.reset({
    CODE: '',
    DEPT_NAME: '',
    IS_ACTIVE: true   // add if you have checkbox or default value
  });
}


 //===================get data list========================
 get_Department_List() {
  this.isLoading = true;
  this.dataservice.get_Department_List().subscribe((res: any) => {
    if (res) {
      this.Department = res.datas.map((item: any, index: any) => ({
        ...item,
        SlNo: index + 1, // Assign serial number
      }));
    }
    console.log(res,"response")
  });
}



//============Add data============
Add_Department(){
  console.log('function working')
  const CODE = this.formsource.value.CODE?.trim();
  console.log(CODE,"code")
  const DEPT_NAME = this.formsource.value.DEPT_NAME;
  const IS_ACTIVE = this.formsource.value.IS_ACTIVE;
  
  this.formsource.reset()

  const isDuplicate = this.Department.some((data: any) => {
    return (
      data.DEPT_NAME?.toLowerCase().trim() === DEPT_NAME?.toLowerCase().trim() ||
        data.CODE?.toLowerCase().trim() === CODE?.toLowerCase().trim()
    );
    
  });
  this.formsource.reset()
  if (isDuplicate) {
    notify(
      {
        message: 'Data already exists',
        position: { at: 'top right', my: 'top right' },
        displayTime: 500,
      },
      'error'
    );
    
    return;
    
  }
  this.formsource.reset()

  if(CODE && DEPT_NAME){
  this.dataservice.Insert_Department_Api(CODE,DEPT_NAME,IS_ACTIVE).subscribe((response)=>{
    notify(
      {
        message: 'Data succesfully added',
        position: { at: 'top right', my: 'top right' },
        displayTime: 500,
      },
      'success'
      
    );
    this.formsource.reset();
    this.AddDepartmentPopup = false
    
    this.get_Department_List()
  })
}

 else{
    notify(
      {
        message: 'Please fill the fields',
        position: { at: 'top right', my: 'top right' },
        displayTime: 500,
      },
      'error'
    );
    }  
    this.get_Department_List()
} 
  


//==================edit data=======================
Edit_Department(){
  console.log('edit function is working')
  console.log(this.editingRowData,"editing row data")
  const CODE = this.editingRowData.CODE;
  const DEPT_NAME = this.editingRowData.DEPT_NAME;
  const IS_ACTIVE = this.editingRowData.IS_ACTIVE;
  const ID = this.editingRowData.ID

  console.log(CODE,DEPT_NAME,IS_ACTIVE,"code deptname")
  console.log(ID,"id")


  this.get_Department_List()

  const isDuplicate = this.Department?.some((item: any) => {
    if (item.ID === ID) return false; // Skip current item (being edited)
  
    return (
      (item.CODE?.trim().toLowerCase() || '') === (CODE?.trim().toLowerCase() || '') ||
      (item.DEPT_NAME?.trim().toLowerCase() || '') === (DEPT_NAME?.trim().toLowerCase() || '') 
     
    );
  });


     if(isDuplicate){
      console.log(isDuplicate,"duplicate triggered")

        notify(
          {
            message: 'Data already exists',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'error'
        );
        return;
     
     }
   this.formsource.reset()
     console.log(CODE,DEPT_NAME,IS_ACTIVE,"++++++++++code deptname")

     if(CODE && DEPT_NAME){
  this.dataservice.Update_Department_Api(ID,CODE,DEPT_NAME,IS_ACTIVE).subscribe((response:any)=>{
    notify(
      {
        message: 'Data succesfully added',
        position: { at: 'top right', my: 'top right' },
        displayTime: 500,
      },
      'success'
    );
    this.get_Department_List()
    console.log(response);
    
  })
  this.UpdateDepartmentPopup =  false;
  this.get_Department_List()
  this.formsource.reset()
}

  else{

    notify(
      {
        message: 'Please fill the fields',
        position: { at: 'top right', my: 'top right' },
        displayTime: 500,
      },
      'error'
    );
    this.AddDepartmentPopup = false
    this.get_Department_List()
    this.formsource.reset()
   } 
   
}


//============select data========================
Select_Department(event:any){
  const ID = event.data.ID

  this.dataservice.Select_Department_Api(ID).subscribe((response:any)=>{
    console.log(response,"select Api");
    this.selectedData = response
  })
}

//==========delete data================
delete_Department(event:any){
  const ID = event.data.ID
  this.dataservice.Delete_Department_Api(ID).subscribe((response:any)=>{
    console.log(response,"deleted")
  })
}

}
@NgModule({
  imports: [
    DxDataGridModule, DxButtonModule, FormPopupModule, DxPopupModule, CommonModule,
    DepartmentFormModule,DxTextBoxModule,DxFormModule,DxCheckBoxModule,ReactiveFormsModule,DxValidatorModule
],
  providers: [],
  exports: [],
  declarations: [DepartmentComponent],
})
export class DepartmentModule{}
