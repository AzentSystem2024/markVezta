import { CommonModule } from '@angular/common';
import { Component, NgModule, ViewChild } from '@angular/core';
import { DxButtonModule, DxCheckBoxModule, DxDataGridComponent, DxDataGridModule, DxDateBoxModule, DxFormModule, DxNumberBoxModule, DxPopupModule, DxRadioGroupModule, DxSelectBoxModule, DxTextBoxModule, DxValidatorModule } from 'devextreme-angular';
import { FormPopupModule } from 'src/app/components';
import { FormBuilder , ReactiveFormsModule,FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DataService } from 'src/app/services';
import { name } from '@devexpress/analytics-core/analytics-diagram';
import notify from 'devextreme/ui/notify';



@Component({
  selector: 'app-employee-leave',
  templateUrl: './employee-leave.component.html',
  styleUrls: ['./employee-leave.component.scss']
})
export class EmployeeLeaveComponent {
  VerifyPopup: boolean;
  ApprovePopup: boolean;
  ExistingEmployee: any=[]
  selectedData: any={};
  LeaveType: any;
  Employee: any;
ViewPopup: boolean;
Is_ticket: any;
  Left_service: any;
  TravelPopup: boolean;
RejoinPopup: boolean;
selectedStatusType: string = '';
  selectedData1: number;
isTravelled: boolean = false; // or use true/false based on your data
StatusType = ['Rejoined', 'Left Service'];
EmployeeDetails:any =[]
  Leave_credit: any;
  existingLeave:any =[]
  ExisitngDeparture: any;
  ExistingReturn: any;

      //========================STATUS====================

  onVerifyClick(e: any): void {
   e.cancel = true;
   e.cancel = true;
   const employeeId = e.row?.data?.ID;
 
   if (!employeeId) {
     console.warn('No Employee ID found in row data');
     return;
   }
 
   this.dataservice.Select_EmployeeLeave_Api(employeeId).subscribe((response: any) => {
     console.log('Salary revision fetched:', response); // <-- Add this
 
     this.selectedData = response; 
     this.VerifyPopup = true;
   });
  }

  onApproveClick(e: any): void {
    e.cancel = true;
    const employeeId = e.row?.data?.ID;
  
    if (!employeeId) {
      console.warn('No Employee ID found in row data');
      return;
    }
  
    this.dataservice.Select_EmployeeLeave_Api(employeeId).subscribe((response: any) => {
      console.log('Salary revision fetched:', response); // <-- Add this
  
      this.selectedData = response; 
      this.ApprovePopup = true;
    }
  );
  }

  onTravelClick(e: any): void {
    e.cancel = true;
    const employeeId = e.row?.data?.ID;
  
    if (!employeeId) {
      console.warn('No Employee ID found in row data');
      return;
    }
  
    this.dataservice.Select_EmployeeLeave_Api(employeeId).subscribe((response: any) => {
      console.log('Salary revision fetched:', response); // <-- Add this
  
      this.selectedData = response; 
      this.TravelPopup = true;
    }
  );
  }

  onRejoinClick(e: any): void {
    e.cancel = true;
    const employeeId = e.row?.data?.ID;
  
    if (!employeeId) {
      console.warn('No Employee ID found in row data');
      return;
    }
  
    this.dataservice.Select_EmployeeLeave_Api(employeeId).subscribe((response: any) => {
      console.log('Salary revision fetched:', response); // <-- Add this
  
      this.selectedData = response; 
      this.RejoinPopup = true;
    }
  );
  }

 @ViewChild(DxDataGridComponent,{ static: true }) dataGrid: DxDataGridComponent;
 
  AllEmployeeDetails:any =[]
  showFilterRow: boolean = true;
  currentFilter: string = 'auto';
  editingRowData: any = {}; // To store the selected row's data
  AddVacationPopup = false;
  UpdateVacationPopup = false;
  formData : any;
  Leave_type: any;
  Employee_no: any;
  formsource: FormGroup;
  EmployeeLeaveDatasource : any[] ;
  displayMode: any = 'full';

