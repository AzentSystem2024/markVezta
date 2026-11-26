import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SideNavOuterToolbarComponent } from 'src/app/layouts';
import { AuthGuardService } from 'src/app/services';
import { AccountsListComponent } from './pages/chart-of-accounts/account-list/accounts-list.component';
import { ChartOfAccountsFinanceComponent } from './pages/chart-of-accounts-finance/chart-of-accounts-finance-lookup/chart-of-accounts-finance.component';
import { ImportChartOfAccountsComponent } from './pages/import-chart-of-accounts/import-chart-of-accounts.component';
import { OpeningBalanceComponent } from './pages/opening-balance/opening-balance.component';
import { FixedAssetRegisterComponent } from './pages/fixed-asset/fixed-asset-register/fixed-asset-register.component';
import { DepreciationReportComponent } from './pages/depreciation/depreciation-report/depreciation-report.component';
import { ListMiscellaneousPaymentsComponent } from './pages/miscellaneous-payment/list-miscellaneous-payments/list-miscellaneous-payments.component';
import { DepreciationListComponent } from './pages/depreciation/depreciation-list/depreciation-list.component';
import { FixedAsstesListComponent } from './pages/fixed-asset/fixed-asstes-list/fixed-asstes-list.component';
import { ListMiscReceiptComponent } from './pages/misc-reciept/list-misc-receipt/list-misc-receipt.component';
import { PDCReportComponent } from './pages/pdc/pdc-report/pdc-report.component';
import { PdcListComponent } from './pages/pdc/pdc-list/pdc-list.component';
import { JournalVoucherListComponent } from './pages/journal-voucher-list/journal-voucher-list.component';
import { PrepaymentPostingReportComponent } from './pages/prepayment-posting-report/prepayment-posting-report.component';
import { DebitComponent } from './pages/debit-note/debit/debit.component';
import { CreditNoteListComponent } from './pages/credit-note/credit-note-list/credit-note-list.component';

const routes: Routes = [
  {
    path: '',
    component: SideNavOuterToolbarComponent,
    children: [
      {
        path: 'accounts',
        component: AccountsListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'chart-of-accounts-finance',
        component: ChartOfAccountsFinanceComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'import-chart-of-accounts',
        component: ImportChartOfAccountsComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'opening-balance',
        component: OpeningBalanceComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'fixed-asset-register',
        component: FixedAssetRegisterComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'depreciation-report',
        component: DepreciationReportComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'miscellaneous-payment',
        component: ListMiscellaneousPaymentsComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'depreciation',
        component: DepreciationListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'fixed-assets',
        component: FixedAsstesListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'misc-receipt',
        component: ListMiscReceiptComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'pdc-report',
        component: PDCReportComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'pdc',
        component: PdcListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'journal-voucher',
        component: JournalVoucherListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'debit',
        component: DebitComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'credit-note',
        component: CreditNoteListComponent,
        canActivate: [AuthGuardService],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountsRoutingModule {}
