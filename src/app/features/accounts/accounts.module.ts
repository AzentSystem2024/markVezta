import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  DxAutocompleteModule,
  DxBoxModule,
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxFileUploaderModule,
  DxFormModule,
  DxLoadPanelModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxProgressBarModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTabPanelModule,
  DxTabsModule,
  DxTagBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxTooltipModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import {
  DxiButtonModule,
  DxiGroupModule,
  DxiItemModule,
  DxoFormItemModule,
  DxoItemModule,
  DxoLookupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { FormPopupModule, FormTextboxModule } from 'src/app/components';
import { TooltipCellModule } from 'src/app/components/utils/tooltip-cell/tooltip-cell.component';
import { ImportItemsDialogModule } from 'src/app/components/library/import-items-dialog/import-items-dialog.component';
import { ViewImportedItemsModule } from 'src/app/components/library/view-imported-items/view-imported-items.component';
import { CustomDatePopupModule } from 'src/app/custom-date-popup/custom-date-popup.component';

import { AccountsRoutingModule } from './accounts-routing.module';
import { AddJournalVoucharModule } from 'src/app/pages/JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from 'src/app/pages/JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from 'src/app/pages/JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { AccountsListComponent } from './pages/chart-of-accounts/account-list/accounts-list.component';
import { AddAccountComponent } from './pages/chart-of-accounts/add-account/add-account.component';
import { EditAccountComponent } from './pages/chart-of-accounts/edit-account/edit-account.component';
import { ChartOfAccountsFinanceComponent } from './pages/chart-of-accounts-finance/chart-of-accounts-finance-lookup/chart-of-accounts-finance.component';
import { ChartOfAccountsFinanceAddFormComponent } from './pages/chart-of-accounts-finance/chart-of-accounts-finance-add-form/chart-of-accounts-finance-add-form.component';
import { ChartOfAccountsFinanceEditFormComponent } from './pages/chart-of-accounts-finance/chart-of-accounts-finance-edit-form/chart-of-accounts-finance-edit-form.component';
import { ImportChartOfAccountsComponent } from './pages/import-chart-of-accounts/import-chart-of-accounts.component';
import { OpeningBalanceComponent } from './pages/opening-balance/opening-balance.component';
import { FixedAssetRegisterComponent } from './pages/fixed-asset/fixed-asset-register/fixed-asset-register.component';
import { FixedAsstesAddComponent } from './pages/fixed-asset/fixed-asstes-add/fixed-asstes-add.component';
import { FixedAsstesEditComponent } from './pages/fixed-asset/fixed-asstes-edit/fixed-asstes-edit.component';
import { AddMiscReceiptComponent } from './pages/misc-reciept/add-misc-receipt/add-misc-receipt.component';
import { EditMiscReceiptComponent } from './pages/misc-reciept/edit-misc-receipt/edit-misc-receipt.component';
import { DepreciationAddComponent } from './pages/depreciation/depreciation-add/depreciation-add.component';
import { DepreciationEditComponent } from './pages/depreciation/depreciation-edit/depreciation-edit.component';
import { DepreciationReportComponent } from './pages/depreciation/depreciation-report/depreciation-report.component';
import { AddMiscellaneousPaymentComponent } from './pages/miscellaneous-payment/add-miscellaneous-payment/add-miscellaneous-payment.component';
import { EditMiscellaneousPaymentComponent } from './pages/miscellaneous-payment/edit-miscellaneous-payment/edit-miscellaneous-payment.component';
import { ListMiscellaneousPaymentsComponent } from './pages/miscellaneous-payment/list-miscellaneous-payments/list-miscellaneous-payments.component';
import { DepreciationListComponent } from './pages/depreciation/depreciation-list/depreciation-list.component';
import { FixedAsstesListComponent } from './pages/fixed-asset/fixed-asstes-list/fixed-asstes-list.component';
import { ListMiscReceiptComponent } from './pages/misc-reciept/list-misc-receipt/list-misc-receipt.component';
import { PdcAddFormComponent } from './pages/pdc/pdc-add-form/pdc-add-form.component';
import { PdcEditFormComponent } from './pages/pdc/pdc-edit-form/pdc-edit-form.component';
import { PDCReportComponent } from './pages/pdc/pdc-report/pdc-report.component';
import { PdcListComponent } from './pages/pdc/pdc-list/pdc-list.component';
import { JournalVoucherListComponent } from './pages/journal-voucher-list/journal-voucher-list.component';
import { PrepaymentPostingReportComponent } from './pages/prepayment-posting-report/prepayment-posting-report.component';
import { DebitComponent } from './pages/debit-note/debit/debit.component';
import { AddDebitModule } from 'src/app/features/accounts/pages/debit-note/add-debit/add-debit.component';
import { EditDebitModule } from 'src/app/features/accounts/pages/debit-note/edit-debit/edit-debit.component';
import { ViewDebitModule } from 'src/app/features/accounts/pages/debit-note/view-debit/view-debit.component';
import { CreditNoteListComponent } from './pages/credit-note/credit-note-list/credit-note-list.component';
import { AddCreditNoteModule } from 'src/app/features/accounts/pages/credit-note/add-credit-note/add-credit-note.component';
import { EditCreditNoteModule } from 'src/app/features/accounts/pages/credit-note/edit-credit-note/edit-credit-note.component';
import { ViewCreditNoteModule } from 'src/app/features/accounts/pages/credit-note/view-credit-note/view-credit-note.component';
@NgModule({
  declarations: [
    AccountsListComponent,
    AddAccountComponent,
    EditAccountComponent,
    ChartOfAccountsFinanceComponent,
    ChartOfAccountsFinanceAddFormComponent,
    ChartOfAccountsFinanceEditFormComponent,
    ImportChartOfAccountsComponent,
    OpeningBalanceComponent,
    FixedAssetRegisterComponent,
    FixedAsstesAddComponent,
    FixedAsstesEditComponent,
    AddMiscReceiptComponent,
    EditMiscReceiptComponent,
    DepreciationAddComponent,
    DepreciationEditComponent,
    DepreciationReportComponent,
    AddMiscellaneousPaymentComponent,
    EditMiscellaneousPaymentComponent,
    ListMiscellaneousPaymentsComponent,
    DepreciationListComponent,
    FixedAsstesListComponent,
    ListMiscReceiptComponent,
    PdcAddFormComponent,
    PdcEditFormComponent,
    PDCReportComponent,
    PdcListComponent,
    JournalVoucherListComponent,
    PrepaymentPostingReportComponent,
    DebitComponent,
    CreditNoteListComponent,
  ],
  exports: [
    FixedAsstesAddComponent,
    FixedAsstesEditComponent,
    AddMiscReceiptComponent,
    EditMiscReceiptComponent,
    DepreciationAddComponent,
    DepreciationEditComponent,
    AddMiscellaneousPaymentComponent,
    EditMiscellaneousPaymentComponent,
    ListMiscellaneousPaymentsComponent,
    PdcAddFormComponent,
    PdcEditFormComponent,
    AddJournalVoucharModule,
    EditJournalVoucherModule,
    ViewJournalVoucherModule,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AccountsRoutingModule,
    AddJournalVoucharModule,
    EditJournalVoucherModule,
    ViewJournalVoucherModule,
    AddDebitModule,
    EditDebitModule,
    ViewDebitModule,
    AddCreditNoteModule,
    EditCreditNoteModule,
    ViewCreditNoteModule,
    FormTextboxModule,
    FormPopupModule,
    TooltipCellModule,
    ImportItemsDialogModule,
    ViewImportedItemsModule,
    CustomDatePopupModule,
    DxAutocompleteModule,
    DxBoxModule,
    DxButtonModule,
    DxCheckBoxModule,
    DxDataGridModule,
    DxDateBoxModule,
    DxDropDownBoxModule,
    DxFileUploaderModule,
    DxFormModule,
    DxLoadPanelModule,
    DxNumberBoxModule,
    DxPopupModule,
    DxProgressBarModule,
    DxRadioGroupModule,
    DxSelectBoxModule,
    DxTabPanelModule,
    DxTabsModule,
    DxTagBoxModule,
    DxTextAreaModule,
    DxTextBoxModule,
    DxToolbarModule,
    DxTooltipModule,
    DxValidationGroupModule,
    DxValidatorModule,
    DxiButtonModule,
    DxiGroupModule,
    DxiItemModule,
    DxoFormItemModule,
    DxoItemModule,
    DxoLookupModule,
    DxoSummaryModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AccountsModule {}
