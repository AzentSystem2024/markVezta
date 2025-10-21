import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
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
import { AddCreditNoteModule } from '../CREDIT-NOTE/add-credit-note/add-credit-note.component';
import { EditCreditNoteModule } from '../CREDIT-NOTE/edit-credit-note/edit-credit-note.component';
import { ViewCreditNoteModule } from '../CREDIT-NOTE/view-credit-note/view-credit-note.component';
import { TransferInInventoryFormComponent } from '../transfer-in-inventory-form/transfer-in-inventory-form.component';
import { DataService } from 'src/app/services';
import { Router } from '@angular/router';
import { AddInvoiceComponent } from '../INVOICE/add-invoice/add-invoice.component';
import CustomStore from 'devextreme/data/custom_store';
import notify from 'devextreme/ui/notify';
import { tap } from 'rxjs';
import { confirm } from 'devextreme/ui/dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-quotation-form',
  templateUrl: './quotation-form.component.html',
  styleUrls: ['./quotation-form.component.scss'],
})
export class QuotationFormComponent {
  @Input() isEditing: boolean = false;
  @Input() EditingResponseData: any;
  @Input() isReadOnlyMode: boolean = false;
  @Output() popupClosed = new EventEmitter<void>();
  @ViewChild(AddInvoiceComponent) addInvoiceComp!: AddInvoiceComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild('popupGridRef', { static: false })
  popupGridRef!: DxDataGridComponent;
  @ViewChild('itemsGridRef', { static: false })
  itemsGridRef!: DxDataGridComponent;
  isApproved: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  auto: string = 'auto';
  isPopupVisible: boolean = false;
  items: any[] = [];
  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',

    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',

