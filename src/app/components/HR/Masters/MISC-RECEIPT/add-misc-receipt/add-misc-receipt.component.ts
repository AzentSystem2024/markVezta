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
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { AddMiscellaneousPaymentModule } from '../../add-miscellaneous-payment/add-miscellaneous-payment.component';
import { ApproveMiscellaneousPaymentModule } from '../../approve-miscellaneous-payment/approve-miscellaneous-payment.component';
import { EditMiscellaneousPaymentModule } from '../../edit-miscellaneous-payment/edit-miscellaneous-payment.component';
import { VerifyMiscellaneousPaymentModule } from '../../verify-miscellaneous-payment/verify-miscellaneous-payment.component';
import { ViewMiscellaneousPaymentModule } from '../../view-miscellaneous-payment/view-miscellaneous-payment.component';
import { ListMiscReceiptComponent } from '../../../../../pages/ACCOUNTS/list-misc-receipt/list-misc-receipt.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-add-misc-receipt',
  templateUrl: './add-misc-receipt.component.html',
  styleUrls: ['./add-misc-receipt.component.scss'],
})
export class AddMiscReceiptComponent {
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Input() canApprove: boolean = false;
  @Input() status: any;
  @Output() popupClosed = new EventEmitter<void>();
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
  @Input() MiscReceiptId: any;
  @Input() verifypopup: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  userId: any;
  companyId: any;
  finId: any;
  miscFormData: any = {
    TRANS_ID: '',
    // VOUCHER_NO: '',
    PARTY_NAME: '',
    TRANS_DATE: new Date(),
    PAY_HEAD_ID: '',
    USER_ID: '',
    FIN_ID: '',
    CHEQUE_NO: '',
    CHEQUE_DATE: '',
    BANK_NAME: '',
    NARRATION: '',
    DEPT_ID: '',
    IS_APPROVED: false,
  };
  ledgerList: any;
  receiptMode: string = 'Cash';
  filteredLedgerList: any;
  pendingInvoicelist: any[] = [
    {
      ledgerCode: '',
      ledgerName: '',
      REMARKS: '',
      AMOUNT: null,
      TAX: null,
      TAX_AMOUNT: null,
    },
  ];
  isApproved: boolean = false;
  voucherNo: any;
  Company_list: any = [];
  selectedstoreId: any;

  pdfSrc: SafeResourceUrl | null = null;
  isPdfPopupVisible: boolean = false;
  isSaving = false;
  logoBase64: string;
  settings: any;
  CashID: any;
  BankID: any;

  constructor(
    private dataService: DataService,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer,
  ) {
    this.Deparment_Drop_down();
  }

  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selectedstoreId = sessionData.Configuration[0].STORE_ID;
  }
  ngOnInit() {
    this.sessionDetails();

    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.userId = userData?.USER_ID;
      this.companyId = userData?.SELECTED_COMPANY?.COMPANY_ID;
      this.finId = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID;

      if (userData.USER_ID) {
        this.miscFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.miscFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
    // this.getVoucherNo();
    if (this.isEditing) {
      this.isEditDataAvailable(); // load edit data
    } else {
      this.getVoucherNo(); // only fetch new number in add mode
    }
    this.getLedgerCodeDropdown();
    const imagePath = 'assets/markLogo.jpg';
    this.convertToBase64(imagePath).then((base64) => {
      this.logoBase64 = base64;
    });
    this.AC_Default();
  }
  private async convertToBase64(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.beneficiaryNameRef.instance.focus();
    }, 500); // allow grid/toolbar to fully render
  }

  AC_Default() {
    const payload = {
      CompanyID: this.companyId,
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

  getVoucherNo() {
    const payload = {
      TRANS_TYPE: 2,
      COMPANY_ID: this.companyId,
    };
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.miscFormData.DOC_NO = response.DOC_NO;
    });
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    const data = this.EditingResponseData;
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
    this.miscFormData.TRANS_DATE = data.TRANS_DATE
      ? new Date(data.TRANS_DATE)
      : new Date();

    // Convert DETAILS into grid-friendly format (only credit entries for display)
    if (Array.isArray(data.DETAILS) && data.DETAILS.length > 0) {
      // Pick only debit entries (DEBIT_AMOUNT > 0)
      this.pendingInvoicelist = data.DETAILS.filter(
        (item) => item.DEBIT_AMOUNT > 0,
      ).map((item) => ({
        ledgerCode: item.LEDGER_CODE, // optional logic if needed
        ledgerName: item.OPP_HEAD_NAME,
        REMARKS: item.REMARKS || '',
        AMOUNT: item.DEBIT_AMOUNT || 0,
      }));
    } else {
      this.pendingInvoicelist = [];
    }

    this.miscFormData.CHEQUE_NO = data.CHEQUE_NO;
    this.miscFormData.CHEQUE_DATE = data.CHEQUE_DATE;
    this.miscFormData.BANK_NAME = data.BANK_NAME;
    this.miscFormData.NARRATION = data.NARRATION;
    this.miscFormData.TRANS_ID = data.TRANS_ID;
    this.miscFormData.PAY_HEAD_ID = data.PAY_HEAD_ID;
    this.miscFormData.DEPT_ID = data.DEPT_ID ? Number(data.DEPT_ID) : null;
  }

  onAddNewRow() {}

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

  private hasEmptyRow(): boolean {
    if (!this.pendingInvoicelist || this.pendingInvoicelist.length === 0)
      return false;

    return this.pendingInvoicelist.some(
      (row) =>
        (!row.ledgerCode || row.ledgerCode === '') &&
        (!row.ledgerName || row.ledgerName === '') &&
        (!row.REMARKS || row.REMARKS === '') &&
        (row.AMOUNT === null || row.AMOUNT === '' || row.AMOUNT === 0),
    );
  }

  onCellClick(e: any) {
    const grid = this.itemsGridRef?.instance;
    if (!grid) return;

    // Ignore delete button click
    if (
      e.event?.target?.closest('.dx-link-delete') ||
      e.column?.command === 'edit'
    ) {
      return;
    }

    if (this.hasEmptyRow()) return;

    const lastRow = this.pendingInvoicelist[this.pendingInvoicelist.length - 1];

    const isEmptyRow =
      lastRow &&
      !lastRow.ledgerCode &&
      !lastRow.ledgerName &&
      !lastRow.REMARKS &&
      (lastRow.AMOUNT === null || lastRow.AMOUNT === '');

    if (!isEmptyRow) {
      const newRow = {
        ledgerCode: '',
        ledgerName: '',
        REMARKS: '',
        AMOUNT: null,
      };

      this.pendingInvoicelist = [...this.pendingInvoicelist, newRow];

      grid.option('dataSource', this.pendingInvoicelist);

      setTimeout(() => {
        grid.editCell(this.pendingInvoicelist.length - 1, 'ledgerCode');
      }, 50);
    }
  }

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'ledgerCode' ||
      e.dataField === 'ledgerName' ||
      e.dataField === 'REMARKS' ||
      e.dataField === 'AMOUNT'
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
              this.itemsGridRef?.instance?.editCell(rowIndex, 'REMARKS');
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
            this.itemsGridRef?.instance?.editCell(rowIndex, 'REMARKS');
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

    if (e.dataField === 'REMARKS') {
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
          event.event.preventDefault();

          const grid = this.itemsGridRef?.instance;
          const rowIndex = e.row.rowIndex;

          // Blur editor to trigger commit
          const editorElement = event.event.target as HTMLElement;
          editorElement.blur();

          grid.saveEditData().then(() => {
            // ✅ Add check here before creating new row
            if (this.hasEmptyRow()) return;

            const newRow = {
              ledgerCode: '',
              ledgerName: '',
              REMARKS: '',
              AMOUNT: null,
            };

            this.pendingInvoicelist.push(newRow);
            grid.option('dataSource', [...this.pendingInvoicelist]);

            const newRowIndex = this.pendingInvoicelist.length - 1;
            setTimeout(() => {
              grid.editCell(newRowIndex, 'ledgerCode');
            }, 100);
          });
        }

        // if (event.event.key === 'Enter') {
        //   event.event.preventDefault();

        //   const grid = this.itemsGridRef?.instance;
        //   const rowIndex = e.row.rowIndex;

        //   // Blur editor to trigger commit
        //   const editorElement = event.event.target as HTMLElement;
        //   editorElement.blur();

        //   // Wait for saveEditData to complete before proceeding
        //   grid.saveEditData().then(() => {
        //     // Now safe to add new row
        //     const newRow = {
        //       ledgerCode: '',
        //       ledgerName: '',
        //       REMARKS: '',
        //       AMOUNT: null,
        //     };

        //     this.pendingInvoicelist.push(newRow);

        //     // Refresh grid datasource
        //     grid.option('dataSource', [...this.pendingInvoicelist]);

        //     // Focus new row ledgerCode cell
        //     const newRowIndex = this.pendingInvoicelist.length - 1;
        //     setTimeout(() => {
        //       grid.editCell(newRowIndex, 'ledgerCode');
        //     }, 100);
        //   });
        // }
      };
    }
  }
  private getValidInvoiceRows() {
    const rows = this.getRowsFromGrid();

    return rows.filter((row) => {
      return row && row.ledgerCode && row.ledgerName && Number(row.AMOUNT) > 0;
    });
  }

  onRowRemoved(e: any) {
    setTimeout(() => {
      const grid = e.component;

      if (grid.getVisibleRows().length === 0) {
        this.pendingInvoicelist = [
          {
            ledgerCode: '',
            ledgerName: '',
            REMARKS: '',
            AMOUNT: null,
          },
        ];

        grid.option('dataSource', this.pendingInvoicelist);

        setTimeout(() => {
          grid.editCell(0, 'ledgerCode');
        }, 50);
      }
    }, 50);
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
  Deparment_Drop_down() {
    this.dataService.Department_Dropdown().subscribe((res: any) => {
      this.Company_list = res;
    });
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

  calculateTaxAmount() {}

  private formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private getRowsFromGrid(): any[] {
    const grid = this.itemsGridRef?.instance;
    if (!grid) return [];

    // This returns ONLY current rows (after delete)
    return grid.getDataSource().items();
  }

  callInsertAPI(finalPayload: any) {
    this.isSaving = true;
    this.dataService.insertMiscReceipt(finalPayload).subscribe(
      (response: any) => {
        this.isSaving = false;

        notify(
          {
            message: 'Miscellaneous Receipt Saved Successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );
        // this.getVoucherNo();
        this.popupClosed.emit();
        // DO NOT REMOVE — Needed for auto-setting voucher number
        // if (response?.VoucherNo) {
        //   this.miscFormData.VOUCHER_NO = response.VoucherNo;
        // }

        // Close popup
      },
      (error) => {
        this.isSaving = false;
        notify('Failed to save Credit Note. Please try again.', 'error', 2000);
        console.error('Save error:', error);
      },
    );
  }

  onSaveMiscReceipt() {
    if (!this.miscFormData?.PAY_HEAD_ID) {
      notify('Please select ledger before saving.', 'warning', 2000);
      return;
    }

    if (
      !this.miscFormData?.PAY_HEAD_ID ||
      !this.miscFormData?.PARTY_NAME ||
      !this.miscFormData?.TRANS_DATE ||
      !this.receiptMode
    ) {
      notify('Please fill all required fields before saving.', 'warning', 2500);
      return;
    }

    if (!this.pendingInvoicelist || this.pendingInvoicelist.length === 0) {
      notify('Please add at least one invoice detail.', 'warning', 2500);
      return;
    }

    if (!this.miscFormData.PARTY_NAME) {
      notify('Please enter Beneficairy name before saving.', 'warning', 2000);
      return;
    }

    // 🔍 Validation for missing ledger info with amount
    const invalidRows = this.pendingInvoicelist.filter(
      (row) => Number(row.AMOUNT) > 0 && (!row.ledgerCode || !row.ledgerName),
    );

    if (invalidRows.length > 0) {
      notify(
        'Please select Ledger Code and Ledger Name for all rows with amount entered',
        'warning',
        2500,
      );
      return;
    }
    if (!this.miscFormData?.PAY_HEAD_ID) {
      notify('Please select ledger before saving.', 'warning', 2000);
      return;
    }
    const PAY_HEAD_ID = this.miscFormData?.PAY_HEAD_ID; // get from your form
    const payTypeMapping: any = {
      Cash: 1,
      Bank: 2,
      PDC: 3,
      Adjustments: 4,
    };

    this.miscFormData.PAY_TYPE_ID = payTypeMapping[this.receiptMode] || null;
    if (this.receiptMode === 'Bank') {
      if (
        !this.miscFormData.CHEQUE_NO ||
        this.miscFormData.CHEQUE_NO.trim() === ''
      ) {
        notify('Please enter Cheque Number', 'warning', 2000);
        return;
      }

      if (!this.miscFormData.CHEQUE_DATE) {
        notify('Please select Cheque Date', 'warning', 2000);
        return;
      }

      if (
        !this.miscFormData.BANK_NAME ||
        this.miscFormData.BANK_NAME.trim() === ''
      ) {
        notify('Please enter Bank Name', 'warning', 2000);
        return;
      }
    }
    // 2. Commit any pending cell edits in grid
    this.itemsGridRef.instance.closeEditCell();
    this.itemsGridRef.instance.saveEditData();

    const validRows = this.getValidInvoiceRows();
    const details: any[] = [];

    validRows.forEach((row) => {
      const selectedLedger = this.ledgerList.find(
        (l) => l.HEAD_CODE === row.ledgerCode,
      );
      if (!selectedLedger) return;

      const expenseHeadId = selectedLedger.HEAD_ID;
      const payHeadId = this.miscFormData.PAY_HEAD_ID;
      const amount = Number(row.AMOUNT) || 0;
      const remarks = row.REMARKS || '';

      // ✅ Debit: Expense / Adjustment ledger
      details.push({
        HEAD_ID: expenseHeadId,
        REMARKS: remarks,
        DEBIT_AMOUNT: amount,
        CREDIT_AMOUNT: 0,
        OPP_HEAD_ID: payHeadId,
      });

      // ✅ Credit: Cash / Bank / Adjustment
      details.push({
        HEAD_ID: payHeadId,
        REMARKS: remarks,
        DEBIT_AMOUNT: 0,
        CREDIT_AMOUNT: amount,
        OPP_HEAD_ID: expenseHeadId,
      });
    });

    const payload = {
      COMPANY_ID: this.companyId,
      FIN_ID: this.finId,
      TRANS_TYPE: 2,
      TRANS_DATE: this.formatDate(this.miscFormData.TRANS_DATE),
      PARTY_NAME: this.miscFormData.PARTY_NAME,
      CHEQUE_NO: this.miscFormData.CHEQUE_NO,
      CHEQUE_DATE: this.miscFormData.CHEQUE_DATE
        ? this.formatDate(this.miscFormData.CHEQUE_DATE)
        : null,
      BANK_NAME: this.miscFormData.BANK_NAME,
      NARRATION: this.miscFormData.NARRATION,
      CREATE_USER_ID: this.userId,
      PAY_TYPE_ID: payTypeMapping[this.receiptMode] || null,
      PAY_HEAD_ID: this.miscFormData.PAY_HEAD_ID,
      DEPT_ID: Number(this.miscFormData.DEPT_ID),
      STORE_ID: this.selectedstoreId,
      IS_APPROVED: this.miscFormData.IS_APPROVED,
      DETAILS: details,
    };

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

    // this.dataService.insertMiscReceipt(payload).subscribe((res: any) => {
    //   if (res.flag === 1) {
    //     notify('Miscellaneous Receipt saved successfully', 'success', 2000);
    //     this.getVoucherNo();
    //     this.popupClosed.emit();
    //   } else {
    //     notify('Failed to save Misc Receipt', 'error', 2000);
    //   }
    // });
  }

  onUpdateMiscReceipt() {
    if (!this.miscFormData.PARTY_NAME) {
      notify('Please enter Beneficairy name before saving.', 'warning', 2000);
      return;
    }

    // 🔍 Validation for missing ledger info with amount
    const invalidRows = this.pendingInvoicelist.filter(
      (row) => Number(row.AMOUNT) > 0 && (!row.ledgerCode || !row.ledgerName),
    );

    if (invalidRows.length > 0) {
      notify(
        'Please select Ledger Code and Ledger Name for all rows with amount entered',
        'warning',
        2500,
      );
      return;
    }
    if (!this.miscFormData?.PAY_HEAD_ID) {
      notify('Please select ledger before saving.', 'warning', 2000);
      return;
    }
    const PAY_HEAD_ID = this.miscFormData?.PAY_HEAD_ID; // get from your form
    const payTypeMapping: any = {
      Cash: 1,
      Bank: 2,
      PDC: 3,
      Adjustments: 4,
    };

    this.miscFormData.PAY_TYPE_ID = payTypeMapping[this.receiptMode] || null;
    if (this.receiptMode === 'Bank') {
      if (
        !this.miscFormData.CHEQUE_NO ||
        this.miscFormData.CHEQUE_NO.trim() === ''
      ) {
        notify('Please enter Cheque Number', 'warning', 2000);
        return;
      }

      if (!this.miscFormData.CHEQUE_DATE) {
        notify('Please select Cheque Date', 'warning', 2000);
        return;
      }

      if (
        !this.miscFormData.BANK_NAME ||
        this.miscFormData.BANK_NAME.trim() === ''
      ) {
        notify('Please enter Bank Name', 'warning', 2000);
        return;
      }
    }
    // 2. Commit any pending cell edits in grid
    this.itemsGridRef.instance.closeEditCell();
    const details: any[] = [];

    this.getValidInvoiceRows().forEach((row) => {
      const selectedLedger = this.ledgerList.find(
        (l: any) => l.HEAD_CODE === row.ledgerCode,
      );
      if (!selectedLedger) return; // skip invalid row

      const headId = selectedLedger.HEAD_ID;
      const amount = Number(row.AMOUNT) || 0;
      const remarks = row.REMARKS || '';

      // Debit entry
      details.push({
        HEAD_ID: this.miscFormData.PAY_HEAD_ID,
        REMARKS: remarks,
        DEBIT_AMOUNT: amount,
        CREDIT_AMOUNT: 0,
        OPP_HEAD_ID: headId,
      });

      // Credit entry
      details.push({
        HEAD_ID: headId,
        REMARKS: remarks,
        DEBIT_AMOUNT: 0,
        CREDIT_AMOUNT: amount,
        OPP_HEAD_ID: this.miscFormData.PAY_HEAD_ID,
      });
    });

    const payload = {
      TRANS_ID: this.miscFormData.TRANS_ID,
      COMPANY_ID: this.companyId,
      FIN_ID: this.finId,
      TRANS_TYPE: 2,
      TRANS_DATE: this.formatDate(this.miscFormData.TRANS_DATE),
      PARTY_NAME: this.miscFormData.PARTY_NAME,
      CHEQUE_NO: this.miscFormData.CHEQUE_NO,
      CHEQUE_DATE: this.miscFormData.CHEQUE_DATE
        ? this.formatDate(this.miscFormData.CHEQUE_DATE)
        : null,
      BANK_NAME: this.miscFormData.BANK_NAME,
      NARRATION: this.miscFormData.NARRATION,
      CREATE_USER_ID: this.userId,
      PAY_TYPE_ID: payTypeMapping[this.receiptMode] || null,
      PAY_HEAD_ID: this.miscFormData.PAY_HEAD_ID,
      DEPT_ID: Number(this.miscFormData.DEPT_ID),
      STORE_ID: this.selectedstoreId,
      DETAILS: details,
    };

    // const apiCall = this.isApproved
    //   ? this.dataService.approveMiscReceipt(payload)
    //   : this.dataService.updateMiscReceipt(payload);

    // const successMsg = this.isApproved
    //   ? 'Miscellaneous Receipt approved successfully'
    //   : 'Miscellaneous Receipt updated successfully';

    // const errorMsg = this.isApproved
    //   ? 'Failed to approve Misc Receipt'
    //   : 'Failed to update Misc Receipt';
    // if (this.isApproved) {
    //   const result = confirm(
    //     'Are you sure you want to approve this Miscellaneous Receipt?',
    //     'Confirm Approval',
    //   );
    //   result.then((dialogResult) => {
    //     if (dialogResult) {
    //       this.isSaving = true;
    //       this.dataService.approveMiscReceipt(payload).subscribe(
    //         (res: any) => {
    //           if (res.flag === 1) {
    //             this.isSaving = false;
    //             notify(successMsg, 'success', 2000);
    //             this.popupClosed.emit();
    //           } else {
    //             notify(errorMsg, 'error', 2000);
    //           }
    //         },
    //         () => {
    //           this.isSaving = false; // ✅ ADD
    //           notify(errorMsg, 'error', 2000);
    //         },
    //       );
    //     }
    //   });
    // } else {
    //   this.isSaving = true;
    //   // ✅ Update directly
    //   this.dataService.updateMiscReceipt(payload).subscribe(
    //     (res: any) => {
    //       if (res.flag === 1) {
    //         this.isSaving = false;
    //         notify(successMsg, 'success', 2000);
    //         this.popupClosed.emit();
    //       } else {
    //         notify(errorMsg, 'error', 2000);
    //       }
    //     },
    //     () => {
    //       this.isSaving = false; // ✅ ADD
    //       notify(errorMsg, 'error', 2000);
    //     },
    //   );
    // }

    console.log(this.status);

    const executeApiCall = (apiCall: any, successMessage: string) => {
      this.isSaving = true;

      apiCall.subscribe({
        next: (res: any) => {
          this.isSaving = false;

          notify(
            {
              message: successMessage,
              position: {
                at: 'top right',
                my: 'top right',
              },
            },
            'success',
            3000,
          );

          this.popupClosed?.emit();
        },

        error: (err: any) => {
          this.isSaving = false;

          console.error('Operation failed', err);

          notify('Operation failed', 'error', 3000);
        },
      });
    };

    if (this.status === 'Open' && this.verifypopup === true) {
      const result = confirm(
        'Are you sure you want to verify this Miscellaneous Payment?',
        'Confirm Verification',
      );

      result.then((dialogResult) => {
        if (dialogResult) {
          this.ngZone.run(() => {
            executeApiCall(
              this.dataService.verifyMiscReceipt(payload),
              'Miscellaneous Receipt verified successfully',
            );
          });
        }
      });
    } else if (this.status === 'Verify') {
      const result = confirm(
        'Are you sure you want to approve this Miscellaneous Payment?',
        'Confirm Approval',
      );

      result.then((dialogResult) => {
        if (dialogResult) {
          this.ngZone.run(() => {
            executeApiCall(
              this.dataService.approveMiscReceipt(payload),
              'Miscellaneous Receipt approved successfully',
            );
          });
        }
      });
    } else {
      executeApiCall(
        this.dataService.updateMiscReceipt(payload),
        'Miscellaneous Receipt updated successfully',
      );
    }

    // apiCall.subscribe((res: any) => {
    //   if (res.flag === 1) {
    //     notify(successMsg, 'success', 2000);
    //     this.popupClosed.emit();
    //   } else {
    //     notify(errorMsg, 'error', 2000);
    //   }
    // });
  }

  Cancel() {
    this.popupClosed.emit();
  }

  viewPdf(): void {
    this.dataService
      .selectMiscReceipt(this.MiscReceiptId)
      .subscribe((response: any) => {
        if (response) {
          this.get_pdf(response);
        }
      });
  }

  get_pdf(response: any): void {
    const data = response.Data;

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    let y = 10;

    // ================= COMPANY (STATIC)
    const company = {
      COMPANY_NAME: 'Mark Traders',
      ADDRESS1: 'Kallai',
      ADDRESS2: 'Kozhikode',
      ADDRESS3: 'Kerala',
      GSTIN: '32AAAA0000A1Z5',
      STATE: 'KERALA',
      STATE_CODE: '32',
      EMAIL: 'anu@gmail.com',
    };

    const party = {
      NAME: data.PARTY_NAME || 'Test Party',
      ADDRESS1: 'Kozhikode',
      ADDRESS2: 'Kozhikode',
      ADDRESS3: 'Kerala',
    };

    // ================= LOGO
    if (this.logoBase64) {
      doc.addImage(this.logoBase64, 'JPEG', 18, 12, 30, 30);
    }

    // ================= TITLE
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('MISC RECEIPT', pageWidth / 2, 32, { align: 'center' });

    // ================= HEADER
    doc.setFontSize(10);
    doc.text(`Voucher No : ${data.TRANS_ID}`, pageWidth - 70, 15);
    doc.text(`Reference No : ${data.DOC_NO}`, pageWidth - 70, 21);

    const date = new Date(data.TRANS_DATE).toLocaleDateString('en-GB');
    doc.text(`Date : ${date}`, pageWidth - 70, 27);

    y = 50;

    // ================= COMPANY BLOCK
    doc.setFillColor(204, 229, 255);
    doc.rect(10, y, 100, 38, 'F');

    doc.setFont('helvetica', 'bold');
    doc.text(company.COMPANY_NAME, 13, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.text(company.ADDRESS1, 13, y + 13);
    doc.text(company.ADDRESS2, 13, y + 18);
    doc.text(company.ADDRESS3, 13, y + 23);
    doc.text(`GSTIN : ${company.GSTIN}`, 13, y + 28);
    doc.text(
      `State : ${company.STATE}, Code : ${company.STATE_CODE}`,
      13,
      y + 33,
    );
    doc.text(`Email : ${company.EMAIL}`, 13, y + 38);

    // ================= CONSIGNEE
    doc.setFont('helvetica', 'bold');
    doc.text('Consignee (Ship to)', 115, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.text(party.NAME, 115, y + 12);
    doc.text(party.ADDRESS1, 115, y + 17);
    doc.text(party.ADDRESS2, 115, y + 22);
    doc.text(party.ADDRESS3, 115, y + 27);

    // ================= BUYER
    doc.setFont('helvetica', 'bold');
    doc.text('Buyer (Bill to)', 115, y + 45);

    doc.setFont('helvetica', 'normal');
    doc.text(party.NAME, 115, y + 52);
    doc.text(party.ADDRESS1, 115, y + 57);
    doc.text(party.ADDRESS2, 115, y + 62);
    doc.text(party.ADDRESS3, 115, y + 67);

    y += 80;

    // ================= TABLE
    const rows = data.DETAILS.map((d: any) => [
      d.SL_NO,
      d.LEDGER_CODE,
      d.LEDGER_NAME,
      d.REMARKS || '',
      Number(d.DEBIT_AMOUNT).toFixed(2),
      Number(d.CREDIT_AMOUNT).toFixed(2),
    ]);

    autoTable(doc, {
      startY: y,
      head: [
        ['Sl', 'Ledger Code', 'Ledger Name', 'Remarks', 'Debit', 'Credit'],
      ],
      body: rows,
      theme: 'grid',
    });

    // ================= FOOTER GST + TOTALS
    let footY = (doc as any).lastAutoTable.finalY + 10;

    const taxable = 20419.2;
    const gstAmount = 3675.46;
    const gstPerc = 18.0;

    doc.setFont('helvetica', 'bold');
    doc.text('GST %', 15, footY);
    doc.text('Taxable Value', 37, footY);
    doc.text('Integrated Tax', 70, footY);
    doc.text('Total Tax Amount', 110, footY);

    footY += 12;

    doc.setFont('helvetica', 'normal');
    doc.text(gstPerc.toFixed(2) + '%', 15, footY);
    doc.text(taxable.toFixed(2), 37, footY);
    doc.text(gstAmount.toFixed(2), 87, footY);
    doc.text(gstAmount.toFixed(2), 110, footY);

    // RIGHT TOTALS
    let rx = pageWidth - 65;
    let ry = footY - 12;

    doc.text('Taxable Value', rx, ry);
    doc.text(': 20419.20', rx + 30, ry);

    ry += 6;
    doc.text('Total Tax', rx, ry);
    doc.text(': 3675.46', rx + 30, ry);

    ry += 6;
    doc.text('Round Off', rx, ry);
    doc.text(': 0.00', rx + 30, ry);

    ry += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Total', rx, ry);
    doc.text(': 24094.66', rx + 30, ry);

    // ================= WORDS
    let wordsY = ry + 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Amount in words :', 15, wordsY);
    doc.setFont('helvetica', 'normal');
    doc.text('INR Twenty Four Thousand Ninety Four Rupees Only', 60, wordsY);

    // ================= OPEN IN NEW TAB
    const url = doc.output('bloburl');
    window.open(url, '_blank');
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
    AddMiscellaneousPaymentModule,
    EditMiscellaneousPaymentModule,
    VerifyMiscellaneousPaymentModule,
    ApproveMiscellaneousPaymentModule,
    ViewMiscellaneousPaymentModule,
  ],
  providers: [],
  declarations: [AddMiscReceiptComponent],
  exports: [AddMiscReceiptComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddMiscReceiptModule {}
