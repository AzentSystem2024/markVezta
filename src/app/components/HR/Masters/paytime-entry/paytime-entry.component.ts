import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DxButtonModule, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxDateBoxModule, DxFormModule, DxNumberBoxModule, DxPopupModule, DxProgressBarModule, DxRadioGroupModule, DxSelectBoxModule, DxTextAreaModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { DxoFormItemModule, DxoItemModule } from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-paytime-entry',
  templateUrl: './paytime-entry.component.html',
  styleUrls: ['./paytime-entry.component.scss']
})
export class PaytimeEntryComponent {
  @ViewChild('dataGrid', { static: false }) dataGrid!: DxDataGridComponent;

    PayEntryList = [];
// PayEntryList = [
//   { EMP_NO: 'E001', EMP_NAME: 'John Doe', WORKING_DAYS: 22,AMOUNT:0 },
//   { EMP_NO: 'E002', EMP_NAME: 'Jane Smith', WORKING_DAYS: 20 ,AMOUNT:0},
//   { EMP_NO: 'E003', EMP_NAME: 'Ravi Kumar', WORKING_DAYS: 21 ,AMOUNT:0},
//   { EMP_NO: 'E004', EMP_NAME: 'Anita Nair', WORKING_DAYS: 23,AMOUNT:0 },
//   { EMP_NO: 'E005', EMP_NAME: 'Michael Lee', WORKING_DAYS: 19,AMOUNT:0 }
// ];

    readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
   selectedMonth: Date = new Date();
     calendarVisible = false;
      yearSelectorVisible = false;
       selectedYear: number;
        selectedRows: any[] = [];
        selectedMonthForAdd: string;
          monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  years: number[] = [];
  amountForm: any;
  newPopupAmount: boolean = false;
  amountModes = [
  { text: 'Copy amount to all', value: 'copy' },
  { text: 'Divide amount to all', value: 'divide' },
];
// filledAmount: number = null; // this will appear in toolbar number box
SalaryHead:any;
selectedSalaryHeadType:any;
CompanyID =1;

   constructor(private fb: FormBuilder, private dataservice: DataService,private router : Router) {
   this.get_SalaryHead_Dropdown();
   }

   ngOnInit(): void {
  this.amountForm = this.fb.group({
    amount: [0],
    mode: [''],
  });

  this.selectedYear = this.selectedMonth.getFullYear();
  this.get_SalaryHead_Dropdown();
  // this.get_PatimeEntry_list();
  // this.getPayTimeEntryList();
}


    goToPreviousMonth() {
    const currentDate = new Date(this.selectedMonth); // Ensure it's a Date object
    currentDate.setMonth(currentDate.getMonth() - 1);
    this.selectedMonth = currentDate;
    this.ApplyBulkRows()

  }

    goToNextMonth() {
    const currentDate = new Date(this.selectedMonth); // Ensure it's a Date object
    currentDate.setMonth(currentDate.getMonth() + 1);
    this.selectedMonth = currentDate;
    this.ApplyBulkRows();
  }


    outsideClickListener = (event: any) => {
    const calendarElement = document.querySelector('.calendar-popup');
    const labelElement = document.querySelector('.month-label');

    if (
      calendarElement &&
      !calendarElement.contains(event.target) &&
      labelElement &&
      !labelElement.contains(event.target)
    ) {
      this.calendarVisible = false;
      document.removeEventListener('click', this.outsideClickListener);
    }
  };

   toggleCalendar() {
    this.calendarVisible = !this.calendarVisible;

    if (this.calendarVisible) {
      setTimeout(() => {
        document.addEventListener('click', this.outsideClickListener);
      });
    } else {
      document.removeEventListener('click', this.outsideClickListener);
    }
  }

  
  toggleYearSelector() {
    this.yearSelectorVisible = !this.yearSelectorVisible;
  }

    selectYear(year: number, event: MouseEvent) {
    event.stopPropagation(); // Prevent calendar from closing
    this.selectedYear = year;
    this.yearSelectorVisible = false;
  }

    selectMonthByIndex(monthIndex: number) {
    this.selectedMonth = new Date(this.selectedYear, monthIndex, 1, 12); // Set the date to the 1st of the selected month
    this.onMonthChange({ value: this.selectedMonth }); // Pass the selected month to onMonthChange

      this.calendarVisible=false;

    // Hide calendar after selection (optional)
  }

    onMonthChange(event: any): void {
    const selectedDate = new Date(event.value);

    if (isNaN(selectedDate.getTime())) return;

    // Ensure the date is normalized to the first of the month at noon
    this.selectedMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1,
      12
    );

    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

    previousYear() {
    this.selectedYear--;
  }

  nextYear() {
    this.selectedYear++;
  }

      onSelectionChanged(e: any) {
  this.selectedRows = e.selectedRowKeys;
  console.log('User selected:', this.selectedRows);
}

onAddPopupClose(){

}
  CityClosePopup() {
    this.newPopupAmount = false;

  }

