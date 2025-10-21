import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
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
import { confirm } from 'devextreme/ui/dialog';
import { Router } from '@angular/router';
@Component({
  selector: 'app-advance',
  templateUrl: './advance.component.html',
  styleUrls: ['./advance.component.scss'],
})
export class AdvanceComponent {
    @ViewChild('formValidationGroup', { static: false }) formValidationGroup: DxValidationGroupComponent;
  
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
  selected_Data: any = [];
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
  approveValue: boolean = false;
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
    // {
    //   hint: 'Verify',
    //   icon: 'check',
    //   text: 'Verify',
    //   onClick: (e) => {
    //     setTimeout(() => this.onVerifyClick(e));
    //   },
    //   visible: (e) =>
    //     e.row.data.STATUS !== 'Approved' && e.row.data.STATUS !== 'Verified',
    // },
    // {
    //   hint: 'Approve',
    //   icon: 'check',
    //   text: 'Approve',
    //   onClick: (e) => {
    //     setTimeout(() => this.onApproveClick(e));
    //   },
    //   visible: (e) => e.row.data.STATUS === 'Verified',
    // },
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
  addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.add_pop());
    },
    elementAttr: { class: 'add-button' }
  };
  isEditReadOnly: boolean = false;
  selectedpayid: any;
  selected_pay_type_id: any;
  isFilterOpened: boolean;
  auto: string = 'auto';
   isFilterRowVisible: boolean = false;
isReadOnlyReceipt:boolean=false
 canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;


gridButtons = [
  'edit',
  {
    name: 'delete',
    visible: (e: any) => e.row?.data?.STATUS?.trim() === 'Open'
  }
];
  selected_Company_id: any;
  constructor(private fb: FormBuilder, private dataService: DataService,private ngZone: NgZone,private cdr:ChangeDetectorRef,private router: Router) {
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


        toggleFilterRow = () => {
    this.isFilterRowVisible = !this.isFilterRowVisible;
    this.cdr.detectChanges();
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
       this.get_advance_list()
      
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
//===============refresh data=========================
  refreshData() {
    this.dataGrid.instance.refresh();
  }
  onAmountInput(e: any) {
    const amount = e.value;
    this.formSource.get('Net_Amount_recoverd')?.setValue(amount);
  }

  //=================Add Pop up=========================
  add_pop() {
    this.isAddPopUp = true;
         setTimeout(() => {
      this.formValidationGroup?.instance?.reset();
    });
    
   
  }
  onApprovedChanged(event: any) {
    console.log(event,'======function chngeeeeeee===')
     console.log(this.approveValue,'======function chngeeeeeee===')
    
    // const isChecked = event.value;
    // if (isChecked) {
    //   this.approveAdvancePopUp = true;
    // } else {
    //   this.approveAdvancePopUp = false;
    // }
  }
  // Add a class variable to track first load
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
    
    this.select_api_Advance(e);
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
    // Set minDate to the 1st day of the next month
    this.minDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const currentUrl = this.router.url;
    console.log('Current URL:', currentUrl);
    const menuResponse = JSON.parse(
      sessionStorage.getItem('savedUserData') || '{}'
    );
    console.log('Parsed ObjectData:', menuResponse);

    const menuGroups = menuResponse.MenuGroups || [];
    console.log('MenuGroups:', menuGroups);
    const packingRights = menuGroups
      .flatMap((group) => group.Menus)
      .find((menu) => menu.Path === '/salary-advance');

    if (packingRights) {
      this.canAdd = packingRights.CanAdd;
      this.canEdit = packingRights.CanEdit;
      this.canDelete = packingRights.CanDelete;
      this.canPrint = packingRights.CanEdit;
      this.canView = packingRights.canView;
      this.canApprove = packingRights.canApprove;
    }

    console.log('packingRights', packingRights);
    console.log(this.canAdd, this.canEdit, this.canDelete);
    this.get_advance_list()
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





  // onToolbarPreparing(e: any) {
  //   const toolbarItems = e.toolbarOptions.items;

  //   // Avoid adding the button more than once
  //   const alreadyAdded = toolbarItems.some(
  //     (item: any) => item.name === 'toggleFilterButton'
  //   );
  //   if (!alreadyAdded) {
  //     toolbarItems.splice(toolbarItems.length - 1, 0, {
  //       widget: 'dxButton',
  //       name: 'toggleFilterButton', // custom name to avoid duplicates
  //       location: 'after',
  //       options: {
  //         icon: 'filter',
  //         hint: 'Search Column',
  //         onClick: () => this.toggleFilterRow(),
  //       },
  //     });
  //   }
  // }


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
  
  sesstion_Details(){
    const sessionData= JSON.parse(sessionStorage.getItem('savedUserData'))
    console.log(sessionData,'=================session data==========')
    this.selected_Company_id=sessionData.SELECTED_COMPANY.COMPANY_ID
    console.log(this.selected_Company_id,'============selected_Company_id==============')
//     this.selected_fin_id=sessionData.FINANCIAL_YEARS[0].FIN_ID
//     console.log(this.selected_fin_id,'===========selected fin id===================')
//     
  }
  //  =====================================Add advance========================
  Add_Advace() {
    console.log('Add button clicked');
    console.log(this.formSource);
    const emp_id = this.formSource.value.employee_ID;
    const date = this.formSource.value.Date;
    const adv_type_id = this.formSource.value.Advance_types_ID;
    const advance_Amount = this.formSource.value.Amount;
    const rec_amount = this.formSource.value.Net_Amount_recoverd;
    const rec_start_month = this.formSource.value.Recovery_Date;
    const rec_install_count = this.formSource.value.No_installments;
    const rec_install_amount = this.formSource.value.installmen_amt;
    const remarks = this.formSource.value.Remarks;
   const company_id=this.selected_Company_id
    // if (!emp_id || !date || !adv_type_id || !advance_Amount) {
    //   // Handle validation error here
    //   notify(
    //     {
    //       message: 'Please fill all the fields',
    //       position: { at: 'top right', my: 'top right' },
    //       displayTime: 500,
    //     },
    //     'error'
    //   );
    // } else {
  //       const validationResult = this.formValidationGroup?.instance?.validate();
  // if (!validationResult?.isValid) {
  //   console.log('Validation failed');
  //   return;
  // }
  
      this.dataService
        .Api_Add_advance(
          emp_id,
          date,
          adv_type_id,
          advance_Amount,
          rec_amount,
          rec_start_month,
          rec_install_count,
          rec_install_amount,
          remarks,
          company_id
        )
        .subscribe((res: any) => {
          console.log(res);

          notify(
            {
              message: 'Advance added successfully',
              position: { at: 'top right', my: 'top right' },
              displayTime: 500,
            },
            'success'
          );
          this.get_advance_list();
          this.isAddPopUp = false;
          this.formSource.reset({
            Date: new Date()
          });

        });
  
  }

  getAdvanceTypeName(id: any): string {
    const item = this.ADVANCETYPE_VALUE.find((x) => x.ID === id);
    return item ? item.DESCRIPTION : this.adv_type_name || 'Unknown Type';
  }

  select_api_Advance(event: any) {
    console.log(event);

    const id = event.data.TRANS_ID;

    this.dataService.select_Advance(id).subscribe((res: any) => {
      console.log(res);

      this.selected_Data = res;
      console.log(this.selected_Data, 'SELECTEDDTA============================= ');

      this.id = this.selected_Data.ID;

      this.Advance_Amount_value = this.selected_Data.ADVANCE_AMOUNT;
      this.adv_no_value = this.selected_Data.ADV_NO;
      this.adv_type_id_value = this.selected_Data.ADV_TYPE_ID;
      this.adv_type_name = this.selected_Data.ADV_TYPE_NAME;
      console.log(this.adv_type_name, 'ADVANCENAME');
      console.log(this.selected_Data.DATE)
      this.date_value=this.selected_Data.DATE
      this.Payment_Head=this.selected_Data.PAY_HEAD_ID
      console.log(this.Payment_Head, 'Payment Head ID');
      this.selectTransId=this.selected_Data.TRANS_ID
      this.selected_Cheque_No=this.selected_Data.CHEQUE_NO
      this.selected_Cheque_Date=this.selected_Data.CHEQUE_DATE
      this.selected_pay_type_id=this.selected_Data.PAY_TYPE_ID


if (this.selected_pay_type_id === 0 || this.selected_pay_type_id === 1) {
  this.selectedPaymentMode = '13'; // Cash
} else {
  this.selectedPaymentMode = '14'; // Bank
}
 
      // console.log(this.selectTransId, 'Transaction ID');
//       if (this.selected_Data?.DATE) {
//   const parts = this.selected_Data.DATE.split('/');
//   if (parts.length === 3) {
//     const day = +parts[0];
//     const month = +parts[1] - 1; // JS months are 0-based
//     let year = +parts[2];
//     year += year < 100 ? 2000 : 0; // Handle 2-digit years
//     this.date_value = new Date(year, month, day); // Set time to 18:30:00 if needed
//   } else {
//     this.date_value = null;
//   }
// } else {
//   this.date_value = null;
// }

console.log(this.date_value); // Outputs: 2025-05-10T13:00:00.000Z (depending on timezone)

      // if (this.selected_Data.DATE) {
      //   const parts = this.selected_Data.DATE.split('/');
      //   if (parts.length === 3) {
      //     const day = +parts[0];
      //     const month = +parts[1] - 1; // JavaScript months are 0-based
      //     let year = +parts[2];
      //     // Fix 2-digit year like 24 → 2024
      //     year += year < 100 ? 2000 : 0;
      //     this.date_value = new Date(year, month, day);
      //   } else {
      //     this.date_value = null;
      //   }
      // } else {
      //   this.date_value = null;
      // }
      // console.log(this.date_value, 'this.date_value');
      this.emp_id = this.selected_Data.EMP_ID;
      this.emp_name_value = this.selected_Data.EMP_NAME;
      this.reco_Amount_value = this.selected_Data.REC_AMOUNT;
      this.reco_install_Amount_value = this.selected_Data.REC_INSTALL_AMOUNT;
      this.reco_inst_count_value = this.selected_Data.REC_INSTALL_COUNT;
      this.reco_stat_month = this.selected_Data.REC_START_MONTH;
      this.remark_value = this.selected_Data.REMARKS;
      this.trans_id=this.selected_Data.TRANS_ID
      this.selectedpayid=this.selected_Data.PAY_TYPE_ID
      console.log(this.remark_value, ' this.remark_value');
      this.approveValue = this.selected_Data.STATUS === 'Approved';

        this.recoverd_Amt_value = this.selected_Data.RECOVERED_AMOUNT;

        console.log(this.selected_Data.PAY_TYPE_ID,'=======PAY TYPE ID===========')
        console.log(
        this.Advance_Amount_value,
        this.adv_no_value,
        this.adv_type_id_value,
        this.date_value,
        this.emp_id,
        this.emp_name_value,
        this.reco_Amount_value,
        this.reco_install_Amount_value,
        this.reco_inst_count_value,
        this.reco_stat_month,
        this.remark_value
      );
      // this.payment_functionality() 
    });
   
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


  //    const filtered = this.payment_Detilas.filter(item => allowedGroupIds.includes(item.GROUP_ID));
  // console.log('Filtered Items:', filtered);
  }
  //  =======================Update Advance=================================
  // ======================Delete data in advance===========================


Update_advance() {
  this.isFormSubmitted = true;

  const id = this.id;
  const emp_id = this.emp_id;
  const date = this.date_value;
  const adv_type_id = this.adv_type_id_value;
  const advance_Amount = this.Advance_Amount_value;
  const rec_amount = this.reco_Amount_value;
  const rec_start_month = this.reco_stat_month;
  const rec_install_count = this.reco_inst_count_value;
  const rec_install_amount = this.reco_install_Amount_value;
  const remarks = this.remark_value;
  const pay_head_id = this.Payment_Head;
  const trans_id = this.selectTransId;
  const cheque_no =this.selected_Cheque_No
  const cheque_date = this.selected_Cheque_Date;

this.selected_pay_type_id = this.selectedPaymentMode === '13'
  ? 1
  : this.selectedPaymentMode === '14'
    ? 2
    : this.selected_pay_type_id;
  console.log(this.selected_pay_type_id,'=====================selected pay type id============')
  const pay_Type_id=this.selected_pay_type_id
  console.log(this.selectTransId, 'Transaction ID');
  console.log
  if (!emp_id || !date || !adv_type_id || !advance_Amount) {
    notify(
      {
        message: 'Please fill all the required fields.',
        position: { at: 'top right', my: 'top right' },
        displayTime: 500,
      },
      'error'
    );
    this.isEditPopUp = true;
    return;
  }

  if (this.approveValue === true) {
    confirm(
      'It will approve and commit. Are you sure you want to commit?',
      'Confirm Commit'
    ).then((result) => {
      if (result) {
        this.dataService
          .Api_Approve_advance(
            id,
            emp_id,
            date,
            adv_type_id,
            advance_Amount,
            rec_amount,
            rec_start_month,
            rec_install_count,
            rec_install_amount,
            remarks,
            pay_head_id,
            trans_id,
            cheque_no,
            cheque_date,
            pay_Type_id
          )
          .subscribe((res: any) => {
            console.log('Approved & Committed:', res);
            notify(
              {
                message: 'Advance approved and committed successfully',
                position: { at: 'top right', my: 'top right' },
                displayTime: 500,
              },
              'success'
            );
            // this.resetFormAfterUpdate();
            this.isEditPopUp = false;
            this.get_advance_list();
          });
      } else {
        notify('Approval cancelled.', 'info', 2000);
      }
    });
  } else {
  
    console.log( id,
        emp_id,
        date,
        adv_type_id,
        advance_Amount,
        rec_amount,
        rec_start_month,
        rec_install_count,
        rec_install_amount,
        remarks, 
        pay_head_id,
        trans_id,
        cheque_no,
        cheque_date,'=============Update Advance Data=============');
          
    this.dataService
      .Api_Update_advance(
          id,
            emp_id,
            date,
            adv_type_id,
            advance_Amount,
            rec_amount,
            rec_start_month,
            rec_install_count,
            rec_install_amount,
            remarks,
            pay_head_id,
            trans_id,
            cheque_no,
            cheque_date,
            pay_Type_id
      )
      .subscribe((res: any) => {
        console.log('Updated:', res);
        notify(
          {
            message: 'Advance updated successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success'
        );
        // this.resetFormAfterUpdate();
        this.isEditPopUp=false
      });
  }
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
  onNetAmountChanged(): void {
    this.updateInstallmentCalculation();
  }

  onInstallmentCountChanged(): void {
    this.updateInstallmentCalculation();
  }

  updateInstallmentCalculation(): void {
    const amount = this.selected_Data.REC_AMOUNT;
    const count = this.selected_Data.REC_INSTALL_COUNT;

    if (amount && count && count > 0) {
      this.selected_Data.REC_INSTALL_AMOUNT = parseFloat(
        (amount / count).toFixed(2)
      );
    } else {
      this.selected_Data.REC_INSTALL_AMOUNT = 0;
    }
  }

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
  Verify_advance() {
    console.log('===========Form verify advance=======');

    const id = this.selected_Data.ID;
    const emp_id = this.selected_Data.EMP_ID;
    const date = this.date_value;
    const adv_type_id = this.selected_Data.ADV_TYPE_ID;
    const advance_Amount = this.selected_Data.ADVANCE_AMOUNT;
    const rec_amount = this.selected_Data.REC_AMOUNT;
    const rec_start_month = this.selected_Data.REC_START_MONTH;
    const rec_install_count = this.selected_Data.REC_INSTALL_COUNT;
    const rec_install_amount = this.selected_Data.REC_INSTALL_AMOUNT;
    const remarks = this.selected_Data.REMARKS;
    console.log(id, emp_id);

    this.dataService
      .api_Verify_Advance(
        id,
        emp_id,
        date,
        adv_type_id,
        advance_Amount,
        rec_amount,
        rec_start_month,
        rec_install_count,
        rec_install_amount,
        remarks
      )
      .subscribe((res: any) => {
        console.log(res);
        this.get_advance_list();
        notify(
          {
            message: 'Advance Verified successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success'
        );
        this.verifiedAdvancePopUp = false;
        this.formSource.reset({
          Date: new Date()
        });
      });
  }

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
  Approve_advance() {
    console.log('===========Form verify advance=======');

    const id = this.selected_Data.ID;
    const emp_id = this.selected_Data.EMP_ID;
    const date = this.date_value;
    const adv_type_id = this.selected_Data.ADV_TYPE_ID;
    const advance_Amount = this.selected_Data.ADVANCE_AMOUNT;
    const rec_amount = this.selected_Data.REC_AMOUNT;
    const rec_start_month = this.selected_Data.REC_START_MONTH;
    const rec_install_count = this.selected_Data.REC_INSTALL_COUNT;
    const rec_install_amount = this.selected_Data.REC_INSTALL_AMOUNT;
    const remarks = this.selected_Data.REMARKS;
    console.log(id, emp_id);

    this.dataService
      .api_Approve_Advance(
        id,
        emp_id,
        date,
        adv_type_id,
        advance_Amount,
        rec_amount,
        rec_start_month,
        rec_install_count,
        rec_install_amount,
        remarks
      )
      .subscribe((res: any) => {
        console.log(res);
        notify(
          {
            message: 'Advance approved successfully',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'success'
        );
        this.get_advance_list();
        this.approveAdvancePopUp = false;
      });
  }

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
      default: return '';
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
  exports: [],
  declarations: [AdvanceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdvanceModule {}