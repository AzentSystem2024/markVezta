import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxDropDownBoxModule, DxFileUploaderModule, DxFormModule, DxNumberBoxModule, DxPopupModule, DxProgressBarModule, DxRadioGroupModule, DxSelectBoxModule, DxTabPanelModule, DxTabsModule, DxTagBoxModule, DxTextAreaModule, DxTextBoxModule, DxToolbarModule, DxValidatorModule } from 'devextreme-angular';
import { DxiGroupModule, DxiItemModule, DxoFormItemModule, DxoItemModule, DxoLookupModule, DxoSummaryModule } from 'devextreme-angular/ui/nested';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-esi',
  templateUrl: './esi.component.html',
  styleUrls: ['./esi.component.scss']
})
export class ESIComponent {
    gridData: any;
    months: any[] = [];
    selectedMonth: string;
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


getESIRegister(): void {
  const monthToUse =
    this.selectedMonth ||
    (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    })();

const payload = {
    Month: this.payloadDate || `${monthToUse}-01`,
   
  };
    this.dataService.getESIRegister(payload).subscribe((response: any) => {
    if (!response?.ESIDetails || response.ESIDetails.length === 0) {
      return; // nothing to show
    }

    const data = response.ESIDetails;
    // const data = []

  // ✅ Create PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();


   // --- Company Header ---
    doc.setFontSize(14);
    const companyName = this.selected_Company_name || "RADIANT FOOTCARE PVT LTD";
    let textWidth = doc.getTextWidth(companyName);
    doc.text(companyName, (pageWidth - textWidth) / 2, 30);

    doc.setFontSize(12);
    const reportTitle = `ESI Day Book for the month of ${monthToUse}`;
    textWidth = doc.getTextWidth(reportTitle);
    doc.text(reportTitle, (pageWidth - textWidth) / 2, 50);

    // --- Print Date & Page ---
    doc.setFontSize(10);
    const printedOn = `Printed On: ${new Date().toLocaleDateString()}`;
    doc.text(printedOn, 40, 70);
    const pageInfo = `Page 1 of 1`;
    const pageTextWidth = doc.getTextWidth(pageInfo);
    doc.text(pageInfo, pageWidth - pageTextWidth - 40, 70);

    // --- Table Headers ---
    const head = [
      ["ESI No.", "Staff Name", "Salary", "Employee Share", "Employer Share"],
    ];

    // --- Table Body ---
    const body = data.map((row: any) => [
      row.ESI_NO,
      row.Staff_Name,
      Number(row.Salary).toFixed(2),
      Number(row.Employee_Share).toFixed(2),
      Number(row.Employer_Share).toFixed(2),
    ]);

    // --- Totals ---
    const totals = {
      Salary: 0,
      Employee_Share: 0,
      Employer_Share: 0,
    };

    data.forEach((row: any) => {
      totals.Salary += Number(row.Salary) || 0;
      totals.Employee_Share += Number(row.Employee_Share) || 0;
      totals.Employer_Share += Number(row.Employer_Share) || 0;
    });

    const grandTotalRow :any[] = [
      { content: "GRAND TOTAL", colSpan: 2, styles: { halign: "center", fontStyle: "bold" as const } },
      totals.Salary.toFixed(2),
      totals.Employee_Share.toFixed(2),
      totals.Employer_Share.toFixed(2),
    ];

    // --- Generate Table ---
    autoTable(doc, {
      head,
      body,
      startY: 90,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 4, halign: "center", valign: "middle" },
      headStyles: { fillColor: [135, 206, 235], textColor: 20, fontStyle: "bold" },
      foot: [grandTotalRow],
      footStyles: { fillColor: [255, 255, 255], textColor: 20, fontStyle: "bold" },
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
  declarations: [ESIComponent],
  exports: [ESIComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ESIModule {}