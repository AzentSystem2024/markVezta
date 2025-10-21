import { CommonModule } from '@angular/common';
import { Component, NgModule, ViewChild } from '@angular/core';
import { DxButtonModule, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxPopupModule, DxTextBoxModule } from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { FormTextboxModule } from "../../../../components/utils/form-textbox/form-textbox.component";
import { DxFormModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';
import { FormGroup,FormBuilder, Validators,ReactiveFormsModule } from '@angular/forms';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-designation',
  templateUrl: './designation.component.html',
  styleUrls: ['./designation.component.scss']
})
export class DesignationComponent {

 
 @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;

 Designation:any[];
  formsource: FormGroup;
  formData = {IS_INACTIVE:false}; 
designationComponent:any;
  list_for_duplication: any;
isLoading: any;

constructor(private fb:FormBuilder,private dataservice : DataService){
  this.formsource = this.fb.group({
      CODE : ['',Validators.required],
     DESG_NAME : ['',Validators.required],
      IS_INACTIVE : [false]
    })
   this.get_Designation_List()
}
  

showFilterRow: boolean = true;
currentFilter: string = 'auto';
AddDesignationPopup = false;
codeValue: string = '';
UpdateDesignationPopup=false;
editingRowData: any = {}; // To store the selected row's data
Status : boolean = false
designation :any;
selectedData :any;




addDesignation(){
  this.AddDesignationPopup=true;
}
UpdateDesignation(){
  this.UpdateDesignationPopup=true;
}
formatStatus(data:any){
  return data.IS_INACTIVE ?  'Inactive' : 'Active';
  }
onEditingStart(event:any){
  event.cancel = true;
  this.editingRowData = { ...event.data }; // Store the selected row data
  this.UpdateDesignationPopup=true;

  this.Select_Designation(event)

}

refresh = () => {
  this.dataGrid.instance.refresh();
};



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
get_Designation_List() {
  this.isLoading = true;
  this.dataservice.get_Designation_List().subscribe((res: any) => {
    if (res) {
      this.Designation = res.datas.map((item: any, index: any) => ({
        ...item,
        SlNo: index + 1, // Assign serial number
      }));
    }
    console.log(res,"response")
  });
}


//============Add data============
Add_Designation(){
  console.log('function working')
  const CODE = this.formsource.value.CODE?.trim();
  console.log(CODE,"code")
  const DESG_NAME = this.formsource.value.DESG_NAME;
  const IS_INACTIVE = this.formsource.value.IS_INACTIVE;
  
  this.formsource.reset()
  const isDuplicate = this.Designation.some((data: any) => {
    return (
      data.DESG_NAME?.toLowerCase().trim() === DESG_NAME?.toLowerCase().trim() ||
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

  if(CODE && DESG_NAME){
  this.dataservice.Insert_Designation_Api(CODE,DESG_NAME,IS_INACTIVE).subscribe((response)=>{
    notify(
      {
        message: 'Data succesfully added',
        position: { at: 'top right', my: 'top right' },
        displayTime: 500,
      },
      'success'
    );
    this.AddDesignationPopup = false
    this.formsource.reset();
    this.get_Designation_List()
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
    this.get_Designation_List()
} 
  
//==============edit data=====================
Edit_Designation(){
  console.log('edit function is working')
  const CODE = this.editingRowData.CODE;
  const DESG_NAME = this.editingRowData.DESG_NAME;
  const IS_INACTIVE = this.editingRowData.IS_INACTIVE;
  const ID = this.editingRowData.ID;

   this.dataservice.get_Designation_List().subscribe((response:any)=>{
    this.list_for_duplication = response.datas
    console.log(this.list_for_duplication,"duplication")
   })

   const isDuplicate = this.Designation?.some((item: any) => {
    if (item.ID === ID) return false; // Skip current item (being edited)
  
    return (
      (item.CODE?.trim().toLowerCase() || '') === (CODE?.trim().toLowerCase() || '') ||
      (item.DESG_NAME?.trim().toLowerCase() || '') === (DESG_NAME?.trim().toLowerCase() || '') 
    );
  });

     if(isDuplicate){
      this.get_Designation_List()
      console.log(isDuplicate,"isdephhgjh");
      
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
     if(CODE && DESG_NAME){
  this.dataservice.Update_Designation_Api(ID,CODE,DESG_NAME,IS_INACTIVE).subscribe((response:any)=>{
    notify(
      {
        message: 'Data succesfully added',
        position: { at: 'top right', my: 'top right' },
        displayTime: 500,
      },
      'success'
    );
   this.get_Designation_List()
    console.log(response);
    
  })
  this.UpdateDesignationPopup =  false;
  this.get_Designation_List()
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
this.UpdateDesignationPopup = false
this.get_Designation_List()
}


//============select data========================
Select_Designation(event:any){
  const ID = event.data.ID

  this.dataservice.Select_Designation_Api(ID).subscribe((response:any)=>{
    console.log(response,"select Api");
    this.selectedData = response
  })
}

//===============delete data=================
delete_Department(event:any){
  const ID = event.data.ID
  this.dataservice.Delete_Designation_Api(ID).subscribe((response:any)=>{
    console.log(response,"deleted")
  })
}
}
@NgModule({
  imports: [
    DxDataGridModule,DxFormModule, DxButtonModule, FormPopupModule, DxPopupModule, CommonModule,
    FormTextboxModule,DxTextBoxModule,DxCheckBoxModule,ReactiveFormsModule
],
  providers: [],
  exports: [],
  declarations: [DesignationComponent],
})
export class DesignationModule{}
function get_Designation_List() {
  throw new Error('Function not implemented.');
}

