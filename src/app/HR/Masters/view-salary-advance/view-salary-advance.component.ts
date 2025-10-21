// import { Component } from '@angular/core';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  NgModule,
  NgZone,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxToolbarModule,
  DxValidationGroupComponent,
  DxValidatorModule,
} from 'devextreme-angular';
import { FormPopupModule, FormTextboxModule } from 'src/app/components';
import { DataService } from 'src/app/services';
import { CommonModule } from '@angular/common';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-view-salary-advance',
  templateUrl: './view-salary-advance.component.html',
  styleUrls: ['./view-salary-advance.component.scss']
})
export class ViewSalaryAdvanceComponent {

  isEditReadOnly:boolean=true
    @Input() advanceData: any = {};
  @ViewChild(DxDataGridComponent, { static: true })

  dataGrid!: DxDataGridComponent;
  isLoading: boolean = true;

  formSource!: FormGroup;
  minDateUpdate: Date;
  Advance_Options: any = [];
  isAddPopUp: boolean = false;
  isEditPopUp: boolean = false;
  readonly allowedPageSizes: any = [5, 10, 'all'];
  EMPLOYEE_VALUE: any;
  displayMode: any = 'full';
  showPageSizeSelector = true;
  employee_ID: any;
  ADVANCETYPE_VALUE: any;
  Advance_types_ID: any;
  selected_Data: any ={};
Payment_Head:any
  adv_type_name: any;
  Advance_Amount_value: any;
  adv_no_value: any;
  adv_type_id_value: any;
  date_value: any;
  emp_id: any;
  emp_name_value: any;
  reco_Amount_value: any;
  reco_install_Amount_value: any;
  reco_inst_count_value: any;
  reco_stat_month: any;
  recoverd_Amt_value: any; //read only
  remark_value: any;
  id: any;
  selectedData: any;
  isFormSubmitted = false;
  selected_Cheque_No: any;
  selected_Cheque_Date: any;
  //data box
  approveValue: boolean = true;
selectTransId:any
  dateRanges = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Custom', value: 'custom' },
  ];

  selectedRange: string = 'select';

  fromDate: string | number | Date = new Date();
  toDate: string | number | Date = new Date();
  payment_Detilas:any=[]
  isCustomDatePopupVisible = false;

  //All buttons

  allActionButtons = [
    {
      name: 'edit',
      hint: 'Edit',
      icon: 'edit',
      text: 'Edit',
    },
    {
      name: 'delete',
      hint: 'Delete',
      icon: 'trash',
      text: 'Delete',
      // onClick: (e) => this.onDeleteClick(e),
      visible: (e) => e.row.data.STATUS !== 'Approved',
    },

  ];
    tempPaymentMode: any = 0;
  verifiedAdvancePopUp: boolean = false;
  approveAdvancePopUp: boolean = false;
  isviewpopup: boolean = false;
  startDate: Date;
  endDate: Date;
  filterddata: any;
  trans_id: any;
  paymentModes = [
  { value: '13', label: 'Cash' },
  { value: '14', label: 'Bank' }
];

selectedPaymentMode: string // default selection
  
  // isEditReadOnly: boolean = false;
  selectedpayid: any;
  selected_pay_type_id: any;
  isFilterOpened: boolean;
  auto: string = 'auto';
   isFilterRowVisible: boolean = false;
isReadOnlyReceipt:boolean=false

gridButtons = [
  'edit',
  {
    name: 'delete',
    visible: (e: any) => e.row?.data?.STATUS?.trim() === 'Open'
  }
];
  constructor(private fb: FormBuilder, private dataService: DataService,private ngZone: NgZone) {
    this.formSource = this.fb.group({
      Id: [null],
      employee_ID: [''],
      Advance_types_ID: [''],
      Amount: [''],
      Date: [new Date()],
      Net_Amount_recoverd: [''],
      Recovery_Date: [''],
      No_installments: [''],
      installmen_amt: [''],
      Remarks: [""],
    });
    this.get_advance_list();
    this.setupInstallmentCalculation();
    this.get_Employee_dropdown();
    this.get_advanceType_dropdown();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['advanceData'] &&
      changes['advanceData'].currentValue
    ) {
      this.selected_Data = this.advanceData;

      console.log(this.selected_Data,'===========================================selected_Data========================')
    }
  }



setPaymentMode() {
  if (this.selected_pay_type_id === 0) {
    this.tempPaymentMode = this.selectedPaymentMode;
  } else {
    this.tempPaymentMode = this.selected_pay_type_id;
  }
}

onPaymentModeChanged(e: any) {
  const value = e.value;
  if (this.selected_pay_type_id === 0) {
    this.selectedPaymentMode = value;
  } else {
    this.selected_pay_type_id = value;
  }
}
//======================Installment Amount=====================
  setupInstallmentCalculation() {
    this.formSource.get('Net_Amount_recoverd')?.valueChanges.subscribe(() => {
      this.calculateInstallmentAmount();
    });

    this.formSource.get('No_installments')?.valueChanges.subscribe(() => {
      this.calculateInstallmentAmount();
    });
  }
//=================Calculate Installment Amount========================
  calculateInstallmentAmount() {
    const netAmt = this.formSource.get('Net_Amount_recoverd')?.value || 0;
    const installments = this.formSource.get('No_installments')?.value || 0;

    if (installments > 0) {
      const installmentAmt = netAmt / installments;
      this.formSource
        .get('installmen_amt')
        ?.setValue(installmentAmt, { emitEvent: false });
    } else {
      this.formSource.get('installmen_amt')?.setValue(0, { emitEvent: false });
    }
  }

  onAmountInput(e: any) {
    const amount = e.value;
    this.formSource.get('Net_Amount_recoverd')?.setValue(amount);
  }

  //=================Add Pop up=========================

  onApprovedChanged(event: any) {
    console.log(event,'======function chngeeeeeee===')
     console.log(this.approveValue,'======function chngeeeeeee===')
  }
  initialLoad: boolean = true;
//=================Get Advance List=========================

  get_advance_list(filterBy: string = 'all') {
    this.isLoading = true;
    this.dataService.Get_Api_advance().subscribe((res: any) => {
      let data = res.data;
      console.log(data);

      // On first load, show all data without filtering
      if (this.initialLoad) {
        this.Advance_Options = data
          .reverse()
          .map((item: any, index: number) => ({
            ...item,
            serialNo: index + 1,
          }));
        this.initialLoad = false;
        this.isLoading = false;
        return;
      }

      // Only apply filters after first load
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let startDate: Date;
      let endDate: Date = new Date(today);
      endDate.setHours(23, 59, 59, 999);

      switch (filterBy) {
        case 'today':
          startDate = new Date(today);
          break;

        case 'yesterday':
          startDate = new Date(today);
          startDate.setDate(startDate.getDate() - 1);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          break;

        case 'week':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - today.getDay());
          break;

        case 'month':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;

        case 'custom':
          startDate = new Date(this.fromDate);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(this.toDate);
          endDate.setHours(23, 59, 59, 999);
          break;

        default:
          // No filtering if invalid filter
          this.Advance_Options = data
            .reverse()
            .map((item: any, index: number) => ({
              ...item,
              serialNo: index + 1,
            }));
          this.isLoading = false;
          return;
      }

      // Filter data based on date range
      this.filterddata = data.filter((item: any) => {
        const itemDate = this.parseApiDate(item.DATE);
        if (!itemDate) return false;
        return itemDate >= startDate && itemDate <= endDate;
      });

      // Add serial numbers
      this.Advance_Options = this.filterddata
        .reverse()
        .map((item: any, index: number) => ({
          ...item,
          serialNo: index + 1,
        }));

      this.isLoading = false;
    });
  }

  // Reset filter to show all data
  resetFilter() {
    this.initialLoad = true;
    this.selectedRange = 'all'; // Add this option to your dateRanges array
    this.get_advance_list();
  }
  parseApiDate(dateStr: string): Date | null {
    try {
      const parts = dateStr.split('/');
      if (parts.length !== 3) return null;

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-based
      const year = 2000 + parseInt(parts[2], 10); // Adjust if years are like '25' for 2025

      return new Date(year, month, day);
    } catch (e) {
      return null;
    }
  }

  onDateRangeChange(event: any) {
    const selected = event.value;

    if (selected === 'custom') {
      this.isCustomDatePopupVisible = true;
    } else {
      this.get_advance_list(selected);
    }
  }

  applyCustomDate() {
    if (!this.fromDate || !this.toDate) {
      alert('Please select both From and To dates.');
      return;
    }

    if (new Date(this.fromDate) > new Date(this.toDate)) {
      alert('From Date cannot be after To Date.');
      return;
    }

    this.isCustomDatePopupVisible = false;
    this.get_advance_list('custom');
  }

//===================On Edit Start=========================

  onEditStart(e: any) {
    e.cancel = true;
    const statusValue = e.data.STATUS;
    const id = e.data.TRANS_ID;
    // this.dataService.select_Advance(id).subscribe((res: any) => {
    // });
     this.isEditPopUp = true;
    
  const status = e.data?.STATUS?.trim();
  // this.isEditReadOnly = (status === 'Approved'); 
  if(status === 'Approved'){
    console.log(status)
    this.isEditReadOnly=true
    console.log(this.isEditReadOnly)
  }
  else{
      this.isEditReadOnly=false
  }
    
    // this.select_api_Advance(e);
this.ledgerlist()
    console.log(statusValue, '===========satus value============');
      console.log(this.selectedPaymentMode,'------pyment mode------')

       // Set a flag to determine if the form should be read-only
    // this.isEditReceipt = true;
    // this.isReadOnlyReceipt = (STATUS === 5); // true if status is approved


//        if( this.selected_Cheque_No){
//     this.selectedPaymentMode=='14'
//  }
//  else{
//    this.selectedPaymentMode=='13'
//  }
  }
  minDate: Date;

  ngOnInit() {
    const today = new Date();
    // Set minDate to the 1st day of the *next* month
    this.minDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  
 this.setPaymentMode();


  }

  // ==========================Employeee drpdown========================
  get_Employee_dropdown() {
    this.dataService.Dropdown_advance_employee(name).subscribe((res: any) => {
      console.log(res);
      this.EMPLOYEE_VALUE = res;

      console.log(this.EMPLOYEE_VALUE);
    });
  }


refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
    }
  }
  refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };

  toggleFilters() {
    this.isFilterOpened = !this.isFilterOpened;

    const grid = this.dataGrid?.instance; // Assuming you have @ViewChild('dataGrid') dataGrid: DxDataGridComponent;

    if (grid) {
      grid.option('filterRow.visible', this.isFilterOpened);
      grid.option('headerFilter.visible', this.isFilterOpened);
    }
  }
  onToolbarPreparing(e: any) {
    const toolbarItems = e.toolbarOptions.items;

    // Avoid adding the button more than once
    const alreadyAdded = toolbarItems.some(
      (item: any) => item.name === 'toggleFilterButton'
    );
    if (!alreadyAdded) {
      toolbarItems.splice(toolbarItems.length - 1, 0, {
        widget: 'dxButton',
        name: 'toggleFilterButton', // custom name to avoid duplicates
        location: 'after',
        options: {
          icon: 'filter',
          hint: 'Search Column',
          onClick: () => this.toggleFilters(),
        },
      });
    }
  }


  // ==========================Employeee drpdown========================
  get_advanceType_dropdown() {
    this.dataService.Dropdown_AdvanceTypes(name).subscribe((res: any) => {
      console.log(res);
      this.ADVANCETYPE_VALUE = res;
      console.log(this.ADVANCETYPE_VALUE);
    });
  }
  onEmployee_Change(event: any) {
    this.emp_id = event.value;
    console.log(this.emp_id);
  }
  onAdvance_type_Change(event: any) {
    this.adv_type_id_value = event.value;
    console.log(this.adv_type_id_value, 'IN EVENT');
  }
  onRecoveryDateChanged(event: any): void {
    if (event?.value) {
      const selected = new Date(event.value);

      // Create a date using only year and month, and set time to 00:00:00 UTC
      const normalizedDate = new Date(
        Date.UTC(selected.getFullYear(), selected.getMonth(), 1)
      );

      // Set it to the form
      this.formSource.get('Recovery_Date')?.setValue(normalizedDate);
    }
  }

  OnDescInput(e: any) {
    const Description = e.value;
    this.formSource.get('print_Description')?.setValue(Description);
  }

  onNetAmountUpdateChange(): void {
    this.calculateInstallmentAmountUpdate();
  }

  // Triggered when the number of installments changes
  onInstallmentCountChange(): void {
    this.calculateInstallmentAmountUpdate();
  }

  // Function to calculate installment amount
  calculateInstallmentAmountUpdate(): void {
    if (this.reco_inst_count_value && this.reco_Amount_value) {
      this.reco_install_Amount_value = parseFloat(
        (this.reco_Amount_value / this.reco_inst_count_value).toFixed(2)
      );
    } else {
      this.reco_install_Amount_value = 0; // Set to 0 if values are invalid
    }
  }


  getAdvanceTypeName(id: any): string {
    const item = this.ADVANCETYPE_VALUE.find((x) => x.ID === id);
    return item ? item.DESCRIPTION : this.adv_type_name || 'Unknown Type';
  }

 
  paymentModesValue(event: any) {
    console.log(event.value);
    console.log(this.selectedPaymentMode)
    this.ledgerlist()
  }

  ledgerlist(){
    this.dataService.listledgerlist().subscribe((res: any) => {
      console.log(res);
      // this.payment_Detilas = res;

const filterdledgerlist=res.Data
      console.log(filterdledgerlist.filter(item => item.GROUP_ID == this.selectedPaymentMode));
      
      this.payment_Detilas=filterdledgerlist.filter(item => item.GROUP_ID == this.selectedPaymentMode);
      console.log(this.payment_Detilas, 'Payment Details');
    });


  }

   


  deleteData(event: any) {
    const id = event.data.ID;
    this.dataService.Api_Delete_advance(id).subscribe((res: any) => {
      console.log(res);
      notify(
        {
          message: 'Advance Deleted successfully',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success'
      );
      this.get_advance_list();
      this.isLoading = false;
    });
  }
  close() {
    this.isviewpopup = false;
    this.isAddPopUp = false;
    this.verifiedAdvancePopUp = false;
    this.approveAdvancePopUp = false;
    this.isEditPopUp = false;
    console.log('close buttom clicked======================');
    this.isFormSubmitted = false; 
    this.isAddPopUp = false;
    this.formSource.reset({
      Recovery_Date:'',
      Date: new Date(),
      emp_id:0,
      adv_type_id:0,
    })
     this.reco_Amount_value = 0
      this.reco_stat_month= " "
      this.employee_ID=0
      this.emp_id=0
      
   
  }

  closeButton() { 
    console.log('on Hiding close buttom clicked======================');
    
    this.formSource.reset({
      Date: new Date(),
    Recovery_Date:''
  })
 }
  // onNetAmountChanged(): void {
  //   this.updateInstallmentCalculation();
  // }

  // onInstallmentCountChanged(): void {
  //   this.updateInstallmentCalculation();
  // }

  // updateInstallmentCalculation(): void {
  //   const amount = this.selected_Data.REC_AMOUNT;
  //   const count = this.selected_Data.REC_INSTALL_COUNT;

  //   if (amount && count && count > 0) {
  //     this.selected_Data.REC_INSTALL_AMOUNT = parseFloat(
  //       (amount / count).toFixed(2)
  //     );
  //   } else {
  //     this.selected_Data.REC_INSTALL_AMOUNT = 0;
  //   }
  // }

  // ====================Verify============================

  // onVerifyClick(e: any): void {
  //   console.log('Verify clicked:', e); // <-- Add this

  //   e.cancel = true;
  //   const id = e.row?.data?.ID;

  //   this.dataService.select_Advance(id).subscribe((res: any) => {
  //     // console.log('Salary revision fetched:', response); // <-- Add this
  //     console.log(res, '=============Response of Data for verify====');

  //     this.selected_Data = res;
  //     console.log(this.selected_Data, 'Selected Data');
  //     if (this.selected_Data.DATE) {
  //       const parts = this.selected_Data.DATE.split('/');
  //       if (parts.length === 3) {
  //         const day = +parts[0];
  //         const month = +parts[1] - 1; // JavaScript months are 0-based
  //         let year = +parts[2];
  //         // Fix 2-digit year like 24 → 2024
  //         year += year < 100 ? 2000 : 0;
  //         this.date_value = new Date(year, month, day);
  //       } else {
  //         this.date_value = null;
  //       }
  //     } else {
  //       this.date_value = null;
  //     }
  //     this.verifiedAdvancePopUp = true;
  //   });
  // }

  // ===================Approved functionality===========================
  // Verify_advance() {
  //   console.log('===========Form verify advance=======');

  //   const id = this.selected_Data.ID;
  //   const emp_id = this.selected_Data.EMP_ID;
  //   const date = this.date_value;
  //   const adv_type_id = this.selected_Data.ADV_TYPE_ID;
  //   const advance_Amount = this.selected_Data.ADVANCE_AMOUNT;
  //   const rec_amount = this.selected_Data.REC_AMOUNT;
  //   const rec_start_month = this.selected_Data.REC_START_MONTH;
  //   const rec_install_count = this.selected_Data.REC_INSTALL_COUNT;
  //   const rec_install_amount = this.selected_Data.REC_INSTALL_AMOUNT;
  //   const remarks = this.selected_Data.REMARKS;
  //   console.log(id, emp_id);

  //   this.dataService
  //     .api_Verify_Advance(
  //       id,
  //       emp_id,
  //       date,
  //       adv_type_id,
  //       advance_Amount,
  //       rec_amount,
  //       rec_start_month,
  //       rec_install_count,
  //       rec_install_amount,
  //       remarks
  //     )
  //     .subscribe((res: any) => {
  //       console.log(res);
  //       this.get_advance_list();
  //       notify(
  //         {
  //           message: 'Advance Verified successfully',
  //           position: { at: 'top right', my: 'top right' },
  //           displayTime: 500,
  //         },
  //         'success'
  //       );
  //       this.verifiedAdvancePopUp = false;
  //       this.formSource.reset({
  //         Date: new Date()
  //       });
  //     });
  // }

  // ======================Aproverd===========================
  // onApproveClick(e: any) {
  //   console.log('Approve clicked:', e); // <-- Add this

  //   e.cancel = true;
  //   const id = e.row?.data?.ID;

  //   this.dataService.select_Advance(id).subscribe((res: any) => {
  //     // console.log('Salary revision fetched:', response); // <-- Add this
  //     console.log(res, '=============Response of Data for Approved====');

  //     this.selected_Data = res;
  //     console.log(this.selected_Data, 'Selected Data');
  //     if (this.selected_Data.DATE) {
  //       const parts = this.selected_Data.DATE.split('/');
  //       if (parts.length === 3) {
  //         const day = +parts[0];
  //         const month = +parts[1] - 1; // JavaScript months are 0-based
  //         let year = +parts[2];
  //         // Fix 2-digit year like 24 → 2024
  //         year += year < 100 ? 2000 : 0;
  //         this.date_value = new Date(year, month, day);
  //       } else {
  //         this.date_value = null;
  //       }
  //     } else {
  //       this.date_value = null;
  //     }
  //     this.approveAdvancePopUp = true;
  //   });
  // }
  // Approve_advance() {
  //   console.log('===========Form verify advance=======');

  //   const id = this.selected_Data.ID;
  //   const emp_id = this.selected_Data.EMP_ID;
  //   const date = this.date_value;
  //   const adv_type_id = this.selected_Data.ADV_TYPE_ID;
  //   const advance_Amount = this.selected_Data.ADVANCE_AMOUNT;
  //   const rec_amount = this.selected_Data.REC_AMOUNT;
  //   const rec_start_month = this.selected_Data.REC_START_MONTH;
  //   const rec_install_count = this.selected_Data.REC_INSTALL_COUNT;
  //   const rec_install_amount = this.selected_Data.REC_INSTALL_AMOUNT;
  //   const remarks = this.selected_Data.REMARKS;
  //   console.log(id, emp_id);

  //   this.dataService
  //     .api_Approve_Advance(
  //       id,
  //       emp_id,
  //       date,
  //       adv_type_id,
  //       advance_Amount,
  //       rec_amount,
  //       rec_start_month,
  //       rec_install_count,
  //       rec_install_amount,
  //       remarks
  //     )
  //     .subscribe((res: any) => {
  //       console.log(res);
  //       notify(
  //         {
  //           message: 'Advance approved successfully',
  //           position: { at: 'top right', my: 'top right' },
  //           displayTime: 500,
  //         },
  //         'success'
  //       );
  //       this.get_advance_list();
  //       this.approveAdvancePopUp = false;
  //     });
  // }

  //=====================payemt functionality=========================
  // payment_functionality() {
  //   const id=this.trans_id
  //   console.log(id, '=================id====================');
    
  //   console.log('payment functionality');
  //   this.dataService.get_paymentDetails(id).subscribe((res: any) => {
  //     console.log(res);

  //     this.payment_Detilas=res
  //   });
      
  // }

  //====================min date for update validation=========================
  onDateValueChanged(e: any): void {
    this.date_value = e.value;
  
    if (this.date_value) {
      // Set minDateUpdate to the 1st day of the next month
      const d = new Date(this.date_value);
      this.minDateUpdate = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    }
  }
  getStatusFlagClass(status: string): string {
    switch (status) {
      case 'Open': return 'flag-open';       // White or gray
      case 'Verified': return 'flag-verified'; // Orange
      case 'Approved': return 'flag-approved'; // Green
      default: return '';
    }
  }
}

@NgModule({
  imports: [
    DxDataGridModule,
    DxToolbarModule,
    DxButtonModule,
    FormPopupModule,
    FormTextboxModule,
    DxPopupModule,
    DxFormModule,
    DxTextBoxModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    ReactiveFormsModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxValidatorModule,
    CommonModule,
    DxRadioGroupModule 
  ],
  providers: [],
  exports: [ViewSalaryAdvanceComponent],
  declarations: [ViewSalaryAdvanceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ViewSalaryAdvanceModule {}
