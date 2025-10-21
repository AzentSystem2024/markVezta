import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  DxDataGridComponent,
  DxDataGridModule,
  DxSelectBoxModule,
  DxTemplateModule,
} from 'devextreme-angular';
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
import { DenialListModule } from './pages/Denial-list/denial-list.component';
import { CrmContactDetailsModule } from './pages/crm-contact-details/crm-contact-details.component';
import { AnalyticsDashboardModule } from './pages/analytics-dashboard/analytics-dashboard.component';
import { ThemeService } from './services';
import { DxFormModule } from 'devextreme-angular';
import { ReactiveFormsModule } from '@angular/forms';
import { TaskListModule } from 'src/app/components/library/task-list-grid/task-list-grid.component';
import { DepartmentListModule } from './pages/department-list/department-list.component';
import { DepartmentFormModule } from './components/library/department-form/department-form.component';
import { CountryListModule } from './pages/country-list/country-list.component';
import { CountryFormModule } from './components/library/country-form/country-form.component';
import { ItemBrandListModule } from './pages/item-brand-list/item-brand-list.component';
import { ItmBrandFormModule } from './components/library/itm-brand-form/itm-brand-form.component';
import { CurrencyListModule } from './pages/currency-list/currency-list.component';
import { CurrencyFormModule } from './components/library/currency-form/currency-form.component';
// import { CustomerListModule } from './pages/customer-list/customer-list.component';
import { CategoryListModule } from './pages/category-list/category-list.component';
import { CategoryFormComponent } from './components/library/category-form/category-form.component';
import { CategoryFormModule } from './components/library/category-form/category-form.component';
// import { SubCategoryListComponent } from './pages/sub-category-list/sub-category-list.component';
// import { SubCategoryListModule } from './pages/sub-category-list/sub-category-list.component';
// import { SubCategoryFormModule } from './components/library/subcategory-form/subcategory-form.component';
import { VatClassListComponent } from './pages/vat-class-list/vat-class-list.component';
import { VatClassListModule } from './pages/vat-class-list/vat-class-list.component';
import { VatClassFormModule } from './components/library/vat-class-form/vat-class-form.component';
import { PaymentTermsListModule } from './pages/payment-terms-list/payment-terms-list.component';
import { PaymentTermsFormModule } from './components/library/payment-terms-form/payment-terms-form.component';
import { DeliveryTermsListModule } from './pages/delivery-terms-list/delivery-terms-list.component';
import { DeliveryTermsFormModule } from './components/library/delivery-terms-form/delivery-terms-form.component';
import { StoresListModule } from './pages/stores-list/stores-list.component';
import { StoresFormModule } from './components/library/stores-form/stores-form.component';
import { SupplierListModule } from './pages/supplier-list/supplier-list.component';
import { SupplierFormModule } from './components/library/supplier-form/supplier-form.component';
import { StateListModule } from './pages/state-list/state-list.component';
import { StateFormModule } from './components/library/state-form/state-form.component';
import { ItemProperty1ListModule } from './pages/item-property1-list/item-property1-list.component';
import { ItemProperty2ListModule } from './pages/item-property2-list/item-property2-list.component';
import { ItemProperty1FormModule } from './components/library/item-property1-form/item-property1-form.component';
import { ItemProperty2FormModule } from './components/library/item-property2-form/item-property2-form.component';
import { SalesmanListModule } from './pages/salesman-list/salesman-list.component';
import { SalesmanFormModule } from './components/library/salesman-form/salesman-form.component';
// import { CustomerFormModule } from './components/library/customer-form/customer-form.component';
import { LandedCostListModule } from './pages/landed-cost-list/landed-cost-list.component';
import { TendersListModule } from './pages/tenders-list/tenders-list.component';
import { TendersFormModule } from './components/library/tenders-form/tenders-form.component';
import { LandedCostFormModule } from './components/library/landed-cost-form/landed-cost-form.component';
import { ReasonsListModule } from './pages/reasons-list/reasons-list.component';
import { ReasonsFormModule } from './components/library/reasons-form/reasons-form.component';
import { ItemsListModule } from './pages/items-list/items-list.component';
import { ItemsFormModule } from './components/library/items-form/items-form.component';
// import { SubcategoryListComponent, SubCategoryListModule } from './pages/subcategory-list/subcategory-list.component';
// // import {
//   SubcategoryFormComponent,
//   SubCategoryFormModule,
// } from './components/library/subcategory-form/subcategory-form.component';
import {
  SubcategoryListComponent,
  SubCategoryListModule,
} from './pages/subcategory-list/subcategory-list.component';
import {
  SubcategoryFormComponent,
  SubCategoryFormModule,
} from './components/library/subcategory-form/subcategory-form.component';
import { DxButtonModule } from 'devextreme-angular';
import { CountryServiceService } from './services/country-service.service';
import { UomAddFormComponent } from './components/library/uom-add-form/uom-add-form.component';
import { UomListModule } from './pages/uom-list/uom-list.component';
import { UomAddFormModule } from './components/library/uom-add-form/uom-add-form.component';
import { PackingFormModule } from './components/library/packing-add-form/packing-add-form.component';
import { PackingListModule } from './pages/packing-list/packing-list.component';
import {
  ItemsEditFormComponent,
  ItemsEditFormModule,
} from './pages/items-edit-form/items-edit-form.component';
import {
  StoreItemsComponent,
  StoreItemsModule,
} from './pages/store-items/store-items.component';
import {
  StoreItemsListComponent,
  StoreItemsListModule,
} from './pages/store-items-list/store-items-list.component';
import {
  ItemProperty3Component,
  ItemProperty3Module,
} from './pages/item-property3/item-property3.component';
import { ItemProperty3FormComponent } from './components/library/item-property3-form/item-property3-form.component';
import { StoreItemsDetailsComponent } from './pages/store-items-details/store-items-details.component';
import {
  ItemProperty4ListComponent,
  ItemProperty4ListModule,
} from './pages/item-property4-list/item-property4-list.component';
import { ItemProperty4FormComponent } from './components/library/item-property4-form/item-property4-form.component';
import {
  ItemProperty5ListComponent,
  ItemProperty5ListModule,
} from './pages/item-property5-list/item-property5-list.component';
import { ItemProperty5FormComponent } from './components/library/item-property5-form/item-property5-form.component';
import {
  HashLocationStrategy,
  LocationStrategy,
  PathLocationStrategy,
} from '@angular/common';
import { ImportItemsComponent } from './operations/import-items/import-items.component';
import { ImportItemsModule } from './operations/import-items/import-items.component';
import { ImportItemsTemplateModule } from './pages/import-items-template/import-items-template.component';
import { ImportItemTemplateFormModule } from './components/library/import-item-template-form/import-item-template-form.component';
import { ImportItemTemplateEditFormModule } from './components/library/import-item-template-edit-form/import-item-template-edit-form.component';
import {
  TooltipCellComponent,
  TooltipCellModule,
} from './components/utils/tooltip-cell/tooltip-cell.component';
import { ImportItemsDialogModule } from './components/library/import-items-dialog/import-items-dialog.component';
import { ViewImportedItemsModule } from './components/library/view-imported-items/view-imported-items.component';
import {
  StoreItemsAddFormComponent,
  StoreItemsAddFormModule,
} from './pages/store-items-add-form/store-items-add-form.component';
import { ItemStorePropertiesComponent } from './pages/item-store-properties/item-store-properties.component';
import {
  ItemStorePropertiesLogComponent,
  ItemStorePropertiesLogModule,
} from './pages/item-store-properties-log/item-store-properties-log.component';
import {
  ItemStorePropertiesEditComponent,
  ItemStorePropertiesEditModule,
} from './pages/item-store-properties-edit/item-store-properties-edit.component';
import { UserLevelsModule } from './pages/user-levels/user-levels.component';
import { UserLevelsFormModule } from './components/library/user-levels-form/user-levels-form.component';
import { UserLevelsEditFormModule } from './components/library/user-levels-edit-form/user-levels-edit-form.component';

