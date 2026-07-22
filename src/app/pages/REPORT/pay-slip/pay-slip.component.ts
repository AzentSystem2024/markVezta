import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  OnInit,
} from '@angular/core';
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
import { DataService } from 'src/app/services';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import notify from 'devextreme/ui/notify';

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}

@Component({
  selector: 'app-pay-slip',
  templateUrl: './pay-slip.component.html',
  styleUrls: ['./pay-slip.component.scss'],
})
export class PaySlipComponent implements OnInit {
  // ================= State Properties =================
  selected_Company_id: any;
  selected_Company_name: any;
  months: any[] = [];
  selectedMonth: string | undefined;
  employeeList: any;
  selectedEmployee: number[] = [];
  payloadDate: string | undefined;
  pdfSrc: SafeResourceUrl | null = null;
  gridData: any[] = [];
  allSelected = false;
  currencyName: string = '';

  constructor(
    private dataService: DataService,
    private sanitizer: DomSanitizer,
  ) {
    this.sesstion_Details();
  }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.generateMonths(currentYear);
    this.GetEmployeeList();
  }

  // ================= Core Logic =================
  getPaySlip(): void {
    if (!this.selectedEmployee || this.selectedEmployee.length === 0) {
      notify('Please select at least one employee.', 'warning', 2000);
      return;
    }

    const monthToUse =
      this.selectedMonth ||
      (() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      })();

    // Determine the month to display in PDF
    const monthToDisplay = this.payloadDate
      ? new Date(this.payloadDate)
      : new Date(`${monthToUse}-01T00:00:00.000Z`);

    const payload = {
      Month: this.payloadDate || `${monthToUse}-01T00:00:00.000Z`,
      EmployeeIDs: this.selectedEmployee,
      COMPANY_ID: this.selected_Company_id,
    };

    this.dataService.getPaySlip(payload).subscribe((response: any) => {
      if (!response?.PaySlipDetails || response.PaySlipDetails.length === 0) {
        notify('No data found.', 'warning', 2000);
        return;
      }

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
          { align: 'center' },
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
        doc.text(
          `Basic Salary: ${this.formatCurrency(emp.BASIC_SALARY)}`,
          14,
          70,
        );
        doc.text(`Less hours: ${emp.LESS_HOURS}`, 140, 70);
        doc.text(`No. of days: ${emp.TOTAL_DAYS}`, 14, 80);

        // --- Earnings and Deductions Table ---
        const earnings = emp.SalaryHeads.filter((h: any) => h.HEAD_TYPE === 1);
        const deductions = emp.SalaryHeads.filter(
          (h: any) => h.HEAD_TYPE === 2 || h.HEAD_TYPE === 3,
        );
        const totalEarnings = earnings.reduce(
          (sum: any, e: any) => sum + e.HEAD_AMOUNT,
          0,
        );
        const totalDeductions = deductions.reduce(
          (sum: any, d: any) => sum + d.HEAD_AMOUNT,
          0,
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
            earnings[i]?.HEAD_AMOUNT != null
              ? this.formatCurrency(earnings[i].HEAD_AMOUNT)
              : '',
            deductions[i]?.HEAD_NAME || '',
            deductions[i]?.HEAD_AMOUNT != null
              ? this.formatCurrency(deductions[i].HEAD_AMOUNT)
              : '',
          ]),
          foot: [
            [
              {
                content: 'Gross Salary',
                styles: { halign: 'right', fontStyle: 'bold' },
              },
              {
                content: this.formatCurrency(totalEarnings),
                styles: { fontStyle: 'bold' },
              },
              {
                content: 'Total Deductions',
                styles: { halign: 'right', fontStyle: 'bold' },
              },
              {
                content: this.formatCurrency(totalDeductions),
                styles: { fontStyle: 'bold' },
              },
            ],
          ],
          styles: { fontSize: 10 },
        });

        const finalY = (doc as any).lastAutoTable?.finalY || 90;
        doc.setFontSize(12);
        doc.text(
          `Net Payable Salary: ${this.formatCurrency(netPay)}`,
          190,
          finalY + 10,
          { align: 'right' },
        );

        // --- Amount in Words (aligned with table width) ---
        doc.setFontSize(10);

        const table = (doc as any).lastAutoTable;
        const tableStartX = table?.settings.margin.left || 10;
        const tableEndX =
          doc.internal.pageSize.getWidth() -
          (table?.settings.margin.right || 10);

        doc.line(tableStartX, finalY + 15, tableEndX, finalY + 15);

        doc.text(
          this.numberToWords(netPay),
          (tableStartX + tableEndX) / 2,
          finalY + 20,
          { align: 'center' },
        );

        doc.line(tableStartX, finalY + 23, tableEndX, finalY + 23);

        // --- Footer signatures ---
        const footerY = finalY + 45;
        doc.setFontSize(11);
        doc.text('Verified By:', 14, footerY);
        doc.line(14, footerY + 8, 80, footerY + 8);

        const rightX = 140;
        doc.text('Received By:', rightX, footerY);

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

  // ================= Event Handlers =================
  onMonthChange(e: any): void {
    const [year, month] = e.value.split('-');
    this.selectedMonth = `${year}-${month}`;
    this.payloadDate = `${year}-${month}-09`;
  }

  onEmployeeChange(e: any): void {
    this.selectedEmployee = e.value;
  }

  handleSelection(e: any, tagBox: any): void {
    const selectedCount = e.component.option('value').length;
    this.allSelected = selectedCount === this.employeeList.length;

    if (this.allSelected) {
      const allIds = this.employeeList.map((item: any) => item.ID);
      tagBox.option('value', allIds);
      tagBox.option('displayValue', 'All Employees Selected');
    } else {
      tagBox.option('displayValue', null);
    }
  }

  // ================= Helper Methods =================
  private generateMonths(year: number): void {
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
        value: `${year}-${formattedMonth}`,
      });
    }

    const now = new Date();
    this.selectedMonth =
      this.selectedMonth ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private GetEmployeeList(): void {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      Name: 'EMP PAYSLIP',
    };
    this.dataService.getDropdownData(payload).subscribe((res) => {
      this.employeeList = res;
    });
  }

  private sesstion_Details(): void {
    const savedData = sessionStorage.getItem('savedUserData');
    if (savedData) {
      const sessionData = JSON.parse(savedData);
      this.selected_Company_id = sessionData?.SELECTED_COMPANY?.COMPANY_ID;
      this.selected_Company_name = sessionData?.SELECTED_COMPANY?.COMPANY_NAME;

      const generalSettings = sessionData?.GeneralSettings;
      if (Array.isArray(generalSettings) && generalSettings.length > 0) {
        this.currencyName = generalSettings[0].CURRENCY_NAME;
      } else if (generalSettings) {
        this.currencyName = generalSettings.CURRENCY_NAME;
      }
    }
  }

  private formatCurrency(amount: number): string {
    if (amount === undefined || amount === null) return '';
    if (this.currencyName === 'Arab Emirates Dirham') {
      return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else {
      return amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }

  private numberToWords(amount: number): string {
    const a = [
      '',
      'ONE',
      'TWO',
      'THREE',
      'FOUR',
      'FIVE',
      'SIX',
      'SEVEN',
      'EIGHT',
      'NINE',
      'TEN',
      'ELEVEN',
      'TWELVE',
      'THIRTEEN',
      'FOURTEEN',
      'FIFTEEN',
      'SIXTEEN',
      'SEVENTEEN',
      'EIGHTEEN',
      'NINETEEN',
    ];
    const b = [
      '',
      '',
      'TWENTY',
      'THIRTY',
      'FORTY',
      'FIFTY',
      'SIXTY',
      'SEVENTY',
      'EIGHTY',
      'NINETY',
    ];

    const getHundreds = (val: string) => {
      let res = '';
      if (Number(val[0]) !== 0) res += a[Number(val[0])] + ' HUNDRED ';
      let tens = Number(val.substring(1, 3));
      if (tens !== 0) {
        if (res !== '') res += 'AND ';
        res +=
          (a[tens] ||
            b[Number(val[1])] +
              (Number(val[2]) ? ' ' + a[Number(val[2])] : '')) + ' ';
      }
      return res;
    };

    let parts = amount.toFixed(2).split('.');
    let numStr = parts[0];
    let fractionStr = parts[1];
    let isAED = this.currencyName === 'Arab Emirates Dirham';

    const getWords = (numStr: string, isAED: boolean) => {
      if (numStr === '0') return 'ZERO';
      let str = '';
      if (isAED) {
        let n = ('000000000' + numStr)
          .substr(-9)
          .match(/^(\d{3})(\d{3})(\d{3})$/);
        if (!n) return '';
        str += Number(n[1]) !== 0 ? getHundreds(n[1]) + 'MILLION ' : '';
        str += Number(n[2]) !== 0 ? getHundreds(n[2]) + 'THOUSAND ' : '';
        str += Number(n[3]) !== 0 ? getHundreds(n[3]) : '';
      } else {
        let n = ('000000000' + numStr)
          .substr(-9)
          .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return '';
        str +=
          Number(n[1]) !== 0
            ? (a[Number(n[1])] ||
                b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + ' CRORE '
            : '';
        str +=
          Number(n[2]) !== 0
            ? (a[Number(n[2])] ||
                b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + ' LAKH '
            : '';
        str +=
          Number(n[3]) !== 0
            ? (a[Number(n[3])] ||
                b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + ' THOUSAND '
            : '';
        str +=
          Number(n[4]) !== 0
            ? (a[Number(n[4])] ||
                b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + ' HUNDRED '
            : '';
        str +=
          Number(n[5]) !== 0
            ? (str !== '' ? 'AND ' : '') +
              (a[Number(n[5])] ||
                b[Number(n[5][0])] +
                  (Number(n[5][1]) ? ' ' + a[Number(n[5][1])] : ''))
            : '';
      }
      return str.trim();
    };

    let mainCurrency = isAED ? 'DIRHAMS' : 'RUPEES';
    let subCurrency = isAED ? 'FILS' : 'PAISE';

    let mainWords = getWords(numStr, isAED);
    let fractionWords =
      fractionStr !== '00'
        ? getWords(Number(fractionStr).toString(), isAED)
        : '';

    if (fractionWords && fractionWords !== 'ZERO') {
      return `${mainWords} AND ${fractionWords} ${subCurrency} ${mainCurrency} ONLY`;
    }
    return `${mainWords} ${mainCurrency} ONLY`;
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
