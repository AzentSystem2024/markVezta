import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgModule, NgZone, ViewChild } from '@angular/core';
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
  Datasource: any[];
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

  constructor(private fb: FormBuilder, private dataservice: DataService,private router : Router,private ngZone: NgZone, private cdr: ChangeDetectorRef) {
    this.formsource = this.fb.group({
      //  ID :[null, Validators.required],
      CompanyType: ['', Validators.required],
      CompanyTypeName: ['', Validators.required],
      Code: ['', Validators.required],
      CompanyName: ['', Validators.required],
      FirstAddress: ['', Validators.required],
      SecondAddress: ['', Validators.required],
      ThirdAddress: ['', Validators.required],
      ContactName: ['', Validators.required],
      Mobile: ['', Validators.required],
      Telephone: ['', Validators.required],
      WhatsApp: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Inactive: [false],
    });
    this.get_Company_List();
    this.get_Company_Dropdown_List();
  }

  getStatusFlagClass(IS_INACTIVE: boolean): string {
    return IS_INACTIVE ? 'flag-red' : 'flag-green';
  }

      addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
  
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.addCompany());
    },
    
    elementAttr: { class: 'add-button' },    
  };


   //=================================refresh=============================
   refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };

      refreshGrid(){
          if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh();
       // Or reload data from API if needed
       this.get_Company_List()
      
    }
       
    }
  
        toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
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
  .find(menu => menu.Path === '/company');

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

  onAddPopupClose() {
    this.selectedCompanyType = null;
  }
  addCompany() {
    this.addPopup = true;

    setTimeout(() => {
      this.formValidationGroup?.instance?.reset();

      this.formsource.reset({
        Inactive: '',
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
    this.dataservice.get_CompanyList_Api().subscribe((res: any) => {
      console.log(res);
      if (res) {
        this.Datasource = res.Data.map((item: any, index: any) => ({
          ...item,
          SlNo: index + 1, // Assign serial number
        }));
      }
    });
  }

  addData() {

    
    const validationResult = this.formValidationGroup?.instance?.validate();
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

    // Log to debug
    console.log(
      Company_code,
      Company_name,
      First_address,
      Second_address,
      Third_address,
      Contact_name,
      Phone_no,
      Mobile_no,
      Email,
      WhatsApp_no,
      Company_type
    );

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
    };

    const isDuplicate = this.Datasource?.some((data: any) => {
      const existingCode = data.COMPANY_CODE?.toString().trim().toLowerCase();
      const existingName = data.COMPANY_NAME?.toString().trim().toLowerCase();
      return existingCode === Company_code || existingName === Company_name;
    });

    if (isDuplicate) {
      notify(
        {
          message: 'Data already exists',
          position: { at: 'top right', my: 'top right' },
          displayTime: 1000,
        },
        'error'
      );
      return;
    }

    // Only proceed if key fields are filled (optional check)
    if (Company_code && Company_name && Company_type) {
      this.dataservice.Insert_CompanyList_Api(payload).subscribe((res: any) => {
        notify(
          {
            message: 'Data successfully added',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success'
        );
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
          'success'
        );

        this.formsource.reset();
        this.get_Company_List();
        this.editPopup = false;
      });
    }
  }

  delete_Data(event: any) {
    const Id = event.data?.ID;
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
