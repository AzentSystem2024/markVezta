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
import { AnalyticsDashboardComponent } from './pages/analytics-dashboard/analytics-dashboard.component';
import { AppResetPasswordComponent } from './pages/reset-password-form/reset-password-form.component';
import { DepartmentListComponent } from './pages/MASTER/item-department-list/department-list.component';
import { CountryListComponent } from './pages/country-list/country-list.component';
import { VatClassListComponent } from './pages/MASTER/vat-class-list/vat-class-list.component';
import { StoresListComponent } from './pages/MASTER/stores-list/stores-list.component';
import { SupplierListComponent } from './pages/MASTER/supplier-list/supplier-list.component';
import { StateListComponent } from './pages/MASTER/state-list/state-list.component';
import { ItemProperty1ListComponent } from './pages/MASTER/item-property1-list/item-property1-list.component';
import { ItemProperty2ListComponent } from './pages/MASTER/item-property2-list/item-property2-list.component';
import { ReasonsListComponent } from './pages/MASTER/reasons-list/reasons-list.component';
import { ItemsListComponent } from './pages/MASTER/items-list/items-list.component';
import { SubcategoryListComponent } from './pages/MASTER/subcategory-list/subcategory-list.component';
import { UomListComponent } from './pages/MASTER/uom-list/uom-list.component';
import { ItemProperty3Component } from './pages/MASTER/item-property3/item-property3.component';
import { ItemProperty4ListComponent } from './pages/MASTER/item-property4-list/item-property4-list.component';
import { ItemProperty5ListComponent } from './pages/MASTER/item-property5-list/item-property5-list.component';
import { ImportItemsComponent } from './pages/MASTER/import-items/import-items.component';
import { ItemStorePricesLogComponent } from './pages/item-store-prices-log/item-store-prices-log.component';
import { ItemStorePricesEditComponent } from './pages/item-store-prices-edit/item-store-prices-edit.component';
import { ItemStorePriceVerifyApproveComponent } from './pages/item-store-price-verify-approve/item-store-price-verify-approve.component';
import { ItemStorePriceViewComponent } from './pages/item-store-price-view/item-store-price-view.component';
import { DepartmentComponent } from './pages/MASTER/department/department.component';
import { EOSComponent } from './pages/HR/Masters/eos/eos.component';
import { LeaveSalaryComponent } from './pages/HR/Masters/leave-salary/leave-salary.component';
import { EmployeeLeaveComponent } from './pages/HR/Masters/employee-leave/employee-leave.component';
import { EmployeeComponent } from './pages/HR/Masters/employee/employee.component';
import { TimesheetListComponent } from './pages/HR/Masters/timesheet-list/timesheet-list.component';
import { StaffEOSComponent } from './components/HR/Masters/staff-eos/staff-eos.component';
import { ListMiscellaneousPaymentsComponent } from './pages/ACCOUNTS/list-miscellaneous-payments/list-miscellaneous-payments.component';
import { PayrollListComponent } from './pages/HR/Masters/payroll-list/payroll-list.component';
import { AccountsListComponent } from './pages/ACCOUNTS/Chart of Account/accounts-list.component';
import { ArticleListComponent } from './pages/MASTER/article-list/article-list.component';
import { ArticleColorComponent } from './pages/MASTER/article-color/article-color.component';
import { ArticleTypeComponent } from './pages/MASTER/article-type/article-type.component';
import { ArticleBrandComponent } from './pages/MASTER/article-brand/article-brand.component';
import { DealerComponent } from './pages/ARTICLE/dealer/dealer.component';
import { CompanyMasterComponent } from './pages/MASTER/company-master/company-master.component';
import { CategoryComponent } from './pages/ARTICLE/category/category/category.component';
import { PackingComponent } from './pages/MASTER/packing/packing.component';
import { ArticleProductionViewComponent } from './components/HR/Masters/article-production-view/article-production-view.component';
import { PackProductionViewComponent } from './pages/ARTICLE/pack-production-view/pack-production-view.component';
import { StockMovementViewComponent } from './pages/ARTICLE/stock-movement-view/stock-movement-view.component';
import { TransferOutViewComponent } from './pages/ARTICLE/transfer-out-view/transfer-out-view.component';
import { ArticleStockViewComponent } from './pages/ARTICLE/article-stock-view/article-stock-view.component';
import { TransferInViewComponent } from './pages/ARTICLE/transfer-in-view/transfer-in-view.component';
import { CartonStockViewComponent } from './pages/ARTICLE/carton-stock-view/carton-stock-view.component';
import { UserRoleComponent } from './pages/MASTER/user-role/user-role.component';
import { UserComponent } from './pages/HR/Masters/user/user.component';
import { JournalVoucherListComponent } from './pages/ACCOUNTS/journal-voucher-list/journal-voucher-list.component';
import { CreditNoteListComponent } from './pages/ACCOUNTS/credit-note-list/credit-note-list.component';
import { MonthlyPlanComponent } from './pages/ARTICLE/monthly-plan/monthly-plan.component';
import { LedgerStatementComponent } from './pages/REPORT/ledger-statement/ledger-statement.component';
import { DebitComponent } from './pages/ACCOUNTS/debit/debit.component';

