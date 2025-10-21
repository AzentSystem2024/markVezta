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
import { ListMiscReceiptComponent } from '../list-misc-receipt/list-misc-receipt.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-add-misc-receipt',
  templateUrl: './add-misc-receipt.component.html',
  styleUrls: ['./add-misc-receipt.component.scss'],
})
export class AddMiscReceiptComponent {
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
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
    VOUCHER_NO: '',
    PARTY_NAME: '',
    TRANS_DATE: new Date(),
    PAY_HEAD_ID: '',
    USER_ID: '',
    FIN_ID: '',
    CHEQUE_NO: '',
    CHEQUE_DATE: '',
    BANK_NAME: '',
    NARRATION: '',
    DEPT_ID:'',
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
  Company_list: any=[];

  constructor(private dataService: DataService) {
    this.Deparment_Drop_down()
  }

  ngOnInit() {
    this.getVoucherNo()
    console.log('EditingResponseData on init:', this.EditingResponseData);
    this.isEditDataAvailable();
    this.getLedgerCodeDropdown();
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
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.beneficiaryNameRef.instance.focus();
    }, 500); // allow grid/toolbar to fully render
  }

  getVoucherNo(){
    this.dataService.getVoucherNoForMiscReceipt().subscribe((response: any) => {
      this.voucherNo = response.VOUCHER_NO
    })
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    const data = this.EditingResponseData;
  const payTypeReverseMapping: any = {
    1: 'Cash',
    2: 'Bank',
    3: 'PDC',
    4: 'Adjustments'
  };
  this.receiptMode = payTypeReverseMapping[data.PAY_TYPE_ID] || 'Cash';
    // Map form fields
    this.miscFormData.PARTY_NAME = data.PARTY_NAME || '';
    this.miscFormData.VOUCHER_NO = data.VOUCHER_NO || '';
    this.miscFormData.TRANS_DATE = data.TRANS_DATE
      ? new Date(data.TRANS_DATE)
      : new Date();

    // Convert DETAILS into grid-friendly format (only credit entries for display)
    if (Array.isArray(data.DETAILS) && data.DETAILS.length > 0) {
      // Pick only debit entries (DEBIT_AMOUNT > 0)
      this.pendingInvoicelist = data.DETAILS.filter(
        (item) => item.DEBIT_AMOUNT > 0
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
              this.itemsGridRef?.instance?.editCell(rowIndex, 'REMARKS');
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

          // Wait for saveEditData to complete before proceeding
          grid.saveEditData().then(() => {
            // Now safe to add new row
            const newRow = {
              ledgerCode: '',
              ledgerName: '',
              REMARKS: '',
              AMOUNT: null,
            };

            this.pendingInvoicelist.push(newRow);

            // Refresh grid datasource
            grid.option('dataSource', [...this.pendingInvoicelist]);

            // Focus new row ledgerCode cell
            const newRowIndex = this.pendingInvoicelist.length - 1;
            setTimeout(() => {
              grid.editCell(newRowIndex, 'ledgerCode');
            }, 100);
          });
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
        REMARKS: '',
        AMOUNT: '',
      };
      this.pendingInvoicelist.push(newRow);

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
        console.log('API Response:', response); // <== LOG FULL RESPONSE
        this.ledgerList = response?.Data || []; // Fallback to empty array
        this.onReceiptModeChange({ value: this.receiptMode });
      },
      error: (err) => {
        console.error('Ledger API Error:', err); // <== CATCH ERRORS
      },
    });
  }
    Deparment_Drop_down(){
    this.dataService.Department_Dropdown().subscribe((res:any)=>{
      console.log(res,'========================department data=========================')

      this.Company_list=res
    })
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

  calculateTaxAmount() {}

  private formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onSaveMiscReceipt() {
    const PAY_HEAD_ID = this.miscFormData?.PAY_HEAD_ID; // get from your form
    const payTypeMapping: any = {
      Cash: 1,
      Bank: 2,
      PDC: 3,
      Adjustments: 4,
    };

    this.miscFormData.PAY_TYPE_ID = payTypeMapping[this.receiptMode] || null;
    // 2. Commit any pending cell edits in grid
    this.itemsGridRef.instance.closeEditCell();
    const details: any[] = [];

    this.pendingInvoicelist.forEach((row) => {
      const selectedLedger = this.ledgerList.find(
        (l) => l.HEAD_CODE === row.ledgerCode
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
      DEPT_ID : Number(this.miscFormData.DEPT_ID),
      DETAILS: details,
    };

    console.log('Save Payload:', payload);

    this.dataService.insertMiscReceipt(payload).subscribe((res: any) => {
      if (res.flag === 1) {
        notify('Miscellaneous Receipt saved successfully', 'success', 2000);
        this.popupClosed.emit();
      } else {
        notify('Failed to save Misc Receipt', 'error', 2000);
      }
    });
  }

  onUpdateMiscReceipt() {
    const PAY_HEAD_ID = this.miscFormData?.PAY_HEAD_ID; // get from your form
    const payTypeMapping: any = {
      Cash: 1,
      Bank: 2,
      PDC: 3,
      Adjustments: 4,
    };

    this.miscFormData.PAY_TYPE_ID = payTypeMapping[this.receiptMode] || null;
    // 2. Commit any pending cell edits in grid
    this.itemsGridRef.instance.closeEditCell();
    const details: any[] = [];

    this.pendingInvoicelist.forEach((row) => {
      const selectedLedger = this.ledgerList.find(
        (l) => l.HEAD_CODE === row.ledgerCode
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
      DEPT_ID : Number(this.miscFormData.DEPT_ID),
      DETAILS: details,
    };

    console.log('Save Payload:', payload);

  const apiCall = this.isApproved
    ? this.dataService.approveMiscReceipt(payload)
    : this.dataService.updateMiscReceipt(payload);

  const successMsg = this.isApproved
    ? 'Miscellaneous Receipt approved successfully'
    : 'Miscellaneous Receipt updated successfully';

  const errorMsg = this.isApproved
    ? 'Failed to approve Misc Receipt'
    : 'Failed to update Misc Receipt';

  apiCall.subscribe((res: any) => {
    if (res.flag === 1) {
      notify(successMsg, 'success', 2000);
      this.popupClosed.emit();
    } else {
      notify(errorMsg, 'error', 2000);
    }
  });
  }
  Cancel(){
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
