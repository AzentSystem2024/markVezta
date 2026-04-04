import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BrowserModule,
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxProgressBarModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTabPanelModule,
  DxTabsModule,
  DxTagBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidatorModule,
} from 'devextreme-angular';
import {
  DxiGroupModule,
  DxiItemModule,
  DxoFormItemModule,
  DxoItemModule,
  DxoLookupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-salary-wps',
  templateUrl: './salary-wps.component.html',
  styleUrls: ['./salary-wps.component.scss']
})
export class SalaryWPSComponent {

   gridData: any;
  months: any[] = [];
  PaySettings:any;
  selectedMonth: Date = new Date();
  payloadDate: string;
  pdfData: any;

  formatted_To_date: string;
  formatted_from_date: string;
  defaultDate: Date = new Date();
  selected_Company_id: any;
  selected_Company_name: any;
  financialYeaDate: any;
  selected_fin_id: any;
   
  department: any;

  employees: any[] = [];
  auto: string = 'auto';
  Department: any;
select_department_id: any;
 isFilterRowVisible: boolean = false;

 calendarVisible = false;
 selectedYear: number;
 selectedMonthForAdd: string;
 yearSelectorVisible = false;
years: number[] = [];
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
  labour_id: string;
  bankCode: string;
  currencyname: any;

  constructor(private dataService: DataService) {
    
  }

  // 🔹 Button click
  onShowClick() {
    this.loadEmployees();
  }

  ngOnInit(){
    console.log('calling')

    const today = new Date();
    this.selectedMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Previous month

    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    this.selectedYear = this.selectedMonth.getFullYear();

     const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.currencyname = sessionData.GeneralSettings.CODE
    console.log(this.currencyname)

    const payload = {
    NAME : 'DEPT',
    COMPANY_ID : this.selected_Company_id
  };

  console.log('Payload:', payload);

  this.dataService.Common_Dropdown(payload).subscribe(
    (res: any) => {
      console.log(' API Response:', res);
      this.Department = res.data || res;
    },
    (err) => {
      console.error(' API Error:', err);
    }
  );


  const payload1 ={
      COMPANY_ID : this.selected_Company_id
    }
    this.dataService.get_PaySettingsList(payload1).subscribe((res: any) => {
      this.PaySettings = res.data;
      this.labour_id = String(this.PaySettings.UQ_LABOUR_ID);
      this.bankCode = String(this.PaySettings.BANK_CODE)
      console.log(this.PaySettings)
    });
    this.sesstion_Details();
    this.Department_dropdown();
    this.get_PaySettingsList();
     this.generateYears();

  
  }

    get_PaySettingsList() {
    const payload ={
      COMPANY_ID : this.selected_Company_id
    }
    this.dataService.get_PaySettingsList(payload).subscribe((res: any) => {
      this.PaySettings = res.data;
      this.labour_id = String(this.PaySettings.UQ_LABOUR_ID);
      this.bankCode = String(this.PaySettings.BANK_CODE)
      console.log(this.PaySettings)
    });
  }

  sesstion_Details() {
    console.log('session calling')
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
    const sessionYear = sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;
    this.currencyname = sessionData.GeneralSettings.CODE

    this.formatted_from_date = this.financialYeaDate;
  }




    goToPreviousMonth() {
    const currentDate = new Date(this.selectedMonth); // Ensure it's a Date object
    currentDate.setMonth(currentDate.getMonth() - 1);
    this.selectedMonth = currentDate;   
  }

    goToNextMonth() {
    const currentDate = new Date(this.selectedMonth); // Ensure it's a Date object
    currentDate.setMonth(currentDate.getMonth() + 1);
    this.selectedMonth = currentDate;
  }

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

    generateYears() {
    const currentYear = new Date().getFullYear();
    this.years = [];

    for (let i = currentYear - 10; i <= currentYear + 1; i++) {
      this.years.push(i);
    }
  }

    selectMonthByIndex(monthIndex: number) {
    this.selectedMonth = new Date(this.selectedYear, monthIndex, 1, 12); // Set the date to the 1st of the selected month
    this.onMonthChange({ value: this.selectedMonth }); // Pass the selected month to onMonthChange

    this.calendarVisible = false;

    // Hide calendar after selection (optional)
  }

   onMonthandYearChanged(e: any) {
    if (e.value) {
      const updatedMonth = new Date(e.value);
      this.selectedMonth = new Date(
        updatedMonth.getFullYear(),
        updatedMonth.getMonth() - 1,
        1,
      );
      this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString(
        'en-US',
        { month: 'long', year: 'numeric' },
      );
    }
  }

    onMonthChange(event: any): void {
    const selectedDate = new Date(event.value);

    if (isNaN(selectedDate.getTime())) return;

    // Ensure the date is normalized to the first of the month at noon
    this.selectedMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1,
      12,
    );

    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

  }

  toggleYearSelector() {
    this.yearSelectorVisible = !this.yearSelectorVisible;
  }

    previousYear() {
    this.selectedYear--;
  }

  nextYear() {
    this.selectedYear++;
  }

    selectYear(year: number, event: MouseEvent) {
    event.stopPropagation(); // Prevent calendar from closing
    this.selectedYear = year;
    this.yearSelectorVisible = false;
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

  onCalendarClose() {
    this.calendarVisible = false;
  }

   Department_dropdown(){
  console.log(' Department dropdown triggered');

  const payload = {
    NAME : 'DEPT',
    COMPANY_ID : this.selected_Company_id
  };

  console.log('Payload:', payload);

  this.dataService.Common_Dropdown(payload).subscribe(
    (res: any) => {
      console.log(' API Response:', res);
      this.Department = res.data || res;
    },
    (err) => {
      console.error(' API Error:', err);
    }
  );
}

  
  // 🔹 Load employees from API (example)
  loadEmployees() {
    // Replace with your API

    const salMonth = this.formatDate(
  new Date(
    this.selectedMonth.getFullYear(),
    this.selectedMonth.getMonth(),
    1
  )
);
    const payload = {
      SAL_MONTH :salMonth,
     DEPARTMENT_ID: this.select_department_id ? String(this.select_department_id) : '',
      COMPANY_ID : this.selected_Company_id
    }
    this.dataService.SalaryWPSFile(payload)
      .subscribe((res: any) => {
        this.employees = res.data;
        this.generateSIF();
      });
  }

  //  MAIN FUNCTION
  generateSIF() {

    if (!this.employees || this.employees.length === 0) {
    notify('No data available', 'warning', 3000);
    return; //  stop execution
  }


    if (!this.PaySettings || this.PaySettings.length === 0) {
  alert('PaySettings not loaded');
  return;
}


    const now = new Date();
    console.log(now)
    const yy = now.getFullYear().toString().slice(-2);
    const MM = ('0' + (now.getMonth() + 1)).slice(-2);
    const dd = ('0' + now.getDate()).slice(-2);

    const HH = ('0' + now.getHours()).slice(-2);
    const mm = ('0' + now.getMinutes()).slice(-2);
    const fileTime = `${HH}${mm}`;
    console.log(fileTime)
    const fileName = `${this.labour_id}${yy}${MM}${dd}${HH}${mm}00.sif`;

    // Salary month start & end
    // Convert selectedMonth (YYYY-MM) → Date
const year = this.selectedMonth.getFullYear();
const month = this.selectedMonth.getMonth(); // already 0-based

const startDate = new Date(year, month, 1);
const endDate = new Date(year, month + 1, 0);

// JS month is 0-based (Jan = 0)
// const startDate = new Date(Number(year), Number(month) - 1, 1);
// const endDate = new Date(Number(year), Number(month), 0);

console.log('Start Date:', startDate);
console.log('End Date:', endDate);

    let rows: string[] = [];
    

    let totalEmployees = 0;
    let totalSalary = 0;

 this.employees.forEach(emp => {

  // Correct mapping from API
  const mol = this.padLeft(emp.MOL_NUMBER || '', 14);

  const bankCode = emp.BANK_CODE || '';
  const accountNumber = emp.BANK_AC_NO || '';

  const totalDays = emp.WORKED_DAYS || 0;
  const leaveDays = emp.LEAVE_DAYS || 0;

  // If WORKED_DAYS already correct → use directly
  const workingDaysFormatted = this.padLeft(totalDays, 2);

  const fixedSalary = Math.round(Number(emp.FIXED_SALARY) || 0);
  const variableSalary = Math.round(Number(emp.VARIABLE_SALARY) || 0);

  totalSalary += (fixedSalary + variableSalary);
  totalEmployees++;

  const row = [
    'EDR',
    mol,
    bankCode,
    accountNumber,
    this.formatDate(startDate),
    this.formatDate(endDate),
    workingDaysFormatted,
    fixedSalary.toString(),
    variableSalary.toString(),
    leaveDays.toString()
  ].join(',');

  rows.push(row);

  console.log('Employees:', this.employees);
console.log('PaySettings:', this.PaySettings);
console.log('File content:', rows);
});

    // 🔹 SCR ROW

    const labour = this.padLeft(this.labour_id || '', 13);

    const scrRow = [
      'SCR',
      labour,
      this.bankCode,
      this.formatDate(now),
      fileTime,
      totalEmployees,
      Math.round(totalSalary),
      this.currencyname
    ].join(',');

    if (this.employees && this.employees.length > 0) {
  rows.push(scrRow);
}

    const fileContent = rows.join('\n');

    this.downloadFile(fileContent, fileName);
  }

  // 🔹 Helpers

  padLeft(value: any, length: number): string {
    return value.toString().padStart(length, '0');
  }

  formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = ('0' + (date.getMonth() + 1)).slice(-2);
    const d = ('0' + date.getDate()).slice(-2);
    return `${y}-${m}-${d}`;
  }
  

downloadFile(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link); // VERY IMPORTANT
  link.click();

  document.body.removeChild(link); // cleanup
  window.URL.revokeObjectURL(url); // cleanup
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
    DxoSummaryModule,
    DxTagBoxModule,
  ],
  providers: [],
  declarations: [SalaryWPSComponent],
  exports: [SalaryWPSComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalaryWPSModule {}
