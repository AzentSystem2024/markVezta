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
import autoTable from 'jspdf-autotable';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-vat-return',
  templateUrl: './vat-return.component.html',
  styleUrls: ['./vat-return.component.scss']
})
export class VatReturnComponent {
  selected_Company_id: any;
  selected_fin_id: any;
  gridData:any
   savedUserData: any;
  selected_from_date: any;
  selected_To_date: any;
  selected_Head_Id: any;
  selectedJournalVoucher: any;
  formatted_from_date: string;
  formatted_To_date: string;
  financialYeaDate:any
  pdfSrc: SafeResourceUrl | null = null;  
  selected_Company_name: any;
    defaultDate: Date = new Date();
  constructor(private dataservice:DataService,private sanitizer: DomSanitizer){
 this.sesstion_Details()
      this.onToDateChange({ value: this.defaultDate });


  }
    sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(sessionData, '=================session data==========');

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id=============='
    );
    this.selected_Company_name=sessionData.SELECTED_COMPANY.COMPANY_NAME
                   const sessionYear=sessionData.FINANCIAL_YEARS
            console.log(sessionYear,'==================session year==========')
 this.financialYeaDate=sessionYear[0].DATE_FROM
console.log(this.financialYeaDate,'=========================date=[[[[[[[[[[[[[[[[[[[[[[[[[[')

this.formatted_from_date=this.financialYeaDate



    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;

    console.log(
      this.selected_fin_id,
      '===========selected fin id==================='
    );

  }

  // get_pdf(){

get_pdf(data: any): SafeResourceUrl {
  console.log(this.selected_Company_name,'=========================company name=============')
  console.log(data,'=======data=======================')
   const Data=data.Data
const companyInfo = {
    TRN: Data[0].TRN || '',
    ID:Data[0].ID||'',
    ARABIC_NAME: Data[0].ARABIC_NAME || '',
    COMPANY_NAME:Data[0].COMPANY_NAME || '',
    ADDRESS: Data[0].ADDRESS || '',
     VAT:Data[0].VAT || '',
    AMOUNT: Data[0].AMOUNT || '',
    ADJUSTMENT:Data[0].ADJUSTMENT||''
  };
  const Company_name=companyInfo.COMPANY_NAME

  const ZeroRated = {
    TRN: Data[1].TRN || '',
    ID:Data[1].ID||'',
    AMOUNT: Data[1].AMOUNT || '',
    COMPANY_NAME:Data[1].COMPANY_NAME || '',
    ADDRESS: Data[1].ADDRESS || '',
       VAT:Data[1].VAT || '',
  };
    const puchId = {
    TRN: Data[2].TRN || '',
    ID:Data[2].ID||'',
    AMOUNT: Data[2].AMOUNT || '',
    VAT:Data[2].VAT || '',
    ADJUSTMENT: Data[2].ADJUSTMENT || ''
  };


  
 
console.log(companyInfo);
console.log(ZeroRated,'====================Zero========');
console.log(puchId,'===================Puch id===============')
const Id_value_Emirites=companyInfo.ID
console.log(Id_value_Emirites,'=============Id_value_Emirites==============')

const Total_Amount_first_table=companyInfo.AMOUNT+ZeroRated.AMOUNT
const Total_Vat_Amount=companyInfo.VAT+ZeroRated.VAT
const total_Amount_second=puchId.AMOUNT


  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const marginLeft = 10;
  let y = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('VALUE ADDED TAX RETURN', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Taxable Person Details Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(200, 220, 255);
  doc.rect(marginLeft, y, pageWidth - 20, 8, 'F');
  doc.setTextColor(0, 0, 0);
  doc.text('Taxable Person details', marginLeft + 2, y + 6);
  y += 14;

  doc.setFont('helvetica', 'normal');
  const taxableDetails = [
    ['TRN', companyInfo.TRN || ''],
    ['Taxable Person Name (English)',companyInfo.COMPANY_NAME  ||this.selected_Company_name ],
    ['Taxable Person Name (Arabic)', companyInfo.ARABIC_NAME || ''],
    ['Taxable Person Address', companyInfo.ADDRESS || ''],
    ['Tax Agency Name', data.tax_agency || ''],
    ['TAN', data.tan || ''],
    ['Tax Agent Name', data.agent_name || ''],
    ['TAAN', data.taan || '']
  ];

  taxableDetails.forEach(([label, value]) => {
    doc.text(label, marginLeft, y);
    doc.text(':', marginLeft + 70, y);
    doc.text(value, marginLeft + 75, y);
    y += 8;
  });

  // VAT Return Period
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('VAT Return Period', marginLeft, y);
  y += 10;
  doc.setFont('helvetica', 'normal');
  const fromDate=this.formatted_from_date


// Convert to Date object
const dateObj = new Date(fromDate);

// Format as dd/mm/yyyy
const formattedDateFrom = dateObj.toLocaleDateString('en-GB'); // dd/mm/yyyy format
console.log(formattedDateFrom); // "01/01/2025"
const formattedDateTo = new Date(this.formatted_To_date).toLocaleDateString('en-GB');
console.log(formattedDateTo);
  const vatDetails = [
    ['VAT Return Period', `${formattedDateFrom} - ${formattedDateTo}`],
    ['Tax Year', data.tax_year || '2025'],
    ['VAT Return Period Ref. Number', data.vat_ref || '']
  ];

  vatDetails.forEach(([label, value]) => {
    doc.text(label, marginLeft, y);
    doc.text(':', marginLeft + 70, y);
    doc.text(value, marginLeft + 75, y);
    y += 8;
  });

  // **New Section: VAT On Sale and other Outputs**
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('VAT On Sale and other Outputs', marginLeft, y);
  y += 5;

const emirateList = [
  { id: '1.a.', name: 'Abu Dhabi' },
  { id: '1.b.', name: 'Dubai' },
  { id: '1.c.', name: 'Sharjah' },
  { id: '1.d.', name: 'Ajman' },
  { id: '1.e.', name: 'Umm Al Quwain' },
  { id: '1.f.', name: 'Ras Al Khaimah' },
  { id: '1.g.', name: 'Fujairah' }
];

// ✅ Find matching ID
let matchedId: string | null = null;
if (Id_value_Emirites) {
  const match = emirateList.find(e => e.name === Id_value_Emirites);
  if (match) {
    matchedId = match.id;
  }
}
console.log("Matched ID:", matchedId);


  const tableData = [
    ['1.a.', 'Standard rated supplies in Abu Dhabi', '', '', ''],
    ['1.b.', 'Standard rated supplies in Dubai', '', '', ''],
    ['1.c.', 'Standard rated supplies in Sharjah', '', '', ''],
    ['1.d.', 'Standard rated supplies in Ajman', '', '', ''],
    ['1.e.', 'Standard rated supplies in Umm Al Quwain', '', '', ''],
    ['1.f.', 'Standard rated supplies in Ras Al Khaimah', '', '', ''],
    ['1.g.', 'Standard rated supplies in Fujairah', '', '', ''],
    ['2.', 'Supplies subject to the reverse charge provisions', '', '', ''],
    ['3.', 'Zero rated supplies',this.formatAmount(ZeroRated.AMOUNT) , '', ''],
    ['4.', 'Supplies of goods and services to registered customers in other GCC implementing states', '', '', ''],
    ['5.', 'Exempt supplies', '', '', ''],
    ['6.', 'Import VAT accounted through UAE customs', '', '', ''],
    ['7.', 'Amendments or corrections to Output figures', '', '', ''],
    ['8.', 'Totals', this.formatAmount(Total_Amount_first_table), this.formatAmount (Total_Vat_Amount), '']
  ];


  // ✅ Bind value based on matchedId
if (matchedId) {
  tableData.forEach(row => {
    if (row[0] === matchedId) {
      row[2] = this.formatAmount(companyInfo.AMOUNT); // <-- Replace with dynamic value from API or calculation
        row[3]=this.formatAmount(companyInfo.VAT);
        row[4]=this.formatAmount(companyInfo.ADJUSTMENT)
    }
  });
}


  autoTable(doc, {
    startY: y + 5,
    head: [['', '', 'Amount (AED)', 'VAT Amount (AED)', 'Adjustment (AED)']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
       textColor: [0 , 0, 0],
    },
      // doc.setFillColor(200, 220, 255);
    headStyles: {
      fillColor: [200, 220, 255],
      textColor: [0 , 0, 0],
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 80 },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
      didParseCell: function (data) {
    if (data.row.raw[0] === '8.') {   // ✅ Match the "Totals" row
      data.cell.styles.fontStyle = 'bold';
    }
  }
  });

  // =====================
  // TABLE 2: VAT On Sale and other Outputs
  // =====================
  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('VAT On Sale and other Outputs', marginLeft, y);
  y += 5;

  const tableData2 = [
    ['9.', 'Standard rated expenses', this.formatAmount(puchId.AMOUNT),this.formatAmount( puchId.VAT), this.formatAmount( puchId.ADJUSTMENT)],
    ['10.', 'Supplies subject to the reverse charge provisions', '', '', ''],
    ['11.', 'Amendments or corrections to Input figures', '', '', ''],
    ['12.', 'Totals', this.formatAmount(puchId.AMOUNT),this.formatAmount(puchId.VAT), '']
  ];

  autoTable(doc, {
    startY: y + 5,
    head: [['', '', 'Amount (AED)', 'Recoverable VAT Amount (AED)', 'Adjustment (AED)']],
    body: tableData2,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0] },
    headStyles: { fillColor: [200, 220, 255], textColor: [0, 0, 0], halign: 'center' },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 80 },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
    didParseCell: function (data) {
    if (data.row.raw[0] === '12.') {   // ✅ Match the "Totals" row
      data.cell.styles.fontStyle = 'bold';
    }
  }
  });

  // =====================
  // TABLE 3: Net VAT Due
  // =====================
  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Net VAT Due', marginLeft, y);
  y += 5;
 const allTotal = Number(Total_Vat_Amount) + Number(puchId.VAT);


  const tableData3 = [
    ['13.', 'Total value of due tax for the period', this.formatAmount( Total_Vat_Amount)],
    ['14.', 'Total value of recoverable tax for the period',this.formatAmount(puchId.VAT)],
    ['15.', 'Net VAT due (or reclaimed) for the period',allTotal]
  ];

  autoTable(doc, {
    startY: y + 5,
    head: [[ '', '', '']],
    body: tableData3,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3, textColor: [0, 0, 0],fontStyle:'bold' },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0],fontStyle:'bold'},
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 100 },
      2: { cellWidth: 40, halign: 'right' },
      3: { halign: 'right' }
    }
  });

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  return this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
}

formatAmount(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (isNaN(num)) return value; 
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

  Vat_Return_Data() {
    const payload = {
       COMPANY_ID:this.selected_Company_id,
       DATE_FROM:this.formatted_from_date,
       DATE_TO:this.formatted_To_date
    };

    this.dataservice.VAT_Return_Report_Api(payload).subscribe((res: any) => {
      if (res) {
        this.pdfSrc = this.get_pdf(res); // Update iframe source
      }
    });
  }







  
  onFromDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_from_date = this.formatDate(rawDate);
  }

  onToDateChange(event: any) {
    const rawDate: Date = new Date(event.value);
    this.formatted_To_date = this.formatDate(rawDate);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onHeadIdChange(event: any) {
    // Optional: Update sessionStorage if needed
  }


  formatDates(cellData: any): string {
    const date = new Date(cellData);
    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
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
  declarations: [VatReturnComponent],
  exports: [VatReturnComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VatReturnModule {}
