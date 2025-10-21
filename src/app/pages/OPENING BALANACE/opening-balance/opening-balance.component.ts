import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
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
import { Router } from '@angular/router';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-opening-balance',
  templateUrl: './opening-balance.component.html',
  styleUrls: ['./opening-balance.component.scss'],
})
export class OpeningBalanceComponent {
  @ViewChild('openingBalanceFormGroup')
  openingBalanceFormGroup: DxValidationGroupComponent;
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  dataGrid: DxDataGridComponent;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  ledgerList: any;
  openingBalance: any;
  private firstFocusDone = false;
  isNewRowTriggeredByEnter = false;
  auto: string = 'auto';
  isFilterRowVisible: boolean = false;
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  isApproved: boolean = false;
  isReadOnly: boolean = false;
  transId: any;

  constructor(private dataService: DataService, private router: Router) {}

  // ngOnInit() {
  //   this.openingBalance = [];

  //   const userDataString = localStorage.getItem('userData');
  //   console.log(userDataString, 'USERDATASTRINGGGGGGGGGGG');
  //   if (userDataString) {
  //     const userData = JSON.parse(userDataString);
  //     const selectedCompany = userData?.SELECTED_COMPANY;
  //     const companyId = selectedCompany?.COMPANY_ID;
  //     const finId = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID;
  //     console.log(
  //       companyId,
  //       finId,
  //       'COMPANYID FINID==========================='
  //     );
  //     if (companyId && finId) {
  //       const payload = {
  //         COMPANY_ID: companyId,
  //         FIN_ID: finId,
  //       };
  //       this.dataService.selectOpeningBalance(payload).subscribe({
  //         next: (response: any) => {
  //           console.log(
  //             'Opening Balance Data===================================:',
  //             response.Data
  //           );
  //           this.openingBalance = response.Data;
  //           const hasApproved = response.Data.some(
  //             (item: any) => item.TRANS_STATUS === 5
  //           );
  //           console.log(hasApproved, 'HASAPPROVEDDDDDDDDDDDDDDDDDDDD');
  //           this.isApproved = hasApproved;
  //           this.isReadOnly = hasApproved;
  //           console.log(this.isReadOnly, 'readonlyyyyyyyyyyyyyyyyyyyyyyyyyyy');
  //           this.transId = response.Data?.[0]?.TRANS_ID || null;
  //           if (this.isApproved) {
  //             this.transId = response.Data?.[0]?.TRANS_ID || null;
  //           }
  //           console.log(this.transId, 'OPENINGBALANCEEEEEEEEEEEEEEEEEEE');
  //           const transformedData = response.Data.map((item: any) => ({
  //             ledgerCode: item.LEDGER_CODE,
  //             ledgerName: item.LEDGER_NAME,
  //             debitAmount: item.DEBIT_AMOUNT,
  //             creditAmount: item.CREDIT_AMOUNT,
  //             headId: item.HEAD_ID, // optional if needed elsewhere
  //           }));
  //           this.openingBalance = transformedData;
  //           // Optional: refresh grid if you use one
  //           this.itemsGridRef?.instance.option(
  //             'dataSource',
  //             this.openingBalance
  //           );
  //           this.itemsGridRef?.instance.refresh();
  //         },
  //         error: (error) => {
  //           console.error('Error loading opening balance:', error);
  //         },
  //       });
  //     }
  //   }

  //   const currentUrl = this.router.url;
  //   console.log('Current URL:', currentUrl);
  //   const menuResponse = JSON.parse(
  //     sessionStorage.getItem('savedUserData') || '{}'
  //   );
  //   console.log('Parsed ObjectData:', menuResponse);
  //   const menuGroups = menuResponse.MenuGroups || [];
  //   console.log('MenuGroups:', menuGroups);
  //   const packingRights = menuGroups
  //     .flatMap((group) => group.Menus)
  //     .find((menu) => menu.Path === '/opening-balance');
  //   if (packingRights) {
  //     this.canAdd = packingRights.CanAdd;
  //     this.canEdit = packingRights.CanEdit;
  //     this.canDelete = packingRights.CanDelete;
  //     this.canPrint = packingRights.CanEdit;
  //     this.canView = packingRights.canView;
  //     this.canApprove = packingRights.canApprove;
  //   }

  //   this.getLedgerCodeDropdown();

  //   setTimeout(() => {
  //     this.openingBalance.push({});
  //     this.itemsGridRef.instance.refresh();

  //     // Wait until refresh and DOM updates complete
  //     setTimeout(() => {
  //       this.focusFirstEditableCell();
  //     }, 100); // Slight delay helps stabilize focus
  //   });
  // }

