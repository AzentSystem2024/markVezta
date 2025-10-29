import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import {
  LoginFormComponent,
  ResetPasswordFormComponent,
  CreateAccountFormComponent,
  ChangePasswordFormComponent,
} from './components';
import { AuthGuardService } from './services';

import {
  SideNavOuterToolbarComponent,
  UnauthenticatedContentComponent,
} from './layouts';

import { DenialListComponent } from './pages/Denial-list/denial-list.component';
import { CrmContactDetailsComponent } from './pages/crm-contact-details/crm-contact-details.component';
// import { PlanningTaskListComponent } from './pages/planning-task-list/planning-task-list.component';
// import { PlanningTaskDetailsComponent } from './pages/planning-task-details/planning-task-details.component';
import { AnalyticsDashboardComponent } from './pages/analytics-dashboard/analytics-dashboard.component';
// import { AnalyticsSalesReportComponent } from './pages/analytics-sales-report/analytics-sales-report.component';
// import { AnalyticsGeographyComponent } from './pages/analytics-geography/analytics-geography.component';
// import { PlanningSchedulerComponent } from './pages/planning-scheduler/planning-scheduler.component';
import { AppSignInComponent } from './pages/sign-in-form/sign-in-form.component';
import { AppSignUpComponent } from './pages/sign-up-form/sign-up-form.component';
import { AppResetPasswordComponent } from './pages/reset-password-form/reset-password-form.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { DepartmentListComponent } from './pages/department-list/department-list.component';
import { CountryListComponent } from './pages/country-list/country-list.component';
import { ItemBrandListComponent } from './pages/item-brand-list/item-brand-list.component';
import { CurrencyListComponent } from './pages/currency-list/currency-list.component';
// import { CategoryListComponent } from './pages/category-list/category-list.component';
// import { SubCategoryListComponent } from './pages/sub-category-list/sub-category-list.component';
import { VatClassListComponent } from './pages/vat-class-list/vat-class-list.component';
import { PaymentTermsListComponent } from './pages/payment-terms-list/payment-terms-list.component';
import { DeliveryTermsListComponent } from './pages/delivery-terms-list/delivery-terms-list.component';
import { StoresListComponent } from './pages/stores-list/stores-list.component';
import { SupplierListComponent } from './pages/supplier-list/supplier-list.component';
import { StateListComponent } from './pages/state-list/state-list.component';
import {
  ItemProperty1ListComponent,
  ItemProperty1ListModule,
} from './pages/item-property1-list/item-property1-list.component';
import { ItemProperty2ListComponent } from './pages/item-property2-list/item-property2-list.component';
import { SalesmanListComponent } from './pages/salesman-list/salesman-list.component';
import { LandedCostListComponent } from './pages/landed-cost-list/landed-cost-list.component';
import { TendersListComponent } from './pages/tenders-list/tenders-list.component';
import { ReasonsListComponent } from './pages/reasons-list/reasons-list.component';
import { ItemsListComponent } from './pages/items-list/items-list.component';
import { SubcategoryListComponent } from './pages/subcategory-list/subcategory-list.component';
import { UomListComponent } from './pages/uom-list/uom-list.component';
import { PackingListComponent } from './pages/packing-list/packing-list.component';
import { ItemsEditFormComponent } from './pages/items-edit-form/items-edit-form.component';
import { ItemsFormComponent } from './components/library/items-form/items-form.component';
import { StoreItemsComponent } from './pages/store-items/store-items.component';
import { StoreItemsListComponent } from './pages/store-items-list/store-items-list.component';
import { ItemProperty3Component } from './pages/item-property3/item-property3.component';
import { ItemProperty4ListComponent } from './pages/item-property4-list/item-property4-list.component';
import { ItemProperty5FormComponent } from './components/library/item-property5-form/item-property5-form.component';
import { ItemProperty5ListComponent } from './pages/item-property5-list/item-property5-list.component';

import { ImportItemsComponent } from './operations/import-items/import-items.component';
import { ImportItemsTemplateComponent } from './pages/import-items-template/import-items-template.component';
import { ItemStorePropertiesComponent } from './pages/item-store-properties/item-store-properties.component';
import { ItemStorePropertiesLogComponent } from './pages/item-store-properties-log/item-store-properties-log.component';
import { ItemStorePropertiesEditComponent } from './pages/item-store-properties-edit/item-store-properties-edit.component';
import { UserLevelsComponent } from './pages/user-levels/user-levels.component';
import { PurchaseReturnComponent } from './pages/Operations/purchase-return/purchase-return.component';
import { DocumentTemplatesListComponent } from './settings/document-templates/document-templates-list/document-templates-list.component';
import { GrnComponent } from './pages/Operations/grn/grn/grn.component';
import { TransferOutComponent } from './pages/Operations/transfer-out/transfer-out.component';
import { TransferInComponent } from './pages/Operations/transfer-in/transfer-in.component';
import { ItemStorePricesComponent } from './pages/item-store-prices/item-store-prices.component';
import { ItemStorePricesLogComponent } from './pages/item-store-prices-log/item-store-prices-log.component';
import { ItemStorePricesEditComponent } from './pages/item-store-prices-edit/item-store-prices-edit.component';
import { ItemStorePriceVerifyApproveComponent } from './pages/item-store-price-verify-approve/item-store-price-verify-approve.component';
import { ItemStorePriceViewComponent } from './pages/item-store-price-view/item-store-price-view.component';
import { ItemStorePriceApproveComponent } from './pages/item-store-price-approve/item-store-price-approve.component';
import { PromotionSchemaLogComponent } from './pages/promotion-schema-log/promotion-schema-log.component';
import { PromotionSchemaEditComponent } from './pages/promotion-schema-edit/promotion-schema-edit.component';
import { PromotionComponent } from './pages/promotion/promotion.component';
import { PromotionPopupComponent } from './pages/promotion-popup/promotion-popup.component';
import { PromotionLogComponent } from './pages/promotion-log/promotion-log.component';
import { PromotionEditComponent } from './pages/promotion-edit/promotion-edit.component';
import { PromotionVerifyComponent } from './pages/promotion-verify/promotion-verify.component';
import { PromotionApproveComponent } from './pages/promotion-approve/promotion-approve.component';
import { PromotionViewComponent } from './pages/promotion-view/promotion-view.component';
import { StockViewListComponent } from './pages/Operations/stock-view-list/stock-view-list.component';
import { SupplierEditComponent } from './pages/supplier-edit/supplier-edit.component';
import { LandedCostEditComponent } from './pages/landed-cost-edit/landed-cost-edit.component';
import { InterStoreTransferListComponent } from './pages/Operations/inter-store-transfer-list/inter-store-transfer-list.component';
import { DepartmentComponent } from './pages/HR/Masters/department/department.component';
import { DesignationComponent } from './pages/HR/Masters/designation/designation.component';
import { EOSComponent } from './pages/HR/Masters/eos/eos.component';
import { PaySettingsComponent } from './pages/HR/Masters/pay-settings/pay-settings.component';
import { LeaveSalaryComponent } from './pages/HR/Masters/leave-salary/leave-salary.component';
import { EmployeeLeaveComponent } from './pages/HR/Masters/employee-leave/employee-leave.component';
// import { AdvanceTypesComponent } from './pages/HR/Masters/advance-types/advance-types.component';

import { EmployeeComponent } from './components/HR/Masters/employee/employee.component';
import { EmployeeAddFormComponent } from './components/HR/Masters/employee-add-form/employee-add-form.component';

import { SalaryHeadsComponent } from './HR/Masters/salary-heads/salary-heads.component';
import { AdvanceTypesComponent } from './HR/Masters/advance-types/advance-types.component';
import { AdvanceComponent } from './HR/Masters/advance/advance.component';
import { PayRevisionComponent } from './components/HR/Masters/pay-revision/pay-revision.component';

import { TimesheetListComponent } from './components/HR/Masters/timesheet-list/timesheet-list.component';
import { StaffEOSComponent } from './HR/Masters/staff-eos/staff-eos.component';
import { ListMiscellaneousPaymentsComponent } from './components/HR/Masters/list-miscellaneous-payments/list-miscellaneous-payments.component';
import { PayrollListComponent } from './components/HR/Masters/payroll-list/payroll-list.component';
import { AccountsListComponent } from './pages/ACCOUNTS/accounts-list/accounts-list.component';
import { ArticleListComponent } from './pages/ARTICLE/article-list/article-list.component';

import { ArticleColorComponent } from './pages/ARTICLE/article-color/article-color.component';
import { ArticleTypeComponent } from './pages/ARTICLE/article-type/article-type.component';
import { ArticleBrandComponent } from './pages/ARTICLE/article-brand/article-brand.component';
import { DealerComponent } from './pages/ARTICLE/dealer/dealer.component';
import { CompanyMasterComponent } from './pages/ARTICLE/company-master/company-master.component';

import { CategoryComponent } from './pages/ARTICLE/category/category/category.component';
import { PackingComponent } from './pages/ARTICLE/packing/packing.component';

import { ArticleProductionViewComponent } from './components/HR/Masters/article-production-view/article-production-view.component';
import { PackProductionViewComponent } from './pages/ARTICLE/pack-production-view/pack-production-view.component';
import { StockMovementViewComponent } from './pages/ARTICLE/stock-movement-view/stock-movement-view.component';
import { TransferOutViewComponent } from './pages/ARTICLE/transfer-out-view/transfer-out-view.component';
import { ArticleStockViewComponent } from './pages/ARTICLE/article-stock-view/article-stock-view.component';
import { TransferInViewComponent } from './pages/ARTICLE/transfer-in-view/transfer-in-view.component';
import { CartonStockViewComponent } from './pages/ARTICLE/carton-stock-view/carton-stock-view.component';

import { UserRoleComponent } from './pages/HR/Masters/user-role/user-role.component';
import { UserComponent } from './pages/HR/Masters/user/user.component';

import { JournalVoucherListComponent } from './pages/JOURNAL-VOUCHER/journal-voucher-list/journal-voucher-list.component';
import { CreditNoteListComponent } from './pages/CREDIT-NOTE/credit-note-list/credit-note-list.component';
import { MonthlyPlanComponent } from './pages/ARTICLE/monthly-plan/monthly-plan.component';
import { LedgerStatementComponent } from './pages/REPORT/ledger-statement/ledger-statement.component';
import { DebitComponent } from './pages/DEBIT/debit/debit.component';
import { InvoiceListComponent } from './pages/INVOICE/invoice-list/invoice-list.component';
import { CustomerReceiptsComponent } from './pages/CUSTOMER-RECEIPTS/customer-receipts/customer-receipts.component';
import { TrialBalanceReportComponent } from './pages/REPORT/trial-balance-report/trial-balance-report.component';
import { JournalBookComponent } from './pages/REPORT/journal-book/journal-book.component';
// import { EmployeeSalarySettingsComponent } from './components/HR/Masters/employee-salary-settings/employee-salary-settings/employee-salary-settings.component';
import { SalaryHeadListComponent } from './components/HR/Masters/Salary Head/salary-head-list/salary-head-list.component';
import { CustomerListComponent } from './components/HR/Masters/Customer/customer-list/customer-list.component';
import { FixedAsstesListComponent } from './pages/FIXED_ASSETS/fixed-asstes-list/fixed-asstes-list.component';
import { DepreciationListComponent } from './pages/Depreciation/depreciation-list/depreciation-list.component';

