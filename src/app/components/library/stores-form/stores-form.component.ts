import {
  Component,
  NgModule,
  enableProdMode,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import {
  DxCheckBoxModule,
  DxTagBoxModule,
  DxValidatorModule,
} from 'devextreme-angular';

import {
  DxSelectBoxModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxFormModule,
} from 'devextreme-angular';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DataService } from 'src/app/services';
import { CountryServiceService } from 'src/app/services/country-service.service';

@Component({
  selector: 'app-stores-form',
  templateUrl: './stores-form.component.html',
  styleUrls: ['./stores-form.component.scss'],
})
export class StoresFormComponent implements OnInit {
  @Input() storeData: any = {}; // for edit mode
  @Input() companyId!: number;
  @ViewChild('dxFormRef', { static: false }) dxForm: any;
  @Output() formSubmit = new EventEmitter<any>();
  CountryDropdownData: any[] = [];
  GroupDropdownData: any[] = [];
  StateDropdownData: any[] = [];
  selectedUnitsTooltip: any;
  countryCode: string = '971';
  formStoresData = {
    ID: 0,
    CODE: '',
    STORE_NAME: '',
    IS_PRODUCTION: false,
    ADDRESS1: '',
    ADDRESS2: '',
    ADDRESS3: '',
    ZIP_CODE: '',
    STATE_ID: null,
    CITY: '',
    COUNTRY_ID: null,
    IS_DEFAULT_STORE: false,
    PHONE: '',
    EMAIL: '',
    VAT_REGNO: '',
    GROUP_ID: null,
    STORE_NO: '0',
    IS_ACTIVE: false,
    COMPANY_ID: 0,
  };
  countryList: any;
  countries: any[] | undefined;
  selectedCountryId: any;
  Phone_limit: number | undefined;
  countryCodes: any;
  countryCodePhone: any;
  departments: any;
  selectedCompanyId: any;
  companyList: any[] | undefined;
  creditFormData: any;
  selectedDepartments: any[] = [];
  Country: any;
  State: any;
  selectedStateId: any;
  StateId: any;
  stateLabel: any;

  storesArray: any[] = [];

  constructor(
    private service: DataService,
    private countryService: CountryServiceService,
  ) {
    service.getCountryWithFlags().subscribe((data) => {
      this.countryCodes = data;
    });
  }
  newStores = this.formStoresData;

  getNewStoresData = () => ({
    ...this.newStores,
    PHONE: this.countryCodePhone + '-' + this.newStores.PHONE,
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['storeData'] && this.storeData) {
      // 👉 EDIT MODE
      if (Object.keys(this.storeData).length > 0) {
        const phoneNo = this.storeData.PHONE || '';

        let countryCodePhone = '';
        let phonenumber = '';

        if (phoneNo.includes('-')) {
          [countryCodePhone, phonenumber] = phoneNo.split('-');
        } else {
          phonenumber = phoneNo;
        }

        this.countryCodePhone = countryCodePhone;

        this.newStores = {
          ...this.formStoresData,
          ...this.storeData,
          PHONE: phonenumber,
        };
      }
      //  ADD MODE (important fix)
      else {
        this.resetForm();
      }
    }
    console.log(this.newStores, 'NEWSTOREASSSSSSS');
    // ADD MODE → ALWAYS set companyId when received
    if (changes['companyId'] && this.companyId) {
      this.newStores.COMPANY_ID = this.companyId;
    }
  }

  resetForm() {
    this.newStores = {
      ID: 0,
      CODE: '',
      STORE_NAME: '',
      IS_PRODUCTION: false,
      ADDRESS1: '',
      ADDRESS2: '',
      ADDRESS3: '',
      ZIP_CODE: '',
      STATE_ID: null,
      CITY: '',
      COUNTRY_ID: null,
      IS_DEFAULT_STORE: false,
      PHONE: '',
      EMAIL: '',
      VAT_REGNO: '',
      GROUP_ID: null,
      STORE_NO: '',
      IS_ACTIVE: false,
      COMPANY_ID: this.companyId,
    };
  }

  onDepartmentChanged(event: any) {}

  ngOnInit(): void {
    this.showCountryList();
    const userDataString = localStorage.getItem('userData');
    const userData = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      const selectedCompany = userData?.SELECTED_COMPANY;
      if (selectedCompany?.COMPANY_ID) {
        this.selectedCompanyId = selectedCompany.COMPANY_ID;
        this.companyList = [selectedCompany]; // Show only selected company
        this.getGroupDropDown();
        this.showStores();
      }

      const firstFinYear = userData.FINANCIAL_YEARS?.[0];
      if (firstFinYear?.FIN_ID) {
        this.creditFormData.FIN_ID = firstFinYear.FIN_ID;
      }
    }

