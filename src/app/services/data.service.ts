import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { DateTime } from 'luxon';
import { map, groupBy, mergeMap, toArray, catchError } from 'rxjs/operators';
import { Task } from 'src/app/types/task';
import { Contact } from 'src/app/types/contact';
import { Sale, SalesOrOpportunitiesByCategory } from '../types/analytics';
import { jsPDF } from 'jspdf';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { exportDataGrid as exportDataGridToPdf } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportDataGridToXLSX } from 'devextreme/excel_exporter';
import { environment } from 'src/environments/environment';
import { Verify } from 'crypto';

const API_URL = 'https://js.devexpress.com/Demos/RwaService/api';
export interface ItemStorePayload {
  ITEM_ID: number;
  STORE_ID: number;
  STORE_SALE_PRICE: string;
  STORE_SALE_PRICE1: string;
  STORE_SALE_PRICE2: string;
  STORE_SALE_PRICE3: string;
  STORE_SALE_PRICE4: string;
  STORE_SALE_PRICE5: string;
  COST: string;
  STORE_IS_INACTIVE: boolean;
  STORE_IS_NOT_SALE_ITEM: boolean;
  STORE_IS_NOT_SALE_RETURN: boolean;
  STORE_IS_PRICE_REQUIRED: boolean;
  STORE_IS_NOT_DISCOUNTABLE: boolean;
}

@Injectable()
export class DataService {
  selected_Company_id: any;
  selected_fin_id: any;
  getLeavesByEmployee(empId: number) {
    throw new Error('Method not implemented.');
  }
  getDepartments() {
    throw new Error('Method not implemented.');
  }

  private worksheetDataSubject = new BehaviorSubject<any>(null); // Initialize with null
  worksheetData$ = this.worksheetDataSubject.asObservable();
  constructor(private http: HttpClient) {
    // this.sesstion_Details();
  }

