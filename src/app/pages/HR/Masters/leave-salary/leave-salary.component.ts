import { CommonModule } from '@angular/common';
import { Component, NgModule, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DxButtonModule, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxFormModule, DxPopupModule, DxTextBoxModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { get } from 'http';
import { FormPopupModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-leave-salary',
  templateUrl: './leave-salary.component.html',
  styleUrls: ['./leave-salary.component.scss']
})
export class LeaveSalaryComponent {

  @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
  LeaveType: any[];
  
    formsource: FormGroup;
  selectedData: any=[];
leavesalaryComponent: any;
  
  
  constructor(private fb: FormBuilder, private dataservice: DataService) {
    this.formsource = this.fb.group({
      CODE: ['',Validators.required],
      DESCRIPTION: ['',Validators.required],
      LEAVE_SALARY_PAYABLE: [false],
      IS_INACTIVE: [false],
    });
    this.get_LeaveTypeList();
  }
  
    AddLSPopup=false;
    UpdateLSPopup=false;
    Status : boolean = false
  showFilterRow: boolean = true;
currentFilter: string = 'auto';
editingRowData: any = {}; // To store the selected row's data
  isLoading: boolean;

  addLeaveSalary(){
    this.AddLSPopup=true;
  }
  
  updateLeaveSalary(){
    this.UpdateLSPopup=true;
  }

onEditingStart(event:any){
  event.cancel = true;
  console.log(event,"event");
  const ID =  event.data.ID;  
  
  // this.editingRowData = { ...event.data }; // Store the selected row data
  this.UpdateLSPopup=true;
  this.Select_LeaveType (ID)
  console.log(this.selectedData,"selected data++++++++++++");  

}

refresh = () => {
  this.dataGrid.instance.refresh();
};

// formatStatus(data:any){
//   return data.IS_INACTIVE ?  'Inactive' : 'Active';
  
//   }

formatStatusPayable(data:any){
    return data.LEAVE_SALARY_PAYABLE ?  'True' : 'False';
    
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

//===================get data list========================
get_LeaveTypeList() {
  this.dataservice.get_LeaveType_Api().subscribe((res: any) => {
    if (res) {
      this.LeaveType = res.data.map((item: any, index: any) => ({
        ...item,
        SlNo: index + 1, // Assign serial number
      }));
    }
    console.log(res,"response")
  });
}

//====================Add data=================

Add_LeaveType(){
  console.log('function working')
  const CODE = this.formsource.value.CODE?.trim();
  console.log(CODE,"code")
  const DESCRIPTION = this.formsource.value.DESCRIPTION;
  const LEAVE_SALARY_PAYABLE = this.formsource.value.LEAVE_SALARY_PAYABLE;
  const IS_INACTIVE = this.formsource.value.STATUS;

  const isDuplicate = this.LeaveType.some((data: any) => {
    return (
      data.DESCRIPTION?.toLowerCase().trim() === DESCRIPTION?.toLowerCase().trim() ||
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

  if(CODE && DESCRIPTION){
  this.dataservice.Insert_LeaveType_Api(CODE,DESCRIPTION,LEAVE_SALARY_PAYABLE,IS_INACTIVE).subscribe((response)=>{
    notify(
      {
        message: 'Data succesfully added',
        position: { at: 'top right', my: 'top right' },
        displayTime: 500,
      },
      'success'
    );
    this.AddLSPopup = false
    this.formsource.reset();
    this.get_LeaveTypeList()
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
    this.get_LeaveTypeList()
} 

//==============Edit data===================
 
Edit_LeaveType(){
  console.log('edit function is working')
const CODE = this.selectedData.CODE;
const DESCRIPTION = this.selectedData.DESCRIPTION;
const IS_INACTIVE = this.selectedData.IS_INACTIVE;
const LEAVE_SALARY_PAYABLE = this.selectedData.LEAVE_SALARY_PAYABLE;
console.log(LEAVE_SALARY_PAYABLE,"LEAVE_SALARY_PAYABLE")
const ID = this.selectedData.ID;

const isDuplicate = this.LeaveType.some((data: any) => {
  if (data.ID === ID) return false;
  return (
    (data.DESCRIPTION?.toLowerCase() || '') === (DESCRIPTION?.trim().toLowerCase() || '') ||
     ( data.CODE?.toLowerCase() || '') === (CODE?.trim().toLowerCase() || '')
  );
  
});
this.formsource.reset()
 if(isDuplicate) {
  this.get_LeaveTypeList()
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

if(CODE && DESCRIPTION){
this.dataservice.Update_LeaveType_Api(CODE,DESCRIPTION,IS_INACTIVE,LEAVE_SALARY_PAYABLE,ID).subscribe((response)=>{
  notify(
    {
      message: 'Data succesfully added',
      position: { at: 'top right', my: 'top right' },
      displayTime: 500,
    },
    'success'
  );
  console.log(response,"response works");
 
  this.UpdateLSPopup =  false

  this.get_LeaveTypeList()
  
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
this.AddLSPopup = false
this.get_LeaveTypeList()
}
}

//============select data========================
Select_LeaveType(event:any){
  const ID = event;
  this.dataservice.Select_LeaveType_Api(ID).subscribe((response:any)=>{
    console.log(response,"select Api");
    this.selectedData = response
    console.log(this.selectedData,"selected data");
  })
}

//==========Delete data==============

delete_LeaveType(event:any){
  console.log(event,"delete event");
  
  const ID = event.data.ID
  this.dataservice.Delete_LeaveType_Api(ID).subscribe((response:any)=>{
    notify(
      {
        message: 'Data Deleted succesfully',
        position: { at: 'top right', my: 'top right' },
        displayTime: 500,
      },
      'success'
    );
    this.get_LeaveTypeList()
    console.log(response,"deleted")
  })
}

}
@NgModule({
  imports: [
    DxDataGridModule,DxButtonModule,DxCheckBoxModule,ReactiveFormsModule,FormPopupModule,DxFormModule,DxPopupModule,CommonModule,DxTextBoxModule
  ],
  providers: [],
  exports: [],
  declarations: [LeaveSalaryComponent],
})
export class LeaveSalaryModule{}