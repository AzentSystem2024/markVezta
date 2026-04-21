import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BrowserModule,
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import {
  DxSelectBoxComponent,
  DxTextBoxComponent,
  DxNumberBoxComponent,
  DxDataGridComponent,
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
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
  DxoSummaryModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';
import { FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import { ArticleAddModule } from '../../ARTICLE/article-add/article-add.component';
import { ArticleEditModule } from '../../ARTICLE/article-edit/article-edit.component';
import { AddJournalVoucharModule } from '../../JOURNAL-VOUCHER/add-journal-vouchar/add-journal-vouchar.component';
import { EditJournalVoucherModule } from '../../JOURNAL-VOUCHER/edit-journal-voucher/edit-journal-voucher.component';
import { ViewJournalVoucherModule } from '../../JOURNAL-VOUCHER/view-journal-voucher/view-journal-voucher.component';
import { EditDebitComponent } from '../edit-debit/edit-debit.component';
import { confirm } from 'devextreme/ui/dialog';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-view-debit',
  templateUrl: './view-debit.component.html',
  styleUrls: ['./view-debit.component.scss'],
})
export class ViewDebitComponent {
  @Output() popupClosed = new EventEmitter<void>();
  @Input() debitFormData: any;
  @Input() DNid!: number;
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

  netAmountDisplay: number;
  formattedTransDate: any;
  docNo: any;
  supplierList: any;
  sessionData: any;
  selected_vat_id: any;
  showCGST: boolean = false;
  showSGST: boolean = false;
  showGST: boolean = false;
  HSNCODE: any;
  hsnLoaded: boolean;
  logoBase64: string;
  isPdfPopupVisible: boolean = false;
  pdfSrc: SafeResourceUrl | null = null;
  GST: any;
  selectedCompany: any;
  companyState: any;
  invoiceNo: any;
  companyStateID: any;
  selectedSupplier: any;
  netAmount: number = 0;
  roundedNetAmount: number = 0;
  subType: boolean = false;
  subTypeList: any;
  vatTilte: any;
  vatTitle: any;
  VatClass: any;
  showSubType: boolean;

  constructor(
    private dataService: DataService,
    private sanitizer: DomSanitizer,
  ) {
    const userDataString = localStorage.getItem('userData');
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
    this.GST = this.sessionData.GeneralSettings.GST_PERC;
  }

  ngOnInit() {
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    this.vatTitle = userData.GeneralSettings.VAT_TITLE;
    this.subType = userData.Configuration[0].SUB_TYPE_ID;
    this.showSubType = !!this.subType;
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      // ✅ Assign Companies array to companyList
      this.companyList = userData.Companies || [];

      // Optionally set a default value
      if (this.companyList.length > 0) {
        this.selectedCompanyId = this.companyList[0].COMPANY_ID;
      }

      // Log for debugging
    } else {
      console.warn('No userData found in localStorage');
    }
    // this.getCompanyListDropdown();
    this.getLedgerCodeDropdown();
    // this.getDocNo();
    this.getSupplierDropdown();
    this.sessionData_tax();

    const imagePath = 'assets/markLogo.jpg';
    this.convertToBase64(imagePath).then((base64) => {
      this.logoBase64 = base64;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['debitFormData'] || !this.debitFormData?.length) return;

    const data = this.debitFormData[0];
    console.log(this.debitFormData[0], 'DEBITFORMDATA=========');
    this.selectedCompanyId = data.COMPANY_ID;

    setTimeout(() => {
      this.itemsGridRef?.instance?.beginCustomLoading('Loading...');
    });

    // -----------------------------
    // BASIC HEADER BINDINGS
    // -----------------------------
    this.invoiceNo = data.INVOICE_NO;
    this.docNo = data.DOC_NO;
    this.netAmountDisplay = Number(data.NET_AMOUNT) || 0;

    this.transDate = new Date(data.TRANS_DATE);
    this.formattedTransDate = this.formatAsDDMMYYYY(this.transDate);

    // -----------------------------
    // GST COLUMN VISIBILITY (FROM SAVED DATA ONLY)
    // -----------------------------
    this.showCGST = false;
    this.showSGST = false;
    this.showGST = false;

    const firstRow = data.NOTE_DETAIL?.[0];

    Promise.all([
      this.getLedgerCodeDropdown(),
      this.getVatPercentListPromise(), // 👈 create this
    ])
      .then(() => {
        this.noteDetails = (data.NOTE_DETAIL || []).map(
          (item: any, index: number) => {
            const match = this.ledgerList.find(
              (l: any) => l.HEAD_ID === item.HEAD_ID,
            );

            let gstPerc = 0;

            return {
              SL_NO: index + 1,
              ...item,
              ledgerCode: match?.HEAD_CODE || '',
              ledgerName: match?.HEAD_NAME || '',
              particulars: item.REMARKS || '',
              Amount: item.AMOUNT || '',
              gstAmount: item.GST_AMOUNT || '',
              HSN_CODE: item.HSN_CODE || this.HSNCODE,
              // GST_PERC: gstPerc,
              GST_PERC: item.GST_PERC,
              GST_ID: item.GST_PERC,
              CGST: 0,
              SGST: 0,
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

  getGstDisplayValue = (row: any) => {
    const gstId = row.GST_PERC; // this is ID (16,17...)

    const match = this.VatClass?.find((v: any) => v.ID === gstId);

    return match ? match.DESCRIPTION : gstId;
  };

  private hasEmptyRow(): boolean {
    return (this.noteDetails || []).some(
      (r: any) =>
        !r.ledgerCode &&
        !r.ledgerName &&
        !r.particulars &&
        (!r.Amount || r.Amount === 0) &&
        (!r.GST_PERC || r.GST_PERC === 0),
    );
  }

  applyGstForRow(row: any) {
    const sessionGst = parseFloat(this.GST) || 0;

    // Same State → CGST + SGST
    if (this.companyStateID === this.selectedSupplier?.STATE_ID) {
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
  onAddNewRow() {
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

  // getDocNo() {
  //   this.dataService.getDocNoForDebit().subscribe((response: any) => {
  //     this.docNo = response.DOC_NO;
  //   });
  // }

  getSupplierDropdown() {
    const payload = {
      COMPANY_ID: this.selectedCompany,
    };
    this.dataService
      .getSupplierWithState(payload)
      .subscribe((response: any) => {
        this.supplierList = response;
      });
  }

  formatDateColumn = (rowData: any) => {
    return this.formatAsDDMMYYYY(new Date(rowData.TRANS_DATE));
  };

  private formatAsDDMMYYYY(d: Date): string {
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  onInvoiceEnterKey(e: any): void {
    if (e.event.key === 'Enter') {
      this.companySelectBoxRef?.instance?.focus();
    }
  }

  getCompanyListDropdown() {
    this.dataService
      .getDropdownData('COMPANY_LIST')
      .subscribe((response: any) => {
        this.companyList = response;
      });
  }

  getLedgerCodeDropdown(): Promise<void> {
    return new Promise((resolve) => {
      this.dataService.getActiveLedger().subscribe((response: any) => {
        this.ledgerList = response.Data;
        resolve();
      });
    });
  }

  getVatPercentListPromise(): Promise<void> {
    return new Promise((resolve) => {
      const payload = {
        COMPANY_ID: this.selectedCompanyId,
        NAME: 'VAT_PERC',
      };

      this.dataService.getDropdownData(payload).subscribe((data) => {
        this.VatClass = data.map((item: any) => ({
          ...item,
          VALUE: Number(item.DESCRIPTION),
          DESCRIPTION: Number(item.DESCRIPTION).toString(),
        }));
        resolve();
      });
    });
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

  onNarrationKeyDown(e: any): void {
    if (e.event.key === 'Enter' || e.event.key === 'Tab') {
      e.event.preventDefault();

      setTimeout(() => {
        this.saveButtonRef?.instance?.focus();
      }, 0);
    }
  }

  onEditorPreparing(e: any) {
    if (e.parentType !== 'dataRow') return;
    const rowIndex = e.row?.rowIndex;

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
          e.component.cellValue(
            rowIndex,
            'ledgerName',
            selectedLedger.HEAD_NAME,
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
            grid.focus(grid.getCellElement(rowIndex, 'gstAmount'));
          });
        }
      };
    }

    if (e.dataField === 'GST_PERC') {
      const originalOnValueChanged = e.editorOptions.onValueChanged;

      //  VALUE CHANGE (Dropdown select)
      e.editorOptions.onValueChanged = (args: any) => {
        if (originalOnValueChanged) {
          originalOnValueChanged(args);
        }

        e.setValue(args.value);

        const rowIndex = e.row.rowIndex;

        //  FIND SELECTED VAT
        const selectedVat = this.VatClass.find((v: any) => v.ID === args.value);

        console.log(selectedVat, 'selectedVat--------');

        if (selectedVat) {
          const percent = Number(selectedVat.DESCRIPTION);

          //  STORE ID (hidden)
          e.component.cellValue(rowIndex, 'GST_ID', selectedVat.ID);

          // STORE % (visible)
          e.component.cellValue(rowIndex, 'GST_PERC', percent);

          //  CALCULATE GST
          const amount = Number(e.row.data.Amount) || 0;
          const gst = (amount * percent) / 100;

          e.component.cellValue(rowIndex, 'gstAmount', +gst.toFixed(2));
        }

        //  reset split
        e.row.data.CGST = 0;
        e.row.data.SGST = 0;
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
            const rows = grid.getVisibleRows().map((r) => r.data);
            let netTotal = 0;
            for (const row of rows) {
              const amount = parseFloat(row.Amount) || 0;
              const gst = parseFloat(row.gstAmount) || 0;
              netTotal += amount + gst;
            }
            this.netAmountDisplay = netTotal;
            // ✅ Add new row manually
            const newRow = {
              SL_NO: '',
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
                  (r) => r.data === newRow,
                );
                if (newRowIndex >= 0) {
                  grid.editCell(newRowIndex, 'SL_NO');
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
  }

  cancel() {
    this.popupClosed.emit();
  }

  onApprovedChanged(e: any) {
    this.debitFormData.IS_APPROVED = e.value;
  }

  updateDebitNote() {
    if (this.debitFormData.IS_APPROVED) {
      confirm(
        'It will approve and commit. Are you sure you want to commit?',
        'Confirm Commit',
      ).then((result) => {
        if (result) {
          const payload = {
            TRANS_ID: this.debitFormData[0].TRANS_ID,
            IS_APPROVED: true,
          };

          this.dataService.commitDebitNote(payload).subscribe(
            (response: any) => {
              if (response.flag === 1) {
                notify('Debit Note approved successfully!', 'success', 3000);
                this.popupClosed.emit(); // Close popup
              } else {
                notify(`Approval failed: ${response.Message}`, 'error', 4000);
              }
            },
            (error) => {
              console.error('Approval error:', error);
              alert('Something went wrong while approving');
            },
          );
        } else {
          // ❌ User cancelled commit
          notify('Approval cancelled.', 'info', 2000);
        }
      });

      return; // 🚫 Prevent running normal update block
    } else {
      const payload = {
        TRANS_ID: this.debitFormData[0].TRANS_ID,
        TRANS_TYPE: 37,
        COMPANY_ID: this.selectedCompanyId,
        STORE_ID: 1,
        TRANS_DATE: this.transDate,
        TRANS_STATUS: 1,
        NARRATION:
          this.debitFormData[0].NARRATION || 'Update Details of Credit Note',
        INVOICE_ID: this.debitFormData[0].INVOICE_ID || 0,
        INVOICE_NO: this.debitFormData[0].INVOICE_NO || '',
        SUPP_ID: this.debitFormData[0].SUPP_ID || 0,
        DISTRIBUTOR_ID: this.debitFormData[0].DISTRIBUTOR_ID || 0,
        IS_APPROVED: false,
        NOTE_DETAIL: this.noteDetails
          .filter(
            (item) =>
              item.ledgerCode ||
              item.ledgerName ||
              item.Amount ||
              item.gstAmount ||
              item.particulars,
          )
          .map((item: any, index: number) => {
            const match = this.ledgerList.find(
              (l) =>
                l.HEAD_CODE === item.ledgerCode ||
                l.HEAD_NAME === item.ledgerName,
            );
            return {
              SL_NO: item.SL_NO || index + 1,
              HEAD_ID: match?.HEAD_ID || item.HEAD_ID,
              AMOUNT: Number(item.Amount) || 0,
              GST_AMOUNT: Number(item.gstAmount) || 0,
              REMARKS: item.particulars || '',
            };
          }),
      };

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
    const amount = Number(row.Amount) || 0;
    // const gst = this.calculateTaxAmount(row) || 0;
    const gst = Number(row.gstAmount) || 0;
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
    if (this.debitFormData[0]?.ROUND_OFF) {
      this.roundedNetAmount = Math.round(this.netAmount);
    } else {
      this.roundedNetAmount = this.netAmount;
    }
  }

  onRoundOffChange() {
    if (this.debitFormData[0].ROUND_OFF) {
      this.roundedNetAmount = Math.round(this.netAmount);
    } else {
      this.roundedNetAmount = this.netAmount;
    }
  }

  viewPdf(): void {
    // this.isPdfPopupVisible = true;

    this.dataService.selectDebitNote(this.DNid).subscribe((response: any) => {
      if (response) {
        this.pdfSrc = this.get_pdf(response.Data[0]); // Update iframe source
      }
    });
  }

  //   get_pdf(data: any): SafeResourceUrl {
  //       const doc = new jsPDF('p', 'mm', 'a4');
  //       const pageWidth = doc.internal.pageSize.width;
  //       const pageHeight = doc.internal.pageSize.height;
  //       let y = 10;

  //       // ======================================================
  //       // LOGO (LEFT TOP)
  //       // ======================================================
  //       const logoW = 55;
  //       const logoH = 28;
  //       doc.setDrawColor(180);
  //       doc.rect(10, y, logoW, logoH); // TEMP LOGO BOX (replace with addImage)

  //       // ===============================================
  //       //  DEBITNOTE HEADING (Centered between logo & reference block)
  //       // ===============================================
  //       doc.setFont('helvetica', 'bold');
  //       doc.setFontSize(16);

  //       // compute a centered X between left logo and right reference area
  //       const leftEdge = 10 + logoW; // end of logo box
  //       const rightEdge = pageWidth - 80; // start of reference block
  //       const centerX = (leftEdge + rightEdge) / 2;

  //       doc.text('DEBIT NOTE', centerX, y + 25, { align: 'center' });

  //       // ======================================================
  //       // RIGHT-TOP HEADER (Debit Note Info)
  //       // ======================================================
  //       doc.setFont('helvetica', 'bold');
  //       doc.setFontSize(10);

  //       const refX = pageWidth - 65; // moved 15mm right

  //       doc.text(`Invoice No : ${data.INVOICE_NO || ''}`, refX, y + 5);
  //       doc.text(`Reference No : ${data.REF_NO || ''}`, refX, y + 11);
  //       doc.text(`Date: ${data.TRANS_DATE || ''}`, refX, y + 17);

  //       // doc.text(`Dated : ${data[0].SALE_DATE || ""}`, pageWidth - 80, y + 23);

  //       y += 33;

  //       // ===============================================
  //       // HORIZONTAL LINE ABOVE SELLER + CUSTOMER BLOCKS
  //       // ===============================================
  //       doc.setDrawColor(0);
  //       doc.setLineWidth(0.5);
  //       doc.line(10, y, pageWidth - 10, y); // full width line

  //       y += 5; // small spacing

  //       // ======================================================
  //       // BLUE SELLER BOX (LEFT)
  //       // ======================================================
  //       const blueX = 10;
  //       const blueY = y;
  //       const blueW = 100;
  //       const blueH = 38;

  //       doc.setFillColor(204, 229, 255);
  //       doc.rect(blueX, blueY, blueW, blueH, 'F');

  //       doc.setFont('helvetica', 'bold');
  //       doc.setFontSize(10);
  //       doc.text(data.COMPANY_NAME || '', blueX + 3, blueY + 7);

  //       doc.setFont('helvetica', 'normal');
  //       doc.setFontSize(9);
  //       doc.text(data.ADDRESS1 || '', blueX + 3, blueY + 13);
  //       doc.text(data.ADDRESS2 || '', blueX + 3, blueY + 18);
  //       doc.text(data.ADDRESS3 || '', blueX + 3, blueY + 23);
  //       doc.text(`GSTIN/UIN: ${data.GSTIN || ''}`, blueX + 3, blueY + 28);
  //       doc.text(
  //         `State : ${data.STATE || ''}, Code : ${data.STATE_CODE || ''}`,
  //         blueX + 3,
  //         blueY + 33
  //       );
  //       doc.text(`E-Mail : ${data.EMAIL || ''}`, blueX + 3, blueY + 38);

  //       // ======================================================
  //       // CONSIGNEE (RIGHT SIDE)
  //       // ======================================================
  //       const shipX = 115;
  //       const shipY = y;

  //       doc.setFont('helvetica', 'bold');
  //       doc.text('Consignee (Ship to)', shipX, shipY + 5);

  //       doc.setFont('helvetica', 'normal');
  //       doc.text(data.SUPP_NAME || '', shipX, shipY + 11);
  //       doc.text(data.SUPP_ADDRESS1 || '', shipX, shipY + 16);
  //       doc.text(data.SUPP_ADDRESS2 || '', shipX, shipY + 21);
  //       doc.text(data.SUPP_ADDRESS3 || '', shipX, shipY + 26);
  //       doc.text(`GSTIN/UIN : ${data.CUST_GSTIN || ''}`, shipX, shipY + 31);
  //       doc.text(
  //         `State : ${data.SUPP_STATE_NAME || ''}, Code : ${data.STATE_CODE || ''}`,
  //         shipX,
  //         shipY + 36
  //       );

  //       y += 48;

  //       // ======================================================
  //       // BUYER (BILL TO)
  //       // ======================================================
  //       const billX = 115;
  //       const billY = y;

  //       doc.setFont('helvetica', 'bold');
  //       doc.text('Buyer (Bill to)', billX, billY + 5);

  //       doc.setFont('helvetica', 'normal');
  //       doc.text(data.SUPP_NAME || '', billX, billY + 11);
  //       doc.text(data.SUPP_ADDRESS1 || '', billX, billY + 16);
  //       doc.text(data.SUPP_ADDRESS2 || '', billX, billY + 21);
  //       doc.text(data.SUPP_ADDRESS3 || '', billX, billY + 26);
  //       doc.text(`GSTIN/UIN : ${data.CUST_GSTIN || ''}`, billX, billY + 31);
  //       doc.text(
  //         `State : ${data.SUPP_STATE_NAME || ''}, Code : ${data.STATE_CODE || ''}`,
  //         billX,
  //         billY + 36
  //       );

  //       y += 50;

  //       // ======================================================
  //       // TABLE — SAME FORMAT AS IMAGE
  //       // ======================================================
  //       const tableColumns = [
  //         'Sl no.',
  //         'Ledger Code',
  //         'ledger Name',
  //         'Particulars',
  //         'Amount',
  //         'Tax %',
  //         'HSN Code',
  //         'Tax Amount',

  //       ];

  //       const tableRows: any[] = [];
  //       const footerRow = [
  //         '',
  //         '',
  //         '',
  //         '',
  //         '₹ ' + Number(data.GROSS_AMOUNT).toFixed(2), // 5  (Amount)
  //         '',
  //         '',
  //         '', // 6–7
  //         // '₹ ' + Number(data.NET_AMOUNT).toFixed(2), // 8  (Tax Amount?) WRONG
  //       ];

  //       data.NOTE_DETAIL.forEach((item: any, index: number) => {
  //   tableRows.push([
  //     item.SL_NO || '',
  //      item.LEDGER_CODE || '',
  //      item.LEDGER_NAME || '',
  //     item.REMARKS || '',
  //     (item.AMOUNT ?? 0).toFixed(2),       // Amount
  //     item.GST_PERC ?? '',                 // GST %
  //     item.HSN_CODE ?? '',                 // HSN
  //     (item.GST_AMOUNT ?? 0).toFixed(2),   // Tax Amount
  //   ]);
  // });

  //       // Move y to bottom of Bill-to block
  //       y = y + 2;

  //       // ===============================
  //       // HORIZONTAL LINE LIKE THE FIGURE
  //       // ===============================
  //       doc.setDrawColor(0);
  //       doc.setLineWidth(0.5);
  //       doc.line(10, y, pageWidth - 10, y); // Full width horizontal line

  //       y += 5; // small gap before table
  //       (doc as any).autoTable({
  //         startY: y,
  //         head: [tableColumns],
  //         body: tableRows,
  //         foot: [footerRow],
  //         theme: 'grid',
  //         margin: { left: 10, right: 10 },
  //         styles: { fontSize: 9, cellPadding: 2 },
  //         headStyles: {
  //           fillColor: [230, 230, 230],
  //           textColor: 0,
  //           halign: 'center',
  //         },
  //         footStyles: {
  //           fillColor: [230, 230, 230], // same color as header
  //           textColor: 0,
  //           fontStyle: 'bold',
  //           halign: 'right',
  //         },
  //         columnStyles: {
  //           5: { halign: 'right' }, // Amount column
  //           9: { halign: 'right' }, // Total column
  //         },
  //       });

  //      // Move below table
  // y = (doc as any).lastAutoTable.finalY + 10;

  // // NET AMOUNT LABEL
  // doc.setFont("helvetica", "bold");
  // doc.setFontSize(11);
  // doc.text("NET AMOUNT :", 130, y);  // Right side label

  // // NET AMOUNT VALUE
  // doc.setFont("helvetica", "bold");
  // doc.text(`₹ ${Number(data.NET_AMOUNT).toFixed(2)}`, 170, y, { align: "right" });
  //       y += 10;
  //       // ======================================================
  //       // AMOUNT IN WORDS BLOCKS
  //       // ======================================================

  //       // ------------------------
  //       // 1) GROSS AMOUNT (Amount Chargeable)
  //       // ------------------------
  //       const grossAmount = data.GROSS_AMOUNT || 0;
  //       const grossRupees = Math.floor(grossAmount);
  //       const grossPaise = Math.round((grossAmount - grossRupees) * 100);

  //       let grossWords = numberToWordsIndianNumber(grossRupees);
  //       let grossPaiseWords =
  //         grossPaise > 0 ? numberToWordsIndianNumber(grossPaise) : '';

  //       let grossText = 'INR ' + grossWords + ' Rupees';
  //       if (grossPaise > 0) grossText += ' and ' + grossPaiseWords + ' Paise';
  //       grossText += ' Only';

  //       // ------------------------
  //       // 2) NET AMOUNT (Total Amount)
  //       // ------------------------
  //       const netAmount = data.NET_AMOUNT || 0;
  //       const netRupees = Math.floor(netAmount);
  //       const netPaise = Math.round((netAmount - netRupees) * 100);

  //       let netWords = numberToWordsIndianNumber(netRupees);
  //       let netPaiseWords = netPaise > 0 ? numberToWordsIndianNumber(netPaise) : '';

  //       let netText = 'INR ' + netWords + ' Rupees';
  //       if (netPaise > 0) netText += ' and ' + netPaiseWords + ' Paise';
  //       netText += ' Only';

  //       // -----------------------------------
  //       // RIGHT SIDE PRINTING (two sections)
  //       // -----------------------------------
  //       const rightX = pageWidth - 90;

  //       doc.setFont('helvetica', 'bold');
  //       doc.text('Total Amount Chargeable (in words)', rightX, y);

  //       doc.setFont('helvetica', 'normal');
  //       doc.text(grossText, rightX, y + 6, { maxWidth: 85 });

  //       doc.setFont('helvetica', 'bold');
  //       doc.text('Total of NetAmount (in words)', rightX, y + 18);

  //       doc.setFont('helvetica', 'normal');
  //       doc.text(netText, rightX, y + 24, { maxWidth: 85 });

  //       // -----------------------------------
  //       // LEFT SIDE (E & OE, User, PAN)
  //       // -----------------------------------
  //       const leftX = 10;

  //       doc.setFont('helvetica', 'bold');
  //       doc.text('E & OE :', leftX, y);

  //       doc.text(`User : ${data.USER || ''}`, leftX, y + 6);

  //       doc.text(`Company's PAN : ${data.PAN || ''}`, leftX, y + 12);

  //       // ======================================================
  //       // SIGNATURE BOX WITH COMPANY NAME
  //       // ======================================================
  //       const extraLeft = 20;
  //       const signBoxX = pageWidth - 70 - extraLeft;
  //       const signBoxY = y + 34; // 24 + 10 padding
  //       const signBoxW = 60 + extraLeft;
  //       const signBoxH = 25;

  //       doc.rect(signBoxX, signBoxY, signBoxW, signBoxH);

  //       // Company name inside the box
  //       doc.setFont('helvetica', 'bold');
  //       doc.setFontSize(9);
  //       doc.text(`for ${data.COMPANY_NAME || ''}`, signBoxX + 3, signBoxY + 10);

  //       // Authorised Signatory text
  //       doc.setFont('helvetica', 'normal');
  //       doc.setFontSize(9);
  //       doc.text('Authorised Signatory', signBoxX + 3, signBoxY + 20);

  //       // ======================================================
  //       // RETURN PDF
  //       // ======================================================
  //       const pdfBlob = doc.output('blob');
  //       const pdfUrl = URL.createObjectURL(pdfBlob);
  //       return this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
  //     }

  get_pdf(data: any): SafeResourceUrl {
    // ------------------------------------------------------
    // 🔥 FIX 1: API RETURNS ARRAY → Normalize to object
    // ------------------------------------------------------
    if (Array.isArray(data)) {
      data = data[0];
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    let y = 10;

    // ======================================================
    // LOGO LEFT TOP
    // ======================================================
    const logoX = 18,
      logoY = 12,
      logoW = 30,
      logoH = 30;
    doc.setFillColor(225, 225, 225);
    doc.rect(logoX, logoY, logoW, logoH, 'F');
    doc.addImage(this.logoBase64, 'jpg', logoX, logoY, logoW, logoH);

    // CREDIT NOTE HEADING
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('DEBIT NOTE', pageWidth / 2, y + 25, { align: 'center' });

    // RIGHT HEADER INFO
    doc.setFontSize(10);
    const refX = pageWidth - 65;
    doc.text(`GST IN : ${data.GST_NO}`, refX, y + 5);
    doc.text(`CIN : ${data.CIN}`, refX, y + 11);
    doc.text(`PAN : ${data.PAN_NO}`, refX, y + 17);

    y += 33;

    // Horizontal Line
    doc.setDrawColor(0);
    doc.line(10, y, pageWidth - 10, y);
    y += 5;

    // ======================================================
    // BLUE SELLER BOX
    // ======================================================
    const blueX = 10,
      blueY = y,
      blueW = 100,
      blueH = 38;
    doc.setFillColor(204, 229, 255);
    doc.rect(blueX, blueY, blueW, blueH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(data.COMPANY_NAME, blueX + 3, blueY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(data.ADDRESS1, blueX + 3, blueY + 13);
    doc.text(data.ADDRESS2, blueX + 3, blueY + 18);
    doc.text(data.ADDRESS3, blueX + 3, blueY + 23);
    doc.text(`GSTIN/UIN: ${data.GST_NO}`, blueX + 3, blueY + 28);
    doc.text(
      `State : ${data.SUPP_STATE_NAME}, Code : 32`,
      blueX + 3,
      blueY + 33,
    );
    doc.text(`E-Mail : ${data.EMAIL}`, blueX + 3, blueY + 38);

    // ======================================================
    // NEW BLOCK — DISPATCHED FROM
    // ======================================================
    y = blueY + blueH + 12;
    let gap = 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Dispatched From', 10, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    doc.text(data.COMPANY_NAME || '', 10, y + gap);
    doc.text(data.SUPP_ADDRESS1 || '', 10, y + gap * 2);
    doc.text(data.SUPP_ADDRESS2 || '', 10, y + gap * 3);
    doc.text(data.SUPP_ADDRESS3 || '', 10, y + gap * 4);
    doc.text(`GSTIN/UIN : ${data.GST_NO}`, 10, y + gap * 5);

    y = y + gap * 6 + 8;

    // ======================================================
    // INVOICE SERIAL SECTION
    // ======================================================
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Invoice Serial No: ${data.INVOICE_NO}`, 10, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Invoice Date: ${data.TRANS_DATE}`, 10, y + gap);
    doc.text(`Vehicle No: ${data.VEHICLE_NO}`, 10, y + gap * 2);
    doc.text(`Mode of Transport:`, 10, y + gap * 3);

    const leftBlockBottom = y + gap * 4 + 10;

    // ======================================================
    // CONSIGNEE RIGHT SIDE
    // ======================================================
    let rightX = 125;
    let rightY = y - 85; // Adjust upward

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Consignee (Ship to)', rightX, rightY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(data.SUPP_NAME, rightX, rightY + gap);
    doc.text(data.SUPP_ADDRESS1, rightX, rightY + gap * 2);
    doc.text(data.SUPP_ADDRESS2, rightX, rightY + gap * 3);
    doc.text(data.SUPP_ADDRESS3, rightX, rightY + gap * 4);
    doc.text(`GSTIN/UIN : ${data.SUPP_CODE}`, rightX, rightY + gap * 5);
    doc.text(
      `State : ${data.SUPP_STATE_NAME}, Code : 32`,
      rightX,
      rightY + gap * 6,
    );

    // ======================================================
    // BUYER BELOW CONSIGNEE
    // ======================================================
    let buyerY = rightY + gap * 7 + 4;

    doc.setFont('helvetica', 'bold');
    doc.text('Buyer (Bill to)', rightX, buyerY);

    doc.setFont('helvetica', 'normal');
    doc.text(data.SUPP_NAME, rightX, buyerY + gap);
    doc.text(data.SUPP_ADDRESS1, rightX, buyerY + gap * 2);
    doc.text(data.SUPP_ADDRESS2, rightX, buyerY + gap * 3);
    doc.text(data.SUPP_ADDRESS3, rightX, buyerY + gap * 4);
    doc.text(`GSTIN/UIN : ${data.SUPP_CODE}`, rightX, buyerY + gap * 5);
    doc.text(
      `State : ${data.SUPP_STATE_NAME}, Code : 32`,
      rightX,
      buyerY + gap * 6,
    );

    y = Math.max(leftBlockBottom, buyerY + gap * 7 + 10);

    // ======================================================
    // MAIN TABLE
    // ======================================================
    const columns = [
      'Ledger Code',
      'Ledger Name',
      'Particular',
      'Amount',
      'GST Amount',
      'CGST',
      'SGST',
      'HSN Code',
      'Total',
    ];

    const rows = [];

    data.NOTE_DETAIL.forEach((item) => {
      const totalValue = (item.AMOUNT || 0) + (item.GST_AMOUNT || 0);

      rows.push([
        item.SL_NO,
        item.HEAD_ID,
        item.REMARKS || '',
        item.AMOUNT.toFixed(2),
        item.GST_AMOUNT.toFixed(2),
        item.CGST.toFixed(2),
        item.SGST.toFixed(2),
        item.HSN_CODE || '',
        totalValue.toFixed(2),
      ]);
    });

    const footerRow = [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'Total',
      data.NET_AMOUNT.toFixed(2),
    ];

    (doc as any).autoTable({
      startY: y - 5,
      head: [columns],
      body: rows,
      foot: [footerRow],
      theme: 'grid',
      margin: { left: 10, right: 10 },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [230, 230, 230] },
      footStyles: {
        fillColor: [0, 180, 150],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'right',
      },
      columnStyles: { 8: { halign: 'right' } },
    });

    y = (doc as any).lastAutoTable.finalY + 12;

    // ============================================================
    // FOOTER - EXACTLY LIKE THE PROVIDED SCREENSHOT
    // ============================================================

    const footStartY = (doc as any).lastAutoTable.finalY + 15;

    // ---------------- LEFT GST SUMMARY TABLE ----------------
    let lx = 15;
    let ly = footStartY;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);

    // Header row (super compact spacing)
    doc.text('GST %', lx, ly);
    doc.text('Taxable Value', lx + 22, ly);
    doc.text('Integrated Tax', lx + 50, ly);
    doc.text('Total Tax Amount', lx + 85, ly);

    // Sub-headers (more compact)
    doc.setFontSize(8);
    doc.text('Rate', lx + 50, ly + 5);
    doc.text('Amount', lx + 68, ly + 5);

    // Values row
    ly += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const taxable = Number(data.NET_AMOUNT || 0);
    const gstAmount = Number(data.NOTE_DETAIL[0].GST_AMOUNT || 0);
    const gstPerc =
      Number(data.NOTE_DETAIL[0].CGST || 0) +
      Number(data.NOTE_DETAIL[0].SGST || 0);

    // Compact data alignment
    doc.text(gstPerc.toFixed(2) + '%', lx, ly);
    doc.text(taxable.toFixed(2), lx + 22, ly);
    doc.text(gstPerc.toFixed(2) + '%', lx + 50, ly);
    doc.text(gstAmount.toFixed(2), lx + 68, ly);
    doc.text(gstAmount.toFixed(2), lx + 85, ly);

    // TOTAL ROW (bold, compact)
    ly += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(taxable.toFixed(2), lx + 22, ly);
    doc.text(gstAmount.toFixed(2), lx + 68, ly);
    doc.text(gstAmount.toFixed(2), lx + 85, ly);

    // ---------------- RIGHT SUMMARY ----------------
    let rx = pageWidth - 65;
    let ry = footStartY;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const labelX = rx;
    const colonX = rx + 30;
    const valueX = rx + 40;

    // Taxable Value
    doc.text('Taxable Value', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(taxable.toFixed(2), valueX, ry);

    // Total Tax
    ry += 6;
    doc.text('Total Tax', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(gstAmount.toFixed(2), valueX, ry);

    // TCS
    ry += 6;
    doc.text('TCS', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text('0.00', valueX, ry);

    // Round Off
    ry += 6;
    const roundOff = taxable + gstAmount - Math.floor(taxable + gstAmount);
    doc.text('Round Off', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(roundOff.toFixed(2), valueX, ry);

    // Invoice Total — BOLD
    ry += 8;
    const invoiceTotal = Math.floor(taxable + gstAmount);

    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Total', labelX, ry);
    doc.text(':', colonX, ry);
    doc.text(invoiceTotal.toFixed(2), valueX, ry);

    // ---------------- REVERSE CHARGE + AMOUNT IN WORDS ----------------
    let wordsY = ry + 15;

    doc.setFont('helvetica', 'bold');
    doc.text(
      'Whether the tax is payable on Reverse charge basis: ',
      15,
      wordsY,
    );

    doc.setFont('helvetica', 'normal');
    doc.text('No Amount of tax subject to reverse charge', 120, wordsY);

    // Amount in words
    wordsY += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Amount in words :', 15, wordsY);

    doc.setFont('helvetica', 'normal');
    doc.text(`INR ${this.numberToWords(taxable)} Rupees Only`, 60, wordsY);

    // ---------------- DECLARATION + REMARK ----------------
    let blockY = wordsY + 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Declaration :', 15, blockY);

    blockY += 10;
    doc.text('Remark :', 15, blockY);

    doc.setFont('helvetica', 'normal');
    doc.text(data.NARRATION || '', 40, blockY);

    // ---------------- SIGNATURE ----------------
    let sigY = blockY + 25;

    doc.setFont('helvetica', 'bold');
    doc.text(`For ${data.COMPANY_NAME}`, pageWidth - 90, sigY);

    sigY += 18;
    doc.setFont('helvetica', 'normal');
    doc.text('Authorised Signatory', pageWidth - 75, sigY);

    // ======================================================
    // OPEN PDF IN NEW TAB
    // ======================================================
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // get_pdf(data: any): SafeResourceUrl {
  //   const doc = new jsPDF('p', 'mm', 'a4');
  //   const pageWidth = doc.internal.pageSize.width;
  //   let y = 10;

  //   // ======================================================
  //   // LOGO LEFT TOP
  //   // ======================================================
  //   const logoX = 18, logoY = 12, logoW = 30, logoH = 30;
  //   doc.setFillColor(225, 225, 225);
  //   doc.rect(logoX, logoY, logoW, logoH, 'F');
  //   doc.addImage(this.logoBase64, 'jpg', logoX, logoY, logoW, logoH);

  //   // CREDIT NOTE HEADING
  //   doc.setFont('helvetica', 'bold');
  //   doc.setFontSize(16);
  //   doc.text('DEBIT NOTE', pageWidth / 2, y + 25, { align: 'center' });

  //   // RIGHT HEADER INFO
  //   doc.setFontSize(10);
  //   const refX = pageWidth - 65;
  //   doc.text(`GST IN : ${data[0].GST_NO}`, refX, y + 5);
  //   doc.text(`CIN : ${data[0].CIN}`, refX, y + 11);
  //   doc.text(`PAN : ${data[0].PAN_NO}`, refX, y + 17);

  //   y += 33;

  //   // Horizontal Line
  //   doc.setDrawColor(0);
  //   doc.line(10, y, pageWidth - 10, y);
  //   y += 5;

  //   // ======================================================
  //   // BLUE SELLER BOX
  //   // ======================================================
  //   const blueX = 10, blueY = y, blueW = 100, blueH = 38;
  //   doc.setFillColor(204, 229, 255);
  //   doc.rect(blueX, blueY, blueW, blueH, 'F');

  //   doc.setFont('helvetica', 'bold');
  //   doc.setFontSize(10);
  //   doc.text(data.COMPANY_NAME, blueX + 3, blueY + 7);

  //   doc.setFont('helvetica', 'normal');
  //   doc.setFontSize(9);
  //   doc.text(data.ADDRESS1, blueX + 3, blueY + 13);
  //   doc.text(data.ADDRESS2, blueX + 3, blueY + 18);
  //   doc.text(data.ADDRESS3, blueX + 3, blueY + 23);
  //   doc.text(`GSTIN/UIN: ${data.GST_NO}`, blueX + 3, blueY + 28);
  //   doc.text(`State : ${data.CUST_STATE}, Code : 32`, blueX + 3, blueY + 33);
  //   doc.text(`E-Mail : ${data.EMAIL}`, blueX + 3, blueY + 38);

  //   // ======================================================
  //   // DISPATCH LEFT SIDE
  //   // ======================================================
  //   y = blueY + blueH + 12;
  //   let gap = 7;

  //   // ======================================================
  // // NEW BLOCK — DISPATCHED FROM (Placed between Company box & Invoice Serial No)
  // // ======================================================
  // doc.setFont('helvetica', 'bold');
  // doc.setFontSize(12);
  // doc.text("Dispatched From", 10, y);

  // doc.setFont('helvetica', 'normal');
  // doc.setFontSize(11);

  // // Company Name & Address as dispatched details
  // doc.text(data.COMPANY_NAME || "", 10, y + gap);
  // doc.text(data.SUPP_ADDRESS1 || "", 10, y + gap * 2);
  // doc.text(data.SUPP_ADDRESS2 || "", 10, y + gap * 3);
  // doc.text(data.SUPP_ADDRESS3 || "", 10, y + gap * 4);
  // doc.text(`GSTIN/UIN : ${data.GST_NO || ""}`, 10, y + gap * 5);

  // // Move Y DOWN for invoice section
  // y = y + gap * 6 + 8;

  //   doc.setFont('helvetica', 'bold');
  //   doc.setFontSize(12);
  //   doc.text(`Invoice Serial No: ${data.INVOICE_NO}`, 10, y);

  //   doc.setFont('helvetica', 'normal');
  //   doc.setFontSize(11);
  //   doc.text(`Invoice Date: ${data.TRANS_DATE}`, 10, y + gap);
  //   doc.text(`Vehicle No: ${data.VEHICLE_NO}`, 10, y + gap * 2);
  //   doc.text(`Mode of Transport: `, 10, y + gap * 3);

  //   const leftBlockBottom = y + gap * 4 + 10;

  //   // ======================================================
  //   // CONSIGNEE RIGHT
  //   // ======================================================
  //   let rightX = 125;
  //   let rightY = y - 90; // moves block further upward

  //   doc.setFont('helvetica', 'bold');
  //   doc.setFontSize(12);
  //   doc.text("Consignee (Ship to)", rightX, rightY);

  //   doc.setFont('helvetica', 'normal');
  //   doc.setFontSize(11);
  //   doc.text(data.CUST_NAME, rightX, rightY + gap);
  //   doc.text(data.CUST_ADDRESS1, rightX, rightY + gap * 2);
  //   doc.text(data.CUST_ADDRESS2, rightX, rightY + gap * 3);
  //   doc.text(data.CUST_ADDRESS3, rightX, rightY + gap * 4);
  //   doc.text(`GSTIN/UIN : ${data.CUST_CODE}`, rightX, rightY + gap * 5);
  //   doc.text(`State : ${data.CUST_STATE}, Code : 32`, rightX, rightY + gap * 6);

  //   // ======================================================
  //   // BUYER BELOW CONSIGNEE
  //   // ======================================================
  //   let buyerY = rightY + gap * 7 + 4;

  //   doc.setFont('helvetica', 'bold');
  //   doc.text("Buyer (Bill to)", rightX, buyerY);

  //   doc.setFont('helvetica', 'normal');
  //   doc.text(data.CUST_NAME, rightX, buyerY + gap);
  //   doc.text(data.CUST_ADDRESS1, rightX, buyerY + gap * 2);
  //   doc.text(data.CUST_ADDRESS2, rightX, buyerY + gap * 3);
  //   doc.text(data.CUST_ADDRESS3, rightX, buyerY + gap * 4);
  //   doc.text(`GSTIN/UIN : ${data.CUST_CODE}`, rightX, buyerY + gap * 5);
  //   doc.text(`State : ${data.CUST_STATE}, Code : 32`, rightX, buyerY + gap * 6);

  //   y = Math.max(leftBlockBottom, buyerY + gap * 7 + 10);

  //   // ======================================================
  //   // MAIN TABLE (Screenshot Style)
  //   // ======================================================
  //   const columns = [
  //     "Ledger Code", "Ledger Name", "Particular", "Amount", "GST Amount",
  //       "CGST", "SGST","HSN Code", "Total"
  //   ];

  //   const rows = [];

  //   data.NOTE_DETAIL.forEach(item => {

  //   // --- GST SPLIT LOGIC ---
  //   let companyState = data.STATE_NAME;     // from your object
  //   let customerState = data.CUST_STATE;    // from API

  //   let isSameState = companyState === customerState;

  //   let cgst = "0.00";
  //   let sgst = "0.00";
  //   let igst = "0.00";

  //   if (isSameState) {
  //       cgst = (item.CGST || 0).toFixed(2);
  //       sgst = (item.SGST || 0).toFixed(2);
  //   } else {
  //       igst = ((item.CGST || 0) + (item.SGST || 0)).toFixed(2);
  //   }

  //   const totalValue = (item.AMOUNT || 0) + (item.GST_AMOUNT || 0);

  //   // --- TABLE ROW ---
  //   rows.push([
  //     item.LEDGER_CODE,
  //     item.LEDGER_NAME,
  //     item.REMARKS || "",
  //     item.AMOUNT.toFixed(2),
  //     item.GST_AMOUNT.toFixed(2),
  //      item.CGST.toFixed(2),
  //     item.SGST.toFixed(2),
  //     item.HSN_CODE || this.HSNCODE || "",
  //      totalValue.toFixed(2),

  //     cgst,
  //     sgst,
  //     igst
  //   ]);
  // });

  // const footerRow = [
  //   "", "", "", "", "", "", "", "Total",
  //   data.NET_AMOUNT.toFixed(2)
  // ];

  //   (doc as any).autoTable({
  //     startY: y,
  //     head: [columns],
  //     body: rows,
  //     foot: [footerRow],
  //     theme: "grid",
  //     margin: { left: 10, right: 10 },
  //     styles: { fontSize: 9 },
  //     headStyles: { fillColor: [230, 230, 230] },
  //     footStyles: {
  //     fillColor: [0, 180, 150],  // same green color
  //     textColor: 255,
  //     fontStyle: "bold",
  //     halign: "right"
  //   },
  //   columnStyles: {
  //     8: { halign: "right" } // total column alignment
  //   }
  //   });

  //   y = (doc as any).lastAutoTable.finalY + 12;

  //  // ============================================================
  // // 6) FOOTER – GST SUMMARY + RIGHT TOTAL (PERFECT ALIGNMENT)
  // // ============================================================

  // const footStartY = (doc as any).lastAutoTable.finalY + 15;

  // // ---------------- LEFT GST SUMMARY TABLE ----------------
  // let fx = 15;
  // let fy = footStartY;

  // doc.setFont('helvetica', 'bold');
  // doc.setFontSize(10);

  // // COLUMN POSITIONS (tight alignment)
  // const gstCol      = fx;        // GST %
  // const taxableCol  = fx + 22;   // Taxable Value
  // const rateCol     = fx + 50;   // Rate %
  // const amtCol      = fx + 65;   // Amount
  // const totalCol    = fx + 90;   // Total Tax Amount

  // doc.text("GST %", gstCol, fy);
  // doc.text("Taxable Value", taxableCol, fy);
  // doc.text("Rate", rateCol, fy);
  // doc.text("Amount", amtCol, fy);
  // doc.text("Total Tax Amount", totalCol, fy);

  // // Move down for values
  // fy += 7;
  // doc.setFont('helvetica', 'normal');
  // doc.setFontSize(9);

  // // Values from CREDIT NOTE
  // const taxable = data.NET_AMOUNT || 0;
  // const gstAmount = data.NOTE_DETAIL[0].GST_AMOUNT || 0;
  // const gstPerc = data.NOTE_DETAIL[0].CGST + data.NOTE_DETAIL[0].SGST;  // Example: 2.5 + 2.5 = 5%

  // // TABLE ROW VALUES
  // doc.text(gstPerc.toFixed(2) + "%", gstCol, fy);
  // doc.text(taxable.toFixed(2), taxableCol, fy);
  // doc.text(gstPerc.toFixed(2) + "%", rateCol, fy);
  // doc.text(gstAmount.toFixed(2), amtCol, fy);
  // doc.text(gstAmount.toFixed(2), totalCol, fy);

  // // Total Row
  // fy += 7;
  // doc.setFont('helvetica', 'bold');
  // doc.text(taxable.toFixed(2), taxableCol, fy);
  // doc.text(gstAmount.toFixed(2), amtCol, fy);
  // doc.text(gstAmount.toFixed(2), totalCol, fy);

  // // ---------------- RIGHT TOTAL SUMMARY ----------------

  // let rx = pageWidth - 70;
  // let ry = footStartY;

  // const lblX = rx;
  // const colonX = rx + 25;
  // const valX = rx + 38;

  // const netAmount = data.NET_AMOUNT || 0;

  // // Get decimals
  // const netDecimal = this.getDecimalPart(netAmount);   // example -> .15
  // const igstDecimal = this.getDecimalPart(gstAmount); // example -> .31

  // // Add decimals
  // const roundOffValue = (netDecimal + igstDecimal).toFixed(2);

  // doc.setFont('helvetica', 'normal');
  // doc.setFontSize(9);

  // // Taxable Value
  // doc.text("Taxable Value", lblX, ry);
  // doc.text(":", colonX, ry);
  // doc.text(taxable.toFixed(2), valX, ry);

  // // Total Tax
  // ry += 6;
  // doc.text("Total Tax", lblX, ry);
  // doc.text(":", colonX, ry);
  // doc.text(gstAmount.toFixed(2), valX, ry);

  // // TCS
  // ry += 6;
  // doc.text("TCS", lblX, ry);
  // doc.text(":", colonX, ry);
  // doc.text((data.TCS || 0).toFixed(2), valX, ry);

  // // Round Off
  // ry += 6;
  // doc.text("Round Off", lblX, ry);
  // doc.text(":", colonX, ry);
  // doc.text((roundOffValue|| 0).toString(), valX, ry);

  // const taxableValue = data.NET_AMOUNT || 0;   // example: 100.12
  // const fullInvoiceValue = taxableValue + gstAmount;
  // // round-off version
  // const roundedInvoiceValue = Math.floor(fullInvoiceValue);
  // // Invoice Total
  // ry += 8;
  // doc.setFont('helvetica', 'bold');
  // doc.text("Invoice Total", lblX, ry);
  // doc.text(":", colonX, ry);
  // if (data.ROUND_OFF === true) {
  //   doc.text(roundedInvoiceValue.toString(), valX, ry);   // NO DECIMALS
  // } else {
  //   doc.text(fullInvoiceValue.toFixed(2), valX, ry);      // EXACT AMOUNT
  // }

  // // ---------------- AMOUNT IN WORDS ----------------

  // let wordsY = ry + 15;

  // doc.setFont('helvetica', 'bold');
  // doc.setFontSize(10);
  // doc.text(
  //   "Whether the tax is payable on Reverse charge basis: No Amount of tax subject to reverse charge",
  //   15,
  //   wordsY
  // );

  // // Amount in words line
  // wordsY += 7;
  // doc.text("Amount in words :", 15, wordsY);
  // doc.setFont('helvetica', 'normal');
  // doc.text(`INR ${this.numberToWords(data.NET_AMOUNT)} Only`, 60, wordsY);

  // // ---------------- DECLARATION + REMARK ----------------
  // let blockY = wordsY + 12;

  // doc.setFont('helvetica', 'bold');
  // doc.setFontSize(9);
  // doc.text("Declaration :", 15, blockY);

  // blockY += 10;
  // doc.text("Remark :", 15, blockY);

  // doc.setFont('helvetica', 'normal');
  // doc.text(data.NARRATION || "", 40, blockY);

  // doc.setFont('helvetica', 'bold');
  // doc.text(`For ${data.COMPANY_NAME}`, pageWidth - 95, blockY);

  // // ---------------- SIGNATURE ----------------
  // let sigY = blockY + 25;

  // doc.setFont('helvetica', 'bold');
  // doc.setFontSize(10);
  // doc.text(`For ${data.COMPANY_NAME}`, pageWidth - 95, sigY);

  // sigY += 20;
  // doc.setFont('helvetica', 'normal');
  // doc.setFontSize(9);
  // doc.text("Authorised Signatory", pageWidth - 75, sigY);

  //    doc.output('dataurlnewwindow');
  //   // Return PDF
  //   const pdfBlob = doc.output('blob');
  //   const url = URL.createObjectURL(pdfBlob);
  //   return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  // }

  getDecimalPart(num: number): number {
    const str = num.toFixed(2);
    const decimal = str.split('.')[1];
    return Number('0.' + decimal);
  }

  private async convertToBase64(path: string): Promise<string> {
    const response = await fetch(path);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  numberToWords(amount: number): string {
    if (amount === 0) return 'Zero Rupees Only';

    const words = [
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

    const tens = [
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

    function convert(num: number): string {
      if (num < 20) return words[num];
      if (num < 100)
        return (
          tens[Math.floor(num / 10)] + (num % 10 ? ' ' + words[num % 10] : '')
        );
      if (num < 1000)
        return (
          words[Math.floor(num / 100)] +
          ' Hundred' +
          (num % 100 ? ' ' + convert(num % 100) : '')
        );
      if (num < 100000)
        return (
          convert(Math.floor(num / 1000)) +
          ' Thousand' +
          (num % 1000 ? ' ' + convert(num % 1000) : '')
        );
      if (num < 10000000)
        return (
          convert(Math.floor(num / 100000)) +
          ' Lakh' +
          (num % 100000 ? ' ' + convert(num % 100000) : '')
        );
      return (
        convert(Math.floor(num / 10000000)) +
        ' Crore' +
        (num % 10000000 ? ' ' + convert(num % 10000000) : '')
      );
    }

    return convert(Math.floor(amount)) + ' Rupees Only';
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
  declarations: [ViewDebitComponent],
  exports: [ViewDebitComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ViewDebitModule {}
