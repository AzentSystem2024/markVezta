import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
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
  DxValidationGroupComponent,
  DxDataGridComponent,
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
import { JournalVoucherListComponent } from '../../JOURNAL-VOUCHER/journal-voucher-list/journal-voucher-list.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { DataService } from 'src/app/services';
import DevExpress from 'devextreme';
import notify from 'devextreme/ui/notify';
import dxSelectBox from 'devextreme/ui/select_box';

@Component({
  selector: 'app-add-credit-note',
  templateUrl: './add-credit-note.component.html',
  styleUrls: ['./add-credit-note.component.scss'],
})
export class AddCreditNoteComponent {
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

  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  dataGrid: DxDataGridComponent;
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
  customersList: any;
  dropdownOpened: boolean = false;
  creditFormData: any = {
    TRANS_TYPE: 37,
    COMPANY_ID: 1,
    STORE_ID: 1,
    TRANS_DATE: new Date(),
    TRANS_STATUS: 1,
    PARTY_ID: 1,
    PARTY_NAME: '',
    NARRATION: '',
    INVOICE_ID: '',
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
  newRowAdded: boolean = false;
  private newRowIndex: number | null = null;
  customerType: 'Unit' | 'Dealer' = 'Unit'; // default selected
  companyList: any;
  selectedCompanyId: any;
  distributorList: any;
  selectedDistributorId: any;
  tempGstValue: any;
  docNo: any;
  pendingInvoices: any;
  invoicePopupVisible: boolean = false;
  customerTypes = [
    { text: 'Unit', value: 'Unit' },
    { text: 'Dealer', value: 'Dealer' },
  ];
  netAmountDisplay: number;
  selectedCustomerId: any;
  sessionData: any;
  selected_vat_id: any;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.sessionData_tax()
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;

      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
        this.companyList = [selectedCompany]; // ✅ Show only selected company
      }

      if (userData.USER_ID) {
        this.creditFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.creditFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
    this.creditFormData.TRANS_DATE = this.formatAsDDMMYYYY(new Date());
    console.log('ADDCOMPONENT TRIGERRED');
    this.getLedgerCodeDropdown();
    this.getCompanyListDropdown();
    this.getDocNo();
    this.getPendingInvoices();
  }
  
      sessionData_tax(){
        // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'" 
        this.sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(this.sessionData,'=================session data==========')
this.selected_vat_id=this.sessionData.VAT_ID
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

    this.creditFormData.NOTE_DETAIL.push(newRow);

    // Refresh grid and edit new row
    setTimeout(() => {
      this.itemsGridRef?.instance.option('dataSource', [
        ...this.creditFormData.NOTE_DETAIL,
      ]);
      const newRowIndex = this.itemsGridRef?.instance
        .getVisibleRows()
        .findIndex((r) => r.data === newRow);

      if (newRowIndex >= 0) {
        this.itemsGridRef?.instance.editCell(newRowIndex, 'SL_NO');
      }
    }, 50);
  }

  // ngAfterViewInit(): void {
  //   // Wait for the grid and everything else to stabilize
  //   setTimeout(() => {
  //     requestAnimationFrame(() => {
  //       requestAnimationFrame(() => {
  //         if (this.invoiceBoxRef?.instance) {
  //           this.invoiceBoxRef.instance.focus();
  //         }
  //       });
  //     });
  //   }, 500); // Delay long enough for grid rendering to complete
  // }

  ngAfterViewInit(): void {
    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (
            this.itemsGridRef?.instance &&
            (!this.creditFormData.NOTE_DETAIL ||
              this.creditFormData.NOTE_DETAIL.length === 0)
          ) {
            // ✅ Add row and focus first cell
            this.itemsGridRef.instance.addRow();

            setTimeout(() => {
              this.itemsGridRef?.instance?.editCell(0, 'SL_NO');
            }, 100);
          } else {
            // ✅ No new row needed — focus invoiceBox and grid cell
            if (this.invoiceBoxRef?.instance) {
              this.invoiceBoxRef.instance.focus();
            }

            setTimeout(() => {
              this.itemsGridRef?.instance?.editCell(0, 'SL_NO');
            }, 100);
          }
        });
      });
    }, 500);
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
  }

  onInitNewRow(e: any): void {
    this.newRowIndex = e.component.getRowIndexByKey(e.key);
  }

  onCustomerTypeChanged(event: any): void {
    setTimeout(() => {
      if (this.newRowIndex !== null) {
        this.itemsGridRef?.instance?.editCell(this.newRowIndex, 'SL_NO'); // or first editable column
      }
    }, 100);
  }

  onCustomerTypeKeyDown(event: any): void {
    if (event.event?.key === 'Enter') {
      setTimeout(() => {
        this.customerType = this.customerType === 'Unit' ? 'Dealer' : 'Unit';
      }, 100); // Small delay to allow row commit
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
    if (!this.dropdownOpened) return;

    setTimeout(() => {
      if (this.customerType === 'Unit' && this.customerRef?.instance?.close) {
        this.customerRef.instance.close();
      } else if (
        this.customerType === 'Dealer' &&
        this.distributorRef?.instance?.close
      ) {
        this.distributorRef.instance.close();
      }
      this.dropdownOpened = false;
    }, 100);
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

            this.creditFormData.NOTE_DETAIL.push(newRow);

            setTimeout(() => {
              grid.option('dataSource', [...this.creditFormData.NOTE_DETAIL]);

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

  onRowInserted(e: any): void {
    if (this.newRowAdded) {
      this.newRowAdded = false;

      setTimeout(() => {
        const visibleRows = this.itemsGridRef?.instance?.getVisibleRows();
        const lastRow = visibleRows[visibleRows.length - 1];
        const newRowIndex = lastRow.rowIndex;

        this.itemsGridRef?.instance?.editCell(newRowIndex, 'SL_NO');
      }, 100);
    }
  }

  onNarrationKeyDown(event: any): void {
    if (event.event?.key === 'Enter') {
      setTimeout(() => {
        this.saveButtonRef?.instance?.focus?.();
      }, 0);
    }
  }

  getCompanyListDropdown() {
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.distributorList = response;
      console.log(this.distributorList, 'distributorList');
    });
  }

  openInvoicePopup() {
    console.log('EVENT ');
    this.getPendingInvoices(); // Ensure you load fresh data
    this.invoicePopupVisible = true;
  }

  getPendingInvoices() {
    const payload = {
      CUST_ID: this.selectedCustomerId, // or customerId if you pass it
    };

    this.dataService
      .getPendingInvoiceList(payload)
      .subscribe((response: any) => {
        this.pendingInvoices = response.Data;
        console.log(this.pendingInvoices, 'PENDINGINVOICES');
      });
  }

  selectInvoice(e: any) {
    console.log('Invoice selected:', e);
    const selected = e.data;
    this.creditFormData.INVOICE_NO = selected.INVOICE_NO;
    this.creditFormData.DUE_AMOUNT = selected.BALANCE_AMOUNT;
    this.creditFormData.INVOICE_ID = selected.INVOICE_ID;
    console.log(this.creditFormData.INVOICE_ID, 'INVOICEIDDDDDDDDDDDDDDDD');
    this.invoicePopupVisible = false;
  }

  getDocNo() {
    this.dataService.getDocNo().subscribe((response: any) => {
      this.docNo = response.DOC_NO;
      console.log(response.DOC_NO, 'DOCNOOOOOOOOO');
    });
  }

  addDefaultRow(): void {
    if (this.itemsGridRef?.instance) {
      this.itemsGridRef.instance.addRow();
    } else {
      console.warn('Grid instance not ready to add row.');
    }
  }

  saveJournalVoucher(): void {
    this.itemsGridRef?.instance?.saveEditData();

    const gridData = this.itemsGridRef?.instance
      ?.getVisibleRows()
      .map((r) => r.data);

    if (!this.creditFormData.INVOICE_NO) {
      notify(
        {
          message: 'Please select an invoice before saving.',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
        3000
      );
      return;
    }

    if (!this.creditFormData.DISTRIBUTOR_ID) {
      notify(
        {
          message: 'Please select customer before saving.',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
        3000
      );
      return;
    }

    this.creditFormData.NOTE_DETAIL = gridData
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

    if (
      !this.creditFormData.NOTE_DETAIL ||
      this.creditFormData.NOTE_DETAIL.length === 0
    ) {
      notify(
        {
          message: 'Please add at least one valid row before saving.',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
        3000
      );
      return;
    }
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.creditFormData.COMPANY_ID =
        this.selectedCompanyId || userData?.Companies?.[0]?.COMPANY_ID || null;
      this.creditFormData.FIN_ID =
        userData?.FINANCIAL_YEARS?.[0]?.FIN_ID || null;
      this.creditFormData.UNIT_ID =
        this.selectedCompanyId || userData?.Companies?.[0]?.COMPANY_ID || null;
    }
    this.dataService
      .insertCreditNote(this.creditFormData)
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
        this.resetCreditNoteForm();
      });
  }

  get netAmountString(): string {
    const details = this.creditFormData?.NOTE_DETAIL || [];
    let totalAmount = 0;
    let totalGST = 0;

    details.forEach((item: any) => {
      totalAmount += parseFloat(item.Amount || 0);
      totalGST += parseFloat(item.gstAmount || 0);
    });

    return (totalAmount + totalGST).toFixed(2); // return string
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
      INVOICE_ID: '',
      INVOICE_NO: '',
      NOTE_DETAIL: [
        {
          SL_NO: '',
          HEAD_ID: '',
          AMOUNT: '',
          VAT_AMOUNT: '',
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
  declarations: [AddCreditNoteComponent],
  exports: [AddCreditNoteComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddCreditNoteModule {}
