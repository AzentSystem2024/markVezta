import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HrRoutingModule } from './hr-routing.module';

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
  DxLoadPanelModule,
} from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';

import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';

//reports

import { AbsentListComponent } from './reports/absent-list/absent-list.component';
import { AttendanceSheetComponent } from './reports/attendance-sheet/attendance-sheet.component';
import { EditedAttendanceComponent } from './reports/edited-attendance/edited-attendance.component';
import { ExcessBreakDetailsComponent } from './reports/excess-break-details/excess-break-details.component';
import { ExcessBreaksComponent } from './reports/excess-breaks/excess-breaks.component';
import { FinalSettlementReportComponent } from './reports/final-settlement-report/final-settlement-report.component';
import { LateComerListComponent } from './reports/late-comer-list/late-comer-list.component';
import { LeavelistComponent } from './reports/leavelist/leavelist.component';
import { PaySlipComponent } from './reports/pay-slip/pay-slip.component';
import { PayrollOtReportComponent } from './reports/payroll-ot-report/payroll-ot-report.component';
import { PayrollReportComponent } from './reports/payroll-report/payroll-report.component';
import { SalaryWPSComponent } from './reports/salary-wps/salary-wps.component';
import { StaffShiftChangeReportComponent } from './reports/staff-shift-change-report/staff-shift-change-report.component';
import { TimesheetReportComponent } from './reports/timesheet-report/timesheet-report.component';
import { WageRegisterComponent } from './reports/wage-register/wage-register.component';

//masters
import { TimesheetListComponent } from './pages/timesheet/timesheet-list/timesheet-list.component';
import { TimesheetAddComponent } from './pages/timesheet/timesheet-add/timesheet-add.component';
import { TimesheetEditComponent } from './pages/timesheet/timesheet-edit/timesheet-edit.component';
import { TimesheetVerifyComponent } from './pages/timesheet/timesheet-verify/timesheet-verify.component';
import { TimesheetApproveComponent } from './pages/timesheet/timesheet-approve/timesheet-approve.component';
import { TimesheetViewComponent } from './pages/timesheet/timesheet-view/timesheet-view.component';

import { StaffEOSComponent } from './pages/staff-eos/staff-eos/staff-eos.component';
import { ListSalaryPaymentComponent } from './pages/salary-payment/list-salary-payment/list-salary-payment.component';
import { AddSalaryPaymentModule } from './pages/salary-payment/add-salary-payment/add-salary-payment.component';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';
import { PayrollViewComponent } from './pages/payroll/payroll-view/payroll-view.component';
import { PayrollListComponent } from './pages/payroll/payroll-list/payroll-list.component';
import { PayrollAddComponent } from './pages/payroll/payroll-add/payroll-add.component';
import { PayrollEditComponent } from './pages/payroll/payroll-edit/payroll-edit.component';
import { PayrollVerifyComponent } from './pages/payroll/payroll-verify/payroll-verify.component';
import { PayrollApproveComponent } from './pages/payroll/payroll-approve/payroll-approve.component';

@NgModule({
  declarations: [
    AbsentListComponent,
    AttendanceSheetComponent,
    EditedAttendanceComponent,
    ExcessBreakDetailsComponent,
    ExcessBreaksComponent,
    FinalSettlementReportComponent,
    LateComerListComponent,
    LeavelistComponent,
    PaySlipComponent,
    PayrollOtReportComponent,
    PayrollReportComponent,
    SalaryWPSComponent,
    StaffShiftChangeReportComponent,
    TimesheetReportComponent,
    WageRegisterComponent,

    TimesheetListComponent,
    TimesheetAddComponent,
    TimesheetEditComponent,
    TimesheetVerifyComponent,
    TimesheetApproveComponent,
    TimesheetViewComponent,

    StaffEOSComponent,
    ListSalaryPaymentComponent,

    PayrollListComponent,
    PayrollAddComponent,
    PayrollEditComponent,
    PayrollVerifyComponent,
    PayrollApproveComponent,
    PayrollViewComponent

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HrRoutingModule,
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
    DxLoadPanelModule,
    DxoItemModule,
    DxoFormItemModule,
    DxoLookupModule,
    DxiItemModule,
    DxiGroupModule,
    DxoSummaryModule,
    FormPopupModule,
    CustomDatePopupModule,
    AddSalaryPaymentModule,
  ],
  exports: [
    AbsentListComponent,
    AttendanceSheetComponent,
    EditedAttendanceComponent,
    ExcessBreakDetailsComponent,
    ExcessBreaksComponent,
    FinalSettlementReportComponent,
    LateComerListComponent,
    LeavelistComponent,
    PaySlipComponent,
    PayrollOtReportComponent,
    PayrollReportComponent,
    SalaryWPSComponent,
    StaffShiftChangeReportComponent,
    TimesheetReportComponent,
    WageRegisterComponent,

    TimesheetListComponent,
    TimesheetAddComponent,
    TimesheetEditComponent,
    TimesheetVerifyComponent,
    TimesheetApproveComponent,
    TimesheetViewComponent,

    StaffEOSComponent,
    ListSalaryPaymentComponent,

    PayrollListComponent,
    PayrollAddComponent,
    PayrollEditComponent,
    PayrollVerifyComponent,
    PayrollApproveComponent,
    PayrollViewComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HrModule {}
