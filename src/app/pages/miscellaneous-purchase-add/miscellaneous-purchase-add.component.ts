import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
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
  DxValidationGroupComponent,
  DxDataGridComponent,
  DxTextBoxComponent,
  DxSelectBoxComponent,
  DxNumberBoxComponent,
  DxButtonComponent,
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
import DevExpress from 'devextreme';
import notify from 'devextreme/ui/notify';
import dxSelectBox from 'devextreme/ui/select_box';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-miscellaneous-purchase-add',
  templateUrl: './miscellaneous-purchase-add.component.html',
  styleUrls: ['./miscellaneous-purchase-add.component.scss']
})
export class MiscellaneousPurchaseAddComponent {
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

  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
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
  creditNoteList: any;
  ledgerList: any;
  customersList: any;
  dropdownOpened: boolean = false;
  creditFormData: any = {
    TRANS_TYPE: 37,
    COMPANY_ID: 1,
    STORE_ID: 0,
    TRANS_DATE: new Date(),
    TRANS_STATUS: 1,
    PARTY_ID: 1,
    PARTY_NAME: '',
    NARRATION: '',
    INVOICE_ID: '',
    INVOICE_NO: '',
    UNIT_ID: '',
    IS_APPROVED: false,
    ROUND_OFF: false,
    SUB_TYPE_ID: 0,
    NOTE_DETAIL: [
      {
        SL_NO: '',
        HEAD_ID: '',
        AMOUNT: '',
        GST_PERC: '',
        GST_AMOUNT: '',
        REMARKS: '',
      },
    ],
  };
  newRowAdded: boolean = false;
  private newRowIndex: number | null = null;
  customerType: 'Unit' | 'Dealer' = 'Unit'; // default selected
  companyList: any;
  selectedCompanyId: any;
  distributorList: any;
  selectedDistributorId: any;
  tempGstValue: any;
  docNo: any;
  pendingInvoices: any;
  invoicePopupVisible: boolean = false;
  customerTypes = [
    { text: 'Unit', value: 'Unit' },
    { text: 'Dealer', value: 'Dealer' },
  ];
  netAmountDisplay: number;
  selectedCustomerId: any;
  sessionData: any;
  selected_vat_id: any;
  selectedCustomer: any;
  selectedstoreId: any;
  HSN_CODE: any;
  GST_PERC: any;
  companyState: any;
  isSameState: boolean = false;
  selectedCompany: any;
  showGST: boolean = false;
  showCGST: boolean = false;
  showSGST: boolean = false;
  netAmount: any;
  companyStateID: any;
  HSNCODE: any;
  GST: any;
  netTotal: number;
  selectedInvoiceGst: number;
  selectedInvoiceHsn: any;
  subTypeList: any;
  isSaving = false;
  subType: boolean = false;
  selectedSubTypeId: any;

  constructor(
    private dataService: DataService,
    private ngZone: NgZone,
  ) {}

  ngOnInit() {
    this.sessionDetails();
    this.sessionData_tax();
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.subType = userData?.Configuration?.[0]?.SUB_TYPE_ID || 0;
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      this.companyState = selectedCompany.STATE_NAME;
      this.companyStateID = selectedCompany.STATE_ID;
      this.HSNCODE = userData.GeneralSettings.HSN_CODE;
      this.GST = userData.GeneralSettings.GST_PERC;
      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;

        this.companyList = [selectedCompany]; // Show only selected company
      }

      if (userData.USER_ID) {
        this.creditFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.creditFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
    this.creditFormData.TRANS_DATE = this.formatAsDDMMYYYY(new Date());
    this.getSupTypeList();
    this.getLedgerCodeDropdown();
    this.getCustomerOrUnitLst();
    this.getDocNo();
    this.getPendingInvoices();
    this.creditFormData.NOTE_DETAIL = [
      {
        SL_NO: 1,
        HEAD_ID: '',
        ledgerCode: '',
        ledgerName: '',
        particulars: '',
        Amount: '',
        gstAmount: '',
      },
    ];
  }

  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selectedstoreId = sessionData.Configuration[0].STORE_ID;
    this.HSN_CODE = sessionData.GeneralSettings.HSN_CODE;

