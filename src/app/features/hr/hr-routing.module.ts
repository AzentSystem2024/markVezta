import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from 'src/app/services';

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

const routes: Routes = [
  {
    path: 'pay-slip',
    component: PaySlipComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'wage-register',
    component: WageRegisterComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'attendance-sheet',
    component: AttendanceSheetComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'salary-wps',
    component: SalaryWPSComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'timesheet-report',
    component: TimesheetReportComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'payroll-report',
    component: PayrollReportComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'payroll-ot-report',
    component: PayrollOtReportComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'leave-list',
    component: LeavelistComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'finalsettlement-report',
    component: FinalSettlementReportComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'edited-attendance',
    component: EditedAttendanceComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'late-comer-report',
    component: LateComerListComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'absent-list',
    component: AbsentListComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'excess-breaks',
    component: ExcessBreaksComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'staff-shift-change-report',
    component: StaffShiftChangeReportComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'excess-break-details',
    component: ExcessBreakDetailsComponent,
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HrRoutingModule {}
