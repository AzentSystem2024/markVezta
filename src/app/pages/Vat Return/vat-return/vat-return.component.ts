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
import { AddSalesInvoiceRetailModule } from '../../OPERATIONS/add-sales-invoice-retail/add-sales-invoice-retail.component';
import { AddInvoiceRetailModule } from '../../INVOICE/add-invoice-retail/add-invoice-retail.component';
import { EditPurchaseInvoiceModule } from '../../PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';
import notify from 'devextreme/ui/notify';

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
isViewInvoice: boolean = false;
isReadOnlyInvoice:boolean = true;
selectedInvoice:any;
isEditInvoiceReadOnly :boolean= true;
isVerifyInvoice: boolean = false;
statusFinder: any;
 buttonText: any;
 canApprove:boolean = false;
 isEditInvoice:boolean = false;
 vatReturnDataSource:any[]=[];
 isLoading = false;

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
    this.salesVatTotal = this.VATreturn.filter(
      (x: any) => x.GROUP_NAME === 'VAT On Sale and Other Outputs',
    ).reduce((sum: number, x: any) => sum + Number(x.VAT || 0), 0);

    this.expenseVatTotal = this.VATreturn.filter(
      (x: any) => x.GROUP_NAME === 'VAT On Expense and Other Outputs',
    ).reduce((sum: number, x: any) => sum + Number(x.VAT || 0), 0);

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

onCellClick(e: any) {

  const clickableColumns = ['AMOUNT', 'VAT', 'ADJUSTMENT'];

  if (!clickableColumns.includes(e.column.dataField)) {
    return;
  }

  // Skip total rows
  if (e.data?.IS_TOTAL_ROW) {
    return;
  }

  // TYPE = 1 → Existing popup logic
   if (e.data.TYPE === 1) {

    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
      KEY: e.data.KEY,
    };

    this.dataservice.Output_Vat_Summary(payload).subscribe({
      next: (res: any) => {
        this.outputVatPopupData = res.Details || [];
        this.isOutputVatPopup = true;
      }
    });

    return;
  }


  if (e.data.TYPE === 2) {

  const payload = {
    COMPANY_ID: this.selected_Company_id,
    DATE_FROM: this.formatted_from_date,
    DATE_TO: this.formatted_To_date,
    STORE_ID: 1,
  };

  this.dataservice.Storewise_Vat_Summary(payload).subscribe({
    next: (res: any) => {
      this.storeVatPopupData = res.Details || [];
      this.isStoreVatPopup = true;
    },
    error: (err) => {
      console.error(err);
    }
  });

  return;
}
}

  onRowStoreClick(e: any) {
    // this.isLoading = true;

    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
      STORE_ID: e.data.STORE_ID,
    };

    this.dataservice.Storewise_Vat_Summary(payload).subscribe({
      next: (res: any) => {
        this.storeVatPopupData = res.Details || [];

        this.isStoreVatPopup = true;
        // this.isLoading = false;
      },
      error: () => {
        // this.isLoading = false;
      },
    });
    
  }

onInvoiceRowClick(e: any) {
  console.log(e,'event------------')
  const trans_type = e.data.TRANS_TYPE
  const trans_id = e.data.TRANS_ID;

  if(trans_type === "25"){
  this.dataservice
      .selectInvoiceRetail(trans_id)
      .subscribe((response: any) => {
        this.selectedInvoice = response.Data;
          this.isViewInvoice = true;
        
      }); // Selected row data
  this.isViewInvoice = true; 
    }
    else if (trans_type === "19"){
     this.dataservice.selectPurchaseInvoice(trans_id).subscribe((res: any) => {
      console.log(res);
      this.selectedInvoice = res.Data;
      console.log(this.selectedInvoice, '==============select data====verify');
      if (this.selectedInvoice.STATUS == "Approved") {
        this.buttonText = 'View Purchase  Invoice'
      } else if (this.selectedInvoice.STATUS == "Open") {
        this.buttonText = 'Verify Purchase  Invoice'
      } else if (this.selectedInvoice.STATUS == "Verified") {
        this.buttonText = 'Approve Purchase  Invoice'

      } else {
        this.buttonText = 'Purchase Invoice'

      }
      // this.isEditInvoiceReadOnly = transStatus === 'Approved';
      this.isVerifyInvoice = true;
});
    }
  // Open Invoice popup
}

