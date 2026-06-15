import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
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
  DxSelectBoxComponent,
  DxTextBoxComponent,
  DxNumberBoxComponent,
  DxDataGridComponent,
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
import { DataService } from 'src/app/services';
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddCreditNoteComponent } from '../../CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-add-debit',
  templateUrl: './add-debit.component.html',
  styleUrls: ['./add-debit.component.scss'],
})
export class AddDebitComponent {
  @ViewChild('companyRef', { static: false }) companyRef!: DxSelectBoxComponent;
  @ViewChild('invoiceBoxRef', { static: false })
  invoiceBoxRef!: DxTextBoxComponent;
  @ViewChild('companySelectBoxRef', { static: false })
  companySelectBoxRef!: DxSelectBoxComponent;
  @ViewChild('dueAmountRef', { static: false })
  dueAmountRef!: DxNumberBoxComponent;
  @ViewChild('narrationRef', { static: false })
  narrationRef!: DxTextBoxComponent;
  @ViewChild('saveButtonRef', { static: false }) saveButtonRef!: any;
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() canApprove: boolean = false;
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
  noteDetails: any;
  ledgerList: any;
  companyList: any;
  sessionData: any;
  selected_vat_id: any;
  dropdownJustOpened = false;

  showCGST: boolean = false;
  showGST: boolean = false;
  showSGST: boolean = false;

  debitFormData: any = {
    TRANS_TYPE: 36,
    COMPANY_ID: 0,
    STORE_ID: 0,
    TRANS_DATE: new Date(),
    TRANS_STATUS: 1,
    SUPP_ID: 0,
    NARRATION: '',
    INVOICE_ID: 0,
    INVOICE_NO: '',
    UNIT_ID: '',
    IS_APPROVED: false,
    VEHICLE_NO: '',
    ROUND_OFF: false,
    SUB_TYPE_ID: 0,
    NOTE_DETAIL: [
      {
        SL_NO: '',
        HEAD_ID: '',
        AMOUNT: '',
        GST_AMOUNT: '',
        GST_PERC: '',
        GST_ID: 0,
        REMARKS: '',
        CGST: 0,
        SGST: 0,
      },
    ],
  };
  docNo: any;
  selectedCompanyId: any;
  netAmountDisplay: any;
  supplierList: any;
  selectedSupplierId: any;
  invoicePopupVisible: boolean = false;
  pendingInvoices: any;
  pendingInvoicelist: any;
  selectedSupplier: any;
  selectedstoreId: any;
  net: string;
  HSN_CODE: any;
  GST_PERC: any;
  netAmount: string;
  selectedCompany: any;
  companyState: any;
  GST: any;
  distributorList: any;
  grandTotal: number;
  netTotal: number;
  companyStateID: any;
  selectedInvoiceGST: number;
  selectedInvoiceHSN: any;

  isSaving = false;
  subType: boolean = false;
  subTypeList: any;
  selectedSubTypeId: any;
  vatTitle: any;
  showSubType: boolean = false;
  VatClass: any;

  get actionButtonText(): string {
    switch (this.mode) {
      case 'verify':
        return 'Verify';
      case 'approve':
        return 'Approve';
      case 'view':
        return 'View';
      case 'edit':
        return 'Update';
      default:
        return 'Save';
    }
  }

  constructor(private dataService: DataService) {
    this.sessionData_tax();
  }

  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selectedstoreId = sessionData.Configuration[0].STORE_ID;

    this.HSN_CODE = sessionData.GeneralSettings.HSN_CODE;

    this.GST_PERC = sessionData.GeneralSettings.GST_PERC;
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;

    this.selectedCompany = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.companyState = this.sessionData.SELECTED_COMPANY.STATE_NAME;
    this.GST = this.sessionData.GeneralSettings.GST_PERC;
  }

  ngOnInit() {
    this.sessionDetails();
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.vatTitle = userData.GeneralSettings.VAT_TITLE;
    this.subType = userData.Configuration[0].SUB_TYPE_ID;
    this.showSubType = !!this.subType;
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;

      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
        this.companyList = [selectedCompany]; //  Show only selected company
      }

      if (userData.USER_ID) {
        this.debitFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.debitFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
    // this.debitFormData.TRANS_DATE = this.formatAsDDMMYYYY(new Date());
    this.debitFormData.TRANS_DATE = new Date();
    this.getSupTypeList();
    if (!this.showSubType) {
      this.selectedSubTypeId = 0; // important
      this.getDocNo();
    }
    this.getVatPercentList();
    // this.getDocNo();
    this.getLedgerCodeDropdown();
    this.getCompanyListDropdown();
    // this.getSupplierDropdown();
    this.getSupplierOrUnitLst();
    this.sessionData_tax();
    this.getPendingInvoices();
    this.debitFormData.NOTE_DETAIL = [
      {
        SL_NO: 1,
        ledgerCode: '',
        ledgerName: '',
        particulars: '',
        Amount: '',
        GST_PERC: null,
        GST_ID: null,
        gstAmount: '',
      },
    ];
  }

  ngAfterViewInit(): void {
    // Wait for the grid and everything else to stabilize
    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (this.invoiceBoxRef?.instance) {
            this.invoiceBoxRef.instance.focus();
          }
        });
      });
    }, 500); // Delay long enough for grid rendering to complete
  }
  getVatPercentList() {
    console.log('VATPERCENTAGEEEEEEEEEEEEEEEE');
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
      NAME: 'VAT_PERC',
    };

    this.dataService.getDropdownData(payload).subscribe((data) => {
      this.VatClass = data.map((item: any) => ({
        ...item,
        VALUE: Number(item.DESCRIPTION).toString(),
      }));
    });
  }
  formatAsDDMMYYYY(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  preventDateChange(e: any) {
    // Revert to original value to prevent change
    e.component.option('value', this.debitFormData.TRANS_DATE);
  }

  getSupTypeList() {
    this.dataService
      .getSubTypeCreditNote({ TRANS_TYPE: 36 })
      .subscribe((response: any) => {
        this.subTypeList = response.Data;

        if (this.subTypeList?.length) {
          const first = this.subTypeList[0];

          this.debitFormData.SUB_TYPE_ID = first.SUB_TYPE_ID;
          this.selectedSubTypeId = first.SUB_TYPE_ID;

          this.getDocNo(); // auto load doc no
        }
      });
  }

  onSubTypeChange(e: any) {
    this.selectedSubTypeId = e.value;
    this.debitFormData.SUB_TYPE_ID = e.value;

    this.getDocNo();
  }

  getCompanyListDropdown() {
    // this.dataService.getDropdownData('COMPANY_LIST').subscribe((response: any) => {
    //   this.companyList = response
    // })
  }

  getSupplierDropdown() {
    this.dataService.getDropdownData('SUPPLIER').subscribe((response: any) => {
      this.supplierList = response;
    });
  }

  getSupplierOrUnitLst() {
    const payload = {
      COMPANY_ID: this.selectedCompany,
    };
    this.dataService
      .getSupplierWithState(payload)
      .subscribe((response: any) => {
        this.distributorList = response;
      });
  }

  onSupplierChanged(event: any) {
    this.selectedSupplierId = event.value;

    const selectedSupplier = this.distributorList.find(
      (supplier: any) => supplier.ID === this.selectedSupplierId,
    );

    if (!selectedSupplier) return;

    this.selectedSupplier = selectedSupplier;

    // 🔹 States
    const companyState = this.companyState?.trim().toLowerCase();
    const supplierState = selectedSupplier.STATE_NAME?.trim().toLowerCase();

    const isSameState = companyState === supplierState;

    // 🔹 ONLY CONTROL VISIBILITY HERE
    this.showCGST = isSameState;
    this.showSGST = isSameState;
    this.showGST = !isSameState;

    // 🔹 Set supplier details
    this.debitFormData.SUPP_ID = this.selectedSupplierId;
    this.debitFormData.PARTY_NAME = selectedSupplier.DESCRIPTION;

    // 🔹 Re-apply GST ONLY if invoice already selected
    if (this.selectedInvoiceGST) {
      // this.applyInvoiceGSTToRows();
    }

    // 🔹 Reload pending invoices
    this.getPendingInvoices();
  }

  selectInvoice(e: any) {
    const selected = e.data;

    this.debitFormData.INVOICE_NO = selected.INVOICE_NO;
    this.debitFormData.DUE_AMOUNT = selected.PENDING_AMOUNT;
    this.debitFormData.INVOICE_ID = selected.BILL_ID;

    // ✅ STORE GST & HSN FROM INVOICE
    this.selectedInvoiceGST = Number(selected.GST_PERC) || 0;
    this.selectedInvoiceHSN = selected.HSN_CODE || '';

    // ✅ APPLY TAX MODE BASED ON STATE
    // this.applyInvoiceGSTToRows();

    this.invoicePopupVisible = false;
  }
  applyInvoiceGSTToRows() {
    const companyState = this.companyState?.trim().toLowerCase();
    const supplierState =
      this.selectedSupplier?.STATE_NAME?.trim().toLowerCase();

    const isSameState = companyState === supplierState;

    this.debitFormData.NOTE_DETAIL.forEach((row: any) => {
      // ✅ Set HSN from invoice
      row.HSN_CODE = this.selectedInvoiceHSN;
      row.GST_PERC = this.selectedInvoiceGST;
      row.GST_PERC = this.selectedInvoiceGST;

      //  ADD THIS
      const selectedVat = this.VatClass.find(
        (v: any) => Number(v.DESCRIPTION) === this.selectedInvoiceGST,
      );

      if (selectedVat) {
        row.GST_ID = selectedVat.ID;
      }
      row.CGST = 0;
      row.SGST = 0;
      // if (isSameState) {
      //   // SAME STATE → CGST + SGST
      //   const half = this.selectedInvoiceGST / 2;

      //   row.CGST = half;
      //   row.SGST = half;
      //   row.GST_PERC = 0;

      //   this.showCGST = true;
      //   this.showSGST = true;
      //   this.showGST = false;
      // } else {
      //   // DIFFERENT STATE → IGST
      //   row.GST_PERC = this.selectedInvoiceGST;
      //   row.CGST = 0;
      //   row.SGST = 0;

      //   this.showGST = true;
      //   this.showCGST = false;
      //   this.showSGST = false;
      // }
    });
  }

  getPendingInvoices() {
    const payload = {
      SUPP_ID: this.selectedSupplierId,
      COMPANY_ID: this.selectedCompanyId,
    };

    this.dataService
      .getPendingInvoiceforDebit(payload)
      .subscribe((response: any) => {
        this.pendingInvoicelist = response.Data;
      });
  }

  openInvoicePopup() {
    this.getPendingInvoices(); // Ensure you load fresh data
    this.invoicePopupVisible = true;
  }

  onInvoiceEnterKey(e: any): void {
    if (e.event.key === 'Enter') {
      this.dueAmountRef?.instance?.focus();
    }
  }
  onCompanySelectKeyDown(e: any): void {
    const selectBox = this.companySelectBoxRef?.instance;

    if (e.event.key === 'Enter') {
      const isOpen = selectBox.option('opened');

      if (!isOpen) {
        // Open the dropdown
        selectBox.open();
        this.dropdownJustOpened = true;
      } else if (this.dropdownJustOpened) {
        // If just opened, reset flag and wait for selection
        this.dropdownJustOpened = false;
      } else {
        // Dropdown is already open and selection is likely made
        selectBox.close();
        setTimeout(() => this.dueAmountRef?.instance?.focus(), 0);
      }
    }
  }

  onCompanySelected(): void {
    this.dropdownJustOpened = false;
    this.debitFormData.SUPP_ID = this.selectedCompanyId;
  }

  onDueAmountKeyDown(event: any): void {
    if (event.event?.key === 'Enter') {
      setTimeout(() => {
        // Focus grid's first editable cell — SL_NO (first row, first col)
        this.itemsGridRef?.instance?.editCell(0, 'SL_NO');
      }, 0);
    }
  }

  getLedgerCodeDropdown() {
    this.dataService.getActiveLedger().subscribe((response: any) => {
      this.ledgerList = response.Data;
    });
  }

  calculateTaxAmount = (rowData: any) => {
    const amount = Number(rowData.Amount) || 0;
    const gstPerc = Number(rowData.GST_PERC) || 0;

    return +((amount * gstPerc) / 100).toFixed(2);
  };

  // calculateTaxAmount = (rowData: any) => {
  //   const amount = Number(rowData.Amount) || 0;

  //   const companyState = this.companyState?.trim().toLowerCase();
  //   const supplierState =
  //     this.selectedSupplier?.STATE_NAME?.trim().toLowerCase();

  //   const isSameState = companyState === supplierState;

  //   let gstPerc = 0;

  //   if (isSameState) {
  //     // ✅ SAME STATE → CGST + SGST
  //     const cgst = Number(rowData.CGST) || 0;
  //     const sgst = Number(rowData.SGST) || 0;
  //     gstPerc = cgst + sgst;
  //   } else {
  //     // ✅ DIFFERENT STATE → IGST
  //     gstPerc = Number(rowData.GST_PERC) || 0;
  //   }

  //   return +((amount * gstPerc) / 100).toFixed(2);
  // };

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'ledgerCode' ||
      e.dataField === 'ledgerName' ||
      e.dataField === 'particulars' ||
      e.dataField === 'Amount' ||
      e.dataField === 'GST_PERC' ||
      e.dataField === 'gstAmount'
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
    }
    if (e.parentType !== 'dataRow') return;
    const rowIndex = e.row?.rowIndex;

    if (e.dataField === 'ledgerCode') {
      //  Open dropdown on focus
      e.editorOptions.onFocusIn = (args: any) => {
        setTimeout(() => {
          args.component.open();
        }, 0);
      };

      //  REMOVE your existing onKeyDown completely

      //  Move on value selection
      e.editorOptions.onValueChanged = (args: any) => {
        const selectedLedger = this.ledgerList.find(
          (item: any) => item.HEAD_CODE === args.value,
        );

        e.setValue(args.value);

        if (selectedLedger) {
          // bind ledger name
          e.component.cellValue(
            rowIndex,
            'ledgerName',
            selectedLedger.HEAD_NAME,
          );

          //  MOVE FOCUS HERE (THIS IS THE FIX)
          setTimeout(() => {
            const grid = this.itemsGridRef?.instance;
            grid.editCell(rowIndex, 'ledgerName');
          }, 50);
        }
      };
    }

    //  ledgerName: move to particulars on Enter
    if (e.dataField === 'ledgerName') {
      // open dropdown on focus
      e.editorOptions.onFocusIn = (args: any) => {
        setTimeout(() => {
          args.component.open();
        }, 0);
      };

      //  MAIN FIX: move on selection
      e.editorOptions.onValueChanged = (args: any) => {
        const selectedLedger = this.ledgerList.find(
          (item: any) => item.HEAD_NAME === args.value,
        );

        e.setValue(args.value);

        if (selectedLedger) {
          // sync code
          e.component.cellValue(
            rowIndex,
            'ledgerCode',
            selectedLedger.HEAD_CODE,
          );
        }

        //  MOVE TO PARTICULARS HERE
        setTimeout(() => {
          const grid = this.itemsGridRef?.instance;
          grid.editCell(rowIndex, 'particulars');
        }, 50);
      };

      // optional: Enter also moves (keyboard users)
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = this.itemsGridRef?.instance;

          setTimeout(() => {
            grid.editCell(rowIndex, 'particulars');
          }, 50);
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
            grid.focus(grid.getCellElement(rowIndex, 'Amount'));
          });
        }
      };
    }

    if (e.dataField === 'Amount') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          const grid = e.component;
          const rowIndex = e.row.rowIndex;
          // Move focus to the "ledgerCode" column in the same row
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'GST_PERC'));
          });
        }
      };
    }
    // if (e.dataField === 'Amount') {
    //   e.editorOptions.onKeyDown = (event: any) => {
    //     if (event.event.key === 'Enter') {
    //       // simulate TAB key (DevExtreme handles this correctly)
    //       const eKey = event.event;

    //       const tabEvent = new KeyboardEvent('keydown', {
    //         key: 'Tab',
    //         code: 'Tab',
    //         keyCode: 9,
    //         which: 9,
    //         bubbles: true,
    //       });

    //       eKey.target.dispatchEvent(tabEvent);
    //     }
    //   };
    // }

    if (e.dataField === 'GST_PERC') {
      const original = e.editorOptions.onValueChanged;

      e.editorOptions.onValueChanged = (args: any) => {
        if (original) original(args);

        e.setValue(args.value);

        const selectedVat = this.VatClass.find((v: any) => v.ID === args.value);

        if (selectedVat) {
          e.component.cellValue(rowIndex, 'GST_ID', selectedVat.ID);

          e.component.cellValue(
            rowIndex,
            'GST_PERC',
            Number(selectedVat.DESCRIPTION),
          );
        }

        e.row.data.CGST = 0;
        e.row.data.SGST = 0;
      };

      //  auto open dropdown
      e.editorOptions.onFocusIn = (args: any) => {
        setTimeout(() => {
          args.component.open();
        }, 50);
      };

      // ENTER → add row
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          event.event.preventDefault();

          const grid = this.itemsGridRef?.instance;

          setTimeout(() => {
            grid.saveEditData();

            if (this.hasEmptyRow()) return;

            // const baseRow = this.debitFormData.NOTE_DETAIL[0] || {};

            const newRow = {
              SL_NO: this.debitFormData.NOTE_DETAIL.length + 1,
              ledgerCode: '',
              ledgerName: '',
              particulars: '',
              Amount: '',
              GST_PERC: null, // ✅ EMPTY
              GST_ID: null, // ✅ IMPORTANT for lookup
              CGST: 0,
              SGST: 0,
              gstAmount: '',
              HEAD_ID: null,
            };

            // ✅ CORRECT ARRAY
            this.debitFormData.NOTE_DETAIL = [
              ...this.debitFormData.NOTE_DETAIL,
              newRow,
            ];

            // refresh
            grid.option('dataSource', [...this.debitFormData.NOTE_DETAIL]);
            grid.refresh();

            // focus new row
            setTimeout(() => {
              const visibleRows = grid.getVisibleRows();

              const newRowIndex = visibleRows.findIndex(
                (r: any) => r.data === newRow,
              );

              if (newRowIndex >= 0) {
                grid.editCell(newRowIndex, 'ledgerCode');
              }
            }, 150);
          }, 50);
        }
      };
    }

    if (e.dataField === 'CGST' || e.dataField === 'SGST') {
      const originalOnValueChanged = e.editorOptions.onValueChanged;

      e.editorOptions.onValueChanged = (args: any) => {
        if (originalOnValueChanged) {
          originalOnValueChanged(args);
        }

        e.setValue(args.value);

        // ✅ CLEAR IGST WHEN CGST / SGST IS ENTERED
        e.row.data.GST_PERC = 0;
      };
    }
  }

  // onEditorPreparing(e: any) {
  //   if (
  //     e.dataField === 'SL_NO' ||
  //     e.dataField === 'ledgerCode' ||
  //     e.dataField === 'ledgerName' ||
  //     e.dataField === 'particulars' ||
  //     e.dataField === 'Amount' ||
  //     e.dataField === 'GST_PERC' ||
  //     e.dataField === 'HSN_CODE' ||
  //     e.dataField === 'gstAmount'
  //   ) {
  //     e.editorOptions = e.editorOptions || {};

  //     // Let the editor inherit row height naturally (no fixed height)
  //     e.editorOptions.elementAttr = {
  //       style: `
  //       height: 100%;
  //       margin: 0;
  //       padding: 0;
  //       display: flex;
  //       align-items: center;
  //     `,
  //     };

  //     // Make sure the input fits snugly inside
  //     e.editorOptions.inputAttr = {
  //       style: `
  //       height: 100%;
  //       padding: 0 4px;
  //       box-sizing: border-box;
  //     `,
  //     };

  //     // Remove spin buttons to prevent layout changes
  //     if (e.editorName === 'dxNumberBox') {
  //       e.editorOptions.showSpinButtons = false;
  //     }
  //     e.editorOptions.onKeyDown = (event: any) => {
  //       if (event.event.key === 'Enter') {
  //         const grid = this.itemsGridRef?.instance;
  //         const visibleRows = grid.getVisibleRows();

  //         const rowIndex = visibleRows.findIndex(
  //           (r) => r?.data === e.row?.data,
  //         );
  //         setTimeout(() => {
  //           grid.focus(grid.getCellElement(rowIndex, 'GST'));
  //         }, 50);
  //       }
  //     };
  //   }
  //   if (e.parentType !== 'dataRow') return;
  //   const rowIndex = e.row?.rowIndex;

  //   // ➤ SL_NO: Move to ledgerCode on Enter
  //   if (e.dataField === 'SL_NO') {
  //     e.editorOptions.onKeyDown = (event: any) => {
  //       if (event.event.key === 'Enter') {
  //         const grid = this.itemsGridRef?.instance;
  //         const visibleRows = grid.getVisibleRows();

  //         const rowIndex = visibleRows.findIndex(
  //           (r) => r?.data === e.row?.data,
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
  //         (item: any) => item.HEAD_CODE === args.value,
  //       );

  //       e.setValue(args.value);

  //       if (selectedLedger) {
  //         //Set ledger name
  //         e.component.cellValue(
  //           rowIndex,
  //           'ledgerName',
  //           selectedLedger.HEAD_NAME,
  //         );

  //         //Set HSN from SELECTED INVOICE (NOT SESSION)
  //         if (this.selectedInvoiceHSN) {
  //           e.component.cellValue(
  //             rowIndex,
  //             'HSN_CODE',
  //             this.selectedInvoiceHSN,
  //           );
  //         }

  //         // GST is already applied globally via applyInvoiceGSTToRows()
  //         //  DO NOT SET GST HERE

  //         // Move to next field
  //         setTimeout(() => {
  //           this.itemsGridRef?.instance?.editCell(rowIndex, 'particulars');
  //         }, 50);
  //       }
  //     };
  //   }

  //   // ➤ ledgerName: move to particulars on Enter
  //   if (e.dataField === 'ledgerName') {
  //     e.editorOptions.onValueChanged = (args: any) => {
  //       const grid = this.itemsGridRef?.instance;
  //       const visibleRows = grid.getVisibleRows();

  //       const rowIndex = visibleRows.findIndex((r) => r?.data === e.row?.data);

  //       const selectedLedger = this.ledgerList.find(
  //         (item: any) => item.HEAD_NAME === args.value,
  //       );

  //       e.setValue(args.value);

  //       if (selectedLedger) {
  //         // ✅ Set ledgerCode
  //         grid.cellValue(rowIndex, 'ledgerCode', selectedLedger.HEAD_CODE);
  //       }

  //       // 🔥 MOVE TO PARTICULARS (THIS IS THE KEY)
  //       setTimeout(() => {
  //         grid.editCell(rowIndex, 'particulars');
  //       }, 50);
  //     };
  //   }

  //   if (e.dataField === 'particulars') {
  //     e.editorOptions.onKeyDown = (event: any) => {
  //       if (event.event.key === 'Enter') {
  //         const grid = e.component;
  //         const rowIndex = e.row.rowIndex;
  //         // Move focus to the "ledgerCode" column in the same row
  //         setTimeout(() => {
  //           grid.focus(grid.getCellElement(rowIndex, 'Amount'));
  //         });
  //       }
  //     };
  //   }
  //   if (e.dataField === 'Amount') {
  //     e.editorOptions.onKeyDown = (event: any) => {
  //       if (event.event.key === 'Enter') {
  //         const grid = e.component;
  //         const rowIndex = e.row.rowIndex;
  //         // Move focus to the "ledgerCode" column in the same row
  //         setTimeout(() => {
  //           grid.focus(grid.getCellElement(rowIndex, 'GST_PERC'));
  //         });
  //       }
  //     };
  //   }
  //   // if (e.dataField === 'GST_PERC') {
  //   //   e.editorOptions.onKeyDown = (event: any) => {
  //   //     if (event.event.key === 'Enter') {
  //   //       const grid = this.itemsGridRef?.instance;
  //   //       const rowData = e.row?.data;

  //   //       if (
  //   //         rowData.ledgerCode &&
  //   //         rowData.Amount != null &&
  //   //         !this.hasEmptyRow()
  //   //       ) {
  //   //         const companyState = this.companyState?.trim().toLowerCase();
  //   //         const supplierState =
  //   //           this.selectedSupplier?.STATE_NAME?.trim().toLowerCase();

  //   //         const isSameState = companyState === supplierState;

  //   //         let newRow: any = {
  //   //           SL_NO: this.debitFormData.NOTE_DETAIL.length + 1,
  //   //           ledgerCode: '',
  //   //           ledgerName: '',
  //   //           particulars: '',
  //   //           Amount: null,
  //   //           HSN_CODE: this.selectedInvoiceHSN || '',
  //   //           GST_PERC: 0,
  //   //           CGST: 0,
  //   //           SGST: 0,
  //   //         };

  //   //         //  APPLY GST
  //   //         if (this.selectedInvoiceGST) {
  //   //           //  ALWAYS SET GST_PERC FOR UI
  //   //           newRow.GST_PERC = this.selectedInvoiceGST;

  //   //           // Keep split hidden in UI
  //   //           newRow.CGST = 0;
  //   //           newRow.SGST = 0;
  //   //         }

  //   //         this.debitFormData.NOTE_DETAIL.push(newRow);

  //   //         grid.option('dataSource', [...this.debitFormData.NOTE_DETAIL]);
  //   //         grid.refresh();

  //   //         setTimeout(() => {
  //   //           const visibleRows = grid.getVisibleRows();
  //   //           const newRowIndex = visibleRows.findIndex(
  //   //             (r) => r.data === newRow,
  //   //           );

  //   //           if (newRowIndex >= 0) {
  //   //             grid.editCell(newRowIndex, 'ledgerCode');
  //   //           }
  //   //         }, 50);
  //   //       }
  //   //     }
  //   //   };
  //   // }
  //   // if (e.dataField === 'GST_PERC') {
  //   //   const originalOnValueChanged = e.editorOptions.onValueChanged;

  //   //   e.editorOptions.onValueChanged = (args: any) => {
  //   //     if (originalOnValueChanged) {
  //   //       originalOnValueChanged(args);
  //   //     }

  //   //     e.setValue(args.value);

  //   //     // same behavior
  //   //     e.row.data.CGST = 0;
  //   //     e.row.data.SGST = 0;
  //   //   };
  //   // }

  //   if (e.dataField === 'GST_PERC') {
  //     const originalOnValueChanged = e.editorOptions.onValueChanged;

  //     // ✅ VALUE CHANGE (Dropdown select)
  //     e.editorOptions.onValueChanged = (args: any) => {
  //       if (originalOnValueChanged) {
  //         originalOnValueChanged(args);
  //       }

  //       e.setValue(args.value);

  //       const rowIndex = e.row.rowIndex;

  //       // ✅ FIND SELECTED VAT
  //       const selectedVat = this.VatClass.find((v: any) => v.ID === args.value);

  //       console.log(selectedVat, 'selectedVat--------');

  //       if (selectedVat) {
  //         const percent = Number(selectedVat.DESCRIPTION);

  //         // ✅ STORE ID (hidden)
  //         e.component.cellValue(rowIndex, 'GST_ID', selectedVat.ID);

  //         // ✅ STORE % (visible)
  //         e.component.cellValue(rowIndex, 'GST_PERC', percent);

  //         // ✅ CALCULATE GST
  //         const amount = Number(e.row.data.Amount) || 0;
  //         const gst = (amount * percent) / 100;

  //         e.component.cellValue(rowIndex, 'gstAmount', +gst.toFixed(2));
  //       }

  //       // ✅ reset split
  //       e.row.data.CGST = 0;
  //       e.row.data.SGST = 0;
  //     };

  //     // ✅ ENTER KEY LOGIC (ADD NEW ROW)
  //     // e.editorOptions.onKeyDown = (event: any) => {
  //     //   if (event.event.key === 'Enter') {
  //     //     const grid = this.itemsGridRef?.instance;
  //     //     const rowData = e.row?.data;

  //     //     if (
  //     //       rowData.ledgerCode &&
  //     //       rowData.Amount != null &&
  //     //       !this.hasEmptyRow()
  //     //     ) {
  //     //       const companyState = this.companyState?.trim().toLowerCase();
  //     //       const supplierState =
  //     //         this.selectedSupplier?.STATE_NAME?.trim().toLowerCase();

  //     //       const isSameState = companyState === supplierState;

  //     //       let newRow: any = {
  //     //         SL_NO: this.noteDetails.length + 1,
  //     //         ledgerCode: '',
  //     //         ledgerName: '',
  //     //         particulars: '',
  //     //         Amount: null,
  //     //         HSN_CODE: this.selectedInvoiceHSN || '',
  //     //         // GST_PERC: 0,
  //     //         GST_ID: null, // ✅ IMPORTANT
  //     //         CGST: 0,
  //     //         SGST: 0,
  //     //       };

  //     //       // ✅ APPLY GST FROM INVOICE
  //     //       if (this.selectedInvoiceGST) {
  //     //         newRow.GST_PERC = this.selectedInvoiceGST;

  //     //         // 🔥 ALSO SET ID (IMPORTANT)
  //     //         const selectedVat = this.VatClass.find(
  //     //           (v: any) => Number(v.DESCRIPTION) === this.selectedInvoiceGST
  //     //         );

  //     //         if (selectedVat) {
  //     //           newRow.GST_ID = selectedVat.ID;
  //     //         }

  //     //         newRow.CGST = 0;
  //     //         newRow.SGST = 0;
  //     //       }

  //     //       // ✅ PUSH ROW
  //     //       this.noteDetails.push(newRow);

  //     //       grid.option('dataSource', [...this.noteDetails]);
  //     //       grid.refresh();

  //     //       setTimeout(() => {
  //     //         const visibleRows = grid.getVisibleRows();
  //     //         const newRowIndex = visibleRows.findIndex(
  //     //           (r) => r.data === newRow
  //     //         );

  //     //         if (newRowIndex >= 0) {
  //     //           grid.editCell(newRowIndex, 'ledgerCode');
  //     //         }
  //     //       }, 50);
  //     //     }
  //     //   }
  //     // };
  //   }

  //   if (e.dataField === 'CGST' || e.dataField === 'SGST') {
  //     const originalOnValueChanged = e.editorOptions.onValueChanged;

  //     e.editorOptions.onValueChanged = (args: any) => {
  //       if (originalOnValueChanged) {
  //         originalOnValueChanged(args);
  //       }

  //       e.setValue(args.value);

  //       //  CLEAR IGST WHEN CGST / SGST IS ENTERED
  //       e.row.data.GST_PERC = 0;
  //     };
  //   }

  //   // e.row.data.HSN_CODE = this.HSN_CODE;
  // }

  onRowInserted(e: any) {
    // Recalculate SL_NO after insertion
    this.updateSerialNumbers();
  }

  updateSerialNumbers() {
    if (this.debitFormData && this.debitFormData.NOTE_DETAIL) {
      this.debitFormData.NOTE_DETAIL.forEach((item: any, index: number) => {
        item.SL_NO = index + 1;
      });
    }
  }

  validateGstAmount(e: any) {
    const row = e.data;
    // If Amount is null or undefined, allow editing
    if (row.Amount == null) return true;
    return row.gstAmount <= row.Amount;
  }

  onNarrationKeyDown(e: any): void {
    if (e.event.key === 'Enter' || e.event.key === 'Tab') {
      e.event.preventDefault();

      setTimeout(() => {
        this.saveButtonRef?.instance?.focus();
      }, 0);
    }
  }

  getDocNo() {
    const payload = {
      TRANS_TYPE: 36,
      SUB_TYPE_ID: this.selectedSubTypeId || 0,
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getDocNoForDebit(payload).subscribe((response: any) => {
      this.docNo = response.DOC_NO;
      this.debitFormData.DOC_NO = response.DOC_NO;
    });
  }

  onRowRemoving(e: any) {
    // Remove row from your source array
    const index = this.debitFormData.NOTE_DETAIL.indexOf(e.data);

    if (index > -1) {
      this.debitFormData.NOTE_DETAIL.splice(index, 1);
    }

    //  Reassign datasource so DevExtreme refreshes properly
    this.itemsGridRef.instance.option('dataSource', [
      ...this.debitFormData.NOTE_DETAIL,
    ]);

    //Fix SL_NO
    this.updateSerialNumbers();
  }

  onSummaryCalculated(e: any): void {
    const totalItems = e.totalValue;

    const amountTotal = totalItems?.[0]?.value || 0;
    const gstTotal = totalItems?.[1]?.value || 0;

    this.netAmountDisplay = amountTotal + gstTotal;
  }

  calculateAmount = (rowData: any): number => {
    const amt = parseFloat(rowData?.AMOUNT) || 0;
    const gst = parseFloat(rowData?.GST_AMOUNT) || 0;
    this.netAmountDisplay = amt + gst;
    return amt + gst;
  };

  get netAmountString(): string {
    const details = this.debitFormData?.NOTE_DETAIL || [];
    let totalAmount = 0;
    let totalGST = 0;

    const isSameState = this.companyStateID === this.selectedSupplier?.STATE_ID;

    details.forEach((item: any) => {
      const amount = Number(item.Amount) || 0;
      totalAmount += amount;

      if (isSameState) {
        //  SAME STATE → CGST + SGST
        const cgst = Number(item.CGST) || 0;
        const sgst = Number(item.SGST) || 0;
        const totalGstPerc = cgst + sgst;

        totalGST += (amount * totalGstPerc) / 100;
      } else {
        // DIFFERENT STATE → IGST
        const gstPerc = Number(item.GST_PERC) || 0;
        totalGST += (amount * gstPerc) / 100;
      }
    });

    // Raw total (before round-off)
    this.netTotal = totalAmount + totalGST;

    // Apply round-off only if checkbox enabled
    if (this.debitFormData.ROUND_OFF) {
      this.netTotal = Math.round(this.netTotal);
    }
    return this.netTotal.toFixed(2);
  }

  formatDate(date: any): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`; //yyyy-MM-dd format
  }

  callInsertAPI() {
    if (this.isSaving) {
      return;
    }
    this.isSaving = true;

    const payload = JSON.parse(
      JSON.stringify({
        ...this.debitFormData,
        TRANS_DATE: this.formatDate(this.debitFormData.TRANS_DATE),
        ADD_TIME: this.formatDate(new Date()),
        SALE_DATE: this.formatDate(new Date()),
      }),
    );

    this.dataService.insertDebitNote(payload).subscribe(
      (response: any) => {
        notify(
          {
            message: 'Debit Note Saved Successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );

        this.popupClosed.emit();
        this.resetDebitNoteForm();
        this.isSaving = false;
      },
      (error) => {
        notify('Failed to save Debit Note. Please try again.', 'error', 2000);
        console.error('Save error:', error);
        this.isSaving = false;
      },
    );
  }

  saveDebitNote(): void {
    this.itemsGridRef?.instance?.saveEditData();
    if (this.showSubType && !this.debitFormData.SUB_TYPE_ID) {
      notify('Please select a Sub type before saving.', 'error', 2000);
      return;
    }
    const gridData =
      this.itemsGridRef?.instance?.getVisibleRows().map((r) => r.data) || [];
    const details = this.debitFormData.NOTE_DETAIL || [];
    let totalAmount = 0;
    let totalGST = 0;

    details.forEach((item: any) => {
      const amount = Number(item.Amount) || 0;
      const gstPerc = Number(item.GST_PERC) || 0;
      totalAmount += amount;
      totalGST += (amount * gstPerc) / 100;
    });

    const netAmount = totalAmount + totalGST;
    const dueAmount = Number(this.debitFormData?.DUE_AMOUNT) || 0;

    if (Number(netAmount) > dueAmount) {
      notify('Net Amount cannot exceed Due Amount.', 'error', 2500);
      return;
    }
    // ✅ Filter valid rows

    const validRows = gridData.filter((row: any) => {
      const hasLedger = !!(row.ledgerCode || row.ledgerName);
      const hasAmount = Number(row.Amount) > 0;

      return hasLedger && hasAmount; // ✅ STRICT CHECK
    });
    // const validRows = gridData.filter(
    //   (row: any) =>
    //     row.ledgerCode ||
    //     row.ledgerName ||
    //     row.Amount ||
    //     row.GST_PERC ||
    //     row.gstAmount ||
    //     row.particulars,
    // );

    // ✅ 1. Form-level validations
    if (!this.debitFormData.SUPP_ID) {
      notify('Please select a Supplier before saving.', 'error', 2000);
      return;
    }

    if (!this.debitFormData.INVOICE_NO) {
      notify('Please select an Invoice before saving.', 'error', 2000);
      return;
    }

    if (validRows.length === 0) {
      notify('Please enter at least one ledger entry.', 'error', 2000);
      return;
    }

    // ✅ 2. Row-level validation for Amount
    const invalidAmountRow = validRows.find(
      (row: any) =>
        (row.ledgerCode || row.ledgerName) &&
        (!row.Amount || Number(row.Amount) === 0),
    );

    if (invalidAmountRow) {
      notify(
        'Please enter a valid Amount for the selected ledger.',
        'error',
        3000,
      );
      return;
    }
    if (invalidAmountRow) {
      notify(
        'Please enter a valid Amount for the selected ledger.',
        'error',
        3000,
      );
      return;
    }
    // ✅ 3. Build NOTE_DETAIL for backend
    this.debitFormData.NOTE_DETAIL = validRows.map(
      (row: any, index: number) => {
        const ledger = this.ledgerList.find(
          (item: any) =>
            item.HEAD_CODE === row.ledgerCode ||
            item.HEAD_NAME === row.ledgerName,
        );
        const gstAmount = this.calculateTaxAmount(row);
        return {
          SL_NO: row.SL_NO || index + 1,
          HEAD_ID: ledger?.HEAD_ID || null,
          AMOUNT: Number(row.Amount) || 0,
          // GST_PERC: Number(row.GST_PERC) || 0,
          GST_PERC: row.GST_ID ?? row.GST_PERC,
          CGST: Number(row.CGST) || 0,
          SGST: Number(row.SGST) || 0,
          GST_AMOUNT: gstAmount,
          REMARKS: row.particulars || '',
        };
      },
    );

    //  FINAL TAX CLEANUP (VERY IMPORTANT)
    // ✅ FINAL TAX LOGIC (BASED ON STATE)
    // const companyState = this.companyState?.trim().toLowerCase();
    // const supplierState =
    //   this.selectedSupplier?.STATE_NAME?.trim().toLowerCase();

    // const isSameState = companyState === supplierState;

    // ✅ FINAL TAX LOGIC (BASED ON STATE)
    const companyState = this.companyState?.trim().toLowerCase();
    const supplierState =
      this.selectedSupplier?.STATE_NAME?.trim().toLowerCase();

    const isSameState = companyState === supplierState;

    this.debitFormData.NOTE_DETAIL.forEach((row: any) => {
      const gstPerc = Number(row.GST_PERC) || 0;

      if (isSameState) {
        // SAME STATE → split into CGST + SGST
        row.CGST = gstPerc / 2;
        row.SGST = gstPerc / 2;
        row.GST_PERC = row.GST_PERC;
      } else {
        // DIFFERENT STATE → keep GST_PERC (IGST)
        row.CGST = 0;
        row.SGST = 0;
        row.GST_PERC = row.GST_PERC;
      }
    });

    // 4. Other fields
    this.debitFormData.NET_AMOUNT = this.netAmountDisplay;
    this.debitFormData.STORE_ID = this.selectedstoreId;
    this.debitFormData.INVOICE_NO = String(this.debitFormData.INVOICE_NO);
    // this.debitFormData.TRANS_DATE = this.formatDate(
    //   this.debitFormData.TRANS_DATE
    // );
    this.debitFormData.TRANS_DATE = this.formatDate(
      this.debitFormData.TRANS_DATE,
    );
    this.debitFormData.SALE_DATE = this.formatDate(
      this.debitFormData.SALE_DATE,
    );
    this.debitFormData.COMPANY_ID = this.selectedCompany;

    //  NEW LOGIC HERE
    if (this.debitFormData.IS_APPROVED) {
      const result = confirm(
        'A new Debit Note will be created and approved. Do you want to continue?',
        'Confirm Approval',
      );

      result.then((dialogResult) => {
        if (dialogResult) {
          this.callInsertAPI();
        }
      });

      return;
    }

    // no approval → save directly
    this.callInsertAPI();
  }

  resetDebitNoteForm() {
    this.debitFormData = {
      TRANS_TYPE: 36,
      COMPANY_ID: 0,
      STORE_ID: 0,
      DOC_NO: this.getDocNo(),
      TRANS_DATE: new Date(),
      TRANS_STATUS: 1,
      SUPP_ID: '',
      NARRATION: '',
      INVOICE_ID: 0,
      INVOICE_NO: '',
      UNIT_ID: '',
      DUE_AMOUNT: '',
      SUB_TYPE_ID: null,
      IS_APPROVED: false,
      NOTE_DETAIL: [
        {
          SL_NO: 1,
          HEAD_ID: '',
          AMOUNT: '',
          GST_AMOUNT: '',
          REMARKS: '',
        },
      ],
    };
    this.selectedSubTypeId = null;
  }

  cancel() {
    this.popupClosed.emit();
    this.resetDebitNoteForm();
  }

  hasEmptyRow(): boolean {
    return this.debitFormData.NOTE_DETAIL.some((row: any) => {
      const isCompletelyEmpty =
        (!row.ledgerCode || row.ledgerCode === '') &&
        (row.Amount === null || row.Amount === '' || row.Amount === undefined);

      //  ignore rows that were auto-created but never edited
      const hasAnyValue =
        row.ledgerCode ||
        row.ledgerName ||
        row.particulars ||
        Number(row.Amount) > 0;

      return isCompletelyEmpty && hasAnyValue;
    });
  }

  onAddNewRow() {
    const grid = this.itemsGridRef.instance;
    const rows = grid.getVisibleRows();

    const hasIncompleteRow = rows.some(
      (r: any) => !r.data.ledgerName || !r.data.Amount,
    );
    if (hasIncompleteRow) {
      return;
    }

    const nextSlNo = this.noteDetails.length + 1;

    const newRow: any = {
      SL_NO: nextSlNo,
      ledgerCode: null,
      ledgerName: '',
      particulars: '',
      Amount: null,
      gstAmount: null,
      HSN_CODE: '',
      CGST: 0,
      SGST: 0,
      GST_PERC: null, // ✅ keep empty
    };

    const baseRow = this.noteDetails[0];

    if (baseRow) {
      // ❌ removed GST copy
      newRow.HSN_CODE = baseRow.HSN_CODE || ''; // ✅ keep this if needed
    }

    this.noteDetails.push(newRow);

    setTimeout(() => {
      const gridInstance = this.itemsGridRef?.instance;
      const newRowIndex = this.noteDetails.length - 1;
      gridInstance?.editCell(newRowIndex, 'ledgerCode');
    }, 100);
  }

  calculateTotal = (row: any) => {
    const amount = Number(row.Amount) || 0;
    const gst = this.calculateTaxAmount(row);
    return +(amount + gst).toFixed(2);
  };

  onRoundOffChange() {
    if (this.debitFormData.ROUND_OFF) {
      // Round Off Enabled
      this.netAmount = Math.round(this.netTotal).toFixed(2);
    } else {
      // Round Off Disabled → return to original value
      this.netAmount = Number(this.netTotal).toFixed(2);
    }
  }

  getGstDisplayValue = (row: any) => {
    const percent = row.GST_PERC ?? 0;
    return `${percent} %`;
  };
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
  declarations: [AddDebitComponent],
  exports: [AddDebitComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AddDebitModule {}
