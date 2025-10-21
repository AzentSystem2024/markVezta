import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule, NgZone, ViewChild } from '@angular/core';
import { DxButtonModule, DxDataGridComponent, DxDataGridModule, DxDateBoxModule, DxFormModule, DxPopupModule, DxSelectBoxModule, DxTextBoxModule, DxValidationGroupComponent, DxValidationGroupModule, DxValidatorModule } from 'devextreme-angular';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

import { formatDate } from '@angular/common';  // ✅ at the top
import { EmployeeSalarySettingsAddComponent, EmployeeSalarySettingsAddModule } from '../employee-salary-settings-add/employee-salary-settings-add.component';
import { EmployeeSalarySettingsEditModule } from '../employee-salary-settings-edit/employee-salary-settings-edit.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-salary-settings',
  templateUrl: './employee-salary-settings.component.html',
  styleUrls: ['./employee-salary-settings.component.scss']
})
export class EmployeeSalarySettingsComponent {
  @ViewChild(EmployeeSalarySettingsAddComponent)
  EmployeeSalarySettingsAddComponent!: EmployeeSalarySettingsAddComponent;

  @ViewChild('formValidationGroup', { static: false }) formValidationGroup: DxValidationGroupComponent;

  @ViewChild(DxDataGridComponent, { static: true })
  EmployeeSalarySettingsDatasource : any[] = [];
    displayMode: any = 'full';
  showPageSizeSelector = true;
   addEmployeePopupOpened: boolean = false;
   editEmployeePopupOpened: boolean = false;
filterOptions = [
  { text: 'All', value: 6 },
  { text: 'Pending', value: 5 },
  { text: 'Latest', value: 4 }
];

selectedFilterAction: number = 4; // default is "All"
CompanyID = 1;
  selectedEmployeeId: any;
    selectedEmployee: any;
    PreviousRevision:any;
  employeeFormData: any;
  selectedRows: any[];
  salaryGridData: any;
  SalaryDetails : any[] = [];
  effectFromRaw:any;
  previousEffectFrom:any;
   canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

ngOnInit() {
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData:', menuResponse);

    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/employee-salary-settings');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }

    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
  this.getEmployeeSalarySettingsList(); // call API on load with default filter
}

      addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addEmployee());
    },
    elementAttr: { class: 'add-button' }
  };

   constructor(private dataservice: DataService,private ngZone: NgZone,private router: Router) {}


formatMonthYear = (date: Date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};


   addEmployee() {
   
    setTimeout(() => {
    this.formValidationGroup?.instance?.reset();
  });
  
  const matched = this.EmployeeSalarySettingsDatasource.find(
    (item: any) => item.EMP_ID === this.selectedEmployeeId
  );

  if (this.EmployeeSalarySettingsAddComponent) {
    this.EmployeeSalarySettingsAddComponent.EmployeeSalarySettingsDatasource = matched || {};
    this.EmployeeSalarySettingsAddComponent.batchId = matched?.BATCH_ID || null;
  }
   this.addEmployeePopupOpened = true;
  }

   onFormClosed(event:any) {
    this.addEmployeePopupOpened = false;
    setTimeout(() => {
    this.formValidationGroup?.instance?.reset();
  });
  }

  getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 1-based
  const day = '01'; // Always first day
  return `${year}-${month}-${day}`; // Format: YYYY-MM-DD
}

   onEditEmployee(e: any) {
    e.cancel = true
  console.log(e,'=============event================================')
    const employeeId = e.data.ID;
    const EffectFrom = e.data.EFFECT_FROM
    const BatchId = e.data.BATCH_ID
    console.log(employeeId, 'Selected Employee ID for Edit');
    this.editEmployeePopupOpened = true;
    // ✅ Format EFFECT_FROM to 'yyyy-MM-dd'
  const formattedEffectFrom = formatDate(EffectFrom, 'yyyy-MM-dd', 'en-US');
    const payload ={
      EMP_ID: employeeId,
     EFFECT_FROM: formattedEffectFrom,
     BATCH_ID:BatchId
    }
    console.log(payload,'payload===================================================================')
    this.dataservice.Select_EmployeeSalarySettings_Api(payload).subscribe((response: any) => {
      this.selectedEmployee = response.Data[0];
 console.log(this.selectedEmployee,'selected response');

   this.effectFromRaw = this.selectedEmployee.EFFECT_FROM;
  console.log(this.effectFromRaw,'selected effect from')

  this.previousEffectFrom =this.selectedEmployee.PREVIOUS_EFFECT_FROM;
  console.log(this.previousEffectFrom,'previous effect from')
      
    });
    
  }



  handleEditClose(event:any) {
    this.editEmployeePopupOpened = false;
    this.getEmployeeSalarySettingsList();
    this.selectedEmployee = null;
    this.PreviousRevision=null;
    this.selectedRows=[]
    this.salaryGridData=[];
    
    this.SalaryDetails=[]
    setTimeout(() => {
    this.formValidationGroup?.instance?.reset();
  });
  }

  handleClose(){
    this.addEmployeePopupOpened = false;
    this.getEmployeeSalarySettingsList();
    if(this.EmployeeSalarySettingsAddComponent){
      this.EmployeeSalarySettingsAddComponent.resetForm()
    }
    setTimeout(() => {
    this.formValidationGroup?.instance?.reset();
  });
  }

  

  getEmployeeSalarySettingsList() {
    const payload = {
      CompanyId: this.CompanyID,
      FilterAction: Number(this.selectedFilterAction) // Ensure it's a number 
    }
    console.log(payload,'payload')
    this.dataservice.getEmployeeSalarySettingsList(payload).subscribe((response:any)=>{
      console.log(response,'response');
      this.EmployeeSalarySettingsDatasource = response.Data || []

      
    })
  }


onPopupHiding() {
  this.addEmployeePopupOpened = false;

  // Optionally reset child component if needed
  // You can use @ViewChild to get the component reference:
  // this.employeeSalaryAddComponentRef?.resetForm();
}


DeleteEmployeeSalarySettings(event: any) {
  console.log(event.data,'event=========')

  const BatchId = event.data.BATCH_ID
  console.log(BatchId,'Batch Id')
  //   const id=event.data.ID
  // const EffectFrom = event.data.EFFECT_FROM
  // const formattedEffectFrom = formatDate(EffectFrom, 'yyyy-MM-dd', 'en-US');
  //   const payload ={
  //     EMP_ID : id,
  //     EFFECT_FROM : formattedEffectFrom
  //   }
  // console.log(payload,'payload')
this.dataservice.Delete_EmployeeSalarySettings_Api(BatchId).subscribe((res:any)=>{  
  console.log('response from delete packing api:', res);
      this.getEmployeeSalarySettingsList()
      // this.dataGrid.instance.refresh();
        notify(
                 {
                   message: 'Data succesfully deleted',
                   position: { at: 'top right', my: 'top right' },
                   displayTime: 500,
                 },
                 'success'
               );
    })

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
    EmployeeSalarySettingsEditModule,
    EmployeeSalarySettingsAddModule
  ],
  providers: [],
  declarations: [EmployeeSalarySettingsComponent],
  exports: [EmployeeSalarySettingsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmployeeSalarySettingsModule {}