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
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { AddCreditNoteComponent } from '../add-credit-note/add-credit-note.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-edit-credit-note',
  templateUrl: './edit-credit-note.component.html',
  styleUrls: ['./edit-credit-note.component.scss'],
})
export class EditCreditNoteComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() creditFormData: any;
  // @ViewChild(DxDataGridComponent, { static: true })
  @ViewChild('itemsGridRef') itemsGridRef: DxDataGridComponent;
  dataGrid: DxDataGridComponent;
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

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef
  ) {
    const userDataString = localStorage.getItem('userData');
    console.log(userDataString, 'USERDATASTRING');
    if (userDataString) {
      const userData = JSON.parse(userDataString);

      this.HSNCODE = userData.GeneralSettings.HSN_CODE;
      this.GST = userData.GeneralSettings.GST_PERC;
      console.log(this.HSNCODE, 'HSNCODE===================');
      this.hsnLoaded = true; // ADD THIS
    }
  }

  ngOnInit() {
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
    console.log(
      this.selectedstoreId,
      '===========selected store id==================='
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['creditFormData'] && this.creditFormData?.length) {
      const data = this.creditFormData[0];
      this.creditFormData.PARTY_NAME = data.PARTY_NAME;
      console.log(this.creditFormData.ROUND_OFF, 'INEDITTTTTTTTTTT');
      this.companyStateID = this.selectedCompany?.STATE_ID;

      if (this.creditFormData?.length) {
        const data = this.creditFormData[0];
        this.invoiceNo = String(data.INVOICE_NO);
        console.log('InvoiceNo bound to:', this.invoiceNo);
        this.getPendingInvoices(data);
        this.selectedInvoice = String(data.INVOICE_NO);
        console.log('invoiceNo bound to:', this.invoiceNo);
      }
      const distributorId = data.DISTRIBUTOR_ID;
      const selectedCustomer = this.distributorList?.find(
        (x: any) => x.ID === distributorId
      );
      if (selectedCustomer) {
        this.customerStateID = selectedCustomer.STATE_ID;
        this.selectedCustomer = selectedCustomer;
        console.log('Customer State:', this.customerStateID);
      } else {
        console.warn('Customer state not found in distributorList');
      }
      this.isSameState = this.companyStateID === this.customerStateID;
      console.log('Same State:', this.isSameState);
      // ⭐ UPDATE COLUMN VISIBILITY
      if (this.isSameState) {
        this.showGST = false;
        this.showCGST = true;
        this.showSGST = true;
      } else {
        this.showGST = true;
        this.showCGST = false;
        this.showSGST = false;
      }
      this.selectedInvoice = String(data.INVOICE_NO);
      this.transDate = new Date(data.TRANS_DATE);
      this.getLedgerCodeDropdown().then(() => {
        this.noteDetails = (data.NOTE_DETAIL || []).map((item: any) => {
          const match = this.ledgerList.find(
            (l: any) => l.HEAD_ID === item.HEAD_ID
          );
          const igst = parseFloat(item.GST) || 0;
          const cgst = parseFloat(item.CGST) || 0;
          const sgst = parseFloat(item.SGST) || 0;
          return {
            ...item,
            ledgerCode: match?.HEAD_CODE || '',
            ledgerName: match?.HEAD_NAME || '',
            particulars: item.REMARKS || '',
            Amount: item.AMOUNT || '',
            gstAmount: item.GST_AMOUNT || '',
            HSN_CODE: this.HSNCODE,
            GST: this.isSameState ? 0 : Number(item.GST) || 0,
            CGST: this.isSameState ? Number(item.CGST) || 0 : 0,
            SGST: this.isSameState ? Number(item.SGST) || 0 : 0,
          };
        });
      });
      console.log(this.noteDetails, 'NOTDETAILSSSSSSSSSS');
      this.getCompanyListDropdown(data.DISTRIBUTOR_ID);
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
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.distributorList = response;
      this.cdr.detectChanges();

      if (selectedDistributorId) {
        const match = this.distributorList.find(
          (d: any) => d.ID === selectedDistributorId
        );

        this.selectedDistributorId = match ? match.ID : null;
      }
    });
  }

  getCustomerOrUnitLst() {
    this.dataService.getCustomerWithState().subscribe((response: any) => {
      this.distributorList = response;
      console.log(this.distributorList, 'DISTLISTPOPUP');
    });
  }
  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  private hasEmptyRow(): boolean {
    return (this.noteDetails || []).some(
      (r: any) =>
        !r.ledgerCode &&
        !r.ledgerName &&
        !r.particulars &&
        (!r.Amount || r.Amount === 0) &&
        (!r.GST_PERC || r.GST_PERC === 0)
    );
  }

  applyGstForRow(row: any) {
    const sessionGst = parseFloat(this.GST) || 0;

    // Same State → CGST + SGST
    if (this.companyStateID === this.selectedCustomer?.STATE_ID) {
      const half = sessionGst / 2;

      row.CGST = half;
      row.SGST = half;
      row.GST = 0;
    } else {
      // Different State → IGST (GST only)
      row.GST = sessionGst;
      row.CGST = 0;
      row.SGST = 0;
    }
  }
  addNewManualRow() {
    if (!this.noteDetails) {
      this.noteDetails = [];
    }
    if (this.hasEmptyRow()) {
      notify(
        'Please fill the existing empty row before adding a new one.',
        'warning',
        2000
      );
      return;
    }
    const nextSlNo =
      this.noteDetails.length > 0
        ? Math.max(...this.noteDetails.map((r) => r.SL_NO)) + 1
        : 1;

    const newRow = {
      SL_NO: nextSlNo,
      ledgerCode: '',
      ledgerName: '',
      particulars: '',
      Amount: '',
      gstAmount: '',
      HEAD_ID: null,
    };
    this.applyGstForRow(newRow);
    // Force change detection
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
        console.log('Ledger List Loaded:', this.ledgerList);
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
            (r) => r?.data === e.row?.data
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
          (item: any) => item.HEAD_CODE === args.value
        );

        e.setValue(args.value);

        if (selectedLedger) {
          // 1️⃣ Set ledger name
          e.component.cellValue(
            rowIndex,
            'ledgerName',
            selectedLedger.HEAD_NAME
          );

          // 2️⃣ Get HSN & GST from session
          const sessionData = JSON.parse(
            sessionStorage.getItem('savedUserData')
          );
          const hsnCode = sessionData?.GeneralSettings?.HSN_CODE;
          const gstPerc = sessionData?.GeneralSettings?.GST_PERC;

          // 3️⃣ Set HSN_CODE
          e.component.cellValue(rowIndex, 'HSN_CODE', hsnCode);

          // 4️⃣ Set GST_PERC
          e.component.cellValue(rowIndex, 'GST_PERC', gstPerc);

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
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        setTimeout(() => {
          this.updateNetAmount();
        }, 0);
      };
    }
    if (e.dataField === 'Amount') {
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

            // ✅ Add new row manually
            if (!this.hasEmptyRow()) {
              const grid = this.itemsGridRef?.instance;
              const newRow = {
                SL_NO: this.noteDetails.length + 1,
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
              this.noteDetails.push(newRow);

              // ✅ Force rebind and refresh the grid
              grid.option('dataSource', [...this.noteDetails]);
              grid.refresh();

              // ✅ Wait a bit longer to ensure row is rendered before focusing
              setTimeout(() => {
                const visibleRows = grid.getVisibleRows();
                const newRowIndex = visibleRows.findIndex(
                  (r) => r.data === newRow
                );

                if (newRowIndex >= 0) {
                  // Small extra delay for rendering safety
                  setTimeout(() => {
                    grid.editCell(newRowIndex, 'ledgerCode');
                  }, 50);
                }
              }, 100);
            }
          }, 50); // Let blur + commit happen
        }
      };
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        setTimeout(() => {
          this.updateNetAmount();
        }, 0);
      };
    }
  }

  updateNetAmount() {}
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
  // get calculatedNetAmount(): string {
  //   const details = this.noteDetails || [];
  //   let totalAmount = 0;
  //   let totalGST = 0;

  //   details.forEach((item: any) => {
  //     const amount = Number(item.Amount) || 0;
  //     const gstPerc = Number(item.GST_PERC) || 0;

  //     totalAmount += amount;
  //     totalGST += (amount * gstPerc) / 100; // ✅ Recalculate GST dynamically
  //   });

  //   return (totalAmount + totalGST).toFixed(2);
  // }

  get calculatedNetAmount(): string {
    const details = this.noteDetails || [];
    let totalAmount = 0;
    let totalGST = 0;

    const isSameState = this.companyStateID === this.selectedCustomer?.STATE_ID;

    details.forEach((item: any) => {
      const amount = Number(item.Amount) || 0;
      totalAmount += amount;

      if (isSameState) {
        // SAME STATE → CGST + SGST
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
    console.log(this.netTotal, 'NETTOTALLLLLLLL');
    return this.netTotal.toFixed(2);
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
    this.creditFormData.DISTRIBUTOR_ID = this.selectedCustomerId;
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
    console.log('EVENT ');
    this.getPendingInvoices(); // Ensure you load fresh data
    this.invoicePopupVisible = true;
  }

  getPendingInvoices(savedData?: any) {
    const payload = {
      CUST_ID: this.selectedCustomerId,
    };

    this.dataService
      .getPendingInvoiceList(payload)
      .subscribe((response: any) => {
        this.pendingInvoices = response.Data || [];

        // ✅ Ensure saved invoice is included in dropdown
        if (savedData && savedData.INVOICE_NO) {
          const exists = this.pendingInvoices.some(
            (inv: any) =>
              String(inv.INVOICE_NO) === String(savedData.INVOICE_NO)
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

  // getPendingInvoices() {
  //   const payload = {
  //     CUST_ID: this.selectedCustomerId, // or customerId if you pass it
  //   };

  //   this.dataService
  //     .getPendingInvoiceList(payload)
  //     .subscribe((response: any) => {
  //       this.pendingInvoices = response.Data;
  //       console.log(this.pendingInvoices, 'PENDINGINVOICES');
  //       if (this.creditFormData?.length) {
  //         const data = this.creditFormData[0];
  //         this.invoiceNo = String(data.INVOICE_NO);
  //       }
  //     });
  // }

  selectInvoice(e: any) {
    console.log('Invoice selected:', e);
    const selected = e.data;
    this.creditFormData.INVOICE_NO = selected.INVOICE_NO;
    this.creditFormData.DUE_AMOUNT = selected.BALANCE_AMOUNT;
    this.creditFormData.INVOICE_ID = selected.INVOICE_ID;
    console.log(this.creditFormData.INVOICE_ID, 'INVOICEIDDDDDDDDDDDDDDDD');
    this.invoicePopupVisible = false;
  }

  onApprovedChanged(e: any) {
    console.log('Checkbox value changed:', e.value);
    this.creditFormData.IS_APPROVED = e.value;
  }

  updateCreditNote() {
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
            item.particulars
        )
        .map((item: any, index: number) => {
          const match = this.ledgerList.find(
            (l) =>
              l.HEAD_CODE === item.ledgerCode || l.HEAD_NAME === item.ledgerName
          );

          const amount = Number(item.Amount) || 0;
          const isSameState =
            this.companyStateID === this.selectedCustomer?.STATE_ID;
          let gstPerc = 0;
          let gstAmount = 0;
          let cgst = 0;
          let sgst = 0;

          if (isSameState) {
            //  CGST + SGST mode
            cgst = Number(item.CGST) || 0;
            sgst = Number(item.SGST) || 0;

            const totalGstPerc = cgst + sgst;
            gstPerc = 0; // IGST not applicable
            gstAmount = Number(((amount * totalGstPerc) / 100).toFixed(2));
          } else {
            //  IGST mode
            gstPerc = Number(item.GST_PERC) || 0;
            gstAmount = Number(((amount * gstPerc) / 100).toFixed(2)); // FIXED
            cgst = 0;
            sgst = 0;
          }

          return {
            SL_NO: item.SL_NO || index + 1,
            HEAD_ID: match?.HEAD_ID || item.HEAD_ID || null,
            AMOUNT: amount,
            GST_PERC: gstPerc, // Only IGST or 0
            CGST: cgst, // Only in same-state
            SGST: sgst, // Only in same-state
            GST_AMOUNT: gstAmount, // <-- computed
            REMARKS: item.particulars || '',
          };
        });

    // APPROVE / COMMIT path
    if (this.creditFormData.IS_APPROVED) {
      confirm(
        'It will approve and commit. Are you sure you want to commit?',
        'Confirm Commit'
      ).then((result) => {
        if (result) {
          const payload = {
            TRANS_ID: this.creditFormData[0].TRANS_ID,
            IS_APPROVED: true,
            TRANS_TYPE: 37,
            COMPANY_ID: this.selectedCompanyId,
            FIN_ID: this.finId,
            STORE_ID: this.selectedstoreId,
            TRANS_DATE: this.transDate,
            TRANS_STATUS: 1,
            NARRATION:
              this.creditFormData[0].NARRATION ||
              'Update Details of Credit Note',
            INVOICE_ID: this.creditFormData[0].INVOICE_ID || 0,
            INVOICE_NO: this.creditFormData[0].INVOICE_NO || '',
            UNIT_ID: this.creditFormData[0].UNIT_ID || 0,
            DISTRIBUTOR_ID: this.creditFormData[0].DISTRIBUTOR_ID || 0,
            PARTY_NAME: this.creditFormData.PARTY_NAME,
            NOTE_DETAIL: buildNoteDetail(),
            ROUND_OFF: this.creditFormData.ROUND_OFF,
            VEHICLE_NO: this.creditFormData.VEHICLE_NO,
          };

          this.dataService.commitCreditNote(payload).subscribe(
            (response: any) => {
              if (response.flag === 1) {
                notify('Credit Note approved successfully!', 'success', 3000);
                this.popupClosed.emit();
              } else {
                notify(`Approval failed: ${response.Message}`, 'error', 4000);
              }
            },
            (error) => {
              console.error('Approval error:', error);
              alert('Something went wrong while approving');
            }
          );
        } else {
          notify('Approval cancelled.', 'info', 2000);
        }
      });

      return;
    }

    // NORMAL UPDATE path
    const payload = {
      TRANS_ID: this.creditFormData[0].TRANS_ID,
      TRANS_TYPE: 37,
      COMPANY_ID: this.selectedCompanyId,
      FIN_ID: this.finId,
      STORE_ID: 1,
      TRANS_DATE: this.transDate,
      TRANS_STATUS: 1,
      NARRATION:
        this.creditFormData[0].NARRATION || 'Update Details of Credit Note',
      INVOICE_ID: this.creditFormData[0].INVOICE_ID || 0,
      INVOICE_NO: this.creditFormData[0].INVOICE_NO || '',
      UNIT_ID: this.creditFormData[0].UNIT_ID || 0,
      DISTRIBUTOR_ID: this.creditFormData[0].DISTRIBUTOR_ID || 0,
      PARTY_NAME: this.creditFormData.PARTY_NAME,
      IS_APPROVED: false,
      NOTE_DETAIL: buildNoteDetail(), // <- includes GST_PERC and GST_AMOUNT
      ROUND_OFF: this.creditFormData.ROUND_OFF,
      VEHICLE_NO: this.creditFormData.VEHICLE_NO,
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
          'success'
        );
        this.popupClosed.emit();
      }
    });
  }

  // updateCreditNote() {
  //   if (this.creditFormData.IS_APPROVED) {
  //     console.log('approved???????????????????????????????????');
  //     confirm(
  //       'It will approve and commit. Are you sure you want to commit?',
  //       'Confirm Commit'
  //     ).then((result) => {
  //       if (result) {
  //         const payload = {
  //           TRANS_ID: this.creditFormData[0].TRANS_ID,
  //           IS_APPROVED: true,
  //           TRANS_TYPE: 37,
  //           COMPANY_ID: this.selectedCompanyId,
  //           FIN_ID: this.finId,
  //           STORE_ID: 1,
  //           TRANS_DATE: this.transDate,
  //           TRANS_STATUS: 1,
  //           NARRATION:
  //             this.creditFormData[0].NARRATION ||
  //             'Update Details of Credit Note',
  //           INVOICE_ID: this.creditFormData[0].INVOICE_ID || 0,
  //           INVOICE_NO: this.creditFormData[0].INVOICE_NO || '',
  //           UNIT_ID: this.creditFormData[0].UNIT_ID || 0,
  //           DISTRIBUTOR_ID: this.creditFormData[0].DISTRIBUTOR_ID || 0,
  //           PARTY_NAME: this.creditFormData.PARTY_NAME,
  //           NOTE_DETAIL: this.noteDetails
  //             .filter(
  //               (item) =>
  //                 item.ledgerCode ||
  //                 item.ledgerName ||
  //                 item.Amount ||
  //                 item.GST_PERC ||
  //                 item.gstAmount ||
  //                 item.particulars
  //             )
  //             .map((item: any, index: number) => {
  //               const match = this.ledgerList.find(
  //                 (l) =>
  //                   l.HEAD_CODE === item.ledgerCode ||
  //                   l.HEAD_NAME === item.ledgerName
  //               );
  //               const gstAmount = this.calculateTaxAmount(item);
  //               return {
  //                 SL_NO: item.SL_NO || index + 1,
  //                 HEAD_ID: match?.HEAD_ID || item.HEAD_ID,
  //                 AMOUNT: Number(item.Amount) || 0,
  //                 GST_PERC: Number(item.GST_PERC) || 0,
  //                 GST_AMOUNT: gstAmount,
  //                 REMARKS: item.particulars || '',
  //               };
  //             }),
  //         };

  //         this.dataService.commitCreditNote(payload).subscribe(
  //           (response: any) => {
  //             if (response.flag === 1) {
  //               notify('Credit Note approved successfully!', 'success', 3000);
  //               this.popupClosed.emit(); // Close popup
  //             } else {
  //               notify(`Approval failed: ${response.Message}`, 'error', 4000);
  //             }
  //           },
  //           (error) => {
  //             console.error('Approval error:', error);
  //             alert('Something went wrong while approving');
  //           }
  //         );
  //       } else {
  //         // ❌ User cancelled commit
  //         notify('Approval cancelled.', 'info', 2000);
  //       }
  //     });

  //     return; // 🚫 Prevent running normal update block
  //   } else {
  //     const payload = {
  //       TRANS_ID: this.creditFormData[0].TRANS_ID,
  //       TRANS_TYPE: 37,
  //       COMPANY_ID: this.selectedCompanyId,
  //       FIN_ID: this.finId,
  //       STORE_ID: 1,
  //       TRANS_DATE: this.transDate,
  //       TRANS_STATUS: 1,
  //       NARRATION:
  //         this.creditFormData[0].NARRATION || 'Update Details of Credit Note',
  //       INVOICE_ID: this.creditFormData[0].INVOICE_ID || 0,
  //       INVOICE_NO: this.creditFormData[0].INVOICE_NO || '',
  //       UNIT_ID: this.creditFormData[0].UNIT_ID || 0,
  //       DISTRIBUTOR_ID: this.creditFormData[0].DISTRIBUTOR_ID || 0,
  //       PARTY_NAME: this.creditFormData.PARTY_NAME,
  //       IS_APPROVED: false,
  //       NOTE_DETAIL: this.noteDetails
  //         .filter(
  //           (item) =>
  //             item.ledgerCode ||
  //             item.ledgerName ||
  //             item.Amount ||
  //             item.gstAmount ||
  //             item.particulars
  //         )
  //         .map((item: any, index: number) => {
  //           const match = this.ledgerList.find(
  //             (l) =>
  //               l.HEAD_CODE === item.ledgerCode ||
  //               l.HEAD_NAME === item.ledgerName
  //           );
  //           return {
  //             SL_NO: item.SL_NO || index + 1,
  //             HEAD_ID: match?.HEAD_ID || item.HEAD_ID,
  //             AMOUNT: Number(item.Amount) || 0,
  //             GST_AMOUNT: Number(item.gstAmount) || 0,
  //             REMARKS: item.particulars || '',
  //           };
  //         }),
  //     };

  //     console.log('Update Payload:', payload);

  //     this.dataService.updateCreditNote(payload).subscribe((response) => {
  //       if (response) {
  //         notify(
  //           {
  //             message: 'Credit Note Updated Successfully',
  //             position: { at: 'top right', my: 'top right' },
  //           },
  //           'success'
  //         );
  //         this.popupClosed.emit();
  //         // this.resetCreditNoteForm();
  //       }
  //     });
  //   }
  // }

  resetCreditNoteForm() {
    this.creditFormData = {
      TRANS_TYPE: 37,
      COMPANY_ID: 1,
      STORE_ID: 1,
      TRANS_DATE: new Date(),
      TRANS_STATUS: 1,
      PARTY_ID: 1,
      PARTY_NAME: '',
      NARRATION: '',
      INVOICE_ID: 0,
      INVOICE_NO: '',
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
    ArticleAddModule,
    ArticleEditModule,
    AddJournalVoucharModule,
    EditJournalVoucherModule,
    ViewJournalVoucherModule,
  ],
  providers: [],
  declarations: [EditCreditNoteComponent],
  exports: [EditCreditNoteComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditCreditNoteModule {}
