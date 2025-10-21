import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxDropDownBoxModule, DxFileUploaderModule, DxFormModule, DxNumberBoxModule, DxPopupModule, DxProgressBarModule, DxRadioGroupModule, DxSelectBoxModule, DxTabPanelModule, DxTabsModule, DxTagBoxModule, DxTextAreaModule, DxTextBoxModule, DxToolbarModule, DxValidatorModule } from 'devextreme-angular';
import { DxiGroupModule, DxiItemModule, DxoFormItemModule, DxoItemModule, DxoLookupModule, DxoSummaryModule } from 'devextreme-angular/ui/nested';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-attendance-sheet',
  templateUrl: './attendance-sheet.component.html',
  styleUrls: ['./attendance-sheet.component.scss']
})
export class AttendanceSheetComponent {
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


  getAttendanceSheet(): void{
    const monthToUse =
    this.selectedMonth ||
    (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    })();

const payload = {
    Month: this.payloadDate || `${monthToUse}-01`,
   
  };


    // ✅ Create PDF
   const doc = new jsPDF({
  orientation: "landscape",
  unit: "pt",
  format: "a4",
});

    const pageWidth = doc.internal.pageSize.getWidth();

     // --- Report Title ---
    doc.setFontSize(14);
    const reportTitle = "Reports - MMark Payroll";
    const textWidth = doc.getTextWidth(reportTitle);
    doc.text(reportTitle, (pageWidth - textWidth) / 2, 30);

   
    //   this.dataService.getAttendance(payload).subscribe((response: any) => {
    // if (!response?.AttendanceDetails || response.AttendanceDetails.length === 0) {
    //   return;
    // }

    //  const data = response.AttendanceDetails;

    const data = []

     // ✅ Parse year & month
    const [year, month] = monthToUse.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate(); // total days in month

    // ✅ Generate header with day + weekday
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dynamicDays = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month - 1, i + 1);
      return `${i + 1}\n${dayNames[date.getDay()]}`;
    });

    const head = [["Staff Id", "Name", ...dynamicDays]];

    // ✅ Table Body
    const body = data.map((row: any) => [
      row.StaffId,
      row.Name,
      ...row.Attendance, // must have attendance marks for each day
    ]);

    // --- Generate Table ---
    autoTable(doc, {
      head,
      body,
      startY: 60,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [135, 206, 235], // dark blue
        textColor: 20, // white text
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240], // light grey
      },
    });

    // Convert PDF to blob & preview
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  // });
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
  declarations: [AttendanceSheetComponent],
  exports: [AttendanceSheetComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AttendanceSheetModule {}