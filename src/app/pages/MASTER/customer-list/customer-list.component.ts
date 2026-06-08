import {
  Component,
  OnInit,
  NgModule,
  ViewChild,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDateBoxModule,
  DxFormModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import { DataService } from 'src/app/services';
import { FormPopupModule } from 'src/app/components';
// import { CustomerFormComponent, CustomerFormModule } from 'src/app/components/HR/Masters
import { ExportService } from 'src/app/services/export.service';
import notify from 'devextreme/ui/notify';
import {
  CustomerFormComponent,
  CustomerFormModule,
} from '../../../components/HR/Masters/Customer/customer-form/customer-form.component';
import {
  CustomerEditFormComponent,
  CustomerEditFormModule,
} from '../../../components/HR/Masters/Customer/customer-edit-form/customer-edit-form.component';
import { FormTextboxModule } from '../../../components/utils/form-textbox/form-textbox.component';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss'],
})
export class CustomerListComponent {
  @ViewChild(CustomerFormComponent) customerComponent: CustomerFormComponent;

  @ViewChild(CustomerEditFormComponent)
  selectedCustomerData: CustomerEditFormComponent;

  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  // @ViewChild(SFormComponent) supplierForm!: SupplierFormComponent;
  CustomerDataSource: DataSource;
  customerList: any[] = [];
  customerRowCount = 0;
  country: any;
  selected_Company_id: any = null; // or ''

  PaymentTermsDropdownData: any;
  PriceClassDropdownData: any;
  VatRuleDropdownData: any;
  isAddCustomerPopupOpened = false;
  showFilterRow = true;
  showHeaderFilter = true;
  isEditCustomerPopupOpened: boolean = false;
  CountryDropdownData: any;
  VATRuleDropdownData: any[] = [];
  PriceLevelDropdownData: any[] = [];
  StateDropdownData: any;
  countryCode: any;
  isCurrencyAccepted: boolean = true;
  selecte_countyId: any;
  isFilterRowVisible: boolean = false;
  isFilterOpened = false;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  //========Variables for Pagination ====================
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showInfo = true;
  showNavButtons = true;
  addButtonOptions = {
    type: 'default',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addCustomer());
    },
    elementAttr: { class: 'add-button' },

    template: () => {
      return `
      <div class="add-btn-content">
        <span class="iconify"
              data-icon="formkit:add"
              data-width="20"
              data-height="20"></span>
        <span class="add-text">New</span>
      </div>
    `;
    },
  };
  searchButtonOptions = {
    icon: 'search',
    hint: 'Show / Hide Filters',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.toggleFilters(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
  };

  dob = new Date();

  formCustomerData = {
    WAREHOUSE_ID: '',
    DELIVERY_ADDRESS_ID: '',
    COMPANY_ID: 0,
    CUST_CODE: '',
    FIRST_NAME: '',
    LAST_NAME: '',
    DOB: this.dob,
    NATIONALITY: '',
    CONTACT_NAME: '',
    ADDRESS1: '',
    ADDRESS2: '',
    ADDRESS3: '',
    ZIP: '',
    STATE_ID: '',
    CITY: '',
    COUNTRY_ID: '',
    PHONE: '',
    EMAIL: '',
    MOBILE_NO: '',
    FAX_NO: '',
    CREDIT_LIMIT: '',
    CURRENT_CREDIT: '',
    PAY_TERM_ID: '',
    NOTES: '',
    PRICE_CLASS_ID: '',
    DISCOUNT_PERCENT: '',
    CUST_VAT_RULE_ID: '',
    VAT_REGNO: '',
  };

  //==========================Dummy data===========================

  // addButtonOptions = {
  //   text: 'New',
  //   icon: 'bi bi-file-earmark-plus',
  //   type: 'default',
  //   stylingMode: 'contained',
  //   hint: 'Add new entry',
  //   onClick: () => {
  //     // Run inside Angular's zone
  //     this.ngZone.run(() => this.addCustomer());
  //   },
  //   elementAttr: { class: 'add-button' },
  // };
  Selected_Customer_Data: any;
  changed_Customer_Data: any;

  selected_fin_id: any;
  constructor(
    private dataservice: DataService,
    private exportService: ExportService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    dataservice.getCountryData().subscribe((data) => {
      this.country = data;
    });
    dataservice.getPaymentTermsData().subscribe((data) => {
      this.PaymentTermsDropdownData = data;
    });
    const payload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'PRICECLASS',
    };
    dataservice.getDropdownData(payload).subscribe((data) => {
      this.PriceClassDropdownData = data;
    });
    const vatpayload = {
      COMPANY_ID: this.selected_Company_id,
      NAME: 'VATRULE',
    };
    dataservice.getDropdownData(vatpayload).subscribe((data) => {
      this.VatRuleDropdownData = data;
    });

    //  this.countryCode = authservice.getsettingsData().DEFAULT_COUNTRY_CODE;
    this.getStateDropDown();
    this.showCountry();
    this.selecte_countyId = this.formCustomerData.COUNTRY_ID;

    this.showCustomer();
    this.sesstion_Details();
  }
  // onExporting(event: any) {
  //   this.exportService.onExporting(event, 'Customer-list');
  // }

  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'customer-list';
    this.dataservice.exportDataGrid(event, fileName);
  }

  addCustomer() {
    this.isAddCustomerPopupOpened = true;
    this.sesstion_Details();

    this.formCustomerData = {
      WAREHOUSE_ID: '',
      DELIVERY_ADDRESS_ID: '',
      COMPANY_ID: 0,
      CUST_CODE: '',
      FIRST_NAME: '',
      LAST_NAME: '',
      DOB: new Date(),
      NATIONALITY: '',
      CONTACT_NAME: '',
      ADDRESS1: '',
      ADDRESS2: '',
      ADDRESS3: '',
      ZIP: '',
      STATE_ID: '',
      CITY: '',
      COUNTRY_ID: '',
      PHONE: '',
      EMAIL: '',
      MOBILE_NO: '',
      FAX_NO: '',
      CREDIT_LIMIT: '',
      CURRENT_CREDIT: '',
      PAY_TERM_ID: '',
      NOTES: '',
      PRICE_CLASS_ID: '',
      DISCOUNT_PERCENT: '',
      CUST_VAT_RULE_ID: '',
      VAT_REGNO: '',
    };
  }
  OnEditCustomer(e: any) {
    e.cancel = true;
    this.isEditCustomerPopupOpened = true;
    const ID = e.data.ID;
    this.dataservice.Select_Customer_Api(ID).subscribe((res: any) => {
      this.Selected_Customer_Data = res;
    });
  }
  showCustomer() {
    const payload = {
      COMPANY_ID: this.selected_Company_id,
    };

    this.CustomerDataSource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.getCustomerData(payload).subscribe({
            next: (response: any[]) => {
              const data = (response || []).map((item: any, index: number) => ({
                ...item,
                SNO: index + 1,
              }));

              this.customerList = data; // ✅ array cache
              this.customerRowCount = data.length;

              resolve(data); // 🔑 stop grid loader
            },
            error: () => {
              this.customerList = [];
              this.customerRowCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  // showCustomer(){
  //    this.dataservice.getCustomerData().subscribe(
  //     (response)=>{
  //           this.customer=response;
  //     }
  //    )
  // }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;

    this.selected_fin_id = sessionData.FINANCIAL_YEARS[0].FIN_ID;
  }
  onClickSaveCustomer() {
    const {
      WAREHOUSE_ID,
      COMPANY_ID,
      CUST_CODE,
      FIRST_NAME,
      LAST_NAME,
      DOB,
      NATIONALITY,
      CONTACT_NAME,
      ADDRESS1,
      ADDRESS2,
      ADDRESS3,
      ZIP,
      STATE_ID,
      CITY,
      COUNTRY_ID,
      PHONE,
      MOBILE_NO,
      EMAIL,
      FAX_NO,
      CREDIT_LIMIT,
      CURRENT_CREDIT,
      PAY_TERM_ID,
      NOTES,
      PRICE_CLASS_ID,
      DISCOUNT_PERCENT,
      CUST_VAT_RULE_ID,
      VAT_REGNO,
      CUST_TYPE,
    } = this.customerComponent.getNewCustomerData();

    // this.dataservice.postCustomerData(COMPANY_ID,CUST_CODE, FIRST_NAME,LAST_NAME,DOB,NATIONALITY,CONTACT_NAME,ADDRESS1,ADDRESS2,ADDRESS3,ZIP,STATE_ID,CITY,COUNTRY_ID,PHONE,MOBILE_NO,
    //   EMAIL,FAX_NO,CREDIT_LIMIT,CURRENT_CREDIT,PAY_TERM_ID,NOTES,PRICE_CLASS_ID,DISCOUNT_PERCENT,CUST_VAT_RULE_ID,VAT_REGNO).subscribe(
    //   (response)=>{

    const newCustomerData = this.customerComponent.getNewCustomerData();
    console.log(newCustomerData);
    // if(newCustomerData.DeliveryAddresses==[])
    const payload = {
      ...newCustomerData,
      COMPANY_ID: this.selected_Company_id,
    };

    this.dataservice.insert_customer_Data(payload).subscribe((res: any) => {
      notify(
        {
          message: 'Customer data Added successfully',
          position: { at: 'top right', my: 'top right' },
        },
        'success',
      );
      this.isAddCustomerPopupOpened = false;
      this.showCustomer();
      this.customerComponent.resetPartialForm();
    });
  }

  onCustomerUpdated(updatedCustomer: any) {
    // Option A: Reload full list
    this.showCustomer();

    // OR Option B: Update the existing row in the list directly
    const index = this.customerList.findIndex(
      (c) => c.CUST_CODE === updatedCustomer.CUST_CODE,
    );
    if (index > -1) {
      this.customerList[index] = { ...updatedCustomer };
    }

    this.isEditCustomerPopupOpened = false; // close popup if needed
  }

  onClickUpdateCustomer() {
    const updatedData = this.selectedCustomerData.UpdateData();
    console.log(updatedData, '==============form edit=============');

    this.dataservice.UpdateCustomerApi(updatedData).subscribe((res: any) => {
      try {
        notify(
          {
            message: 'Customerssssssssss data updated successfully',
            position: { at: 'top right', my: 'top right' },
          },
          'success',
        );
        this.isEditCustomerPopupOpened = false;
        this.dataGrid.instance.refresh();
        this.showCustomer();
      } catch (error) {
        notify(
          {
            message: 'Edit operation failed',
            position: { at: 'top right', my: 'top right' },
          },
          'error',
        );
      }
    });
  }

  onRowRemoving(event: any) {
    event.cancel = true; // prevent grid default delete

    const selectedRow = event.data;

    const {
      ID,
      CUST_CODE,
      FIRST_NAME,
      LAST_NAME,
      DOB,
      NATIONALITY,
      CONTACT_NAME,
      ADDRESS1,
      ADDRESS2,
      ADDRESS3,
      ZIP,
      STATE_ID,
      CITY,
      COUNTRY_ID,
      PHONE,
      MOBILE_NO,
      EMAIL,
      FAX_NO,
      CREDIT_LIMIT,
      CURRENT_CREDIT,
      PAY_TERM_ID,
      NOTES,
      PRICE_CLASS_ID,
      DISCOUNT_PERCENT,
      CUST_VAT_RULE_ID,
      VAT_REGNO,
    } = selectedRow;

    this.dataservice
      .removeCustomerData(
        ID,
        CUST_CODE,
        FIRST_NAME,
        LAST_NAME,
        DOB,
        NATIONALITY,
        CONTACT_NAME,
        ADDRESS1,
        ADDRESS2,
        ADDRESS3,
        ZIP,
        STATE_ID,
        CITY,
        COUNTRY_ID,
        PHONE,
        MOBILE_NO,
        EMAIL,
        FAX_NO,
        CREDIT_LIMIT,
        CURRENT_CREDIT,
        PAY_TERM_ID,
        NOTES,
        PRICE_CLASS_ID,
        DISCOUNT_PERCENT,
        CUST_VAT_RULE_ID,
        VAT_REGNO,
      )
      .subscribe({
        next: () => {
          notify(
            {
              message: 'Customer data deleted successfully',
              position: { at: 'top right', my: 'top right' },
            },
            'success',
          );

          this.showCustomer(); // refresh grid
        },
        error: () => {
          notify(
            {
              message: 'Delete operation failed',
              position: { at: 'top right', my: 'top right' },
            },
            'error',
          );
        },
      });
  }
  ngOnInit(): void {
    const currentUrl = this.router.url;
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];
    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === currentUrl);

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }

    this.showCustomer();
    this.getPaymentTerms();

    this.getVATRuleDropDown();
    this.getStateDropDown();
    this.getPriceLevelDropDown();
  }

  showCountry() {
    this.dataservice.getCountryDataAPi().subscribe((response) => {
      this.CountryDropdownData = response;
    });
  }
  getPriceLevelDropDown() {
    const payload = {
      NAME: 'PRICECLASS',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.getDropdownData(payload).subscribe((data: any) => {
      this.PriceLevelDropdownData = data;
    });
  }
  getVATRuleDropDown() {
    const payload = {
      NAME: 'VATRULE',
      COMPANY_ID: this.selected_Company_id,
    };
    this.dataservice.getDropdownData(payload).subscribe((data: any) => {
      this.VATRuleDropdownData = data;
    });
  }
  getPaymentTerms() {
    this.dataservice.getpayment_term_Api().subscribe((response) => {
      this.PaymentTermsDropdownData = response;
    });
  }

  getStateDropDown() {
    const id = this.selecte_countyId;
    const payload = {
      NAME: 'STATE_NAME',
      COUNTRY_ID: this.selecte_countyId,
    };
    this.dataservice.getStateData_Api(payload).subscribe((data: any) => {
      this.StateDropdownData = data;
    });
    // this.service.getStateData().subscribe((data: any) => {
    //   this.StateDropdownData = data;
    // });
  }
  onStateSelectionChanged(event: any) {}
  onCountrySelectionChanged(event: any) {
    this.selecte_countyId = event.value;
    this.getStateDropDown();
    const selectedCountry = this.CountryDropdownData.find(
      (country) => country.ID === event.value,
    );
    if (selectedCountry) {
      this.countryCode = selectedCountry.CODE;
    }
  }

  keyPressNumbers(event: any) {
    var charCode = event.which ? event.which : event.keyCode;
    var inputElement = event.target as HTMLInputElement;

    // Only Numbers 0-9
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    } else if (inputElement.value.length === 0 && charCode === 48) {
      // Check if first character is '0'
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  UpdateData() {
    // this.dataservice.UpdateCustomerApi(this.Selected_Customer_Data).subscribe((res:any)=>{
    //   // this.updateCompleted.emit(res);
    // })
  }

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.showCustomer();
    }
  }

  //========================hide and show heade filter==============================

  onToolbarPreparing(e: any) {
    const toolbarItems = e.toolbarOptions.items;

    // Avoid adding the button more than once
    const alreadyAdded = toolbarItems.some(
      (item: any) => item.name === 'toggleFilterButton',
    );
    if (!alreadyAdded) {
      toolbarItems.splice(toolbarItems.length - 1, 0, {
        widget: 'dxButton',
        name: 'toggleFilterButton', // custom name to avoid duplicates
        location: 'after',
        options: {
          icon: 'filter',
          hint: 'Search Column',
          onClick: () => this.toggleFilters(),
        },
      });
    }
  }
  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  onCancelCustomer() {
    this.customerComponent.resetPartialForm();
    this.isAddCustomerPopupOpened = false;
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    CustomerFormModule,
    CustomerEditFormModule,
    DxPopupModule,
    FormTextboxModule,
    DxCheckBoxModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxTextBoxModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    DxFormModule,
    DxTextAreaModule,
  ],
  providers: [],
  exports: [],
  declarations: [CustomerListComponent],
})
export class CustomerListModule {}
