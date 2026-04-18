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


@Component({
  selector: 'app-miscellaneous-sales-invoice-form',
  templateUrl: './miscellaneous-sales-invoice-form.component.html',
  styleUrls: ['./miscellaneous-sales-invoice-form.component.scss']
})
export class MiscellaneousSalesInvoiceFormComponent {

  @ViewChild('popupGridRef', { static: false }) popupGridRef: any;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
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
    DOC_NO:0,
    COMPANY_ID: 0,
    STORE_ID: 0,
    TRANS_DATE: new Date(),
    CUSTOMER_ID: 0,
    PARTY_NAME: '',
    SALE_ID: 0,
    SALE_NO: '',
    IS_CREDIT: true,
    GROSS_AMOUNT: 0,
    TAX_AMOUNT: 0,
    NET_AMOUNT: 0,
    USER_ID: 0,
    NARRATION: '',
    CURRENCY_SYMBOL: '',
    IS_APPROVED: false,
    RET_NO: '',
    VEHICLE_NO: '',
    ROUND_OFF: false,
    Details: [
      {
        SL_NO: 1,
        ITEM_ID: 0,
        QUANTITY: 0,
        PRICE: 0,
        AMOUNT: 0,
        TAX_PERC: 0,
        TAX_AMOUNT: 0,
        TOTAL_AMOUNT: 0,
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
      this.isEditDataAvailable();
    }
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

          // 🔥 MOVE FOCUS HERE (THIS IS THE FIX)
          setTimeout(() => {
            const grid = this.itemsGridRef?.instance;
            grid.editCell(rowIndex, 'ledgerName');
          }, 50);
        }
      };
    }

    // ➤ ledgerName: move to particulars on Enter
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
        }

        // 🔥 MOVE TO PARTICULARS HERE
        setTimeout(() => {
          const grid = this.itemsGridRef?.instance;
          grid.editCell(rowIndex, 'particulars');
        }, 50);
      };

      // optional: Enter also moves (keyboard users)
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;

          setTimeout(() => {
            grid.editCell(rowIndex, 'particulars');
          }, 50);
        }
      };
    }

    if (e.dataField === 'particulars') {
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
          // ✅ simulate TAB key (DevExtreme handles this correctly)
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
              particulars: '',
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
  isEditDataAvailable() {}
  getItems() {}
  getItemsDescription() {}
    getDocNo() {
    const payload = {
      TRANS_TYPE: 105,
      COMPANY_ID: this.selectedCompanyId
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
