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
  DxNumberBoxModule,
  DxBoxModule,
  DxDataGridComponent,
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
import { AddJournalVoucharComponent } from '../add-journal-vouchar/add-journal-vouchar.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-journal-voucher',
  templateUrl: './edit-journal-voucher.component.html',
  styleUrls: ['./edit-journal-voucher.component.scss'],
})
export class EditJournalVoucherComponent {
  @ViewChild('refBoxRef') refBoxRef: DxTextBoxComponent;
  @ViewChild('partyNameRef') partyNameRef: DxTextBoxComponent;
  @ViewChild('narrationRefBox') narrationRefBox: DxTextBoxComponent;
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() isVerifyMode: boolean = false;
  @Input() canApprove: boolean = false;
  @Input() isApproveMode: boolean = false;
  @Input() journalVoucherFormData: any = {
    TRANS_ID: 0,
    TRANS_DATE: new Date(),
    DOC_NO: '',
    PARTY_NAME: '',
    REFERENCE_NO: '',
    TRANS_TYPE_ID: 4,
    NARRATION: '',
    USER_ID: 1,
    DETAILS: [],
  };
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  ledgerList: any;
  ledgerCodeEditorOptions: any = {};
  ledgerNameEditorOptions: any = {};
  isReadOnly = false;
  isNewRowTriggeredByEnter: any;

  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  // canApprove = false;
  canPrint = false;
  Company_list: any = [];
  selectedDeptId: any;

  pdfSrc: SafeResourceUrl | null = null;
  isPdfPopupVisible: boolean = false;
  isSaving = false;
  selectedCompanyId: any;
  storeList: any;
  departmentList: any;