import {
  PurchaseOrderNewFormComponent,
  PurchaseOrderNewFormModule,
} from './pop-up/operations/purchase-order-new-form/purchase-order-new-form.component';
import { PurchaseOrderEditFormModule } from './pop-up/operations/purchase-order-edit-form/purchase-order-edit-form.component';
import { PurchaseOrderVerifyFormModule } from './pop-up/operations/purchase-order-verify-form/purchase-order-verify-form.component';
import { PurchaseOrderApproveFormModule } from './pop-up/operations/purchase-order-approve-form/purchase-order-approve-form.component';
import { PurchaseOrderViewFormModule } from './pop-up/operations/purchase-order-view-form/purchase-order-view-form.component';
import { DocumentTemplatesListModule } from './settings/document-templates/document-templates-list/document-templates-list.component';
import { RouteReuseStrategy } from '@angular/router';
import { CustomReuseStrategy } from './custome-reuse-strategy';
import { GrnModule } from './pages/Operations/grn/grn/grn.component';
import { GrnNewFormModule } from './pop-up/operations/grn-new-form/grn-new-form.component';
import { GrnEditFormModule } from './pop-up/operations/grn-edit-form/grn-edit-form.component';
import { GrnVerifyFormModule } from './pop-up/operations/grn-verify-form/grn-verify-form.component';
import { GrnApproveFormModule } from './pop-up/operations/grn-approve-form/grn-approve-form.component';
import { GrnViewFormModule } from './pop-up/operations/grn-view-form/grn-view-form.component';
import { PurchaseReturnModule } from './pages/Operations/purchase-return/purchase-return.component';
import { PurchaseReturnNewFormModule } from './pop-up/operations/purchase-return-new-form/purchase-return-new-form.component';
import { PurchaseReturnEditFormModule } from './pop-up/operations/purchase-return-edit-form/purchase-return-edit-form.component';
import { PurchaseReturnVerifyFormModule } from './pop-up/operations/purchase-return-verify-form/purchase-return-verify-form.component';
import { PurchaseReturnApproveFormModule } from './pop-up/operations/purchase-return-approve-form/purchase-return-approve-form.component';
import { PurchaseReturnViewFormModule } from './pop-up/operations/purchase-return-view-form/purchase-return-view-form.component';
import { TransferOutModule } from './pages/Operations/transfer-out/transfer-out.component';
import { TransferOutNewFormModule } from './pop-up/operations/transfer-out-new-form/transfer-out-new-form.component';
import { TransferOutEditFormModule } from './pop-up/operations/transfer-out-edit-form/transfer-out-edit-form.component';
import {
  TransferOutVerifyFormComponent,
  TransferOutVerifyFormModule,
} from './pop-up/operations/transfer-out-verify-form/transfer-out-verify-form.component';
import { TransferOutApproveFormModule } from './pop-up/operations/transfer-out-approve-form/transfer-out-approve-form.component';
import { TransferOutViewFormModule } from './pop-up/operations/transfer-out-view-form/transfer-out-view-form.component';
import { TransferInModule } from './pages/Operations/transfer-in/transfer-in.component';
import {
  TransferInNewFormComponent,
  TransferInNewFormModule,
} from './pop-up/operations/transfer-in-new-form/transfer-in-new-form.component';
import {
  TransferInEditFormComponent,
  TransferInEditFormModule,
} from './pop-up/operations/transfer-in-edit-form/transfer-in-edit-form.component';
import {
  TransferInVerifyFormComponent,
  TransferInVerifyFormModule,
} from './pop-up/operations/transfer-in-verify-form/transfer-in-verify-form.component';
import {
  TransferInApproveFormComponent,
  TransferInApproveFormModule,
} from './pop-up/operations/transfer-in-approve-form/transfer-in-approve-form.component';
import {
  TransferInViewFormComponent,
  TransferInViewFormModule,
} from './pop-up/operations/transfer-in-view-form/transfer-in-view-form.component';
import {
  ItemStorePricesComponent,
  ItemStorePricesModule,
} from './pages/item-store-prices/item-store-prices.component';
import {
  ItemStorePricesLogComponent,
  ItemStorePricesLogModule,
} from './pages/item-store-prices-log/item-store-prices-log.component';
import {
  ItemStorePricesEditComponent,
  ItemStorePricesEditModule,
} from './pages/item-store-prices-edit/item-store-prices-edit.component';
import { PriceVerifyApproveComponent } from './pages/price-verify-approve/price-verify-approve.component';
import {
  ItemStorePriceVerifyApproveComponent,
  ItemStorePriceVerifyApproveModule,
} from './pages/item-store-price-verify-approve/item-store-price-verify-approve.component';
import {
  ItemStorePriceViewComponent,
  ItemStorePriceViewModule,
} from './pages/item-store-price-view/item-store-price-view.component';

import {
  ItemStorePriceApproveComponent,
  ItemStorePriceApproveModule,
} from './pages/item-store-price-approve/item-store-price-approve.component';
import {
  PromotionSchemaLogComponent,
  PromotionSchemaLogModule,
} from './pages/promotion-schema-log/promotion-schema-log.component';
import {
  PromotionSchemaEditComponent,
  PromotionSchemaEditModule,
} from './pages/promotion-schema-edit/promotion-schema-edit.component';
import {
  PromotionComponent,
  PromotionModule,
} from './pages/promotion/promotion.component';
import {
  PromotionPopupComponent,
  PromotionPopupModule,
} from './pages/promotion-popup/promotion-popup.component';
import {
  PromotionLogComponent,
  PromotionLogModule,
} from './pages/promotion-log/promotion-log.component';
import {
  PromotionEditComponent,
  PromotionEditModule,
} from './pages/promotion-edit/promotion-edit.component';
import {
  PromotionVerifyComponent,
  PromotionVerifyModule,
} from './pages/promotion-verify/promotion-verify.component';
import {
  PromotionApproveComponent,
  PromotionApproveModule,
} from './pages/promotion-approve/promotion-approve.component';
import {
  PromotionViewComponent,
  PromotionViewModule,
} from './pages/promotion-view/promotion-view.component';
import { StockViewListModule } from './pages/Operations/stock-view-list/stock-view-list.component';
import {
  SupplierEditComponent,
  SupplierEditModule,
} from './pages/supplier-edit/supplier-edit.component';
import { LandedCostEditModule } from './pages/landed-cost-edit/landed-cost-edit.component';
import {
  InterStoreTransferListComponent,
  InterStoreTransferListModule,
} from './pages/Operations/inter-store-transfer-list/inter-store-transfer-list.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';
import { DepartmentModule } from './pages/HR/Masters/department/department.component';
import {
  DesignationComponent,
  DesignationModule,
} from './pages/HR/Masters/designation/designation.component';
import { EOSComponent, EOSModule } from './pages/HR/Masters/eos/eos.component';
import {
  PaySettingsComponent,
  PaySettingsModule,
} from './pages/HR/Masters/pay-settings/pay-settings.component';
import {
  LeaveSalaryComponent,
  LeaveSalaryModule,
} from './pages/HR/Masters/leave-salary/leave-salary.component';
import {
  EmployeeLeaveComponent,
  EmployeeLeaveModule,
} from './pages/HR/Masters/employee-leave/employee-leave.component';
// import { AdvanceTypesModule } from './pages/HR/Masters/advance-types/advance-types.component';

import {
  EmployeeComponent,
  EmployeeModule,
} from './components/HR/Masters/employee/employee.component';
import {
  EmployeeAddFormComponent,
  EmployeeAddFormModule,
} from './components/HR/Masters/employee-add-form/employee-add-form.component';
import {
  EmployeeEditFormComponent,
  EmployeeEditFormFormModule,
} from './components/HR/Masters/employee-edit-form/employee-edit-form.component';
import { SalaryHeadsModule } from './HR/Masters/salary-heads/salary-heads.component';
import { AdvanceTypesModule } from './HR/Masters/advance-types/advance-types.component';
import { AdvanceModule } from './HR/Masters/advance/advance.component';
import { PayRevisionModule } from './components/HR/Masters/pay-revision/pay-revision.component';
import { PayRevisionEditModule } from './components/HR/Masters/pay-revision-edit/pay-revision-edit.component';
import {
  PayRevisionAddComponent,
  PayRevisionAddModule,
} from './components/HR/Masters/pay-revision-add/pay-revision-add.component';
import {
  PayRevisionVerifyComponent,
  PayRevisionVerifyModule,
} from './components/HR/Masters/pay-revision-verify/pay-revision-verify.component';
import {
  PayRevisionApproveComponent,
  PayRevisionApproveModule,
} from './components/HR/Masters/pay-revision-approve/pay-revision-approve.component';
import {
  PayRevisionViewComponent,
  PayRevisionViewModule,
} from './components/HR/Masters/pay-revision-view/pay-revision-view.component';
import {
  TimesheetListComponent,
  TimesheetListModule,
} from './components/HR/Masters/timesheet-list/timesheet-list.component';
import {
  TimesheetAddComponent,
  TimesheetAddModule,
} from './components/HR/Masters/timesheet-add/timesheet-add.component';
import { TimesheetEditModule } from './components/HR/Masters/timesheet-edit/timesheet-edit.component';
import { StaffEOSModule } from './HR/Masters/staff-eos/staff-eos.component';
import {
  TimesheetVerifyComponent,
  TimesheetVerifyModule,
} from './components/HR/Masters/timesheet-verify/timesheet-verify.component';
import {
  TimesheetApproveComponent,
  TimesheetApproveModule,
} from './components/HR/Masters/timesheet-approve/timesheet-approve.component';
import {
  TimesheetViewComponent,
  TimesheetViewModule,
} from './components/HR/Masters/timesheet-view/timesheet-view.component';
import {
  ListMiscellaneousPaymentsComponent,
  MiscellaneousPaymentsModule,
} from './components/HR/Masters/list-miscellaneous-payments/list-miscellaneous-payments.component';
import {
  AddMiscellaneousPaymentComponent,
  AddMiscellaneousPaymentModule,
} from './components/HR/Masters/add-miscellaneous-payment/add-miscellaneous-payment.component';
import {
  EditMiscellaneousPaymentComponent,
  EditMiscellaneousPaymentModule,
} from './components/HR/Masters/edit-miscellaneous-payment/edit-miscellaneous-payment.component';
import {
  VerifyMiscellaneousPaymentComponent,
  VerifyMiscellaneousPaymentModule,
} from './components/HR/Masters/verify-miscellaneous-payment/verify-miscellaneous-payment.component';
import {
  ApproveMiscellaneousPaymentComponent,
  ApproveMiscellaneousPaymentModule,
} from './components/HR/Masters/approve-miscellaneous-payment/approve-miscellaneous-payment.component';
import {
  ViewMiscellaneousPaymentComponent,
  ViewMiscellaneousPaymentModule,
} from './components/HR/Masters/view-miscellaneous-payment/view-miscellaneous-payment.component';
import { PayrollListModule } from './components/HR/Masters/payroll-list/payroll-list.component';
import { PayrollAddModule } from './components/HR/Masters/payroll-add/payroll-add.component';
import { PayrollVerifyModule } from './components/HR/Masters/payroll-verify/payroll-verify.component';
import { PayrollApproveModule } from './components/HR/Masters/payroll-approve/payroll-approve.component';
import {
  PayrollViewComponent,
  PayrollViewModule,
} from './components/HR/Masters/payroll-view/payroll-view.component';
import { AccountsListComponent } from './pages/ACCOUNTS/accounts-list/accounts-list.component';
import {
  AddAccountComponent,
  AddAccountModule,
} from './pages/ACCOUNTS/add-account/add-account.component';
import {
  EditAccountComponent,
  EditAccountModule,
} from './pages/ACCOUNTS/edit-account/edit-account.component';
import {
  ArticleListComponent,
  ArticleListModule,
} from './pages/ARTICLE/article-list/article-list.component';
import {
  ArticleAddComponent,
  ArticleAddModule,
} from './pages/ARTICLE/article-add/article-add.component';

import {
  ArticleBrandComponent,
  ArticleBrandModule,
} from './pages/ARTICLE/article-brand/article-brand.component';
import { ArticleColorModule } from './pages/ARTICLE/article-color/article-color.component';
import { ArticleTypeModule } from './pages/ARTICLE/article-type/article-type.component';
import {
  DealerComponent,
  DealerModule,
} from './pages/ARTICLE/dealer/dealer.component';
import {
  CompanyMasterComponent,
  CompanyMasterModule,
} from './pages/ARTICLE/company-master/company-master.component';

import {
  ArticleEditComponent,
  ArticleEditModule,
} from './pages/ARTICLE/article-edit/article-edit.component';

import {
  CategoryComponent,
  CategoryModule,
} from './pages/ARTICLE/category/category/category.component';
import {
  PackingComponent,
  PackingModule,
} from './pages/ARTICLE/packing/packing.component';
import {
  PackingAddComponent,
  PackingAddModule,
} from './pages/ARTICLE/packing-add/packing-add.component';

import {
  ArticleProductionViewComponent,
  ArticleProductionViewModule,
} from './components/HR/Masters/article-production-view/article-production-view.component';
import {
  PackProductionViewComponent,
  PackProductionViewModule,
} from './pages/ARTICLE/pack-production-view/pack-production-view.component';
import {
  StockMovementViewComponent,
  StockMovementViewModule,
} from './pages/ARTICLE/stock-movement-view/stock-movement-view.component';
import { TransferOutViewComponent } from './pages/ARTICLE/transfer-out-view/transfer-out-view.component';
import {
  PackingEditComponent,
  PackingEditModule,
} from './pages/ARTICLE/packing-edit/packing-edit.component';
import {
  ArticleStockViewComponent,
  ArticleStockViewModule,
} from './pages/ARTICLE/article-stock-view/article-stock-view.component';
import {
  CartonStockViewComponent,
  CartonStockViewModule,
} from './pages/ARTICLE/carton-stock-view/carton-stock-view.component';
import {
  TransferInViewComponent,
  TransferInViewModule,
} from './pages/ARTICLE/transfer-in-view/transfer-in-view.component';

import { UserLevelNewFormComponent } from './pages/HR/Masters/user-level-new-form/user-level-new-form.component';
import { UserLevelEditFormComponent } from './pages/HR/Masters/user-level-edit-form/user-level-edit-form.component';
import { UserNewFormComponent } from './pages/HR/Masters/user-new-form/user-new-form.component';
import { UserEditFormComponent } from './pages/HR/Masters/user-edit-form/user-edit-form.component';
import { UserRoleComponent } from './pages/HR/Masters/user-role/user-role.component';
import { UserComponent } from './pages/HR/Masters/user/user.component';
import { UserRoleModule } from './pages/HR/Masters/user-role/user-role.component';
import { UserLevelNewFormModule } from './pages/HR/Masters/user-level-new-form/user-level-new-form.component';
import { UserLevelEditFormModule } from './pages/HR/Masters/user-level-edit-form/user-level-edit-form.component';
import { UserModule } from './pages/HR/Masters/user/user.component';
import { UserNewFormModule } from './pages/HR/Masters/user-new-form/user-new-form.component';
import { UserEditFormModule } from './pages/HR/Masters/user-edit-form/user-edit-form.component';

import {
  JournalVoucherListComponent,
  JournalVoucherModule,
} from './pages/JOURNAL-VOUCHER/journal-voucher-list/journal-voucher-list.component';
import {
  AddJournalVoucharComponent,
  AddJournalVoucharModule,
} from './pages/JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import {
  EditJournalVoucherComponent,
  EditJournalVoucherModule,
} from './pages/JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { CommitJournalVoucherComponent } from './pages/JOURNAL-VOUCHER/commit-journal-voucher/commit-journal-voucher.component';
import {
  ViewJournalVoucherComponent,
  ViewJournalVoucherModule,
} from './pages/JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import {
  CreditNoteListComponent,
  CreditNoteListModule,
} from './pages/CREDIT-NOTE/credit-note-list/credit-note-list.component';
import { AddCreditNoteComponent } from './pages/CREDIT-NOTE/add-credit-note/add-credit-note.component';
// import { EditCreditNoteComponent, EditCreditNoteModule } from './pages/CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
import {
  MonthlyPlanComponent,
  MonthlyPlanModule,
} from './pages/ARTICLE/monthly-plan/monthly-plan.component';
import {
  LedgerStatementComponent,
  LedgerStatementModule,
} from './pages/REPORT/ledger-statement/ledger-statement.component';

// @NgModule({
//   declarations: [AppComponent,],

