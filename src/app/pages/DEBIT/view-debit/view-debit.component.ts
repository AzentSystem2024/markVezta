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
  DxSelectBoxComponent,
  DxTextBoxComponent,
  DxNumberBoxComponent,
  DxDataGridComponent,
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
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { EditDebitComponent } from '../edit-debit/edit-debit.component';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-view-debit',
  templateUrl: './view-debit.component.html',
  styleUrls: ['./view-debit.component.scss'],
})
export class ViewDebitComponent {
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
  netAmountDisplay: number;
  formattedTransDate: any;
  docNo: any;
  supplierList: any;
  sessionData: any;
  selected_vat_id: any;


  constructor(private dataService: DataService) {}

  sessionData_tax(){
        this.sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(this.sessionData,'=================session data==========')
this.selected_vat_id=this.sessionData.VAT_ID
  }


  ngOnInit() {
    const userDataString = localStorage.getItem('userData');

    if (userDataString) {
      const userData = JSON.parse(userDataString);
      console.log(userData, 'USERDATAAAAAA');
      // ✅ Assign Companies array to companyList
      this.companyList = userData.Companies || [];

      // Optionally set a default value
      if (this.companyList.length > 0) {
        this.selectedCompanyId = this.companyList[0].COMPANY_ID;
      }

      // Log for debugging
      console.log('Loaded Companies:', this.companyList);
    } else {
      console.warn('No userData found in localStorage');
    }
    // this.getCompanyListDropdown();
    this.getLedgerCodeDropdown();
    this.getDocNo();
    this.getSupplierDropdown(); 
    this.sessionData_tax()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['debitFormData'] && this.debitFormData?.length) {
      const data = this.debitFormData[0];
      console.log(data, 'DATAAAAAAAAAAAAAAAAAAAAAAAA');
      if (data.TRANS_TYPE === 36) {
        data.IS_APPROVED = true;
      }
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
      this.selectedCompanyId = this.debitFormData[0].SUPP_ID;
    }
  }

  getDocNo() {
    this.dataService.getDocNoForDebit().subscribe((response: any) => {
      this.docNo = response.DOC_NO;
    });
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

  formatDateColumn = (rowData: any) => {
    return this.formatAsDDMMYYYY(new Date(rowData.TRANS_DATE));
  };

  private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onInvoiceEnterKey(e: any): void {
    if (e.event.key === 'Enter') {
      this.companySelectBoxRef?.instance?.focus();
    }
  }

  getCompanyListDropdown() {
    this.dataService
      .getDropdownData('COMPANY_LIST')
      .subscribe((response: any) => {
        this.companyList = response;
        console.log(this.companyList, 'COMPANYLIST');
      });
  }

  getLedgerCodeDropdown(): Promise<void> {
    return new Promise((resolve) => {
      this.dataService.getAccountHeadList().subscribe((response: any) => {
        this.ledgerList = response.Data;
        console.log('Ledger List Loaded:', this.ledgerList);
        resolve();
      });
    });
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

  onNarrationKeyDown(e: any): void {
    if (e.event.key === 'Enter' || e.event.key === 'Tab') {
      e.event.preventDefault();

      setTimeout(() => {
        this.saveButtonRef?.instance?.focus();
      }, 0);
    }
  }

  onEditorPreparing(e: any) {
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

            this.noteDetails.push(newRow);

            setTimeout(() => {
              grid.option('dataSource', [...this.noteDetails]);

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
        TRANS_TYPE: 37,
        COMPANY_ID: this.selectedCompanyId,
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
  declarations: [ViewDebitComponent],
  exports: [ViewDebitComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ViewDebitModule {}
