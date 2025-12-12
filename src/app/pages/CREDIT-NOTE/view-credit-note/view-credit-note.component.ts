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
import { BrowserModule, DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
import { EditCreditNoteComponent } from '../edit-credit-note/edit-credit-note.component';
import { DataService } from 'src/app/services';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-view-credit-note',
  templateUrl: './view-credit-note.component.html',
  styleUrls: ['./view-credit-note.component.scss'],
})
export class ViewCreditNoteComponent {
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
   @Input() CreditNoteid!: number;
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
  HSNCODE: any;
  hsnLoaded: boolean;
  GST: any;
  showCGST:boolean =false;
  showSGST:boolean = false;
  showGST:boolean = false;

   isPdfPopupVisible: boolean = false;
      pdfSrc: SafeResourceUrl | null = null;
  selectedCompany: any;
  companyState: any;
  companyStateID: any;
      netAmount: number = 0;
roundedNetAmount: number = 0;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
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

    this.sessionData_tax();
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
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['creditFormData'] && this.creditFormData?.length) {
  //     const data = this.creditFormData[0];
  //     console.log(this.creditFormData[0].INVOICE_NO, 'INEDITTTTTTTTTTT');
  //     if (this.creditFormData?.length) {
  //       const data = this.creditFormData[0];
  //       this.invoiceNo = String(data.INVOICE_NO);
  //       console.log('InvoiceNo bound to:', this.invoiceNo);
  //       this.getPendingInvoices(data);
  //       this.selectedInvoice = String(data.INVOICE_NO);
  //       console.log('invoiceNo bound to:', this.invoiceNo);
  //     }

  //     this.selectedInvoice = String(data.INVOICE_NO);
  //     this.transDate = new Date(data.TRANS_DATE);
  //     this.getLedgerCodeDropdown().then(() => {
  //       this.noteDetails = (data.NOTE_DETAIL || []).map((item: any) => {
  //         const match = this.ledgerList.find(
  //           (l: any) => l.HEAD_ID === item.HEAD_ID
  //         );
  //         return {
  //           ...item,
  //           ledgerCode: match?.HEAD_CODE || '',
  //           ledgerName: match?.HEAD_NAME || '',
  //           particulars: item.REMARKS || '',
  //           Amount: item.AMOUNT || '',
  //           gstAmount: item.GST_AMOUNT || '',
  //           HSN_CODE: this.HSNCODE,
  //         };
  //       });
  //     });
  //     console.log(this.noteDetails, 'NOTDETAILSSSSSSSSSS');
  //     this.getCompanyListDropdown(data.DISTRIBUTOR_ID);
  //   }
  // }

  ngOnChanges(changes: SimpleChanges): void {
  if (changes['creditFormData'] && this.creditFormData?.length) {

    const data = this.creditFormData[0];
    console.log(this.creditFormData[0].INVOICE_NO, 'INEDITTTTTTTTTTT');

    // -----------------------------
    // BASIC FIELD BINDING
    // -----------------------------
    this.invoiceNo = String(data.INVOICE_NO);
    this.selectedInvoice = String(data.INVOICE_NO);
    this.transDate = new Date(data.TRANS_DATE);

    this.getPendingInvoices(data);

    // -----------------------------
    //  STEP 1: GET CUSTOMER STATE
    // -----------------------------
    this.companyStateID = this.selectedCompany?.STATE_ID;

    const customerState =
      (data.CUST_STATE ||
       data.SUPP_STATE_NAME ||
       data.STATE_NAME ||
       ''
      ).trim().toLowerCase();

    const companyState = this.companyState?.trim().toLowerCase();
    const sessionGST = parseFloat(this.GST) || 0;

    console.log("Company:", companyState);
    console.log("Customer:", customerState);

    // -----------------------------
    //  STEP 2: APPLY GST
    // -----------------------------
    if (companyState === customerState) {
      console.log("Same State → Apply CGST + SGST");

      this.showCGST = true;
      this.showSGST = true;
      this.showGST = false;

      const half = sessionGST / 2;

      data.NOTE_DETAIL?.forEach((row: any) => {
        row.CGST = half;
        row.SGST = half;
        row.GST = 0;
      });

    } else {
      console.log("Different State → Apply IGST");

      this.showGST = true;
      this.showCGST = false;
      this.showSGST = false;

      data.NOTE_DETAIL?.forEach((row: any) => {
        row.GST = sessionGST;
        row.CGST = 0;
        row.SGST = 0;
      });
    }

     setTimeout(() => {
      const rawNet = Number(this.creditFormData[0].NET_AMOUNT) || 0;

      if (this.creditFormData[0].ROUND_OFF === true) {
        this.creditFormData[0].NET_AMOUNT = Math.round(rawNet);
      } else {
        this.creditFormData[0].NET_AMOUNT = rawNet;
      }

      console.log("FINAL NET AMOUNT:", this.creditFormData[0].NET_AMOUNT);
    });

    // -----------------------------
    // STEP 3: BUILD GRID ROWS
    // -----------------------------
    this.getLedgerCodeDropdown().then(() => {
      this.noteDetails = (data.NOTE_DETAIL || []).map((item: any) => {
        const match = this.ledgerList.find(
          (l: any) => l.HEAD_ID === item.HEAD_ID
        );
        return {
          ...item,
          ledgerCode: match?.HEAD_CODE || '',
          ledgerName: match?.HEAD_NAME || '',
          particulars: item.REMARKS || '',
          Amount: item.AMOUNT || '',
          gstAmount: item.GST_AMOUNT || '',
          HSN_CODE: this.HSNCODE,
        };
      });
    });

    console.log(this.noteDetails, 'NOTDETAILSSSSSSSSSS');

    // Load companies depending on Distributor
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
  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    console.log(this.sessionData, '=================session data==========');
    this.selected_vat_id = this.sessionData.VAT_ID;

     this.selectedCompany = this.sessionData.SELECTED_COMPANY.COMPANY_ID;
 console.log(this.selectedCompany)
 this.companyState = this.sessionData.SELECTED_COMPANY.STATE_NAME;
 console.log(this.companyState)
 this.GST = this.sessionData.GeneralSettings.GST_PERC;
 console.log(this.GST,'GST')
  }

  addNewManualRow() {
    if (!this.noteDetails) {
      this.noteDetails = [];
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

    // Force change detection
    this.noteDetails = [...this.noteDetails, newRow];
    setTimeout(() => {
      const grid = this.itemsGridRef?.instance;
      const newRowIndex = this.noteDetails.length - 1;
      grid?.editCell(newRowIndex, 'ledgerCode');
    }, 100);
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
            grid.focus(grid.getCellElement(rowIndex, 'gstAmount'));
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
    if (e.dataField === 'gstAmount') {
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
            const newRow = {
              SL_NO: this.noteDetails.length + 1,
              HEAD_ID: '',
              AMOUNT: '',
              GST_AMOUNT: '',
              REMARKS: '',
            };

            this.noteDetails.push(newRow);

            setTimeout(() => {
              grid.option('dataSource', [...this.noteDetails]);

              setTimeout(() => {
                const visibleRows = grid.getVisibleRows();
                const newRowIndex = visibleRows.findIndex(
                  (r) => r.data === newRow
                );
                if (newRowIndex >= 0) {
                  grid.editCell(newRowIndex, 'ledgerCode');
                }
              }, 50);
            }, 50);
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

  get calculatedNetAmount(): string {
    let totalAmount = 0;
    let totalGstAmount = 0;

    for (const row of this.noteDetails) {
      totalAmount += parseFloat(row.Amount) || 0;
      totalGstAmount += parseFloat(row.gstAmount) || 0;
    }

    return (totalAmount + totalGstAmount).toFixed(2); // returns a string
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

        calculateTotal = (row: any) => {
    console.log(row)
  const amount = Number(row.Amount) || 0;
 const gst = this.calculateTaxAmount(row) || 0;
  return amount + gst;
};

  calculateTaxAmount = (rowData: any) => {
    const amount = Number(rowData.Amount) || 0;
    const gstPerc = Number(rowData.GST_PERC) || 0;
    return +((amount * gstPerc) / 100).toFixed(2);
  };


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

  // store raw net amount
  this.netAmount = +(totalAmount + totalGST).toFixed(2);

  // if already rounded in backend, apply round-off automatically
  if (this.creditFormData[0]?.ROUND_OFF) {
    this.roundedNetAmount = Math.round(this.netAmount);
  } else {
    this.roundedNetAmount = this.netAmount;
  }
}

onRoundOffChange() {
  if (this.creditFormData[0].ROUND_OFF) {
    this.roundedNetAmount = Math.round(this.netAmount);
  } else {
    this.roundedNetAmount = this.netAmount;
  }
}


   viewPdf(): void {
    console.log(this.CreditNoteid, "ID received in viewPdf()");
    this.isPdfPopupVisible = true;
     this.dataService.selectCreditNote(this.CreditNoteid).subscribe((response: any) => {
       console.log(
        response,
        '=================DN response==================='
      );
      if (response) {
        this.pdfSrc = this.get_pdf(response.Data[0]); // Update iframe source
      }
     });
   }

     get_pdf(data: any): SafeResourceUrl {
         const doc = new jsPDF('p', 'mm', 'a4');
         const pageWidth = doc.internal.pageSize.width;
         const pageHeight = doc.internal.pageSize.height;
         let y = 10;
     
         // ======================================================
         // LOGO (LEFT TOP)
         // ======================================================
         const logoW = 55;
         const logoH = 28;
         doc.setDrawColor(180);
         doc.rect(10, y, logoW, logoH); // TEMP LOGO BOX (replace with addImage)
     
         // ===============================================
         //  DEBITNOTE HEADING (Centered between logo & reference block)
         // ===============================================
         doc.setFont('helvetica', 'bold');
         doc.setFontSize(16);
     
         // compute a centered X between left logo and right reference area
         const leftEdge = 10 + logoW; // end of logo box
         const rightEdge = pageWidth - 80; // start of reference block
         const centerX = (leftEdge + rightEdge) / 2;
     
         doc.text('CREDIT NOTE', centerX, y + 25, { align: 'center' });
     
         // ======================================================
         // RIGHT-TOP HEADER (Debit Note Info)
         // ======================================================
         doc.setFont('helvetica', 'bold');
         doc.setFontSize(10);
     
         const refX = pageWidth - 65; // moved 15mm right
     
         doc.text(`Invoice No : ${data.INVOICE_NO || ''}`, refX, y + 5);
         doc.text(`Reference No : ${data.REF_NO || ''}`, refX, y + 11);
         doc.text(`Date: ${data.TRANS_DATE || ''}`, refX, y + 17);
     
         // doc.text(`Dated : ${data[0].SALE_DATE || ""}`, pageWidth - 80, y + 23);
     
         y += 33;
     
         // ===============================================
         // HORIZONTAL LINE ABOVE SELLER + CUSTOMER BLOCKS
         // ===============================================
         doc.setDrawColor(0);
         doc.setLineWidth(0.5);
         doc.line(10, y, pageWidth - 10, y); // full width line
     
         y += 5; // small spacing
     
         // ======================================================
         // BLUE SELLER BOX (LEFT)
         // ======================================================
         const blueX = 10;
         const blueY = y;
         const blueW = 100;
         const blueH = 38;
     
         doc.setFillColor(204, 229, 255);
         doc.rect(blueX, blueY, blueW, blueH, 'F');
     
         doc.setFont('helvetica', 'bold');
         doc.setFontSize(10);
         doc.text(data.COMPANY_NAME || '', blueX + 3, blueY + 7);
     
         doc.setFont('helvetica', 'normal');
         doc.setFontSize(9);
         doc.text(data.ADDRESS1 || '', blueX + 3, blueY + 13);
         doc.text(data.ADDRESS2 || '', blueX + 3, blueY + 18);
         doc.text(data.ADDRESS3 || '', blueX + 3, blueY + 23);
         doc.text(`GSTIN/UIN: ${data.GSTIN || ''}`, blueX + 3, blueY + 28);
         doc.text(
           `State : ${data.STATE || ''}, Code : ${data.STATE_CODE || ''}`,
           blueX + 3,
           blueY + 33
         );
         doc.text(`E-Mail : ${data.EMAIL || ''}`, blueX + 3, blueY + 38);
     
         // ======================================================
         // CONSIGNEE (RIGHT SIDE)
         // ======================================================
         const shipX = 115;
         const shipY = y;
     
         doc.setFont('helvetica', 'bold');
         doc.text('Consignee (Ship to)', shipX, shipY + 5);
     
         doc.setFont('helvetica', 'normal');
         doc.text(data.CUST_NAME || '', shipX, shipY + 11);
         doc.text(data.CUST_ADDRESS1 || '', shipX, shipY + 16);
         doc.text(data.CUST_ADDRESS2 || '', shipX, shipY + 21);
         doc.text(data.CUST_ADDRESS3 || '', shipX, shipY + 26);
         doc.text(`GSTIN/UIN : ${data.CUST_GSTIN || ''}`, shipX, shipY + 31);
         doc.text(
           `State : ${data.CUST_STATE || ''}, Code : ${data.STATE_CODE || ''}`,
           shipX,
           shipY + 36
         );
     
         y += 48;
     
         // ======================================================
         // BUYER (BILL TO)
         // ======================================================
         const billX = 115;
         const billY = y;
     
         doc.setFont('helvetica', 'bold');
         doc.text('Buyer (Bill to)', billX, billY + 5);
     
         doc.setFont('helvetica', 'normal');
         doc.text(data.CUST_NAME || '', billX, billY + 11);
         doc.text(data.CUST_ADDRESS1 || '', billX, billY + 16);
         doc.text(data.CUST_ADDRESS2 || '', billX, billY + 21);
         doc.text(data.CUST_ADDRESS3 || '', billX, billY + 26);
         doc.text(`GSTIN/UIN : ${data.CUST_GSTIN || ''}`, billX, billY + 31);
         doc.text(
           `State : ${data.CUST_STATE || ''}, Code : ${data.STATE_CODE || ''}`,
           billX,
           billY + 36
         );
     
         y += 50;
     
         // ======================================================
         // TABLE — SAME FORMAT AS IMAGE
         // ======================================================
         const tableColumns = [
           'SL No',
           'Ledger Code',
           'Ledger Name',
           'Particulars',
           'Amount',
           'Tax %',
           'Tax Amount',
           'HSN Code',
         ];
     
         const tableRows: any[] = [];
         const footerRow = [
           '',
           '',
           '',
           '',
           '₹ ' + Number(data.GROSS_AMOUNT).toFixed(2), // 5  (Amount)
           '',
           '',
           '', // 6–7
          //  '₹ ' + Number(data.NET_AMOUNT).toFixed(2), // 8  (Tax Amount?) WRONG
         ];
     
         data.NOTE_DETAIL.forEach((item: any, index: number) => {
     tableRows.push([
       item.SL_NO || '',
       item.LEDGER_CODE || '',
       item.LEDGER_NAME || '',                                 
       item.REMARKS || '',                  // Description
       (item.AMOUNT ?? 0).toFixed(2),       // Amount
       item.GST_PERC ?? '',    
       (item.GST_AMOUNT ?? 0).toFixed(2),   
       item.HSN_CODE ?? '',                 
     ]);
   });
   
         // Move y to bottom of Bill-to block
         y = y + 2;
     
         // ===============================
         // HORIZONTAL LINE LIKE THE FIGURE
         // ===============================
         doc.setDrawColor(0);
         doc.setLineWidth(0.5);
         doc.line(10, y, pageWidth - 10, y); // Full width horizontal line
     
         y += 5; // small gap before table
         (doc as any).autoTable({
           startY: y,
           head: [tableColumns],
           body: tableRows,
           foot: [footerRow],
           theme: 'grid',
           margin: { left: 10, right: 10 },
           styles: { fontSize: 9, cellPadding: 2 },
           headStyles: {
             fillColor: [230, 230, 230],
             textColor: 0,
             halign: 'center',
           },
           footStyles: {
             fillColor: [230, 230, 230], // same color as header
             textColor: 0,
             fontStyle: 'bold',
             halign: 'right',
           },
           columnStyles: {
             5: { halign: 'right' }, // Amount column
             9: { halign: 'right' }, // Total column
           },
         });
     
            // Move below table
y = (doc as any).lastAutoTable.finalY + 10;

// NET AMOUNT LABEL
doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.text("NET AMOUNT :", 130, y);  // Right side label

// NET AMOUNT VALUE
doc.setFont("helvetica", "bold");
doc.text(`₹ ${Number(data.NET_AMOUNT).toFixed(2)}`, 170, y, { align: "right" });
      y += 10;
         // ======================================================
         // AMOUNT IN WORDS BLOCKS
         // ======================================================
     
         // ------------------------
         // 1) GROSS AMOUNT (Amount Chargeable)
         // ------------------------
         const grossAmount = data.GROSS_AMOUNT || 0;
         const grossRupees = Math.floor(grossAmount);
         const grossPaise = Math.round((grossAmount - grossRupees) * 100);
     
         let grossWords = numberToWordsIndianNumber(grossRupees);
         let grossPaiseWords =
           grossPaise > 0 ? numberToWordsIndianNumber(grossPaise) : '';
     
         let grossText = 'INR ' + grossWords + ' Rupees';
         if (grossPaise > 0) grossText += ' and ' + grossPaiseWords + ' Paise';
         grossText += ' Only';
     
         // ------------------------
         // 2) NET AMOUNT (Total Amount)
         // ------------------------
         const netAmount = data.NET_AMOUNT || 0;
         const netRupees = Math.floor(netAmount);
         const netPaise = Math.round((netAmount - netRupees) * 100);
     
         let netWords = numberToWordsIndianNumber(netRupees);
         let netPaiseWords = netPaise > 0 ? numberToWordsIndianNumber(netPaise) : '';
     
         let netText = 'INR ' + netWords + ' Rupees';
         if (netPaise > 0) netText += ' and ' + netPaiseWords + ' Paise';
         netText += ' Only';
     
         // -----------------------------------
         // RIGHT SIDE PRINTING (two sections)
         // -----------------------------------
         const rightX = pageWidth - 90;
     
         doc.setFont('helvetica', 'bold');
         doc.text('Total Amount Chargeable (in words)', rightX, y);
     
         doc.setFont('helvetica', 'normal');
         doc.text(grossText, rightX, y + 6, { maxWidth: 85 });
     
         doc.setFont('helvetica', 'bold');
         doc.text('Total of NetAmount (in words)', rightX, y + 18);
     
         doc.setFont('helvetica', 'normal');
         doc.text(netText, rightX, y + 24, { maxWidth: 85 });
     
         // -----------------------------------
         // LEFT SIDE (E & OE, User, PAN)
         // -----------------------------------
         const leftX = 10;
     
         doc.setFont('helvetica', 'bold');
         doc.text('E & OE :', leftX, y);
     
         doc.text(`User : ${data.USER || ''}`, leftX, y + 6);
     
         doc.text(`Company's PAN : ${data.PAN || ''}`, leftX, y + 12);
     
         // ======================================================
         // SIGNATURE BOX WITH COMPANY NAME
         // ======================================================
         const extraLeft = 20;
         const signBoxX = pageWidth - 70 - extraLeft;
         const signBoxY = y + 34; // 24 + 10 padding
         const signBoxW = 60 + extraLeft;
         const signBoxH = 25;
     
         doc.rect(signBoxX, signBoxY, signBoxW, signBoxH);
     
         // Company name inside the box
         doc.setFont('helvetica', 'bold');
         doc.setFontSize(9);
         doc.text(`for ${data.COMPANY_NAME || ''}`, signBoxX + 3, signBoxY + 10);
     
         // Authorised Signatory text
         doc.setFont('helvetica', 'normal');
         doc.setFontSize(9);
         doc.text('Authorised Signatory', signBoxX + 3, signBoxY + 20);
     doc.output('dataurlnewwindow');
         // ======================================================
         // RETURN PDF
         // ======================================================
         const pdfBlob = doc.output('blob');
         const pdfUrl = URL.createObjectURL(pdfBlob);
         return this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);

         doc.output('dataurlnewwindow');
       }
}


function numberToWordsIndianNumber(num: number) {
  const a = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const b = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  if (num === 0) return 'Zero';

  let str = '';

  if (num >= 10000000) {
    str += numberToWordsIndianNumber(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  if (num >= 100000) {
    str += numberToWordsIndianNumber(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  if (num >= 1000) {
    str += numberToWordsIndianNumber(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  if (num >= 100) {
    str += numberToWordsIndianNumber(Math.floor(num / 100)) + ' Hundred ';
    num %= 100;
  }
  if (num > 0) {
    if (num < 20) str += a[num];
    else str += b[Math.floor(num / 10)] + ' ' + a[num % 10];
  }

  return str.trim();
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
  declarations: [ViewCreditNoteComponent],
  exports: [ViewCreditNoteComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ViewCreditNoteModule {}