  // private apiUrl = 'http://103.180.120.134/veztaretail/api';http://veztaapi.diligenzit.com/api/
  private apiUrl = environment.apiUrl;
  // private apiUrl = 'http://veztaapi.diligenzit.com/api';
  private apiUrlList =
    'http://veztaapi.diligenzit.com/api/worksheetitemproperty/itempropertylist';
  private apiUrlForStoreProperties =
    'http://103.180.120.134/veztaretail/api/worksheetitemproperty/insert';
  private apiUrlForStorePropertyUpdate =
    'http://103.180.120.134/veztaretail/api/worksheetitemproperty/update';
  private apiUrlForSelectWorksheet =
    'http://103.180.120.134/veztaretail/api/worksheetitemproperty/select';
  private apiUrlForVerify =
    'http://103.180.120.134/veztaretail/api/worksheetitemproperty/verify';
  private apiUrlForApproval =
    'http://103.180.120.134/veztaretail/api/worksheetitemproperty/approval';
  private apiUrlForDelete =
    'http://103.180.120.134/veztaretail/api/worksheetitemproperty/delete';
  private apiForWorksheet =
    'http://veztaapi.diligenzit.com/api/worksheetitemproperty';
  private apiUrlForStorePrices =
    'http://103.180.120.134/veztaretail/api/itemvizard';

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(sessionData, '=================session data==========');

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id=============='
    );

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;

    console.log(
      this.selected_fin_id,
      '===========selected fin id==================='
    );
  }

  getAccountGroupHeadList(): Observable<any> {
    return this.http.post(`${this.apiUrl}listGroupHead/list`, {});
  }

  getAccountHeadList(): Observable<any> {
    return this.http.post(`${this.apiUrl}AccountHead/list`, {});
  }

  getGroupingList(): Observable<any> {
    return this.http.post(`${this.apiUrl}grouplist/list`, {});
  }

  insertAccountHead(items: any) {
    const data = items;
    // console.log(data,"insert service")
    return this.http.post(`${this.apiUrl}accountHead/Insert`, data);
  }

  insertAccountGroup(items: any) {
    const data = items;
    // console.log(data,"insert service")
    return this.http.post(`${this.apiUrl}accountGroup/Insert`, data);
  }

  selectAccountHead(id: number) {
    return this.http.post<any>(`${this.apiUrl}accountHead/select/` + id, {});
  }

  updateAccountHead(items: any) {
    const data = items;
    // console.log(data,"insert service")
    return this.http.post(`${this.apiUrl}accountHead/update`, data);
  }

  deleteAccountHeadlData(id: number) {
    return this.http.post<any>(`${this.apiUrl}accountHead/delete/` + id, {});
  }

  getCategoryList(id: number) {
    return this.http.post<any>(`${this.apiUrl}ArticleCategory/list/` + id, {});
  }

  public getDropdownDataForAccounts(type: any): Observable<any> {
    const reqBodyData = { name: type };
    return this.http.post(`${this.apiUrl}dropdown/`, reqBodyData);
  }

  public Dropdown_ItemTax(type: any): Observable<any> {
    const reqBodyData = { name: type };
    return this.http.post(`${this.apiUrl}dropdown/`, reqBodyData);
  }

  getArticleList(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}article/List`, data);
  }

  insertArticle(items: any) {
    const data = items;
    // console.log(data,"insert service")
    return this.http.post(`${this.apiUrl}article/Insert`, data);
  }

  selectArticle(id: number, payload: any) {
    const body = {
      ID: id,
      UnitID: payload.UNIT_ID,
      ArtNo: payload.Art_no,
      Color: payload.Color,
      CategoryID: payload.CATEGORY_ID,
      Price: payload.PRICE,
    };

    return this.http.post<any>(
      `${this.apiUrl}article/select`, // removed /${id}
      body
    );
  }

  getLastOrderNo(unitId: number) {
    return this.http.post<any>(
      `${this.apiUrl}article/LastOrderNo/${unitId}`,
      {}
    );
  }

  updateArticle(items: any) {
    const data = items;
    // console.log(data,"insert service")
    return this.http.post(`${this.apiUrl}article/update`, data);
  }

  deleteArticle(id: number) {
    return this.http.post<any>(`${this.apiUrl}article/delete/` + id, {});
  }

  //JOURNAL VOUCHER
  getJournalVoucherList(): Observable<any> {
    return this.http.post(`${this.apiUrl}ACTransactions/list`, {});
  }

  getVoucherNo(): Observable<any> {
    return this.http.post(`${this.apiUrl}ACTransactions/voucherno`, {});
  }

  insertJournalVoucher(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}ACTransactions/Insert`, data);
  }

  selectJournalVoucher(id: number) {
    return this.http.post<any>(`${this.apiUrl}ACTransactions/select/` + id, {});
  }

  updateJournalVoucher(items: any) {
    const data = items;
    // console.log(data,"insert service")
    return this.http.post(`${this.apiUrl}ACTransactions/update`, data);
  }

  commitJournalVoucher(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}ACTransactions/approve`, data);
  }

  deleteJournalVoucher(id: number) {
    return this.http.post<any>(`${this.apiUrl}ACTransactions/delete/` + id, {});
  }

  //CREDIT-NOTE
  getCreditNoteList(): Observable<any> {
    return this.http.post(`${this.apiUrl}AC_CreditNote/list`, {});
  }

  insertCreditNote(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}AC_CreditNote/Insert`, data);
  }

  selectCreditNote(id: number) {
    return this.http.post<any>(`${this.apiUrl}AC_CreditNote/select/` + id, {});
  }

  updateCreditNote(items: any) {
    const data = items;
    // console.log(data,"insert service")
    return this.http.post(`${this.apiUrl}AC_CreditNote/update`, data);
  }

  getDocNo(): Observable<any> {
    return this.http.post(`${this.apiUrl}AC_CreditNote/DocNo`, {});
  }

  commitCreditNote(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}AC_CreditNote/commit`, data);
  }

  deleteCreditNote(id: number) {
    return this.http.post<any>(`${this.apiUrl}AC_CreditNote/delete/` + id, {});
  }

  //DEBIT NOTES
  getDebitNoteList(): Observable<any> {
    return this.http.post(`${this.apiUrl}ACTransactions/debitlist`, {});
  }

  insertDebitNote(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}ACTransactions/debitinsert`, data);
  }

  selectDebitNote(id: number) {
    return this.http.post<any>(
      `${this.apiUrl}ACTransactions/debitselect/` + id,
      {}
    );
  }

  updateDebitNote(items: any) {
    const data = items;
    // console.log(data,"insert service")
    return this.http.post(`${this.apiUrl}ACTransactions/debitupdate`, data);
  }

  commitDebitNote(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}ACTransactions/commit`, data);
  }
  deleteDebitNote(id: number) {
    return this.http.post<any>(
      `${this.apiUrl}ACTransactions/debitdelete/` + id,
      {}
    );
  }

  getDocNoForDebit(): Observable<any> {
    return this.http.post(`${this.apiUrl}ACTransactions/DocNo`, {});
  }

  getPendingInvoiceforDebit(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}ACTransactions/invoicelist`, payload);
  }

  //INVOICE
  getInvoiceGridList(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Invoice/list`, payload);
  }

  // getInvoiceGridList(payload: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}Sales_Invoice/list`, payload);
  // }

  getInvoiceMainList(): Observable<any> {
    return this.http.post(`${this.apiUrl}Invoice/getlist`, {});
  }

  getCustomerOrUnit(): Observable<any> {
    return this.http.post(`${this.apiUrl}CustTypeDrop`, {});
  }

  insertInvoice(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Invoice/insert`, data);
  }

  updateInvoice(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Invoice/update`, data);
  }

  selectInvoice(id: number) {
    return this.http.post<any>(`${this.apiUrl}Invoice/select/` + id, {});
  }

  getInvoiceNo(): Observable<any> {
    return this.http.post(`${this.apiUrl}Invoice/invoiceno`, {});
  }

  commitInvoice(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Invoice/commit`, data);
  }

  deleteInvoice(id: number) {
    return this.http.post<any>(`${this.apiUrl}Invoice/delete/` + id, {});
  }

  getPendingInvoiceList(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}AC_CreditNote/invoicelist`, payload);
  }
  //--------------------------INVOICE-DELIVERY-------------------------------------//

  getInvoiceMainListDelivery(): Observable<any> {
    return this.http.post(`${this.apiUrl}Sales_Invoice/getlist`, {});
  }

  getPendingDeliveryList(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Sales_Invoice/list`, payload);
  }

  insertInvoiceDelivery(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Sales_Invoice/insert`, data);
  }

  selectInvoiceDelivery(id: number) {
    return this.http.post<any>(`${this.apiUrl}Sales_Invoice/select/` + id, {});
  }

  updateInvoiceDelivery(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Sales_Invoice/update`, data);
  }

  approveInvoiceDelivery(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Sales_Invoice/approve`, data);
  }

  deleteInvoiceDelivery(id: number) {
    return this.http.post<any>(`${this.apiUrl}Sales_Invoice/delete/` + id, {});
  }

  getInvoiceNoDelivery(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}Sales_Invoice/GetLatestVoucherNumber`,
      {}
    );
  }
  //   getPendingInvoiceforSupplierPayment(payload: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}SupplierPayment/invoicelist`, payload);
  // }
  //--------------------------TRANSFER-OUT-INVENTORY-------------------------------------//
  getItemDetailsForInventory(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}TransferOutInv/getitem`, payload);
  }

  getItemsListForInventory(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Inventory/itemDetails`, payload);
  }
  getTransferOutForInventoryMainList(): Observable<any> {
    return this.http.post(`${this.apiUrl}TransferOutInv/list`, {});
  }
  insertTransferOutForInventory(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}TransferOutInv/insert`, data);
  }
  selectTransferOutForInventory(id: number) {
    return this.http.post<any>(`${this.apiUrl}TransferOutInv/select/` + id, {});
  }

  getTransferNo(): Observable<any> {
    return this.http.post(`${this.apiUrl}TransferOutInv/transferno`, {});
  }

  updateTransferOutForInventory(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}TransferOutInv/update`, data);
  }

  approveTransferOutForInventory(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}TransferOutInv/approve`, data);
  }

  deleteTrOutForInventory(id: number) {
    return this.http.post<any>(`${this.apiUrl}TransferOutInv/delete/` + id, {});
  }

  //--------------------------TRANSFER-IN-INVENTORY-------------------------------------//
  getItemDetailsForTrInInventory(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}TransferIn/getitem`, payload);
  }
  getTransferInForInventoryMainList(): Observable<any> {
    return this.http.post(`${this.apiUrl}TransferIn/list`, {});
  }
  insertTransferInForInventory(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}TransferIn/insert`, data);
  }
  selectTransferInForInventory(id: number) {
    return this.http.post<any>(`${this.apiUrl}TransferIn/select/` + id, {});
  }
  updateTransferInForInventory(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}TransferIn/update`, data);
  }

  approveTransferInForInventory(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}TransferIn/approve`, data);
  }
  getTransferNoTrIn(): Observable<any> {
    return this.http.post(`${this.apiUrl}TransferIn/transferno`, {});
  }

  deleteTrInForInventory(id: number) {
    return this.http.post<any>(`${this.apiUrl}TransferIn/delete/` + id, {});
  }
  //........................................QUOTATION............................................//
  getQuotationMainList(): Observable<any> {
    return this.http.post(`${this.apiUrl}Quotation/list`, {});
  }

  getItemsForQuotation(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Quotation/list-items`, payload);
  }

  getHistoryQuotation(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}Quotation/History/` + id, {});
  }

  insertSalesQuotation(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Quotation/save`, data);
  }

  selectSalesQuotation(id: number) {
    return this.http.post<any>(`${this.apiUrl}Quotation/select/` + id, {});
  }

  updateSalesQuotation(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Quotation/edit`, data);
  }

  approveSalesQuotation(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Quotation/approve`, data);
  }

  getTermsAndConditions(): Observable<any> {
    return this.http.post(`${this.apiUrl}Quotation/list-terms`, {});
  }

  deleteSalesQuotation(id: number) {
    return this.http.post<any>(`${this.apiUrl}Quotation/delete/` + id, {});
  }

  getVoucherNoForQuotation(): Observable<any> {
    return this.http.post(`${this.apiUrl}Quotation/GetLatestVoucherNumber`, {});
  }

  //........................................SALES-ORDER............................................//
  getSalesOrderMainList(): Observable<any> {
    return this.http.post(`${this.apiUrl}SalesOrder/list`, {});
  }

  getQuotationListForSalesOrder(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}SalesOrder/listQuotation`, data);
  }

  saveSalesOrder(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}SalesOrder/save`, data);
  }

  selectSalesOrder(id: number) {
    return this.http.post<any>(`${this.apiUrl}SalesOrder/select/` + id, {});
  }
  updateSalesOrder(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}SalesOrder/edit`, data);
  }

  approveSalesOrder(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}SalesOrder/approve`, data);
  }

  deleteSalesOrder(id: number) {
    return this.http.post<any>(`${this.apiUrl}SalesOrder/delete/` + id, {});
  }

  getVoucherNoForSalesOrder(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}SalesOrder/GetLatestVoucherNumber`,
      {}
    );
  }
  //........................................DELIVERY NOTE............................................//
  getdeliveryNoteist(): Observable<any> {
    return this.http.post(`${this.apiUrl}Delivery_Note/list`, {});
  }

  getDalesOrderListForDeliveryNote(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Delivery_Note/getso`, data);
  }
  getCustomerDetailDeliveryNote(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Delivery_Note/getcust`, data);
  }

  saveDeliveryNote(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Delivery_Note/insert`, data);
  }
  selectDeliveryNote(id: number) {
    return this.http.post<any>(`${this.apiUrl}Delivery_Note/select/` + id, {});
  }
  updateDeliveryNote(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Delivery_Note/update`, data);
  }
  approveDeliveryNote(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Delivery_Note/approve`, data);
  }
  deleteDeliveryNote(id: number) {
    return this.http.post<any>(`${this.apiUrl}Delivery_Note/delete/` + id, {});
  }

  //----------------------------------------PHYSICAL-INVENTORY-------------------------------------------------//
  getPhysicalInventoryList(): Observable<any> {
    return this.http.post(`${this.apiUrl}PhysicalStock/list`, {});
  }

  getItemsForInventory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}PhysicalStock/list-items`, data);
  }
  getFilteredItemsForInventory(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}PhysicalStock/filtered-items`, data);
  }

  savePhysicalInventory(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}PhysicalStock/save`, data);
  }

  selectPhysicalInventory(id: number) {
    return this.http.post<any>(`${this.apiUrl}PhysicalStock/select/` + id, {});
  }

  updatePhysicalInventory(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}PhysicalStock/edit`, data);
  }
  approvePhysicalInventory(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}PhysicalStock/Approve`, data);
  }

  deletePhysicalInventory(id: number) {
    return this.http.post<any>(`${this.apiUrl}PhysicalStock/delete/` + id, {});
  }

  getItemsForInventoryExcelUpload(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}PhysicalStock/list-Barcodes`, data);
  }

  getPhysicalInventoryHistory(): Observable<any> {
    return this.http.post(`${this.apiUrl}PhysicalStock/history`, {});
  }

  getVoucherNoPhysicalInventry(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}PhysicalStock/GetLatestVoucherNumber`,
      {}
    );
  }
  //----------------------------------------PAY-SLIP-------------------------------------------------//
  getPaySlip(data: any) {
    return this.http.post(`${this.apiUrl}PaySlipReport/payslip`, data);
  }

  //  WAGE REGISTER
  getWageRegister(data: any) {
    return this.http.post(`${this.apiUrl}WageRegReport/wagereport`, data);
  }
  //=============================EPF Register=============================

  getEPFRegister(data: any) {
    return this.http.post(`${this.apiUrl}EPFReport/epfreport`, data);
  }

  //  WAGE REGISTER
  //  ESI REGISTER
  getESIRegister(data: any) {
    return this.http.post(`${this.apiUrl}ESIReport/esireport`, data);
  }

  //  ATTENDANCE SHEET
  getAttendanceSheet(data: any) {
    return this.http.post(`${this.apiUrl}ESIReport/esireport`, data);
  }

  //  ITEM QUANTITY STOCK
  getItemQuantityStock(data: any) {
    return this.http.post(
      `${this.apiUrl}ItemQtyReport/itemquantityreport`,
      data
    );
  }

  //  ITEM STOCK VALUE
  getItemStockValue(data: any) {
    return this.http.post(
      `${this.apiUrl}ItemStockValueRept/itemstockvaluereport`,
      data
    );
  }

  //CUSTOMER RECEIPT
  getCustomerReciptList(): Observable<any> {
    return this.http.post(`${this.apiUrl}Receipt/list`, {});
  }
  getInvoiceListForCustomerReceipt(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Receipt/invoicelist`, payload);
  }

  insertCustomerReceipt(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Receipt/insert`, data);
  }

  selectCustomerReceipt(id: number) {
    return this.http.post<any>(`${this.apiUrl}Receipt/select/` + id, {});
  }

  updateReceipt(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Receipt/update`, data);
  }

  commitCustomerReceipt(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Receipt/commit`, data);
  }

  getReceiptNo(): Observable<any> {
    return this.http.post(`${this.apiUrl}Receipt/receiptno`, {});
  }

  deleteCustomer(id: number) {
    return this.http.post<any>(`${this.apiUrl}Receipt/delete/` + id, {});
  }

  getTimesheetListForPayroll(payload) {
    const getEndpoint = `${this.apiUrl}TimeSheet/payroll-pending`;
    return this.http.post(getEndpoint, payload);
  }

  getPayrollList(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Salary/list`, payload);
  }

  viewSelectedPayroll(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Salary/View`, payload);
  }

  updatePayroll(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Salary/edit`, data);
  }

  approvePayroll(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}salary/approve`, data);
  }

  deletePayroll(TS_ID: number) {
    return this.http.post<any>(`${this.apiUrl}salary/delete/`, { TS_ID });
  }

  //OPENING BALANCE
  selectOpeningBalance(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}OpeningBalance/select`, data);
  }

  insertOpeningBalance(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}OpeningBalance/insert`, data);
  }

  approveOpeningBalance(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}OpeningBalance/commit`, data);
  }

  //SUPPLIER PAYMENT
  getSupplierPaymentList(): Observable<any> {
    return this.http.post(`${this.apiUrl}SupplierPayment/list`, {});
  }

  getPendingInvoiceforSupplierPayment(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}SupplierPayment/invoicelist`, payload);
  }

  insertSupplierPayment(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}SupplierPayment/insert`, data);
  }

  getPdcList(payload: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}SupplierPayment/GetPDCListBySupplierId`,
      payload
    );
  }

  getPdcListByCustomer(payload: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}Receipt/GetPDCListByCustomerId`,
      payload
    );
  }

  selectSupplierPayment(id: number) {
    return this.http.post<any>(
      `${this.apiUrl}SupplierPayment/select/` + id,
      {}
    );
  }

  updateSupplierPayment(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}SupplierPayment/update`, data);
  }

  approveSupplierPayment(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}SupplierPayment/commit`, data);
  }

  deleteSupplierPayment(id: number) {
    return this.http.delete<any>(`${this.apiUrl}SupplierPayment/delete/${id}`);
  }

  //PURCHASE INVOICE
  getPurchaseInvoiceList(): Observable<any> {
    return this.http.post(`${this.apiUrl}PurchaseInvoice/list`, {});
  }

  selectPurchaseInvoice(id: number) {
    return this.http.post<any>(
      `${this.apiUrl}PurchaseInvoice/select/` + id,
      {}
    );
  }

  getPendingGRN(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}PurchaseInvoice/invoicelist`, data);
  }

  insertPurchaseInvoice(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}PurchaseInvoice/insert`, data);
  }

  updatePurchaseInvoice(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}PurchaseInvoice/update`, data);
  }

  approvePurchaseInvoice(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}PurchaseInvoice/approve`, data);
  }

  getPurchaseNo(): Observable<any> {
    return this.http.post(`${this.apiUrl}PurchaseInvoice/purchaseno`, {});
  }

  deletePurchaseInvoice(id: number) {
    return this.http.post<any>(
      `${this.apiUrl}PurchaseInvoice/delete/` + id,
      {}
    );
  }

  //MISCELLANEOUS PAYMENT
  getMiscpaymentList(): Observable<any> {
    return this.http.post(`${this.apiUrl}MiscPayment/list`, {});
  }

  insertMiscPayment(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}MiscPayment/insert`, data);
  }

  updateMiscPayment(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}MiscPayment/update`, data);
  }

  selectMiscPayment(id: number) {
    return this.http.post<any>(`${this.apiUrl}MiscPayment/select/` + id, {});
  }
  approveMiscPayment(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}MiscPayment/commit`, data);
  }

  getPendingNo(): Observable<any> {
    return this.http.post(`${this.apiUrl}MiscPayment/paymentno`, {});
  }

  //MISCELLANEOUS-RECEIPT
  getMiscReceiptList(): Observable<any> {
    return this.http.post(`${this.apiUrl}MiscReceipt/list`, {});
  }
  getVoucherNoForMiscReceipt(): Observable<any> {
    return this.http.post(`${this.apiUrl}MiscReceipt/voucherno`, {});
  }
  insertMiscReceipt(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}MiscReceipt/insert`, data);
  }

  selectMiscReceipt(id: number) {
    return this.http.post<any>(`${this.apiUrl}MiscReceipt/select/` + id, {});
  }

  updateMiscReceipt(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}MiscReceipt/update`, data);
  }

  approveMiscReceipt(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}MiscReceipt/commit`, data);
  }

  deleteMiscReceipt(id: number) {
    return this.http.post<any>(`${this.apiUrl}MiscReceipt/delete/` + id, {});
  }

  //SALARY-PAYMENT

  getSalaryPaymentList(): Observable<any> {
    return this.http.post(`${this.apiUrl}SalaryPayment/view`, {});
  }
  getPendingSalaryPayments(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}SalaryPayment/list`, data);
  }

  insertSalaryPayment(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}SalaryPayment/insert`, data);
  }

  getPaymentNo(): Observable<any> {
    return this.http.post(`${this.apiUrl}SalaryPayment/paymentno`, {});
  }

  selectSalaryPayment(id: number) {
    return this.http.post<any>(`${this.apiUrl}SalaryPayment/select/` + id, {});
  }

  updateSalaryPayment(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}SalaryPayment/update`, data);
  }

  approveSalaryPayment(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}SalaryPayment/commit`, data);
  }

  //ANUSREE
  get_ArticleProduction_view(payload) {
    return this.http.post(`${this.apiUrl}AC_Report/articleproduction`, payload);
  }

  get_BoxProduction_view(payload) {
    return this.http.post(`${this.apiUrl}AC_Report/Boxproduction`, payload);
  }

  SalaryHead_Dropdown() {
    const reqbody = { NAME: 'SALARYHEAD' };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  get_PaytimeEntry_list(payload) {
    const getEndpoint = `${this.apiUrl}PayTimeEntry/select`;
    return this.http.post(getEndpoint, payload);
  }

  Insert_PaytimeEntry(payload) {
    const getEndpoint = `${this.apiUrl}PayTimeEntry/save`;
    return this.http.post(getEndpoint, payload);
  }

  PaymentTerms_Dropdown_Api() {
    const reqbody = { NAME: 'PAYMENTTERMS' };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  CountryDropdown_Api() {
    const reqbody = { NAME: 'COUNTRY' };

    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  //  ========PrePayment===============
  get_PrePayment_List() {
    const getEndpoint = `${this.apiUrl}PrePayment/list`;
    return this.http.post(getEndpoint, {});
  }

  ExxpenseLedger_Dropdown() {
    const reqbody = { NAME: 'EXPENSE_LEDGER' };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  Insert_PrePayment(payload) {
    const getEndpoint = `${this.apiUrl}PrePayment/insert`;
    return this.http.post(getEndpoint, payload);
  }

  Select_PrePayment(id: any) {
    return this.http.post(`${this.apiUrl}PrePayment/select/${id}`, {});
  }

  Update_PrePayment(payload) {
    const getEndpoint = `${this.apiUrl}PrePayment/update`;
    return this.http.post(getEndpoint, payload);
  }

  Delete_PrePayment(id: any) {
    return this.http.post(`${this.apiUrl}PrePayment/delete/${id}`, {});
  }

  Approve_PrePayment(payload) {
    const getEndpoint = `${this.apiUrl}PrePayment/commit`;
    return this.http.post(getEndpoint, payload);
  }
  //=============PDC===============
  Supplier_Dropdown() {
    const reqbody = { NAME: 'SUPPLIER' };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  Bank_Dropdown() {
    const reqbody = { NAME: 'BANK_AC', COMPANY_ID: 1 };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  Customer_Dropdown() {
    const reqbody = { NAME: 'CUSTOMER' };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  get_PDC_List() {
    const getEndpoint = `${this.apiUrl}PDC/list`;
    return this.http.post(getEndpoint, {});
  }

  Insert_PDC(payload) {
    const getEndpoint = `${this.apiUrl}PDC/save`;
    return this.http.post(getEndpoint, payload);
  }

  Select_PDC(id: any) {
    return this.http.post(`${this.apiUrl}PDC/select/${id}`, {});
  }

  Update_PDC(payload) {
    const getEndpoint = `${this.apiUrl}PDC/update`;
    return this.http.post(getEndpoint, payload);
  }

  Delete_PDC(id: any) {
    return this.http.post(`${this.apiUrl}PDC/delete/${id}`, {});
  }

  getStateData_Api(item: any) {
    const reqBody = item;
    return this.http.post(`${this.apiUrl}dropdown`, reqBody);
  }

  //-------------------------------------------------------------------------------------------------------------//
  getStoreItemPropertyList(): Observable<any> {
    return this.http.post(this.apiUrlList, {});
  }
  verifyItemStoreProperties(payload: any): Observable<any> {
    return this.http.post(this.apiUrlForVerify, payload);
  }

  approveworksheetItemProperty(payload: any): Observable<any> {
    return this.http.post(this.apiUrlForApproval, payload);
  }

  //change item store properties
  saveWorksheetItemPropertyData(payload: any): Observable<any> {
    return this.http.post(this.apiUrlForStoreProperties, payload);
  }

  updateworksheetItemProperty(payload: any): Observable<any> {
    return this.http.post(this.apiUrlForStorePropertyUpdate, payload);
  }

  selectWorksheet(id: number): Observable<any> {
    return this.http.post(`${this.apiUrlForSelectWorksheet}/${id}`, {});
  }

  //store item property log
  public getWorksheetItemPropertyLog(): Observable<any> {
    return this.http.post(`${this.apiUrl}/worksheetitemproperty/list`, {});
  }

  deleteWorksheet(id: number): Observable<any> {
    return this.http.post(`${this.apiUrlForDelete}/${id}`, {});
  }

  setWorksheetData(newData: any) {
    this.worksheetDataSubject.next({
      ...this.worksheetDataSubject.getValue(),
      ...newData,
    });
  }

  getWorksheetData() {
    return this.worksheetDataSubject.asObservable();
  }

  clearWorksheetData() {
    this.worksheetDataSubject.next(null); // Clear data when not needed
  }

  //item store prices
  //item store prices log list
  getWorksheetItemStorePrices(): Observable<any> {
    return this.http.post(`${this.apiUrl}worksheetitemproperty/Pricelist`, {});
  }

  saveWorksheetPrice(payload: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}worksheetitemproperty/insertprice`,
      payload
    );
  }

  updateworksheetItemPrice(payload: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}worksheetitemproperty/updateprice`,
      payload
    );
  }

  selectWorksheetForPrice(id: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}worksheetitemproperty/selectprice/${id}`,
      {}
    );
  }

  verifyItemStorePrices(payload: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}worksheetitemproperty/Verifyprice`,
      payload
    ); // Use 'httpClient', not 'HttpClient'
  }

  approveworksheetItemPrices(payload: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}worksheetitemproperty/Approvalprice`,
      payload
    );
  }

  deleteWorksheetOfStorePrices(id: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}worksheetitemproperty/delete/${id}`,
      {}
    );
  }

  //itemstoreprices
  getItemListByStoreId(storeIds: any): Observable<any> {
    console.log('IN SERVICE');
    const body = {
      STORE_ID: storeIds,
    };
    return this.http.post(`${this.apiUrl}itemvizard/itempricewizard`, body);
  }

  //denail
  public getDenialsData() {
    return this.http.get<any>(
      'http://103.180.120.134/projectx/api/DenialMaster/List'
    );
  }
  //uservelel_menus
  get_userLevel_menuList() {
    const Url = `${this.apiUrl}/userlevel/usermenulist`;
    const reqBody = {
      list: [],
    };

    return this.http.post(Url, reqBody);
  }

  public getUserLevelData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/userlevel/userlevelist`, {});
  }

  public postUserLevel(items: any) {
    const data = items;
    // console.log(data,"insert service")
    return this.http.post(`${this.apiUrl}/userlevel/insert`, data);
  }

  public UpdateUserLevel(items: any) {
    const data = items;
    // console.log(data,"insert service")
    return this.http.post(`${this.apiUrl}/userlevel/update`, data);
  }

  selectUserLevelData(id: number) {
    return this.http.post<any>(`${this.apiUrl}/userlevel/select/` + id, {});
  }

  removeUserLevelData(id: number, data: object) {
    return this.http.post<any>(`${this.apiUrl}/userlevel/delete/` + id, {});
  }

  //department
  public getDepartmentData(): Observable<any> {
    return this.http.post(`${this.apiUrl}itemdepartment/list`, {});
  }
  public postDepartmentData(
    CODE: any,
    DEPT_NAME: any,
    COMPANY_ID: any,
    COMPANY_NAME: any
  ): Observable<any> {
    const data = { CODE, DEPT_NAME, COMPANY_ID, COMPANY_NAME };

    return this.http.post(`${this.apiUrl}itemdepartment/save`, data);
  }
  removeDepartment(id: any) {
    return this.http.post(`${this.apiUrl}itemdepartment/delete/${id}`, {});
  }

  selectDepartment(id: any) {
    return this.http.post(`${this.apiUrl}itemdepartment/select/${id}`, {});
  }

  UpdateDepartment(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}itemdepartment/save`, payload);
  }

  //country
  public getCountryData(): Observable<any> {
    return this.http.post(`${this.apiUrl}country/list`, {});
  }
  public getCountryDataAPi() {
    const reqBody = {
      NAME: 'COUNTRY',
    };
    return this.http.post(`${this.apiUrl}dropdown`, reqBody);
  }

  public postCountryData(
    CODE: any,
    COUNTRY_NAME: any,
    COMPANY_ID: any
  ): Observable<any> {
    const data = { CODE, COUNTRY_NAME, COMPANY_ID };

    return this.http.post(`${this.apiUrl}country/save`, data);
  }
  removeCountry(id: any) {
    return this.http.get(`${this.apiUrl}country/delete/` + id);
  }
  updateCountry(ID: any, CODE: any, COUNTRY_NAME: any): Observable<any> {
    const data = { ID, CODE, COUNTRY_NAME };

    return this.http.post(`${this.apiUrl}country/save`, data);
  }

  //brand
  public getBrandData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/itembrand/list`, {});
  }

  public postBrandData(
    CODE: any,
    BRAND_NAME: any,
    COMPANY_ID: any
  ): Observable<any> {
    const data = { CODE, BRAND_NAME, COMPANY_ID };

    return this.http.post(`${this.apiUrl}/itembrand/save`, data);
  }
  removeBrand(id: any, code: string, brandName: string, companyId: string) {
    const requestBody = {
      CODE: code,
      BRAND_NAME: brandName,
      COMPANY_ID: companyId,
    };
    return this.http.post<any>(
      `${this.apiUrl}/itembrand/delete/` + id,
      requestBody
    );
  }
  updateBrand(
    ID: any,
    CODE: any,
    BRAND_NAME: any,
    COMPANY_ID: any
  ): Observable<any> {
    const data = { ID, CODE, BRAND_NAME, COMPANY_ID };

    return this.http.post(`${this.apiUrl}/itembrand/save`, data);
  }

  //currency
  public getCurrencyData(): Observable<any> {
    return this.http.post(`${this.apiUrl}currency/list`, {});
  }
  public postCurrencyData(
    CODE: any,
    SYMBOL: any,
    DESCRIPTION: any,
    FRACTION_UNIT: any,
    EXCHANGE: any,
    COMPANY_ID: any
  ): Observable<any> {
    const data = {
      CODE,
      SYMBOL,
      DESCRIPTION,
      FRACTION_UNIT,
      EXCHANGE,
      COMPANY_ID,
    };

    return this.http.post(`${this.apiUrl}/currency/save`, data);
  }
  removeCurrency(
    id: any,
    code: any,
    symbol: any,
    description: any,
    fraction_unit: any,
    exchange: any,
    companyId: string
  ) {
    const requestBody = {
      CODE: code,
      SYMBOL: symbol,
      DESCRIPTION: description,
      FRACTION_UNIT: fraction_unit,
      EXCHANGE: exchange,
      COMPANY_ID: companyId,
    };
    return this.http.post<any>(
      `${this.apiUrl}/currency/delete/` + id,
      requestBody
    );
  }
  updateCurrency(
    ID: any,
    CODE: any,
    SYMBOL: any,
    DESCRIPTION: any,
    FRACTION_UNIT: any,
    EXCHANGE: any,
    COMPANY_ID: any
  ): Observable<any> {
    const data = {
      ID,
      CODE,
      SYMBOL,
      DESCRIPTION,
      FRACTION_UNIT,
      EXCHANGE,
      COMPANY_ID,
    };

    return this.http.post(`${this.apiUrl}/currency/save`, data);
  }

  //category
  public getCategoryData(): Observable<any> {
    return this.http.post(`${this.apiUrl}itemcategory/list`, {});
  }
  select_category(id: any) {
    return this.http.post(`${this.apiUrl}itemcategory/select/${id}`, {});
  }

  select_subcategory(id: any) {
    return this.http.post(`${this.apiUrl}ItemSubCategory/select/${id}`, {});
  }
  public postCategoryData(
    CODE: any,
    CAT_NAME: any,
    LOYALTY_POINT: any,
    COST_HEAD_ID: any,
    DEPT_ID: any,
    COMPANY_ID: any
  ): Observable<any> {
    const data = {
      CODE,
      CAT_NAME,
      LOYALTY_POINT,
      COST_HEAD_ID,
      DEPT_ID,
      COMPANY_ID,
    };

    return this.http.post(`${this.apiUrl}itemcategory/save`, data);
  }
  removeCategory(
    id: any,
    code: any,
    catName: any,
    loyaltypoint: any,
    cost_head_id: any,
    dept_id: any,
    companyId: any
  ) {
    const requestBody = {
      CODE: code,
      CAT_NAME: catName,
      LOYALTY_POINT: loyaltypoint,
      COST_HEAD_ID: cost_head_id,
      DEPT_ID: dept_id,
      COMPANY_ID: companyId,
    };
    return this.http.post<any>(
      `${this.apiUrl}itemcategory/delete/` + id,
      requestBody
    );
  }
  // updateCategory(
  //   ID: any,
  //   CODE: any,
  //   CAT_NAME: any,
  //   LOYALTY_POINT: any,
  //   COST_HEAD_ID: any,
  //   DEPT_ID: any,
  //   COMPANY_ID: any
  // ): Observable<any> {
  //   const data = {
  //     ID,
  //     CODE,
  //     CAT_NAME,
  //     LOYALTY_POINT,
  //     COST_HEAD_ID,
  //     DEPT_ID,
  //     COMPANY_ID,
  //   };

  //   return this.http.post(`${this.apiUrl}/itemcategory/save`, data);
  // }

  updateCategory(item: any) {
    const payload = item;

    return this.http.post(`${this.apiUrl}itemcategory/save`, payload);
  }

  //category dropdown
  getCategoryDropdown(type: string): Observable<any[]> {
    const reqBodyData = { name: type };
    return this.http.post<any[]>(`${this.apiUrl}/dropdown`, reqBodyData);
  }

  //subcategory

  public getSubCategoryData(): Observable<any> {
    return this.http.post(`${this.apiUrl}itemsubcategory/list`, {});
  }
  public postSubCategoryData(
    CODE: any,
    SUBCAT_NAME: any,
    CAT_ID: any,
    DEPT_ID: any
  ): Observable<any> {
    const data = { CODE, SUBCAT_NAME, CAT_ID, DEPT_ID };

    return this.http.post(`${this.apiUrl}itemsubcategory/save`, data);
  }
  removeSubCategory(id: any, code: any, subcatName: any, cat_id: any) {
    const requestBody = {
      CODE: code,
      SUBCAT_NAME: subcatName,
      CAT_ID: cat_id,
    };
    return this.http.post<any>(
      `${this.apiUrl}itemsubcategory/delete/` + id,
      requestBody
    );
  }
  //==============new update api--    subcategory

  Update_subcategory_api(item: any) {
    const payload = item;

    return this.http.post(`${this.apiUrl}itemsubcategory/save`, payload);
  }
  updateSubCategory(
    ID: any,
    CODE: any,
    SUBCAT_NAME: any,
    CAT_ID: any,
    DEPT_ID: any
  ): Observable<any> {
    const data = { ID, CODE, SUBCAT_NAME, CAT_ID, DEPT_ID };

    return this.http.post(`${this.apiUrl}itemsubcategory/save`, data);
  }

  //vatclass
  public getVatclassData(): Observable<any> {
    return this.http.post(`${this.apiUrl}vatclass/list`, {});
  }
  public postVatclassData(
    CODE: any,
    VAT_NAME: any,
    VAT_PERC: any
  ): Observable<any> {
    const data = { CODE, VAT_NAME, VAT_PERC };

    return this.http.post(`${this.apiUrl}vatclass/save`, data);
  }
  select_Vatclass_Data(id: any) {
    return this.http.post(`${this.apiUrl}vatclass/select/${id}`, {});
  }

  updateVatclass(
    ID: any,
    CODE: any,
    VAT_NAME: any,
    VAT_PERC: any
  ): Observable<any> {
    const data = { ID, CODE, VAT_NAME, VAT_PERC };

    return this.http.post(`${this.apiUrl}vatclass/save`, data);
  }
  removeVatclass(id: any, code: any, vatname: any, vatperc: any) {
    const requestBody = {
      CODE: code,
      VAT_NAME: vatname,
      VAT_PERC: vatperc,
    };
    return this.http.post<any>(
      `${this.apiUrl}vatclass/delete/` + id,
      requestBody
    );
  }

  //user
  public getUserData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/list`, {});
  }

  //paymentterms
  public getPaymentTermsData(): Observable<any> {
    return this.http.post(`${this.apiUrl}paymentterm/list`, {});
  }

  getpayment_term_Api() {
    const reqBody = {
      NAME: 'PAYMENTTERMS',
    };
    return this.http.post(`${this.apiUrl}dropdown`, reqBody);
  }
  public postPaymentTermsData(CODE: any, DESCRIPTION: any): Observable<any> {
    const data = { CODE, DESCRIPTION };

    return this.http.post(`${this.apiUrl}/paymentterm/save`, data);
  }
  removePaymentTerms(id: any, code: string, description: string) {
    const requestBody = {
      CODE: code,
      DESCRIPTION: description,
    };
    return this.http.post<any>(
      `${this.apiUrl}/paymentterm/delete/` + id,
      requestBody
    );
  }
  updatePaymentTerms(ID: any, CODE: any, DESCRIPTION: any): Observable<any> {
    const data = { ID, CODE, DESCRIPTION };

    return this.http.post(`${this.apiUrl}/paymentterm/save`, data);
  }

  //deliveryterms
  public getDeliveryTermsData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/deliveryterm/list`, {});
  }
  public postDeliveryTermsData(CODE: any, DESCRIPTION: any): Observable<any> {
    const data = { CODE, DESCRIPTION };

    return this.http.post(`${this.apiUrl}/deliveryterm/save`, data);
  }
  removeDeliveryTerms(id: any, code: string, description: string) {
    const requestBody = {
      CODE: code,
      DESCRIPTION: description,
    };
    return this.http.post<any>(
      `${this.apiUrl}/deliveryterm/delete/` + id,
      requestBody
    );
  }
  updateDeliveryTerms(ID: any, CODE: any, DESCRIPTION: any): Observable<any> {
    const data = { ID, CODE, DESCRIPTION };

    return this.http.post(`${this.apiUrl}/deliveryterm/save`, data);
  }

  //stores
  public getStoresData(): Observable<any> {
    return this.http.post(`${this.apiUrl}stores/list`, {});
  }
  public postStoresData(
    COMPANY_ID: any,
    CODE: any,
    STORE_NAME: any,
    IS_PRODUCTION: any,
    ADDRESS1: any,
    ADDRESS2: any,
    ADDRESS3: any,
    ZIP_CODE: any,
    STATE_ID: any,
    CITY: any,
    COUNTRY_ID: any,
    IS_DEFAULT_STORE: any,
    PHONE: any,
    EMAIL: any,
    VAT_REGNO: any,
    GROUP_ID: any,
    STORE_NO
  ): Observable<any> {
    const data = {
      COMPANY_ID,
      CODE,
      STORE_NAME,
      IS_PRODUCTION,
      ADDRESS1,
      ADDRESS2,
      ADDRESS3,
      ZIP_CODE,
      STATE_ID,
      CITY,
      COUNTRY_ID,
      IS_DEFAULT_STORE,
      PHONE,
      EMAIL,
      VAT_REGNO,
      GROUP_ID,
      STORE_NO,
    };

    return this.http.post(`${this.apiUrl}stores/save`, data);
  }
  removeStores(
    id: any,
    code: any,
    companyId: any,
    storeName: any,
    is_production: any,
    address1: any,
    address2: any,
    address3: any,
    zip_code: any,
    state_id: any,
    city: any,
    country_id: any,
    is_default: any,
    phone: any,
    email: any,
    vat_regno: any,
    group_id: any
  ) {
    const requestBody = {
      CODE: code,
      STORE_NAME: storeName,
      IS_PRODUCTION: is_production,
      ADDRESS1: address1,
      ADDRESS2: address2,
      ADDRESS3: address3,
      ZIP_CODE: zip_code,
      STATE_ID: state_id,
      CITY: city,
      COUNTRY_ID: country_id,
      IS_DEFAULT_STORE: is_default,
      PHONE: phone,
      EMAIL: email,
      VAT_REGNO: vat_regno,
      GROUP_ID: group_id,
    };
    return this.http.post<any>(
      `${this.apiUrl}stores/delete/` + id,
      requestBody
    );
  }
  updateStores(
    ID: any,
    COMPANY_ID: any,
    CODE: any,
    STORE_NAME: any,
    IS_PRODUCTION: any,
    ADDRESS1: any,
    ADDRESS2: any,
    ADDRESS3: any,
    ZIP_CODE: any,
    STATE_ID: any,
    CITY: any,
    COUNTRY_ID: any,
    IS_DEFAULT_STORE,
    PHONE: any,
    EMAIL: any,
    VAT_REGNO: any,
    GROUP_ID: any,
    STORE_NO: any
  ): Observable<any> {
    const data = {
      ID,
      COMPANY_ID,
      CODE,
      STORE_NAME,
      IS_PRODUCTION,
      ADDRESS1,
      ADDRESS2,
      ADDRESS3,
      ZIP_CODE,
      STATE_ID,
      CITY,
      COUNTRY_ID,
      IS_DEFAULT_STORE,
      PHONE,
      EMAIL,
      VAT_REGNO,
      GROUP_ID,
      STORE_NO,
    };

    return this.http.post(`${this.apiUrl}stores/save`, data);
  }

  getCountryWithFlag(): Observable<any> {
    return this.http.post(`${this.apiUrl}country/list`, {});
  }

  //supplier

  public getCurrencyDropdown(): Observable<any> {
    return this.http.post(`${this.apiUrl}dropdown`, { NAME: 'CURRENCY' });
  }

  public getSupplierData(): Observable<any> {
    return this.http.post(`${this.apiUrl}supplier/list`, {});
  }
  public postSupplierData(
    HQID: any,
    SUPP_CODE: any,
    SUPP_NAME: any,
    CONTACT_NAME: any,
    ADDRESS1: any,
    ADDRESS2: any,
    ADDRESS3: any,
    ZIP: any,
    STATE_ID: any,
    CITY: any,
    COUNTRY_ID: any,
    PHONE: any,
    EMAIL: any,
    IS_INACTIVE: any,
    MOBILE_NO: any,
    NOTES: any,
    FAX_NO: any,
    VAT_REGNO: any,
    CURRENCY_ID: any,
    PAY_TERM_ID: any,
    VAT_RULE_ID: any,
    IS_COMPANY_BRANCH: any,
    Supplier_cost: any
  ): Observable<any> {
    const data = {
      COMPANY_ID: this.selected_Company_id,
      HQID,
      SUPP_CODE,
      SUPP_NAME,
      CONTACT_NAME,
      ADDRESS1,
      ADDRESS2,
      ADDRESS3,
      ZIP,
      STATE_ID,
      CITY,
      COUNTRY_ID,
      PHONE,
      EMAIL,
      IS_INACTIVE,
      MOBILE_NO,
      NOTES,
      FAX_NO,
      VAT_REGNO,
      CURRENCY_ID,
      PAY_TERM_ID,
      VAT_RULE_ID,
      IS_COMPANY_BRANCH,
      Supplier_cost,
    };

    return this.http.post(`${this.apiUrl}supplier/save`, data);
  }

  saveSupplierData(item: any) {
    const payload = item;
    return this.http.post<any>(`${this.apiUrl}supplier/save`, payload);
  }

  updateSuppliers(id: number, supplier: object): Observable<any> {
    const payload = { id, ...supplier };
    return this.http.post<any>(`${this.apiUrl}supplier/save`, payload);
  }

  public updateSupplierData(
    ID: any,
    HQID: any,
    SUPP_CODE: any,
    SUPP_NAME: any,
    CONTACT_NAME: any,
    ADDRESS1: any,
    ADDRESS2: any,
    ADDRESS3: any,
    ZIP: any,
    STATE_ID: any,
    CITY: any,
    COUNTRY_ID: any,
    PHONE: any,
    EMAIL: any,
    IS_INACTIVE: any,
    MOBILE_NO: any,
    NOTES: any,
    FAX_NO: any,
    VAT_REGNO: any,
    CURRENCY_ID: any,
    PAY_TERM_ID: any,
    VAT_RULE_ID: any,
    IS_COMPANY_BRANCH: any,
    Supplier_cost: any
  ): Observable<any> {
    const data = {
      COMPANY_ID: this.selected_Company_id,
      ID,
      HQID,
      SUPP_CODE,
      SUPP_NAME,
      CONTACT_NAME,
      ADDRESS1,
      ADDRESS2,
      ADDRESS3,
      ZIP,
      STATE_ID,
      CITY,
      COUNTRY_ID,
      PHONE,
      EMAIL,
      IS_INACTIVE,
      MOBILE_NO,
      NOTES,
      FAX_NO,
      VAT_REGNO,
      CURRENCY_ID,
      PAY_TERM_ID,
      VAT_RULE_ID,
      Supplier_cost,
    };

    return this.http.post(`${this.apiUrl}supplier/save`, data);
  }

  selectSupplier(id: number): Observable<any> {
    const url = `${this.apiUrl}supplier/select/${id}`;
    return this.http.post<any>(url, {});
  }

  removeSupplier(
    id: any,
    code: any,
    supplierName: any,
    address1: any,
    address2: any,
    address3: any,
    zip: any,
    state_id: any,
    city: any,
    country_id: any,
    phone: any,
    email: any,
    mobile: any,
    notes: any,
    fax: any,
    vat_regno: any,
    currency_id: any,
    payterm_id: any,
    vatrule_id: any
  ) {
    const requestBody = {
      SUPP_CODE: code,
      SUPP_NAME: supplierName,
      ADDRESS1: address1,
      ADDRESS2: address2,
      ADDRESS3: address3,
      ZIP: zip,
      STATE_ID: state_id,
      CITY: city,
      COUNTRY_ID: country_id,
      PHONE: phone,
      EMAIL: email,
      MOBILE_NO: mobile,
      NOTES: notes,
      FAX_NO: fax,
      VAT_REGNO: vat_regno,
      CURRENCY_ID: currency_id,
      PAY_TERM_ID: payterm_id,
      VAT_RULE_ID: vatrule_id,
      COMPANY_ID: this.selected_Company_id,
    };
    return this.http.post<any>(
      `${this.apiUrl}supplier/delete/` + id,
      requestBody
    );
  }
  updateSupplier(data: any): Observable<any> {
    return this.http.post<any>(
      `
    ${this.apiUrl}supplier/save`,
      data
    );
  }

  //state
  public getStateData(): Observable<any> {
    return this.http.post(`${this.apiUrl}state/list`, {});
  }

  // getStateData_Api(item:any){
  //  const reqBody=item
  //   return this.http.post(`${this.apiUrl}dropdown`, reqBody);
  // }
  public postStateData(STATE_NAME: any, COUNTRY_ID: any): Observable<any> {
    const data = { STATE_NAME, COUNTRY_ID };

    return this.http.post(`${this.apiUrl}/state/save`, data);
  }
  removeState(id: any, stateName: any, countryId: any) {
    const requestBody = {
      STATE_NAME: stateName,
      COUNTRY_ID: countryId,
    };
    return this.http.post<any>(
      `${this.apiUrl}/state/delete/` + id,
      requestBody
    );
  }
  updateState(ID: any, STATE_NAME: any, COUNTRY_ID: any): Observable<any> {
    const data = { ID, STATE_NAME, COUNTRY_ID };

    return this.http.post(`${this.apiUrl}/state/save`, data);
  }

  //item-property1
  public getItemProperty1Data(): Observable<any> {
    return this.http.post(`${this.apiUrl}itemproperty1/list`, {});
  }

  select_item_property1(id: any) {
    return this.http.post(`${this.apiUrl}itemproperty1/select/${id}`, {});
  }
  public postItemProperty1Data(
    CODE: any,
    DESCRIPTION: any,
    COMPANY_ID: any
  ): Observable<any> {
    const data = { CODE, DESCRIPTION, COMPANY_ID };

    return this.http.post(`${this.apiUrl}itemproperty1/save`, data);
  }
  removeItemProperty1(
    id: any,
    code: string,
    description: string,
    companyId: string
  ) {
    const requestBody = {
      CODE: code,
      DESCRIPTION: description,
      COMPANY_ID: companyId,
    };
    return this.http.post<any>(
      `${this.apiUrl}itemproperty1/delete/` + id,
      requestBody
    );
  }
  updateItemProperty1(item: any) {
    const data = item;

    return this.http.post(`${this.apiUrl}itemproperty1/save`, data);
  }

  //item-property2
  public getItemProperty2Data(): Observable<any> {
    return this.http.post(`${this.apiUrl}itemproperty2/list`, {});
  }
  select_item_property2(id: any) {
    return this.http.post(`${this.apiUrl}itemproperty2/select/${id}`, {});
  }
  public postItemProperty2Data(
    CODE: any,
    DESCRIPTION: any,
    COMPANY_ID: any
  ): Observable<any> {
    const data = { CODE, DESCRIPTION, COMPANY_ID };

    return this.http.post(`${this.apiUrl}itemproperty2/save`, data);
  }
  removeItemProperty2(
    id: any,
    code: string,
    description: string,
    companyId: string
  ) {
    const requestBody = {
      CODE: code,
      DESCRIPTION: description,
      COMPANY_ID: companyId,
    };
    return this.http.post<any>(
      `${this.apiUrl}itemproperty2/delete/` + id,
      requestBody
    );
  }
  updateItemProperty2(item: any) {
    const data = item;

    return this.http.post(`${this.apiUrl}itemproperty2/save`, data);
  }

  //Item property 3
  public getItemProperty3Data(): Observable<any> {
    return this.http.post(`${this.apiUrl}itemproperty3/list`, {});
  }
  select_item_property3(id: any) {
    return this.http.post(`${this.apiUrl}itemproperty3/select/${id}`, {});
  }

  public insertItemProperty3Data(
    CODE: any,
    DESCRIPTION: any,
    COMPANY_ID: any
  ): Observable<any> {
    const data = { CODE, DESCRIPTION, COMPANY_ID };

    return this.http.post(`${this.apiUrl}itemproperty3/save`, data);
  }

  updateItemProperty3(item: any) {
    const data = item;

    return this.http.post(`${this.apiUrl}itemproperty3/save`, data);
  }

  removeItemProperty3(
    id: any,
    code: string,
    description: string,
    companyId: string
  ) {
    const requestBody = {
      CODE: code,
      DESCRIPTION: description,
      COMPANY_ID: companyId,
    };
    return this.http.post<any>(
      `${this.apiUrl}itemproperty3/delete/` + id,
      requestBody
    );
  }

  // Item property 4
  public getItemProperty4Data(): Observable<any> {
    return this.http.post(`${this.apiUrl}itemproperty4/list`, {});
  }
  select_item_property4(id: any) {
    return this.http.post(`${this.apiUrl}itemproperty4/select/${id}`, {});
  }
  public updateItemProperty4(item: any) {
    const data = item;

    return this.http.post(`${this.apiUrl}itemproperty4/save`, data);
  }

  insertItemProperty4Data(
    CODE: any,
    DESCRIPTION: any,
    COMPANY_ID: any
  ): Observable<any> {
    const data = { CODE, DESCRIPTION, COMPANY_ID };

    return this.http.post(`${this.apiUrl}itemproperty4/save`, data);
  }

  removeItemProperty4(
    id: any,
    code: string,
    description: string,
    companyId: string
  ) {
    const requestBody = {
      CODE: code,
      DESCRIPTION: description,
      COMPANY_ID: companyId,
    };
    return this.http.post<any>(
      `${this.apiUrl}itemproperty4/delete/` + id,
      requestBody
    );
  }

  updateItemProperty5(item: any) {
    const data = item;

    return this.http.post(`${this.apiUrl}itemproperty5/save`, data);
  }

  //Item property 5
  public getItemProperty5Data(): Observable<any> {
    return this.http.post(`${this.apiUrl}itemproperty5/list`, {});
  }

  select_item_property5(id: any) {
    return this.http.post(`${this.apiUrl}itemproperty5/select/${id}`, {});
  }
  public insertItemProperty5Data(
    CODE: any,
    DESCRIPTION: any,
    COMPANY_ID: any
  ): Observable<any> {
    const data = { CODE, DESCRIPTION, COMPANY_ID };

    return this.http.post(`${this.apiUrl}itemproperty5/save`, data);
  }

  removeItemProperty5(
    id: any,
    code: string,
    description: string,
    companyId: string
  ) {
    const requestBody = {
      CODE: code,
      DESCRIPTION: description,
      COMPANY_ID: companyId,
    };
    return this.http.post<any>(
      `${this.apiUrl}itemproperty5/delete/` + id,
      requestBody
    );
  }

  //salesman
  public getSalesmanData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/employees/list`, {});
  }
  public postSalesmanData(
    EMP_CODE: any,
    EMP_NAME: any,
    DOB: any,
    DOJ: any,
    IS_MALE: any,
    STORE_ID: any,
    ADDRESS1: any,
    ADDRESS2: any,
    ADDRESS3: any,
    CITY: any,
    MOBILE: any,
    EMAIL: any,
    IQAMA_NO: any,
    INCENTIVE_PERCENT: any
  ): Observable<any> {
    const data = {
      EMP_CODE,
      EMP_NAME,
      DOB,
      DOJ,
      IS_MALE,
      STORE_ID,
      ADDRESS1,
      ADDRESS2,
      ADDRESS3,
      CITY,
      MOBILE,
      EMAIL,
      IQAMA_NO,
      INCENTIVE_PERCENT,
    };

    return this.http.post(`${this.apiUrl}/employees/save`, data);
  }

  public updateSalesmanData(
    ID: any,
    EMP_CODE: any,
    EMP_NAME: any,
    DOB: any,
    DOJ: any,
    IS_MALE: any,
    STORE_ID: any,
    ADDRESS1: any,
    ADDRESS2: any,
    ADDRESS3: any,
    CITY: any,
    MOBILE: any,
    EMAIL: any,
    IQAMA_NO: any,
    INCENTIVE_PERCENT: any
  ): Observable<any> {
    const data = {
      ID,
      EMP_CODE,
      EMP_NAME,
      DOB,
      DOJ,
      IS_MALE,
      STORE_ID,
      ADDRESS1,
      ADDRESS2,
      ADDRESS3,
      CITY,
      MOBILE,
      EMAIL,
      IQAMA_NO,
      INCENTIVE_PERCENT,
    };

    return this.http.post(`${this.apiUrl}/employees/save`, data);
  }
  removeSalesman(
    id: any,
    code: any,
    name: any,
    dob: any,
    doj: any,
    store_id: any,
    address1: any,
    address2: any,
    address3: any,
    city: any,
    mobile: any,
    email: any,
    iqama: any,
    incentive: any
  ) {
    const requestBody = {
      EMP_CODE: code,
      EMP_NAME: name,
      DOB: dob,
      DOJ: doj,
      STORE_ID: store_id,
      ADDRESS1: address1,
      ADDRESS2: address2,
      ADDRESS3: address3,
      CITY: city,
      MOBILE: mobile,
      EMAIL: email,
      IQAMA_NO: iqama,
      INCENTIVE_PERCENT: incentive,
    };
    return this.http.post<any>(
      `${this.apiUrl}/employees/delete/` + id,
      requestBody
    );
  }
  updateSalesman(data: any): Observable<any> {
    return this.http.post<any>(
      `
    ${this.apiUrl}/employees/save`,
      data
    );
  }

  //customer
  public getCustomerData(): Observable<any> {
    return this.http.post(`${this.apiUrl}customer/list`, {});
  }
  Select_Customer_Api(ID: any) {
    const getEndpoint = `${this.apiUrl}customer/select/${ID}`;
    return this.http.post(getEndpoint, {});
  }
  //   public postCustomerData(
  // COMPANY_ID:any,
  //     CUST_CODE: any,
  //     FIRST_NAME: any,
  //     LAST_NAME: any,
  //     DOB: any,
  //     NATIONALITY: any,
  //     CONTACT_NAME: any,
  //     ADDRESS1: any,
  //     ADDRESS2: any,
  //     ADDRESS3: any,
  //     ZIP: any,
  //     STATE_ID: any,
  //     CITY: any,
  //     COUNTRY_ID: any,
  //     PHONE: any,
  //     MOBILE_NO: any,
  //     EMAIL: any,
  //     FAX_NO: any,
  //     CREDIT_LIMIT: any,
  //     CURRENT_CREDIT: any,
  //     PAY_TERM_ID: any,
  //     NOTES: any,
  //     PRICE_CLASS_ID: any,
  //     DISCOUNT_PERCENT: any,
  //     CUST_VAT_RULE_ID: any,
  //     VAT_REGNO: any
  //   ): Observable<any> {
  //     const data = {
  //       CUST_CODE,
  //       FIRST_NAME,
  //       LAST_NAME,
  //       DOB,
  //       NATIONALITY,
  //       CONTACT_NAME,
  //       ADDRESS1,
  //       ADDRESS2,
  //       ADDRESS3,
  //       ZIP,
  //       STATE_ID,
  //       CITY,
  //       COUNTRY_ID,
  //       PHONE,
  //       MOBILE_NO,
  //       EMAIL,
  //       FAX_NO,
  //       CREDIT_LIMIT,
  //       CURRENT_CREDIT,
  //       PAY_TERM_ID,
  //       NOTES,
  //       PRICE_CLASS_ID,
  //       DISCOUNT_PERCENT,
  //       CUST_VAT_RULE_ID,
  //       VAT_REGNO,
  //       COMPANY_ID
  //     };

  //     return this.http.post(`${this.apiUrl}customer/save`, data);
  //   }
  insert_customer_Data(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}customer/save`, payload);
  }

  UpdateCustomerApi(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}customer/update`, payload);
  }
  public updateCustomerData(
    ID: any,
    CUST_CODE: any,
    FIRST_NAME: any,
    LAST_NAME: any,
    DOB: any,
    NATIONALITY: any,
    CONTACT_NAME: any,
    ADDRESS1: any,
    ADDRESS2: any,
    ADDRESS3: any,
    ZIP: any,
    STATE_ID: any,
    CITY: any,
    COUNTRY_ID: any,
    PHONE: any,
    MOBILE_NO: any,
    EMAIL: any,
    FAX_NO: any,
    CREDIT_LIMIT: any,
    CURRENT_CREDIT: any,
    PAY_TERM_ID: any,
    NOTES: any,
    PRICE_CLASS_ID: any,
    DISCOUNT_PERCENT: any,
    VAT_RULE_ID: any,
    VAT_REGNO: any
  ): Observable<any> {
    const data = {
      ID,
      CUST_CODE,
      FIRST_NAME,
      LAST_NAME,
      DOB,
      NATIONALITY,
      CONTACT_NAME,
      ADDRESS1,
      ADDRESS2,
      ADDRESS3,
      ZIP,
      STATE_ID,
      CITY,
      COUNTRY_ID,
      PHONE,
      MOBILE_NO,
      EMAIL,
      FAX_NO,
      CREDIT_LIMIT,
      CURRENT_CREDIT,
      PAY_TERM_ID,
      NOTES,
      PRICE_CLASS_ID,
      DISCOUNT_PERCENT,
      VAT_RULE_ID,
      VAT_REGNO,
    };

    return this.http.post(`${this.apiUrl}customer/update`, data);
  }

  public removeCustomerData(
    ID: any,
    CUST_CODE: any,
    FIRST_NAME: any,
    LAST_NAME: any,
    DOB: any,
    NATIONALITY: any,
    CONTACT_NAME: any,
    ADDRESS1: any,
    ADDRESS2: any,
    ADDRESS3: any,
    ZIP: any,
    STATE_ID: any,
    CITY: any,
    COUNTRY_ID: any,
    PHONE: any,
    MOBILE_NO: any,
    EMAIL: any,
    FAX_NO: any,
    CREDIT_LIMIT: any,
    CURRENT_CREDIT: any,
    PAY_TERM_ID: any,
    NOTES: any,
    PRICE_CLASS_ID: any,
    DISCOUNT_PERCENT: any,
    VAT_RULE_ID: any,
    VAT_REGNO: any
  ) {
    const requestBody = {
      CUST_CODE: CUST_CODE,
      FIRST_NAME: FIRST_NAME,
      LAST_NAME: LAST_NAME,
      DOB: DOB,
      NATIONALITY: NATIONALITY,
      CONTACT_NAME: CONTACT_NAME,
      ADDRESS1: ADDRESS1,
      ADDRESS2: ADDRESS2,
      ADDRESS3: ADDRESS3,
      ZIP: ZIP,
      STATE_ID: STATE_ID,
      CITY: CITY,
      COUNTRY_ID: COUNTRY_ID,
      PHONE: PHONE,
      MOBILE_NO: MOBILE_NO,
      EMAIL: EMAIL,
      FAX_NO: FAX_NO,
      CREDIT_LIMIT: CREDIT_LIMIT,
      CURRENT_CREDIT: CURRENT_CREDIT,
      PAY_TERM_ID: PAY_TERM_ID,
      NOTES: NOTES,
      PRICE_CLASS_ID: PRICE_CLASS_ID,
      DISCOUNT_PERCENT: DISCOUNT_PERCENT,
      VAT_RULE_ID: VAT_RULE_ID,
      VAT_REGNO: VAT_REGNO,
    };
    return this.http.post<any>(
      `${this.apiUrl}customer/delete/` + ID,
      requestBody
    );
  }

  //landed cost
  public getLandedcostData(): Observable<any> {
    return this.http.post(`${this.apiUrl}landedcost/list`, {});
  }

  selectLandedCost(id: number): Observable<any> {
    const url = `${this.apiUrl}landedcost/select/${id}`;
    return this.http.post<any>(url, {});
  }

  public postLandedcostData(
    DESCRIPTION: any,
    IS_LOCAL_CURRENCY: any,
    IS_FIXED_AMOUNT: any,
    VALUE: any,
    COMPANY_ID: any,
    IS_INACTIVE: any
  ): Observable<any> {
    const data = {
      DESCRIPTION,
      IS_LOCAL_CURRENCY,
      IS_FIXED_AMOUNT,
      VALUE,
      COMPANY_ID,
      IS_INACTIVE,
    };

    return this.http.post(`${this.apiUrl}landedcost/save`, data);
  }

  public updateLandedcostData(
    ID: any,
    DESCRIPTION: any,
    IS_LOCAL_CURRENCY: any,
    IS_FIXED_AMOUNT: any,
    VALUE: any,
    COMPANY_ID: any,
    IS_INACTIVE: any
  ): Observable<any> {
    const data = {
      ID,
      DESCRIPTION,
      IS_LOCAL_CURRENCY,
      IS_FIXED_AMOUNT,
      VALUE,
      COMPANY_ID,
      IS_INACTIVE,
    };

    return this.http.post(`${this.apiUrl}landedcost/save`, data);
  }
  removeLandedcost(
    id: any,
    description: any,
    is_local: any,
    is_amount: any,
    value: any,
    companyid: any,
    is_inactive: any
  ) {
    const requestBody = {
      DESCRIPTION: description,
      IS_LOCAL_CURRENCY: is_local,
      IS_FIXED_AMOUNT: is_amount,
      VALUE: value,
      COMPANY_ID: companyid,
      IS_INACTIVE: is_inactive,
    };
    return this.http.post<any>(
      `${this.apiUrl}landedcost/delete/` + id,
      requestBody
    );
  }

  //tenders
  public getTendersData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/tender/list`, {});
  }
  public postTendersData(
    CODE: any,
    IS_INACTIVE: any,
    DESCRIPTION: any,
    ARABIC_DESCRIPTION: any,
    TENDER_TYPE: any,
    DISPLAY_ORDER: any,
    CURRENCY_ID,
    ALLOW_OPENING: any,
    ALLOW_DECLARATION: any,
    ADDITIONAL_INFO_REQUIRED: any
  ): Observable<any> {
    const data = {
      CODE,
      IS_INACTIVE,
      DESCRIPTION,
      ARABIC_DESCRIPTION,
      TENDER_TYPE,
      DISPLAY_ORDER,
      CURRENCY_ID,
      ALLOW_OPENING,
      ALLOW_DECLARATION,
      ADDITIONAL_INFO_REQUIRED,
    };

    return this.http.post(`${this.apiUrl}/tender/save`, data);
  }

  removeTenders(
    id: any,
    code: any,
    is_inactive: any,
    description: any,
    arabic_description: any,
    tender_type: any,
    display_order: any,
    currencyid: any,
    allow_opening: any,
    allow_declaration: any,
    additional_info: any
  ) {
    const requestBody = {
      CODE: code,
      IS_INACTIVE: is_inactive,
      DESCRIPTION: description,
      ARABIC_DESCRIPTION: arabic_description,
      TENDER_TYPE: tender_type,
      DISPLAY_ORDER: display_order,
      CURRENCY_ID: currencyid,
      ALLOW_OPENING: allow_opening,
      ALLOW_DECLARATION: allow_declaration,
      ADDITIONAL_INFO_REQUIRED: additional_info,
    };
    return this.http.post<any>(
      `${this.apiUrl}/tender/delete/` + id,
      requestBody
    );
  }
  updateTenders(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tender/save`, data);
  }

  //reasons
  public getReasonsData(): Observable<any> {
    return this.http.post(`${this.apiUrl}reasons`, {});
  }
  //reasons
  public select_reason(id: any): Observable<any> {
    return this.http.post(`${this.apiUrl}reasons/select/${id}`, {});
  }
  public Update_reason(item: any): Observable<any> {
    const payload = item;
    return this.http.post(`${this.apiUrl}reasons/update`, payload);
  }
  public postReasonData(
    CODE: any,
    DESCRIPTION: any,
    ARABIC_DESCRIPTION: any,
    START_DATE: any,
    END_DATE: any,
    REASON_TYPE: any,
    DISCOUNT_TYPE: any,
    AC_HEAD_ID: any,
    DISCOUNT_PERCENT: any,
    REASON_STORES: any,
    COMPANY_ID: any
  ): Observable<any> {
    const data = {
      CODE,
      DESCRIPTION,
      ARABIC_DESCRIPTION,
      START_DATE,
      END_DATE,
      REASON_TYPE,
      DISCOUNT_TYPE,
      AC_HEAD_ID,
      DISCOUNT_PERCENT,
      REASON_STORES,
      COMPANY_ID,
    };

    return this.http.post(`${this.apiUrl}reasons/insert`, data);
  }
  removeReasons(
    id: any,
    code: any,
    description: any,
    arabic_description: any,
    startDate: any,
    endDate: any,
    reasonType: any,
    discountType: any,
    discountPercent: any,
    reasonStores: any
  ) {
    const requestBody = {
      CODE: code,
      DESCRIPTION: description,
      ARABIC_DESCRIPTION: arabic_description,
      START_DATE: startDate,
      END_DATE: endDate,
      REASON_TYPE: reasonType,
      DISCOUNT_TYPE: discountType,
      DISCOUNT_PERCENT: discountPercent,
      REASON_STORES: reasonStores,
    };
    return this.http.get<any>(`${this.apiUrl}reasons/delete/` + id);
  }

  //items
  getItemsData(DateRange: any): any {
    const payload = DateRange;
    return this.http.post(`${this.apiUrl}items/list`, payload);
  }

  public postItems(items: any) {
    const data = items;
    // console.log(data,"insert service")
    return this.http.post(`${this.apiUrl}items/insert`, data);
  }

  removeItems(id: number, data: object) {
    return this.http.post<any>(`${this.apiUrl}items/delete/` + id, data);
  }

  selectItems(id: any) {
    return this.http.post(`${this.apiUrl}items/select/${id}`, {});
  }

  private cleanData(data: any): any {
    const cleanedData = { ...data };
    cleanedData.CREATED_DATE = cleanedData.CREATED_DATE ?? '';
    return cleanedData;
  }

  updateItems(id: number, items: object): Observable<any> {
    const payload = { id, ...items };
    console.log('Payload being sent to backend:', payload);
    return this.http.post<any>(`${this.apiUrl}items/update`, payload);
  }

  getCountryWithFlags(): Observable<any> {
    return this.http.post(`${this.apiUrl}country/list`, {});
  }

  getData(rowCount, columnCount) {
    const items = [];
    for (let i = 0; i < rowCount; i++) {
      const item = {};
      for (let j = 0; j < columnCount; j++) {
        item[`field${j + 1}`] = `${i + 1}-${j + 1}`;
      }
      items.push(item);
    }
    return items;
  }

  //---------------------------UOM----------------------------------------------------

  getUomList(): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {}; // Replace with your actual body if needed

    return this.http.post<any>(`${this.apiUrl}/uom/list`, body, { headers });
  }

  postUOM(uom: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { UOM: uom };
    return this.http.post<any>(`${this.apiUrl}/uom/insert`, body, { headers });
  }

  updateUom(ID: any, UOM: any): Observable<any> {
    const data = { ID, UOM };

    return this.http.post(`${this.apiUrl}/uom/update`, data);
  }

  removeUom(id: any, UOM: any) {
    const requestBody = {
      UOM: UOM,
    };
    return this.http.post<any>(`${this.apiUrl}/uom/delete/` + id, requestBody);
  }

  //------------------------------Packing........................................................................

  getPackingList(): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = {}; // Replace with your actual body if needed

    return this.http.post<any>(`${this.apiUrl}/packing/list`, body, {
      headers,
    });
  }

  postPacking(DESCRIPTION: any, NO_OF_UNITS: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { DESCRIPTION: DESCRIPTION, NO_OF_UNITS };
    return this.http.post<any>(`${this.apiUrl}/packing/insert`, body, {
      headers,
    });
  }

  updatePacking(ID: any, DESCRIPTION: any, NO_OF_UNITS: any): Observable<any> {
    const data = { ID, DESCRIPTION, NO_OF_UNITS };

    return this.http.post(`${this.apiUrl}/packing/update`, data);
  }

  removePacking(id: any, DESCRIPTION: any, NO_OF_UNITS: any) {
    const requestBody = {
      DESCRIPTION: DESCRIPTION,
      NO_OF_UNITS: NO_OF_UNITS,
    };
    return this.http.post<any>(
      `${this.apiUrl}/packing/delete/` + id,
      requestBody
    );
  }

  //dropdown
  public getDropdownData(type: any): Observable<any> {
    const reqBodyData = { name: type };
    return this.http.post(`${this.apiUrl}dropdown/`, reqBodyData);
  }

  public getStateDropdownData(payload: {
    NAME: string;
    COUNTRY_ID: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}dropdown/`, payload);
  }

  //------------------- denials Type Dropdown Fetching -----------
  get_Denial_Dropdown_Data(type: any) {
    const url = 'http://103.180.120.134/projectx/api/dropdown/List';
    const reqBodyData = { name: type };
    // const token = 'YXplbnQ6UEBwcmQuMQ=='; // Assuming this is a base64 encoded token
    // const headers = new HttpHeaders({
    //   Authorization: `Basic ${token}`,
    //   'Content-Type': 'application/json',
    // });
    // const options = { headers: headers };
    return this.http.post(url, reqBodyData);
  }

  //====================Add Denials========================
  addDenial(CODE: any, DESCRIPTION: any, TYPE_ID: any, CATEGORY_ID: any) {
    const DenialAddData = { CODE, DESCRIPTION, TYPE_ID, CATEGORY_ID };
    return this.http.post(
      'http://projectxapi.diligenzit.com/api/DenialMaster/insert',
      DenialAddData
    );
  }

  //------------update Denial--------------------------
  updateDenial(
    ID: any,
    CODE: any,
    DESCRIPTION: any,
    TYPE_ID: any,
    CATEGORY_ID: any
  ) {
    const DenialUpdateData = { ID, CODE, DESCRIPTION, TYPE_ID, CATEGORY_ID };
    return this.http.post(
      'http://103.180.120.134/projectx/api/DenialMaster/Update',
      DenialUpdateData
    );
  }

  //================REmove Denial=========================
  removeDenial(id: any) {
    return this.http.get(
      'http://103.180.120.134/projectx/api/DenialMaster/delete/' + id
    );
  }

  public getContacts = () =>
    this.http.get<Contact[]>(`${API_URL}/Users/Contacts`);

  public getContact = (id: number) =>
    this.http.get<Contact>(`${API_URL}/Users/Contacts/${id}`);

  public getTasks = (): Observable<Task[]> =>
    this.http.get<Task[]>(`${API_URL}/Employees/AllTasks`);

  public getFilteredTasks = (): Observable<Task[]> =>
    this.http.get<Task[]>(`${API_URL}/Employees/FilteredTasks`);

  public getTask = (id: number): Observable<Task> =>
    this.http.get<Task>(`${API_URL}/Employees/Tasks/${id}`);

  public getContactNotes = (id: number) =>
    this.http.get(`${API_URL}/Users/Contacts/${id}/Notes`);

  public getContactMessages = (id: number) =>
    this.http.get(`${API_URL}/Users/Contacts/${id}/Messages`);

  public getActiveContactOpportunities = (id: number) =>
    this.getContactOpportunities(id, true);

  public getClosedContactOpportunities = (id: number) =>
    this.getContactOpportunities(id, false);

  public getContactOpportunities = (id: number, isActive: boolean) =>
    this.http
      .get<any>(`${API_URL}/Users/Contacts/${id}/Opportunities`)
      .pipe
      // map((data) =>
      //   // data.filter((_: any, index: number) => {
      //   //   const isEven = index % 2 === 0;
      //   //   return isActive ? isEven : !isEven;
      //   // })
      // );
      ();

  public getSalesByStateAndCity = (startDate: string, endDate: string) =>
    this.http.get(
      `${API_URL}/Analytics/SalesByStateAndCity/${startDate}/${endDate}`
    );

  public getSalesByState = (data) => {
    let dataByState;
    from(data)
      .pipe(
        groupBy((s: any) => s.stateName),
        mergeMap((group) => group.pipe(toArray())),
        map((val) => {
          let total = 0;
          let percentage = 0;
          // val.forEach((v) => {
          //   total = total + v.total;
          //   percentage = percentage + v.percentage;
          // });

          return {
            stateName: val[0].stateName,
            stateCoords: val[0].stateCoords,
            total,
            percentage,
          };
        }),
        toArray()
      )
      .subscribe((data) => {
        dataByState = data;
      });

    return dataByState;
  };

  public getOpportunitiesByCategory = (startDate: string, endDate: string) =>
    this.http.get<SalesOrOpportunitiesByCategory>(
      `${API_URL}/Analytics/OpportunitiesByCategory/${startDate}/${endDate}`
    );

  public getSalesByCategory = (startDate: string, endDate: string) =>
    this.http.get<SalesOrOpportunitiesByCategory>(
      `${API_URL}/Analytics/SalesByCategory/${startDate}/${endDate}`
    );

  public getSalesByOrderDate = (groupByPeriod: string) =>
    this.http.get<Sale[]>(
      `${API_URL}/Analytics/SalesByOrderDate/${groupByPeriod}`
    );

  public getSales = (startDate: string, endDate: string) =>
    this.http.get<Sale[]>(`${API_URL}/Analytics/Sales/${startDate}/${endDate}`);

  public getProfile = (id: number) =>
    this.http.get<Record<string, any>>(`${API_URL}/Users/Contacts/${id}`).pipe(
      map((data) => {
        // data.gender = id == 22 ? 'female' : null;
        // data.birthDate = new Date('1980/05/03');
        // data.hiredDate = new Date('2023/03/03');
        // data.department = 'UI/UX';
        // data.position = 'Designer';
        // data.domainUsername = 'corp\\amelia.harper';
        // data.country = 'USA';
        // data.city = 'New York';
        // data.state = 'New York';
        // data.address = '405 E 42nd St';
        // data.supervisor = 'Sam Adamson';
        // return data;
      })
    );

  public getListDS = () =>
    from([
      [
        {
          key: 'id',
          items: ['Brett Johnson', 'Tasks', 'Reminder', 'Contacts']
            .map((text) => ({ list: 'My Calendars', text }))
            .concat({ list: 'Other Calendars', text: 'Holidays' }),
        },
      ],
    ]);

  public getDefaultListDS = () =>
    from([
      [
        {
          key: 'My Calendars',
          items: [
            {
              id: 0,
              text: 'Brett Johnson',
              color: '#B3E5FC',
              checkboxColor: '#29B6F6',
            },
            {
              id: 1,
              text: 'Tasks',
              color: '#C8E6C9',
              checkboxColor: '#66BB6A',
            },
            {
              id: 2,
              text: 'Reminder',
              color: '#FFCDD2',
              checkboxColor: '#EF5350',
            },
            {
              id: 3,
              text: 'Contacts',
              color: '#FFE0B2',
              checkboxColor: '#FFA726',
            },
          ],
        },
        {
          key: 'Other Calendars',
          items: [
            {
              id: 4,
              text: 'Holidays',
              color: '#F3E5F5',
              checkboxColor: '#AB47BC',
            },
          ],
        },
      ],
    ]);

  public getAppointmentsDefaultTime = (index) =>
    [
      {
        weekDay: 0,
        weekIndex: 0,
        defaultTime: {
          hours: 7,
          minutes: 30,
        },
      },
      {
        weekDay: 1,
        weekIndex: 0,
        defaultTime: {
          hours: 10,
        },
      },
      {
        weekDay: 2,
        weekIndex: 0,
        defaultTime: {
          hours: 8,
          minutes: 30,
        },
      },
      {
        weekDay: 3,
        weekIndex: 0,
        defaultTime: {
          hours: 7,
        },
      },
      {
        weekDay: 0,
        weekIndex: 1,
        defaultTime: {
          hours: 9,
        },
      },
      {
        weekDay: 1,
        weekIndex: 1,
        defaultTime: {
          hours: 7,
        },
      },
      {
        weekDay: 2,
        weekIndex: 1,
        defaultTime: {
          hours: 8,
          minutes: 30,
        },
      },
      {
        weekDay: 3,
        weekIndex: 1,
        defaultTime: {
          hours: 9,
          minutes: 30,
        },
      },
      {
        weekDay: 1,
        weekIndex: 2,
        defaultTime: {
          hours: 8,
          minutes: 20,
        },
      },
      {
        weekDay: 2,
        weekIndex: 2,
        defaultTime: {
          hours: 9,
          minutes: 40,
        },
      },
      {
        weekDay: 3,
        weekIndex: 2,
        defaultTime: {
          hours: 8,
          minutes: 30,
        },
      },
    ][index];

  public getSchedulerTasks = () => {
    const promptDescription = `The HtmlEditor component is a client-side WYSIWYG text editor.
The editor allows users to format text and integrate media elements into documents.
The result can be exported to HTML or Markdown.`;

    return this.getTasks().pipe(
      map((tasks) => {
        const today = DateTime.now();
        const mondayMidnight = today.set({
          weekday: 1,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        });
        // const uniqueTasks = tasks.slice(0, 11);

        // return uniqueTasks.map((task, index) => {
        //   const { weekDay, weekIndex, defaultTime } =
        //     this.getAppointmentsDefaultTime(index);
        //   const taskStart = mondayMidnight
        //     .plus({
        //       weeks: weekIndex,
        //       days: weekDay,
        //     })
        //     .plus(defaultTime);
        //   return {
        //     ...task,
        //     startDate: taskStart.toJSDate(),
        //     endDate: taskStart.plus({ hours: 3 }).toJSDate(),
        //     description: promptDescription,
        //     calendarId: weekDay,
        //   };
        // });
      })
    );
  };

  //item-store-wizard
  getItemsByStoreId(storeId: number): Observable<any> {
    const payload = {
      STORE_ID: storeId,
    };

    return this.http.post<any>(`${this.apiUrl}/itemvizard/list`, payload);
  }

  getItemsList(params: {
    MASTER_TYPE: string;
    MASTER_VALUE: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/items/list`, params);
  }

  // pushItemToStore(payloads: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/itemvizard/insert`, payloads);
  // }

  pushItemToStore(payloads: ItemStorePayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/itemvizard/insert`, payloads);
  }

  //import

  public getTemplateColumnData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/importColumn/list`, {});
  }
  updateImportTemplateData(data: object): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/importtemplate/update`, data);
  }
  saveImportedData(items: Object): Observable<any> {
    const data = items;

    return this.http.post(`${this.apiUrl}/importitemlog/insert`, data);
  }
  selectImportTemplateData(id: number) {
    return this.http.post<any>(
      `${this.apiUrl}/importtemplate/select/` + id,
      {}
    );
  }
  public getImportTemplateData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/importtemplate/list`, {});
  }
  public viewImportedData(data: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/importitemlog/ItemLogEntryList/`,
      data
    );
  }
  public getImportLogData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/importitemlog/list`, {});
  }
  public postImportTemplate(items: Object): Observable<any> {
    const data = items;

    return this.http.post(`${this.apiUrl}/importtemplate/insert`, data);
  }
  removeImportTemplateData(id: number, data: object) {
    return this.http.post<any>(
      `${this.apiUrl}/importtemplate/delete/ + id`,
      data
    );
  }

  //Promotion Schema
  getPromotionSchemaLog(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/promotionschema/list`, {});
  }

  savePromotionSchema(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/promotionschema/insert`,
      payload
    );
  }

  selectPromotionSchema(id: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/promotionschema/select/${id}`,
      {}
    );
  }

  updatePromotionSchema(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/promotionschema/update`,
      payload
    );
  }

  // deleteWorksheet(id: number): Observable<any> {
  //   return this.http.post(`${this.apiUrlForDelete}/${id}`,{});
  // }

  deletePromotion(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/promotionschema/delete/${id}`, {});
  }

  //promotion log

  PromotionLogList(): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/worksheetitemproperty/Promotionlist`,
      {}
    );
  }

  savePromotion(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/worksheetitemproperty/insertpromotion`,
      payload
    );
  }

  selectPromotionWorksheet(id: number): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/worksheetitemproperty/selectpromotion/${id}`,
      {}
    );
  }

  updatePromotion(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/worksheetitemproperty/updatepromotion`,
      payload
    );
  }

  verifyPromotion(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/worksheetitemproperty/Verifypromotion`,
      payload
    );
  }

  approvePromotion(payload: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/worksheetitemproperty/approvepromotion`,
      payload
    );
  }

  delete(id: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/worksheetitemproperty/deletepromotion/${id}`,
      {}
    );
  }

  getStockView(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/stock/reportcoloumn`, payload);
  }

  exportDataGrid(e: any, fileName: string) {
    if (e.format === 'pdf') {
      console.log('PDF export triggered');
      const doc = new jsPDF(); // Initialize jsPDF
      exportDataGridToPdf({
        jsPDFDocument: doc,
        component: e.component,
      }).then(() => {
        doc.save(`${fileName}.pdf`); // Save the PDF file
      });
      e.cancel = true; // Cancel default behavior
    } else {
      const workbook = new Workbook(); // Initialize Excel workbook
      const worksheet = workbook.addWorksheet(fileName); // Create a worksheet
      exportDataGridToXLSX({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(
            new Blob([buffer], { type: 'application/octet-stream' }),
            `${fileName}.xlsx` // Save the Excel file
          );
        });
      });
      e.cancel = true; // Cancel default behavior
    }
  }

  public getSupplierItemsData(value: any): Observable<any> {
    const reqBodyData = { SUPP_ID: value };
    return this.http.post(
      `${this.apiUrl}purchaseorder/supplierlist`,
      reqBodyData
    );
  }

  public getPurchaseOrderList(): Observable<any> {
    return this.http.post(`${this.apiUrl}purchaseorder/list`, {});
  }

  savePoData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}purchaseorder/insert`, data);
  }

  public getLast5PoItemsList(value: any): Observable<any> {
    const reqBodyData = { ITEM_ID: value };
    return this.http.post(`${this.apiUrl}purchaseorder/itemlist`, reqBodyData);
  }

  selectPoData(id: number) {
    return this.http.post<any>(`${this.apiUrl}purchaseorder/select/` + id, {});
  }

  updatePoData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}purchaseorder/update`, data);
  }
  verifyPoData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}purchaseorder/verify`, data);
  }
  ApprovePoData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}purchaseorder/approval`, data);
  }
  //
  getPoNo(): Observable<any> {
    return this.http.post(`${this.apiUrl}PurchaseOrder/pono`, {});
  }

  DeletePoData(id: number) {
    return this.http.post<any>(`${this.apiUrl}PurchaseOrder/delete/` + id, {});
  }

  public getPurchaseOrderHistoryList(): Observable<any> {
    return this.http.post(`${this.apiUrl}PurchaseOrder/getpohis`, {});
  }

  public getAttachmentList(id: any, type: any): Observable<any> {
    const reqBodyData = { DOC_ID: id, DOC_TYPE: type };
    return this.http.post(`${this.apiUrl}attachment/list`, reqBodyData);
  }
  saveAttachmentData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}attachment/insert`, data);
  }

  //menu component api call to fetch user rights
  public getUserRightList(id: any, name: any): Observable<any> {
    const reqBodyData = { LEVEL_ID: id, COMPONENT_NAME: name };
    return this.http.post(`${this.apiUrl}/users/rightsaccess`, reqBodyData);
  }

  public geDocumentTemplateList(): Observable<any> {
    return this.http.post(`${this.apiUrl}reporttemplate/list`, {});
  }
  saveDocumentDefaultTemplate(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}reporttemplate/default`, data);
  }

  public getTemplateList(id: any): Observable<any> {
    const reqBodyData = { DOC_TYPE_ID: id };
    return this.http.post(
      `${this.apiUrl}reporttemplate/templatelist`,
      reqBodyData
    );
  }

  public getGrnPoDetails(id: any): Observable<any> {
    const reqBodyData = { PO_ID: id };
    return this.http.post(`${this.apiUrl}grn/polist`, reqBodyData);
  }

  public getPendingPo(storeid: any, supplierId: any): Observable<any> {
    const reqBodyData = { STORE_ID: storeid, SUPP_ID: supplierId };
    return this.http.post(`${this.apiUrl}grn/pendingpo`, reqBodyData);
  }

  saveGrnData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}grn/insert`, data);
  }

  public getGrnLogData(): Observable<any> {
    return this.http.post(`${this.apiUrl}grn/list`, {});
  }

  selectGrnData(id: number) {
    return this.http.post<any>(`${this.apiUrl}grn/select/` + id, {});
  }

  updateGrnData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}grn/update`, data);
  }

  verifyGrnData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}grn/verify`, data);
  }

  approveGrnData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}grn/approve`, data);
  }

  deleteGrnData(id: number) {
    return this.http.post<any>(`${this.apiUrl}grn/delete/` + id, {});
  }

  public getPendingGrn(supplierid: any): Observable<any> {
    const reqBodyData = { SUPP_ID: supplierid };
    return this.http.post(`${this.apiUrl}purchasereturn/GrnList`, reqBodyData);
  }

  public getReturnGrnData(id: any): Observable<any> {
    const reqBodyData = { GRN_ID: id };
    return this.http.post(`${this.apiUrl}purchasereturn/GrnData`, reqBodyData);
  }

  saveReturnData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}purchasereturn/insert`, data);
  }

  public getReturnLogData(): Observable<any> {
    return this.http.post(`${this.apiUrl}purchasereturn/list`, {});
  }

  selectReturnData(id: number) {
    return this.http.post<any>(`${this.apiUrl}purchasereturn/select/` + id, {});
  }

  updateReturnData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}/purchasereturn/update`, data);
  }

  verifyReturnData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}/purchasereturn/verify`, data);
  }

  approveReturnData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}/purchasereturn/approve`, data);
  }

  //transfer-out
  public getTransferOutGetStoreItems(id: any): Observable<any> {
    const reqBodyData = { STORE_ID: id };
    return this.http.post(`${this.apiUrl}/tranferout/ItemList`, reqBodyData);
  }

  public getTransferOutLogData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/tranferout/list`, {});
  }

  saveTransferOutData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}/tranferout/Insert`, data);
  }

  selectTransferOutData(id: number) {
    return this.http.post<any>(`${this.apiUrl}/tranferout/select/` + id, {});
  }

  updateTransferOutData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}/tranferout/update`, data);
  }

  verifyTransferOutData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}/tranferout/verify`, data);
  }

  approveTransferOutData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}/tranferout/approve`, data);
  }

  //transfer in

  public getPendingTransferOutList(
    dest_store_id: any,
    storeid: any
  ): Observable<any> {
    const reqBodyData = { STORE_ID: storeid, DEST_STORE_ID: dest_store_id };
    return this.http.post(`${this.apiUrl}/tranferout/pendinglist`, reqBodyData);
  }

  saveTransferInData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}/tranferIn/Insert`, data);
  }

  public getTransferInLogList(
    storeid: any,
    datefrom: any,
    dateto: any
  ): Observable<any> {
    const reqBodyData = {
      StoreID: storeid,
      DateFrom: datefrom,
      DateTo: dateto,
    };
    return this.http.post(`${this.apiUrl}/tranferIn/list`, reqBodyData);
  }

  public selectTransferInData(id: any, storeid: any): Observable<any> {
    const reqBodyData = {
      STORE_ID: storeid,
      ID: id,
    };
    return this.http.post(`${this.apiUrl}/tranferIn/select`, reqBodyData);
  }

  updateTransferInData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}/tranferIn/update`, data);
  }

  verifyTransferInData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}/tranferIn/verify`, data);
  }

  approveTransferInData(items: Object): Observable<any> {
    const data = items;
    return this.http.post(`${this.apiUrl}/tranferIn/approve`, data);
  }
  //inter-store-transfer-list
  public getInterStoreTransferList(
    userid: any,
    datafrom: any,
    dateto: any
  ): Observable<any> {
    const reqBodyData = {
      UserID: userid,
      DateFrom: datafrom,
      DateTo: dateto,
    };
    return this.http.post(
      `${this.apiUrl}/tranferout/transferreport`,
      reqBodyData
    );
  }

  //---------------HR Masters-----------------

  get_Department_List() {
    const getEndpoint = this.apiUrl + '/Department/list';
    return this.http.post(getEndpoint, {});
  }

  //===============Add Api=========================
  Insert_Department_Api(CODE: any, DEPT_NAME: any, IS_ACTIVE: boolean) {
    const getEndpoint = this.apiUrl + '/Department/save';
    const reqBody = {
      CODE: CODE,
      DEPT_NAME: DEPT_NAME,
      IS_ACTIVE: IS_ACTIVE,
    };
    return this.http.post(getEndpoint, reqBody);
  }

  //==============Update Api==============================
  Update_Department_Api(ID: any, CODE: any, DEPT_NAME: any, IS_ACTIVE: any) {
    const getEndpoint = this.apiUrl + '/Department/edit';
    const reqBody = {
      ID: ID,
      CODE: CODE,
      DEPT_NAME: DEPT_NAME,
      IS_ACTIVE: IS_ACTIVE,
    };

    return this.http.post(getEndpoint, reqBody);
  }

  Select_Department_Api(ID: any) {
    const getEndpoint = this.apiUrl + `/Department/select/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  Delete_Department_Api(ID: any) {
    const getEndpoint = this.apiUrl + `/Department/delete/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  //===========DESIGNATION===================
  //=======get Api==================
  get_Designation_List() {
    const getEndpoint = this.apiUrl + '/Designation/list';
    return this.http.post(getEndpoint, {});
  }

  //===============Add Api=========================
  Insert_Designation_Api(CODE: any, DESG_NAME: any, IS_INACTIVE: boolean) {
    const getEndpoint = this.apiUrl + '/Designation/save';
    const reqBody = {
      CODE: CODE,
      DESG_NAME: DESG_NAME,
      IS_INACTIVE: IS_INACTIVE,
    };
    return this.http.post(getEndpoint, reqBody);
  }

  //==============Update Api==============================
  Update_Designation_Api(ID: any, CODE: any, DESG_NAME: any, IS_INACTIVE: any) {
    const getEndpoint = this.apiUrl + '/Designation/edit';
    const reqBody = {
      ID: ID,
      CODE: CODE,
      DESG_NAME: DESG_NAME,
      IS_INACTIVE: IS_INACTIVE,
    };

    return this.http.post(getEndpoint, reqBody);
  }

  //===========Select Api=================
  Select_Designation_Api(ID: any) {
    const getEndpoint = this.apiUrl + `/Designation/select/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  //===========delete Api==================
  Delete_Designation_Api(ID: any) {
    const getEndpoint = this.apiUrl + `/Designation/delete/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  //==========EOS==============
  //=======================get APi================
  get_EOS_List() {
    const getEndpoint = this.apiUrl + '/EOS/list';
    return this.http.post(getEndpoint, {});
  }

  //===============Add Api=========================
  Insert_EOS_Api(
    CODE: any,
    DESCRIPTION: any,
    IS_INACTIVE: boolean,
    COMPANY_ID: number
  ) {
    const getEndpoint = this.apiUrl + '/EOS/save';
    const reqBody = {
      CODE: CODE,
      DESCRIPTION: DESCRIPTION,
      IS_INACTIVE: IS_INACTIVE,
      COMPANY_ID: COMPANY_ID,
    };
    return this.http.post(getEndpoint, reqBody);
  }

  //==============Update Api==============================

  Update_EOS_Api(
    CODE: any,
    DESCRIPTION: any,
    IS_INACTIVE: any,
    ID: any,
    COMPANY_ID: number
  ) {
    const getEndpoint = this.apiUrl + '/EOS/edit';
    const reqBody = {
      CODE: CODE,
      DESCRIPTION: DESCRIPTION,
      IS_INACTIVE: IS_INACTIVE,
      ID: ID,
      COMPANY_ID: COMPANY_ID,
    };

    return this.http.post(getEndpoint, reqBody);
  }

  //===========Select Api=================

  Select_EOS_Api(ID: any) {
    const getEndpoint = this.apiUrl + `/EOS/select/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  //===========delete Api==================
  Delete_EOS_Api(ID: any) {
    const getEndpoint = this.apiUrl + `/EOS/delete/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  //========================Pay settings============================
  get_PaySettingsList() {
    const getEndpoint = this.apiUrl + '/PaySettings/get';
    return this.http.post(getEndpoint, {});
  }

  //=================get Leadger Dropdown ===================
  get_Ledger_Api(ACCOUNT_HEAD: any) {
    const getEndpoint = this.apiUrl + '/DropDown';
    const reqBody = {
      NAME: 'ACCOUNT_HEAD',
      // "ACCOUNT_HEAD": ACCOUNT_HEAD
    };
    return this.http.post(getEndpoint, reqBody);
  }

  //================Api for Update PaySettings=================
  Update_PaySettings_Api(
    Daily_Hours: any,
    Max_OT_MTS: any,
    Normal_OT_Rate: any,
    Holiday_OT_Rate: any,
    Leave_Sal_Days: any,
    UQ_Labour_ID: any,
    Bank_Acc_No: any,
    Bank_Code: any,
    Sal_Expense_Head_ID: any,
    Sal_Payable_Head_ID: any,
    LS_Expense_Head_ID: any,
    LS_Payable_Head_ID: any,
    EOS_Expense_Head_ID: any,
    EOS_Payable_Head_ID: any
  ) {
    const getEndpoint = this.apiUrl + '/PaySettings/save';
    const reqBody = {
      DAILY_HOURS: Daily_Hours,
      MAX_OT_MTS: Max_OT_MTS,
      NORMAL_OT_RATE: Normal_OT_Rate,
      HOLIDAY_OT_RATE: Holiday_OT_Rate,
      LEAVE_SAL_DAYS: Leave_Sal_Days,
      UQ_LABOUR_ID: UQ_Labour_ID,
      BANK_AC_NO: Bank_Acc_No,
      BANK_CODE: Bank_Code,
      SAL_EXPENSE_HEAD_ID: Sal_Expense_Head_ID,
      SAL_PAYABLE_HEAD_ID: Sal_Payable_Head_ID,
      LS_EXPENSE_HEAD_ID: LS_Expense_Head_ID,
      LS_PAYABLE_HEAD_ID: LS_Payable_Head_ID,
      EOS_EXPENSE_HEAD_ID: EOS_Expense_Head_ID,
      EOS_PAYABLE_HEAD_ID: EOS_Payable_Head_ID,
    };
    return this.http.post(getEndpoint, reqBody);
  }

  // ===============Leave Type======================
  //=================get Leave Type===================
  get_LeaveType_Api() {
    const getEndpoint = this.apiUrl + '/LeaveType/list';
    return this.http.post(getEndpoint, {});
  }

  //===============Add Api=========================
  Insert_LeaveType_Api(
    CODE: any,
    DESCRIPTION: any,
    LEAVE_SALARY_PAYABLE: any,
    IS_INACTIVE: boolean
  ) {
    const getEndpoint = this.apiUrl + '/LeaveType/save';
    const reqBody = {
      CODE: CODE,
      DESCRIPTION: DESCRIPTION,
      LEAVE_SALARY_PAYABLE: LEAVE_SALARY_PAYABLE,
      IS_INACTIVE: IS_INACTIVE,
    };
    return this.http.post(getEndpoint, reqBody);
  }

  //==============Update Api==============================

  Update_LeaveType_Api(
    CODE: any,
    DESCRIPTION: any,
    IS_INACTIVE: any,
    LEAVE_SALARY_PAYABLE: any,
    ID: any
  ) {
    const getEndpoint = this.apiUrl + '/LeaveType/update';
    const reqBody = {
      CODE: CODE,
      DESCRIPTION: DESCRIPTION,
      LEAVE_SALARY_PAYABLE: LEAVE_SALARY_PAYABLE,
      IS_INACTIVE: IS_INACTIVE,
      ID: ID,
    };

    return this.http.post(getEndpoint, reqBody);
  }

  //===========Select Api=================

  Select_LeaveType_Api(ID: any) {
    const getEndpoint = this.apiUrl + `/LeaveType/select/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  //===========delete Api==================
  Delete_LeaveType_Api(ID: any) {
    return this.http.post(`${this.apiUrl}/LeaveType/delete/${ID}`, {});
    // return this.http.post(
    //   `${this.apiUrl}/tranferout/transferreport`,
    //   reqBodyData
    // );
  }

  //EMPLOYEE
  employeeList(item: any) {
    // const headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   Authorization: `Bearer ${localStorage.getItem('token')}`,
    // });
    const payload = item;
    return this.http.post(`${this.apiUrl}Employee/list`, payload);
  }

  // =========================================salary head Api==============================

  //=============================Api For salaty Head List================================
  // get_salary_head_list() {
  //   return this.http.post(`${this.apiUrl}SalaryHead/list`, {});
  // }

  // =========================================salary head  Add Api==============================
  Add_salary_Head(
    code: any,
    description: any,
    print_Description: any,
    orderSlip: any,
    isWorkingday: any,
    isInactive: any,
    salary_Exp: any,
    head_type: any,
    is_Fixed: any
  ): Observable<any> {
    const reqBody = {
      CODE: code,
      HEAD_NAME: description,
      PRINT_DESCRIPTION: print_Description,
      AC_HEAD_ID: salary_Exp,
      HEAD_TYPE: head_type,
      HEAD_ORDER: orderSlip,
      IS_INACTIVE: isInactive,
      IS_WORKING_DAY: isWorkingday,
      IS_FIXED: is_Fixed,
      IS_SYSTEM: false, // Default value
      IS_DELETED: false, // Removed `/`
    };

    return this.http.post(`${this.apiUrl}/SalaryHead/save`, reqBody);
  }

  // =========================================salary head  Update Api==============================
  Update_salary_Head(
    id: any,
    code: any,
    description: any,
    print_Description: any,
    orderSlip: any,
    isWorkingday: any,
    isInactive: any,
    salary_Exp: any,
    head_type: any,
    is_Fixed: any,
    is_syetm: any
  ): Observable<any> {
    const reqBody = {
      ID: id,
      CODE: code,
      HEAD_NAME: description,
      PRINT_DESCRIPTION: print_Description,
      AC_HEAD_ID: salary_Exp,
      HEAD_TYPE: head_type,
      HEAD_ORDER: orderSlip,
      IS_INACTIVE: isInactive,
      IS_WORKING_DAY: isWorkingday,
      IS_FIXED: is_Fixed,
      IS_SYSTEM: is_syetm, // Default value
      IS_DELETED: false, // Removed `/`
    };

    return this.http.post(`${this.apiUrl}SalaryHead/edit`, reqBody);
  }

  //==============================APi for  Salary Head select==========================

  select_salary_head(id: any) {
    return this.http.post(`${this.apiUrl}SalaryHead/select/${id}`, {});
  }
  //==============================APi for  Salary Head dropdowun salary expense  ==========================

  Dropdown_salary_exp(type: any) {
    const reqbody = { NAME: 'ACCOUNT_HEAD' };
    return this.http.post(`${this.apiUrl}/DropDown`, reqbody);
  }

  //==============================APi for  Salary Head delete ==========================

  // delete_salary_Head(id: any) {
  //   return this.http.post(`${this.apiUrl}/SalaryHead/delete/${id}`, {});
  // }

  //========================ac head id dropdown=====

  Dropdown_ac_head(type: any) {
    const reqbody = { NAME: 'ACCOUNT_HEAD' };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  // delete_salary_Head(id: any) {
  delete_salary_Head(id: any) {
    return this.http.post(`${this.apiUrl}SalaryHead/delete/${id}`, {});
  }
  //==================================Api for Advance types Get==========================

  get_Advance_type_list() {
    return this.http.post(`${this.apiUrl}/SalaryHead/list`, {});
  }
  //==============================APi for  Salary Head dropdowun salary expense  ==========================

  Dropdown_advance_types(type: any) {
    const reqbody = { NAME: 'ACCOUNT_HEAD' };
    return this.http.post(`${this.apiUrl}DropDown`, reqbody);
  }
  //==================================Api for Advance types select==========================

  select_advance_types(id: any) {
    return this.http.post(`${this.apiUrl}/SalaryHead/select/${id}`, {});
  }

  //==================================Api for Add Advance types ==========================

  Api_Add_Advance_types(
    code: any,
    description: any,
    print_Description: any,
    isInactive: any,
    salary_Exp: any
  ): Observable<any> {
    const reqBody = {
      CODE: code,
      HEAD_NAME: description,
      PRINT_DESCRIPTION: print_Description,
      AC_HEAD_ID: salary_Exp,
      IS_INACTIVE: isInactive,
      HEAD_TYPE: 3,
      HEAD_ORDER: 0,
      IS_WORKING_DAY: false,
      IS_FIXED: true,
      IS_SYSTEM: false, // Default value
      IS_DELETED: false, // Removed `/`
    };

    return this.http.post(`${this.apiUrl}/SalaryHead/save`, reqBody);
  }

  //=================================Api for update  Adavace  Types==============================

  Api_Update_Advance_types(
    id: any,
    code: any,
    description: any,
    print_Description: any,
    isInactive: any,
    salary_Exp: any
  ): Observable<any> {
    const reqBody = {
      ID: id,
      CODE: code,
      HEAD_NAME: description,
      PRINT_DESCRIPTION: print_Description,
      AC_HEAD_ID: salary_Exp,
      IS_INACTIVE: isInactive,
      HEAD_TYPE: 3,
      HEAD_ORDER: 0,
      IS_WORKING_DAY: false,
      IS_FIXED: true,
      IS_SYSTEM: false, // Default value
      IS_DELETED: false, // Removed `/`
    };

    return this.http.post(`${this.apiUrl}/SalaryHead/edit`, reqBody);
  }

  //==============================APi for  Salary Head delete ==========================

  delete_Advance_types(id: any) {
    return this.http.post(`${this.apiUrl}/SalaryHead/delete/${id}`, {});
  }

  //EMPLOYEE
  saveEmployeeData(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Employee/save`, payload);
  }

  selectEmployee(id: number) {
    return this.http.post<any>(`${this.apiUrl}Employee/select/` + id, {});
  }
  deleteEmployee(id: number) {
    return this.http.post<any>(`${this.apiUrl}Employee/delete/` + id, {});
  }

  updateEmployee(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}Employee/update`, data);
  }

  //=============================Api For salaty Head List================================
  get_salary_head_list() {
    return this.http.post(`${this.apiUrl}SalaryHead/list`, {});
  }

  // =========================================salary head  Add Api==============================

  Add_salary_Head_api(item: any) {
    const payload = item;

    return this.http.post(`${this.apiUrl}SalaryHead/save`, payload);
  }
  Update_salary_Head_api(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}SalaryHead/edit`, payload);
  }

  //===========================Api for Advance===========================

  //========================get advance======================

  Get_Api_advance() {
    return this.http.post(`${this.apiUrl}Advance/list`, {});
  }

  //=============================employee dropdown============
  Dropdown_advance_employee(type: any) {
    const reqbody = { NAME: 'EMPLOYEE' };
    return this.http.post(`${this.apiUrl}DropDown`, reqbody);
  }

  // ===================dropdown for advance Types================

  Dropdown_AdvanceTypes(type: any) {
    const reqbody = { NAME: 'ADVANCE_TYPE' };
    return this.http.post(`${this.apiUrl}DropDown`, reqbody);
  }

  // ==================Api for Add Advance===========================
  Api_Add_advance(
    emp_id: any,
    date: any,
    adv_type_id: any,
    advance_Amount: any,
    rec_amount: any,
    rec_start_month: any,
    rec_install_count: any,
    rec_install_amount: any,
    remarks: any,
    company_id: any
  ) {
    const reqBody = {
      EMP_ID: emp_id,
      DATE: date,
      ADV_TYPE_ID: adv_type_id,
      ADVANCE_AMOUNT: advance_Amount,
      REC_AMOUNT: rec_amount,
      REC_START_MONTH: rec_start_month,
      REC_INSTALL_COUNT: rec_install_count,
      REC_INSTALL_AMOUNT: rec_install_amount,
      REMARKS: remarks,
      PAY_TRANS_ID: 0,
      TRANS_ID: 0,
      EMP_NAME: '',
      ADV_TYPE_NAME: '',
      STATUS: 'open',
      COMPANY_ID: company_id,
    };
    return this.http.post(`${this.apiUrl}Advance/save`, reqBody);
  }
  //========================PAYMEN4T TRANSACTION API===========================
  listledgerlist() {
    return this.http.post(`${this.apiUrl}Receipt/ledgerlist`, {});
  }

  // =====================API Verify Advance========================
  api_Verify_Advance(
    id: any,
    emp_id: any,
    date: any,
    adv_type_id: any,
    advance_Amount: any,
    rec_amount: any,
    rec_start_month: any,
    rec_install_count: any,
    rec_install_amount: any,
    remarks: any
  ) {
    const reqBody = {
      ID: id,
      EMP_ID: emp_id,
      DATE: date,
      ADV_TYPE_ID: adv_type_id,
      ADVANCE_AMOUNT: advance_Amount,
      REC_AMOUNT: rec_amount,
      REC_START_MONTH: rec_start_month,
      REC_INSTALL_COUNT: rec_install_count,
      REC_INSTALL_AMOUNT: rec_install_amount,
      REMARKS: remarks,
    };
    return this.http.post(`${this.apiUrl}/Advance/verify`, reqBody);
  }
  // =====================API Verify Advance========================
  api_Approve_Advance(
    id: any,
    emp_id: any,
    date: any,
    adv_type_id: any,
    advance_Amount: any,
    rec_amount: any,
    rec_start_month: any,
    rec_install_count: any,
    rec_install_amount: any,
    remarks: any
  ) {
    const reqBody = {
      ID: id,
      EMP_ID: emp_id,
      DATE: date,
      ADV_TYPE_ID: adv_type_id,
      ADVANCE_AMOUNT: advance_Amount,
      REC_AMOUNT: rec_amount,
      REC_START_MONTH: rec_start_month,
      REC_INSTALL_COUNT: rec_install_count,
      REC_INSTALL_AMOUNT: rec_install_amount,
      REMARKS: remarks,
    };
    return this.http.post(`${this.apiUrl}/Advance/approve`, reqBody);
  }
  //PAY REVISION

  getSalaryRevisionLog(): Observable<any> {
    return this.http.post(`${this.apiUrl}/PayRevision/list`, {});
  }

  // =========================select advance api==========================
  select_Advance(id: number) {
    return this.http.post<any>(`${this.apiUrl}Advance/select/` + id, {});
  }
  //==========================Update advance===============================

  Api_Update_advance(
    id: any,
    emp_id: any,
    date: any,
    adv_type_id: any,
    advance_Amount: any,
    rec_amount: any,
    rec_start_month: any,
    rec_install_count: any,
    rec_install_amount: any,
    remarks: any,
    pay_head_id: any,
    trans_id: any,
    cheque_no: any,
    cheque_date: any,
    pay_Type_id: any
  ) {
    const reqBody = {
      ID: id,
      EMP_ID: emp_id,
      DATE: date,
      ADV_TYPE_ID: adv_type_id,
      ADVANCE_AMOUNT: advance_Amount,
      REC_AMOUNT: rec_amount,
      REC_START_MONTH: rec_start_month,
      REC_INSTALL_COUNT: rec_install_count,
      REC_INSTALL_AMOUNT: rec_install_amount,
      REMARKS: remarks,
      TRANS_ID: trans_id,
      EMP_NAME: '',
      ADV_TYPE_NAME: '',
      STATUS: '',
      PAY_HEAD_ID: pay_head_id,
      CHEQUE_NO: cheque_no,
      CHEQUE_DATE: cheque_date,
      PAY_TYPE_ID: pay_Type_id,
    };
    return this.http.post(`${this.apiUrl}Advance/update`, reqBody);
  }

  //===================================APPROVE ADVANCE=================================

  Api_Approve_advance(
    id: any,
    emp_id: any,
    date: any,
    adv_type_id: any,
    advance_Amount: any,
    rec_amount: any,
    rec_start_month: any,
    rec_install_count: any,
    rec_install_amount: any,
    remarks: any,
    pay_head_id: any,
    trans_id: any,
    cheque_no: any,
    cheque_date: any,
    pay_Type_id: any
  ) {
    const reqBody = {
      ID: id,
      EMP_ID: emp_id,
      DATE: date,
      ADV_TYPE_ID: adv_type_id,
      ADVANCE_AMOUNT: advance_Amount,
      REC_AMOUNT: rec_amount,
      REC_START_MONTH: rec_start_month,
      REC_INSTALL_COUNT: rec_install_count,
      REC_INSTALL_AMOUNT: rec_install_amount,
      REMARKS: remarks,
      TRANS_ID: trans_id,
      EMP_NAME: '',
      ADV_TYPE_NAME: '',
      STATUS: '',
      PAY_HEAD_ID: pay_head_id,
      CHEQUE_NO: cheque_no,
      CHEQUE_DATE: cheque_date,
      PAY_TYPE_ID: pay_Type_id,
    };
    return this.http.post(`${this.apiUrl}Advance/approve`, reqBody);
  }

  Api_Delete_advance(id: any) {
    return this.http.post(`${this.apiUrl}Advance/delete/${id}`, {});
  }
  getSalaryDetails(id: number) {
    return this.http.post<any>(
      `${this.apiUrl}/PayRevision/getEmployeeSalaryDetails`,
      { EMP_ID: id }
    );
  }

  saveRevisionData(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/PayRevision/save`, payload);
  }

  selectSalaryRevision(id: number) {
    return this.http.post<any>(`${this.apiUrl}/PayRevision/select/` + id, {});
  }

  updateSalaryRevision(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}/PayRevision/update`, data);
  }

  verifySalaryRevision(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}/PayRevision/verify`, data);
  }

  approveSalaryRevision(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}/PayRevision/approve`, data);
  }
  //TIMESHEET

  deleteSalaryRevision(id: number) {
    return this.http.post<any>(`${this.apiUrl}/PayRevision/delete/` + id, {});
  }

  //SALARY SETTINGS
  getEmployeeSalarySettingsList(payload) {
    const getEndpoint = `${this.apiUrl}EmployeeSalary/ListSalarySettings`;
    return this.http.post(getEndpoint, payload);
  }

  //==========Dropdown for Employee Salary Settings==========
  getEmployeeDropDown() {
    const reqbody = {
      NAME: 'Employee',
    };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  //=========List of SalaryHead============
  get_SalaryHeadList_Api(payload) {
    const getEndpoint = `${this.apiUrl}EmployeeSalary/list`;
    return this.http.post(getEndpoint, payload);
  }

  //============Insert Employee Salary Settings Api=========================
  Insert_EmployeeSalarySettings_Api(payload) {
    const getEndpoint = `${this.apiUrl}EmployeeSalary/save`;
    return this.http.post(getEndpoint, payload);
  }

  Select_EmployeeSalarySettings_Api(payload) {
    const getEndpoint = `${this.apiUrl}EmployeeSalary/select`;
    return this.http.post(getEndpoint, payload);
  }

  Update_EmployeeSalarySettings_Api(payload) {
    const getEndpoint = `${this.apiUrl}EmployeeSalary/edit`;
    return this.http.post(getEndpoint, payload);
  }

  Delete_EmployeeSalarySettings_Api(ID: any) {
    const getEndpoint = `${this.apiUrl}EmployeeSalary/delete/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  //TIMESHEET
  getTimesheetByMonth(year: number, month: number): Observable<any> {
    return this.http.post<any>('YOUR_API_ENDPOINT', { year, month });
  }

  Timesheet_List_Api(payload) {
    const getEndpoint = `${this.apiUrl}TimeSheet/ListTimesheet`;
    return this.http.post(getEndpoint, payload);
  }
  getTimesheetList(): Observable<any> {
    return this.http.post(`${this.apiUrl}/TimeSheet/list`, {});
  }

  saveTimesheetData(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/TimeSheet/save`, payload);
  }
  Timesheet_Approval_Api(payload) {
    const getEndpoint = `${this.apiUrl}TimeSheet/approvetimesheet`;
    return this.http.post(getEndpoint, payload);
  }
  // ========================Staff End of Service =========================

  // ========================Staff End of Service List =========================
  get_Staff_EOS_List() {
    return this.http.post(`${this.apiUrl}/EmployeeEOS/list`, {});
  }
  //========================staff end of service add========================
  add_Staff_EOS(
    user_id: any,
    store_id: any,
    date: any,
    emp_id: any,
    reason_id: any,
    remarks: any
  ) {
    const reqBody = {
      USER_ID: user_id,
      STORE_ID: store_id,
      EOS_DATE: date,
      EMP_ID: emp_id,
      REASON_ID: reason_id,
      REMARKS: remarks,
    };
    return this.http.post(`${this.apiUrl}/EmployeeEOS/save`, reqBody);
  }
  //=========================staff end off service select=========================
  Dropdown_EOS_reason(type: any) {
    const reqbody = { NAME: 'EOS_REASON' };
    return this.http.post(`${this.apiUrl}/DropDown`, reqbody);
  }

  //=============================employee dropdown============
  Dropdown_eos_employee(type: any) {
    const reqbody = { NAME: 'EMPLOYEE' };
    return this.http.post(`${this.apiUrl}/DropDown`, reqbody);
  }

  get_employeeDetails(id: any) {
    const reqbody = { EMP_ID: id };
    return this.http.post(
      `${this.apiUrl}/EmployeeEOS/getEmployeeData`,
      reqbody
    );
  }

  //=========================staff end off service select=========================

  select_Api_eos(id: any) {
    return this.http.post(`${this.apiUrl}/EmployeeEOS/select/${id}`, {});
  }

  Update_Staff_EOS_api(
    id: any,
    user_id: any,
    store_id: any,
    date: any,
    emp_id: any,
    reason_id: any,
    remarks: any
  ) {
    const reqBody = {
      ID: id,
      USER_ID: user_id,
      STORE_ID: store_id,
      EOS_DATE: date,
      EMP_ID: emp_id,
      REASON_ID: reason_id,
      REMARKS: remarks,
      EOS_AMOUNT: '',
      LEAVE_AMOUNT: '',
      PENDING_SALARY: '',
      ADD_AMOUNT: '',
      DED_AMOUNT: '',
      ADD_REMARKS: '',
      DED_REMARKS: '',
    };
    return this.http.post(`${this.apiUrl}/EmployeeEOS/update`, reqBody);
  }
  //=========================staff end off service Delete=========================
  delete_Eos_data(id: any) {
    return this.http.post(`${this.apiUrl}/EmployeeEOS/delete/${id}`, {});
  }
  //=========================staff end off service Verify=========================

  Verify_Staff_EOS_api(
    id: any,
    user_id: any,
    store_id: any,
    date: any,
    emp_id: any,
    reason_id: any,
    remarks: any
  ) {
    const reqBody = {
      ID: id,
      USER_ID: user_id,
      STORE_ID: store_id,
      EOS_DATE: date,
      EMP_ID: emp_id,
      REASON_ID: reason_id,
      REMARKS: remarks,
      EOS_AMOUNT: '',
      LEAVE_AMOUNT: '',
      PENDING_SALARY: '',
      ADD_AMOUNT: '',
      DED_AMOUNT: '',
      ADD_REMARKS: '',
      DED_REMARKS: '',
    };
    return this.http.post(`${this.apiUrl}/EmployeeEOS/verify`, reqBody);
  }

  //==================================Aprove Staff End of Service=========================
  Approve_Staff_EOS_api(
    id: any,
    user_id: any,
    store_id: any,
    date: any,
    emp_id: any,
    reason_id: any,
    remarks: any
  ) {
    const reqBody = {
      ID: id,
      USER_ID: user_id,
      STORE_ID: store_id,
      EOS_DATE: date,
      EMP_ID: emp_id,
      REASON_ID: reason_id,
      REMARKS: remarks,
      EOS_AMOUNT: '',
      LEAVE_AMOUNT: '',
      PENDING_SALARY: '',
      ADD_AMOUNT: '',
      DED_AMOUNT: '',
      ADD_REMARKS: '',
      DED_REMARKS: '',
    };
    return this.http.post(`${this.apiUrl}/EmployeeEOS/approve`, reqBody);
  }

  //=====================payement details==  ============
  get_paymentDetails(id: any) {
    const reqbody = { TRANS_ID: id };
    return this.http.post(`${this.apiUrl}/Accounts/getpaymentDetails`, reqbody);
  }

  // saveTimesheetData(payload: any):Observable<any> {
  //   return this.http.post(`${this.apiUrl}/TimeSheet/save`,payload)
  // }

  selectTimesheet(id: number) {
    return this.http.post<any>(`${this.apiUrl}/TimeSheet/select/` + id, {});
  }

  updateTimesheet(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}/TimeSheet/update`, data);
  }

  verifyTimesheet(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}/TimeSheet/verify`, data);
  }

  approveTimesheet(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}/TimeSheet/approve`, data);
  }

  deleteTimesheet(id: number) {
    return this.http.post<any>(`${this.apiUrl}/TimeSheet/delete/` + id, {});
  }

  //MISCELLANEOUS PAYMENTS
  getMiscellaneousPaymentList(): Observable<any> {
    return this.http.post(`${this.apiUrl}/MiscPayment/list`, {});
  }

  saveMiscPayment(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/MiscPayment/save`, payload);
  }

  selectMiscellaneousData(id: number) {
    return this.http.post<any>(`${this.apiUrl}/MiscPayment/select/` + id, {});
  }

  updateMiscellaneousData(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}/MiscPayment/update`, data);
  }

  verifyMiscellaneousData(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}/MiscPayment/verify`, data);
  }

  approveMiscellaneousData(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}/MiscPayment/approve`, data);
  }

  deleteMiscellaneousData(id: number) {
    return this.http.post<any>(`${this.apiUrl}MiscPayment/delete/` + id, {});
  }

  getPaymentDetails(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}/Accounts/getpaymentDetails`, data);
  }

  //PAYROLL
  // getTimesheetListForPayroll(tsMonth: string) {
  //   const payload = {
  //     TS_MONTH: tsMonth,
  //   };
  //   return this.http.post(`${this.apiUrl}/payroll/getTimesheetList`, payload);
  // }

  // getPayrollList(): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/payroll/list`, {});
  // }

  generatePayroll(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}Salary/generate`, payload);
  }

  // updatePayroll(data: Object): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/payroll/update`, data);
  // }

  verifyPayroll(data: Object): Observable<any> {
    return this.http.post(`${this.apiUrl}/payroll/verify`, data);
  }

  // approvePayroll(data: Object): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/payroll/approve`, data);
  // }

  // deletePayroll(id: number, tsId: number) {
  //   const data = {
  //     ID: id,
  //     TS_ID: tsId,
  //   };
  //   return this.http.post<any>(`${this.apiUrl}/payroll/delete`, data);
  // }

  selectPayroll(id: number) {
    return this.http.post<any>(`${this.apiUrl}/payroll/select/` + id, {});
  }

  //===================Employee Leave========================
  //=================get Leave Type===================
  get_EmployeeLeave_Api() {
    const getEndpoint = this.apiUrl + '/EmployeeVacation/list';
    return this.http.post(getEndpoint, {});
  }

  //===============Add Api=========================
  Insert_EmployeeLeave_Api(
    User_Id: any,
    Store_Id: any,
    Date: any,
    Employee_ID: any,
    Leave_type: any,
    Leave_days: any,
    Leave_credit: any,
    Dept_date: any,
    Expected_rejoin_date: any,
    Remarks: any,
    Leave_salary_payable: any
  ) {
    const getEndpoint = this.apiUrl + '/EmployeeVacation/save';
    const reqBody = {
      USER_ID: User_Id,
      STORE_ID: Store_Id,
      DOC_DATE: Date,
      EMP_ID: Employee_ID,
      LEAVE_TYPE_ID: Leave_type,
      VAC_DAYS: Leave_days,
      LEAVE_CREDIT: Leave_credit,
      DEPT_DATE: Dept_date,
      EXPECT_RETURN: Expected_rejoin_date,
      REMARKS: Remarks,
      LS_PAYABLE: Leave_salary_payable,
    };
    return this.http.post(getEndpoint, reqBody);
  }

  //=================get LeaveType Dropdown ===================
  get_LeaveType_Dropdown_Api(LEAVE_TYPES: any) {
    const getEndpoint = this.apiUrl + '/DropDown';
    const reqBody = {
      NAME: 'LEAVE_TYPES',
    };
    return this.http.post(getEndpoint, reqBody);
  }

  //=================get Employee Dropdown ===================
  get_Employee_Dropdown_Api(EMPLOYEE: any) {
    const getEndpoint = this.apiUrl + '/DropDown';
    const reqBody = {
      NAME: 'EMPLOYEE',
    };
    return this.http.post(getEndpoint, reqBody);
  }

  get_EOS_Dropdown_Api(EOS_REASON: any) {
    const getEndpoint = this.apiUrl + '/DropDown';
    const reqBody = {
      NAME: 'EOS_REASON',
    };
    return this.http.post(getEndpoint, reqBody);
  }

  //====================Select Api========================
  Select_EmployeeLeave_Api(ID: any) {
    const getEndpoint = this.apiUrl + `/EmployeeVacation/select/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  //=====================Update Api========================
  Update_EmployeeLeave_Api(
    User_Id: any,
    Store_Id: any,
    ID: any,
    Date: any,
    Employee_ID: any,
    Leave_type: any,
    Leave_days: any,
    Leave_credit: any,
    Dept_date: any,
    Expected_rejoin_date: any,
    Remarks: any,
    Leave_salary_payable: any,
    Is_ticket: any,
    Last_rejoin_date: any,
    Travelled_date: any,
    Rejoin_date: any,
    Actual_days: any,
    Deduct_days: any,
    Left_reason: any
  ) {
    const getEndpoint = this.apiUrl + '/EmployeeVacation/update';
    const reqBody = {
      USER_ID: User_Id,
      STORE_ID: Store_Id,
      ID: ID,
      DOC_DATE: Date,
      EMP_ID: Employee_ID,
      LEAVE_TYPE_ID: Leave_type,
      VAC_DAYS: Leave_days,
      LEAVE_CREDIT: Leave_credit,
      DEPT_DATE: Dept_date,
      EXPECT_RETURN: Expected_rejoin_date,
      REMARKS: Remarks,
      LS_PAYABLE: Leave_salary_payable,
      IS_TICKET: Is_ticket,
      LAST_REJOIN_DATE: Rejoin_date,
      TRAVELLED_DATE: Travelled_date,
      REJOIN_DATE: Rejoin_date,
      ACTUAL_DAYS: Actual_days,
      DEDUCT_DAYS: Deduct_days,
      LEFT_REASON: Left_reason,
    };

    return this.http.post(getEndpoint, reqBody);
  }

  //======================Verify Api========================
  Verify_EmployeeLeave_Api(
    User_Id: any,
    Store_Id: any,
    ID: any,
    Date: any,
    Employee_ID: any,
    Leave_type: any,
    Leave_days: any,
    Leave_credit: any,
    Dept_date: any,
    Expected_rejoin_date: any,
    Remarks: any,
    Leave_salary_payable: any,
    Is_ticket: any,
    Last_rejoin_date: any,
    Travelled_date: any,
    Rejoin_date: any,
    Actual_days: any,
    Deduct_days: any,
    Left_reason: any
  ) {
    const getEndpoint = this.apiUrl + '/EmployeeVacation/verify';
    const reqBody = {
      USER_ID: User_Id,
      STORE_ID: Store_Id,
      ID: ID,
      DOC_DATE: Date,
      EMP_ID: Employee_ID,
      LEAVE_TYPE_ID: Leave_type,
      VAC_DAYS: Leave_days,
      LEAVE_CREDIT: Leave_credit,
      DEPT_DATE: Dept_date,
      EXPECT_RETURN: Expected_rejoin_date,
      REMARKS: Remarks,
      LS_PAYABLE: Leave_salary_payable,
      IS_TICKET: null,
      LAST_REJOIN_DATE: null,
      TRAVELLED_DATE: null,
      REJOIN_DATE: null,
      ACTUAL_DAYS: null,
      DEDUCT_DAYS: null,
      LEFT_REASON: null,
    };

    return this.http.post(getEndpoint, reqBody);
  }

  //======================Approve Api========================
  Approve_EmployeeLeave_Api(
    User_Id: any,
    Store_Id: any,
    ID: any,
    Date: any,
    Employee_ID: any,
    Leave_type: any,
    Leave_days: any,
    Leave_credit: any,
    Dept_date: any,
    Expected_rejoin_date: any,
    Remarks: any,
    Leave_salary_payable: any,
    Is_ticket: any,
    Last_rejoin_date: any,
    Travelled_date: any,
    Rejoin_date: any,
    Actual_days: any,
    Deduct_days: any,
    Left_reason: any
  ) {
    const getEndpoint = this.apiUrl + '/EmployeeVacation/approve';
    const reqBody = {
      USER_ID: User_Id,
      STORE_ID: Store_Id,
      ID: ID,
      DOC_DATE: Date,
      EMP_ID: Employee_ID,
      LEAVE_TYPE_ID: Leave_type,
      VAC_DAYS: Leave_days,
      LEAVE_CREDIT: Leave_credit,
      DEPT_DATE: Dept_date,
      EXPECT_RETURN: Expected_rejoin_date,
      REMARKS: Remarks,
      LS_PAYABLE: Leave_salary_payable,
      IS_TICKET: null,
      LAST_REJOIN_DATE: null,
      TRAVELLED_DATE: null,
      REJOIN_DATE: null,
      ACTUAL_DAYS: null,
      DEDUCT_DAYS: null,
      LEFT_REASON: null,
    };

    return this.http.post(getEndpoint, reqBody);
  }

  //===========delete Api==================
  Delete_EmployeeLeave_Api(ID: any) {
    return this.http.post(`${this.apiUrl}/EmployeeVacation/delete/${ID}`, {});
    // return this.http.post(
    //   `${this.apiUrl}/tranferout/transferreport`,
    //   reqBodyData
    // );
  }

  get_EmployeeDetails_Api() {
    const getEndpoint = this.apiUrl + '/Employee/list';
    return this.http.post(getEndpoint, {});
  }

  //===============ARTICLE COLOR ==================
  get_ArticleColor_Api() {
    const getEndpoint = this.apiUrl + 'ArticleColor/list';
    return this.http.post(getEndpoint, {});
  }

  Insert_ArticleColor_Api(payload) {
    const getEndpoint = this.apiUrl + 'ArticleColor/insert';
    return this.http.post(getEndpoint, payload);
  }

  Select_ArticleColor_Api(ID: any) {
    const getEndpoint = this.apiUrl + `ArticleColor/select/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  Update_ArticleColor_Api(
    Id: any,
    Code: any,
    Color_English: any,
    Color_Arabic: any
  ) {
    const getEndpoint = this.apiUrl + 'ArticleColor/update';
    const reqBody = {
      ID: Id,
      CODE: Code,
      COLOR_ENGLISH: Color_English,
      COLOR_ARABIC: Color_Arabic,
    };
    return this.http.post(getEndpoint, reqBody);
  }

  Delete_ArticleColor_Api(ID: any) {
    const getEndpoint = this.apiUrl + `ArticleColor/delete/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  //===============ARTICLE BRAND =======================

  get_ArticleBrand_Api() {
    const getEndpoint = this.apiUrl + 'ArticleBrand/list';
    return this.http.post(getEndpoint, {});
  }

  Insert_ArticleBrand_Api(payload) {
    const getEndpoint = this.apiUrl + 'ArticleBrand/insert';
    return this.http.post(getEndpoint, payload);
  }

  Select_ArticleBrand_Api(ID: any) {
    const getEndpoint = this.apiUrl + `ArticleBrand/select/${ID}`;
    return this.http.post(getEndpoint, {});
  }
  Update_ArticleBrand_Api(
    Id: any,
    Code: any,
    Description: any,
    Is_Inactive: any
  ) {
    const getEndpoint = this.apiUrl + 'ArticleBrand/update';
    const reqBody = {
      ID: Id,
      CODE: Code,
      DESCRIPTION: Description,
      IS_INACTIVE: Is_Inactive,
    };
    return this.http.post(getEndpoint, reqBody);
  }

  Delete_ArticleBrand_Api(ID: any) {
    const getEndpoint = this.apiUrl + `ArticleBrand/delete/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  //==================ARTICLE TYPE=========================
  get_ArticleType_Api() {
    const getEndpoint = this.apiUrl + 'ArticleType/list';
    return this.http.post(getEndpoint, {});
  }

  Insert_ArticleType_Api(payload) {
    const getEndpoint = this.apiUrl + 'ArticleType/insert';
    return this.http.post(getEndpoint, payload);
  }

  Select_ArticleType_Api(ID: any) {
    const getEndpoint = this.apiUrl + `ArticleType/select/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  Update_ArticleType_Api(Id: any, Description: any) {
    const getEndpoint = this.apiUrl + 'ArticleType/update';
    const reqBody = {
      ID: Id,
      DESCRIPTION: Description,
    };
    return this.http.post(getEndpoint, reqBody);
  }

  Delete_ArticleType_Api(ID: any) {
    const getEndpoint = this.apiUrl + `ArticleType/delete/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  //==================DEALER MASTER===============================

  //=================get Country Dropdown ===================

  get_Country_Dropdown_Api() {
    const reqbody = { NAME: 'COUNTRY_NAME' };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  //=================get State Dropdown ===================
  get_State_Dropdown_Api(name: any, CountryId: any) {
    const reqbody = {
      NAME: 'STATE_NAME',
      COUNTRY_ID: CountryId, // Replace with actual country ID or variable
    };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  //=================get District Dropdown ===================
  get_District_Dropdown_Api(name: any, StateId: any) {
    const reqbody = {
      NAME: 'DISTRICT_NAME',
      STATE_ID: StateId, // Replace with actual state ID or variable
    };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  //=================get City Dropdown ===================
  get_City_Dropdown_Api(name: any, DistrictID: any) {
    const reqbody = {
      NAME: 'CITY_NAME',
      DISTRICT_ID: DistrictID, // Replace with actual district ID or variable
    };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  //=================get Distributor Dropdown ===================
  get_Distributor_Dropdown_Api() {
    const reqbody = { NAME: 'DISTRIBUTOR' };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  //=================get Warehouse Dropdown ===================
  get_Warehouse_Dropdown_Api() {
    const reqbody = {
      NAME: 'WAREHOUSE',
    };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  //=================get Zone Dropdown ===================
  get_Zone_Dropdown_Api() {
    const reqbody = {
      NAME: 'ZONE',
    };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  //================get Dealer Master List=========================
  get_DealerList_Api() {
    const getEndpoint = this.apiUrl + 'Distributor/list';
    return this.http.post(getEndpoint, {});
  }

  //=================Insert Dealer Master Api=========================
  Insert_Dealer_Api(payload) {
    const getEndpoint = this.apiUrl + 'Distributor/insert';
    return this.http.post(getEndpoint, payload);
  }

  //=================Select Dealer Master Api=========================
  Select_Dealer_Api(ID: any) {
    const getEndpoint = this.apiUrl + `Distributor/select/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  //=================Update Dealer Master Api=========================
  Update_Dealer_Api(payload) {
    const getEndpoint = this.apiUrl + 'Distributor/update';
    return this.http.post(getEndpoint, payload);
  }

  //=================Delete Dealer Master Api=========================
  Delete_Dealer_Api(ID: any) {
    const getEndpoint = this.apiUrl + `Distributor/delete/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  Insert_NewDistrict_Api(payload) {
    const getEndpoint = this.apiUrl + 'Distributor/savedistrict';
    return this.http.post(getEndpoint, payload);
  }

  Insert_NewCity_Api(payload) {
    const getEndpoint = this.apiUrl + 'Distributor/savecity';
    return this.http.post(getEndpoint, payload);
  }

  get_CountryWithFlags(): Observable<any> {
    return this.http.post(`${this.apiUrl}/country/list`, {});
  }

  //======================Category Master====================================

  AddPackingItems(items: any) {
    const data = items;
    // console.log(data,"insert service")
    return this.http.post(`${this.apiUrl}ArticleCategory/save`, data);
  }

  list_Of_packages(item: any) {
    const category = item;
    return this.http.post(
      `${this.apiUrl}ArticleCategory/listpacking`,
      category
    );
  }

  list_of_category() {
    return this.http.post(`${this.apiUrl}ArticleCategory/listdata`, {});
  }

  Add_category_list(item: any) {
    const category = item;
    return this.http.post(`${this.apiUrl}ArticleCategory/insert`, category);
  }
  select_category_Details_Api(id: any) {
    return this.http.post(`${this.apiUrl}ArticleCategory/select/${id}`, {});
  }

  update_category_details(item: any) {
    return this.http.post(`${this.apiUrl}ArticleCategory/update`, item);
  }

  Delete_Category_Data(id: any) {
    return this.http.post(`${this.apiUrl}ArticleCategory/delete/${id}`, {});
  }

  //=====================COMPANY MASTER=======================
  get_CompanyList_Api() {
    const getEndpoint = this.apiUrl + 'Company/list';
    return this.http.post(getEndpoint, {});
  }

  //==========Company dropdown==========
  CompanyDropdown_Api() {
    const reqbody = { NAME: 'COMPANY_TYPE' };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  //============insert data==============
  Insert_CompanyList_Api(payload) {
    const getEndpoint = this.apiUrl + 'Company/insert';
    return this.http.post(getEndpoint, payload);
  }

  //============insert data==============
  Update_CompanyList_Api(payload) {
    const getEndpoint = this.apiUrl + 'Company/update';
    return this.http.post(getEndpoint, payload);
  }
  //===========================USER LEVEL==================

  get_UserLevelData_List_Api() {
    const getEndpoint = this.apiUrl + 'UserRole/list';
    return this.http.post(getEndpoint, {});
  }

  //============insert data==============
  Select_CompanyList_Api(ID: any) {
    const getEndpoint = this.apiUrl + `Company/select/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  Delete_CompanyList_Api(ID: any) {
    const getEndpoint = this.apiUrl + `Company/delete/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  //====================VIEW===================

  get_ArticleStock_Api(payload) {
    const getEndpoint = this.apiUrl + 'View/list';
    return this.http.post(getEndpoint, payload);
  }

  // get_ArticleProduction_view(payload){

  //     return this.http.post(`${this.apiUrl}AC_Report/articleproduction`, payload);
  // }
  //===========================USER LEVEL==================
  // get_UserLevelData_List_Api() {
  //   const getEndpoint = this.apiUrl + 'UserRole/list';
  //   return this.http.post(getEndpoint, {});
  // }

  get_usermenu_Api() {
    const Url = `${this.apiUrl}UserRole/menulist`;
    const reqBody = {
      list: [],
    };
    // const headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'x-api-key': Token,
    // });
    return this.http.post(Url, reqBody);
  }

  //    =================get Userlevel Dropdown ===================
  //  ============List of User Level==============
  get_userLevels_Dropdown_Api() {
    const reqbody = {
      NAME: 'USER_ROLES',
    };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  get_userLevel_list_Api() {
    return this.http.post(`${this.apiUrl}UserRole/menulist`, {});
  }

  get_userLevel_Dropdown_Api() {
    const Url = `${this.apiUrl}UserRole/menulist`;
    const reqBody = {
      list: [],
    };
    // const headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'x-api-key': Token,
    // });
    return this.http.post(Url, reqBody);
  }

  //=============insert user level data=========
  // Insert_UserLevelList_Api(ObjData: any) {
  //   const Url = `${this.apiUrl}UserRole/insert`;
  //   const reqBody = {
  //     UserRoles: ObjData[0].userLevelname,
  //     UserMenuList: ObjData[0].Menus,
  //   };
  //   return this.http.post(Url, reqBody);
  // }

  insert_userrole_api(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}UserRole/insert`, payload);
  }
  //   Insert_UserLevelList_Api(payload) {
  //   const getEndpoint = this.apiUrl+'UserRole/insert';
  //   return this.http.post(getEndpoint, payload);
  // }
  Insert_UserLevelList_Api(ObjData: any) {
    const Url = `${this.apiUrl}UserRole/insert`;
    const reqBody = {
      UserRoles: ObjData[0].userLevelname,
      UserMenuList: ObjData[0].Menus,
    };
    return this.http.post(Url, reqBody);
  }

  //   insert_userrole_api(item:any){
  // const payload=item;
  //       return this.http.post(`${this.apiUrl}UserRole/insert`, payload);

  //   }
  //   Insert_UserLevelList_Api(payload) {
  //   const getEndpoint = this.apiUrl+'UserRole/insert';
  //   return this.http.post(getEndpoint, payload);
  // }

  Select_UserLevel_Api(ID: any) {
    const getEndpoint = this.apiUrl + `UserRole/select/${ID}`;
    return this.http.post(getEndpoint, {});
  }

  //=============update user level data=========

  //     Update_userrole_api(item:any){
  // const payload=item;
  //       return this.http.post(`${this.apiUrl}UserRole/update`, payload);

  //   }
  Update_UserLevelList_Api(ObjData: any) {
    const Url = `${this.apiUrl}UserRole/update`;
    const reqBody = {
      ID: ObjData.userLevelID,
      UserRoles: ObjData.userLevelname,
      UserMenuList: ObjData.Menus,
    };
    return this.http.post(Url, reqBody);
  }

  //=====Remove Insurance Data=====
  Remove_userLevel_Row_Data(id: any) {
    // const headers = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'x-api-key': Token,
    // });
    return this.http.post(`${this.apiUrl}UserRole/delete/${id}`, {});
  }

  //======================USER===================
  //=============GET USER DATA=============
  get_User_data() {
    return this.http.post(`${this.apiUrl}user/list`, {});
  }

  //==============INSERT DATA===================
  insert_User_Data(data: any) {
    const url = `${this.apiUrl}user/insert`;
    const reqBody = {
      USER_NAME: data.UserName,
      LOGIN_NAME: data.LoginName,
      PASSWORD: data.Password,
      WHATSAPP_NO: data.Whatsapp,
      MOBILE: data.Mobile,
      USER_ROLE: data.UserRoleID,
      COMPANY_ID: data.COMPANY_ID,
      EMAIL: data.Email,
      IS_INACTIVE: data.IsInactive,
    };
    return this.http.post(url, reqBody);
  }

  //=====================UPDATE DATA=====================================
  Update_user_data(data: any) {
    const url = `${this.apiUrl}user/update`;
    const reqBody = {
      ID: data.ID,
      USER_NAME: data.USER_NAME,
      LOGIN_NAME: data.LOGIN_NAME,
      PASSWORD: data.PASSWORD,
      WHATSAPP_NO: data.WHATSAPP_NO,
      MOBILE: data.MOBILE,
      USER_ROLE: data.USER_ROLE,
      COMPANY_ID: data.COMPANY_ID,
      EMAIL: data.EMAIL,
      IS_INACTIVE: data.IS_INACTIVE,
    };

    return this.http.post(url, reqBody);
  }

  //============SELECT DATA===============
  get_User_Data_By_Id(ID: number) {
    return this.http.post(`${this.apiUrl}user/select/` + ID, {});
  }

  //===============DELETE DATA================
  remove_User_Data(ID: any) {
    return this.http.post(`${this.apiUrl}user/delete/${ID}`, {});
  }

  //==============================Api for package master=======================

  get_packages_list_api() {
    const getEndpoint = this.apiUrl + 'packing/List';
    return this.http.post(getEndpoint, {});
  }

  get_combinbation_list_api(payload: any) {
    const params = new HttpParams()
      .set('artNo', payload.artNo)
      .set('color', payload.color)
      .set('categoryID', payload.categoryID)
      .set('unitID', payload.unitID);

    const getEndpoint = this.apiUrl + 'packing/sizes-for-combination';
    return this.http.post(getEndpoint, {}, { params });
  }
  // selectArticle(id: number, payload: any) {

  //   return this.http.post<any>(`${this.apiUrl}article/select/${id}`, {}, { params });
  // }

  Add_packages_listapi(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}packing/Insert`, payload);
  }

  select_api_packing(id: any) {
    return this.http.post(`${this.apiUrl}packing/Select/${id}`, {});
  }

  Update_packages_listapi(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}packing/Update`, payload);
  }
  Delete_Package_Api(id: any) {
    const getEndpoint = this.apiUrl + `packing/Delete/${id}`;
    return this.http.post(getEndpoint, {});
  }
  //  Delete_Package_Api(id: any){
  //   const getEndpoint = this.apiUrl + `packing/Delete/${id}`;
  //   return this.http.post(getEndpoint,{});
  // }

  //==================login page=============================

  financial_year_api() {
    const reqBody = {
      NAME: 'FINANCIAL_YR',
    };
    return this.http.post(`${this.apiUrl}dropdown`, reqBody);
  }

  Company_api(items: any) {
    const data = items;
    return this.http.post(`${this.apiUrl}Login/initdata`, data);
  }

  //============LOGIN FUNCTION======
  // login_function_api(item:any){

  //   const payload=item;
  //       return this.http.post(`${this.apiUrl}packing/Update`, payload);

  //   }
  login_function_api(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}LOGIN/login`, payload);
  }

  //====================VIEW===================

  get_TransferOut_Api() {
    const getEndpoint = this.apiUrl + 'Transfer/list';
    return this.http.post(getEndpoint, {});
  }

  //========================ledger Statement================

  //=============head id dropdown===================
  HeadId_Dropdown_api(id: any) {
    const reqBody = {
      COMPANY_ID: id,
    };
    return this.http.post(`${this.apiUrl}AC_Report/initData`, reqBody);
  }

  //====================ledger list api=======================
  get_ladger_statement_api(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}AC_Report/ledger`, payload);
  }

  Journal_Booking_Api(payload) {
    const getEndpoint = `${this.apiUrl}JournalBook`;
    return this.http.post(getEndpoint, payload);
  }

  exportDataGridReport(e: any, fileName: any) {
    if (e.format === 'pdf') {
      const doc = new jsPDF();
      exportDataGridToPdf({
        jsPDFDocument: doc,
        component: e.component,
      }).then(() => {
        doc.save(`${fileName}.pdf`);
      });
    } else {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet(`${fileName}`);
      exportDataGridToXLSX({
        component: e.component,
        worksheet,
        autoFilterEnabled: true,
      }).then(() => {
        workbook.xlsx.writeBuffer().then((buffer) => {
          saveAs(
            new Blob([buffer], { type: 'application/octet-stream' }),
            `${fileName}.xlsx`
          );
        });
      });
      e.cancel = true;
    }
  }

  // REPORT============
  Trial_Balance_Api(payload) {
    const getEndpoint = this.apiUrl + 'AcReports/TrialBalance';
    return this.http.post(getEndpoint, payload);
  }

  //================================Fixed assests===============================

  list_Fixed_Asset_api() {
    return this.http.post(`${this.apiUrl}FixedAsset/list`, {});
  }
  //===============================Asset type dropdown==========

  Asset_type_Dropdown() {
    const payload = {
      NAME: 'ASSET_TYPE',
    };
    return this.http.post(`${this.apiUrl}dropdown`, payload);
  }
  Asset_Leger_Dropdown() {
    const payload = {
      NAME: 'LEDGER',
    };
    return this.http.post(`${this.apiUrl}dropdown`, payload);
  }
  //==============================APi for  Salary Head select==========================

  select_Fixed_Asset(id: any) {
    return this.http.post(`${this.apiUrl}FixedAsset/select/${id}`, {});
  }
  //==========================Api for  insert fixed Data=================================

  Add_Fixed_Asset_api(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}FixedAsset/save`, payload);
  }

  //==========================Api for  Update fixed Data=================================

  Update_Fixed_Asset_api(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}FixedAsset/update`, payload);
  }

  //===========================api for delete fixed asset===========

  Delete_FixedAsset_Api(id: any) {
    const getEndpoint = this.apiUrl + `FixedAsset/delete/${id}`;
    return this.http.post(getEndpoint, {});
  }
  //========================Add new fixed asset Type to dropdown value==========================

  Add_Fixed_Asset_Tpe(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}FixedAsset/assetsave`, payload);
  }
  //================================Depreciation API=========================================

  //==============================Active fixed Asset Lisst for grid============================

  Active_list_Fixed_Asset_api() {
    return this.http.post(`${this.apiUrl}Depreciation/FixedAsset/list`, {});
  }

  //=====================list of depreciation================================
  list_Depreciation_api() {
    return this.http.post(
      `${this.apiUrl}Depreciation/DepreciationList/List`,
      {}
    );
  }
  //===========================insert depreciation=============================

  Add_Depreciation_api(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}Depreciation/Insert`, payload);
  }

  //=============================select deprecition========================

  select_Depreciation_Asset(id: any) {
    return this.http.post(`${this.apiUrl}Depreciation/select/${id}`, {});
  }

  //===========================insert depreciation=============================

  Update_Depreciation_api(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}Depreciation/update`, payload);
  }

  Approve_Depreciation_api(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}Depreciation/approve`, payload);
  }

  //=============================dele deprecition========================

  Delete_Depreciation_Asset(id: any) {
    return this.http.post(`${this.apiUrl}Depreciation/delete/${id}`, {});
  }

  //==================================cash book=================================

  Cash_book_api(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}AC_Report/CashBook`, payload);
  }

  //=================PROFIT & LOSS===================
  Profit_Loss_Api(payload) {
    const getEndpoint = this.apiUrl + 'AC_Report/profitloss';
    return this.http.post(getEndpoint, payload);
  }

  //===========Balance sheet======================
  Balance_Sheet_Api(payload) {
    const getEndpoint = this.apiUrl + 'AC_Report/BalanceSheet';
    return this.http.post(getEndpoint, payload);
  }

  //===============SupplierStatemnt Report=====================
  Supplier_Report_Api(payload) {
    const getEndpoint = this.apiUrl + 'AC_Report/SupplierStatement';
    return this.http.post(getEndpoint, payload);
  }
  //===========Balance sheet======================
  customer_report_Api(payload) {
    const getEndpoint = this.apiUrl + 'AC_Report/custrpt';
    return this.http.post(getEndpoint, payload);
  }
  //===========Aged receivable sheet======================
  Aged_receivable_report_Api(payload) {
    const getEndpoint = this.apiUrl + 'AC_Report/custaging';
    return this.http.post(getEndpoint, payload);
  }

  //======================custmer statment details=============================

  Customer_statement_Details_Api(payload) {
    const getEndpoint = this.apiUrl + 'AC_Report/customerdtl';
    return this.http.post(getEndpoint, payload);
  }

  //===========Aged Payable Report===============
  AgedPayable_Report_Api(payload) {
    const getEndpoint = this.apiUrl + 'AC_Report/AgedPayable';
    return this.http.post(getEndpoint, payload);
  }

  SupplierDetails_Report_Api(payload) {
    const getEndpoint = this.apiUrl + 'AC_Report/SupplierStatementDetail';
    return this.http.post(getEndpoint, payload);
  }

  InputVat_Report_Api(payload) {
    const getEndpoint = this.apiUrl + 'AC_Report/inputvat';
    return this.http.post(getEndpoint, payload);
  }

  Output_VAT_Report_Api(payload) {
    const getEndpoint = this.apiUrl + 'AC_Report/outputvat';
    return this.http.post(getEndpoint, payload);
  }

  //============DEPARTMENT DROPDOWN==============
  Department_Dropdown() {
    const reqbody = { NAME: 'DEPARTMENTS' };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }
  //==============VAT Retrun==================
  VAT_Return_Report_Api(payload) {
    const getEndpoint = this.apiUrl + 'AC_Report/vatreturn';
    return this.http.post(getEndpoint, payload);
  }

  //=============================Prepayment Posting=================================

  Prepayment_pending_list(item: any) {
    const payload = item;
    const getEndpoint = this.apiUrl + 'PrePayment_Posting/list';
    return this.http.post(getEndpoint, payload);
  }

  Prepayment_posting_list() {
    const getEndpoint = this.apiUrl + 'PrePayment_Posting/prepaylist';
    return this.http.post(getEndpoint, {});
  }
  Insert_prepayment_data(item: any) {
    const payload = item;
    const getEndpoint = this.apiUrl + 'PrePayment_Posting/insert';
    return this.http.post(getEndpoint, payload);
  }
  Update_prepayment_data(item: any) {
    const payload = item;
    const getEndpoint = this.apiUrl + 'PrePayment_Posting/Edit';
    return this.http.post(getEndpoint, payload);
  }

  Approve_prepayment_data(item: any) {
    const payload = item;
    const getEndpoint = this.apiUrl + 'PrePayment_Posting/commit';
    return this.http.post(getEndpoint, payload);
  }

  select_Prepayment_Posting(id: any) {
    return this.http.post(`${this.apiUrl}PrePayment_Posting/select/${id}`, {});
  }

  Delete_Prepayment_Posting(id: any) {
    return this.http.post(`${this.apiUrl}PrePayment_Posting/delete/${id}`, {});
  }
  //===========================Ac ledger============

  get_ac_ledger_drp() {
    const name = {
      NAME: 'ACCOUNT_HEAD',
    };
    return this.http.post(`${this.apiUrl}dropdown`, name);
  }
  //   return this.http.post(`${this.apiUrl}dropdown`,name);

  // }

  //======================Stock Adjustment==============

  //=============item_list===================

  Get_item_list(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}StockAdjustment/list-items`, payload);
  }
  Insert_Stock_Adjustment_Data(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}StockAdjustment/save`, payload);
  }
  Update_Stock_Adjustment_Data(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}StockAdjustment/edit`, payload);
  }
  List_Stock_Adjustment_Data() {
    return this.http.post(`${this.apiUrl}StockAdjustment/list`, {});
  }
  select_Stock_Adjustment_Data(id: any) {
    return this.http.post(`${this.apiUrl}StockAdjustment/select/${id}`, {});
  }

  Delete_Stock_Adjustment_Data(id: any) {
    return this.http.post(`${this.apiUrl}StockAdjustment/delete/${id}`, {});
  }
  Approve_Stock_Adjustment_Data(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}StockAdjustment/Approve`, payload);
  }
  public getrReasonDropdownData(type: any): Observable<any> {
    const reqBodyData = { name: type };
    return this.http.post(`${this.apiUrl}dropdown/`, reqBodyData);
  }

  //================= Stock Movement Report ===================
  StockMovement_Api(payload) {
    const getEndpoint = this.apiUrl + 'StockMovementRpt/stockrpt';
    return this.http.post(getEndpoint, payload);
  }

  //DROPDOWN ITEM
  Item_Dropdown() {
    const reqbody = { NAME: 'PARENTITEM' };
    return this.http.post(`${this.apiUrl}dropdown`, reqbody);
  }

  get_DeliveryRteurn_Data() {
    const getEndpoint = this.apiUrl + 'Delivery_Return/list';
    return this.http.post(getEndpoint, {});
  }

  select_DeliveryRteurn_Data(id: any) {
    return this.http.post(`${this.apiUrl}Delivery_Return/select/${id}`, {});
  }

  get_DNList_Data(payload) {
    const getEndpoint = this.apiUrl + 'Delivery_Return/getdn';
    return this.http.post(getEndpoint, payload);
  }

  Insert_DeliveryReturn_Data(payload) {
    const getEndpoint = this.apiUrl + 'Delivery_Return/insert';
    return this.http.post(getEndpoint, payload);
  }

  Update_DeliveryReturn_Data(payload) {
    const getEndpoint = this.apiUrl + 'Delivery_Return/update';
    return this.http.post(getEndpoint, payload);
  }

  delete_DeliveryRteurn_Data(id: any) {
    return this.http.post(`${this.apiUrl}Delivery_Return/delete/${id}`, {});
  }

  Approve_DeliveryRteurn_Data(item: any) {
    const payload = item;
    return this.http.post(`${this.apiUrl}Delivery_Return/approve`, payload);
  }
}
