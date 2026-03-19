import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  NgZone,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-prepayment-gst-edit',
  templateUrl: './prepayment-gst-edit.component.html',
  styleUrls: ['./prepayment-gst-edit.component.scss'],
})
export class PrepaymentGstEditComponent {
  @ViewChild('formValidationGroup', { static: false })
  formValidationGroup: DxValidationGroupComponent;

  @Output() formClosed = new EventEmitter<void>();
  @Input() selectedPrePayment: any;
  @Input() isReadOnly: boolean = false;

  selectedRows: any[] = [];
  ExpenseAmountDetails: any[] = [];
  showGrid = false;
  PrePayment: any[] = [];
  totalExpense: number = 0;
  Supplier: any;
  ExpenseLedger: any;
  selectedSupplierId: any;
  selected_Company_id: any;
  selected_fin_id: any;
  selected_user_id: any;
  PrePaymentLedger: any;
  sessionData: any;
  selected_vat_id: any;
  selectedstoreId: any;

  fieldChanged = false;
  scheduleGenerated = false;

  periodTo: string | number | Date | null = null;
  periodFrom: string | number | Date | null = null;

  PrePaymentFormData: any = {
    COMPANY_ID: '',
    FIN_ID: '',

    TRANS_TYPE: 38,
    TRANS_DATE: '',
    REF_NO: '',
    NARRATION: '',
    CREATE_USER_ID: '',
    TAX_PERCENT: '',
    TAX_AMOUNT: '',
    NET_AMOUNT: '',
    SUPP_ID: '',
    EXP_HEAD_ID: '',
    PREPAY_HEAD_ID: '',
    DATE_FROM: this.periodFrom,
    DATE_TO: this.periodTo,
    NO_OF_MONTHS: '',
    NO_OF_DAYS: '',
    EXPENSE_AMOUNT: '',
    PREPAY_DETAIL: [
      {
        DUE_DATE: '',
        DUE_AMOUNT: '',
      },
    ],
  };

  amount: number = 0;

  months: number | null = null;
  days: number | null = null;

  gstPercent: number = 0; // GST %
  gstAmount: number = 0;
  netAmount: number = 0; // Calculated GST Amount

  constructor(
    private dataservice: DataService,
    private ngZone: NgZone,
  ) {
    this.get_Supplier_dropdown();
    this.get_ExpenseLedger_dropdown();
    this.sesstion_Details();
    this.get_PrePaymentLedger_dropdown();
    this.sessionData_tax();
  }

  ngOnInit() {
    // initialize flags on load
    this.fieldChanged = false;
    this.scheduleGenerated = false;
  }

  updateGSTAmount() {
    if (
      this.PrePaymentFormData.EXPENSE_AMOUNT &&
      this.PrePaymentFormData.TAX_PERCENT >= 0
    ) {
      // Calculate GST Amount
      this.PrePaymentFormData.TAX_AMOUNT = +(
        this.PrePaymentFormData.EXPENSE_AMOUNT *
        (this.PrePaymentFormData.TAX_PERCENT / 100)
      ).toFixed(2);

      // Calculate Net Amount (Amount + GST)
      this.PrePaymentFormData.NET_AMOUNT = +(
        this.PrePaymentFormData.EXPENSE_AMOUNT +
        this.PrePaymentFormData.TAX_AMOUNT
      ).toFixed(2);
    } else {
      this.PrePaymentFormData.TAX_AMOUNT = 0;
      this.PrePaymentFormData.NET_AMOUNT =
        this.PrePaymentFormData.EXPENSE_AMOUNT || 0;
    }
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  //    convertToISO(dateStr: string): string {
  //   // dateStr is in "DD/MM/YYYY"
  //   const [day, month, year] = dateStr.split("/").map(Number);

  //   // Create JS Date (note: month is 0-based)
  //   const date = new Date(year, month - 1, day +1);

  //   return date.toISOString();  // Converts to ISO string
  // }
  convertToISO(dateStr: any): string {
    if (!dateStr) return ''; // ⛔ Return empty if missing

    // ✅ If it's already a Date object
    if (dateStr instanceof Date) {
      return dateStr.toISOString();
    }

    // ✅ If it's a string like "DD/MM/YYYY"
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toISOString();
    }

    // ✅ If it’s already in ISO or unexpected format, try to parse
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }

    console.warn('⚠️ Unrecognized date format:', dateStr);
    return '';
  }

  updatePeriodTo() {
    if (this.PrePaymentFormData.DATE_FROM) {
      let newDate = new Date(this.PrePaymentFormData.DATE_FROM);

      if (this.PrePaymentFormData.NO_OF_MONTHS) {
        newDate.setMonth(
          newDate.getMonth() + this.PrePaymentFormData.NO_OF_MONTHS,
        );
      }

      if (this.PrePaymentFormData.NO_OF_DAYS) {
        newDate.setDate(newDate.getDate() + this.PrePaymentFormData.NO_OF_DAYS);
      }

      this.PrePaymentFormData.DATE_TO = newDate;
    } else {
      this.PrePaymentFormData.DATE_TO = null; // Clear if Period From is empty
    }

    this.fieldChanged = true;
    this.scheduleGenerated = false;
  }

  private daysBetween(start: Date, end: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((end.getTime() - start.getTime()) / msPerDay) + 1;
  }

  onCalendarClick() {
    this.showGrid = true;
    this.generateSchedule();
    this.totalExpense = this.PrePaymentFormData.EXPENSE_AMOUNT || 0; // Copy Amount to Total Expense
  }

  generateSchedule() {
    if (
      !this.PrePaymentFormData.DATE_FROM ||
      !this.PrePaymentFormData.DATE_TO ||
      !this.PrePaymentFormData.EXPENSE_AMOUNT
    )
      return;

    const startDate = new Date(this.PrePaymentFormData.DATE_FROM!);
    let endDateFinal = new Date(this.PrePaymentFormData.DATE_TO!);

    if (endDateFinal.getDate() === 1) {
      endDateFinal = new Date(
        endDateFinal.getFullYear(),
        endDateFinal.getMonth(),
        0,
      );
    }
    const totalDays = this.daysBetween(startDate, endDateFinal);
    const perDayAmount = this.PrePaymentFormData.EXPENSE_AMOUNT / totalDays;

    let schedule: any[] = [];
    let current = new Date(startDate);

    while (current <= endDateFinal) {
      let periodStart = new Date(current);
      let periodEnd = new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        0,
      );

      // Keep end date within overall DATE_TO
      if (periodEnd > endDateFinal) {
        periodEnd = new Date(endDateFinal);
      }

      // ✅ Adjust the start date for the first row to match DATE_FROM
      if (schedule.length === 0) {
        periodStart = new Date(startDate);
      }

      // ✅ Adjust the end date for the last row to match DATE_TO
      if (periodEnd > endDateFinal) {
        periodEnd = new Date(endDateFinal);
      }

      const daysInPeriod = this.daysBetween(periodStart, periodEnd);
      const rowAmount = +(perDayAmount * daysInPeriod).toFixed(2);

      schedule.push({
        HEAD_ID: schedule.length + 1,
        DUE_DATE: periodEnd.toLocaleDateString('en-GB'), // gives dd/MM/yyyy
        DUE_AMOUNT: rowAmount,
        HEAD_PERCENT: null,
      });

      // Move to next month's start
      current = new Date(periodEnd);
      current.setDate(current.getDate() + 1);
    }

    this.ExpenseAmountDetails = schedule;
    this.showGrid = true;
    this.scheduleGenerated = true;
    this.fieldChanged = false;
  }

  onFieldChange() {
    this.fieldChanged = true;
    this.scheduleGenerated = false; // reset since user changed a key field
  }

  onCellValueChanged(e: any) {
    const { data, column, value } = e;

    if (column.dataField === 'HEAD_AMOUNT') {
      data.HEAD_AMOUNT = value;
    }

    if (column.dataField === 'HEAD_PERCENT') {
      data.HEAD_PERCENT = value;
    }
  }

  onSelectionChanged(e: any) {
    this.selectedRows = e.selectedRowKeys;
    console.log('User selected:', this.selectedRows);
  }

  onEditorPreparing(e: any) {
    // console.log(e, 'Editor Preparing Event');

    console.log(e, 'Editor Preparing Event');

    const headNature = e.row?.data.HEAD_NATURE;
    console.log(headNature, '=======error===============');
    console.log(headNature, 'HEAD_NATURE in Editor Preparing Event');

    const headId = e.row?.data.HEAD_ID;

    const isRowSelected = this.selectedRows?.includes(headId);
  }

  onSupplierChanged(event: any) {
    this.selectedSupplierId = event.value;
  }

  get_Supplier_dropdown() {
    const payload = {
      NAME: 'SUPPLIER',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.Supplier_Dropdown(payload).subscribe((res: any) => {
      console.log('supplier dropdown', res);
      this.Supplier = res;
    });
  }

  get_ExpenseLedger_dropdown() {
    this.dataservice.ExxpenseLedger_Dropdown().subscribe((res: any) => {
      console.log('customer dropdown', res);
      this.ExpenseLedger = res;
    });
  }

  get_PrePaymentLedger_dropdown() {
    this.dataservice.ExxpenseLedger_Dropdown().subscribe((res: any) => {
      console.log('customer dropdown', res);
      this.PrePaymentLedger = res;
    });
  }

  //        resetForm() {
  //          this.PrePaymentFormData = {
  //     COMPANY_ID: '',
  //     FIN_ID:'',

  //     TRANS_TYPE: 38,
  //     TRANS_DATE:'',
  //     REF_NO:'',
  //       NARRATION: '',
  //       CREATE_USER_ID:'',
  //       TAX_PERCENT:'',
  //       TAX_AMOUNT:'',
  //       NET_AMOUNT: '',
  //         SUPP_ID: '',
  //          EXP_HEAD_ID: '',
  //          PREPAY_HEAD_ID:'',
  //            DATE_FROM: this.periodFrom,
  //   DATE_TO: this.periodTo,
  //     NO_OF_MONTHS: '',
  //   NO_OF_DAYS: '',
  //   EXPENSE_AMOUNT: '',
  // PREPAY_DETAIL: [
  //   { DUE_DATE: null, DUE_AMOUNT: null }
  // ]

  //   }

  //   this.ExpenseAmountDetails = [];
  //   this.showGrid = false;
  //       // ✅ Reset form validations after value reset
  //   setTimeout(() => {
  //      // Reset previous validation results
  //   this.formValidationGroup?.instance?.reset();
  //   });
  //      }

  cancel() {
    //  this.resetForm()
    this.formClosed.emit();
  }

  private formatToISO(date: any): string | null {
    if (!date) return null;

    // If it's already a Date object
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toISOString();
    }

    // If it's already in dd/MM/yyyy format
    if (typeof date === 'string' && date.includes('/')) {
      const parts = date.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // JS months are 0-based
        const year = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return isNaN(d.getTime()) ? null : d.toISOString();
      }
    }

    // Fallback
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;

    this.selected_user_id = sessionData.USER_ID;
    console.log(
      this.selected_user_id,
      '===========selected user id===================',
    );
    this.selectedstoreId = sessionData.Configuration[0].STORE_ID;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['selectedPrePayment'] &&
      changes['selectedPrePayment'].currentValue
    ) {
      const data = changes['selectedPrePayment'].currentValue;
      console.log(data, 'dataaaaaaaaaaaaaaaaaaaaaaaaaa');
      this.PrePaymentFormData = data;

      // Bind details to grid data source
      this.ExpenseAmountDetails = (data.Details || []).map((item) => ({
        ...item,
        DUE_DATE: new Date(item.DUE_DATE), // Ensure it's a Date object
      }));

      this.showGrid = true; // Ensure grid is shown
    }
    console.log(
      this.ExpenseAmountDetails,
      '=================ExpenseAmountDetails==========',
    );
  }

  savePrePayment() {
    //              const validationResult = this.formValidationGroup?.instance?.validate();
    //   if (!validationResult?.isValid) {
    //     console.log('Validation failed');
    //     return;
    //   }

    // if (this.fieldChanged && !this.scheduleGenerated) {
    //     notify({
    //       message: 'Please click "Generate Schedule" before saving since Date/Months/Days were modified.',
    //       type: 'warning',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 2000,
    //     });
    //     return;
    //   }

    const result = (this.ExpenseAmountDetails || []).map((item) => ({
      DUE_DATE: this.convertToISO(item.DUE_DATE),
      DUE_AMOUNT: item.DUE_AMOUNT,
    }));
    console.log(result);

    const payload = {
      TRANS_ID: this.PrePaymentFormData.TRANS_ID || 0,
      COMPANY_ID: this.selected_Company_id || null,
      FIN_ID: this.selected_fin_id || null,
      TRANS_TYPE: Number(this.PrePaymentFormData.TRANS_TYPE) || null,
      TRANS_DATE: this.formatToISO(this.PrePaymentFormData.TRANS_DATE),
      REF_NO: this.PrePaymentFormData.REF_NO || '',
      NARRATION: this.PrePaymentFormData.NARRATION || '',
      CREATE_USER_ID: this.selected_user_id || null,
      TAX_PERCENT: Number(this.PrePaymentFormData.TAX_PERCENT) || null,
      TAX_AMOUNT: Number(this.PrePaymentFormData.TAX_AMOUNT) || null,
      NET_AMOUNT: Number(this.PrePaymentFormData.NET_AMOUNT) || null,
      SUPP_ID: Number(this.PrePaymentFormData.SUPP_ID) || null,
      EXP_HEAD_ID: Number(this.PrePaymentFormData.EXP_HEAD_ID) || null,
      PREPAY_HEAD_ID: Number(this.PrePaymentFormData.PREPAY_HEAD_ID) || null,
      DATE_FROM: this.formatToISO(this.PrePaymentFormData.DATE_FROM),
      DATE_TO: this.formatToISO(this.PrePaymentFormData.DATE_TO),
      NO_OF_DAYS: Number(this.PrePaymentFormData.NO_OF_DAYS) || null,
      EXPENSE_AMOUNT: Number(this.PrePaymentFormData.EXPENSE_AMOUNT) || null,
      NO_OF_MONTHS: Number(this.PrePaymentFormData.NO_OF_MONTHS) || null,
      TRANS_STATUS: this.PrePaymentFormData.TRANS_STATUS ? 5 : 1,
      STORE_ID: this.selectedstoreId,
      // ✅ Map from the grid data source, not the form object
      PREPAY_DETAIL: result,
    };

    console.log('Payload to save PrePayment:', payload);

    if (this.PrePaymentFormData.TRANS_STATUS === true) {
      this.dataservice
        .Approve_PrePayment(payload)
        .subscribe((approveRes: any) => {
          console.log('Response from approve PrePayment:', approveRes);
          //  this.resetForm();
          this.formClosed.emit();
        });
    } else {
      this.dataservice.Update_PrePayment(payload).subscribe((res: any) => {
        console.log('Response from save PrePayment:', res);

        notify({
          message: 'PrePayment Updated successfully',
          type: 'success',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        });
        // this.resetForm();
        this.formClosed.emit();
      });
    }
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
    DxDataGridModule,
    DxValidatorModule,
    DxPopupModule,
    DxButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DxNumberBoxModule,
    DxValidationGroupModule,
  ],
  providers: [],
  declarations: [PrepaymentGstEditComponent],
  exports: [PrepaymentGstEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrePaymentGstEditModule {}
