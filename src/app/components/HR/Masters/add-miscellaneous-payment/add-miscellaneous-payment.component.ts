import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  Output,
  ViewChild,
} from '@angular/core';
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
  DxValidationGroupModule,
  DxNumberBoxModule,
  DxValidationGroupComponent,
  DxTextBoxComponent,
  DxSelectBoxComponent,
  DxNumberBoxComponent,
  DxButtonComponent,
  DxDataGridComponent,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-add-miscellaneous-payment',
  templateUrl: './add-miscellaneous-payment.component.html',
  styleUrls: ['./add-miscellaneous-payment.component.scss'],
})
export class AddMiscellaneousPaymentComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
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
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  Department:any;
  miscFormData: any = {
    TRANS_TYPE: 3,
    COMPANY_ID: '',
    FIN_ID: '',
    TRANS_DATE: new Date(),
    CHEQUE_NO: '',
    CHEQUE_DATE: '',
    BANK_NAME: '',
    PARTY_NAME: '',
    NARRATION: '',
    CREATE_USER_ID: '',
    PAY_TYPE_ID: '',
    PAY_HEAD_ID: '',
    DEPT_ID:0,
    MISC_DETAIL: [
      {
        SL_NO: '',
        HEAD_ID: '',
        REMARKS: '',
        AMOUNT: '',
        VAT_AMOUNT: '',
        VAT_REGN: '',
        VAT_PERCENT: '',
      },
    ],
  };
  employee: any;
  salaryHead: any;
  AllowCommitWithSave: any;
  distributorList: any;
  ledgerList: any;
  invoicePopupVisible: any;
  netAmountString: any;
  pendingInvoices: any;
  filteredLedgerList: any;
  supplierList: any;
  receiptMode: string = 'Cash';
  pendingInvoicelist: any[] = [
    {
      ledgerCode: '',
      ledgerName: '',
      DESCRIPTION: '',
      AMOUNT: null,
      TAX: null,
      TAX_AMOUNT: null,
    },
  ];
  userId: any;
  companyId: any;
  finId: any;
  paymentMode = 'Cash';
  netAmountDisplay: number;
  isApproved: boolean = false;
  pendingNo: any;
  sessionData: any;
  selected_vat_id: any;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.getPendingNo();
    if (this.EditingResponseData) {
      console.log('EditingResponseData on init:', this.EditingResponseData);
    }
    this.isEditDataAvailable();
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.userId = userData?.USER_ID;
      this.companyId = userData?.SELECTED_COMPANY?.COMPANY_ID;
      this.finId = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID;

      console.log('User ID:', this.userId);
      console.log('Company ID:', this.companyId);
      console.log('Financial ID:', this.finId);

      if (userData.USER_ID) {
        this.miscFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.miscFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
    this.getLedgerCodeDropdown();
    this.get_Department_dropdown();
    this.sessionData_tax();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.beneficiaryNameRef.instance.focus();
    }, 500); // allow grid/toolbar to fully render
  }

  getPendingNo() {
    this.dataService.getPendingNo().subscribe((response: any) => {
      this.pendingNo = response.PAYMENT_NO;
    });
  }

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    const data = this.EditingResponseData.Data;

    // Reverse mapping PAY_TYPE_ID -> receipt mode text
    const payTypeReverseMapping: any = {
      1: 'Cash',
      2: 'Bank',
      3: 'PDC',
      4: 'Adjustments',
    };
    this.receiptMode = payTypeReverseMapping[data.PAY_TYPE_ID] || 'Cash';

    // Map form fields
    this.miscFormData.PARTY_NAME = data.PARTY_NAME || '';
    this.miscFormData.VOUCHER_NO = data.VOUCHER_NO || '';
    // this.miscFormData.TRANS_DATE = data.TRANS_DATE
    //   ? new Date(data.TRANS_DATE)
    //   : new Date();
    this.miscFormData.TRANS_DATE = new Date();
    this.miscFormData.CHEQUE_NO = data.CHEQUE_NO || '';
    this.miscFormData.CHEQUE_DATE = data.CHEQUE_DATE
      ? new Date(data.CHEQUE_DATE)
      : null;
    this.miscFormData.BANK_NAME = data.BANK_NAME || '';
    this.miscFormData.NARRATION = data.NARRATION || '';
    this.miscFormData.TRANS_ID = data.TRANS_ID || '';
    this.miscFormData.PAY_HEAD_ID = data.PAY_HEAD_ID || '';
    this.miscFormData.COMPANY_ID = data.COMPANY_ID || '';
    this.miscFormData.FIN_ID = data.FIN_ID || '';
    this.miscFormData.VAT_REGN = data.VAT_REGN || '';

     this.miscFormData.DEPT_ID = data.DEPT_ID ? Number(data.DEPT_ID) : null;
    // Populate pendingInvoicelist from DetailList
    if (Array.isArray(data.DetailList) && data.DetailList.length > 0) {
      this.pendingInvoicelist = data.DetailList.map((item: any) => ({
        ledgerCode: data.LEDGER_CODE ?? '', // coming from parent object
        ledgerName: data.LEDGER_NAME ?? '',
        DESCRIPTION: item.REMARKS ?? '',
        AMOUNT: item.AMOUNT ?? null,
        TAX: item.VAT_PERCENT ?? null,
        TAX_AMOUNT: item.VAT_AMOUNT ?? null,
      }));
    } else {
      // Keep one empty row
      this.pendingInvoicelist = [
        {
          ledgerCode: '',
          ledgerName: '',
          DESCRIPTION: '',
          AMOUNT: null,
          TAX: null,
          TAX_AMOUNT: null,
        },
      ];
    }
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
    console.log(rowIndex);
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
              '#payHeadIdField input'
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

    if (e.dataField === 'DESCRIPTION') {
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
            grid?.saveEditData(); // commit current cell

            // ✅ Get the current row data after commit
            const currentRow = grid.getVisibleRows()[rowIndex]?.data;
            if (!currentRow) return;

            // ✅ Calculate TAX_AMOUNT
            const amount = Number(currentRow.AMOUNT) || 0;
            const taxRate = Number(currentRow.TAX) || 0;
            const taxAmount = +((amount * taxRate) / 100).toFixed(2);

            grid.cellValue(rowIndex, 'TAX_AMOUNT', taxAmount);

            // ✅ Ensure we update our source array with this calculated value
            this.miscFormData.MISC_DETAIL[rowIndex] = {
              ...currentRow,
              TAX_AMOUNT: taxAmount,
            };

            // ✅ Move to next row or add row
            if (rowIndex === grid.getVisibleRows().length - 1) {
              // Add new row only after preserving data
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
              setTimeout(() => {
                grid.editCell(rowIndex + 1, 'ledgerCode');
              }, 50);
            }
          }, 50);
        }
      };
    }
  }

  onRowRemoved(e: any) {
    setTimeout(() => {
      const grid = e.component;

      // Add empty row data to the end
      const newRow = {
        HEAD_ID: '',
        DESCRIPTION: '',
        AMOUNT: '',
        TAX: '',
        TAX_AMOUNT: '',
      };
      this.miscFormData.MISC_DETAIL.push(newRow);

      // Refresh grid
      grid.option('dataSource', [...this.miscFormData.MISC_DETAIL]);

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
        console.log('API Response:', response); // <== LOG FULL RESPONSE
        this.ledgerList = response?.Data || []; // Fallback to empty array
        this.onReceiptModeChange({ value: this.receiptMode });
        console.log(
          'Ledger List Loaded=============================:',
          this.ledgerList
        );
      },
      error: (err) => {
        console.error('Ledger API Error:', err); // <== CATCH ERRORS
      },
    });
  }

  calculateTaxAmount(rowData: any): number {
    const amount = Number(rowData.AMOUNT) || 0;
    const tax = Number(rowData.TAX) || 0;
    return +(amount * tax).toFixed(2); // returns tax amount rounded to 2 decimal places
  }

  onReceiptModeChange(e: any) {
    this.receiptMode = e.value;

    if (this.receiptMode === 'Cash') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID === 13
      );
    } else if (this.receiptMode === 'Bank') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID === 14
      );
    } else if (this.receiptMode === 'Adjustments') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID !== 13 && item.GROUP_ID !== 14
      );
    } else {
      this.filteredLedgerList = [...this.ledgerList]; // For 'PDC' or others
    }
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
        'error'
      );
      return;
    }
    this.miscFormData.MISC_DETAIL = this.miscFormData.MISC_DETAIL.filter(
      (row) => row.ledgerCode || row.amount != null || row.taxPercent != null
    );

     // ✅ Department validation (only when Approve is checked)
  if (this.isApproved && !this.miscFormData.DEPT_ID) {
    notify(
      {
        message: 'Please select department.',
        position: 'top center',
      },
      'error'
    );
    return;
  }
    // 4. Prepare final payload
    const payload = {
      ...this.miscFormData,
      MISC_DETAIL: cleanedList.map((item: any, index: number) => {
        const amount = Number(item.AMOUNT) || 0;
        const tax = Number(item.TAX) || 0;
        const taxAmount = +(amount * tax).toFixed(2);

        // Find the HEAD_ID from ledgerList using ledgerCode
        const matchedLedger = this.ledgerList.find(
          (ledger: any) => ledger.HEAD_CODE === item.ledgerCode
        );

        return {
          SL_NO: index + 1,
          HEAD_ID: matchedLedger?.HEAD_ID || '', // ✅ Use actual HEAD_ID
          REMARKS: item.DESCRIPTION || '',
          AMOUNT: amount,
          VAT_AMOUNT: taxAmount,
          VAT_REGN: this.miscFormData.VAT_REGN || 0,
          VAT_PERCENT: tax,
        };
      }),
    };

    // // 5. Submit via API
    this.dataService.insertMiscPayment(payload).subscribe({
      next: (response: any) => {
        if (response?.flag == 1) {
          notify(
            {
              message: 'Miscellaneous Payment Added Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.popupClosed.emit(); // Or reset form if needed
        } else {
          notify(
            {
              message: response?.Message || 'Failed to save data.',
              position: { at: 'top center', my: 'top center' },
            },
            'error'
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
          'error'
        );
      },
    });
  }

  onUpdateMiscReceipt() {
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
        'error'
      );
      return;
    }

    const { DetailList, ...cleanedFormData } = this.miscFormData;
    const payload = {
      ...this.miscFormData,
      MISC_DETAIL: cleanedList.map((item: any, index: number) => {
        const amount = Number(item.AMOUNT) || 0;
        const tax = Number(item.TAX) || 0;
        const taxAmount = +(amount * tax).toFixed(2);

        // Find the HEAD_ID from ledgerList using ledgerCode
        const matchedLedger = this.ledgerList.find(
          (ledger: any) => ledger.HEAD_CODE === item.ledgerCode
        );

        return {
          SL_NO: index + 1,
          HEAD_ID: matchedLedger?.HEAD_ID || '', // ✅ Use actual HEAD_ID
          REMARKS: item.DESCRIPTION || '',
          AMOUNT: amount,
          VAT_AMOUNT: taxAmount,
          VAT_REGN: this.miscFormData.VAT_REGN || 0,
          VAT_PERCENT: tax,
        };
      }),
    };
    // 4. Prepare final payload
    // const payload = {
    //   ...cleanedFormData,
    //   MISC_DETAIL: cleanedList.map((item: any, index: number) => ({
    //     SL_NO: index + 1,
    //     HEAD_ID: item.HEAD_ID || '', // Use HEAD_ID, not ledgerCode
    //     REMARKS: item.REMARKS || '',
    //     AMOUNT: item.AMOUNT || 0,
    //     VAT_AMOUNT: this.calculateTaxAmount(item),
    //     VAT_REGN: this.miscFormData.VAT_REGN,
    //     VAT_PERCENT: item.VAT_PERCENT || 0,
    //   })),
    // };
    console.log(payload, 'PAYLOADDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD');
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
            'success'
          );
          this.popupClosed.emit(); // Or reset form if needed
        } else {
          notify(
            {
              message: response?.Message || 'Failed to save data.',
              position: { at: 'top center', my: 'top center' },
            },
            'error'
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
          'error'
        );
      },
    });
  }

    get_Department_dropdown(){
    this.dataService.Department_Dropdown().subscribe((res: any) => {
      console.log('supplier dropdown', res);
      this.Department = res;
    });
  }

  handleClose() {
    this.popupClosed.emit();
  }

  cancel(){
     this.popupClosed.emit();
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
  declarations: [AddMiscellaneousPaymentComponent],
  exports: [AddMiscellaneousPaymentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddMiscellaneousPaymentModule {}
