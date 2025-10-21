// import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NgZone,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  DxDataGridModule,
  DxButtonModule,
  DxDropDownButtonModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxLookupModule,
  DxDataGridComponent,
  DxPopupModule,
} from 'devextreme-angular';
import { DataService } from 'src/app/services';
import { PrepaymentPostingAddComponent, PrepaymentPostingAddModule } from '../prepayment-posting-add/prepayment-posting-add.component';
import { PrepaymentPostingEditModule } from '../prepayment-posting-edit/prepayment-posting-edit.component';
import notify from 'devextreme/ui/notify';
@Component({
  selector: 'app-prepayment-posting-list',
  templateUrl: './prepayment-posting-list.component.html',
  styleUrls: ['./prepayment-posting-list.component.scss']
})
export class PrepaymentPostingListComponent {
   @ViewChild(PrepaymentPostingAddComponent) PrepaymentPostingAddComponent: PrepaymentPostingAddComponent;
     @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
selectedRows: any[] = [];

  // Paging


  allowedPageSizes: number[] = [5, 10, 20];
  displayMode: any;
  showPageSizeSelector: boolean = true;
  isEditPopupPrepaymentPosting:boolean=false
  // Calendar/month selector
  selectedMonth: Date  = new Date();
  selectedYear: number = new Date().getFullYear();
  calendarVisible: boolean = false;
  yearSelectorVisible: boolean = false;
  isAddPopupPrepaymentPosting:boolean=false
  selectedMonthForAdd: string;
  prepaymentList:any
  // editPackPopupOpened:boolean
  years: number[] = [];
  months = Array.from({ length: 12 }, (_, i) => new Date(2022, i, 1)); // Example for 2022
  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
      addButtonOptions = {
    text: 'New',
    icon: 'bi bi-file-earmark-plus',
    type: 'default',
    stylingMode: 'contained',
    hint: 'Add new entry',
    onClick: () => {
      // Run inside Angular's zone
      this.ngZone.run(() => this.openPopup());
    },
    elementAttr: { class: 'add-button' }
  };
    refreshButtonOptions = {
    icon: 'refresh',
    hint: 'Refresh',
    onClick: () => this.refreshGrid(),
    text: '',
  };
  selecte_prepayment_Data: any;
isEditReadOnly:boolean=false
  constructor (private ngZone:NgZone,private dataservice:DataService, private cdr:ChangeDetectorRef){
this.get_prepayment_posting_list()


  }
  get_prepayment_posting_list() {
  this.dataservice.Prepayment_posting_list().subscribe((res: any) => {
    console.log(res);

    this.prepaymentList = res.Data
      // filter by selectedMonth
      .filter((item: any) =>
        this.isSameMonthYear(item.TRANS_DATE, this.selectedMonth)
      )
      // add serial number
      .map((item: any, index: number) => ({
        ...item,
        SNO: index + 1,
      }));
      if(this.prepaymentList.TRANS_STATUS=='Approved'){

  this.isEditReadOnly=true
}
  });
}




  // get_prepayment_posting_list(){
  //   this.dataservice.Prepayment_posting_list().subscribe((res:any)=>{
  //     console.log(res)
  //     // this.prepaymentList=res.Data
  //         // Add serial number
  //   this.prepaymentList = res.Data.map((item: any, index: number) => ({
  //     ...item,
  //     SNO: index + 1   // serial number starts from 1
  //   }));

  //   })
  // }

 getStatusFlagClass(Status: string): string {
    // console.log('Status:', Status);
  
 return Status =='Open' ? 'flag-oranged' : 'flag-green';
}


onEditPrePayment(e:any){
e.cancel=true
this.isEditPopupPrepaymentPosting=true
this.selected_Data(e)

}

selected_Data(e:any){

  const id=e.data.TRANS_ID

  this.dataservice.select_Prepayment_Posting(id).subscribe((Res:any)=>{
    console.log(Res)
   this.selecte_prepayment_Data= Res.Data

  })

}
  openPopup(){
this.isAddPopupPrepaymentPosting=true
this.PrepaymentPostingAddComponent.get_prepayment_pending_list()

  }
  handleClose(){
this.isAddPopupPrepaymentPosting=false
this.get_prepayment_posting_list()
this.isEditPopupPrepaymentPosting=false

  }
  onDeletePrepayment(event:any){
    const id=event.data.TRANS_ID
    this.dataservice.Delete_Prepayment_Posting(id).subscribe((res:any)=>{
      console.log(res)
         notify(
                      {
                        message: 'Prepayment Deleted successfully',
                        position: { at: 'top right', my: 'top right' },
                        displayTime: 500,
                      },
                      'success'
                    );
    })

    this.get_prepayment_posting_list()

  }
  isSameMonthYear(transDate: string, selectedMonth: Date): boolean {
  if (!transDate) return false;

  // TRANS_DATE is dd-MM-yyyy
  const [day, month, year] = transDate.split("-").map(Number);
  const itemDate = new Date(year, month - 1, day);

  return (
    itemDate.getMonth() === selectedMonth.getMonth() &&
    itemDate.getFullYear() === selectedMonth.getFullYear()
  );
}

  goToPreviousMonth(){
   const currentDate = new Date(this.selectedMonth); // Ensure it's a Date object
    currentDate.setMonth(currentDate.getMonth() - 1);
    this.selectedMonth = currentDate;
    // this.getTimesheet();

    console.log( this.selectedMonth,'=========== this.selectedMonth====================')
    console.log(this.formatToQuarterEnd(this.selectedMonth));  
    this.get_prepayment_posting_list()
  }
formatToQuarterEnd(dateInput: Date | string): string {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return ''; // invalid date check

  // Keep the original date as it is
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
  const yyyy = date.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
}


  toggleCalendar(){

  }
    selectMonthByIndex(monthIndex: number) {
    this.selectedMonth = new Date(this.selectedYear, monthIndex, 1, 12); // Set the date to the 1st of the selected month
    this.onMonthChange({ value: this.selectedMonth }); // Pass the selected month to onMonthChange

      this.calendarVisible=false;

    // Hide calendar after selection (optional)
  }
    onMonthChange(event: any): void {
    const selectedDate = new Date(event.value);

    if (isNaN(selectedDate.getTime())) return;

    // Ensure the date is normalized to the first of the month at noon
    this.selectedMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1,
      12
    );

    this.selectedMonthForAdd = this.selectedMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    // this.getTimesheet();
  }
  
  selectYear(year: number, event: MouseEvent) {
    event.stopPropagation(); // Prevent calendar from closing
    this.selectedYear = year;
    this.yearSelectorVisible = false;
  }
    nextYear() {
    this.selectedYear++;
  }
      onSelectionChanged(e: any) {
  this.selectedRows = e.selectedRowKeys;
  console.log('User selected:', this.selectedRows);
}

    toggleYearSelector() {
    this.yearSelectorVisible = !this.yearSelectorVisible;
  }
    previousYear() {
    this.selectedYear--;
  }
   goToNextMonth() {
    const currentDate = new Date(this.selectedMonth); // Ensure it's a Date object
    currentDate.setMonth(currentDate.getMonth() + 1);
    this.selectedMonth = currentDate;

        console.log( this.selectedMonth,'=========== this.selectedMonth====================')
    console.log(this.formatToQuarterEnd(this.selectedMonth));  
    this.get_prepayment_posting_list()
    // this.getTimesheet();
  //    const payload ={
  //      CompanyId: this.CompanyID,
  //      Month: this.selectedMonth.toLocaleDateString('en-US', {
  //   month: 'long',
  //   year: 'numeric',
  // }).replace(/\s/g, ''), // removes the space → "July2025"
  //   }
  //   this.dataService.Timesheet_List_Api(payload).subscribe((response: any) => {
  //     console.log(response, 'Timesheet List Response');
  //     this.timesheetList = response.data
  //     // console.log(
  //     //   this.timesheetList,
  //     //   'Filtered Timesheet for',
  //     //   selectedMonthStr
  //     // );  
  //   });
  // this.fetchTimesheetList();
  }
      refreshGrid() {
    if (this.dataGrid?.instance) {
      this.dataGrid.instance.refresh(); // Or reload data from API if needed
   this.cdr.detectChanges(); // optional
      this.get_prepayment_posting_list()
    }
  }


}


@NgModule({
  imports: [
    CommonModule,
    DxDataGridModule,
    DxButtonModule,
    DxDataGridModule,
    DxDropDownButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxLookupModule, 
    DxPopupModule,
    PrepaymentPostingAddModule,
    PrepaymentPostingEditModule
  
  ],
  providers: [],
  declarations: [PrepaymentPostingListComponent],
  exports: [PrepaymentPostingListComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PrepaymentPostingListModule {}