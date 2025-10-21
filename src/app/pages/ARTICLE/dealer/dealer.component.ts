import { CommonModule } from '@angular/common';
import { Component, NgModule, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxFormModule,
  DxLoadIndicatorModule,
  DxLoadPanelModule,
  DxNumberBoxComponent,
  DxNumberBoxModule,
  DxPopupModule,
  DxSelectBoxComponent,
  DxSelectBoxModule,
  DxTabPanelModule,
  DxTextBoxComponent,
  DxTextBoxModule,
  DxTreeListModule,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxValidatorModule,
} from 'devextreme-angular';
import {
  DxDataGridComponent,
  DxDataGridModule,
} from 'devextreme-angular/ui/data-grid';
import notify from 'devextreme/ui/notify';
// import { log } from 'node:console';

import { FormPopupModule } from 'src/app/components';
import { DepartmentFormModule } from 'src/app/components/library/department-form/department-form.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-dealer',
  templateUrl: './dealer.component.html',
  styleUrls: ['./dealer.component.scss'],
})
export class DealerComponent {
  passwordMode: 'password' | 'text' = 'password';
  Datasource: any[];
  showFilterRow: boolean = true;
  currentFilter: string = 'auto';
  selectedData: any;
  formsource: any;
  districtformsource :any;
  addPopup: boolean = false;
  editPopup: boolean = false;
  newPopupDistrict: boolean = false;
  newPopupCity: boolean = false;
  DealerType = [
    { ID: 0, Name: 'Dealer' },
    { ID: 1, Name: 'SubDealer' },
  ];
  SelectedDealer: any;
  CountryId: any;
  StateId: any;
  DistrictID: any;
  selectedCountryId: any[] = [];
  selectedStateId: any[] = [];
  selectedDistrictId: any[] = [];
  selectedDistributorId: any[] = [];
  selectedWarehouseId: any[] = [];
  selectedZoneId: any[] = [];
  selectedTabIndex = 0;
  isEditPopupLoading: boolean = false;

  @ViewChild('formValidationGroup')
  formValidationGroup: DxValidationGroupComponent;
  @ViewChild('newformValidationGroup')
  newformValidationGroup: DxValidationGroupComponent;
  @ViewChild('dealerTypeBoxRef', { static: false })
  dealerTypeBoxRef!: DxSelectBoxComponent;
  @ViewChild('dealerCodeBoxRef', { static: false })
  dealerCodeBoxRef!: DxTextBoxComponent;
  @ViewChild('dealerNameBoxRef', { static: false })
  dealerNameBoxRef!: DxTextBoxComponent;
  @ViewChild('contactNameBoxRef', { static: false })
  contactNameBoxRef!: DxTextBoxComponent;
  @ViewChild('addressBoxRef', { static: false })
  addressBoxRef!: DxTextBoxComponent;
  @ViewChild('mobileBoxRef', { static: false })
  mobileBoxRef!: DxTextBoxComponent;
  @ViewChild('telephoneBoxRef', { static: false })
  telephoneBoxRef!: DxTextBoxComponent;
  @ViewChild('countryBoxRef', { static: false })
  countryBoxRef!: DxSelectBoxComponent;
  @ViewChild('stateBoxRef', { static: false })
  stateBoxRef!: DxSelectBoxComponent;
  @ViewChild('districtBoxRef', { static: false })
  districtBoxRef!: DxSelectBoxComponent;
  @ViewChild('cityBoxRef', { static: false })
  cityBoxRef!: DxSelectBoxComponent;
  @ViewChild('whatsAppBoxRef', { static: false })
  whatsAppBoxRef!: DxTextBoxComponent;
  @ViewChild('faxBoxRef', { static: false })
  faxBoxRef!: DxTextBoxComponent;
  @ViewChild('emailBoxRef', { static: false })
  emailBoxRef!: DxTextBoxComponent;
  @ViewChild('salesmanEmailBoxRef', { static: false })
  salesmanEmailBoxRef!: DxTextBoxComponent;
  @ViewChild('warehouseBoxRef', { static: false })
  warehouseBoxRef!: DxSelectBoxComponent;
  @ViewChild('zoneBoxRef', { static: false })
  zoneBoxRef!: DxSelectBoxComponent;
  @ViewChild('userNameBoxRef', { static: false })
  userNameBoxRef!: DxTextBoxComponent;
  @ViewChild('passwordBoxRef', { static: false })
  passwordBoxRef!: DxTextBoxComponent;
  @ViewChild('creditLimitBoxRef', { static: false })
  creditLimitBoxRef!: DxNumberBoxComponent;
  @ViewChild('creditDaysBoxRef', { static: false })
  creditDaysBoxRef!: DxNumberBoxComponent;
  @ViewChild('discountBoxRef', { static: false })
  discountBoxRef!: DxNumberBoxComponent;
  @ViewChild('locationBoxRef', { static: false })
  locationBoxRef!: DxTextBoxComponent;
  @ViewChild('addressRef', { static: false })
  addressRef!: DxTextBoxComponent;
  @ViewChild('mobileRef', { static: false })
  mobileRef!: DxTextBoxComponent;
  @ViewChild('telephoneRef', { static: false })
  telephoneRef!: DxTextBoxComponent;
  @ViewChild('dealerGrid') dealerGrid: DxDataGridComponent;
  Country: any[] = [];
  State: any;
  District: any;
  City: any;
  Distributor: any;
  DistributorName: any;
  Warehouse: any;
  Zone: any;
  DistributorId: any;
  WarehouseId: any;
  ZoneId: any;
  countries: any;
  editingRowData: any = {};
  ID: any;
  distric_id_value: any;
  city_id_value: any;
  mobileError: string;
  distributerid: any;
  emailError: any;
  country: any;
  canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;

  constructor(private fb: FormBuilder, private dataservice: DataService,private router : Router) {
    dataservice.getCountryWithFlags().subscribe((data) => {
      this.countries = data;
      console.log(this.countries, 'countries');
    });
     dataservice.getCountryData().subscribe((response) => {
      this.country = response;
    });
    this.formsource = this.fb.group({
      ID: [null, Validators.required],
      LocationID: ['', Validators.required],
      DealerType: ['', Validators.required],
      DistributorName: ['', Validators.required],
      Code: ['', Validators.required],
      ContactName: ['', Validators.required],
      DistributorID: [null, Validators.required],
      ParentID: ['', Validators.required],
      Address: ['', Validators.required],
      Mobile: ['', Validators.required],
      Telephone: ['', Validators.required],
      Country: ['', Validators.required],
      State: ['', Validators.required],
      District: [null, Validators.required],
      DistrictID: [null, Validators.required],
      City: [null, Validators.required],
      CityID: [null, Validators.required],
      WhatsApp: ['', Validators.required],
      Fax: ['', Validators.required],
      StdCode: [null, Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      SalesmanEmail: ['', [Validators.required, Validators.email]],
      Warehouse: ['', Validators.required],
      Zone: ['', Validators.required],
      UserName: ['', Validators.required],
      Password: ['', Validators.required],
      CreditLimit: [0, Validators.required],
      CreditDays: [0, Validators.required],
      Discount: [0, Validators.required],
      Location: ['', Validators.required],
      AddressDelivery: ['', Validators.required],
      MobileDelivery: ['', Validators.required],
      TelephoneDelivery: ['', Validators.required],
      Active: [false],
      Inactive: [false],
    });

    this.districtformsource = this.fb.group({
      District: [null, Validators.required],
      DistrictID: [null, Validators.required],
});

    this.get_Country_Dropdown_List();
    this.get_State_Dropdown_List();
    this.get_District_Dropdown_List();
    this.get_City_Dropdown_List();
    this.get_Distributor_Dropdown_List();
    this.get_Warehouse_Dropdown_List();
    this.get_Zone_Dropdown_List();

    this.get_Dealer_List();
  }

  togglePasswordVisibility = () => {
    this.passwordMode = this.passwordMode === 'password' ? 'text' : 'password';
  };

     ngOnInit(){
const currentUrl = this.router.url;
  console.log('Current URL:', currentUrl);
   const menuResponse = JSON.parse(sessionStorage.getItem('savedUserData') || '{}');
  console.log('Parsed ObjectData:', menuResponse);

  const menuGroups = menuResponse.MenuGroups || [];
  console.log('MenuGroups:', menuGroups);
const packingRights = menuGroups
  .flatMap(group => group.Menus)
  .find(menu => menu.Path === '/dealer');

if (packingRights) {
  this.canAdd = packingRights.CanAdd;
  this.canEdit = packingRights.CanEdit;
  this.canDelete = packingRights.CanDelete;
    this.canPrint = packingRights.CanEdit;
  this.canView = packingRights.canView;
   this.canApprove = packingRights.canApprove;
}

console.log('packingRights',packingRights);
console.log(  this.canAdd ,  this.canEdit ,  this.canDelete );

  }

  statusCellTemplate = (cellElement: any, cellInfo: any) => {
    const status = cellInfo.value; // Get the value from `calculateCellValue`

    // Determine background color and display text based on the status
    const color = status === 'Inactive' ? 'red' : 'green';
    const text = status; // Use the calculated value ("Inactive" or "Active")

    // Apply the dynamic styles and content
    cellElement.innerHTML = `
      <span style="
        background-color: ${color};
        color: white;
        padding: 2px 3px;
        border-radius: 5px;
        display: inline-block;
        text-align: center;
        min-width: 60px;"
      >
        ${text}
      </span>`;
  };

  onExporting(event: any) {
    console.log('Exporting event', event);

    const fileName = 'file-name';
    this.dataservice.exportDataGrid(event, fileName);
  }

  getDealerTypeName = (rowData: any): string => {
    return rowData.PARENT_ID === 0 ? 'Dealer' : 'SubDealer';
  };

  getStatusFlagClass(IS_INACTIVE: boolean): string {
    return IS_INACTIVE ? 'flag-red' : 'flag-green';
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.dealerTypeBoxRef?.instance?.focus();
    }, 0);
  }

  onKeyDownHandler(event: any, nextField: string): void {
    if (event.event.key === 'Enter') {
      const nextComponent = (this as any)[nextField];

      if (nextComponent?.instance?.focus) {
        nextComponent.instance.focus(); // Focus the next field

        // If it's a select box, open the dropdown
        if (nextComponent.instance.open) {
          // Give it a slight delay to allow focus to finish first
          setTimeout(() => {
            nextComponent.instance.open();
          }, 50);
        }
      }
    }
  }

  closePop() {
    this.addPopup = false;
    this.editPopup = false;
    this.newPopupDistrict = false;
    this.newPopupCity = false;
    this.formsource.reset();
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });
  }

  addDealers() {
    this.addPopup = true;

    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });
    this.formsource.reset({
      Inactive: '',
    });
  }

  DistrictClosePopup() {
    this.newPopupDistrict = false;
    // setTimeout(() => {
    //   this.formValidationGroup?.instance?.reset();
    // });
  }
  CityClosePopup() {
    this.newPopupCity = false;
    // setTimeout(() => {
    //   this.formValidationGroup?.instance?.reset();
    // });
  }

  onAddPopupClose() {}

  onEditingStart(event: any) {
    event.cancel = true;
    this.Select_Dealer(event);
    this.editPopup = true;
    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });
  }

  addNewCity() {
    this.newPopupCity = true;
    // setTimeout(() => {
    //   this.formValidationGroup?.instance?.reset();
    // });
  }


  addNewDisctrict() {
    this.newPopupDistrict = true;
    setTimeout(() => {
      this.newformValidationGroup?.instance?.reset();
    });
  }

  validateMobile(event: any) {
    const mobileNumber = event.target.value; // Get input value
    const mobilePattern = /^[6-9]\d{9}$/; // Valid 10-digit number starting with 6-9

    if (!mobilePattern.test(mobileNumber)) {
      this.mobileError =
        'Please enter a valid 10-digit mobile number starting with 6-9';
    } else {
      this.mobileError = ''; // Clear error if valid
    }
  }

  validateEmail(event: any) {
    const email = event.target.value;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(email)) {
      this.emailError = 'Please enter a valid email address';
    } else {
      this.emailError = ''; // Clear error if valid
    }
  }


  CityData() {
    const validationResult = this.newformValidationGroup?.instance?.validate();
    const commenDetails = this.formsource.value;
    const payload = {
      COUNTRY_ID: Number(commenDetails.Country),
      STATE_ID: Number(commenDetails.State),
      DISTRICT_ID: Number(commenDetails.DistrictID) || 0,
      CITY_NAME: commenDetails.City?.toString().trim() || '',
      STD_CODE: Number(commenDetails.StdCode) || 0,
      // DISTRICT_NAME: commenDetails.District?.toString().trim() || "",
    };

    this.dataservice.Insert_NewCity_Api(payload).subscribe((res: any) => {
      notify(
        {
          message: 'Data succesfully added',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success'
      );
      this.newPopupCity = false;
      this.get_City_Dropdown_List();
    });
  }

  DisctrictData() {
    const validationResult = this.formValidationGroup?.instance?.validate();
   const districtName = this.districtformsource.get('District')?.value?.trim() || '';

 
  // const validationResult = this.formValidationGroup?.instance?.validate();
//  const commenDetails = this.formsource.value;


  const payload = {
    DISTRICT_NAME: districtName,
    COUNTRY_ID: Number(this.formsource.get('Country')?.value),
    STATE_ID: Number(this.formsource.get('State')?.value),
  };
    this.dataservice.Insert_NewDistrict_Api(payload).subscribe((res: any) => {
      notify(
        {
          message: 'Data successfully added',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success'
      );
      this.newPopupDistrict = false;
      this.get_District_Dropdown_List();
    });
  }

  onDealerTypeChange(event: any) {
    // console.log(event, 'event++++++++++');
    this.SelectedDealer = event.value;
    //  console.log(this.SelectedDealer, 'SelectedDealer++++++++++');
  }


  onDistributorValue(event: any) {
    this.selectedDistributorId = event.value;
    // this.DistributorId = event.value;
    this.get_Distributor_Dropdown_List();
    console.log(this.selectedDistributorId, 'selectedDistributorId++++++++++');
  }


  onWarehouseValue(event: any) {
    this.selectedWarehouseId = event.value;
    this.WarehouseId = event.value;
    this.get_Warehouse_Dropdown_List();
  }

  onZoneValue(event: any) {
    this.selectedZoneId = event.value;
    this.ZoneId = event.value;
    this.get_Zone_Dropdown_List();
  }

  onCountryValue(event: any) {
    this.selectedCountryId = event.value;
    this.CountryId = event.value;
    this.get_Country_Dropdown_List();
    this.get_State_Dropdown_List();
    // console.log(this.selectedCountryId, 'selectedCountryId++++++++++');
  }

  onStateValue(event: any) {
    this.selectedStateId = event.value;
    this.StateId = event.value;
    this.get_State_Dropdown_List();
    this.get_District_Dropdown_List();
    // console.log(this.selectedStateId, 'selectedStateId++++++++++');
  }

  onDistrictValue(event: any) {
    console.log(event, 'event');
    const selectedItem = event.component.option('selectedItem');
    const district = selectedItem?.DESCRIPTION;

    console.log('Selected District Name:', selectedItem?.DESCRIPTION);

    this.formsource.patchValue({
      District: district,
    });
    console.log(this.formsource.value);

    this.selectedDistrictId = event.value;
    this.DistrictID = event.value;
    this.get_District_Dropdown_List();
    this.get_City_Dropdown_List();
    // console.log(this.selectedDistrictId, 'selectedDistrictId++++++++++');
  }

  //==============CITY DROPDOWN VALUE CHANGE EVENT==
  onCityValueChanged(event: any) {
    console.log(event, 'event');
    const selectedItem = event.component.option('selectedItem');
    const city = selectedItem?.DESCRIPTION;

    console.log('Selected District Name:', selectedItem?.DESCRIPTION);

    this.formsource.patchValue({
      City: city,
    });
    console.log(this.formsource.value);
  }

  //===============get Dropdown List=======================
  get_Country_Dropdown_List() {
    this.dataservice.get_Country_Dropdown_Api().subscribe((response: any) => {
      // console.log(response, 'response++++++++++');
      this.Country = response;
    });
  }

  //===============get Dropdown List=======================
  get_State_Dropdown_List() {
    // console.log('function working');

    this.dataservice
      .get_State_Dropdown_Api(name, this.CountryId)
      .subscribe((response: any) => {
        // console.log(response, 'response++++++++++');
        this.State = response;
      });
  }

  //===============get Dropdown List=======================
  get_District_Dropdown_List() {
    // console.log('function working');

    this.dataservice
      .get_District_Dropdown_Api(name, this.StateId)
      .subscribe((response: any) => {
        this.District = response;
      });
  }

  //===============get Dropdown List=======================
  get_City_Dropdown_List() {
    this.dataservice
      .get_City_Dropdown_Api(name, this.DistrictID)
      .subscribe((response: any) => {
        // console.log(response, 'response++++++++++');
        this.City = response;
      });
  }

  //===============get Distributor Dropdown List=======================
  get_Distributor_Dropdown_List() {
    this.dataservice
      .get_Distributor_Dropdown_Api()
      .subscribe((response: any) => {
        this.Distributor = response;
      });
  }

  //===============get Dropdown List=======================
  get_Warehouse_Dropdown_List() {
    this.dataservice.get_Warehouse_Dropdown_Api().subscribe((response: any) => {
      this.Warehouse = response;
    });
  }

  //===============get Dropdown List=======================
  get_Zone_Dropdown_List() {
    this.dataservice.get_Zone_Dropdown_Api().subscribe((response: any) => {
      this.Zone = response;
    });
  }

   showCountry(){
     this.dataservice.getCountryData().subscribe(
      (response)=>{
            this.country=response;
            console.log(response);
      }
     )
  }

  //===================get data list========================
  get_Dealer_List() {
    // this.isLoading = true;
    this.dataservice.get_DealerList_Api().subscribe((res: any) => {
      if (res) {
        this.Datasource = res.Data.map((item: any, index: any) => ({
          ...item,
          SlNo: index + 1, // Assign serial number
        }));
      }
    });
  }

  addData() {
    console.log('working');
    // const validationResult = this.formValidationGroup?.instance?.validate();
    const commenDetails = this.formsource.value;
    const payload = {
      CODE: commenDetails.Code,
      distributor: commenDetails.DistributorName, // new field
      DISTRIBUTOR_NAME: commenDetails.DistributorName, // if still needed
      ADDRESS: commenDetails.Address,
      COUNTRY_ID: Number(commenDetails.Country),
      STATE_ID: Number(commenDetails.State),
      DISTRICT_ID: Number(commenDetails.DistrictID) || 0,
      CITY_ID: Number(commenDetails.CityID) || 0,
      // CITY_NAME: commenDetails.City,
      TELEPHONE: commenDetails.Telephone,
      FAX: commenDetails.Fax,
      MOBILE: commenDetails.Mobile,
      WHATSAPP_NO: commenDetails.WhatsApp,
      EMAIL: commenDetails.Email,
      IS_INACTIVE: false,
      SALESMAN_EMAIL: commenDetails.SalesmanEmail,
      WAREHOUSE_ID: Number(commenDetails.Warehouse),
      CONTACT_NAME: commenDetails.ContactName,
      DISC_PERCENT: Number(commenDetails.Discount),
      CREDIT_LIMIT: Number(commenDetails.CreditLimit),
      CREDIT_DAYS: Number(commenDetails.CreditDays),
      ZONE_ID: Number(commenDetails.Zone),
      LOGIN_NAME: commenDetails.UserName,
      LOGIN_PASSWORD: commenDetails.Password,
      PARENT_ID:
        Number(commenDetails.DistributorID) === 0
          ? 0
          : Number(commenDetails.DistributorID),
      LOCATIONS: [
        {
          ID: Number(commenDetails.LocationID),
          DISTRIBUTOR_ID: Number(commenDetails.DistributorID),
          LOCATION: commenDetails.Location,
          ADDRESS: commenDetails.AddressDelivery,
          MOBILE: commenDetails.MobileDelivery,
          TELEPHONE: commenDetails.TelephoneDelivery,
          IS_INACTIVE: !!commenDetails.Inactive, // ✅ ensures Boolean: true or false
        },
      ],
    };

    const distributorName = commenDetails.DistributorName?.trim().toLowerCase();
    const dealerCode = commenDetails.Code?.trim().toLowerCase();

    const isDuplicate = this.Datasource?.some((data: any) => {
      return (
        data.DISTRIBUTOR_NAME?.trim().toLowerCase() ===
        distributorName.toLowerCase()
      );
    });

    if (isDuplicate) {
      notify(
        {
          message: 'Distributor Name already exists.',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return; // Stop execution if duplicate found
    }

    // Check for duplicate dealer code
    const isDuplicateCode = this.Datasource?.some((data: any) => {
      return data.CODE?.trim().toLowerCase() === dealerCode;
    });

    if (isDuplicateCode) {
      notify(
        {
          message: 'Dealer Code already exists.',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    }

    if (this.formsource.invalid) {
      return; // Prevent submit
    }
    this.dataservice.Insert_Dealer_Api(payload).subscribe((res: any) => {
      notify(
        {
          message: 'Data succesfully added',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success'
      );

      this.addPopup = false;
      this.formsource.reset();
      this.editPopup = false;

      // this.dxFormInstance?.instance?.resetValidation();
      this.get_Dealer_List();
    });
  }

  Select_Dealer(event: any) {
    this.ID = event.data.ID

    this.dataservice.Select_Dealer_Api(this.ID).subscribe((response: any) => {
      // cons
      this.selectedData = response.Data;
      // this.SelectedDealer =this.selectedData.PARENT_ID

      
      this.distric_id_value = this.selectedData.DISTRICT_ID;
      this.SelectedDealer = this.selectedData?.PARENT_ID === 0 ? 0 : 1;
    this.distributerid = (this.selectedData.PARENT_ID);
        console.log(this.selectedDistributorId, 'selcteddistributorId');
      console.log(this.SelectedDealer, 'selecteddealer');
      this.city_id_value = this.selectedData.CITY_ID;
      this.formsource.patchValue({
        ID: this.selectedData.ID,
        //  SelectedDealer  :this.selectedData.PARENT_ID,
        Code: this.selectedData.CODE,

        DistributorName: this.selectedData.DISTRIBUTOR_NAME,
        ContactName: this.selectedData.CONTACT_NAME,
        Address: this.selectedData.ADDRESS,
        Mobile: this.selectedData.MOBILE,
        Telephone: this.selectedData.TELEPHONE,
        Country: this.selectedData.COUNTRY_ID,
        State: this.selectedData.STATE_ID,
        District: this.selectedData.DISTRICT_ID,
        City: this.selectedData.CITY_ID,
        WhatsApp: this.selectedData.WHATSAPP_NO,
        Fax: this.selectedData.FAX,
        Email: this.selectedData.EMAIL,
        SalesmanEmail: this.selectedData.SALESMAN_EMAIL,
        Warehouse: this.selectedData.WAREHOUSE_ID,
        Zone: this.selectedData.ZONE_ID,
        UserName: this.selectedData.LOGIN_NAME,
        Password: this.selectedData.LOGIN_PASSWORD,
        CreditLimit: this.selectedData.CREDIT_LIMIT,
        CreditDays: this.selectedData.CREDIT_DAYS,
        Discount: this.selectedData.DISC_PERCENT,
        Location: this.selectedData.LOCATIONS[0]?.LOCATION || '',
        LocationID: this.selectedData.LOCATIONS[0]?.ID || 0,
        DistributorID: this.selectedData.LOCATIONS[0]?.DISTRIBUTOR_ID || 0,
        AddressDelivery: this.selectedData.LOCATIONS[0]?.ADDRESS || '',
        MobileDelivery: this.selectedData.LOCATIONS[0]?.MOBILE || '',
        TelephoneDelivery: this.selectedData.LOCATIONS[0]?.TELEPHONE || '',
        Inactive: this.selectedData.IS_INACTIVE || false,
      });
      //  this.editPopup = true;
    });
  }

  editData() {
    const validationResult = this.formValidationGroup?.instance?.validate();
    const commenDetails = this.formsource.value;
    const payload = {
      ID: this.ID,
      CODE: commenDetails.Code,
      distributor: commenDetails.DistributorName, // new field
      DISTRIBUTOR_NAME: commenDetails.DistributorName, // if still needed
      ADDRESS: commenDetails.Address,
      COUNTRY_ID: Number(commenDetails.Country),
      STATE_ID: Number(commenDetails.State),
      DISTRICT_ID: Number(this.distric_id_value) || 0,

      CITY_ID: Number(this.city_id_value) || 0,
      // CITY_NAME: commenDetails.City,

      TELEPHONE: commenDetails.Telephone,
      FAX: commenDetails.Fax,
      MOBILE: commenDetails.Mobile,
      WHATSAPP_NO: commenDetails.WhatsApp,
      EMAIL: commenDetails.Email,
      IS_INACTIVE: commenDetails.Inactive,
      SALESMAN_EMAIL: commenDetails.SalesmanEmail,
      WAREHOUSE_ID: Number(commenDetails.Warehouse),
      CONTACT_NAME: commenDetails.ContactName,
      DISC_PERCENT: Number(commenDetails.Discount),
      CREDIT_LIMIT: Number(commenDetails.CreditLimit),
      CREDIT_DAYS: Number(commenDetails.CreditDays),
      ZONE_ID: Number(commenDetails.Zone),
      LOGIN_NAME: commenDetails.UserName,
      LOGIN_PASSWORD: commenDetails.Password,
      PARENT_ID: this.distributerid,
      LOCATIONS: [
        {
          DISTRIBUTOR_ID: Number(commenDetails.DistributorID),
          LOCATION: commenDetails.Location,
          ADDRESS: commenDetails.AddressDelivery,
          MOBILE: commenDetails.MobileDelivery,
          TELEPHONE: commenDetails.TelephoneDelivery,
          IS_INACTIVE: !!commenDetails.Inactive, // ✅ ensures Boolean: true or false
        },
      ],
    };

    const distributorName = commenDetails.DistributorName?.trim().toLowerCase();
    const dealerCode = commenDetails.Code?.trim().toLowerCase();

    const isDuplicate = this.Datasource?.some((data: any) => {
      return (
        data.DISTRIBUTOR_NAME?.trim().toLowerCase() ===
          distributorName.toLowerCase() && data.ID !== this.ID
      );
    });

    if (isDuplicate) {
      notify(
        {
          message: 'Distributor Name already exists.',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return; // Stop execution if duplicate found
    }

    // Check for duplicate dealer code
    const isDuplicateCode = this.Datasource?.some((data: any) => {
      return (
        data.CODE?.trim().toLowerCase() === dealerCode && data.ID !== this.ID
      );
    });

    if (isDuplicateCode) {
      notify(
        {
          message: 'Dealer Code already exists.',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    }

    this.dataservice.Update_Dealer_Api(payload).subscribe((res: any) => {
      notify(
        {
          message: 'Data succesfully added',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success'
      );

      this.addPopup = false;
      this.formsource.reset();
      this.editPopup = false;

      // this.dxFormInstance?.instance?.resetValidation();
      this.get_Dealer_List();
    });
  }

  delete_Data(event: any) {
    const Id = event.data.ID;
    this.dataservice.Delete_Dealer_Api(Id).subscribe((response: any) => {});
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxButtonModule,
    FormPopupModule,
    DxPopupModule,
    CommonModule,
    DepartmentFormModule,
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
  declarations: [DealerComponent],
})
export class DealerModule {}
