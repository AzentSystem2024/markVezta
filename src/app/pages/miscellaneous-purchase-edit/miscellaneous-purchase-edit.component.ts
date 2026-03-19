import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
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
  DxDataGridComponent,
  DxValidationGroupComponent,
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
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-miscellaneous-purchase-edit',
  templateUrl: './miscellaneous-purchase-edit.component.html',
  styleUrls: ['./miscellaneous-purchase-edit.component.scss'],
})
export class MiscellaneousPurchaseEditComponent {
  @Output() popupClosed = new EventEmitter<void>();
  // @Input() creditFormData: any;
  private _creditFormData: any;
  creditHeader!: any;

  @Input()
  set creditFormData(value: any) {
    if (!value || !value.length) return;

    const cloned = structuredClone(value);
    this._creditFormData = cloned;
    this.creditHeader = cloned[0]; // ⭐ SINGLE SOURCE
  }
  get creditFormData() {
    return this._creditFormData;
  }

  // @ViewChild(DxDataGridComponent, { static: true })
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;

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
  popupVisible = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  creditNoteList: any;
  ledgerList: any;
  customersList: any;
  dropdownOpened: boolean = false;
  customerType: 'Unit' | 'Dealer' = 'Unit';
  distributorList: any;
  selectedDistributorId: any;
  companyList: any;
  selectedCompanyId: any;
  invoiceNo: any;
  narration: string = '';
  transDate: Date | string | number | null = null;
  dueAmount: number = 0;
  itemsGridData: any[] = [];
  noteDetails: any[] = [];
  newRowAdded: boolean = false;
  newRowIndex: any;
  pendingInvoices: any;
  invoicePopupVisible: boolean = false;
  userId: any;
  finId: any;
  selectedCustomerId: any;
  selectedInvoice: string;
  sessionData: any;
  selected_vat_id: any;
  selectedstoreId: any;
  HSNCODE: any;
  hsnLoaded: boolean;
  GST: any;
  companyState: any;
  isSameState: boolean = false;
  selectedCompany: any;
  showGST: boolean = false;
  showCGST: boolean = false;
  showSGST: boolean = false;
  netAmount: any;
  companyStateID: any;
  netTotal: number;
  customerStateID: any;
  selectedCustomer: any;
  roundedNetAmount: number = 0;
  isUpdating = false;
  subType: boolean = false;
  subTypeList: any;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    this.subType = userData.Configuration[0].SUB_TYPE_ID;
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      console.log(userData, selectedCompany, 'USERDATAAAAAAAAAAAAAAAAA');
      this.companyState = selectedCompany.STATE_NAME;
      this.companyStateID = selectedCompany.STATE_ID;
      console.log(this.companyStateID, 'USERDATASTRINGGGGGGGGGGGGGG');
      if (selectedCompany?.COMPANY_ID) {
        this.companyList = [selectedCompany]; // Show only selected company
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
        this.selectedCompany = selectedCompany;
      }

      // Also store USER_ID / FIN_ID if needed later
      this.userId = userData.USER_ID;
      this.finId = userData.FINANCIAL_YEARS?.[0]?.FIN_ID;
    }
    console.log(this.creditFormData, 'NGONINIT');
    this.getCompanyListDropdown();
    this.getLedgerCodeDropdown();
    // this.getPendingInvoices();
    this.sessionData_tax();
    this.sessionDetails();
  }

  sessionDetails() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selectedstoreId = sessionData.Configuration[0].STORE_ID;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['creditFormData'] && this.creditFormData?.length) {
      const data = this.creditFormData[0];
      console.log(this.creditFormData, 'CREDITFORMDATAAAAAAAAAAAAAA=====');

      setTimeout(() => {
        this.itemsGridRef?.instance?.beginCustomLoading('Loading...');
      });

      /* ---------------- Header bindings ---------------- */
      this.invoiceNo = String(data.INVOICE_NO);
      this.transDate = new Date(data.TRANS_DATE);

      console.log('EDIT → DISTRIBUTOR_ID:', data.DISTRIBUTOR_ID);
      console.log('EDIT → COMPANY_STATE_ID:', this.companyStateID);

      console.log('+++++++++______', data.NOTE_DETAIL);

      /* ---------------- Customer dropdown ---------------- */
      this.getCompanyListDropdown(data.DISTRIBUTOR_ID);

      /* ---------------- Grid binding ---------------- */
      this.getLedgerCodeDropdown()
        .then(() => {
          console.log('SELECT NOTE_DETAIL:', data.NOTE_DETAIL);

          this.noteDetails = (data.NOTE_DETAIL || []).map((item: any) => {
            const ledger = this.ledgerList.find(
              (l: any) => l.HEAD_ID === item.HEAD_ID,
            );

            return {
              SL_NO: item.SL_NO,
              ledgerCode: ledger?.HEAD_CODE || '',
              ledgerName: ledger?.HEAD_NAME || '',
              particulars: item.REMARKS || '',
              Amount: item.AMOUNT || '',
              GST_PERC: item.GST_PERC ?? 0,
              CGST: item.CGST ?? 0,
              SGST: item.SGST ?? 0,
              gstAmount: item.GST_AMOUNT ?? 0,
              HSN_CODE: item.HSN_CODE,
              HEAD_ID: item.HEAD_ID,
              _isExisting: true,
            };
          });
          console.log(this.noteDetails, 'NOTE DETAILS');
          this.cdr.detectChanges();
        })
        .finally(() => {
          // 🟢 STOP GRID LOADING
          this.itemsGridRef?.instance?.endCustomLoading();
        });

      /* ---------------- Pending invoice ---------------- */
      this.getPendingInvoices(data);

      /* ---------------- GST VISIBILITY LOGIC ---------------- */
      const interval = setInterval(() => {
        if (this.distributorList?.length) {
          clearInterval(interval);

          const distributor = this.distributorList.find(
            (d: any) => d.ID === data.DISTRIBUTOR_ID,
          );

          if (!distributor) {
            console.warn('Distributor not found for ID:', data.DISTRIBUTOR_ID);
            return;
          }

          const distributorStateId = distributor.STATE_ID;
          const companyStateId = this.companyStateID;

          console.log('Distributor STATE_ID:', distributorStateId);
          console.log('Company STATE_ID:', companyStateId);

          if (companyStateId === distributorStateId) {
            // ✅ SAME STATE → CGST + SGST
            this.showCGST = true;
            this.showSGST = true;
            this.showGST = false;

            console.log('GST MODE → CGST + SGST');
          } else {
            // ✅ DIFFERENT STATE → IGST
            this.showGST = true;
            this.showCGST = false;
            this.showSGST = false;

            console.log('GST MODE → IGST');
          }

          // Refresh grid to apply column visibility
          setTimeout(() => {
            this.itemsGridRef?.instance?.refresh();
          }, 0);
        }
      }, 50);
    }
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

  getCompanyListDropdown(selectedDistributorId?: number): void {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
    };

    this.dataService
      .getCustomerWithState(payload)
      .subscribe((response: any) => {
        this.distributorList = response || [];
        console.log('Distributor list:', this.distributorList);

        if (selectedDistributorId) {
          this.selectedDistributorId = selectedDistributorId;
          console.log('Distributor bound:', this.selectedDistributorId);

          // ✅ FIND SELECTED DISTRIBUTOR
          const selectedDistributor = this.distributorList.find(
            (d: any) => d.ID === selectedDistributorId,
          );
          if (selectedDistributor) {
            this.selectedCustomer = selectedDistributor; // ✅ IMPORTANT
          }
          if (selectedDistributor) {
            console.log(
              'Selected Distributor State ID:',
              selectedDistributor.STATE_ID,
            );
            console.log(
              'Selected Distributor State Name:',
              selectedDistributor.STATE_NAME,
            );
          } else {
            console.warn('Selected distributor not found in distributorList');
          }
        }

        this.cdr.detectChanges();
      });
  }

  getCustomerOrUnitLst() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService
      .getCustomerWithState(payload)
      .subscribe((response: any) => {
        this.distributorList = response;
      });
  }
  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  private hasEmptyRow(): boolean {
    return (this.noteDetails || []).some((r: any) => {
      const hasAmount = Number(r.Amount) > 0;
      const hasLedger = !!r.ledgerCode || !!r.ledgerName;

      const hasIGST = Number(r.GST_PERC) > 0;
      const hasCGSTSGST = Number(r.CGST) > 0 || Number(r.SGST) > 0;

      return !hasLedger && !hasAmount && !hasIGST && !hasCGSTSGST;
    });
  }

  applyGstForRow(row: any) {
    if (
      row.CGST !== undefined ||
      row.SGST !== undefined ||
      row.GST_PERC !== undefined
    ) {
      // saved row → DO NOTHING
      return;
    }

    row.GST_PERC = 0;
    row.CGST = 0;
    row.SGST = 0;
  }

  addNewManualRow() {
    if (!this.noteDetails) {
      this.noteDetails = [];
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
      this.noteDetails.length > 0
        ? Math.max(...this.noteDetails.map((r) => r.SL_NO)) + 1
        : 1;

    // 🔥 TAKE GST FROM FIRST EXISTING ROW (EDIT MODE SOURCE)
    const baseRow = this.noteDetails[0] || {};

    const newRow = {
      SL_NO: nextSlNo,
      ledgerCode: '',
      ledgerName: '',
      particulars: '',
      Amount: '',
      GST_PERC: baseRow.GST_PERC || 0, // ✅ COPY IGST
      CGST: baseRow.CGST || 0, // ✅ COPY CGST
      SGST: baseRow.SGST || 0, // ✅ COPY SGST
      gstAmount: '',
      HEAD_ID: null,
    };

    // ✅ This now works because GST values exist
    // this.applyGstForRow(newRow);

    this.noteDetails = [...this.noteDetails, newRow];

    setTimeout(() => {
      const grid = this.itemsGridRef?.instance;
      const newRowIndex = this.noteDetails.length - 1;
      grid?.editCell(newRowIndex, 'ledgerCode');
    }, 100);
  }

  // addNewManualRow() {
  //   if (!this.noteDetails) {
  //     this.noteDetails = [];
  //   }
  //   if (this.hasEmptyRow()) {
  //     notify(
  //       'Please fill the existing empty row before adding a new one.',
  //       'warning',
  //       2000
  //     );
  //     return;
  //   }
  //   const nextSlNo =
  //     this.noteDetails.length > 0
  //       ? Math.max(...this.noteDetails.map((r) => r.SL_NO)) + 1
  //       : 1;

  //   const newRow = {
  //     SL_NO: nextSlNo,
  //     ledgerCode: '',
  //     ledgerName: '',
  //     particulars: '',
  //     Amount: '',
  //     gstAmount: '',
  //     HEAD_ID: null,
  //   };

  //   // Force change detection
  //   this.noteDetails = [...this.noteDetails, newRow];
  //   setTimeout(() => {
  //     const grid = this.itemsGridRef?.instance;
  //     const newRowIndex = this.noteDetails.length - 1;
  //     grid?.editCell(newRowIndex, 'ledgerCode');
  //   }, 100);
  // }

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

  handleCustomerType(response: any): void {
    const data = response?.Data?.[0];
    if (!data) return;

    if (data.UNIT_ID && data.UNIT_ID !== 0) {
      this.customerType = 'Unit';
      this.selectedCompanyId = data.UNIT_ID;
      this.selectedDistributorId = null; // Clear distributor
    } else if (data.DISTRIBUTOR_ID && data.DISTRIBUTOR_ID !== 0) {
      this.customerType = 'Dealer';
      this.selectedDistributorId = data.DISTRIBUTOR_ID;
      this.selectedCompanyId = null; // Clear unit
    }
  }

  handleCustomerData(response: any): void {
    const data = response?.Data?.[0];
    if (!data) return;

    // UNIT case
    if (data.UNIT_ID && data.DISTRIBUTOR_ID === 0) {
      this.customerType = 'Unit';
      this.selectedCompanyId = data.UNIT_ID;
      this.selectedDistributorId = null;
    }
    // DISTRIBUTOR case
    else if (data.DISTRIBUTOR_ID && data.UNIT_ID === 0) {
      this.customerType = 'Dealer';
      this.selectedDistributorId = data.DISTRIBUTOR_ID;
      this.selectedCompanyId = null;
    }
  }

  onCustomerTypeKeyDown(event: any): void {
    if (event.event?.key === 'Enter') {
      setTimeout(() => {
        this.customerRef?.instance?.focus?.();
      }, 0);
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
    if (this.dropdownOpened && this.customerRef?.instance?.close) {
      setTimeout(() => {
        this.customerRef.instance.close();
        this.dropdownOpened = false; // reset flag
      }, 100); // slight delay allows selection to settle
    }
  }

  onDueAmountKeyDown(event: any): void {
    if (event.event?.key === 'Enter') {
      setTimeout(() => {
        // Focus grid's first editable cell — SL_NO (first row, first col)
        this.itemsGridRef?.instance?.editCell(0, 'SL_NO');
      }, 0);
    }
  }

  getLedgerCodeDropdown(): Promise<void> {
    return new Promise((resolve) => {
      this.dataService.getActiveLedger().subscribe((response: any) => {
        this.ledgerList = response.Data;
        resolve();
      });
    });
  }

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
            grid.focus(grid.getCellElement(rowIndex, 'GST_PERC'));
          }, 50);
        }
      };
    }
    if (e.parentType !== 'dataRow') return;
    const rowIndex = e.row?.rowIndex;
    console.log(rowIndex);

    // ➤ SL_NO: Move to ledgerCode on Enter
    // if (e.dataField === 'SL_NO') {
    //   e.editorOptions.onKeyDown = (event: any) => {
    //     if (event.event.key === 'Enter') {
    //       const grid = this.itemsGridRef?.instance;
    //       const visibleRows = grid.getVisibleRows();

    //       const rowIndex = visibleRows.findIndex(
    //         (r) => r?.data === e.row?.data
    //       );
    //       console.log(
    //         'SL_NO → Enter → move to ledgerCode, rowIndex:',
    //         rowIndex
    //       );

    //       setTimeout(() => {
    //         grid.focus(grid.getCellElement(rowIndex, 'ledgerCode'));
    //       }, 50);
    //     }
    //   };
    // }

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
          if (!e.row.data.HSN_CODE) {
            e.component.cellValue(
              rowIndex,
              'HSN_CODE',
              this.noteDetails[0]?.HSN_CODE || this.HSNCODE,
            );
          }
          // 2️⃣ Get HSN & GST from session
          // const sessionData = JSON.parse(
          //   sessionStorage.getItem('savedUserData')
          // );
          // const hsnCode = sessionData?.GeneralSettings?.HSN_CODE;
          // const gstPerc = sessionData?.GeneralSettings?.GST_PERC;

          // // 3️⃣ Set HSN_CODE
          // e.component.cellValue(rowIndex, 'HSN_CODE', hsnCode);

          // // 4️⃣ Set GST_PERC
          // e.component.cellValue(rowIndex, 'GST_PERC', gstPerc);

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
      // 👉 ENTER KEY HANDLING
      e.editorOptions.onKeyDown = (event: any) => {
        if (event.event.key === 'Enter') {
          event.event.preventDefault();

          const grid = this.itemsGridRef?.instance;
          const rowIndex = e.row.rowIndex;

          // Commit editor value
          const editorElement = event.event.target as HTMLElement;
          editorElement.blur();

          setTimeout(() => {
            grid?.saveEditData();

            // Move to GST_PERC column
            setTimeout(() => {
              grid?.editCell(rowIndex, 'GST_PERC');
            }, 50);
          }, 50);
        }
      };

      // 👉 VALUE CHANGE HANDLING (🔥 GST CALCULATION GOES HERE 🔥)
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);

        const row = e.row.data;
        const amount = Number(args.value) || 0;

        const cgst = Number(row.CGST) || 0;
        const sgst = Number(row.SGST) || 0;
        const igst = Number(row.GST_PERC) || 0;

        let gst = 0;

        if (cgst > 0 || sgst > 0) {
          gst = (amount * (cgst + sgst)) / 100;
        } else if (igst > 0) {
          gst = (amount * igst) / 100;
        }

        const grid = this.itemsGridRef.instance;
        const gstValue = +gst.toFixed(2);

        grid.cellValue(rowIndex, 'gstAmount', gstValue);

        console.log('GST Amount:', gstValue);
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
    //   e.editorOptions.onValueChanged = (args: any) => {
    //     e.setValue(args.value);
    //     setTimeout(() => {
    //       this.updateNetAmount();
    //     }, 0);
    //   };
    // }
    // if (e.dataField === 'Amount') {
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

    //         // ✅ Add new row manually
    //         if (!this.hasEmptyRow()) {
    //           const grid = this.itemsGridRef?.instance;
    //           const baseRow = this.noteDetails[0] || {};
    //           const newRow = {
    //             SL_NO: this.noteDetails.length + 1,
    //             ledgerCode: '',
    //             ledgerName: '',
    //             particulars: '',
    //             Amount: '',
    //             GST_PERC: baseRow.GST_PERC || 0,
    //             CGST: baseRow.CGST || 0,
    //             SGST: baseRow.SGST || 0,
    //             gstAmount: '',
    //             HEAD_ID: null,
    //           };
    //           this.applyGstForRow(newRow);
    //           this.noteDetails.push(newRow);

    //           // ✅ Force rebind and refresh the grid
    //           grid.option('dataSource', [...this.noteDetails]);
    //           grid.refresh();

    //           // ✅ Wait a bit longer to ensure row is rendered before focusing
    //           setTimeout(() => {
    //             const visibleRows = grid.getVisibleRows();
    //             const newRowIndex = visibleRows.findIndex(
    //               (r) => r.data === newRow
    //             );

    //             if (newRowIndex >= 0) {
    //               // Small extra delay for rendering safety
    //               setTimeout(() => {
    //                 grid.editCell(newRowIndex, 'ledgerCode');
    //               }, 50);
    //             }
    //           }, 100);
    //         }
    //       }, 50); // Let blur + commit happen
    //     }
    //   };
    //   e.editorOptions.onValueChanged = (args: any) => {
    //     e.setValue(args.value);
    //     setTimeout(() => {
    //       this.updateNetAmount();
    //     }, 0);
    //   };
    // }
  }

  updateNetAmount() {}

  private calculateGstFromRow(row: any): number {
    const amount = Number(row.Amount) || 0;

    const cgst = Number(row.CGST) || 0;
    const sgst = Number(row.SGST) || 0;
    const igst = Number(row.GST_PERC) || 0;

    if (cgst > 0 || sgst > 0) {
      return +((amount * (cgst + sgst)) / 100).toFixed(2);
    }

    if (igst > 0) {
      return +((amount * igst) / 100).toFixed(2);
    }

    return 0;
  }

  // calculateTaxAmount = (row: any) => {
  //   // ✅ existing DB rows
  //   if (row._isExisting && row.gstAmount != null) {
  //     return Number(row.gstAmount) || 0;
  //   }

  //   const amount = Number(row.Amount) || 0;
  //   let gst = 0;

  //   if (this.companyStateID === this.selectedCustomer?.STATE_ID) {
  //     gst =
  //       (amount * ((Number(row.CGST) || 0) + (Number(row.SGST) || 0))) / 100;
  //   } else {
  //     gst = (amount * (Number(row.GST_PERC) || 0)) / 100;
  //   }

  //   // 🔥 THIS IS MANDATORY
  //   row.gstAmount = +gst.toFixed(2);

  //   return row.gstAmount;
  // };

  calculateTotalAmount = (row: any) => {
    const amount = Number(row.Amount) || 0;
    const gstAmount = Number(row.gstAmount) || 0;
    return +(amount + gstAmount).toFixed(2);
  };

  // calculateTotalAmount = (row: any) => {
  //   const amount = Number(row.Amount) || 0;
  //   const gstAmount = this.calculateTaxAmount(row); // IGST or CGST+SGST
  //   return +(amount + gstAmount).toFixed(2);
  // };

  get calculatedNetAmount(): string {
    const details = this.noteDetails || [];
    let totalAmount = 0;
    let totalGST = 0;

    const isSameState = this.companyStateID === this.selectedCustomer?.STATE_ID;

    details.forEach((item: any) => {
      const amount = Number(item.Amount) || 0;
      totalAmount += amount;

      if (isSameState) {
        const cgst = Number(item.CGST) || 0;
        const sgst = Number(item.SGST) || 0;
        totalGST += (amount * (cgst + sgst)) / 100;
      } else {
        const gstPerc = Number(item.GST_PERC) || 0;
        totalGST += (amount * gstPerc) / 100;
      }
    });

    let finalNet = totalAmount + totalGST;

    // ⭐ Apply round off if checkbox is checked
    if (this.creditFormData[0].ROUND_OFF) {
      finalNet = Math.round(finalNet);
    }

    return finalNet.toFixed(2);
  }

  calculateNetAmount() {
    const details = this.noteDetails || [];
    let totalAmount = 0;
    let totalGST = 0;

    details.forEach((item: any) => {
      const amount = Number(item.Amount) || 0;
      const gstPerc = Number(item.GST_PERC) || 0;

      totalAmount += amount;
      totalGST += (amount * gstPerc) / 100;
    });

    this.netAmount = +(totalAmount + totalGST).toFixed(2);

    // Apply RoundOff immediately if checkbox already selected
    this.onRoundOffChange();
  }

  onRoundOffChange() {
    if (this.creditFormData[0].ROUND_OFF) {
      this.roundedNetAmount = Math.round(this.netAmount); // Example: 1234.56 → 1235
    } else {
      this.roundedNetAmount = this.netAmount; // No rounding
    }
  }

  onCompanySelected(event: any): void {
    const grid = this.itemsGridRef?.instance;
    const selectedId = event.value;
    this.creditFormData[0].UNIT_ID = selectedId;
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
    this.creditFormData[0].DISTRIBUTOR_ID = this.selectedCustomerId;
    if (grid) {
      const editRowIndex = grid
        .getVisibleRows()
        .findIndex((row: any) => row.isEditing);
      if (editRowIndex !== -1) {
        grid.saveEditData(); // Save new row before changing distributor
      }
    }

    this.selectedDistributorId = event.value;
    console.log(this.selectedDistributorId, 'SELECTEDDISTRIBUTORIDDDDDDDDD');
  }

  onNarrationKeyDown(event: any) {}

  onInitNewRow(e: any): void {
    this.newRowIndex = e.component.getRowIndexByKey(e.key);
  }
  // onCompanySelected(event: any){}

  openInvoicePopup() {
    this.getPendingInvoices(); // Ensure you load fresh data
    this.invoicePopupVisible = true;
  }

  getPendingInvoices(savedData?: any) {
    const payload = {
      CUST_ID: this.selectedCustomerId,
      COMPANY_ID: this.selectedCompanyId,
    };

    this.dataService
      .getPendingInvoiceList(payload)
      .subscribe((response: any) => {
        this.pendingInvoices = response.Data || [];

        // ✅ Ensure saved invoice is included in dropdown
        if (savedData && savedData.INVOICE_NO) {
          const exists = this.pendingInvoices.some(
            (inv: any) =>
              String(inv.INVOICE_NO) === String(savedData.INVOICE_NO),
          );

          if (!exists) {
            this.pendingInvoices = [
              ...this.pendingInvoices,
              {
                INVOICE_NO: String(savedData.INVOICE_NO),
                INVOICE_ID: savedData.INVOICE_ID,
                BALANCE_AMOUNT: savedData.DUE_AMOUNT,
              },
            ];
          }
        }

        // ✅ Reset binding after list is ready
        if (savedData) {
          this.invoiceNo = String(savedData.INVOICE_NO);
        }
      });
  }

  selectInvoice(e: any) {
    console.log('Invoice selected:', e);
    const selected = e.data;
    this.creditFormData[0].INVOICE_NO = selected.INVOICE_NO;
    this.creditFormData[0].DUE_AMOUNT = selected.BALANCE_AMOUNT;
    this.creditFormData[0].INVOICE_ID = selected.INVOICE_ID;
    console.log(this.creditFormData.INVOICE_ID, 'INVOICEIDDDDDDDDDDDDDDDD');
    this.invoicePopupVisible = false;
  }

  onApprovedChanged(e: any) {
    console.log('Checkbox value changed:', e.value);
    this.creditFormData[0].IS_APPROVED = e.value;
  }

  private formatDateOnly(date: string | number | Date | null): string {
    if (!date) return '';

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  updateCreditNote() {
    if (this.isUpdating) {
      return;
    }
    this.isUpdating = true;
    // 1) Ensure in-progress edits are committed
    this.itemsGridRef?.instance?.saveEditData();

    // small util to compute GST
    const calculateTaxAmount = (item: any): number => {
      const amount = Number(item.Amount) || 0;
      const gstPerc = Number(item.GST_PERC) || 0;
      return +((amount * gstPerc) / 100).toFixed(2);
    };
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
    const dueAmount = Number(this.creditFormData[0]?.DUE_AMOUNT) || 0;
    console.log(netAmount, dueAmount, 'NETAMOUNT,DUEAMOUNT');
    // ✅ Validation check
    if (netAmount > dueAmount) {
      notify('Net Amount cannot exceed Due Amount.', 'error', 2500);
      this.isUpdating = false;
      return;
    }
    // Build NOTE_DETAIL consistently (use same shape for both branches)
    const buildNoteDetail = () =>
      (this.noteDetails || [])
        .filter(
          (item) =>
            // include rows that have any meaningful data
            item.ledgerCode ||
            item.ledgerName ||
            item.Amount ||
            item.GST_PERC ||
            item.particulars,
        )
        .map((item: any, index: number) => {
          const match = this.ledgerList.find(
            (l) =>
              l.HEAD_CODE === item.ledgerCode ||
              l.HEAD_NAME === item.ledgerName,
          );

          const amount = Number(item.Amount) || 0;

          // ✅ SINGLE SOURCE OF TRUTH
          const gstAmount = this.calculateGstFromRow(item);

          return {
            SL_NO: item.SL_NO || index + 1,
            HEAD_ID: match?.HEAD_ID || item.HEAD_ID || null,

            AMOUNT: amount,

            // Preserve exactly what row already has
            GST_PERC: Number(item.GST_PERC) || 0,
            CGST: Number(item.CGST) || 0,
            SGST: Number(item.SGST) || 0,

            // ✅ ALWAYS CORRECT (even if row untouched)
            GST_AMOUNT: gstAmount,

            REMARKS: item.particulars || '',
          };
        });

    // APPROVE / COMMIT path
    if (this.creditFormData.IS_APPROVED) {
      confirm(
        'It will approve and commit. Are you sure you want to commit?',
        'Confirm Commit',
      ).then((result) => {
        this.isUpdating = true;
        if (result) {
          const payload = {
            TRANS_ID: this.creditFormData[0].TRANS_ID,
            IS_APPROVED: true,
            TRANS_TYPE: 37,
            COMPANY_ID: this.selectedCompanyId,
            FIN_ID: this.finId,
            STORE_ID: this.selectedstoreId,
            // TRANS_DATE: this.transDate,
            TRANS_DATE: this.formatDateOnly(this.transDate),

            TRANS_STATUS: 1,
            NARRATION: this.creditFormData[0].NARRATION,
            INVOICE_ID: this.creditFormData[0].INVOICE_ID || 0,
            INVOICE_NO: this.creditFormData[0].INVOICE_NO || '',
            UNIT_ID: this.creditFormData[0].UNIT_ID || 0,
            DISTRIBUTOR_ID: this.creditFormData[0].DISTRIBUTOR_ID || 0,
            PARTY_NAME: this.creditFormData.PARTY_NAME,
            NOTE_DETAIL: buildNoteDetail(),
            ROUND_OFF: this.creditFormData[0].ROUND_OFF,
            VEHICLE_NO: this.creditFormData[0].VEHICLE_NO,
          };

          this.dataService.commitCreditNote(payload).subscribe(
            (response: any) => {
              if (response.flag === 1) {
                notify('Credit Note approved successfully!', 'success', 3000);
                this.popupClosed.emit();
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
          notify('Approval cancelled.', 'info', 2000);
          this.isUpdating = false;
        }
      });
      this.isUpdating = false;
      return;
    }

    // NORMAL UPDATE path
    const payload = {
      TRANS_ID: this.creditFormData[0].TRANS_ID,
      TRANS_TYPE: 37,
      COMPANY_ID: this.selectedCompanyId,
      FIN_ID: this.finId,
      STORE_ID: 1,
      // TRANS_DATE: this.transDate,
      TRANS_DATE: this.formatDateOnly(this.transDate),
      TRANS_STATUS: 1,
      NARRATION: this.creditFormData[0].NARRATION,
      INVOICE_ID: this.creditFormData[0].INVOICE_ID || 0,
      INVOICE_NO: this.creditFormData[0].INVOICE_NO || '',
      UNIT_ID: this.creditFormData[0].UNIT_ID || 0,
      DISTRIBUTOR_ID: this.creditFormData[0].DISTRIBUTOR_ID || 0,
      PARTY_NAME: this.creditFormData.PARTY_NAME,
      IS_APPROVED: false,
      NOTE_DETAIL: buildNoteDetail(), // <- includes GST_PERC and GST_AMOUNT
      ROUND_OFF: this.creditFormData[0].ROUND_OFF,
      VEHICLE_NO: this.creditFormData[0].VEHICLE_NO,
    };

    console.log('Update Payload:', payload);
    console.log(this.transDate, 'TRANSDATEEEEEEEEEEEEE');
    this.dataService.updateCreditNote(payload).subscribe((response) => {
      if (response) {
        notify(
          {
            message: 'Credit Note Updated Successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );
        this.popupClosed.emit();
        this.isUpdating = false;
      }
    });
  }

  onRowRemoved(e: any) {
    const removedData = e.data;

    this.noteDetails = this.noteDetails.filter(
      (item: any) => item !== removedData,
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
  ],
  providers: [],
  declarations: [MiscellaneousPurchaseEditComponent],
  exports: [MiscellaneousPurchaseEditComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MiscellaneousPurchaseEditModule {}
