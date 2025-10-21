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
import {
  BrowserModule,
  DomSanitizer,
  SafeResourceUrl,
} from '@angular/platform-browser';
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
} from 'devextreme-angular';
import {
  DxoItemModule,
  DxoFormItemModule,
  DxoLookupModule,
  DxiItemModule,
  DxiGroupModule,
} from 'devextreme-angular/ui/nested';
import { FormTextboxModule } from 'src/app/components/utils/form-textbox/form-textbox.component';
import { EmployeeAddFormComponent } from '../employee-add-form/employee-add-form.component';
import { DataService } from 'src/app/services';
import { FormsModule } from '@angular/forms';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-employee-edit-form',
  templateUrl: './employee-edit-form.component.html',
  styleUrls: ['./employee-edit-form.component.scss'],
})
export class EmployeeEditFormComponent {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @ViewChild('fileUploader') fileUploader!: ElementRef;
  @ViewChild('salaryGrid', { static: false }) salaryGrid: DxDataGridComponent;

  @Input() employeeData: any;
  @Output() formClosed = new EventEmitter<boolean>();
  // imageUrl: null;
  emailError: string;
  mobileError: string;
  uploadedFileName: any;
  // fileDetails: any;
  fileDetails: { file: File | null; remarks: string } = {
    file: null,
    remarks: '',
  };
  attachments: any[] = [];
  showPopup: boolean;
  departments: any;
  allowedFileExtensions = ['.jpg', '.png', '.jpeg'];
  displayMode: any = 'full';
  readonly allowedPageSizes: any = [5, 10, 'all'];
  countries: any;
  salaryHead: any[] = [];
  designations: any;
  paymentType: any;
  states: any;
  showPageSizeSelector = true;
  selectedTabIndex = 0;
  isPreviewVisible = false;
  // previewUrl: string | null = null;
  previewType: 'image' | 'pdf' | 'unsupported' = 'unsupported';

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
    PF_AC_NO:'',
    ESI_NO:'',
    ESI_PERCENT:0,
    DEPT_ID: '',
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
    PAYMENT_TYPE: '',
    Company_Id:0,
    LEAVE_DAY_BALANCE: '',
    DAYS_DEDUCTED: '',
    Attachment: [],
  };
  salaryHeadLoaded = false;
  employeeDataLoaded = false;
  previewUrl: SafeResourceUrl | null = null;
  imageUrl: string | null = null;
  downloadFileName: any;
  eighteenYearsAgo: Date;
  employeeList: any;
  COMPANY_ID: any;
  constructor(
    public dataservice: DataService,
    private sanitizer: DomSanitizer
  ) {
    dataservice.getCountryWithFlags().subscribe((data) => {
      this.countries = data;
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

  ngOnInit() {
    const today = new Date();
    this.eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    this.getEmployeeList();

          const  SELECTED_COMPANY=JSON.parse(sessionStorage.getItem('savedUserData'))
    const companyid=SELECTED_COMPANY.SELECTED_COMPANY

    console.log(SELECTED_COMPANY)
    
    console.log(companyid);
    this.COMPANY_ID=companyid.COMPANY_ID
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employeeData'] && changes['employeeData'].currentValue) {
      this.employeeFormData = this.employeeData;
      // this.salaryHead=this.employeeFormData.EmployeeSalary
      // this.salaryHead = this.employeeFormData.EmployeeSalary.map((s) => ({
      //   ...s,
      //   amount: s.AMOUNT ?? 0, // Convert AMOUNT to amount
      // }));

      if (this.employeeFormData.IMAGE_NAME) {
        this.imageUrl = `${this.employeeFormData.IMAGE_NAME}`;
      } else {
        this.imageUrl = null;
      }
      this.attachments = (this.employeeFormData.Attachment || []).map(
        (att) => ({
          fileName: att.FILE_NAME,
          remarks: att.REMARKS,
          base64: att.FILE_DATA,
        })
      );
    }
  }

  mergeSalaryData() {
    const salaryMap = new Map<number, any>(
      this.employeeFormData.EmployeeSalary.map((s: any) => [s.HEAD_ID, s])
    );

    const updatedSalaryHead = this.salaryHead.map((head: any) => {
      const matched = salaryMap.get(head.ID);
      return {
        ...head,
        HEAD_ID: head.ID,
        HEAD_NAME: head.HEAD_NAME, // in case it's not in EmployeeSalary
        ID: matched?.ID || 0,
        EMP_ID: this.employeeFormData.EMP_ID,
        amount: matched?.AMOUNT ?? null,
      };
    });

    this.salaryHead = [...updatedSalaryHead]; // New reference for DevExtreme
  }

  logGridData(e: any) {
    console.log('Grid DataSource Items:', e.component.getDataSource().items());
  }

  triggerFileUpload() {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
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

      // console.log('Updated EMPLOYEESALARY:', this.employeeFormData.EmployeeSalary);
    } else {
      console.warn('Missing HEAD_ID or amount in updated row:', updatedRow);
    }
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
        this.imageUrl = e.target.result; // for preview
        this.employeeFormData.IMAGE_NAME = e.target.result; // save base64 in form data
      };
      reader.readAsDataURL(file);
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

  cancel() {
    this.formClosed.emit(true);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1]; // remove prefix

        this.fileDetails.file = file;

        // Store base64 temporarily for pushing
        (this.fileDetails as any).base64 = base64String;
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
      base64: (this.fileDetails as any).base64 || '',
    });
    this.employeeFormData.Attachment = [...this.attachments];
    // Reset form
    this.fileDetails = { file: null, remarks: '' };
    this.uploadedFileName = '';
    this.showPopup = false;
  }

  viewAttachment(file: any) {
    const fileName = file.FILE_NAME || file.fileName;

    const actualFile = this.employeeFormData.Attachment.find(
      (f: any) => f.FILE_NAME === fileName
    );

    if (!actualFile || !actualFile.FILE_DATA) {
      console.error('File data not found in employeeFormData.Attachment.');
      return;
    }

    const base64 = actualFile.FILE_DATA;
    const fileType = this.getFileType(actualFile.FILE_NAME);

    this.downloadFileName = actualFile.FILE_NAME;

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
      console.warn('Unsupported file type:', fileType);
      this.previewUrl = '';
      this.previewType = 'unsupported';
    }

    this.isPreviewVisible = true;
  }

  getFileType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();

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
      case 'bmp':
        return 'image/bmp';
      case 'webp':
        return 'image/webp';
      case 'svg':
        return 'image/svg+xml';

      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'ppt':
        return 'application/vnd.ms-powerpoint';
      case 'pptx':
        return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

      case 'txt':
        return 'text/plain';
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      case 'zip':
        return 'application/zip';
      case 'rar':
        return 'application/vnd.rar';
      case '7z':
        return 'application/x-7z-compressed';

      default:
        return 'application/octet-stream'; // fallback binary stream
    }
  }

  // Utility to get MIME type from file name
  getFileTypeFromName(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png':
        return 'image/png';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      default:
        return 'application/octet-stream';
    }
  }

  onDepartmentChange(e: any) {
    const selectedDept = this.departments.find((dept) => dept.ID === e.value);
    this.employeeData.DEPT_NAME = selectedDept ? selectedDept.DESCRIPTION : '';
  }

  openAttachmentPopup() {
    console.log('Opening attachment popup...'); // Debugging log
    this.showPopup = true;
  }

  onDeleteAttachment = (e: any) => {
    const index = this.attachments.indexOf(e.row.data);
    if (index > -1) {
      const confirmed = confirm('Are you sure you want to delete this file?');
      if (confirmed) {
        this.attachments.splice(index, 1);
        this.employeeFormData.Attachment = [...this.attachments];
      }
    }
  };

  getEmployeeList() {
    const comapny_id=1

    const payload={
      "CompanyId":comapny_id
    }
    this.dataservice.employeeList(payload).subscribe((response: any) => {
      this.employeeList = response.reverse();
    });
  }

  update() {
    
    const enteredEmpCode = this.employeeFormData.EMP_CODE?.trim().toUpperCase();
    const currentEmpId = this.employeeFormData.ID;
    const enteredEmpName = this.employeeFormData.EMP_NAME?.trim();
      if (!enteredEmpCode || !enteredEmpName) {
    notify(
      {
        message: 'Employee Code and Employee Name are required.',
        position: { at: 'top center', my: 'top center' }
      },
      'error',
      2000
    );
    return; 
  }
    const isDuplicate = this.employeeList.some((emp) => {
      const empCode = emp.EMP_CODE?.trim().toUpperCase();
      const isSameCode = empCode === enteredEmpCode;
      const isDifferentId = emp.ID !== currentEmpId;

      console.log(
        `Comparing ${empCode} with ${enteredEmpCode} | isSameCode: ${isSameCode} | isDifferentId: ${isDifferentId}`
      );

      return isSameCode && isDifferentId;
    });

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

    // this.employeeFormData.EmployeeSalary = this.salaryHead.map((item) => ({
    //   ID: item.ID || 0, // If you're editing existing salary records, keep their original IDs
    //   EMP_ID: this.employeeFormData.EMP_ID || 0,
    //   HEAD_ID: item.HEAD_ID,
    //   AMOUNT: item.amount || 0,
    // }));
    const userId = 1; // Replace with your method
    const docId = this.employeeFormData.ID || 0;
    const docType = 1;

    const formattedAttachments = this.attachments.map((att) => ({
      ID: 0,
      DOC_TYPE: docType,
      DOC_ID: docId,
      FILE_NAME: att.fileName,
      FILE_DATA: att.base64,
      REMARKS: att.remarks,
      USER_ID: userId,
      CREATED_DATE_TIME: new Date().toISOString(),
    }));

    this.employeeFormData.Attachment = formattedAttachments;

       const payload = { ...this.employeeFormData ,
      Company_Id:  this.COMPANY_ID
    };
console.log(payload);

    this.dataservice.updateEmployee(payload).subscribe({
      next: (res) => {
        // console.log('Employee updated successfully:', res);
        this.salaryGrid?.instance.refresh();
        if (res) {
          notify(
            {
              message: 'Employee updated Successfully',
              position: { at: 'top center', my: 'top center' },
            },
            'success'
          );
          this.formClosed.emit(true);
          this.selectedTabIndex = 0;
        } else {
          notify(
            {
              message: 'Your Data Not updated',
              position: { at: 'top right', my: 'top right' },
            },
            'error'
          );
        }
        this.formClosed.emit(true); // To close popup
      },
      error: (err) => {
        // console.error('Error updating employee:', err);
      },
    });
  }


    onStateChange(e: any) {
    const selected = this.states.find((d) => d.ID === e.value);
    this.employeeFormData.STATE_NAME = selected ? selected.DESCRIPTION : '';
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
    FormsModule,
    DxNumberBoxModule
  ],
  providers: [],
  declarations: [EmployeeEditFormComponent],
  exports: [EmployeeEditFormComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EmployeeEditFormFormModule {}