import {
  EditCreditNoteComponent,
  EditCreditNoteModule,
} from './pages/CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
// import {
//   MonthlyPlanComponent,
//   MonthlyPlanModule,
// } from './pages/ARTICLE/monthly-plan/monthly-plan.component';
// import {
//   ViewCreditNoteComponent,
//   ViewCreditNoteModule,
// } from './pages/CREDIT-NOTE/view-credit-note/view-credit-note.component';
import {
  DebitComponent,
  DebitModule,
} from './pages/DEBIT/debit/debit.component';
import {
  AddDebitComponent,
  AddDebitModule,
} from './pages/DEBIT/add-debit/add-debit.component';
import {
  EditDebitComponent,
  EditDebitModule,
} from './pages/DEBIT/edit-debit/edit-debit.component';
import {
  ViewDebitComponent,
  ViewDebitModule,
} from './pages/DEBIT/view-debit/view-debit.component';
import {
  InvoiceListComponent,
  InvoiceListModule,
} from './pages/INVOICE/invoice-list/invoice-list.component';
import {
  AddInvoiceComponent,
  AddInvoiceModule,
} from './pages/INVOICE/add-invoice/add-invoice.component';
import {
  EditInvoiceComponent,
  EditInvoiceModule,
} from './pages/INVOICE/edit-invoice/edit-invoice.component';
import {
  ViewInvoiceComponent,
  ViewInvoiceModule,
} from './pages/INVOICE/view-invoice/view-invoice.component';
import {
  CustomerReceiptsComponent,
  CustomerReceiptsModule,
} from './pages/CUSTOMER-RECEIPTS/customer-receipts/customer-receipts.component';
import {
  AddCutomerReceiptComponent,
  AddCutomerReceiptModule,
} from './pages/CUSTOMER-RECEIPTS/add-cutomer-receipt/add-cutomer-receipt.component';
import {
  EditCustomerReceiptComponent,
  EditCustomerReceiptModule,
} from './pages/CUSTOMER-RECEIPTS/edit-customer-receipt/edit-customer-receipt.component';
import {
  ViewCustomerReceiptComponent,
  ViewCustomerReceiptModule,
} from './pages/CUSTOMER-RECEIPTS/view-customer-receipt/view-customer-receipt.component';
import {
  TrialBalanceReportComponent,
  TrialBalanceReportModule,
} from './pages/REPORT/trial-balance-report/trial-balance-report.component';
import { JournalBookModule } from './pages/REPORT/journal-book/journal-book.component';
import { PayrollEditModule } from './components/HR/Masters/payroll-edit/payroll-edit.component';
// import { EmployeeSalarySettingsEditModule } from './components/HR/Masters/employee-salary-settings-edit/employee-salary-settings-edit/employee-salary-settings-edit.component';
// import { EmployeeSalarySettingsAddModule } from './components/HR/Masters/employee-salary-settings-add/employee-salary-settings-add/employee-salary-settings-add.component';
// import { EmployeeSalarySettingsModule } from './components/HR/Masters/employee-salary-settings/employee-salary-settings/employee-salary-settings.component';
import { SalaryHeadListModule } from './components/HR/Masters/Salary Head/salary-head-list/salary-head-list.component';
import { SalaryHeadAddModule } from './components/HR/Masters/Salary Head/salary-head-add/salary-head-add.component';
import { SalaryHeadEditModule } from './components/HR/Masters/Salary Head/salary-head-edit/salary-head-edit.component';
import {
  CustomerEditFormComponent,
  CustomerEditFormModule,
} from './components/HR/Masters/Customer/customer-edit-form/customer-edit-form.component';
import { CustomerListModule } from './components/HR/Masters/Customer/customer-list/customer-list.component';
import { CustomerFormModule } from './components/HR/Masters/Customer/customer-form/customer-form.component';
import { FixedAsstesListModule } from './pages/FIXED_ASSETS/fixed-asstes-list/fixed-asstes-list.component';
import { FixedAsstesAddModule } from './pages/FIXED_ASSETS/fixed-asstes-add/fixed-asstes-add.component';
import { FixedAsstesEditModule } from './pages/FIXED_ASSETS/fixed-asstes-edit/fixed-asstes-edit.component';
import { DepreciationListModule } from './pages/Depreciation/depreciation-list/depreciation-list.component';
import {
  DepreciationAddComponent,
  DepreciationAddModule,
} from './pages/Depreciation/depreciation-add/depreciation-add.component';
import { DepreciationEditModule } from './pages/Depreciation/depreciation-edit/depreciation-edit.component';
import {
  SupplierPaymentListComponent,
  SupplierPaymentListModule,
} from './pages/SUPPLIER-PAYMENT/supplier-payment-list/supplier-payment-list.component';
import {
  OpeningBalanceComponent,
  OpeningBalanceModule,
} from './pages/OPENING BALANACE/opening-balance/opening-balance.component';
import {
  AddSupplierPaymentComponent,
  AddSupplierPaymentModule,
} from './pages/SUPPLIER-PAYMENT/add-supplier-payment/add-supplier-payment.component';
import {
  PurchaseInvoiceListComponent,
  PurchaseInvoiceListModule,
} from './pages/PURCHASE INVOICE/purchase-invoice-list/purchase-invoice-list.component';
import {
  AddPurchaseInvoiceComponent,
  AddPurchaseInvoiceModule,
} from './pages/PURCHASE INVOICE/add-purchase-invoice/add-purchase-invoice.component';
import {
  EditPurchaseInvoiceComponent,
  EditPurchaseInvoiceModule,
} from './pages/PURCHASE INVOICE/edit-purchase-invoice/edit-purchase-invoice.component';
import {
  EditSupplierPaymentComponent,
  EditSupplierPaymentModule,
} from './pages/SUPPLIER-PAYMENT/edit-supplier-payment/edit-supplier-payment.component';
import {
  ListMiscReceiptComponent,
  ListMiscReceiptModule,
} from './components/HR/Masters/MISC-RECEIPT/list-misc-receipt/list-misc-receipt.component';
import {
  AddMiscReceiptComponent,
  AddMiscReceiptModule,
} from './components/HR/Masters/MISC-RECEIPT/add-misc-receipt/add-misc-receipt.component';
import { EditMiscReceiptComponent } from './components/HR/Masters/MISC-RECEIPT/edit-misc-receipt/edit-misc-receipt.component';
import {
  AddSalaryPaymentComponent,
  AddSalaryPaymentModule,
} from './components/HR/Masters/SALARY-PAYMENT/add-salary-payment/add-salary-payment.component';
import {
  ListSalaryPaymentComponent,
  ListSalaryPaymentModule,
} from './components/HR/Masters/SALARY-PAYMENT/list-salary-payment/list-salary-payment.component';
import { BoxProductionViewModule } from './components/HR/Masters/box-production-view/box-production-view.component';
import { PaytimeEntryModule } from './components/HR/Masters/paytime-entry/paytime-entry.component';
import { PdcAddFormModule } from './components/HR/Masters/PDC/pdc-add-form/pdc-add-form.component';
import { PdcEditFormModule } from './components/HR/Masters/PDC/pdc-edit-form/pdc-edit-form.component';
import { PdcListModule } from './components/HR/Masters/PDC/pdc-list/pdc-list.component';
// import { PrePaymentAddModule } from './components/HR/Masters/pre-payment-add/pre-payment-add.component';
// import { PrePaymentListModule } from './components/HR/Masters/pre-payment-list/pre-payment-list.component';
import { EmployeeSalarySettingsAddModule } from './components/HR/Masters/employee-salary-settings-add/employee-salary-settings-add.component';
import { EmployeeSalarySettingsEditModule } from './components/HR/Masters/employee-salary-settings-edit/employee-salary-settings-edit.component';
import { EmployeeSalarySettingsModule } from './components/HR/Masters/employee-salary-settings/employee-salary-settings.component';
import { PrePaymentEditModule } from './pages/PRE_PAYMENT (1)/PRE_PAYMENT/pre-payment-edit/pre-payment-edit.component';
import { CashBookModule } from './pages/Cash-Book/cash-book/cash-book.component';
// import { ProfitAndLossModule } from './pages/PROFITLOSS/profit-and-loss/profit-and-loss.component';
import {
  BalanceSheetComponent,
  BalanceSheetModule,
} from './pages/BALANCESHEET/balance-sheet/balance-sheet.component';
import { PrePaymentAddModule } from './pages/PRE_PAYMENT (1)/PRE_PAYMENT/pre-payment-add/pre-payment-add.component';
import { PrePaymentListModule } from './pages/PRE_PAYMENT (1)/PRE_PAYMENT/pre-payment-list/pre-payment-list.component';
import { ProfitAndLossModule } from './pages/PROFITLOSS/profit-and-loss/profit-and-loss.component';

import { SupplierReportModule } from './pages/SUPPLIERREPORT/supplier-report/supplier-report.component';
import {
  CustomerReportComponent,
  CustomerReportModule,
} from './pages/customer-report/customer-report/customer-report.component';
import {
  AgedPayablesComponent,
  AgedPayablesModule,
} from './pages/Aged Payable/aged-payables/aged-payables.component';
import {
  AgedReceivablesComponent,
  AgedReceivablesModule,
} from './pages/Aged Receivables/aged-receivables/aged-receivables.component';
import {
  SupplierStatementDetailsComponent,
  SupplierStatementDetailsModule,
} from './pages/SuppierStatementDetails/supplier-statement-details/supplier-statement-details.component';
import {
  CustomerStatementDetailsComponent,
  CustomerStatementDetailsModule,
} from './pages/custmer-statement-details/customer-statement-details/customer-statement-details.component';

import {
  AgedReceivableDetailsComponent,
  AgedReceivableDetailsModule,
} from './pages/Aged  Receivable Details/aged-receivable-details/aged-receivable-details.component';

import {
  AgedPayableDetailsComponent,
  AgedPayableDetailsModule,
} from './pages/aged-payable-details/aged-payable-details.component';
import {
  ViewSalaryAdvanceComponent,
  ViewSalaryAdvanceModule,
} from './HR/Masters/view-salary-advance/view-salary-advance.component';
import {
  InputVatComponent,
  InputVatModule,
} from './pages/input-vat/input-vat.component';
import { OutputVatModule } from './pages/OutPutVat/output-vat/output-vat.component';
import {
  VatReturnComponent,
  VatReturnModule,
} from './pages/Vat Return/vat-return/vat-return.component';
import {
  PurchaseOrderComponent,
  PurchaseOrderModule,
} from './pages/purchase-order/purchase-order.component';
// import { PrepaymentPostingListModule } from './pages/PrePayment Posting/prepayment-posting-list/prepayment-posting-list.component';
// import { PrepaymentPostingAddModule } from './pages/PrePayment Posting/prepayment-posting-add/prepayment-posting-add.component';
// import { PrepaymentPostingEditModule } from './pages/PrePayment Posting/prepayment-posting-edit/prepayment-posting-edit.component';
// import { DepartmentEditModule } from './pages/department-edit/department-edit.component';
// import { VatClassEditModule } from './pages/vat-class-edit/vat-class-edit.component';

