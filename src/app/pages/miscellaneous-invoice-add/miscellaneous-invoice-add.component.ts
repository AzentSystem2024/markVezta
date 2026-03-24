import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
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
  DxSelectBoxComponent,
  DxNumberBoxComponent,
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
import notify from 'devextreme/ui/notify';
import dxSelectBox from 'devextreme/ui/select_box';
import DevExpress from 'devextreme';
import { Console } from 'console';
import { Router } from '@angular/router';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-miscellaneous-invoice-add',
  templateUrl: './miscellaneous-invoice-add.component.html',
  styleUrls: ['./miscellaneous-invoice-add.component.scss'],
})
export class MiscellaneousInvoiceAddComponent {
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
  invoicePopupVisible: boolean;
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

    this.subType = userData.Configuration[0].SUB_TYPE_ID;
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
    this.getDocNo();
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
        GST_PERC: '',
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
    const payload = {
      TRANS_TYPE: 36,
    };
    this.dataService
      .getSubTypeCreditNote(payload)
      .subscribe((response: any) => {
        this.subTypeList = response.Data;
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
    //   console.log(this.companyList,"COMPANYLIST")
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

  // onSupplierChanged(event: any) {
  //   this.selectedSupplierId = event.value;
  //   console.log(this.selectedSupplierId);

  //   const selectedSupplier = this.distributorList.find(
  //     (supplier: any) => supplier.ID === this.selectedSupplierId
  //   );

  //   console.log(selectedSupplier);
  //   const company = this.companyState?.trim().toLowerCase();
  //   console.log(company);
  //   const supplier = selectedSupplier.STATE_NAME?.trim().toLowerCase();
  //   console.log(supplier);
  //   const sessionGst = parseFloat(this.GST) || 0; // main GST%
  //   console.log(sessionGst);

  //   if (company === supplier) {
  //     console.log('Both states SAME → CGST + SGST apply');

  //     this.showCGST = true;
  //     this.showSGST = true;
  //     this.showGST = false;

  //     //  Split GST into CGST + SGST
  //     const half = sessionGst / 2;

  //     // Update all grid rows
  //     this.debitFormData.NOTE_DETAIL?.forEach((row: any) => {
  //       row.CGST = half;
  //       row.SGST = half;
  //       row.GST = 0; // GST becomes zero in same-state case
  //     });
  //   } else {
  //     console.log('States DIFFERENT → GST applies');

  //     this.showGST = true;
  //     this.showCGST = false;
  //     this.showSGST = false;

  //     // ⭐ GST only
  //     this.debitFormData.NOTE_DETAIL?.forEach((row: any) => {
  //       row.GST = sessionGst;
  //       row.CGST = 0;
  //       row.SGST = 0;
  //     });
  //   }
  //   this.selectedSupplier = selectedSupplier;

  //   if (this.selectedSupplierId) {
  //     this.debitFormData.PARTY_NAME = this.selectedSupplier.DESCRIPTION;
  //     console.log(this.selectedSupplier.DESCRIPTION, 'PARTYNAMEEEEEEEEEEEEEE');
  //   }

  //   if (this.selectedSupplierId) {
  //     this.debitFormData.SUPP_ID = this.selectedSupplierId;
  //     console.log(
  //       this.selectedSupplierId,
  //       'SELECTEDSUPPLIERIDDDDDDDDDDDDDDDDDD'
  //     );
  //     this.getPendingInvoices(); // Pass supplier ID here
  //   } else {
  //     // this.pendingInvoicelist = [];
  //   }
  // }
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
      this.applyInvoiceGSTToRows();
    }

    // 🔹 Reload pending invoices
    this.getPendingInvoices();
  }

  selectInvoice(e: any) {
    const selected = e.data;

    this.debitFormData.INVOICE_NO = selected.INVOICE_NO;
    this.debitFormData.DUE_AMOUNT = selected.PENDING_AMOUNT;
    this.debitFormData.INVOICE_ID = selected.BILL_ID;

    // ✅  STORE GST & HSN FROM INVOICE
    this.selectedInvoiceGST = Number(selected.GST_PERC) || 0;
    this.selectedInvoiceHSN = selected.HSN_CODE || '';

    // ✅ APPLY TAX MODE BASED ON STATE
    this.applyInvoiceGSTToRows();

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

      if (isSameState) {
        // SAME STATE → CGST + SGST
        const half = this.selectedInvoiceGST / 2;

        row.CGST = half;
        row.SGST = half;
        row.GST_PERC = 0;

        this.showCGST = true;
        this.showSGST = true;
        this.showGST = false;
      } else {
        // DIFFERENT STATE → IGST
        row.GST_PERC = this.selectedInvoiceGST;
        row.CGST = 0;
        row.SGST = 0;

        this.showGST = true;
        this.showCGST = false;
        this.showSGST = false;
      }
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

    const companyState = this.companyState?.trim().toLowerCase();
    const supplierState =
      this.selectedSupplier?.STATE_NAME?.trim().toLowerCase();

    const isSameState = companyState === supplierState;

    let gstPerc = 0;

    if (isSameState) {
      // ✅ SAME STATE → CGST + SGST
      const cgst = Number(rowData.CGST) || 0;
      const sgst = Number(rowData.SGST) || 0;
      gstPerc = cgst + sgst;
    } else {
      // ✅ DIFFERENT STATE → IGST
      gstPerc = Number(rowData.GST_PERC) || 0;
    }

    return +((amount * gstPerc) / 100).toFixed(2);
  };

  onEditorPreparing(e: any) {
    console.log(e, 'editor preparing event');
    if (
      e.dataField === 'SL_NO' ||
      e.dataField === 'ledgerCode' ||
      e.dataField === 'ledgerName' ||
      e.dataField === 'particulars' ||
      e.dataField === 'Amount' ||
      e.dataField === 'GST_PERC' ||
      e.dataField === 'HSN_CODE' ||
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
    if (e.dataField === 'SL_NO') {
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
              this.itemsGridRef?.instance?.editCell(rowIndex, 'particulars');
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
          // 1️⃣ Set ledger name
          e.component.cellValue(
            rowIndex,
            'ledgerName',
            selectedLedger.HEAD_NAME,
          );

          // 2️⃣ Set HSN from SELECTED INVOICE (NOT SESSION)
          if (this.selectedInvoiceHSN) {
            e.component.cellValue(
              rowIndex,
              'HSN_CODE',
              this.selectedInvoiceHSN,
            );
          }

          // 3️⃣ GST is already applied globally via applyInvoiceGSTToRows()
          // ❌ DO NOT SET GST HERE

          // 4️⃣ Move to next field
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
          const grid = this.itemsGridRef?.instance;
          const rowData = e.row?.data;

          if (
            rowData.ledgerCode &&
            rowData.Amount != null &&
            !this.hasEmptyRow()
          ) {
            const companyState = this.companyState?.trim().toLowerCase();
            const supplierState =
              this.selectedSupplier?.STATE_NAME?.trim().toLowerCase();

            const isSameState = companyState === supplierState;

            let newRow: any = {
              SL_NO: this.debitFormData.NOTE_DETAIL.length + 1,
              ledgerCode: '',
              ledgerName: '',
              particulars: '',
              Amount: null,
              HSN_CODE: this.selectedInvoiceHSN || '',
              GST_PERC: 0,
              CGST: 0,
              SGST: 0,
            };

            // ⭐ APPLY GST
            if (this.selectedInvoiceGST) {
              if (isSameState) {
                const half = this.selectedInvoiceGST / 2;
                newRow.CGST = half;
                newRow.SGST = half;
              } else {
                newRow.GST_PERC = this.selectedInvoiceGST;
              }
            }

            this.debitFormData.NOTE_DETAIL.push(newRow);

            grid.option('dataSource', [...this.debitFormData.NOTE_DETAIL]);
            grid.refresh();

            setTimeout(() => {
              const visibleRows = grid.getVisibleRows();
              const newRowIndex = visibleRows.findIndex(
                (r) => r.data === newRow,
              );

              if (newRowIndex >= 0) {
                grid.editCell(newRowIndex, 'ledgerCode');
              }
            }, 50);
          }
        }
      };
    }

    if (e.dataField === 'GST_PERC') {
      const originalOnValueChanged = e.editorOptions.onValueChanged;

      e.editorOptions.onValueChanged = (args: any) => {
        // keep existing behavior
        if (originalOnValueChanged) {
          originalOnValueChanged(args);
        }

        e.setValue(args.value);

        // ✅ CLEAR CGST & SGST WHEN IGST IS ENTERED
        e.row.data.CGST = 0;
        e.row.data.SGST = 0;
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

    // e.row.data.HSN_CODE = this.HSN_CODE;
  }

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
    console.log(e, 'sasas');
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

    // 🔥 Reassign datasource so DevExtreme refreshes properly
    this.itemsGridRef.instance.option('dataSource', [
      ...this.debitFormData.NOTE_DETAIL,
    ]);

    // 🔢 Fix SL_NO
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
        // ⭐ SAME STATE → CGST + SGST
        const cgst = Number(item.CGST) || 0;
        const sgst = Number(item.SGST) || 0;
        const totalGstPerc = cgst + sgst;

        totalGST += (amount * totalGstPerc) / 100;
      } else {
        // ⭐ DIFFERENT STATE → IGST
        const gstPerc = Number(item.GST_PERC) || 0;
        totalGST += (amount * gstPerc) / 100;
      }
    });

    // ⭐ Raw total (before round-off)
    this.netTotal = totalAmount + totalGST;

    // ⭐ Apply round-off only if checkbox enabled
    if (this.debitFormData.ROUND_OFF) {
      this.netTotal = Math.round(this.netTotal);
    }
    // console.log(this.netTotal, 'NETTOTALLLLLLLL');
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
    console.log('FRONTEND FINAL PAYLOAD:', JSON.stringify(payload, null, 2));

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
    console.log(netAmount, dueAmount, 'netadmount,dueamount');

    if (Number(netAmount) > dueAmount) {
      console.log(netAmount, dueAmount, 'NOTIFYNETAMOUNT');
      notify('Net Amount cannot exceed Due Amount.', 'error', 2500);
      return;
    }
    // ✅ Filter valid rows

    const validRows = gridData.filter((row: any) => {
      const hasLedger = !!(row.ledgerCode || row.ledgerName);
      const hasAmount = Number(row.Amount) > 0;
      const hasTax =
        Number(row.GST_PERC) > 0 ||
        Number(row.CGST) > 0 ||
        Number(row.SGST) > 0;
      const hasRemarks = !!row.particulars;

      return hasLedger || hasAmount || hasTax || hasRemarks;
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
      notify('Please enter a valid Amount', 'error', 3000);
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
          GST_PERC: Number(row.GST_PERC) || 0,
          CGST: Number(row.CGST) || 0,
          SGST: Number(row.SGST) || 0,
          GST_AMOUNT: gstAmount,
          REMARKS: row.particulars || '',
        };
      },
    );

    //  FINAL TAX CLEANUP (VERY IMPORTANT)
    this.debitFormData.NOTE_DETAIL.forEach((row: any) => {
      if (row.CGST > 0 || row.SGST > 0) {
        // CGST / SGST present → clear IGST
        row.GST_PERC = 0;
      } else if (row.GST_PERC > 0) {
        // IGST present → clear CGST & SGST
        row.CGST = 0;
        row.SGST = 0;
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
    console.log(this.debitFormData.NET_AMOUNT, 'NETAMOUNT');

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
    const grid = this.itemsGridRef?.instance;

    if (!grid) return;

    if (this.hasEmptyRow()) {
      notify('Please fill the existing empty row first.', 'warning', 2000);
      return;
    }

    const nextSlNo = this.debitFormData.NOTE_DETAIL.length + 1;

    const companyState = this.companyState?.trim().toLowerCase();
    const supplierState =
      this.selectedSupplier?.STATE_NAME?.trim().toLowerCase();

    const isSameState = companyState === supplierState;

    let newRow: any = {
      SL_NO: nextSlNo,
      ledgerCode: null,
      ledgerName: '',
      particulars: '',
      Amount: null,
      HSN_CODE: this.selectedInvoiceHSN || '',
      GST_PERC: 0,
      CGST: 0,
      SGST: 0,
    };

    if (this.selectedInvoiceGST) {
      if (isSameState) {
        const half = this.selectedInvoiceGST / 2;

        newRow.CGST = half;
        newRow.SGST = half;
        newRow.GST_PERC = 0;
      } else {
        newRow.GST_PERC = this.selectedInvoiceGST;
        newRow.CGST = 0;
        newRow.SGST = 0;
      }
    }

    // push row
    this.debitFormData.NOTE_DETAIL.push(newRow);

    // refresh datasource
    grid.option('dataSource', [...this.debitFormData.NOTE_DETAIL]);

    // focus ledgerCode
    setTimeout(() => {
      const visibleRows = grid.getVisibleRows();
      const newRowIndex = visibleRows.findIndex((r) => r.data === newRow);

      if (newRowIndex >= 0) {
        grid.editCell(newRowIndex, 'ledgerCode');
      }
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
  declarations: [MiscellaneousInvoiceAddComponent],
  exports: [MiscellaneousInvoiceAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MiscellaneousInvoiceAddModule {}
