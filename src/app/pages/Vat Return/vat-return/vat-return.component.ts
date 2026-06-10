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
  styleUrls: ['./vat-return.component.scss'],
})
export class VatReturnComponent {
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  selected_Company_id: any;
  selected_fin_id: any;
  gridData: any;
  savedUserData: any;
  selected_from_date: any;
  selected_To_date: any;
  selected_Head_Id: any;
  selectedJournalVoucher: any;
  formatted_from_date: string;
  formatted_To_date: string;
  financialYeaDate: any;
  pdfSrc: SafeResourceUrl | null = null;
  selected_Company_name: any;
  defaultDate: Date = new Date();
  VATreturn:any[]=[];
    salesVatTotal = 0;
expenseVatTotal = 0;
netVatDue = 0;
isOutputVatPopup = false;
isStoreVatPopup = false;
outputVatPopupData: any[] = [];
storeVatPopupData:any[] =[];

  constructor(
    private dataservice: DataService,
    private sanitizer: DomSanitizer,
  ) {
    this.sesstion_Details();
    this.onToDateChange({ value: this.defaultDate });
    
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



calculateNetVat() {

  this.salesVatTotal = this.VATreturn
    .filter((x: any) => x.GROUP_NAME === 'VAT On Sale and Other Outputs')
    .reduce((sum: number, x: any) => sum + Number(x.VAT || 0), 0);

  this.expenseVatTotal = this.VATreturn
    .filter((x: any) => x.GROUP_NAME === 'VAT On Expense and Other Outputs')
    .reduce((sum: number, x: any) => sum + Number(x.VAT || 0), 0);

  this.netVatDue = this.salesVatTotal - this.expenseVatTotal;
}
  
  formatAmount(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    const num = Number(value);
    if (isNaN(num)) return value;
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  calculateNetVatSummary(options: any) {

  if (options.name === 'NetVATDue') {

    if (options.summaryProcess === 'start') {
      options.totalValue = 0;
      options.totalExpenseVat = 0;
      options.totalSalesVat = 0;
    }

    if (options.summaryProcess === 'calculate') {
      options.totalExpenseVat += Number(options.value.VAT_EXPENSE || 0);
      options.totalSalesVat += Number(options.value.VAT_SALES || 0);
    }

    if (options.summaryProcess === 'finalize') {
      options.totalValue =
        options.totalExpenseVat - options.totalSalesVat;
    }
  }
}

 onRowClick(e: any) {
  // this.isLoading = true;

  const payload = {
    COMPANY_ID: this.selected_Company_id,
    DATE_FROM: this.formatted_from_date,
    DATE_TO: this.formatted_To_date,
    EMIRATE_ID: e.data.EMIRATE_ID
  };

  this.dataservice.Output_VAT_Report_Api(payload)
    .subscribe({
      next: (res: any) => {

        this.outputVatPopupData = res.Data || [];

        this.isOutputVatPopup = true;
        // this.isLoading = false;
      },
      error: () => {
        // this.isLoading = false;
      }
    });
}

onRowStoreClick(e: any) {
  // this.isLoading = true;

  const payload = {
    COMPANY_ID: this.selected_Company_id,
    DATE_FROM: this.formatted_from_date,
    DATE_TO: this.formatted_To_date,
    STORE_ID : e.data.STORE_ID
  };

  this.dataservice.Output_VAT_Report_Api(payload)
    .subscribe({
      next: (res: any) => {

        this.storeVatPopupData = res.Data || [];

        this.isStoreVatPopup = true;
        // this.isLoading = false;
      },
      error: () => {
        // this.isLoading = false;
      }
    });
}

  Vat_Return_Data() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
    };

    this.dataservice.VAT_Return_Report_Api(payload).subscribe((res: any) => {
      this.VATreturn = res.Details
      this.VATreturn = res.Details.map((item: any) => ({
  ...item,

  GROUP_NAME:
    item.TRANS_TYPE === 'PURCHASE INVOICE' ||
    item.TRANS_TYPE === 'PURCHASE RETURN'
      ? 'VAT On Expense and Other Outputs'
      : 'VAT On Sale and Other Outputs'
}));
this.calculateNetVat();
      if (res) {
      // this.get_pdf(res); // Update iframe source
      }
    });
  }

get_pdf(response: any) {

  const header = response.Header;
  const details = response.Details || [];

  const sales = details.find((x: any) => x.ID === 'UNKNOWN');
  const zero = details.find((x: any) => x.ID === 'ZERO');

  const purchases = details.filter((x: any) => x.ID === 'PURCH');

  const totalSalesAmount =
    Number(sales?.AMOUNT || 0) +
    Number(zero?.AMOUNT || 0);

  const totalSalesVat =
    Number(sales?.VAT || 0) +
    Number(zero?.VAT || 0);

  const totalPurchaseAmount = purchases.reduce(
    (sum: number, item: any) => sum + Number(item.AMOUNT || 0),
    0
  );

  const totalPurchaseVat = purchases.reduce(
    (sum: number, item: any) => sum + Number(item.VAT || 0),
    0
  );

  const netVat = totalSalesVat - totalPurchaseVat;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;

  // ==========================================
  // TITLE
  // ==========================================
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');

  doc.text(
    'VALUE ADDED TAX RETURN',
    pageWidth / 2,
    15,
    { align: 'center' }
  );

  // ==========================================
  // COMPANY DETAILS
  // ==========================================
  doc.setFontSize(11);

  doc.text('Taxable Person Details', 14, 30);

  autoTable(doc, {
    startY: 35,
    theme: 'plain',
    styles: {
      fontSize: 10
    },
    body: [
      ['TRN', header?.TRN || ''],
      ['Company Name', header?.COMPANY_NAME || ''],
      ['Arabic Name', header?.ARABIC_NAME || ''],
      ['Address', header?.ADDRESS || '']
    ]
  });

  // ==========================================
  // OUTPUT VAT
  // ==========================================

  const y1 = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.text('VAT On Sales and Other Outputs', 14, y1);

  const purchaseRows = purchases.map((item: any, index: number) => [
  index + 1,
  item.SUPP_NAME || '',
  Number(item.AMOUNT || 0).toFixed(2),
  Number(item.VAT || 0).toFixed(2),
  Number(item.ADJUSTMENT || 0).toFixed(2)
]);

 autoTable(doc, {
  startY: y1 + 5,
  theme: 'grid',
  head: [[
    'Code',
    'Description',
    'Amount (AED)',
    'VAT Amount (AED)',
    'Adjustment'
  ]],
  body: [
    ...purchaseRows,
    [
      '',
      'TOTAL',
      totalPurchaseAmount.toFixed(2),
      totalPurchaseVat.toFixed(2),
      '0.00'
    ]
  ],
  headStyles: {
    fillColor: [220, 220, 220]
  }
});

  // ==========================================
  // INPUT VAT
  // ==========================================

  const y2 = (doc as any).lastAutoTable.finalY + 10;

  doc.text('VAT On Expenses and Other Inputs', 14, y2);

  autoTable(doc, {
    startY: y2 + 5,
    theme: 'grid',
    head: [[
      'Code',
      'Description',
      'Amount (AED)',
      'Recoverable VAT',
      'Adjustment'
    ]],
    body: [
      [
        '3',
        'Standard Rated Expenses',
        totalPurchaseAmount.toFixed(2),
        totalPurchaseVat.toFixed(2),
        '0.00'
      ]
    ],
    headStyles: {
      fillColor: [220, 220, 220]
    }
  });

  
  // ==========================================
  // NET VAT
  // ==========================================

  const y3 = (doc as any).lastAutoTable.finalY + 10;

  doc.text('Net VAT Due', 14, y3);

  autoTable(doc, {
    startY: y3 + 5,
    theme: 'grid',
    body: [
      [
        'Total VAT Collected',
        totalSalesVat.toFixed(2)
      ],
      [
        'Total Recoverable VAT',
        totalPurchaseVat.toFixed(2)
      ],
      [
        'Net VAT Due',
        netVat.toFixed(2)
      ]
    ],
    styles: {
      fontStyle: 'bold'
    }
  });

  doc.output('dataurlnewwindow');
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


    onExporting(event: any) {
    const fileName = 'VAT Return';
    this.dataservice.exportDataGridReport(event, fileName);
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
