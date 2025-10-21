import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BrowserModule,
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
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
  DxTagBoxModule,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { VatReturnComponent } from 'src/app/pages/Vat Return/vat-return/vat-return.component';
import { DataService } from 'src/app/services';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}
@Component({
  selector: 'app-pay-slip',
  templateUrl: './pay-slip.component.html',
  styleUrls: ['./pay-slip.component.scss'],
})
export class PaySlipComponent {
  formatted_To_date: string;
  formatted_from_date: string;
  defaultDate: Date = new Date();
  selected_Company_id: any;
  selected_Company_name: any;
  financialYeaDate: any;
  selected_fin_id: any;
  months: any[] = [];
  selectedMonth: string;
  employeeList: any;
  EmployeeID: any;
  selectedEmployee: number[] = [];

  pdfSrc: SafeResourceUrl | null = null;
  payloadDate: string;
  pdfData: any;
  gridData: any;
  allSelected = false;

  constructor(
    private dataService: DataService,
    private sanitizer: DomSanitizer
  ) {
    this.sesstion_Details();
  }

  ngOnInit() {
    const currentYear = new Date().getFullYear();
    this.generateMonths(currentYear);
    this.GetEmployeeList();
  }

  getPaySlip(): void {
    if (!this.selectedEmployee || this.selectedEmployee.length === 0) return;

    const monthToUse =
      this.selectedMonth ||
      (() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
          2,
          '0'
        )}`;
      })();
    // Determine the month to display in PDF
    const monthToDisplay = this.payloadDate
      ? new Date(this.payloadDate)
      : new Date(`${monthToUse}-01T00:00:00.000Z`);

    const payload = {
      Month: this.payloadDate || `${monthToUse}-01T00:00:00.000Z`,
      EmployeeIDs: this.selectedEmployee,
    };

    this.dataService.getPaySlip(payload).subscribe((response: any) => {
      console.log(response, 'payslip response');
      if (!response?.PaySlipDetails?.length) return;

      const doc = new jsPDF();

      response.PaySlipDetails.forEach((emp: any, index: number) => {
        // --- Header ---
        doc.setFontSize(16);
        doc.text(this.selected_Company_name || 'Company Name', 105, 15, {
          align: 'center',
        });
        doc.setFontSize(12);
        doc.text(
          `Salary for the month of ${monthToDisplay.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}`,
          105,
          25,
          { align: 'center' }
        );
        doc.line(10, 30, 200, 30);
        // --- Employee Info ---
        doc.setFontSize(11);
        doc.text(`Name: ${emp.EMP_NAME}`, 14, 40);
        doc.text(`ID No: ${emp.EMP_CODE}`, 140, 40);
        doc.text(`PF Ac No: ${emp.PP_NO}`, 14, 50);
        doc.text(`ESI No: ${emp.DAMAN_NO || ''}`, 140, 50);
        doc.text(`Bank A/c: ${emp.BANK_AC_NO}`, 14, 60);
        doc.text(`OT hours: ${emp.OT_HOURS}`, 140, 60);
        doc.text(`Basic Salary: ${emp.BASIC_SALARY.toFixed(2)}`, 14, 70);
        doc.text(`Less hours: ${emp.LESS_HOURS}`, 140, 70);
        doc.text(`No. of days: ${emp.TOTAL_DAYS}`, 14, 80);

        // --- Earnings and Deductions Table ---
        const earnings = emp.SalaryHeads.filter((h: any) => h.HEAD_TYPE === 1);
        const deductions = emp.SalaryHeads.filter(
          (h: any) => h.HEAD_TYPE === 2
        );
        const totalEarnings = earnings.reduce(
          (sum, e) => sum + e.HEAD_AMOUNT,
          0
        );
        const totalDeductions = deductions.reduce(
          (sum, d) => sum + d.HEAD_AMOUNT,
          0
        );
        const netPay = totalEarnings - totalDeductions;
        autoTable(doc, {
          startY: 90,
          theme: 'grid',
          head: [['Earnings', 'Amount', 'Deductions', 'Amount']],
          body: Array.from({
            length: Math.max(earnings.length, deductions.length),
          }).map((_, i) => [
            earnings[i]?.HEAD_NAME || '',
            earnings[i]?.HEAD_AMOUNT?.toFixed(2) || '',
            deductions[i]?.HEAD_NAME || '',
            deductions[i]?.HEAD_AMOUNT?.toFixed(2) || '',
          ]),
          foot: [
            [
              {
                content: 'Gross Salary',
                styles: { halign: 'right', fontStyle: 'bold' },
              },
              {
                content: totalEarnings.toFixed(2),
                styles: { fontStyle: 'bold' },
              },
              {
                content: 'Total Deductions',
                styles: { halign: 'right', fontStyle: 'bold' },
              },
              {
                content: totalDeductions.toFixed(2),
                styles: { fontStyle: 'bold' },
              },
            ],
          ],
          styles: { fontSize: 10 },
        });
        const finalY = (doc as any).lastAutoTable?.finalY || 90;
        doc.setFontSize(12);
        doc.text(`Net Payable Salary: ${netPay.toFixed(2)}`, 190, finalY + 10, {
          align: 'right',
        });

        // --- Amount in Words ---
        // --- Amount in Words (aligned with table width) ---
        doc.setFontSize(10);

        // Get table boundaries
        const table = (doc as any).lastAutoTable;
        const tableStartX = table?.settings.margin.left || 10;
        const tableEndX =
          doc.internal.pageSize.getWidth() -
          (table?.settings.margin.right || 10);

        // Line above
        doc.line(tableStartX, finalY + 15, tableEndX, finalY + 15);

        // Text centered between table edges
        doc.text(
          `RUPEES ${this.numberToWords(netPay)} ONLY`,
          (tableStartX + tableEndX) / 2,
          finalY + 20,
          { align: 'center' }
        );

        // Line below
        doc.line(tableStartX, finalY + 23, tableEndX, finalY + 23);

        const footerY = finalY + 45; // adjust vertical spacing as needed

        // Left side: Verified By
        doc.setFontSize(11);
        doc.text('Verified By:', 14, footerY);
        doc.line(14, footerY + 8, 80, footerY + 8); // horizontal line for writing

        // Right side: Received By
        const rightX = 140;
        doc.text('Received By:', rightX, footerY);
        // doc.line(rightX, footerY + 6, rightX + 50, footerY + 6);

        doc.text('Signature:', rightX, footerY + 10);
        doc.line(rightX + 20, footerY + 10, rightX + 60, footerY + 10);

        doc.text('Date:', rightX, footerY + 20);
        doc.line(rightX + 15, footerY + 20, rightX + 60, footerY + 20);

        doc.text('Name:', rightX, footerY + 30);
        doc.line(rightX + 15, footerY + 30, rightX + 60, footerY + 30);
        // Add new page if not last employee
        if (index < response.PaySlipDetails.length - 1) doc.addPage();
      });

      // Convert to blob for iframe preview
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
  }

  // Helper to convert number to words (simple version)
  numberToWords(amount: number) {
    // You can use any library or implement conversion
    // For now, returning amount as string
    return amount.toLocaleString('en-IN', { style: 'decimal' });
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

  onMonthChange(e: any) {
    const [year, month] = e.value.split('-');
    this.selectedMonth = `${year}-${month}`;
    this.payloadDate = `${year}-${month}-09`;

    console.log('Dropdown Value:', this.selectedMonth);
    console.log('Payload Date:', this.payloadDate);
  }

  onEmployeeChange(e: any) {
    this.selectedEmployee = e.value;
    console.log(this.selectedEmployee, 'SELECTED EMPLOYEE');
  }

  GetEmployeeList() {
    this.dataService.getDropdownData('EMPLOYEE').subscribe((res) => {
      this.employeeList = res;
      console.log(this.employeeList, 'EMPLOYEELISTTTTTTTTTTTTTTT');
    });
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
  declarations: [PaySlipComponent],
  exports: [PaySlipComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PaySlipModule {}