  constructor(private fb: FormBuilder, private dataservice: DataService) {
    this.formsource = this.fb.group({
      Doc_no: ['', Validators.required],
      Date: [new Date, Validators.required],
      Employee_no: ['', Validators.required],
      Employee_name: ['', Validators.required],
      Leave_type: ['', Validators.required],
      Leave_days: ['', Validators.required],
      Leave_credit: ['', Validators.required],
      Dept_date: ['', Validators.required],
      Expected_rejoin_date: ['', Validators.required],
      Remarks: ['', Validators.required],
      Leave_salary_payable: ['', Validators.required],
    // }, 
    });
  
    this.get_EmployeeLeaveList();
  this.get_Employee_Details();
  this.get_ExistingLeaveByEmployee();
    const UserID = sessionStorage.getItem('UserId');
    console.log(UserID, "user id");
  
//=====================AUTO FILL===================================

    this.formsource.get('Leave_days')?.valueChanges.subscribe((leaveDays) => {
      this.autofillExpectedRejoinDate();
    });
  
    this.formsource.get('Dept_date')?.valueChanges.subscribe((deptDate) => {
      this.autofillExpectedRejoinDate();
    });

    this.get_LeaveType_Dropdown_List();
    this.get_Employee_Dropdown_List();
    this.get_EOS_Dropdown_List();

     
}


 
//============================ICONS=================

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

      visible: (e) => e.row.data.STATUS !== 'Approved' && e.row.data.STATUS !== 'Travelled' && e.row.data.STATUS !== 'Rejoined' && e.row.data.STATUS !== 'Left Service',

    },

    {

      hint: 'Verify',

      icon: 'check',

      text: 'Verify',

      onClick: (e) => {

        setTimeout(() => this.onVerifyClick(e));

      },

      visible: (e) => e.row.data.STATUS !== 'Approved' && e.row.data.STATUS !== 'Verified' && e.row.data.STATUS !== 'Travelled' && e.row.data.STATUS !== 'Rejoined' && e.row.data.STATUS !== 'Left Service'

    },

    {

      hint: 'Approve',

      icon: 'check',

      text: 'Approve',

      onClick: (e) => {

        setTimeout(() => this.onApproveClick(e));

      },

      visible: (e) => e.row.data.STATUS === 'Verified'

    },

    {
      hint:'Travel',
      icon:'check',
      text:'Travel',
      onClick:(e) => {
        setTimeout(() => this.onTravelClick(e));
      },
      visible: (e) => e.row.data.STATUS === 'Approved'
    },

    {
      hint:'Rejoin',
      icon:'check',
      text:'Rejoin',
      onClick:(e) => {
        setTimeout(() => this.onRejoinClick(e));
      },
      visible: (e) => e.row.data.STATUS === 'Travelled'   
    },

  ];


  //====================AUTO FILL===================

  autofillExpectedRejoinDate() {
    const deptDate = this.formsource.get('Dept_date')?.value;
    const leaveDays = this.formsource.get('Leave_days')?.value;
  
    if (deptDate && leaveDays != null && leaveDays !== '') {
      const departure = new Date(deptDate);
      departure.setDate(departure.getDate() + parseInt(leaveDays, 10));

      // Set the calculated rejoin date
      this.formsource.get('Expected_rejoin_date')?.setValue(departure);
      
    }
  }

  calculateExpectedRejoinDate() {
    const leaveDays = this.selectedData.VAC_DAYS;
    const departureDate = new Date(this.selectedData.DEPT_DATE);
  
    if (leaveDays && departureDate instanceof Date && !isNaN(departureDate.getTime())) {
      const expectedRejoinDate = new Date(departureDate);
      expectedRejoinDate.setDate(departureDate.getDate() + leaveDays);
  
      this.selectedData.EXPECT_RETURN = expectedRejoinDate;
    }
  }
  
//================AUTO FILL REJOIN DATEE==============

// Inside your component
ngOnInit(): void {
  // Watch manually if using template-driven form
  Object.defineProperty(this.selectedData, 'REJOIN_DATE', {
    set: (newValue) => {
      this._REJOIN_DATE = newValue;
      this.calculateLeaveDaysTaken();
    },
    get: () => {
      return this._REJOIN_DATE;
    },
    configurable: true
  });


  const today = new Date();
    // Set minDate to the 1st day of the next month
};


// Backup for setter/getter
private _REJOIN_DATE: Date | null = null;

calculateLeaveDaysTaken(): void {
  const departure = new Date(this.selectedData.DEPT_DATE);
  const rejoin = new Date(this.selectedData.REJOIN_DATE);

  if (departure && rejoin && rejoin >= departure) {
    const diffTime = rejoin.getTime() - departure.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.selectedData.ACTUAL_DAYS = diffDays;
  } else {
    this.selectedData.ACTUAL_DAYS = null;
  }
}

