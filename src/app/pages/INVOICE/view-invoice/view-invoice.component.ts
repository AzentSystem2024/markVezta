import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  OnInit,
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
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-view-invoice',
  templateUrl: './view-invoice.component.html',
  styleUrls: ['./view-invoice.component.scss'],
})
export class ViewInvoiceComponent implements OnInit, OnChanges {
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() invoiceFormData: any;
  @Input() isEditing: boolean = false;
  @Input() isReadOnlyMode: boolean = false;
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
  logoBase64: string;

  pdfSrc: SafeResourceUrl | null = null;
  selectedInvoice: any;
  selected_Company_name: any;
  formatted_To_date: string;
  formatted_from_date: string;
  isPdfPopupVisible: boolean = false;
  selectedSupplierName: any;
  HSNCODE: any;
  GST: any;
  netAmount: string;
  sessionData: any;
  selected_vat_id: any;
  showCGST: boolean;
  showSGST: boolean;
  showGST: boolean;
  selectedCustomer: any;
  companyState: any;
  vatTitle: any;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.selectedCompanyId = userData.SELECTED_COMPANY.COMPANY_ID;
      // this.HSNCODE = userData.GeneralSettings.HSN_CODE;
      this.GST = userData.GeneralSettings.GST_PERC;
    }
  }

  ngOnInit() {
    this.populateCompanyFromSession();
    this.sessionData_tax();
    this.getCompanyListDropdown();
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      this.vatTitle = userData.GeneralSettings.VAT_TITLE;
      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
        this.invoiceFormData.UNIT_ID = selectedCompany.COMPANY_ID; // Set UNIT_ID
        this.companyList = [selectedCompany]; // Show only selected company
      }

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
    const imagePath = 'assets/markLogo.jpg';
    this.convertToBase64(imagePath).then((base64) => {
      this.logoBase64 = base64;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoiceFormData'] && this.invoiceFormData?.length > 0) {
      const firstInvoice = this.invoiceFormData[0];
      this.invoiceFormData.PARTY_NAME = firstInvoice.PARTY_NAME;
      console.table(this.mainInvoiceGridList);

      if (
        firstInvoice.SALE_DATE &&
        typeof firstInvoice.SALE_DATE === 'string'
      ) {
        const [day, month, year] = firstInvoice.SALE_DATE.split('-');
        const date = new Date(+year, +month - 1, +day);
        date.setHours(12, 0, 0);
        firstInvoice.SALE_DATE = date;
      }

      // ORIGINAL LINE (replaced below)
      // this.mainInvoiceGridList = firstInvoice.SALE_DETAILS || [];

      // ----------ONLY THIS BLOCK IS MODIFIED ----------
      // Load saved GST from the API for edit mode
      this.mainInvoiceGridList = (firstInvoice.SALE_DETAILS || []).map(
        (row: any) => {
          const igst = parseFloat(row.GST) || 0;
          const cgst = parseFloat(row.CGST) || 0;
          const sgst = parseFloat(row.SGST) || 0;

          return {
            ...row,

            // GST binding for grid
            GST: igst > 0 ? igst : 0, // IGST → GST column
            // CGST: igst > 0 ? 0 : cgst, // Same-state
            // SGST: igst > 0 ? 0 : sgst, // Same-state
            HSN_CODE: row.HSN_CODE, // keep your HSN logic
          };
        },
      );
      // this.setGstColumnVisibilityFromData(this.mainInvoiceGridList);

      // -----------------------------------------------------

      // Keep your original mapping block untouched
      this.mainInvoiceGridList = this.mainInvoiceGridList.map((row: any) => {
        return {
          ...row,
          HSN_CODE: row.HSN_CODE,
        };
      });

      this.invoiceFormData = firstInvoice;

      this.customerType = firstInvoice.DISTRIBUTOR_ID ? 'Dealer' : 'Unit';
      if (this.customerType === 'Unit') {
        this.populateCompanyFromSession();
      }

      // this.getCompanyListDropdown();
      this.getCustomerOrUnitLst();
    }
  }

  populateCompanyFromSession() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
        this.companyList = [selectedCompany]; // Show only selected company
      }
      if (userData.USER_ID) {
        this.invoiceFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.invoiceFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
  }
  private setGstColumnVisibilityFromData(rows: any[]) {
    if (!rows || !rows.length) {
      this.showGST = false;
      this.showCGST = false;
      this.showSGST = false;
      return;
    }

    const hasIGST = rows.some((r) => Number(r.GST) > 0);

    if (hasIGST) {
      //  IGST case
      this.showGST = true;
      this.showCGST = false;
      this.showSGST = false;
    } else {
      //  CGST + SGST case
      this.showGST = false;
      this.showCGST = true;
      this.showSGST = true;
    }
  }

  getCustomerOrUnitLst() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
      NAME: 'CUSTOMER',
    };
    this.dataService
      .getOutsideCustomerWithState(payload)
      .subscribe((response: any) => {
        this.distributorList = response;

        if (this.invoiceFormData && this.invoiceFormData.DISTRIBUTOR_ID) {
          this.selectedCustomer = this.distributorList.find(
            (cust: any) => cust.ID === this.invoiceFormData.DISTRIBUTOR_ID,
          );

          //  NOW CHECK STATES
          if (this.selectedCustomer && this.companyState) {
            const custState =
              this.selectedCustomer.STATE_NAME.trim().toLowerCase();
            const compState = this.companyState.trim().toLowerCase();

            if (custState === compState) {
              this.showCGST = true;
              this.showSGST = true;
              this.showGST = false;
            } else {
              this.showCGST = false;
              this.showSGST = false;
              this.showGST = true;
            }
          }
        }
      });
  }
  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }
  onDistributorChanged(e: any) {
    if (e && e.value) {
      this.selectedDistributorId = e.value; // this is the selected ID
      if (this.selectedDistributorId) {
        this.selectedSupplierName = this.distributorList.find(
          (s: any) => s.ID === this.selectedDistributorId,
        );
        this.invoiceFormData.PARTY_NAME = this.selectedSupplierName.DESCRIPTION;
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
      this.invoiceGridList = [...this.staticTransfers]; // Initial value
    });
  }

  getDistributorListAfterInput() {
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.distributorList = response;

      //  Ensure ID is correctly matched
      const matched = response.find(
        (d) => d.ID === this.invoiceFormData?.DISTRIBUTOR_ID,
      );

      if (!matched) {
        console.warn(
          'No matching distributor for ID:',
          this.invoiceFormData?.DISTRIBUTOR_ID,
        );
      }
    });
  }

  getCompanyListDropdown() {
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.distributorList = response;
      // Optional: Ensure selected value is set after data arrives
      if (!this.invoiceFormData.DISTRIBUTOR_ID && response.length) {
        const matched = response.find(
          (d) => d.ID === this.invoiceFormData.DISTRIBUTOR_ID,
        );
        if (matched) {
          this.invoiceFormData.DISTRIBUTOR_ID = matched.ID;
        }
      }
    });
  }

  calculateGstAmount = (row: any) => {
    const amt = this.calculateAmount(row);

    // In your mapping:
    // - GST = IGST (for different state)
    // - CGST + SGST (for same state)
    const igst = parseFloat(row.GST) || 0; // IGST stored in GST column
    const cgst = parseFloat(row.CGST) || 0;
    const sgst = parseFloat(row.SGST) || 0;

    let totalGstPercent = 0;

    if (igst > 0) {
      // Different state → IGST only
      totalGstPercent = igst;
    } else {
      // Same state → CGST + SGST
      totalGstPercent = cgst + sgst;
    }

    return amt * (totalGstPercent / 100);
  };

  calculateAmount = (row: any) => {
    return (parseFloat(row.PRICE) || 0) * (parseFloat(row.TOTAL_PAIR_QTY) || 0);
  };

  cancelPopup() {
    this.popupClosed.emit();
  }

  viewPdf(): void {
    this.isPdfPopupVisible = true;
    const invoiceId = this.invoiceFormData.TRANS_ID;
    this.dataService.selectInvoice(invoiceId).subscribe((response: any) => {
      // if (response) {
      //   this.pdfSrc = this.get_pdf(response.Data); // Update iframe source
      // }
      this.get_pdf(response.Data);
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

  logGridSummaries() {
    this.summaryValues = this.itemsGridRef?.instance?.getTotalSummaryValue;

    if (this.summaryValues) {
      this.totalAmount = this.summaryValues('AMOUNT');
      this.taxAmount = this.summaryValues('TAX_AMOUNT');
      this.grandTotal = this.summaryValues('TOTAL_AMOUNT');
      this.netAmount = Number(this.grandTotal).toFixed(2);
      // this.onRoundOffChange();
    } else {
      console.warn('Summary values not ready yet.');
    }
  }
  onContentReady(e: any): void {
    this.logGridSummaries();
  }

  private async convertToBase64(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  numberToWords(amount: number): string {
    if (amount === 0) return 'Zero Rupees Only';

    const words = [
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

    const tens = [
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

    function convert(num: number): string {
      if (num < 20) return words[num];
      if (num < 100)
        return (
          tens[Math.floor(num / 10)] + (num % 10 ? ' ' + words[num % 10] : '')
        );
      if (num < 1000)
        return (
          words[Math.floor(num / 100)] +
          ' Hundred' +
          (num % 100 ? ' ' + convert(num % 100) : '')
        );
      if (num < 100000)
        return (
          convert(Math.floor(num / 1000)) +
          ' Thousand' +
          (num % 1000 ? ' ' + convert(num % 1000) : '')
        );
      if (num < 10000000)
        return (
          convert(Math.floor(num / 100000)) +
          ' Lakh' +
          (num % 100000 ? ' ' + convert(num % 100000) : '')
        );
      return (
        convert(Math.floor(num / 10000000)) +
        ' Crore' +
        (num % 10000000 ? ' ' + convert(num % 10000000) : '')
      );
    }

    return convert(Math.floor(amount)) + ' Rupees Only';
  }

  get_pdf(data: any) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let y = 10;

    // ======================================================
    // LOGO LEFT TOP
    // ======================================================
    const logoX = 18,
      logoY = 12,
      logoW = 30,
      logoH = 30;
    doc.setFillColor(225, 225, 225);
    doc.rect(logoX, logoY, logoW, logoH, 'F');
    doc.addImage(this.logoBase64, 'jpg', logoX, logoY, logoW, logoH);

    // ===============================================
    // SALES INVOICE HEADING (Centered between logo & reference block)
    // ===============================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);

    // compute a centered X between left logo and right reference area
    const leftEdge = 10 + logoW; // end of logo box
    const rightEdge = pageWidth - 80; // start of reference block
    const centerX = (leftEdge + rightEdge) / 2;

    doc.text('SALES INVOICE', centerX, y + 25, { align: 'center' });

    // ======================================================
    // RIGHT-TOP HEADER (Debit Note Info)
    // ======================================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    const refX = pageWidth - 65; // moved 15mm right

    doc.text(`Invoice No : ${data[0].DISTRIBUTOR_ID || ''}`, refX, y + 5);
    doc.text(`Reference No : ${data[0].REF_NO || ''}`, refX, y + 11);
    doc.text(`Date: ${data[0].SALE_DATE || ''}`, refX, y + 17);

    // doc.text(`Dated : ${data[0].SALE_DATE || ""}`, pageWidth - 80, y + 23);

    y += 33;

    // ===============================================
    // HORIZONTAL LINE ABOVE SELLER + CUSTOMER BLOCKS
    // ===============================================
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, y, pageWidth - 10, y); // full width line

    y += 5; // small spacing

    // ======================================================
    // BLUE SELLER BOX (LEFT)
    // ======================================================
    const blueX = 10;
    const blueY = y;
    const blueW = 100;
    const blueH = 38;

    doc.setFillColor(204, 229, 255);
    doc.rect(blueX, blueY, blueW, blueH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(data[0].COMPANY_NAME || '', blueX + 3, blueY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(data[0].ADDRESS1 || '', blueX + 3, blueY + 13);
    doc.text(data[0].ADDRESS2 || '', blueX + 3, blueY + 18);
    doc.text(data[0].ADDRESS3 || '', blueX + 3, blueY + 23);
    doc.text(`GSTIN/UIN: ${data[0].GSTIN || ''}`, blueX + 3, blueY + 28);
    doc.text(
      `State : ${data[0].STATE || ''}, Code : ${data[0].STATE_CODE || ''}`,
      blueX + 3,
      blueY + 33,
    );
    doc.text(`E-Mail : ${data[0].EMAIL || ''}`, blueX + 3, blueY + 38);

    // ======================================================
    // CONSIGNEE (RIGHT SIDE)
    // ======================================================
    const shipX = 115;
    const shipY = y;

    doc.setFont('helvetica', 'bold');
    doc.text('Consignee (Ship to)', shipX, shipY + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(data[0].CUST_NAME || '', shipX, shipY + 11);
    doc.text(data[0].CUST_ADDRESS1 || '', shipX, shipY + 16);
    doc.text(data[0].CUST_ADDRESS2 || '', shipX, shipY + 21);
    doc.text(data[0].CUST_ADDRESS3 || '', shipX, shipY + 26);
    doc.text(`GSTIN/UIN : ${data[0].CUST_GSTIN || ''}`, shipX, shipY + 31);
    doc.text(
      `State : ${data[0].CUST_STATE || ''}, Code : ${data[0].STATE_CODE || ''}`,
      shipX,
      shipY + 36,
    );

    y += 48;

    // ======================================================
    // BUYER (BILL TO)
    // ======================================================
    const billX = 115;
    const billY = y;

    doc.setFont('helvetica', 'bold');
    doc.text('Buyer (Bill to)', billX, billY + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(data[0].CUST_NAME || '', billX, billY + 11);
    doc.text(data[0].CUST_ADDRESS1 || '', billX, billY + 16);
    doc.text(data[0].CUST_ADDRESS2 || '', billX, billY + 21);
    doc.text(data[0].CUST_ADDRESS3 || '', billX, billY + 26);
    doc.text(`GSTIN/UIN : ${data[0].CUST_GSTIN || ''}`, billX, billY + 31);
    doc.text(
      `State : ${data[0].CUST_STATE || ''}, Code : ${data[0].STATE_CODE || ''}`,
      billX,
      billY + 36,
    );

    y += 50;

    // ======================================================
    // TABLE — SAME FORMAT AS IMAGE
    // ======================================================
    const tableColumns = [
      'Transfer No.',
      'Date',
      'Item Description',
      'Total Pair Qty',
      'Price',
      'Amount',
      'Tax %',
      'HSN Code',
      'Tax Amount',
      'Total',
    ];

    const tableRows: any[] = [];
    const footerRow = [
      '',
      '',
      '',
      '',
      '', // 0–4
      '₹ ' + Number(data[0].GROSS_AMOUNT).toFixed(2), // 5  (Amount)
      '',
      '',
      '', // 6–7
      '₹ ' + Number(data[0].NET_AMOUNT).toFixed(2), // 8  (Tax Amount?) WRONG
    ];

    data[0].SALE_DETAILS.forEach((item: any, index: number) => {
      tableRows.push([
        // index + 1,
        item.TRANSFER_NO || '',
        item.TRANSFER_DATE || '',
        item.DESCRIPTION || '',
        item.TOTAL_PAIR_QTY || '',
        item.PRICE?.toFixed(2) || '',
        // "pairs",
        // `${item.GST || ""} %`,
        item.AMOUNT?.toFixed(2) || '',
        item.GST || '',
        item.HSN_CODE || '',
        item.TAX_AMOUNT || '',
        item.TOTAL_AMOUNT?.toFixed(2) || '',
      ]);
    });
    // Move y to bottom of Bill-to block
    y = y + 2;

    // ===============================
    // HORIZONTAL LINE LIKE THE FIGURE
    // ===============================
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, y, pageWidth - 10, y); // Full width horizontal line

    y += 5; // small gap before table
    (doc as any).autoTable({
      startY: y,
      head: [tableColumns],
      body: tableRows,
      foot: [footerRow],
      theme: 'grid',
      margin: { left: 10, right: 10 },
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: {
        fillColor: [230, 230, 230],
        textColor: 0,
        halign: 'center',
      },
      footStyles: {
        fillColor: [230, 230, 230], // same color as header
        textColor: 0,
        fontStyle: 'bold',
        halign: 'right',
      },
      columnStyles: {
        5: { halign: 'right' }, // Amount column
        9: { halign: 'right' }, // Total column
      },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // ============================================================
    // FOOTER – GST SUMMARY + TOTALS (LIKE generatePDF)
    // ============================================================

    const footStartY = y + 3;

    // ---------------- LEFT GST SUMMARY ----------------
    let lx = 15;
    let ly = footStartY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    // Header
    doc.text('GST %', lx, ly);
    doc.text('Taxable Value', lx + 22, ly);
    doc.text('Integrated Tax', lx + 55, ly);
    doc.text('Total Tax Amount', lx + 95, ly);

    // Sub headers
    doc.setFontSize(8);
    doc.text('Rate', lx + 55, ly + 5);
    doc.text('Amount', lx + 72, ly + 5);

    // Values
    ly += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const taxable = Number(data[0].GROSS_AMOUNT || 0);
    const gstAmount = Number(data[0].TAX_AMOUNT || 0);
    const gstPerc =
      Number(data[0].SALE_DETAILS[0]?.CGST || 0) +
      Number(data[0].SALE_DETAILS[0]?.SGST || 0);

    doc.text(gstPerc.toFixed(2) + '%', lx, ly);
    doc.text(taxable.toFixed(2), lx + 22, ly);
    doc.text(gstPerc.toFixed(2) + '%', lx + 55, ly);
    doc.text(gstAmount.toFixed(2), lx + 72, ly);
    doc.text(gstAmount.toFixed(2), lx + 95, ly);

    // Total row
    ly += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(taxable.toFixed(2), lx + 22, ly);
    doc.text(gstAmount.toFixed(2), lx + 72, ly);
    doc.text(gstAmount.toFixed(2), lx + 95, ly);

    // ---------------- RIGHT TOTAL SUMMARY ----------------
    let rx = pageWidth - 65;
    let ry = footStartY;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const labelX = rx;
    const colonX = rx + 30;
    const valueX = rx + 40;

    doc.text('Taxable Value', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(taxable.toFixed(2), valueX, ry);

    ry += 6;
    doc.text('Total Tax', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(gstAmount.toFixed(2), valueX, ry);

    ry += 6;
    doc.text('Round Off', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text('0.00', valueX, ry);

    ry += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Total', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(Number(data[0].NET_AMOUNT).toFixed(2), valueX, ry);

    // ---------------- REVERSE CHARGE ----------------
    let wordsY = ry + 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Whether the tax is payable on Reverse charge basis:', 15, wordsY);

    doc.setFont('helvetica', 'normal');
    doc.text('No', 150, wordsY);

    // ---------------- AMOUNT IN WORDS ----------------
    wordsY += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Amount in words :', 15, wordsY);

    doc.setFont('helvetica', 'normal');
    doc.text(
      `INR ${numberToWordsIndianNumber(Math.floor(data[0].NET_AMOUNT))} Rupees Only`,
      60,
      wordsY,
    );

    // ---------------- DECLARATION & REMARK ----------------
    let blockY = wordsY + 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Declaration :', 15, blockY);

    blockY += 10;
    doc.text('Remark :', 15, blockY);

    doc.setFont('helvetica', 'normal');
    doc.text(data[0].REF_NO || '', 40, blockY);

    // ======================================================
    // RETURN PDF
    // ======================================================
    // const pdfBlob = doc.output('blob');
    // const pdfUrl = URL.createObjectURL(pdfBlob);
    // return this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
    doc.output('dataurlnewwindow');
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