  constructor(
    private dataService: DataService,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    console.log(this.isApproveMode, 'ISVERIFYMODEEEEEEEEEEEEEEE');
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.selectedCompanyId = menuResponse?.SELECTED_COMPANY?.COMPANY_ID || null;
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === '/journal-voucher');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
    this.getDepartments();
    this.getStoreData();
    this.getLedgerCodeDropdown();
    this.Deparment_Drop_down();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['journalVoucherFormData'] &&
      changes['journalVoucherFormData'].currentValue
    ) {
      const incomingData = changes['journalVoucherFormData'].currentValue;
      console.log(incomingData, 'INCOMINGDATAAAAAAAAAAAAAAA');
      this.journalVoucherFormData.DEPT_ID = incomingData.DEPT_ID || null;
      const transformedDetails = (incomingData.DETAILS || []).map(
        (item: any) => {
          const matchedLedger = this.ledgerList.find(
            (l: any) =>
              l.HEAD_CODE === item.LEDGER_CODE ||
              l.HEAD_NAME === item.LEDGER_NAME,
          );

          return {
            billNo: item.BILL_NO ?? '',
            ledgerCode: matchedLedger?.HEAD_CODE ?? item.LEDGER_CODE ?? '',
            ledgerName: matchedLedger?.HEAD_NAME ?? item.LEDGER_NAME ?? '',
            particulars: item.PARTICULARS ?? '',
            debitAmount: item.DEBIT_AMOUNT ?? '',
            creditAmount: item.CREDIT_AMOUNT ?? '',
            DEPT_ID: item.DEPT_ID ?? incomingData.DEPT_ID ?? null,
            STORE_ID: item.STORE_ID ?? null,
          };
        },
      );

      const userDataString = localStorage.getItem('userData');
      let defaultCompanyId = '';
      let defaultUserId = '';
      let defaultFinId = '';

      if (userDataString) {
        const userData = JSON.parse(userDataString);
        defaultCompanyId = userData?.SELECTED_COMPANY?.COMPANY_ID || '';
        defaultUserId = userData?.USER_ID || '';
        defaultFinId = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID || '';
      }

      this.journalVoucherFormData = {
        COMPANY_ID: incomingData.COMPANY_ID ?? defaultCompanyId,
        FIN_ID: incomingData.FIN_ID ?? defaultFinId,
        USER_ID: incomingData.USER_ID ?? defaultUserId,
        ...incomingData,
        DETAILS: transformedDetails,
      };

      this.isReadOnly = !!this.journalVoucherFormData.IS_APPROVED;
      if (this.dataGrid?.instance) {
        this.dataGrid.instance.refresh();
      }
    }
  }

  getStoreData() {
    const payload = {
      NAME: 'STORE',
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDropdownData(payload).subscribe((res) => {
      this.storeList = res;
    });
  }

  getDepartments() {
    const payload = {
      NAME: 'DEPT',
      COMPANY_ID: this.selectedCompanyId,
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
      if (this.journalVoucherFormData?.DEPT_ID) {
        setTimeout(() => {
          this.journalVoucherFormData.DEPT_ID =
            this.journalVoucherFormData.DEPT_ID;
          console.log(
            'Department set after data load:',
            this.journalVoucherFormData.DEPT_ID,
          );
        }, 100);
      }
    });
  }
  onDeptChanged(e: any) {
    console.log('Selected Dept:', e.value);
    console.log('Form value:', this.journalVoucherFormData.DEPT_ID);
    this.journalVoucherFormData.DEPT_ID = e.value;
  }
  ngAfterViewInit(): void {
    // Wait for the grid and everything else to stabilize
    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (this.refBoxRef?.instance) {
            this.refBoxRef.instance.focus();
          }
        });
      });
    }, 500); // Delay long enough for grid rendering to complete
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
        this.itemsGridRef?.instance?.editCell(0, 'billNo');
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

  formatDateToDDMMYYYY(date: any): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  getLedgerCodeDropdown() {
    this.dataService.getActiveLedger().subscribe((response: any) => {
      this.ledgerList = response.Data;

      // Only transform if form data already loaded
      if (this.journalVoucherFormData?.DETAILS?.length) {
        this.journalVoucherFormData.DETAILS =
          this.journalVoucherFormData.DETAILS.map((item: any) => {
            const matchedLedger = this.ledgerList.find(
              (l: any) => l.HEAD_CODE === item.LEDGER_CODE,
            );

            return {
              billNo: item.BILL_NO ?? '',
              ledgerCode: item.LEDGER_CODE ?? '',
              ledgerName:
                item.LEDGER_NAME?.trim() !== ''
                  ? item.LEDGER_NAME
                  : (matchedLedger?.HEAD_NAME ?? ''),
              particulars: item.PARTICULARS ?? '',
              debitAmount: item.DEBIT_AMOUNT ?? '',
              creditAmount: item.CREDIT_AMOUNT ?? '',
              DEPT_ID: item.DEPT_ID || this.journalVoucherFormData.DEPT_ID,
              STORE_ID: item.STORE_ID || this.journalVoucherFormData.STORE_ID,
            };
          });
      }
    });
  }

  onEditorPreparing(e: any) {
    if (
      // e.dataField === 'billNo' ||
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
    console.log(rowIndex);

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

            // ✅ Open dropdown
            setTimeout(() => {
              if (event.component?.open) {
                event.component.open();
              }
            }, 50);
          } else {
            enterPressedOnce = false;

            // ✅ Move to DEPT_ID
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

  onRowInserted(e: any) {
    if (this.isNewRowTriggeredByEnter) {
      const grid = this.itemsGridRef?.instance;

      setTimeout(() => {
        const rowIndex = grid.getRowIndexByKey(e.key);
        if (rowIndex >= 0) {
          grid.editCell(rowIndex, 'billNo');
        }
        this.isNewRowTriggeredByEnter = false;
      }, 50);
    }
  }

  onRowRemoved(e: any) {
    const details = this.journalVoucherFormData.DETAILS;
    if (details.length === 0) {
      this.onAddRow(); // Auto add a new row
    }
  }

  onAddRow(): void {
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
        : e.oldData.debitAmount || 0;
    const credit =
      e.newData.creditAmount !== undefined
        ? e.newData.creditAmount
        : e.oldData.creditAmount || 0;

    if (debit > 0 && credit > 0) {
      e.isValid = false;
      e.errorText = 'Only one of Debit or Credit should be entered.';
    } else {
      e.isValid = true; // ✅ Ensure it can be saved when only one is filled
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

  onApprovedChanged(e: any) {
    console.log('Checkbox value changed:', e.value);
    this.journalVoucherFormData.IS_APPROVED = e.value;
  }

  update() {
    //  Step 1: build transformedDetails once, at the top
    const transformedDetails = (this.journalVoucherFormData.DETAILS || [])
      .filter((item: any) => {
        const hasOtherValues =
          item.ledgerCode ||
          item.ledgerName ||
          item.particulars ||
          (item.debitAmount && item.debitAmount !== 0) ||
          (item.creditAmount && item.creditAmount !== 0);

        // include row only if it has other values besides just billNo
        return hasOtherValues;
      })

      .map((item: any) => {
        const matchedLedger = this.ledgerList.find(
          (l) => l.HEAD_CODE === item.ledgerCode,
        );
        return {
          BILL_NO: String(item.billNo),
          LEDGER_CODE: matchedLedger?.HEAD_ID?.toString() || '',
          LEDGER_NAME: item.ledgerName,
          PARTICULARS: item.particulars,
          DEBIT_AMOUNT: item.debitAmount ? Number(item.debitAmount) : 0,
          CREDIT_AMOUNT: item.creditAmount ? Number(item.creditAmount) : 0,
          DEPT_ID: item.DEPT_ID || this.journalVoucherFormData.DEPT_ID,
          STORE_ID: item.STORE_ID || this.journalVoucherFormData.STORE_ID,
        };
      });

    const debitTotal = transformedDetails.reduce(
      (sum, item) => sum + (item.DEBIT_AMOUNT || 0),
      0,
    );
    const creditTotal = transformedDetails.reduce(
      (sum, item) => sum + (item.CREDIT_AMOUNT || 0),
      0,
    );

    // Step 2: common validation for both approve + update
    if (debitTotal !== creditTotal) {
      notify(
        'Debit and Credit totals must be equal before saving!',
        'error',
        3000,
      );
      return;
    }

    // Step 3: handle APPROVED flow
    if (this.journalVoucherFormData.IS_APPROVED || this.isApproveMode) {
      console.log('approved???????????????????????????????????');

      confirm(
        'It will approve and commit. Are you sure you want to commit?',
        'Confirm Commit',
      ).then((result) => {
        console.log('Confirm dialog result:', result);
        if (result) {
          const payload = {
            TRANS_ID: this.journalVoucherFormData.TRANS_ID,
            IS_APPROVED: true,
            DOC_NO: this.journalVoucherFormData.DOC_NO,
            REF_NO: this.journalVoucherFormData.REF_NO,
            PARTY_NAME: this.journalVoucherFormData.PARTY_NAME,
            TRANS_DATE: this.formatDateToDDMMYYYY(
              this.journalVoucherFormData.TRANS_DATE,
            ),
            DEPT_ID: this.journalVoucherFormData.DEPT_ID,
            TRANS_TYPE: this.journalVoucherFormData.TRANS_TYPE_ID || 4,
            NARRATION: this.journalVoucherFormData.NARRATION,
            USER_ID: this.journalVoucherFormData.USER_ID,
            COMPANY_ID: this.journalVoucherFormData.COMPANY_ID,
            FIN_ID: this.journalVoucherFormData.FIN_ID,
            TRANS_STATUS: 1,
            DETAILS: transformedDetails,
          };
          this.isSaving = true;
          this.dataService.commitJournalVoucher(payload).subscribe(
            (response: any) => {
              this.isSaving = false;
              if (response.flag === 1) {
                notify(
                  'Journal voucher approved successfully!',
                  'success',
                  3000,
                );
                this.popupClosed.emit();
              } else {
                notify(`Approval failed: ${response.Message}`, 'error', 4000);
              }
            },
            (error) => {
              this.isSaving = false;
              console.error('Approval error:', error);
              alert('Something went wrong while approving');
            },
          );
        } else {
          notify('Approval cancelled.', 'info', 2000);
        }
      });

      return;
    }

    // ✅ Step 4: normal UPDATE flow
    if (this.isVerifyMode === true) {
      this.journalVoucherFormData.IS_VERIFIED = true;
    } else {
      this.journalVoucherFormData.IS_VERIFIED = false;
    }
    const payload = {
      TRANS_ID: this.journalVoucherFormData.TRANS_ID,
      DOC_NO: this.journalVoucherFormData.DOC_NO,
      REF_NO: this.journalVoucherFormData.REF_NO,
      PARTY_NAME: this.journalVoucherFormData.PARTY_NAME,
      TRANS_DATE: this.formatDateToDDMMYYYY(
        this.journalVoucherFormData.TRANS_DATE,
      ),
      TRANS_TYPE: this.journalVoucherFormData.TRANS_TYPE_ID || 4,
      NARRATION: this.journalVoucherFormData.NARRATION,
      USER_ID: this.journalVoucherFormData.USER_ID,
      COMPANY_ID: this.journalVoucherFormData.COMPANY_ID,
      FIN_ID: this.journalVoucherFormData.FIN_ID,
      DEPT_ID: this.journalVoucherFormData.DEPT_ID,
      TRANS_STATUS: 1,
      DETAILS: transformedDetails,
      IS_APPROVED: false,
      IS_VERIFIED: this.journalVoucherFormData.IS_VERIFIED,
    };
    this.isSaving = true;
    if (this.isVerifyMode === true) {
      const result = confirm(
        'Are you sure you want to verify this Journal Voucher?',
        'Confirm Verification',
      );

      result.then((dialogResult: boolean) => {
        if (dialogResult) {
          this.updateJournalVoucher(payload);
        }
      });
    } else {
      this.updateJournalVoucher(payload);
    }
    // this.dataService.updateJournalVoucher(payload).subscribe(
    //   (response: any) => {
    //     this.isSaving = false;
    //     if (response.flag === 1) {
    //       notify('Journal voucher updated successfully!', 'success', 3000);
    //       this.popupClosed.emit();
    //     } else {
    //       notify(`Update failed: ${response.Message}`, 'error', 4000);
    //     }
    //   },
    //   (error) => {
    //     this.isSaving = false;
    //     console.error('Update error:', error);
    //     alert('Something went wrong while updating');
    //   },
    // );
  }

  updateJournalVoucher(payload: any) {
    this.isSaving = true;

    this.dataService.updateJournalVoucher(payload).subscribe(
      (response: any) => {
        this.isSaving = false;

        if (response.flag === 1) {
          notify(
            this.isVerifyMode
              ? 'Journal voucher verified successfully!'
              : 'Journal voucher updated successfully!',
            'success',
            3000,
          );

          this.popupClosed.emit();
        } else {
          notify(`Update failed: ${response.Message}`, 'error', 4000);
        }
      },
      (error) => {
        this.isSaving = false;

        console.error('Update error:', error);

        alert('Something went wrong while updating');
      },
    );
  }

  cancel() {
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
  declarations: [EditJournalVoucherComponent],
  exports: [EditJournalVoucherComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditJournalVoucherModule {}
