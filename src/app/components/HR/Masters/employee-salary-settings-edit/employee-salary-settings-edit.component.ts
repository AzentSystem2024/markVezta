import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, NgModule, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DxButtonModule, DxDataGridComponent, DxDataGridModule, DxDateBoxModule, DxFormComponent, DxFormModule, DxNumberBoxModule, DxPopupModule, DxSelectBoxModule, DxTextBoxModule, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';
import { formatDate } from '@angular/common';


@Component({
  selector: 'app-employee-salary-settings-edit',
  templateUrl: './employee-salary-settings-edit.component.html',
  styleUrls: ['./employee-salary-settings-edit.component.scss']
})
export class EmployeeSalarySettingsEditComponent {
    @Output() formClosed = new EventEmitter<boolean>();
     @Output() popupClosed = new EventEmitter<void>();
    @ViewChild(DxFormComponent, { static: false }) formRef: DxFormComponent;
    @ViewChild('salaryGrid', { static: false }) salaryGridRef: DxDataGridComponent;

@Input() employeeData: any;

    EmployeeDropdown:any;
    selectedEmployee:any;
    SalaryHeadList:any;
salaryGridData: any = {};
EmployeeSalarySettingsDatasource:any;
selectedFilterAction: number = 4; // default is "All"
selectedEmployeeId: number = null;
SalaryDetails : any[] = [];
selected_Batch_id:any
CompanyID =1 ;
FinID = 1;
   selectedRows: any[] = [];
   PreviousRevision: any;
  employeeFormData: any = {
  EMP_CODE: '',  
  FIN_ID: '',
  BASIC_SALARY: '',
  PREV_REVISION: '',
  EFFECT_FROM: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // always 1st of current month
};


 constructor(private dataservice: DataService,private cdr: ChangeDetectorRef) {
  // this.getEmployeeSalarySettingsList();
  this.EmployeeListDropDown();
   this.get_SalaryHead_List();
 }

onEmployeeChanged(event: any) {
  this.selectedEmployeeId = event.value;

  const selectedEmp = this.EmployeeDropdown.find((emp: any) => emp.ID === event.value);
  if (selectedEmp) {
    const empCode = selectedEmp.DESCRIPTION.split('-')[0]; // "102" from "102-Anusri"
    this.selectedEmployee = {
      ...selectedEmp,
      EMP_CODE: empCode
    };
    // this.employeeFormData.BASIC_SALARY = selectedEmp.SALARY || 0;
  }

  this.get_SalaryHead_List();  // 👍 Move this here
}


onEffectFromChanged(e: any) {
  if (!e.value) return;

  // Use noon to avoid timezone rollback
  const selectedMonthFirstDate = new Date(
    e.value.getFullYear(),
    e.value.getMonth(),
    1,
    12, 0, 0  // ✅ Set time to 12:00 noon
  );

  const currentMonthFirstDate = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
    12, 0, 0  // ✅ Also set this to noon
  );

  if (selectedMonthFirstDate < currentMonthFirstDate) {
    e.component.option('value', currentMonthFirstDate);
    this.employeeFormData.EFFECT_FROM = currentMonthFirstDate;
  } else {
    e.component.option('value', selectedMonthFirstDate);
    this.employeeFormData.EFFECT_FROM = selectedMonthFirstDate;
  }
}

  EmployeeListDropDown() {
     this.dataservice.getEmployeeDropDown().subscribe((response: any) => {
      console.log(response, 'response++++++++++');
      this.EmployeeDropdown = response;
    //  if (response && response.Data) {
    //   this.EmployeeDropdown = response.Data.map((emp: any) => ({
    //     ...emp,
    //     DESCRIPTION: `${emp.EMP_CODE} - ${emp.EMP_NAME}` // 👈 Make sure these exist
    //   }));
    // }

    });
  }

get_SalaryHead_List() {
  if (!this.selectedEmployeeId) {
    console.warn('No employee selected');
    return;
  }

  const payload = {
    EMP_ID: this.selectedEmployeeId,
    COMPANY_ID: this.CompanyID,
  };

  console.log(payload, 'payload for SalaryHeadList');

  this.dataservice.get_SalaryHeadList_Api(1).subscribe((res: any) => {
    this.salaryGridData = res.Data[0];
    this.selectedRows = [];
    console.log(this.salaryGridData.Details, 'SalaryHeadList');

const selecteddata = this.salaryGridData.Details;
this.selectedRows = selecteddata
        .filter((item) => item.HEAD_AMOUNT > 0 || item.HEAD_PERCENT > 0)
        .map((item) => item.HEAD_ID); // or your row's unique identifier
      console.log(this.selectedRows, 'Selected Rows after filtering');

    this.SalaryDetails = this.salaryGridData.Details || [];
     this.PreviousRevision = this.salaryGridData.EFFECT_FROM || "";
      this.employeeFormData.BASIC_SALARY = this.salaryGridData.SALARY || 0;
  });
}


  cancel() {
    this.employeeFormData = {
      EMP_CODE: '',
      FIN_ID: '',
      BASIC_SALARY: '',
      PREV_REVISION: '',
      EFFECT_FROM: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // always 1st of current month
    };
 this.PreviousRevision=null;
    this.selectedEmployee = null;
    this.selectedEmployeeId = null;
    this.selectedRows = [];
    this.salaryGridData = [];
    this.SalaryDetails = [];
    this.formClosed.emit(true);
  }

  //  getEmployeeSalarySettingsList() {
  //   const payload = {
  //     FilterAction: Number(this.selectedFilterAction) // Ensure it's a number 
  //   }
  //   this.dataservice.getEmployeeSalarySettingsList(payload).subscribe((response:any)=>{
  //     console.log(response,'response');
  //     this.EmployeeSalarySettingsDatasource = response.Data || []
  //     console.log(this.EmployeeSalarySettingsDatasource, 'EmployeeSalarySettingsDatasource');
  //   })
  // }

  

ngOnChanges(changes: SimpleChanges) {
  console.log('ngOnChanges triggered', changes);

  if (
    changes['employeeData'] &&
    changes['employeeData'].currentValue &&
    changes['employeeData'].currentValue.ID
  ) {
    this.selectedEmployee = changes['employeeData'].currentValue;
    this.selectedEmployeeId = this.selectedEmployee.ID;

    console.log(this.selectedEmployee,'========selected employeee dataa===========================')
    this.selected_Batch_id=this.selectedEmployee.BATCH_ID
    console.log(this.selected_Batch_id,'==========batch id===================')

    this.employeeFormData = {
      EMP_CODE: this.selectedEmployee.EMP_CODE || '',
      EMP_NAME: this.selectedEmployee.EMP_NAME || '',
      DESIGNATION: this.selectedEmployee.DESG_NAME || '',
      BASIC_SALARY: Number(this.selectedEmployee.SALARY) || 0,

      // EFFECT_FROM: new Date(),
      EFFECT_FROM: this.selectedEmployee.EFFECT_FROM,
      PREVIOUS_EFFECT_FROM: this.selectedEmployee.PREVIOUS_EFFECT_FROM,
      
      IS_INACTIVE: this.selectedEmployee.IS_INACTIVE || false,
    };
    
    this.get_SalaryHead_List()

   this.SalaryDetails = Array.isArray(this.selectedEmployee.Details)
  ? [...this.selectedEmployee.Details]
  : [];
  console.log(this.SalaryDetails,'salary details')
  console.log(this.employeeFormData)
console.log(this.employeeFormData.EFFECT_FROM,"================='''''''''''''/////////////////////")
console.log(this.employeeFormData.PREVIOUS_EFFECT_FROM)
this.cdr.detectChanges(); // Ensure grid gets new data

setTimeout(() => {
  this.selectedRows = this.SalaryDetails
    .filter(item => item.HEAD_AMOUNT > 0 || item.HEAD_PERCENT > 0)
    .map(item => item.HEAD_ID);

  // Optional: manually refresh selection
  if (this.salaryGridRef?.instance) {
    this.salaryGridRef.instance.selectRows(this.selectedRows, false);
  }
}, 100); // Slight delay ensures grid is ready
  }
  

}



  onSelectionChanged(e: any) {
  this.selectedRows = e.selectedRowKeys;
  console.log('User selected:', this.selectedRows);
}

 onEditorPreparing(e: any) {
    // console.log(e, 'Editor Preparing Event');

    console.log(e, 'Editor Preparing Event');
  //  this.selectedRows = e.row?.data
  //   console.log(this.selectedRows, 'isDataRow in Editor Preparing Event');
    const headNature = e.row?.data.HEAD_NATURE;
    console.log(headNature, '=======error===============');
    console.log(headNature, 'HEAD_NATURE in Editor Preparing Event');

    const headId = e.row?.data.HEAD_ID;

  const isRowSelected = this.selectedRows?.includes(headId);

  if (e.dataField === 'HEAD_AMOUNT') {
    e.editorOptions.disabled = !(isRowSelected && headNature === '1'); // Enable only if selected and HEAD_NATURE === '1'
  }

  if (e.dataField === 'HEAD_PERCENT') {
    e.editorOptions.disabled = !(isRowSelected && headNature === '2'); // Enable only if selected and HEAD_NATURE === '2'
  }
  }

  onCellValueChanged(e: any) {
  const { data, column, value } = e;

  if (column.dataField === 'HEAD_AMOUNT') {
    data.HEAD_AMOUNT = value;
  }

  if (column.dataField === 'HEAD_PERCENT') {
    data.HEAD_PERCENT = value;
  }
}

getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 1-based
  const day = '01'; // Always first day
  return `${year}-${month}-${day}`; // Format: YYYY-MM-DD
}

saveEmployee() {

  const effectFrom = new Date(this.employeeFormData.EFFECT_FROM);
  const previousRevision = new Date(this.PreviousRevision);
  
  // Convert to yyyy-mm-dd for clean comparison
  // const effectStr = this.stripToDateOnly(effectFrom);
  // const prevStr = this.stripToDateOnly(previousRevision);
  
  // console.log(effectStr,'effectstr');
  // console.log(prevStr,'prevstr')
  
  if ( effectFrom <= previousRevision) {
    notify({
      message: 'Effect From date must be greater than Previous Revision date.',
      position: { at: 'top right', my: 'top right' },
      displayTime: 3000,
    }, 'error');
    return;
  }
 



  const payload = {
    ID: 0,
    EMP_ID: this.selectedEmployee ? this.selectedEmployee.ID : 0,
    COMPANY_ID: this.CompanyID,
    FIN_ID: this.FinID,
   BATCH_ID :  this.selected_Batch_id,
    // EMP_CODE: String(this.selectedEmployee.EMP_CODE),
    SALARY: Number(this.employeeFormData.BASIC_SALARY) || 0,
     EFFECT_FROM: formatDate(this.employeeFormData.EFFECT_FROM, 'yyyy-MM-dd', 'en-US'),

    Details: this.SalaryDetails
      .filter(item => this.selectedRows.includes(item.HEAD_ID) &&
    (Number(item.HEAD_AMOUNT) > 0 || Number(item.HEAD_PERCENT) > 0)) // 🔥
      .map(item => ({
        HEAD_ID: item.HEAD_ID,
        HEAD_NAME: item.HEAD_NAME,
        HEAD_NATURE: item.HEAD_NATURE,
        HEAD_PERCENT: Number(item.HEAD_PERCENT) || 0,
        HEAD_AMOUNT: item.HEAD_AMOUNT,
        IS_INACTIVE: !!item.IS_INACTIVE,
      }))
  };

  console.log(payload, 'payload from saveEmployee');

  this.dataservice.Update_EmployeeSalarySettings_Api(payload).subscribe((res: any) => {
    console.log(res, 'response from saveEmployee');
    if (res.message === 'Success') {
      notify({
        message: 'Employee Salary Settings saved successfully',
        position: { at: 'top right', my: 'top right' },
        displayTime: 500,
      }, 'success');

      this.popupClosed?.emit();
  this.formClosed.emit(true);
  this.cancel();
    } else {
      notify({
        message: 'Failed to save Employee Salary Settings',
        position: { at: 'top right', my: 'top right' },
        displayTime: 500,
      }, 'error');
    }
  });
}



}
@NgModule({
  imports: [
    DxSelectBoxModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    DxDataGridModule,
    DxButtonModule,
    DxValidatorModule,
    DxPopupModule,
    DxButtonModule,
    DxValidationGroupModule,
    DxNumberBoxModule,
  ],
  providers: [],
  declarations: [EmployeeSalarySettingsEditComponent],
  exports: [EmployeeSalarySettingsEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmployeeSalarySettingsEditModule {}