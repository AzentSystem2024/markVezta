import {
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
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';

import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-add-salary-payment',
  templateUrl: './add-salary-payment.component.html',
  styleUrls: ['./add-salary-payment.component.scss'],
})
export class AddSalaryPaymentComponent implements OnInit, OnChanges {
  // --- Inputs, Outputs & ViewChildren ---
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();

  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;

  // --- Session & User Data ---
  userId: any;
  companyId: any;
  finId: any;
  selectedstoreId: any;
  selected_Company_id: any;
  docNo: any;
  isApproved: boolean = false;

  // --- Form & Grid Data ---
  ledgerList: any[] = [];
  filteredLedgerList: any[] = [];
  receiptMode: string = 'Cash';
  salaryPendingList: any[] = [];
  selectedIds: any[] = [];
  selectedRows: any[] = [];

  // --- Date Selection ---
  selectedMonth: Date = new Date();
  selectedMonthForAdd: string;
  selectedYear: number;
  calendarVisible = false;
  yearSelectorVisible = false;
  years: number[] = [];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  previousYearButtonOptions = {
    text: '<',
    stylingMode: 'text',
    onClick: () => this.selectedYear--,
    elementAttr: { class: 'year-button' },
  };

  nextYearButtonOptions = {
    text: '>',
    stylingMode: 'text',
    onClick: () => this.selectedYear++,
    elementAttr: { class: 'year-button' },
  };

  // --- Payload ---
  salaryPaymentData: any = {
    COMPANY_ID: '',
    FIN_ID: '',
    STORE_ID: 0,
    TRANS_DATE: new Date(),
    PAY_TYPE_ID: '',
    PAY_HEAD_ID: '',
    NARRATION: '',
    TRANS_TYPE: 30,
    CHEQUE_NO: '',
    CHEQUE_DATE: '',
    BANK_NAME: '',
    CREATE_USER_ID: '',
    SUPP_ID: 0,
    SALARY_PAY_DETAIL: [],
  };

  constructor(private dataService: DataService) {}

  // =========== Lifecycle Hooks ===========

  ngOnInit() {
    this.loadUserData();
    this.sessionDetails();
    this.getLedgerCodeDropdown();
    this.getDocNo();
    if (!this.isEditing) {
      this.getSalaryPendingList();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['EditingResponseData']?.currentValue) {
      this.isEditDataAvailable();
    }
  }

  // =========== Initialization & Data Fetching ===========

  private loadUserData() {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return;

    const userData = JSON.parse(userDataString);
    this.userId = userData?.USER_ID;
    this.companyId = userData?.SELECTED_COMPANY?.COMPANY_ID;
    this.finId = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID;

    if (this.finId) {
      this.salaryPaymentData.FIN_ID = this.finId;
    }
  }

  private sessionDetails() {
    const sessionDataStr = sessionStorage.getItem('savedUserData');
    if (sessionDataStr) {
      const sessionData = JSON.parse(sessionDataStr);
      this.selectedstoreId = sessionData?.Configuration?.[0]?.STORE_ID;
      this.selected_Company_id = sessionData?.SELECTED_COMPANY?.COMPANY_ID;
    }
  }

  private getDocNo() {
    if (!this.selected_Company_id) return;
    
    const payload = {
      TRANS_TYPE: 30,
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.docNo = response.DOC_NO;
    });
  }

  private getLedgerCodeDropdown() {
    this.dataService.getAccountHeadList().subscribe({
      next: (response: any) => {
        this.ledgerList = response?.Data || [];
        this.onReceiptModeChange({ value: this.receiptMode });
      },
      error: () => {},
    });
  }

  private isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    const data = Array.isArray(this.EditingResponseData)
      ? this.EditingResponseData[0]
      : this.EditingResponseData;

    const payTypeReverseMapping: Record<number, string> = {
      1: 'Cash',
      2: 'Bank',
      3: 'PDC',
      4: 'Adjustments',
    };
    this.receiptMode = payTypeReverseMapping[data.PAY_TYPE_ID] || 'Cash';

    this.salaryPaymentData.VOUCHER_NO = data.VOUCHER_NO || '';
    this.salaryPaymentData.TRANS_DATE = this.parseDateString(data.TRANS_DATE);
    
    if (data.SAL_MONTH) {
      const [month, year] = data.SAL_MONTH.split('-').map(Number);
      this.selectedMonth = new Date(year, month - 1, 1, 12);
      this.selectedYear = year;
    }

    this.salaryPaymentData.CHEQUE_NO = data.CHEQUE_NO;
    this.salaryPaymentData.CHEQUE_DATE = this.parseDateString(data.CHEQUE_DATE);
    this.salaryPaymentData.BANK_NAME = data.BANK_NAME;
    this.salaryPaymentData.NARRATION = data.NARRATION;
    this.salaryPaymentData.TRANS_ID = data.TRANS_ID;
    this.salaryPaymentData.PAY_HEAD_ID = data.PAY_HEAD_ID;

    this.getSalaryPendingList();
  }

  private parseDateString(dateStr: any): Date | null {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
        const parts = dateStr.split('-');
        // Check for DD-MM-YYYY format
        if (parts.length === 3 && parts[0].length === 2 && parts[2].length >= 4) {
             const day = parseInt(parts[0], 10);
             const month = parseInt(parts[1], 10) - 1;
             const year = parseInt(parts[2].substring(0, 4), 10);
             const parsedDate = new Date(year, month, day);
             if (!isNaN(parsedDate.getTime())) return parsedDate;
        }
    }
    
    const fallbackDate = new Date(dateStr);
    return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  }

  private getSalaryPendingList() {
    if (!this.companyId) {
      this.loadUserData();
    }
    if (!this.companyId || !this.selectedMonth) return;

    const payload = {
      COMPANY_ID: this.companyId,
      SAL_MONTH: `${(this.selectedMonth.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${this.selectedMonth.getFullYear()}`,
    };

    this.dataService.getPendingSalaryPayments(payload).subscribe((response: any) => {
      const pendingList = response?.data || [];
      
      if (this.isEditing && this.EditingResponseData) {
        const data = Array.isArray(this.EditingResponseData)
          ? this.EditingResponseData[0]
          : this.EditingResponseData;
          
        const savedList = data.DetailList || [];
        const savedIds = new Set(savedList.map((item: any) => item.ID));
        
        const mergedList = [...savedList];
        pendingList.forEach((item: any) => {
          if (!savedIds.has(item.ID)) {
            mergedList.push(item);
          }
        });
        
        this.salaryPendingList = mergedList;
        this.selectedIds = Array.from(savedIds);
      } else {
        this.salaryPendingList = pendingList;
        this.selectedIds = [];
      }
    });
  }

  // =========== UI & Event Handlers ===========

  onSelectionChanged(e: any) {
    this.selectedRows = e.selectedRowsData || [];
    this.selectedIds = this.selectedRows.map((row: any) => row.ID);
  }

  onReceiptModeChange(e: any) {
    this.receiptMode = e.value;

    if (this.receiptMode === 'Cash') {
      this.filteredLedgerList = this.ledgerList.filter((item) => item.GROUP_ID === 13);
    } else if (this.receiptMode === 'Bank') {
      this.filteredLedgerList = this.ledgerList.filter((item) => item.GROUP_ID === 14);
    } else if (this.receiptMode === 'Adjustments') {
      this.filteredLedgerList = this.ledgerList.filter((item) => item.GROUP_ID !== 13 && item.GROUP_ID !== 14);
    } else {
      this.filteredLedgerList = [...this.ledgerList];
    }
  }

  // =========== Date Selection Handlers ===========

  toggleCalendar() {
    this.calendarVisible = !this.calendarVisible;
    if (this.calendarVisible) {
      setTimeout(() => document.addEventListener('click', this.outsideClickListener));
    } else {
      document.removeEventListener('click', this.outsideClickListener);
    }
  }

  toggleYearSelector() {
    this.yearSelectorVisible = !this.yearSelectorVisible;
  }

  selectYear(year: number, event: MouseEvent) {
    event.stopPropagation();
    this.selectedYear = year;
    this.yearSelectorVisible = false;
  }

  selectMonthByIndex(monthIndex: number) {
    this.selectedMonth = new Date(this.selectedYear, monthIndex, 1, 12);
    this.updateMonthString();
    this.calendarVisible = false;
    this.getSalaryPendingList();
  }

  onMonthChange(event: any): void {
    const selectedDate = new Date(event.value);
    if (isNaN(selectedDate.getTime())) return;

    this.selectedMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1,
      12
    );
    this.updateMonthString();
    this.getSalaryPendingList();
  }

  goToNextMonth() {
    const currentDate = new Date(this.selectedMonth);
    currentDate.setMonth(currentDate.getMonth() + 1);
    this.selectedMonth = currentDate;
    this.updateMonthString();
    this.getSalaryPendingList();
  }

  goToPreviousMonth() {
    const currentDate = new Date(this.selectedMonth);
    currentDate.setMonth(currentDate.getMonth() - 1);
    this.selectedMonth = currentDate;
    this.updateMonthString();
    this.getSalaryPendingList();
  }

  private updateMonthString() {
    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${day}-${month}-${year}`;
  }

  private outsideClickListener = (event: any) => {
    const calendarElement = document.querySelector('.calendar-popup');
    const labelElement = document.querySelector('.month-label');

    if (
      calendarElement && !calendarElement.contains(event.target) &&
      labelElement && !labelElement.contains(event.target)
    ) {
      this.calendarVisible = false;
      document.removeEventListener('click', this.outsideClickListener);
    }
  };

  // ============= Save & Update Logic =============

  private preparePayload(): boolean {
    if (!this.selectedRows || this.selectedRows.length === 0) {
      notify('Please select at least one row before saving.', 'warning', 2000);
      return false;
    }
    if (!this.salaryPaymentData?.PAY_HEAD_ID) {
      notify('Please select a ledger before saving.', 'warning', 2000);
      return false;
    }

    const payTypeMapping: Record<string, number> = {
      Cash: 1,
      Bank: 2,
      PDC: 3,
      Adjustments: 4,
    };
    this.salaryPaymentData.PAY_TYPE_ID = payTypeMapping[this.receiptMode] || null;

    if (this.salaryPaymentData.PAY_TYPE_ID === 2) {
      if (
        !this.salaryPaymentData.CHEQUE_NO ||
        !this.salaryPaymentData.CHEQUE_DATE ||
        !this.salaryPaymentData.BANK_NAME
      ) {
        notify(
          'Please enter Cheque No, Cheque Date, and Bank Name before saving.',
          'warning',
          2000
        );
        return false;
      }
    }

    if (this.itemsGridRef?.instance) {
      this.itemsGridRef.instance.closeEditCell();
    }

    this.salaryPaymentData.COMPANY_ID = this.companyId;
    this.salaryPaymentData.CREATE_USER_ID = this.userId;
    this.salaryPaymentData.FIN_ID = this.finId;
    this.salaryPaymentData.STORE_ID = this.selectedstoreId;

    this.salaryPaymentData.SALARY_PAY_DETAIL = this.selectedRows.map((row) => ({
      PAYDETAIL_ID: row.ID,
      NET_AMOUNT: row.NET_AMOUNT,
    }));

    return true;
  }

  onSaveSalaryPayment() {
    if (!this.preparePayload()) return;

    this.dataService.insertSalaryPayment(this.salaryPaymentData).subscribe({
      next: (res: any) => {
        if (res.flag === 1) {
          notify('Salary Payment saved successfully', 'success', 2000);
          this.popupClosed.emit();
        } else {
          notify('Failed to save Salary Payment', 'error', 2000);
        }
      },
      error: () => notify('Error occurred while saving', 'error', 2000)
    });
  }

  onUpdateSalaryPayment() {
    if (!this.preparePayload()) return;

    const request$ = this.isApproved
      ? this.dataService.approveSalaryPayment(this.salaryPaymentData)
      : this.dataService.updateSalaryPayment(this.salaryPaymentData);

    request$.subscribe({
      next: (response: any) => {
        if (response.flag === 1) {
          notify(
            `Salary Payment ${this.isApproved ? 'approved' : 'updated'} successfully`,
            'success',
            2000
          );
          this.popupClosed.emit();
        } else {
          notify(
            `Failed to ${this.isApproved ? 'approve' : 'save'} Salary Payment`,
            'error',
            2000
          );
        }
      },
      error: () => notify('Error occurred while processing request', 'error', 2000)
    });
  }

  cancel() {
    this.popupClosed.emit();
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
    DxToolbarModule,
    DxiItemModule,
  ],
  declarations: [AddSalaryPaymentComponent],
  exports: [AddSalaryPaymentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddSalaryPaymentModule {}