//=======================================
minDate: Date;

//=====================================================================================================
  

today = new Date();


// Function to disable past dates
isDateDisabled = (data: { date: Date }) => {
  const date = data.date;

  // Check if the provided date is before today
  if (date <= this.today) {
    return true;  // Disable the date if it's today or in the past
  }

  return false;
}

//=============================  

  onEditingStart(event: any) {
    event.cancel = true;
    const statusValue=event.data.STATUS 
    const ID = event.data.ID;

    this.dataservice.Select_EmployeeLeave_Api(ID).subscribe((response: any) => {
      if (statusValue === 'Approved' ||  statusValue === 'Travelled' || statusValue === 'Rejoined' || statusValue === 'Left Service') {

        this.ViewPopup=true
      } else {
        this.UpdateVacationPopup=true
      }
    })
    this.selectedStatusType = event.data.StatusType;
    
    this.Select_EmployeeLeave(ID);
    console.log(this.selectedData, "selected data++++++++++++");
  }

  refresh = () => {
    this.dataGrid.instance.refresh();
  };
  



  closePopup(){
  this.formsource.reset();
  this.selectedStatusType = '';
  }
  
  getSerialNumber = (rowIndex: number) => {
    return rowIndex + 1;
  };
  
 Add_EmployeeLeave(){
    this.AddVacationPopup = true;
    this.formsource.reset({
      Id: null,
     
      Doc_no: '',
      Date: new Date(),
      Employee_no: '',
      Employee_name: '',
      Leave_type: '',
      Leave_days: '',
      Leave_credit: '',
      Dept_date : '',
      Expected_rejoin_date: '',
      Remarks: '',
      Leave_salary_payable: '',
    })
  }

  Update_EmployeeLeave(){
    this.UpdateVacationPopup = true;
  }

  Verify_EmployeeLeave(){
  this.VerifyPopup = true;
  }

  Approve_EmployeeLeave(){
  this.ApprovePopup = true;
  }

  View_EmployeeLeave( ){
    this.ViewPopup = true;
  
  }

//===================get data list========================
get_EmployeeLeaveList() {
  this.dataservice.get_EmployeeLeave_Api().subscribe((res: any) => {
    if (res) {
      this.EmployeeLeaveDatasource = res.data.map((item: any, index: any) => ({
        ...item,
        SlNo: index + 1, // Assign serial number
      }));
    }
    console.log(res,"response")
  });
}

onEmployee_Change(event:any){
  this.Employee_no = event.value; // assign selected value
  this.get_Employee_Details();
  console.log(this.Employee_no);
 this. get_ExistingLeaveByEmployee()//onEmployyee change work avumbo id kittum aa id kittitt athinnee ee functionill vilikkaa
}

get_Employee_Details(){
  console.log("function calling");
  
  const Id =  this.Employee_no
 console.log(Id , "Get Employee details ID");
 
  this.dataservice.get_EmployeeDetails_Api().subscribe((res:any)=>{
    console.log(res,'Details');

    this.AllEmployeeDetails = res
    console.log(this.AllEmployeeDetails,"Emp Details");

    const selectedEmployee = this.AllEmployeeDetails.find(item => item.ID === Id);
    console.log(selectedEmployee, "Filtered Employee");

    this.EmployeeDetails = selectedEmployee
    console.log(this.EmployeeDetails.LEAVE_CREDIT);
    this.Leave_credit=this.EmployeeDetails.LEAVE_CREDIT
    this.formsource.patchValue({
      Leave_credit: this.EmployeeDetails.LEAVE_CREDIT
    });
    
    
    
}) 

}

//===================DUPLICATION FOR VACATION===========================
get_ExistingLeaveByEmployee(){

  console.log('======get emp=============');
  
const id=this.Employee_no
console.log(id,'======id for datevalidation');
//ini ee id use cheyuthitt filter cheyuthitt 
 console.log(this.AllEmployeeDetails);
 this.dataservice.get_EmployeeLeave_Api().subscribe((res:any)=>{
  console.log(res);
  const datas=res.data
  console.log(datas);
  

 this.ExistingEmployee = datas.filter(item => item.EMP_ID== id);
  console.log(this.ExistingEmployee , "Existing Employee");
  this. ExisitngDeparture = this.ExistingEmployee[0]?.DEPT_DATE;
  this. ExistingReturn = this.ExistingEmployee[0]?.EXPECT_RETURN;
  
console.log(this.ExisitngDeparture,this.ExistingReturn);

  

 })
 
 
}
minSelectableDate: Date = new Date(); // Or any logic

isDateDisabledvalue = (data: { date: Date }) => {
  const dep = this.ExistingEmployee[0]?.DEPT_DATE;
  const ret = this.ExistingEmployee[0]?.EXPECT_RETURN;
  // const rejoinRaw = this.ExistingEmployee[0]?.REJOIN_DATE;


  if (!dep || !ret) return false;

  const depDate = new Date(dep);
  const retDate = new Date(ret);
  const current = data.date;
  // const rejoinDate = new Date(rejoinRaw)

  
  

  return current > depDate && current <= retDate;
 
};

autoFillExpectedRejoinDate() {
  const depRaw = this.ExistingEmployee[0]?.DEPT_DATE;
  const retRaw = this.ExistingEmployee[0]?.EXPECT_RETURN;

  if (!depRaw || !retRaw) return;

  const depDate = new Date(depRaw);
  const retDate = new Date(retRaw);

  let suggestedDate = new Date(); // Default to today

  // If suggested date overlaps with DEPT_DATE - EXPECT_RETURN range, adjust
  if (suggestedDate > depDate && suggestedDate <= retDate) {
    // Move it to the next day after EXPECT_RETURN
    suggestedDate = new Date(retDate);
    suggestedDate.setDate(suggestedDate.getDate() + 1);
  }

  this.formsource.get('Expected_rejoin_date')?.setValue(suggestedDate);
}
validateExpectedRejoin = (e: any) => {
  const value = e.value;
  const depRaw = this.ExistingEmployee[0]?.DEPT_DATE;
  const retRaw = this.ExistingEmployee[0]?.EXPECT_RETURN;

  if (!value || !depRaw || !retRaw) return true;

  const depDate = new Date(depRaw);
  const retDate = new Date(retRaw);
  const currentDate = new Date(value);

  return !(currentDate > depDate && currentDate <= retDate); // return false if overlapping
};

expectedRejoinDateValidator = (control: AbstractControl): ValidationErrors | null => {
  const value = new Date(control.value);
  const depRaw = this.ExistingEmployee[0]?.DEPT_DATE;
  const retRaw = this.ExistingEmployee[0]?.EXPECT_RETURN;

  if (!depRaw || !retRaw || !value) return null;

  const depDate = new Date(depRaw);
  const retDate = new Date(retRaw);

  const isOverlapping = value > depDate && value <= retDate;

  return isOverlapping ? { overlap: true } : null;
};

// isExpectedRejoinDateDisabled = (data: { date: Date }) => {
//   const expectReturnRaw = this.ExistingEmployee[0]?.EXPECT_RETURN;

//   if (!expectReturnRaw) return false;

//   const expectReturnDate = new Date(expectReturnRaw);
//   const current = data.date;

//   // Disable all dates on or before EXPECT_RETURN
//   return current <= expectReturnDate;
// // };
// isDepartureDateDisabled = (data: { date: Date }) => {
//   const deptRaw = this.ExistingEmployee[0]?.DEPT_DATE;
//   const rejoinRaw = this.ExistingEmployee[0]?.REJOIN_DATE;

//   if (!deptRaw) return false;

//   const deptDate = new Date(deptRaw);
//   const rejoinDate = rejoinRaw ? new Date(rejoinRaw) : null;
//   const current = data.date;

//   // If employee has rejoined, disable dates before or on the rejoin date
//   if (rejoinDate) {
//     return current <= rejoinDate;
//   }

//   // If not yet rejoined, disable dates after departure
//   return current >= deptDate;
// };



//===================STATUS FLAG========================

getStatusFlagClass(status: string): string {
  switch (status) {
    case 'Open': return 'flag-open';       // White or gray
    case 'Verified': return 'flag-verified'; // Orange
    case 'Approved': return 'flag-approved'; // Green
    case 'Travelled': return 'flag-travelled'; // Blue
    case 'Rejoined': return 'flag-rejoined'; // Yellow
    case 'Left Service': return 'flag-left-service'; // Red
    default: return '';
  }
}



//==================Add Employee Leave========================
  Add_Data(){
 
 
    
    const currentDate = new Date(); // Instead of today
    currentDate.setHours(0, 0, 0, 0);
    
    let errors: string[] = [];
    
    // Get the selected date from the form safely
    const formDate = this.formsource.get('Date')?.value; // <-- Renamed from "Date"
    const Dept_date = this.formsource.get('Dept_date')?.value;
    const Expected_rejoin_date = this.formsource.get('Expected_rejoin_date')?.value;
    

 console.log("Add Data function working");
 
    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    // const DateControl = this.formsource.get('Date')?.value;
    // const Date = DateControl ? this.formatDate(DateControl) : null;
  //  const Date = this.formsource.get('Date')?.value;
    const selectedDate = this.formsource.get('Date')?.value;
    const Employee_no = this.formsource.get('Employee_no')?.value;
    console.log(Employee_no, "Employee no+++++++++++++");
    const Leave_type = this.formsource.get('Leave_type')?.value;
    const Leave_days = this.formsource.get('Leave_days')?.value;
    const Leave_credit = this.formsource.get('Leave_credit')?.value;
    // const Dept_date = this.formsource.get('Dept_date')?.value;
    // const Expected_rejoin_date = this.formsource.get('Expected_rejoin_date')?.value;
    const Remarks = this.formsource.get('Remarks')?.value;
    const Leave_salary_payable = this.formsource.get('Leave_salary_payable')?.value;
console.log(User_Id,Store_Id,selectedDate,Employee_no,Leave_type,Leave_days,Leave_credit,Dept_date,Expected_rejoin_date,Remarks,Leave_salary_payable)   


    if(Employee_no && Leave_type && Leave_days  && Dept_date && Expected_rejoin_date){
    this.dataservice.Insert_EmployeeLeave_Api(User_Id,Store_Id,formDate,Employee_no,Leave_type,Leave_days,Leave_credit,Dept_date,Expected_rejoin_date,Remarks,Leave_salary_payable).subscribe((res: any) => {
      notify(
        {
          message: 'Data succesfully added',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success'
      );
      this.AddVacationPopup = false;
      this.formsource.reset();
      this.get_EmployeeLeaveList();
    });
  }

    else{
        notify(
          {
            message: 'Please fill the fields',
            position: { at: 'top right', my: 'top right' },
            displayTime: 500,
          },
          'error'
        );
        }  
        this.get_EmployeeLeaveList()

  }
  

  //==================Update Employee Leave========================
  Edit_Data() {
    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    const ID = this.selectedData.ID;
    const Date = this.selectedData.DOC_DATE;
    const Employee_ID = this.selectedData.EMP_ID;
    const Leave_type = this.selectedData.LEAVE_TYPE_ID;
    const Leave_days = this.selectedData.VAC_DAYS;
    const Leave_credit = this.selectedData.LEAVE_CREDIT;
    const Dept_date = this.selectedData.DEPT_DATE;
    const Expected_rejoin_date = this.selectedData.EXPECT_RETURN;
    const Remarks = this.selectedData.REMARKS;
    const Leave_salary_payable = this.selectedData.LS_PAYABLE;
    const Is_ticket = this.selectedData.IS_TICKET;
    const Last_rejoin_date = this.selectedData.LAST_REJOIN_DATE;
    const Travelled_date = this.selectedData.TRAVELLED_DATE;
    const Rejoin_date = this.selectedData.REJOIN_DATE;
    const Actual_days = this.selectedData.ACTUAL_DAYS;
    const Deduct_days = this.selectedData.DEDUCT_DAYS;
    const Left_reason = this.selectedData.LEFT_REASON;
    console.log(ID,'ID+++++++++++++');
    


this.dataservice.Update_EmployeeLeave_Api(User_Id,Store_Id,ID,Date,Employee_ID,Leave_type,Leave_days,Leave_credit,Dept_date,Expected_rejoin_date,Remarks,Leave_salary_payable,Is_ticket,Last_rejoin_date,Travelled_date,Rejoin_date,Actual_days,Deduct_days,Left_reason).subscribe((res:any)=>{
    console.log(res);
      notify(
                {
                  message: 'Data updated successfully',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success'
              );

              this.UpdateVacationPopup=false
    this.get_EmployeeLeaveList()
    this.autofillExpectedRejoinDate();
    
  })

    }
    
    
  //===================Verify Employee Leave========================
  Verify_Data() {
    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    const ID = this.selectedData.ID;
    const Date = this.selectedData.DOC_DATE;
    const Employee_ID = this.selectedData.EMP_ID;
    const Leave_type = this.selectedData.LEAVE_TYPE_ID;
    const Leave_days = this.selectedData.VAC_DAYS;
    const Leave_credit = this.selectedData.LEAVE_CREDIT;
    const Dept_date = this.selectedData.DEPT_DATE;
    const Expected_rejoin_date = this.selectedData.EXPECT_RETURN;
    const Remarks = this.selectedData.REMARKS;
    const Leave_salary_payable = this.selectedData.LS_PAYABLE;
    const Is_ticket = this.selectedData.IS_TICKET;
    const Last_rejoin_date = this.selectedData.LAST_REJOIN_DATE;
    const Travelled_date = this.selectedData.TRAVELLED_DATE;
    const Rejoin_date = this.selectedData.REJOIN_DATE;
    const Actual_days = this.selectedData.ACTUAL_DAYS;
    const Deduct_days = this.selectedData.DEDUCT_DAYS;
    const Left_reason = this.selectedData.LEFT_REASON;
    console.log(ID,'ID+++++++++++++');
    


this.dataservice.Verify_EmployeeLeave_Api(User_Id,Store_Id,ID,Date,Employee_ID,Leave_type,Leave_days,Leave_credit,Dept_date,Expected_rejoin_date,Remarks,Leave_salary_payable,Is_ticket,Last_rejoin_date,Travelled_date,Rejoin_date,Actual_days,Deduct_days,Left_reason).subscribe((res:any)=>{
    console.log(res);
      notify(
                {
                  message: 'Data updated successfully',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success'
              );
              this.UpdateVacationPopup=false
              this.VerifyPopup=false
    this.get_EmployeeLeaveList()
    
  })

    }


  //===================Approve Employee Leave========================
  Approve_Data() {
    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    const ID = this.selectedData.ID;
    const Date = this.selectedData.DOC_DATE;
    const Employee_ID = this.selectedData.EMP_ID;
    const Leave_type = this.selectedData.LEAVE_TYPE_ID;
    const Leave_days = this.selectedData.VAC_DAYS;
    const Leave_credit = this.selectedData.LEAVE_CREDIT;
    const Dept_date = this.selectedData.DEPT_DATE;
    const Expected_rejoin_date = this.selectedData.EXPECT_RETURN;
    const Remarks = this.selectedData.REMARKS;
    const Leave_salary_payable = this.selectedData.LS_PAYABLE;
    const Is_ticket = this.selectedData.IS_TICKET;
    const Last_rejoin_date = this.selectedData.LAST_REJOIN_DATE;
    const Travelled_date = this.selectedData.TRAVELLED_DATE;
    const Rejoin_date = this.selectedData.REJOIN_DATE;
    const Actual_days = this.selectedData.ACTUAL_DAYS;
    const Deduct_days = this.selectedData.DEDUCT_DAYS;
    const Left_reason = this.selectedData.LEFT_REASON;
    console.log(ID,'ID+++++++++++++');
    


this.dataservice.Approve_EmployeeLeave_Api(User_Id,Store_Id,ID,Date,Employee_ID,Leave_type,Leave_days,Leave_credit,Dept_date,Expected_rejoin_date,Remarks,Leave_salary_payable,Is_ticket,Last_rejoin_date,Travelled_date,Rejoin_date,Actual_days,Deduct_days,Left_reason).subscribe((res:any)=>{
    console.log(res);
      notify(
                {
                  message: 'Data updated successfully',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success'
              );

              this.ApprovePopup=false
    this.get_EmployeeLeaveList()
    
  })

    }


  //===================View Employee Leave========================
  View_Data() {
    

    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    const ID = this.selectedData.ID;
    const Date = this.selectedData.DOC_DATE;
    const Employee_ID = this.selectedData.EMP_ID;
    const Leave_type = this.selectedData.LEAVE_TYPE_ID;
    const Leave_days = this.selectedData.VAC_DAYS;
    const Leave_credit = this.selectedData.LEAVE_CREDIT;
    const Dept_date = this.selectedData.DEPT_DATE;
    const Expected_rejoin_date = this.selectedData.EXPECT_RETURN;
    const Remarks = this.selectedData.REMARKS;
    const Leave_salary_payable = this.selectedData.LS_PAYABLE;
    const Is_ticket = this.selectedData.IS_TICKET;
    const Last_rejoin_date = this.selectedData.LAST_REJOIN_DATE;
    const Travelled_date = this.selectedData.TRAVELLED_DATE;
    const Rejoin_date = this.selectedData.REJOIN_DATE;
    const Actual_days = this.selectedData.ACTUAL_DAYS;
    const Deduct_days = this.selectedData.DEDUCT_DAYS;
    const Left_reason = this.selectedData.LEFT_REASON;
    console.log(ID,'ID+++++++++++++');
    


this.dataservice.Update_EmployeeLeave_Api(User_Id,Store_Id,ID,Date,Employee_ID,Leave_type,Leave_days,Leave_credit,Dept_date,Expected_rejoin_date,Remarks,Leave_salary_payable,Is_ticket,Last_rejoin_date,Travelled_date,Rejoin_date,Actual_days,Deduct_days,Left_reason).subscribe((res:any)=>{
    console.log(res);
      notify(
                {
                  message: 'Data updated successfully',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success'
              );

              this.ViewPopup=false
    this.get_EmployeeLeaveList()
    
  })

}


  //===============get Dropdown List=======================
  get_LeaveType_Dropdown_List() {
    console.log('function working');
    
    this.dataservice.get_LeaveType_Dropdown_Api(name).subscribe((response: any) => {
      console.log(response, 'response++++++++++');
      this.LeaveType = response;
      console.log(this.LeaveType, 'LeaveType++++++++++');

      // this.Ledger = response.Hospitals;
    });
  }


  //=================get Employee dropdown list=================
  get_Employee_Dropdown_List() {
    console.log('function working');
    
    this.dataservice.get_Employee_Dropdown_Api('EMPLOYEES').subscribe((response: any) => {
      console.log(response, 'response++++++++++');
      this.Employee = response;
      console.log(this.Employee, 'Employee++++++++++');

      // this.Ledger = response.Hospitals;
    });
  }


  //=====================get EOS dropdown list===================
  get_EOS_Dropdown_List() {
    console.log('function working');
    
    this.dataservice.get_EOS_Dropdown_Api(name).subscribe((response: any) => {
      console.log(response, 'response++++++++++');
      this.Left_service = response;
      console.log(this.Left_service, 'Is_ticket++++++++++');

      // this.Ledger = response.Hospitals;
    });
  }


  Select_EmployeeLeave(event: any) {
    const ID = event;

    this.dataservice.Select_EmployeeLeave_Api(ID).subscribe((response: any) => {
      console.log(response, "select Api");
  
      // Convert LEFT_REASON to a number if needed (depends on your Left_service ID types)
      response.LEFT_REASON = Number(response.LEFT_REASON);
  
      this.selectedData = response;
      // Set the selected status type based on the response
   setTimeout(() => {
  this.selectedStatusType = this.selectedData.STATUS;
  }, 0)
  
      console.log(this.selectedData.LEFT_REASON, "Bound LEFT_REASON");

    });
  }


  Delete_Data(event:any){
    console.log(event,"delete event");
    
    const ID = event.data.ID
    this.dataservice.Delete_EmployeeLeave_Api(ID).subscribe((response:any)=>{
      notify(
        {
          message: 'Data succesfully deleted',
          position: { at: 'top right', my: 'top right' },
          displayTime: 500,
        },
        'success'
      );
      console.log(response,"response works");
    
      this.get_EmployeeLeaveList()
      
    })
  }

  Travel_Data(){
    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    const ID = this.selectedData.ID;
    const Date = this.selectedData.DOC_DATE;
    const Employee_ID = this.selectedData.EMP_ID;
    const Leave_type = this.selectedData.LEAVE_TYPE_ID;
    const Leave_days = this.selectedData.VAC_DAYS;
    const Leave_credit = this.selectedData.LEAVE_CREDIT;
    const Dept_date = this.selectedData.DEPT_DATE;
    const Expected_rejoin_date = this.selectedData.EXPECT_RETURN;
    const Remarks = this.selectedData.REMARKS;
    const Leave_salary_payable = this.selectedData.LS_PAYABLE;
    const Is_ticket = this.selectedData.IS_TICKET;
    const Last_rejoin_date = this.selectedData.LAST_REJOIN_DATE;
    const Travelled_date = this.selectedData.DEPT_DATE;
    const Rejoin_date = this.selectedData.REJOIN_DATE;
    const Actual_days = this.selectedData.ACTUAL_DAYS;
    const Deduct_days = this.selectedData.DEDUCT_DAYS;
    const Left_reason = this.selectedData.LEFT_REASON;
    console.log(ID,'ID+++++++++++++');
    


this.dataservice.Update_EmployeeLeave_Api(User_Id,Store_Id,ID,Date,Employee_ID,Leave_type,Leave_days,Leave_credit,Dept_date,Expected_rejoin_date,Remarks,Leave_salary_payable,Is_ticket,Last_rejoin_date,Travelled_date,Rejoin_date,Actual_days,Deduct_days,Left_reason).subscribe((res:any)=>{
    console.log(res);
      notify(
                {
                  message: 'Data updated successfully',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success'
              );

              this.TravelPopup=false
    this.get_EmployeeLeaveList()
    this.autofillExpectedRejoinDate();
    
  })

  }
  

  Rejoin_Data(){

    // this.selectedData.STATUS = this.selectedStatusType;
    // if (this.selectedStatusType == 'Rejoined') {
    //   this.formsource.value.REJOIN_DATE = true;
    //   this.formsource.value.LEFT_REASON = false;
    // }
    // if (this.selectedStatusType == 'Left Service') {
    //   this.formsource.value.REJOIN_DATE = false;
    //   this.formsource.value.LEFT_REASON = true;
    // }

    
    

    const User_Id = sessionStorage.getItem('UserId');
    const Store_Id = sessionStorage.getItem('StoreId');
    const ID = this.selectedData.ID;
    const CurrentDate = this.selectedData.DOC_DATE;
    const Employee_ID = this.selectedData.EMP_ID;
    const Leave_type = this.selectedData.LEAVE_TYPE_ID;
    const Leave_days = this.selectedData.VAC_DAYS;
    const Leave_credit = this.selectedData.LEAVE_CREDIT;
    const Dept_date = this.selectedData.DEPT_DATE;
    const Expected_rejoin_date = this.selectedData.EXPECT_RETURN;
    const Remarks = this.selectedData.REMARKS;
    const Leave_salary_payable = this.selectedData.LS_PAYABLE;
    const Is_ticket = this.selectedData.IS_TICKET;
    const Last_rejoin_date = this.selectedData.LAST_REJOIN_DATE;
    const Travelled_date = this.selectedData.DEPT_DATE;
    const Rejoin_date = this.selectedData.REJOIN_DATE;
    const Actual_days = this.selectedData.ACTUAL_DAYS;
    const Deduct_days = this.selectedData.DEDUCT_DAYS;
    const Left_reason = this.selectedData.LEFT_REASON;
    console.log(ID,'ID+++++++++++++');
    



this.dataservice.Update_EmployeeLeave_Api(User_Id,Store_Id,ID,CurrentDate,Employee_ID,Leave_type,Leave_days,Leave_credit,Dept_date,Expected_rejoin_date,Remarks,Leave_salary_payable,Is_ticket,Last_rejoin_date,Travelled_date,Rejoin_date,Actual_days,Deduct_days,Left_reason).subscribe((res:any)=>{
    console.log(res);
      notify(
                {
                  message: 'Data updated successfully',
                  position: { at: 'top right', my: 'top right' },
                  displayTime: 500,
                },
                'success'
              );
              this.selectedStatusType = '';
              this.RejoinPopup=false
    this.get_EmployeeLeaveList()
    this.autofillExpectedRejoinDate();
            
  })
}


onStatusChange(status : string) {
  this.selectedStatusType = status;

  if (status === 'Rejoined') {
    this.selectedData.REJOIN_DATE = new Date(); // Auto-fill current date
  } else {
    this.selectedData.REJOIN_DATE = null; // Clear it otherwise
  }
}



}


@NgModule({
  imports: [
    DxDataGridModule,DxNumberBoxModule,ReactiveFormsModule,DxRadioGroupModule,DxSelectBoxModule,DxButtonModule,DxValidatorModule,DxDateBoxModule,DxCheckBoxModule,FormPopupModule,DxFormModule,DxPopupModule,CommonModule,DxTextBoxModule
  ],
  providers: [],
  exports: [],
  declarations: [EmployeeLeaveComponent],
})
export class EmployeeLeaveModule{}

function updateExpectedRejoinDate(daysTaken: any, number: any) {
  throw new Error('Function not implemented.');
}
function onStatusChange(status: string, string: any) {
  throw new Error('Function not implemented.');
}

