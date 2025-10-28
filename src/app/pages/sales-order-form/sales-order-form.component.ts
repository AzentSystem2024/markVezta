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
import { QuotationFormComponent } from '../quotation-form/quotation-form.component';
import { AddInvoiceComponent } from '../INVOICE/add-invoice/add-invoice.component';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import { PatternRule, RequiredRule } from 'devextreme/ui/validation_rules';
import DevExpress from 'devextreme';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-sales-order-form',
  templateUrl: './sales-order-form.component.html',
  styleUrls: ['./sales-order-form.component.scss'],
})
export class SalesOrderFormComponent {
  @ViewChild('cutsizeGrid', { static: false })
  cutsizeGrid!: DxDataGridComponent;
  @ViewChild('phoneTextBox', { static: false }) phoneTextBox: any;
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
  @ViewChild('quotationGrid', { static: false }) quotationGrid: any;
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
  customer: any;
  salesman: any;
  quotationList: any;
  salesOrderFormData: any = {
    ID: 0,
    COMPANY_ID: 0,
    FIN_ID: 0,
    STORE_ID: 0,
    SO_NO: '',
    SO_DATE: new Date(),
    CUST_ID: 0,
    SALESMAN_ID: 0,
    CONTACT_NAME: '',
    CONTACT_PHONE: '',
    CONTACT_EMAIL: '',
    QTN_ID: 0,
    REF_NO: '',
    PAY_TERM_ID: 0,
    DELIVERY_TERM_ID: 0,
    GROSS_AMOUNT: 0,
    CHARGE_DESCRIPTION: '',
    CHARGE_AMOUNT: 0,
    NET_AMOUNT: 0,
    TRANS_ID: 0,
    USER_ID: 0,
    NARRATION: '',
    Details: [],
    DEALER_ID: 0,
    ADDRESS: '',
  };
  isRoundOff: boolean = false;
  deliveryTerms: any;
  paymentTerms: any;
  taxSummaryLabel: string;
  selected_vat_id: any;
  sessionData: any;
  matrixCode: any;
  userID: any;
  finID: any;
  companyID: any;
  storeFromSession: any;
  canAdd: any;
  canEdit: any;
  canDelete: any;
  canPrint: any;
  canView: any;
  canApprove: any;
  items: any;
  popupVisible: boolean = false;
  selectedTab = 0;
  quotationPopupOpened: boolean;
  addButtonOptions = {
    text: 'Select',
    icon: 'bi bi-box-arrow-in-up',
    type: 'default',
    stylingMode: 'outlined',
    hint: 'Select Quotation',
    onClick: () => {
      this.ngZone.run(() => {
        this.selectQuotation();
      });
    },
    elementAttr: { class: 'add-button' },
  };
  emailValidationRules: (RequiredRule | PatternRule)[] = [
    {
      type: 'required',
      message: 'Email is required',
    },
    {
      type: 'pattern',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
  ];
  soNo: any;
  selectedCustomerId: any;
  isPhoneValid = true;
  countryCode = '';
  articleDescriptionList: any;
  isDescriptionLoading: boolean;
  catList: any;
  selectedCategory: any;
  selectedDescription: any;
  catColorList: any;
  selectedColor: any;
  catSizeList: any;
  isCutsizePopupVisible: boolean;
  cutsizeValues: { size: number; value: any }[] = [];
  cutsizeInputs: {};
  totalErrorMessage: string;
  itemsList: any;
  typeList: any;
  artNoList: any;
  selectedType: any;
  dealerList: any;
  deliveryAddress: any;
  selectedArtNo: any;
  colorList: any;
  packingList: any;
  selectedPacking: any;

  constructor(
    private dataService: DataService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.getListOfItemsInColumn();
    if (
      !this.salesOrderFormData.Details ||
      this.salesOrderFormData.Details.length === 0
    ) {
      this.salesOrderFormData.Details = [];
    }
    this.getDealerDropdown();
    this.sessionData_tax();
    this.getSalesOrderNo();
    this.getSalesmanDropdown();
    this.getCustomerDropdown();
    this.getPymentTermsDropdown();
    this.getDeliveryTermsDropdown();
    this.getTransferNo(); // always fetch fresh number when popup opens

    this.isEditDataAvailable();
    if (this.isEditing && this.salesOrderFormData.CUST_ID) {
      this.selectedCustomerId = this.salesOrderFormData.CUST_ID;
      this.getQuotations(); // load quotations for preselected customer
    }
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    if (menuResponse.DEFAULT_COUNTRY_CODE) {
      this.countryCode = menuResponse.DEFAULT_COUNTRY_CODE.startsWith('+')
        ? menuResponse.DEFAULT_COUNTRY_CODE
        : '+' + menuResponse.DEFAULT_COUNTRY_CODE;

      if (!this.salesOrderFormData.CONTACT_PHONE) {
        this.salesOrderFormData.CONTACT_PHONE = this.countryCode;
      }
    }

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
    this.getItems().subscribe(() => {});
    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
  }

  onPhoneInput(event: any) {
    if (this.phoneTextBox) {
      this.phoneTextBox.instance.option('value', event.target.value);
      this.phoneTextBox.instance.validate();
    }
  }

  phoneValidation(options: any): boolean {
    let phone = options.value;

    if (!phone) {
      options.rule.message = 'Phone number is required';
      return false;
    }

    if (!this.countryCode) {
      options.rule.message = 'Country code not set';
      return false;
    }

    // Add '+' if missing
    if (!phone.startsWith('+')) {
      phone = '+' + phone;
    }

    if (!phone.startsWith(this.countryCode)) {
      options.rule.message = `Phone number must start with country code ${this.countryCode}`;
      return false;
    }

    const restNumber = phone.slice(this.countryCode.length).replace(/\D/g, '');

    let regex;

    if (this.countryCode === '+971') {
      regex = /^[5]\d{8}$/;
      if (!regex.test(restNumber)) {
        options.rule.message = "UAE phone must be 9 digits starting with '5'";
        return false;
      }
    } else if (this.countryCode === '+91') {
      regex = /^[6-9]\d{9}$/;
      if (!regex.test(restNumber)) {
        options.rule.message =
          'India phone must be 10 digits starting with 6–9';
        return false;
      }
    } else {
      regex = /^\d{6,15}$/;
      if (!regex.test(restNumber)) {
        options.rule.message = 'Invalid phone number format';
        return false;
      }
    }

    return true;
  }

  isEmailValid(email: string): boolean {
    if (!email) return false;

    const requiredRule = this.emailValidationRules.find(
      (rule) => rule.type === 'required'
    );
    const patternRule = this.emailValidationRules.find(
      (rule) => rule.type === 'pattern'
    ) as PatternRule;

    if (requiredRule && email.trim() === '') {
      return false;
    }

    if (patternRule) {
      if (patternRule.pattern instanceof RegExp) {
        if (!patternRule.pattern.test(email)) {
          return false;
        }
      } else if (typeof patternRule.pattern === 'string') {
        const regex = new RegExp(patternRule.pattern);
        if (!regex.test(email)) {
          return false;
        }
      }
    }

    return true;
  }

  isEditDataAvailable() {
    if (!this.isEditing || !this.EditingResponseData) return;

    const data = this.EditingResponseData;

    this.salesOrderFormData = {
      ...this.salesOrderFormData,
      ID: data.ID,
      COMPANY_ID: data.COMPANY_ID || this.companyID,
      FIN_ID: data.FIN_ID || this.finID,
      STORE_ID: data.STORE_ID || this.storeFromSession,
      SO_NO: data.SO_NO || '',
      SO_DATE: data.SO_DATE ? new Date(data.SO_DATE) : new Date(),
      CUST_ID: data.CUST_ID || 0,
      SALESMAN_ID: data.SALESMAN_ID || 0,
      CONTACT_NAME: data.CONTACT_NAME || '',
      CONTACT_PHONE: data.CONTACT_PHONE || '',
      CONTACT_EMAIL: data.CONTACT_EMAIL || '',
      QTN_ID: data.QTN_ID || 0,
      REF_NO: data.REF_NO || '',
      PAY_TERM_ID: data.PAY_TERM_ID || 1,
      DELIVERY_TERM_ID: data.DELIVERY_TERM_ID || 1,
      GROSS_AMOUNT: data.GROSS_AMOUNT || 0,
      CHARGE_DESCRIPTION: data.CHARGE_DESCRIPTION || '',
      CHARGE_AMOUNT: data.CHARGE_AMOUNT || 0,
      NET_AMOUNT: data.NET_AMOUNT || 0,
      TRANS_ID: data.TRANS_ID || 0,
      USER_ID: data.USER_ID || this.userID,
      NARRATION: data.NARRATION || '',
      Details: (data.Details || []).map((row: any, index: number) => ({
        SL_NO: index + 1,
        ITEM_ID: row.ITEM_ID,
        ITEM_CODE: row.ITEM_CODE,
        DESCRIPTION: row.ITEM_NAME || '', // <-- map ITEM_NAME → DESCRIPTION
        MATRIX_CODE: row.MATRIX_CODE || '',
        REMARKS: row.REMARKS || '',
        UOM: row.UOM || '',
        TAX_PERCENT: row.TAX_PERCENT || 0,
        QUANTITY: row.QUANTITY || 0,
        PRICE: row.PRICE || 0,
        GROSS_AMOUNT: row.GROSS_AMOUNT || row.QUANTITY * row.PRICE,
        DISC_PERCENT: row.DISC_PERCENT || 0,
        AMOUNT: row.AMOUNT || 0,
        TAX_AMOUNT: row.TAX_AMOUNT || 0,
        TOTAL_AMOUNT: row.TOTAL_AMOUNT || 0,
      })),
    };

    this.cdr.detectChanges();
  }

  private reindexDetails() {
    this.salesOrderFormData.DETAILS.forEach((row: any, index: number) => {
      row.SL_NO = index + 1;
    });
  }
  sessionData_tax() {
    // [caption]="(selected_vat_id == sessionData.VAT_ID && sessionData.VAT_ID == 2) ? ' VAT Amount' : ' GST Amount'"
    this.sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_vat_id = this.sessionData.VAT_ID;
  }

  getTransferNo() {}
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

  onGridReady(e: any) {
    // Ensure grid is rendered only once before inserting empty row
    if (this.salesOrderFormData.Details.length === 0) {
      this.addEmptyRow();
    }
  }

  addEmptyRow() {
    const emptyRow = {
      ITEM_ID: null,
      ITEM_CODE: '',
      DESCRIPTION: '',
      MATRIX_CODE: '',
      REMARKS: '',
      UOM: '',
      QUANTITY: 0,
      GROSS_AMOUNT: 0,
      STOCK_QTY: 0,
      AMOUNT: 0,
      TAX_AMOUNT: 0,
      TOTAL_AMOUNT: 0,
    };

    this.salesOrderFormData.Details.push(emptyRow);

    // Refresh grid to show the new row
    if (this.itemsGridRef && this.itemsGridRef.instance) {
      this.itemsGridRef.instance.refresh();
    }
  }

  //Get first column's dropdown list

  getListOfItemsInColumn() {
    this.dataService.getItemsColumnList().subscribe((response: any) => {
      this.itemsList = response.Data;
    });
  }

  onItemValueChanged(e: any) {
    this.selectedDescription = e.value;
    console.log(this.selectedDescription, 'selecteddescription');
    this.selectedType = null;
    this.selectedCategory = null;
    this.selectedArtNo = null;
    this.selectedColor = null;

    const payload = {
      BRAND_ID: String(this.selectedDescription),
    };
    this.isDescriptionLoading = true;

    this.dataService.getTypeList(payload).subscribe({
      next: (response: any) => {
        this.typeList = response.Data || [];
        this.isDescriptionLoading = false;
      },
      error: () => {
        this.isDescriptionLoading = false;
      },
    });
  }

  onTypeValueChanged(e: any) {
    this.selectedType = e.value;
    console.log(e, 'selecteddescriptionnnnnnnnnnn');
    this.selectedCategory = null;
    this.selectedArtNo = null;
    this.selectedColor = null;

    const payload = {
      BRAND_ID: String(this.selectedDescription),
      ARTICLE_TYPE: String(this.selectedType),
    };
    this.isDescriptionLoading = true;

    this.dataService.getCatList(payload).subscribe({
      next: (response: any) => {
        this.catList = response.Data || [];
        this.isDescriptionLoading = false;
      },
      error: () => {
        this.isDescriptionLoading = false;
      },
    });
  }

  onCategoryValueChanged(e: any) {
    this.selectedCategory = e.value;
    console.log(this.selectedCategory, 'selectedCategoryyyyyyyyyyyyyyy');
    // this.selectedArtNo = null;
    this.selectedColor = null;

    const payload = {
      ARTICLE_TYPE: String(this.selectedType),
      CATEGORY_ID: String(this.selectedCategory),
      BRAND_ID: String(this.selectedDescription),
    };
    this.isDescriptionLoading = true;

    this.dataService.getArtNoList(payload).subscribe({
      next: (response: any) => {
        this.artNoList = response.Data || [];
        this.isDescriptionLoading = false;
      },
      error: () => {
        this.isDescriptionLoading = false;
      },
    });
  }

  onArtNoValueChanged(e: any) {
    this.selectedArtNo = e.value;
    console.log(this.selectedArtNo, 'selecteddescription');
    this.selectedColor = null;

    const payload = {
      ARTICLE_TYPE: String(this.selectedType),
      CATEGORY_ID: String(this.selectedCategory),
      BRAND_ID: String(this.selectedDescription),
      ART_NO: String(this.selectedArtNo),
    };
    this.isDescriptionLoading = true;

    this.dataService.getCatColorList(payload).subscribe({
      next: (response: any) => {
        this.colorList = response.Data || [];
        this.isDescriptionLoading = false;
      },
      error: () => {
        this.isDescriptionLoading = false;
      },
    });
  }

  onColorValueChanged(e: any) {
    this.selectedColor = e.value;
    console.log(this.selectedColor, 'selecteddescription');

    const payload = {
      ARTICLE_TYPE: String(this.selectedType),
      CATEGORY_ID: String(this.selectedCategory),
      BRAND_ID: String(this.selectedDescription),
      ART_NO: String(this.selectedArtNo),
      COLOR: String(this.selectedColor),
    };
    this.isDescriptionLoading = true;

    this.dataService.getPackings(payload).subscribe({
      next: (response: any) => {
        this.packingList = response.Data || [];
        this.isDescriptionLoading = false;
      },
      error: () => {
        this.isDescriptionLoading = false;
      },
    });
  }

  onPackingValueChanged(e: any) {
    this.selectedPacking = e.value;

    // Get the selected PACKING description text
    const selectedPackingText = this.packingList.find(
      (p) => p.ARTICLE_ID === e.value
    )?.DESCRIPTION;

    console.log('Selected Packing:', selectedPackingText);

    // ✅ Check if selected packing contains "CUTSIZE"
    if (
      selectedPackingText &&
      selectedPackingText.toUpperCase().includes('CUTSIZE')
    ) {
      // Initialize your cutsize grid values before showing popup
      this.prepareCutsizeValues(selectedPackingText);

      // Show popup
      this.showCutsizePopup();
    }

    // Your existing logic for API call, etc.
    const payload = {
      ARTICLE_TYPE: String(this.selectedType),
      CATEGORY_ID: String(this.selectedCategory),
      BRAND_ID: String(this.selectedDescription),
      ART_NO: String(this.selectedArtNo),
      COLOR: String(this.selectedColor),
    };
    this.isDescriptionLoading = true;

    // Example API call if needed
    // this.dataService.getSomething(payload).subscribe(...);
  }

  onEditorPreparing(e: any) {
    // Apply common style for dropdown fields
    if (
      e.dataField === 'ITEM' ||
      e.dataField === 'TYPE' ||
      e.dataField === 'CATEGORY' ||
      e.dataField === 'ARTNO' ||
      e.dataField === 'COLOR'
    ) {
      e.editorOptions = e.editorOptions || {};

      // Consistent input height and layout
      e.editorOptions.elementAttr = {
        style: `
        height: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      `,
      };

      e.editorOptions.inputAttr = {
        style: `
        height: 100%;
        padding: 0 4px;
        box-sizing: border-box;
      `,
      };

      // Remove spin buttons for number editors
      if (e.editorName === 'dxNumberBox') {
        e.editorOptions.showSpinButtons = false;
      }
    }

    // Only process data rows
    if (e.parentType !== 'dataRow') return;

    // Default editor height
    e.editorOptions.height = 30;
    e.editorOptions.elementAttr = { style: 'height: 30px;' };

    // QTY column logic - auto add new empty row
    if (e.dataField === 'QTY') {
      e.editorOptions.onValueChanged = (args: any) => {
        e.setCellValue(e.row.data, args.value);

        if (args.value && args.value > 0) {
          const grid = e.component;

          setTimeout(() => {
            const hasEmptyRow = grid
              .getVisibleRows()
              .some((row: any) => !row.data.ITEM);

            if (!hasEmptyRow) {
              const dataSource = grid.getDataSource();
              const store = dataSource.store();

              // ✅ Add new empty row without clearing data
              store.push([{ type: 'insert', data: {} }]);

              // ✅ Just refresh grid, don't reload
              grid.refresh().then(() => {
                const rows = grid.getVisibleRows();
                if (rows.length > 0) {
                  const lastRowIndex = rows.length - 1;
                  grid.editCell(lastRowIndex, 'ITEM'); // focus new row
                }
              });
            }
          }, 100);
        }
      };
    }

    // ITEM dropdown
    if (e.dataField === 'ITEM') {
      e.editorOptions.dropDownOptions = { height: 300 };
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        this.onItemValueChanged(args);
      };
    }

    // TYPE dropdown
    if (e.dataField === 'TYPE') {
      e.editorOptions.dropDownOptions = { height: 300 };
      e.editorOptions.dataSource = e.row.data.typeList || this.typeList || [];
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        this.onTypeValueChanged(args);
      };
    }

