import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  DxValidationGroupComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxNumberBoxComponent,
  DxSelectBoxComponent,
  DxTextBoxComponent,
} from 'devextreme-angular';
import { ListMiscReceiptComponent } from '../list-misc-receipt/list-misc-receipt.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-edit-misc-receipt',
  templateUrl: './edit-misc-receipt.component.html',
  styleUrls: ['./edit-misc-receipt.component.scss'],
})
export class EditMiscReceiptComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() miscellaneousData: any;
  @Input() isReadOnlyMode: boolean = false;
  @ViewChild('miscFormGroup') miscFormGroup: DxValidationGroupComponent;
  @ViewChild('invoiceBoxRef', { static: false })
  invoiceBoxRef!: DxTextBoxComponent;
  @ViewChild('customerRef', { static: false })
  customerRef!: DxSelectBoxComponent;
  @ViewChild('customerTypeRef', { static: false, read: ElementRef })
  customerTypeElementRef!: ElementRef;
  @ViewChild('distributorRef', { static: false })
  distributorRef!: DxSelectBoxComponent;
  @ViewChild('dueAmountRef', { static: false })
  dueAmountRef!: DxNumberBoxComponent;
  @ViewChild('narrationRef', { static: false })
  narrationRef!: DxTextBoxComponent;
  @ViewChild('saveButtonRef', { static: false })
  saveButtonRef!: DxButtonComponent;
  @ViewChild('beneficiaryNameRef', { static: false })
  beneficiaryNameRef!: DxTextBoxComponent;
  @ViewChild('taxRegnRef', { static: false })
  taxRegnRef!: DxTextBoxComponent;
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  userId: any;
  companyId: any;
  finId: any;
  ledgerList: any;
  receiptMode: string = 'Cash';
  filteredLedgerList: any;
  pendingInvoicelist: any[] = [
    {
      ledgerCode: '',
      ledgerName: '',
      DESCRIPTION: '',
      AMOUNT: null,
      TAX: null,
      TAX_AMOUNT: null,
    },
  ];
  miscFormData: any;
  CashID: any;
  settings: any;
  BankID: any;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getLedgerCodeDropdown();
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.userId = userData?.USER_ID;
      this.companyId = userData?.SELECTED_COMPANY?.COMPANY_ID;
      this.finId = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID;
    }
    this.AC_Default();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['miscellaneousData'] &&
      changes['miscellaneousData'].currentValue
    ) {
      const data = changes['miscellaneousData'].currentValue.Data;

      // Assign main data to miscFormData
      this.miscFormData = {
        ...this.miscFormData,
        ...data,
      };

      // Assign DetailList to pendingInvoiceList
      this.pendingInvoicelist = data.DetailList || [];

      this.pendingInvoicelist = (data.DetailList || []).map((item: any) => {
        const ledger = this.ledgerList.find(
          (l: any) => l.HEAD_CODE === item.HEAD_ID,
        );
        return {
          ...item,
          ledgerCode: item.LEDGER_CODE,
          ledgerName: ledger?.LEDGER_NAME || '',
        };
      });
      const matchedLedger = this.ledgerList.find(
        (ledger: any) => ledger.HEAD_CODE === this.miscFormData.LEDGER_CODE,
      );

      if (matchedLedger) {
        this.miscFormData.HEAD_ID = matchedLedger.HEAD_ID;
      } else {
        console.warn(
          'No matching HEAD_ID found for LEDGER_CODE:',
          this.miscFormData.LEDGER_CODE,
        );
      }
      const lastRow =
        this.miscFormData.MISC_DETAIL[this.miscFormData.MISC_DETAIL.length - 1];
      this.pendingInvoicelist = (data.DetailList || []).map((item: any) => {
        const ledger = this.ledgerList.find(
          (l: any) => l.HEAD_CODE === item.HEAD_ID,
        );
        return {
          ...item,
          ledgerCode: item.LEDGER_CODE,
          ledgerName: ledger?.LEDGER_NAME || '',
        };
      });

      // Ensure empty row exists
      if (
        this.pendingInvoicelist.length === 0 ||
        this.pendingInvoicelist[this.pendingInvoicelist.length - 1].ledgerCode
      ) {
        this.pendingInvoicelist.push({
          HEAD_ID: '',
          DESCRIPTION: '',
          AMOUNT: '',
          TAX: '',
          TAX_AMOUNT: '',
          ledgerCode: '',
          ledgerName: '',
        });
      }

      // this.receiptMode = this.getReceiptModeFromPayTypeId(data.PAY_TYPE_ID);
    }
  }

          AC_Default(){
   const payload = {
    CompanyID : this.companyId
   }
    this.dataService.AC_Default_Settings_Api(payload).subscribe((res:any)=>{
      console.log(res)
      this.settings = res.Data
      this.CashID = this.settings.GP_CASH_ID;  
      console.log(this.CashID) 
      this.BankID = this.settings.GP_BANK_ID;
      console.log(this.BankID)
    })
  }
  
  getLedgerCodeDropdown() {
    this.dataService.getAccountHeadList().subscribe({
      next: (response: any) => {
        this.ledgerList = response?.Data || []; // Fallback to empty array
        this.onReceiptModeChange({ value: this.receiptMode });
      },
      error: (err) => {
        console.error('Ledger API Error:', err); // <== CATCH ERRORS
      },
    });
  }

  onReceiptModeChange(e: any) {
    this.receiptMode = e.value;

    if (this.receiptMode === 'Cash') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID === this.CashID,
      );
    } else if (this.receiptMode === 'Bank') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID === this.BankID,
      );
    } else if (this.receiptMode === 'Adjustments') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID !== this.CashID && item.GROUP_ID !== this.BankID,
      );
    } else {
      this.filteredLedgerList = [...this.ledgerList]; // For 'PDC' or others
    }
  }
}