   onSalaryHeadChanged(event: any) {
    console.log(event,'event')
    this.selectedSalaryHeadType = event.value;
    console.log(this.selectedSalaryHeadType,'selected salary head id')
    this.get_SalaryHead_Dropdown()
    this.ApplyBulkRows();
  
  }

get_SalaryHead_Dropdown(){
  
  this.dataservice.SalaryHead_Dropdown().subscribe((res:any)=>{
  console.log('ac head dropdown',res);
  this.SalaryHead=res
})

}    


onEditorPreparing(e: any) {
  if (e.parentType === 'dataRow' && (e.dataField === 'DAYS' || e.dataField === 'AMOUNT')) {
    const isRowSelected = this.selectedRows?.some(
      selected => selected.EMP_ID === e.row?.data?.EMP_ID
    );

    e.editorOptions.disabled = !isRowSelected;
  }
}



AmountData() {
  if (this.amountForm.invalid) return;

  const amount = this.amountForm.value.amount;
  const mode = this.amountForm.get('mode')?.value;
  console.log(mode,'mode')

 const selectedEmpIds = this.selectedRows.map(row => row.EMP_ID);


  if (mode.value === 'copy') {
    console.log(mode.value,'mode')
    this.selectedRows.forEach((row) => {
      const entry = this.PayEntryList.find((e) => e.EMP_ID === row.EMP_ID);
      console.log(entry,'entry')
      if (entry) {
        entry.AMOUNT = amount;
      }
    });
  }
else if (mode.value === 'divide') {
  console.log(mode.value, 'divide mode');

  // Step 1: Get total working days of all selected employees
 const totalWorkingDays = this.selectedRows.reduce((sum, row) => {
  const entry = this.PayEntryList.find(e => e.EMP_ID === row.EMP_ID);
  return sum + Number(entry?.DAYS || 0);
}, 0);


  console.log(totalWorkingDays, 'total working days');

  if (totalWorkingDays === 0) {
    notify("Total working days is zero. Cannot divide.", "error", 3000);
    return;
  }

  // Step 2: Calculate amount per working day
  const perDayAmount = amount / totalWorkingDays;
  console.log(perDayAmount, 'amount per day');

  // Step 3: Assign amount to each selected employee
  this.selectedRows.forEach(row => {
    const entry = this.PayEntryList.find(e => e.EMP_ID === row.EMP_ID);
    if (entry && entry.DAYS) {
      entry.AMOUNT = Math.round(perDayAmount * entry.DAYS);
      console.log(`EMP_NO: ${entry.EMP_ID}, DAYS: ${entry.DAYS}, AMOUNT: ${entry.AMOUNT}`);
    }
  });
}


   // ✅ Step 2: Refresh grid and reselect rows
  this.dataGrid.instance.refresh().then(() => {
    this.dataGrid.instance.selectRows(selectedEmpIds, true);
  });
  // this.selectedRows=amount;

  this.newPopupAmount = false;     // Close popup
  this.amountForm.reset();         // Optional: clear popup value
}




FillAmount(){
  if (!this.selectedRows || this.selectedRows.length === 0) {
    notify('Please select at least one row.', 'warning', 2000);
    return;
  }

  this.newPopupAmount = true
}

ApplyBulkRows() {
   const payload = {
  COMPANY_ID: this.CompanyID,
  SAL_MONTH: `${this.selectedMonth.getFullYear()}-${(this.selectedMonth.getMonth() + 1).toString().padStart(2, '0')}-01`,
  HEAD_ID: this.selectedSalaryHeadType
};
    console.log(payload,'payload')
    this.dataservice.get_PaytimeEntry_list(payload).subscribe((response:any)=>{
      console.log(response,'response');
      this.PayEntryList = response.data || []

      
    })
  
}
 
Save(){

   // ❗ Check: If no rows are selected, stop save
  if (!this.selectedRows || this.selectedRows.length === 0) {
    notify(
      {
        message: 'Please select at least one employee to save.',
        position: { at: 'top right', my: 'top right' },
        displayTime: 2000,
      },
      'warning'
    );
    return;
  }

// ❗ Validate: Ensure all selected rows have valid AMOUNT and DAYS
  const invalidRows = this.selectedRows.filter(row => {
    return row.AMOUNT == null || row.AMOUNT === 0 || row.DAYS == null || row.DAYS === 0;
  });

  if (invalidRows.length > 0) {
    notify(
      {
        message: 'Amount and Working Days are required for all selected employees.',
        position: { at: 'top right', my: 'top right' },
        displayTime: 2000,
      },
      'error'
    );
    return; // Stop save
  }

    const payload ={
       COMPANY_ID: this.CompanyID,
      //  COMPANY_ID: Number(sessionStorage.getItem('COMPANY_ID')),
  SAL_MONTH: `${this.selectedMonth.getFullYear()}-${(this.selectedMonth.getMonth() + 1).toString().padStart(2, '0')}-01`,
  HEAD_ID: this.selectedSalaryHeadType,
 PAY_ENTRIES: this.selectedRows.map(row => ({
    EMP_ID: row.EMP_ID,
    AMOUNT: Number(row.AMOUNT),
    DAYS: Number(row.DAYS)
  }))
}
console.log(payload,'payload for saving')

       this.dataservice
      .Insert_PaytimeEntry(payload)
      .subscribe((res: any) => {
        console.log(res, 'response from saveEmployee');
        if (res.message === 'Success') {
          notify(
            {
              message: 'Employee Salary Settings saved successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success'
          );        
       
// ✅ Update the local data source manually
  // this.selectedRows.forEach(updatedRow => {
  //   const rowInGrid = this.PayEntryList.find(p => p.EMP_ID === updatedRow.EMP_ID);
  //   if (rowInGrid) {
  //     rowInGrid.AMOUNT = updatedRow.AMOUNT;
  //     rowInGrid.DAYS = updatedRow.DAYS;
  //   }
  // });

        } else {
          notify(
            {
              message: 'Failed to save Employee Salary Settings',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'error'
          );
        }
        
      });
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
    DxDataGridModule,
    DxButtonModule,
    DxoItemModule,
    DxoFormItemModule,
    DxValidatorModule,
    DxProgressBarModule,
    DxPopupModule,
    DxButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DxNumberBoxModule,
  ],
  providers: [],
  declarations: [PaytimeEntryComponent],
  exports: [PaytimeEntryComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PaytimeEntryModule {}