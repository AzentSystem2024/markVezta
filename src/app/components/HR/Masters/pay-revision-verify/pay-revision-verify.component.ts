import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, NgModule, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxPopupModule, DxDropDownBoxModule, DxToolbarModule, DxTabPanelModule, DxTabsModule, DxNumberBoxModule } from 'devextreme-angular';
import { DxoItemModule, DxoFormItemModule, DxoLookupModule, DxiItemModule, DxiGroupModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { PayRevisionEditComponent } from '../pay-revision-edit/pay-revision-edit.component';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-pay-revision-verify',
  templateUrl: './pay-revision-verify.component.html',
  styleUrls: ['./pay-revision-verify.component.scss']
})
export class PayRevisionVerifyComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() revisionData: any;
  verifyPayRevisionPopupOpened = false;
  increasedByPercent:any;
  showFilterRow = true;
    salaryHead: any;
    salaryDetails: any
    employeeList: any;
    employee: any;
    employeeSalaryDetails: any = {};
    revisionFormData: any = {
      ID: '',
      EMP_ID: '',
      REV_DATE: null,
      EFFECT_DATE: null,
      USER_ID: '',
      REMARKS: '',
      REV_DETAIL: [{
        HEAD_ID: '',
        PRESENT_AMOUNT: '',
        REVISED_AMOUNT: ''
      }]
    }
    empId: any;
    revisionGridData: any[] = [];
    constructor(private dataService: DataService){
  
    }
  
    ngOnInit(){
      this.getSalaryHead();
    }
    ngOnChanges(changes: SimpleChanges) {
      if (changes['revisionData'] && changes['revisionData'].currentValue) {
        // console.log('Received revisionData:', changes['revisionData'].currentValue);
    
        // Deep copy to avoid reference issues
        this.revisionFormData = { 
          ...this.revisionFormData, 
          ...changes['revisionData'].currentValue 
        };
    
        // If REV_DETAIL needs to be replaced entirely
        if (changes['revisionData'].currentValue.REV_DETAIL) {
          this.revisionGridData = this.revisionFormData.REV_DETAIL.map(item => ({
            code: item.HEAD_ID,
            description: item.HEAD_NAME,
            presentAmount: item.PRESENT_AMOUNT,
            newAmount: item.REVISED_AMOUNT
          }));
        }
    
        // console.log('Updated revisionFormData:', this.revisionFormData);
      }
    }
    
    
    
    getSalaryHead(){
      this.dataService.getDropdownData('SALARY_HEAD').subscribe((data) => {
       this.salaryHead = data
      //  console.log(this.salaryHead,"SALARYHEAD")
      });
    }
  
    onEmployeeSelect(event: any): void {
      this.empId = event.value;
      if (this.empId) {
        this.dataService.getSalaryDetails(this.empId).subscribe((response) => {
          if (response?.data?.length > 0) {
            this.employeeSalaryDetails = response.data[0]; // Get the first object
            // console.log(this.employeeSalaryDetails, "SALARYDETAILSSSSSSS");
            this.salaryDetails = this.employeeSalaryDetails.SALARY_HEAD.map((item: any) => ({
              code: item.CODE,
              description: item.DESCRIPTION,
              presentAmount: Number(item.PRESENT_AMOUNT), 
            }));
    
            // console.log(this.salaryDetails, "Transformed Salary Data for Grid");
          }
        });
      }
    }
    
    onVerify(): void {
      // Log final payload before sending
      // console.log('Final Payload:', this.revisionFormData);
      this.revisionFormData.REV_DETAIL = this.revisionFormData.REV_DETAIL.map((item, index) => ({
        ...item,
        REVISED_AMOUNT: this.revisionGridData[index]?.newAmount ?? item.REVISED_AMOUNT
      }));
      // Make the API call
      this.dataService.verifySalaryRevision(this.revisionFormData).subscribe(
        (response) => {
          // console.log('Successfully updated:', response);
          if (response) {
                    notify(
                      {
                        message: 'Salary Revised Successfully',
                        position: { at: 'top center', my: 'top center' },
                      },
                      'success'
                    );
                    this.popupClosed.emit(); 
                  } else {
                    notify(
                      {
                        message: 'Your Data Not updated',
                        position: { at: 'top right', my: 'top right' },
                      },
                      'error'
                    );
                  }
          // To close the popup
        },
        (error) => {
          // console.error('Update failed:', error);
          alert('Failed to update pay revision.');
        }
      );
    }
    
  
    handleEditClose() {
      // console.log("CLOSED")
      
      this.popupClosed.emit();
    }
    onIncreaseChange(event: any): void {
      const percent = event.value;  // Use event.value directly
      if (this.revisionGridData && percent != null) {
        this.revisionGridData = this.revisionGridData.map((item: any) => {
          const present = item.presentAmount || 0;
          item.newAmount = +(present + (present * percent / 100)).toFixed(2);
          return item;
        });
      }
    }
  
    onCancel(){}
  
    onEditorPreparing(e: any) {
      if (e.dataField === 'newAmount' && e.parentType === 'dataRow') {
        setTimeout(() => {
          const inputElement = e.editorElement.querySelector('input');
          if (inputElement) {
            inputElement.classList.add('fixed-editor-height');
          }
        });
      }
    }
}

@NgModule({
  imports: [
    BrowserModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextBoxModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxRadioGroupModule,
    DxFileUploaderModule,
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule
  ],
  providers: [],
  declarations: [PayRevisionVerifyComponent],
  exports: [PayRevisionVerifyComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PayRevisionVerifyModule {}