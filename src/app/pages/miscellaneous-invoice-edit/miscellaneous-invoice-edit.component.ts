import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  NgZone,
  Output,
  SimpleChanges,
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
  selector: 'app-miscellaneous-invoice-edit',
  templateUrl: './miscellaneous-invoice-edit.component.html',
  styleUrls: ['./miscellaneous-invoice-edit.component.scss'],
})
export class MiscellaneousInvoiceEditComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() debitFormData: any;
  popupVisible = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;

  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  creditNoteList: any;
  ledgerList: any;
  companyList: any;
  transDate: Date;
  noteDetails: any;
  selectedCompanyId: any;
  dropdownJustOpened: boolean = false;
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
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;

  netAmountDisplay: any;
  formattedTransDate: string;
  userId: any;
  finId: any;
  invoicePopupVisible: boolean;
  selectedSupplierId: any;
  pendingInvoicelist: any;
  supplierList: any;
  docNo: any;
  invoiceNo: string;
  sessionData: any;
  selected_vat_id: any;
  selectedSupplier: any;
  selectedstoreId: any;
  net: string;
  HSNCODE: any;
  hsnLoaded: boolean;
  GST: any;
  showCGST: boolean = false;
  showSGST: boolean = false;
  showGST: boolean = false;
  companyState: any;
  selectedCompany: any;
  distributorList: any;

  isUpdating = false;
  subType: boolean = false;
  subTypeList: any;

  constructor(private dataService: DataService) {
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    this.subType = userData.Configuration[0].SUB_TYPE_ID;
    if (userDataString) {
      const userData = JSON.parse(userDataString);

      this.HSNCODE = userData.GeneralSettings.HSN_CODE;
      this.GST = userData.GeneralSettings.GST_PERC;
      this.hsnLoaded = true; // ADD THIS
    }
    this.sessionData_tax();
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;

    this.selectedCompany = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
    this.companyState = this.sessionData.SELECTED_COMPANY.STATE_NAME;
    // this.GST = this.sessionData.GeneralSettings.GST_PERC;
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
      const selectedCompany = userData?.SELECTED_COMPANY;

      if (selectedCompany?.COMPANY_ID) {
        this.companyList = [selectedCompany]; // Show only selected company
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
      }

      // Also store USER_ID / FIN_ID if needed later
      this.userId = userData.USER_ID;
      this.finId = userData.FINANCIAL_YEARS?.[0]?.FIN_ID;
    }
    // this.getDocNo();
    this.getLedgerCodeDropdown();
    // this.getSupplierDropdown();
    this.getSupplierOrUnitLst();
    this.sessionData_tax();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['debitFormData'] && this.debitFormData?.length) {
      const data = this.debitFormData[0];

      setTimeout(() => {
        this.itemsGridRef?.instance?.beginCustomLoading('Loading...');
      });

      this.debitFormData = [...this.debitFormData];
      this.debitFormData.PARTY_NAME = data.PARTY_NAME;

      this.invoiceNo = data.INVOICE_NO;
      this.getPendingInvoices(data);
      this.docNo = data.DOC_NO;
      this.netAmountDisplay = parseFloat(data.NET_AMOUNT) || 0;
      this.transDate = new Date(data.TRANS_DATE);
      this.formattedTransDate = this.formatAsDDMMYYYY(this.transDate);

      // -----------------------------
      //  STEP 1: GET CUSTOMER STATE
      // -----------------------------
      const customerState = (
        data.CUST_STATE ||
        data.SUPP_STATE_NAME ||
        data.STATE_NAME ||
        ''
      )
        .trim()
        .toLowerCase();

      // COMPANY STATE (already from session)
      const companyState = this.companyState?.trim().toLowerCase();

      if (companyState === customerState) {
        this.showCGST = true;
        this.showSGST = true;
        this.showGST = false;
      } else {
        this.showGST = true;
        this.showCGST = false;
        this.showSGST = false;
      }

      // -----------------------------
      // STEP 3: BUILD GRID ROWS
      // -----------------------------
      this.getLedgerCodeDropdown()
        .then(() => {
          this.noteDetails = (data.NOTE_DETAIL || []).map(
            (item: any, index: number) => {
              const match = this.ledgerList.find(
                (l: any) => l.HEAD_ID === item.HEAD_ID,
              );
              return {
                SL_NO: index + 1,
                ...item,
                ledgerCode: match?.HEAD_CODE || '',
                ledgerName: match?.HEAD_NAME || '',
                particulars: item.REMARKS || '',
                Amount: item.AMOUNT || '',
                gstAmount: item.GST_AMOUNT || '',
                HSN_CODE: item.HSN_CODE || this.HSNCODE,
                GST_PERC: item.GST_PERC || 0,
                CGST: item.CGST || 0,
                SGST: item.SGST || 0,
              };
            },
          );

          if (this.noteDetails.length === 0) {
            this.noteDetails.push({
              SL_NO: 1,
              ledgerCode: '',
              ledgerName: '',
              particulars: '',
              Amount: '',
              gstAmount: '',
              HSN_CODE: '',
              HEAD_ID: null,
            });
          }
        })
        .finally(() => {
          // 🟢 STOP GRID LOADING
          this.itemsGridRef?.instance?.endCustomLoading();
        });
    }
  }

  onAddNewRow() {
    const grid = this.itemsGridRef.instance;
    const rows = grid.getVisibleRows();

    // Prevent adding if any existing row is incomplete
    const hasIncompleteRow = rows.some(
      (r: any) => !r.data.ledgerName || !r.data.Amount,
    );
    if (hasIncompleteRow) {
      return;
    }

    const nextSlNo = this.noteDetails.length + 1;

    // ---------- NEW ROW BASE ----------
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
      GST_PERC: 0,
    };

    // ---------- GST / CGST+SGST FROM SAVED DATA ----------
    const baseRow = this.noteDetails[0]; // 🔑 source of truth

    if (baseRow) {
      if ((baseRow.CGST || 0) > 0 || (baseRow.SGST || 0) > 0) {
        // ✅ SAME STATE → CGST + SGST
        this.showCGST = true;
        this.showSGST = true;
        this.showGST = false;

        newRow.CGST = baseRow.CGST || 0;
        newRow.SGST = baseRow.SGST || 0;
        newRow.GST_PERC = 0;
      } else {
        // ✅ DIFFERENT STATE → IGST
        this.showGST = true;
        this.showCGST = false;
        this.showSGST = false;

        newRow.GST_PERC = baseRow.GST_PERC || 0;
        newRow.CGST = 0;
        newRow.SGST = 0;
      }

      // ✅ Copy HSN from saved data
      newRow.HSN_CODE = baseRow.HSN_CODE || '';
    }

    // ---------- PUSH ROW & FOCUS ----------
    this.noteDetails.push(newRow);

    setTimeout(() => {
      const gridInstance = this.itemsGridRef?.instance;
      const newRowIndex = this.noteDetails.length - 1;
      gridInstance?.editCell(newRowIndex, 'ledgerCode');
    }, 100);
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

  onSupplierChanged(event: any) {
    this.selectedSupplierId = event.value;
    console.log(this.selectedSupplierId);

    const selectedSupplier = this.distributorList.find(
      (supplier: any) => supplier.ID === this.selectedSupplierId,
    );

    console.log(selectedSupplier);
    const company = this.companyState?.trim().toLowerCase();
    console.log(company);
    const supplier = selectedSupplier.STATE_NAME?.trim().toLowerCase();
    console.log(supplier);
    const sessionGst = parseFloat(this.GST) || 0; // main GST%
    console.log(sessionGst);

    if (company === supplier) {
      console.log('Both states SAME → CGST + SGST apply');

      this.showCGST = true;
      this.showSGST = true;
      this.showGST = false;

      //  Split GST into CGST + SGST
      const half = sessionGst / 2;

      // Update all grid rows
      this.debitFormData.NOTE_DETAIL?.forEach((row: any) => {
        row.CGST = half;
        row.SGST = half;
        row.GST = 0; // GST becomes zero in same-state case
      });
    } else {
      console.log('States DIFFERENT → GST applies');

      this.showGST = true;
      this.showCGST = false;
      this.showSGST = false;

      // ⭐ GST only
      this.debitFormData.NOTE_DETAIL?.forEach((row: any) => {
        row.GST = sessionGst;
        row.CGST = 0;
        row.SGST = 0;
      });
    }
    this.selectedSupplier = selectedSupplier;

    if (this.selectedSupplierId) {
      this.debitFormData.PARTY_NAME = this.selectedSupplier.DESCRIPTION;
      console.log(this.selectedSupplier.DESCRIPTION, 'PARTYNAMEEEEEEEEEEEEEE');
    }

    if (this.selectedSupplierId) {
      this.debitFormData.SUPP_ID = this.selectedSupplierId;

      this.getPendingInvoices(); // Pass supplier ID here
    } else {
      // this.pendingInvoicelist = [];
    }
  }

  //   onSupplierChanged(event: any) {
  //   console.log(event, 'eventttttttttttttttttttttttttttttttttt');
  //   const selectedSupplierId = event.value;

  // }

  selectInvoice(e: any) {
    console.log('Invoice selected:', e);
    const selected = e.data;
    this.debitFormData.INVOICE_NO = String(selected.INVOICE_NO);
    this.debitFormData.DUE_AMOUNT = selected.PENDING_AMOUNT;
    this.debitFormData.INVOICE_ID = selected.BILL_ID;

    this.invoicePopupVisible = false;
  }

  getPendingInvoices(savedData?: any) {
    const payload = {
      SUPP_ID: this.selectedSupplierId,
      COMPANY_ID: this.selectedCompanyId,
    };

    this.dataService
      .getPendingInvoiceforDebit(payload)
      .subscribe((response: any) => {
        this.pendingInvoicelist = response.Data || [];

        // ✅ Ensure saved invoice is included
        if (savedData && savedData.INVOICE_NO) {
          const exists = this.pendingInvoicelist.some(
            (inv: any) =>
              String(inv.INVOICE_NO) === String(savedData.INVOICE_NO),
          );

          if (!exists) {
            this.pendingInvoicelist = [
              ...this.pendingInvoicelist,
              {
                INVOICE_NO: String(savedData.INVOICE_NO),
                BILL_ID: savedData.INVOICE_ID,
                NET_AMOUNT: savedData.DUE_AMOUNT,
              },
            ];
          }
        }

        // ✅ Re-assign after list ready so dx-select-box can bind
        if (savedData) {
          this.invoiceNo = String(savedData.INVOICE_NO);
        }
      });
  }

  // getPendingInvoices() {
  //   const payload = {
  //     SUPP_ID: this.selectedSupplierId,
  //   };

  //   this.dataService
  //     .getPendingInvoiceforDebit(payload)
  //     .subscribe((response: any) => {
  //       this.pendingInvoicelist = response.Data;
  //       if (this.debitFormData?.length) {
  //         this.invoiceNo = String(this.debitFormData[0].INVOICE_NO);
  //       }
  //     });
  // }

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

  // getLedgerCodeDropdown() {
  //   this.dataService.getAccountHeadList().subscribe((response: any) => {
  //     this.ledgerList = response.Data;
  //          //   });
  // }

  getLedgerCodeDropdown(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dataService.getActiveLedger().subscribe({
        next: (response: any) => {
          this.ledgerList = response.Data;
          resolve(this.ledgerList);
        },
        error: (err) => reject(err),
      });
    });
  }

  onEditorPreparing(e: any) {
    if (
      e.dataField === 'SL_NO' ||
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

          // 2️⃣ Get HSN & GST from session
          const sessionData = JSON.parse(
            sessionStorage.getItem('savedUserData'),
          );
          // DO NOT TOUCH GST HERE
          // GST already exists from saved data

          if (!e.row.data.HSN_CODE) {
            e.component.cellValue(
              rowIndex,
              'HSN_CODE',
              this.noteDetails[0]?.HSN_CODE || this.HSNCODE,
            );
          }

          // 5️⃣ Move to next field
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

          // validate
          if (!rowData.ledgerCode || rowData.Amount == null) {
            return;
          }

          // prevent multiple empty rows
          const lastRow = this.noteDetails[this.noteDetails.length - 1];
          if (!lastRow.ledgerCode && !lastRow.Amount) {
            return;
          }

          const nextSlNo = this.noteDetails.length + 1;

          const newRow: any = {
            SL_NO: nextSlNo,
            ledgerCode: '',
            ledgerName: '',
            particulars: '',
            Amount: null,
            gstAmount: null,
            HSN_CODE: '',
            CGST: 0,
            SGST: 0,
            GST_PERC: 0,
          };

          // ⭐ COPY TAX STRUCTURE FROM FIRST ROW
          const baseRow = this.noteDetails[0];

          if (baseRow) {
            if ((baseRow.CGST || 0) > 0 || (baseRow.SGST || 0) > 0) {
              this.showCGST = true;
              this.showSGST = true;
              this.showGST = false;

              newRow.CGST = baseRow.CGST || 0;
              newRow.SGST = baseRow.SGST || 0;
            } else {
              this.showGST = true;
              this.showCGST = false;
              this.showSGST = false;

              newRow.GST_PERC = baseRow.GST_PERC || 0;
            }

            newRow.HSN_CODE = baseRow.HSN_CODE || '';
          }

          this.noteDetails.push(newRow);

          grid.option('dataSource', [...this.noteDetails]);

          //  focus new row ledgerCode
          setTimeout(() => {
            const visibleRows = grid.getVisibleRows();
            const newRowIndex = visibleRows.findIndex((r) => r.data === newRow);

            if (newRowIndex >= 0) {
              grid.editCell(newRowIndex, 'ledgerCode');
            }
          }, 80);
        }
      };
    }
    // if (e.dataField === 'Amount') {
    //   e.editorOptions.onKeyDown = (event: any) => {
    //     if (event.event.key === 'Enter') {
    //       const grid = e.component;
    //       const rowIndex = e.row.rowIndex;
    //       // Move focus to the "ledgerCode" column in the same row
    //       setTimeout(() => {
    //         grid.focus(grid.getCellElement(rowIndex, 'GST_PERC'));
    //       });
    //     }
    //   };
    // }
    // if (e.dataField === 'GST_PERC') {
    //   e.editorOptions.onKeyDown = (event: any) => {
    //     if (event.event.key === 'Enter') {
    //       event.event.preventDefault();

    //       const grid = this.itemsGridRef?.instance;
    //       const rowData = e.row?.data;

    //       // ✅ Validate ledgerCode and Amount before proceeding
    //       if (!rowData.ledgerCode) {
    //         notify(
    //           'Please select a Ledger Code before proceeding.',
    //           'warning',
    //           2000
    //         );
    //         return;
    //       }
    //       if (rowData.Amount == null || rowData.Amount <= 0) {
    //         notify(
    //           'Please enter a valid Amount before proceeding.',
    //           'warning',
    //           2000
    //         );
    //         return;
    //       }

    //       // ✅ Ensure gstAmount is not greater than Amount
    //       if (rowData.Amount != null && event.value > rowData.Amount) {
    //         notify('GST Amount cannot be greater than Amount.', 'error', 2000);
    //         event.value = rowData.Amount;
    //         e.setCellValue(rowData, event.value);
    //         return;
    //       }

    //       // ✅ Force the editor to lose focus and commit its value
    //       const editorElement = event.event.target as HTMLElement;
    //       editorElement.blur();

    //       // ✅ Delay to let grid register the committed value
    //       setTimeout(() => {
    //         grid?.saveEditData();

    //         // ✅ Recalculate net total
    //         const rows = grid.getVisibleRows().map((r) => r.data);
    //         let netTotal = 0;
    //         for (const row of rows) {
    //           const amount = parseFloat(row.Amount) || 0;
    //           const gst = parseFloat(row.gstAmount) || 0;
    //           netTotal += amount + gst;
    //         }
    //         this.netAmountDisplay = netTotal;

    //         // ✅ Add new row only if current row is fully filled
    //         if (
    //           rowData.ledgerCode &&
    //           rowData.Amount != null &&
    //           rowData.gstAmount != null
    //         ) {
    //           // ✅ Check if last row is empty, prevent multiple empty rows
    //           const lastRow = this.noteDetails[this.noteDetails.length - 1];
    //           if (!lastRow || (lastRow.ledgerCode && lastRow.Amount != null)) {
    //             const newRow = {
    //               SL_NO: this.noteDetails.length + 1,
    //               HEAD_ID: '',
    //               AMOUNT: '',
    //               GST_AMOUNT: '',
    //               REMARKS: '',
    //             };
    //             this.noteDetails.push(newRow);

    //             setTimeout(() => {
    //               grid.option('dataSource', [...this.noteDetails]);

    //               setTimeout(() => {
    //                 const visibleRows = grid.getVisibleRows();
    //                 const newRowIndex = visibleRows.findIndex(
    //                   (r) => r.data === newRow
    //                 );
    //                 if (newRowIndex >= 0) {
    //                   grid.editCell(newRowIndex, 'ledgerCode');
    //                 }
    //               }, 50);
    //             }, 50);
    //           }
    //         }
    //       }, 50);
    //     }

    //     if (event.event.key === 'Tab') {
    //       event.event.preventDefault();
    //       const grid = this.itemsGridRef?.instance;
    //       const editorElement = event.event.target as HTMLElement;

    //       editorElement.blur();

    //       setTimeout(() => {
    //         grid?.saveEditData();

    //         // ✅ Recalculate net total
    //         const rows = grid.getVisibleRows().map((r) => r.data);
    //         let netTotal = 0;
    //         for (const row of rows) {
    //           const amount = parseFloat(row.Amount) || 0;
    //           const gst = parseFloat(row.gstAmount) || 0;
    //           netTotal += amount + gst;
    //         }
    //         this.netAmountDisplay = netTotal;

    //         setTimeout(() => {
    //           this.narrationRef?.instance?.focus();
    //         }, 50);
    //       }, 50);
    //     }
    //   };
    // }
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
  }

  onNarrationKeyDown(e: any): void {
    if (e.event.key === 'Enter' || e.event.key === 'Tab') {
      e.event.preventDefault();

      setTimeout(() => {
        this.saveButtonRef?.instance?.focus();
      }, 0);
    }
  }

  // getDocNo() {
  //   this.dataService.getDocNo().subscribe((response: any) => {
  //     this.docNo = response.DOC_NO;

  //     console.log(response.DOC_NO, 'DOCNOOOOOOOOO');
  //   });
  // }

  onSummaryCalculated(e: any): void {
    if (e.name === 'netTotal') {
      if (e.summaryProcess === 'start') {
        e.totalValue = 0;
      }
      if (e.summaryProcess === 'calculate') {
        const amount = parseFloat(e.value.Amount) || 0;
        const gst = parseFloat(e.value.gstAmount) || 0;
        e.totalValue += amount + gst;
      }
      if (e.summaryProcess === 'finalize') {
        this.netAmountDisplay = e.totalValue; // 🔹 push result into textbox
      }
    }
  }

  calculateAmount = (rowData: any): number => {
    const amt = parseFloat(rowData?.AMOUNT) || 0;
    const gst = parseFloat(rowData?.GST_AMOUNT) || 0;
    this.netAmountDisplay = amt + gst;
    return amt + gst;
  };

  cancel() {
    this.popupClosed.emit();
  }

  onApprovedChanged(e: any) {
    console.log('Checkbox value changed:', e.value);
    this.debitFormData.IS_APPROVED = e.value;
  }

  calculateTaxAmount = (rowData: any) => {
    const amount = Number(rowData.Amount) || 0;
    const gstPerc = Number(rowData.GST_PERC) || 0;
    return +((amount * gstPerc) / 100).toFixed(2);
  };

  get netAmountString(): string {
    const details = this.noteDetails || [];
    let totalAmount = 0;
    let totalGST = 0;

    details.forEach((item: any) => {
      const amount = Number(item.Amount) || 0;
      const gstPerc = Number(item.GST_PERC) || 0;

      totalAmount += amount;
      totalGST += (amount * gstPerc) / 100; // Recalculate GST live
    });
    this.net = (totalAmount + totalGST).toFixed(2);
    console.log('Net Amount (from getter):', this.net);
    return (totalAmount + totalGST).toFixed(2);
  }

  formatDate(date: any) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  updateDebitNote() {
    if (this.isUpdating) {
      return;
    }

    this.isUpdating = true;

    const details = this.noteDetails || [];
    let totalAmount = 0;
    let totalGST = 0;

    details.forEach((item: any) => {
      const amount = Number(item.Amount) || 0;
      const gstPerc = Number(item.GST_PERC) || 0;
      totalAmount += amount;
      totalGST += (amount * gstPerc) / 100;
    });

    const netAmount = totalAmount + totalGST;
    const dueAmount = Number(this.debitFormData[0]?.DUE_AMOUNT) || 0;
    console.log(this.net, dueAmount, 'NOTIFY');

    // ✅ Validation check
    if (Number(this.net) > dueAmount) {
      console.log(netAmount, dueAmount, 'NOTIFYNETAMOUNT');
      notify('Net Amount cannot exceed Due Amount.', 'error', 2500);
      return;
    }
    if (this.debitFormData.IS_APPROVED) {
      console.log('approved???????????????????????????????????');
      confirm(
        'It will approve and commit. Are you sure you want to commit?',
        'Confirm Commit',
      ).then((result) => {
        this.isUpdating = true;
        if (result) {
          const payload = {
            TRANS_ID: this.debitFormData[0].TRANS_ID,
            IS_APPROVED: true,
            TRANS_TYPE: 36,
            COMPANY_ID: this.selectedCompanyId,
            FIN_ID: this.finId,
            STORE_ID: 1,
            TRANS_DATE: this.formatDate(this.debitFormData[0].TRANS_DATE),
            TRANS_STATUS: 1,
            NARRATION: this.debitFormData[0].NARRATION,
            INVOICE_ID: this.debitFormData[0].INVOICE_ID || 0,
            INVOICE_NO: this.debitFormData[0].INVOICE_NO || '',
            SUPP_ID: this.debitFormData[0].SUPP_ID || 0,
            DISTRIBUTOR_ID: this.debitFormData[0].DISTRIBUTOR_ID || 0,
            PARTY_NAME: this.debitFormData.PARTY_NAME,
            VEHICLE_NO: this.debitFormData[0].VEHICLE_NO,
            ROUND_OFF: this.debitFormData[0].ROUND_OFF,
            NOTE_DETAIL: this.noteDetails
              .filter(
                (item) =>
                  item.ledgerCode ||
                  item.ledgerName ||
                  item.Amount ||
                  item.GST_PERC ||
                  item.gstAmount ||
                  item.particulars ||
                  item.SGST ||
                  item.CGST,
              )
              .map((item: any, index: number) => {
                const match = this.ledgerList.find(
                  (l) =>
                    l.HEAD_CODE === item.ledgerCode ||
                    l.HEAD_NAME === item.ledgerName,
                );
                const gstAmount = this.calculateTaxAmount(item);
                return {
                  SL_NO: item.SL_NO || index + 1,
                  HEAD_ID: match?.HEAD_ID || item.HEAD_ID,
                  AMOUNT: Number(item.Amount) || 0,
                  GST_PERC: Number(item.GST_PERC) || 0,
                  GST_AMOUNT: gstAmount,
                  CGST: Number(item.CGST) || 0,
                  SGST: Number(item.SGST) || 0,
                  REMARKS: item.particulars || '',
                };
              }),
          };

          // ✅ FINAL TAX CLEANUP (APPROVAL)
          payload.NOTE_DETAIL.forEach((row: any) => {
            if (row.CGST > 0 || row.SGST > 0) {
              row.GST_PERC = 0;
            } else if (row.GST_PERC > 0) {
              row.CGST = 0;
              row.SGST = 0;
            }
          });

          this.dataService.commitDebitNote(payload).subscribe(
            (response: any) => {
              if (response.flag === 1) {
                notify('Debit Note approved successfully!', 'success', 3000);
                this.popupClosed.emit(); // Close popup
                this.isUpdating = false;
              } else {
                notify(`Approval failed: ${response.Message}`, 'error', 4000);
                this.isUpdating = false;
              }
            },
            (error) => {
              console.error('Approval error:', error);
              alert('Something went wrong while approving');
              this.isUpdating = false;
            },
          );
        } else {
          // ❌ User cancelled commit
          notify('Approval cancelled.', 'info', 2000);
          this.isUpdating = false;
        }
      });
      this.isUpdating = false;
      return; // 🚫 Prevent running normal update block
    } else {
      const payload = {
        TRANS_ID: this.debitFormData[0].TRANS_ID,
        TRANS_TYPE: 36,
        COMPANY_ID: this.selectedCompanyId,
        FIN_ID: this.finId,
        STORE_ID: this.selectedstoreId,
        TRANS_DATE: this.formatDate(this.transDate),
        TRANS_STATUS: 1,
        NARRATION: this.debitFormData[0].NARRATION,
        INVOICE_ID: this.debitFormData[0].INVOICE_ID || 0,
        INVOICE_NO: this.debitFormData[0].INVOICE_NO || '',
        SUPP_ID: this.debitFormData[0].SUPP_ID || 0,
        DISTRIBUTOR_ID: this.debitFormData[0].DISTRIBUTOR_ID || 0,
        PARTY_NAME: this.debitFormData.PARTY_NAME,
        IS_APPROVED: false,
        VEHICLE_NO: this.debitFormData[0].VEHICLE_NO,
        ROUND_OFF: this.debitFormData[0].ROUND_OFF,
        NOTE_DETAIL: this.noteDetails
          .filter(
            (item) =>
              item.ledgerCode ||
              item.ledgerName ||
              item.Amount ||
              item.gstAmount ||
              item.particulars ||
              item.CGST ||
              item.SGST,
          )
          .map((item: any, index: number) => {
            const match = this.ledgerList.find(
              (l) =>
                l.HEAD_CODE === item.ledgerCode ||
                l.HEAD_NAME === item.ledgerName,
            );
            const gstAmount = this.calculateTaxAmount(item);
            return {
              SL_NO: item.SL_NO || index + 1,
              HEAD_ID: match?.HEAD_ID || item.HEAD_ID,
              AMOUNT: Number(item.Amount) || 0,
              GST_PERC: Number(item.GST_PERC) || 0,
              GST_AMOUNT: gstAmount,
              REMARKS: item.particulars || '',
              CGST: item.CGST || 0,
              SGST: item.SGST || 0,
            };
          }),
      };

      console.log('Update Payload:', payload);

      // ✅ FINAL TAX CLEANUP (UPDATE)
      payload.NOTE_DETAIL.forEach((row: any) => {
        if (row.CGST > 0 || row.SGST > 0) {
          row.GST_PERC = 0;
        } else if (row.GST_PERC > 0) {
          row.CGST = 0;
          row.SGST = 0;
        }
      });

      this.dataService.updateDebitNote(payload).subscribe((response) => {
        if (response) {
          notify(
            {
              message: 'Debit Note Updated Successfully',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );
          this.popupClosed.emit();
          this.resetDebitNoteForm();
          this.isUpdating = false;
        }
      });
    }
  }

  resetDebitNoteForm() {
    this.debitFormData = {
      TRANS_TYPE: 36,
      COMPANY_ID: 1,
      STORE_ID: 1,
      TRANS_DATE: new Date(),
      TRANS_STATUS: 1,
      SUPP_ID: '',
      NARRATION: '',
      INVOICE_ID: 0,
      INVOICE_NO: '',
      UNIT_ID: '',
      NOTE_DETAIL: [
        {
          SL_NO: '',
          HEAD_ID: '',
          AMOUNT: '',
          GST_AMOUNT: '',
          REMARKS: '',
        },
      ],
    };
  }

  calculateTotal = (row: any) => {
    console.log(row);
    const amount = Number(row.Amount) || 0;
    const gst = this.calculateTaxAmount(row) || 0;
    return amount + gst;
  };

  onRoundOffChange() {}
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
  declarations: [MiscellaneousInvoiceEditComponent],
  exports: [MiscellaneousInvoiceEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MiscellaneousInvoiceEditModule {}
