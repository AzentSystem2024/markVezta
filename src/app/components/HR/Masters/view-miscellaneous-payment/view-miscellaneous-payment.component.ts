import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, NgModule, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxPopupModule, DxDropDownBoxModule, DxToolbarModule, DxTabPanelModule, DxTabsModule, DxNumberBoxModule } from 'devextreme-angular';
import { DxoItemModule, DxoFormItemModule, DxoLookupModule, DxiItemModule, DxiGroupModule } from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { VerifyMiscellaneousPaymentComponent } from '../verify-miscellaneous-payment/verify-miscellaneous-payment.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-view-miscellaneous-payment',
  templateUrl: './view-miscellaneous-payment.component.html',
  styleUrls: ['./view-miscellaneous-payment.component.scss']
})
export class ViewMiscellaneousPaymentComponent {
  @Output() popupClosed = new EventEmitter<void>();
    @Input() miscellaneousData: any;
    miscFormData: any = {
      ID: '',
      DOC_NO: '',
      USER_ID: '',
      STORE_ID: '',
      EMP_ID: '',
      DOC_DATE: null,
      DESCRIPTION: '',
      AC_HEAD_ID: '',
      AMOUNT: '',
      NARRATION: '',
    };
    employee: any;
    salaryHead: any;
  paymentDetails: any;
    constructor(private dataService: DataService) {}
  
    ngOnInit() {
      this.getEmployeeDropdown();
      this.getSalaryHead();
    }
  
    ngOnChanges(changes: SimpleChanges) {
      if (
        changes['miscellaneousData'] &&
        changes['miscellaneousData'].currentValue
      ) {
        console.log(
          'Received miscellaneousData:',
          changes['miscellaneousData'].currentValue
        );
        const data = changes['miscellaneousData'].currentValue;
        console.log(data,'TRANSID')
        // Deep copy to avoid reference issues
        this.miscFormData = {
          ...this.miscFormData,
          ...changes['miscellaneousData'].currentValue,
        };
        if (data.TRANS_ID) {
          this.getPaymentDetails({ TRANS_ID: data.TRANS_ID });
        }
      }
    }

    getPaymentDetails(payload: { TRANS_ID: number }) {
      this.dataService.getPaymentDetails(payload).subscribe({
        next: (response) => {
          this.paymentDetails = response
          console.log('Payment Details:', this.paymentDetails);
          // Do something with the payment details
        },
        error: (err) => {
          console.error('Failed to fetch payment details', err);
        }
      });
    }
  
    getEmployeeDropdown() {
      this.dataService
        .getDropdownData('EMPLOYEE')
        .subscribe((response: any) => {
          this.employee = response;

        });
    }
  
    getSalaryHead(){
      this.dataService.getDropdownData('SALARY_HEAD').subscribe((response: any) => {
        this.salaryHead = response

      })
    }
  
    onEmployeeSelected(event: any) {
      const selected = this.employee.find((e) => e.ID === event.value);
      this.miscFormData.EMP_NAME = selected?.DESCRIPTION || '';
    }
  
    onSalaryHeadSelected(event: any) {
      const selected = this.salaryHead.find((e) => e.ID === event.value);
      this.miscFormData.AC_HEAD_ID = selected?.ID || '';
    }
  
    onSave() {
      this.dataService.verifyMiscellaneousData(this.miscFormData).subscribe((response: any) => {
        if (response) {
          notify(
            {
              message: 'Miscellaneous Payment Added Successfully',
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
      })
    }
  
    handleClose() {
      this.popupClosed.emit();
    }
  

    // printForm() {
    //   const printSection = document.getElementById('print-section');
    //   if (!printSection) return;
    
    //   const popupWin = window.open('', '_blank', 'width=800,height=600');
    //   popupWin?.document.open();
    //   popupWin?.document.write(`
    //     <html>
    //       <head>
    //         <title>Print Form</title>
    //         <style>
    //           body {
    //             font-family: Arial, sans-serif;
    //             padding: 20px;
    //           }
    //         </style>
    //       </head>
    //       <body onload="window.print(); window.close();">
    //         ${printSection.innerHTML}
    //       </body>
    //     </html>
    //   `);
    //   popupWin?.document.close();
    // }
    
    
    
     
    

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
  declarations: [ViewMiscellaneousPaymentComponent],
  exports: [ViewMiscellaneousPaymentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ViewMiscellaneousPaymentModule {}