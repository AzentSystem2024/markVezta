import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  NgModule,
  NgZone,
  OnInit,
  Output,
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
  DxTabPanelModule,
  DxTabsModule,
  DxNumberBoxModule,
  DxValidationGroupModule,
  DxAutocompleteModule,
  DxTagBoxModule,
  DxDataGridComponent,
  DxFormComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import { DataService } from 'src/app/services';
import { ViewInvoiceModule } from '../../INVOICE/view-invoice/view-invoice.component';
import { Router } from '@angular/router';
import notify from 'devextreme/ui/notify';
import DataSource from 'devextreme/data/data_source';


@Component({
  selector: 'app-shift-master-add',
  templateUrl: './shift-master-add.component.html',
  styleUrls: ['./shift-master-add.component.scss']
})
export class ShiftMasterAddComponent {
  @ViewChild('shiftForm', { static: false })
  shiftForm!: DxFormComponent;

  @Output() save = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  shiftData: any = {};
  selected_Company_id: any;

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.resetForm();
  }

  ngOnInit() {
    this.sesstion_Details();
    this.calculateTotalHours();
  }
  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  calculateTotalHours() {

    const start = this.shiftData.TIME_START;
    const end = this.shiftData.TIME_END;

    if (!start || !end) {
      this.shiftData.TOTAL_HOURS = 0;
      return;
    }

    const startTime = new Date(start);
    const endTime = new Date(end);

    let difference = endTime.getTime() - startTime.getTime();

    // Handle next-day shift
    if (this.shiftData.IS_NEXT_DAY) {
      if (difference <= 0) {
        difference += 24 * 60 * 60 * 1000;
      }
    }

    if (difference < 0) {
      notify('End time must be greater than start time', 'warning', 3000);
      this.shiftData.TOTAL_HOURS = 0;
      return;
    }

    // Convert milliseconds into hours
    this.shiftData.TOTAL_HOURS = Number(
      (difference / (1000 * 60 * 60)).toFixed(2)
    );
  }


  resetForm() {
    const today = new Date();

    this.shiftData = {
      SHIFT_NAME: '',
      TIME_START: new Date(today),
      TIME_END: new Date(today),
      IS_NEXT_DAY: false,
      TOTAL_HOURS: 0,
      BREAK_HOURS: '',
      ENTRY_VALID_FROM: today,
      ENTRY_VALID_TO: today,
      MAX_EXIT_TIME: 0,
      BREAK_MINUTES: 0,
      IS_FIXED: false,
      SHIFT_CHANGE: false,
      IS_DAILY_WAGE: false,
      NO_HALF_DAY: false,
      IS_BREAK1: false,
      BREAK1_TIME_IN: null,
      BREAK1_TIME_OUT: null,
      BREAK1_TOTAL_MINUTES: 0,

      IS_BREAK2: false,
      BREAK2_TIME_IN: null,
      BREAK2_TIME_OUT: null,
      BREAK2_TOTAL_MINUTES: 0
    };
  }

  calculateBreakMinutesFromHours() {
    const breakHours = Number(this.shiftData.BREAK_HOURS) || 0;

    this.shiftData.BREAK_MINUTES = Math.round(breakHours * 60);
  }

  saveForm() {
    const validation = this.shiftForm.instance.validate();

    if (!validation.isValid) {
      notify('Please fill all required fields', 'warning', 3000);
      return;
    }

    // Prepare break details
    const breaks: any[] = [];

    if (this.shiftData.IS_BREAK1) {
      breaks.push({
        TIME_IN: this.toTimeString(this.shiftData.BREAK1_TIME_IN),
        TIME_OUT: this.toTimeString(this.shiftData.BREAK1_TIME_OUT),
        TOTAL_MINUTES: this.shiftData.BREAK1_TOTAL_MINUTES || 0
      });
    }

    if (this.shiftData.IS_BREAK2) {
      breaks.push({
        TIME_IN: this.toTimeString(this.shiftData.BREAK2_TIME_IN),
        TIME_OUT: this.toTimeString(this.shiftData.BREAK2_TIME_OUT),
        TOTAL_MINUTES: this.shiftData.BREAK2_TOTAL_MINUTES || 0
      });
    }


    const payload = {
      SHIFT_NAME: this.shiftData.SHIFT_NAME,
      TIME_START: this.toTimeString(this.shiftData.TIME_START),
      TIME_END: this.toTimeString(this.shiftData.TIME_END),
      IS_NEXT_DAY: this.shiftData.IS_NEXT_DAY,
      TOTAL_HOURS: this.shiftData.TOTAL_HOURS,
      BREAK_HOURS: this.shiftData.BREAK_HOURS,
      ENTRY_VALID_FROM: this.shiftData.ENTRY_VALID_FROM,
      ENTRY_VALID_TO: this.shiftData.ENTRY_VALID_TO,
      MAX_EXIT_TIME: this.shiftData.MAX_EXIT_TIME,
      BREAK_MINUTES: this.shiftData.BREAK_MINUTES,
      IS_FIXED: this.shiftData.IS_FIXED,
      SHIFT_CHANGE: this.shiftData.SHIFT_CHANGE,
      IS_DAILY_WAGE: this.shiftData.IS_DAILY_WAGE,
      NO_HALF_DAY: this.shiftData.NO_HALF_DAY,
      COMPANY_ID: this.selected_Company_id, // Replace with actual company ID
      BREAKS: breaks
    };

    console.log('Shift Master Payload:', payload);

    this.dataService.InsertShiftMasterReport(payload).subscribe({
      next: (response: any) => {
        const status = response?.Message ?? response?.Message;

        if (
          String(status).toLowerCase() === 'success' ||
          response?.Message === true
        ) {
          notify('Shift Master saved successfully', 'success', 3000);

          this.save.emit(payload);

          this.resetForm();
          this.cdr.detectChanges();

        } else {
          console.error('Insert response was not recognized as success:', response);

          notify(
            response?.Message || response?.message || 'Failed to save Shift Master',
            'error',
            3000
          );
        }
      },

      error: (error: any) => {
        console.error('Shift Master API Error:', error);
        console.error('Error Response:', error?.error);

        notify(
          error?.error?.Message || error?.error?.message || 'An error occurred while saving Shift Master',
          'error',
          3000
        );
      }
    });
  }

  toTimeString(value: any): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }

  toISOString(value: any): string | null {
    if (!value) {
      return null;
    }

    return new Date(value).toISOString();
  }


  toggleBreak1(e: any) {
    if (!e.value) {
      this.shiftData.BREAK1_TIME_IN = null;
      this.shiftData.BREAK1_TIME_OUT = null;
      this.shiftData.BREAK1_TOTAL_MINUTES = 0;
    }
  }

  toggleBreak2(e: any) {
    if (!e.value) {
      this.shiftData.BREAK2_TIME_IN = null;
      this.shiftData.BREAK2_TIME_OUT = null;
      this.shiftData.BREAK2_TOTAL_MINUTES = 0;
    }
  }

  calculateBreakHours(breakNo: number) {

    const start = breakNo === 1
      ? this.shiftData.BREAK1_TIME_IN
      : this.shiftData.BREAK2_TIME_IN;

    const end = breakNo === 1
      ? this.shiftData.BREAK1_TIME_OUT
      : this.shiftData.BREAK2_TIME_OUT;

    if (!start || !end) {
      if (breakNo === 1) {
        this.shiftData.BREAK1_TOTAL_MINUTES = 0;
      } else {
        this.shiftData.BREAK2_TOTAL_MINUTES = 0;
      }
      return;
    }

    const startTime = new Date(start);
    const endTime = new Date(end);

    let difference = endTime.getTime() - startTime.getTime();

    // Handle overnight break
    if (difference < 0) {
      difference += 24 * 60 * 60 * 1000;
    }

    const totalHours = Number(
      (difference / (1000 * 60 * 60)).toFixed(2)
    );

    if (breakNo === 1) {
      this.shiftData.BREAK1_TOTAL_MINUTES = totalHours;
    } else {
      this.shiftData.BREAK2_TOTAL_MINUTES = totalHours;
    }
  }


  cancelForm() {
    this.cancelled.emit();
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

    DxNumberBoxModule,
    DxValidationGroupModule,
    DxAutocompleteModule,
    DxTagBoxModule,
    ViewInvoiceModule,
  ],
  providers: [],
  declarations: [ShiftMasterAddComponent],
  exports: [ShiftMasterAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ShiftMasterAddModule { }