    this.GST_PERC = sessionData.GeneralSettings.GST_PERC;
  }

  getSupTypeList() {
    const payload = {
      TRANS_TYPE: 37,
    };
    this.dataService
      .getSubTypeCreditNote(payload)
      .subscribe((response: any) => {
        this.subTypeList = response.Data;
      });
  }

  onSubTypeChange(e: any) {
    this.selectedSubTypeId = e.value;
    this.creditFormData.SUB_TYPE_ID = e.value;

    this.getDocNo();
  }

  private hasEmptyRow(): boolean {
    return (this.creditFormData?.NOTE_DETAIL || []).some((r: any) => {
      const hasLedger = !!r.ledgerCode;
      const hasAmount = Number(r.Amount) > 0;

      // Block only if ledger selected but amount missing
      return hasLedger && !hasAmount;
    });
  }

  addNewManualRow() {
    if (!this.creditFormData.NOTE_DETAIL) {
      this.creditFormData.NOTE_DETAIL = [];
    }
    if (this.hasEmptyRow()) {
      notify(
        'Please fill the existing empty row before adding a new one.',
        'warning',
        2000,
      );
      return;
    }
    const nextSlNo =
      this.creditFormData.NOTE_DETAIL.length > 0
        ? Math.max(...this.creditFormData.NOTE_DETAIL.map((r) => r.SL_NO)) + 1
        : 1;

    const newRow = {
      SL_NO: nextSlNo,
      ledgerCode: '',
      ledgerName: '',
      particulars: '',
      Amount: '',
      gstAmount: '',
      HEAD_ID: null,
      HSN_CODE: this.selectedInvoiceHsn || '',
    };
    this.applyGstForRow(newRow);
    // Force change detection
    this.creditFormData.NOTE_DETAIL = [
      ...this.creditFormData.NOTE_DETAIL,
      newRow,
    ];

    setTimeout(() => {
      const grid = this.itemsGridRef?.instance;
      const newRowIndex = this.creditFormData.NOTE_DETAIL.length - 1;
      grid?.editCell(newRowIndex, 'ledgerCode');
    }, 100);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (
            this.itemsGridRef?.instance &&
            (!this.creditFormData.NOTE_DETAIL ||
              this.creditFormData.NOTE_DETAIL.length === 0)
          ) {
            // ✅ Add row and focus first cell
            this.itemsGridRef.instance.addRow();

            setTimeout(() => {
              this.itemsGridRef?.instance?.editCell(0, 'ledgerCode');
            }, 100);
          } else {
            // ✅ No new row needed — focus invoiceBox and grid cell
            if (this.invoiceBoxRef?.instance) {
              this.invoiceBoxRef.instance.focus();
            }

            setTimeout(() => {
              this.itemsGridRef?.instance?.editCell(0, 'ledgerCode');
            }, 100);
          }
        });
      });
    }, 500);
  }

  formatAsDDMMYYYY(d: Date): string {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onInvoiceEnterKey(event: any): void {
    if (event.event?.key === 'Enter') {
      setTimeout(() => {
        this.customerTypeElementRef?.nativeElement?.focus();
      }, 0);
    }
  }

  applyGstForRow(row: any) {
    const gstPerc = Number(this.selectedInvoiceGst) || 0;

    // SAME STATE → CGST + SGST
    if (this.companyStateID === this.selectedCustomer?.STATE_ID) {
      const half = gstPerc / 2;

      row.CGST = half;
      row.SGST = half;
      row.GST = 0;
      row.GST_PERC = 0; // IGST not used
    } else {
      // DIFFERENT STATE → IGST
      row.GST = gstPerc;
      row.GST_PERC = gstPerc;
      row.CGST = 0;
      row.SGST = 0;
    }
  }

  onCompanySelected(event: any): void {
    const grid = this.itemsGridRef?.instance;
    const selectedId = event.value;
    this.creditFormData.UNIT_ID = selectedId;
    if (grid) {
      const editRowIndex = grid
        .getVisibleRows()
        .findIndex((row: any) => row.isEditing);
      if (editRowIndex !== -1) {
        grid.saveEditData(); // Save new row before changing company
      }
    }

    this.selectedCompanyId = event.value;
  }

  onDistributorSelected(event: any): void {
    const grid = this.itemsGridRef?.instance;

    this.selectedCustomerId = event.value;

    if (this.selectedCustomerId) {
      this.selectedCustomer = this.distributorList.find(
        (s: any) => s.ID === this.selectedCustomerId,
      );

      this.creditFormData.PARTY_NAME = this.selectedCustomer.DESCRIPTION;

      // SHOW OR HIDE GST COLUMNS
      if (this.companyStateID === this.selectedCustomer.STATE_ID) {
        // Same state → CGST + SGST
        this.showCGST = true;
        this.showSGST = true;
        this.showGST = false;
      } else {
        // Different state → GST only
        this.showGST = true;
        this.showCGST = false;
        this.showSGST = false;
      }

      // ⭐ APPLY GST LOGIC TO ALL EXISTING ROWS
      this.creditFormData.NOTE_DETAIL?.forEach((row: any) => {
        this.applyGstForRow(row);
      });
    }

    this.creditFormData.DISTRIBUTOR_ID = this.selectedCustomerId;

    // Save current row if user is editing
    if (grid) {
      const editRowIndex = grid
        .getVisibleRows()
        .findIndex((row: any) => row.isEditing);

      if (editRowIndex !== -1) {
        grid.saveEditData();
      }
    }

    this.selectedDistributorId = event.value;
  }

  // onDistributorSelected(event: any): void {
  //   const grid = this.itemsGridRef?.instance;
  //   this.selectedCustomerId = event.value;
  //   if (this.selectedCustomerId) {
  //     this.selectedCustomer = this.distributorList.find(
  //       (s: any) => s.ID === this.selectedCustomerId
  //     );
  //     this.creditFormData.PARTY_NAME = this.selectedCustomer.DESCRIPTION;
  //     console.log(this.selectedCustomer.DESCRIPTION, 'PARTYNAMEEEEEEEEEEEEEE');
  //     console.log(this.selectedCustomer.STATE_ID, 'SELECTED CUSTOMER STATE ID');
  //     const sessionGst = parseFloat(this.GST) || 0;
  //     if (this.companyStateID === this.selectedCustomer.STATE_ID) {
  //       console.log('Both states SAME → CGST + SGST apply');

  //       this.showCGST = true;
  //       this.showSGST = true;
  //       this.showGST = false;

  //       //  Split GST into CGST + SGST
  //       const half = sessionGst / 2;

  //       // Update all grid rows
  //       this.creditFormData.NOTE_DETAIL?.forEach((row: any) => {
  //         this.applyGstForRow(row);
  //       });
  //     } else {
  //       console.log('States DIFFERENT → GST applies');

  //       this.showGST = true;
  //       this.showCGST = false;
  //       this.showSGST = false;

  //       // ⭐ GST only
  //       this.creditFormData.NOTE_DETAIL?.forEach((row: any) => {
  //         this.applyGstForRow(row);
  //       });
  //     }
  //   }
  //   this.creditFormData.DISTRIBUTOR_ID = this.selectedCustomerId;
  //   if (grid) {
  //     const editRowIndex = grid
  //       .getVisibleRows()
  //       .findIndex((row: any) => row.isEditing);
  //     if (editRowIndex !== -1) {
  //       grid.saveEditData(); // Save new row before changing distributor
  //     }
  //   }

  //   this.selectedDistributorId = event.value;
  // }

  onInitNewRow(e: any): void {
    this.newRowIndex = e.component.getRowIndexByKey(e.key);
  }

  onCustomerTypeChanged(event: any): void {
    setTimeout(() => {
      if (this.newRowIndex !== null) {
        this.itemsGridRef?.instance?.editCell(this.newRowIndex, 'SL_NO'); // or first editable column
      }
    }, 100);
  }

  onCustomerTypeKeyDown(event: any): void {
    if (event.event?.key === 'Enter') {
      setTimeout(() => {
        this.customerType = this.customerType === 'Unit' ? 'Dealer' : 'Unit';
      }, 100); // Small delay to allow row commit
    }
  }

  onCustomerKeyDown(event: any, type: 'Unit' | 'Dealer'): void {
    const instance = event.component;
    const grid = this.itemsGridRef?.instance;

    if (event.event?.key === 'Enter') {
      grid?.saveEditData(); // ✅ Commit pending grid changes

      if (!this.dropdownOpened) {
        this.dropdownOpened = true;
        setTimeout(() => instance.open(), 0);
      } else {
        this.dropdownOpened = false;
        setTimeout(() => {
          instance.close?.();
          setTimeout(() => this.dueAmountRef?.instance?.focus?.(), 0);
        }, 100);
      }
    }
  }

  onCustomerDropdownOpened() {
    this.dropdownOpened = true;
  }
  onCustomerSelected(e: any): void {
    if (!this.dropdownOpened) return;

    setTimeout(() => {
      if (this.customerType === 'Unit' && this.customerRef?.instance?.close) {
        this.customerRef.instance.close();
      } else if (
        this.customerType === 'Dealer' &&
        this.distributorRef?.instance?.close
      ) {
        this.distributorRef.instance.close();
      }
      this.dropdownOpened = false;
    }, 100);
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

  calculateTaxAmount = (row: any) => {
    const amount = Number(row.Amount) || 0;

    // SAME STATE → CGST + SGST applies
    if (this.companyStateID === this.selectedCustomer?.STATE_ID) {
      const cgst = Number(row.CGST) || 0;
      const sgst = Number(row.SGST) || 0;

      // Total GST% = CGST% + SGST%
      const totalGstPerc = cgst + sgst;

      return +((amount * totalGstPerc) / 100).toFixed(2);
    }

    // DIFFERENT STATE → IGST applies
    const gstPerc = Number(row.GST_PERC) || 0;
    return +((amount * gstPerc) / 100).toFixed(2);
  };

  calculateTotalAmount = (row: any) => {
    const amount = Number(row.Amount) || 0;
    const gstAmount = this.calculateTaxAmount(row); // IGST or CGST+SGST
    return +(amount + gstAmount).toFixed(2);
  };

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

    // ➤ ledgerCode: open dropdown on Enter, move to ledgerName on second Enter
    // if (e.dataField === 'ledgerCode') {
    //   let enterPressedOnce = false;

    //   e.editorOptions.onKeyDown = (event: any) => {
    //     if (event.event.key === 'Enter') {
    //       event.event.preventDefault();

    //       if (!enterPressedOnce) {
    //         enterPressedOnce = true;
    //         setTimeout(() => {
    //           if (event.component?.open) {
    //             event.component.open(); // open dropdown
    //           }
    //         }, 50);
    //       } else {
    //         enterPressedOnce = false;
    //         setTimeout(() => {
    //           this.itemsGridRef?.instance?.editCell(rowIndex, 'particulars');
    //         }, 50);
    //       }
    //     }
    //   };

    //   e.editorOptions.onValueChanged = (args: any) => {
    //     const selectedLedger = this.ledgerList.find(
    //       (item: any) => item.HEAD_CODE === args.value
    //     );

    //     e.setValue(args.value);

    //     if (selectedLedger) {
    //       // 1️⃣ Set ledger name
    //       e.component.cellValue(
    //         rowIndex,
    //         'ledgerName',
    //         selectedLedger.HEAD_NAME
    //       );

    //       // 2️⃣ Get HSN & GST from session
    //       const sessionData = JSON.parse(
    //         sessionStorage.getItem('savedUserData')
    //       );
    //       const hsnCode = sessionData?.GeneralSettings?.HSN_CODE;
    //       const gstPerc = sessionData?.GeneralSettings?.GST_PERC;

    //       // 3️⃣ Set HSN_CODE
    //       e.component.cellValue(rowIndex, 'HSN_CODE', hsnCode);

    //       // 4️⃣ Set GST_PERC
    //       e.component.cellValue(rowIndex, 'GST_PERC', gstPerc);

    //       // 5️⃣ Move to next field
    //       setTimeout(() => {
    //         this.itemsGridRef?.instance?.editCell(rowIndex, 'particulars');
    //       }, 50);
    //     }
    //   };
    // }

    if (e.dataField === 'ledgerCode') {
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

          // 2️⃣ Set HSN FROM SELECTED INVOICE
          e.component.cellValue(rowIndex, 'HSN_CODE', this.selectedInvoiceHsn);

          // 3️⃣ Apply GST FROM SELECTED INVOICE
          this.applyGstForRow(e.row.data);

          // 4️⃣ Move focus
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
          const grid = e.component;
          const rowIndex = e.row.rowIndex;
          // Move focus to the "ledgerCode" column in the same row
          setTimeout(() => {
            grid.focus(grid.getCellElement(rowIndex, 'GST_PERC'));
          });
        }
      };
    }
    if (e.dataField === 'Amount') {
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          event.event.preventDefault();

          const grid = this.itemsGridRef?.instance;
          const rowIndex = e.row.rowIndex;

          // ✅ Commit value and update totals
          const editorElement = event.event.target as HTMLElement;
          editorElement.blur();

          setTimeout(() => {
            grid?.saveEditData();
            const rows = grid.getVisibleRows().map((r) => r.data);
            let netTotal = 0;
            for (const row of rows) {
              const amount = parseFloat(row.Amount) || 0;
              const gst = parseFloat(row.gstAmount) || 0;
              netTotal += amount + gst;
            }
            this.netAmountDisplay = netTotal;

            // ✅ Add new empty row

            if (!this.hasEmptyRow()) {
              const grid = this.itemsGridRef?.instance;
              const newRow = {
                SL_NO: this.creditFormData.NOTE_DETAIL.length + 1,
                ledgerCode: '',
                ledgerName: '',
                particulars: '',
                Amount: '',
                GST_PERC: '',
                GST: 0,
                CGST: 0,
                SGST: 0,
                gstAmount: '',
                HEAD_ID: null,
              };
              this.applyGstForRow(newRow);
              this.creditFormData.NOTE_DETAIL.push(newRow);

              // ✅ Force rebind and refresh the grid
              grid.option('dataSource', [...this.creditFormData.NOTE_DETAIL]);
              grid.refresh();

              // ✅ Wait a bit longer to ensure row is rendered before focusing
              setTimeout(() => {
                const visibleRows = grid.getVisibleRows();
                const newRowIndex = visibleRows.findIndex(
                  (r) => r.data === newRow,
                );

                if (newRowIndex >= 0) {
                  // Small extra delay for rendering safety
                  setTimeout(() => {
                    grid.editCell(newRowIndex, 'ledgerCode');
                  }, 50);
                }
              }, 100);
            }
          }, 50);
        }

        if (event.event.key === 'Tab') {
          event.event.preventDefault();

          const grid = this.itemsGridRef?.instance;
          const editorElement = event.event.target as HTMLElement;
          editorElement.blur();

          setTimeout(() => {
            grid?.saveEditData();
            const rows = grid.getVisibleRows().map((r) => r.data);
            let netTotal = 0;
            for (const row of rows) {
              const amount = parseFloat(row.Amount) || 0;
              const gst = parseFloat(row.gstAmount) || 0;
              netTotal += amount + gst;
            }
            this.netAmountDisplay = netTotal;
            setTimeout(() => {
              this.narrationRef?.instance?.focus();
            }, 50);
          }, 50);
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
  }

  onRowInserted(e: any): void {
    if (this.newRowAdded) {
      this.newRowAdded = false;

      setTimeout(() => {
        const visibleRows = this.itemsGridRef?.instance?.getVisibleRows();
        const lastRow = visibleRows[visibleRows.length - 1];
        const newRowIndex = lastRow.rowIndex;

        this.itemsGridRef?.instance?.editCell(newRowIndex, 'SL_NO');
      }, 100);
    }
  }

  onNarrationKeyDown(event: any): void {
    if (event.event?.key === 'Enter') {
      setTimeout(() => {
        this.saveButtonRef?.instance?.focus?.();
      }, 0);
    }
  }

  // getCompanyListDropdown() {
  //   this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
  //     this.distributorList = response;
  //     console.log(this.distributorList, 'distributorList');
  //   });
  // }

  getCustomerOrUnitLst() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService
      .getCustomerWithState(payload)
      .subscribe((response: any) => {
        this.distributorList = response;
        // this.cdr.detectChanges();
      });
  }

  openInvoicePopup() {
    this.getPendingInvoices(); // Ensure you load fresh data
    this.invoicePopupVisible = true;
  }

  getPendingInvoices() {
    const payload = {
      CUST_ID: this.selectedCustomerId, // or customerId if you pass it
      COMPANY_ID: this.selectedCompanyId,
    };

    this.dataService
      .getPendingInvoiceList(payload)
      .subscribe((response: any) => {
        this.pendingInvoices = response.Data;
      });
  }

  // selectInvoice(e: any) {
  //   console.log('Invoice selected:', e);
  //   const selected = e.data;
  //   this.creditFormData.INVOICE_NO = selected.INVOICE_NO;
  //   this.creditFormData.DUE_AMOUNT = selected.BALANCE_AMOUNT;
  //   this.creditFormData.INVOICE_ID = selected.INVOICE_ID;
  //   console.log(this.creditFormData.INVOICE_ID, 'INVOICEIDDDDDDDDDDDDDDDD');
  //   this.invoicePopupVisible = false;
  // }

  selectInvoice(e: any) {
    const selected = e.data;

    this.creditFormData.INVOICE_NO = selected.INVOICE_NO;
    this.creditFormData.DUE_AMOUNT = selected.BALANCE_AMOUNT;
    this.creditFormData.INVOICE_ID = selected.INVOICE_ID;

    // ✅ STORE GST & HSN FROM INVOICE
    this.selectedInvoiceGst = Number(selected.GST_PERC) || 0;
    this.selectedInvoiceHsn = selected.HSN_CODE || '';

    // ✅ APPLY TO ALL EXISTING ROWS
    this.creditFormData.NOTE_DETAIL?.forEach((row: any) => {
      row.HSN_CODE = this.selectedInvoiceHsn;
      this.applyGstForRow(row);
    });

    this.invoicePopupVisible = false;

    // refresh grid
    setTimeout(() => {
      this.itemsGridRef?.instance?.refresh();
    }, 0);
  }

  getDocNo() {
    const payload = {
      TRANS_TYPE: 37,
      SUB_TYPE_ID: this.selectedSubTypeId || 0,
      COMPANY_ID: this.selectedCompanyId,
    };

    this.dataService.getDocNo(payload).subscribe((response: any) => {
      this.docNo = response.DOC_NO;

      // force UI refresh
      setTimeout(() => {
        this.docNo = response.DOC_NO;
      });
    });
  }

  addDefaultRow(): void {
    if (this.itemsGridRef?.instance) {
      this.itemsGridRef.instance.addRow();
    } else {
    }
  }

  callAPI(finalPayload: any) {
    if (this.isSaving) {
      return;
    }
    this.isSaving = true;
    this.dataService.insertCreditNote(finalPayload).subscribe(
      (response: any) => {
        notify(
          {
            message: 'Credit Note Saved Successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );

        // DO NOT REMOVE — Needed for auto-setting voucher number
        if (response?.VoucherNo) {
          this.creditFormData.VOUCHER_NO = response.VoucherNo;
        }

        // Reset form but keep newly assigned voucher number
        this.resetCreditNoteForm();

        // Close popup
        this.popupClosed.emit();
        this.isSaving = false;
      },
      (error) => {
        notify('Failed to save Credit Note. Please try again.', 'error', 2000);
        console.error('Save error:', error);
        this.isSaving = false;
      },
    );
  }

  saveCreditNote(): void {
    this.itemsGridRef?.instance?.saveEditData();

    const gridData = this.itemsGridRef?.instance
      ?.getVisibleRows()
      .map((r) => r.data);
    const details = this.creditFormData.NOTE_DETAIL || [];
    let totalAmount = 0;
    let totalGST = 0;

    details.forEach((item: any) => {
      const amount = Number(item.Amount) || 0;
      const gstPerc = Number(item.GST_PERC) || 0;
      totalAmount += amount;
      totalGST += (amount * gstPerc) / 100;
    });

    const netAmount = totalAmount + totalGST;
    const dueAmount = Number(this.creditFormData?.DUE_AMOUNT) || 0;

    // Validation check
    if (netAmount > dueAmount) {
      notify('Net Amount cannot exceed Due Amount.', 'error', 2500);
      return;
    }
    // --- Validations ---
    if (!this.creditFormData.SUB_TYPE_ID) {
      notify(
        {
          message: 'Please select a sub type.',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
        3000,
      );
      return;
    }
    if (!this.creditFormData.INVOICE_NO) {
      notify(
        {
          message: 'Please select an invoice before saving.',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
        3000,
      );
      return;
    }

    if (!this.creditFormData.DISTRIBUTOR_ID) {
      notify(
        {
          message: 'Please select customer before saving.',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
        3000,
      );
      return;
    }

    // --- Build NOTE_DETAIL array ---
    this.creditFormData.NOTE_DETAIL = gridData
      .filter(
        (row: any) =>
          row.ledgerCode ||
          row.ledgerName ||
          row.Amount ||
          row.GGST_PERC ||
          row.particulars,
      )
      .map((row: any, index: number) => {
        const ledger = this.ledgerList.find(
          (item: any) => item.HEAD_CODE === row.ledgerCode,
        );

        const amount = Number(row.Amount) || 0;
        const isSameState =
          this.companyStateID === this.selectedCustomer?.STATE_ID;

        let gstPerc = 0;
        let gstAmount = 0;
        let cgst = 0;
        let sgst = 0;

        if (isSameState) {
          //  CGST + SGST mode
          cgst = Number(row.CGST) || 0;
          sgst = Number(row.SGST) || 0;

          const totalGstPerc = cgst + sgst;
          gstPerc = 0; // IGST not applicable
          gstAmount = Number(((amount * totalGstPerc) / 100).toFixed(2));
        } else {
          //  IGST mode
          gstPerc = Number(row.GST_PERC) || 0;
          gstAmount = Number(((amount * gstPerc) / 100).toFixed(2)); // FIXED
          cgst = 0;
          sgst = 0;
        }

        return {
          SL_NO: row.SL_NO || index + 1,
          HEAD_ID: ledger?.HEAD_ID || null,
          AMOUNT: amount,

          // Passing GST breakup
          GST_PERC: gstPerc, // Only IGST or 0
          CGST: cgst, // Only in same-state
          SGST: sgst, // Only in same-state

          GST_AMOUNT: gstAmount, // ALWAYS combined amount

          REMARKS: row.particulars || '',
        };
      });

    // --- Validate that at least one valid row exists ---
    if (
      !this.creditFormData.NOTE_DETAIL ||
      this.creditFormData.NOTE_DETAIL.length === 0
    ) {
      notify(
        {
          message: 'Please add at least one valid row before saving.',
          position: { at: 'top right', my: 'top right' },
        },
        'error',
        3000,
      );
      return;
    }

    // --- Add logged-in user context ---
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.creditFormData.COMPANY_ID =
        this.selectedCompanyId || userData?.Companies?.[0]?.COMPANY_ID || null;
      this.creditFormData.FIN_ID =
        userData?.FINANCIAL_YEARS?.[0]?.FIN_ID || null;
      this.creditFormData.UNIT_ID =
        this.selectedCompanyId || userData?.Companies?.[0]?.COMPANY_ID || null;
      this.creditFormData.STORE_ID =
        this.selectedstoreId || userData?.Configuration?.[0]?.STORE_ID || null;
      this.creditFormData.ROUND_OFF = this.creditFormData.ROUND_OFF;
      this.creditFormData.VEHICLE_NO = this.creditFormData.VEHICLE_NO;
    }

    // --- Save data ---
    if (this.creditFormData.IS_APPROVED) {
      const result = confirm(
        'A new Credit Note will be created and approved. Do you want to continue?',
        'Confirm Approval',
      );

      result.then((dialogResult: any) => {
        if (dialogResult) {
          this.ngZone.run(() => {
            this.callAPI(this.creditFormData);
          });
        }
      });

      return;
    }

    // Normal flow (Not Approved)
    this.callAPI(this.creditFormData);
  }
  get netAmountString(): string {
    const details = this.creditFormData?.NOTE_DETAIL || [];
    let totalAmount = 0;
    let totalGST = 0;

    const isSameState = this.companyStateID === this.selectedCustomer?.STATE_ID;

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
    if (this.creditFormData.ROUND_OFF) {
      this.netTotal = Math.round(this.netTotal);
    }
    return this.netTotal.toFixed(2);
  }

  onRowRemoving(e: any) {
    const index = this.creditFormData.NOTE_DETAIL.indexOf(e.data);

    if (index > -1) {
      this.creditFormData.NOTE_DETAIL.splice(index, 1);
    }

    // 🔥 Force datasource refresh
    this.itemsGridRef.instance.option('dataSource', [
      ...this.creditFormData.NOTE_DETAIL,
    ]);

    // 🔥 Force recalculation
    this.itemsGridRef.instance.refresh();
  }

  onRoundOffChange() {
    if (this.creditFormData.ROUND_OFF) {
      // Round Off Enabled
      this.netAmount = Math.round(this.netTotal).toFixed(2);
    } else {
      // Round Off Disabled → return to original value
      this.netAmount = Number(this.netTotal).toFixed(2);
    }
  }

  // get netAmountString(): string {
  //   const details = this.creditFormData?.NOTE_DETAIL || [];
  //   let totalAmount = 0;
  //   let totalGST = 0;

  //   details.forEach((item: any) => {
  //     totalAmount += parseFloat(item.Amount || 0);
  //     totalGST += parseFloat(item.gstAmount || 0);
  //   });

  //   return (totalAmount + totalGST).toFixed(2); // return string
  // }

  resetCreditNoteForm() {
    this.creditFormData = {
      TRANS_TYPE: 37,
      COMPANY_ID: 1,
      STORE_ID: 0,
      TRANS_DATE: new Date(),
      TRANS_STATUS: 1,
      PARTY_ID: 1,
      PARTY_NAME: '',
      NARRATION: '',
      INVOICE_ID: '',
      INVOICE_NO: '',
      NOTE_DETAIL: [
        {
          SL_NO: '',
          HEAD_ID: '',
          AMOUNT: '',
          VAT_AMOUNT: '',
          REMARKS: '',
        },
      ],
    };
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
  ],
  providers: [],
  declarations: [MiscellaneousPurchaseAddComponent],
  exports: [MiscellaneousPurchaseAddComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MiscellaneousPurchaseAddModule {}