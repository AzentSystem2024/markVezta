// import { Component } from '@angular/core';
import { Component, CUSTOM_ELEMENTS_SCHEMA, NgModule, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { DxSelectBoxModule, DxTextAreaModule, DxDateBoxModule, DxFormModule, DxTextBoxModule, DxCheckBoxModule, DxRadioGroupModule, DxFileUploaderModule, DxDataGridModule, DxButtonModule, DxValidatorModule, DxProgressBarModule, DxPopupModule, DxDropDownBoxModule, DxToolbarModule, DxTabPanelModule, DxTabsModule, DxNumberBoxModule, DxDataGridComponent, DxTagBoxModule, DxValidationGroupModule } from 'devextreme-angular';
import { DxoItemModule, DxoFormItemModule, DxoLookupModule, DxiItemModule, DxiGroupModule, DxoSummaryModule } from 'devextreme-angular/ui/nested';
import { ValueChangedEvent } from 'devextreme/ui/select_box';
import { FormTextboxModule } from 'src/app/components';

@Component({
  selector: 'app-monthly-plan',
  templateUrl: './monthly-plan.component.html',
  styleUrls: ['./monthly-plan.component.scss']
})
export class MonthlyPlanComponent {
includeUnplannedPacking: boolean;
onDateRangeChange($event: ValueChangedEvent) {
throw new Error('Method not implemented.');
}
  readonly allowedPageSizes: any = [5, 10, 'all'];
MonthlyPlanDataSource:any
  displayMode: any = 'full';
  showPageSizeSelector = true;
  showHeaderFilter: true;
  showFilterRow = true;
  isFilterOpened = false;
  filterRowVisible: boolean = false;
  isFilterRowVisible: boolean = false;
  totalPairQty: number = 0;
  auto: string = 'auto';
  isAddPopup: boolean = false;
  isEditPopup: boolean = false;
  isPackagesPopup: boolean = false;
  selectedRange:any
PackingList:any
customStartDate: any = null;
customEndDate: any = null;
PackingDataQty:any
showCustomDatePopup = false;
filteredMonthlyPlanList:any
selectedDateRange:any
 canAdd = false;
  canEdit = false;
  canView = false;
  canDelete = false;
  canApprove = false;
  canPrint = false;
MonthlyPlanList:any
  dateRanges = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: 'last7' },
  { label: 'Last 15 Days', value: 'last15' },
  { label: 'Last 30 Days', value: 'last30' },
  { label: 'Custom', value: 'custom' }
];


MonthlyPlanData={
  Doc_no: 0,
  Month: '',
  Remarks: '',
  Status: '',
  data_1:'',
  data_2:'',
  data_3:'',
  data_4:'',
  total_planned:'',
  unplanned:false,
}
private formatAsDDMMYYYY(d: Date): string {
  const day   = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year  = d.getFullYear();
  return `${day}-${month}-${year}`;
}
  openPopup(){
      console.log('openPopup called');
    this.isAddPopup = true;
  }
  displayExpr = (item: any) => {
  if (!item) return '';

  if (
    item.value === 'custom' &&
    this.customStartDate &&
    this.customEndDate
  ) {
    const from = this.formatAsDDMMYYYY(new Date(this.customStartDate));
    const to = this.formatAsDDMMYYYY(new Date(this.customEndDate));
    return `${from} to ${to}`;
  }

  return item.label;
};
applyCustomDateFilter() {
  if (!(this.customStartDate && this.customEndDate)) return;

  const start = new Date(this.customStartDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(this.customEndDate);
  end.setHours(23, 59, 59, 999);

  this.filteredMonthlyPlanList = this.MonthlyPlanList.filter((item: any) => {
    const journalDate = new Date(item.TRANS_DATE);
    return journalDate >= start && journalDate <= end;
  });

  const fromLabel = this.formatAsDDMMYYYY(start);
  const toLabel = this.formatAsDDMMYYYY(end);

  this.dateRanges = this.dateRanges.map(option =>
    option.value === 'custom' ? { ...option, label: `${fromLabel} to ${toLabel}` } : option
  );

  this.showCustomDatePopup = false;
}


onDateRangeChanged(e: any) {
  // this.selectedDateRange = e.value;

  if (e.value === 'custom') {
    this.customStartDate = null;
    this.customEndDate = null;
    this.showCustomDatePopup = true;
  } else {
    // Reset the custom label
    const customOpt = this.dateRanges.find(dr => dr.value === 'custom');
    if (customOpt) {
      customOpt.label = 'Custom';
    }
    this.applyDateFilter();
  }
}


applyDateFilter() {
  // if (!this.selectedDateRange || !this.MonthlyPlanList) {
  //   this.filteredMonthlyPlanList = this.MonthlyPlanList;
  //   return;
  // }

  const today = new Date();
  let startDate: Date;
  const endDate = new Date(); // today

  // switch () 
  // {
  //   case 'today':
  //     startDate = new Date();
  //     startDate.setHours(0, 0, 0, 0);
  //     break;
  //   case 'last7':
  //     startDate = new Date();
  //     startDate.setDate(today.getDate() - 6);
  //     startDate.setHours(0, 0, 0, 0);
  //     break;
  //   case 'last15':
  //     startDate = new Date();
  //     startDate.setDate(today.getDate() - 14);
  //     startDate.setHours(0, 0, 0, 0);
  //     break;
  //   case 'last30':
  //     startDate = new Date();
  //     startDate.setDate(today.getDate() - 29);
  //     startDate.setHours(0, 0, 0, 0);
  //     break;
  //   default:
  //     this.filteredMonthlyPlanList = this.MonthlyPlanList;
  //     return;
  // }

  this.filteredMonthlyPlanList = this.MonthlyPlanList.filter((item: any) => {
    const journalDate = new Date(item.TRANS_DATE);
    return journalDate >= startDate && journalDate <= endDate;
  });
}
  
attachItemClickHandler(e: any) {
  setTimeout(() => {
    const popup = e.component._popup;  
    const innerList = popup && popup.$content().find('.dx-list').dxList('instance');
    if (innerList) {
      innerList.off('itemClick');            // unsubscribe first (to avoid duplicates)
      innerList.on('itemClick', (clickEvent: any) => {
        const clickedValue = clickEvent.itemData.value;
        if (clickedValue === 'custom') {
          this.openCustomDatePopup();
          e.component.close();
        }
      });
    }
  }, 0);
}

openCustomDatePopup() {
  this.customStartDate = null;
  this.customEndDate   = null;
  this.showCustomDatePopup = true;
}
  onEditingStart(event:any){
    event.cancel = true;
    this.isEditPopup = true;

  }
handleClose(){

}
UpdateData(){

}
AddData(){

}
delete_Monthly_Data(event:any){

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
      DxNumberBoxModule,
      DxoSummaryModule,
      ReactiveFormsModule,
      DxTagBoxModule,
      DxValidationGroupModule,

  ],
  providers: [],
  declarations: [MonthlyPlanComponent],
  exports: [MonthlyPlanComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MonthlyPlanModule {}
