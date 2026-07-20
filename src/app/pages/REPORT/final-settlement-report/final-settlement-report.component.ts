import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnInit,
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
import { formatDate } from '@angular/common';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-final-settlement-report',
  templateUrl: './final-settlement-report.component.html',
  styleUrls: ['./final-settlement-report.component.scss'],
})
export class FinalSettlementReportComponent {
  FinalSettlementReport: any[] = [];
  company_list: any[] = [];
  selectedCompanyId: any;
  company_id: any;
  fin_id: any[] = [];
  savedUserData: any;
  selected_fin_id: any;
  selected_Company_id: any;
  loadingInvoice = false;
  popupReady = false;
  vat_title: any;
  EmployeeDropdown: any;
  selectedEmployeeId: number;
  headerCaption = 'Value';

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    this.get_sessionstorage_data();
    this.get_fin_id();
    this.sesstion_Details();
    this.EmployeeListDropDown();
    const userDataString = localStorage.getItem('userData');

    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;

      this.selected_Company_id = selectedCompany?.COMPANY_ID;
    }

    setTimeout(() => {
      this.popupReady = false;
      this.cdr.detectChanges();
    });
  }

  getSessionData(key: string) {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  get_sessionstorage_data() {
    this.savedUserData = this.getSessionData('savedUserData');
    if (this.savedUserData) {
      this.company_list = this.savedUserData.Companies || [];
    }
  }

  get_fin_id() {
    this.fin_id = this.savedUserData?.FINANCIAL_YEARS || [];
    if (this.fin_id.length) {
      this.selected_fin_id = this.fin_id[0].FIN_ID;
    }
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
    this.vat_title = sessionData?.GeneralSettings.VAT_TITLE;
  }

  EmployeeListDropDown() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'LEFT_EMP',
    };
    this.dataService.getEmployeeDropDown(payload).subscribe((response: any) => {
      this.EmployeeDropdown = response;
    });
  }

  reportData: any[] = [];

  FinalSettlement_Report() {
    if (!this.selectedEmployeeId) {
      notify('Please select an employee.', 'warning', 2000);
      return;
    }
    const payload = {
      EmployeeId: this.selectedEmployeeId || 0,
    };

    this.dataService.FinalSettlementReport(payload).subscribe((res: any) => {
      const d = res;
      this.headerCaption = `${d.EmployeeCode} - ${d.EmployeeName} - ${d.SettlementType}`;

      this.reportData = [
        {
          Description: 'Date of Joining',
          Value: d.DateOfJoining
            ? formatDate(d.DateOfJoining, 'dd-MM-yyyy', 'en-US')
            : '',
        },
        {
          Description: 'Last Working Day',
          Value: d.LastWorkingDay
            ? formatDate(d.LastWorkingDay, 'dd-MM-yyyy', 'en-US')
            : '',
        },
        { Description: 'Basic Salary (Dirhams)', Value: d.BasicSalary },
        { Description: 'Allowance', Value: d.Allowance },
        { Description: 'Unpaid Leave Days', Value: d.UnPaidLeaveDays },
        { Description: 'Total Service Days', Value: d.TotalServiceDays },
        {
          Description: 'Indemnity Entitled Days for First Five Years',
          Value: d.IndemnityFirstFiveYears,
        },
        {
          Description: 'Indemnity Entitled Days After Five Years',
          Value: d.IndemnityAfterFiveYears,
        },
        {
          Description: 'Total Indemnity Entitlement',
          Value: d.TotalIndemnityDays,
        },
        { Description: 'Entitled Leave Days', Value: d.EntitledLeaveDays },
        { Description: 'Payment for Indemnity', Value: d.IndemnityAmount },
        { Description: 'Leave Salary', Value: d.LeaveSalary },
      ];

      // Add Salary Components
      d.SalaryComponents.forEach((item: any) => {
        this.reportData.push({
          Description: `${item.HeadName} in ${item.SalaryMonth}`,
          Value: item.Amount,
        });
      });

      // Add Total
      this.reportData.push({
        Description: 'Total',
        Value: d.TotalAmount,
      });
    });
  }

  // POPUP shown → allow child to render
  onPopupShown() {
    this.popupReady = true;
    this.cdr.detectChanges();
  }

  onExporting(event: any) {
    const fileName = 'Final Settlement Report';
    this.dataService.exportDataGridReport(event, fileName);
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
  declarations: [FinalSettlementReportComponent],
  exports: [FinalSettlementReportComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FinalSettlementReportModule {}