onRowPrepared(e: any) {
  if (e.rowType === 'data' && e.data?.IS_TOTAL_ROW) {
    e.rowElement.style.fontWeight = 'bold';
    e.rowElement.style.backgroundColor = '#f2f2f2';
  }
}

  Vat_Return_Data() {
     this.isLoading = true;
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      DATE_FROM: this.formatted_from_date,
      DATE_TO: this.formatted_To_date,
    };

    this.dataservice.VAT_Return_Report_Api(payload).subscribe((res: any) => {
       this.isLoading = false;
      this.vatReturnDataSource = res
      this.VATreturn = res.Details;
      this.VATreturn = res.Details.map((item: any) => ({
        ...item,

        GROUP_NAME:
          item.TYPE === 1
      ? 'VAT On Sale and Other Outputs'
      : item.TYPE === 2
      ? 'VAT On Expense and Other Outputs'
      : 'Net VAT Due',
      GROUP_ORDER:
    item.TYPE === 1 ? 1 : 2
      }));
      const groupVat = this.VATreturn.reduce((acc: any, item: any) => {
        const group = item.GROUP_NAME;

        if (!acc[group]) {
          acc[group] = 0;
        }

        acc[group] += Number(item.VAT || 0);

        return acc;
      }, {});

      console.log(groupVat);
      const difference =
        groupVat['VAT On Sale and Other Outputs'] -
        groupVat['VAT On Expense and Other Outputs'];
      this.netVatDue = Number(difference.toFixed(2));
      console.log('Difference:', this.netVatDue);
      this.calculateNetVat();


      const dueTax =
  groupVat['VAT On Sale and Other Outputs'] || 0;

const recoverableTax =
  groupVat['VAT On Expense and Other Outputs'] || 0;

this.VATreturn.push(
  {
    GROUP_NAME: 'Net VAT Due',
    GROUP_ORDER: 3,
    DESCRIPTION: 'Total value of due tax for the period',
    AMOUNT: null,
    VAT: dueTax,
    ADJUSTMENT: null,
    IS_TOTAL_ROW: true
  },
  {
    GROUP_NAME: 'Net VAT Due',
    GROUP_ORDER: 3,
    DESCRIPTION: 'Total value of recoverable tax for the period',
    AMOUNT: null,
    VAT: recoverableTax,
    ADJUSTMENT: null,
    IS_TOTAL_ROW: true
  },
  {
    GROUP_NAME: 'Net VAT Due',
    GROUP_ORDER: 3,
    DESCRIPTION: 'Net VAT due(or reclaimed) for the period',
    AMOUNT: null,
    VAT: this.netVatDue,
    ADJUSTMENT: null,
    IS_TOTAL_ROW: true
  }
);
      if (res) {
        // this.get_pdf(res); // Update iframe source
      }
    });
  }

  downloadPdf() {

   if (!this.VATreturn || this.VATreturn.length === 0) {
    notify('No data found', 'warning', 2000);
    return;
  }

  const payload = {
    COMPANY_ID: this.selected_Company_id,
    DATE_FROM: this.formatted_from_date,
    DATE_TO: this.formatted_To_date,
  };

  this.dataservice.VAT_Return_Report_Api(payload).subscribe((res: any) => {
    if (res?.Details?.length > 0) {
      this.get_pdf(res);
    } else {
      notify('No data found', 'warning', 2000);
    }
  });

}
  
