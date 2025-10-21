import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
  DxTextBoxModule,
  DxCheckBoxModule,
  DxRadioGroupModule,
  DxFileUploaderModule,
  DxDataGridModule,
  DxButtonModule,
  DxValidatorModule,
  DxProgressBarModule,
  DxPopupModule,
  DxDropDownBoxModule,
  DxToolbarModule,
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-pay-revision-add',
  templateUrl: './pay-revision-add.component.html',
  styleUrls: ['./pay-revision-add.component.scss'],
})
export class PayRevisionAddComponent {
  @Output() popupClosed = new EventEmitter<void>();
  editPayRevisionPopupOpened = false;
  @Input() revisionData: any;
  showFilterRow = true;
  salaryHead: any;
  salaryDetails: any;
  employeeList: any;
  employee: any;
  employeeSalaryDetails: any = {};
  revisionFormData: any = {
    EMP_ID: '',
    REV_DATE: null,
    EFFECT_DATE: null,
    USER_ID: '',
    REMARKS: '',
    REV_DETAIL: [
      {
        HEAD_ID: '',
        PRESENT_AMOUNT: '',
        REVISED_AMOUNT: '',
      },
    ],
  };
  empId: any;
  filteredEmployees: any;
  increasedByPercent: any;
  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getEmployeeDropdown();
    this.getSalaryHead();
  }

  getSalaryHead() {
    this.dataService.getDropdownData('SALARY_HEAD').subscribe((data) => {
      this.salaryHead = data;
      // console.log(this.salaryHead, 'SALARYHEAD');
    });
  }
  getEmployeeDropdown() {
    this.dataService
      .getDropdownData('EMPLOYEE_REVISION')
      .subscribe((response: any) => {
        console.log(response, '++++++++++++++++++');
        this.employee = response;
        //   this.employee = response.map((emp: any) => {
        //     const match = emp.DESCRIPTION.match(/^([^-]+)-(.*)$/); // match anything before and after the first hyphen
        //   const code = match ? match[1].trim() : null;
        //   const nameOnly = match ? match[2].trim() : emp.DESCRIPTION;

        //   return {
        //     ...emp,
        //     EMP_NO: code,           // extracted code before hyphen
        //     EMP_NAME: nameOnly      // name after hyphen (optional but useful)
        //     // If you want, you can also replace DESCRIPTION with nameOnly:
        //     // DESCRIPTION: nameOnly
        //   };
        // });

        console.log(this.employee, 'EMPLOYEE DROPDOWN WITH CODES');

        this.getSalaryRevisionList();
      });
  }

  getSalaryRevisionList() {
    this.dataService.getSalaryRevisionLog().subscribe((response: any) => {
      this.employeeList = response.data.reverse();
      // console.log(this.employeeList, 'EMPLOYEELIST==========');

      // Get the approved employees from the revision log
      const approvedEmployees = this.employeeList.filter(
        (emp: any) => emp.STATUS === 'Approved'
      );
      // console.log(approvedEmployees, 'APPROVED EMPLOYEES ==========');

      // Get EMP_NO values from the salary revision list
      const existingEmpNos = new Set(
        this.employeeList.map((emp: any) => emp.EMP_NO)
      );
      console.log(existingEmpNos, 'EXIST');
      // Remove EMP_NO of approved employees from the set so they are not filtered out
      approvedEmployees.forEach((emp: any) =>
        existingEmpNos.delete(emp.EMP_NO)
      );

      // Filter out only employees who are in the revision log *and* not approved
      this.employee = this.employee.filter(
        (emp: any) => !existingEmpNos.has(emp.EMP_NO)
      );

      console.log(this.employee, 'EMPLOYEE DROPDOWN AFTER FILTERING');
    });
  }

  onEmployeeSelect(event: any): void {
    this.empId = event.value;
    if (this.empId) {
      this.dataService.getSalaryDetails(this.empId).subscribe((response) => {
        if (response?.data?.length > 0) {
          this.employeeSalaryDetails = response.data[0];

          // Format the date as dd-MM-yyyy
          const rawDate = this.employeeSalaryDetails.PREV_REVISION_DATE;
          if (rawDate) {
            const dateObj = new Date(rawDate);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const year = dateObj.getFullYear();
            this.employeeSalaryDetails.PREV_REVISION_DATE = `${day}-${month}-${year}`;
          }

          // console.log(this.employeeSalaryDetails, 'SALARYDETAILSSSSSSS');

          this.salaryDetails = this.employeeSalaryDetails.SALARY_HEAD.map(
            (item: any) => ({
              code: item.HEAD_ID,
              description: item.DESCRIPTION,
              presentAmount: Number(item.PRESENT_AMOUNT),
            })
          );
        }
      });
    }
  }

  onIncreaseChange(event: any): void {
    const percent = event.value; // Use event.value directly
    if (this.salaryDetails && percent != null) {
      this.salaryDetails = this.salaryDetails.map((item: any) => {
        const present = item.presentAmount || 0;

        item.newAmount = +(present + (present * percent) / 100).toFixed(2);
        return item;
      });
    }
  }

  onSave(): void {
    // const empId = this.employeeSalaryDetails?.EMP_ID;

    if (!this.empId) {
      notify(
        {
          message: 'Please select an employee',
          position: { at: 'top center', my: 'top center' },
        },
        'error'
      );
      return;
    }

    if (!this.revisionFormData.EFFECT_DATE) {
      notify(
        {
          message: 'Please select an "Effective From Date" before saving.',
          position: { at: 'top center', my: 'top center' },
        },
        'error'
      );
      return;
    }
    const hasZeroPresent = this.salaryDetails.every(
      (item: any) => item.presentAmount === 0
    );

    if (hasZeroPresent) {
      notify(
        {
          message:
            'All components have 0 as Present Amount. Please enter at least one non-zero value before saving.',
          position: { at: 'top center', my: 'top center' },
        },
        'error'
      );
      return;
    }
    // Map the salaryDetails to REV_DETAIL
    const revisedDetails = this.salaryDetails.map((item: any) => ({
      HEAD_ID: item.code,
      PRESENT_AMOUNT: item.presentAmount,
      REVISED_AMOUNT: item.newAmount ?? item.presentAmount,
    }));
    if (this.revisionFormData.REV_DATE) {
      const revDate = this.revisionFormData.REV_DATE;
      this.revisionFormData.REV_DATE = new Date(
        Date.UTC(revDate.getFullYear(), revDate.getMonth(), revDate.getDate())
      );
    }

    if (this.revisionFormData.EFFECT_DATE) {
      const effectDate = this.revisionFormData.EFFECT_DATE;
      this.revisionFormData.EFFECT_DATE = new Date(
        Date.UTC(
          effectDate.getFullYear(),
          effectDate.getMonth(),
          effectDate.getDate()
        )
      );
    }
    // Update the revisionFormData object to match your desired payload structure
    this.revisionFormData.EMP_ID = this.empId;
    this.revisionFormData.USER_ID = 1; // Set actual user ID dynamically if needed
    this.revisionFormData.REV_DETAIL = revisedDetails;

    // Log final payload before sending
    // console.log('Final Payload:', this.revisionFormData);

    // Make the API call
    this.dataService.saveRevisionData(this.revisionFormData).subscribe(
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
    // console.log('CLOSED');

    this.popupClosed.emit();
  }

  onCancel() {}

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
    DxNumberBoxModule,
  ],
  providers: [],
  declarations: [PayRevisionAddComponent],
  exports: [PayRevisionAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PayRevisionAddModule {}
