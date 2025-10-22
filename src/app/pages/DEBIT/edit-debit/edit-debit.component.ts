import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
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
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { AddDebitComponent } from '../add-debit/add-debit.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-edit-debit',
  templateUrl: './edit-debit.component.html',
  styleUrls: ['./edit-debit.component.scss'],
})
export class EditDebitComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() debitFormData: any;
  popupVisible = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;

  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  creditNoteList: any;
  ledgerList: any;
  companyList: any;
  transDate: Date;
  noteDetails: any;
  selectedCompanyId: any;
  dropdownJustOpened: boolean = false;
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
  netAmountDisplay: any;
  formattedTransDate: string;
  userId: any;
  finId: any;
  invoicePopupVisible: boolean;
  selectedSupplierId: any;
  pendingInvoicelist: any;
  supplierList: any;
  docNo: any;
  invoiceNo: string;
  sessionData: any;
  selected_vat_id: any;

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
        this.companyList = [selectedCompany]; // Show only selected company
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
      }

      // Also store USER_ID / FIN_ID if needed later
      this.userId = userData.USER_ID;
      this.finId = userData.FINANCIAL_YEARS?.[0]?.FIN_ID;
    }
    this.getDocNo();
    this.getLedgerCodeDropdown();
    this.getSupplierDropdown();
    this.sessionData_tax();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['debitFormData'] && this.debitFormData?.length) {
      const data = this.debitFormData[0];
      this.debitFormData = [...this.debitFormData];
      this.invoiceNo = data.INVOICE_NO;
      this.getPendingInvoices(data);
      console.log(
        this.invoiceNo,
        '+++++++++++++++++++++++++++++++++++++++++++'
      );
      console.log(
        this.debitFormData[0].DUE_AMOUNT,
        'DUEAMOUNTTTTTTTTTTTTTTTTTTTTTTTTT'
      );
      this.netAmountDisplay = parseFloat(data.NET_AMOUNT) || 0;
      this.transDate = new Date(data.TRANS_DATE);
      this.formattedTransDate = this.formatAsDDMMYYYY(this.transDate);
      console.log(this.formattedTransDate, 'FORMATTED TRANSDATE');
      this.getLedgerCodeDropdown().then(() => {
        this.noteDetails = (data.NOTE_DETAIL || []).map((item: any) => {
          const match = this.ledgerList.find(
            (l: any) => l.HEAD_ID === item.HEAD_ID
          );
          return {
            ...item,
            ledgerCode: match?.HEAD_CODE || '',
            ledgerName: match?.HEAD_NAME || '',
            particulars: item.REMARKS || '',
            Amount: item.AMOUNT || '',
            gstAmount: item.GST_AMOUNT || '',
          };
        });
      });
      // this.selectedCompanyId = this.debitFormData[0].SUPP_ID;
      console.log(
        this.selectedCompanyId,
        'SELECTEDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD'
      );
    }
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
      this.debitFormData.SUPPLIER_ID = this.selectedSupplierId;
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

  getPendingInvoices(savedData?: any) {
    const payload = { SUPP_ID: this.selectedSupplierId };

    this.dataService
      .getPendingInvoiceforDebit(payload)
      .subscribe((response: any) => {
        this.pendingInvoicelist = response.Data || [];

        // ✅ Ensure saved invoice is included
        if (savedData && savedData.INVOICE_NO) {
          const exists = this.pendingInvoicelist.some(
            (inv: any) =>
              String(inv.INVOICE_NO) === String(savedData.INVOICE_NO)
          );

          if (!exists) {
            this.pendingInvoicelist = [
              ...this.pendingInvoicelist,
              {
                INVOICE_NO: String(savedData.INVOICE_NO),
                BILL_ID: savedData.INVOICE_ID,
                NET_AMOUNT: savedData.DUE_AMOUNT,
              },
            ];
          }
        }

        // ✅ Re-assign after list ready so dx-select-box can bind
        if (savedData) {
          this.invoiceNo = String(savedData.INVOICE_NO);
        }
      });
  }

  // getPendingInvoices() {
  //   const payload = {
  //     SUPP_ID: this.selectedSupplierId,
  //   };

  //   this.dataService
  //     .getPendingInvoiceforDebit(payload)
  //     .subscribe((response: any) => {
  //       this.pendingInvoicelist = response.Data;
  //       if (this.debitFormData?.length) {
  //         this.invoiceNo = String(this.debitFormData[0].INVOICE_NO);
  //       }
  //     });
  // }

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

  // getLedgerCodeDropdown() {
  //   this.dataService.getAccountHeadList().subscribe((response: any) => {
  //     this.ledgerList = response.Data;
  //     console.log('Ledger List Loaded:', this.ledgerList);
  //   });
  // }

  getLedgerCodeDropdown(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService.getAccountHeadList().subscribe({
        next: (response: any) => {
          this.ledgerList = response.Data;
          console.log('Ledger List Loaded:', this.ledgerList);
          resolve(this.ledgerList);
        },
        error: (err) => reject(err),
      });
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
      e.editorOptions.onValueChanged = (valueChangeEvent: any) => {
        e.setValue(valueChangeEvent.value); // 🔹 Commit editor value immediately
      };

      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          event.event.preventDefault();

          const grid = this.itemsGridRef?.instance;
          const rowIndex = e.row.rowIndex;

          grid.saveEditData().then(() => {
            // 🔹 Recalculate totals after commit
            const rows = grid.getVisibleRows().map((r) => r.data);
            let netTotal = 0;
            for (const row of rows) {
              const amount = parseFloat(row.Amount) || 0;
              const gst = parseFloat(row.gstAmount) || 0;
              netTotal += amount + gst;
            }
            this.netAmountDisplay = netTotal;

            // 🔹 Create a fresh new row
            const newRow: any = {
              SL_NO: this.noteDetails.length + 1,
              HEAD_ID: '',
              ledgerCode: '',
              ledgerName: '',
              particulars: '',
              Amount: '',
              gstAmount: '',
            };

            // 🔹 Insert into noteDetails
            this.noteDetails = [
              ...this.noteDetails.slice(0, rowIndex + 1),
              newRow,
              ...this.noteDetails.slice(rowIndex + 1),
            ];

            // 🔹 Rebind grid
            grid.option('dataSource', this.noteDetails);

            // 🔹 Focus new row
            setTimeout(() => {
              const visibleRows = grid.getVisibleRows();
              const newRowIndex = visibleRows.findIndex(
                (r) => r.data === newRow
              );
              if (newRowIndex >= 0) {
                grid.editCell(newRowIndex, 'SL_NO');
              }
            }, 50);
          });
        }
      };
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
    if (e.name === 'netTotal') {
      if (e.summaryProcess === 'start') {
        e.totalValue = 0;
      }
      if (e.summaryProcess === 'calculate') {
        const amount = parseFloat(e.value.Amount) || 0;
        const gst = parseFloat(e.value.gstAmount) || 0;
        e.totalValue += amount + gst;
      }
      if (e.summaryProcess === 'finalize') {
        this.netAmountDisplay = e.totalValue; // 🔹 push result into textbox
      }
    }
  }

  calculateAmount = (rowData: any): number => {
    const amt = parseFloat(rowData?.AMOUNT) || 0;
    const gst = parseFloat(rowData?.GST_AMOUNT) || 0;
    this.netAmountDisplay = amt + gst;
    return amt + gst;
  };

  cancel() {
    this.popupClosed.emit();
  }

  onApprovedChanged(e: any) {
    console.log('Checkbox value changed:', e.value);
    this.debitFormData.IS_APPROVED = e.value;
  }

  updateDebitNote() {
    if (this.debitFormData.IS_APPROVED) {
      console.log('approved???????????????????????????????????');
      confirm(
        'It will approve and commit. Are you sure you want to commit?',
        'Confirm Commit'
      ).then((result) => {
        if (result) {
          const payload = {
            TRANS_ID: this.debitFormData[0].TRANS_ID,
            IS_APPROVED: true,
            TRANS_TYPE: 36,
            COMPANY_ID: this.selectedCompanyId,
            FIN_ID: this.finId,
            STORE_ID: 1,
            TRANS_DATE: this.transDate,
            TRANS_STATUS: 1,
            NARRATION:
              this.debitFormData[0].NARRATION ||
              'Update Details of Credit Note',
            INVOICE_ID: this.debitFormData[0].INVOICE_ID || 0,
            INVOICE_NO: this.debitFormData[0].INVOICE_NO || '',
            SUPP_ID: this.debitFormData[0].SUPP_ID || 0,
            DISTRIBUTOR_ID: this.debitFormData[0].DISTRIBUTOR_ID || 0,
            NOTE_DETAIL: this.noteDetails
              .filter(
                (item) =>
                  item.ledgerCode ||
                  item.ledgerName ||
                  item.Amount ||
                  item.gstAmount ||
                  item.particulars
              )
              .map((item: any, index: number) => {
                const match = this.ledgerList.find(
                  (l) =>
                    l.HEAD_CODE === item.ledgerCode ||
                    l.HEAD_NAME === item.ledgerName
                );
                return {
                  SL_NO: item.SL_NO || index + 1,
                  HEAD_ID: match?.HEAD_ID || item.HEAD_ID,
                  AMOUNT: Number(item.Amount) || 0,
                  GST_AMOUNT: Number(item.gstAmount) || 0,
                  REMARKS: item.particulars || '',
                };
              }),
          };

          this.dataService.commitDebitNote(payload).subscribe(
            (response: any) => {
              if (response.flag === 1) {
                notify('Debit Note approved successfully!', 'success', 3000);
                this.popupClosed.emit(); // Close popup
              } else {
                notify(`Approval failed: ${response.Message}`, 'error', 4000);
              }
            },
            (error) => {
              console.error('Approval error:', error);
              alert('Something went wrong while approving');
            }
          );
        } else {
          // ❌ User cancelled commit
          notify('Approval cancelled.', 'info', 2000);
        }
      });

      return; // 🚫 Prevent running normal update block
    } else {
      const payload = {
        TRANS_ID: this.debitFormData[0].TRANS_ID,
        TRANS_TYPE: 36,
        COMPANY_ID: this.selectedCompanyId,
        FIN_ID: this.finId,
        STORE_ID: 1,
        TRANS_DATE: this.transDate,
        TRANS_STATUS: 1,
        NARRATION:
          this.debitFormData[0].NARRATION || 'Update Details of Credit Note',
        INVOICE_ID: this.debitFormData[0].INVOICE_ID || 0,
        INVOICE_NO: this.debitFormData[0].INVOICE_NO || '',
        SUPP_ID: this.debitFormData[0].SUPP_ID || 0,
        DISTRIBUTOR_ID: this.debitFormData[0].DISTRIBUTOR_ID || 0,
        IS_APPROVED: false,
        NOTE_DETAIL: this.noteDetails
          .filter(
            (item) =>
              item.ledgerCode ||
              item.ledgerName ||
              item.Amount ||
              item.gstAmount ||
              item.particulars
          )
          .map((item: any, index: number) => {
            const match = this.ledgerList.find(
              (l) =>
                l.HEAD_CODE === item.ledgerCode ||
                l.HEAD_NAME === item.ledgerName
            );
            return {
              SL_NO: item.SL_NO || index + 1,
              HEAD_ID: match?.HEAD_ID || item.HEAD_ID,
              AMOUNT: Number(item.Amount) || 0,
              GST_AMOUNT: Number(item.gstAmount) || 0,
              REMARKS: item.particulars || '',
            };
          }),
      };

      console.log('Update Payload:', payload);

      this.dataService.updateDebitNote(payload).subscribe((response) => {
        if (response) {
          notify(
            {
              message: 'Debit Note Updated Successfully',
              position: { at: 'top right', my: 'top right' },
            },
            'success'
          );
          this.popupClosed.emit();
          this.resetDebitNoteForm();
        }
      });
    }
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
  declarations: [EditDebitComponent],
  exports: [EditDebitComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditDebitModule {}