import { TrialBalanceReportComponent } from './pages/REPORT/trial-balance-report/trial-balance-report.component';
import { JournalBookComponent } from './pages/ACCOUNTS/journal-book/journal-book.component';
import { CustomerListComponent } from './pages/MASTER/customer-list/customer-list.component';
import { FixedAsstesListComponent } from './pages/ACCOUNTS/fixed-asstes-list/fixed-asstes-list.component';
import { DepreciationListComponent } from './pages/ACCOUNTS/depreciation-list/depreciation-list.component';
import { SupplierPaymentListComponent } from './pages/ACCOUNTS/supplier-payment-list/supplier-payment-list.component';
import { OpeningBalanceComponent } from './pages/ACCOUNTS/opening-balance/opening-balance.component';

import { ListMiscReceiptComponent } from './pages/ACCOUNTS/list-misc-receipt/list-misc-receipt.component';
import { ListSalaryPaymentComponent } from './pages/HR/Masters/list-salary-payment/list-salary-payment.component';
import { EmployeeSalarySettingsComponent } from './pages/HR/Masters/employee-salary-settings/employee-salary-settings.component';
import { PaytimeEntryComponent } from './pages/HR/Masters/paytime-entry/paytime-entry.component';
import { PdcListComponent } from './pages/ACCOUNTS/pdc-list/pdc-list.component';
import { BoxProductionViewComponent } from './components/HR/Masters/box-production-view/box-production-view.component';
import { CashBookComponent } from './pages/REPORT/cash-book/cash-book.component';
import { ProfitAndLossComponent } from './pages/REPORT/profit-and-loss/profit-and-loss.component';
import { BalanceSheetComponent } from './pages/REPORT/balance-sheet/balance-sheet.component';
import { PrePaymentListComponent } from './pages/ACCOUNTS/pre-payment-list/pre-payment-list.component';
import { SupplierReportComponent } from './pages/SUPPLIERREPORT/supplier-report/supplier-report.component';
import { CustomerReportComponent } from './pages/customer-report/customer-report/customer-report.component';
import { AgedReceivablesComponent } from './pages/Aged Receivables/aged-receivables/aged-receivables.component';
import { AgedPayablesComponent } from './pages/REPORT/aged-payables/aged-payables.component';
import { SupplierStatementDetailsComponent } from './pages/REPORT/supplier-statement-details/supplier-statement-details.component';
import { CustomerStatementDetailsComponent } from './pages/REPORT/customer-statement-details/customer-statement-details.component';
import { AgedReceivableDetailsComponent } from './pages/REPORT/aged-receivable-details/aged-receivable-details.component';
import { AgedPayableDetailsComponent } from './pages/aged-payable-details/aged-payable-details.component';
import { InputVatComponent } from './pages/input-vat/input-vat.component';
import { OutputVatComponent } from './pages/OutPutVat/output-vat/output-vat.component';
import { VatReturnComponent } from './pages/Vat Return/vat-return/vat-return.component';
import { PrepaymentPostingListComponent } from './pages/ACCOUNTS/prepayment-posting-list/prepayment-posting-list.component';
import { PaySlipComponent } from './pages/REPORT/pay-slip/pay-slip.component';
import { EPFRegisterReportComponent } from './pages/REPORT/epf-register-report/epf-register-report.component';
import { WageRegisterComponent } from './pages/REPORT/wage-register/wage-register.component';
import { ESIComponent } from './pages/REPORT/esi/esi.component';
import { TransferInInventoryComponent } from './pages/INVENTORY MANAGEMENT/transfer-in-inventory/transfer-in-inventory.component';
import { AttendanceSheetComponent } from './pages/REPORT/attendance-sheet/attendance-sheet.component';
import { ItemQuantityStockComponent } from './components/HR/Masters/item-quantity-stock/item-quantity-stock.component';
import { ItemStockValueComponent } from './components/HR/Masters/item-stock-value/item-stock-value.component';
import { ItemCategoryListComponent } from './pages/MASTER/item-category-list/item-category-list.component';
import { StockMovementReportComponent } from './pages/REPORT/stock-movement-report/stock-movement-report.component';
import { InvoiceDeliveryComponent } from './pages/invoice-delivery/invoice-delivery.component';
import { PhysicalInventoryComponent } from './pages/INVENTORY MANAGEMENT/physical-inventory/physical-inventory.component';
import { DeliveryReturnComponent } from './pages/delivery-return/delivery-return.component';
import { DeliveryAddressComponent } from './components/HR/Masters/delivery-address/delivery-address.component';
import { ChangePasswordComponent } from './components/library/PROFILEPAGE/change-password/change-password.component';
import { SecurityPolicyComponent } from './pages/MASTER/security-policy/security-policy.component';
import { BankReconciliationAddComponent } from './pages/bank-reconciliation-add/bank-reconciliation-add.component';
import { InvoicePdfViewComponent } from './pages/INVOICE/invoice-pdf-view/invoice-pdf-view.component';
import { MiscPaymentGstListComponent } from './components/HR/Masters/misc-payment-gst-list/misc-payment-gst-list.component';
import { PrepaymentGstListComponent } from './pages/PRE_PAYMENT (1)/PRE_PAYMENT/prepayment-gst-list/prepayment-gst-list.component';

