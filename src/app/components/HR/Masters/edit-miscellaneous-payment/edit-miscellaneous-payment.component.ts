import {
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
import {
  BrowserModule,
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
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
  DxValidationGroupModule,
  DxNumberBoxModule,
  DxButtonComponent,
  DxDataGridComponent,
  DxNumberBoxComponent,
  DxSelectBoxComponent,
  DxTextBoxComponent,
  DxValidationGroupComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { AddMiscellaneousPaymentComponent } from '../add-miscellaneous-payment/add-miscellaneous-payment.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-edit-miscellaneous-payment',
  templateUrl: './edit-miscellaneous-payment.component.html',
  styleUrls: ['./edit-miscellaneous-payment.component.scss'],
})
export class EditMiscellaneousPaymentComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() miscellaneousData: any;
  @Input() isReadOnlyMode: boolean = false;
  @ViewChild('miscFormGroup') miscFormGroup: DxValidationGroupComponent;
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
  @ViewChild('beneficiaryNameRef', { static: false })
  beneficiaryNameRef!: DxTextBoxComponent;
  @ViewChild('taxRegnRef', { static: false })
  taxRegnRef!: DxTextBoxComponent;
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  dataGrid: DxDataGridComponent;
  @Input() MiscPaymentId: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  Department: any;
  pendingInvoicelist: any;
  miscFormData: any;
  userId: any;
  companyId: any;
  finId: any;
  ledgerList: any;
  receiptMode: any;
  filteredLedgerList: any;
  isApproved: boolean = false;
  pendingNo: any;
  miscDataFromInput: any = null;
  sessionData: any;
  selected_vat_id: any;
  HSNCODE: any;
  GST: any;

  pdfSrc: SafeResourceUrl | null = null;
  isPdfPopupVisible: boolean = false;

  constructor(
    private dataService: DataService,
    private sanitizer: DomSanitizer,
  ) {
    this.getLedgerCodeDropdown();
    // this.get_Department_dropdown();
  }

  ngOnInit() {
    this.getPendingNo();
    this.sessionData_tax();
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.userId = userData?.USER_ID;
      this.companyId = userData?.SELECTED_COMPANY?.COMPANY_ID;
      this.finId = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID;
      this.HSNCODE = userData.GeneralSettings.HSN_CODE;
      this.GST = userData.GeneralSettings.GST_PERC;

      if (userData.USER_ID) {
        this.miscFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.miscFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
    this.getLedgerCodeDropdown();
    // this.get_Department_dropdown();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['miscellaneousData'] &&
      changes['miscellaneousData'].currentValue
    ) {
      const data = changes['miscellaneousData'].currentValue.Data;

      // Assign main data to miscFormData
      this.miscFormData = {
        ...this.miscFormData,
        ...data,
      };

      // Assign DetailList to pendingInvoiceList
      this.pendingInvoicelist = data.DetailList || [];

      this.pendingInvoicelist = (data.DetailList || []).map((item: any) => {
        const ledger = this.ledgerList.find(
          (l: any) => l.HEAD_CODE === item.HEAD_ID,
        );
        return {
          ...item,
          ledgerCode: item.LEDGER_CODE,
          ledgerName: ledger?.LEDGER_NAME || '',
          HSN_CODE: this.HSNCODE,
        };
      });
      const matchedLedger = this.ledgerList.find(
        (ledger: any) => ledger.HEAD_CODE === this.miscFormData.LEDGER_CODE,
      );

      if (matchedLedger) {
        this.miscFormData.HEAD_ID = matchedLedger.HEAD_ID;
      } else {
        console.warn(
          'No matching HEAD_ID found for LEDGER_CODE:',
          this.miscFormData.LEDGER_CODE,
        );
      }
      const lastRow =
        this.miscFormData.MISC_DETAIL[this.miscFormData.MISC_DETAIL.length - 1];
      this.pendingInvoicelist = (data.DetailList || []).map((item: any) => {
        const ledger = this.ledgerList.find(
          (l: any) => l.HEAD_CODE === item.HEAD_ID,
        );
        return {
          ...item,
          ledgerCode: item.LEDGER_CODE,
          ledgerName: ledger?.LEDGER_NAME || '',
        };
      });
      // Ensure empty row exists
      if (
        this.pendingInvoicelist.length === 0 ||
        this.pendingInvoicelist[this.pendingInvoicelist.length - 1].ledgerCode
      ) {
        this.pendingInvoicelist.push({
          HEAD_ID: '',
          DESCRIPTION: '',
          AMOUNT: '',
          TAX: '',
          TAX_AMOUNT: '',
          ledgerCode: '',
          ledgerName: '',
        });
      }

      // this.receiptMode = this.getReceiptModeFromPayTypeId(data.PAY_TYPE_ID);
    }
  }

  calculateTaxAmount(rowData: any): number {
    const amount = Number(rowData.AMOUNT) || 0;
    const tax = Number(rowData.VAT_PERCENT) || 0;
    return +(amount * tax).toFixed(2); // returns tax amount rounded to 2 decimal places
  }

  getReceiptModeFromPayTypeId(id: number): string {
    switch (id) {
      case 1:
        return 'Cash';
      case 2:
        return 'Bank';
      case 3:
        return 'Adjustments';
      default:
        return '';
    }
  }

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.beneficiaryNameRef.instance.focus();
    }, 500); // allow grid/toolbar to fully render
  }

  focusTaxRegn() {
    this.taxRegnRef.instance.focus();
  }

  focusGridFirstCell() {
    const grid = this.itemsGridRef.instance;
    if (grid) {
      // focus first cell in first visible row
      setTimeout(() => {
        const firstCell = grid.getCellElement(0, 'ledgerCode'); // or index 0 if you prefer numeric
        if (firstCell) {
          grid.focus(firstCell);
        }
      });
    }
  }

  onEditorPreparing(e: any) {
    if (e.parentType !== 'dataRow') return;
    const rowIndex = e.row?.rowIndex;
    const grid = this.itemsGridRef?.instance;
    e.editorOptions.onKeyDown = (event: any) => {
      if (event.event.key === 'Tab') {
        event.event.preventDefault();

        // Find last editable cell
        const visibleRows = grid.getVisibleRows();
        const lastRowIndex = visibleRows.length - 1;
        const visibleColumns = grid
          .getVisibleColumns()
          .filter((c) => c.dataField);
        const lastColumnIndex = visibleColumns.length - 1;

        const isLastCell =
          rowIndex === lastRowIndex && e.columnIndex === lastColumnIndex;

        if (isLastCell) {
          setTimeout(() => {
            const ledgerSelect = document.querySelector(
              '#payHeadIdField input',
            ) as HTMLElement;
            if (ledgerSelect) {
              ledgerSelect.focus();
            }
          }, 50);
        }
      }
    };
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
              this.itemsGridRef?.instance?.editCell(rowIndex, 'DESCRIPTION');
            }, 50);
          }
        }
      };

      e.editorOptions.onValueChanged = (args: any) => {
        const selectedLedger = this.ledgerList.find(
          (item: any) => item.HEAD_CODE === args.value,
        );
        e.setValue(args.value);
        if (selectedLedger) {
          e.component.cellValue(
            rowIndex,
            'ledgerName',
            selectedLedger.HEAD_NAME,
          );
          setTimeout(() => {
            this.itemsGridRef?.instance?.editCell(rowIndex, 'DESCRIPTION');
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
          (item: any) => item.HEAD_NAME === args.value,
        );
        e.setValue(args.value);
        if (selectedLedger) {
          e.component.cellValue(
            rowIndex,
            'ledgerCode',
            selectedLedger.HEAD_CODE,
          );
        }
      };
    }

    if (e.dataField === 'DESCRIPTION') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = e.component;
          const rowIndex = e.row.rowIndex;
          // Move focus to the "ledgerCode" column in the same row
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'AMOUNT'));
          });
        }
      };
    }
    if (e.dataField === 'AMOUNT') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = e.component;
          const rowIndex = e.row.rowIndex;
          // Move focus to the "ledgerCode" column in the same row
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'TAX'));
          });
        }
      };
    }
    if (e.dataField === 'TAX') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          event.event.preventDefault();

          const grid = this.itemsGridRef?.instance;
          const rowIndex = e.row.rowIndex;

          // Commit TAX value
          const editorElement = event.event.target as HTMLElement;
          editorElement.blur();

          setTimeout(() => {
            grid?.saveEditData();

            // Calculate TAX_AMOUNT
            const currentRow = grid.getVisibleRows()[rowIndex]?.data;
            if (!currentRow) return;
            const amount = Number(currentRow.AMOUNT) || 0;
            const taxRate = Number(currentRow.TAX) || 0;
            const taxAmount = +((amount * taxRate) / 100).toFixed(2);

            grid.cellValue(rowIndex, 'TAX_AMOUNT', taxAmount);
            this.miscFormData.MISC_DETAIL[rowIndex] = {
              ...currentRow,
              TAX_AMOUNT: taxAmount,
            };

            // ✅ Check if this is last cell of last row
            const visibleRows = grid.getVisibleRows();
            const lastRowIndex = visibleRows.length - 1;
            const visibleColumns = grid
              .getVisibleColumns()
              .filter((c) => c.dataField);
            const lastColumnIndex = visibleColumns.length - 1;

            const isLastCell =
              rowIndex === lastRowIndex && e.columnIndex === lastColumnIndex;

            if (isLastCell) {
              // Add new row
              const newRow = {
                HEAD_ID: '',
                DESCRIPTION: '',
                AMOUNT: '',
                TAX: '',
                TAX_AMOUNT: '',
              };
              this.miscFormData.MISC_DETAIL.push(newRow);

              grid.option('dataSource', [...this.miscFormData.MISC_DETAIL]);
              setTimeout(() => {
                const newRowIndex = grid.getVisibleRows().length - 1;
                grid.editCell(newRowIndex, 'ledgerCode');
              }, 50);
            } else {
              // Move to next cell in same row or next row
              grid.editCell(rowIndex, e.columnIndex + 1);
            }
          }, 50);
        }
      };
    }
  }

  onRowRemoved(e: any) {
    setTimeout(() => {
      const grid = e.component;

      // Add empty row to the end of pendingInvoicelist
      this.pendingInvoicelist.push({
        HEAD_ID: '',
        DESCRIPTION: '',
        AMOUNT: '',
        TAX: '',
        TAX_AMOUNT: '',
        ledgerCode: '',
        ledgerName: '',
      });

      // Refresh grid
      grid.option('dataSource', [...this.pendingInvoicelist]);

      // Focus the first cell of the new row
      setTimeout(() => {
        const visibleRows = grid.getVisibleRows();
        const newRowIndex = visibleRows.length - 1;
        grid.editCell(newRowIndex, 'ledgerCode');
      }, 50);
    }, 0);
  }

  getLedgerCodeDropdown() {
    this.dataService.getAccountHeadList().subscribe({
      next: (response: any) => {
        this.ledgerList = response?.Data || [];

        this.receiptMode = this.getReceiptModeFromPayTypeId(
          this.miscFormData.PAY_TYPE_ID,
        );
        this.onReceiptModeChange({ value: this.receiptMode }); // trigger ledger filter update
      },
      error: (err) => {
        console.error('Ledger API Error:', err);
      },
    });
  }

  setHeadIdFromLedgerCode() {
    if (this.miscFormData?.LEDGER_CODE && this.ledgerList?.length) {
      const matchedLedger = this.ledgerList.find(
        (ledger: any) => ledger.HEAD_CODE === this.miscFormData.LEDGER_CODE,
      );

      if (matchedLedger) {
        this.miscFormData.HEAD_ID = matchedLedger.HEAD_ID;
      } else {
      }
    }
  }

  onReceiptModeChange(e: any) {
    this.receiptMode = e.value;

    if (this.receiptMode === 'Cash') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID === 13,
      );
    } else if (this.receiptMode === 'Bank') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID === 14,
      );
    } else if (this.receiptMode === 'Adjustments') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID !== 13 && item.GROUP_ID !== 14,
      );
    } else {
      this.filteredLedgerList = [...this.ledgerList]; // For 'PDC' or others
    }
    this.setHeadIdFromLedgerCode();
  }

  getPendingNo() {
    this.dataService.getPendingNo().subscribe((response: any) => {
      this.pendingNo = response.PAYMENT_NO;
    });
  }

  onSave() {
    // 1. Validate form fields
    const result = this.miscFormGroup?.instance?.validate();

    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.miscFormData.COMPANY_ID =
        userData?.SELECTED_COMPANY?.COMPANY_ID || 0;
      this.miscFormData.FIN_ID = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID || 0;
      this.miscFormData.CREATE_USER_ID = userData?.USER_ID || 0;
    }

    const payTypeMapping: any = {
      Cash: 1,
      Bank: 2,
      PDC: 3,
      Adjustments: 4,
    };

    this.miscFormData.PAY_TYPE_ID = payTypeMapping[this.receiptMode] || null;

    // 2. Commit any pending cell edits in grid
    this.itemsGridRef.instance.closeEditCell();

    // 3. Optional: Clean up empty rows
    const cleanedList = this.pendingInvoicelist.filter((item: any) => {
      return item.ledgerCode || item.DESCRIPTION || item.AMOUNT;
    });

    if (cleanedList.length === 0) {
      notify(
        {
          message: 'Please add at least one line item.',
          position: 'top center',
        },
        'error',
      );
      return;
    }

    const { DetailList, ...cleanedFormData } = this.miscFormData;

    // 4. Prepare final payload
    const payload = {
      ...cleanedFormData,
      MISC_DETAIL: cleanedList.map((item: any, index: number) => ({
        SL_NO: index + 1,
        HEAD_ID: item.HEAD_ID || '', // Use HEAD_ID, not ledgerCode
        REMARKS: item.REMARKS || '',
        AMOUNT: item.AMOUNT || 0,
        VAT_AMOUNT: this.calculateTaxAmount(item),
        VAT_REGN: this.miscFormData.VAT_REGN,
        VAT_PERCENT: item.VAT_PERCENT || 0,
      })),
    };

    // 5. Submit via API - Conditional: Approve or Update
    const submitObservable = this.isApproved
      ? this.dataService.approveMiscPayment(payload) // <- Call approve API
      : this.dataService.updateMiscPayment(payload); // <- Default update API

    submitObservable.subscribe({
      next: (response: any) => {
        if (response?.flag == 1) {
          notify(
            {
              message: this.isApproved
                ? 'Miscellaneous Payment Approved Successfully'
                : 'Miscellaneous Payment Updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success',
          );
          this.popupClosed.emit(); // Or reset form if needed
        } else {
          notify(
            {
              message: response?.Message || 'Failed to save data.',
              position: { at: 'top center', my: 'top center' },
            },
            'error',
          );
        }
      },
      error: (err) => {
        console.error('Save Error:', err);
        notify(
          {
            message: 'Something went wrong while saving.',
            position: { at: 'top center', my: 'top center' },
          },
          'error',
        );
      },
    });
  }

  //     get_Department_dropdown(){
  //   this.dataService.Department_Dropdown().subscribe((res: any) => {
  //     this.Department = res;
  //   });
  // }

  handleClose() {
    this.popupClosed.emit();
  }

  cancel() {
    this.popupClosed.emit();
  }

  viewPdf(): void {
    this.isPdfPopupVisible = true;
    this.dataService
      .selectMiscPayment(this.MiscPaymentId)
      .subscribe((response: any) => {
        if (response) {
          this.pdfSrc = this.get_pdf(response);
        }
      });
  }

  get_pdf(data: any): SafeResourceUrl {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const margin = 12;
    let y = 12;

    // ===========================
    //  RETURN PDF
    // ===========================
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
    DxValidatorModule,
    DxValidationGroupModule,
    DxNumberBoxModule,
  ],
  providers: [],
  declarations: [EditMiscellaneousPaymentComponent],
  exports: [EditMiscellaneousPaymentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditMiscellaneousPaymentModule {}
