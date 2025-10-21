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
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { AddMiscReceiptModule } from '../../MISC-RECEIPT/add-misc-receipt/add-misc-receipt.component';
import { EditMiscReceiptModule } from '../../MISC-RECEIPT/edit-misc-receipt/edit-misc-receipt.component';
import { ListSalaryPaymentComponent } from '../list-salary-payment/list-salary-payment.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-add-salary-payment',
  templateUrl: './add-salary-payment.component.html',
  styleUrls: ['./add-salary-payment.component.scss'],
})
export class AddSalaryPaymentComponent {
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  ledgerList: any;
  filteredLedgerList: any;
  isApproved: boolean = false;
  receiptMode: string = 'Cash';
  selectedMonth: Date = new Date();
  selectedMonthForAdd: string;
  calendarVisible = false;
  months = Array.from({ length: 12 }, (_, i) => new Date(2022, i, 1));
  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  selectedYear: number;
  yearSelectorVisible = false;
  years: number[] = [];
  previousYearButtonOptions = {
    text: '<', // or use icon: 'chevronleft'
    stylingMode: 'text', // or 'outlined'
    onClick: () => this.previousYear(),
    elementAttr: {
      class: 'year-button',
    },
  };
  nextYearButtonOptions = {
    text: '>', // or icon: 'chevronright'
    stylingMode: 'text',
    onClick: () => this.nextYear(),
    elementAttr: {
      class: 'year-button',
    },
  };
  salaryPendingList: any;
  salaryPaymentData: any = {
    COMPANY_ID: '',
    FIN_ID: '',
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
    SALARY_PAY_DETAIL: [
      {
        PAYDETAIL_ID: '',
      },
    ],
  };
  paymentNo: any;
  selectedIds: any[] = [];
  userId: any;
  companyId: any;
  finId: any;
  selectedRows: any;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getLedgerCodeDropdown();
    this.getVoucherNo();
    this.loadUserData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['EditingResponseData'] &&
      changes['EditingResponseData'].currentValue
    ) {
      this.isEditDataAvailable(); // Run your population logic here
    }
  }

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

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    const data = Array.isArray(this.EditingResponseData)
      ? this.EditingResponseData[0]
      : this.EditingResponseData;

    console.log(data, 'DATA=============================================');

    const payTypeReverseMapping: any = {
      1: 'Cash',
      2: 'Bank',
      3: 'PDC',
      4: 'Adjustments',
    };
    this.receiptMode = payTypeReverseMapping[data.PAY_TYPE_ID] || 'Cash';

    this.salaryPaymentData.VOUCHER_NO = data.VOUCHER_NO || '';
    // this.salaryPaymentData.TRANS_DATE = data.TRANS_DATE
    //   ? new Date(data.TRANS_DATE)
    //   : new Date();
this.salaryPaymentData.TRANS_DATE = new Date();
    if (data.SAL_MONTH) {
      const [month, year] = data.SAL_MONTH.split('-').map(Number);
      this.selectedMonth = new Date(year, month - 1, 1);
      this.selectedYear = year;
    }

    // ✅ Fix — access DetailList from the object, not the array
    if (Array.isArray(data.DetailList) && data.DetailList.length > 0) {
      this.salaryPendingList = data.DetailList.map((item: any) => ({
        ID: item.ID,
        EMP_ID: item.EMP_ID,
        EMP_CODE: item.EMP_CODE ?? '',
        EMP_NAME: item.EMP_NAME ?? '',
        NET_AMOUNT: item.NET_AMOUNT ?? null,
      }));
    } else {
      this.salaryPendingList = [];
    }

    this.salaryPaymentData.CHEQUE_NO = data.CHEQUE_NO;
    this.salaryPaymentData.CHEQUE_DATE = data.CHEQUE_DATE;
    this.salaryPaymentData.BANK_NAME = data.BANK_NAME;
    this.salaryPaymentData.NARRATION = data.NARRATION;
    this.salaryPaymentData.TRANS_ID = data.TRANS_ID;
    this.salaryPaymentData.PAY_HEAD_ID = data.PAY_HEAD_ID;

    // Optional — force grid refresh
    this.salaryPendingList = [...this.salaryPendingList];
  }

  onSelectionChanged(e: any) {
    this.selectedRows = e.selectedRowsData;
    // Add mode → ID
    this.selectedIds = e.selectedRowsData.map((row: any) => row.ID);

    console.log('Selected IDs:', this.selectedIds);
  }

  getVoucherNo() {
    this.dataService.getPaymentNo().subscribe((response: any) => {
      this.paymentNo = response.VOUCHER_NO;
    });
  }

  getSalaryPendingList() {
    const payload = {
      SAL_MONTH: `${this.selectedMonth.getFullYear()}-${(
        this.selectedMonth.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}`,
    };
    this.dataService
      .getPendingSalaryPayments(payload)
      .subscribe((response: any) => {
        this.salaryPendingList = response.data;
      });
  }

  previousYear() {
    this.selectedYear--;
  }
  nextYear() {
    this.selectedYear++;
  }

  selectMonthByIndex(monthIndex: number) {
    this.selectedMonth = new Date(this.selectedYear, monthIndex, 1, 12); // Set the date to the 1st of the selected month
    this.onMonthChange({ value: this.selectedMonth }); // Pass the selected month to onMonthChange

    this.calendarVisible = false;

    // Hide calendar after selection (optional)
  }

  updateMonthLabel() {
    // This is automatically updated with the selectedMonth binding in the template
  }
  onMonthandYearChanged(e: any) {
    if (e.value) {
      const updatedMonth = new Date(e.value);
      this.selectedMonth = new Date(
        updatedMonth.getFullYear(),
        updatedMonth.getMonth() - 1,
        1
      );
      this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString(
        'en-US',
        { month: 'long', year: 'numeric' }
      );
    }
  }

  isDisabledYear(year: number): boolean {
    return year < 2010 || year > 2019;
  }

  toggleCalendar() {
    this.calendarVisible = !this.calendarVisible;

    if (this.calendarVisible) {
      setTimeout(() => {
        document.addEventListener('click', this.outsideClickListener);
      });
    } else {
      document.removeEventListener('click', this.outsideClickListener);
    }
  }
  toggleYearSelector() {
    this.yearSelectorVisible = !this.yearSelectorVisible;
  }
  selectYear(year: number, event: MouseEvent) {
    event.stopPropagation(); // Prevent calendar from closing
    this.selectedYear = year;
    this.yearSelectorVisible = false;
  }
  outsideClickListener = (event: any) => {
    const calendarElement = document.querySelector('.calendar-popup');
    const labelElement = document.querySelector('.month-label');

    if (
      calendarElement &&
      !calendarElement.contains(event.target) &&
      labelElement &&
      !labelElement.contains(event.target)
    ) {
      this.calendarVisible = false;
      document.removeEventListener('click', this.outsideClickListener);
    }
  };
  onCalendarClose() {
    this.calendarVisible = false;
  }
  onMonthChange(event: any): void {
    const selectedDate = new Date(event.value);

    if (isNaN(selectedDate.getTime())) return;

    // Ensure the date is normalized to the first of the month at noon
    this.selectedMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1,
      12
    );

    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    this.getSalaryPendingList();
  }

  goToNextMonth() {
    const currentDate = new Date(this.selectedMonth);
    currentDate.setMonth(currentDate.getMonth() + 1);
    this.selectedMonth = currentDate;
    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    this.getSalaryPendingList();
  }

  goToPreviousMonth() {
    const currentDate = new Date(this.selectedMonth);
    currentDate.setMonth(currentDate.getMonth() - 1);
    this.selectedMonth = currentDate;
    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    this.getSalaryPendingList();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${day}-${month}-${year}`; // ✅ dd-MM-yyyy format
  }

  focusGridFirstCell() {}

  onEditorPreparing(event: any) {}

  onRowRemoved(event: any) {}

  getLedgerCodeDropdown() {
    this.dataService.getAccountHeadList().subscribe({
      next: (response: any) => {
        console.log('API Response:', response); // <== LOG FULL RESPONSE
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
        (item: any) => item.GROUP_ID === 13
      );
    } else if (this.receiptMode === 'Bank') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID === 14
      );
    } else if (this.receiptMode === 'Adjustments') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID !== 13 && item.GROUP_ID !== 14
      );
    } else {
      this.filteredLedgerList = [...this.ledgerList]; // For 'PDC' or others
    }
  }

  onSaveSalaryPayment() {
    if (!this.selectedIds || this.selectedIds.length === 0) {
      notify('Please select at least one row before saving.', 'warning', 2000);
      return;
    }
    if (!this.salaryPaymentData?.PAY_HEAD_ID) {
      notify('Please select a ledger before saving.', 'warning', 2000);
      return;
    }
    const PAY_HEAD_ID = this.salaryPaymentData?.PAY_HEAD_ID; // get from your form
    const payTypeMapping: any = {
      Cash: 1,
      Bank: 2,
      PDC: 3,
      Adjustments: 4,
    };

    this.salaryPaymentData.PAY_TYPE_ID =
      payTypeMapping[this.receiptMode] || null;
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
        return;
      }
    }
    // 2. Commit any pending cell edits in grid
    this.itemsGridRef.instance.closeEditCell();
    // Populate the IDs from ngOnInit data
    this.salaryPaymentData.COMPANY_ID = this.companyId;
    this.salaryPaymentData.CREATE_USER_ID = this.userId;
    this.salaryPaymentData.FIN_ID = this.finId;

    // Update salary pay details with selected IDs
    // this.salaryPaymentData.SALARY_PAY_DETAIL = this.selectedIds.map((id) => ({
    //   PAYDETAIL_ID: id,
    // }));
    this.salaryPaymentData.SALARY_PAY_DETAIL = this.selectedRows.map((row) => ({
      PAYDETAIL_ID: row.ID,
      NET_AMOUNT: row.NET_AMOUNT,
    }));

    console.log('Payload to send:', this.salaryPaymentData);

    // Call API
    this.dataService
      .insertSalaryPayment(this.salaryPaymentData)
      .subscribe((res: any) => {
        if (res.flag === 1) {
          notify('Salary Payment saved successfully', 'success', 2000);
          this.popupClosed.emit();
        } else {
          notify('Failed to save Misc Receipt', 'error', 2000);
        }
      });
  }

onUpdateSalaryPayment() {
  console.log('update triggered');
  if (!this.selectedRows || this.selectedRows.length === 0) {
    notify('Please select at least one row before saving.', 'warning', 2000);
    return;
  }
  if (!this.salaryPaymentData?.PAY_HEAD_ID) {
    notify('Please select a ledger before saving.', 'warning', 2000);
    return;
  }

  const payTypeMapping: any = {
    Cash: 1,
    Bank: 2,
    PDC: 3,
    Adjustments: 4,
  };

  this.salaryPaymentData.PAY_TYPE_ID =
    payTypeMapping[this.receiptMode] || null;

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
      return;
    }
  }

  // Commit any pending cell edits in grid
  this.itemsGridRef.instance.closeEditCell();

  // Populate the IDs from ngOnInit data
  this.salaryPaymentData.COMPANY_ID = this.companyId;
  this.salaryPaymentData.CREATE_USER_ID = this.userId;
  this.salaryPaymentData.FIN_ID = this.finId;

  // Update salary pay details with selected rows
  this.salaryPaymentData.SALARY_PAY_DETAIL = this.selectedRows.map((row) => ({
    PAYDETAIL_ID: row.ID,
    NET_AMOUNT: row.NET_AMOUNT,
  }));

  console.log('Payload to send:', this.salaryPaymentData);

  if (this.isApproved) {
    // Call approve API if isApproved is true
    this.dataService
      .approveSalaryPayment(this.salaryPaymentData)
      .subscribe((response: any) => {
        if (response.flag === 1) {
          notify('Salary Payment approved successfully', 'success', 2000);
          this.popupClosed.emit();
        } else {
          notify('Failed to approve Salary Payment', 'error', 2000);
        }
      });
  } else {
    // Otherwise call update API
    this.dataService
      .updateSalaryPayment(this.salaryPaymentData)
      .subscribe((response: any) => {
        if (response.flag === 1) {
          notify('Salary Payment updated successfully', 'success', 2000);
          this.popupClosed.emit();
        } else {
          notify('Failed to save Salary Payment', 'error', 2000);
        }
      });
  }
}

cancel(){
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
    DxButtonModule,
    DxToolbarModule,
    DxiItemModule,
    DxoItemModule,
    AddMiscReceiptModule,
    EditMiscReceiptModule,
  ],
  providers: [],
  declarations: [AddSalaryPaymentComponent],
  exports: [AddSalaryPaymentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddSalaryPaymentModule {}
