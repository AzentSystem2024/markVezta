import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
import { FormTextboxModule } from 'src/app/components';
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { EditInvoiceComponent } from '../edit-invoice/edit-invoice.component';
import notify from 'devextreme/ui/notify';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';


@Component({
  selector: 'app-view-invoice',
  templateUrl: './view-invoice.component.html',
  styleUrls: ['./view-invoice.component.scss'],
})
export class ViewInvoiceComponent {
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() invoiceFormData: any;
  popupVisible = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  mainInvoiceGridList: any;
  customerType: string = 'Unit';
  customerTypes = [
    { text: 'Unit', value: 'Unit' },
    { text: 'Dealer', value: 'Dealer' },
  ];
  companyList: any;
  distributorList: any;
  invoiceGridList: any;
  isTrOutPopupVisible: boolean = false;
  staticTransfers: any;
  totalAmount: any;
  summaryValues: any;
  taxAmount: any;
  grandTotal: any;
  selectedCompanyId: any;
  selectedDistributorId: any;
isViewInvoice: boolean;

 pdfSrc: SafeResourceUrl | null = null;
selectedInvoice: any;
  selected_Company_name: any;
    formatted_To_date: string;
     formatted_from_date: string;
     isPdfPopupVisible: boolean = false;
  selectedSupplierName: any;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
     private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.getCompanyListDropdown();
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;

      console.log(selectedCompany, '++++++++++++++[[[[[[[[[[[[[[[[[[');

      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
        this.invoiceFormData.UNIT_ID = selectedCompany.COMPANY_ID; // ✅ Set UNIT_ID
        this.companyList = [selectedCompany]; // ✅ Show only selected company
      }

      console.log(this.selectedCompanyId, '+++++++++++++++++++++++');

      if (userData.USER_ID) {
        this.invoiceFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.invoiceFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }

    this.getInvoiceListForGrid();

    this.invoiceFormData.IS_APPROVED = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoiceFormData'] && this.invoiceFormData?.length > 0) {
      const firstInvoice = this.invoiceFormData[0];
      console.log(this.invoiceFormData, 'RECEIVED INVOICE FORM DATA');
      if (
        firstInvoice.SALE_DATE &&
        typeof firstInvoice.SALE_DATE === 'string'
      ) {
        const [day, month, year] =
          firstInvoice.SALE_DATE.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);

        // Ensure no timezone offset by setting time to noon (safe time)
        localDate.setHours(12, 0, 0, 0);

        firstInvoice.SALE_DATE = localDate;
      }

      this.mainInvoiceGridList = firstInvoice.SALE_DETAILS || [];
      this.invoiceFormData = firstInvoice;
      this.getDistributorListAfterInput();
    }
  }
  onDistributorChanged(e: any) {
    if (e && e.value) {
      this.selectedDistributorId = e.value; // ✅ this is the selected ID
      console.log('Selected Distributor ID:', this.selectedDistributorId);
      if (this.selectedDistributorId) {
        this.selectedSupplierName = this.distributorList.find(
          (s: any) => s.ID === this.selectedDistributorId
        );
        this.invoiceFormData.PARTY_NAME = this.selectedSupplierName.DESCRIPTION;
        console.log(
          this.selectedSupplierName.DESCRIPTION,
          'PARTYNAMEEEEEEEEEEEEEE'
        );
      }
      this.invoiceFormData.DISTRIBUTOR_ID = this.selectedDistributorId;
      this.invoiceFormData.UNIT_ID = 0;
    }
  }
  getInvoiceListForGrid() {
    const payload = {
      CUST_ID: this.selectedDistributorId,
    };
    this.dataService.getInvoiceGridList(payload).subscribe((response: any) => {
      this.staticTransfers = response.Data; // Save the original full list
      console.log(this.staticTransfers, 'STATISCTRANSFERS');
      this.invoiceGridList = [...this.staticTransfers]; // Initial value
    });
  }

  getDistributorListAfterInput() {
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.distributorList = response;
      console.log(this.distributorList, 'DISTRIBUTORLISTTTT');

      // ✅ Ensure ID is correctly matched
      const matched = response.find(
        (d) => d.ID === this.invoiceFormData?.DISTRIBUTOR_ID
      );

      if (!matched) {
        console.warn(
          'No matching distributor for ID:',
          this.invoiceFormData?.DISTRIBUTOR_ID
        );
      }
    });
  }

  getCompanyListDropdown() {
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.distributorList = response;
      console.log(this.distributorList, 'DISTRIBUTORLISTTTT');
      // Optional: Ensure selected value is set after data arrives
      if (!this.invoiceFormData.DISTRIBUTOR_ID && response.length) {
        const matched = response.find(
          (d) => d.ID === this.invoiceFormData.DISTRIBUTOR_ID
        );
        if (matched) {
          this.invoiceFormData.DISTRIBUTOR_ID = matched.ID;
        }
      }
    });
  }

  cancelPopup() {
    this.popupClosed.emit();
  }


   viewPdf(): void {
    this.isPdfPopupVisible = true;
   const invoiceId = this.invoiceFormData.TRANS_ID;
   console.log(invoiceId,'=================invoiceId===================')
    this.dataService.selectInvoice(invoiceId).subscribe((response: any) => {
      console.log(response,'=================invoice response===================')
      if (response) {
        this.pdfSrc = this.get_pdf(response.Data); // Update iframe source
      }
    });
}

formatAmount(value: any): string {
  if (value === null || value === undefined || value === '') return '';
  const num = Number(value);
  if (isNaN(num)) return value; 
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// get_pdf(data: any): SafeResourceUrl {
//   console.log(this.selected_Company_name,'=========================company name=============')
//   console.log(data,'=======data=======================')


//   const doc = new jsPDF();
//   const pageWidth = doc.internal.pageSize.width;
//   const marginLeft = 10;
//   let y = 20;

//   // Title
//   doc.setFontSize(18);
//   doc.setFont('helvetica', 'bold');
//   doc.text('SALES INVOICE', pageWidth / 2, y, { align: 'center' });
//   y += 10;

//   // Taxable Person Details Section
//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   doc.setFillColor(200, 220, 255);
//   doc.rect(marginLeft, y, pageWidth - 20, 8, 'F');
//   doc.setTextColor(0, 0, 0);
//   doc.text('Taxable Person details', marginLeft + 2, y + 6);
//   y += 14;

//   doc.setFont('helvetica', 'normal');
//   // const taxableDetails = [
//   //   ['TRN', companyInfo.TRN || ''],
//   //   ['Taxable Person Name (English)',companyInfo.COMPANY_NAME  ||this.selected_Company_name ],
//   //   ['Taxable Person Name (Arabic)', companyInfo.ARABIC_NAME || ''],
//   //   ['Taxable Person Address', companyInfo.ADDRESS || ''],
//   //   ['Tax Agency Name', data.tax_agency || ''],
//   //   ['TAN', data.tan || ''],
//   //   ['Tax Agent Name', data.agent_name || ''],
//   //   ['TAAN', data.taan || '']
//   // ];

//   // taxableDetails.forEach(([label, value]) => {
//   //   doc.text(label, marginLeft, y);
//   //   doc.text(':', marginLeft + 70, y);
//   //   doc.text(value, marginLeft + 75, y);
//   //   y += 8;
//   // });

//   // VAT Return Period
//   y += 6;
//   doc.setFont('helvetica', 'bold');
//   doc.text('VAT Return Period', marginLeft, y);
//   y += 10;
//   doc.setFont('helvetica', 'normal');
//   const fromDate=this.formatted_from_date


// // Convert to Date object
// const dateObj = new Date(fromDate);



//   const pdfBlob = doc.output('blob');
//   const pdfUrl = URL.createObjectURL(pdfBlob);
//   return this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
// }

get_pdf(data: any): SafeResourceUrl {
  console.log(this.selected_Company_name, '=========================company name=============');
  console.log(data, '=======data=======================');

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const marginLeft = 15;
  let y = 20;

  // ===== HEADER =====
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SALES INVOICE', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Company: ${this.selected_Company_name || 'N/A'}`, marginLeft, y);
  y += 6;
  doc.text(`Invoice No: ${data[0].DISTRIBUTOR_ID || ''}`, marginLeft, y);
  y += 6;
  doc.text(`Reference No: ${data[0].REF_NO || ''}`, marginLeft, y);
  y += 6;
  doc.text(`Customer: ${data[0].CUST_NAME || ''}`, marginLeft, y);
  y += 6;
  doc.text(`Transaction Date: ${data[0].SALE_DATE || ''}`, marginLeft, y);
  y += 10;

  // ===== TABLE HEADER =====
  const tableColumn = [
    'Transfer No',
    'Date',
    'Item Description',
    'Total Pair Qty',
    'Price',
    'Amount',
    'TAX%',
    'Tax Amount',
    'Total'
  ];

  const tableRows: any[] = [];

  // Fill the table rows dynamically
  // Loop through Sale Details from the first invoice record
if (data && Array.isArray(data) && data.length > 0 && data[0].SALE_DETAILS) {
  data[0].SALE_DETAILS.forEach((item: any) => {
    const row = [
      item.TRANSFER_NO || '',
      item.TRANSFER_DATE || '',
      item.ARTICLE || '',
      item.TOTAL_PAIR_QTY?.toString() || '',
      item.PRICE?.toFixed(2) || '',
      item.AMOUNT?.toFixed(2) || '',
      item.GST?.toFixed(2) || '',
      item.TAX_AMOUNT?.toFixed(2) || '',
      Number(item.TOTAL_AMOUNT || 0).toFixed(2)
    ];
    tableRows.push(row);
  });
}


  // ===== DRAW TABLE =====
  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: y,
    theme: 'grid',
    headStyles: { fillColor: [200, 220, 255], textColor: [0, 0, 0], halign: 'center' },
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 20 }, // Transfer No
      1: { cellWidth: 25 }, // Date
      2: { cellWidth: 40 }, // Description
      3: { cellWidth: 25 }, // Qty
      4: { cellWidth: 20 }, // Price
      5: { cellWidth: 25 }, // Amount
      6: { cellWidth: 15 }, // TAX%
      7: { cellWidth: 25 }, // Tax Amount
      8: { cellWidth: 25,halign: 'right' }, // Total
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // ===== TOTALS =====
  doc.setFont('helvetica', 'bold');
  doc.text(`Subtotal: ₹${data[0].GROSS_AMOUNT?.toFixed(2) || '0.00'}`, pageWidth - 80, finalY);
  doc.text(`Tax Amount: ₹${data[0].TAX_AMOUNT?.toFixed(2) || '0.00'}`, pageWidth - 80, finalY + 6);
  doc.text(`Grand Total: ₹${data[0].NET_AMOUNT?.toFixed(2) || '0.00'}`, pageWidth - 80, finalY + 12);

  // ===== FOOTER =====
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your business!', pageWidth / 2, finalY + 25, { align: 'center' });

  // ===== RETURN AS URL =====
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  return this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
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
    FormTextboxModule,
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
    ArticleAddModule,
    ArticleEditModule,
    AddJournalVoucharModule,
    EditJournalVoucherModule,
    ViewJournalVoucherModule,
  ],
  providers: [],
  declarations: [ViewInvoiceComponent],
  exports: [ViewInvoiceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ViewInvoiceModule {}
