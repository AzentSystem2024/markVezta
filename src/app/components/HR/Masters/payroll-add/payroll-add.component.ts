import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
  Output,
  ViewChild,
  OnChanges,
  SimpleChanges,
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
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-payroll-add',
  templateUrl: './payroll-add.component.html',
  styleUrls: ['./payroll-add.component.scss'],
})
export class PayrollAddComponent implements OnInit, OnChanges {
  // ================= Input & Output =================
  @Input() selectedMonth: string;
  @Output() popupClosed = new EventEmitter<void>();

  // ================= ViewChild =================
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid!: DxDataGridComponent;

  // ================= State Properties =================
  companyID: any;
  userID: any;
  timesheetList: any[] = [];

  // ================= DataGrid Options =================
  allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector: boolean = true;
  filterRowVisible: boolean = false;

  constructor(private dataService: DataService) {}

  // ================= Lifecycle Hooks =================

  ngOnInit() {
    this.setSessionData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedMonth'] && this.selectedMonth) {
      this.setSessionData();
      this.getTimesheetList();
    }
  }

  // ================= Core Logic =================

  getTimesheetList() {
    if (!this.selectedMonth || !this.companyID) return;

    const payload = {
      CompanyId: this.companyID,
      Month: new Date(this.selectedMonth)
        .toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })
        .replace(/\s/g, ''),
    };

    this.dataService
      .getTimesheetListForPayroll(payload)
      .subscribe((response: any) => {
        this.timesheetList = response.data || [];
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
        'error',
      );
      return;
    }

    selectedRows.forEach((row: any) => {
      const payload = {
        COMPANY_ID: this.companyID,
        TS_ID: row.ID,
        USER_ID: this.userID,
      };

      this.dataService.generatePayroll(payload).subscribe({
        next: (response: any) => {
          if (response.flag === 1) {
            notify(
              {
                message:
                  'Payroll generated successfully for selected employees.',
                position: { at: 'top center', my: 'top center' },
              },
              'success',
            );
            this.popupClosed.emit();
          }
        },
        error: () => {
          // Silent catch for individual errors
        },
      });
    });
  }

  // ================= UI Helpers =================

  getStatusColor(status: any): string {
    const statusStr = String(status).toUpperCase();
    if (status === 1 || statusStr === 'VERIFIED') return '#fd7e14'; // Orange
    if (status === 2 || statusStr === 'APPROVED') return '#198754'; // Green
    return '#6c757d'; // Gray for Open/Other
  }

  // ================= Helper Methods =================

  private setSessionData() {
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    if (menuResponse?.SELECTED_COMPANY) {
      this.companyID = menuResponse.SELECTED_COMPANY.COMPANY_ID;
      this.userID = menuResponse.USER_ID;
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