    onClick: () => {
      this.ngZone.run(() => {
        this.addTermAndCondition();
      });
    },
    elementAttr: { class: 'add-button' },
  };
  barcodeList: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  matrix: any;
  storeFromSession: any;
  stores: any;
  reasons: any;
  newTerms: any[] = [];
  combinedTerms: any[] = [];
  quotationFormData: any = {
    COMPANY_ID: 0,
    STORE_ID: 0,
    QTN_DATE: new Date(),
    ORIGIN_STORE_ID: 0,
    ISSUE_ID: 0,
    NET_AMOUNT: 0,
    FIN_ID: 0,
    USER_ID: 0,
    NARRATION: '',
    QTN_NO: 0,
    CUST_ID: 0,
    SALESMAN_ID: 0,
    CONTACT_NAME: '',
    SUBJECT: '',
    REF_NO: '',
    PAY_TERM_ID: 0,
    DELIVERY_TERM_ID: 0,
    VALID_DAYS: 0,
    GROSS_AMOUNT: 0,
    TAX_AMOUNT: 0,
    CHARGE_DESCRIPTION: '',
    CHARGE_AMOUNT: 0,
    DISCOUNT_DESCRIPTION: '',
    DISCOUNT_AMOUNT: 0,
    ROUND_OFF: false,
    TRANS_ID: 0,
    TERMS: [],
    Details: [],
  };
  userID: any;
  finID: any;
  companyID: any;
  selectedStoreId: any;
  sessionData: any;
  selected_vat_id: any;
  salesman: any;
  itemLookupStore: any;
  selectedTab = 0;
  itemsS: any;
  customer: any;
  terms: any;
  paymentTerms: any;
  deliveryTerms: any;
  quotationHistory: any;
  popupVisible = false;
  isRoundOff: any;
  termsAndConditions: any;
  matrixCode: any;
  taxSummaryLabel: string;
  savedTerms: any;
  manualAdd: boolean;
  selectedCustomerId: any;

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.sessionData_tax();
    this.getSalesmanDropdown();
    this.getCustomerDropdown();
    this.getPymentTermsDropdown();
    this.getDeliveryTermsDropdown();
    this.getQuotationNo(); // always fetch fresh number when popup opens
    this.getTermsAndConditionsList();

    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    this.matrixCode = menuResponse.GeneralSettings.ENABLE_MATRIX_CODE;

    this.userID = menuResponse.USER_ID;
    this.finID = menuResponse.FINANCIAL_YEARS[0].FIN_ID;
    this.companyID = menuResponse.Companies[0].COMPANY_ID;
    const menuGroups = menuResponse.MenuGroups || [];
    this.storeFromSession = menuResponse.Configuration[0].STORE_ID;
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/quotation');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }
    if (menuResponse.GeneralSettings.ENABLE_MATRIX_CODE == true) {
      // this.getItemsList();
    } else {
      // this.getItemsList();
    }
    // this.getStoreDropdown();
    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
    // this.items = [];
    // this.addEmptyRow();
    this.getItems().subscribe(() => {
      this.isEditDataAvailable();
    });
    this.setTaxSummaryLabel();
  }

  calculateSerialNumber = (rowData: any) => {
    const index = this.quotationFormData.Details.findIndex(
      (item) => item.ID === rowData.ID
    );
    return index + 1;
  };

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    const data = this.EditingResponseData;

    this.combinedTerms = data.TERMS;

    // Map ITEM_NAME → DESCRIPTION for DevExtreme grid binding
    const mappedDetails = data.Details
      ? data.Details.map((item: any) => ({
          ...item,
          DESCRIPTION: item.ITEM_NAME,
          ITEM_CODE: item.ITEM_ID,
          ITEM_ID: item.ITEM_ID,
          STOCK_QTY: item.QUANTITY,
        }))
      : [];

    this.quotationFormData = {
      ID: data.ID || 0,
      COMPANY_ID: data.COMPANY_ID || 0,
      STORE_ID: data.STORE_ID || 0,
      QTN_DATE: data.QTN_DATE ? new Date(data.QTN_DATE) : new Date(),
      ORIGIN_STORE_ID: data.ORIGIN_STORE_ID || 0,
      ISSUE_ID: data.ISSUE_ID || 0,
      NET_AMOUNT: data.NET_AMOUNT || 0,
      FIN_ID: data.FIN_ID || 0,
      USER_ID: data.USER_ID || 0,
      NARRATION: data.NARRATION || '',
      QTN_NO: data.QTN_NO || 0,
      CUST_ID: data.CUST_ID || 0, // <-- will bind to dx-select-box
      SALESMAN_ID: data.SALESMAN_ID || 0,
      CONTACT_NAME: data.CONTACT_NAME || '',
      SUBJECT: data.SUBJECT || '',
      REF_NO: data.REF_NO || 0,
      PAY_TERM_ID: data.PAY_TERM_ID || 0,
      DELIVERY_TERM_ID: data.DELIVERY_TERM_ID || 0,
      VALID_DAYS: data.VALID_DAYS || 0,
      GROSS_AMOUNT: data.GROSS_AMOUNT || 0,
      TAX_AMOUNT: data.TAX_AMOUNT || 0,
      CHARGE_DESCRIPTION: data.CHARGE_DESCRIPTION || '',
      CHARGE_AMOUNT: data.CHARGE_AMOUNT || 0,
      DISCOUNT_DESCRIPTION: data.DISCOUNT_DESCRIPTION || '',
      DISCOUNT_AMOUNT: data.DISCOUNT_AMOUNT || 0,
      ROUND_OFF: data.ROUND_OFF || false,
      TRANS_ID: data.TRANS_ID || 0,
      TERMS: Array.isArray(data.TERMS)
        ? data.TERMS.map((t: any) => (typeof t === 'string' ? { TERMS: t } : t))
        : [],
      Details: mappedDetails,
    };

    if (data.CUST_ID && data.CUST_NAME) {
      const exists = this.customer.some((c: any) => c.ID === data.CUST_ID);
      if (!exists) {
        this.customer.push({
          ID: data.CUST_ID,
          DESCRIPTION: data.CUST_NAME,
        });
      }
    }
    this.reindexDetails();
  }

  private reindexDetails() {
    this.quotationFormData.DETAILS.forEach((row: any, index: number) => {
      row.SL_NO = index + 1;
    });
  }
  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  ngAfterViewInit(): void {
    if (this.isEditing) return; // skip adding row in edit mode

    setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (
            this.itemsGridRef?.instance &&
            (!this.quotationFormData.Details ||
              this.quotationFormData.Details.length === 0)
          ) {
            this.itemsGridRef.instance.addRow();
            setTimeout(() => {
              this.itemsGridRef?.instance?.editCell(0, 'SL_NO');
            }, 100);
          }
        });
      });
    }, 500);
  }

  addNewRow() {
    this.manualAdd = true; // mark manual insertion

    const newRow = {
      SL_NO: this.quotationFormData.Details.length + 1,
      ID: 0,
      QTN_ID: 0,
      ITEM_ID: 0,
      UOM: '',
      QUANTITY: 0,
      PRICE: 0,
      DISC_PERCENT: 0,
      AMOUNT: 0,
      TAX_PERCENT: 0,
      TAX_AMOUNT: 0,
      TOTAL_AMOUNT: 0,
      REMARKS: '',
    };

    this.quotationFormData.Details.push(newRow);
    this.quotationFormData.Details = [...this.quotationFormData.Details];

    this.manualAdd = false; // reset flag
  }

  rowDraggingOptions = {
    allowReordering: true,
    showDragIcons: true,
    onReorder: (e: any) => this.onRowReorder(e),
  };

  onRowReorder(e: any) {
    const dataSource = this.combinedTerms; // ← the actual bound array
    const visibleRows = e.component.getVisibleRows();
    // Get actual indexes in data source
    const fromData = e.itemData;
    const fromIndex = dataSource.findIndex((item) => item === fromData);
    // If paging or filtering is enabled, toIndex refers to visible rows
    const toRowData = visibleRows[e.toIndex]?.data;
    const toIndex = dataSource.findIndex((item) => item === toRowData);
    if (fromIndex === -1 || toIndex === -1) return;

    // Reorder
    dataSource.splice(fromIndex, 1);
    dataSource.splice(toIndex, 0, fromData);

    // Rebind array so grid updates
    this.combinedTerms = [...dataSource];
  }

  addTermAndCondition() {
    const newTerm = { TERMS: '' };
    this.newTerms.push(newTerm);
    this.updateCombinedTerms();

    const lastIndex = this.combinedTerms.length - 1;
    this.dataGrid.instance.editCell(lastIndex, 'TERMS');
  }

  getTermsAndConditionsList() {
    this.dataService.getTermsAndConditions().subscribe((response: any) => {
      this.termsAndConditions = response.Data;
      this.savedTerms = this.quotationFormData?.TERMS || [];
      this.updateCombinedTerms();
    });
  }
  updateCombinedTerms() {
    const normalizedMasterTerms = (this.termsAndConditions || []).map(
      (t: any) => (typeof t === 'string' ? { TERMS: t } : t)
    );

    const normalizedNewTerms = (this.newTerms || []).map((t: any) =>
      typeof t === 'string' ? { TERMS: t } : t
    );

    // Merge without duplication by TERM content
    const termSet = new Set<string>();
    this.combinedTerms = [];

    [
      ...this.savedTerms,
      ...normalizedMasterTerms,
      ...normalizedNewTerms,
    ].forEach((t) => {
      const termValue = (t.TERMS || '').trim();
      if (!termSet.has(termValue)) {
        termSet.add(termValue);
        this.combinedTerms.push(t);
      }
    });

    console.log(this.combinedTerms, 'combinedTerms fixed');
  }

  getSalesmanDropdown() {
    this.dataService.getDropdownData('SALESMAN').subscribe((response: any) => {
      this.salesman = response;
    });
  }


  getCustomerDropdown() {
    this.dataService.getDropdownData('CUSTOMER').subscribe((response: any) => {
      this.customer = response;
    });
  }

  customerChanged(event: any) {
    this.selectedCustomerId = event.value;
    this.getCustomerDetails();
  }

  getCustomerDetails() {
    if (!this.selectedCustomerId) return;
    const payload = { CUST_ID: this.selectedCustomerId };

    this.dataService.getCustomerDetailDeliveryNote(payload).subscribe({
      next: (response: any) => {
        if (response && response.Flag === 1 && response.Data?.length) {
          const details = response.Data[0];

          // Bind API data into your form object
          this.quotationFormData.CONTACT_NAME = details.CONTACT_NAME;
          this.quotationFormData.CONTACT_FAX = details.CONTACT_FAX;
          this.quotationFormData.CONTACT_PHONE = details.CONTACT_PHONE;
          this.quotationFormData.CONTACT_MOBILE = details.CONTACT_MOBILE;
          this.quotationFormData.CONTACT_EMAIL = details.CONTACT_EMAIL;
        }
      },
      error: (err) => console.error('API error:', err),
    });
  }

  getPymentTermsDropdown() {
    this.dataService
      .getDropdownData('PAYMENTTERMS')
      .subscribe((response: any) => {
        this.paymentTerms = response;
      });
  }

  getDeliveryTermsDropdown() {
    this.dataService
      .getDropdownData('PAYMENTTERMS')
      .subscribe((response: any) => {
        this.deliveryTerms = response;
      });
  }

  getItems() {
    const payload = { STORE_ID: this.storeFromSession };
    return this.dataService.getItemsForQuotation(payload).pipe(
      tap((response: any) => {
        this.items = response.Data;
      })
    );
  }

  onEditorPreparing(e: any) {
    if (e.parentType === 'dataRow') {
      e.editorOptions.height = 30; // fixed editor height
      e.editorOptions.elementAttr = { style: 'height: 30px;' };
    }
    if (
      (e.dataField === 'ITEM_CODE' || e.dataField === 'DISC_PERCENT') &&
      e.parentType === 'dataRow'
    ) {
      e.editorOptions.onValueChanged = (args: any) => {
        const rowData = e.row.data;

        if (e.dataField === 'ITEM_CODE') {
          const selectedItem = this.items.find(
            (item) => item.ITEM_ID === args.value
          );
          if (selectedItem) {
            rowData.ITEM_CODE = selectedItem.ITEM_ID;
            rowData.DESCRIPTION = selectedItem.DESCRIPTION;
            rowData.STOCK_QTY = selectedItem.STOCK_QTY;
            rowData.ITEM_ID = selectedItem.ITEM_ID;
          }
        }

        if (e.dataField === 'DISC_PERCENT') {
          rowData.DISC_PERCENT = args.value;
        }

        // Save current row edits
        e.component.saveEditData().then(() => {
          const currentRowIndex = e.row.rowIndex;

          // Only add new row if DISC_PERCENT is not empty
          if (
            !this.manualAdd &&
            e.dataField === 'DISC_PERCENT' &&
            e.parentType === 'dataRow'
          ) {
            const newRow = {
              ID: 0,
              QTN_ID: 0,
              ITEM_ID: 0,
              UOM: '',
              QUANTITY: 0,
              PRICE: 0,
              DISC_PERCENT: 0,
              AMOUNT: 0,
              TAX_PERCENT: 0,
              TAX_AMOUNT: 0,
              TOTAL_AMOUNT: 0,
              REMARKS: '',
            };

            this.quotationFormData.Details.splice(
              currentRowIndex + 1,
              0,
              newRow
            );

            // Refresh grid
            e.component.option('dataSource', [
              ...this.quotationFormData.Details,
            ]);

            // Focus new row
            setTimeout(() => {
              e.component.editCell(currentRowIndex + 1, 'SL_NO');
            }, 100);
          }
        });
      };
    }
  }

  onInfoClick = (e: any) => {
    const rowData = e.row?.data;
    const itemId = rowData.ITEM_ID;

    this.dataService.getHistoryQuotation(itemId).subscribe((response: any) => {
      this.quotationHistory = response.Data;
      this.popupVisible = true;

      this.cdr.detectChanges(); // force Angular to update view immediately
    });
  };

  getQuotationNo() {
    this.dataService.getVoucherNoForQuotation().subscribe(
      (response: any) => {
        if (response?.Flag === 1 && response?.Data?.length) {
          this.quotationFormData.QTN_NO = response.Data[0].VOCHERNO;
          console.log(this.quotationFormData.SO_NO, 'SONO');
        } else {
          console.error('No data returned for voucher number');
        }
      },
      (err) => {
        console.error('API error:', err);
      }
    );
  }

  calculateGrossAmount = (rowData: any) => {
    const qty = Number(rowData.STOCK_QTY) || 0;
    const price = Number(rowData.PRICE) || 0;
    return qty * price;
  };

  // Calculate Amount after Discount
  calculateAmount = (rowData: any) => {
    const gross = this.calculateGrossAmount(rowData);
    const discountPercent = Number(rowData.DISC_PERCENT) || 0;
    if (discountPercent > 0) {
      const discountValue = (gross * discountPercent) / 100;
      return gross - discountValue;
    }

    return gross;
  };

  calculateVatAmount = (rowData: any) => {
    const amount = this.calculateAmount(rowData);
    const vatPercent = Number(rowData.TAX_PERCENT) || 0;

    return (amount * vatPercent) / 100;
  };

  calculateTotal = (rowData: any) => {
    const amount = this.calculateAmount(rowData);
    const taxAmount = this.calculateVatAmount(rowData);
    return amount + taxAmount;
  };

  // In your component.ts
  getVatOrGstText(): string {
    // Assuming sessionData is available
    return this.selected_vat_id === this.sessionData.VAT_ID &&
      this.sessionData.VAT_ID === 2
      ? 'VAT Amount'
      : 'GST Amount';
  }

  setTaxSummaryLabel() {
    this.taxSummaryLabel =
      (this.selected_vat_id === this.sessionData.VAT_ID &&
      this.sessionData.VAT_ID === 2
        ? 'VAT Amount'
        : 'GST Amount') + ': {0}';
  }
  onGridReady(e: any) {
    const total = this.dataGrid.instance.getTotalSummaryValue('TOTAL_AMOUNT');
    const grossAmount =
      this.dataGrid.instance.getTotalSummaryValue('GROSS_AMOUNT');
    this.quotationFormData.NET_AMOUNT = total;
    this.quotationFormData.GROSS_AMOUNT = grossAmount;
  }

  onRoundOffChange(e: any) {
    if (this.isRoundOff) {
      // Round to nearest integer
      this.quotationFormData.NET_AMOUNT = Math.round(
        this.quotationFormData.NET_AMOUNT
      );
    } else {
      // Reset to actual total from grid
      const total = this.dataGrid.instance.getTotalSummaryValue('TOTAL_AMOUNT');
      this.quotationFormData.NET_AMOUNT = total;
    }
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1).toString().padStart(2, '0');
    const day = '' + d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();

    return [year, month, day].join('-'); // "YYYY-MM-DD"
  }

  saveQuotation() {
    // 1. Validation
    if (!this.quotationFormData.CUST_ID) {
      notify('Please select a customer.', 'error', 3000);
      return;
    }

    if (
      !this.quotationFormData.Details ||
      this.quotationFormData.Details.length === 0
    ) {
      notify('Please add at least one item to the quotation.', 'error', 3000);
      return;
    }

    // 2. Filter out empty rows (no ITEM_ID or no QUANTITY)
    const validDetails = this.quotationFormData.Details.filter(
      (row: any) => row.ITEM_ID && (row.STOCK_QTY || row.QUANTITY)
    );

    if (validDetails.length === 0) {
      notify(
        'Please add at least one valid item to the quotation.',
        'error',
        3000
      );
      return;
    }

    this.quotationFormData.TERMS = this.combinedTerms.map((t: any) => ({
      ID: 0,
      QTN_ID: this.quotationFormData.ID || 0,
      TERMS: t.TERMS || '',
    }));

    // 3. Prepare payload with calculated amounts
    const payload = {
      ...this.quotationFormData, // spread header values first
      QTN_DATE: this.formatDate(this.quotationFormData.QTN_DATE),
      COMPANY_ID: this.companyID,
      STORE_ID: this.storeFromSession,
      FIN_ID: this.finID,
      USER_ID: this.userID,
      ROUND_OFF: this.isRoundOff,
      Details: validDetails.map((row: any, index: number) => {
        const grossAmount = this.calculateGrossAmount(row);
        const amount = this.calculateAmount(row);
        const taxAmount = this.calculateVatAmount(row);
        const totalAmount = this.calculateTotal(row);

        return {
          SL_NO: index + 1,
          ITEM_ID: row.ITEM_ID,
          DESCRIPTION: row.DESCRIPTION || '',
          UOM: row.UOM || '',
          QUANTITY: row.STOCK_QTY || row.QUANTITY || 0,
          PRICE: row.PRICE || 0,
          DISC_PERCENT: row.DISC_PERCENT || 0,
          AMOUNT: amount,
          TAX_PERCENT: row.TAX_PERCENT || 0,
          TAX_AMOUNT: taxAmount,
          TOTAL_AMOUNT: totalAmount,
          REMARKS: row.REMARKS || '',
        };
      }),
    };

    if (this.isEditing && this.quotationFormData.ID) {
      payload.ID = this.quotationFormData.ID;
    }

    const proceedWithSave = () => {
      const apiCall = this.isEditing
        ? this.isApproved
          ? this.dataService.approveSalesQuotation(payload) // Approve API
          : this.dataService.updateSalesQuotation(payload) // Update API
        : this.dataService.insertSalesQuotation(payload); // Save API

      apiCall.subscribe((response: any) => {
        if (response.Flag === '1') {
          notify(
            response.Message || 'Quotation saved successfully',
            'success',
            2000
          );
          this.popupClosed.emit();
          this.getQuotationNo();
        } else {
          notify(response.Message || 'Failed to save quotation', 'error', 2000);
        }
      });
    };

    // Confirmation before approving
    if (this.isEditing && this.isApproved) {
      confirm(
        'Are you sure you want to approve this quotation?',
        'Confirm Approval'
      ).then((dialogResult) => {
        if (dialogResult) {
          proceedWithSave();
        }
      });
    } else {
      proceedWithSave();
    }
  }

  cancel() {
    this.popupClosed.emit();
  }

  printQuotation() {
    const data = this.quotationFormData;
    console.log(data);

    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const qtnDate = formatDate(data.QTN_DATE);

    const customerName =
      this.customer.find((c) => c.ID === data.CUST_ID)?.DESCRIPTION || '';
    const salesmanName =
      this.salesman.find((s) => s.ID === data.SALESMAN_ID)?.DESCRIPTION || '';

    const paymentTerm =
      this.paymentTerms.find((pt) => pt.ID === data.PAY_TERM_ID)?.DESCRIPTION ||
      '';
    const deliveryTerm =
      this.deliveryTerms.find((dt) => dt.ID === data.DELIVERY_TERM_ID)
        ?.DESCRIPTION || '';

    const content = document.createElement('div');
    content.innerHTML = `
    <div style="font-family: Arial, sans-serif; font-size: 13px; margin: 20px;">
      
      <!-- COMPANY HEADER -->
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="margin-top: 5px;">Quotation</h2>
      </div>

      <!-- HEADER INFO -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
        <div>
          <div><b>Date:</b> ${qtnDate}</div>
          <div><b>Quotation No:</b> ${data.QTN_NO}</div>
          <div><b>Customer:</b> ${customerName}</div>
          <div><b>Contact Name:</b> ${data.CONTACT_NAME}</div>
        </div>
        <div>
          <div><b>Reference No:</b> ${data.REF_NO}</div>
          <div><b>Salesman:</b> ${salesmanName}</div>
          <div><b>Subject:</b> ${data.SUBJECT}</div>
        </div>
      </div>

      <!-- GRID -->
      <div id="printGridWrapper"></div>

      <!-- FOOTER -->
      <div style="display: flex; justify-content: space-between; margin-top: 30px; border-top: 2px solid #000; padding-top: 10px;">
        <div style="width: 48%;">
          <p style="font-weight: bold; text-decoration: underline;">Terms and Conditions</p>
          <p><b>Payment:</b> ${paymentTerm}</p>
          <p><b>Delivery:</b> ${deliveryTerm}</p>
          <p><b>Validity:</b> ${data.VALID_DAYS}</p>
        </div>
        <div style="width: 48%; text-align: right;">
          <p><b>Net Amount:</b> ${data.NET_AMOUNT?.toFixed(2) || '0.00'}</p>
          <p><b>Remarks:</b> ${data.NARRATION || ''}</p>
        </div>
      </div>

      <!-- FOOTER NOTE -->
      <div style="margin-top: 50px; text-align: center; font-style: italic;">
        This quotation is valid for ${
          data.VALID_DAYS
        } days from the date of issue.
      </div>
    </div>
  `;

    // Create grid HTML with styling
    const gridWrapper = document.createElement('div');
    gridWrapper.innerHTML = `
    <table border="1" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px;">
      <thead style="background-color: #f0f0f0;">
        <tr>
          <th>Sl No</th>
          <th>Item Code</th>
          <th>Description</th>
          <th>Matrix Code</th>
          <th>Remarks</th>
          <th>UOM</th>
          <th>Tax %</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Gross Amount</th>
          <th>Discount%</th>
          <th>Amount</th>
          <th>Tax Amount</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${data.Details.map(
          (item: any, index: number) => `
          <tr>
            <td style="text-align: center">${index + 1}</td>
            <td>${item.ITEM_CODE || ''}</td>
            <td>${item.DESCRIPTION || ''}</td>
            <td>${item.MATRIX_CODE || ''}</td>
            <td>${item.REMARKS || ''}</td>
            <td>${item.UOM || ''}</td>
            <td style="text-align: right">${item.TAX_PERCENT || ''}</td>
            <td style="text-align: right">${item.STOCK_QTY || ''}</td>
            <td style="text-align: right">${item.PRICE?.toFixed(2) || ''}</td>
            <td style="text-align: right">${
              item.GROSS_AMOUNT?.toFixed(2) || ''
            }</td>
            <td style="text-align: right">${
              item.DISC_PERCENT?.toFixed(2) || ''
            }</td>
            <td style="text-align: right">${item.AMOUNT?.toFixed(2) || ''}</td>
            <td style="text-align: right">${
              item.TAX_AMOUNT?.toFixed(2) || ''
            }</td>
            <td style="text-align: right">${
              item.TOTAL_AMOUNT?.toFixed(2) || ''
            }</td>
          </tr>
        `
        ).join('')}
      </tbody>
    </table>
  `;
    content.querySelector('#printGridWrapper')?.appendChild(gridWrapper);

    // -------------------------
    // ADD TERMS & CONDITIONS ARRAY BELOW
    if (data.TERMS && data.TERMS.length > 0) {
      const termsWrapper = document.createElement('div');
      termsWrapper.innerHTML = `
      <div style="margin-top: 30px;">
        <h3 style="border-top: 1px solid #000; padding-top: 5px;">Terms & Conditions</h3>
        <ol style="margin-left: 20px; font-size: 12px;">
          ${data.TERMS.map(
            (term: any, index: number) => `
            <li>${term.TERMS}</li>
          `
          ).join('')}
        </ol>
      </div>
    `;
      content.appendChild(termsWrapper);
    }
    // -------------------------

    // Print window
    const printWindow = window.open(
      '',
      '_blank',
      'width=1200,height=900,scrollbars=yes'
    );
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Quotation Print</title>
          <link rel="stylesheet" href="https://cdn3.devexpress.com/jslib/23.1.3/css/dx.light.css">
          <style>
            body { font-family: Arial, sans-serif; font-size: 13px; margin: 0; padding: 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #000; padding: 5px; }
            th { background-color: #f0f0f0; text-align: center; }
            td { padding: 4px; }
            .footer { font-size: 12px; }
            ol { padding-left: 20px; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    }

    // Save PDF
    html2canvas(content).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Quotation_${data.QTN_NO}.pdf`);
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
    DxTabPanelModule,
    DxTabsModule,
  ],
  providers: [],
  declarations: [QuotationFormComponent],
  exports: [QuotationFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class QuotationFormModule {}
