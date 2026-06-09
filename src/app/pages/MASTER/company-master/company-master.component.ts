import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  NgModule,
  NgZone,
  ViewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxFormModule,
  DxLoadIndicatorModule,
  DxLoadPanelModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTabPanelModule,
  DxTextBoxModule,
  DxTreeListModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import notify from 'devextreme/ui/notify';
import { FormPopupModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-company-master',
  templateUrl: './company-master.component.html',
  styleUrls: ['./company-master.component.scss'],
})
export class CompanyMasterComponent {
  @ViewChild('formValidationGroup')
  formValidationGroup: DxValidationGroupComponent;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  Datasource: DataSource;
  companyList: any[] = [];
  companyRowCount = 0;
  formsource: any;
  isFilterRowVisible: boolean = false;
  isFilterOpened = false;
  addPopup: boolean = false;
  editPopup: boolean = false;
  editingRowData: any = {};
  selectedData: any;
  selectedCompanyType: any;
  CompanyTypeDropdown: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
  stateList: any;
  state: any;
  selected_Company_id: any;
  isSaving = false;
  mobile_limit: any;
  countryCodes: any;
  countryCodephone: any;
  countryCodemobile: any;
  countryCodewhatsapp: any;
  Phone_limit: number;
  whatsapp_limit: number;

  constructor(
    private fb: FormBuilder,
    private dataservice: DataService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {
    this.formsource = this.fb.group({
      //  ID :[null, Validators.required],
      CompanyType: ['', Validators.required],
      CompanyTypeName: ['', Validators.required],
      Code: [null, Validators.required],
      CompanyName: [null, Validators.required],
      FirstAddress: ['', Validators.required],
      SecondAddress: ['', Validators.required],
      ThirdAddress: ['', Validators.required],
      ContactName: ['', Validators.required],
      Mobile: ['', Validators.required],
      Telephone: ['', Validators.required],
      WhatsApp: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Inactive: [false],
      STATE_ID: ['', Validators.required],
      PAN: ['', Validators.required],
      CIN: ['', Validators.required],
      GSTNo: ['', Validators.required],
    });
    this.get_Company_List();
    this.get_Company_Dropdown_List();

    this.dataservice.getCountryWithFlags().subscribe((data) => {
      this.countryCodes = data;
    });
  }

  // getStatusFlagClass(IS_INACTIVE: boolean): string {
  //   return IS_INACTIVE ? 'flag-red' : 'flag-green';
  // }

  getStatusFlagClass(IS_INACTIVE: boolean): string {
    return IS_INACTIVE ? 'flag-red' : 'flag-green';
  }

  getStatusText(IS_INACTIVE: boolean): string {
    return IS_INACTIVE ? 'Inactive' : 'Active';
  }

  addButtonOptions = {
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      this.ngZone.run(() => this.addCompany());
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
    onClick: () => this.toggleFilterRow(),
  };

  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    elementAttr: { class: 'toolbar-icon-btn' },
    onClick: () => this.refreshGrid(),
    text: '',
  };

  refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
      // Or reload data from API if needed
      this.get_Company_List();
    }
  }

  toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
  };

  getCompanyList() {
    const payload = { COMPANY_ID: this.selected_Company_id, NAME: 'STATE' };
    this.dataservice.getDropdownData(payload).subscribe((response: any) => {
      this.stateList = response;
    });
  }

  sesstion_Details() {
    const sessionData = JSON.parse(sessionStorage.getItem('savedUserData'));

    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
  }

  ngOnInit() {
    const currentUrl = this.router.url;

    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );

    const menuGroups = menuResponse.MenuGroups || [];

    const packingRights = menuGroups
      .flatMap((group: any) => group.Menus)
      .find((menu: any) => menu.Path === '/company');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanPrint;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.CanApprove;
    }
    this.sesstion_Details();
    this.getCompanyList();
  }

  validateEmail = (e: any): boolean => {
    const value = (e.value || '').trim();

    // Empty → valid (not mandatory)
    if (!value) return true;

    // Validate only if user entered something
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(value);
  };

  onAddPopupClose() {
    this.selectedCompanyType = null;
  }

  addCompany() {
    this.addPopup = true;

    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();

      this.formsource.reset({
        Inactive: '',
        Code: '',
        CompanyName: '',
      });

      // ✅ remove validators when opening
      this.formsource.get('Code')?.clearValidators();
      this.formsource.get('CompanyName')?.clearValidators();
      this.formsource.get('CompanyType')?.clearValidators();
      this.formsource.updateValueAndValidity();
    });
  }
  closePop() {
    this.addPopup = false;
    this.editPopup = false;
    this.selectedCompanyType = [];
    this.formsource.reset();
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });
  }

  //===============get Dropdown List=======================
  get_Company_Dropdown_List() {
    this.dataservice.CompanyDropdown_Api().subscribe((response: any) => {
      this.CompanyTypeDropdown = response;
    });
  }

  onCompanyTypeChanged(event: any) {
    this.selectedCompanyType = event.value;
    this.get_Company_Dropdown_List();
  }

  onStateChanged(event: any) {
    this.state = event.value;
  }

  onEditingStart(event: any) {
    event.cancel = true;
    this.editingRowData = { ...event.data };
    this.selectData(event);
    this.editPopup = true;
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });
  }

  //===================get data list========================
  get_Company_List() {
    this.Datasource = new DataSource({
      load: () =>
        new Promise((resolve) => {
          this.dataservice.get_CompanyList_Api().subscribe({
            next: (res: any) => {
              const data = (res?.Data || [])
                .map((item: any, index: number) => ({
                  ...item,
                  SlNo: index + 1,
                }))
                .sort((a: any, b: any) => Number(b.ID) - Number(a.ID));

              this.companyList = data; // ✅ array cache
              this.companyRowCount = data.length;

              resolve(data); // 🔑 grid loader stops
            },
            error: () => {
              this.companyList = [];
              this.companyRowCount = 0;
              resolve([]);
            },
          });
        }),
    });
  }

  addData() {
    const validationResult = this.formValidationGroup.instance.validate();
    if (!validationResult.isValid) {
      return;
    }

    // Get form values
    const Company_code =
      this.formsource.get('Code')?.value?.toString().trim() || '';
    const Company_name =
      this.formsource.get('CompanyName')?.value?.toString().trim() || '';
    const First_address =
      this.formsource.get('FirstAddress')?.value?.toString().trim() || '';
    const Second_address =
      this.formsource.get('SecondAddress')?.value?.toString().trim() || '';
    const Third_address =
      this.formsource.get('ThirdAddress')?.value?.toString().trim() || '';
    const Contact_name =
      this.formsource.get('ContactName')?.value?.toString().trim() || '';
    const Phone_no =
      this.formsource.get('Telephone')?.value?.toString().trim() || '';
    const Mobile_no =
      this.formsource.get('Mobile')?.value?.toString().trim() || '';
    const Email = this.formsource.get('Email')?.value?.toString().trim() || '';
    const WhatsApp_no =
      this.formsource.get('WhatsApp')?.value?.toString().trim() || '';
    const Company_type = this.formsource.get('CompanyType')?.value || 0;
    const STATE_ID = this.formsource.get('STATE_ID')?.value || 0;
    const PAN = this.formsource.get('PAN')?.value || '';
    const GSTNo = this.formsource.get('GSTNo')?.value || '';
    const CIN = this.formsource.get('CIN')?.value || '';

    // ---------------- DUPLICATE CHECK (FIXED) ----------------
    const newCode = Company_code.toLowerCase();
    const newName = Company_name.toLowerCase();

    const isDuplicate = this.companyList?.some((data: any) => {
      const existingCode = data.COMPANY_CODE?.toString().trim().toLowerCase();
      const existingName = data.COMPANY_NAME?.toString().trim().toLowerCase();

      return existingCode === newCode || existingName === newName;
    });

    if (isDuplicate) {
      notify(
        {
          message: 'Company Code or Company Name already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error',
      );
      return;
    }

    // ---------------- PAYLOAD ----------------
    const payload = {
      COMPANY_CODE: Company_code,
      COMPANY_NAME: Company_name,
      ADDRESS1: First_address,
      ADDRESS2: Second_address,
      ADDRESS3: Third_address,
      CONTACT_NAME: Contact_name,
      PHONE: Phone_no,
      MOBILE: Mobile_no,
      EMAIL: Email,
      WHATSAPP: WhatsApp_no,
      COMPANY_TYPE: Company_type,
      IS_INACTIVE: false,
      STATE_ID: STATE_ID,
      GST_NO: GSTNo,
      PAN_NO: PAN,
      CIN: CIN,
    };

    // ---------------- API CALL ----------------
    if (Company_code && Company_name && Company_type) {
      this.isSaving = true;
      this.dataservice.Insert_CompanyList_Api(payload).subscribe(
        (res: any) => {
          this.isSaving = false;
          notify(
            {
              message: 'Data successfully added',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );

          // Close popup ONLY after success
          this.addPopup = false;
          this.editPopup = false;

          this.formsource.reset();
          this.get_Company_List();
        },
        (error) => {
          this.isSaving = false; // ✅ STOP loading
          console.error('Insert company failed:', error);

          notify(
            {
              message: 'Failed to add company. Please try again.',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1500,
            },
            'error',
          );
        },
      );
    }
  }

  selectData(event: any) {
    const ID = event?.data?.ID; // use lowercase `data`, not `Data`

    if (ID !== undefined) {
      this.dataservice.Select_CompanyList_Api(ID).subscribe((response: any) => {
        const data = response.Data;
        this.selectedData = response;
        this.editingRowData = { ...data };
        // 🔹 PHONE split
        if (data.PHONE) {
          const phoneParts = data.PHONE.split('-');
          this.countryCodephone = phoneParts[0]; // +971
          this.editingRowData.PHONE = phoneParts[1]; // 578674589
        }

        // 🔹 MOBILE split
        if (data.MOBILE) {
          const mobileParts = data.MOBILE.split('-');
          this.countryCodemobile = mobileParts[0];
          this.editingRowData.MOBILE = mobileParts[1];
        }

        // 🔹 WHATSAPP split
        if (data.WHATSAPP) {
          const whatsappParts = data.WHATSAPP.split('-');
          this.countryCodewhatsapp = whatsappParts[0];
          this.editingRowData.WHATSAPP = whatsappParts[1];
        }

        this.formsource.patchValue({
          CompanyTypeName: data.COMPANY_TYPE || 0,
          STATE_ID: data.STATE_ID,
        });

        this.formsource.patchValue({
          CompanyTypeName: response.Data.COMPANY_TYPE || 0,
          STATE_ID: response.Data.STATE_ID,
        });
      });
    } else {
      console.warn('No ID found in selected row event:', event);
    }
  }

  editData() {
    const validationResult = this.formValidationGroup?.instance?.validate();
    const Id = this.editingRowData.ID;
    const Company_code = this.editingRowData.COMPANY_CODE;
    const Company_name = this.editingRowData.COMPANY_NAME;
    const First_address = this.editingRowData.ADDRESS1;
    const Second_address = this.editingRowData.ADDRESS2;
    const Third_address = this.editingRowData.ADDRESS3;
    const Contact_name = this.editingRowData.CONTACT_NAME;
    const Phone_no = this.editingRowData.PHONE;
    const Mobile_no = this.editingRowData.MOBILE;
    const Email = this.editingRowData.EMAIL;
    const WhatsApp_no = this.editingRowData.WHATSAPP;
    const Company_type = this.selectedCompanyType;
    const STATE_ID = this.state;
    const PAN = this.editingRowData.PAN_NO;
    const GSTNo = this.editingRowData.GST_NO;
    const CIN = this.editingRowData.CIN;

    // const Company_type = this.editingRowData.COMPANY_TYPE;
    const Is_Inactive = this.editingRowData.IS_INACTIVE;

    const payload = {
      ID: Id,
      COMPANY_CODE: Company_code,
      COMPANY_NAME: Company_name,
      ADDRESS1: First_address,
      ADDRESS2: Second_address,
      ADDRESS3: Third_address,
      CONTACT_NAME: Contact_name,
      PHONE: this.countryCodephone
        ? `${this.countryCodephone}-${Phone_no || ''}`
        : Phone_no,

      MOBILE: this.countryCodemobile
        ? `${this.countryCodemobile}-${Mobile_no || ''}`
        : Mobile_no,
      EMAIL: Email,
      WHATSAPP: this.countryCodewhatsapp
        ? `${this.countryCodewhatsapp}-${WhatsApp_no || ''}`
        : WhatsApp_no,
      COMPANY_TYPE: Company_type,
      IS_INACTIVE: Is_Inactive,
      STATE_ID: STATE_ID,
      PAN_NO: PAN,
      GST_NO: GSTNo,
      CIN: CIN,
    };

    if (Company_code && Company_name && Company_type) {
      this.isSaving = true;
      this.dataservice.Update_CompanyList_Api(payload).subscribe(
        (res: any) => {
          this.isSaving = false;
          notify(
            {
              message: 'Data succesfully updated',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );

          this.formsource.reset();
          this.get_Company_List();
          this.editPopup = false;
        },
        (error) => {
          this.isSaving = false; // ✅ STOP loading
          console.error('Update failed:', error);

          notify(
            {
              message: 'Failed to update data. Please try again.',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1500,
            },
            'error',
          );
        },
      );
    }
  }

  delete_Data(event: any) {
    const id = event.data.ID;

    event.cancel = true; // prevent default delete

    this.dataservice.Delete_CompanyList_Api(id).subscribe({
      next: () => {
        notify(
          {
            message: 'Company deleted successfully',
            type: 'success',
            displayTime: 3000,
          },
          'success',
          3000,
        );

        event.component.refresh();
      },
      error: (err) => {
        notify(
          {
            message: 'Failed to delete data',
            type: 'error',
            displayTime: 3000,
          },
          'error',
          3000,
        );

        console.error(err);
      },
    });
  }

  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'company';
    this.dataservice.exportDataGrid(event, fileName);
  }

  onCountrycodeChangePhone(e: any) {
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.dataservice.get_mobile_no_length(payload).subscribe((res: any) => {
      this.Phone_limit = Number(res.Data[0].MOBILE_DIGITS);
    });
  }
  onCountrycodeChangeWhatsapp(e: any) {
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.dataservice.get_mobile_no_length(payload).subscribe((res: any) => {
      this.whatsapp_limit = Number(res.Data[0].MOBILE_DIGITS);
    });
  }
  onCountrycodeChangeMobile(e: any) {
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.dataservice.get_mobile_no_length(payload).subscribe((res: any) => {
      this.mobile_limit = Number(res.Data[0].MOBILE_DIGITS);
    });
  }
  validateMobileLength = (e: any): boolean => {
    const value = e.value;

    // ✅ Skip validation if empty
    if (!value) return true;

    return value.length === this.mobile_limit;
  };
  validatePhoneLength = (e: any): boolean => {
    const value = e.value;

    // ✅ Skip validation if empty
    if (!value) return true;

    return value.length === this.Phone_limit;
  };
  validateWhatsAppLength = (e: any): boolean => {
    const value = e.value;

    // ✅ Skip validation if empty
    if (!value) return true;

    return value.length === this.whatsapp_limit;
  };
  countryDisplay(item: any) {
    if (!item) return '';
    return `${item.CODE}`;
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    DxTextBoxModule,
    DxFormModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    DxValidatorModule,
    DxValidationGroupModule,
    DxTabPanelModule,
    DxSelectBoxModule,
    DxTreeListModule,
    DxLoadPanelModule,
    DxLoadIndicatorModule,
    DxNumberBoxModule,
  ],
  providers: [],
  exports: [],
  declarations: [CompanyMasterComponent],
})
export class CompanyMasterModule {}
