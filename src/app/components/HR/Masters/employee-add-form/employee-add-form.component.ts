import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
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
  DxFileUploaderComponent,
  DxValidationGroupComponent,
  DxValidationGroupModule,
  DxNumberBoxModule,
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { EmployeeComponent } from '../employee/employee.component';
import { DataService } from 'src/app/services';
import notify from 'devextreme/ui/notify';
import dxValidationGroup from 'devextreme/ui/validation_group';

@Component({
  selector: 'app-employee-add-form',
  templateUrl: './employee-add-form.component.html',
  styleUrls: ['./employee-add-form.component.scss'],
})
export class EmployeeAddFormComponent {
  @ViewChild('employeeFormGroup', { static: false })
  employeeFormGroup: DxValidationGroupComponent;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('fileUploader') fileUploader!: ElementRef;
  @Input() isOpen: boolean = false;
  @Output() formClosed = new EventEmitter<boolean>();
  selectedTabIndex = 0;
  imageSource: string | null = null;
  textVisible = true;
  imageUploaded = false;
  mobileError: string = '';
  emailError: string = '';
  allowedFileExtensions = ['.jpg', '.png', '.jpeg'];
  employeeFormData: any = {
    EMP_CODE: '',
    EMP_NAME: '',
    DOB: null,
    ADDRESS1: '',
    ADDRESS2: '',
    ADDRESS3: '',
    CITY: '',
    STATE_ID: 0,
    PF_AC_NO:'',
    ESI_NO:'',
    ESI_PERCENT:0,
    COUNTRY_ID:0,
    MOBILE: '',
    EMAIL: '',
    IS_MALE: true,
    DEPT_ID: 0,
    DESG_ID: 0,
    DOJ: null,
    BANK_NAME: '',
    BANK_CODE: '',
    BANK_AC_NO: '',
    PP_NO: '',
    PP_EXPIRY: null,
    IQAMA_NO: '',
    IQAMA_EXPIRY: '',
    VISA_NO: '',
    VISA_EXPIRY: null,
    LICENSE_NO: '',
    LICENSE_EXPIRY: null,
    EMP_STATUS: 0,
    IS_SALESMAN: false,
    IMAGE_NAME: '',
    WORK_PERMIT_NO: '',
    WORK_PERMIT_EXPIRY: null,
    IBAN_NO: '',
    DAMAN_NO: '',
    DAMAN_CATEGORY: '',
    LEAVE_CREDIT: 0,
    LESS_SERVICE_DAYS: '',
    HOLD_SALARY: '',
    MOL_NUMBER: '',
    LAST_REJOIN_DATE: null,
    INCENTIVE_PERCENT: '',
    STORE_ID: '',
    Company_Id: 0,
    DEPT_NAME: '',
    DESG_NAME: '',
    STATE_NAME: '',
    STORE_NAME: '',
    IS_INACTIVE: false,
    PAYMENT_TYPE: 0,
    LEAVE_DAY_BALANCE: 0,
    DAYS_DEDUCTED: 0,
  
  };
  imageUrl: string | ArrayBuffer | null = null;
  uploadedFile: any;
  isSaving: boolean = false;
  damanCardCategories = ['Basic', 'Enhanced', 'Premier'];

  attachments: any[] = [];
  selectedFiles: File[] = [];
  lastRejoinDate: any;
  leaveDaysBalance: any;
  daysDeducted: any;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  displayMode: any = 'full';
  showPageSizeSelector = true;
  IsAttachmentPopupVisible: boolean = false;
  showPopup: boolean = false; // Controls popup visibility
  uploadedFileName: string = ''; // Stores uploaded file name
  fileDetails: { file: File | null; remarks: string } = {
    file: null,
    remarks: '',
  };
  countries: any;
  country: any;
  salaryHead: any;
  salaryDetails: any;
  paymentType: any;
  departments: any;
  designations: any;
  states: any;
  eighteenYearsAgo: Date;
  employeeList: any;
  COMPANY_ID: any;
  constructor(public dataservice: DataService) {
        dataservice.getCountryWithFlags().subscribe((data) => {
      this.countries = data;
      console.log(this.countries,"COUNTRY;;;;;;;;;;")
    });
    // dataservice.get_Country_Dropdown_Api().subscribe((data) => {
    //   this.countries = data;
    // });
    this.dataservice.getDropdownData('SALARY_HEAD').subscribe((data) => {
      this.salaryHead = data.map((item: any) => ({
        ...item,
        HEAD_ID: item.ID,
        amount: null,
      }));
    });
    dataservice.getDropdownData('EMPLOYEE DEPARTMENT').subscribe((data) => {
      this.departments = data;
    });
    dataservice.getDropdownData('DESIGNATION').subscribe((data) => {
      this.designations = data;
    });
    dataservice.getDropdownData('SALARY PAYMENT TYPE').subscribe((data) => {
      this.paymentType = data;
    });
    dataservice.getDropdownData('STATE').subscribe((data) => {
      this.states = data;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const today = new Date();
    this.eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  }

  ngOnInit() {
    this.getEmployeeList();
       const  SELECTED_COMPANY=JSON.parse(sessionStorage.getItem('savedUserData'))
    const companyid=SELECTED_COMPANY.SELECTED_COMPANY

    console.log(SELECTED_COMPANY)
    this.COMPANY_ID=companyid.COMPANY_ID
    console.log(companyid);
  }

  onImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        const base64WithPrefix = reader.result as string;

        this.imageUrl = base64WithPrefix; // for preview
        this.employeeFormData.IMAGE_NAME = base64WithPrefix;
      };

      reader.readAsDataURL(file);
    }
  }

  closeForm() {
    this.formClosed.emit();
  }

  onDropZoneClick() {
    this.fileInput.nativeElement.click();
  }

  onFileInputChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageSource = e.target.result;
        this.textVisible = false;
        this.imageUploaded = true;
      };
      reader.readAsDataURL(file);
    }
  }

  openModal(event: Event) {
    event.stopPropagation();
    const modal = document.getElementById('imageModal')!;
    const modalImage = document.getElementById(
      'modalImage'
    ) as HTMLImageElement;
    modal.style.display = 'block';
    modalImage.src = this.imageSource!;
  }
  closeModal() {
    document.getElementById('imageModal')!.style.display = 'none';
  }

  clearImage(event: MouseEvent): void {
    event.stopPropagation();
    this.imageUrl = null;
    this.employeeFormData.IMAGE_NAME = '';
  }

  validateMobile(event: any) {
    const mobileNumber = event.target.value;
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

  onFileUploaded(event: any) {
    const file = event.file;
    this.attachments.push({ fileName: file.name, remarks: '' });
  }

  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  triggerFileUpload() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  openAttachmentPopup() {
    console.log('Opening attachment popup...'); // Debugging log
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.uploadedFileName = '';
    this.fileDetails = { file: null, remarks: '' };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFileName = file.name; // Show selected file name
      this.fileDetails.file = file;
    }
  }

  getEmployeeList() {
    const company_id=1
     const payload={
      "CompanyId":company_id
    }
    this.dataservice.employeeList(payload).subscribe((response: any) => {
      this.employeeList = response.reverse();
    });
  }

  saveFileDetails(): void {
    if (this.fileDetails.file && this.fileDetails.remarks) {
      this.attachments.push({
        fileName: this.fileDetails.file.name,
        remarks: this.fileDetails.remarks,
        file: this.fileDetails.file, // Optional: for download/view later
      });

      // Reset
      this.fileDetails = { file: null, remarks: '' };
      this.uploadedFileName = '';
      this.showPopup = false;
    } else {
      alert('Please upload a file and enter remarks.');
    }
  }

  onDepartmentChange(e: any) {
    const selectedDept = this.departments.find((dept) => dept.ID === e.value);
    this.employeeFormData.DEPT_NAME = selectedDept
      ? selectedDept.DESCRIPTION
      : '';
  }

  onDesignationChange(e: any) {
    const selected = this.designations.find((d) => d.ID === e.value);
    this.employeeFormData.DESG_NAME = selected ? selected.DESCRIPTION : '';
  }

  onStateChange(e: any) {
    const selected = this.states.find((d) => d.ID === e.value);
    this.employeeFormData.STATE_NAME = selected ? selected.DESCRIPTION : '';
  }

  onSalaryRowUpdated(e: any): void {
    const updatedRow = e.data;
    const headId = updatedRow.HEAD_ID;
    const amount = updatedRow.amount;

    if (headId !== undefined && amount !== undefined) {
      const existingIndex = this.employeeFormData.EmployeeSalary.findIndex(
        (item) => item.HEAD_ID === headId
      );

      if (existingIndex > -1) {
        this.employeeFormData.EmployeeSalary[existingIndex].AMOUNT = amount;
      } else {
        this.employeeFormData.EmployeeSalary.push({
          ID: 0,
          EMP_ID: this.employeeFormData.EMP_ID || 0,
          HEAD_ID: headId,
          AMOUNT: amount,
        });
      }
    } else {
      console.warn('Missing HEAD_ID or amount in updated row:', updatedRow);
    }
  }

  isValid() {
    return this.employeeFormGroup.instance.validate().isValid;
  }

 

  saveEmployee() {
    if (!this.isValid()) return;


    // Check for duplicate employee code
    const enteredEmpCode = this.employeeFormData.EMP_CODE?.trim().toUpperCase();

    const isDuplicate = this.employeeList.some(emp =>
      emp.EMP_CODE?.trim().toUpperCase() === enteredEmpCode &&
      (!this.employeeFormData.EMP_ID || emp.EMP_ID !== this.employeeFormData.EMP_ID)
    );
  
    
    if (isDuplicate) {
      notify(
        {
          message: 'Employee Code already exists. Please enter a unique code.',
          position: { at: 'top center', my: 'top center' },
        },
        'error'
      );
      return;
    }

    this.isSaving = true; // start loading

    // this.employeeFormData.EmployeeSalary = this.salaryHead.map((item) => ({
    //   ID: 0,
    //   EMP_ID: this.employeeFormData.EMP_ID || 0,
    //   HEAD_ID: item.HEAD_ID,
    //   AMOUNT: item.amount || 0,
    // }));

    
    const payload = { ...this.employeeFormData ,
      Company_Id:  this.COMPANY_ID
    };
console.log(payload);

    this.dataservice.saveEmployeeData(payload).subscribe({
      next: (response: any) => {
        if (response) {
          notify(
            {
              message: 'Employee saved Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.formClosed.emit(true);
          this.selectedTabIndex = 0;
        } else {
          notify(
            {
              message: 'Your Data Not Saved',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
      },
      error: (err) => {
        notify(
          {
            message: 'Something went wrong!',
            position: { at: 'top right', my: 'top right' },
          },
          'error'
        );
      },
      complete: () => {
        this.isSaving = false; // stop loading
      },
    });
  }

  cancel() {
    this.formClosed.emit(true);
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
    DxValidatorModule,
    DxValidationGroupModule,
    DxNumberBoxModule,
  ],
  providers: [],
  declarations: [EmployeeAddFormComponent],
  exports: [EmployeeAddFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmployeeAddFormModule {}