import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import { exportDataGrid as exportDataGridToXLSX } from 'devextreme/excel_exporter';
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver-es';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  onExporting(e: any, name: string) {
    if (e.format === 'pdf') {
      const doc = new jsPDF();
      exportDataGridToPdf({
        jsPDFDocument: doc,
        component: e.component,
      }).then(() => {
        doc.save(`${name}.pdf`);
      });
    } else {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet(name); // Use the name parameter here

      exportDataGridToXLSX({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(
            new Blob([buffer], { type: 'application/octet-stream' }),
            `${name}.xlsx`
          );
        });
      });
      e.cancel = true;
    }
  }
}