  ngOnInit() {
    this.openingBalance = [];

    const userDataString = localStorage.getItem('userData');
    console.log(userDataString, 'USERDATASTRINGGGGGGGGGGG');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      const companyId = selectedCompany?.COMPANY_ID;
      const finId = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID;
      console.log(
        companyId,
        finId,
        'COMPANYID FINID==========================='
      );

      if (companyId && finId) {
        const payload = { COMPANY_ID: companyId, FIN_ID: finId };

        this.dataService.selectOpeningBalance(payload).subscribe({
          next: (response: any) => {
            console.log('Opening Balance Data:', response.Data);

            // ✅ Normalize Data (null → [])
            const data = Array.isArray(response.Data) ? response.Data : [];

            const hasApproved = data.some(
              (item: any) => item.TRANS_STATUS === 5
            );
            this.isApproved = hasApproved;
            this.isReadOnly = hasApproved;
            this.transId = data?.[0]?.TRANS_ID || null;

            let transformedData = data.map((item: any) => ({
              ledgerCode: item.LEDGER_CODE,
              ledgerName: item.LEDGER_NAME,
              debitAmount: item.DEBIT_AMOUNT,
              creditAmount: item.CREDIT_AMOUNT,
              headId: item.HEAD_ID,
            }));

            if (transformedData.length === 0) {
              // ✅ No data or null case
              this.openingBalance = [];
              this.itemsGridRef?.instance.option(
                'dataSource',
                this.openingBalance
              );

              setTimeout(() => {
                if (!this.isReadOnly) {
                  this.itemsGridRef?.instance.addRow(); // 👈 always add blank row if editable
                }
              }, 200);
            } else {
              // ✅ Has data
              this.openingBalance = transformedData;
              this.itemsGridRef?.instance.option(
                'dataSource',
                this.openingBalance
              );
              this.itemsGridRef?.instance.refresh();
            }

            // Ensure focus on first cell only if editable
            if (!this.isReadOnly) {
              setTimeout(() => this.focusFirstEditableCell(), 100);
            }
          },
          error: (error) => {
            console.error('Error loading opening balance:', error);
          },
        });
      }
    }

    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData:', menuResponse);
    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/opening-balance');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }

    this.getLedgerCodeDropdown();
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
  }

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  onToolbarPreparing(e: any) {
    const toolbarItems = e.toolbarOptions.items;

    // Avoid adding the button more than once
    const alreadyAdded = toolbarItems.some(
      (item: any) => item.name === 'toggleFilterButton'
    );
    if (!alreadyAdded) {
      toolbarItems.splice(toolbarItems.length - 1, 0, {
        widget: 'dxButton',
        name: 'toggleFilterButton', // custom name to avoid duplicates
        location: 'after',
        options: {
          icon: 'filter',
          hint: 'Search Column',
          onClick: () => this.toggleFilters(),
        },
      });
    }
  }

  onGridContentReady(e: any): void {
    if (!this.firstFocusDone && this.openingBalance.length > 0) {
      this.firstFocusDone = true;
      this.itemsGridRef.instance.editCell(0, 'ledgerCode');
    }
  }
  focusFirstEditableCell(): void {
    const grid = this.itemsGridRef?.instance;
    if (grid && this.openingBalance.length > 0) {
      grid.editCell(0, 'ledgerCode');
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.focusFirstEditableCell();
    }, 100); // Slight delay to ensure grid is rendered
  }

  getLedgerCodeDropdown() {
    this.dataService.getAccountHeadList().subscribe((response: any) => {
      this.ledgerList = response.Data;
      console.log(response, 'ledgercodelist');
    });
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
    }
  }

  onRowInserted(e: any) {
    this.openingBalance.push(e.data);
  }

  onRowUpdated(e: any) {
    const index = this.openingBalance.findIndex((item) => item === e.oldData);
    if (index !== -1) {
      this.openingBalance[index] = { ...e.newData };
    }
  }

  onRowRemoved(e: any): void {
    const key = e.key;
    const index = this.openingBalance.findIndex((row) => row === key);
    if (index > -1) {
      this.openingBalance.splice(index, 1);
      this.itemsGridRef.instance.option('dataSource', [...this.openingBalance]);
    }

    // ✅ If grid becomes empty, add a new row automatically
    if (this.openingBalance.length === 0 && !this.isReadOnly) {
      setTimeout(() => this.itemsGridRef.instance.addRow(), 100);
    }
  }

  onEditorPreparing(e: any) {
    if (e.parentType !== 'dataRow') return;
    const rowIndex = e.row?.rowIndex;
    console.log(rowIndex);

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
              this.itemsGridRef?.instance?.editCell(rowIndex, 'debitAmount');
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
            this.itemsGridRef?.instance?.editCell(rowIndex, 'debitAmount');
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
    }
    if (e.dataField === 'creditAmount') {
      e.editorOptions.onKeyDown = (event: any) => {
        const grid = this.itemsGridRef?.instance;

        if (event.event.key === 'Enter') {
          event.event.preventDefault();

          const rowIndex = e.row.rowIndex;

          // Commit the current cell value
          const editorElement = event.event.target as HTMLElement;
          editorElement.blur();

          setTimeout(() => {
            grid?.saveEditData();

            // Create new row
            const newRow = {
              ledgerCode: '',
              ledgerName: '',
              debitAmount: '',
              creditAmount: '',
            };

            // Insert the new row just after current row
            this.openingBalance.splice(rowIndex + 1, 0, newRow);

            // Refresh grid dataSource
            grid.option('dataSource', [...this.openingBalance]);

            setTimeout(() => {
              const newRowIndex = rowIndex + 1;
              grid.editCell(newRowIndex, 'ledgerCode');
            }, 50);
          }, 50);
        }

        if (event.event.key === 'Tab') {
          event.event.preventDefault();
          const editorElement = event.event.target as HTMLElement;
          editorElement.blur();

          setTimeout(() => {
            grid?.saveEditData();
            // Optional: focus next element
          }, 50);
        }
      };
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

  cancel() {}

  saveOpeningBalance() {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return;

    const userData = JSON.parse(userDataString);
    const selectedCompany = userData?.SELECTED_COMPANY;
    // Step 1: Filter out empty rows (no ledger selected)
    const validRows = this.openingBalance.filter(
      (item: any) => item.ledgerCode || item.ledgerName
    );

    // Step 2: Validation - prevent rows with both debit and credit
    const hasBothAmounts = validRows.some(
      (item: any) => (item.debitAmount || 0) > 0 && (item.creditAmount || 0) > 0
    );
    if (hasBothAmounts) {
      alert('Each row must have either Debit or Credit amount, not both.');
      return;
    }
    const payload = {
      COMPANY_ID: selectedCompany?.COMPANY_ID,
      FIN_ID: userData?.FINANCIAL_YEARS?.[0]?.FIN_ID,
      Details: this.openingBalance
        .map((item: any) => {
          const ledger = this.ledgerList.find(
            (l: any) =>
              l.HEAD_CODE === item.ledgerCode || l.HEAD_NAME === item.ledgerName
          );

          return {
            HEAD_ID: ledger?.HEAD_ID || null, // Ensure it comes from ledgerList
            DR_AMOUNT: item.debitAmount || 0,
            CR_AMOUNT: item.creditAmount || 0,
          };
        })
        .filter((detail) => detail.HEAD_ID),
    };

    // Optional validation
    const missingHeadIds = payload.Details.some((detail) => !detail.HEAD_ID);
    if (missingHeadIds) {
      alert('Some rows are missing valid HEAD_IDs.');
      return;
    }
    if (!this.isApproved) {
      this.dataService.insertOpeningBalance(payload).subscribe({
        next: (res) => {
          console.log('Opening balance saved successfully', res);
          notify('Opening balance saved successfully', 'success', 3000);
          this.openingBalance = this.openingBalance.filter(
            (row: any) => row.ledgerCode && row.ledgerName
          );

          // Optionally: force grid refresh
          this.itemsGridRef.instance.refresh();
        },
        error: (err) => {
          console.error('Failed to save opening balance', err);
        },
      });
      return;
    }
    console.log(this.isApproved, 'ISAPPROVEDDDDDDDDDDDDDDDDDDDDDDDDDDD');
    console.log(this.transId, 'transsssssssssssss');
    if (!this.transId) {
      alert('TRANS_ID not found. Cannot commit.');
      return;
    }
    const commitPayload = {
      ...payload,
      TRANS_ID: this.transId, // ✅ add TRANS_ID only here
    };
    console.log(commitPayload, 'COMMITPAYLOADDDDDDDDDDD');
    this.dataService.approveOpeningBalance(commitPayload).subscribe({
      next: (commitRes) => {
        notify('Opening balance committed successfully', 'success', 3000);
        this.itemsGridRef.instance.refresh();
      },
      error: (commitErr) => {
        console.error('Failed to commit opening balance', commitErr);
      },
    });
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
  declarations: [OpeningBalanceComponent],
  exports: [OpeningBalanceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OpeningBalanceModule {}
