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
    stylingMode: 'contained',
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
    console.log(sessionData, '=================session data==========');
    this.selected_Company_id = sessionData.SELECTED_COMPANY.COMPANY_ID;
    console.log(
      this.selected_Company_id,
      '============selected_Company_id==============',
    );
  }

  ngOnInit() {
    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}',
    );
    console.log('Parsed ObjectData:', menuResponse);

    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/company');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }
    this.sesstion_Details();
    this.getCompanyList();
    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
  }

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
      console.log(response, 'response++++++++++');
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

            this.companyList = data;              // ✅ array cache
            this.companyRowCount = data.length;

            resolve(data);                        // 🔑 grid loader stops
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
      console.log('Validation failed');
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
      this.dataservice.Insert_CompanyList_Api(payload).subscribe((res: any) => {
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
      });
    }
  }

  selectData(event: any) {
    console.log('Select Event:', event); // Add this for debugging

    const ID = event?.data?.ID; // use lowercase `data`, not `Data`

    if (ID !== undefined) {
      this.dataservice.Select_CompanyList_Api(ID).subscribe((response: any) => {
        console.log(response, 'select Api');
        this.selectedData = response;
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

    console.log(STATE_ID, 'stateID');

    // const Company_type = this.editingRowData.COMPANY_TYPE;
    const Is_Inactive = this.editingRowData.IS_INACTIVE;

    console.log(Id, Company_code, Company_name);

    const payload = {
      ID: Id,
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
      IS_INACTIVE: Is_Inactive,
      STATE_ID: STATE_ID,
      PAN_NO: PAN,
      GST_NO: GSTNo,
      CIN: CIN,
    };

    //   const isDuplicate = this.Datasource?.some((data: any) => {
    //     const existingId = data.ID;

    //   const existingCode = data.COMPANY_CODE?.toString().trim().toLowerCase();
    //   const existingName = data.COMPANY_NAME?.toString().trim().toLowerCase();
    //   return existingCode === Company_code || existingName === Company_name &&
    //     existingId !== Id;
    // });

    // if (isDuplicate) {
    //   notify(
    //     {
    //       message: 'Data already exists',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 1000,
    //     },
    //     'error'
    //   );
    //   return;
    // }

    if (Company_code && Company_name && Company_type) {
      this.dataservice.Update_CompanyList_Api(payload).subscribe((res: any) => {
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
      });
    }
  }

  delete_Data(event: any) {
    console.log(event, 'delete event');
    const Id = event.data?.ID;
    console.log('Deleting ID:', Id);
    this.dataservice.Delete_CompanyList_Api(Id).subscribe({
      next: (response) => {
        console.log('Delete Success:', response);
        // You can refresh your list or show notify message here
      },
      error: (error) => {
        console.error('Delete Error:', error);
      },
    });
  }

  //========================Export data ==========================
  onExporting(event: any) {
    const fileName = 'company';
    this.dataservice.exportDataGrid(event, fileName);
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