    this.get_Country_Dropdown_List();
    this.getCountryListWithFlag();
    this.showCountry();

    if (this.storeData && Object.keys(this.storeData).length > 0) {
      this.newStores = { ...this.storeData }; // copy data
    }
  }

  showCountryList() {
    this.service.getCountryDataAPi().subscribe((response) => {
      this.Country = response;
    });
  }

  get_Country_Dropdown_List() {
    this.service.getCountryWithFlags().subscribe((response: any) => {
      this.Country = response;
    });
  }

  submitForm() {
    const validationResult = this.dxForm?.instance?.validate();

    if (!validationResult?.isValid) {
      return; //  STOP if validation fails
    }

    const payload = {
      ...this.getNewStoresData(),
      DEPT_IDS: this.selectedDepartments,
    };

    this.formSubmit.emit(payload);
  }

  showCountry() {
    this.service.getCountryData().subscribe((response) => {
      this.CountryDropdownData = response;
    });
  }

  getGroupDropDown() {
    // check this
    const payload = {
      NAME: 'DEPARTMENTS',
      COMPANY_ID: this.selectedCompanyId,
    };

    this.service.getDropdownData(payload).subscribe((res: any) => {
      this.departments = res;
    });
  }

  onCountrySelected(e: any) {
    this.newStores.COUNTRY_ID = e.value;

    // find selected country from countryCodes (with CODE like +91, +971)
    const selectedCountry = this.countryCodes.find(
      (c: any) => c.ID === e.value,
    );

    if (selectedCountry) {
      // THIS is the important line
      this.countryCodePhone = selectedCountry.CODE;

      // optional: trigger phone validation length API
      this.onCountrycodeChangePhone({ value: selectedCountry.CODE });
    }

    // load states
    this.getStateDropDown();
  }

  onSelectionChanged(event: any): void {
    // Extract selected rows from the event
    const selectedRows = event.selectedRowsData;

    // Debug log to verify the binding
  }

  onStateValue(event: any) {
    this.selectedStateId = event.value;
    this.StateId = event.value;
    // this.getStateDropDown();
  }

  getStateDropDown() {
    const countryId = this.newStores.COUNTRY_ID;
    this.service
      .get_State_Dropdown_Api('STATE_NAME', countryId)
      .subscribe((response: any) => {
        this.State = response;
      });
  }

  onCountrySelectionChanged(event: any) {
    const selectedCountry = this.CountryDropdownData.find(
      (country) => country.ID === event.value,
    );
    if (selectedCountry) {
      this.countryCode = selectedCountry.CODE;
    }
  }

  onSubmit() {
    this.formSubmit.emit(this.newStores);
  }

  getCountryListWithFlag() {
    this.service.getCountryWithFlag().subscribe((response: any) => {
      this.countries = response;
    });
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

  onCountrycodeChangePhone(e: any) {
    const payload = {
      COUNTRY_CODE: e.value,
    };
    this.service.get_mobile_no_length(payload).subscribe((res: any) => {
      this.Phone_limit = Number(res.Data[0].MOBILE_DIGITS);
    });
  }

  validatePhoneLength = (e: any): boolean => {
    const value = (e.value || '').trim();

    if (!this.Phone_limit) return false;

    return value.length === this.Phone_limit;
  };

  countryDisplay(item: any) {
    if (!item) return '';
    return `${item.CODE}`;
  }

  clearValidation() {
    this.dxForm?.instance?.resetValues(); // optional
    this.dxForm?.instance?.resetValidation();
  }

  showStores() {
    const payload = {
      COMPANY_ID: this.selectedCompanyId,
    };

    this.service.getStoresData(payload).subscribe({
      next: (response: any[]) => {
        this.storesArray = response || [];
        console.log(this.storesArray, 'this.storesArray');
      },
      error: () => {
        this.storesArray = [];
      },
    });
  }

  validateStoreCode = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.storesArray?.length) return true;

    const currentId = this.newStores?.ID || 0;

    return !this.storesArray.some((item: any) => {
      const code = (item.CODE || '').trim().toLowerCase();

      return code === value && item.ID !== currentId;
    });
  };

  validateStoreName = (e: any): boolean => {
    const value = (e.value || '').trim().toLowerCase();

    if (!value || !this.storesArray?.length) return true;

    const currentId = this.newStores?.ID || 0;

    return !this.storesArray.some((item: any) => {
      const code = (item.STORE_NAME || '').trim().toLowerCase();

      return code === value && item.ID !== currentId;
    });
  };
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
    DxValidatorModule,
    DxTagBoxModule,
    DxCheckBoxModule,
  ],
  declarations: [StoresFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [StoresFormComponent],
})
export class StoresFormModule {}
