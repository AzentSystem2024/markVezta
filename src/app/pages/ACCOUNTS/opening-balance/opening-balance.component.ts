import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
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
import { JournalVoucherListComponent } from '../journal-voucher-list/journal-voucher-list.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';
import jsPDF from 'jspdf';

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

  pdfSrc: SafeResourceUrl | null = null;
  isPdfPopupVisible: boolean = false;

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
    elementAttr: { class: 'toolbar-icon-btn' },
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
  isReadOnlyBalance: boolean;
  addButtonOptions: any;
  isApproveDisabled = true;
  selected_Company_id: any;
  Departments: any = [];
  Stores_List: any = [];
  selected_Financial_Year_id: any;

  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'Opening_Balance_Data';
    this.dataService.exportDataGrid(event, fileName);
  }

  constructor(
    private dataService: DataService,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.openingBalance = [];
    this.addButtonOptions = {
      icon: 'plus',
      type: 'default',
      stylingMode: 'contained',
      hint: 'Add Row',
      elementAttr: { class: 'add-button' },

      onClick: () => this.addNewManualRow(), // ✅ Arrow function preserves `this`
    };

    const userDataString = localStorage.getItem('userData');
    console.log(userDataString, 'USERDATASTRINGGGGGGGGGGG');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      const companyId = selectedCompany?.COMPANY_ID;
      const finId = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID;
      this.selected_Financial_Year_id = finId;
      console.log(
        companyId,
        finId,
        'COMPANYID FINID===========================',
      );

      this.selected_Company_id = companyId;

      if (companyId && finId) {
        const payload = { COMPANY_ID: companyId, FIN_ID: finId };
        this.loadDepartment();
        this.getStoreDropdown();

        if (companyId && finId) {
          this.loadOpeningBalance(companyId, finId);
        }
      }
    }

    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.getLedgerCodeDropdown();
  }

  loadOpeningBalance(companyId: number, finId: number) {
    const payload = { COMPANY_ID: companyId, FIN_ID: finId };

    this.dataService.selectOpeningBalance(payload).subscribe({
      next: (response: any) => {
        const data = Array.isArray(response.Data) ? response.Data : [];

        // 🔒 Approve logic
        this.isApproveDisabled = data.length === 0;

        const hasApproved = data.some((item: any) => item.TRANS_STATUS === 5);
        this.isApproved = hasApproved;
        this.isReadOnly = hasApproved;

        this.transId = data?.[0]?.TRANS_ID || null;

        // 🧩 Transform grid data
        const transformedData = data.map((item: any, index: number) => ({
          SL_NO: index + 1,
          ledgerCode: item.LEDGER_CODE,
          ledgerName: item.LEDGER_NAME,
          debitAmount: item.DEBIT_AMOUNT,
          creditAmount: item.CREDIT_AMOUNT,
          headId: item.HEAD_ID,
          DEPT_ID: item.DEPT_ID,
          STORE_ID: item.STORE_ID,
        }));

        this.openingBalance = transformedData;

        this.itemsGridRef?.instance.option('dataSource', this.openingBalance);
        this.itemsGridRef?.instance.refresh();

        // Focus only if editable
        if (!this.isReadOnly) {
          setTimeout(() => this.focusFirstEditableCell(), 100);
        }
      },
      error: (err) => {
        console.error('Error loading opening balance', err);
      },
    });
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.loadOpeningBalance(this.selected_Company_id, this.selected_Financial_Year_id);

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
      (item: any) => item.name === 'toggleFilterButton',
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
    if (!grid) return;

    // Ensure there is at least one row
    if (this.openingBalance.length === 0) {
      // Add an empty row if none exists
      this.addNewManualRow();
      return;
    }

    // Assign SL_NO automatically
    this.openingBalance.forEach((item, index) => {
      item.SL_NO = index + 1;
    });

    // Refresh the grid **without destroying editors**
    grid.refresh();

    // Focus first editable cell after the grid finishes rendering
    setTimeout(() => {
      grid.editCell(0, 'ledgerCode');
    }, 50); // slight delay ensures DOM is ready
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.focusFirstEditableCell();
    }, 100); // Slight delay to ensure grid is rendered
  }

  getLedgerCodeDropdown() {
    this.dataService.getActiveLedger().subscribe((response: any) => {
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
    const store = e.newData.STORE_ID ?? e.oldData.STORE_ID;

    if (!store) {
      e.isValid = false;
      // e.errorText = 'Branch/Store is required';
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
    // if (this.openingBalance.length === 0 && !this.isReadOnly) {
    //   setTimeout(() => this.itemsGridRef.instance.addRow(), 100);
    // }
  }

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'ledgerCode' ||
      e.dataField === 'ledgerName' ||
      e.dataField === 'debitAmount' ||
      e.dataField === 'creditAmount' ||
      e.dataField === 'headId'
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

    if (e.dataField === 'debitAmount') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = e.component;
          const rowIndex = e.row.rowIndex;
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'creditAmount'));
          });
        }
      };

      e.editorOptions.onValueChanged = (args: any) => {
        const rowIndex = e.row.rowIndex;
        const value = parseFloat(args.value) || 0;

        // Set debitAmount
        e.component.cellValue(rowIndex, 'debitAmount', value);

        // If debit > 0, set creditAmount to 0
        if (value > 0) {
          e.component.cellValue(rowIndex, 'creditAmount', 0);
          this.openingBalance[rowIndex].creditAmount = 0; // update array
        }
      };
    }
    if (e.dataField === 'creditAmount') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          event.event.preventDefault();
          const grid = this.itemsGridRef?.instance;
          const rowIndex = e.row.rowIndex;

          const editorElement = event.event.target as HTMLElement;
          editorElement.blur();

          setTimeout(() => {
            grid?.saveEditData();

            // Check for empty row
            const hasEmptyRow = this.openingBalance.some(
              (r: any) =>
                (!r.ledgerCode || r.ledgerCode === '') &&
                (!r.ledgerName || r.ledgerName === '') &&
                (!r.debitAmount || r.debitAmount === 0) &&
                (!r.creditAmount || r.creditAmount === 0),
            );

            if (hasEmptyRow) {
              notify(
                'Finish the current empty row before adding a new one.',
                'info',
                2000,
              );
              return;
            }

            // Insert new row
            const newRow = {
              ledgerCode: '',
              ledgerName: '',
              debitAmount: 0,
              creditAmount: 0,
              SL_NO: 0, // placeholder
            };
            this.openingBalance.splice(rowIndex + 1, 0, newRow);

            // Recalculate SlNo for all rows
            this.openingBalance.forEach((r: any, i: number) => {
              r.SL_NO = i + 1; // or your numbering logic
            });

            // Refresh grid dataSource
            grid.option('dataSource', [...this.openingBalance]);

            // Focus the ledgerCode of the new row
            setTimeout(() => {
              grid.editCell(rowIndex + 1, 'ledgerCode');
            }, 50);
          }, 50);
        }
      };

      e.editorOptions.onValueChanged = (args: any) => {
        const rowIndex = e.row.rowIndex;
        const value = parseFloat(args.value) || 0;

        // Set creditAmount
        e.component.cellValue(rowIndex, 'creditAmount', value);

        // If credit > 0, set debitAmount to 0
        if (value > 0) {
          e.component.cellValue(rowIndex, 'debitAmount', 0);
          this.openingBalance[rowIndex].debitAmount = 0; // update array
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

  updateSerialNumbers() {
    this.openingBalance.forEach((item: any, index: number) => {
      item.SL_NO = index + 1;
    });
  }

  addNewManualRow() {
    if (this.isReadOnly) {
      notify('Committed opening balance cannot be edited.', 'warning', 3000);
      return;
    }
    const grid = this.itemsGridRef?.instance;
    if (!grid) return;
    const hasEmptyRow = this.openingBalance.some(
      (r: any) =>
        (!r.ledgerCode || r.ledgerCode === '') &&
        (!r.ledgerName || r.ledgerName === '') &&
        (!r.debitAmount || r.debitAmount === 0) &&
        (!r.creditAmount || r.creditAmount === 0),
    );

    if (hasEmptyRow) {
      notify(
        'Finish the current empty row before adding a new one.',
        'warning',
        2000,
      );
      return;
    }
    const nextSlNo = this.openingBalance.length + 1;
    const newRow = {
      SL_NO: this.openingBalance.length + 1,
      ledgerCode: '',
      ledgerName: '',
      debitAmount: 0,
      creditAmount: 0,
      headId: null,
    };

    this.openingBalance = [...this.openingBalance, newRow];

    grid.refresh();
    setTimeout(() => {
      const newRowIndex = this.openingBalance.length - 1;
      grid.editCell(newRowIndex, 'ledgerCode');
    }, 100);
  }

  cancel() { }

  saveOpeningBalance() {
    console.log('SAVE CALLED');

    // ✅ Trigger DevExtreme validation

    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return;

    const userData = JSON.parse(userDataString);
    const selectedCompany = userData?.SELECTED_COMPANY;
    // Step 1: Filter out empty rows (no ledger selected)
    const validRows = this.openingBalance.filter(
      (item: any) => item.ledgerCode || item.ledgerName,
    );

    // Step 2: Validation - prevent rows with both debit and credit
    const hasBothAmounts = validRows.some(
      (item: any) =>
        (item.debitAmount || 0) > 0 && (item.creditAmount || 0) > 0,
    );
    if (hasBothAmounts) {
      alert('Each row must have either Debit or Credit amount, not both.');
      return;
    }

    //  Step 3: Ensure total debit = total credit
    const totalDebit = validRows.reduce(
      (sum: number, item: any) => sum + parseFloat(item.debitAmount || 0),
      0,
    );
    const totalCredit = validRows.reduce(
      (sum: number, item: any) => sum + parseFloat(item.creditAmount || 0),
      0,
    );

    const epsilon = 0.01; // tolerance for rounding
    if (Math.abs(totalDebit - totalCredit) > epsilon) {
      notify(
        `Total Debit (${totalDebit.toFixed(
          2,
        )}) and Total Credit (${totalCredit.toFixed(
          2,
        )}) must be equal before saving.`,
        'warning',
        3000,
      );
      return;
    }

    const payload = {
      COMPANY_ID: selectedCompany?.COMPANY_ID,
      FIN_ID: userData?.FINANCIAL_YEARS?.[0]?.FIN_ID,
      Details: this.openingBalance
        .map((item: any) => {
          const ledger = this.ledgerList.find(
            (l: any) =>
              l.HEAD_CODE === item.ledgerCode ||
              l.HEAD_NAME === item.ledgerName,
          );

          return {
            HEAD_ID: ledger?.HEAD_ID || null, // Ensure it comes from ledgerList
            DR_AMOUNT: item.debitAmount || 0,
            CR_AMOUNT: item.creditAmount || 0,
            DEPT_ID: item.DEPT_ID || 0,
            STORE_ID: item.STORE_ID || 0,
          };
        })
        .filter((detail) => detail.HEAD_ID),
    };
    console.log(payload, '=============payload=============');
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
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          const companyId = userData?.SELECTED_COMPANY?.COMPANY_ID;
          const finId = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID;

          if (companyId && finId) {
            // ✅ Reload fresh data from SELECT API
            this.loadOpeningBalance(companyId, finId);
          }
          this.openingBalance = this.openingBalance.filter(
            (row: any) => row.ledgerCode && row.ledgerName,
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
    const confirmResult = confirm(
      'Are you sure you want to approve this Opening Balance?',
      'Confirm Approval',
    );
    const commitPayload = {
      ...payload,
      TRANS_ID: this.transId,
    };

    confirmResult.then((dialogResult: boolean) => {
      if (dialogResult) {
        // User clicked "Yes"
        console.log(commitPayload, 'COMMITPAYLOADDDDDDDDDDD');
        this.dataService.approveOpeningBalance(commitPayload).subscribe({
          next: (commitRes) => {
            notify('Opening balance committed successfully', 'success', 3000);
            this.itemsGridRef.instance.refresh();
            if (commitRes?.Data?.TRANS_STATUS === 5) {
              this.isReadOnly = true;
              console.log('Form is now read-only');
            }
          },
          error: (commitErr) => {
            console.error('Failed to commit opening balance', commitErr);
          },
        });
      } else {
        // User clicked "No"
        notify('Approval cancelled', 'info', 2000);
      }
    });
  }

  viewPdf(): void {
    this.isPdfPopupVisible = true;
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(userDataString);
    const selectedCompany = userData?.SELECTED_COMPANY;
    const companyId = selectedCompany?.COMPANY_ID;
    const finId = userData?.FINANCIAL_YEARS?.[0]?.FIN_ID;

    const payload = { COMPANY_ID: companyId, FIN_ID: finId };
    this.dataService
      .selectOpeningBalance(payload)
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

  //=================STORE DROP DOWN ======================
  getStoreDropdown() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,

      NAME: 'STORE',
    };
    this.dataService.getDropdownData(payload).subscribe((response: any) => {
      this.Stores_List = response;
    });
  }

  loadDepartment() {
    const payload = {
      NAME: 'DEPARTMENT',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataService.getDropdownData(payload).subscribe((response) => {
      // Filter out "CENTRAL STORE" and populate the Departments array
      this.Departments = response;
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
export class OpeningBalanceModule { }