import { SettingsListComponent } from './pages/SETTINGS/settings-list/settings-list.component';
import { GstReportComponent } from './pages/REPORT/gst-report/gst-report.component';
import { LedgerSettingsListComponent } from './pages/SETTINGS/ledger-settings-list/ledger-settings-list.component';
import { GstReportB2CLComponent } from './pages/REPORT/gst-report-b2-cl/gst-report-b2-cl.component';
import { GstReportCDNRComponent } from './pages/REPORT/gst-report-cdnr/gst-report-cdnr.component';
import { ArticleproductionJvListComponent } from './articleproduction-jv-list/articleproduction-jv-list.component';
import { StockViewComponent } from './pages/REPORT/stock-view/stock-view.component';
import { ImportChartOfAccountsComponent } from './pages/ACCOUNTS/import-chart-of-accounts/import-chart-of-accounts.component';
import { AdvanceComponent } from './pages/HR/Masters/advance/advance.component';
import { SubDepartmentComponent } from './pages/HR/Masters/sub-department/sub-department.component';
import { SalaryHeadListComponent } from './pages/HR/Masters/salary-head-list/salary-head-list.component';
import { TransferOutInventoryComponent } from './pages/INVENTORY MANAGEMENT/transfer-out-inventory/transfer-out-inventory.component';

import { VatClassFinanceComponent } from './pages/MASTER/vat-class-finance/vat-class-finance.component';
import { StockAdjustmentListComponent } from './pages/INVENTORY MANAGEMENT/stock-adjustment-list/stock-adjustment-list.component';
import { DepreciationReportComponent } from './pages/Depreciation/depreciation-report/depreciation-report.component';
import { FixedAssetRegisterComponent } from './pages/FIXED_ASSETS/fixed-asset-register/fixed-asset-register.component';
import { ChartOfAccountsFinanceComponent } from './pages/MASTER/Chart Of Accounts/chart-of-accounts-finance-lookup/chart-of-accounts-finance.component';
import { GrnComponent } from './pages/OPERATIONS/grn/grn/grn.component';
import { PurchaseOrderComponent } from './pages/OPERATIONS/purchase-order/purchase-order.component';
import { DeliveryNoteComponent } from './pages/OPERATIONS/delivery-note/delivery-note.component';
import { DeliveryNoteFinanceComponent } from './pages/OPERATIONS/delivery-note-finance/delivery-note-finance.component';
import { QuotationComponent } from './pages/OPERATIONS/quotation/quotation.component';
import { SalesOrderComponent } from './pages/OPERATIONS/sales-order/sales-order.component';
import { ItemStorePricesComponent } from './pages/OPERATIONS/item-store-prices/item-store-prices.component';
import { SalesOrderFinanceComponent } from './pages/OPERATIONS/sales-order-finance/sales-order-finance.component';
import { PurchaseReturnDebitComponent } from './pages/OPERATIONS/purchase-return-debit/purchase-return-debit.component';
import { ProductionJvListComponent } from './pages/OPERATIONS/production-jv-list/production-jv-list.component';
import { SaleReturnComponent } from './pages/OPERATIONS/sale-return/sale-return.component';
import { MiscellaneousInvoiceComponent } from './pages/OPERATIONS/miscellaneous-invoice/miscellaneous-invoice.component';
import { MiscellaneousPurchaseComponent } from './pages/OPERATIONS/miscellaneous-purchase/miscellaneous-purchase.component';
import { PDCReportComponent } from './components/HR/Masters/PDC/pdc-report/pdc-report.component';
import { PrepaymentPostingReportComponent } from './pages/PrePayment Posting/prepayment-posting-report/prepayment-posting-report.component';
import { SalaryWPSComponent } from './pages/salary-wps/salary-wps.component';
import { PaySettingsComponent } from './pages/HR/Masters/pay-settings/pay-settings.component';
import { DepartmentMeComponent } from './pages/MASTER/department-me/department-me.component';
import { ProfitAndLossBranchComponent } from './pages/REPORT/profit-and-loss-branch/profit-and-loss-branch.component';
import { CustomerFinListComponent } from './pages/MASTER/customer-fin-list/customer-fin-list.component';
import { MiscSalesInvoiceListComponent } from './pages/OPERATIONS/misc-sales-invoice-list/misc-sales-invoice-list.component';
import { PaymentTermsListComponent } from './pages/payment-terms-list/payment-terms-list.component';
import { DeliveryTermsListComponent } from './pages/delivery-terms-list/delivery-terms-list.component';
import { SupplierFinListComponent } from './components/HR/Masters/Supplier/supplier-fin-list/supplier-fin-list.component';
import { ImportItemsTemplateComponent } from './pages/MASTER/import-items-template/import-items-template.component';
import { PromotionLogComponent } from './pages/promotion-log/promotion-log.component';
import { PromotionComponent } from './pages/promotion/promotion.component';
import { PromotionSchemaLogComponent } from './pages/promotion-schema-log/promotion-schema-log.component';
import { LandedCostListComponent } from './pages/landed-cost-list/landed-cost-list.component';
import { TendersListComponent } from './pages/tenders-list/tenders-list.component';
import { CurrencyListComponent } from './pages/currency-list/currency-list.component';
import { ItemBrandListComponent } from './pages/item-brand-list/item-brand-list.component';
import { PromotionEditComponent } from './pages/promotion-edit/promotion-edit.component';
import { ItemStorePropertiesComponent } from './pages/item-store-properties/item-store-properties.component';
import { PromotionViewComponent } from './pages/promotion-view/promotion-view.component';
import { PromotionApproveComponent } from './pages/promotion-approve/promotion-approve.component';
import { ItemStorePropertiesLogComponent } from './pages/item-store-properties-log/item-store-properties-log.component';
import { ItemStorePropertiesEditComponent } from './pages/item-store-properties-edit/item-store-properties-edit.component';
import { StorewiseStockViewComponent } from './pages/REPORT/storewise-stock-view/storewise-stock-view.component';
import { SalesSummaryComponent } from './pages/REPORT/sales-summary/sales-summary.component';
import { SalesDetailComponent } from './pages/REPORT/sales-detail/sales-detail.component';
import { ConsignmentSummaryComponent } from './pages/REPORT/consignment-summary/consignment-summary.component';
import { ConsignmentReturnDetailComponent } from './pages/REPORT/consignment-return-detail/consignment-return-detail.component';
import { ItemwisesalesComponent } from './pages/REPORT/itemwisesales/itemwisesales.component';
import { ItemWiseSalesSummaryComponent } from './pages/REPORT/item-wise-sales-summary/item-wise-sales-summary.component';
import { DiscountWiseSalesComponent } from './pages/REPORT/discount-wise-sales/discount-wise-sales.component';
import { TenderComponent } from './pages/REPORT/tender/tender.component';
import { TenderSummaryComponent } from './pages/REPORT/tender-summary/tender-summary.component';
import { ZReportComponent } from './pages/REPORT/zreport/zreport.component';
import { ItemStorePriceApproveComponent } from './pages/item-store-price-approve/item-store-price-approve.component';
import { ImportArDataComponent } from './pages/ERP-INTEGRATION/import-ar-data/import-ar-data.component';
import { InvoiceRetailComponent } from './pages/OPERATIONS/invoice-retail/invoice-retail.component';
import { MiscPurchaseInvoiceComponent } from './pages/OPERATIONS/misc-purchase-invoice/misc-purchase-invoice.component';
import { MiscellaneousSalesInvoiceComponent } from './pages/OPERATIONS/miscellaneous-sales-invoice/miscellaneous-sales-invoice.component';
import { SalesInvoiceRetailComponent } from './pages/OPERATIONS/sales-invoice-retail/sales-invoice-retail.component';
import { ARImportedListComponent } from './pages/ERP-INTEGRATION/ar-imported-list/ar-imported-list.component';
import { ClinicianMasterComponent } from './pages/MASTER/clinician-master/clinician-master.component';
import { CPTMasterComponent } from './pages/MASTER/cpt-master/cpt-master.component';
import { DepartmentGroupComponent } from './pages/MASTER/department-group/department-group.component';
import { TrialBalanceFinDimensionComponent } from './pages/ERP-INTEGRATION/trial-balance-fin-dimension/trial-balance-fin-dimension.component';

import { DenialListComponent } from './pages/MASTER/denial-list/denial-list.component';
import { ProfitAndLossDimensionComponent } from './pages/ERP-INTEGRATION/profit-and-loss-dimension/profit-and-loss-dimension.component';
import { BalanceSheetDimensionComponent } from './pages/ERP-INTEGRATION/balance-sheet-dimension/balance-sheet-dimension.component';
import { ARReportPageComponent } from './pages/ERP-INTEGRATION/ar-report-page/ar-report-page.component';
import { InvoiceListComponent } from './pages/OPERATIONS/invoice-list/invoice-list.component';
import { CustomerReceiptsComponent } from './pages/OPERATIONS/customer-receipts/customer-receipts.component';
import { InvoiceTrOutComponent } from './pages/OPERATIONS/invoice-tr-out/invoice-tr-out.component';
import { PurchaseInvoiceListComponent } from './pages/OPERATIONS/purchase-invoice-list/purchase-invoice-list.component';
import { ARManualMatchingComponent } from './pages/ERP-INTEGRATION/ar-manual-matching/ar-manual-matching.component';
import { TrialBalanceDimensionAdvanceComponent } from './pages/REPORT/trial-balance-dimension-advance/trial-balance-dimension-advance.component';
import { LedgerStatementDimensionComponent } from './pages/REPORT/ledger-statement-dimension/ledger-statement-dimension.component';
import { BarcodePrintComponent } from './pages/barcode-print/barcode-print.component';
import { TrialBalanceBranchWiseComponent } from './pages/REPORT/trial-balance-branch-wise/trial-balance-branch-wise.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: 'misc-payment',
    component: MiscPaymentGstListComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'prepayment',
    component: PrepaymentGstListComponent,
    canActivate: [AuthGuardService],
  },

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
        path: 'invoice-pdf/:invoiceId',
        component: InvoicePdfViewComponent,
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
      {
        path: 'change-password',
        component: ChangePasswordComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'customer-list',
        component: CustomerListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'customer--fin-list',
        component: CustomerFinListComponent,
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
        path: 'chart-of-accounts-finance',
        component: ChartOfAccountsFinanceComponent,
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
        path: 'invoice-tr-out',
        component: InvoiceTrOutComponent,
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
        path: 'profit-loss-branch',
        component: ProfitAndLossBranchComponent,
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
        path: 'gst-report',
        component: GstReportComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'gst-report-b2cl',
        component: GstReportB2CLComponent,
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
        path: 'item-brand',
        component: ItemBrandListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'department',
        component: DepartmentComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'department-finance',
        component: DepartmentMeComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'item-department',
        component: DepartmentListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'sub-department',
        component: SubDepartmentComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'sub-category',
        component: SubcategoryListComponent,
        canActivate: [AuthGuardService],
      },
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
        path: 'vat-class-finance',
        component: VatClassFinanceComponent,
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
        path: 'uom',
        component: UomListComponent,
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
        path: 'delivery-note-finance',
        component: DeliveryNoteFinanceComponent,
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
        path: 'item-store-prices-verify',
        component: ItemStorePriceVerifyApproveComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'change-price-view',
        component: ItemStorePriceViewComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'physical-inventory',
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
        path: 'security-policy',
        component: SecurityPolicyComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'sales-order-finance',
        component: SalesOrderFinanceComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'reset-password-form',
        component: AppResetPasswordComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'bank-reconciliation',
        component: BankReconciliationAddComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'invoice-pdf',
        component: InvoicePdfViewComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'purchase-return-debit',
        component: PurchaseReturnDebitComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'state',
        component: StateListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'ledger-settings',
        component: LedgerSettingsListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'settings',
        component: SettingsListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'gst-report-cdnr',
        component: GstReportCDNRComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'production-jv-list',
        component: ProductionJvListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'article-production-jv-list',
        component: ArticleproductionJvListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'stock-view',
        component: StockViewComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'sale-return',
        component: SaleReturnComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'import-items',
        component: ImportItemsComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'import-template',
        component: ImportItemsTemplateComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'miscellaneous-invoice',
        component: MiscellaneousInvoiceComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'import-chart-of-accounts',
        component: ImportChartOfAccountsComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'misc-purchase',
        component: MiscellaneousPurchaseComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'end-of-service',
        component: EOSComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'staff-end-of-service',
        component: StaffEOSComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'employee-leave',
        component: EmployeeLeaveComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'leave-salary',
        component: LeaveSalaryComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'depreciation-report',
        component: DepreciationReportComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'fixed-asset-register',
        component: FixedAssetRegisterComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'pdc-report',
        component: PDCReportComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'prepayment-posting-report',
        component: PrepaymentPostingReportComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'pay-settings',
        component: PaySettingsComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'salary-wps',
        component: SalaryWPSComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'profit-loss-branch',
        component: ProfitAndLossBranchComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'misc-sales-invoice',
        component: MiscSalesInvoiceListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'payment-terms',
        component: PaymentTermsListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'delivery-terms',
        component: DeliveryTermsListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'supplier-me',
        component: SupplierFinListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'promotions',
        component: PromotionLogComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'promotion-add',
        component: PromotionComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'promotion-edit',
        component: PromotionEditComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'promotion-view',
        component: PromotionViewComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'promotion-verify',
        component: PromotionApproveComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'promotion-schema',
        component: PromotionSchemaLogComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'supplier-me',
        component: SupplierFinListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'currency',
        component: CurrencyListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'landed-costing',
        component: LandedCostListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'tenders',
        component: TendersListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'promotions',
        component: PromotionComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'item-change-property',
        component: ItemStorePropertiesLogComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'item-change-property-add',
        component: ItemStorePropertiesComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'invoice-retail',
        component: InvoiceRetailComponent,
      },
      {
        path: 'item-change-property-Edit',
        component: ItemStorePropertiesEditComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'misc-purchase-invoice',
        component: MiscPurchaseInvoiceComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'miscellaneous-sales-invoice',
        component: MiscellaneousSalesInvoiceComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'storewise-stock-view',
        component: StorewiseStockViewComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'sales-summary',
        component: SalesSummaryComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'sales-detail',
        component: SalesDetailComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'consignment-summary',
        component: ConsignmentSummaryComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'consignment-return-detail',
        component: ConsignmentReturnDetailComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'itemwise-sales',
        component: ItemwisesalesComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'itemWise-sales-summary',
        component: ItemWiseSalesSummaryComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'discountwise-sales',
        component: DiscountWiseSalesComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'tender',
        component: TenderComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'tender-summary',
        component: TenderSummaryComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'z-report',
        component: ZReportComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'sales-invoice-retail',
        component: SalesInvoiceRetailComponent,
        canActivate: [AuthGuardService],
      },

      {
        path: 'item-store-price-approve',
        component: ItemStorePriceApproveComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'import-ar',
        component: ImportArDataComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'ar-list',
        component: ARImportedListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'clinician',
        component: ClinicianMasterComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'cpt-master',
        component: CPTMasterComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'department-group',
        component: DepartmentGroupComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'trial-balance-fin-dimension',
        component: TrialBalanceFinDimensionComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'ar-report',
        component: ARReportPageComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'denial',
        component: DenialListComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'profitAndLoss-Dimension',
        component: ProfitAndLossDimensionComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'BalanceSheet-Dimension',
        component: BalanceSheetDimensionComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'ar-manual-matching',
        component: ARManualMatchingComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'TrialBalance-Dimension-advance',
        component: TrialBalanceDimensionAdvanceComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'ledger-statement-Dimension',
        component: LedgerStatementDimensionComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'barcode',
        component: BarcodePrintComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: 'trial-balance-branch',
        component: TrialBalanceBranchWiseComponent,
        canActivate: [AuthGuardService],
      },
      {
        path: '**',
        redirectTo: 'login',
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
export class AppRoutingModule { }