// import { SubcategoryEditModule } from './pages/subcategory-edit/subcategory-edit.component';
// import { ItemcategoryEditModule } from './pages/itemcategory-edit/itemcategory-edit.component';
// import { VatReturnComponent, VatReturnModule } from './pages/Vat Return/vat-return/vat-return.component';
import { PrepaymentPostingListModule } from './pages/PrePayment Posting/prepayment-posting-list/prepayment-posting-list.component';
import { PrepaymentPostingAddModule } from './pages/PrePayment Posting/prepayment-posting-add/prepayment-posting-add.component';
import { PrepaymentPostingEditModule } from './pages/PrePayment Posting/prepayment-posting-edit/prepayment-posting-edit.component';
import {
  DepartmentEditComponent,
  DepartmentEditModule,
} from './pages/department-edit/department-edit.component';
import {
  VatClassEditComponent,
  VatClassEditModule,
} from './pages/vat-class-edit/vat-class-edit.component';
// import { ItemCategoryModule } from './HR/Masters/item-category/item-category.component';
import {
  SubcategoryEditComponent,
  SubcategoryEditModule,
} from './pages/subcategory-edit/subcategory-edit.component';
import {
  ItemcategoryEditComponent,
  ItemcategoryEditModule,
} from './pages/itemcategory-edit/itemcategory-edit.component';
import { ItemProperty1EditModule } from './components/library/item-property1-edit/item-property1-edit.component';
import { ItemProperty2EditModule } from './components/library/item-property2-edit/item-property2-edit.component';
import { ItemProperty3EditModule } from './components/library/item-property3-edit/item-property3-edit.component';
import { ItemProperty4EditModule } from './components/library/item-property4-edit/item-property4-edit.component';
import { ItemProperty5EditModule } from './components/library/item-property5-edit/item-property5-edit.component';
// import {
//   ItemCategoryComponent,
//   ItemCategoryModule,
// } from './HR/Masters/item-category/item-category.component';
// import { ItemCategoryComponent, ItemCategoryModule } from './HR/Masters/item-category/item-category.component';
import {
  PaySlipComponent,
  PaySlipModule,
} from './components/HR/Masters/pay-slip/pay-slip.component';
import {
  TransferOutInventoryComponent,
  TransferOutInventoryModule,
} from './pages/transfer-out-inventory/transfer-out-inventory.component';
import {
  TransferOutInventoryAddComponent,
  TransferOutInventoryAddModule,
} from './pages/transfer-out-inventory-add/transfer-out-inventory-add.component';
// import { ReasonEditModule } from './components/library/reason-edit/reason-edit/reason-edit.component';
// import { EPFRegisterReportModule } from './pages/EPF Report/epf-register-report/epf-register-report.component';
// import {
//   WageRegisterComponent,
//   WageRegisterModule,
// } from './components/HR/Masters/wage-register/wage-register.component';
// import {
//   ESIComponent,
//   ESIModule,
// } from './components/HR/Masters/esi/esi.component';
import {
  TransferInInventoryComponent,
  TransferInInventoryModule,
} from './pages/transfer-in-inventory/transfer-in-inventory.component';
import {
  TransferInInventoryFormComponent,
  TransferInInventoryFormModule,
} from './pages/transfer-in-inventory-form/transfer-in-inventory-form.component';
import { ReasonEditModule } from './components/library/reason-edit/reason-edit/reason-edit.component';
import { EPFRegisterReportModule } from './pages/EPF Report/epf-register-report/epf-register-report.component';
import {
  WageRegisterComponent,
  WageRegisterModule,
} from './components/HR/Masters/wage-register/wage-register.component';
import {
  ESIComponent,
  ESIModule,
} from './components/HR/Masters/esi/esi.component';
import {
  AttendanceSheetComponent,
  AttendanceSheetModule,
} from './components/HR/Masters/attendance-sheet/attendance-sheet.component';
import {
  ItemQuantityStockComponent,
  ItemQuantityStockModule,
} from './components/HR/Masters/item-quantity-stock/item-quantity-stock.component';
import {
  ItemStockValueComponent,
  ItemStockValueModule,
} from './components/HR/Masters/item-stock-value/item-stock-value.component';
import { ItemCategoryListComponent } from './pages/item-category-list/item-category-list/item-category-list.component';
import {
  StockAdjustmentListComponent,
  StockAdjustmentListModule,
} from './pages/Stock_Adjustment/stock-adjustment-list/stock-adjustment-list.component';
import {
  StockAdjustmentAddComponent,
  StockAdjustmentAddModule,
} from './pages/Stock_Adjustment/stock-adjustment-add/stock-adjustment-add.component';
import {
  StockAdjustmentEditComponent,
  StockAdjustmentEditModule,
} from './pages/Stock_Adjustment/stock-adjustment-edit/stock-adjustment-edit.component';
import {
  DeliveryNoteComponent,
  DeliveryNoteModule,
} from './pages/delivery-note/delivery-note.component';
import { DeliveryNoteFormComponent } from './pages/delivery-note-form/delivery-note-form.component';
// import { StockMovementReportComponent, StockMovementReportModule } from './pages/HR/Masters/stock-movement-report/stock-movement-report.component';


import {
  QuotationComponent,
  QuotationModule,
} from './pages/quotation/quotation.component';
import {
  QuotationFormComponent,
  QuotationFormModule,
} from './pages/quotation-form/quotation-form.component';
import {
  StockMovementReportComponent,
  StockMovementReportModule,
} from './pages/HR/Masters/stock-movement-report/stock-movement-report.component';
import {
  SalesOrderComponent,
  SalesOrderModule,
} from './pages/sales-order/sales-order.component';
import {
  SalesOrderFormComponent,
  SalesOrderFormModule,
} from './pages/sales-order-form/sales-order-form.component';
import {
  InvoiceDeliveryComponent,
  InvoiceDeliveryModule,
} from './pages/invoice-delivery/invoice-delivery.component';
import {
  InvoiceDeliveryFormComponent,
  InvoiceDeliveryFormModule,
} from './pages/invoice-delivery-form/invoice-delivery-form.component';
import {
  PhysicalInventoryComponent,
  PhysicalInventoryModule,
} from './pages/physical-inventory/physical-inventory.component';
import {
  PhysicalInventoryFormComponent,
  PhysicalInventoryFormModule,
} from './pages/physical-inventory-form/physical-inventory-form.component';
import {
  DeliveryReturnComponent,
  DeliveryReturnModule,
} from './pages/delivery-return/delivery-return.component';
import {
  DeliveryReturnAddComponent,
  DeliveryReturnAddModule,
} from './pages/delivery-return-add/delivery-return-add.component';
import {
  DeliveryReturnEditComponent,
  DeliveryReturnEditModule,
} from './pages/delivery-return-edit/delivery-return-edit.component';
// import { AddTransferOutInventoryComponent } from './pages/add-transfer-out-inventory/add-transfer-out-inventory.component';

// import { EmployeeSalarySettingsModule } from './components/HR/Masters/employee-salary-settings/employee-salary-settings.component';
// import { EmployeeSalarySettingsEditModule } from './components/HR/Masters/employee-salary-settings-edit/employee-salary-settings-edit.component';
// import { EmployeeSalarySettingsAddModule } from './components/HR/Masters/employee-salary-settings-add/employee-salary-settings-add.component';

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
    CreateAccountFormModule,
    ChangePasswordFormModule,
    LoginFormModule,
    UnauthenticatedContentModule,
    DxSelectBoxModule,
    DenialListModule,
    CrmContactDetailsModule,
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
    // SubcategoryListComponent,
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
    // PurchaseOrderModule,
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
    PurchaseReturnModule,
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
    DepartmentModule,
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
    StockAdjustmentListModule,
    StockAdjustmentAddModule,
    StockAdjustmentEditModule,
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
export class AppModule {}
