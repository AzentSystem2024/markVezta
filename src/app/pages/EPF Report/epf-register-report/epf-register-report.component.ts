// import { Component } from '@angular/core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  ViewChild,
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
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { DataService } from 'src/app/services';
import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
import autoTable, { CellDef } from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-epf-register-report',
  templateUrl: './epf-register-report.component.html',
  styleUrls: ['./epf-register-report.component.scss']
})
export class EPFRegisterReportComponent {

    gridData: any;
    months: any[] = [];
    selectedMonth: string;
    employeeList: any;
    EmployeeID: any;
    selectedEmployee: number[] = [];
    allSelected = false;
    payloadDate: string;
    pdfData: any;


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
    // this.GetEmployeeList();
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

getEPFRegister(): void {
  const monthToUse =
    this.selectedMonth ||
    (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    })();

  const payload = {
    Month: this.payloadDate || `${monthToUse}-01`,
  };

  this.dataService.getEPFRegister(payload).subscribe((response: any) => {
    console.log(response, 'wage register response');

    if (!response?.EPFDetails || response.EPFDetails.length === 0) {
      notify(
        { message: 'No EPF details found for selected month', position: { at: 'top right', my: 'top right' } },
        'error',
        3000
      );
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    // ====== HEADER ======
    doc.setFontSize(14);
    doc.text('RADIANT FOOTCARE PVT LTD', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`EPF Day Book for the month of ${this.selectedMonth}`, doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });

    // Print date
    const today = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Printed On: ${today}`, 40, 70);
    doc.text(`Page 1 of 1`, doc.internal.pageSize.getWidth() - 80, 70);

const columns = [
  { header: 'PF A/C No', dataKey: 'pf' },
  { header: 'Staff Name', dataKey: 'name' },
  { header: 'Salary', dataKey: 'salary' },
  { header: 'Employee Share', dataKey: 'empShare' },
  { header: 'A/C.01', dataKey: 'ac01' },
  { header: 'A/C.10', dataKey: 'ac10' }
];

const head = [
  [
    { content: 'PF A/C No', rowSpan: 2 },
    { content: 'Staff Name', rowSpan: 2 },
    { content: 'Salary', rowSpan: 2 },
    { content: 'Employee Share', rowSpan: 2 },
    { content: 'Employer Share', colSpan: 2, styles: { halign: 'center' as const } }
  ],
  [
    { content: 'A/C.01' },
    { content: 'A/C.10' }
  ]
];


const body = response.EPFDetails.map((e: any) => ({
  pf: e.PFAccountNo || '',
  name: e.EMP_NAME || '',
  salary: e.Salary?.toFixed(2) || '0.00',
  empShare: e.EmployeeShare?.toFixed(2) || '0.00',
  ac01: e.A_C_01?.toFixed(2) || '0.00',
  ac10: e.A_C_10?.toFixed(2) || '0.00'
}));


  // Calculate totals
  const totals = response.EPFDetails.reduce(
    (acc: any, e: any) => {
      acc.salary += e.Salary || 0;
      acc.empShare += e.EmployeeShare || 0;
      acc.ac01 += e.A_C_01 || 0;
      acc.ac10 += e.A_C_10 || 0;
      return acc;
    },
    { salary: 0, empShare: 0, ac01: 0, ac10: 0 }
  );

  // Add Grand Total row
  body.push({
    pf: '',
    name: 'Grand Total',
    salary: totals.salary.toFixed(2),
    empShare: totals.empShare.toFixed(2),
    ac01: totals.ac01.toFixed(2),
    ac10: totals.ac10.toFixed(2)
  });


 // Generate Table
  autoTable(doc, {
    startY: 90,
    head,
    body: body.map(b => Object.values(b)),
    columns,
    theme: 'grid',
    styles: { fontSize: 10, halign: 'center' as const, lineWidth: 0.5, lineColor: [0, 0, 0] },
    headStyles: { fillColor: [200, 220, 255], textColor: 0, halign: 'center' as const },
    columnStyles: {
      0: { halign: 'center' as const },
      1: { halign: 'left' as const },
      2: { halign: 'right' as const },
      3: { halign: 'right' as const },
      4: { halign: 'right' as const },
      5: { halign: 'right' as const }
    },
    didDrawCell: (data) => {
      // Highlight last row (Grand Total)
      if (data.row.index === body.length - 1) {
        doc.setFont('helvetica', 'bold');
      }
    }
  });

  // ===== FOOTER SUMMARY =====
    let finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const summary = [
      `EPF Contribution of Employee      :  ${totals.empShare.toFixed(2)}`,
      `EPF Contribution of Employer      :  ${totals.ac01.toFixed(2)}`,
      `Employees Pension Fund            :  ${totals.ac10.toFixed(2)}`,
      `A/C No. 21 (0.5%)                 :  1,160.24`,
      `Administrative Charges A/C . 2 0.85% :  1,972.00`,
      `A/C No. 22                        :  200.00`
    ];

    summary.forEach((line, i) => {
      doc.text(line, 60, finalY + i * 18);
    });
    // ====== PREVIEW ======
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
  ],
  providers: [],
  declarations: [EPFRegisterReportComponent],
  exports: [EPFRegisterReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EPFRegisterReportModule{}
