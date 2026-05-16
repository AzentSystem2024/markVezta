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
  selector: 'app-misc-purch-invoice-form',
  templateUrl: './misc-purch-invoice-form.component.html',
  styleUrls: ['./misc-purch-invoice-form.component.scss'],
})
export class MiscPurchInvoiceFormComponent {
  @ViewChild('popupGridRef', { static: false }) popupGridRef: any;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() canApprove: boolean = false;
  @Input() isVerifyMode: boolean = false;
  @Input() isApproveMode: boolean = false;
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
    SUPP_ID: 0,
    FIN_ID: 0,
    PURCH_TYPE: 1,

    GROSS_AMOUNT: 0,
    TAX_AMOUNT: 0,
    NET_AMOUNT: 0,

    USER_ID: 0,
    NARRATION: '',
    IS_APPROVED: false,

    Details: [
      {
        REMARKS: '',
        SL_NO: 1,

        ledgerCode: null,
        ledgerName: '',
        HEAD_ID: null,

        Amount: 0,
        GST_PERC: 0,

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
  supplierList: any;
  constructor(private dataService: DataService) {}

  ngOnChanges() {
    console.log(this.EditingResponseData, 'EditingResponseData');
    // if (this.isEditing && this.EditingResponseData) {
    //   this.isEditDataAvailable();
    // }
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
    this.getSupplierLst();
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

  getDocNo() {
    const payload = {
      TRANS_TYPE: 43,
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.retNo = response.DOC_NO;
      this.invoiceFormData.PURCH_NO = response.DOC_NO;
    });
  }
  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    const data = this.EditingResponseData;
    const details = data.Details || [];
    console.log(data.TRANS_ID, 'TRANSIDDDDDDDDDDDD');
    // PATCH HEADER (no breaking changes)
    this.invoiceFormData = {
      ...this.invoiceFormData,

      COMPANY_ID: data.COMPANY_ID,
      STORE_ID: data.STORE_ID,
      TRANS_DATE: this.convertToDate(data.PURCH_DATE),
      TRANS_ID: data.TRANS_ID,
      SUPP_ID: data.SUPP_ID,
      FIN_ID: data.FIN_ID,
      PURCH_TYPE: data.PURCH_TYPE,
      REF_NO: data.REF_NO,
      PURCH_NO: data.PURCH_NO,
      GROSS_AMOUNT: data.GROSS_AMOUNT,
      TAX_AMOUNT: data.TAX_AMOUNT,
      NET_AMOUNT: data.NET_AMOUNT,

      USER_ID: data.USER_ID,
      NARRATION: data.NARRATION,
      IS_APPROVED: data.IS_APPROVED,
    };

    // ✅ PATCH GRID (IMPORTANT PART)
    this.invoiceFormData.Details = details.map((item: any, index: number) => {
      const ledger = this.ledgerList?.find(
        (l: any) => l.HEAD_ID == item.HEAD_ID,
      );

      return {
        SL_NO: index + 1,

        // ✅ restore UI fields from HEAD_ID
        ledgerCode: ledger?.HEAD_CODE || '',
        ledgerName: ledger?.HEAD_NAME || '',
        HEAD_ID: item.HEAD_ID,
        REMARKS: item.REMARKS,
        // ✅ amounts
        Amount: item.AMOUNT,
        GST_PERC: item.VAT_PERC,

        // ✅ calculated (optional but good)
        gstAmount: item.VAT_AMOUNT,
        TOTAL: item.TOTAL_AMOUNT,
      };
    });

    // ✅ refresh grid
    setTimeout(() => {
      this.itemsGridRef?.instance?.option(
        'dataSource',
        this.invoiceFormData.Details,
      );
      this.itemsGridRef?.instance?.refresh();
    }, 50);
  }

  convertToDate(dateValue: any): Date | null {
    if (!dateValue) return null;

    // Handles ISO string like "2026-04-18T06:12:12.429Z"
    return new Date(dateValue);
  }
  getSupplierLst() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService
      .getSupplierWithState(payload)
      .subscribe((response: any) => {
        this.supplierList = response;
      });
  }
  getVatPercentList() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
      NAME: 'VAT_PERC',
    };

    this.dataService.getDropdownData(payload).subscribe((data) => {
      this.VatClass = data.map((item: any) => ({
        ...item,
        VALUE: item.ID,
      }));
    });
  }
  getLedgerCodeDropdown() {
    this.dataService.getActiveLedger().subscribe((response: any) => {
      this.ledgerList = response.Data;
      if (this.isEditing && this.EditingResponseData) {
        this.isEditDataAvailable();
      }
    });
  }

  updateSlNo() {
    this.invoiceFormData.Details.forEach((row: any, index: number) => {
      row.SL_NO = index + 1;
    });
  }
  calculateTaxAmount = (rowData: any) => {
    const amount = Number(rowData.Amount) || 0;

    let gstPerc = Number(rowData.GST_VALUE) || 0;

    // fallback if GST_VALUE not set
    if (!gstPerc && rowData.GST_PERC) {
      const vat = this.VatClass.find((v: any) => v.ID == rowData.GST_PERC);
      gstPerc = Number(vat?.DESCRIPTION) || 0;
    }

    return (amount * gstPerc) / 100;
  };

  calculateTotal = (rowData: any) => {
    const amount = Number(rowData.Amount) || 0;
    const gstAmount = this.calculateTaxAmount(rowData) || 0;

    return amount + gstAmount;
  };
  onEditorPreparing(e: any) {
    if (
      e.dataField === 'ledgerCode' ||
      e.dataField === 'ledgerName' ||
      e.dataField === 'REMARKS' ||
      e.dataField === 'Amount' ||
      e.dataField === 'GST_PERC' ||
      e.dataField === 'gstAmount'
    ) {
      e.editorOptions = e.editorOptions || {};

      // Let the editor inherit row height naturally (no fixed height)
      e.editorOptions.elementAttr = {
        style: `
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      `,
      };

      // Make sure the input fits snugly inside
      e.editorOptions.inputAttr = {
        style: `
        height: 100%;
        padding: 0 4px;
        box-sizing: border-box;
      `,
      };

      // Remove spin buttons to prevent layout changes
      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }
    }
    if (e.parentType !== 'dataRow') return;
    const rowIndex = e.row?.rowIndex;

    if (e.dataField === 'ledgerCode') {
      // ✅ Open dropdown on focus
      e.editorOptions.onFocusIn = (args: any) => {
        setTimeout(() => {
          args.component.open();
        }, 0);
      };

      // ❌ REMOVE your existing onKeyDown completely

      // ✅ Move on value selection
      e.editorOptions.onValueChanged = (args: any) => {
        const selectedLedger = this.ledgerList.find(
          (item: any) => item.HEAD_CODE === args.value,
        );

        e.setValue(args.value);

        if (selectedLedger) {
          // bind ledger name
          e.component.cellValue(
            rowIndex,
            'ledgerName',
            selectedLedger.HEAD_NAME,
          );
          e.component.cellValue(rowIndex, 'HEAD_ID', selectedLedger.HEAD_ID);
          // 🔥 MOVE FOCUS HERE (THIS IS THE FIX)
          setTimeout(() => {
            const grid = this.itemsGridRef?.instance;
            grid.editCell(rowIndex, 'ledgerName');
          }, 50);
        }
      };
    }

    // ➤ ledgerName: move to REMARKS on Enter
    if (e.dataField === 'ledgerName') {
      // open dropdown on focus
      e.editorOptions.onFocusIn = (args: any) => {
        setTimeout(() => {
          args.component.open();
        }, 0);
      };

      // 🔥 MAIN FIX: move on selection
      e.editorOptions.onValueChanged = (args: any) => {
        const selectedLedger = this.ledgerList.find(
          (item: any) => item.HEAD_NAME === args.value,
        );

        e.setValue(args.value);

        if (selectedLedger) {
          // sync code
          e.component.cellValue(
            rowIndex,
            'ledgerCode',
            selectedLedger.HEAD_CODE,
          );
          e.component.cellValue(rowIndex, 'HEAD_ID', selectedLedger.HEAD_ID);
        }

        // 🔥 MOVE TO PARTICULARS HERE
        setTimeout(() => {
          const grid = this.itemsGridRef?.instance;
          grid.editCell(rowIndex, 'REMARKS');
        }, 50);
      };

      // optional: Enter also moves (keyboard users)
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;

          setTimeout(() => {
            grid.editCell(rowIndex, 'REMARKS');
          }, 50);
        }
      };
    }

    if (e.dataField === 'REMARKS') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = e.component;
          const rowIndex = e.row.rowIndex;
          // Move focus to the "ledgerCode" column in the same row
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'Amount'));
          });
        }
      };
    }
    if (e.dataField === 'Amount') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          //simulate TAB key (DevExtreme handles this correctly)
          const eKey = event.event;

          const tabEvent = new KeyboardEvent('keydown', {
            key: 'Tab',
            code: 'Tab',
            keyCode: 9,
            which: 9,
            bubbles: true,
          });

          eKey.target.dispatchEvent(tabEvent);
        }
      };
    }
    if (e.dataField === 'GST_PERC') {
      // existing logic (keep it)
      const original = e.editorOptions.onValueChanged;
      e.editorOptions.onValueChanged = (args: any) => {
        if (original) original(args);
        e.setValue(args.value);

        e.row.data.CGST = 0;
        e.row.data.SGST = 0;
        const selectedVat = this.VatClass.find((v: any) => v.ID == args.value);

        e.row.data.GST_VALUE = Number(selectedVat?.DESCRIPTION) || 0;
      };

      //  NEW: Enter → add row
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;

          setTimeout(() => {
            //  1. Commit current edit
            grid.saveEditData();

            //  2. Create new row
            const newRow = {
              SL_NO: this.invoiceFormData.Details.length + 1,
              ledgerCode: '',
              ledgerName: '',
              REMARKS: '',
              Amount: '',
              GST_PERC: '',
              GST: 0,
              CGST: 0,
              SGST: 0,
              gstAmount: '',
              HEAD_ID: null,
            };

            //Only ONE push
            if (this.hasEmptyRow()) {
              return; // stop if empty row exists
            }

            this.invoiceFormData.Details.push(newRow);
            this.updateSlNo();
            // 3. Refresh grid
            grid.option('dataSource', [...this.invoiceFormData.Details]);
            grid.refresh();

            // 4. Focus new row first column
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

      // keep dropdown auto-open
      e.editorOptions.onFocusIn = (args: any) => {
        setTimeout(() => {
          args.component.open();
        }, 0);
      };
    }

    if (e.dataField === 'CGST' || e.dataField === 'SGST') {
      const originalOnValueChanged = e.editorOptions.onValueChanged;

      e.editorOptions.onValueChanged = (args: any) => {
        if (originalOnValueChanged) {
          originalOnValueChanged(args);
        }

        e.setValue(args.value);

        // ✅ CLEAR IGST WHEN CGST / SGST IS ENTERED
        e.row.data.GST_PERC = 0;
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
      REMARKS: '',
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
        !row.ledgerCode && !row.ledgerName && !row.REMARKS && !row.Amount,
    );
  }

  formatDateOnly(date: any): string {
    if (!date) return '';

    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  saveInvoice() {
    const grid = this.itemsGridRef?.instance;

    // 1. Save pending edits
    if (grid) {
      grid.saveEditData();
    }

    // 2. Approval check
    if (this.invoiceFormData.IS_APPROVED === true || this.isApproveMode) {
      confirm(
        'Are you sure you want to approve and commit this invoice?',
        'Confirmation',
      ).then((result: boolean) => {
        if (result) {
          this.proceedSave();
        }
      });
    } else if (this.isVerifyMode) {
      confirm(
        'Are you sure you want to verify this invoice?',
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

    // ✅ Ensure HEAD_ID
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

    // ✅ Payload
    const payload = {
      TRANS_ID: this.invoiceFormData.TRANS_ID || 0,

      COMPANY_ID: this.selectedCompanyId,
      STORE_ID: this.storeID,
      PURCH_DATE: this.formatDateOnly(this.invoiceFormData.TRANS_DATE),
      SUPP_ID: this.invoiceFormData.SUPP_ID,
      FIN_ID: this.invoiceFormData.FIN_ID,
      PURCH_TYPE: 1,

      GROSS_AMOUNT: filteredDetails.reduce(
        (sum: number, r: any) => sum + (Number(r.Amount) || 0),
        0,
      ),

      TAX_AMOUNT: filteredDetails.reduce(
        (sum: number, r: any) => sum + this.calculateTaxAmount(r),
        0,
      ),

      NET_AMOUNT: filteredDetails.reduce(
        (sum: number, r: any) => sum + this.calculateTotal(r),
        0,
      ),

      USER_ID: this.userID,
      NARRATION: this.invoiceFormData.NARRATION,
      IS_APPROVED: this.invoiceFormData.IS_APPROVED,
      REF_NO: this.invoiceFormData.REF_NO,
      IS_VERIFIED: this.isVerifyMode ? true : false,
      Details: filteredDetails.map((row: any) => ({
        COMPANY_ID: this.selectedCompanyId,
        STORE_ID: this.storeID,
        HEAD_ID: row.HEAD_ID,
        REMARKS: row.REMARKS,
        VAT_PERC: Number(row.GST_PERC) || 0,
        VAT_AMOUNT: this.calculateTaxAmount(row),

        AMOUNT: Number(row.Amount) || 0,
        TOTAL_AMOUNT: this.calculateTotal(row),
      })),
    };

    // API Decision Logic (IMPORTANT)
    let request$;

    if (!this.isEditing) {
      //  ADD
      request$ = this.dataService.saveMiscPurchInvoice(payload);
    } else if (this.isVerifyMode) {
      // VERIFY
      request$ = this.dataService.updateMiscPurchInvoice(payload);
    } else {
      if (this.invoiceFormData.IS_APPROVED || this.isApproveMode) {
        // EDIT + APPROVE
        request$ = this.dataService.approveMiscPurchInvoice(payload);
      } else {
        // EDIT ONLY
        request$ = this.dataService.updateMiscPurchInvoice(payload);
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
        } else if (this.isVerifyMode) {
          message = this.invoiceFormData.IS_VERIFIED
            ? 'Invoice verified successfully'
            : 'Invoice verified successfully';
        } else if (this.isApproveMode) {
          message = 'Invoice approved successfully';
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

  cancel() {
    this.popupClosed.emit();
  }

  getCustomerOrUnitLst() {}
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
  declarations: [MiscPurchInvoiceFormComponent],
  exports: [MiscPurchInvoiceFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MiscPurchInvoiceFormModule {}
