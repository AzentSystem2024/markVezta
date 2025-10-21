import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
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
  DxDataGridComponent,
  DxValidationGroupComponent,
  DxTextBoxComponent,
  DxSelectBoxComponent,
  DxNumberBoxComponent,
  DxButtonComponent,
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
import { AddCreditNoteComponent } from '../add-credit-note/add-credit-note.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-edit-credit-note',
  templateUrl: './edit-credit-note.component.html',
  styleUrls: ['./edit-credit-note.component.scss'],
})
export class EditCreditNoteComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() creditFormData: any;
  // @ViewChild(DxDataGridComponent, { static: true })
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  dataGrid: DxDataGridComponent;
  @ViewChild('creditNoteGroup') invoiceFormGroup: DxValidationGroupComponent;
  @ViewChild('invoiceBoxRef', { static: false })
  invoiceBoxRef!: DxTextBoxComponent;
  @ViewChild('customerRef', { static: false })
  customerRef!: DxSelectBoxComponent;
  @ViewChild('customerTypeRef', { static: false, read: ElementRef })
  customerTypeElementRef!: ElementRef;
  @ViewChild('distributorRef', { static: false })
  distributorRef!: DxSelectBoxComponent;
  @ViewChild('dueAmountRef', { static: false })
  dueAmountRef!: DxNumberBoxComponent;
  @ViewChild('narrationRef', { static: false })
  narrationRef!: DxTextBoxComponent;
  @ViewChild('saveButtonRef', { static: false })
  saveButtonRef!: DxButtonComponent;
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
  customersList: any;
  dropdownOpened: boolean = false;
  customerType: 'Unit' | 'Dealer' = 'Unit';
  distributorList: any;
  selectedDistributorId: any;
  companyList: any;
  selectedCompanyId: any;
  invoiceNo: any;
  narration: string = '';
  transDate: Date | string | number | null = null;
  dueAmount: number = 0;
  itemsGridData: any[] = [];
  noteDetails: any[] = [];
  newRowAdded: boolean = false;
  newRowIndex: any;
  pendingInvoices: any;
  invoicePopupVisible: boolean = false;
  userId: any;
  finId: any;
  selectedCustomerId: any;
  selectedInvoice: string;
  sessionData: any;
  selected_vat_id: any;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {}

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
    console.log(this.creditFormData, 'NGONINIT');
    this.getCompanyListDropdown();
    this.getLedgerCodeDropdown();
    // this.getPendingInvoices();
    this.sessionData_tax();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['creditFormData'] && this.creditFormData?.length) {
      const data = this.creditFormData[0];
      console.log(this.creditFormData[0].INVOICE_NO, 'INEDITTTTTTTTTTT');
      if (this.creditFormData?.length) {
        const data = this.creditFormData[0];
        this.invoiceNo = String(data.INVOICE_NO);
        console.log('InvoiceNo bound to:', this.invoiceNo);
        this.getPendingInvoices(data);
        this.selectedInvoice = String(data.INVOICE_NO);
        console.log('invoiceNo bound to:', this.invoiceNo);
      }

      this.selectedInvoice = String(data.INVOICE_NO);
      this.transDate = new Date(data.TRANS_DATE);
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
      this.getCompanyListDropdown(data.DISTRIBUTOR_ID);
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

  getCompanyListDropdown(selectedDistributorId?: number): void {
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.distributorList = response;
      this.cdr.detectChanges();

      if (selectedDistributorId) {
        const match = this.distributorList.find(
          (d: any) => d.ID === selectedDistributorId
        );

        this.selectedDistributorId = match ? match.ID : null;
      }
    });
  }
  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  addNewManualRow(): void {
    const newRow = {
      SL_NO: '',
      HEAD_ID: '',
      ledgerCode: '',
      ledgerName: '',
      particulars: '',
      Amount: '',
      gstAmount: '',
    };

    this.noteDetails.push(newRow);

    // Refresh grid and edit new row
    setTimeout(() => {
      this.itemsGridRef?.instance.option('dataSource', [...this.noteDetails]);
      const newRowIndex = this.itemsGridRef?.instance
        .getVisibleRows()
        .findIndex((r) => r.data === newRow);

      if (newRowIndex >= 0) {
        this.itemsGridRef?.instance.editCell(newRowIndex, 'SL_NO');
      }
    }, 50);
  }

  formatAsDDMMYYYY(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onInvoiceEnterKey(event: any): void {
    if (event.event?.key === 'Enter') {
      setTimeout(() => {
        this.customerTypeElementRef?.nativeElement?.focus();
      }, 0);
    }
  }

  handleCustomerType(response: any): void {
    const data = response?.Data?.[0];
    if (!data) return;

    if (data.UNIT_ID && data.UNIT_ID !== 0) {
      this.customerType = 'Unit';
      this.selectedCompanyId = data.UNIT_ID;
      this.selectedDistributorId = null; // Clear distributor
    } else if (data.DISTRIBUTOR_ID && data.DISTRIBUTOR_ID !== 0) {
      this.customerType = 'Dealer';
      this.selectedDistributorId = data.DISTRIBUTOR_ID;
      this.selectedCompanyId = null; // Clear unit
    }
  }

  handleCustomerData(response: any): void {
    const data = response?.Data?.[0];
    if (!data) return;

    // UNIT case
    if (data.UNIT_ID && data.DISTRIBUTOR_ID === 0) {
      this.customerType = 'Unit';
      this.selectedCompanyId = data.UNIT_ID;
      this.selectedDistributorId = null;
    }
    // DISTRIBUTOR case
    else if (data.DISTRIBUTOR_ID && data.UNIT_ID === 0) {
      this.customerType = 'Dealer';
      this.selectedDistributorId = data.DISTRIBUTOR_ID;
      this.selectedCompanyId = null;
    }
  }

  onCustomerTypeKeyDown(event: any): void {
    if (event.event?.key === 'Enter') {
      setTimeout(() => {
        this.customerRef?.instance?.focus?.();
      }, 0);
    }
  }

  onCustomerKeyDown(event: any, type: 'Unit' | 'Dealer'): void {
    const instance = event.component;
    const grid = this.itemsGridRef?.instance;

    if (event.event?.key === 'Enter') {
      grid?.saveEditData(); // ✅ Commit pending grid changes

      if (!this.dropdownOpened) {
        this.dropdownOpened = true;
        setTimeout(() => instance.open(), 0);
      } else {
        this.dropdownOpened = false;
        setTimeout(() => {
          instance.close?.();
          setTimeout(() => this.dueAmountRef?.instance?.focus?.(), 0);
        }, 100);
      }
    }
  }

  onCustomerDropdownOpened() {
    this.dropdownOpened = true;
  }
  onCustomerSelected(e: any): void {
    if (this.dropdownOpened && this.customerRef?.instance?.close) {
      setTimeout(() => {
        this.customerRef.instance.close();
        this.dropdownOpened = false; // reset flag
      }, 100); // slight delay allows selection to settle
    }
  }

  onDueAmountKeyDown(event: any): void {
    if (event.event?.key === 'Enter') {
      setTimeout(() => {
        // Focus grid's first editable cell — SL_NO (first row, first col)
        this.itemsGridRef?.instance?.editCell(0, 'SL_NO');
      }, 0);
    }
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
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        setTimeout(() => {
          this.updateNetAmount();
        }, 0);
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
      };
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        setTimeout(() => {
          this.updateNetAmount();
        }, 0);
      };
    }
  }

  updateNetAmount() {}

  get calculatedNetAmount(): string {
    let totalAmount = 0;
    let totalGstAmount = 0;

    for (const row of this.noteDetails) {
      totalAmount += parseFloat(row.Amount) || 0;
      totalGstAmount += parseFloat(row.gstAmount) || 0;
    }

    return (totalAmount + totalGstAmount).toFixed(2); // returns a string
  }

  onCompanySelected(event: any): void {
    const grid = this.itemsGridRef?.instance;
    const selectedId = event.value;
    this.creditFormData.UNIT_ID = selectedId;
    if (grid) {
      const editRowIndex = grid
        .getVisibleRows()
        .findIndex((row: any) => row.isEditing);
      if (editRowIndex !== -1) {
        grid.saveEditData(); // Save new row before changing company
      }
    }

    this.selectedCompanyId = event.value;
  }

  onDistributorSelected(event: any): void {
    const grid = this.itemsGridRef?.instance;
    this.selectedCustomerId = event.value;
    this.creditFormData.DISTRIBUTOR_ID = this.selectedCustomerId;
    if (grid) {
      const editRowIndex = grid
        .getVisibleRows()
        .findIndex((row: any) => row.isEditing);
      if (editRowIndex !== -1) {
        grid.saveEditData(); // Save new row before changing distributor
      }
    }

    this.selectedDistributorId = event.value;
    console.log(this.selectedDistributorId, 'SELECTEDDISTRIBUTORIDDDDDDDDD');
  }

  onNarrationKeyDown(event: any) {}

  onInitNewRow(e: any): void {
    this.newRowIndex = e.component.getRowIndexByKey(e.key);
  }
  // onCompanySelected(event: any){}

  openInvoicePopup() {
    console.log('EVENT ');
    this.getPendingInvoices(); // Ensure you load fresh data
    this.invoicePopupVisible = true;
  }

  getPendingInvoices(savedData?: any) {
    const payload = {
      CUST_ID: this.selectedCustomerId,
    };

    this.dataService
      .getPendingInvoiceList(payload)
      .subscribe((response: any) => {
        this.pendingInvoices = response.Data || [];

        // ✅ Ensure saved invoice is included in dropdown
        if (savedData && savedData.INVOICE_NO) {
          const exists = this.pendingInvoices.some(
            (inv: any) =>
              String(inv.INVOICE_NO) === String(savedData.INVOICE_NO)
          );

          if (!exists) {
            this.pendingInvoices = [
              ...this.pendingInvoices,
              {
                INVOICE_NO: String(savedData.INVOICE_NO),
                INVOICE_ID: savedData.INVOICE_ID,
                BALANCE_AMOUNT: savedData.DUE_AMOUNT,
              },
            ];
          }
        }

        // ✅ Reset binding after list is ready
        if (savedData) {
          this.invoiceNo = String(savedData.INVOICE_NO);
        }
      });
  }

  // getPendingInvoices() {
  //   const payload = {
  //     CUST_ID: this.selectedCustomerId, // or customerId if you pass it
  //   };

  //   this.dataService
  //     .getPendingInvoiceList(payload)
  //     .subscribe((response: any) => {
  //       this.pendingInvoices = response.Data;
  //       console.log(this.pendingInvoices, 'PENDINGINVOICES');
  //       if (this.creditFormData?.length) {
  //         const data = this.creditFormData[0];
  //         this.invoiceNo = String(data.INVOICE_NO);
  //       }
  //     });
  // }

  selectInvoice(e: any) {
    console.log('Invoice selected:', e);
    const selected = e.data;
    this.creditFormData.INVOICE_NO = selected.INVOICE_NO;
    this.creditFormData.DUE_AMOUNT = selected.BALANCE_AMOUNT;
    this.creditFormData.INVOICE_ID = selected.INVOICE_ID;
    console.log(this.creditFormData.INVOICE_ID, 'INVOICEIDDDDDDDDDDDDDDDD');
    this.invoicePopupVisible = false;
  }

  onApprovedChanged(e: any) {
    console.log('Checkbox value changed:', e.value);
    this.creditFormData.IS_APPROVED = e.value;
  }

  updateCreditNote() {
    if (this.creditFormData.IS_APPROVED) {
      console.log('approved???????????????????????????????????');
      confirm(
        'It will approve and commit. Are you sure you want to commit?',
        'Confirm Commit'
      ).then((result) => {
        if (result) {
          const payload = {
            TRANS_ID: this.creditFormData[0].TRANS_ID,
            IS_APPROVED: true,
            TRANS_TYPE: 37,
            COMPANY_ID: this.selectedCompanyId,
            FIN_ID: this.finId,
            STORE_ID: 1,
            TRANS_DATE: this.transDate,
            TRANS_STATUS: 1,
            NARRATION:
              this.creditFormData[0].NARRATION ||
              'Update Details of Credit Note',
            INVOICE_ID: this.creditFormData[0].INVOICE_ID || 0,
            INVOICE_NO: this.creditFormData[0].INVOICE_NO || '',
            UNIT_ID: this.creditFormData[0].UNIT_ID || 0,
            DISTRIBUTOR_ID: this.creditFormData[0].DISTRIBUTOR_ID || 0,
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

          this.dataService.commitCreditNote(payload).subscribe(
            (response: any) => {
              if (response.flag === 1) {
                notify('Credit Note approved successfully!', 'success', 3000);
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
        TRANS_ID: this.creditFormData[0].TRANS_ID,
        TRANS_TYPE: 37,
        COMPANY_ID: this.selectedCompanyId,
        FIN_ID: this.finId,
        STORE_ID: 1,
        TRANS_DATE: this.transDate,
        TRANS_STATUS: 1,
        NARRATION:
          this.creditFormData[0].NARRATION || 'Update Details of Credit Note',
        INVOICE_ID: this.creditFormData[0].INVOICE_ID || 0,
        INVOICE_NO: this.creditFormData[0].INVOICE_NO || '',
        UNIT_ID: this.creditFormData[0].UNIT_ID || 0,
        DISTRIBUTOR_ID: this.creditFormData[0].DISTRIBUTOR_ID || 0,
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

      this.dataService.updateCreditNote(payload).subscribe((response) => {
        if (response) {
          notify(
            {
              message: 'Credit Note Updated Successfully',
              position: { at: 'top right', my: 'top right' },
            },
            'success'
          );
          this.popupClosed.emit();
          // this.resetCreditNoteForm();
        }
      });
    }
  }

  resetCreditNoteForm() {
    this.creditFormData = {
      TRANS_TYPE: 37,
      COMPANY_ID: 1,
      STORE_ID: 1,
      TRANS_DATE: new Date(),
      TRANS_STATUS: 1,
      PARTY_ID: 1,
      PARTY_NAME: '',
      NARRATION: '',
      INVOICE_ID: 0,
      INVOICE_NO: '',
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
        this.popupClosed.emit()
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
  declarations: [EditCreditNoteComponent],
  exports: [EditCreditNoteComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditCreditNoteModule {}