    // CATEGORY dropdown
    if (e.dataField === 'CATEGORY') {
      e.editorOptions.dropDownOptions = { height: 300 };
      e.editorOptions.dataSource = e.row.data.catList || this.catList || [];
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        this.onCategoryValueChanged(args);
      };
    }

    // ARTNO dropdown
    if (e.dataField === 'ARTNO') {
      e.editorOptions.dropDownOptions = { height: 300 };
      e.editorOptions.dataSource = e.row.data.artNoList || this.artNoList || [];
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        this.onArtNoValueChanged(args);
      };
    }

    // COLOR dropdown
    if (e.dataField === 'COLOR') {
      e.editorOptions.dropDownOptions = { height: 300 };
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        this.onColorValueChanged(args);
      };
    }

    // PACKING dropdown
    if (e.dataField === 'PACKING') {
      e.editorOptions.dropDownOptions = { height: 300 };
      e.editorOptions.onValueChanged = (args: any) => {
        e.setValue(args.value);
        this.onPackingValueChanged(args);
      };
    }
  }

  prepareCutsizeValues(packingText: string) {
    // Try to extract range like "10X15"
    const match = packingText.match(/(\d+)\s*[Xx]\s*(\d+)/);

    if (match) {
      const start = parseInt(match[1], 10);
      const end = parseInt(match[2], 10);

      this.cutsizeValues = Array.from({ length: end - start + 1 }, (_, i) => ({
        size: start + i,
        value: null,
      }));
    } else {
      // Default structure if no range found
      this.cutsizeValues = [
        { size: 1, value: null },
        { size: 2, value: null },
        { size: 3, value: null },
      ];
    }
  }

  onCutsizeValueChange(newValue: any, rowIndex: number) {
    this.cutsizeInputs[rowIndex] = newValue;
    console.log('Current cutsizeInputs:', this.cutsizeInputs);
  }

  onSizeValueChanged(e: any) {
    const selectedValue = e.value;

    if (selectedValue && selectedValue.toUpperCase().includes('CUTSIZE')) {
      const match = selectedValue.match(/(\d+)\s*[Xx]\s*(\d+)/);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = parseInt(match[2], 10);

        this.cutsizeValues = Array.from(
          { length: end - start + 1 },
          (_, i) => ({
            size: start + i,
            value: null,
          })
        );
      }

      this.showCutsizePopup();
    }
  }

  showCutsizePopup() {
    console.log('Popup triggered');
    this.isCutsizePopupVisible = true;
    this.cdr.detectChanges(); // ✅ force UI update if using OnPush
  }

  checkTotal(e: any) {
    this.cutsizeGrid.instance.saveEditData();

    const total = this.cutsizeValues.reduce(
      (sum, item) => sum + Number(item.value || 0),
      0
    );

    if (total > 30) {
      this.totalErrorMessage = '❌ Total must not exceed 30.';
      e.data[e.column.dataField] = e.oldValue;
      e.component.refresh(true);
    } else if (total < 30) {
      this.totalErrorMessage = `⚠️ Current total is ${total}. Must be exactly 30.`;
    } else {
      this.totalErrorMessage = ''; // ✅ valid
    }
  }

  saveCutsizeDetails() {
    const total = this.cutsizeValues.reduce(
      (sum, item) => sum + Number(item.value || 0),
      0
    );

    if (total !== 30) {
      alert(`⚠️ Total must be exactly 30. Current total is ${total}.`);
      return;
    }

    console.log('✅ Saved Cutsize Values:', this.cutsizeValues);
    this.isCutsizePopupVisible = false;
  }

  validateTotal = (e: any) => {
    const totalWithoutCurrent = this.cutsizeValues
      .filter((item) => item !== e.data)
      .reduce((sum, item) => sum + Number(item.value || 0), 0);

    const newTotal = totalWithoutCurrent + Number(e.value || 0);
    return newTotal <= 30; // ✅ valid only if total ≤ 30
  };

  addNewRow() {
    this.dataGrid.instance.addRow();
  }
  addQuotation() {
    this.quotationPopupOpened = true;
    setTimeout(() => {
      if (this.quotationGrid) {
        this.quotationGrid.instance.clearSelection();
      }
    });
  }
  customerChanged(e: any) {
    this.selectedCustomerId = e.value;
    this.getCustomerDetails();
    this.getQuotations();
  }

  getDealerDropdown() {
    this.dataService.getDropdownData('DEALER').subscribe((response: any) => {
      this.dealerList = response;
    });
  }

  onDealerChanged(e: any) {
    const selectedDealerId = e.value; // this gives the selected dealer's ID
    console.log('Selected Dealer ID:', selectedDealerId);

    if (selectedDealerId) {
      this.getDeliveryAddressDropdown(selectedDealerId);
    }
  }

  getDeliveryAddressDropdown(dealerId: number) {
    const payload = {
      CUST_ID: dealerId,
    };
    this.dataService.getDealerDropdown(payload).subscribe((response: any) => {
      this.deliveryAddress = response;
      console.log(response, 'DELIVERYADDRESS');
    });
  }
  getCustomerDetails() {
    if (!this.selectedCustomerId) return;
    const payload = { CUST_ID: this.selectedCustomerId };

    this.dataService.getCustomerDetailDeliveryNote(payload).subscribe({
      next: (response: any) => {
        if (response && response.Flag === 1 && response.Data?.length) {
          const details = response.Data[0];

          // Bind API data into your form object
          this.salesOrderFormData.CONTACT_NAME = details.CONTACT_NAME;
          this.salesOrderFormData.CONTACT_FAX = details.CONTACT_FAX;
          this.salesOrderFormData.CONTACT_PHONE = details.CONTACT_PHONE;
          this.salesOrderFormData.CONTACT_MOBILE = details.CONTACT_MOBILE;
          this.salesOrderFormData.CONTACT_EMAIL = details.CONTACT_EMAIL;
        }
      },
      error: (err) => console.error('API error:', err),
    });
  }
  getQuotations() {
    const payload = {
      CUST_ID: this.selectedCustomerId,
    };
    this.dataService
      .getQuotationListForSalesOrder(payload)
      .subscribe((response: any) => {
        this.quotationList = response.Data;
      });
  }
  selectQuotation() {
    const selectedRows = this.quotationGrid.instance.getSelectedRowsData();
    console.log(selectedRows);

    if (selectedRows.length === 0) {
      alert('Please select at least one quotation.');
      return;
    }

    selectedRows.forEach((row) => {
      // Push quotation ID into QTN_ID array (avoid duplicates)
      if (selectedRows.length > 0) {
        this.salesOrderFormData.QTN_ID = selectedRows[0].QTN_ID; // single ID
      }

      // Push details into sales order
      this.salesOrderFormData.Details.push({
        ID: row.ID,
        ITEM_ID: row.ITEM_ID || null,
        ITEM_CODE: row.ITEM_CODE || '',
        DESCRIPTION: row.ITEM_NAME || '',
        MATRIX_CODE: row.MATRIX_CODE || '',
        REMARKS: row.REMARKS || '',
        UOM: row.UOM || '',
        TAX_PERCENT: row.TAX_PERCENT || 0,
        QUANTITY: row.QUANTITY || 0,
        PRICE: row.PRICE || 0,
        GROSS_AMOUNT: 0,
        DISC_PERCENT: row.DISC_PERCENT || 0,
        AMOUNT: row.AMOUNT,
        TAX_AMOUNT: row.TAX_AMOUNT,
        TOTAL_AMOUNT: row.TOTAL_AMOUNT,
      });
    });

    this.itemsGridRef.instance.refresh(); // Refresh main grid
    this.quotationPopupOpened = false; // Close popup

    console.log('Selected QTN_IDs:', this.salesOrderFormData.QTN_ID);
  }

  getItems() {
    const payload = { STORE_ID: this.storeFromSession };
    return this.dataService.getItemsForQuotation(payload).pipe(
      tap((response: any) => {
        this.items = response.Data;
      })
    );
  }

  calculateSerialNumber = (rowData: any) => {
    const index = this.salesOrderFormData.Details.indexOf(rowData);
    return index + 1;
  };

  calculateGrossAmount = (rowData: any) => {
    const qty = Number(rowData.QUANTITY) || 0;
    const price = Number(rowData.PRICE) || 0;
    return qty * price;
  };
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
  onInfoClick() {}
  onRoundOffChange(e: any) {
    if (this.isRoundOff) {
      // Round to nearest integer
      this.salesOrderFormData.NET_AMOUNT = Math.round(
        this.salesOrderFormData.NET_AMOUNT
      );
    } else {
      // Reset to actual total from grid
      const total = this.dataGrid.instance.getTotalSummaryValue('TOTAL_AMOUNT');
      this.salesOrderFormData.NET_AMOUNT = total;
    }
  }

  getSalesOrderNo() {
    this.dataService.getVoucherNoForSalesOrder().subscribe(
      (response: any) => {
        if (response?.Flag === 1 && response?.Data?.length) {
          this.salesOrderFormData.SO_NO = response.Data[0].VOCHERNO;
          console.log(this.salesOrderFormData.SO_NO, 'SONO');
        } else {
          console.error('No data returned for voucher number');
        }
      },
      (err) => {
        console.error('API error:', err);
      }
    );
  }

  cancel() {
    this.popupClosed.emit();
  }

  saveSalesOrder() {
    const phoneValid = this.phoneValidation({
      value: this.salesOrderFormData.CONTACT_PHONE,
      rule: {},
    });
    if (!phoneValid) {
      notify('Invalid phone number.', 'warning', 3000);
      return;
    }

    const emailValid = this.isEmailValid(this.salesOrderFormData.CONTACT_EMAIL);
    if (!emailValid) {
      notify('Invalid email address.', 'warning', 3000);
      return;
    }
    // 2. Business validations
    if (!this.salesOrderFormData.CUST_ID) {
      notify('Please select a customer.', 'warning', 3000);
      return;
    }

    if (
      !this.salesOrderFormData.Details ||
      this.salesOrderFormData.Details.length === 0
    ) {
      notify(
        'Please add at least one item to the sales order.',
        'warning',
        3000
      );
      return;
    }

    // 3. Prepare payload
    const payload = {
      ...this.salesOrderFormData,
      QTN_ID: this.salesOrderFormData.QTN_ID,
      SO_DATE: this.salesOrderFormData.SO_DATE
        ? new Date(this.salesOrderFormData.SO_DATE).toISOString().split('T')[0] // overwrite with YYYY-MM-DD
        : null,
      COMPANY_ID: this.companyID,
      FIN_ID: this.finID,
      STORE_ID: this.storeFromSession,
      USER_ID: this.userID,
    };

    console.log('Sales Order Payload:', payload);

    // 4. Choose API based on mode
    let apiCall;
    if (this.isApproved) {
      confirm(
        'Are you sure you want to approve this Sales Order?',
        'Confirm Approval'
      ).then((dialogResult) => {
        if (dialogResult) {
          apiCall = this.dataService.approveSalesOrder(payload);
          apiCall.subscribe({
            next: (res: any) => {
              if (res && res.Flag === '1') {
                notify(
                  res.Message || 'Sales Order approved successfully.',
                  'success',
                  3000
                );
                this.popupClosed.emit();
                this.getSalesOrderNo();
              } else {
                notify(
                  res?.Message || 'Failed to approve Sales Order.',
                  'error',
                  3000
                );
              }
            },
            error: (err) => {
              console.error('Approve error:', err);
              notify(
                'Error approving Sales Order. Please try again.',
                'error',
                3000
              );
            },
          });
        }
      });
    } else if (this.isEditing) {
      apiCall = this.dataService.updateSalesOrder(payload);
    } else {
      apiCall = this.dataService.saveSalesOrder(payload);
    }

    // 5. Call backend
    apiCall.subscribe({
      next: (res: any) => {
        if (res && res.Flag === '1') {
          notify(
            res.Message || 'Sales Order processed successfully.',
            'success',
            3000
          );
          this.popupClosed.emit();
          this.getSalesOrderNo();
          // reset if new save
          if (!this.isEditing && !this.isApproved) {
            this.salesOrderFormData = {
              ID: 0,
              COMPANY_ID: this.companyID,
              FIN_ID: this.finID,
              STORE_ID: this.storeFromSession,
              SO_NO: '',
              SO_DATE: this.salesOrderFormData.SO_DATE
                ? new Date(this.salesOrderFormData.SO_DATE)
                    .toISOString()
                    .split('T')[0] // <-- only "2025-09-27"
                : null,
              CUST_ID: 0,
              SALESMAN_ID: 0,
              CONTACT_NAME: '',
              CONTACT_PHONE: '',
              CONTACT_EMAIL: '',
              QTN_ID: 0,
              REF_NO: '',
              PAY_TERM_ID: 1,
              DELIVERY_TERM_ID: 1,
              GROSS_AMOUNT: 0,
              CHARGE_DESCRIPTION: '',
              CHARGE_AMOUNT: 0,
              NET_AMOUNT: 0,
              TRANS_ID: 0,
              USER_ID: this.userID,
              NARRATION: '',
              Details: [],
            };
          }
        } else {
          notify(res?.Message || 'Failed to save Sales Order.', 'error', 3000);
        }
      },
      error: (err) => {
        console.error('Save error:', err);
        notify('Error saving Sales Order. Please try again.', 'error', 3000);
      },
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
  declarations: [SalesOrderFormComponent],
  exports: [SalesOrderFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SalesOrderFormModule {}