import { SupplierPaymentListComponent } from './pages/SUPPLIER-PAYMENT/supplier-payment-list/supplier-payment-list.component';
import { OpeningBalanceComponent } from './pages/OPENING BALANACE/opening-balance/opening-balance.component';
import { PurchaseInvoiceListComponent } from './pages/PURCHASE INVOICE/purchase-invoice-list/purchase-invoice-list.component';
import { ListMiscReceiptComponent } from './components/HR/Masters/MISC-RECEIPT/list-misc-receipt/list-misc-receipt.component';
import { ListSalaryPaymentComponent } from './components/HR/Masters/SALARY-PAYMENT/list-salary-payment/list-salary-payment.component';
import { EmployeeSalarySettingsComponent } from './components/HR/Masters/employee-salary-settings/employee-salary-settings.component';
import { PaytimeEntryComponent } from './components/HR/Masters/paytime-entry/paytime-entry.component';
import { PdcListComponent } from './components/HR/Masters/PDC/pdc-list/pdc-list.component';
// import { PrePaymentListComponent } from './components/HR/Masters/pre-payment-list/pre-payment-list.component';
import { BoxProductionViewComponent } from './components/HR/Masters/box-production-view/box-production-view.component';
import { CashBookComponent } from './pages/Cash-Book/cash-book/cash-book.component';
import { ProfitAndLossComponent } from './pages/PROFITLOSS/profit-and-loss/profit-and-loss.component';
import { BalanceSheetComponent } from './pages/BALANCESHEET/balance-sheet/balance-sheet.component';
import { PrePaymentListComponent } from './pages/PRE_PAYMENT (1)/PRE_PAYMENT/pre-payment-list/pre-payment-list.component';
import { SupplierReportComponent } from './pages/SUPPLIERREPORT/supplier-report/supplier-report.component';
import { CustomerReportComponent } from './pages/customer-report/customer-report/customer-report.component';
import { AgedReceivablesComponent } from './pages/Aged Receivables/aged-receivables/aged-receivables.component';
import { AgedPayablesComponent } from './pages/Aged Payable/aged-payables/aged-payables.component';
import { SupplierStatementDetailsComponent } from './pages/SuppierStatementDetails/supplier-statement-details/supplier-statement-details.component';
import { CustomerStatementDetailsComponent } from './pages/custmer-statement-details/customer-statement-details/customer-statement-details.component';
import { AgedReceivableDetailsComponent } from './pages/Aged  Receivable Details/aged-receivable-details/aged-receivable-details.component';
import { AgedPayableDetailsComponent } from './pages/aged-payable-details/aged-payable-details.component';
import { InputVatComponent } from './pages/input-vat/input-vat.component';
import { OutputVatComponent } from './pages/OutPutVat/output-vat/output-vat.component';
import { VatReturnComponent } from './pages/Vat Return/vat-return/vat-return.component';
import { PurchaseOrderComponent } from './pages/purchase-order/purchase-order.component';
import {
  PrepaymentPostingListComponent,
  PrepaymentPostingListModule,
} from './pages/PrePayment Posting/prepayment-posting-list/prepayment-posting-list.component';

import { PaySlipComponent } from './components/HR/Masters/pay-slip/pay-slip.component';
import { TransferOutInventoryComponent } from './pages/transfer-out-inventory/transfer-out-inventory.component';
import { EPFRegisterReportComponent } from './pages/EPF Report/epf-register-report/epf-register-report.component';
import { WageRegisterComponent } from './components/HR/Masters/wage-register/wage-register.component';
import { ESIComponent } from './components/HR/Masters/esi/esi.component';
import { TransferInInventoryComponent } from './pages/transfer-in-inventory/transfer-in-inventory.component';
import { AttendanceSheetComponent } from './components/HR/Masters/attendance-sheet/attendance-sheet.component';
import { ItemQuantityStockComponent } from './components/HR/Masters/item-quantity-stock/item-quantity-stock.component';
import { ItemStockValueComponent } from './components/HR/Masters/item-stock-value/item-stock-value.component';
import { ItemCategoryListComponent } from './pages/item-category-list/item-category-list/item-category-list.component';
import { StockAdjustmentListComponent } from './pages/Stock_Adjustment/stock-adjustment-list/stock-adjustment-list.component';
import { DeliveryNoteComponent } from './pages/delivery-note/delivery-note.component';
import { StockMovementReportComponent } from './pages/HR/Masters/stock-movement-report/stock-movement-report.component';
import { QuotationComponent } from './pages/quotation/quotation.component';
import { SalesOrderComponent } from './pages/sales-order/sales-order.component';
import { InvoiceDeliveryComponent } from './pages/invoice-delivery/invoice-delivery.component';
import { PhysicalInventoryComponent } from './pages/physical-inventory/physical-inventory.component';
import { DeliveryReturnComponent } from './pages/delivery-return/delivery-return.component';
import { ArticleProductionViewModule } from './components/HR/Masters/article-production-view/article-production-view.component';
import { DeliveryAddressComponent } from './HR/Masters/delivery-address/delivery-address.component';

// import { ItemCategoryComponent } from './HR/Masters/item-category/item-category.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },

  //       {
  //  path: 'customer-list',
  //  component: CustomerListComponent,
  //  canActivate: [AuthGuardService],
  //   },

  {
    path: 'auth',
    component: UnauthenticatedContentComponent,
    children: [
      {
        path: 'login',
        component: LoginFormComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'reset-password',
        component: ResetPasswordFormComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'create-account',
        component: CreateAccountFormComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'change-password/:recoveryCode',
        component: ChangePasswordFormComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: '**',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    component: SideNavOuterToolbarComponent,
    children: [
      {
        path: 'analytics-dashboard',
        component: AnalyticsDashboardComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'denial-list-page',
        component: DenialListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'crm-contact-details',
        component: CrmContactDetailsComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'department',
        component: DepartmentListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'article-color',
        component: ArticleColorComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'article-type',
        component: ArticleTypeComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'dealer',
        component: DealerComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'company',
        component: CompanyMasterComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'article-brand',
        component: ArticleBrandComponent,
        canActivate: [AuthGuardService],
      },
      // {
      //   path: 'article-production-view',
      //   component: ArticleProductionViewComponent,
      //   canActivate: [AuthGuardService],
      // },
      {
        path: 'customer-list',
        component: CustomerListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'pack-production-view',
        component: PackProductionViewComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'stock-movement-view',
        component: StockMovementViewComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'transfer-out-view',
        component: TransferOutViewComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'country',
        component: CountryListComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'accounts',
        component: AccountsListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'article',
        component: ArticleListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'fixed-assets',
        component: FixedAsstesListComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'user-role',
        component: UserRoleComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'user',
        component: UserComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'depreciation',
        component: DepreciationListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'journal-voucher',
        component: JournalVoucherListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'journal-book',
        component: JournalBookComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'credit-note',
        component: CreditNoteListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'payroll',
        component: PayrollListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'supplier-payment',
        component: SupplierPaymentListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'opening-balance',
        component: OpeningBalanceComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'purchase-invoice',
        component: PurchaseInvoiceListComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'grn',
        component: GrnComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'purchase-order',
        component: PurchaseOrderComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'items',
        component: ItemsListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'employee-salary-settings',
        component: EmployeeSalarySettingsComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'trial-balance-report',
        component: TrialBalanceReportComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'salary-advance',
        component: AdvanceComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'debit',
        component: DebitComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'invoice',
        component: InvoiceListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'customer-receipt',
        component: CustomerReceiptsComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'miscellaneous-payment',
        component: ListMiscellaneousPaymentsComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'misc-receipt',
        component: ListMiscReceiptComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'salary-payment',
        component: ListSalaryPaymentComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'employee',
        component: EmployeeComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'timesheet',
        component: TimesheetListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'packing',
        component: PackingComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'category',
        component: CategoryComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'ledger-statement',
        component: LedgerStatementComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'salary-head',
        component: SalaryHeadListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'Monthly-Plan',
        component: MonthlyPlanComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'article-stock-view',
        component: ArticleStockViewComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'Carton-stock-view',
        component: CartonStockViewComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'Transfer-in-view',
        component: TransferInViewComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'supplier',
        component: SupplierListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'Paytime-entry',
        component: PaytimeEntryComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'pdc',
        component: PdcListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'pre-payment',
        component: PrePaymentListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'Box-production-view',
        component: BoxProductionViewComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'employee-salary-settings',
        component: EmployeeSalarySettingsComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'article-production-view',
        component: ArticleProductionViewComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'profit-loss',
        component: ProfitAndLossComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'cash-book',
        component: CashBookComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'balance-sheet',
        component: BalanceSheetComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'supplier-report',
        component: SupplierReportComponent,
      },
      {
        path: 'customer-report',
        component: CustomerReportComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'age-receivables',
        component: AgedReceivablesComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'customer-statement-details',
        component: CustomerStatementDetailsComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'age-payables',
        component: AgedPayablesComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'supplier-statement-details',
        component: SupplierStatementDetailsComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'aged-payable-details',
        component: AgedPayableDetailsComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'item-category',
        component: ItemCategoryListComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'sub-category',
        component: SubcategoryListComponent,
        canActivate: [AuthGuardService],
      },

      // {
      //   path: 'purchase-order',
      //   component: PurchaseOrderComponent,
      //   canActivate: [AuthGuardService],
      // },
      {
        path: 'aged-receivable-details',
        component: AgedReceivableDetailsComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'input-vat',
        component: InputVatComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'output-vat',
        component: OutputVatComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'grn',
        component: GrnComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'vat-return',
        component: VatReturnComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'department',
        component: DepartmentListComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'sub-category',
        component: SubcategoryListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'vat-class',
        component: VatClassListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'prepayment-posting',
        component: PrepaymentPostingListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'item-property-one',
        component: ItemProperty1ListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'item-property-two',
        component: ItemProperty2ListComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'item-property-three',
        component: ItemProperty3Component,
        canActivate: [AuthGuardService],
      },

      {
        path: 'item-property-four',
        component: ItemProperty4ListComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'item-property-five',
        component: ItemProperty5ListComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'items',
        component: ItemsListComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'department',
        component: DepartmentListComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'sub-category',
        component: SubcategoryListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'vat-class',
        component: VatClassListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'store',
        component: StoresListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'pay-slip',
        component: PaySlipComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'reason',
        component: ReasonsListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'transfer-out-inventory',
        component: TransferOutInventoryComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'transfer-in-inventory',
        component: TransferInInventoryComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'EPF-Register',
        component: EPFRegisterReportComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'wage-register',
        component: WageRegisterComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'esi-register',
        component: ESIComponent,
        canActivate: [AuthGuardService],
      },
      { 
        path: 'attendance-sheet',
        component: AttendanceSheetComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'item-quantity',
        component: ItemQuantityStockComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'item-stock-value', 
        component: ItemStockValueComponent,
      },
      {
        path: 'stock-adjustment',
        component: StockAdjustmentListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'delivery-note',
        component: DeliveryNoteComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'quotation',
        component: QuotationComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'sales-order',
        component: SalesOrderComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'sales-Invoice',
        component: InvoiceDeliveryComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'stock-movement-report',
        component: StockMovementReportComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'change-price',
        component: ItemStorePricesLogComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'change-price-add',
        component: ItemStorePricesComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'change-price-edit',
        component: ItemStorePricesEditComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'item-store-prices-verify-approve',
        component: ItemStorePriceVerifyApproveComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'change-price-view',
        component: ItemStorePriceViewComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'Physical-Inventory',
        component: PhysicalInventoryComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'delivery-return',
        component: DeliveryReturnComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'delivery-address',
        component: DeliveryAddressComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: '**',
        redirectTo: 'analytics-dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true }), BrowserModule],

  providers: [AuthGuardService],
  exports: [RouterModule],
  declarations: [],
})
export class AppRoutingModule {}
