import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DomSanitizer,
  SafeResourceUrl } from '@angular/platform-browser';
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
  DxValidatorModule } from 'devextreme-angular';
import {
  DxiGroupModule,
  DxiItemModule,
  DxoFormItemModule,
  DxoItemModule,
  DxoLookupModule,
  DxoSummaryModule } from 'devextreme-angular/ui/nested';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-attendance-sheet',
  templateUrl: './attendance-sheet.component.html',
  styleUrls: ['./attendance-sheet.component.scss'] })
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
    this.onMonthChange({
      value: this.selectedMonth
    });
  }

  constructor(
    private dataService: DataService,
    private sanitizer: DomSanitizer,
  ) {
    this.sesstion_Details();
  }

  onMonthChange(e: any) {
    const selectedValue = e.value; // Example: 2026-10

    if (!selectedValue) return;

    const [year, month] = selectedValue.split('-').map(Number);

    this.selectedMonth = selectedValue;

    // First date of selected month
    this.formatted_from_date =
      `${year}-${String(month).padStart(2, '0')}-01`;

    // Last date of selected month
    const lastDay = new Date(year, month, 0).getDate();

    this.formatted_To_date =
      `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Month payload
    this.payloadDate = this.formatted_from_date;
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


  getAttendanceSheet(): void {
    const monthToUse =
      this.selectedMonth ||
      (() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      })();

    // Make sure dates are initialized
    const [year, month] = monthToUse.split('-').map(Number);

    const daysInMonth = new Date(year, month, 0).getDate();

    this.formatted_from_date =
      `${year}-${String(month).padStart(2, '0')}-01`;

    this.formatted_To_date =
      `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    const payload = {
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
      COMPANY_ID: this.selected_Company_id };

    this.dataService.getAttendanceSheet(payload).subscribe({
      next: (response: any) => {

        if (
          response?.Flag !== 1 ||
          !response?.AttendanceDetails ||
          response.AttendanceDetails.length === 0
        ) {
          console.log('No attendance data available');
          this.pdfSrc = null;
          return;
        }

        const data = response.AttendanceDetails;

        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'pt',
          format: 'a4' });

        const pageWidth = doc.internal.pageSize.getWidth();

        // Report title
        doc.setFontSize(14);
        const reportTitle = 'Attendance Sheet';

        doc.text(
          reportTitle,
          pageWidth / 2,
          30,
          { align: 'center' }
        );

        // Generate dynamic day headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const dynamicDays = Array.from(
          { length: daysInMonth },
          (_, i) => {
            const date = new Date(year, month - 1, i + 1);

            return `${i + 1}\n${dayNames[date.getDay()]}`;
          }
        );

        const head = [
          ['Staff ID', 'Staff Name', ...dynamicDays]
        ];

        // Map API response correctly
        const body = data.map((row: any) => [
          row.STAFF_ID,
          row.STAFF_NAME,
          ...Array.from(
            { length: daysInMonth },
            (_, i) => row[`Day${i + 1}`] ?? ''
          ),
        ]);

        // Generate PDF table
        autoTable(doc, {
          head: head,
          body: body,
          startY: 50,
          theme: 'grid',

          styles: {
            fontSize: 7,
            cellPadding: 3,
            halign: 'center',
            valign: 'middle',
            overflow: 'linebreak' },

          headStyles: {
            fillColor: [135, 206, 235],
            textColor: 20,
            fontStyle: 'bold' },

          columnStyles: {
            0: {
              cellWidth: 55 },
            1: {
              cellWidth: 100,
              halign: 'left' } },

          alternateRowStyles: {
            fillColor: [240, 240, 240] },

          margin: {
            left: 20,
            right: 20 } });

        // Preview PDF
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);

        this.pdfSrc =
          this.sanitizer.bypassSecurityTrustResourceUrl(url);
      },

      error: (error: any) => {
        console.error('Attendance API error:', error);
      } });
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.selected_Company_name = sessionData.SELECTED_COMPANY.COMPANY_NAME;
    const sessionYear = sessionData.FINANCIAL_YEARS;
    this.financialYeaDate = sessionYear[0].DATE_FROM;
    this.formatted_from_date = this.financialYeaDate;
    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
  }
}
