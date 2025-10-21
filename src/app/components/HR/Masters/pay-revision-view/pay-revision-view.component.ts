import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, NgModule, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxPopupModule, DxDropDownBoxModule, DxToolbarModule, DxTabPanelModule, DxTabsModule } from 'devextreme-angular';
import { DxoItemModule, DxoFormItemModule, DxoLookupModule, DxiItemModule, DxiGroupModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { PayRevisionVerifyComponent } from '../pay-revision-verify/pay-revision-verify.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-pay-revision-view',
  templateUrl: './pay-revision-view.component.html',
  styleUrls: ['./pay-revision-view.component.scss']
})
export class PayRevisionViewComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() revisionData: any;
  verifyPayRevisionPopupOpened = false;

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
      // this.getSalaryHead();
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
  ],
  providers: [],
  declarations: [PayRevisionViewComponent],
  exports: [PayRevisionViewComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PayRevisionViewModule {}

