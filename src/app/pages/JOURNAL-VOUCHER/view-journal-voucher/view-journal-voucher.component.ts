import {
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
  DxBoxModule,
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
import { EditJournalVoucherComponent } from '../edit-journal-voucher/edit-journal-voucher.component';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { DataService } from 'src/app/services';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-view-journal-voucher',
  templateUrl: './view-journal-voucher.component.html',
  styleUrls: ['./view-journal-voucher.component.scss'],
})
export class ViewJournalVoucherComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() journalVoucherFormData: any = {
    TRANS_ID: 0,
    TRANS_DATE: new Date(),
    DOC_NO: '',
    PARTY_NAME: '',
    REFERENCE_NO: '',
    TRANS_TYPE: 4,
    NARRATION: '',
    USER_ID: 1,
    DETAILS: [],
  };
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;
  @Input() JVid: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter:boolean= true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  ledgerList: any;
  ledgerCodeEditorOptions: any = {};
  ledgerNameEditorOptions: any = {};
  isReadOnly = false;
  Company_list: any = [];
  logoBase64: string='';

  pdfSrc: SafeResourceUrl | null = null;
  isPdfPopupVisible: boolean = false;
  selectedCompanyId: any;
  storeList: any;
  departmentList: any;

  constructor(
    private dataService: DataService,
    private sanitizer: DomSanitizer,
  ) {
    this.Deparment_Drop_down();
  }

  ngOnInit() {
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selectedCompanyId = menuResponse?.SELECTED_COMPANY?.COMPANY_ID || null;
    this.getLedgerCodeDropdown();
    this.Deparment_Drop_down();

    const imagePath = 'assets/markLogo.jpg';
    this.convertToBase64(imagePath).then((base64) => {
      this.logoBase64 = base64;
    });
    this.getStoreData();
    this.getDepartments();
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

  Deparment_Drop_down() {
    this.dataService.Department_Dropdown().subscribe((res: any) => {
      console.log(
        res,
        '========================department data=========================',
      );

      this.Company_list = res;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['journalVoucherFormData'] &&
      changes['journalVoucherFormData'].currentValue
    ) {
      const incomingData = changes['journalVoucherFormData'].currentValue;
      console.log(this.journalVoucherFormData.DEPT_ID, 'INCOMINGDATA');
      this.journalVoucherFormData.DEPT_ID = incomingData.DEPT_ID;
      const transformedDetails = (incomingData.DETAILS || []).map(
        (item: any) => {
          const matchedLedger = this.ledgerList.find(
            (l: any) =>
              l.HEAD_CODE === item.LEDGER_CODE ||
              l.HEAD_NAME === item.LEDGER_NAME,
          );

          return {
            billNo: item.BILL_NO ?? '',
            ledgerCode: matchedLedger?.HEAD_CODE ?? item.LEDGER_CODE ?? '',
            ledgerName: matchedLedger?.HEAD_NAME ?? item.LEDGER_NAME ?? '',
            particulars: item.PARTICULARS ?? '',
            debitAmount: item.DEBIT_AMOUNT ?? '',
            creditAmount: item.CREDIT_AMOUNT ?? '',
            STORE_ID: item.STORE_ID ?? null,
            DEPT_ID: item.DEPT_ID ?? null,
          };
        },
      );

      const userDataString = localStorage.getItem('userData');
      let defaultCompanyId = '';
      let defaultUserId = '';
      let defaultFinId = '';

      if (userDataString) {
        const userData = JSON.parse(userDataString);
        defaultCompanyId = userData?.SELECTED_COMPANY?.COMPANY_ID || '';
        defaultUserId = userData?.USER_ID || '';
        defaultFinId = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID || '';
      }

      this.journalVoucherFormData = {
        COMPANY_ID: incomingData.COMPANY_ID ?? defaultCompanyId,
        FIN_ID: incomingData.FIN_ID ?? defaultFinId,
        USER_ID: incomingData.USER_ID ?? defaultUserId,
        ...incomingData,
        DETAILS: transformedDetails,
      };

      this.isReadOnly = !!this.journalVoucherFormData.IS_APPROVED;
      if (this.dataGrid?.instance) {
        this.dataGrid.instance.refresh();
      }
    }
  }
  
  getStoreData() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDropdownData(payload).subscribe((res) => {
      this.storeList = res;
    });
  }

  getDepartments() {
    const payload = {
      NAME: 'DEPT',
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDropdownData(payload).subscribe((res) => {
      this.departmentList = res;
    });
  }

  formatDateToDDMMYYYY(date: any): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getLedgerCodeDropdown() {
    this.dataService.getActiveLedger().subscribe((response: any) => {
      this.ledgerList = response.Data;

      // Only transform if form data already loaded
      if (this.journalVoucherFormData?.DETAILS?.length) {
        this.journalVoucherFormData.DETAILS =
          this.journalVoucherFormData.DETAILS.map((item: any) => {
            const matchedLedger = this.ledgerList.find(
              (l: any) => l.HEAD_CODE === item.LEDGER_CODE,
            );

            return {
              billNo: item.BILL_NO ?? '',
              ledgerCode: item.LEDGER_CODE ?? '',
              ledgerName:
                item.LEDGER_NAME?.trim() !== ''
                  ? item.LEDGER_NAME
                  : (matchedLedger?.HEAD_NAME ?? ''),
              particulars: item.PARTICULARS ?? '',
              debitAmount: item.DEBIT_AMOUNT ?? '',
              creditAmount: item.CREDIT_AMOUNT ?? '',
            };
          });
      }
    });
  }

  cancel() {
    this.popupClosed.emit();
  }

  viewPdf(): void {
    // this.isPdfPopupVisible = true;
    this.dataService
      .selectJournalVoucher(this.JVid)
      .subscribe((response: any) => {
        // if (response) {
        //   this.pdfSrc = this.get_pdf(response);
        // }
        this.get_pdf(response);
      });
  }

  get_pdf(data: any) {
    // ============================
    // NORMALIZE API RESPONSE
    // ============================
    const header = data; // whole object is header
    const details = data.DETAILS || []; // correct property name

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let y = 10;

    // ============================
    // LOGO
    // ============================
    const logoX = 18;
    const logoY = 12;
    const logoW = 30;
    const logoH = 30;

    doc.setFillColor(225, 225, 225);
    doc.rect(logoX, logoY, logoW, logoH, 'F');

    if (this.logoBase64) {
      doc.addImage(this.logoBase64, 'jpg', logoX, logoY, logoW, logoH);
    }

    // ============================
    // TITLE
    // ============================
    y = logoY + logoH + 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('JOURNAL VOUCHER', pageWidth / 2, y, { align: 'center' });

    // ============================
    // RIGHT HEADER DETAILS
    // ============================
    doc.setFontSize(10);
    const rightX = pageWidth - 70;

    doc.text(`Return No : ${data.REF_NO}`, rightX, logoY + 5);
    doc.text(`Return Date : ${data.TRANS_DATE || '-'}`, rightX, logoY + 11);
    doc.text(`Sale No : ${data.REF_NO}`, rightX, logoY + 17);

    // ============================
    // HORIZONTAL LINE
    // ============================
    y += 8;
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    // ============================
    // SELLER (BLUE BOX - LEFT)
    // ============================
    const leftX = margin;
    let blockY = y;
    const leftW = 95;
    const leftH = 48;

    doc.setFillColor(214, 236, 255);
    doc.rect(leftX, blockY, leftW, leftH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(String(data.NARRATION), leftX + 3, blockY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(String(data.NARRATION) || 'Kallai', leftX + 3, blockY + 12);
    doc.text(String(data.NARRATION) || 'Kozhikode', leftX + 3, blockY + 17);
    doc.text(String(data.NARRATION) || 'Kozhikode', leftX + 3, blockY + 22);
    doc.text(`GSTIN/UIN : ${String(data.NARRATION)}`, leftX + 3, blockY + 27);
    doc.text(`State : KERALA, Code : 32`, leftX + 3, blockY + 32);
    doc.text(
      `E-Mail : ${String(data.NARRATION) || '-'}`,
      leftX + 3,
      blockY + 37,
    );

    // ============================
    // CONSIGNEE (SHIP TO) - RIGHT
    // ============================
    const rightBlockX = 120;
    let rightY = blockY + 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Consignee (Ship to)', rightBlockX, rightY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    rightY += 6;

    doc.text(String(data.NARRATION), rightBlockX, rightY);
    doc.text(String(data.NARRATION) || 'Kozhikode', rightBlockX, rightY + 5);
    doc.text(String(header.NARRATION) || 'Kozhikode', rightBlockX, rightY + 10);
    doc.text(String(data.NARRATION) || 'Kozhikode', rightBlockX, rightY + 15);
    doc.text(`GSTIN/UIN : ${String(data.NARRATION)}`, rightBlockX, rightY + 20);
    doc.text(`State : KERALA, Code : 32`, rightBlockX, rightY + 25);

    // ============================
    // DISPATCHED FROM - LEFT BELOW
    // ============================
    let dispatchY = blockY + leftH + 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Dispatched From', leftX, dispatchY);

    doc.setFont('helvetica', 'normal');
    dispatchY += 6;
    doc.text(String(header.NARRATION), leftX, dispatchY);
    doc.text(String(header.NARRATION) || 'Kozhikode', leftX, dispatchY + 5);
    doc.text(String(header.NARRATION) || 'Kozhikode', leftX, dispatchY + 10);
    doc.text(String(header.NARRATION) || 'Kozhikode', leftX, dispatchY + 15);
    doc.text(`GSTIN/UIN : ${String(header.NARRATION)}`, leftX, dispatchY + 20);

    // ============================
    // BUYER (BILL TO) - RIGHT BELOW
    // ============================
    let buyerY = dispatchY;

    doc.setFont('helvetica', 'bold');
    doc.text('Buyer (Bill to)', rightBlockX, buyerY);

    doc.setFont('helvetica', 'normal');
    buyerY += 6;
    doc.text(String(header.NARRATION), rightBlockX, buyerY);
    doc.text(String(header.NARRATION) || 'Kozhikode', rightBlockX, buyerY + 5);
    doc.text(String(header.NARRATION) || 'Kozhikode', rightBlockX, buyerY + 10);
    doc.text(String(header.NARRATION) || 'Kozhikode', rightBlockX, buyerY + 15);
    doc.text(
      `GSTIN/UIN : ${String(header.NARRATION)}`,
      rightBlockX,
      buyerY + 20,
    );
    // doc.text(`State : KERALA, Code : 32`, rightBlockX, buyerY + 25);

    // ============================
    // INVOICE INFO - LEFT
    // ============================
    let infoY = buyerY + 35;

    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice Serial No : ${header}`, leftX, infoY);

    doc.setFont('helvetica', 'normal');
    infoY += 6;
    doc.text(`Invoice Date : ${header.TRANS_DATE}`, leftX, infoY);
    infoY += 6;
    doc.text(`Vehicle No : ${String(header.NARRATION) || '-'}`, leftX, infoY);
    infoY += 6;
    doc.text(`Mode of Transport :`, leftX, infoY);

    // ============================
    // MOVE Y FOR TABLE
    // ============================
    y = infoY + 10;

    // ============================
    // TABLE
    // ============================

    const rows = details.map((item: any, index: number) => [
      index + 1,
      item.BILL_NO || '-',
      item.LEDGER_CODE || '-',
      item.LEDGER_NAME || '-',
      item.PARTICULARS || '-',
      Number(item.DEBIT_AMOUNT).toFixed(2),
      Number(item.CREDIT_AMOUNT).toFixed(2),
    ]);

    autoTable(doc, {
      startY: y,
      head: [
        [
          'Bill No.',
          'Ledger Code',
          'Ledger Name',
          'Particulars',
          'Debit Amount',
          'Credit Amount',
        ],
      ],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 9, overflow: 'linebreak' },
      headStyles: { fillColor: [230, 230, 230] },
      foot: [
        [
          {
            content: 'Total',
            colSpan: 9,
            styles: { halign: 'right', fontStyle: 'bold' },
          },
          {
            content: Number(header).toFixed(2),
            styles: { fontStyle: 'bold' },
          },
        ],
      ],
    });

    const pageHeight = doc.internal.pageSize.getHeight();
    const footerRequiredHeight = 90; // approx height of footer block

    let footY = (doc as any).lastAutoTable.finalY + 15;

    //  If footer won't fit, move to next page
    if (footY + footerRequiredHeight > pageHeight) {
      doc.addPage();
      footY = 20; // reset top margin for footer
    }

    // ============================
    // FOOTER (EXACT SCREENSHOT)
    // ============================
    // const footY = (doc as any).lastAutoTable.finalY + 15;

    const taxableValue = Number(header.REF_NO || 0);
    const totalTax = Number(header.REF_NO || 0);
    const invoiceTotal = taxableValue + totalTax;

    const gstPerc = Number(details || 0) + Number(details || 0);

    // // ---------- LEFT GST SUMMARY ----------
    let lx = 15;
    let ly = footY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    doc.text('GST %', lx, ly);
    doc.text('Taxable Value', lx + 22, ly);
    doc.text('Rate', lx + 55, ly);
    doc.text('Amount', lx + 75, ly);
    doc.text('Total Tax Amount', lx + 90, ly);

    ly += 8;
    doc.setFont('helvetica', 'normal');

    doc.text(`${gstPerc.toFixed(2)}%`, lx, ly);
    doc.text(taxableValue.toFixed(2), lx + 22, ly);
    doc.text(`${gstPerc.toFixed(2)}%`, lx + 55, ly);
    doc.text(totalTax.toFixed(2), lx + 75, ly);
    doc.text(totalTax.toFixed(2), lx + 90, ly);

    ly += 8;
    doc.setFont('helvetica', 'bold');
    doc.text(taxableValue.toFixed(2), lx + 22, ly);
    doc.text(totalTax.toFixed(2), lx + 75, ly);
    doc.text(totalTax.toFixed(2), lx + 100, ly);

    // ---------- RIGHT TOTAL SUMMARY ----------
    let rx = pageWidth - 60;
    let ry = footY;

    doc.setFont('helvetica', 'normal');

    doc.text('Taxable Value', rx, ry);
    doc.text(':', rx + 30, ry);
    doc.text(taxableValue.toFixed(2), rx + 40, ry);

    ry += 6;
    doc.text('Total Tax', rx, ry);
    doc.text(':', rx + 30, ry);
    doc.text(totalTax.toFixed(2), rx + 40, ry);

    ry += 6;
    doc.text('TCS', rx, ry);
    doc.text(':', rx + 30, ry);
    doc.text('0.00', rx + 40, ry);

    ry += 6;
    doc.text('Round Off', rx, ry);
    doc.text(':', rx + 30, ry);
    doc.text('0.00', rx + 40, ry);

    ry += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Total', rx, ry);
    doc.text(':', rx + 30, ry);
    doc.text(invoiceTotal.toFixed(2), rx + 40, ry);

    // ---------- REVERSE CHARGE ----------
    ry += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Whether the tax is payable on Reverse charge basis:', 15, ry);

    doc.setFont('helvetica', 'normal');
    doc.text('No Amount of tax subject to reverse charge', 120, ry);

    // ---------- AMOUNT IN WORDS ----------
    ry += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Amount in words :', 15, ry);

    doc.setFont('helvetica', 'normal');
    doc.text(`INR ${this.numberToWords(invoiceTotal)} Rupees Only`, 60, ry);

    // ---------- DECLARATION / REMARK ----------
    ry += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Declaration :', 15, ry);

    ry += 10;
    doc.text('Remark :', 15, ry);

    doc.setFont('helvetica', 'normal');
    doc.text(header.NARRATION || '-', 40, ry);

    // ============================
    // OPEN PDF
    // ============================
    doc.output('dataurlnewwindow');
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
    DxBoxModule,
  ],
  providers: [],
  declarations: [ViewJournalVoucherComponent],
  exports: [ViewJournalVoucherComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ViewJournalVoucherModule {}
