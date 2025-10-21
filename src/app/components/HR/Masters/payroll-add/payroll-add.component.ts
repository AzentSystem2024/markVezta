import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { PayRevisionAddComponent } from '../pay-revision-add/pay-revision-add.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-payroll-add',
  templateUrl: './payroll-add.component.html',
  styleUrls: ['./payroll-add.component.scss'],
})
export class PayrollAddComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() selectedMonth: string;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  timesheetList: any;
  CompanyID = 1;
  payRollData: {
    COMPANY_ID: string;
    TS_ID: string;
    USER_ID: Number;
  } = {
    COMPANY_ID : '',
    TS_ID: '',
    USER_ID: 0,
  };

  constructor(private dataSerivice: DataService) {}

  ngOnInit() {
    
    console.log(this.selectedMonth, 'SELECTEDMONTH');
    // this.payRollData.SAL_MONTH = this.selectedMonth;
    this.getTimesheetList();
  }

     getStatusFlagClass(status: string): string {
    switch (status) {
      case 'Open': return 'flag-open';       // White or gray
      case 'Verified': return 'flag-verified'; // Orange
      case 'Approved': return 'flag-approved'; // Green
      default: return '';
    }
  }


  getTimesheetList() {
    if (!this.selectedMonth) {
      console.warn('No month selected.');
      return;
    }
   const payload = {
  CompanyId: this.CompanyID,
  Month: new Date(this.selectedMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  }).replace(/\s/g, ''),
};


  this.dataSerivice.getTimesheetListForPayroll(payload).subscribe((response: any) => {
    console.log(response, 'Timesheet List Response');
    this.timesheetList = response.data;
  });
  }

generatePayroll() {


    const selectedRows = this.dataGrid.instance.getSelectedRowsData();
    if (!selectedRows || selectedRows.length === 0) {
      notify(
        {
          message: 'Please select at least one row to generate payroll.',
          position: { at: 'top center', my: 'top center' },
        },
        'error'
      );
      return;
    }

    const userId = Number(sessionStorage.getItem('USER_ID'));
const row = selectedRows[0]; // Only take first row (or loop if needed)
    const payload = {
      COMPANY_ID: this.CompanyID, // already available
      TS_ID: row.ID,
      USER_ID: userId, // Use the userId from sessionStorage
    };
this.dataSerivice.generatePayroll(payload).subscribe((response: any) => {
  console.log('Payroll Generation Response:', response);
  if (response.flag == "1") {
    notify(
      {
        message: 'Payroll Generated Successfully',
        position: { at: 'top center', my: 'top center' },
      },
      'success'
    );
    this.popupClosed.emit();
  } else {
    notify(
      {
        message: 'Payroll Not Generated',
        position: { at: 'top right', my: 'top right' },
      },
      'error'
    );
  }
})
    console.log('Payload to save:', payload);
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
  ],
  providers: [],
  declarations: [PayrollAddComponent],
  exports: [PayrollAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PayrollAddModule {}