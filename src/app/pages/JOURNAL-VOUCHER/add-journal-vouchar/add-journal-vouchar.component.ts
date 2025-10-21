import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
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
    VOUCHER_NO: '',
    PARTY_NAME: '',
    TRANS_STATUS: 1,
    REF_NO: '',
    COMPANY_ID: '',
    FIN_ID: '',
    TRANS_TYPE: 4,
    NARRATION: '',
    USER_ID: 1,
    DEPT_ID:'',
    DETAILS: [
      {
        billNo: '',
        ledgerCode: '',
        ledgerName: '',
        particulars: '',
        debitAmount: '',
        creditAmount: '',
      },
    ],
  };
  private focusSet = false;
  isNewRowTriggeredByEnter = false;
  netAmountDisplay: number;
  currentUser: any;
  Company_list: any=[];
  constructor(private dataService: DataService) {
     this.Deparment_Drop_down()
  }

  ngOnInit(): void {
    this.getJournalVoucherNo();
    this.resetJournalVoucherForm();
    this.getLedgerCodeDropdown();
    this.Deparment_Drop_down()

    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;

      if (selectedCompany?.COMPANY_ID) {
        this.journalVoucherFormData.COMPANY_ID = selectedCompany.COMPANY_ID;
      }

      if (userData.USER_ID) {
        this.journalVoucherFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.journalVoucherFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
  }


  Deparment_Drop_down(){
    this.dataService.Department_Dropdown().subscribe((res:any)=>{
      console.log(res,'========================department data=========================')

      this.Company_list=res
    })
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

  // ngAfterViewInit(): void {
  //   // Wait for the grid and everything else to stabilize
  //   setTimeout(() => {
  //     requestAnimationFrame(() => {
  //       requestAnimationFrame(() => {
  //         if (this.refBoxRef?.instance) {
  //           this.refBoxRef.instance.focus();
  //         }
  //       });
  //     });
  //   }, 500); // Delay long enough for grid rendering to complete
  // }

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

  onRowRemoved(e: any) {
    const details = this.journalVoucherFormData.DETAILS;
    if (details.length === 0) {
      this.onAddRow(); // Auto add a new row
    }
  }

  onAddRow(): void {
    this.journalVoucherFormData.DETAILS.push({
      billNo: '',
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
    this.dataService.getAccountHeadList().subscribe((response: any) => {
      this.ledgerList = response.Data;
      console.log(response, 'ledgercodelist');
    });
  }

  getLedgerNameByCode(code: string): string {
    const ledger = this.ledgerList.find((l: any) => l.HEAD_CODE === code);
    return ledger ? ledger.HEAD_NAME : '';
  }

  // onEditorPreparing(e: any) {
  //   if (e.parentType !== 'dataRow') return;
  //   const rowIndex = e.row?.rowIndex;
  //   console.log(rowIndex);

  //   // ➤ SL_NO: Move to ledgerCode on Enter
  //   if (e.dataField === 'billNo') {
  //     e.editorOptions.onKeyDown = (event: any) => {
  //       if (event.event.key === 'Enter') {
  //         const grid = this.itemsGridRef?.instance;
  //         const visibleRows = grid.getVisibleRows();

  //         const rowIndex = visibleRows.findIndex(
  //           (r) => r?.data === e.row?.data
  //         );
  //         console.log(
  //           'SL_NO → Enter → move to ledgerCode, rowIndex:',
  //           rowIndex
  //         );

  //         setTimeout(() => {
  //           grid.focus(grid.getCellElement(rowIndex, 'ledgerCode'));
  //         }, 50);
  //       }
  //     };
  //   }

  //   // ➤ ledgerCode: open dropdown on Enter, move to ledgerName on second Enter
  //   if (e.dataField === 'ledgerCode') {
  //     let enterPressedOnce = false;

  //     e.editorOptions.onKeyDown = (event: any) => {
  //       if (event.event.key === 'Enter') {
  //         event.event.preventDefault();

  //         if (!enterPressedOnce) {
  //           enterPressedOnce = true;
  //           setTimeout(() => {
  //             if (event.component?.open) {
  //               event.component.open(); // open dropdown
  //             }
  //           }, 50);
  //         } else {
  //           enterPressedOnce = false;
  //           setTimeout(() => {
  //             this.itemsGridRef?.instance?.editCell(rowIndex, 'particulars');
  //           }, 50);
  //         }
  //       }
  //     };

  //     e.editorOptions.onValueChanged = (args: any) => {
  //       const selectedLedger = this.ledgerList.find(
  //         (item: any) => item.HEAD_CODE === args.value
  //       );
  //       e.setValue(args.value);
  //       if (selectedLedger) {
  //         e.component.cellValue(
  //           rowIndex,
  //           'ledgerName',
  //           selectedLedger.HEAD_NAME
  //         );
  //         setTimeout(() => {
  //           this.itemsGridRef?.instance?.editCell(rowIndex, 'particulars');
  //         }, 50);
  //       }
  //     };
  //   }

  //   // ➤ ledgerName: move to particulars on Enter
  //   if (e.dataField === 'ledgerName') {
  //     e.editorOptions.onKeyDown = (event: any) => {
  //       if (event.event.key === 'Enter') {
  //         event.event.preventDefault();
  //         // setTimeout(() => {
  //         //   this.itemsGridRef?.instance?.editCell(rowIndex, 'particulars');
  //         // }, 50);
  //       }
  //     };

  //     e.editorOptions.onValueChanged = (args: any) => {
  //       const selectedLedger = this.ledgerList.find(
  //         (item: any) => item.HEAD_NAME === args.value
  //       );
  //       e.setValue(args.value);
  //       if (selectedLedger) {
  //         e.component.cellValue(
  //           rowIndex,
  //           'ledgerCode',
  //           selectedLedger.HEAD_CODE
  //         );
  //       }
  //     };
  //   }

  //   if (e.dataField === 'particulars') {
  //     e.editorOptions.onKeyDown = (event: any) => {
  //       if (event.event.key === 'Enter') {
  //         const grid = e.component;
  //         const rowIndex = e.row.rowIndex;
  //         // Move focus to the "ledgerCode" column in the same row
  //         setTimeout(() => {
  //           grid.focus(grid.getCellElement(rowIndex, 'debitAmount'));
  //         });
  //       }
  //     };
  //   }
  //   if (e.dataField === 'debitAmount') {
  //     e.editorOptions.onKeyDown = (event: any) => {
  //       if (event.event.key === 'Enter') {
  //         const grid = e.component;
  //         const rowIndex = e.row.rowIndex;
  //         // Move focus to the "ledgerCode" column in the same row
  //         setTimeout(() => {
  //           grid.focus(grid.getCellElement(rowIndex, 'creditAmount'));
  //         });
  //       }
  //     };
  //   }
  //   if (e.dataField === 'creditAmount') {
  //     e.editorOptions.onKeyDown = (event: any) => {
  //       if (event.event.key === 'Enter') {
  //         event.event.preventDefault();

  //         const grid = this.itemsGridRef?.instance;
  //         const rowIndex = e.row.rowIndex;

  //         // ✅ Force the editor to lose focus and commit its value
  //         const editorElement = event.event.target as HTMLElement;
  //         editorElement.blur();

  //         // ✅ Delay to let grid register the committed value
  //         setTimeout(() => {
  //           grid?.saveEditData(); // Now the value is committed
  //           const rows = grid.getVisibleRows().map((r) => r.data);

  //           // ✅ Add new row manually
  //           const newRow = {
  //             billNo: '',
  //             ledgerCode: '',
  //             ledgerName: '',
  //             particulars: '',
  //             debitAmount: '',
  //             creditAmount: '',
  //           };

  //           this.journalVoucherFormData.DETAILS.push(newRow);

  //           setTimeout(() => {
  //             grid.option('dataSource', [
  //               ...this.journalVoucherFormData.DETAILS,
  //             ]);

  //             setTimeout(() => {
  //               const visibleRows = grid.getVisibleRows();
  //               const newRowIndex = visibleRows.findIndex(
  //                 (r) => r.data === newRow
  //               );
  //               if (newRowIndex >= 0) {
  //                 grid.editCell(newRowIndex, 'billNo');
  //               }
  //             }, 50);
  //           }, 50);
  //         }, 50); // Let blur + commit happen
  //       }

  //       if (event.event.key === 'Tab') {
  //         event.event.preventDefault();

  //         const grid = this.itemsGridRef?.instance;
  //         const editorElement = event.event.target as HTMLElement;

  //         // ✅ Force blur to trigger value commit
  //         editorElement.blur();

  //         // ✅ Wait for value commit, then save the row and move to narration
  //         setTimeout(() => {
  //           grid?.saveEditData(); // Save current row edits
  //           const rows = grid.getVisibleRows().map((r) => r.data);

  //           // setTimeout(() => {
  //           //   this.narrationRef?.instance?.focus();
  //           // }, 50);
  //         }, 50);
  //       }
  //     };
  //   }
  // }

  onInitNewRow(e: any) {
    // Check if any new row (unsaved row without primary key) already exists
    const hasNewRow = this.journalVoucherFormData.DETAILS.some(
      (row) => !row.ID
    );
    // 👆 replace `ID` with your unique field name from DB

    if (hasNewRow) {
      e.cancel = true; // cancel adding another row
      alert('You can only add one new row at a time. Please save it first.');
    }
  }

  onEditorPreparing(e: any) {
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
              billNo: '',
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
                (r.creditAmount === '' || r.creditAmount === 0)
            );
            if (emptyRows.length > 1) {
              // remove the last duplicate
              const indexToRemove =
                this.journalVoucherFormData.DETAILS.lastIndexOf(
                  emptyRows[emptyRows.length - 1]
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
                  (r) => r.data === newRow
                );
                if (newRowIndex >= 0) {
                  grid.editCell(newRowIndex, 'billNo');
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

    // if (e.dataField === 'creditAmount') {
    //   e.editorOptions.onKeyDown = (event: any) => {
    //     if (event.event.key === 'Enter') {
    //       event.event.preventDefault();

    //       const grid = this.itemsGridRef?.instance;
    //       const rowIndex = e.row.rowIndex;

    //       // ✅ Force the editor to lose focus and commit its value
    //       const editorElement = event.event.target as HTMLElement;
    //       editorElement.blur();

    //       // ✅ Delay to let grid register the committed value
    //       setTimeout(() => {
    //         grid?.saveEditData(); // Now the value is committed
    //         const rows = grid.getVisibleRows().map((r) => r.data);

    //         // ✅ Add new row manually
    //         const newRow = {
    //           billNo: '',
    //           ledgerCode: '',
    //           ledgerName: '',
    //           particulars: '',
    //           debitAmount: '',
    //           creditAmount: '',
    //         };

    //         this.journalVoucherFormData.DETAILS.push(newRow);

    //         setTimeout(() => {
    //           grid.option('dataSource', [
    //             ...this.journalVoucherFormData.DETAILS,
    //           ]);

    //           setTimeout(() => {
    //             const visibleRows = grid.getVisibleRows();
    //             const newRowIndex = visibleRows.findIndex(
    //               (r) => r.data === newRow
    //             );
    //             if (newRowIndex >= 0) {
    //               grid.editCell(newRowIndex, 'billNo');
    //             }
    //           }, 50);
    //         }, 50);
    //       }, 50); // Let blur + commit happen
    //     }

    //     if (event.event.key === 'Tab') {
    //       event.event.preventDefault();

    //       const grid = this.itemsGridRef?.instance;
    //       const editorElement = event.event.target as HTMLElement;

    //       // ✅ Force blur to trigger value commit
    //       editorElement.blur();

    //       // ✅ Wait for value commit, then save the row and move to narration
    //       setTimeout(() => {
    //         grid?.saveEditData(); // Save current row edits
    //         const rows = grid.getVisibleRows().map((r) => r.data);

    //         // setTimeout(() => {
    //         //   this.narrationRef?.instance?.focus();
    //         // }, 50);
    //       }, 50);
    //     }
    //   };
    //   e.editorOptions.onValueChanged = (args: any) => {
    //     if (
    //       args.value !== null &&
    //       args.value !== undefined &&
    //       args.value !== ''
    //     ) {
    //       e.component.cellValue(rowIndex, 'debitAmount', 0.0);
    //     }
    //     e.setValue(args.value);
    //   };
    // }
  }

  // onRowInserted(e: any) {
  //   if (this.isNewRowTriggeredByEnter) {
  //     const grid = this.itemsGridRef?.instance;

  //     setTimeout(() => {
  //       const rowIndex = grid.getRowIndexByKey(e.key);
  //       if (rowIndex >= 0) {
  //         grid.editCell(rowIndex, 'billNo');
  //       }
  //       this.isNewRowTriggeredByEnter = false;
  //     }, 50);
  //   }
  // }
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
        (item) => item.HEAD_CODE === e.value
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
        (v) => v !== null && v !== '' && v !== undefined
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
    this.dataService.getVoucherNo().subscribe((response: any) => {
      if (response?.VoucherNo) {
        this.journalVoucherFormData.VOUCHER_NO = response.VoucherNo;
        console.log(
          'Assigned Journal No:',
          this.journalVoucherFormData.VOUCHER_NO
        );
      }
    });
  }

  saveJournalVoucher() {
    // 🔹 Step 0: Load from session/local storage
    const userDataString = localStorage.getItem('userData'); // or sessionStorage
    let companyId = '';
    let finId = '';

    if (userDataString) {
      const userData = JSON.parse(userDataString);
      companyId = userData?.SELECTED_COMPANY?.COMPANY_ID ?? '';
      finId = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID ?? '';
    }
    // 1. Filter out completely empty rows
    const cleanedDetails = this.journalVoucherFormData.DETAILS.filter(
      (item) => {
        return Object.values({
          billNo: item.billNo,
          ledgerCode: item.ledgerCode,
          ledgerName: item.ledgerName,
          particulars: item.particulars,
          debitAmount: item.debitAmount,
          creditAmount: item.creditAmount,
        }).some(
          (value) => value !== null && value !== '' && value !== undefined
        );
      }
    );
    if (!cleanedDetails || cleanedDetails.length === 0) {
      notify('Please enter at least one entry.', 'error', 3000);
      return;
    }

    const totalDebit = cleanedDetails.reduce(
      (sum, item) => sum + (parseFloat(item.debitAmount) || 0),
      0
    );
    const totalCredit = cleanedDetails.reduce(
      (sum, item) => sum + (parseFloat(item.creditAmount) || 0),
      0
    );

    if (totalDebit !== totalCredit) {
      notify('Total Debit and Credit amounts must be equal.', 'error', 3000);
      return;
    }
    const hasLedgerCodeMissing = cleanedDetails.some(
      (item) => !item.ledgerCode
    );
    if (hasLedgerCodeMissing) {
      notify('One or more rows are missing a ledger code.', 'error', 3000);
      return;
    }
    const hasNoAmount = cleanedDetails.every(
      (item) =>
        (!item.debitAmount || item.debitAmount == 0) &&
        (!item.creditAmount || item.creditAmount == 0)
    );
    if (hasNoAmount) {
      notify(
        'At least one debit or credit amount must be entered.',
        'error',
        3000
      );
      return;
    }

    // 2. Map ledgerCode (HeadCode) to HeadID for payload
    const transformedDetails = cleanedDetails.map((item) => {
      const matchedLedger = this.ledgerList.find(
        (l) => l.HEAD_CODE === item.ledgerCode
      );

      return {
        BILL_NO: item.billNo,
        LEDGER_CODE: matchedLedger?.HEAD_ID?.toString() || '', // <- send HeadID instead of HeadCode
        LEDGER_NAME: item.ledgerName,
        PARTICULARS: item.particulars,
        DEBIT_AMOUNT: item.debitAmount ? parseFloat(item.debitAmount) : 0.0,
        CREDIT_AMOUNT: item.creditAmount ? parseFloat(item.creditAmount) : 0.0,
      };
    });

    // 3. Prepare final payload
    const finalPayload = {
      ...this.journalVoucherFormData,
      COMPANY_ID: companyId,
      FIN_ID: finId,
      DETAILS: transformedDetails,
    };

    // 4. Save request
    this.dataService
      .insertJournalVoucher(finalPayload)
      .subscribe((response: any) => {
        console.log(response, 'SAVED SUCCESSFULLY');

        notify(
          {
            message: 'Journal Voucher Saved Successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success'
        );

        // 5. Extract Journal No from message string
        if (response?.VoucherNo) {
          this.journalVoucherFormData.VOUCHER_NO = response.VoucherNo;
        }

        // 7. Reset form but keep the new Journal No
        this.resetJournalVoucherForm(true);

        // 8. Close the popup
        this.popupClosed.emit();
      });
  }

  resetJournalVoucherForm(keepJournalNo: boolean = false) {
    const journalNoToKeep = this.journalVoucherFormData.VOUCHER_NO;
    this.journalVoucherFormData = {
      TRANS_ID: 0,
      TRANS_DATE: new Date(),
      VOUCHER_NO: keepJournalNo ? journalNoToKeep : '',
      PARTY_NAME: '',
      REF_NO: '',
      TRANS_TYPE: 4,
      NARRATION: '',
      USER_ID: 1,
      DETAILS: [
        {
          billNo: '',
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
