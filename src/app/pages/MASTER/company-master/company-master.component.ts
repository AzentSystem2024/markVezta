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
  @ViewChild('addValidationGroup')
  addValidationGroup: DxValidationGroupComponent;
  @ViewChild('editValidationGroup')
  editValidationGroup: DxValidationGroupComponent;
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
  selectedEditId: any = null;
  originalCode: string = '';
  originalName: string = '';
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
      CompanyType: [null, Validators.required],
      CompanyTypeName: [''],
      Code: ['', Validators.required],
      CompanyName: ['', Validators.required],
      FirstAddress: [''],
      SecondAddress: [''],
      ThirdAddress: [''],
      ContactName: [''],
      Mobile: [''],
      Telephone: [''],
      WhatsApp: [''],
      Email: [''],
      Inactive: [false],
      STATE_ID: [null, Validators.required],
      PAN: [''],
      CIN: [''],
      GSTNo: [''],
    });
    this.get_Company_List();
    this.get_Company_Dropdown_List();

    this.dataservice.getCountryWithFlags().subscribe((data) => {
      this.countryCodes = data;
    });
  }

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

  onAddPopupHidden() {
    this.addValidationGroup?.instance?.reset();
    this.selectedCompanyType = null;
    this.countryCodephone = null;
    this.countryCodemobile = null;
    this.countryCodewhatsapp = null;
    this.Phone_limit = undefined;
    this.mobile_limit = undefined;
    this.whatsapp_limit = undefined;
    this.formsource.reset({
      CompanyType: null,
      CompanyTypeName: '',
      Code: '',
      CompanyName: '',
      FirstAddress: '',
      SecondAddress: '',
      ThirdAddress: '',
      ContactName: '',
      Mobile: '',
      Telephone: '',
      WhatsApp: '',
      Email: '',
      Inactive: false,
      STATE_ID: null,
      PAN: '',
      CIN: '',
      GSTNo: '',
    });
  }

  onEditPopupHidden() {
    this.editValidationGroup?.instance?.reset();
    this.selectedCompanyType = null;
    this.state = null;
    this.editingRowData = {};
    this.selectedEditId = null;
    this.originalCode = '';
    this.originalName = '';
    this.countryCodephone = null;
    this.countryCodemobile = null;
    this.countryCodewhatsapp = null;
    this.Phone_limit = undefined;
    this.mobile_limit = undefined;
    this.whatsapp_limit = undefined;
  }

  addCompany() {
    this.formsource.reset({
      CompanyType: null,
      CompanyTypeName: '',
      Code: '',
      CompanyName: '',
      FirstAddress: '',
      SecondAddress: '',
      ThirdAddress: '',
      ContactName: '',
      Mobile: '',
      Telephone: '',
      WhatsApp: '',
      Email: '',
      Inactive: false,
      STATE_ID: null,
      PAN: '',
      CIN: '',
      GSTNo: '',
    });
    this.selectedCompanyType = null;
    this.countryCodephone = null;
    this.countryCodemobile = null;
    this.countryCodewhatsapp = null;
    this.Phone_limit = undefined;
    this.mobile_limit = undefined;
    this.whatsapp_limit = undefined;
    this.addPopup = true;

    setTimeout(() => {
      this.addValidationGroup?.instance?.reset();
    });
  }
  closePop() {
    this.addPopup = false;
    this.editPopup = false;
  }

  //===============get Dropdown List=======================
  get_Company_Dropdown_List() {
    this.dataservice.CompanyDropdown_Api().subscribe((response: any) => {
      this.CompanyTypeDropdown = response;
    });
  }

  onCompanyTypeChanged(event: any) {
    this.selectedCompanyType = event.value;
  }

  onStateChanged(event: any) {
    this.state = event.value;
  }

  onEditingStart(event: any) {
    event.cancel = true;
    this.selectedEditId = event.data?.ID ?? event.data?.COMPANY_ID;
    this.originalCode = (
      event.data?.COMPANY_CODE ??
      event.data?.Code ??
      event.data?.CODE ??
      ''
    )
      .toString()
      .trim()
      .toLowerCase();
    this.originalName = (
      event.data?.COMPANY_NAME ??
      event.data?.CompanyName ??
      event.data?.NAME ??
      ''
    )
      .toString()
      .trim()
      .toLowerCase();
    this.editingRowData = { ...event.data };
    this.selectedCompanyType = event.data?.COMPANY_TYPE ?? null;
    this.state = event.data?.STATE_ID ?? null;
    this.selectData(event);
    this.editPopup = true;
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
    const validationResult = this.addValidationGroup?.instance?.validate();
    if (!validationResult || !validationResult.isValid) {
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
    const Company_type = this.formsource.get('CompanyType')?.value;
    const STATE_ID = this.formsource.get('STATE_ID')?.value;
    const PAN = this.formsource.get('PAN')?.value || '';
    const GSTNo = this.formsource.get('GSTNo')?.value || '';
    const CIN = this.formsource.get('CIN')?.value || '';

    // ---------------- DUPLICATE CHECK ----------------
    const newCode = Company_code.toLowerCase();
    const newName = Company_name.toLowerCase();

    const isDuplicate = this.companyList?.some((data: any) => {
      const existingCode = (data.COMPANY_CODE ?? data.CODE)?.toString().trim().toLowerCase();
      const existingName = (data.COMPANY_NAME ?? data.NAME)?.toString().trim().toLowerCase();

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
      PHONE: this.countryCodephone && Phone_no ? `${this.countryCodephone}-${Phone_no}` : Phone_no,
      MOBILE: this.countryCodemobile && Mobile_no ? `${this.countryCodemobile}-${Mobile_no}` : Mobile_no,
      EMAIL: Email,
      WHATSAPP: this.countryCodewhatsapp && WhatsApp_no ? `${this.countryCodewhatsapp}-${WhatsApp_no}` : WhatsApp_no,
      COMPANY_TYPE: Company_type,
      IS_INACTIVE: false,
      STATE_ID: STATE_ID,
      GST_NO: GSTNo,
      PAN_NO: PAN,
      CIN: CIN,
    };

    const isCompanyTypeValid =
      Company_type !== null &&
      Company_type !== undefined &&
      Company_type !== '';

    // ---------------- API CALL ----------------
    if (Company_code && Company_name && isCompanyTypeValid) {
      this.isSaving = true;
      this.dataservice.Insert_CompanyList_Api(payload).subscribe({
        next: (res: any) => {
          this.isSaving = false;
          notify(
            {
              message: 'Data successfully added',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );

          // Close popup smoothly without clearing form while visible
          this.addPopup = false;
          this.get_Company_List();
        },
        error: (error: any) => {
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
      });
    }
  }

  selectData(event: any) {
    const ID = event?.data?.ID ?? event?.data?.COMPANY_ID ?? this.selectedEditId;
    this.selectedEditId = ID;

    if (ID !== undefined && ID !== null) {
      this.dataservice.Select_CompanyList_Api(ID).subscribe({
        next: (response: any) => {
          let data: any = {};
          if (response?.Data) {
            data = Array.isArray(response.Data) ? response.Data[0] : response.Data;
          } else if (Array.isArray(response)) {
            data = response[0];
          } else if (response) {
            data = response;
          }

          if (!data || typeof data !== 'object') {
            return;
          }

          this.selectedData = response;
          this.editingRowData = { ...this.editingRowData, ...data };
          if (data.ID ?? data.COMPANY_ID) {
            this.selectedEditId = data.ID ?? data.COMPANY_ID;
          }

          const currentCode = (
            data.COMPANY_CODE ??
            data.Code ??
            data.CODE ??
            ''
          )
            .toString()
            .trim()
            .toLowerCase();
          if (currentCode) {
            this.originalCode = currentCode;
          }
          const currentName = (
            data.COMPANY_NAME ??
            data.CompanyName ??
            data.NAME ??
            ''
          )
            .toString()
            .trim()
            .toLowerCase();
          if (currentName) {
            this.originalName = currentName;
          }

          // 🔹 PHONE split
          if (data.PHONE) {
            const phoneParts = data.PHONE.toString().split('-');
            if (phoneParts.length > 1) {
              this.countryCodephone = phoneParts[0];
              this.editingRowData.PHONE = phoneParts.slice(1).join('-');
            } else {
              this.countryCodephone = null;
              this.editingRowData.PHONE = data.PHONE;
            }
            if (this.countryCodephone) {
              this.onCountrycodeChangePhone({ value: this.countryCodephone });
            }
          } else {
            this.countryCodephone = null;
          }

          // 🔹 MOBILE split
          if (data.MOBILE) {
            const mobileParts = data.MOBILE.toString().split('-');
            if (mobileParts.length > 1) {
              this.countryCodemobile = mobileParts[0];
              this.editingRowData.MOBILE = mobileParts.slice(1).join('-');
            } else {
              this.countryCodemobile = null;
              this.editingRowData.MOBILE = data.MOBILE;
            }
            if (this.countryCodemobile) {
              this.onCountrycodeChangeMobile({ value: this.countryCodemobile });
            }
          } else {
            this.countryCodemobile = null;
          }

          // 🔹 WHATSAPP split
          if (data.WHATSAPP) {
            const whatsappParts = data.WHATSAPP.toString().split('-');
            if (whatsappParts.length > 1) {
              this.countryCodewhatsapp = whatsappParts[0];
              this.editingRowData.WHATSAPP = whatsappParts.slice(1).join('-');
            } else {
              this.countryCodewhatsapp = null;
              this.editingRowData.WHATSAPP = data.WHATSAPP;
            }
            if (this.countryCodewhatsapp) {
              this.onCountrycodeChangeWhatsapp({ value: this.countryCodewhatsapp });
            }
          } else {
            this.countryCodewhatsapp = null;
          }

          if (data.COMPANY_TYPE !== undefined && data.COMPANY_TYPE !== null) {
            this.selectedCompanyType = data.COMPANY_TYPE;
          }
          if (data.STATE_ID !== undefined && data.STATE_ID !== null) {
            this.state = data.STATE_ID;
          }
        },
        error: (err: any) => {
          console.error('Select company failed:', err);
        },
      });
    } else {
      console.warn('No ID found in selected row event:', event);
    }
  }

  editData() {
    const validationResult = this.editValidationGroup?.instance?.validate();
    if (!validationResult || !validationResult.isValid) {
      return;
    }

    const Id =
      this.selectedEditId ??
      this.editingRowData.ID ??
      this.editingRowData.COMPANY_ID ??
      this.selectedData?.Data?.ID ??
      this.selectedData?.ID;

    const Company_code = (
      this.editingRowData.COMPANY_CODE ??
      this.editingRowData.Code ??
      this.editingRowData.CODE ??
      ''
    )
      .toString()
      .trim();

    const Company_name = (
      this.editingRowData.COMPANY_NAME ??
      this.editingRowData.CompanyName ??
      this.editingRowData.NAME ??
      ''
    )
      .toString()
      .trim();

    const First_address = this.editingRowData.ADDRESS1 || '';
    const Second_address = this.editingRowData.ADDRESS2 || '';
    const Third_address = this.editingRowData.ADDRESS3 || '';
    const Contact_name = this.editingRowData.CONTACT_NAME || '';
    const Phone_no = this.editingRowData.PHONE?.toString().trim() || '';
    const Mobile_no = this.editingRowData.MOBILE?.toString().trim() || '';
    const Email = this.editingRowData.EMAIL?.toString().trim() || '';
    const WhatsApp_no = this.editingRowData.WHATSAPP?.toString().trim() || '';

    const Company_type =
      this.selectedCompanyType ??
      this.editingRowData.COMPANY_TYPE ??
      this.editingRowData.CompanyType ??
      this.editingRowData.COMPANY_TYPE_ID;

    const STATE_ID =
      this.state ??
      this.editingRowData.STATE_ID ??
      this.editingRowData.StateId ??
      this.editingRowData.STATE;

    const PAN = this.editingRowData.PAN_NO || '';
    const GSTNo = this.editingRowData.GST_NO || '';
    const CIN = this.editingRowData.CIN || '';
    const Is_Inactive = !!this.editingRowData.IS_INACTIVE;

    // ---------------- DUPLICATE CHECK ----------------
    const newCode = Company_code.toLowerCase();
    const newName = Company_name.toLowerCase();

    const isDuplicate = this.companyList?.some((data: any) => {
      const dataId = data.ID ?? data.COMPANY_ID;
      // Skip the record currently being edited
      if (Id != null && dataId != null && String(dataId).trim() === String(Id).trim()) {
        return false;
      }
      const existingCode = (data.COMPANY_CODE ?? data.CODE)?.toString().trim().toLowerCase();
      const existingName = (data.COMPANY_NAME ?? data.NAME)?.toString().trim().toLowerCase();

      // Only flag duplicate if changed to a value that exists on another record
      const codeDuplicate =
        newCode !== '' &&
        newCode !== this.originalCode &&
        existingCode === newCode;

      const nameDuplicate =
        newName !== '' &&
        newName !== this.originalName &&
        existingName === newName;

      return codeDuplicate || nameDuplicate;
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

    const payload = {
      ID: Id,
      COMPANY_CODE: Company_code,
      COMPANY_NAME: Company_name,
      ADDRESS1: First_address,
      ADDRESS2: Second_address,
      ADDRESS3: Third_address,
      CONTACT_NAME: Contact_name,
      PHONE: this.countryCodephone && Phone_no
        ? `${this.countryCodephone}-${Phone_no}`
        : Phone_no,
      MOBILE: this.countryCodemobile && Mobile_no
        ? `${this.countryCodemobile}-${Mobile_no}`
        : Mobile_no,
      EMAIL: Email,
      WHATSAPP: this.countryCodewhatsapp && WhatsApp_no
        ? `${this.countryCodewhatsapp}-${WhatsApp_no}`
        : WhatsApp_no,
      COMPANY_TYPE: Company_type,
      IS_INACTIVE: Is_Inactive,
      STATE_ID: STATE_ID,
      PAN_NO: PAN,
      GST_NO: GSTNo,
      CIN: CIN,
    };

    const isCompanyTypeValid =
      Company_type !== null &&
      Company_type !== undefined &&
      Company_type !== '';

    const isCompanyCodeValid = Company_code.length > 0;
    const isCompanyNameValid = Company_name.length > 0;

    if (isCompanyCodeValid && isCompanyNameValid && isCompanyTypeValid) {
      this.isSaving = true;
      this.dataservice.Update_CompanyList_Api(payload).subscribe({
        next: (res: any) => {
          this.isSaving = false;
          notify(
            {
              message: 'Data succesfully updated',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success',
          );

          this.editPopup = false;
          this.get_Company_List();
        },
        error: (error: any) => {
          this.isSaving = false; // ✅ STOP loading
          console.error('Update failed:', error);

          notify(
            {
              message: error?.error?.message || 'Failed to update data. Please try again.',
              position: { at: 'top right', my: 'top right' },
              displayTime: 1500,
            },
            'error',
          );
        },
      });
    } else {
      notify(
        {
          message: 'Please fill all required fields',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1500,
        },
        'error',
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
    if (!e?.value) {
      this.Phone_limit = undefined;
      return;
    }
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.dataservice.get_mobile_no_length(payload).subscribe((res: any) => {
      if (res?.Data?.[0]?.MOBILE_DIGITS) {
        this.Phone_limit = Number(res.Data[0].MOBILE_DIGITS);
      }
    });
  }
  onCountrycodeChangeWhatsapp(e: any) {
    if (!e?.value) {
      this.whatsapp_limit = undefined;
      return;
    }
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.dataservice.get_mobile_no_length(payload).subscribe((res: any) => {
      if (res?.Data?.[0]?.MOBILE_DIGITS) {
        this.whatsapp_limit = Number(res.Data[0].MOBILE_DIGITS);
      }
    });
  }
  onCountrycodeChangeMobile(e: any) {
    if (!e?.value) {
      this.mobile_limit = undefined;
      return;
    }
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.dataservice.get_mobile_no_length(payload).subscribe((res: any) => {
      if (res?.Data?.[0]?.MOBILE_DIGITS) {
        this.mobile_limit = Number(res.Data[0].MOBILE_DIGITS);
      }
    });
  }
  validateMobileLength = (e: any): boolean => {
    const value = (e.value || '').toString().trim();
    if (!value || !this.mobile_limit) return true;
    return value.length === this.mobile_limit;
  };
  validatePhoneLength = (e: any): boolean => {
    const value = (e.value || '').toString().trim();
    if (!value || !this.Phone_limit) return true;
    return value.length === this.Phone_limit;
  };
  validateWhatsAppLength = (e: any): boolean => {
    const value = (e.value || '').toString().trim();
    if (!value || !this.whatsapp_limit) return true;
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
export class CompanyMasterModule { }
