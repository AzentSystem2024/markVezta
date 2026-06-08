import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  NgZone,
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
  DxBoxModule,
  DxDataGridComponent,
  DxValidationGroupComponent,
  DxTextBoxComponent,
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
import { ArticleAddComponent } from '../../ARTICLE/article-add/article-add.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import dxSelectBox from 'devextreme/ui/select_box';
import DevExpress from 'devextreme';
import { Console } from 'console';
import { Router } from '@angular/router';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-add-journal-vouchar',
  templateUrl: './add-journal-vouchar.component.html',
  styleUrls: ['./add-journal-vouchar.component.scss'],
})
export class AddJournalVoucharComponent {
  @ViewChild('invoiceFormGroup') invoiceFormGroup: DxValidationGroupComponent;
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild('refBoxRef') refBoxRef: DxTextBoxComponent;
  @ViewChild('partyNameRef') partyNameRef: DxTextBoxComponent;
  @ViewChild('narrationRefBox') narrationRefBox: DxTextBoxComponent;
  @Input() canApprove: boolean = false;
  // @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  journalVoucherList = [
    {
      billNo: '',
      ledgerCode: '',
      ledgerName: '',
      particulars: '',
      debitAmount: null,
      creditAmount: null,
    },
  ];

  ledgerCodeList: any;
  ledgerList: any;
  journalVoucherFormData: any = {
    TRANS_ID: 0,
    TRANS_DATE: new Date(),
    // VOUCHER_NO: '',
    PARTY_NAME: '',
    TRANS_STATUS: 1,
    REF_NO: '',
    COMPANY_ID: '',
    FIN_ID: '',
    TRANS_TYPE: 4,
    NARRATION: '',
    USER_ID: 1,
    DEPT_ID: '',
    IS_APPROVED: false,
    DETAILS: [],

    // DETAILS: [
    //   {
    //     billNo: '',
    //     ledgerCode: '',
    //     ledgerName: '',
    //     particulars: '',
    //     debitAmount: '',
    //     creditAmount: '',
    //   },
    // ],
  };
  private focusSet = false;
  isNewRowTriggeredByEnter = false;
  netAmountDisplay: number;
  currentUser: any;
  Company_list: any = [];
  selectedCompany: any;
  selectedCompanyId: any;
  selectedFinId: any;
  isSaving = false;
  storeList: any;
  departmentList: any;

  constructor(
    private dataService: DataService,
    private router: Router,
    private zone: NgZone,
  ) {
    this.Deparment_Drop_down();
  }

  ngOnInit(): void {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.journalVoucherFormData.FIN_ID = menuResponse.FINANCIAL_YEARS.FIN_ID;
    this.journalVoucherFormData.COMPANY_ID =
      menuResponse?.Companies[0].COMPANY_ID;
    this.journalVoucherFormData.STORE_ID =
      menuResponse?.Configuration[0].STORE_ID;
    console.log('Company ID:', menuResponse?.Configuration[0].STORE_ID);
    this.selectedCompanyId = menuResponse?.SELECTED_COMPANY?.COMPANY_ID || null;
    console.log('Selected Company ID:', this.selectedCompanyId);
    this.selectedFinId = menuResponse?.FINANCIAL_YEARS?.FIN_ID || null;
    console.log(this.selectedFinId, 'SELECTEDFINIDDDDDDDDDDDDDDDDD');
    const userDataString = localStorage.getItem('userData');
    console.log(userDataString, 'USERDATASTRINGGGGGGGGG');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.selectedCompany = userData?.SELECTED_COMPANY.COMPANY_ID;
      console.log(this.selectedCompany, 'SELECTEDCOMPANY');
      if (this.selectedCompany?.COMPANY_ID) {
        this.journalVoucherFormData.COMPANY_ID =
          this.selectedCompany.COMPANY_ID;
        console.log(
          this.journalVoucherFormData.COMPANY_ID,
          'COMPANYIDDDDDDDDD',
        );
      }
      this.getJournalVoucherNo();
      this.resetJournalVoucherForm();
      this.getLedgerCodeDropdown();
      this.Deparment_Drop_down();
      if (userData.USER_ID) {
        this.journalVoucherFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.journalVoucherFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
    this.journalVoucherFormData.DETAILS = [
      {
        billNo: 1,
        ledgerCode: '',
        ledgerName: '',
        particulars: '',
        debitAmount: '',
        creditAmount: '',
      },
    ];

    this.getStoreData();
    this.getDepartments();
  }

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new row',
    onClick: () => {
      this.zone.run(() => this.addNewManualRow());
    },
    elementAttr: { class: 'add-button' },

    template: () => {
      return `
      <div class="add-btn-content">
        <span class="iconify"
              data-icon="formkit:add"
              data-width="20"
              data-height="20"></span>
        <span class="add-text">Add Row</span>
      </div>
    `;
    },
  };

  getStoreData() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selectedCompany,
    };
    this.dataService.getDropdownData(payload).subscribe((res) => {
      this.storeList = res;
    });
  }

  getDepartments() {
    const payload = {
      NAME: 'DEPT',
      COMPANY_ID: this.selectedCompany,
    };
    this.dataService.getDropdownData(payload).subscribe((res) => {
      this.departmentList = res;
    });
  }

  Deparment_Drop_down() {
    this.dataService.Department_Dropdown().subscribe((res: any) => {
      console.log(
        res,
        '========================department data=========================',
      );

      this.Company_list = res;
    });
  }

  onDeptChanged(e: any) {
    console.log('Selected Dept:', e.value);
    console.log('Form value:', this.journalVoucherFormData.DEPT_ID);
    this.journalVoucherFormData.DEPT_ID = e.value;
  }

  ngAfterViewInit(): void {
    console.log('refBoxRef:', this.refBoxRef);
    console.log('refBoxRef.instance:', this.refBoxRef?.instance);

    setTimeout(() => {
      if (this.refBoxRef?.instance?.focus) {
        console.log('Focusing Reference No field');
        this.refBoxRef.instance.focus();
      } else {
        console.warn('refBoxRef.instance.focus is not available');
      }
    }, 300);
  }

  focusRefField() {
    setTimeout(() => {
      if (this.refBoxRef?.instance?.focus) {
        this.refBoxRef.instance.focus();
      } else {
        console.warn('Reference No. textbox not ready');
      }
    }, 100);
  }

  onRefNoEnter(e: any) {
    if (e.event.key === 'Enter') {
      setTimeout(() => {
        this.partyNameRef?.instance?.focus();
      }, 100);
    }
  }

  onNarrationEnter(e: any) {
    if (e.event.key === 'Enter') {
      // Wait for DOM to stabilize
      setTimeout(() => {
        this.itemsGridRef?.instance?.editCell(0, 'ledgerCode');
      }, 100);
    }
  }

  onPartyNameEnter(e: any) {
    if (e.event.key === 'Enter') {
      setTimeout(() => {
        this.narrationRefBox?.instance?.focus();
      }, 100);
    }
  }

  onRowRemoved(e: any) {
    const details = this.journalVoucherFormData.DETAILS;
    if (details.length === 0) {
      this.onAddRow(); // Auto add a new row
    }
  }

  onAddRow(): void {
    const nextBillNo = this.journalVoucherFormData.DETAILS.length + 1;
    this.journalVoucherFormData.DETAILS.push({
      billNo: nextBillNo,
      ledgerCode: '',
      ledgerName: '',
      particulars: '',
      debitAmount: null,
      creditAmount: null,
    });

    setTimeout(() => {
      const grid = this.itemsGridRef?.instance;
      grid.refresh();

      const rowIndex = this.journalVoucherFormData.DETAILS.length - 1;
      grid.editCell(rowIndex, 'billNo'); // Focus the first field of the new row
    }, 100);
  }

  formatAsDDMMYYYY(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getLedgerCodeDropdown() {
    this.dataService.getActiveLedger().subscribe((response: any) => {
      this.ledgerList = response.Data;
      console.log(response, 'ledgercodelist');
    });
  }

  getLedgerNameByCode(code: string): string {
    const ledger = this.ledgerList.find((l: any) => l.HEAD_CODE === code);
    return ledger ? ledger.HEAD_NAME : '';
  }

  onInitNewRow(e: any) {
    // Prevent multiple unsaved rows
    const hasNewRow = this.journalVoucherFormData.DETAILS.some(
      (row) => !row.ID,
    );
    if (hasNewRow) {
      e.cancel = true;
      alert('You can only add one new row at a time. Please save it first.');
      return;
    }
    const currentDetails = this.journalVoucherFormData.DETAILS || [];
    const nextBillNo = currentDetails.length + 1;

    e.data = {
      billNo: nextBillNo.toString().padStart(3, '0'), // 001, 002, ...
      ledgerCode: '',
      ledgerName: '',
      particulars: '',
      debitAmount: null,
      creditAmount: null,
    };
  }

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'ledgerCode' ||
      e.dataField === 'ledgerName' ||
      e.dataField === 'particulars' ||
      e.dataField === 'debitAmount' ||
      e.dataField === 'creditAmount' ||
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
    // console.log(rowIndex);

    // ➤ SL_NO: Move to ledgerCode on Enter
    if (e.dataField === 'billNo') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;
          const visibleRows = grid.getVisibleRows();

          const rowIndex = visibleRows.findIndex(
            (r) => r?.data === e.row?.data,
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
              this.itemsGridRef?.instance?.editCell(rowIndex, 'STORE_ID');
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
            this.itemsGridRef?.instance?.editCell(rowIndex, 'STORE_ID');
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

    if (e.dataField === 'STORE_ID') {
      let enterPressedOnce = false;

      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          event.event.preventDefault();

          if (!enterPressedOnce) {
            enterPressedOnce = true;

            //  Open dropdown
            setTimeout(() => {
              if (event.component?.open) {
                event.component.open();
              }
            }, 50);
          } else {
            enterPressedOnce = false;

            // Move to DEPT_ID
            const grid = e.component;
            const rowIndex = e.row.rowIndex;

            setTimeout(() => {
              grid.editCell(rowIndex, 'DEPT_ID');
            }, 50);
          }
        }
      };
    }
    if (e.dataField === 'DEPT_ID') {
      let enterPressedOnce = false;

      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          event.event.preventDefault();

          if (!enterPressedOnce) {
            enterPressedOnce = true;

            // ✅ Open dropdown
            setTimeout(() => {
              if (event.component?.open) {
                event.component.open();
              }
            }, 50);
          } else {
            enterPressedOnce = false;

            // ✅ Move to particulars
            const grid = e.component;
            const rowIndex = e.row.rowIndex;

            setTimeout(() => {
              grid.editCell(rowIndex, 'particulars');
            }, 50);
          }
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
            grid.focus(grid.getCellElement(rowIndex, 'debitAmount'));
          });
        }
      };
    }
    if (e.dataField === 'debitAmount') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = e.component;
          const rowIndex = e.row.rowIndex;
          // Move focus to the "ledgerCode" column in the same row
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'creditAmount'));
          });
        }
      };
      e.editorOptions.onValueChanged = (args: any) => {
        if (
          args.value !== null &&
          args.value !== undefined &&
          args.value !== ''
        ) {
          e.component.cellValue(rowIndex, 'creditAmount', 0.0);
        }
        e.setValue(args.value); // keep entered value
      };
    }

    if (e.dataField === 'creditAmount') {
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

            // ✅ Add new row manually
            const newRow = {
              billNo: this.journalVoucherFormData.DETAILS.length + 1,
              ledgerCode: '',
              ledgerName: '',
              particulars: '',
              debitAmount: '',
              creditAmount: '',
            };

            this.journalVoucherFormData.DETAILS.push(newRow);

            // ✅ Remove duplicate empty rows (keep only one empty row)
            const emptyRows = this.journalVoucherFormData.DETAILS.filter(
              (r: any) =>
                !r.billNo &&
                !r.ledgerCode &&
                !r.ledgerName &&
                !r.particulars &&
                (r.debitAmount === '' || r.debitAmount === 0) &&
                (r.creditAmount === '' || r.creditAmount === 0),
            );
            if (emptyRows.length > 1) {
              // remove the last duplicate
              const indexToRemove =
                this.journalVoucherFormData.DETAILS.lastIndexOf(
                  emptyRows[emptyRows.length - 1],
                );
              this.journalVoucherFormData.DETAILS.splice(indexToRemove, 1);
            }

            setTimeout(() => {
              grid.option('dataSource', [
                ...this.journalVoucherFormData.DETAILS,
              ]);

              setTimeout(() => {
                const visibleRows = grid.getVisibleRows();
                const newRowIndex = visibleRows.findIndex(
                  (r) => r.data === newRow,
                );
                if (newRowIndex >= 0) {
                  grid.editCell(newRowIndex, 'ledgerCode');
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

            // setTimeout(() => {
            //   this.narrationRef?.instance?.focus();
            // }, 50);
          }, 50);
        }
      };

      e.editorOptions.onValueChanged = (args: any) => {
        if (
          args.value !== null &&
          args.value !== undefined &&
          args.value !== ''
        ) {
          e.component.cellValue(rowIndex, 'debitAmount', 0.0);
        }
        e.setValue(args.value);
      };
    }
  }

  onGridKeyDown(e: any) {
    // Check if Tab key is pressed and no Shift (so not Shift+Tab)
    if (e.event.key === 'Tab' && !e.event.shiftKey) {
      e.event.preventDefault();

      this.itemsGridRef?.instance?.closeEditCell(); // Close current cell if editing

      setTimeout(() => {
        const saveBtn: HTMLElement | null = document.querySelector('#saveBtn');
        if (saveBtn) {
          saveBtn.focus();
        }
      }, 50);
    }
  }

  addNewManualRow() {
    if (!this.journalVoucherFormData.DETAILS) {
      this.journalVoucherFormData.DETAILS = [];
    }

    // Check for an empty row: only rows with no ledgerCode and ledgerName are empty
    const hasEmptyRow = this.journalVoucherFormData.DETAILS.some(
      (r) => !r.ledgerCode && !r.ledgerName,
    );

    if (hasEmptyRow) {
      // Focus on the first empty row instead of adding a new one
      const grid = this.itemsGridRef?.instance;
      const emptyRowIndex = this.journalVoucherFormData.DETAILS.findIndex(
        (r) => !r.ledgerCode && !r.ledgerName,
      );
      setTimeout(() => {
        grid?.editCell(emptyRowIndex, 'ledgerCode');
      }, 100);
      return;
    }

    // Calculate next Sl No
    const nextSlNo =
      this.journalVoucherFormData.DETAILS.length > 0
        ? Math.max(
            ...this.journalVoucherFormData.DETAILS.map((r) => r.billNo),
          ) + 1
        : 1;

    const newRow = {
      billNo: nextSlNo,
      ledgerCode: '',
      ledgerName: '',
      particulars: '',
      debitAmount: '',
      creditAmount: '',
    };

    // Add new row
    this.journalVoucherFormData.DETAILS = [
      ...this.journalVoucherFormData.DETAILS,
      newRow,
    ];

    setTimeout(() => {
      const grid = this.itemsGridRef?.instance;
      const newRowIndex = this.journalVoucherFormData.DETAILS.length - 1;
      grid?.editCell(newRowIndex, 'ledgerCode');
    }, 100);
  }

  onRowValidating(e: any) {
    const debit =
      e.newData.debitAmount !== undefined
        ? e.newData.debitAmount
        : e.oldData.debitAmount;

    const credit =
      e.newData.creditAmount !== undefined
        ? e.newData.creditAmount
        : e.oldData.creditAmount;

    // 👉 If both are empty/null/zero, allow it (row is just being cleared)
    if ((!debit || debit === 0) && (!credit || credit === 0)) {
      e.isValid = true;
      return;
    }

    // 👉 If both entered
    if (debit && debit > 0 && credit && credit > 0) {
      e.isValid = false;
      e.errorText = 'Only one of Debit or Credit should be entered.';
    } else {
      e.isValid = true;
      delete e.errorText;
    }
  }

  validateDebitOrCredit(e: any) {
    const { debitAmount, creditAmount } = e.data;

    // Allow if one is entered and the other is empty or 0
    const isValid =
      (e.column.dataField === 'debitAmount' &&
        (!creditAmount || creditAmount === 0)) ||
      (e.column.dataField === 'creditAmount' &&
        (!debitAmount || debitAmount === 0));

    return isValid || (!debitAmount && !creditAmount); // allow empty too, or make it stricter if needed
  }

  onRowUpdating(e: any) {
    // This is where you can auto-save to API or update state
    const updatedData = { ...e.oldData, ...e.newData };
    console.log('Auto-saving row:', updatedData);
  }

  onCellValueChanged(e: any) {
    if (!e || !e.data) return;

    // Update ledger name if ledger code is edited
    if (e.column.dataField === 'ledgerCode') {
      const selectedLedger = this.ledgerList.find(
        (item) => item.HEAD_CODE === e.value,
      );
      if (selectedLedger) {
        e.data.ledgerName = selectedLedger.HEAD_NAME;
      }
    }

    // Auto-add new row if current row is last and contains any data
    const rowIndex = e.component.getRowIndexByKey(e.key);
    const lastIndex = this.journalVoucherFormData.DETAILS.length - 1;

    if (rowIndex === lastIndex) {
      const currentRow = this.journalVoucherFormData.DETAILS[rowIndex];

      const hasValue = Object.values(currentRow).some(
        (v) => v !== null && v !== '' && v !== undefined,
      );

      if (hasValue) {
        this.journalVoucherFormData.DETAILS.push({
          billNo: '',
          ledgerCode: '',
          ledgerName: '',
          particulars: '',
          debitAmount: null,
          creditAmount: null,
        });

        // Refresh grid to reflect new row
        e.component.refresh();
      }
    }
  }

  getJournalVoucherNo() {
    const payload = {
      TRANS_TYPE: 4,
      COMPANY_ID: this.selectedCompanyId,
    };
    console.log(this.selectedCompanyId, 'payloadjvdocno');
    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.journalVoucherFormData.DOC_NO = response.DOC_NO;
      console.log('Assigned Journal No:', this.journalVoucherFormData.DOC_NO);
    });
  }

  callInsertJournalVoucherAPI(finalPayload: any) {
    this.isSaving = true;
    this.dataService.insertJournalVoucher(finalPayload).subscribe(
      (response: any) => {
        this.isSaving = false;
        console.log(response, 'SAVED SUCCESSFULLY');

        notify(
          {
            message: 'Journal Voucher Saved Successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );

        // // DO NOT REMOVE — Needed for auto-setting voucher number
        // if (response?.VoucherNo) {
        //   this.journalVoucherFormData.VOUCHER_NO = response.VoucherNo;
        // }

        // Reset form but keep newly assigned voucher number
        this.resetJournalVoucherForm();

        // Close popup
        this.popupClosed.emit();
      },
      (error) => {
        this.isSaving = false;
        notify(
          'Failed to save Journal Voucher. Please try again.',
          'error',
          2000,
        );
        console.error('Save error:', error);
      },
    );
  }

  saveJournalVoucher() {
    // 🔹 Step 0: Load from session/local storage
    // 🔹 Step 0: Load from session/local storage
    const userDataString = localStorage.getItem('userData');
    let companyId = '';
    let finId = '';
    companyId = this.selectedCompanyId;
    finId = this.selectedFinId;
    // if (userDataString) {
    //   const userData = JSON.parse(userDataString);

    //   finId = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID ?? '';
    // }

    // Step -1: Validate Beneficiary Name
    if (
      !this.journalVoucherFormData.PARTY_NAME ||
      this.journalVoucherFormData.PARTY_NAME.trim() === ''
    ) {
      notify('Beneficiary Name is required.', 'error', 3000);

      // 👉 Focus the textbox
      setTimeout(() => {
        this.partyNameRef?.instance?.focus();
      }, 100);

      return;
    }

    // 🔹 Step 1: Filter out completely empty rows (ignore billNo-only rows)
    const cleanedDetails = this.journalVoucherFormData.DETAILS.filter(
      (item) => {
        const hasAnyValue =
          (item.ledgerCode && item.ledgerCode.trim() !== '') ||
          (item.ledgerName && item.ledgerName.trim() !== '') ||
          (item.particulars && item.particulars.trim() !== '') ||
          (item.debitAmount && item.debitAmount != 0) ||
          (item.creditAmount && item.creditAmount != 0);

        return hasAnyValue; // Only include if there’s real content
      },
    );
    cleanedDetails.forEach((item, index) => {
      item.billNo = (index + 1).toString(); // ensure billNo is string
    });

    // 🔹 Step 2: Ensure at least one valid row exists
    if (!cleanedDetails || cleanedDetails.length === 0) {
      notify('Please enter at least one valid entry.', 'error', 3000);
      return;
    }
    //  Validate each row has Debit or Credit
    const hasAmountMissing = cleanedDetails.some(
      (item) =>
        (!item.debitAmount || item.debitAmount == 0) &&
        (!item.creditAmount || item.creditAmount == 0),
    );

    if (hasAmountMissing) {
      notify(
        'Each row must have either Debit or Credit amount.',
        'error',
        3000,
      );
      return;
    }

    //  Prevent both Debit & Credit
    const hasBothAmounts = cleanedDetails.some(
      (item) => item.debitAmount > 0 && item.creditAmount > 0,
    );

    if (hasBothAmounts) {
      notify('A row cannot have both Debit and Credit amount.', 'error', 3000);
      return;
    }

    // 🔹 Step 3: Re-number bill numbers (continuous)
    cleanedDetails.forEach((item, index) => {
      item.billNo = index + 1;
    });

    // 🔹 Step 4: Calculate totals
    const totalDebit = cleanedDetails.reduce(
      (sum, item) => sum + (parseFloat(item.debitAmount) || 0),
      0,
    );
    const totalCredit = cleanedDetails.reduce(
      (sum, item) => sum + (parseFloat(item.creditAmount) || 0),
      0,
    );

    if (totalDebit !== totalCredit) {
      notify('Total Debit and Credit amounts must be equal.', 'error', 3000);
      return;
    }

    // 🔹 Step 5: Validate ledger codes only for rows with amount
    const hasLedgerCodeMissing = cleanedDetails.some(
      (item) =>
        (!item.ledgerCode || item.ledgerCode.trim() === '') &&
        ((item.debitAmount && item.debitAmount != 0) ||
          (item.creditAmount && item.creditAmount != 0)),
    );

    if (hasLedgerCodeMissing) {
      notify(
        'One or more rows with debit/credit amount are missing a ledger code.',
        'error',
        3000,
      );
      return;
    }

    // 🔹 Step 6: Map ledgerCode (HeadCode) → HeadID for payload
    const transformedDetails = cleanedDetails.map((item) => {
      const matchedLedger = this.ledgerList.find(
        (l) => l.HEAD_CODE === item.ledgerCode,
      );

      return {
        BILL_NO: item.billNo.toString(),
        LEDGER_CODE: matchedLedger?.HEAD_ID?.toString() || '',
        LEDGER_NAME: item.ledgerName,
        PARTICULARS: item.particulars,
        DEBIT_AMOUNT: item.debitAmount ? parseFloat(item.debitAmount) : 0.0,
        CREDIT_AMOUNT: item.creditAmount ? parseFloat(item.creditAmount) : 0.0,
        STORE_ID: item.STORE_ID || this.journalVoucherFormData.STORE_ID,
        DEPT_ID: item.DEPT_ID || this.journalVoucherFormData.DEPT_ID,
      };
    });
    const today = new Date();
    const jvDate =
      today.getFullYear() +
      '-' +
      String(today.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(today.getDate()).padStart(2, '0');
    // 🔹 Step 7: Prepare final payload
    const finalPayload = {
      ...this.journalVoucherFormData,
      TRANS_DATE: jvDate,
      COMPANY_ID: companyId,
      FIN_ID: this.journalVoucherFormData.FIN_ID,
      DETAILS: transformedDetails,
    };

    if (this.journalVoucherFormData.IS_APPROVED) {
      const result = confirm(
        'A new Journal Voucher will be created and approved. Do you want to continue?',
        'Confirm Approval',
      );

      result.then((dialogResult) => {
        if (dialogResult) {
          this.callInsertJournalVoucherAPI(finalPayload);
        }
      });

      return;
    }

    // Normal flow (Not Approved)
    this.callInsertJournalVoucherAPI(finalPayload);
  }

  resetJournalVoucherForm() {
    this.journalVoucherFormData = {
      TRANS_ID: 0,
      TRANS_DATE: new Date(),
      DOC_NO: this.getJournalVoucherNo(),
      PARTY_NAME: '',
      REF_NO: '',
      TRANS_TYPE: 4,
      NARRATION: '',
      USER_ID: 1,
      IS_APPROVED: false,
      DETAILS: [
        {
          billNo: 1,
          ledgerCode: '',
          ledgerName: '',
          particulars: '',
          debitAmount: '',
          creditAmount: '',
        },
      ],
    };
  }

  cancel() {
    this.resetJournalVoucherForm();
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
    FormsModule,
    DxNumberBoxModule,
    DxoSummaryModule,
    DxBoxModule,
  ],
  providers: [],
  declarations: [AddJournalVoucharComponent],
  exports: [AddJournalVoucharComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddJournalVoucharModule {}
