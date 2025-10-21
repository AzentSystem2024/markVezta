import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxDropDownBoxModule, DxFileUploaderModule, DxFormModule, DxNumberBoxModule, DxPopupModule, DxProgressBarModule, DxRadioGroupModule, DxSelectBoxModule, DxTabPanelModule, DxTabsModule, DxTagBoxModule, DxTextAreaModule, DxTextBoxModule, DxToolbarModule, DxValidatorModule } from 'devextreme-angular';
import { DxiGroupModule, DxiItemModule, DxoFormItemModule, DxoItemModule, DxoLookupModule, DxoSummaryModule } from 'devextreme-angular/ui/nested';
import DataSource from 'devextreme/data/data_source';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-wage-register',
  templateUrl: './wage-register.component.html',
  styleUrls: ['./wage-register.component.scss']
})
export class WageRegisterComponent {
    gridData: any;
    months: any[] = [];
    selectedMonth: string;
    employeeList: any;
    EmployeeID: any;
    selectedEmployee: number[] = [];
    allSelected = false;
    payloadDate: string;
    pdfData: any;
    // ReportType:[{id:1,Description:'Wages'}, {id: 2,Description:'Salary'}];
    selectedReport: any;
    reportTypesDataSource = new DataSource({
    store: [
      { id: 'Wages', name: 'Wages Report' },
      { id: 'Salary', name: 'Salary Report' }
    ]
  });

  formatted_To_date: string;
  formatted_from_date: string;
  defaultDate: Date = new Date();
  selected_Company_id: any;
  selected_Company_name: any;
  financialYeaDate: any;
  selected_fin_id: any;
    
