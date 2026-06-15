import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  NgZone,
  Output,
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
import { confirm } from 'devextreme/ui/dialog';
import jsPDF from 'jspdf';

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
  @Input() status: any;
  @Input() canApprove: boolean = false;
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
  @Input() mode: string = 'new';
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
    IS_APPROVED: false,
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
  selectedstoreId: any;
  HSNCODE: any;
  GST: any;

  pdfSrc: SafeResourceUrl | null = null;
  isPdfPopupVisible: boolean = false;
  isSaving: boolean;
  selected_Company_id: any;
  Store: any;
  @Input() verifyMiscPopupOpened: boolean = false;
  BankID: any;
  settings: any;
  CashID: any;

  get popupTitle(): string {
    switch (this.mode) {
      case 'new':
        return 'New Miscellaneous Payment';

      case 'edit':
        return 'Edit Miscellaneous Payment';

      case 'verify':
        return 'Verify Miscellaneous Payment';

      case 'approve':
        return 'Approve Miscellaneous Payment';

      case 'view':
        return 'View Miscellaneous Payment';

      default:
        return 'Miscellaneous Payment';
    }
  }

  get actionButtonText(): string {
    if (this.isSaving) {
      switch (this.mode) {
        case 'new':
          return 'Saving...';

        case 'edit':
          return 'Updating...';

        case 'verify':
          return 'Verifying...';

        case 'approve':
          return 'Approving...';

        default:
          return 'Processing...';
      }
    }

    switch (this.mode) {
      case 'new':
        return 'Save';

      case 'edit':
        return 'Update';

      case 'verify':
        return 'Verify';

      case 'approve':
        return 'Approve';

      default:
        return '';
    }
  }

  onActionClick() {
    switch (this.mode) {
      case 'new':
        this.onSave();
        break;

      case 'edit':
        this.onUpdateMiscReceipt();
        break;

      case 'verify':
        this.onUpdateMiscReceipt();
        break;

      case 'approve':
        this.onUpdateMiscReceipt();
        break;
    }
  }
  constructor(
    private dataService: DataService,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer,
  ) {}

  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selectedstoreId = sessionData.Configuration[0].STORE_ID;
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  ngOnInit() {
    this.sessionDetails();
    this.Department_dropdown();
    this.store_dropdown();
    if (this.EditingResponseData) {
    }

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
    if (this.isEditing) {
      this.isEditDataAvailable(); // load edit data
    } else {
      this.getPendingNo(); // only fetch new number in add mode
    }
    this.getLedgerCodeDropdown();
    this.sessionData_tax();
    this.AC_Default();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.beneficiaryNameRef.instance.focus();
    }, 500); // allow grid/toolbar to fully render
  }

  AC_Default() {
    const payload = {
      CompanyID: this.selected_Company_id,
    };
    this.dataService.AC_Default_Settings_Api(payload).subscribe((res: any) => {
      console.log(res);
      this.settings = res.Data;
      this.CashID = this.settings.GP_CASH_ID;
      console.log(this.CashID);
      this.BankID = this.settings.GP_BANK_ID;
      console.log(this.BankID);
    });
  }

  getPendingNo() {
    const payload = {
      TRANS_TYPE: 3,
      COMPANY_ID: this.companyId,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      // this.pendingNo = response.PAYMENT_NO;
      this.miscFormData.DOC_NO = response.DOC_NO;
    });
  }

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
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
    this.miscFormData.DOC_NO = data.DOC_NO || '';
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
        ledgerCode: item.LEDGER_CODE || '',
        ledgerName: item.LEDGER_NAME || '',
        DESCRIPTION: item.REMARKS ?? '',
        AMOUNT: item.AMOUNT ?? null,
        STORE_ID: item.STORE_ID ?? null,
        DEPT_ID: item.DEPT_ID ?? null,
        TAX: item.VAT_PERCENT ?? null,
        TAX_AMOUNT: item.VAT_AMOUNT ?? null,
        HSN_CODE: this.HSNCODE,
      }));
    } else {
      // Keep one empty row
      this.pendingInvoicelist = [
        {
          ledgerCode: '',
          ledgerName: '',
          DESCRIPTION: '',
          DEPT_ID: '',
          STORE_ID: '',
          AMOUNT: null,
          TAX: null,
          TAX_AMOUNT: null,
          HSN_CODE: '',
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
    if (
      e.dataField === 'ledgerCode' ||
      e.dataField === 'ledgerName' ||
      e.dataField === 'DESCRIPTION' ||
      e.dataField === 'AMOUNT' ||
      e.dataField === 'TAX' ||
      e.dataField === 'TAX_AMOUNT' ||
      e.dataField === 'STORE_ID' ||
      e.dataField === 'DEPT_ID'
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
            (r) => r?.data === e.row?.data,
          );
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'GST'));
          }, 50);
        }
      };
    }
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
          const grid = this.itemsGridRef?.instance;

          // Set ledgerName
          grid.cellValue(rowIndex, 'ledgerName', selectedLedger.HEAD_NAME);

          //  Auto-fill HSN + GST %
          grid.cellValue(rowIndex, 'HSN_CODE', this.HSNCODE);
          grid.cellValue(rowIndex, 'TAX', this.GST);

          setTimeout(() => {
            grid.editCell(rowIndex, 'DESCRIPTION');
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
          const grid = this.itemsGridRef?.instance;

          // Set ledgerCode
          grid.cellValue(rowIndex, 'ledgerCode', selectedLedger.HEAD_CODE);

          // Auto-fill HSN + GST %
          grid.cellValue(rowIndex, 'HSN_CODE', this.HSNCODE);
          grid.cellValue(rowIndex, 'TAX', this.GST);
          setTimeout(() => {
            grid.editCell(rowIndex, 'DESCRIPTION');
          }, 50);
        }
      };
    }

    if (e.dataField === 'DESCRIPTION') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          event.event.preventDefault();

          const grid = e.component;
          const rowIndex = e.row.rowIndex;

          // Commit DESCRIPTION value
          const editorElement = event.event.target as HTMLElement;
          editorElement.blur();

          setTimeout(() => {
            grid.saveEditData();

            // Move to Store
            grid.editCell(rowIndex, 'STORE_ID');
          }, 50);
        }
      };
    }

    if (e.dataField === 'STORE_ID') {
      let dropdownOpened = false;

      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          event.event.preventDefault();

          const grid = e.component;

          // First Enter → open dropdown
          if (!dropdownOpened) {
            dropdownOpened = true;

            setTimeout(() => {
              event.component.open();
            }, 50);

            return;
          }

          // Second Enter (after selection) → move next field
          setTimeout(() => {
            dropdownOpened = false;

            grid.editCell(e.row.rowIndex, 'DEPT_ID');
          }, 50);
        }
      };

      // Reset after selecting value
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
      };
    }

    if (e.dataField === 'DEPT_ID') {
      let deptDropdownOpened = false;

      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          event.event.preventDefault();

          const grid = e.component;

          // First Enter → open Department dropdown
          if (!deptDropdownOpened) {
            deptDropdownOpened = true;

            setTimeout(() => {
              event.component.open();
            }, 50);

            return;
          }

          // Second Enter → move to next field
          setTimeout(() => {
            deptDropdownOpened = false;

            grid.editCell(e.row.rowIndex, 'AMOUNT');
          }, 50);
        }
      };

      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
      };
    }
    if (e.dataField === 'AMOUNT') {
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
              // ✅ Check if an empty row already exists
              const hasEmptyRow = this.pendingInvoicelist.some(
                (r: any) =>
                  !r.ledgerCode &&
                  !r.ledgerName &&
                  !r.DESCRIPTION &&
                  (!r.AMOUNT || r.AMOUNT === 0) &&
                  (!r.TAX || r.TAX === 0) &&
                  (!r.TAX_AMOUNT || r.TAX_AMOUNT === 0),
              );

              if (!hasEmptyRow) {
                // ✅ Add new empty row
                const newRow = {
                  ledgerCode: '',
                  ledgerName: '',
                  DESCRIPTION: '',
                  AMOUNT: '',
                  TAX: '',
                  TAX_AMOUNT: '',
                };

                this.pendingInvoicelist.push(newRow);

                // ✅ Refresh the grid
                grid.option('dataSource', [...this.pendingInvoicelist]);

                // ✅ Focus first cell of new row
                setTimeout(() => {
                  const newRowIndex = grid.getVisibleRows().length - 1;
                  grid.editCell(newRowIndex, 'ledgerCode');
                }, 50);
              }
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

  addNewManualRow() {
    const grid = this.itemsGridRef?.instance;
    if (!grid) return;

    // Ensure array exists
    if (!Array.isArray(this.pendingInvoicelist)) {
      this.pendingInvoicelist = [];
    }

    // Create a new empty row
    const newRow = {
      ledgerCode: '',
      ledgerName: '',
      DESCRIPTION: '',
      AMOUNT: null,
      TAX: null,
      TAX_AMOUNT: null,
    };

    //  Replace array reference (triggers Angular + DevExtreme change detection)
    this.pendingInvoicelist = [...this.pendingInvoicelist, newRow];

    //  Just refresh grid (no rebind)
    grid.refresh();

    //  Focus new row
    setTimeout(() => {
      const lastRowIndex = this.pendingInvoicelist.length - 1;
      grid.editCell(lastRowIndex, 'ledgerCode');
    }, 100);
  }

  onRowRemoved(e: any) {
    setTimeout(() => {
      const grid = e.component;

      // Check actual grid rows after deletion
      if (grid.getVisibleRows().length === 0) {
        const newRow = {
          ledgerCode: '',
          ledgerName: '',
          DESCRIPTION: '',
          STORE_ID: null,
          DEPT_ID: null,
          AMOUNT: '',
          TAX: '',
          TAX_AMOUNT: '',
        };

        this.pendingInvoicelist = [newRow];

        grid.option('dataSource', [...this.pendingInvoicelist]);

        setTimeout(() => {
          grid.editCell(0, 'ledgerCode');
        }, 50);
      }
    }, 50);
  }

  // TS: Add this method in your component
  onGridClick(e: any) {
    // Ignore delete button click
    if (
      e.event?.target?.closest('.dx-link-delete') ||
      e.event?.target?.closest('.dx-command-edit')
    ) {
      return;
    }

    const hasEmptyRow = this.pendingInvoicelist.some(
      (row: any) =>
        !row.ledgerCode &&
        !row.DESCRIPTION &&
        (!row.AMOUNT || row.AMOUNT === 0),
    );

    if (!hasEmptyRow) {
      const newRow = {
        ledgerCode: '',
        ledgerName: '',
        DESCRIPTION: '',
        STORE_ID: null,
        DEPT_ID: null,
        AMOUNT: '',
        TAX: '',
        TAX_AMOUNT: '',
      };

      this.pendingInvoicelist = [...this.pendingInvoicelist, newRow];

      const grid = this.itemsGridRef?.instance;

      setTimeout(() => {
        grid?.editCell(this.pendingInvoicelist.length - 1, 'ledgerCode');
      }, 50);
    }
  }
  getLedgerCodeDropdown() {
    this.dataService.getActiveLedger().subscribe({
      next: (response: any) => {
        this.ledgerList = response?.Data || []; // Fallback to empty array
        this.onReceiptModeChange({ value: this.receiptMode });
      },
      error: (err) => {
        console.error('Ledger API Error:', err); // <== CATCH ERRORS
      },
    });
  }

  // calculateTaxAmount(rowData: any): number {
  //   const amount = Number(rowData.AMOUNT) || 0;
  //   const tax = Number(rowData.TAX) || 0;
  //   return +(amount * tax).toFixed(2); // returns tax amount rounded to 2 decimal places
  // }

  calculateTaxAmount(rowData: any): number {
    const amount = Number(rowData.AMOUNT) || 0;
    const taxPercent = Number(rowData.TAX) || 0;
    const taxAmount = (amount * taxPercent) / 100;
    return +taxAmount.toFixed(2); // round to 2 decimals
  }

  onReceiptModeChange(e: any) {
    this.receiptMode = e.value;

    if (this.receiptMode === 'Cash') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID === this.CashID,
      );
    } else if (this.receiptMode === 'Bank') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) => item.GROUP_ID === this.BankID,
      );
    } else if (this.receiptMode === 'Adjustments') {
      this.filteredLedgerList = this.ledgerList.filter(
        (item: any) =>
          item.GROUP_ID !== this.CashID && item.GROUP_ID !== this.BankID,
      );
    } else {
      this.filteredLedgerList = [...this.ledgerList]; // For 'PDC' or others
    }
  }

  formatDateOnly(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  callInsertAPI(finalPayload: any) {
    this.isSaving = true;
    this.dataService.insertMiscPayment(finalPayload).subscribe(
      (response: any) => {
        this.isSaving = false;

        notify(
          {
            message: 'Payment Saved Successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );

        // DO NOT REMOVE — Needed for auto-setting voucher number
        if (response?.VoucherNo) {
          this.miscFormData.VOUCHER_NO = response.VoucherNo;
        }

        // Close popup
        this.popupClosed.emit();
      },
      (error) => {
        this.isSaving = false;
        notify('Failed to save Credit Note. Please try again.', 'error', 2000);
        console.error('Save error:', error);
      },
    );
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
    this.miscFormData.MISC_DETAIL = this.miscFormData.MISC_DETAIL.filter(
      (row) => row.ledgerCode || row.amount != null || row.taxPercent != null,
    );

    //  Department validation (only when Approve is checked)
    if (this.isApproved && !this.miscFormData.DEPT_ID) {
      notify(
        {
          message: 'Please select department.',
          position: 'top center',
        },
        'error',
      );
      return;
    }
    // 4. Prepare final payload
    const { VAT_REGN, ...miscDataWithoutVat } = this.miscFormData;
    const today = new Date();
    const paymentDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');
    const payload = {
      ...miscDataWithoutVat,
      // TRANS_DATE: this.formatDateOnly(this.miscFormData.TRANS_DATE),
      TRANS_DATE: paymentDate,
      MISC_DETAIL: cleanedList.map((item: any, index: number) => {
        const amount = Number(item.AMOUNT) || 0;
        const tax = Number(item.TAX) || 0;
        // const taxAmount = +(amount * tax).toFixed(2);
        const taxAmount = +((amount * tax) / 100).toFixed(2);

        // Find the HEAD_ID from ledgerList using ledgerCode
        const matchedLedger = this.ledgerList.find(
          (ledger: any) => ledger.HEAD_CODE === item.ledgerCode,
        );

        return {
          SL_NO: index + 1,
          HEAD_ID: matchedLedger?.HEAD_ID || '', //  Use actual HEAD_ID
          REMARKS: item.DESCRIPTION || '',
          AMOUNT: amount,
          VAT_AMOUNT: taxAmount,
          VAT_REGN: this.miscFormData.VAT_REGN || 0,
          VAT_PERCENT: tax,
          DEPT_ID: item.DEPT_ID,
          STORE_ID: item.STORE_ID,
        };
      }),
    };

    // // 5. Submit via API

    if (this.miscFormData.IS_APPROVED) {
      const result = confirm(
        'A new Payment will be created and approved. Do you want to continue?',
        'Confirm Approval',
      );

      result.then((dialogResult) => {
        if (dialogResult) {
          this.ngZone.run(() => {
            this.callInsertAPI(payload);
          });
        }
      });

      return;
    }

    // no approval → save directly
    this.callInsertAPI(payload);
  }

  formatDate(date: any): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    return `${year}-${month}-${day}`; // yyyy-MM-dd
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
        'error',
      );
      return;
    }

    const { DetailList, ...cleanedFormData } = this.miscFormData;
    this.miscFormData.TRANS_DATE = this.formatDate(
      this.miscFormData.TRANS_DATE,
    );
    const payload = {
      ...this.miscFormData,
      MISC_DETAIL: cleanedList.map((item: any, index: number) => {
        const amount = Number(item.AMOUNT) || 0;
        const tax = Number(item.TAX) || 0;
        const taxAmount = +(amount * tax).toFixed(2);

        // Find the HEAD_ID from ledgerList using ledgerCode
        const matchedLedger = this.ledgerList.find(
          (ledger: any) => ledger.HEAD_CODE === item.ledgerCode,
        );

        return {
          SL_NO: index + 1,
          HEAD_ID: matchedLedger?.HEAD_ID || '', // Use actual HEAD_ID
          REMARKS: item.DESCRIPTION || '',
          STORE_ID: item.STORE_ID,
          DEPT_ID: item.DEPT_ID,
          AMOUNT: amount,
          VAT_AMOUNT: taxAmount,
          VAT_REGN: this.miscFormData.VAT_REGN || 0,
          VAT_PERCENT: tax,
        };
      }),
    };

    // 5. Submit via API - Conditional: Approve or Update
    // 5. Submit via API - Conditional: Approve or Update

    let apiCall;

    if (this.status === 'Open' && this.verifyMiscPopupOpened === true) {
      apiCall = this.dataService.verifyMiscPayment(payload);
    } else if (this.status === 'Verify') {
      apiCall = this.dataService.approveMiscPayment(payload);
    } else {
      apiCall = this.dataService.updateMiscPayment(payload);
    }

    let confirmMessage = '';
    let successMessage = '';

    if (this.status === 'Open' && this.verifyMiscPopupOpened === true) {
      confirmMessage =
        'Are you sure you want to verify this Miscellaneous Payment?';

      successMessage = 'Miscellaneous Payment Verified Successfully';
    } else if (this.status === 'Verify') {
      confirmMessage =
        'Are you sure you want to approve this Miscellaneous Payment?';

      successMessage = 'Miscellaneous Payment Approved Successfully';
    } else {
      successMessage = 'Miscellaneous Payment Updated Successfully';
    }

    const executeApi = () => {
      this.isSaving = true;

      apiCall.subscribe({
        next: (response: any) => {
          this.isSaving = false;

          if (response?.flag == 1) {
            notify(
              {
                message: successMessage,
                position: {
                  at: 'top center',
                  my: 'top center',
                },
              },
              'success',
            );

            this.popupClosed.emit();
          } else {
            notify(
              {
                message: response?.Message || 'Operation failed.',
                position: {
                  at: 'top center',
                  my: 'top center',
                },
              },
              'error',
            );
          }
        },

        error: (err) => {
          this.isSaving = false;

          console.error('API Error:', err);

          notify(
            {
              message: 'Something went wrong.',
              position: {
                at: 'top center',
                my: 'top center',
              },
            },
            'error',
          );
        },
      });
    };

    if (this.status === 'Open' && this.verifyMiscPopupOpened === true) {
      confirm(confirmMessage, 'Confirm Verify').then((dialogResult) => {
        if (dialogResult) {
          executeApi();
        }
      });
    } else if (this.status === 'Verify') {
      confirm(confirmMessage, 'Confirm Approval').then((dialogResult) => {
        if (dialogResult) {
          executeApi();
        }
      });
    } else {
      executeApi();
    }
    // if (this.isApproved) {
    //   confirm(
    //     'Are you sure you want to approve this Miscellaneous Payment?',
    //     'Confirm Approval',
    //   ).then((dialogResult) => {
    //     if (dialogResult) {
    //       this.isSaving = true;
    //       // YES -> Call approve API
    //       this.dataService.approveMiscPayment(payload).subscribe({
    //         next: (response: any) => {
    //           this.isSaving = false;
    //           if (response?.flag == 1) {
    //             notify(
    //               {
    //                 message: 'Miscellaneous Payment Approved Successfully',
    //                 position: { at: 'top center', my: 'top center' },
    //               },
    //               'success',
    //             );
    //             this.popupClosed.emit();
    //           } else {
    //             notify(
    //               {
    //                 message: response?.Message || 'Failed to approve.',
    //                 position: { at: 'top center', my: 'top center' },
    //               },
    //               'error',
    //             );
    //           }
    //         },
    //         error: (err) => {
    //           this.isSaving = false;
    //           console.error('Approve Error:', err);
    //           notify(
    //             {
    //               message: 'Something went wrong while approving.',
    //               position: { at: 'top center', my: 'top center' },
    //             },
    //             'error',
    //           );
    //         },
    //       });
    //     }
    //     // If NO -> do nothing
    //   });

    //   return; // Stop here
    // }
    // this.isSaving = true;
    // // NOT APPROVED → normal update API
    // this.dataService.updateMiscPayment(payload).subscribe({
    //   next: (response: any) => {
    //     this.isSaving = false;
    //     if (response?.flag == 1) {
    //       notify(
    //         {
    //           message: 'Miscellaneous Payment Updated Successfully',
    //           position: { at: 'top center', my: 'top center' },
    //         },
    //         'success',
    //       );
    //       this.popupClosed.emit();
    //     } else {
    //       notify(
    //         {
    //           message: response?.Message || 'Failed to update.',
    //           position: { at: 'top center', my: 'top center' },
    //         },
    //         'error',
    //       );
    //     }
    //   },
    //   error: (err) => {
    //     this.isSaving = false;
    //     console.error('Update Error:', err);
    //     notify(
    //       {
    //         message: 'Something went wrong while updating.',
    //         position: { at: 'top center', my: 'top center' },
    //       },
    //       'error',
    //     );
    //   },
    // });
  }

  Department_dropdown() {
    const payload = {
      NAME: 'DEPT',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Department = res;
    });
  }

  store_dropdown() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.Common_Dropdown(payload).subscribe((res: any) => {
      this.Store = res;
    });
  }

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
  declarations: [AddMiscellaneousPaymentComponent],
  exports: [AddMiscellaneousPaymentComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddMiscellaneousPaymentModule {}
