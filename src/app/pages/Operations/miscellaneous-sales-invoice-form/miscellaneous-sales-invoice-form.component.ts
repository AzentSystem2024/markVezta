import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components';
import { AddInvoiceRetailComponent } from '../../INVOICE/add-invoice-retail/add-invoice-retail.component';
import { DataService } from 'src/app/services';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-miscellaneous-sales-invoice-form',
  templateUrl: './miscellaneous-sales-invoice-form.component.html',
  styleUrls: ['./miscellaneous-sales-invoice-form.component.scss'],
})
export class MiscellaneousSalesInvoiceFormComponent {
  @ViewChild('popupGridRef', { static: false }) popupGridRef: any;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() canApprove: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: boolean = true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  customerList: any;
  mainGridData: any;
  salesReturnFormData: any;
  invoiceFormData: any = {
    COMPANY_ID: 0,
    STORE_ID: 0,
    TRANS_DATE: new Date(),
    REF_NO: '',
    CUSTOMER_ID: 0,
    FIN_ID: 0,
    TRANS_TYPE: 1,

    GROSS_AMOUNT: 0,
    TAX_AMOUNT: 0,
    NET_AMOUNT: 0,

    USER_ID: 0,
    NARRATION: '',
    IS_APPROVED: false,
    Details: [
      {
        SL_NO: 1,

        REMARKS: '',
        ledgerCode: null,
        ledgerName: '',
        HEAD_ID: null,
        GST_PERC: 0,
        Amount: 0,
        gstAmount: 0,
        TOTAL: 0,
      },
    ],
  };
  selectedCompanyId: any;
  userID: any;
  finID: any;
  vatTitle: any;
  retNo: any;
  sessionData: any;
  selected_vat_id: any;
  itemsList: any;
  itemsDescriptionList: any;
  isSaving: boolean = false;
  storeID: any;
  invalidQtyRowIndex: number | null = null;
  ledgerList: any;
  VatClass: any;
  constructor(private dataService: DataService) {}

  ngOnChanges() {
    console.log(this.EditingResponseData, 'EditingResponseData');
    if (this.isEditing && this.EditingResponseData) {
      this.waitAndBind();
    }
  }

  waitAndBind() {
    if (!this.ledgerList || this.ledgerList.length === 0) {
      setTimeout(() => this.waitAndBind(), 100);
      return;
    }

    this.isEditDataAvailable();
  }

  ngOnInit() {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return;

    const userData = JSON.parse(userDataString);
    this.storeID = userData.Configuration[0].STORE_ID;
    console.log(userData.Configuration[0].STORE_ID, 'USERDATA');
    const selectedCompany = userData.SELECTED_COMPANY;
    this.vatTitle = userData.GeneralSettings.VAT_TITLE;
    // SINGLE SOURCE OF TRUTH
    this.selectedCompanyId = selectedCompany.COMPANY_ID;
    this.invoiceFormData.COMPANY_ID = selectedCompany.COMPANY_ID; // correct
    this.userID = userData.USER_ID;
    this.finID = userData.FINANCIAL_YEARS[0].FIN_ID;
    this.invoiceFormData.COMPANY_ID = selectedCompany.COMPANY_ID;
    // this.HSNCODE = userData.GeneralSettings.HSN_CODE;
    // this.GST = userData.GeneralSettings.GST_PERC;

    if (userData.USER_ID) {
      this.invoiceFormData.USER_ID = userData.USER_ID;
    }

    const firstFinYear = userData.FINANCIAL_YEARS?.[0];
    if (firstFinYear?.FIN_ID) {
      this.invoiceFormData.FIN_ID = firstFinYear.FIN_ID;
    }
    this.getLedgerCodeDropdown();
    this.getVatPercentList();
    if (!this.isEditing) {
      this.getDocNo();
    }
    this.getCustomerOrUnitLst();
    this.sessionData_tax();
    this.mainGridData = [
      {
        ITEM_ID: null,
        TRANSFER_NO: '',
      },
    ];
  }

  getVatPercentList() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
      NAME: 'VAT_PERC',
    };

    this.dataService.getDropdownData(payload).subscribe((data) => {
      this.VatClass = data.map((item: any) => ({
        ...item,
        VALUE: Number(item.DESCRIPTION).toString(),
      }));
    });
  }
  getLedgerCodeDropdown() {
    this.dataService.getActiveLedger().subscribe((response: any) => {
      this.ledgerList = response.Data;
    });
  }

  updateSlNo() {
    this.invoiceFormData.Details.forEach((row: any, index: number) => {
      row.SL_NO = index + 1;
    });
  }

  onCancel() {
    this.popupClosed.emit();
  }

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'ledgerCode' ||
      e.dataField === 'ledgerName' ||
      e.dataField === 'particulars' ||
      e.dataField === 'Amount' ||
      e.dataField === 'GST_PERC' ||
      e.dataField === 'gstAmount'
    ) {
      e.editorOptions = e.editorOptions || {};

      e.editorOptions.elementAttr = {
        style: `
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      `,
      };

      e.editorOptions.inputAttr = {
        style: `
        height: 100%;
        padding: 0 4px;
        box-sizing: border-box;
      `,
      };

      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }
    }

    if (e.parentType !== 'dataRow') return;

    const rowIndex = e.row?.rowIndex;
    const grid = this.itemsGridRef?.instance;

    // =========================
    // ✅ LEDGER CODE
    // =========================
    if (e.dataField === 'ledgerCode') {
      e.editorOptions.onFocusIn = (args: any) => {
        setTimeout(() => args.component.open(), 0);
      };

      e.editorOptions.onValueChanged = (args: any) => {
        const selectedLedger = this.ledgerList.find(
          (item: any) => item.HEAD_CODE === args.value,
        );

        e.setValue(args.value);

        if (selectedLedger) {
          // ✅ UI update
          grid.cellValue(rowIndex, 'ledgerName', selectedLedger.HEAD_NAME);
          grid.cellValue(rowIndex, 'HEAD_ID', selectedLedger.HEAD_ID);

          // ✅ DATA SOURCE update (CRITICAL FIX)
          const rowData = this.invoiceFormData.Details[rowIndex];
          rowData.ledgerCode = selectedLedger.HEAD_CODE;
          rowData.ledgerName = selectedLedger.HEAD_NAME;
          rowData.HEAD_ID = selectedLedger.HEAD_ID;

          // Move focus
          setTimeout(() => {
            grid.editCell(rowIndex, 'ledgerName');
          }, 50);
        }
      };
    }

    // =========================
    // ✅ LEDGER NAME
    // =========================
    if (e.dataField === 'ledgerName') {
      e.editorOptions.onFocusIn = (args: any) => {
        setTimeout(() => args.component.open(), 0);
      };

      e.editorOptions.onValueChanged = (args: any) => {
        const selectedLedger = this.ledgerList.find(
          (item: any) => item.HEAD_NAME === args.value,
        );

        e.setValue(args.value);

        if (selectedLedger) {
          // ✅ UI update
          grid.cellValue(rowIndex, 'ledgerCode', selectedLedger.HEAD_CODE);
          grid.cellValue(rowIndex, 'HEAD_ID', selectedLedger.HEAD_ID);

          // ✅ DATA SOURCE update
          const rowData = this.invoiceFormData.Details[rowIndex];
          rowData.ledgerCode = selectedLedger.HEAD_CODE;
          rowData.ledgerName = selectedLedger.HEAD_NAME;
          rowData.HEAD_ID = selectedLedger.HEAD_ID;

          // Move focus
          setTimeout(() => {
            grid.editCell(rowIndex, 'particulars');
          }, 50);
        }
      };

      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          setTimeout(() => {
            grid.editCell(rowIndex, 'particulars');
          }, 50);
        }
      };
    }

    // =========================
    // ✅ PARTICULARS
    // =========================
    if (e.dataField === 'particulars') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          setTimeout(() => {
            grid.editCell(rowIndex, 'Amount');
          }, 50);
        }
      };
    }

    // =========================
    // ✅ AMOUNT
    // =========================
    if (e.dataField === 'Amount') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const tabEvent = new KeyboardEvent('keydown', {
            key: 'Tab',
            code: 'Tab',
            keyCode: 9,
            which: 9,
            bubbles: true,
          });

          event.event.target.dispatchEvent(tabEvent);
        }
      };
    }

    // =========================
    // ✅ GST %
    // =========================
    if (e.dataField === 'GST_PERC') {
      const original = e.editorOptions.onValueChanged;

      e.editorOptions.onValueChanged = (args: any) => {
        if (original) original(args);

        e.setValue(args.value);

        const rowData = this.invoiceFormData.Details[rowIndex];

        rowData.GST_PERC = args.value;
        rowData.CGST = 0;
        rowData.SGST = 0;
      };

      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          setTimeout(() => {
            grid.saveEditData();

            if (this.hasEmptyRow()) return;

            const newRow = {
              SL_NO: this.invoiceFormData.Details.length + 1,
              ledgerCode: '',
              ledgerName: '',
              particulars: '',
              Amount: '',
              GST_PERC: '',
              GST: 0,
              CGST: 0,
              SGST: 0,
              gstAmount: '',
              HEAD_ID: null,
            };

            this.invoiceFormData.Details.push(newRow);
            this.updateSlNo();

            grid.option('dataSource', [...this.invoiceFormData.Details]);
            grid.refresh();

            setTimeout(() => {
              const visibleRows = grid.getVisibleRows();
              const newRowIndex = visibleRows.findIndex(
                (r) => r.data === newRow,
              );

              if (newRowIndex >= 0) {
                grid.editCell(newRowIndex, 'ledgerCode');
              }
            }, 100);
          }, 50);
        }
      };

      e.editorOptions.onFocusIn = (args: any) => {
        setTimeout(() => args.component.open(), 0);
      };
    }

    // =========================
    // ✅ CGST / SGST
    // =========================
    if (e.dataField === 'CGST' || e.dataField === 'SGST') {
      const original = e.editorOptions.onValueChanged;

      e.editorOptions.onValueChanged = (args: any) => {
        if (original) original(args);

        e.setValue(args.value);

        const rowData = this.invoiceFormData.Details[rowIndex];
        rowData.GST_PERC = 0;
      };
    }
  }

  addNewRow() {
    const grid = this.itemsGridRef?.instance;

    // ❌ prevent multiple empty rows
    if (this.hasEmptyRow()) {
      return;
    }

    const newRow = {
      SL_NO: (this.invoiceFormData.Details?.length || 0) + 1,
      ledgerCode: '',
      ledgerName: '',
      particulars: '',
      Amount: '',
      GST_PERC: '',
      GST: 0,
      CGST: 0,
      SGST: 0,
      gstAmount: '',
      HEAD_ID: null,
    };

    this.invoiceFormData.Details.push(newRow);

    grid.option('dataSource', [...this.invoiceFormData.Details]);
    grid.refresh();

    setTimeout(() => {
      const visibleRows = grid.getVisibleRows();
      const newRowIndex = visibleRows.findIndex((r) => r.data === newRow);

      if (newRowIndex >= 0) {
        grid.editCell(newRowIndex, 'ledgerCode');
      }
    }, 100);
  }
  hasEmptyRow(): boolean {
    return this.invoiceFormData.Details?.some(
      (row: any) =>
        !row.ledgerCode && !row.ledgerName && !row.particulars && !row.Amount,
    );
  }

  convertToDate(dateValue: any): Date | null {
    if (!dateValue) return null;

    const [dd, mm, yyyy] = dateValue.split('-');
    return new Date(+yyyy, +mm - 1, +dd);
  }

  isEditDataAvailable() {
    const data = this.EditingResponseData;
    const details = data.Details || [];

    this.invoiceFormData = {
      ...this.invoiceFormData,

      //  COMPANY_ID: this.invoiceFormData.COMPANY_ID,,
      STORE_ID: data.STORE_ID,
      DOC_NO: data.SALE_NO,
      TRANS_DATE: this.convertToDate(data.TRANS_DATE),
      TRANS_ID: data.TRANS_ID,
      CUSTOMER_ID: data.CUSTOMER_ID,
      REF_NO: data.REF_NO,

      GROSS_AMOUNT: data.GROSS_AMOUNT,
      TAX_AMOUNT: data.TAX_AMOUNT,
      NET_AMOUNT: data.NET_AMOUNT,

      USER_ID: this.userID,
      NARRATION: data.NARRATION,
    };

    this.invoiceFormData.Details = details.map((item: any, index: number) => {
      const ledger = this.ledgerList?.find(
        (l: any) => l.HEAD_ID == item.HEAD_ID,
      );

      return {
        SL_NO: index + 1,

        ledgerCode: ledger?.HEAD_CODE || '',
        ledgerName: ledger?.HEAD_NAME || '',
        HEAD_ID: item.HEAD_ID,

        Amount: item.AMOUNT,
        GST_PERC: item.TAX_PERC,
        gstAmount: item.TAX_AMOUNT,
        TOTAL: item.TOTAL_AMOUNT,

        particulars: item.REMARKS || '',
      };
    });

    setTimeout(() => {
      this.itemsGridRef?.instance?.option(
        'dataSource',
        this.invoiceFormData.Details,
      );
      this.itemsGridRef?.instance?.refresh();
    });
  }

  getItems() {}
  getItemsDescription() {}
  getDocNo() {
    const payload = {
      TRANS_TYPE: 105,
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.invoiceFormData.DOC_NO = response.DOC_NO;
    });
  }

  calculateGSTAmount(rowData: any) {
    const amount = rowData.Amount || 0;
    const perc = rowData.GST_PERC || 0;

    return (amount * perc) / 100;
  }

  calculateTotal(rowData: any) {
    const amount = rowData.Amount || 0;
    const perc = rowData.GST_PERC || 0;

    const gstAmount = (amount * perc) / 100;

    return amount + gstAmount;
  }

  getCustomerOrUnitLst() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService
      .getOutsideCustomerWithState(payload)
      .subscribe((response: any) => {
        this.customerList = response;
      });
  }

  formatDateYYYYMMDD(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }

  saveInvoice() {
    const grid = this.itemsGridRef?.instance;

    // 1. Save pending edits
    if (grid) {
      grid.saveEditData();
    }

    // 2. Approval check
    if (this.invoiceFormData.IS_APPROVED === true) {
      confirm(
        'Are you sure you want to approve and commit this invoice?',
        'Confirmation',
      ).then((result: boolean) => {
        if (result) {
          this.proceedSave();
        }
      });
    } else {
      this.proceedSave();
    }
  }

  proceedSave() {
    this.isSaving = true;

    const filteredDetails = (this.invoiceFormData.Details || []).filter(
      (row: any) =>
        row.ledgerCode || row.ledgerName || row.REMARKS || row.Amount,
    );

    if (filteredDetails.length === 0) {
      this.isSaving = false;

      notify(
        'Please enter at least one valid row before saving',
        'warning',
        2000,
      );
      return;
    }

    //  Ensure HEAD_ID
    filteredDetails.forEach((row: any) => {
      if (!row.HEAD_ID) {
        const found = this.ledgerList.find(
          (l: any) =>
            l.HEAD_CODE == row.ledgerCode || l.HEAD_NAME == row.ledgerName,
        );

        if (found) {
          row.HEAD_ID = found.HEAD_ID;
        }
      }
    });

    //  Payload
    // const payload = {
    //   TRANS_ID: this.invoiceFormData.TRANS_ID || 0,

    //   COMPANY_ID: this.invoiceFormData.COMPANY_ID,
    //   STORE_ID: this.storeID,
    //   PURCH_DATE: new Date(this.invoiceFormData.TRANS_DATE).toISOString(),
    //   SUPP_ID: this.invoiceFormData.SUPP_ID,
    //   FIN_ID: this.invoiceFormData.FIN_ID,
    //   PURCH_TYPE: 1,

    //   GROSS_AMOUNT: filteredDetails.reduce(
    //     (sum: number, r: any) => sum + (Number(r.Amount) || 0),
    //     0,
    //   ),

    //   TAX_AMOUNT: filteredDetails.reduce(
    //     (sum: number, r: any) => sum + this.calculateGSTAmount(r),
    //     0,
    //   ),

    //   NET_AMOUNT: filteredDetails.reduce(
    //     (sum: number, r: any) => sum + this.calculateTotal(r),
    //     0,
    //   ),

    //   USER_ID: this.invoiceFormData.USER_ID,
    //   NARRATION: this.invoiceFormData.NARRATION,
    //   IS_APPROVED: this.invoiceFormData.IS_APPROVED,

    //   Details: filteredDetails.map((row: any) => ({
    //     COMPANY_ID: this.invoiceFormData.COMPANY_ID,
    //     STORE_ID: this.storeID,
    //     HEAD_ID: row.HEAD_ID,

    //     VAT_PERC: Number(row.GST_PERC) || 0,
    //     VAT_AMOUNT: this.calculateGSTAmount(row),

    //     AMOUNT: Number(row.Amount) || 0,
    //     TOTAL_AMOUNT: this.calculateTotal(row),
    //   })),
    // };

    const payload = {
      TRANS_ID: this.invoiceFormData.TRANS_ID || 0,
      COMPANY_ID: this.invoiceFormData.COMPANY_ID,
      STORE_ID: this.storeID,
      FIN_ID: this.invoiceFormData.FIN_ID,

      TRANS_DATE: this.formatDateYYYYMMDD(this.invoiceFormData.TRANS_DATE),
      REF_NO: this.invoiceFormData.REF_NO || '',
      CUSTOMER_ID: this.invoiceFormData.CUSTOMER_ID, // mapped
      PARTY_NAME: this.invoiceFormData.PARTY_NAME || '',

      NARRATION: this.invoiceFormData.NARRATION,
      CREATE_USER_ID: this.invoiceFormData.USER_ID,
      GROSS_AMOUNT: filteredDetails.reduce(
        (sum: number, r: any) => sum + (Number(r.Amount) || 0),
        0,
      ),

      TAX_AMOUNT: filteredDetails.reduce(
        (sum: number, r: any) => sum + this.calculateGSTAmount(r),
        0,
      ),

      NET_AMOUNT: filteredDetails.reduce(
        (sum: number, r: any) => sum + this.calculateTotal(r),
        0,
      ),

      IS_APPROVED: this.invoiceFormData.IS_APPROVED,

      DETAILS: filteredDetails.map((row: any) => ({
        COMPANY_ID: this.invoiceFormData.COMPANY_ID,
        STORE_ID: this.storeID,

        HEAD_ID: row.HEAD_ID,

        AMOUNT: Number(row.Amount) || 0,

        TAX_PERC: Number(row.GST_PERC) || 0,
        TAX_AMOUNT: this.calculateGSTAmount(row),
        REMARKS: row.particulars,
        TOTAL_AMOUNT: this.calculateTotal(row),
      })),
    };

    // API Decision Logic (IMPORTANT)
    let request$;

    if (!this.isEditing) {
      //  ADD
      request$ = this.dataService.insertMiscSalesInvoice(payload);
    } else {
      if (this.invoiceFormData.IS_APPROVED) {
        // EDIT + APPROVE
        request$ = this.dataService.ApproveMiscSalesInvoice(payload);
      } else {
        // EDIT ONLY
        request$ = this.dataService.UpdateMiscSalesInvoice(payload);
      }
    }

    request$.subscribe({
      next: () => {
        this.isSaving = false;

        let message = '';

        if (!this.isEditing) {
          message = this.invoiceFormData.IS_APPROVED
            ? 'Invoice approved successfully'
            : 'Invoice saved successfully';
        } else {
          message = this.invoiceFormData.IS_APPROVED
            ? 'Invoice approved successfully'
            : 'Invoice updated successfully';
        }

        notify(message, 'success', 2000);

        this.popupClosed.emit();
      },
      error: () => {
        this.isSaving = false;
        notify('Error while saving invoice', 'error', 2000);
      },
    });
  }

  sessionData_tax() {}
  onCellValueChanged(e: any) {}
  onRowRemoved() {
    this.updateSlNo();
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
    FormTextboxModule,
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
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
  ],
  providers: [],
  declarations: [MiscellaneousSalesInvoiceFormComponent],
  exports: [MiscellaneousSalesInvoiceFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MiscellaneousSalesInvoiceFormModule {}