    pdfSrc: SafeResourceUrl | null = null;

     ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.generateMonths(currentYear);
    this.GetEmployeeList();
  }

    constructor(
      private dataService: DataService,
      private sanitizer: DomSanitizer
    ) {
      this.sesstion_Details();
    }

      onMonthChange(e: any) {
    const [year, month] = e.value.split('-');
    this.selectedMonth = `${year}-${month}`;
    this.payloadDate = `${year}-${month}-09`;

    console.log('Dropdown Value:', this.selectedMonth);
    console.log('Payload Date:', this.payloadDate);
  }

    generateMonths(year: number) {
    this.months = [];
    const monthNames = [
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

    for (let i = 0; i < 12; i++) {
      const formattedMonth = String(i + 1).padStart(2, '0');
      this.months.push({
        name: `${monthNames[i]} ${year}`,
        value: `${year}-${formattedMonth}`, // YYYY-MM
      });
    }

    // default selected month in YYYY-MM
    const now = new Date();
    this.selectedMonth =
      this.selectedMonth ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

    handleSelection(e: any, tagBox: any) {
    const selectedCount = e.component.option('value').length;
    this.allSelected = selectedCount === this.employeeList.length;

    if (this.allSelected) {
      // Replace displayed tags with a single summary
      const allIds = this.employeeList.map((item: any) => item.ID);
      tagBox.option('value', allIds); // keep all selected internally
      tagBox.option('displayValue', 'All Employees Selected'); // summary text
    } else {
      tagBox.option('displayValue', null); // show normal tags
    }
  }

    GetEmployeeList() {
    this.dataService.getDropdownData('EMPLOYEE').subscribe((res) => {
      this.employeeList = res;
      console.log(this.employeeList, 'EMPLOYEELISTTTTTTTTTTTTTTT');
    });
  }


//  getWageRegister(): void {
//     const monthToUse =
//       this.selectedMonth ||
//       (() => {
//         const now = new Date();
//         return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
//       })();

//     const payload = {
//       Month: this.payloadDate || `${monthToUse}-01`,
//       ReportType: this.selectedReport,
//     };

//     this.dataService.getWageRegister(payload).subscribe((response: any) => {
//       console.log(response, 'wage register response');

//       if (
//   (!response?.WageDetails || response.WageDetails.length === 0) 
  
// ) {
//   return; // nothing to show
// }


//       const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

//       // Header
//       doc.setFontSize(14);
//    const pageWidth = doc.internal.pageSize.getWidth();

// // --- Centered Headings ---
// doc.setFontSize(14);
// const formXiText = 'FORM XI';
// let textWidth = doc.getTextWidth(formXiText);
// doc.text(formXiText, (pageWidth - textWidth) / 2, 30);

// const reportHeading =
//   this.selectedReport === 'Salary'
//     ? 'REGISTER OF SALARY [Rule 29(1)]'
//     : 'REGISTER OF WAGES [Rule 29(1)]';

// doc.setFontSize(16);
// textWidth = doc.getTextWidth(reportHeading);
// doc.text(reportHeading, (pageWidth - textWidth) / 2, 50);

// // --- Left & Right Sub-Headings ---
// const reportTitle =
//   this.selectedReport === 'Salary' ? 'Salary Register' : 'Wage Register';

// doc.setFontSize(12);
// const subHeadingY = 75; // leave some gap below main heading

// // Left-aligned: Report Title
// doc.text(`${reportTitle} for the month of ${monthToUse}`, 40, subHeadingY);

// // Right-aligned: Establishment Name
// const establishmentText = `Name of Establishment: ${this.selected_Company_name}`;
// const estTextWidth = doc.getTextWidth(establishmentText);
// doc.text(establishmentText, pageWidth - estTextWidth - 40, subHeadingY);

//       // Table headers
//     const head = [
//   [
//     { content: 'Sl.No', rowSpan: 2 },
//     { content: 'Name of the Employee', rowSpan: 2 },
//     { content: 'Father/Husband name', rowSpan: 2 },
//     { content: 'Designation', rowSpan: 2 },
//     { content: 'Minimum rate of wages payable', colSpan: 2 },
//     { content: 'Rate of wages actually paid', colSpan: 2 },
//     { content: 'Total attendance units of workdone', rowSpan: 2 },
//     { content: 'Overtime Worked', rowSpan: 2 },
//     { content: 'Gross wages payable', rowSpan: 2 },
//     { content: 'Deductions', colSpan: 4 },
//     { content: 'Wages paid', rowSpan: 2 },
//     { content: 'date of payment', rowSpan: 2 },
//     { content: 'Signature/Thumb impression of employee', rowSpan: 2 }
//   ],
//   [
//     { content: 'Basic' },
//     { content: 'DA' },
//     { content: 'Basic' },
//     { content: 'DA' },
//     { content: 'Employee contribution of PF' },
//     { content: 'HR' },
//     { content: 'Other Deductions' },
//     { content: 'Total Deductions' }
//   ]
// ];


//       // Table body (map API response)
//       const body = response.WageDetails.map((row: any) => [
//         row.SL_NO,
//         row.EMP_NAME,
//         row.FATHER_NAME || '',
//         row.DESIGNATION || '',
//         row.MIN_BASIC || '',
//         row.MIN_DA || '',
//         row.ACTUAL_BASIC || '',
//         row.ACTUAL_DA || '',
//         row.TOTAL_DAYS || '',
//         row.OVERTIME || '',
//         row.GROSS_WAGES || '',
//         row.PF || '',
//         row.HR || '',
//         row.OTHER_DEDUCTIONS || '',
//         row.TOTAL_DEDUCTIONS || '',
//         row.WAGES_PAID || '',
//         row.PAYMENT_DATE || '',
//         ''
//       ]);

//       // Generate table
//       autoTable(doc, {
//         head,
//         body,
//         startY: 90,
//         styles: { fontSize: 8, cellPadding: 4, halign: 'center', valign: 'middle' },
//         headStyles: { fillColor: [135, 206, 235], textColor: 0, fontStyle: 'bold' },
//         theme: 'grid',
//       });

//       // Convert PDF to blob & preview in iframe
//       const blob = doc.output('blob');
//       const url = URL.createObjectURL(blob);
//       this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
//     });

//   }




//   getWageRegister(): void{

// // if (!this.selectedEmployee || this.selectedEmployee.length === 0) return;
//  const monthToUse =
//       this.selectedMonth ||
//       (() => {
//         const now = new Date();
//         return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
//           2,
//           '0'
//         )}`;
//       })();

//        // Determine the month to display in PDF
//     const monthToDisplay = this.payloadDate
//       ? new Date(this.payloadDate)
//       : new Date(`${monthToUse}-01`);

//       const payload = {
//       Month: this.payloadDate || `${monthToUse}-01`,
//       ReportType: this.selectedReport,
//     };

//      this.dataService.getWageRegister(payload).subscribe((response: any) => {
//       console.log(response, 'wage register response');
//       if (!response?.WageRegisterDetails?.length) return;

//       const doc = new jsPDF();
    
//       response.WageRegisterDetails.forEach((emp: any, index: number) => {

//       })

      
    

//       const blob = doc.output('blob');
//       const url = URL.createObjectURL(blob);
//       this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
//      })
//   }


getWageRegister(): void {
  const monthToUse =
    this.selectedMonth ||
    (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    })();

  const payload = {
    Month: this.payloadDate || `${monthToUse}-01`,
    ReportType: this.selectedReport,
  };

  this.dataService.getWageRegister(payload).subscribe((response: any) => {
    console.log(response, 'wage register response');

    let data: any[] = [];

    // ✅ Select dataset based on report type
    if (this.selectedReport === 'Wages') {
      if (!response?.WageDetails || response.WageDetails.length === 0) {
        return; // nothing to show
      }
      data = response.WageDetails;
    } else if (this.selectedReport === 'Salary') {
      if (!response?.SalaryDetails || response.SalaryDetails.length === 0) {
        return; // nothing to show
      }
      data = response.SalaryDetails;
    }

    // ✅ Now generate the PDF with common logic
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Centered Headings ---
    doc.setFontSize(14);
    const formXiText = '';
    let textWidth = doc.getTextWidth(formXiText);
    doc.text(formXiText, (pageWidth - textWidth) / 2, 30);

    const reportHeading =
      this.selectedReport === 'Salary'
        ? 'REGISTER OF SALARY [Rule 29(1)]'
        : 'REGISTER OF WAGES [Rule 29(1)]';

    doc.setFontSize(16);
    textWidth = doc.getTextWidth(reportHeading);
    doc.text(reportHeading, (pageWidth - textWidth) / 2, 50);

    // --- Left & Right Sub-Headings ---
    const reportTitle =
      this.selectedReport === 'Salary' ? 'Salary Register' : 'Wage Register';

    doc.setFontSize(12);
    const subHeadingY = 75;

    // Left side: Report Title
    doc.text(`${reportTitle} for the month of ${monthToUse}`, 40, subHeadingY);

    // Right side: Dynamic Company Name
    const establishmentText = `Name of Establishment: ${this.selected_Company_name}`;
    const estTextWidth = doc.getTextWidth(establishmentText);
    doc.text(establishmentText, pageWidth - estTextWidth - 40, subHeadingY);

    // --- Table Headers (same for both Wages/Salary, adjust if needed) ---
    const head = [
      [
        { content: 'Sl.No', rowSpan: 2 },
        { content: 'Name of the Employee', rowSpan: 2 },
        { content: 'Father/Husband name', rowSpan: 2 },
        { content: 'Designation', rowSpan: 2 },
        { content: 'Minimum rate of wages payable', colSpan: 2 },
        { content: 'Rate of wages actually paid', colSpan: 2 },
        { content: 'Total attendance units of workdone', rowSpan: 2 },
        { content: 'Overtime Worked', rowSpan: 2 },
        { content: 'Gross wages payable', rowSpan: 2 },
        { content: 'Deductions', colSpan: 4 },
        { content: 'Wages paid', rowSpan: 2 },
        { content: 'date of payment', rowSpan: 2 },
        { content: 'Signature/Thumb impression of employee', rowSpan: 2 }
      ],
      [
        { content: 'Basic' },
        { content: 'DA' },
        { content: 'Basic' },
        { content: 'DA' },
        { content: 'Employee contribution of PF' },
        { content: 'HR' },
        { content: 'Other Deductions' },
        { content: 'Total Deductions' }
      ]
    ];

    // --- Table Body ---
    const body = data.map((row: any) => [
  row.SL_NO,
  row.EMP_NAME,
  row.FATHER_NAME || '',
  row.DESIGNATION || '',
  Number(row.MINIMUM_RATE_OF_WAGES_PAYABLE_BASIC) || 0,
  Number(row.MINIMUM_RATE_OF_WAGES_PAYABLE_DA) || 0,
  Number(row.RATE_OF_WAGES_ACTUALLY_PAID_BASIC) || 0,
  Number(row.RATE_OF_WAGES_ACTUALLY_PAID_DA) || 0,
  Number(row.TOTAL_ATTENDANCE_UNITS_OF_WORK_DONE) || 0,
  Number(row.OVERTIME_WORKED) || 0,
  Number(row.GROSS_WAGES_PAYABLE) || 0,
  Number(row.EMPLOYEE_CONTRIBUTION_TO_PF) || 0,
  Number(row.HR) || 0,
  Number(row.OTHER_DEDUCTIONS) || 0,
  Number(row.TOTAL_DEDUCTIONS) || 0,
  Number(row.WAGES_PAID) || 0,
  row.PAYMENT_DATE || '',
  ''
]);

// --- Calculate Grand Totals ---
const totals = {
  MIN_BASIC: 0,
  MIN_DA: 0,
  ACTUAL_BASIC: 0,
  ACTUAL_DA: 0,
  ATTENDANCE: 0,
  OVERTIME: 0,
  GROSS: 0,
  PF: 0,
  HR: 0,
  OTHER: 0,
  TOTAL_DED: 0,
  WAGES: 0,
};

data.forEach((row: any) => {
  totals.MIN_BASIC += Number(row.MINIMUM_RATE_OF_WAGES_PAYABLE_BASIC) || 0;
  totals.MIN_DA += Number(row.MINIMUM_RATE_OF_WAGES_PAYABLE_DA) || 0;
  totals.ACTUAL_BASIC += Number(row.RATE_OF_WAGES_ACTUALLY_PAID_BASIC) || 0;
  totals.ACTUAL_DA += Number(row.RATE_OF_WAGES_ACTUALLY_PAID_DA) || 0;
  totals.ATTENDANCE += Number(row.TOTAL_ATTENDANCE_UNITS_OF_WORK_DONE) || 0;
  totals.OVERTIME += Number(row.OVERTIME_WORKED) || 0;
  totals.GROSS += Number(row.GROSS_WAGES_PAYABLE) || 0;
  totals.PF += Number(row.EMPLOYEE_CONTRIBUTION_TO_PF) || 0;
  totals.HR += Number(row.HR) || 0;
  totals.OTHER += Number(row.OTHER_DEDUCTIONS) || 0;
  totals.TOTAL_DED += Number(row.TOTAL_DEDUCTIONS) || 0;
  totals.WAGES += Number(row.WAGES_PAID) || 0;
});

// --- Grand Total Row ---
const grandTotalRow: any[] = [
  { content: 'GRAND TOTAL', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold' as const } },
  totals.MIN_BASIC.toFixed(2),
  totals.MIN_DA.toFixed(2),
  totals.ACTUAL_BASIC.toFixed(2),
  totals.ACTUAL_DA.toFixed(2),
  totals.ATTENDANCE.toFixed(2),
  totals.OVERTIME.toFixed(2),
  totals.GROSS.toFixed(2),
  totals.PF.toFixed(2),
  totals.HR.toFixed(2),
  totals.OTHER.toFixed(2),
  totals.TOTAL_DED.toFixed(2),
  totals.WAGES.toFixed(2),
  '', // Payment Date
  ''  // Signature
];


    autoTable(doc, {
      head,
      body,
      startY: 90,
      styles: { fontSize: 8, cellPadding: 4, halign: 'center', valign: 'middle',lineWidth: 0.5,lineColor: [0, 0, 0], },
      headStyles: { fillColor: [135, 206, 235], textColor: 0, fontStyle: 'bold' },
      theme: 'grid',
      foot: [grandTotalRow], // ✅ Add footer row
  footStyles: { fillColor: [255, 255, 255], textColor: 20, fontStyle: 'bold' }
    });

    // Convert PDF to blob & preview
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });
}


    sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(sessionData, '=================session data==========');

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id=============='
    );
    this.selected_Company_name = sessionData.SELECTED_COMPANY.COMPANY_NAME;
    const sessionYear = sessionData.FINANCIAL_YEARS;
    console.log(sessionYear, '==================session year==========');
    this.financialYeaDate = sessionYear[0].DATE_FROM;
    console.log(
      this.financialYeaDate,
      '=========================date=[[[[[[[[[[[[[[[[[[[[[[[[[['
    );

    this.formatted_from_date = this.financialYeaDate;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;

    console.log(
      this.selected_fin_id,
      '===========selected fin id==================='
    );
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
  declarations: [WageRegisterComponent],
  exports: [WageRegisterComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WageRegisterModule {}
