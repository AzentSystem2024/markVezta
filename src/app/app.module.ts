import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTemplateModule } from 'devextreme-angular';
import { AppComponent } from './app.component';
import { SideNavOuterToolbarModule, SingleCardModule } from './layouts';
import {
  AppFooterModule,
  ResetPasswordFormModule,
  CreateAccountFormModule,
  ChangePasswordFormModule,
  LoginFormModule,
} from './components';
import {
  AuthService,
  ScreenService,
  AppInfoService,
  DataService,
} from './services';
import { UnauthenticatedContentModule } from './layouts/unauthenticated-content/unauthenticated-content';
import { AppRoutingModule } from './app-routing.module';
import { AnalyticsDashboardModule } from './pages/analytics-dashboard/analytics-dashboard.component';
import { ThemeService } from './services';
import { DxFormModule } from 'devextreme-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskListModule } from 'src/app/components/library/task-list-grid/task-list-grid.component';
import { DepartmentListModule } from './pages/MASTER/item-department-list/department-list.component';
import { DepartmentFormModule } from './components/library/department-form/department-form.component';
import { CountryListModule } from './pages/country-list/country-list.component';
import { CountryFormModule } from './components/library/country-form/country-form.component';
import { ItemBrandListModule } from './pages/item-brand-list/item-brand-list.component';
import { ItmBrandFormModule } from './components/library/itm-brand-form/itm-brand-form.component';
import { CurrencyListModule } from './pages/currency-list/currency-list.component';
import { CurrencyFormModule } from './components/library/currency-form/currency-form.component';
import { CategoryListModule } from './pages/MASTER/category-list/category-list.component';
import { CategoryFormModule } from './components/library/category-form/category-form.component';
import { VatClassListModule } from './pages/MASTER/vat-class-list/vat-class-list.component';
import { VatClassFormModule } from './components/library/vat-class-form/vat-class-form.component';
import { PaymentTermsListModule } from './pages/payment-terms-list/payment-terms-list.component';
import { PaymentTermsFormModule } from './components/library/payment-terms-form/payment-terms-form.component';
import { DeliveryTermsListModule } from './pages/delivery-terms-list/delivery-terms-list.component';
import { DeliveryTermsFormModule } from './components/library/delivery-terms-form/delivery-terms-form.component';
import { StoresFormModule } from './components/library/stores-form/stores-form.component';
import { SupplierListModule } from './pages/MASTER/supplier-list/supplier-list.component';
import { SupplierFormModule } from './components/library/supplier-form/supplier-form.component';
import { StateListModule } from './pages/MASTER/state-list/state-list.component';
import { StateFormModule } from './components/library/state-form/state-form.component';
import { ItemProperty1ListModule } from './pages/MASTER/item-property1-list/item-property1-list.component';
import { ItemProperty2ListModule } from './pages/MASTER/item-property2-list/item-property2-list.component';
import { ItemProperty1FormModule } from './components/library/item-property1-form/item-property1-form.component';
import { ItemProperty2FormModule } from './components/library/item-property2-form/item-property2-form.component';
import { SalesmanListModule } from './pages/salesman-list/salesman-list.component';
import { SalesmanFormModule } from './components/library/salesman-form/salesman-form.component';
import { LandedCostListModule } from './pages/landed-cost-list/landed-cost-list.component';
import { TendersListModule } from './pages/tenders-list/tenders-list.component';
import { TendersFormModule } from './components/library/tenders-form/tenders-form.component';
import { LandedCostFormModule } from './components/library/landed-cost-form/landed-cost-form.component';
import { ReasonsListModule } from './pages/MASTER/reasons-list/reasons-list.component';
import { ReasonsFormModule } from './components/library/reasons-form/reasons-form.component';
import { ItemsListModule } from './pages/MASTER/items-list/items-list.component';
import { ItemsFormModule } from './components/library/items-form/items-form.component';
import { SubCategoryListModule } from './pages/MASTER/subcategory-list/subcategory-list.component';
import { SubCategoryFormModule } from './components/library/subcategory-form/subcategory-form.component';
import { UomListModule } from './pages/MASTER/uom-list/uom-list.component';
import { UomAddFormModule } from './components/library/uom-add-form/uom-add-form.component';
import { PackingFormModule } from './components/library/packing-add-form/packing-add-form.component';
import { PackingListModule } from './pages/packing-list/packing-list.component';
import { ItemsEditFormModule } from './pages/items-edit-form/items-edit-form.component';
import { StoreItemsModule } from './pages/store-items/store-items.component';
import { StoreItemsListModule } from './pages/store-items-list/store-items-list.component';
import { ItemProperty3Module } from './pages/MASTER/item-property3/item-property3.component';
import { ItemProperty4ListModule } from './pages/MASTER/item-property4-list/item-property4-list.component';
import { ItemProperty5ListModule } from './pages/MASTER/item-property5-list/item-property5-list.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ImportItemsModule } from './pages/MASTER/import-items/import-items.component';
import { ImportItemsTemplateModule } from './pages/MASTER/import-items-template/import-items-template.component';
import { ImportItemTemplateFormModule } from './components/library/import-item-template-form/import-item-template-form.component';
import { ImportItemTemplateEditFormModule } from './components/library/import-item-template-edit-form/import-item-template-edit-form.component';
import { TooltipCellModule } from './components/utils/tooltip-cell/tooltip-cell.component';
import { ImportItemsDialogModule } from './components/library/import-items-dialog/import-items-dialog.component';
import { ViewImportedItemsModule } from './components/library/view-imported-items/view-imported-items.component';
import { StoreItemsAddFormModule } from './pages/store-items-add-form/store-items-add-form.component';
import { ItemStorePropertiesLogModule } from './pages/item-store-properties-log/item-store-properties-log.component';
import { ItemStorePropertiesEditModule } from './pages/item-store-properties-edit/item-store-properties-edit.component';
import { UserLevelsModule } from './pages/MASTER/user-levels/user-levels.component';
import { UserLevelsFormModule } from './components/library/user-levels-form/user-levels-form.component';
import { UserLevelsEditFormModule } from './components/library/user-levels-edit-form/user-levels-edit-form.component';
import { PurchaseOrderNewFormModule } from './pop-up/operations/purchase-order-new-form/purchase-order-new-form.component';
import { PurchaseOrderEditFormModule } from './pop-up/operations/purchase-order-edit-form/purchase-order-edit-form.component';
import { PurchaseOrderVerifyFormModule } from './pop-up/operations/purchase-order-verify-form/purchase-order-verify-form.component';
import { PurchaseOrderApproveFormModule } from './pop-up/operations/purchase-order-approve-form/purchase-order-approve-form.component';
import { PurchaseOrderViewFormModule } from './pop-up/operations/purchase-order-view-form/purchase-order-view-form.component';
import { DocumentTemplatesListModule } from './settings/document-templates/document-templates-list/document-templates-list.component';
import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './custome-reuse-strategy';
import { GrnModule } from './pages/OPERATIONS/grn/grn/grn.component';
import { GrnNewFormModule } from './pop-up/operations/grn-new-form/grn-new-form.component';
import { GrnEditFormModule } from './pop-up/operations/grn-edit-form/grn-edit-form.component';
import { GrnVerifyFormModule } from './pop-up/operations/grn-verify-form/grn-verify-form.component';
import { GrnApproveFormModule } from './pop-up/operations/grn-approve-form/grn-approve-form.component';
import { GrnViewFormModule } from './pop-up/operations/grn-view-form/grn-view-form.component';
import { PurchaseReturnNewFormModule } from './pop-up/operations/purchase-return-new-form/purchase-return-new-form.component';
import { PurchaseReturnEditFormModule } from './pop-up/operations/purchase-return-edit-form/purchase-return-edit-form.component';
import { PurchaseReturnVerifyFormModule } from './pop-up/operations/purchase-return-verify-form/purchase-return-verify-form.component';
import { PurchaseReturnViewFormModule } from './pop-up/operations/purchase-return-view-form/purchase-return-view-form.component';
import { TransferOutModule } from './pages/OPERATIONS/transfer-out/transfer-out.component';
import { TransferOutNewFormModule } from './pop-up/operations/transfer-out-new-form/transfer-out-new-form.component';
import { TransferOutEditFormModule } from './pop-up/operations/transfer-out-edit-form/transfer-out-edit-form.component';
import { TransferOutVerifyFormModule } from './pop-up/operations/transfer-out-verify-form/transfer-out-verify-form.component';
import { TransferOutApproveFormModule } from './pop-up/operations/transfer-out-approve-form/transfer-out-approve-form.component';
import { TransferOutViewFormModule } from './pop-up/operations/transfer-out-view-form/transfer-out-view-form.component';
import { TransferInModule } from './pages/OPERATIONS/transfer-in/transfer-in.component';
import { TransferInNewFormModule } from './pop-up/operations/transfer-in-new-form/transfer-in-new-form.component';
import { TransferInEditFormModule } from './pop-up/operations/transfer-in-edit-form/transfer-in-edit-form.component';
import { TransferInViewFormModule } from './pop-up/operations/transfer-in-view-form/transfer-in-view-form.component';
import { ItemStorePricesModule } from './pages/OPERATIONS/item-store-prices/item-store-prices.component';
import { ItemStorePricesEditModule } from './pages/item-store-prices-edit/item-store-prices-edit.component';
import { ItemStorePriceVerifyApproveModule } from './pages/item-store-price-verify-approve/item-store-price-verify-approve.component';
import { ItemStorePriceViewModule } from './pages/item-store-price-view/item-store-price-view.component';
import { ItemStorePriceApproveModule } from './pages/item-store-price-approve/item-store-price-approve.component';
import { PromotionSchemaLogModule } from './pages/promotion-schema-log/promotion-schema-log.component';
import { PromotionSchemaEditModule } from './pages/promotion-schema-edit/promotion-schema-edit.component';
import { PromotionModule } from './pages/promotion/promotion.component';
import { PromotionPopupModule } from './pages/promotion-popup/promotion-popup.component';
import { PromotionLogModule } from './pages/promotion-log/promotion-log.component';
import { PromotionEditModule } from './pages/promotion-edit/promotion-edit.component';
import { PromotionVerifyModule } from './pages/promotion-verify/promotion-verify.component';
import { PromotionApproveModule } from './pages/promotion-approve/promotion-approve.component';
import { PromotionViewModule } from './pages/promotion-view/promotion-view.component';
import { StockViewListModule } from './pages/OPERATIONS/stock-view-list/stock-view-list.component';
import { SupplierEditModule } from './pages/supplier-edit/supplier-edit.component';
import { LandedCostEditModule } from './pages/landed-cost-edit/landed-cost-edit.component';
import { InterStoreTransferListModule } from './pages/OPERATIONS/inter-store-transfer-list/inter-store-transfer-list.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';
import { DesignationModule } from './pages/HR/Masters/designation/designation.component';
import { EOSModule } from './pages/HR/Masters/eos/eos.component';
import { PaySettingsModule } from './pages/HR/Masters/pay-settings/pay-settings.component';
import { LeaveSalaryModule } from './pages/HR/Masters/leave-salary/leave-salary.component';
import { EmployeeLeaveModule } from './pages/HR/Masters/employee-leave/employee-leave.component';
import { EmployeeModule } from './pages/HR/Masters/employee/employee.component';
import { EmployeeAddFormModule } from './components/HR/Masters/employee-add-form/employee-add-form.component';
import { EmployeeEditFormFormModule } from './components/HR/Masters/employee-edit-form/employee-edit-form.component';
import { SalaryHeadsModule } from './components/HR/Masters/salary-heads/salary-heads.component';
import { AdvanceTypesModule } from './components/HR/Masters/advance-types/advance-types.component';
import { PayRevisionModule } from './components/HR/Masters/pay-revision/pay-revision.component';
import { PayRevisionEditModule } from './components/HR/Masters/pay-revision-edit/pay-revision-edit.component';
import { PayRevisionAddModule } from './components/HR/Masters/pay-revision-add/pay-revision-add.component';
import { PayRevisionVerifyModule } from './components/HR/Masters/pay-revision-verify/pay-revision-verify.component';
import { PayRevisionApproveModule } from './components/HR/Masters/pay-revision-approve/pay-revision-approve.component';
import { PayRevisionViewModule } from './components/HR/Masters/pay-revision-view/pay-revision-view.component';
import { TimesheetListModule } from './pages/HR/Masters/timesheet-list/timesheet-list.component';
import { TimesheetAddModule } from './components/HR/Masters/timesheet-add/timesheet-add.component';
import { TimesheetEditModule } from './components/HR/Masters/timesheet-edit/timesheet-edit.component';
import { StaffEOSModule } from './components/HR/Masters/staff-eos/staff-eos.component';
import { TimesheetVerifyModule } from './components/HR/Masters/timesheet-verify/timesheet-verify.component';
import { TimesheetApproveModule } from './components/HR/Masters/timesheet-approve/timesheet-approve.component';
import { TimesheetViewModule } from './components/HR/Masters/timesheet-view/timesheet-view.component';
import { MiscellaneousPaymentsModule } from './pages/ACCOUNTS/list-miscellaneous-payments/list-miscellaneous-payments.component';
import { AddMiscellaneousPaymentModule } from './components/HR/Masters/add-miscellaneous-payment/add-miscellaneous-payment.component';
import { EditMiscellaneousPaymentModule } from './components/HR/Masters/edit-miscellaneous-payment/edit-miscellaneous-payment.component';
import { VerifyMiscellaneousPaymentModule } from './components/HR/Masters/verify-miscellaneous-payment/verify-miscellaneous-payment.component';
import { ApproveMiscellaneousPaymentModule } from './components/HR/Masters/approve-miscellaneous-payment/approve-miscellaneous-payment.component';
import { ViewMiscellaneousPaymentModule } from './components/HR/Masters/view-miscellaneous-payment/view-miscellaneous-payment.component';
import { PayrollListModule } from './pages/HR/Masters/payroll-list/payroll-list.component';
import { PayrollAddModule } from './components/HR/Masters/payroll-add/payroll-add.component';
import { PayrollVerifyModule } from './components/HR/Masters/payroll-verify/payroll-verify.component';
import { PayrollApproveModule } from './components/HR/Masters/payroll-approve/payroll-approve.component';
import { PayrollViewModule } from './components/HR/Masters/payroll-view/payroll-view.component';
import { AddAccountModule } from './pages/ACCOUNTS/add-account/add-account.component';
import { EditAccountModule } from './pages/ACCOUNTS/edit-account/edit-account.component';
import { ArticleListModule } from './pages/MASTER/article-list/article-list.component';
import { ArticleAddModule } from './pages/ARTICLE/article-add/article-add.component';
import { ArticleBrandModule } from './pages/MASTER/article-brand/article-brand.component';
import { ArticleColorModule } from './pages/MASTER/article-color/article-color.component';
import { ArticleTypeModule } from './pages/MASTER/article-type/article-type.component';
import { DealerModule } from './pages/ARTICLE/dealer/dealer.component';
import { CompanyMasterModule } from './pages/MASTER/company-master/company-master.component';
import { ArticleEditModule } from './pages/ARTICLE/article-edit/article-edit.component';
import { CategoryModule } from './pages/ARTICLE/category/category/category.component';
import { PackingModule } from './pages/MASTER/packing/packing.component';
import { PackingAddModule } from './pages/ARTICLE/packing-add/packing-add.component';
import { ArticleProductionViewModule } from './components/HR/Masters/article-production-view/article-production-view.component';
import { PackProductionViewModule } from './pages/ARTICLE/pack-production-view/pack-production-view.component';
import { StockMovementViewModule } from './pages/ARTICLE/stock-movement-view/stock-movement-view.component';
import { PackingEditModule } from './pages/ARTICLE/packing-edit/packing-edit.component';
import { ArticleStockViewModule } from './pages/ARTICLE/article-stock-view/article-stock-view.component';
import { CartonStockViewModule } from './pages/ARTICLE/carton-stock-view/carton-stock-view.component';
import { TransferInViewModule } from './pages/ARTICLE/transfer-in-view/transfer-in-view.component';
import { UserRoleModule } from './pages/MASTER/user-role/user-role.component';
import { UserLevelNewFormModule } from './pages/HR/Masters/user-level-new-form/user-level-new-form.component';
import { UserLevelEditFormModule } from './pages/HR/Masters/user-level-edit-form/user-level-edit-form.component';
import { UserModule } from './pages/HR/Masters/user/user.component';
import { UserNewFormModule } from './pages/HR/Masters/user-new-form/user-new-form.component';
import { UserEditFormModule } from './pages/HR/Masters/user-edit-form/user-edit-form.component';
import { JournalVoucherModule } from './pages/ACCOUNTS/journal-voucher-list/journal-voucher-list.component';
import { AddJournalVoucharModule } from './pages/JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from './pages/JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from './pages/JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { CreditNoteListModule } from './pages/ACCOUNTS/credit-note-list/credit-note-list.component';
import { LedgerStatementModule } from './pages/REPORT/ledger-statement/ledger-statement.component';
import { EditCreditNoteModule } from './pages/CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
import { DebitModule } from './pages/ACCOUNTS/debit/debit.component';
import { AddDebitModule } from './pages/DEBIT/add-debit/add-debit.component';
import { EditDebitModule } from './pages/DEBIT/edit-debit/edit-debit.component';
import { ViewDebitModule } from './pages/DEBIT/view-debit/view-debit.component';
import { InvoiceListModule } from './pages/OPERATIONS/invoice-list/invoice-list.component';
import { AddInvoiceModule } from './pages/INVOICE/add-invoice/add-invoice.component';
import { EditInvoiceModule } from './pages/INVOICE/edit-invoice/edit-invoice.component';
import { ViewInvoiceModule } from './pages/INVOICE/view-invoice/view-invoice.component';
import { CustomerReceiptsModule } from './pages/OPERATIONS/customer-receipts/customer-receipts.component';
import { AddCutomerReceiptModule } from './pages/CUSTOMER-RECEIPTS/add-cutomer-receipt/add-cutomer-receipt.component';
import { EditCustomerReceiptModule } from './pages/CUSTOMER-RECEIPTS/edit-customer-receipt/edit-customer-receipt.component';
import { ViewCustomerReceiptModule } from './pages/CUSTOMER-RECEIPTS/view-customer-receipt/view-customer-receipt.component';
import { TrialBalanceReportModule } from './pages/REPORT/trial-balance-report/trial-balance-report.component';
import { JournalBookModule } from './pages/ACCOUNTS/journal-book/journal-book.component';
import { PayrollEditModule } from './components/HR/Masters/payroll-edit/payroll-edit.component';
import { SalaryHeadAddModule } from './components/HR/Masters/Salary Head/salary-head-add/salary-head-add.component';
import { SalaryHeadEditModule } from './components/HR/Masters/Salary Head/salary-head-edit/salary-head-edit.component';
import { CustomerEditFormModule } from './components/HR/Masters/Customer/customer-edit-form/customer-edit-form.component';
import { CustomerListModule } from './pages/MASTER/customer-list/customer-list.component';
import { CustomerFormModule } from './components/HR/Masters/Customer/customer-form/customer-form.component';
import { FixedAsstesListModule } from './pages/ACCOUNTS/fixed-asstes-list/fixed-asstes-list.component';
import { FixedAsstesAddModule } from './pages/FIXED_ASSETS/fixed-asstes-add/fixed-asstes-add.component';
import { FixedAsstesEditModule } from './pages/FIXED_ASSETS/fixed-asstes-edit/fixed-asstes-edit.component';
import { DepreciationListModule } from './pages/ACCOUNTS/depreciation-list/depreciation-list.component';
import { DepreciationAddModule } from './pages/Depreciation/depreciation-add/depreciation-add.component';
import { DepreciationEditModule } from './pages/Depreciation/depreciation-edit/depreciation-edit.component';
import { SupplierPaymentListModule } from './pages/ACCOUNTS/supplier-payment-list/supplier-payment-list.component';
import { OpeningBalanceModule } from './pages/ACCOUNTS/opening-balance/opening-balance.component';
import { AddSupplierPaymentModule } from './pages/SUPPLIER-PAYMENT/add-supplier-payment/add-supplier-payment.component';
import { PurchaseInvoiceListModule } from './pages/OPERATIONS/purchase-invoice-list/purchase-invoice-list.component';
import { AddPurchaseInvoiceModule } from './pages/PURCHASE INVOICE/add-purchase-invoice/add-purchase-invoice.component';
import { EditPurchaseInvoiceModule } from './pages/PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';
import { EditSupplierPaymentModule } from './pages/SUPPLIER-PAYMENT/edit-supplier-payment/edit-supplier-payment.component';
import { ListMiscReceiptModule } from './pages/ACCOUNTS/list-misc-receipt/list-misc-receipt.component';
import { AddMiscReceiptModule } from './components/HR/Masters/MISC-RECEIPT/add-misc-receipt/add-misc-receipt.component';
import { AddSalaryPaymentModule } from './components/HR/Masters/SALARY-PAYMENT/add-salary-payment/add-salary-payment.component';
import { ListSalaryPaymentModule } from './pages/HR/Masters/list-salary-payment/list-salary-payment.component';
import { BoxProductionViewModule } from './components/HR/Masters/box-production-view/box-production-view.component';
import { PaytimeEntryModule } from './pages/HR/Masters/paytime-entry/paytime-entry.component';
import { PdcAddFormModule } from './components/HR/Masters/PDC/pdc-add-form/pdc-add-form.component';
import { PdcEditFormModule } from './components/HR/Masters/PDC/pdc-edit-form/pdc-edit-form.component';
import { PdcListModule } from './pages/ACCOUNTS/pdc-list/pdc-list.component';
import { EmployeeSalarySettingsAddModule } from './components/HR/Masters/employee-salary-settings-add/employee-salary-settings-add.component';
import { EmployeeSalarySettingsEditModule } from './components/HR/Masters/employee-salary-settings-edit/employee-salary-settings-edit.component';
import { EmployeeSalarySettingsModule } from './pages/HR/Masters/employee-salary-settings/employee-salary-settings.component';
import { PrePaymentEditModule } from './pages/PRE_PAYMENT (1)/PRE_PAYMENT/pre-payment-edit/pre-payment-edit.component';
import { CashBookModule } from './pages/REPORT/cash-book/cash-book.component';
import { BalanceSheetModule } from './pages/REPORT/balance-sheet/balance-sheet.component';
import { PrePaymentAddModule } from './pages/PRE_PAYMENT (1)/PRE_PAYMENT/pre-payment-add/pre-payment-add.component';
import { PrePaymentListModule } from './pages/ACCOUNTS/pre-payment-list/pre-payment-list.component';
import { ProfitAndLossModule } from './pages/REPORT/profit-and-loss/profit-and-loss.component';
import { SupplierReportModule } from './pages/SUPPLIERREPORT/supplier-report/supplier-report.component';
import { CustomerReportModule } from './pages/customer-report/customer-report/customer-report.component';
import { AgedPayablesModule } from './pages/REPORT/aged-payables/aged-payables.component';
import { AgedReceivablesModule } from './pages/Aged Receivables/aged-receivables/aged-receivables.component';
import { SupplierStatementDetailsModule } from './pages/REPORT/supplier-statement-details/supplier-statement-details.component';
import { CustomerStatementDetailsModule } from './pages/REPORT/customer-statement-details/customer-statement-details.component';
import { AgedReceivableDetailsModule } from './pages/REPORT/aged-receivable-details/aged-receivable-details.component';
import { AgedPayableDetailsModule } from './pages/aged-payable-details/aged-payable-details.component';
import { ViewSalaryAdvanceModule } from './components/HR/Masters/view-salary-advance/view-salary-advance.component';
import { InputVatModule } from './pages/input-vat/input-vat.component';
import { OutputVatModule } from './pages/OutPutVat/output-vat/output-vat.component';
import { VatReturnModule } from './pages/Vat Return/vat-return/vat-return.component';
import { PurchaseOrderModule } from './pages/OPERATIONS/purchase-order/purchase-order.component';
import { PrepaymentPostingListModule } from './pages/ACCOUNTS/prepayment-posting-list/prepayment-posting-list.component';
import { PrepaymentPostingAddModule } from './pages/PrePayment Posting/prepayment-posting-add/prepayment-posting-add.component';
import { PrepaymentPostingEditModule } from './pages/PrePayment Posting/prepayment-posting-edit/prepayment-posting-edit.component';
import { DepartmentEditModule } from './pages/department-edit/department-edit.component';
import { VatClassEditModule } from './pages/vat-class-edit/vat-class-edit.component';
import { SubcategoryEditModule } from './pages/subcategory-edit/subcategory-edit.component';
import { ItemcategoryEditModule } from './pages/itemcategory-edit/itemcategory-edit.component';
import { ItemProperty1EditModule } from './components/library/item-property1-edit/item-property1-edit.component';
import { ItemProperty2EditModule } from './components/library/item-property2-edit/item-property2-edit.component';
import { ItemProperty3EditModule } from './components/library/item-property3-edit/item-property3-edit.component';
import { ItemProperty4EditModule } from './components/library/item-property4-edit/item-property4-edit.component';
import { ItemProperty5EditModule } from './components/library/item-property5-edit/item-property5-edit.component';
import { PaySlipModule } from './pages/REPORT/pay-slip/pay-slip.component';
import { TransferOutInventoryAddModule } from './pages/transfer-out-inventory-add/transfer-out-inventory-add.component';
import { TransferInInventoryModule } from './pages/INVENTORY MANAGEMENT/transfer-in-inventory/transfer-in-inventory.component';
import { TransferInInventoryFormModule } from './pages/transfer-in-inventory-form/transfer-in-inventory-form.component';
import { ReasonEditModule } from './components/library/reason-edit/reason-edit/reason-edit.component';
import { EPFRegisterReportModule } from './pages/REPORT/epf-register-report/epf-register-report.component';
import { WageRegisterModule } from './pages/REPORT/wage-register/wage-register.component';
import { ESIModule } from './pages/REPORT/esi/esi.component';
import { AttendanceSheetModule } from './pages/REPORT/attendance-sheet/attendance-sheet.component';
import { ItemQuantityStockModule } from './components/HR/Masters/item-quantity-stock/item-quantity-stock.component';
import { ItemStockValueModule } from './components/HR/Masters/item-stock-value/item-stock-value.component';
import { DeliveryNoteModule } from './pages/OPERATIONS/delivery-note/delivery-note.component';
import { QuotationModule } from './pages/OPERATIONS/quotation/quotation.component';
import { QuotationFormModule } from './pages/quotation-form/quotation-form.component';
import { StockMovementReportModule } from './pages/REPORT/stock-movement-report/stock-movement-report.component';
import { SalesOrderFormModule } from './pages/sales-order-form/sales-order-form.component';
import { InvoiceDeliveryModule } from './pages/invoice-delivery/invoice-delivery.component';
import { InvoiceDeliveryFormModule } from './pages/invoice-delivery-form/invoice-delivery-form.component';
import { PhysicalInventoryModule } from './pages/INVENTORY MANAGEMENT/physical-inventory/physical-inventory.component';
import { PhysicalInventoryFormModule } from './pages/INVENTORY MANAGEMENT/POPUP PAGES/physical-inventory-form/physical-inventory-form.component';
import { DeliveryReturnModule } from './pages/delivery-return/delivery-return.component';
import { DeliveryReturnAddModule } from './pages/delivery-return-add/delivery-return-add.component';
import { DeliveryReturnEditModule } from './pages/delivery-return-edit/delivery-return-edit.component';
import { DeliveryAddressModule } from './components/HR/Masters/delivery-address/delivery-address.component';
import { ChangePasswordModule } from './components/library/PROFILEPAGE/change-password/change-password.component';
import { SecurityPolicyModule } from './pages/MASTER/security-policy/security-policy.component';
import { ResetPasswordModule } from './pages/reset-password/reset-password.component';
import { BankReconciliationAddModule } from './pages/bank-reconciliation-add/bank-reconciliation-add.component';
import { PurchaseReturnDebitFormModule } from './pages/purchase-return-debit-form/purchase-return-debit-form.component';
import { MiscPaymentGstListModule } from './components/HR/Masters/misc-payment-gst-list/misc-payment-gst-list.component';
import { MiscPaymentGstAddModule } from './components/HR/Masters/misc-payment-gst-add/misc-payment-gst-add.component';
import { MiscPaymentGstEditModule } from './components/HR/Masters/misc-payment-gst-edit/misc-payment-gst-edit.component';
import { PrePaymentGstListModule } from './pages/PRE_PAYMENT (1)/PRE_PAYMENT/prepayment-gst-list/prepayment-gst-list.component';
import { PrePaymentGstAddModule } from './pages/PRE_PAYMENT (1)/PRE_PAYMENT/prepayment-gst-add/prepayment-gst-add.component';
import { PrePaymentGstEditModule } from './pages/PRE_PAYMENT (1)/PRE_PAYMENT/prepayment-gst-edit/prepayment-gst-edit.component';
import { InvoiceTrOutModule } from './pages/OPERATIONS/invoice-tr-out/invoice-tr-out.component';
import { InvoiceTrOutAddModule } from './pages/INVOICE/invoice-tr-out-add/invoice-tr-out-add.component';
import { EditInvoiceTrOutModule } from './pages/INVOICE/edit-invoice-tr-out/edit-invoice-tr-out.component';
import { ViewInvoiceTrOutModule } from './pages/INVOICE/view-invoice-tr-out/view-invoice-tr-out.component';
import { StateEditModule } from './state-edit/state-edit.component';
import { SettingsListModule } from './pages/SETTINGS/settings-list/settings-list.component';
import { LedgerSettingsListModule } from './pages/SETTINGS/ledger-settings-list/ledger-settings-list.component';
import { GstReportModule } from './pages/REPORT/gst-report/gst-report.component';
import { GstReportB2CLModule } from './pages/REPORT/gst-report-b2-cl/gst-report-b2-cl.component';
import { GstReportCDNRModule } from './pages/REPORT/gst-report-cdnr/gst-report-cdnr.component';
import { UomEditModule } from './pages/uom-edit/uom-edit.component';
import { ProductionJvAddModule } from './production-jv-add/production-jv-add.component';
import { ProductionJvViewModule } from './production-jv-view/production-jv-view.component';
import { BoxproductionJvAddModule } from './boxproduction-jv-add/boxproduction-jv-add.component';
import { ArticleproductionJvListModule } from './articleproduction-jv-list/articleproduction-jv-list.component';
import { ArticleproductionJvViewModule } from './articleproduction-jv-view/articleproduction-jv-view.component';
import { BoxproductionJvViewModule } from './boxproduction-jv-view/boxproduction-jv-view.component';
import { StockViewModule } from './pages/REPORT/stock-view/stock-view.component';
import { SaleReturnFormModule } from './sale-return-form/sale-return-form.component';
import { CustomDatePopupModule } from './custom-date-popup/custom-date-popup.component';
import { MiscellaneousInvoiceAddModule } from './pages/miscellaneous-invoice-add/miscellaneous-invoice-add.component';
import { MiscellaneousInvoiceEditModule } from './pages/miscellaneous-invoice-edit/miscellaneous-invoice-edit.component';
import { MiscellaneousPurchaseModule } from './pages/OPERATIONS/miscellaneous-purchase/miscellaneous-purchase.component';
import { MiscellaneousPurchaseAddModule } from './pages/miscellaneous-purchase-add/miscellaneous-purchase-add.component';
import { MiscellaneousPurchaseEditModule } from './pages/miscellaneous-purchase-edit/miscellaneous-purchase-edit.component';
import { ImportChartOfAccountsModule } from './pages/ACCOUNTS/import-chart-of-accounts/import-chart-of-accounts.component';
import { SalaryHeadListModule } from './pages/HR/Masters/salary-head-list/salary-head-list.component';
import { TransferOutInventoryModule } from './pages/INVENTORY MANAGEMENT/transfer-out-inventory/transfer-out-inventory.component';
import { ItemStorePricesLogModule } from './pages/item-store-prices-log/item-store-prices-log.component';
import { PurchaseReturnDebitModule } from './pages/OPERATIONS/purchase-return-debit/purchase-return-debit.component';
import { ProductionJvListModule } from './pages/OPERATIONS/production-jv-list/production-jv-list.component';
import { SaleReturnModule } from './pages/OPERATIONS/sale-return/sale-return.component';
import { MiscellaneousInvoiceModule } from './pages/OPERATIONS/miscellaneous-invoice/miscellaneous-invoice.component';
import { SalesOrderModule } from './pages/OPERATIONS/sales-order/sales-order.component';
import { FixedAssetRegisterModule } from './pages/FIXED_ASSETS/fixed-asset-register/fixed-asset-register.component';
import { DepreciationReportModule } from './pages/Depreciation/depreciation-report/depreciation-report.component';
import { PDCReportModule } from './components/HR/Masters/PDC/pdc-report/pdc-report.component';
import { SalaryWPSModule } from './pages/salary-wps/salary-wps.component';
import { SalesOrderFinancePopupFormModule } from './pages/OPERATIONS/sales-order-finance-popup-form/sales-order-finance-popup-form.component';
import { PrepaymentPostingReportModule } from './pages/PrePayment Posting/prepayment-posting-report/prepayment-posting-report.component';
import { ProfitAndLossBranchModule } from './pages/REPORT/profit-and-loss-branch/profit-and-loss-branch.component';
import { StoresListModule } from './pages/MASTER/stores-list/stores-list.component';
import { SupplierFinListModule } from './components/HR/Masters/Supplier/supplier-fin-list/supplier-fin-list.component';
import { SupplierFinFormModule } from './components/HR/Masters/Supplier/supplier-fin-form/supplier-fin-form.component';
import { SupplierFinEditModule } from './components/HR/Masters/Supplier/supplier-fin-edit/supplier-fin-edit.component';
import { PayrollViewReportModule } from './components/HR/Masters/payroll-view-report/payroll-view-report.component';
import { InvoiceRetailModule } from './pages/OPERATIONS/invoice-retail/invoice-retail.component';
import { AddInvoiceRetailModule } from './pages/INVOICE/add-invoice-retail/add-invoice-retail.component';
import { EditItemStorePropertyModule } from './pop-up/operations/edit-item-store-property/edit-item-store-property.component';
import { MiscPurchaseInvoiceModule } from './pages/OPERATIONS/misc-purchase-invoice/misc-purchase-invoice.component';
import { MiscPurchInvoiceFormModule } from './pages/OPERATIONS/misc-purch-invoice-form/misc-purch-invoice-form.component';
import { EditPromotionModule } from './pages/edit-promotion/edit-promotion.component';
import { MiscellaneousSalesInvoiceModule } from './pages/OPERATIONS/miscellaneous-sales-invoice/miscellaneous-sales-invoice.component';
import { MiscellaneousSalesInvoiceFormModule } from './pages/OPERATIONS/miscellaneous-sales-invoice-form/miscellaneous-sales-invoice-form.component';
import { StorewiseStockViewModule } from './pages/REPORT/storewise-stock-view/storewise-stock-view.component';
import { SalesSummaryModule } from './pages/REPORT/sales-summary/sales-summary.component';
import { SalesDetailModule } from './pages/REPORT/sales-detail/sales-detail.component';
import { ConsignmentSummaryModule } from './pages/REPORT/consignment-summary/consignment-summary.component';
import { ConsignmentReturnDetailModule } from './pages/REPORT/consignment-return-detail/consignment-return-detail.component';
import { ItemwisesalesModule } from './pages/REPORT/itemwisesales/itemwisesales.component';
import { ItemWiseSalesSummaryModule } from './pages/REPORT/item-wise-sales-summary/item-wise-sales-summary.component';
import { DiscountWiseSalesModule } from './pages/REPORT/discount-wise-sales/discount-wise-sales.component';
import { ViewPromotionWizardModule } from './pages/view-promotion-wizard/view-promotion-wizard.component';
import { TenderModule } from './pages/REPORT/tender/tender.component';
import { TenderSummaryModule } from './pages/REPORT/tender-summary/tender-summary.component';
import { ZReportModule } from './pages/REPORT/zreport/zreport.component';
import { SalesInvoiceRetailModule } from './pages/OPERATIONS/sales-invoice-retail/sales-invoice-retail.component';
import { AddSalesInvoiceRetailModule } from './pages/OPERATIONS/add-sales-invoice-retail/add-sales-invoice-retail.component';
import { ClinicianMasterModule } from './pages/MASTER/clinician-master/clinician-master.component';
import { ClinicianEditFormModule } from './pages/MASTER/POPUP PAGES/clinician-edit-form/clinician-edit-form.component';
import { ClinicianNewFormModule } from './pages/MASTER/POPUP PAGES/clinician-new-form/clinician-new-form.component';
import { CptMasterNewFormModule } from './pages/MASTER/POPUP PAGES/cpt-master-new-form/cpt-master-new-form.component';
import { CptMasterEditFormModule } from './pages/MASTER/POPUP PAGES/cpt-master-edit-form/cpt-master-edit-form.component';
import { CPTMasterModule } from './pages/MASTER/cpt-master/cpt-master.component';
import { DepartmentGroupModule } from './pages/MASTER/department-group/department-group.component';
import { TrialBalanceFinDimensionModule } from './pages/ERP-INTEGRATION/trial-balance-fin-dimension/trial-balance-fin-dimension.component';
import { ERPJVModule } from './pages/ERP-INTEGRATION/POPUP-PAGES/erp-jv/erp-jv.component';
import { DenialListModule } from './pages/MASTER/denial-list/denial-list.component';
import { DenialNewFormModule } from './pages/MASTER/POPUP PAGES/denial-new-form/denial-new-form.component';
import { ProfitAndLossDimensionModule } from './pages/ERP-INTEGRATION/profit-and-loss-dimension/profit-and-loss-dimension.component';
import { BalanceSheetDimensionModule } from './pages/ERP-INTEGRATION/balance-sheet-dimension/balance-sheet-dimension.component';
import { ARReportPageModule } from './pages/ERP-INTEGRATION/ar-report-page/ar-report-page.component';
import {
  ARManualMatchingComponent,
  ARManualMatchingModule,
} from './pages/ERP-INTEGRATION/ar-manual-matching/ar-manual-matching.component';
import { LedgerStatementDimensionModule } from './pages/REPORT/ledger-statement-dimension/ledger-statement-dimension.component';
import { TrialBalanceDimensionAdvanceModule } from './pages/REPORT/trial-balance-dimension-advance/trial-balance-dimension-advance.component';
import {
  BarcodePrintComponent,
  BarcodePrintModule,
} from './pages/barcode-print/barcode-print.component';
import { TrialBalanceBranchWiseModule } from './pages/REPORT/trial-balance-branch-wise/trial-balance-branch-wise.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    DxTemplateModule,
    TaskListModule,
    BrowserModule,
    SideNavOuterToolbarModule,
    SingleCardModule,
    AppFooterModule,
    ResetPasswordFormModule,
    ResetPasswordModule,
    CreateAccountFormModule,
    ChangePasswordFormModule,
    LoginFormModule,
    UnauthenticatedContentModule,
    DxSelectBoxModule,
    DenialListModule,
    AnalyticsDashboardModule,
    DxFormModule,
    ReactiveFormsModule,
    AppRoutingModule,
    DepartmentListModule,
    DepartmentFormModule,
    CountryListModule,
    CountryFormModule,
    ItemBrandListModule,
    ItmBrandFormModule,
    CurrencyListModule,
    CurrencyFormModule,
    CustomerListModule,
    CategoryListModule,
    CategoryFormModule,
    SubCategoryFormModule,
    VatClassListModule,
    VatClassFormModule,
    PaymentTermsListModule,
    PaymentTermsFormModule,
    DeliveryTermsListModule,
    DeliveryTermsFormModule,
    StoresListModule,
    StoresFormModule,
    SupplierListModule,
    SupplierFormModule,
    StateListModule,
    StateFormModule,
    ItemProperty1ListModule,
    ItemProperty2ListModule,
    ItemProperty1FormModule,
    ItemProperty2FormModule,
    SalesmanListModule,
    SalesmanFormModule,
    CustomerFormModule,
    CustomerEditFormModule,
    LandedCostListModule,
    LandedCostFormModule,
    TendersListModule,
    TendersFormModule,
    ReasonsListModule,
    ReasonsFormModule,
    ItemsListModule,
    ItemsFormModule,
    UomListModule,
    UomAddFormModule,
    PackingFormModule,
    PackingListModule,
    ItemsEditFormModule,
    StoreItemsModule,
    StoreItemsListModule,
    ItemProperty3Module,
    ItemProperty4ListModule,
    ItemProperty5ListModule,
    ImportItemsModule,
    ImportItemsTemplateModule,
    ImportItemTemplateFormModule,
    ImportItemTemplateEditFormModule,
    TooltipCellModule,
    ImportItemsDialogModule,
    ViewImportedItemsModule,
    StoreItemsAddFormModule,
    ItemStorePropertiesLogModule,
    ItemStorePropertiesEditModule,
    UserLevelsModule,
    UserLevelsFormModule,
    UserLevelsEditFormModule,
    PurchaseOrderNewFormModule,
    PurchaseOrderEditFormModule,
    PurchaseOrderVerifyFormModule,
    PurchaseOrderApproveFormModule,
    PurchaseOrderViewFormModule,
    DocumentTemplatesListModule,
    GrnModule,
    GrnNewFormModule,
    GrnEditFormModule,
    GrnVerifyFormModule,
    GrnApproveFormModule,
    GrnViewFormModule,
    PurchaseReturnNewFormModule,
    PurchaseReturnEditFormModule,
    PurchaseReturnVerifyFormModule,
    PurchaseOrderApproveFormModule,
    PurchaseReturnViewFormModule,
    TransferOutModule,
    TransferOutNewFormModule,
    TransferOutEditFormModule,
    TransferOutVerifyFormModule,
    TransferOutApproveFormModule,
    TransferOutViewFormModule,
    TransferInModule,
    TransferInNewFormModule,
    TransferInNewFormModule,
    TransferInEditFormModule,
    StoreItemsAddFormModule,
    ItemStorePropertiesLogModule,
    ItemStorePropertiesEditModule,
    ItemStorePricesModule,
    ItemStorePricesLogModule,
    ItemStorePricesEditModule,
    ItemStorePriceVerifyApproveModule,
    ItemStorePriceViewModule,
    ItemStorePriceApproveModule,
    PromotionSchemaLogModule,
    PromotionSchemaEditModule,
    PromotionModule,
    PromotionPopupModule,
    PromotionLogModule,
    PromotionEditModule,
    PromotionVerifyModule,
    PromotionApproveModule,
    PromotionViewModule,
    StockViewListModule,
    SupplierEditModule,
    LandedCostEditModule,
    InterStoreTransferListModule,
    TransferInViewFormModule,
    DesignationModule,
    EOSModule,
    PaySettingsModule,
    LeaveSalaryModule,
    EmployeeLeaveModule,
    AdvanceTypesModule,
    EmployeeModule,
    EmployeeAddFormModule,
    EmployeeEditFormFormModule,
    ArticleColorModule,
    ArticleBrandModule,
    ArticleTypeModule,
    SalaryHeadsModule,
    AdvanceTypesModule,
    PayRevisionModule,
    PayRevisionEditModule,
    PayRevisionAddModule,
    PayRevisionVerifyModule,
    PayRevisionApproveModule,
    PayRevisionViewModule,
    TimesheetListModule,
    TimesheetAddModule,
    TimesheetEditModule,
    StaffEOSModule,
    TimesheetVerifyModule,
    TimesheetApproveModule,
    TimesheetViewModule,
    MiscellaneousPaymentsModule,
    AddMiscellaneousPaymentModule,
    EditMiscellaneousPaymentModule,
    VerifyMiscellaneousPaymentModule,
    ApproveMiscellaneousPaymentModule,
    ViewMiscellaneousPaymentModule,
    MiscPaymentGstListModule,
    MiscPaymentGstAddModule,
    MiscPaymentGstEditModule,
    PayrollListModule,
    PayrollAddModule,
    PayrollVerifyModule,
    PayrollApproveModule,
    PayrollViewModule,
    AddAccountModule,
    EditAccountModule,
    ArticleListModule,
    ArticleAddModule,

    DealerModule,
    CompanyMasterModule,
    ArticleProductionViewModule,
    PackProductionViewModule,
    StockMovementViewModule,
    TransferOutViewFormModule,
    StockViewListModule,
    CategoryModule,
    TrialBalanceReportModule,
    ArticleEditModule,
    PackingModule,
    PackingAddModule,
    PackingEditModule,
    ArticleStockViewModule,
    TransferInViewModule,

    CartonStockViewModule,
    UserRoleModule,
    UserLevelNewFormModule,
    UserLevelEditFormModule,
    UserModule,
    UserNewFormModule,
    UserEditFormModule,

    JournalVoucherModule,
    AddJournalVoucharModule,
    EditJournalVoucherModule,
    ViewJournalVoucherModule,
    CreditNoteListModule,
    EditCreditNoteModule,
    LedgerStatementModule,
    DebitModule,
    AddDebitModule,
    EditDebitModule,
    ViewDebitModule,
    InvoiceListModule,
    AddInvoiceModule,
    EditInvoiceModule,
    ViewInvoiceModule,
    CustomerReceiptsModule,
    AddCutomerReceiptModule,
    EditCustomerReceiptModule,
    ViewCustomerReceiptModule,
    JournalBookModule,
    PayrollEditModule,
    EmployeeSalarySettingsModule,
    EmployeeSalarySettingsEditModule,
    SalaryHeadListModule,
    SalaryHeadAddModule,
    SalaryHeadEditModule,
    FixedAsstesListModule,
    FixedAsstesEditModule,
    FixedAsstesAddModule,
    DepreciationAddModule,
    DepreciationListModule,
    DepreciationEditModule,

    EmployeeSalarySettingsAddModule,
    SupplierPaymentListModule,
    OpeningBalanceModule,
    PurchaseInvoiceListModule,
    AddPurchaseInvoiceModule,
    EditPurchaseInvoiceModule,
    AddSupplierPaymentModule,
    EditSupplierPaymentModule,
    EditMiscellaneousPaymentModule,
    ListMiscReceiptModule,
    AddMiscReceiptModule,
    ListSalaryPaymentModule,
    AddSalaryPaymentModule,
    ArticleProductionViewModule,
    BoxProductionViewModule,
    PaytimeEntryModule,
    PdcAddFormModule,
    PdcEditFormModule,
    PdcListModule,
    PrePaymentAddModule,
    PrePaymentListModule,
    PrePaymentEditModule,
    PrePaymentGstListModule,
    PrePaymentGstAddModule,
    PrePaymentGstEditModule,
    CashBookModule,
    ProfitAndLossModule,
    BalanceSheetModule,
    SupplierReportModule,
    CustomerReportModule,
    AgedReceivablesModule,
    AgedPayablesModule,
    SupplierStatementDetailsModule,
    CustomerStatementDetailsModule,
    AgedReceivableDetailsModule,
    AgedPayableDetailsModule,
    ViewSalaryAdvanceModule,
    InputVatModule,
    OutputVatModule,
    VatReturnModule,
    PurchaseOrderModule,
    PurchaseOrderEditFormModule,
    PrepaymentPostingListModule,
    PrepaymentPostingAddModule,
    PrepaymentPostingEditModule,
    ItemsListModule,
    SubCategoryListModule,
    DepartmentEditModule,
    DepartmentListModule,
    VatClassListModule,
    VatClassEditModule,
    CategoryListModule,
    SubcategoryEditModule,
    ItemcategoryEditModule,
    ItemProperty1EditModule,
    ItemProperty2EditModule,
    ItemProperty3EditModule,
    ItemProperty4EditModule,
    ItemProperty5EditModule,
    PaySlipModule,
    TransferOutInventoryModule,
    TransferOutInventoryAddModule,
    ReasonEditModule,
    EPFRegisterReportModule,
    WageRegisterModule,
    ESIModule,
    TransferInInventoryModule,
    TransferInInventoryFormModule,
    AttendanceSheetModule,
    ItemQuantityStockModule,
    ItemStockValueModule,
    DeliveryNoteModule,
    QuotationModule,
    QuotationFormModule,
    StockMovementReportModule,
    SalesOrderModule,
    SalesOrderFormModule,
    InvoiceDeliveryModule,
    InvoiceDeliveryFormModule,
    ItemStorePricesLogModule,
    ItemStorePricesModule,
    ItemStorePriceVerifyApproveModule,
    PhysicalInventoryModule,
    PhysicalInventoryFormModule,
    DeliveryReturnModule,
    DeliveryReturnAddModule,
    DeliveryReturnEditModule,
    DeliveryAddressModule,
    ChangePasswordModule,
    SecurityPolicyModule,
    BankReconciliationAddModule,
    PurchaseReturnDebitModule,
    PurchaseReturnDebitFormModule,
    InvoiceTrOutModule,
    InvoiceTrOutAddModule,
    EditInvoiceTrOutModule,
    ViewInvoiceTrOutModule,
    StateEditModule,
    SettingsListModule,
    GstReportModule,
    LedgerSettingsListModule,
    GstReportB2CLModule,
    UomEditModule,
    GstReportCDNRModule,
    ProductionJvListModule,
    ProductionJvAddModule,
    ProductionJvViewModule,
    BoxproductionJvAddModule,
    ArticleproductionJvListModule,
    ArticleproductionJvViewModule,
    BoxproductionJvViewModule,
    StockViewModule,
    SaleReturnModule,
    SaleReturnFormModule,
    CustomDatePopupModule,
    MiscellaneousInvoiceModule,
    MiscellaneousInvoiceAddModule,
    MiscellaneousInvoiceEditModule,
    MiscellaneousPurchaseModule,
    MiscellaneousPurchaseAddModule,
    MiscellaneousPurchaseEditModule,
    ImportChartOfAccountsModule,
    SalesOrderFinancePopupFormModule,
    FixedAssetRegisterModule,
    DepreciationReportModule,
    PDCReportModule,
    PrepaymentPostingReportModule,
    SalaryWPSModule,
    ProfitAndLossBranchModule,
    SupplierFinListModule,
    SupplierFinFormModule,
    SupplierFinEditModule,
    PayrollViewReportModule,
    InvoiceRetailModule,
    AddInvoiceRetailModule,
    EditItemStorePropertyModule,
    MiscPurchaseInvoiceModule,
    MiscPurchInvoiceFormModule,
    EditPromotionModule,
    MiscellaneousSalesInvoiceModule,
    MiscellaneousSalesInvoiceFormModule,
    StorewiseStockViewModule,
    ViewPromotionWizardModule,
    SalesSummaryModule,
    SalesDetailModule,
    ConsignmentSummaryModule,
    ConsignmentReturnDetailModule,
    ItemwisesalesModule,
    ItemWiseSalesSummaryModule,
    DiscountWiseSalesModule,
    ViewPromotionWizardModule,
    TenderModule,
    TenderSummaryModule,
    ZReportModule,
    SalesInvoiceRetailModule,
    AddSalesInvoiceRetailModule,
    ClinicianMasterModule,
    ClinicianEditFormModule,
    ClinicianNewFormModule,
    CPTMasterModule,
    CptMasterNewFormModule,
    CptMasterEditFormModule,
    DepartmentGroupModule,
    TrialBalanceFinDimensionModule,
    ERPJVModule,
    DenialListModule,
    DenialNewFormModule,
    ProfitAndLossDimensionModule,
    BalanceSheetDimensionModule,
    ARReportPageModule,
    ARManualMatchingModule,
    TrialBalanceDimensionAdvanceModule,
    LedgerStatementDimensionModule,
    BarcodePrintModule,
    TrialBalanceBranchWiseModule
  ],

  providers: [
    AuthService,
    ScreenService,
    AppInfoService,
    ThemeService,
    DataService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
