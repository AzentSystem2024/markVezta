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

get_pdf(data: any): SafeResourceUrl {

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let y = 10;

  // ======================================================
  // LOGO (LEFT TOP)
  // ======================================================
  const logoW = 55;
  const logoH = 28;
  doc.setDrawColor(180);
  doc.rect(10, y, logoW, logoH);   // TEMP LOGO BOX (replace with addImage)


  // ===============================================
// SALES INVOICE HEADING (Centered between logo & reference block)
// ===============================================
doc.setFont("helvetica", "bold");
doc.setFontSize(16);

// compute a centered X between left logo and right reference area
const leftEdge = 10 + logoW;        // end of logo box
const rightEdge = pageWidth - 80;   // start of reference block
const centerX = (leftEdge + rightEdge) / 2;

doc.text("SALES INVOICE", centerX, y + 25, { align: "center" });


  // ======================================================
  // RIGHT-TOP HEADER (Debit Note Info)
  // ======================================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  const refX = pageWidth - 65;  // moved 15mm right

doc.text(`Invoice No : ${data[0].DISTRIBUTOR_ID || ""}`, refX, y + 5);
doc.text(`Reference No : ${data[0].REF_NO || ""}`, refX, y + 11);
doc.text(`Date: ${data[0].SALE_DATE || ""}`, refX, y + 17);


  // doc.text(`Dated : ${data[0].SALE_DATE || ""}`, pageWidth - 80, y + 23);

  y += 33;

// ===============================================
// HORIZONTAL LINE ABOVE SELLER + CUSTOMER BLOCKS
// ===============================================
doc.setDrawColor(0);
doc.setLineWidth(0.5);
doc.line(10, y, pageWidth - 10, y);   // full width line

y += 5; // small spacing

  // ======================================================
  // BLUE SELLER BOX (LEFT)
  // ======================================================
  const blueX = 10;
  const blueY = y;
  const blueW = 100;
  const blueH = 38;

  doc.setFillColor(204, 229, 255);
  doc.rect(blueX, blueY, blueW, blueH, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(data[0].COMPANY_NAME || "", blueX + 3, blueY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(data[0].ADDRESS1 || "", blueX + 3, blueY + 13);
  doc.text(data[0].ADDRESS2 || "", blueX + 3, blueY + 18);
  doc.text(data[0].ADDRESS3 || "", blueX + 3, blueY + 23);
  doc.text(`GSTIN/UIN: ${data[0].GSTIN || ""}`, blueX + 3, blueY + 28);
  doc.text(`State : ${data[0].STATE || ""}, Code : ${data[0].STATE_CODE || ""}`,
           blueX + 3, blueY + 33);
  doc.text(`E-Mail : ${data[0].EMAIL || ""}`, blueX + 3, blueY + 38);

  // ======================================================
  // CONSIGNEE (RIGHT SIDE)
  // ======================================================
  const shipX = 115;
  const shipY = y;

  doc.setFont("helvetica", "bold");
  doc.text("Consignee (Ship to)", shipX, shipY + 5);

  doc.setFont("helvetica", "normal");
  doc.text(data[0].CUST_NAME || "", shipX, shipY + 11);
  doc.text(data[0].CUST_ADDRESS1 || "", shipX, shipY + 16);
  doc.text(data[0].CUST_ADDRESS2 || "", shipX, shipY + 21);
  doc.text(data[0].CUST_ADDRESS3 || "", shipX, shipY + 26);
  doc.text(`GSTIN/UIN : ${data[0].CUST_GSTIN || ""}`, shipX, shipY + 31);
  doc.text(`State : ${data[0].CUST_STATE || ""}, Code : ${data[0].STATE_CODE || ""}`,
           shipX, shipY + 36);

  y += 48;

  // ======================================================
  // BUYER (BILL TO)
  // ======================================================
  const billX = 115;
  const billY = y;

  doc.setFont("helvetica", "bold");
  doc.text("Buyer (Bill to)", billX, billY + 5);

  doc.setFont("helvetica", "normal");
  doc.text(data[0].CUST_NAME || "", billX, billY + 11);
  doc.text(data[0].CUST_ADDRESS1 || "", billX, billY + 16);
  doc.text(data[0].CUST_ADDRESS2 || "", billX, billY + 21);
  doc.text(data[0].CUST_ADDRESS3 || "", billX, billY + 26);
  doc.text(`GSTIN/UIN : ${data[0].CUST_GSTIN || ""}`, billX, billY + 31);
  doc.text(`State : ${data[0].CUST_STATE || ""}, Code : ${data[0].STATE_CODE || ""}`,
           billX, billY + 36);

  y += 50;

  // ======================================================
  // TABLE — SAME FORMAT AS IMAGE
  // ======================================================
  const tableColumns = [
    "Transfer No.",
    "Date",
    "Item Description",
    "Total Pair Qty",
    "Price",
    "Amount",
    "Tax %",
    "HSN Code",
    "Tax Amount",
    "Total"
  ];

  const tableRows: any[] = [];
const footerRow = [
  "", "", "", "", "",                                     // 0–4
  "₹ " + Number(data[0].GROSS_AMOUNT).toFixed(2),         // 5  (Amount)
  "", "",  "",                                               // 6–7
  "₹ " + Number(data[0].NET_AMOUNT).toFixed(2)            // 8  (Tax Amount?) WRONG
];



  data[0].SALE_DETAILS.forEach((item: any, index: number) => {
    tableRows.push([
      // index + 1,
      item.TRANSFER_NO || "",
      item.TRANSFER_DATE || "",
      item.DESCRIPTION || "",
      item.TOTAL_PAIR_QTY || "",
      item.PRICE?.toFixed(2) || "",
      // "pairs",
      // `${item.GST || ""} %`,
      item.AMOUNT?.toFixed(2) || "",
      item.GST || "",
      item.HSN_CODE || "",
      item.TAX_AMOUNT || "",
      item.TOTAL_AMOUNT ?.toFixed(2) || "",
      
    ]);
  });
// Move y to bottom of Bill-to block
y = y + 2;

// ===============================
// HORIZONTAL LINE LIKE THE FIGURE
// ===============================
doc.setDrawColor(0);
doc.setLineWidth(0.5);
doc.line(10, y, pageWidth - 10, y);   // Full width horizontal line

y += 5; // small gap before table
  (doc as any).autoTable({
    startY: y,
    head: [tableColumns],
    body: tableRows,
    foot: [footerRow], 
    theme: "grid",
    margin: { left: 10, right: 10 },
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [230, 230, 230], textColor: 0, halign: 'center' },
    footStyles: {
      fillColor: [230, 230, 230],     // same color as header
      textColor: 0,
      fontStyle: "bold",
      halign: "right"
    },
    columnStyles: {
      5: { halign: 'right' },        // Amount column
      9: { halign: 'right' }         // Total column
    }
  });

 y = (doc as any).lastAutoTable.finalY + 12;
// ======================================================
// AMOUNT IN WORDS BLOCKS
// ======================================================

// ------------------------
// 1) GROSS AMOUNT (Amount Chargeable)
// ------------------------
const grossAmount = data[0].GROSS_AMOUNT || 0;
const grossRupees = Math.floor(grossAmount);
const grossPaise = Math.round((grossAmount - grossRupees) * 100);

let grossWords = numberToWordsIndianNumber(grossRupees);
let grossPaiseWords = grossPaise > 0 ? numberToWordsIndianNumber(grossPaise) : "";

let grossText = "INR " + grossWords + " Rupees";
if (grossPaise > 0) grossText += " and " + grossPaiseWords + " Paise";
grossText += " Only";


// ------------------------
// 2) NET AMOUNT (Total Amount)
// ------------------------
const netAmount = data[0].NET_AMOUNT || 0;
const netRupees = Math.floor(netAmount);
const netPaise = Math.round((netAmount - netRupees) * 100);

let netWords = numberToWordsIndianNumber(netRupees);
let netPaiseWords = netPaise > 0 ? numberToWordsIndianNumber(netPaise) : "";

let netText = "INR " + netWords + " Rupees";
if (netPaise > 0) netText += " and " + netPaiseWords + " Paise";
netText += " Only";


// -----------------------------------
// RIGHT SIDE PRINTING (two sections)
// -----------------------------------
const rightX = pageWidth - 90;

doc.setFont("helvetica", "bold");
doc.text("Total Amount Chargeable (in words)", rightX, y);

doc.setFont("helvetica", "normal");
doc.text(grossText, rightX, y + 6, { maxWidth: 85 });

doc.setFont("helvetica", "bold");
doc.text("Total of NetAmount (in words)", rightX, y + 18);

doc.setFont("helvetica", "normal");
doc.text(netText, rightX, y + 24, { maxWidth: 85 });


// -----------------------------------
// LEFT SIDE (E & OE, User, PAN)
// -----------------------------------
const leftX = 10;

doc.setFont("helvetica", "bold");
doc.text("E & OE :", leftX, y);

doc.text(`User : ${data[0].USER || ""}`, leftX, y + 6);

doc.text(`Company's PAN : ${data[0].PAN || ""}`, leftX, y + 12);


// ======================================================
// SIGNATURE BOX WITH COMPANY NAME
// ======================================================
const extraLeft = 20
const signBoxX = pageWidth - 70 - extraLeft;
const signBoxY = y + 34;   // 24 + 10 padding
const signBoxW = 60 + extraLeft;
const signBoxH = 25;

doc.rect(signBoxX, signBoxY, signBoxW, signBoxH);


// Company name inside the box
doc.setFont("helvetica", "bold");
doc.setFontSize(9);
doc.text(`for ${data[0].COMPANY_NAME || ''}`, signBoxX + 3, signBoxY + 10);

// Authorised Signatory text
doc.setFont("helvetica", "normal");
doc.setFontSize(9);
doc.text("Authorised Signatory", signBoxX + 3, signBoxY + 20);


  // ======================================================
  // RETURN PDF
  // ======================================================
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  return this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
}



}

function numberToWordsIndianNumber(num: number) {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero";

  let str = "";

  if (num >= 10000000) {
    str += numberToWordsIndianNumber(Math.floor(num / 10000000)) + " Crore ";
    num %= 10000000;
  }
  if (num >= 100000) {
    str += numberToWordsIndianNumber(Math.floor(num / 100000)) + " Lakh ";
    num %= 100000;
  }
  if (num >= 1000) {
    str += numberToWordsIndianNumber(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }
  if (num >= 100) {
    str += numberToWordsIndianNumber(Math.floor(num / 100)) + " Hundred ";
    num %= 100;
  }
  if (num > 0) {
    if (num < 20) str += a[num];
    else str += b[Math.floor(num / 10)] + " " + a[num % 10];
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
