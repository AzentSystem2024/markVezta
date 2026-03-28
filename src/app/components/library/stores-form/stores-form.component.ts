import {
  Component,
  NgModule,
  enableProdMode,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormTextboxModule } from '../../utils/form-textbox/form-textbox.component';
import { DxValidatorModule } from 'devextreme-angular';

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

  @Output() formSubmit = new EventEmitter<any>();
  CountryDropdownData: any[] = [];
  GroupDropdownData: any[] = [];
  StateDropdownData: any[] = [];
  countryCode: string = '971';
  formStoresData = {
    CODE: '',
    STORE_NAME: '',
    IS_PRODUCTION: false,
    ADDRESS1: '',
    ADDRESS2: '',
    ADDRESS3: '',
    ZIP_CODE: '',
    STATE_ID: '',
    CITY: '',
    COUNTRY_ID: '',
    IS_DEFAULT_STORE: false,
    PHONE: '',
    EMAIL: '',
    VAT_REGNO: '',
    GROUP_ID: 0,
    STORE_NO: '0',
    IS_ACTIVE: false,
    COMPANY_ID: 0,
  };
  countryList: any;
  countries: any[];
  selectedCountryId: any;
  Phone_limit: number;
  countryCodes: any;
  countryCodePhone: any;
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
    // EDIT MODE
    if (
      changes['storeData'] &&
      this.storeData &&
      Object.keys(this.storeData).length
    ) {
      const phoneNo = this.storeData.PHONE;
      const [countryCodePhone, phonenumber] = phoneNo.split('-');
      this.countryCodePhone = countryCodePhone;

      // this.onCountrycodeChangePhone({ value: this.countryCodePhone });
      this.newStores = {
        ...this.formStoresData,
        ...this.storeData,
      };
      this.newStores.PHONE = phonenumber;
    }

    // ADD MODE → ALWAYS set companyId when received
    if (changes['companyId'] && this.companyId) {
      this.newStores.COMPANY_ID = this.companyId;
    }
  }

  resetForm() {
    this.newStores = {
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
  submitForm() {
    this.formSubmit.emit(this.getNewStoresData());
  }
  showCountry() {
    this.service.getCountryData().subscribe((response) => {
      this.CountryDropdownData = response;
    });
  }
  getGroupDropDown() {
    const dropdowngroup = 'STOREGROUP';
    this.service.getDropdownData(dropdowngroup).subscribe((data: any) => {
      this.GroupDropdownData = data;
    });
  }

  onCountrySelected(e: any) {
    this.selectedCountryId = e.value;
    this.newStores.COUNTRY_ID = e.value;
    this.getStateDropDown();
  }

  getStateDropDown() {
    const payload = {
      NAME: 'STATE_NAME',
      COUNTRY_ID: this.selectedCountryId,
    };

    this.service.getStateDropdownData(payload).subscribe((data: any) => {
      this.StateDropdownData = data;
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
  ngOnInit(): void {
    // this.countryService.getCountryList().subscribe((data) => {
    //   this.countries = data;
    // });
    this.getCountryListWithFlag();
    this.showCountry();
    this.getGroupDropDown();
    if (this.storeData && Object.keys(this.storeData).length > 0) {
      this.newStores = { ...this.storeData }; // copy data
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
  onCountrycodeChangePhone(e: any) {
    console.log('call this functin=================');
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
  ],
  declarations: [StoresFormComponent],
  exports: [StoresFormComponent],
})
export class StoresFormModule {}