get_pdf(response: any) {
  const header = response.Header;
  const details = response.Details || [];

  // Sales (TYPE = 1)
  const salesRows = details.filter((x: any) => x.TYPE === 1);

  // Expenses (TYPE = 2)
  const purchaseRows = details.filter((x: any) => x.TYPE === 2);

  const totalSalesAmount = salesRows.reduce(
    (sum: number, item: any) => sum + Number(item.AMOUNT || 0),
    0
  );

  const totalSalesVat = salesRows.reduce(
    (sum: number, item: any) => sum + Number(item.VAT || 0),
    0
  );

  const totalPurchaseAmount = purchaseRows.reduce(
    (sum: number, item: any) => sum + Number(item.AMOUNT || 0),
    0
  );

  const totalPurchaseVat = purchaseRows.reduce(
    (sum: number, item: any) => sum + Number(item.VAT || 0),
    0
  );

  const netVat = totalSalesVat - totalPurchaseVat;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('VALUE ADDED TAX RETURN', pageWidth / 2, 15, {
    align: 'center',
  });

  doc.setFontSize(11);
  doc.text('Taxable Person Details', 14, 30);

  autoTable(doc, {
    startY: 35,
    theme: 'plain',
    body: [
      ['TRN', header?.TRN || ''],
      ['Company Name', header?.COMPANY_NAME || ''],
      ['Arabic Name', header?.ARABIC_NAME || ''],
      ['Address', header?.ADDRESS || ''],
    ],
  });

  // ===============================
  // VAT ON SALES
  // ===============================

  const y1 = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.text('VAT On Sale and Other Outputs', 14, y1);

  const salesTableRows = salesRows.map((item: any) => [
    item.ID,
    item.DESCRIPTION,
    Number(item.AMOUNT || 0).toFixed(2),
    Number(item.VAT || 0).toFixed(2),
    Number(item.ADJUSTMENT || 0).toFixed(2),
  ]);

  autoTable(doc, {
    startY: y1 + 5,
    theme: 'grid',
    head: [
      [
        'Code',
        'Description',
        'Amount (AED)',
        'VAT Amount (AED)',
        'Adjustment',
      ],
    ],
    body: [
      ...salesTableRows,
      [
        '',
        'TOTAL',
        totalSalesAmount.toFixed(2),
        totalSalesVat.toFixed(2),
        '',
      ],
    ],
  });

  // ===============================
  // VAT ON EXPENSES
  // ===============================

  const y2 = (doc as any).lastAutoTable.finalY + 10;

  doc.text('VAT On Expense and Other Outputs', 14, y2);

  const purchaseTableRows = purchaseRows.map((item: any) => [
    item.ID,
    item.DESCRIPTION,
    Number(item.AMOUNT || 0).toFixed(2),
    Number(item.VAT || 0).toFixed(2),
    Number(item.ADJUSTMENT || 0).toFixed(2),
  ]);

  autoTable(doc, {
    startY: y2 + 5,
    theme: 'grid',
    head: [
      [
        'Code',
        'Description',
        'Amount (AED)',
        'Recoverable VAT',
        'Adjustment',
      ],
    ],
    body: [
      ...purchaseTableRows,
      [
        '',
        'TOTAL',
        totalPurchaseAmount.toFixed(2),
        totalPurchaseVat.toFixed(2),
        '',
      ],
    ],
  });

  // ===============================
  // NET VAT DUE
  // ===============================

  const y3 = (doc as any).lastAutoTable.finalY + 10;

  doc.text('Net VAT Due', 14, y3);

  autoTable(doc, {
    startY: y3 + 5,
    theme: 'grid',
    body: [
      [
        'Total value of due tax for the period',
        totalSalesVat.toFixed(2),
      ],
      [
        'Total value of recoverable tax for the period',
        totalPurchaseVat.toFixed(2),
      ],
      [
        'Net VAT due(or reclaimed) for the period',
        netVat.toFixed(2),
      ],
    ],
    styles: {
      fontStyle: 'bold',
    },
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

handleClose(){
  this.isVerifyInvoice = false;
  this.isViewInvoice = false;
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
    AddInvoiceRetailModule,
    EditPurchaseInvoiceModule,
  ],
  providers: [],
  declarations: [VatReturnComponent],
  exports: [VatReturnComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class VatReturnModule {}
