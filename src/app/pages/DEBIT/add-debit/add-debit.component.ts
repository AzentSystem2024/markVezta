import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
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
  DxSelectBoxComponent,
  DxTextBoxComponent,
  DxNumberBoxComponent,
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
import { DataService } from 'src/app/services';
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddCreditNoteComponent } from '../../CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-add-debit',
  templateUrl: './add-debit.component.html',
  styleUrls: ['./add-debit.component.scss'],
})
export class AddDebitComponent {
  @ViewChild('companyRef', { static: false }) companyRef!: DxSelectBoxComponent;
  @ViewChild('invoiceBoxRef', { static: false })
  invoiceBoxRef!: DxTextBoxComponent;
  @ViewChild('companySelectBoxRef', { static: false })
  companySelectBoxRef!: DxSelectBoxComponent;
  @ViewChild('dueAmountRef', { static: false })
  dueAmountRef!: DxNumberBoxComponent;
  @ViewChild('narrationRef', { static: false })
  narrationRef!: DxTextBoxComponent;
  @ViewChild('saveButtonRef', { static: false }) saveButtonRef!: any;
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;

  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  noteDetails: any;
  ledgerList: any;
  companyList: any;
  sessionData: any;
  selected_vat_id: any;
  dropdownJustOpened = false;
  debitFormData: any = {
    TRANS_TYPE: 36,
    COMPANY_ID: 1,
    STORE_ID: 1,
    TRANS_DATE: new Date(),
    TRANS_STATUS: 1,
    SUPP_ID: 0,
    NARRATION: '',
    INVOICE_ID: 0,
    INVOICE_NO: '',
    UNIT_ID: '',
    NOTE_DETAIL: [
      {
        SL_NO: '',
        HEAD_ID: '',
        AMOUNT: '',
        GST_AMOUNT: '',
        REMARKS: '',
      },
    ],
  };
  docNo: any;
  selectedCompanyId: any;
  netAmountDisplay: any;
  supplierList: any;
  selectedSupplierId: any;
  invoicePopupVisible: boolean;
  pendingInvoices: any;
  pendingInvoicelist: any;
  constructor(private dataService: DataService) {}

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  ngOnInit() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;

      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
        this.companyList = [selectedCompany]; // ✅ Show only selected company
      }

      if (userData.USER_ID) {
        this.debitFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.debitFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
    // this.debitFormData.TRANS_DATE = this.formatAsDDMMYYYY(new Date());
    this.debitFormData.TRANS_DATE = new Date();
    this.getDocNo();
    this.getLedgerCodeDropdown();
    this.getCompanyListDropdown();
    this.getSupplierDropdown();
    this.sessionData_tax();
    this.getPendingInvoices();
  }

  ngAfterViewInit(): void {
    // Wait for the grid and everything else to stabilize
    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (this.invoiceBoxRef?.instance) {
            this.invoiceBoxRef.instance.focus();
          }
        });
      });
    }, 500); // Delay long enough for grid rendering to complete
  }

  formatAsDDMMYYYY(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  preventDateChange(e: any) {
    // Revert to original value to prevent change
    e.component.option('value', this.debitFormData.TRANS_DATE);
  }

  getCompanyListDropdown() {
    // this.dataService.getDropdownData('COMPANY_LIST').subscribe((response: any) => {
    //   this.companyList = response
    //   console.log(this.companyList,"COMPANYLIST")
    // })
  }

  getSupplierDropdown() {
    this.dataService.getDropdownData('SUPPLIER').subscribe((response: any) => {
      this.supplierList = response;
      console.log(
        this.supplierList,
        'distributorList=============================='
      );
    });
  }

  onSupplierChanged(event: any) {
    console.log(event, 'eventttttttttttttttttttttttttttttttttt');
    this.selectedSupplierId = event.value;

    if (this.selectedSupplierId) {
      this.debitFormData.SUPP_ID = this.selectedSupplierId;
      console.log(
        this.selectedSupplierId,
        'SELECTEDSUPPLIERIDDDDDDDDDDDDDDDDDD'
      );
      this.getPendingInvoices(); // Pass supplier ID here
    } else {
      // this.pendingInvoicelist = [];
    }
  }

  //   onSupplierChanged(event: any) {
  //   console.log(event, 'eventttttttttttttttttttttttttttttttttt');
  //   const selectedSupplierId = event.value;

  // }

  selectInvoice(e: any) {
    console.log('Invoice selected:', e);
    const selected = e.data;
    this.debitFormData.INVOICE_NO = String(selected.INVOICE_NO);
    this.debitFormData.DUE_AMOUNT = selected.NET_AMOUNT;
    this.debitFormData.INVOICE_ID = selected.BILL_ID;
    console.log(
      this.debitFormData.INVOICE_NO,
      this.debitFormData.DUE_AMOUNT,
      this.debitFormData.INVOICE_ID,
      '=============+++++++++++++++++++++++++++++++++++++'
    );
    this.invoicePopupVisible = false;
  }

  getPendingInvoices() {
    const payload = {
      SUPP_ID: this.selectedSupplierId,
    };

    this.dataService
      .getPendingInvoiceforDebit(payload)
      .subscribe((response: any) => {
        this.pendingInvoicelist = response.Data;
      });
  }

  openInvoicePopup() {
    console.log('EVENT ');
    this.getPendingInvoices(); // Ensure you load fresh data
    this.invoicePopupVisible = true;
  }

  onInvoiceEnterKey(e: any): void {
    if (e.event.key === 'Enter') {
      this.dueAmountRef?.instance?.focus();
    }
  }
  onCompanySelectKeyDown(e: any): void {
    const selectBox = this.companySelectBoxRef?.instance;

    if (e.event.key === 'Enter') {
      const isOpen = selectBox.option('opened');

      if (!isOpen) {
        // Open the dropdown
        selectBox.open();
        this.dropdownJustOpened = true;
      } else if (this.dropdownJustOpened) {
        // If just opened, reset flag and wait for selection
        this.dropdownJustOpened = false;
      } else {
        // Dropdown is already open and selection is likely made
        selectBox.close();
        setTimeout(() => this.dueAmountRef?.instance?.focus(), 0);
      }
    }
  }

  onCompanySelected(): void {
    this.dropdownJustOpened = false;
    this.debitFormData.SUPP_ID = this.selectedCompanyId;
  }

  onDueAmountKeyDown(event: any): void {
    if (event.event?.key === 'Enter') {
      setTimeout(() => {
        // Focus grid's first editable cell — SL_NO (first row, first col)
        this.itemsGridRef?.instance?.editCell(0, 'SL_NO');
      }, 0);
    }
  }

  getLedgerCodeDropdown() {
    this.dataService.getAccountHeadList().subscribe((response: any) => {
      this.ledgerList = response.Data;
      console.log('Ledger List Loaded:', this.ledgerList);
    });
  }

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'SL_NO' ||
      e.dataField === 'ledgerCode' ||
      e.dataField === 'ledgerName' ||
      e.dataField === 'particulars' ||
      e.dataField === 'Amount' ||
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
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === e.row?.data
          );
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'GST'));
          }, 50);
        }
      };
    }
    if (e.parentType !== 'dataRow') return;
    const rowIndex = e.row?.rowIndex;
    console.log(rowIndex);

    // ➤ SL_NO: Move to ledgerCode on Enter
    if (e.dataField === 'SL_NO') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === e.row?.data
          );
          console.log(
            'SL_NO → Enter → move to ledgerCode, rowIndex:',
            rowIndex
          );

          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'ledgerCode'));
          }, 50);
        }
      };
    }

    // ➤ ledgerCode: open dropdown on Enter, move to ledgerName on second Enter
    if (e.dataField === 'ledgerCode') {
      let enterPressedOnce = false;

      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          event.event.preventDefault();

          if (!enterPressedOnce) {
            enterPressedOnce = true;
            setTimeout(() => {
              if (event.component?.open) {
                event.component.open(); // open dropdown
              }
            }, 50);
          } else {
            enterPressedOnce = false;
            setTimeout(() => {
              this.itemsGridRef?.instance?.editCell(rowIndex, 'particulars');
            }, 50);
          }
        }
      };

      e.editorOptions.onValueChanged = (args: any) => {
        const selectedLedger = this.ledgerList.find(
          (item: any) => item.HEAD_CODE === args.value
        );
        e.setValue(args.value);
        if (selectedLedger) {
          e.component.cellValue(
            rowIndex,
            'ledgerName',
            selectedLedger.HEAD_NAME
          );
          setTimeout(() => {
            this.itemsGridRef?.instance?.editCell(rowIndex, 'particulars');
          }, 50);
        }
      };
    }

    // ➤ ledgerName: move to particulars on Enter
    if (e.dataField === 'ledgerName') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          event.event.preventDefault();
          // setTimeout(() => {
          //   this.itemsGridRef?.instance?.editCell(rowIndex, 'particulars');
          // }, 50);
        }
      };

      e.editorOptions.onValueChanged = (args: any) => {
        const selectedLedger = this.ledgerList.find(
          (item: any) => item.HEAD_NAME === args.value
        );
        e.setValue(args.value);
        if (selectedLedger) {
          e.component.cellValue(
            rowIndex,
            'ledgerCode',
            selectedLedger.HEAD_CODE
          );
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
          const grid = e.component;
          const rowIndex = e.row.rowIndex;
          // Move focus to the "ledgerCode" column in the same row
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'gstAmount'));
          });
        }
      };
    }
    if (e.dataField === 'gstAmount') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          event.event.preventDefault();

          const grid = this.itemsGridRef?.instance;
          const rowIndex = e.row.rowIndex;

          // ✅ Force the editor to lose focus and commit its value
          const editorElement = event.event.target as HTMLElement;
          editorElement.blur();

          // ✅ Delay to let grid register the committed value
          setTimeout(() => {
            grid?.saveEditData(); // Now the value is committed
            const rows = grid.getVisibleRows().map((r) => r.data);
            let netTotal = 0;
            for (const row of rows) {
              const amount = parseFloat(row.Amount) || 0;
              const gst = parseFloat(row.gstAmount) || 0;
              netTotal += amount + gst;
            }
            this.netAmountDisplay = netTotal;
            console.log('Net Amount Updated:', this.netAmountDisplay);
            // ✅ Add new row manually
            const newRow = {
              SL_NO: '',
              HEAD_ID: '',
              AMOUNT: '',
              GST_AMOUNT: '',
              REMARKS: '',
            };

            this.debitFormData.NOTE_DETAIL.push(newRow);

            setTimeout(() => {
              grid.option('dataSource', [...this.debitFormData.NOTE_DETAIL]);

              setTimeout(() => {
                const visibleRows = grid.getVisibleRows();
                const newRowIndex = visibleRows.findIndex(
                  (r) => r.data === newRow
                );
                if (newRowIndex >= 0) {
                  grid.editCell(newRowIndex, 'SL_NO');
                }
              }, 50);
            }, 50);
          }, 50); // Let blur + commit happen
        }

        if (event.event.key === 'Tab') {
          event.event.preventDefault();

          const grid = this.itemsGridRef?.instance;
          const editorElement = event.event.target as HTMLElement;

          // ✅ Force blur to trigger value commit
          editorElement.blur();

          // ✅ Wait for value commit, then save the row and move to narration
          setTimeout(() => {
            grid?.saveEditData(); // Save current row edits
            const rows = grid.getVisibleRows().map((r) => r.data);
            let netTotal = 0;
            for (const row of rows) {
              const amount = parseFloat(row.Amount) || 0;
              const gst = parseFloat(row.gstAmount) || 0;
              netTotal += amount + gst;
            }
            this.netAmountDisplay = netTotal;
            console.log('Net Amount Updated:', this.netAmountDisplay);
            setTimeout(() => {
              this.narrationRef?.instance?.focus();
            }, 50);
          }, 50);
        }
      };
    }
  }

  onRowInserted(e: any) {
    // Recalculate SL_NO after insertion
    this.updateSerialNumbers();
  }

  updateSerialNumbers() {
    if (this.debitFormData && this.debitFormData.NOTE_DETAIL) {
      this.debitFormData.NOTE_DETAIL.forEach((item: any, index: number) => {
        item.SL_NO = index + 1;
      });
    }
  }

  onNarrationKeyDown(e: any): void {
    if (e.event.key === 'Enter' || e.event.key === 'Tab') {
      e.event.preventDefault();

      setTimeout(() => {
        this.saveButtonRef?.instance?.focus();
      }, 0);
    }
  }

  getDocNo() {
    this.dataService.getDocNo().subscribe((response: any) => {
      this.docNo = response.DOC_NO;
      console.log(response.DOC_NO, 'DOCNOOOOOOOOO');
    });
  }

  onSummaryCalculated(e: any): void {
    const totalItems = e.totalValue;

    const amountTotal = totalItems?.[0]?.value || 0;
    const gstTotal = totalItems?.[1]?.value || 0;

    this.netAmountDisplay = amountTotal + gstTotal;

    console.log(
      'Amount:',
      amountTotal,
      'GST:',
      gstTotal,
      'Net Total:',
      this.netAmountDisplay
    );
  }

  calculateAmount = (rowData: any): number => {
    const amt = parseFloat(rowData?.AMOUNT) || 0;
    const gst = parseFloat(rowData?.GST_AMOUNT) || 0;
    this.netAmountDisplay = amt + gst;
    return amt + gst;
  };

  saveDebitNote(): void {
    this.itemsGridRef?.instance?.saveEditData();

    const gridData = this.itemsGridRef?.instance
      ?.getVisibleRows()
      .map((r) => r.data);

    this.debitFormData.NOTE_DETAIL = gridData
      .filter(
        (row: any) =>
          row.ledgerCode ||
          row.ledgerName ||
          row.Amount ||
          row.gstAmount ||
          row.particulars
      )
      .map((row: any, index: number) => {
        const ledger = this.ledgerList.find(
          (item: any) => item.HEAD_CODE === row.ledgerCode
        );

        return {
          SL_NO: row.SL_NO || index + 1,
          HEAD_ID: ledger?.HEAD_ID || null,
          AMOUNT: Number(row.Amount) || 0,
          GST_AMOUNT: Number(row.gstAmount) || 0,
          REMARKS: row.particulars || '',
        };
      });
    this.debitFormData.NET_AMOUNT = this.netAmountDisplay;
    this.dataService
      .insertDebitNote(this.debitFormData)
      .subscribe((response: any) => {
        console.log(response, 'SAVED SUCCESSFULLY');

        notify(
          {
            message: 'Credit Note Saved Successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        );

        this.popupClosed.emit();
        this.resetDebitNoteForm();
      });
  }

  resetDebitNoteForm() {
    this.debitFormData = {
      TRANS_TYPE: 36,
      COMPANY_ID: 1,
      STORE_ID: 1,
      TRANS_DATE: new Date(),
      TRANS_STATUS: 1,
      SUPP_ID: '',
      NARRATION: '',
      INVOICE_ID: 0,
      INVOICE_NO: '',
      UNIT_ID: '',
      NOTE_DETAIL: [
        {
          SL_NO: '',
          HEAD_ID: '',
          AMOUNT: '',
          GST_AMOUNT: '',
          REMARKS: '',
        },
      ],
    };
  }

  cancel() {
    this.popupClosed.emit();
    this.resetDebitNoteForm();
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
    ArticleAddModule,
    ArticleEditModule,
    AddJournalVoucharModule,
    EditJournalVoucherModule,
    ViewJournalVoucherModule,
  ],
  providers: [],
  declarations: [AddDebitComponent],
  exports: [AddDebitComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddDebitModule {}
