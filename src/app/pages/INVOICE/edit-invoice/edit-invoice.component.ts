import {
  ChangeDetectorRef,
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
import { AddInvoiceComponent } from '../add-invoice/add-invoice.component';
import { DataService } from 'src/app/services';
import { Console } from 'console';
import notify from 'devextreme/ui/notify';
import { ViewInvoiceModule } from '../view-invoice/view-invoice.component';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-edit-invoice',
  templateUrl: './edit-invoice.component.html',
  styleUrls: ['./edit-invoice.component.scss'],
})
export class EditInvoiceComponent {
  @ViewChild('itemsGridRef', { static: false }) itemsGridRef: any;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @Output() popupClosed = new EventEmitter<void>();
  @Input() canApprove: boolean = false;
  @Input() isVerifyMode: boolean = false;
  @Input() isApproveMode: boolean = false;
  @Input() invoiceFormData: any;
  popupVisible = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  mainInvoiceGridList: any;
  customerType: string = 'Unit';
  customerTypes = [
    { text: 'Unit', value: 'Unit' },
    { text: 'Dealer', value: 'Dealer' },
  ];
  companyList: any;
  distributorList: any;
  invoiceGridList: any;
  isTrOutPopupVisible: boolean = false;
  staticTransfers: any;
  totalAmount: any;
  summaryValues: any;
  taxAmount: any;
  grandTotal: any;
  selectedCompanyId: any;
  userId: any;
  finId: any;
  selectedDistributorId: any;
  sessionData: any;
  selected_vat_id: any;
  selectedSupplierName: any;
  HSNCODE: any;
  GST: any;
  hsnLoaded: boolean;
  showGST: boolean;
  showCGST: boolean;
  showSGST: boolean;
  selectedCustomer: any;
  selectedCompany: any;
  companyState: any;
  netAmount: any;
  selectedCustomerName: any;
  selectedCustomerType: any;
  isUpdating = false;
  vatTitle: any;

  constructor(
    private dataService: DataService,
    private cdr: ChangeDetectorRef,
  ) {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.selectedCompanyId = userData.SELECTED_COMPANY.COMPANY_ID;
      // this.HSNCODE = userData.GeneralSettings.HSN_CODE;
      this.GST = userData.GeneralSettings.GST_PERC;
      this.hsnLoaded = true; // ADD THIS
    }
  }

  ngOnInit() {
    this.populateCompanyFromSession(); //  Add this
    this.getInvoiceListForGrid();
    this.sessionData_tax();
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.selectedCompany = userData?.SELECTED_COMPANY;
      this.vatTitle = userData.GeneralSettings.VAT_TITLE;
      if (this.selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = this.selectedCompany.COMPANY_ID;
        this.companyState = this.selectedCompany.STATE_NAME;
        this.companyList = [this.selectedCompany]; //  Show only selected company
      }

      if (userData.USER_ID) {
        this.invoiceFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.invoiceFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoiceFormData'] && this.invoiceFormData?.length > 0) {
      const firstInvoice = this.invoiceFormData[0];
      this.invoiceFormData.PARTY_NAME = firstInvoice.PARTY_NAME;
      console.table(this.mainInvoiceGridList);

      // Convert SALE_DATE (do NOT change)
      if (
        firstInvoice.SALE_DATE &&
        typeof firstInvoice.SALE_DATE === 'string'
      ) {
        const [day, month, year] = firstInvoice.SALE_DATE.split('-');
        const date = new Date(+year, +month - 1, +day);
        date.setHours(12, 0, 0);
        firstInvoice.SALE_DATE = date;
      }

      // ORIGINAL LINE (replaced below)
      // this.mainInvoiceGridList = firstInvoice.SALE_DETAILS || [];

      // ----------  ONLY THIS BLOCK IS MODIFIED ----------
      // Load saved GST from the API for edit mode
      this.mainInvoiceGridList = (firstInvoice.SALE_DETAILS || []).map(
        (row: any) => {
          const igst = parseFloat(row.GST) || 0;
          const cgst = parseFloat(row.CGST) || 0;
          const sgst = parseFloat(row.SGST) || 0;

          return {
            ...row,

            // GST binding for grid
            GST: igst > 0 ? igst : 0, // IGST → GST column
            CGST: igst > 0 ? 0 : cgst, // Same-state
            SGST: igst > 0 ? 0 : sgst, // Same-state
            HSN_CODE: row.HSN_CODE,
            // keep your HSN logic
          };
        },
      );
      // -----------------------------------------------------

      // Keep your original mapping block untouched
      this.mainInvoiceGridList = this.mainInvoiceGridList.map((row: any) => {
        return {
          ...row,
          HSN_CODE: row.HSN_CODE,
        };
      });

      this.invoiceFormData = firstInvoice;

      this.customerType = firstInvoice.DISTRIBUTOR_ID ? 'Dealer' : 'Unit';
      if (this.customerType === 'Unit') {
        this.populateCompanyFromSession();
      }

      // this.getCompanyListDropdown();
      this.getCustomerOrUnitLst();
    }
  }

  onDistributorChanged(e: any) {
    const selectedCustomer = this.distributorList.find(
      (cust: any) => cust.ID === e.value,
    );

    if (this.mainInvoiceGridList && this.mainInvoiceGridList.length > 0) {
      this.mainInvoiceGridList = [];
      this.totalAmount = 0;
      this.taxAmount = 0;
      this.grandTotal = 0;
      this.netAmount = 0;

      if (this.itemsGridRef?.instance) {
        this.itemsGridRef.instance.refresh();
      }
    }

    this.selectedCustomerName = selectedCustomer.DESCRIPTION;
    this.invoiceFormData.PARTY_NAME = this.selectedCustomerName;

    const company = this.companyState?.trim().toLowerCase();
    const customer = selectedCustomer.STATE_NAME?.trim().toLowerCase();

    // ✅ GST MODE ONLY (NO % CHANGE)
    if (company === customer) {
      this.showCGST = true;
      this.showSGST = true;
      this.showGST = false;
    } else {
      this.showGST = true;
      this.showCGST = false;
      this.showSGST = false;
    }

    this.selectedCustomer = selectedCustomer;
    this.invoiceFormData.DISTRIBUTOR_ID = selectedCustomer.ID;

    if (this.selectedCustomerType) {
      this.invoiceFormData.CUST_TYPE = this.selectedCustomerType.CUST_TYPE;
    }

    this.getInvoiceListForGrid();
  }

  getInvoiceListForGrid() {
    const payload = {
      CUST_ID: this.invoiceFormData.DISTRIBUTOR_ID,
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService.getInvoiceGridList(payload).subscribe((response: any) => {
      this.staticTransfers = response.Data; // Save the original full list

      this.invoiceGridList = [...this.staticTransfers]; // Initial value
    });
  }

  populateCompanyFromSession() {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
        this.companyList = [selectedCompany]; // ✅ Show only selected company
      }
      if (userData.USER_ID) {
        this.invoiceFormData.USER_ID = userData.USER_ID;
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.invoiceFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }
  }

  getCustomerOrUnitLst() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
    };
    this.dataService
      .getOutsideCustomerWithState(payload)
      .subscribe((response: any) => {
        this.distributorList = response;

        if (this.invoiceFormData && this.invoiceFormData.DISTRIBUTOR_ID) {
          this.selectedCustomer = this.distributorList.find(
            (cust: any) => cust.ID === this.invoiceFormData.DISTRIBUTOR_ID,
          );

          // ⭐ NOW CHECK STATES
          if (this.selectedCustomer && this.companyState) {
            const custState =
              this.selectedCustomer.STATE_NAME.trim().toLowerCase();
            const compState = this.companyState.trim().toLowerCase();

            if (custState === compState) {
              this.showCGST = true;
              this.showSGST = true;
              this.showGST = false;
            } else {
              this.showCGST = false;
              this.showSGST = false;
              this.showGST = true;
            }
          }
        }
      });
  }

  sessionData_tax() {
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  calculateAmount = (row: any) => {
    return (parseFloat(row.PRICE) || 0) * (parseFloat(row.TOTAL_PAIR_QTY) || 0);
  };

  // calculateGstAmount = (row: any) => {
  //   const amt = this.calculateAmount(row);
  //   return amt * (parseFloat(row.GST) || 0);
  // };

  calculateGstAmount = (row: any) => {
    const amt = this.calculateAmount(row);

    // In your mapping:
    // - GST = IGST (for different state)
    // - CGST + SGST (for same state)
    const igst = parseFloat(row.GST) || 0; // IGST stored in GST column
    const cgst = parseFloat(row.CGST) || 0;
    const sgst = parseFloat(row.SGST) || 0;

    let totalGstPercent = 0;

    if (igst > 0) {
      // Different state → IGST only
      totalGstPercent = igst;
    } else {
      // Same state → CGST + SGST
      totalGstPercent = cgst + sgst;
    }

    return amt * (totalGstPercent / 100);
  };

  calculateTotal = (row: any) => {
    const amt = this.calculateAmount(row);
    const gst = this.calculateGstAmount(row);
    return amt + gst;
  };

  // calculateTotal = (row: any) => {
  //   return this.calculateAmount(row) + this.calculateGstAmount(row);
  // };

  openTrOutSelector() {
    if (!this.staticTransfers || this.staticTransfers.length === 0) {
      notify({
        message: 'No data found.',
        type: 'warning',
        displayTime: 2000,
        position: {
          my: 'center top',
          at: 'center top',
          of: window,
        },
      });
      return; // stop execution here
    }

    const selectedTransferNos =
      this.mainInvoiceGridList?.map((t) => t.DN_DETAIL_ID) || [];

    // Filter the full list before showing in popup
    this.invoiceGridList = this.staticTransfers.filter(
      (item: any) => !selectedTransferNos.includes(item.DN_DETAIL_ID),
    );
    this.isTrOutPopupVisible = true;
  }

  // onTransferSelectClick() {
  //   const selectedRows = this.popupGridRef.instance.getSelectedRowsData();

  //   if (!selectedRows || selectedRows.length === 0) {
  //     return;
  //   }

  //   // Initialize mainInvoiceGridList if null
  //   if (!this.mainInvoiceGridList) {
  //     this.mainInvoiceGridList = [];
  //   }

  //   // Get existing IDs to avoid duplicates
  //   const existingTransferIds = this.mainInvoiceGridList.map(
  //     (item: any) => item.DN_DETAIL_ID
  //   );

  //   // Only add new unique rows
  //   const newRows = selectedRows.filter(
  //     (row: any) => !existingTransferIds.includes(row.DN_DETAIL_ID)
  //   );
  //   newRows.forEach((row: any) => {
  //     row.HSN_CODE = this.HSNCODE;
  //     row.GST = this.GST;
  //     // or whatever your login session variable is
  //   });
  //   // ✅ Mutate the existing array (DON'T reassign!)
  //   this.mainInvoiceGridList.push(...newRows);

  //   // ✅ Close popup
  //   this.isTrOutPopupVisible = false;

  //   // Optional: Trigger manual change detection if needed
  //   this.cdr.detectChanges();
  // }

  onTransferSelectClick() {
    const selectedRows = this.popupGridRef.instance.getSelectedRowsData();
    if (!selectedRows || selectedRows.length === 0) return;

    if (!this.mainInvoiceGridList) {
      this.mainInvoiceGridList = [];
    }

    const existingIds = this.mainInvoiceGridList.map(
      (item: any) => item.DN_DETAIL_ID,
    );

    const company = this.companyState?.trim().toLowerCase();
    const customer = this.selectedCustomer?.STATE_NAME?.trim().toLowerCase();

    selectedRows.forEach((row: any) => {
      if (existingIds.includes(row.DN_DETAIL_ID)) return;

      // ✅ GST MUST COME FROM ROW (NOT SESSION)
      const rowGst = Number(row.GST_PERC || row.GST || 0);
      const half = rowGst / 2;

      const newRow = {
        ...row,

        // ✅ HSN FROM ROW
        HSN_CODE: row.HSN_CODE,

        // reset
        GST: 0,
        CGST: 0,
        SGST: 0,
      };

      if (company === customer) {
        // SAME STATE → CGST + SGST
        newRow.CGST = half;
        newRow.SGST = half;
        newRow.GST = 0;
      } else {
        // DIFFERENT STATE → IGST
        newRow.GST = rowGst;
        newRow.CGST = 0;
        newRow.SGST = 0;
      }

      this.mainInvoiceGridList.push(newRow);
    });

    this.isTrOutPopupVisible = false;

    this.itemsGridRef?.instance.refresh();
    this.logGridSummaries();
  }

  onTrOutPopupClose() {
    // Restore original data
    this.invoiceGridList = [...this.staticTransfers];

    if (this.popupGridRef?.instance) {
      const grid = this.popupGridRef.instance;

      // ✅ Clears filter row AND header filter
      grid.clearFilter();

      // ✅ Clear row selections
      grid.clearSelection();

      // ✅ Reset paging
      grid.pageIndex(0);

      // ✅ Refresh grid
      grid.refresh();
    }
  }

  cancelPopup() {
    this.popupClosed.emit();
  }

  logGridSummaries() {
    this.summaryValues = this.itemsGridRef?.instance?.getTotalSummaryValue;

    if (this.summaryValues) {
      this.totalAmount = this.summaryValues('AMOUNT');
      this.taxAmount = this.summaryValues('TAX_AMOUNT');
      this.grandTotal = this.summaryValues('TOTAL_AMOUNT');
      this.netAmount = Number(this.grandTotal).toFixed(2);
      this.onRoundOffChange();
    } else {
      console.warn('Summary values not ready yet.');
    }
  }
  onContentReady(e: any): void {
    this.logGridSummaries();
  }

  onEditorPreparing(e: any) {
    if (e.dataField === 'PRICE' || e.dataField === 'GST') {
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
  }

  private formatDateOnly(date: Date | string): string {
    if (!date) return null;

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  updateInvoice() {
    if (this.isUpdating) {
      return; // prevent double click
    }
    if (!this.invoiceFormData || !this.invoiceFormData.TRANS_ID) {
      console.warn('Missing invoice data or TRANS_ID.');
      return;
    }
    if (!this.invoiceFormData.DISTRIBUTOR_ID) {
      notify({
        message: 'Please select customer',
        type: 'error',
        displayTime: 3000,
        position: {
          my: 'center top',
          at: 'center top',
          of: window,
        },
      });

      return;
    }
    // 2. Validation checks
    if (!this.mainInvoiceGridList || this.mainInvoiceGridList.length === 0) {
      // notify('No items in the grid to save.', 'error', 3000);
      notify({
        message: 'No items in the grid to save.',
        type: 'error',
        displayTime: 3000,
        position: {
          my: 'center top',
          at: 'center top',
          of: window,
        },
      });

      return;
    }

    // 1. Get updated summary values from the grid
    if (this.itemsGridRef?.instance) {
      this.totalAmount =
        this.itemsGridRef.instance.getTotalSummaryValue('AMOUNT') || 0;
      this.taxAmount =
        this.itemsGridRef.instance.getTotalSummaryValue('TAX_AMOUNT') || 0;
      this.grandTotal =
        this.itemsGridRef.instance.getTotalSummaryValue('TOTAL_AMOUNT') || 0;
    } else {
      notify(
        {
          message: 'Grid instance not available for summary.',
          position: { at: 'top center', my: 'top center' },
        },
        'warning',
        3000,
      );
    }
    // 2. Validation checks
    if (!this.mainInvoiceGridList || this.mainInvoiceGridList.length === 0) {
      notify(
        {
          message: 'No items selected to save.',
          position: { at: 'top center', my: 'top center' },
        },
        'warning',
        3000,
      );
      return;
    }

    const hasInvalidPrice = this.mainInvoiceGridList.some(
      (row: any) => !row.PRICE || row.PRICE === 0,
    );
    if (hasInvalidPrice) {
      notify(
        {
          message: 'Some rows have missing or zero price value.',
          position: { at: 'top center', my: 'top center' },
        },
        'warning',
        3000,
      );
      return;
    }
    if (this.invoiceFormData.IS_APPROVED || this.isApproveMode) {
      confirm(
        'It will approve and commit. Are you sure you want to commit?',
        'Confirm Commit',
      ).then((dialogResult) => {
        if (dialogResult) {
          this.isUpdating = true;
          const commitPayload = {
            TRANS_ID: this.invoiceFormData.TRANS_ID,
            IS_APPROVED: true,
            TRANS_TYPE: this.invoiceFormData.TRANS_TYPE,
            REF_NO: this.invoiceFormData.REF_NO,
            SALE_ID: this.invoiceFormData.SALE_ID,
            // SALE_NO: this.invoiceFormData.SALE_NO,
            SALE_DATE: this.formatDateOnly(this.invoiceFormData.SALE_DATE),
            UNIT_ID: this.selectedCompanyId || null,
            COMPANY_ID: this.selectedCompanyId,
            FIN_ID: this.finId || 1,
            TRANS_STATUS: 1,
            DISTRIBUTOR_ID: this.invoiceFormData.DISTRIBUTOR_ID || null,
            GROSS_AMOUNT: this.totalAmount,
            TAX_AMOUNT: this.taxAmount,
            NET_AMOUNT: this.grandTotal,
            PARTY_NAME: this.invoiceFormData.PARTY_NAME,
            ROUND_OFF: this.invoiceFormData.ROUND_OFF,
            VEHICLE_NO: this.invoiceFormData.VEHICLE_NO,
            SALE_DETAILS: this.mainInvoiceGridList.map((row: any) => ({
              DN_DETAIL_ID: row.DN_DETAIL_ID || '',
              QUANTITY: row.TOTAL_PAIR_QTY || 0,
              PRICE: row.PRICE || 0,

              // NEW — pass all GST parts properly
              GST: row.GST || 0, // If IGST → row.GST contains value
              CGST: row.CGST || 0, // If same state → CGST filled
              SGST: row.SGST || 0, // If same state → SGST filled

              AMOUNT: this.calculateAmount(row),
              TAX_AMOUNT: this.calculateGstAmount(row),
              TOTAL_AMOUNT: this.calculateTotal(row),
            })),
          };

          this.dataService.commitInvoice(commitPayload).subscribe({
            next: (response) => {
              notify(
                {
                  message: 'Invoice committed successfully',
                  position: { at: 'top center', my: 'top center' },
                },
                'success',
                3000,
              );
              this.isUpdating = false;
              this.popupClosed?.emit();
            },
            error: (err) => {
              console.error('Error committing invoice:', err);
              this.isUpdating = false;
            },
          });
        } else {
        }
      });
    } else {
      const updatePayload = {
        TRANS_TYPE: this.invoiceFormData.TRANS_TYPE,
        TRANS_ID: this.invoiceFormData.TRANS_ID,
        REF_NO: this.invoiceFormData.REF_NO,
        SALE_ID: this.invoiceFormData.SALE_ID,
        // SALE_NO: this.invoiceFormData.SALE_NO,
        SALE_DATE: this.formatDateOnly(this.invoiceFormData.SALE_DATE),
        UNIT_ID: this.selectedCompanyId || null,
        COMPANY_ID: this.selectedCompanyId,
        FIN_ID: this.finId || 1,
        TRANS_STATUS: 1,
        DISTRIBUTOR_ID: this.invoiceFormData.DISTRIBUTOR_ID || null,
        GROSS_AMOUNT: this.totalAmount,
        TAX_AMOUNT: this.taxAmount,
        NET_AMOUNT: this.grandTotal,
        PARTY_NAME: this.invoiceFormData.PARTY_NAME,
        ROUND_OFF: this.invoiceFormData.ROUND_OFF,
        VEHICLE_NO: this.invoiceFormData.VEHICLE_NO,
        IS_VERIFIED: this.isVerifyMode
          ? true
          : this.invoiceFormData.IS_VERIFIED,
        SALE_DETAILS: this.mainInvoiceGridList.map((row: any) => ({
          DN_DETAIL_ID: row.DN_DETAIL_ID || '',
          QUANTITY: row.TOTAL_PAIR_QTY || 0,
          PRICE: row.PRICE || 0,

          GST: row.GST || 0,
          CGST: row.CGST || 0,
          SGST: row.SGST || 0,

          AMOUNT: this.calculateAmount(row),
          TAX_AMOUNT: this.calculateGstAmount(row),
          TOTAL_AMOUNT: this.calculateTotal(row),
        })),
      };

      this.isUpdating = true;
      const proceedUpdate = () => {
        this.isUpdating = true;

        this.dataService.updateInvoice(updatePayload).subscribe({
          next: (response) => {
            notify(
              {
                message: this.isVerifyMode
                  ? 'Invoice verified successfully'
                  : 'Invoice updated successfully',
                position: { at: 'top center', my: 'top center' },
              },
              'success',
              3000,
            );

            this.isUpdating = false;
            this.popupClosed?.emit();
          },
          error: (err) => {
            console.error('Error updating invoice:', err);
            this.isUpdating = false;
          },
        });
      };

      // Show confirmation only in verify mode
      if (this.isVerifyMode) {
        confirm(
          'Are you sure you want to verify this invoice?',
          'Confirm Verification',
        ).then((result) => {
          if (result) {
            proceedUpdate();
          } else {
            this.isUpdating = false;
            this.popupClosed?.emit();
            this.cdr.detectChanges();
          }
        });
      } else {
        proceedUpdate();
      }
    }
  }

  onRoundOffChange() {
    if (this.invoiceFormData.ROUND_OFF) {
      // Round Off Enabled
      this.netAmount = Math.round(this.grandTotal).toFixed(2);
    } else {
      // Round Off Disabled → return to original value
      this.netAmount = Number(this.grandTotal).toFixed(2);
    }
  }

  resetInvoiceForm() {}
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
    ViewInvoiceModule,
  ],
  providers: [],
  declarations: [EditInvoiceComponent],
  exports: [EditInvoiceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditInvoiceModule {}
