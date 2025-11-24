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
// import logo from 'src/assets/images/logo.png';

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
  HSNCODE: any;
  GST: any;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    const userDataString = localStorage.getItem('userData');
    console.log(userDataString, 'USERDATASTRING');
    if (userDataString) {
      const userData = JSON.parse(userDataString);

      this.HSNCODE = userData.GeneralSettings.HSN_CODE;
      this.GST = userData.GeneralSettings.GST_PERC;
      console.log(this.HSNCODE, 'HSNCODE===================');
    }
  }

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
      this.mainInvoiceGridList = this.mainInvoiceGridList.map((row: any) => ({
        HSN_CODE: this.HSNCODE, // force-create
        GST: row.GST || this.GST, // already showing
        ...row, // merge original row at the end
      }));
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
    console.log(invoiceId, '=================invoiceId===================');
    this.dataService.selectInvoice(invoiceId).subscribe((response: any) => {
      console.log(
        response,
        '=================invoice response==================='
      );
      if (response) {
        this.pdfSrc = this.get_pdf(response.Data); // Update iframe source
      }
    });
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

  get_pdf(data: any): SafeResourceUrl {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const marginLeft = 15;
    let y = 18;

    //  =====================================
    // ADD LOGO TOP-RIGHT
    // =====================================
    const imgWidth = 28; // adjust size of logo
    const imgHeight = 18;
    const imgX = pageWidth - imgWidth - 10; // 10mm from right border
    const imgY = 5;

    // doc.addImage(logo, 'PNG', imgX, imgY, imgWidth, imgHeight);

    // =====================================
    // 1) TITLE ABOVE BORDER
    // =====================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SALES INVOICE', pageWidth / 2, y, { align: 'center' });

    y += 5;

    // =====================================
    // 2) FULL PAGE BORDER
    // =====================================
    doc.setDrawColor(0);
    doc.setLineWidth(0.4);
    doc.rect(5, 20, pageWidth - 10, pageHeight - 25);

    y = 25; // inside border

    const boxY = y;
    const boxH = 30;
    const midX = pageWidth / 2;

    // =====================================
    // CENTER VERTICAL LINE (TOP → END OF HEADER)
    // =====================================
    doc.line(midX, 20, midX, boxY + boxH);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);

    // LEFT SIDE
    doc.text(`${data[0].COMPANY_NAME || ''}`, 6 + 3, boxY + 6);
    doc.text(`${data[0].COMPANY_CODE || ''}`, 6 + 3, boxY + 10);
    doc.text(`Customer: ${data[0].CUST_NAME || ''}`, 6 + 3, boxY + 14);
    doc.text(`Address1: ${data[0].ADDRESS1 || ''}`, 6 + 3, boxY + 18);
    doc.text(`Address2: ${data[0].ADDRESS2 || ''}`, 6 + 3, boxY + 22);
    doc.text(`Address3: ${data[0].ADDRESS3 || ''}`, 6 + 3, boxY + 26);
    doc.text(`Email: ${data[0].EMAIL || ''}`, 6 + 3, boxY + 30);

    // RIGHT SIDE
    doc.text(`Invoice No: ${data[0].DISTRIBUTOR_ID || ''}`, midX + 3, boxY + 6);
    doc.text(`Date: ${data[0].SALE_DATE || ''}`, midX + 3, boxY + 10);
    doc.text(`Reference No: ${data[0].REF_NO || ''}`, midX + 3, boxY + 14);

    // Horizontal line under header (LEFT SIDE ONLY)
    doc.line(6, boxY + boxH + 2, midX, boxY + boxH + 2);

    y += boxH + 8;

    // =====================================
    // SECOND BOX
    // =====================================
    const secondBoxX = 6;
    const secondBoxW = pageWidth - 12;
    const secondBoxH = 32;
    const secondBoxY = y;

    // Bottom border
    doc.line(
      secondBoxX,
      secondBoxY + secondBoxH,
      midX,
      secondBoxY + secondBoxH
    );

    // Extend center line through this box
    doc.line(midX, 20, midX, secondBoxY + secondBoxH);

    // Text inside
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Buyer (Bill to)', secondBoxX + 3, secondBoxY + 6);

    doc.setFont('helvetica', 'normal');
    doc.text(data[0].CUST_ADDRESS1 || '', secondBoxX + 3, secondBoxY + 10);
    doc.text(data[0].CUST_ADDRESS2 || '', secondBoxX + 3, secondBoxY + 14);
    doc.text(data[0].CUST_ADDRESS3 || '', secondBoxX + 3, secondBoxY + 18);
    doc.text('PIN - 680001', secondBoxX + 3, secondBoxY + 22);
    doc.text('GSTIN/UIN : 32ACXPA8968Q1ZJ', secondBoxX + 3, secondBoxY + 26);
    doc.text(data[0].CUST_STATE, secondBoxX + 3, secondBoxY + 30);

    y += secondBoxH + 8;

    // =====================================
    // THIRD BOX
    // =====================================
    const thirdBoxX = 6;
    const thirdBoxW = pageWidth - 12;
    const thirdBoxH = 32;
    const thirdBoxY = y;

    // Bottom border
    doc.line(
      thirdBoxX,
      thirdBoxY + thirdBoxH,
      thirdBoxX + thirdBoxW,
      thirdBoxY + thirdBoxH
    );

    // Text inside
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Consignee (Ship to)', thirdBoxX + 3, thirdBoxY + 6);

    doc.setFont('helvetica', 'normal');
    doc.text(data[0].CUST_ADDRESS1 || '', thirdBoxX + 3, thirdBoxY + 10);
    doc.text(data[0].CUST_ADDRESS2 || '', thirdBoxX + 3, thirdBoxY + 14);
    doc.text(data[0].CUST_ADDRESS3 || '', thirdBoxX + 3, thirdBoxY + 18);
    doc.text('PIN - 680001', thirdBoxX + 3, thirdBoxY + 22);
    doc.text('GSTIN/UIN : 32ACXPA8968Q1ZJ', thirdBoxX + 3, thirdBoxY + 26);
    doc.text(data[0].CUST_STATE, thirdBoxX + 3, thirdBoxY + 30);

    y += thirdBoxH + 8;

    // =====================================
    // ★ CONNECT CENTER VERTICAL LINE TO HORIZONTAL LINE ABOVE TABLE
    // =====================================
    const horizontalLineY = thirdBoxY + thirdBoxH;

    doc.setDrawColor(0);
    doc.setLineWidth(0.4);
    doc.line(midX, 20, midX, horizontalLineY); // <-- PERFECT STOP HERE

    // =====================================
    // TABLE HEADER + ROWS
    // =====================================
    const tableColumn = [
      'Transfer No',
      'Date',
      'Item Description',
      'Total Pair Qty',
      'Price',
      'Amount',
      'TAX%',
      'Tax Amount',
      'Total',
    ];

    const tableRows: any[] = [];

    if (data && Array.isArray(data) && data[0].SALE_DETAILS) {
      data[0].SALE_DETAILS.forEach((item: any) => {
        tableRows.push([
          item.TRANSFER_NO || '',
          item.TRANSFER_DATE || '',
          item.ARTICLE || '',
          item.TOTAL_PAIR_QTY || '',
          item.PRICE?.toFixed(2) || '',
          item.AMOUNT?.toFixed(2) || '',
          item.GST?.toFixed(2) || '',
          item.TAX_AMOUNT?.toFixed(2) || '',
          Number(item.TOTAL_AMOUNT || 0).toFixed(2),
        ]);
      });
    }

    const totalsRow = [
      '',
      '',
      '',
      '',
      '',
      (data[0].GROSS_AMOUNT || 0).toFixed(2),
      '',
      (data[0].TAX_AMOUNT || 0).toFixed(2),
      (data[0].NET_AMOUNT || 0).toFixed(2),
    ];

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      foot: [totalsRow],
      margin: { left: 10, right: 55 },
      startY: y,
      theme: 'grid',
      headStyles: {
        fillColor: [200, 220, 255],
        textColor: [0, 0, 0],
        halign: 'center',
      },
      styles: { fontSize: 10, cellPadding: 2 },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        halign: 'right',
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 15 },
        7: { cellWidth: 20 },
        8: { cellWidth: 20, halign: 'right' },
      },
    });

    const footerY = (doc as any).lastAutoTable.finalY + 10;

    // =====================================
    // AMOUNT IN WORDS
    // =====================================
    const netAmount = data[0].NET_AMOUNT || 0;

    const rupees = Math.floor(netAmount);
    const paise = Math.round((netAmount - rupees) * 100);

    const rupeesInWords = numberToWordsIndianNumber(rupees);
    const paiseInWords = paise > 0 ? numberToWordsIndianNumber(paise) : '';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Amount Chargeable (in words)', 6, footerY);

    let amountWords = `INR ${rupeesInWords} Rupees`;
    if (paise > 0) amountWords += ` and ${paiseInWords} Paise`;
    amountWords += ' Only';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(amountWords, 6, footerY + 6);

    // =====================================
    // TAX AMOUNT IN WORDS
    // =====================================
    const taxAmount = data[0].TAX_AMOUNT || 0;

    const taxRupees = Math.floor(taxAmount);
    const taxPaise = Math.round((taxAmount - taxRupees) * 100);

    const taxRupeesInWords = numberToWordsIndianNumber(taxRupees);
    const taxPaiseInWords =
      taxPaise > 0 ? numberToWordsIndianNumber(taxPaise) : '';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Tax Amount (in words)', 6, footerY + 15);

    let taxAmountWords = `INR ${taxRupeesInWords} Rupees`;
    if (taxPaise > 0) taxAmountWords += ` and ${taxPaiseInWords} Paise`;
    taxAmountWords += ' Only';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(taxAmountWords, 6, footerY + 21);

    // =====================================
    // SIGNATURE BLOCK
    // =====================================
    const signBoxWidth = 100;
    const signBoxX = pageWidth - signBoxWidth - 6;

    doc.rect(signBoxX, footerY + 25, signBoxWidth, 30);

    doc.setFont('helvetica', 'bold');
    doc.text(`for ${data[0].CUST_NAME || ''}`, signBoxX + 3, footerY + 32);

    doc.setFont('helvetica', 'normal');
    doc.text('Authorised Signatory', signBoxX + 3, footerY + 50);

    // =====================================
    // RETURN PDF
    // =====================================
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    return this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
  }
}

function numberToWordsIndianNumber(num: number) {
  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  if (num === 0) return 'Zero';

  let str = '';

  if (num >= 10000000) {
    str += numberToWordsIndianNumber(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    str += numberToWordsIndianNumber(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    str += numberToWordsIndianNumber(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  if (num >= 100) {
    str += numberToWordsIndianNumber(Math.floor(num / 100)) + ' Hundred ';
    num %= 100;
  }
  if (num > 0) {
    if (num < 20) str += a[num];
    else str += b[Math.floor(num / 10)] + ' ' + a[num % 10];
  }

  return str.trim();
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
