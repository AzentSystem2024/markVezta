import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  BrowserModule,
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
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
  DxDataGridComponent,
  DxNumberBoxModule,
  DxValidationGroupComponent,
  DxValidationGroupModule
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import notify from 'devextreme/ui/notify';

import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { DataService } from 'src/app/services';

@Component({
  selector: 'app-employee-edit-form',
  templateUrl: './employee-edit-form.component.html',
  styleUrls: ['./employee-edit-form.component.scss'],
})
export class EmployeeEditFormComponent implements OnInit, OnChanges {
  // ==================== ViewChildren & Inputs/Outputs ====================
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('fileUploader') fileUploader!: ElementRef;
  @ViewChild('salaryGrid', { static: false }) salaryGrid?: DxDataGridComponent;
  @ViewChild('employeeFormGroup', { static: false })
  employeeFormGroup!: DxValidationGroupComponent;

  @Input() employeeData: any;
  @Output() formClosed = new EventEmitter<boolean>();

  // ==================== Form & Component State ====================
  employeeFormData: any = {
    ID: '',
    EMP_CODE: '',
    EMP_NAME: '',
    DOB: null,
    ADDRESS1: '',
    ADDRESS2: '',
    ADDRESS3: '',
    CITY: '',
    STATE_ID: '',
    COUNTRY_ID: '',
    MOBILE: '',
    EMAIL: '',
    IS_MALE: 1,
    PF_AC_NO: '',
    ESI_NO: '',
    ESI_PERCENT: 0,
    DEPT_ID: '',
    SUB_DEPT_ID: '',
    DESG_ID: '',
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
    EMP_STATUS: '',
    IS_SALESMAN: '',
    IMAGE_NAME: '',
    WORK_PERMIT_NO: '',
    WORK_PERMIT_EXPIRY: null,
    IBAN_NO: '',
    DAMAN_NO: '',
    DAMAN_CATEGORY: '',
    LEAVE_CREDIT: '',
    LESS_SERVICE_DAYS: '',
    HOLD_SALARY: '',
    MOL_NUMBER: '',
    LAST_REJOIN_DATE: null,
    INCENTIVE_PERCENT: '',
    STORE_ID: '',
    IS_DELETED: '',
    COUNTRY_NAME: '',
    DEPT_NAME: '',
    DESG_NAME: '',
    STATE_NAME: '',
    IS_INACTIVE: '',
    PAYMENT_TYPE: 1,
    Company_Id: 0,
    LEAVE_DAY_BALANCE: '',
    DAYS_DEDUCTED: '',
    Attachment: [],
    EmployeeSalary: [],
  };

  attachments: any[] = [];
  salaryHead: any[] = [];
  employeeList: any[] = [];

  // UI States
  displayMode: string = 'full';
  showPageSizeSelector = true;
  selectedTabIndex = 0;
  showPopup: boolean = false;
  isPreviewVisible = false;
  previewType: 'image' | 'pdf' | 'unsupported' = 'unsupported';
  previewUrl: SafeResourceUrl | null = null;
  imageUrl: string | null = null;

  // File Upload State
  fileDetails: { file: File | null; remarks: string; base64?: string } = {
    file: null,
    remarks: '',
  };
  uploadedFileName: string = '';
  downloadFileName: string = '';
  readonly allowedPageSizes: any = [10, 15, 'all'];
  allowedFileExtensions = ['.jpg', '.png', '.jpeg'];

  // Validations
  emailError?: string;
  mobileError?: string;
  eighteenYearsAgo?: Date;

  // Dropdowns & Master Data
  departments: any;
  SubDepartmentDataSource: any = null;
  designations: any;
  paymentType: any;
  states: any;
  countries: any;
  countryCodes: any[] = [];
  countryCode: string = '';
  CountryId: any;
  mobile_limit: number = 0;

  // Session Data
  COMPANY_ID: any;
  selected_Company_id: any;

  // Flags
  salaryHeadLoaded = false;
  employeeDataLoaded = false;

  constructor(
    public dataservice: DataService,
    private sanitizer: DomSanitizer,
  ) {
    this.fetchDropdowns();
  }

  // ==================== Lifecycle Hooks ====================

  ngOnInit() {
    const today = new Date();
    this.eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate(),
    );

    this.loadSessionDetails();
    this.getEmployeeList();
  }

  private parseDateString(dateStr: any): Date | null {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;
    if (typeof dateStr === 'string') {
      if (dateStr.includes('T') || dateStr.includes('Z')) {
        return new Date(dateStr);
      }
      const parts = dateStr.split('-');
      if (parts.length === 3 && parts[2].length === 4) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
      return new Date(dateStr);
    }
    return null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employeeData']?.currentValue) {
      this.employeeFormData = { ...this.employeeData };
      this.CountryId = this.employeeFormData.COUNTRY_ID;

      // Parse dates to prevent dx-date-box validation failures
      this.employeeFormData.DOJ = this.parseDateString(this.employeeFormData.DOJ);
      this.employeeFormData.DOB = this.parseDateString(this.employeeFormData.DOB);
      this.employeeFormData.PP_EXPIRY = this.parseDateString(this.employeeFormData.PP_EXPIRY);
      this.employeeFormData.VISA_EXPIRY = this.parseDateString(this.employeeFormData.VISA_EXPIRY);
      this.employeeFormData.WORK_PERMIT_EXPIRY = this.parseDateString(this.employeeFormData.WORK_PERMIT_EXPIRY);
      this.employeeFormData.LICENSE_EXPIRY = this.parseDateString(this.employeeFormData.LICENSE_EXPIRY);
      this.employeeFormData.LAST_REJOIN_DATE = this.parseDateString(this.employeeFormData.LAST_REJOIN_DATE);

      const selectedCountry = this.countries?.find(
        (country: any) => country.ID === this.employeeFormData.COUNTRY_ID,
      );

      this.countryCode = selectedCountry ? selectedCountry.CODE : '';

      this.imageUrl = this.employeeFormData.IMAGE_NAME || null;

      this.attachments = (this.employeeFormData.Attachment || []).map(
        (att: any) => ({
          fileName: att.FILE_NAME,
          remarks: att.REMARKS,
          base64: att.FILE_DATA,
        }),
      );
    }
  }

  // ==================== Initialization & Data Fetching ====================

  private fetchDropdowns() {
    this.dataservice.getCountryWithFlags().subscribe((data) => {
      this.countries = data;
      this.countryCodes = data;
      // Pre-set country code if data loaded after ngOnChanges
      if (this.CountryId) {
        const matched = data.find((c: any) => c.ID === this.CountryId);
        if (matched) this.countryCode = matched.CODE;
      }
    });
    this.dataservice
      .getDropdownData({ NAME: 'EMPLOYEE DEPARTMENT' })
      .subscribe((data) => (this.departments = data));
    this.dataservice
      .getDropdownData({ NAME: 'DESIGNATION' })
      .subscribe((data) => (this.designations = data));
    this.dataservice
      .getDropdownData({ NAME: 'SALARY PAYMENT TYPE' })
      .subscribe((data) => (this.paymentType = data));
    this.dataservice
      .getDropdownData({ NAME: 'STATE' })
      .subscribe((data) => (this.states = data));
  }

  private loadSessionDetails() {
    const savedUserData = sessionStorage.getItem('savedUserData');
    if (savedUserData) {
      const sessionData = JSON.parse(savedUserData);
      const companyId = sessionData?.SELECTED_COMPANY?.COMPANY_ID;
      this.selected_Company_id = companyId;
      this.COMPANY_ID = companyId;
    } else {
      this.selected_Company_id = null;
      this.COMPANY_ID = null;
    }
  }

  private getEmployeeList() {
    if (!this.selected_Company_id) return;
    const payload = { CompanyId: this.selected_Company_id };
    this.dataservice.employeeList(payload).subscribe((response: any) => {
      this.employeeList = response?.reverse() || [];
    });
  }

  // ==================== UI & Event Handlers ====================

  mergeSalaryData() {
    if (!this.employeeFormData.EmployeeSalary) return;

    const salaryMap = new Map<number, any>(
      this.employeeFormData.EmployeeSalary.map((s: any) => [s.HEAD_ID, s]),
    );

    this.salaryHead = this.salaryHead.map((head: any) => {
      const matched = salaryMap.get(head.ID);
      return {
        ...head,
        HEAD_ID: head.ID,
        HEAD_NAME: head.HEAD_NAME,
        ID: matched?.ID || 0,
        EMP_ID: this.employeeFormData.EMP_ID,
        amount: matched?.AMOUNT ?? null,
      };
    });
  }

  onSalaryRowUpdated(e: any): void {
    const updatedRow = e.data;
    const headId = updatedRow.HEAD_ID;
    const amount = updatedRow.amount;

    if (headId !== undefined && amount !== undefined) {
      if (!this.employeeFormData.EmployeeSalary) {
        this.employeeFormData.EmployeeSalary = [];
      }
      const existingIndex = this.employeeFormData.EmployeeSalary.findIndex(
        (item: any) => item.HEAD_ID === headId,
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
    }
  }

  onDepartmentChange(e: any) {
    const selectedDept = this.departments?.find(
      (dept: any) => dept.ID === e.value,
    );
    this.employeeFormData.DEPT_NAME = selectedDept
      ? selectedDept.DESCRIPTION
      : '';

    if (e.value) {
      this.dataservice
        .get_Sub_Dept_DropdownData(e.value)
        .subscribe((res: any) => {
          this.SubDepartmentDataSource = res || [];
        });
    } else {
      this.SubDepartmentDataSource = [];
    }
  }

  onStateChange(e: any) {
    const selected = this.states?.find((d: any) => d.ID === e.value);
    this.employeeFormData.STATE_NAME = selected ? selected.DESCRIPTION : '';
  }

  onCountrySelectionChanged(event: any) {
    this.CountryId = event.value;
    const selectedCountry = this.countries?.find(
      (country: any) => country.ID === event.value,
    );
    this.countryCode = selectedCountry ? selectedCountry.CODE : '';
  }

  onCountrycodeChange(e: any) {
    const payload = { COUNTRY_CODE: e.value };
    this.dataservice.get_mobile_no_length(payload).subscribe((res: any) => {
      this.mobile_limit = Number(res?.Data?.[0]?.MOBILE_DIGITS) || 0;
    });
  }

  countryDisplay(item: any) {
    return item ? `${item.CODE}` : '';
  }

  logGridData(e: any) {}

  // ==================== Validation ====================

  validateEmail(event: any) {
    const email = event.target.value;
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.emailError =
      !email || emailPattern.test(email)
        ? ''
        : 'Please enter a valid email address';
  }

  validateMobile(event: any) {
    const mobileNumber = event.target.value;
    const mobilePattern = /^[6-9]\d{9}$/;
    this.mobileError =
      !mobileNumber || mobilePattern.test(mobileNumber)
        ? ''
        : 'Please enter a valid 10-digit mobile number starting with 6-9';
  }

  isValid() {
    const validationResult = this.employeeFormGroup?.instance?.validate();
    if (validationResult && !validationResult.isValid) {
      console.error('Validation Errors:', validationResult.brokenRules);
    }
    return validationResult?.isValid ?? false;
  }

  // ==================== File & Image Handlers ====================

  triggerFileUpload() {
    this.fileInput?.nativeElement.click();
  }

  clearImage(event: MouseEvent): void {
    event.stopPropagation();
    this.imageUrl = null;
    this.employeeFormData.IMAGE_NAME = '';
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
        this.employeeFormData.IMAGE_NAME = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  openAttachmentPopup() {
    this.showPopup = true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        this.fileDetails.file = file;
        this.fileDetails.base64 = base64String;
      };
      reader.readAsDataURL(file);
    }
  }

  saveFileDetails() {
    if (!this.fileDetails.file || !this.fileDetails.remarks.trim()) {
      alert('Please upload a file and enter remarks.');
      return;
    }

    this.attachments.push({
      fileName: this.fileDetails.file.name,
      remarks: this.fileDetails.remarks,
      base64: this.fileDetails.base64 || '',
    });
    this.employeeFormData.Attachment = [...this.attachments];

    // Reset form
    this.fileDetails = { file: null, remarks: '' };
    this.uploadedFileName = '';
    this.showPopup = false;
  }

  onDeleteAttachment = (e: any) => {
    const index = this.attachments.indexOf(e.row.data);
    if (index > -1) {
      if (confirm('Are you sure you want to delete this file?')) {
        this.attachments.splice(index, 1);
        this.employeeFormData.Attachment = [...this.attachments];
      }
    }
  };

  viewAttachment(file: any) {
    const fileName = file.fileName;
    const base64 = file.base64;

    if (!base64) {
      notify('File data not found.', 'error', 2000);
      return;
    }

    const fileType = this.getFileType(fileName);
    this.downloadFileName = fileName;

    if (fileType.startsWith('image/')) {
      this.previewUrl = `data:${fileType};base64,${base64}`;
      this.previewType = 'image';
    } else if (fileType === 'application/pdf') {
      const byteArray = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
      this.previewType = 'pdf';
    } else {
      this.previewUrl = '';
      this.previewType = 'unsupported';
    }
    this.isPreviewVisible = true;
  }

  getFileType(fileName: string): string {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'gif':
        return 'image/gif';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }

  // ==================== Save & Update Logic ====================

  update() {
    if (!this.isValid()) {
      notify(
        'Please resolve all validation errors before saving.',
        'error',
        2000,
      );
      return;
    }

    const enteredEmpCode = this.employeeFormData.EMP_CODE?.trim().toUpperCase();
    const enteredEmpName = this.employeeFormData.EMP_NAME?.trim();
    const currentEmpId = this.employeeFormData.ID;

    if (!enteredEmpCode || !enteredEmpName) {
      notify('Employee Code and Employee Name are required.', 'error', 2000);
      return;
    }

    if (this.employeeList && this.employeeList.length > 0) {
      const isDuplicate = this.employeeList.some((emp: any) => {
        return (
          emp.EMP_CODE?.trim().toUpperCase() === enteredEmpCode &&
          emp.ID !== currentEmpId
        );
      });

      if (isDuplicate) {
        notify(
          'Employee Code already exists. Please enter a unique code.',
          'error',
          2000,
        );
        return;
      }
    }

    const userId = 1; // Or get from session
    const docId = this.employeeFormData.ID || 0;
    const docType = 1;

    this.employeeFormData.Attachment = this.attachments.map((att) => ({
      ID: 0,
      DOC_TYPE: docType,
      DOC_ID: docId,
      FILE_NAME: att.fileName,
      FILE_DATA: att.base64,
      REMARKS: att.remarks,
      USER_ID: userId,
      CREATED_DATE_TIME: new Date().toISOString(),
    }));

    const payload = {
      ...this.employeeFormData,
      Company_Id: this.COMPANY_ID,
      COMPANY_ID: this.COMPANY_ID,
    };

    this.dataservice.updateEmployee(payload).subscribe({
      next: (res: any) => {
        this.salaryGrid?.instance?.refresh();
        if (
          res &&
          (res.flag === 1 ||
            res.status === 'success' ||
            res.ID ||
            typeof res === 'object')
        ) {
          notify('Employee updated Successfully', 'success', 2000);
          this.formClosed.emit(true);
          this.selectedTabIndex = 0;
        } else {
          notify('Your Data Not updated', 'error', 2000);
        }
      },
      error: (err) => {
        console.error('Update failed:', err);
        notify(
          'Error updating employee. Please try again later.',
          'error',
          2000,
        );
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
    DxToolbarModule,
    DxiItemModule,
    DxTabPanelModule,
    DxTabsModule,
    DxiGroupModule,
    FormsModule,
    DxNumberBoxModule,
    DxValidationGroupModule
  ],
  providers: [],
  declarations: [EmployeeEditFormComponent],
  exports: [EmployeeEditFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmployeeEditFormFormModule {}
