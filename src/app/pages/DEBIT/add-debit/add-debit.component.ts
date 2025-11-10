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
    STORE_ID: 0,
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
  selectedSupplier: any;
  selectedstoreId:any;
  net: string;
  constructor(private dataService: DataService) {}

      sessionDetails(){
     const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
      this.selectedstoreId = sessionData.Configuration[0].STORE_ID;
    console.log(
      this.selectedstoreId,
      '===========selected store id==================='
    );
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  ngOnInit() {
    this.sessionDetails();
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;

      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
        this.companyList = [selectedCompany]; //  Show only selected company
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
    this.debitFormData.NOTE_DETAIL = [
      {
        SL_NO: 1,
        ledgerCode: '',
        ledgerName: '',
        particulars: '',
        Amount: '',
        GST_PERC: '',
        gstAmount: '',
      },
    ];
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
    this.selectedSupplierId = event.value;
    if (this.selectedSupplierId) {
      this.selectedSupplier = this.supplierList.find(
        (s: any) => s.ID === this.selectedSupplierId
      );
      this.debitFormData.PARTY_NAME = this.selectedSupplier.DESCRIPTION;
      console.log(this.selectedSupplier.DESCRIPTION, 'PARTYNAMEEEEEEEEEEEEEE');
    }
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

  selectInvoice(e: any) {
    console.log('Invoice selected:', e);
    const selected = e.data;
    // this.debitFormData.INVOICE_NO = String(selected.INVOICE_NO);
    this.debitFormData.INVOICE_NO = selected.INVOICE_NO;
    this.debitFormData.DUE_AMOUNT = selected.PENDING_AMOUNT;
    this.debitFormData.INVOICE_ID = selected.BILL_ID;

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
    this.dataService.getActiveLedger().subscribe((response: any) => {
      this.ledgerList = response.Data;
      console.log('Ledger List Loaded:', this.ledgerList);
    });
  }

  calculateTaxAmount = (rowData: any) => {
    const amount = Number(rowData.Amount) || 0;
    const gstPerc = Number(rowData.GST_PERC) || 0;
    return +((amount * gstPerc) / 100).toFixed(2);
  };

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'SL_NO' ||
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
            grid.focus(grid.getCellElement(rowIndex, 'GST_PERC'));
          });
        }
      };
    }

    if (e.dataField === 'GST_PERC') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          event.event.preventDefault();

          const grid = this.itemsGridRef?.instance;
          const rowData = e.row?.data;

          // ✅ Validate ledgerCode and Amount before proceeding
          if (!rowData.ledgerCode) {
            notify(
              'Please select a Ledger Code before proceeding.',
              'warning',
              2000
            );
            return;
          }
          if (rowData.Amount == null || rowData.Amount <= 0) {
            notify(
              'Please enter a valid Amount before proceeding.',
              'warning',
              2000
            );
            return;
          }

          // ✅ Ensure gstAmount is not greater than Amount
          if (rowData.Amount != null && event.value > rowData.Amount) {
            notify('GST Amount cannot be greater than Amount.', 'error', 2000);
            event.value = rowData.Amount;
            e.setCellValue(rowData, event.value);
            return;
          }

          // ✅ Force the editor to lose focus and commit its value
          const editorElement = event.event.target as HTMLElement;
          editorElement.blur();

          // ✅ Delay to let grid register the committed value
          setTimeout(() => {
            grid?.saveEditData();

            // ✅ Recalculate net total
            const rows = grid.getVisibleRows().map((r) => r.data);
            let netTotal = 0;
            for (const row of rows) {
              const amount = parseFloat(row.Amount) || 0;
              const gst = parseFloat(row.gstAmount) || 0;
              netTotal += amount + gst;
            }
            this.netAmountDisplay = netTotal;

            // ✅ Add new row only if current row is fully filled
            if (
              rowData.ledgerCode &&
              rowData.Amount != null &&
              !this.hasEmptyRow()
            ) {
              // ✅ Check if last row is empty, prevent multiple empty rows
              const lastRow =
                this.debitFormData.NOTE_DETAIL[
                  this.debitFormData.NOTE_DETAIL.length - 1
                ];
              if (!lastRow || (lastRow.ledgerCode && lastRow.Amount != null)) {
                const newRow = {
                  SL_NO: this.debitFormData.NOTE_DETAIL.length + 1,
                  HEAD_ID: '',
                  AMOUNT: '',
                  GST_PERC: '',
                  GST_AMOUNT: '',
                  REMARKS: '',
                };
                this.debitFormData.NOTE_DETAIL.push(newRow);

                setTimeout(() => {
                  grid.option('dataSource', [
                    ...this.debitFormData.NOTE_DETAIL,
                  ]);

                  setTimeout(() => {
                    const visibleRows = grid.getVisibleRows();
                    const newRowIndex = visibleRows.findIndex(
                      (r) => r.data === newRow
                    );
                    if (newRowIndex >= 0) {
                      grid.editCell(newRowIndex, 'ledgerCode');
                    }
                  }, 50);
                }, 50);
              }
            }
          }, 50);
        }

        if (event.event.key === 'Tab') {
          event.event.preventDefault();
          const grid = this.itemsGridRef?.instance;
          const editorElement = event.event.target as HTMLElement;

          editorElement.blur();

          setTimeout(() => {
            grid?.saveEditData();

            // ✅ Recalculate net total
            const rows = grid.getVisibleRows().map((r) => r.data);
            let netTotal = 0;
            for (const row of rows) {
              const amount = parseFloat(row.Amount) || 0;
              const gst = parseFloat(row.gstAmount) || 0;
              netTotal += amount + gst;
            }
            this.netAmountDisplay = netTotal;

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

  validateGstAmount(e: any) {
    console.log(e, 'sasas');
    const row = e.data;
    // If Amount is null or undefined, allow editing
    if (row.Amount == null) return true;
    return row.gstAmount <= row.Amount;
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
    this.dataService.getDocNoForDebit().subscribe((response: any) => {
      this.docNo = response.DOC_NO;
      this.debitFormData.DOC_NO = response.DOC_NO;
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

  get netAmountString(): string {
    const details = this.debitFormData?.NOTE_DETAIL || [];
    let totalAmount = 0;
    let totalGST = 0;

    details.forEach((item: any) => {
      const amount = Number(item.Amount) || 0;
      const gstPerc = Number(item.GST_PERC) || 0;

      totalAmount += amount;
      totalGST += (amount * gstPerc) / 100; // Recalculate GST live
    });
    this.net = (totalAmount + totalGST).toFixed(2);
    console.log('Net Amount (from getter):', this.net);
    return (totalAmount + totalGST).toFixed(2);
  }

  formatDate(date: any): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`; //yyyy-MM-dd format
  }

  saveDebitNote(): void {
    this.itemsGridRef?.instance?.saveEditData();

    const gridData =
      this.itemsGridRef?.instance?.getVisibleRows().map((r) => r.data) || [];
    const details = this.debitFormData.NOTE_DETAIL || [];
    let totalAmount = 0;
    let totalGST = 0;

    details.forEach((item: any) => {
      const amount = Number(item.Amount) || 0;
      const gstPerc = Number(item.GST_PERC) || 0;
      totalAmount += amount;
      totalGST += (amount * gstPerc) / 100;
    });

    const netAmount = totalAmount + totalGST;
    const dueAmount = Number(this.debitFormData?.DUE_AMOUNT) || 0;

    // ✅ Validation check
    if (netAmount > dueAmount) {
      notify('Net Amount cannot exceed Due Amount.', 'error', 2500);
      return;
    }
    // ✅ Filter valid rows
    const validRows = gridData.filter(
      (row: any) =>
        row.ledgerCode ||
        row.ledgerName ||
        row.Amount ||
        row.GST_PERC ||
        row.gstAmount ||
        row.particulars
    );

    // ✅ 1. Form-level validations
    if (!this.debitFormData.SUPP_ID) {
      notify('Please select a Supplier before saving.', 'error', 2000);
      return;
    }

    if (!this.debitFormData.INVOICE_NO) {
      notify('Please select an Invoice before saving.', 'error', 2000);
      return;
    }

    if (validRows.length === 0) {
      notify('Please enter at least one ledger entry.', 'error', 2000);
      return;
    }

    // ✅ 2. Row-level validation for Amount
    const invalidAmountRow = validRows.find(
      (row: any) =>
        (row.ledgerCode || row.ledgerName) &&
        (!row.Amount || Number(row.Amount) === 0)
    );

    if (invalidAmountRow) {
      notify('Please enter a valid Amount', 'error', 3000);
      return;
    }

    // ✅ 3. Build NOTE_DETAIL for backend
    this.debitFormData.NOTE_DETAIL = validRows.map(
      (row: any, index: number) => {
        const ledger = this.ledgerList.find(
          (item: any) =>
            item.HEAD_CODE === row.ledgerCode ||
            item.HEAD_NAME === row.ledgerName
        );
        const gstAmount = this.calculateTaxAmount(row);
        return {
          SL_NO: row.SL_NO || index + 1,
          HEAD_ID: ledger?.HEAD_ID || null,
          AMOUNT: Number(row.Amount) || 0,
          GST_PERC: Number(row.GST_PERC) || 0,
          GST_AMOUNT: gstAmount,
          REMARKS: row.particulars || '',
        };
      }
    );

    // ✅ 4. Other fields
    this.debitFormData.NET_AMOUNT = this.netAmountDisplay;
    this.debitFormData.STORE_ID = this.selectedstoreId
    this.debitFormData.INVOICE_NO = String(this.debitFormData.INVOICE_NO);
    this.debitFormData.TRANS_DATE = this.formatDate(
      this.debitFormData.TRANS_DATE
    );
    console.log(this.debitFormData.NET_AMOUNT, 'NETAMOUNT');

    // ✅ 5. Save
    this.dataService.insertDebitNote(this.debitFormData).subscribe(
      (response: any) => {
        notify(
          {
            message: 'Debit Note Saved Successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        );
        this.popupClosed.emit();
        this.resetDebitNoteForm();
      },
      (error) => {
        notify('Failed to save Debit Note. Please try again.', 'error', 2000);
        console.error('Save error:', error);
      }
    );
  }

  resetDebitNoteForm() {
    this.debitFormData = {
      TRANS_TYPE: 36,
      COMPANY_ID: 1,
      STORE_ID: 0,
      TRANS_DATE: new Date(),
      TRANS_STATUS: 1,
      SUPP_ID: '',
      NARRATION: '',
      INVOICE_ID: 0,
      INVOICE_NO: '',
      UNIT_ID: '',
      DUE_AMOUNT: '',
      NOTE_DETAIL: [
        {
          SL_NO: 1,
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

  // onAddNewRow() {
  //   const nextSlNo = this.debitFormData.NOTE_DETAIL.length + 1;
  //   this.debitFormData.NOTE_DETAIL.push({
  //     SL_NO: nextSlNo,
  //     ledgerCode: '',
  //     ledgerName: '',
  //     particulars: '',
  //     Amount: '',
  //     gstAmount: '',
  //     HEAD_ID: null,
  //   });
  // }
  private hasEmptyRow(): boolean {
    return (this.debitFormData?.NOTE_DETAIL || []).some(
      (r: any) =>
        (!r.ledgerCode || r.ledgerCode === '') &&
        (!r.ledgerName || r.ledgerName === '') &&
        (!r.Amount || r.Amount === 0)
    );
  }

  onAddNewRow() {
    const grid = this.itemsGridRef.instance;
    const rows = grid.getVisibleRows();
    if (this.hasEmptyRow()) {
      notify('Please fill the existing empty row first.', 'warning', 2000);
      return;
    }
    // Prevent adding if any existing row is incomplete
    // const hasIncompleteRow = rows.some(
    //   (r: any) => !r.data.ledgerName || !r.data.Amount
    // );
    // if (hasIncompleteRow) {
    //   return;
    // }

    // Add a new empty row with auto SL_NO
    const nextSlNo = this.debitFormData.NOTE_DETAIL.length + 1;
    const newRow = {
      SL_NO: nextSlNo,
      ledgerCode: null,
      ledgerName: '',
      particulars: '',
      Amount: null,
      gstAmount: null,
    };

    this.debitFormData.NOTE_DETAIL.push(newRow);

    // // Refresh grid and focus the ledgerCode cell

    setTimeout(() => {
      const grid = this.itemsGridRef?.instance;
      const newRowIndex = this.debitFormData.NOTE_DETAIL.length - 1;
      grid?.editCell(newRowIndex, 'ledgerCode');
    }, 100);
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
